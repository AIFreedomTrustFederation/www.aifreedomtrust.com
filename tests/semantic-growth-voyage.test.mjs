import test from 'node:test';import assert from 'node:assert/strict';
import {buildVoyage,STAGES} from '../semantic-growth-voyage.mjs';
import {projectWorld} from '../world-projection.mjs';
const url='https://example.org/evidence';
const world=projectWorld({nodes:[
{id:'repo',kind:'root',label:'Repository',url:'https://github.com/example/repo'},
{id:'system',kind:'branch',label:'System',url:'https://example.org/system'},
{id:'outcome',kind:'fruit',label:'Product',url:'https://example.org/product'},
{id:'unverified',kind:'leaf',label:'Unverified capability',url:'https://example.org/leaf'}],
edges:[{from:'repo',to:'system',relation:'contributes-to',status:'source-backed',evidenceUrl:url},
{from:'system',to:'outcome',relation:'contributes-to',status:'source-backed',evidenceUrl:url},
{from:'repo',to:'unverified',relation:'documents'}]});
test('all six biological chapters retain stage identity',()=>{const c=buildVoyage(world);assert.deepEqual(c.map(x=>x.kind),STAGES);assert.equal(c.length,6)});
test('repository roots never become product fruits',()=>{const c=buildVoyage(world);assert.deepEqual(c[0].nodes.map(n=>n.id),['repo']);assert.deepEqual(c[5].nodes.map(n=>n.id),['outcome']);assert.equal(c[0].nodes[0].destination,null)});
test('structural membership does not certify source contribution',()=>{const c=buildVoyage(world);assert.equal(c[3].nodes[0].evidence,'evidence-needed');assert.equal(c[3].evidenceNeeded,1)});
test('fruit destination and evidence are independently grounded',()=>{const fruit=buildVoyage(world)[5].nodes[0];assert.equal(fruit.destination,'https://example.org/product');assert.deepEqual(fruit.roots,['repo']);assert.deepEqual(fruit.proofs,[url])});
