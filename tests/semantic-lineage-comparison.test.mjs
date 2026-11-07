import test from 'node:test';
import assert from 'node:assert/strict';
import {projectWorld} from '../world-projection.mjs';
import {buildSemanticScene} from '../world-semantic-scene.mjs';
import {compareLineage} from '../semantic-lineage-comparison.mjs';
const nodes=[{id:'r1',kind:'root',label:'Root One',url:'https://github.com/example/one'},{id:'r2',kind:'root',label:'Root Two',url:'https://github.com/example/two'},{id:'a',kind:'fruit',label:'Product A',url:'https://example.org/a'},{id:'b',kind:'fruit',label:'Product B',url:'https://example.org/b'}];
const edge=(from,to)=>({from,to,relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/evidence/'+from+to});
test('comparison uses only attested contributing roots',()=>{
 const scene=buildSemanticScene(projectWorld({nodes,edges:[edge('r1','a'),edge('r1','b'),edge('r2','b')]}));
 const c=compareLineage(scene,'a','b');
 assert.deepEqual(c.shared,['r1']);assert.deepEqual(c.onlyLeft,[]);assert.deepEqual(c.onlyRight,['r2']);
 assert.equal(c.scope,'curated-read-only');assert.equal(c.left.kind,'fruit');
});
test('structural edges never count as shared contributions',()=>{
 const scene=buildSemanticScene(projectWorld({nodes,edges:[{from:'r1',to:'a',relation:'contains'},{from:'r1',to:'b',relation:'contains'}]}));
 const c=compareLineage(scene,'a','b');assert.deepEqual(c.shared,[]);assert.deepEqual(c.evidenceNeeded,['a','b']);
});
test('missing entities fail closed and input remains unmodified',()=>{
 const scene=buildSemanticScene(projectWorld({nodes,edges:[]}));
 assert.throws(()=>compareLineage(scene,'a','missing'),/documented entities/);
 assert.equal(scene.nodes.length,4);
});
