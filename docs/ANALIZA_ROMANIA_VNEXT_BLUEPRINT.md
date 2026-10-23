# ANALIZA ROMÂNIA vNext — Maximum Market Intelligence Blueprint

**Status:** CANONICAL DESIGN SPECIFICATION — v1.0  
**Date:** 2026-09-01  
**Repository:** `andreiclim77-cell/rta`  
**Target:** `ghid-rta.ro` → Piața RTA → **Analiza**  
**Geographic scope:** **ROMÂNIA**  
**Product scope:** RTA, MOD, POD/AIO/BORO, product-specific accessories and replacement ecosystems relevant to those devices.

---

# 0. Executive definition

ANALIZA is not a sales counter and not a simple bestseller list. It is a **Romania-focused public/authorized-source market-intelligence system** that continuously observes commercial presence, rankings, explicit sales evidence where available, price, stock state, assortment, external Romanian demand and source coverage, then produces explainable management intelligence without overstating what the evidence proves.

ANALIZA must answer:

1. What products, brands, categories and device ecosystems have the strongest **observed commercial signal in Romania**?
2. What is accelerating, stable or declining?
3. Where are there **white-space opportunities** — measurable Romanian demand with weak local distribution or weak commercial confirmation?
4. Which products are broadly listed but weakly represented in bestseller/ranking signals?
5. Which products are narrow-distribution but commercially strong where listed?
6. How do price, promotions, stock state, assortment breadth and retailer penetration change over time?
7. For PODs, how strong is the **device ecosystem**, including replacement pods/cartridges/coils required to keep the platform usable?
8. What is the confidence of every conclusion, and what data are missing?
9. How much of the Romanian observable universe was successfully measured today?
10. What would have to change before a management recommendation should be upgraded or downgraded?

The core promise is epistemic:

> **ANALIZA must say exactly what was observed in Romania, what was inferred, how strong the evidence is, and what it cannot know from public data.**

---

# 1. Non-negotiable truth invariants

1. **Listing is not sale.**
2. **In-stock is not sale.**
3. **Bestseller/popularity rank is not units sold.**
4. **Search interest is not sale.**
5. **Social/community interest is not sale.**
6. **A marketplace listing is not part of the retailer denominator unless the marketplace seller itself qualifies under the universe policy.**
7. **A product appearing in many storefronts is distribution breadth, not market share.**
8. **A reciprocal-rank or normalized ranking index is an observed commercial index, not market share.**
9. **National unit/value market share cannot be declared without sufficiently complete, comparable Tier-A unit/value coverage.**
10. **A source failure cannot be interpreted as zero products, delisting or demand decline.**
11. **A parser failure cannot create a stock-out.**
12. **A missing product today cannot be called discontinued until evidence supports the lifecycle state.**
13. **A promotion cannot be compared to a regular price without retaining the price type.**
14. **Bundle prices are not directly comparable with standalone SKU prices.**
15. **Variants must not inflate product-family breadth unless the metric explicitly measures SKU breadth.**
16. **POD devices must not be mixed with replacement pods/cartridges/coils.**
17. **Replacement pods/coils must not be discarded; they are separate ecosystem entities.**
18. **Closed/prefilled, open pod, pod-mod, AIO and Boro must remain distinguishable.**
19. **RTA authentic and clone products remain distinct.**
20. **HYPE/global momentum cannot create a Romanian GROW recommendation without Romanian evidence.**
21. **Every management recommendation must be reproducible from stored evidence and scoring version.**
22. **Unknown / DATA_GAP is a valid result.**
23. **Coverage confidence must fall when important sources fail.**
24. **The phrase `100% România` is forbidden unless the dated national-universe certification gate passes.**
25. **A dated universe certification expires and must be re-established.**

---

# 2. Primary user surfaces

ANALIZA vNext has seven primary surfaces.

## 2.1 ROMANIA PULSE

Shows current strongest observable signals across:

- product;
- product family;
- brand;
- category;
- POD ecosystem/platform;
- retailer/operator;
- price band.

Must clearly label whether strength comes from Tier A, Tier B, Tier C or only Tier D evidence.

## 2.2 MOVERS

7d / 30d / 90d / YTD movement, when comparable historical observations exist:

- commercial ranking strength;
- listing breadth;
- in-stock breadth;
- price median;
- demand strength;
- POD consumable breadth;
- source coverage.

## 2.3 WHITE SPACE

Romanian demand not yet matched by Romanian commercial presence. Must distinguish:

