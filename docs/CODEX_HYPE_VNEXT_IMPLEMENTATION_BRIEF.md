# CODEX HANDOFF — HYPE Global Intelligence vNext

**Status:** implementation brief  
**Date:** 2026-09-01  
**Repository:** `andreiclim77-cell/rta`  
**Specification branch:** `hype-global-intelligence-blueprint-v1`

---

# 0. Mission

Implement **HYPE Global Intelligence vNext** inside the existing `ghid-rta.ro` codebase by integrating, preserving and progressively upgrading the current HYPE system.

This is **not** a greenfield rewrite and must not destabilize the live site.

The target is a public-source intelligence system for RTA, mods, RTA-specific accessories, POD/AIO/Boro and clone-product signals that:

- distinguishes verified recent releases from rumors/signals;
- preserves long lifecycle timelines;
- detects signals observed in the last 30 days even when expected release is more than 30 days away;
- discovers new sources/entities;
- distinguishes independent origins from copied/reposted evidence;
- exposes explainable scores and uncertainty;
- measures real source coverage and failures;
- remains compatible with the current HYPE UI/data during migration.

---

# 1. Mandatory reading order

Before changing code, read these files in order:

1. `docs/HYPE_GLOBAL_INTELLIGENCE_BLUEPRINT.md`
2. `docs/HYPE_GLOBAL_SOURCE_MAP.md`
3. `docs/HYPE_DATA_MODEL_SCORING_AND_PIPELINE.md`
4. `docs/HYPE_CURRENT_TECHNICAL_AUDIT_2026-09-01.md`
5. `docs/HYPE_ACCEPTANCE_BACKTEST_AND_CUTOVER.md`
6. `docs/HYPE_EXTERNAL_SOURCE_VALIDATION_2026-09-01.md`
7. this file.

Then inspect all current HYPE/Market integration files, especially:

- `.github/workflows/market-hype-2026-sync.yml`
- `.github/workflows/market-hype-global-quality.yml`
- `data/market-hype-sources-2026.json`
- `data/market-hype-active-makers-extra-2026.json`
- `data/market-pod-universe-2026.json`
- `data/market-hype-*.json`
- `tools/*market-hype*2026.js`
- `tools/market-product-canonical-2026.js`
- `tools/market-pod-classifier-2026.js`
- `assets/market-hype-ui.js`
- `assets/market-hype-ui.css`
- `assets/market-loading-guard.js`
- `assets/market-access-policy.js`
- `cloudflare/market-hype-refresh/worker.mjs`
- `sw.js`
- surrounding `market-2026` data/history integrations.

Do not begin implementation until existing data contracts and current truth protections are mapped.

---

# 2. Non-negotiable implementation constraints

1. **Do not rewrite the live HYPE in one PR.**
2. **Do not delete current data or collectors initially.**
3. **Do not weaken anti-relisting/new-arrival/date truth gates to increase result count.**
4. **Do not introduce product-name-specific patches when a generic rule can solve the class of problem.**
5. **Do not treat raw URL/domain count as independent corroboration.**
6. **Do not treat first-seen/indexed/dateModified as exact release date.**
7. **Do not force future rumors into a ±30-day launch horizon.**
8. **Do not fabricate product names for unnamed candidates.**
9. **Do not collapse authentic and clone lifecycle.**
10. **Do not assume regulatory/IP record = market launch.**
11. **Do not make the core dependent on private/unauthorized sources.**
12. **Do not add secrets to static JS/Git.**
13. **Do not make Bing RSS the sole global search mechanism.**
14. **Do not claim “global” from maker/forum count alone.**
15. **Keep `main` deployable and current site functional throughout migration.**

---

# 3. Branch/PR strategy

Use phased implementation branches/PRs. Suggested structure:

```text
hype-vnext-00-baseline
hype-vnext-01-core-schema
hype-vnext-02-lineage-lifecycle
hype-vnext-03-source-registry-search
hype-vnext-04-new-adapters
hype-vnext-05-scoring-projections
hype-vnext-06-ui-shadow
hype-vnext-07-scale-storage
hype-vnext-08-cutover
```

If using fewer PRs, preserve the same logical boundaries.

Each PR must include:

- scope;
- files changed;
- migration impact;
- tests added;
- old vs new comparison;
- rollback behavior;
- known limitations;
- no unrelated refactors.

---

# 4. Phase 0 — freeze current baseline FIRST

