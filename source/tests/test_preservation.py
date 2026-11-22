import pathlib, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
class PreservationTests(unittest.TestCase):
 def test_modules(self):
  for name in ('data.js','engine.js','tree.js','worlds.js','app-core.js','app-ui.js','style.css'):
   self.assertTrue((ROOT/'src'/name).is_file(),name)
 def test_controls(self):
  html=(ROOT/'src/index.tpl.html').read_text()
  for marker in ('id="atlas"','id="journey"','id="stage"','id="reflect"','id="btn-export"'):
   self.assertIn(marker,html)
 def test_private_export(self):
  js=(ROOT/'src/app-ui.js').read_text()
  self.assertIn("$('#btn-export').addEventListener('click'",js)
  self.assertIn('URL.createObjectURL(blob)',js)
if __name__=='__main__': unittest.main()
