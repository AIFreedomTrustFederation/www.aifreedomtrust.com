import {validateWorld,contributionRoots,memberships,journey,evidenceQuests} from './world-model-contract.mjs';
const root=document.getElementById('world-evolution');
if(root){
 const $=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
 const section=(name,desc)=>{const s=$('section','evo-panel'),h=$('h3','',name),p=$('p','evo-muted',desc);s.append(h,p);root.append(s);return s};
 const header=$('div','evo-heading');header.append($('span','evo-eyebrow','LIVING UNIVERSE · PROVENANCE & EXPLORATION'),$('h2','','The Source Current'),$('p','evo-muted','Follow the living current from verified repository roots to documented systems and demonstrable outcomes. Organizational membership is never mistaken for product contribution.'));root.append(header);
 const status=$('p','evo-status','Loading the curated world model…');status.setAttribute('role','status');root.append(status);
 try{
  const res=await fetch('data/living-universe.json',{cache:'no-store'});if(!res.ok)throw Error('Manifest HTTP '+res.status);
  const model=await res.json(),validation=validateWorld(model);if(!validation.valid)throw Error(validation.errors.join('; '));
  const stages=journey(model),quests=evidenceQuests(model),nodeById=new Map(model.nodes.map(n=>[n.id,n]));
  const navigator=section('Growth Layers','Move between source repositories, federation trunk, systems, capabilities, emerging work and real outcomes.');
  const controls=$('div','evo-stages');navigator.append(controls);
  const panel=$('div','evo-detail');navigator.append(panel);
  let selectedStage='root',selectedNode=null;
  function renderDetail(node){
   selectedNode=node;panel.replaceChildren();if(!node){panel.append($('p','evo-muted','No documented entities in this layer. Empty layers are not filled with invented products.'));return}
   panel.append($('span','evo-eyebrow',node.kind.toUpperCase()),$('h4','',node.label));
   const a=$('a','evo-link',node.kind==='fruit'?'Open actual outcome ↗':'Open source evidence ↗');a.href=node.url;a.target='_blank';a.rel='noopener noreferrer';panel.append(a);
   const trace=contributionRoots(model,node.id),list=$('div','evo-traces');
   if(node.kind==='root')list.append($('p','','This repository is a source root, not a product fruit.'));
   else if(trace.roots.length===0)list.append($('p','evo-warning','No verified contributing-root path is recorded. Federation membership alone does not prove a dependency or product contribution.'));
   else{list.append($('p','','Contributing roots: '+trace.roots.map(r=>r.label).join(', ')));for(const path of trace.paths){const p=$('p','evo-path',path.join('  →  '));list.append(p)}}
   const org=memberships(model,node.id);if(org.length)list.append($('p','evo-muted',org.length+' organizational relationship(s) shown separately from contribution evidence.'));
   panel.append(list);
   const related=$('div','evo-related');for(const edge of model.edges.filter(e=>e.from===node.id||e.to===node.id)){const other=nodeById.get(edge.from===node.id?edge.to:edge.from);if(!other)continue;const b=$('button','evo-node',other.label+' · '+edge.relation);b.type='button';b.onclick=()=>{selectedStage=other.kind;renderStages();renderDetail(other)};related.append(b)}panel.append(related);
  }
  function renderStages(){
   controls.replaceChildren();
   for(const stage of stages){const b=$('button','evo-stage'+(stage.kind===selectedStage?' active':''));b.type='button';b.setAttribute('aria-pressed',String(stage.kind===selectedStage));b.append($('span','',stage.kind.toUpperCase()),$('strong','',String(stage.count)));b.onclick=()=>{selectedStage=stage.kind;renderStages();renderDetail(stage.nodes[0])};controls.append(b)}
  }
  renderStages();renderDetail(stages[0].nodes[0]);
  const missions=section('Evidence Expeditions','Exploration objectives are educational journeys, not verified CI achievements or fictional XP.');
  const cards=$('div','evo-quests');missions.append(cards);
  for(const quest of quests){const card=$('article','evo-quest');card.append($('h4','',quest.label),$('p','evo-muted',quest.description),$('span','evo-eyebrow',quest.candidates.length+' curated exploration candidates'));const button=$('button','evo-node','Explore '+quest.kind);button.type='button';button.disabled=!quest.candidates.length;button.onclick=()=>{selectedStage=quest.kind;renderStages();renderDetail(quest.candidates[0]);navigator.scrollIntoView({block:'start',behavior:'auto'})};card.append(button);cards.append(card)}
  const legend=section('Evidence boundaries','Curated links are not live telemetry. Roots represent repositories; branches and leaves are documented structure; fruits require a real destination and explicit contributing-root path.');
  const a=$('a','evo-link','Inspect canonical Genesis Living Atlas ↗');a.href='https://github.com/AIFreedomTrustFederation/AIFT-Genesis/blob/main/manifests/living-atlas.manifest.json';a.target='_blank';a.rel='noopener noreferrer';legend.append(a);
  status.textContent=model.nodes.length+' curated nodes · '+model.edges.length+' typed relationships · '+model.nodes.filter(n=>n.kind==='fruit').length+' documented public outcomes · '+model.nodes.filter(n=>n.kind==='fruit'&&contributionRoots(model,n.id).roots.length>0).length+' with attested source paths';
 }catch(err){status.textContent='Source Current unavailable: '+err.message+'. The original Living Universe remains accessible.'}
}
