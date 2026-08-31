# HYPE Maximum Source Expansion

**Status:** CANONICAL ADDENDUM — v1.0  
**Date:** 2026-09-01  
**Scope:** additional source families and edge-channel intelligence required before the HYPE source universe can be called maximally designed.

This addendum extends `HYPE_GLOBAL_SOURCE_MAP.md`. It does not weaken any truth gate. New source families start as `discovery_only` or narrowly scoped artifact evidence unless an adapter documents stronger semantics.

---

# 1. Additional source families that must exist explicitly

## 1.1 Patent / utility-model intelligence

Add a dedicated patent family, distinct from trademarks and industrial designs.

Seed systems:

- WIPO PATENTSCOPE;
- Espacenet / EPO where public access and terms permit;
- USPTO patent search;
- CNIPA patent/publication search;
- J-PlatPat/JPO;
- KIPRIS/KIPO;
- UK IPO;
- DPMA;
- INPI and other national patent offices relevant to discovered applicants.

Search by:

- legal manufacturer/applicant;
- known designer/inventor;
- brand group/subsidiary;
- technical vocabulary: atomizer, aerosol-generating device, airflow, heater, reservoir, cartridge, electronic cigarette, power-control device, battery housing, airflow insert etc.;
- IPC/CPC classes discovered from known filings;
- priority/publication date;
- cited patents and applicant relationships.

Value:

- new mechanism/platform signal;
- applicant/OEM relationships;
- product family architecture;
- engineering direction before naming.

Truth role: `ARTIFACT_SIGNAL`; never auto-create a named commercial model merely from a patent.

---

## 1.2 Equipment-certification / qualification intelligence

Create a certification adapter family for connected/electronic devices where relevant.

Potential public systems:

- FCC equipment authorization/EAS records for devices requiring US radio authorization;
- Bluetooth SIG Qualified Product database for Bluetooth-enabled devices;
- Wi-Fi Alliance public certification records if an in-scope device uses Wi-Fi;
- other official/public radio/telecom certification databases discovered by jurisdiction;
- publicly posted manufacturer Declarations of Conformity / CE / UKCA documentation;
- safety/EMC certificates publicly linked by the manufacturer or certification body.

Fields:

- applicant/company;
- product/model number;
- certification/publication date;
- equipment class;
- product description;
- related manuals/photos/labels where publicly provided;
- confidentiality/release dates if explicitly public.

Value: model-code/product identity artifact and technical relationship.

Truth rule: certification proves certification/qualification only; it does not equal retail launch.

---

## 1.3 Advertising-transparency intelligence

Add paid-campaign observability as its own HYPE family.

Potential public sources:

- Meta Ad Library;
- Google Ads Transparency Center;
- YouTube paid-promotion transparency surfaces where available;
- other platform ad libraries/transparency centers that permit public querying.

Monitor by:

- advertiser/brand/legal company;
- destination domain;
- product-name token;
- creative text/image/video fingerprint;
- first observed ad date;
- countries/regions shown when publicly exposed;
- landing-page URL and campaign-specific path.

Signals:

- launch campaign begins before product page is linked from main navigation;
- new product landing page;
- campaign image identical to a previous leak;
- regional launch campaign;
- campaign withdrawal/correction.

Truth role: `MARKETING_SIGNAL`. An ad is strong evidence that a brand is promoting something, but exact release/stock still requires corresponding evidence.

---

## 1.4 App-store and companion-software intelligence

Monitor public app listings and release history for manufacturers whose devices use companion/configuration apps.

Sources:

- Apple App Store public product pages;
- Google Play public app pages;
- manufacturer desktop software/download center;
- Microsoft Store/macOS public app pages where relevant;
- public app release notes/changelogs;
- public supported-device lists.

Detect:

- new model added to supported-device list;
- screenshot/UI mentioning an unreleased model;
- version notes adding device support;
- new firmware/configuration profile;
- new regional app listing tied to hardware.

Truth role: high `ARTIFACT_SIGNAL` for device identity, not automatic release.

---

## 1.5 Corporate / investor-relations / public-company intelligence

For brands owned by listed/public companies or large corporate groups, monitor public corporate disclosures:

