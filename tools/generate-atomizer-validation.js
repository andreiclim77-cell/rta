#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { atomizerValidation, loadCatalog, publicAtomName, slugify } = require('./catalog-data');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT = path.join(DATA_DIR, 'atomizer-validation.json');

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

console.log(`Atomizer validation: ${rows.filter(row => row.comparable).length}/${rows.length} comparable models.`);
