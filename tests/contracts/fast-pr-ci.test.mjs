import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const workflow = fs.readFileSync(
  path.join(process.cwd(), '.github', 'workflows', 'deploy-pages.yml'),
  'utf8',
);

function jobBlock(name, nextName) {
  const start = workflow.indexOf(`  ${name}:`);
  assert.notEqual(start, -1, `missing workflow job: ${name}`);
  const end = nextName ? workflow.indexOf(`  ${nextName}:`, start + 1) : workflow.length;
  return workflow.slice(start, end < 0 ? workflow.length : end);
}

test('pull requests skip only the eight-shard deep mobile audit', () => {
  const deep = jobBlock('mobile-deep-gate', 'deploy');
  assert.match(deep, /if: github\.event_name != 'pull_request'/);
  assert.match(deep, /shard: \[0, 1, 2, 3, 4, 5, 6, 7\]/);
});

test('fast PR checks still include browser, interaction, conditional Pythagoras and production build gates', () => {
  const browser = jobBlock('mobile-browser-gate', 'mobile-interaction-gate');
  const interaction = jobBlock('mobile-interaction-gate', 'pythagoras-browser-gate');
  const pythagoras = jobBlock('pythagoras-browser-gate', 'mobile-deep-gate');
  const build = jobBlock('build', 'mobile-browser-gate');

  assert.doesNotMatch(browser, /if: github\.event_name != 'pull_request'/);
  assert.doesNotMatch(interaction, /if: github\.event_name != 'pull_request'/);
  assert.doesNotMatch(pythagoras, /^\s*if: github\.event_name != 'pull_request'/m);
  assert.match(browser, /validate:mobile:browser/);
  assert.match(interaction, /validate:mobile:interactions/);
  assert.match(pythagoras, /pythagoras-writing-capacity-browser-audit\.mjs/);
  assert.match(pythagoras, /pythagoras-whitespace-audit\.mjs/);
  assert.match(build, /npm run build/);
});

test('main deployment requires both deep mobile and Pythagoras release gates', () => {
  const deploy = jobBlock('deploy');
  assert.match(deploy, /needs: \[build, mobile-browser-gate, mobile-interaction-gate, mobile-deep-gate, pythagoras-browser-gate\]/);
  assert.match(deploy, /if: github\.event_name != 'pull_request'/);
});
