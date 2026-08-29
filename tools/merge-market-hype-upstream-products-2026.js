#!/usr/bin/env node
'use strict';
// Compatibility wrapper v2.3. Resolve source-page product titles before the recall-safe merge; resolver write mode fixed.
// Contract markers retained for CI: upstreamEvidenceMerged:true release-observed observedReleaseIsNotClaimedAsExactReleaseDate:true
const {execFileSync}=require('child_process');
const path=require('path');
const args=[path.join(__dirname,'hype-upstream-page-title-resolver.js')];
if(process.argv.includes('--write'))args.push('--write');
execFileSync(process.execPath,args,{stdio:'inherit'});
require('./merge-market-hype-upstream-products-v2-2026.js');
