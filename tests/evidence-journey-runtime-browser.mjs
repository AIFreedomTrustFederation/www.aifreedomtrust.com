import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/evidence-journey',{recursive:true});
try {
 for(const width of [390,768]){
  const context=await browser.newContext({viewport:{width,height:850},
    isMobile:width===390,hasTouch:width===390,reducedMotion:'reduce'});
  for(const name of ['atlas.html','root-lineage.html']){
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.stack||error.message));
   const response=await page.goto('http://127.0.0.1:4178/'+name,{waitUntil:'load'});
   assert.equal(response?.status(),200);
   const host=page.locator('.aift-journey-board');
   assert.equal(await host.count(),1,'One shared evidence journey is initialized');
   const summary=host.locator('#jb-summary');
   assert.match(await summary.textContent(),/session exploration, not verified achievement/);
   const first=host.locator('.jb-path button').first();
   assert.ok(await first.isVisible(),'A curated path should be navigable');
   await first.click();
   assert.match(await summary.textContent(),/1 of \d+ visited|\d+ of \d+ visited/);
   const filter=host.locator('#jb-search');
   await filter.fill('not a documented source name');
   assert.match(await host.locator('#jb-filter-count').textContent(),/0 of \d+ documented destinations match/);
   const clear=host.locator('#jb-clear');
   const hit=await clear.evaluate(button=>{
     const r=button.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
     const target=document.elementFromPoint(x,y);
     return {x,y,button:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},
       intercepted:!!target&&target!==button&&!button.contains(target),
       interceptor:target?.outerHTML?.slice(0,220)};
   });
   assert.equal(hit.intercepted,false,'Clear-search button must receive a real touch: '+JSON.stringify(hit));
   await clear.click();
   assert.equal(await filter.inputValue(),'');
   assert.deepEqual(errors,[],'No runtime errors during shared evidence journey');
   await page.screenshot({path:'artifacts/evidence-journey/'+name.replace('.html','')+'-'+width+'.png',animations:'disabled'});
   await page.close();
  }
  await context.close();
 }
}finally{await browser.close()}
