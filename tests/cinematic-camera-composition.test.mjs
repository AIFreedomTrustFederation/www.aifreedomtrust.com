import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../cinematic-atmosphere.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../cinematic-atmosphere.css',import.meta.url),'utf8');
test('atmosphere never overwrites the source-backed semantic camera transform',()=>{
  assert.doesNotMatch(js,/tree\.style\.transform\s*=/);
  assert.match(js,/--atmosphere-x/);
  assert.match(js,/--atmosphere-y/);
  assert.match(css,/translate:\s*var\(--atmosphere-x/);
});
test('motion preferences and reset remain wired',()=>{
  assert.match(js,/prefers-reduced-motion/);
  assert.match(js,/prefers-reduced-data/);
  assert.match(js,/cancelAnimationFrame/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});
