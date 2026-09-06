# Top 20 pod — audit and remaining source blocker

## Verified facts

The GitHub Pages artifact for commit 6af642851068996496c23243d262b0050edfb8d4 contains the Top20 tab. Deployment run 34034729809 succeeded. Its data/market-demand-intelligence-2026.json reports Google Ads credentials-missing, available=false, lastSuccessfulAt=null, lastSuccessfulMonth=null. There are zero products with available Google metrics. data/google-pod-top20-2026.json contains no ranking rows. This is NOT a functioning data-fed Google Top20.

## Repairs in this change

Strict numeric counts; no null/blank/boolean-to-zero coercion. Romania, Google-only network, correct metric, complete 12-month window, actual calendar dates and bounded data age are checked. Duplicate models and overlapping query assignments block publication. Monthly change is calculated only from two comparable monthly observations with a positive denominator, never trusted from a manually entered percentage. Equal volumes share a rank. A source-evidence file and its SHA256 must be present and pass an integrity check before display. Hash integrity does NOT authenticate Google authorship or prove that every normalized row agrees with the source; original source review and reconciliation remain required.

The Top20 fetch is abortable after 15 seconds, recoverable with Retry, and late callbacks cannot reveal the panel after the user switched tabs. The interface distinguishes technical validation from source certification and describes the monitored-universe limitation. No search counts have been invented or published.

## Tests

47 local technical checks passed on synthetic fixtures. 31 isolated browser component checks passed at 360, 800 and 1366 pixels, including retry and late-fetch navigation. Browser tests used simulated fetch responses: they are not authenticated live-site end-to-end tests. A dedicated GitHub Actions technical test has been added. Its result and the new deployment must be checked separately.

## Required before a real ranking can be published

1. Obtain an original Keyword Planner export for Romania / Google / the stated 12 complete months, or authorized eligible API access. Do not paste OAuth credentials into public files or chat. The current upstream job already refers to GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET and GOOGLE_ADS_REFRESH_TOKEN; an optional GOOGLE_ADS_LOGIN_CUSTOMER_ID is used for manager access.
2. Review the model/query universe. Existing POD classification includes some accessories; a raw category filter is not sufficient. Preserve distinct model generations, deduplicate colors and avoid counting shared close-variant volumes twice. Do not claim exhaustive national coverage from a selected list.
3. Reconcile normalized ranking rows to the original export/API result and retain sanitized evidence under data/google-pod-evidence/. Never publish account IDs, tokens or private account exports. Record the exact collection date, targeting and evidence digest. Set reviewed flags only after review, not to suppress the unavailable-state message.
4. Implement and test the publication bridge from the authenticated upstream collector to this dedicated dataset. The existing collector does not currently publish this file. Monthly automation and a real 12-month graph are not delivered by the tab alone.

Google API access/eligibility and Google data availability are external dependencies. Google historical volumes are approximate, not exact counts. Google Trends indices are relative and cannot be substituted for absolute search volumes.

## Sources

- https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics
- https://developers.google.com/google-ads/api/docs/api-policy/access-levels
- https://developers.google.com/google-ads/api/reference/rpc/v25/GenerateKeywordHistoricalMetricsRequest
- https://developers.google.com/search/apis/trends
