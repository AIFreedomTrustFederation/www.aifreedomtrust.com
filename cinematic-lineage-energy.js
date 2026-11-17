/* Evidence-current cinematic energy: illumination follows only published SVG lineage edges. */
(()=>{'use strict';
const world=document.querySelector('.world'),tree=world?.querySelector('.tree'),nodes=window.AIFT_LINEAGE_NODES;
if(!world||!tree||!Array.isArray(nodes))return;
const allowed=new Set(nodes.filter(n=>n&&n.id).map(n=>n.id));
const layer=tree.querySelector('.living-source-layer');
if(!layer)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const dataSaver=matchMedia('(prefers-reduced-data: reduce)');
const controls=document.createElement('div');controls.className='lineage-energy-controls';
controls.setAttribute('role','group');controls.setAttribute('aria-label','Documented lineage illumination');
const toggle=document.createElement('button');toggle.type='button';
const explanation=document.createElement('p');explanation.className='lineage-energy-explanation';
explanation.textContent='Light travels only along documented source relationships. Illumination is not live system status.';
controls.append(toggle,explanation);
const inspector=document.querySelector('.living-source-inspector');
(inspector||world).append(controls);
let requested=!reduced.matches&&!dataSaver.matches;
function validEdge(edge){
 return allowed.has(edge.dataset.from)&&allowed.has(edge.dataset.to)&&
 nodes.some(n=>n.id===edge.dataset.to&&n.parent===edge.dataset.from);
}
function sync(){
 const enabled=requested&&!reduced.matches&&!dataSaver.matches;
 world.classList.toggle('lineage-energy-on',enabled);
 const edges=[...layer.querySelectorAll('.living-source-edge')];
 for(const edge of edges){
  const valid=validEdge(edge);
  edge.classList.toggle('lineage-energy-verified',valid);
  edge.classList.toggle('lineage-energy-lit',enabled&&valid&&edge.classList.contains('living-source-active'));
 }
 toggle.textContent=enabled?'Pause lineage light':'Illuminate lineage';
 toggle.setAttribute('aria-pressed',String(enabled));
 toggle.disabled=reduced.matches||dataSaver.matches;
 if(toggle.disabled)toggle.title='Static presentation follows reduced-motion or reduced-data preferences';
}
toggle.addEventListener('click',()=>{requested=!requested;sync()});
const observer=new MutationObserver(sync);
observer.observe(layer,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
reduced.addEventListener?.('change',sync);
dataSaver.addEventListener?.('change',sync);
sync();
})();