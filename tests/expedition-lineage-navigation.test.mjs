import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../evidence-expedition.html',import.meta.url),'utf8');
test('lineage navigation remains local, reversible and accessible',()=>{
 for(const marker of ['id="breadcrumbs"','aria-label="Lineage breadcrumbs"','aria-current','activeRoute=path.slice(0,i+1)','id="minimap"','id="dossier"','renderJourney()']) assert.ok(html.includes(marker),marker);
});
test('evidence dossier explicitly preserves epistemic limits',()=>{
 assert.match(html,/NOT independently verified/);
 assert.match(html,/Contribution evidence:/);
 assert.match(html,/navigator.clipboard\?\.writeText/);
 assert.match(html,/activeRoute=\[\]/);
});
test('responsive and reduced motion alternatives remain available',()=>{
 assert.match(html,/@media\(max-width:600px\)/);
 assert.match(html,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(html,/Accessible entity directory/);
});
