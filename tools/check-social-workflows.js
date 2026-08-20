#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, '.github', 'workflows', name), 'utf8');

const instagram = read('instagram-facebook-mirror.yml');
const reels = read('social-reels-mirror.yml');
const editorial = read('facebook-editorial-series.yml');
const smokee = read('smokee-rta-sync.yml');
const health = read('facebook-token-health.yml');

for (const [name, source] of Object.entries({ instagram, reels, editorial, smokee, health })) {
  assert(source.includes('tools/meta-token-gate.js'), `${name} is missing the shared Meta gate`);
}

assert(instagram.includes('cron: "17 * * * *"'), 'Instagram manual-post discovery is not scheduled hourly');
assert(reels.includes('cron: "42 * * * *"'), 'Reels is missing the independent hourly fallback');
assert(reels.includes('Instagram mirror from Facebook'), 'Reels is not chained after the Instagram mirror');
assert(reels.includes("github.event.workflow_run.event != 'workflow_dispatch'"), 'A manual Instagram verification can still trigger an automatic Reel run');
assert(reels.includes("if: always() && steps.meta.outputs.ready == 'true'"), 'Reel receipts are not preserved after a terminal platform error');
assert(health.match(/cron:/g)?.length === 1, 'Meta token health should run once per day');
assert(!health.includes('if: failure()'), 'Meta token health still converts an expired token into a failed scheduled run');
assert(health.includes('if (!existing)'), 'Meta token health can still add repeated issue comments');
assert(smokee.includes("steps.meta.outputs.ready == 'true'"), 'Smokee sync does not isolate social publication from catalog refresh');

console.log('Social workflow checks passed.');
