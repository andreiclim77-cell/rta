# RTA / MTL — ARHIVĂ DE CONTINUITATE MASTER

**Fișier canonic RTA Lab · stare consolidată 13.10.2026.**

- Repo: `andreiclim77-cell/rta`
- Branch: `main`
- Cale stabilă: `rta-lab/RTA_CONTINUITY_MASTER.md`
- Trigger reîncărcare: **„du-te în Lab și actualizează-te!”**
- Trigger persistență: **„salvează”**
- Trigger arhivă completă: **„da mi arhiva de continuitate la zi”**

> REGULĂ DE OPERARE: la „du-te în Lab și actualizează-te!”, citește mai întâi acest fișier integral. Apoi citește `rta-lab/data/tuning-415.js`, `rta-lab/data/personal-5wrap.js`, `rta-lab/data/tc-platform-map.js`, `rta-lab/data/tc-sixwrap-global.js` și `rta-lab/data/clapton-platform-map.js`. Pentru materiale TC citește și `rta-lab/data/wires.js`. Pentru comportament/UI verifică `rta-lab/engine.js`, `rta-lab/index.html`, `rta-lab/sw.js`, `rta-lab/sensory-ui.js`, `rta-lab/mood-match.js` și `rta-lab/mood-match.css`. Nu reconstrui proiectul din memorie dacă repo-ul este accesibil.

> REGULĂ DE SALVARE: la „salvează”, persistă imediat concluzia în MASTER și sincronizează datele, regulile, UI-ul și cache-ul relevante. Marchează certitudinea: validat practic / confirmat direct / preferință personală / extrapolat / ipoteză. După update verifică Quality Gate efectiv.

---

## 0. Frază de pornire pentru reluarea proiectului

> Continuăm proiectul Rta. Pairingul se face prin ADN de platformă, nu prin clasament global absolut: profil lichid → platformă/cameră/airflow → sârmă → Ø coil → număr spire → contact → poziție coil → watt/TC. Testul practic al utilizatorului prevalează asupra extrapolării. RTA Lab V10 are 620 repere și 5 sloturi active. Prior personal round-wire: **K1 29 GA / Ø2,5 / 5 contact** principal, **K1 28 GA / Ø2,5 / 5 contact** secundar; excepții validate 28/6: **KV3 Mini**, **Dvarw MTL CL cu insert 3×0,6** și **Asylum V3 cu clopot Flat**. KV3 Mini păstrează și **K1 29 GA / Ø2,5 / 6**. Varianta **K1 29 GA / Ø2,5 / 5 spire distanțată a fost eliminată complet din Lab la 04.09.2026**. Pentru TC: **Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · Ø2,5 · 6 spire** și **Zivipf NiFe52 · TCR310 · Ø2,5 · 6 spire**. Perechi Clapton active: **415→K1 Clapton/5**, **Dvarw MTL FL→SS316L Clapton/5**. Asylum V3 nu are o pereche Clapton dedicată/preferată; K1 Clapton/5 rămâne doar opțiune contextuală pentru corp și integrare.

## 1. Snapshot rapid

1. Paradigmă: fără TOP global în pairing; motorul folosește lichid + obiectiv + ADN platformă + build.
2. Preferință senzorială: tobacco-first, Tobacco Core Visibility, detaliu, layering, corp/mouthfeel; fără claritate sterilă și fără „tocăniță”.
3. RTA Lab: **V10 / 620 repere / 120 Hall of Fame / 16 platforme / 40 atomizoare fizice / 5 sloturi active**.
4. Catalog: 145 tutun simplu + 155 tutun complex + 150 NET simplu + 170 NET complex.
5. Prior personal: **K1 29/5 contact** principal; **K1 28/5 contact** secundar. Excepții validate: **KV3 Mini = 28/6 + 29/6**, **Dvarw CL 3×0,6 = 28/6**, **Asylum V3 Flat = 28/6**, toate pe Ø2,5.
6. K1 29/6 contact rămâne numai când ADN-ul platformei sau A/B-ul îl justifică; **GT One = 29/6 validat practic și preferat față de 28/5 în A/B direct**.
7. Varianta K1 29/5 distanțată este **ȘTEARSĂ / DEPĂȘITĂ** și nu trebuie reintrodusă în UI, motor, Explorer sau arhivă.
8. TC global: **NiFe30/6 + NiFe52/6**, ambele Ø2,5.
9. Dicodes personal: **RESISTHERM NiFe30, TCR320, 5,5 Ω/m** confirmat direct de pe eticheta rolei.
10. Harta TC: **GTR/KX → Dicodes NiFe30/6**; **K Prime → Zivipf NiFe52/6**; KLP rămâne exclus din harta NiFe.
11. Clapton active: **415→K1**, **Dvarw FL→SS**.
12. Asylum V3: Flat = claritate/separare; Dome = corp/integrare; **K1 Clapton/5 numai contextual**, fără prior de platformă.
13. **Mood Match (aprobat 13.10.2026):** 7 stări × 5 momente × lichid automat/manual; toate cele 16 platforme rămân accesibile; trei interpretări, niciun câștigător universal.

