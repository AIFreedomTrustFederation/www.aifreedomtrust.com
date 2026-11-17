/* Outcome-first cinematic portal: every destination comes from the published lineage contract. */
(()=>{'use strict';
const nodes=window.AIFT_LINEAGE_NODES,world=document.querySelector('.world');
if(!world||!Array.isArray(nodes))return;
const byId=new Map(nodes.map(n=>[n.id,n]));
const outcomes=nodes.filter(n=>n.kind==='fruit'&&n.url&&!/^https?:\/\/github\.com\/AIFreedomTrustFederation\/[^/]+\/?$/i.test(n.url));
const safe=url=>{try{const u=new URL(url,location.href);return (u.protocol==='https:'||u.origin===location.origin)?u.href:null}catch{return null}};
const pathTo=node=>{const seen=new Set(),path=[];let current=node;while(current&&!seen.has(current.id)){seen.add(current.id);path.unshift(current);current=byId.get(current.parent)}return path};
// Only show a fruit when its complete, acyclic published ancestry reaches a source root.
const hasRootLineage=node=>{
 const seen=new Set();let current=node;
 while(current&&!seen.has(current.id)){
  seen.add(current.id);
  if(current.kind==='root')return true;
  current=byId.get(current.parent);
 }
 return false;
};

const eligible=outcomes.filter(n=>safe(n.url)&&hasRootLineage(n));
const open=document.createElement('button');open.type='button';open.className='outcome-open';open.textContent='Explore real-world destinations';open.setAttribute('aria-haspopup','dialog');
const panel=document.createElement('section');panel.className='outcome-portal';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Verified public experiences and their source lineage');
const head=document.createElement('div');head.className='outcome-head';
const title=document.createElement('h2');title.textContent='Where the Tree bears fruit';
const close=document.createElement('button');close.type='button';close.textContent='Close';close.className='outcome-close';
head.append(title,close);
const intro=document.createElement('p');intro.textContent='Only published public destinations appear here. Follow each experience backward through documented branches to its source roots. Curated lineage is not a live deployment claim.';
const searchLabel=document.createElement('label');searchLabel.className='outcome-search-label';searchLabel.textContent='Find a published experience';
const search=document.createElement('input');search.type='search';search.className='outcome-search';search.placeholder='Search experiences and documented ancestry';search.setAttribute('aria-label','Search published experiences');searchLabel.append(search);
const resultCount=document.createElement('p');resultCount.className='outcome-results';resultCount.setAttribute('role','status');
const cards=document.createElement('div');cards.className='outcome-cards';
const detail=document.createElement('div');detail.className='outcome-detail';detail.setAttribute('aria-live','polite');
const empty=document.createElement('p');empty.textContent='No published outcome is available. No fruit will be invented.';
panel.append(head,intro,searchLabel,resultCount,cards,detail);world.append(open);document.body.append(panel);
let lastFocus=null,previousOverflow='';
const focusable=()=>[...panel.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled]),select:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')].filter(el=>!el.closest('[hidden]')&&el.getClientRects().length);
const setBackgroundInert=value=>{for(const child of document.body.children){if(child.contains(panel))continue;if(value){child.dataset.outcomeWasInert=String(child.inert);child.inert=true}else if(child.hasAttribute('data-outcome-was-inert')){child.inert=child.dataset.outcomeWasInert==='true';delete child.dataset.outcomeWasInert}}};
function select(node,button){
 for(const b of cards.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b===button));
 detail.replaceChildren();
 const heading=document.createElement('h3');heading.textContent=node.label;
 const desc=document.createElement('p');desc.textContent=node.desc||'Published public experience';
 const trail=document.createElement('ol');trail.className='outcome-lineage';
 for(const ancestor of pathTo(node)){
  const item=document.createElement('li'),type=document.createElement('small'),name=document.createElement('strong');
  type.textContent=ancestor.kind;name.textContent=ancestor.label;item.append(type,name);
  if(ancestor.kind==='root'){const a=document.createElement('a'),href=safe(ancestor.url);if(href){a.href=href;a.textContent='Inspect source';a.target='_blank';a.rel='noopener noreferrer';item.append(a)}}
  trail.append(item);
 }
 const link=document.createElement('a');link.className='outcome-destination';link.textContent='Enter '+node.label;
 const href=safe(node.url);if(href){link.href=href;if(new URL(href).origin!==location.origin){link.target='_blank';link.rel='noopener noreferrer'}}else{link.removeAttribute('href');link.textContent='Destination unavailable'};
 detail.append(heading,desc,trail,link);
}
for(const node of eligible){
 const button=document.createElement('button');button.type='button';button.className='outcome-card';button.dataset.sourceId=node.id;button.setAttribute('aria-pressed','false');
 const symbol=document.createElement('span');symbol.setAttribute('aria-hidden','true');symbol.textContent='✦';
 const label=document.createElement('strong');label.textContent=node.label;
 const sub=document.createElement('small');sub.textContent='Published experience · trace its roots';
 button.append(symbol,label,sub);button.addEventListener('click',()=>select(node,button));cards.append(button);
}
if(!cards.children.length)cards.append(empty);
function filterOutcomes(){
 const q=search.value.trim().toLocaleLowerCase();let count=0;
 for(const button of cards.querySelectorAll('button')){
  const node=byId.get(button.dataset.sourceId);
  const haystack=[node?.label,node?.desc,...(node?pathTo(node).map(n=>n.label):[])].filter(Boolean).join(' ').toLocaleLowerCase();
  button.hidden=!haystack.includes(q);if(!button.hidden)count++;
 }
 resultCount.textContent=count+' documented experience'+(count===1?'':'s')+' found';
 if(!count){detail.replaceChildren();detail.textContent='No matching published outcome. Try another search; no fruit will be invented.';}
 else if(!cards.querySelector('button[aria-pressed="true"]:not([hidden])'))cards.querySelector('button:not([hidden])')?.click();
}
search.addEventListener('input',filterOutcomes);
filterOutcomes();
function hide(){panel.hidden=true;document.documentElement.style.overflow=previousOverflow;setBackgroundInert(false);open.setAttribute('aria-expanded','false');(lastFocus?.isConnected?lastFocus:open).focus()}
function show(){lastFocus=document.activeElement;previousOverflow=document.documentElement.style.overflow;search.value='';filterOutcomes();panel.hidden=false;document.documentElement.style.overflow='hidden';setBackgroundInert(true);open.setAttribute('aria-expanded','true');search.focus()}
open.setAttribute('aria-expanded','false');open.addEventListener('click',show);close.addEventListener('click',hide);
panel.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();hide();return}
 if(e.key!=='Tab')return;
 const controls=focusable();
 if(!controls.length)return;
 const first=controls[0],last=controls[controls.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
})();