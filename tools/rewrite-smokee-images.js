#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const PROXY_ORIGIN = 'https://ghid-rta-smokee-sync-backup.ghid-rta-smokee.workers.dev';
const write = process.argv.includes('--write');
const input = fs.readFileSync(INDEX, 'utf8');
let changed = 0;

const output = input.replace(/https:\/\/(?:(?:www\.)?smokee\.ro\/wp-content\/uploads|ghid-rta\.ro\/media\/smokee\/wp-content\/uploads)\/[^'"\s<>)\\]+/gi, value => {
  let source;
  try {
    source = new URL(value.replace(/&amp;/g, '&'));
  } catch (error) {
    return value;
  }
  const imagePath = source.hostname === 'ghid-rta.ro' ? source.pathname.replace(/^\/media\/smokee/, '') : source.pathname;
  changed += 1;
  return `${PROXY_ORIGIN}/media/smokee${imagePath}${source.search}`;
});

const remaining = (output.match(/https:\/\/(?:www\.)?smokee\.ro\/wp-content\/uploads\//gi) || []).length;
if (remaining) throw new Error(`${remaining} direct Smokee image URL(s) remain.`);

if (write && output !== input) fs.writeFileSync(INDEX, output, 'utf8');
console.log(`Smokee image cache URLs: ${changed} image reference(s) ${write ? 'written' : 'checked'}.`);
