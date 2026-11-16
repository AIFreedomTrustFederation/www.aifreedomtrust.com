/* Source-backed cinematic constellation. Read-only; curated relationships are not live health. */
(()=>{'use strict';
const nodes=window.AIFT_LINEAGE_NODES;
const host=document.getElementById('evidence-world');
if(!host||!Array.isArray(nodes)){if(host)host.textContent='The published lineage source is unavailable. Use the original explorer below.';return;}
const order=['root','trunk','branch','leaf','flower','fruit'], colors={root:'#fa7582',trunk:'#f7d18a',branch:'#64e6b4',leaf:'#6cbcff',flower:'#b392fa',fruit:'#ffcf82'};
const byId=new Map(nodes.map(n=>[n.id,n])), roots=nodes.filter(n=>n.kind==='root'), branches=nodes.filter(n=>n.kind==='branch'), leaves=nodes.filter(n=>n.kind==='leaf'), fruits=nodes.filter(n=>n.kind==='fruit');
const $=id=>document.getElementById(id), ns='http://www.w3.org/2000/svg';
const svg=$('evidence-scene'), layer=$('evidence-nodes'), links=$('evidence-links'), list=$('evidence-list'), trail=$('evidence-trail'), info=$('evidence-info'), search=$('evidence-search'), stage=$('evidence-stage'), map=$('evidence-minimap');
let selected='federation',history=[],scale=1,panX=0,panY=0,filter='',drag=null;
const pointers=new Map();const semanticFocus={root:650,trunk:460,branch:300,leaf:185,flower:105,fruit:75};let pinch=null;const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
// Convert pointer coordinates using the actual SVG viewBox transform. Mobile
// aspect-ratio letterboxing otherwise makes pinch anchors and drag offsets drift.
const point=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const matrix=svg.getScreenCTM();if(!matrix)return {x:500,y:400};const q=p.matrixTransform(matrix.inverse());return {x:q.x,y:q.y}};
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const visible=n=>(!filter||[n.label,n.desc,n.kind].join(' ').toLowerCase().includes(filter))&&(stage.value==='all'||n.kind===stage.value);
const escapeUrl=url=>{try{const u=new URL(url,location.href);return u.protocol==='https:'||u.origin===location.origin?u.href:null}catch{return null}};
const line=id=>{const path=[],seen=new Set();let n=byId.get(id);while(n&&!seen.has(n.id)){path.unshift(n);seen.add(n.id);n=byId.get(n.parent)}return path};
const pos=new Map();const row=(arr,y,start,end)=>arr.forEach((n,i)=>pos.set(n.id,{x:start+(end-start)*(i+.5)/arr.length,y}));
row(roots,650,60,940);pos.set('federation',{x:500,y:460});row(branches,300,70,930);row(leaves,185,90,910);row(fruits,75,90,910);
const extras=nodes.filter(n=>!pos.has(n.id));row(extras,105,70,930);
function el(tag,attrs,parent){const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs||{}))e.setAttribute(k,String(v));if(parent)parent.append(e);return e}
function draw(){links.replaceChildren();layer.replaceChildren();for(const n of nodes){const p=pos.get(n.id),q=pos.get(n.parent);if(q&&p){const path=el('path',{d:'M'+p.x+' '+p.y+' Q'+((p.x+q.x)/2)+' '+((p.y+q.y)/2)+' '+q.x+' '+q.y,fill:'none',stroke:colors[n.kind],class:'world-edge',opacity:line(selected).some(x=>x.id===n.id)?'.9':'.32'},links);path.dataset.to=n.id}}
for(const n of nodes){const p=pos.get(n.id),g=el('g',{transform:'translate('+p.x+' '+p.y+')',role:'button',tabindex:'0','aria-label':n.kind+': '+n.label,'aria-pressed':String(selected===n.id),class:'world-node'+(!visible(n)?' world-dim':'')},layer);g.dataset.id=n.id;el('circle',{r:n.kind==='trunk'?26:17,fill:'#071525',stroke:colors[n.kind],'stroke-width':selected===n.id?5:2.5},g);const t=el('text',{y:n.kind==='root'?33:-25,'text-anchor':'middle'},g);t.textContent=n.label.length>22?n.label.slice(0,20)+'…':n.label;g.addEventListener('click',()=>choose(n.id));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(n.id)}})}}
function choose(id,remember=true){if(!byId.has(id))return;if(remember&&id!==selected)history.push(selected);selected=id;stage.value='all';draw();render();const p=pos.get(id);if(p)center(p)}
function center(p){panX=(500-p.x)*scale;panY=(400-p.y)*scale;transform()}
function transform(){panX=clamp(panX,-1100,1100);panY=clamp(panY,-900,900);const group=$('evidence-camera');group.setAttribute('transform','translate('+panX+' '+panY+') translate(500 400) scale('+scale+') translate(-500 -400)');updateMinimap();}