- demand high / local distribution low;
- local distribution high / bestseller evidence weak;
- global HYPE high / Romanian demand not yet confirmed;
- Romanian search rising / product absent;
- POD device interest high / ecosystem consumables weak.

## 2.4 PRICE & AVAILABILITY

For every canonical entity:

- current Romanian price range and median;
- promo vs regular;
- retailer count with valid current price;
- in-stock retailer count;
- stock continuity;
- price dispersion;
- price changes over time;
- availability transitions.

## 2.5 POD ECOSYSTEMS

Device + replacement pod/cartridge + coil + platform-specific accessory intelligence.

## 2.6 ASSORTMENT & DISTRIBUTION

Which retailers/operators carry what, listing breadth, operator concentration, brand/category depth and new listing/delisting flow.

## 2.7 COVERAGE & CONFIDENCE

Shows exactly:

- registered storefronts;
- currently reachable storefronts;
- parser success;
- category coverage;
- Tier A/B/C/D coverage;
- price/stock coverage;
- POD device/consumables coverage;
- blind spots;
- national-universe certification state.

---

# 3. Canonical product taxonomy

Taxonomy is configuration-driven, versioned and shared by all ANALIZA collectors and projections.

## 3.1 RTA

Dimensions:

- MTL / tight MTL / loose MTL / RDL / DL;
- single / dual / mesh / special deck;
- airflow architecture where evidenced;
- authentic / clone;
- diameter/platform;
- family/model/revision;
- product-specific accessories.

## 3.2 MOD

- regulated box;
- SBS;
- tube regulated;
- mechanical;
- squonk / bottom feeder;
- AIO/Boro host;
- internal/single/dual battery;
- cell format;
- chipset/board where evidenced.

## 3.3 POD / AIO / BORO — mandatory native scope

Separate entities:

- open pod device;
- closed/prefilled pod device;
- pod-mod;
- AIO;
- Boro-compatible host;
- Boro bridge/RBA;
- replacement pod/cartridge;
- coil family;
- proprietary consumable family;
- platform-specific charging dock/accessory;
- disposable only in a separate optional scope, never silently mixed into refillable hardware analysis.

## 3.4 Product-specific accessories

RTA/platform specific:

- airflow pins/inserts/disks;
- chambers/bells/chimneys;
- tanks/glass/PC/PEI/Ultem/SS sections;
- decks;
- top caps/bases;
- extension/conversion kits;
- platform-specific drip tips;
- spare kits/components.

## 3.5 Generic DIY supplies

Wire/cotton/tools/premade coils may remain a secondary category, but do not dominate the default hardware intelligence surface.

---

# 4. POD ecosystem intelligence — first-class capability

The current POD classifier is migration input, but vNext must model the entire platform.

Canonical graph:

```text
POD_DEVICE
  --member_of--> POD_PLATFORM
REPLACEMENT_POD
  --compatible_with--> POD_PLATFORM
COIL_FAMILY
  --compatible_with--> POD_PLATFORM
POD_ACCESSORY
  --compatible_with--> POD_PLATFORM
```

For each platform measure separately:

- device listed storefronts;
- device in-stock storefronts;
- device bestseller storefronts;
- device Tier-A storefronts;
- replacement-pod listed storefronts;
- replacement-pod in-stock storefronts;
- compatible coil breadth;
- consumable stock continuity;
- number of compatible SKUs/ohm variants without treating them as separate device popularity;
- median/range device price;
- median/range consumable price;
- device Romanian search demand;
- consumable-family Romanian search demand;
- guide intent;
- Romanian community signal;
- retailer/operator concentration;
- ecosystem coverage confidence.

Create **Ecosystem Health Score (EHS)** as an explicitly derived management score, not sales truth.

Suggested initial formula:

```text
EHS =
  0.25 * device_distribution_breadth
+ 0.20 * replacement_pod_breadth
+ 0.15 * coil_or_consumable_breadth
+ 0.15 * device_commercial_signal
+ 0.10 * consumable_commercial_signal
+ 0.10 * stock_continuity
+ 0.05 * romanian_external_demand
```

For closed systems or coil-less cartridge architectures, redistribute non-applicable weights proportionally and disclose the formula used.

Side states:

- `ECOSYSTEM_HEALTHY`
- `ECOSYSTEM_NARROW`
- `ECOSYSTEM_RISK`
- `CONSUMABLE_GAP`
- `DEVICE_GAP`
- `DATA_GAP`

A strong device with poor replacement-pod availability must not be treated as an uncomplicated CORE item.

