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
3. RTA Lab: **V10 / 620 repere / 120 Hall of Fame / 16 platforme / 42 atomizoare fizice / 5 sloturi active**.
4. Catalog: 145 tutun simplu + 155 tutun complex + 150 NET simplu + 170 NET complex.
5. Prior general K1 29/5 contact > 28/5 contact **doar fără preferință de platformă explicită**. Actual: **TC NiFe30 = NiFe52 pe KLP/GTR/KX/Prime, apoi K1**; **GT One K1 29/6 apoi 28/5**; **Muted+ K1 28/6**; **Dvarw CL/FL preferă insert 3×0,6**. Excepții mai vechi: KV3 28/6+29/6 și Asylum Flat 28/6.
6. K1 29/6 contact rămâne numai când ADN-ul platformei sau A/B-ul îl justifică; **GT One = 29/6 validat practic și preferat față de 28/5 în A/B direct**.
7. Varianta K1 29/5 distanțată este **ȘTEARSĂ / DEPĂȘITĂ** și nu trebuie reintrodusă în UI, motor, Explorer sau arhivă.
8. TC global: **NiFe30/6 + NiFe52/6**, ambele Ø2,5.
9. Dicodes personal: **RESISTHERM NiFe30, TCR320, 5,5 Ω/m** confirmat direct de pe eticheta rolei.
10. **PREFERINȚA PERSONALĂ TC ACTUALĂ, 14.10.2026:** pe **KLP, GTR, KX și K Prime**, **Dicodes NiFe30/6 = Zivipf NiFe52/6 ca prioritate senzorială #1**; **K1 este #2**. TCR320 vs TCR310 sunt aliaje diferite; egalitatea preferinței nu este A/B universal. KLP NiFe30 a fost testat la DNA 220°C/16 W, fără transfer automat al setărilor spre NiFe52.
11. Clapton active: **415→K1**, **Dvarw FL→SS**.
12. Asylum V3: Flat = claritate/separare; Dome = corp/integrare; **K1 Clapton/5 numai contextual**, fără prior de platformă.
13. **Mood Match (aprobat 13.10.2026):** 7 stări × 5 momente × lichid automat/manual; toate cele 16 platforme rămân accesibile; trei interpretări, niciun câștigător universal.

## 2. Inventar activ — 16 platforme / 42 RTA

| Platformă | Buc. | ADN / rol curent |
| --- | ---: | --- |
| 415 RTA MTL Cool Edition | 1 | High-sensitivity / micro-geometry; 28/5 contact = echilibru/layering; 29/5 contact = concentrat/dulce; 29/6 contact = dry/tobacco; **K1 Clapton/5 = pereche Clapton preferată**. |
| Kayfun Prime / K Prime | 2 | TC #1 la egalitate: **Dicodes NiFe30/6 = Zivipf NiFe52/6** ca preferință; apoi **K1 29/5 contact** (alternativa round-wire), K1 28/5 contextual. Dicodes NiFe30 are și benchmarkul istoric 80/20. |
| Taifun GT One | 4 | Straight tobacco precision; **A/B direct 12.10.2026: K1 29 GA / Ø2,5 / 6 contact > K1 28 GA / Ø2,5 / 5**. 29/6 devine buildul round-wire preferat curent al platformei. |
| Dvarw MTL CL 22 | 3 | Tobacco muscular; **configurație testată pe un CL: insert 3×0,6 + K1 28 GA / Ø2,5 / 6 spire**. Cele 3 exemplare nu sunt presupuse configurate identic; separat de FL. |
| Muted+ | 4 | **K1 28 GA / 6 spire = prima preferință personală declarată** (14.10.2026); airflow/putere/Ø exacte nu au fost precizate. Alte builduri rămân contextuale. |
| Taifun GTR | 5 | TC #1 la egalitate: **Dicodes NiFe30 TCR320/6 = Zivipf NiFe52 TCR310/6** ca preferință; apoi K1. Magia GTR cu NiFe30 rămâne observație proprie. |
| Dvarw MTL FL | 2 | **Insert 3×0,6 = preferință personală validată A/B pe Balkan Milestone** cu K1 28 GA/6: orizont și simultaneitate superioare, palat ≈25% mai bogat perceput vs FL 1×1,2/K1/6, TH foarte puțin mai mic; SS316L Clapton/5 rămâne alternativă dedicată pentru layering. |
| Diplomat v1.5 | 3 | Camerele schimbă specializarea aromatică; calibrare separată; 29/5 contact prior personal. |
| Kayfun X / KX | 4 | TC #1 egal: **Dicodes NiFe30 TCR320/6 = Zivipf NiFe52 TCR310/6** ca preferință; apoi **K1 28/5** ca alternativă round-wire validată. |
| KLP / Kayfun Lite Plus 2021 | 5 | **A/B direct 12.10.2026: K1 28 GA / Ø2,5 / 5 contact > K1 29 GA / Ø2,5 / 6 contact** pentru redarea generală/completă. 29/5 contact rămâne specialistul de hit/TH/focus; **NiFe30/6 = NiFe52/6 pe primul nivel de preferință**, urmate de K1 28/5; **KLP NiFe30/6 DNA 220°C / 16 W a fost testat**, NiFe52 este egalitatea preferinței declarate (nu A/B controlat). |
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
- **TC preferat la egalitate: Zivipf NiFe52 TCR310/6 = Dicodes NiFe30 TCR320/6**; K1 29/5 rămâne alternativa în watt. Dicodes NiFe30/6 păstrează benchmarkul istoric 80% trabuc / 20% cireșe. Nu sunt aliaje identice.
- Fără verdict universal cross-alloy fără A/B controlat.

