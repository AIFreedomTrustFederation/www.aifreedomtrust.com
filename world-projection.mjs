/** Read-only, portable AIFT world projection. No network, status inference or telemetry. */
export const LAYERS = Object.freeze(['root','trunk','branch','leaf','flower','fruit']);
const CONTRIBUTION = new Set(['contributes-to']);
const STRUCTURE = new Set(['member-of','federation-membership','organizes','documents','produces','implements','source-lineage']);
const https = value => typeof value === 'string' && /^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(value);
export function projectWorld(manifest) {
  if (!manifest || !Array.isArray(manifest.nodes) || !Array.isArray(manifest.edges)) throw new TypeError('Invalid world manifest');
  const nodes = new Map();
  for (const node of manifest.nodes) {
    if (!node || typeof node.id !== 'string' || !LAYERS.includes(node.kind) || nodes.has(node.id) || !https(node.url)) throw new TypeError('Invalid or duplicate world node');
    if (node.kind === 'root' && !node.url.startsWith('https://github.com/')) throw new TypeError('Roots must have repository provenance');
    if (node.kind === 'fruit' && node.url.startsWith('https://github.com/')) throw new TypeError('Repository cannot be a fruit');
    nodes.set(node.id, Object.freeze({...node}));
  }
  const edges = manifest.edges.map(edge => {
    if (!nodes.has(edge.from) || !nodes.has(edge.to) || !(CONTRIBUTION.has(edge.relation) || STRUCTURE.has(edge.relation))) throw new TypeError('Invalid world relationship');
    if (CONTRIBUTION.has(edge.relation) && (edge.status !== 'source-backed' || !https(edge.evidenceUrl || edge.source))) throw new TypeError('Contribution requires source-backed HTTPS evidence');
    return Object.freeze({...edge});
  });
  const contributions = edges.filter(edge => CONTRIBUTION.has(edge.relation));
  function lineage(id) {
    if (!nodes.has(id)) return {roots:[], paths:[], evidenceGap:'Unknown entity'};
    const paths = [];
    const walk = (current, seen, trail) => {
      if (seen.has(current)) return;
      const node = nodes.get(current);
      if (node.kind === 'root') { paths.push({root:node, edges:trail}); return; }
      const next = contributions.filter(e => e.to === current);
      for (const edge of next) walk(edge.from,new Set([...seen,current]),[edge,...trail]);
    };
    walk(id,new Set(),[]);
    const roots = [...new Map(paths.map(p => [p.root.id,p.root])).values()];
    return {roots,paths,evidenceGap:roots.length ? null : 'No documented contribution path to a repository root'};
  }
  function inspect(id) {
    const node=nodes.get(id);
    if (!node) return null;
    const evidence=lineage(id);
    return {node,layer:LAYERS.indexOf(node.kind),lineage:evidence,
      relationships:edges.filter(e=>e.from===id||e.to===id),
      outcomeVerified:node.kind==='fruit' && evidence.roots.length>0};
  }
  return Object.freeze({nodes:[...nodes.values()],edges,layers:LAYERS,inspect,lineage,
    search:(term='',kind='')=>[...nodes.values()].filter(n=>(!kind||n.kind===kind)&&
      (n.label+' '+n.id+' '+(n.description||'')).toLowerCase().includes(String(term).toLowerCase())),
    outcomes:()=>[...nodes.values()].filter(n=>n.kind==='fruit').map(n=>inspect(n.id))});
}