## 2. Inventar activ — 16 platforme / 40 RTA

| Platformă | Buc. | ADN / rol curent |
| --- | ---: | --- |
| 415 RTA MTL Cool Edition | 1 | High-sensitivity / micro-geometry; 28/5 contact = echilibru/layering; 29/5 contact = concentrat/dulce; 29/6 contact = dry/tobacco; **K1 Clapton/5 = pereche Clapton preferată**. |
| Kayfun Prime / K Prime | 2 | Echilibru premium; **29/5 contact** = round-wire principal curent; 28/5 = echilibru; TC curent NiFe52/6; NiFe30/6 benchmark istoric 80/20. |
| Taifun GT One | 4 | Straight tobacco precision; **A/B direct 12.10.2026: K1 29 GA / Ø2,5 / 6 contact > K1 28 GA / Ø2,5 / 5**. 29/6 devine buildul round-wire preferat curent al platformei. |
| Dvarw MTL CL 22 | 1 | Tobacco muscular; **configurație activă validată: insert 3×0,6 + K1 28 GA / Ø2,5 / 6 spire**; separat de FL. |
| Muted+ | 4 | Corp/mouthfeel + airflow configurabil; prior personal 29/5 contact dacă nu există excepție. |
| Taifun GTR | 5 | TC specialist; Dicodes RESISTHERM NiFe30 320/6; finețe, layering, smoothness. |
| Dvarw MTL FL | 2 | Analiză/separare; 28/5 excelent; **SS316L Clapton/5 = pereche dedicată**. |
| Diplomat v1.5 | 3 | Camerele schimbă specializarea aromatică; calibrare separată; 29/5 contact prior personal. |
| Kayfun X / KX | 4 | 28/5 extraordinar + Dicodes RESISTHERM NiFe30 320/6 TC; daily premium. |
| KLP / Kayfun Lite Plus 2021 | 5 | **A/B direct 12.10.2026: K1 28 GA / Ø2,5 / 5 contact > K1 29 GA / Ø2,5 / 6 contact** pentru redarea generală/completă. 29/5 contact rămâne specialistul de hit/TH/focus; harta NiFe nu modifică KLP. |
| Asylum V3 SS/DLC | 2 | **Flat = configurația activă validată cu K1 28 GA / Ø2,5 / 6 spire** pentru claritate/separare + corp/completitudine; Dome = corp/integrare; K1 Clapton/5 rămâne contextual. |
| Prime Minister Freehand | 2 | NET specialist; 28/5 = corp/layering; 29/6 contact = frunză/dry/tobacco-first. |
| Prime Minister Standard/Rhodesian | 2 | Mai saturat/cuminte; calibrare separată; 29/5 contact prior personal. |
| By-Ka V11 | 1 | Echilibru corp–claritate; airflow unic; 29/5 contact prior personal. |
| Kayfun Mini V3 | 1 | Micro-MTL sec/concentrat; **validat practic: K1 28 GA / Ø2,5 / 6 și K1 29 GA / Ø2,5 / 6**. |
| Minister MTL | 1 | Compact/warm/low-watt; 29/5 contact prior personal. |

## 3. Sârme active și baseline-uri

