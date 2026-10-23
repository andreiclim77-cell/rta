# ANALIZA ROMÂNIA vNext — Data Model, Scoring & Pipeline Specification

**Status:** CANONICAL COMPANION SPEC — v1.0  
**Date:** 2026-09-01

---

# 0. Architectural contract

```text
SOURCE REGISTRY
 -> SCAN PLAN
 -> RAW OBSERVATIONS
 -> NORMALIZED EVIDENCE
 -> RETAILER/OPERATOR RESOLUTION
 -> PRODUCT/PLATFORM RESOLUTION
 -> OFFER / RANKING / SALES / DEMAND EVENTS
 -> HISTORICAL FEATURE STORE
 -> COVERAGE MODEL
 -> SCORES
 -> MANAGEMENT RECOMMENDATIONS
 -> READ PROJECTIONS
 -> UI / REPORT / ALERTS
```

Evidence comes before scores. Scores come before recommendations. A recommendation never mutates the underlying evidence.

---

# 1. Stable IDs

Use deterministic or persistent IDs for:

```text
retailer_id
operator_id
source_id
product_id
product_family_id
variant_id
brand_id
pod_platform_id
consumable_family_id
compatibility_edge_id
offer_id
ranking_source_id
observation_id
scan_run_id
score_run_id
recommendation_id
```

Do not key canonical identity only by current title text.

---

# 2. Retailer schema

```text
retailer_id
canonical_name
domain
country
market_scope = RO_LOCAL | CROSS_BORDER_TO_RO
status
operator_id
public_legal_name?
public_vat_id?
physical_locations_count?
category_capabilities[]
collector_adapter
first_seen_at
last_verified_at
source_health_state
```

---

# 3. Operator schema

```text
operator_id
canonical_business_name
public_business_identifiers[]
storefront_ids[]
first_verified_at
last_verified_at
provenance[]
```

Operator identity exists to prevent double counting and measure concentration, not to publish unnecessary business-person data.

---

# 4. Source endpoint schema

```text
source_id
retailer_id?
source_family
url
semantic_role
category_scope[]
access_method
policy_state
health_state
cadence
parser_version
ranking_semantics?
first_seen_at
last_success_at
last_change_at
```

---

# 5. Product schema

```text
product_id
brand_id
product_family_id
canonical_name
category
subtype
model
revision?
authentic_clone_state
status
identifiers[]
first_known_at
last_seen_at
identity_confidence
```

---

# 6. Variant schema

Variant dimensions can include:

- color/finish;
- material;
- resistance;
- capacity;
- pack quantity;
- region;
- edition;
- battery configuration.

Variant must not create a new product unless the product semantics justify it.

---

# 7. POD platform schema

```text
pod_platform_id
brand_id
canonical_name
platform_type
open_closed_state
active_generation?
first_known_at
last_verified_at
```

Compatibility is represented by edges, not string arrays embedded only in product rows.

---

# 8. Consumable entity schema

```text
consumable_id
family_id
brand_id
entity_type = REPLACEMENT_POD | CARTRIDGE | COIL | PREFILLED_POD
canonical_name
pack_quantity
resistance?
capacity?
variant_attributes
```

---

# 9. Compatibility edge schema

```text
edge_id
from_entity_id
to_entity_id
relationship_type
compatibility_scope
source_id
source_url
confidence
first_verified_at
last_verified_at
status
```

---

# 10. Offer observation schema — Tier D

One retailer × product/variant observation:

```text
observation_id
scan_run_id
retailer_id
operator_id
product_id
variant_id?
source_id
source_url
observed_at
listed_state
availability_state
regular_price_ron?
promo_price_ron?
current_price_ron?
currency
vat_state?
pack_quantity?
raw_title
raw_price_text?
evidence_hash
parser_version
observation_confidence
```

---

# 11. Ranking source schema

```text
ranking_source_id
retailer_id
source_url
ranking_type
scope_type
scope_value
semantic_definition
visible_depth
ascending_or_descending
confidence
validated_at
parser_version
```

A ranking source cannot be Tier B until semantics are validated.

---

# 12. Ranking observation schema — Tier B

```text
observation_id
ranking_source_id
product_id
rank
visible_depth
normalized_percentile
observed_at
source_hash
```

