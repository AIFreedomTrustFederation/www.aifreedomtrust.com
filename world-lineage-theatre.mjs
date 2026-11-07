/** Accessible spatial lineage theatre, derived only from canonical world evidence. */
import {projectWorld,LAYERS} from './world-projection.mjs';
export function buildLineageScene(world,id){
 const inspected=world.inspect(id);if(!inspected)return null;
 const ids=new Set([id]);const edges=[];
 for(const path of inspected.lineage.paths){ids.add(path.root.id);for(const edge of path.edges){ids.add(edge.from);ids.add(edge.to);if(!edges.some(e=>e.from===edge.from&&e.to===edge.to))edges.push(edge)}}
 const nodes=world.nodes.filter(n=>ids.has(n.id)).sort((a,b)=>LAYERS.indexOf(a.kind)-LAYERS.indexOf(b.kind)||a.id.localeCompare(b.id));
 return {focus:inspected.node,nodes,edges,gap:inspected.lineage.evidenceGap,sourceCount:inspected.lineage.roots.length};
}
const host=typeof document==='undefined'?null:document.getElementById('world-lineage-theatre');
if(host){
 const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
 const section=make('section'),h=make('h2','The Living Lineage Theatre'),intro=make('p','Zoom through attested roots and their documented outcomes. Select an entity to inspect its evidence. Missing paths are never invented.');
 section.className='wlt';section.append(h,intro);host.append(section);
 const toolbar=make('div');toolbar.className='wlt-tools';
 const select=make('select');select.setAttribute('aria-label','Choose a documented entity');
 const search=make('input');search.type='search';search.placeholder='Search the federation';search.setAttribute('aria-label','Filter lineage destinations');
 const back=make('button','Back'),forward=make('button','Forward'),zoomIn=make('button','Zoom in'),zoomOut=make('button','Zoom out'),reset=make('button','Reset view');
 for(const b of [back,forward,zoomIn,zoomOut,reset])b.type='button';
 toolbar.append(search,select,back,forward,zoomOut,zoomIn,reset);section.append(toolbar);
 const breadcrumbs=make('nav');breadcrumbs.setAttribute('aria-label','Lineage breadcrumbs');section.append(breadcrumbs);
 const viewport=make('div');viewport.className='wlt-viewport';viewport.tabIndex=0;viewport.setAttribute('aria-label','Evidence lineage spatial map');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1000 460');svg.setAttribute('role','img');svg.setAttribute('aria-label','Source-backed lineage map; use the accessible index below to navigate');viewport.append(svg);section.append(viewport);
 const minimap=make('div');minimap.className='wlt-minimap';minimap.setAttribute('aria-label','Current zoom level');section.append(minimap);
 const stage=make('div');stage.className='wlt-stages';stage.setAttribute('role','group');stage.setAttribute('aria-label','Filter lineage by growth stage');section.append(stage);
 const legend=make('p','Gold lines represent documented source-backed contributions. Repositories are roots, never outcomes.');legend.className='wlt-legend';section.append(legend);
 const details=make('aside');details.className='wlt-details';details.setAttribute('aria-live','polite');section.append(details);
 const index=make('div');index.className='wlt-index';index.setAttribute('aria-label','Accessible lineage node index');section.append(index);
 let world=null,history=[],cursor=-1,scale=1,visibleKinds=new Set(LAYERS);
 const colors={root:'#f26b7a',trunk:'#eac778',branch:'#5ee3a0',leaf:'#53bff3',flower:'#a68afa',fruit:'#ffa874'};
 function link(text,url){const a=make('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
 function destinations(){const term=search.value.toLowerCase();const chosen=select.value;select.replaceChildren();for(const n of world.nodes.filter(n=>(n.label+' '+n.kind).toLowerCase().includes(term))){const o=make('option',n.kind+' · '+n.label);o.value=n.id;select.append(o)}if([...select.options].some(o=>o.value===chosen))select.value=chosen}
 function renderStages(){stage.replaceChildren();for(const kind of LAYERS){const b=make('button',kind[0].toUpperCase()+kind.slice(1));b.type='button';b.setAttribute('aria-pressed',String(visibleKinds.has(kind)));b.onclick=()=>{if(visibleKinds.has(kind)&&visibleKinds.size>1)visibleKinds.delete(kind);else visibleKinds.add(kind);renderStages();render()};stage.append(b)}}
 function go(id,push=true){if(!world.inspect(id))return;if(push){history=history.slice(0,cursor+1);history.push(id);cursor=history.length-1}select.value=id;render()}
 function render(){
 const id=history[cursor],scene=buildLineageScene(world,id);if(!scene)return;
 back.disabled=cursor<=0;forward.disabled=cursor>=history.length-1;
 breadcrumbs.replaceChildren();for(const [i,key] of history.entries()){const b=make('button',world.inspect(key).node.label);b.type='button';b.setAttribute('aria-current',i===cursor?'page':'false');b.onclick=()=>{cursor=i;render()};breadcrumbs.append(b)}
 svg.replaceChildren();index.replaceChildren();details.replaceChildren();
 const ns='http://www.w3.org/2000/svg',element=(name,attrs)=>{const e=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e};
 const group=element('g',{transform:'translate(500 230) scale('+scale+') translate(-500 -230)'});svg.append(group);
 const visible=scene.nodes.filter(n=>visibleKinds.has(n.kind)||n.id===id);
 const points=new Map();const groups=LAYERS.map(kind=>visible.filter(n=>n.kind===kind)).filter(a=>a.length);
 groups.forEach((arr,col)=>arr.forEach((n,row)=>points.set(n.id,{x:80+col*840/Math.max(1,groups.length-1),y:230+(row-(arr.length-1)/2)*95})));
 for(const edge of scene.edges){const a=points.get(edge.from),b=points.get(edge.to);if(!a||!b)continue;group.append(element('path',{d:'M'+a.x+','+a.y+' C'+(a.x+b.x)/2+','+a.y+' '+(a.x+b.x)/2+','+b.y+' '+b.x+','+b.y,fill:'none',stroke:'#eac778','stroke-width':3}))}
 for(const n of visible){const p=points.get(n.id),g=element('g',{transform:'translate('+p.x+' '+p.y+')'});g.append(element('circle',{r:n.id===id?20:14,fill:colors[n.kind],stroke:n.id===id?'#fff':'#10243b','stroke-width':3}));const label=element('text',{x:0,y:37,'text-anchor':'middle',fill:'#fff','font-size':13});label.textContent=n.label.length>24?n.label.slice(0,23)+'…':n.label;g.append(label);group.append(g);
 const b=make('button',n.kind+' · '+n.label);b.type='button';b.setAttribute('aria-current',n.id===id?'true':'false');b.onclick=()=>go(n.id);index.append(b)}
 details.append(make('h3',scene.focus.label),make('p',scene.focus.description||'Documented federation entity'),make('p',scene.sourceCount+' attested repository roots'));
 if(/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(scene.focus.url||''))details.append(link('Open documented source or outcome',scene.focus.url));else details.append(make('p','No validated public destination is recorded.'));
 if(scene.gap)details.append(make('p','Evidence gap: '+scene.gap));
 for(const edge of scene.edges){const p=make('p',world.inspect(edge.from).node.label+' contributes to '+world.inspect(edge.to).node.label+' · ');const evidence=edge.evidenceUrl||edge.source;if(/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(evidence||''))p.append(link('Inspect attestation',evidence));else p.append(make('span','Evidence link unavailable'));details.append(p)}
 minimap.replaceChildren();minimap.append(make('strong','Spatial overview · '+visible.length+' visible nodes · '+scene.edges.length+' attested edges · '+Math.round(scale*100)+'% zoom'));
 const overview=make('div');overview.className='wlt-overview';for(const kind of LAYERS){const count=visible.filter(n=>n.kind===kind).length;if(!count)continue;const marker=make('span',kind+' '+count);marker.style.borderColor=colors[kind];overview.append(marker)}minimap.append(overview);
 }
 function zoom(n){scale=Math.max(.6,Math.min(2.2,n));render()}
 zoomIn.onclick=()=>zoom(scale+.2);zoomOut.onclick=()=>zoom(scale-.2);reset.onclick=()=>zoom(1);
 back.onclick=()=>{if(cursor>0){cursor--;render()}};forward.onclick=()=>{if(cursor<history.length-1){cursor++;render()}};
 select.onchange=()=>go(select.value);search.oninput=destinations;
 fetch('data/living-universe.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{world=projectWorld(data);destinations();renderStages();const initial=world.nodes.find(n=>n.kind==='fruit')||world.nodes[0];if(initial)go(initial.id);else details.textContent='No documented entities.'}).catch(err=>{details.textContent='Evidence unavailable: '+err.message});
}
