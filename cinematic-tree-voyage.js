/* Living Universe 3.0: evidence-bound cinematic voyage. No external dependencies. */
(()=>{'use strict';
const host=document.querySelector('.world'),svg=host?.querySelector('svg.tree');
const records=window.AIFT_LINEAGE_NODES;
if(!host||!svg||!Array.isArray(records))return;
const validKinds=['root','trunk','branch','leaf','flower','fruit'];
const byId=new Map(records.filter(n=>n&&typeof n.id==='string'&&validKinds.includes(n.kind)).map(n=>[n.id,n]));
const stageNames={root:'Source roots',trunk:'Shared federation',branch:'Systems',leaf:'Capabilities',flower:'Emergence',fruit:'Verified outcomes'};
const ordered=validKinds.flatMap(k=>[...byId.values()].filter(n=>n.kind===k));
const isSafe=url=>{try{if(typeof url!=='string'||!url.trim())return null;const u=new URL(url,location.href);if(u.protocol!=='https:'&&u.origin!==location.origin)return null;if(u.hostname.toLowerCase()==='github.com'&&/^\/[\w.-]+\/[\w.-]+\/?$/.test(u.pathname))return null;return u.href}catch{return null}};
const ancestry=n=>{const path=[],seen=new Set();let cur=n;while(cur&&byId.has(cur.id)&&!seen.has(cur.id)){seen.add(cur.id);path.unshift(cur);cur=byId.get(cur.parentId||cur.parent_id||cur.parent)}return {path,complete:!cur&&path[0]?.kind==='root',cycle:!!cur}};
const eligible=n=>n.kind!=='fruit'||(!!isSafe(n.url)&&ancestry(n).complete);
const entries=ordered.filter(eligible);
const css=document.createElement('style');css.textContent=`
.voyage-dock{position:absolute;z-index:7;right:clamp(12px,3vw,42px);top:18%;width:min(350px,42vw);padding:1rem;border:1px solid #f7d18a55;border-radius:22px;background:linear-gradient(135deg,#061325e8,#112a38e8);box-shadow:0 25px 70px #0009;backdrop-filter:blur(18px);color:#f7f4e9}
.voyage-dock h2{font:1.5rem Georgia,serif;margin:.2rem 0;color:#f7d18a}.voyage-dock p{font-size:.86rem;line-height:1.4;margin:.5rem 0}
.voyage-dock input{width:100%;min-height:44px;border:1px solid #90c6d8;background:#091827;color:white;border-radius:10px;padding:.7rem}
.voyage-dock button,.voyage-dock a{min-height:44px;border:1px solid #80b6c4;color:#fff;background:#123448;border-radius:12px;padding:.6rem;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
.voyage-dock button:focus-visible,.voyage-dock a:focus-visible,.voyage-dock input:focus-visible{outline:3px solid #f7d18a;outline-offset:2px}
.voyage-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:.6rem 0}.voyage-steps button{font-size:.7rem;padding:.3rem;min-width:0}
.voyage-steps button[aria-pressed=true]{background:linear-gradient(100deg,#913e5a,#16735d,#285f9b);border-color:#f7d18a}
.voyage-records{max-height:145px;overflow:auto;display:grid;gap:5px}.voyage-records button{text-align:left;justify-content:flex-start;font-size:.8rem}
.voyage-path{font-size:.8rem;max-height:95px;overflow:auto}.voyage-actions{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.6rem}
.voyage-dock[hidden]{display:none}.voyage-toggle{position:absolute;z-index:8;right:1rem;bottom:1rem;border:1px solid #f7d18a;background:#102b42;color:white;padding:.8rem;border-radius:40px;min-height:44px;cursor:pointer}
@media(max-width:800px){.voyage-dock{top:auto;bottom:3.5rem;right:.65rem;left:.65rem;width:auto;max-height:48svh;overflow:auto;padding:.7rem}.voyage-dock h2{font-size:1.15rem}.voyage-records{max-height:80px}.voyage-steps{grid-template-columns:repeat(6,minmax(0,1fr))}.voyage-steps button{font-size:.62rem}.voyage-toggle{bottom:.5rem}}
@media(prefers-reduced-motion:reduce){.voyage-dock,.voyage-dock *{animation:none!important;transition:none!important}}
`;document.head.append(css);
const toggle=document.createElement('button');toggle.className='voyage-toggle';toggle.type='button';toggle.textContent='Explore the Tree';toggle.setAttribute('aria-expanded','false');host.append(toggle);
const dock=document.createElement('section');dock.className='voyage-dock';dock.hidden=true;dock.setAttribute('aria-label','Living Tree exploration controls');
const title=document.createElement('h2');title.textContent='Follow the living lineage';
const summary=document.createElement('p');summary.textContent='Choose a growth stage, then discover its documented sources.';
const search=document.createElement('input');search.type='search';search.placeholder='Search documented sources';search.setAttribute('aria-label','Search documented Tree records');
const steps=document.createElement('div');steps.className='voyage-steps';steps.setAttribute('role','group');steps.setAttribute('aria-label','Growth stages');
const results=document.createElement('div');results.className='voyage-records';results.setAttribute('role','group');results.setAttribute('aria-label','Published records');
const path=document.createElement('div');path.className='voyage-path';path.setAttribute('aria-live','polite');
const actions=document.createElement('div');actions.className='voyage-actions';
const back=document.createElement('button');back.type='button';back.textContent='Back';
const next=document.createElement('button');next.type='button';next.textContent='Next stage';
const close=document.createElement('button');close.type='button';close.textContent='Close';
const destination=document.createElement('a');destination.textContent='Open experience';destination.hidden=true;destination.rel='noopener noreferrer';
actions.append(back,next,destination,close);dock.append(title,summary,search,steps,results,path,actions);host.append(dock);
let stage='root',selected=null,history=[];
function open(value){dock.hidden=!value;toggle.setAttribute('aria-expanded',String(value));toggle.textContent=value?'Hide exploration':'Explore the Tree';if(value)search.focus();else toggle.focus()}
toggle.addEventListener('click',()=>open(dock.hidden));close.addEventListener('click',()=>open(false));
function select(n,recordHistory=true){if(!n)return;if(recordHistory&&selected)history.push(selected.id);selected=n;stage=n.kind;title.textContent=n.label||stageNames[stage];const a=ancestry(n);path.textContent=a.path.map(x=>(x.label||x.id)+' ('+x.kind+')').join(' → ')+(a.complete?'':' · Ancestry incomplete');const url=n.kind==='fruit'&&a.complete?isSafe(n.url):null;destination.hidden=!url;if(url){destination.href=url;destination.target=new URL(url).origin!==location.origin?'_blank':'_self'}else destination.removeAttribute('href');render();const existing=svg.querySelector('[data-node-id="'+CSS.escape(n.id)+'"]');if(existing&&typeof existing.focus==='function'&&dock.hidden)existing.focus({preventScroll:true})}
function render(){steps.replaceChildren();for(const kind of validKinds){const b=document.createElement('button');b.type='button';b.textContent=stageNames[kind].split(' ')[0];b.setAttribute('aria-pressed',String(kind===stage));b.title=stageNames[kind];b.addEventListener('click',()=>{stage=kind;selected=null;title.textContent=stageNames[kind];path.textContent='Choose a published record to inspect its ancestry.';destination.hidden=true;destination.removeAttribute('href');render()});steps.append(b)}
results.replaceChildren();const q=search.value.trim().toLowerCase();const found=entries.filter(n=>n.kind===stage&&(!q||[n.label,n.id,n.description].filter(Boolean).join(' ').toLowerCase().includes(q)));for(const n of found.slice(0,35)){const b=document.createElement('button');b.type='button';b.textContent=n.label||n.id;b.setAttribute('aria-pressed',String(selected?.id===n.id));b.addEventListener('click',()=>select(n));results.append(b)}if(!found.length){const p=document.createElement('p');p.textContent='No published records match this stage and search.';results.append(p)}back.disabled=!history.length;next.disabled=stage==='fruit'}
search.addEventListener('input',render);back.addEventListener('click',()=>{const id=history.pop();select(byId.get(id),false)});next.addEventListener('click',()=>{stage=validKinds[Math.min(validKinds.indexOf(stage)+1,5)];selected=null;title.textContent=stageNames[stage];path.textContent='Choose a published record.';destination.hidden=true;destination.removeAttribute('href');render()});
dock.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();open(false)}});
search.addEventListener('keydown',e=>{if(e.key==='Enter'){const first=results.querySelector('button');if(first){e.preventDefault();first.click()}}});
render();
})();