| Sârmă / familie | Baseline | Rol |
| --- | --- | --- |
| K1 28 GA round | Ø2,5 · 5 contact baseline; **28/6 validat pe KV3 Mini, Dvarw CL 3×0,6 și Asylum Flat** | echilibru, corp curat, mouthfeel, completitudine |
| K1 29 GA round | Ø2,5 · 5 contact prior; 6 contact justificat | tobacco-first, TH, dry, precizie, viteză |
| K1 Clapton 2×30+38 | Ø2,5 · 5 | corp, densitate, mouthfeel, TH, integrare |
| SS316L Clapton 2×30+38 | Ø2,5 · 5 | claritate, top-notes, layering |
| Dicodes RESISTHERM NiFe30 | TCR320 · 5,5 Ω/m · Ø2,5 · 6 | TC: finețe, smoothness, consistență, layering |
| Zivipf NiFe52 | TCR310 · Ø2,5 · 6 | TC: variantă de aliaj în același slot |

### 3.1. Regula K1 29 actuală

- **29/5 contact** = singura variantă activă de 5 spire.
- **29/6 contact** = alternativă justificată pe platforme/obiective unde este nevoie de footprint mai lat sau mai mult dry/tobacco-first; **pe KV3 Mini și GT One este regulă activă validată**. Pe KLP, A/B-ul direct 12.10.2026 favorizează 28/5 față de 29/6.
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

- **A/B direct 12.10.2026: K1 29 GA / Ø2,5 / 6 contact este preferat față de K1 28 GA / Ø2,5 / 5**.
- 29/6 = mai fin, mai separat și mai potrivit ADN-ului actual al GT One; devine buildul round-wire preferat curent.
- 28/5 rămâne alternativa mai plină/corpolentă.

### 4.4. GTR

- Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · Ø2,5 · 6 = baseline TC canonic.
- Rol: finețe, layering, smoothness, consistență termică.

### 4.5. KX

- K1 28/5 = extraordinar, echilibrat și natural.
- Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · Ø2,5 · 6 = TC canonic; smooth, constant, natural.

### 4.6. Dvarw

- CL și FL rămân calibrate separat.
- **Dvarw MTL CL + insert 3×0,6 + K1 28 GA / Ø2,5 / 6 spire = configurație activă validată 27.09.2026** pentru airflow multipunct, layering și completitudine.
- Dvarw FL păstrează validarea round-wire 28/5 și → **SS316L Clapton/5 dedicat** pentru claritate, top-notes și layering.

### 4.7. KLP

- **A/B direct 12.10.2026: 28/5 contact este preferat față de 29/6 contact** pentru redare generală/completă.
- 29/5 contact rămâne specialistul de hit/TH, focus, viteză și tobacco-first.
- 29/6 rămâne contextual, dar nu mai este varianta preferată de completitudine față de 28/5.

### 4.8. Prime Minister Freehand

- NET + 28/5 = corp, textură, layering, dezvoltare completă.
- NET + 29/6 contact = frunză, dry, tobacco-first; excepție validată.

### 4.9. Asylum V3

- **Flat + K1 28 GA / Ø2,5 / 6 spire = configurație activă validată 27.09.2026**: păstrează claritatea/separarea Flat și adaugă corp/completitudine.
- Dome = corp/integrare.
- **K1 Clapton 2×30+38 / Ø2,5 / 5 rămâne doar opțiune contextuală**, când se caută corp, densitate și integrare.
- Nu există Clapton dedicat/preferat fixat canonic pe Asylum.
- Explorer direct folosește doar buildurile active ale platformei și nu forțează un Clapton pe locul #1.
- Triangularea specifică Asylum păstrează numai un bonus mic pentru K1 Clapton când obiectivul/profilul cere body/dark/rich.

### 4.10. Kayfun Mini V3

- **Validat practic 21.09.2026:** K1 28 GA · Ø2,5 · **6 spire**.
- **Validat practic 21.09.2026:** K1 29 GA · Ø2,5 · **6 spire**.
- KV3 Mini este excepție explicită de la priorul personal transversal 28/5 + 29/5; geometria platformei prevalează aici.


## 5. Harta Clapton activă — 04.09.2026

| Platformă | Clapton | Tier | Rol |
| --- | --- | --- | --- |
| 415 | K1 Clapton 2×30+38 / 5 | preferat | corp, densitate, integrare; bonus contextual |
| Dvarw MTL FL | SS316L Clapton 2×30+38 / 5 | dedicat | claritate, top-notes, layering |

