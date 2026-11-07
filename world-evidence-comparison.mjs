/** Deterministic comparison of documented outcomes; repository roots are sources, not products. */
import {readinessBoard} from './world-evidence-readiness.mjs';

export function compareOutcomeEvidence(world, firstId, secondId){
 const outcomes=readinessBoard(world);
 const first=outcomes.find(o=>o.id===firstId),second=outcomes.find(o=>o.id===secondId);
 if(!first||!second||first.id===second.id)return {valid:false,reason:'Select two distinct documented outcomes'};
 const left=new Set(first.roots.map(r=>r.id)),right=new Set(second.roots.map(r=>r.id));
 const shared=first.roots.filter(r=>right.has(r.id));
 const uniqueFirst=first.roots.filter(r=>!right.has(r.id));
 const uniqueSecond=second.roots.filter(r=>!left.has(r.id));
 return {valid:true,first,second,shared,uniqueFirst,uniqueSecond,
  gaps:[...first.missing.map(message=>({outcomeId:first.id,message})),...second.missing.map(message=>({outcomeId:second.id,message}))],
  disclaimer:'Curated source evidence only; no live CI, release, deployment, security or achievement status.'};
}
