/* Shared evidence-gated milestone journeys. No network, persistence, XP or readiness inference. */
(function(global){'use strict';
const nodes=global.AIFT_LINEAGE_NODES;
if(!Array.isArray(nodes)||!nodes.length||typeof document==='undefined')return;
const byId=new Map(nodes.map(n=>[n.id,n]));
const roots=nodes.filter(n=>n.kind==='root');
const outcomes=nodes.filter(n=>n.kind==='fruit'&&n.url&&!/github\.com\/AIFreedomTrustFederation\/[^/]+\/?$/.test(n.url));
const styles=document.createElement('style');
styles.textContent=`
.aift-journey-board{--jb-red:#fa6684;--jb-gold:#f4d48d;--jb-green:#70e6ae;--jb-blue:#70c4ff;max-width:1200px;margin:2rem auto;padding:clamp(18px,4vw,38px);border:1px solid #d8b875;border-radius:26px;color:#eef6ff;background:radial-gradient(ellipse at 0 0,#6c284b88,transparent 50%),radial-gradient(ellipse at 100% 100%,#164c6b88,transparent 50%),#09182c;box-shadow:0 25px 75px #0006;font:16px/1.55 system-ui,sans-serif}
.aift-journey-board *{box-sizing:border-box}.aift-journey-board h2{font:clamp(26px,4vw,42px) Georgia,serif;color:var(--jb-gold);margin:6px 0}.aift-journey-board p{color:#d2e4ef;max-width:75ch}.aift-journey-board .jb-ribbon{height:6px;border-radius:99px;background:linear-gradient(90deg,var(--jb-red),var(--jb-gold),var(--jb-green),var(--jb-blue),#b996f4);margin:20px 0}
.aift-journey-board .jb-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,1fr);gap:18px}.aift-journey-board .jb-card{background:#10243c;border:1px solid #6b93a7;border-radius:18px;padding:18px;min-width:0}.aift-journey-board .jb-steps{display:grid;gap:10px}.aift-journey-board button,.aift-journey-board a{font:inherit;color:#fff;border:1px solid #8bbfce;background:#1a3850;border-radius:12px;padding:12px;text-align:left;min-height:44px;cursor:pointer}.aift-journey-board button[aria-pressed=true]{border:2px solid var(--jb-gold);background:#453c42}.aift-journey-board :is(button,a):focus-visible{outline:3px solid var(--jb-gold);outline-offset:3px}.aift-journey-board .jb-progress{height:10px;background:#2a3d52;border-radius:99px;overflow:hidden}.aift-journey-board .jb-progress span{display:block;height:100%;background:linear-gradient(90deg,var(--jb-red),var(--jb-green),var(--jb-blue));transition:width .25s}.aift-journey-board .jb-meta{font-size:.84rem;color:#bad5e5}.aift-journey-board .jb-path{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.aift-journey-board .jb-path button{flex:1 1 120px}.aift-journey-board .jb-source{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.aift-journey-board .jb-source a{display:inline-flex;text-decoration:none;align-items:center;overflow-wrap:anywhere}.aift-journey-board .jb-explore{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin:14px 0}.aift-journey-board .jb-explore input{min-width:0;width:100%;padding:12px;border:1px solid #8bbfce;border-radius:12px;background:#081b30;color:#fff;font:inherit}.aift-journey-board .jb-explore input:focus-visible{outline:3px solid var(--jb-gold);outline-offset:3px}.aift-journey-board .jb-ancestry{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:10px 0}.aift-journey-board .jb-ancestry button{min-height:44px}.aift-journey-board .jb-ancestry span{color:var(--jb-gold)}.aift-journey-board .jb-gap{border-left:3px solid var(--jb-gold);padding-left:12px}.aift-journey-board .jb-small{color:#bcd3df;font-size:.8rem}
@media(max-width:720px){.aift-journey-board .jb-grid{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){.aift-journey-board *{transition:none!important;animation:none!important}}@media(forced-colors:active){.aift-journey-board,.aift-journey-board .jb-card{border:2px solid CanvasText}}
`;
document.head.append(styles);
const host=document.createElement('section');host.className='aift-journey-board';host.setAttribute('aria-label','Evidence-backed discovery journeys');
host.innerHTML='<small>THE LIVING UNIVERSE · EVIDENCE JOURNEYS</small><h2>Discover what the roots nourish</h2><p>Explore real source systems, documented capabilities and public outcomes. Exploration progress belongs to this page session only. It is never a CI result, earned achievement, release certification or proof of deployment.</p><div class="jb-ribbon" aria-hidden="true"></div><div class="jb-grid"><div class="jb-card"><h3>Choose a journey</h3><div class="jb-steps" role="group" aria-label="Evidence journeys"></div><p class="jb-meta" id="jb-summary"></p><div class="jb-progress" role="progressbar" aria-label="Visited destinations in current journey" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span style="width:0%"></span></div></div><div class="jb-card"><small class="jb-meta" id="jb-kind"></small><h3 id="jb-title">Choose a journey</h3><p id="jb-description"></p><label for="jb-search">Find a documented destination</label><div class="jb-explore"><input id="jb-search" type="search" autocomplete="off" placeholder="Search source, capability, or outcome"><button type="button" id="jb-clear">Clear</button></div><p class="jb-small" id="jb-filter-count" role="status"></p><nav class="jb-ancestry" aria-label="Reversible source lineage"></nav><nav class="jb-path" aria-label="Journey destinations"></nav><div class="jb-source"></div><p class="jb-gap" id="jb-gap"></p><p class="jb-small" role="status" aria-live="polite" id="jb-status"></p></div></div>';
(document.querySelector('main')||document.body).append(host);
const $=s=>host.querySelector(s);
const paths=[
{id:'roots',name:'Source Cartography',description:'Inspect the verified repository-source category without confusing roots with products.',items:roots},
{id:'capabilities',name:'Knowledge Canopy',description:'Trace documented branches and leaves to their source roots.',items:nodes.filter(n=>n.kind==='branch'||n.kind==='leaf')},
{id:'outcomes',name:'Public Outcomes',description:'Open curated public destinations and inspect their contributing source lineage.',items:outcomes}
];
let current=0,selected=null,query="";
const visited=new Map(paths.map(p=>[p.id,new Set()]));
function lineage(node){const path=[],seen=new Set();while(node&&!seen.has(node.id)){seen.add(node.id);path.unshift(node);node=byId.get(node.parent)}return path}
function showNode(id){const node=byId.get(id);if(!node)return;const index=paths.findIndex(p=>p.items.some(n=>n.id===id));if(index>=0)current=index;open(id)}
function open(id){const node=byId.get(id);if(!node)return;selected=id;visited.get(paths[current].id).add(id);render()}
function render(){
const path=paths[current],seen=visited.get(path.id),pct=path.items.length?Math.round(100*seen.size/path.items.length):0;
const matches=path.items.filter(n=>(n.label+' '+(n.desc||'')+' '+lineage(n).map(a=>a.label).join(' ')).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
$('.jb-steps').replaceChildren(...paths.map((p,i)=>{const b=document.createElement('button');b.type='button';b.textContent=p.name+' · '+p.items.length+' documented destinations';b.setAttribute('aria-pressed',String(i===current));b.addEventListener('click',()=>{current=i;selected=null;render()});return b}));
$('.jb-summary').textContent=seen.size+' of '+path.items.length+' visited · session exploration, not verified achievement';
const meter=$('[role=progressbar]');meter.setAttribute('aria-valuenow',String(pct));meter.querySelector('span').style.width=pct+'%';
const node=matches.find(n=>n.id===selected)||matches.find(n=>!seen.has(n.id))||matches[0];
$('#jb-filter-count').textContent=matches.length+' of '+path.items.length+' documented destinations match. Search does not alter evidence or progress.';
$('#jb-kind').textContent=path.name+' · curated source evidence';
$('#jb-title').textContent=node?node.label:'No documented destinations';
$('#jb-description').textContent=node?node.desc:path.description;
const nav=$('.jb-path');nav.replaceChildren(...matches.map(n=>{const b=document.createElement('button');b.type='button';b.textContent=(seen.has(n.id)?'✓ ':'')+n.label;b.setAttribute('aria-pressed',String(n.id===node?.id));b.addEventListener('click',()=>open(n.id));return b}));
const ancestry=$('.jb-ancestry');ancestry.replaceChildren();
if(node){for(const [i,ancestor] of lineage(node).entries()){if(i){const sep=document.createElement('span');sep.textContent='›';sep.setAttribute('aria-hidden','true');ancestry.append(sep)}const b=document.createElement('button');b.type='button';b.textContent=ancestor.label+' · '+ancestor.kind;b.setAttribute('aria-label','Inspect '+ancestor.kind+' '+ancestor.label);b.addEventListener('click',()=>{query='';$('#jb-search').value='';showNode(ancestor.id)});ancestry.append(b)}}
const links=$('.jb-source');links.replaceChildren();
if(node){for(const n of [node,...lineage(node).filter(x=>x.kind==='root'&&x.id!==node.id)]){const a=document.createElement('a');a.href=n.url;a.textContent=n===node?(n.kind==='fruit'?'Open public outcome':'Inspect documented source'):'Inspect contributing root';if(!/^https?:\/\//.test(n.url))continue;a.rel='noopener noreferrer';links.append(a)}}
$('#jb-gap').textContent=node&&node.kind!=='fruit'?'No finished product is inferred from this source or capability. Follow the evidence rather than assuming an outcome.':!node?'No documented outcome in this category.':'This curated destination is not a live availability or release claim.';
$('#jb-status').textContent=node?'Current lineage: '+lineage(node).map(n=>n.label+' ('+n.kind+')').join(' → '):'No source-backed destination available.';
}
$('#jb-search').addEventListener('input',e=>{query=e.target.value.trim();selected=null;render()});
$('#jb-clear').addEventListener('click',()=>{query='';selected=null;$('#jb-search').value='';render();$('#jb-search').focus()});
render();
})(typeof window==='undefined'?globalThis:window);
