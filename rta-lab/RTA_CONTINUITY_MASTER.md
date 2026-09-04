# RTA / MTL — ARHIVĂ DE CONTINUITATE MASTER

**Fișier canonic RTA Lab · stare consolidată 04.09.2026.**

- Repo: `andreiclim77-cell/rta`
- Branch: `main`
- Cale stabilă: `rta-lab/RTA_CONTINUITY_MASTER.md`
- Trigger reîncărcare: **„du-te în Lab și actualizează-te!”**
- Trigger persistență: **„salvează”**
- Trigger arhivă completă: **„da mi arhiva de continuitate la zi”**

> REGULĂ DE OPERARE: la „du-te în Lab și actualizează-te!”, citește mai întâi acest fișier integral. Apoi citește `rta-lab/data/tuning-415.js`, `rta-lab/data/personal-5wrap.js`, `rta-lab/data/tc-platform-map.js`, `rta-lab/data/tc-sixwrap-global.js` și `rta-lab/data/clapton-platform-map.js`. Pentru materiale TC citește și `rta-lab/data/wires.js`. Pentru comportament/UI verifică `rta-lab/engine.js`, `rta-lab/index.html`, `rta-lab/sw.js`. Nu reconstrui proiectul din memorie dacă repo-ul este accesibil.

> REGULĂ DE SALVARE: la „salvează”, persistă imediat concluzia în MASTER și sincronizează datele, regulile, UI-ul și cache-ul relevante. Marchează certitudinea: validat practic / confirmat direct / preferință personală / extrapolat / ipoteză. După update verifică Quality Gate efectiv.

---

## 0. Frază de pornire pentru reluarea proiectului

> Continuăm proiectul Rta. Pairingul se face prin ADN de platformă, nu prin clasament global absolut: profil lichid → platformă/cameră/airflow → sârmă → Ø coil → număr spire → contact → poziție coil → watt/TC. Testul practic al utilizatorului prevalează asupra extrapolării. RTA Lab V10 are 620 repere și 5 sloturi active. Prior personal round-wire: **K1 29 GA / Ø2,5 / 5 contact** principal, **K1 28 GA / Ø2,5 / 5 contact** secundar. Varianta **K1 29 GA / Ø2,5 / 5 spire distanțată a fost eliminată complet din Lab la 04.09.2026**. Pentru TC: **Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · Ø2,5 · 6 spire** și **Zivipf NiFe52 · TCR310 · Ø2,5 · 6 spire**. Perechi Clapton active: **Chariot→K1 Clapton/5**, **415→K1 Clapton/5**, **Dvarw MTL FL→SS316L Clapton/5**. Asylum V3 nu are o pereche Clapton dedicată/preferată; K1 Clapton/5 rămâne doar opțiune contextuală pentru corp și integrare.

## 1. Snapshot rapid

1. Paradigmă: fără TOP global în pairing; motorul folosește lichid + obiectiv + ADN platformă + build.
2. Preferință senzorială: tobacco-first, Tobacco Core Visibility, detaliu, layering, corp/mouthfeel; fără claritate sterilă și fără „tocăniță”.
3. RTA Lab: **V10 / 620 repere / 120 Hall of Fame / 17 platforme / 41 atomizoare fizice / 5 sloturi active**.
4. Catalog: 145 tutun simplu + 155 tutun complex + 150 NET simplu + 170 NET complex.
5. Prior personal: **K1 29/5 contact** principal; **K1 28/5 contact** secundar.
6. K1 29/6 contact rămâne numai când ADN-ul platformei sau A/B-ul îl justifică.
7. Varianta K1 29/5 distanțată este **ȘTEARSĂ / DEPĂȘITĂ** și nu trebuie reintrodusă în UI, motor, Explorer sau arhivă.
8. TC global: **NiFe30/6 + NiFe52/6**, ambele Ø2,5.
9. Dicodes personal: **RESISTHERM NiFe30, TCR320, 5,5 Ω/m** confirmat direct de pe eticheta rolei.
10. Harta TC: **GTR/KX → Dicodes NiFe30/6**; **K Prime → Zivipf NiFe52/6**; KLP rămâne exclus din harta NiFe.
11. Clapton active: **Chariot→K1**, **415→K1**, **Dvarw FL→SS**.
12. Asylum V3: Flat = claritate/separare; Dome = corp/integrare; **K1 Clapton/5 numai contextual**, fără prior de platformă.

