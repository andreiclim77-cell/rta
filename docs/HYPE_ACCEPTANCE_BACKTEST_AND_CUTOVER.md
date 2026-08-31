# HYPE vNext — Acceptance, Backtest & Cutover Gates

**Status:** CANONICAL COMPANION SPEC — v1.0  
**Date:** 2026-09-01

No production cutover is allowed merely because vNext returns more products. This document defines the evidence that must exist before HYPE vNext can replace the current public projection.

---

# 1. Acceptance philosophy

HYPE is an intelligence system. The most dangerous regression is not an empty result; it is a confident false result.

Priority order:

1. factual precision;
2. traceability;
3. identity/date correctness;
4. source independence;
5. freshness;
6. recall;
7. speed/cost;
8. presentation density.

“No qualifying signal found” is an acceptable output when evidence is insufficient.

---

# 2. Pre-migration baseline

Before changing truth logic, record from current `main`:

- current commit SHA;
- HYPE workflow duration;
- generated snapshot timestamps;
- current RTA/MOD/accessory/POD event counts;
- current public-signal counts;
- current verification queues;
- source/config counts;
- known valid product examples;
- known false-positive/relisting examples;
- source failures;
- current UI screenshots at desktop/mobile widths;
- current data contract shape.

Save as `data/hype-benchmark/baseline-2026-09-01.json` or D1 fixture plus a human-readable report.

---

# 3. Gold-set dataset

Create at least 100 labeled retrospective cases before final cutover, growing toward 250+.

Required classes:

```text
TRUE_NEW_RELEASE
TRUE_MARKET_VERIFIED
TRUE_OFFICIAL_PREANNOUNCEMENT
TRUE_STRONG_PRELAUNCH
TRUE_CORROBORATED_RUMOR
TRUE_RUMOR_RESOLVED_FALSE
TRADEMARK_ONLY
DESIGN_ONLY
MANUAL_ONLY
OLD_RELISTING
RESTOCK
SECOND_BATCH
NEW_COLOR_VARIANT
NEW_REVISION
NEW_ACCESSORY_ONLY
REGIONAL_RELEASE
CLONE_RELEASE
STALE_ETA
CANCELLED
DATE_CONFLICT
IDENTITY_CONFLICT
SEARCH_SNIPPET_ONLY
COPIED_PRESS_RELEASE
SAME_CREATOR_CROSSPOST
```

Each case contains:

- expected product identity;
- expected novelty class;
- expected event timeline;
- expected H-stage;
- region;
- evidence fixtures or deterministic mocked observations;
- expected independent lineage count;
- acceptable date interval/precision;
- expected warnings/conflicts.

Do not build only easy positive examples. At least 40% of the initial gold set should be negative/ambiguous/adversarial cases.

---

# 4. Mandatory unit/fixture tests

## Truth/date

1. old product newly listed -> not H6;
2. old product page `dateModified=today` -> not H6;
3. retailer “new arrival” with no history -> signal only until gate passes;
4. past ETA with no new evidence -> stale/delayed;
5. first crawler observation -> never automatically exact release date;
6. official exact release claim -> valid release-date semantics;
7. vague “next month” -> interval, never exact day;
8. Q4 claim -> quarter interval;
9. timezone and Europe/Bucharest DST boundary correct.

## Identity

10. spelling aliases of one model -> merge;
11. V1 vs V2 -> separate revision/product as taxonomy dictates;
12. identical common word under two brands -> not merge;
13. authentic vs SXK/YFTK/etc. clone -> separate;
14. unnamed maker teaser -> unnamed candidate, no invented model name;
15. accessory with parent name -> accessory identity, not parent product release;
16. Boro bridge vs Boro host device -> separate category/entities.

## Lineage

17. one press release copied to 20 sites -> one primary lineage;
18. one reviewer cross-posts on YouTube/X/Instagram -> one creator origin;
19. unrelated reviewer independently shows own sample -> second origin;
20. two stores using identical distributor feed -> partial/shared lineage;
21. same leaked image re-uploaded -> pHash lineage relation.

## Lifecycle

22. rumor -> design -> sample -> official teaser -> release: preserve every event;
23. new evidence must not delete earlier rumor;
24. correction must supersede claim while preserving old claim;
25. cancellation resolves rumor false but retains history;
26. regional UK release then EU release -> distinct regional events;
27. clone release cannot move authentic lifecycle state.

## Source/policy

28. source requires unauthorized login -> collector refuses;
29. source kill switch on -> no requests;
30. parser drift -> degraded source, not “zero results”;
31. provider outage -> generic search coverage degrades while direct sources continue;
32. policy-state invalid -> source cannot contribute to truth gate.

