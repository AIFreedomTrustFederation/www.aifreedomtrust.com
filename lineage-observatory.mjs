import {projectWorld,LAYERS} from './world-projection.mjs';
const host=document.querySelector('#lineage-observatory');
if(host){
 const css=document.createElement('style');css.textContent=`
 #lineage-observatory{margin:3rem 0;padding:clamp(1rem,3vw,2rem);border:1px solid #b9a4ff77;border-radius:26px;background:radial-gradient(ellipse at 45% 0%,#26345a,#080e22 70%);color:#eef5ff}
 #lineage-observatory h2{font:clamp(1.8rem,4vw,3.1rem) Georgia,serif;color:#f8d898}
 .lo-tools{display:flex;flex-wrap:wrap;gap:.7rem;margin:1rem 0}.lo-tools input,.lo-tools select,.lo-tools button{font:inherit;padding:.7rem;border-radius:10px;background:#122440;color:#fff;border:1px solid #94b9cc}
 .lo-tools input{flex:1;min-width:170px}.lo-layout{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(250px,.8fr);gap:1rem}
 .lo-map{position:relative;overflow:auto;border:1px solid #6a87a2;border-radius:18px;background:radial-gradient(circle,#1c3151,#070e20);min-height:390px}
 .lo-map svg{width:100%;min-width:580px;height:auto;display:block}.lo-map button{cursor:pointer}.lo-node{cursor:pointer;outline:none}.lo-node:focus circle,.lo-node[aria-current=true] circle{stroke:#fff;stroke-width:4}
 .lo-node text{fill:white;font:12px system-ui;paint-order:stroke;stroke:#071020;stroke-width:3px;pointer-events:none}
 .lo-inspect{padding:1.2rem;border:1px solid #d7ba7977;border-radius:18px;background:#111d33;overflow-wrap:anywhere}.lo-inspect h3{color:#f8d898}
 .lo-index{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}.lo-index button{background:#142740;color:white;border:1px solid #789cb6;border-radius:10px;padding:.6rem;cursor:pointer}
 .lo-index button[aria-pressed=true]{border-color:#ffe09c;background:#35435e}.lo-index button:focus-visible,.lo-tools button:focus-visible{outline:3px solid #fff}
 .lo-crumbs{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}.lo-crumbs button{background:none;border:0;color:#9fe8e1;text-decoration:underline;cursor:pointer}
 .lo-note{color:#c6d8e7;line-height:1.6}.lo-inspect a{color:#a5f6e6}.lo-inspect li{margin:.5rem 0}
 @media(max-width:780px){.lo-layout{grid-template-columns:1fr}.lo-map{min-height:290px}}
 @media(prefers-reduced-motion:reduce){#lineage-observatory *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
 `;host.append(css);
 const el=(tag,cls='',txt='')=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt)n.textContent=txt;return n};
 const heading=el('h2','', 'The Lineage Observatory'),intro=el('p','lo-note','Navigate a source-grounded constellation. Dashed paths show architecture, not proof of product contribution. Fruits without explicit evidence remain unverified.');
 const tools=el('div','lo-tools'),search=el('input'),layer=el('select'),back=el('button','','Back'),forward=el('button','','Forward'),reset=el('button','','Reset');
 search.type='search';search.placeholder='Search all growth layers';search.setAttribute('aria-label','Search the constellation');
 for(const kind of ['all',...LAYERS]){const o=el('option','',kind==='all'?'All layers':kind[0].toUpperCase()+kind.slice(1));o.value=kind;layer.append(o)}
 layer.setAttribute('aria-label','Filter growth layer');tools.append(search,layer,back,forward,reset);
 const crumbs=el('nav','lo-crumbs');crumbs.setAttribute('aria-label','Exploration history');
 const layout=el('div','lo-layout'),map=el('div','lo-map'),inspect=el('aside','lo-inspect');inspect.setAttribute('aria-live','polite');layout.append(map,inspect);
 const index=el('div','lo-index');index.setAttribute('aria-label','Accessible constellation index');
 const status=el('p','lo-note','Loading curated source manifest…');status.setAttribute('role','status');
 host.append(heading,intro,tools,crumbs,layout,index,status);
 let world,selected=null,history=[],cursor=-1;
 const colors={root:'#67e4b4',trunk:'#f6d38e',branch:'#65d9f5',leaf:'#b5a0ff',flower:'#f38bce',fruit:'#ff9b71'};
 const navigate=(id,record=true)=>{if(!world?.inspect(id))return;selected=id;if(record){history=history.slice(0,cursor+1);history.push(id);cursor=history.length-1}render()};
 function render(){if(!world)return;
 const term=search.value.trim().toLowerCase(),kind=layer.value;
 const visible=world.search(term,kind==='all'?'':kind),ids=new Set(visible.map(n=>n.id));
 const nodes=world.nodes,positions=new Map();const counts={};
 for(const n of nodes){const k=LAYERS.indexOf(n.kind);const i=counts[n.kind]||0;counts[n.kind]=i+1;positions.set(n.id,{x:75+k*105,y:55+i*70})}
 const height=Math.max(390,...Object.values(counts).map(c=>c*70+70));const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 720 '+height);svg.setAttribute('role','img');svg.setAttribute('aria-label','Six-layer source constellation, with structural connections dashed');
 for(const edge of world.edges){const a=positions.get(edge.from),b=positions.get(edge.to);if(!a||!b)continue;const line=document.createElementNS(svg.namespaceURI,'path');line.setAttribute('d',`M${a.x} ${a.y} Q ${(a.x+b.x)/2} ${(a.y+b.y)/2-25} ${b.x} ${b.y}`);line.setAttribute('fill','none');line.setAttribute('stroke',edge.relation==='contributes-to'?'#ffe19d':'#7c9ab9');line.setAttribute('stroke-width',edge.relation==='contributes-to'?'3':'1.5');if(edge.relation!=='contributes-to')line.setAttribute('stroke-dasharray','5 6');line.setAttribute('opacity',ids.has(edge.from)&&ids.has(edge.to)?'.8':'.17');svg.append(line)}
 for(const n of nodes){const p=positions.get(n.id),g=document.createElementNS(svg.namespaceURI,'g'),c=document.createElementNS(svg.namespaceURI,'circle'),t=document.createElementNS(svg.namespaceURI,'text');g.classList.add('lo-node');g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',n.kind+': '+n.label);g.setAttribute('aria-current',String(selected===n.id));g.setAttribute('opacity',ids.has(n.id)?'1':'.16');c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r',selected===n.id?'17':'12');c.setAttribute('fill','#0a1830');c.setAttribute('stroke',colors[n.kind]);c.setAttribute('stroke-width','3');t.setAttribute('x',p.x);t.setAttribute('y',p.y+28);t.setAttribute('text-anchor','middle');t.textContent=n.label.length>16?n.label.slice(0,15)+'…':n.label;g.append(c,t);g.addEventListener('click',()=>navigate(n.id));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navigate(n.id)}});svg.append(g)}
 map.replaceChildren(svg);index.replaceChildren();for(const n of visible){const b=el('button','',n.kind+' · '+n.label);b.type='button';b.setAttribute('aria-pressed',String(selected===n.id));b.addEventListener('click',()=>navigate(n.id));index.append(b)}
 const detail=world.inspect(selected);inspect.replaceChildren();if(detail){const n=detail.node;inspect.append(el('h3','',n.label),el('p','lo-note','Layer: '+n.kind));const link=el('a','','Open documented source or experience');link.href=n.url;link.target='_blank';link.rel='noopener noreferrer';inspect.append(link);
 const relationships=el('p','lo-note',detail.relationships.length+' documented relationships. Structural membership does not establish product lineage.');inspect.append(relationships);
 if(n.kind==='fruit'){inspect.append(el('p','lo-note',detail.outcomeVerified?'Explicit contribution path recorded. Verify the linked source before treating the outcome as operational.':'Evidence gap: '+(detail.lineage.evidenceGap||'No verified product lineage')))}
 else if(n.kind!=='root'){inspect.append(el('p','lo-note',detail.lineage.evidenceGap||'Explicit contributing roots are documented below.'))}
 if(detail.lineage.paths.length){const list=el('ul');for(const path of detail.lineage.paths){const li=el('li','',path.root.label+' · '+path.edges.length+' evidenced contribution links');list.append(li)}inspect.append(list)}
 const neighbors=detail.relationships.map(e=>e.from===n.id?e.to:e.from);const buttons=el('div','lo-index');for(const id of new Set(neighbors)){const other=world.inspect(id)?.node;if(!other)continue;const b=el('button','',other.kind+' · '+other.label);b.addEventListener('click',()=>navigate(id));buttons.append(b)}inspect.append(el('h3','','Related systems'),buttons)}
 crumbs.replaceChildren();history.forEach((id,i)=>{const b=el('button','',world.inspect(id)?.node.label||id);b.addEventListener('click',()=>{cursor=i;selected=id;render()});crumbs.append(b)});back.disabled=cursor<=0;forward.disabled=cursor>=history.length-1;
 status.textContent=visible.length+' of '+nodes.length+' documented entities visible. This is a curated architecture, not live CI or deployment telemetry.';
 }
 search.addEventListener('input',render);layer.addEventListener('change',render);back.addEventListener('click',()=>{if(cursor>0){cursor--;selected=history[cursor];render()}});forward.addEventListener('click',()=>{if(cursor<history.length-1){cursor++;selected=history[cursor];render()}});reset.addEventListener('click',()=>{search.value='';layer.value='all';history=[];cursor=-1;navigate('trunk')});
 fetch('data/living-universe.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{world=projectWorld(data);navigate(world.nodes.find(n=>n.kind==='trunk')?.id||world.nodes[0]?.id)}).catch(e=>{status.textContent='Constellation unavailable: '+e.message;inspect.textContent='Source manifest could not be validated. No inferred relationships are displayed.'});
}
