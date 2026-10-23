# ANALIZA ROMÂNIA vNext — Maximum Source Map

**Status:** CANONICAL COMPANION SPEC — v1.0  
**Date:** 2026-09-01  
**Scope:** Romanian observable vape-hardware market intelligence for RTA, MOD, POD/AIO/BORO and linked consumable/accessory ecosystems.

---

# 0. Source-map principle

ANALIZA must not call a fixed store list “Romania”. Coverage has two layers:

1. **curated Romanian seed universe**;
2. **continuous retailer/source discovery and periodic national-universe certification**.

Every source has a semantic role. A source can be useful for price but useless for sales truth; useful for seller discovery but excluded from the national storefront denominator; useful for demand but not commercial sell-through.

Canonical roles:

- `TIER_A_SALES`
- `TIER_B_RANKING`
- `TIER_C_DEMAND`
- `TIER_D_ASSORTMENT_PRICE_STOCK`
- `TIER_E_STRUCTURAL_CONTEXT`
- `DISCOVERY_ONLY`
- `COVERAGE_ONLY`

---

# 1. Core source-family matrix

| Family | Romanian value | Truth role | Typical cadence |
|---|---|---|---|
| Local consumer storefront direct | listing, stock, price, products | D; A/B if explicit | daily / 3–12h where justified |
| Retailer bestseller/popularity | commercial ranking | B | daily |
| Explicit public sales counters | merchant-specific units | A | daily |
| Product review/view/wishlist counters | behavioral proxy | C | daily |
| Price-comparison engines | seller discovery, price, stock claim | D/discovery | daily |
| Marketplace surfaces | demand/availability context | C/D separate | daily/weekly |
| Google Ads Keyword Planner | Romania search volume | C | monthly |
| Google Trends official API | search-interest trend by RO/subregion | C | daily/weekly if access |
| First-party ghid-rta metrics | intent/search behavior | C | daily |
| Romanian public communities | interest/questions/mentions | C | daily |
| Romania-relevant video/social | interest/mentions | C | daily |
| Manufacturer dealer locators | retailer discovery | discovery | weekly |
| Public business/legal identity | operator resolution | structural | weekly/monthly |
| Ministry of Health RO-ECigarette | product/submitter regulatory artifact | E | on update |
| Advertising transparency | marketing intensity | C/E | daily/weekly |
| Newsletters/promotions | promotion/arrival signals | C/D | event-driven |
| Eurostat/official trade data | aggregate import context if classification valid | E | monthly |
| HYPE Global Intelligence | global product emergence context | context only | daily |

---

# 2. Canonical local-storefront seed universe

Preserve and re-audit at least the current registry. These are **seed candidates for the Romanian local storefront universe**, not a permanent completeness claim:

1. Smokee — `smokee.ro`
2. Vaperia — `vaperia.ro`
3. VapePoint — `vapepoint.ro`
4. Vapetronic — `vapetronic.ro`
5. SmokeMania — `smokemania.ro`
6. Vapez — `vapez.ro`
7. JustVape — `justvape.ro`
8. e-Potion — `e-potion.ro`
9. Noua Tigara Electronica — `nouatigaraelectronica.ro`
10. Voore — `voore.ro`
11. Vaper's Paradise — `vapersparadise.ro`
12. Vicii Shop — `vicii-shop.ro`
13. TigaraEgo — `tigaraego.com` when validated as Romania consumer storefront
14. Geekvape.ro — `geekvape.ro`
15. VAPS — `vaps.ro`
16. Vapshop.ro — `vapshop.ro`
17. SteamFactory — `steamfactory.ro`
18. Ecig Vapo — `ecig-vapo.com` when validated as Romania consumer storefront
19. Merlin.ro — `merlin.ro`
20. Vape.ro — `vape.ro`
21. AlphaVape — `alphavape.ro`
22. SmartVape — `smartvape.ro`

The source registry must also preserve retired/historical stores and previously rejected candidates for change detection and to avoid rediscovering the same dead domains forever.

---

# 3. New Romanian storefront discovery — maximum practical routes

Run multiple independent discovery routes.

## 3.1 Search query families

Romanian terms, with category permutations:

- `magazin vape`
- `vape shop romania`
- `tigari electronice magazin`
- `țigări electronice magazin`
- `atomizor RTA magazin`
- `RTA Romania`
- `RBA Romania`
- `pod kit Romania`
- `pod system Romania`
- `cartus pod Romania`
- `cartuș pod Romania`
- `rezistente pod Romania`
- `mod vape Romania`
- `Boro AIO Romania`
- maker/brand + `Romania`, `magazin`, `distribuitor`, `dealer`.

