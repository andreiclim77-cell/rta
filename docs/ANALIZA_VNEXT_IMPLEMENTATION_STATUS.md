# ANALIZA ROMANIA vNext implementation status

**Phase:** 0 - current baseline and regression contract

**Status:** implemented locally and ready for draft-PR audit

**Date:** 2026-09-01

**Rollback/base point:** `5363ddb1cd4276e472fb230105e46994fb8ae2b8`

## Scope completed

Phase 0 is additive. No current collector, workflow, public JSON, public UI,
service-worker path, password/access rule or 06:00 publication behavior is
changed.

Implemented:

- deterministic inventory and baseline generator;
- frozen contracts for 73 current implementation/integration files and 14
  current data files;
- desktop and mobile public access-state screenshots;
- 72 deterministic fixtures, including 34 adversarial cases (47.2%);
- complete required fixture families for retail, identity, sales/ranking,
  price, availability, POD and Romanian demand;
- executable checks against the current counter parser, product canonicalizer,
  POD classifier, operator mapping and published datasets;
- 14 source-bound current protection bindings;
- dedicated vNext Phase 0 CI workflow;
- this compatibility, risk and exact next-phase ledger.

## Current snapshot

The newest timestamp among the frozen current datasets is
`2026-08-31T14:17:43.204Z`.

Because the baseline branch deliberately freezes the 31 August dataset,
`validate-market-daily-2026.js` reports it as stale on 1 September. The
structural Market quality gate and final report gate pass. Phase 0 does not
rewrite public timestamps merely to make a freshness check green.

| Area | Measured current state |
|---|---:|
| Runtime/integration files | 73 |
| Frozen data contracts | 14 |
| Registered storefronts | 22 |
| Distinct operators | 21 |
| Storefronts observed | 21 / 22 |
| Market observations | 2,426 |
| Distinct raw product titles | 2,364 |
| Tier-B ranking rows | 831 |
| Tier-B ranking coverage | 21 / 22 (95.5%) |
| Tier-C product-demand rows | 51 |
| Tier-C storefront coverage | 6 / 22 (27.3%) |
| Tier-A explicit-sales rows | 0 |
| Tier-A coverage | 0 / 22 (0%) |
| Canonical presence products | 1,993 |
| Demand products | 445 |
| Market POD observations | 576 |
| POD makers / segments in registry | 60 / 4 |

Category observations include 373 RTA, 339 mods, 576 POD, 37 RBA/bridge,
96 RDA/RDTA, 84 prebuilt coils, 572 tobacco/NET/DIY liquid rows and the
remaining wire, wick, battery, charger, tool, board and accessory categories.

## Sales-file anomaly resolved

`data/market-sales-2026.json` is not empty or corrupt. It parses, is about
2.9 MB and contains 831 Tier-B ranking rows plus 51 Tier-C demand signals.
The earlier empty connector result was a representation/fetch issue.

The file contains zero `actualSales` rows. It is therefore a valid current
ranking/proxy projection, but not sales truth. It must not be used as a
benchmark for units sold or national market share. Its current national-unit
and national-share flags correctly remain `false`.

## What currently works and must stay

- retailer storefront and operator identities are distinct;
- current presence output counts both storefronts and operators;
- 21 storefronts supplied 2,426 daily observations;
- explicit product counters require product-specific sold-unit language;
- a first cumulative counter is a baseline only;
- positive deltas are accepted and counter decreases/resets return `null`;
- generic site order counts are rejected;
- Tier-B rows remain labelled as rankings rather than units;
- stock, price, disappearance, reviews, views and wishlist counts are not
  converted into sales;
- source errors are visible and `100% Romania` remains disabled;
- current POD device classification recognizes representative XROS, Xlim and
  premium AIO device cases;
- UI readers, current JSON paths and network-first service-worker behavior are
  explicitly frozen;
- the current public/authorized-only community-data policy remains binding.

## Material findings

1. Tier A is genuinely zero. No national sales-volume recommendation can be
   supported from the current dataset.
2. A conservative title audit flags 296 of 831 ranking rows as suspect,
   including liquids, batteries, wire/coil, cotton and other non-comparable
   entities inside the same commercial index.
3. The 30-day management product table emits 182 `WHITE_SPACE` actions with
   zero Tier-A evidence. Its leading row, Vaporesso Armour G, receives
   `WHITE_SPACE` and `TEST MIC` from reciprocal-rank momentum while Tier A and
   Tier C are both false.
4. The leading row has two bestseller storefronts but zero matched listing
   storefronts, proving a canonical-label join mismatch.
5. `observedSharePct` is reciprocal-rank share, not sales share. The current
   disclosure is correct, but the field name and recommendation path remain
   easy to misread.
6. Tier-B sources do not yet have the required per-source semantic, scope and
   visible-depth contracts.
7. Current demand discovery starts from RTA/RBA/RDTA observations and RTA
   YouTube models. It does not natively cover the 339 mod or 576 POD offers.
8. Google Ads credentials are absent and the guide has no canonical intent
   entities. Current product coverage with Google, guide or community evidence
   is zero despite public-index source adapters being reachable.
9. The POD classifier drops replacement pods, cartridges and coils as
   `accessoryOnly`; it cannot yet calculate compatibility or ecosystem health.
10. Canonicalization removes `style`, `clone` and `authentic`, which can collapse
    linked but materially different clone/authentic identities.
11. The current national-universe gate can pass after two clean public-search
    runs. That is not a dated, auditable national-universe certification.
12. Production workflows rewrite mutable projection JSON and push directly to
    `main`; source attempts and parser outcomes are not an immutable ledger.

## Source health

