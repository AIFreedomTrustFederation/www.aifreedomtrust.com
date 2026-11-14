// Read-only, bounded companion to AIFT-OS living-universe-dossier.mjs v1.
export const KIND='aift-living-universe-dossier';
export const STAGES=['root','trunk','branch','leaf','flower','fruit'];
const allowed=new Set(STAGES);
export function inspectDossier(input){
 if(!input||input.kind!==KIND||input.schemaVersion!=='1.0.0')throw Error('Unsupported dossier kind or version');
 if(!Array.isArray(input.nodes)||!Array.isArray(input.edges)||input.nodes.length>350||input.edges.length>1200)throw Error('Dossier exceeds supported graph limits');
 const ids=new Set(),byId=new Map();
 for(const n of input.nodes){
  if(!n||typeof n.id!=='string'||!n.id||ids.has(n.id)||!allowed.has(n.stage))throw Error('Invalid or duplicate biological record');
  ids.add(n.id);byId.set(n.id,n);
 }
 if(!ids.has(input.focusId))throw Error('Selected record is absent');
 const parents=new Map(),gaps=[];
 for(const e of input.edges){
  if(!e||!ids.has(e.from)||!ids.has(e.to))throw Error('Undeclared relationship');
  if(!parents.has(e.to))parents.set(e.to,[]);
  parents.get(e.to).push(e.from);
  if(STAGES.indexOf(byId.get(e.from).stage)>=STAGES.indexOf(byId.get(e.to).stage))gaps.push('Nonprogressive relationship: '+e.from+' → '+e.to);
 }
 const seen=new Set(),stack=[input.focusId];
 while(stack.length){const id=stack.pop();if(seen.has(id))continue;seen.add(id);stack.push(...(parents.get(id)||[]))}
 const nodes=input.nodes.filter(n=>seen.has(n.id));
 const roots=nodes.filter(n=>n.stage==='root');
 const focus=byId.get(input.focusId);
 if(!roots.length)gaps.push('No contributing repository root is declared');
 if(focus.stage==='fruit'&&!safeDestination(focus.url||focus.href))gaps.push('Fruit has no independently inspectable product destination');
 if(input.provenance?.verification!=='independently-verified')gaps.push('Imported declarations are not independently verified');
 return {focus,nodes,roots,gaps,edges:input.edges.filter(e=>seen.has(e.from)&&seen.has(e.to)),verification:'Imported declaration only'};
}
export function safeDestination(value){
 if(typeof value!=='string')return null;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}
}

/** Deterministic, bounded, cycle-safe declared root-to-focus routes. No inferred links. */
export function lineageRoutes(report,limit=12){
 const byId=new Map(report.nodes.map(n=>[n.id,n]));
 const parents=new Map();
 for(const edge of report.edges){if(!parents.has(edge.to))parents.set(edge.to,[]);parents.get(edge.to).push(edge.from)}
 const routes=[],queue=[[report.focus.id]],max=Math.min(12,Math.max(1,limit));
 while(queue.length&&routes.length<max){
  const path=queue.shift(),current=path[0],node=byId.get(current);
  if(!node)continue;
  if(node.stage==='root'){routes.push(path);continue}
  for(const parent of (parents.get(current)||[]).sort()){
   if(!path.includes(parent)&&path.length<30)queue.push([parent,...path]);
  }
  if(queue.length>2000)break;
 }
 return routes;
}
export function stageCounts(report){return STAGES.map(stage=>({stage,count:report.nodes.filter(n=>n.stage===stage).length}))}

/** A URL source ID is navigation context only, never evidence or an attestation. */
export function resolveHandoff(report,sourceId){
 if(typeof sourceId!=='string'||!sourceId||sourceId.length>256)return {status:'none',record:null};
 if(!report)return {status:'awaiting-file',record:null};
 const record=report.nodes.find(n=>n.id===sourceId)||null;
 return {status:record?'matched':'missing',record};
}

/**
 * Adapt the actual AIFT-OS portableDossier v1 export. Routes are explicit
 * declared record sequences; never infer missing connections or verification.
 */
export function normalizeOperatorDossier(packet){
 if(!packet||packet.schema!=='aift.living-universe.lineage-dossier.v1')return packet;
 if(!Array.isArray(packet.records)||!Array.isArray(packet.routes)||packet.records.length>350||packet.routes.length>1200)throw Error('Unsupported operator dossier limits');
 const nodes=packet.records.map(r=>{
  if(!r||typeof r.id!=='string'||typeof r.label!=='string'||!allowed.has(r.stage))throw Error('Invalid operator dossier record');
  return {id:r.id,label:r.label,stage:r.stage,url:r.destination||null,status:r.status||null};
 });
 const ids=new Set(nodes.map(n=>n.id)),edges=[],seen=new Set();
 for(const route of packet.routes){
  if(!route||!Array.isArray(route.ids)||route.ids.length>350)throw Error('Invalid operator route');
  for(let i=1;i<route.ids.length;i++){
   const from=route.ids[i-1],to=route.ids[i];
   if(!ids.has(from)||!ids.has(to))throw Error('Operator route references absent record');
   const key=JSON.stringify([from,to]);
   if(!seen.has(key)){seen.add(key);edges.push({from,to})}
   if(edges.length>1200)throw Error('Operator route exceeds relationship limit');
  }
 }
 if(!ids.has(packet.subject))throw Error('Operator subject is absent');
 return {kind:KIND,schemaVersion:'1.0.0',focusId:packet.subject,nodes,edges,
  provenance:{verification:'imported-declarations-unverified'},
  evidenceGaps:Array.isArray(packet.evidenceGaps)?packet.evidenceGaps:[],
  routeDisplayTruncated:packet.routeDisplayTruncated===true};
}
