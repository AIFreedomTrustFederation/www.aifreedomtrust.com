/* Seven cinematic viewpoints over the existing six biological kinds. No new doctrine or lineage records. */
(()=>{'use strict';
const host=document.getElementById('seven-movements');if(!host)return;
const source=window.AIFT_LINEAGE_NODES;
const kinds=['root','trunk','branch','leaf','flower','fruit'];
const chapters=[{kind:null,title:'The Living Whole',subtitle:'A single federation, nourished by real source roots.'},
...kinds.map(kind=>({kind,title:({root:'The Roots',trunk:'The Shared Trunk',branch:'The Branches',leaf:'The Leaves',flower:'The Flowers',fruit:'The Fruits'})[kind],subtitle:({root:'The verifiable source systems',trunk:'The documented federation',branch:'The systems and subsystems',leaf:'The documented capabilities',flower:'The emerging, evidenced work',fruit:'The demonstrable visitor experiences'})[kind]}))];
const safe=url=>{try{const u=new URL(url,location.href);return u.protocol==='https:'||(u.protocol==='http:'&&u.origin===location.origin)?u.href:null}catch{return null}};
const byId=new Map((Array.isArray(source)?source:[]).map(n=>[n.id,n]));
function lineage(n){const trail=[],seen=new Set();let p=n;while(p&&!seen.has(p.id)){trail.unshift(p);seen.add(p.id);p=p.parent?byId.get(p.parent):null}return p||(!trail.length)||(!trail[0]||trail[0].parent)?null:trail}
function qualified(n){if(n.kind!=='fruit')return true;const path=lineage(n);return !!(path&&path.some(p=>p.kind==='root')&&safe(n.url)&&!/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/i.test(safe(n.url)))}
const state={chapter:0,selected:null,history:[],journey:[]};
// The spatial constellation uses only published records; coordinates are deterministic, never random.
let scene;
const NS='http://www.w3.org/2000/svg';
const layer=document.createElementNS(NS,'g');layer.setAttribute('class','seven-source-constellation');
const camera={x:0,y:0,size:600};
const cameraHome=()=>frame(300,300,600);
const cameraStep=(direction)=>{const c={x:camera.x+camera.size/2,y:camera.y+camera.size/2};frame(c.x,c.y,camera.size*(direction>0?.8:1.25))};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Biological projection: source roots below the shared trunk; branches and verified
// outcomes grow upward. Only published ancestry influences parent-relative placement.
const stageHeight={root:548,trunk:402,branch:290,leaf:178,flower:112,fruit:58};
const pointCache=new Map();
function stableAngle(id){let h=2166136261;for(const c of String(id)){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0}return (h%10007)/10007}
function point(n){
 if(pointCache.has(n.id))return pointCache.get(n.id);
 const stage=n.kind;
 const t=stableAngle(n.id);
 const parent=n.parent?byId.get(n.parent):null;
 // A missing/circular lineage must not create an inferred parent relationship.
 const trail=lineage(n);
 const anchored=!!(trail&&parent&&trail.includes(parent));
 let x;
 if(stage==='root')x=80+t*440;
 else if(stage==='trunk')x=300+(t-.5)*36;
 else if(anchored){
   const p=point(parent);
   const spread=stage==='branch'?190:stage==='leaf'?105:stage==='flower'?75:55;
   x=p.x+(t-.5)*spread*2;
 }else x=300+(t-.5)*440;
 const result={x:clamp(x,24,576),y:stageHeight[stage]??300};
 pointCache.set(n.id,result);
 return result;
}
function frame(x=300,y=300,size=600){camera.size=clamp(size,120,600);camera.x=clamp(x-camera.size/2,0,600-camera.size);camera.y=clamp(y-camera.size/2,0,600-camera.size);scene.setAttribute('viewBox',[camera.x,camera.y,camera.size,camera.size].join(' '))}
// Camera travel is purely visual: route eligibility comes from published ancestry.
let voyageAnimation=0;
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
function stopVoyageCamera(){if(voyageAnimation){cancelAnimationFrame(voyageAnimation);voyageAnimation=0}}
function travelToNode(node){
 const target=visiblePoint(node);
 stopVoyageCamera();
 if(motionPreference.matches||document.visibilityState==='hidden'){frame(target.x,target.y,230);return}
 const from={x:camera.x+camera.size/2,y:camera.y+camera.size/2,size:camera.size};
 const duration=520;let started=null;
 const tick=now=>{
   if(started===null)started=now;
   const t=clamp((now-started)/duration,0,1);
   const ease=t*t*(3-2*t);
   frame(from.x+(target.x-from.x)*ease,from.y+(target.y-from.y)*ease,from.size+(230-from.size)*ease);
   voyageAnimation=t<1?requestAnimationFrame(tick):0;
 };
 voyageAnimation=requestAnimationFrame(tick);
}
// Deterministic screen-space separation for dense published records. The layout
// changes coordinates only: it never adds records, edges, products or evidence.
const visiblePositions=new Map();
function separateVisibleNodes(visible){
 visiblePositions.clear();
 const lanes=new Map();
 for(const n of visible){
   const p=point(n),lane=n.kind||'unknown';
   if(!lanes.has(lane))lanes.set(lane,[]);
   lanes.get(lane).push({id:n.id,x:p.x,y:p.y});
 }
 for(const nodes of lanes.values()){
   nodes.sort((a,b)=>a.x-b.x||String(a.id).localeCompare(String(b.id)));
   // Alternate vertical sublanes so dense canopy clusters remain selectable.
   const occupied=[[],[],[]];
   for(const n of nodes){
     let best=null;
     for(let lane=0;lane<3;lane++){
       const offset=(lane-1)*18;
       const x=clamp(n.x,18,582);
       const distance=occupied[lane].length?x-occupied[lane][occupied[lane].length-1]:Infinity;
       const candidate={x,y:clamp(n.y+offset,18,582),lane,distance};
       if(!best||candidate.distance>best.distance)best=candidate;
     }
     // Spread within the same sublane only when required, bounded to the SVG.
     best.x=clamp(Math.max(best.x,(occupied[best.lane].at(-1)??-100)+13),18,582);
     occupied[best.lane].push(best.x);
     visiblePositions.set(n.id,{x:best.x,y:best.y});
   }
 }
}
const visiblePoint=n=>visiblePositions.get(n.id)||point(n);
function drawConstellation(entries){
 layer.replaceChildren();
 const visible=entries.slice(0,180);
 separateVisibleNodes(visible);
 const visibleById=new Map(visible.map(n=>[n.id,n]));
 const selected=state.selected?byId.get(state.selected):null;
 const trail=selected?lineage(selected):null;
 const lineageEdges=new Set();
 if(trail)for(let i=1;i<trail.length;i++)lineageEdges.add(trail[i-1].id+'>'+trail[i].id);
 // Draw documented parent-child relationships before the interactive nodes.
 // An absent parent is an evidence gap, not a fabricated connection.
 const connections=document.createElementNS(NS,'g');
 connections.setAttribute('class','seven-source-connections');
 connections.setAttribute('aria-hidden','true');
 for(const child of visible){
   const parent=child.parent?visibleById.get(child.parent):null;
   if(!parent)continue;
   const from=visiblePoint(parent),to=visiblePoint(child);
   const path=document.createElementNS(NS,'path');
   const midY=(from.y+to.y)/2;
   path.setAttribute('d','M'+from.x+' '+from.y+' C'+from.x+' '+midY+' '+to.x+' '+midY+' '+to.x+' '+to.y);
   path.setAttribute('class',lineageEdges.has(parent.id+'>'+child.id)?'seven-source-link seven-source-link-active':'seven-source-link');
   connections.append(path);
 }
 layer.append(connections);
 for(const n of visible){const pos=visiblePoint(n);const circle=document.createElementNS(NS,'circle');circle.setAttribute('cx',pos.x);circle.setAttribute('cy',pos.y);circle.setAttribute('r',n.id===state.selected?'10':'6');circle.setAttribute('fill',n.kind==='root'?'#fa7582':n.kind==='fruit'?'#f7d18a':'#64e6b4');circle.setAttribute('stroke','#071727');circle.setAttribute('stroke-width','2');if(trail&&trail.some(p=>p.id===n.id))circle.setAttribute('class','seven-lineage-node');circle.setAttribute('role','button');circle.setAttribute('tabindex','0');circle.setAttribute('aria-label',n.label+' · '+n.kind);const title=document.createElementNS(NS,'title');title.textContent=n.label;circle.append(title);const activate=()=>{state.selected=n.id;render();travelToNode(n);detail.focus({preventScroll:true})};circle.addEventListener('click',activate);circle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}});layer.append(circle)}}
