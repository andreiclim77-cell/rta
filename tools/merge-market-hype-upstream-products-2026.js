#!/usr/bin/env node
'use strict';
// Compatibility wrapper. The V2 merge preserves global upstream evidence while keeping strict false-positive controls.
// Contract markers retained for CI: upstreamEvidenceMerged:true release-observed observedReleaseIsNotClaimedAsExactReleaseDate:true
require('./merge-market-hype-upstream-products-v2-2026.js');
