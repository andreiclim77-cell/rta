# ANALIZA ROMÂNIA vNext — Canonical Specification Index

**Status:** FROZEN DESIGN INDEX — 2026-09-01  
**Scope:** `ghid-rta.ro` → Piața RTA → Analiza  
**Geography:** ROMÂNIA  
**Categories:** RTA + MOD + POD/AIO/BORO + linked product-specific accessories/consumables.

No implementation may treat a single older Market/Analysis file as the complete specification.

## Mandatory reading order

1. `ANALIZA_ROMANIA_CANONICAL_SPEC_INDEX.md` — this entry point.
2. `ANALIZA_ROMANIA_VNEXT_BLUEPRINT.md` — mission, truth rules, taxonomy, market-universe model, scoring and migration.
3. `ANALIZA_ROMANIA_SOURCE_MAP_MAXIMUM.md` — Romanian storefront/source universe and discovery semantics.
4. `ANALIZA_ROMANIA_RETAILER_CANDIDATE_REGISTRY_MAXIMUM.md` — current 22-store seeds plus new Romanian/cross-border candidates found through adversarial discovery.
5. `ANALIZA_ROMANIA_POD_ECOSYSTEM_SPEC.md` — POD/AIO/Boro devices, consumables, compatibility and EHS.
6. `ANALIZA_ROMANIA_DATA_MODEL_SCORING_PIPELINE.md` — implementable data model, features, scores and pipeline contracts.
7. `ANALIZA_ROMANIA_MAXIMUM_OPERATING_PROCEDURES.md` — 96 operating procedures.
8. `ANALIZA_ROMANIA_CURRENT_TECHNICAL_AUDIT_2026-09-01.md` — current system assets/gaps and migration priorities.
9. `ANALIZA_ROMANIA_EXTERNAL_SOURCE_VALIDATION_2026-09-01.md` — validated current external-source semantics.
10. `ANALIZA_ROMANIA_ACCEPTANCE_BACKTEST_AND_CUTOVER.md` — QA, gold set, shadow run and cutover gates.
11. `CODEX_ANALIZA_ROMANIA_VNEXT_IMPLEMENTATION_BRIEF.md` — implementation sequence and constraints.

---

# Canonical closure statement

ANALIZA ROMÂNIA vNext is considered **maximally specified at architecture/SOP level** only when the combined specification covers:

- Romania-only commercial/demand scope;
- RTA, MOD, POD/AIO/BORO;
- product-specific RTA accessories;
- POD devices + replacement pods/cartridges/coils as separate linked entities;
- storefront vs operator separation;
- dynamically rediscovered Romanian retailer universe;
- current seed registry plus explicit candidate/quarantine registry;
- dated/expiring national-universe certification;
- Tier A explicit sales;
- Tier B commercial rankings;
- Tier C Romanian demand proxies;
- Tier D assortment/price/stock;
- Tier E structural context;
- semantics-aware ranking normalization;
- price/promo/bundle/pack normalization;
- stock state machine and continuity;
- same-store/cohort trend protection;
- canonical brand/product/family/variant identity;
- POD compatibility graph and Ecosystem Health Score;
- Romanian Google Ads/search-intent/community demand;
- optional official Google Trends API when available;
- price-comparison seller discovery;
- marketplace context separated from core storefront denominator;
- advertising/regulatory/structural context;
- HYPE → ANALIZA context bridge without truth leakage;
- CSS, DB, AH, DSR, MOM, PCP, DC, UC, EHS, OS and RS;
- explainable management recommendations;
- source policy/health;
- fake-zero/source-failure protections;
- coverage/blind-spot reporting;
- 96 SOPs;
- benchmark/backtest/shadow/cutover controls;
- compatibility migration preserving live ANALIZA.

---

# Precedence rule

If an older Market/Analysis code comment, workflow text, UI label, prior note or partial specification conflicts with this canonical package, **this index and the documents it enumerates govern vNext implementation**.

Existing working truth protections must be preserved unless the canonical package strengthens them.

---

# Change control

Any material future change to:

- definition of sales;
- ranking semantics;
- Romanian market universe;
- POD ecosystem;
- price/stock semantics;
- scoring;
- recommendation states;
- evidence source families;
- national completeness wording;

must:

1. update the relevant canonical document;
2. add/adjust a regression/acceptance fixture;
3. version the changed rule/formula;
4. document migration impact;
5. never weaken truth semantics merely to increase result count.

---

# Maximum-practical limitation

Public-source ANALIZA cannot honestly promise exact total Romanian unit/value sales if retailers do not expose comparable sales data.

Its maximum target is therefore:

> **the broadest measurable, auditable and continuously rediscovered Romanian vape-hardware market intelligence, with precise separation of observation, proxy, inference and fact.**

**End of canonical index.**
