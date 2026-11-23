// Real Chromium two-pointer acceptance for the canonical Tree and zoom separation.
// Runs against the local HTML server at port 4178; never opens external destinations.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/living-universe',{recursive:true});
try{
 for(const width of [390,768]){
  const context=await browser.newContext({viewport:{width,height:850},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('http://127.0.0.1:4178/cinematic-world.html',{waitUntil:'load'});
  assert.equal(response?.status(),200);
  assert.equal(await page.evaluate(()=>window.AIFT_HERO_POINTER_OWNER),'source-projection');
  const tree=page.locator('.world svg.tree');
  const viewport=async()=>tree.evaluate(el=>el.viewBox.baseVal.width);
  // Move the Tree into view without changing layout, source nodes, or selection.
  await page.evaluate(()=>{
   const r=document.querySelector('.world svg.tree').getBoundingClientRect();
   scrollTo({top:scrollY+r.top-70,behavior:'instant'});
  });
  await page.waitForTimeout(100);
  const point=await tree.evaluate(el=>{
   const r=el.getBoundingClientRect();
   for(const fy of [.35,.5,.65,.2,.8,.1,.9]){
    for(const fx of [.5,.35,.65,.25,.75]){
     const x=r.left+r.width*fx,y=r.top+r.height*fy;
     const hit=xx=>{
      if(xx<30||xx>innerWidth-30||y<30||y>innerHeight-30)return false;
      const top=document.elementFromPoint(xx,y);
      return top&&(top===el||el.contains(top))&&!top.closest?.('.living-source-node');
     };
     if(hit(x-25)&&hit(x+25))return{x,y};
    }
   }
   return null;
  });
  assert.ok(point,'There must be a genuine exposed two-finger Tree surface at '+width+'px');
  const cdp=await context.newCDPSession(page);
  const two=spread=>[{x:point.x-spread,y:point.y,id:1},{x:point.x+spread,y:point.y,id:2}];
  const beforeBox=await tree.boundingBox();
  assert.ok(beforeBox&&beforeBox.width>=120,'Tree must have a visible viewport at '+width+'px');
  assert.ok(beforeBox.x>=-3&&beforeBox.x+beforeBox.width<=width+3,
   'Tree may not be displaced outside phone width before pinch');
  assert.ok(Math.abs(beforeBox.x+beforeBox.width/2-width/2)<=Math.max(14,width*.08),
   'Camera surface must start centered, not off to the right');
  const before=await viewport();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:two(25)});
  for(const s of [35,45,60])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:two(s)});
  await page.waitForTimeout(50);
  const zoomed=await viewport();
  assert.ok(zoomed<before,'Pinch-out must zoom into Tree: '+JSON.stringify({width,before,zoomed}));
  for(const s of [45,30,15])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:two(s)});
  await page.waitForTimeout(50);
  const backed=await viewport();
  const afterBox=await tree.boundingBox();
  assert.ok(afterBox,'Tree must remain measurable after two-finger input');
  assert.ok(Math.abs(afterBox.x-beforeBox.x)<=2&&Math.abs(afterBox.width-beforeBox.width)<=2,
   'Pinch must change SVG viewBox only, not move or scale its CSS layout box: '
   +JSON.stringify({width,beforeBox,afterBox}));
  assert.ok(backed>zoomed,'Pinch-in must zoom out of Tree: '+JSON.stringify({width,zoomed,backed}));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await page.locator('.wp-tree-marker[data-wp-active="true"]').count(),0,
   'A pinch must not select a white paper chapter');
  assert.equal(new URL(page.url()).hash,'','A pinch must not navigate to a chapter');
  await page.screenshot({path:'artifacts/living-universe/universal-zoom-'+width+'.png',animations:'disabled'});
  assert.deepEqual(errors,[],'No runtime errors during pinch gestures');
  await context.close();
 }
 console.log('Real Chromium two-finger Tree zoom passed at 390 and 768px.');
}finally{
 await browser.close();
}
