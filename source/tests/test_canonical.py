import pathlib, re, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=(ROOT/'src/data.js').read_text()
HTML=(ROOT/'src/index.tpl.html').read_text()
UI=(ROOT/'src/app-ui.js').read_text()
class CanonicalParity(unittest.TestCase):
 def test_seven_movement_article_pairs(self):
  pairs=[('ground','I'),('witness','II'),('name','III'),('differentiate','IV'),('converge','V'),('covenant','VI'),('return','VII')]
  for movement,article in pairs:
   with self.subTest(movement=movement):
    block=re.search(r"movement\(\{\s*id:\s*'"+movement+r"'.*?(?=\n\s*movement\(\{|\n\s*\}\);)",DATA,re.S)
    self.assertIsNotNone(block)
    self.assertIn("art: '"+article+"'",block.group())
    self.assertIn('artTitle:',block.group())
    self.assertIn('artBody:',block.group())
 def test_six_fruit_worlds(self):
  self.assertEqual(len(re.findall(r"type:\s*'fruit'",DATA)),6)
 def test_private_import_export(self):
  for marker in ('id="btn-import"','id="journey-file"','id="btn-export"'):
   self.assertIn(marker,HTML)
  for marker in ('Object.prototype.hasOwnProperty.call(WORLD, id)', 'Object.prototype.hasOwnProperty.call(STAR, id)', 'file.size > 1024 * 1024', 'window.confirm(', 'reader.readAsText(file)'):
   self.assertIn(marker,UI)
if __name__=='__main__': unittest.main()
