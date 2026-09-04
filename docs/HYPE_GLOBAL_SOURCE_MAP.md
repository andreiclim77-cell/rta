# HYPE Global Source Map

**Status:** CANONICAL COMPANION SPEC — v1.0  
**Date:** 2026-09-01  
**Purpose:** define the broadest practical public/authorized source universe for HYPE, how every source family is used, and how new sources are discovered without treating a fixed URL list as “global”.

---

# 1. Core rule

HYPE source coverage has two layers:

1. **Curated seed registry** — known high-value makers, retailers, forums, regulators, IP systems, events and platforms.
2. **Continuous Source Discovery** — automated candidate discovery, policy validation, quarantine, quality testing, activation and retirement.

A source can be:

- `discovery_only` — can create/strengthen a candidate but cannot by itself confirm a launch;
- `artifact_truth_eligible` — can prove a specific artifact/record exists;
- `release_truth_eligible` — can contribute to release truth gates;
- `market_availability_eligible` — can prove observed public availability;
- `trend_only` — useful for momentum, not factual lifecycle promotion.

No source is globally “reliable” for every claim type.

---

# 2. Source-family matrix

| Family | Primary value | Typical access | Truth role | Default cadence |
|---|---|---|---|---|
| Manufacturer official web | announcement, product, manual, firmware | direct HTTP/RSS/sitemap/API | high | 1–6h |
| Manufacturer official social | teasers, prototypes, launch | platform API/permitted public fetch/search | high for authored claim | 1–3h |
| Designers/collaborators | prototypes, collaboration clues | public web/social | medium | 3–6h |
| Reviewers/creators | sample received, first look | API/public page | medium | 1–6h |
| Specialist news/media | reporting, interviews | RSS/web/news search | medium | 3–12h |
| Forums/Reddit | rumor/leak/community corroboration | API/public pages/search | low–medium | 1–6h |
| Retail/distributors | SKU, preorder, stock, first market observation | direct catalog/sitemap/search | medium, context-sensitive | 3–6h |
| Clone sellers/communities | clone release and leak discovery | direct/public | medium for clone only | 3–6h |
| OEM/ODM/B2B | pre-brand prototypes, white label | public B2B | discovery only | 12–24h |
| Trade shows | prelaunch, exhibitors, demos | public directories/news | medium-high | 6–24h around events |
| Regulatory | product notification/legal-market artifact | official public registry | high for record | daily/weekly |
| IP | name/design artifact | official public registry | high for filing | daily/weekly |
| Search engines | broad discovery | supported search API | discovery | adaptive |
| Archive/Common Crawl | prior existence/novelty | public indexes | medium for historical existence | weekly/monthly |
| Domain/RDAP/CT | infrastructure artifact | public protocol/log | low–medium | daily |
| Manuals/firmware/app support | exact product strings | official support/download feeds | high artifact | 3–12h |
| Newsletters | prelaunch announcements | authorized subscribed mailbox/feed | medium-high | event-driven |
| Public Telegram/Discord | rumor/creator/brand channels | public/authorized only | low–medium | 1–6h |
| Image/media correlation | identity/lineage | internal fingerprints | corroborative | every ingest |
| Shipment/import data | manufacturing/shipping clue | public/paid data | discovery/medium | daily/weekly |

---

# 3. Manufacturer / maker universe

## 3.1 Current RTA/MOD seed universe — preserve

The existing repo already tracks a substantial seed universe. Preserve and normalize it into `brands` + `source_endpoints` rather than keeping separate overlapping maker arrays.

Existing examples include:

