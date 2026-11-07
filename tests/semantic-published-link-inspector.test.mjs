import assert from 'node:assert/strict';
import {collectPublishedLinks} from '../semantic-published-link-inspector.mjs';
function anchor(href,label){return {getAttribute:key=>key==='href'?href:null,textContent:label};}
function section(anchors){return {querySelectorAll:()=>anchors};}
const sections=[
 section([anchor('https://github.com/AIFreedomTrustFederation/AIFT-OS','AIFT-OS source'),anchor('https://github.com/AIFreedomTrustFederation/AIFT-OS','AIFT-OS source'),anchor('javascript:alert(1)','Unsafe'),anchor('mailto:person@example.org','Mail')]),
 section([anchor('/docs/organization-map.md','Organization map'),anchor('https://example.org/product','Example published link')])
];
const entries=collectPublishedLinks(sections,'https://www.aifreedomtrust.com/');
assert.equal(entries.length,3,'deduplicates links and excludes unsafe/non-web schemes');
assert.equal(entries[0].kind,'source link','repositories are classified as source links, never fruits');
assert.equal(entries[0].workspace,0);
assert.equal(entries[1].url,'https://www.aifreedomtrust.com/docs/organization-map.md');
assert.equal(entries[2].kind,'published link','external links are not automatically certified as products');
assert.ok(entries.every(e=>!e.kind.includes('fruit')));
const {readFileSync}=await import('node:fs');
const nav=readFileSync(new URL('../semantic-explorer-navigation.mjs',import.meta.url),'utf8');
const css=readFileSync(new URL('../semantic-explorer-navigation.css',import.meta.url),'utf8');
assert.match(nav,/mountPublishedEvidenceInspector\(doc,nav,sections,activate\)/);
assert.match(css,/\.explorer-link-inspector/);
assert.match(css,/@media\(max-width:600px\)/);
assert.match(css,/focus-visible/);
console.log('Published source-link inspector contract passed');