// Initialize only after the canonical stage markup exists. The prior initialization
// ran before host.innerHTML and discarded the constellation and its event listeners.
function bindSpatialCamera(){
 scene=host.querySelector('.seven-stage svg');
 scene.append(layer);
 scene.parentElement.setAttribute('aria-hidden','false');
 scene.setAttribute('aria-hidden','false');
 scene.setAttribute('role','group');
 scene.setAttribute('tabindex','0');
 scene.setAttribute('aria-label','Interactive source-backed constellation; use Tab and Enter to inspect a source');
 scene.style.touchAction='none';
 const pointers=new Map();
 let gesture=null;
 const center=()=>({x:camera.x+camera.size/2,y:camera.y+camera.size/2});
 const toWorld=(clientX,clientY)=>{const r=scene.getBoundingClientRect();return {x:camera.x+(clientX-r.left)*camera.size/(r.width||1),y:camera.y+(clientY-r.top)*camera.size/(r.height||1)}};
 const anchoredFrame=(anchor,clientX,clientY,size)=>{stopVoyageCamera();const r=scene.getBoundingClientRect();const next=clamp(size,120,600);camera.size=next;camera.x=clamp(anchor.x-(clientX-r.left)*next/(r.width||1),0,600-next);camera.y=clamp(anchor.y-(clientY-r.top)*next/(r.height||1),0,600-next);scene.setAttribute('viewBox',[camera.x,camera.y,next,next].join(' '))};
 const apply=(x,y,size)=>{stopVoyageCamera();frame(x,y,size)};
 const snapshot=()=>{
   const ps=[...pointers.values()];
   if(ps.length===1)return {mode:'pan',point:ps[0],center:center(),size:camera.size};
   if(ps.length>=2){
     const a=ps[0],b=ps[1];
     const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};return {mode:'pinch',mid,distance:Math.hypot(a.x-b.x,a.y-b.y)||1,anchor:toWorld(mid.x,mid.y),size:camera.size};
   }
   return null;
 };
 scene.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse'&&e.button!==0)return;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   scene.setPointerCapture(e.pointerId);
   gesture=snapshot();
 });
 scene.addEventListener('pointermove',e=>{
   if(!pointers.has(e.pointerId))return;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   const rect=scene.getBoundingClientRect();
   if(!rect.width||!rect.height||!gesture)return;
   const ps=[...pointers.values()];
   if(ps.length===1&&gesture.mode==='pan'){
     apply(gesture.center.x-(ps[0].x-gesture.point.x)*gesture.size/rect.width,
       gesture.center.y-(ps[0].y-gesture.point.y)*gesture.size/rect.height,gesture.size);
   }else if(ps.length>=2&&gesture.mode==='pinch'){
     const a=ps[0],b=ps[1],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
     const distance=Math.hypot(a.x-b.x,a.y-b.y)||1;
     const size=clamp(gesture.size*gesture.distance/distance,120,600);
     anchoredFrame(gesture.anchor,mid.x,mid.y,size);
   }
 });
 const release=e=>{pointers.delete(e.pointerId);gesture=snapshot()};
 scene.addEventListener('pointerup',release);
 scene.addEventListener('pointercancel',release);
 scene.addEventListener('lostpointercapture',release);
 scene.addEventListener('keydown',e=>{
   if(e.target!==scene)return;
   const step=camera.size*.12;
   if(e.key==='+'||e.key==='='){e.preventDefault();cameraStep(1)}
   else if(e.key==='-'){e.preventDefault();cameraStep(-1)}
   else if(e.key==='Home'){e.preventDefault();cameraHome()}
   else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
     e.preventDefault();const dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;
     const dy=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;
     frame(camera.x+camera.size/2+dx,camera.y+camera.size/2+dy,camera.size);
   }
 });
 scene.addEventListener('wheel',e=>{
   if(!e.ctrlKey)return;
   e.preventDefault();
   const r=scene.getBoundingClientRect();const anchor=toWorld(e.clientX,e.clientY);anchoredFrame(anchor,e.clientX,e.clientY,camera.size*(e.deltaY>0?1.12:.88));
 },{passive:false});
 frame();
}

