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
panel.append(eyebrow,heading,detail,track,footer,sourceHelp,sourceList,inspect);host.append(panel);
let active='root';
const safeDestination=n=>{try{if(n.kind!=='fruit'||!n.url)return null;const u=new URL(n.url,location.href);return u.protocol==='https:'||u.origin===location.origin?u.href:null}catch{return null}};
const buttons=new Map();
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
  sourceList.append(button);
 }
}
function activate(kind){
 if(!stages.includes(kind))return;
 active=kind;host.dataset.cinematicStage=kind;
 heading.textContent=titles[kind];detail.textContent=descriptions[kind];
 const matches=valid.filter(n=>n.kind===kind);
 renderSources(kind);
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