---

# 5. Romanian market universe

ANALIZA must maintain two distinct universes.

## 5.1 Consumer storefront universe

Unit: distinct Romanian consumer-facing storefront/domain offering in-scope products to Romanian customers.

Per storefront:

- canonical ID;
- domain;
- operator ID where public/legitimate;
- public legal name/CUI where available from store legal pages or official validation sources;
- physical-store network when publicly declared;
- delivery scope;
- categories;
- platform/CMS;
- collector adapter;
- source health;
- last successful observation;
- historical status.

Multiple storefronts of the same operator remain separate for **storefront breadth** but collapse for **operator breadth/concentration**.

## 5.2 Other Romanian signals

Separate from storefront denominator:

- price comparison engines;
- marketplaces;
- search demand;
- public Romanian communities;
- Romania-relevant video/social interest;
- manufacturer dealer locators;
- public physical-store directories;
- authorized first-party ghid-rta telemetry;
- advertising/promotional signals;
- trade/import structural context.

These can support demand/context but not be silently converted into retailer unit sales.

---

# 6. National-universe certification

Current static registry is only a seed.

States:

```text
UNCERTIFIED
PROVISIONAL
CLEAN_AUDIT
CERTIFIED_FOR_DATE
EXPIRED
```

Certification requires continuous discovery using multiple independent routes:

1. general web discovery provider(s);
2. Romanian-language category/product queries;
3. manufacturer official dealer-locator links;
4. backlink/domain discovery from known shops and brands;
5. price comparison engines;
6. public social/business references to Romanian vape shops;
7. physical-store chain websites;
8. known historical/retired storefront registry;
9. alternate storefronts linked to known operators;
10. manual/adversarial discovery sampling.

Certification conditions should require no unresolved plausible retailer candidates over a defined repeated audit window and adequate discovery-provider health. Certification expires after a configurable period (recommended 7–14 days) or earlier on material discovery failure.

Never equate `two clean searches` with permanent national completeness.

---

# 7. Evidence ladder

## Tier A — explicit sales evidence

- explicit public units sold counter;
- authorized merchant unit/order feed;
- direct first-party data intentionally provided for ANALIZA;
- cumulative counter with positive snapshot delta;
- value/revenue only when semantics and VAT/currency scope are clear.

Tier A supports only the observed merchant/scope/time interval.

## Tier B — commercial ranking evidence

- retailer-labelled bestseller;
- validated popularity ordering;
- `cele mai vândute` category/filter;
- verified bestseller widget;
- store/category rank with known semantics.

Tier B = ranking, not units.

## Tier C — demand/behavior proxy

- authorized/public product views;
- review-count delta;
- wishlist/favorite delta;
- Google Ads Romania keyword historical metrics;
- Google Trends Romania/subregion interest when official API access exists;
- first-party guide search/intent telemetry;
- Romanian public community mentions;
- Romania-relevant creator/social interest;
- marketplace/price-comparison observation as separate proxy.

## Tier D — assortment/availability/price evidence

- listed/not-listed;
- stock state;
- price;
- promotion;
- category placement;
- variant count;
- replacement-pod/coil ecosystem breadth;
- first/last observed.

## Tier E — structural/context evidence

- Romanian regulatory product records;
- official trade/import statistics where sufficiently specific;
- public operator/dealer network information;
- advertising transparency data;
- manufacturer Romania distribution/dealer information.

Tier E contextualizes the market; it does not prove retail sell-through.

---

# 8. Temporal model

Maintain independent daily histories for:

- assortment;
- availability;
- price;
- promotions;
- rankings;
- explicit sales counters;
- demand signals;
- source health/coverage;
- POD platform ecosystem breadth.

Comparison windows:

- 7d;
- 30d;
- 90d;
- YTD;
- 365d when history permits.

Rules:

- no trend from fewer than two comparable observations;
- compare like-for-like source cohorts where possible;
- when source set changes materially, flag cohort instability;
- historical snapshots are append-only or correction-versioned;
- missing source days must not create artificial declines.

---

# 9. Retailer observation state machine

Per canonical product × storefront:

```text
UNKNOWN
NOT_LISTED
LISTED
PREORDER
IN_STOCK
LOW_STOCK_EXPLICIT
OUT_OF_STOCK
BACKORDER
DISCONTINUED
REMOVED
BLOCKED_UNOBSERVABLE
PARSER_ERROR
```

Every transition stores:

- observed time;
- source URL;
- parser/adapter version;
- price if present;
- evidence hash;
- confidence;
- prior state.

