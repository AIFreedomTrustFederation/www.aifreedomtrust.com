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
const flight=document.createElement('button');flight.type='button';flight.className='awakening-cinema-flight';flight.textContent='Enter Evidence Flight';flight.setAttribute('aria-label','Continue this documented source into the full interactive Evidence Flight');
const nav=document.createElement('div');nav.className='awakening-cinema-actions';nav.append(source,flight,reset);
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
for(const c of chapter){const b=document.createElement('button');b.type='button';b.className='awakening-cinema-step';b.dataset.stage=c.kind;b.disabled=!c.items.length;b.setAttribute('aria-pressed','false');b.textContent=labels[c.kind];const small=document.createElement('small');small.textContent=c.items.length?String(c.items.length)+' documented':'No verified records';b.append(small);rail.append(b)}
reset.addEventListener('click',()=>{selected=null;world.removeAttribute('data-cinema-stage');tree.setAttribute('viewBox',view);rail.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));detail.textContent='The entire documented Tree is visible. Choose a stage to explore.';source.hidden=true});
detail.textContent='Choose a stage to begin your source-backed journey.';
/* Do not animate on low-power/reduced-motion devices. No timers, network or telemetry. */
if(!reduced.matches&&matchMedia('(pointer:fine)').matches){
 let pending=false,x=0,y=0;
 world.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=world.getBoundingClientRect();x=(e.clientX-r.left)/r.width-.5;y=(e.clientY-r.top)/r.height-.5;if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;world.style.setProperty('--cinema-parallax-x',(x*18).toFixed(2)+'px');world.style.setProperty('--cinema-parallax-y',(y*12).toFixed(2)+'px')})},{passive:true});
 world.addEventListener('pointerleave',()=>{world.style.removeProperty('--cinema-parallax-x');world.style.removeProperty('--cinema-parallax-y')});
}

/* Milestone: searchable, reversible source constellation and spatial navigator.
   Uses the same published lineage records as the stage rail; never invents a fruit. */
const explorer=document.createElement('section');
explorer.className='awakening-explorer';
explorer.setAttribute('aria-label','Explore documented lineage');
const searchLabel=document.createElement('label');
searchLabel.textContent='Find a source, system or documented outcome';
const search=document.createElement('input');
search.type='search';search.autocomplete='off';search.placeholder='Search the living Tree';
search.setAttribute('aria-label','Search documented Tree nodes');
searchLabel.append(search);
const matches=document.createElement('div');
matches.className='awakening-explorer-results';matches.setAttribute('role','group');matches.setAttribute('aria-label','Matching documented nodes');
const crumbs=document.createElement('nav');
crumbs.className='awakening-explorer-crumbs';crumbs.setAttribute('aria-label','Source lineage breadcrumbs');
const historyActions=document.createElement('div');historyActions.className='awakening-explorer-history';
const back=document.createElement('button');back.type='button';back.textContent='Previous place';back.disabled=true;
const previousSibling=document.createElement('button');previousSibling.type='button';previousSibling.textContent='Previous documented record';previousSibling.disabled=true;
const nextSibling=document.createElement('button');nextSibling.type='button';nextSibling.textContent='Next documented record';nextSibling.disabled=true;
const map=document.createElement('div');map.className='awakening-explorer-map';map.setAttribute('aria-label','Spatial overview of the Tree');
const mapTitle=document.createElement('span');mapTitle.textContent='TREE OVERVIEW';
const mapTrack=document.createElement('div');mapTrack.className='awakening-explorer-map-track';
const mapFocus=document.createElement('span');mapFocus.className='awakening-explorer-map-focus';mapFocus.setAttribute('aria-hidden','true');
mapTrack.append(mapFocus);map.append(mapTitle,mapTrack);
historyActions.append(back,previousSibling,nextSibling,map);
/* The public path finder uses only published parent IDs and qualified outcomes.
   It never treats a source repository as a fruit or assumes a product exists. */
