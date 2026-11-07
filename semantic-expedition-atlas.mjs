import {projectWorld} from './world-projection.mjs';
import {buildSemanticScene} from './world-semantic-scene.mjs';
import {buildLineageRoutes} from './semantic-lineage-paths.mjs';
const stages=['root','trunk','branch','leaf','flower','fruit'];
const names={root:'Roots',trunk:'Trunk',branch:'Branches',leaf:'Leaves',flower:'Flowers',fruit:'Fruits'};
const colors={root:'#f47685',trunk:'#f5d18c',branch:'#6ce5b1',leaf:'#67c8f3',flower:'#b997ff',fruit:'#f6a86c'};
const el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node};
const panel=document.getElementById('expedition-atlas');
let world,selectedStage='root',selectedId=null;
function render(){
 if(!world)return;
 const scene=buildSemanticScene(world);
 panel.replaceChildren();
 const heading=el('h3','Federation expedition atlas');panel.append(heading);
 panel.append(el('p','Explore the evidence-backed growth sequence. Stage counts describe curated records, not progress, CI health or achievements.'));
 const ribbon=el('nav');ribbon.className='atlas-ribbon';ribbon.setAttribute('aria-label','Growth expedition chapters');
 for(const stage of stages){
   const count=world.nodes.filter(n=>n.kind===stage).length;
   const button=el('button');button.type='button';button.style.setProperty('--stage',colors[stage]);button.setAttribute('aria-current',stage===selectedStage?'step':'false');
   button.append(el('strong',names[stage]),el('small',count+' documented entities'));
   button.addEventListener('click',()=>{selectedStage=stage;selectedId=null;render()});ribbon.append(button);
 }
 panel.append(ribbon);
 const layout=el('div');layout.className='atlas-layout';
 const index=el('div');index.className='atlas-index';
 const nodes=scene.nodes.filter(n=>n.kind===selectedStage);
 index.append(el('h4',names[selectedStage]+' · documented entities'));
 if(!nodes.length)index.append(el('p','No curated entities in this stage. Nothing is inferred.'));
 for(const node of nodes){
   const b=el('button');b.type='button';b.setAttribute('aria-pressed',String(node.id===selectedId));
   b.append(el('strong',node.label),el('small',node.evidence==='attested'?'Attested root lineage':'Contribution evidence incomplete'));
   b.addEventListener('click',()=>{selectedId=node.id;render()});index.append(b);
 }
 layout.append(index);
 const detail=el('article');detail.className='atlas-detail';
 const node=selectedId?scene.nodes.find(n=>n.id===selectedId):null;
 if(!node){detail.append(el('h4','Choose a documented entity'),el('p','Select an entity to reveal its contribution paths, destination and evidence gaps.'))}
 else{
   detail.append(el('h4',node.label),el('p',node.description||'No description recorded.'));
   const route=buildLineageRoutes(world,node.id);
   const label=el('p',route.routes.length+' verified root-to-entity contribution paths');detail.append(label);
   if(route.evidenceGap)detail.append(el('p',route.evidenceGap));
   if(route.outcomeGap)detail.append(el('p',route.outcomeGap));
   if(node.kind==='fruit'&&!route.outcomeUrl)detail.append(el('p','This record is not presented as a completed clickable outcome.'));
   if(route.outcomeUrl){const a=el('a','Open documented outcome');a.href=route.outcomeUrl;a.rel='noopener noreferrer';a.target='_blank';detail.append(a)}
   for(const path of route.routes){
     const group=el('section');group.className='atlas-route';
     const root=world.nodes.find(n=>n.id===path.rootId);
     group.append(el('h5','Source root: '+(root?.label||path.rootId)));
     const sequence=el('ol');
     for(const step of path.steps){const li=el('li',names[step.kind]+' · '+step.label);sequence.append(li)}
     group.append(sequence);
     for(const proof of path.attestations){const a=el('a','Review source attestation');a.href=proof.url;a.target='_blank';a.rel='noopener noreferrer';group.append(a)}
     detail.append(group);
   }
   const explore=el('button','Explore in spatial theatre');explore.type='button';
   explore.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('aift:lineage-select',{detail:{id:node.id}}));document.getElementById('scene-heading')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})});
   detail.append(explore);
 }
 layout.append(detail);panel.append(layout);
 panel.append(el('p','Curated public evidence only. No live operational assertions, XP, or inferred completion.'));
}
fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('Manifest HTTP '+r.status);return r.json()}).then(data=>{world=projectWorld(data);render()}).catch(()=>{panel.replaceChildren(el('p','Expedition atlas unavailable: curated manifest could not be loaded. No readiness inferred.'))});
