# Evidence integrity audit - 2026-09-05

Status: deployed and verified on ghid-rta.ro. The final generated-data commit is
`eb7aee95da835580549df852b570a318f3f3391d`; GitHub Pages deployment run
`33970358905` completed successfully. This is not a claim of exact national
sales or complete global market coverage.

## Reproduce

Run from the repository root:

```powershell
node tools/test-evidence-integrity.js
node tools/audit-evidence-integrity.js --scope=all
node tools/check-market-data-quality-2026.js
node tools/hype-vnext/run-benchmark.js
node tools/check-market-analysis-visual.js
node tools/check-market-hype-visual.js
```

The audit is read-only and fails only on hard metadata contradictions. A
`partial` result preserves known evidence limits instead of turning missing or
blocked collection into zero results.

## Verified release-candidate findings

- Analysis requests the interval from 2026-01-01, while currently retained
  ranking evidence starts on 2026-08-29. The interface displays both dates and
  states that missing dates are not zero sales.
- Analysis separates observed retailer ranking positions from measurable
  public online interest. Neither is presented as exact period unit sales or
  national market share.
- Hype separates dated upcoming/recent events, undated public signals and
  catalog availability. A listing date alone is not labelled as a verified
  global launch date.
- Direct catalog coverage is 46 of 48 enabled collectors. Aspire and Suorin
  blocked automated public reads during this run; Cthulhu is explicitly skipped
  after repeated HTTP 521 responses and remains covered by dated-news/search
  layers. Atmizoo returned a usable partial catalog.
- The direct release-candidate run fetched 8,838 public catalog records and
  classified 1,997 as relevant. The final automated refresh published 25
  monitored RTA/mod/accessory records and 35 monitored POD records, including
  12 and 5 dated events respectively. These counts are evidence-filtered, not
  claimed as exhaustive.
- The daily workflow retains the 06:00 Europe/Bucharest primary run and 06:20
  recovery run, with validation before publication.

## Acceptance evidence

- 21 evidence-integrity fixtures passed.
- 16 direct-catalog adapter fixtures passed.
- 640 Hype benchmark assertions passed across 44 fixtures; 59.1% are
  adversarial cases.
- Analysis and Hype passed Playwright checks on desktop and mobile, both locally
  and against the final public snapshot. Loading completed, the previous 83%
  guard was released, controls worked and no horizontal overflow or vertical
  text was detected.
- Core application regression checks passed.

## Remaining evidence limits

Public rankings and interest signals cannot prove exact units sold. Private
platform data, authenticated communities and blocked sources are not silently
invented. Every future refresh must preserve source failures, observation dates,
event dates, listing dates and projected dates as distinct facts.
