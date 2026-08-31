# HYPE External Source Validation — 2026-09-01

**Purpose:** freeze current authoritative facts that affect vNext source adapters and prevent implementation from relying on stale assumptions.

This is not a permanent legal/data-source guarantee. Each adapter must periodically revalidate availability, semantics and access terms.

---

# 1. EU-CEG / Directive 2014/40/EU

Authoritative sources:

- European Commission EU-CEG step-by-step guide: `https://health.ec.europa.eu/eu-common-entry-gate-eu-ceg/step-step-guide_en`
- EUR-Lex Directive 2014/40/EU, Article 20: `https://eur-lex.europa.eu/eli/dir/2014/40/oj/eng`

Validated fact:

For electronic cigarettes/refill containers within scope, manufacturers/importers submit specified information to relevant Member State authorities before market placement, with Article 20 providing a six-month pre-market notification requirement for new/substantially modified products.

HYPE semantics:

- regulatory notification can be an early artifact;
- public visibility is jurisdiction-specific;
- not every RTA/mod/accessory should be assumed to appear in the same way or be in identical regulatory scope;
- public-record publication date is not automatically product release date.

---

# 2. Romania — Ministry of Health RO-ECigarette files

Official page:

`https://ms.ro/ro/informatii-de-interes-public/controlul-tutunului/legislatie/`

Validated on 2026-09-01:

The Ministry page lists versioned public files including `RO-ECigarette-2026-06-23` and prior versions.

HYPE adapter:

- monitor official page/files for version changes;
- import exact exposed product fields only;
- retain dataset publication/version date;
- compare against previous file for newly public records;
- classify as regulatory artifact, not exact release proof.

---

# 3. United Kingdom — MHRA ECIG Dynamic Search

Official public database:

`https://cms.mhra.gov.uk/ecig-new`

Validated on 2026-09-01:

The search service displayed approximately 49,613 entries and exposed fields such as:

- submitter name;
- product ID;
- brand;
- brand subtype;
- product type;
- published date.

HYPE adapter:

- query/diff exact public records within permitted usage;
- store ECID/GBID/product identifier where exposed;
- distinguish published date from launch date;
- match exact product type before linking to RTA/MOD/POD entities;
- treat as high-quality regulatory artifact.

---

# 4. Poland — Bureau for Chemical Substances

Official information:

`https://www.gov.pl/web/chemical/notification-of-electronic-cigarettes-and-refill-containers`

Published product list page:

`https://www.gov.pl/web/chemikalia/Papierosy-elektroniczne-i-pojemniki-zapasowe`

Validated semantic rule:

The Polish public list states that products still inside the six-month period following notification are not published in that list. The page also states the list is updated roughly monthly; on the observed page the update date was 30 July 2026.

HYPE consequence:

**Do not use the Polish public list as if it were a six-month prelaunch leak feed.** It is useful as regulatory/public-availability history and exact identity evidence after its publication rule permits display.

---

# 5. Italy — Ministry of Health public database

Official page:

`https://www.salute.gov.it/new/it/tema/fumo-prodotti-del-tabacco-sigarette-elettroniche/ingredienti-prodotti-tabacco-e-sigarette/`

Validated fact:

The Ministry describes a public database for tobacco/e-cigarette information submitted through EU-CEG and states that a list of products can be downloaded in XLS format.

HYPE adapter:

- prefer structured download/diff when currently public;
- map brand/type and exposed identifiers;
- retain dataset/version timestamp;
- regulatory artifact only unless separate release evidence exists.

---

# 6. New Zealand — Notified Products

Official Ministry guidance:

`https://www.health.govt.nz/regulation-legislation/vaping-herbal-smoking-and-smokeless-tobacco/importers-manufacturers-and-distributors/product-notifications-for-manufacturers-and-importers`

Validated fact:

Manufacturers/importers must notify notifiable vaping products they intend to sell; the guidance states vaping devices can include components such as coils and that notified products generally appear in the public Notified Products Database after notification processing/payment.

HYPE consequence:

This can be a valuable exact device/component artifact and may discover products or identities not yet found in normal web search. Publication/notification is not automatically an exact launch event.

---

# 7. United States — FDA public tobacco databases

Official FDA source:

`https://www.fda.gov/tobacco-products/ctp-newsroom/fda-launches-searchable-tobacco-products-database`

Additional database context:

`https://www.fda.gov/tobacco-products/market-and-distribute-tobacco-product/searchable-tobacco-products-database-additional-information`

FDA database directory:

`https://www.fda.gov/industry/fda-basics-industry/search-databases`

Validated facts:

- FDA's Searchable Tobacco Products Database includes tobacco products, including e-cigarettes, that may be legally marketed under listed pathways;
- FDA describes monthly updates;
- the database supports search and downloadable records;
- FDA states pending applications generally are not published because of confidential commercial information;
- Establishment Registration & Tobacco Product Listing data is also searchable.

