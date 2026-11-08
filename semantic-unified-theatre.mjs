/**
 * Living Universe theatre: additive, accessible spatial/workspace navigation.
 * Preserves all original sections and their scripts. No telemetry or new data requests.
 */
export const THEATRE = Object.freeze([
 ['canopy-heading','Tree','Source-to-outcome biological growth'],
 ['scene-heading','Constellation','Spatial federation explorer'],
 ['voyage-heading','Voyage','Six chapters of emergence'],
 ['cockpit-heading','Evidence','Curated evidence cockpit'],
 ['atlas-heading','Atlas','Federation expedition atlas'],
 ['lineage-paths-heading','Lineage','Attested contribution trails'],
 ['journey-heading','Missions','Evidence-backed expeditions'],
 ['comparison-heading','Compare','Dual-lineage comparison']
]);
export function mountTheatre(doc){
 const main=doc.querySelector('main');if(!main)return false;
 const entries=THEATRE.map(([id,label,description])=>({id,label,description,heading:doc.getElementById(id)})).filter(x=>x.heading);
 if(entries.length<2)return false;
 const nav=doc.createElement('nav');nav.id='living-theatre';nav.className='living-theatre';nav.setAttribute('aria-label','Living Universe workspace navigator');
 const heading=doc.createElement('h2');heading.textContent='Explore the Living Universe';nav.append(heading);
 const description=doc.createElement('p');description.textContent='One federation, connected workspaces. Choose a chapter to visit its original content. All sections and published links remain available.';nav.append(description);
 const search=doc.createElement('input');search.type='search';search.setAttribute('aria-label','Find a Living Universe workspace');search.placeholder='Find tree, evidence, missions or lineage';
 const cards=doc.createElement('div');cards.className='living-theatre-grid';
 const live=doc.createElement('p');live.setAttribute('role','status');live.className='living-theatre-status';
 nav.append(search,cards,live);
 const active=new Set();
 const locate=(entry)=>entry.heading.closest('section')||entry.heading;
 const show=(entry,focus=true)=>{
   for(const card of cards.querySelectorAll('button[data-workspace]'))card.setAttribute('aria-current',String(card.dataset.workspace===entry.id));
   const target=locate(entry);target.classList.add('theatre-visited');active.add(entry.id);
   if(focus){entry.heading.setAttribute('tabindex','-1');entry.heading.focus({preventScroll:true});}
   target.scrollIntoView?.({block:'start',behavior:'auto'});
   if(doc.defaultView?.history?.replaceState)doc.defaultView.history.replaceState(null,'','#'+entry.id);
   live.textContent='Exploring '+entry.label+'. Original content and links remain available.';
 };
 const render=()=>{
  const query=search.value.trim().toLocaleLowerCase();cards.replaceChildren();
  const matches=entries.filter(x=>(x.label+' '+x.description).toLocaleLowerCase().includes(query));
  for(const entry of matches){
   const button=doc.createElement('button');button.type='button';button.dataset.workspace=entry.id;button.className='living-theatre-card';
   button.setAttribute('aria-current',String(doc.defaultView?.location?.hash==='#'+entry.id));
   const title=doc.createElement('strong');title.textContent=entry.label;
   const detail=doc.createElement('span');detail.textContent=entry.description;
   button.append(title,detail);button.addEventListener('click',()=>show(entry));cards.append(button);
  }
  live.textContent=matches.length+' of '+entries.length+' existing workspaces. No live system status inferred.';
 };
 search.addEventListener('input',render);render();
 const initial=entries.find(x=>'#'+x.id===doc.defaultView?.location?.hash);
 if(initial)for(const button of cards.querySelectorAll('button[data-workspace]'))button.setAttribute('aria-current',String(button.dataset.workspace===initial.id));
 const first=main.querySelector('.canopy-shell')||main.querySelector('section');main.insertBefore(nav,first);
 return true;
}
if(typeof document!=='undefined')mountTheatre(document);
