# HYPE vNext — Data Model, Scoring & Pipeline Specification

**Status:** CANONICAL COMPANION SPEC — v1.0  
**Date:** 2026-09-01

This document makes the HYPE Global Intelligence Blueprint directly implementable. It defines identifiers, schemas, event projections, scoring, lineage, collector contracts, data quality and publication behavior.

---

# 1. Architectural contract

HYPE vNext follows this direction only:

```text
SOURCE -> SCAN -> RAW OBSERVATION -> NORMALIZED EVIDENCE
      -> ENTITY RESOLUTION -> LINEAGE -> EVENT CLAIMS
      -> PRODUCT LIFECYCLE -> SCORES -> TRUTH GATES
      -> READ PROJECTIONS -> UI / ALERTS / OPTIONAL COMMERCIAL ENGINE
```

Evidence is immutable. Projections are disposable/rebuildable.

Current v1 JSON outputs remain supported through a compatibility projection during migration.

---

# 2. Identifier strategy

Use stable opaque identifiers. Never derive canonical identity solely from display name.

Recommended IDs:

```text
brand_id           br_<ulid>
entity_id          en_<ulid>
product_id         pr_<ulid>
variant_id         pv_<ulid>
source_id          so_<ulid>
endpoint_id        ep_<ulid>
scan_id            sc_<ulid>
evidence_id        ev_<ulid>
lineage_id         ln_<ulid>
event_id           et_<ulid>
claim_id           cl_<ulid>
score_run_id       sr_<ulid>
review_id          rv_<ulid>
```

For deterministic migration references, old canonical keys/hashes are preserved in `legacy_identifiers`.

---

# 3. Core tables / entities

## 3.1 `brands`

```text
brand_id PK
canonical_name
legal_entity_id nullable
country_hint nullable
activity_state
first_seen_at
last_activity_at
created_at
updated_at
```

## 3.2 `brand_aliases`

```text
brand_id
alias
alias_normalized
language nullable
source_evidence_id nullable
is_search_alias
is_display_alias
confidence
```

## 3.3 `entities`

Used for legal manufacturer, OEM, designer, distributor, reviewer, event organizer, etc.

```text
entity_id PK
entity_type
canonical_name
country nullable
public_url nullable
created_at
updated_at
```

## 3.4 `entity_relationships`

```text
relationship_id PK
from_entity_type
from_entity_id
to_entity_type
to_entity_id
relationship_type
confidence
valid_from nullable
valid_to nullable
supporting_evidence_id nullable
```

Examples: owns, markets, manufactures_for, designed_by, collaborates_with, distributes, reviewer_for, exhibited_at.

---

# 4. Product model

## 4.1 `products`

```text
product_id PK
brand_id nullable
canonical_name nullable
candidate_label
category
subcategory
family_id nullable
product_state
clone_state
authentic_product_id nullable
first_known_public_at nullable
first_confirmed_at nullable
official_release_at nullable
created_at
updated_at
```

`canonical_name` may be null for unnamed candidates. `candidate_label` can be human-readable such as `Unnamed SvoeMesto RTA candidate #2026-08-A`.

## 4.2 `product_aliases`

```text
product_id
alias
normalized_alias
source_evidence_id nullable
confidence
alias_type
```

Alias types: spelling, old_name, working_name, retailer_title, model_code, transliteration.

## 4.3 `product_variants`

```text
variant_id PK
product_id
variant_type
name
material nullable
color nullable
region nullable
revision nullable
sku nullable
gtin nullable
created_at
```

## 4.4 `product_identifiers`

```text
product_id
identifier_type
identifier_value
issuer/source
region nullable
confidence
supporting_evidence_id
```

Examples: SKU, EAN, UPC, GTIN, ECID/GBID, regulatory ID, trademark application, design registration, board profile ID.

## 4.5 `compatibility_edges`

```text
from_product_id
to_product_id
compatibility_type
scope
confidence
supporting_evidence_id
```

Used for accessory/RTA, pod/cartridge, Boro bridge/device, coil ecosystem.

---

# 5. Source registry

## 5.1 `sources`

```text
source_id PK
canonical_name
source_family
source_type
owner_entity_id nullable
status
truth_role
source_prior
regions_json
languages_json
categories_json
created_at
updated_at
```

## 5.2 `source_endpoints`