// Evidence journey: navigable, source-backed routes. These are exploration steps,
// not XP, unlocked achievements, deployment health, or inferred product ownership.
const journey=document.createElement('section');
journey.className='evidence-journey';
journey.setAttribute('aria-label','Documented growth paths');
const journeyTitle=document.createElement('h4');
journeyTitle.textContent='Follow documented growth';
const journeyHint=document.createElement('p');
journeyHint.className='evidence-journey-hint';
const journeySteps=document.createElement('div');
journeySteps.className='evidence-journey-steps';
journey.append(journeyTitle,journeyHint,journeySteps);
info.insertAdjacentElement('afterend',journey);
function renderJourney(){
  journeySteps.replaceChildren();
  const current=byId.get(selected);
  const ancestors=line(selected);
  const descendants=nodes.filter(n=>n.parent===selected);
  journeyHint.textContent='A curated source-to-outcome trail. '+ancestors.length+' documented lineage stage'+(ancestors.length===1?'':'s')+' to this point; '+descendants.length+' directly connected next step'+(descendants.length===1?'':'s')+'.';
  const options=[];
  if(current.parent&&byId.has(current.parent))options.push({id:current.parent,action:'Trace toward source'});
  for(const child of descendants)options.push({id:child.id,action:'Explore connected '+child.kind});
  if(!options.length){const p=document.createElement('p');p.textContent='No further documented relationships from this node. This is an evidence gap, not a locked reward.';journeySteps.append(p)}
  for(const option of options){
    const target=byId.get(option.id);
    const button=document.createElement('button');
    button.type='button';
    button.className='evidence-journey-step';
    const action=document.createElement('small');action.textContent=option.action;
    const label=document.createElement('strong');label.textContent=target.label;
    button.append(action,label);
    button.addEventListener('click',()=>choose(option.id));
    journeySteps.append(button);
  }
  if(current.kind==='fruit'){
    const href=escapeUrl(current.url);
    if(href){const a=document.createElement('a');a.href=href;a.textContent='Visit documented experience';if(a.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}journeySteps.append(a)}
  }
}

function render(){const n=byId.get(selected);info.replaceChildren();const heading=document.createElement('h3');heading.textContent=n.label;info.append(heading);const type=document.createElement('p');type.className='evidence-type';type.textContent=n.kind.toUpperCase()+' · Curated source evidence, not a live operational claim';info.append(type);const desc=document.createElement('p');desc.textContent=n.desc||'No published description.';info.append(desc);const url=escapeUrl(n.url);if(url){const a=document.createElement('a');a.href=url;a.textContent=n.kind==='fruit'?'Open the actual visitor experience':'Inspect published source or evidence';if(a.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}info.append(a)}
renderJourney();trail.replaceChildren();for(const x of line(selected)){const b=document.createElement('button');b.type='button';b.textContent=x.label;b.addEventListener('click',()=>choose(x.id));trail.append(b)}
list.replaceChildren();const filtered=nodes.filter(visible);for(const x of filtered){const b=document.createElement('button');b.type='button';b.textContent=x.label+' · '+x.kind;b.setAttribute('aria-current',String(x.id===selected));b.addEventListener('click',()=>choose(x.id));list.append(b)}if(!filtered.length){const p=document.createElement('p');p.textContent='No published nodes match this search or stage.';list.append(p)}
$('evidence-back').disabled=!history.length;$('evidence-count').textContent=roots.length+' source roots · '+branches.length+' systems · '+leaves.length+' capabilities · '+fruits.length+' published visitor destinations. No live CI claims.'}
$('evidence-back').addEventListener('click',()=>{const id=history.pop();if(id)choose(id,false)});
$('evidence-reset').addEventListener('click',()=>{history=[];scale=1;panX=panY=0;filter='';search.value='';stage.value='all';selected='federation';transform();draw();render()});
search.addEventListener('input',()=>{filter=search.value.trim().toLowerCase();draw();render();
  // Focus the first actual matching node so search is spatial, not merely a dimmer.
  if(filter){const match=nodes.find(visible);if(match){selected=match.id;center(pos.get(match.id));draw();render()}}
});stage.addEventListener('change',()=>{filter=search.value.trim().toLowerCase();draw();render()});
function zoom(mult,anchor={x:500,y:400}){const next=clamp(scale*mult,.65,2.5),ratio=next/scale;panX=anchor.x-(anchor.x-panX-500)*ratio-500;panY=anchor.y-(anchor.y-panY-400)*ratio-400;scale=next;transform()}
$('evidence-in').addEventListener('click',()=>zoom(1.2));$('evidence-out').addEventListener('click',()=>zoom(1/1.2));
// One finger pans; two fingers pinch around their midpoint without losing the focused world point.
svg.addEventListener('pointerdown',e=>{
  if(e.target.closest('.world-node'))return;
  pointers.set(e.pointerId,point(e));svg.setPointerCapture(e.pointerId);
  if(pointers.size===1){drag={point:point(e),panX,panY};pinch=null}
  else if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:distance(a,b),scale,panX,panY,mid:{x:(a.x+b.x)/2,y:(a.y+b.y)/2}};drag=null}
});
svg.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;
  pointers.set(e.pointerId,point(e));
  if(pointers.size===2&&pinch){const [a,b]=[...pointers.values()],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2},next=clamp(pinch.scale*distance(a,b)/Math.max(1,pinch.distance),.65,2.5),ratio=next/pinch.scale;
    scale=next;panX=mid.x-500-(pinch.mid.x-500-pinch.panX)*ratio;panY=mid.y-400-(pinch.mid.y-400-pinch.panY)*ratio;transform();
  }else if(pointers.size===1&&drag){const p=point(e);panX=drag.panX+p.x-drag.point.x;panY=drag.panY+p.y-drag.point.y;transform()}
});
function endPointer(e){pointers.delete(e.pointerId);pinch=null;drag=null;if(pointers.size===1){const p=[...pointers.values()][0];drag={point:p,panX,panY}}}
for(const event of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(event,endPointer);
svg.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();zoom(e.deltaY<0?1.12:1/1.12,point(e))}},{passive:false});
svg.addEventListener('keydown',e=>{const d=32/scale;if(e.key==='ArrowLeft')panX+=d;else if(e.key==='ArrowRight')panX-=d;else if(e.key==='ArrowUp')panY+=d;else if(e.key==='ArrowDown')panY-=d;else return;e.preventDefault();transform()});

