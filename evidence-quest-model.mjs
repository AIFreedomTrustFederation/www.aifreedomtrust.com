// Evidence-backed exploration objectives. These are checks, not XP or achievements.
import {STAGES,lineageRoutes,safeDestination} from './portable-dossier-theatre.mjs';
export function buildEvidenceQuests(report){
 if(!report||!Array.isArray(report.nodes)||!Array.isArray(report.edges))throw Error('A validated dossier report is required');
 const nodes=report.nodes,roots=nodes.filter(n=>n.stage==='root'),fruits=nodes.filter(n=>n.stage==='fruit');
 const routes=lineageRoutes(report,12),focus=report.focus;
 const checks=[
  {id:'roots',title:'Trace the source roots',detail:'Inspect repository provenance declared for the selected record',complete:roots.length>0,evidence:roots.map(n=>n.id)},
  {id:'lineage',title:'Follow a complete lineage',detail:'Find an explicit root-to-selection route without inferred edges',complete:routes.length>0,evidence:routes[0]||[]},
  {id:'destination',title:'Inspect the outcome',detail:'For a fruit, require a safe HTTPS product destination; other stages are not outcomes',complete:focus.stage==='fruit'&&!!safeDestination(focus.url||focus.href),evidence:focus.stage==='fruit'&&safeDestination(focus.url||focus.href)?[focus.id]:[]},
  {id:'disclosure',title:'Review evidence gaps',detail:'Inspect limitations and unverified declarations before interpreting the dossier',complete:false,evidence:report.gaps||[]}
 ];
 return {checks,stageCounts:STAGES.map(stage=>({stage,count:nodes.filter(n=>n.stage===stage).length})),fruitCount:fruits.length,verification:'Imported declarations are not independently verified',progress:checks.filter(c=>c.complete).length,total:checks.length};
}
