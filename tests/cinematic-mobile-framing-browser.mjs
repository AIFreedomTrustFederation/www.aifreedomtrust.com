// Real browser geometry regression for Android framing after pinch-zoom repair.
// This does not assert source truth or readiness; only measured presentation.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/living-universe',{recursive:true});
try {
 for(const width of [360,390,768]){
  const page=await browser.newPage({
   viewport:{width,height:850},
   deviceScaleFactor:1,
   hasTouch:width<=390,
   isMobile:width<=390,
   reducedMotion:'reduce'
  });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('http://127.0.0.1:4178/cinematic-world.html',{waitUntil:'load'});
  assert.equal(response?.status(),200,'Canonical HTML must be served');

  const frame=await page.evaluate(()=>{
   const world=document.querySelector('.world');
   const tree=world.querySelector('svg.tree');
   const rect=tree.getBoundingClientRect(),container=world.getBoundingClientRect();
   return {
    screenWidth:innerWidth,screenHeight:innerHeight,
    worldDisplay:getComputedStyle(world).display,
    treePosition:getComputedStyle(tree).position,
    treeRow:getComputedStyle(tree).gridRowStart,
    left:rect.left,right:rect.right,top:rect.top,
    width:rect.width,height:rect.height,
    center:rect.left+rect.width/2,
    worldLeft:container.left,worldRight:container.right,
    viewport:tree.getAttribute('viewBox')
   };
  });
  assert.equal(frame.worldDisplay,'grid','The mobile theatre must remain a grid: '+JSON.stringify({width,frame}));
  assert.equal(frame.treePosition,'relative','Tree must stay in flow: '+JSON.stringify({width,frame}));
  assert.equal(frame.treeRow,'2','Tree should have its own scene row: '+JSON.stringify({width,frame}));
  assert.ok(frame.width>=120,'Tree must be large enough to explore: '+JSON.stringify({width,frame}));
  assert.ok(frame.left>=-4&&frame.right<=frame.screenWidth+4,
   'Full Tree viewport must remain horizontally visible: '+JSON.stringify({width,frame}));
  assert.ok(Math.abs(frame.center-frame.screenWidth/2)<=Math.max(14,frame.screenWidth*.08),
   'Tree must be horizontally centered: '+JSON.stringify({width,frame}));
  assert.ok(frame.top<frame.screenHeight*.9,
   'Tree should begin within the opening viewport: '+JSON.stringify({width,frame}));

  await page.screenshot({path:'artifacts/living-universe/framed-'+width+'.png',animations:'disabled'});
  await page.locator('svg.tree').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
  await page.screenshot({path:'artifacts/living-universe/tree-centered-'+width+'.png',animations:'disabled'});
  assert.deepEqual(errors,[],'No browser runtime errors');
  await page.close();
 }
 console.log('Mobile cinematic framing passed at 360, 390 and 768 CSS pixels.');
} finally {
 await browser.close();
}
