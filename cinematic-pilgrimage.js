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
// Read the exact published-source projection, not inferred positions or fake markers.
// SVG may be mounted asynchronously; the producer publishes the same real coordinates.
const positionOf=id=>{
 const el=sourceAnchors().get(id),dot=el?.querySelector('circle[cx][cy]');
 const projected=window.AIFT_TREE_SOURCE_COORDINATES?.[id];
 const x=dot?Number(dot.getAttribute('cx')):projected?.[0];
 const y=dot?Number(dot.getAttribute('cy')):projected?.[1];
 return Number.isFinite(x)&&Number.isFinite(y)?{x,y}:null;
};
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
let index=0,chosen=null,activeWaypoint=null,flightStop=null;
function stopFlight(){if(flightStop){flightStop();flightStop=null}}
const visited=new Set(),history=[],future=[],searchByKind=new Map();
function snapshot(){return {index,id:chosen?.id||null}}
function restore(state){stopFlight();index=state.index;chosen=state.id?byId.get(state.id)||null:null;activeWaypoint=null;render()}
function travel(nextIndex,record=null){
 stopFlight();
 if(nextIndex<0||nextIndex>=chapters.length)return;
 const before=snapshot(),after={index:nextIndex,id:record?.id||null};
 if(before.index===after.index&&before.id===after.id)return;
 history.push(before);if(history.length>60)history.shift();future.length=0;
 index=nextIndex;chosen=record;activeWaypoint=null;render();
}
function travelBack(){if(!history.length)return;future.push(snapshot());restore(history.pop())}
function travelForward(){if(!future.length)return;history.push(snapshot());restore(future.pop())}
const timeline=document.createElement('div');timeline.className='pilgrimage-timeline';timeline.setAttribute('role','group');timeline.setAttribute('aria-label','Reversible exploration history');
timeline.innerHTML='<button type="button" data-history="back" aria-label="Return to previous visited source">↶ Back</button><button type="button" data-history="forward" aria-label="Move forward through visited sources">Forward ↷</button><button type="button" data-history="overview">Whole Tree</button><span class="pilgrimage-timeline-status" role="status"></span>';
body.insertBefore(timeline,track);
timeline.querySelector('[data-history="back"]').addEventListener('click',travelBack);
timeline.querySelector('[data-history="forward"]').addEventListener('click',travelForward);
timeline.querySelector('[data-history="overview"]').addEventListener('click',()=>{travel(0,null);tree.setAttribute('viewBox','0 0 1000 1000')});

// The route atlas is derived only from qualified published records and parent IDs.
const atlas=document.createElement('section');atlas.className='pilgrimage-atlas';atlas.setAttribute('aria-label','Interactive evidence-backed growth map');
const atlasHeading=document.createElement('h3');atlasHeading.textContent='The living lineage map';
const atlasHint=document.createElement('p');atlasHint.textContent='Choose a published source to travel through its actual ancestry. A layer with no evidence has no invented destination.';
const atlasMap=document.createElement('div');atlasMap.className='pilgrimage-atlas-map';atlasMap.setAttribute('role','group');atlasMap.setAttribute('aria-label','Published biological layers');
atlas.append(atlasHeading,atlasHint,atlasMap);body.insertBefore(atlas,detail);
function navigateTo(record){const nextIndex=chapters.findIndex(c=>c.kind===record.kind&&c.items.some(n=>n.id===record.id));if(nextIndex<0)return;travel(nextIndex,record)}
function renderAtlas(){atlasMap.replaceChildren();for(const chapter of chapters){const column=document.createElement('div');column.className='pilgrimage-atlas-column';column.dataset.kind=chapter.kind;const heading=document.createElement('h4');heading.textContent=chapter.kind+' · '+chapter.items.length;column.append(heading);if(!chapter.items.length){const empty=document.createElement('p');empty.textContent='No published evidence';column.append(empty)}else{for(const record of chapter.items){const button=document.createElement('button');button.type='button';button.textContent=record.label;button.title=record.desc||record.label;button.dataset.source=record.id;button.setAttribute('aria-current',String(record.id===chosen?.id));button.addEventListener('click',()=>navigateTo(record));column.append(button)}}atlasMap.append(column)}}

