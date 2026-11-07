import {projectWorld} from './world-projection.mjs';
import {buildSemanticScene,semanticBreadcrumbs} from './world-semantic-scene.mjs';
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const colors={root:'#f47685',trunk:'#f5d18c',branch:'#6ce5b1',leaf:'#67c8f3',flower:'#b997ff',fruit:'#f6a86c'};
const names={root:'Roots',trunk:'Trunk',branch:'Branches',leaf:'Leaves',flower:'Flowers',fruit:'Fruits'};
const el=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
const svg=(tag,attributes,parent)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attributes))e.setAttribute(k,String(v));parent.append(e);return e};
let world,selected=null,history=[],cursor=-1;
let zoom=1,center={x:500,y:310};
let drag=null;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function panBy(dx,dy){const width=1000/zoom,height=620/zoom;center.x=clamp(center.x+dx,width/2,1000-width/2);center.y=clamp(center.y+dy,height/2,620-height/2);applyViewport()}
function zoomAt(next,x,y){const previous=zoom;zoom=clamp(Math.round(next*10)/10,1,4);const ratio=1/previous-1/zoom;center.x=clamp(center.x+x*ratio,500/zoom,1000-500/zoom);center.y=clamp(center.y+y*ratio,310/zoom,620-310/zoom);applyViewport()}

function updateMinimap(){const frame=document.querySelector('.minimap-viewport');if(!frame)return;frame.style.width=(100/zoom)+'%';frame.style.height='100%';frame.style.transform='translateX('+((center.x-500/zoom)/1000*100)+'%)'}
function applyViewport(){const w=1000/zoom,h=620/zoom;center.x=Math.max(w/2,Math.min(1000-w/2,center.x));center.y=Math.max(h/2,Math.min(620-h/2,center.y));$('map').setAttribute('viewBox',[center.x-w/2,center.y-h/2,w,h].join(' '));$('viewport-status').textContent='Spatial zoom '+Math.round(zoom*100)+'% · illustrative positions, not live data';$('zoom-out').disabled=zoom<=1;$('zoom-in').disabled=zoom>=4;updateMinimap()}
function changeZoom(next){zoomAt(next,0,0)}
function focusEntity(id){if(!world)return;const scene=buildSemanticScene(world);const node=scene.nodes.find(n=>n.id===id);if(!node)return;center={x:60+node.position.x*880,y:50+node.position.y*520};if(zoom<1.8)zoom=1.8;applyViewport()}

