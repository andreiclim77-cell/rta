# Cloudflare Smokee Sync Backup

Worker live pentru sincronizarea Smokee. Cloudflare porneste workflow-ul GitHub `Smokee Catalog Sync` din 2 in 2 minute, toata ziua.

Worker publicat:

```text
https://ghid-rta-smokee-sync-backup.ghid-rta-smokee.workers.dev
```

Endpointul manual `/trigger` raspunde doar daca exista `TRIGGER_TOKEN` si requestul are headerul corect. Fara token raspunde 404.

## Cum functioneaza

- Cloudflare Cron porneste Worker-ul din 2 in 2 minute, permanent.
- Worker-ul trimite `workflow_dispatch` catre GitHub Actions.
- Workflow-ul GitHub face sincronizarea RTA, consumabile si lichide direct pe GitHub.

## Secrete necesare

In Cloudflare Worker trebuie adaugat secretul:

```text
GITHUB_TOKEN
```

Tokenul GitHub trebuie sa poata porni workflow-uri in repo-ul `andreiclim77-cell/rta`. Pentru un token clasic, scope-urile necesare sunt `repo` si `workflow`.

Optional, pentru endpoint manual protejat:

```text
TRIGGER_TOKEN
```

## Deploy cu Wrangler

```powershell
cd C:\Users\acasa\Documents\rta\cloudflare\smokee-sync-backup
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npx wrangler deploy
```

La primul deploy poate fi necesara activarea subdomeniului `workers.dev` pentru contul Cloudflare. Subdomeniul folosit aici este:

```text
ghid-rta-smokee.workers.dev
```

## Deploy din dashboard Cloudflare

1. Cloudflare Dashboard > Workers & Pages > Create Worker.
2. Se pune codul din `worker.mjs`.
3. Settings > Variables and Secrets:
   - `GITHUB_OWNER` = `andreiclim77-cell`
   - `GITHUB_REPO` = `rta`
   - `GITHUB_WORKFLOW` = `smokee-rta-sync.yml`
   - `GITHUB_REF` = `main`
   - secret `GITHUB_TOKEN`
4. Settings > Triggers > Cron Triggers:
   - `*/2 * * * *`

Cronul ruleaza permanent, din 2 in 2 minute. Workflow-ul GitHub pastreaza protectia de concurenta, ca sincronizarile sa nu ruleze suprapus.
