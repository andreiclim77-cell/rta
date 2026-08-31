# HYPE Global Intelligence Blueprint

**Status:** CANONICAL DESIGN SPECIFICATION — v1.0  
**Date:** 2026-09-01  
**Repository:** `andreiclim77-cell/rta`  
**Target:** `ghid-rta.ro` → Piața RTA / HYPE  
**Rule:** this document defines the target architecture. Existing HYPE code is to be migrated incrementally; it is NOT to be discarded or rewritten blindly.

---

## 0. Executive definition

HYPE is not a news widget and not a retailer scraper. HYPE is a **public-source product intelligence system** for vaping hardware that continuously discovers, preserves, correlates, scores and explains evidence about:

1. products that truly appeared recently;
2. rumors, leaks and weak signals observed recently;
3. products likely to appear in the future, even if the expected release is more than 30 days away;
4. changes in already-known product candidates;
5. new brands, makers, designers, OEM/ODM actors, reviewers, distributors and sources that HYPE did not know yesterday.

The core promise must be epistemic rather than promotional:

> **HYPE should tell the user what was observed, what is known, what is only suspected, why the system believes it, and what evidence would change that belief.**

No source count, retailer listing, search snippet, social rumor or machine score may be presented as a confirmed launch unless the corresponding truth gate is passed.

---

# 1. Canonical product surfaces

HYPE vNext consists of five cooperating engines and four primary user views.

## 1.1 Engines

### HYPE RELEASES
Answers: **What genuinely appeared in the last 30 days?**

A product enters RELEASES only through strict release truth gates. A new listing of an old product, a new color, a restock, a batch, an old product newly indexed by a crawler, or a retailer's generic “new arrival” badge does not automatically qualify.

### HYPE RADAR
Answers: **What signals were first observed or materially changed in the last 30 days?**

The candidate's expected launch may be tomorrow, in 60/90/180+ days, unknown, delayed, or may never happen. The 30-day rule applies to the **signal observation window**, not to a forced launch horizon.

### HYPE CORRELATOR
Turns independent evidence items into product dossiers while preserving the entire evidence/event timeline. It resolves aliases, derivative copies, regional releases, batch events, clone links and contradictory claims.

### HYPE DISCOVERY
Continuously discovers new sources and entities. “Global” must not mean a frozen list of 40–100 domains. It must be a self-expanding source graph with controlled admission and retirement.

### HYPE WATCH
Tracks what changed since the previous scan: new URL, sitemap entry, trademark/design record, manual, firmware support, teaser, sample, preorder, stock state, event presentation, correction, delay, withdrawal, new independent source, or score transition.

## 1.2 User-facing views

1. **RELEASED · 30 DAYS** — verified recent releases / first verified market appearances.
2. **RADAR · SIGNALS SEEN 30 DAYS** — rumors through official pre-announcements, sorted by material change and confidence.
3. **RUMORS** — dedicated low/medium confidence area. Rumors are included, never hidden merely because they are unconfirmed.
4. **WATCHLIST** — followed brands/products and meaningful changes.

Optional transparency/admin view:

5. **COVERAGE & SOURCES** — source-family coverage, freshness, failures and known blind spots.

---

# 2. Non-negotiable truth invariants

These invariants are more important than recall or UI density.

1. **Observed date is not release date.**
2. **Search-engine indexing date is not release date.**
3. **CMS `dateModified` is not release date.**
4. **Retail listing is not automatically a launch.**
5. **“New arrival” is not automatically a launch.**
6. **Restock/relisting is not a launch.**
7. **A batch/reissue is not a new model.**
8. **A color/material option is a variant unless evidence says otherwise.**
9. **An accessory is not the parent device, but can be evidence that the parent exists.**
10. **A trademark/design filing proves the filing, not that a market launch will occur.**
11. **A regulatory notification proves a notification/record, not necessarily a public launch date.**
12. **Ten websites copying one press release are one evidence lineage, not ten independent confirmations.**
13. **One person cross-posting the same leak on Reddit, Facebook and a forum is one origin unless independence is demonstrated.**
14. **A clone release is a separate product/event linked to its original, never evidence that the original just launched.**
15. **Regional release dates must remain regional. UK/EU/US/Asia dates may differ.**
16. **A stale ETA cannot silently become RELEASED when the date passes. It becomes stale/delayed/unknown pending new evidence.**
17. **Unknown is an acceptable result. HYPE must never invent a product name, date, source independence, sales velocity, stock, demand or market share.**
18. **Every public factual claim must be traceable to stored evidence metadata and a source URL/identifier where legally/publicly accessible.**
19. **Procurement advice must never alter factual classification.**
20. **A system failure or stale snapshot must be shown as degraded/stale, not disguised as “no new products.”**

---

# 3. Time model — correct the current ±30-day coupling

The current architecture uses a strict symmetric ±30 day concept. HYPE vNext must separate four clocks:

```text
signalObservationWindowDays = 30
recentReleaseWindowDays      = 30
forecastHorizonDays          = 180 (configurable; >180 allowed as LONG_RANGE)
historyMemoryDays            = 730 recommended
```

## 3.1 `signal_observation_window`
A rumor/leak/teaser/etc. is in the active RADAR if it was first observed or materially changed within the last 30 days.

## 3.2 `recent_release_window`
RELEASED shows products for which a qualifying release/first-market event occurred within the last 30 days.

## 3.3 `forecast_horizon`
Expected launch intervals can extend beyond 30 days. Use:

- `0–30d` IMMINENT
- `31–60d` NEAR
- `61–90d` MID
- `91–180d` LONG
- `>180d` LONG_RANGE
- `unknown` UNKNOWN

## 3.4 `history_memory`
At least 730 days of product identity and public-existence memory is recommended for high-end RTA/mod markets, where products can reappear slowly or in batches. History is required to distinguish “new” from “newly rediscovered”.

---

# 4. Product taxonomy

Taxonomy must be configuration-driven and extensible, not embedded as a few regex branches.

## 4.1 RTA

Canonical dimensions:

- draw: MTL / tight MTL / loose MTL / RDL / DL;
- deck: single-coil / dual-coil / mesh / special;
- airflow inlet: bottom / side / top / hybrid;
- airflow delivery: under-coil / side-coil / multi-directional / chamber;
- diameter/platform;
- tank architecture;
- premium/high-end vs mass-market is metadata, not a truth tier;
- authentic / licensed collaboration / clone.

## 4.2 MOD

- regulated box;
- SBS;
- tube regulated;
- mechanical tube;
- mechanical box;
- squonk / bottom feeder;
- Boro/AIO host device;
- single/dual/multi battery;
- internal battery;
- 18350 / 18500 / 18650 / 20700 / 21700 etc.;
- chipset: DNA, Dicodes, YiHi and other named boards when evidence exists.

## 4.3 RTA ACCESSORIES

Separate **product-specific accessories** from generic rebuildable supplies.

Product-specific:

- airflow pins/inserts/disks;
- chamber/bell/chimney/reducer;
- alternative deck;
- tank/glass/PC/PEI/Ultem/SS section;
- top cap;
- base;
- 510 pin / BF-related compatible part where relevant;
- drip tip made for a specific platform;
- extension/reduction kit;
- spare kit/O-rings/screws/springs;
- aesthetic kit / sleeve / ring;
- conversion kit.

Generic rebuildable supplies are a separate optional subcategory:

- wire;
- premade coils;
- cotton;
- tools;
- generic drip tips.

Generic supplies must not flood the default HYPE feed intended for product intelligence.

## 4.4 POD / AIO / BORO

Keep distinct:

- open pod;
- closed/prefilled pod;
- pod-mod;
- AIO;
- Boro-compatible device;
- Boro bridge/RBA;
- cartridge/pod consumable;
- coil family;
- replacement component.

The device and its cartridge/coil ecosystem are separate entities connected by compatibility edges.

## 4.5 Clone products

Clone entity fields:

- `clone_maker`;
- `claimed_original_product_id`;
- `clone_similarity_state`;
- `clone_release_event_id`;
- `clone_revision/batch`;
- evidence supporting the claimed linkage.

Clone activity must never rewrite the lifecycle of the authentic product.

---

# 5. Canonical entity graph

Do not model the world as flat product rows.

Entities:

- Brand
- Legal manufacturer / group
- OEM/ODM
- Designer / modder
- Collaborator
- Product family
- Product model
- Variant
- Accessory
- Chipset/board
- Retail/distribution entity
- Reviewer/creator/public community source
- Event/trade show
- Regulatory submission/record
- Trademark
- Industrial design
- Domain/subdomain
- Document/manual/firmware

Relationships examples:

```text
BRAND --owns/markets--> PRODUCT
PRODUCT --variant_of--> PRODUCT_FAMILY
ACCESSORY --compatible_with--> PRODUCT
PRODUCT --uses_chipset--> CHIPSET
PRODUCT --designed_by--> DESIGNER
PRODUCT --collaboration_with--> BRAND/DESIGNER
OEM --manufactures_for--> BRAND
CLONE --claims_original--> PRODUCT
PRODUCT --presented_at--> EVENT
EVIDENCE --supports/contradicts--> EVENT_CLAIM
SOURCE --published--> EVIDENCE
SOURCE --derivative_of--> SOURCE_LINEAGE
```

A candidate may legitimately exist as `UNNAMED {brand} RTA candidate` until identity evidence is sufficient. Never invent a likely model name.

---

# 6. Event-sourced lifecycle

Evidence is immutable. Product state is a **projection** calculated from evidence/events, never the only stored truth.

Canonical event types:

```text
RUMOR
LEAK
TRADEMARK_FILED
DESIGN_FILED
DOMAIN_SIGNAL
CERTIFICATE_SIGNAL
FIRMWARE_SUPPORT
MANUAL_DISCOVERED
TEASER
PROTOTYPE
ENGINEERING_SAMPLE
PREPRODUCTION_SAMPLE
REVIEW_SAMPLE_SENT
REVIEW_SAMPLE_RECEIVED
CERTIFICATION
REGULATORY_NOTIFICATION
PRODUCTION_START
DISTRIBUTOR_LISTING
WAITLIST_OPEN
PREORDER_ANNOUNCED
PREORDER_OPEN
OFFICIAL_ANNOUNCEMENT
REVIEWER_FIRST_LOOK
FIRST_RETAIL_OBSERVATION
IN_STOCK
SHIPPING_STARTED
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

Each claim/event keeps separate timestamps:

- `observed_at` — first time HYPE saw the evidence;
- `source_published_at` — source's publication timestamp when credible;
- `claimed_event_at` — date asserted by source;
- `expected_launch_start_at` / `expected_launch_end_at`;
- `first_known_public_at`;
- `first_confirmed_at`;
- `first_sale_at`;
- `official_release_at`;
- `last_verified_at`;
- `source_timezone` and normalized UTC.

Conflicting claims are kept side by side. Projection may choose a working best estimate but must expose that conflict.

---

# 7. HYPE status ladder

Status is categorical; scores are continuous. Do not confuse them.

- **H0 — NOISE**: not sufficiently tied to an in-scope product/candidate.
- **H1 — RUMOR**: plausible single weak/anonymous/indirect signal.
- **H2 — CORROBORATED RUMOR**: 2+ genuinely independent origins or one stronger community/creator signal plus corroboration.
- **H3 — ARTIFACT SIGNAL**: concrete artifact such as trademark/design/manual/firmware/domain/certification/regulatory record, but no official launch confirmation.
- **H4 — STRONG PRE-LAUNCH**: multiple independent evidence families, sample/prototype/distributor evidence, or strong artifact combination.
- **H5 — OFFICIAL PRE-ANNOUNCEMENT**: official teaser/announcement/preorder/dated upcoming release.
- **H6 — RELEASED**: release truth gate passed.
- **H7 — MARKET VERIFIED**: release plus multi-source observed availability or official shipping/in-stock evidence.

Side states:

`DELAYED`, `CANCELLED`, `WITHDRAWN`, `RELISTING`, `BATCH_ONLY`, `VARIANT_ONLY`, `CLONE`, `CONFLICTED`.

Weak rumors belong in HYPE, but H1/H2 must be visibly labeled as such.

---

# 8. Independent scoring engines

Never collapse all uncertainty into one “confidence” number.

Each dossier exposes:

1. **Evidence Confidence (EC)** — how strong/authentic the evidence is.
2. **Identity Confidence (IC)** — confidence that evidence refers to this exact product.
3. **Date Confidence (DC)** — confidence in the date/interval interpretation.
4. **Launch Probability (LP)** — probability that the candidate will actually reach market in the forecast interval.
5. **Novelty Confidence (NC)** — confidence it is genuinely new, not relisting/restock/batch/variant.
6. **Hype Momentum (HM)** — current volume/velocity of public attention; this is not proof.
7. **Coverage Confidence (CC)** — how complete/fresh HYPE's relevant source coverage is for this product/brand/region.

A real trademark can produce **high EC** and **low/medium LP**. A widely repeated rumor can have high HM and low EC. These distinctions are required.

Suggested transparent evidence score:

```text
EC_raw = 100 * (
  0.24 * source_reliability
+ 0.18 * directness
+ 0.16 * artifact_strength
+ 0.12 * temporal_precision
+ 0.14 * identity_certainty
+ 0.08 * freshness
+ 0.08 * provenance_integrity
)

