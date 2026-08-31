# HYPE Maximum Operating Procedures

**Status:** CANONICAL SOP — v1.0  
**Date:** 2026-09-01  
**Purpose:** define exactly how HYPE operates from source discovery to public publication, correction and retrospective calibration.

This SOP is mandatory companion material to the HYPE blueprint. It describes **procedures**, not only architecture.

---

# 0. Governing principles

1. Evidence first; conclusions second.
2. Preserve raw provenance and chronology.
3. Rumors are included, but labeled.
4. No source can prove more than its semantics permit.
5. Independent corroboration means independent origin, not multiple URLs.
6. Unknown/conflicted is preferable to a fabricated conclusion.
7. All automatic promotions/demotions must be explainable.
8. Product-specific patches are last resort; generic rules are preferred.
9. Coverage failures reduce confidence instead of becoming fake zero-findings.
10. Current live HYPE remains available until vNext passes cutover gates.

---

# SOP-01 — Daily source planning

Input:

- active source registry;
- source health;
- unresolved product candidates;
- event calendar;
- approaching forecast dates;
- coverage gaps;
- prior run failures;
- budget/cost limits.

Procedure:

1. generate mandatory direct-source tasks;
2. increase priority for H3–H5 candidates and active events;
3. allocate multilingual search tasks to uncovered brand/source-family cells;
4. allocate regulatory/IP/certification checks by their natural update cadence;
5. schedule deep archive/history scans separately;
6. record planned coverage matrix before execution.

Output: immutable `scan_plan` with reason and priority per task.

---

# SOP-02 — Source discovery

Trigger sources include:

- new brand/product name;
- event exhibitor;
- retailer manufacturer facet;
- IP applicant;
- regulatory submitter/importer;
- designer/collaborator;
- recurring early reviewer;
- new linked domain/social account;
- new specialist publication cited by known sources.

Procedure:

1. normalize source identity/domain/account;
2. link to known entity if possible;
3. classify source family;
4. determine region/language/category;
5. verify public/authorized access path;
6. sample recent content;
7. estimate original-content ratio/noise/duplicate rate;
8. create source candidate score;
9. quarantine before activation.

No candidate source becomes release-truth eligible automatically.

---

# SOP-03 — Source policy review

For every source/adapter record:

- access method;
- robots state where applicable;
- terms/API terms review timestamp;
- rate limits;
- commercial-use constraints;
- retention/copyright constraints;
- personal-data considerations;
- kill switch.

If policy becomes uncertain: `DEGRADED_POLICY`, no further collection beyond permitted safe behavior until reviewed.

---

# SOP-04 — Source technical health

Measure:

- HTTP/API success;
- response latency;
- parser success;
- meaningful-yield rate;
- content-template drift;
- redirect/domain migration;
- duplicate rate;
- consecutive failures;
- last useful evidence.

States:

`HEALTHY`, `DEGRADED_TECHNICAL`, `DRIFTED`, `INACTIVE`, `RETIRED`.

A dead source reduces CC; it does not create “no launches”.

---

# SOP-05 — Direct maker-site scan

Order:

1. sitemap index diff;
2. news/product sitemap diff;
3. RSS/Atom;
4. support/manual/firmware indices;
5. product/category pages;
6. page-change checks;
7. structured metadata and canonical links;
8. newly exposed PDFs/assets.

Use conditional requests and hashes. Emit semantic deltas rather than treating every HTML change as a product signal.

---

# SOP-06 — Official social scan

For each official account:

1. retrieve permitted public posts/metadata;
2. preserve platform post ID, author/account, published time;
3. detect teaser/prototype/sample/preorder/release/delay language;
4. fingerprint attached media when permitted;
5. link destination URLs;
6. create event claim without assuming it came true.

Official-authored statement has high source authenticity, but future ETA needs follow-up.

---

# SOP-07 — Reviewer/sample network scan

For known reviewers:

1. monitor public titles/descriptions/posts;
2. detect direct possession vs hearsay;
3. identify sample/prototype/first-look wording;
4. record product identity confidence;
5. calculate reviewer historical lead-time and calibration;
6. cluster cross-posts by the same reviewer into one origin.

A second reviewer only counts independently if evidence indicates independent receipt/observation.

---

