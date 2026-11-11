// Offline, bounded, directed provenance-route comparison. Never upgrades a claim to verification.
const validUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } };
export function compareEvidenceRoutes(packet, targetId, limit = 8) {
  const nodes = Array.isArray(packet?.nodes) ? packet.nodes : [];
  const edges = Array.isArray(packet?.edges) ? packet.edges : [];
  const byId = new Map(nodes.map(n => [n.id, n]));
  if (!byId.has(targetId)) return {routes: [], truncated: false, gap: 'Target absent from imported packet'};
  const incoming = new Map();
  for (const edge of edges) {
    if (!byId.has(edge?.from) || !byId.has(edge?.to)) continue;
    if (!incoming.has(edge.to)) incoming.set(edge.to, []);
    incoming.get(edge.to).push(edge);
  }
  const queue = [{id: targetId, ids: [targetId], evidence: []}], routes = [];
  let cursor = 0, truncated = false;
  while (cursor < queue.length && cursor < 5000 && routes.length < limit) {
    const current = queue[cursor++], node = byId.get(current.id);
    if (node.kind === 'root') {
      const path = [...current.ids].reverse(), links = [...current.evidence].reverse();
      routes.push({ids:path, labels:path.map(id => byId.get(id).label), evidence:links.map(e=>e.evidenceUrl), complete:links.every(e=>validUrl(e.evidenceUrl)), destination:byId.get(targetId).url || null});
      continue;
    }
    for (const edge of incoming.get(current.id) || []) {
      if (current.ids.includes(edge.from)) continue;
      queue.push({id:edge.from, ids:[...current.ids,edge.from], evidence:[...current.evidence,edge]});
    }
  }
  if (cursor < queue.length) truncated = true;
  return {routes, truncated, gap:routes.length ? null : 'No directed root-to-entity route in the imported packet'};
}