```text
endpoint_id PK
source_id
endpoint_type
url_or_platform_id
adapter
cadence_minutes
priority
requires_secret
active
last_success_at
last_change_at
etag nullable
last_modified nullable
content_hash nullable
cursor nullable
```

Endpoint types: sitemap, RSS, webpage, product-index, manual-index, API, platform-account, search-query, registry-download, IP-query, event-directory, newsletter.

## 5.3 `source_policies`

```text
source_id
policy_version
checked_at
public_or_authorized
robots_state
terms_state
commercial_use_state
retention_rule
personal_data_rule
rate_limit_rule
kill_switch_state
notes
```

## 5.4 `source_health`

Daily/rolling snapshot:

```text
source_id
period_start
success_rate
parser_success_rate
mean_latency_ms
yield_count
duplicate_ratio
false_positive_count
consecutive_failures
drift_state
freshness_hours
health_state
```

---

# 6. Scan and query model

## 6.1 `scan_runs`

```text
scan_id PK
scan_type
started_at
completed_at
trigger
reference_at
status
source_plan_version
query_plan_version
collector_version
cost_estimate
error_summary
```

Triggers: scheduled, manual_priority, source_change, event_boost, backfill, QA_replay.

## 6.2 `scan_tasks`

```text
task_id PK
scan_id
endpoint_id
priority
status
attempt
scheduled_at
started_at
completed_at
http_status nullable
bytes_read nullable
error_class nullable
```

## 6.3 `queries`

```text
query_id PK
scan_id
provider
query_text
country
language
freshness
query_family
cost_units
result_count
```

Every generated search query is auditable.

---

# 7. Evidence model

## 7.1 `evidence`

```text
evidence_id PK
source_id
endpoint_id nullable
scan_id
url_or_external_id
canonical_url nullable
evidence_type
observed_at
source_published_at nullable
retrieved_at
content_hash
raw_artifact_ref nullable
text_excerpt nullable
original_language nullable
normalized_summary nullable
truth_eligibility
is_discovery_only
policy_version
parser_version
created_at
```

Evidence types include:

```text
WEB_PAGE
SOCIAL_POST
VIDEO_METADATA
FORUM_POST
REDDIT_POST
NEWS_ARTICLE
NEWSLETTER
RETAIL_LISTING
DISTRIBUTOR_LISTING
REGULATORY_RECORD
TRADEMARK_RECORD
DESIGN_RECORD
MANUAL
FIRMWARE_NOTE
SITEMAP_ENTRY
SEARCH_RESULT
SEARCH_SNIPPET
DOMAIN_RECORD
CERTIFICATE_RECORD
COMMON_CRAWL_RECORD
EVENT_EXHIBITOR_ENTRY
EVENT_NEWS
SHIPMENT_RECORD
IMAGE
```

## 7.2 `evidence_features`

Structured extractor outputs:

```text
evidence_id
feature_type
feature_value
confidence
extractor_version
```

Feature examples: product-name, brand, SKU, date phrase, event phrase, availability state, stage phrase, collaborator, model code, image hash.

---

# 8. Media fingerprints

```text
media_id PK
evidence_id
media_type
sha256
phash nullable
dhash nullable
width nullable
height nullable
duration nullable
perceptual_cluster_id nullable
```

Only store media bytes when policy permits and retention is necessary. Otherwise store hashes/metadata and source links.

---

# 9. Evidence lineage

## 9.1 `evidence_lineage`

```text
evidence_id
lineage_id
lineage_role
lineage_confidence
parent_evidence_id nullable
method
```

Roles:

- ORIGIN
- DIRECT_REPOST
- SYNDICATED_COPY
- DERIVATIVE_REPORT
- QUOTE
- MIRROR
- UNKNOWN_RELATION

## 9.2 Clustering features

Use layered rules:

1. canonical URL redirect identity;
2. explicit canonical/source link;
3. same author/account cross-post;
4. exact text hash;
5. SimHash/MinHash similarity;
6. title + paragraph similarity;
7. identical image hash/pHash;
8. same video/media asset;
9. matching press-release boilerplate;
10. shared affiliate/product feed.

For a product/event corroboration score, count origin clusters rather than pages.

---

# 10. Event claims

## 10.1 `event_claims`

A claim is what one or more evidence items assert.