- investor-relations news;
- earnings presentations;
- annual/interim reports;
- exchange filings;
- product/innovation presentations;
- public strategy decks;
- official press releases;
- subsidiary/company acquisition announcements.

Useful for:

- named new product/platform;
- category expansion;
- OEM/brand ownership changes;
- regional launch plans;
- production-capacity/ramp clues;
- new distribution agreements.

Truth role: `CORPORATE_SIGNAL`; product-specific claims can strengthen identity/forecast but generic pipeline language cannot create a product candidate by itself.

---

## 1.6 Public product-identifier / catalog-syndication intelligence

Where public and lawful, collect product identifiers from:

- GTIN/EAN/UPC records or lookup services with clear provenance;
- public distributor product feeds;
- retailer XML/product feeds;
- public schema.org Product JSON-LD;
- public catalog exports;
- manufacturer/dealer CSV/XLS/PDF catalogs;
- public site search/autocomplete indexes;
- public website-facing Algolia/Elastic/search endpoints when intentionally exposed and permitted.

Use product codes to improve entity resolution and detect a model before normal category navigation exposes it.

Never treat a third-party identifier record as release proof without provenance/date semantics.

---

## 1.7 SEO / campaign-infrastructure signals

Extend infrastructure monitoring beyond CT/RDAP:

- newly added sitemap partitions;
- robots.txt changes that expose new paths;
- canonical/hreflang additions;
- OpenGraph/product metadata changes;
- `noindex -> index` transitions;
- public internal-search autocomplete;
- public category facet additions;
- new landing pages discovered through ad destination URLs;
- new short-link/link-in-bio destinations;
- public redirects from campaign codes to product pages;
- press-kit/media asset directories.

Truth role: weak-to-medium artifact. Require semantic brand/product linkage.

---

## 1.8 Affiliate / creator-link intelligence

Track public affiliate and link-in-bio changes from known reviewers/brand ambassadors where permitted.

Signals:

- product SKU appears in creator link hub before review;
- new manufacturer affiliate link;
- embargoed-looking product title becomes public in destination slug;
- multiple independent creators receive distinct product links.

Must preserve lineage: shared manufacturer campaign links can represent one upstream origin.

Truth role: `CREATOR_MARKETING_SIGNAL`.

---

## 1.9 Public crowdfunding / reservation / waitlist surfaces

Where platform policy and product category permit, monitor:

- maker-operated reservation pages;
- deposit/waitlist forms;
- crowdfunding/preorder platforms;
- limited-run signup pages;
- drop calendars;
- high-end modder batch lists.

State machine:

`ANNOUNCED -> WAITLIST -> RESERVATION -> DEPOSIT -> PREORDER -> BATCH_CLOSED -> SHIPPING`.

This is especially useful for high-end RTA/mod makers that do not use conventional retail launches.

---

## 1.10 Dealer / distributor network-change intelligence

Monitor official dealer locator/list changes and distributor appointment announcements.

Signals:

- a brand adds a distributor in a new region before launch;
- dealer pages create product-specific training/download content;
- distributor catalogs gain an unreleased SKU;
- new country microsite appears.

Truth role: distribution artifact / regional-launch forecast.

---

## 1.11 Logistics and fulfillment surface signals

In addition to commercial import datasets, monitor public logistics-facing artifacts when naturally exposed:

- manufacturer shipping-status pages;
- public preorder shipment notices;
- distributor inbound-stock notices;
- customs/recall records tied to model codes;
- public carrier-tracking announcements posted by maker/distributor;
- fulfillment center/catalog availability changes.

Do not infer quantities or sales unless explicitly public and reliable.

---

## 1.12 Job / recruitment and supplier-announcement intelligence

Low-priority, discovery-only layer.

Monitor official company career pages and supplier announcements for unusually product-specific terms, e.g. a named device family, firmware platform or new regional product launch team.

Generic hiring must never create a HYPE candidate.

---

# 2. Additional regional discovery ecosystems

The Query Factory/Source Discovery layer should support region-specific search ecosystems when access is lawful and useful.

Candidate ecosystems:

