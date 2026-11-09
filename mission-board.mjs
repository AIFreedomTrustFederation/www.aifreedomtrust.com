// Evidence-first mission evaluation. A complete directed, HTTPS-evidenced path is
// required; disconnected or partially documented edges never imply readiness.
const safeHttps = value => {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; }
  catch { return false; }
};
export function buildMissionBoard(packet) {
  const nodes = Array.isArray(packet?.nodes) ? packet.nodes : [];
  const edges = Array.isArray(packet?.edges) ? packet.edges : [];
  const byId = new Map(nodes.filter(n => typeof n?.id === 'string').map(n => [n.id, n]));
  const incoming = new Map();
  for (const edge of edges) {
    if (!byId.has(edge?.from) || !byId.has(edge?.to) || !safeHttps(edge.evidenceUrl)) continue;
    if (!incoming.has(edge.to)) incoming.set(edge.to, []);
    incoming.get(edge.to).push(edge.from);
  }
  const cache = new Map();
  function traceable(id) {
    if (cache.has(id)) return cache.get(id);
    const visited = new Set([id]), queue = [id];
    let cursor = 0;
    while (cursor < queue.length && visited.size <= 5000) {
      const current = queue[cursor++];
      if (byId.get(current)?.kind === 'root' && current !== id) {
        cache.set(id, true); return true;
      }
      for (const parent of incoming.get(current) || []) {
        if (!visited.has(parent)) { visited.add(parent); queue.push(parent); }
      }
    }
    cache.set(id, false); return false;
  }
  const missions = [
    {id:'roots',title:'Map the source roots',description:'Inspect repository provenance and its source references.',items:nodes.filter(n=>n.kind==='root').map(n=>({node:n,ready:safeHttps(n.url),reason:'Source URL absent or invalid'}))},
    {id:'connections',title:'Trace the federation',description:'Explore directed, evidence-linked contributions.',items:nodes.filter(n=>n.kind==='branch'||n.kind==='leaf').map(n=>({node:n,ready:traceable(n.id),reason:'No complete HTTPS-evidenced directed path from a repository root'}))},
    {id:'outcomes',title:'Investigate candidate outcomes',description:'Find destinations and inspect lineage. No completion implies a verified product.',items:nodes.filter(n=>n.kind==='fruit').map(n=>({node:n,ready:safeHttps(n.url)&&traceable(n.id),reason:'Missing destination or complete HTTPS-evidenced root lineage'}))}
  ];
  return missions.map(m=>({...m,ready:m.items.filter(x=>x.ready).length,total:m.items.length,status:'Imported evidence coverage only; no achievement or live verification'}));
}
