import assert from 'node:assert/strict';
import {EXPLORERS,mountExplorerNavigation} from '../semantic-explorer-navigation.mjs';
assert.equal(EXPLORERS.length,7);
assert.equal(new Set(EXPLORERS.map(x=>x[0])).size,7);
assert.equal(EXPLORERS[0][0],'scene-heading');
assert.equal(mountExplorerNavigation({querySelector:()=>null,getElementById:()=>null}),false);
console.log('Unified explorer navigation contract passed');