- SvoëMesto
- KHW Mods / Dvarw
- SmokerStore / Taifun
- Arcana Mods
- Centenary Mods
- Atmizoo
- Cthulhu Mod
- Vandy Vape
- Dovpo / BP Mods
- Geekvape
- Lost Vape
- YiHi / SXmini
- Vapefly
- Hellvape
- Aspire
- Innokin
- OXVA
- Wotofo
- Vaporesso
- VOOPOO
- ThunderHead Creations
- Thunder Cloud
- Telli's Mod
- Fakirs Mods
- Hussar
- Steam Crave
- QP Design
- Augvape
- Digiflavor
- Fumytech
- Yachtvape
- Ennequadro
- YG Creations
- Monarchy
- GD Mods
- Ambition Mods
- Flash-e-Vapor
- StattQualm
- Vapor Giant
- By-ka / Vape Systems
- Golden Greek
- GUS Mods
- Reka Vape
- Pipeline

Supplemental current registry examples to preserve/normalize:

- EXVAPE / Expromizer
- The Vaping Gentlemen Club / TVGC
- Steam Tuners
- Angry Fox Vape
- Vape Ware Mods
- Animodz
- Auguse
- Limelight Mechanics
- Vaperz Cloud
- Suicide Mods
- dotMod
- SunBox
- Eleaf
- Joyetech
- Wismec
- Billet Box Vapor
- Comp Lyfe
- Tek Division
- Kaser Mods
- SMOK
- Smoant
- OBS
- IJOY
- Protocol Vape Tech
- Mission XV
- KangerTech
- ADVKEN
- HorizonTech
- Boxer Mod / Ginger Industries
- Rebel Vape
- Rincoe
- BD Vape / Precisio
- Creavap
- Galactika Mod
- Four One Five Mod / 415
- Sturdy MFG
- Veepon
- Across Vape
- Reload Vapor USA
- Signature Tips / Signature Mods
- Uwell
- Freemax

Do not hardcode “active forever”. Every maker has `activity_state`, `last_product_signal_at`, `source_health` and periodic retirement/re-activation logic.

## 3.2 POD/AIO seed universe — preserve and expand dynamically

Existing registry already includes major families such as:

- SMOK
- Vaporesso
- VOOPOO
- Geekvape
- Uwell
- OXVA
- Lost Vape
- Aspire
- Innokin
- Nevoks
- Smoant
- Joyetech
- Eleaf
- Vapefly
- Rincoe
- Suorin
- Justfog
- MOTI
- Dovpo
- FreeMax
- HorizonTech
- Hellvape
- Wotofo
- UPENDS
- Artery Vapor
- Vapor Storm
- Snowwolf
- Advken
- Sense
- Think Vape
- OneVape
- KangerTech
- IJOY
- Elf Bar
- JUUL Labs
- Vuse
- VEEV/IQOS-related device family where in scope
- RELX
- Lost Mary
- KIWI Vapor
- SKE
- Nasty
- IVG
- Al Fakher device lines where in scope
- Zovoo
- Vozol
- HQD
- DotMod
- BP Mods
- Cthulhu Mod
- Mi-Pod
- Asmodus

Source Discovery must add new makers from product catalogs, trade-show lists and regulatory records rather than requiring manual code edits.

## 3.3 Clone maker seed universe

Preserve and version:

- SXK
- ULTON
- YFTK
- YFTY
- SJMY
- Kindbright
- ShenRay
- Coppervape
- Vazzling
- Vapeasy
- Tobeco
- WeJoyTech
- JFTK
- LieFeng

Discover new clone-maker labels from clone retailer facets and product title patterns; new labels remain quarantined until manually/automatically validated as actual maker identities rather than seller tags.

---

# 4. First-party manufacturer endpoints

For every maker/brand, HYPE tries to discover and monitor:

1. canonical root domain;
2. regional/localized domains/subdomains;
3. `/products`, `/collections`, `/shop`, `/new`, `/news`, `/blog`, `/coming-soon`;
4. sitemap index and product/news sitemaps;
5. RSS/Atom;
6. public WordPress/Shopify/other CMS website-facing endpoints when permitted;
7. support/download/manual pages;
8. firmware and release-note pages;
9. dealer/distributor announcement pages;
10. public event/exhibition pages;
11. official `sameAs` social accounts from structured data;
12. public media/press kit;
13. official newsletter signup/feed;
14. public app/device compatibility lists.

