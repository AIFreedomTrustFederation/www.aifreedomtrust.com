// Real-browser acceptance for the canonical HTML-first Tree. No external destinations opened.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const base='http://127.0.0.1:4178/cinematic-world.html';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/living-universe',{recursive:true});
const failures=[];
for(const width of [360,390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:800},deviceScaleFactor:1,hasTouch:width<=390,isMobile:width<=390});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const response=await page.goto(base,{waitUntil:'networkidle',timeout:30000});
  assert.equal(response.status(),200);
  // Capture the untouched canonical landing world before any navigation or scroll.
  // This is the baseline against which the journey and collision repairs are judged.
  await page.screenshot({path:'artifacts/living-universe/BASELINE-'+width+'.png',animations:'disabled'});
  const host=page.locator('#seven-movements');
  await host.waitFor({state:'visible'});
  const svg=page.locator('#seven-movements .seven-stage svg').first();
  await svg.waitFor({state:'visible'});
  assert.ok(await svg.locator('.seven-source-constellation circle').count()>0,'Published lineage nodes should render');
  // The cinematic growth field must be derived from the published constellation.
  const light=svg.locator('.seven-growth-light');
  assert.equal(await light.count(),1,'Source-backed growth lighting renders once');
  const rendered=await svg.locator('.seven-source-constellation circle').count();
  const illuminated=await light.locator('.seven-growth-root,.seven-growth-trunk,.seven-growth-canopy,.seven-growth-outcome').count();
  assert.ok(illuminated>0&&illuminated<=rendered,'Only actual visible source records may illuminate the world');
  assert.equal(await light.getAttribute('aria-hidden'),'true','Decorative lighting is excluded from accessible source navigation');
  const key=page.locator('#seven-movements .seven-biological-key');
  assert.equal(await key.locator('.seven-biological-key-item').count(),6,'All six biological layers have a visible source-derived key');
  const keyText=await key.innerText();
  for(const kind of ['root','trunk','branch','leaf','flower','fruit'])assert.match(keyText,new RegExp(kind+' \\u00b7 \\d+ published','i'));
  assert.ok(await key.evaluate(el=>el.getBoundingClientRect().width<=innerWidth),'Spectral key fits mobile viewport');
  const bounds=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth,stage:document.querySelector('#seven-movements .seven-stage')?.getBoundingClientRect().toJSON()}));
  assert.ok(bounds.scroll<=bounds.viewport+2,'Horizontal overflow '+JSON.stringify(bounds));
  assert.ok(bounds.stage.width>0&&bounds.stage.height>0,'Stage has positive dimensions');
  if(width<=390)assert.ok(bounds.stage.height>=800*.58,'Mobile theatre must dominate its viewport');
  assert.ok(bounds.stage.width<=bounds.viewport+2,'Theatre must not exceed viewport');
  // Atmospheric chapter navigation must reflect the real published viewpoint.
  const caption=page.locator('#seven-movements .seven-scene-caption');
  assert.match(await caption.innerText(),/The Living Whole/);
  await page.locator('#seven-next').click();
  assert.equal(await host.getAttribute('data-movement'),'1','Root chapter drives the stage atmosphere');
  assert.match(await caption.innerText(),/The Roots/);
  await page.locator('#seven-prev').click();
  assert.equal(await host.getAttribute('data-movement'),'0','Return restores the federation viewpoint');
  assert.match(await caption.innerText(),/The Living Whole/);
  const search=page.locator('#seven-search');
  await search.fill('___aift_no_matching_source___');
  assert.match(await page.locator('#seven-evidence').innerText(),/(?:No published records|0 documented lineage records in this view)/i);
  assert.equal(await svg.locator('.seven-source-constellation circle').count(),0,'No fabricated nodes for unmatched search');
  await search.fill('');
  assert.ok(await svg.locator('.seven-source-constellation circle').count()>0,'Clearing search restores published nodes');
  const circles=svg.locator('.seven-source-constellation circle');
  if(await circles.count()){
    await circles.first().focus();
    await page.keyboard.press('Enter');
    assert.ok((await page.locator('#seven-detail').innerText()).length>5,'Keyboard selection reveals source details');
  }

  // A documented ancestry route must be reversible and source-only.
  const route=page.locator('#seven-movements .seven-route-deck');
  assert.equal(await route.count(),1,'In-world lineage navigation is mounted');
  const rooted=await page.evaluate(()=>Array.isArray(window.AIFT_LINEAGE_NODES)
    ?window.AIFT_LINEAGE_NODES.find(n=>n.parent&&window.AIFT_LINEAGE_NODES.some(p=>p.id===n.parent&&p.kind==='root'))
    :null);
  if(rooted){
    await page.locator('#seven-search').fill(rooted.label);
    const matchingRecord=page.locator('#seven-movements .seven-list button').filter({hasText:rooted.label}).first();
    assert.ok(await matchingRecord.count(),'Published child record must appear in the accessible directory');
    await matchingRecord.click();
    assert.equal(await route.isVisible(),true,'Published ancestry reveals the voyage deck');
    const towardRoots=route.getByRole('button',{name:'Toward roots'});
    assert.equal(await towardRoots.isDisabled(),false);
    await towardRoots.click();
    assert.match(await route.locator('.seven-route-status').innerText(),/Published lineage 1 of/);
    await route.getByRole('button',{name:'Toward outcome'}).click();
    assert.match(await route.locator('.seven-route-status').innerText(),/Published lineage 2 of/);
    await route.getByRole('button',{name:'Whole Tree'}).click();
    assert.equal(await host.getAttribute('data-movement'),'0');
    await page.locator('#seven-search').fill('');
  }
  // The HTML-first pilgrimage must be playable, not just statically present.
  const pilgrimage=page.locator('.pilgrimage');
  assert.equal(await pilgrimage.count(),1,'Source-bound pilgrimage mounts once');
  const voyageToggle=pilgrimage.locator('.pilgrimage-toggle');
  // The seven-movement journey above can leave the document scrolled far below
  // the canonical Tree. Scroll the entrance into view before testing hit geometry:
  // elementFromPoint only accepts viewport coordinates, not offscreen elements.
  await voyageToggle.scrollIntoViewIfNeeded();
  if(width<=390){
    const hit=await voyageToggle.evaluate(el=>{
      const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
      const within=x>=0&&y>=0&&x<innerWidth&&y<innerHeight;
      const top=within?document.elementFromPoint(x,y):null;return {x,y,within,hit:within&&(top===el||el.contains(top)||top?.closest?.('.pilgrimage-toggle')===el),interceptor:top?{tag:top.tagName,className:typeof top.className==='string'?top.className:'',id:top.id}:null};
    });
    assert.ok(hit.within,'Mobile entrance must be in viewport before pointer testing: '+JSON.stringify(hit));
    assert.ok(hit.hit,'Mobile pilgrimage entrance must receive pointer input: '+JSON.stringify(hit));
  }
  // The Android voyage entrance must not cover the source rail or destination gates.
  // Capture actual hit-testing after scrolling each interactive element into view.
  if(width<=390){
    const targets=['.world .world-beacon','.world .world-gate','.pilgrimage-toggle'];
    for(const selector of targets){
      const target=page.locator(selector).first();
      if(!(await target.count()))continue;
      await target.scrollIntoViewIfNeeded();
      const hit=await target.evaluate(el=>{
        const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
        const top=document.elementFromPoint(x,y);
        return {selector:el.className,x,y,visible:x>=0&&x<innerWidth&&y>=0&&y<innerHeight,
          receivesInput:top===el||el.contains(top),
          interceptedBy:top===el||el.contains(top)?null:{tag:top?.tagName||null,className:typeof top?.className==='string'?top.className:null}};
      });
      assert.ok(hit.visible&&hit.receivesInput,'Android theatre control must be reachable: '+JSON.stringify(hit));
    }
    await voyageToggle.scrollIntoViewIfNeeded();
  }
  await voyageToggle.click();
  assert.equal(await voyageToggle.getAttribute('aria-expanded'),'true','Voyage opens accessibly');
  // The first-viewport navigator must yield its hit area to the active voyage.
  assert.equal(await page.locator('.awakening-navigator').isVisible(),false,'Voyage must not be occluded by the Tree navigator');
  // Opening the sheet may scroll its original absolute-positioned toggle above
  // the viewport on tablet/desktop. Reframe before measuring hit geometry.
  await voyageToggle.scrollIntoViewIfNeeded();
  const voyageHit=await voyageToggle.evaluate(el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,within=x>=0&&y>=0&&x<innerWidth&&y<innerHeight,t=within?document.elementFromPoint(x,y):null;return {within,hit:within&&(t===el||el.contains(t)),interceptor:t?{tag:t.tagName,id:t.id,className:typeof t.className==='string'?t.className:''}:null,x,y}});
  assert.ok(voyageHit.hit,'Open voyage toggle remains pointer-reachable: '+JSON.stringify(voyageHit));
  const spatial=pilgrimage.locator('.pilgrimage-spatial-map');
  assert.equal(await spatial.count(),1,'Source-projected spatial chart exists');
  const markers=spatial.locator('.pilgrimage-spatial-marker');
  const published=await page.evaluate(()=>Array.isArray(window.AIFT_LINEAGE_NODES)?window.AIFT_LINEAGE_NODES.length:0);
  assert.ok(await markers.count()>0,'Published source locations appear on spatial chart');
  assert.ok(await markers.count()<=published,'Map cannot invent source markers');
  assert.equal(await pilgrimage.locator('.pilgrimage-spatial-viewport').count(),1,'Camera footprint is visible');
  await markers.first().click();
  assert.equal(await spatial.locator('[aria-pressed="true"]').count(),1,'Selected source is highlighted');
  assert.match(await pilgrimage.locator('.pilgrimage-provenance').innerText(),/Published lineage:/);
  // The source-to-record flight must be genuinely playable on touch and desktop.
  if(rooted){
    await pilgrimage.locator('.pilgrimage-atlas-map button[data-source="'+rooted.id+'"]').click();
    const flight=pilgrimage.locator('.pilgrimage-flight');
    assert.equal(await flight.count(),1,'A published parent/child chain offers a lineage flight');
    await flight.getByRole('button',{name:'Start at the root'}).click();
    assert.match(await flight.locator('.pilgrimage-flight-status').innerText(),/Published waypoint 1 of/);
    await flight.getByRole('button',{name:'Next source'}).click();
    assert.match(await flight.locator('.pilgrimage-flight-status').innerText(),/Published waypoint 2 of/);
    assert.equal(await flight.locator('[aria-current="true"]').count(),1,'One real waypoint is active');
  }
  await pilgrimage.locator('[data-history="back"]').click();
  await voyageToggle.click();
  assert.equal(await voyageToggle.getAttribute('aria-expanded'),'false','Voyage closes without replacing published page');
  const immersive=page.locator('#seven-movements .seven-immerse-toggle');
  await immersive.click();
  assert.equal(await immersive.getAttribute('aria-pressed'),'true','Immersive mode is explicitly enabled');
  assert.ok(await host.evaluate(el=>el.classList.contains('seven-immersive')),'World expands without losing source data');
  assert.ok(await svg.locator('.seven-source-constellation circle').count()>0,'Published nodes survive immersive transition');
  await page.keyboard.press('Escape');
  assert.equal(await immersive.getAttribute('aria-pressed'),'false','Escape exits immersive mode');
  // Provenance compass: verify real source navigation, reversible disclosure,
  // and that the mobile HUD does not swallow pointer input.
  const compass=host.locator('.seven-provenance-compass');
  assert.equal(await compass.count(),1,'One provenance compass is mounted');
  const compassToggle=compass.locator('.seven-compass-toggle');
  assert.equal(await compassToggle.getAttribute('aria-expanded'),'false');
  await compassToggle.scrollIntoViewIfNeeded();
  if(width<=390){
    const hit=await compassToggle.evaluate(el=>{
      const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
      return {within:x>=0&&x<innerWidth&&y>=0&&y<innerHeight,
        receives:el===document.elementFromPoint(x,y)||el.contains(document.elementFromPoint(x,y))};
    });
    assert.ok(hit.within&&hit.receives,'Compass toggle must be touch reachable: '+JSON.stringify(hit));
  }
  await compassToggle.click();
  assert.equal(await compassToggle.getAttribute('aria-expanded'),'true','Compass opens');
  assert.equal(await compass.locator('.seven-compass-panel').isVisible(),true);
  assert.equal(await compass.getAttribute('aria-label'),'In-world source provenance compass');
  await page.screenshot({path:'artifacts/living-universe/compass-'+width+'.png'});
  // Keyboard users must be able to dismiss the overlay and return to its trigger.
  await compass.locator('.seven-compass-panel strong').focus();
  await page.keyboard.press('Escape');
  assert.equal(await compassToggle.getAttribute('aria-expanded'),'false','Escape closes compass');
  assert.equal(await compass.locator('.seven-compass-panel').isVisible(),false);
  assert.equal(await compassToggle.evaluate(el=>document.activeElement===el),true,'Focus returns to the compass trigger');
  await compassToggle.click();
  assert.equal(await compassToggle.getAttribute('aria-expanded'),'true','Compass reopens after keyboard dismissal');
  await compassToggle.click();
  assert.equal(await compassToggle.getAttribute('aria-expanded'),'false','Compass closes reversibly');
  assert.equal(await compass.locator('.seven-compass-panel').isVisible(),false);

  // Capture the playable world itself, not only the long document screenshot.
  await page.locator('#seven-movements .seven-stage').screenshot({path:'artifacts/living-universe/stage-'+width+'.png'});
  const minimap=page.locator('#seven-movements .seven-minimap');
  assert.ok(await minimap.count(),'Spatial minimap must be present');
  const before=await svg.getAttribute('viewBox');
  const zoom=page.locator('#seven-movements .seven-camera-controls button');
  assert.ok(await zoom.count()>0,'Camera controls must be operable');
  await zoom.first().click();
  const after=await svg.getAttribute('viewBox');
  assert.notEqual(after,before,'Camera control must change the visible world');
  const mapViewport=page.locator('#seven-movements .seven-minimap-viewport');
  assert.ok(await mapViewport.count(),'Minimap viewport tracks camera');
  const mapSize=Number(await mapViewport.getAttribute('width'));
  assert.ok(Number.isFinite(mapSize)&&mapSize>0&&mapSize<=600,'Minimap viewport has bounded camera size');
  // First-viewport Tree: verify the same real camera responds to pointer, keyboard and reset.
  const heroTree=page.locator('.world svg.tree');
  const heroCamera=()=>heroTree.getAttribute('viewBox');
  // The hero is an SVG inside a tall document. Chromium can keep retrying
  // scrollIntoViewIfNeeded on an animated SVG whose bounds change every frame.
  // Return to the actual landing viewport, then inspect its stable pointer area.
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(150);
  await heroTree.focus();
  const keyboardBefore=await heroCamera();
  await page.keyboard.press('ArrowRight');
  assert.notEqual(await heroCamera(),keyboardBefore,'Focusable Tree must support spatial keyboard panning');
  await page.keyboard.press('Home');
  const fullCamera=await heroCamera();
  // A full-Tree camera has no off-screen area to pan into, so zoom in before dragging.
  await page.keyboard.press('+');
  const pointerBefore=await heroCamera();
  assert.notEqual(pointerBefore,fullCamera,'Tree keyboard zoom must narrow the camera');
  const heroBounds=await heroTree.boundingBox();
  assert.ok(heroBounds?.width>80&&heroBounds?.height>80,'Playable Tree has a visible pointer surface');
  // Find a genuinely exposed piece of the SVG, rather than dragging a panel,
  // source node, or overlay at the geometric center of the artwork.
  // An auto-opened navigator would legitimately cover the Tree on tablet widths.
  const openNavigator=page.locator('.awakening-open[aria-expanded="true"]');
  if(await openNavigator.count()){
    await page.evaluate(()=>document.querySelector('.awakening-close').click());
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(150);
  }
  const exposed=await heroTree.evaluate(svg=>{
    const rect=svg.getBoundingClientRect();
    // The cinematic rail covers the middle of the desktop SVG. Probe the
    // exposed canopy edges and require the entire drag corridor to stay on
    // the SVG instead of crossing a real HUD control.
    const dragX=Math.min(45,rect.width*.12),dragY=20;
    const isTreeSurface=(x,y)=>{
      if(x<12||y<12||x>=innerWidth-12||y>=innerHeight-12)return false;
      const hit=document.elementFromPoint(x,y);
      return !!hit&&(hit===svg||svg.contains(hit))&&!hit.closest?.('.living-source-node');
    };
    for(const fy of [.45,.35,.55,.25,.65,.15,.75,.1,.05,.85,.95]){
      for(const fx of [.5,.4,.6,.3,.7,.2,.8,.15,.05,.9,.95]){
        const x=rect.left+rect.width*fx,y=rect.top+rect.height*fy;
        if([0,.5,1].every(t=>isTreeSurface(x+dragX*t,y+dragY*t)))
          return {x,y,hit:document.elementFromPoint(x,y).tagName};
      }
    }
    return null;
  });
  if(!exposed){
    // Report actual hit-test stacks rather than guessing which HUD layer blocks
    // the Tree. The probe is read-only and preserves the user journey.
    const hitMap=await heroTree.evaluate(svg=>{
      const r=svg.getBoundingClientRect(),samples=[];
      for(const fy of [.05,.15,.25,.35,.45,.55,.65,.75,.85,.95]){
        for(const fx of [.05,.15,.25,.35,.45,.55,.65,.75,.85,.95]){
          const x=r.left+r.width*fx,y=r.top+r.height*fy;
          if(x<0||y<0||x>=innerWidth||y>=innerHeight)continue;
          const top=document.elementFromPoint(x,y);
          const stack=document.elementsFromPoint(x,y).slice(0,5).map(el=>({
            tag:el.tagName,id:el.id||'',className:typeof el.className==='string'?el.className:(el.className?.baseVal||'')
          }));
          samples.push({fx,fy,x:Math.round(x),y:Math.round(y),treeHit:!!top&&(top===svg||svg.contains(top)),stack});
        }
      }
      return {treeRect:r.toJSON(),samples};
    });
    console.error('TREE_POINTER_OCCLUSION_DIAGNOSTIC '+JSON.stringify({width,hitMap}));
  }
  assert.ok(exposed,'Tree needs an exposed pointer-drag surface not obscured by navigator or panels');
  const startX=exposed.x,startY=exposed.y;
  // Mouse pointer drag also exercises the shared Pointer Events path used on Android.
  await page.mouse.move(startX,startY);
  await page.mouse.down();
  await page.mouse.move(startX+Math.min(45,heroBounds.width*.12),startY+20,{steps:5});
  await page.mouse.up();
  assert.notEqual(await heroCamera(),pointerBefore,'Tree pointer drag must actually move the camera');
  await page.keyboard.press('Home');
  assert.equal(await heroCamera(),fullCamera,'Whole Tree keyboard reset restores the initial camera');
  const navigator=page.locator('.awakening-navigator');
  assert.equal(await navigator.count(),1,'Canonical hero navigator mounts once');
  const navigatorOpen=navigator.locator('.awakening-open');
  // Earlier source selections legitimately auto-open the navigator; only toggle when it is closed.
  if(await navigatorOpen.getAttribute('aria-expanded')!=='true')await navigatorOpen.click();
  assert.equal(await navigatorOpen.getAttribute('aria-expanded'),'true');
  const navigatorSearch=navigator.locator('.awakening-search');
  await navigatorSearch.fill('___no_published_record___');
  assert.match(await navigator.locator('.awakening-results').innerText(),/No documented match/);
  await navigatorSearch.fill('');
  assert.ok(await navigator.locator('.awakening-results button').count()>0,'Published records populate hero exploration');
  // Living Universe 3.3 acceptance: exercise the actual published pathway,
  // not only static contracts. The public branch has three documented page fruits.
  const living=page.locator('.awakening-cinema');
  const finder=living.locator('.awakening-explorer input[type="search"]');
  await finder.fill('Public Exploration');
  const publicBranch=living.locator('.awakening-explorer-result').filter({hasText:'Public Exploration'}).first();
  assert.equal(await publicBranch.count(),1,'Published public branch is searchable');
  await publicBranch.click();
  const pathways=living.locator('.awakening-pathways');
  assert.match(await pathways.locator('.awakening-pathways-status').innerText(),/3 documented visitor-facing outcomes/);
  const outcomes=pathways.locator('.awakening-pathways-node');
  assert.equal(await outcomes.count(),3,'Three real published page outcomes, no synthetic fruit');
  await outcomes.filter({hasText:'Federation Atlas'}).click();
  assert.match(await living.locator('.awakening-cinema-detail').innerText(),/Federation Atlas/);
  assert.equal(await living.locator('.awakening-explorer-crumbs button').last().getAttribute('aria-current'),'location');
  assert.match(await living.locator('.awakening-cinema-source').getAttribute('href'),/atlas\.html$/);
  await living.locator('.awakening-explorer-history button').filter({hasText:'Previous place'}).click();
  assert.match(await living.locator('.awakening-cinema-detail').innerText(),/Public Exploration/);
  // Flight handoff must carry the selected source to the existing evidence
  // experience and focus its real SVG rather than merely scrolling the page.
  await living.locator('.awakening-cinema-flight').click();
  assert.equal(await page.locator('#evidence-scene').evaluate(el=>document.activeElement===el),true,
    'Evidence Flight receives keyboard focus after source handoff');
  assert.match(await page.locator('#evidence-info').innerText(),/Public Exploration/);
  await navigator.locator('.awakening-close').click();
  assert.equal(await navigatorOpen.getAttribute('aria-expanded'),'false');
  await page.screenshot({path:'artifacts/living-universe/tree-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[],'Browser JavaScript errors');
  console.log('PASS',width,'px',JSON.stringify(bounds));
 }catch(e){
  // Preserve exact failing viewport, hit geometry and the rendered page even if
  // a Playwright scroll/click times out before the normal screenshots are made.
  let diagnostic={width,error:String(e?.stack||e)};
  try{
    diagnostic=await page.evaluate(({width,error})=>{
      const selectors=['.world','.world-passage','.world-passage-source','.world-gate','.pilgrimage','.pilgrimage-toggle','.pilgrimage-body','.awakening-navigator'];
      const elements=Object.fromEntries(selectors.map(selector=>{
        const el=document.querySelector(selector);if(!el)return [selector,null];
        const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
        const top=x>=0&&x<innerWidth&&y>=0&&y<innerHeight?document.elementFromPoint(x,y):null;
        const style=getComputedStyle(el);
        return [selector,{rect:{x:r.x,y:r.y,width:r.width,height:r.height},position:style.position,zIndex:style.zIndex,display:style.display,visibility:style.visibility,hit:top===el||el.contains(top),interceptor:top?{tag:top.tagName,id:top.id,className:typeof top.className==='string'?top.className:''}:null}];
      }));
      return {width,error,scrollY,scrollWidth:document.documentElement.scrollWidth,viewport:{width:innerWidth,height:innerHeight},elements};
    },diagnostic);
    await page.screenshot({path:'artifacts/living-universe/FAIL-'+width+'.png',fullPage:true,animations:'disabled',timeout:10000});
  }catch(captureError){diagnostic.captureError=String(captureError)}
  failures.push(width+': '+e.stack+'\\nDIAGNOSTIC '+JSON.stringify(diagnostic));
  console.error('FAIL',width,JSON.stringify(diagnostic));
 }
 finally{await page.close()}
}
const reduced=await browser.newPage({viewport:{width:390,height:800},reducedMotion:'reduce'});
try{await reduced.goto(base,{waitUntil:'networkidle'});assert.equal(await reduced.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);await reduced.screenshot({path:'artifacts/living-universe/tree-390-reduced-motion.png',fullPage:true})}catch(e){failures.push('reduced motion: '+e.stack)}finally{await reduced.close();await browser.close()}
if(failures.length){console.error(failures.join('\n\n'));process.exitCode=1}
