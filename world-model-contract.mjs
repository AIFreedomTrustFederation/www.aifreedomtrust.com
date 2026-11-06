import {KINDS,CONTRIBUTION_RELATIONS,MEMBERSHIP_RELATIONS,validateWorld} from './world-constellation-contract.mjs';
import {projectWorld} from './world-projection.mjs';

export {KINDS,CONTRIBUTION_RELATIONS,MEMBERSHIP_RELATIONS,validateWorld};

export function contributionRoots(model,id){
 const ids=new Set(model.nodes.map(node=>node.id));
 const edges=model.edges.filter(edge=>edge.relation!=='contributes-to'||(edge.status==='source-backed'&&/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(edge.evidenceUrl||edge.source||'')&&ids.has(edge.from)&&ids.has(edge.to)));
 const evidence=projectWorld({...model,edges}).lineage(id);
 const labels=new Map(model.nodes.map(node=>[node.id,node.label]));
 return {roots:evidence.roots,paths:evidence.paths.map(path=>[path.root.id,...path.edges.map(edge=>edge.to)].map(nodeId=>labels.get(nodeId)||nodeId))};
}

export function memberships(model,id){
 return model.edges.filter(edge=>MEMBERSHIP_RELATIONS.includes(edge.relation)&&(edge.from===id||edge.to===id));
}

export function journey(model){
 return KINDS.map(kind=>({kind,nodes:model.nodes.filter(node=>node.kind===kind),count:model.nodes.filter(node=>node.kind===kind).length}));
}

export function evidenceQuests(model){
 const checks=[
  {id:'roots',label:'Discover source roots',kind:'root',description:'Inspect a public repository and its source reference'},
  {id:'systems',label:'Explore systems',kind:'branch',description:'Examine documented architectural branches'},
  {id:'capabilities',label:'Trace a capability',kind:'leaf',description:'Find a source-backed capability'},
  {id:'outcomes',label:'Trace a real outcome',kind:'fruit',description:'Verify a fruit has a direct source-contribution path'}
 ];
 return checks.map(quest=>({...quest,candidates:model.nodes.filter(node=>node.kind===quest.kind&&(quest.kind!=='fruit'||contributionRoots(model,node.id).roots.length>0)),status:'available-for-exploration'}));
}
