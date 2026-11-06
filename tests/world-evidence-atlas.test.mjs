import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld,LAYERS} from '../world-projection.mjs';
import {evidenceTopology,topologyPositions} from '../world-evidence-topology.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const model=projectWorld(JSON.parse(read('../data/living-universe.json')));
assert.deepEqual(LAYERS,['root','trunk','branch','leaf','flower','fruit']);
assert.ok(model.nodes.every(n=>n.kind!=='root'||n.url.startsWith('https://github.com/')));
assert.ok(model.nodes.every(n=>n.kind!=='fruit'||!n.url.startsWith('https://github.com/')));
for(const outcome of model.outcomes()){assert.equal(outcome.outcomeVerified,outcome.lineage.roots.length>0);for(const path of outcome.lineage.paths){assert.equal(path.root.kind,'root');assert.ok(path.edges.every(e=>e.relation==='contributes-to'&&e.status==='source-backed'&&/^https:\/\//.test(e.evidenceUrl||e.source)))}}
const html=read('../living-universe.html'),js=read('../world-evidence-atlas.mjs'),css=read('../world-evidence-atlas.css');
for(const token of ['id="world-evidence-atlas"','world-evidence-atlas.mjs','world-evidence-atlas.css','world-constellation.mjs','federation-flightdeck.mjs'])assert.ok(html.includes(token),'missing additive integration: '+token);
for(const token of ['projectWorld','model.outcomes()','model.inspect(','model.search(','aria-current','aria-pressed','View attestation','Evidence gap','No achievement awarded','noopener noreferrer','cache:'])assert.ok(js.includes(token),'missing evidence atlas behavior: '+token);
assert.ok(!js.includes('localStorage')&&!js.includes('Math.random'),'no fabricated progress');
assert.ok(css.includes('prefers-reduced-motion')&&css.includes('focus-visible')&&css.includes('max-width:440px'),'responsive accessibility');
console.log('Evidence Atlas contracts passed: '+model.nodes.length+' nodes, '+model.outcomes().length+' documented outcomes');

for(const node of model.nodes){
 const topology=evidenceTopology(model,node.id);
 assert.ok(topology.nodes.some(n=>n.id===node.id),'selected entity must remain visible');
 assert.ok(topology.nodes.every(n=>model.inspect(n.id)),'only documented nodes');
 assert.ok(topology.edges.every(e=>topology.nodes.some(n=>n.id===e.from)&&topology.nodes.some(n=>n.id===e.to)),'no phantom edges');
 assert.ok(topology.edges.every(e=>!e.attested||(e.relation==='contributes-to'&&e.status==='source-backed'&&/^https:\/\//.test(e.evidenceUrl||e.source))),'only attested contribution edges rendered solid');
 const positions=topologyPositions(topology);
 assert.equal(positions.size,topology.nodes.length);
 assert.ok([...positions.values()].every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
}
const topologySource=read('../world-evidence-topology.mjs');
assert.ok(js.includes('renderTopology(id)')&&js.includes('wea-topology-index')&&js.includes('aria-label'));
assert.ok(css.includes('wea-edge-attested')&&css.includes('wea-edge-structural')&&css.includes('wea-topology-viewport'));
assert.ok(!topologySource.includes('fetch(')&&!topologySource.includes('Math.random'));
console.log('Evidence topology regression contracts passed');
