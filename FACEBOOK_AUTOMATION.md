# Facebook automation

The daily catalog workflow can publish real Facebook Page updates at the same
06:00 and 06:20 Europe/Bucharest checks used for the Smokee catalog.

## Required GitHub secrets

- `FACEBOOK_PAGE_ID`: the Meta Page ID returned for the managed Page.
- `FACEBOOK_PAGE_ACCESS_TOKEN`: a Page Access Token allowed to publish Page posts.

Optional repository variable:

- `FACEBOOK_GRAPH_VERSION`: defaults to `v25.0`.

The token must never be committed to the repository. The publisher exits
without changing its state when either required secret is missing.

## Behavior

- Existing catalog entries and existing YouTube links form a baseline and are
  not published retroactively.
- New atomizers create one post linking to the exact atomizer page.
- Material recommendation changes create one update post.
- New exact-model YouTube reviews or builds create one grouped post per model.
- Clone material is explicitly labeled as a clone example.
- A persisted state prevents duplicate posts at 06:20 or on later days.
- At most four posts are created per run; remaining items stay pending.
- State is written only after Meta returns a post ID.

## Local commands

```text
node tools/facebook-publisher.js --check
node tools/facebook-publisher.js --pending-count
node tools/facebook-publisher.js
```

`--publish` performs a real external action and is intended for GitHub Actions
after the two required secrets have been configured.
