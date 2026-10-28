"""Black-box regressions for verified custom-domain removal.

Run the actual Pages repair script with synthetic GitHub API responses; never
contact GitHub or mutate real Pages settings.
"""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "aift-pages-repair.sh"

GH_STUB = r'''#!/bin/sh
printf '%s\n' "$*" >> "$GH_CALLS"
if [ "$1" = auth ] && [ "$2" = status ]; then exit 0; fi
if [ "$1" = repo ] && [ "$2" = view ]; then
  [ "$3" = 'AIFreedomTrustFederation/aifreedomtrustfederation.github.io' ]
  exit $?
fi
if [ "$1" = api ]; then
  case " $* " in
    *"/branches/"*) exit 0 ;;
    *" --include "*) printf 'HTTP/2.0 200 OK\n\n'; exit 0 ;;
    *" -X PUT "*) exit 0 ;;
    *" -X DELETE "*) touch "$GH_DELETED"; exit 0 ;;
    *"aifreedomtrustfederation.github.io/pages "*)
      if [ -f "$GH_DELETED" ]; then
        case "$POSTDELETE_MODE" in
          stale) printf '{"source":{"branch":"main","path":"/"},"cname":"still.example"}\n' ;;
          missing) printf '{"source":{"branch":"main","path":"/"}}\n' ;;
          malformed) printf '{not json}\n' ;;
          error) printf 'synthetic API failure\n' >&2; exit 22 ;;
          cleared) printf '{"source":{"branch":"main","path":"/"},"cname":null}\n' ;;
          *) exit 91 ;;
        esac
      else
        printf '{"source":{"branch":"main","path":"/"},"cname":"before.example"}\n'
      fi
      exit 0 ;;
  esac
fi
exit 3
'''

class DomainPostdeleteVerificationTests(unittest.TestCase):
    def invoke(self, mode):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bindir = root / "bin"
            bindir.mkdir()
            for name, source in (
                ("gh", GH_STUB),
                ("curl", "#!/bin/sh\nprintf 200\n"),
                ("sleep", "#!/bin/sh\nexit 0\n"),
            ):
                path = bindir / name
                path.write_text(source)
                path.chmod(0o755)
            calls_file = root / "calls.txt"
            env = dict(os.environ, HOME=str(root), GH_CALLS=str(calls_file),
                       GH_DELETED=str(root / "deleted"), POSTDELETE_MODE=mode,
                       PATH=str(bindir) + os.pathsep + os.environ["PATH"])
            result = subprocess.run(
                ["bash", str(SCRIPT), "--apply", "--remove-custom-domains"],
                env=env, capture_output=True, text=True, timeout=20,
            )
            calls = calls_file.read_text().splitlines() if calls_file.exists() else []
            report = (root / "aift-pages-repair-report.txt").read_text()
            return result, calls, report

    def test_confirmed_absent_domain_allows_completion(self):
        result, calls, report = self.invoke("cleared")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("custom domain removal verified", report)
        self.assertTrue(any("-X DELETE" in call for call in calls))

    def test_stale_domain_blocks_subsequent_repositories(self):
        result, calls, report = self.invoke("stale")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("post-delete verification", report)
        self.assertFalse(any("www.aifreedomtrust.com" in call for call in calls))

    def test_missing_cname_field_fails_closed(self):
        result, calls, report = self.invoke("missing")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("post-delete verification", report)

    def test_malformed_response_fails_closed(self):
        result, calls, report = self.invoke("malformed")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("post-delete verification", report)

    def test_api_failure_fails_closed(self):
        result, calls, report = self.invoke("error")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("post-delete verification", report)

if __name__ == "__main__":
    unittest.main()