### Ingestion strategy

- sitemap diff before broad crawling;
- content hash and selected semantic field diff;
- conditional HTTP requests;
- parse JSON-LD Product/Article where present;
- discover manuals/PDFs and support artifacts;
- store region/language/canonical/hreflang relationships;
- detect migrations/redirects and update canonical endpoint.

### Truth semantics

Official source is high reliability for **what it says**, but even official product pages require historical/date analysis to determine whether a model is genuinely new in the 30-day release window.

---

# 5. Manufacturer and ecosystem social endpoints

Source classes:

- official brand accounts;
- founder/designer/modder public accounts;
- official distributor accounts;
- public brand communities;
- ambassadors only when their relation is explicitly documented;
- event booth/exhibitor accounts.

Platforms to support through permitted access paths:

- YouTube
- X
- Instagram
- Facebook
- Threads
- TikTok public pages/feeds where permitted; do not assume Research API eligibility for a commercial HYPE deployment
- LinkedIn company/public professional posts
- Pinterest
- Mastodon/public Fediverse
- Telegram public channels
- Discord only with explicit bot/account authorization to the relevant server/channel
- Weibo
- WeChat public articles when accessible via permitted public mechanisms
- Bilibili
- Xiaohongshu/RED public content where terms/access allow
- Douyin public content where terms/access allow
- Kuaishou public content where terms/access allow

### What HYPE detects

- teaser frames;
- partial silhouettes;
- countdowns;
- “coming soon”;
- prototype/public engineering sample;
- sample shipping to reviewers;
- official product naming;
- event booth reveal;
- delay/cancellation/correction;
- collaboration announcements.

### Truth rule

A post by an official maker proves the maker published that claim. It does not automatically prove the predicted shipping date came true; follow-up evidence is required.

---

# 6. Reviewers / creators / early-sample network

Build a reviewer graph from:

- YouTube channels repeatedly publishing RTA/mod/pod reviews;
- specialist blogs;
- Instagram/X/public video creators;
- manufacturer pages linking/mentioning sample recipients;
- event speakers/review panels;
- existing `youtube-reviews` data in the repo.

Track per reviewer:

- platform/account/channel ID;
- regions/languages/categories;
- historical lead time before official release;
- false-rumor/accuracy calibration;
- whether evidence is direct (“sample in hand”) vs reporting another source;
- source lineage.

High-value phrases/events:

- sample received;
- review sample;
- first look;
- embargo ends;
- prototype;
- pre-production;
- final version;
- full review coming;
- comparison with previous version.

A creator's repeated accurate early samples can improve source prior, but no individual is permanently trusted.

---

# 7. Specialist vape news / editorial sources

Preserve existing seeds and dynamically discover more.

Current useful seed examples:

- Vaping360
- Ecigclick
- Vaping Post
- Vapouround
- 2FIRSTS
- Spinfuel
- Cloumix
- Le Vapelier

Add regional/specialist editorial candidates as discovered and validated. News aggregators/syndicated press-release mirrors must be clustered into lineage groups.

Preferred access:

- RSS first;
- article sitemap;
- news search;
- direct web pages.

Use specialist press for:

- product announcement reporting;
- interviews with makers/designers;
- trade-show previews/recaps;
- regulatory/product artifact context.

Never count syndicated copies as independent confirmation.

---

# 8. Forums / community source universe

## 8.1 Existing high-value seeds to preserve

- `e-cigarette-forum.com`
- `vapingunderground.com`
- `forum.planetofthevapes.co.uk`
- `forum-ecigarette.com`
- `worldofkrazzy.forum-ecigarette.com`
- `forum.e-liquid-recipes.com`
- `rovapers.eu`
- `sigarettaelettronicaforum.com`
- `ecigssa.co.za`
- `vapoo.de`
- `vape.to`
- `dampfer-board.de`
- `dampferzuflucht.de`
- `vapingcommunity.co.uk`
- `forum.belvaping.com`
- `ecigtalk.org`
- `vapeforums.lv`