Create a deterministic benchmark before truth logic changes.

Deliverables:

```text
data/hype-benchmark/
  baseline-2026-09-01.json
  fixtures/
  README.md

tools/hype-vnext/
  capture-baseline.js
  run-benchmark.js

docs/HYPE_VNEXT_IMPLEMENTATION_STATUS.md
```

Baseline captures:

- current data schemas;
- current products/events/signals/queues;
- generated/reference timestamps;
- current source/maker/forum counts;
- workflow duration if available;
- known valid cases;
- known relisting/false-positive edge cases;
- current HYPE UI contract.

Convert current protections (`newArrivalIsNotRelease`, relisting memory, retail gate, stale date behavior) into regression fixtures before refactoring.

**Do not change public HYPE behavior in Phase 0.**

---

# 5. Phase 1 — vNext core schema beside current system

Create new internal module tree. Prefer CommonJS initially to fit the existing Node style unless a repo-wide migration is independently justified.

Suggested layout:

```text
tools/hype-vnext/
  core/
    ids.js
    normalize.js
    dates.js
    taxonomy.js
    errors.js
  schema/
    source.js
    evidence.js
    product.js
    event.js
    score.js
  registry/
    seed-import.js
    source-registry.js
    source-policy.js
    source-health.js
  evidence/
    store.js
    feature-extractor.js
  lifecycle/
    claims.js
    projector.js
    release-gates.js
    novelty.js
  lineage/
    lineage.js
    text-similarity.js
    media-fingerprint.js
  scoring/
    evidence-confidence.js
    identity-confidence.js
    date-confidence.js
    launch-probability.js
    novelty-confidence.js
    momentum.js
    coverage.js
  projections/
    released.js
    radar.js
    watch.js
    coverage.js
    legacy-compat.js
  adapters/
  qa/
```

Do not add a large framework solely for architecture aesthetics. The current repo has minimal dependencies. Add dependencies only when the benefit is concrete and covered by tests/security review.

### Phase 1 storage

To de-risk the migration, vNext may initially use versioned JSON fixtures/state in a dedicated `data/hype-vnext/` directory while the architecture is proven.

Design interfaces so the canonical store can later move to D1 without rewriting business logic.

Example storage abstraction:

```js
EvidenceStore.append(evidence)
EvidenceStore.findByProduct(productId)
EventStore.appendClaim(claim)
ProjectionStore.write(name, payload)
SourceRegistry.getActive(plan)
```

---

# 6. Phase 1 — compatibility requirement

Build `legacy-compat` projection early.

vNext must be capable of emitting current-style records consumed by:

- `assets/market-hype-ui.js`;
- `assets/market-loading-guard.js`;
- service-worker/static data paths.

Do not switch the current UI yet.

Run old pipeline and vNext compatibility projection side by side.

---

# 7. Phase 2 — event sourcing and lifecycle preservation

Implement immutable evidence/event claims.

Required event types are defined in the blueprint. At minimum support immediately:

```text
RUMOR
LEAK
TRADEMARK_FILED
DESIGN_FILED
DOMAIN_SIGNAL
CERTIFICATE_SIGNAL
MANUAL_DISCOVERED
FIRMWARE_SUPPORT
TEASER
PROTOTYPE
REVIEW_SAMPLE_RECEIVED
REGULATORY_NOTIFICATION
PRODUCTION_START
DISTRIBUTOR_LISTING
WAITLIST_OPEN
PREORDER_OPEN
OFFICIAL_ANNOUNCEMENT
FIRST_RETAIL_OBSERVATION
IN_STOCK
OFFICIAL_RELEASE
REGIONAL_RELEASE
BATCH
REISSUE
VARIANT_RELEASE
ACCESSORY_RELEASE
CLONE_RELEASE
DELAYED
CANCELLED
WITHDRAWN
CORRECTION
```

Do not store one “final eventDate” as canonical truth.

Maintain separately:

- `observedAt`;
- source publication time;
- claimed event date;
- expected interval;
- first known public;
- first confirmed;
- first observed market;
- official release when known.

Refactor `consolidate-market-hype-2026.js` behavior into a vNext projection builder while preserving current anti-relisting behavior as tests.

---

# 8. Phase 2 — lineage before more source volume

Implement evidence origin clustering before broad expansion.

Minimum lineage rules:

- canonical URL/redirect;
- explicit source/canonical citation;
- same author/account cross-post;
- exact content hash;
- normalized text similarity;
- identical/near-identical image hash;
- obvious press-release syndication;
- same retailer/distributor feed where detectable.

