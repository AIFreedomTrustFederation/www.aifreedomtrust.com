import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questLens,QUEST_STAGES} from './living-universe-quest-lens.mjs';
const mission=(id,stage,gate,roots=[])=>({id,label:id+' milestone',stage,rootIds:roots,checks:['Review source provenance'],readiness:{gates:[{state:gate,label:'Evidence gate'}]}});
const plan={quests:[mission('source-root','root','declared',['source-root']),mission('skill-leaf','leaf','pending',['source-root']),mission('product-fruit','fruit','blocked',[])]};
test('filters by stage, root, search and readiness without inventing achievements',()=>{
 const lens=questLens(plan,{search:'source-root',gate:'pending'});
 assert.equal(lens.visible,1);assert.equal(lens.quests[0].id,'skill-leaf');
 assert.equal(lens.verifiedAchievements,0);
 assert.equal(questLens(plan,{stage:'fruit',gate:'blocked'}).quests[0].id,'product-fruit');
 assert.equal(questLens(plan,{stage:'root',gate:'blocked'}).visible,0);
});
test('six biological stages and no repository-as-fruit promotion',()=>{
 assert.deepEqual(QUEST_STAGES,['root','trunk','branch','leaf','flower','fruit']);
 assert.equal(questLens(plan).stages.find(s=>s.stage==='root').total,1);
 assert.equal(questLens(plan).stages.find(s=>s.stage==='fruit').total,1);
 assert.match(questLens(plan).caveat,/not completed quests/);
});
test('unrecognized filters fail closed and empty plans remain safe',()=>{
 assert.throws(()=>questLens(plan,{stage:'repository'}));
 assert.throws(()=>questLens(plan,{gate:'verified'}));
 assert.equal(questLens({quests:[]}).visible,0);
});
test('public observatory wires the accessible stage, search and gate controls',()=>{
 const html=readFileSync(new URL('./living-universe-2.html',import.meta.url),'utf8');
 assert.match(html,/import \{questLens,QUEST_STAGES\}/);
 assert.match(html,/questLensControls\.setAttribute\('role','search'\)/);
 assert.match(html,/questLensRail\.setAttribute\('aria-label'/);
 assert.match(html,/prefers-reduced-motion:reduce/);
 assert.match(html,/forced-colors:active/);
 assert.match(html,/No evidence missions match these filters/);
 assert.match(html,/zero verified achievements/);
});