## Freshness/publication

33. unchanged recrawl -> no material-change timestamp reset;
34. stale snapshot -> UI marks stale/degraded;
35. partial source failure -> publication can continue with lowered coverage if core integrity passes;
36. H6 item without release audit -> publication fails.

---

# 5. Release-classification targets

For the first production cutover:

- H6/H7 precision on retrospective gold set: **>=95%**;
- manually audited H6/H7 false-positive rate: **<2%**;
- product identity accuracy for H5-H7: **>=98%** on gold set;
- 100% H6/H7 items carry release audit object;
- 100% H4-H7 items expose traceable evidence IDs/source metadata;
- zero fixtures where search snippet alone promotes to H6;
- zero fixtures where stale ETA auto-promotes to H6;
- zero fixtures where a known relisting becomes a new release.

Do not set a fake “rumor precision” target until rumor outcomes have enough retrospective labels. Track it observationally and calibrate.

---

# 6. Recall and lead-time targets

Absolute internet rumor recall is unknowable. Use measurable proxies:

## Known-launch retrospective capture

For a curated set of launches from the previous 6–12 months:

- percent discovered before official release;
- percent discovered within 24h of first official public announcement;
- percent discovered within 24h of first market availability;
- category/region breakdown.

Initial target:

- >=90% capture of benchmarked significant launches in monitored source universe;
- median official-announcement discovery latency <=6h when source was healthy and directly monitored;
- direct sitemap/RSS/API detections should normally be faster than generic search discovery.

## Rumor lead time

For rumors later confirmed:

```text
lead_time_to_announcement = official_announcement_at - first_material_signal_at
lead_time_to_release      = release_at - first_material_signal_at
```

Report median and distribution; higher lead time is valuable only if false-positive rate remains controlled.

---

# 7. Source coverage acceptance

Before calling vNext “global”, publication must contain a coverage snapshot.

For each important category archetype, coverage matrix must include:

- manufacturer official;
- social/creator;
- specialist media;
- forum/community;
- retail/distribution;
- event/trade show;
- regulatory where applicable;
- IP;
- archive/history;
- infrastructure/OEM where applicable.

Minimum requirements:

1. no source family silently omitted from coverage accounting;
2. every source has health/freshness or explicit `unknown`;
3. private/unauthorized sources are explicitly not covered;
4. region/language gaps are disclosed;
5. “global” UI/metadata must not imply 100% internet coverage.

A numeric CC can be published only with scoring version and expected-source profile.

---

# 8. Source-health acceptance

On a 7-day observation period before cutover:

- >=95% of Tier-A direct endpoints should have successful health state or documented temporary outage;
- no recurring parser failure may masquerade as empty result;
- every degraded source appears in diagnostic/coverage output;
- retry storms/rate-limit loops absent;
- source policy kill switch tested;
- no secrets exposed in repository/static frontend.

---

# 9. Search-provider acceptance

Provider abstraction tests:

- provider A disabled -> pipeline still runs direct collectors;
- provider response malformed -> isolated failure;
- country/language parameters preserved;
- query plan persisted;
- per-query cost/budget persisted;
- duplicate search results deduped;
- snippet evidence remains lower-trust than resolved upstream source;
- legacy Bing RSS fallback, if temporarily retained, cannot be the only required search path.

---

# 10. Multilingual acceptance

For each Tier-A language pack create at least five positive and five negative fixtures.

Tier-A initially:

- EN
- RO
- DE
- FR
- IT
- ES
- PL
- zh-CN
- JA

Validate:

- signal phrase detection;
- product/model token preservation;
- date phrase parsing;
- category detection;
- no translation of brand/SKU/model names;
- original excerpt retained;
- normalized summary labels machine translation as normalization, not source text.

Add other languages as coverage moves from candidate to active.

---

# 11. Regulatory/IP semantic acceptance

Fixtures must prove that:

- EU/UK/NZ/FDA/IP records create artifact/regulatory claims with source-specific semantics;
- public registry publication date is not blindly treated as market release;
- Poland-style publication lag can be represented in source metadata;
- FDA pending application absence is not interpreted as product nonexistence;
- WIPO/EUIPO trademark/design record cannot alone promote to release;
- exact product-type scope is checked before linking regulatory record to hardware category.

---

# 12. Novelty acceptance

Against 730-day memory:

- relisting recall >=98% on labeled historical cases;
- known old SKU cannot be NEW_MODEL unless explicit revision evidence exists;
- product family/version logic produces deterministic result;
- archive first-seen evidence is auditable;
- missing history lowers NC rather than manufacturing certainty;
- batch and variant classes are visible separately.

