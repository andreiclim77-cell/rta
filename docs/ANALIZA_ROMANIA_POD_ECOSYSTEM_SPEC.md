# ANALIZA ROMÂNIA vNext — POD / AIO / BORO Ecosystem Specification

**Status:** CANONICAL POD COMPANION SPEC — v1.0  
**Date:** 2026-09-01

---

# 0. Purpose

POD analysis must answer a different question from a simple product ranking:

> **Is this device/platform commercially strong and sustainably usable in Romania, or is the device visible while its replacement ecosystem is weak?**

The current classifier correctly avoids treating many replacement pods/coils as devices. vNext goes further: it keeps them as separate entities and links them to the device platform.

---

# 1. Canonical POD entity types

```text
POD_DEVICE
POD_PLATFORM
OPEN_POD_DEVICE
CLOSED_POD_DEVICE
POD_MOD
AIO_DEVICE
BORO_HOST
BORO_BRIDGE_RBA
REPLACEMENT_POD
PREFILLED_POD
CARTRIDGE
COIL_FAMILY
COIL_VARIANT
POD_ACCESSORY
CHARGING_DOCK
```

Optional separate scope:

`DISPOSABLE_DEVICE` — never silently merged with refillable systems.

---

# 2. Platform identity

Examples of platform concepts:

- XROS platform;
- Caliburn platform/families;
- XLIM platform;
- Argus pod platform;
- Vinci platform;
- VMATE platform;
- Wenax/Sonder families;
- Novo/Nord/RPM families;
- Ursa/Orion families;
- Gotek/Flexus/Pixo families;
- Klypse/Trine families;
- dotPod families;
- closed/prefilled ecosystems such as Vuse/VEEV/RELX/KIWI/SKE/Elf Bar platform families where relevant to the chosen scope.

The registry is dynamic; series names are not permanent truth.

---

# 3. Compatibility relationship model

Required edge types:

```text
DEVICE --member_of--> PLATFORM
DEVICE --uses_replacement_pod--> REPLACEMENT_POD_FAMILY
DEVICE --uses_coil--> COIL_FAMILY
REPLACEMENT_POD --compatible_with--> DEVICE/PLATFORM
COIL --compatible_with--> DEVICE/PLATFORM/POD_FAMILY
ACCESSORY --compatible_with--> DEVICE/PLATFORM
REPLACEMENT_POD --supersedes--> REPLACEMENT_POD
COIL --generation_of--> COIL_FAMILY
```

Every edge has:

- evidence source;
- first/last verified;
- exact model/version range;
- compatibility confidence;
- region if relevant;
- notes about partial/backward compatibility.

---

# 4. Compatibility truth hierarchy

High:

- official manufacturer compatibility page/manual/product page;
- official retailer/manufacturer structured compatibility data.

Medium:

- multiple specialist Romanian retailers consistently stating the same compatibility;
- official distributor documentation.

Low:

- isolated retailer text;
- community claim.

Do not auto-merge merely because product names share `XROS`, `Caliburn`, etc. Generation exceptions must be preserved.

---

# 5. Device metrics

Per device/model:

- listed storefronts/operators;
- in-stock storefronts/operators;
- bestseller storefronts/operators;
- explicit Tier-A stores;
- price min/median/max;
- promo incidence;
- stock continuity;
- new listing/delisting flow;
- Romanian Google search volume;
- Romania search trend;
- guide intent;
- Romanian community signal;
- commercial signal strength;
- data confidence.

---

# 6. Replacement ecosystem metrics

Per POD platform:

## Replacement pods/cartridges

- listed storefronts;
- in-stock storefronts;
- number of compatible pod families;
- ohm/capacity variant count;
- median current price per unit/pack;
- stock continuity;
- bestseller/ranking presence where available;
- search demand for cartridge/pod name.

## Coils

- listed/in-stock storefronts;
- compatible coil families;
- resistance variants;
- price per coil/pack normalized;
- stock continuity;
- ranking/demand evidence.

## Closed/prefilled systems

- compatible prefilled pod/flavor SKU breadth if included in project scope;
- retailer breadth;
- availability continuity;
- device-vs-consumable balance.

Do not interpret flavor count as independent platform adoption.

---

# 7. Ecosystem Health Score (EHS)

Initial components:

```text
DeviceDistributionBreadth   25%
ReplacementPodBreadth       20%
CoilConsumableBreadth       15%
DeviceCommercialSignal      15%
ConsumableCommercialSignal  10%
StockContinuity             10%
RomanianDemand               5%
```

Adjust for architecture:

- integrated-coil pods: move coil weight to replacement-pod breadth/stock;
- closed systems: move coil weight to prefilled-consumable breadth;
- AIO/Boro: apply bridge/tank/coil ecosystem variant designed for that platform.

Every score stores exact effective weights.

---

# 8. Ecosystem risk model

Risk flags:

```text
DEVICE_WIDE_CONSUMABLE_NARROW
DEVICE_IN_STOCK_CONSUMABLE_OOS
CONSUMABLE_SINGLE_OPERATOR
COIL_SINGLE_OPERATOR
HIGH_DEVICE_DEMAND_LOW_CONSUMABLE_BREADTH
PLATFORM_FRAGMENTED_COMPATIBILITY
OLD_GENERATION_CONSUMABLE_RISK
PRICE_SPIKE_CONSUMABLE
DATA_GAP
```

