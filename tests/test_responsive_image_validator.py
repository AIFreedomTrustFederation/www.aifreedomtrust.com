"""Ensure the portal gate checks browser-selected responsive image URLs."""

import contextlib
import io
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import validate_static_site as validator


class ResponsiveImageValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in validator.REQUIRED_FILES:
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(b"fixture")
        for name in validator.HTML_FILES:
            (self.root / name).write_text("<main id='top'></main>", encoding="utf-8")

    def validate_html(self, html):
        (self.root / "index.html").write_text(html, encoding="utf-8")
        with patch.object(validator, "ROOT", self.root), contextlib.redirect_stdout(io.StringIO()) as output:
            status = validator.main()
        return status, output.getvalue()

    def test_img_srcset_remote_second_candidate_rejected(self):
        status, output = self.validate_html(
            '<img src="assets/aift-federation-hero.png" '
            'srcset="assets/aift-federation-hero.png 1x, https://tracking.example/pixel 2x">'
        )
        self.assertEqual(status, 1, output)
        self.assertIn("remote img resource", output)

    def test_picture_source_srcset_remote_rejected(self):
        status, output = self.validate_html(
            '<picture><source srcset="//tracking.example/pixel 2x">'
            '<img src="assets/aift-federation-hero.png"></picture>'
        )
        self.assertEqual(status, 1, output)
        self.assertIn("remote source resource", output)

    def test_link_preload_imagesrcset_remote_rejected(self):
        status, output = self.validate_html(
            '<link rel="preload" as="image" '
            'imagesrcset="https://tracking.example/pixel 2x">'
        )
        self.assertEqual(status, 1, output)
        self.assertIn("remote link resource", output)

    def test_data_srcset_rejected_even_with_comma(self):
        status, output = self.validate_html(
            '<img srcset="data:image/svg+xml,%3Csvg%3E%3C/svg%3E 1x">'
        )
        self.assertEqual(status, 1, output)
        self.assertIn("unsafe URL scheme", output)

    def test_missing_local_srcset_candidate_rejected(self):
        status, output = self.validate_html(
            '<img src="assets/aift-federation-hero.png" '
            'srcset="assets/aift-federation-hero.png 1x, assets/missing.png 2x">'
        )
        self.assertEqual(status, 1, output)
        self.assertIn("missing local target", output)

    def test_existing_local_srcset_candidates_pass(self):
        status, output = self.validate_html(
            '<img src="assets/aift-federation-hero.png" '
            'srcset="assets/aift-federation-hero.png 1x, assets/aift-federation-hero.png 2x">'
        )
        self.assertEqual(status, 0, output)


if __name__ == "__main__":
    unittest.main()