## 2. Inventar activ — 17 platforme / 41 RTA

| Platformă | Buc. | ADN / rol curent |
| --- | ---: | --- |
| 415 RTA MTL Cool Edition | 1 | High-sensitivity / micro-geometry; 28/5 contact = echilibru/layering; 29/5 contact = concentrat/dulce; 29/6 contact = dry/tobacco; **K1 Clapton/5 = pereche Clapton preferată**. |
| Kayfun Prime / K Prime | 2 | Echilibru premium; **29/5 contact** = round-wire principal curent; 28/5 = echilibru; TC curent NiFe52/6; NiFe30/6 benchmark istoric 80/20. |
| Taifun GT One | 4 | Straight tobacco precision; 28/5 contact și 29/5 contact validate. |
| Dvarw MTL CL 22 | 1 | Tobacco muscular; 28/5 direcție excelentă; separat de FL. |
| Muted+ | 4 | Corp/mouthfeel + airflow configurabil; prior personal 29/5 contact dacă nu există excepție. |
| Taifun GTR | 5 | TC specialist; Dicodes RESISTHERM NiFe30 320/6; finețe, layering, smoothness. |
| Dvarw MTL FL | 2 | Analiză/separare; 28/5 excelent; **SS316L Clapton/5 = pereche dedicată**. |
| Diplomat v1.5 | 3 | Camerele schimbă specializarea aromatică; calibrare separată; 29/5 contact prior personal. |
| Kayfun X / KX | 4 | 28/5 extraordinar + Dicodes RESISTHERM NiFe30 320/6 TC; daily premium. |
| KLP / Kayfun Lite Plus 2021 | 5 | K1 29 GA nativ; 29/5 contact default personal, 29/6 contact alternativă validată; harta NiFe nu modifică KLP. |
| Asylum V3 SS/DLC | 2 | Flat = claritate/separare; Dome = corp/integrare; **K1 Clapton/5 = opțiune contextuală** pentru corp/densitate/integrare, fără statut dedicat/preferat. |
| Prime Minister Freehand | 2 | NET specialist; 28/5 = corp/layering; 29/6 contact = frunză/dry/tobacco-first. |
| Prime Minister Standard/Rhodesian | 2 | Mai saturat/cuminte; calibrare separată; 29/5 contact prior personal. |
| By-Ka V11 | 1 | Echilibru corp–claritate; airflow unic; 29/5 contact prior personal. |
| Chariot RTA | 1 | Saturație/tobacco complex; **K1 Clapton/5 = pereche dedicată**, validată direct pe Cronos Tab Plus. |
| Kayfun Mini V3 | 1 | Micro-MTL sec/concentrat; 29/5 contact prior personal. |
| Minister MTL | 1 | Compact/warm/low-watt; 29/5 contact prior personal. |

## 3. Sârme active și baseline-uri

| Sârmă / familie | Baseline | Rol |
| --- | --- | --- |
| K1 28 GA round | Ø2,5 · 5 contact | echilibru, corp curat, mouthfeel, completitudine |
| K1 29 GA round | Ø2,5 · 5 contact prior; 6 contact justificat | tobacco-first, TH, dry, precizie, viteză |
| K1 Clapton 2×30+38 | Ø2,5 · 5 | corp, densitate, mouthfeel, TH, integrare |
| SS316L Clapton 2×30+38 | Ø2,5 · 5 | claritate, top-notes, layering |
| Dicodes RESISTHERM NiFe30 | TCR320 · 5,5 Ω/m · Ø2,5 · 6 | TC: finețe, smoothness, consistență, layering |
| Zivipf NiFe52 | TCR310 · Ø2,5 · 6 | TC: variantă de aliaj în același slot |

### 3.1. Regula K1 29 actuală