Search by city only for discovery, not for national weighting:

- București
- Cluj-Napoca
- Timișoara
- Iași
- Constanța
- Brașov
- Craiova
- Oradea
- Sibiu
- Ploiești
- other county seats and large urban areas.

## 3.2 Manufacturer dealer locators

For major RTA/MOD/POD makers, periodically discover Romanian dealer/distributor links. A dealer locator can reveal storefronts missing from general search.

## 3.3 Price comparison seller lists

Extract candidate sellers from validated public comparison engines, then resolve direct storefront and operator identity before admission.

## 3.4 Backlink / outbound-link discovery

Sources:

- maker authorized dealer pages;
- distributor pages;
- Romanian community resource pages;
- retailer partner/brand pages;
- event/sponsor pages.

## 3.5 Public business/social presence discovery

Use permitted search/discovery surfaces to identify stores that have active Romanian social/business pages but weak web indexing. Direct storefront validation is still required before inclusion in the core denominator.

---

# 4. Storefront admission policy

A candidate becomes `ACTIVE_LOCAL_STOREFRONT` only if:

- it is consumer-facing;
- it serves Romanian consumers;
- it has a stable public commerce identity;
- it offers in-scope vape hardware or linked replacement ecosystem;
- it is not editorial-only;
- it is not B2B-only;
- it is not merely a marketplace search page;
- access is public/policy-compatible;
- operator/storefront identity can be resolved sufficiently for deduplication.

Separate states:

```text
DISCOVERED
VALIDATING
QUARANTINED
ACTIVE_LOCAL_STOREFRONT
CROSS_BORDER_TO_RO
MARKETPLACE_ONLY
B2B_ONLY
EDITORIAL_ONLY
INACTIVE
RETIRED
REJECTED
```

Cross-border stores shipping to Romania are context, not local-storefront denominator, unless the project later explicitly defines a broader Romania-available market.

---

# 5. Storefront direct endpoint discovery

For every active storefront, attempt to discover:

- homepage;
- category navigation;
- RTA/RBA/RDTA categories;
- MOD categories;
- POD/system/kit categories;
- AIO/Boro categories;
- cartridge/replacement-pod categories;
- coil/resistance categories;
- product-specific accessories;
- site search;
- sitemap index/product sitemaps;
- RSS/Atom;
- public WordPress/WooCommerce Store API when intentionally exposed;
- public Shopify storefront product/collection endpoints when appropriate;
- JSON-LD Product/Offer;
- OpenGraph/canonical;
- structured stock/availability;
- bestseller/popularity surfaces;
- public review/view/wishlist counters;
- public promotion pages;
- `new arrivals` only as assortment-change evidence.

Direct source always outranks a comparison-engine mirror for stock/price truth.

---

# 6. Ranking/bestseller seed sources

Preserve current configured/directly discovered ranking surfaces, including known current examples such as:

- VapePoint retailer-labelled `cele mai vândute` surface;
- Vapetronic bestseller/top-5 and category filters;
- SmokeMania best-seller pages including category-specific pages;
- VAPS category sort labelled `cele mai vândute` where semantics remain valid;
- Merlin bestseller widget/surface where semantics remain valid;
- any dynamically discovered retailer-labelled ranking that passes semantic validation.

Every ranking adapter requires a semantic contract. If a site changes `popular` to mean views, recency or editorial order, the source must be reclassified instead of silently continuing as Tier B.

---

# 7. POD category/source expansion per retailer

Every active retailer must explicitly be scanned for:

- `pod`;
- `pod kit`;
- `pod system`;
- `kit tigara electronica` / `kit țigară electronică`;
- `AIO`;
- `Boro`;
- `cartus` / `cartuș`;
- `cartridge`;
- `rezistenta` / `rezistență`;
- `coil`;
- major platform/series names from the POD registry.

Do not assume a retailer with no explicit `pod` URL has no PODs; use site search, sitemap and product classification.

---

# 8. Price comparison engines

## 8.1 Compari.ro

Validated as a current public source capable of exposing product offer/seller/price/stock claims for relevant vape-device products.

Use for:

- seller discovery;
- offer-count breadth;
- public price observations;
- product aliases;
- cross-checking direct retailer state.

Do not treat the comparison page as another retailer.

## 8.2 Price.ro

