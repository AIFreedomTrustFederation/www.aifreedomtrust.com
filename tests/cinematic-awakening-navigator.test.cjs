/* Contract tests for the canonical first-viewport lineage journey. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('cinematic-world.html','utf8');
const js=fs.readFileSync('cinematic-awakening-navigator.js','utf8');
const css=fs.readFileSync('cinematic-awakening-navigator.css','utf8');
test('canonical HTML mounts both cinematic journey assets',()=>{
 assert.match(html,/cinematic-awakening-navigator\.css/);
 assert.match(html,/cinematic-awakening-navigator\.js/);
 assert.ok(html.indexOf('lineage-data.js')<html.indexOf('cinematic-awakening-navigator.js'));
});
test('navigator script parses without a browser runtime',()=>assert.doesNotThrow(()=>new vm.Script(js)));
test('lineage is source-backed and excludes repository fruits',()=>{
 assert.match(js,/AIFT_LINEAGE_NODES/);
 assert.match(js,/kind==='fruit'/);
 assert.match(js,/!repo\(n\.url\)/);
 assert.match(js,/kind==='root'/);
 assert.match(js,/chain\(n\)/);
});
test('reversible navigation, keyboard escape and reduced-motion exist',()=>{
 for(const needle of ['awakening-back','awakening-forward','Escape','prefers-reduced-motion','aria-live','awakening-breadcrumbs','awakening-map'])assert.ok(js.includes(needle),needle);
 assert.match(css,/max-width:600px/);
 assert.match(css,/prefers-reduced-data:reduce/);
});

test('hero supports all six stages and traverses only published descendant edges',()=>{
 assert.match(js,/const children=new Map\(\)/);
 assert.match(js,/const p=parent\(n\)/);
 assert.match(js,/children\.get\(n\.id\)/);
 assert.match(js,/outcomes\.includes\(x\)/);
 assert.match(js,/child\.kind\+' · '\+child\.label/);
 assert.match(js,/flower:4,fruit:5/);
 assert.match(css,/repeat\(6,minmax\(0,1fr\)\)/);
 assert.match(css,/awakening-children/);
});

test('hero exposes reversible cross-surface selection and keyboard spatial navigation',()=>{
 for(const needle of ['aift:lineage-selected','aift:lineage-select','aift:lineage-return','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','setCamera','resetCamera','announceSelection(n)'])assert.ok(js.includes(needle),needle);
 assert.match(js,/e\.preventDefault\(\)/);
 assert.match(js,/e\.target!==tree/);
 assert.match(js,/all\.includes\(node\)/);
});
