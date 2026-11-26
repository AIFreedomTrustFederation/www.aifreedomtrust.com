"""Black-box regression: a valid JSONL object without its terminator is untrusted.

The Pages writer appends a newline and fsyncs each complete record. If a
process dies after JSON bytes but before the terminator, the reconciler must
not mistake the partial append for a durable, verified recovery record.
No live GitHub publishing configuration is accessed.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "aift-pages-reconcile.py"
RUN_ID = "aift-pages-before.ABCDEFGH.jsonl"


class PagesUnterminatedRecoveryTests(unittest.TestCase):
    def invoke(self, missing_terminator):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            binpath = root / "bin"
            binpath.mkdir()
            gh = binpath / "gh"
            gh.write_text("""#!/bin/sh
printf '%s\\n' "$*" >> "$GH_CALLS"
exit 77
""")
            gh.chmod(0o755)
            snapshot = {
                "schema_version": 1, "run_id": RUN_ID,
                "repository": "www.aifreedomtrust.com",
                "intended_source": {"branch": "gh-pages", "path": "/"},
                "existed": True,
                "previous": {"source": {"branch": "main", "path": "/"},
                             "cname": None, "cname_observed": True},
            }
            attempt = {
                "schema_version": 1, "run_id": RUN_ID,
                "repository": "www.aifreedomtrust.com",
                "operation": "update_pages_source", "phase": "attempted",
                "intended_source": {"branch": "gh-pages", "path": "/"},
            }
            before = root / "before.jsonl"
            journal = root / "writes.jsonl"
            before.write_text(json.dumps(snapshot) +
                              ("" if missing_terminator == "snapshot" else "\n"))
            journal.write_text(json.dumps(attempt) +
                               ("" if missing_terminator == "journal" else "\n"))
            # JSON itself is valid; the absent final newline is the defect.
            self.assertIsInstance(json.loads(before.read_text()), dict)
            self.assertIsInstance(json.loads(journal.read_text()), dict)
            calls = root / "calls.txt"
            env = dict(os.environ, GH_CALLS=str(calls),
                       PATH=str(binpath) + os.pathsep + os.environ["PATH"])
            result = subprocess.run(
                [sys.executable, str(SCRIPT), "--snapshot", str(before),
                 "--journal", str(journal)],
                env=env, capture_output=True, text=True, timeout=15,
            )
            self.assertEqual(result.returncode, 1, result.stderr + result.stdout)
            output = json.loads(result.stdout)
            self.assertEqual(output["status"], "invalid_evidence")
            self.assertIn("unterminated recovery record", output["error"])
            self.assertFalse(calls.exists(), "Invalid evidence must not trigger live API lookups")

    def test_valid_json_without_snapshot_terminator_is_rejected(self):
        self.invoke("snapshot")

    def test_valid_json_without_journal_terminator_is_rejected(self):
        self.invoke("journal")


if __name__ == "__main__":
    unittest.main()