Output separately:

```text
rawEvidenceCount
independentOriginCount
independentSourceFamilyCount
```

Do not remove raw evidence; only prevent it from inflating corroboration.

Add gold-set tests:

- 20 copied press-release pages = one origin;
- one reviewer on 3 platforms = one origin;
- an unrelated reviewer with own sample = additional origin.

---

# 9. Phase 2 — split time windows

Implement constants/config:

```text
signalObservationWindowDays = 30
recentReleaseWindowDays = 30
forecastHorizonDays = 180
historyMemoryDays = 730
```

A signal observed today remains in RADAR even if ETA is 90 days away.

Do not delete >180-day candidates; classify forecast as LONG_RANGE/UNKNOWN when appropriate.

Update current ±30-day enforcement only at the projection compatibility layer until vNext UI can render the new model.

---

# 10. Phase 3 — unified Source Registry

Import and normalize:

- `market-hype-sources-2026.json`;
- `market-hype-active-makers-extra-2026.json`;
- `market-pod-universe-2026.json`;
- relevant Market 2026 brand universe;
- current retailer/vendor configs.

Create source lifecycle:

```text
CANDIDATE
QUARANTINED
ACTIVE
DEGRADED_TECHNICAL
DEGRADED_POLICY
DRIFTED
INACTIVE
RETIRED
```

Every active source has:

- family/type;
- region/language/category;
- access adapter;
- truth role;
- cadence;
- source prior;
- policy state;
- health/freshness;
- last useful evidence;
- discovery yield.

Do not duplicate maker entries merely because aliases exist.

---

# 11. Phase 3 — Source Discovery

Create generic source-candidate discovery.

Sources of candidate entities/endpoints:

- all current product brands;
- retailer brand facets;
- official-site `sameAs`;
- event exhibitor lists;
- regulatory submitter/manufacturer names;
- IP owner/applicant names;
- official collaboration/designer names;
- recurring early reviewers;
- product support/manual domains;
- newly observed brand-linked domains/subdomains;
- reputable new specialist sources referenced by existing trusted sources.

New sources start quarantined. They must pass:

- identity match;
- public/authorized access policy;
- sample content relevance;
- noise/duplicate assessment;
- source health;
- truth-role classification.

Do not make newly discovered sources decision/truth eligible automatically.

---

# 12. Phase 3 — Query Factory and search-provider abstraction

Refactor current `preQueryPlan`/related logic into a standalone Query Factory.

Remove fixed global query slicing.

Inputs:

```text
brand aliases
category/product terms
signal concepts
language pack
region
source family
budget
activity priority
```

Persist query plan and query reason.

Implement:

```js
SearchProvider.search(params)
SearchProvider.news(params)
SearchProvider.health()
SearchProvider.cost()
```

Recommended provider strategy:

1. direct source adapters first;
2. configurable documented search provider (Brave is the validated current candidate);
3. optional additional provider;
4. existing Bing RSS only as legacy low-confidence fallback while it remains healthy.

Never make provider outage block direct-source scanning.

Secrets only in GitHub/Cloudflare secret stores.

---

# 13. Phase 3 — multilingual packs

Implement data-driven lexicon files, not a huge regex embedded in one collector.

Suggested:

```text
data/hype-vnext/lexicons/en.json
ro.json
de.json
fr.json
it.json
es.json
pl.json
zh-CN.json
ja.json
...
```

Initial Tier-A packs:

- EN
- RO
- DE
- FR
- IT
- ES
- PL
- zh-CN
- JA

Each pack maps concepts:

- rumor;
- leak;
- teaser;
- prototype;
- sample;
- production;
- coming soon;
- preorder;
- launch/release;
- batch;
- shipping;
- manual;
- firmware;
- trademark/design;
- correction/delay/cancel.

Brand/model/SKU tokens are never translated.

Add positive/negative fixtures per language.

---

# 14. Phase 4 — high-value adapters, in this order

Do not implement all internet sources at once. Implement source families in order of signal value and correctness.

## 4A. Manufacturer direct diff

- sitemap/sitemap index;
- RSS/news;
- product index;
- manual/support/download;
- firmware/release notes;
- public structured product data;
- content hash/ETag/Last-Modified;
- semantic state diff.

## 4B. Regulatory

Adapters for validated public sources, beginning with:

- Romania RO-ECigarette publications;
- MHRA ECIG Dynamic Search;
- Italy public database/export;
- Poland public list with correct six-month publication semantics;
- New Zealand notified-products data;
- FDA public legal-market/registration databases.

Every adapter must encode what its date means.

## 4C. IP

- WIPO Global Brand/Design;
- EUIPO/TMview/DesignView;
- prioritized national offices as needed by discovered applicants.

Output artifact events only; no release promotion from filing alone.

## 4D. Trade shows

Config-driven event adapters for major current event families. Preserve event-date revisions and exhibitor deltas.

## 4E. Creator/reviewer

Start with YouTube/public channels already represented in repo. Use documented APIs where configured. Build reviewer source calibration and lineage.

## 4F. Web infrastructure/archive

- Common Crawl prior-existence discovery;
- RDAP;
- public Certificate Transparency observations;
- public web archive index where implemented/allowed.

## 4G. OEM/ODM/B2B

Discovery-only default; activate only after policy review. Do not let B2B volume pollute release truth.

---

# 15. Phase 4 — retail/catalog modernization

Reuse working current direct vendor collectors where possible by adapting outputs to the common evidence envelope.

Required retail states:

```text
UNKNOWN
PLACEHOLDER
COMING_SOON
WAITLIST
PREORDER
BACKORDER
IN_STOCK
OUT_OF_STOCK
DISCONTINUED
REMOVED
```

Maintain first-seen history per source/product.

Current rules such as relisting != release and single retailer needs corroboration remain benchmark requirements.

---

# 16. Phase 5 — scoring engines

Implement independently:

```text
EC Evidence Confidence
IC Identity Confidence
DC Date Confidence
LP Launch Probability
NC Novelty Confidence
HM Hype Momentum
CC Coverage Confidence
```

Do not replace these with one global number.

Every score run stores:

- scoring version;
- input evidence IDs;
- key features;
- penalties;
- output;
- human-readable reason/explanation.

Start rule-based and deterministic. Do not train a statistical/ML model until enough labeled historical outcomes exist.

Launch Probability alone cannot create H6.

---

# 17. Phase 5 — H-stage and release gates

Implement H0-H7 exactly as specified in the blueprint.

Every H6/H7 output must include internal `releaseAudit`:

- gate used;
- evidence IDs;
- independent lineage IDs;
- novelty class/score;
- prior-existence coverage;
- region;
- date semantics;
- warnings.

Publication validator must fail H6/H7 without valid release audit.

---

# 18. Phase 5 — coverage engine

Replace maker-count “global” logic with coverage matrix:

```text
source family × region × language × category × freshness
```

Keep old minimum counts only as regression floors.

Publish compact `hype-coverage-vnext.json`.

Known/unsupported/private areas must be shown as unknown/not covered, not silently zero.

---

# 19. Phase 6 — vNext read projections

Create:

```text
data/hype-vnext/hype-released-vnext.json
data/hype-vnext/hype-radar-vnext.json
data/hype-vnext/hype-watch-vnext.json
data/hype-vnext/hype-coverage-vnext.json
```

Dossiers may initially be compact files:

```text
data/hype-vnext/dossiers/<product_id>.json
```

Later migrate to D1/API if size grows.

RADAR inclusion is based on **material evidence change observed within 30 days**, not merely candidate ETA.

---

# 20. Phase 6 — shadow UI, no abrupt visual rewrite

Create a separate module such as:

```text
assets/market-hype-vnext-ui.js
assets/market-hype-vnext-ui.css
```

Reuse current visual language.

Add feature flag/config to switch between current and vNext projection without deleting old implementation.

Required vNext UI concepts:

- RELEASED · 30d;
- RADAR · signals seen 30d;
- RUMORS;
- WATCHLIST;
- category/brand/region/status filters;
- candidate card;
- H-stage;
- EC/IC/DC/LP/NC/HM/CC;
- independent origins vs raw evidence;
- first signal/latest material change;
- expected launch interval;
- full lifecycle timeline;
- complete evidence drawer;
- contradiction/correction state;
- stale/degraded coverage state.

Do not force all information onto the collapsed card. Keep list view compact; load dossier detail on expansion/demand.

---

# 21. Phase 7 — storage/orchestration scale migration

Only after the event model and projections are proven should canonical storage move from repo JSON to Cloudflare or equivalent persistent storage.

Recommended target:

