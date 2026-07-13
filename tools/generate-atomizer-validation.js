#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { atomizerValidation, loadCatalog, publicAtomName, slugify } = require('./catalog-data');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT = path.join(DATA_DIR, 'atomizer-validation.json');
const QUEUE_OUTPUT = path.join(DATA_DIR, 'atomizer-validation-queue.json');

const catalog = loadCatalog(ROOT);
const rows = catalog.atomizers.map(atom => {
  const validation = atomizerValidation(atom);
  return {
    name: publicAtomName(atom.name),
    slug: slugify(publicAtomName(atom.name)),
    status: validation.status,
    completeness: validation.points,
    comparable: validation.comparable,
    directSources: validation.directSources,
    directReview: validation.directReview,
    hasImage: /^https?:\/\//i.test(atom.image || ''),
    hasBuilds: Array.isArray(atom.builds) && atom.builds.length > 0,
    updatedFrom: atom.addedAt || catalog.data.generated || ''
  };
}).sort((a, b) => a.name.localeCompare(b.name));

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(OUTPUT, `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  total: rows.length,
  comparable: rows.filter(row => row.comparable).length,
  rows
}, null, 2)}\n`, 'utf8');

const queue = rows.filter(row => !row.comparable).map(row => {
  const missing = [];
  if (!row.hasImage) missing.push('fotografie verificată');
  if (!row.hasBuilds) missing.push('build de pornire');
  if (row.directSources < 2) missing.push('surse directe');
  if (!row.directReview) missing.push('review exact');
  if (row.completeness < 60) missing.push('arhitectură și potrivire');
  if (!missing.length) missing.push('confirmare finală');
  return {
    name: row.name,
    slug: row.slug,
    status: row.status,
    completeness: row.completeness,
    missing,
    updatedFrom: row.updatedFrom
  };
});

fs.writeFileSync(QUEUE_OUTPUT, `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  total: queue.length,
  rows: queue
}, null, 2)}\n`, 'utf8');

console.log(`Atomizer validation: ${rows.filter(row => row.comparable).length}/${rows.length} comparable models; ${queue.length} in documentation queue.`);
