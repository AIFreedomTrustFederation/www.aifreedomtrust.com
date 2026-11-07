import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld} from '../world-projection.mjs';
import {readinessBoard} from '../world-evidence-readiness.mjs';
import {compareOutcomeEvidence} from '../world-evidence-comparison.mjs';

const world=projectWorld(JSON.parse(readFileSync(new URL('../data/living-universe.json',import.meta.url),'utf8')));
const outcomes=readinessBoard(world);
const js=readFileSync(new URL('../world-evidence-atlas.mjs',import.meta.url),'utf8');
const css=readFileSync(new URL('../world-evidence-atlas.css',import.meta.url),'utf8');
assert.match(js,/function renderComparison\(\)/);
assert.match(js,/compareOutcomeEvidence\(model,entries\[0\]\.id,entries\[1\]\.id\)/);
assert.match(js,/entry\.missing\.join\('; '\)/);
assert.match(js,/entry\.attestations\.length/);
assert.match(js,/navigate\(entry\.id\)/);
assert.match(js,/renderMissionMap\(\);renderComparison\(\);/);
assert.match(js,/At least two documented outcomes are needed/);
assert.match(css,/\.wea-comparison-grid/);
assert.match(css,/@media\(max-width:650px\)/);
assert.match(css,/:focus-visible/);
assert.doesNotMatch(js.slice(js.indexOf('function renderComparison()'),js.indexOf('const history=[]')),/fetch\(|localStorage|Math\.random|XP awarded|deploy\(/);
assert.equal(compareOutcomeEvidence(world,'nonexistent','nonexistent').valid,false);
if(outcomes.length>=2){
 const a=outcomes[0],b=outcomes[1];
 const result=compareOutcomeEvidence(world,a.id,b.id);
 assert.equal(result.valid,true);
 assert.equal(compareOutcomeEvidence(world,a.id,a.id).valid,false);
 const ids=new Set(a.roots.map(root=>root.id));
 assert.deepEqual(result.shared.map(root=>root.id),a.roots.filter(root=>b.roots.some(other=>other.id===root.id)).map(root=>root.id));
 assert.ok(result.shared.every(root=>ids.has(root.id)));
 assert.ok(result.uniqueFirst.every(root=>!b.roots.some(other=>other.id===root.id)));
 assert.ok(result.uniqueSecond.every(root=>!a.roots.some(other=>other.id===root.id)));
 assert.ok(result.gaps.every(gap=>[a.id,b.id].includes(gap.outcomeId)));
 assert.ok([a,b].every(outcome=>outcome.roots.every(root=>root.url.startsWith('https://github.com/'))));
}
console.log('Evidence comparison behavioral and static contracts passed: '+outcomes.length+' documented outcomes');
