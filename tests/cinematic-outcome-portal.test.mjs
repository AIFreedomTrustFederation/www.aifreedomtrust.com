import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../cinematic-world.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../cinematic-outcome-portal.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../cinematic-outcome-portal.css',import.meta.url),'utf8');
test('canonical HTML loads outcome portal after lineage contract',()=>{
 assert.match(html,/cinematic-outcome-portal\.css/);
 assert.match(html,/lineage-data\.js[\s\S]*cinematic-outcome-portal\.js/);
});
test('only published fruit records may become destinations',()=>{
 assert.match(js,/n\.kind==='fruit'/);
 assert.match(js,/window\.AIFT_LINEAGE_NODES/);
 assert.match(js,/pathTo\(node\)/);
 assert.match(js,/kind==='root'/);
 assert.doesNotMatch(js,/localStorage|fetch\(|XMLHttpRequest|analytics|telemetry/);
});
test('safe links and keyboard-accessible modal',()=>{
 assert.match(js,/u\.protocol==='https:'/);
 assert.match(js,/noopener noreferrer/);
 assert.match(js,/aria-modal/);
 assert.match(js,/e\.key==='Escape'/);
 assert.match(js,/e\.key!=='Tab'/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/max-width:600px/);
});

test('fruit gallery requires complete root provenance and supports ancestry discovery',()=>{
 assert.match(js,/hasRootLineage\(n\)/);
 assert.match(js,/current\.kind==='root'/);
 assert.match(js,/seen\.has\(current\.id\)/);
 assert.match(js,/const eligible=outcomes\.filter/);
 assert.match(js,/search\.type='search'/);
 assert.match(js,/search\.addEventListener\('input',filterOutcomes\)/);
 assert.match(js,/pathTo\(node\)\.map/);
 assert.match(js,/button\.hidden=!haystack\.includes\(q\)/);
 assert.match(css,/\.outcome-card\[hidden\]/);
 assert.match(css,/\.outcome-search:focus-visible/);
});
