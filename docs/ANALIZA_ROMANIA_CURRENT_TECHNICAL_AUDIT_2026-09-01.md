# ANALIZA ROMÂNIA — Current Technical Audit

**Date:** 2026-09-01  
**Audited branch:** `main`  
**Purpose:** document what already exists, what is correct, and what must change for Romania + POD vNext.

---

# 1. Executive finding

The current ANALIZA is already a substantial multi-stage Romanian market-observation system. It should **not** be rewritten from scratch.

Current components include:

- national retailer registry;
- daily Market collection;
- specialized parsers;
- product presence/canonicalization;
- sales-ranking discovery;
- public bestseller/popularity collection;
- explicit public sales-counter probing;
- product review/view/wishlist proxy probing;
- Google Ads Romania demand metrics;
- guide-intent metrics;
- public community/search fallback;
- external YouTube/manufacturer context;
- management scoring/recommendations;
- national-universe discovery/audit;
- frontend management cockpit;
- source/coverage UI;
- GitHub Actions orchestration.

The correct strategy is additive migration with compatibility projections and shadow validation.

---

# 2. Existing assets to preserve

## Core data/config

- `data/market-retailers-2026.json`
- `data/market-sales-sources-2026.json`
- `data/market-universe-discovery-2026.json`
- `data/market-pod-universe-2026.json`
- `data/market-2026.json`
- `data/market-product-presence-2026.json`
- `data/market-demand-intelligence-2026.json`
- `data/market-external-intelligence-2026.json`
- `data/market-management-2026.json`

## Workflows

- `.github/workflows/market-2026-sync.yml`
- `.github/workflows/market-sales-2026-sync.yml`
- `.github/workflows/market-universe-audit-2026.yml`
- `.github/workflows/market-2026-quality.yml`

## Core tools

- `tools/sync-market-2026.js`
- `tools/sync-market-smokee-2026.js`
- `tools/sync-market-specialized-2026.js`
- `tools/verify-market-prices-2026.js`
- `tools/normalize-market-2026.js`
- `tools/market-coverage-audit-2026.js`
- `tools/discover-market-sales-sources-2026.js`
- `tools/sync-market-sales-2026.js`
- `tools/collect-discovered-market-sales-2026.js`
- `tools/probe-market-sales-counters-2026.js`
- `tools/market-product-canonical-2026.js`
- `tools/canonicalize-market-sales-products-2026.js`
- `tools/build-market-product-presence-2026.js`
- `tools/build-market-sales-summary-2026.js`
- `tools/build-market-external-intelligence-2026.js`
- `tools/collect-market-demand-intelligence-2026.js`
- `tools/canonicalize-market-demand-products-2026.js`
- `tools/build-market-management-2026.js`
- `tools/augment-market-management-presence-2026.js`
- `tools/audit-market-universe-2026.js`
- `tools/market-pod-classifier-2026.js`

## UI

- `assets/market-management-v2.js`
- related management CSS;
- `assets/market-view-switcher.js`;
- market source/coverage UI;
- existing page shell and navigation.

---

# 3. Current strengths

## 3.1 Truthful sales semantics

The current sales pipeline already makes an important distinction:

- Tier A = explicit public unit counters/direct merchant evidence;
- Tier B = bestseller/popularity ranking;
- Tier C = demand proxy;
- national market share remains unavailable without complete comparable Tier-A coverage.

This must be preserved and strengthened, not weakened.

## 3.2 Anti-inference philosophy

Current code avoids treating listing breadth as sales and explicitly states that bestseller breadth is separate from retail availability.

## 3.3 Product presence

`build-market-product-presence-2026.js` already separates:

- listed storefront breadth;
- listed operator breadth;
- raw title aliases;
- canonical products.

That is the correct direction.

## 3.4 External intelligence boundary

Current external intelligence explicitly says global YouTube/manufacturer signals cannot replace verified Romanian commercial evidence.

## 3.5 Freshness gates

The Analysis workflow refuses to run from a stale Market base and validates current-day outputs.