## 8.2 Important expansion candidates

- Polish active e-cigarette forums including `e-papierosy-forum.pl` where publicly accessible;
- additional Italian, French, German and UK high-end/modding communities discovered through backlink/search analysis;
- regional Boro/AIO communities;
- Greek/Turkish/Central European communities where public and active;
- Indonesian/Malaysian/Philippine public vape communities where hardware launches often appear early;
- Japanese high-end/modding public communities.

## 8.3 Reddit

Monitor relevant public subreddits based on actual activity, not one hardcoded community only. Candidate set may include general electronic-cigarette/vaping communities and specialized rebuildable/Boro/modding communities where permitted by Reddit's current data/API terms.

Store Reddit access policy explicitly. Commercial use/API eligibility must be verified and versioned; if API access is unavailable, do not bypass platform restrictions.

## 8.4 Community event extraction

Classify:

- rumor;
- leak/photo;
- “my dealer says”;
- sample received;
- prototype owner report;
- screenshot of maker communication;
- preorder link;
- in-hand retail proof;
- correction/denial.

Claims must retain original context and cannot be upgraded merely by community repetition.

---

# 9. Retailers, distributors and wholesalers

Retail is essential for first-market observations and product/SKU discovery, but current truth rule remains: retail ≠ automatic launch.

## 9.1 Current original/authentic seeds to preserve

Examples already in repo:

- Creme de Vape
- InTaste
- Pipeline Store
- Le Petit Vapoteur
- NatureVape
- Ecigone
- Vapesourcing
- Sovap
- VapeORdR
- The Vaping Gentlemen Club
- Vaping101
- Vape Superstore
- UK ECIG Store
- manufacturer official stores

## 9.2 Expand authentic/high-end regional retail map

Candidates should be continuously discovered from:

- EU high-end RTA/mod retailers;
- UK specialist retailers;
- Romanian market storefront registry already used by Market 2026;
- US/Canada specialist hardware stores;
- China/global wholesalers;
- Japan/Asia specialist shops;
- maker dealer lists.

Potential seed candidates subject to current activity/policy validation include:

- Kumulus Vape and other large French specialist stores;
- additional German/Austrian high-end shops;
- Italian modding/high-end shops;
- Element Vape / VaporDNA / MyVPro-type US stores where still active and relevant;
- Sourcemore;
- Everzon;
- HealthCabin/Heaven Gifts family where current/public;
- current Romanian 22-store Market universe plus Smokee.

Do not activate by name alone; Source Discovery must validate domain, activity and policy first.

## 9.3 Clone retail seeds

Preserve:

- 2FDeal
- 3FVape
- ShareAVape
- Sourcemore clone listings where applicable
- 3AVape
- VapingBest
- BEAST catalog

Track seller health because clone vendors frequently change domain/catalog structure.

## 9.4 Retail state machine

Detect:

```text
UNKNOWN
PLACEHOLDER
COMING_SOON
WAITLIST
PREORDER
BACKORDER
IN_STOCK
OUT_OF_STOCK
DISCONTINUED
REMOVED
```

Keep `first_observed_at` per retailer. Historical catalog memory is mandatory for novelty checks.

---

# 10. OEM/ODM and B2B discovery

Source families, when public and terms permit:

- Alibaba
- 1688
- Made-in-China
- Global Sources
- HKTDC sourcing directories
- direct Shenzhen/Dongguan OEM websites
- B2B wholesale catalogs
- packaging/component suppliers
- chipset/board makers

Use only as `discovery_only` by default.

Signals:

- unbranded device matching later branded product;
- identical CAD/render/photo;
- model code/SKU;
- dimensions/chipset;
- OEM “new model” catalogue;
- trade-show sample;
- private-label availability.

