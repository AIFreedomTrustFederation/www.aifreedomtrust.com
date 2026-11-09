import test from 'node:test';
import assert from 'node:assert/strict';
import {projectLocalFederationTree,localExploration} from '../semantic-mobox-local-adapter.mjs';

test('MoBox tree nodes are projected as roots, not fruits',()=>{
 const result=projectLocalFederationTree({nodes:[
  {id:'federation-root',kind:'federation'},
  {id:'repo-1',kind:'repository',name:'AIFreedomTrustFederation/AIFT-OS',capabilities:['local UI']},
  {id:'layer-1',kind:'layer'}]});
 assert.equal(result.nodes.filter(n=>n.kind==='root').length,1);
 assert.equal(result.nodes.filter(n=>n.kind==='fruit').length,0);
 assert.equal(result.nodes.filter(n=>n.kind==='leaf').length,1);
 assert.equal(result.edges.length,0);
 assert.equal(localExploration({nodes:[{kind:'repository',name:'AIFreedomTrustFederation/AIFT-OS'}]}).summary.verifiedFruits,0);
});

test('short local names cannot become fabricated GitHub identities',()=>{
 const result=projectLocalFederationTree({nodes:[{kind:'repository',name:'AIFT-OS'}]});
 assert.equal(result.nodes.filter(n=>n.kind==='root').length,0);
 assert.ok(result.diagnostics.some(d=>d.includes('Unrecognized')));
});

test('legacy repository-list shape remains supported',()=>{
 const result=projectLocalFederationTree({repositories:[{full_name:'AIFreedomTrustFederation/AIFT-OS'}]});
 assert.equal(result.nodes.filter(n=>n.kind==='root').length,1);
});
