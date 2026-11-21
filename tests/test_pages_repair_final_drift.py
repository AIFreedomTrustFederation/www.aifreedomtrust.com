"""Offline regressions for final Pages source drift after a verified write.

The GitHub CLI is mocked. No live publishing settings are changed.
"""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

from test_pages_repair_final_status import GH_STUB, SCRIPT


class PagesFinalDriftTests(unittest.TestCase):
    def check_final_drift(self, final_branch, final_path):
        old = "printf 'synthetic final GET failure\\n' >&2\n        exit 22"
        self.assertEqual(GH_STUB.count(old), 1, "Shared fixture changed")
        payload = json.dumps(
            {"source": {"branch": final_branch, "path": final_path}, "cname": None},
            separators=(",", ":"),
        )
        replacement = f"printf '%s\\n' '{payload}'\n        exit 0"
        stub = GH_STUB.replace(old, replacement)

        with tempfile.TemporaryDirectory() as tmp:
            home = Path(tmp)
            bindir = home / "bin"
            bindir.mkdir()
            for name, body in (
                ("gh", stub),
                ("curl", "#!/bin/sh\nprintf 200\n"),
                ("sleep", "#!/bin/sh\nexit 0\n"),
            ):
                path = bindir / name
                path.write_text(body)
                path.chmod(0o755)
            calls_file = home / "calls.txt"
            env = dict(
                os.environ,
                HOME=str(home),
                GH_CALLS=str(calls_file),
                GH_GET_COUNT=str(home / "get-count"),
                PATH=str(bindir) + os.pathsep + os.environ["PATH"],
            )
            result = subprocess.run(
                ["bash", str(SCRIPT), "--apply"],
                env=env, capture_output=True, text=True, timeout=25,
            )
            calls = calls_file.read_text().splitlines()
            writes = [call for call in calls if " -X " in f" {call} "]
            report = (home / "aift-pages-repair-report.txt").read_text()
            self.assertNotEqual(result.returncode, 0, result.stderr)
            self.assertEqual(len(writes), 1, writes)
            self.assertIn(" -X PUT ", f" {writes[0]} ")
            self.assertFalse(any("www.aifreedomtrust.com/pages" in c for c in calls))
            self.assertIn("Pages source verified: main /", report)
            self.assertIn("Final Pages source drift", report)
            self.assertNotIn("enabled: yes", report)

    def test_final_branch_drift_blocks_next_repository(self):
        self.check_final_drift("unexpected-branch", "/")

    def test_final_path_drift_blocks_next_repository(self):
        self.check_final_drift("main", "/docs")


if __name__ == "__main__":
    unittest.main()
