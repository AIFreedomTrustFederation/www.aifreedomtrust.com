import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../living-universe-explorer.html',import.meta.url),'utf8');
test('cinematic route shares manifest-backed workbench selection',()=>{
 for(const id of ['lineage-cinema','cinema-graph','cinema-directory','cinema-status']) assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/function renderLineageCinema\(\)/);
 assert.match(html,/allLineagePaths\(outcome\.id,4\)/);
 assert.match(html,/const path=paths\[workbenchRoute\]\|\|\[\]/);
 assert.match(html,/renderLineageCinema\(\);/);
});
test('cinematic route preserves evidence and biological boundaries',()=>{
 assert.match(html,/kind\(n\)==='fruit'/);
 assert.match(html,/No declared root-to-outcome path/);
 assert.match(html,/Federation membership does not imply contribution/);
 assert.match(html,/curated evidence only/);
 assert.match(html,/kind\(node\)/);
});
test('graph and directory provide equivalent keyboard-accessible inspection',()=>{
 assert.match(html,/role:'button',tabindex:'0'/);
 assert.match(html,/e\.key==='Enter'\|\|e\.key===' '/);
 assert.match(html,/focusNode\(id\)/);
 assert.match(html,/directory\.append\(b\)/);
 assert.match(html,/lineage-cinema\{grid-template-columns:1fr\}/);
 assert.match(html,/prefers-reduced-motion:reduce/);
});
