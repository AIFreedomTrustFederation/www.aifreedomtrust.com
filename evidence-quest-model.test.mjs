import test from 'node:test';import assert from 'node:assert/strict';
import {buildEvidenceQuests} from './evidence-quest-model.mjs';
const root={id:'repo',stage:'root'},trunk={id:'federation',stage:'trunk'},fruit={id:'app',stage:'fruit',url:'https://example.org/app'};
const report={nodes:[root,trunk,fruit],roots:[root],focus:fruit,edges:[{from:'repo',to:'federation'},{from:'federation',to:'app'}],gaps:['Declaration not verified']};
test('declared roots, paths and HTTPS destinations are structural checks only',()=>{const q=buildEvidenceQuests(report);assert.equal(q.progress,3);assert.equal(q.total,4);assert.equal(q.checks[3].complete,false);assert.deepEqual(q.checks[1].evidence,['repo','federation','app']);assert.match(q.verification,/not independently verified/);});
test('a repository is never counted as a fruit',()=>{const q=buildEvidenceQuests({...report,focus:root});assert.equal(q.fruitCount,1);assert.equal(q.checks[2].complete,false)});
test('a missing route and unsafe fruit destination cannot complete checks',()=>{const q=buildEvidenceQuests({...report,edges:[],roots:[],nodes:[fruit],focus:{...fruit,url:'javascript:alert(1)'}});assert.equal(q.progress,0);assert.equal(q.checks[1].complete,false)});
test('stage counts reflect only imported records',()=>{const q=buildEvidenceQuests(report);assert.equal(q.stageCounts.find(s=>s.stage==='root').count,1);assert.equal(q.stageCounts.find(s=>s.stage==='flower').count,0)});
