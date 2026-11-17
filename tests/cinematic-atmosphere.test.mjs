import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('canonical cinematic HTML loads additive atmosphere without replacing source contracts',()=>{
 const html=read('cinematic-world.html');
 assert.match(html,/cinematic-atmosphere\.css/);
 assert.match(html,/cinematic-atmosphere\.js/);
 for(const required of ['lineage-data.js','cinematic-source-projection.js','cinematic-lineage-portal.js','id="evidence-world"','id="journey"'])assert.ok(html.includes(required),required);
});
test('atmosphere has accessible controls, reduced motion, low power and no network or telemetry',()=>{
 const js=read('cinematic-atmosphere.js'),css=read('cinematic-atmosphere.css');
 for(const required of ['aria-pressed','aria-label','prefers-reduced-motion','prefers-reduced-data','visibilitychange','pointermove','pointerleave','cancelAnimationFrame'])assert.ok(js.includes(required),required);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(max-width:390px\)/);
 assert.doesNotMatch(js,/\b(fetch|XMLHttpRequest|sendBeacon|localStorage)\s*\(/);
});
test('repositories remain source roots; environment adds no fabricated fruits',()=>{
 const js=read('cinematic-atmosphere.js');
 assert.doesNotMatch(js,/AIFT_LINEAGE_NODES|\.push\(\s*\{\s*kind:\s*['"]fruit/);
});
