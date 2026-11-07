import test from 'node:test';
import assert from 'node:assert/strict';
import {projectWorld} from '../world-projection.mjs';
import {buildSemanticScene,semanticBreadcrumbs,exportSemanticScene} from '../world-semantic-scene.mjs';
const nodes=[
 {id:'repo',kind:'root',label:'Repository',url:'https://github.com/AIFreedomTrustFederation/sample'},
 {id:'federation',kind:'trunk',label:'Federation',url:'https://example.org/federation'},
 {id:'system',kind:'branch',label:'System',url:'https://example.org/system'},
 {id:'capability',kind:'leaf',label:'Capability',url:'https://example.org/capability'},
 {id:'work',kind:'flower',label:'Work in progress',url:'https://example.org/work'},
 {id:'product',kind:'fruit',label:'Real application',url:'https://example.org/app'}];
test('all six layers, deterministic positions and accessible text payload',()=>{
 const world=projectWorld({nodes,edges:[]});
 const a=buildSemanticScene(world),b=buildSemanticScene(world);
 assert.deepEqual(a,b);
 assert.deepEqual(a.layers,['root','trunk','branch','leaf','flower','fruit']);
 assert.equal(a.nodes.length,6);
 assert.equal(a.minimap.columns.length,6);
 assert.ok(a.nodes.every(n=>n.position.x>=0&&n.position.x<=1&&n.position.y>0&&n.position.y<1));
 assert.equal(a.summary.evidenceNeeded,6);
 assert.equal(a.summary.documentedOutcomes,1);
 assert.equal(a.nodes.find(n=>n.id==='repo').kind,'root');
 assert.equal(a.nodes.find(n=>n.id==='product').destination,'https://example.org/app');
});
test('structural membership cannot become source attestation',()=>{
 const world=projectWorld({nodes,edges:[{from:'repo',to:'system',relation:'implements'},{from:'system',to:'product',relation:'produces'}]});
 const scene=buildSemanticScene(world,{selectedId:'product'});
 assert.equal(scene.nodes.find(n=>n.id==='product').evidence,'evidence-needed');
 assert.deepEqual(scene.trail,[]);
 assert.ok(scene.edges.every(e=>!e.attested));
 assert.deepEqual(semanticBreadcrumbs(scene,'product').at(-1),{kind:'fruit',ids:['product']});
});
test('attested lineage creates reversible source trail without implying live health',()=>{
 const world=projectWorld({nodes,edges:[
  {from:'repo',to:'system',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/evidence/1'},
  {from:'system',to:'product',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/evidence/2'}]});
 const scene=buildSemanticScene(world,{selectedId:'product'});
 const product=scene.nodes.find(n=>n.id==='product');
 assert.deepEqual(product.sourceRoots,['repo']);
 assert.equal(product.evidence,'attested');
 assert.equal(scene.trail.length,1);
 assert.deepEqual(product.evidenceUrls,['https://example.org/evidence/1','https://example.org/evidence/2']);
 assert.equal(semanticBreadcrumbs(scene,'product')[0].ids[0],'repo');
 const exported=JSON.parse(exportSemanticScene(scene));
 assert.equal(exported.scope,'curated-read-only');
 assert.ok(!('xp' in exported));
 assert.ok(!('liveHealth' in exported));
});
test('search and stage filters never invent nodes or relationships',()=>{
 const world=projectWorld({nodes,edges:[]});
 const scene=buildSemanticScene(world,{layer:'fruit',search:'application'});
 assert.equal(scene.nodes.length,1);
 assert.equal(scene.nodes[0].id,'product');
 assert.equal(scene.edges.length,0);
 assert.throws(()=>buildSemanticScene(world,{layer:'repository'}),/Unknown biological layer/);
 assert.throws(()=>buildSemanticScene(world,{selectedId:'absent'}),/Unknown selected entity/);
});
