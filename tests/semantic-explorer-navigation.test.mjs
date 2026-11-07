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
// Discovery is a read-only index of existing published headings, not a fabricated world graph.
const {readFileSync}=await import('node:fs');
const source=readFileSync(new URL('../semantic-explorer-navigation.mjs',import.meta.url),'utf8');
const styles=readFileSync(new URL('../semantic-explorer-navigation.css',import.meta.url),'utf8');
assert.match(source,/section\.querySelectorAll\('h3,h4'\)/);
assert.match(source,/needle\.length<2/);
assert.match(source,/matches\.slice\(0,24\)/);
assert.match(source,/encodeURIComponent\(match\.node\.id\)/);
assert.match(source,/match\.node\.focus\(\{preventScroll:true\}\)/);
assert.match(styles,/explorer-discovery-hit:focus-visible/);
assert.match(styles,/@media\(max-width:600px\)/);
console.log('Unified explorer navigation, discovery and deep-link contract passed');

// Trail is bounded, reversible, keyboard operable, and never persisted.
assert.match(source,/const visited=\[\]/);
assert.match(source,/visited\.length>30/);
assert.match(source,/visited\.splice\(position\+1\)/);
assert.match(source,/trailSteps\.replaceChildren\(\)/);
assert.doesNotMatch(source,/localStorage|sessionStorage|sendBeacon/);
assert.match(styles,/\.explorer-trail button:focus-visible/);
