# CODEX HANDOFF — ANALIZA ROMÂNIA vNext

**Status:** implementation brief  
**Date:** 2026-09-01  
**Repository:** `andreiclim77-cell/rta`  
**Specification branch:** `analiza-romania-vnext-blueprint-v1`

---

# 0. Mission

Implement **ANALIZA ROMÂNIA vNext** inside the existing `ghid-rta.ro` codebase by preserving and progressively upgrading the current Market/Analysis system.

This is **not** a greenfield rewrite.

The final product is a Romania-specific market-intelligence system for:

- RTA;
- MOD;
- POD/AIO/BORO;
- RTA/platform-specific accessories;
- POD replacement pods/cartridges/coils and linked consumable ecosystems.

It must distinguish exactly between:

- explicit units sold;
- retailer rankings/bestsellers;
- demand proxies;
- assortment/listing;
- stock;
- price/promotions;
- structural/context evidence.

It must never fabricate national market share from incomplete public evidence.

---

# 1. READ FIRST — canonical specification

Open:

`docs/ANALIZA_ROMANIA_CANONICAL_SPEC_INDEX.md`

Then read **all** documents listed there, in order, before editing production behavior.

Do not begin from the old Market workflows alone.

---

# 2. Existing system must be understood first

Inspect all current Market/Analysis files, especially:

- `data/market-retailers-2026.json`
- `data/market-sales-sources-2026.json`
- `data/market-universe-discovery-2026.json`
- `data/market-pod-universe-2026.json`
- `data/market-2026.json`
- `data/market-sales-2026.json`
- `data/market-demand-intelligence-2026.json`
- `data/market-external-intelligence-2026.json`
- `data/market-product-presence-2026.json`
- `data/market-management-2026.json`
- `.github/workflows/market-2026-sync.yml`
- `.github/workflows/market-sales-2026-sync.yml`
- `.github/workflows/market-universe-audit-2026.yml`
- `.github/workflows/market-2026-quality.yml`
- `tools/sync-market-*2026.js`
- `tools/*market-sales*2026.js`
- `tools/*market-demand*2026.js`
- `tools/market-product-canonical-2026.js`
- `tools/market-pod-classifier-2026.js`
- `tools/build-market-product-presence-2026.js`
- `tools/build-market-management-2026.js`
- `tools/augment-market-management-presence-2026.js`
- `tools/audit-market-universe-2026.js`
- `assets/market-management-v2.js`
- `assets/market-view-switcher.js`
- related source/coverage/market UI and service-worker dependencies.

---

# 3. Non-negotiable implementation constraints

1. Do not rewrite live ANALIZA in one PR.
2. Do not delete current collectors/data contracts initially.
3. Do not weaken `listing != sales`, `ranking != units`, or no-national-share truth rules.
4. Do not treat source failure as zero products/stock/demand.
5. Do not use one fixed retailer list as permanent `100% Romania`.
6. Do not make global HYPE a Romanian demand/sales substitute.
7. Do not merge POD devices with replacement pods/coils.
8. Do not discard POD consumables; model them as ecosystem entities.
9. Do not infer brand canonically from first product-title tokens.
10. Do not compare bundles and standalone products as identical prices.
11. Do not compare different consumable pack sizes without normalization.
12. Do not calculate historical growth from changing retailer cohorts without same-store/cohort controls.
13. Do not treat popularity sources as Tier B until their semantics are validated.
14. Do not make Google Trends alpha a mandatory production dependency.
15. Do not use private/unauthorized data or bypass protections.
16. Keep `main` and current public ANALIZA functional throughout migration.

---

# 4. Branch/PR strategy

Use phased implementation branches/PRs, suggested:

```text
analiza-vnext-00-baseline
analiza-vnext-01-entities-schema
analiza-vnext-02-offers-price-stock
analiza-vnext-03-ranking-sales
analiza-vnext-04-pod-ecosystems
analiza-vnext-05-romania-sources-demand
analiza-vnext-06-scoring-recommendations
analiza-vnext-07-ui-shadow
analiza-vnext-08-cutover
```

