/* Static safety contract for the source-backed cinematic lens. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('cinematic-living-lens.js','utf8');
const css=fs.readFileSync('cinematic-living-lens.css','utf8');
const html=fs.readFileSync('cinematic-world.html','utf8');
test('lens is loaded by canonical HTML',()=>{assert.match(html,/cinematic-living-lens\.css/);assert.match(html,/cinematic-living-lens\.js/)});
test('six stages and verifiable fruit gate',()=>{assert.match(js,/\['root','trunk','branch','leaf','flower','fruit'\]/);assert.match(js,/isFruit/);assert.match(js,/github/);assert.match(js,/AIFT_LINEAGE_NODES/);assert.match(js,/\.living-source-node\[data-node\]/)});
test('reversible, accessible and reduced motion',()=>{assert.match(js,/viewBox/);assert.match(js,/aria-pressed/);assert.match(js,/prefers-reduced-motion/);assert.match(css,/:focus-visible/);assert.match(css,/max-width:700px/)});
test('no fabricated progression or tracking',()=>{assert.doesNotMatch(js,/fetch\(|localStorage|sendBeacon|analytics|\bXP\b|Math\.random/);assert.doesNotMatch(js,/setInterval|setTimeout/)});

test('search, lineage breadcrumbs, reversible selection and spatial overview are source-bound',()=>{
 assert.match(js,/const inspectable=records\.filter/);
 assert.match(js,/eligible\(n\)/);
 assert.match(js,/lineage\(node\)/);
 assert.match(js,/findPoint\(node\.id\)/);
 assert.match(js,/trail\.push/);
 assert.match(js,/trail\.pop/);
 assert.match(js,/search\.addEventListener\('input'/);
 assert.match(js,/aria-current/);
 assert.match(css,/awakening-explorer-map-focus/);
 assert.match(css,/awakening-explorer-results/);
});

test('the cinematic lens continues into the existing source-backed Evidence Flight',()=>{
 assert.match(js,/Enter Evidence Flight/);
 assert.match(js,/getElementById\('evidence-world'\)/);
 assert.match(js,/getElementById\('evidence-list'\)/);
 assert.match(js,/getElementById\('evidence-search'\)/);
 assert.match(js,/record\.label/);
 assert.match(js,/scrollIntoView/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(css,/awakening-cinema-flight/);
 assert.match(html,/id="evidence-world"/);
});


test('stage selection, sibling exploration and back history use the same documented lineage',()=>{
 assert.match(js,/siblingsFor\(node\)/);
 assert.match(js,/moveSibling\(delta\)/);
 assert.match(js,/previousSibling\.disabled/);
 assert.match(js,/nextSibling\.disabled/);
 assert.match(js,/button\[data-stage\]/);
 assert.match(js,/if\(node\)displayNode\(node\)/);
 assert.match(js,/displayNode\(previous,false\)/);
 assert.match(js,/const inspectable=records\.filter/);
});

test('downstream pathway inspector is derived from documented parent IDs',()=>{
 assert.match(js,/const childrenByParent=new Map\(\)/);
 assert.match(js,/childrenByParent\.get\(n\.parent\)/);
 assert.match(js,/function downstream\(node\)/);
 assert.match(js,/const queue=\[\{node,depth:0\}\]/);
 assert.match(js,/seen\.has\(child\.id\)/);
 assert.match(js,/outcomes=found\.filter\(item=>item\.node\.kind==='fruit'&&isFruit\(item\.node\)\)/);
 assert.match(js,/renderPathways\(node\)/);
 assert.match(js,/No verified visitor-facing outcome is linked downstream/);
 assert.match(js,/No further published descendants/);
 assert.match(js,/button\.addEventListener\('click',\(\)=>displayNode\(child\)\)/);
 assert.match(css,/\.awakening-pathways-list/);
 assert.match(css,/\.awakening-pathways-node:focus-visible/);
 assert.match(css,/min-height:48px/);
});
