/** One accessible navigation shell for existing evidence explorers; never alters source data. */
export const EXPLORERS=Object.freeze([
 ['scene-heading','Constellation','Spatial exploration and accessible entity index'],
 ['voyage-heading','Voyage','Six biological growth chapters'],
 ['cockpit-heading','Evidence','Curated provenance and evidence gaps'],
 ['atlas-heading','Atlas','Evidence-backed chapter atlas'],
 ['lineage-paths-heading','Lineage','Attested source-to-outcome paths'],
 ['journey-heading','Missions','Documented milestones, not earned achievements'],
 ['comparison-heading','Compare','Two-entity source comparison']
]);
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
 const summary=doc.createElement('p');summary.id='explorer-navigation-status';summary.setAttribute('role','status');
 const buttons=EXPLORERS.map(([id,label,description],i)=>{
  const button=doc.createElement('button');button.type='button';button.textContent=label;
  button.setAttribute('aria-controls',sections[i].id||id);button.title=description;
  button.addEventListener('click',()=>activate(i,true));tabs.append(button);return button;
 });
 function activate(index,updateHash=false){
  sections.forEach((section,i)=>{section.hidden=i!==index;buttons[i].setAttribute('aria-current',String(i===index))});
  summary.textContent=EXPLORERS[index][2]+' · Curated evidence, not live operational status.';
  if(updateHash)doc.defaultView?.history?.replaceState(null,'','#'+EXPLORERS[index][0]);
 }
 nav.append(intro,tabs,summary);first.closest('section').before(nav);
 const resolve=()=>{const hash=decodeURIComponent(doc.defaultView?.location?.hash?.slice(1)||'');
  const index=EXPLORERS.findIndex(([id])=>id===hash);
  return index>=0?index:0;
 };
 doc.defaultView?.addEventListener('hashchange',()=>activate(resolve()));
 doc.defaultView?.addEventListener('aift:lineage-select',()=>activate(0));
 activate(resolve());
 return true;
}
if(typeof document!=='undefined')mountExplorerNavigation(document);
