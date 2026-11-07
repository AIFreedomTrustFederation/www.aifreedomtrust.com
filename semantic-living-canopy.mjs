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
 const stageNav=make('nav');stageNav.className='canopy-stages';stageNav.setAttribute('aria-label','Six biological growth stages');
 const scene=make('div');scene.className='canopy-scene';
 const detail=make('aside');detail.className='canopy-detail';detail.setAttribute('aria-live','polite');
 const status=make('p');status.setAttribute('role','status');
 host.replaceChildren(intro,controls,stageNav,scene,detail,status);
 const safeLink=(parent,url,label)=>{if(typeof url!=='string'||!/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(url))return;
  const a=make('a',label);a.href=url;a.rel='noopener noreferrer';a.target='_blank';parent.append(a)};
 function inspect(entry){
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
 search.addEventListener('input',render);select.addEventListener('change',render);render();return true;
}
if(typeof document!=='undefined'){
 const host=document.getElementById('living-canopy');
 if(host)fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json()})
 .then(data=>mountCanopy(document,data)).catch(()=>{host.textContent='Curated tree unavailable; no evidence or readiness can be inferred.'});
}
