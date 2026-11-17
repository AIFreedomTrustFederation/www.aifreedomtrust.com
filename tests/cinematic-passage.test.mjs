import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('canonical cinematic HTML loads source-bound passage after lineage data',()=>{
 const html=read('cinematic-world.html');
 assert.match(html,/cinematic-passage\.css/);
 assert.match(html,/cinematic-passage\.js/);
 assert.ok(html.indexOf('lineage-data.js')<html.indexOf('cinematic-passage.js'));
});
test('passage never creates repository fruits, telemetry or invented scores',()=>{
 const js=read('cinematic-passage.js');
 assert.match(js,/window\.AIFT_LINEAGE_NODES/);
 assert.match(js,/valid\.filter\(n=>n\.kind===stage\)/);
 assert.match(js,/No published /);
 assert.match(js,/noopener noreferrer/);
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendBeacon|localStorage|Math\.random|reward_xp|innerHTML/);
});
test('mobile passage supports keyboard, visible focus and reduced motion',()=>{
 const js=read('cinematic-passage.js'),css=read('cinematic-passage.css');
 assert.match(js,/ArrowRight/);assert.match(js,/ArrowLeft/);assert.match(js,/aria-pressed/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/focus-visible/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
