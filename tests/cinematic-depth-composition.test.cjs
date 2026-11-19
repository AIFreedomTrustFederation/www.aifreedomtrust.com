/* Static integration guard for the cinematic depth milestone.
   Run: node tests/cinematic-depth-composition.test.cjs
   Browser screenshot acceptance is separate and mandatory. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'cinematic-world.html'),'utf8');
const css=fs.readFileSync(path.join(root,'cinematic-depth-composition.css'),'utf8');
const legacy=fs.readFileSync(path.join(root,'cinematic-world.css'),'utf8');
const ref='cinematic-depth-composition.css';
assert.equal((html.match(new RegExp(ref.replaceAll('.','\\.'),'g'))||[]).length,1,'load new sheet exactly once');
assert.ok(html.indexOf('cinematic-seven-movements.css')<html.indexOf(ref),'new composition follows canonical layers');
for(const source of ['lineage-data.js','cinematic-seven-movements.js','cinematic-source-projection.js']){
 assert.ok(html.includes(source),'preserve published data/interaction script: '+source);
}
for(const selector of ['.world .tree','.world .intro','.world .world-gates','.world .world-beacons']){
 assert.ok(css.includes(selector),'missing coordinated stage surface: '+selector);
}
assert.ok(css.includes('prefers-reduced-motion:reduce'),'reduced motion fallback');
assert.ok(css.includes('prefers-reduced-data:reduce'),'reduced data fallback');
assert.ok(css.includes('max-width:440px'),'narrow Android breakpoint');
assert.ok(css.includes('max-height:640px'),'short Android viewport breakpoint');
assert.ok(!/https?:\\/\\//.test(css),'visual layer must not add remote requests');
assert.ok(!/url\\s*\\(/i.test(css),'visual layer must not load new assets');
assert.ok(legacy.includes('.world'),'canonical CSS must remain present');
console.log('Cinematic depth static integration: PASS (browser acceptance still required)');