```text
claim_id PK
product_id nullable
candidate_entity_id nullable
event_type
region nullable
claimed_event_at nullable
expected_start_at nullable
expected_end_at nullable
claim_text_normalized
identity_confidence
date_confidence
claim_state
created_at
```

Claim states: active, contradicted, superseded, stale, resolved_true, resolved_false.

## 10.2 `event_evidence`

```text
claim_id
evidence_id
relation
weight_role
```

Relation: supports, contradicts, contextualizes, establishes_prior_existence, establishes_identity.

## 10.3 `events`

An event is the system's current resolved lifecycle projection from claims.

```text
event_id PK
product_id
event_type
region nullable
resolved_at nullable
expected_start_at nullable
expected_end_at nullable
event_state
confidence
projection_version
created_at
updated_at
```

Do not delete superseded event claims. Rebuild events from claims if logic changes.

---

# 11. Event classification rules

## RUMOR
No concrete artifact required. Exact product may be unknown. Must be in scope and plausibly linked to a maker/category.

## LEAK
Includes non-official image/document/product detail claimed to precede announcement. Still not proof of release.

## TRADEMARK_FILED / DESIGN_FILED
Requires official/public IP record. High artifact authenticity, variable product identity and launch implication.

## DOMAIN/CERTIFICATE_SIGNAL
Requires public infrastructure record tied to known maker/product token. Never above H3 by itself.

## MANUAL/FIRMWARE_DISCOVERED
Official support artifact with exact model identity can reach H3/H4 depending corroboration.

## TEASER/PROTOTYPE/SAMPLE
Official vs non-official source is preserved. Sample received by a known reviewer is stronger than third-party rumor of a sample.

## PREORDER
Distinguish official maker preorder from retailer placeholder.

## FIRST_RETAIL_OBSERVATION
Means first observation by HYPE, not exact market launch date.

## OFFICIAL_RELEASE
Requires explicit official release/availability or equivalent truth gate.

---

# 12. Date handling

Date fields have provenance and type.

```text
date_value
date_kind = PUBLISHED | CLAIMED_EVENT | ETA_START | ETA_END | OBSERVED | FIRST_SEEN | RELEASE
timezone
precision = EXACT_TIME | DAY | MONTH | QUARTER | RANGE | RELATIVE
source_phrase
confidence
```

Relative phrases (`next week`, `Q4`, `this fall`, `soon`) must be normalized into intervals with explicit precision and interpretation version.

Never silently convert a fuzzy interval into an exact date.

---

# 13. Product identity resolution

## 13.1 Candidate generation

Generate candidate matches using:

- brand alias match;
- model token overlap;
- exact identifier;
- family token;
- collaboration/designer;
- specs/dimensions;
- image similarity;
- compatibility claims;
- source context;
- prior candidate relationships.

## 13.2 Match score

Indicative model:

```text
ID_MATCH =
  0.35 exact_identifier
+ 0.20 brand_match
+ 0.18 model_token_match
+ 0.08 family_match
+ 0.07 image_similarity
+ 0.05 spec_similarity
+ 0.04 source_context
+ 0.03 collaborator_match
```

Hard exact identifiers can override lower lexical similarity.

Suggested actions:

- `>=0.92` auto-link if no conflict;
- `0.75–0.919` link only with secondary supporting feature or queue for review;
- `<0.75` retain separate candidate.

Thresholds are benchmarked/versioned.

## 13.3 Merge safeguards

Never auto-merge when:

- two explicit different version numbers;
- conflicting manufacturer;
- different product category;
- substantial dimension/platform mismatch;
- authentic vs clone identity;
- regional branding conflict unresolved.

Manual merge/split decisions create durable resolution rules and audit history.

---

# 14. Novelty engine

Novelty uses a 730-day memory and yields:

```text
NEW_MODEL
NEW_REVISION
NEW_VARIANT
NEW_ACCESSORY
NEW_REGION
BATCH
RESTOCK
RELISTING
UNKNOWN
```

Inputs:

- prior product identity timeline;
- historical HYPE dossiers;
- `market-product-presence` history;
- source sitemap/catalog history;
- Common Crawl/archive evidence;
- known SKU/model code;
- image/spec similarity;
- explicit maker revision terms;
- first-known date.

Novelty score `NC` must be low if historical evidence predates the active release window.

---

# 15. Scoring model

Every score is 0–100 and versioned.