Asylum V3 păstrează **K1 Clapton/5 doar ca opțiune contextuală**, nu ca pereche activă.

### 5.1. Triangularea Clapton

Ordinea de decizie rămâne:

**lichid → obiectiv → ADN atomizor → build compatibil → preferință de platformă → recomandare**.

Reguli runtime:
- 415 + K1 Clapton: bonus de bază + bonus suplimentar pentru complex/dark/rich și body/TH/complete; penalizare moderată pentru tobacco + dry/simple.
- Asylum + K1 Clapton: bonus contextual mic; crește doar când se caută body/dark/rich.
- Dvarw FL + SS își păstrează statutul dedicat.
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
| `rta-lab/index.html` | UI V10; afișează cele 2 perechi Clapton active și baseline-urile TC. |
| `rta-lab/engine.js` | Motor de bază: 16 platforme, 5 sloturi, scoring, TOP 3. |
| `rta-lab/data/tuning-415.js` | Validări 415 + ADN platforme + infrastructura Explorer; 29/5 este doar contact. |
| `rta-lab/data/personal-5wrap.js` | Prior personal 29/5 contact > 28/5 contact; păstrează excepțiile validate: **KV3 Mini 28/6 + 29/6**, **Dvarw CL 3×0,6 28/6**, **Asylum Flat 28/6**. |
| `rta-lab/data/tc-platform-map.js` | Harta aliaj/platformă TC. |
| `rta-lab/data/tc-sixwrap-global.js` | Gard global: NiFe = 6 spire. |
| `rta-lab/data/clapton-platform-map.js` | Autoritatea finală Clapton: 2 perechi active, triangulare contextuală, filtrare per platformă și Explorer final. |
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
| UI cu 4 perechi Clapton | DEPĂȘIT 04.09.2026 | UI afișează 2 perechi active |
| Explorer cu preferință Clapton fixă pe mai multe platforme | REFINAT 04.09.2026 | numai 415 păstrează Clapton explicit primul; restul urmează buildurile active |

## 11. Checkpoint 12.10.2026 — colecție activă + validări round-wire + Clapton

**SALVAT CANONIC**

1. UI-ul afișează **2 perechi Clapton active**: 415+K1 și Dvarw FL+SS.
2. La selectarea directă a 415 în Explorer, **K1 Clapton este varianta #1 afișată**.
3. Asylum V3 nu are pereche Clapton dedicată/preferată; K1 Clapton rămâne numai contextual pentru corp/integrare.
4. Triangularea motorului păstrează 415+K1 ca preferință contextuală și Asylum+K1 doar ca bonus contextual mic.
5. K1 29 GA / 5 spire există numai **contact**; varianta distanțată este eliminată din regulile active.
6. 415: 29/5 contact = concentrat/dulce; 29/6 contact = dry/tobacco; K1 Clapton/5 = preferință Clapton.
7. K Prime: 29/5 contact = round-wire principal curent.
8. **GT One: A/B direct → K1 29 GA / Ø2,5 / 6 contact > K1 28 GA / Ø2,5 / 5; 29/6 devine preferința round-wire curentă.**
9. **KLP: A/B direct → K1 28 GA / Ø2,5 / 5 contact > K1 29 GA / Ø2,5 / 6 pentru redare generală/completă; 29/5 rămâne specialist hit/TH/focus.**

## 12. Protocol de update / QA

1. Citește MASTER integral.
2. Citește fișierele canonice obligatorii.
3. Pentru A/B notează: RTA, cameră/airflow, sârmă, Ø coil, spire, contact, poziție, watt/TC, lichid, diferență senzorială.
4. La „salvează”, sincronizează MASTER + date + logică + UI + PWA.
5. Verifică să nu rămână reguli active contradictorii.
6. După fiecare update verifică **Quality Gate efectiv** și nu declara success înainte de `conclusion: success`.


## 13. Checkpoint 13.10.2026 — compatibilitate lichide după clopot (V10 extins)

**Implementare nouă:** la selectarea oricărui atomizor din Explorer sau din fluxul Lichid → Atomizor apare o fișă pentru clopotul folosit.

