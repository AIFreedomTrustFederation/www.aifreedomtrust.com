// Regression: a federation membership edge is not evidence of product contribution.
// This test exercises the actual explorer functions without a browser DOM.
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const html=readFileSync(new URL('../living-universe-explorer.html',import.meta.url),'utf8');
const manifest=JSON.parse(readFileSync(new URL('../data/living-universe.json',import.meta.url),'utf8'));
const start=html.indexOf('const provenanceRelations=');
const end=html.indexOf('function viewLink()',start);
assert.ok(start>=0&&end>start,'Explorer must expose its real lineage implementation');
const source=html.slice(start,end);
const context=vm.createContext({
  nodes:manifest.nodes,edges:manifest.edges,
  kind:n=>n.kind, safeUrl:raw=>{try{const u=new URL(raw);return u.protocol==='https:'?u.href:null}catch{return null}},
  isRepo:raw=>{const u=new URL(raw);return u.hostname==='github.com'&&u.pathname.split('/').filter(Boolean).length>=2}
});
vm.runInContext(source,context);
test('organization membership cannot establish provenance',()=>{
  const isolated={id:'unrelated-outcome',kind:'fruit',label:'Unrelated',url:'https://example.org/app',source:'https://example.org/evidence'};
  context.nodes=[...manifest.nodes,isolated];
  context.edges=[...manifest.edges,{from:'trunk',to:'unrelated-outcome',relation:'organizes',status:'curated'}];
  assert.equal(vm.runInContext("lineageTo('unrelated-outcome')",context),null);
  assert.equal(vm.runInContext("contributingRoots('unrelated-outcome').length",context),0);
  assert.equal(vm.runInContext("verifiedFruit(nodes.find(n=>n.id==='unrelated-outcome'))",context),false);
});
test('declared source routes remain explorable without treating repos as fruits',()=>{
  const sourceRoots=manifest.nodes.filter(n=>n.kind==='root');
  assert.ok(sourceRoots.length>0);
  for(const root of sourceRoots)assert.equal(vm.runInContext("verifiedFruit(nodes.find(n=>n.id==="+JSON.stringify(root.id)+"))",context),false);
  assert.ok(vm.runInContext("contributingRoots('b-public').some(n=>n.id==='r-portal')",context));
  assert.equal(vm.runInContext("contributingRoots('b-public').some(n=>n.id==='r-vps')",context),false);
});