White-label inference requires multiple matching features and remains a hypothesis until corroborated.

---

# 11. Trade shows / expos / industry events

Curated seed families to monitor dynamically:

- InterTabac / NUBIZ, Dortmund
- World Vape Show Dubai and other current WVS editions
- Hall of Vape, Stuttgart
- Vaper Expo UK
- Vapitaly / VapitalyPRO
- Vapexpo editions
- relevant Asian hardware/e-cigarette trade fairs discovered through current exhibitor activity
- local/regional industry events when they include hardware makers

For each event monitor:

- official dates/version history;
- exhibitor directory;
- new exhibitor additions/removals;
- floorplan/booth assignments;
- product innovation/award pages;
- press releases;
- public exhibitor posts naming booth/event;
- post-event media.

Around event windows increase maker/social scan cadence and query budget.

Event schedule updates must be versioned. Never assume an old event page is current if a newer official announcement supersedes it.

---

# 12. EU / EEA regulatory intelligence

## 12.1 EU-CEG / TPD semantic layer

Article 20/EU-CEG rules make notifications potentially useful as early product artifacts for products within scope. However, public visibility differs by Member State and not every RTA/mod/accessory is necessarily exposed/covered in the same way.

HYPE stores per national adapter:

- jurisdiction;
- public registry/list URL;
- publication lag policy;
- update cadence;
- fields exposed;
- product types included;
- whether published date is notification date, publication date, eligibility date or unknown;
- historical snapshots.

## 12.2 Romania

Monitor the Ministry of Health public tobacco-control page and versioned `RO-ECigarette-*` datasets/files.

Use:

- brand/subtype/product-type discovery;
- submitter/manufacturer clues;
- confirmation of public regulatory record.

Do not claim a launch date from file publication alone.

## 12.3 United Kingdom

Monitor MHRA ECIG Dynamic Search / published product data.

Fields of interest include:

- submitter name;
- product ID;
- brand;
- subtype;
- product type;
- published date.

Treat as high-confidence regulatory artifact. Product scope/classification must be checked.

## 12.4 Italy

Monitor Ministry of Health public database/downloads of tobacco/e-cigarette notifications where accessible. Prefer structured/XLS exports when publicly available.

## 12.5 Poland

Monitor Bureau for Chemical Substances published lists. Important semantic rule: the public list states that products still within the six-month waiting period are not published. Therefore this source is useful for regulatory/public availability history but **must not be sold as a six-month prelaunch leak source**.

## 12.6 Belgium

Monitor public positive/negative EU-CEG-related lists and official tobacco/vaping product publication resources where accessible.

## 12.7 France

Monitor ANSES/public declaration datasets and official e-cigarette/tobacco product publication resources where technically available.

## 12.8 Other EU/EEA jurisdictions

Source Discovery should search official health/regulatory sites for national EU-CEG publication lists/databases and add adapters for:

- Germany
- Austria
- Spain
- Portugal
- Netherlands
- Czechia
- Slovakia
- Hungary
- Bulgaria
- Greece
- Ireland
- Sweden
- Denmark
- Finland
- Baltic states
- Croatia/Slovenia
- other EEA markets where public datasets exist.

These remain `candidate` until exact public publication semantics are documented.

---

# 13. Non-EU regulatory intelligence

## 13.1 New Zealand

Monitor the official Notified Products Register / Ministry of Health notification data where publicly accessible. The Ministry states that vaping devices and components sold separately can require notification and notified products appear in the public register.

Useful for:

- device/component product identity;
- brand/manufacturer/importer discovery;
- public record timing.

## 13.2 United States

Monitor official FDA:

- Searchable Tobacco Products Database;
- Establishment Registration & Tobacco Product Listing database;
- relevant public marketing authorization announcements/orders.

Important semantic constraint: FDA states pending applications are generally not made public because of confidential commercial information. Therefore the public database is principally a legal-market/registration confirmation source, not a comprehensive prelaunch radar.

