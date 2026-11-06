/** Compatibility facade for the spatial explorer; the strict world-projection is authoritative.
 * No conversion of structural edges into evidence-backed contributions.
 */
import {projectWorld,LAYERS} from './world-projection.mjs';
export const KINDS=LAYERS;
export const CONTRIBUTION_RELATIONS=Object.freeze(['contributes-to']);
export const MEMBERSHIP_RELATIONS=Object.freeze(['member-of','federation-membership','organizes']);
export function validateWorld(model){
 try { projectWorld(model); return {valid:true,errors:[]}; }
 catch(error){return {valid:false,errors:[String(error.message)]};}
}
export function contributionRoots(model,id){
 const evidence=projectWorld(model).lineage(id);
 const names=new Map(model.nodes.map(node=>[node.id,node.label]));
 return {roots:evidence.roots,paths:evidence.paths.map(path=>{
  // Every path is assembled from the actual attested edges, not organizational membership.
  const ids=[path.root.id,...path.edges.map(edge=>edge.to)];
  return ids.map(nodeId=>names.get(nodeId)||nodeId);
 })};
}
