# ANALIZA ROMÂNIA vNext — Maximum Operating Procedures

**Status:** CANONICAL SOP — v1.0  
**Date:** 2026-09-01

These procedures govern how ANALIZA operates. They are mandatory companion material to the architecture.

---

# Governing principles

1. Romania evidence first; global context second.
2. Evidence types remain semantically separate.
3. No source failure becomes a fake zero.
4. Storefront and operator are separate.
5. POD device and consumables are separate but linked.
6. Every score and recommendation is explainable.
7. Same-store/cohort trends are preferred when coverage changes.
8. Unknown/data-gap is preferable to invented certainty.
9. Current live ANALIZA remains functional until shadow cutover.
10. Public/authorized collection only; no bypasses.

---

# SOP-01 — Daily scan planning

Inputs:

- retailer/source registry;
- source health;
- categories due for scan;
- unresolved identities;
- POD compatibility queue;
- previous failures;
- national-universe state;
- HYPE watch candidates;
- cost/rate budgets.

Output an immutable daily scan plan with task reason and priority.

---

# SOP-02 — Romanian national-universe discovery

Run multiple discovery routes, not one search engine. Include RTA, MOD and POD-specific query packs, price-comparison seller discovery, dealer locators, historical registry and public business/store references.

All new candidates enter adjudication; none enter statistics immediately.

---

# SOP-03 — New retailer candidate validation

Validate:

- consumer-facing;
- serves Romania;
- in-scope hardware;
- stable storefront;
- not marketplace-only/B2B/editorial;
- public/authorized access;
- operator identity sufficiently resolvable.

Set state: ACTIVE / QUARANTINED / CROSS_BORDER / REJECTED.

---

# SOP-04 — Retailer revalidation

Periodically verify active stores still exist, still serve Romania and remain relevant. Preserve historical records for dead/renamed domains.

---

# SOP-05 — Operator resolution

Resolve storefront -> economic operator from public legal pages/official validation where available. Do not merge operators from name similarity alone.

---

# SOP-06 — Alternate storefront resolution

When one operator runs multiple domains, keep each storefront for observable breadth but link to one operator for concentration/independence.

---

# SOP-07 — Cross-border seller classification

Foreign/localized shops shipping to Romania are `CROSS_BORDER_TO_RO`, not core local denominator unless scope is intentionally changed.

---

# SOP-08 — Source policy review

Record access method, terms review, rate limits, robots state where applicable, retention/privacy constraints and kill switch.

Uncertain policy => `POLICY_HOLD`.

---

# SOP-09 — Source technical-health monitoring

Measure request success, parser success, yield, latency, drift, redirect/domain changes, category coverage and last useful observation.

---

# SOP-10 — Storefront category discovery

Discover all relevant categories using navigation, sitemap, site search and product classification. Do not depend only on manually seeded URLs.

---

# SOP-11 — RTA source discovery within store

Search explicit RTA/RBA/rebuildable categories and model/product classification. Keep RDA/RDTA distinct where outside default scope.

---

# SOP-12 — MOD source discovery within store

Discover regulated/mechanical/SBS/squonk/AIO/Boro host products through categories and classification.

---

# SOP-13 — POD device discovery within store

Search category labels, sitemaps and known POD maker/series terms. Classify device vs consumable.

---

# SOP-14 — POD consumable discovery within store

Search replacement pods, cartridges, coils and platform-specific consumables. Never discard them because they are not devices.

---

# SOP-15 — Boro/AIO discovery

Discover hosts, bridges/RBAs and compatibility-specific parts separately.

---

# SOP-16 — Direct API/feed ingestion

Prefer intentional public API/feed/structured endpoints when available. Store adapter version and source semantics.

---

# SOP-17 — Sitemap ingestion

Use sitemap diff to detect new/removed product URLs. Sitemap presence is listing evidence, not stock/sales truth.

---

# SOP-18 — HTML product-list ingestion

Extract product title, URL, category context, visible price/stock and pagination. Record parser version.

---

# SOP-19 — Product-page verification

