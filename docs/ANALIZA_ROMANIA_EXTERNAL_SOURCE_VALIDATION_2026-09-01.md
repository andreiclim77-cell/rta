# ANALIZA ROMÂNIA — External Source Validation

**Date:** 2026-09-01  
**Purpose:** freeze current source semantics that affect ANALIZA vNext adapters and prevent implementation from relying on stale assumptions.

Every adapter must periodically revalidate availability, access terms and semantics.

---

# 1. Google Ads Keyword Planner historical metrics

Authoritative reference:

`https://developers.google.com/google-ads/api/samples/generate-historical-metrics`

Validated facts:

- Google Ads API exposes historical keyword-planning metrics;
- requests can include geo target constants and language;
- returned metrics include approximate average monthly searches, monthly search volumes, competition and related historical metrics.

ANALIZA semantics:

- use Romania geo targeting;
- treat results as search-demand evidence, not sales;
- query product aliases carefully;
- cache monthly because these are historical planning metrics rather than a live transaction stream;
- preserve approximate semantics.

---

# 2. Google Trends API alpha

Authoritative references:

`https://developers.google.com/search/apis/trends`

`https://developers.google.com/search/blog/2025/07/trends-api`

Validated current facts:

- the API is still an alpha/early-access product;
- it exposes a rolling 5-year / 1800-day data window;
- it supports daily, weekly, monthly and yearly aggregation;
- it supports region and subregion breakdowns;
- data are consistently scaled across requests but represent search interest, not absolute search counts.

ANALIZA semantics:

- optional adapter only;
- do not make production depend on access;
- use Romania/subregions only when appropriate;
- pair with Google Ads historical metrics rather than treating Trends as absolute demand;
- include API access/health in coverage state.

---

# 3. Compari.ro

Validated current example:

`https://tigara-electronica.compari.ro/`

A current public product result for a Vaporesso XROS 5 pod kit exposes seller/offer price and an `In stoc` claim.

ANALIZA semantics:

- use as comparison/seller-discovery source;
- resolve seller to canonical direct retailer;
- direct retailer source remains preferred for current price/stock truth;
- comparison-engine result does not increase retailer breadth if it represents an already monitored seller;
- no sales inference.

---

# 4. Price.ro

Validated current public product-search pages expose product, seller and price information for vape-related products.

ANALIZA semantics:

- seller discovery;
- product alias discovery;
- price context;
- comparison-source availability claims;
- separate from core local-storefront denominator;
- no sales inference.

---

# 5. Google Ads Transparency Center

Authoritative/current interface:

`https://adstransparency.google.com/?region=RO`

Validated current facts:

- region `RO` is supported in the interface;
- advertiser name or website can be searched;
- the center is designed to expose active ads and additional European transparency information.

ANALIZA semantics:

- optional promotional/marketing-intensity source;
- advertiser/domain/product matching required;
- ad presence is not sales or demand proof;
- automated/API access must be separately validated before implementation.

---

# 6. Meta Ad Library

Current public interface:

`https://www.facebook.com/ads/library/` / Meta business Ad Library interface.

Validated current facts:

- public search by keyword/advertiser exists;
- location/country selection exists;
- active ads across Meta technologies can be inspected;
- EU ad-history transparency has additional retention rules.

ANALIZA semantics:

- optional promotion/marketing source;
- country `RO` required for Romanian campaign context;
- interface/API/access semantics must be validated before automation;
- marketing activity is Tier C/E context, never sales.

---

# 7. Romanian Ministry of Health — RO-ECigarette

Authoritative source:

`https://ms.ro/ro/informatii-de-interes-public/controlul-tutunului/legislatie/`

Validated current fact:

The Ministry currently lists versioned files including:

- `RO-ECigarette-2026-06-23`;
- earlier 2025, 2024 and 2023 RO-ECigarette publications.

ANALIZA semantics:

- regulatory artifact / product/submitter identity source;
- candidate product/entity discovery;
- not proof of Romanian retail availability;
- not sales;
- publication date must not be treated as first retail date.

---

# 8. Eurostat APIs / Comext

Authoritative references:

`https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/`

`https://ec.europa.eu/eurostat/web/user-guides/data-browser/api-data-access/api-getting-started/comext-database`

Validated current facts:

- Eurostat provides public REST/SDMX/Statistics APIs;
- Comext is Eurostat's detailed international trade-in-goods reference database;
- Comext has a dedicated API endpoint;
- international trade files/data are updated regularly, including monthly publication in the Comext context.

ANALIZA semantics:

- structural/macro context only until a sufficiently specific commodity code is validated;
- no vape-specific market-size claim from broad classifications;
- document commodity scope, contamination, units/value, lag and intra-/extra-EU semantics before activation.

---

# 9. Current search-discovery dependency warning

Current ANALIZA universe discovery uses Bing RSS and DuckDuckGo HTML discovery.

vNext rule:

- wrap generic search behind a provider abstraction;
- never use one provider as national-completeness proof;
- direct dealer locators, comparison engines, historical registry and other independent discovery routes are mandatory complements;
- discovery-provider failure lowers Universe Coverage Confidence.

---

# 10. Current external YouTube/manufacturer semantics

The existing project already labels its YouTube review intelligence as global-interest context and explicitly states it cannot replace verified Romanian sales/bestseller evidence.

vNext preserves that boundary.

Global video review activity may:

- create/watch a Romanian candidate;
- explain global context;
- contribute only a capped white-space context term.

It cannot enter Romania Demand Strength unless explicit Romania relevance is demonstrated.

---

# 11. Revalidation schedule

Recommended:

- Google Ads API/version/access: monthly or on failure;
- Google Trends alpha status: monthly;
- comparison engines: monthly/source drift;
- ad transparency access: monthly/source drift;
- Ministry of Health publication adapter: every scan/update;
- Eurostat endpoint/classification: quarterly and before metric activation;
- generic search providers: continuous health monitoring.

---

# 12. External-source truth rule

A source adapter is not complete until it documents:

1. what the source exposes;
2. what the source **proves**;
3. what it does **not prove**;
4. geographic scope;
5. update cadence/lag;
6. access policy;
7. failure semantics;
8. confidence role in ANALIZA.

**End of external source validation.**
