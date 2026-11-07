import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../semantic-scene-ui.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('../semantic-scene.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../semantic-scene.css',import.meta.url),'utf8');
test('keyboard spatial navigation is discoverable and supports pan zoom reset',()=>{
 assert.match(html,/id="spatial-instructions"/);
 for(const key of ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'])assert.ok(js.includes(key));
 assert.match(js,/setAttribute\('aria-describedby','spatial-instructions'\)/);
 assert.match(js,/event\.preventDefault\(\);panBy/);
});
test('pointer navigation excludes selectable entities and ends on cancellation',()=>{
 assert.match(js,/event\.target\.closest\('\.entity'\)/);
 assert.match(js,/setPointerCapture/);
 assert.match(js,/pointercancel/);
 assert.match(js,/lostpointercapture/);
});
test('wheel zoom requires control modifier to preserve ordinary scrolling',()=>{
 assert.match(js,/if\(!event\.ctrlKey\)return/);
 assert.match(js,/passive:false/);
});
test('minimap viewport is visible and follows camera without operational claims',()=>{
 assert.match(js,/updateMinimap\(\)/);
 assert.match(css,/\.minimap-viewport/);
 assert.match(js,/Not live status|not live data/i);
});
