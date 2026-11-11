import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../living-universe-explorer.html',import.meta.url),'utf8');
test('atlas is part of the existing page and does not replace navigation',()=>{
 for(const marker of ['id="atlas-section"','id="atlas"','id="tree"','id="directory"','id="journeys"','id="quests"','id="mini"']) assert.ok(html.includes(marker),marker);
});
test('routes are directed and exclude organizational membership',()=>{
 assert.match(html,/const provenanceRelations=new Set\(\['implements','produces','contributes','depends-on','derived-from','evidences'\]\)/);
 assert.match(html,/function allLineagePaths\(id,limit=4\)/);
 assert.match(html,/if\(!path\.includes\(e\.to\)\)/);
 assert.match(html,/if\(found\.length>=limit\)return/);
 assert.match(html,/No declared contributing root-to-outcome path/);
});
test('atlas links are evidence gated and source steps are accessible',()=>{
 assert.match(html,/if\(verifiedFruit\(outcome\)\)\{/);
 assert.match(html,/a\.href=safeUrl\(outcome\.url\)/);
 assert.match(html,/b\.setAttribute\('aria-label','Inspect '/);
 assert.match(html,/focusNode\(id\)/);
 assert.match(html,/prefers-reduced-motion: reduce/);
 assert.match(html,/not independent certification/);
});
