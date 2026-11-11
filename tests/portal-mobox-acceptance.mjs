#!/usr/bin/env node
// Cross-repository, read-only integration gate.
// Usage: node tests/portal-mobox-acceptance.mjs /path/to/AIFT-OS
// Both repositories must be checked out at the exact PR heads under review.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {preparePublishedExpedition} from '../published-expedition-bridge.mjs';
import {inspectLineageInterchange} from '../world-lineage-interchange.mjs';

const portal=resolve(fileURLToPath(new URL('..',import.meta.url)));
const mobox=process.argv[2] && resolve(process.argv[2]);
if(!mobox) {
  console.error('Usage: node tests/portal-mobox-acceptance.mjs /path/to/AIFT-OS');
  process.exit(2);
}
const htmlPath=join(mobox,'internal/uxihttp/expedition.html');
if(!existsSync(htmlPath)) {
  console.error('MoBox checkout not found at '+htmlPath);
  process.exit(2);
}
const manifest=JSON.parse(readFileSync(join(portal,'data/living-universe.json'),'utf8'));
const {packet,report}=preparePublishedExpedition(manifest);
const serialized=JSON.stringify(packet);
const imported=JSON.parse(serialized);
const inspection=inspectLineageInterchange(imported);
assert.equal(inspection.valid,true,inspection.reason);
assert.equal(imported.schema,'aift.lineage.interchange/1');
assert.equal(imported.attestation,'not-independently-verified');
assert.equal(imported.sourceStatus,'curated-source-map');
assert.equal(report.sourceNodes,manifest.nodes.length);
assert.equal(report.sourceRelationships,manifest.edges.length);
assert.ok(Buffer.byteLength(serialized,'utf8')<=500000,
  'Published packet exceeds MoBox 500 KB import limit');
assert.ok(imported.nodes.every(n=>n.kind!=='fruit'||!/^https:\/\/github\.com\//i.test(n.url||'')),
  'GitHub repository incorrectly classified as fruit');
assert.ok(imported.outcomes.every(o=>!/^https:\/\/github\.com\//i.test(o.url||'')),
  'Repository incorrectly classified as outcome');
const html=readFileSync(htmlPath,'utf8');
for(const marker of [
  'id="portable-file"','id="portable-input"','id="portable-inspect"',
  'id="portable-map"','id="portable-map-minimap"','id="portable-results"',
  'id="portable-trail"','id="quest-grid"','aift.lineage.interchange/1'
]) assert.ok(html.includes(marker),'MoBox missing interface contract '+marker);
for(const marker of ['aria-live="polite"','aria-hidden="true"'])
  assert.ok(html.includes(marker),'MoBox missing accessibility contract '+marker);
const go=spawnSync('go',['test','./internal/uxihttp'],{cwd:mobox,encoding:'utf8',timeout:180000});
if(go.error) throw go.error;
if(go.status!==0) {
  console.error(go.stdout,go.stderr);
  process.exit(go.status||1);
}
console.log(JSON.stringify({
  status:'source-contract-verified',
  portalManifestNodes:manifest.nodes.length,
  portalManifestRelationships:manifest.edges.length,
  importedNodes:imported.nodes.length,
  importedEvidenceEdges:imported.edges.length,
  curatedOnlyRelationships:report.curatedOnlyRelationships,
  serializedBytes:Buffer.byteLength(serialized,'utf8'),
  moboxGoTests:'passed',
  limitation:'Browser import, rendering and Android accessibility not tested by this gate'
},null,2));
