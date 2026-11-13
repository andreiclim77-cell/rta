# RTA Lab — poziția 01 dublă K1; restul numai fără K1 (11.11.2026)

**Noua decizie explicită a lui Andrei (prioritară față de convenția 4 poziții fixe):** «Unde apare K1 pe locurile 2, 3, 4, șterge de peste tot acele poziții; în rest lasă câte poziții rămân, cu ce este în ele». Prin urmare, **01 conține în continuare AMBELE variante K1 Ø2,5 mm, 28 GA și 29 GA**, cu spire adecvate; din pozițiile 02–04 se elimină în afișaj **K1 simplu și K1 Clapton**. Rămân, în ordinea inițială și renumerotate fără goluri, **doar NiFe30, NiFe52 și SS Clapton**, câte există pentru fiecare atomizor. Numărul de poziții devine variabil (02 și eventual 03); nu se afișează celule sau carduri goale.

**Domeniu:** 13 RTA active din motorul actual și 1 Taifun GAIA Boro separat. Ambele K1 au **Ø2,5 mm**, Kanthal A1, 28 și 29 GA și 5 ori 6 spire, după geometrie. Sunt **ipoteze tehnice paralele**, nu verdict A/B, montaj confirmat ori diferență măsurată de gust. Această filtrare privește numai **tabelul nou HOME și cardurile comparative Atomizer Atlas**: `buildLeads()` și fișele personale/istorice, Wire Lab, Liquid Match TOP 3, inventarul și motorul senzorial rămân neschimbate. *28 GA are Ø≈0,321 mm, 29 GA Ø≈0,286 mm; la același material și lungime, schimbarea secțiunii modifică rezistența și masa, dar nu determină direct gustul.*

| Atomizor | 01A · K1 28 GA Ø2,5 mm | 01B · K1 29 GA Ø2,5 mm | Pozițiile rămase după eliminarea tuturor K1 |
|---|---|---|---|
| Kayfun Prime / Prime SE | 28 GA × 6 | 29 GA × 6 | 02 NiFe30 × 7; 03 NiFe52 × 6 |
| Kayfun Lite Plus 2021 | 28 GA × 5 | 29 GA × 5 | 02 NiFe30 × 7; 03 NiFe52 × 6 |
| Kayfun X | 28 GA × 5 | 29 GA × 6 | 02 NiFe30 × 7; 03 NiFe52 × 6 |
| Taifun GT One | 28 GA × 5 | 29 GA × 5 | 02 NiFe52 × 6 |
| Taifun GTR | 28 GA × 6 | 29 GA × 6 | 02 NiFe30 × 7; 03 NiFe52 × 6 |
| Dvarw MTL CL | 28 GA × 6 | 29 GA × 5 | 02 NiFe52 × 6 |
| Dvarw MTL FL | 28 GA × 6 | 29 GA × 5 | 02 SS Clapton × 5; 03 NiFe52 × 6 |
| Arcana Muted+ | 28 GA × 6 | 29 GA × 6 | 02 NiFe30 × 6; 03 NiFe52 × 6 |
| Diplomat v1.5 | 28 GA × 5 | 29 GA × 6 | 02 NiFe52 × 6; 03 SS Clapton × 5 |
| Prime Minister Freehand | 28 GA × 5 | 29 GA × 6 | 02 SS Clapton × 5 |
| Prime Minister Rhodesian / Standard | 28 GA × 5 | 29 GA × 6 | 02 SS Clapton × 5; 03 NiFe52 × 6 |
| By-Ka V11 | 28 GA × 5 | 29 GA × 5 | 02 NiFe52 × 6 |
| Minister MTL | 28 GA × 5 | 29 GA × 6 | 02 NiFe52 × 6; 03 SS Clapton × 5 |
| **Taifun GAIA · Boro** | **28 GA × 5, ipoteză Boro** | **29 GA × 5, ipoteză Boro** | **Fără alte configurații înregistrate; nu se simulează Boro** |

## Actualizare 13.11.2026 — CONTACT/SPACED individual la K1 poziția 01

**Tipul spirelor apare explicit** în tabelul HOME, în ambele subcarduri 01A/01B, în descrierea coilului și în transferul în Wire Lab. Noile 01 sunt ipoteze tehnice după cameră și airflow; nu sunt automat construite/testate. Când nu există probă personală pe combinația exactă, SPACED este **propunere inginerească de pornire**, nu o preferință personală inventată.

| Atomizor (ID Lab) | 01A 28 GA | 01B 29 GA |
|---|---|---|
| kprime | **SPACED** | **SPACED** |
| klp | **CONTACT** | **SPACED** |
| kx | **SPACED** | **SPACED** |
| gtone | **SPACED** | **SPACED** |
| gtr | **SPACED** | **SPACED** |
| gaia | **SPACED** | **SPACED** |
| dvarwcl | **SPACED** | **SPACED** |
| dvarwfl | **SPACED** | **SPACED** |
| muted | **CONTACT** | **SPACED** |
| diplomat | **SPACED** | **SPACED** |
| pmfree | **SPACED** | **SPACED** |
| pmstd | **SPACED** | **SPACED** |
| byka | **SPACED** | **SPACED** |
| minister | **SPACED** | **SPACED** |

