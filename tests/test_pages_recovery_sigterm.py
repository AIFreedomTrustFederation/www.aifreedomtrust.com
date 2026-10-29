"""Offline process-interruption contract for Pages repair and reconciliation.

The mock GitHub CLI sends SIGTERM or SIGKILL to the repair shell after an accepted PUT.
No real GitHub API calls or production publishing mutations occur.
"""
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import unittest

from test_pages_repair_write_outcomes import GH, SCRIPT as REPAIR

RECONCILE = Path(__file__).resolve().parents[1] / "scripts" / "aift-pages-reconcile.py"


class PagesSigtermRecoveryTests(unittest.TestCase):
    def test_sigterm_after_source_write_preserves_unmatched_attempt(self):
        marker = 'touch "$HOME/pages-source-written"\n      exit 0 ;;'
        self.assertEqual(GH.count(marker), 1, "Upstream GitHub mock changed")
        interrupting_gh = GH.replace(
            marker,
            'touch "$HOME/pages-source-written"\n'
            '      if [ "$GH_MODE" = "interrupt_after_put" ]; then kill -TERM "$PPID"; fi\n'
            '      exit 0 ;;',
        )
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            binpath = home / "bin"
            binpath.mkdir()
            for name, body in (
                ("gh", interrupting_gh),
                ("curl", "#!/bin/sh\nprintf 200\n"),
                ("sleep", "#!/bin/sh\nexit 0\n"),
            ):
                stub = binpath / name
                stub.write_text(body)
                stub.chmod(0o755)
            calls_path = home / "gh-calls.txt"
            env = dict(os.environ, HOME=str(home), GH_CALLS=str(calls_path),
                       GH_MODE="interrupt_after_put",
                       PATH=str(binpath) + os.pathsep + os.environ["PATH"])
            repair = subprocess.run(["bash", str(REPAIR), "--apply"], env=env,
                                    capture_output=True, text=True, timeout=30)
            self.assertNotEqual(repair.returncode, 0, repair.stdout)
            snapshots = list(home.glob("aift-pages-before.*.jsonl"))
            journals = list(home.glob("aift-pages-writes.*.jsonl"))
            self.assertEqual((len(snapshots), len(journals)), (1, 1))
            self.assertEqual(stat.S_IMODE(snapshots[0].stat().st_mode), 0o600)
            self.assertEqual(stat.S_IMODE(journals[0].stat().st_mode), 0o600)
            prior = [json.loads(x) for x in snapshots[0].read_text().splitlines()]
            events = [json.loads(x) for x in journals[0].read_text().splitlines()]
            self.assertEqual(len(prior), 1)
            self.assertEqual(
                [(e["operation"], e["phase"]) for e in events],
                [("update_pages_source", "attempted")],
            )
            self.assertEqual({e["run_id"] for e in prior + events}, {snapshots[0].name})
            calls_before = calls_path.read_text().splitlines()
            mutations_before = [c for c in calls_before if " -X " in f" {c} "]
            self.assertEqual(len(mutations_before), 1)
            self.assertIn(" -X PUT ", f" {mutations_before[0]} ")
            self.assertFalse(any("www.aifreedomtrust.com/pages" in c for c in calls_before))

            reconciliation = subprocess.run(
                [sys.executable, str(RECONCILE), "--snapshot", str(snapshots[0]),
                 "--journal", str(journals[0])],
                env=env, capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(reconciliation.returncode, 2, reconciliation.stderr)
            result = json.loads(reconciliation.stdout)
            self.assertEqual(result["status"], "manual_reconciliation_required")
            self.assertEqual(result["verified_events"], 0)
            self.assertEqual(len(result["unmatched_attempts"]), 1)
            pending = result["unmatched_attempts"][0]
            self.assertEqual(pending["repository"], "aifreedomtrustfederation.github.io")
            self.assertEqual(pending["operation"], "update_pages_source")
            self.assertEqual(pending["current_observation"], "observed_matches_intent")
            self.assertIn("cannot prove", result["warning"])
            calls_after = calls_path.read_text().splitlines()
            self.assertEqual([c for c in calls_after if " -X " in f" {c} "],
                             mutations_before, "Reconciliation must remain read-only")

    def test_sigkill_after_source_write_preserves_unmatched_attempt(self):
        marker = 'touch "$HOME/pages-source-written"\n      exit 0 ;;'
        self.assertEqual(GH.count(marker), 1, "Upstream GitHub mock changed")
        interrupting_gh = GH.replace(
            marker,
            'touch "$HOME/pages-source-written"\n'
            '      if [ "$GH_MODE" = "interrupt_after_put_kill" ]; then kill -KILL "$PPID"; fi\n'
            '      exit 0 ;;',
        )
        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            binpath = home / "bin"
            binpath.mkdir()
            for name, body in (
                ("gh", interrupting_gh),
                ("curl", "#!/bin/sh\nprintf 200\n"),
                ("sleep", "#!/bin/sh\nexit 0\n"),
            ):
                stub = binpath / name
                stub.write_text(body)
                stub.chmod(0o755)
            calls_path = home / "gh-calls.txt"
            env = dict(os.environ, HOME=str(home), GH_CALLS=str(calls_path),
                       GH_MODE="interrupt_after_put_kill",
                       PATH=str(binpath) + os.pathsep + os.environ["PATH"])
            repair = subprocess.run(["bash", str(REPAIR), "--apply"], env=env,
                                    capture_output=True, text=True, timeout=30)
            self.assertEqual(repair.returncode, -9, repair.stderr)
            snapshots = list(home.glob("aift-pages-before.*.jsonl"))
            journals = list(home.glob("aift-pages-writes.*.jsonl"))
            self.assertEqual((len(snapshots), len(journals)), (1, 1))
            self.assertEqual(stat.S_IMODE(snapshots[0].stat().st_mode), 0o600)
            self.assertEqual(stat.S_IMODE(journals[0].stat().st_mode), 0o600)
            prior = [json.loads(x) for x in snapshots[0].read_text().splitlines()]
            events = [json.loads(x) for x in journals[0].read_text().splitlines()]
            self.assertEqual(len(prior), 1)
            self.assertEqual(
                [(e["operation"], e["phase"]) for e in events],
                [("update_pages_source", "attempted")],
            )
            self.assertEqual({e["run_id"] for e in prior + events}, {snapshots[0].name})
            calls_before = calls_path.read_text().splitlines()
            mutations_before = [c for c in calls_before if " -X " in f" {c} "]
            self.assertEqual(len(mutations_before), 1)
            self.assertIn(" -X PUT ", f" {mutations_before[0]} ")
            self.assertFalse(any("www.aifreedomtrust.com/pages" in c for c in calls_before))

            reconciliation = subprocess.run(
                [sys.executable, str(RECONCILE), "--snapshot", str(snapshots[0]),
                 "--journal", str(journals[0])],
                env=env, capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(reconciliation.returncode, 2, reconciliation.stderr)
            result = json.loads(reconciliation.stdout)
            self.assertEqual(result["status"], "manual_reconciliation_required")
            self.assertEqual(result["verified_events"], 0)
            self.assertEqual(len(result["unmatched_attempts"]), 1)
            pending = result["unmatched_attempts"][0]
            self.assertEqual(pending["repository"], "aifreedomtrustfederation.github.io")
            self.assertEqual(pending["operation"], "update_pages_source")
            self.assertEqual(pending["current_observation"], "observed_matches_intent")
            self.assertIn("cannot prove", result["warning"])
            calls_after = calls_path.read_text().splitlines()
            self.assertEqual([c for c in calls_after if " -X " in f" {c} "],
                             mutations_before, "Reconciliation must remain read-only")


if __name__ == "__main__":
    unittest.main()
