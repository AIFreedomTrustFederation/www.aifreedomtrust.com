import test from 'node:test';
import assert from 'node:assert/strict';
import {preparePublishedExpedition} from '../published-expedition-bridge.mjs';
import {inspectLineageInterchange} from '../world-lineage-interchange.mjs';
const root={id:'repo',kind:'root',label:'Repository',url:'https://github.com/AIFreedomTrustFederation/AIFT-OS'};
const fruit={id:'outcome',kind:'fruit',label:'Published application',url:'https://example.org/app'};
const proof='https://github.com/AIFreedomTrustFederation/AIFT-OS/blob/main/README.md';
const manifest=()=>({status:'curated-source-map',nodes:[root,fruit],edges:[{from:'repo',to:'outcome',relation:'produces',status:'curated',source:proof}]});
test('published curated relationship remains visible as a gap, never attested',()=>{
 const {packet,report}=preparePublishedExpedition(manifest());
 assert.equal(report.sourceRelationships,1);
 assert.equal(report.curatedOnlyRelationships,1);
 assert.equal(report.portableEvidenceEdges,0);
 assert.equal(packet.outcomes.length,0);
 assert.equal(inspectLineageInterchange(packet).valid,true);
});
test('only explicit source-backed contribution edges can create candidate lineage',()=>{
 const m=manifest();m.edges.push({from:'repo',to:'outcome',relation:'contributes-to',status:'source-backed',evidenceUrl:proof});
 const {packet,report}=preparePublishedExpedition(m);
 assert.equal(report.portableEvidenceEdges,1);
 assert.equal(report.curatedOnlyRelationships,1);
 assert.deepEqual(packet.outcomes,[{id:'outcome',url:'https://example.org/app',verification:'source-lineage-only'}]);
});
test('repository destinations cannot be outcomes even with source-backed edges',()=>{
 const m=manifest();m.nodes[1]={...fruit,url:'https://github.com/AIFreedomTrustFederation/AIFT-OS'};
 m.edges.push({from:'repo',to:'outcome',relation:'contributes-to',status:'source-backed',evidenceUrl:proof});
 assert.equal(preparePublishedExpedition(m).packet.outcomes.length,0);
});
test('reject arbitrary data masquerading as the curated source map',()=>{
 assert.throws(()=>preparePublishedExpedition({status:'live',nodes:[],edges:[]}),TypeError);
});