`REMOVED` is not automatically `DISCONTINUED`.

---

# 10. Price intelligence

Per product/variant/platform in Romania:

- current min/max/median;
- number of comparable valid offers;
- regular-price median;
- promo-price median;
- 7/30/90d median change;
- price dispersion/IQR;
- promo incidence and promo persistence;
- outlier detection;
- stock-aware current price;
- retailer/operator concentration by price band;
- device vs consumables for POD.

Normalization requirements:

- RON canonical currency;
- VAT state retained;
- bundle vs standalone split;
- pack size/quantity normalized;
- same variant/specification comparison;
- stale/out-of-stock offer not included in current in-stock median unless explicitly requested.

Derived price metrics cannot be labeled as “cheapest/best buy” in the intelligence engine; the purpose is market positioning and trend, not consumer shopping guidance.

---

# 11. Assortment/distribution metrics

For product / family / brand / category / POD platform:

- `listed_storefronts`;
- `in_stock_storefronts`;
- `bestseller_storefronts`;
- `tierA_storefronts`;
- `operator_breadth`;
- `storefront_breadth`;
- `availability_ratio`;
- `stock_continuity_7d/30d/90d`;
- `new_listing_count_7d/30d`;
- `delisting_count_7d/30d`;
- `price_coverage`;
- `ranking_coverage`;
- `consumable_breadth` for POD;
- `accessory_breadth` for RTA/platform products;
- `variant_breadth` separately from product breadth.

Breadth is never market share.

---

# 12. Commercial ranking model

Current raw reciprocal-rank aggregation should be replaced by a semantics-aware normalized model.

Every ranking source stores:

- ranking type;
- retailer;
- operator;
- category scope;
- number of visible items;
- rank direction;
- freshness;
- source confidence;
- whether store-wide or category-specific;
- whether ranking semantics are explicitly sales/popularity.

Normalize within source before cross-source aggregation.

Outputs:

- `CommercialSignalStrength`;
- ranking breadth;
- operator breadth;
- best rank;
- median normalized rank;
- rank persistence;
- rank acceleration;
- source diversity;
- ranking coverage confidence.

Raw rankings remain inspectable.

---

# 13. Romanian demand intelligence

Demand is Romania-scoped whenever possible.

## 13.1 Google Ads historical metrics

Use geo-target Romania and Romanian + relevant English product aliases. Historical metrics refresh monthly; cache accordingly.

## 13.2 Google Trends

Use the official Trends API only if access is granted. The current API is alpha, so it is an optional adapter with a kill switch and cannot be a mandatory production dependency. Use country/subregion data and consistent scaling where available.

## 13.3 First-party ghid-rta telemetry

Authorized aggregate telemetry:

- searches;
- product/detail opens;
- category/filter use;
- watchlist/favorite actions if introduced;
- referral/search query terms where privacy-safe;
- Romanian locale/session context only as permitted.

Do not create unnecessary personal profiles.

## 13.4 Romanian public communities/social/video

Measure only public/authorized signals with clear Romania relevance. Separate:

- mention count;
- independent origin count;
- engagement where available;
- first/last observed;
- category/product matching confidence.

## 13.5 Price comparison / marketplace

Compari.ro, Price.ro and other validated public comparison surfaces can support:

- offer discovery;
- seller discovery;
- price breadth;
- availability proxy;
- product identity/alias discovery.

They remain separate from the canonical retailer denominator and do not prove sales.

---

# 14. Entity resolution — mandatory refactor

Do not use first two product-title tokens as canonical brand inference.

Canonical entities:

- brand;
- legal manufacturer/group;
- product family;
- model;
- variant;
- SKU/GTIN/EAN/UPC when public;
- POD platform;
- replacement pod/cartridge;
- coil family;
- RTA accessory/platform;
- storefront;
- economic operator.

Resolution features:

- alias registry;
- exact model tokens;
- SKU/GTIN/EAN;
- compatibility strings;
- official brand context;
- product family;
- variant attributes;
- source URL/category;
- specs only as supporting evidence.

Store merge/split decisions and confidence. Manual corrections become durable versioned canonical rules.

---

# 15. POD compatibility graph

Compatibility is a first-class relationship.

Example:

```text
DEVICE --member_of--> PLATFORM
REPLACEMENT_POD --compatible_with--> PLATFORM
COIL --compatible_with--> PLATFORM
```

Store:

- compatibility source;
- exact supported versions;
- partial/backward compatibility;
- ohm/capacity variants;
- region-specific variants;
- confidence.