---

# 13. UI acceptance

Desktop and mobile tests must validate:

- RELEASED / RADAR / RUMORS / WATCHLIST navigation;
- category filters;
- rumor labels are unmistakable;
- dates distinguish `observed`, `claimed/ETA`, `released`;
- score labels have explanations/tooltips/details;
- independent origins and raw evidence are not conflated;
- full timeline expands correctly;
- multiple evidence links available;
- contradictory claims visible;
- stale/degraded coverage visible;
- no inaccessible critical information only on hover;
- keyboard/accessibility basics retained;
- existing age gate/navigation/site shell not regressed.

Performance:

- compact list view must not fetch full raw evidence corpus;
- dossier details loaded on demand or in bounded compact form;
- mobile first render remains practical.

---

# 14. Compatibility acceptance

During shadow migration:

- old current JSON remains syntactically valid;
- legacy UI can render compatibility projection;
- current source links remain usable;
- no change to unrelated Market/Analiza/site sections;
- service worker/cache versioning prevents mixed old/new data schemas;
- rollback to previous projection is documented and tested.

---

# 15. Shadow-run comparison

Run old and vNext logic for at least 7 successful daily cycles before production cutover, ideally 14.

Compare daily:

```text
old events vs vNext H6/H7
old signals vs vNext H1-H5
products only in old
products only in vNext
identity differences
date differences
novelty differences
lineage differences
source failures
coverage
runtime/cost
```

Every H6/H7 difference gets a reason code:

```text
OLD_FALSE_POSITIVE_FIXED
VNEXT_MISSED_VALID_RELEASE
BETTER_DATE_SEMANTICS
REGIONAL_SPLIT
VARIANT/BATCH_RECLASSIFIED
NEW_SOURCE_DISCOVERY
IDENTITY_FIX
SOURCE_OUTAGE
UNKNOWN_REVIEW_REQUIRED
```

No cutover with unresolved material `VNEXT_MISSED_VALID_RELEASE` or vNext false-release cases.

---

# 16. Performance/cost gates

Initial engineering targets, adjustable after measured baseline:

- no single source may consume >20% of total scan wall time without explicit reason;
- host-level concurrency/rate limits respected;
- unchanged direct pages avoid full downstream reprocessing where possible;
- search budget reports cost per scan and evidence yield;
- manual refresh cannot trigger unbounded duplicate global work;
- queue/backlog diagnostics exposed;
- compact public snapshot remains reasonably sized; raw event store stays off the main static payload.

---

# 17. Security/compliance gates

Before cutover:

- no hardcoded API secrets;
- origin/CSRF assumptions reviewed for refresh endpoints;
- raw external excerpts sanitized before UI;
- URL scheme validation;
- source-policy table populated for active policy-sensitive platforms;
- no private-group scraping required;
- no anti-bot/authentication bypass logic;
- evidence retention policy documented;
- personal/community identifiers minimized;
- audit trail for manual overrides.

---

# 18. Cutover checklist

All boxes required unless explicitly waived with documented reason:

```text
[ ] baseline frozen
[ ] >=100 gold-set cases
[ ] truth fixture suite green
[ ] lineage fixture suite green
[ ] multilingual Tier-A green
[ ] H6/H7 precision >=95%
[ ] H6/H7 audited false-positive rate <2%
[ ] H5-H7 identity accuracy >=98%
[ ] release audit present for all H6/H7
[ ] 730-day novelty checks green
[ ] source policy/health active
[ ] coverage matrix published
[ ] 7–14 day shadow comparison reviewed
[ ] no unresolved material truth regression
[ ] UI mobile/desktop regression green
[ ] stale/degraded state verified
[ ] compatibility/rollback tested
[ ] secrets/security checks green
[ ] runtime/cost acceptable
[ ] main branch/deploy green
```

---

# 19. Post-cutover monitoring

First 30 days after cutover:

- daily H6/H7 manual spot audit;
- weekly source prior recalibration report;
- weekly false-positive/root-cause review;
- weekly missed-known-launch review;
- source drift report;
- cost/yield report;
- rumor outcome resolution report;
- coverage gap report.

Any severe false-release regression triggers fallback to compatibility projection while evidence remains preserved.

---

# 20. Final definition of cutover success

vNext is successful only if it is simultaneously:

- broader in source-family reach;
- earlier at detecting useful prelaunch signals;
- at least as precise as current HYPE for recent releases;
- more transparent about uncertainty;
- auditable at evidence level;
- resilient to source failures;
- honest about coverage gaps;
- compatible with the existing ghid-rta.ro experience during migration.

**End of canonical acceptance specification.**
