'use strict';
const stages={
root:['01 · THE SOURCE','Roots nourish the entire world.','Repositories and verifiable source systems belong beneath the tree. Follow their documented relationships without confusing codebases with completed experiences.','root-lineage.html','Inspect source roots'],
trunk:['02 · THE FEDERATION','One shared trunk connects the roots.','The integrated federation brings distinct source systems into a common structure. Organizational membership is not evidence of product contribution.','living-universe-explorer.html','Explore the federation'],
branch:['03 · THE SYSTEMS','Branches carry real capabilities.','Systems and subsystems grow from documented relationships. Follow each branch back to the source that supports it.','living-universe.html','Inspect documented systems'],
leaf:['04 · THE KNOWLEDGE','Leaves make the work discoverable.','Features, interfaces, knowledge and operational functions appear as leaves when they are documented. Their evidence stays inspectable.','living-universe-explorer.html','Explore capabilities'],
flower:['05 · EMERGING WORK','Flowers signal grounded emergence.','Emerging integrations and work in progress are flowers only when backed by published evidence. Absence of evidence is not an achievement.','living-universe.html','Inspect emerging work'],
fruit:['06 · REAL OUTCOMES','Fruit is an experience, never a repository.','Only demonstrated public-facing outcomes belong here. Open the existing evidence map to inspect real destinations and their source-to-outcome lineage.','living-universe.html','Find verified outcomes']};
const buttons=[...document.querySelectorAll('[data-stage]')];
function selectStage(key){const data=stages[key];if(!data)return;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stage===key)));document.getElementById('stage-kicker').textContent=data[0];document.getElementById('stage-title').textContent=data[1];document.getElementById('stage-description').textContent=data[2];const link=document.getElementById('stage-link');link.href=data[3];link.textContent=data[4];}
buttons.forEach(b=>b.addEventListener('click',()=>selectStage(b.dataset.stage)));
