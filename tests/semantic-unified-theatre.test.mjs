import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {THEATRE,mountTheatre} from '../semantic-unified-theatre.mjs';
const html=readFileSync(new URL('../semantic-scene.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../semantic-unified-theatre.css',import.meta.url),'utf8');
test('theatre covers the eight existing workspaces without removing them',()=>{
 assert.equal(THEATRE.length,8);
 for(const [id] of THEATRE)assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/src="semantic-unified-theatre.mjs"/);
 assert.match(html,/href="semantic-unified-theatre.css"/);
 assert.match(html,/id="living-canopy"/);assert.match(html,/id="map"/);
 assert.match(html,/id="evidence-quest-board"/);
});
test('mobile, focus and reduced motion remain explicit',()=>{
 assert.match(css,/:focus-visible/);assert.match(css,/max-width:520px/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(css,/display:\s*none|visibility:\s*hidden/);
});
test('safe no-op when no page main exists',()=>assert.equal(mountTheatre({querySelector:()=>null}),false));
