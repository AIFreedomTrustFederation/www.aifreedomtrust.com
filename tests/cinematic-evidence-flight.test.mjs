import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
test('canonical HTML loads evidence flight after published lineage and seven movements',()=>{
 const h=read('cinematic-world.html');
 for(const f of ['cinematic-evidence-flight.js','cinematic-evidence-flight.css','lineage-data.js','cinematic-seven-movements.js'])assert.ok(h.includes(f),f);
 assert.ok(h.indexOf('lineage-data.js')<h.indexOf('cinematic-evidence-flight.js'));
});
test('flight script compiles and uses only published lineage, no telemetry or synthetic progress',()=>{
 const js=read('cinematic-evidence-flight.js');new vm.Script(js);
 for(const term of ['AIFT_LINEAGE_NODES','ancestry(node)','No published user-facing outcome','aria-expanded','Escape','noopener noreferrer'])assert.ok(js.includes(term),term);
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendBeacon|localStorage|Math\.random|reward_xp/);
});
test('flight has reduced motion, data and mobile fallbacks',()=>{
 const css=read('cinematic-evidence-flight.css');
 for(const term of ['prefers-reduced-motion:reduce','prefers-reduced-data:reduce','max-width:600px',':focus-visible','min-height:44px'])assert.ok(css.includes(term),term);
});
test('flight routes require real ancestry and never treat repositories as fruits',()=>{
 const js=read('cinematic-evidence-flight.js');
 assert.match(js,/n\.kind==='fruit'/);
 assert.match(js,/!isRepo\(n\.url\)/);
 assert.match(js,/byId\.get\(n\.parent\)\?\.kind==='trunk'/);
 assert.match(js,/!byId\.get\(n\.parent\)\?\.parent/);
 assert.match(js,/seen\.has\(n\.id\)/);
});
