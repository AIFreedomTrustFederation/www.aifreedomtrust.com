// Static safety and accessibility contract for the local-only expedition interface.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../evidence-expedition.html',import.meta.url),'utf8');
test('expedition uses actual interchange validation and imported evidence',()=>{
 for(const marker of ["inspectLineageInterchange(value)","LINEAGE_SCHEMA","packet.edges","lineage(n.id)","BIOLOGICAL_STAGES","file.text()","No packet loaded"])assert.ok(html.includes(marker),marker);
});
test('no invented live status, remote fetch, or telemetry in expedition',()=>{
 assert.doesNotMatch(html,/XMLHttpRequest|sendBeacon|localStorage|sessionStorage|WebSocket/);
 // Published federation map is fetched only after an explicit visitor click.
 const calls=[...html.matchAll(/\bfetch\s*\(/g)];
 assert.equal(calls.length,1,'only the user-requested published map may be fetched');
 assert.match(html,/\$\('published'\)\.addEventListener\('click',async\(\)=>\{/);
 assert.match(html,/fetch\('\.\/data\/living-universe\.json',\{cache:'no-store'\}\)/);
 assert.match(html,/Candidate outcome only/);
 assert.match(html,/No external verification was performed/);
});
test('accessible semantic navigation and reduced motion remain present',()=>{
 for(const marker of ['prefers-reduced-motion:reduce','aria-pressed','aria-live="polite"','aria-label','Skip constellation','id="directory"','keydown'])assert.ok(html.includes(marker),marker);
 // Native HTML buttons already expose the button role; requiring role="button" is incorrect.
 assert.match(html,/<button\b/);
 assert.match(html,/elt\('button'/);
});
test('source repository is never converted into a certified fruit by this UI',()=>{
 assert.match(html,/n.kind==='fruit'/);
 assert.match(html,/No documented root-to-entity contribution route/);
 assert.doesNotMatch(html,/verifiedFruits\s*[:=]\s*[1-9]/);
});
