import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld} from '../world-projection.mjs';
import {questBoardModel,mountQuestBoard} from '../semantic-evidence-quest-board.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const world=projectWorld(JSON.parse(read('../data/living-universe.json')));
const quests=questBoardModel(world);
assert.equal(quests.length,world.outcomes().length);
assert.equal(new Set(quests.map(q=>q.id)).size,quests.length);
assert.equal(mountQuestBoard({getElementById:()=>null}),false);
for(const quest of quests){
 assert.equal(world.inspect(quest.id).node.kind,'fruit');
 assert.ok(!quest.url?.startsWith('https://github.com/'));
 assert.equal(quest.rootCount,quest.roots.length);
 assert.equal(quest.evidenceCount,quest.evidence.length);
 assert.ok(quest.nextStep.length>20);
 if(quest.state==='evidence-attested'){
  assert.ok(quest.rootCount>0&&quest.evidenceCount>0);
  assert.ok(quest.roots.every(root=>world.inspect(root.id).node.kind==='root'));
 }else{
  assert.equal(quest.rootCount,0);
  assert.equal(quest.evidenceCount,0);
 }
}
const page=read('../semantic-scene.html');
const js=read('../semantic-evidence-quest-board.mjs');
const css=read('../semantic-evidence-quest-board.css');
assert.match(page,/id="evidence-quest-board"/);
assert.match(page,/semantic-evidence-quest-board.mjs/);
assert.match(page,/semantic-evidence-quest-board.css/);
assert.match(js,/aift:lineage-select/);
assert.match(js,/No achievements or readiness can be inferred/);
assert.match(css,/:focus-visible/);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/max-width:600px/);
console.log('Source-backed expedition board contract passed: '+quests.length+' outcomes');
