# HYPE Current Technical Audit — 2026-09-01

Repository: `andreiclim77-cell/rta`  
Audited branch: `main`

## Executive finding

The existing HYPE implementation is already a substantial multi-stage system. It includes scheduled GitHub Actions, source registries, product history, evidence files, direct-catalog collectors, validation passes, a Cloudflare refresh worker and a structured browser UI. HYPE vNext must therefore be introduced as an additive migration rather than a greenfield rewrite.

## Existing assets to preserve

Workflows:
- `.github/workflows/market-hype-2026-sync.yml`
- `.github/workflows/market-hype-global-quality.yml`
- `.github/workflows/market-hype-host-quality.yml`
- `.github/workflows/market-hype-worker-deploy.yml`

Data:
- `data/market-hype-sources-2026.json`
- `data/market-hype-active-makers-extra-2026.json`
- `data/market-pod-universe-2026.json`
- `data/market-hype-products-2026.json`
- `data/market-hype-pods-2026.json`
- `data/market-hype-radar-2026.json`
- `data/market-hype-evidence-2026.json`
- `data/market-hype-heartbeat-evidence-2026.json`
- `data/market-hype-discovery-ledger-2026.json`
- `data/market-hype-known-history-2026.json`
- `data/market-hype-retail-memory-2026.json`
- `data/market-hype-direct-catalogs-2026.json`
- `data/market-hype-dated-news-2026.json`
- `data/market-hype-retail-campaigns-2026.json`
- `data/market-hype-vendor-profiles-2026.json`

Frontend / infrastructure:
- `assets/market-hype-ui.js`
- `assets/market-hype-ui.css`
- `cloudflare/market-hype-refresh/worker.mjs`

Important collectors/normalizers:
- `tools/collect-market-hype-radar-2026.js`
- `tools/collect-market-hype-deep-2026.js`
- `tools/collect-market-hype-wide-2026.js`
- `tools/collect-market-hype-products-2026.js`
- `tools/collect-market-hype-pods-2026.js`
- direct vendor/catalog collectors and augmenters
- `tools/consolidate-market-hype-2026.js`
- product canonicalizer and category classifiers
- publication/data-quality validators.

## What is already strong

1. Clear intent to separate direct evidence from weak public signals.
2. Existing protections against treating relistings and generic new-arrival pages as genuine releases.
3. Prior-history and retailer first-seen memory.
4. A meaningful RTA/MOD maker seed set, supplemental active-maker set and a dedicated POD universe.
5. Direct vendor/catalog passes plus dated-news passes.
6. Category revalidation and publication validation.
7. A public UI that already separates stronger dated events from weaker signals.
8. Scheduled and manual refresh mechanisms.
9. CI/quality contracts.

## Main architectural limitations

### 1. Fixed global query cap

`tools/collect-market-hype-radar-2026.js` builds a broad prelaunch query list but caps it with a fixed global slice. Once makers, languages and source families grow, later queries can be excluded silently. vNext replaces this with explicit per-family/per-region adaptive budgets and stores every query plan.

### 2. Fragile generic-search dependency

The current collector uses a Bing RSS-style search endpoint. This can remain temporarily as low-confidence fallback, but vNext needs a provider interface and direct-source-first strategy.

### 3. One 30-day concept is doing too much

The current system strongly couples active evidence to a ±30-day publication concept. vNext separates:
- 30 days for observed/changed signals;
- 30 days for verified recent releases;
- 180+ days for forecast horizon;
- approximately 730 days for novelty/prior-existence memory.

### 4. Product lifecycle is compacted

`consolidate-market-hype-2026.js` performs useful deduplication and truth checks, but compact rows tend toward one dominant product state/date. A global intelligence system must preserve the entire lifecycle: rumor -> artifact -> prototype -> sample -> announcement -> preorder -> release -> later corrections.

vNext therefore stores immutable evidence and event claims; consolidation becomes a read projection only.

### 5. Corroboration is not true origin independence

Current `sourceCount` / `eligibleSources` concepts are useful for display but cannot distinguish ten copied pages from ten independent origins. vNext adds evidence-lineage clustering using canonical links, text/media similarity, publication order and repost/feed relationships.

### 6. Source families are incomplete

The current source registry is a good seed, but regulatory, IP, trade-show, archive/Common Crawl, RDAP/Certificate Transparency, manuals/firmware, newsletters and OEM/ODM need first-class source/adaptor types.

### 7. “GLOBAL” is a regression threshold, not a coverage metric

The current quality workflow checks minimum maker/clone/forum counts. Keep those as minimum regression floors, but vNext must compute coverage by source family × region × language × category × freshness and disclose blind spots.

### 8. Source lifecycle/policy/health are not first-class enough

vNext sources need candidate/quarantine/active/degraded/retired states, access-policy versioning, parser drift, freshness and evidence-yield metrics.

### 9. Long sequential workflow will not scale indefinitely

The main HYPE job is a large sequential GitHub Action with a 75-minute timeout. vNext should first modularize collectors, then use parallel jobs or Cloudflare Queues/Workers as volume grows. One failed source must not invalidate the whole intelligence snapshot.

### 10. Git JSON should remain publication compatibility, not indefinite canonical evidence storage

Static JSON remains useful for GitHub Pages and rollback. Long-term immutable evidence, event history and source-health data should move to D1/R2/KV/Queues or an equivalent persistent event store, while compact read projections continue to be generated for the existing site.

### 11. UI needs full dossier/timeline

The existing HYPE UI is a good shell, but vNext must show:
- lifecycle timeline;
- independent origin count vs raw evidence count;
- multiple independent scores;
- contradictions/corrections;
- longer-horizon forecast interval;
- all relevant evidence links rather than only a primary source;
- coverage/degraded state.

## Migration invariants

1. Do not delete current collectors/data before backfill and compatibility outputs are proven.
2. Turn current anti-relisting/date protections into benchmark tests before refactoring them.
3. Introduce vNext schemas/projections beside current JSON.
4. Keep the live UI working while vNext runs in shadow mode.
5. Compare old and vNext on the same reference timestamp.
6. Explain every material difference for current valid products/signals.
7. Prefer generic rules over product-name-specific patches.
8. Increasing source volume is not success if truth precision decreases.
9. Keep `main` deployable at every step.
10. Cut over only after the dedicated acceptance suite passes.

## Conclusion

The current HYPE is a strong multi-source 30-day radar foundation. HYPE vNext should convert its existing collectors and truth checks into adapters feeding an evidence/event/lineage architecture, then preserve the existing frontend through compatibility projections until the dossier-based UI is production-ready.