- 19 storefronts are `captured`;
- 2 are `captured-with-source-errors`;
- 1 is `source-error-no-observations`;
- `smokemania` has zero observations and was not attempted in the frozen
  snapshot;
- `vapetronic`, `smokemania` and `steamfactory` expose source errors;
- universe discovery had 2/2 search engines working, 51 queries and 126
  candidate domains;
- Reddit, Facebook and forum public-index adapters returned documents, but no
  product-level Romanian community evidence survived matching;
- Google Ads is using no valid current metric set and the guide endpoint has no
  canonical intent rows.

Source failure remains unknown coverage. It must never become zero demand,
out-of-stock, discontinuation or decline.

## Current readers, writers and dependencies

The frozen inventory contains 20 collector/transform scripts, 5 quality/audit
scripts, 18 Analysis UI readers, 5 workflow/quality files, 14 public Analysis
state files and 6 source/entity registries.

Primary public readers:

- `assets/market-2026.js`;
- `assets/market-analysis-synthesis.js`;
- `assets/market-management-v2.js`;
- `assets/market-loading-guard.js`;
- `assets/market-source-info.js`;
- the sales, demand, coverage, report and view-switcher modules;
- `assets/enhancements.js`, `index.html`, `en/index.html` and `sw.js`.

Primary public contracts:

- `market-2026`, `market-coverage`, `market-sales`, `market-management`;
- `market-demand-intelligence`, `market-product-presence`;
- `market-retailers`, `market-universe-audit`;
- `market-external-intelligence` as an additional UI dependency.

Primary writers are the Market daily collector/normalizer/coverage chain, the
Sales discovery/ranking/counter/canonicalization/presence/demand/management
chain and the national-universe audit. Exact files, hashes, JSON shapes, keys,
steps and data paths are recorded in the baseline JSON.

## Workflow baseline

Current production contracts are preserved:

- Market daily: 06:00 Bucharest primary plus fallback gate, 45-minute timeout;
- Sales/Analysis: chained after Market plus 07:30 fallback, 38-minute timeout;
- universe audit: 05:10 Bucharest, 25-minute timeout.

Last observed full successful runs:

| Workflow | Run | Duration | Completed |
|---|---:|---:|---|
| Market daily | `33380468080` | 583 s | 2026-08-31 10:11Z |
| Sales/Analysis | `33400963224` | 518 s | 2026-08-31 14:17Z |
| Universe audit | `33373677302` | 146 s | 2026-08-31 08:38Z |

Short later fallback jobs are not misreported as full successful collections.

## UI compatibility

The current private module keeps the same password/access key, route, public
entry integration and JSON paths. The current public 18+ access state was
captured at 1366 px desktop and 390 px mobile without entering credentials or
changing browser storage. The private unlocked UI contract is frozen from its
18 reader modules and selectors; an authenticated visual can be added later,
but no password or access control is bypassed in Phase 0.

## Benchmark result

- 72 deterministic fixtures;
- 34 adversarial/ambiguous cases (47.2%);
- 495 assertions;
- 63 distinct required semantic requirements;
- 14 current protection bindings;
- 26 checks executed against current implementation/data;
- fixture and baseline drift detection;
- desktop/mobile screenshot requirement;
- current zero-Tier-A and disabled-national-share assertions.

The final cutover accuracy thresholds and retrospective corpus belong to later
shadow/backtest phases. Phase 0 does not claim production vNext scoring.

## Exact Phase 1 file/module plan

Create additive structures beside the live system:

```text
data/analiza-vnext/schema-version.json
data/analiza-vnext/retailers.json
data/analiza-vnext/operators.json
data/analiza-vnext/brands.json
data/analiza-vnext/products.json
data/analiza-vnext/product-families.json
data/analiza-vnext/variants.json
data/analiza-vnext/pod-platforms.json
data/analiza-vnext/consumable-families.json
data/analiza-vnext/compatibility-edges.json
data/analiza-vnext/source-endpoints.json
data/analiza-vnext/evidence.json
data/analiza-vnext/source-attempts.json
data/analiza-vnext/projections/legacy-market.json
data/analiza-vnext/projections/legacy-sales.json
data/analiza-vnext/projections/legacy-management.json

tools/analiza-vnext/core/ids.js
tools/analiza-vnext/core/schema-contract.js
tools/analiza-vnext/core/date-semantics.js
tools/analiza-vnext/registry/retailer.js
tools/analiza-vnext/registry/operator.js
tools/analiza-vnext/registry/source-endpoint.js
tools/analiza-vnext/entity/brand.js
tools/analiza-vnext/entity/product-family.js
tools/analiza-vnext/entity/product.js
tools/analiza-vnext/entity/variant.js
tools/analiza-vnext/entity/pod-platform.js
tools/analiza-vnext/entity/consumable-family.js
tools/analiza-vnext/entity/compatibility-edge.js
tools/analiza-vnext/evidence/envelope.js
tools/analiza-vnext/evidence/source-attempt.js
tools/analiza-vnext/adapters/current-registry.js
tools/analiza-vnext/adapters/current-products.js
tools/analiza-vnext/adapters/current-pod-universe.js
tools/analiza-vnext/projections/legacy-compat.js
tools/analiza-vnext/tests/entity-contract.test.js
tools/analiza-vnext/tests/legacy-compat.test.js
```

Phase 1 will ingest controlled copies of current registries/entities, preserve
storefront/operator and clone/authentic distinctions, retain POD consumables
and compatibility edges, and emit byte/schema-compatible legacy projections.
It will not switch the public UI, scoring or production workflows.

## Next gate

Open a draft PR against `analiza-romania-vnext-blueprint-v1`, run a clean
worktree audit and leave it unmerged. Stop after this Phase 0 PR. Phase 1 starts
only as a separate approved change.
