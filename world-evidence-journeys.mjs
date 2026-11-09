/** Evidence-backed, read-only exploration itinerary. No XP or synthetic completion. */
export const QUEST_STAGES=Object.freeze([
 {id:'source',title:'Discover a source root',kind:'root',hint:'Inspect the actual repository and its provenance'},
 {id:'system',title:'Map a documented system',kind:'branch',hint:'Trace a system without treating membership as contribution'},
 {id:'capability',title:'Explore a capability',kind:'leaf',hint:'Read the documented interface or capability'},
 {id:'outcome',title:'Verify a deliverable',kind:'fruit',hint:'Open a real outcome and inspect its attested source lineage'}
]);
export function evidenceItinerary(world){
 return QUEST_STAGES.map(stage=>{
  const candidates=world.nodes.filter(n=>n.kind===stage.kind).map(node=>{
   const detail=world.inspect(node.id);
   return {id:node.id,label:node.label,url:node.url,
    evidence:stage.kind==='root'?'repository-source':stage.kind==='fruit'?(detail.outcomeVerified?'attested-contribution':'evidence-gap'):'documented-structure',
    roots:detail.lineage.roots.map(r=>r.id)};
  });
  return {...stage,candidates,available:candidates.length>0,
   attested:candidates.filter(c=>c.evidence==='attested-contribution').length,
   status:candidates.length?'available-to-explore':'no-documented-candidate'};
 });
}
export function evidenceTrail(world,id){
 const detail=world.inspect(id);
 if(!detail)return {steps:[],gap:'Unknown entity'};
 const paths=detail.lineage.paths.map(path=>({
  root:path.root,steps:[{id:path.root.id,label:path.root.label,kind:'root'},...path.edges.map(e=>{
   const node=world.inspect(e.to)?.node;
   return {id:e.to,label:node?.label||e.to,kind:node?.kind||'unknown',evidenceUrl:e.evidenceUrl||e.source};
  })]
 }));
 return {paths,gap:paths.length?null:detail.lineage.evidenceGap};
}
