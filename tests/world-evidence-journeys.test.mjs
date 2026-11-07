import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld} from '../world-projection.mjs';
import {evidenceItinerary,evidenceTrail,QUEST_STAGES} from '../world-evidence-journeys.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const world=projectWorld(JSON.parse(read('../data/living-universe.json')));
assert.deepEqual(QUEST_STAGES.map(q=>q.kind),['root','branch','leaf','fruit']);
const quests=evidenceItinerary(world);
assert.equal(quests.length,4);
assert.ok(quests.every(q=>q.candidates.every(c=>world.inspect(c.id)?.node.kind===q.kind)));
assert.ok(quests.every(q=>q.candidates.every(c=>c.evidence!=='completed'&&c.evidence!=='earned')));
for(const outcome of world.outcomes()){
 const trail=evidenceTrail(world,outcome.node.id);
 assert.equal(Boolean(trail.paths.length),outcome.outcomeVerified);
 for(const path of trail.paths){
  assert.equal(path.root.kind,'root');
  assert.equal(path.steps[0].id,path.root.id);
  assert.equal(path.steps.at(-1).id,outcome.node.id);
  assert.ok(path.steps.slice(1).every(step=>/^https:\/\//.test(step.evidenceUrl)));
 }
}
assert.ok(evidenceTrail(world,'unknown-node').gap);
const js=read('../world-evidence-atlas.mjs'),css=read('../world-evidence-atlas.css');
for(const token of ['evidenceItinerary(model)','evidenceTrail(model,id)','wea-expedition','wea-trail-panel','history.splice(cursor+1)','navigate(candidate.id)','renderExpedition()','aria-label'])assert.ok(js.includes(token),'missing journey behavior: '+token);
for(const token of ['wea-quest-grid','wea-journey-step','focus-visible','max-width:600px'])assert.ok(css.includes(token),'missing expedition style: '+token);
assert.ok(!js.includes('localStorage')&&!js.includes('Math.random'));
console.log('Evidence expedition contracts passed:',quests.length,'stages,',world.outcomes().length,'documented outcomes');
