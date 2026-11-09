import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld} from '../world-projection.mjs';
import {cockpitModel} from '../semantic-evidence-cockpit.mjs';
const manifest=JSON.parse(readFileSync(new URL('../data/living-universe.json',import.meta.url),'utf8'));
const world=projectWorld(manifest);
const all=cockpitModel(world);
assert.equal(all.total,all.nodes.length);
assert.equal(all.counts.reduce((sum,c)=>sum+c.total,0),all.total);
for(const kind of ['root','trunk','branch','leaf','flower','fruit']){
 const stage=cockpitModel(world,{stage:kind});
 assert(stage.nodes.every(n=>n.kind===kind));
}
assert(cockpitModel(world,{evidence:'attested'}).nodes.every(n=>n.evidence==='attested'));
assert(cockpitModel(world,{evidence:'evidence-needed'}).nodes.every(n=>n.evidence==='evidence-needed'));
assert(cockpitModel(world,{query:'no-match-unique-9f31'}).total===0);
for(const fruit of all.nodes.filter(n=>n.kind==='fruit'))assert(!fruit.destination||!new URL(fruit.destination).hostname.toLowerCase().endsWith('github.com'));
assert.throws(()=>cockpitModel(world,{stage:'repository'}),TypeError);
console.log('Evidence cockpit: biological stages, filters, attestation boundaries passed');