## 15.1 Evidence Confidence — EC

Evidence-level dimensions normalized 0–1:

- `S` source reliability
- `D` directness
- `A` artifact strength
- `T` temporal precision
- `I` identity certainty
- `F` freshness
- `P` provenance integrity

```text
EC_base = 100 * (0.24S + 0.18D + 0.16A + 0.12T + 0.14I + 0.08F + 0.08P)
EC = clamp(EC_base - conflictPenalty - derivativePenalty - marketingPenalty, 0, 100)
```

## 15.2 Identity Confidence — IC

Driven by exact identifiers, brand/model tokens, direct source context, media/spec correspondence and resolution conflicts.

Suggested interpretation:

- 95–100 exact identity;
- 80–94 highly likely;
- 60–79 plausible candidate;
- <60 unresolved/unnamed.

## 15.3 Date Confidence — DC

Example ranking:

- explicit official timestamp/date + context: 95+
- explicit source claim “ships Sep 15”: 85–95 for the claim, not fulfillment;
- retailer publication date with stable historical behavior: 70–85;
- event month/quarter: 55–75;
- search snippet date: 30–50;
- crawler first-seen: high confidence as first-seen, very low confidence as release date.

`DC` must refer to a named date interpretation, e.g. `DC_release`, `DC_eta`, or UI explains what is being scored.

## 15.4 Launch Probability — LP

A separate event forecast model.

Example features:

- official preannouncement;
- review sample in hand;
- mass-production/shipping artifact;
- distributor preorder across independent origins;
- regulatory/IP artifact;
- manufacturer historical conversion rate from teaser to release;
- expected date proximity;
- cancellation/delay signals;
- contradictions;
- candidate age/staleness.

Illustrative logistic formulation:

```text
z = intercept
  + w1 official_preannouncement
  + w2 review_sample
  + w3 production_signal
  + w4 distributor_independence
  + w5 artifact_signal
  + w6 maker_historical_conversion
  + w7 proximity
  - w8 contradiction
  - w9 staleness
  - w10 cancellation_signal

LP = sigmoid(z) * 100
```

Do not pretend initial weights are scientifically calibrated. Start rule-based, log outcomes, then calibrate with retrospective cases.

## 15.5 Novelty Confidence — NC

High when no prior history exists and product/revision identity is new. Strong penalty for prior appearance, identical old SKU/spec/image and explicit batch/restock language.

## 15.6 Hype Momentum — HM

Use attention, not truth:

```text
HM = weighted velocity of independent-origin mentions
   + source-family spread
   + creator/reviewer emergence
   + watchlist/waitlist public signals
   + region spread
```

Cap derivative/repost contribution aggressively.

## 15.7 Coverage Confidence — CC

Product-level coverage:

```text
CC = weighted coverage of expected relevant source families
     × freshness factor
     × regional/language factor
```

A niche Japanese RTA and a mass-market Chinese pod require different expected source universes.

---

# 16. H-stage projection

Suggested deterministic initial mapping:

```text
H0 NOISE:
  IC < 35 OR out of scope

H1 RUMOR:
  plausible in-scope claim; EC < 50; no strong artifact

H2 CORROBORATED_RUMOR:
  >=2 independent origins OR EC >=50, but no strong artifact/official preannouncement

H3 ARTIFACT_SIGNAL:
  official IP/regulatory/manual/firmware/domain artifact tied to candidate

H4 STRONG_PRELAUNCH:
  EC >=70 and IC >=75 and >=2 independent source families/origins
  OR direct sample/prototype + corroboration

H5 OFFICIAL_PREANNOUNCEMENT:
  maker official teaser/announcement/preorder with IC >=85

H6 RELEASED:
  release truth gate A/B/C/D passes AND NC appropriate

H7 MARKET_VERIFIED:
  H6 + independent market availability/shipping confirmation
```

Do not use LP alone to promote to H6.

---

# 17. Source independence aggregation

For a candidate event:

```text
origin_weight(lineage) = max(evidence EC within lineage) / 100
family_diversity_bonus = bounded bonus across manufacturer / creator / media / community / retail / regulatory-IP
```

Example:

- official teaser + 10 copied news sites = 1 official origin + 1 derivative news cluster, not 11;
- same reviewer cross-posting YouTube/Instagram/X = 1 creator origin;
- two unrelated retailers fed by same distributor description may be partially dependent; lineage can link through identical feed/SKU copy.

