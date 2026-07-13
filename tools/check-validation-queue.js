#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const validation = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'atomizer-validation.json'), 'utf8'));
const queue = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'atomizer-validation-queue.json'), 'utf8'));
const expected = validation.rows.filter(row => !row.comparable);
const errors = [];

if (queue.schemaVersion !== 1) errors.push('invalid queue schema');
if (queue.total !== queue.rows.length) errors.push('queue total does not match rows');
if (queue.total !== expected.length) errors.push('queue does not match non-comparable models');
if (new Set(queue.rows.map(row => row.slug)).size !== queue.rows.length) errors.push('duplicate queue slugs');
queue.rows.forEach(row => {
  if (!row.name || !row.slug) errors.push('queue row is missing identity');
  if (!Array.isArray(row.missing) || !row.missing.length) errors.push(`queue row has no documented gap: ${row.name || row.slug}`);
});

if (errors.length) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Atomizer validation queue: ${queue.total} models awaiting additional documentation.`);
