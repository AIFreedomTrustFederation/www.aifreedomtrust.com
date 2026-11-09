import {buildExplorationIndex,BIOLOGICAL_STAGES,SPECTRAL_TOKENS} from './semantic-federation-exploration-contract.mjs';
/** Immersive, read-only source-to-outcome journey; no inferred contribution edges. */
export function mountSpectralJourney(doc,manifest){
 const host=doc.getElementById('spectral-journey');if(!host)return false;
 const index=buildExplorationIndex(manifest), stages=index.stages;
 const make=(tag,text)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;return e};
 const state={selected:null,stage:'root',query:''};
 const header=make('div');header.className='spectral-hero';
 header.append(make('p','THE FEDERATION · EVIDENCE-BOUND EXPLORATION'),make('h3','From the roots to the stars'),make('p','Travel through the living federation. Every documented relationship remains inspectable; an unverified connection is never portrayed as a finished outcome.'));
 const controls=make('div');controls.className='spectral-controls';
 const search=make('input');search.type='search';search.placeholder='Search documented roots, capabilities and outcomes';search.setAttribute('aria-label','Search federation entities');
 const prev=make('button','Previous stage'),next=make('button','Next stage');prev.type=next.type='button';
 controls.append(search,prev,next);
 const ribbon=make('nav');ribbon.className='spectral-ribbon';ribbon.setAttribute('aria-label','Biological growth stages');
 const layout=make('div');layout.className='spectral-layout';
 const gallery=make('div');gallery.className='spectral-gallery';gallery.setAttribute('aria-label','Documented entities');
 const inspector=make('aside');inspector.className='spectral-inspector';inspector.setAttribute('aria-label','Selected entity provenance');
 const status=make('p');status.setAttribute('role','status');status.className='spectral-status';
 layout.append(gallery,inspector);host.replaceChildren(header,controls,ribbon,layout,status);
 const link=(url,label,container)=>{if(!url)return;const a=make('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';container.append(a)};
 const pick=id=>{const record=index.inspect(id);if(!record)return;state.selected=id;state.stage=record.entity.kind;render();doc.defaultView?.dispatchEvent(new CustomEvent('aift:lineage-select',{detail:{id}}))};
 function render(){
  const current=BIOLOGICAL_STAGES.indexOf(state.stage);
  prev.disabled=current===0;next.disabled=current===BIOLOGICAL_STAGES.length-1;
  ribbon.replaceChildren();
  for(const [i,stage] of stages.entries()){const b=make('button',stage.kind.toUpperCase()+' · '+stage.entities.length);b.type='button';b.className='spectral-stage';b.style.setProperty('--spectral-stage',i===0?SPECTRAL_TOKENS.red:i===2?SPECTRAL_TOKENS.green:i===5?SPECTRAL_TOKENS.blue:SPECTRAL_TOKENS.gold);b.setAttribute('aria-current',state.stage===stage.kind?'step':'false');b.onclick=()=>{state.stage=stage.kind;state.selected=null;render()};ribbon.append(b)}
  const entries=index.search(state.query,state.stage);
  gallery.replaceChildren();
  for(const entity of entries){const b=make('button');b.type='button';b.className='spectral-entity';b.setAttribute('aria-pressed',String(entity.id===state.selected));const detail=index.inspect(entity.id);b.append(make('strong',entity.label||entity.id),make('small',entity.kind==='root'?'Repository root':entity.kind==='fruit'?'Documented outcome':'Documented '+entity.kind),make('span',detail.evidenceGap?'Contribution evidence incomplete':detail.roots.length+' contributing roots recorded'));b.onclick=()=>pick(entity.id);gallery.append(b)}
  if(!entries.length)gallery.append(make('p','No documented entities match this stage and search. No missing outcomes are inferred.'));
  inspector.replaceChildren();
  const selected=state.selected&&index.inspect(state.selected);
  if(!selected){inspector.append(make('h4','Explore the lineage'),make('p','Choose a documented entity to inspect its contributing roots, attested paths and evidence gaps.'));status.textContent=entries.length+' documented entities in '+state.stage+'. Curated evidence, not live CI or runtime status.';return}
  inspector.append(make('p',selected.entity.kind.toUpperCase()),make('h4',selected.entity.label||selected.entity.id),make('p',selected.entity.description||'No description recorded.'));
  if(selected.entity.kind==='fruit'){const outcome=index.outcomes.find(o=>o.entity.id===selected.entity.id);inspector.append(make('p',outcome?.verified?'Documented outcome with attested contributing roots.':'Outcome evidence incomplete; not verified as a finished fruit.'))}
  if(selected.entity.kind==='root')link(selected.entity.url,'Inspect repository root',inspector);
  else if(selected.entity.kind==='fruit'&&index.outcomes.find(o=>o.entity.id===selected.entity.id)?.verified)link(selected.entity.url,'Open actual outcome',inspector);
  else link(selected.entity.url,'Inspect documented destination',inspector);
  const trails=index.journey(selected.entity.id);
  inspector.append(make('h5','Attested source paths'));
  if(!trails.length)inspector.append(make('p','No complete attested root-to-entity path. Organizational membership is not contribution evidence.'));
  for(const trail of trails){const section=make('section');section.className='spectral-trail';const ol=make('ol');for(const node of trail.nodes){const li=make('li');const b=make('button',node.label||node.id);b.type='button';b.onclick=()=>pick(node.id);li.append(b);ol.append(li)}section.append(ol);for(const [i,proof] of trail.evidence.entries())link(proof.evidenceUrl,'Contribution evidence '+(i+1),section);inspector.append(section)}
  status.textContent=selected.entity.label+' · '+trails.length+' attested paths. This is curated provenance, not live readiness.';
 }
 search.addEventListener('input',()=>{state.query=search.value;render()});
 prev.onclick=()=>{state.stage=BIOLOGICAL_STAGES[BIOLOGICAL_STAGES.indexOf(state.stage)-1];state.selected=null;render()};
 next.onclick=()=>{state.stage=BIOLOGICAL_STAGES[BIOLOGICAL_STAGES.indexOf(state.stage)+1];state.selected=null;render()};
 doc.defaultView?.addEventListener('aift:lineage-selected',event=>{const id=event.detail?.id;if(id&&index.inspect(id)&&id!==state.selected){state.selected=id;state.stage=index.inspect(id).entity.kind;render()}});
 render();return true;
}
if(typeof document!=='undefined'&&document.getElementById('spectral-journey'))fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json()}).then(data=>mountSpectralJourney(document,data)).catch(()=>{document.getElementById('spectral-journey').textContent='Curated provenance unavailable. No outcomes or readiness inferred.'});