Each PR must state:

- scope;
- files changed;
- current behavior preserved;
- tests;
- old vs new comparison;
- rollback;
- known gaps;
- no unrelated refactor.

---

# 5. FIRST DELIVERABLE — Phase 0 only

Before changing factual/public behavior:

## 5.1 Freeze baseline

Create:

```text
data/analiza-benchmark/
  baseline-2026-09-01.json
  fixtures/
  README.md

tools/analiza-vnext/
  capture-baseline.js
  run-benchmark.js

docs/ANALIZA_VNEXT_IMPLEMENTATION_STATUS.md
```

Capture:

- retailer registry;
- operator mappings;
- universe audit;
- Market observations;
- sales/ranking output;
- demand output;
- product presence;
- management recommendations;
- source coverage;
- current POD samples;
- workflow durations;
- UI data contract.

## 5.2 Resolve current data anomaly

Audit `data/market-sales-2026.json`. The specification audit observed an empty connector result. Determine whether the file is actually empty/corrupt/stale or whether that was a connector representation issue.

Do not proceed with a false benchmark.

## 5.3 Regression fixtures

Create current/adversarial cases for:

- listing != sale;
- bestseller != unit sale;
- explicit sales counter baseline/delta/reset;
- generic order-count false positive;
- price promo/regular;
- installment false price;
- bundle price;
- RON parsing;
- stock state;
- source outage != stock-out;
- missing page != discontinued;
- brand aliases;
- product variants;
- clone/authentic;
- same operator with multiple storefronts;
- new retailer onboarding != momentum;
- POD device;
- replacement pod;
- coil;
- incompatible POD generations;
- pack size normalization;
- global HYPE without Romanian demand;
- Romanian demand without local listing.

## 5.4 Phase-0 report

Document:

- what currently works;
- what is broken;
- exact schemas/readers/writers;
- dependencies;
- source health;
- current category coverage;
- current POD coverage;
- baseline metrics;
- proposed Phase-1 file/module plan;
- no live behavior changed.

**STOP after Phase 0 PR. Do not continue into Phase 1 in the same PR.**

---

# 6. Phase 1 — entities/schema + compatibility

Create vNext structures beside existing code.

Suggested modules:

```text
tools/analiza-vnext/
  core/
  registry/
  entity/
  evidence/
  history/
  features/
  scoring/
  recommendations/
  projections/
  qa/
```

Implement canonical:

- retailer;
- operator;
- brand;
- product family;
- product;
- variant;
- POD platform;
- consumable family;
- compatibility edge;
- source endpoint.

Build `legacy-compat` projection early so current UI can continue during migration.

---

# 7. Phase 2 — offer / price / stock history

Implement:

- offer observation schema;
- explicit availability state machine;
- regular/promo/current price;
- pack quantity;
- bundles/comparable groups;
- daily histories;
- source failure semantics;
- same-store cohort metadata.

Do not treat source outage as product state change.

---

# 8. Phase 3 — ranking and sales semantics

Create ranking-source contracts.

Each source must document:

- semantic meaning;
- scope;
- visible depth;
- rank direction;
- confidence;
- parser version.

Normalize source-relative ranks before aggregation.

Preserve Tier A explicit sales counter logic, strengthen reset/error handling, and keep national-market-share gate strict.

---

# 9. Phase 4 — POD ecosystem

Implement the full canonical POD spec:

- devices;
- platforms;
- replacement pods/cartridges;
- coils;
- AIO/Boro;
- compatibility edges;
- pack normalization;
- device/consumable breadth;
- complete-ecosystem-store ratio;
- EHS;
- ecosystem risk states;
- POD-specific Romanian demand queries.

Every current retailer must be re-scanned for POD device **and** consumable categories.

---

# 10. Phase 5 — Romanian source expansion

Implement:

