"""Black-box regressions for verified custom-domain removal.

Run the actual Pages repair script with synthetic GitHub API responses; never
contact GitHub or mutate real Pages settings.
"""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "aift-pages-repair.sh"

GH_STUB = r'''#!/bin/sh
printf '%s\n' "$*" >> "$GH_CALLS"
if [ "$1" = auth ] && [ "$2" = status ]; then exit 0; fi
if [ "$1" = repo ] && [ "$2" = view ]; then exit 0; fi
if [ "$1" = api ]; then
  case " $* " in
    *"/branches/"*) exit 0 ;;
    *" --include "*) printf 'HTTP/2.0 200 OK\n\n'; exit 0 ;;
    *" -X PUT "*) exit 0 ;;
    *" -X DELETE "*)
      if [ "$PREDELETE_MODE" = absent ]; then
        printf 'synthetic 404: no custom domain\n' >&2
        exit 22
      fi
      touch "$GH_DELETED"; exit 0 ;;
    *"aifreedomtrustfederation.github.io/pages "*)
      if [ -f "$GH_DELETED" ]; then
        case "$POSTDELETE_MODE" in
          drift) printf '{"source":{"branch":"unexpected","path":"/"},"cname":null}\n' ;;
          stale) printf '{"source":{"branch":"main","path":"/"},"cname":"still.example"}\n' ;;
          missing) printf '{"source":{"branch":"main","path":"/"}}\n' ;;
          malformed) printf '{not json}\n' ;;
          error) printf 'synthetic API failure\n' >&2; exit 22 ;;
          cleared) printf '{"source":{"branch":"main","path":"/"},"cname":null}\n' ;;
          *) exit 91 ;;
        esac
      else
        case "$PREDELETE_MODE" in
          absent) printf '{"source":{"branch":"main","path":"/"},"cname":null}\n' ;;
          missing) printf '{"source":{"branch":"main","path":"/"}}\n' ;;
          *) printf '{"source":{"branch":"main","path":"/"},"cname":"before.example"}\n' ;;
        esac
      fi
      exit 0 ;;
    *"/pages "*) 
      case "$2" in
        */aifreedomtrustfederation.github.io/pages|*/AI-Freedom-Trust/pages) branch=main ;;
        *) branch=gh-pages ;;
      esac
      printf '{"source":{"branch":"%s","path":"/"},"cname":null}\n' "$branch"
      exit 0 ;;
  esac
fi
exit 3
'''

class DomainPostdeleteVerificationTests(unittest.TestCase):
    def invoke(self, mode, *, predelete_mode="present"):
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
                       PREDELETE_MODE=predelete_mode,
                       PATH=str(bindir) + os.pathsep + os.environ["PATH"])
            result = subprocess.run(
                ["bash", str(SCRIPT), "--apply", "--remove-custom-domains"],
                env=env, capture_output=True, text=True, timeout=20,
            )
            calls = calls_file.read_text().splitlines() if calls_file.exists() else []
            report = (root / "aift-pages-repair-report.txt").read_text()
            journals = list(root.glob("aift-pages-writes.*.jsonl"))
            events = [json.loads(line) for journal in journals
                      for line in journal.read_text().splitlines()]
            return result, calls, report, events

    def test_confirmed_absent_domain_allows_completion(self):
        result, calls, report, events = self.invoke("cleared")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("custom domain removal verified", report)
        self.assertTrue(any("-X DELETE" in call for call in calls))

    def test_absent_domain_is_not_deleted_or_journaled(self):
        # A DELETE for an already absent domain returns synthetic 404.
        # Avoid unnecessary destructive calls and partial federation updates.
        result, calls, report, events = self.invoke("cleared", predelete_mode="absent")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse(any("-X DELETE" in call for call in calls))
        self.assertIn("custom domain already absent", report)
        self.assertFalse(any(event["operation"] == "remove_custom_domain" for event in events))

    def test_missing_predelete_cname_blocks_domain_mutation(self):
        result, calls, report, events = self.invoke("cleared", predelete_mode="missing")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(any("-X DELETE" in call for call in calls))
        self.assertFalse(any("www.aifreedomtrust.com/pages" in call for call in calls))
        self.assertFalse(any(event["operation"] == "remove_custom_domain" for event in events))
        self.assertIn("Cannot establish current custom domain", report)

    def test_stale_domain_blocks_subsequent_repositories(self):
        result, calls, report, events = self.invoke("stale")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("post-delete verification", report)
        self.assertFalse(any("www.aifreedomtrust.com/pages" in call for call in calls))

    def test_postdelete_source_drift_is_not_journaled_as_verified(self):
        # A cleared domain is not sufficient if the publishing source drifted.
        result, calls, report, events = self.invoke("drift")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("custom domain post-delete verification mismatch", report)
        self.assertFalse(any("www.aifreedomtrust.com/pages" in c for c in calls))
        domain_events = [event for event in events
                         if event["operation"] == "remove_custom_domain"]
        self.assertEqual([event["phase"] for event in domain_events], ["attempted"])

    def test_missing_cname_field_fails_closed(self):
        result, calls, report, events = self.invoke("missing")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("post-delete verification", report)

    def test_malformed_response_fails_closed(self):
        result, calls, report, events = self.invoke("malformed")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("post-delete verification", report)

    def test_api_failure_fails_closed(self):
        result, calls, report, events = self.invoke("error")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("post-delete verification", report)

if __name__ == "__main__":
    unittest.main()
