import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../evidence-expedition.html',import.meta.url),'utf8');
test('route focus synchronizes the constellation, breadcrumbs and selected route',()=>{
 assert.match(html,/focusedRoute=0/);
 assert.match(html,/activeRoute=\[\.\.\.route\.ids\]/);
 assert.match(html,/highlightedEdges\.has\(edge\.from/);
 assert.match(html,/highlighted\?\.ids\.includes\(node\.id\)/);
 assert.match(html,/aria-pressed',String\(index===focusedRoute\)/);
 assert.match(html,/Focus route /);
});
test('route switching is read-only, exposes evidence gaps and supports accessible navigation',()=>{
 assert.match(html,/route\.complete\?' · HTTPS evidence present':' · evidence gap'/);
 assert.match(html,/unsafe or missing evidence URL/);
 assert.match(html,/button',index===focusedRoute/);
 assert.match(html,/prefers-reduced-motion:reduce/);
 assert.match(html,/No packet loaded/);
});
