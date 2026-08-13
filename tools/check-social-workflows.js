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
assert(!/\n\s+schedule:\s*[\s\S]*cron:/.test(reels.split('permissions:')[0]), 'Reels has a redundant independent schedule');
assert(reels.includes('Instagram mirror from Facebook'), 'Reels is not chained after the Instagram mirror');
assert(health.match(/cron:/g)?.length === 1, 'Meta token health should run once per day');
assert(!health.includes('if: failure()'), 'Meta token health still converts an expired token into a failed scheduled run');
assert(health.includes('if (!existing)'), 'Meta token health can still add repeated issue comments');
assert(smokee.includes("steps.meta.outputs.ready == 'true'"), 'Smokee sync does not isolate social publication from catalog refresh');

console.log('Social workflow checks passed.');