Do not count five resistances of the same cartridge family as five independent device-demand signals.

---

# 16. Scoring architecture

Never collapse all uncertainty into one opaque score.

Expose at least:

1. **CSS — Commercial Signal Strength**
2. **DB — Distribution Breadth**
3. **AH — Availability Health**
4. **DSR — Demand Strength Romania**
5. **MOM — Momentum**
6. **PCP — Price Context Position**
7. **DC — Data Confidence**
8. **EHS — Ecosystem Health Score** for POD/platform
9. **OS — Opportunity Score**
10. **RS — Risk Score**
11. **UC — Universe Coverage Confidence**

Every score stores:

- scoring version;
- input features;
- missing inputs;
- normalization cohort;
- explanation;
- prior score and reason for change.

---

# 17. Initial scoring concepts

## 17.1 Commercial Signal Strength

Possible components when available:

```text
CSS = normalized(
  TierA_explicit_sales_strength,
  normalized_ranking_strength,
  ranking_persistence,
  ranking_operator_diversity
)
```

Tier A gets stronger semantic weight than Tier B but must not dominate nationally when only one merchant provides it.

## 17.2 Data Confidence

Inputs:

- source coverage;
- source health;
- history depth;
- retailer/operator diversity;
- entity-resolution confidence;
- ranking semantics confidence;
- price/stock extraction coverage;
- comparable cohort stability.

## 17.3 Opportunity Score

Possible components:

```text
OS =
  + Romanian demand strength
  + positive demand/commercial momentum
  + HYPE relevance as small context term
  - Romanian distribution breadth
  - current bestseller breadth
  - supply/ecosystem risk
  - low data confidence penalty
```

HYPE contribution must remain small enough that global buzz cannot create a Romanian opportunity without Romanian corroboration.

---

# 18. Management recommendation states

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

Every recommendation must show:

- status;
- evidence summary;
- contradictory signals;
- data confidence;
- why now;
- exact upgrade trigger;
- exact downgrade trigger;
- whether recommendation is product, family, brand or ecosystem level.

Do not use deep/aggressive stock guidance when evidence is Tier-B/Tier-C dominated and DC is low.

---

# 19. White-space engine

White space must require Romanian evidence.

Candidate types:

- high DSR + low local breadth;
- rising DSR + newly emerging local listing;
- strong bestseller signal in few stores + low distribution breadth;
- Romanian search demand for a HYPE release not yet broadly distributed;
- POD device demand with strong consumable ecosystem abroad but weak Romanian ecosystem;
- Romanian ecosystem consumable demand with device base already broad.

Reject/downgrade when:

- demand comes only from global HYPE;
- identity uncertain;
- source coverage poor;
- product is old/relisting;
- ecosystem consumables unavailable;
- observed demand is mostly one source/one operator.

---

# 20. HYPE ↔ ANALIZA boundary

HYPE = global emerging-product intelligence.  
ANALIZA = Romanian commercial/demand intelligence.

Permitted connections:

- HYPE candidate → Romanian watch candidate;
- HYPE release → Romanian listing/price/stock monitoring;
- HYPE global interest → context feature;
- clone/original link → assortment context;
- expected launch → preconfigure Romanian entity/watch record.

Forbidden shortcut:

`High HYPE score -> GROW Romania` without Romanian evidence.

---

# 21. Source health and coverage

Per source/storefront measure:

- HTTP/API success;
- parser success;
- meaningful product yield;
- category coverage;
- ranking extraction health;
- price extraction health;
- stock extraction health;
- latency;
- consecutive failures;
- template drift;
- redirect/domain migration;
- last useful observation.

States:

```text
HEALTHY
DEGRADED
DRIFTED
BLOCKED
INACTIVE
RETIRED
POLICY_HOLD
```

Coverage confidence is separate for:

- retailer universe;
- ranking;
- Tier A;
- price;
- stock;
- RTA;
- MOD;
- POD device;
- POD consumables;
- accessories;
- demand.

---

# 22. Romanian retailer discovery engine

Continuously discover and adjudicate new Romanian sellers.

Inputs:

- Romanian/English search queries;
- `.ro` and Romania-serving domains;
- manufacturer dealer locators;
- price-comparison seller lists;
- links from existing retailers/distributors;
- public social/business references;
- public physical-store chain pages;
- historical/retired registry;
- operator alternate domains.

Candidate lifecycle:

```text
DISCOVERED
VALIDATING
QUARANTINED
ACTIVE
REJECTED
RETIRED
```

