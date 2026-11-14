import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('./evidence-quest-atlas.html',import.meta.url),'utf8');
test('atlas offers accessible search, stage filter, selected lineage and clear',()=>{for(const id of ['record-search','record-stage','record-list','record-detail'])assert.match(html,new RegExp('id="'+id+'"'));assert.match(html,/aria-live="polite"/);assert.match(html,/renderRecords/);assert.match(html,/selectRecord/);assert.match(html,/currentReport=null/)});
test('declared lineage uses existing bounded source routes and safe destinations',()=>{assert.match(html,/lineageRoutes\(\{\.\.\.report,focus:record\},12\)/);assert.match(html,/safeDestination\(record\.url\|\|record\.href\)/);assert.match(html,/noopener noreferrer/);assert.match(html,/No complete declared root-to-record route/)});
test('mobile and reduced-motion protections remain',()=>{assert.match(html,/prefers-reduced-motion:reduce/);assert.match(html,/max-width:760px/);assert.match(html,/max-width:390px/)});
