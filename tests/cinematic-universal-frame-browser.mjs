// Browser geometry and camera acceptance beyond the original four viewport sizes.
// Real computed layout is checked, not just the presence of CSS declarations.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/living-universe',{recursive:true});
const sizes=[
 [320,700],[360,780],[390,850],[600,900],[768,1024],
 [740,390],[900,900],[1280,800],[1920,1080]
];
try{
 for(const [width,height] of sizes){
  const mobile=width<900;
  const context=await browser.newContext({
   viewport:{width,height},hasTouch:mobile,isMobile:mobile,
   deviceScaleFactor:1,reducedMotion:'reduce'
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('http://127.0.0.1:4178/cinematic-world.html',{waitUntil:'load'});
  assert.equal(response?.status(),200);
  const layout=await page.evaluate(()=>{
   const world=document.querySelector('.world');
   const tree=world.querySelector('svg.tree');
   const intro=world.querySelector('.intro');
   const bar=world.querySelector('.aift-scene-toolbar');
   const caption=world.querySelector('.passage-caption');
   const beacons=world.querySelector('.world-beacons');
   const gates=world.querySelector('.world-gates');
   const rect=el=>{
    const r=el.getBoundingClientRect();
    return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
   };
   return {
    display:getComputedStyle(world).display,
    transform:getComputedStyle(tree).transform,
    translate:getComputedStyle(tree).translate,
    position:getComputedStyle(tree).position,
    gridRows:getComputedStyle(world).gridTemplateRows,
    scrollWidth:document.documentElement.scrollWidth,
    world:rect(world),tree:rect(tree),intro:rect(intro),
    toolbar:rect(bar),caption:rect(caption),beacons:rect(beacons),gates:rect(gates)
   };
  });
  const diagnostic=()=>JSON.stringify({width,height,layout});
  assert.equal(layout.display,'grid','World needs one CSS grid: '+diagnostic());
  assert.equal(layout.position,'relative','Tree must remain in normal flow: '+diagnostic());
  assert.equal(layout.transform,'none','Tree camera must use viewBox, not a CSS transform: '+diagnostic());
  assert.equal(layout.translate,'none','Atmospheric offsets cannot displace Tree: '+diagnostic());
  assert.ok(layout.tree.width>=120&&layout.tree.height>=120,'Tree must be playable: '+diagnostic());
  for(const [name,box] of [['tree',layout.tree],['toolbar',layout.toolbar],
    ['caption',layout.caption],['beacons',layout.beacons],['gates',layout.gates]]){
   assert.ok(box.width>0&&box.left>=-4&&box.right<=width+4,
    name+' must fit horizontally: '+diagnostic());
  }
  assert.ok(layout.caption.top>=Math.max(layout.intro.bottom,layout.toolbar.bottom)-4,
   'Stage caption must follow intro and toolbar, not overlap the opening copy: '+diagnostic());
  assert.ok(layout.scrollWidth<=width+20,'No full-page horizontal overflow: '+diagnostic());
  const columns=width>=900||(width>=560&&height<=540&&width>height);
  if(columns){
   assert.ok(layout.intro.right<=layout.tree.left+6,
     'Two-column intro and Tree must not overlap: '+diagnostic());
  }else{
   assert.ok(layout.intro.bottom<=layout.tree.top+5,
     'Mobile intro and Tree need separate vertical regions: '+diagnostic());
   const center=layout.tree.left+layout.tree.width/2;
   assert.ok(Math.abs(center-width/2)<=Math.max(14,width*.08),
     'Tree must be horizontally centered: '+diagnostic());
   assert.ok(layout.tree.top<height*.98,
     'Tree must begin in the opening viewport: '+diagnostic());
  }

  const toolbar=page.locator('.world .aift-scene-toolbar button');
  assert.equal(await toolbar.count(),3,'Zoom Out / Fit Tree / Zoom In must be visible');
  const tree=page.locator('.world svg.tree');
  await tree.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
  const touches=await tree.evaluate(el=>{
   const r=el.getBoundingClientRect();
   return [.35,.5,.65].map(f=>{
    const x=r.left+r.width*f,y=r.top+r.height*.5,hit=document.elementFromPoint(x,y);
    return !!hit&&(hit===el||el.contains(hit));
   });
  });
  assert.ok(touches.some(Boolean),'At least one central scene touch area must be unobstructed');
  await toolbar.nth(2).click();
  const zoomed=await tree.getAttribute('viewBox');
  assert.ok(Number(zoomed.trim().split(/\s+/)[2])<1000,'Zoom In must change the viewBox');
  await toolbar.nth(1).click();
  assert.equal(await tree.getAttribute('viewBox'),'0 0 1000 1000',
    'Fit Tree must restore the complete scene');
  await toolbar.nth(0).click();
  assert.equal(await tree.getAttribute('viewBox'),'0 0 1000 1000',
    'Zoom Out must not overshoot the full scene');

  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({
   path:'artifacts/living-universe/responsive-'+width+'x'+height+'.png',
   animations:'disabled'
  });
  if(width===390){
   const viewport=await page.locator('meta[name=viewport]').getAttribute('content');
   assert.doesNotMatch(viewport,/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i);
   const cdp=await context.newCDPSession(page);
   await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:2});
   const scale=await page.evaluate(()=>visualViewport.scale);
   assert.ok(scale>=1.5,'Native page zoom must not be disabled: '+scale);
   await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
  }
  assert.deepEqual(errors,[],'No browser runtime exceptions: '+JSON.stringify(errors));
  console.log('Responsive framing PASS:',width+'x'+height,JSON.stringify(layout.tree));
  await context.close();
 }
}finally{
 await browser.close();
}
