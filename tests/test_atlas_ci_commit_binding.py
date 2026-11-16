"""Run the Atlas workflow's final revision gate in isolated Git repositories."""

import os
import subprocess
import tempfile
import textwrap
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github/workflows/atlas-integrity.yml"
STEP = "      - name: Verify clean checkout and workflow commit\n        run: |\n"


class AtlasCICommitBindingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.repo = Path(self.temp.name)
        self.git("init", "-q")
        self.git("config", "user.email", "ci@example.invalid")
        self.git("config", "user.name", "Atlas CI Fixture")
        (self.repo / "fixture.txt").write_text("initial\n", encoding="utf-8")
        self.git("add", "fixture.txt")
        self.git("commit", "-qm", "initial")

    def git(self, *args):
        return subprocess.run(
            ["git", *args], cwd=self.repo, capture_output=True, text=True, check=True
        ).stdout.strip()

    def gate_script(self):
        workflow = WORKFLOW.read_text(encoding="utf-8")
        self.assertIn(STEP, workflow)
        self.assertEqual(workflow.count(STEP), 1)
        block = workflow.split(STEP, 1)[1].split("\n      - ", 1)[0]
        return textwrap.dedent(block)

    def run_gate(self, expected_sha):
        env = os.environ.copy()
        if expected_sha is None:
            env.pop("GITHUB_SHA", None)
        else:
            env["GITHUB_SHA"] = expected_sha
        return subprocess.run(
            ["bash", "-c", self.gate_script()], cwd=self.repo,
            capture_output=True, text=True, check=False, env=env
        )

    def test_matching_clean_checkout_passes(self):
        self.assertEqual(self.run_gate(self.git("rev-parse", "HEAD")).returncode, 0)

    def test_clean_checkout_with_advanced_head_fails(self):
        expected = self.git("rev-parse", "HEAD")
        self.git("commit", "--allow-empty", "-qm", "advance HEAD")
        self.assertEqual(self.git("status", "--porcelain"), "")
        result = self.run_gate(expected)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("checkout HEAD differs", result.stderr)

    def test_wrong_sha_fails(self):
        result = self.run_gate("0" * 40)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("checkout HEAD differs", result.stderr)

    def test_missing_sha_fails(self):
        result = self.run_gate(None)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("checkout HEAD differs", result.stderr)

    def test_dirty_checkout_fails(self):
        (self.repo / "fixture.txt").write_text("changed\n", encoding="utf-8")
        result = self.run_gate(self.git("rev-parse", "HEAD"))
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("checkout is dirty", result.stderr)

    def test_workflow_runs_regression_on_changes(self):
        workflow = WORKFLOW.read_text(encoding="utf-8")
        self.assertEqual(workflow.count("      - 'tests/test_atlas_ci_commit_binding.py'"), 2)
        self.assertIn("python3 -B -m unittest discover -s tests -p 'test_atlas_ci_commit_binding.py' -v", workflow)
        self.assertTrue(workflow.rstrip().endswith("exit 1\n          fi"))


if __name__ == "__main__":
    unittest.main()