### 4.3. GT One

- **A/B direct 12.10.2026: K1 29 GA / Ø2,5 / 6 contact este preferat față de K1 28 GA / Ø2,5 / 5**.
- 29/6 = mai fin, mai separat și mai potrivit ADN-ului actual al GT One; devine buildul round-wire preferat curent.
- 28/5 rămâne alternativa mai plină/corpolentă.

### 4.4. GTR

- **NiFe30 Dicodes TCR320/6 și NiFe52 Zivipf TCR310/6 la egalitate ca preferință TC**, apoi K1. Testul personal cu Dicodes păstrează separat „magia pe palat”, finețea și layeringul.

### 4.5. KX

- **NiFe30 Dicodes/6 = NiFe52 Zivipf/6 ca preferință TC #1**, apoi K1 28/5, apreciat drept extraordinar și natural. Nu se extrapolează automat efectele validate cu Dicodes la Zivipf.

### 4.6. Dvarw

- CL și FL rămân calibrate separat.
- **Dvarw MTL CL + insert 3×0,6 + K1 28 GA / Ø2,5 / 6 spire = configurație activă validată 27.09.2026** pentru airflow multipunct, layering și completitudine.
- **Dvarw FL și CL au acum preferință explicită pentru insert 3×0,6**. Pe FL: K1 28 GA/6 + 3×0,6 a câștigat direct cu Balkan Milestone față de FL 1×1,2 / K1 6 (cu foarte puțin TH pierdut și ≈25% palat perceput în plus); K1 28/5 și SS316L Clapton/5 rămân alternative de testat în contexte proprii. FL nu egalează plăcerea pe GTR.

### 4.7. KLP

- **A/B direct 12.10.2026: 28/5 contact este preferat față de 29/6 contact** pentru redare generală/completă; 28/6 a fost mai blând/analitic față de 28/5.
- 29/5 contact rămâne specialistul de hit/TH, focus, viteză și tobacco-first; 29/6 rămâne contextual.
- **Nou 13.10.2026:** KLP + Dicodes NiFe30 TCR320 / Ø2,5 / 6 spire / DNA TC **220°C, plafon 16 W** a fost raportat cu spectru și palat îmbunătățite față de KLP Kanthal K1, TH și ofensivă ușor mai puternice și o magie senzorială, apropiindu-se de K Prime cu aceeași sârmă.
- **Actualizare preferință 14.10.2026:** pe KLP, **NiFe30 = NiFe52 ca prioritate senzorială**, apoi K1 28/5. Egalitatea este o alegere personală declarată, nu A/B NiFe52/30 pe același KLP. Testul NiFe30 rămâne raportat cu airflow și lichid neprecizate; Ø2,5/6, DNA 220°C / plafon 16 W sunt numai datele pentru Dicodes.

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
| KLP | Dicodes NiFe30 / 6 spire / Ø2,5 / DNA 220°C / plafon 16 W — observație personală, airflow/lichid încă neprecizate; NiFe52 doar ipoteză |

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
- Implicit Ø2,5, contact pentru K1 29/5; varianta 29/5 distanțată rămâne ștearsă. NiFe30 și NiFe52 folosesc 6 spire; KLP NiFe30 TC acceptat și testat personal cu detalii parțiale, NiFe52 KLP permis ca variantă exploratorie, Asylum SS Clapton exclus, 415 K1 28/6 depășit.
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

## 18. KLP NiFe30 TC și afinitatea de familie SvoëMesto–GTR — 13.10.2026

