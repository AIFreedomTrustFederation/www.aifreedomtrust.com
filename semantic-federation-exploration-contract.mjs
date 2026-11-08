/**
 * Shared read-only exploration contract for the portal and MoBox.
 * No network, storage, telemetry or inferred provenance.
 */
export const BIOLOGICAL_STAGES=Object.freeze(['root','trunk','branch','leaf','flower','fruit']);
export const SPECTRAL_TOKENS=Object.freeze({
 red:'#f35b75',green:'#37d69b',blue:'#4b9fff',gold:'#e9bf68',
 background:'#081423',foreground:'#f6f7fb',focus:'#ffdc85'
});
const safeUrl=value=>{
 if(typeof value!=='string')return null;
 try{const u=new URL(value);return u.protocol==='https:'&&u.username===''&&u.password===''?u.href:null}catch{return null}
};
export function buildExplorationIndex(manifest){
 if(!Array.isArray(manifest?.nodes)||!Array.isArray(manifest?.edges))throw new TypeError('A curated node and edge manifest is required');
 const nodes=new Map();
 for(const node of manifest.nodes){
  if(!node||typeof node.id!=='string'||!BIOLOGICAL_STAGES.includes(node.kind)||nodes.has(node.id))throw new TypeError('Invalid or duplicate biological entity');
  nodes.set(node.id,Object.freeze({...node,url:safeUrl(node.url)}));
 }
 const contributions=new Map([...nodes.keys()].map(id=>[id,[]]));
 for(const edge of manifest.edges){
  if(!nodes.has(edge.from)||!nodes.has(edge.to))continue;
  if(edge.relation!=='contributes-to'||edge.status!=='source-backed'||!safeUrl(edge.evidenceUrl||edge.source))continue;
  contributions.get(edge.to).push(Object.freeze({from:edge.from,to:edge.to,evidenceUrl:safeUrl(edge.evidenceUrl||edge.source)}));
 }
 const lineage=id=>{
  if(!nodes.has(id))return null;
  const paths=[],seen=new Set();
  function walk(current,path){
   if(path.includes(current))return;
   const node=nodes.get(current),next=[...path,current];
   if(node.kind==='root'){paths.push(next);return}
   for(const edge of contributions.get(current))walk(edge.from,next);
  }
  walk(id,[]);
  const roots=[...new Set(paths.map(path=>path.at(-1)))].map(rootId=>nodes.get(rootId));
  return Object.freeze({entity:nodes.get(id),roots,paths:paths.map(path=>path.reverse()),evidenceGap:roots.length===0&&nodes.get(id).kind!=='root'});
 };
 const stages=BIOLOGICAL_STAGES.map(kind=>Object.freeze({kind,entities:[...nodes.values()].filter(n=>n.kind===kind)}));
 const search=(query='',kind='')=>{
  const q=String(query).trim().toLocaleLowerCase();
  return [...nodes.values()].filter(n=>(!kind||n.kind===kind)&&(!q||[n.label,n.description,n.id].some(v=>String(v||'').toLocaleLowerCase().includes(q))));
 };
 const outcomes=stages.find(s=>s.kind==='fruit').entities.map(entity=>{
  const evidence=lineage(entity.id);
  const repositoryDestination=entity.url&&/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(entity.url);
  return Object.freeze({entity,roots:evidence.roots,verified:evidence.roots.length>0&&!!entity.url&&!repositoryDestination,missingEvidence:evidence.roots.length===0||!entity.url||!!repositoryDestination});
 });
 return Object.freeze({stages,search,lineage,outcomes,inspect:id=>lineage(id),tokens:SPECTRAL_TOKENS});
}
