# RTA Lab — patru poziții de build, noul K1 primul (11.11.2026)

**Decizia utilizatorului:** «4 la fiecare: prima asta nouă, urmată de ce era». Asta înseamnă **un reper K1 nou, derivat din geometrie/airflow**, urmat de **aceleași trei builduri complete** din lista Atlas, în **ordinea lor originală**. NU înseamnă patru variante exclusiv K1 și NU modifică preferințele personale ori TOP 3 contextual Liquid Match.

**Domeniu:** 13 RTA active din motorul actual și 1 Taifun GAIA Boro separat. Fiecare reper K1 are Ø2,5 mm, Kanthal A1, 28 ori 29 GA, 5 ori 6 spire. Noul reper este **ipoteză tehnică**, nu verdict A/B, montaj confirmat ori diferență măsurată de gust. Cele trei builduri anterioare sunt etichetate «preferință personală» ori «propunere anterioară» după proveniența lor.

| Atomizor | 01 · K1 nou Ø2,5 mm | 02 · Existent | 03 · Existent | 04 · Existent |
|---|---|---|---|---|
| Kayfun Prime / Prime SE | 28 GA × 6 | NiFe30 × 7 | NiFe52 × 6 | K1 29 GA × 5 |
| Kayfun Lite Plus 2021 | 29 GA × 5 | NiFe30 × 7 | NiFe52 × 6 | K1 29 GA × 6 |
| Kayfun X | 29 GA × 6 | NiFe30 × 7 | NiFe52 × 6 | K1 29 GA × 6 |
| Taifun GT One | 29 GA × 5 | K1 29 GA × 5 | K1 28 GA × 5 | NiFe52 × 6 |
| Taifun GTR | 28 GA × 6 | NiFe30 × 7 | NiFe52 × 6 | K1 29 GA × 6 |
| Dvarw MTL CL | 28 GA × 6 | K1 28 GA × 6 | NiFe52 × 6 | K1 Clapton × 5 |
| Dvarw MTL FL | 28 GA × 6 | K1 28 GA × 6 | SS Clapton × 5 | NiFe52 × 6 |
| Arcana Muted+ | 29 GA × 6 | NiFe30 × 6 | NiFe52 × 6 | K1 28 GA × 6 |
| Diplomat v1.5 | 29 GA × 6 | NiFe52 × 6 | K1 Clapton × 5 | SS Clapton × 5 |
| Prime Minister Freehand | 29 GA × 6 | K1 Clapton × 5 | K1 28 GA × 5 | SS Clapton × 5 |
| Prime Minister Rhodesian / Standard | 29 GA × 6 | K1 Clapton × 5 | SS Clapton × 5 | NiFe52 × 6 |
| By-Ka V11 | 28 GA × 5 | K1 28 GA × 5 | NiFe52 × 6 | K1 29 GA × 5 |
| Minister MTL | 29 GA × 6 | NiFe52 × 6 | K1 Clapton × 5 | SS Clapton × 5 |
| **Taifun GAIA · Boro** | **28 GA × 5, ipoteză nevalidată în motor** | **Neînregistrat** | **Neînregistrat** | **Neînregistrat** |

## Triangulare și limite de probă

1. **Fizică:** prima poziție ia în calcul camera, direcția jeturilor, masa/diametrul sârmei și lungimea activă. Condițiile sunt în `data/k1-geometry-20261111.js`: **GTR ambele canale**, **Dvarw CL/FL 3×0,6 mm**, **Muted+ 0,8 jos + 2×0,8 laterale**, **Minister diverter 20×1 mm**. Altă inserție necesită reanaliză; nu extrapola automat.
2. **Practică:** pozițiile #02–#04 sunt returnate *nemodificat* de `buildLeads()`. Când #01 și unul din buildurile vechi coincid (GT One, Dvarw CL/FL, KX, By-Ka), sunt **două motive de includere a aceleiași geometrii**, nu două teste independente.
3. **Context:** `fourBuildLeads()` furnizează exact patru carduri în Atomizer Atlas; fiecare păstrează materialul, spirele, Ø, airflow, clopotul, regimul și poziția și se poate transfera în Wire Lab. Cu lichid ales, `RTA_SENSORY_CORE.analyze()` evaluează patru configurații în același context. Clasamentul contextual TOP 3 din Liquid Match și preferințele validate rămân independente.
4. **Incertitudine:** un tip `contact`/`spaced` neconfirmat rămâne neconfirmat, iar valorile W/TC sunt preseturi până la măsurare. Nu se inventează procente pentru aromă, TH sau plăcere.
5. **GAIA:** în Lab exista doar fișa de posesie fără trei builduri, geometrie/airflow verificat sau motor Boro. Poziția #01 este vizibilă drept **ipoteză separată**; #02–#04 sunt «neînregistrat», fără scor și fără inventarea unor configurații vechi.
6. **Protecții:** 14 platforme/40 unități active (13 RTA/39 + 1 Boro), 415 Cool și Mini V3 vândute, Asylum retras; Atlas 700 lichide, V10 620, cele trei Dvarw CL saved/draft și NiFe preferate păstrate.

## Fișiere canonice și QA

- Hartă: `rta-lab/data/k1-geometry-20261111.js`.
- UI: `rta-lab/atlas-preview/modules.js`, `index.html`, `k1-geometry.css`, `decision-explorer.js`; release `rta-lab/atlas/` și SW/cache generate deterministic.
- QA model: `tools/check-rta-atlas-modules.js`, `tools/check-rta-atlas-preview.js`, verificări ownership/context/decision. Testele vizuale actualizate verifică patru carduri, transfer și încadrare mobilă.
- Testarea vizuală locală are nevoie de Chromium funcțional și permis; în lipsă, verifică CI/Pages separat și înregistrează limitarea. **PASS de model nu echivalează cu publicare.**

La următorul «fa update», citește handoff/master/protocol, apoi acest document; verifică `main`, QA, Pages și manifestul ZIP din Bibliotecă.
