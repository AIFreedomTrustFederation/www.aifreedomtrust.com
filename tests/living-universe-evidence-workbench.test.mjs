import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../living-universe-explorer.html',import.meta.url),'utf8');
test('evidence workbench is integrated into the actual explorer',()=>{
 for(const id of ['evidence-workbench','workbench-outcome','workbench-routes','workbench-path','workbench-audit'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/renderWorkbench\(\);\$\('quests'\)/);
 assert.match(html,/function renderWorkbench\(\)/);
 assert.match(html,/outcomes=nodes\.filter\(n=>kind\(n\)==='fruit'\)/);
 assert.match(html,/allLineagePaths\(n\.id,4\)/);
});
test('outcome audit never promotes repository links or curated paths to independent verification',()=>{
 assert.match(html,/isProduct=!!destination&&!isRepo\(n\.url\)/);
 assert.match(html,/verifiedFruit\(n\)/);
 assert.match(html,/not independently certified/);
 assert.match(html,/Federation membership cannot fill this gap/);
 assert.match(html,/No example products have been substituted/);
});
test('route exploration reuses selected node and provides accessible controls',()=>{
 assert.match(html,/focusNode\(item\.id\)/);
 assert.match(html,/setAttribute\('aria-pressed'/);
 assert.match(html,/setAttribute\('aria-label','Inspect route step/);
 assert.match(html,/prefers-reduced-motion: reduce/);
 assert.match(html,/grid-template-columns:1fr/);
});
