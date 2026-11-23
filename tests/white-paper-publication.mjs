// Verify the seven editions and follow the public entrance through a paper and back.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const root='http://127.0.0.1:4178/';
const publisher='https://aifreedomtrustfederation.github.io/AI-Freedom-Trust/docs/pdf/';
const editions=new Map([
 ['Flight Paper','aetherion-flight-paper-post-quantum-sovereign-network.pdf'],
 ['Genesis White Paper · alpha','aetherion-genesis-whitepaper-alpha.pdf'],
 ['Circleunchain + Biozoe · source summary','aetherion-circleunchain-biozoe-source-summary.pdf'],
 ['Aetherion Economy','aetherion-restorative-civilization-economy.pdf'],
 ['AetherCore White Paper · Volume I','aethercore-white-paper-volume-i.pdf'],
 ['Empirical Trust Paper','aethercore-empirical-trust-density-covid.pdf'],
 ['One Eternal Scroll of Aloha','one-eternal-scroll-of-aloha.pdf']
]);
const browser=await chromium.launch({channel:'chromium'});
try{
 const page=await browser.newPage({viewport:{width:390,height:850},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 await page.goto(root);
 await page.locator('.cinematic-entry__bar a[href="cinematic-world.html"]').tap();
 const scene=page.locator('.world svg.tree');
 await page.locator('.wp-tree-marker[data-wp-stage="root"]').tap();
 await page.locator('#wp-read-current').tap();
 assert.equal(new URL(page.url()).hash,'#wp-chapter-root');
 await page.getByRole('link',{name:'Browse the original papers'}).tap();
 assert.equal(new URL(page.url()).hash,'#wp-library');

 const catalog=await page.request.get('https://api.github.com/repos/AIFreedomTrustFederation/AI-Freedom-Trust/contents/docs/pdf');
 assert.equal(catalog.status(),200,'Publisher document catalog');
 const files=new Map((await catalog.json()).map(file=>[file.name,file]));
 const links=page.locator('.wp-library-links a');
 assert.equal(await links.count(),editions.size);
 const verified=new Set();
 for(const link of await links.all()){
  const label=(await link.innerText()).replace('↗','').trim();
  const name=editions.get(label);
  assert.ok(name&&!verified.has(name),'Unexpected or duplicate edition: '+label);
  const href=await link.getAttribute('href');
  assert.equal(href,publisher+name);
  const response=await page.request.get(href);
  assert.equal(response.status(),200,href);
  const bytes=await response.body();
  assert.equal(bytes.subarray(0,5).toString(),'%PDF-',name);
  const sha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  assert.equal(sha,files.get(name)?.sha,'Published bytes differ from the original '+name);
  verified.add(name);
  console.log('Verified original PDF',name,bytes.length,sha);
 }
 const genesis=page.getByRole('link',{name:/Genesis White Paper/});
 const url=await genesis.getAttribute('href');
 await genesis.tap();
 await page.waitForURL(url);
 await page.goBack();
 await page.waitForURL(root+'cinematic-world.html#wp-library');
 await page.goBack();
 await page.waitForURL(root+'cinematic-world.html#wp-chapter-root');
 await page.locator('#wp-chapter-root').getByRole('link',{name:'Back to the Tree'}).tap();
 await page.waitForURL(root+'cinematic-world.html#tree-of-emergence');
 assert.ok(await scene.isVisible());
 await page.getByRole('link',{name:'Explore Tree sources as a list'}).tap();
 const directory=page.locator('#living-source-directory');
 const genesisNode=directory.getByRole('button',{name:'AIFT-Genesis · root',exact:true});
 const osNode=directory.getByRole('button',{name:'AIFT-OS · root',exact:true});
 await genesisNode.tap();
 assert.equal(await genesisNode.getAttribute('aria-pressed'),'true');
 await osNode.focus();
 await page.keyboard.press('Enter');
 assert.equal(await osNode.getAttribute('aria-pressed'),'true');
 assert.equal(await genesisNode.getAttribute('aria-pressed'),'false');
 assert.ok(await osNode.evaluate(el=>document.activeElement===el));
 console.log('Homepage, Tree, Roots, original paper, browser Back, Tree and accessible source list passed.');
}finally{await browser.close()}