- D1: entities/evidence/events/scores/source registry;
- R2: optional permitted raw artifacts/media snapshots;
- KV: cursors/locks/cache/health;
- Queues: source scan fan-out;
- Workers/Cron: scheduling/collectors;
- GitHub Actions: CI/backtests/compact snapshot/deploy.

Keep storage interfaces stable so business logic is unchanged.

Manual refresh worker should eventually enqueue high-priority incremental tasks rather than dispatching the entire global monolith.

---

# 22. Source adapter policy rules

For every adapter document:

```text
source semantics
public/authorized status
robots/terms state where applicable
rate limit
commercial-use/API constraint where applicable
retention rule
truth role
health test
parser fixture
```

No anti-bot bypass, CAPTCHA bypass, credential circumvention or private-channel crawling.

Reddit/social platform access must honor current policy/API terms. TikTok Research Tools must not be assumed available for this deployment.

---

# 23. Existing files to avoid destructive early edits

Avoid large direct modifications to `index.html` until data and shadow UI contracts are stable.

Avoid deleting or renaming current public data paths until service worker/current UI compatibility is proven.

Prefer additive modules and small targeted integration hooks.

Keep current `assets/market-hype-ui.js` functional until cutover.

---

# 24. Benchmark requirements — mandatory before cutover

Follow `HYPE_ACCEPTANCE_BACKTEST_AND_CUTOVER.md`.

Minimum final thresholds:

- at least 100 labeled gold-set cases, with substantial negative/ambiguous cases;
- H6/H7 retrospective precision >=95%;
- audited H6/H7 false-positive rate <2%;
- H5-H7 identity accuracy >=98%;
- all H6/H7 have release audit;
- all H4-H7 trace to evidence metadata;
- no stale ETA auto-release;
- no search-snippet-only H6;
- no known relisting as new release;
- 7–14 successful shadow comparison cycles;
- no unresolved material truth regression.

---

# 25. CI additions

Create vNext quality workflow without removing current quality workflow initially.

Suggested:

`.github/workflows/market-hype-vnext-quality.yml`

It should run:

- syntax;
- schema contract;
- benchmark fixtures;
- lineage tests;
- date/DST tests;
- multilingual fixtures;
- release audit validation;
- source-policy validation;
- projection validation;
- compatibility projection test;
- UI syntax/basic render checks where existing tooling permits.

Only later merge/replace old quality contract.

---

# 26. Implementation status ledger

Maintain:

`docs/HYPE_VNEXT_IMPLEMENTATION_STATUS.md`

For each phase record:

```text
status
branch/PR
implemented modules
migrated sources
benchmark results
known gaps
source coverage changes
runtime/cost
rollback point
next phase
```

Update it in every HYPE vNext PR.

---

# 27. What not to optimize prematurely

Do not prematurely:

- train ML launch models;
- add browser automation to every source;
- scrape every social network;
- migrate all data to D1 before schema truth is proven;
- redesign whole ghid-rta.ro;
- increase source count without lineage/source-health;
- optimize tiny execution costs at the expense of evidence traceability.

Correct lifecycle/provenance first.

---

# 28. First implementation milestone

The first milestone is **not** “new UI live”. It is:

> On the same date, vNext can ingest a controlled subset of current HYPE evidence, preserve multiple lifecycle events, cluster duplicated origins, compute separate signal/release windows, and emit a compatibility projection that the existing HYPE UI can read without regression.

Required milestone demo fixture:

One product dossier must show at least:

```text
rumor -> artifact/prototype -> later confirmation
```

while a known relisting fixture remains rejected as a new release.

---

# 29. Second milestone

Source Registry + Query Factory + provider abstraction + manufacturer direct diff + at least one regulatory adapter + one IP adapter + one event adapter, all producing the common evidence envelope.

No public cutover yet.

---

# 30. Third milestone

Scoring + release audits + coverage model + vNext shadow UI + 100-case benchmark + multi-day shadow runs.

Only after acceptance review should vNext become the default HYPE view.

---

# 31. Final instruction

The goal is not maximum code volume or maximum result count. The goal is **maximum useful global intelligence under explicit truth, provenance, coverage and compliance constraints**.

When a trade-off exists:

```text
traceable truth > more results
independent origins > raw page count
event history > destructive simplification
measured coverage > “global” marketing label
generic rules > one-product patches
safe migration > big-bang rewrite
```

Proceed phase by phase and keep the existing site operational until the vNext acceptance gates are passed.
