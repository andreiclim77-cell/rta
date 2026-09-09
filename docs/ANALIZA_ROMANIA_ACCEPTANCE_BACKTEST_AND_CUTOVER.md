# ANALIZA ROMÂNIA vNext — Acceptance, Backtest & Cutover Gates

**Status:** CANONICAL COMPANION SPEC — v1.0  
**Date:** 2026-09-01

No production cutover is allowed merely because vNext produces more metrics, more stores or more recommendations.

Priority order:

1. evidence semantics;
2. product/platform identity;
3. source/coverage honesty;
4. temporal correctness;
5. price/stock correctness;
6. POD ecosystem correctness;
7. recommendation stability/usefulness;
8. recall/coverage;
9. speed.

---

# 1. Phase-0 baseline requirement

Before changing public behavior, capture:

- current retailer registry;
- current universe-audit state;
- current Market observations;
- current sales/ranking/demand datasets;
- current management output;
- current UI contract/screenshots;
- workflow durations;
- source failures;
- current product/brand/category counts;
- current POD classification samples;
- known valid/invalid examples.

If any current output file is empty/corrupt/stale, document and resolve before treating it as benchmark truth.

---

# 2. Required gold-set families

Build curated fixtures for:

## Retail/source

- active Romanian retailer;
- same operator with two storefronts;
- dead/retired store;
- foreign store shipping to Romania;
- marketplace-only seller;
- B2B-only site;
- retailer source outage;
- parser drift;
- category moved URL.

## Product identity

- canonical exact product;
- brand alias;
- title with SEO noise;
- color variant;
- bundle;
- revision/V2;
- clone vs authentic;
- same family different product.

## Sales/ranking

- explicit cumulative units-sold counter;
- first counter baseline;
- valid positive counter delta;
- counter reset;
- generic order count false positive;
- retailer-labelled bestseller;
- popularity order with unclear semantics;
- category rank vs store-wide rank.

## Price

- regular price;
- promo price;
- crossed-out price;
- installment/monthly payment false price;
- RON decimal parsing;
- bundle price;
- out-of-stock stale price;
- POD 2-pack vs 4-pack normalization.

## Availability

- in stock;
- out of stock;
- preorder;
- backorder;
- removed page;
- parser failure that must not become OOS;
- retailer-wide outage.

## POD

- POD device;
- replacement pod;
- cartridge;
- coil;
- integrated-coil pod;
- closed/prefilled platform;
- AIO;
- Boro host;
- Boro bridge;
- incompatible generations with similar series names;
- device with broad consumables;
- device with narrow consumables.

## Demand

- Romania Google Ads signal;
- global-only YouTube signal;
- Romanian community mention;
- global community mention;
- guide intent;
- HYPE signal without Romanian corroboration.

---

# 3. Product/entity accuracy gates

Before cutover:

- ≥98% canonical product identity accuracy on audited active-product sample;
- ≥99% brand resolution accuracy for top active entities;
- ≥98% variant-vs-product classification accuracy;
- 0 known clone/authentic collapses in audited top set;
- 0 known same-operator duplicate inflation in published operator breadth.

Material identity errors block cutover.

---

# 4. POD accuracy gates

- ≥98% device-vs-consumable classification accuracy;
- ≥97% POD platform/family identity accuracy;
- ≥97% compatibility-edge accuracy in audited sample;
- 0 known cartridge/coil entities shown as devices in management output;
- 0 known resistance variants inflating storefront breadth;
- ≥98% pack-quantity normalization accuracy on audited consumable offers;
- every published POD recommendation exposes EHS + Data Confidence;
- source outages cannot create false POD consumable stock-out trends.

---

# 5. Price accuracy gates

On audited current-price sample:

- ≥99% currency accuracy;
- ≥98% current-price extraction accuracy;
- ≥98% promo-vs-regular classification accuracy;
- ≥98% pack/bundle comparable-group accuracy;
- 0 known installment/monthly-payment values published as product price;
- outlier system catches all known adversarial fixtures.

---

# 6. Availability accuracy gates

- ≥98% current availability-state accuracy on audited source sample;
- source failure/parser drift never produces `OUT_OF_STOCK` automatically;
- removal vs discontinuation distinction passes all fixtures;
- stock-continuity denominator excludes failed-observation days;
- `LOW_STOCK` used only when explicitly evidenced.

---

# 7. Ranking semantic gates

Every Tier-B source must have:

- explicit semantic classification;
- scope/category;
- visible-depth handling;
- parser test;
- historical example.

No source with unknown/editorial/view-only semantics can contribute to CSS as Tier B.

Cross-retailer aggregate must retain raw rank evidence.

---

# 8. Tier-A sales gates

- only explicit product-specific unit/order semantics approved by rule;
- cumulative counters require baseline then positive delta;
- counter reset/decrease cannot produce negative/positive fake units;
- generic site order counts rejected;
- national unit/share flags stay false unless full required comparable Tier-A coverage exists.

Any regression that makes national market share available from incomplete Tier A is a hard blocker.

---

# 9. Demand geography gates

- 100% of DSR input observations carry geographic classification;
- global-only sources cannot enter DSR;
- Google Ads requests use Romania geo target;
- Google Trends, if enabled, uses Romania/subregion filters;
- guide telemetry is labelled first-party audience demand, not national demand;
- community/social Romania relevance is auditable.

---

# 10. Comparable cohort gates

Backtest source onboarding/offboarding scenarios:

