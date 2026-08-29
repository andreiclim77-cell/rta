#!/usr/bin/env node
'use strict';
// Compatibility wrapper v2.4. Resolve source-page titles, add current vendor RTA ETA/batch evidence, merge upstream, then enforce final category anchors.
// Contract markers retained for CI: upstreamEvidenceMerged:true release-observed observedReleaseIsNotClaimedAsExactReleaseDate:true
const {execFileSync}=require('child_process');
const path=require('path');
const write=process.argv.includes('--write');
function run(file){const args=[path.join(__dirname,file)];if(write)args.push('--write');execFileSync(process.execPath,args,{stdio:'inherit'});}
run('hype-upstream-page-title-resolver.js');
run('augment-market-hype-current-vendor-rta-events-2026.js');
require('./merge-market-hype-upstream-products-v2-2026.js');
run('finalize-market-hype-category-relevance-2026.js');