Recommended normalized rank strength:

```text
normalized_percentile = 100 * (visible_depth - rank + 1) / visible_depth
```

Alternative transforms may be calibrated; all keep raw rank.

---

# 13. Sales-counter observation — Tier A

```text
observation_id
retailer_id
product_id
counter_value
counter_type
observed_at
source_url
counter_semantics
confidence
```

Period units are derived only from valid non-negative deltas across comparable cumulative observations.

Counter reset/decrease triggers review, not negative sales.

---

# 14. Behavioral-demand observation — Tier C

Types:

```text
GOOGLE_ADS_SEARCH_VOLUME
GOOGLE_TRENDS_INTEREST
GUIDE_SEARCH_INTENT
GUIDE_ENTITY_OPEN
ROMANIAN_COMMUNITY_MENTION
ROMANIAN_VIDEO_MENTION
PRODUCT_REVIEW_COUNT
PRODUCT_VIEW_COUNT
WISHLIST_COUNT
MARKETPLACE_PRESENCE
AD_PROMOTION_SIGNAL
```

Every observation stores geographic relevance and source semantics.

---

# 15. Price observation normalization

Derived fields:

```text
price_per_unit
price_per_pod
price_per_coil
price_per_pack
is_promo
is_bundle
bundle_components
comparable_group_id
```

Only same `comparable_group_id` offers enter median/dispersion metrics.

---

# 16. Availability history

Build transitions from successfully observed snapshots only.

Do not create state transitions on source outage days.

Derived:

```text
stock_continuity_7d
stock_continuity_30d
stock_continuity_90d
out_of_stock_streak
in_stock_streak
first_in_stock_at
last_in_stock_at
```

---

# 17. Coverage snapshot schema

Daily coverage by evidence family/category:

```text
coverage_snapshot_id
date
registered_storefronts
active_storefronts
reachable_storefronts
successful_storefronts
ranking_storefronts
tierA_storefronts
price_storefronts
stock_storefronts
category_coverage{RTA,MOD,POD_DEVICE,POD_CONSUMABLE,AIO_BORO,ACCESSORY}
source_failures[]
unresolved_retailer_candidates
universe_certification_state
universe_confidence
```

---

# 18. Comparable cohort model

For any temporal metric store:

```text
current_cohort_ids[]
baseline_cohort_ids[]
intersection_cohort_ids[]
cohort_overlap_pct
cohort_stable
```

Default trend should use intersection/same-store cohort when material source-set change exists.

---

# 19. Commercial Signal Strength — CSS

CSS should combine only semantically commercial evidence.

Suggested structure:

```text
ranking_component = weighted normalized ranking strength across independent operators
sales_component   = normalized Tier-A deltas where available
persistence       = rank/sales persistence
operator_diversity = independent operator breadth
```

Example initial formula when both A and B exist:

```text
CSS = 0.35*ranking_strength
    + 0.25*ranking_persistence
    + 0.20*tierA_strength
    + 0.20*operator_diversity
```

When Tier A is missing, redistribute weights and mark `tierA_missing=true`. Do not fabricate zeros as measured sales.

---

# 20. Distribution Breadth — DB

Separate metrics:

```text
storefront_breadth_pct
operator_breadth_pct
in_stock_breadth_pct
complete_ecosystem_breadth_pct
```

Suggested DB uses operator-aware and storefront-aware components without calling either market share.

---

# 21. Availability Health — AH

Possible initial formula:

```text
AH = 0.45*in_stock_breadth_normalized
   + 0.35*stock_continuity_30d
   + 0.20*stock_continuity_90d
```

Coverage-adjust score or lower confidence if stock extraction is incomplete.

---

# 22. Demand Strength Romania — DSR

Possible source components:

- Google Ads Romania search volume;
- Google Trends Romania interest/momentum;
- first-party guide intent;
- Romanian community signals;
- Romania-relevant video/social.

Example normalized formula when all available:

```text
DSR = 0.40*google_ads
    + 0.20*google_trends
    + 0.20*guide_intent
    + 0.12*community
    + 0.08*romanian_video_social
```

Weights redistribute across available eligible sources. Global-only YouTube does not enter DSR; it remains context.

