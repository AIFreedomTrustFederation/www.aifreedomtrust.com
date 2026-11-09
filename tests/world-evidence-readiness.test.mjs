import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectWorld} from '../world-projection.mjs';
import {readinessBoard} from '../world-evidence-readiness.mjs';
const manifest=JSON.parse(readFileSync(new URL('../data/living-universe.json',import.meta.url),'utf8'));
const world=projectWorld(manifest);
const board=readinessBoard(world);
assert.equal(board.length,world.outcomes().length);
for(const item of board){
 assert.ok(item.url.startsWith('https://')&&!item.url.startsWith('https://github.com/'));
 assert.equal(item.readiness,item.roots.length?'source-lineage-attested':'source-lineage-unverified');
 assert.ok(item.attestations.every(e=>e.url.startsWith('https://')));
 assert.ok(item.roots.every(r=>r.url.startsWith('https://github.com/')));
 assert.ok(item.roots.length||item.missing.length);
 assert.match(item.note,/not a live CI/);
}
const root={id:'repo',kind:'root',label:'Code',url:'https://github.com/example/repo'};
const fruit={id:'app',kind:'fruit',label:'Product',url:'https://example.org/app'};
const gap=readinessBoard(projectWorld({nodes:[root,fruit],edges:[]}));
assert.equal(gap[0].readiness,'source-lineage-unverified');
assert.equal(gap[0].attestations.length,0);
const verified=readinessBoard(projectWorld({nodes:[root,fruit],edges:[{from:'repo',to:'app',relation:'contributes-to',status:'source-backed',evidenceUrl:'https://example.org/proof'}]}));
assert.equal(verified[0].readiness,'source-lineage-attested');
assert.equal(verified[0].attestations[0].url,'https://example.org/proof');
console.log('Evidence readiness contracts passed for '+board.length+' documented outcomes');