- Mai întâi cele patru clase în ordinea potrivirii: Tutun simplu / Tutun complex / NET simplu / NET complex.
- Apoi clasament nominal calculat din toate cele 620 repere existente (inclusiv 120 Hall of Fame), fără a crea lichide fictive sau a altera catalogul.
- Căutare în toate cele 620; filtre pe cele patru clase; afișare progresivă; buton pe fiecare lichid pentru transfer în motorul TOP 3 existent.
- Clopote selectabile: Diplomat v1.5 = Duke, Freehand, Rhodesian; Asylum V3 = Flat, Dome; Prime Minister (ambele intrări Freehand/Rhodesian) = Freehand, Rhodesian, cu baza hardware standardizată pentru același clopot. Restul platformelor au cameră originală documentată; nu se inventează variante. Clopotul ales este păstrat local dacă stocarea este disponibilă.
- Recunoașterea clopotelor se bazează pe informații de producător/distribuitori verificate la 13.10.2026. Potrivirea lichidelor este un model determinist CALITATIV extrapolat din ADN-ul platformei, rolul clopotului și profilele/catalogul propriu, nu un sondaj, certificat universal, nici A/B individual pentru toate combinațiile. Nu afișa procente de certitudine nejustificate.
- Nu modifică geometria validată a buildurilor existente; în special **GT One K1 29/6 > 28/5**, **KLP K1 28/5 > 29/6** și **Asylum Flat K1 28/6**. Pe Asylum Dome avertizează că buildul validat este numai Flat.
- Noua funcție este disponibilă atât în Explorer, cât și la selectarea atomizorului din motor. La click pe lichidul din listă se deschide același lichid în motor cu atomizorul ales, pentru TOP 3.

### Fișiere noi
- rta-lab/data/bell-liquid-fit.js — profilurile celor 16 platforme, 4 clase, clopote și scorul calitativ aplicat fiecărui lichid.
- rta-lab/bell-liquid-ui.js — selectare clopot, liste, filtre, căutare, paginare, preferință locală, trimitere către motor.
- rta-lab/bell-liquid.css — interfață responsivă.
- tools/check-rta-bell-fit.js — teste exhaustive pe 620 de lichide pentru fiecare clopot și smoke tests de interacțiune.

### Integrare și QA
- rta-lab/index.html încarcă funcția după clapton-platform-map.js și afișează fișele în ambele fluxuri.
- rta-lab/sw.js precache pentru toate resursele noi, cache separat 20261013; rămâne V10 cu 5 sârme.
- .github/workflows/quality-gate.yml execută și tools/check-rta-bell-fit.js.
- Quality Gate și deploy trebuie confirmate efectiv SUCCESS pe commitul publicat, nu doar sintaxa locală.


## 14. RTA SENSORY DNA CORE — constituție integrată, 13.10.2026

**Mod nou de recomandare:** configurația completă, nu modelul generic, este unitatea de analiză. Este introdus nucleul tehnic cu 16 profile de platforme, opțiuni documentate de clopot, layouturi airflow, materiale, variante contact 5/6, geometrie, poziție, WATT/TC și profilul unui lichid din catalogul de 620.

### 14.1 Cele 10 axiome canonice
1. Evaluează configurația completă; nu clasifica absolut platformele.
2. Spectru aromatic ≠ intensitate.
3. Simultaneitate ≠ separare.
4. Prezență pe palat ≠ volum vapori.
5. Ofensivă ≠ throat hit.
6. Separare ≠ armonie.
7. Plăcerea personală nu rezultă automat din geometrie.
8. Personalitatea și atașamentul nu sunt ranguri universale.
9. Validarea personală prevalează numai pentru setupul testat; extrapolările se marchează explicit.
10. Explică avantajul, compromisul și gradul de certitudine al fiecărei recomandări.

### 14.2 Cele cinci dimensiuni senzoriale
- Arhitectură aromatică: spectru, separare, simultaneitate, Tobacco Core Visibility.
- Prezență pe palat: bogăție, acoperire, corp, textură.
- Energie senzorială: ofensivă și TH distinct.
- Armonie/naturalețe: integrare, echilibru, fluiditate.
- Plăcere/personalitate: NUMAI dacă există observații personale; fără scor predictiv.