EC = clamp(EC_raw - conflict_penalty - derivative_penalty - marketing_penalty, 0, 100)
```

Weights are versioned configuration, not hardcoded truth. Every score run stores `scoring_version` and a human-readable explanation.

## 8.1 Source priors — indicative, not absolute

Examples:

- manufacturer official announcement/product documentation: very high directness;
- public regulatory/IP record: very high authenticity for the record, but only moderate launch implication;
- named direct distributor/wholesaler: medium-high;
- established reviewer showing/receiving a sample: medium-high;
- independent specialist press: medium;
- known community contributor with history: medium;
- anonymous forum/social leak: low;
- search-index snippet fallback: low-medium;
- retailer “new arrival” without historical context: low for release dating.

Source prior must be calibrated from retrospective performance over time.

---

# 9. Evidence independence and lineage — mandatory

Raw URL count is not corroboration.

Create a `source_lineage` / `evidence_origin_cluster` layer using:

- canonical URL/redirect chain;
- source author/account identity when public and necessary;
- publication order;
- press-release identifiers;
- high text similarity (SimHash/MinHash/embeddings where appropriate);
- identical or near-identical image perceptual hashes;
- identical video thumbnail/media fingerprints;
- common distributor feeds/affiliate catalogs;
- copied product descriptions/SKUs;
- explicit citation/repost relationships.

Rules:

- strongest direct evidence in a lineage gets full contribution;
- obvious derivatives get little or no independence bonus;
- “independent source count” shown in UI means **independent origin clusters**, not pages/domains;
- a derivative can still be useful for geography, date, availability or preservation, but not as fake corroboration.

---

# 10. Release truth gates

A product enters H6 RELEASED only when at least one acceptable path is passed.

## Gate A — official release

- official source explicitly states release/availability/shipping; and
- exact product identity resolved; and
- date claim is credible and within the recent-release window.

## Gate B — official product + historical first-seen

- official product page exists;
- historical source memory proves it was not present before the candidate period, or official publication metadata is reliable;
- no prior-existence contradiction.

## Gate C — corroborated market appearance

- two or more **independent origin** retailer/distributor sources with dated direct product evidence;
- no product presence before the active period in history/archive/known catalog memory;
- identity is exact;
- evidence indicates actual availability/shipping rather than merely a preorder placeholder.

## Gate D — regulatory plus market evidence

Regulatory record alone is not a release. It can strengthen Gate A/B/C when linked to exact product identity.

### Always reject/demote as launch proof

- “new arrival” badge alone;
- `dateModified` alone;
- search snippet alone;
- price page alone;
- restock;
- old product newly crawled;
- affiliate mirror;
- batch with no model revision;
- new color/material only;
- “ETA” whose date simply passed;
- clone listing as proof of original release.

---

# 11. Source Registry vNext

A finite URL list is only a seed. Every source is a managed object with lifecycle:

```text
CANDIDATE -> QUARANTINED -> ACTIVE -> DEGRADED -> DISABLED/RETIRED
```

Required fields:

```text
source_id
canonical_name
source_family
source_type
entity_owner_id
regions[]
languages[]
categories[]
base_url / account_id / registry_id
access_adapter
access_policy
robots_status
terms_status
requires_api_key
requires_authorized_account
crawl_cadence
priority
discovery_only
truth_eligible
source_prior
lineage_group_hint
last_success_at
last_change_at
failure_rate_30d
yield_30d
drift_state
notes
```

A source may be useful for discovery while being forbidden from truth escalation.

“Global” is assessed by coverage metrics, not by counting makers.

---

# 12. Source Discovery Engine

HYPE must discover where to look next.

Discovery inputs:

1. all canonical brands/products already in `market-2026` / product-presence data;
2. all brands in the POD universe;
3. official maker and active-maker registries;
4. brand facets and manufacturer labels from monitored retailers;
5. new exhibitors from trade-show directories/floorplans/award lists;
6. links and `sameAs` metadata from official websites;
7. designer/collaborator/OEM names from official product pages;
8. named reviewers who repeatedly receive samples before launch;
9. IP owner/applicant names;
10. regulatory submitter/manufacturer/importer names;
11. newly observed domains/subdomains strongly tied to a known brand;
12. new source domains repeatedly cited by trusted communities/press;
13. clone maker/seller aliases;
14. public newsletter sender domains subscribed to by an authorized HYPE mailbox.

Admission procedure:

```text
DISCOVER -> normalize -> entity-match -> policy-check -> source-quality sample
-> quarantine -> compare yield/noise -> approve active OR reject/retire
```

No newly found site becomes decision-eligible automatically.

---

# 13. Multilingual Query Factory

Do not maintain a small fixed list of English queries and do not use a fixed `slice(0,N)` as the global strategy.

Generate queries from:

```text
brand aliases
× product-type terms
× signal terms
× language
× source/site family
× region
```

Minimum language packs:

- English
- Romanian
- German
- French
- Italian
- Spanish
- Polish
- Czech/Slovak
- Dutch
- Portuguese
- Greek
- Turkish
- Russian/Ukrainian where public/legal sources are relevant
- Simplified/Traditional Chinese
- Japanese
- Korean
- Indonesian/Malay
- Thai
- Vietnamese

Each pack contains equivalent concepts, not literal machine translations only:

`rumor`, `leak`, `teaser`, `prototype`, `sample`, `pre-production`, `coming soon`, `preorder`, `launch`, `release`, `batch`, `shipping`, `manual`, `firmware`, `certification`, `trademark`, `design`, `review sample`, `first look`.

Original text is preserved. Brand/model/SKU strings are never translated. Machine translation may produce a normalized Romanian/English summary but must not replace the source evidence.

## 13.1 Adaptive query budget

Allocate search budget by:

- brand activity recency;
- source yield;
- unresolved candidates;
- approaching forecast dates;
- event/trade-show periods;
- score transitions;
- category coverage gaps;
- source failure/degradation.

High-yield direct sources should be checked directly before paying for generic search.

---

# 14. Ingestion adapter hierarchy

Prefer deterministic/direct access before generic web search.

Order of preference:

1. official API/feed where available and terms permit;
2. RSS/Atom;
3. sitemap/sitemap-index diff;
4. public product/news/manual/download index;
5. normal HTTP page fetch with conditional requests;
6. structured data (JSON-LD, OpenGraph, canonical, hreflang);
7. public CMS endpoints intentionally exposed for the website;
8. official platform API/search;
9. external web/news search provider;
10. web archive/Common Crawl/infrastructure discovery;
11. low-confidence search-snippet fallback.

HTTP collectors should use:

- ETag / `If-None-Match`;
- Last-Modified / `If-Modified-Since`;
- normalized content hash;
- bounded concurrency;
- exponential backoff + jitter;
- per-host rate budgets;
- cache and retry classifications;
- content-type/size limits;
- parser versioning;
- source drift detection.

Never bypass authentication, paywalls, anti-bot controls or private-group restrictions.

---

# 15. Website change intelligence

For maker/distributor sources store a compact structural snapshot:

- URL set/sitemap entries;
- title/canonical;
- product name/SKU;
- JSON-LD product state;
- public availability state;
- selected signal phrases;
- manual/download filenames;
- image fingerprints;
- product family/collection membership.

Generate semantic deltas such as:

- `NEW_URL`;
- `NEW_PRODUCT_ENTITY`;
- `COMING_SOON -> PREORDER`;
- `PREORDER -> IN_STOCK`;
- `MANUAL_ADDED`;
- `FIRMWARE_MODEL_ADDED`;
- `PRODUCT_REMOVED`;
- `ETA_CHANGED`;
- `TITLE_RENAMED`;
- `ACCESSORY_APPEARED_BEFORE_PARENT`.

A page change is evidence, not automatically a lifecycle promotion.

---

# 16. Documents, firmware and media

## 16.1 Documents

Watch public:

- manuals;
- support PDFs;
- quick-start guides;
- compatibility charts;
- firmware release notes;
- downloadable product catalogs;
- trade-show PDFs;
- public regulatory/IP records.

Extract metadata and product strings; preserve source URL, hash, retrieval timestamp and only the minimum excerpt required for evidence.

## 16.2 Images

Use image fingerprints to correlate leaks/copies:

- SHA-256 exact hash;
- perceptual hash (pHash/dHash);
- dimensions;
- source/first-seen time;
- optional model/logo text extraction when legally/technically appropriate.

Image similarity is corroborative identity/lineage evidence, not launch proof by itself.

## 16.3 Video

Prefer official platform metadata/captions where API and terms permit. Extract titles, descriptions, channel/account identity, publish time, declared product name and links. Do not build HYPE around unauthorized video downloading.

---

# 17. Regulatory and IP intelligence

Regulatory/IP sources are an additional early-warning/artifact layer, not complete market coverage.

Important distinction: different jurisdictions publish at different lifecycle points. Example: some EU national lists may expose records only after legal waiting periods; other databases may publish soon after notification. Store jurisdiction-specific semantics in the source adapter.

Every regulatory/IP evidence item must state **what the record proves and what it does not prove**.

Examples of facts to encode:

- EU-CEG/TPD: relevant electronic cigarette/refill products are notified before intended market placement under applicable rules; scope must be evaluated per product type.
- UK MHRA: public ECIG records can expose product identifiers, submitter/brand/type/published date.
- national EU lists/databases: Romania, Italy, Poland, Belgium, France and others as technically/publicly available.
- New Zealand Notified Products Register: device/component notifications can be a useful product artifact.
- US FDA public databases: useful primarily for legal-market/registered-listing confirmation, not for confidential pending application discovery.
- WIPO/EUIPO/national IP offices: trademark/design filings can reveal names/designs but are not launch confirmation.

Use national/regional IP registers in addition to WIPO aggregation where useful because no aggregator guarantees every collection.

---

# 18. Web-infrastructure signals

These are **weak-to-medium artifacts**, useful when strongly tied to a known brand.

Possible public signals:

- RDAP registration metadata;
- newly issued public TLS certificates / Certificate Transparency entries;
- new product subdomain;
- public DNS changes;
- newly crawled URLs in Common Crawl;
- archived public pages;
- public search-index appearance.

Rules:

- generic new domain ≠ product;
- certificate/domain signal cannot promote beyond artifact level without product/brand identity evidence;
- do not infer private registrant data;
- preserve first-seen and exact linkage reasoning.

---

# 19. Social/community intelligence

Include public or explicitly authorized sources only.

Families:

- Reddit;
- specialist forums;
- YouTube reviewers;
- X public search/accounts;
- manufacturer/public creator Instagram/Facebook/TikTok pages where access method is permitted;
- public Telegram channels;
- Discord channels only when a bot/account is explicitly authorized for those channels;
- Mastodon/public federated posts;
- regional platforms such as public/indexable Weibo/Bilibili/Xiaohongshu/Douyin content only through permitted access paths.

Community evidence stores minimum necessary author/account identity. Do not build unnecessary personal profiles. Account continuity/reputation can be represented through privacy-minimized stable identifiers when needed for source calibration.

---

# 20. Trade-show intelligence

Trade shows often reveal hardware before normal retail listing.

Monitor:

- official event home/news;
- exhibitor directory;
- booth/floorplan;
- “new products” / innovation / awards pages;
- press kits;
- public event social posts;
- exhibitor announcements referring to booth/date;
- post-event review recaps.

Event dates themselves are versioned evidence because schedules can change. Prefer the newest authoritative event notice and retain superseded dates for auditability.

Event exhibitor lists also feed Source Discovery: a new relevant exhibitor becomes a quarantined maker/source candidate.

---

# 21. OEM/ODM, B2B and supply-chain signals

Use as discovery/lead indicators, not standalone confirmation.

Potential families, subject to access/terms:

- public OEM/ODM manufacturer catalogs;
- Alibaba/1688/Made-in-China/Global Sources/HKTDC listings;
- public wholesale catalogs;
- public import/shipping intelligence;
- packaging/component makers;
- chipset/board vendor compatibility lists.

Detect white-label/rebrand risk using image similarity, dimensions, copy similarity and identical model/SKU patterns. A white-label hypothesis remains a hypothesis until corroborated.

---

# 22. Search provider architecture

Current Bing-RSS-style discovery must not remain a single point of failure.

Create provider interface:

```text
SearchProvider.search({query, country, language, freshness, type})
SearchProvider.news(...)
SearchProvider.health()
SearchProvider.cost()
```

Recommended strategy:

- direct-source adapters first;
- **Brave Search API** as a primary general web/news search option where budget permits;
- additional providers may be configured behind the interface;
- existing Bing RSS behavior may survive only as a low-confidence fallback while it continues to work; do not treat it as an official supported Bing Search API;
- do not architect new critical functionality around retired Bing Search APIs;
- do not assume Google Custom Search availability for a new deployment; provider must be swappable.

Search-result snippets are discovery evidence unless the upstream page can be resolved or the snippet itself contains an explicit product/date claim and passes the low-confidence fallback gate.

---

# 23. Storage architecture

The current static JSON/GitHub Pages approach remains useful as a publication layer but should not be the canonical long-term event store.

## 23.1 Recommended architecture

- **Cloudflare D1** — structured entities, immutable evidence metadata, events, claims, scores, source registry.
- **Cloudflare R2** — optional permitted raw snapshots/artifacts/media fingerprints; prefer hashes + minimal excerpts when full retention is unnecessary.
- **Cloudflare KV** — cursors, locks, per-source cache, last-run, throttles, lightweight health state.
- **Cloudflare Queues + Workers/Cron** — source-family fan-out, retries, asynchronous scanning.
- **GitHub Actions** — builds, validation, nightly benchmark/backtest, compact snapshot generation, deployment and QA; not the entire crawler monolith.
- **GitHub Pages/static files** — compact read-optimized HYPE projections/fallback for the existing site.

## 23.2 Suggested relational tables

```text
brands
brand_aliases
entities
entity_relationships
products
product_aliases
product_variants
product_identifiers
compatibility_edges
sources
source_endpoints
source_policies
source_health
scan_runs
scan_tasks
queries
evidence
evidence_features
evidence_lineage
media_fingerprints
events
event_claims
event_evidence
score_runs
manual_reviews
suppression_rules
watchlists
alerts
coverage_snapshots
```

Evidence rows are append-only except for explicit correction/tombstone metadata. Product projection can be rebuilt from evidence.

---

# 24. Orchestration and scheduling

The existing 75-minute sequential GitHub Action is a scaling ceiling.

Target flow:

```text
SCHEDULER
  -> source planner
  -> queues by source family/host
  -> collectors (parallel, bounded)
  -> normalize
  -> evidence store
  -> entity resolver
  -> lineage resolver
  -> event/claim builder
  -> scoring
  -> projection builder
  -> truth gates
  -> publication snapshot
  -> QA + observability
