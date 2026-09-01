# HYPE vNext implementation status

**Phase:** 0 - current baseline and regression contract
**Status:** implemented and self-audited on `codex/hype-vnext-00-baseline`; draft PR #18 awaits approval
**Date:** 2026-09-01
**Rollback point:** `6bf2acc68ec8af7c44db4b5c6e78f0ab771bb1df`

## Scope completed

Phase 0 is strictly additive. No current collector, workflow, public JSON,
public UI, service-worker path or refresh Worker behavior is changed.

Implemented:

- deterministic inventory and baseline generator;
- frozen contracts for 76 implementation/integration files and 12 public data
  files;
- desktop and mobile HYPE UI baseline screenshots;
- 44 deterministic lifecycle fixtures, 26 adversarial (59.1%);
- source-lineage, chronology, true-zero and incomplete-scan fixture contracts;
- executable regression checks against the current consolidator;
- DST-aware 06:00 Europe/Bucharest reference tests;
- dedicated vNext Phase 0 CI workflow;
- this compatibility, risk and next-phase ledger.

## Frozen current snapshot

Snapshot reference: `2026-08-31T03:00:00.000Z` (06:00 Bucharest).

| Area | Current measured state |
|---|---:|
| Current files/integration boundaries | 76 |
| Current public JSON contracts | 12 |
| RTA/mod/accessory concrete products | 23 |
| RTA/mod/accessory dated events | 6 |
| RTA/mod/accessory public signals | 17 |
| POD concrete products | 40 |
| POD dated events | 5 |
| POD public signals | 35 |
| Direct catalogs working | 49 / 49 |
| Direct classified catalog products | 2,204 |
| Direct recent catalog events | 18 |
| Dated news signals | 49 |
| Retail campaign signals | 6 |

The last observed successful global run was GitHub Actions run `33402605198`
(run 55), from `2026-08-31T14:26:09Z` to `14:36:10Z`, duration 601 seconds.
Its published data commit was `4f43d64ebc0f2e57585954f682e0fbfdfdaf522d`.

## What is already good and must stay

Keep unchanged until a shadow implementation proves parity:

- `tools/hype-window-reference-2026.js` and its Bucharest/DST behavior;
- current canonical product and POD/accessory category classifiers;
- prior-existence memory and relisting demotion;
- new-arrival, restock, promotion, sitemap and JSON-LD truth gates;
- the single-retailer corroboration gate;
- direct catalog adapters and their availability/release separation;
- current public data paths, UI, loading guard and service-worker behavior;
- the current 06:00/06:20 workflow as the production fallback;
- public/authorized-only source policy.

## What must be refactored beside the live system

| Current behavior | vNext requirement |
|---|---|
| Exact symmetric +/-30 day event filter | Separate 30-day signal observation, 30-day release, 180+ day forecast and 730-day history clocks |
| One dominant row and `eventDate` | Immutable evidence and event-claim timeline |
| `eligibleSources` counts source types | Independent-origin and source-family lineage counts |
| Fixed `q.slice(0,150)` plan | Budgeted Query Factory without a global fixed slice |
| Bing RSS embedded in collectors | Search-provider abstraction; direct adapters remain primary |
| Mutable public JSON as working state | Canonical vNext store plus generated legacy-compatible projections |
| Whole workflow dispatched for refresh | Incremental orchestration after the event model is proven |
| One monolithic sequential workflow | Source-family tasks with explicit completeness/health output |

## Deferred deprecations

These are not removed in Phase 0. They may be retired only after parity, shadow
runs and acceptance review:

- `tools/enforce-market-hype-symmetric-window-2026.js` as canonical truth;
- the `Hype Radar v3:` stdout sentinel used to stop the child process;
- raw URL/source-type counts presented as corroboration;
- current mutable product snapshots as canonical lifecycle storage;
- manual refresh dispatch of the complete global workflow.

## Compatibility contract

