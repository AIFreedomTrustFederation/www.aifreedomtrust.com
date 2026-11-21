/* Static safety contract for the source-backed cinematic lens. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('cinematic-living-lens.js','utf8');
const css=fs.readFileSync('cinematic-living-lens.css','utf8');
const html=fs.readFileSync('cinematic-world.html','utf8');
test('lens is loaded by canonical HTML',()=>{assert.match(html,/cinematic-living-lens\.css/);assert.match(html,/cinematic-living-lens\.js/)});
test('six stages and verifiable fruit gate',()=>{assert.match(js,/\['root','trunk','branch','leaf','flower','fruit'\]/);assert.match(js,/isFruit/);assert.match(js,/github/);assert.match(js,/AIFT_LINEAGE_NODES/);assert.match(js,/\.living-source-node\[data-node\]/)});
test('reversible, accessible and reduced motion',()=>{assert.match(js,/viewBox/);assert.match(js,/aria-pressed/);assert.match(js,/prefers-reduced-motion/);assert.match(css,/:focus-visible/);assert.match(css,/max-width:700px/)});
test('no fabricated progression or tracking',()=>{assert.doesNotMatch(js,/fetch\(|localStorage|sendBeacon|analytics|\bXP\b|Math\.random/);assert.doesNotMatch(js,/setInterval|setTimeout/)});
