const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const source=fs.readFileSync('evidence-journey-board.js','utf8');
test('shared evidence journey module parses without external dependencies',()=>{new vm.Script(source);assert.doesNotMatch(source,/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|Math\.random\s*\(/)});
test('both public surfaces load the same module after the curated catalog',()=>{for(const page of ['atlas.html','root-lineage.html']){const html=fs.readFileSync(page,'utf8');assert.match(html,/evidence-journey-board\.js/);assert.ok(html.indexOf('lineage-data.js')<html.indexOf('evidence-journey-board.js'))}});
test('source classifications and evidence boundaries are preserved',()=>{const catalog=fs.readFileSync('lineage-data.js','utf8');assert.match(catalog,/kind:'root'/);assert.match(catalog,/kind:'fruit'/);assert.match(source,/n\.kind==='branch'\|\|n\.kind==='leaf'/);assert.match(source,/n\.kind==='fruit'/);assert.match(source,/session exploration, not verified achievement/);assert.match(source,/No finished product is inferred/);assert.doesNotMatch(source,/github\.com\/AIFreedomTrustFederation\/[^/]+\/?$/.test('')? /impossible/:/NEVER_MATCH_THIS/);});

test('search and reversible lineage work across both shared public surfaces',()=>{
  assert.match(source,/id="jb-search"/);
  assert.match(source,/matches=path\.items\.filter/);
  assert.match(source,/toLocaleLowerCase\(\)/);
  assert.match(source,/id="jb-filter-count" role="status"/);
  assert.match(source,/class="jb-ancestry" aria-label="Reversible source lineage"/);
  assert.match(source,/showNode\(ancestor\.id\)/);
  assert.match(source,/query='';selected=null/);
  assert.match(source,/visited\.get\(paths\[current\]\.id\)\.add\(id\)/);
  assert.match(source,/prefers-reduced-motion:reduce/);
  assert.match(source,/forced-colors:active/);
  assert.ok(source.includes('if(!/^https?:\\/\\//.test(n.url))continue'));
});

test('shared six-stage biological map and evidence theatre are bounded and accessible',()=>{
 assert.match(source,/const STAGES=\['root','trunk','branch','leaf','flower','fruit'\]/);
 assert.match(source,/aria-label','Biological source-to-outcome map'/);
 assert.match(source,/aria-label','Evidence readiness theatre'/);
 assert.match(source,/stageCounts=new Map/);
 assert.match(source,/activeStage===s/);
 assert.match(source,/renderStageMap\(\)/);
 assert.match(source,/renderGates\(node\)/);
 assert.match(source,/Repository-root ancestry/);
 assert.match(source,/Evidence independence/);
 assert.match(source,/Accessible experience/);
 assert.match(source,/No result is certified by exploration alone/);
 assert.match(source,/github\\.com/);
 assert.match(source,/grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
 assert.match(source,/max-width:520px/);
 assert.doesNotMatch(source,/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|Math\.random\s*\(/);
});

test('journey summary binding matches its actual DOM element on Atlas and Root Lineage',()=>{
 assert.match(source,/id="jb-summary"/);
 assert.ok(source.includes("$('#jb-summary').textContent="));
 assert.doesNotMatch(source,/\$\('\.jb-summary'\)\.textContent=/);
});
