/* Living Universe 3.0: source-backed cinematic passage; narrative light is not evidence. */
(()=>{'use strict';
const world=document.querySelector('.world'),tree=world?.querySelector('.tree'),records=window.AIFT_LINEAGE_NODES;
if(!world||!tree||!Array.isArray(records))return;
const stages=['root','trunk','branch','leaf','flower','fruit'];
const names=['Roots','Shared trunk','Systems','Capabilities','Emergence','Outcomes'];
const palette=['#fa7582','#f5d18a','#64e6b4','#6cbcff','#b392fa','#ffb97b'];
const valid=records.filter(n=>n&&stages.includes(n.kind)&&typeof n.id==='string');
const safe=url=>{try{const u=new URL(url,location.href);return ['http:','https:'].includes(u.protocol)&&!url.startsWith('//')?u.href:null}catch{return null}};
const wrap=document.createElement('section');wrap.className='world-passage';wrap.setAttribute('aria-label','Explore the documented Tree through six growth stages');
const heading=document.createElement('h2');heading.className='world-passage-title';heading.textContent='A living passage';
const subtitle=document.createElement('p');subtitle.className='world-passage-subtitle';subtitle.textContent='Follow published sources from roots toward real outcomes.';
const rail=document.createElement('div');rail.className='world-passage-rail';rail.setAttribute('role','group');rail.setAttribute('aria-label','Choose a growth stage');
const panel=document.createElement('div');panel.className='world-passage-panel';panel.setAttribute('aria-live','polite');
const details=document.createElement('p');details.className='world-passage-details';
const sources=document.createElement('div');sources.className='world-passage-sources';
const explore=document.createElement('a');explore.className='world-passage-explore';explore.href='#evidence-world';explore.textContent='Explore the source constellation';
panel.append(details,sources,explore);
const buttons=stages.map((stage,i)=>{const b=document.createElement('button');b.type='button';b.className='world-passage-step';b.dataset.passageStage=stage;b.setAttribute('aria-pressed','false');b.style.setProperty('--passage-color',palette[i]);b.textContent=String(i+1).padStart(2,'0')+' · '+names[i];b.addEventListener('click',()=>select(i));rail.append(b);return b});
wrap.append(heading,subtitle,rail,panel);world.append(wrap);
let current=0;
function select(i,focus=false){
 current=(i+stages.length)%stages.length;const stage=stages[current],found=valid.filter(n=>n.kind===stage);
 buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===current)));
 world.style.setProperty('--passage-glow',palette[current]);world.dataset.passageStage=stage;
 details.textContent=found.length?found.length+' published '+names[current].toLowerCase()+' record'+(found.length===1?'':'s')+'. Select a source to inspect its published destination.':'No published '+names[current].toLowerCase()+' records. This stage has no asserted outcome.';
 sources.replaceChildren();
 for(const n of found){const href=safe(n.url);const a=document.createElement(href?'a':'span');a.className='world-passage-source';a.textContent=n.label;if(href){a.href=href;if(new URL(href).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}}else{a.title='No safe published destination'}sources.append(a)}
 const canonical=document.querySelector('.stages [data-stage="'+stage+'"]');
 if(canonical){canonical.click()} // reuse the published stage description, not a competing data model
 if(focus)buttons[current].focus();
}
rail.addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();select(e.key==='Home'?0:e.key==='End'?stages.length-1:current+(e.key==='ArrowRight'?1:-1),true)});
select(0);
})();
