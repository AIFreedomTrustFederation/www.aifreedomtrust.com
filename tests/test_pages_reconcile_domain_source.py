"""Offline regression: a cleared domain does not prove the Pages source is intact.

The read-only reconciler must not present an incomplete or drifted Pages
configuration as matching the intended publishing state. No live API calls.
"""
import unittest

from test_pages_reconcile import PagesReconcileTests


class PagesDomainSourceCoherenceTests(unittest.TestCase):
    def assert_observation(self, current, expected):
        fixture = PagesReconcileTests()
        events = [
            fixture.event(),
            fixture.event(phase="verified"),
            fixture.event("remove_custom_domain"),
        ]
        process, report, calls = fixture.invoke(events, current=current)
        self.assertEqual(process.returncode, 2, process.stderr + process.stdout)
        self.assertEqual(report["status"], "manual_reconciliation_required")
        self.assertEqual(len(report["unmatched_attempts"]), 1)
        self.assertEqual(report["unmatched_attempts"][0]["current_observation"], expected)
        self.assertEqual(calls, ["api repos/AIFreedomTrustFederation/www.aifreedomtrust.com/pages"])

    def test_cleared_domain_with_missing_source_is_unknown(self):
        self.assert_observation({"cname": None}, "unknown")

    def test_cleared_domain_with_drifted_branch_is_different(self):
        self.assert_observation(
            {"cname": None, "source": {"branch": "main", "path": "/"}},
            "observed_differs",
        )

    def test_cleared_domain_with_drifted_path_is_different(self):
        self.assert_observation(
            {"cname": "", "source": {"branch": "gh-pages", "path": "/docs"}},
            "observed_differs",
        )

    def test_cleared_domain_with_expected_source_is_matching_observation_only(self):
        self.assert_observation(
            {"cname": None, "source": {"branch": "gh-pages", "path": "/"}},
            "observed_matches_intent",
        )

    def test_present_domain_is_different_even_without_source(self):
        self.assert_observation({"cname": "old.example"}, "observed_differs")


if __name__ == "__main__":
    unittest.main()
