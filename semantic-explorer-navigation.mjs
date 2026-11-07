/** Shared, read-only exploration shell. Existing workspaces remain mounted and unchanged. */
export const EXPLORERS=Object.freeze([
 ['scene-heading','Constellation','Spatial exploration and accessible entity index'],
 ['voyage-heading','Voyage','Six biological growth chapters'],
 ['cockpit-heading','Evidence','Curated provenance and evidence gaps'],
 ['atlas-heading','Atlas','Evidence-backed chapter atlas'],
 ['lineage-paths-heading','Lineage','Attested source-to-outcome paths'],
 ['journey-heading','Missions','Documented milestones, not earned achievements'],
 ['comparison-heading','Compare','Two-entity source comparison']
]);

/** Resolve a deep link to the workspace containing its target, including descendants. */
export function resolveExplorerIndex(doc,hash,sections){
 let id;
 try{id=decodeURIComponent(String(hash||'').replace(/^#/,''));}catch{return 0;}
 if(!id)return 0;
 const target=doc.getElementById(id);
 if(!target)return 0;
 const index=sections.findIndex(section=>section===target||section.contains(target));
 return index<0?0:index;
}

export function mountExplorerNavigation(doc){
 const main=doc.querySelector('main'),first=doc.getElementById(EXPLORERS[0][0]);
 if(!main||!first)return false;
 const sections=EXPLORERS.map(([id])=>doc.getElementById(id)?.closest('section'));
 if(sections.some(s=>!s))return false;
 const nav=doc.createElement('nav');nav.id='explorer-navigation';nav.className='explorer-navigation';
 nav.setAttribute('aria-label','Living Lineage exploration workspaces');
 const intro=doc.createElement('p');intro.className='explorer-navigation-intro';
 intro.textContent='One connected universe · Choose a workspace. All original evidence, navigation and source links remain available.';
 const tabs=doc.createElement('div');tabs.className='explorer-navigation-tabs';
 tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Exploration workspaces');
 const discovery=doc.createElement('div');discovery.className='explorer-discovery';
 const searchLabel=doc.createElement('label');searchLabel.textContent='Find a workspace or published section ';
 const search=doc.createElement('input');search.type='search';search.id='explorer-global-search';
 search.placeholder='Search titles, sections and workspace descriptions';
 search.setAttribute('aria-controls','explorer-discovery-results');
 searchLabel.append(search);
 const results=doc.createElement('div');results.id='explorer-discovery-results';results.className='explorer-discovery-results';
 results.setAttribute('role','region');results.setAttribute('aria-label','Matching published sections');
 discovery.append(searchLabel,results);
 const summary=doc.createElement('p');summary.id='explorer-navigation-status';summary.setAttribute('role','status');
 const win=doc.defaultView;
 // Session-only navigation trail; never persisted or sent to a server.
 const trail=doc.createElement('div');trail.className='explorer-trail';trail.setAttribute('aria-label','Exploration trail');
 const trailTitle=doc.createElement('p');trailTitle.textContent='Your exploration trail · this page only';
 const trailSteps=doc.createElement('ol');trailSteps.className='explorer-trail-steps';
 const actions=doc.createElement('div');actions.className='explorer-trail-actions';
 const back=doc.createElement('button');back.type='button';back.textContent='Back along trail';
 const clear=doc.createElement('button');clear.type='button';clear.textContent='Clear trail';
 actions.append(back,clear);trail.append(trailTitle,trailSteps,actions);
 const visited=[];let replaying=false;
 function renderTrail(){
  trailSteps.replaceChildren();
  visited.forEach((index,position)=>{
   const li=doc.createElement('li'),button=doc.createElement('button');
   button.type='button';button.textContent=EXPLORERS[index][1];
   if(position===visited.length-1)button.setAttribute('aria-current','step');
   button.addEventListener('click',()=>{
    visited.splice(position+1);replaying=true;
    activate(index,{navigate:true,focus:true});replaying=false;renderTrail();
   });
   li.append(button);trailSteps.append(li);
  });
  back.disabled=visited.length<2;clear.disabled=visited.length<2;
 }
 function recordVisit(index){
  if(replaying||visited.at(-1)===index)return;
  visited.push(index);if(visited.length>30)visited.shift();renderTrail();
 }
 back.addEventListener('click',()=>{
  if(visited.length<2)return;
  visited.pop();replaying=true;activate(visited.at(-1),{navigate:true,focus:true});
  replaying=false;renderTrail();
 });
 clear.addEventListener('click',()=>{visited.splice(0,visited.length-1);renderTrail();});
 let active=-1;
 const buttons=EXPLORERS.map(([id,label,description],i)=>{
  const button=doc.createElement('button');button.type='button';button.textContent=label;
  button.setAttribute('aria-controls',sections[i].id||id);
  button.setAttribute('aria-label',label+' workspace: '+description);
  button.addEventListener('click',()=>activate(i,{navigate:true,focus:true}));
  button.addEventListener('keydown',event=>{
   if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
   event.preventDefault();
   const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:
    (i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
   activate(next,{navigate:true,focus:true});
  });
  tabs.append(button);return button;
 });
 function activate(index,{navigate=false,focus=false}={}){
  if(index<0||index>=sections.length)return;
  active=index;
  recordVisit(index);
  sections.forEach((section,i)=>{
   section.hidden=i!==index;
   buttons[i].setAttribute('aria-current',i===index?'page':'false');
   buttons[i].setAttribute('aria-expanded',String(i===index));
  });
  summary.textContent=EXPLORERS[index][2]+' · Curated evidence, not live operational status.';
  if(navigate)win?.history?.pushState(null,'','#'+EXPLORERS[index][0]);
  if(focus)buttons[index].focus();
 }
 function followLocation(){
  const index=resolveExplorerIndex(doc,win?.location?.hash,sections);
  activate(index);
  const raw=win?.location?.hash?.slice(1)||'';
  let id;try{id=decodeURIComponent(raw);}catch{id='';}
  const target=doc.getElementById(id);
  if(target&&target!==sections[index]&&target!==doc.getElementById(EXPLORERS[index][0]))
   target.scrollIntoView?.({block:'nearest'});
 }
 function searchTargets(query){
  const needle=String(query||'').trim().toLocaleLowerCase();
  if(needle.length<2)return [];
  const matches=[];
  sections.forEach((section,index)=>{
   const candidates=[{node:section.querySelector('h2'),label:EXPLORERS[index][1]+' · '+EXPLORERS[index][2]},
    ...Array.from(section.querySelectorAll('h3,h4')).map(node=>({node,label:node.textContent?.trim()||''}))];
   for(const candidate of candidates){
    if(candidate.node&&(candidate.label.toLocaleLowerCase().includes(needle)||
       (candidate.node.textContent||'').toLocaleLowerCase().includes(needle)))
     matches.push({index,node:candidate.node,label:candidate.label});
   }
  });
  return matches.slice(0,24);
 }
 function renderResults(){
  results.replaceChildren();
  const query=search.value.trim();
  if(query.length<2)return;
  const matches=searchTargets(query);
  if(!matches.length){const p=doc.createElement('p');p.textContent='No matching published headings. Try another term.';results.append(p);return;}
  for(const match of matches){
   const button=doc.createElement('button');button.type='button';button.className='explorer-discovery-hit';
   button.textContent=EXPLORERS[match.index][1]+' / '+match.label;
   button.addEventListener('click',()=>{
    activate(match.index,{navigate:false});
    if(!match.node.id)match.node.id='explorer-heading-'+match.index+'-'+Array.from(sections[match.index].querySelectorAll('h2,h3,h4')).indexOf(match.node);
    win?.history?.pushState(null,'','#'+encodeURIComponent(match.node.id));
    match.node.setAttribute('tabindex','-1');match.node.focus({preventScroll:true});
    match.node.scrollIntoView?.({block:'start'});
   });
   results.append(button);
  }
 }
 search.addEventListener('input',renderResults);
 nav.append(intro,tabs,discovery,trail,summary);sections[0].before(nav);
 win?.addEventListener('hashchange',followLocation);
 win?.addEventListener('popstate',followLocation);
 win?.addEventListener('aift:lineage-select',()=>activate(0));
 // Preserve ordinary anchor links into workspaces hidden by progressive disclosure.
 doc.addEventListener('click',event=>{
  const anchor=event.target?.closest?.('a[href^="#"]');
  if(!anchor)return;
  const href=anchor.getAttribute('href');
  const next=resolveExplorerIndex(doc,href,sections);
  if(next!==active)activate(next);
 });
 followLocation();
 return true;
}
if(typeof document!=='undefined')mountExplorerNavigation(document);
