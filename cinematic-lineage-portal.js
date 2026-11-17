/* Living Universe 3.0: cinematic source constellation, no synthetic nodes or achievements. */
(()=>{'use strict';
const host=document.querySelector('.world'),scene=host?.querySelector('.tree'),nodes=window.AIFT_LINEAGE_NODES;
if(!host||!scene||!Array.isArray(nodes))return;
const stages=['root','trunk','branch','leaf','flower','fruit'];
const titles={root:'The source beneath everything',trunk:'One living federation',branch:'Systems grow outward',leaf:'Knowledge becomes visible',flower:'Emerging work, not finished products',fruit:'Documented experiences'};
const descriptions={root:'Repositories and source systems nourish the Tree.',trunk:'The shared federation joins documented source relationships.',branch:'Actual capabilities and systems extend from source roots.',leaf:'Documented interfaces, knowledge and functions appear.',flower:'Emerging integrations remain work in progress.',fruit:'Only published visitor-facing outcomes can bear fruit.'};
const valid=nodes.filter(n=>n&&stages.includes(n.kind)&&typeof n.id==='string');
const byId=new Map(valid.map(n=>[n.id,n]));
const panel=document.createElement('div');panel.className='cinematic-portal';panel.setAttribute('aria-label','Source-backed cinematic exploration');
const eyebrow=document.createElement('p');eyebrow.className='cinematic-portal-eyebrow';eyebrow.textContent='THE TREE IS ALIVE · DOCUMENTED LINEAGE';
const heading=document.createElement('h2');heading.className='cinematic-portal-heading';
const detail=document.createElement('p');detail.className='cinematic-portal-detail';
const track=document.createElement('div');track.className='cinematic-portal-track';track.setAttribute('role','group');track.setAttribute('aria-label','Navigate growth layers');
const footer=document.createElement('p');footer.className='cinematic-portal-evidence';footer.setAttribute('role','status');
const inspect=document.createElement('a');inspect.className='cinematic-portal-inspect';inspect.href='#evidence-world';inspect.textContent='Explore documented sources';
const sourceList=document.createElement('div');sourceList.className='cinematic-portal-sources';sourceList.setAttribute('role','group');sourceList.setAttribute('aria-label','Published sources in selected growth stage');
const sourceHelp=document.createElement('p');sourceHelp.className='cinematic-portal-source-help';sourceHelp.textContent='Choose a documented source to focus its luminous point on the Tree. Use the source inspector below for full provenance.';
const lineageDetail=document.createElement('section');lineageDetail.className='cinematic-portal-lineage';lineageDetail.setAttribute('aria-label','Selected source lineage');lineageDetail.setAttribute('aria-live','polite');
panel.append(eyebrow,heading,detail,track,footer,sourceHelp,sourceList,lineageDetail,inspect);
/* Keep the first viewport a playable Tree: source cards and long provenance trails
   belong in a dedicated exploration theater below the hero, never over the camera. */
panel.id='cinematic-growth-theater';host.after(panel);
const theaterLink=document.createElement('a');theaterLink.className='cinematic-theater-entry';theaterLink.href='#cinematic-growth-theater';theaterLink.textContent='Explore the six growth stages';host.append(theaterLink);
let active='root';
const safeDestination=n=>{try{if(n.kind!=='fruit'||!n.url)return null;const u=new URL(n.url,location.href);return u.protocol==='https:'||u.origin===location.origin?u.href:null}catch{return null}};
const buttons=new Map();
function traceSource(node){
 lineageDetail.replaceChildren();
 const title=document.createElement('h3');title.textContent='Trace: '+String(node.label||node.id);lineageDetail.append(title);
 const ancestry=[],seen=new Set();let current=node;
 while(current&&!seen.has(current.id)){seen.add(current.id);ancestry.unshift(current);current=byId.get(current.parent);}
 if(current){const warning=document.createElement('p');warning.textContent='Cycle detected in published lineage; traversal stopped.';lineageDetail.append(warning);}
 else if(ancestry.length&&ancestry[0].parent&&!byId.has(ancestry[0].parent)){const warning=document.createElement('p');warning.textContent='Parent evidence is missing from the published lineage.';lineageDetail.append(warning);}
 const path=document.createElement('ol');path.className='cinematic-portal-lineage-path';
 for(const step of ancestry){const item=document.createElement('li');const button=document.createElement('button');button.type='button';button.textContent=step.kind+': '+String(step.label||step.id);button.addEventListener('click',()=>{activate(step.kind);traceSource(step);});item.append(button);path.append(item);}
 lineageDetail.append(path);
 if(node.kind==='fruit'){const href=safeDestination(node);const outcome=document.createElement('p');outcome.textContent=href?'Published outcome destination:':'No safe published outcome destination is available.';lineageDetail.append(outcome);if(href){const link=document.createElement('a');link.href=href;link.textContent='Open documented experience';if(new URL(href).origin!==location.origin){link.target='_blank';link.rel='noopener noreferrer';}lineageDetail.append(link);}}
 else {const note=document.createElement('p');note.textContent='This '+node.kind+' is documented lineage, not a completed visitor-facing fruit.';lineageDetail.append(note);}
}
function renderSources(kind){
 sourceList.replaceChildren();
 const matches=valid.filter(n=>n.kind===kind).sort((a,b)=>String(a.label).localeCompare(String(b.label)));
 if(!matches.length){const empty=document.createElement('p');empty.textContent=kind==='fruit'?'No documented visitor outcome is available at this stage. No fruit is invented.':'No published records are available for this stage.';sourceList.append(empty);return;}
 for(const node of matches){
  const button=document.createElement('button');button.type='button';button.className='cinematic-portal-source';
  const name=document.createElement('strong');name.textContent=node.label||node.id;
  const kindLabel=document.createElement('small');kindLabel.textContent=node.kind==='fruit'?(safeDestination(node)?'Documented experience':'Destination evidence missing'):'Published '+node.kind;
  button.append(name,kindLabel);
  button.addEventListener('click',()=>{
   const point=[...scene.querySelectorAll('.living-source-node')].find(el=>el.dataset.node===node.id);
   if(point){point.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));point.focus({preventScroll:true});}
   const inspector=document.querySelector('.living-source-inspector');
   if(inspector)inspector.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });
  const trace=document.createElement('button');trace.type='button';trace.className='cinematic-portal-trace';trace.textContent='Trace lineage';trace.setAttribute('aria-label','Trace lineage for '+String(node.label||node.id));trace.addEventListener('click',()=>traceSource(node));const entry=document.createElement('div');entry.className='cinematic-portal-source-entry';entry.append(button,trace);sourceList.append(entry);
 }
}
function activate(kind){
 if(!stages.includes(kind))return;
 active=kind;host.dataset.cinematicStage=kind;
 heading.textContent=titles[kind];detail.textContent=descriptions[kind];
 const matches=valid.filter(n=>n.kind===kind);
 renderSources(kind);
 lineageDetail.replaceChildren();
 footer.textContent=matches.length+' documented '+kind+' '+(matches.length===1?'record':'records')+'. '+(kind==='fruit'?'Only records with safe published destinations can be opened.':'These are curated relationships, not live system health.');
 for(const [stage,button] of buttons)button.setAttribute('aria-pressed',String(stage===kind));
 const projected=scene.querySelectorAll('.living-source-node');
 for(const el of projected){const n=byId.get(el.dataset.node);el.classList.toggle('cinematic-stage-lit',!!n&&n.kind===kind);el.classList.toggle('cinematic-stage-muted',!!n&&n.kind!==kind)}
 const beacon=document.querySelector('[data-world-stage="'+kind+'"]');
 for(const item of document.querySelectorAll('[data-world-stage]'))item.setAttribute('aria-pressed',String(item.dataset.worldStage===kind));
 const first=matches.find(n=>kind!=='fruit'||safeDestination(n));
 inspect.href='#evidence-world';inspect.textContent=kind==='fruit'&&first?'Inspect documented experiences':'Explore '+kind+' in the source map';
}
for(const [index,kind] of stages.entries()){
 const button=document.createElement('button');button.type='button';button.className='cinematic-portal-step';
 button.textContent=String(index+1).padStart(2,'0');button.title=titles[kind];
 button.setAttribute('aria-label',(index+1)+' of 6: '+titles[kind]);button.dataset.kind=kind;
 button.addEventListener('click',()=>activate(kind));buttons.set(kind,button);track.append(button);
}
track.addEventListener('keydown',event=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();const index=stages.indexOf(active);
 const next=event.key==='Home'?0:event.key==='End'?5:(index+(event.key==='ArrowRight'?1:5))%6;
 buttons.get(stages[next]).focus();activate(stages[next]);
});
document.querySelectorAll('[data-world-stage]').forEach(button=>button.addEventListener('click',()=>activate(button.dataset.worldStage)));
const observer=new MutationObserver(()=>{for(const el of scene.querySelectorAll('.living-source-node')){const n=byId.get(el.dataset.node);el.classList.toggle('cinematic-stage-lit',!!n&&n.kind===active);el.classList.toggle('cinematic-stage-muted',!!n&&n.kind!==active)}});
observer.observe(scene,{childList:true,subtree:true});
activate('root');
})();