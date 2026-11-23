// Standalone White Paper walkthrough at real mobile/tablet/desktop widths.
// Inspect top, chapter reading, and footer; keep the public embedded experience separate.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const preview='http://127.0.0.1:4178/cinematic-world.html';

// Record startup navigation before Playwright can scroll an element into view.
async function openPreview(page,fragment=''){
 await page.addInitScript(()=>{
  window.startupStageClicks=[];
  document.addEventListener('click',event=>{
   const stage=event.target.closest?.('button[data-stage]');
   if(stage)window.startupStageClicks.push(stage.dataset.stage);
  },true);
 });
 const response=await page.goto(preview+fragment,{waitUntil:'load'});
 assert.equal(response?.status(),200);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 assert.deepEqual(await page.evaluate(()=>window.startupStageClicks),[],
  'Loading the preview must never activate a stage button');
}

async function atDestination(page,id){
 await page.waitForFunction(id=>{
  const rect=document.getElementById(id).getBoundingClientRect();
  return rect.top>=-2&&rect.top<innerHeight/4&&rect.bottom>0;
 },id,{timeout:5000});
}

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/white-paper',{recursive:true});
try {
 for(const [width,height] of [[320,700],[360,780],[390,850],[768,1024],[1280,800]]){
  const page=await browser.newPage({viewport:{width,height},
   isMobile:width<900,hasTouch:width<900,deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await openPreview(page);
  assert.equal(await page.evaluate(()=>scrollY),0,'Fresh preview must stay at the Tree entrance');
  assert.equal(await page.locator('#evidence-stage').inputValue(),'root');
  assert.equal(await page.locator('.stages [data-stage="root"]').getAttribute('aria-pressed'),'true');
  assert.ok(await page.locator('#evidence-back').isDisabled(),'Startup must not add a navigation step');

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

  // Readability must be tested, not inferred from no-horizontal-overflow alone.
  const markerFits=await page.evaluate(()=>[...document.querySelectorAll('.wp-tree-marker')].map(marker=>{
   const text=marker.querySelector('.wp-marker-title').getBBox();
   const backdrop=marker.querySelector('.wp-marker-back').getBBox();
   return {stage:marker.dataset.wpStage,
    left:text.x-backdrop.x, right:(backdrop.x+backdrop.width)-(text.x+text.width)};
  }));
  assert.ok(markerFits.every(({left,right})=>left>=8&&right>=8),
    'Professional Tree labels must fit inside their visible badges: '+JSON.stringify(markerFits));
  const sourceRegister=page.locator('#wp-source-register');
  assert.equal(await sourceRegister.getByRole('link').count(),10,
    'Six public sources and four original Aetherion source editions remain available');
  if(width<=440){
   const nav=await page.evaluate(()=>{
    const header=document.querySelector('.hud').getBoundingClientRect();
    const intro=document.querySelector('.world > .intro').getBoundingClientRect();
    return {headerBottom:header.bottom,introTop:intro.top,
     links:[...document.querySelectorAll('.hud nav a')].map(link=>{
      const rect=link.getBoundingClientRect(),style=getComputedStyle(link);
      return {name:link.textContent.trim(),height:rect.height,left:rect.left,right:rect.right,
        fontSize:parseFloat(style.fontSize)};
     })};
   });
   assert.equal(nav.links.length,4,'All four primary links must remain visible');
   assert.ok(nav.links.every(link=>link.height>=44&&link.fontSize>=13&&link.left>=-1&&link.right<=width+1),
     'Mobile navigation must have accessible size and fit screen: '+JSON.stringify(nav));
   assert.ok(nav.headerBottom<=nav.introTop-4,'Navigation must never cover the White Paper heading: '+JSON.stringify(nav));
  }
  
  if(width===320||width===390){
   const paragraph=page.locator('#wp-chapter-root .wp-chapter-lead');
   const baseFont=await paragraph.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
   const treeView=await page.locator('.world svg.tree').getAttribute('viewBox');
   for(let i=0;i<4;i++)await page.locator('#wp-text-larger').click();
   assert.equal((await page.locator('#wp-text-size').textContent()).trim(),'200%');
   assert.ok(await page.locator('#wp-text-larger').isDisabled());
   const largeFont=await paragraph.evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
   assert.ok(largeFont>=baseFont*1.9,'Text failed magnification '+JSON.stringify({baseFont,largeFont}));
   assert.equal(await page.locator('.world svg.tree').getAttribute('viewBox'),treeView);
   const extent=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert.ok(extent.width<=width+4,'Magnified text overflow '+JSON.stringify(extent));
   await page.locator('#wp-text-reset').click();
   assert.equal((await page.locator('#wp-text-size').textContent()).trim(),'100%');
   assert.ok(await page.locator('#wp-text-smaller').isDisabled());
  }
  if(width===1280){
   const leaf=page.locator('.wp-tree-marker[data-wp-stage="leaf"]');
   const camera=await page.locator('.world svg.tree').getAttribute('viewBox');
   await leaf.hover();
   assert.match(await page.locator('#wp-focus-title').textContent(),/Knowledge must return to its sources/);
   assert.equal(await page.locator('.world').getAttribute('data-wp-preview'),'leaf');
   assert.equal(await page.locator('.world svg.tree').getAttribute('viewBox'),camera);
   await page.mouse.move(0,0);
   assert.equal(await page.locator('#wp-focus-title').textContent(),'Select a Tree chapter');
   await leaf.focus();
   assert.equal(await page.locator('.world').getAttribute('data-wp-preview'),'leaf');
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('#wp-chapter-leaf').getAttribute('data-wp-selected'),'true');
  }

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

 // Cold links, rather than same-document clicks, exercise the startup race.
 for(const reducedMotion of ['reduce','no-preference']){
  for(const id of ['','white-paper-atlas','wp-chapter-root','wp-chapter-leaf']){
   const page=await browser.newPage({viewport:{width:390,height:850},isMobile:true,hasTouch:true,reducedMotion});
   await openPreview(page,id?'#'+id:'');
   if(!id)assert.equal(await page.evaluate(()=>scrollY),0);
   else await atDestination(page,id);
   if(id==='white-paper-atlas'){
    await page.locator('.wp-intro').getByRole('link',{name:'Back to the Tree',exact:true}).tap();
    await atDestination(page,'tree-of-emergence');
    await page.locator('.world-beacon-trunk').tap();
    await atDestination(page,'evidence-world');
    assert.equal(await page.locator('#evidence-stage').inputValue(),'trunk');
    assert.deepEqual(await page.evaluate(()=>window.startupStageClicks),['trunk']);
   }else if(id){
    assert.equal(await page.locator('#'+id).getAttribute('data-wp-selected'),'true');
   }
   await page.close();
  }
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
