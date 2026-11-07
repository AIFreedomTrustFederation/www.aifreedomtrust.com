/** Read-only, evidence-gated exploration missions. No invented XP or runtime assertions. */
import {projectWorld} from './world-projection.mjs';
import {buildSemanticScene} from './world-semantic-scene.mjs';
const stages=['root','trunk','branch','leaf','flower','fruit'];
const https=u=>typeof u==='string'&&/^https:\/\/[^\s/]+/.test(u);
export function deriveEvidenceJourneys(scene){
 if(!scene||!Array.isArray(scene.nodes))throw new TypeError('Semantic scene required');
 return scene.nodes.filter(n=>n.kind!=='trunk').map(n=>{
  const evidence=Array.isArray(n.evidenceUrls)?n.evidenceUrls.filter(https):[];
  const roots=Array.isArray(n.sourceRoots)?n.sourceRoots:[];
  const deliverable=n.kind==='fruit';
  const tasks=[
   {id:'identity',label:'Inspect documented entity',done:Boolean(n.id&&n.label),proof:null},
   {id:'roots',label:'Trace attested contributing repository roots',done:roots.length>0&&evidence.length>0,proof:evidence[0]||null},
   {id:'evidence',label:'Review source attestation',done:evidence.length>0,proof:evidence[0]||null}
  ];
  if(deliverable)tasks.push({id:'outcome',label:'Open verified outcome destination',done:https(n.destination)&&!/^https:\/\/github\.com(?:\/|$)/i.test(n.destination),proof:n.destination||null});
  return {id:n.id,label:n.label,kind:n.kind,description:n.description||'',tasks,ready:tasks.every(t=>t.done),evidenceUrls:evidence,sourceRoots:roots,destination:deliverable?n.destination:null};
 });
}
export function renderJourneyStudio(target,journeys,onNavigate){
 const doc=target.ownerDocument;
 const make=(tag,text,cls)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
 const toolbar=make('div',undefined,'journey-tools'),search=make('input'),stage=make('select'),status=make('p',undefined,'journey-status'),cards=make('div',undefined,'journey-grid');
 search.type='search';search.placeholder='Search evidence journeys';search.setAttribute('aria-label','Search evidence journeys');
 stage.setAttribute('aria-label','Filter journey stage');
 for(const [value,label] of [['','All growth stages'],...stages.map(x=>[x,x[0].toUpperCase()+x.slice(1)])]){const option=make('option',label);option.value=value;stage.append(option)}
 toolbar.append(search,stage);target.replaceChildren(toolbar,status,cards);
 const update=()=>{
  const q=search.value.trim().toLocaleLowerCase();
  const shown=journeys.filter(j=>(!stage.value||stage.value===j.kind)&&(!q||(j.label+' '+j.description).toLocaleLowerCase().includes(q)));
  cards.replaceChildren();
  status.textContent=shown.length+' documented journeys · '+shown.filter(j=>j.ready).length+' with all required evidence · curated snapshot, not live CI';
  for(const j of shown){
   const article=make('article',undefined,'journey-card'),heading=make('h3',j.label),meta=make('p',j.kind+' · '+j.tasks.filter(t=>t.done).length+'/'+j.tasks.length+' evidence conditions documented','journey-meta');
   const desc=make('p',j.description||'No description recorded.'),list=make('ul');
   for(const t of j.tasks){const li=make('li',(t.done?'Documented: ':'Evidence needed: ')+t.label);li.className=t.done?'documented':'needed';if(t.proof&&https(t.proof)){const a=make('a',' Inspect evidence');a.href=t.proof;a.target='_blank';a.rel='noopener noreferrer';li.append(a)}list.append(li)}
   const button=make('button','Locate in living lineage');button.type='button';button.addEventListener('click',()=>onNavigate(j.id));
   article.append(heading,meta,desc,list,button);cards.append(article);
  }
  if(!shown.length)cards.append(make('p','No documented entities match this filter.'));
 };
 search.addEventListener('input',update);stage.addEventListener('change',update);update();
}
if(typeof document!=='undefined'){
 const target=document.getElementById('journey-studio');
 if(target)fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{
  const scene=buildSemanticScene(projectWorld(data));
  renderJourneyStudio(target,deriveEvidenceJourneys(scene),id=>{
   const link=new URL('semantic-scene.html',location.href);link.searchParams.set('entity',id);location.assign(link.href);
  });
 }).catch(()=>{target.textContent='Curated journey evidence unavailable. No completion or live status inferred.'});
}
