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
.aift-journey-board .jb-stage-map{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:14px 0}.aift-journey-board .jb-stage{display:flex;flex-direction:column;gap:6px;border-top:5px solid var(--jb-gold);font-size:.8rem;overflow-wrap:anywhere}.aift-journey-board .jb-stage[data-stage=root]{border-top-color:var(--jb-red)}.aift-journey-board .jb-stage[data-stage=leaf]{border-top-color:var(--jb-green)}.aift-journey-board .jb-stage[data-stage=fruit]{border-top-color:var(--jb-blue)}.aift-journey-board .jb-stage span{font-size:.72rem;color:#d1e3f0}.aift-journey-board .jb-stage-detail{min-height:3em}.aift-journey-board .jb-gate-theatre{margin-top:20px;padding:18px;border:1px solid #bda06c;border-radius:18px;background:linear-gradient(120deg,#291c38,#102f40 55%,#10203b)}.aift-journey-board .jb-gate-list{list-style:none;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.aift-journey-board .jb-gate{padding:12px;background:#10243c;border-left:4px solid var(--jb-gold);border-radius:12px}.aift-journey-board .jb-gate[data-state=blocked]{border-color:var(--jb-red)}.aift-journey-board .jb-gate[data-state=declared]{border-color:var(--jb-green)}.aift-journey-board .jb-gate strong,.aift-journey-board .jb-gate span{display:block}.aift-journey-board .jb-gate span{color:#d2e4ef;font-size:.84rem;margin-top:5px}@media(max-width:860px){.aift-journey-board .jb-stage-map{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:520px){.aift-journey-board .jb-stage-map{grid-template-columns:repeat(2,minmax(0,1fr))}.aift-journey-board .jb-gate-list{grid-template-columns:1fr}}
@media(max-width:720px){.aift-journey-board .jb-grid{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){.aift-journey-board *{transition:none!important;animation:none!important}}@media(forced-colors:active){.aift-journey-board,.aift-journey-board .jb-card{border:2px solid CanvasText}}
`;
document.head.append(styles);
const host=document.createElement('section');host.className='aift-journey-board';host.setAttribute('aria-label','Evidence-backed discovery journeys');
host.innerHTML='<small>THE LIVING UNIVERSE · EVIDENCE JOURNEYS</small><h2>Discover what the roots nourish</h2><p>Explore real source systems, documented capabilities and public outcomes. Exploration progress belongs to this page session only. It is never a CI result, earned achievement, release certification or proof of deployment.</p><div class="jb-ribbon" aria-hidden="true"></div><div class="jb-grid"><div class="jb-card"><h3>Choose a journey</h3><div class="jb-steps" role="group" aria-label="Evidence journeys"></div><p class="jb-meta" id="jb-summary"></p><div class="jb-progress" role="progressbar" aria-label="Visited destinations in current journey" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span style="width:0%"></span></div></div><div class="jb-card"><small class="jb-meta" id="jb-kind"></small><h3 id="jb-title">Choose a journey</h3><p id="jb-description"></p><label for="jb-search">Find a documented destination</label><div class="jb-explore"><input id="jb-search" type="search" autocomplete="off" placeholder="Search source, capability, or outcome"><button type="button" id="jb-clear">Clear</button></div><p class="jb-small" id="jb-filter-count" role="status"></p><nav class="jb-ancestry" aria-label="Reversible source lineage"></nav><nav class="jb-path" aria-label="Journey destinations"></nav><div class="jb-source"></div><p class="jb-gap" id="jb-gap"></p><p class="jb-small" role="status" aria-live="polite" id="jb-status"></p></div></div>';
(document.querySelector('main')||document.body).append(host);
const $=s=>host.querySelector(s);
// Shared biological stage semantics for the public evidence theatre.
const STAGES=['root','trunk','branch','leaf','flower','fruit'];
const STAGE_NAMES={root:'Roots · source',trunk:'Trunk · federation',branch:'Branches · systems',leaf:'Leaves · capabilities',flower:'Flowers · emerging',fruit:'Fruits · outcomes'};
const stageCounts=new Map(STAGES.map(s=>[s,nodes.filter(n=>n.kind===s).length]));
const stageMap=document.createElement('nav');stageMap.className='jb-stage-map';stageMap.setAttribute('aria-label','Biological source-to-outcome map');
const stageDescription=document.createElement('p');stageDescription.className='jb-stage-detail';stageDescription.setAttribute('role','status');
const gateTheatre=document.createElement('section');gateTheatre.className='jb-gate-theatre';gateTheatre.setAttribute('aria-label','Evidence readiness theatre');
const gateTitle=document.createElement('h3');gateTitle.textContent='Evidence gates · no simulated achievements';
const gateList=document.createElement('ol');gateList.className='jb-gate-list';
gateTheatre.append(gateTitle,gateList);
host.querySelector('.jb-ribbon').after(stageMap,stageDescription);
host.querySelector('.jb-grid').after(gateTheatre);
let activeStage=null;
function gateRow(label,state,detail){
 const li=document.createElement('li');li.className='jb-gate';li.dataset.state=state;
 const heading=document.createElement('strong');heading.textContent=label+' · '+state;
 const note=document.createElement('span');note.textContent=detail;
 li.append(heading,note);return li;
}
function stageSummary(stage){
 const count=stageCounts.get(stage)||0;
 return STAGE_NAMES[stage]+': '+count+' curated record(s). '+(stage==='root'?'Repositories are source roots, not products.':stage==='fruit'?'Only real public outcomes qualify; a catalog entry does not certify deployment.':'A declared relationship is not independent verification.');
}
function renderStageMap(){
 stageMap.replaceChildren(...STAGES.map(s=>{
  const b=document.createElement('button');b.type='button';b.className='jb-stage';
  b.dataset.stage=s;b.setAttribute('aria-pressed',String(activeStage===s));
  const name=document.createElement('strong');name.textContent=STAGE_NAMES[s];
  const count=document.createElement('span');count.textContent=(stageCounts.get(s)||0)+' curated';
  b.append(name,count);b.addEventListener('click',()=>{
   activeStage=activeStage===s?null:s;
   if(activeStage==='root')current=0;
   else if(activeStage==='branch'||activeStage==='leaf')current=1;
   else if(activeStage==='fruit')current=2;
   selected=null;render();
  });return b;
 }));
 stageDescription.textContent=activeStage?stageSummary(activeStage):'Choose a growth stage to inspect its evidence and focus the corresponding journey. All six stages remain visible even when no records exist.';
}
function renderGates(node){
 gateList.replaceChildren();
 if(!node){
  gateList.append(gateRow('Documented source','pending','Choose a record to inspect its provenance.'),
   gateRow('Verified outcome','pending','No result is certified by exploration alone.'));
  return;
 }
 const trail=lineage(node),rootTrail=trail.filter(n=>n.kind==='root');
 const rootLinks=rootTrail.filter(n=>/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(n.url||''));
 gateList.append(gateRow('Repository-root ancestry',rootLinks.length?'declared':'blocked',rootLinks.length?rootLinks.length+' source root(s) named in curated lineage. Contribution requires independent verification.':'No repository root documented on this path.'));
 gateList.append(gateRow('Evidence independence','pending','Curated parent links and URLs are not proof of exact-head CI, review or live operation.'));
 if(node.kind==='fruit'){
  const publicDestination=/^https?:\/\//.test(node.url||'')&&!/^https?:\/\/(?:www\.)?github\.com\//.test(node.url||'')||/^[a-zA-Z0-9._/-]+\.html(?:#.*)?$/.test(node.url||'');
  gateList.append(gateRow('User-facing destination',publicDestination?'declared':'blocked',publicDestination?'A visitor destination is declared; live accessibility and release readiness remain unverified.':'No qualifying visitor destination.'));
 }else gateList.append(gateRow('Product classification','pending','This source or capability is not a finished product fruit.'));
 gateList.append(gateRow('Accessible experience','pending','Real-browser keyboard, screen-reader, mobile and reduced-motion acceptance not attested here.'));
}
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
const matches=path.items.filter(n=>(!activeStage||n.kind===activeStage)&&(n.label+' '+(n.desc||'')+' '+lineage(n).map(a=>a.label).join(' ')).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
renderStageMap();
$('.jb-steps').replaceChildren(...paths.map((p,i)=>{const b=document.createElement('button');b.type='button';b.textContent=p.name+' · '+p.items.length+' documented destinations';b.setAttribute('aria-pressed',String(i===current));b.addEventListener('click',()=>{current=i;selected=null;render()});return b}));
$('#jb-summary').textContent=seen.size+' of '+path.items.length+' visited · session exploration, not verified achievement';
const meter=$('[role=progressbar]');meter.setAttribute('aria-valuenow',String(pct));meter.querySelector('span').style.width=pct+'%';
const node=matches.find(n=>n.id===selected)||matches.find(n=>!seen.has(n.id))||matches[0];
$('#jb-filter-count').textContent=matches.length+' of '+path.items.length+' documented destinations match. Search does not alter evidence or progress.';
$('#jb-kind').textContent=path.name+' · curated source evidence';
$('#jb-title').textContent=node?node.label:'No documented destinations';
$('#jb-description').textContent=node?node.desc:path.description;
const nav=$('.jb-path');nav.replaceChildren(...matches.map(n=>{const b=document.createElement('button');b.type='button';b.textContent=(seen.has(n.id)?'✓ ':'')+n.label;b.setAttribute('aria-pressed',String(n.id===node?.id));b.addEventListener('click',()=>open(n.id));return b}));
const ancestry=$('.jb-ancestry');ancestry.replaceChildren();
if(node){for(const [i,ancestor] of lineage(node).entries()){if(i){const sep=document.createElement('span');sep.textContent='›';sep.setAttribute('aria-hidden','true');ancestry.append(sep)}const b=document.createElement('button');b.type='button';b.textContent=ancestor.label+' · '+ancestor.kind;b.setAttribute('aria-label','Inspect '+ancestor.kind+' '+ancestor.label);b.addEventListener('click',()=>{query='';$('#jb-search').value='';showNode(ancestor.id)});ancestry.append(b)}}
renderGates(node);
const links=$('.jb-source');links.replaceChildren();
if(node){for(const n of [node,...lineage(node).filter(x=>x.kind==='root'&&x.id!==node.id)]){const a=document.createElement('a');a.href=n.url;a.textContent=n===node?(n.kind==='fruit'?'Open public outcome':'Inspect documented source'):'Inspect contributing root';if(!/^https?:\/\//.test(n.url))continue;a.rel='noopener noreferrer';links.append(a)}}
$('#jb-gap').textContent=node&&node.kind!=='fruit'?'No finished product is inferred from this source or capability. Follow the evidence rather than assuming an outcome.':!node?'No documented outcome in this category.':'This curated destination is not a live availability or release claim.';
$('#jb-status').textContent=node?'Current lineage: '+lineage(node).map(n=>n.label+' ('+n.kind+')').join(' → '):'No source-backed destination available.';
}
$('#jb-search').addEventListener('input',e=>{query=e.target.value.trim();selected=null;render()});
$('#jb-clear').addEventListener('click',()=>{query='';selected=null;$('#jb-search').value='';render();$('#jb-search').focus()});
render();
})(typeof window==='undefined'?globalThis:window);