- Baidu public web search;
- Sogou public search where permitted;
- Naver public search/blog/cafe surfaces where permitted;
- Yahoo Japan search/news;
- VK public communities;
- Bluesky public posts/search providers;
- public Lemmy/Fediverse communities;
- regional forums/blog platforms in Indonesia, Malaysia, Philippines, Thailand, Vietnam and Turkey;
- Japanese maker/modder blogs and storefront notice boards;
- Chinese manufacturer export portals and domestic announcement pages.

These are provider families, not automatically trusted sources.

---

# 3. Accessory-before-parent intelligence

HYPE must deliberately search for product-specific accessories that can reveal an unreleased parent product.

Examples:

- replacement glass with unknown parent name;
- airflow pin/insert kit;
- chamber/bell/chimney;
- tank extension;
- top cap/base;
- conversion kit;
- proprietary drip tip;
- spare kit;
- Boro bridge tank/adapter;
- cartridge/coil family whose compatibility text names an unreleased pod.

Procedure:

1. detect new accessory entity;
2. parse compatibility/parent references;
3. search parent name across official/support/retail/IP/regulatory/social sources;
4. create `UNCONFIRMED_PARENT_CANDIDATE` if identity is sufficiently concrete;
5. keep accessory release separate from parent release;
6. increase parent discovery priority for 30 days.

---

# 4. Negative-evidence and denial sources

HYPE must ingest evidence that a rumor is wrong.

Sources:

- maker denial/correction;
- reviewer correction;
- deleted/retracted product page with explicit correction;
- changed ETA;
- cancelled preorder;
- regulator withdrawal/recall;
- official discontinuation;
- event cancellation;
- trademark abandoned/refused where public and material.

Negative evidence is first-class evidence. It can lower LP/EC/DC or move state to `CONFLICTED`, `DELAYED`, `CANCELLED`, `WITHDRAWN`.

---

# 5. Source completeness dimensions

Coverage must be measured over at least these axes:

```text
category: RTA / MOD / RTA-ACCESSORY / POD / AIO / BORO / CLONE
source_family
brand/maker
region
language
lifecycle_stage
freshness
adapter_health
policy_state
historical_depth
```

A source map is not globally complete merely because many domains are listed.

Required Coverage Confidence components:

- `maker_coverage`;
- `family_coverage`;
- `regional_coverage`;
- `language_coverage`;
- `freshness_coverage`;
- `lifecycle_stage_coverage`;
- `adapter_health_coverage`;
- `history_coverage`.

---

# 6. Source-selection priority model

Each scan task receives a dynamic priority based on:

```text
source_prior
x recent_yield
x unresolved_candidate_weight
x event-window_weight
x brand_activity_weight
x coverage-gap_weight
x expected-value-per-cost
x health_probability
```

Boosts:

- candidate H3–H5 approaching ETA;
- active trade show;
- brand just posted teaser;
- official sitemap changed;
- new regulatory/IP artifact;
- accessory-before-parent signal;
- contradictory claims requiring resolution.

Demotions:

- high duplicate ratio;
- repeated zero-yield generic query;
- stale/inactive brand;
- policy uncertainty;
- parser drift;
- low-value broad retail pages.

---

# 7. Maximum-source closure test

Do not call HYPE source coverage maximally designed until all are true:

1. first-party maker web/social/support;
2. designers/collaborators;
3. reviewer/sample network;
4. specialist press;
5. forums/Reddit/community;
6. retail/distributor/wholesale;
7. clone ecosystem;
8. OEM/ODM/B2B;
9. trade shows;
10. EU/non-EU regulatory;
11. trademarks/designs;
12. patents/utility models;
13. certification/qualification databases;
14. domain/DNS/CT/archive/search infrastructure;
15. manuals/firmware/software/app stores;
16. advertising transparency;
17. corporate/IR disclosures;
18. public product identifiers/catalog feeds;
19. newsletters;
20. logistics/shipment intelligence;
21. recalls/enforcement;
22. media/reverse-image lineage;
23. affiliate/creator links;
24. waitlist/drop/reservation surfaces;
25. negative evidence/denials;
26. automatic source discovery;
27. region/language coverage measurement;
28. source policy/health lifecycle;
29. historical novelty memory;
30. explicit blind-spot reporting.

**Maximum practical HYPE = maximum lawful/public recall + explainable truth discipline + self-expanding source graph.**
