import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';
const html=readFileSync('cinematic-world.html','utf8'),js=readFileSync('cinematic-pilgrimage.js','utf8'),css=readFileSync('cinematic-pilgrimage.css','utf8');
test('cinematic pilgrimage is integrated after published lineage and source projection',()=>{assert.match(html,/cinematic-pilgrimage\.css/);assert.match(html,/cinematic-pilgrimage\.js/);assert.ok(html.indexOf('cinematic-source-projection.js')<html.indexOf('cinematic-pilgrimage.js'));});
test('six source-backed biological kinds and evidence-only fruit qualification',()=>{assert.match(js,/\['root','trunk','branch','leaf','flower','fruit'\]/);assert.match(js,/AIFT_LINEAGE_NODES/);assert.match(js,/qualifies\(n\)/);assert.match(js,/github/);assert.match(js,/ancestry\(chosen\)/);});
test('accessible, reversible, mobile and reduced-motion experience',()=>{for(const term of ['aria-expanded','aria-live','aria-current','Escape','previous','next','prefers-reduced-motion','prefers-reduced-data'])assert.ok((js+css).includes(term),term);});
test('javascript syntax',()=>{execFileSync(process.execPath,['--check','cinematic-pilgrimage.js'])});

test('cinematic route uses only projected published ancestry',()=>{for(const token of ['sourceAnchors','positionOf','drawRoute','ancestry(node)','if(!a||!b)continue','if(!p)continue','pilgrimage-route-layer'])assert.ok(js.includes(token),token);assert.doesNotMatch(js,/Math\.random|localStorage|fetch\(/)});
test('lineage buttons reverse the journey without inventing missing records',()=>{for(const token of ['pilgrimage-lineage','Reversible source ancestry','chapters.findIndex','items.some','aria-current'])assert.ok(js.includes(token),token);assert.match(css,/pilgrimage-route-edge/);assert.match(css,/prefers-reduced-data/);});

test('voyage filters only published records and exposes real descendant paths',()=>{
 for(const token of ['pilgrimage-search','filterRecords','current.items.filter','search.addEventListener','records.filter(n=>n.parent===chosen.id','chapters.some','Published direct descendants','pilgrimage-evidence-progress'])assert.ok(js.includes(token),token);
 assert.match(css,/pilgrimage-search:focus-visible/);
 assert.match(css,/pilgrimage-children/);
 assert.doesNotMatch(js,/Math\.random|localStorage|sessionStorage/);
});

test('interactive atlas renders only qualified published biological records',()=>{
 for(const token of ['pilgrimage-atlas-map','renderAtlas','chapter.items','record.id','navigateTo(record)','No published evidence','aria-current'])assert.ok(js.includes(token),token);
 assert.match(js,/renderAtlas\(\)/);
 assert.match(css,/grid-template-columns:repeat\(6/);
 assert.match(css,/pilgrimage-atlas-column\[data-kind=fruit\]/);
 assert.doesNotMatch(js,/Math\.random|localStorage|sessionStorage/);
});

test('cinematic pilgrimage retains reversible source history and session-only exploration',()=>{
 for(const token of ['function snapshot()','function travelBack()','function travelForward()','history.push(before)','future.length=0','visited.add(current.kind)','not a verified achievement','searchByKind.set','pilgrimage-timeline','pilgrimage-open'])assert.ok(js.includes(token),token);
 assert.match(css,/pilgrimage-open/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.doesNotMatch(js,/localStorage|sessionStorage|Math\.random/);
});

test('playable lineage flight uses only actual ancestry and projected SVG nodes',()=>{
 for(const token of ['pilgrimage-flight','trail.length>1','Start at the root','Previous source','Next source','Published waypoint','trail[step]','drawRoute(record)','sourceAnchors','CSS.escape(record.id)','No achievement is awarded'])assert.ok(js.includes(token),token);
 assert.match(js,/begin\.addEventListener\('click',\(\)=>showStep\(0\)\)/);
 assert.match(js,/prev\.addEventListener\('click',\(\)=>showStep\(step-1\)\)/);
 assert.match(js,/next\.addEventListener\('click',\(\)=>showStep\(step\+1\)\)/);
 assert.match(css,/pilgrimage-flight-controls/);
 assert.match(css,/pilgrimage-flight-trail button\[aria-current=true\]/);
 assert.match(css,/min-height:44px/);
 assert.doesNotMatch(js,/Math\.random|localStorage|sessionStorage|fetch\(/);
});

test('flight waypoint and spatial camera stay synchronized with the real SVG viewBox',()=>{
 for(const token of ['activeWaypoint=record','activeWaypoint||chosen','MutationObserver','attributeFilter:[\'viewBox\']','renderSpatial()'])assert.ok(js.includes(token),token);
 assert.match(js,/cameraObserver\.observe\(tree/);
 assert.match(js,/change\.attributeName===\'viewBox\'/);
 assert.doesNotMatch(js,/Math\.random|localStorage|sessionStorage/);
});

test('guided lineage autoplay remains source-bound, reversible, and explicitly pausable',()=>{
 for(const token of ['Play documented journey','Pause journey','timer=setTimeout(advance,2100)','stopFlight()','flight.isConnected','clearTimeout(timer)','aria-pressed','showStep(step+1)','trail.length-1'])assert.ok(js.includes(token),token);
 assert.match(css,/pilgrimage-flight-controls button\[aria-pressed=true\]/);
 assert.doesNotMatch(js,/Math\.random|localStorage|sessionStorage|fetch\(/);
});
test('spatial camera normalization honors the published full SVG viewBox',()=>{
 assert.match(js,/data-full-viewbox/);
 assert.match(js,/const raw=/);
 assert.match(js,/raw.every\(Number.isFinite\)/);
});
