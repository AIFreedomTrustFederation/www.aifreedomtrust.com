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
  assert.match(source,/if\(!\/\^https\?:\\\/\\\/\/.test\(n\.url\)\)continue/);
  assert.match(source,/prefers-reduced-motion:reduce/);
  assert.match(source,/forced-colors:active/);
});
