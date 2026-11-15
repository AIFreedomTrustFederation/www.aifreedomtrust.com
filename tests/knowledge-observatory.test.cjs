const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const read=p=>fs.readFileSync(require('node:path').join(__dirname,'..',p),'utf8');
test('shared knowledge observatory is loaded by both exploration surfaces',()=>{
for(const page of ['atlas.html','root-lineage.html'])assert.match(read(page),/<script defer src="knowledge-observatory\.js"><\/script>/);
});
test('knowledge observatory is valid JavaScript and derives destinations only from curated lineage',()=>{
const code=read('knowledge-observatory.js');assert.doesNotThrow(()=>new vm.Script(code));
assert.match(code,/window\.AIFT_LINEAGE_NODES/);
assert.match(code,/index\.get\(current\.parent\)/);
assert.match(code,/No CI status, live verification/);
assert.doesNotMatch(code,/localStorage|fetch\(|XMLHttpRequest|sendBeacon|Math\.random/);
});
test('source contract forbids repositories being declared as fruits',()=>{
const source=read('lineage-data.js');assert.match(source,/Root must feed shared trunk/);
assert.match(source,/Unsafe outcome URL/);
});

test('both public surfaces share evidence-filtered semantic layers and reversible lineage map',()=>{
 const code=read('knowledge-observatory.js');
 for(const marker of ['Knowledge growth layers','Reversible source lineage map','Source-to-outcome lineage','No documented ','activeLayer','ancestors(n)','mapTrail.replaceChildren','aria-pressed','prefers-reduced-motion','forced-colors'])assert.ok(code.includes(marker),marker);
 assert.match(code,/activeLayer==='all'\|\|n\.kind===activeLayer/);
 assert.match(code,/map\.replaceChildren\(mapTitle,mapTrail,mapNote\)/);
 assert.doesNotMatch(code,/fetch\(|localStorage|sendBeacon|Math\.random/);
});
