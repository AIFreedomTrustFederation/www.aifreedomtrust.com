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
const observer=new MutationObserver(schedule);
observer.observe(tree,{attributes:true,attributeFilter:['viewBox']});
observer.observe(voyage,{attributes:true,attributeFilter:['data-stage']});
motion.addEventListener?.('change',schedule);data.addEventListener?.('change',schedule);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
schedule();
})();