# SOP-08 — Forum/community rumor scan

Procedure:

1. search category/brand/signal terms in regional language;
2. capture minimum necessary author/account continuity information;
3. classify direct observation vs quotation/hearsay;
4. preserve links/images/screenshot context;
5. find explicit upstream attribution;
6. lineage-cluster obvious reposts;
7. assign H1/H2 only after identity checks.

Anonymous rumor can remain valuable but cannot be transformed into certainty by repetition.

---

# SOP-09 — Retail/distributor scan

For each retailer/product:

Track state transitions:

`UNKNOWN -> PLACEHOLDER -> COMING_SOON -> WAITLIST -> PREORDER -> BACKORDER -> IN_STOCK -> OUT_OF_STOCK -> DISCONTINUED/REMOVED`.

Procedure:

1. preserve first-observed timestamps by retailer;
2. compare against 730-day product history;
3. parse SKU/product/brand/variant;
4. distinguish catalog publication date from release date;
5. compare multiple independent retailers/distributors;
6. check official maker evidence;
7. never classify generic `new arrival` alone as H6.

---

# SOP-10 — Clone ecosystem scan

Procedure:

1. detect clone maker separately;
2. identify claimed original;
3. preserve clone revision/batch;
4. verify identity by naming/image/spec/compatibility;
5. create `CLONE_RELEASE` lifecycle independent of original;
6. use clone listing as discovery evidence for original only when chronology supports it.

Never use a clone launch to date the authentic product.

---

# SOP-11 — OEM/ODM/B2B scan

Procedure:

1. detect new unbranded/private-label hardware;
2. capture model code/dimensions/chipset/render;
3. compare with known branded candidates;
4. image/text/spec similarity;
5. create white-label hypothesis only when multiple features align;
6. maintain `discovery_only` until corroborated.

Do not invent the future customer/brand.

---

# SOP-12 — Regulatory scan

For every jurisdiction adapter:

1. store publication semantics and scope;
2. diff new records/datasets;
3. normalize submitter/brand/product identifiers/type;
4. distinguish record date, publication date and intended-market date where exposed;
5. link to known/new product candidate;
6. emit `REGULATORY_NOTIFICATION/RECORD` artifact;
7. never convert public file publication directly to release date.

---

# SOP-13 — Trademark/design scan

Procedure:

1. search known legal owner/brand/designer names;
2. collect recent publications/filings;
3. normalize mark/design owner and classification;
4. identify exact product-like names vs generic marks;
5. image/design similarity where available;
6. link to candidate only with sufficient identity evidence;
7. emit H3 artifact.

Abandoned/refused/withdrawn status can become negative evidence.

---

# SOP-14 — Patent/utility-model scan

Procedure:

1. search applicant/inventor/company aliases;
2. use technical term and IPC/CPC packs;
3. identify new published applications;
4. extract engineering concepts, not marketing names unless explicitly present;
5. connect applicant/OEM relationships;
6. create unnamed technology/platform candidate if useful;
7. never fabricate a commercial model name.

---

# SOP-15 — Certification/qualification scan

For FCC/Bluetooth/other public systems where relevant:

1. search company/model identifiers;
2. collect public product/model/certification metadata;
3. retrieve public manuals/labels/photos only when provided lawfully;
4. compare model code with existing candidate;
5. emit certification artifact;
6. keep certification date distinct from release date.

---

# SOP-16 — Advertising-transparency scan

Procedure:

1. search advertiser/legal company/brand/domain;
2. detect new creatives/product names;
3. capture campaign destination URL and first observed date;
4. fingerprint creative media;
5. compare with leak/teaser images;
6. determine region/campaign where public;
7. emit `MARKETING_SIGNAL`;
8. follow landing page through normal direct-source evidence rules.

---

# SOP-17 — App/firmware/software scan

Procedure:

1. monitor public app-store pages and official download centers;
2. diff changelog/supported-device list;
3. detect new device/model strings;
4. preserve version/date;
5. link to brand/product candidate;
6. create `FIRMWARE_SUPPORT` / `SOFTWARE_SUPPORT` artifact;
7. boost direct maker scan for 30 days.

---

# SOP-18 — Trade-show scan

Before event:

- exhibitor list diff;
- booth/floorplan changes;
- innovation/award list;
- exhibitor announcements.

During event:

- official event news;
- maker/public reviewer posts;
- product reveal/demos.

After event:

- recap/review/product naming;
- corrected dates.

Event presence proves presentation only if tied to product evidence; it does not guarantee market release.

---

# SOP-19 — Infrastructure / site-change scan

Monitor:

- CT certificates;
- RDAP/domain data;
- new subdomains;
- sitemap/robots changes;
- public search autocomplete;
- new support/product slugs;
- archive/Common Crawl first/previous existence.

Require brand/entity linkage. Infrastructure alone cannot exceed artifact signal.

---

# SOP-20 — Accessory-before-parent procedure

When a new accessory references an unknown parent:

1. extract parent/model token;
2. search maker/support/retail/social/IP/regulatory sources;
3. check historical existence;
4. create `UNCONFIRMED_PARENT_CANDIDATE` if concrete;
5. link accessory evidence;
6. prioritize parent scan;
7. never treat accessory release as parent release.

---

# SOP-21 — Raw evidence preservation

For every evidence item store:

- immutable evidence ID;
- source/source endpoint;
- retrieved URL/canonical URL;
- observed time;
- source publish time if credible;
- title/minimal excerpt;
- content/media hash;
- parser/collector version;
- source policy version;
- region/language;
- evidence type;
- provenance chain.

Corrections create new evidence/tombstone metadata; they do not silently rewrite history.

---

# SOP-22 — Normalization

Normalize without destroying original evidence:

- Unicode/diacritics;
- dates/timezones;
- brand aliases;
- product tokens;
- SKU/GTIN/EAN/UPC/model codes;
- category/subtype;
- region/language;
- URLs/canonicals.

Original text remains preserved separately.

---

# SOP-23 — Product/entity resolution

Use weighted features:

- brand alias;
- exact model tokens;
- family/version;
- identifiers;
- dimensions/specs/chipset;
- image similarity;
- accessory compatibility;
- collaboration/designer context;
- source context.

Hard rules:

- similar name alone is insufficient;
- authentic and clone do not merge;
- region variant does not overwrite global identity;
- unnamed candidate remains unnamed.

Ambiguous cases enter manual review queue.

---

# SOP-24 — Evidence lineage / independence

For every new evidence item determine whether it is:

- original;
- derivative/repost;
- syndicated press release;
- cross-post from same account/person;
- retailer feed derivative;
- unknown lineage.

Methods:

- explicit attribution;
- canonical links;
- publication order;
- text similarity;
- image/video fingerprint;
- identical SKU/descriptions;
- account identity.

Store `rawEvidenceCount`, `originClusterCount`, `independentFamilyCount` separately.

---

# SOP-25 — Lifecycle claim construction

Evidence can generate one or more claims:

`RUMOR, LEAK, DESIGN_FILED, PATENT_PUBLISHED, CERTIFICATE_SIGNAL, MANUAL_DISCOVERED, TEASER, PROTOTYPE, REVIEW_SAMPLE_RECEIVED, PRODUCTION_START, WAITLIST, PREORDER, OFFICIAL_ANNOUNCEMENT, FIRST_RETAIL_OBSERVATION, IN_STOCK, OFFICIAL_RELEASE, BATCH, VARIANT, DELAYED, CANCELLED, WITHDRAWN, CORRECTION`.

Every claim records:

- evidence IDs;
- claimed date/interval;
- observed time;
- confidence components;
- supporting and contradicting evidence.

---

# SOP-26 — Novelty classification

Before HYPE says “new”, compare against:

- 730-day HYPE history;
- Market product presence/history;
- archives/Common Crawl;
- product-family version sequence;
- prior retailer first-seen;
- image/spec similarity;
- SKU/model code;
- official revision wording.

Output exactly one working class:

`NEW_MODEL`, `NEW_REVISION`, `NEW_VARIANT`, `NEW_ACCESSORY`, `NEW_REGION`, `RESTOCK`, `RELISTING`, `BATCH`, `UNKNOWN`.

Do not publish H6 “new product” for RESTOCK/RELISTING/BATCH/VARIANT unless UI explicitly labels that lifecycle event instead.

---

# SOP-27 — Scoring

Recompute independently:

- EC Evidence Confidence;
- IC Identity Confidence;
- DC Date Confidence;
- LP Launch Probability;
- NC Novelty Confidence;
- HM Hype Momentum;
- CC Coverage Confidence.

Every score run stores:

- scoring version;
- input evidence IDs;
- component values;
- penalties/bonuses;
- previous score;
- reason for change.

Momentum cannot elevate factual truth on its own.

---

# SOP-28 — H-stage promotion/demotion

Promotion ladder:

`H0 -> H1 -> H2 -> H3 -> H4 -> H5 -> H6 -> H7`.

Each transition requires explicit gate evidence.

Demotion/side states:

- evidence disproved;
- identity split;
- date conflict;
- relisting discovered;
- batch/variant reclassification;
- maker denial;
- cancellation/withdrawal;
- source fraud/compromise.

Never promote merely because time passed beyond an ETA.

---

# SOP-29 — Release truth gate

Before H6:

1. exact product identity resolved;
2. qualifying release/availability evidence exists;
3. date semantics are sufficient;
4. novelty class qualifies;
5. authentic/clone/region distinction resolved;
6. stale ETA protection passes;
7. contradictory evidence reviewed;
8. evidence is traceable.

If any critical condition is unknown: remain H4/H5/WATCH rather than fabricate release.

---

# SOP-30 — Forecast interval procedure

Forecast may use:

- official ETA;
- preorder date;
- review-sample lead-time history;
- maker historical teaser-to-release timing;
- event schedule;
- production/distributor signals;
- explicit regulatory/certification timing only when semantics support it.

Output an interval, not false precision:

`0–30`, `31–60`, `61–90`, `91–180`, `>180`, `UNKNOWN`.

If source gives exact date, store exact claim but still display confidence.

---

# SOP-31 — Contradiction arbitration

When evidence conflicts:

1. preserve both claims;
2. identify source semantics/directness;
3. check whether claims refer to different regions/batches/variants;
4. check source corrections/update chronology;
5. score each claim;
6. set `CONFLICTED` if unresolved;
7. display conflict in dossier;
8. schedule targeted follow-up scan.

Never delete the losing claim from history.

---

# SOP-32 — Correction / denial / cancellation

On explicit correction:

1. ingest correction as new evidence;
2. connect it to superseded claim;
3. update projection/status;
4. preserve original evidence and correction chain;
5. lower relevant scores if appropriate;
6. publish visible correction/change reason if previous public status materially changed.

---

# SOP-33 — Source fraud / compromised source procedure

If a source is discovered to be fake, hacked, spoofed or systematically unreliable:

1. quarantine source immediately;
2. mark affected evidence lineage;
3. recompute all dependent dossiers/scores;
4. identify public claims that changed;
5. issue corrections if needed;
6. preserve audit trail;
7. require review before reactivation.

---

# SOP-34 — Manual review queue

Manual review triggers:

- H5->H6 with ambiguous date;
- identity confidence below threshold;
- authentic/clone ambiguity;
- high-impact contradictory sources;
- unnamed candidate with attempted merge;
- unusual source-policy issue;
- novel parser/source family;
- automatic score jump above configured threshold;
- user-reported error.

Manual decisions store reviewer decision, reason, evidence and expiration/review date. They must not be undocumented one-off edits.

---

# SOP-35 — Publication projection

Generate read models separately:

- `RELEASED_30D`;
- `RADAR_SIGNAL_30D`;
- `RUMORS`;
- `WATCHLIST_CHANGES`;
- `COVERAGE`;
- optional `LEGACY_COMPAT`.

Each public card must show:

- stage/status;
- evidence confidence language;
- first signal/latest change;
- expected launch interval if any;
- independent origin count;
- evidence link/timeline;
- explicit rumor/not-confirmed wording where applicable.

Never hide stale/degraded system state.

---

# SOP-36 — Watchlist change detection

A watch notification is triggered by **material delta**, not every rescan.

Material deltas include:

- new independent origin;
- stage transition;
- score threshold crossing;
- official teaser/announcement;
- ETA changed;
- sample received;
- preorder opened;
- release verified;
- cancellation/delay/correction;
- new artifact family (IP/regulatory/manual/certification);
- source coverage materially degraded.

---

