# HYPE vNext Phase 0 benchmark

This directory freezes the current HYPE implementation before any vNext truth
or public-output behavior changes.

## What is frozen

- `baseline-2026-09-01.json` inventories the current collectors, transforms,
  validators, workflows, Worker, UI/cache integration and public JSON shapes.
- `screenshots/` captures the current Romanian HYPE view at 1366 px and 390 px.
- `fixtures/gold-set.json` contains deterministic positive lifecycle examples.
- `fixtures/adversarial.json` contains false-positive, ambiguity and coverage
  traps.
- `fixtures/protection-bindings.json` binds current safety rules to their source
  files and records intentional current/vNext divergences.
- `benchmark-result-2026-09-01.json` is the deterministic Phase 0 test report.

The fixture products and domains are deliberately synthetic. They represent
real evidence classes without making unsupported claims about real products.
The later cutover benchmark will add at least 100 manually labeled historical
cases, as required by the canonical acceptance specification.

## Commands

Run from the repository root with Node.js 22 or a compatible current Node.js:

```text
node tools/hype-vnext/build-fixtures.js --write
node tools/hype-vnext/capture-baseline.js --write
node tools/hype-vnext/capture-baseline.js --check
node tools/hype-vnext/run-benchmark.js
```

To refresh the committed deterministic result after an intentional benchmark
change:

```text
node tools/hype-vnext/run-benchmark.js --write-report
```

## Fixture contract

Every case records:

- stable case and observation IDs;
- product identity, category, authenticity and region;
- source family and independent origin ID;
- observed, published and claimed-event clocks;
- explicit date semantics;
- expected novelty, timeline, H-stage, lineage count and warnings;
- whether the outcome is retained, rejected, queued, split or shown only as a
  signal.

At least 40% of the Phase 0 set must remain negative, ambiguous or adversarial.
Copied pages and same-creator cross-posts count as one independent origin.

## Safety boundary

Phase 0 is additive. It does not edit current collectors, public HYPE data,
current UI paths, the service worker or the 06:00/06:20 workflow. A baseline
drift fails the benchmark instead of silently accepting a changed contract.
