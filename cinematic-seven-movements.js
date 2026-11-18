/* Seven cinematic viewpoints over the existing six biological kinds. No new doctrine or lineage records. */
(()=>{'use strict';
const host=document.getElementById('seven-movements');if(!host)return;
const source=window.AIFT_LINEAGE_NODES;
const kinds=['root','trunk','branch','leaf','flower','fruit'];
const chapters=[{kind:null,title:'The Living Whole',subtitle:'A single federation, nourished by real source roots.'},
...kinds.map(kind=>({kind,title:({root:'The Roots',trunk:'The Shared Trunk',branch:'The Branches',leaf:'The Leaves',flower:'The Flowers',fruit:'The Fruits'})[kind],subtitle:({root:'The verifiable source systems',trunk:'The documented federation',branch:'The systems and subsystems',leaf:'The documented capabilities',flower:'The emerging, evidenced work',fruit:'The demonstrable visitor experiences'})[kind]}))];
const safe=url=>{try{const u=new URL(url,location.href);return ['https:','http:'].includes(u.protocol)&&(!/^github\.com$/i.test(u.hostname)||u.protocol==='https:')&&!/^(javascript|data):/i.test(url)?u.href:null}catch{return null}};
const byId=new Map((Array.isArray(source)?source:[]).map(n=>[n.id,n]));
function lineage(n){const trail=[],seen=new Set();let p=n;while(p&&!seen.has(p.id)){trail.unshift(p);seen.add(p.id);p=p.parent?byId.get(p.parent):null}return p?null:trail}
function qualified(n){if(n.kind!=='fruit')return true;const path=lineage(n);return !!(path&&path.some(p=>p.kind==='root')&&safe(n.url)&&!/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/i.test(safe(n.url)))}
const state={chapter:0,selected:null,history:[]};
// The spatial constellation uses only published records; coordinates are deterministic, never random.
let scene;
const NS='http://www.w3.org/2000/svg';
const layer=document.createElementNS(NS,'g');layer.setAttribute('class','seven-source-constellation');
const camera={x:0,y:0,size:600};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function point(n){let h=2166136261;for(const c of String(n.id)){h=Math.imul(h^c.charCodeAt(0),16777619)>>>0}const stage=Math.max(0,kinds.indexOf(n.kind));const angle=((h%10007)/10007)*Math.PI*2;const radius=stage===0?220:stage===1?30:stage===2?110:stage===3?175:stage===4?215:245;return {x:300+Math.cos(angle)*radius,y:300+Math.sin(angle)*radius}}
function frame(x=300,y=300,size=600){camera.size=clamp(size,120,600);camera.x=clamp(x-camera.size/2,0,600-camera.size);camera.y=clamp(y-camera.size/2,0,600-camera.size);scene.setAttribute('viewBox',[camera.x,camera.y,camera.size,camera.size].join(' '))}
function drawConstellation(entries){layer.replaceChildren();const visible=entries.slice(0,180);for(const n of visible){const pos=point(n);const circle=document.createElementNS(NS,'circle');circle.setAttribute('cx',pos.x);circle.setAttribute('cy',pos.y);circle.setAttribute('r',n.id===state.selected?'10':'6');circle.setAttribute('fill',n.kind==='root'?'#fa7582':n.kind==='fruit'?'#f7d18a':'#64e6b4');circle.setAttribute('stroke','#071727');circle.setAttribute('stroke-width','2');circle.setAttribute('role','button');circle.setAttribute('tabindex','0');circle.setAttribute('aria-label',n.label+' · '+n.kind);const title=document.createElementNS(NS,'title');title.textContent=n.label;circle.append(title);const activate=()=>{state.selected=n.id;render();const p=point(n);frame(p.x,p.y,230);detail.focus({preventScroll:true})};circle.addEventListener('click',activate);circle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}});layer.append(circle)}}
// Initialize only after the canonical stage markup exists. The prior initialization
// ran before host.innerHTML and discarded the constellation and its event listeners.
function bindSpatialCamera(){
 scene=host.querySelector('.seven-stage svg');
 scene.append(layer);
 scene.parentElement.setAttribute('aria-hidden','false');
 scene.setAttribute('aria-hidden','false');
 scene.setAttribute('role','group');
 scene.setAttribute('aria-label','Interactive source-backed constellation; use Tab and Enter to inspect a source');
 scene.style.touchAction='none';
 const pointers=new Map();
 let gesture=null;
 const center=()=>({x:camera.x+camera.size/2,y:camera.y+camera.size/2});
 const apply=(x,y,size)=>frame(x,y,size);
 const snapshot=()=>{
   const ps=[...pointers.values()];
   if(ps.length===1)return {mode:'pan',point:ps[0],center:center(),size:camera.size};
   if(ps.length>=2){
     const a=ps[0],b=ps[1];
     return {mode:'pinch',mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance:Math.hypot(a.x-b.x,a.y-b.y)||1,center:center(),size:camera.size};
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
     apply(gesture.center.x-(mid.x-gesture.mid.x)*size/rect.width,
       gesture.center.y-(mid.y-gesture.mid.y)*size/rect.height,size);
   }
 });
 const release=e=>{pointers.delete(e.pointerId);gesture=snapshot()};
 scene.addEventListener('pointerup',release);
 scene.addEventListener('pointercancel',release);
 scene.addEventListener('lostpointercapture',release);
 scene.addEventListener('wheel',e=>{
   if(!e.ctrlKey)return;
   e.preventDefault();
   apply(camera.x+camera.size/2,camera.y+camera.size/2,camera.size*(e.deltaY>0?1.12:.88));
 },{passive:false});
 frame();
}

