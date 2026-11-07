import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld} from '../world-projection.mjs';
import {evidenceQuests} from '../world-evidence-quests.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const model=projectWorld(JSON.parse(read('../data/living-universe.json')));
const quests=evidenceQuests(model);
assert.equal(quests.length,model.outcomes().length);
assert.equal(new Set(quests.map(q=>q.id)).size,quests.length);
for(const quest of quests){
 const node=model.inspect(quest.id).node;
 assert.equal(node.kind,'fruit','repositories cannot become quests as fruits');
 assert.ok(!quest.url?.startsWith('https://github.com/'),'repository must not be outcome');
 assert.ok(['evidence-attested','evidence-needed'].includes(quest.state));
 assert.ok(quest.caveat.includes('not live CI'));
 if(quest.state==='evidence-attested'){
  assert.ok(quest.roots.length>0&&quest.evidence.length>0);
  assert.ok(quest.roots.every(r=>model.inspect(r.id).node.kind==='root'));
  assert.ok(quest.evidence.every(url=>url.startsWith('https://')));
 }else{
  assert.equal(quest.evidence.length,0);
  assert.equal(quest.roots.length,0);
 }
}
const js=read('../world-evidence-atlas.mjs'),css=read('../world-evidence-atlas.css');
for(const token of ['evidenceQuests(model)','renderQuestAtlas()','Explore lineage','Inspect ','wea-quest-atlas'])assert.ok(js.includes(token),'missing integrated quest UI '+token);
for(const token of ['wea-quest-atlas-grid','focus-visible','prefers-reduced-motion','max-width:540px'])assert.ok(css.includes(token),'missing quest accessibility '+token);
assert.ok(!read('../world-evidence-quests.mjs').includes('Math.random'));
console.log('Evidence Quest Atlas contracts passed: '+quests.length+' documented outcomes, '+quests.filter(q=>q.state==='evidence-attested').length+' attested.');
