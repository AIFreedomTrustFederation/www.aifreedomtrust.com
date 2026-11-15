/* Run: node --test tests/lineage-contract.test.cjs */
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const base=path.join(__dirname,'..');const context={};vm.runInNewContext(fs.readFileSync(path.join(base,'lineage-data.js'),'utf8'),context);const nodes=Array.from(context.AIFT_LINEAGE_NODES);
test('all repository sources are roots and no repository is a fruit',()=>{for(const n of nodes){if(/^https:\/\/github\.com\/AIFreedomTrustFederation\/[^/]+\/?$/.test(n.url))assert.equal(n.kind,'root',n.id)}});
test('every fruit opens a real visitor destination',()=>{const fruits=nodes.filter(n=>n.kind==='fruit');assert.ok(fruits.length);for(const n of fruits){assert.match(n.url,/\.html(?:#.*)?$/);assert.ok(fs.existsSync(path.join(base,n.url.split('#')[0])),n.url)}});
test('every node reaches shared trunk without cycles',()=>{const byId=new Map(nodes.map(n=>[n.id,n]));for(const n of nodes){let x=n;const visited=new Set();while(x.parent){assert.ok(!visited.has(x.id));visited.add(x.id);x=byId.get(x.parent);assert.ok(x)}assert.equal(x.kind,'trunk')}});
test('all source classifications are curated, never presented as live',()=>{for(const n of nodes){assert.equal(n.evidence,'curated');assert.equal(n.verifiedLive,false)}});
test('explorer loads shared contract and retains accessible index',()=>{const html=fs.readFileSync(path.join(base,'root-lineage.html'),'utf8');assert.match(html,/<script src="lineage-data\.js"><\/script>/);assert.match(html,/AIFT_LINEAGE_NODES/);assert.match(html,/aria-label="Accessible node index"/)});

test('shared catalog executes in isolated browser-like VM without ambient variables',()=>{
 const sandbox={window:{}};assert.doesNotThrow(()=>vm.runInNewContext(fs.readFileSync(path.join(base,'lineage-data.js'),'utf8'),sandbox));
 assert.ok(sandbox.window.AIFT_LINEAGE_NODES.length>10);
 assert.equal(sandbox.window.AIFT_LINEAGE_NODES.find(n=>n.id==='federation').url,'docs/organization-map.md');
});
test('all roots feed the trunk and all branches and leaves retain a source lineage',()=>{
 const byId=new Map(nodes.map(n=>[n.id,n]));
 for(const n of nodes){
  if(n.kind==='root')assert.equal(n.parent,'federation',n.id);
  if(n.kind==='branch'||n.kind==='leaf'||n.kind==='fruit'){
   let cursor=n;const ancestry=[];
   while(cursor.parent){cursor=byId.get(cursor.parent);ancestry.push(cursor.kind)}
   assert.ok(ancestry.includes('root'),n.id+' lacks a source root');
  }
 }
});
test('no fabricated live verification or achievement counters appear in contract',()=>{
 for(const n of nodes){assert.equal(n.verifiedLive,false);assert.equal(n.evidence,'curated');assert.equal(n.xp,undefined);assert.equal(n.achievement,undefined)}
});
test('lineage contract is immutable and all local outcome paths resolve',()=>{
 assert.ok(Object.isFrozen(context.AIFT_LINEAGE_NODES));
 for(const n of nodes){assert.ok(Object.isFrozen(n));if(n.kind==='fruit')assert.ok(fs.existsSync(path.join(base,n.url)))}
});

test('Atlas consumes the shared catalog and offers searchable accessible provenance',()=>{
 const html=fs.readFileSync(path.join(base,'atlas.html'),'utf8');
 for(const marker of ['src="lineage-data.js"','id="atlas-provenance"','id="atlas-lineage-search"','id="atlas-lineage-results"','id="atlas-lineage-trail"','aria-live="polite"'])assert.ok(html.includes(marker),marker);
 assert.match(html,/Repositories are roots, not fruits/);
});
test('Atlas distinguishes thematic spheres from product fruits',()=>{
 const html=fs.readFileSync(path.join(base,'atlas.html'),'utf8');
 assert.match(html,/<h2>Exploration Spheres<\/h2>/);
 assert.match(html,/These spheres are thematic navigation, not repositories or verified product fruits/);
 assert.doesNotMatch(html,/<h2>Living Fruits<\/h2>/);
});

test('shared evidence expeditions are mounted on both public exploration surfaces',()=>{
 const js=fs.readFileSync(path.join(base,'evidence-expeditions.js'),'utf8');
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const page of ['atlas.html','root-lineage.html']){
  const html=fs.readFileSync(path.join(base,page),'utf8');
  assert.match(html,/<script defer src="evidence-expeditions\.js"><\/script>/);
  assert.ok(html.indexOf('lineage-data.js')<html.indexOf('evidence-expeditions.js'));
 }
 assert.match(js,/aria-live/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(js,/No finished public product is verified/);
 assert.doesNotMatch(js,/localStorage|fetch\(|XMLHttpRequest|telemetry|Math\.random/);
});

test('shared expedition constellation offers searchable stage filters and reversible ancestry',()=>{
 const js=fs.readFileSync(path.join(base,'evidence-expeditions.js'),'utf8');
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const marker of ['q-constellation','q-stagebar','aiftQuestSearch','q-node-index','q-map','function showNode(id)','function renderIndex()','role=\"status\"','prefers-reduced-motion'])assert.ok(js.includes(marker),marker);
 assert.match(js,/stage==='all'\|\|n.kind===stage/);
 assert.match(js,/button.addEventListener\('click',\(\)=>showNode\(n.id\)\)/);
 assert.doesNotMatch(js,/fetch\s*\(|XMLHttpRequest|localStorage|Math\.random/);
});


test('spatial constellation uses deterministic curated ancestry and keyboard access',()=>{
 const js=fs.readFileSync(path.join(base,'evidence-expeditions.js'),'utf8');
 assert.doesNotThrow(()=>new vm.Script(js));
 for(const marker of ['function renderSky()','const positions=new Map()','const spatialNodes=new Map()','aria-label','q-sky-node','q-sky-line','keydown','e.key===\'Enter\'','renderSky();'])assert.ok(js.includes(marker),marker);
 assert.match(js,/positions\.set\('federation'/);
 assert.match(js,/svg\.setAttribute\('viewBox'/);
 assert.doesNotMatch(js,/Math\.random|fetch\s*\(|XMLHttpRequest|localStorage/);
});
test('shared expedition avoids duplicate global search IDs',()=>{
 const js=fs.readFileSync(path.join(base,'evidence-expeditions.js'),'utf8');
 assert.match(js,/const instanceId='aift-expedition-'/);
 assert.match(js,/instanceId\+'-search'/);
 assert.match(js,/explorer\.querySelector\('input\[type=search\]'\)/);
});
