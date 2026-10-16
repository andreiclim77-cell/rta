# RTA LAB — PROTOCOL CANONIC DE RELUARE ȘI SALVARE
**Acord explicit al utilizatorului, 16.10.2026. Regula are prioritate asupra triggerelor vechi din istoric.**

## 1. „Du-te în Lab și fă-ți update”
Recunoaște inclusiv variante informale/greșeli de tastare și „du-te în Lab și actualizează-te”. Nu cere retransmiterea conversațiilor trecute. Folosește GitHub conectat, repo `andreiclim77-cell/rta`, **ramura `main` actuală**, nu un SHA memorat. Citește ÎN ACEASTĂ ORDINE:
1. `rta-lab/RTA_CURRENT_HANDOFF.md` — autoritatea de stare curentă, prioritară față de pasajele istorice;
2. `rta-lab/RTA_CONTINUITY_MASTER.md` — toate regulile, cronologia și inventarul;
3. `rta-lab/RTA_ATLAS_DESIGN_BLUEPRINT.md` — designul, modulele și criteriile de acceptare;
4. prezentul protocol.
Verifică diferențele reale din `main`, PR-uri relevante, ultimele verificări CI / GitHub Pages, datele, UI și eventualele blocaje. Citește fișierele de cod corespunzătoare problemei, nu infera doar din titlul fișierului. Dacă GitHub nu e accesibil în conversația nouă, anunță asta și cere conectarea/folosește arhiva portabilă salvată în Bibliotecă, fără a inventa starea. Răspunde pe scurt cu versiunea, starea de finalizare, ce e încă deschis și următorul pas; nu reface ce a fost terminat bine.

## 2. „Salvează”
Declanșează **AMBELE** operații pentru toate noile decizii practice sau modificări ale aplicației:
**A — Aplicarea în proiectul GitHub**: înscrie concluzia cu statutul ei (confirmat, preferință, ipoteză, neverificat) în MASTER și, dacă e relevant, în date/cod, reguli, interfață, teste și cache. Respectă restricțiile de platformă și dovezile. Verifică regression/QA pe SHA concret. Nu pretinde publicare doar pentru că există commit; confirmă integrarea `main` și succesul Pages. Dacă un gate eșuează, păstrează modificările și eroarea în handoff, remediază și retestează; fără pierderi, refaceri inutile sau afirmații false.
**B — Arhiva de continuitate**: actualizează `RTA_CURRENT_HANDOFF.md`, `RTA_CONTINUITY_MASTER.md` și, dacă decizia afectează designul, `RTA_ATLAS_DESIGN_BLUEPRINT.md`. Întreține pachetul portabil `RTA_CONTINUITATE_CURENTA.zip` în Biblioteca ChatGPT (folder separat `/RTA_Lab/`), cu instrucțiuni de reluare, stare exactă/SHA, decizii definitive, fișiere canonice, probleme deschise, QA, următorul pas; fără duplicare masivă a datelor de catalog dacă sunt versionate în GitHub. Verifică existența/rezultatul uploadului; dacă accesul la Bibliotecă ori scrierea nu e disponibilă, spune explicit, nu afirma că ai actualizat-o.

## 3. „Dă-mi arhiva de continuitate la zi”
Livrează arhiva curentă completă, independent utilă pentru un chat nou; dacă s-a schimbat codul între timp, sincronizeaz-o înainte de a o oferi. Include linkul real creat și explică orice limitare. Nu crea un link inventat.

## 4. Invariante tehnice și stare de pornire (16.10.2026)
- Aplicație: `https://ghid-rta.ro/rta-lab/atlas/`; V10 original separat `https://ghid-rta.ro/rta-lab/`. Atlas 700 produse verificate / 61 mărci; V10 are 620 repere originale. 16 platforme; 42 exemplare fizice; 5 sloturi de sârme V10 / șase variante în familia TC modelată (NiFe30 și NiFe52 distincte). Păstrează trei Dvarw CL cu fișe locale `saved/draft` independente.
- Taifun GTR: Dicodes RESISTHERM NiFe30 TCR320 / 7 spire și Zivipf NiFe52 TCR310 / 6 spire ca alegeri personale egale; NiFe30/6 încă funcționează. GTR NiFe30/7: 230°C, plafon 16 W, ≈12 W la final în experiment; nu deduce temperatură reală și nu transfera la alte platforme.
- 415 Cool: NiFe30/7 = NiFe52/6 prim nivel, apoi K1 28 GA/6; păstrează K1 Clapton/5 și K1 28/5 istorice. KLP/K Prime/Kayfun X: NiFe30 și NiFe52 / 6 spire; KLP NiFe30 DNA 220°C/16 W este observație specifică.
- Asylum V3: opțiune `dual10` pin 2×1,0 documentată; `dual08` 2×0,8 **neconfirmată și doar simulabilă**; nu confunda poziția AFC 0,8 cu diametrul pinului montat. SS Clapton pe Asylum exclus. Clopotul Flat cu K1 28 GA/6 validat personal.
- PR #55 (16.10.2026) a introdus în Atomizer Atlas trei builduri complete/materiale distincte imediat la selecția fiecăreia dintre cele 16 platforme, fără lichid obligatoriu, cu schemă coil, spire, diametru, insert/airflow, clopot, TC/W și poziție, handoff spre Wire Lab; ultima verificare este cea din GitHub, nu din acest text. Dacă utilizatorul raportează un defect pe telefonul lui, reproducerea efectivă rămâne obligatorie; CI Chromium nu înlocuiește test pe dispozitiv.
- Nu modifica alte proiecte; automatizările sociale/Market ale repo-ului pot avansa `main` independent. Nu divulga date sau inventa scoruri personale / recenzii.

**Regula: „salvează” = aplicație + arhivă, iar „du-te în Lab și fă-ți update” = reluare din sursa canonică, nu din memoria conversației.**