---

# 23. Momentum — MOM

Do not calculate one momentum from one metric.

Track:

- `commercial_momentum`;
- `breadth_momentum`;
- `availability_momentum`;
- `demand_momentum`;
- `price_momentum`;
- `ecosystem_momentum`.

Composite MOM can be shown only when underlying trend confidence is adequate.

---

# 24. Price Context Position — PCP

PCP is contextual, not a “good/bad product” score.

Possible features:

- price percentile within same product across stores;
- price vs own 30/90d median;
- promo intensity;
- dispersion;
- consumable running-cost context for POD.

---

# 25. Data Confidence — DC

Suggested components:

```text
source_coverage
source_health
category_coverage
history_depth
cohort_stability
entity_identity_confidence
ranking_semantics_confidence
operator_diversity
price_stock_extraction_coverage
```

Large source failure penalties are mandatory.

---

# 26. Universe Coverage Confidence — UC

UC is not the same as DC.

UC asks: **How confident are we that the Romanian local-storefront universe itself is sufficiently discovered right now?**

Inputs:

- discovery routes working;
- last certification date;
- unresolved candidates;
- new candidates since last audit;
- price-comparison/dealer-locator reconciliation;
- historical registry reconciliation;
- city/region spot audit;
- category-specific discovery completeness.

---

# 27. Ecosystem Health Score — EHS

Defined in the POD spec. Store effective weights and missing components.

---

# 28. Opportunity Score — OS

Example initial structure:

```text
OS_raw =
  0.35*DSR
+ 0.20*positive_demand_momentum
+ 0.15*commercial_strength_if_narrow
+ 0.10*HYPE_context_capped
+ 0.10*availability_feasibility
+ 0.10*ecosystem_health_if_applicable
- 0.25*distribution_breadth
- 0.15*data_risk
```

Normalize/clamp to 0–100. HYPE context must be capped and cannot create OS without Romanian evidence.

---

# 29. Risk Score — RS

Risk dimensions should be inspectable:

- data coverage risk;
- source concentration risk;
- supply/stock risk;
- POD ecosystem risk;
- price volatility risk;
- identity risk;
- ranking semantics risk;
- operator concentration risk.

Do not hide these inside one scalar only; scalar is optional summary.

---

# 30. Recommendation engine

Inputs:

```text
CSS, DB, AH, DSR, MOM, PCP, DC, UC, EHS, OS, RS
```

Outputs:

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

Minimum guardrails:

- low DC => no aggressive GROW;
- low UC => national language softened;
- POD EHS low => no uncomplicated CORE/GROW;
- high DSR + low DB can create TEST, not automatically GROW;
- Tier B-only evidence cannot be worded as unit-sales growth;
- one operator cannot by itself create “Romania-wide” confidence.

---

# 31. Recommendation explanation schema

```text
recommendation
entity_id
entity_level
score_version
why_now[]
positive_evidence[]
negative_evidence[]
missing_data[]
coverage_summary
confidence
upgrade_if[]
downgrade_if[]
generated_at
```

---

# 32. White-space candidate schema

```text
entity_id
romanian_demand_score
distribution_breadth
commercial_strength
availability_health
ecosystem_health?
hype_context?
data_confidence
opportunity_score
blockers[]
```

---

# 33. Source independence

Storefront independence and operator independence are different.

For breadth expose both:

```text
storefront_count
operator_count
```

Two sites owned by the same operator can count as two observable storefronts but not two independent economic operators.

---

# 34. Price-comparison deduplication

If Compari/Price shows seller `X` and direct retailer X is monitored:

- comparison offer links to retailer X;
- do not create new retailer;
- comparison source can corroborate price/availability observation but does not increase storefront breadth.

---

# 35. External-source geographic classification

Each demand observation:

```text
RO_EXPLICIT
RO_INFERRED_STRONG
GLOBAL_CONTEXT
UNKNOWN
```

Only eligible RO classes enter DSR. `RO_INFERRED_STRONG` requires documented signals such as Romanian-language Romania-targeted source/account, not vague assumptions.

---

# 36. HYPE bridge schema

```text
hype_product_id
analiza_product_id?
hype_stage
hype_launch_probability
hype_last_signal_at
romanian_watch_state
romanian_first_listing_at?
```