Store `independent_origin_count` and `raw_evidence_count` separately.

---

# 18. Conflict engine

Conflict types:

- product identity conflict;
- event date conflict;
- region conflict;
- stage conflict;
- availability conflict;
- maker denial;
- cancellation/delay;
- authentic/clone confusion.

Conflict behavior:

1. retain all claims;
2. calculate conflict penalty;
3. choose provisional working projection only when justified;
4. expose conflict to UI for H3+ material cases;
5. score resolution when new evidence arrives.

A maker correction/denial is itself immutable evidence and can transition a rumor to `RESOLVED_FALSE` without deleting history.

---

# 19. Collector contract

Every collector returns a common envelope:

```json
{
  "collector": "manufacturer-sitemap-v1",
  "sourceId": "so_...",
  "endpointId": "ep_...",
  "scanId": "sc_...",
  "startedAt": "ISO",
  "completedAt": "ISO",
  "status": "ok|partial|failed|policy_blocked|unchanged",
  "observations": [],
  "cursor": null,
  "health": {},
  "errors": []
}
```

Observation minimum:

```json
{
  "externalId": "...",
  "url": "...",
  "observedAt": "ISO",
  "sourcePublishedAt": null,
  "contentType": "...",
  "contentHash": "...",
  "title": "...",
  "excerpt": "...",
  "language": "...",
  "structured": {},
  "media": []
}
```

Collector may not assign H6 directly. It creates evidence/features; truth projection happens centrally.

---

# 20. Collector families

Implement adapters rather than one giant script:

```text
manufacturer_sitemap
manufacturer_news
manufacturer_catalog
manufacturer_support
manufacturer_firmware
social_youtube
social_x
social_public_generic
forum
reddit
specialist_news
retailer_catalog
retailer_state
clone_retailer
regulatory_dataset
ip_registry
trade_event
search_web
search_news
common_crawl
rdap
certificate_transparency
newsletter
manual_document
b2b_discovery
shipment_optional
```

Each adapter declares:

- policy requirements;
- rate limits;
- supported evidence types;
- default truth role;
- parser version;
- source-health contract.

---

# 21. Search Query Factory contract

Input:

```json
{
  "brand": {"name":"...","aliases":[]},
  "categories":["RTA"],
  "languages":["en","de"],
  "regions":["EU"],
  "signalConcepts":["rumor","prototype","preorder"],
  "sourceFamilies":["web","forum","news"],
  "budget": 30
}
```

Output:

- deduplicated query set;
- provider constraints;
- priority;
- cost estimate;
- reason query exists;
- result cursor state.

No global `slice(0,150)`. Budgeting must be explicit/adaptive.

---

# 22. Search provider fallback logic

```text
DIRECT SOURCE FOUND? -> use direct, generic search not required
ELSE provider A -> provider B optional -> low-confidence legacy/search-snippet fallback
```

Provider outage must degrade search coverage but not crash direct-source collectors.

Every search result stores provider and query ID for reproducibility.

---

# 23. Publication projections

Recommended compact static/API projections:

## `hype-released-vnext.json`

Only H6/H7 events inside recent release window.

## `hype-radar-vnext.json`

Candidates with material evidence change inside signal window, H1–H5 plus delayed/conflicted.

## `hype-watch-vnext.json`

Material changes since previous published snapshot.

## `hype-coverage-vnext.json`

Source-family/region/language/category health and CC.

## `hype-dossier/<product_id>.json` or API route

Full product timeline, scores, evidence metadata, contradictions and source links.

Compatibility builder may continue emitting:

- `market-hype-products-2026.json`
- `market-hype-pods-2026.json`
- `market-hype-radar-2026.json`

until old UI is retired.

---

# 24. Material-change detection

A dossier enters the 30-day RADAR when one of these changes occurs:

- new independent origin;
- new evidence family;
- H-stage transition;
- LP changes by configured threshold, e.g. >=10 points;
- identity resolved/renamed;
- ETA interval materially changes;
- official teaser/announcement;
- sample/prototype appears;
- preorder/stock transition;
- new IP/regulatory/manual/firmware artifact;
- delay/cancellation/denial;
- regional release;
- source conflict resolved.

Routine reposts and unchanged recrawls do not reset the RADAR clock.

