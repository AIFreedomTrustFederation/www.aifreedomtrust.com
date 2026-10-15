"""Offline regression checks for unsafe URL schemes in portal navigation."""

import contextlib
import io
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import validate_static_site as validator


class StaticPortalValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in validator.REQUIRED_FILES:
            target = self.root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(b"fixture")
        (self.root / "index.html").write_text('<main id="top"><a href="#top">Home</a></main>', encoding="utf-8")
        (self.root / "pages.html").write_text('<main id="top"><a href="index.html#top">Home</a></main>', encoding="utf-8")

    def validate(self):
        with patch.object(validator, "ROOT", self.root), contextlib.redirect_stdout(io.StringIO()) as out:
            status = validator.main()
        return status, out.getvalue()

    def test_valid_internal_and_external_links_pass(self):
        (self.root / "index.html").write_text('<main id="top"><a href="https://example.org">External</a><a href="mailto:team@example.org">Email</a><a href="#top">Top</a></main>', encoding="utf-8")
        self.assertEqual(self.validate()[0], 0)

    def test_javascript_navigation_is_rejected(self):
        (self.root / "index.html").write_text('<main id="top"><a href="javascript:alert(1)">Click</a></main>', encoding="utf-8")
        status, output = self.validate()
        self.assertEqual(status, 1, output)
        self.assertIn("unsafe URL scheme", output)

    def test_data_url_navigation_is_rejected(self):
        (self.root / "index.html").write_text('<main id="top"><a href="data:text/html,hi">Click</a></main>', encoding="utf-8")
        status, output = self.validate()
        self.assertEqual(status, 1, output)
        self.assertIn("unsafe URL scheme", output)

    def test_obfuscated_javascript_navigation_is_rejected(self):
        (self.root / "index.html").write_text('<main id="top"><a href="JaVaScRiPt&#58;alert(1)">Click</a></main>', encoding="utf-8")
        status, output = self.validate()
        self.assertEqual(status, 1, output)
        self.assertIn("unsafe URL scheme", output)

    def test_remote_script_resource_still_rejected(self):
        (self.root / "index.html").write_text('<main id="top"><script src="https://example.org/tracker.js"></script></main>', encoding="utf-8")
        status, output = self.validate()
        self.assertEqual(status, 1, output)
        self.assertIn("remote script resource", output)

    def test_broken_fragment_still_rejected(self):
        (self.root / "index.html").write_text('<main id="top"><a href="#missing">Click</a></main>', encoding="utf-8")
        status, output = self.validate()
        self.assertEqual(status, 1, output)
        self.assertIn("broken fragment", output)


if __name__ == "__main__":
    unittest.main()
