/** Deterministic, read-only topology for the Evidence Atlas. No inferred contributions. */
import {LAYERS} from './world-projection.mjs';
export function evidenceTopology(world, selectedId, {maxNodes=80}={}) {
 const selected=world.inspect(selectedId);
 if(!selected)return {nodes:[],edges:[],gap:'Select a documented entity'};
 const ids=new Set([selectedId]);
 for(const e of selected.relationships){ids.add(e.from);ids.add(e.to)}
 for(const path of selected.lineage.paths){ids.add(path.root.id);for(const e of path.edges){ids.add(e.from);ids.add(e.to)}}
 const nodes=world.nodes.filter(n=>ids.has(n.id)).sort((a,b)=>LAYERS.indexOf(a.kind)-LAYERS.indexOf(b.kind)||a.id.localeCompare(b.id)).slice(0,maxNodes);
 const visible=new Set(nodes.map(n=>n.id));
 const edges=world.edges.filter(e=>visible.has(e.from)&&visible.has(e.to)).map(e=>({
  ...e,attested:e.relation==='contributes-to'&&e.status==='source-backed'&&/^https:\/\//.test(e.evidenceUrl||e.source||'')
 }));
 return {nodes,edges,gap:selected.lineage.evidenceGap,selectedId,omitted:ids.size-nodes.length};
}
export function topologyPositions(topology) {
 const grouped=new Map(LAYERS.map(k=>[k,[]]));
 for(const node of topology.nodes)grouped.get(node.kind).push(node);
 const positions=new Map();
 for(let col=0;col<LAYERS.length;col++){
  const nodes=grouped.get(LAYERS[col]);
  nodes.forEach((node,i)=>positions.set(node.id,{x:92+col*170,y:64+(i+1)*Math.min(92,440/(nodes.length+1))}));
 }
 return positions;
}
