import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const site='http://127.0.0.1:4178/';
const shared=['index.html','atlas.html','root-lineage.html'];
const routes=[...shared,'cinematic-world.html','living-universe-explorer.html',
 'constellations.html','pages.html','evidence-expedition.html'];
const browser=await chromium.launch();
const failures=[];

async function checkBoard(page){
 const board=page.locator('.aift-journey-board');
 await board.getByRole('button',{name:/Source Cartography/}).click();
 await board.getByLabel('Find a documented destination').fill('AIFT-Genesis');
 const option=board.locator('.jb-path button').filter({hasText:'AIFT-Genesis'});
 await option.click();
 assert.match(await board.locator('#jb-summary').innerText(),/1 of \d+ visited/);
 await board.locator('.jb-ancestry button').last().click();
 const link=board.getByRole('link',{name:'Inspect documented source'});
 assert.equal(new URL(await link.getAttribute('href')).pathname.toLowerCase(),'/aifreedomtrustfederation/aift-genesis');
 // Verify same-tab navigation and return without depending on GitHub's availability.
 const url=await link.getAttribute('href');
 await page.context().route(url,route=>route.fulfill({contentType:'text/plain',body:'destination'}));
 const original=page.url();
 await link.click();
 await page.waitForURL(url);
 await page.goBack();
 await page.waitForURL(original);
}
try{
 for(const width of [320,360,390,768]){
  const context=await browser.newContext({viewport:{width,height:850},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  for(const path of width<390?shared:routes){
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   try{
    const response=await page.goto(site+path);
    assert.equal(response.status(),200);
    await page.evaluate(()=>document.fonts.ready);
    if(shared.includes(path)&&path!=='index.html')await checkBoard(page);
    const metrics=await page.evaluate(width=>({
     actual:document.documentElement.scrollWidth,
     offenders:[...document.body.querySelectorAll('*')].filter(el=>el instanceof HTMLElement&&el.getBoundingClientRect().right>width+2)
      .sort((a,b)=>b.getBoundingClientRect().right-a.getBoundingClientRect().right)
      .slice(0,12).map(el=>[el.tagName,el.id,el.className,Math.round(el.getBoundingClientRect().right)])
    }),width);
    assert.ok(metrics.actual<=width+2,JSON.stringify(metrics));
    assert.deepEqual(errors,[]);
   }catch(error){failures.push(path+' at '+width+'px: '+error.message)}
   await page.close();
  }
  await context.close();
 }
}finally{await browser.close()}
assert.deepEqual(failures,[]);
console.log('Public routes, phone widths and both journey boards passed.');
