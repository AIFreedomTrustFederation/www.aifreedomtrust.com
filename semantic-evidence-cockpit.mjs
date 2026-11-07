/** Read-only evidence cockpit. Curated manifest only; never runtime status. */
import {projectWorld} from './world-projection.mjs';
import {buildSemanticScene} from './world-semantic-scene.mjs';
const STAGES=['root','trunk','branch','leaf','flower','fruit'];
export function cockpitModel(world,{query='',stage='all',evidence='all'}={}){
 if(!['all',...STAGES].includes(stage)||!['all','attested','evidence-needed'].includes(evidence))throw new TypeError('Invalid filter');
 const scene=buildSemanticScene(world);
 const q=String(query).trim().toLocaleLowerCase();
 const nodes=scene.nodes.filter(n=>(stage==='all'||n.kind===stage)&&(evidence==='all'||n.evidence===evidence)&&(!q||(n.label+' '+n.description+' '+n.id).toLocaleLowerCase().includes(q)));
 const counts=STAGES.map(kind=>({kind,total:scene.nodes.filter(n=>n.kind===kind).length,visible:nodes.filter(n=>n.kind===kind).length}));
 return {nodes,counts,total:nodes.length,disclaimer:scene.disclaimer};
}
export function renderCockpit(root,world){
 const doc=root.ownerDocument;
 const make=(tag,text,cls)=>{const x=doc.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x};
 const heading=make('h3','Evidence constellation cockpit');
 const note=make('p','Explore curated source evidence. No live health, readiness, XP or achievements are inferred.');
 const controls=make('div',undefined,'cockpit-controls');
 const query=make('input');query.type='search';query.placeholder='Search entities';query.setAttribute('aria-label','Search evidence entities');
 const stage=make('select');stage.setAttribute('aria-label','Biological stage');
 for(const kind of ['all',...STAGES]){const o=make('option',kind==='all'?'All growth stages':kind);o.value=kind;stage.append(o)}
 const evidence=make('select');evidence.setAttribute('aria-label','Evidence state');
 for(const [value,label] of [['all','All evidence states'],['attested','Attested root evidence'],['evidence-needed','Evidence needed']]){const o=make('option',label);o.value=value;evidence.append(o)}
 controls.append(query,stage,evidence);
 const ribbon=make('div',undefined,'cockpit-ribbon');ribbon.setAttribute('aria-label','Growth-stage distribution');
 const status=make('p');status.setAttribute('role','status');
 const list=make('div',undefined,'cockpit-entities');
 const detail=make('aside',undefined,'cockpit-detail');detail.append(make('p','Choose an entity to inspect its evidence and navigate the main scene.'));
 root.replaceChildren(heading,note,controls,ribbon,status,list,detail);
 let selected=null;
 const safeLink=(url,text,parent)=>{if(typeof url!=='string'||!/^https:\/\/[^\s/]+/.test(url))return;const a=make('a',text);a.href=url;a.rel='noopener noreferrer';a.target='_blank';parent.append(a)};
 const show=id=>{
  const node=buildSemanticScene(world).nodes.find(n=>n.id===id);if(!node)return;
  selected=id;detail.replaceChildren(make('h4',node.label),make('p',node.description||'No description supplied.'),make('p','Stage: '+node.kind+' · Evidence: '+node.evidence));
  if(node.kind==='fruit'&&!node.destination)detail.append(make('p','Outcome destination not verified; this entity cannot be treated as a completed deliverable.'));
  if(node.kind==='fruit'&&node.destination)safeLink(node.destination,'Open documented outcome',detail);
  const jump=make('button','Explore in spatial theatre');jump.type='button';jump.onclick=()=>doc.defaultView?.dispatchEvent(new CustomEvent('aift:lineage-select',{detail:{id}}));detail.append(jump);
  const roots=make('p','Contributing roots: '+(node.sourceRoots.join(', ')||'No attested contributing roots'));detail.append(roots);
  if(!node.evidenceUrls.length)detail.append(make('p','No source attestation links recorded.'));
  for(const [i,url] of node.evidenceUrls.entries())safeLink(url,'Source attestation '+(i+1),detail);
 };
 const refresh=()=>{
  const model=cockpitModel(world,{query:query.value,stage:stage.value,evidence:evidence.value});
  status.textContent=model.total+' matching curated entities. No live operational status.';
  ribbon.replaceChildren();
  for(const c of model.counts){const b=make('button',c.kind+' · '+c.visible+'/'+c.total);b.type='button';b.dataset.stage=c.kind;b.setAttribute('aria-pressed',String(stage.value===c.kind));b.onclick=()=>{stage.value=stage.value===c.kind?'all':c.kind;refresh()};ribbon.append(b)}
  list.replaceChildren();
  for(const n of model.nodes){const b=make('button',n.label+' · '+n.kind+' · '+n.evidence);b.type='button';b.className='cockpit-node';b.setAttribute('aria-pressed',String(selected===n.id));b.onclick=()=>{show(n.id);refresh()};list.append(b)}
  if(!model.nodes.length)list.append(make('p','No curated entities match these filters.'));
 };
 for(const control of [query,stage,evidence])control.addEventListener(control===query?'input':'change',refresh);
 refresh();
}
if(typeof document!=='undefined'){
 const root=document.getElementById('evidence-cockpit');
 if(root)fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json()}).then(data=>renderCockpit(root,projectWorld(data))).catch(()=>root.replaceChildren(Object.assign(document.createElement('p'),{textContent:'Curated evidence unavailable. No operational status inferred.'})));
}
