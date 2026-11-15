/** Evidence quest filtering and progress without fabricated completion or live CI. */
export const QUEST_STAGES=Object.freeze(['root','trunk','branch','leaf','flower','fruit']);
export function questLens(plan,{search='',stage='',gate='all',limit=24}={}){
 if(!plan||!Array.isArray(plan.quests))throw new TypeError('Evidence quest plan required');
 if(!['all','blocked','pending','declared'].includes(gate))throw new TypeError('Unknown gate filter');
 if(stage&&!QUEST_STAGES.includes(stage))throw new TypeError('Unknown biological stage');
 const query=String(search).trim().toLocaleLowerCase();
 const all=plan.quests.filter(q=>q&&typeof q.id==='string'&&q.readiness&&Array.isArray(q.readiness.gates));
 const filtered=all.filter(q=>(!stage||q.stage===stage)&&(!query||[q.id,q.label,q.stage,...(q.rootIds||[]),...(q.checks||[])].join(' ').toLocaleLowerCase().includes(query))&&(gate==='all'||q.readiness.gates.some(g=>g.state===gate)));
 const stages=QUEST_STAGES.map(stage=>({stage,total:all.filter(q=>q.stage===stage).length,visible:filtered.filter(q=>q.stage===stage).length}));
 const gates={blocked:0,pending:0,declared:0,other:0};
 for(const q of filtered)for(const g of q.readiness.gates){if(g.state in gates)gates[g.state]++;else gates.other++}
 return {quests:filtered.slice(0,Math.max(1,Math.min(100,Number.isInteger(limit)?limit:24))),total:all.length,visible:filtered.length,stages,gates,verifiedAchievements:0,
  caveat:'Declared source relationships and readiness gates are review tasks, not completed quests or live CI assertions.'};
}