Strong device signal + high ecosystem risk cannot become an uncomplicated `CORE/GROW` recommendation.

---

# 9. Ecosystem lifecycle

Track:

- device launch/first Romanian listing;
- replacement pod first Romanian listing;
- coil first Romanian listing;
- compatible generation change;
- device delisting;
- consumable delisting;
- replacement generation introduced;
- legacy support narrowing;
- discontinuation evidence.

This allows ANALIZA to identify platform ageing before only the device disappears.

---

# 10. POD demand query factory — Romania

Generate exact and family-level query sets:

```text
{brand} {model}
{brand} {series}
{series} pod
{series} cartus
{series} cartuș
{series} rezistenta
{series} rezistență
{series} coil
{series} cartridge
{model} Romania
{model} pret   [search demand context only]
{model} cartus
```

For demand metrics, avoid contaminating a device query with generic liquid/flavor searches.

---

# 11. POD classification procedure

1. normalize title/brand;
2. detect device vs accessory/consumable;
3. identify maker/series/platform;
4. assign entity type;
5. resolve generation/model;
6. identify pack quantity for consumables;
7. identify resistance/capacity variant;
8. link compatibility if supported;
9. preserve raw title and source;
10. queue uncertain identity.

---

# 12. Common false positives

Reject or reclassify:

- generic battery chargers containing `pod` in unrelated copy;
- liquid product SEO copy naming popular POD devices;
- lanyards/cases as device;
- cartridge packs as device;
- coil packs as device;
- disposable product as refillable pod;
- generic `pod` packaging unrelated to vape hardware;
- bundle title where device and consumables need split entities.

---

# 13. Pack/price normalization

For replacement consumables store:

- pack quantity;
- price per pack;
- derived price per unit;
- resistance/capacity;
- included pieces;
- promo/regular price.

Do not compare 2-pack and 4-pack prices directly without unit normalization.

---

# 14. Platform breadth vs SKU breadth

Show separately:

- number of storefronts supporting platform;
- number of distinct compatible families;
- number of resistance/flavor/SKU variants.

Five cartridge resistances in one shop are not five stores and not five platform adoptions.

---

# 15. Boro/AIO specialization

For Boro/AIO:

- host device;
- bridge/RBA;
- compatible tank/Boro format;
- coil/deck/airflow accessories;
- proprietary vs standard compatibility;
- host breadth and bridge breadth separately.

Do not collapse Boro bridge popularity into host-device sales.

---

# 16. Closed/prefilled specialization

If included:

- device and consumable pods remain separate;
- prefilled flavor count is assortment, not demand;
- recurring consumable availability is more important than one-off device listing;
- regulatory/product records can support identity but not commercial sell-through.

---

# 17. POD management states

In addition to core ANALIZA states:

```text
POD_CORE_HEALTHY
POD_GROW_HEALTHY
POD_TEST
POD_DEVICE_STRONG_ECOSYSTEM_WEAK
POD_CONSUMABLES_STRONG_DEVICE_WEAK
POD_PLATFORM_AGING
POD_SUPPLY_RISK
POD_DATA_GAP
```

Every state has explicit evidence and triggers.

---

# 18. Cross-retailer platform analysis

For a platform calculate:

- device breadth;
- consumable breadth;
- overlap: stores carrying both device and consumables;
- orphan-device stores;
- consumable-only stores;
- operator overlap;
- geographic physical-store context if available.

Key metric:

`complete_ecosystem_storefront_ratio = storefronts_with_device_and_required_consumables / storefronts_with_device`.

---

# 19. Stock-continuity logic

For each compatible consumable:

- observe daily state;
- calculate 7/30/90d in-stock ratio only over successfully observed days;
- exclude parser/source outage days from denominator;
- distinguish retailer-wide outage from product stock-out.

---

# 20. Ecosystem opportunity

A POD ecosystem can be white space when:

- Romanian device demand is high;
- few local stores carry device;
- replacement ecosystem is available through stable supply sources or begins appearing locally;
- HYPE indicates current platform activity;
- data confidence sufficient.

Downgrade when the device is globally hyped but Romania has no measurable demand.

---

# 21. Ecosystem decline

Potential decline evidence:

- device rank loss;
- device breadth loss;
- replacement-pod breadth loss;
- repeated consumable OOS;
- newer generation cannibalization;
- search demand decline;
- retailer clearance/discontinued labels.

No single signal automatically proves platform decline.

---

# 22. POD-specific acceptance targets

Before production cutover:

- ≥98% device-vs-consumable classification accuracy on curated gold set;
- ≥97% platform/family identity accuracy for active top entities;
- ≥97% compatibility-edge accuracy in manually audited sample;
- 0 known cases where cartridge/coil is shown as device in management ranking;
- 0 known cases where multiple resistance variants inflate storefront breadth;
- price pack-size normalization tests pass;
- source outages cannot create false consumable stock-out trend;
- every POD management recommendation exposes EHS and data confidence.

**End of canonical POD ecosystem spec.**
