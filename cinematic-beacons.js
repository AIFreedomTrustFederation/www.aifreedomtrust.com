/* Living stage beacons: cinematic entrance backed exclusively by published lineage. */
(()=>{'use strict';
const world=document.querySelector('.world'),host=document.getElementById('world-beacons');
const nodes=window.AIFT_LINEAGE_NODES;
if(!world||!host)return;
if(!Array.isArray(nodes)){host.textContent='Source-backed stage navigation is unavailable.';return;}
const stages=[['root','Roots'],['trunk','Trunk'],['branch','Systems'],['leaf','Knowledge'],['flower','Emerging'],['fruit','Experiences']];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const safeLink=value=>{try{const u=new URL(value,location.href);return (u.protocol==='https:'||u.origin===location.origin)?u.href:null}catch{return null}};
const count=kind=>nodes.filter(n=>n.kind===kind).length;
const stageButtons=Array.from(document.querySelectorAll('[data-stage]'));
const camera=document.querySelector('.tree');
let active='root';
const status=document.getElementById('world-stage-status');
function choose(kind,scroll=true){
 if(!stages.some(([k])=>k===kind))return;
 active=kind;
 host.querySelectorAll('button[data-world-stage]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.worldStage===kind)));
 const matches=nodes.filter(n=>n.kind===kind);
 const first=matches[0];
 status.textContent=matches.length?kind==='fruit'?count(kind)+' documented visitor experiences; select a destination in the explorer.':count(kind)+' documented '+kind+' nodes in the published lineage.':'No documented '+kind+' nodes are published; no outcome is implied.';
 const peer=stageButtons.find(b=>b.dataset.stage===kind);
 if(peer)peer.click();
 if(scroll){document.getElementById('evidence-world')?.scrollIntoView({behavior:reduced.matches?'auto':'smooth'});}
 if(first&&kind==='fruit'&&safeLink(first.url)){const link=document.getElementById('world-destination');link.href=safeLink(first.url);link.hidden=false;link.textContent='Visit documented experience: '+first.label;}
 else document.getElementById('world-destination').hidden=true;
}
for(const [kind,label] of stages){
 const button=document.createElement('button');button.type='button';button.dataset.worldStage=kind;button.className='world-beacon world-beacon-'+kind;
 const name=document.createElement('strong');name.textContent=label;
 const number=document.createElement('small');number.textContent=count(kind)+' documented';
 button.append(name,number);button.addEventListener('click',()=>choose(kind));
 host.append(button);
}
const reset=()=>{if(camera){camera.style.removeProperty('--look-x');camera.style.removeProperty('--look-y');}};
let frame=0;
world.addEventListener('pointermove',event=>{
 if(reduced.matches||event.pointerType==='touch'||!camera)return;
 if(frame)cancelAnimationFrame(frame);
 frame=requestAnimationFrame(()=>{const r=world.getBoundingClientRect();camera.style.setProperty('--look-x',((event.clientX-r.left)/r.width-.5)*18+'px');camera.style.setProperty('--look-y',((event.clientY-r.top)/r.height-.5)*12+'px');});
},{passive:true});
world.addEventListener('pointerleave',reset);
reduced.addEventListener?.('change',reset);
choose('root',false);
})();
