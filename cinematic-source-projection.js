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
const inspector=document.createElement('section');inspector.className='living-source-inspector';
inspector.setAttribute('aria-label','Selected source and documented provenance');
const heading=document.createElement('h2');heading.textContent='Explore the documented lineage';
const description=document.createElement('p');description.textContent='Select a luminous point to inspect its published ancestry.';
const lineage=document.createElement('ol');lineage.setAttribute('aria-label','Source-to-outcome ancestry');
const destination=document.createElement('a');destination.hidden=true;destination.textContent='Open documented destination';
destination.rel='noopener noreferrer';
const controls=document.createElement('div');controls.className='living-source-controls';
const searchLabel=document.createElement('label');searchLabel.textContent='Find a documented source or experience ';
const search=document.createElement('input');search.type='search';search.placeholder='Search the living Tree';search.setAttribute('aria-controls','living-source-directory');searchLabel.append(search);
const filterLabel=document.createElement('label');filterLabel.textContent=' Growth stage ';
const filter=document.createElement('select');for(const [value,label] of [['all','All stages'],['root','Roots'],['trunk','Trunk'],['branch','Branches'],['leaf','Leaves'],['flower','Flowers'],['fruit','Fruits']]){const option=document.createElement('option');option.value=value;option.textContent=label;filter.append(option)}filterLabel.append(filter);
const directory=document.createElement('ul');directory.id='living-source-directory';directory.className='living-source-directory';directory.setAttribute('aria-label','Accessible documented source directory');
const count=document.createElement('p');count.setAttribute('role','status');
controls.append(searchLabel,filterLabel);
inspector.append(heading,description,lineage,destination,controls,count,directory);host.after(inspector);

/* Evidence-bound voyage: a reversible source-to-outcome journey inside the hero.
   Camera framing is presentation only; no product, readiness or relationship is inferred. */
