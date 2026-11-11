# RTA Lab — patru poziții: 01 cu K1 28 + 29 GA; 02–04 istorice (11.11.2026)

**Ultima decizie explicită a utilizatorului:** «Trebuie să pui la prima variantă ambele și 28 și 29 GA la fiecare». Fiecare platformă are **patru poziții**, dar **01 conține DOUĂ configurații K1 complete (28 GA și 29 GA), fiecare cu spire/airflow/putere și transfer individual**, după camera și fluxul platformei; **02–04 sunt EXACT cele trei builduri istorice**, în ordinea și cu proveniența originală. Astfel, pentru fiecare din cele 13 RTA modelate există **5 configurații în 4 carduri**, fără a transforma TOP 3 din Liquid Match sau vreo preferință personală în alte valori.

**Domeniu:** 13 RTA active din motorul actual și 1 Taifun GAIA Boro separat. Ambele K1 au **Ø2,5 mm**, Kanthal A1, 28 și 29 GA și 5 ori 6 spire, după geometrie. Sunt **ipoteze tehnice paralele**, nu verdict A/B, montaj confirmat ori diferență măsurată de gust. Cele trei builduri anterioare sunt etichetate «preferință personală» ori «propunere anterioară» după proveniența lor. Unele variante K1 din 01 coincid geometric cu 02–04, însă nu au fost numărate drept dovezi independente. *28 GA are Ø≈0,321 mm, 29 GA Ø≈0,286 mm; la același material și lungime, schimbarea secțiunii modifică rezistența și masa, dar nu determină direct gustul.*

| Atomizor | 01A · K1 28 GA Ø2,5 mm | 01B · K1 29 GA Ø2,5 mm | 02 · Existent | 03 · Existent | 04 · Existent |
|---|---|---|---|---|---|
| Kayfun Prime / Prime SE | 28 GA × 6 | 29 GA × 6 | NiFe30 × 7 | NiFe52 × 6 | K1 29 GA × 5 |
| Kayfun Lite Plus 2021 | 28 GA × 5 | 29 GA × 5 | NiFe30 × 7 | NiFe52 × 6 | K1 29 GA × 6 |
| Kayfun X | 28 GA × 5 | 29 GA × 6 | NiFe30 × 7 | NiFe52 × 6 | K1 29 GA × 6 |
| Taifun GT One | 28 GA × 5 | 29 GA × 5 | K1 29 GA × 5 | K1 28 GA × 5 | NiFe52 × 6 |
| Taifun GTR | 28 GA × 6 | 29 GA × 6 | NiFe30 × 7 | NiFe52 × 6 | K1 29 GA × 6 |
| Dvarw MTL CL | 28 GA × 6 | 29 GA × 5 | K1 28 GA × 6 | NiFe52 × 6 | K1 Clapton × 5 |
| Dvarw MTL FL | 28 GA × 6 | 29 GA × 5 | K1 28 GA × 6 | SS Clapton × 5 | NiFe52 × 6 |
| Arcana Muted+ | 28 GA × 6 | 29 GA × 6 | NiFe30 × 6 | NiFe52 × 6 | K1 28 GA × 6 |
| Diplomat v1.5 | 28 GA × 5 | 29 GA × 6 | NiFe52 × 6 | K1 Clapton × 5 | SS Clapton × 5 |
| Prime Minister Freehand | 28 GA × 5 | 29 GA × 6 | K1 Clapton × 5 | K1 28 GA × 5 | SS Clapton × 5 |
| Prime Minister Rhodesian / Standard | 28 GA × 5 | 29 GA × 6 | K1 Clapton × 5 | SS Clapton × 5 | NiFe52 × 6 |
| By-Ka V11 | 28 GA × 5 | 29 GA × 5 | K1 28 GA × 5 | NiFe52 × 6 | K1 29 GA × 5 |
| Minister MTL | 28 GA × 5 | 29 GA × 6 | NiFe52 × 6 | K1 Clapton × 5 | SS Clapton × 5 |
| **Taifun GAIA · Boro** | **28 GA × 5, ipoteză Boro** | **29 GA × 5, ipoteză Boro** | **Neînregistrat** | **Neînregistrat** | **Neînregistrat** |

## Triangulare și limite de probă

1. **Fizică:** prima poziție include 28 și 29 GA în pereche, fiecare cu un footprint de 5/6 spire dedus din cameră, direcția jeturilor și masa/suprafața sârmei. Condițiile sunt în `data/k1-geometry-20261111.js`: **Prime 28/6 + 29/6**, **GTR 28/6 + 29/6 cu ambele canale**, **Dvarw CL/FL 3×0,6 mm**, **Muted+ 0,8 jos + 2×0,8 laterale**, **Minister diverter 20×1 mm**. Pentru altă inserție reanalizează. 28/29 nu sunt considerate echivalente energetic la același wattaj.
2. **Practică:** pozițiile #02–#04 sunt returnate *nemodificat* de `buildLeads()`. Când #01A ori #01B coincid cu unul din buildurile vechi (GT One, GTR, Dvarw CL/FL, Muted+, KX, By-Ka, PM Freehand), se afișează mențiunea **aceeași geometrie ca 01**, nu două teste independente.
3. **Context:** `fourBuildLeads()` furnizează exact patru **poziții** în Atomizer Atlas; `geometryPair()` detaliază #01 în două subvariante cu schema coil, regim și buton de transfer separat. În total sunt **cinci configurații tehnice** evaluabile în același context de lichid de `RTA_SENSORY_CORE.analyze()`. Clasamentul contextual TOP 3 din Liquid Match și preferințele validate rămân independente.
4. **Incertitudine:** un tip `contact`/`spaced` neconfirmat rămâne neconfirmat, iar valorile W/TC sunt preseturi până la măsurare. Nu se inventează procente pentru aromă, TH sau plăcere.
5. **GAIA:** în Lab exista doar fișa de posesie fără trei builduri, geometrie/airflow verificat sau motor Boro. Poziția #01 afișează **două ipoteze separate 28/5 + 29/5**; #02–#04 sunt «neînregistrat», fără scor și fără inventarea unor configurații vechi.
6. **Protecții:** 14 platforme/40 unități active (13 RTA/39 + 1 Boro), 415 Cool și Mini V3 vândute, Asylum retras; Atlas 700 lichide, V10 620, cele trei Dvarw CL saved/draft și NiFe preferate păstrate.

## Fișiere canonice și QA

- Hartă: `rta-lab/data/k1-geometry-20261111.js`.
- UI: `rta-lab/atlas-preview/modules.js`, `index.html`, `k1-geometry.css`, `decision-explorer.js`; release `rta-lab/atlas/` și SW/cache generate deterministic.
- QA model: `tools/check-rta-atlas-modules.js`, `tools/check-rta-atlas-preview.js`, verificări ownership/context/decision. Testele vizuale actualizate verifică patru carduri, transfer și încadrare mobilă.
- Testarea vizuală locală are nevoie de Chromium funcțional și permis; în lipsă, verifică CI/Pages separat și înregistrează limitarea. **PASS de model nu echivalează cu publicare.**

La următorul «fa update», citește handoff/master/protocol, apoi acest document; verifică `main`, QA, Pages și manifestul ZIP din Bibliotecă.