---

# 25. Alert engine

Alert conditions are deterministic and deduplicated:

```text
NEW_CANDIDATE
NEW_RUMOR
CORROBORATED_RUMOR
STRONG_PRELAUNCH
OFFICIAL_PREANNOUNCEMENT
RELEASE_CONFIRMED
MARKET_VERIFIED
ETA_CHANGED
DELAYED
CANCELLED
NEW_INDEPENDENT_ORIGIN
NEW_ARTIFACT
WATCHLIST_CHANGE
SOURCE_COVERAGE_GAP
```

Alert payload includes: product, previous state, new state, cause evidence IDs, timestamp, confidence change.

---

# 26. Manual review model

Manual review is for ambiguity, not routine ingestion.

Queue reasons:

- candidate identity conflict;
- high-impact H4/H5 with low IC;
- H6 gate near threshold;
- authentic/clone ambiguity;
- suspicious source lineage;
- conflicting exact release dates;
- source-policy uncertainty;
- repeated parser false positive.

Manual action types:

- confirm link;
- split product;
- mark derivative;
- classify source;
- reject false positive;
- correct region/date semantics;
- override source state;
- suppress known pattern.

Every manual action stores user/reason/time and may be replayed as a canonical rule.

---

# 27. Source prior calibration

Do not keep arbitrary priors forever.

After a defined retrospective window compute per source/source-type:

- percentage of prelaunch claims later confirmed;
- median lead time;
- identity accuracy;
- date accuracy;
- duplicate/derivative rate;
- false-positive contribution.

Use conservative Bayesian/shrinkage-style updates so a source with 2 successes does not outrank a long-proven source wildly.

Store calibration version and sample size.

---

# 28. Retrospective benchmark dataset

Create `data/hype-benchmark/` or D1 equivalent with labeled cases:

```text
TRUE_NEW_RELEASE
TRUE_PRELAUNCH
TRUE_RUMOR_RESOLVED_TRUE
RUMOR_RESOLVED_FALSE
OLD_RELISTING
RESTOCK
BATCH
VARIANT
ACCESSORY_ONLY
CLONE_ONLY
REGIONAL_RELEASE
DATE_CONFLICT
IDENTITY_CONFLICT
```

Each benchmark case includes source evidence and expected final state.

Run in CI whenever truth/scoring/entity logic changes.

---

# 29. Data quality gates

Before publication require:

- required IDs and timestamps;
- source policy valid/not killed;
- canonical URL/identifier where available;
- product category valid;
- source/evidence referential integrity;
- no orphan event evidence;
- no impossible date order without explicit conflict;
- H6/H7 have release gate audit result;
- displayed independent origins match lineage clusters;
- score version attached;
- source freshness/coverage snapshot generated;
- stale snapshot flag correct.

Publication may proceed with partial source failure if CC and degraded state are disclosed.

---

# 30. H6 audit object

Every RELEASED item should carry an internal audit object:

```json
{
  "releaseGate": "A|B|C|D",
  "passedAt": "ISO",
  "projectionVersion": "...",
  "supportingEvidenceIds": ["ev_..."],
  "independentLineageIds": ["ln_..."],
  "noveltyClass": "NEW_MODEL",
  "noveltyConfidence": 96,
  "priorExistenceCheckedThrough": "ISO",
  "region": "EU",
  "releaseDateSemantics": "official_claim|observed_market|range",
  "warnings": []
}
```

This allows an auditor/developer to explain exactly why the product is shown as released.

---

# 31. Coverage Confidence implementation

Build expected-source profile per product archetype.

Example high-end European RTA:

```text
manufacturer official         weight 0.25
maker social                   0.15
high-end retailers             0.15
reviewers                      0.10
forums/community               0.10
specialist media               0.05
trade events                   0.05
IP                             0.05
regulatory                     0.05
archive/history                0.05
```

Mass-market Chinese pod weights differ and emphasize maker/export, global retail, social/video, regulatory and OEM.

For each family:

```text
family_coverage = active_expected_sources / expected_sources
freshness_factor = decay(last_success)
family_score = family_coverage * freshness_factor
CC = weighted sum * 100
```

Show `NOT_APPLICABLE` rather than penalizing a product for a source family irrelevant to it.

---

# 32. Orchestration failure modes

Classify failures:

