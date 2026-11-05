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
for(const marker of ['id="search"','id="kind"','id="world"','id="universe-index"','prefers-reduced-motion','role="status"','function parents(id)','data/living-universe.json'])assert.ok(html.includes(marker),'missing explorer contract: '+marker);
console.log('Living Universe contract OK:',graph.nodes.length,'nodes,',graph.edges.length,'edges');