## 13.3 Canada / Australia / other markets

Discover and activate public official device/tobacco/vaping product registers, recall databases or regulatory notices only after legal/public semantics are verified.

---

# 14. Intellectual-property intelligence

## 14.1 Global aggregators

Monitor/query:

- WIPO Global Brand Database;
- WIPO Global Design Database;
- Hague International Designs Bulletin / Hague Express where useful;
- EUIPO eSearch plus;
- TMview;
- DesignView.

## 14.2 National/regional IP offices

Where technically/publicly useful, include official national searches such as:

- USPTO
- UK IPO
- CNIPA
- J-PlatPat / JPO
- KIPRIS / KIPO
- CIPO
- IP Australia
- DPMA
- INPI France
- UIBM Italy
- OEPM Spain
- Benelux BOIP
- other national offices relevant to discovered applicants.

WIPO itself notes national/regional registers may need to be searched in addition to its aggregated design database.

## 14.3 IP query strategy

Search by:

- brand/legal owner;
- designer/related company;
- known naming families;
- product-class terms;
- visual/design classification where available;
- recent filing/publication dates.

Do not generate speculative model names from generic marks. Keep IP record as `ARTIFACT_SIGNAL` until linked to product evidence.

---

# 15. Domain / web infrastructure intelligence

Use public internet metadata as weak artifacts:

- ICANN/RDAP ecosystem for registration data;
- Certificate Transparency logs for newly issued certificates/subdomains;
- public DNS resolution/history where permitted;
- Common Crawl URL indexes;
- public web archive indexes;
- search-engine newly indexed URL observations;
- public site map changes.

Examples:

```text
new-model.brand.com
support.brand.com/manuals/model-x.pdf
brand.com/products/model-x
```

A new subdomain/certificate is only significant when semantic/entity matching ties it to a known maker/product concept.

---

# 16. Search engines / generic web discovery

## 16.1 Provider principle

Generic search is a **discovery layer**, not the canonical source of truth.

The implementation uses a swappable provider interface.

Recommended current option:

- Brave Search API for supported web/news/image discovery, country/language controls and a documented API.

Optional providers can be added if current terms/API access permit.

Do not build vNext around the retired Bing Search APIs. Existing Bing RSS behavior can remain only as a temporary low-confidence fallback if it continues to function.

## 16.2 Search modes

- brand-focused;
- product-name focused;
- category + signal terms;
- source-domain focused;
- exact phrase/SKU;
- image discovery only for candidate correlation where permitted;
- news freshness search;
- region/language search.

Search snippets produce `SEARCH_DISCOVERY` evidence. Upstream source retrieval is preferred before lifecycle promotion.

---

# 17. Archive / historical-existence sources

Use to answer **“was this actually new?”**

Sources:

- Common Crawl CDX/URL Index;
- public web archives/Wayback where available and permitted;
- HYPE's own 730-day source snapshots;
- existing Market 2026 product-presence/history files;
- retailer first-seen memory;
- prior HYPE dossiers.

Historical evidence can demote false “new” claims and identify reissues/batches.

---

# 18. Manuals, firmware, software and support artifacts

For each official maker support ecosystem monitor:

- manual index;
- downloads;
- firmware release notes;
- desktop/mobile companion-app supported model list;
- chipset configuration files/templates where publicly intended;
- product FAQ/knowledge base;
- spare-parts compatibility table.

A new model string appearing in official firmware/manual support can be an H3 artifact even before marketing launch.

---

# 19. Chipset / board ecosystem

Track official/public relevant board makers and firmware ecosystems when used in vape hardware, e.g. named DNA/YiHi/Dicodes-class boards and other current chip vendors.

Signals:

- new board model;
- firmware adds named device profile;
- maker announces collaboration;
- compatibility page adds an unannounced mod.

Do not infer device identity from board availability alone.

