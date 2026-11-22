import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/living-universe-skill-atlas.yml', import.meta.url), 'utf8');
const pullRequestPaths = workflow.split(/^  pull_request:\s*$/m)[1]?.split(/^  workflow_dispatch:/m)[0];
test('cinematic HTML, styles, scripts and acceptance test changes trigger browser workflow', () => {
  assert.ok(pullRequestPaths, 'pull_request paths section exists');
  assert.match(pullRequestPaths, /^\s+- 'cinematic-\*'\s*$/m);
  assert.match(pullRequestPaths, /^\s+- 'tests\/cinematic-browser-trigger\.test\.mjs'\s*$/m);
});
test('browser job remains present and trigger regression runs in CI', () => {
  assert.match(workflow, /^  browser-acceptance:\s*$/m);
  assert.match(workflow, /node living-universe-browser-acceptance\.mjs/);
  assert.match(workflow, /node --test tests\/cinematic-browser-trigger\.test\.mjs/);
});
