import {KINDS,CONTRIBUTION_RELATIONS,validateWorld as validateModel} from './world-constellation-contract.mjs';
import {contributionRoots} from './world-model-contract.mjs';

export const layers=KINDS;
export const palette={root:'#56e6a8',trunk:'#f8d58b',branch:'#65d7f6',leaf:'#b58bff',flower:'#f278ce',fruit:'#ff9c6e'};
export {CONTRIBUTION_RELATIONS};

export function validateWorld(data){
 const result=validateModel(data);
 if(!result.valid)throw Error(result.errors.map(error=>{
  const normalized=error.toLowerCase();
  if(normalized.includes('fruit cannot be a github repository')||normalized.includes('repository cannot be a fruit'))return 'Repository cannot be fruit';
  if(normalized.includes('edge')||normalized.includes('relationship')||normalized.includes('contribution requires'))return 'Invalid world edge: '+error;
  return error;
 }).join('; '));
 return data;
}

export function contributingRoots(data,target){
 return contributionRoots(data,target).roots;
}

export function evidenceState(data,node){
 if(node.kind==='root')return 'Repository source';
 if(node.kind==='fruit')return contributingRoots(data,node.id).length?'Documented source path':'Source contribution not verified';
 return 'Curated architecture; not deployment proof';
}