**Dovezi păstrate:** KLP 28/5 CONTACT (istoric A/B); GT One 29/5 SPACED (montat și apreciat); Muted+ 28/6 CONTACT (alternativă personală declarată); GTR 29/6 SPACED (variantă declarată). Pe Prime și Kayfun X 29 GA, CONTACT rămâne o alternativă declarată în registrul vechi; în cardul nou 01B am ales SPACED **doar ca ipoteză tehnică**. KLP 29/5 SPACED nu trebuie confundat cu 29/6 SPACED testat. Dvarw și GAIA nu primesc fals statut de montaj confirmat. Date canonice: `data/k1-geometry-20261111.js`, câmpuri `variants[].spacing` și `styleEvidence`. Istoricul nemodificat: `data/sensory-core.js` / `RTA_COIL_STYLE_CURRENT_20261108.md`.

## Triangulare și limite de probă

1. **Fizică:** prima poziție include 28 și 29 GA în pereche, fiecare cu un footprint de 5/6 spire dedus din cameră, direcția jeturilor și masa/suprafața sârmei. Condițiile sunt în `data/k1-geometry-20261111.js`: **Prime 28/6 + 29/6**, **GTR 28/6 + 29/6 cu ambele canale**, **Dvarw CL/FL 3×0,6 mm**, **Muted+ 0,8 jos + 2×0,8 laterale**, **Minister diverter 20×1 mm**. Pentru altă inserție reanalizează. 28/29 nu sunt considerate echivalente energetic la același wattaj.
2. **Practică:** `buildLeads()` continuă să păstreze toate cele trei builduri istorice ca evidență. **Numai pentru noua comparație** se aplică `remainingBuildLeads()`, care elimină din afișaj `k128`, `k129` și `k1clap`, fără să modifice vreun istoric. Ordinea și sursa (`personal` / `model`) configurațiilor NiFe și SS Clapton supraviețuitoare rămân intacte; numerotarea devine consecutivă 02, 03 etc.
3. **Context:** `fourBuildLeads()` își păstrează numele API pentru compatibilitate, dar returnează **un număr variabil de poziții** (în prezent 01 + una sau două non-K1 la RTA-urile active). `geometryPair()` detaliază 01 în două subvariante cu schemă coil, regim și transfer separat. Graficul `RTA_SENSORY_CORE.analyze()` compară strict **configurațiile afișate**, în același context. Liquid Match TOP 3 și preferințele validate rămân independente.
4. **Incertitudine:** un tip `contact`/`spaced` neconfirmat rămâne neconfirmat, iar valorile W/TC sunt preseturi până la măsurare. Nu se inventează procente pentru aromă, TH sau plăcere.
5. **GAIA:** în Lab exista doar fișa de posesie fără builduri istorice, geometrie/airflow verificat sau motor Boro. Poziția #01 afișează **două ipoteze separate 28/5 + 29/5**; nu există poziții 02+, fără scor sau inventarea unor configurații vechi.
6. **Protecții:** 14 platforme/40 unități active (13 RTA/39 + 1 Boro), 415 Cool și Mini V3 vândute, Asylum retras; Atlas 700 lichide, V10 620, cele trei Dvarw CL saved/draft și NiFe preferate păstrate.

## Fișiere canonice și QA

- Hartă: `rta-lab/data/k1-geometry-20261111.js`.
- UI: `rta-lab/atlas-preview/modules.js`, `index.html`, `k1-geometry.css`, `decision-explorer.js`; release `rta-lab/atlas/` și SW/cache generate deterministic.
- QA model: `tools/check-rta-atlas-modules.js`, `tools/check-rta-atlas-preview.js`, verificări ownership/context/decision. Testele vizuale actualizate verifică numărul variabil de carduri, transferul ambelor K1 din 01 și încadrarea mobilă.
- Testarea vizuală locală are nevoie de Chromium funcțional și permis; în lipsă, verifică CI/Pages separat și înregistrează limitarea. **PASS de model nu echivalează cu publicare.**

**Decizia veche** „4 poziții/5 configurații, 02–04 nemodificate” a fost corectă înaintea cererii curente, dar **este depășită exclusiv pentru această comparație**. Istoricul complet este recuperabil din Git și din `buildLeads()`.

La următorul «fa update», citește handoff/master/protocol, apoi acest document; verifică `main`, QA, Pages și manifestul ZIP din Bibliotecă. Dacă serviciul Bibliotecă refuză actualizarea, nu declara arhiva sincronizată.
