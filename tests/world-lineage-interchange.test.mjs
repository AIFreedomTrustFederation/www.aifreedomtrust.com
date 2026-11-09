import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {exportLineageInterchange,inspectLineageInterchange,LINEAGE_SCHEMA} from '../world-lineage-interchange.mjs';
const model=JSON.parse(readFileSync(new URL('../data/living-universe.json',import.meta.url)));
const packet=exportLineageInterchange(model);
assert.equal(packet.schema,LINEAGE_SCHEMA);
assert.equal(packet.attestation,'not-independently-verified');
assert.ok(packet.nodes.some(n=>n.kind==='root'));
assert.ok(packet.nodes.some(n=>n.kind==='fruit'));
assert.ok(packet.edges.every(e=>e.relation==='contributes-to'&&e.evidenceUrl.startsWith('https://')));
assert.ok(packet.outcomes.every(o=>packet.nodes.find(n=>n.id===o.id)?.kind==='fruit'));
assert.ok(packet.outcomes.every(o=>o.verification==='source-lineage-only'));
assert.equal(inspectLineageInterchange(packet).valid,true);
const missing={nodes:[{id:'r',kind:'root',label:'Root',url:'https://github.com/example/root'},{id:'f',kind:'fruit',label:'Unproven',url:'https://example.org/product'}],edges:[{from:'r',to:'f',relation:'member-of',status:'curated',evidenceUrl:'https://example.org'}]};
assert.deepEqual(exportLineageInterchange(missing).outcomes,[]);
assert.throws(()=>exportLineageInterchange({nodes:[missing.nodes[0],missing.nodes[0]],edges:[]}),/duplicate/);
const forged={...packet,attestation:'independently-verified'};
assert.deepEqual(inspectLineageInterchange(forged),{valid:false,reason:'attestation'});
assert.equal(inspectLineageInterchange(packet).sourceEdges,packet.edges.length);
assert.equal(inspectLineageInterchange({...packet,edges:[...packet.edges,{from:'missing',to:packet.nodes[0].id,relation:'contributes-to',evidenceUrl:'https://example.org/evidence'}]}).valid,false);
assert.equal(inspectLineageInterchange({...packet,outcomes:[{id:packet.nodes[0].id,url:'https://example.org',verification:'source-lineage-only'}]}).valid,false);
// A real producer packet must retain its directed edges across the wire boundary.
const fixture=exportLineageInterchange({nodes:[
  {id:'repo',kind:'root',label:'Source',url:'https://github.com/example/source'},
  {id:'capability',kind:'leaf',label:'Feature'},
  {id:'product',kind:'fruit',label:'Delivered application',url:'https://example.org/app'}
],edges:[
  {from:'repo',to:'capability',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/evidence/1'},
  {from:'capability',to:'product',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/evidence/2'}
]});
assert.equal(inspectLineageInterchange(JSON.parse(JSON.stringify(fixture))).sourceEdges,2);
assert.deepEqual(fixture.outcomes,[{id:'product',url:'https://example.org/app',verification:'source-lineage-only'}]);
console.log('Portable lineage interchange contracts passed');
