/* Living Universe 3.2: source-bound cinematic focus, additive and reversible. */
(()=>{'use strict';
const world=document.querySelector('.world'),tree=world?.querySelector('svg.tree');
const records=window.AIFT_LINEAGE_NODES;
if(!world||!tree||!Array.isArray(records))return;
const stages=['root','trunk','branch','leaf','flower','fruit'];
const labels={root:'Roots',trunk:'Shared trunk',branch:'Systems',leaf:'Capabilities',flower:'Emerging work',fruit:'Verified outcomes'};
const allowed=new Map(records.filter(n=>stages.includes(n.kind)&&typeof n.id==='string').map(n=>[n.id,n]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const layer=document.createElement('div');layer.className='awakening-cinema';layer.setAttribute('aria-label','Cinematic source journey');
const title=document.createElement('p');title.className='awakening-cinema-title';title.textContent='THE LIVING JOURNEY';
const description=document.createElement('p');description.className='awakening-cinema-description';description.textContent='Follow verified sources through the living federation.';
const rail=document.createElement('div');rail.className='awakening-cinema-rail';rail.setAttribute('role','group');rail.setAttribute('aria-label','Six biological stages');
const detail=document.createElement('div');detail.className='awakening-cinema-detail';detail.setAttribute('role','status');detail.setAttribute('aria-live','polite');
const source=document.createElement('a');source.className='awakening-cinema-source';source.rel='noopener noreferrer';source.hidden=true;
const reset=document.createElement('button');reset.type='button';reset.className='awakening-cinema-reset';reset.textContent='View entire Tree';
const nav=document.createElement('div');nav.className='awakening-cinema-actions';nav.append(source,reset);
layer.append(title,description,rail,detail,nav);world.append(layer);
const view=tree.getAttribute('viewBox')||'0 0 1000 1000';
let selected=null,focus=0;
const safe=(url)=>{try{const u=new URL(url,location.href);return u.protocol==='https:'||(u.protocol==='http:'&&u.origin===location.origin)?u.href:null}catch{return null}};
const lineage=(node)=>{const out=[],seen=new Set();while(node&&!seen.has(node.id)){seen.add(node.id);out.unshift(node);node=allowed.get(node.parent)}return out};
const isFruit=(n)=>n.kind==='fruit'&&lineage(n).some(x=>x.kind==='root')&&!!safe(n.url)&&!/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/i.test(safe(n.url));
const eligible=n=>n.kind!=='fruit'||isFruit(n);
const chapter=stages.map(kind=>({kind,items:records.filter(n=>n.kind===kind&&eligible(n))}));
const nodes=()=>[...tree.querySelectorAll('.living-source-node[data-node]')];
function findPoint(id){const el=nodes().find(n=>n.dataset.node===id),dot=el?.querySelector('circle[cx][cy]');if(!dot)return null;const x=Number(dot.getAttribute('cx')),y=Number(dot.getAttribute('cy'));return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null}
function camera(n){if(!n){tree.setAttribute('viewBox',view);return}const p=findPoint(n.id);if(!p)return;const size=360;tree.setAttribute('viewBox',[Math.max(0,Math.min(1000-size,p.x-size/2)),Math.max(0,Math.min(1000-size,p.y-size/2)),size,size].join(' '))}
function choose(kind){
 const group=chapter.find(c=>c.kind===kind);if(!group||!group.items.length)return;
 focus=stages.indexOf(kind);
 selected=group.items.find(n=>findPoint(n.id))||group.items[0];
 rail.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stage===kind)));
 const count=group.items.length;
 detail.replaceChildren();
 const heading=document.createElement('strong');heading.textContent=labels[kind]+' · '+count+' documented '+(count===1?'record':'records');
 const copy=document.createElement('p');copy.textContent=selected.label+' — '+(kind==='root'?'verifiable source, never a product':kind==='fruit'?'documented visitor-facing outcome':'published federation lineage; completion is not implied');
 detail.append(heading,copy);
 const link=safe(selected.url);source.hidden=!link;
 if(link){source.href=link;source.textContent=kind==='fruit'?'Open verified experience':'Inspect published source';if(new URL(link).origin!==location.origin)source.target='_blank';else source.removeAttribute('target')}
 else{source.removeAttribute('href');source.removeAttribute('target')}
 world.dataset.cinemaStage=kind;
 camera(selected);
}
for(const c of chapter){const b=document.createElement('button');b.type='button';b.className='awakening-cinema-step';b.dataset.stage=c.kind;b.disabled=!c.items.length;b.setAttribute('aria-pressed','false');b.textContent=labels[c.kind];const small=document.createElement('small');small.textContent=c.items.length?String(c.items.length)+' documented':'No verified records';b.append(small);b.addEventListener('click',()=>choose(c.kind));rail.append(b)}
reset.addEventListener('click',()=>{selected=null;world.removeAttribute('data-cinema-stage');tree.setAttribute('viewBox',view);rail.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));detail.textContent='The entire documented Tree is visible. Choose a stage to explore.';source.hidden=true});
detail.textContent='Choose a stage to begin your source-backed journey.';
/* Do not animate on low-power/reduced-motion devices. No timers, network or telemetry. */
if(!reduced.matches&&matchMedia('(pointer:fine)').matches){
 let pending=false,x=0,y=0;
 world.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=world.getBoundingClientRect();x=(e.clientX-r.left)/r.width-.5;y=(e.clientY-r.top)/r.height-.5;if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;world.style.setProperty('--cinema-parallax-x',(x*18).toFixed(2)+'px');world.style.setProperty('--cinema-parallax-y',(y*12).toFixed(2)+'px')})},{passive:true});
 world.addEventListener('pointerleave',()=>{world.style.removeProperty('--cinema-parallax-x');world.style.removeProperty('--cinema-parallax-y')});
}
})();