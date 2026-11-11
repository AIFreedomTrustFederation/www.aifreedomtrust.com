import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../living-universe-explorer.html',import.meta.url),'utf8');
test('semantic theatre is a visible integrated journey with a real manifest source',()=>{
 for(const marker of ['id="journey-theatre"','id="journey-rail"','id="journey-stage-results"','function renderJourneyTheatre()','renderJourneyTheatre();',"fetch('./data/living-universe.json'","button.onclick=()=>{focusNode(n.id)"]) assert.ok(html.includes(marker),marker);
});
test('all six biological stages and evidence-gated fruit handling remain intact',()=>{
 for(const marker of ["['root','trunk','branch','leaf','flower','fruit']","kind(n)==='root'","verifiedFruit(n)?","No synthetic examples added.","Source repository · not an outcome","prefers-reduced-motion: reduce"]) assert.ok(html.includes(marker),marker);
});
test('semantic theatre does not introduce fake achievements or live metrics',()=>{
 assert.ok(html.includes("No synthetic examples added."));
 assert.ok(html.includes("not independently attested"));
 assert.ok(html.includes("members.length"));
});
