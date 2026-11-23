/* Cross-page Android/Tablet census. Observational diagnostics for the pages
 * outside the current White Paper slice: do not misrepresent an audit as a
 * passing end-to-end test. Every finding records its measured viewport.
 */
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const pages=[
 ['home','index.html'],
 ['white-paper','cinematic-world.html'],
 ['atlas','atlas.html'],
 ['root-lineage','root-lineage.html'],
 ['tree-explorer','living-universe-explorer.html'],
 ['constellations','constellations.html'],
 ['page-map','pages.html'],
 ['evidence-expedition','evidence-expedition.html']
];
const origin='http://127.0.0.1:4178/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
await mkdir('artifacts/mobile-site-audit',{recursive:true});
const report={purpose:'Measured mobile/tablet portal census; does not certify every interaction',
 pages:[],summary:{tested:0,unreachable:0,overflow:0,scriptErrors:0}};
try{
 for(const [width,height] of [[390,850],[768,1024]]){
  const context=await browser.newContext({
   viewport:{width,height},isMobile:width===390,hasTouch:width===390,
   reducedMotion:'reduce',deviceScaleFactor:1
  });
  for(const [name,path] of pages){
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.stack||e.message));
   const entry={name,path,width,height,load:null,issues:[],metrics:{}};
   try{
    const response=await page.goto(origin+path,{waitUntil:'load',timeout:30000});
    entry.load=response?.status()??null;
    await page.waitForTimeout(180);
    entry.metrics=await page.evaluate(()=>{
     const el=document.documentElement;
     const viewport=document.querySelector('meta[name=viewport]')?.getAttribute('content')||'';
     const visible=selector=>[...document.querySelectorAll(selector)].filter(x=>{
       const r=x.getBoundingClientRect(),style=getComputedStyle(x);
       return style.display!=='none'&&style.visibility!=='hidden'&&r.width>0&&r.height>0;
     });
     const targets=visible('button,a[href],input,select,textarea');
     const below=targets.map(x=>{
       const b=x.getBoundingClientRect();
       return {label:(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,65),
        w:Math.round(b.width),h:Math.round(b.height)};
     }).filter(x=>x.h<40||x.w<30);
     return {scrollWidth:el.scrollWidth,viewportWidth:innerWidth,
       scrollHeight:el.scrollHeight,viewportMeta:viewport,
       visibleTouchTargets:targets.length,smallTargets:below.slice(0,14),
       visibleNavigation:visible('nav').length};
    });
    if(entry.load!==200)entry.issues.push('HTTP status '+entry.load);
    if(entry.metrics.scrollWidth>width+8)entry.issues.push(
      'horizontal overflow '+(entry.metrics.scrollWidth-width)+'px');
    if(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i.test(entry.metrics.viewportMeta))
      entry.issues.push('browser page pinch-zoom is restricted');
    if(width===390)await page.screenshot({
      path:'artifacts/mobile-site-audit/'+name+'-390.png',
      animations:'disabled'
    });
   }catch(error){entry.issues.push('navigation or render error: '+error.message.slice(0,250))}
   if(errors.length)entry.issues.push('runtime errors: '+errors.slice(0,3).join(' | '));
   report.pages.push(entry);
   report.summary.tested++;
   if(entry.load!==200)report.summary.unreachable++;
   if(entry.metrics.scrollWidth>width+8)report.summary.overflow++;
   if(errors.length)report.summary.scriptErrors++;
   console.log('MOBILE CENSUS',name,width,JSON.stringify({load:entry.load,issues:entry.issues,metrics:entry.metrics}));
   await page.close();
  }
  await context.close();
 }
}finally{await browser.close()}
await writeFile('artifacts/mobile-site-audit/report.json',JSON.stringify(report,null,2));
console.log('MOBILE CENSUS SUMMARY',JSON.stringify(report.summary));
const failed=report.pages.filter(entry=>entry.issues.length);
if(failed.length)throw new Error(failed.map(entry=>entry.name+' at '+entry.width+'px: '+entry.issues.join(' | ')).join('\n'));
