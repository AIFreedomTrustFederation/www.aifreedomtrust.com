/* Source-backed cinematic canopy: real roots, branches and outcomes only. */
(()=>{'use strict';
const scene=document.querySelector('.world .tree'),host=document.querySelector('.world'),nodes=window.AIFT_LINEAGE_NODES;
if(!scene||!host||!Array.isArray(nodes))return;
const ns='http://www.w3.org/2000/svg',byId=new Map(nodes.map(n=>[n.id,n]));
const locations={federation:[500,650],genesis:[180,875],os:[300,900],runtime:[415,940],vps:[585,940],portal:[700,900],mobox:[820,875],tree:[280,340],control:[430,250],local:[580,270],infrastructure:[720,355],public:[510,165],manifest:[260,175],atlas:[430,100],constellations:[560,90],homepage:[690,160]};
const colors={root:'#fa858b',trunk:'#f5d68c',branch:'#6be6bd',leaf:'#8ec4ff',flower:'#c6a7ff',fruit:'#ffd39a'};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const layer=document.createElementNS(ns,'g');layer.setAttribute('class','living-source-layer');
layer.setAttribute('aria-label','Published source lineage projected onto the Tree');
const lines=document.createElementNS(ns,'g');lines.setAttribute('class','living-source-lines');
const dots=document.createElementNS(ns,'g');dots.setAttribute('class','living-source-dots');
layer.append(lines,dots);scene.append(layer);
const status=document.createElement('p');status.className='living-source-status';status.setAttribute('role','status');
status.textContent='Select a luminous source to reveal its documented lineage.';
host.append(status);
const safe=value=>{try{const u=new URL(value,location.href);return u.protocol==='https:'||u.origin===location.origin?u.href:null}catch{return null}};
const pathTo=node=>{const trail=[],seen=new Set();let current=node;while(current&&!seen.has(current.id)){trail.unshift(current);seen.add(current.id);current=byId.get(current.parent)}return trail};
// Every published node participates. Curated anchors preserve the existing composition;
// new records receive deterministic positions within their biological stage, not fake nodes.
const visible=nodes.filter(n=>n&&n.id&&colors[n.kind]);
const stageBands={root:[850,960],trunk:[650,650],branch:[280,410],leaf:[120,240],flower:[100,210],fruit:[90,190]};
for(const kind of Object.keys(stageBands)){
 const extra=visible.filter(n=>n.kind===kind&&!locations[n.id]).sort((a,b)=>a.id.localeCompare(b.id));
 extra.forEach((n,i)=>{
  const [top,bottom]=stageBands[kind],x=100+800*(i+1)/(extra.length+1);
  locations[n.id]=[Math.round(x),Math.round(top+(bottom-top)*(i%3)/2)];
 });
}
// A node may have an unpublished parent: never manufacture an edge in that case.
const projectedIds=new Set(visible.map(n=>n.id));
for(const node of visible){
 const p=locations[node.id],parent=byId.get(node.parent),q=parent&&projectedIds.has(parent.id)&&locations[parent.id];
 if(q){const edge=document.createElementNS(ns,'path');edge.setAttribute('d',`M${q[0]} ${q[1]} Q${(p[0]+q[0])/2} ${Math.min(p[1],q[1])-40} ${p[0]} ${p[1]}`);edge.setAttribute('class','living-source-edge');edge.dataset.from=parent.id;edge.dataset.to=node.id;lines.append(edge)}
 const anchor=document.createElementNS(ns,'a');anchor.setAttribute('class','living-source-node');anchor.dataset.node=node.id;
 const link=safe(node.url);if(link)anchor.setAttribute('href',link);else {anchor.setAttribute('tabindex','0');anchor.setAttribute('role','button');}
 anchor.setAttribute('aria-label',node.label+' · '+node.kind+' · view documented source');
 if(link&&new URL(link).origin!==location.origin){anchor.setAttribute('target','_blank');anchor.setAttribute('rel','noopener noreferrer')}
 const halo=document.createElementNS(ns,'circle');halo.setAttribute('cx',p[0]);halo.setAttribute('cy',p[1]);halo.setAttribute('r',18);halo.setAttribute('fill','transparent');
 const dot=document.createElementNS(ns,'circle');dot.setAttribute('cx',p[0]);dot.setAttribute('cy',p[1]);dot.setAttribute('r',node.kind==='fruit'?9:7);dot.setAttribute('fill',colors[node.kind]);
 const title=document.createElementNS(ns,'title');title.textContent=node.label+' · '+node.kind;
 anchor.append(halo,dot,title);
 anchor.addEventListener('pointerenter',()=>focus(node));
 anchor.addEventListener('focus',()=>focus(node));
 anchor.addEventListener('click',e=>{if(!link){e.preventDefault();focus(node)}});
 if(!link)anchor.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();focus(node)}});
 dots.append(anchor);
}
function focus(node){
 const trail=pathTo(node),ids=new Set(trail.map(n=>n.id));
 dots.querySelectorAll('[data-node]').forEach(a=>a.classList.toggle('living-source-active',ids.has(a.dataset.node)));
 lines.querySelectorAll('[data-from]').forEach(p=>p.classList.toggle('living-source-active',ids.has(p.dataset.from)&&ids.has(p.dataset.to)));
 status.textContent=node.label+' · '+node.kind+' · '+trail.map(n=>n.label).join(' → ')+(node.kind==='fruit'?' · documented visitor destination':' · source lineage');
}
host.addEventListener('pointerleave',()=>{if(!reduced.matches&&!host.contains(document.activeElement)){dots.querySelectorAll('.living-source-active').forEach(n=>n.classList.remove('living-source-active'));lines.querySelectorAll('.living-source-active').forEach(n=>n.classList.remove('living-source-active'))}});
})();