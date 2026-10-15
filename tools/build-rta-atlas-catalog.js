'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const file='rta-lab/catalog/liquids-20261015.json',rows=JSON.parse(fs.readFileSync(file,'utf8'));
assert.equal(rows.length,700);assert.equal(new Set(rows.map(r=>r.id)).size,700);
const metadata={schema:1,edition:'20261015-700-v1',count:700,revised:'2026-10-15',sha256:crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex')};
const output='/* Generated from catalog/liquids-20261015.json. Original V10 files remain intact. */\n(function(){\n"use strict";\nconst rows='+JSON.stringify(rows)+';\nconst manifest='+JSON.stringify(metadata)+';\nif(rows.length!==manifest.count||new Set(rows.map(r=>r.id)).size!==manifest.count)throw new Error("Atlas catalog integrity");\nwindow.RTA_LIQUIDS=rows;window.RTA_ATLAS_CATALOG=Object.freeze(manifest);\n})();\n';
const target='rta-lab/atlas-preview/catalog.js';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8').replaceAll('\r\n','\n'),output,'Generated catalog is stale');else fs.writeFileSync(target,output);
console.log('ATLAS CATALOG: 700 distinct commercial identities; source hash '+metadata.sha256);
