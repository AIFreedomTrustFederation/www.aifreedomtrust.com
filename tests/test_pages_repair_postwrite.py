"""Real-shell regressions: verify Pages source before optional domain deletion."""
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
  case " $* " in *" -X "*)
    case " $* " in *" -X PUT "*) touch "$GH_WROTE" ;; esac
    exit 0 ;; esac
  case " $* " in *" --jq "*) printf 'public\n'; exit 0 ;; esac
  case " $* " in *"/branches/"*) exit 0 ;; esac
  case " $* " in *" --include "*) printf 'HTTP/2.0 200 OK\n\n'; exit 0 ;; esac
  case " $* " in *"aifreedomtrustfederation.github.io/pages "*) 
    if [ "$POSTWRITE_STATUS" = fail ] && [ -f "$GH_WROTE" ]; then
      printf 'synthetic API error\n' >&2
      exit 22
    fi
    printf '{"source":{"branch":"%s","path":"%s"}}\n' "$POSTWRITE_BRANCH" "$POSTWRITE_PATH"
    exit 0 ;;
  esac
fi
exit 3
'''

class PagesPostwriteVerificationTests(unittest.TestCase):
    def invoke(self, *, branch="main", path="/", status="ok"):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bindir = root / "bin"
            bindir.mkdir()
            for name, source in (
                ("gh", GH_STUB),
                ("curl", "#!/bin/sh\nprintf 200\n"),
                ("sleep", "#!/bin/sh\nexit 0\n"),
            ):
                tool = bindir / name
                tool.write_text(source)
                tool.chmod(0o755)
            calls_file = root / "calls.txt"
            env = dict(os.environ, HOME=str(root), GH_CALLS=str(calls_file),
                       POSTWRITE_BRANCH=branch, POSTWRITE_PATH=path,
                       POSTWRITE_STATUS=status, GH_WROTE=str(root / "wrote"),
                       PATH=str(bindir) + os.pathsep + os.environ["PATH"])
            result = subprocess.run(
                ["bash", str(SCRIPT), "--apply", "--remove-custom-domains"],
                env=env, capture_output=True, text=True, timeout=15,
            )
            calls = calls_file.read_text().splitlines() if calls_file.exists() else []
            report = (root / "aift-pages-repair-report.txt").read_text()
            return result, calls, report

    def assert_fail_closed(self, result, calls, report):
        self.assertNotEqual(result.returncode, 0, result.stderr)
        writes = [call for call in calls if " -X " in f" {call} "]
        self.assertEqual(len(writes), 1, writes)
        self.assertIn("-X PUT", writes[0])
        self.assertNotIn("-X DELETE", "\n".join(calls))
        self.assertFalse(any("www.aifreedomtrust.com/pages" in call for call in calls), calls)
        self.assertIn("post-write verification", report)

    def test_wrong_branch_blocks_domain_deletion(self):
        self.assert_fail_closed(*self.invoke(branch="unintended"))

    def test_wrong_path_blocks_domain_deletion(self):
        self.assert_fail_closed(*self.invoke(path="/docs"))

    def test_postwrite_get_failure_blocks_domain_deletion(self):
        self.assert_fail_closed(*self.invoke(status="fail"))

if __name__ == "__main__":
    unittest.main()
