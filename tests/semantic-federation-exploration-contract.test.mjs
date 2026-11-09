import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildExplorationIndex,BIOLOGICAL_STAGES,SPECTRAL_TOKENS} from '../semantic-federation-exploration-contract.mjs';
const manifest=JSON.parse(readFileSync(new URL('../data/living-universe.json',import.meta.url),'utf8'));
const index=buildExplorationIndex(manifest);
assert.deepEqual(index.stages.map(s=>s.kind),BIOLOGICAL_STAGES);
assert.equal(index.stages.reduce((sum,s)=>sum+s.entities.length,0),manifest.nodes.length);
assert.ok(index.search('portal').length>0);
assert.ok(index.search('', 'root').every(n=>n.kind==='root'));
assert.ok(index.lineage('does-not-exist')===null);
assert.ok(index.outcomes.every(o=>o.entity.kind==='fruit'));
assert.ok(index.outcomes.every(o=>!o.verified||o.roots.every(r=>r.kind==='root')));
assert.ok(index.outcomes.every(o=>!o.verified||!/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(o.entity.url)));
assert.ok(Object.values(SPECTRAL_TOKENS).every(v=>/^#[0-9a-f]{6}$/i.test(v)));
const fake={nodes:[{id:'repo',kind:'root',url:'https://github.com/a/b'},{id:'product',kind:'fruit',url:'https://example.org/app'}],edges:[{from:'repo',to:'product',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/proof'}]};
assert.equal(buildExplorationIndex(fake).outcomes[0].verified,true);
fake.edges[0].status='unverified';
assert.equal(buildExplorationIndex(fake).outcomes[0].verified,false);
fake.edges[0].status='source-backed';
fake.nodes[1].url='https://github.com/a/b';
assert.equal(buildExplorationIndex(fake).outcomes[0].verified,false);
fake.nodes[1].url='javascript:alert(1)';
assert.equal(buildExplorationIndex(fake).outcomes[0].verified,false);
assert.throws(()=>buildExplorationIndex({nodes:[fake.nodes[0],fake.nodes[0]],edges:[]}),/duplicate/);
console.log('Federation exploration contract: passed');

const multiHop={nodes:[
 {id:'source',kind:'root',url:'https://github.com/example/source'},
 {id:'service',kind:'branch',url:'https://example.org/service'},
 {id:'release',kind:'fruit',url:'https://example.org/release'}
],edges:[
 {from:'source',to:'service',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/commit'},
 {from:'service',to:'release',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/build'}
]};
const journeyIndex=buildExplorationIndex(multiHop);
assert.deepEqual(journeyIndex.journey('release')[0].nodes.map(n=>n.id),['source','service','release']);
assert.deepEqual(journeyIndex.journey('release')[0].evidence.map(e=>e.evidenceUrl),['https://example.org/commit','https://example.org/build']);
assert.equal(journeyIndex.outcomes[0].verified,true);
multiHop.edges[1].status='unverified';
assert.equal(buildExplorationIndex(multiHop).journey('release').length,0);
assert.equal(buildExplorationIndex(multiHop).outcomes[0].verified,false);
multiHop.edges[1].status='source-backed';
multiHop.edges[1].evidenceUrl='javascript:alert(1)';
assert.equal(buildExplorationIndex(multiHop).journey('release').length,0);
multiHop.edges[1].evidenceUrl='https://example.org/build';
multiHop.edges.push({from:'release',to:'source',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/cycle'});
assert.equal(buildExplorationIndex(multiHop).journey('release').length,1,'cycles must not create extra paths');