1. Existing files and URLs remain byte-identical in Phase 0.
2. Existing HYPE UI continues reading the same JSON paths.
3. Existing Market synthesis and loading guard remain unchanged.
4. Existing service-worker cache/network rules remain unchanged.
5. The future `legacy-compat` projector must emit records accepted by the
   current UI before any cutover flag can be enabled.
6. Production and vNext run side by side until acceptance gates pass.

## Benchmark result

- 44 Phase 0 deterministic cases;
- 26 negative/ambiguous/adversarial cases (59.1%);
- 635 assertions;
- 12 source-bound current protection bindings;
- 12 executable checks against current consolidation behavior;
- 4 Bucharest/DST clock checks;
- copied 20-page press release collapses to one origin;
- same reviewer on three platforms collapses to one origin;
- known relisting, stale ETA, snippet-only, first-seen-only and new-arrival-only
  cases cannot be labeled as a new release by the target contract;
- complete zero and incomplete scan are distinct expected states.

The final cutover requirement of at least 100 manually labeled retrospective
cases is intentionally not claimed in Phase 0. It belongs to the third
milestone after the vNext event and scoring engines exist.

## Phase 0 PR audit

Audit result: no unresolved material finding.

- GitHub PR #18 is mergeable and targets only the frozen specification branch.
- The complete PR file list contains additions only; no current HYPE/runtime
  file is modified.
- New and current validators pass in a clean detached worktree.
- GitHub HYPE vNext, Market 2026 and RTA Guide checks pass.
- Baseline hashes are newline-normalized so Windows and Linux CI agree.
- One review finding was fixed: feature-branch pushes initially started the new
  CI both as `push` and `pull_request`; the duplicate branch trigger was removed.

Residual limits are explicit rather than hidden: Phase 0 fixtures are
deterministic synthetic evidence cases, the operational run observation is a
dated snapshot, and the 100-case retrospective corpus remains a later cutover
gate.

## Risks found

1. The current symmetric window deletes fresh signals whose ETA is farther than
   30 days, despite an earlier collector being able to preserve them.
2. Current consolidation loses full rumor -> prototype -> announcement ->
   release history by selecting a dominant row.
3. Current corroboration can be inflated or distorted because source type is
   not source lineage.
4. A fixed global query cap makes source order affect coverage.
5. Current "global" status is maker/source-count oriented, not a measured
   family x region x language x category x freshness matrix.
6. Mutable JSON and a long sequential job make partial failure and recovery
   difficult to distinguish from a trustworthy zero.
7. Search-provider concentration can reduce discovery while direct adapters are
   healthy.

## Exact Phase 1 file/module plan

Create only additive modules first:

```text
data/hype-vnext/schema-version.json
data/hype-vnext/evidence.json
data/hype-vnext/event-claims.json
data/hype-vnext/projections/legacy-products.json
data/hype-vnext/projections/legacy-pods.json

tools/hype-vnext/lib/ids.js
tools/hype-vnext/lib/date-semantics.js
tools/hype-vnext/lib/schema-contract.js
tools/hype-vnext/lib/evidence-envelope.js
tools/hype-vnext/lib/event-claim.js
tools/hype-vnext/stores/json-evidence-store.js
tools/hype-vnext/stores/json-event-store.js
tools/hype-vnext/stores/json-projection-store.js
tools/hype-vnext/ingest/current-evidence-adapter.js
tools/hype-vnext/projectors/legacy-compat.js
tools/hype-vnext/tests/core-schema.test.js
tools/hype-vnext/tests/legacy-compat.test.js
```

Phase 1 will ingest a controlled copy of current evidence into versioned vNext
JSON, preserve multiple lifecycle claims and emit current-style compatibility
records. It will not switch the public UI or production workflow.

## Next gate

Draft PR #18 targets the frozen specification branch and has passed the Phase 0
technical audit. Begin Phase 1 only after the user approves continuation; do
not merge or alter the public HYPE path automatically.
