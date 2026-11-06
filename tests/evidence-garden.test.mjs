import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=JSON.parse(read('data/living-universe.json'));
const page=read('living-universe.html'),module=read('evidence-garden.js');
const ids=new Set(data.nodes.map(n=>n.id));
assert.equal(ids.size,data.nodes.length);
const allowed=new Set(['root','trunk','branch','leaf','flower','fruit']);
for(const n of data.nodes){assert.ok(allowed.has(n.kind));assert.match(n.url,/^https:\/\//);if(n.kind==='root')assert.match(n.url,/^https:\/\/github\.com\/AIFreedomTrustFederation\/[^/]+\/?$/);if(n.kind==='fruit')assert.doesNotMatch(n.url,/^https:\/\/github\.com\/AIFreedomTrustFederation\/[^/]+\/?$/)}
for(const e of data.edges){assert.ok(ids.has(e.from)&&ids.has(e.to));assert.ok(e.relation)}
function hasRoot(id,edges,seen=new Set()){if(seen.has(id))return false;seen.add(id);if(data.nodes.find(n=>n.id===id).kind==='root')return true;return edges.filter(e=>e.to===id&&e.relation==='contributes-to'&&e.status==='source-backed'&&/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(e.evidenceUrl||e.source||'')).some(e=>hasRoot(e.from,edges,new Set(seen)))}
assert.ok(hasRoot('f-portal',data.edges),'source-backed portal path must be present');
assert.equal(hasRoot('f-portal',data.edges.filter(e=>e.relation!=='contributes-to')),false,'structural edges must not establish contribution');
assert.equal(hasRoot('f-portal',data.edges.map(e=>e.relation==='contributes-to'?{...e,status:'curated'}:e)),false,'unattested edges must not establish contribution');
for(const marker of ['id="evidence-garden"','data-garden-list','data-garden-detail','data-garden-filter','data-garden-search','evidence-garden.js'])assert.ok(page.includes(marker),'missing '+marker);
for(const marker of ['aria-pressed','noopener noreferrer','source lineage not established','No evidence claims','prefers-reduced-motion']){assert.ok((module+page).includes(marker),'missing '+marker)}
console.log('Evidence Garden contract passed:',data.nodes.length,'nodes,',data.edges.length,'edges');
