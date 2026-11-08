import assert from 'node:assert/strict';
import {projectLocalFederationTree,localExploration} from '../semantic-mobox-local-adapter.mjs';
const local={repositories:[
 {full_name:'AIFreedomTrustFederation/AIFT-OS',capabilities:['Conversation','Living Universe']},
 {full_name:'AIFreedomTrustFederation/VPS',capabilities:['Runtime checks']},
 {full_name:'AIFreedomTrustFederation/AIFT-OS',capabilities:['Conversation']},
 {full_name:'invalid repository',capabilities:['Unknown']}
]};
const projected=projectLocalFederationTree(local);
assert.equal(projected.source,'local-observation');
assert.equal(projected.attestation,'none');
assert.equal(projected.edges.length,0,'local membership cannot establish contribution');
assert.equal(projected.nodes.filter(n=>n.kind==='root').length,2);
assert.equal(projected.nodes.filter(n=>n.kind==='leaf').length,3);
assert.equal(projected.nodes.filter(n=>n.kind==='fruit').length,0);
assert.equal(projected.diagnostics.length,1);
const view=localExploration(local);
assert.equal(view.summary.repositories,2);
assert.equal(view.summary.capabilities,3);
assert.equal(view.summary.verifiedFruits,0);
assert.equal(view.search('living','leaf').length,1);
assert.equal(view.inspect('local-capability:repo:aifreedomtrustfederation/aift-os:Living%20Universe').evidenceGap,true);
assert.equal(view.inspect('repo:aifreedomtrustfederation/aift-os').roots.length,1);
assert.throws(()=>projectLocalFederationTree(null),TypeError);
assert.equal(projectLocalFederationTree({repositories:[{name:'https://evil.test/repo'}]}).nodes.length,1);
console.log('MoBox local projection bridge: passed');