// A source-only spatial chart: each marker is projected from an existing SVG source node.
// This is an orientation aid, not a second invented federation dataset.
const spatial=document.createElement('section');spatial.className='pilgrimage-spatial';
spatial.setAttribute('aria-label','Interactive source spatial map');
const spatialHeading=document.createElement('h3');spatialHeading.textContent='Where you are in the Tree';
const spatialHint=document.createElement('p');spatialHint.textContent='Select a documented source marker. The highlighted frame follows the real Tree camera.';
const spatialMap=document.createElement('div');spatialMap.className='pilgrimage-spatial-map';
spatialMap.setAttribute('role','group');spatialMap.setAttribute('aria-label','Source locations in the Tree');
const spatialViewport=document.createElement('div');spatialViewport.className='pilgrimage-spatial-viewport';
spatialViewport.setAttribute('aria-hidden','true');
spatialMap.append(spatialViewport);spatial.append(spatialHeading,spatialHint,spatialMap);
body.insertBefore(spatial,atlas);
const spatialEvidence=document.createElement('p');
spatialEvidence.className='pilgrimage-spatial-evidence';
spatialEvidence.setAttribute('role','status');
spatialEvidence.textContent='Spatial markers are drawn only from published Tree source coordinates.';
spatial.append(spatialEvidence);
function renderSpatial(){
 spatialMap.querySelectorAll('button').forEach(b=>b.remove());
 const view=tree.viewBox.baseVal;
 const base=tree.getAttribute('data-full-viewbox')||'0 0 1000 1000';
 const nums=base.trim().split(/\s+|,/).map(Number);
 const full=nums.length===4&&nums.every(Number.isFinite)&&nums[2]>0&&nums[3]>0?nums:[0,0,1000,1000];
 const [ox,oy,w,h]=full;
 const pct=(value,start,size)=>Math.max(0,Math.min(100,(value-start)/size*100));
 spatialViewport.style.left=pct(view.x,ox,w)+'%';
 spatialViewport.style.top=pct(view.y,oy,h)+'%';
 spatialViewport.style.width=Math.max(1,Math.min(100,view.width/w*100))+'%';
 spatialViewport.style.height=Math.max(1,Math.min(100,view.height/h*100))+'%';
 for(const chapter of chapters)for(const record of chapter.items){
  const point=positionOf(record.id);if(!point)continue;
  const marker=document.createElement('button');marker.type='button';
  marker.className='pilgrimage-spatial-marker';marker.dataset.kind=record.kind;
  marker.style.left=pct(point.x,ox,w)+'%';marker.style.top=pct(point.y,oy,h)+'%';
  marker.setAttribute('aria-label',record.kind+' source: '+record.label);
  marker.setAttribute('aria-pressed',String(record.id===(activeWaypoint||chosen)?.id));
  marker.title=record.label;marker.addEventListener('click',()=>navigateTo(record));
  spatialMap.append(marker);
 }
 const markers=spatialMap.querySelectorAll('.pilgrimage-spatial-marker').length;
 spatialEvidence.textContent=markers
  ? markers+' published source positions shown. Select a marker to explore its verified lineage.'
  : 'No published Tree coordinates are available yet. Use the documented chapter and source directory instead; no locations have been invented.';
}

