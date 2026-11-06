import {projectWorld,LAYERS} from './world-projection.mjs';
import {evidenceItinerary,evidenceTrail} from './world-evidence-journeys.mjs';
import {evidenceTopology,topologyPositions} from './world-evidence-topology.mjs';
import {readinessBoard} from './world-evidence-readiness.mjs';
import {evidenceQuests} from './world-evidence-quests.mjs';
import {buildEvidenceMissions} from './world-evidence-missions.mjs';
const host=document.getElementById('world-evidence-atlas');
if(host){
 const el=(tag,cls='',value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n};
 const shell=el('section','wea-shell'),heading=el('header','wea-heading');
 heading.append(el('p','wea-kicker','FEDERATION · EVIDENCE ATLAS'),el('h2','','From source to outcome'),el('p','','Explore the real federation as an evidence-backed journey. Every root is a repository; every fruit is an actual deliverable. Structural relationships never imply verified contribution.'));
 shell.append(heading);host.append(shell);
 const status=el('p','wea-status','Loading curated federation evidence…');status.setAttribute('role','status');shell.append(status);
 try{
  const response=await fetch('data/living-universe.json',{cache:'no-store'});if(!response.ok)throw Error('Manifest HTTP '+response.status);
  const model=projectWorld(await response.json());
  const controls=el('div','wea-controls'),search=el('input'),layer=el('select'),previous=el('button','','Previous layer'),next=el('button','','Next layer');
  search.type='search';search.placeholder='Search systems, capabilities and outcomes';search.setAttribute('aria-label','Search federation evidence atlas');
  layer.setAttribute('aria-label','Biological layer');for(const name of LAYERS){const o=el('option','',name[0].toUpperCase()+name.slice(1));o.value=name;layer.append(o)}
  previous.type=next.type='button';controls.append(search,layer,previous,next);shell.append(controls);
  const ribbon=el('nav','wea-ribbon');ribbon.setAttribute('aria-label','Federation growth layers');shell.append(ribbon);
  const layout=el('div','wea-layout'),results=el('div','wea-results'),inspector=el('aside','wea-inspector');inspector.setAttribute('aria-label','Evidence inspector');layout.append(results,inspector);shell.append(layout);
  const expedition=el('section','wea-expedition');expedition.setAttribute('aria-label','Evidence-backed exploration missions');shell.append(expedition);
  const trailPanel=el('section','wea-trail-panel');trailPanel.setAttribute('aria-label','Reversible source journey');shell.append(trailPanel);
  const topologyPanel=el('section','wea-topology-panel');topologyPanel.setAttribute('aria-label','Evidence relationship constellation');shell.append(topologyPanel);
  const tally=el('div','wea-tally');shell.append(tally);
  const readiness=el('section','wea-readiness');readiness.setAttribute('aria-label','Outcome evidence readiness');shell.append(readiness);
  function renderReadiness(){
   readiness.replaceChildren();
   readiness.append(el('h3','','Outcome evidence readiness'),el('p','','Curated provenance only. These are not live CI, deployment, security or release checks.'));
   const entries=readinessBoard(model),grid=el('div','wea-readiness-grid');
   for(const entry of entries){
    const card=el('article','wea-readiness-card');
    card.append(el('h4','',entry.label),el('p','',entry.readiness==='source-lineage-attested'?'Attested source lineage recorded':'Evidence gap: contributing source lineage unverified'));
    const open=link('Open actual outcome',entry.url);card.append(open);
    const inspectButton=el('button','','Inspect lineage');inspectButton.type='button';inspectButton.onclick=()=>{layer.value='fruit';render();navigate(entry.id)};card.append(inspectButton);
    if(entry.roots.length){const roots=el('p','',entry.roots.length+' contributing repository roots');card.append(roots);
     for(const root of entry.roots)card.append(link(root.label,root.url));
    }else card.append(el('p','wea-gap',entry.missing.join('; ')));
    grid.append(card);
   }
   if(!entries.length)readiness.append(el('p','wea-gap','No documented outcomes. No fruits have been invented.'));
   readiness.append(grid);
  }
  // Evidence quests are explorations of documented milestones, never artificial XP.
  const questPanel=el('section','wea-quest-atlas');
  questPanel.setAttribute('aria-label','Evidence-gated outcome quests');
  shell.append(questPanel);
  function renderQuestAtlas(){
   questPanel.replaceChildren();
   questPanel.append(el('h3','','The Evidence Quest Atlas'),el('p','','Trace real products to their contributing repository roots. A documented path unlocks evidence inspection, not an achievement or deployment claim.'));
   const questControls=el('div','wea-quest-controls');
   const filter=el('select');filter.setAttribute('aria-label','Filter evidence quests');
   for(const [value,label] of [['all','All documented outcomes'],['evidence-attested','Source lineage attested'],['evidence-needed','Evidence gaps']]){const option=el('option','',label);option.value=value;filter.append(option)}
   questControls.append(filter);questPanel.append(questControls);
   const count=el('p','wea-quest-count'),grid=el('div','wea-quest-atlas-grid');questPanel.append(count,grid);
   const quests=evidenceQuests(model);
   function show(){
    grid.replaceChildren();const visible=quests.filter(q=>filter.value==='all'||q.state===filter.value);
    count.textContent=visible.length+' of '+quests.length+' documented outcome quests · no XP or live status';
    if(!visible.length)grid.append(el('p','wea-gap','No documented outcomes match this evidence filter.'));
    for(const q of visible){
     const card=el('article','wea-quest-atlas-card');card.dataset.evidence=q.state;
     card.append(el('small','',q.state==='evidence-attested'?'Source lineage attested':'Evidence required'),el('h4','',q.label),el('p','',q.summary));
     const actions=el('div','wea-quest-actions');
     const inspectButton=el('button','','Explore lineage');inspectButton.type='button';inspectButton.onclick=()=>{layer.value='fruit';render();navigate(q.id);inspector.scrollIntoView({behavior:'auto',block:'nearest'})};actions.append(inspectButton);
     if(q.url)actions.append(link('Open actual outcome',q.url));
     card.append(actions);
     if(q.evidence.length){
      const details=el('details','wea-quest-evidence'),summary=el('summary','','Inspect '+q.evidence.length+' attestation sources');details.append(summary);
      const evidenceList=el('ul');for(const url of q.evidence){const li=el('li');li.append(link('Source evidence',url));evidenceList.append(li)}details.append(evidenceList);card.append(details);
      card.append(el('p','wea-quest-roots',q.roots.length+' contributing repository roots'));
     }else card.append(el('p','wea-gap',q.requirement));
     card.append(el('small','wea-quest-caveat',q.caveat));grid.append(card);
    }
   }
   filter.addEventListener('change',show);show();
  }
  // One evidence-derived mission map complements spatial inspection without creating fictional achievements.
  const missionPanel=el('section','wea-mission-map');
  missionPanel.setAttribute('aria-label','Federation mission map and provenance gaps');
  shell.append(missionPanel);
  function renderMissionMap(){
   const plan=buildEvidenceMissions(model);missionPanel.replaceChildren();
   missionPanel.append(el('h3','','Federation mission map'),el('p','',plan.disclaimer));
   const summary=el('p','wea-mission-summary',plan.attested+' of '+plan.outcomes.length+' documented outcomes have attested source lineage');
   missionPanel.append(summary);
   const stages=el('div','wea-mission-stages');
   for(const name of LAYERS){
    const b=el('button','wea-mission-stage',name+' · '+plan.counts[name]);b.type='button';
    b.onclick=()=>{layer.value=name;render();results.scrollIntoView({behavior:'auto',block:'nearest'})};
    stages.append(b);
   }
   missionPanel.append(stages);
   const grid=el('div','wea-mission-grid');
   for(const item of plan.outcomes){
    const card=el('article','wea-mission-card');
    card.append(el('h4','',item.label),el('p','',item.attested?'Attested source path':'Evidence gap'),el('p','',item.next));
    const go=el('button','','Explore journey');go.type='button';go.onclick=()=>{layer.value='fruit';render();navigate(item.id)};
    card.append(go);
    if(item.url)card.append(link('Open outcome',item.url));
    if(item.attested){
     const details=el('details'),caption=el('summary','','Contributing roots and attestations');details.append(caption);
     for(const root of item.roots)details.append(link(root.label,root.url));
     for(const source of item.sources)details.append(link('Source attestation',source));
     card.append(details);
    }
    grid.append(card);
   }
   if(!plan.outcomes.length)grid.append(el('p','wea-gap','No documented outcomes yet; no fruits are invented.'));
   missionPanel.append(grid);
  }
  // Evidence comparison workbench: compare two real outcomes without inferring release readiness.
  const comparison=el('section','wea-comparison');
  comparison.setAttribute('aria-label','Compare documented outcomes and provenance');
  shell.append(comparison);
  function renderComparison(){
   comparison.replaceChildren();
   comparison.append(el('h3','','Source-to-outcome comparison'),el('p','','Compare two documented deliverables and their attested roots. Missing lineage is shown explicitly; no CI, deployment or security readiness is inferred.'));
   const outcomes=readinessBoard(model);
   if(outcomes.length<2){comparison.append(el('p','wea-gap','At least two documented outcomes are needed for comparison.'));return}
   const controls=el('div','wea-comparison-controls'),first=el('select'),second=el('select');
   first.setAttribute('aria-label','First documented outcome');second.setAttribute('aria-label','Second documented outcome');
   for(const entry of outcomes){for(const select of [first,second]){const option=el('option','',entry.label);option.value=entry.id;select.append(option)}}
   second.selectedIndex=1;controls.append(first,second);comparison.append(controls);
   const grid=el('div','wea-comparison-grid'),summary=el('p','wea-comparison-summary');comparison.append(summary,grid);
   function update(){
    grid.replaceChildren();const entries=[first,second].map(select=>outcomes.find(entry=>entry.id===select.value));
    const distinct=entries[0].id!==entries[1].id;
    const shared=distinct?entries[0].roots.filter(root=>entries[1].roots.some(other=>other.id===root.id)):[];
    summary.textContent=distinct?(shared.length+' shared attested repository roots; comparison is provenance-only.'):'Choose two different outcomes to compare their lineage.';
    for(const entry of entries){
     const card=el('article','wea-comparison-card');
     card.append(el('h4','',entry.label),el('p','',entry.readiness==='source-lineage-attested'?'Attested source lineage recorded':'Evidence gap: contributing source lineage not attested'));
     if(entry.url)card.append(link('Open actual deliverable',entry.url));
     const go=el('button','','Inspect full journey');go.type='button';go.onclick=()=>{layer.value='fruit';render();navigate(entry.id);inspector.scrollIntoView({behavior:'auto',block:'nearest'})};card.append(go);
     if(entry.roots.length){const list=el('ul');for(const root of entry.roots){const li=el('li');li.append(link(root.label,root.url));if(distinct&&shared.some(item=>item.id===root.id))li.append(el('strong','',' · shared root'));list.append(li)}card.append(list)}
     else card.append(el('p','wea-gap',entry.missing.join('; ')));
     grid.append(card);
    }
   }
   first.addEventListener('change',update);second.addEventListener('change',update);update();
  }
  const history=[];let cursor=-1;
  function navigate(id){if(history[cursor]!==id){history.splice(cursor+1);history.push(id);cursor=history.length-1}inspect(id)}
  function renderTrail(id){trailPanel.replaceChildren();const trail=evidenceTrail(model,id);trailPanel.append(el('h3','','Source-to-outcome journey'));
   const nav=el('div','wea-history'),back=el('button','','← Back'),forward=el('button','','Forward →');back.type=forward.type='button';back.disabled=cursor<=0;forward.disabled=cursor>=history.length-1;back.onclick=()=>{cursor--;inspect(history[cursor])};forward.onclick=()=>{cursor++;inspect(history[cursor])};nav.append(back,forward);trailPanel.append(nav);
   if(trail.gap)trailPanel.append(el('p','wea-gap','Evidence gap: '+trail.gap));
   for(const path of trail.paths){const row=el('div','wea-journey');for(const step of path.steps){const button=el('button','wea-journey-step',step.kind+' · '+step.label);button.type='button';button.onclick=()=>{layer.value=step.kind;render();navigate(step.id)};row.append(button);if(step.evidenceUrl)row.append(link('Attestation',step.evidenceUrl))}trailPanel.append(row)}
  }
  function renderExpedition(){expedition.replaceChildren();expedition.append(el('h3','','Evidence expeditions'),el('p','','Choose a real source-backed exploration. Availability is not completion, and no XP or achievements are fabricated.'));
   const grid=el('div','wea-quest-grid');for(const quest of evidenceItinerary(model)){const card=el('article','wea-quest');card.append(el('h4','',quest.title),el('p','',quest.hint),el('small','',quest.candidates.length+' documented candidates · '+quest.status));
    for(const candidate of quest.candidates){const b=el('button','',candidate.label+' · '+candidate.evidence);b.type='button';b.onclick=()=>{layer.value=quest.kind;render();navigate(candidate.id)};card.append(b)}grid.append(card)}expedition.append(grid)}
  let selected=null;
  const link=(text,url)=>{const a=el('a','wea-link',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a};
  function renderTopology(id){
   topologyPanel.replaceChildren();
   topologyPanel.append(el('h3','','Evidence constellation'),el('p','','Solid gold connections carry source-backed contribution attestations. Dashed connections describe structure only. Select any node to inspect its actual lineage.'));
   const topology=evidenceTopology(model,id),positions=topologyPositions(topology);
   if(!topology.nodes.length){topologyPanel.append(el('p','wea-gap',topology.gap));return}
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.setAttribute('viewBox','0 0 1040 540');svg.setAttribute('role','img');
   svg.setAttribute('aria-label','Evidence neighborhood diagram; use the accessible entity list below for navigation');
   const ns='http://www.w3.org/2000/svg';
   for(const edge of topology.edges){
    const from=positions.get(edge.from),to=positions.get(edge.to);if(!from||!to)continue;
    const line=document.createElementNS(ns,'line');
    for(const [key,value] of Object.entries({x1:from.x,y1:from.y,x2:to.x,y2:to.y}))line.setAttribute(key,String(value));
    line.setAttribute('class',edge.attested?'wea-edge-attested':'wea-edge-structural');
    const title=document.createElementNS(ns,'title');title.textContent=edge.relation+(edge.attested?' · source-backed':' · structural');line.append(title);svg.append(line);
   }
   for(const node of topology.nodes){
    const p=positions.get(node.id),g=document.createElementNS(ns,'g');
    g.setAttribute('class','wea-graph-node'+(node.id===id?' is-selected':''));
    const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',String(p.x));circle.setAttribute('cy',String(p.y));circle.setAttribute('r','13');
    const label=document.createElementNS(ns,'text');label.setAttribute('x',String(p.x));label.setAttribute('y',String(p.y+30));label.textContent=node.label.length>19?node.label.slice(0,18)+'…':node.label;
    const title=document.createElementNS(ns,'title');title.textContent=node.kind+' · '+node.label;
    g.append(circle,label,title);svg.append(g);
   }
   const frame=el('div','wea-topology-viewport');frame.append(svg);topologyPanel.append(frame);
   const index=el('div','wea-topology-index');index.setAttribute('aria-label','Constellation accessible entity navigation');
   for(const node of topology.nodes){
    const b=el('button','',node.kind+' · '+node.label);b.type='button';
    b.setAttribute('aria-current',String(node.id===id));
    b.onclick=()=>{layer.value=node.kind;render();navigate(node.id)};index.append(b);
   }
   topologyPanel.append(index);
   if(topology.gap)topologyPanel.append(el('p','wea-gap','Evidence gap: '+topology.gap));
   if(topology.omitted>0)topologyPanel.append(el('p','wea-gap',topology.omitted+' additional related entities omitted from this view; use the inspector for full relationships.'));
  }
  function inspect(id){
   selected=id;inspector.replaceChildren();const detail=model.inspect(id);
   if(!detail){inspector.append(el('p','','Select an entity to inspect its source evidence.'));return}
   const {node,lineage,relationships,outcomeVerified}=detail;
   inspector.append(el('p','wea-kicker',node.kind.toUpperCase()),el('h3','',node.label),link(node.kind==='fruit'?'Open actual outcome':'Open documented source',node.url));
   if(node.kind==='root')inspector.append(el('p','','Repository root: source and provenance, not a product fruit.'));
   else if(!lineage.roots.length)inspector.append(el('p','wea-gap','Evidence gap: no attested contribution path to a repository root.'));
   else{
    inspector.append(el('h4','','Attested source journeys'));
    for(const path of lineage.paths){const card=el('div','wea-trail');card.append(el('strong','',path.root.label));
     const rootButton=el('button','','Inspect root');rootButton.type='button';rootButton.onclick=()=>{layer.value='root';render();navigate(path.root.id)};card.append(rootButton);
     for(const edge of path.edges){const target=model.inspect(edge.to)?.node;card.append(el('span','wea-arrow','→ '+(target?.label||edge.to)));if(edge.evidenceUrl)card.append(link('View attestation',edge.evidenceUrl))}
     inspector.append(card)}
   }
   if(node.kind==='fruit')inspector.append(el('p',outcomeVerified?'wea-verified':'wea-gap',outcomeVerified?'Attested contributing root path recorded. This is not a live deployment or CI claim.':'Documented outcome without attested root lineage. No achievement awarded.'));
   inspector.append(el('h4','','Related entities'));
   const rel=el('div','wea-related');for(const edge of relationships){const other=model.inspect(edge.from===id?edge.to:edge.from)?.node;if(!other)continue;const b=el('button','',other.label+' · '+edge.relation);b.type='button';b.onclick=()=>{layer.value=other.kind;render();navigate(other.id)};rel.append(b)}inspector.append(rel);
   for(const b of results.querySelectorAll('button[data-node]'))b.setAttribute('aria-pressed',String(b.dataset.node===id));
   renderTrail(id);renderTopology(id);
  }
  function render(){
   ribbon.replaceChildren();for(const name of LAYERS){const b=el('button','wea-stage',name);b.type='button';b.dataset.layer=name;b.setAttribute('aria-current',String(name===layer.value));b.onclick=()=>{layer.value=name;render()};b.append(el('strong','',String(model.nodes.filter(n=>n.kind===name).length)));ribbon.append(b)}
   const index=LAYERS.indexOf(layer.value);previous.disabled=index===0;next.disabled=index===LAYERS.length-1;
   const term=search.value.trim().toLowerCase(),items=model.search(term,layer.value);results.replaceChildren();
   const label=el('p','wea-count',items.length+' documented '+layer.value+' entities');results.append(label);
   if(!items.length)results.append(el('p','wea-gap','No matching documented entities. Missing outcomes are not invented.'));
   for(const node of items){const detail=model.inspect(node.id),button=el('button','wea-item');button.type='button';button.dataset.node=node.id;button.setAttribute('aria-pressed',String(selected===node.id));button.append(el('small','',node.kind),el('strong','',node.label),el('span','',node.kind==='root'?'Repository source':node.kind==='fruit'?(detail.outcomeVerified?'Attested source lineage':'Evidence gap: source lineage not attested'):(detail.lineage.roots.length?'Source path recorded':'Documented structure; source path not attested')));button.onclick=()=>navigate(node.id);results.append(button)}
   const fruits=model.outcomes();tally.textContent=fruits.length+' documented outcomes · '+fruits.filter(f=>f.outcomeVerified).length+' with attested source paths · No live CI or deployment status asserted';
   if(!selected||!model.inspect(selected)){if(items[0])navigate(items[0].id);else inspect(undefined)}
   else for(const b of results.querySelectorAll('button[data-node]'))b.setAttribute('aria-pressed',String(b.dataset.node===selected));
  }
  search.addEventListener('input',render);layer.addEventListener('change',render);
  previous.onclick=()=>{layer.value=LAYERS[Math.max(0,LAYERS.indexOf(layer.value)-1)];render()};
  next.onclick=()=>{layer.value=LAYERS[Math.min(LAYERS.length-1,LAYERS.indexOf(layer.value)+1)];render()};
  render();renderExpedition();renderReadiness();renderQuestAtlas();renderMissionMap();renderComparison();status.textContent='Curated source projection loaded · '+model.nodes.length+' entities · '+model.edges.length+' documented relationships';
 }catch(error){status.textContent='Evidence Atlas unavailable: '+error.message+'. Existing portal exploration remains accessible.'}
}