const pathways=document.createElement('section');
pathways.className='awakening-pathways';
pathways.setAttribute('aria-label','Documented paths and outcomes');
const pathwaysTitle=document.createElement('h3');pathwaysTitle.textContent='Where this source can lead';
const pathwaysStatus=document.createElement('p');pathwaysStatus.className='awakening-pathways-status';pathwaysStatus.setAttribute('role','status');
const pathwaysList=document.createElement('div');pathwaysList.className='awakening-pathways-list';
pathwaysList.setAttribute('role','group');pathwaysList.setAttribute('aria-label','Published downstream lineage');
pathways.append(pathwaysTitle,pathwaysStatus,pathwaysList);
explorer.append(searchLabel,matches,crumbs,historyActions,pathways);layer.append(explorer);
const trail=[];
function siblingsFor(node){return inspectable.filter(n=>n.kind===node.kind&&n.parent===node.parent)}
function moveSibling(delta){if(!selected)return;const siblings=siblingsFor(selected),at=siblings.findIndex(n=>n.id===selected.id),next=siblings[at+delta];if(next)displayNode(next)}
previousSibling.addEventListener('click',()=>moveSibling(-1));
nextSibling.addEventListener('click',()=>moveSibling(1));
const inspectable=records.filter(n=>allowed.has(n.id)&&eligible(n));
const childrenByParent=new Map();
for(const n of inspectable){if(!n.parent)continue;const children=childrenByParent.get(n.parent)||[];children.push(n);childrenByParent.set(n.parent,children)}
function downstream(node){
 const queue=[{node,depth:0}],seen=new Set([node.id]),found=[];
 while(queue.length){const item=queue.shift();for(const child of childrenByParent.get(item.node.id)||[]){
  if(seen.has(child.id))continue;seen.add(child.id);
  found.push({node:child,depth:item.depth+1});queue.push({node:child,depth:item.depth+1});
 }}
 return found;
}
function renderPathways(node){
 pathwaysList.replaceChildren();
 const found=downstream(node),outcomes=found.filter(item=>item.node.kind==='fruit'&&isFruit(item.node));
 const next=childrenByParent.get(node.id)||[];
 pathwaysStatus.textContent=outcomes.length
  ?outcomes.length+' documented visitor-facing outcome'+(outcomes.length===1?'':'s')+' reachable through published lineage. This is not live readiness.'
  :'No verified visitor-facing outcome is linked downstream of this source. Its documented branches and leaves remain explorable.';
 const candidates=[...next,...outcomes.map(item=>item.node)].filter((n,i,arr)=>arr.findIndex(x=>x.id===n.id)===i);
 if(!candidates.length){const p=document.createElement('p');p.textContent='No further published descendants. No missing relationship has been invented.';pathwaysList.append(p);return}
 for(const child of candidates){
  const button=document.createElement('button');button.type='button';button.className='awakening-pathways-node';
  button.textContent=(child.kind==='fruit'?'Visit outcome lineage: ':'Follow '+labels[child.kind]+': ')+child.label;
  button.addEventListener('click',()=>displayNode(child));pathwaysList.append(button);
 }
}
function displayNode(node,remember=true){
 if(!node||!eligible(node))return;
 if(remember&&selected?.id!==node.id){if(selected)trail.push(selected.id);back.disabled=!trail.length}
 // Select the requested published record atomically. Calling choose() here
 // first selects an unrelated default record and can desynchronize the
 // inspector, camera and keyboard-driven pathway navigation.
 focus=stages.indexOf(node.kind);
 rail.querySelectorAll('button[data-stage]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.stage===node.kind)));
 world.dataset.cinemaStage=node.kind;
 selected=node;
 camera(node);
 const siblings=siblingsFor(node),position=siblings.findIndex(n=>n.id===node.id);
 previousSibling.disabled=position<=0;nextSibling.disabled=position<0||position>=siblings.length-1;
 const chain=lineage(node);
 renderPathways(node);
 detail.replaceChildren();
 const heading=document.createElement('strong');heading.textContent=node.label+' · '+labels[node.kind];
 const explanation=document.createElement('p');
 explanation.textContent=node.kind==='root'?'Verified source root; repositories are never outcomes.':node.kind==='fruit'?'Documented visitor-facing outcome with a source lineage.':'Published lineage record; no completion or system health is implied.';
 detail.append(heading,explanation);
 crumbs.replaceChildren();
 chain.forEach((ancestor,i)=>{
  if(i){const sep=document.createElement('span');sep.textContent=' / ';sep.setAttribute('aria-hidden','true');crumbs.append(sep)}
  const button=document.createElement('button');button.type='button';button.textContent=ancestor.label;
  button.setAttribute('aria-current',ancestor.id===node.id?'location':'false');
  button.addEventListener('click',()=>displayNode(ancestor));
  crumbs.append(button);
 });
 const link=safe(node.url);source.hidden=!link;
 if(link){source.href=link;source.textContent=node.kind==='fruit'?'Open verified experience':'Inspect published source';
 if(new URL(link).origin!==location.origin)source.target='_blank';else source.removeAttribute('target')}
 else{source.removeAttribute('href');source.removeAttribute('target')}
 const point=findPoint(node.id);
 if(point){mapFocus.style.left=Math.max(0,Math.min(100,point.x/10))+'%';mapFocus.style.top=Math.max(0,Math.min(100,point.y/10))+'%';mapFocus.hidden=false}
 else{mapFocus.hidden=true}
}
function renderMatches(){
 const query=search.value.trim().toLocaleLowerCase();
 matches.replaceChildren();
 if(!query){matches.textContent='Search by name to inspect a documented node and its source lineage.';return}
 const found=inspectable.filter(n=>(n.label+' '+n.id+' '+labels[n.kind]).toLocaleLowerCase().includes(query)).slice(0,12);
 if(!found.length){matches.textContent='No documented match. No result has been invented.';return}
 found.forEach(n=>{
  const button=document.createElement('button');button.type='button';button.className='awakening-explorer-result';
  button.textContent=n.label+' · '+labels[n.kind];
  button.addEventListener('click',()=>displayNode(n));matches.append(button);
 });
}
/* One continuous public journey: hand the exact selected lineage record to the
   existing Evidence Flight without replacing its camera, contracts or history.
   The destination owns its selection; no synthetic events or fabricated nodes. */
function enterEvidenceFlight(){
 const target=document.getElementById('evidence-world');
 const index=document.getElementById('evidence-list');
 if(!target||!index){detail.textContent='The full Evidence Flight is unavailable on this page.';return}
 const record=selected&&allowed.get(selected.id);
 if(record){
  const controls=[...index.querySelectorAll('button')];
  const matching=controls.find(button=>button.textContent?.startsWith(record.label+' · '));
  if(matching)matching.click();
  else{
   const input=document.getElementById('evidence-search');
   if(input){input.value=record.label;input.dispatchEvent(new Event('input',{bubbles:true}));
    const refreshed=[...index.querySelectorAll('button')].find(button=>button.textContent?.startsWith(record.label+' · '));
    if(refreshed)refreshed.click();
   }
  }
 }
 target.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
 const scene=document.getElementById('evidence-scene');
 if(scene)scene.focus({preventScroll:true});
}
flight.addEventListener('click',enterEvidenceFlight);
search.addEventListener('input',renderMatches);
back.addEventListener('click',()=>{
 const previous=allowed.get(trail.pop());back.disabled=!trail.length;
 if(previous)displayNode(previous,false);
});
reset.addEventListener('click',()=>{trail.length=0;back.disabled=true;previousSibling.disabled=true;nextSibling.disabled=true;crumbs.replaceChildren();mapFocus.hidden=true;pathwaysList.replaceChildren();pathwaysStatus.textContent='Choose a documented source to discover its downstream lineage.';search.value='';renderMatches()});
/* Stage choices and search share one reversible selection state and lineage inspector. */
rail.querySelectorAll('button[data-stage]').forEach(button=>button.addEventListener('click',()=>{
 const group=chapter.find(c=>c.kind===button.dataset.stage);
 const node=group?.items.find(n=>findPoint(n.id))||group?.items[0];
 if(node)displayNode(node);
}));
pathwaysStatus.textContent='Choose a documented source to discover its downstream lineage.';
renderMatches();
})();