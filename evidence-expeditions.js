/* Living Universe evidence quests: static, read-only; no invented live statuses. */
(function(global){'use strict';
const nodes=global.AIFT_LINEAGE_NODES;
if(!Array.isArray(nodes))return;
const styles=document.createElement('style');
styles.textContent=`
.aift-quest-world{--q-gold:#f7d48c;--q-red:#ff597e;--q-green:#6af1b6;--q-blue:#75cfff;color:#f4f7ff;background:radial-gradient(ellipse at 5% 5%,#56234477,transparent 42%),radial-gradient(ellipse at 95% 70%,#145b7477,transparent 50%),#091427;border:1px solid #ffffff35;border-radius:24px;padding:clamp(1rem,3vw,2.5rem);margin:2rem auto;max-width:1200px;box-shadow:0 18px 60px #0005}
.aift-quest-world *{box-sizing:border-box}.aift-quest-world h2{color:#fff;font:clamp(1.7rem,3vw,2.7rem)/1.2 Georgia,serif;margin:.2em 0}.aift-quest-world p{color:#d4e3ef;max-width:75ch}.aift-quest-world .q-spectrum{height:5px;background:linear-gradient(90deg,var(--q-red),#ffac67,var(--q-gold),var(--q-green),var(--q-blue),#b28dff);border-radius:20px;margin:1rem 0 1.5rem}
.aift-quest-world .q-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,.85fr);gap:1rem}.aift-quest-world .q-card{border:1px solid #ffffff38;background:#12233dcc;border-radius:18px;padding:1.1rem;min-width:0}.aift-quest-world .q-options{display:grid;gap:.6rem}.aift-quest-world button{width:100%;text-align:left;padding:.8rem 1rem;border:1px solid #ffffff40;border-radius:12px;background:#1c3455;color:#fff;font:inherit;cursor:pointer}.aift-quest-world button[aria-pressed=true]{border-color:var(--q-gold);box-shadow:inset 4px 0 var(--q-gold);background:#344264}.aift-quest-world button:focus-visible,.aift-quest-world a:focus-visible{outline:3px solid var(--q-gold);outline-offset:3px}.aift-quest-world a{color:#aee8ff;overflow-wrap:anywhere}.aift-quest-world .q-kicker{color:var(--q-gold);font-size:.8rem;text-transform:uppercase;letter-spacing:.12em}.aift-quest-world .q-chain{display:flex;flex-wrap:wrap;gap:.45rem;align-items:center;margin:1rem 0}.aift-quest-world .q-step{border:1px solid #ffffff44;border-radius:999px;padding:.3rem .65rem;font-size:.85rem;background:#1b2d48}.aift-quest-world .q-step[data-kind=root]{border-color:var(--q-red)}.aift-quest-world .q-step[data-kind=trunk]{border-color:var(--q-gold)}.aift-quest-world .q-step[data-kind=fruit]{border-color:var(--q-green)}.aift-quest-world .q-meta{font-size:.85rem;color:#c3d4e6}.aift-quest-world .q-empty{border-left:3px solid var(--q-gold);padding-left:1rem}.aift-quest-world .q-links{display:flex;flex-wrap:wrap;gap:1rem}
@media(max-width:720px){.aift-quest-world .q-layout{grid-template-columns:1fr}.aift-quest-world{border-radius:16px}.aift-quest-world button{min-height:44px}}
@media(prefers-reduced-motion:no-preference){.aift-quest-world button{transition:background .18s,border-color .18s,transform .18s}.aift-quest-world button:hover{transform:translateY(-2px)}}
`;
document.head.append(styles);
const byId=new Map(nodes.map(n=>[n.id,n]));
const candidates=nodes.filter(n=>n.kind==='fruit'||(n.kind==='branch'&&!nodes.some(c=>c.parent===n.id&&c.kind==='fruit')));
const host=document.createElement('section');host.className='aift-quest-world';host.setAttribute('aria-label','Evidence expeditions');
host.innerHTML='<div class="q-kicker">Living Universe · Evidence expeditions</div><h2>Trace what the roots nourish</h2><p>Explore documented source-to-outcome paths. These are research journeys, not earned achievements or live release checks.</p><div class="q-spectrum" aria-hidden="true"></div><div class="q-layout"><div class="q-card"><h3>Choose an expedition</h3><div class="q-options" role="group" aria-label="Select a lineage expedition"></div></div><div class="q-card" aria-live="polite" aria-atomic="true"><div class="q-detail"></div></div></div>';
const options=host.querySelector('.q-options'),detail=host.querySelector('.q-detail');
function lineage(node){const chain=[],seen=new Set();while(node&&!seen.has(node.id)){chain.unshift(node);seen.add(node.id);node=byId.get(node.parent)}return chain}
function select(id){const node=byId.get(id);if(!node)return;options.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));detail.replaceChildren();
const kicker=document.createElement('div');kicker.className='q-kicker';kicker.textContent=node.kind==='fruit'?'Documented public destination':'Source-backed capability · outcome not verified';
const heading=document.createElement('h3');heading.textContent=node.label;
const description=document.createElement('p');description.textContent=node.desc;
const chain=document.createElement('div');chain.className='q-chain';chain.setAttribute('aria-label','Source lineage');
lineage(node).forEach((n,i)=>{if(i){const arrow=document.createElement('span');arrow.textContent='›';arrow.setAttribute('aria-hidden','true');chain.append(arrow)}const step=document.createElement('span');step.className='q-step';step.dataset.kind=n.kind;step.textContent=n.label+' · '+n.kind;chain.append(step)});
const meta=document.createElement('p');meta.className='q-meta';meta.textContent='Evidence: curated source map · live verification not claimed';
const links=document.createElement('div');links.className='q-links';
for(const n of [node,...lineage(node).filter(n=>n.kind==='root')]){const a=document.createElement('a');a.href=n.url;a.textContent=n===node?'Open documented '+(node.kind==='fruit'?'outcome':'source'):'Inspect repository root';if(/^https?:/.test(n.url))a.rel='noopener noreferrer';links.append(a)}
detail.append(kicker,heading,description,chain,meta,links);
if(node.kind!=='fruit'){const gap=document.createElement('p');gap.className='q-empty';gap.textContent='No finished public product is verified for this capability. Its source and documented functions remain explorable.';detail.append(gap)}
}
candidates.forEach(n=>{const button=document.createElement('button');button.type='button';button.dataset.id=n.id;button.setAttribute('aria-pressed','false');button.textContent=n.label+(n.kind==='fruit'?' · public outcome':' · investigate evidence gap');button.addEventListener('click',()=>select(n.id));options.append(button)});
const mount=document.querySelector('main')||document.body;mount.append(host);if(candidates.length)select(candidates[0].id);
})(window);
