"""Offline crash-during-journal-append regression for Pages recovery.

The mock dd writes a torn verification record and kills the repair shell.
All GitHub requests use a local stub; no live publishing state is touched.
"""
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest

from test_pages_repair_write_outcomes import GH, SCRIPT as REPAIR

RECONCILE = Path(__file__).resolve().parents[1] / "scripts" / "aift-pages-reconcile.py"

# The first two dd calls persist the snapshot and attempted-write event.
# The third, which should persist verification, writes only a fragment.
INTERRUPTING_DD = """#!/bin/sh
count=0
[ ! -f "$HOME/dd-count" ] || count=$(cat "$HOME/dd-count")
count=$((count + 1))
printf '%s\\n' "$count" > "$HOME/dd-count"
target=
for argument in "$@"; do
  case "$argument" in of=*) target=${argument#of=} ;; esac
done
if [ "$count" -eq 3 ]; then
  case "$target" in
    *aift-pages-writes.*.jsonl) ;;
    *) exit 81 ;;
  esac
  printf '{"schema_version":1,"phase":' >> "$target"
  kill -KILL "$PPID"
  exit 82
fi
exec "$REAL_DD" "$@"
"""


class PagesTornAppendRecoveryTests(unittest.TestCase):
    def test_sigkill_during_verification_append_fails_closed(self):
        real_dd = shutil.which("dd")
        self.assertIsNotNone(real_dd, "GNU dd is required for recovery tests")
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            binpath = home / "bin"
            binpath.mkdir()
            for name, body in (
                ("gh", GH),
                ("dd", INTERRUPTING_DD),
                ("curl", "#!/bin/sh\nprintf 200\n"),
                ("sleep", "#!/bin/sh\nexit 0\n"),
            ):
                stub = binpath / name
                stub.write_text(body)
                stub.chmod(0o755)
            calls_path = home / "gh-calls.txt"
            env = dict(os.environ, HOME=str(home), GH_CALLS=str(calls_path),
                       GH_MODE="normal", REAL_DD=real_dd,
                       PATH=str(binpath) + os.pathsep + os.environ["PATH"])
            repair = subprocess.run(
                ["bash", str(REPAIR), "--apply"], env=env,
                capture_output=True, text=True, timeout=30,
            )
            self.assertNotEqual(repair.returncode, 0, repair.stdout)
            self.assertEqual((home / "dd-count").read_text().strip(), "3")

            snapshots = list(home.glob("aift-pages-before.*.jsonl"))
            journals = list(home.glob("aift-pages-writes.*.jsonl"))
            self.assertEqual((len(snapshots), len(journals)), (1, 1))
            self.assertEqual(stat.S_IMODE(journals[0].stat().st_mode), 0o600)
            snapshot = json.loads(snapshots[0].read_text().strip())
            lines = journals[0].read_text().splitlines()
            self.assertEqual(len(lines), 2)
            attempt = json.loads(lines[0])
            self.assertEqual((attempt["operation"], attempt["phase"]),
                             ("update_pages_source", "attempted"))
            self.assertEqual(attempt["run_id"], snapshot["run_id"])
            self.assertTrue(lines[1].startswith('{"schema_version":1,"phase":'))
            with self.assertRaises(json.JSONDecodeError):
                json.loads(lines[1])

            calls_before = calls_path.read_text().splitlines()
            mutations_before = [c for c in calls_before if " -X " in f" {c} "]
            self.assertEqual(len(mutations_before), 1)
            self.assertIn(" -X PUT ", f" {mutations_before[0]} ")
            self.assertFalse(any("www.aifreedomtrust.com/pages" in c
                                 for c in calls_before))

            reconciliation = subprocess.run(
                [sys.executable, str(RECONCILE), "--snapshot", str(snapshots[0]),
                 "--journal", str(journals[0])],
                env=env, capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(reconciliation.returncode, 1, reconciliation.stderr)
            outcome = json.loads(reconciliation.stdout)
            self.assertEqual(outcome["status"], "invalid_evidence")
            self.assertIn("unterminated recovery record", outcome["error"])
            self.assertEqual(calls_path.read_text().splitlines(), calls_before,
                             "Invalid evidence must fail before live API lookups")


if __name__ == "__main__":
    unittest.main()
