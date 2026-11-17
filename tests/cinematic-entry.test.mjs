import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../cinematic-entry.css',import.meta.url),'utf8');
const world=readFileSync(new URL('../cinematic-world.html',import.meta.url),'utf8');
test('published homepage opens with playable canonical HTML world before editorial sections',()=>{
 const hero=index.indexOf('<section class="cinematic-entry"');
 assert.ok(hero>0);
 assert.ok(hero<index.indexOf('class="lineage-gateway"'));
 assert.match(index.slice(hero,hero+700),/iframe[^>]+src="cinematic-world.html"/);
 assert.match(index,/href="cinematic-world.html"/);
 assert.match(index,/href="#umbrella"/);
 assert.match(index,/href="cinematic-entry.css"/);
});
test('cinematic embed keeps source-backed runtime and preserves original content',()=>{
 assert.match(world,/src="lineage-data.js"/);
 assert.match(world,/src="cinematic-source-projection.js"/);
 assert.match(index,/id="fruit-atlas"/);
 assert.match(index,/id="living-universe-journey"/);
 assert.match(index,/id="lineage-gateway-title"/);
});
test('mobile, reduced motion and keyboard access are supported',()=>{
 assert.match(css,/100dvh/);
 assert.match(css,/max-width:600px/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/:focus-visible/);
 assert.match(index,/title="Interactive Living Universe Tree/);
});