### 14.3 Observații personale 13.10.2026, contextuale
- KLP + K1 28 GA / Ø2,5 / 5 contact: spectru bogat simultan, palat „îmbrățișat”, TH și ofensivă; preferat față de 28/6 și conform A/B anterior față de 29/6.
- KLP + K1 28 GA / Ø2,5 / 6 contact: mai moale, analitic, TH și ofensivă reduse; nu generaliza fără condițiile de putere/airflow.
- Dvarw CL + K1 28 GA / Ø2,5 / 6 contact, 3×0,6: muscular, ofensiv, focalizat; la insert 1×1,2 caracter perceput mai brut („Arnold” față de „Van Damme” 3×0,6). Rezultatul specific încă necesită A/B cu putere controlată.
- GTR + Dicodes RESISTHERM NiFe30 TCR320 / 6 TC: feeling special, spectru și stratificare extraordinare, „magie pe palat”, plăcere maximă, TH modest; GTR + K1 28 GA foarte bun dar fără magia TC.
- Prime Minister: specialist NET capabil, nu câștigă automat la armonie/atașament.
- K Prime și GT One: caracter speciale fără câștigător forțat; GT One K1 29/6 preferat față de 28/5 în A/B direct.
- Alte validări istorice 415, KX, Dvarw FL, Asylum Flat și KV3 Mini rămân active.

### 14.4 Modele tehnice și limite de certitudine
- Fișier canonic nou: rta-lab/data/sensory-core.js. Conține profile pentru toate cele 16 platforme, layouturi de airflow, 6 materiale (5 familii active: K1 28, K1 29, K1 Clapton, SS Clapton, NiFe TC cu NiFe30/NiFe52), geometrie coil, model senzorial, A/B și ordonare contextuală.
- Nu șterge motorul legacy, care rămâne reper de control.
- Aria nominală a orificiilor NU implică debit real; lungimea/masa termică sunt proximități geometrice, nu măsurători ale temperaturii.
- Diametrele necunoscute sunt marcate orientativ/neconfirmat. Nu pretindem clopote sau inserturi deținute dacă avem doar compatibilitatea.
- Implicit Ø2,5, contact pentru K1 29/5; varianta 29/5 distanțată rămâne ștearsă. NiFe30 și NiFe52 folosesc 6 spire; KLP exclus din harta NiFe, Asylum SS Clapton exclus, 415 K1 28/6 depășit.
- Plăcerea personală nu primește niciodată scor calculat. Configurațiile nevalidate sunt marcate extrapolate; observațiile personale sunt condiționate de setup.
- Ierarhia din profilul senzorial este estimare, nu măsurătoare, probabilitate sau sondaj.

### 14.5 Interfață profesionistă și flux
- Două moduri: „Pornește de la atomizor” și „Pornește de la lichid”.
- Cockpit: scop, cameră, airflow, material, spire, reglaje avansate (Ø, poziție, WATT/TC), cinci dimensiuni senzoriale, avantaje și compromisuri, observații A/B, TOP3 variante și lichide analizate din toate cele 620.
- Comparațiile vechi pe 5 familii și catalogul complet rămân accesibile în secțiuni extensibile pentru control și audit.
- Configurația aleasă se memorează local dacă browserul permite. Noul motor folosește setarea pentru ambele direcții de recomandare.
- Fișiere UI: rta-lab/sensory-ui.js și rta-lab/sensory-ui.css. Teste: tools/check-rta-sensory-core.js.

### 14.6 Control
- Verifică toate cele 16 platforme, materialele și opțiunile permise, 620 repere, clopotele, interdicțiile, observațiile A/B, UI mobil, consistența TOP3, fișierele PWA.
- Nu publica decât după SUCCESS la Quality Gate și la deployment.


## 15. RTA MOOD MATCH — selecție contextuală aprobată, 13.10.2026

**Principiu acceptat:** utilizatorul apreciază toate atomizoarele păstrate în colecție; nu există atomizor „prost” sau un câștigător global. Experiența dorită este determinată de starea de moment, context, lichid și configurația completă. Nu forța aceeași platformă ca #1 la fiecare stare și nu transforma exemplele personale în asocieri obligatorii.