Validation criteria:

- consumer-facing commerce;
- Romania-serving;
- in-scope hardware present;
- not marketplace-only/editorial/B2B-only unless classified separately;
- stable source identity;
- policy-compatible public access.

---

# 23. Current Romanian seed universe

Preserve and re-audit at least the current registry:

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

This list is a seed, not a claim of national completeness.

Every storefront must be re-audited for explicit POD/AIO/Boro device and replacement pod/coil categories, not only RTA/rebuildable pages.

---

# 24. POD retailer discovery procedure

For every Romanian storefront, discover in order:

1. navigation/category labels: `pod`, `pod kit`, `pod system`, `tigara electronica`, `kit`, `AIO`, `Boro`, `cartus`, `cartridge`, `rezistenta`, `coil`;
2. site search for registered POD makers/series;
3. sitemap/product feed classification;
4. bestseller/popularity surfaces;
5. replacement-pod/coil categories;
6. platform compatibility strings;
7. structured product data;
8. first/last observed state.

A store can be RTA-relevant, POD-relevant, both, or temporarily zero-stock; category coverage is explicit.

---

# 25. Price comparison and seller discovery

Treat public comparison engines as a distinct source family.

Potential validated seeds include:

- Compari.ro;
- Price.ro;
- additional Romania comparison engines only after current relevance/policy validation.

Use to discover:

- sellers missed by web search;
- product aliases;
- public current offer prices;
- in-stock claims;
- seller-count breadth.

Never count comparison-engine offers and retailer direct pages as two independent sellers when they refer to the same storefront.

---

# 26. Advertising/promotional intelligence

Optional Romania demand/promotion layer:

- Google Ads Transparency Center region RO;
- Meta Ad Library country RO when access/policy permits;
- retailer newsletter/promotional feeds;
- public campaign landing pages;
- public retailer social promotions.

Outputs:

- ad/promotion observed;
- advertiser identity;
- product/platform;
- first/last seen;
- creative/campaign lineage;
- promotion intensity proxy.

Advertising intensity is demand/marketing context, not sales.

---

# 27. Regulatory intelligence — Romania context

The Ministry of Health `RO-ECigarette` publications can support:

- product/brand identity;
- manufacturer/importer/submitter clues;
- Romanian regulatory-record existence;
- alias discovery.

They do **not** prove retail availability or sell-through.

Use regulatory records to expand entity/source registries and detect products that should be watched in Romanian retail.

---

# 28. Structural trade/import context

Optional macro layer when a sufficiently specific official commodity classification/dataset can be validated.

Potential official source family:

- Eurostat international trade datasets/API;
- Romanian official trade statistics where accessible.

Use only for aggregate market context, never product-level demand unless the classification is sufficiently specific.

Before activation, document:

- commodity code;
- exact scope;
- whether it includes unrelated devices;
- units/value semantics;
- reporting lag;
- intra-EU vs extra-EU treatment.

If classification is too broad, disable the metric rather than imply vape-specific imports.

---

# 29. Operator/economic-entity layer

Storefront and operator are separate entities.

Where public/legitimate information exists, retain:

- legal business name;
- public CUI/VAT ID;
- storefront links;
- operator-to-storefront relationship;
- physical store chain if declared;
- operator aliases.

Validation can use official/public EU/Romanian business/VAT mechanisms where appropriate. Do not expose unnecessary personal data.

Operator layer enables:

- concentration metrics;
- duplicate-storefront correction;
- dealer-network mapping;
- source independence checks.

---

# 30. Concentration metrics

When using observed ranking/listing data, label concentration precisely.

Possible metrics:

- top-3 observed commercial-index share;
- HHI of normalized observed commercial index;
- operator concentration of listing breadth;
- brand concentration within category;
- POD platform concentration.

Never label these national market-share concentration unless genuine unit/value share exists.

---

# 31. Comparable cohort logic

Trend requires comparable cohorts.

When a retailer source appears/disappears or parser coverage changes:

- compute same-store/cohort trend where possible;
- report full-universe current breadth separately;
- penalize trend confidence when cohort shifts materially;
- never treat new source onboarding as product growth.

---

# 32. Negative and contradictory evidence

Preserve:

- retailer removes product;
- retailer marks discontinued;
- repeated out-of-stock;
- rank disappears;
- price spikes/drops;
- official product withdrawal;
- source/parser failure;
- conflicting stock state across retailers;
- contradictory product identities.

Do not collapse negative evidence into one number without explanation.

---

