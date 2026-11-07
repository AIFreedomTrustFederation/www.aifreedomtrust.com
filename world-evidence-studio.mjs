/** Read-only evidence gap studio. All statements derive from the curated world projection. */
import {projectWorld,LAYERS} from './world-projection.mjs';
export function buildEvidenceBacklog(world){
 const nodes=world.nodes, byId=new Map(nodes.map(n=>[n.id,n]));
 return nodes.filter(n=>n.kind!=='root'&&n.kind!=='trunk').map(node=>{
  const inspection=world.inspect(node.id);
  const paths=inspection.lineage.paths;
  const sources=[...new Set(paths.flatMap(p=>p.edges.map(e=>e.evidenceUrl||e.source).filter(Boolean)))].sort();
  const roots=inspection.lineage.roots.map(n=>({id:n.id,label:n.label,url:n.url}));
  const structure=inspection.relationships.filter(e=>e.relation!=='contributes-to').map(e=>({
   relation:e.relation,other:byId.get(e.from===node.id?e.to:e.from)?.label||'Unknown'
  }));
  const missing=roots.length?[]:['No source-backed contribution path from a repository root'];
  if(node.kind==='fruit'&&!node.url.startsWith('https://github.com/')&&!roots.length)missing.push('Outcome exists in curated map but contributing roots are not attested');
  return {id:node.id,kind:node.kind,label:node.label,url:node.url,roots,sources,structure,missing,
   state:roots.length?'attested-lineage':'evidence-needed'};
 }).sort((a,b)=>LAYERS.indexOf(a.kind)-LAYERS.indexOf(b.kind)||a.label.localeCompare(b.label));
}
export function exportEvidenceBacklog(entries){
 return JSON.stringify({schema:'aift-evidence-backlog-v1',scope:'curated-offline-projection',disclaimer:'Not a live CI, deployment or security report',items:entries.map(e=>({id:e.id,kind:e.kind,state:e.state,rootIds:e.roots.map(r=>r.id),evidenceUrls:e.sources,missing:e.missing}))},null,2);
}
const host=typeof document==='undefined'?null:document.getElementById('world-evidence-studio');
if(host){
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n};
 const section=el('section');section.className='wes';host.append(section);
 const eyebrow=el('p','SOURCE CURRENT · EVIDENCE WORKBENCH'),title=el('h2','Where the tree needs evidence'),intro=el('p','Explore actual source gaps across systems, capabilities and outcomes. Structural membership never counts as contribution. This is curated evidence, not live CI or deployment health.');
 eyebrow.className='wes-eyebrow';section.append(eyebrow,title,intro);
 const controls=el('div');controls.className='wes-controls';const search=el('input'),kind=el('select'),state=el('select'),exportButton=el('button','Copy evidence backlog');
 search.type='search';search.placeholder='Find systems, capabilities, outcomes';search.setAttribute('aria-label','Search evidence backlog');
 for(const [select,options,label] of [[kind,[['all','All biological stages'],...LAYERS.filter(k=>k!=='root'&&k!=='trunk').map(k=>[k,k])],'Filter biological stage'],[state,[['all','All evidence states'],['evidence-needed','Evidence needed'],['attested-lineage','Attested source lineage']],'Filter evidence state']]){
  select.setAttribute('aria-label',label);for(const [value,text] of options){const o=el('option',text);o.value=value;select.append(o)}
 }
 exportButton.type='button';controls.append(search,kind,state,exportButton);section.append(controls);
 const summary=el('p');summary.className='wes-summary';summary.setAttribute('role','status');section.append(summary);
 const layout=el('div');layout.className='wes-layout';const list=el('div'),inspector=el('aside');list.className='wes-list';inspector.className='wes-inspector';inspector.setAttribute('aria-label','Evidence repair inspector');layout.append(list,inspector);section.append(layout);
 const status=el('p','Loading curated evidence…');status.setAttribute('role','status');section.append(status);
 const link=(label,url)=>{const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
 let entries=[],selected=null;
 function inspect(item){
  selected=item.id;inspector.replaceChildren();
  inspector.append(el('small',item.kind.toUpperCase()),el('h3',item.label),el('p',item.state==='attested-lineage'?'A repository-root contribution path is recorded. This does not attest release readiness.':'Contribution evidence is incomplete; do not infer an outcome is verified.'));
  inspector.append(link(item.kind==='fruit'?'Open actual outcome':'Open documented source',item.url));
  const h=el('h4','Contributing roots');inspector.append(h);
  if(item.roots.length)for(const root of item.roots)inspector.append(link(root.label,root.url));else inspector.append(el('p','No attested repository roots'));
  inspector.append(el('h4','Source attestations'));
  if(item.sources.length)for(const url of item.sources)inspector.append(link('Inspect attestation',url));else inspector.append(el('p','No contribution attestation recorded'));
  inspector.append(el('h4','Evidence to establish'));
  if(item.missing.length)for(const gap of item.missing)inspector.append(el('p',gap));else inspector.append(el('p','No missing contribution path identified in this curated projection'));
  if(item.structure.length){inspector.append(el('h4','Structural links (not contribution proof)'));for(const relation of item.structure)inspector.append(el('p',relation.relation+' · '+relation.other))}
  for(const button of list.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.id===selected));
 }
 function render(){
  const term=search.value.trim().toLowerCase();
  const visible=entries.filter(e=>(kind.value==='all'||e.kind===kind.value)&&(state.value==='all'||e.state===state.value)&&(e.label+' '+e.kind+' '+e.id).toLowerCase().includes(term));
  summary.textContent=visible.length+' of '+entries.length+' documented entities · '+visible.filter(e=>e.state==='evidence-needed').length+' evidence gaps in this view';
  list.replaceChildren();
  for(const item of visible){const b=el('button');b.type='button';b.dataset.id=item.id;b.className='wes-item';b.setAttribute('aria-pressed',String(item.id===selected));const label=el('strong',item.label),meta=el('small',item.kind+' · '+(item.roots.length?item.roots.length+' attested roots':'evidence needed'));b.append(label,meta);b.onclick=()=>inspect(item);list.append(b)}
  if(!visible.length)list.append(el('p','No documented entities match these filters.'));
  const active=visible.find(e=>e.id===selected)||visible[0];if(active)inspect(active);else inspector.replaceChildren(el('p','No matching evidence to inspect.'));
 }
 for(const input of [search,kind,state])input.addEventListener('input',render);
 exportButton.onclick=()=>{const data=exportEvidenceBacklog(entries);if(navigator.clipboard?.writeText){navigator.clipboard.writeText(data).then(()=>status.textContent='Curated backlog copied; no live statuses included').catch(()=>status.textContent='Clipboard unavailable; use the on-screen evidence inspector')}else status.textContent='Clipboard unavailable; use the on-screen evidence inspector'};
 fetch('data/living-universe.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(data=>{entries=buildEvidenceBacklog(projectWorld(data));status.textContent='Curated source manifest loaded; no live health claims';render()}).catch(err=>{status.textContent='Evidence unavailable: '+err.message;inspector.textContent='No inferred status is shown when the source manifest is unavailable'});
}