const voyage=document.createElement('nav');voyage.className='living-voyage';voyage.setAttribute('aria-label','Explore documented source lineage');
/* Source-backed chapter rail: chapters are biological stages, never invented products. */
const chapterRail=document.createElement('nav');chapterRail.className='living-chapter-rail';
chapterRail.setAttribute('aria-label','Journey through documented growth stages');
const chapterHeading=document.createElement('p');chapterHeading.className='living-chapter-heading';
chapterHeading.textContent='The six movements of emergence';
const chapterList=document.createElement('ol');chapterList.className='living-chapter-list';
chapterRail.append(chapterHeading,chapterList);
const stageOrder=['root','trunk','branch','leaf','flower','fruit'];
const stageNames={root:'Roots · Origins',trunk:'Trunk · Federation',branch:'Branches · Systems',leaf:'Leaves · Capabilities',flower:'Flowers · Emerging work',fruit:'Fruits · Experiences'};
const voyageTitle=document.createElement('h3');voyageTitle.textContent='Follow the living lineage';
const voyageHint=document.createElement('p');voyageHint.textContent='Choose a published root or source. Follow only documented parent-child connections.';
const voyageTrail=document.createElement('ol');voyageTrail.className='living-voyage-trail';
const voyageNext=document.createElement('div');voyageNext.className='living-voyage-next';
const voyageControls=document.createElement('div');voyageControls.className='living-voyage-controls';
const voyageBack=document.createElement('button');voyageBack.type='button';voyageBack.textContent='← Previous source';
const voyageReset=document.createElement('button');voyageReset.type='button';voyageReset.textContent='View whole Tree';
const voyageZoomIn=document.createElement('button');voyageZoomIn.type='button';voyageZoomIn.textContent='Zoom in +';
const voyageZoomOut=document.createElement('button');voyageZoomOut.type='button';voyageZoomOut.textContent='Zoom out −';
const voyageMap=document.createElement('svg');voyageMap.classList.add('living-voyage-map');voyageMap.setAttribute('viewBox','0 0 100 100');
voyageMap.setAttribute('role','img');voyageMap.setAttribute('aria-label','Spatial overview of the selected source on the Tree');
const mapMarker=document.createElementNS(ns,'circle');mapMarker.setAttribute('r','3');mapMarker.setAttribute('fill','#f5d68c');
const mapWindow=document.createElementNS(ns,'rect');mapWindow.setAttribute('class','living-voyage-window');mapWindow.setAttribute('fill','none');mapWindow.setAttribute('stroke','#f5d68c');mapWindow.setAttribute('stroke-width','1.4');voyageMap.append(mapWindow,mapMarker);
const cameraHelp=document.createElement('p');cameraHelp.className='living-camera-help';cameraHelp.textContent='Explore the Tree: drag to pan, pinch or scroll to zoom. Focus the Tree and use arrow keys to move, + or − to zoom, Home to reset. Select a luminous source to follow its documented lineage.';
const cameraAnnounce=document.createElement('p');cameraAnnounce.className='living-camera-announcement';cameraAnnounce.setAttribute('role','status');cameraAnnounce.setAttribute('aria-live','polite');
voyageControls.append(voyageBack,voyageReset,voyageZoomIn,voyageZoomOut);
voyage.append(voyageTitle,voyageHint,voyageTrail,voyageNext,voyageControls,cameraHelp,cameraAnnounce,voyageMap);
inspector.insertBefore(chapterRail,voyage);inspector.insertBefore(voyage,controls);
let view={x:0,y:0,w:1000,h:1000},previous=[];
const setView=(x,y,w)=>{
 const size=Math.max(250,Math.min(1000,w)),max=1000-size;
 view={x:Math.max(0,Math.min(max,x)),y:Math.max(0,Math.min(max,y)),w:size,h:size};
 scene.setAttribute('viewBox',[view.x,view.y,view.w,view.h].join(' '));
 mapWindow.setAttribute('x',String(view.x/10));mapWindow.setAttribute('y',String(view.y/10));
 mapWindow.setAttribute('width',String(view.w/10));mapWindow.setAttribute('height',String(view.h/10));
};
function frame(node){
 const p=locations[node.id];if(!p)return;
 const size=reduced.matches?800:560;
 setView(p[0]-size/2,p[1]-size/2,size);
 mapMarker.setAttribute('cx',String(p[0]/10));mapMarker.setAttribute('cy',String(p[1]/10));
}
function renderVoyage(node){
 const trail=pathTo(node);voyageTrail.replaceChildren();voyageNext.replaceChildren();
 for(const ancestor of trail){
  const item=document.createElement('li'),button=document.createElement('button');
  button.type='button';button.textContent=ancestor.label+' · '+ancestor.kind;
  if(ancestor.id===node.id)button.setAttribute('aria-current','step');
  button.addEventListener('click',()=>selectNode(ancestor));
  item.append(button);voyageTrail.append(item);
 }
 const children=visible.filter(n=>n.parent===node.id);
 const label=document.createElement('p');
 label.textContent=children.length?'Continue along documented relationships:':'No further documented relationship or outcome is available here.';
 voyageNext.append(label);
 for(const child of children){
  const button=document.createElement('button');button.type='button';button.textContent='Explore '+child.label+' · '+child.kind;
  button.addEventListener('click',()=>selectNode(child));voyageNext.append(button);
 }
 voyageBack.disabled=previous.length===0;
 frame(node);
}
voyageBack.addEventListener('click',()=>{
 const id=previous.pop(),node=byId.get(id);if(node)selectNode(node,false);
});
voyageReset.addEventListener('click',()=>{setView(0,0,1000);mapMarker.setAttribute('cx','50');mapMarker.setAttribute('cy','50')});
voyageZoomIn.addEventListener('click',()=>setView(view.x+view.w*.125,view.y+view.h*.125,view.w*.75));
voyageZoomOut.addEventListener('click',()=>setView(view.x-view.w/6,view.y-view.h/6,view.w*4/3));
/* Pan the actual SVG camera with one finger or a mouse; pinch with two fingers.
   Gesture recognition never invents nodes or changes documented selection. */
