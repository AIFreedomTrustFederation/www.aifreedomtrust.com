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
  const host=page.locator('#seven-movements');
  await host.waitFor({state:'visible'});
  const svg=page.locator('#seven-movements .seven-stage svg').first();
  await svg.waitFor({state:'visible'});
  assert.ok(await svg.locator('.seven-source-constellation circle').count()>0,'Published lineage nodes should render');
  const bounds=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth,stage:document.querySelector('#seven-movements .seven-stage')?.getBoundingClientRect().toJSON()}));
  assert.ok(bounds.scroll<=bounds.viewport+2,'Horizontal overflow '+JSON.stringify(bounds));
  assert.ok(bounds.stage.width>0&&bounds.stage.height>0,'Stage has positive dimensions');
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
  await page.screenshot({path:'artifacts/living-universe/tree-'+width+'.png',fullPage:true});
  assert.deepEqual(errors,[],'Browser JavaScript errors');
  console.log('PASS',width,'px',JSON.stringify(bounds));
 }catch(e){failures.push(width+': '+e.stack);console.error('FAIL',width,e)}
 finally{await page.close()}
}
const reduced=await browser.newPage({viewport:{width:390,height:800},reducedMotion:'reduce'});
try{await reduced.goto(base,{waitUntil:'networkidle'});assert.equal(await reduced.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);await reduced.screenshot({path:'artifacts/living-universe/tree-390-reduced-motion.png',fullPage:true})}catch(e){failures.push('reduced motion: '+e.stack)}finally{await reduced.close();await browser.close()}
if(failures.length){console.error(failures.join('\n\n'));process.exitCode=1}
