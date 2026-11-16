import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('cinematic world retains real HTML navigation and accessible stages',()=>{const html=read('cinematic-world.html');for(const p of ['index.html','living-universe.html','living-universe-explorer.html','root-lineage.html','constellations.html','pages.html'])assert.ok(html.includes(p),p);for(const s of ['root','trunk','branch','leaf','flower','fruit'])assert.match(html,new RegExp('data-stage="'+s+'"'));assert.match(html,/aria-pressed="true"/);assert.match(html,/Skip cinematic environment/);});
test('existing home retains published content and exposes cinematic entrance',()=>{const home=read('index.html');assert.match(home,/href="cinematic-world.html"/);assert.match(home,/id="tree-explorer"/);assert.match(home,/id="fruit-atlas"/);});
test('semantic evidence does not invent a fruit or XP',()=>{const js=read('cinematic-world.js');assert.match(js,/never a repository/);assert.match(js,/published evidence/);assert.doesNotMatch(js,/\bXP\b|fake score|mock achievement/i);});
test('responsive and reduced-motion support',()=>{const css=read('cinematic-world.css');assert.match(css,/@media\(max-width:440px\)/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/focus-visible/);});

test('cinematic constellation is backed by the shared read-only lineage contract',()=>{const html=read('cinematic-world.html'),js=read('cinematic-explorer.js');for(const s of ['lineage-data.js','cinematic-explorer.js','evidence-scene','evidence-list','evidence-search','evidence-trail','evidence-minimap','evidence-back','evidence-in','evidence-out'])assert.ok(html.includes(s),s);assert.match(js,/window\.AIFT_LINEAGE_NODES/);assert.match(js,/n\.kind==='root'/);assert.match(js,/n\.kind==='fruit'/);assert.match(js,/history\.push/);assert.match(js,/pointerdown/);assert.match(js,/prefers-reduced-motion/);assert.doesNotMatch(js,/fetch\(|localStorage|sendBeacon|XMLHttpRequest/);});
test('cinematic explorer remains accessible on mobile',()=>{const html=read('cinematic-world.html'),css=read('cinematic-world.css');assert.match(html,/aria-label="Searchable source and outcome directory"/);assert.match(html,/aria-label="Reversible lineage breadcrumbs"/);assert.match(css,/touch-action:none/);assert.match(css,/max-width:440px/);assert.match(css,/prefers-reduced-motion:reduce/);});

test('minimap is actual spatial navigation, not a status-only label',()=>{const js=read('cinematic-explorer.js'),css=read('cinematic-world.css');for(const token of ['overviewViewport','overviewDots','updateMinimap','focusStage','semanticFocus','aria-label','choose(n.id)'])assert.ok(js.includes(token),token);assert.match(css,/\.world-overview/);assert.doesNotMatch(js,/Math\.random|reward_xp|localStorage|sendBeacon/);});


test('source-backed exploration journey has real parent-child navigation and evidence-gap fallback',()=>{const js=read('cinematic-explorer.js'),css=read('cinematic-world.css');for(const token of ['renderJourney','nodes.filter(n=>n.parent===selected)','line(selected)','Trace toward source','No further documented relationships','Visit documented experience','choose(option.id)'])assert.ok(js.includes(token),token);assert.match(css,/\.evidence-journey-step/);assert.doesNotMatch(js,/reward_xp|Math\.random|localStorage|sendBeacon/);});

test('mobile spatial input uses SVG screen transform rather than CSS rectangle approximation',()=>{
 const js=read('cinematic-explorer.js');
 assert.match(js,/createSVGPoint\(\)/);
 assert.match(js,/getScreenCTM\(\)/);
 assert.match(js,/matrixTransform\(matrix\.inverse\(\)\)/);
 assert.doesNotMatch(js,/\(e\.clientX-r\.left\)\*1000\/r\.width/);
});
test('stage selection performs source-backed semantic zoom and preserves missing-evidence honesty',()=>{
 const js=read('cinematic-explorer.js');
 assert.match(js,/targetScale=\{root:/);
 assert.match(js,/scale=targetScale;center/);
 assert.match(js,/No documented.*nodes exist in the published lineage/);
 assert.match(js,/scrollIntoView/);
});
test('search moves camera to a real matching published node',()=>{
 const js=read('cinematic-explorer.js');
 assert.match(js,/nodes\.find\(visible\)/);
 assert.match(js,/center\(pos\.get\(match\.id\)\)/);
});

// Regression guard for the integrated mobile journey and navigation controls.
test('stage dropdown and stage buttons share semantic focus behavior',()=>{
 const js=read('cinematic-explorer.js');
 assert.match(js,/stage\.addEventListener\('change',\(\)=>\{if\(stage\.value==='all'\)/);
 assert.match(js,/focusStage\(stage\.value\)/);
 assert.match(js,/const target=candidates\.find\(n=>n\.id===selected\)\|\|candidates\[0\]/);
 assert.match(js,/scale=targetScale;center\(pos\.get\(target\.id\)\)/);
});
test('touch gestures do not accidentally activate lineage nodes and search remains reversible',()=>{
 const js=read('cinematic-explorer.js');
 assert.match(js,/gestureMoved=true/);
 assert.match(js,/if\(gestureMoved\)\{e\.preventDefault\(\);return;/);
 assert.match(js,/if\(match\.id!==selected\)history\.push\(selected\)/);
 assert.match(js,/e\.pointerType==='mouse'/);
});
