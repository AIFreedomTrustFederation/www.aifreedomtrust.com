import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld,LAYERS} from '../world-projection.mjs';
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
