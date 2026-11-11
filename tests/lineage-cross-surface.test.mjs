// Offline, dependency-free producer/consumer acceptance gate for the merged lineage contract.
// Run: node --test tests/lineage-cross-surface.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {exportLineageInterchange,inspectLineageInterchange,LINEAGE_SCHEMA} from '../world-lineage-interchange.mjs';
import {projectLocalFederationTree} from '../semantic-mobox-local-adapter.mjs';

const repo='https://github.com/AIFreedomTrustFederation/AIFT-OS';
const proof='https://github.com/AIFreedomTrustFederation/AIFT-OS/blob/main/README.md';
const model=()=>({
 nodes:[
  {id:'repo:aift-os',kind:'root',label:'AIFT-OS',url:repo},
  {id:'federation',kind:'trunk',label:'Federation'},
  {id:'capability:atlas',kind:'leaf',label:'Atlas capability'},
  {id:'product:demo',kind:'fruit',label:'Illustrative deliverable',url:'https://example.org/demo'},
  {id:'repo:isolated',kind:'root',label:'Isolated source',url:'https://github.com/AIFreedomTrustFederation/VPS'}
 ],
 edges:[
  {from:'repo:aift-os',to:'federation',relation:'contributes-to',status:'source-backed',evidenceUrl:proof},
  {from:'federation',to:'capability:atlas',relation:'contributes-to',status:'source-backed',evidenceUrl:proof},
  {from:'capability:atlas',to:'product:demo',relation:'contributes-to',status:'source-backed',evidenceUrl:proof},
  {from:'repo:isolated',to:'product:demo',relation:'member-of',status:'source-backed',evidenceUrl:proof}
 ]
});
const clone=x=>JSON.parse(JSON.stringify(x));
test('wire roundtrip retains directed evidence, biological roots and unverified outcome',()=>{
 const packet=clone(exportLineageInterchange(model()));
 assert.equal(packet.schema,LINEAGE_SCHEMA);
 assert.deepEqual(packet.edges.map(e=>e.from),['repo:aift-os','federation','capability:atlas']);
 assert.deepEqual(packet.outcomes,[{id:'product:demo',url:'https://example.org/demo',verification:'source-lineage-only'}]);
 assert.deepEqual(inspectLineageInterchange(packet),{valid:true,roots:2,sourceEdges:3,attestation:'not-independently-verified'});
});
test('unreachable fruit cannot be promoted to a deliverable',()=>{
 const graph=model();graph.edges=graph.edges.filter(e=>e.to!=='product:demo');
 const packet=exportLineageInterchange(graph);
 assert.equal(packet.outcomes.length,0);
 assert.equal(inspectLineageInterchange(clone(packet)).valid,true);
});
test('forged outcome, missing endpoint, and elevated attestation fail closed',()=>{
 const packet=exportLineageInterchange(model());
 for(const mutate of [
  p=>p.outcomes[0].verification='verified',
  p=>p.attestation='independently-verified',
  p=>p.edges[0].to='missing',
  p=>p.edges[0].evidenceUrl='javascript:alert(1)',
  p=>p.nodes[0].kind='fruit',
  p=>p.outcomes.push({...p.outcomes[0]})
 ]){const candidate=clone(packet);mutate(candidate);assert.equal(inspectLineageInterchange(candidate).valid,false);}
});
test('observed MoBox repository tree never invents contribution edges or fruits',()=>{
 const local=projectLocalFederationTree({nodes:[
  {kind:'repository',name:'AIFreedomTrustFederation/AIFT-OS',capabilities:['Atlas']},
  {kind:'product',name:'Unverified product'}
 ]});
 assert.equal(local.nodes.find(n=>n.kind==='root')?.url,repo);
 assert.equal(local.nodes.filter(n=>n.kind==='fruit').length,0);
 assert.deepEqual(local.edges,[]);
 assert.equal(local.attestation,'none');
 assert.ok(local.diagnostics.length);
});
test('source map refuses repository-as-fruit outcomes',()=>{
 const graph=model();graph.nodes.find(n=>n.id==='product:demo').url=repo;
 const packet=exportLineageInterchange(graph);
 assert.equal(packet.outcomes.length,0);
 assert.equal(inspectLineageInterchange(packet).valid,true);
});

test('repository host variants never qualify as fruits while Pages deliverables remain candidates',()=>{
 for(const url of [
  'https://github.com/AIFreedomTrustFederation/AIFT-OS',
  'https://www.github.com/AIFreedomTrustFederation/AIFT-OS',
  'https://github.com/AIFreedomTrustFederation/AIFT-OS/tree/main',
  'https://github.com.evil.example/AIFreedomTrustFederation/AIFT-OS'
 ]) {
  const graph=model();graph.nodes.find(n=>n.id==='product:demo').url=url;
  const packet=exportLineageInterchange(graph);
  assert.equal(packet.outcomes.length,url.includes('evil.example')?1:0,url);
  assert.equal(inspectLineageInterchange(packet).valid,true);
 }
 const graph=model();graph.nodes.find(n=>n.id==='product:demo').url='https://aifreedomtrustfederation.github.io/www.aifreedomtrust.com/';
 const packet=exportLineageInterchange(graph);
 assert.equal(packet.outcomes.length,1);
 assert.equal(inspectLineageInterchange(packet).valid,true);
});
test('credentialed and malformed HTTPS evidence cannot count toward source-backed progress',()=>{
 for(const url of [
  'https://operator:secret@github.com/AIFreedomTrustFederation/AIFT-OS',
  'https://github.com./AIFreedomTrustFederation/AIFT-OS',
  'https://github.com:bad/AIFreedomTrustFederation/AIFT-OS',
  'javascript:alert(1)'
 ]) {
  const graph=model();graph.edges[0].evidenceUrl=url;
  const packet=exportLineageInterchange(graph);
  assert.equal(packet.edges.length,2,url);
  const forged=exportLineageInterchange(model());
  forged.edges[0].evidenceUrl=url;
  assert.equal(inspectLineageInterchange(forged).valid,false,url);
 }
});
