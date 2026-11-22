"""Offline release checks for the self-contained Living Universe website."""
import pathlib
import subprocess
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'src'

class ReleaseChecks(unittest.TestCase):
    def test_build_reproducible(self):
        subprocess.run(['python3', str(ROOT / 'build.py')], check=True)
        self.assertEqual((ROOT / 'dist/index.html').read_bytes(), (ROOT.parent / 'living-universe-full.html').read_bytes())

    def test_js_syntax(self):
        for f in sorted(SRC.glob('*.js')):
            with self.subTest(file=f.name):
                subprocess.run(['node', '--check', str(f)], check=True, capture_output=True)

    def test_page_structure(self):
        html = (ROOT / 'dist/index.html').read_text()
        for marker in ('id="stage"', 'id="atlas"', 'id="prefs"', 'id="reflect"', 'id="skiplink"', 'aria-modal="true"'):
            with self.subTest(marker=marker):
                self.assertIn(marker, html)
        self.assertNotIn('/*__CSS__*/', html)
        self.assertNotIn('/*__JS__*/', html)

if __name__ == '__main__':
    unittest.main()
