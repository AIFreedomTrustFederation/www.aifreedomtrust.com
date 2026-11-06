import {validateWorldModel,contributingRoots,lineagePaths} from './world-model.mjs';
const root=document.getElementById('provenance-lab');
if(root){
 const status=document.getElementById('provenance-status'),list=document.getElementById('provenance-paths'),chooser=document.getElementById('provenance-target'),source=document.getElementById('provenance-source');
 const render=(graph,id)=>{
  const node=graph.nodes.find(n=>n.id===id);list.replaceChildren();if(!node)return;
  source.href=node.url;source.textContent=node.kind==='fruit'?'Open verified public experience':'Open source reference';
  const roots=contributingRoots(graph,id),paths=lineagePaths(graph,id);
  status.textContent=roots.length?roots.length+' explicitly contributing source root(s) · '+paths.length+' documented lineage path(s)':'No explicit contributing source path established. Organizational membership is not proof of contribution.';
  if(!paths.length){const p=document.createElement('p');p.textContent='No source-contribution path is recorded for this item. Its architecture may still be documented.';list.append(p);return}
  for(const path of paths){
   const ol=document.createElement('ol');ol.className='provenance-chain';
   for(const item of path){const li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=item.label;small.textContent=' '+item.kind;li.append(a,small);ol.append(li)}
   list.append(ol);
  }
 };
 try{
  const response=await fetch('data/living-universe.json',{cache:'no-store'});if(!response.ok)throw Error('manifest HTTP '+response.status);
  const graph=await response.json(),errors=validateWorldModel(graph);if(errors.length)throw Error(errors.slice(0,3).join('; '));
  for(const node of graph.nodes){const option=document.createElement('option');option.value=node.id;option.textContent=node.kind+' · '+node.label;chooser.append(option)}
  chooser.addEventListener('change',()=>render(graph,chooser.value));
  const fruit=graph.nodes.find(n=>n.kind==='fruit');chooser.value=fruit?.id||graph.nodes[0]?.id;render(graph,chooser.value);
 }catch(error){status.textContent='Provenance inspector unavailable: '+error.message}
}
