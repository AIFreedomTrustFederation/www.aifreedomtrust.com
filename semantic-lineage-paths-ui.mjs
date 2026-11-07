import {projectWorld} from './world-projection.mjs';
import {buildLineageRoutes} from './semantic-lineage-paths.mjs';
const host=document.getElementById('lineage-paths');
const text=(tag,value)=>{const element=document.createElement(tag);element.textContent=value;return element};
const names={root:'Roots',trunk:'Trunk',branch:'Branches',leaf:'Leaves',flower:'Flowers',fruit:'Fruits'};
let world;
function render(id){
 host.replaceChildren();
 if(!world){host.append(text('p','Curated lineage evidence is unavailable.'));return}
 if(!id){host.append(text('p','Select an entity in the constellation to explore its attested routes from repository roots.'));return}
 const node=world.nodes.find(n=>n.id===id);
 if(!node)return;
 const model=buildLineageRoutes(world,id);
 host.append(text('h3','Source-to-outcome routes · '+node.label));
 host.append(text('p',model.disclaimer));
 if(model.evidenceGap)host.append(text('p',model.evidenceGap));
 if(model.outcomeGap)host.append(text('p',model.outcomeGap));
 if(model.outcomeUrl){const a=text('a','Open verified destination');a.href=model.outcomeUrl;a.target='_blank';a.rel='noopener noreferrer';host.append(a)}
 for(const [i,route] of model.routes.entries()){
   const section=document.createElement('section');section.className='lineage-route';
   section.append(text('h4','Attested route '+(i+1)));
   const ol=document.createElement('ol');ol.className='lineage-route-steps';
   for(const step of route.steps){
     const li=document.createElement('li');li.style.setProperty('--route-stage',({
       root:'#f47685',trunk:'#f5d18c',branch:'#6ce5b1',leaf:'#67c8f3',flower:'#b997ff',fruit:'#f6a86c'
     })[step.kind]);
     const button=text('button',names[step.kind]+' · '+step.label);button.type='button';
     button.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('aift:lineage-select',{detail:{id:step.id}})));
     li.append(button);ol.append(li);
   }
   section.append(ol);
   const proofs=document.createElement('div');proofs.className='lineage-route-proofs';
   for(const [j,proof] of route.attestations.entries()){
     const a=text('a','Evidence '+(j+1));a.href=proof.url;a.target='_blank';a.rel='noopener noreferrer';proofs.append(a);
   }
   section.append(proofs);host.append(section);
 }
}
window.addEventListener('aift:lineage-selected',event=>render(event.detail?.id));
fetch('data/living-universe.json').then(response=>{if(!response.ok)throw Error('Manifest unavailable');return response.json()})
 .then(data=>{world=projectWorld(data);render(new URLSearchParams(location.search).get('entity'))})
 .catch(()=>render(null));
