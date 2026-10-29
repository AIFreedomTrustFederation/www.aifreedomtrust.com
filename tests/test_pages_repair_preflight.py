"""Black-box regression: validate every Pages target before any approved write.

Uses synthetic GitHub CLI responses; no network or live Pages changes.
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
if [ "$1" = repo ] && [ "$2" = view ]; then exit 0; fi
if [ "$1" = api ]; then
  case " $* " in
    *"/branches/"*)
      if [ "$FAIL_KIND" = branch ] || [ "$FAIL_KIND" = repo ]; then
        case "$2" in
          *"/www.aifreedomtrust.com/branches/gh-pages") exit 22 ;;
        esac
      fi
      exit 0 ;;
    *" -X "*) exit 22 ;;
    *" --include "*) printf 'HTTP/2.0 200 OK\n\n'; exit 0 ;;
    *"/pages "*) printf '{"source":{"branch":"main","path":"/"},"cname":null}\n'; exit 0 ;;
  esac
fi
exit 3
'''


class PagesPreflightTests(unittest.TestCase):
    def invoke(self, fail_kind="none"):
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
                       FAIL_KIND=fail_kind,
                       PATH=str(bindir) + os.pathsep + os.environ["PATH"])
            result = subprocess.run(
                ["bash", str(SCRIPT), "--apply"],
                env=env, capture_output=True, text=True, timeout=20,
            )
            calls = calls_file.read_text().splitlines() if calls_file.exists() else []
            report = (root / "aift-pages-repair-report.txt").read_text()
            return result, calls, report

    def test_missing_second_repository_blocks_all_writes(self):
        result, calls, report = self.invoke("repo")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Preflight failed: missing or inaccessible repository/branch www.aifreedomtrust.com:gh-pages", report)
        self.assertFalse(any(" -X " in f" {call} " for call in calls), calls)
        self.assertFalse(any(" --include " in f" {call} " for call in calls), calls)

    def test_missing_second_branch_blocks_all_writes(self):
        result, calls, report = self.invoke("branch")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Preflight failed: missing or inaccessible repository/branch www.aifreedomtrust.com:gh-pages", report)
        self.assertFalse(any(" -X " in f" {call} " for call in calls), calls)
        self.assertFalse(any(" --include " in f" {call} " for call in calls), calls)

    def test_all_target_branches_checked_before_first_write(self):
        result, calls, report = self.invoke()
        self.assertNotEqual(result.returncode, 0)  # synthetic PUT is denied
        self.assertIn("Preflight passed: all 10", report)
        branch_calls = [i for i, call in enumerate(calls) if "/branches/" in call]
        first_write = next(i for i, call in enumerate(calls) if " -X " in f" {call} ")
        self.assertGreaterEqual(len(branch_calls), 10)
        self.assertTrue(all(i < first_write for i in branch_calls[:10]))


if __name__ == "__main__":
    unittest.main()
