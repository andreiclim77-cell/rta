'use strict';
const fs=require('node:fs'),path=require('node:path');
const Core=require('../../assets/market-top20-core.js'),Source=require('./google-source.js');
const root=path.resolve(__dirname,'../..'),m=JSON.parse(fs.readFileSync(path.join(root,'data/google-pod-top20-2026.json'),'utf8'));
Core.validateCatalog(JSON.parse(fs.readFileSync(path.join(root,'data/google-pod-catalog.json'),'utf8')).models);
if(Core.validateManifest(m)){
 const raw=fs.readFileSync(path.join(root,m.evidence_path.slice(1)),'utf8');
 if(Source.hash(raw)!==m.evidence_sha256)throw new Error('EVIDENCE_HASH_MISMATCH');
 const d=Core.build(JSON.parse(raw));if(d.status!=='ready')throw new Error('INSUFFICIENT_MEASURED_MODELS');
 console.log(JSON.stringify({software_validation:'pass',data_source:d.source.method,reference_month:d.month,measured_models:d.coverage.measured_models,stale:d.stale},null,2));
}else{
 if(m.rows&&m.rows.length)throw new Error('UNVERIFIED_ROWS_IN_UNPUBLISHED_MANIFEST');
 console.log(JSON.stringify({software_validation:'pass',data_source:m.status,real_ranking_available:false,note:'A software test pass does not mean real Google data is connected.'},null,2));
}
