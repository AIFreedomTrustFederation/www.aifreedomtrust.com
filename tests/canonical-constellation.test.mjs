import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld} from '../world-projection.mjs';
import {validateWorld,contributionRoots,CONTRIBUTION_RELATIONS,MEMBERSHIP_RELATIONS,KINDS,contributionTrails} from '../world-constellation-contract.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const model=JSON.parse(read('../data/living-universe.json'));
assert.deepEqual(validateWorld(model),{valid:true,errors:[]});
assert.deepEqual(contributionRoots(model,'f-portal').roots.map(n=>n.id),projectWorld(model).lineage('f-portal').roots.map(n=>n.id));
assert.ok(contributionRoots(model,'f-portal').paths.some(p=>p[0]==='www.aifreedomtrust.com'&&p.at(-1)==='Federation public portal'));
assert.equal(contributionRoots(model,'b-operator').roots.length,0,'organizational membership is not contribution');
assert.ok(model.edges.some(e=>MEMBERSHIP_RELATIONS.includes(e.relation)));
assert.deepEqual(CONTRIBUTION_RELATIONS,['contributes-to']);
assert.deepEqual(KINDS,['root','trunk','branch','leaf','flower','fruit']);
const missing=structuredClone(model);
missing.edges.find(e=>e.relation==='contributes-to').evidenceUrl=undefined;
assert.equal(validateWorld(missing).valid,false,'unattested contribution is rejected');
const structural=structuredClone(model);
structural.edges=structural.edges.filter(e=>e.relation!=='contributes-to');
assert.equal(contributionRoots(structural,'f-portal').roots.length,0,'structure cannot manufacture a fruit lineage');
const html=read('../living-universe.html'),ui=read('../world-constellation.mjs'),css=read('../world-constellation.css');
for(const token of ['id="world-constellation"','world-constellation.mjs','world-constellation.css','id="federation-flightdeck"','federation-flightdeck.mjs'])assert.ok(html.includes(token),'lost portal surface '+token);
for(const token of ['world-constellation-contract.mjs','historyIndex','cos-mini','cos-index','cos-journey','Evidence Expedition','setSelected(root.id)','Open documented outcome'])assert.ok(ui.includes(token),'missing spatial behavior '+token);
assert.ok(ui.includes("'stroke-dasharray':attested?'none':'5 7'"));
for(const token of ['cos-spatial-nav','Pan left','Pan right','Pan up','Pan down','cameraX','cameraY','windowWidth','windowHeight','scale=1.4'])assert.ok(ui.includes(token),'missing semantic camera or minimap behavior '+token);
assert.ok(css.includes('.cos-spatial-nav button:focus-visible'),'camera controls need visible keyboard focus');
assert.ok(css.includes('min-height:2.75rem'),'camera controls need touch targets');
assert.ok(css.includes('prefers-reduced-motion')&&css.includes('focus-visible'));
assert.ok(!ui.includes('localStorage'),'no fabricated persistent achievements');
for(const token of ['cos-evidence-trail','Attested source journey','Review attestation','setSelected(step.id)','trail.append(button)','proof.href=edge.evidenceUrl'])assert.ok(ui.includes(token),'missing interactive attestation trail '+token);
for(const token of ['.cos-evidence-trail', '.cos-trail-step', '.cos-trail-proof', 'min-height:44px', '.cos-evidence-trail :focus-visible'])assert.ok(css.includes(token),'missing accessible provenance trail style '+token);
assert.ok(contributionRoots(model,'f-portal').paths.length>0,'source journey requires real attested paths');
const trails=contributionTrails(model,'f-portal');
assert.ok(trails.length>0,'outcome needs attested trail');
for(const trail of trails){
 assert.equal(trail.ids[0],'r-portal');
 assert.equal(trail.ids.at(-1),'f-portal');
 assert.equal(trail.edges.length,trail.ids.length-1);
 for(let i=0;i<trail.edges.length;i++){
  assert.equal(trail.edges[i].from,trail.ids[i]);
  assert.equal(trail.edges[i].to,trail.ids[i+1]);
  assert.ok(trail.edges[i].evidenceUrl.startsWith('https://'),'attestation must use HTTPS');
 }
}
const labelCollision=structuredClone(model);
labelCollision.nodes.find(n=>n.id==='b-operator').label=labelCollision.nodes.find(n=>n.id==='r-portal').label;
assert.deepEqual(contributionTrails(labelCollision,'f-portal').map(t=>t.ids),trails.map(t=>t.ids),'duplicate labels must not change lineage');
assert.ok(ui.includes('contributionTrails(model,selected)'),'spatial UI must consume exact-ID trails');
assert.ok(!ui.includes('nodes.find(n=>n.label===path[i])'),'never resolve provenance by nonunique labels');
console.log('Canonical constellation integration passed');
