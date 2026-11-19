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
// Evidence-only cinematic route: actual published ancestry, never decorative nodes.
const routeLayer=document.createElementNS('http://www.w3.org/2000/svg','g');
routeLayer.classList.add('pilgrimage-route-layer');
routeLayer.setAttribute('aria-hidden','true');
tree.append(routeLayer);
const sourceAnchors=()=>new Map([...tree.querySelectorAll('.living-source-node[data-node]')].map(el=>[el.dataset.node,el]));
const positionOf=id=>{const el=sourceAnchors().get(id),dot=el?.querySelector('circle[cx][cy]');if(!dot)return null;const x=Number(dot.getAttribute('cx')),y=Number(dot.getAttribute('cy'));return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null};
function drawRoute(node){
 routeLayer.replaceChildren();
 if(!node)return;
 const trail=ancestry(node);
 for(let i=1;i<trail.length;i++){
  const a=positionOf(trail[i-1].id),b=positionOf(trail[i].id);
  if(!a||!b)continue; // No projected source means no invented connection.
  const edge=document.createElementNS('http://www.w3.org/2000/svg','path');
  edge.setAttribute('d','M'+a.x+' '+a.y+' Q'+((a.x+b.x)/2)+' '+(Math.min(a.y,b.y)-36)+' '+b.x+' '+b.y);
  edge.setAttribute('class','pilgrimage-route-edge');routeLayer.append(edge);
 }
 for(const record of trail){const p=positionOf(record.id);if(!p)continue;
  const ring=document.createElementNS('http://www.w3.org/2000/svg','circle');
  ring.setAttribute('cx',String(p.x));ring.setAttribute('cy',String(p.y));ring.setAttribute('r',record.id===node.id?'20':'13');
  ring.setAttribute('class','pilgrimage-route-ring');routeLayer.append(ring);
 }
}
const nav=document.createElement('section');nav.className='pilgrimage';nav.setAttribute('aria-label','Cinematic source-to-outcome journey');
nav.innerHTML='<div class="pilgrimage-top"><span class="pilgrimage-kicker">THE LIVING PATH · SIX DOCUMENTED LAYERS</span><button class="pilgrimage-toggle" type="button" aria-expanded="false" aria-controls="pilgrimage-body">Begin the voyage</button></div><div class="pilgrimage-body" id="pilgrimage-body" hidden><div class="pilgrimage-track" role="group" aria-label="Biological journey stages"></div><div class="pilgrimage-detail" aria-live="polite"></div><div class="pilgrimage-actions"><button type="button" data-action="previous">← Previous</button><button type="button" data-action="next">Continue →</button><a class="pilgrimage-destination" hidden>Open documented destination</a></div><p class="pilgrimage-disclaimer">A guided exploration of published lineage, not live CI or completion status. Missing evidence never creates a fruit.</p></div>';
world.append(nav);
const toggle=nav.querySelector('.pilgrimage-toggle'),body=nav.querySelector('.pilgrimage-body'),track=nav.querySelector('.pilgrimage-track'),detail=nav.querySelector('.pilgrimage-detail'),destination=nav.querySelector('.pilgrimage-destination');
let index=0,chosen=null;
// The route atlas is derived only from qualified published records and parent IDs.
const atlas=document.createElement('section');atlas.className='pilgrimage-atlas';atlas.setAttribute('aria-label','Interactive evidence-backed growth map');
const atlasHeading=document.createElement('h3');atlasHeading.textContent='The living lineage map';
const atlasHint=document.createElement('p');atlasHint.textContent='Choose a published source to travel through its actual ancestry. A layer with no evidence has no invented destination.';
const atlasMap=document.createElement('div');atlasMap.className='pilgrimage-atlas-map';atlasMap.setAttribute('role','group');atlasMap.setAttribute('aria-label','Published biological layers');
atlas.append(atlasHeading,atlasHint,atlasMap);body.insertBefore(atlas,detail);
function navigateTo(record){const nextIndex=chapters.findIndex(c=>c.kind===record.kind&&c.items.some(n=>n.id===record.id));if(nextIndex<0)return;index=nextIndex;chosen=record;render()}
function renderAtlas(){atlasMap.replaceChildren();for(const chapter of chapters){const column=document.createElement('div');column.className='pilgrimage-atlas-column';column.dataset.kind=chapter.kind;const heading=document.createElement('h4');heading.textContent=chapter.kind+' · '+chapter.items.length;column.append(heading);if(!chapter.items.length){const empty=document.createElement('p');empty.textContent='No published evidence';column.append(empty)}else{for(const record of chapter.items){const button=document.createElement('button');button.type='button';button.textContent=record.label;button.title=record.desc||record.label;button.dataset.source=record.id;button.setAttribute('aria-current',String(record.id===chosen?.id));button.addEventListener('click',()=>navigateTo(record));column.append(button)}}atlasMap.append(column)}}
const positions={root:[500,900],trunk:[500,650],branch:[500,350],leaf:[500,190],flower:[500,140],fruit:[500,125]};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function focusTree(kind){
 const anchor=chosen&&tree.querySelector('.living-source-node[data-node="'+CSS.escape(chosen.id)+'"]');
 if(anchor){anchor.dispatchEvent(new Event('focus'));anchor.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return}
 const [x,y]=positions[kind],size=kind==='root'?570:kind==='trunk'?660:kind==='branch'?700:760;
 tree.setAttribute('viewBox',[Math.max(0,x-size/2),Math.max(0,y-size/2),size,size].join(' '));
}
function render(){
 const current=chapters[index];nav.dataset.stage=current.kind;drawRoute(chosen);renderAtlas();
 track.replaceChildren();
 chapters.forEach((chapter,i)=>{const b=document.createElement('button');b.type='button';b.textContent=(i+1)+' · '+chapter.kind;b.setAttribute('aria-current',String(i===index));b.addEventListener('click',()=>{index=i;chosen=null;render()});track.append(b)});
 const title=document.createElement('h2');title.textContent=names[current.kind];
 const description=document.createElement('p');
 description.textContent=current.items.length?current.items.length+' documented '+current.kind+' record'+(current.items.length===1?'':'s')+' available. Select one to reveal its provenance.':'No qualifying '+current.kind+' record is published. This layer remains visible without invented evidence.';
 const searchLabel=document.createElement('label');searchLabel.className='pilgrimage-search-label';searchLabel.textContent='Find a published record in this layer';
 const search=document.createElement('input');search.type='search';search.className='pilgrimage-search';search.placeholder='Search documented names and descriptions';search.setAttribute('aria-label','Filter published '+current.kind+' records');
 searchLabel.append(search);
 const results=document.createElement('p');results.className='pilgrimage-search-results';results.setAttribute('role','status');
 const selectLabel=document.createElement('label');selectLabel.textContent='Explore a documented '+current.kind+' ';
 const select=document.createElement('select');select.setAttribute('aria-label','Choose a documented '+current.kind);
 const empty=document.createElement('option');empty.value='';empty.textContent='Choose a published record';select.append(empty);
 current.items.forEach(n=>{const option=document.createElement('option');option.value=n.id;option.textContent=n.label;select.append(option)});
 const filterRecords=()=>{const query=search.value.trim().toLocaleLowerCase();const matches=current.items.filter(n=>(n.label+' '+(n.desc||'')).toLocaleLowerCase().includes(query));select.replaceChildren(empty);matches.forEach(n=>{const option=document.createElement('option');option.value=n.id;option.textContent=n.label;select.append(option)});select.value=matches.some(n=>n.id===chosen?.id)?chosen.id:'';results.textContent=matches.length+' of '+current.items.length+' published records match';select.disabled=!matches.length;};
 search.addEventListener('input',filterRecords);filterRecords();
 select.addEventListener('change',()=>{chosen=byId.get(select.value)||null;render()});
 selectLabel.append(select);
 detail.replaceChildren(title,description,searchLabel,results,selectLabel);
 if(chosen){
  const provenance=document.createElement('p');provenance.className='pilgrimage-provenance';provenance.textContent='Published lineage: '+ancestry(chosen).map(n=>n.label+' ('+n.kind+')').join(' → ');
  const explanation=document.createElement('p');explanation.textContent=chosen.desc||'No additional published description.';
  detail.append(provenance,explanation);
  const trail=ancestry(chosen),line=document.createElement('ol');line.className='pilgrimage-lineage';line.setAttribute('aria-label','Reversible source ancestry');
  for(const record of trail){const item=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=record.kind+' · '+record.label;button.setAttribute('aria-current',String(record.id===chosen.id));
   button.addEventListener('click',()=>navigateTo(record));item.append(button);line.append(item)}
  detail.append(line);
  const children=records.filter(n=>n.parent===chosen.id&&chapters.some(c=>c.kind===n.kind&&c.items.some(item=>item.id===n.id)));
  if(children.length){const nextTitle=document.createElement('h3');nextTitle.textContent='Documented paths growing from here';const nextList=document.createElement('div');nextList.className='pilgrimage-children';nextList.setAttribute('role','group');nextList.setAttribute('aria-label','Published direct descendants');
   children.forEach(child=>{const button=document.createElement('button');button.type='button';button.textContent=child.kind+' · '+child.label;button.addEventListener('click',()=>navigateTo(child));nextList.append(button)});
   detail.append(nextTitle,nextList);
  }
 }
 const progress=document.createElement('p');progress.className='pilgrimage-evidence-progress';progress.textContent='Published evidence · '+current.items.length+' qualified '+current.kind+' records · Chapter '+(index+1)+' of '+chapters.length+'. This is not a live deployment or CI indicator.';detail.append(progress);
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
toggle.addEventListener('click',()=>{const opening=body.hidden;body.hidden=!opening;toggle.setAttribute('aria-expanded',String(opening));toggle.textContent=opening?'Close voyage':'Begin the voyage';if(opening)render();else {drawRoute(null);tree.setAttribute('viewBox','0 0 1000 1000')}});
nav.querySelector('[data-action="previous"]').addEventListener('click',()=>{if(index>0){index--;chosen=null;render()}});
nav.querySelector('[data-action="next"]').addEventListener('click',()=>{if(index<chapters.length-1){index++;chosen=null;render()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!body.hidden){body.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='Begin the voyage';toggle.focus();drawRoute(null);tree.setAttribute('viewBox','0 0 1000 1000')}});
})();
