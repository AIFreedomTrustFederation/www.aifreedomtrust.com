// Shared, side-effect-free federation lineage contract for browser and Node.
export const KINDS=Object.freeze(['root','trunk','branch','leaf','flower','fruit']);
export const RELATIONS=Object.freeze(['member-of','organizes','implements','produces','documents','contributes-to']);
const contribution=new Set(['contributes-to']);
const evidence=e=>e?.status==='source-backed' && /^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(e.evidenceUrl||e.source||'');
export function validateWorldModel(graph){
 const errors=[];
 if(!graph||!Array.isArray(graph.nodes)||!Array.isArray(graph.edges))return ['nodes and edges must be arrays'];
 const ids=new Set();
 for(const n of graph.nodes){
  if(!n||typeof n.id!=='string'||!n.id||ids.has(n.id))errors.push('duplicate or invalid node ID: '+String(n?.id));
  ids.add(n?.id);
  if(!KINDS.includes(n?.kind))errors.push('invalid kind: '+String(n?.id));
  if(typeof n?.url!=='string'||!n.url.startsWith('https://'))errors.push('missing HTTPS reference: '+String(n?.id));
  if(n?.kind==='root'&&!/^https:\/\/github\.com\/AIFreedomTrustFederation\/[^/]+\/?$/.test(n.url))errors.push('root must link to an organization repository: '+n.id);
  if(n?.kind==='fruit'&&/^https:\/\/github\.com\//.test(n.url))errors.push('fruit cannot be a GitHub repository: '+n.id);
 }
 for(const e of graph.edges){
  if(!ids.has(e?.from)||!ids.has(e?.to))errors.push('dangling edge');
  if(!RELATIONS.includes(e?.relation))errors.push('unsupported relationship: '+String(e?.relation));
  if(e?.from===e?.to)errors.push('self edge');
  if(e?.relation==='contributes-to'&&(!evidence(e)))errors.push('contribution requires source-backed HTTPS evidence: '+String(e?.from));
 }
 if(errors.length)return errors;
 for(const n of graph.nodes.filter(n=>n.kind==='fruit')){
  // A documented public outcome may exist before its source contribution is attested.
  // Report the gap through lineage inspection; never fabricate a contribution edge.
 }
 return errors;
}
export function contributingRoots(graph,target){
 const nodes=new Map(graph.nodes.map(n=>[n.id,n])),found=new Set(),seen=new Set(),queue=[target];
 while(queue.length){
  const id=queue.shift();if(seen.has(id))continue;seen.add(id);
  const node=nodes.get(id);if(!node)continue;
  if(node.kind==='root'){found.add(id);continue}
  for(const e of graph.edges)if(e.to===id&&contribution.has(e.relation)&&evidence(e))queue.push(e.from);
 }
 return [...found].sort().map(id=>nodes.get(id));
}
export function lineagePaths(graph,target,maxPaths=24){
 const nodes=new Map(graph.nodes.map(n=>[n.id,n])),results=[],walk=(id,path,seen)=>{
  if(results.length>=maxPaths||seen.has(id))return;
  const node=nodes.get(id);if(!node)return;
  if(node.kind==='root'){results.push([...path,id].reverse().map(key=>nodes.get(key)));return}
  const next=new Set(seen);next.add(id);
  for(const e of graph.edges)if(e.to===id&&contribution.has(e.relation)&&evidence(e))walk(e.from,[...path,id],next);
 };
 walk(target,[],new Set());return results;
}
export function summary(graph){return Object.fromEntries(KINDS.map(kind=>[kind,graph.nodes.filter(n=>n.kind===kind).length]))}
