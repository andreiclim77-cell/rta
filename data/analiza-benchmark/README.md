# ANALIZA ROMANIA vNext Phase 0 benchmark

This directory freezes the current ANALIZA implementation before any vNext
collector, schema, scoring, workflow or public UI behavior is changed.

## Contents

- `baseline-2026-09-01.json`: runtime inventory, public JSON shapes, source
  health, category/POD coverage, workflow contracts, observed full-run
  durations, UI dependencies and known structural gaps;
- `fixtures/gold-set.json`: deterministic positive/current target cases;
- `fixtures/adversarial.json`: deterministic ambiguity and false-positive
  cases;
- `fixtures/protection-bindings.json`: current protections that future phases
  must preserve and intentional current/vNext divergences;
- `screenshots/`: current unlocked Analysis UI on desktop and mobile;
- `benchmark-result-2026-09-01.json`: executable Phase 0 result.

## Important anomaly resolution

`data/market-sales-2026.json` is not empty or corrupt. The checked file is a
valid 2.9 MB JSON projection with 831 Tier-B ranking rows and 51 Tier-C demand
signals. It has zero Tier-A sales rows, 0% Tier-A coverage and correctly keeps
national units and national market-share flags disabled.

Therefore:

- its schema, ranking/proxy rows, coverage flags and known gaps are safe to
  freeze as the current baseline;
- it is not safe to treat it as observed product sales, national unit volume
  or national market-share truth;
- the earlier empty connector observation was a representation/fetch issue,
  not evidence that the repository file was empty.

## Reproduce

From the repository root:

```powershell
node tools/analiza-vnext/build-fixtures.js --write
node tools/analiza-vnext/capture-baseline.js --write
node tools/analiza-vnext/run-benchmark.js --write-report
```

CI and audits should use the last command without rewriting fixtures or the
baseline:

```powershell
node tools/analiza-vnext/run-benchmark.js
```

The benchmark fails on fixture drift, baseline drift, missing current safety
bindings, missing screenshots, unsafe Tier-A/national-share claims or changed
current semantics.

## Scope boundary

Phase 0 is additive and inert. It does not change current collectors, public
JSON, the password-protected UI, service-worker behavior, the 06:00/07:00
workflows or their direct-to-main publication path. Those changes start only
in later phased PRs after compatibility and shadow-run gates exist.