## 3.6 National-universe concept

The project already recognizes that a fixed registry must not be called `100% Romania` until a universe-audit gate passes.

---

# 4. Current weaknesses / gaps

## 4.1 Scope remains RTA-centric

The national universe discovery file explicitly describes the universe as `RTA/rebuildable`, and its search queries are heavily RTA-model-specific.

Required change: make RTA, MOD, POD/AIO/BORO and linked consumables first-class categories.

## 4.2 POD consumables are discarded from device classification

The current POD classifier correctly prevents cartridges/coils from being misclassified as devices, but they are then absent from platform-health analysis.

Required change: keep them as separate entities and build compatibility/platform relationships.

## 4.3 No first-class POD ecosystem score

The current management model ranks products/brands/categories but has no device + replacement-pod/coil ecosystem health view.

Required change: EHS and platform-level analysis.

## 4.4 Brand/entity heuristics need strengthening

The sales code contains a derived `topNameTokens` concept based on the first words of product titles. This is useful as a rough diagnostic but must not be canonical brand truth.

Required change: entity registry + aliases + family/platform resolution.

## 4.5 Ranking aggregation is semantically too coarse

Current reciprocal-rank aggregation can mix different retailer ranking scopes and visible depths.

Required change: each ranking surface gets a semantic contract and normalized source-relative score before aggregation.

## 4.6 National universe gate is too weak for “maximum”

Current audit can pass after two consecutive clean audits with at least one discovery engine working and no unresolved/new candidates.

That is useful for a lightweight safety gate but insufficient for a maximum national-universe claim.

Required change: multiple independent discovery routes, dated certification, expiry and category-specific coverage.

## 4.7 Search discovery depends on legacy generic engines

Current discovery uses Bing RSS and DuckDuckGo HTML. This is brittle and not enough for durable national certification.

Required change: provider abstraction plus direct seller/distributor/dealer/price-comparison discovery.

## 4.8 Demand universe is RTA-centric

`collect-market-demand-intelligence-2026.js` builds its core product universe primarily from RTA/RBA/RDTA observations and YouTube RTA models.

Required change: hardware-wide demand universe, including POD devices and their consumable families.

## 4.9 Social/community Romania relevance is weakly encoded

Current Reddit/public-index searches are mostly global vaping communities; Romanian Facebook discovery is search-index based.

Required change: explicit `RO_EXPLICIT / RO_INFERRED_STRONG / GLOBAL_CONTEXT / UNKNOWN` geographic relevance per demand observation.

## 4.10 No stock state machine

Current Market observations provide assortment/price data, but management intelligence needs a canonical longitudinal stock-state model with source-failure protection.

## 4.11 Price normalization needs pack/bundle semantics

Especially for POD consumables, comparing 2-packs and 4-packs directly would be wrong. Bundle/device offers also need their own comparable groups.

## 4.12 Trend can be distorted by source-cohort changes

Current ranking-history momentum compares snapshots but needs explicit same-store/cohort logic when retailer coverage changes.

## 4.13 One opaque confidence score

Current management rows expose a single `confidence` number calculated from coverage/breadth/history/Tier A/Tier C and source boosts.

Required change: separate DC/UC from commercial/demand/availability/ecosystem scores.

## 4.14 Recommendation layer can appear more precise than evidence

Current UI includes GROW/CORE/WHITE_SPACE/DECLINE and stock-depth guidance. The architecture should retain management usefulness but make strong recommendations conditional on explicit data confidence and evidence tier mix.

---

# 5. POD-specific current audit

Current assets:

- `market-pod-universe-2026.json` already contains a meaningful brand/series universe;
- `market-pod-classifier-2026.js` distinguishes POD devices from many accessories;
- sales classification can call the POD classifier.

Missing:

- replacement pod/cartridge entity model;
- coil family model;
- compatibility graph;
- pack normalization;
- device+consumables breadth;
- ecosystem stock continuity;
- EHS;
- POD-specific Romania demand query universe;
- retailer POD category completeness audit;
- POD platform-level management recommendations.