---

# 20. Public newsletters / email announcements

Create an optional dedicated HYPE mailbox subscribed legitimately to:

- maker newsletters;
- distributor newsletters;
- retailer new-arrival/preorder feeds;
- trade-show press lists;
- specialist media newsletters.

Email collector should ingest only messages sent to the authorized HYPE mailbox and classify sender/domain provenance. It must not read unrelated personal mailboxes.

Newsletter is often earlier than search indexing and deserves its own source family.

---

# 21. Shipment/import intelligence

Optional layer.

Potential public or commercial sources may reveal:

- consignments from known OEM to known distributor;
- product/model descriptions;
- shipping date/quantity where legitimately published.

Use as `discovery_only` or medium artifact depending source provenance. Never infer consumer demand or final market launch solely from a shipment.

Commercial tools such as trade/shipment databases may be Tier-2 additions; architecture must not require them.

---

# 22. Safety / recall / enforcement sources

Monitor official product recalls, safety alerts and enforcement notices where relevant.

Use cases:

- product withdrawal;
- model identity confirmation;
- correction to availability state;
- manufacturer/importer relationship.

These are primarily after-market/negative lifecycle evidence, not prelaunch sources.

---

# 23. Reverse image / media intelligence

HYPE maintains an internal media-fingerprint corpus across evidence sources.

For every permitted image:

- exact SHA hash;
- pHash/dHash;
- dimensions;
- source URL;
- first observed time;
- associated candidate/product;
- crop/near-duplicate relation where useful.

Use cases:

- detect same prototype photo reposted on five sites;
- find the original/earliest origin;
- link a B2B render to a later branded device;
- identify that two “independent” rumor posts use the same source image.

This improves lineage and identity; it does not confirm launch.

---

# 24. Source-policy profiles

Every source adapter has a policy record:

```text
access_method
public_or_authorized
robots_observed
terms_checked_at
api_terms_checked_at
commercial_use_constraints
rate_limit
retention_constraints
copyright_constraints
personal_data_constraints
kill_switch
policy_version
```

Examples of policy-sensitive sources:

- Reddit current API/data terms;
- X API plan/access;
- TikTok research APIs (not assumed available for commercial HYPE);
- Instagram/Facebook platform restrictions;
- Telegram/Discord private/authorized access;
- B2B marketplace terms.

If a policy changes, source state can automatically become `DEGRADED_POLICY` / disabled until reviewed.

---

# 25. Regional/language coverage map

## Tier A — highest priority

### Europe

- Romania
- UK
- Germany/Austria
- France/Belgium
- Italy
- Poland/Central Europe
- Spain/Portugal
- Greece

Languages: RO, EN, DE, FR, IT, PL, ES, PT, EL.

### China / Hong Kong

Critical because many mass-market manufacturers and OEM/ODM operations originate here.

Languages: zh-CN/zh-TW + English export pages.

Sources: maker sites, export/B2B, public Chinese social/video where permitted, trade shows, IP, CT/web.

### North America

US/Canada maker, retailer, creator and regulatory/IP sources.

### Japan

High-end/modder/design sources; JA + EN export/community.

## Tier B

- South Korea
- Indonesia
- Malaysia
- Philippines
- Thailand
- Vietnam
- Turkey
- South Africa
- Australia/New Zealand
- Middle East/UAE event ecosystem

## Coverage rule

A region cannot be marked “covered” merely because generic English web search ran. At least two relevant source families plus fresh direct/entity-specific monitoring are required for a meaningful coverage score.

---

# 26. Query lexicon — concept packs

Maintain versioned language packs.

## English core

`rumor, rumour, leak, leaked, spotted, teaser, sneak peek, coming soon, prototype, engineering sample, pre-production, sample sent, sample received, review sample, first look, announcement, reveal, preorder, presale, waitlist, production, batch, shipping, launch, release, available now, manual, firmware, trademark, design, certification`

## German examples

