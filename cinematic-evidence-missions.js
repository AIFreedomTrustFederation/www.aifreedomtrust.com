/* Living Universe 3.0: evidence-bound exploration missions, not simulated CI or XP. */
(()=>{'use strict';
const nodes=window.AIFT_LINEAGE_NODES;
const host=document.querySelector('.living-source-inspector');
if(!Array.isArray(nodes)||!host)return;
const valid=new Map(nodes.filter(n=>n&&typeof n.id==='string'&&['root','trunk','branch','leaf','flower','fruit'].includes(n.kind)).map(n=>[n.id,n]));
const stages=['root','trunk','branch','leaf','flower','fruit'];
const section=document.createElement('section');section.className='living-evidence-missions';section.setAttribute('aria-labelledby','living-missions-title');
const title=document.createElement('h3');title.id='living-missions-title';title.textContent='Paths of discovery';
const lead=document.createElement('p');lead.textContent='Explore published evidence, not simulated achievements. These paths reflect documented ancestry; they do not measure live system readiness.';
const picker=document.createElement('div');picker.className='living-mission-picker';picker.setAttribute('role','group');picker.setAttribute('aria-label','Choose an evidence-backed journey');
const trail=document.createElement('ol');trail.className='living-mission-trail';trail.setAttribute('aria-label','Documented growth path');
const note=document.createElement('p');note.className='living-mission-note';note.setAttribute('role','status');
section.append(title,lead,picker,trail,note);host.insertBefore(section,host.firstChild);
const safePath=node=>{const out=[],seen=new Set();let cur=node;while(cur&&!seen.has(cur.id)){out.unshift(cur);seen.add(cur.id);cur=valid.get(cur.parent)}return out};
const outcomes=[...valid.values()].filter(n=>n.kind==='fruit'&&typeof n.url==='string'&&n.url.trim()&&safePath(n).some(p=>p.kind==='root'));
const candidates=outcomes.length?outcomes:[...valid.values()].filter(n=>n.kind==='leaf'||n.kind==='flower');
const journeys=candidates.map(node=>({node,path:safePath(node)})).filter(x=>x.path.length>1).sort((a,b)=>b.path.length-a.path.length||a.node.label.localeCompare(b.node.label)).slice(0,8);
let active=null;
const activate=node=>{
 const target=[...document.querySelectorAll('.living-source-node')].find(el=>el.dataset.node===node.id);
 if(target){target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));target.focus({preventScroll:true});}
 else note.textContent='This published node is not currently projected. Use the source directory to inspect it.';
};
function render(journey){
 active=journey;trail.replaceChildren();
 for(const node of journey.path){
  const item=document.createElement('li'),button=document.createElement('button');button.type='button';
  button.textContent=node.label+' · '+node.kind;button.addEventListener('click',()=>activate(node));
  item.append(button);trail.append(item);
 }
 for(const button of picker.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.id===journey.node.id));
 const kinds=new Set(journey.path.map(n=>n.kind));
 const missing=stages.filter(s=>!kinds.has(s));
 note.textContent=journey.node.kind==='fruit'
 ?'Documented visitor-facing outcome. Open its verified destination through the source inspector. No completion or reward is claimed.'
 :'No documented finished outcome for this path. Missing growth stages: '+(missing.join(', ')||'none')+'. No fruit is invented.';
}
for(const journey of journeys){
 const button=document.createElement('button');button.type='button';button.dataset.id=journey.node.id;
 button.textContent=journey.node.label;button.addEventListener('click',()=>render(journey));picker.append(button);
}
if(journeys.length)render(journeys[0]);
else note.textContent='No published multi-stage path is available. Explore the source directory; no journey is fabricated.';
})();