Validated as a current public comparison source exposing relevant vape-product offer and seller information.

Same semantic constraints as Compari.

## 8.3 Other engines

Activate only after current public relevance, product coverage and access policy are validated.

---

# 9. Marketplace layer — separate from core retail denominator

Potential Romanian marketplace/public classifieds or large marketplace surfaces can be used only as a distinct proxy when access/policy permits.

Examples to evaluate separately:

- eMAG marketplace;
- OLX;
- Okazii;
- other current Romanian marketplaces.

Possible uses:

- product/seller discovery;
- second-hand/gray-market presence;
- listing velocity only if defensibly measurable;
- price context.

Do not mix marketplace sellers into local storefront breadth without explicit admission policy.

---

# 10. Google Ads Keyword Planner — primary absolute-ish search demand

Use `GenerateKeywordHistoricalMetrics` with:

- Romania geo target;
- product exact aliases;
- brand + model;
- Romanian terms;
- platform/cartridge/coil terms for POD;
- category terms.

Metrics:

- average monthly searches;
- monthly search volumes;
- competition;
- competition index;
- optional CPC/bid context if useful for marketing intensity, never demand truth by itself.

Historical metrics refresh monthly, so cache monthly rather than wasting daily calls.

---

# 11. Google Trends API — optional trend layer

The official Google Trends API is currently alpha/limited-access. If access is granted, use:

- Romania country filter;
- subregion data where meaningful;
- daily/weekly/monthly aggregation;
- 5-year rolling history;
- consistent scaling for trend comparison.

Use for direction/seasonality, not absolute sales.

If access is not granted, ANALIZA must continue without it. Do not build on unofficial scraping as a mandatory dependency.

---

# 12. First-party ghid-rta telemetry

Authorized aggregate signals can include:

- internal search terms;
- product/family opens;
- category/filter interactions;
- recommendation-result opens;
- watchlist/favorite actions if implemented;
- HYPE-to-ANALIZA clickthrough;
- Romanian language/location aggregate where privacy-safe and permitted.

Privacy principles:

- aggregate by default;
- do not construct unnecessary user profiles;
- suppress tiny cohorts where appropriate;
- version metric definitions.

---

# 13. Google Search Console / Analytics — optional first-party sources

If the project later connects authorized first-party data:

- Search Console query impressions/clicks for ghid-rta.ro;
- GA/first-party analytics aggregate product/page interest.

Use only for the site's audience, not as national market share.

---

# 14. Romanian community/forum sources

Current useful public seeds to preserve/evaluate:

- `rovapers.eu`;
- relevant public Softpedia vaping/atomizer discussions;
- other active Romanian vape forums/communities discovered over time.

Public Facebook groups/pages, Telegram communities or Discord can be used only through public/authorized mechanisms and with policy state recorded.

Extract:

- product mentions;
- questions/recommendations;
- platform/cartridge availability complaints;
- retailer mentions;
- product search intent;
- stock/availability reports as low-confidence community evidence.

Community evidence is demand/context, not sales.

---

# 15. Romania-relevant social/video

Potential public/authorized sources:

- YouTube Romania-language product reviews/search results;
- public Facebook pages/groups;
- Instagram public content;
- TikTok public content where permitted;
- Romanian creator/reviewer feeds;
- brand/distributor Romania pages.

Store Romania relevance explicitly:

- Romanian language;
- Romania-targeted account;
- Romanian retailer link;
- Romanian location/event;
- otherwise mark as global context and do not add to DSR.

---

# 16. Advertising transparency

## Google Ads Transparency Center

Validated current public interface supports region `RO` and advertiser/domain search.

Use as optional marketing-intensity/context source:

- active ad existence;
- advertiser/domain;
- product/family references;
- creative first/last observation where accessible.

## Meta Ad Library

Validated current public Ad Library exists with country selection and keyword/advertiser search. Access/API semantics must be revalidated before automated collection.

Ads = promotion evidence, not sales.

---

# 17. Retailer newsletters/promotions

Optional dedicated authorized mailbox/feed subscriptions for Romanian retailers/distributors can detect:

- new arrivals;
- promotions;
- preorder;
- restock;
- clearance;
- discontinuation.

Email evidence must be restricted to the dedicated authorized ANALIZA mailbox, not unrelated personal email.

---

# 18. Romanian regulatory source

## Ministry of Health — RO-ECigarette publications

Monitor the official tobacco-control legislation/publication page and versioned `RO-ECigarette-*` datasets.