Use product page to resolve price, stock, SKU/brand/compatibility and explicit counters. Prefer this over search snippets/aggregators.

---

# SOP-20 — Structured-data extraction

Parse JSON-LD Product/Offer only when it matches visible/current product context. Keep visible-vs-structured conflicts for review.

---

# SOP-21 — Ranking-source discovery

Discover retailer-labelled bestseller/popularity pages, widgets and sorts. New ranking sources are quarantined until semantics validated.

---

# SOP-22 — Ranking-semantic validation

Determine whether ranking represents sales, popularity, views, editorial ordering or unknown. Only validated commercial ranking is Tier B.

---

# SOP-23 — Ranking normalization

Preserve raw rank and visible depth; normalize source-relative rank before cross-store aggregation.

---

# SOP-24 — Explicit sales-counter detection

Accept only counters with defensible product-specific units-sold semantics. Reject generic order counts and ambiguous counters.

---

# SOP-25 — Cumulative counter delta

First observation is baseline. Only non-negative comparable deltas become period units. Counter reset/decrease triggers review.

---

# SOP-26 — Behavioral proxy extraction

Extract review/view/wishlist/public popularity counters as Tier C only. Never label as sales.

---

# SOP-27 — Price extraction

Extract regular, promo and current price separately, source URL, currency, tax context if exposed and availability state.

---

# SOP-28 — Price pack normalization

Normalize POD cartridge/coil pack quantity and derive per-unit price. Do not compare pack totals directly across quantities.

---

# SOP-29 — Bundle handling

Detect device+pods/coil/battery bundles. Either split components when defensible or exclude from standalone price cohort.

---

# SOP-30 — Price anomaly review

Flag implausible zero/very low/high prices, installment values mistaken as price, strike-through parsing errors, foreign currency and decimal issues.

---

# SOP-31 — Promotion detection

Store promo start/first observed, regular/current price and persistence. Promotion is not organic demand.

---

# SOP-32 — Stock-state extraction

Classify IN_STOCK / OUT_OF_STOCK / BACKORDER / PREORDER / LOW_STOCK_EXPLICIT / unknown. Do not infer stock from add-to-cart alone when semantics uncertain.

---

# SOP-33 — Missing-product adjudication

If a known product disappears, first check source/page/category/parser health. Only after valid observation can it become REMOVED; discontinuation requires stronger evidence.

---

# SOP-34 — Source outage / fake-zero protection

If fetch/parser/category scan failed, mark `INCOMPLETE_COVERAGE`. Do not emit zero listings or stock-out for failed scope.

---

# SOP-35 — Parser drift detection

Trigger when product yield/price/stock/ranking extraction changes abnormally. Quarantine affected metric until parser repaired.

---

# SOP-36 — Brand resolution

Resolve brand from canonical alias registry and product context. Do not use first words of title as authoritative brand.

---

# SOP-37 — Product canonicalization

Normalize model/family while preserving raw titles. Similar names alone cannot merge unrelated products.

---

# SOP-38 — Variant resolution

Merge colors/material finishes into product where appropriate but retain SKU/variant evidence. Revisions remain separate when materially distinct.

---

# SOP-39 — Clone/original handling

Clone products remain distinct entities linked to claimed original. Their listings/rankings cannot inflate authentic product evidence.

---

# SOP-40 — POD device-vs-consumable classification

Explicitly classify device, replacement pod, cartridge, coil, AIO/Boro entity. Uncertain items enter review queue.

---

# SOP-41 — POD platform resolution

Map devices to canonical platform/family without assuming every similarly named generation is compatible.

---

# SOP-42 — POD compatibility-edge validation

Prefer official sources; corroborate retailer claims. Store version/generation scope and confidence.

---

# SOP-43 — POD ecosystem breadth calculation

Calculate device breadth, consumable breadth and stores carrying both. Resistance variants cannot inflate storefront count.

---

# SOP-44 — POD ecosystem stock continuity

Compute only over successfully observed days. Source outage days are excluded.

---

# SOP-45 — Price-comparison ingestion

