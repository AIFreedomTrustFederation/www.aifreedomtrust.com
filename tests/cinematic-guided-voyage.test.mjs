import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../cinematic-world.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../cinematic-guided-voyage.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../cinematic-guided-voyage.css',import.meta.url),'utf8');
test('guided voyage is loaded from canonical HTML after lineage data',()=>{
 assert.match(html,/cinematic-guided-voyage\.css/);
 assert.match(html,/lineage-data\.js[\s\S]*cinematic-guided-voyage\.js/);
 assert.match(html,/cinematic-world\.html/);
});
test('journey uses actual lineage, preserves root/fruit semantics and safe links',()=>{
 assert.match(js,/window\.AIFT_LINEAGE_NODES/);
 assert.match(js,/\['root','trunk','branch','leaf','flower','fruit'\]/);
 assert.match(js,/n\.kind==='fruit'/);
 assert.match(js,/noopener noreferrer/);
 assert.match(js,/\['http:','https:'\]/);
 assert.doesNotMatch(js,/Math\.random|localStorage|fetch\(|XMLHttpRequest|navigator\.sendBeacon|\bXP\b/);
});
test('six chapter journey has reversible accessible controls and motion fallback',()=>{
 for(const value of ['Previous','Next chapter','Return to roots','Play journey','Pause journey','aria-live','aria-pressed','prefers-reduced-motion','visibilitychange'])assert.ok(js.includes(value),value);
 assert.match(css,/:focus-visible/);
 assert.match(css, /max-width:480px/);
 assert.match(css, /prefers-reduced-motion:reduce/);
});
