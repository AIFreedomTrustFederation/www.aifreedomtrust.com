import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('homepage launches canonical cinematic world in embedded mode without replacing original vision',()=>{
 const page=read('index.html');
 assert.match(page,/src="cinematic-world\.html\?embedded=1"/);
 assert.match(page,/id="umbrella"/);
 assert.match(page,/href="cinematic-world\.html"/);
});
test('standalone world remains available and embedded mode is explicitly opt-in',()=>{
 const world=read('cinematic-world.html');
 assert.match(world,/URLSearchParams\(location\.search\)\.get\("embedded"\)==="1"/);
 assert.match(world,/classList\.add\("embedded-world"\)/);
 assert.match(world,/lineage-data\.js/);
 assert.match(world,/cinematic-source-projection\.js/);
 assert.match(world,/id="evidence-world"/);
});
test('embedded mobile view prioritizes Tree without hiding lineage or breaking reduced motion',()=>{
 const css=read('cinematic-world.css');
 assert.match(css,/\.embedded-world \.hud\{display:none\}/);
 assert.match(css,/\.embedded-world \.world \.tree/);
 assert.match(css,/@media\(max-width:800px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(css,/\.embedded-world \.evidence-world\s*\{\s*display:\s*none/);
});