Use Compari/Price-type sources for seller discovery, offer price and availability context. Resolve each seller to canonical storefront and dedupe direct observations.

---

# SOP-46 — Marketplace ingestion

Keep marketplace evidence in a separate source family. Do not add marketplace seller count to local storefront breadth without explicit admission.

---

# SOP-47 — Google Ads demand refresh

Refresh historical metrics monthly, geo-target Romania. Query device and POD consumable aliases separately. Cache source month/version.

---

# SOP-48 — Google Trends ingestion

Only if official alpha/API access exists. Store region/subregion, time aggregation and scaling semantics. Failure must not block ANALIZA.

---

# SOP-49 — First-party guide intent

Aggregate privacy-safe search/entity interaction counts. Separate site-audience behavior from national demand.

---

# SOP-50 — Romanian community intelligence

Collect public/authorized Romania-relevant mentions. Deduplicate cross-posts where practical and keep them as demand/context.

---

# SOP-51 — Romanian video/social relevance

Only signals with strong Romania relevance enter DSR. Global review traffic stays context.

---

# SOP-52 — Advertising transparency

Observe product/brand campaigns in Romania where public interfaces permit. Treat as marketing intensity, not sales.

---

# SOP-53 — Regulatory artifact ingestion

Monitor RO-ECigarette versions. Use for identity/entity discovery; never retail/sales inference.

---

# SOP-54 — Trade/import structural metric activation

No metric goes live until commodity scope is validated and contamination/lag documented. If too broad, disable.

---

# SOP-55 — HYPE bridge

New HYPE releases/candidates create Romanian watch tasks only. Romanian scores remain driven by Romanian evidence.

---

# SOP-56 — Daily coverage calculation

Compute retailer, category and evidence-tier coverage after scan results. Coverage uses successful scans, not configured counts alone.

---

# SOP-57 — Universe Coverage Confidence

Score discovery-route health, unresolved candidates, certification freshness and registry reconciliation.

---

# SOP-58 — National-universe certification

Require repeated multi-route clean audits and no unresolved material candidates. Certification expires automatically.

---

# SOP-59 — Comparable-cohort construction

Before trend calculation, derive current/baseline source intersection. Use same-store trend when cohort changed materially.

---

# SOP-60 — New retailer onboarding trend protection

New retailer data contributes to current breadth but cannot create historical momentum before comparable baseline exists.

---

# SOP-61 — Commercial Signal Strength

Calculate from validated Tier A/B features, ranking persistence and operator diversity. Record missing Tier A explicitly.

---

# SOP-62 — Distribution Breadth

Calculate storefront and operator breadth separately, using active certified/provisional denominator appropriate to the published claim.

---

# SOP-63 — Availability Health

Calculate from in-stock breadth and continuity, coverage-adjusted.

---

# SOP-64 — Romanian Demand Strength

Combine eligible Romania-specific demand sources with dynamic weight redistribution. Global-only sources excluded.

---

# SOP-65 — Momentum calculation

Calculate commercial, breadth, demand, availability, price and ecosystem momentum separately before optional composite.

---

# SOP-66 — Data Confidence

Use source health, coverage, history, cohort stability, identity and semantic confidence. Missing data lowers confidence; it is not imputed as favorable evidence.

---

# SOP-67 — POD Ecosystem Health Score

Use device/consumable breadth, commercial signals, continuity and Romania demand. Effective weights disclosed.

---

# SOP-68 — Opportunity / white-space score

Require Romanian demand. Cap HYPE/global contribution. Penalize supply/ecosystem/data risks.

---

# SOP-69 — Risk score

Calculate separate source, supply, price, ecosystem, identity and concentration risks; do not hide all detail behind scalar.

---

# SOP-70 — Recommendation generation

Apply guarded states CORE/GROW/TEST/WATCH/REDUCE/MINIMAL/DATA_GAP/etc. Aggressive states require sufficient confidence.

---

# SOP-71 — Recommendation explanation

Generate why-now, positives, negatives, missing data, upgrade/downgrade triggers and scoring version.

