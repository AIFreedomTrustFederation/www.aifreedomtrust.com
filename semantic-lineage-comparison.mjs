/** Read-only dual-lineage explorer. No inferred edges, progress, or live state. */
import {projectWorld} from './world-projection.mjs';
import {buildSemanticScene} from './world-semantic-scene.mjs';
export function compareLineage(scene,leftId,rightId){
 const left=scene.nodes.find(n=>n.id===leftId),right=scene.nodes.find(n=>n.id===rightId);
 if(!left||!right)throw new TypeError('Choose two documented entities');
 const a=new Set(left.sourceRoots),b=new Set(right.sourceRoots);
 const shared=[...a].filter(id=>b.has(id)).sort();
 return {left,right,shared,onlyLeft:[...a].filter(id=>!b.has(id)).sort(),
  onlyRight:[...b].filter(id=>!a.has(id)).sort(),
  evidenceNeeded:[left,right].filter(n=>n.evidence!=='attested').map(n=>n.id),
  scope:'curated-read-only',note:'Shared roots mean documented lineage overlap, not runtime interoperability or verified product readiness'};
}
const $=id=>document.getElementById(id);
const el=(tag,value)=>{const n=document.createElement(tag);if(value!==undefined)n.textContent=value;return n};
const valid=url=>typeof url==='string'&&/^https:\/\/[^\s/]+/.test(url);
function link(parent,url,label){if(!valid(url))return;const a=el('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a)}
function buildUi(world){
 const scene=buildSemanticScene(world),selects=[$('compare-left'),$('compare-right')],out=$('comparison-result');
 for(const s of selects){s.replaceChildren();for(const n of scene.nodes){const option=el('option',n.kind.toUpperCase()+' · '+n.label);option.value=n.id;s.append(option)}}
 const outcomes=scene.nodes.filter(n=>n.kind==='fruit'&&n.destination);
 if(outcomes[0])selects[0].value=outcomes[0].id;
 if(outcomes[1])selects[1].value=outcomes[1].id;
 else if(scene.nodes.length>1)selects[1].value=scene.nodes.find(n=>n.id!==selects[0].value).id;
 const roots=new Map(scene.nodes.filter(n=>n.kind==='root').map(n=>[n.id,n]));
 function render(){
  out.replaceChildren();if(!selects.every(s=>s.value)){out.append(el('p','No documented entities available.'));return}
  const c=compareLineage(scene,selects[0].value,selects[1].value);
  out.append(el('p',c.note));
  const grid=el('div');grid.className='comparison-grid';out.append(grid);
  for(const [node,unique,heading] of [[c.left,c.onlyLeft,'First lineage'],[c.right,c.onlyRight,'Second lineage']]){
   const card=el('article');card.className='comparison-card';grid.append(card);
   card.append(el('h3',heading+' · '+node.label),el('p',node.kind.toUpperCase()+' · '+(node.evidence==='attested'?'Attested source path':'Contributing-root evidence needed')));
   if(node.kind==='fruit'&&!node.destination)card.append(el('p','Outcome destination not documented; no product link is claimed.'));
   else link(card,node.destination,'Open documented destination');
   link(card,'semantic-scene.html?entity='+encodeURIComponent(node.id),'Inspect in Living Lineage');
   card.append(el('h4','Unique contributing roots ('+unique.length+')'));
   if(!unique.length)card.append(el('p','No unique attested roots.'));
   for(const id of unique){const p=el('p',roots.get(id)?.label||id);card.append(p);link(card,roots.get(id)?.destination,'Inspect source repository')}
   card.append(el('h4','Source attestations ('+node.evidenceUrls.length+')'));
   if(!node.evidenceUrls.length)card.append(el('p','No attestation URLs recorded.'));
   node.evidenceUrls.forEach((url,i)=>link(card,url,'Source evidence '+(i+1)));
  }
  const shared=el('section');shared.className='comparison-shared';out.append(shared);
  shared.append(el('h3','Shared contributing roots ('+c.shared.length+')'));
  if(!c.shared.length)shared.append(el('p','No common attested roots are documented. This does not establish that the systems are unrelated.'));
  for(const id of c.shared){shared.append(el('p',roots.get(id)?.label||id));link(shared,roots.get(id)?.destination,'Inspect source repository')}
  if(c.evidenceNeeded.length)shared.append(el('p','Evidence gaps for '+c.evidenceNeeded.length+' selected entity or entities. Structural membership is not proof of contribution.'));
 }
 selects.forEach(s=>s.addEventListener('change',render));render();
}
if(typeof document!=='undefined'&&$('comparison-result')){
 fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json()}).then(data=>buildUi(projectWorld(data))).catch(()=>{$('comparison-result').textContent='Curated comparison unavailable. No live status inferred.'});
}
