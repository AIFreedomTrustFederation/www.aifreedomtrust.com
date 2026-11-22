// Standalone White Paper walkthrough at real mobile/tablet/desktop widths.
// Inspect top, chapter reading, and footer; keep the public embedded experience separate.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/white-paper',{recursive:true});
try {
 for(const [width,height] of [[320,700],[360,780],[390,850],[768,1024],[1280,800]]){
  const page=await browser.newPage({viewport:{width,height},
   isMobile:width<900,hasTouch:width<900,deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('http://127.0.0.1:4178/cinematic-world.html',{waitUntil:'load'});
  assert.equal(response?.status(),200);

  assert.equal(await page.title(),'The Living White Paper · AIFT Tree of Emergence');
  const markers=page.locator('.wp-tree-marker');
  const chapters=page.locator('.wp-chapter');
  const library=page.locator('#wp-library .wp-library-links a');
  assert.equal(await markers.count(),6,'Six zoomable chapter landmarks are rendered');
  assert.equal(await chapters.count(),6,'All six chapters remain readable in normal document flow');
  assert.equal(await library.count(),7,'Seven existing white paper links appear');
  const geometry=await page.evaluate(()=>{
   const reader=document.querySelector('#white-paper-atlas').getBoundingClientRect();
   const scene=document.querySelector('.world svg.tree').getBoundingClientRect();
   return {reader:{left:reader.left,right:reader.right,width:reader.width},
    tree:{left:scene.left,right:scene.right,width:scene.width},
    horizontal:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  assert.ok(geometry.horizontal<=width+20,'No page horizontal overflow: '+JSON.stringify(geometry));
  assert.ok(geometry.reader.left>=-4&&geometry.reader.right<=width+4,
    'White Paper reading room must fit viewport: '+JSON.stringify(geometry));

  // Directly interact with a landmark and confirm it operates the SAME SVG camera.
  await page.locator('.wp-tree-marker[data-wp-stage="root"]').click();
  const zoomed=await page.locator('.world svg.tree').getAttribute('viewBox');
  assert.equal(Number(zoomed.trim().split(/\s+/)[2]),520,'Chapter selection must zoom scene');
  assert.match(await page.locator('#wp-focus-title').textContent(),/Humanity remains the author/);
  assert.equal(await page.locator('#wp-read-current').getAttribute('href'),'#wp-chapter-root');
  assert.equal(await page.locator('#wp-chapter-root').getAttribute('data-wp-selected'),'true');
  assert.equal(await page.locator('.world').getAttribute('data-wp-zoom'),'reading');
  await page.screenshot({path:'artifacts/white-paper/focus-'+width+'.png',animations:'disabled'});

  await page.getByRole('button',{name:'Fit entire Tree'}).click();
  assert.equal(await page.locator('.world svg.tree').getAttribute('viewBox'),'0 0 1000 1000');
  assert.equal(await page.locator('.world').getAttribute('data-wp-zoom'),'overview');

  // The reading navigation must still function when JavaScript enhances the Tree.
  await page.locator('.wp-toc [data-wp-index="leaf"]').click();
  assert.match(new URL(page.url()).hash,/wp-chapter-leaf/);
  assert.equal(await page.locator('#wp-chapter-leaf').getAttribute('data-wp-selected'),'true');
  await page.locator('#wp-chapter-fruit [data-wp-focus="fruit"]').click();
  assert.equal(await page.locator('#wp-read-current').getAttribute('href'),'#wp-chapter-fruit');

  // Inspect the page's actual top/middle/bottom during a full reader scroll.
  for(const [name,location] of [['top',0],['middle',.5],['bottom',1]]){
   await page.evaluate(r=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    scrollTo({top:Math.round(max*r),behavior:'instant'});
   },location);
   const extent=await page.evaluate(()=>({full:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert.ok(extent.full<=extent.viewport+20,'No horizontal overflow while reading '+name);
   if(width===390)await page.screenshot({
    path:'artifacts/white-paper/'+name+'-'+width+'.png',animations:'disabled'
   });
  }
  assert.deepEqual(errors,[],'No JavaScript page errors');
  await page.close();
 }

 const embedded=await browser.newPage({viewport:{width:390,height:850},isMobile:true,hasTouch:true});
 await embedded.goto('http://127.0.0.1:4178/cinematic-world.html?embedded=1',{waitUntil:'load'});
 assert.equal(await embedded.locator('.wp-tree-marker').count(),0,
  'Public homepage iframe cannot gain the White Paper Tree labels');
 assert.equal(await embedded.locator('#white-paper-atlas').isVisible(),false,
  'Public homepage iframe cannot show White Paper reader');
 assert.equal(await embedded.locator('#wp-tree-focus').isVisible(),false,
  'Public homepage iframe cannot show White Paper inspector');
 assert.equal(await embedded.locator('.wp-nav-link').isVisible(),false,
  'Public homepage iframe cannot show White Paper navigation');
 await embedded.close();
 console.log('Standalone White Paper and embedded public-portal isolation passed.');
}finally{
 await browser.close();
}