- **29/5 contact** = singura variantă activă de 5 spire.
- **29/6 contact** = alternativă justificată pe platforme/obiective unde este nevoie de footprint mai lat sau mai mult dry/tobacco-first.
- Nu mai folosi, recomanda, afișa sau documenta varianta K1 29/5 distanțată.

## 4. Validări practice cheie

### 4.1. 415

- K1 28 / Ø2,5 / 5 contact = cel mai echilibrat și layered dintre round-wire-urile validate; corp/mouthfeel bun.
- K1 29 / Ø2,5 / 5 contact / ~12 W = foarte concentrat, dens și mai dulce.
- K1 29 / Ø2,5 / 6 contact = mai dry/tobacco-first și mai puțin concentrat.
- **K1 Clapton 2×30+38 / Ø2,5 / 5 = pereche Clapton preferată**, pentru corp, densitate, mouthfeel și integrare.
- Explorer direct: **K1 Clapton trebuie afișat primul** la selectarea 415.
- Triangulare: K1 Clapton primește bonus contextual pe dark/rich/complex și body/TH/complete; pentru dry/tobacco simplu round-wire-ul poate rămâne superior.
- High Vaporization Efficiency rămâne observație practică, nu regulă universală de consum.

### 4.2. Kayfun Prime

- **29/5 contact = round-wire principal curent**.
- 28/5 = echilibru, corp, mouthfeel, completitudine.
- Zivipf NiFe52 / TCR310 / Ø2,5 / 6 = preferință TC curentă.
- Dicodes NiFe30 / TCR320 / 5,5 Ω/m / Ø2,5 / 6 = benchmark istoric actualizat pentru 80% trabuc / 20% cireșe.
- Fără verdict universal cross-alloy fără A/B controlat.

### 4.3. GT One

- 28/5 contact = foarte bun, echilibru/corp.
- 29/5 contact = foarte bun, direct, incisiv, tobacco-first.
- Coil compact/contact rămâne filozofia de lucru.

### 4.4. GTR

- Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · Ø2,5 · 6 = baseline TC canonic.
- Rol: finețe, layering, smoothness, consistență termică.

### 4.5. KX

- K1 28/5 = extraordinar, echilibrat și natural.
- Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · Ø2,5 · 6 = TC canonic; smooth, constant, natural.

### 4.6. Dvarw

- Observația „Dvarw + 28/5 = extraordinar” a fost generică; CL și FL rămân distincte.
- Dvarw FL → **SS316L Clapton/5 dedicat** pentru claritate, top-notes și layering.

### 4.7. KLP

- 29/5 contact = hit/TH, focus, viteză, tobacco-first; default personal.
- 29/6 contact = mai așezat/complet; alternativă validată.
- 28/5 = mai mult corp/mouthfeel.

### 4.8. Prime Minister Freehand

- NET + 28/5 = corp, textură, layering, dezvoltare completă.
- NET + 29/6 contact = frunză, dry, tobacco-first; excepție validată.

### 4.9. Asylum V3

- Flat = ușor preferat pentru claritate/separare; Dome = corp/integrare.
- **K1 Clapton 2×30+38 / Ø2,5 / 5 rămâne doar opțiune contextuală**, când se caută corp, densitate și integrare.
- Nu există Clapton dedicat/preferat fixat canonic pe Asylum.
- Explorer direct folosește doar buildurile active ale platformei și nu forțează un Clapton pe locul #1.
- Triangularea specifică Asylum păstrează numai un bonus mic pentru K1 Clapton când obiectivul/profilul cere body/dark/rich.

### 4.10. Chariot

- K1 Clapton 2×30+38 / Ø2,5 / 5 = pereche dedicată.
- Validare directă pe Cronos Tab Plus: #1 în watt; K1 28 aproape egal; NiFe foarte complet aromatic, dar TC nu este filosofia naturală preferată a Chariot.

## 5. Harta Clapton activă — 04.09.2026

| Platformă | Clapton | Tier | Rol |
| --- | --- | --- | --- |
| Chariot | K1 Clapton 2×30+38 / 5 | dedicat | corp, densitate, mouthfeel, TH, complex/dark |
| 415 | K1 Clapton 2×30+38 / 5 | preferat | corp, densitate, integrare; bonus contextual |
| Dvarw MTL FL | SS316L Clapton 2×30+38 / 5 | dedicat | claritate, top-notes, layering |

