/* AIFT Living Universe shared read-only lineage contract. Curated edges are not runtime dependencies. */
(function(global){'use strict';
const nodes=[
{id:'federation',label:'Integrated Federation',kind:'trunk',desc:'The shared federation connecting independently maintained source systems.',url:docs},
{id:'genesis',label:'AIFT-Genesis',kind:'root',parent:'federation',desc:'Canonical Tree of Emergence, schemas and constitution.',url:org+'AIFT-Genesis'},
{id:'os',label:'AIFT-OS',kind:'root',parent:'federation',desc:'Federation control plane and registry source.',url:org+'AIFT-OS'},
{id:'runtime',label:'AIFT-Runtime',kind:'root',parent:'federation',desc:'Local execution, health and synchronization source.',url:org+'AIFT-Runtime'},
{id:'vps',label:'VPS',kind:'root',parent:'federation',desc:'Cloud application and infrastructure source.',url:org+'VPS'},
{id:'portal',label:'www.aifreedomtrust.com',kind:'root',parent:'federation',desc:'Source repository for the public federation portal.',url:org+'www.aifreedomtrust.com'},
{id:'mobox',label:'mobox',kind:'root',parent:'federation',desc:'MoBox source repository; no verified standalone outcome is asserted here.',url:org+'mobox'},
{id:'tree',label:'Tree of Emergence',kind:'branch',parent:'genesis',desc:'Canonical knowledge model and Tree Explorer roadmap.',url:org+'AIFT-Genesis/blob/main/manifests/tree.manifest.json'},
{id:'control',label:'Federation Operations',kind:'branch',parent:'os',desc:'Operator-facing federation capabilities under development.',url:org+'AIFT-OS'},
{id:'local',label:'Local Runtime',kind:'branch',parent:'runtime',desc:'Execution and synchronization capabilities.',url:org+'AIFT-Runtime'},
{id:'infrastructure',label:'App Infrastructure',kind:'branch',parent:'vps',desc:'Infrastructure and application deployment foundations.',url:org+'VPS'},
{id:'public',label:'Public Exploration',kind:'branch',parent:'portal',desc:'Public navigation, knowledge and interactive atlas.',url:'atlas.html'},
{id:'manifest',label:'Genesis Manifest',kind:'leaf',parent:'tree',desc:'Documented canonical graph manifest; not a finished consumer product.',url:org+'AIFT-Genesis/blob/main/manifests/tree.manifest.json'},
{id:'atlas',label:'Federation Atlas',kind:'fruit',parent:'public',desc:'A navigable public atlas page available to visitors.',url:'atlas.html'},
{id:'constellations',label:'Constellations',kind:'fruit',parent:'public',desc:'A public repository constellation exploration page; its radial spokes are curated, not canonical graph edges.',url:'constellations.html'},
{id:'homepage',label:'Federation Website',kind:'fruit',parent:'public',desc:'The public-facing Federation homepage.',url:'index.html'}
];
const kinds=new Set(['root','trunk','branch','leaf','flower','fruit']);
const ids=new Set();
for(const node of nodes){
 if(!node.id||ids.has(node.id)||!kinds.has(node.kind)||!node.label||!node.url)throw new Error('Invalid or duplicate lineage node: '+node.id);
 ids.add(node.id);
 if(node.kind==='root' && !/^https:\/\/github\.com\/AIFreedomTrustFederation\//.test(node.url))throw new Error('Root lacks GitHub source: '+node.id);
 if(node.kind==='fruit' && /github\.com\/AIFreedomTrustFederation\/[^/]+\/?$/.test(node.url))throw new Error('Repository incorrectly classified as fruit: '+node.id);
}
if(nodes.filter(n=>n.kind==='trunk').length!==1)throw new Error('Expected one shared trunk');
for(const node of nodes){if(node.parent&&!ids.has(node.parent))throw new Error('Missing parent: '+node.id);let current=node;const seen=new Set();while(current.parent){if(seen.has(current.id))throw new Error('Lineage cycle: '+node.id);seen.add(current.id);current=nodes.find(n=>n.id===current.parent);}}
const frozen=Object.freeze(nodes.map(n=>Object.freeze({...n,evidence:'curated',verifiedLive:false})));
global.AIFT_LINEAGE_NODES=frozen;
})(typeof window==='undefined'?globalThis:window);
