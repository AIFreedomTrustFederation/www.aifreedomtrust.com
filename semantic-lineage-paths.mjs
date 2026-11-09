/** Read-only evidence route projection. Routes are contributions only; structural edges are never proof. */
import {LAYERS} from './world-projection.mjs';
const https = value => typeof value === 'string' && /^https:\/\/[^\s/]+(?:\/[^\s]*)?$/.test(value);
export function buildLineageRoutes(world, entityId) {
 if (!world || !Array.isArray(world.nodes) || typeof world.inspect !== 'function') throw new TypeError('Projected world required');
 const target = world.nodes.find(node => node.id === entityId);
 if (!target) throw new TypeError('Unknown documented entity');
 const inspection = world.inspect(entityId);
 const byId = new Map(world.nodes.map(node => [node.id,node]));
 const routes = inspection.lineage.paths.map(path => {
   const ids = [path.root.id, ...path.edges.map(edge => edge.to)];
   const steps = ids.map(id => byId.get(id)).filter(Boolean).map(node => ({
     id:node.id, label:node.label, kind:node.kind,
     destination:https(node.url) ? node.url : null
   }));
   const attestations = path.edges.filter(edge =>
     edge.relation === 'contributes-to' && edge.status === 'source-backed' &&
     https(edge.evidenceUrl || edge.source)).map(edge => ({
       from:edge.from,to:edge.to,url:edge.evidenceUrl || edge.source
     }));
   return {rootId:path.root.id,steps,attestations,
     verified:steps.length===ids.length && attestations.length===path.edges.length};
 }).filter(route => route.verified).sort((a,b) => a.rootId.localeCompare(b.rootId));
 const isFruit = target.kind === 'fruit';
 const outcomeUrl = isFruit && https(target.url) && !/^https:\/\/github\.com(?:\/|$)/i.test(target.url) ? target.url : null;
 return {schema:'aift-lineage-routes-v1',scope:'curated-read-only',entityId,
   entityKind:target.kind,stageIndex:LAYERS.indexOf(target.kind),
   outcomeUrl, routes,
   evidenceGap:routes.length ? null : 'No attested contribution path from a repository root',
   outcomeGap:isFruit && !outcomeUrl ? 'No valid product destination' : null,
   disclaimer:'Historical curated evidence, not live CI, deployment or readiness'};
}