**Dovadă nouă raportată:** KLP + Dicodes RESISTHERM NiFe30, 6 spire Ø2,5 mm, TCR 320 (rola 5,5 Ω/m); pe mod DNA în TC la **220°C**, plafon **16 W**. Comparativ cu KLP Kanthal K1 28/5, utilizatorul raportează **spectru aromatic, prezență pe palat și feeling/magie mai bune; TH și ofensivă ușor crescute**. KLP rămâne distinct de GTR, dar se apropie mult senzorial de **K Prime cu aceeași sârmă Dicodes NiFe30**, nu de K Prime NiFe52.

**Date încă necunoscute:** lichidul, deschiderea AEROKON/airflow, contact/distanțat, poziție, rezistența rece, reglajele comparabile în K1. Nu declara automat A/B controlat pe parametri inexistenți, nici că limita de 16 W se furnizează permanent.

**Concluzie de familie:** NiFe30 TC pare deosebit de potrivit pentru SvoëMesto și Taifun GTR, *fără să uniformizeze personalitatea camerelor*. Observații personale/benchmarkuri pentru KLP, K Prime, KX și GTR. Kayfun Mini V3 + NiFe30 rămâne **extrapolare nevalidată**, nu test efectuat.

**Intenția producătorilor:** Nu s-a găsit dovadă că atomizoarele au fost concepute pentru NiFe30 în mod specific. SvoëMesto explică reducerea punctelor calde prin distribuția aerului pe lungimea coilului la Prime și saturarea/optimizarea MTL prin AEROKON la KLP. Dicodes precizează că RESISTHERM a fost special conceput pentru TC. Aceste proiectări sunt *complementare*, fără a demonstra o intenție comună sau cauzalitate exclusivă.
- SvoëMesto Kayfun Prime: https://www.svoemesto.de/en/kayfun-prime
- SvoëMesto Kayfun Lite plus: https://b2b.svoemesto.de/all-products/atomizers/
- Manual Dicodes RESISTHERM: https://www.manualslib.com/manual/2531221/Dicodes-Dani-Box-Micro.html?page=9
- Manual Taifun GTR: https://www.manualslib.com/manual/1617945/Taifun-Gtr.html

**Regulă de cod:** vechea excludere KLP din familia NiFe TC este **DEPĂȘITĂ**, înlocuită de permisul NiFe30/6. Motorul oferă KLP NiFe30 preset 220°C/16 W; alte platforme păstrează preseturile lor. Observația KLP cu airflow/lichid necunoscute se afișează ca **dovadă parțială**, nu ca ancoră exactă pentru orice insert/clopot. KLP K1 28/5 rămâne reper round-wire; NiFe52 pe KLP și NiFe30 pe Mini V3 sunt experimentale, nu validate personal. Niciun scor numeric al plăcerii nu este fabricat.

**Fișiere afectate:** data/sensory-core.js, data/tc-platform-map.js, sensory-ui.js, engine.js, index.html, sw.js și teste QA. Se verifică CI/deploy înainte de a confirma versiunea publică.

## 19. Actualizare colecție fizică și inserturi Dvarw — 14.10.2026

**Date declarate direct:** colecția are **42 atomizoare fizice**, fără modificarea celor **16 platforme** din motor. Față de vechiul inventar de 40, s-au adăugat **două exemplare Dvarw MTL CL**. Configurațiile reale se înregistrează separat pentru fiecare exemplar.

| Platformă | Cantitate actuală | Modificare / accesorii |
| --- | ---: | --- |
| Dvarw MTL CL 22 | **3** | +2 față de inventarul precedent (1); nu se presupune că toate trei au același insert sau build |
| Dvarw MTL FL | **2** | neschimbat ca număr; inserturi 3×0,6 mm achiziționate; **între timp testul FL/3×0,6 cu Balkan Milestone a fost confirmat la §20** |
| Kayfun Lite Plus 2021 (KLP) | **5** | neschimbat; deja canonic |
| Taifun GTR | **5** | neschimbat; deja canonic |

**Consecințe pentru Sensory DNA la momentul consemnării §19 (depășite de §20):** Dvarw CL și FL au ADN-uri distincte, iar varianta multipunct 3×0,6 mm a FL era atunci **accesoriu disponibil**, nu încă testat direct pe FL. La trei CL se pot păstra builduri/inserturi distincte pentru comparații ulterioare; nu le atribuim încă setări arbitrare. Varianta FL 3×0,6 poate fi selectată ca opțiune de hardware în configuratorul existent. Nu se modifică scoring-ul/calibrările istorice până la observații practice pe această combinație.

**Control:** totalul inventarului tabelar din §2 trebuie să fie **42**, număr de platforme **16**, iar valorile **5 KLP / 5 GTR** rămân confirmate.

