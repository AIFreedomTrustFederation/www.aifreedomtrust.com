/* Living Universe 3.0: cinematic environmental controls. No telemetry, network, or invented nodes. */
(()=>{'use strict';
const world=document.querySelector('.world'),tree=world?.querySelector('.tree');
if(!world||!tree)return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),lowPower=matchMedia('(prefers-reduced-data: reduce)');
const field=document.createElement('div');field.className='world-lightfield';field.setAttribute('aria-hidden','true');
for(let i=0;i<5;i++){const ray=document.createElement('span');ray.className='world-ray';field.append(ray)}
world.insertBefore(field,tree);
const controls=document.createElement('div');controls.className='world-cinematic-controls';controls.setAttribute('role','group');controls.setAttribute('aria-label','Cinematic environment controls');
const motion=document.createElement('button'),reset=document.createElement('button'),status=document.createElement('p');
status.className='world-cinematic-status';status.setAttribute('role','status');
motion.type='button';reset.type='button';reset.textContent='Reset view';reset.setAttribute('aria-label','Restore cinematic Tree view');
controls.append(motion,reset);world.append(status,controls);
let enabled=!reduced.matches&&!lowPower.matches,px=0,py=0,targetX=0,targetY=0,frame=0;
function announce(){motion.textContent=enabled?'Atmosphere on':'Atmosphere off';motion.setAttribute('aria-pressed',String(enabled));status.textContent=enabled?'Move your pointer to explore atmospheric depth.':'Static cinematic view; all source exploration remains available.';field.hidden=!enabled;tree.style.removeProperty('transform');tree.style.setProperty('--atmosphere-x','0px');tree.style.setProperty('--atmosphere-y','0px')}
function apply(){frame=0;if(!enabled)return;px+=(targetX-px)*.075;py+=(targetY-py)*.075;tree.style.setProperty('--atmosphere-x',px.toFixed(2)+'px');tree.style.setProperty('--atmosphere-y',py.toFixed(2)+'px');if(Math.abs(targetX-px)+Math.abs(targetY-py)>.5)frame=requestAnimationFrame(apply)}
function move(event){if(!enabled||event.pointerType==='touch')return;const box=world.getBoundingClientRect();targetX=((event.clientX-box.left)/box.width-.5)*16;targetY=((event.clientY-box.top)/box.height-.5)*10;if(!frame)frame=requestAnimationFrame(apply)}
function restore(){targetX=targetY=px=py=0;cancelAnimationFrame(frame);frame=0;tree.style.setProperty('--atmosphere-x','0px');tree.style.setProperty('--atmosphere-y','0px');status.textContent='Cinematic view restored.'}
motion.addEventListener('click',()=>{enabled=!enabled;restore();announce()});
reset.addEventListener('click',restore);
world.addEventListener('pointermove',move,{passive:true});
world.addEventListener('pointerleave',()=>{if(enabled)restore()});
const change=()=>{if(reduced.matches||lowPower.matches){enabled=false;restore();announce()}};
reduced.addEventListener?.('change',change);lowPower.addEventListener?.('change',change);
document.addEventListener('visibilitychange',()=>{if(document.hidden)restore()});
announce();
})();