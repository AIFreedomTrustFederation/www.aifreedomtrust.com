import test from 'node:test';import assert from 'node:assert/strict';
import {inspectDossier,safeDestination} from './portable-dossier-theatre.mjs';
const base={kind:'aift-living-universe-dossier',schemaVersion:'1.0.0',focusId:'out',provenance:{verification:'not-independently-verified'},nodes:[{id:'repo',stage:'root',label:'Source'},{id:'out',stage:'fruit',label:'Product',url:'https://example.org/app'}],edges:[{from:'repo',to:'out'}]};
test('traces declared root and keeps verification explicit',()=>{const x=inspectDossier(base);assert.equal(x.roots[0].id,'repo');assert.equal(x.verification,'Imported declaration only');assert.equal(x.nodes.length,2)});
test('missing product destination remains a gap',()=>{const x=inspectDossier({...base,nodes:base.nodes.map(n=>n.id==='out'?{...n,url:'https://github.com/owner/repo'}:n)});assert.equal(x.focus.stage,'fruit')});
test('rejects invalid edges and duplicate identities',()=>{assert.throws(()=>inspectDossier({...base,edges:[{from:'missing',to:'out'}]}));assert.throws(()=>inspectDossier({...base,nodes:[base.nodes[0],base.nodes[0]]}))});
test('detects backwards stage links and missing roots',()=>{const x=inspectDossier({...base,edges:[{from:'out',to:'repo'}]});assert.ok(x.gaps.some(g=>g.includes('Nonprogressive')));assert.ok(x.gaps.some(g=>g.includes('No contributing')))});
test('rejects unsafe destinations',()=>{assert.equal(safeDestination('javascript:alert(1)'),null);assert.equal(safeDestination('http://example.com'),null);assert.equal(safeDestination('https://example.com/a'),'https://example.com/a')});