// Keep the viewport frame synchronized with the canonical SVG camera, including
// touch pan, pinch zoom, keyboard navigation and source projection selection.
// Only viewBox changes are observed; marker rendering never writes that attribute.
const cameraObserver=new MutationObserver(changes=>{
 if(body.hidden||!changes.some(change=>change.attributeName==='viewBox'))return;
 // Camera movement can update every frame: move only the viewport rectangle,
 // never rebuild all source markers during a pinch or drag.
 const view=tree.viewBox.baseVal;
 const raw=(tree.getAttribute('data-full-viewbox')||'0 0 1000 1000').trim().split(/\s+|,/).map(Number);
 const full=raw.length===4&&raw.every(Number.isFinite)&&raw[2]>0&&raw[3]>0?raw:[0,0,1000,1000];
 const pct=(value,start,size)=>Math.max(0,Math.min(100,(value-start)/size*100));
 spatialViewport.style.left=pct(view.x,full[0],full[2])+'%';
 spatialViewport.style.top=pct(view.y,full[1],full[3])+'%';
 spatialViewport.style.width=Math.max(1,Math.min(100,view.width/full[2]*100))+'%';
 spatialViewport.style.height=Math.max(1,Math.min(100,view.height/full[3]*100))+'%';
});
cameraObserver.observe(tree,{attributes:true,attributeFilter:['viewBox']});
// Projection and pilgrimage are separate scripts. If the published SVG layer is
// populated after the voyage mounts, refresh the map from actual DOM coordinates.
// This observer never creates synthetic markers or edits the lineage contract.
const sourceObserver=new MutationObserver(changes=>{
 if(body.hidden)return;
 if(changes.some(change=>change.addedNodes.length||change.removedNodes.length)){
  const projected=tree.querySelectorAll('.living-source-node[data-node]').length;
  const mapped=spatialMap.querySelectorAll('.pilgrimage-spatial-marker').length;
  if(projected&&(!mapped||projected!==mapped))renderSpatial();
 }
});
sourceObserver.observe(tree,{childList:true,subtree:true});
// The source projector may finish after this script mounts. Rebuild only on its
// explicit readiness event; no timer, fabricated positions or polling required.
document.addEventListener('aift:tree-source-projection-ready',()=>{
 if(!body.hidden){renderSpatial();drawRoute(chosen)}
});
const positions={root:[500,900],trunk:[500,650],branch:[500,350],leaf:[500,190],flower:[500,140],fruit:[500,125]};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function focusTree(kind){
 const anchor=chosen&&tree.querySelector('.living-source-node[data-node="'+CSS.escape(chosen.id)+'"]');
 if(anchor){anchor.dispatchEvent(new Event('focus'));anchor.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));return}
 const [x,y]=positions[kind],size=kind==='root'?570:kind==='trunk'?660:kind==='branch'?700:760;
 tree.setAttribute('viewBox',[Math.max(0,x-size/2),Math.max(0,y-size/2),size,size].join(' '));
}
function render(){
 const current=chapters[index];activeWaypoint=null;nav.dataset.stage=current.kind;drawRoute(chosen);renderAtlas();
 visited.add(current.kind);
 timeline.querySelector('[data-history="back"]').disabled=!history.length;
 timeline.querySelector('[data-history="forward"]').disabled=!future.length;
 timeline.querySelector('.pilgrimage-timeline-status').textContent=visited.size+' of '+chapters.length+' layers explored in this session (not a verified achievement)';

 track.replaceChildren();
 chapters.forEach((chapter,i)=>{const b=document.createElement('button');b.type='button';b.textContent=(i+1)+' · '+chapter.kind;b.setAttribute('aria-current',String(i===index));b.addEventListener('click',()=>{travel(i,null)});track.append(b)});
 const title=document.createElement('h2');title.textContent=names[current.kind];
 const description=document.createElement('p');
 description.textContent=current.items.length?current.items.length+' documented '+current.kind+' record'+(current.items.length===1?'':'s')+' available. Select one to reveal its provenance.':'No qualifying '+current.kind+' record is published. This layer remains visible without invented evidence.';
 const searchLabel=document.createElement('label');searchLabel.className='pilgrimage-search-label';searchLabel.textContent='Find a published record in this layer';
 const search=document.createElement('input');search.type='search';search.className='pilgrimage-search';search.placeholder='Search documented names and descriptions';search.setAttribute('aria-label','Filter published '+current.kind+' records');
 search.value=searchByKind.get(current.kind)||'';searchLabel.append(search);
 const results=document.createElement('p');results.className='pilgrimage-search-results';results.setAttribute('role','status');
 const selectLabel=document.createElement('label');selectLabel.textContent='Explore a documented '+current.kind+' ';
 const select=document.createElement('select');select.setAttribute('aria-label','Choose a documented '+current.kind);
 const empty=document.createElement('option');empty.value='';empty.textContent='Choose a published record';select.append(empty);
 current.items.forEach(n=>{const option=document.createElement('option');option.value=n.id;option.textContent=n.label;select.append(option)});
 const filterRecords=()=>{const query=search.value.trim().toLocaleLowerCase();const matches=current.items.filter(n=>(n.label+' '+(n.desc||'')).toLocaleLowerCase().includes(query));select.replaceChildren(empty);matches.forEach(n=>{const option=document.createElement('option');option.value=n.id;option.textContent=n.label;select.append(option)});select.value=matches.some(n=>n.id===chosen?.id)?chosen.id:'';results.textContent=matches.length+' of '+current.items.length+' published records match';select.disabled=!matches.length;};
 search.addEventListener('input',()=>{searchByKind.set(current.kind,search.value);filterRecords()});filterRecords();
 select.addEventListener('change',()=>{travel(index,byId.get(select.value)||null)});
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
  // A playable, evidence-only root-to-selected-source flight. Each waypoint is
  // a real ancestor, never a fabricated unlock, score or completion claim.
  if(trail.length>1){
   const flight=document.createElement('section');flight.className='pilgrimage-flight';
   flight.setAttribute('aria-label','Follow the documented lineage through the Tree');
   const heading=document.createElement('h3');heading.textContent='Follow this living lineage';
   const help=document.createElement('p');help.textContent='Travel from its documented root toward this source. Each stop focuses an actual published node.';
   const controls=document.createElement('div');controls.className='pilgrimage-flight-controls';
   const play=document.createElement('button');play.type='button';play.textContent='Play documented journey';play.setAttribute('aria-pressed','false');
   let timer=null;const pause=()=>{if(timer!==null){clearTimeout(timer);timer=null}play.textContent='Play documented journey';play.setAttribute('aria-pressed','false');if(flightStop===pause)flightStop=null};
   flightStop=pause;
   const begin=document.createElement('button');begin.type='button';begin.textContent='Start at the root';
   const prev=document.createElement('button');prev.type='button';prev.textContent='Previous source';
   const next=document.createElement('button');next.type='button';next.textContent='Next source';
   const status=document.createElement('p');status.className='pilgrimage-flight-status';status.setAttribute('role','status');
   const breadcrumb=document.createElement('ol');breadcrumb.className='pilgrimage-flight-trail';
   let step=trail.findIndex(n=>n.id===chosen.id);
   function showStep(nextStep){
    step=Math.max(0,Math.min(trail.length-1,nextStep));
    const record=trail[step];activeWaypoint=record;
    status.textContent='Published waypoint '+(step+1)+' of '+trail.length+': '+record.label+' ('+record.kind+')';
    prev.disabled=step===0;next.disabled=step===trail.length-1;
    breadcrumb.replaceChildren();
    trail.forEach((point,i)=>{const item=document.createElement('li');
     const button=document.createElement('button');button.type='button';button.textContent=point.label;
     button.setAttribute('aria-current',String(i===step));button.addEventListener('click',()=>{pause();showStep(i)});
     item.append(button);breadcrumb.append(item)});
    const anchor=tree.querySelector('.living-source-node[data-node="'+CSS.escape(record.id)+'"]');
    if(anchor){anchor.dispatchEvent(new Event('focus'));anchor.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}))}
    drawRoute(record);renderSpatial();
   }
   play.addEventListener('click',()=>{
    if(timer!==null){pause();return}
    if(step===trail.length-1)showStep(0);
    play.textContent='Pause journey';play.setAttribute('aria-pressed','true');
    const advance=()=>{if(body.hidden||!flight.isConnected){pause();return}if(step>=trail.length-1){pause();return}showStep(step+1);timer=setTimeout(advance,2100)};
    timer=setTimeout(advance,2100);
   });
   begin.addEventListener('click',()=>{pause();showStep(0)});
   prev.addEventListener('click',()=>{pause();showStep(step-1)});
   next.addEventListener('click',()=>{pause();showStep(step+1)});
   controls.append(begin,prev,next,play);flight.append(heading,help,controls,status,breadcrumb);
   detail.append(flight);
   // Do not hijack the current camera until the visitor explicitly starts.
   status.textContent='Ready: '+trail.length+' documented waypoints. No achievement is awarded.';
   prev.disabled=step===0;next.disabled=step===trail.length-1;
  }
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
 renderSpatial();
 if(!reduced.matches)requestAnimationFrame(()=>nav.classList.add('pilgrimage-arrived'));
}
toggle.addEventListener('click',()=>{const opening=body.hidden;body.hidden=!opening;nav.classList.toggle('pilgrimage-open',opening);toggle.setAttribute('aria-expanded',String(opening));toggle.textContent=opening?'Close voyage':'Begin the voyage';if(opening)render();else {stopFlight();drawRoute(null);tree.setAttribute('viewBox','0 0 1000 1000')}});
nav.querySelector('[data-action="previous"]').addEventListener('click',()=>{if(index>0)travel(index-1,null)});
nav.querySelector('[data-action="next"]').addEventListener('click',()=>{if(index<chapters.length-1)travel(index+1,null)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!body.hidden){stopFlight();body.hidden=true;nav.classList.remove('pilgrimage-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Begin the voyage';toggle.focus();drawRoute(null);tree.setAttribute('viewBox','0 0 1000 1000')}});
})();
