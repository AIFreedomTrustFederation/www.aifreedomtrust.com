"""Execute the portal CI final gate against isolated Git revision changes."""

import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github/workflows/validate.yml"


class PortalCICommitBindingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name)
        self.git("init", "-q")
        self.git("config", "user.email", "ci@example.invalid")
        self.git("config", "user.name", "Portal CI Fixture")
        (self.repo / "fixture.txt").write_text("initial\n", encoding="utf-8")
        self.git("add", "fixture.txt")
        self.git("commit", "-qm", "initial")

    def git(self, *args):
        return subprocess.run(
            ["git", *args], cwd=self.repo, check=True, capture_output=True, text=True
        ).stdout.strip()

    def run_gate(self, expected_sha):
        workflow = json.loads(WORKFLOW.read_text(encoding="utf-8"))
        steps = workflow["jobs"]["validate"]["steps"]
        self.assertEqual(steps[-1]["name"], "Verify clean checkout and workflow commit")
        script = steps[-1]["run"]
        self.assertIn("${{ github.sha }}", script)
        self.assertIn("git rev-parse HEAD", script)
        return subprocess.run(
            ["bash", "-c", script.replace("${{ github.sha }}", expected_sha)],
            cwd=self.repo, capture_output=True, text=True, check=False
        )

    def test_matching_commit_and_clean_checkout_pass(self):
        self.assertEqual(self.run_gate(self.git("rev-parse", "HEAD")).returncode, 0)

    def test_clean_checkout_with_advanced_head_fails(self):
        expected = self.git("rev-parse", "HEAD")
        self.git("commit", "--allow-empty", "-qm", "advance HEAD without dirtying tree")
        self.assertEqual(self.git("status", "--porcelain"), "")
        result = self.run_gate(expected)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("checkout HEAD differs", result.stderr)

    def test_unrelated_commit_fails(self):
        result = self.run_gate("0" * 40)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("checkout HEAD differs", result.stderr)

    def test_dirty_checkout_fails_before_revision_check(self):
        (self.repo / "fixture.txt").write_text("changed\n", encoding="utf-8")
        result = self.run_gate(self.git("rev-parse", "HEAD"))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("checkout is dirty", result.stderr)


if __name__ == "__main__":
    unittest.main()
