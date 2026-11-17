/* Outcome-first cinematic portal: every destination comes from the published lineage contract. */
(()=>{'use strict';
const nodes=window.AIFT_LINEAGE_NODES,world=document.querySelector('.world');
if(!world||!Array.isArray(nodes))return;
const byId=new Map(nodes.map(n=>[n.id,n]));
const outcomes=nodes.filter(n=>n.kind==='fruit'&&n.url&&!/^https?:\/\/github\.com\/AIFreedomTrustFederation\/[^/]+\/?$/i.test(n.url));
const safe=url=>{try{const u=new URL(url,location.href);return (u.protocol==='https:'||u.origin===location.origin)?u.href:null}catch{return null}};
const pathTo=node=>{const seen=new Set(),path=[];let current=node;while(current&&!seen.has(current.id)){seen.add(current.id);path.unshift(current);current=byId.get(current.parent)}return path};
const open=document.createElement('button');open.type='button';open.className='outcome-open';open.textContent='Explore real-world destinations';open.setAttribute('aria-haspopup','dialog');
const panel=document.createElement('section');panel.className='outcome-portal';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Verified public experiences and their source lineage');
const head=document.createElement('div');head.className='outcome-head';
const title=document.createElement('h2');title.textContent='Where the Tree bears fruit';
const close=document.createElement('button');close.type='button';close.textContent='Close';close.className='outcome-close';
head.append(title,close);
const intro=document.createElement('p');intro.textContent='Only published public destinations appear here. Follow each experience backward through documented branches to its source roots. Curated lineage is not a live deployment claim.';
const cards=document.createElement('div');cards.className='outcome-cards';
const detail=document.createElement('div');detail.className='outcome-detail';detail.setAttribute('aria-live','polite');
const empty=document.createElement('p');empty.textContent='No published outcome is available. No fruit will be invented.';
panel.append(head,intro,cards,detail);world.append(open,panel);
let lastFocus=null;
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
for(const node of outcomes){if(!safe(node.url))continue;
 const button=document.createElement('button');button.type='button';button.className='outcome-card';button.setAttribute('aria-pressed','false');
 const symbol=document.createElement('span');symbol.setAttribute('aria-hidden','true');symbol.textContent='✦';
 const label=document.createElement('strong');label.textContent=node.label;
 const sub=document.createElement('small');sub.textContent='Published experience · trace its roots';
 button.append(symbol,label,sub);button.addEventListener('click',()=>select(node,button));cards.append(button);
}
if(!cards.children.length)cards.append(empty);
function hide(){panel.hidden=true;open.setAttribute('aria-expanded','false');(lastFocus||open).focus()}
function show(){lastFocus=document.activeElement;panel.hidden=false;open.setAttribute('aria-expanded','true');const first=cards.querySelector('button');if(first){first.focus();first.click()}else close.focus()}
open.setAttribute('aria-expanded','false');open.addEventListener('click',show);close.addEventListener('click',hide);
panel.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();hide();return}
 if(e.key!=='Tab')return;
 const focusable=[...panel.querySelectorAll('button:not([disabled]),a[href]')].filter(el=>el.getClientRects().length);
 if(!focusable.length)return;
 const first=focusable[0],last=focusable[focusable.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
})();