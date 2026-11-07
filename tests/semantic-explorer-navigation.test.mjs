import assert from 'node:assert/strict';
import {EXPLORERS,mountExplorerNavigation,resolveExplorerIndex} from '../semantic-explorer-navigation.mjs';
assert.equal(EXPLORERS.length,7);
assert.equal(new Set(EXPLORERS.map(x=>x[0])).size,7);
assert.equal(EXPLORERS[0][0],'scene-heading');
assert.equal(mountExplorerNavigation({querySelector:()=>null,getElementById:()=>null}),false);

// Every existing heading and descendant deep link must resolve to its containing workspace.
const sections=EXPLORERS.map(([id])=>({id,contains(node){return node.parent===this;}}));
const nodes=new Map();
EXPLORERS.forEach(([id],i)=>{
 nodes.set(id,{parent:sections[i]});
 nodes.set('nested-'+i,{parent:sections[i]});
});
const doc={getElementById:id=>nodes.get(id)||null};
for(let i=0;i<EXPLORERS.length;i++){
 assert.equal(resolveExplorerIndex(doc,'#'+EXPLORERS[i][0],sections),i);
 assert.equal(resolveExplorerIndex(doc,'#nested-'+i,sections),i);
}
assert.equal(resolveExplorerIndex(doc,'#missing',sections),0);
assert.equal(resolveExplorerIndex(doc,'#%invalid',sections),0);
assert.equal(resolveExplorerIndex(doc,'',sections),0);
console.log('Unified explorer navigation and deep-link contract passed');
