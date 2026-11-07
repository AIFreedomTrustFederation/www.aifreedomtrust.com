import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld} from '../world-projection.mjs';
import {buildEvidenceMissions,exportEvidenceMissions} from '../world-evidence-mission-planner.mjs';
const root={id:'root',kind:'root',label:'Repository',url:'https://github.com/AIFreedomTrustFederation/example'};
const branch={id:'branch',kind:'branch',label:'System',url:'https://example.org/system'};
const fruit={id:'fruit',kind:'fruit',label:'Deliverable',url:'https://example.org/product'};
test('structural membership cannot unlock attested missions',()=>{
 const missions=buildEvidenceMissions(projectWorld({nodes:[root,branch,fruit],edges:[
  {from:'root',to:'branch',relation:'implements'},{from:'branch',to:'fruit',relation:'produces'}
 ]}));
 const outcome=missions.find(m=>m.id==='fruit');
 assert.equal(outcome.openSteps,2);
 assert.deepEqual(outcome.rootIds,[]);
 assert.deepEqual(outcome.evidence,[]);
 assert.equal(outcome.structural.length,1);
});
test('attested root-to-outcome chain exposes exact evidence URLs without XP',()=>{
 const missions=buildEvidenceMissions(projectWorld({nodes:[root,branch,fruit],edges:[
  {from:'root',to:'branch',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/evidence/a'},
  {from:'branch',to:'fruit',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/evidence/b'}
 ]}));
 const outcome=missions.find(m=>m.id==='fruit');
 assert.equal(outcome.openSteps,0);
 assert.deepEqual(outcome.rootIds,['root']);
 assert.deepEqual(outcome.evidence,['https://example.org/evidence/a','https://example.org/evidence/b']);
 const exported=JSON.parse(exportEvidenceMissions(missions));
 assert.equal(exported.scope,'curated-offline-projection');
 assert.ok(!('xp' in exported.missions[0]));
 assert.ok(!('live' in exported.missions[0]));
});
test('integration preserves existing studio and exposes filtered mission export',()=>{
 const source=readFileSync(new URL('../world-evidence-studio.mjs',import.meta.url),'utf8');
 const css=readFileSync(new URL('../world-evidence-studio.css',import.meta.url),'utf8');
 assert.match(source,/renderMissions\(visible\)/);
 assert.match(source,/exportEvidenceMissions\(filtered\)/);
 assert.match(source,/Inspect source lineage/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/wes-mission/);
});
