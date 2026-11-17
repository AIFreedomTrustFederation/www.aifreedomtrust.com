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

// Pointer capture retargets touch-generated click events to the SVG. Selection must
// therefore be resolved on a stationary pointerup, not solely from a node click.
test('touch tap selects real lineage nodes despite SVG pointer capture',()=>{
 const js=read('cinematic-explorer.js');
 assert.match(js,/tapCandidate=e\.target\.closest\?\.\('\[data-id\]'\)/);
 assert.match(js,/pinchUsed=true;tapCandidate=null/);
 assert.match(js,/const tapped=e\.type==='pointerup'&&pointers\.size===1&&!gestureMoved&&!pinchUsed&&tapCandidate/);
 assert.match(js,/gestureMoved=true;choose\(id\)/);
 assert.match(js,/if\(gestureMoved\|\|pinchUsed\)/);
});

// Stage controls are a single accessible selection state, not six permanently
// hard-coded pressed buttons. This must stay true after zoom, reset and filters.
test('stage controls expose synchronized aria-pressed state',()=>{
 const js=read('cinematic-explorer.js');
 assert.match(js,/function syncStageControls\(kind\)/);
 assert.match(js,/button\.setAttribute\('aria-pressed',String\(active\)\)/);
 assert.match(js,/function focusStage\(kind\)\{\s*syncStageControls\(kind\)/);
 assert.match(js,/syncStageControls\('root'\);transform\(\)/);
 assert.match(js,/syncStageControls\(null\)/);
});

test('cinematic landing stage beacons use published lineage and remain non-deceptive',()=>{
 const html=read('cinematic-world.html'),js=read('cinematic-beacons.js'),css=read('cinematic-world.css');
 for(const id of ['world-beacons','world-stage-status','world-destination'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.includes('cinematic-beacons.js'));
 for(const kind of ['root','trunk','branch','leaf','flower','fruit'])assert.ok(js.includes("'"+kind+"'"),kind);
 assert.match(js,/window\.AIFT_LINEAGE_NODES/);
 assert.match(js,/nodes\.filter\(n=>n\.kind===kind\)/);
 assert.match(js,/No documented /);
 assert.match(js,/safeLink\(first\.url\)/);
 assert.match(js,/prefers-reduced-motion: reduce/);
 assert.match(css,/@media\(max-width:700px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(js,/localStorage|sendBeacon|fetch\(|XMLHttpRequest|Math\.random\(/);
});


test('cinematic hero projects only real lineage records and preserves root-to-fruit semantics',()=>{
 const html=read('cinematic-world.html'),js=read('cinematic-source-projection.js'),css=read('cinematic-world.css');
 assert.match(html,/cinematic-source-projection\.js/);
 assert.match(js,/window\.AIFT_LINEAGE_NODES/);
 assert.match(js,/nodes\.filter\(n=>n&&n\.id&&colors\[n\.kind\]\)/);
 assert.match(js,/const trail=\[\],seen=new Set\(\)/);
 assert.match(js,/node\.kind==='fruit'/);
 assert.match(js,/rel','noopener noreferrer'/);
 assert.match(js,/aria-label/);
 assert.match(css,/\.living-source-node:focus-visible/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(js,/fetch\(|localStorage|sendBeacon|Math\.random|reward_xp/);
});

// Newly documented nodes must never silently disappear from the hero because their IDs
// were absent from an older decorative placement table.
test('source projection includes future published nodes and keyboard fallback',()=>{
 const js=read('cinematic-source-projection.js');
 assert.match(js,/const visible=nodes\.filter\(n=>n&&n\.id&&colors\[n\.kind\]\)/);
 assert.match(js,/extra\.forEach\(\(n,i\)=>/);
 assert.match(js,/locations\[n\.id\]=/);
 assert.match(js,/projectedIds\.has\(parent\.id\)/);
 assert.match(js,/anchor\.setAttribute\('tabindex','0'\)/);
 assert.match(js,/e\.key==='Enter'\|\|e\.key===' '/);
 assert.doesNotMatch(js,/Math\.random|fetch\(|localStorage|sendBeacon/);
});

test('cinematic source inspector provides ancestry and safe real destinations without inventing fruit',()=>{
 const js=read('cinematic-source-projection.js'),css=read('cinematic-world.css');
 for(const token of ["living-source-inspector","host.after(inspector)","lineage.replaceChildren()","for(const ancestor of trail)","destination.hidden=!link","destination.removeAttribute('href')","noopener noreferrer"])assert.ok(js.includes(token),token);
 assert.match(js,/node.kind==='root'\?'Verified source root/);
 assert.match(js,/node.kind==='fruit'\?'Documented visitor-facing outcome/);
 assert.match(css,/\.living-source-inspector/);
 assert.match(css,/\.living-source-inspector a:focus-visible/);
 assert.doesNotMatch(js,/localStorage|sendBeacon|Math\.random|reward_xp/);
});

test('cinematic source directory is searchable, filtered and keyboard navigable',()=>{
 const js=read('cinematic-source-projection.js'),css=read('cinematic-world.css');
 for(const token of ['living-source-directory','living-source-controls','renderDirectory','search.addEventListener(\'input\'','filter.addEventListener(\'change\'','aria-pressed','aria-current','anchors.get(node.id)','selectNode(node)'])assert.ok(js.includes(token),token);
 assert.match(js,/anchor.addEventListener\('click',e=>\{e.preventDefault\(\);selectNode\(node\)\}\)/);
 assert.match(js,/destination.hidden=!link/);
 assert.match(css,/\.living-source-directory/);
 assert.match(css,/\.living-source-controls/);
 assert.match(css,/max-width:600px/);
 assert.doesNotMatch(js,/localStorage|sendBeacon|Math\.random|reward_xp/);
});


test('hero voyage navigates only documented lineage with reversible camera and evidence gaps',()=>{
 const js=read('cinematic-source-projection.js'),css=read('cinematic-world.css');
 for(const token of ['living-voyage','pathTo(node)','visible.filter(n=>n.parent===node.id)','No further documented relationship or outcome','previous.push(selectedId)','previous.pop()','scene.setAttribute(\'viewBox\'','voyageBack','voyageReset','voyageZoomIn','voyageZoomOut','living-voyage-map'])assert.ok(js.includes(token),token);
 assert.match(js,/Math\.max\(250,Math\.min\(1000,w\)\)/);
 assert.match(js,/if\(record&&selectedId&&selectedId!==node\.id\)previous\.push\(selectedId\)/);
 assert.match(css,/\.living-voyage-trail/);
 assert.match(css,/\.living-voyage-controls/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(js,/localStorage|sendBeacon|Math\.random|reward_xp|fetch\(/);
});

test('cinematic hero camera supports pan, pinch and accessible overview without synthetic lineage',()=>{
 const js=read('cinematic-source-projection.js');
 for(const token of ["pointers=new Map()","pointerdown","pointermove","pointercancel","setPointerCapture","pinchStart.distance","dragStart.view","mapWindow.setAttribute('width'","voyageMap.addEventListener('keydown'"])assert.ok(js.includes(token),token);
 assert.doesNotMatch(js,/Math\.random|reward_xp|sendBeacon|localStorage/);
});


test('cinematic camera supports discoverable keyboard navigation and opt-in precision zoom',()=>{
 const js=read('cinematic-source-projection.js'),css=read('cinematic-world.css');
 for(const token of ["cameraHelp.textContent","cameraAnnounce.setAttribute('role','status')","scene.setAttribute('tabindex','0')","aria-keyshortcuts","scene.addEventListener('keydown'","scene.addEventListener('wheel'","if(!e.ctrlKey&&!e.metaKey)return","passive:false","e.key==='ArrowLeft'","e.key==='ArrowRight'","e.key==='ArrowUp'","e.key==='ArrowDown'","e.key==='Home'","zoomAt=(factor,x,y)"])assert.ok(js.includes(token),token);
 assert.match(css,/\.tree:focus-visible/);
 assert.match(css,/\.living-camera-help/);
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(js,/localStorage|sendBeacon|Math\.random|reward_xp/);
});

test('evidence missions use only published ancestry and never fabricated rewards',()=>{
 const html=read('cinematic-world.html'),js=read('cinematic-evidence-missions.js'),css=read('cinematic-world.css');
 assert.match(html,/cinematic-source-projection\.js[^]*cinematic-evidence-missions\.js/);
 assert.match(js,/window\.AIFT_LINEAGE_NODES/);
 assert.match(js,/safePath\(node\)/);
 assert.match(js,/kind==='fruit'/);
 assert.match(js,/No documented finished outcome/);
 assert.match(js,/aria-pressed/);
 assert.match(css,/\.living-mission-trail/);
 assert.match(css,/\.living-evidence-missions button:focus-visible/);
 assert.doesNotMatch(js,/fetch\(|sendBeacon|localStorage|Math\.random|reward_xp|window\.open/);
});

// Camera interaction must use the SVG's real screen transform, not its CSS box.
// This matters on portrait Android where preserveAspectRatio introduces letterboxing.
test('hero camera maps wheel and drag gestures through SVG coordinates',()=>{
 const js=read('cinematic-source-projection.js');
 assert.match(js,/scene\.createSVGPoint\(\)/);
 assert.match(js,/scene\.getScreenCTM\(\)/);
 assert.match(js,/point\.matrixTransform\(matrix\.inverse\(\)\)/);
 assert.match(js,/const localDelta=\(dx,dy\)=>/);
 assert.match(js,/dragStart\.view\.x-delta\.x/);
 assert.doesNotMatch(js,/dragStart\.view\.w\/Math\.min\(rect\.width,rect\.height\)/);
 assert.match(js,/e\.key==='Enter'\|\|e\.key===' '/);
});


test('cinematic lineage portal uses published records without fabricated outcomes',()=>{
 const js=read('cinematic-lineage-portal.js');
 const html=read('cinematic-world.html');
 const css=read('cinematic-world.css');
 assert.match(js,/window\.AIFT_LINEAGE_NODES/);
 assert.match(js,/n\.kind!=='fruit'/);
 assert.match(js,/u\.protocol==='https:'/);
 assert.match(js,/aria-pressed/);
 assert.match(js,/MutationObserver/);
 assert.match(html,/cinematic-lineage-portal\.js/);
 assert.match(css,/\.cinematic-portal-step:focus-visible/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.doesNotMatch(js,/fetch\(|sendBeacon|localStorage|Math\.random|reward_xp/);
});


test('cinematic stage voyage exposes only published source choices and honest empty stages',()=>{
 const js=read('cinematic-lineage-portal.js'),css=read('cinematic-world.css');
 for(const token of ['function renderSources(kind)','valid.filter(n=>n.kind===kind)','sourceList.replaceChildren()','No documented visitor outcome','safeDestination(node)','living-source-node','point.dispatchEvent','prefers-reduced-motion','scrollIntoView'])assert.ok(js.includes(token),token);
 assert.match(css,/\.cinematic-portal-sources\{/);
 assert.match(css,/scroll-snap-type:x proximity/);
 assert.match(css,/\.cinematic-portal-source:focus-visible/);
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendBeacon|localStorage|Math\.random|reward_xp/);
});
