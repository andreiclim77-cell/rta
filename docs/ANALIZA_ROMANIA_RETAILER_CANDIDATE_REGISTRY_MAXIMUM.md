# ANALIZA ROMÂNIA vNext — Retailer Candidate Registry / Maximum Baseline

**Status:** CANONICAL DISCOVERY COMPANION — v1.0  
**Date:** 2026-09-01

This registry is deliberately split into **current active seeds**, **new candidates requiring validation**, and **cross-border/context sources**. Inclusion here is not automatic inclusion in national statistics.

---

# A. Current active seed registry — preserve/re-audit

Current `market-retailers-2026.json` contains at least:

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
13. TigaraEgo — `tigaraego.com`
14. Geekvape.ro — `geekvape.ro`
15. VAPS — `vaps.ro`
16. Vapshop.ro — `vapshop.ro`
17. SteamFactory — `steamfactory.ro`
18. Ecig Vapo — `ecig-vapo.com`
19. Merlin.ro — `merlin.ro`
20. Vape.ro — `vape.ro`
21. AlphaVape — `alphavape.ro`
22. SmartVape — `smartvape.ro`

All must be re-audited for:

- RTA;
- MOD;
- POD device;
- POD replacement pods/cartridges;
- POD coils;
- AIO/Boro;
- product-specific accessories;
- ranking/bestseller sources;
- price/stock extraction;
- operator identity.

---

# B. New Romanian candidate storefronts discovered in adversarial search

These are **candidates**, not yet canonical national-denominator members.

## B1. Vapori.ro

Discovery evidence:

- current Compari.ro product offer for Vaporesso XROS 5 identifies `Vapori.ro` as seller;
- product is a POD device relevant to ANALIZA scope.

Required validation:

- direct domain/storefront identity;
- Romania consumer-facing status;
- operator identity;
- public catalog breadth;
- direct stock/price source;
- POD/RTA/MOD category coverage.

Initial state: `DISCOVERED_HIGH_PRIORITY`.

## B2. e-fum.ro

Discovery evidence:

- current Compari.ro Nevoks POD result identifies `e-fum.ro` as seller.

Required validation same as above.

Initial state: `DISCOVERED_HIGH_PRIORITY`.

## B3. Vapingshop.ro

Discovery evidence:

- current Price.ro vape-related result lists `vapingshop.ro` as seller.

Required validation:

- direct store identity;
- hardware scope, especially POD devices/consumables;
- Romania local operator/storefront status;
- product coverage and source health.

Initial state: `DISCOVERED_MEDIUM_PRIORITY`.

## B4. GlobalHubb

Discovery evidence:

- `globalhubb.ro` publicly describes itself as official ELFBAR importer in Romania;
- current store categories include ELFA Pro Kit and ELFA Pro Pod, plus other device/pod families.

This is especially relevant to POD ecosystem intelligence.

Required validation:

- consumer-retail vs importer/distributor dual role;
- operator identity;
- whether direct consumer storefront belongs in local-store denominator;
- device/pod category extraction;
- ranking/sales semantics if exposed.

Initial state: `DISCOVERED_HIGH_PRIORITY_POD`.

## B5. YOOP / letsyoop.com

Discovery evidence:

- public Romanian-language shop offers a YOOP device and compatible pod families priced in lei.

Required validation:

- Romania operator/storefront identity;
- device vs closed/prefilled ecosystem classification;
- whether scope should include this platform under closed/prefilled POD.

Initial state: `DISCOVERED_POD_SPECIALIST`.

---

# C. Cross-border / Romania-serving context candidates

These must **not** enter the local Romanian storefront denominator unless future validation/scope rules say otherwise.

## C1. DashVapes Romania-localized surface

Current public site has a Romania localized route and promotes delivery to Romania, with POD systems/coils/kits.

Initial classification: `CROSS_BORDER_TO_RO_CANDIDATE`.

Use cases if validated:

- Romania-available assortment context;
- price context;
- global/localized bestseller context clearly separated;
- product discovery.

Do not mix with local Romanian operator breadth.

## C2. Vawoo Romania-localized marketplace/storefront

Current public Romanian-language interface exposes multiple sellers/products and POD/mod categories.

Likely marketplace/cross-border semantics.

Initial classification: `CROSS_BORDER_MARKETPLACE_CONTEXT`.

Use only after seller/platform semantics are documented.

---

# D. Distributor/importer candidate layer

ANALIZA should maintain a non-retail source layer for Romanian distributors/importers because they can reveal:

- dealer networks;
- brand availability;
- product introductions;
- authorized sellers;
- POD ecosystem supply.

Examples discovered/known may include entities such as GlobalHubb where importer and consumer-store roles overlap.

Do not count distributor network presence as consumer sales unless direct retailer evidence exists.

---

# E. Physical-network priority

Retailers claiming significant physical networks (for example SmokeMania publicly describes a broad Romanian retail presence) should receive a separate physical-network audit:

- official store locator;
- number of locations;
- cities;
- online-vs-physical operator relationship;
- no assumption of identical inventory across locations.

Physical network breadth is structural distribution context, not online SKU breadth.

---

# F. Candidate discovery escalation rules

High priority if candidate appears through 2+ independent routes, e.g.:

- search + comparison engine;
- maker dealer locator + direct storefront;
- comparison engine + public business page;
- community reference + direct storefront.

Priority levels:

```text
DISCOVERED_HIGH_PRIORITY
DISCOVERED_HIGH_PRIORITY_POD
DISCOVERED_MEDIUM_PRIORITY
DISCOVERED_POD_SPECIALIST
DISCOVERED_LOW_PRIORITY
CROSS_BORDER_TO_RO_CANDIDATE
MARKETPLACE_CONTEXT
REJECTED
```

Candidate priority is not evidence tier.

---

# G. Continuous-discovery rule

This file is a baseline snapshot, not a finite list.

Every national-universe audit must be able to add candidates without code edits. Candidate registry should eventually move to structured data with:

```text
candidate_id
domain
name
discovery_routes[]
first_seen_at
last_seen_at
categories_detected[]
romanian_relevance
consumer_retail_evidence
operator_candidate
validation_state
review_notes
```

---

# H. Maximum baseline conclusion

The current 22-store registry is already meaningful, but adversarial POD-focused discovery found plausible additional Romanian sellers. Therefore vNext must treat national-store coverage as a **continuously discovered and periodically certified universe**, not as a frozen count.

**End of retailer candidate registry.**