const pointers=new Map();let dragStart=null,pinchStart=null,gestureMoved=false;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
scene.setAttribute('tabindex','0');
scene.setAttribute('aria-keyshortcuts','ArrowUp ArrowDown ArrowLeft ArrowRight + - Home');
scene.setAttribute('aria-describedby','tree-desc');
const zoomAt=(factor,x,y)=>{const next=view.w*factor;const ratio=Math.max(0,Math.min(1,(x-view.x)/view.w)),vertical=Math.max(0,Math.min(1,(y-view.y)/view.h));setView(x-next*ratio,y-next*vertical,next)};
scene.addEventListener('wheel',e=>{
 if(!e.ctrlKey&&!e.metaKey)return; // preserve normal page scrolling
 e.preventDefault();const point=scene.createSVGPoint();point.x=e.clientX;point.y=e.clientY;
 const matrix=scene.getScreenCTM();if(!matrix)return;
 const local=point.matrixTransform(matrix.inverse());
 zoomAt(e.deltaY>0?1.12:.89,local.x,local.y);
},{passive:false});
scene.addEventListener('keydown',e=>{
 if(e.target!==scene)return;
 const shift=view.w*.12;
 if(e.key==='ArrowLeft')setView(view.x-shift,view.y,view.w);
 else if(e.key==='ArrowRight')setView(view.x+shift,view.y,view.w);
 else if(e.key==='ArrowUp')setView(view.x,view.y-shift,view.w);
 else if(e.key==='ArrowDown')setView(view.x,view.y+shift,view.w);
 else if(e.key==='+'||e.key==='=')zoomAt(.8,view.x+view.w/2,view.y+view.h/2);
 else if(e.key==='-'||e.key==='_')zoomAt(1.25,view.x+view.w/2,view.y+view.h/2);
 else if(e.key==='Home')resetMap();
 else return;
 e.preventDefault();cameraAnnounce.textContent='Tree camera '+Math.round(1000/view.w*100)+'% zoom.';
});
scene.style.touchAction='none';
scene.addEventListener('pointerdown',e=>{
 if(e.target.closest?.('.living-source-node'))return;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size===1){dragStart={x:e.clientX,y:e.clientY,view:{...view}};pinchStart=null;gestureMoved=false}
 if(pointers.size===2){const [a,b]=[...pointers.values()];pinchStart={distance:Math.max(1,distance(a,b)),view:{...view}};dragStart=null;gestureMoved=true}
 scene.setPointerCapture?.(e.pointerId);
});
scene.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId))return;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 const matrix=scene.getScreenCTM();if(!matrix)return;
 const localDelta=(dx,dy)=>{const inverse=matrix.inverse();return {x:dx*inverse.a+dy*inverse.c,y:dx*inverse.b+dy*inverse.d}};
 if(pointers.size===2&&pinchStart){
  const [a,b]=[...pointers.values()],size=pinchStart.view.w*pinchStart.distance/Math.max(1,distance(a,b));
  const cx=pinchStart.view.x+pinchStart.view.w/2,cy=pinchStart.view.y+pinchStart.view.h/2;
  setView(cx-size/2,cy-size/2,size);gestureMoved=true;
 }else if(pointers.size===1&&dragStart){
  const dx=e.clientX-dragStart.x,dy=e.clientY-dragStart.y;
  if(Math.hypot(dx,dy)>5)gestureMoved=true;
  if(gestureMoved){const delta=localDelta(dx,dy);setView(dragStart.view.x-delta.x,dragStart.view.y-delta.y,dragStart.view.w)}
 }
});
const finishGesture=e=>{
 if(!pointers.has(e.pointerId))return;
 pointers.delete(e.pointerId);
 if(scene.hasPointerCapture?.(e.pointerId))scene.releasePointerCapture(e.pointerId);
 if(pointers.size===0){dragStart=null;pinchStart=null;gestureMoved=false}
 else if(pointers.size===1){dragStart=null;pinchStart=null}
};
scene.addEventListener('pointerup',finishGesture);scene.addEventListener('pointercancel',finishGesture);
voyageMap.setAttribute('tabindex','0');voyageMap.setAttribute('role','button');
voyageMap.setAttribute('aria-label','Spatial overview: activate to view the entire Tree');
const resetMap=()=>{setView(0,0,1000);mapMarker.setAttribute('cx','50');mapMarker.setAttribute('cy','50')};
voyageMap.addEventListener('click',resetMap);
voyageMap.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();resetMap()}});
setView(0,0,1000);

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
let selectedId=null;
const anchors=new Map();
/* Only published records populate chapters. An empty fruit stage stays empty;
   no repository or unverified destination can be promoted into a product. */
