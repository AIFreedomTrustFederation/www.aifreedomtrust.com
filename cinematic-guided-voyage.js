/* Guided cinematic voyage. All destinations and lineage are read from the published contract. */
(()=>{'use strict';
const world=document.querySelector('.world'),scene=world?.querySelector('.tree'),records=window.AIFT_LINEAGE_NODES;
if(!world||!scene||!Array.isArray(records))return;
const stages=['root','trunk','branch','leaf','flower','fruit'];
const byId=new Map(records.filter(n=>n&&typeof n.id==='string'&&stages.includes(n.kind)).map(n=>[n.id,n]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const container=document.createElement('section');container.className='living-guided-voyage';container.setAttribute('aria-label','Guided journey through documented growth');
const heading=document.createElement('h2');heading.textContent='Journey through the living Tree';
const intro=document.createElement('p');intro.textContent='Six chapters, one source-backed world. Explore at your own pace; this journey does not claim achievements or live readiness.';
const progress=document.createElement('p');progress.className='living-guided-progress';progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');
const actions=document.createElement('div');actions.className='living-guided-actions';
const prev=document.createElement('button'),next=document.createElement('button'),reset=document.createElement('button'),toggle=document.createElement('button');
for(const b of [prev,next,reset,toggle])b.type='button';
prev.textContent='← Previous';next.textContent='Next chapter →';reset.textContent='Return to roots';toggle.textContent='Play journey';
actions.append(prev,next,reset,toggle);
const route=document.createElement('nav');route.className='living-guided-route';route.setAttribute('aria-label','Journey chapter map');
const routeButtons=stages.map((kind,i)=>{const b=document.createElement('button');b.type='button';b.dataset.chapter=kind;b.textContent=String(i+1).padStart(2,'0')+' · '+({root:'Roots',trunk:'Trunk',branch:'Systems',leaf:'Capabilities',flower:'Emergence',fruit:'Outcomes'}[kind]);b.addEventListener('click',()=>{stop();render(i)});route.append(b);return b});
const discovery=document.createElement('div');discovery.className='living-guided-discovery';
const searchLabel=document.createElement('label');searchLabel.textContent='Find a documented source ';
const searchInput=document.createElement('input');searchInput.type='search';searchInput.placeholder='Search the published lineage';searchInput.setAttribute('aria-label','Search published lineage');searchLabel.append(searchInput);
const searchResults=document.createElement('div');searchResults.className='living-guided-results';searchResults.setAttribute('role','region');searchResults.setAttribute('aria-label','Source search results');
const pathStatus=document.createElement('p');pathStatus.className='living-guided-path';pathStatus.setAttribute('role','status');
const pathNav=document.createElement('nav');pathNav.className='living-guided-path-nav';pathNav.setAttribute('aria-label','Source ancestry navigation');
discovery.append(searchLabel,searchResults,pathStatus,pathNav);
let activeSource=null;
function showPath(id){
 const source=byId.get(id);if(!source)return;
 activeSource=id;pathNav.replaceChildren();const seen=new Set();const chain=[];let cursor=source,problem='';
 while(cursor){if(seen.has(cursor.id)){problem='Circular lineage detected';break}seen.add(cursor.id);chain.unshift(cursor);if(!cursor.parent)break;cursor=byId.get(cursor.parent);if(!cursor)problem='Unresolved parent record'}
 pathStatus.textContent='Documented path: '+chain.map(n=>n.label).join(' → ')+(problem?' · '+problem:'');
 for(const n of chain){const b=document.createElement('button');b.type='button';b.textContent=n.kind+' · '+n.label;b.setAttribute('aria-current',String(n.id===id));b.addEventListener('click',()=>{stop();render(stages.indexOf(n.kind));showPath(n.id)});pathNav.append(b)}
}
function showSearch(){
 searchResults.replaceChildren();const term=searchInput.value.trim().toLocaleLowerCase();if(!term)return;
 const matches=[...byId.values()].filter(n=>[n.label,n.desc,n.kind].join(' ').toLocaleLowerCase().includes(term)).slice(0,30);
 if(!matches.length){const p=document.createElement('p');p.textContent='No published source matches. No relationship is inferred.';searchResults.append(p);return}
 for(const n of matches){const b=document.createElement('button');b.type='button';b.textContent=n.label+' · '+n.kind;b.addEventListener('click',()=>{stop();render(stages.indexOf(n.kind));showPath(n.id);discovery.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'nearest'})});searchResults.append(b)}
}
searchInput.addEventListener('input',showSearch);
const entries=document.createElement('div');entries.className='living-guided-evidence';entries.setAttribute('aria-label','Documented sources in current chapter');
container.append(heading,intro,progress,route,actions,discovery,entries);
world.after(container);
let current=0,playing=false,timer=null;
function stop(){playing=false;if(timer!==null)clearTimeout(timer);timer=null;toggle.textContent='Play journey';toggle.setAttribute('aria-pressed','false')}
function safeUrl(raw){if(typeof raw!=='string'||!raw.trim()||raw.startsWith('//'))return null;try{const u=new URL(raw,location.href);return ['http:','https:'].includes(u.protocol)?u:null}catch{return null}}
function render(index){
 current=Math.max(0,Math.min(stages.length-1,index));const stage=stages[current],matches=[...byId.values()].filter(n=>n.kind===stage);
 world.dataset.guidedStage=stage;
 routeButtons.forEach((b,i)=>{b.setAttribute('aria-current',i===current?'step':'false');b.setAttribute('aria-label','Chapter '+(i+1)+' of six: '+b.textContent)});
 progress.textContent='Chapter '+(current+1)+' of 6 · '+stage.toUpperCase()+' · '+matches.length+' published record'+(matches.length===1?'':'s');
 entries.replaceChildren();
 if(!matches.length){const empty=document.createElement('p');empty.textContent='No documented records at this stage. No outcome is inferred.';entries.append(empty)}
 for(const n of matches){
  const item=document.createElement('article');item.className='living-guided-item';
  const name=document.createElement('h3');name.textContent=n.label;
  const detail=document.createElement('p');detail.textContent=n.desc||'Published lineage record';
  const lineage=document.createElement('small');const seen=new Set([n.id]);let cursor=n;const ancestors=[];
  while(cursor.parent){if(seen.has(cursor.parent)){ancestors.push('Cycle detected');break}seen.add(cursor.parent);const parent=byId.get(cursor.parent);if(!parent){ancestors.push('Unresolved parent');break}ancestors.unshift(parent.label);cursor=parent}
  lineage.textContent='Lineage: '+(ancestors.length?ancestors.join(' → ')+' → ':'')+n.label;
  item.append(name,detail,lineage);const trace=document.createElement('button');trace.type='button';trace.textContent='Trace documented ancestry';trace.addEventListener('click',()=>{stop();showPath(n.id);discovery.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'nearest'})});item.append(trace);
  const focus=document.createElement('button');focus.type='button';focus.className='living-guided-focus';focus.textContent='Explore in the source constellation';focus.addEventListener('click',()=>{stop();const field=document.getElementById('evidence-search');const list=document.getElementById('evidence-list');if(!field||!list)return;const selector=[...list.querySelectorAll('button')].find(b=>b.textContent===n.label+' · '+n.kind);if(selector){selector.click()}else{field.value=n.label;field.dispatchEvent(new Event('input',{bubbles:true}));}document.getElementById('evidence-world')?.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});});item.append(focus);
  const url=safeUrl(n.url);
  if(url){const link=document.createElement('a');link.href=url.href;link.textContent=n.kind==='fruit'?'Open documented experience':'Inspect published source';if(url.origin!==location.origin){link.target='_blank';link.rel='noopener noreferrer'}item.append(link)}
  entries.append(item);
 }
 const canonical=document.querySelector('.stages [data-stage="'+stage+'"]');if(canonical)canonical.click();
 const passage=document.querySelector('.world-passage-step[data-passage-stage="'+stage+'"]');if(passage)passage.click();
 prev.disabled=current===0;next.disabled=current===stages.length-1;
}
function schedule(){if(!playing)return;if(current===stages.length-1){stop();return}timer=setTimeout(()=>{render(current+1);schedule()},4600)}
prev.addEventListener('click',()=>{stop();render(current-1)});
next.addEventListener('click',()=>{stop();render(current+1)});
reset.addEventListener('click',()=>{stop();render(0);container.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'})});
toggle.addEventListener('click',()=>{if(playing){stop();return}if(reduced.matches){progress.textContent='Automatic movement is disabled by your reduced-motion preference. Use Next chapter.';return}if(current===5)render(0);playing=true;toggle.textContent='Pause journey';toggle.setAttribute('aria-pressed','true');schedule()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
reduced.addEventListener?.('change',()=>{if(reduced.matches)stop()});
render(0);
})();