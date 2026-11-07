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
 const summary=doc.createElement('p');summary.id='explorer-navigation-status';summary.setAttribute('role','status');
 const win=doc.defaultView;
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
 nav.append(intro,tabs,summary);sections[0].before(nav);
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
