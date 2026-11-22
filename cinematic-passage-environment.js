/* Cinematic passage: atmospheric layers follow the actual Tree camera and published growth stage.
   Decorative light is never represented as a source, product, or achievement. */
(()=>{'use strict';
const world=document.querySelector('.world'),tree=world?.querySelector('svg.tree'),voyage=world?.querySelector('.pilgrimage');
if(!world||!tree||!voyage)return;
const NS='http://www.w3.org/2000/svg';
const stages=['root','trunk','branch','leaf','flower','fruit'];
const make=(tag,attrs)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e};
const environment=make('g',{'class':'passage-environment','aria-hidden':'true','pointer-events':'none'});
// The environment uses the source SVG's real coordinate system, including nonzero origins.
const initialBox=(tree.getAttribute('viewBox')||'0 0 1000 1000').trim().split(/[\s,]+/).map(Number);
const bounds=initialBox.length===4&&initialBox.every(Number.isFinite)&&initialBox[2]>0&&initialBox[3]>0?initialBox:[0,0,1000,1000];
const [originX,originY,fullW,fullH]=bounds;
const halo=make('ellipse',{'class':'passage-halo',cx:originX+fullW*.5,cy:originY+fullH*.48,rx:fullW*.32,ry:fullH*.33});
const horizon=make('path',{'class':'passage-horizon',d:`M ${originX} ${originY+fullH*.755} Q ${originX+fullW*.5} ${originY+fullH*.665} ${originX+fullW} ${originY+fullH*.755}`});
const motes=make('g',{'class':'passage-motes'});
// Decorative only: deterministic proportional positions, not lineage records.
for(let i=0;i<16;i++){const x=originX+fullW*(.09+((i*137)%820)/1000),y=originY+fullH*(.1+((i*211)%800)/1000);
 motes.append(make('circle',{'class':'passage-mote',cx:x,cy:y,r:Math.max(1,Math.min(fullW,fullH)/1000)*(1.5+(i%3))}))}
environment.append(halo,horizon,motes);
const defs=tree.querySelector('defs')||make('defs',{});
if(!defs.parentNode)tree.insertBefore(defs,tree.firstChild);
const gradient=tree.querySelector('#passage-spectrum')||make('linearGradient',{id:'passage-spectrum',x1:'0',y1:'1',x2:'1',y2:'0'});
if(!gradient.parentNode){
 for(const [offset,color] of [['0%','#e87674'],['48%','#67dfb2'],['100%','#74a8fa']])
  gradient.append(make('stop',{offset,'stop-color':color}));
 defs.append(gradient);
}
const parallax=make('g',{'class':'passage-parallax','aria-hidden':'true'});
for(let i=0;i<3;i++){
 const depth=make('path',{'class':'passage-depth passage-depth-'+i,d:`M ${originX} ${originY+fullH*(.66+i*.1)} Q ${originX+fullW*.5} ${originY+fullH*(.51+i*.09)} ${originX+fullW} ${originY+fullH*(.66+i*.1)}`});
 parallax.append(depth);
}
environment.append(parallax);
// Provenance currents use only published parent relationships and projected SVG source positions.
// Missing parents, unprojected nodes, and repository-as-fruit claims produce no decorative edge.
const lineage=Array.isArray(window.AIFT_LINEAGE_NODES)?window.AIFT_LINEAGE_NODES:[];
const indexed=new Map(lineage.filter(n=>n&&typeof n.id==='string').map(n=>[n.id,n]));
const currents=make('g',{'class':'passage-currents','aria-hidden':'true','pointer-events':'none'});
const currentEdges=make('g',{'class':'passage-current-edges'});
const currentNodes=make('g',{'class':'passage-current-nodes'});
currents.append(currentEdges,currentNodes);
environment.append(currents);
function projectedPositions(){
 const positions=new Map();
 for(const node of tree.querySelectorAll('.living-source-node[data-node]')){
  const dot=node.querySelector('circle[cx][cy]');
  if(!dot)continue;
  const x=Number(dot.getAttribute('cx')),y=Number(dot.getAttribute('cy'));
  if(Number.isFinite(x)&&Number.isFinite(y))positions.set(node.dataset.node,{x,y});
 }
 return positions;
}
let currentSignature='';
function updateCurrents(stage){
 const positions=projectedPositions();
 const ids=[...positions.keys()].filter(id=>indexed.has(id)).sort();
 // Recompute when a projected source moves, not merely when its ID appears.
 // Coordinates are part of the source projection contract and may change during responsive reflow.
 const signature=stage+'|'+ids.map(id=>{const p=positions.get(id);const r=indexed.get(id);return id+':'+p.x+','+p.y+':'+(r?.parent||'')}).join('|');
 if(signature===currentSignature)return;
 currentSignature=signature;
 currentEdges.replaceChildren();currentNodes.replaceChildren();
 drawArchitecture(positions,ids,stage);
 const maxEdges=96,maxNodes=48;
 let edges=0,nodes=0;
 for(const id of ids){
  const record=indexed.get(id),point=positions.get(id);
  if(!record||!point)continue;
  if(nodes<maxNodes&&record.kind===stage){
   currentNodes.append(make('circle',{'class':'passage-source-glimmer',cx:point.x,cy:point.y,r:Math.max(2,Math.min(fullW,fullH)*.004)}));
   nodes++;
  }
  if(edges>=maxEdges||!record.parent)continue;
  const parent=indexed.get(record.parent),start=positions.get(record.parent);
  if(!parent||!start)continue;
  // Roots are source systems; an outcome is never inferred from a repository URL.
  const d=`M ${start.x} ${start.y} Q ${(start.x+point.x)/2} ${(start.y+point.y)/2-Math.min(fullW,fullH)*.025} ${point.x} ${point.y}`;
  currentEdges.append(make('path',{'class':'passage-current-edge',d,'data-growth':record.kind||''}));
  edges++;
 }
 currents.dataset.activeStage=stage;
}

// Dimensional growth architecture: the visual canopy is grown exclusively from
// projected, published source relationships. No synthetic leaves or outcomes.
const architecture=make('g',{'class':'passage-architecture','aria-hidden':'true','pointer-events':'none'});
const architectureBranches=make('g',{'class':'passage-architecture-branches'});
const architectureCrowns=make('g',{'class':'passage-architecture-crowns'});
architecture.append(architectureBranches,architectureCrowns);
environment.append(architecture);
const growthPalette={root:'#ef8175',trunk:'#e5c48e',branch:'#69d9b7',leaf:'#74dfb0',flower:'#bb9af5',fruit:'#f4bf88'};
function drawArchitecture(positions,ids,stage){
 architectureBranches.replaceChildren();architectureCrowns.replaceChildren();
 const visible=ids.filter(id=>positions.has(id)&&indexed.has(id));
 const maxBranches=96,maxCrowns=64;
 let branches=0,crowns=0;
 for(const id of visible){
  const record=indexed.get(id),point=positions.get(id);
  if(!record||!point||!growthPalette[record.kind])continue;
  const parent=record.parent?indexed.get(record.parent):null;
  const from=parent?positions.get(parent.id):null;
  if(from&&branches<maxBranches){
   const midY=(from.y+point.y)/2;
   const path=make('path',{'class':'passage-growth-branch',
    d:`M ${from.x} ${from.y} C ${from.x} ${midY} ${point.x} ${midY} ${point.x} ${point.y}`,
    stroke:growthPalette[record.kind],'data-kind':record.kind});
   architectureBranches.append(path);branches++;
  }
  if(crowns<maxCrowns&&['leaf','flower','fruit'].includes(record.kind)){
   // A crown is a halo around a real projected record, never a new node.
   const crown=make('circle',{'class':'passage-growth-crown',
    cx:point.x,cy:point.y,r:Math.max(8,Math.min(fullW,fullH)*.014),
    stroke:growthPalette[record.kind],'data-kind':record.kind});
   architectureCrowns.append(crown);crowns++;
  }
 }
 architecture.dataset.activeStage=stage;
}

const firstArt=[...tree.children].find(el=>!['title','desc','defs'].includes(el.tagName.toLowerCase()));
tree.insertBefore(environment,firstArt||null);
const lens=document.createElement('div');lens.className='passage-lens';lens.setAttribute('aria-hidden','true');
lens.innerHTML='<span class="passage-lens-orbit"></span><span class="passage-lens-core"></span>';
world.append(lens);
const caption=document.createElement('div');caption.className='passage-caption';caption.setAttribute('role','status');
caption.setAttribute('aria-live','off');caption.textContent='THE LIVING TREE · DOCUMENTED LINEAGE';
world.append(caption);
const query=typeof matchMedia==='function'?matchMedia.bind(window):()=>({matches:false,addEventListener(){}});
const motion=query('(prefers-reduced-motion: reduce)'),data=query('(prefers-reduced-data: reduce)');
let queued=false;
function refresh(){
 queued=false;
 const stage=stages.includes(voyage.dataset.stage)?voyage.dataset.stage:'root';
 world.dataset.passageStage=stage;
 updateCurrents(stage);
 const raw=tree.getAttribute('viewBox')||'0 0 1000 1000';
 const [x,y,w,h]=raw.trim().split(/[\s,]+/).map(Number);
 if([x,y,w,h].every(Number.isFinite)&&w>0&&h>0){
  const centerX=x+w/2,centerY=y+h/2;
  const shiftX=Math.max(-1,Math.min(1,(centerX-(originX+fullW/2))/(fullW/2)));
  const shiftY=Math.max(-1,Math.min(1,(centerY-(originY+fullH/2))/(fullH/2)));
  world.style.setProperty('--passage-x',String(shiftX));
  world.style.setProperty('--passage-y',String(shiftY));
  world.style.setProperty('--passage-scale',String(Math.max(.4,Math.min(2.5,fullW/w))));
  world.style.setProperty('--passage-focus',String(Math.max(0,Math.min(1,1-w/fullW))));
 }
 caption.textContent='THE LIVING TREE · '+stage.toUpperCase()+' · PUBLISHED LINEAGE';
 world.classList.toggle('passage-static',motion.matches||data.matches);
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(refresh)}}
// Source projection may finish after this module initializes or move its coordinates.
 // Observe only source-node changes; mutations to our own decorative SVG are ignored.
 const sourceObserver=new MutationObserver(changes=>{
  for(const change of changes){
   const target=change.target;
   if(target.nodeType===1&&(target.closest?.('.passage-environment')||target.closest?.('.pilgrimage-route-layer')))continue;
   if(target.nodeType===1&&target.closest?.('.living-source-node')){schedule();return}
   if(change.type==='childList'&&[...change.addedNodes,...change.removedNodes].some(node=>
    node.nodeType===1&&(node.matches?.('.living-source-node')||node.querySelector?.('.living-source-node')))){schedule();return}
  }
 });
 sourceObserver.observe(tree,{subtree:true,childList:true,attributes:true,attributeFilter:['cx','cy','data-node']});
 const observer=new MutationObserver(schedule);
observer.observe(tree,{attributes:true,attributeFilter:['viewBox']});
observer.observe(voyage,{attributes:true,attributeFilter:['data-stage']});
motion.addEventListener?.('change',schedule);data.addEventListener?.('change',schedule);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
schedule();
})();