```

Cadence should be source-driven:

- high-value official maker/social/news: 1–3h if terms/cost allow;
- official sitemaps/manual/firmware: 3–6h;
- high-yield retailers/distributors: 3–6h;
- search/web discovery: 6–24h depending budget;
- regulatory/IP: daily/weekly depending publication behavior;
- event directories: daily around events, weekly otherwise;
- deep archival/Common Crawl: weekly/monthly;
- source discovery/recalibration: daily/weekly.

Manual refresh should enqueue a high-priority incremental scan, not synchronously run every global collector.

---

# 25. Entity resolution

Resolution must be explainable and conservative.

Features:

- normalized brand aliases;
- exact model tokens;
- product family;
- SKU/GTIN/EAN/UPC;
- dimensions/spec fingerprint;
- chipset;
- source-linked brand context;
- image similarity;
- accessory compatibility text;
- collaboration/designer names;
- edit distance only as supporting feature.

Hard rule: do not merge solely because names are similar.

Store merge/split decisions and confidence. Manual corrections become durable canonical rules with provenance, not ad-hoc regex patches scattered through collectors.

---

# 26. Novelty engine

Determine whether a detected event is truly new using:

- 730-day known history;
- first-seen sitemap/catalog data;
- prior HYPE candidates;
- archive/Common Crawl evidence;
- existing `market-2026` catalog presence;
- product-family version sequence;
- SKU/model code;
- official revision wording;
- image/spec comparison;
- batch/variant language.

Outputs:

`NEW_MODEL`, `NEW_REVISION`, `NEW_VARIANT`, `NEW_ACCESSORY`, `NEW_REGION`, `RESTOCK`, `RELISTING`, `BATCH`, `UNKNOWN`.

Only appropriate novelty classes qualify for RELEASED as “new products”.

---

# 27. Hype Momentum — separate from truth

Momentum can use public aggregate signals where terms and data quality permit:

- mention count by independent origin;
- unique public communities/source families;
- change in mention velocity;
- waitlist/preorder language frequency;
- review/first-look emergence;
- search/news burst;
- region spread.

Never infer distinct people when identities are unavailable. Never present momentum as sales volume or market share.

---

# 28. Procurement / BUY_HYPE separation

Current HYPE contains business-oriented `BUY_HYPE/PREPARE/WATCH` logic. Preserve it only as an **optional downstream decision layer**.

Architecture:

```text
Evidence -> Product Intelligence -> Truth/Probability
                              \-> optional Commercial Decision Engine
