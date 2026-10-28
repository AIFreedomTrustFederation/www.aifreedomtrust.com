"""Black-box checks for read-only reconciliation of Pages write evidence."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "aift-pages-reconcile.py"
GH = '''#!/bin/sh
printf '%s\n' "$*" >> "$GH_CALLS"
[ "$GH_MODE" = error ] && exit 22
cat "$GH_STATE"
'''


class PagesReconcileTests(unittest.TestCase):
    def invoke(self, events, *, mode="ok", current=None, snapshots=None, run_id=None):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            binpath = root / "bin"
            binpath.mkdir()
            gh = binpath / "gh"
            gh.write_text(GH)
            gh.chmod(0o755)
            snapshot = root / "before.jsonl"
            journal = root / "writes.jsonl"
            default_snapshot = {
                "schema_version": 1, "repository": "www.aifreedomtrust.com",
                "intended_source": {"branch": "gh-pages", "path": "/"},
                "existed": True,
                "previous": {"source": {"branch": "main", "path": "/"}, "cname": "old.example"},
            }
            if run_id is not None:
                default_snapshot["run_id"] = run_id
            snapshot.write_text("\n".join(json.dumps(x) for x in (snapshots if snapshots is not None else [default_snapshot])) + "\n")
            journal.write_text("\n".join(json.dumps(x) if not isinstance(x, str) else x for x in events) + "\n")
            state = root / "state.json"
            state.write_text(json.dumps(current if current is not None else {
                "source": {"branch": "gh-pages", "path": "/"}, "cname": None,
            }))
            calls = root / "calls.txt"
            env = dict(os.environ, GH_CALLS=str(calls), GH_STATE=str(state), GH_MODE=mode,
                       PATH=str(binpath) + os.pathsep + os.environ["PATH"])
            result = subprocess.run([sys.executable, str(SCRIPT), "--snapshot", str(snapshot),
                                     "--journal", str(journal)], env=env, capture_output=True,
                                    text=True, timeout=15)
            return result, json.loads(result.stdout), calls.read_text().splitlines() if calls.exists() else []

    @staticmethod
    def event(operation="update_pages_source", phase="attempted"):
        return {"schema_version": 1, "repository": "www.aifreedomtrust.com",
                "operation": operation, "phase": phase,
                "intended_source": {"branch": "gh-pages", "path": "/"}}

    def test_verified_attempt_needs_no_live_lookup(self):
        result, output, calls = self.invoke([self.event(), self.event(phase="verified")])
        self.assertEqual(result.returncode, 0)
        self.assertEqual(output["verified_events"], 1)
        self.assertEqual(output["run_id_binding"], "legacy_unbound")
        self.assertEqual(output["unmatched_attempts"], [])
        self.assertEqual(calls, [])

    def test_unmatched_attempt_matching_live_state_remains_unresolved(self):
        result, output, calls = self.invoke([self.event()])
        self.assertEqual(result.returncode, 2)
        self.assertEqual(output["unmatched_attempts"][0]["current_observation"], "observed_matches_intent")
        self.assertEqual(calls, ["api repos/AIFreedomTrustFederation/www.aifreedomtrust.com/pages"])
        self.assertIn("cannot prove", output["warning"])

    def test_unmatched_domain_delete_with_domain_still_present(self):
        result, output, calls = self.invoke([self.event("remove_custom_domain")],
                                            current={"cname": "still.example"})
        self.assertEqual(result.returncode, 2)
        self.assertEqual(output["unmatched_attempts"][0]["current_observation"], "observed_differs")
        self.assertEqual(len(calls), 1)

    def test_api_error_is_unknown_not_success(self):
        result, output, calls = self.invoke([self.event()], mode="error")
        self.assertEqual(result.returncode, 2)
        self.assertEqual(output["unmatched_attempts"][0]["current_observation"], "unknown")
        self.assertEqual(len(calls), 1)

    def test_invalid_journal_fails_without_api_calls(self):
        result, output, calls = self.invoke(["{bad json"])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_mixed_run_snapshot_branch_rejected_before_live_lookup(self):
        snapshot = {"schema_version": 1, "repository": "www.aifreedomtrust.com",
                    "intended_source": {"branch": "main", "path": "/"},
                    "existed": True, "previous": {"source": {"branch": "main", "path": "/"}}}
        result, output, calls = self.invoke([self.event()], snapshots=[snapshot])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_missing_snapshot_intent_rejected_before_live_lookup(self):
        snapshot = {"schema_version": 1, "repository": "www.aifreedomtrust.com",
                    "existed": True, "previous": {"source": {"branch": "main", "path": "/"}}}
        result, output, calls = self.invoke([self.event()], snapshots=[snapshot])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_malformed_snapshot_intent_rejected_without_events(self):
        snapshot = {"schema_version": 1, "repository": "www.aifreedomtrust.com",
                    "intended_source": {"branch": "gh-pages", "path": "/docs"},
                    "existed": True, "previous": {"source": {"branch": "main", "path": "/"}}}
        result, output, calls = self.invoke([], snapshots=[snapshot])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_orphan_verified_event_fails_closed(self):
        result, output, calls = self.invoke([self.event(phase="verified")])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])


    def test_matching_execution_id_is_bound_without_claiming_authenticity(self):
        run_id = "aift-pages-before.ABCDEFGH.jsonl"
        event = self.event()
        event["run_id"] = run_id
        result, output, calls = self.invoke([event], run_id=run_id)
        self.assertEqual(result.returncode, 2)
        self.assertEqual(output["run_id"], run_id)
        self.assertEqual(output["run_id_binding"], "bound")
        self.assertIn("not authenticity proof", output["warning"])
        self.assertEqual(len(calls), 1)

    def test_different_execution_ids_fail_before_live_lookup(self):
        event = self.event()
        event["run_id"] = "aift-pages-before.DIFFERNT.jsonl"
        result, output, calls = self.invoke(
            [event], run_id="aift-pages-before.ABCDEFGH.jsonl")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_bound_snapshot_with_legacy_journal_fails_closed(self):
        result, output, calls = self.invoke(
            [self.event()], run_id="aift-pages-before.ABCDEFGH.jsonl")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_invalid_execution_identifier_rejected(self):
        event = self.event()
        event["run_id"] = "../bad"
        result, output, calls = self.invoke([event], run_id="../bad")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_mixed_snapshot_execution_ids_rejected_without_events(self):
        first = {"schema_version": 1, "repository": "www.aifreedomtrust.com",
                 "run_id": "aift-pages-before.ABCDEFGH.jsonl",
                 "intended_source": {"branch": "gh-pages", "path": "/"},
                 "existed": False, "previous": None}
        second = {**first, "repository": "booksmith-ai",
                  "run_id": "aift-pages-before.DIFFERNT.jsonl"}
        result, output, calls = self.invoke([], snapshots=[first, second])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_existing_pages_without_prior_state_rejected_before_api_lookup(self):
        snapshot = {"schema_version": 1, "repository": "www.aifreedomtrust.com",
                    "intended_source": {"branch": "gh-pages", "path": "/"},
                    "existed": True, "previous": None}
        result, output, calls = self.invoke([self.event()], snapshots=[snapshot])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_existing_pages_with_invalid_prior_source_rejected(self):
        snapshot = {"schema_version": 1, "repository": "www.aifreedomtrust.com",
                    "intended_source": {"branch": "gh-pages", "path": "/"},
                    "existed": True, "previous": {"source": {"branch": "", "path": "/"}}}
        result, output, calls = self.invoke([self.event()], snapshots=[snapshot])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_absent_pages_with_invented_prior_state_rejected(self):
        snapshot = {"schema_version": 1, "repository": "www.aifreedomtrust.com",
                    "intended_source": {"branch": "gh-pages", "path": "/"},
                    "existed": False, "previous": {"source": {"branch": "main", "path": "/"}}}
        result, output, calls = self.invoke([self.event()], snapshots=[snapshot])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_malformed_prior_domain_evidence_rejected(self):
        snapshot = {"schema_version": 1, "repository": "www.aifreedomtrust.com",
                    "intended_source": {"branch": "gh-pages", "path": "/"},
                    "existed": True, "previous": {"source": {"branch": "main", "path": "/"},
                    "cname": "old.example", "cname_observed": "yes"}}
        result, output, calls = self.invoke([self.event()], snapshots=[snapshot])
        self.assertEqual(result.returncode, 1)
        self.assertEqual(output["status"], "invalid_evidence")
        self.assertEqual(calls, [])

    def test_legacy_prior_source_without_domain_observed_flag_is_accepted(self):
        result, output, calls = self.invoke([self.event()])
        self.assertEqual(result.returncode, 2)
        self.assertEqual(output["unmatched_attempts"][0]["previous"]["source"]["branch"], "main")
        self.assertEqual(len(calls), 1)

if __name__ == "__main__":
    unittest.main()