HYPE consequence:

Use FDA primarily for legal-market/product-listing confirmation and entity/identifier enrichment. Do not expect it to reveal all pending prelaunch products.

---

# 8. WIPO — Global Design Database

Official:

`https://www.wipo.int/en/web/global-design-database`

Validated fact:

The database provides free access to Hague international designs and designs from participating national/regional offices, with search by names, dates, classifications, countries, etc. WIPO itself notes that it can be prudent to search national/regional registers as well.

HYPE consequence:

- query known brand/legal entity/designer names;
- retain filing/publication identifiers/dates;
- use as design artifact;
- do not assume WIPO coverage replaces every national office;
- design filing alone cannot confirm launch.

---

# 9. EUIPO / TMview / DesignView

Official search page:

`https://www.euipo.europa.eu/en/search-ip`

Validated fact:

EUIPO exposes:

- eSearch plus for EU trade marks/designs;
- TMview across participating official trademark offices;
- DesignView as a central access point to registered design information from participating national offices.

HYPE consequence:

Use owner/applicant/brand/product-name search as H3-style artifact intelligence. Store exact office/record provenance.

---

# 10. Search provider status — Bing

Microsoft lifecycle announcement:

`https://learn.microsoft.com/en-us/lifecycle/announcements/bing-search-api-retirement`

Validated fact:

Microsoft retired Bing Search APIs on 11 August 2025.

Current HYPE code uses a Bing RSS-format search URL rather than the retired paid API. That behavior may continue to function, but it is not a strategic, documented replacement for the retired Bing Search API.

HYPE consequence:

- keep existing RSS behavior only as optional legacy fallback while healthy;
- monitor source health;
- do not make global discovery depend on it;
- implement `SearchProvider` abstraction.

---

# 11. Brave Search API

Official API product/docs:

`https://brave.com/search/api/`
`https://api-dashboard.search.brave.com/documentation/pricing`

Validated on 2026-09-01:

Brave advertises a documented web search API with web/news/images and country/language support. The observed pricing page listed Search at USD 5 per 1,000 requests with USD 5 monthly credits and capacity figures documented by the provider.

HYPE consequence:

A suitable current general-search provider candidate behind an abstraction layer. Pricing/access may change, therefore configuration and cost accounting are mandatory.

---

# 12. Common Crawl

Official URL Index:

`https://commoncrawl.org/url-index`
`https://index.commoncrawl.org/`

Validated fact:

Common Crawl exposes public URL/CDX/columnar indexes over its crawl corpus, useful for historical/bulk URL discovery.

HYPE consequence:

Use for:

- prior-existence evidence;
- discovery of old product URLs;
- novelty checks;
- periodic deep coverage.

It is not a real-time launch feed and should not be polled like a social network.

---

# 13. ICANN RDAP

Official:

`https://www.icann.org/rdap/`

Validated fact:

RDAP is the standardized current registration-data protocol and has replaced WHOIS as the definitive gTLD registration-information mechanism under the current ICANN transition.

HYPE consequence:

Use current public registration metadata only as weak infrastructure evidence. Do not attempt to obtain or infer nonpublic registrant data.

---

# 14. Certificate Transparency

Use public Certificate Transparency log ecosystems as a source of newly issued public certificate/subdomain observations when relevant.

HYPE consequence:

A certificate for a strongly product-named subdomain can produce a weak artifact/candidate, but never a launch state by itself.

Implementation must rate-limit public log/search services and store exact first-observed semantics.

---

# 15. Social API caution

## Reddit

Reddit data/API terms are policy-sensitive and can change. Existing repo secrets/logic must not be treated as perpetual authorization. Keep a versioned `source_policy` and commercial-use/access gate.

## TikTok

Do not design commercial HYPE around TikTok Research Tools, which are targeted to qualifying researchers/research purposes. Use only access methods that are permitted for HYPE's actual deployment context.

## X / YouTube / other platforms

Use documented current APIs where available and budgeted; otherwise use permitted public/indexed discovery. All platform adapters are isolated behind policy and rate-limit controls.

---

# 16. Trade-show source semantics

Trade-show pages can change dates and exhibitor lists. HYPE must version official event data rather than treating the first page found by search as canonical forever.

Useful event families to keep under active discovery include:

- InterTabac / Dortmund;
- World Vape Show editions;
- Hall of Vape;
- Vaper Expo UK;
- Vapitaly / VapitalyPRO;
- Vapexpo editions.

For every event, prefer current official announcements, then preserve previous dates/status as superseded evidence.

---

# 17. Implementation rule

Every external adapter created from this file must include:

```text
source_id
source_semantics_version
checked_at
access_policy
fields_exposed
publication_lag_semantics
truth_role
rate_limit
health_check
parser_fixture
```

If an official site changes, HYPE should degrade the adapter and report a coverage gap rather than silently returning an empty dataset.

**End of validated external source assumptions.**
