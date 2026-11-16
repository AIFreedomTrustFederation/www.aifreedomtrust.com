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
const escapeUrl=url=>{try{const u=new URL(url,location.href);return u.protocol==='https:'||u.origin===location.origin?u.href:null}catch{return null}};
const line=id=>{const path=[],seen=new Set();let n=byId.get(id);while(n&&!seen.has(n.id)){path.unshift(n);seen.add(n.id);n=byId.get(n.parent)}return path};
const pos=new Map();const row=(arr,y,start,end)=>arr.forEach((n,i)=>pos.set(n.id,{x:start+(end-start)*(i+.5)/arr.length,y}));
row(roots,650,60,940);pos.set('federation',{x:500,y:460});row(branches,300,70,930);row(leaves,185,90,910);row(fruits,75,90,910);
const extras=nodes.filter(n=>!pos.has(n.id));row(extras,105,70,930);
function el(tag,attrs,parent){const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs||{}))e.setAttribute(k,String(v));if(parent)parent.append(e);return e}
function draw(){links.replaceChildren();layer.replaceChildren();for(const n of nodes){const p=pos.get(n.id),q=pos.get(n.parent);if(q&&p){const path=el('path',{d:'M'+p.x+' '+p.y+' Q'+((p.x+q.x)/2)+' '+((p.y+q.y)/2)+' '+q.x+' '+q.y,fill:'none',stroke:colors[n.kind],class:'world-edge',opacity:line(selected).some(x=>x.id===n.id)?'.9':'.32'},links);path.dataset.to=n.id}}
for(const n of nodes){const p=pos.get(n.id),g=el('g',{transform:'translate('+p.x+' '+p.y+')',role:'button',tabindex:'0','aria-label':n.kind+': '+n.label,'aria-pressed':String(selected===n.id),class:'world-node'+(filter&&!n.label.toLowerCase().includes(filter)?' world-dim':'')},layer);g.dataset.id=n.id;el('circle',{r:n.kind==='trunk'?26:17,fill:'#071525',stroke:colors[n.kind],'stroke-width':selected===n.id?5:2.5},g);const t=el('text',{y:n.kind==='root'?33:-25,'text-anchor':'middle'},g);t.textContent=n.label.length>22?n.label.slice(0,20)+'…':n.label;g.addEventListener('click',()=>choose(n.id));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(n.id)}})}}
function choose(id,remember=true){if(!byId.has(id))return;if(remember&&id!==selected)history.push(selected);selected=id;const n=byId.get(id);stage.value=n.kind;draw();render();const p=pos.get(id);if(p&&window.matchMedia('(prefers-reduced-motion: reduce)').matches===false)center(p)}
function center(p){panX=(500-p.x)*scale;panY=(400-p.y)*scale;transform()}
function transform(){const group=$('evidence-camera');group.setAttribute('transform','translate('+panX+' '+panY+') translate(500 400) scale('+scale+') translate(-500 -400)');map.textContent='View '+Math.round(scale*100)+'% · '+byId.get(selected).kind+' selected';}
function render(){const n=byId.get(selected);info.replaceChildren();const heading=document.createElement('h3');heading.textContent=n.label;info.append(heading);const type=document.createElement('p');type.className='evidence-type';type.textContent=n.kind.toUpperCase()+' · Curated source evidence, not a live operational claim';info.append(type);const desc=document.createElement('p');desc.textContent=n.desc||'No published description.';info.append(desc);const url=escapeUrl(n.url);if(url){const a=document.createElement('a');a.href=url;a.textContent=n.kind==='fruit'?'Open the actual visitor experience':'Inspect published source or evidence';if(a.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}info.append(a)}
trail.replaceChildren();for(const x of line(selected)){const b=document.createElement('button');b.type='button';b.textContent=x.label;b.addEventListener('click',()=>choose(x.id));trail.append(b)}
list.replaceChildren();const filtered=nodes.filter(x=>(!filter||[x.label,x.desc,x.kind].join(' ').toLowerCase().includes(filter))&&(stage.value==='all'||x.kind===stage.value));for(const x of filtered){const b=document.createElement('button');b.type='button';b.textContent=x.label+' · '+x.kind;b.setAttribute('aria-current',String(x.id===selected));b.addEventListener('click',()=>choose(x.id));list.append(b)}if(!filtered.length){const p=document.createElement('p');p.textContent='No published nodes match this search or stage.';list.append(p)}
$('evidence-back').disabled=!history.length;$('evidence-count').textContent=roots.length+' source roots · '+branches.length+' systems · '+leaves.length+' capabilities · '+fruits.length+' published visitor destinations. No live CI claims.'}
$('evidence-back').addEventListener('click',()=>{const id=history.pop();if(id)choose(id,false)});
$('evidence-reset').addEventListener('click',()=>{history=[];scale=1;panX=panY=0;filter='';search.value='';stage.value='all';selected='federation';transform();draw();render()});
search.addEventListener('input',()=>{filter=search.value.trim().toLowerCase();draw();render()});stage.addEventListener('change',()=>{filter=search.value.trim().toLowerCase();draw();render()});
function zoom(mult){scale=Math.max(.65,Math.min(2.5,scale*mult));transform()}
$('evidence-in').addEventListener('click',()=>zoom(1.2));$('evidence-out').addEventListener('click',()=>zoom(1/1.2));
svg.addEventListener('pointerdown',e=>{if(e.target.closest('.world-node'))return;drag={x:e.clientX,y:e.clientY,panX,panY};svg.setPointerCapture(e.pointerId)});
svg.addEventListener('pointermove',e=>{if(!drag)return;const r=svg.getBoundingClientRect();panX=drag.panX+(e.clientX-drag.x)*1000/r.width;panY=drag.panY+(e.clientY-drag.y)*800/r.height;transform()});
for(const event of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(event,()=>drag=null);
svg.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();zoom(e.deltaY<0?1.12:1/1.12)}},{passive:false});
transform();draw();render();
})();