- adding 5 retailers must not automatically create product momentum;
- losing a parser/source must not create decline;
- same-store trend and current full-universe breadth remain distinct;
- cohort overlap/instability is visible;
- trend confidence falls when cohort changes materially.

---

# 11. National-universe certification gates

A `CERTIFIED_FOR_DATE` state requires:

- multiple independent discovery routes operational;
- retailer-specific queries for RTA, MOD and POD;
- seller discovery from comparison/dealer-locator/historical sources;
- no unresolved material candidate;
- operator duplicates resolved;
- category coverage measured;
- at least two clean audits separated in time, with stricter configurable requirement recommended;
- certification expiry timestamp.

The UI must not show `100% România` if certification expired or UC fell below threshold.

---

# 12. Coverage truth gates

For every current snapshot:

- configured vs active vs reachable vs successful sources separated;
- category coverage separate from host reachability;
- Tier A/B/C/D coverage separately reported;
- POD device and POD consumable coverage separate;
- failures listed or summarized;
- incomplete coverage cannot be rendered as clean zero.

---

# 13. Recommendation quality gates

Every recommendation requires:

- explicit entity scope;
- score version;
- why-now;
- positive evidence;
- negative/contradictory evidence;
- missing data;
- Data Confidence;
- upgrade triggers;
- downgrade triggers.

Hard rules:

- DC below configured threshold cannot produce aggressive GROW;
- low EHS blocks uncomplicated POD CORE/GROW;
- high HYPE alone cannot create Romanian TEST/GROW without Romania demand evidence;
- Tier-B-only evidence cannot be described as unit-sales growth;
- one operator cannot support Romania-wide language.

---

# 14. Recommendation stability gates

Backtest recommendation churn.

Targets:

- no unexplained state flip caused solely by source-set change;
- hysteresis/threshold logic where appropriate;
- major state changes trace to material evidence change;
- ≥95% of audited recommendation transitions considered explainable from stored evidence;
- repeated CORE↔REDUCE oscillation without material changes is a blocker.

---

# 15. White-space precision gates

Curated white-space sample should verify:

- Romanian demand exists;
- low local breadth is real, not coverage failure;
- product identity resolved;
- HYPE contribution capped;
- supply/POD ecosystem risks visible;
- old/relisted products not falsely treated as emerging opportunity.

Target initial manually audited precision: ≥90% of top-20 white-space candidates are judged legitimate opportunities/data-supported tests rather than artifacts.

---

# 16. Source-failure resilience

Inject failures:

- 404 category;
- timeout;
- HTTP block;
- empty HTML;
- JS template drift;
- malformed JSON;
- comparison engine down;
- Google Ads credentials missing;
- Trends unavailable;
- retailer domain redirect.

Expected result:

- no false sales/stock conclusions;
- coverage/DC/UC adjust;
- last valid snapshot preserved where appropriate;
- failures observable;
- publication either degrades honestly or is held.

---

# 17. Backtest windows

At minimum run:

- recent 7-day replay;
- 30-day replay;
- 90-day replay where history exists;
- selected known historical product cases;
- POD platform lifecycle cases;
- source-onboarding and outage simulations.

---

# 18. Shadow-mode comparison

Before cutover run old vs vNext in parallel for **minimum 14 successful daily cycles** recommended; absolute minimum 7 only if no material issues and user explicitly accepts shorter observation.

Compare:

- product counts;
- retailer breadth;
- rankings;
- prices;
- availability;
- demand;
- recommendations;
- source coverage;
- POD platform results;
- page rendering.

Every material divergence is classified:

- vNext correction/improvement;
- old-system correct / vNext regression;
- source-cohort difference;
- unresolved.

No unresolved material truth regression at cutover.

---

# 19. Performance gates

- daily core scan completes inside configured operational window;
- no single storefront blocks whole pipeline;
- per-host bounded concurrency/rate limits;
- manual refresh can run incremental tasks;
- frontend projections remain compact enough for current site performance;
- history growth does not indefinitely inflate static Git payloads.

---

# 20. UI gates

Desktop/mobile:

- no NaN/undefined;
- labels preserve Romania scope;
- no market-share wording unless valid;
- evidence tier understandable;
- POD ecosystem state visible;
- coverage warnings visible;
- stale snapshot visible;
- keyboard/basic accessibility checks;
- old view remains available during shadow phase.

---

# 21. Cutover checklist

Cutover only when all critical gates pass:

1. schema/entity tests;
2. sales/ranking truth tests;
3. POD tests;
4. price/availability tests;
5. coverage/universe tests;
6. demand geography tests;
7. recommendation tests;
8. shadow-run period;
9. UI regression;
10. rollback plan;
11. last valid legacy snapshot retained;
12. explicit cutover record/commit.

---

# 22. Rollback

Rollback must restore:

- old read projection/UI;
- last valid current datasets;
- no loss of vNext evidence/history;
- no fake market movement for rollback interval.

---

# 23. Post-cutover stabilization

For at least 14 days after cutover:

- monitor source failures;
- recommendation churn;
- POD compatibility corrections;
- universe candidates;
- price anomalies;
- user-visible rendering;
- old/new metric divergence where legacy comparator remains.

---

# 24. Definition of acceptance

ANALIZA vNext is acceptable only when it is **more truthful, more complete and more explainable** than the current system — not merely larger.

A smaller but correct output beats a larger false one.

**End of canonical acceptance/backtest/cutover specification.**