---

# SOP-72 — Contradictory signals

Example: search rising while ranking falling. Preserve both, lower confidence or explain divergence; do not force one narrative.

---

# SOP-73 — Concentration calculation

Calculate storefront/operator/brand concentration only on explicitly named observed indices. Never call it national unit share absent Tier A coverage.

---

# SOP-74 — Extreme movement review

Any large one-day score/rank/price/breadth move triggers source/cohort/parser verification before management escalation.

---

# SOP-75 — Manual review queue

Prioritize uncertain identity, price anomalies, compatibility ambiguity, new retailers, ranking semantics, operator duplicates and extreme movements.

---

# SOP-76 — Manual correction

Record correction provenance/version; rebuild dependent projections. Never patch product-specific behavior invisibly inside unrelated collector code.

---

# SOP-77 — Daily publication gate

Require fresh Market base, valid Analysis datasets, coverage semantics, identity/price/POD QA and no forbidden market-share wording.

---

# SOP-78 — Stale publication handling

If daily analysis fails, keep last valid snapshot with visible stale/degraded timestamp; do not publish partial result as fresh.

---

# SOP-79 — Weekly source/universe review

Review new retailer candidates, drifted stores, dead domains, category gaps and POD coverage gaps.

---

# SOP-80 — Monthly demand refresh review

Verify Google Ads month, optional Trends state, keyword universe and new POD/platform aliases.

---

# SOP-81 — Monthly scoring calibration

Compare recommendations with subsequent observed commercial evidence. Adjust thresholds/weights only via versioned calibration.

---

# SOP-82 — Benchmark/gold-set maintenance

Add every discovered false positive/negative and difficult edge case as a regression fixture.

---

# SOP-83 — Historical backtest

Replay stored observations through new scoring versions. Compare precision, stability, false trend and recommendation churn.

---

# SOP-84 — Recommendation churn test

Flag entities oscillating states without meaningful evidence changes. Stabilize with hysteresis/threshold design rather than suppressing facts.

---

# SOP-85 — POD compatibility backtest

Audit platform edges and generation changes; prevent outdated compatibility assumptions from persisting.

---

# SOP-86 — Price backtest

Audit current/historical price normalization including promos, bundles, pack quantities and currency parsing.

---

# SOP-87 — Coverage failure incident

If material retailer/category coverage drops, mark degraded, pause strong recommendations affected, diagnose source failures and restore from last valid evidence.

---

# SOP-88 — Wrong-sales-semantics incident

If a ranking/counter was misclassified as sales, quarantine source, correct history/projections, document impact and add regression test.

---

# SOP-89 — Wrong-product-identity incident

Split/merge entities correctly, reassign evidence, rebuild scores/history and record correction.

---

# SOP-90 — Disaster recovery

Maintain recoverable snapshots of canonical registries, schemas, history and last valid projections. Restore without converting missing interval into market movement.

---

# SOP-91 — Schema migration

Every schema change includes migration, compatibility projection, version bump, test and rollback plan.

---

# SOP-92 — Cutover procedure

Run old and vNext in shadow for required period. Compare products, scores, recommendations, POD ecosystems, coverage and wording. Cut over only after acceptance gates pass.

---

# SOP-93 — Post-cutover monitoring

Keep rollback path and compare selected legacy metrics for a stabilization period. Investigate material unexplained divergence.

---

# SOP-94 — Source retirement

Retire dead/irrelevant sources without deleting history. Re-activation requires health/policy validation.

---

# SOP-95 — Definition-change governance

Any material change to `sale`, `bestseller`, `Romanian demand`, `POD ecosystem`, `market universe` or recommendation semantics must update docs/tests/version.

---

# SOP-96 — Honest zero-result rule

ANALIZA may say “no observed signal” only when the relevant scan scope is sufficiently complete. Otherwise say `insufficient/incomplete observation`.

---

# Operational closure

The SOP set is complete only when automation/tests enforce the important procedures rather than relying on documentation alone.

**End of canonical operating procedures.**