`Neuheit, Gerücht, Leak, geleakt, Teaser, Vorschau, demnächst, bald erhältlich, Vorankündigung, Vorbestellung, Prototyp, Muster, Vorserie, erste Charge, Veröffentlichung`

## French examples

`nouveauté, rumeur, fuite, teaser, aperçu, bientôt disponible, avant-première, précommande, prototype, échantillon, présérie, lancement, sortie`

## Italian examples

`novità, indiscrezione, fuga di notizie, teaser, anteprima, prossimamente, preordine, prototipo, campione, preserie, lancio, uscita`

## Spanish examples

`novedad, rumor, filtración, teaser, adelanto, próximamente, preventa, prototipo, muestra, preproducción, lanzamiento`

## Polish examples

`nowość, plotka, przeciek, zapowiedź, wkrótce, przedsprzedaż, prototyp, próbka, przedprodukcja, premiera`

## Romanian examples

`noutate, zvon, scurgere/leak, teaser, avanpremieră, în curând, precomandă, prototip, mostră, preproducție, lansare`

## Chinese examples

`新品, 新款, 即将发布, 即将上市, 预告, 预售, 曝光, 泄露, 原型, 工程样机, 样品, 首发, 发布, 评测样品`

## Japanese examples

`新製品, 新作, 発売予定, 近日発売, 予約, ティーザー, リーク, 試作品, サンプル, 先行, 発表`

Lexicons must be curated with observed domain usage; machine translation alone is insufficient.

---

# 27. Discovery scoring for candidate sources

A newly discovered source receives a `SourceCandidateScore` based on:

- link to known entity;
- in-scope content density;
- recency/activity;
- original vs copied content;
- public/authorized accessibility;
- stable URLs/identifiers;
- historical evidence yield;
- noise/spam/affiliate ratio;
- policy clarity;
- region/language gap filled.

Activation example:

```text
>=80 -> eligible for fast review/activation
60–79 -> quarantine sample
40–59 -> low-priority observation
<40 -> reject unless manually promoted
```

Thresholds are versioned and calibrated.

---

# 28. Source health and drift

Per source track:

- HTTP/API success rate;
- parser success;
- meaningful content yield;
- average latency;
- consecutive failures;
- redirect/domain changes;
- robots/terms/policy change;
- content template drift;
- duplicate rate;
- false-positive contribution;
- last useful evidence date.

States:

`HEALTHY`, `DEGRADED_TECHNICAL`, `DEGRADED_POLICY`, `DRIFTED`, `INACTIVE`, `RETIRED`.

A dead source never blocks publication; it reduces Coverage Confidence and triggers admin diagnostics.

---

# 29. Source-family evidence semantics

HYPE UI must explain evidence semantics succinctly:

- **Official maker:** confirms maker's statement.
- **Regulatory/IP:** confirms a public filing/record, not necessarily launch.
- **Reviewer sample:** strong prelaunch evidence, not official release.
- **Retail/distributor:** proves observed listing/availability state, not exact launch unless corroborated.
- **Community rumor:** unverified claim; value increases with independent corroboration/history.
- **Infrastructure:** indicates brand-related web preparation; weak product proof.
- **Archive:** proves prior public existence and is especially useful to reject false novelty.

---

# 30. Maximum-source principle

The source map is considered maximally designed when it has:

1. broad curated seeds;
2. every high-value source family represented;
3. dynamic source discovery;
4. region/language/categorical coverage measurement;
5. source policy/health lifecycle;
6. provenance and lineage;
7. direct-source-first ingestion;
8. regulatory/IP/infrastructure/archives as complementary layers;
9. public/authorized social/community coverage;
10. honest blind-spot reporting.

A private Discord message, deleted post or undisclosed factory prototype cannot be guaranteed. HYPE's goal is therefore **maximum lawful/public-source recall with measurable truth quality**, not a false claim of omniscience.

**End of canonical source map.**