Use for:

- product/brand identity;
- submitter/manufacturer/importer discovery;
- Romania regulatory-record existence;
- entity aliases;
- candidate products to watch in local retail.

Do not infer retail release/sales from regulatory publication.

---

# 19. Operator/business identity sources

Priority order:

1. retailer's own public legal/terms/contact pages;
2. official/public VAT/business validation where appropriate;
3. VIES for EU VAT validation when relevant;
4. Romanian official fiscal/business public services where terms/access permit;
5. public manufacturer/distributor dealer relationship statements.

Store only necessary business identity fields. Do not collect personal data that is irrelevant to market analysis.

---

# 20. Physical store network discovery

Physical retail can matter even when online assortment is limited.

Sources:

- retailer official store-locator/contact pages;
- public chain location pages;
- permitted map/business-search APIs for discovery/verification;
- manufacturer dealer locators.

Do not infer store-level inventory without store-specific evidence.

Possible metrics:

- public physical locations count;
- city coverage;
- operator physical-network breadth.

Keep separate from online storefront product breadth.

---

# 21. Structural trade/import context

Eurostat provides official statistics API access. A vape-specific import adapter remains `CANDIDATE` until the exact commodity classification is validated.

Before activation require:

- exact CN/HS scope;
- unrelated-product contamination analysis;
- reporting unit/value definitions;
- Romania reporter/partner interpretation;
- intra-EU/extra-EU treatment;
- lag and revisions.

Never use a broad electrical-device code as a precise vape-market size measure.

---

# 22. HYPE Global Intelligence source bridge

HYPE is not a Romanian market source; it is a discovery/context source.

Use to create Romanian watch tasks for:

- newly confirmed products;
- strong prelaunch candidates;
- authentic/clone relations;
- new POD platforms;
- new consumable ecosystems.

ANALIZA then searches Romanian evidence independently.

---

# 23. Source policy profiles

Every automated source has:

```text
access_method
public_or_authorized
terms_checked_at
robots_state_if_applicable
rate_limit
commercial_use_constraints
retention_constraints
copyright_constraints
personal_data_constraints
kill_switch
policy_version
```

Policy uncertainty => `POLICY_HOLD` rather than bypass.

---

# 24. Source health

Per adapter/source:

- success rate;
- parser success;
- product yield;
- category coverage;
- stock extraction rate;
- price extraction rate;
- ranking extraction rate;
- latency;
- redirect changes;
- template drift;
- last useful observation;
- consecutive failures.

Health states:

`HEALTHY`, `DEGRADED`, `DRIFTED`, `BLOCKED`, `POLICY_HOLD`, `INACTIVE`, `RETIRED`.

---

# 25. Coverage matrix

Measure daily coverage by:

```text
source family × category × entity level × evidence tier
```

Required categories:

- RTA;
- MOD;
- POD device;
- POD replacement pod/cartridge;
- POD coil/consumables;
- AIO/Boro;
- RTA/product-specific accessories.

Required evidence families:

- listing;
- stock;
- price;
- ranking;
- explicit sales;
- external demand.

A single reachable storefront does not mean all categories on that storefront were successfully observed.

---

# 26. National-universe audit routes

A dated certification run should include at minimum:

- multiple search/query families;
- at least one independent seller-discovery route (price comparison/dealer locator);
- historical registry reconciliation;
- unresolved-candidate queue review;
- source-provider health check;
- duplicate operator/storefront resolution;
- spot audit of major cities/regions;
- POD-specific discovery queries;
- RTA-specific discovery queries.

Output:

```text
registry_storefronts
active_storefronts
candidate_new
unresolved_candidates
retired_detected
search_routes_working
operator_duplicates
category_coverage
certification_state
certification_expires_at
```

---

# 27. Maximum-source closure rule

The source universe is maximally designed when:

1. core local storefronts are directly monitored;
2. POD device + consumable categories are explicit;
3. new stores can be discovered automatically;
4. seller/operator duplication is controlled;
5. price-comparison engines are separate discovery/price sources;
6. marketplace context is separate from core denominator;
7. Romanian search demand has both absolute-ish and trend-capable sources where available;
8. first-party intent is available as an independent source family;
9. Romanian communities/social can contribute demand signals lawfully;
10. advertising/regulatory/structural layers are context, not fake sales;
11. source health and category coverage are measurable;
12. national completeness is dated and renewable;
13. HYPE is context only, never a Romanian sales substitute.

**End of canonical source map.**
