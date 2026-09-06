# Top 20 pod — sursă, metodă și operare

## Stare la implementare, 6 septembrie 2026

Interfața și motorul nu constituie date Google. Diagnosticul GitHub Actions a confirmat absența celor cinci credențiale necesare. Nu s-a colectat/importat un set real și nu se publică un clasament fictiv. Testele folosesc date sintetice etichetate, respinse de motorul de producție.

Registrul inițial are 43 de identități din catalogul existent, nu o acoperire exhaustivă a pieței. Pentru fiecare model se urmărește inițial o expresie canonică; termenii pot include intenții de informare sau accesorii, nu numai dispozitive. Titlul statistic corect este «Top 20 dintre modelele și termenii măsurați». Nu se deduc vânzări, calitate sau recomandări de cumpărare.

## Activare prin export original Google

În Keyword Planner se selectează România, numai Google (fără parteneri), toate limbile și 12 luni calendaristice complete. Se introduc termenii din `data/google-pod-keywords.txt`. Se exportă CSV cu valorile lunare, nu doar media «Avg. monthly searches». Se păstrează originalul și dovada setărilor. Un fișier care conține doar intervale 100–1.000 nu susține un clasament numeric exact și este respins.

Importul se verifică întâi fără `--write`. Valorile datelor și numele operatorului trebuie să fie reale, nu copiate din exemplu:

```sh
node tools/top20/google-source.js --csv /cale/export-google.csv --start 2025-09 --end 2026-08 --retrieved-at DATA_REALĂ_ISO_UTC --reviewed-by NUME_OPERATOR --number-locale ro-RO --confirm-ro-google-all
```

După verificarea provenienței, se repetă cu `--write`, se rulează `node tools/top20/check-publication.js`, apoi se publică manifestul și fișierul nou din `data/google-pod-evidence/`. Pentru exporturi cu separator de mii virgulă se folosește `--number-locale en-US`. Sunt acceptate CSV/TSV UTF-8 și UTF-16LE. Exporturile fără cele 12 coloane lunare cerute sunt respinse.

CSV nu expune gruparea tuturor variantelor făcută de Google; de aceea calea CSV cere o singură expresie per model și nu însumează aliasuri exportate. Calea API poate folosi mai multe expresii, cu deduplicarea explicită a grupurilor `closeVariants`. Un grup comun mai multor modele este ambiguu și se exclude.

## Activare API și automatizare

Accesul API necesită aprobările Google corespunzătoare pentru keyword planning și un scop de utilizare permis. Un token existent nu garantează dreptul de a utiliza datele într-un raport autonom. Se verifică politicile actuale înainte de activare. Nu se creează campanii sau reclame prin acest cod.

Se configurează în GitHub Settings → Secrets and variables → Actions, niciodată în chat sau în JavaScript public:

- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `GOOGLE_ADS_CLIENT_ID`
- `GOOGLE_ADS_CLIENT_SECRET`
- `GOOGLE_ADS_REFRESH_TOKEN`
- `GOOGLE_ADS_CUSTOMER_ID`

Opțional: `GOOGLE_ADS_LOGIN_CUSTOMER_ID`. Variabila `GOOGLE_ADS_USE_APPROVED=true` se setează numai după confirmarea utilizării permise. `GOOGLE_ADS_API_VERSION` este configurabilă; valoarea inițială este `v24`.

Workflow-ul «Top20 Google Source Sync» se poate lansa manual și are verificări programate în zilele 10 și 15 ale lunii, 06:20 UTC. Fără configurare, consemnează explicit «source not connected», nu pretinde colectare reușită. După configurare: OAuth → confirmarea țintei România → istoric pentru toate cuvintele → validare → snapshot imuabil → manifest → commit → cerere explicită GitHub Pages build. Disponibilitatea externă și numărul de termeni returnați nu pot fi garantate. Erorile externe rămân vizibile, fără date inventate.

## Reguli de calcul și integritate

Volumul folosit este cel al lunii calendaristice selectate, nu media pe 12 luni. Valori lipsă ≠ zero. Evoluția necesită două luni consecutive măsurate și o bază pozitivă. Se afișează 20 de modele cu valori pozitive; egalitățile au același rang și o ordine alfabetică de afișare, iar egalitățile de la limita 20 sunt declarate. Lipsurile și ambiguitățile sunt numărate în acoperire. Luna implicită este ultima din perioada cerută cu cel puțin 20 de valori pozitive; altfel nu se afirmă un Top 20 complet.

Metadatele geografice, rețeaua și perioada sunt verificate și împotriva cererii API păstrate. SHA-256 dovedește integritatea fișierului, NU certificarea raportului de către Google. Proveniența unui CSV presupune verificare umană. Datele vechi sunt etichetate. Un eșec de reîncărcare păstrează snapshot-ul anterior datat, cu avertisment.

## Testare reproductibilă

```sh
node --test tools/top20/core.test.js
node tools/top20/check-publication.js
node tools/check-market-report-final.js
python -m pip install playwright==1.57.0
python -m playwright install --with-deps chromium
python tools/top20/browser.test.py
```

Testele Chromium vizează integrarea celor patru taburi într-un mediu local, la 390 și 1366 px. Nu constituie un test live Google Ads sau un test de autentificare cu parola site-ului. Starea reală a sursei se raportează separat de succesul testelor software.

## Documentație primară

- https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics
- https://developers.google.com/google-ads/api/docs/api-policy/access-levels
- https://support.google.com/google-ads/answer/3022575
- https://developers.google.com/google-ads/api/docs/targeting/location-targeting
- https://docs.github.com/en/rest/pages/pages#request-a-github-pages-build
