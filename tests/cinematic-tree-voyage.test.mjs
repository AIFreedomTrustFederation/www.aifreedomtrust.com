import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const script=readFileSync(new URL('../cinematic-tree-voyage.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../cinematic-world.html',import.meta.url),'utf8');
test('canonical HTML loads the voyage after lineage data',()=>{
assert.ok(html.includes('cinematic-tree-voyage.js'));
assert.ok(html.indexOf('lineage-data.js')<html.indexOf('cinematic-tree-voyage.js'));
});
test('growth stage order and biological classification are preserved',()=>{
assert.match(script,/\['root','trunk','branch','leaf','flower','fruit'\]/);
assert.match(script,/n\.kind!=='fruit'/);
assert.match(script,/ancestry\(n\)\.complete/);
});
test('source data is required and no fabricated progress is introduced',()=>{
assert.match(script,/window\.AIFT_LINEAGE_NODES/);
assert.match(script,/Array\.isArray\(records\)/);
assert.doesNotMatch(script,/localStorage|fetch\(|XMLHttpRequest|telemetry|Math\.random/);
});
test('navigation is accessible and links use safe protocols',()=>{
assert.match(script,/aria-expanded/);
assert.match(script,/aria-pressed/);
assert.match(script,/aria-live/);
assert.match(script,/Escape/);
assert.match(script,/https:/);
assert.match(script,/noopener noreferrer/);
});
test('mobile and reduced-motion fallbacks exist',()=>{
assert.match(script,/@media\(max-width:800px\)/);
assert.match(script,/@media\(prefers-reduced-motion:reduce\)/);
});
