# Top 20 pod — conectarea sursei Google

## Situația verificată la 6 septembrie 2026

Colectorul existent a raportat `credentials-missing`, fără nicio colectare Google reușită și cu zero produse având volume Google. Existența butonului și trecerea testelor tehnice nu înseamnă existența unui clasament real.

Noul workflow `Google Pod Top20 Collection` colectează prin API, nu generează date demonstrative. Rulează în data de 8 a fiecărei luni, la 08:30 UTC, la modificarea codului său și manual din **Actions → Google Pod Top20 Collection → Run workflow**. Starea `configuration_required` nu înseamnă un top populat. Raportul execuției afișează exclusiv numele setărilor lipsă, niciodată valorile secrete.

## Configurare unică

În repository: **Settings → Secrets and variables → Actions**. Sunt necesare cele cinci secrete ale unui cont Google Ads autorizat:

- `GOOGLE_ADS_DEVELOPER_TOKEN` — aprobat pentru utilizarea API și accesul necesar;
- `GOOGLE_ADS_CUSTOMER_ID` — contul client, nu automat contul manager;
- `GOOGLE_ADS_REFRESH_TOKEN`;
- `GOOGLE_ADS_CLIENT_ID`;
- `GOOGLE_ADS_CLIENT_SECRET`.

`GOOGLE_ADS_LOGIN_CUSTOMER_ID` este opțional pentru accesul printr-un manager. Variabila opțională `GOOGLE_ADS_API_VERSION` are implicit valoarea `v25`, conform exemplului oficial verificat la 6 septembrie 2026.

Nu publica parole, tokenuri sau client secrets în chat, cod, issue-uri ori JSON. Conectarea Gmail/Drive nu acordă automat acces la Google Ads API.

Documentație oficială:
- https://developers.google.com/google-ads/api/docs/api-policy/developer-token
- https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics
- https://developers.google.com/google-ads/api/docs/oauth/overview

După configurare, rulează workflow-ul. Prima colectare autorizată reușită și afișarea sa publică trebuie verificate efectiv. Codul nu garantează aprobarea accesului, disponibilitatea termenilor sau returnarea a minimum 20 de modele măsurabile. Nu slăbi validările pentru a ascunde o restricție a sursei.

## Metodă și limite

Candidații sunt identități POD canonizate din inventarul românesc existent, după eliminarea titlurilor detectate ca rezerve, rezistențe sau lichide. Inventarul nu este exhaustiv. Volumele sunt pentru termenii urmăriți și variantele apropiate grupate de Google, nu toate căutările posibile despre fiecare model.

Cererea API rezolvă România la nivel de țară, folosește `GOOGLE_SEARCH` și nu setează filtru lingvistic. Sunt admise numai medii lunare pozitive furnizate de sursă, cu 12 luni complete, consecutive și comparabile. Lipsurile nu devin zero. Grupurile ambigue între modele și grupurile suprapuse sunt excluse, nu împărțite arbitrar ori numărate dublu. Acoperirea și excluderile rămân în JSON. Estimările nu reprezintă vânzări, cote de piață, calitate sau recomandări de consum.

Interfața existentă și testele ei sunt păstrate. Adaptorul API produce schema 1, date calendaristice complete și fișierul-dovadă cerut de aceasta. SHA-256 este calculat din exact octeții UTF-8 ai fișierului salvat; browserul verifică aceeași dovadă. Hash-ul verifică integritatea, nu reprezintă o certificare Google. Se păstrează câmpurile Google pentru indicatorii folosiți, fără identificatori de cont sau credențiale.

Sunt publicate automat numai măsurători reale care trec validarea. Configurarea incompletă este raportată în Actions, fără un clasament de înlocuire. După commitul datelor se solicită explicit un build GitHub Pages. Colectarea și publicarea cu acces Google real rămân nevalidate până la prima execuție autorizată reușită.

## Testare

`node tools/test-google-pod-top20-api.js` execută 41 de verificări cu date sintetice izolate în fișierul de test. Aceste date nu sunt scrise în fișierele publice. Workflow-ul execută și suita existentă a interfeței Top20, precum și contractul Market Final Report.

Nu se modifică adresa loaderului coordonată cu service worker-ul și contractele CI, pentru a evita regresia anterioară `v12` față de `v11`.
