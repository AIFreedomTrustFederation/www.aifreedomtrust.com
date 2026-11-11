// Read-only bridge from the published curated source map to the portable MoBox packet.
// Curated/implements/produces edges are NOT upgraded to source-backed attestations.
import {exportLineageInterchange,inspectLineageInterchange} from './world-lineage-interchange.mjs';
export function preparePublishedExpedition(manifest) {
  if (!manifest || manifest.status !== 'curated-source-map' || !Array.isArray(manifest.nodes) || !Array.isArray(manifest.edges))
    throw new TypeError('Expected a curated-source-map manifest');
  const packet=exportLineageInterchange(manifest);
  const inspection=inspectLineageInterchange(packet);
  if (!inspection.valid) throw new TypeError('Invalid exported lineage packet: '+inspection.reason);
  const unsupported=manifest.edges.filter(e=>e.status!=='source-backed'||e.relation!=='contributes-to'||!e.evidenceUrl);
  return {packet,report:{
    sourceNodes:manifest.nodes.length,
    sourceRelationships:manifest.edges.length,
    portableEvidenceEdges:packet.edges.length,
    curatedOnlyRelationships:unsupported.length,
    candidateOutcomes:packet.outcomes.length,
    warning:unsupported.length?'Curated relationships are visible in the published atlas but are not independently attested contribution edges. No missing lineage has been fabricated.':'Source-backed contribution edges were exported; deployment and CI are still unverified.'
  }};
}