# 33. Manual review queue

Create review queues for:

- uncertain product identity;
- uncertain brand;
- POD compatibility ambiguity;
- suspicious price;
- suspicious sales counter;
- ranking semantics unclear;
- new retailer candidate;
- operator duplication;
- source drift;
- extreme score movement;
- national-universe certification blockers.

Manual decisions are versioned and reproducible.

---

# 34. Data architecture

Target long-term architecture:

```text
SOURCE REGISTRY
 -> SCAN TASKS
 -> RAW OBSERVATIONS
 -> NORMALIZED OFFERS/RANKINGS/DEMAND
 -> ENTITY RESOLUTION
 -> RETAILER/OPERATOR GRAPH
 -> PRODUCT/POD PLATFORM GRAPH
 -> HISTORICAL STORE
 -> FEATURE BUILDERS
 -> SCORES
 -> MANAGEMENT PROJECTIONS
 -> UI / REPORT / ALERTS
```

Recommended eventual storage:

- D1 or equivalent relational store for entities/observations/history;
- R2/object storage only for necessary permitted raw artifacts;
- KV for cursors/locks/cache/source health;
- queues for source-family fan-out;
- compact JSON read projections for current GitHub Pages compatibility.

Do not force storage migration before benchmark/shadow validation.

---

# 35. Suggested relational entities

```text
retailers
operators
retailer_operator_edges
retailer_sources
source_health
scan_runs
products
product_aliases
product_variants
product_identifiers
brands
pod_platforms
compatibility_edges
offers
availability_observations
price_observations
ranking_sources
ranking_observations
sales_counter_observations
demand_observations
promotion_observations
regulatory_artifacts
universe_candidates
universe_audits
score_runs
management_recommendations
manual_reviews
coverage_snapshots
```

---

# 36. Orchestration

Current daily chained workflows are preserved during migration.

Target scheduling:

- assortment/stock/price: daily minimum; high-yield sources may run more frequently if permitted;
- bestseller/ranking: daily or source-appropriate;
- explicit counters: daily with counter semantics;
- Google Ads: monthly cache refresh;
- Trends: daily/weekly if alpha access and rate policy allow;
- retailer discovery: daily/weekly;
- national-universe audit: at least weekly + triggered by new candidate;
- operator/source audit: weekly/monthly;
- deep backtest: nightly/weekly.

Manual refresh should run priority incremental tasks, not needlessly hammer every source.

---

# 37. UI requirements

Top navigation:

- PULSE
- MOVERS
- WHITE SPACE
- PRICE & STOCK
- POD ECOSYSTEMS
- COVERAGE

Filters:

- RTA / MOD / POD / AIO / BORO / accessory;
- product / family / brand / category / platform;
- 7d/30d/90d/YTD;
- status;
- confidence;
- retailer/operator;
- price band.

Every row/card should show:

- what metric is being shown;
- evidence tier mix;
- Romanian storefront breadth;
- current availability;
- trend with cohort confidence;
- demand strength;
- data confidence;
- recommendation and change trigger;
- source/coverage drawer.

POD card additionally shows ecosystem health and consumable breadth.

---

# 38. Decision explanation contract

For every recommendation generate structured explanation:

```text
recommendation
why_now[]
positive_evidence[]
negative_evidence[]
missing_data[]
confidence
upgrade_if[]
downgrade_if[]
source_coverage
scoring_version
```

No recommendation may be a bare label.

---

# 39. Alerts / watchlist

Optional management alerts:

- new Romanian listing;
- first Romanian in-stock observation;
- product gains/losses multiple retailers;
- ranking acceleration;
- repeated out-of-stock;
- significant median price move;
- new POD consumable availability;
- POD ecosystem gap;
- source coverage degradation;
- HYPE product first appears in Romania;
- white-space score crosses threshold.

Alerts are derived from evidence transitions, not regenerated noise.

---

# 40. QA / backtest principles

Benchmark at least:

- known products with multi-store presence;
- products listed broadly but not bestseller;
- bestseller in only one retailer;
- repeated out-of-stock;
- relisted/renamed product;
- variant duplication;
- POD device with compatible consumables;
- POD device with missing consumables;
- product alias mismatch;
- same operator with multiple storefronts;
- price promo vs regular;
- bundle price false comparison;
- source outage;
- parser drift;
- ranking source changing semantics;
- new retailer onboarding causing fake momentum;
- HYPE global signal with no Romanian demand;
- Romanian demand with no local listing.

---

# 41. Current implementation — preserve

