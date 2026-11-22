import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const sandbox={};
vm.runInNewContext(read('universal-zoom.js'),sandbox);
const {frame,fractions}=sandbox.AIFT_UNIVERSAL_ZOOM;

test('two-finger scene zoom anchors to the exact midpoint, including letterboxing',()=>{
 const rect={left:100,top:50,width:400,height:600};
 const f=fractions(rect,{x:300,y:350});
 assert.equal(f.x,.5);assert.equal(f.y,.5);
 const z=frame({start:{x:200,y:200,w:600,h:600},anchor:{x:500,y:500},
   center:{x:300,y:350},rect,ratio:2});
 assert.equal(z.w,300);assert.equal(z.h,300);
 assert.equal(z.x,350);assert.equal(z.y,350);
});
test('moving midpoint shifts camera to preserve the world point under the fingers',()=>{
 const rect={left:0,top:0,width:400,height:600};
 const z=frame({start:{x:200,y:300,w:600,h:600},anchor:{x:350,y:450},
   center:{x:100,y:200},rect,ratio:2});
 assert.equal(z.w,300);
 assert.equal(z.x,275);assert.equal(z.y,375);
});
test('pinch out, pinch in and overshoot are bounded and resettable',()=>{
 const rect={left:0,top:0,width:400,height:400};
 const args={start:{x:200,y:200,w:600,h:600},anchor:{x:500,y:500},
   center:{x:200,y:200},rect};
 assert.equal(frame({...args,ratio:10}).w,250);
 const out=frame({...args,ratio:.1});
 assert.equal(out.w,1000);
 assert.equal(out.x,0);assert.equal(out.y,0);
 assert.throws(()=>frame({...args,ratio:0}),/positive pinch ratio/);
 assert.throws(()=>frame({...args,ratio:Number.NaN}),/positive pinch ratio/);
});
test('only one pointer controller owns the opening Tree',()=>{
 const html=read('cinematic-world.html');
 const producer=read('cinematic-source-projection.js');
 const navigator=read('cinematic-awakening-navigator.js');
 const producerIndex=html.indexOf('universal-zoom.js');
 const cameraIndex=html.indexOf('cinematic-source-projection.js');
 const navigatorIndex=html.indexOf('cinematic-awakening-navigator.js');
 assert.ok(producerIndex>=0&&producerIndex<cameraIndex&&cameraIndex<navigatorIndex);
 assert.match(producer,/AIFT_HERO_POINTER_OWNER='source-projection'/);
 assert.match(navigator,/if\(!window\.AIFT_HERO_POINTER_OWNER\)/);
 assert.match(producer,/AIFT_UNIVERSAL_ZOOM\?\.frame/);
 assert.match(producer,/readView\(\)/);
});
test('native browser pinch remains available on pages and text',()=>{
 for(const page of ['index.html','cinematic-world.html','living-universe-full.html']){
  const html=read(page);
  const viewport=html.match(/<meta\s+name="viewport"\s+content="([^"]+)"/i);
  assert.ok(viewport,page+' needs a responsive viewport');
  assert.doesNotMatch(viewport[1],/(?:user-scalable\s*=\s*no|maximum-scale\s*=\s*1)(?:\s|,|$)/i);
 }
 const css=read('cinematic-awakening-navigator.css');
 assert.match(css,/\.world svg\.tree\{touch-action:pan-y\}/);
 const js=read('cinematic-source-projection.js');
 assert.match(js,/if\(!e\.ctrlKey&&!e\.metaKey\)return/);
});