Asylum V3 păstrează **K1 Clapton/5 doar ca opțiune contextuală**, nu ca pereche activă.

### 5.1. Triangularea Clapton

Ordinea de decizie rămâne:

**lichid → obiectiv → ADN atomizor → build compatibil → preferință de platformă → recomandare**.

Reguli runtime:
- 415 + K1 Clapton: bonus de bază + bonus suplimentar pentru complex/dark/rich și body/TH/complete; penalizare moderată pentru tobacco + dry/simple.
- Asylum + K1 Clapton: bonus contextual mic; crește doar când se caută body/dark/rich.
- Chariot + K1 și Dvarw FL + SS își păstrează statutul dedicat.
- Pereche preferată nu înseamnă #1 forțat în motorul pe lichid.
- În **Explorer direct**, doar 415 are Clapton afișat explicit primul.

## 6. Harta TC canonică

### 6.1. Identitatea materialelor

- **Dicodes RESISTHERM NiFe30** = TCR320 = 0,00320/K.
- Rola personală: **5,5 Ω/m**, confirmat direct de pe eticheta fizică fotografiată.
- Baseline canonic: **Ø2,5 / 6 spire**.
- **Zivipf NiFe52** = TCR310 = 0,00310/K.
- Baseline canonic: **Ø2,5 / 6 spire**.
- Nu confunda Zivipf NiFe52 cu NiFe30.
- Ø2,5 este diametrul coilului, nu diametrul firului.

### 6.2. Platforme TC

| Platformă | Alegere TC curentă |
| --- | --- |
| GTR | Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · Ø2,5 · 6 |
| KX | Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · Ø2,5 · 6 |
| K Prime | Zivipf NiFe52 · TCR310 · Ø2,5 · 6 |
| KLP | neschimbat / exclus din harta NiFe |

`tc-sixwrap-global.js` este gardul runtime care menține familia NiFe la 6 spire.

## 7. Tobacco Core Visibility

- Tobacco core = nucleul/backbone-ul de tutun.
- Tobacco structure = dry, woody, earthy, smoky, leathery, cigar-like etc.
- Toppings = aromele secundare care trebuie să îmbrace nucleul, nu să-l îngroape.
- Tobacco-first ≠ Tobacco Core Visibility.
- Setup ideal: tobacco core clar + layering + toppinguri integrate + corp/mouthfeel, fără claritate sterilă și fără „tocăniță”.
- Principiu permanent, încă fără scor numeric separat.

## 8. Reguli metodologice permanente

- Testul practic al utilizatorului prevalează asupra estimărilor.
- Nu există clasament global folosit în pairing.
- Coil footprint trebuie potrivit cu airflow footprint.
- Priorul 29/5 / 28/5 este personal, nu superioritate universală.
- 29/6 cere justificare geometrică sau A/B.
- Schimbă o singură variabilă odată în A/B.
- Nu transfera automat rezultate între platforme.
- Nu universaliza un rezultat specific unui lichid fără etichetă de certitudine.
- Pentru TC: calibrare complet rece + TCR corect.
- Platformele fără pereche Clapton dedicată/preferată nu primesc automat un astfel de prior din simpla compatibilitate generică.

## 9. RTA Lab — fișiere canonice și ordine de încărcare

### 9.1. Fișiere

| Fișier | Rol |
| --- | --- |
| `rta-lab/index.html` | UI V10; afișează cele 3 perechi Clapton active și baseline-urile TC. |
| `rta-lab/engine.js` | Motor de bază: 17 platforme, 5 sloturi, scoring, TOP 3. |
| `rta-lab/data/tuning-415.js` | Validări 415 + ADN platforme + infrastructura Explorer; 29/5 este doar contact. |
| `rta-lab/data/personal-5wrap.js` | Prior personal 29/5 contact > 28/5 contact; păstrează excepțiile 29/6. |
| `rta-lab/data/tc-platform-map.js` | Harta aliaj/platformă TC. |
| `rta-lab/data/tc-sixwrap-global.js` | Gard global: NiFe = 6 spire. |
| `rta-lab/data/clapton-platform-map.js` | Autoritatea finală Clapton: 3 perechi active, triangulare contextuală, filtrare per platformă și Explorer final. |
| `rta-lab/data/wires.js` | Cele 5 sloturi active + specificații materiale TC. |
| `rta-lab/sw.js` | PWA/network-first; cache versionat. |
| `rta-lab/RTA_CONTINUITY_MASTER.md` | Sursa canonică de adevăr. |

