/** Evidence-backed quest projection. No XP, persistence, or inferred live readiness. */
export function evidenceQuests(world){
 const outcomes=world.outcomes();
 return outcomes.map(entry=>{
  const detail=world.inspect(entry.node.id);
  const paths=detail.lineage.paths.filter(path=>path.root?.kind==='root'&&path.edges.length>0&&path.edges.every(edge=>edge.relation==='contributes-to'&&edge.status==='source-backed'&&/^https:\/\//.test(edge.evidenceUrl||edge.source||'')));
  const verified=paths.length>0&&entry.outcomeVerified===true;
  return Object.freeze({
   id:entry.node.id,label:entry.node.label,url:entry.node.url,
   state:verified?'evidence-attested':'evidence-needed',
   summary:verified?'A documented root-to-outcome contribution path is available.':'A verified repository-to-outcome contribution path is not established.',
   roots:verified?[...new Map(paths.map(p=>[p.root.id,{id:p.root.id,label:p.root.label,url:p.root.url}])).values()]:[],
   evidence:verified?[...new Set(paths.flatMap(p=>p.edges.map(e=>e.evidenceUrl||e.source)))]:[],
   requirement:'Document a source-backed contributes-to path with HTTPS evidence before attesting lineage.',
   caveat:'Source lineage is not live CI, security, deployment, or release readiness.'
  });
 });
}
