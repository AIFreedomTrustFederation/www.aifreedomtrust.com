/** Portable, read-only semantic navigation contract for portal and MoBox.
 * Consumes projectWorld output; never fetches services or infers live status.
 */
import {LAYERS} from './world-projection.mjs';
const isHttps = url => typeof url === 'string' && /^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(url);
const unique = values => [...new Set(values)].sort();
export const SCENE_SCHEMA = 'aift-semantic-scene-v1';
export function buildSemanticScene(world, options = {}) {
 if (!world || !Array.isArray(world.nodes) || typeof world.inspect !== 'function') throw new TypeError('Expected projected world');
 const selectedId = options.selectedId ?? null;
 const search = String(options.search ?? '').trim().toLocaleLowerCase();
 const layer = options.layer ?? null;
 if (layer !== null && !LAYERS.includes(layer)) throw new TypeError('Unknown biological layer');
 const all = new Map(world.nodes.map(n=>[n.id,n]));
 if (selectedId !== null && !all.has(selectedId)) throw new TypeError('Unknown selected entity');
 const visible = world.nodes.filter(n=>(!layer || n.kind===layer) && (!search || (n.label+' '+n.id+' '+(n.description||'')).toLocaleLowerCase().includes(search)));
 const nodes = visible.map(n=>{
   const inspection=world.inspect(n.id);
   const lineage=inspection.lineage;
   const roots=unique(lineage.roots.map(r=>r.id));
   const evidenceUrls=unique(lineage.paths.flatMap(p=>p.edges.map(e=>e.evidenceUrl||e.source).filter(isHttps)));
   const outcome=n.kind==='fruit';
   const destination=isHttps(n.url) && !(outcome && new URL(n.url).hostname.toLowerCase()==='github.com') ? n.url : null;
   return {id:n.id,kind:n.kind,label:n.label,description:n.description||'',destination,
     sourceRoots:roots,evidenceUrls,
     evidence:roots.length && evidenceUrls.length ? 'attested' : 'evidence-needed',
     outcome:outcome ? (destination ? 'documented-destination' : 'destination-needed') : null,
     selected:n.id===selectedId};
 });
 // Spatial positions are deterministic and purely presentational, never claimed as measured geography.
 const grouped=LAYERS.map(kind=>nodes.filter(n=>n.kind===kind));
 const positioned=grouped.flatMap((group,column)=>group.map((node,index)=>({
   ...node,position:{x:(column+0.5)/LAYERS.length,y:(index+1)/(group.length+1)}
 })));
 const visibleIds=new Set(positioned.map(n=>n.id));
 const edges=world.edges.filter(e=>visibleIds.has(e.from)&&visibleIds.has(e.to)).map(e=>({
   from:e.from,to:e.to,relation:e.relation,
   attested:e.relation==='contributes-to' && e.status==='source-backed' && isHttps(e.evidenceUrl||e.source),
   evidenceUrl:e.relation==='contributes-to' && isHttps(e.evidenceUrl||e.source) ? (e.evidenceUrl||e.source) : null
 }));
 const selected=selectedId ? world.inspect(selectedId) : null;
 const trail=selected ? selected.lineage.paths.map(p=>({
   rootId:p.root.id,rootUrl:p.root.url,
   steps:p.edges.map(e=>({from:e.from,to:e.to,evidenceUrl:e.evidenceUrl||e.source||null}))
 })) : [];
 return {schema:SCENE_SCHEMA,scope:'curated-read-only',layers:[...LAYERS],
   nodes:positioned,edges,selectedId,trail,
   minimap:{columns:LAYERS.map((kind,index)=>({kind,x:(index+0.5)/LAYERS.length,count:grouped[index].length}))},
   summary:{visible:positioned.length,evidenceNeeded:positioned.filter(n=>n.evidence==='evidence-needed').length,
     documentedOutcomes:positioned.filter(n=>n.kind==='fruit'&&n.destination).length},
   disclaimer:'Curated source evidence, not live CI, runtime health, deployment, security or achievements'};
}
export function semanticBreadcrumbs(scene,id) {
 const node=scene.nodes.find(n=>n.id===id);
 if(!node)return [];
 const rootIds=node.sourceRoots;
 return [{kind:'root',ids:rootIds},{kind:'trunk',ids:scene.nodes.filter(n=>n.kind==='trunk').map(n=>n.id)},
   {kind:node.kind,ids:[id]}].filter((step,index,array)=>step.ids.length && (index===0 || step.kind!==array[index-1].kind));
}
export function exportSemanticScene(scene) {
 return JSON.stringify({schema:SCENE_SCHEMA,scope:scene.scope,layers:scene.layers,nodes:scene.nodes,
   edges:scene.edges,trail:scene.trail,minimap:scene.minimap,summary:scene.summary,disclaimer:scene.disclaimer},null,2);
}
