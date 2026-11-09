import {projectWorld} from './world-projection.mjs';
import {evidenceQuests} from './world-evidence-quests.mjs';

/** Read-only expedition board. An attested lineage is never treated as live readiness. */
export function questBoardModel(world){
 return evidenceQuests(world).map(quest=>Object.freeze({
  ...quest,
  evidenceCount:quest.evidence.length,
  rootCount:quest.roots.length,
  nextStep:quest.state==='evidence-attested'
   ?'Inspect the source-backed lineage; independently verify release and runtime readiness.'
   :'Document a real repository-to-outcome contribution path and its source evidence.'
 }));
}
export function mountQuestBoard(doc){
 const host=doc.getElementById('evidence-quest-board');
 if(!host)return false;
 const make=(tag,content)=>{const node=doc.createElement(tag);if(content!==undefined)node.textContent=content;return node};
 const status=make('p','Loading curated outcome evidence…');status.setAttribute('role','status');
 const controls=make('div');controls.className='quest-board-controls';
 const searchLabel=make('label','Search documented outcomes');
 const search=make('input');search.type='search';search.placeholder='Search outcome or evidence';searchLabel.append(search);
 const filterLabel=make('label','Evidence state');
 const filter=make('select');
 for(const [value,label] of [['','All recorded outcomes'],['evidence-attested','Attested source lineage'],['evidence-needed','Contribution evidence needed']]){
  const option=make('option',label);option.value=value;filter.append(option);
 }
 filterLabel.append(filter);controls.append(searchLabel,filterLabel);
 const summary=make('p');summary.className='quest-board-summary';
 const results=make('div');results.className='quest-board-results';
 const help=make('p','This expedition is a source-evidence checklist, not personal XP, CI health, production readiness or an earned achievement.');
 host.replaceChildren(status,controls,summary,results,help);
 let quests=[];
 function render(){
  results.replaceChildren();
  const needle=search.value.trim().toLocaleLowerCase();
  const matches=quests.filter(q=>(!filter.value||q.state===filter.value)&&
   (!needle||(q.label+' '+q.summary+' '+q.evidence.join(' ')).toLocaleLowerCase().includes(needle)));
  summary.textContent=matches.length+' of '+quests.length+' documented outcomes shown · '+quests.filter(q=>q.state==='evidence-attested').length+' with source-backed lineage; not release readiness.';
  if(!matches.length){results.append(make('p','No recorded outcomes match this filter. No evidence or progress has been inferred.'));return}
  for(const quest of matches){
   const card=make('article');card.className='quest-board-card';
   card.append(make('h4',quest.label),make('p',quest.summary));
   const state=make('p',quest.state==='evidence-attested'?'Source lineage attested':'Contribution evidence needed');state.className='quest-board-state';
   card.append(state,make('p',quest.nextStep));
   const stats=make('p',quest.rootCount+' contributing roots · '+quest.evidenceCount+' evidence references');card.append(stats);
   const links=make('div');links.className='quest-board-links';
   const safeLink=(url,label)=>{
    if(typeof url!=='string'||!/^https:\/\/[^\s/]+/.test(url))return;
    const a=make('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);
   };
   if(quest.state==='evidence-attested')safeLink(quest.url,'Open documented outcome');
   for(const root of quest.roots)safeLink(root.url,'Source root: '+root.label);
   for(const [i,url] of quest.evidence.entries())safeLink(url,'Evidence '+(i+1));
   card.append(links);
   const inspect=make('button','Inspect in constellation');inspect.type='button';
   inspect.addEventListener('click',()=>{
    doc.defaultView?.dispatchEvent(new CustomEvent('aift:lineage-select',{detail:{id:quest.id}}));
    doc.getElementById('scene-heading')?.scrollIntoView?.({block:'start'});
   });
   card.append(inspect);results.append(card);
  }
 }
 search.addEventListener('input',render);filter.addEventListener('change',render);
 fetch('data/living-universe.json').then(response=>{
  if(!response.ok)throw Error('manifest HTTP '+response.status);
  return response.json();
 }).then(data=>{quests=questBoardModel(projectWorld(data));status.textContent='Curated evidence loaded; not live runtime status.';render()})
 .catch(error=>{status.textContent='Outcome evidence unavailable: '+error.message;controls.hidden=true;summary.textContent='No achievements or readiness can be inferred.';});
 return true;
}
if(typeof document!=='undefined')mountQuestBoard(document);