### 15.1 Cele 7 stări aprobate (ordinea din UI)
1. 🔥 **POWER** — forță, ofensivă, throat hit.
2. ❤️ **PURE PLEASURE** — aromă bogată, prezență pe palat.
3. ✨ **MAGIC & COMPLEXITY** — finețe, stratificare, naturalețe.
4. 🕰️ **OLD SCHOOL** — tutun autentic, clasic, direct.
5. 🌿 **CHILL & RELAX** — experiență blândă, rotundă.
6. ♾️ **ALL DAY** — constanță, echilibru, fără oboseală.
7. 🎲 **SURPRISE ME** — redescoperire și explorare.

### 15.2 Fluxul de alegere
- **Pas 1 — MOOD:** alegi starea, nu un atomizor.
- **Pas 2 — MOMENT:** ☕ La cafea · ☀️ În timpul zilei · 🥤 La un suc · 🌙 Seara · 🛋️ În relaxare. „La un suc” înlocuiește formulările ambigue despre alcool.
- **Pas 3 — LICHID:** aplicația poate sugera lichide din cele 620 de repere sau utilizatorul poate căuta și fixa unul; alegerea manuală nu trebuie schimbată de algoritm.
- **Rezultate distincte:** (1) Potrivirea de moment; (2) O altă interpretare, cu alt caracter; (3) Redescoperă colecția, fără a pretinde că locul al treilea este un clasament absolut.
- Toate **16** platformele pot fi explorate și deschise individual; slotul de redescoperire se rotește pe combinațiile de stări/momente.
- Pentru fiecare rezultat: atomizor, lichid, clopot, airflow, sârmă, număr spire, Ø coil, WATT/TC, avantaj, compromis, certitudine. Butonul **„Deschide configurația completă”** trebuie să transfere în cockpit **toată configurația calculată**, nu doar atomizorul și lichidul.

### 15.3 Preferințe personale utile, NU reguli fixe
- Dvarw CL apare firesc în exemplele pentru **POWER** și/sau dimineața **la cafea**.
- Kayfun Lite Plus a fost dat drept exemplu pentru **în timpul zilei**.
- GTR a fost asociat spontan unei stări fericite, de explorare și complexitate.
- GT One a fost dat drept exemplu pentru **ALL DAY / old-style**, nu exclusiv.
- **Toate cele 16** pot apărea în mai multe stări în funcție de lichid și build. Nu transforma aceste exemple în blocaje algoritmice.

### 15.4 Interfață, metodă, verificare
- Pe **telefon**: mooduri și momente ca butoane mari, carduri pe o coloană, cuvinte care nu se rup vertical, navigare tactilă și menținerea lizibilității. Pe **desktop**: grile responsive cu 2–3 coloane.
- Modelul de scoring rămâne o **ipoteză tehnico-senzorială** contextuală; plăcerea personală nu se exprimă ca probabilitate sau punctaj fabricat.
- Fișiere: `rta-lab/mood-match.js`, `rta-lab/mood-match.css`; integrare: `rta-lab/index.html`, `rta-lab/sensory-ui.js`, `rta-lab/bootstrap.js`, `rta-lab/sw.js`.
- Test obligatoriu înainte de publicare: `node tools/check-rta-mood-match.js` plus testele RTA existente în **RTA Guide Quality Gate**; verifică 7×5 contexte, 16 platforme, 620 lichide, cache și handoff complet.
- După merge, confirmă separat versiunea publică și aspectul pe telefon real; trecerea testelor de cod nu echivalează automat cu un test vizual/deployment.

## 16. COCKPIT UNITAR ÎN TREI ZONE — aprobat 13.10.2026

**Decizie:** păstrăm Constituția RTA (10 axiome), modelul cu 5 dimensiuni, catalogul complet, Mood Match, A/B și modul dual atomizor/lichid. Nu recreăm motorul; îi facem rezultatele mai coerente și lizibile vizual.