- retailer Source Discovery vNext;
- multi-route national-universe certification;
- price-comparison adapters;
- operator resolution improvements;
- Google Ads hardware/POD demand expansion;
- Google Trends optional adapter behind feature flag/kill switch;
- Romania-relevant community/social classification;
- advertising/regulatory context adapters where justified;
- HYPE watch bridge.

Do not make comparison engines additional retailers when they mirror known sellers.

---

# 11. Phase 6 — scoring and recommendations

Implement independently:

```text
CSS
DB
AH
DSR
MOM
PCP
DC
UC
EHS
OS
RS
```

Every score must persist:

- version;
- input features;
- missing inputs;
- normalization cohort;
- explanation;
- prior score/change reason.

Recommendation output:

```text
CORE
GROW
TEST_WHITE_SPACE
WATCH
REDUCE
MINIMAL
DATA_GAP
ECOSYSTEM_RISK
PRICE_RISK
SUPPLY_RISK
COVERAGE_GAP
```

No strong recommendation with low DC/UC.

---

# 12. Phase 7 — shadow UI

Preserve current page structure and create vNext view behind flag/parallel projection.

Required surfaces:

- PULSE;
- MOVERS;
- WHITE SPACE;
- PRICE & STOCK;
- POD ECOSYSTEMS;
- ASSORTMENT/DISTRIBUTION;
- COVERAGE.

Do not replace default Analysis yet.

---

# 13. Phase 8 — backtest and cutover

Follow `ANALIZA_ROMANIA_ACCEPTANCE_BACKTEST_AND_CUTOVER.md` strictly.

Recommended minimum shadow period: 14 successful daily cycles.

Do not cut over with unresolved material truth regressions.

---

# 14. Required truth wording

Use precise labels:

Preferred:

- `observed commercial signal`;
- `bestseller breadth`;
- `listing breadth`;
- `in-stock breadth`;
- `explicit observed units`;
- `Romania search demand`;
- `Romanian public interest signal`;
- `observed ranking index`;
- `data confidence`.

Forbidden without valid evidence:

- `market share`;
- `X% of Romanian sales`;
- `best-selling in Romania` from one/few stores;
- `sales grew X%` when metric is rank/index;
- `100% Romania` with uncertified/expired universe.

---

# 15. POD wording rules

Device and ecosystem must be visible separately.

Examples:

- `device commercial signal: high`;
- `replacement-pod breadth: 8 storefronts`;
- `complete ecosystem coverage: 62% of device-carrying stores`;
- `ecosystem risk: replacement consumables concentrated in one operator`.

Never describe cartridge SKU breadth as device-market breadth.

---

# 16. Integration with HYPE

Read HYPE outputs only through a documented bridge.

HYPE may create Romanian watch candidates and supply global context.

HYPE cannot directly modify:

- CSS;
- Romanian units;
- retailer breadth;
- Romanian stock;
- DSR except capped contextual pathway defined by scoring spec;
- final Romanian recommendation without Romania evidence.

---

# 17. Testing discipline

Every bug discovered during implementation becomes a regression fixture.

Prefer generic rules over product/store-specific fixes.

If a special-case adapter is technically necessary, isolate it at source/parser level and preserve common truth contracts.

---

# 18. Dependencies

Do not add a large framework unless necessary.

Prefer existing Node style and small testable modules.

Any new external API/library requires:

- reason;
- terms/access review;
- failure fallback;
- cost/limit handling;
- secret storage outside static code;
- test coverage.

---

# 19. Status document

Maintain `docs/ANALIZA_VNEXT_IMPLEMENTATION_STATUS.md` across phases:

```text
current phase
branch/PR
completed
open blockers
metrics
regressions
known source gaps
POD coverage
next phase plan
cutover readiness
```

---

# 20. Final implementation rule

The goal is not to make ANALIZA look more confident. The goal is to make it **more correct, more Romanian, more complete for PODs, more auditable and more useful for management**.

When data do not support a claim, preserve uncertainty.

**End of Codex implementation brief.**