# SOP-37 — Coverage calculation

For each category/region/language/brand calculate:

- expected source-family cells;
- active/healthy cells;
- stale cells;
- failed/policy-disabled cells;
- history depth;
- direct-source availability;
- generic-search fallback dependence.

Coverage gaps must be visible in admin and influence CC.

---

# SOP-38 — Empty-result procedure

If a scan returns zero valid products:

1. verify plan executed;
2. verify source health/coverage;
3. verify parsers/search provider;
4. distinguish `TRUE_ZERO` vs `INCOMPLETE_SCAN`;
5. publish zero only if coverage confidence is sufficient;
6. otherwise show degraded/incomplete status.

Zero results are acceptable; invented results are not.

---

# SOP-39 — Daily QA gate

Before publication:

- schema validation;
- required provenance;
- no duplicate product identity collapse;
- release gate audit;
- stale ETA audit;
- relisting/batch/variant audit;
- lineage/corroboration audit;
- category validation;
- 30-day signal/release-window validation;
- source freshness/CC check;
- UI contract validation.

Fail closed for H6/H7 if critical truth checks fail.

---

# SOP-40 — Retrospective backtest/calibration

Weekly/monthly:

1. take past H1–H5 candidates;
2. determine eventual outcome where knowable;
3. measure lead time and false rumor rate by source/family;
4. calibrate source priors and LP model;
5. measure H6/H7 precision;
6. examine missed known launches;
7. add adversarial fixtures;
8. version any scoring/rule changes.

Never tune solely to increase counts.

---

# SOP-41 — New known-launch recall test

Maintain an independently curated retrospective set of real launches across RTA/MOD/accessory/POD/AIO/Boro/clone.

Measure:

- whether HYPE saw a signal before release;
- first lead-time;
- earliest independent origin;
- stage progression quality;
- final release detection;
- false novelty classification.

This is the practical proxy for rumor recall; “all internet rumors” is unknowable.

---

# SOP-42 — Incident response

Incident types:

- crawler runaway;
- corrupted evidence store;
- stale publication;
- source-policy breach;
- compromised credential;
- mass false positive;
- parser drift;
- broken UI projection.

Procedure:

1. stop affected adapter/publisher via kill switch;
2. preserve incident state/logs;
3. fall back to last known good projection;
4. isolate affected source/evidence;
5. repair and rerun QA/backtest;
6. publish correction if public data was wrong;
7. document root cause and regression test.

---

# SOP-43 — Backup / disaster recovery

Maintain:

- immutable/append-only evidence backups;
- source registry/config versioning;
- compact published snapshots;
- scoring/rule versions;
- benchmark fixtures;
- restore procedure for canonical datastore.

Test restore periodically. GitHub static output is not the only canonical backup once D1/R2 becomes primary.

---

# SOP-44 — Cost control

Track cost per useful evidence item by collector/provider.

When reducing spend, cut in this order:

1. low-yield broad generic queries;
2. duplicate search coverage;
3. low-priority historical/inactive sources;

Protect first:

- direct official sources;
- unresolved high-stage candidates;
- release verification;
- regulatory/IP/certification high-value scans;
- QA/lineage/history.

---

# SOP-45 — Quarterly source-universe review

Quarterly or when major market/platform change occurs:

- discover new makers/retailers/forums/platforms;
- review inactive/retired sources;
- recheck APIs/terms;
- verify event list;
- refresh language packs;
- review regional gaps;
- review new certification/regulatory/IP sources;
- verify search providers;
- update gold set and source priors.

---

# SOP-46 — Definition of operational completeness

The HYPE procedures are operationally complete only when the system can answer, with audit trail:

1. What was found?
2. Where was it found?
3. When did HYPE see it?
4. When did the source publish/claim it?
5. Is the source original or derivative?
6. Which exact product/candidate is it about?
7. Is it genuinely new?
8. Is it authentic/clone/variant/batch/region-specific?
9. What lifecycle event does it support?
10. What contradicts it?
11. Why did status/score change?
12. How complete was the scan?
13. What failed or could not be checked?
14. What evidence would promote/demote it next?
15. Can the public conclusion be reproduced from stored evidence?

If any of these cannot be answered, HYPE is not yet at maximum intelligence quality.
