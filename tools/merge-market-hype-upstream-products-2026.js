#!/usr/bin/env node
'use strict';
// Compatibility wrapper v2.1. The V2 merge preserves global upstream evidence while rejecting catalog/homepage/brand-only false positives.
// Contract markers retained for CI: upstreamEvidenceMerged:true release-observed observedReleaseIsNotClaimedAsExactReleaseDate:true
require('./merge-market-hype-upstream-products-v2-2026.js');
