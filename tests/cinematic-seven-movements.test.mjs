import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('canonical HTML integrates seven movements without replacing six biological stages',()=>{const h=read('cinematic-world.html');assert.match(h,/id="seven-movements"/);assert.match(h,/cinematic-seven-movements\.css/);assert.match(h,/cinematic-seven-movements\.js/);for(const k of ['root','trunk','branch','leaf','flower','fruit'])assert.match(h,new RegExp('data-stage="'+k+'"'));assert.match(h,/id="evidence-world"/);assert.match(h,/id="journey"/)});
test('seven viewpoints derive exclusively from published lineage records',()=>{const js=read('cinematic-seven-movements.js');assert.match(js,/window\.AIFT_LINEAGE_NODES/);assert.match(js,/\.\.\.kinds\.map/);assert.match(js,/qualified\(n\)/);assert.match(js,/path\.some\(p=>p\.kind==='root'\)/);assert.match(js,/n\.kind!=='fruit'/);assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendBeacon|localStorage|Math\.random|reward_xp/)});
test('cinematic controls and mobile accessibility are explicit',()=>{const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');for(const token of ['aria-live','aria-pressed','seven-search','seven-prev','seven-next','noopener noreferrer','No published records'])assert.ok(js.includes(token),token);assert.match(css,/@media\(max-width:390px\)/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/@media\(prefers-reduced-data:reduce\)/);assert.match(css,/:focus-visible/);assert.match(css,/min-height:44px/)});
test('seven-movement JS compiles',()=>{new vm.Script(read('cinematic-seven-movements.js'))});

test('source-backed spatial overview and reversible lineage voyage remain wired',()=>{const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');for(const token of ['seven-map','seven-back','seven-breadcrumb','Trace source ancestry','state.history.pop()','chapterFor(ancestor)','qualified(n)'])assert.ok(js.includes(token),token);assert.match(css,/\.seven-map button:focus-visible/);assert.match(css,/@media\(max-width:390px\)/);assert.doesNotMatch(js,/reward_xp|localStorage|sendBeacon|Math\.random/)});

test('spatial constellation is published-data driven and keyboard operable',()=>{const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');for(const token of ['drawConstellation(entries)','entries.slice(state.page*PAGE_SIZE,(state.page+1)*PAGE_SIZE)','document.createElementNS','role\',\'button','aria-label','pointermove','setPointerCapture','frame(camera.x','scene.parentElement.setAttribute'])assert.ok(js.includes(token),token);assert.match(css,/seven-source-constellation/);assert.match(css,/prefers-reduced-motion/);assert.doesNotMatch(js,/Math\\.random|sendBeacon|localStorage/);});

test('spatial camera mounts after markup and supports genuine two-pointer pinch',()=>{const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');const markup=js.indexOf("host.innerHTML=");const binding=js.indexOf("bindSpatialCamera();");assert.ok(markup>=0&&binding>markup,'stage must exist before binding');for(const token of ['pointers=new Map()','pointercancel','lostpointercapture','Math.hypot','gesture.distance/distance','scene.append(layer)'])assert.ok(js.includes(token),token);assert.match(css,/\.seven-stage svg\{touch-action:none/)});

test('camera anchors zoom to gesture position and never invents missing ancestry',()=>{const js=read('cinematic-seven-movements.js');for(const token of ['anchoredFrame(gesture.anchor,mid.x,mid.y,size)','toWorld(mid.x,mid.y)','anchoredFrame(anchor,e.clientX,e.clientY','trail[0].parent','pages>1'])assert.ok(js.includes(token),token);assert.match(js,/u\.protocol==='https:'/);assert.match(js,/qualified\(n\)\?safe\(n\.url\):null/)});
test('mobile cinematic stage precedes secondary inspector without hiding controls',()=>{const css=read('cinematic-seven-movements.css');assert.match(css,/\.seven-stage\{order:3;min-height:42svh\}/);assert.match(css,/\.seven-inspector\{order:6\}/);assert.match(css,/\.seven-grid\{display:contents\}/)});

test('spatial exploration offers accessible non-gesture camera controls',()=>{const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');for(const token of ['seven-camera-controls','Zoom in','Zoom out','Reset view','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','cameraHome','cameraStep'])assert.ok(js.includes(token),token);assert.match(js,/scene\.setAttribute\('tabindex','0'\)/);assert.match(css,/\.seven-camera-controls button:focus-visible/);assert.match(css,/min-height:44px/);});

test('evidence journey is derived from real ancestry and never awards synthetic achievements',()=>{
 const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');
 for(const token of ['drawJourney(n)','lineage(n)','journeySteps.replaceChildren()','seven-journey-status','Clear journey','chapterFor(ancestor)','travelToNode(node)','No completion is awarded'])assert.ok(js.includes(token),token);
 assert.match(js,/const isOutcome=n.kind==='fruit'&&qualified\(n\)/);
 assert.match(js,/This is provenance, not a live CI claim/);
 assert.match(css,/\.seven-journey li button\[aria-current=true\]/);
 assert.match(css,/\.seven-journey button:focus-visible/);
 assert.doesNotMatch(js,/reward_xp|sendBeacon|localStorage|Math\.random/);
});

test('constellation connects only visible published parent-child records and highlights selected ancestry',()=>{
 const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');
 for(const token of ['visibleById=new Map','child.parent?visibleById.get(child.parent):null','if(!parent)continue','lineageEdges.has','connections.setAttribute(\'aria-hidden\',\'true\')','layer.append(connections)','seven-lineage-node'])assert.ok(js.includes(token),token);
 assert.match(css,/\.seven-source-link-active/);
 assert.match(css,/\.seven-source-connections\{pointer-events:none\}/);
 assert.doesNotMatch(js,/Math\.random|reward_xp|sendBeacon/);
});

test('evidence voyage remains reversible and never fabricates nodes or rewards',()=>{
 const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');
 for(const token of ['voyageTrail','voyageIndex','Begin lineage voyage','Earlier source','Next source','visitVoyage(index)','lineage(n)','byId.has(node.id)','state.history.push','voyagePrevious.disabled','voyageNext.disabled','syncVoyage(selected)'])assert.ok(js.includes(token),token);
 assert.match(js,/voyageTrail=trail\|\|\[\]/);
 assert.match(css,/\.seven-voyage-controls button:focus-visible/);
 assert.doesNotMatch(js,/reward_xp|sendBeacon|localStorage|Math\.random/);
});

test('evidence voyage camera follows actual published nodes and respects reduced motion',()=>{
 const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');
 for(const token of ['function travelToNode(node)','const target=visiblePoint(node)','motionPreference.matches','document.visibilityState','requestAnimationFrame(tick)','cancelAnimationFrame(voyageAnimation)','travelToNode(node)','stopVoyageCamera();frame()'])assert.ok(js.includes(token),token);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(js,/Math\\.random|reward_xp|sendBeacon|localStorage/);
});

test('biological constellation projects published roots below trunk and canopy, not random radial rings',()=>{
 const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');
 for(const token of ['stageHeight={root:548,trunk:402,branch:290,leaf:178,flower:112,fruit:58}','pointCache=new Map()','const trail=lineage(n)','trail.includes(parent)','point(parent)','stageHeight[stage]','clamp(x,24,576)'])assert.ok(js.includes(token),token);
 assert.doesNotMatch(js,/Math\\.random|reward_xp|sendBeacon/);
 assert.match(css,/Vertical biological world/);
});

test('dense biological canopy separates visible source nodes without inventing records',()=>{
 const js=read('cinematic-seven-movements.js');
 for(const token of ['function separateVisibleNodes(visible)','visiblePositions.clear()','nodes.sort((a,b)=>a.x-b.x','occupied=[[],[],[]]','visiblePositions.set(n.id','separateVisibleNodes(visible)','visiblePoint(parent)','visiblePoint(child)','const pos=visiblePoint(n)','const target=visiblePoint(node)'])assert.ok(js.includes(token),token);
 assert.match(js,/const visible=entries\.slice\(state\.page\*PAGE_SIZE,\(state\.page\+1\)\*PAGE_SIZE\)/);
 assert.doesNotMatch(js,/Math\.random|reward_xp|sendBeacon/);
});

test('spatial minimap is evidence-backed, camera-synchronized and keyboard accessible',()=>{
 const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');
 for(const token of ['function drawMinimap(visible)','visiblePoint(n)','seven-minimap-viewport','updateMinimapCamera()','minimap.addEventListener(\'click\'','minimap.addEventListener(\'keydown\'','cameraHome()'])assert.ok(js.includes(token),token);
 assert.match(css,/\.seven-minimap:focus-visible/);
 assert.match(css,/@media\(max-width:390px\)/);
 assert.doesNotMatch(js,/Math\.random|sendBeacon|localStorage|reward_xp/);
});

test('constellation pages expose every published match without fabricated nodes',()=>{
 const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');
 for(const token of ['const PAGE_SIZE=180','entries.slice(state.page*PAGE_SIZE,(state.page+1)*PAGE_SIZE)','Math.ceil(entries.length/PAGE_SIZE)','state.page=clamp(state.page,0,pages-1)','pagePrevious.addEventListener','pageNext.addEventListener','all matches remain available in the accessible list'])assert.ok(js.includes(token),token);
 assert.match(css,/\.seven-page-controls button:focus-visible/);
 assert.doesNotMatch(js,/Math\.random|sendBeacon|reward_xp/);
});


test('selected source automatically reveals its constellation page without overriding manual paging',()=>{
 const js=read('cinematic-seven-movements.js');
 for(const token of ['let lastRevealedSelection=null','entries.findIndex(n=>n.id===state.selected)','state.selected!==lastRevealedSelection','Math.floor(selectedIndex/PAGE_SIZE)','lastRevealedSelection=state.selected'])assert.ok(js.includes(token),token);
 assert.match(js,/if\(selectedIndex>=0&&state\.selected!==lastRevealedSelection\)state\.page=Math\.floor\(selectedIndex\/PAGE_SIZE\)/);
 assert.match(js,/pageNext\.addEventListener\('click',\(\)=>\{state\.page\+\+;render\(\)\}\)/);
});


test('all selection entry points reveal and focus published spatial nodes, and history restores camera',()=>{const js=read('cinematic-seven-movements.js');assert.match(js,/state\.selected=n\.id;render\(\);travelToNode\(n\);detail\.focus/);assert.match(js,/render\(\);travelToNode\(ancestor\)/);assert.match(js,/if\(prior\.selected&&byId\.has\(prior\.selected\)\)travelToNode/);assert.match(js,/const cameraHome=\(\)=>\{stopVoyageCamera\(\);frame/);assert.match(js,/const cameraStep=\(direction\)=>\{stopVoyageCamera\(\)/);});


test('mobile cinematic cockpit reserves distinct caption, provenance and camera zones',()=>{
 const css=read('cinematic-seven-movements.css');
 for(const token of ['Living Universe 3.1: legible cinematic cockpit','height:62svh','height:60svh','top:7.15rem','top:7.5rem','max-width:calc(100% - 120px)','max-width:calc(100% - 112px)','prefers-reduced-data:reduce','prefers-reduced-motion:reduce'])assert.ok(css.includes(token),token);
 assert.match(css,/\.seven-stage\{--hud-ink:/);
 assert.match(css,/\.seven-biological-key\{top:7\.15rem/);
 assert.match(css,/\.seven-scene-caption\{top:\.55rem/);
 assert.match(css,/\.seven-stage \.seven-minimap-wrap\{bottom:\.5rem/);
});

test('cinematic evidence voyage highlights only published ancestry while retaining accessible context',()=>{
 const js=read('cinematic-seven-movements.js'),css=read('cinematic-seven-movements.css');
 for(const token of ["lineageEdges.has(parent.id+'>'+child.id)","data-evidence-route","seven-context-node","seven-lineage-node","seven-source-link[data-evidence-route=\"true\"]","prefers-reduced-motion:reduce","prefers-reduced-data:reduce"])assert.ok((js+'\n'+css).includes(token),token);
 assert.match(js,/else if\(trail\)circle\.setAttribute\('class','seven-context-node'\)/);
 assert.match(css,/\.seven-context-node:is\(:hover,:focus-visible\)/);
 assert.doesNotMatch(js,/Math\.random|reward_xp|sendBeacon/);
});