HYPE variables are contextual features only.

---

# 37. Raw retention and hashes

Prefer storing normalized facts + hashes + minimal evidence excerpts. Full page retention is optional and policy/copyright constrained.

Evidence must be reproducible enough to explain changes without indefinite unnecessary raw HTML storage.

---

# 38. Pipeline modules

Suggested vNext tree:

```text
tools/analiza-vnext/
  core/
    ids.js
    normalize.js
    dates.js
    taxonomy.js
  registry/
    retailers.js
    operators.js
    sources.js
    policies.js
    health.js
  discovery/
    retailer-discovery.js
    pod-category-discovery.js
    ranking-discovery.js
  adapters/
    direct-retail/
    comparison/
    demand/
    regulatory/
  entity/
    brands.js
    products.js
    variants.js
    pod-platforms.js
    compatibility.js
  evidence/
    offers.js
    rankings.js
    sales-counters.js
    demand.js
  history/
    cohorts.js
    transitions.js
  features/
    distribution.js
    availability.js
    price.js
    commercial.js
    demand.js
    ecosystem.js
    coverage.js
  scoring/
    css.js
    db.js
    ah.js
    dsr.js
    momentum.js
    pcp.js
    dc.js
    uc.js
    ehs.js
    opportunity.js
    risk.js
  recommendations/
    engine.js
    explain.js
  projections/
    pulse.js
    movers.js
    whitespace.js
    price-stock.js
    pod-ecosystems.js
    coverage.js
    legacy-compat.js
  qa/
```

---

# 39. Storage abstraction

Business logic must not depend directly on JSON files.

Interfaces:

```text
RetailerRegistry
ProductRegistry
OfferStore
RankingStore
SalesCounterStore
DemandStore
CoverageStore
ScoreStore
ProjectionStore
```

Initial implementation may use JSON on a shadow branch, but interfaces should support later D1 migration.

---

# 40. Orchestration order

```text
1 source/universe plan
2 direct assortment/price/stock
3 ranking sources
4 explicit sales/demand counters
5 comparison/seller discovery
6 external Romania demand
7 entity resolution
8 POD compatibility resolution
9 history/cohort updates
10 coverage calculations
11 features
12 scores
13 recommendations
14 truth/wording gates
15 projections
16 QA
17 publication/shadow comparison
```

---

# 41. Failure semantics

Collector result states:

```text
SUCCESS
EMPTY_VALID
PARTIAL
BLOCKED
TIMEOUT
PARSER_DRIFT
POLICY_HOLD
ERROR
```

Only `EMPTY_VALID` can support a true zero observation for the scanned scope. Failures lower coverage rather than becoming zero products.

---

# 42. Publication truth gate

Before publishing a new ANALIZA projection:

- base Market snapshot fresh;
- required schema valid;
- no critical source/coverage invariant broken;
- product identities valid enough;
- no impossible prices;
- no duplicate retailer inflation;
- ranking semantics active;
- source failures reflected in coverage;
- POD device/consumable separation valid;
- no market-share wording unless gate passes;
- recommendation explanations complete.

---

# 43. Versioning

Version separately:

- taxonomy;
- product aliases;
- retailer registry;
- operator mapping;
- compatibility rules;
- source semantics;
- scoring formulas;
- recommendation thresholds;
- UI projection schema.

Every published row should expose or be traceable to these versions.

---

# 44. Correction model

Do not silently overwrite historical errors.

Correction event stores:

- target observation/entity;
- old value;
- corrected value;
- reason;
- evidence;
- reviewer/automation source;
- timestamp;
- version.

Rebuild downstream projections after correction.

---

# 45. Definition of implementable completion

The data/scoring layer is complete only when:

- all source families map into explicit evidence semantics;
- POD ecosystems have real entities/edges;
- ranking normalization is source-aware;
- same-store cohorts prevent fake momentum;
- price/pack normalization works;
- operator/storefront dedupe works;
- scores expose missing data and versions;
- recommendations can be regenerated from stored facts;
- source outages cannot create false negative trends;
- legacy projection can keep current page working during migration.

**End of canonical data/scoring/pipeline spec.**
