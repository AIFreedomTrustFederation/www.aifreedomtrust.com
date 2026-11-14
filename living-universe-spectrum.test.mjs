import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
test('Tree and Evidence Theatre share the same additive spectral stylesheet',()=>{
 for(const path of ['./living-universe-explorer.html','./portable-evidence-theatre.html']){
  const html=read(path);
  assert.match(html,/<link rel="stylesheet" href="\.\/living-universe-spectrum\.css">/);
  assert.match(html,/<script/);
 }
});
test('biological spectrum, mobile and accessible motion remain explicit',()=>{
 const css=read('./living-universe-spectrum.css');
 for(const name of ['red','gold','green','blue','violet'])assert.match(css,new RegExp('--aift-spectrum-'+name+':'));
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/forced-colors:active/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/max-width:800px/);
 assert.doesNotMatch(css,/url\(https?:/);
});
