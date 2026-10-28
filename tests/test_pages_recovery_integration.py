"""End-to-end offline contract tests for Pages repair evidence and reconciliation.

All GitHub CLI calls use the existing synthetic fixture; no network or live
publishing settings are accessed. These tests do not exercise real crashes.
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


class PagesRecoveryIntegrationTests(unittest.TestCase):
    def test_interrupted_write_evidence_requires_manual_reconciliation(self):
        # One failure after a successful prior repository, and one ambiguous
        # verification after a successful API write. Neither proves rollback.
        cases = (
            ("fail_second", "www.aifreedomtrust.com", 1, "observed_matches_intent"),
            ("duplicate_postwrite", "aifreedomtrustfederation.github.io", 0, "unknown"),
        )
        for mode, pending_repo, verified_count, observation in cases:
            with self.subTest(mode=mode), tempfile.TemporaryDirectory() as tmp:
                home = Path(tmp)
                binpath = home / "bin"
                binpath.mkdir()
                for name, stub_content in (
                    ("gh", GH),
                    ("curl", "#!/bin/sh\nprintf 200\n"),
                    ("sleep", "#!/bin/sh\nexit 0\n"),
                ):
                    stub = binpath / name
                    stub.write_text(stub_content)
                    stub.chmod(0o755)
                calls_path = home / "gh-calls.txt"
                env = dict(os.environ, HOME=str(home), GH_CALLS=str(calls_path),
                           GH_MODE=mode, PATH=str(binpath) + os.pathsep + os.environ["PATH"])
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
                self.assertEqual({x["run_id"] for x in prior + events}, {snapshots[0].name})
                self.assertEqual(len([e for e in events if e["phase"] == "verified"]), verified_count)
                mutations_before = [x for x in calls_path.read_text().splitlines()
                                    if " -X " in f" {x} "]
                self.assertTrue(mutations_before)

                reconciliation = subprocess.run(
                    [sys.executable, str(RECONCILE), "--snapshot", str(snapshots[0]),
                     "--journal", str(journals[0])],
                    env=env, capture_output=True, text=True, timeout=30,
                )
                self.assertEqual(reconciliation.returncode, 2, reconciliation.stderr)
                result = json.loads(reconciliation.stdout)
                self.assertEqual(result["status"], "manual_reconciliation_required")
                self.assertEqual(result["run_id_binding"], "bound")
                self.assertEqual(result["verified_events"], verified_count)
                self.assertEqual(len(result["unmatched_attempts"]), 1)
                unresolved = result["unmatched_attempts"][0]
                self.assertEqual(unresolved["repository"], pending_repo)
                self.assertEqual(unresolved["operation"], "update_pages_source")
                self.assertEqual(unresolved["current_observation"], observation)
                self.assertIn("cannot prove", result["warning"])
                mutations_after = [x for x in calls_path.read_text().splitlines()
                                   if " -X " in f" {x} "]
                self.assertEqual(mutations_after, mutations_before,
                                 "Read-only reconciliation must never mutate Pages")


if __name__ == "__main__":
    unittest.main()
