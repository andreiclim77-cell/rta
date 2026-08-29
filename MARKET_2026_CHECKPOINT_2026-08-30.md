# MARKET 2026 — CHECKPOINT 2026-08-30

## Stare canonică

- Branch: `main`
- Snapshot HEAD la înghețarea checkpointului: `d19d637621913c2c002596de2ec2c101d8521036`
- Commit HEAD: `Snapshot product-level global 30-day Hype Radar 2026`
- Hype run #38: **SUCCESS** (`Market 2026 Hype Radar`, push `Deduplicate Hype clone maker registry`)
- GitHub Pages pentru snapshotul `d19d637...`: **SUCCESS**
- Acest checkpoint este făcut înainte de închiderea fallbackului generic pentru Intensa/Menelaus.

## Automatizare zilnică

### Market
- `Market 2026 Daily Sync`
- 06:00 Europe/Bucharest = rulare principală.
- 07:00 Europe/Bucharest = fallback; rulează numai dacă snapshotul principal nu este deja proaspăt.
- DST este tratat explicit prin gate pe `Europe/Bucharest`.

### Hype
- `Market 2026 Hype Radar`
- 06:00 Europe/Bucharest = rulare principală.
- 07:00 Europe/Bucharest = fallback; se sare dacă snapshotul de la 06:00 este deja proaspăt.
- Fereastra publicată rămâne strictă și simetrică: 30 zile înainte + 30 zile după.

### Analiza
- `Market 2026 Sales Signals`
- Rulează în lanț după succesul `Market 2026 Daily Sync`.
- Fallback programat la 07:30 Europe/Bucharest.
- Analiza refuză o bază Market veche și validează prospețimea zilnică înainte de publicare.

## Market / Analiza — snapshot curent

- 22 storefront-uri configurate.
- 21/22 storefront-uri cu semnal Tier-B/ranking public verificabil = 95,5% acoperire ranking.
- 0/22 cu unități vândute publice Tier-A; prin urmare nu se declară cotă națională reală de piață.
- 6/22 cu semnale Tier-C/demand proxy = 27,3%.
- `market-product-presence-2026.json`: 1.714 titluri brute distincte, 1.456 produse canonice, 81 produse listate în mai mult de un storefront, 165 grupuri cu aliasuri/variante consolidate.
- Management/Analiza păstrează separarea strictă între: listing breadth, bestseller breadth, proxy de cerere și vânzări reale.
- Pulse curent: categoria RTA este cea mai puternică în indicele bestseller observat; acesta nu este prezentat ca market share real pe unități.

## Hype — stare după run #38

- GLOBAL RTA + clone RTA.
- Reguli active: produs concret, dată/eveniment verificabil, relisting != lansare, new-arrival != lansare, ETA trecută != lansare, pagini generice respinse, categorie finală validată.
- Scan multi-vendor activ și publicare doar după filtrarea/validarea surselor.
- Registru suplimentar: **42 maker-i activi**, deduplicați; aliasurile sunt termeni de căutare, nu maker-i separați.
- Run-ul a executat 84/84 interogări pentru maker-ii suplimentari; 414 pagini candidate; 0 semnale au trecut pragul final în acel snapshot — rezultat acceptat, fără inventarea de lansări.
- Produs concret recuperat cu eveniment viitor verificabil: `YFTK Flash e-Vapor V4.5S+ Style RTA`, batch/ETA `2026-09-10`, păstrat ca semnal de discovery, nu ca dovadă de lansare consumată.

## Singurul blocaj tehnic rămas la checkpoint: Intensa / Menelaus

Starea observată în `data/market-hype-products-2026.json`:

- `searchIndexEtaCandidates = 2`
- `searchIndexEtaPages = 0`
- `searchIndexEtaEvents = 0`

Cele două produse sunt detectabile în indexul public, dar fetch-ul paginii vendor nu livrează HTML utilizabil. Pipeline-ul actual renunță la eveniment dacă pagina vendor nu poate fi descărcată, deși snippetul indexat poate conține produs + frază de dată explicită.

### Corecția obligatorie

Se adaugă în `tools/augment-market-hype-search-index-eta-2026.js` un fallback **generic**, fără nume de produse hardcodate:

1. acceptă snippetul indexat numai dacă identifică un produs RTA concret;
2. cere o dată/ETA explicită în snippet;
3. păstrează URL-ul și hostul vendor ca proveniență;
4. marchează dovada ca `search-index/snippet fallback`, cu confidence mai mic decât pagina vendor directă;
5. nu transformă niciodată o ETA trecută în `released`;
6. trece prin aceleași gate-uri de categorie, fereastră ±30 zile, relisting și adevăr ca restul Hype;
7. nu conține reguli speciale `Intensa` sau `Menelaus` — ele trebuie să fie rezolvate de regula generală.

## Criteriu de închidere după checkpoint

Proiectul Market/Analiza/Hype este considerat închis pentru această etapă numai după:

1. implementarea fallbackului generic;
2. rularea Hype și verificarea rezultatului Intensa/Menelaus fără false-positive;
3. validarea scripturilor și a truth gates;
4. revizia finală Market / Analiza / Hype pentru consistență;
5. commit pe `main`;
6. GitHub Pages publicat cu succes și verificare end-to-end pe `ghid-rta.ro`.
