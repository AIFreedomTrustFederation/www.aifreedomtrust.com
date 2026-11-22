import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('one final stylesheet owns theatre framing at every resolution',()=>{
 const html=read('cinematic-world.html');
 const styles=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(styles.at(-1),'cinematic-responsive-frame.css',
  'The layout owner must load after all decorative CSS layers');
 const css=read('cinematic-responsive-frame.css');
 for(const token of ['grid-template-rows: none','grid-auto-flow: row',
   '.world > svg.tree','.world > .intro','.world > .world-beacons',
   '.world > .world-gates','.world > .aift-scene-toolbar',
   '@media (max-width: 440px)','@media (min-width: 900px)',
   'orientation: landscape','prefers-reduced-motion:reduce',
   'env(safe-area-inset-bottom)'])assert.ok(css.includes(token),token);
 assert.doesNotMatch(css,/right:\s*-\d+(?:vw|%)/,
  'No negative viewport Tree offsets in the canonical layout');
 assert.doesNotMatch(css,/width:\s*(?:120|125|135|145|155)vw/,
  'No scene forced wider than the screen');
});

test('visible Fit Tree toolbar controls the same source-backed camera',()=>{
 const js=read('cinematic-source-projection.js');
 for(const token of ["sceneToolbar.className='aift-scene-toolbar'",
  "scene.insertAdjacentElement('afterend',sceneToolbar)",
  "addSceneAction('Fit entire Tree','Fit Tree'",
  "addSceneAction('Zoom out of Tree'",
  "addSceneAction('Zoom into Tree'",
  "new MutationObserver(updateCameraValue)"])
   assert.ok(js.includes(token),token);
 assert.match(js,/scene\.style\.touchAction='none'/);
 assert.match(js,/AIFT_UNIVERSAL_ZOOM\?\.frame/);
 assert.doesNotMatch(js,/localStorage|sendBeacon|XMLHttpRequest/);
});
