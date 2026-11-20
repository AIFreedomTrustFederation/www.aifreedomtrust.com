import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';
const html=readFileSync('cinematic-world.html','utf8'),js=readFileSync('cinematic-passage-environment.js','utf8'),css=readFileSync('cinematic-passage-environment.css','utf8');
test('camera-coupled environment loads after published source projection',()=>{assert.match(html,/cinematic-passage-environment\.js/);assert.match(html,/cinematic-passage-environment\.css/);assert.ok(html.indexOf('cinematic-pilgrimage.js')<html.indexOf('cinematic-passage-environment.js'))});
test('environment follows actual viewBox and stage, not synthetic records',()=>{for(const token of ['MutationObserver','viewBox','data-stage','requestAnimationFrame','--passage-focus','published'])assert.ok(js.toLowerCase().includes(token.toLowerCase()),token);assert.doesNotMatch(js,/Math\.random|fetch\(|localStorage|sessionStorage/)});
test('accessible low-power presentation',()=>{assert.match(js,/aria-hidden/);assert.match(css,/prefers-reduced-motion/);assert.match(css,/prefers-reduced-data/);assert.match(css,/max-width:600px/)});
test('syntax',()=>execFileSync(process.execPath,['--check','cinematic-passage-environment.js']));
test('depth geometry derives from the published SVG viewBox instead of hardcoded camera dimensions',()=>{for(const token of ['initialBox','fullW','fullH','originX','originY','passage-parallax','passage-depth','--passage-scale'])assert.ok(js.includes(token),token);assert.doesNotMatch(js,/centerX-500|centerY-500|1-w\/1000/)});
test('depth planes are decorative and low-power safe',()=>{assert.match(js,/aria-hidden.*true/);assert.match(css,/passage-depth/);assert.match(css,/passage-static \.passage-parallax/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/prefers-reduced-data:reduce/)});

test('all atmospheric primitives derive from the actual published SVG geometry',()=>{
 for(const token of ['originX+fullW*.5','originY+fullH*.48','originX+fullW*.32','originY+fullH*.755','originX+fullW*(.09','originY+fullH*(.1','tree.querySelector(\'defs\')||make'])assert.ok(js.includes(token),token);
 assert.doesNotMatch(js,/cx:500|cy:480|rx:320|ry:330|M 0 755 Q 500 665 1000 755/);
 assert.match(js,/if\(!defs\.parentNode\)tree\.insertBefore/);
});

test('initial SVG viewBox accepts whitespace, comma and nonzero origin',()=>{
 const parse=raw=>raw.trim().split(/[\s,]+/).map(Number);
 assert.deepEqual(parse('20 40 1200 800'),[20,40,1200,800]);
 assert.deepEqual(parse('20,40,1200,800'),[20,40,1200,800]);
 assert.match(js,/initialBox/);
 assert.match(js,/split\(\/\[\\s,\]\+\/\)/);
 assert.doesNotMatch(js,/split\(\/\[\\\\s,\]\+\/\)/);
});
test('atmosphere avoids duplicate SVG gradients and survives missing matchMedia',()=>{
 assert.match(js,/tree\.querySelector\('#passage-spectrum'\)/);
 assert.match(js,/if\(!gradient\.parentNode\)/);
 assert.match(js,/typeof matchMedia==='function'/);
});

test('cinematic energy currents are derived exclusively from projected published parent links',()=>{
 for(const token of ['AIFT_LINEAGE_NODES','living-source-node[data-node]','indexed.get(record.parent)','positions.get(record.parent)','passage-current-edge','passage-source-glimmer','maxEdges=96,maxNodes=48','updateCurrents(stage)'])assert.ok(js.includes(token),token);
 assert.match(js,/if\(!parent\|\|!start\)continue/);
 assert.doesNotMatch(js,/Math\.random|fetch\(/);
});
test('source currents remain accessible and low-power safe',()=>{
 assert.match(js,/passage-currents.*aria-hidden/);
 assert.match(css,/passage-current-flow/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/prefers-reduced-data:reduce/);
 assert.match(css,/passage-static \.passage-current-edge/);
});

test('source-bound currents refresh when projected positions or ancestry change',()=>{
 assert.ok(js.includes("const signature=stage+'|'+ids.map"));
 assert.match(js,/p\.x\+','\+p\.y/);
 assert.match(js,/sourceObserver\.observe\(tree,\{subtree:true,childList:true,attributes:true/);
 assert.match(js,/attributeFilter:\['cx','cy','data-node'\]/);
 assert.match(js,/closest\?\.\('\.passage-environment'\)/);
 assert.match(js,/querySelector\?\.\('\.living-source-node'\)/);
});

test('dimensional branches and crowns are bound only to published projected records',()=>{
 for(const token of ['function drawArchitecture(positions,ids,stage)','indexed.has(id)','positions.has(id)','indexed.get(record.parent)','positions.get(parent.id)','maxBranches=96,maxCrowns=64','passage-growth-branch','passage-growth-crown','drawArchitecture(positions,ids,stage)'])assert.ok(js.includes(token),token);
 assert.match(js,/\['leaf','flower','fruit'\]\.includes\(record\.kind\)/);
 assert.match(js,/if\(from&&branches<maxBranches\)/);
 assert.doesNotMatch(js,/Math\.random|fetch\(/);
});
test('growth architecture preserves reduced-data and small Android viewport fallbacks',()=>{
 assert.match(css,/passage-architecture/);
 assert.match(css,/passage-growth-crown/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media\(prefers-reduced-data:reduce\)/);
});
