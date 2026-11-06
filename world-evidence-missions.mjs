/** Deterministic, read-only expedition itinerary. No synthetic achievements or live status. */
export function buildEvidenceMissions(world){
 const kinds=['root','trunk','branch','leaf','flower','fruit'];
 const counts=Object.fromEntries(kinds.map(kind=>[kind,world.nodes.filter(n=>n.kind===kind).length]));
 const outcomes=world.outcomes().map(({node,outcomeVerified})=>{
  const detail=world.inspect(node.id);
  const paths=detail.lineage.paths.filter(p=>p.root?.kind==='root'&&p.edges.length>0&&p.edges.every(e=>e.relation==='contributes-to'&&e.status==='source-backed'&&/^https:\/\//.test(e.evidenceUrl||e.source||'')));
  const attested=outcomeVerified===true&&paths.length>0;
  return {id:node.id,label:node.label,url:node.url,attested,roots:attested?[...new Map(paths.map(p=>[p.root.id,p.root])).values()].map(r=>({id:r.id,label:r.label,url:r.url})):[],sources:attested?[...new Set(paths.flatMap(p=>p.edges.map(e=>e.evidenceUrl||e.source)))]:[],next:attested?'Inspect the documented source path and open the delivered experience.':'Establish an explicit source-backed contributes-to chain from a repository root, with HTTPS evidence.'};
 });
 const gaps=outcomes.filter(o=>!o.attested);
 return Object.freeze({counts,outcomes,gaps,attested:outcomes.length-gaps.length,disclaimer:'Curated provenance only. No live CI, security, deployment, release readiness, XP or achievements are inferred.'});
}