### 9.2. Ordine runtime

`engine.js` → `tuning-415.js` → `personal-5wrap.js` → `tc-platform-map.js` → `tc-sixwrap-global.js` → `clapton-platform-map.js` → `bootstrap.js`.

- `tuning-415.js` fixează ADN-ul platformelor și infrastructura Explorer.
- `personal-5wrap.js` aplică priorul personal round-wire.
- `tc-platform-map.js` selectează aliajul pe platformele calibrate.
- `tc-sixwrap-global.js` garantează 6 spire NiFe.
- `clapton-platform-map.js` este ultimul strat Clapton și are autoritate finală asupra perechilor, triangulării și buildurilor active per platformă.

## 10. Reguli depășite / corecții

| Regulă veche | Status | Înlocuire |
| --- | --- | --- |
| TOP global la pairing | DEPĂȘIT | lichid + obiectiv + platform DNA |
| 415 baseline 28/6 | DEPĂȘIT | 28/5 contact |
| 415 29/7 prior | DEPĂȘIT | 29/5 contact sau 29/6 contact |
| **K1 29/5 varianta distanțată** | **ȘTEARSĂ 04.09.2026** | **29/5 contact** |
| K Prime 29/5 varianta distanțată | **ȘTEARSĂ 04.09.2026** | 29/5 contact = round-wire principal curent |
| KLP 29/6 singurul forever | DEPĂȘIT | 29/5 contact default; 29/6 contact alternativă |
| „Zivipf TCR310 = NiFe30” | CORECTAT | Zivipf NiFe52 TCR310 |
| Dicodes NiFe30 / 7 spire | DEPĂȘIT | Dicodes NiFe30 / 6 spire |
| GTR/KX NiFe30/7 | DEPĂȘIT | GTR/KX = NiFe30/6 |
| 415 K1 Clapton doar compatibil generic | REFINAT | K1 Clapton = pereche preferată de platformă |
| UI cu 4 perechi Clapton | DEPĂȘIT 04.09.2026 | UI afișează 3 perechi active |
| Explorer cu preferință Clapton fixă pe mai multe platforme | REFINAT 04.09.2026 | numai 415 păstrează Clapton explicit primul; restul urmează buildurile active |

## 11. Checkpoint 04.09.2026 — stare Clapton + 29/5 contact-only

**SALVAT CANONIC**

1. UI-ul afișează **3 perechi Clapton active**: Chariot+K1, 415+K1, Dvarw FL+SS.
2. La selectarea directă a 415 în Explorer, **K1 Clapton este varianta #1 afișată**.
3. Asylum V3 nu are pereche Clapton dedicată/preferată; K1 Clapton rămâne numai contextual pentru corp/integrare.
4. Triangularea motorului păstrează 415+K1 ca preferință contextuală și Asylum+K1 doar ca bonus contextual mic.
5. K1 29 GA / 5 spire există numai **contact**; varianta distanțată este eliminată din regulile active.
6. 415: 29/5 contact = concentrat/dulce; 29/6 contact = dry/tobacco; K1 Clapton/5 = preferință Clapton.
7. K Prime: 29/5 contact = round-wire principal curent.

## 12. Protocol de update / QA

1. Citește MASTER integral.
2. Citește fișierele canonice obligatorii.
3. Pentru A/B notează: RTA, cameră/airflow, sârmă, Ø coil, spire, contact, poziție, watt/TC, lichid, diferență senzorială.
4. La „salvează”, sincronizează MASTER + date + logică + UI + PWA.
5. Verifică să nu rămână reguli active contradictorii.
6. După fiecare update verifică **Quality Gate efectiv** și nu declara success înainte de `conclusion: success`.
