import test from 'node:test';
import assert from 'node:assert/strict';
import {projectWorld} from '../world-projection.mjs';
import {buildLineageRoutes} from '../semantic-lineage-paths.mjs';
const nodes=[
 {id:'repo',kind:'root',label:'Repository',url:'https://github.com/example/repo'},
 {id:'system',kind:'branch',label:'System',url:'https://example.org/system'},
 {id:'product',kind:'fruit',label:'Product',url:'https://example.org/product'}
];
const contribution=(from,to)=>({from,to,relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/proof/'+from+to});
test('traces attested root through system to actual outcome',()=>{
 const model=buildLineageRoutes(projectWorld({nodes,edges:[contribution('repo','system'),contribution('system','product')]}),'product');
 assert.deepEqual(model.routes[0].steps.map(x=>x.id),['repo','system','product']);
 assert.equal(model.routes[0].attestations.length,2);
 assert.equal(model.outcomeUrl,'https://example.org/product');
 assert.equal(model.scope,'curated-read-only');
});
test('structural membership cannot produce an evidence route',()=>{
 const model=buildLineageRoutes(projectWorld({nodes,edges:[{from:'repo',to:'product',relation:'member-of'}]}),'product');
 assert.equal(model.routes.length,0);assert.match(model.evidenceGap,/No attested/);
});
test('repository is root and never a product destination',()=>{
 const model=buildLineageRoutes(projectWorld({nodes,edges:[]}), 'repo');
 assert.equal(model.entityKind,'root');assert.equal(model.outcomeUrl,null);
});
test('invalid entities fail closed',()=>{
 assert.throws(()=>buildLineageRoutes(projectWorld({nodes,edges:[]}), 'missing'),/Unknown/);
});
