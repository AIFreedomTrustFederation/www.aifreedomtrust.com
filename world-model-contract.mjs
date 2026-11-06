// Shared, dependency-free world-model contract. Browser and Node ESM compatible.
// Membership is not contribution. No live health, CI or deployment claims.
export const KINDS=Object.freeze(['root','trunk','branch','leaf','flower','fruit']);
export const CONTRIBUTION_RELATIONS=Object.freeze(['contributes-to-outcome']);
export const MEMBERSHIP_RELATIONS=Object.freeze(['federation-membership','organizational-branch']);
const STRUCTURAL_RELATIONS=Object.freeze(['implements-system','implements-capability','delivers-outcome','documented-capability']);
const ALLOWED=new Set([...CONTRIBUTION_RELATIONS,...STRUCTURAL_RELATIONS,...MEMBERSHIP_RELATIONS]);
const SAFE_URL=/^https:\/\/[a-z0-9.-]+(?:[/:?#]|$)/i;
export function validateWorld(input){
 const errors=[];
 if(!input||!Array.isArray(input.nodes)||!Array.isArray(input.edges))return {valid:false,errors:['Expected nodes and edges arrays']};
 const ids=new Set();
 for(const node of input.nodes){
  if(!node||typeof node.id!=='string'||!node.id||ids.has(node.id))errors.push('Invalid or duplicate node ID');
  else ids.add(node.id);
  if(!KINDS.includes(node?.kind))errors.push('Invalid kind: '+node?.id);
  if(typeof node?.label!=='string'||!node.label.trim())errors.push('Missing label: '+node?.id);
  if(typeof node?.url!=='string'||!SAFE_URL.test(node.url))errors.push('Invalid HTTPS URL: '+node?.id);
  if(node?.kind==='root'&&!/^https:\/\/github\.com\/AIFreedomTrustFederation\/[^/]+\/?$/i.test(node.url))errors.push('Root must point to repository: '+node.id);
  if(node?.kind==='fruit'&&/^https:\/\/github\.com\//i.test(node.url))errors.push('Fruit cannot point to repository: '+node.id);
 }
 for(const edge of input.edges){
  if(!edge||!ids.has(edge.from)||!ids.has(edge.to)||edge.from===edge.to)errors.push('Invalid edge endpoints');
  if(!ALLOWED.has(edge?.relation))errors.push('Unknown relation: '+edge?.relation);
  if(edge?.evidenceUrl&&!SAFE_URL.test(edge.evidenceUrl))errors.push('Invalid evidence URL');
  if(CONTRIBUTION_RELATIONS.includes(edge?.relation)&&!SAFE_URL.test(edge?.evidenceUrl||''))errors.push('Contribution requires HTTPS evidence: '+edge?.from+' -> '+edge?.to);
 }
 return {valid:errors.length===0,errors};
}
export function contributionRoots(model,target){
 const byId=new Map(model.nodes.map(n=>[n.id,n]));
 const incoming=new Map(model.nodes.map(n=>[n.id,[]]));
 for(const edge of model.edges)if(CONTRIBUTION_RELATIONS.includes(edge.relation)&&SAFE_URL.test(edge.evidenceUrl||'')&&incoming.has(edge.to))incoming.get(edge.to).push(edge);
 const roots=new Map(),paths=[];const stack=[{id:target,path:[target]}];
 while(stack.length){
  const item=stack.pop(),node=byId.get(item.id);
  if(!node)continue;
  if(node.kind==='root'){roots.set(node.id,node);paths.push(item.path.map(id=>byId.get(id)?.label||id).reverse());continue}
  for(const edge of incoming.get(item.id)||[])if(!item.path.includes(edge.from))stack.push({id:edge.from,path:[...item.path,edge.from]});
 }
 return {roots:[...roots.values()],paths};
}
export function memberships(model,id){return model.edges.filter(e=>MEMBERSHIP_RELATIONS.includes(e.relation)&&(e.from===id||e.to===id))}
export function journey(model){
 return KINDS.map(kind=>({kind,nodes:model.nodes.filter(n=>n.kind===kind),count:model.nodes.filter(n=>n.kind===kind).length}));
}
export function evidenceQuests(model){
 const checks=[
  {id:'roots',label:'Discover source roots',kind:'root',description:'Inspect a public repository and its source reference'},
  {id:'systems',label:'Explore systems',kind:'branch',description:'Examine documented architectural branches'},
  {id:'capabilities',label:'Trace a capability',kind:'leaf',description:'Find a source-backed capability'},
  {id:'outcomes',label:'Trace a real outcome',kind:'fruit',description:'Verify a fruit has a direct source-contribution path'}
 ];
 return checks.map(q=>({...q,candidates:model.nodes.filter(n=>n.kind===q.kind&&(q.kind!=='fruit'||contributionRoots(model,n.id).roots.length>0)),status:'available-for-exploration'}));
}
