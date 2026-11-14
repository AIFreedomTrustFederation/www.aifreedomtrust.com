"""Fail closed on ambiguous final Pages status in audit and apply modes.

The mock GitHub CLI returns contradictory duplicate JSON keys only on the
final informational GET. No live publishing state or DNS is touched.
"""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

from test_pages_repair_final_status import GH_STUB, SCRIPT


class PagesFinalAmbiguityTests(unittest.TestCase):
    def check_final_ambiguity(self, apply):
        old = "printf 'synthetic final GET failure\\n' >&2\n        exit 22"
        new = (
            "printf '{\"source\":{\"branch\":\"main\",\"path\":\"/\"},"
            "\"cname\":null,\"status\":\"building\",\"status\":\"built\"}\\n'\n"
            "        exit 0"
        )
        self.assertEqual(GH_STUB.count(old), 1, "Upstream mock changed")
        stub = GH_STUB.replace(old, new)
        if not apply:
            marker = 'if [ "$count" -eq 3 ]; then'
            self.assertEqual(stub.count(marker), 1)
            stub = stub.replace(marker, 'if [ "$count" -eq 1 ]; then')

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bindir = root / "bin"
            bindir.mkdir()
            for name, body in (
                ("gh", stub),
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
                GH_GET_COUNT=str(root / "get-count"),
                PATH=str(bindir) + os.pathsep + os.environ["PATH"],
            )
            args = ["bash", str(SCRIPT)]
            if apply:
                args.append("--apply")
            result = subprocess.run(
                args, env=env, capture_output=True, text=True, timeout=25
            )
            calls = calls_file.read_text().splitlines()
            writes = [c for c in calls if " -X " in f" {c} "]
            report = (root / "aift-pages-repair-report.txt").read_text()
            self.assertNotEqual(result.returncode, 0, result.stderr)
            self.assertEqual(len(writes), 1 if apply else 0, writes)
            self.assertFalse(any("www.aifreedomtrust.com/pages" in c for c in calls))
            self.assertIn("Invalid final Pages status JSON", report)
            self.assertNotIn("enabled: yes", report)

    def test_apply_rejects_ambiguous_final_status(self):
        self.check_final_ambiguity(apply=True)

    def test_read_only_audit_rejects_ambiguous_final_status(self):
        self.check_final_ambiguity(apply=False)


if __name__ == "__main__":
    unittest.main()