// A functional, keyboard-operable overview: each marker represents an actual published node.
// The viewport outline reflects camera state rather than an invented live-system metric.
const overview=document.createElementNS(ns,'svg');
overview.setAttribute('viewBox','0 0 1000 800');
overview.setAttribute('role','group');
overview.setAttribute('aria-label','Spatial minimap of published lineage; select a marker to focus its source');
overview.setAttribute('class','world-overview');
const overviewFrame=el('rect',{x:0,y:0,width:1000,height:800,rx:20,fill:'#071a2b',stroke:'#668fa1','stroke-width':8},overview);
const overviewViewport=el('rect',{x:0,y:0,width:1000,height:800,rx:8,fill:'#9debd8', 'fill-opacity':'.07',stroke:'#f7d18a','stroke-width':7},overview);
const overviewDots=el('g',{},overview);
for(const n of nodes){const p=pos.get(n.id);if(!p)continue;const marker=el('circle',{cx:p.x,cy:p.y,r:n.kind==='trunk'?18:13,fill:colors[n.kind],stroke:'#071525','stroke-width':3,tabindex:0,role:'button','aria-label':'Focus '+n.kind+' '+n.label},overviewDots);marker.addEventListener('click',()=>choose(n.id));marker.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(n.id)}})}
map.replaceChildren(overview);
const overviewStatus=document.createElement('span');
overviewStatus.className='world-overview-status';
map.append(overviewStatus);
function updateMinimap(){
  const width=1000/scale,height=800/scale;
  overviewViewport.setAttribute('x',500-(500+panX)/scale);
  overviewViewport.setAttribute('y',400-(400+panY)/scale);
  overviewViewport.setAttribute('width',width);
  overviewViewport.setAttribute('height',height);
  overviewStatus.textContent='View '+Math.round(scale*100)+'% · '+byId.get(selected).kind+' selected';
}
function focusStage(kind){
  const candidates=nodes.filter(n=>n.kind===kind);
  filter='';search.value='';
  if(!candidates.length){
    stage.value=kind;draw();render();
    const note=document.createElement('p');
    note.textContent='No documented '+kind+' nodes exist in the published lineage. Nothing has been invented or unlocked.';
    info.prepend(note);$('evidence-world').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    return;
  }
  choose(candidates[0].id);
  stage.value=kind;draw();render();
  // Semantic zoom makes each growth layer an actual camera destination.
  const targetScale={root:1.25,trunk:.8,branch:1.2,leaf:1.55,flower:1.8,fruit:1.8}[kind]||1;
  scale=targetScale;center(pos.get(candidates[0].id));
  $('evidence-world').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
for(const button of document.querySelectorAll('[data-stage]')){
  button.addEventListener('click',()=>focusStage(button.dataset.stage));
}

transform();draw();render();
})();