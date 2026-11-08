/**
 * Read-only projection bridge for a MoBox /v1/federation/tree snapshot.
 * The local projection is NOT the curated public manifest. Membership is
 * observational, not a source-backed contribution or product attestation.
 * This module performs no fetches, writes, execution or telemetry.
 */
import {BIOLOGICAL_STAGES,SPECTRAL_TOKENS,buildExplorationIndex} from './semantic-federation-exploration-contract.mjs';

const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const clean=value=>String(value??'').trim();
const normalizeRepo=value=>{
 const raw=clean(value);
 if(!raw)return null;
 const match=raw.match(/^(?:https:\/\/github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i);
 if(!match)return null;
 return {id:`repo:${match[1].toLowerCase()}/${match[2].toLowerCase()}`,label:`${match[1]}/${match[2]}`,url:`https://github.com/${match[1]}/${match[2]}`};
};
const array=value=>Array.isArray(value)?value:[];
/** Explicitly observed local data only; unknown shapes fail closed. */
export function projectLocalFederationTree(snapshot){
 if(!snapshot||typeof snapshot!=='object'||Array.isArray(snapshot))throw new TypeError('Local federation snapshot required');
 const records=array(snapshot.repositories);
 const nodes=[{id:'federation:local',kind:'trunk',label:'AIFT federation',description:'Local observed federation context; not a verified contribution edge'}];
 const seen=new Set(nodes.map(n=>n.id));
 const diagnostics=[];
 for(const item of records){
  const raw=typeof item==='string'?item:clean(item?.full_name||item?.name||item?.repository);
  const repo=normalizeRepo(raw);
  if(!repo){diagnostics.push('Unrecognized repository identifier omitted');continue}
  if(seen.has(repo.id))continue;
  seen.add(repo.id);
  nodes.push({...repo,kind:'root',description:'Observed local repository; contribution and runtime readiness unverified'});
  for(const feature of array(item?.capabilities)){
   const label=clean(typeof feature==='string'?feature:feature?.name);
   if(!label)continue;
   const id=`local-capability:${repo.id}:${encodeURIComponent(label)}`;
   if(seen.has(id))continue;
   seen.add(id);
   nodes.push({id,kind:'leaf',label,description:'Locally reported capability; no attested contribution or outcome claimed'});
  }
 }
 return Object.freeze({nodes,edges:[],diagnostics,source:'local-observation',attestation:'none',schemaVersion:1});
}
/** UI-safe view: source-backed paths remain empty until independently attested. */
export function localExploration(snapshot){
 const projection=projectLocalFederationTree(snapshot);
 const index=buildExplorationIndex(projection);
 return Object.freeze({
  projection,index,stages:BIOLOGICAL_STAGES,tokens:SPECTRAL_TOKENS,
  summary:Object.freeze({repositories:index.search('','root').length,capabilities:index.search('','leaf').length,verifiedFruits:0}),
  search:(query,stage)=>index.search(query,stage),
  inspect:id=>index.inspect(id)
 });
}
