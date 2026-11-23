import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('late-loaded atmosphere no longer breaks responsive Tree grid',()=>{
 const html=read('cinematic-world.html'),base=read('cinematic-world.css'),atmosphere=read('cinematic-atmosphere.css');
 assert.ok(html.indexOf('cinematic-world.css')<html.indexOf('cinematic-atmosphere.css'));
 assert.match(base,/\.world\s*\{\s*display:\s*grid;/);
 assert.match(base,/\.world \.tree\s*\{\s*position:\s*relative;\s*grid-row:\s*2;/);
 assert.doesNotMatch(atmosphere,/\.world\{display:block;padding-top:/);
 assert.doesNotMatch(atmosphere,/width:120vw;right:-38vw/);
 assert.doesNotMatch(atmosphere,/width:135vw;right:-44vw/);
});

test('stage navigation remains in scrollable grid flow after depth effects',()=>{
 const css=read('cinematic-depth-composition.css');
 assert.match(css,/\.world \.world-beacons\{max-width:100%;overflow-x:auto;overflow-y:hidden\}/);
 assert.match(css,/\.world \.world-gates\{max-width:100%\}/);
 assert.doesNotMatch(css,/\.world \.world-beacons\{max-width:100%;overflow:visible\}/);
 assert.doesNotMatch(css,/\.world \.world-gates\{max-width:calc\(100% - 2rem\)\}/);
});

test('previous pinch camera and source bounds stay intact',()=>{
 const js=read('cinematic-source-projection.js'),html=read('cinematic-world.html');
 assert.match(js,/AIFT_UNIVERSAL_ZOOM\?\.frame/);
 assert.match(js,/suppressTapUntil/);
 assert.match(html,/universal-zoom\.js/);
 assert.match(html,/meta name="viewport" content="width=device-width,initial-scale=1"/);
});