const chapterFor=n=>Math.max(1,kinds.indexOf(n.kind)+1);
host.innerHTML='<div class="seven-sky" aria-hidden="true"><div class="seven-orbit"></div><div class="seven-ribbon"></div><div class="seven-halo"></div></div><div class="seven-content"><p class="seven-eyebrow">THE LIVING UNIVERSE · SEVEN VIEWPOINTS</p><h2 id="seven-title" tabindex="-1"></h2><p id="seven-subtitle"></p><div class="seven-controls"><button type="button" id="seven-prev">← Previous</button><span id="seven-counter" aria-live="polite"></span><button type="button" id="seven-next">Next →</button></div><div class="seven-controls"><button type="button" id="seven-back" disabled>← Return to previous view</button><span id="seven-breadcrumb" aria-live="polite"></span></div><div id="seven-rail" class="seven-rail" role="group" aria-label="Choose an exploration viewpoint"></div><div class="seven-grid"><div class="seven-stage" aria-hidden="true"><svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="seven-bark" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#fa7582"/><stop offset=".48" stop-color="#64e6b4"/><stop offset="1" stop-color="#6cbcff"/></linearGradient></defs><circle cx="300" cy="275" r="235" fill="none" stroke="#f7d18a" stroke-opacity=".22"/><circle cx="300" cy="275" r="190" fill="none" stroke="#f7d18a" stroke-opacity=".2"/><path d="M300 480 Q200 530 80 580 M300 480 Q400 530 520 580 M300 480 Q280 550 240 600 M300 480 Q320 550 360 600" fill="none" stroke="#fa7582" stroke-width="9" stroke-linecap="round"/><path d="M300 480 Q280 310 300 100 M300 300 Q180 240 80 180 M300 260 Q420 210 520 165 M300 190 Q230 130 185 75 M300 180 Q380 110 410 60" fill="none" stroke="url(#seven-bark)" stroke-width="18" stroke-linecap="round"/><g fill="#64e6b4" opacity=".6"><circle cx="85" cy="180" r="30"/><circle cx="520" cy="165" r="35"/><circle cx="185" cy="75" r="28"/><circle cx="410" cy="60" r="30"/><circle cx="300" cy="100" r="36"/></g></svg><div id="seven-map" class="seven-map" role="group" aria-label="Source-backed spatial overview"></div></div><div class="seven-inspector"><label for="seven-search">Discover documented sources</label><input id="seven-search" type="search" placeholder="Search this viewpoint"><p id="seven-evidence" class="seven-evidence" role="status"></p><div id="seven-list" class="seven-list"></div><div id="seven-detail" class="seven-detail" aria-live="polite"></div></div></div><p class="seven-disclaimer">Seven exploration viewpoints; six biological stages. Published lineage is curated evidence, not a live operational status. No undocumented outcome is presented as fruit.</p></div>';
const $=id=>host.querySelector('#'+id);
bindSpatialCamera();
const rail=$('seven-rail'),list=$('seven-list'),detail=$('seven-detail'),search=$('seven-search');
// An evidence journey is a guided reading of published ancestry, not an XP system.
const journey=document.createElement('section');
journey.className='seven-journey';
journey.setAttribute('aria-label','Evidence-backed lineage journey');
journey.innerHTML='<div class="seven-journey-head"><h3>Follow the evidence</h3><p id="seven-journey-status" role="status">Select a documented source to trace its provenance.</p></div><ol id="seven-journey-steps"></ol><button type="button" id="seven-journey-reset">Clear journey</button>';
host.querySelector('.seven-inspector').append(journey);
const journeySteps=$('seven-journey-steps'),journeyStatus=$('seven-journey-status');
function drawJourney(n){
 journeySteps.replaceChildren();
 const trail=n?lineage(n):null;
 if(!trail){journeyStatus.textContent=n?'Ancestry cannot be verified from the published records. No completion is awarded.':'Select a documented source to trace its provenance.';return}
 const isOutcome=n.kind==='fruit'&&qualified(n);
 journeyStatus.textContent=trail.length+' published lineage record'+(trail.length===1?'':'s')+' · '+(isOutcome?'Documented outcome with a destination':'Source and capability exploration')+'. This is provenance, not a live CI claim.';
 for(const ancestor of trail){
   const item=document.createElement('li');
   const button=document.createElement('button');button.type='button';
   button.textContent=ancestor.kind+' · '+ancestor.label;
   button.setAttribute('aria-current',String(ancestor.id===n.id));
   button.addEventListener('click',()=>{state.history.push({chapter:state.chapter,selected:state.selected});state.chapter=chapterFor(ancestor);state.selected=ancestor.id;search.value='';render();const p=point(ancestor);frame(p.x,p.y,230);detail.focus({preventScroll:true})});
   item.append(button);journeySteps.append(item);
 }
}
$('seven-journey-reset').addEventListener('click',()=>{state.selected=null;state.history=[];search.value='';render();cameraHome();$('seven-title').focus({preventScroll:true})});
// A source-to-outcome voyage follows only the complete, published ancestry chain.
let voyageTrail=[],voyageIndex=-1;
const voyageControls=document.createElement('div');
voyageControls.className='seven-voyage-controls';
voyageControls.setAttribute('role','group');
voyageControls.setAttribute('aria-label','Travel through documented lineage');
const voyageStart=document.createElement('button'),voyagePrevious=document.createElement('button'),voyageNext=document.createElement('button');
voyageStart.type=voyagePrevious.type=voyageNext.type='button';
voyageStart.textContent='Begin lineage voyage';
voyagePrevious.textContent='← Earlier source';
voyageNext.textContent='Next source →';
const voyagePosition=document.createElement('span');voyagePosition.setAttribute('role','status');
voyageControls.append(voyageStart,voyagePrevious,voyageNext,voyagePosition);
journey.append(voyageControls);
function updateVoyageControls(){
 voyageStart.disabled=!voyageTrail.length;
 voyagePrevious.disabled=voyageIndex<=0;
 voyageNext.disabled=voyageIndex<0||voyageIndex>=voyageTrail.length-1;
 voyagePosition.textContent=voyageTrail.length?(voyageIndex<0?'Ready · '+voyageTrail.length+' documented steps':(voyageIndex+1)+' of '+voyageTrail.length+' documented steps'):'No complete published ancestry';
}
function visitVoyage(index){
 if(index<0||index>=voyageTrail.length)return;
 const node=voyageTrail[index];if(!byId.has(node.id))return;
 voyageIndex=index;
 state.history.push({chapter:state.chapter,selected:state.selected});
 state.chapter=chapterFor(node);state.selected=node.id;search.value='';
 render();
 travelToNode(node);
 updateVoyageControls();
 $('seven-title').focus({preventScroll:true});
}
voyageStart.addEventListener('click',()=>visitVoyage(0));
voyagePrevious.addEventListener('click',()=>visitVoyage(voyageIndex-1));
voyageNext.addEventListener('click',()=>visitVoyage(voyageIndex+1));
function syncVoyage(n){
 const trail=n?lineage(n):null;
 // Do not retain a stale route when its source selection changes.
 if(!trail||!voyageTrail.some(item=>item.id===n.id)){
   voyageTrail=trail||[];voyageIndex=-1;
 }
 updateVoyageControls();
}
const cameraControls=document.createElement('div');cameraControls.className='seven-camera-controls';cameraControls.setAttribute('role','group');cameraControls.setAttribute('aria-label','Constellation camera controls');
for(const [label,action] of [['Zoom in',()=>cameraStep(1)],['Zoom out',()=>cameraStep(-1)],['Reset view',cameraHome]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',action);cameraControls.append(b)}
scene.parentElement.append(cameraControls);detail.setAttribute('tabindex','-1');
chapters.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String(i+1).padStart(2,'0')+' · '+c.title;b.addEventListener('click',()=>move(i,true));rail.append(b)});
function show(n){state.selected=n.id;detail.replaceChildren();const h=document.createElement('h3');h.textContent=n.label;const p=document.createElement('p');p.textContent=n.desc||'No description in the published lineage.';detail.append(h,p);const trail=lineage(n);const t=document.createElement('p');t.className='seven-trail';t.textContent=trail?trail.map(x=>x.label).join(' → '):'Ancestry is incomplete or circular; outcome cannot be verified.';detail.append(t);if(trail){const nav=document.createElement('nav');nav.setAttribute('aria-label','Trace source ancestry');for(const ancestor of trail){const button=document.createElement('button');button.type='button';button.textContent=ancestor.label;button.addEventListener('click',()=>{state.history.push({chapter:state.chapter,selected:state.selected});state.chapter=chapterFor(ancestor);state.selected=ancestor.id;search.value='';render();$('seven-title').focus({preventScroll:true})});nav.append(button)}detail.append(nav)}const url=qualified(n)?safe(n.url):null;if(url){const a=document.createElement('a');a.href=url;a.textContent=n.kind==='fruit'?'Open documented experience':'Inspect published source';a.rel='noopener noreferrer';if(new URL(url).origin!==location.origin)a.target='_blank';detail.append(a)}}
function render(){const c=chapters[state.chapter],all=Array.isArray(source)?source:[];host.dataset.movement=String(state.chapter);$('seven-back').disabled=!state.history.length;$('seven-breadcrumb').textContent='Federation / '+c.title;$('seven-title').textContent=c.title;$('seven-subtitle').textContent=c.subtitle;$('seven-counter').textContent=(state.chapter+1)+' / 7';$('seven-prev').disabled=state.chapter===0;$('seven-next').disabled=state.chapter===6;[...rail.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===state.chapter)));const q=search.value.trim().toLocaleLowerCase();const entries=all.filter(n=>(!c.kind||n.kind===c.kind)&&qualified(n)&&(!q||(n.label+' '+(n.desc||'')).toLocaleLowerCase().includes(q)));$('seven-evidence').textContent=entries.length+' documented '+(c.kind||'lineage')+' record'+(entries.length===1?'':'s')+' in this view'+(entries.length>180?' · First 180 shown on the constellation; search to locate other records.':'');list.replaceChildren();const map=$('seven-map');map.replaceChildren();for(const kind of kinds){const count=all.filter(n=>n.kind===kind&&qualified(n)).length;const b=document.createElement('button');b.type='button';b.textContent=kind+' · '+count;b.setAttribute('aria-pressed',String(c.kind===kind));b.addEventListener('click',()=>move(kinds.indexOf(kind)+1,true));map.append(b)}if(!entries.length){const p=document.createElement('p');p.textContent='No published records match this view. No outcome is inferred.';list.append(p)}for(const n of entries){const b=document.createElement('button');b.type='button';b.textContent=n.label;b.setAttribute('aria-pressed',String(state.selected===n.id));b.addEventListener('click',()=>{show(n);render()});list.append(b)}drawConstellation(entries);const selected=entries.find(n=>n.id===state.selected);if(selected){show(selected);drawJourney(selected);syncVoyage(selected)}else{drawJourney(null);syncVoyage(null);state.selected=null;detail.replaceChildren();const p=document.createElement('p');p.textContent='Select a documented record to inspect its ancestry and destination.';detail.append(p)}}
function move(i,focus=false){stopVoyageCamera();frame();if(i<0||i>=chapters.length)return;state.history.push({chapter:state.chapter,selected:state.selected});state.chapter=i;state.selected=null;search.value='';render();if(focus)$('seven-title').focus({preventScroll:true})}
$('seven-back').addEventListener('click',()=>{const prior=state.history.pop();if(!prior)return;state.chapter=prior.chapter;state.selected=prior.selected;search.value='';render();$('seven-title').focus({preventScroll:true})});$('seven-prev').addEventListener('click',()=>move(state.chapter-1,true));$('seven-next').addEventListener('click',()=>move(state.chapter+1,true));search.addEventListener('input',render);render();
})();