/** Guided evidence voyage. Read-only curated manifest; no runtime/achievement inference. */
import {projectWorld} from './world-projection.mjs';
import {buildSemanticScene} from './world-semantic-scene.mjs';
export const STAGES=Object.freeze(['root','trunk','branch','leaf','flower','fruit']);
export function buildVoyage(world){
 const scene=buildSemanticScene(world);
 return STAGES.map((kind,index)=>{
  const nodes=scene.nodes.filter(n=>n.kind===kind);
  return {kind,index,total:nodes.length,attested:nodes.filter(n=>n.evidence==='attested').length,
   evidenceNeeded:nodes.filter(n=>n.evidence!=='attested').length,
   nodes:nodes.map(n=>({id:n.id,label:n.label,description:n.description,evidence:n.evidence,
    roots:n.sourceRoots,proofs:n.evidenceUrls,
    destination:kind==='fruit'?n.destination:null}))};
 });
}
export function renderVoyage(root,world){
 const doc=root.ownerDocument,chapters=buildVoyage(world),make=(tag,value)=>{
  const e=doc.createElement(tag);if(value!==undefined)e.textContent=value;return e;
 };
 let current=0,query='';
 const nav=make('nav');nav.className='voyage-chapters';nav.setAttribute('aria-label','Growth voyage chapters');
 const main=make('div');main.className='voyage-stage';const status=make('p');status.setAttribute('role','status');
 const search=make('input');search.type='search';search.placeholder='Search this growth chapter';search.setAttribute('aria-label','Search voyage chapter');
 const controls=make('div');controls.className='voyage-controls';
 const prev=make('button','Previous stage'),next=make('button','Next stage');prev.type=next.type='button';
 controls.append(prev,search,next);root.replaceChildren(nav,controls,status,main);
 const safeLink=(url,label,parent)=>{if(typeof url!=='string'||!/^https:\/\/[^\s/]+/.test(url))return;
  const a=make('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';parent.append(a)};
 const jump=id=>doc.defaultView?.dispatchEvent(new doc.defaultView.CustomEvent('aift:lineage-select',{detail:{id}}));
 function draw(){
  const chapter=chapters[current];nav.replaceChildren();
  for(const c of chapters){const b=make('button',c.kind+' · '+c.total);b.type='button';b.setAttribute('aria-current',String(c.index===current));b.onclick=()=>{current=c.index;search.value='';query='';draw()};nav.append(b)}
  prev.disabled=current===0;next.disabled=current===chapters.length-1;
  status.textContent=(current+1)+' of 6 · '+chapter.kind+' · '+chapter.total+' curated entities · '+chapter.attested+' with attested root paths · '+chapter.evidenceNeeded+' needing evidence. Not live status.';
  main.replaceChildren();
  const title=make('h3',chapter.kind==='root'?'The source roots':chapter.kind==='fruit'?'Documented outcomes':chapter.kind+' of emergence');
  const description=make('p',chapter.kind==='root'?'Repositories nourish the federation; they are never fruits.':chapter.kind==='fruit'?'Only documented user-facing destinations appear here. No repository is a fruit.':'Inspect real curated entities and the evidence that connects them to source roots.');
  main.append(title,description);
  const matches=chapter.nodes.filter(n=>(n.label+' '+n.description).toLowerCase().includes(query));
  if(!matches.length)main.append(make('p','No curated entities match this chapter search.'));
  const grid=make('div');grid.className='voyage-grid';main.append(grid);
  for(const n of matches){
   const card=make('article');card.className='voyage-card';card.dataset.stage=chapter.kind;
   card.append(make('h4',n.label),make('p',n.description||'No description recorded.'));
   const evidence=make('p',n.evidence==='attested'?'Attested contributing-root path':'Evidence gap: no complete attested contributing-root path');
   evidence.className='voyage-evidence';card.append(evidence);
   const button=make('button','Explore lineage in constellation');button.type='button';button.onclick=()=>{jump(n.id);doc.getElementById('scene-heading')?.scrollIntoView({behavior:'auto'})};card.append(button);
   if(n.roots.length)card.append(make('p','Contributing roots: '+n.roots.length));
   for(const [i,url] of n.proofs.entries())safeLink(url,'Attestation '+(i+1),card);
   if(chapter.kind==='fruit'){
    if(n.destination)safeLink(n.destination,'Open documented outcome',card);
    else card.append(make('p','No verified destination; outcome cannot be opened.'));
   }
   grid.append(card);
  }
 }
 prev.onclick=()=>{if(current>0){current--;draw()}};
 next.onclick=()=>{if(current<5){current++;draw()}};
 search.oninput=()=>{query=search.value.trim().toLowerCase();draw()};
 draw();
}
if(typeof document!=='undefined'){
 const root=document.getElementById('growth-voyage');
 if(root)fetch('data/living-universe.json').then(r=>{if(!r.ok)throw Error('Manifest unavailable');return r.json()})
 .then(data=>renderVoyage(root,projectWorld(data)))
 .catch(()=>root.replaceChildren(Object.assign(document.createElement('p'),{textContent:'Curated voyage unavailable; no operational status inferred.'})));
}
