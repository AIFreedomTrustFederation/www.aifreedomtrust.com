// Run with: npm install --no-save playwright && npx playwright install chromium
// then: node validation/browser-acceptance.mjs
// Never mark acceptance complete if the browser or page cannot launch.
import { chromium, devices } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pageURL = pathToFileURL(resolve(root, 'index.html')).href;
const out = resolve(root, 'validation/screenshots');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({headless:true});
try {
  for (const [name, config] of [['desktop', {viewport:{width:1440,height:900}}], ['android', devices['Pixel 7']]]) {
    const context = await browser.newContext({...config, reducedMotion:'reduce'});
    const page = await context.newPage();
    const errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto(pageURL,{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('#stage').waitFor({state:'visible'});
    for(const id of ['#btn-atlas','#btn-export','#btn-import','#btn-menu','#stage','#reflect']) {
      if(await page.locator(id).count()!==1) throw new Error(`${name}: missing ${id}`);
    }
    await page.screenshot({path:resolve(out,`${name}-tree.png`),fullPage:true,animations:'disabled'});
    await page.locator('#btn-atlas').click();
    await page.locator('#atlas').waitFor({state:'visible'});
    await page.screenshot({path:resolve(out,`${name}-atlas.png`),fullPage:true,animations:'disabled'});
    await page.locator('#a-close').click();
    await page.locator('#btn-menu').click();
    await page.locator('#prefs').waitFor({state:'visible'});
    await page.screenshot({path:resolve(out,`${name}-preferences.png`),fullPage:true,animations:'disabled'});
    if(errors.length) throw new Error(`${name}: JS errors: ${errors.join('; ')}`);
    await context.close();
    console.log(`PASS ${name}: controls, Atlas, preferences, screenshots, no page errors`);
  }
} finally {await browser.close();}