Preserve concepts/assets already working:

- `market-retailers-2026.json` registry;
- daily Market pipeline;
- sales signal workflow;
- Tier A/B/C truth separation;
- no-national-share-without-full-Tier-A rule;
- existing canonicalization code where valid;
- product presence history;
- Google Ads Romania integration;
- authorized guide metrics concept;
- current management UI shell;
- source/coverage UI;
- national-universe audit principle;
- 06:00 + fallback scheduling.

---

# 42. Current implementation — refactor

Refactor:

- RTA-centric product universe -> full hardware universe including POD/AIO/Boro;
- POD classifier -> POD platform + consumable entity graph;
- first-two-title-token brand heuristic -> canonical brand resolver;
- raw reciprocal rank aggregation -> semantics-aware normalized ranking;
- single `confidence` -> multi-dimensional scores;
- fixed storefront seed pages -> dynamic category/source discovery;
- national audit `two clean queries` -> renewable multi-route certification;
- missing source observations -> explicit incomplete coverage handling;
- flat product-level logic -> family/platform/variant graph;
- Git JSON history growth -> eventual structured history store while preserving read projections.

---

# 43. Deprecate as canonical assumptions

- `RTA-only` as ANALIZA scope;
- product title first words as brand truth;
- every popularity order being semantically comparable;
- any national `share` wording derived solely from ranking index;
- a fixed 22-store list as permanently complete Romania;
- missing observation = delisting/out-of-stock;
- POD accessories simply discarded;
- one opaque confidence score;
- global HYPE as substitute for Romanian demand.

---

# 44. Migration strategy

## Phase 0 — freeze/baseline

- capture current Market/Analysis contracts and data;
- benchmark current valid/invalid cases;
- inventory workflows/readers/writers;
- no public behavior change.

## Phase 1 — canonical schemas/entity resolution

- unified hardware taxonomy;
- brand/product/family/variant;
- retailer/operator;
- POD platform/consumables;
- legacy compatibility projection.

## Phase 2 — price/stock/history correctness

- state machine;
- cohort-aware histories;
- offer normalization;
- parser drift handling.

## Phase 3 — ranking/sales semantics

- ranking source contracts;
- normalized ranking strength;
- Tier A/B/C/D feature store;
- operator diversity.

## Phase 4 — POD ecosystems

- device + consumable collectors;
- compatibility graph;
- EHS;
- Romanian POD demand queries.

## Phase 5 — maximum Romanian source expansion

- retailer discovery;
- price comparison;
- Trends optional;
- ad transparency optional;
- regulatory/operator/structural layers.

## Phase 6 — multi-score management model

- CSS/DB/AH/DSR/MOM/PCP/DC/EHS/OS/RS/UC;
- recommendation explanations;
- white-space engine.

## Phase 7 — shadow UI

- new ANALIZA alongside existing view;
- comparison and regression review.

## Phase 8 — backtest/cutover

- only after acceptance gates pass.

---

# 45. Definition of maximum practical quality

ANALIZA is maximally designed when:

1. Romania is the explicit geographic scope of every commercial/demand conclusion;
2. RTA + MOD + POD/AIO/BORO are native first-class categories;
3. POD devices and consumables are connected but not conflated;
4. national retailer universe is dynamically discovered and periodically certified;
5. storefront and operator are distinct;
6. listing/ranking/sales/demand/price/stock are separate evidence types;
7. product identity is canonical, not title-token guesswork;
8. history is cohort-aware and source failures cannot create fake trends;
9. price and availability are normalized correctly;
10. Romanian demand is measured separately from global HYPE;
11. every recommendation is explainable and versioned;
12. coverage/blind spots are visible;
13. public/authorized data limitations are explicit;
14. cutover is benchmark-driven, not result-count-driven;
15. the current working site survives migration.

No honest public-source architecture can guarantee exact national sales volume if merchants do not expose comparable sales data. Maximum quality therefore means **maximum observable Romanian market intelligence with explicit evidence semantics**, not invented market share.

---

# 46. Governing implementation rule

Codex must not implement from this document alone. A canonical index and companion documents will define source map, POD ecosystem details, schemas/scoring, SOPs, current audit and acceptance gates.

Before production changes:

1. inventory existing ANALIZA/Market contracts;
2. create regression fixtures;
3. implement additive/shadow modules;
4. preserve current truth protections;
5. never weaken evidence semantics for more impressive outputs;
6. keep `main` and live ANALIZA functional until cutover gates pass.

**End of canonical blueprint.**
