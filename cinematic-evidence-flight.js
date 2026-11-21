/* Evidence Flight: a source-backed root-to-outcome cinematic route, no fabricated edges. */
(()=>{'use strict';
const host=document.getElementById('seven-movements');
const nodes=window.AIFT_LINEAGE_NODES;
if(!host||!Array.isArray(nodes))return;
const byId=new Map(nodes.map(n=>[n.id,n]));
const roots=nodes.filter(n=>n.kind==='root'&&byId.get(n.parent)?.kind==='trunk');
const safe=url=>{try{const u=new URL(url,location.href);return u.protocol==='https:'||(u.protocol==='http:'&&u.origin===location.origin)?u.href:null}catch{return null}};
const isRepo=url=>{try{return /^github\.com$/i.test(new URL(url,location.href).hostname)&&/^\/[^/]+\/[^/]+\/?$/.test(new URL(url,location.href).pathname)}catch{return false}};
function ancestry(node){
 const chain=[],seen=new Set();let n=node;
 while(n&&!seen.has(n.id)){
  seen.add(n.id);chain.unshift(n);
  if(n.kind==='root')return byId.get(n.parent)?.kind==='trunk'&&!byId.get(n.parent)?.parent?chain:null;
  if(n.kind==='trunk')return null;
  n=byId.get(n.parent);
 }
 return null;
}
const routes=nodes.filter(n=>n.kind==='fruit'&&safe(n.url)&&!isRepo(n.url)).map(n=>({node:n,chain:ancestry(n)})).filter(r=>r.chain);
const section=document.createElement('section');section.className='seven-evidence-flight';section.setAttribute('aria-label','Cinematic source-to-outcome flight');
section.innerHTML='<div class="seven-flight-head"><div><p class="seven-flight-kicker">THE LIVING ROOT NETWORK</p><h3>Follow the light from source to experience</h3><p>Every luminous connection follows a published lineage record. A source without a verified experience remains a root, never a fruit.</p></div><button type="button" class="seven-flight-toggle" aria-expanded="false">Enter evidence flight</button></div><div class="seven-flight-body" hidden><div class="seven-flight-choices"><label>Source root <select class="seven-flight-root"></select></label><label>Documented outcome <select class="seven-flight-outcome"></select></label></div><div class="seven-flight-viewport"><svg class="seven-flight-art" viewBox="0 0 720 420" role="img" aria-label="A luminous lineage route from source root through published systems to an experience"><defs><linearGradient id="seven-flight-spectrum" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#ff657c"/><stop offset=".45" stop-color="#66e8b0"/><stop offset="1" stop-color="#70b9ff"/></linearGradient></defs><g class="seven-flight-paths"></g><g class="seven-flight-nodes"></g></svg><div class="seven-flight-caption" role="status" aria-live="polite"></div></div><div class="seven-flight-actions"><button type="button" class="seven-flight-prev">Previous source</button><button type="button" class="seven-flight-next">Next source</button><button type="button" class="seven-flight-return" hidden>Return to the living Tree</button><a class="seven-flight-link" rel="noopener noreferrer" hidden>Open documented experience</a></div><ol class="seven-flight-trail" aria-label="Accessible source lineage"></ol></div>';
host.querySelector('.seven-content')?.append(section);
const q=s=>section.querySelector(s),toggle=q('.seven-flight-toggle'),body=q('.seven-flight-body'),rootSelect=q('.seven-flight-root'),outcomeSelect=q('.seven-flight-outcome'),caption=q('.seven-flight-caption'),trail=q('.seven-flight-trail'),paths=q('.seven-flight-paths'),dots=q('.seven-flight-nodes'),link=q('.seven-flight-link'),prev=q('.seven-flight-prev'),next=q('.seven-flight-next'),returnButton=q('.seven-flight-return');
let active=[],index=0;
const art=q('.seven-flight-art');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let animation=0;
const camera={x:0,y:0,w:720,h:420};
function focusStep(){
 cancelAnimationFrame(animation);
 const target=active.length>1?{x:Math.max(0,Math.min(360,65+index*590/(active.length-1)-180)),y:0,w:360,h:420}:{x:0,y:0,w:720,h:420};
 const from={...camera},start=performance.now();
 function tick(now){
  const t=motion.matches?1:Math.min(1,(now-start)/520),ease=t*t*(3-2*t);
  for(const key of ['x','y','w','h'])camera[key]=from[key]+(target[key]-from[key])*ease;
  art.setAttribute('viewBox',camera.x+' '+camera.y+' '+camera.w+' '+camera.h);
  if(t<1)animation=requestAnimationFrame(tick);
 }
 if(document.visibilityState==='hidden'||motion.matches){Object.assign(camera,target);art.setAttribute('viewBox',camera.x+' '+camera.y+' '+camera.w+' '+camera.h)}
 else animation=requestAnimationFrame(tick);
}
function selectStep(i,restoreFocus=false){
 if(i<0||i>=active.length)return;
 index=i;draw();
 if(restoreFocus)trail.querySelector('[aria-current="step"]')?.focus({preventScroll:true});
}
const svgNS='http://www.w3.org/2000/svg';
const svg=(tag,attrs)=>{const el=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el};
function option(select,value,label){const o=document.createElement('option');o.value=value;o.textContent=label;select.append(o)}
roots.forEach(r=>option(rootSelect,r.id,r.label));
function draw(){
 paths.replaceChildren();dots.replaceChildren();trail.replaceChildren();
 const chosen=routes.find(r=>r.node.id===outcomeSelect.value&&r.chain[0].id===rootSelect.value);
 active=chosen?.chain||[];index=Math.min(index,Math.max(0,active.length-1));
 link.hidden=!chosen;link.removeAttribute('href');
 if(chosen){link.href=safe(chosen.node.url);if(new URL(link.href).origin!==location.origin)link.target='_blank';else link.removeAttribute('target')}
 prev.disabled=!active.length||index===0;next.disabled=!active.length||index===active.length-1;returnButton.hidden=!active.length;
 if(!active.length){caption.textContent='No published user-facing outcome is connected to this root. Its source remains available for inspection.';art.setAttribute('viewBox','0 0 720 420');return}
 const step=active.length===1?0:590/(active.length-1);
 const coords=active.map((n,i)=>({x:65+i*step,y:315-230*i/Math.max(1,active.length-1)+Math.sin(i*1.8)*24}));
 for(let i=1;i<coords.length;i++){const a=coords[i-1],b=coords[i];paths.append(svg('path',{d:`M ${a.x} ${a.y} Q ${(a.x+b.x)/2} ${Math.min(a.y,b.y)-50} ${b.x} ${b.y}`,class:'seven-flight-beam'}))}
 active.forEach((n,i)=>{
  const p=coords[i],g=svg('g',{class:'seven-flight-node'+(i===index?' is-active':''),transform:`translate(${p.x} ${p.y})`,tabindex:'0',role:'button','aria-label':n.kind+': '+n.label+'. Step '+(i+1)+' of '+active.length,'aria-current':i===index?'step':'false'});
  g.append(svg('circle',{r:i===index?17:11,fill:i===index?'#f9d894':'#69dfbb',stroke:'#fff3c2','stroke-width':2}));
  const t=svg('text',{y:i%2?-27:35,'text-anchor':'middle'});t.textContent=n.label;g.append(t);g.addEventListener('click',()=>selectStep(i));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectStep(i)}});dots.append(g);
  const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.textContent=n.kind+' · '+n.label;b.setAttribute('aria-current',i===index?'step':'false');b.addEventListener('click',()=>selectStep(i,true));li.append(b);trail.append(li);
 });
 caption.textContent=(index+1)+' of '+active.length+' · '+active[index].kind+' · '+active[index].label+' · Published lineage, not live CI status';focusStep();
}
function refresh(){const root=rootSelect.value,previous=outcomeSelect.value;outcomeSelect.replaceChildren();const available=routes.filter(r=>r.chain[0].id===root);for(const r of available)option(outcomeSelect,r.node.id,r.node.label);if(available.some(r=>r.node.id===previous))outcomeSelect.value=previous;index=0;draw()}
toggle.addEventListener('click',()=>{body.hidden=!body.hidden;toggle.setAttribute('aria-expanded',String(!body.hidden));toggle.textContent=body.hidden?'Enter evidence flight':'Close evidence flight';if(!body.hidden)rootSelect.focus({preventScroll:true})});
rootSelect.addEventListener('change',refresh);outcomeSelect.addEventListener('change',()=>{index=0;draw()});
returnButton.addEventListener('click',()=>{const node=active[index];if(node)window.dispatchEvent(new CustomEvent('aift:lineage-return',{detail:{nodeId:node.id}}))});
prev.addEventListener('click',()=>selectStep(index-1));next.addEventListener('click',()=>selectStep(index+1));
section.addEventListener('keydown',e=>{if(e.key==='Escape'&&!body.hidden){body.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.textContent='Enter evidence flight';toggle.focus()}});
window.addEventListener('aift:lineage-flight',event=>{const id=event.detail?.nodeId;const node=byId.get(id);if(!node)return;const lineage=ancestry(node);if(!lineage)return;const root=lineage[0];const choices=routes.filter(r=>r.chain[0].id===root.id&&r.chain.some(step=>step.id===id));const chosen=choices.find(r=>r.node.id===id)||choices[0];if(!chosen){rootSelect.value=root.id;refresh();caption.textContent='This documented source has no verified public outcome along its lineage. The repository remains a source root, never a fruit.';section.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'center'});if(body.hidden)toggle.click();return}rootSelect.value=root.id;refresh();outcomeSelect.value=chosen.node.id;index=Math.max(0,chosen.chain.findIndex(step=>step.id===id));draw();if(body.hidden)toggle.click();section.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'center'});caption.setAttribute('tabindex','-1');caption.focus({preventScroll:true})});
if(roots.length){rootSelect.value=roots.find(r=>routes.some(route=>route.chain[0].id===r.id))?.id||roots[0].id;refresh()}
})();
