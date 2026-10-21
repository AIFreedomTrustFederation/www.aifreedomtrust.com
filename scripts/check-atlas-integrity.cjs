#!/usr/bin/env node
/* Zero-dependency regression checks for the published Federation Atlas.
 * Fail closed if canonical section IDs, links or the bidirectional experience disappear.
 * No rewriting of the published source is performed.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const homepage=read('index.html'),atlas=read('atlas.html'),fruit=read('fruit-atlas.js'),v3=read('atlas-v3.js');
const sections=['umbrella','tree-explorer','projects','structure','roadmap','docs-title'];
const errors=[];
function check(label,condition){if(!condition)errors.push(label);else console.log('PASS '+label)}
for(const id of sections){
 check('homepage anchor #'+id,new RegExp('id=["\\\']'+id+'["\\\']').test(homepage));
 check('homepage fruit mapping '+id,fruit.includes('id:"'+id+'"')||fruit.includes('"id":"'+id+'"'));
 check('Atlas destination '+id,atlas.includes("id:'"+id+"'"));
 check('v3 reader destination '+id,v3.includes("id:'"+id+"'"));
}
check('source library heading retained',homepage.includes('Follow every idea back to its source.'));
check('Vision heading retained',homepage.includes('A federation is strongest when every part knows why it exists.'));
check('original project constellation heading retained',homepage.includes('Different branches. Shared roots. One unfolding purpose.'));
check('original structure heading retained',homepage.includes('The Federation is organized so that vision can move without losing accountability.'));
check('original roadmap heading retained',homepage.includes('The next chapter is convergence.'));
check('original published Tree Explorer retained',homepage.includes('data-aift-tree-explorer'));
check('published library PDF links retained',(homepage.match(/\\.pdf/g)||[]).length>=6);
check('homepage has fruit atlas',homepage.includes('id="fruit-atlas"'));
check('homepage links to immersive atlas',homepage.includes('href="atlas.html"'));
check('return-to-fruit control',fruit.includes('Return to '));
check('source reader overlay',v3.includes('v3-modal'));
check('reader loads original homepage',v3.includes("frame.src='index.html#'"));
check('source reader return action',v3.includes("close.addEventListener('click',hide)"));
check('canonical organization map retained',homepage.includes('docs/organization-map.md'));
check('source text is never inserted via innerHTML',!v3.includes('originalHTML.body.innerHTML'));
for(const asset of ['atlas-v3.css','atlas-v3.js','fruit-atlas.css','fruit-atlas.js'])check('local asset '+asset,fs.existsSync(path.join(root,asset)));
if(errors.length){console.error('\nFAIL '+errors.length+' checks:\n'+errors.join('\n'));process.exit(1)}
console.log('\nAtlas integrity checks passed: '+sections.length+' fruit destinations and all core content guards.');
