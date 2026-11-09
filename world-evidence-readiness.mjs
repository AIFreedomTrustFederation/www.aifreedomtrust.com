/** Read-only readiness board derived exclusively from curated evidence projection. */
export function readinessBoard(world){
 const outcomes=world.outcomes();
 return outcomes.map(entry=>{
  const detail=world.inspect(entry.node.id);
  const roots=detail.lineage.roots.map(root=>({id:root.id,label:root.label,url:root.url}));
  const attestations=detail.lineage.paths.flatMap(path=>path.edges.filter(e=>e.relation==='contributes-to'&&e.status==='source-backed'&&/^https:\/\//.test(e.evidenceUrl||e.source)).map(e=>({from:e.from,to:e.to,url:e.evidenceUrl||e.source})));
  return {id:entry.node.id,label:entry.node.label,url:entry.node.url,roots,attestations,
   readiness:entry.outcomeVerified?'source-lineage-attested':'source-lineage-unverified',
   missing:entry.outcomeVerified?[]:['No verified contribution path to a repository root'],
   note:'This is curated provenance only, not a live CI, security, release, or deployment status.'};
 });
}
