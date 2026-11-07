/** Evidence-first mission planning: curated provenance only, never live CI or readiness. */
import {LAYERS} from './world-projection.mjs';
const STAGES=LAYERS.filter(kind=>kind!=='root'&&kind!=='trunk');
const validUrl=url=>typeof url==='string'&&/^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(url);
export function buildEvidenceMissions(world){
 const byId=new Map(world.nodes.map(node=>[node.id,node]));
 return world.nodes.filter(node=>STAGES.includes(node.kind)).map(node=>{
  const inspection=world.inspect(node.id),lineage=inspection.lineage;
  const rootIds=[...new Set(lineage.roots.map(root=>root.id))].sort();
  const evidence=[...new Set(lineage.paths.flatMap(path=>path.edges.map(edge=>edge.evidenceUrl||edge.source).filter(validUrl)))].sort();
  const steps=[
   {id:'document-entity',label:'Inspect documented entity',state:'documented',url:node.url},
   {id:'trace-roots',label:'Trace repository roots',state:rootIds.length?'evidence-present':'evidence-needed',rootIds},
   {id:'inspect-attestations',label:'Inspect source-backed contribution evidence',state:evidence.length?'evidence-present':'evidence-needed',evidenceUrls:evidence},
  ];
  if(node.kind==='fruit')steps.push({id:'open-outcome',label:'Open real user-facing outcome',state:validUrl(node.url)&&!node.url.startsWith('https://github.com/')?'documented':'evidence-needed',url:node.url});
  const structural=inspection.relationships.filter(edge=>edge.relation!=='contributes-to').map(edge=>({
   relation:edge.relation,otherId:edge.from===node.id?edge.to:edge.from,otherLabel:byId.get(edge.from===node.id?edge.to:edge.from)?.label||'Unknown'
  }));
  return {id:node.id,label:node.label,kind:node.kind,url:node.url,rootIds,evidence,structural,
   steps,openSteps:steps.filter(step=>step.state==='evidence-needed').length,
   disclaimer:'Curated source lineage only; not live CI, deployment, security, or product readiness'};
 }).sort((a,b)=>STAGES.indexOf(a.kind)-STAGES.indexOf(b.kind)||a.label.localeCompare(b.label));
}
export function exportEvidenceMissions(missions){
 return JSON.stringify({schema:'aift-evidence-missions-v1',scope:'curated-offline-projection',
  disclaimer:'Not live CI, deployment, security, achievement or product readiness',
  missions:missions.map(({id,kind,rootIds,evidence,steps})=>({id,kind,rootIds,evidenceUrls:evidence,
   steps:steps.map(({id,state})=>({id,state}))}))},null,2);
}