function renderChapters(){
 chapterList.replaceChildren();
 for(const kind of stageOrder){
  const records=visible.filter(n=>n.kind===kind);
  const li=document.createElement('li'),button=document.createElement('button');
  button.type='button';button.className='living-chapter-choice';
  button.dataset.stage=kind;
  button.disabled=!records.length;
  button.textContent=stageNames[kind]+' · '+records.length+' documented';
  button.setAttribute('aria-pressed',String(!!selectedId&&byId.get(selectedId)?.kind===kind));
  button.addEventListener('click',()=>{
   const selected=byId.get(selectedId);
   const child=records.find(n=>n.parent===selected?.id);
   const ancestral=records.find(n=>selected&&pathTo(selected).some(a=>a.id===n.id));
   const target=child||ancestral||records[0];
   if(target)selectNode(target);
  });
  li.append(button);chapterList.append(li);
 }
}
function selectNode(node,record=true){
 if(record&&selectedId&&selectedId!==node.id)previous.push(selectedId);
 selectedId=node.id;focus(node);renderVoyage(node);renderChapters();
 const anchor=anchors.get(node.id);if(anchor){anchor.setAttribute('aria-current','true')}
 for(const [id,element] of anchors){if(id!==node.id)element.removeAttribute('aria-current')}
}
function renderDirectory(){
 const term=search.value.trim().toLocaleLowerCase(),kind=filter.value;
 const matches=visible.filter(n=>(kind==='all'||n.kind===kind)&&(!term||(n.label+' '+n.id+' '+n.kind).toLocaleLowerCase().includes(term)));
 directory.replaceChildren();
 for(const node of matches){
  const item=document.createElement('li'),button=document.createElement('button');
  button.type='button';button.textContent=node.label+' · '+node.kind;
  button.setAttribute('aria-pressed',String(node.id===selectedId));
  button.addEventListener('click',()=>{selectNode(node);const anchor=anchors.get(node.id);anchor?.focus({preventScroll:true});});
  item.append(button);directory.append(item);
 }
 count.textContent=matches.length+' of '+visible.length+' documented nodes shown. No live status is implied.';
}
search.addEventListener('input',renderDirectory);filter.addEventListener('change',renderDirectory);
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
 anchor.addEventListener('focus',()=>selectNode(node));
 anchor.addEventListener('click',e=>{e.preventDefault();selectNode(node)});
 anchor.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectNode(node)}});
 dots.append(anchor);anchors.set(node.id,anchor);
}
function focus(node){
 const trail=pathTo(node),ids=new Set(trail.map(n=>n.id));
 dots.querySelectorAll('[data-node]').forEach(a=>a.classList.toggle('living-source-active',ids.has(a.dataset.node)));
 lines.querySelectorAll('[data-from]').forEach(p=>p.classList.toggle('living-source-active',ids.has(p.dataset.from)&&ids.has(p.dataset.to)));
 status.textContent=node.label+' · '+node.kind+' · '+trail.map(n=>n.label).join(' → ')+(node.kind==='fruit'?' · documented visitor destination':' · source lineage');
 heading.textContent=node.label;
 description.textContent=node.kind==='root'?'Verified source root; not a finished visitor outcome.':node.kind==='fruit'?'Documented visitor-facing outcome.':'Published '+node.kind+' in the federation lineage; no completed outcome is implied.';
 lineage.replaceChildren();
 for(const ancestor of trail){const item=document.createElement('li');item.textContent=ancestor.label+' ('+ancestor.kind+')';lineage.append(item)}
 const link=safe(node.url);
 destination.hidden=!link;
 if(link){destination.href=link;destination.textContent=node.kind==='fruit'?'Open documented experience':'Open published source';if(new URL(link).origin!==location.origin){destination.target='_blank'}else destination.removeAttribute('target')}
 else {destination.removeAttribute('href');destination.removeAttribute('target')}
 if(directory.children.length)for(const button of directory.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.textContent===node.label+' · '+node.kind));
}
renderDirectory();renderChapters();
host.addEventListener('pointerleave',()=>{if(!reduced.matches&&!host.contains(document.activeElement)){dots.querySelectorAll('.living-source-active').forEach(n=>n.classList.remove('living-source-active'));lines.querySelectorAll('.living-source-active').forEach(n=>n.classList.remove('living-source-active'))}});
})();