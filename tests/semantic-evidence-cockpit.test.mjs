import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld} from '../world-projection.mjs';
import {cockpitModel} from '../semantic-evidence-cockpit.mjs';
import {createNavigation} from '../living-universe-navigation.mjs';
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
// Reversible inspection must not manufacture source relationships or achievements.
const nav=createNavigation(all.nodes,[]);
if(all.nodes.length>1){
 const first=all.nodes[0].id,second=all.nodes[1].id;
 nav.inspect(first);nav.inspect(second);
 assert.equal(nav.back()?.id,first);
 assert.equal(nav.forward()?.id,second);
 assert.equal(nav.neighbors(first).length,0);
 assert.equal(nav.snapshot().visited.length,2);
 nav.reset();assert.equal(nav.snapshot().selected,null);
}
const cockpitSource=readFileSync(new URL('../semantic-evidence-cockpit.mjs',import.meta.url),'utf8');
const cockpitStyle=readFileSync(new URL('../semantic-evidence-cockpit.css',import.meta.url),'utf8');
for(const feature of ['cockpit-minimap','cockpit-trail','cockpit-journey','cockpit-gaps','navigation.back()','navigation.forward()','Source attestation'])assert(cockpitSource.includes(feature),'Missing integrated UXI feature: '+feature);
assert(cockpitStyle.includes('prefers-reduced-motion'));
assert(cockpitStyle.includes('forced-colors'));
assert(!cockpitSource.includes('localStorage'));
console.log('Evidence cockpit: biological stages, filters, attestation boundaries passed');
