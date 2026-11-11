import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page=readFileSync(new URL('../living-universe-explorer.html',import.meta.url),'utf8');
test('exploration journal shares real manifest focus, not synthetic progress',()=>{
 assert.match(page,/function recordJourneyVisit\(n\)/);
 assert.match(page,/nodes\.some\(item=>item\.id===n\.id\)/);
 assert.match(page,/function focusNode\(id\)\{focus=nodes\.find\(n=>n\.id===id\)\|\|null;if\(focus\)\{recordJourneyVisit\(focus\)/);
 assert.match(page,/if\(focus\)recordJourneyVisit\(focus\);render\(\)/);
 assert.match(page,/stages\.forEach\(\(name,i\)=>/);
});
test('journal is explicitly session-only, reversible and clearable',()=>{
 assert.match(page,/const journalVisits=\[\]/);
 assert.match(page,/journalVisits\.length=0;renderJournal\(\)/);
 assert.match(page,/b\.onclick=\(\)=>focusNode\(n\.id\)/);
 assert.match(page,/scope:'local-session-only',verified:false/);
 assert.doesNotMatch(page,/localStorage\.setItem\(['"]journal/);
 assert.match(page,/Nothing is uploaded or stored/);
});
test('journal exposes keyboard-operable buttons and accessible status',()=>{
 assert.match(page,/id="journal-summary" role="status" aria-live="polite"/);
 assert.match(page,/id="journal-log"[^>]*aria-label=/);
 assert.match(page,/id="journal-clear"/);
 assert.match(page,/id="journal-export"/);
 assert.match(page,/prefers-reduced-motion:reduce/);
});
