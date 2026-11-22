/* White Paper reading lens for the standalone cinematic knowledge atlas.
 * Source prose and links are authored in the HTML chapters, not fabricated here.
 * Original visual layers, source nodes, viewport controls and public iframe are
 * preserved. No analytics, network calls, storage or unsourced content.
 */
(()=>{'use strict';
if(document.documentElement.classList.contains('embedded-world'))return;
document.title='The Living White Paper · AIFT Tree of Emergence';
const headerTitle=document.querySelector('.hud-title');
if(headerTitle){
 headerTitle.firstChild.textContent='THE LIVING WHITE PAPER ';
 const small=headerTitle.querySelector('small');
 if(small)small.textContent='THE READING ATLAS';
}
const scene=document.querySelector('.world svg.tree');
const world=document.querySelector('.world');
const reader=document.getElementById('white-paper-atlas');
const title=document.getElementById('wp-focus-title');
const summary=document.getElementById('wp-focus-summary');
const read=document.getElementById('wp-read-current');
if(!scene||!world||!reader||!title||!summary||!read)return;

const stageMap=[
 {id:'root',label:'Roots',extra:'Human authorship',x:390,y:865},
 {id:'trunk',label:'Trunk',extra:'Shared covenant',x:500,y:575},
 {id:'branch',label:'Branches',extra:'Distinct systems',x:758,y:416},
 {id:'leaf',label:'Leaves',extra:'Source knowledge',x:185,y:298},
 {id:'flower',label:'Flowers',extra:'Emerging work',x:400,y:122},
 {id:'fruit',label:'Fruits',extra:'Published pages',x:785,y:180}
];
const ns='http://www.w3.org/2000/svg';
const make=(tag,attrs,parent)=>{
 const el=document.createElementNS(ns,tag);
 for(const [key,value] of Object.entries(attrs||{}))el.setAttribute(key,String(value));
 if(parent)parent.append(el);
 return el;
};
const layer=make('g',{'class':'wp-tree-label-layer','aria-label':'Source-linked White Paper chapter landmarks'},scene);
const chapters=new Map;
let active=null,blockedUntil=0;
const touchPoints=new Map;
for(const item of stageMap){
 const article=document.getElementById('wp-chapter-'+item.id);
 const heading=article?.querySelector('h3');
 const lead=article?.querySelector('.wp-chapter-lead');
 if(!article||!heading||!lead)throw new Error('White Paper chapter is missing: '+item.id);
 chapters.set(item.id,{...item,article,heading,lead});
 const marker=make('g',{
  'class':'wp-tree-marker','data-wp-stage':item.id,'data-wp-active':'false',
  role:'button',tabindex:'0',
  'aria-label':'Zoom to White Paper chapter: '+heading.textContent.trim(),
  transform:'translate('+item.x+' '+item.y+')'
 },layer);
 const help=make('title',{},marker);help.textContent='White Paper: '+heading.textContent.trim()+'. Double tap or press Enter to explore.';
 make('rect',{'class':'wp-marker-back',x:-116,y:-48,width:232,height:112,rx:24},marker);
 const label=make('text',{'class':'wp-marker-title','text-anchor':'middle',x:0,y:-4},marker);
 label.textContent=item.label;
 const detail=make('text',{'class':'wp-marker-detail','text-anchor':'middle',x:0,y:34},marker);
 detail.textContent=item.extra;
 item.marker=marker;
}

// Tap-to-focus labels also remain backed by full-size HTML chapter buttons.
// A two-pointer pinch must not accidentally open a chapter.
scene.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='touch')return;
 touchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(touchPoints.size>=2)blockedUntil=performance.now()+700;
},true);
scene.addEventListener('pointermove',e=>{
 const p=touchPoints.get(e.pointerId);if(!p)return;
 if(Math.hypot(e.clientX-p.x,e.clientY-p.y)>12)blockedUntil=performance.now()+450;
},true);
for(const event of ['pointerup','pointercancel','lostpointercapture']){
 scene.addEventListener(event,e=>touchPoints.delete(e.pointerId),true);
}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const focus=(id,{zoom=true}={})=>{
 const chapter=chapters.get(id);if(!chapter)return;
 active=id;
 title.textContent=chapter.heading.textContent;
 summary.textContent=chapter.lead.textContent;
 read.href='#wp-chapter-'+id;
 read.textContent='Read the '+chapter.label+' chapter ↓';
 for(const el of reader.querySelectorAll('.wp-chapter')){
  if(el.dataset.wpStage===id)el.dataset.wpSelected='true';
  else delete el.dataset.wpSelected;
 }
 for(const el of reader.querySelectorAll('[data-wp-index]')){
  if(el.dataset.wpIndex===id)el.setAttribute('aria-current','location');
  else el.removeAttribute('aria-current');
 }
 for(const item of stageMap)item.marker.dataset.wpActive=String(item.id===id);
 if(zoom){
  const w=520,limit=1000-w;
  const x=clamp(chapter.x-w/2,0,limit),y=clamp(chapter.y-w/2,0,limit);
  scene.setAttribute('viewBox',[x,y,w,w].join(' '));
 }
};
const updateZoom=()=>{
 const w=scene.viewBox.baseVal.width;
 world.dataset.wpZoom=w<=650?'reading':'overview';
};
new MutationObserver(updateZoom).observe(scene,{attributes:true,attributeFilter:['viewBox']});
updateZoom();
for(const item of stageMap){
 const marker=item.marker;
 marker.addEventListener('click',e=>{
  if(performance.now()<blockedUntil)return;
  e.preventDefault();focus(item.id);
 });
 marker.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();focus(item.id)}
 });
}
for(const button of reader.querySelectorAll('[data-wp-focus]')){
 button.addEventListener('click',()=>{
  focus(button.dataset.wpFocus);
  scene.scrollIntoView({
   block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'
  });
 });
}
for(const link of reader.querySelectorAll('[data-wp-index]')){
 link.addEventListener('click',()=>focus(link.dataset.wpIndex,{zoom:false}));
}
const hash=decodeURIComponent(location.hash||'');
if(/^#wp-chapter-(root|trunk|branch|leaf|flower|fruit)$/.test(hash)){
 focus(hash.replace('#wp-chapter-',''),{zoom:false});
}
window.addEventListener('hashchange',()=>{
 const match=location.hash.match(/^#wp-chapter-(root|trunk|branch|leaf|flower|fruit)$/);
 if(match)focus(match[1],{zoom:false});
});
})();
