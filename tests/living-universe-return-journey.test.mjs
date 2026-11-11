import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../evidence-expedition.html',import.meta.url),'utf8');
test('published evidence expedition offers reversible selected-node Tree navigation',()=>{
 assert.match(source,/id="tree-return"/);
 assert.match(source,/function syncTreeReturn\(\)/);
 assert.match(source,/publishedMode&&selected/);
 assert.match(source,/url\.searchParams\.set\('node',selected\)/);
 assert.match(source,/Explore this node in the Living Tree/);
 assert.match(source,/url\.searchParams\.set\('node',n\.id\)/);
});
test('local imported packets never place private identifiers in the Tree return link',()=>{
 assert.match(source,/packet=value;publishedMode=false;syncTreeReturn\(\)/);
 assert.match(source,/packet=source;publishedMode=true/);
 assert.match(source,/packet=null;publishedMode=false;selected=null;syncTreeReturn\(\)/);
});
test('selection refreshes return navigation without creating fabricated lineage',()=>{
 assert.match(source,/function choose\(id\)\{selected=id;syncTreeReturn\(\)/);
 assert.match(source,/if\(publishedMode&&selected\)/);
});
