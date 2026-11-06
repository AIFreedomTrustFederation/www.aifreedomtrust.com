/* Shared read-only world contract. No telemetry, credentials, or inferred provenance. */
export const layers=['root','trunk','branch','leaf','flower','fruit'];
export const palette={root:'#56e6a8',trunk:'#f8d58b',branch:'#65d7f6',leaf:'#b58bff',flower:'#f278ce',fruit:'#ff9c6e'};
export function validateWorld(data){
 if(!data||!Array.isArray(data.nodes)||!Array.isArray(data.edges))throw Error('Invalid world shape');
 const ids=new Set();
 for(const n of data.nodes){
  if(!n||typeof n.id!=='string'||ids.has(n.id)||!layers.includes(n.kind)||typeof n.label!=='string'||!/^https:\/\//.test(n.url||''))throw Error('Invalid world node');
  if(n.kind==='root'&&!/^https:\/\/github\.com\/AIFreedomTrustFederation\/[^/]+$/.test(n.url))throw Error('Root must be a repository');
  if(n.kind==='fruit'&&/github\.com\/AIFreedomTrustFederation\//.test(n.url))throw Error('Repository cannot be fruit');
  ids.add(n.id);
 }
 for(const e of data.edges)if(!ids.has(e.from)||!ids.has(e.to)||!['member-of','organizes','documents','contributes-to'].includes(e.relation))throw Error('Invalid world edge');
 return data;
}
export function contributingRoots(data,target){
 const byId=new Map(data.nodes.map(n=>[n.id,n])),roots=new Set(),visited=new Set(),queue=[target];
 while(queue.length){
  const id=queue.shift();if(visited.has(id))continue;visited.add(id);
  const n=byId.get(id);if(n?.kind==='root'){roots.add(id);continue}
  for(const e of data.edges)if(e.to===id&&e.relation==='contributes-to'&&e.evidenceUrl?.startsWith('https://'))queue.push(e.from);
 }
 return [...roots].map(id=>byId.get(id));
}
export function evidenceState(data,node){
 if(node.kind==='root')return 'Repository source';
 if(node.kind==='fruit')return contributingRoots(data,node.id).length?'Documented source path':'Source contribution not verified';
 return 'Curated architecture; not deployment proof';
}