- NETWORK_TRANSIENT
- RATE_LIMIT
- AUTH_REQUIRED
- POLICY_BLOCKED
- ROBOTS_BLOCKED
- PARSER_DRIFT
- SOURCE_GONE
- DOMAIN_CHANGED
- CONTENT_TOO_LARGE
- INVALID_CONTENT
- PROVIDER_OUTAGE
- INTERNAL_ERROR

Retry only retryable classes. Parser/policy errors should not generate expensive repeated retries.

---

# 33. Cache and freshness rules

Recommended:

- direct source unchanged via ETag/hash: no evidence duplication;
- source fetched successfully but unchanged: update health only;
- repeated same content from same URL: no new material-change timestamp;
- search result already known: update observation metadata, not duplicate evidence unless snippet materially changes;
- publication snapshot freshness target: <=6h preferred for HYPE, not merely <=26h when infrastructure supports it;
- UI always displays last successful intelligence snapshot time and degraded coverage if applicable.

---

# 34. Security boundaries

- secrets only in GitHub/Cloudflare secret stores;
- no API tokens in frontend/static files;
- refresh endpoint is rate-limited and origin-restricted;
- queued scans have bounded cost/budget;
- user-supplied URLs if ever supported require SSRF protection;
- parser never executes arbitrary remote JavaScript in privileged environment unless a separately isolated browser worker is intentionally introduced;
- raw HTML is untrusted input;
- sanitize all UI evidence excerpts;
- block `javascript:`/unsafe link schemes;
- audit manual review actions.

---

# 35. Migration mapping from existing files

| Existing | vNext role |
|---|---|
| `data/market-hype-sources-2026.json` | seed import into Source Registry + truth lexicons |
| `data/market-hype-active-makers-extra-2026.json` | brand/source seed import |
| `data/market-pod-universe-2026.json` | brand/family/category seed import |
| `data/market-hype-evidence-2026.json` | initial evidence backfill |
| `data/market-hype-known-history-2026.json` | prior-existence/novelty backfill |
| `data/market-hype-retail-memory-2026.json` | retailer first-seen history |
| `data/market-hype-products-2026.json` | compatibility projection target + backfill input |
| `data/market-hype-pods-2026.json` | compatibility projection target + backfill input |
| `data/market-hype-radar-2026.json` | old projection, later replaced |
| `tools/consolidate-market-hype-2026.js` | refactor into non-destructive projection builder |
| `tools/collect-market-hype-radar-2026.js` | split into Query Factory + adapters |
| `assets/market-hype-ui.js` | preserve shell; progressively read vNext projections/dossiers |
| Cloudflare refresh worker | refactor from global workflow dispatch to queued incremental scan |

---

# 36. Compatibility strategy

For each vNext product dossier, compatibility builder creates a legacy-like product record while preserving warnings:

```text
productName
brand
category
typology
eventDate / stageEvidenceAt
confidenceTier
sourceCount = raw evidence count (legacy only)
eligibleSources = legacy approximation
sources[]
window
stage
```

But new UI uses:

```text
hypeStage
independentOriginCount
scores{}
timeline[]
releaseAudit{}
coverage{}
```

No old reader is broken until cutover.

---

# 37. Implementation priority

If resources are limited, implement in this exact order because it maximizes correctness before source volume:

1. event/evidence schema + compatibility projection;
2. lineage/origin dedupe;
3. split signal/release windows;
4. source registry/policy/health;
5. Query Factory/provider abstraction;
6. manufacturer sitemap/support/manual diff;
7. regulatory/IP collectors;
8. event/trade show collector;
9. expanded social/community/retail/OEM source families;
10. scoring/coverage;
11. D1/Queues scale migration;
12. full dossier UI.

Adding thousands of sources before lineage/truth architecture would amplify false positives, not intelligence quality.

---

# 38. Definition of done for data architecture

The architecture is complete when:

- a product can carry a 12-month rumor-to-release timeline without losing prior events;
- score recalculation does not mutate evidence;
- every H6 item has a machine-readable release audit;
- copied sources collapse into lineage;
- source failures alter coverage, not truth history;
- exact date vs first-seen vs ETA are distinct;
- authentic/clone/variant/batch relationships survive projection;
- old UI still works from compatibility output during migration;
- all schemas are versioned and covered by CI fixtures.

**End of canonical data model specification.**
