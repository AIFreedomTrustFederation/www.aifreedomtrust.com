import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const stages=['root','trunk','branch','leaf','flower','fruit'];
const html=read('cinematic-world.html');
const script=read('white-paper-tree.js');
const css=read('white-paper-tree.css');

test('White Paper is a source-linked six-chapter reading document, not a claim of 14 verified worlds',()=>{
 assert.match(html,/id="white-paper-atlas"/);
 assert.match(html,/Explore the Federation\. Follow the sources\./);
 const positions=stages.map(s=>html.indexOf('id="wp-chapter-'+s+'"'));
 assert.ok(positions.every(p=>p>=0),'All six chapters must be present');
 assert.deepEqual([...positions].sort((a,b)=>a-b),positions,'Chapters must follow source lineage order');
 for(const stage of stages){
  assert.match(html,new RegExp('data-wp-stage="'+stage+'"'));
  assert.match(html,new RegExp('data-wp-focus="'+stage+'"'));
  assert.match(html,new RegExp('href="#wp-chapter-'+stage+'"'));
  assert.match(html,new RegExp('id="wp-heading-'+stage+'"'));
 }
 assert.match(html,/not an exhaustive transcription/i);
 assert.match(html,/not proof of wider technical readiness/i);
 assert.doesNotMatch(html,/>14 verified worlds</);
});

test('Every chapter cites the published website or approved public documentation',()=>{
 const block=html.slice(html.indexOf('<section id="white-paper-atlas"'),html.indexOf('<section id="seven-movements"'));
 const links=[...block.matchAll(/href="([^"]+)"/g)].map(x=>x[1]);
 for(const stage of stages){
  const segment=block.slice(block.indexOf('id="wp-chapter-'+stage+'"'),block.indexOf('</article>',block.indexOf('id="wp-chapter-'+stage+'"')));
  assert.match(segment,/class="wp-sources"/,'Chapter '+stage+' must have citations');
  assert.match(segment,/<a href=/,'Chapter '+stage+' must have an original source');
 }
 for(const href of links){
  assert.ok(href.startsWith('index.html#')||href.startsWith('docs/')||
    href.startsWith('https://aifreedomtrustfederation.github.io/AI-Freedom-Trust/docs/pdf/')||
    href.startsWith('https://github.com/AIFreedomTrustFederation/AI-Freedom-Trust/blob/main/docs/')||
    ['atlas.html','constellations.html','index.html','lineage-data.js'].includes(href)||
    href.startsWith('#wp-chapter-')||href==='#white-paper-atlas'||href==='#tree-of-emergence'||href==='#wp-library',
    'Unexpected citation or chapter link: '+href);
  assert.doesNotMatch(href,/javascript:|data:/i);
 }
 const paper=block.slice(block.indexOf('<section class="wp-source-library"'),block.indexOf('</section>',block.indexOf('<section class="wp-source-library"')));
 assert.equal((paper.match(/\.pdf"/g)||[]).length,7,'Use all seven established Library of Living Works links');
 assert.match(block,/Redshift/);
 assert.match(block,/Greenshift/);
 assert.match(block,/Blueshift/);
 assert.match(block,/Violetshift/);
});

test('Standalone atlas augments source projection while embedded public entrance is isolated',()=>{
 assert.ok(html.indexOf('white-paper-tree.css')<html.indexOf('cinematic-responsive-frame.css'));
 assert.ok(html.indexOf('cinematic-source-projection.js')<html.indexOf('white-paper-tree.js'));
 assert.match(script,/classList\.contains\('embedded-world'\)\)return/);
 assert.match(css,/html\.embedded-world \.white-paper-reader/);
 assert.match(css,/html\.embedded-world \.wp-nav-link/);
 assert.match(script,/scene\.setAttribute\('viewBox'/);
 assert.match(script,/new MutationObserver\(updateZoom\)/);
 assert.match(read('cinematic-source-projection.js'),/living-source-node, \.wp-tree-marker/);
 assert.doesNotMatch(script,/fetch\(|XMLHttpRequest|localStorage|sendBeacon/);
});

test('Tree markers are accessible and focus actual chapter source references',()=>{
 assert.equal((script.match(/id:'(?:root|trunk|branch|leaf|flower|fruit)'/g)||[]).length,6);
 assert.match(script,/role:'button',tabindex:'0'/);
 assert.match(script,/aria-label':'Zoom to White Paper chapter:/);
 assert.match(script,/if\(touchPoints\.size>=2\)blockedUntil/);
 assert.match(script,/e\.key==='Enter'\|\|e\.key===' '/);
 assert.match(css,/data-wp-zoom="reading"/);
 assert.match(css,/\.wp-toc a/);
 assert.match(css,/\.wp-chapter/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/prefers-reduced-data:reduce/);
});

test('Professional White Paper labels preserve the Tree metaphor without reducing subjects to organs',()=>{
 const labels=['HUMAN AGENCY','SHARED COVENANT','FEDERATION STRUCTURE','SOURCE EVIDENCE','EMERGING WORK','PUBLIC EXPERIENCES'];
 for(const name of labels)assert.equal(html.split(' · '+name+' <small class="wp-metaphor">').length-1,2,'Navigation and chapter must agree: '+name);
 for(const name of ['Human Agency','Shared Covenant','Federation Structure','Source Evidence','Emerging Work','Public Experiences'])assert.ok(script.includes("label:'"+name+"'"),'Missing Tree landmark: '+name);
 assert.equal((html.match(/class="wp-claim-note"/g)||[]).length,6,'Six documented claim boundaries');
});

test('Readable source editions and original papers remain distinct and accountable',()=>{
 const block=html.slice(html.indexOf('<section id="white-paper-atlas"'),html.indexOf('<section id="seven-movements"'));
 assert.equal((block.match(/class="wp-edition"/g)||[]).length,7);
 const originals=block.split('https://github.com/AIFreedomTrustFederation/AI-Freedom-Trust/blob/main/docs/').length-1;
 assert.equal(originals,4,'Four readable source editions, not invented full-paper coverage');
 for(const path of ['docs/federation-operating-model.md','docs/organization-map.md','docs/security-and-privacy.md','docs/public-repo-inventory.md','lineage-data.js'])assert.ok(block.includes('href="'+path+'"'),'Missing documented foundation '+path);
 assert.match(block,/not independently reviewed/);
 assert.match(block,/does not claim causal proof, peer review, or independent replication/);
});
