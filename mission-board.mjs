// Evidence-first constellation mission board. No persistence, network, or inferred attestations.
export function buildMissionBoard(packet) {
  const nodes = Array.isArray(packet?.nodes) ? packet.nodes : [];
  const edges = Array.isArray(packet?.edges) ? packet.edges : [];
  const byId = new Map(nodes.map(n => [n.id, n]));
  const incoming = new Map();
  for (const edge of edges) {
    if (!byId.has(edge.from) || !byId.has(edge.to)) continue;
    if (!incoming.has(edge.to)) incoming.set(edge.to, []);
    incoming.get(edge.to).push(edge);
  }
  function trace(id) {
    const visited = new Set([id]), queue = [id], links = [];
    while (queue.length && visited.size <= 5000) {
      const current = queue.shift();
      for (const edge of incoming.get(current) || []) {
        links.push(edge);
        if (!visited.has(edge.from)) { visited.add(edge.from); queue.push(edge.from); }
      }
    }
    return {roots: [...visited].map(k => byId.get(k)).filter(n => n?.kind === 'root'), links};
  }
  const missions = [
    {id:'roots',title:'Map the source roots',description:'Inspect repository provenance and its source references.',items:nodes.filter(n=>n.kind==='root').map(n=>({node:n,ready:validUrl(n.url),reason:'Source URL absent or invalid'}))},
    {id:'connections',title:'Trace the federation',description:'Explore directed, evidence-linked contributions.',items:nodes.filter(n=>n.kind==='branch'||n.kind==='leaf').map(n=>({node:n,ready:trace(n.id).roots.length>0 && trace(n.id).links.some(e=>validUrl(e.evidenceUrl)),reason:'No documented root route with HTTPS contribution evidence'}))},
    {id:'outcomes',title:'Investigate candidate outcomes',description:'Find destinations and inspect lineage. No completion implies a verified product.',items:nodes.filter(n=>n.kind==='fruit').map(n=>({node:n,ready:validUrl(n.url)&&trace(n.id).roots.length>0&&trace(n.id).links.some(e=>validUrl(e.evidenceUrl)),reason:'Missing destination or documented root lineage'}))}
  ];
  return missions.map(m=>({...m,ready:m.items.filter(x=>x.ready).length,total:m.items.length,status:'Imported evidence coverage only; no achievement or live verification'}));
}
function validUrl(value) {try {const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}
