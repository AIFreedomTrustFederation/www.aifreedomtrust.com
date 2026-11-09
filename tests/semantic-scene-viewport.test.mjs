import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('semantic viewport controls exist and are wired',()=>{
 const html=read('semantic-scene.html'),js=read('semantic-scene-ui.mjs');
 for(const id of ['zoom-in','zoom-out','zoom-fit','viewport-status']) assert.match(html,new RegExp('id="'+id+'"'));
 for(const token of ['function applyViewport','function changeZoom','function focusEntity','focusEntity(id)','zoom=1;center={x:500,y:310}']) assert.ok(js.includes(token),token);
});
test('semantic viewport preserves provenance, keyboard navigation and accessibility',()=>{
 const js=read('semantic-scene-ui.mjs'),html=read('semantic-scene.html'),css=read('semantic-scene.css');
 for(const token of ['semanticBreadcrumbs','inspection.lineage.roots','safeLink','g.onkeydown','history[cursor]']) assert.ok(js.includes(token),token);
 assert.match(html,/Accessible entity index/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(js,/const clamp=\(value,min,max\)=>Math\.max\(min,Math\.min\(max,value\)\)/);
 assert.match(js,/zoom=clamp\(Math\.round\(next\*10\)\/10,1,4\)/);
});