---

# 6. National retailer registry audit

Current registry contains at least the following 22 seed storefronts:

- Smokee
- Vaperia
- VapePoint
- Vapetronic
- SmokeMania
- Vapez
- JustVape
- e-Potion
- Noua Tigara Electronica
- Voore
- Vaper's Paradise
- Vicii Shop
- TigaraEgo
- Geekvape.ro
- VAPS
- Vapshop.ro
- SteamFactory
- Ecig Vapo
- Merlin.ro
- Vape.ro
- AlphaVape
- SmartVape

Current registry itself correctly marks national audit as in progress / not permanently certified.

Required change: preserve all seeds but re-audit every storefront for POD/MOD/accessory coverage and operator identity.

---

# 7. Workflow audit

## Market 2026 Daily Sync

Current sequence:

1. collect national storefronts;
2. collect Smokee API families;
3. dedicated storefront parsers;
4. verify suspicious prices;
5. normalize;
6. coverage audit;
7. freshness/truth validation;
8. publish daily Market snapshot.

Keep this concept.

## Market 2026 Sales Signals

Current sequence already includes:

- sales-ranking discovery;
- public sales evidence;
- dynamically discovered rankings;
- sales/demand probes;
- canonicalization;
- product presence;
- sales synthesis;
- external intelligence;
- Google/community demand;
- management report;
- listing breadth augmentation;
- validation/publish.

Refactor into vNext modules gradually; do not discard the workflow logic.

---

# 8. Data-state concern

At audit time, `data/market-sales-2026.json` was observed as empty through the connector fetch path. Before implementation, Phase 0 must verify whether this represents:

- an actual empty file in `main`;
- a transient connector/rendering issue;
- a workflow state between writes;
- a recent accidental truncation.

This must be resolved before using current sales output as a benchmark.

---

# 9. UI audit

Current management UI has valuable concepts:

- period selection;
- product/brand/category dimension;
- evidence explanation;
- recommendation labels;
- stock-depth guidance;
- change thresholds;
- cautions;
- confidence explanation;
- universe coverage wording.

Keep the interaction language, but upgrade:

- separate metrics rather than one confidence;
- POD ecosystem tab;
- Price & Stock tab;
- Coverage tab;
- operator/storefront distinction;
- explicit evidence-tier mix;
- same-store trend confidence;
- source failure warnings;
- recommendation explanation drawer.

---

# 10. What to preserve as invariants

- no national share without valid Tier A coverage;
- listing != sales;
- external/global != Romania sales;
- stale Market base blocks Analysis refresh;
- canonicalization before aggregation;
- transparent source coverage;
- daily history;
- current UI remains operational during migration.

---

# 11. What to refactor first

Priority order:

1. benchmark current Analysis outputs;
2. resolve empty/invalid sales-state concern;
3. canonical schemas for retailer/operator/product/platform/consumable;
4. hardware-wide taxonomy;
5. POD compatibility/platform layer;
6. source-result/failure semantics;
7. same-store cohort history;
8. ranking-source semantics;
9. multi-score model;
10. national-universe certification vNext;
11. shadow UI.

---

# 12. What not to do

- do not add more retailer URLs before fixing source/result semantics and POD entity model;
- do not call more rankings “sales” to increase apparent coverage;
- do not hardcode individual product names as fixes where generic classification can solve the issue;
- do not switch live UI before shadow comparison;
- do not merge HYPE logic into ANALIZA truth;
- do not force a storage rewrite before baseline/compatibility tests.

---

# 13. Technical conclusion

The existing ANALIZA is a strong prototype/first-generation observatory, not a failed implementation. Its biggest limitation is **model breadth and evidence semantics**, not lack of code.

vNext should preserve its strongest truth rules while expanding from an RTA-focused ranking cockpit into a full **Romanian vape-hardware market-intelligence system with first-class POD ecosystem analysis**.

**End of current technical audit.**
