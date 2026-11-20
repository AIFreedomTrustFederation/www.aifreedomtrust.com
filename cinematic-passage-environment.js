/* Cinematic passage: atmospheric layers follow the actual Tree camera and published growth stage.
   Decorative light is never represented as a source, product, or achievement. */
(()=>{'use strict';
const world=document.querySelector('.world'),tree=world?.querySelector('svg.tree'),voyage=world?.querySelector('.pilgrimage');
if(!world||!tree||!voyage)return;
const NS='http://www.w3.org/2000/svg';
const stages=['root','trunk','branch','leaf','flower','fruit'];
const make=(tag,attrs)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e};
const environment=make('g',{'class':'passage-environment','aria-hidden':'true','pointer-events':'none'});
const halo=make('ellipse',{'class':'passage-halo',cx:500,cy:480,rx:320,ry:330});
const horizon=make('path',{'class':'passage-horizon',d:'M 0 755 Q 500 665 1000 755'});
const motes=make('g',{'class':'passage-motes'});
// Fixed decorative positions, not records. No simulated nodes, random values, or source links.
for(let i=0;i<16;i++){const x=90+(i*137)%820,y=100+(i*211)%800;
 motes.append(make('circle',{'class':'passage-mote',cx:x,cy:y,r:1.5+(i%3)}))}
environment.append(halo,horizon,motes);
const defs=tree.querySelector('defs');
const gradient=make('linearGradient',{id:'passage-spectrum',x1:'0',y1:'1',x2:'1',y2:'0'});
for(const [offset,color] of [['0%','#e87674'],['48%','#67dfb2'],['100%','#74a8fa']])
 gradient.append(make('stop',{offset,'stop-color':color}));
defs?.append(gradient);
const firstArt=[...tree.children].find(el=>!['title','desc','defs'].includes(el.tagName.toLowerCase()));
tree.insertBefore(environment,firstArt||null);
const lens=document.createElement('div');lens.className='passage-lens';lens.setAttribute('aria-hidden','true');
lens.innerHTML='<span class="passage-lens-orbit"></span><span class="passage-lens-core"></span>';
world.append(lens);
const caption=document.createElement('div');caption.className='passage-caption';caption.setAttribute('role','status');
caption.setAttribute('aria-live','off');caption.textContent='THE LIVING TREE · DOCUMENTED LINEAGE';
world.append(caption);
const motion=matchMedia('(prefers-reduced-motion: reduce)'),data=matchMedia('(prefers-reduced-data: reduce)');
let queued=false;
function refresh(){
 queued=false;
 const stage=stages.includes(voyage.dataset.stage)?voyage.dataset.stage:'root';
 world.dataset.passageStage=stage;
 const raw=tree.getAttribute('viewBox')||'0 0 1000 1000';
 const [x,y,w,h]=raw.trim().split(/[\s,]+/).map(Number);
 if([x,y,w,h].every(Number.isFinite)&&w>0&&h>0){
  const centerX=x+w/2,centerY=y+h/2;
  const shiftX=Math.max(-1,Math.min(1,(centerX-500)/500));
  const shiftY=Math.max(-1,Math.min(1,(centerY-500)/500));
  world.style.setProperty('--passage-x',String(shiftX));
  world.style.setProperty('--passage-y',String(shiftY));
  world.style.setProperty('--passage-focus',String(Math.max(0,Math.min(1,1-w/1000))));
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