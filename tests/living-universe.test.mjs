// Run: node tests/living-universe.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const graph=JSON.parse(readFileSync(new URL('../data/living-universe.json',import.meta.url),'utf8'));
const html=readFileSync(new URL('../living-universe.html',import.meta.url),'utf8');
const ids=new Set(graph.nodes.map(n=>n.id));
assert.equal(ids.size,graph.nodes.length,'duplicate node IDs');
const allowed=new Set(['root','trunk','branch','leaf','flower','fruit']);
for(const n of graph.nodes){
 assert.ok(allowed.has(n.kind),n.id+' invalid kind');
 assert.match(n.url,/^https:\/\//,n.id+' must have HTTPS source');
 assert.ok(n.label,n.id+' missing label');
 if(n.kind==='root')assert.match(n.url,/github\.com\/AIFreedomTrustFederation\//,'root needs repository URL');
 if(n.kind==='fruit')assert.ok(!n.url.includes('github.com/'),'fruit must link to actual experience, not source repository');
}
for(const edge of graph.edges){
 assert.ok(ids.has(edge.from)&&ids.has(edge.to),'dangling edge');
 assert.notEqual(edge.from,edge.to,'self edge');
}
const incoming=new Map(graph.nodes.map(n=>[n.id,[]]));
for(const e of graph.edges)incoming.get(e.to).push(e.from);
for(const fruit of graph.nodes.filter(n=>n.kind==='fruit')){
 const visited=new Set(),queue=[fruit.id];let rooted=false;
 while(queue.length){const id=queue.shift();if(visited.has(id))continue;visited.add(id);const n=graph.nodes.find(n=>n.id===id);if(n.kind==='root')rooted=true;queue.push(...incoming.get(id))}
 assert.ok(rooted,fruit.id+' fruit lacks source-root lineage');
}
const contributions=new Set(['contributes-to']);
for(const e of graph.edges)assert.ok(['member-of','federation-membership','organizes','organizational-branch','implements','produces','documents','contributes-to',...contributions].includes(e.relation),'unknown edge relation');
function sourcedRoots(id){
 const seen=new Set(),queue=[id],roots=new Set();
 while(queue.length){const current=queue.shift();if(seen.has(current))continue;seen.add(current);const node=graph.nodes.find(n=>n.id===current);if(node.kind==='root')roots.add(current);for(const edge of graph.edges)if(edge.to===current&&contributions.has(edge.relation)&&edge.status==='source-backed'&&/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(edge.evidenceUrl||edge.source||''))queue.push(edge.from)}
 return roots;
}
assert.deepEqual([...sourcedRoots('f-portal')],['r-portal'],'public fruit must not inherit unrelated member repositories');
for(const marker of ['function lineage(id)','function renderPath(id)','function renderMilestones()','id="path-steps"','id="milestones"','sourceRelations.has(edge.relation)'])assert.ok(html.includes(marker),'missing provenance UI: '+marker);
for(const marker of ['id="search"','id="kind"','id="world"','id="universe-index"','prefers-reduced-motion','role="status"','function lineage(id)','data/living-universe.json'])assert.ok(html.includes(marker),'missing explorer contract: '+marker);
for(const marker of ['id="journey-heading"','id="journey-ribbon"','id="journey-cards"','id="journey-prev"','id="journey-next"','function showLayer(index)','root','trunk','branch','leaf','fruit','prefers-reduced-motion'])assert.ok(html.includes(marker),'missing journey contract: '+marker);
assert.equal(graph.nodes.filter(n=>n.kind==='fruit'&&n.url.includes('github.com/')).length,0,'repository incorrectly classified as fruit');
console.log('Living Universe contract OK:',graph.nodes.length,'nodes,',graph.edges.length,'edges');

const bridge=readFileSync(new URL('../genesis-bridge.js',import.meta.url),'utf8');
for(const marker of ['id="genesis-bridge"','src="genesis-bridge.js"','genesis-grid','genesis-controls'])assert.ok(html.includes(marker),'missing Genesis bridge UI: '+marker);
for(const marker of ["living-atlas.manifest.json","data.status !== 'canonical-draft'","data.treeMappings.some","e.visibility==='public'","m.atlasEntityId===entity.id","textContent=entity.label","noopener noreferrer","no live status claimed"])assert.ok(bridge.includes(marker),'missing Genesis evidence boundary: '+marker);
assert.ok(!bridge.includes('innerHTML'),'Genesis entity content must never be injected as HTML');
console.log('Genesis bridge contract OK: canonical draft validated, public-only, source-linked');

for(const marker of ['id="world-quests"','id="quest-grid"','id="quest-status"','The Rootkeeper','The Systems Cartographer','The Knowledge Gardener','The Fruit Steward','visited.add(next.id)','No verified CI or product achievements are inferred.']) {
 assert.ok(html.includes(marker),'missing evidence expedition contract: '+marker);
}
