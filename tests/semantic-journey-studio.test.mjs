import test from 'node:test';import assert from 'node:assert/strict';
import {deriveEvidenceJourneys} from '../semantic-journey-studio.mjs';
const node=(kind,extra={})=>({id:kind,label:kind,kind,sourceRoots:[],evidenceUrls:[],...extra});
test('repositories remain roots and are never treated as deliverables',()=>{
 const journeys=deriveEvidenceJourneys({nodes:[node('root',{destination:'https://github.com/example/source'}),node('fruit',{destination:'https://github.com/example/source'})]});
 assert.equal(journeys[0].kind,'root');assert.equal(journeys[0].tasks.some(t=>t.id==='outcome'),false);
 assert.equal(journeys[1].tasks.find(t=>t.id==='outcome').done,false);
});
test('only source evidence and a real outcome destination satisfy journey conditions',()=>{
 const [journey]=deriveEvidenceJourneys({nodes:[node('fruit',{sourceRoots:['repo'],evidenceUrls:['https://example.org/attestation'],destination:'https://example.org/product'})]});
 assert.equal(journey.ready,true);assert.equal(journey.tasks.length,4);
});
test('missing provenance never creates readiness or achievements',()=>{
 const [journey]=deriveEvidenceJourneys({nodes:[node('branch')]});
 assert.equal(journey.ready,false);assert.equal(journey.tasks.find(t=>t.id==='roots').done,false);
 assert.equal('xp' in journey,false);assert.equal('achievement' in journey,false);
});
test('structural roots without attestation are insufficient',()=>{
 const [journey]=deriveEvidenceJourneys({nodes:[node('leaf',{sourceRoots:['repo']})]});
 assert.equal(journey.tasks.find(t=>t.id==='roots').done,false);
});