## 20. Preferințe și comparația Balkan Milestone — 14.10.2026 (CURRENT)

**Autoritate:** declarații senzoriale directe ale utilizatorului din 14.10.2026, nu adevăruri universale despre materiale, flux sau toți cei 620 de lichizi. Această secțiune are prioritate față de preferințele mai vechi incompatibile din §4/§18/§19.

### 20.1. Dvarw CL / Dvarw FL — airflow preferat
- **CL și FL: insertul 3×0,6 mm este prima alegere personală clară.** 1×1,2 rămâne alternativă, nu presetul personal implicit.
- **A/B nou Dvarw FL cu „Balkan Milestone”**, K1 28 GA / **6 spire**, insert **3×0,6**, versus Dvarw FL cu insert **1×1,2**, tot K1/6 spire: **TH foarte puțin mai mic**, dar **orizont aromatic mai larg**, „**mușchi 90%**” ca descriere subiectivă, **palat ≈25% mai bogat perceput** și **arome clar simultane**. Preferință FL 3×0,6 fermă.
- În același context, FL 3×0,6 este raportat drept **mult mai puternic decât KLP cu K1 28/5**, fără să atingă însă **plăcerea particulară GTR**. Nu deduce de aici o superioritate universală a FL.
- Declarația ulterioară: **NiFe30 în TC scoate ceva senzorial din lichid pe care utilizatorul nu-l regăsește cu K1**; nu atribui exclusiv chimiei aliajului ceea ce poate ține de coil/TC/temperatură.
- **Date lipsă A/B:** wattaj, poziția coilului, diametru efectiv raportat pentru FL și toate setările comparatorului. Ø2,5 este **presetul tehnic Lab**, nu observație măsurată în acest test; „+25%” și „90%” sunt autoevaluări, nu instrumente de măsură. „Balkan Milestone” nu a fost identificat cu certitudine între cele 620 de fișe de lichide existente, deci nu-i inventăm brand/clasă/descriere în catalog.
- **Motor:** FL default K1 28/6 + 3×0,6, CL default K1 28/6 + 3×0,6. Pe FL SS316L Clapton/5 rămâne pereche dedicată contextuală; nu compara cu noul A/B fără test direct pe SS. În Sensory DNA, observația FL/Balkan este probă **parțial contextuală**, nu efect garantat pentru toate lichidele.

### 20.2. Priorități pe platforme
| Platforme | #1 preferință actuală | #2 / alternativă | Certitudine |
| --- | --- | --- | --- |
| **KLP, GTR, Kayfun X, K Prime** | **Dicodes RESISTHERM NiFe30 = Zivipf NiFe52**, în TC cu 6 spire | **K1** în WATT; pe KLP K1 28/5, KX 28/5, K Prime 29/5; GTR K1 28/5 reper watt | egalitate **declarată** între aliaje, **nu** identitate fizică ori A/B direct cross-alloy pe fiecare platformă |
| **GT One** | **K1 29 GA / 6 spire** | **K1 28 GA / 5 spire** | A/B direct anterior, reconfirmare explicită 14.10.2026 |
| **Muted+** | **K1 28 GA / 6 spire** | de testat | preferință personală declarată; airflow, Ø și W exacte neprecizate |
| **Dvarw CL și FL** | **insert 3×0,6 mm** | **1×1,2 mm** alternativ | CL validat anterior; FL A/B direct cu Balkan Milestone 14.10.2026 |
| **Toate celelalte platforme** | **NESTABILIT** | de testat | nu inventa clasamente sau transferuri |

**Separarea materialelor:** Dicodes NiFe30 = **TCR320**, cu etichetă de rolă confirmată 5,5 Ω/m; Zivipf NiFe52 = **TCR310**; ambele au 6 spire/Ø2,5 în baseline, dar **nu sunt același aliaj**, nici nu folosesc automat aceleași setări TC. Egalitatea înseamnă că utilizatorul nu dorește să fie ierarhizate între ele la capitolul **preferință personală**. KLP DNA **220°C, 16 W** reprezintă exclusiv setarea raportată pentru **Dicodes NiFe30**.

**Reguli de scoring:** în Sensory DNA, „preferință personală” este o etichetă și un prior transparent separate de dovezile testului. Niciun scor numeric de plăcere nu se calculează. Cele două NiFe primesc același bonus de prioritate personală pe platformele declarate, iar diferențele de rezultat tehnic/lichid rămân posibile și etichetate. Păstrează 16 platforme, 42 RTA fizice, 620 lichide și numai cinci familii de sârme active. Metodă: A/B direct > preferință declarată > extrapolare tehnică, fără transfer între lichide sau platforme.
