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
  const before=await viewport();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:two(25)});
  for(const s of [35,45,60])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:two(s)});
  await page.waitForTimeout(50);
  const zoomed=await viewport();
  assert.ok(zoomed<before,'Pinch-out must zoom into Tree: '+JSON.stringify({width,before,zoomed}));
  for(const s of [45,30,15])await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:two(s)});
  await page.waitForTimeout(50);
  const backed=await viewport();
  assert.ok(backed>zoomed,'Pinch-in must zoom out of Tree: '+JSON.stringify({width,zoomed,backed}));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.screenshot({path:'artifacts/living-universe/universal-zoom-'+width+'.png',animations:'disabled'});
  assert.deepEqual(errors,[],'No runtime errors during pinch gestures');
  await context.close();
 }
 console.log('Real Chromium two-finger Tree zoom passed at 390 and 768px.');
}finally{
 await browser.close();
}
