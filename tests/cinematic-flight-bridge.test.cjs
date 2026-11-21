/* Contract: one source-backed bridge between the first viewport and Evidence Flight. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('hero navigator dispatches a selected documented node, never a synthetic fruit',()=>{
 const source=read('cinematic-awakening-navigator.js');
 assert.match(source,/aift:lineage-flight/);
 assert.match(source,/nodeId:selected\.id/);
 assert.match(source,/chain\(selected\)\.length/);
 assert.match(source,/flightButton\.hidden=!path\.length/);
});
test('flight resolves ancestry through published route records and handles missing outcome',()=>{
 const source=read('cinematic-evidence-flight.js');
 assert.match(source,/addEventListener\('aift:lineage-flight'/);
 assert.match(source,/const lineage=ancestry\(node\)/);
 assert.match(source,/routes\.filter\(r=>r\.chain\[0\]\.id===root\.id/);
 assert.match(source,/if\(!chosen\)/);
 assert.match(source,/no verified public outcome/);
 assert.match(source,/chosen\.chain\.findIndex/);
});

test('flight and first-viewport Tree support reversible selection without fabricated nodes',()=>{
 const flight=read('cinematic-evidence-flight.js');
 const navigator=read('cinematic-awakening-navigator.js');
 assert.match(flight,/seven-flight-return/);
 assert.match(flight,/returnButton\.hidden=!active\.length/);
 assert.match(flight,/aift:lineage-return/);
 assert.match(flight,/nodeId:node\.id/);
 assert.match(navigator,/addEventListener\('aift:lineage-return'/);
 assert.match(navigator,/nodes\.get\(event\.detail\?\.nodeId\)/);
 assert.match(navigator,/all\.includes\(node\)/);
 assert.match(navigator,/show\(node\)/);
});
