import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeOperatorDossier,inspectDossier,lineageRoutes} from './portable-dossier-theatre.mjs';
const packet={schema:'aift.living-universe.lineage-dossier.v1',subject:'out',evidenceClass:'imported-declarations-unverified',independentlyVerified:false,records:[{id:'repo',label:'Source repository',stage:'root'},{id:'system',label:'Service',stage:'branch'},{id:'out',label:'Published product',stage:'fruit',destination:'https://example.org/app'}],routes:[{rootId:'repo',ids:['repo','system','out'],stageGaps:[]}],evidenceGaps:[],routeDisplayTruncated:false};
test('actual AIFT-OS export contract becomes public lineage without invented edges',()=>{const report=inspectDossier(normalizeOperatorDossier(packet));assert.deepEqual(report.edges,[{from:'repo',to:'system'},{from:'system',to:'out'}]);assert.deepEqual(lineageRoutes(report),[['repo','system','out']]);assert.equal(report.verification,'Imported declaration only')});
test('no repository becomes a fruit and missing routes remain missing',()=>{const report=inspectDossier(normalizeOperatorDossier({...packet,routes:[]}));assert.equal(report.roots.length,0);assert.equal(report.focus.stage,'fruit');assert.deepEqual(lineageRoutes(report),[]);assert.match(report.gaps.join(' '),/No contributing repository root/)});
test('rejects forged undeclared route endpoints and oversized packets',()=>{assert.throws(()=>normalizeOperatorDossier({...packet,routes:[{ids:['repo','unknown','out']}]}),/absent record/);assert.throws(()=>normalizeOperatorDossier({...packet,records:Array(351).fill(packet.records[0])}),/limits/)});
test('unsupported schema is not silently reinterpreted',()=>{assert.equal(normalizeOperatorDossier({schema:'unknown'}).schema,'unknown')});

test('operator evidence gaps and truncated route disclosures survive public import',()=>{
 const dossier=normalizeOperatorDossier({...packet,evidenceGaps:['Missing CI proof',{message:'Product URL not confirmed'}],routeDisplayTruncated:true});
 const report=inspectDossier(dossier);
 assert.match(report.gaps.join(' | '),/Missing CI proof/);
 assert.match(report.gaps.join(' | '),/Product URL not confirmed/);
 assert.match(report.gaps.join(' | '),/truncated/);
});
test('single-record routes cannot smuggle absent record identifiers',()=>{
 assert.throws(()=>normalizeOperatorDossier({...packet,routes:[{ids:['ghost']}]}),/absent record/);
 assert.throws(()=>normalizeOperatorDossier({...packet,routes:[{ids:[]}]}),/Invalid operator route/);
});