const safeLink=(url,label,parent)=>{if(typeof url!=='string'||!/^https:\/\/[^\s/]+/.test(url))return;const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a)};
function select(id,record=true){if(!world?.nodes.some(n=>n.id===id))return;selected=id;focusEntity(id);window.dispatchEvent(new CustomEvent("aift:lineage-selected",{detail:{id}}));if(record){history=history.slice(0,cursor+1);if(history.at(-1)!==id)history.push(id);cursor=history.length-1}render()}
function render(){
 const layer=$('layer').value||null,search=$('search').value,scene=buildSemanticScene(world,{layer,search,selectedId:selected});
 $('back').disabled=cursor<=0;$('forward').disabled=cursor>=history.length-1;
 $('status').textContent=scene.summary.visible+' matching entities · '+scene.summary.evidenceNeeded+' without attested contributing-root evidence · '+scene.summary.documentedOutcomes+' documented outcome destinations. Not live status.';
 $('stages').replaceChildren();for(const kind of scene.layers){const b=el('button',names[kind]+' · '+world.nodes.filter(n=>n.kind===kind).length);b.type='button';b.style.setProperty('--stage',colors[kind]);b.setAttribute('aria-pressed',String(layer===kind));b.onclick=()=>{$('layer').value=layer===kind?'':kind;render()};$('stages').append(b)}
 $('minimap').replaceChildren();for(const item of scene.minimap.columns){const mark=el('span');mark.style.setProperty('--stage',colors[item.kind]);mark.title=names[item.kind]+': '+item.count+' visible';$('minimap').append(mark)}
 const viewport=el('span');viewport.className='minimap-viewport';viewport.setAttribute('aria-hidden','true');$('minimap').append(viewport);updateMinimap();
 const map=$('map');map.replaceChildren();const positions=new Map(scene.nodes.map(n=>[n.id,{x:60+n.position.x*880,y:50+n.position.y*520}]));
 for(const edge of scene.edges){const a=positions.get(edge.from),b=positions.get(edge.to);if(!a||!b)continue;const p=svg('path',{d:'M'+a.x+' '+a.y+' Q'+((a.x+b.x)/2)+' '+((a.y+b.y)/2-45)+' '+b.x+' '+b.y,class:'edge'+(edge.attested?' attested':'')},map);const title=svg('title',{},p);title.textContent=edge.relation+(edge.attested?' · source-backed':' · structural, not contribution evidence')}
 for(const node of scene.nodes){const p=positions.get(node.id),g=svg('g',{class:'entity',role:'button',tabindex:0,'aria-label':names[node.kind]+': '+node.label,'aria-pressed':node.id===selected},map);svg('circle',{cx:p.x,cy:p.y,r:node.kind==='trunk'?22:15,stroke:colors[node.kind]},g);const t=svg('text',{x:p.x,y:p.y+35},g);t.textContent=node.label.length>25?node.label.slice(0,24)+'…':node.label;g.onclick=()=>select(node.id);g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(node.id)}}}
 $('items').replaceChildren();for(const node of scene.nodes){const b=el('button');b.type='button';b.style.setProperty('--stage',colors[node.kind]);b.setAttribute('aria-pressed',String(node.id===selected));b.append(el('strong',node.label),el('small',names[node.kind]+' · '+(node.evidence==='attested'?'Attested source path':'Evidence needed')));b.onclick=()=>select(node.id);$('items').append(b)}
 const detail=$('detail');detail.replaceChildren();if(!selected){detail.append(el('h3','Explore the source current'),el('p','Select a node in the spatial map or accessible index.'));return}
 const node=world.nodes.find(n=>n.id===selected),inspection=world.inspect(selected);
 detail.append(el('p',names[node.kind].toUpperCase()),el('h3',node.label),el('p',node.description||'No description recorded.'));
 safeLink(node.url,node.kind==='fruit'?'Open documented outcome':'Open source or documented entity',detail);
 const crumbs=semanticBreadcrumbs(buildSemanticScene(world,{selectedId:selected}),selected);
 if(crumbs.length){detail.append(el('h4','Reversible growth trail'));for(const crumb of crumbs){for(const id of crumb.ids){const target=world.nodes.find(n=>n.id===id);if(!target)continue;const b=el('button',names[target.kind]+' · '+target.label);b.type='button';b.onclick=()=>select(id);detail.append(b)}}}
 detail.append(el('h4','Contributing repository roots'));if(!inspection.lineage.roots.length){detail.append(el('p','No attested contribution path. Structural membership is not proof.'));return}
 for(const root of inspection.lineage.roots){const p=el('p');p.append(el('strong',root.label));detail.append(p);safeLink(root.url,'Inspect repository root',detail)}
 detail.append(el('h4','Source attestations'));const proofs=[...new Set(inspection.lineage.paths.flatMap(p=>p.edges.map(e=>e.evidenceUrl||e.source).filter(u=>typeof u==='string'&&u.startsWith('https://'))))];if(!proofs.length)detail.append(el('p','No attestation URLs recorded.'));for(const [i,url] of proofs.entries())safeLink(url,'Review attestation '+(i+1),detail);
}
window.addEventListener('aift:lineage-select',event=>{if(typeof event.detail?.id==='string')select(event.detail.id)});
$('search').addEventListener('input',render);$('layer').addEventListener('change',render);
$('reset').onclick=()=>{$('search').value='';$('layer').value='';selected=null;window.dispatchEvent(new CustomEvent('aift:lineage-selected',{detail:{id:null}}));history=[];cursor=-1;zoom=1;center={x:500,y:310};applyViewport();render()};
$('zoom-in').onclick=()=>changeZoom(zoom+.4);$('zoom-out').onclick=()=>changeZoom(zoom-.4);$('zoom-fit').onclick=()=>{zoom=1;center={x:500,y:310};applyViewport()};

// Spatial navigation is opt-in: ordinary scrolling remains available unless Ctrl is held.
const spatial=$('map');
spatial.setAttribute('tabindex','0');
spatial.setAttribute('aria-describedby','spatial-instructions');
spatial.addEventListener('keydown',event=>{
 if(event.target!==spatial)return;
 const step=60/zoom;
 const moves={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
 if(moves[event.key]){event.preventDefault();panBy(...moves[event.key])}
 else if(event.key==='+'||event.key==='='){event.preventDefault();changeZoom(zoom+.4)}
 else if(event.key==='-'){event.preventDefault();changeZoom(zoom-.4)}
 else if(event.key==='Home'){event.preventDefault();zoom=1;center={x:500,y:310};applyViewport()}
});
spatial.addEventListener('wheel',event=>{if(!event.ctrlKey)return;event.preventDefault();changeZoom(zoom+(event.deltaY<0?.2:-.2))},{passive:false});
spatial.addEventListener('pointerdown',event=>{
 if(event.button!==0||event.target.closest('.entity'))return;
 drag={x:event.clientX,y:event.clientY};spatial.setPointerCapture(event.pointerId);
});
spatial.addEventListener('pointermove',event=>{
 if(!drag)return;
 const bounds=spatial.getBoundingClientRect();
 if(!bounds.width||!bounds.height)return;
 panBy(-(event.clientX-drag.x)*1000/(zoom*bounds.width),-(event.clientY-drag.y)*620/(zoom*bounds.height));
 drag={x:event.clientX,y:event.clientY};
});
for(const name of ['pointerup','pointercancel','lostpointercapture'])spatial.addEventListener(name,()=>{drag=null});
$('back').onclick=()=>{if(cursor>0){cursor--;select(history[cursor],false)}};
$('forward').onclick=()=>{if(cursor<history.length-1){cursor++;select(history[cursor],false)}};
fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('Manifest HTTP '+r.status);return r.json()}).then(data=>{world=projectWorld(data);applyViewport();render();const deepLink=new URLSearchParams(location.search).get('entity');if(deepLink&&world.nodes.some(n=>n.id===deepLink))select(deepLink)}).catch(e=>{$('status').textContent='Curated scene unavailable: '+e.message;$('detail').replaceChildren(el('p','No evidence could be loaded. No status or achievements inferred.'))});
