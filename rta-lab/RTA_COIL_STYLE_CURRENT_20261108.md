# RTA Lab — registru canonic CONTACT / SPACED (08.11.2026)

**Sursă:** declarațiile personale până la 07.11.2026; istoricul A/B KLP din 01.11, preferințele 03.11, Muted+ 04.11. **Este un registru de preferințe și dovezi, nu o pretinsă verificare fizică a fiecărui exemplar.** Nu rescrie istoricul, nu calculează diferențe senzoriale doar din cuvântul „spaced”.

| Platformă | Prioritate / material / spire | Contact sau spaced? | Certitudine / limită |
|---|---|---|---|
| **Taifun GT One** | **K1 29 GA / 5** | **SPACED** | **Montat, descris ca „perfect” la 03.11**. 29/6 contact este doar un A/B istoric. |
| **Taifun GTR** | **NiFe30/7 ori NiFe52/6 TC**, apoi **K1 29 GA / 5 ori 6** | Pentru **K1: SPACED**; pentru ambele NiFe: **NECONFIRMAT** | Variante K1 declarate, fără A/B izolat între 5 și 6. |
| **KLP 2021** | **NiFe30/7 ori NiFe52/6 TC**, apoi **K1 29 GA / 6** | Pentru **K1: SPACED preferat în A/B-ul contextual din 01.11; CONTACT rămâne alternativă acceptată**. Pentru NiFe: **NECONFIRMAT** | KLP K1 29/6 **ușor spaced**, 13 W, Aerokon ≈1 mm, înălțime coil–air 1,8 mm; contextul poziției și lichidului 80% trabuc / 20% cireșe nu se transferă altor setupuri. Nu generaliza procentele A/B. |
| **Kayfun X 24** | **NiFe30/7 ori NiFe52/6 TC**, apoi **K1 29 GA / 6** | Pentru **K1: CONTACT SAU SPACED**; pentru NiFe: **NECONFIRMAT** | 6 spaced este punct de pornire tehnic pe KX, **nu** un A/B personal pe KX. Nicio departajare contact/spaced confirmată. |
| **Kayfun Prime** (3 exemplare, al treilea **Prime SE**) | **NiFe30/7 ori NiFe52/6 TC**, apoi **K1 29 GA / 5 ori 6** | Pentru **K1: CONTACT SAU SPACED**; pentru NiFe: **NECONFIRMAT** | Patru combinații K1 declarate; nu se inventează un câștig sau un coil instalat pe fiecare Prime. |
| **Arcana Muted+** (4 exemplare) | **NiFe30/6 ori NiFe52/6 TC**, apoi **K1 28 GA / 6** | **NiFe30/6 SPACED; NiFe52/6 SPACED; K1 28/6 CONTACT** | NiFe30/6 spaced montat/testat pe Arcana DNA60C; NiFe52/6 spaced alegere declarată; K1 contact alternativ. **Excepție NiFe30/6** de la /7 global. |
| **Dvarw CL/FL și alte RTA active** | Conform fișelor particulare: Dvarw 28/6 cu 3×0,6; configurații și alte sârme nemodificate | **NECONFIRMAT** când nu există dovadă explicită de tip pe combinația exactă | Nu traduce automat „6 spire” în „6 contact”. Reperul transversal K1 28/5 contact este general, nu instalare dovedită pe fiecare atomizor. |
| **Taifun GAIA RBA (Boro)** | **NECONFIRMAT** | **NECONFIRMAT** | Deținut, dar fără build / geometrie / airflow declarate. Fără potriviri inventate. |
| **415 Cool și Kayfun Mini V3** | Vândute la 07.11 | **Doar istoric** | 415 K1 29/5 sau /6 contact este reper din istoric. Nu readuce modelele în recomandările active. |

## Muted+ — repartizare fizică independentă de tipul coilului

- **3 exemplare:** inferior **0,8 mm** și laterale **2×0,8 mm**; **tutun simplu / NET simplu**.
- **1 exemplar:** inferior **1,2 mm** și laterale **2×0,6 mm**; **complexe**.
- Testul pe airflow a indicat aproximativ **−20% dulceață** și **+20% TH pe palat**, cu TH în gât și ofensivă neschimbate; estimări subiective. Nu există un A/B separat al lichidelor complexe. Nu presupune că același tip de coil este montat pe toate cele patru exemplare.

## Contract de aplicație

1. `data/sensory-core.js` deține **singura hartă de tip de spire**. Proprietatea `spacing` a configurației este `contact`, `spaced` ori `unspecified`. **Spaced** și **contact** nu se deduc din numărul de spire sau din material.
2. Pentru **KLP 29/6**, presetul este `spaced` (preferință în testul contextual); `contact` rămâne selectabil. Pentru **KX și Prime K1**, configurația implicită are `unspecified`, iar explicația afișează **„contact sau spaced — ambele declarate”**, fără alegere fizică implicită.
3. Pentru celelalte combinații fără dovadă explicită, `unspecified` afișează **„neconfirmat”**. Alegerea manuală a contact/spaced în simulator **nu** devine probă de montaj sau gust.
4. Wire Lab, V10 Sensory DNA, Atlas, matricele comparative, Duel și transferul buildului trebuie să păstreze/afișeze tipul exact sau incertitudinea. Un preset trebuie resetat corect când schimbi materialul, numărul de spire ori platforma; o selecție explicită se păstrează când transferi **același** build în Duel.
5. Datele fizice de axial width în model rămân **minimul pentru spire contact**; lățimea reală a unui spaced cere distanță măsurată între spire. Nu pune valori de putere, TH, aromă ori scor deduse exclusiv din tipul spirelor.
6. Codul 16 modele istorice și observațiile anterioare rămân, dar **în prezent recomandăm doar 13 RTA clasice active** + GAIA separat în inventar. Catalog Atlas 700, V10 620 și fișele celor 3 Dvarw CL sunt protejate.

**Surse locale:** `RTA_PERSONAL_BUILDS_20261103.md`, `RTA_MUTED_AIR_AB_20261104.md`, `RTA_CONTINUITY_MASTER.md` (checkpoint 01.11 + 03.11 + 04.11 + 07.11), `RTA_COLLECTION_STATUS_20261019.md`.
