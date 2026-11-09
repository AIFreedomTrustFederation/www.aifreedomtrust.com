// Portable, read-only provenance interchange for the public portal and local MoBox.
// No runtime fetch, authentication, CI status inference, or trust elevation.
const KINDS = ['root','trunk','branch','leaf','flower','fruit'];
const URL_OK = /^https:\/\/[^\s/?#]+(?:[^\s]*)$/;
const own = (obj,key) => Object.prototype.hasOwnProperty.call(obj,key);
const safeURL = value => typeof value === 'string' && URL_OK.test(value);
const idOf = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(value);
export const LINEAGE_SCHEMA = 'aift.lineage.interchange/1';
export function exportLineageInterchange(model) {
  if (!model || !Array.isArray(model.nodes) || !Array.isArray(model.edges)) throw new TypeError('Expected nodes and edges');
  const ids = new Set();
  const nodes = model.nodes.map(node => {
    if (!idOf(node.id) || ids.has(node.id) || !KINDS.includes(node.kind) || typeof node.label !== 'string') throw new TypeError('Invalid or duplicate node');
    ids.add(node.id);
    return {id:node.id,kind:node.kind,label:node.label,url:safeURL(node.url)?node.url:null,evidence:typeof node.evidence==='string'?node.evidence:null};
  });
  const edges = model.edges.filter(edge => ids.has(edge.from) && ids.has(edge.to) && edge.relation === 'contributes-to' && edge.status === 'source-backed' && safeURL(edge.evidenceUrl)).map(edge => ({from:edge.from,to:edge.to,relation:'contributes-to',evidenceUrl:edge.evidenceUrl}));
  const adjacency = new Map();
  for (const edge of edges) { if (!adjacency.has(edge.from)) adjacency.set(edge.from,[]); adjacency.get(edge.from).push(edge.to); }
  const roots = nodes.filter(node=>node.kind==='root').map(node=>node.id);
  const reachable = new Set(roots);
  const queue = [...roots];
  while(queue.length) {const from=queue.shift();for(const to of adjacency.get(from)||[])if(!reachable.has(to)){reachable.add(to);queue.push(to);}}
  // A fruit is a destination, never a repository. Product links are candidates,
  // not independently verified live deployment or successful CI attestations.
  const outcomes = nodes.filter(node=>node.kind==='fruit' && reachable.has(node.id) && safeURL(node.url) && !node.url.includes('/github.com/')).map(node=>({id:node.id,url:node.url,verification:'source-lineage-only'}));
  return {schema:LINEAGE_SCHEMA,sourceStatus:'curated-source-map',attestation:'not-independently-verified',nodes,edges,outcomes};
}
export function inspectLineageInterchange(value) {
  if (!value || value.schema!==LINEAGE_SCHEMA || !Array.isArray(value.nodes) || !Array.isArray(value.edges)) return {valid:false,reason:'schema'};
  try {
    const normalized=exportLineageInterchange(value);
    // Imported interchange must never be upgraded to verified status by a consumer.
    return {valid:true,roots:normalized.nodes.filter(n=>n.kind==='root').length,sourceEdges:normalized.edges.length,attestation:'not-independently-verified'};
  } catch {return {valid:false,reason:'nodes'};}
}
