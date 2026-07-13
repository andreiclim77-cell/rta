# Cloudflare Smokee Sync Backup

Worker backup pentru sincronizarea Smokee. Cloudflare porneste workflow-ul GitHub `Smokee Catalog Sync` zilnic la 06:00 si 06:20, ora Romaniei.

Acelasi Worker ofera cache pentru fotografiile publice de produs prin ruta
`https://ghid-rta-smokee-sync-backup.ghid-rta-smokee.workers.dev/media/smokee/`.
Ruta echivalenta `https://ghid-rta.ro/media/smokee/` devine activa daca inregistrarea
DNS a domeniului este trecuta ulterior prin proxy-ul Cloudflare. Astfel, paginile ghidului nu descarca aceeasi
imagine direct de pe hostingul Smokee pentru fiecare vizitator.

Worker publicat:

```text
https://ghid-rta-smokee-sync-backup.ghid-rta-smokee.workers.dev
```

Endpointul manual `/trigger` raspunde doar daca exista `TRIGGER_TOKEN` si requestul are headerul corect. Fara token raspunde 404.

## Cum functioneaza

- Cloudflare Cron porneste Worker-ul in ferestrele zilnice 06:00 si 06:20, ora Romaniei.
- Worker-ul verifica intern ora Europe/Bucharest si iese fara actiune daca rularea nu se afla in fereastra corecta.
- Worker-ul verifica daca exista deja o sincronizare pornita sau in asteptare.
- Daca exista una, nu porneste alta peste ea.
- Daca nu exista, trimite `workflow_dispatch` catre GitHub Actions.
- Workflow-ul GitHub face sincronizarea RTA, consumabile si lichide direct pe GitHub.
- Imaginile din `wp-content/uploads` sunt servite prin Cloudflare, cu cache de sapte zile si rezerva stale.
- Evenimentele anonime de utilizare ale ghidului ajung in logurile Worker-ului; nu sunt trimise nume, emailuri sau identificatori de utilizator. Pentru rapoarte agregate, bindingul Analytics Engine poate fi activat ulterior din contul Cloudflare.
- Agregarile anonime pe zile sunt pastrate in KV si publicate prin `GET /__rta-metrics?days=30` pentru panoul de audienta al ghidului.
- Panoul nu afiseaza si nu stocheaza IP-uri, nume, emailuri sau identificatori individuali.

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
   - `0,20 3 * * *`
   - `0,20 4 * * *`

Cronul acopera ora de vara si ora de iarna. Worker-ul si workflow-ul GitHub pastreaza protectii de concurenta, ca sincronizarile sa nu ruleze suprapus.
