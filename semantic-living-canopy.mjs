import {projectWorld,LAYERS} from './world-projection.mjs';
/** Evidence-only, keyboard accessible biological canopy. No network beyond same-origin manifest. */
export function canopyModel(manifest){
 const world=projectWorld(manifest);
 return LAYERS.map((kind,index)=>({
  kind,index,
  entries:world.nodes.filter(n=>n.kind===kind).map(n=>{
   const inspection=world.inspect(n.id);
   return {...n,roots:inspection.lineage.roots,evidenceGap:inspection.lineage.evidenceGap,
    attested:inspection.lineage.roots.length>0,verifiedOutcome:inspection.outcomeVerified};
  })
 }));
}
export function mountCanopy(doc,manifest){
 const host=doc.getElementById('living-canopy');if(!host)return false;
 const stages=canopyModel(manifest);
 const make=(tag,label)=>{const el=doc.createElement(tag);if(label!==undefined)el.textContent=label;return el};
 const intro=make('p','A six-stage source-to-outcome map. Repository roots are never products; a fruit requires an actual destination and traceable contribution evidence.');
 const controls=make('div');controls.className='canopy-controls';
 const search=make('input');search.type='search';search.placeholder='Search the living tree';search.setAttribute('aria-label','Search documented entities');
 const select=make('select');select.setAttribute('aria-label','Growth stage');
 for(const [value,label] of [['','All growth stages'],...LAYERS.map(s=>[s,s[0].toUpperCase()+s.slice(1)])]){const o=make('option',label);o.value=value;select.append(o)}
 controls.append(search,select);
 const overview=make('section');overview.className='canopy-evidence-overview';overview.setAttribute('aria-label','Evidence and biological growth overview');
 const stageNav=make('nav');stageNav.className='canopy-stages';stageNav.setAttribute('aria-label','Six biological growth stages');
 const scene=make('div');scene.className='canopy-scene';
 const detail=make('aside');detail.className='canopy-detail';detail.setAttribute('aria-live','polite');
 const status=make('p');status.setAttribute('role','status');
 const route=make('section');route.className='canopy-route';route.setAttribute('aria-label','Selected entity provenance journey');
 const navigator=make('div');navigator.className='canopy-journey-nav';navigator.setAttribute('role','group');navigator.setAttribute('aria-label','Reversible lineage navigation');
 const previous=make('button','← Previous stage');const next=make('button','Next stage →');const trail=make('p');trail.setAttribute('aria-live','polite');
 previous.type=next.type='button';navigator.append(previous,trail,next);
 const routeTitle=make('h3','Evidence journey');const routeBody=make('div');routeBody.className='canopy-route-body';
 const routeHelp=make('p','Choose an entity to reveal its documented root-to-outcome journey. Unverified connections are never drawn.');
 route.append(routeTitle,routeHelp,navigator,routeBody);
 host.replaceChildren(intro,overview,controls,stageNav,scene,route,detail,status);
 const safeLink=(parent,url,label)=>{if(typeof url!=='string'||!/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(url))return;
  const a=make('a',label);a.href=url;a.rel='noopener noreferrer';a.target='_blank';parent.append(a)};
 let selectedEntry=null;
 function renderOverview(){
  overview.replaceChildren();
  const heading=make('h3','Federation growth atlas');overview.append(heading);
  const summary=make('p','Counts describe the curated manifest, not live health or completed achievements. Select a stage to explore its documented entities.');overview.append(summary);
  const track=make('div');track.className='canopy-evidence-track';
  for(const stage of stages){
   const card=make('button');card.type='button';card.className='canopy-evidence-stage canopy-'+stage.kind;
   const count=stage.entries.length,attested=stage.entries.filter(e=>e.attested).length;
   card.append(make('strong',stage.kind[0].toUpperCase()+stage.kind.slice(1)),make('span',String(count)+' documented'),make('small',String(attested)+' with recorded root lineage'));
   if(stage.kind==='fruit')card.append(make('small',String(stage.entries.filter(e=>e.verifiedOutcome).length)+' source-verified outcomes · not live availability'));
   card.setAttribute('aria-label','Explore '+stage.kind+': '+count+' documented entities');
   card.addEventListener('click',()=>{select.value=stage.kind;search.value='';render();scene.scrollIntoView?.({block:'start',behavior:'auto'});});track.append(card);
  }
  overview.append(track);
 }
 renderOverview();
 function updateJourneyNav(){
  if(!selectedEntry){previous.disabled=next.disabled=true;trail.textContent='Select a documented entity to navigate its growth stage.';return;}
  const index=LAYERS.indexOf(selectedEntry.kind);
  previous.disabled=index<=0;next.disabled=index>=LAYERS.length-1;
  trail.textContent='Growth stage '+(index+1)+' of '+LAYERS.length+': '+selectedEntry.kind+'. Only documented entities are selectable.';
 }
 function navigateStage(direction){
  if(!selectedEntry)return;
  const target=LAYERS[LAYERS.indexOf(selectedEntry.kind)+direction];if(!target)return;
  const candidates=stages.find(s=>s.kind===target)?.entries||[];
  // Never invent edges: stage traversal selects only a documented entity, not an implied relationship.
  select.value=target;search.value='';render();
  if(candidates.length)inspect(candidates[0]);
  else{selectedEntry=null;detail.replaceChildren(make('p','No documented entities at this stage. No lineage inferred.'));routeBody.replaceChildren();updateJourneyNav()}
 }
 previous.addEventListener('click',()=>navigateStage(-1));next.addEventListener('click',()=>navigateStage(1));
 function showRoute(entry){
  routeBody.replaceChildren();
  const roots=entry.kind==='root'?[entry]:entry.roots;
  const stageNames={root:'Repository roots',trunk:'Federation trunk',branch:'Systems and branches',leaf:'Capabilities and leaves',flower:'Emerging work',fruit:'Published outcomes'};
  const addStep=(kind,label,note,href)=>{
   const step=make('div');step.className='canopy-route-step canopy-'+kind;
   const title=make('strong',label);const sub=make('p',note);
   step.append(title,sub);if(href)safeLink(step,href,'Open evidence source');
   routeBody.append(step);
  };
  if(roots.length){
   for(const root of roots)addStep('root',root.label||root.id,'Repository root · source provenance',root.url);
  }else addStep('root','Source evidence unavailable','No attested repository contribution path. The journey cannot be certified.');
  if(entry.kind!=='root'){
   addStep('trunk','AIFT federation','Shared federation context; this step does not independently attest an edge.');
   addStep(entry.kind,entry.label||entry.id,stageNames[entry.kind]+' · '+(entry.description||'No published description'),entry.url);
  }
  if(entry.kind==='fruit'&&!entry.verifiedOutcome)addStep('flower','Evidence boundary','Outcome verification is incomplete. No completion or operational status is claimed.');
  routeHelp.textContent=roots.length?'Documented contributing roots shown. Intermediate connections are contextual unless separately attested.':'Missing source evidence is visible; no lineage or achievement is inferred.';
 }
 function inspect(entry){
  selectedEntry=entry;updateJourneyNav();showRoute(entry);
  detail.replaceChildren(make('h3',entry.label||entry.id),make('p',entry.description||'No description published.'));
  detail.append(make('p','Biological role: '+entry.kind+'. '+(entry.attested?'Repository contribution path documented.':'No source-backed repository contribution path documented.')));
  if(entry.kind==='fruit')detail.append(make('p',entry.verifiedOutcome?'Documented source lineage; operational availability not independently checked.':'Outcome lineage incomplete; not certified as a completed deliverable.'));
  safeLink(detail,entry.url,entry.kind==='root'?'Open source repository':'Open published destination');
  for(const root of entry.roots)safeLink(detail,root.url,'Contributing root: '+(root.label||root.id));
  const button=make('button','Explore in constellation');button.type='button';
  button.addEventListener('click',()=>{doc.defaultView?.dispatchEvent(new CustomEvent('aift:lineage-select',{detail:{id:entry.id}}));doc.getElementById('scene-heading')?.scrollIntoView?.({block:'start'})});
  detail.append(button);
 }
 function render(){
  stageNav.replaceChildren();scene.replaceChildren();
  const needle=search.value.trim().toLocaleLowerCase();let count=0;
  for(const stage of stages){
   const filtered=stage.entries.filter(e=>(!select.value||select.value===stage.kind)&&(!needle||(e.label+' '+e.id+' '+(e.description||'')).toLocaleLowerCase().includes(needle)));
   if(!filtered.length)continue;count+=filtered.length;
   const column=make('section');column.className='canopy-column canopy-'+stage.kind;
   const heading=make('h3',stage.kind[0].toUpperCase()+stage.kind.slice(1));column.append(heading);
   const list=make('ul');
   for(const entry of filtered){
    const item=make('li');const button=make('button',entry.label||entry.id);button.type='button';
    button.setAttribute('aria-label','Inspect '+(entry.label||entry.id)+' ('+stage.kind+')');
    button.addEventListener('click',()=>inspect(entry));
    item.append(button);
    if(entry.kind==='fruit'&&!entry.verifiedOutcome)item.append(make('small','Evidence gap'));
    list.append(item);
   }
   column.append(list);scene.append(column);
   const jump=make('button',stage.kind+' · '+filtered.length);jump.type='button';jump.addEventListener('click',()=>column.scrollIntoView({block:'nearest',behavior:'auto'}));stageNav.append(jump);
  }
  status.textContent=count+' documented entities shown. Curated evidence, not live system status.';
  if(!count)scene.append(make('p','No documented entities match. No outcomes have been inferred.'));
 }
 search.addEventListener('input',render);select.addEventListener('change',render);updateJourneyNav();render();return true;
}
if(typeof document!=='undefined'){
 const host=document.getElementById('living-canopy');
 if(host)fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json()})
 .then(data=>mountCanopy(document,data)).catch(()=>{host.textContent='Curated tree unavailable; no evidence or readiness can be inferred.'});
}
