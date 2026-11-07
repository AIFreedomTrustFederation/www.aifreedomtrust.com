"""Black-box regression for targets lost after the successful Pages preflight.

All GitHub CLI responses are synthetic; no real publishing settings change.
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
  if [ "$FAIL_MODE" = repo ] && [ "$3" = AIFreedomTrustFederation/aifreedomtrustfederation.github.io ]; then
    exit 22
  fi
  exit 0
fi
if [ "$1" = api ]; then
  case " $* " in
    *"/branches/"*)
      if [ "$FAIL_MODE" = branch ] && [ "$2" = repos/AIFreedomTrustFederation/aifreedomtrustfederation.github.io/branches/main ]; then
        count=$(cat "$FIRST_BRANCH_COUNT" 2>/dev/null || echo 0)
        count=$((count + 1))
        printf '%s\n' "$count" > "$FIRST_BRANCH_COUNT"
        if [ "$count" -ge 2 ]; then exit 22; fi
      fi
      exit 0 ;;
    *" --include "*) printf 'HTTP/2.0 200 OK\n\n'; exit 0 ;;
    *" -X "*) exit 0 ;;
    *"/pages "*) printf '{"source":{"branch":"main","path":"/"},"cname":null}\n'; exit 0 ;;
  esac
fi
exit 3
'''


class PagesPostPreflightRaceTests(unittest.TestCase):
    def invoke(self, fail_mode):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bindir = root / "bin"
            bindir.mkdir()
            for name, body in (
                ("gh", GH_STUB),
                ("curl", "#!/bin/sh\nprintf 200\n"),
                ("sleep", "#!/bin/sh\nexit 0\n"),
            ):
                path = bindir / name
                path.write_text(body)
                path.chmod(0o755)
            calls_file = root / "calls.txt"
            env = dict(
                os.environ,
                HOME=str(root),
                GH_CALLS=str(calls_file),
                FIRST_BRANCH_COUNT=str(root / "first-branch-count"),
                FAIL_MODE=fail_mode,
                PATH=str(bindir) + os.pathsep + os.environ["PATH"],
            )
            result = subprocess.run(
                ["bash", str(SCRIPT), "--apply"],
                env=env, capture_output=True, text=True, timeout=20,
            )
            calls = calls_file.read_text().splitlines() if calls_file.exists() else []
            report = (root / "aift-pages-repair-report.txt").read_text()
            return result, calls, report

    def assert_stopped_without_mutations(self, mode, expected):
        result, calls, report = self.invoke(mode)
        self.assertNotEqual(result.returncode, 0, result.stderr)
        self.assertIn("Preflight passed: all 10", report)
        self.assertIn(expected, report)
        self.assertFalse(any(" -X " in f" {call} " for call in calls), calls)
        self.assertFalse(any(" --include " in f" {call} " for call in calls), calls)
        self.assertFalse(any("www.aifreedomtrust.com/pages" in call for call in calls), calls)

    def test_repo_inaccessible_after_preflight_aborts(self):
        self.assert_stopped_without_mutations(
            "repo", "Repository aifreedomtrustfederation.github.io became inaccessible after preflight"
        )

    def test_branch_inaccessible_after_preflight_aborts(self):
        self.assert_stopped_without_mutations(
            "branch", "Branch aifreedomtrustfederation.github.io:main became inaccessible after preflight"
        )


if __name__ == "__main__":
    unittest.main()