```

Commercial decision output must never promote a rumor to confirmed or modify the underlying event confidence. The public intelligence layer should remain useful even if all procurement logic is disabled.

---

# 29. Front-end HYPE vNext

Preserve the current site's visual language and progressively upgrade it.

## 29.1 Top-level controls

- RELEASED
- RADAR
- RUMORS
- POD/AIO/BORO switch/filter
- RTA / MOD / ACCESSORY / POD filters
- region
- time
- confidence/status
- brand
- sort by newest signal / launch probability / momentum / confidence.

## 29.2 Product dossier card

Always show:

- product/candidate name;
- brand;
- category/subtype;
- current H-stage;
- first signal date;
- latest material change;
- expected launch interval, if any;
- EC / IC / DC / LP / NC / HM / CC;
- independent origin count;
- source-family diversity;
- explicit “Rumor / Not confirmed” text where applicable;
- reason the score/status changed.

Expandable timeline:

```text
Aug 02 — RUMOR — forum origin #1
Aug 05 — DESIGN FILED — official registry
Aug 12 — PROTOTYPE — creator photo
Aug 20 — REVIEW SAMPLE RECEIVED
Aug 27 — OFFICIAL TEASER
Sep 15–30 — estimated release interval
```

Evidence drawer shows all relevant evidence, not only the first source.

## 29.3 Corrections and contradictions

Show:

- contradicting date/source;
- corrected product identity;
- delayed/cancelled state;
- change log.

This is essential for trust.

---

# 30. Coverage model — how HYPE may say “global”

Never claim 100% of the internet.

Measure a weighted Coverage Confidence matrix:

```text
Source family × Region × Language × Category × Freshness
```

Regions at minimum:

- Romania;
- EU/EEA aggregate + key country clusters;
- UK;
- North America;
- China/HK;
- Japan/Korea;
- Southeast Asia;
- other monitored regions.

Source-family dimensions:

- manufacturer first-party;
- social/creator;
- forums/community;
- news/media;
- retail/distribution;
- clone;
- trade-show;
- regulatory;
- IP;
- web infrastructure/archive;
- OEM/B2B.

Coverage dashboard examples:

```text
Manufacturer official   94% fresh
Retail/distribution     91% fresh
Community               72% fresh
Regulatory              68% jurisdiction-weighted
IP                      75% key offices
China public social     42% — known blind spot
Private Discord         NOT COVERED unless authorized
```

“Global” means broad monitored scope with disclosed confidence and blind spots, never omniscience.

---

# 31. Observability and intelligence KPIs

System-health metrics:

- active/degraded/failed sources;
- scan success by adapter;
- median/95th percentile source freshness;
- queue lag;
- parser drift;
- query/API spend;
- snapshot age;
- publication latency.

Intelligence-quality metrics:

- evidence yield / 100 queries;
- duplicate/lineage collapse ratio;
- false-positive rate;
- RELEASED precision;
- retrospective recall proxy against known launches;
- median lead time: first HYPE signal → official announcement/release;
- launch-date interval error;
- identity merge error;
- rumor resolution rate (released/cancelled/stale);
- source prior calibration accuracy;
- category/region/language coverage.

---

# 32. QA / adversarial benchmark suite

Mandatory fixtures:

1. old product relisted yesterday → not RELEASED;
2. old product receives new color → VARIANT_ONLY;
3. second batch → BATCH_ONLY;
4. ten sites copy one release → one independent origin;
5. trademark filed, never launched → H3 then stale, not H6;
6. official teaser without name → unnamed candidate, no invented name;
7. two similarly named models → not merged;
8. spelling aliases of same exact model → merged;
9. UK release then EU release → two regional events;
10. clone appears before/after authentic product → separate lifecycle;
11. ETA passes without proof → delayed/stale, not RELEASED;
12. retailer page has new `dateModified` → not a new launch;
13. search snippet has exact ETA but upstream is blocked → low-confidence fallback only;
14. source disappears after evidence captured → evidence retained, source health degraded;
15. two credible sources conflict on launch date → conflict exposed;
16. accessory page appears before parent product → candidate signal, not fake parent release;
17. creator cross-posts identical leak to 3 networks → one lineage;
18. press release syndicated to 20 publications → one primary origin + derivatives;
19. CMS renames URL → preserve identity;
20. product is already in 2-year known history → novelty demoted;
21. page language unsupported → detection routes to translation/unknown rather than rejection;
22. DST transition Europe/Bucharest → correct scan/reference windows;
23. stale HYPE publication data → UI shows stale/degraded;
24. private/login-only source → collector refuses unless authorized;
25. source ToS/robots policy changes → source policy gate blocks/flags as configured.

Build retrospective gold sets from known 2025/2026 launches and deliberate non-launch/relisting cases.

---

# 33. Compliance / responsible collection

HYPE uses public data and authorized integrations only.

Rules:

- obey platform API/terms/robots/rate limits as applicable;
- no login bypass;
- no CAPTCHA/anti-bot circumvention;
- no scraping of private groups/channels;
- private/closed communities require explicit authorized access;
- minimize personal data from community users;
- do not republish full copyrighted articles/photos/videos;
- store source link, metadata, hashes and only the minimum evidence excerpt needed;
- version source-access policies;
- secrets live only in secret stores, never static frontend/Git;
- all manual overrides are audited.

Each adapter has `access_policy` and a kill switch.

---

# 34. Cost architecture

## Tier 0 — mostly free/open

- direct maker sites;
- sitemaps/RSS;
- official regulatory/IP registers where public;
- Common Crawl;
- RDAP/Certificate Transparency;
- event directories;
- public forums/pages;
- existing GitHub infrastructure.

## Tier 1 — recommended operational spend

- general search API such as Brave Search;
- Cloudflare D1/R2/Queues/Workers as volume grows;
- permitted social APIs;
- translation/transcription only when needed.

## Tier 2 — optional intelligence

- commercial shipment/import datasets;
- premium media/social/search feeds;
- commercial IP enrichment.

A budget scheduler tracks cost per useful evidence item and automatically reduces low-yield generic searches before cutting high-value direct monitoring.

---

# 35. Audit of the current HYPE implementation

## Keep

- existing `ghid-rta.ro` integration and visual shell;
- 18+ site gate;
- GitHub Pages publication compatibility;
- current product canonicalization concepts;
- prior-history/anti-relisting philosophy;
- truth rules such as `new arrival != release`;
- source host validation;
- existing direct catalog/vendor collectors that remain healthy;
- category collectors where robust;
- source links;
- manual refresh UX concept;
- GitHub quality workflows;
- Cloudflare worker integration concept;
- existing RTA/MOD/POD datasets as migration inputs.

## Refactor

- `market-hype-sources-2026.json` → Source Registry vNext with policy/health/coverage;
- flat product/radar output → event/evidence graph + read projections;
- current consolidator → **non-destructive projection builder**;
- fixed query generation → multilingual Query Factory and adaptive budgets;
- source count → evidence origin lineage;
- confidence tier → multi-score model;
- “BUY_HYPE” → optional downstream decision engine;
- global sequential Action → family/source queues or at least parallel matrix jobs;
- refresh worker → enqueue incremental priority scan;
- UI first-source link → full evidence timeline/drawer.

## Deprecate / remove as canonical assumptions

- fixed `q.slice(0,150)` as a global coverage mechanism;
- a small minimum maker/forum count as proof of “GLOBAL”;
- one symmetric ±30-day window for both signals and future launches;
- destructive lifecycle compression to one dominant product event;
- raw unique `sourceType` count as true corroboration;
- Bing RSS as primary global discovery dependency;
- committing indefinitely growing raw evidence/history JSON to Git;
- any inference that a commercial action score proves product truth.

---

# 36. Migration strategy — no big-bang rewrite

## Phase 0 — freeze and benchmark

- snapshot current HYPE behavior/data;
- create gold-set cases from current valid products + known false positives;
- capture current UI screenshots/contract expectations;
- establish baseline precision, freshness and run time.

## Phase 1 — schema vNext beside current schema

- Source Registry vNext;
- Evidence/Event schemas;
- scoring version schema;
- compatibility projection that emits current JSON format.

No visible UI cutover yet.

## Phase 2 — lineage + lifecycle

- immutable evidence;
- origin clustering;
- event timeline;
- non-destructive product projection;
- 730-day novelty/history engine.

## Phase 3 — discovery and search modernization

- provider abstraction;
- Brave/general provider optional configuration;
- remove fixed global query cap;
- multilingual Query Factory;
- source candidate/quarantine workflow.

## Phase 4 — high-value new source families

Implement first:

1. official website/sitemap/manual/firmware diff;
2. regulatory records;
3. IP records;
4. trade-show/exhibitor feeds;
5. creator/reviewer signals;
6. infrastructure/archive signals;
7. expanded OEM/B2B as discovery-only.

## Phase 5 — orchestration/storage evolution

- D1 schema;
- queues/workers;
- family fan-out;
- compact Git snapshot adapter.

Can be delayed if current volume is manageable, but schemas should be designed for it from day one.

## Phase 6 — scoring + dossiers

- EC/IC/DC/LP/NC/HM/CC;
- explanations;
- contradiction handling;
- score transition history.

## Phase 7 — UI vNext in shadow mode

New component reads vNext projection while old view remains available behind flag.

## Phase 8 — backtest and cutover

Cut over only after acceptance gates pass.

---

# 37. Acceptance gates before production cutover

Functional:

- RTA, MOD, RTA-specific ACCESSORY, POD/AIO/BORO all work;
- authentic + clone lifecycle supported;
- rumors are visible with explicit uncertainty;
- signals observed in last 30d remain visible even if estimated release >30d;
- recent releases remain strictly 30d;
- all events preserve source provenance;
- regional release separation works;
- full timeline is inspectable;
- watchlist changes are deterministic.

Truth:

- no known test relisting becomes RELEASED;
- one copied story cannot become multi-source corroboration;
- stale ETA never auto-releases;
- first-seen date never masquerades as exact release date;
- unnamed candidate never gets a fabricated name;
- regulatory/IP evidence is semantically constrained;
- clone/original identities never collapse.

Quality targets for the first production threshold:

- **RELEASED precision ≥95%** on curated retrospective gold set;
- **false positive rate <2%** in manual sample of H6/H7 items;
- 100% of H4–H7 public dossier claims have traceable evidence metadata;
- 100% of score changes are attributable to a stored evidence or policy event;
- stale/degraded source state visible;
- frontend mobile/desktop regression tests pass;
- compatibility snapshot remains available during migration.

Recall for rumors cannot be measured against “all internet rumors”; measure instead by retrospective known-launch capture rate and lead time.

---

# 38. Definition of “maximum possible”

HYPE is at maximum practical quality when:

1. every important **source family** is represented;
2. the source universe can **discover and admit new sources** without code rewrites;
3. regions/languages/categories are measured and blind spots disclosed;
4. evidence is event-sourced and preserved;
5. independent corroboration is based on origin lineage, not page count;
6. every lifecycle claim is truth-gated;
7. weak rumors are included but unmistakably labeled;
8. longer-horizon future signals are not thrown away by the 30-day UI window;
9. release precision is continuously backtested;
10. the system degrades safely when APIs/sites fail;
11. cost and crawl intensity are adaptive;
12. no private/unauthorized source access is required for the core product;
13. the existing ghid-rta.ro implementation is migrated without losing working capabilities.

There is no honest architecture that can promise “100% of all possible rumors on the internet”, because private groups, deleted posts and undisclosed prototypes exist. The correct maximum is a **self-expanding, measurable, auditable public-source intelligence network** whose blind spots are explicit.

---

# 39. Canonical implementation rule for Codex

When implementation begins, Codex must treat this file and the companion Source Map/Data Model/Acceptance documents as the governing specification.

Before changing production code it must:

1. inventory all current HYPE files/workflows/readers;
2. identify compatibility contracts;
3. create migration adapters/tests first;
4. implement vNext in additive/shadow mode;
5. produce diffs and QA evidence;
6. avoid hard-coded product-specific fixes when a generic rule is possible;
7. never weaken current anti-relisting/truth gates merely to increase result counts;
8. never claim broader coverage than measured;
9. keep current live HYPE working until vNext passes cutover gates.

**End of canonical blueprint.**
