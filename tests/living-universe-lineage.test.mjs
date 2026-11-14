import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync(new URL('../living-universe-explorer.html',import.meta.url),'utf8');
test('root-to-outcome exploration is reversible and URL addressable',()=>{
 for(const marker of ['function lineageTo(id)','function focusNode(id)','function updateUrl()','searchParams.set(\'node\'','const initialNode=params.get(\'node\')','id="lineage"','id="share"']) assert.ok(html.includes(marker),marker);
 assert.match(html,/const roots=nodes\.filter\(n=>kind\(n\)==='root'\)/);
 assert.match(html,/edges\.filter\(e=>e\.from===last&&provenanceRelations\.has\(e\.relation\)\)/);
 assert.match(html,/No declared directed path from a repository root/);
});
test('spatial stage controls and keyboard equivalents exist',()=>{
 for(const marker of ["'aria-label':'Show '+stages[i]+' stage", "hit.addEventListener('keydown'", 'aria-label="Interactive federation constellation','prefers-reduced-motion:reduce']) assert.ok(html.includes(marker),marker);
});