### 16.1 Arhitectura interfeței
Pentru ambele intrări („Pornește de la atomizor” și „Pornește de la lichid”), după selectarea atomizorului cockpitul este împărțit în trei zone consecutive, cu navigare prin ancore accesibile:
1. **Configurator (01):** profil lichid sau lichid selectat, obiectiv, cameră/clopot, airflow, material, spire, diametru, poziție, putere și TC.
2. **Sensory DNA (02):** cele cinci dimensiuni, nivelul dovezilor, câștiguri, compromisuri, ancore A/B personale și explicații.
3. **Recomandări (03):** TOP 3 builduri compatibile și sugestii de lichide din tot catalogul; metoda și incertitudinea sunt vizibile.

Interfața păstrează selecțiile persistente deja existente; modificarea buildului trebuie să refacă analiza și recomandările, nu doar etichetele. Mood Match poate deschide configurația completă, fără recalcul arbitrar al configurației preluate.

### 16.2 Reguli UI/UX și PWA
- Stiluri responsive în `sensory-ui.css`: navigare în 3 coloane pe desktop, listă verticală pe mobil; zone în carduri, contrast, ordine vizuală, focus vizibil, suport pentru preferința de mișcare redusă.
- Zone distincte în DOM pentru fiecare mod: `sd-explorer-config/dna/recommendations`, respectiv `sd-main-config/dna/recommendations`. Titlurile au asociere `aria-labelledby`.
- Activele UI `sensory-ui.js` și `sensory-ui.css` au versiunea `10-three-zone-20261013` în HTML și service worker. Se schimbă cheia cache la publicare; restul motorului nu se rescrie.
- Păstrăm accesibile modulele istorice extensibile și continuitatea MASTER.

### 16.3 Teste obligatorii înainte de integrarea în main
`node tools/check-rta-sensory-core.js`, `node tools/check-rta-lab-mobile-clarity.js`, `node tools/check-rta-mood-match.js`, `node tools/check-rta-bell-fit.js`, plus workflow-ul integral `RTA Guide Quality Gate`. Verificarea CI nu înlocuiește testul vizual pe telefon real și confirmarea separată a versiunii publice.

## 17. HOME COMMAND CENTER — redesignul ecranului de intrare, 13.10.2026

**Problema rezolvată:** înainte, accesul la noul Sensory DNA era împins sub o prezentare lungă a sârmelor și sub Mood Match, astfel încât prima impresie mobilă părea neschimbată după implementarea cockpitului cu trei zone.

### 17.1 Flux vizual nou
- Primul ecran este `#rtaHome`: titlu clar, buton principal „Configurează un atomizor”, buton „Alege după stare”, prezentarea explicită a celor 3 zone Configurator → Sensory DNA → Recomandări.
- Imediat după hero se află `#labTools`, cu **patru intrări reale**: atomizor/configurator; Mood Match; lichid/620 repere; referința de builduri și sârme.
- Blocul lung al celor cinci familii de sârmă a fost mutat, fără ștergere, în `#wireReference`, o bibliotecă extensibilă după instrumentele principale. Datele și descrierile validate rămân intacte.
- MASTER rămâne vizibil în partea de jos și are link direct din tabloul de instrumente.

### 17.2 Logică de navigare
- `rta-lab/home-ui.js` reutilizează `window.RTA_SENSORY_UI.switchMode()` înainte să dea scroll la configuratorul atomizorului sau la fluxul după lichid; nu creează un motor paralel.
- Mood Match este accesat direct; referința de sârme se extinde la click. Legăturile sunt ancore HTML reale și au fallback când scriptul nu rulează.
- Fișierul `rta-lab/home-ui.css` folosește layout responsive, elemente tactile lizibile, contrast și focus vizibil.
- În `rta-lab/index.html` și `rta-lab/sw.js` resursele home-ui sunt versionate cu `v=10-home-20261013`; cheia cache se schimbă pentru utilizatorii PWA.

### 17.3 QA de publicare
- `node tools/check-rta-home-ui.js` validează ordinea ecranului, accesul la instrumente, schimbarea modului, deschiderea referințelor, linkurile MASTER, scenariul reduce-motion și precache.
- Păstrează validările anterioare Sensory DNA, Mood Match, Bell Fit, mobil și RTA Guide Quality Gate.
- Confirmă separat rezultatul CI, integrarea în `main`, publicarea GitHub Pages și aspectul pe telefon real. Nu confunda codul salvat într-o ramură cu versiunea publicată.
