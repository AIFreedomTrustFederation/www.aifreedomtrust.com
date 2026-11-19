/* Living Universe: source-bound cinematic pilgrimage, no invented graph nodes. */
(()=>{'use strict';
const world=document.querySelector('.world'),tree=world?.querySelector('.tree'),records=window.AIFT_LINEAGE_NODES;
if(!world||!tree||!Array.isArray(records))return;
const kinds=['root','trunk','branch','leaf','flower','fruit'];
const names={root:'Descend into the Roots',trunk:'Meet the Shared Trunk',branch:'Enter the Branches',leaf:'Discover the Leaves',flower:'Witness the Flowers',fruit:'Visit the Fruits'};
const byId=new Map(records.map(n=>[n.id,n]));
function ancestry(n){const path=[],seen=new Set();while(n&&!seen.has(n.id)){path.unshift(n);seen.add(n.id);n=n.parent?byId.get(n.parent):null}return path}
function safe(url){try{const u=new URL(url,location.href);return u.protocol==='https:'||(u.protocol==='http:'&&u.origin===location.origin)?u.href:null}catch{return null}}
function qualifies(n){if(n.kind!=='fruit')return true;const path=ancestry(n);return path.some(p=>p.kind==='root')&&!!safe(n.url)&&!/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/i.test(safe(n.url))}
const chapters=kinds.map(kind=>({kind,items:records.filter(n=>n.kind===kind&&qualifies(n))}));
const nav=document.createElement('section');nav.className='pilgrimage';nav.setAttribute('aria-label','Cinematic source-to-outcome journey');
nav.innerHTML='<div class="pilgrimage-top"><span class="pilgrimage-kicker">THE LIVING PATH · SIX DOCUMENTED LAYERS</span><button class="pilgrimage-toggle" type="button" aria-expanded="false" aria-controls="pilgrimage-body">Begin the voyage</button></div><div class="pilgrimage-body" id="pilgrimage-body" hidden><div class="pilgrimage-track" role="group" aria-label="Biological journey stages"></div><div class="pilgrimage-detail" aria-live="polite"></div><div class="pilgrimage-actions"><button type="button" data-action="previous">← Previous</button><button type="button" data-action="next">Continue →</button><a class="pilgrimage-destination" hidden>Open documented destination</a></div><p class="pilgrimage-disclaimer">A guided exploration of published lineage, not live CI or completion status. Missing evidence never creates a fruit.</p></div>';
world.append(nav);
const toggle=nav.querySelector('.pilgrimage-toggle'),body=nav.querySelector('.pilgrimage-body'),track=nav.querySelector('.pilgrimage-track'),detail=nav.querySelector('.pilgrimage-detail'),destination=nav.querySelector('.pilgrimage-destination');
let index=0,chosen=null;
const positions={root:[500,900],trunk:[500,650],branch:[500,350],leaf:[500,190],flower:[500,140],fruit:[500,125]};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function focusTree(kind){
 const anchor=chosen&&tree.querySelector('.living-source-node[data-node="'+CSS.escape(chosen.id)+'"]');
 if(anchor){anchor.dispatchEvent(new Event('focus'));anchor.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return}
 const [x,y]=positions[kind],size=kind==='root'?570:kind==='trunk'?660:kind==='branch'?700:760;
 tree.setAttribute('viewBox',[Math.max(0,x-size/2),Math.max(0,y-size/2),size,size].join(' '));
}
function render(){
 const current=chapters[index];nav.dataset.stage=current.kind;
 track.replaceChildren();
 chapters.forEach((chapter,i)=>{const b=document.createElement('button');b.type='button';b.textContent=(i+1)+' · '+chapter.kind;b.setAttribute('aria-current',String(i===index));b.addEventListener('click',()=>{index=i;chosen=null;render()});track.append(b)});
 const title=document.createElement('h2');title.textContent=names[current.kind];
 const description=document.createElement('p');
 description.textContent=current.items.length?current.items.length+' documented '+current.kind+' record'+(current.items.length===1?'':'s')+' available. Select one to reveal its provenance.':'No qualifying '+current.kind+' record is published. This layer remains visible without invented evidence.';
 const selectLabel=document.createElement('label');selectLabel.textContent='Explore a documented '+current.kind+' ';
 const select=document.createElement('select');select.setAttribute('aria-label','Choose a documented '+current.kind);
 const empty=document.createElement('option');empty.value='';empty.textContent='Choose a published record';select.append(empty);
 current.items.forEach(n=>{const option=document.createElement('option');option.value=n.id;option.textContent=n.label;select.append(option)});
 select.value=chosen?.id||'';select.disabled=!current.items.length;
 select.addEventListener('change',()=>{chosen=byId.get(select.value)||null;render()});
 selectLabel.append(select);
 detail.replaceChildren(title,description,selectLabel);
 if(chosen){
  const provenance=document.createElement('p');provenance.className='pilgrimage-provenance';provenance.textContent='Published lineage: '+ancestry(chosen).map(n=>n.label+' ('+n.kind+')').join(' → ');
  const explanation=document.createElement('p');explanation.textContent=chosen.desc||'No additional published description.';
  detail.append(provenance,explanation);
 }
 const link=chosen&&safe(chosen.url);destination.hidden=!link;
 if(link){destination.href=link;destination.textContent=chosen.kind==='fruit'?'Enter verified public experience':'Inspect published source';destination.rel='noopener noreferrer';if(new URL(link).origin!==location.origin)destination.target='_blank';else destination.removeAttribute('target')}
 else {destination.removeAttribute('href');destination.removeAttribute('target')}
 nav.querySelector('[data-action="previous"]').disabled=index===0;
 nav.querySelector('[data-action="next"]').disabled=index===chapters.length-1;
 nav.querySelector('[data-action="next"]').textContent=index===chapters.length-1?'Journey complete':'Continue →';
 if(!reduced.matches)nav.classList.remove('pilgrimage-arrived');
 focusTree(current.kind);
 if(!reduced.matches)requestAnimationFrame(()=>nav.classList.add('pilgrimage-arrived'));
}
toggle.addEventListener('click',()=>{const opening=body.hidden;body.hidden=!opening;toggle.setAttribute('aria-expanded',String(opening));toggle.textContent=opening?'Close voyage':'Begin the voyage';if(opening)render();else tree.setAttribute('viewBox','0 0 1000 1000')});
nav.querySelector('[data-action="previous"]').addEventListener('click',()=>{if(index>0){index--;chosen=null;render()}});
nav.querySelector('[data-action="next"]').addEventListener('click',()=>{if(index<chapters.length-1){index++;chosen=null;render()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!body.hidden){body.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='Begin the voyage';toggle.focus();tree.setAttribute('viewBox','0 0 1000 1000')}});
})();