const chapterFor=n=>Math.max(1,kinds.indexOf(n.kind)+1);
host.innerHTML='<div class="seven-sky" aria-hidden="true"><div class="seven-orbit"></div><div class="seven-ribbon"></div><div class="seven-halo"></div></div><div class="seven-content"><p class="seven-eyebrow">THE LIVING UNIVERSE · SEVEN VIEWPOINTS</p><h2 id="seven-title" tabindex="-1"></h2><p id="seven-subtitle"></p><div class="seven-controls"><button type="button" id="seven-prev">← Previous</button><span id="seven-counter" aria-live="polite"></span><button type="button" id="seven-next">Next →</button></div><div class="seven-controls"><button type="button" id="seven-back" disabled>← Return to previous view</button><span id="seven-breadcrumb" aria-live="polite"></span></div><div id="seven-rail" class="seven-rail" role="group" aria-label="Choose an exploration viewpoint"></div><div class="seven-grid"><div class="seven-stage" aria-hidden="true"><svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="seven-bark" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#fa7582"/><stop offset=".48" stop-color="#64e6b4"/><stop offset="1" stop-color="#6cbcff"/></linearGradient></defs><circle cx="300" cy="275" r="235" fill="none" stroke="#f7d18a" stroke-opacity=".22"/><circle cx="300" cy="275" r="190" fill="none" stroke="#f7d18a" stroke-opacity=".2"/><path d="M300 480 Q200 530 80 580 M300 480 Q400 530 520 580 M300 480 Q280 550 240 600 M300 480 Q320 550 360 600" fill="none" stroke="#fa7582" stroke-width="9" stroke-linecap="round"/><path d="M300 480 Q280 310 300 100 M300 300 Q180 240 80 180 M300 260 Q420 210 520 165 M300 190 Q230 130 185 75 M300 180 Q380 110 410 60" fill="none" stroke="url(#seven-bark)" stroke-width="18" stroke-linecap="round"/><g fill="#64e6b4" opacity=".6"><circle cx="85" cy="180" r="30"/><circle cx="520" cy="165" r="35"/><circle cx="185" cy="75" r="28"/><circle cx="410" cy="60" r="30"/><circle cx="300" cy="100" r="36"/></g></svg><div id="seven-map" class="seven-map" role="group" aria-label="Source-backed spatial overview"></div></div><div class="seven-inspector"><label for="seven-search">Discover documented sources</label><input id="seven-search" type="search" placeholder="Search this viewpoint"><p id="seven-evidence" class="seven-evidence" role="status"></p><div id="seven-list" class="seven-list"></div><div id="seven-detail" class="seven-detail" aria-live="polite"></div></div></div><p class="seven-disclaimer">Seven exploration viewpoints; six biological stages. Published lineage is curated evidence, not a live operational status. No undocumented outcome is presented as fruit.</p></div>';
const $=id=>host.querySelector('#'+id);
bindSpatialCamera();
const rail=$('seven-rail'),list=$('seven-list'),detail=$('seven-detail'),search=$('seven-search');detail.setAttribute('tabindex','-1');
chapters.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String(i+1).padStart(2,'0')+' · '+c.title;b.addEventListener('click',()=>move(i,true));rail.append(b)});
function show(n){state.selected=n.id;detail.replaceChildren();const h=document.createElement('h3');h.textContent=n.label;const p=document.createElement('p');p.textContent=n.desc||'No description in the published lineage.';detail.append(h,p);const trail=lineage(n);const t=document.createElement('p');t.className='seven-trail';t.textContent=trail?trail.map(x=>x.label).join(' → '):'Ancestry is incomplete or circular; outcome cannot be verified.';detail.append(t);if(trail){const nav=document.createElement('nav');nav.setAttribute('aria-label','Trace source ancestry');for(const ancestor of trail){const button=document.createElement('button');button.type='button';button.textContent=ancestor.label;button.addEventListener('click',()=>{state.history.push({chapter:state.chapter,selected:state.selected});state.chapter=chapterFor(ancestor);state.selected=ancestor.id;search.value='';render();$('seven-title').focus({preventScroll:true})});nav.append(button)}detail.append(nav)}const url=safe(n.url);if(url){const a=document.createElement('a');a.href=url;a.textContent=n.kind==='fruit'?'Open documented experience':'Inspect published source';a.rel='noopener noreferrer';if(new URL(url).origin!==location.origin)a.target='_blank';detail.append(a)}}
function render(){const c=chapters[state.chapter],all=Array.isArray(source)?source:[];host.dataset.movement=String(state.chapter);$('seven-back').disabled=!state.history.length;$('seven-breadcrumb').textContent='Federation / '+c.title;$('seven-title').textContent=c.title;$('seven-subtitle').textContent=c.subtitle;$('seven-counter').textContent=(state.chapter+1)+' / 7';$('seven-prev').disabled=state.chapter===0;$('seven-next').disabled=state.chapter===6;[...rail.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===state.chapter)));const q=search.value.trim().toLocaleLowerCase();const entries=all.filter(n=>(!c.kind||n.kind===c.kind)&&qualified(n)&&(!q||(n.label+' '+(n.desc||'')).toLocaleLowerCase().includes(q)));$('seven-evidence').textContent=entries.length+' documented '+(c.kind||'lineage')+' record'+(entries.length===1?'':'s')+' in this view';list.replaceChildren();const map=$('seven-map');map.replaceChildren();for(const kind of kinds){const count=all.filter(n=>n.kind===kind&&qualified(n)).length;const b=document.createElement('button');b.type='button';b.textContent=kind+' · '+count;b.setAttribute('aria-pressed',String(c.kind===kind));b.addEventListener('click',()=>move(kinds.indexOf(kind)+1,true));map.append(b)}if(!entries.length){const p=document.createElement('p');p.textContent='No published records match this view. No outcome is inferred.';list.append(p)}for(const n of entries){const b=document.createElement('button');b.type='button';b.textContent=n.label;b.setAttribute('aria-pressed',String(state.selected===n.id));b.addEventListener('click',()=>{show(n);render()});list.append(b)}drawConstellation(entries);const selected=entries.find(n=>n.id===state.selected);if(selected)show(selected);else{state.selected=null;detail.replaceChildren();const p=document.createElement('p');p.textContent='Select a documented record to inspect its ancestry and destination.';detail.append(p)}}
function move(i,focus=false){frame();if(i<0||i>=chapters.length)return;state.history.push({chapter:state.chapter,selected:state.selected});state.chapter=i;state.selected=null;search.value='';render();if(focus)$('seven-title').focus({preventScroll:true})}
$('seven-back').addEventListener('click',()=>{const prior=state.history.pop();if(!prior)return;state.chapter=prior.chapter;state.selected=prior.selected;search.value='';render();$('seven-title').focus({preventScroll:true})});$('seven-prev').addEventListener('click',()=>move(state.chapter-1,true));$('seven-next').addEventListener('click',()=>move(state.chapter+1,true));search.addEventListener('input',render);render();
})();