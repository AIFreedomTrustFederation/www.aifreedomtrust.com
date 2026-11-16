import {buildExplorationIndex,BIOLOGICAL_STAGES,SPECTRAL_TOKENS} from './semantic-federation-exploration-contract.mjs';
/** Immersive, read-only source-to-outcome journey; no inferred contribution edges. */
export function mountSpectralJourney(doc,manifest){
 const host=doc.getElementById('spectral-journey');if(!host)return false;
 const index=buildExplorationIndex(manifest), stages=index.stages;
 const make=(tag,text)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;return e};
 const state={selected:null,stage:'root',query:'',gapsOnly:false,history:[],cursor:-1};
 const header=make('div');header.className='spectral-hero';
 header.append(make('p','THE FEDERATION · EVIDENCE-BOUND EXPLORATION'),make('h3','From the roots to the stars'),make('p','Travel through the living federation. Every documented relationship remains inspectable; an unverified connection is never portrayed as a finished outcome.'));
 const controls=make('div');controls.className='spectral-controls';
 const search=make('input');search.type='search';search.placeholder='Search documented roots, capabilities and outcomes';search.setAttribute('aria-label','Search federation entities');
 const prev=make('button','Previous stage'),next=make('button','Next stage');prev.type=next.type='button';
 const gaps=make('label');gaps.className='spectral-gap-toggle';const gapBox=make('input');gapBox.type='checkbox';gaps.append(gapBox,make('span','Show evidence gaps only'));
 const back=make('button','Back in journey'),forward=make('button','Forward in journey');back.type=forward.type='button';
 controls.append(search,prev,next,gaps,back,forward);
 const breadcrumbs=make('nav');breadcrumbs.className='spectral-breadcrumbs';breadcrumbs.setAttribute('aria-label','Current exploration path');
 const map=make('section');map.className='spectral-map';map.setAttribute('aria-label','Spatial growth overview');
 const mapTitle=make('h4','Living federation · growth map'),mapBody=make('div');mapBody.className='spectral-map-track';map.append(mapTitle,mapBody);
 const ribbon=make('nav');ribbon.className='spectral-ribbon';ribbon.setAttribute('aria-label','Biological growth stages');
 const layout=make('div');layout.className='spectral-layout';
 const gallery=make('div');gallery.className='spectral-gallery';gallery.setAttribute('aria-label','Documented entities');
 const inspector=make('aside');inspector.className='spectral-inspector';inspector.setAttribute('aria-label','Selected entity provenance');
 const status=make('p');status.setAttribute('role','status');status.className='spectral-status';
 layout.append(gallery,inspector);host.replaceChildren(header,controls,breadcrumbs,ribbon,map,layout,status);
 const link=(url,label,container)=>{if(!url||!/^https:\/\//i.test(url))return;const a=make('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';container.append(a)};
 const visit=(id,recordHistory=true)=>{const record=id&&index.inspect(id);if(id&&!record)return;
  state.selected=id||null;if(record)state.stage=record.entity.kind;
  if(recordHistory){state.history=state.history.slice(0,state.cursor+1);state.history.push({id:state.selected,stage:state.stage});state.cursor=state.history.length-1}
  render();if(id)doc.defaultView?.dispatchEvent(new CustomEvent('aift:lineage-select',{detail:{id}}))
 };
 const pick=id=>visit(id);
 function render(){
  const current=BIOLOGICAL_STAGES.indexOf(state.stage);
  back.disabled=state.cursor<=0;forward.disabled=state.cursor>=state.history.length-1;
  breadcrumbs.replaceChildren();const home=make('button','Federation');home.type='button';home.onclick=()=>{state.selected=null;state.stage='root';visit(null)};breadcrumbs.append(home);
  const selectedPath=state.selected&&index.inspect(state.selected)?.trails?.[0]?.nodes||[];
  for(const node of selectedPath){breadcrumbs.append(make('span','›'));const crumb=make('button',node.label||node.id);crumb.type='button';crumb.setAttribute('aria-current',node.id===state.selected?'page':'false');crumb.onclick=()=>pick(node.id);breadcrumbs.append(crumb)}
  mapBody.replaceChildren();
  for(const stage of stages){const cell=make('button');cell.type='button';cell.className='spectral-map-cell';cell.setAttribute('aria-current',stage.kind===state.stage?'step':'false');cell.style.setProperty('--spectral-stage',SPECTRAL_TOKENS[stage.kind==='root'?'red':stage.kind==='leaf'?'green':stage.kind==='fruit'?'blue':'gold']);const count=stage.entities.length;
   const missing=stage.entities.filter(entity=>index.inspect(entity.id)?.evidenceGap).length;
   cell.append(make('strong',stage.kind.toUpperCase()),make('span',count+' documented'),make('small',missing+' without attested root path'));cell.onclick=()=>{state.stage=stage.kind;state.selected=null;visit(null)};mapBody.append(cell)}
  
  prev.disabled=current===0;next.disabled=current===BIOLOGICAL_STAGES.length-1;
  ribbon.replaceChildren();
  for(const [i,stage] of stages.entries()){const b=make('button',stage.kind.toUpperCase()+' · '+stage.entities.length);b.type='button';b.className='spectral-stage';b.style.setProperty('--spectral-stage',i===0?SPECTRAL_TOKENS.red:i===2?SPECTRAL_TOKENS.green:i===5?SPECTRAL_TOKENS.blue:SPECTRAL_TOKENS.gold);b.setAttribute('aria-current',state.stage===stage.kind?'step':'false');b.onclick=()=>{state.stage=stage.kind;state.selected=null;visit(null)};ribbon.append(b)}
  const entries=index.search(state.query,state.stage).filter(entity=>!state.gapsOnly||index.inspect(entity.id)?.evidenceGap);
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
 gapBox.addEventListener('change',()=>{state.gapsOnly=gapBox.checked;render()});
 back.onclick=()=>{if(state.cursor>0){state.cursor--;const entry=state.history[state.cursor];state.stage=entry.stage;visit(entry.id,false)}};
 forward.onclick=()=>{if(state.cursor<state.history.length-1){state.cursor++;const entry=state.history[state.cursor];state.stage=entry.stage;visit(entry.id,false)}};
 prev.onclick=()=>{state.stage=BIOLOGICAL_STAGES[BIOLOGICAL_STAGES.indexOf(state.stage)-1];state.selected=null;visit(null)};
 next.onclick=()=>{state.stage=BIOLOGICAL_STAGES[BIOLOGICAL_STAGES.indexOf(state.stage)+1];state.selected=null;visit(null)};
 doc.defaultView?.addEventListener('aift:lineage-selected',event=>{const id=event.detail?.id;if(id&&index.inspect(id)&&id!==state.selected){state.selected=id;state.stage=index.inspect(id).entity.kind;render()}});
 render();return true;
}
if(typeof document!=='undefined'&&document.getElementById('spectral-journey'))fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json()}).then(data=>mountSpectralJourney(document,data)).catch(()=>{document.getElementById('spectral-journey').textContent='Curated provenance unavailable. No outcomes or readiness inferred.'});
