/** Read-only evidence cockpit. Curated manifest only; never runtime status. */
import {projectWorld} from './world-projection.mjs';
import {buildSemanticScene} from './world-semantic-scene.mjs';
import {createNavigation} from './living-universe-navigation.mjs';
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
 const scene=buildSemanticScene(world);
 const navigation=createNavigation(scene.nodes,scene.edges);
 const byId=new Map(scene.nodes.map(n=>[n.id,n]));
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
 const trail=make('nav',undefined,'cockpit-trail');trail.setAttribute('aria-label','Reversible provenance navigation');
 const history=make('div',undefined,'cockpit-history');
 const back=make('button','← Previous');back.type='button';back.setAttribute('aria-label','Previous inspected entity');
 const forward=make('button','Next →');forward.type='button';forward.setAttribute('aria-label','Next inspected entity');
 const reset=make('button','Clear journey');reset.type='button';
 history.append(back,forward,reset);
 const map=make('div',undefined,'cockpit-minimap');map.setAttribute('role','group');map.setAttribute('aria-label','Six-stage growth minimap');
 const journey=make('section',undefined,'cockpit-journey');journey.setAttribute('aria-label','Source-to-outcome provenance journey');
 const gaps=make('section',undefined,'cockpit-gaps');gaps.setAttribute('aria-label','Evidence readiness gates');
 root.replaceChildren(heading,note,controls,ribbon,status,map,list,history,trail,journey,gaps,detail);
 let selected=null;
 const safeLink=(url,text,parent)=>{if(typeof url!=='string'||!/^https:\/\/[^\s/]+/.test(url))return;const a=make('a',text);a.href=url;a.rel='noopener noreferrer';a.target='_blank';parent.append(a)};
 const sourceButton=(id,label,parent)=>{const b=make('button',label);b.type='button';b.onclick=()=>show(id);parent.append(b)};
 const renderJourney=node=>{
  trail.replaceChildren();journey.replaceChildren();gaps.replaceChildren();
  const snap=navigation.snapshot();back.disabled=!snap.back;forward.disabled=!snap.forward;reset.disabled=!snap.visited.length;
  if(!node){trail.append(make('p','Select a source, system, capability or outcome to trace its documented lineage.'));return}
  const roots=node.sourceRoots.map(id=>byId.get(id)).filter(Boolean);
  trail.append(make('strong','Inspected journey · '+snap.visited.length+' selections'));
  for(const id of snap.visited){const n=byId.get(id);if(n)sourceButton(id,n.label,trail)}
  journey.append(make('h4','Root → federation → capability → outcome'));
  if(!roots.length)journey.append(make('p','No contributing root is attested. A repository must not be inferred from a product name.'));
  for(const rootNode of roots)sourceButton(rootNode.id,'Root · '+rootNode.label,journey);
  const pathEdges=scene.edges.filter(e=>e.attested);
  const ancestors=new Set([node.id]);
  for(let depth=0;depth<scene.nodes.length;depth++){
   let changed=false;
   for(const edge of pathEdges)if(ancestors.has(edge.to)&&!ancestors.has(edge.from)){ancestors.add(edge.from);changed=true}
   if(!changed)break;
  }
  for(const stageName of STAGES.slice(1)){
   const matches=scene.nodes.filter(n=>n.kind===stageName&&ancestors.has(n.id)&&n.id!==node.id);
   for(const n of matches)sourceButton(n.id,stageName+' · '+n.label,journey);
  }
  if(node.kind==='fruit'&&node.destination){journey.append(make('p','Documented outcome destination (not deployment verification).'));safeLink(node.destination,'Open outcome',journey)}
  else if(node.kind==='fruit')journey.append(make('p','Fruit destination missing. This record is not a verified finished outcome.'));
  else journey.append(make('p','This stage is not a finished product. Explore its contributing roots and documented capabilities.'));
  gaps.append(make('h4','Evidence readiness · not live CI'));
  const gates=[['Contributing roots',roots.length>0],['Source attestation',node.evidenceUrls.length>0],['Public outcome destination',node.kind==='fruit'&&!!node.destination]];
  for(const [label,ok] of gates){const item=make('p',(ok?'Documented: ':'Evidence needed: ')+label);item.className=ok?'cockpit-gate-documented':'cockpit-gate-gap';gaps.append(item)}
  gaps.append(make('p','Documentation does not establish deployment, test success, security clearance, or an earned achievement.'));
 };
 const show=(id,{record=true}={})=>{
  const node=byId.get(id);if(!node)return;
  navigation.inspect(id,{record});selected=id;detail.replaceChildren(make('h4',node.label),make('p',node.description||'No description supplied.'),make('p','Stage: '+node.kind+' · Evidence: '+node.evidence));
  if(node.kind==='fruit'&&!node.destination)detail.append(make('p','Outcome destination not verified; this entity cannot be treated as a completed deliverable.'));
  if(node.kind==='fruit'&&node.destination)safeLink(node.destination,'Open documented outcome',detail);
  const jump=make('button','Explore in spatial theatre');jump.type='button';jump.onclick=()=>doc.defaultView?.dispatchEvent(new CustomEvent('aift:lineage-select',{detail:{id}}));detail.append(jump);
  const roots=make('p','Contributing roots: '+(node.sourceRoots.join(', ')||'No attested contributing roots'));detail.append(roots);
  if(!node.evidenceUrls.length)detail.append(make('p','No source attestation links recorded.'));
  for(const [i,url] of node.evidenceUrls.entries())safeLink(url,'Source attestation '+(i+1),detail);
  renderJourney(node);
 };
 const refresh=()=>{
  const model=cockpitModel(world,{query:query.value,stage:stage.value,evidence:evidence.value});
  status.textContent=model.total+' matching curated entities. No live operational status.';
  ribbon.replaceChildren();map.replaceChildren();
  for(const stageName of STAGES){const count=model.counts.find(x=>x.kind===stageName);const b=make('button',stageName+' · '+count.visible+'/'+count.total);b.type='button';b.dataset.stage=stageName;b.setAttribute('aria-pressed',String(stage.value===stageName));b.onclick=()=>{stage.value=stage.value===stageName?'all':stageName;refresh()};map.append(b)}
  for(const c of model.counts){const b=make('button',c.kind+' · '+c.visible+'/'+c.total);b.type='button';b.dataset.stage=c.kind;b.setAttribute('aria-pressed',String(stage.value===c.kind));b.onclick=()=>{stage.value=stage.value===c.kind?'all':c.kind;refresh()};ribbon.append(b)}
  list.replaceChildren();
  for(const n of model.nodes){const b=make('button',n.label+' · '+n.kind+' · '+n.evidence);b.type='button';b.className='cockpit-node';b.setAttribute('aria-pressed',String(selected===n.id));b.onclick=()=>{show(n.id);refresh()};list.append(b)}
  if(!model.nodes.length)list.append(make('p','No curated entities match these filters.'));
  if(selected)renderJourney(byId.get(selected));
 };
 back.onclick=()=>{const n=navigation.back();if(n){show(n.id,{record:false});refresh()}};
 forward.onclick=()=>{const n=navigation.forward();if(n){show(n.id,{record:false});refresh()}};
 reset.onclick=()=>{navigation.reset();selected=null;detail.replaceChildren(make('p','Journey cleared. Select an entity to inspect its evidence.'));renderJourney(null);refresh()};
 for(const control of [query,stage,evidence])control.addEventListener(control===query?'input':'change',refresh);
 renderJourney(null);refresh();
}
if(typeof document!=='undefined'){
 const root=document.getElementById('evidence-cockpit');
 if(root)fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json()}).then(data=>renderCockpit(root,projectWorld(data))).catch(()=>root.replaceChildren(Object.assign(document.createElement('p'),{textContent:'Curated evidence unavailable. No operational status inferred.'})));
}
