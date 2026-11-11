import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {preparePublishedExpedition} from '../published-expedition-bridge.mjs';
import {inspectLineageInterchange} from '../world-lineage-interchange.mjs';

// Integration contract: consume the actual published artifact, not a synthetic fixture.
const manifest=JSON.parse(readFileSync(new URL('../data/living-universe.json',import.meta.url),'utf8'));
test('real published map exports a valid, read-only MoBox interchange packet',()=>{
  const {packet,report}=preparePublishedExpedition(manifest);
  assert.equal(packet.schema,'aift.lineage.interchange/1');
  assert.equal(packet.attestation,'not-independently-verified');
  assert.equal(packet.sourceStatus,'curated-source-map');
  assert.equal(report.sourceNodes,manifest.nodes.length);
  assert.equal(report.sourceRelationships,manifest.edges.length);
  assert.equal(packet.nodes.length,manifest.nodes.length);
  assert.equal(inspectLineageInterchange(JSON.parse(JSON.stringify(packet))).valid,true);
});
test('real source repositories remain roots, never fruit outcomes',()=>{
  const {packet}=preparePublishedExpedition(manifest);
  for(const node of packet.nodes.filter(n=>n.kind==='root')){
    assert.match(node.url,/^https:\/\/github\.com\//);
    assert.ok(!packet.outcomes.some(o=>o.id===node.id),node.id);
  }
  for(const outcome of packet.outcomes){
    assert.ok(!new URL(outcome.url).hostname.endsWith('github.com'),outcome.id);
    assert.equal(outcome.verification,'source-lineage-only');
  }
});
test('published curated relationships cannot be upgraded by export',()=>{
  const {packet,report}=preparePublishedExpedition(manifest);
  const eligible=manifest.edges.filter(e=>e.status==='source-backed'&&e.relation==='contributes-to'&&e.evidenceUrl);
  assert.equal(packet.edges.length,eligible.length);
  assert.equal(report.curatedOnlyRelationships,manifest.edges.length-eligible.length);
  for(const edge of packet.edges){
    assert.ok(eligible.some(e=>e.from===edge.from&&e.to===edge.to&&e.evidenceUrl===edge.evidenceUrl));
  }
});
test('every exported evidence link is safe HTTPS and source-backed',()=>{
  const {packet}=preparePublishedExpedition(manifest);
  for(const edge of packet.edges){
    const url=new URL(edge.evidenceUrl);
    assert.equal(url.protocol,'https:');
    assert.equal(url.username,'');
    assert.equal(url.password,'');
  }
});
