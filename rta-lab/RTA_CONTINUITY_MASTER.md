# RTA / MTL — ARHIVĂ DE CONTINUITATE MASTER

> **30.10.2026 — FLUX UNIC SÂRME (versiune în validare).** Traseu fără pași dublați: toate cele șase sârme cu coil și builduri preferate → selectezi sârma de pornire → compari pe aceleași platforme → alegi explicit materialul/numărul de spire final → alegi obiectivul (TH, stratificare, corp, finețe etc.) → alegi familia și lichidul concret → abia atunci vezi TOP 3 atomizoare și restul compatibile, cu comparație pe 14 axe. Nu afișa 15 atomizoare înaintea alegerii lichidului în Wire Lab; Atomizer Atlas rămâne o secțiune independentă. Păstrează distinct comportamentul demonstrativ față de alegerea efectivă. **NiFe30 Dicodes/7 este presetul global, dar NiFe30/6 rămâne alternativă istorică selectabilă explicit; NiFe52/6 neschimbat.** Nu atribui vechiul KLP/6 DNA 220°C/16 W noului KLP/7. Nu schimba cataloagele 700/620 sau fișele locale Dvarw CL. Nu considera livrat până la validarea CI/Pages și arhiva Bibliotecii.



> **WIRE LAB PROGRESIV — 29.10.2026 (CANDIDAT, NEPUBLICAT ÎNCĂ):** Din capturile reale Samsung ale utilizatorului: pagina **SÂRME** trebuie să prezinte la intrare **toate cele 6 materiale simultan**, fiecare cu coil SVG cu numărul corect de spire și toate reperele preferate curente din RTA Lab, nu doar fotografie de rolă sau o descriere generică. NiFe30 Dicodes TCR320 = 7 spire preferate global, NiFe52 Zivipf TCR310 = 6 spire; materialele Kanthal/Clapton păstrează exemplele specifice, fără a inventa montări fizice. La intrare: toate cele **15 platforme active** (Asylum rămâne istoric), fără recomandare automată bazată pe lichidul demonstrativ. **Potrivirile se fac PROGRESIV** prin selecțiile utilizatorului: sârmă → spire → obiectiv TH/stratificare etc. → familie Tutun/NET simplu/complex → lichid comercial exact. În stadiu intermediar, topurile sunt ESTIMĂRI pe profil neutru/generic și nu echivalează cu testele personale; la lichid concret devin contextual TOP 3, iar atomizoarele compatibile rămase sunt accesibile separat, fără să fie numite incompatibile. Stadiile din interfața candidată: 15 inițial, apoi 8/6/5/4/3 în prim-plan (număr de carduri, NU dimensiunea colecției), cu resetare. Se sincronizează și wizardul Wire Lab existent. Nu afectează selecțiile, colecția, fișele Dvarw CL locale sau Liquid Match/Market/Duel. Branch candidat `feature/rta-wire-catalog-adaptive-match-20261029`. Verificarea/release-ul/merge/Pages și arhiva Bibliotecii necesită confirmări la SHA exact; **nu declara publicat până atunci**. Monitorizarea orară a noilor `run failed` a fost configurată separat pentru utilizator.

> **UPDATE PRIORITAR 29.10.2026 — REGULĂ PERSONALĂ GLOBALĂ DE SPIRE (înlocuiește preseturile vechi incompatibile):** pentru **Dicodes RESISTHERM NiFe30 TCR320 → 7 spire ca alegere implicită pe orice atomizor compatibil din RTA Lab** (inclusiv KLP, K Prime, Kayfun X, GTR, 415 Cool și celelalte); pentru **Zivipf NiFe52 TCR310 → 6 spire pe toate atomizoarele**. La NiFe30, 6 spire rămân configurație istorică selectabilă pentru comparație, dar NU presetul personal curent. Este decizia personală actuală, nu un test A/B realizat pe toate platformele. Observație personală: 7 spire NiFe30 în TC funcționează mai stabil/coerent, inclusiv pe KLP; TH-ul direct poate scădea față de 6, dar crește caracterul bogat, rotund și cuprinzător al senzației pe palat (TH „de bogăție”). Nu inventa un procent de TH, nu transforma descrierea într-o măsurătoare ori promisiune universală. Diametrul Ø2,5 mm rămâne preset Lab, nu măsurătoare generală. Păstrează TC/WATT ca regimuri distincte, TCR320/310, NiFe30 WATT 12 W ca observație separată, setările GTR/415/KLP numai în contextele documentate; **nu transfera automat testul KLP NiFe30/6 DNA 220°C/16 W asupra noului NiFe30/7**. Modificarea trebuie propagată în motor, Atlas/Wire/Liquid Match, V10, testele de regresie, release/cache și continuitate; fără distrugerea celor 700/620 de lichide sau a fișelor CL.

> **UPDATE PRIORITAR 22.10.2026 — Dicodes RESISTHERM NiFe30 disponibil și în WATT:** selector TC/WATT în Lab, **12 W** preset personal, chipset selectabil **Dicodes, YiHi, ARC1, DNA**. NiFe30/7 WATT la 12 W a oferit vapori mai echilibrați termic decât la 13 W; **Zivipf NiFe52/6 în TC** merge foarte bine, separat. Nu inventa superioritatea vreunui aliaj sau test pe toate modurile. **TC anterior nu se șterge**, iar observațiile lui nu se aplică automat în WATT. Citește `rta-lab/RTA_NIFE30_WATT12_20261022.md`, testează `tools/check-rta-nife30-watt.js` și verifică SHA/Pages.

> **PRIORITATE 19.10.2026 — Asylum V3 scos din lista activă:** utilizatorul îl va dona, dar predarea nu e încă confirmată. Colecția activă Atlas = **15 platforme / 40 exemplare**; 16/42 rămâne doar arhivă istorică (două Asylum). La nivel personal, Asylum are aromă bună, comparabilă cu Revorie, dar acesta e singurul atu; TH și ofensiva nu justifică păstrarea. **Nu-l reactiva în recomandări.** Vezi `rta-lab/RTA_COLLECTION_STATUS_20261019.md`. Datele V10/Atlas 700 și CL rămân protejate.


## FLUX NOU RTA LAB — SÂRME, ATLAS ȘI LICHIDE (16.10.2026 · PUBLICAT ȘI VERIFICAT)

**SALVAT ȘI PUBLICAT.** Cerința utilizatorului «salvează» din 16.10.2026 este implementată. [PR #57](https://github.com/andreiclim77-cell/rta/pull/57) integrat în `main`, commit final **`1b64d416ad02da598ad520528f6d5cf5d698e61a`**. La commitul de acceptare `cea1e18bd6e025bb1481a1c23af4b6465886d0dc` au trecut [RTA Quality #38937512181](https://github.com/andreiclim77-cell/rta/actions/runs/38937512181), [Market #38937512253](https://github.com/andreiclim77-cell/rta/actions/runs/38937512253) și [Visual Mobile #38937512194](https://github.com/andreiclim77-cell/rta/actions/runs/38937512194) — toate SUCCESS. Post-merge pe exact `1b64d416`: [RTA #38938717457](https://github.com/andreiclim77-cell/rta/actions/runs/38938717457) SUCCESS, [GitHub Pages #38938716898](https://github.com/andreiclim77-cell/rta/actions/runs/38938716898) SUCCESS și [Continuitate ZIP #38938717455](https://github.com/andreiclim77-cell/rta/actions/runs/38938717455) SUCCESS. Unele run-uri istorice eșuate aparțin candidatului anterior; ultimele verificări relevante sunt verzi. Nu relua lucrări deja validate.

**Wire Lab — noul traseu, în plus față de instrumentul existent:** sârmă → număr de spire compatibil → obiective 1–10 pe 14 axe și grafic cu bare → **Compară** cu o a doua sârmă și spire, pe aceeași scară (medii pe exact aceleași platforme compatibile; altfel avertisment) → **„Te-ai decis?”** și selector final de sârmă + spire → toate obiectivele → 4 indici orientativi (%) pentru Tutun simplu / Tutun complex / NET simplu / NET complex → selecție categorie → toate lichidele comercial verificate din categorie în selector → până la trei atomizoare compatibile, ordonate contextual pentru **același material, aceleași spire și același lichid**, cu comparație de obiective. Dacă mai puțin de trei atomizoare acceptă combinația, se afișează doar cele reale (ex. NiFe30/7: GTR și 415), nu se inventează al treilea.

**Atomizer Atlas — păstrează intactă secțiunea existentă „Trei builduri pentru acest context” și tot ce urmează după ea.** Înainte de aceasta: selectare atomizor → toate sârmele permise, comparate pe 14 obiective 1–10 (cu numărul de spire explicit) → alegere sârmă → comparație 5/6 ori excepțiile canonice 7 (numai când sunt permise) → alegere spire → indici orientativi (%) pentru cele patru familii → alegere familie → selector cu toate produsele acelei categorii → alegere lichid, fără pierderea celor 3 builduri complete, a datelor fizice, configurației selectate sau a trimiterii Atlas → Wire.

**Liquid Match — completări izolate, nu înlocuirea traseului 3×3:** înaintea căutării, utilizatorul selectează una dintre cele 4 categorii; filtrul existent caută / paginează toate lichidele din categoria aleasă. În rezultatul 3 atomizoare × 3 builduri apare pe fiecare atomizor rezumatul obiectivelor plus comparația completă a tuturor celor 14 axe 1–10 între atomizoare și, în detaliile fiecăruia, între cele trei sârme/configurații. Celelalte acțiuni, trasee și ordonări rămân existente.

**Limite numerice explicite:** 14 axe folosesc semnalele tehnice deja calculate (`spectrum`, `separation`, `simultaneity`, `focus`, `palate`, `offense`, `th`, `harmony`, `texture`, `tobaccoCore`) și patru indici derivați (stratificare, corp, claritate, finețe) **etichetate proxy**. Conversie afișare 1–5 la 1–10: `1 + (indicator - 1) × 2,25`, cap la 10. **Nu sunt valori măsurate**, iar dulceața/uscăciunea fără semnal dedicat nu primesc note fictive. Procentele sunt **indici calculați orientativ**, pe 16 produse distribuite din fiecare familie, prin agregarea dimensiunilor motorului și a până la 3 platforme compatibile; nu reprezintă probabilitate, test senzorial, A/B controlat ori procent de plăcere. Ordinea din top este contextuală și nu contrazice observațiile personale înregistrate.

**Date protejate:** 700 lichide Atlas (107 Tutun simplu, 130 Tutun complex, 210 NET simplu, 253 NET complex), 620 repere V10, 16 platforme, 42 exemplare fizice, trei CL independente, opțiunile Asylum 2×1,0 vs 2×0,8 NECONFIRMAT, preferințele GTR/415 NiFe30/7 = NiFe52/6, toate regulile din Sensory DNA și Market/Duel. Nu se rescrie motorul, inventarul sau localStorage.

**Fișiere noi/modificate:** `rta-lab/atlas-preview/decision-explorer.js` și `.css`; includerea în `atlas-preview/index.html`, release deterministic `rta-lab/atlas/` și cache-urile proprii; regresii `tools/check-rta-decision-flows.js` și `tools/check-rta-decision-flows-visual.js`, incluse în Quality/Visual, împreună cu actualizarea contractului de număr de scripturi și poziționarea căutării sub filtrul nou. Workflow-ul TEMP de generare a fost eliminat înainte de merge; screenshoturile și ultimele rezultate CI sunt criterii de acceptare, nu simple promisiuni.

**Status și următorul pas:** Funcționalitatea este integrată și publicată prin GitHub Pages; toate cele trei verificări pe versiunea candidată exactă și post-merge RTA/Pages au trecut. Workflow-ul temporar de generare a fost **eliminat înainte de merge**; release-ul și cache-ul au fost generate și validate determinist. **SINCRONIZAREA BIBLIOTECII URMEAZĂ ACESTUI COMMIT DE DOCUMENTARE:** ia ZIP-ul din ultimul workflow «RTA Lab Continuity Archive» pe main, verifică fiecare checksum din manifest și actualizează copia persistentă `/RTA_Lab/RTA_CONTINUITATE_CURENTA.zip`, confirmând efectiv rezultatul. Nu pretinde existența unei versiuni noi în Bibliotecă până la confirmare. Rămân doar verificările fizice ale pinului Asylum și, după caz, observațiile utilizatorului pe telefonul propriu. Nu relua codul deja validat.

## CARD DE CONTINUITATE RTA LAB — HOME, 16.10.2026 (PUBLICAT ȘI VERIFICAT)

La cererea utilizatorului, HOME din `/rta-lab/atlas/` include secțiunea editorială **„Trei comenzi. Nimic pierdut.”** cu trei acțiuni vizibile și exacte:
- **„Du-te în Lab și fă-ți update”** — citește handoff → MASTER → blueprint → protocol, verifică main, CI și ce mai este deschis; nu reface ce e terminat corect.
- **„Salvează”** — persistă atât codul / datele / regulile / QA, cât și documentele canonice și pachetul ZIP portabil din Biblioteca ChatGPT; eșecurile sunt raportate explicit.
- **„Dă-mi arhiva de continuitate la zi”** — pregătește pachetul ZIP complet de reluare într-un chat nou.

Cardul este în `rta-lab/atlas-preview/index.html` + `lab-commands.css` și `lab-commands.js`; release-ul din `rta-lab/atlas/` este generat deterministic din preview. **Butoanele doar copiază comenzile în clipboard** (cu fallback/mesaj vizibil), *nu* execută modificări direct în site. Linkul de sub card deschide `rta-lab/RTA_OPERATING_PROTOCOL.md`, sursa autoritativă. Stil dark editorial, trei coloane pe desktop, un panou per rând pe mobil, stare ARIA live, focus vizibil, mărire font și reduced-motion.

Regresie nouă `tools/check-rta-lab-commands.js` verifică frazele, sursa canonică și funcția de copiere fără efecte ascunse; `tools/check-rta-atlas-layout-visual.js` verifică la toate rezoluțiile, copierea reală și capturi. Workflow-ul permanent `.github/workflows/rta-lab-continuity-snapshot.yml` creează automat un ZIP portabil cu documentele integrale, extrasele esențiale de cod și checksumuri când se schimbă documentele canonice pe `main`; arhiva GitHub Actions nu înlocuiește copia persistentă din **Biblioteca ChatGPT `/RTA_Lab/`**. Confirmă uploadul în Bibliotecă înainte de a promite că există.

**PUBLICARE ȘI VERIFICĂRI CONFIRMATE:** PR [#56](https://github.com/andreiclim77-cell/rta/pull/56) integrat în `main` cu commitul funcțional `bb64e587bdf9887c1de481cde8c74f79747262cd`. Candidat exact `5d0cfec8a852654b6538955f9f09e73d7e2c8f6e`: [RTA Quality Gate #38919382320](https://github.com/andreiclim77-cell/rta/actions/runs/38919382320) SUCCESS, [Market #38919382085](https://github.com/andreiclim77-cell/rta/actions/runs/38919382085) SUCCESS și [Visual Mobile #38919382083](https://github.com/andreiclim77-cell/rta/actions/runs/38919382083) SUCCESS; capturile cardului 390×844 și 1440×1000 au fost descărcate și inspectate efectiv, ZIP-ul QA cu 250 fișiere a trecut CRC. Post-merge pe exact `bb64e587`: [RTA #38920829808](https://github.com/andreiclim77-cell/rta/actions/runs/38920829808) SUCCESS, [GitHub Pages #38920829850](https://github.com/andreiclim77-cell/rta/actions/runs/38920829850) SUCCESS și [RTA Lab Continuity Archive #38920829616](https://github.com/andreiclim77-cell/rta/actions/runs/38920829616) SUCCESS. Arhiva ZIP cu MANIFEST SHA256 a fost verificată (26 fișiere, CRC PASS) și încărcată efectiv în **Biblioteca ChatGPT → `/RTA_Lab/RTA_CONTINUITATE_CURENTA.zip`**, iar existența fișierului a fost confirmată în lista Bibliotecii. Fiecare nou commit pe documentele canonice regenerează snapshotul Actions; **după o astfel de regenerare, înlocuiește copia Bibliotecii cu arhiva nouă**, verificând SHA-ul din manifest. Cardul public: [RTA Atlas HOME](https://ghid-rta.ro/rta-lab/atlas/). Fără schimbarea motorului, inventarului, catalogului sau preferințelor atomizoarelor.

## PROTOCOL PERMANENT — comenzile „du-te în Lab și fă-ți update” / „salvează” (16.10.2026)

**Instrucțiune explicită a utilizatorului, valabilă între conversații.** La **„du-te în Lab și fă-ți update”**, accesează repo-ul `andreiclim77-cell/rta` / `main` actual și citește `RTA_CURRENT_HANDOFF.md` → `RTA_CONTINUITY_MASTER.md` → `RTA_ATLAS_DESIGN_BLUEPRINT.md` → `RTA_OPERATING_PROTOCOL.md`; verifică gates, publicarea și modificările de cod înainte de a continua, fără refacerea lucrurilor corecte. La **„salvează”**, actualizează **ambele**: (A) aplicația / regulile și testele relevante din GitHub cu validare și (B) arhiva canonică HANDOFF/MASTER/BLUEPRINT + pachetul portabil `RTA_CONTINUITATE_CURENTA.zip` din Biblioteca ChatGPT `/RTA_Lab/`. Dacă un test eșuează sau Biblioteca nu e accesibilă, păstrează exact starea și spune explicit ce NU s-a salvat; nu declara finalizare fictivă. La **„dă-mi arhiva de continuitate la zi”**, oferă snapshot suficient și complet pentru un chat nou, fără duplicări inutile. **Detaliile și regulile integrale sunt în `rta-lab/RTA_OPERATING_PROTOCOL.md`.** Acest protocol are prioritate față de triggerul istoric „salvează” din §9 și față de versiunile mai vechi.

## STATUS CURENT PRIORITAR — Asylum + builduri complete în Atlas (16.10.2026)

**PUBLICAT ȘI VERIFICAT.** PR [#55](https://github.com/andreiclim77-cell/rta/pull/55) a fost integrat în `main` prin commitul `9df6c938fea28ca19c29f86c4b35893fd5ee8012`. Teste pe ultimul candidat `e5ffae52785bb9ce263fc59dd9218e81b9dabeaa`: [RTA Quality Gate #38887941770](https://github.com/andreiclim77-cell/rta/actions/runs/38887941770) **SUCCESS**, [Market Quality Gate #38887941745](https://github.com/andreiclim77-cell/rta/actions/runs/38887941745) **SUCCESS**, [Atlas Visual Mobile Gate #38887941591](https://github.com/andreiclim77-cell/rta/actions/runs/38887941591) **SUCCESS**. Verificări **post-merge pe exact `9df6c938`**: [RTA Quality Gate #38888774083](https://github.com/andreiclim77-cell/rta/actions/runs/38888774083) **SUCCESS** și [GitHub Pages #38888773602](https://github.com/andreiclim77-cell/rta/actions/runs/38888773602) **SUCCESS**. Ruta publică: https://ghid-rta.ro/rta-lab/atlas/ .

**Funcționalitatea validată:** pentru toate cele **16 platforme**, la selectarea unui atomizor în Atomizer Atlas apar **trei builduri complete, cu materiale distincte**, chiar fără lichid ales: schemă coil, sârmă, spire, Ø coil, insert/airflow, clopot, WATT sau TC setare + plafon, poziție. Un clic transferă **aceeași configurație integrală** în Wire Lab. Personal first pe GTR: NiFe30/7 = NiFe52/6; pe 415 Cool: NiFe30/7 = NiFe52/6, apoi K1 28/6; KLP/K Prime/KX rămân cu NiFe/6; restul conform preferințelor personale anterioare. Clasările algoritmice netestate poartă eticheta **propunere tehnică**, nu probă personală. Se păstrează Liquid Match 3×3, Market 40 fișe și Duel, plus cele **700 produse Atlas**, cele **620 repere V10**, **42 exemplare fizice** și **trei Dvarw CL saved/draft independente**.

**Asylum V3:** se poate selecta `dual10` = air-pin **2×1,0 mm** documentat în kit, `dual08` = pin posibil **2×0,8 mm — NECONFIRMAT**, disponibil **doar ca simulare orientativă**, și `stock` = pin efectiv necunoscut. Dimensiunea pinului **montat fizic de utilizator** rămâne de verificat; AFC 0,8 mm nu este același lucru cu pinul 2×0,8. Niciunul dintre cele două Asylum fizice nu primește automat un montaj salvat. Preferința personală **Flat + K1 28 GA/6** rămâne ancorată exclusiv la clopotul Flat; selectarea Dome este separată și nu primește eticheta unei comparații personale Flat. Setări de temperatură/W pe 415 ori Asylum nu sunt inventate.

**Canonice:** `rta-lab/data/sensory-core.js`, `rta-lab/data/atoms-2.js`, `rta-lab/atlas-preview/modules.js`, `rta-lab/atlas-preview/modules.css`; release determinist `rta-lab/atlas/` și cache-uri izolate. Testele: `tools/check-rta-atlas-modules.js`, `tools/check-rta-atlas-modules-visual.js`, plus celelalte gate-uri Atlas/V10. Workflow-urile temporare de generare au fost **eliminate** înainte de integrare. Notificările „run failed” anterioare se referă la commituri din istoricul PR, nu la ultima versiune aprobată; nu reexecuta modificările deja integrate. **Incertitudine deschisă:** identificarea vizuală a pinului Asylum realmente montat și confirmarea ergonomiei pe telefonul utilizatorului, dacă acesta raportează alte probleme. Acest status înlocuiește orice formulare anterioară „în verificare” din document.

## Asylum V3 + Atomizer Atlas: builduri complete și pornire fără flash — 16.10.2026 (PUBLICAT)

**Precizare de certitudine:** utilizatorul a menționat cu incertitudine un insert Asylum **2×0,8 mm**. Fișele comerciale ale Asylum V3 documentează pinul inclus **2×1,0 mm**; inelul AFC are și poziția **0,8 mm**. Nu există încă o confirmare a pinului montat efectiv. Nu transforma opțiunea standard documentată în constatare despre atomizorul personal. `data/sensory-core.js` oferă **trei opțiuni distincte în selector**: `dual10` = **2×1,0 mm** (pin documentat în kit, fără confirmare că este montat), `dual08` = **2×0,8 mm — posibil, NECONFIRMAT**, simulare opțională a variantei amintite de utilizator, fără dovadă că este pin de producător sau că este montat, și `stock` = alt pin cu dimensiune încă necunoscută. Presetul tehnic inițial este `dual10`, **nu o fișă personală salvată**. Alegerea `dual08` nu rescrie dosarul celor două Asylum fizice, iar 0,8 mm al inelului AFC este alt reglaj. Preferința istorică Asylum **clopot Flat + K1 28 GA/6** rămâne, fără a declara retrospectiv că vechiul A/B a controlat și pinul. Nu atribui cele două exemplare Asylum aceleiași montări fără dovadă.

**Cerința explicita „butonul ATLAS”:** când utilizatorul alege unul dintre cele **16 atomizoare**, afișează imediat **trei builduri complete și diferite material**, nu doar trei nume de sârme. Fiecare card are fotografie/schemă coil, material dintre cele deținute (K1 28, K1 29, K1 Clapton 2×30+38, SS316L Clapton 2×30+38, NiFe30 Dicodes TCR320, NiFe52 Zivipf TCR310), spire, Ø coil, insert/airflow, clopot, poziție și WATT sau temperatura TC ca SETARE/plafon W. Datele tehnice sunt vizibile **chiar înainte de alegerea unui lichid**. Ulterior se adaugă potrivirea senzorială contextuală; lipsa lichidului nu mai ascunde construcția. Fiecare card poate deschide **identic** buildul în Wire Lab. `atlasAir` permite schimbarea air-pinului în Atlas. Este separat de ruta Liquid Match, unde se păstrează 3×3 recomandări după lichid.

**Prioritizare:** pe platformele unde utilizatorul a stabilit alegeri, acestea sunt primele și în ordinea sa — 415 NiFe30/7 = NiFe52/6 apoi K1 28/6; GTR NiFe30/7 = NiFe52/6 apoi K1 28/5; KLP, Prime, KX două NiFe/6 apoi K1-ul specific; GT One K1 29/6 apoi K1 28/5; Dvarw CL/FL, Asylum Flat/28/6, Muted+, KV3 păstrează referințele confirmate. Unde sunt sub trei observații personale, motorul completează cu variante compatibile de top din **sârmele utilizatorului** și specificul airflow-ului, etichetate **„propunere tehnică”**, NU experiență validată. Nu transforma o etichetă personală generică în A/B exact cu toate inserturile/lichidele. Pentru Asylum, preferința Flat + K1 28/6 nu validează automat nici `dual10`, nici posibilul `dual08`: în card se indică distinct că pinul rămâne neconfirmat. NiFe30 și NiFe52 sunt două materiale, nu o singură sârmă.

**Deschiderea aplicației:** la un vechi shortcut `/rta-lab/`, o redirecționare din scriptul `home-ui.js` executat la finalul paginii V10 permitea desenarea vechii interfețe circa o secundă. Guard-ul nou din `index.html` (V10) face prepaint hide + `location.replace` direct spre `/rta-lab/atlas/`, cu splash discret, păstrând `?view=v10` și ancorele V10, precum și accesul offline V10 dacă nu există cache Atlas. Manifestul PWA continuă să pornească direct din Atlas. Nu șterge storage și fișele CL.

**Testare obligatorie:** QA motor pentru toate 16 platforme, fiecare 3 materiale distincte, cinci câmpuri tehnice complete, personal înaintea modelului; Asylum dual10 ≠ AFC 0,8, Asylum SS Clapton interzis; browser mobil 360/390 și desktop, test efectiv al selectorului și transferului Atlas → Wire, fără horizontal overflow; Liquid Match/Market/Duel/offline/recover/instalare V10 620 / Atlas comercial 700 și fișele fizice 42/3CL intacte. QA de pornire testează scriptul din `head`. Datele și 700 produse NU sunt alterate. Implementare candidată: `feature/atlas-asylum-air-and-complete-build-cards-20261016`; **NU declara publicată înainte de RTA, Market, Visual, release/cache check, merge și Pages SUCCESS**.

## 415 RTA MTL Cool — prioritate personală actuală (15.10.2026)

**Noua observație directă:** pe **415 RTA MTL Cool**, prima alegere personală este la egalitate între **Dicodes RESISTHERM NiFe30 TCR320 / 7 spire** și **Zivipf NiFe52 TCR310 / 6 spire**. **Următoarea preferință: Kanthal K1 28 GA / 6 spire.** Utilizatorul confirmă că toate funcționează bine; nu pretinde un câștig senzorial măsurat sau o egalitate chimică între aliaje.

**Corecție față de arhiva istorică:** interdicția „415 K1 28/6 este depășit” și ordinea „415 K1 Clapton primul în Explorer” au fost depășite de această observație nouă. **K1 28/5 contact**, **K1 Clapton/5** (în continuare pereche Clapton specialistă), K1 29/5 contact, K1 29/6 contact și vechiul NiFe30/6 **nu se șterg**. Nu se reactivează K1 29/5 distanțat. Cele cinci familii de sârme V10 nu se extind.

**Limite de probă:** lichidul, poziția, bumbacul, deschiderea airflow, wattajul și temperatura TC exacte ale acestor trei montări pe 415 nu au fost comunicate în noul test. Ø2,5 mm rămâne doar *presetul Lab*. Configurația GTR NiFe30/7 la 230°C/limită 16 W **NU** se transferă drept observație pe 415. Preferința se înregistrează separat de scorurile tehnico-senzoriale și nu reprezintă A/B controlat. Pentru TC se păstrează calibrarea la rece și TCR distinct.

**Integrare izolată:** pe platforma `415` Sensory DNA permite NiFe30/7 și /6, NiFe52/6, K1 28/6 și /5; preferințe prima categorie NiFe30/7 și NiFe52/6, a doua K1 28/6. Legacy V10 arată slotul NiFe TC cu detalierea celor două aliaje; `clapton-platform-map.js`, încărcat ultimul, nu mai trebuie să readucă în față Clapton/5. Celelalte platforme (GTR NiFe30/7, KLP/KX/Prime NiFe30/6 etc.), inventarul de 16 platforme/42 exemplare, cele trei fișe CL și cataloagele **V10 620 / Atlas 700** rămân păstrate.

**PRODUCȚIE VERIFICATĂ (15.10.2026):** PR [#54](https://github.com/andreiclim77-cell/rta/pull/54) integrat în `main`, commit funcțional `acfc2a81b4c4e3b5a8f3935b76c4b87de79441a3`. Candidat exact `39b0cafce4acc30ef3b4c34fe362b80486650c9f`: [RTA #38785057843](https://github.com/andreiclim77-cell/rta/actions/runs/38785057843) **SUCCESS**, [Market #38785057842](https://github.com/andreiclim77-cell/rta/actions/runs/38785057842) **SUCCESS**, [Visual Mobile #38785057982](https://github.com/andreiclim77-cell/rta/actions/runs/38785057982) **SUCCESS** (246 PNG + audit JSON, ZIP CRC PASS și capturi selectate inspectate). Post-merge exact `acfc2a81`: [RTA #38786539381](https://github.com/andreiclim77-cell/rta/actions/runs/38786539381) **SUCCESS**, [GitHub Pages #38786539382](https://github.com/andreiclim77-cell/rta/actions/runs/38786539382) **SUCCESS**. Fișierele release/cache Atlas generate au fost integrate. Versiunile accesibile: `https://ghid-rta.ro/rta-lab/atlas/` și `https://ghid-rta.ro/rta-lab/`; publicarea este confirmată prin GitHub Pages, însă accesul HTTP direct din acest mediu nu a fost posibil din cauza rezolvării DNS. Versiunea V10 620, Atlas 700, 16/42 și cele 3 CL rămân păstrate. Nu atribui aceste teste viitoarelor commituri de documentație.

## Actualizare GTR / TC — 15.10.2026 (INTEGRATĂ / PUBLICATĂ)

**Preferință nouă, limitată STRICT la Taifun GTR:** **Dicodes RESISTHERM NiFe30 TCR320 / 7 spire** și **Zivipf NiFe52 TCR310 / 6 spire** sunt cele două opțiuni TC preferate personal, fără ierarhie de plăcere între aliaje. **NiFe30/6 funcționează** și rămâne selectabil ca alternativă; nu îl marca defect sau interzis. Ø2,5 mm este presetul geometric al Lab-ului, nu o nouă măsurătoare a coilului utilizat.

Utilizatorul raportează pentru noul NiFe30/7 pe GTR: **230°C**, plafon **16 W**, aproximativ **12 W** indicați la sfârșitul inhalării și comportament TC perceput din nou normal pe mai multe Dicodes. Cu montajul anterior NiFe30/6 pe Dani 21700, la 230°C puterea afișată la final era circa 6 W și vape-ul era perceput prea rece, deși 6 spire funcționează. Pentru Zivipf NiFe52/6, a confirmat experiență excelentă la TCR310; reglajele și rezistențele memorate nu se transferă între dispozitive sau aliaje. **Nu este A/B cu o singură variabilă**: refacerea coilului, bumbacul, fixarea și calibrarea pot contribui. Nu deriva procente de aromă sau temperatură reală din wații afișați.

**Restul rămâne neschimbat:** KLP / K Prime / Kayfun X păstrează NiFe30/6 și NiFe52/6 conform validărilor; cele 16 platforme, 42 exemplare, cinci sloturi de sârme și fișele CL rămân protejate. **V10 are catalogul original de 620**; **Atlas comercial are 700 produse verificate** după PR #51/#52. **SALVAT ÎN PRODUCȚIE:** PR #53 integrat în `main` prin commitul `0cfe2f47e39c865957bf6993f2e500c7a889ac03`. Gate candidat exact `a24f17e19aaf10c0332440c4198ffedc38298ab2`: [RTA #38778533224](https://github.com/andreiclim77-cell/rta/actions/runs/38778533224) SUCCESS, [Market #38778533312](https://github.com/andreiclim77-cell/rta/actions/runs/38778533312) SUCCESS, [Visual #38778533158](https://github.com/andreiclim77-cell/rta/actions/runs/38778533158) SUCCESS. Post-merge pe `0cfe2f47`: [RTA #38779771810](https://github.com/andreiclim77-cell/rta/actions/runs/38779771810) SUCCESS și [GitHub Pages #38779771468](https://github.com/andreiclim77-cell/rta/actions/runs/38779771468) SUCCESS. Actualizarea este publicată la `https://ghid-rta.ro/rta-lab/atlas/` și în motorul V10, fără schimbarea catalogului. Aceste confirmări privesc commiturile menționate; commiturile ulterioare de documentație necesită propriile verificări.

## Producție verificată — revizia întregii biblioteci, 15.10.2026

**Checkpoint curent, prioritar față de istoricul de mai jos.** PR #51 MERGED; candidat verificat `a9074c91d9b1476d6c2edf56c0e623c5893219d2`, integrare `2bf23ed4b2c12a58fbbbe01e0ac1b88843d59cf8`. Public: https://ghid-rta.ro/rta-lab/atlas/?v=catalog-700-20261015 . Cerința este revizia integrală, nu doar adăugarea celor două exemple Centenary. Catalogul Atlas are acum 700 de produse / 61 de mărci, cu surse și ediții explicite. Fișier editabil: `catalog/liquids-20261015.json`; SHA256 `d4b29f707c0a964ab3c94188bb11be283eae107dcdd23d29a9e842392fee3a11`; cache preview `690635981392b410`, release `dc1f06b8c21ebed1`; câte 67 resurse / 63 fișiere release.

Toate cele 620 de rânduri inițiale au o decizie în `catalog/LEGACY_RECONCILIATION_20261015.json`: 500 de rânduri confirmate devin 469 identități distincte (31 dubluri/aliasuri comasate); se adaugă 231 identități documentate. Se scot din catalogul comercial 100 Profil reper și benchmarkul personal. Alte 8 rânduri au profil în afara scopului, unul are surse contradictorii și 10 nu au identitatea/ediția confirmată suficient; acestea nu sunt declarate false și rămân recuperabile în datele originale V10. Nu se inventează aliasuri către altă rețetă.

Clase: 210 NET simplu, 253 NET complex, 107 Tutun simplu, 130 Tutun complex. Proveniență: 384 descrieri oficiale, 287 de comerciant atribuit și 29 ediții/observații din review-uri istorice. 505 produse cu profil suficient intră în topurile automate; celelalte 195 rămân căutabile și selectabile cu limita afișată. Niciun număr lipsă de review-uri nu este publicat ca zero, iar ordinea unui magazin nu este prezentată ca popularitate globală.

Reținerea verificată acoperă inclusiv Blendfeel SOLO/Private Reserve, Azhad Semplici/Hyperion/Pure/Signature, La Tabaccheria clasic/Macerati/Elite, Pod Salt Origin, Flavorah, FlavourArt, The Flavor Apprentice, Flavor West, Inawera, House of Liquid, Charlie Noble și alte mărci vechi. Pro Vape / Cronos și Black Note / Concerto au marca corectată fără duplicarea produsului. Formulele distincte (de exemplu RY4 Double CC și Manabush Powwow Extended) nu sunt comasate ca simple ambalaje. Van&Illa nu primește Cavendish pe care producătorul îl exclude; Booms Origin nu primește eticheta dulce dintr-o negație; Liquor Tobacco păstrează absintul/lemnul dulce.

Teste locale ale datelor: 700 identități și căutări, toate cele 500 aliasuri/rânduri vechi păstrate, 756 topuri configurație permisă/obiectiv, 140 contexte, stress pe 700; PASS. Motorul original trece separat cu 620, 16 platforme, 126 variante permise; KLP NiFe30/NiFe52 TC și CL saved/draft sunt păstrate. Diferența față de baza protejată pentru `data/`, `engine.js`, `mood-match.js`, `index.html` este goală.

CI pe candidatul exact a9074c91: RTA [38746803087](https://github.com/andreiclim77-cell/rta/actions/runs/38746803087), Market [38746802599](https://github.com/andreiclim77-cell/rta/actions/runs/38746802599), Visual [38746803089](https://github.com/andreiclim77-cell/rta/actions/runs/38746803089) — SUCCESS. Artifact 11979252385: 246 PNG, CRC PASS, SHA256 `5571f2e21944ab206deba3204da33f7f5f46b050baa987ca9ccd5c2a88d48cc4`. Inspecție efectivă: 24 planșe cu 140 capturi catalog/căutare/încadrare și originale mobile/desktop; nu se afirmă inspecția individuală a tuturor celor 246. Offline și migrarea din vechiul cache V10/Atlas cu cache HTTP de o oră sunt PASS în CI.

Pages [38748354904](https://github.com/andreiclim77-cell/rta/actions/runs/38748354904) și RTA post-merge [38748355317](https://github.com/andreiclim77-cell/rta/actions/runs/38748355317) — SUCCESS. Direct pe domeniu: 76 fișiere release/protejate și 75 fișiere preview HTTP 200 cu hash egal sursei; catalog și mărci păstrate la 360×800, 390×844, 1440×1000; zece cazuri încadrare cu font minim real 18/24 px; 15 capturi catalog + 110 încadrare + 4 offline. Capturile matricei au fost inspectate. Șase module offline, un 503 real injectat în workerul profilului QA cu restaurare din cache, preview/ghid/refresh V10 și CL saved/draft identice — PASS. Prima încercare live a epuizat discul local și s-a oprit; după arhivarea fără pierderi a dovezilor locale, rulările complete au trecut. Nu s-a mascat eroarea prin modificarea aplicației.

Receipt durabil: `catalog/PUBLICATION_RECEIPT_20261015.json`; raport: `CATALOG_REVIEW_700_20261015.md`; reconciliere pe fiecare rând: `catalog/LEGACY_RECONCILIATION_20261015.json`. Limita probelor vizuale este Chromium la configurațiile declarate, fără afirmație de test pe telefon fizic/Safari.

Motorul, datele originale V10, inventarul 16 platforme / 42 exemplare, preferințele și configurațiile personale nu sunt modificate. Hall of Fame păstrează cele 40 de recenzii atribuite; descrierile comerciale și noile fișe nu inventează consens ori rezultate personale. Direcția vizuală și publicarea au aprobarea expresă anterioară; publicarea s-a făcut după verificările candidatului exact, fără o nouă cerere pentru această revizie de date. Selecția de 700 este editorială documentată, nu un clasament global demonstrat al căutărilor/vânzărilor.

## Producție verificată înaintea reviziei bibliotecii — încadrare, 15.10.2026

**Acest checkpoint prevalează asupra etapelor istorice de mai jos.** Corecția reclamată în captura telefonului este publicată la https://ghid-rta.ro/rta-lab/atlas/?v=fit-20261015 . PR #49 și #50 sunt MERGED. Candidat final 319a777da0874ae4b1613c60e91cbab0ae2b0fe3; integrare 78385907e6ce37b3ba49aed5e16dce4401e65275; Pages 38725622934 și RTA post-merge 38725623138 — SUCCESS. Aprobarea expresă de publicare primită anterior a fost aplicată.

Etichetele A/B/C sunt deasupra barelor, cu înălțime naturală; antetul și Înapoi încap, navigarea inferioară trece pe două rânduri numai când textul o cere și își rezervă înălțimea reală. Selectoarele arată integral valorile lungi; pașii, panourile, fotografiile cu sursă, DNA, Market și Duel se rearanjează la text mărit. HOME păstrează numele/sursa fotografiei și controlul pauză; eticheta foto decorativă este ascunsă la text mare pe mobil pentru a elimina suprapunerea observată după #49. Asset layout: atlas-fit-20261015-2; 82 resurse cache, 62 fișiere release. Mărirea textului din browser rămâne activă.

CI pe candidatul exact: RTA 38724599791, Market 38724599619, Visual 38724599749 — SUCCESS. Artifact 11967761374: 231 PNG descărcate și inspectate, CRC PASS, SHA256 f629fbe8738772d21b61102501d61546a195937d0f39b1da943217abf20cdd94. Matricea nouă are zece combinații ecran/font: 320/360/390/768/1440, font minim real 18/24 px, landscape 844×390. Parcurge șase module, grafice, selecții, Înapoi și limitele reale ale textului/taburilor. Noul test detectează suprapunerea foto pe versiunea #49. Capturile vechi în timpul derulării sau capturile de element lung cu antet inclus nu sunt probe ale marginilor viewportului; pentru încadrare sunt folosite matricea nouă și capturile live stabilizate.

Pe domeniu: zece cazuri — PASS; 110 capturi matrice + 3 controale + 9 foto fallback + 4 offline = 126 PNG inspectate. Toate cele trei fotografii HOME au fost verificate cu vendor blocat la font18-360/font24-320/font24-390 și creditul copiei locale. 91 fișiere HTTP 200 identice prin hash cu sursa verificată. Offline: șase module, 16 hashuri foto, saved/draft CL identice, revenire după workers existenți și refresh V10 — PASS; exact un 503 injectat în profilul QA, catalogul 620 restaurat și fetch repus. Browserul interactiv confirmă assetul final și fluxul explicit lichid → rezultate → Atlas → Înapoi.

Direcția B60/A30/C10 și toate fluxurile #48 rămân. Motorul, rta-lab/data/**, mood-match.js și index.html V10 sunt identice cu c268b2fc; 620 lichide, 16 platforme, 42 exemplare, configurațiile validate, datele personale și cele trei CL saved/draft sunt păstrate. KLP + Dicodes NiFe30 și KLP + Zivipf NiFe52 TC rămân preferințe personale distincte de prim nivel. Nicio recenzie, valoare senzorială ori procent nu este inventat.

Domeniul probelor: Chromium la configurațiile declarate, fără afirmație de test pe telefon fizic/Safari sau accesibilitate universală. Captura originală a utilizatorului a fost doar citită, nu publicată. Raport: ATLAS_RESPONSIVE_FIT_VERIFICATION_20261015.md. Ultimul commit de continuitate modifică numai cele trei documente canonice și raportul; SHA și runs finale sunt în FIT_FINAL_PUBLICATION.json din pachetul local de dovezi. Incidentul separat Hype Radar 43/48 surse rămâne istoric deschis.

## Istoric — candidat HOME #50 înainte de publicare

PR #49 este integrat la 70fcf0ce6233f78900bfe5cb06518cfbcc84e163; Pages 38723431508 și RTA 38723431716 sunt SUCCESS. Matricea live de zece ecrane/fonturi, 91 hashuri HTTP, selecțiile complete și offline au trecut. La inspecția manuală a fost observată suplimentar o suprapunere HOME la font minim 24 px pe 320×740: eticheta decorativă foto ajunge peste numele produsului. Un test nou reproduce exact suprapunerea pe versiunea publică; corecția ascunde acea etichetă decorativă numai la text mare, păstrând fotografia, numele, sursa și controlul pauză, dimensionat pentru text mare. Această ultimă ajustare urmează verificarea CI și publicarea separată; nu este încă declarată publicată. Motorul/datele/configurațiile rămân identice.

## Istoric — candidat pentru corecția #49, înainte de integrare

Utilizatorul a trimis o captură reală cu etichetele graficului rupte și tăiate. Cauza este reprodusă în Chromium cu dimensiune minimă de font 18 px: textul depășește înălțimea fixă de 16 px, marca/Înapoi și cele șase taburi se aglomerează. Preferința de font este reală în profilul QA izolat; setarea experimentală OSTextScale nu a schimbat textul și nu este folosită ca probă de mărire.

Corecția din feature/atlas-responsive-fit-20261015 (baza 94a611a974becd39002b61af07a7927fb67165e2) separă etichetele de bare, permite înălțimi naturale, adaptează antetul/navigarea la text mărit și rezervă în pagină înălțimea reală a barelor fixe. Selecțiile lungi primesc denumirea integrală sub câmp; panourile, fotografiile cu credite, pașii, DNA și comparația Duel se rearanjează. Fluxurile și datele nu sunt schimbate.

Local: probele pure 620/16/42, cele 140 contexte × nouă builduri, căutările/topurile, mobile/motion, module și filtre/Back — PASS. Matricea de încadrare verifică zece combinații ecran/font (320/360/390/768/1440, font minim 18/24 px și landscape 844×390), cu limite geometrice ale textului/taburilor și valoarea completă a selecțiilor. O etichetă prea lată în landscape cu font mărit a fost detectată, corectată și retestată. CI exact și publicarea rămân de confirmat; această corecție nu este încă declarată publicată. Checkpointul #48 de mai jos descrie versiunea publică anterioară.

Motorul, rta-lab/data/**, mood-match.js și index.html V10 rămân identice; preferințele KLP, catalogul 620/16/42 și saved/draft CL sunt protejate. Nu sunt cerute alte aprobări pentru această corecție de încadrare în direcția deja aprobată.

## Istoric — publicare fluxuri ghidate #48, înlocuită de #49/#50

Checkpoint istoric al publicării #48, înlocuit de starea curentă de la începutul documentului. PR #48 este MERGED. Candidat exact: 45842b6133aaa204f3d7ae6489a2d32a4d41283f; integrare publicată: 9abb360f1fd23827606a76643901f81d9046c8c6. Actualizările independente main, inclusiv f5cf821f8190971abd8bcfcbc2c286059be5f482, sunt păstrate. Aprobarea expresă de publicare primită anterior a fost aplicată.

Aplicația curentă: https://ghid-rta.ro/rta-lab/atlas/?v=guided-20261015 . HOME și toate cele cinci instrumente sunt funcționale. Liquid Match: alegere explicită din 620 → trei atomizoare × trei builduri, fotografii, avantaje/compromisuri, comparații. Atlas: atomizor → identitate reală → trei materiale distincte, fiecare cu cinci lichide calculate și comparație în context comun. Wire: alegi materialul → toate și numai platformele compatibile (16; SS Clapton 15, fără Asylum) → alegi platforma și explorezi experiența, topul și comparațiile. Market păstrează cele 40 fișe și sursele. Duel păstrează lichidul/obiectivul comun și primește configurația Wire exactă, inclusiv reglajele curente.

Înapoi există în toate instrumentele, păstrează lichidul, configurațiile și pozițiile; starea/momentul se modifică pe loc. Toate cele patru selectoare de lichid au biblioteca completă și filtre dependente. Nu există rezultate pe un lichid implicit înaintea alegerii. Șapte dimensiuni în grafice provin din motor, cu legende A/B/C și etichete calitative; nu sunt procente ale plăcerii ori măsurători. Direcția aprobată B60/A30/C10 și fotografiile autentice cu proveniență sunt păstrate.

Atlas nu mai afișează trimiteri către interfața veche. Lansarea /rta-lab/?v=10 deschide Atlas online și, după instalarea cache-ului nou, offline. V10 rămâne recuperabil numai explicit și nu este rescris. Pornirea ascunde structura provizorie până sunt gata toate modulele/catalogul; o lipsă reală arată eroare cu reîncărcare. Recuperarea automată este limitată la o singură reîncărcare pe tab la preluarea workerului nou; nu șterge date personale. Asset version: atlas-guided-20261015-4.

CI exact: RTA 38713343229, Market 38713343205, Visual 38713343215 — SUCCESS. Artifact 11962710355: 121 PNG descărcate și inspectate integral, CRC PASS, SHA256 dcb729a0c03e9200840ff8a0c8f221fab83b8d6fbed49bc23b5b7a8a453954e4. Pages 38714168574 și RTA post-merge 38714170065 — SUCCESS. Direct pe domeniu: fluxuri la 360×800/390×844/1440×1000, toate patru selectoarele, matrice completă compatibilitate, topuri exacte, Back și păstrare CL/configurații, recuperare încărcare incompletă, lipsă modul — PASS; 49 PNG live plus 4 offline, inspectate. Integritate: 89 fișiere HTTP 200 identice, 80 resurse cache. Offline: șase module, 16 hashuri foto, exact un 503 injectat/restaurat, revenire după preview/ghid/refresh V10 — PASS. Migrarea CI pornește din vechiul 8cb1b18 cu workers încălziți și cache HTTP de o oră; și vechea scurtătură offline revine în Atlas.

Motorul, rta-lab/data/**, mood-match.js și index.html V10 sunt identice cu c268b2fc; 620 lichide, 16 platforme, 42 exemplare, configurațiile validate și cele trei CL saved/draft sunt conservate. KLP + Dicodes NiFe30 și KLP + Zivipf NiFe52 TC sunt ambele preferințe personale de prim nivel; presetul Dicodes 220°C/16 W nu este transferat Zivipf. Verificare în Chromium la dimensiunile declarate, fără afirmație de testare pe telefon fizic/Safari. Incidentul separat Hype Radar 43/48 surse rămâne istoric deschis, nu este prezentat drept rezolvat de aceste gates. Detalii și limite: ATLAS_GUIDED_FLOWS_VERIFICATION_20261015.md.

## Istoric — candidat fluxuri ghidate, înainte de publicarea #48

Ultima cerință explicită fixează traseele: Liquid Match pornește de la lichid și oferă trei atomizoare × trei builduri, efecte și diferențe grafice; Atlas pornește de la atomizor, îi explică identitatea și propune trei sârme distincte, fiecare cu cinci lichide calculate și comparații; Wire Lab pornește de la sârmă, arată toate atomizoarele compatibile și apoi experiența detaliată după alegerea unuia. Market păstrează sursele, iar Duel compară două configurații în același lichid/obiectiv. Toate instrumentele au Înapoi, păstrează alegerile și permit modificarea contextului pe loc. Atlas nu mai oferă trimiteri vizibile către interfața veche.

Candidat local: feature/atlas-guided-instruments-20261015, baza db917772f6b42e69d8a0c630acb6c4727ef910b0. Încă în verificare, nepublicat. Probele checkpointului anterior sunt istorice și nu dovedesc aceste trasee noi. Motorul, catalogul 620/16/42 și bytes saved/draft CL rămân protejate. Graficele folosesc semnalele existente ale motorului, fără procente de plăcere; fotografiile autentice existente sunt refolosite cu proveniență.

## Istoric — publicare filtre conectate #47, înlocuită de #48

**Stare curentă, prioritară față de toate checkpointurile istorice de mai jos:** cele cinci observații ale utilizatorului sunt implementate și publicate prin PR #47 MERGED. Cod candidat final: `5aa19ee79e009d95950931b7ad50b6061084671d`; integrare: `5a031c774898dc589b63f578afdafee687b9ff11`. Actualizările independente ale main sunt păstrate, inclusiv auditul și snapshotul de piață din `b1562a34dfd4edb938714d5c0e337d80b2b73979`. Aprobarea expresă de publicare primită anterior rămâne valabilă.

Intrare curentă: https://ghid-rta.ro/rta-lab/atlas/?v=filters-20261015 . Vechea adresă /rta-lab/ și lansarea instalată deschid online Atlas prin URL cu versiune; V10 rămâne explicit la https://ghid-rta.ro/rta-lab/?view=v10, la ancorele vechilor unelte și offline. Cauza versiunii vechi era vechiul start_url/redirect și resursele vechi încă valide în cache HTTP. Migrarea reîncarcă resursele la instalarea cache-ului Atlas și nu șterge date personale. Marcaj vizibil: „Atlas · filtre conectate · 15.10.2026”.

Liquid Match nu mai oferă cele trei exemple fixe. Selectorul comun caută toate cele 620 de identități, acceptă mai multe cuvinte în orice ordine și diacritice, prioritizează numele/brandul exact, oferă filtre brand/familie/trăsătură cu numărători dependente și paginare. Sugestiile aproximative sunt etichetate și apar numai dacă nu există potriviri exacte. Nicio alegere nu este schimbată automat.

Atlas: platformă → sârmă compatibilă → obiectiv; primele cinci lichide sunt calculate pentru configurația completă și obiectivul curent prin motorul existent. Atlas, Wire și Duel schimbă lichidul local din catalogul complet, păstrând reglajele și ambele builduri Duel; Duel are obiectiv comun. Wire afișează și topul contextual. Căutarea platformelor și Market acceptă termeni multipli; Market poate căuta toate cele 40 de fișe. Topurile sunt estimări ale motorului, nu cinci experiențe personale ori consens de piață.

Dovezi candidat exact: RTA 38701154372, Market 38701154364 și Visual 38701154439 — toate SUCCESS; artifact 11956337532, 93 PNG descărcate și inspectate. Testul de migrare folosește vechiul Atlas/V10 real din 8cb1b18, workers încălziți și cache HTTP de o oră: PASS; varianta de control cu vechiul install cache eșuează la verificarea HTML-ului nou. Cele 620 de căutări de identitate și echivalența topurilor cu motorul trec.

Publicare integrare: Pages 38702086762 și RTA 38702087125 SUCCESS. Direct pe domeniul public: 15 capturi noi la 360×800, 390×844 și 1440×1000 inspectate; toate cele patru selectoare, schimbările topului, păstrarea configurațiilor Wire/Duel și bytes CL, vechea intrare → Atlas și V10 explicit — PASS. Integritate: 89 fișiere HTTP 200 coincid cu codul verificat, 80 resurse în cache. Offline live: șase module funcționale, 16 hashuri foto, recuperare după exact un 503 injectat în workerul izolat și revenire după preview/ghid/refresh V10 — PASS; patru capturi suplimentare inspectate. Două încercări inițiale ale testului live au concurat cu reloadul automat V10; adaptorul QA așteaptă acum ambele navigări reale, fără relaxarea aserțiunilor. Codul aplicației nu a fost schimbat pentru acest adaptor.

Motorul V10, rta-lab/data/**, mood-match.js și index.html V10 sunt identice cu baza c268b2fc; 620 lichide, 16 platforme, 42 exemplare, configurațiile validate și bytes saved/draft CL sunt conservate. KLP + Dicodes NiFe30 și KLP + Zivipf NiFe52 în TC rămân preferințe personale de prim nivel distincte. Nu sunt inventate recenzii/procente. Verificarea este Chromium în dimensiunile raportate, nu telefon fizic/Safari.

Incident separat raportat de utilizator: Hype Radar programat 38701133473 (baza 0eafc43) FAILURE: 43/48 surse directe au reușit, sub pragul de 90%; publicarea snapshotului a fost blocată corect. Pragul nu este redus și eșecul nu este declarat rezolvat. Acest colector extern este separat de Market Hall of Fame și de publicarea filtrelor Atlas. Detalii: ATLAS_FILTERS_VERIFICATION_20261015.md.


## Istoric: candidat pentru acces și filtre conectate — 15.10.2026

Acest checkpoint prevalează asupra declarației anterioare de finalizare: utilizatorul a raportat intrarea în versiunea veche și cinci lipsuri de filtrare. Cauza verificată a intrării: /rta-lab/ și manifestul scurtăturii instalate deschideau V10, în timp ce Atlas era publicat numai la /rta-lab/atlas/. Candidatul direcționează lansarea veche online către Atlas; V10 rămâne explicit la /rta-lab/?view=v10, la ancorele uneltelor sale și offline. Indexul, motorul, mood-match.js, catalogul și configurațiile canonice V10 nu sunt rescrise.

Implementare în feature/atlas-intelligent-filters-20261015: dispar cele trei exemple fixe ÎNCEARCĂ; selector comun în Liquid Match, Atlas, Wire și Duel pentru toate cele 620 lichide, cu termeni multipli în orice ordine, diacritice, brand/familie/trăsătură, contoare dependente și paginare. Denumirile apropiate sunt etichetate numai când nu există potriviri exacte. Nu se selectează automat un alt lichid. Schimbarea rămâne în modulul curent și păstrează configurația Wire, ambele builduri Duel și bytes CL.

Atlas are selecție platformă → sârmă → obiectiv și primele cinci lichide calculate din core.matchLiquids pentru configurația completă afișată; se recalculează la schimbarea alegerilor. Și Wire afișează topul contextual. Duel are lichid și obiectiv comun schimbabile local. Căutările Atlas/Market acceptă termeni multipli; Market permite și căutarea în toate cele 40 fișe. Nicio identitate/review/procent nu este inventat.

Probe locale: căutare pentru fiecare dintre cele 620 identități, filtre și greșeli minore, echivalența topurilor cu motorul; scenarii în browser 360×800/390×844/1440×1000 pentru patru selectoare, top cinci, păstrarea buildurilor/CL, vechiul start_url și V10 explicit. 15 capturi noi inspectate; regresiile modulelor, căutării mobile și offline au trecut local. Cache 80 resurse, release 60 fișiere. Lista de sugestii nu acoperă filtrele; Escape nu selectează o sugestie ascunsă.

Candidatul este în verificare. CI, capturile din artifact și publicarea trebuie confirmate la noile SHA; nu prezentați încă aceste corecții ca publicate. Publicarea anterioară rămâne cea din checkpointul de mai jos până la noul deployment verificat.

## Publicare verificată — 15.10.2026

Această stare prevalează asupra checkpointurilor istorice de mai jos. Utilizatorul a aprobat expres direcția vizuală și a cerut «continuă până la publicarea verificată». Aprobarea a fost primită; nu mai există o aprobare vizuală în așteptare pentru această versiune.

PR #45 și #46 sunt MERGED, în ordine, prin merge commits; #46 a fost retargetat pe main. Integrare funcțională publicată: 64d28cccc8adbea6e8e41bb82d7b8c8ea3e197bc (arbore identic candidatului verificat 606aab3732d683e67c77aaa35ea4aff97385cf88). Versiune finală publicată: 79f7a1d40048899dfdb42cf588af19abc2c54797, care corectează numai eticheta ARIA Navigare Atlas și regenerează receipt/cache; aspectul și modulele sunt identice. Main păstrează toate actualizările automate existente. Ruta finală este https://ghid-rta.ro/rta-lab/atlas/ ; V10 este păstrat la https://ghid-rta.ro/rta-lab/ ; previewul rămâne separat.

La SHA final 79f7a1d: Pages 38694013076 și RTA 38694013836 SUCCESS; integritatea celor 86 resurse, mobil/motion și offline au fost retestate după această publicare. Cele 27 PNG suplimentare au fost inspectate integral. Actualizarea a fost confirmată și în browserul deja deschis, după reload, fără resetarea datelor.

Pages 38693180338 SUCCESS la SHA 64d28cc. Verificări post-merge SUCCESS: RTA 38693181313, Market 38693181270, Market Final Report 38693181389, Hype Global 38693181240; IndexNow 38693181301 SUCCESS. La candidatul exact 606aab3, toate cele cinci gates au trecut, inclusiv Visual 38692656827; celelalte runs: RTA 38692656829, Market 38692656822, Final Report 38692656850, Hype 38692656811. Capturile CI ale codului identic 47ccee9: artifact 11953025258, 78 PNG descărcate și inspectate.

Verificări executate direct pe domeniul public după deployment: mobil 360×800 și 390×844, desktop 1440×1000, toate cele șase module, căutare/keyboard, BEST contextual și salt la primul card, 3×3 builduri, obiectiv/profil comun, Atlas 16/42 și cele 3 CL distincte, Wire limite/compatibilitate și separarea celor două NiFe KLP, Duel două selecții explicite/izolarea unei variabile, Market patru clase a câte 10 surse, proveniență/imagini/ediții, profil de 80 caractere, motion/pauză/reduced-motion, cădere furnizor foto, date lipsă la rece și recuperare 503. Injectarea temporară în fetch-ul workerului izolat a înregistrat exact un răspuns 503, urmat de restaurarea catalogului 620; o primă variantă de simulator nu interceptase cererea workerului și nu este atribuită drept probă de 503. PASS; 74 PNG live inspectate, fără overflow sau erori de pagină în scenariile executate. Testul offline real a parcurs cele șase module, instalarea preview/V10/ghid, comanda de cache și pagina refresh V10; Atlas revine offline și bytes saved/draft CL de test rămân identici. Aceste scenarii au fost executate în profiluri izolate, fără modificarea datelor browserului personal.

Integritate live: 86 fișiere HTTP 200 coincid prin SHA256 cu versiunea integrată, inclusiv 79 resurse din cache, fotografii/fonturi, catalogul și infrastructura V10. Compararea Git cu baza c268b2fc confirmă motorul, rta-lab/data, mood-match.js și index.html V10 identice. Singurele corecții de infrastructură protejată sunt prefixurile de curățare cache (ghid/V10) și scope-ul exact pentru refresh; nu șterg datele personale.

Toate cele șase module sunt implementate și publicate: HOME, LIQUID MATCH, ATOMIZER ATLAS, WIRE LAB, MARKET HALL OF FAME, DUEL MODE. Cele 620 lichide, 16 platforme, 42 exemplare și configurațiile canonice sunt conservate. KLP cu Dicodes NiFe30 sau Zivipf NiFe52 în TC sunt ambele preferințe personale de prim nivel; experiența Dicodes 220°C/16 W nu este transferată Zivipf.

Limite explicite păstrate în produs: rezultate tehnico-senzoriale estimate, fără procente de plăcere sau consens inventat; reviewuri singulare și ediții distincte; fotografii reale cu proveniență, scheme acolo unde nu există o fotografie certă; licențele exprese de redistribuire ale fotografiilor externe nu sunt certificate. Verificarea browserului este în Chromium la dimensiunile raportate, nu o probă pe telefon fizic ori Safari. Nu rămâne o etapă funcțională sau publicarea în așteptare în mandatul celor șase module; aceste limite nu sunt ascunse printr-un verdict universal.

Detalii și legături: ATLAS_PUBLICATION_VERIFICATION_20261015.md.

## Candidat integrat, verificare de publicare — 15.10.2026

Cod candidat sincronizat 47ccee906c69844ced4fa94a1d23ac5ce2b44b7e: RTA 38692198611, Market 38692198344, Market Final Report 38692198338, Hype Global 38692198409 și Visual 38692198551 sunt toate SUCCESS. Artifact 11953025258 are 78 PNG descărcate și inspectate integral; imaginile Market 360/390 sunt acum încadrate complet după rezervarea dimensiunilor lor naturale. Corecțiile de cache/refresh au trecut în browser real și CI, inclusiv activarea workerului ghidului, refresh V10, revenirea offline și păstrarea exactă a bytes CL.

Main a avansat independent la 7f1137b47231fb34c130402bb457718b235244c8 prin actualizări automate de catalog public și jurnale sociale. Niciun fișier rta-lab/ sau /sw.js nu diferă între main actual și baza c268b2fc. Drafturile au fost sincronizate fără conflicte și fără modificarea main: #45 eb3de20a8dfa851e5993ee9b716db4724b652fd2; #46 47ccee906c69844ced4fa94a1d23ac5ce2b44b7e. Sunt commituri de integrare a main în drafturi, nu merge al PR-urilor în producție. PR #45 sincronizat are RTA 38692180564, Market 38692180620 și Visual 38692180556 SUCCESS. Fișierele mobile sunt identice cu 0f16be22, iar fișierele Atlas sunt identice cu cba10dd; sincronizarea păstrează actualizările automate. Rezultatele documentației ulterioare se raportează separat, fără atribuirea unui run altui SHA.

Implementate în candidat: toate cele șase module, profil liber/review fără inserare în catalog, obiectiv comun, configurații complete, Duel cu două alegeri explicite și izolarea unei variabile, 40 fișe Market (10 în fiecare clasă), 16 fotografii de platforme, fotografie Dicodes și 12 vizualuri originale de review cu proveniență, fonturi locale și offline. Materialele fără fotografie certă și edițiile de ambalaj neidentificate sunt reprezentate schematic/editorial, nu fabricate. Licențele exprese ale fotografiilor externe nu sunt certificate.

Aprobarea vizuală majoră solicitată este încă în așteptare. Ambele PR rămân DRAFT. Ruta finală /rta-lab/atlas/ este pregătită, dar nepublicată. Numai după acord se integrează #45, apoi #46 retargetat pe main, cu păstrarea actualizărilor automate; se verifică exact CI/Pages și toate fluxurile live înaintea oricărei declarații de finalizare. Nu deduceți aprobarea din timpul trecut sau din CI.


## Integrare cache / refresh — 15.10.2026

7503d38c936d33ab13f9349c2f63a69501bc11c9: RTA 38690903490, Market 38690903391 și Visual 38690903494 sunt SUCCESS. Artifact 11952089482: 78 PNG descărcate și inspectate integral, inclusiv profile lungi, macro Dicodes, vizualul original Kentucky, cele patru categorii și cazurile offline. Testul de captură exclude corect imaginile lazy din details închis, dar decodează imaginile vizibile. Clipul MP4 al releaseului este înregistrare de browser reală, nu animație generată.

Inspecția celor 78 cadre a respins încadrarea imaginii Kentucky în captura mobilă: încărcarea lazy fără dimensiuni rezervate muta poziția după scroll. Cele 12 vizualuri au acum lățimea/înălțimea naturală din fișier, păstrate în receipt și în HTML; imaginile nu sunt tăiate sau editate. Retestarea și noile capturi sunt obligatorii la SHA-ul următor.

Verificarea extinsă a descoperit și reprodus două defecte de integrare: activarea /sw.js a ghidului ștergea cacheul Atlas; refresh.html V10 dezînregistra și workerii Atlas din subrute. Baseline-ul real a eșuat succesiv la ambele aserțiuni. Corecția limitează curățarea ghidului la ghid-rta-static-, iar dezînregistrarea refresh la scope-ul exact /rta-lab/. Mesajul de eroare nu mai îndrumă spre ștergerea tuturor datelor site-ului. Retestarea locală reală PASS: activare preview/release/V10/ghid, refresh V10 cu încărcarea celor 620 lichide, worker Atlas păstrat, bytes CL saved/draft identici și revenire Atlas offline. CI nou este obligatoriu la SHA-ul următor; nu atribuiți aceste dovezi locale unui run anterior.

Motorul, datele canonice, intrarea V10 și configurațiile sunt păstrate; modificările suplimentare sunt exclusiv întreținerea cacheului și scopul refreshului. PR #45/#46 rămân DRAFT; aprobarea vizuală expresă este în așteptare. Main și publicarea nu sunt modificate de această lucrare.


## Verificare candidat — 15.10.2026

Pe 7d50cc0f836fdf79770f2706d9caa1c283895b6b, RTA 38690625927 și Market 38690625833 sunt SUCCESS. Visual 38690625816 este în curs, fără verdict atribuit. Testul local de captură a rămas în așteptarea decode() pentru o imagine lazy din details închis, cu dreptunghi de înălțime zero; capturarea exclude acum explicit panourile închise și suprafețele fără dimensiuni. Imaginile deschise rămân decodate și verificate. Testul local precedent a fost întrerupt, nu declarat PASS; retestarea și CI nou rămân obligatorii.


790268e35c3524a5997e8a434cf45297b7bf083b: RTA 38688911407, Market 38688911503, Visual 38688911394 sunt SUCCESS. Corecția ordinii receiptului Windows/Linux a fost confirmată în CI. Pe candidatul anterior 8480c5508240ad7bdefb26fdfb86d749d509b9c7: Market 38688443129 și Visual 38688443195 SUCCESS; artifact 11951032081, toate cele 69 PNG descărcate și inspectate în 360×800, 390×844 și 1440×1000. RTA 38688443027 eșuase numai la ordinea receiptului; nu îi atribuiți SUCCESS.

Continuarea adaugă fotografia originală Dicodes RESISTHERM NiFe30, inspectată, cu SHA256/proveniență în media/WIRE_PHOTO_RECEIPT.json. Apare numai când materialul este Dicodes, nu Zivipf. Ambalajul de referință nu este declarat rola personală sau lotul actual. Fotografia generică Zivipf mică, fără identitate vizibilă, a fost respinsă; macrofotografiile lipsă nu sunt fabricate. Testele browser suplimentare ale materialului pe 360/390/1440 și releaseul offline au trecut local; noul CI se verifică la SHA-ul următor. Eticheta ATLAS a rutei finale este acum verificată și nu păstrează V0.2.

Verificare locală suplimentară: toate cele șase rute în 320×568, 768×1024, 844×390 și 1920×1080; patru cazuri cu nume de profil de 80 caractere. PASS, fără overflow/erori de pagină; 28 PNG inspectate. Nu este probă pe un dispozitiv fizic și nu înlocuiește aprobarea estetică.

Au fost verificate și admise 12 vizualuri editoriale din recenziile originale, afișate numai lângă sursa și ediția lor în Market. Originalele sunt nealterate; receiptul media/MARKET_VISUAL_RECEIPT.json păstrează URL/hashuri și excluderile pentru imagini generice sau ediții ilizibile. Nu sunt declarate fotografii ale lotului actual ori ale colecției personale. Cacheul are acum 79 resurse, releaseul 59 fișiere. Testarea cu 80 caractere a identificat text tăiat, deși documentul nu avea overflow; împărțirea pe rânduri a fost corectată și sunt verificate separat limitele etichetelor. Retestarea locală a celor 28 de cadre responsive este PASS.

Releaseul /rta-lab/atlas/ are acum 59 fișiere generate și cache cu 79 resurse, separat de preview și V10. Motorul, datele canonice, catalogul 620/16/42 și intrarea V10 sunt identice cu baza c268b2fc. Singura corecție de infrastructură V10 rămâne limitarea curățării cacheului din sw.js la prefixul său. Ambele PR sunt DRAFT, main nu este modificat de această lucrare și aprobarea vizuală este încă în așteptare. Publicarea nu este efectuată.


## Candidat de publicare în pregătire — 15.10.2026

Candidatul verificat a015160a9c421806ca074422b9551a21dcdf6d87: RTA 38686560987, Market 38686560921 și Visual 38686560942 sunt SUCCESS. Artifact 11950766588 conține 54 PNG, toate descărcate și inspectate; fotografiile locale sunt pictate, cadrul mobil și sursele sunt lizibile. Înregistrare MP4 reală realizată în browser pentru HOME, Liquid Cinema și schimbarea airflow/spirelor. Capturile și clipul au fost prezentate utilizatorului; aprobarea vizuală expresă este solicitată și încă nu a sosit. Nu transformați așteptarea în aprobare.

Continuarea locală adaugă 16 fișe Market, până la 40 (10 în fiecare categorie), după verificarea pasajelor de degustare originale. Metadatele și excluderile sunt în MARKET_RESEARCH.md / market-evidence.js; relatările cu autor identificat doar generic sunt limitate explicit și ordonate ultimele. Nicio fișă nu susține consens universal, configurație personală A/B sau disponibilitate actuală. Catalogul protejat rămâne 620. Testele pure pentru toate cele 40 de profile și testul browser 360/390/1440 au trecut; CI nou rămâne de verificat la commitul nou.

Ruta finală /rta-lab/atlas/ este generată reproductibil din candidatul evaluat, prin tools/build-rta-atlas-release.js, cu receipt de hashuri. Reutilizează direct datele și modelele V10, fără o copie a motorului. --check verifică fiecare fișier și păstrarea intrării V10. Previewul rămâne separat. Rutele au scope și prefixuri cache distincte. Niciuna dintre aceste modificări locale nu este declarată publicată.

Testul real de activare V10 a demonstrat o problemă de integrare: rta-lab/sw.js ștergea cacheurile tuturor aplicațiilor de pe origine. Corecția candidatului limitează strict activarea/mesajul CLEAR_RTA_LAB_CACHES la prefixul rta-lab-. Este singura modificare de infrastructură V10 din această etapă; motorul, presetul, catalogul, configurările și datele personale rămân neatinse. Testul acoperă instalarea preview/release/V10, refresh V10, revenire offline și bytes CL saved/draft. Retestarea locală este PASS: activarea reală și comanda de refresh V10 păstrează cacheurile Atlas, revenirea offline și bytes CL. CI nou se verifică la noul SHA.

Rămân obligatorii: CI la noul SHA și inspecția tuturor capturilor suplimentare; media/proveniența completă fără fotografii de sârmă fabricate; aprobarea vizuală cerută; merge în ordine cu păstrarea jurnalelor automate actuale din main; Pages SUCCESS la SHA post-merge și fluxurile live ale tuturor modulelor. Proiectul nu este declarat finalizat înaintea acestor dovezi.


## Checkpoint precedent — 15.10.2026

Mandat: finalizare autonomă a tuturor celor șase module, fără reconstruirea V10. Acest checkpoint prevalează asupra limitelor istorice de implementare din secțiunile vechi. PR #45 și #46 rămân DRAFT; aprobarea vizuală expresă și publicarea nu au avut loc.

- Main observat: 612da18de45b8341b81b5e6edd2bc21c5d750c95. După baza c268b2fc, două commituri automate au modificat numai data/instagram-publish-state.json. V10, motorul, 620 lichide, 16 platforme, 42 exemplare și configurațiile nu au fost editate de această continuare.
- PR #45 HEAD 0f16be22aaf2c5c334877ed443d87537d35dab50: RTA 38623585477, Market 38623585776, Visual 38623585623 SUCCESS; artifact 11923445312, 23 PNG inspectate.
- PR #46 HEAD verificat ac37f8eeed6d3764b1daa8973041d7e1fa3906c8: RTA 38631372771, Market 38631372911, Visual 38631372768 SUCCESS; artifact 11926625971, 44 PNG descărcate și inspectate. Unele fotografii de rezultat nu erau pictate complet: aceste cadre nu au fost acceptate ca dovadă estetică finală.
- Continuarea locală: profil liber și profil din review în afara catalogului, obiectiv comun între module, două selecții explicite pentru Duel, izolarea unei variabile și două scheme sincronizate, acces direct la configurația completă în Wire, fotografii locale nealterate pentru toate platformele, fonturi locale OFL, pauză Liquid Cinema, PWA/offline în scope separat, eroare explicită la date incomplete și citire CL fără completarea parametrilor lipsă.
- Teste locale PASS: 140 contexte originale; 140 comparații exacte adaptor/Mood Match; 210 contexte de profil liber; toate materialele/obiectivele și stres pe 620; 24 profiluri de review fără al 621-lea lichid; browser 360×800, 390×844, 1440×1000; șase module offline cu hashurile fotografiilor și bytes CL saved/draft păstrate. Ultimele reglaje și CI nou trebuie reverificate la SHA-ul lor. Nu deduceți SUCCESS pentru un commit ulterior.

Market are 24 fișe admise, 10/4/1/9, review singular și versiuni explicit separate. Cele 16 locuri fără dovezi nu sunt umplute fictiv. Profili din review dau estimări 3×3, nu A/B atribuit autorului. Fotografia actuală Black Note nu este declarată ambalajul Prelude istoric. Copiile celor 15 fotografii externe + imaginea Asylum din arhivă au fost inspectate; proveniența/hashurile sunt în media/PRODUCT_PHOTO_RECEIPT.json. Atribuirea nu certifică drepturi de redistribuire. Macrofotografiile de sârmă neprocurate nu sunt înlocuite cu fotografii fabricate.

KLP Dicodes NiFe30 și Zivipf NiFe52 TC: ambele preferințe personale de prim nivel. DNA 220°C/16 W rămâne exclusiv observația Dicodes; Zivipf nu moștenește acest caz.

Urmează fără alt „continuă”: commit pe ramura PR #46, toate gates la SHA exact, descărcare și inspecție integrală a noilor capturi, remediere/retestare; completarea surselor și a media verificabile; candidat concret pentru aprobarea vizuală majoră; pregătire release separat de V10, apoi numai după aprobare merge și Pages/live verificate. Noul candidat nu este cel de pe site. Finalizarea rămâne deschisă.


**Fișier canonic RTA Lab · stare consolidată 14.10.2026; există separat un blueprint UI în curs de aprobare.**

- Repo: `andreiclim77-cell/rta`
- Branch: `main`
- Cale stabilă: `rta-lab/RTA_CONTINUITY_MASTER.md`
- **Ultima stare pentru o conversație nouă:** [`rta-lab/RTA_CURRENT_HANDOFF.md`](RTA_CURRENT_HANDOFF.md) — citește întâi acest handoff, apoi MASTER și blueprint, verificând întotdeauna `main`.
- **Design nou, neimplementat încă:** [`rta-lab/RTA_ATLAS_DESIGN_BLUEPRINT.md`](RTA_ATLAS_DESIGN_BLUEPRINT.md) — proiectul RTA Sensory Atlas / Precision Motion Lab, 6 ecrane, media/motion și predare în Work.
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
- **Dvarw MTL CL + insert 3×0,6 + K1 28 GA / Ø2,5 / 6 spire = configurație activă validată 27.09.2026**, preferată pentru airflow multipunct, layering și completitudine. **Nou 14.10.2026: CL + insert 1×1,2 + K1 28 GA / 5 spire este și el un setup apreciat ca foarte reușit**. Nu compara doar insertul: diferă și numărul de spire.
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
- **CL și FL: insertul 3×0,6 mm este prima alegere personală clară.** 1×1,2 rămâne alternativă, nu presetul personal implicit. **Pe CL, 1×1,2 împreună cu K1 28 GA / 5 spire merge și el bine**, validare personală distinctă; nu-l eticheta inferior în sine.
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
| **Dvarw CL și FL** | **insert 3×0,6 mm** (CL K1 28/6; FL K1 28/6 pe Balkan Milestone) | **CL 1×1,2 + K1 28/5 este tot reușit**; FL 1×1,2 rămâne alternativă | CL 1×1,2/5 = validare personală calitativă, nu A/B controlat; FL 3×0,6/6 = A/B pe Balkan Milestone |
| **Toate celelalte platforme** | **NESTABILIT** | de testat | nu inventa clasamente sau transferuri |

**Separarea materialelor:** Dicodes NiFe30 = **TCR320**, cu etichetă de rolă confirmată 5,5 Ω/m; Zivipf NiFe52 = **TCR310**; ambele au 6 spire/Ø2,5 în baseline, dar **nu sunt același aliaj**, nici nu folosesc automat aceleași setări TC. Egalitatea înseamnă că utilizatorul nu dorește să fie ierarhizate între ele la capitolul **preferință personală**. KLP DNA **220°C, 16 W** reprezintă exclusiv setarea raportată pentru **Dicodes NiFe30**.

**Reguli de scoring:** în Sensory DNA, „preferință personală” este o etichetă și un prior transparent separate de dovezile testului. Niciun scor numeric de plăcere nu se calculează. Cele două NiFe primesc același bonus de prioritate personală pe platformele declarate, iar diferențele de rezultat tehnic/lichid rămân posibile și etichetate. Păstrează 16 platforme, 42 RTA fizice, 620 lichide și numai cinci familii de sârme active. Metodă: A/B direct > preferință declarată > extrapolare tehnică, fără transfer între lichide sau platforme.

### 20.3. Nuanțare suplimentară: Dvarw CL 1×1,2 cu K1 28/5 (14.10.2026)

- **Declarație directă:** „Pe CL totuși insertul de 1,2 merge bine cu 5 spire K1 28 GA”. Configurația completă observată este **Dvarw MTL CL 22 + insert unic 1×1,2 mm + Kanthal A1 28 GA / 5 spire**. Nu inventa lichidul, temperatura, wattajul, poziția coilului sau Ø exact pentru acest test.
- **Preferință de familie păstrată:** pe CL utilizatorul preferă în general insertul **3×0,6 mm**, pentru care are test validat cu K1 28 GA / Ø2,5 / 6 spire. Această preferință **nu transformă 1×1,2 + K1 28/5 în variantă slabă**. Este o a doua configurație personală apreciată, distinctă.
- **Cauzalitate:** o comparație CL 3×0,6/K1 28/6 vs CL 1×1,2/K1 28/5 modifică **două variabile importante simultan** (distribuția aerului și geometria/masa coilului); efectele nu pot fi atribuite doar insertului. Nu afirma rezultate A/B pe spectru/TH/palat pe 1×1,2/5 fără date.
- **Lab:** înregistrare explicită de observație parțială pentru 1×1,2/K1 28/5 în Sensory DNA, opțiune selectabilă; 3×0,6/K1 28/6 rămâne presetul preferat. Motorul legacy trebuie să explice ambele configurații. Sunt valabile 16 platforme, 42 unități și 620 lichide.


## 21. Dvarw CL — selectare rapidă a două setupuri reale în Sensory DNA (14.10.2026)

**Scop:** transformarea concluziilor din §20.3 în două alegeri fizice funcționale în configurator, fără modificarea motorului de bază, a celor 16 platforme, 42 de RTA-uri fizice sau a catalogului cu 620 de lichide.

**Configurații disponibile printr-un clic, NUMAI pentru Dvarw MTL CL:**
1. **Principală personală:** insert **3×0,6 mm**, K1 **28 GA**, **6 spire**. Configurație validată anterior pentru caracter muscular, distribuție multipunct și dezvoltare aromatică; Ø2,5 este baseline Lab.
2. **Alternativă reușită:** insert unic **1×1,2 mm**, K1 **28 GA**, **5 spire**. Utilizatorul spune explicit că „merge bine”. Nu se atribuie lichid, wattaj, diametru ori comparație controlată doar a insertului.

**Interfață:** în prima zonă a cockpitului „Configurator” apar două carduri cu marcaj clar „Preferința principală” / „Alternativă reușită”, buton „Aplică setupul”, stare accesibilă aria-pressed și explicația nivelului de dovadă. O alegere schimbă împreună **airflow + material + wraps**, în ambele moduri atomizor/lichid și persistă pentru atomizor; power, coilMm și poziția sunt păstrate dacă sârma nu se schimbă, pentru a nu atribui testului valori inventate. Când se trece de la altă sârmă la K1 28, revine presetul orientativ al materialului, nu un W pretins măsurat. Cealaltă configurație rămâne mereu selectabilă. Nu schimba automat buildurile altor platforme.

**Metodă:** nu este un A/B în care variația să fie doar insertul, deoarece se schimbă **5 vs 6 spire** și astfel geometria, rezistența și condițiile termice. Preferința 3×0,6 nu înseamnă că 1×1,2 cu 5 spire este slab; ambele sunt experiențe reale de păstrat, fără scor numeric fabricat al plăcerii.

**Fișiere canonice:** `rta-lab/data/sensory-core.js` expune `personalSetups("dvarwcl")` (două configurații fără transfer la FL); `rta-lab/sensory-ui.js` oferă `applyPersonalSetup(view,id)`, două carduri în zona 01 și gestionarea clicurilor; `rta-lab/sensory-ui.css` asigură două coloane desktop și una pe mobil, vizibilitate stare și focus. `index.html` și `sw.js` au versiunea `10-cl-pair-20261014` pentru a evita vechiul cache PWA.

**QA:** `node tools/check-rta-sensory-core.js` verifică numărul și parametrii presetelor, disponibilitatea doar pe CL, ambele moduri, selectarea prin eveniment real, actualizarea celor trei variabile, păstrarea puterii ajustate, eroare la ID invalid și lipsa efectelor laterale pe KLP. `tools/check-rta-lab-mobile-clarity.js` păstrează contractul de versiuni; se rulează și Quality Gate integral, apoi se verifică separat deploy GitHub Pages.

**Stadiu:** implementat pentru verificare CI/publicare; nu confunda codul din ramura de lucru cu site-ul public până la confirmarea integrării și deployului.


## 22. Trei exemplare fizice Dvarw CL — fișe și proiecte independente (14.10.2026)

**Obiectiv:** după cele două setupuri CL din §21, utilizatorul a aprobat administrarea distinctă a tuturor celor **3 Dvarw CL fizice**, fără suprascriere reciprocă. Nu atribui fără probă unui exemplar un coil/insert doar pentru că platforma are un preset personal.

### 22.1 Model de date / siguranță

- `rta-lab/sensory-ui.js` are **3 fișe pentru CL 1, CL 2, CL 3**, prin cheia separată de browser `rta-cl-physical-units-v1-20261014`; schema: `{schema:1,active:0..2,units:[{saved,draft,source},...3]}`.
- Fiecare CL are **saved** (configurație înregistrată explicit) și **draft** (ce explorezi în configurator). `saved` se schimbă numai când utilizatorul apasă „Înregistrează setupul pentru CL X”; comutarea profilurilor/presetelor/lichidelor sau ajustarea W **nu salvează automat fișa fizică**.
- Unitatea nouă are `saved:null,draft:null`; motorul prezintă doar **presetul orientativ CL 3×0,6/K1 28/6**, marcat **„Neînregistrat”**, nu presupune că este montat.
- Schimbarea în CL 1 nu modifică CL 2 sau 3. Schimbările neînregistrate se păstrează ca `draft` separat între CL-uri și la revenirea în aplicație; butonul „Renunță la modificări” revine la `saved` (dacă există) sau la presetul orientativ fără a afirma un montaj.
- **Migrare sigură:** alegerea CL stocată anterior în configurarea unică `rta-sensory-dna-choice-20261013` intră **numai ca `draft` pe CL 1**, marcat „Import vechi · nesalvat”; **nu** devine automat `saved` și nu se copiază pe CL 2/3. Celelalte platforme își păstrează setările existente.
- Se salvează obiectul complet `atom,bell,air,wire,wraps,coilMm,position,power,temp` în fiecare fișă. Materialul NiFe rămâne profil TC separat; setările DNA 220°C/16 W pentru KLP nu se transferă la CL. Funcțiile de validare ale motorului normalizează fiecare build.
- `localStorage` este **local acestui browser/dispozitiv**, fără sincronizare automată între telefoane, fără backup în GitHub al configurațiilor personale ale celor trei exemplare. Dacă stocarea nu este permisă, configuratorul rămâne funcțional în memorie pentru sesiunea curentă și afișează avertisment.

### 22.2 UI / gesturi

- În zona **01 Configurator** pentru platforma Dvarw CL (în ambele moduri: „Am un atomizor” și „Știu ce lichid vreau”) apare un selector cu trei butoane **CL 1 / CL 2 / CL 3** și statusuri *Neînregistrat*, *Proiect nesalvat*, *Modificări nesalvate*, *Înregistrat*. Eticheta arată și sumarul configurației efective sau al proiectului, fără a declara instalări neverificate.
- Butonul **„Înregistrează setupul pentru CL X”** este confirmarea explicită. Butonul **„Renunță la modificări”** apare numai la diferențe față de înregistrarea curentă. Selectorul funcționează cu butoane accesibile (`aria-pressed`), vizibil pe telefon, fără a afecta layoutul celor trei zone.
- Cele două preseturi personale CL din §21 rămân sub selector: **3×0,6/K1 28/6** și **1×1,2/K1 28/5**, funcționează acum pentru **CL-ul activ ca proiect**, nu pentru toate trei. Schimbarea între ele **nu** scrie `saved`.
- Transferul unui build din Mood Match, dacă atomizorul ales este CL, completează tot **proiectul CL-ului activ**, fără confirmare implicită de montaj; pe alte atomizoare rămâne funcționalitatea anterioară.

### 22.3 Integrare, QA și limite

- **Fișiere:** `rta-lab/sensory-ui.js`, `rta-lab/sensory-ui.css`, `rta-lab/index.html`, `rta-lab/sw.js`, `rta-lab/bootstrap.js`, `tools/check-rta-sensory-core.js`, `tools/check-rta-lab-mobile-clarity.js`.
- Activele UI folosesc versiunea `10-cl-units-20261014` și o cheie nouă pentru cache PWA; `bootstrap.js` păstrează intenționat `const VERSION = "10"` cerută de vechea verificare.
- Teste de regresie: 3 fișe fără montări inventate, comutarea 1→2→3→1 cu configurații și wattaje distincte, `saved` vs `draft`, păstrarea proiectelor la schimbarea exemplarului, revenire, refuz selectare invalidă, integritate KLP/GTR/FL, persistență după reîncărcarea modulului, import vechi CL fără a atribui greșit echipament fizic și funcționare fără acces la stocare.
- Calitatea senzorială rămâne cea raportată în §20–21. **Nu** se modifică scorurile aromatic/TH, 16 platforme, 42 atomizoare, 620 lichide ori cinci sloturi active în această etapă.
- **Stadiu în proces:** implementare în ramura de lucru → CI RTA + Market Quality Gate → integrare `main` → confirmare GitHub Pages. Marcați rezultatele numai după verificare, nu înainte de deploy.

**Următoarea îmbunătățire opțională:** export/import al fișelor fizice pentru transfer între dispozitive, numai la cererea utilizatorului (nu există sincronizare cross-device în această etapă).

## 23. PRECISION MOTION LAB — direcție vizuală + blueprint de șase ecrane (14.10.2026)

**Status: arhitectură PROPUSĂ pentru aprobare; INTERFAȚA FUNCȚIONALĂ NU A FOST RESCRISĂ.**

**Cererea actuală a utilizatorului:** noul RTA Lab să valorifice rezultatele cele mai bune din experiența personală, **fără a relata întregul șir de experimente** (multe pot fi depășite, irelevante ori greșite). Pentru fiecare rezultat principal: **două atenționări/oportunități**, una extrapolată din know-how-ul propriu și una susținută de experiența/review-urile reale ale pieței, fără consens inventat. Utilizatorul vrea multe imagini, animații explicative și atmosferice cu adevărat funcționale, nu doar descrieri ale mișcării.

**Identitatea vizuală aleasă:** **Concept B — Precision Motion Lab** ca bază, cu **30% atmosferă A Cinematic Atlas + 10% rafinament C Collector's Gallery**. Compoziția normalizată orientativă este **60/30/10**. Eleganță tehnică, imagini de produs autentice/licențiate, scenografie atmosferică proprie, airflow și coil animate schematic, UI mobil prioritar, performanță și reduced-motion. Designul concret urmează să fie validat prin machete.

**Cele șase ecrane stabilite drept obiect al proiectării:**
1. **HOME** — acces rapid prin lichid / atomizor / sârmă, plus Market și Duel.
2. **LIQUID MATCH** — lichid + moment + stare + obiectiv → **TOP 3 atomizoare contextuale × TOP 3 builduri complete per atomizor**, cu BEST actual, două direcții WATCH, descriere senzorială și proveniență. Integrare **Liquid Cinema**.
3. **ATOMIZER ATLAS** — 16 portrete de platforme; ADN complet, familiile de lichide și sârme favorizate, TOP3 builduri, apoi cele 42 de exemplare fizice la nivel de fișe; păstrează local saved/draft pentru 3 CL.
4. **WIRE LAB** — cele cinci familii de sârme și aliajele Dicodes NiFe30/Zivipf NiFe52 distincte; WATT/TC corect, variații geometrice, influența setărilor, animații explicative, fără simulări termice false.
5. **MARKET HALL OF FAME** — cercetare cu surse, **4 × TOP 10** pentru NET simplu / NET complex / tutunos simplu / tutunos complex; nu umple locurile fără dovezi, fără prețuri sau popularitate inventate.
6. **DUEL MODE** — două configurații complete într-un context comun, comparații care explică variabilele și compromisul.

**Procentuale:** doar diferențe **strict peste 10%** și *documentate pe bază comparabilă reală*, cu sursă și context; **nu** calcula procente din scoruri heuristice 1–5 și nu inventa procente de plăcere. Exemplul FL 3×0,6 + Balkan Milestone „palat ~25%” este **autoevaluarea personală** pentru cazul respectiv, nu procent universal.

**Sursa documentară completă, obligatorie înainte de Work:** [`RTA_ATLAS_DESIGN_BLUEPRINT.md`](RTA_ATLAS_DESIGN_BLUEPRINT.md). Conține structura/wireframe-ul textual, ierarhia vizuală, fluxul de date, media/motion, UX mobil, gardurile, criteriile de acceptare, planul de implementare și protocolul de continuitate. Citește **atât acest blueprint, cât și MASTER**, apoi codul real din `main`; nu cere utilizatorului să repete istoricul.

**Ordinea de lucru aprobată:** arhitectură în conversația actuală → revizie conceptuală → **machete mobile/animabile demonstrate** → aprobare utilizator → implementare în branch/staging, eventual în **Work în același fir dacă UI permite** → testele automate și vizuale → lansare numai când clar mai bun. Nu pretinde că Work preia automat toate detaliile; fișierele din GitHub asigură predarea, inclusiv dacă interfața inițiază o sesiune nouă. Nicio mutare în Work și nicio editare de cod de producție nu s-a făcut în acest checkpoint.

**Următorul pas:** să prezentăm utilizatorului în conversație arhitectura vizibilă a tuturor celor șase ecrane, apoi să obținem feedback asupra ierarhiei și să realizăm **machetele mobile ale Home și Liquid Match, cu motion adevărat**, înaintea celorlalte patru.

## 24. PREVIEW HOME + LIQUID MATCH — motion efectiv și rezultate 3×3 (14.10.2026)

**Decizie:** după aprobarea arhitecturii (§23), utilizatorul a cerut să CONTINUĂM direct cu un **prototip vizual interactiv al primelor două ecrane**, fără refacerea a ceea ce funcționează în Lab. A insistat ca motion-ul să fie **real**, nu doar descris, și a semnalat un **run eșuat GitHub Pages**.

**Cauză verificată a eșecului:** rularea Pages `38593721127` (SHA `8b65bd28e17c0be2b621c86c29771b707420d1cb`) a terminat jobul `build` cu **success**, dar jobul `deploy` cu **failure** după **600 secunde timeout** în starea `updating_pages`; a anulat deploymentul. RTA Guide Quality Gate pe același commit a trecut. Nu atribui asta eronat aplicației, deoarece logurile atestă timeout la deploymentul Pages; este posibilă problemă temporară de infrastructură/sincronizare. **Verifică un nou SUCCESS Pages înainte de a afirma publicarea.**

**Stadiu prototip:** ramură `feature/atlas-prototype-home-liquid-motion-20261014`, cod izolat la `rta-lab/atlas-preview/{index.html,styles.css,app.js}`. HOME și LIQUID MATCH cu CSS/SVG motion adevărat, căutare catalog existent, 7 mood × 5 momente, recomandări contextuale **3 atomizoare × 3 builduri** cu surse reale ale motorului, WATCH extern declarat **necercetat**. Uitați-vă la `RTA_ATLAS_DESIGN_BLUEPRINT.md` §14 pentru detaliile exacte. **Nu a fost atins UI V10.**

**Înainte de aprobarea designului:** verifică QA (`tools/check-rta-atlas-preview.js` în Quality Gate), apoi merge PR pe `main` numai cu testele verzi, apoi deploy separat, apoi prezintă linkul `https://ghid-rta.ro/rta-lab/atlas-preview/` numai după succesul siteului; solicită feedback, în special media autentică și fluiditatea pe Samsung Android. Dacă Pages expiră din nou, **nu pretinde că prototipul este accesibil public**; raportează status și păstrează codul/PR, caută o cale de previzualizare alternativă.

## 25. Pages deployment orphan — remediere operațională 14.10.2026

**Dovadă loguri:** Pages run `38593721127` / SHA `8b65bd28e17c0be2b621c86c29771b707420d1cb` a terminat `build=success`, însă deployul a rămas la `updating_pages` și a expirat după 600 secunde, apoi a raportat anulare. **Paginile GitHub au rămas totuși blocate** într-un deployment orfan, fapt confirmat de următoarea rulare Pages `38597878138` / SHA `91de135f10fc74f85d250aa228774b33f3f184de`, care a eșuat la creare cu **HTTP 400: „due to in progress deployment. Please cancel 8b65bd28e17c0be2b621c86c29771b707420d1cb first”**. Așadar blocajul de deployment este distinct de cod; RTA Guide Quality Gate a trecut.

**Remediere pregătită în PR de corecție:** fișier Actions `.github/workflows/recover-rta-pages.yml` (one-shot la push pe `main`, doar când se adaugă/editează acest workflow) utilizează `GITHUB_TOKEN` cu `pages: write`, interoghează exact deploymentul vechi și cere anularea lui doar dacă nu este deja într-o stare terminală, prin endpointul GitHub REST `POST /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel`. Nu dezactivează Pages și nu șterge siteul. Se urmărește codul **204**; apoi se rerulează doar jobul Pages eșuat al commitului curent ori se redeclanșează o nouă publicare, verificând `completed/success` pentru SHA-ul corect. Dacă API-ul refuză, nu pretinde că Pages este reparat și nu simula accesibilitatea publică.

**Corecție în același PR:** prototipul `atlas-preview/app.js` nu mai poate spune că un test KLP NiFe30 cu lichid **neprecizat** a avut loc „pe lichidul selectat”; îl marchează drept observație parțială cu aplicare contextuală extrapolată. Testul `tools/check-rta-atlas-preview.js` controlează exact această limitare.

**Regulă permanentă:** un deployment Pages eșuat nu dovedește o eroare în motor; citește logul exact. Păstrează V10 neatins. Numai după rularea Pages `success` anunță disponibilitatea reală a `/rta-lab/atlas-preview/`.

## 26. Feedback visual — prototipul Atlas V0.1 nu este aprobat (14.10.2026)

**Declarația utilizatorului după deschiderea `https://ghid-rta.ro/rta-lab/atlas-preview/`:** „Nu e reală deloc, iar animată iar nu e și nici bine încadrată… arată banal.”

**Status imediat:** **V0.1 RESPINS ca design / motion / încadrare mobilă**, chiar dacă testele de cod și GitHub Pages au trecut. Nu folosi „published successfully” drept sinonim pentru „interfață aprobată”. Nu crea celelalte 4 ecrane cu prezentarea respinsă, nu substitui pozele autentice cu siluete SVG impersonale.

**Analiză punctuală în `rta-lab/RTA_ATLAS_DESIGN_BLUEPRINT.md` §15:** reale fotografie/atribuire produse, mobile first cu hero și anim vizibile din primul viewport, interacțiune cu efect vizual vizibil, animații verificate pe screenshot/video multi-frame, nu doar prezența CSS. Dacă nu există posibilitate de a vedea browserul și captura, cere date utile sau folosește Work pentru test vizual; nu afirma că ai văzut exact ecranul telefonului doar analizând sursa.

**NIMIC de refăcut din partea bună:** motorul V10, 620 lichide, TOP3 × TOP3 contextual calculat, 16 platforme / 42 exemplare și fișele celor 3 Dvarw CL, principiile de surse și procente. V0.2 = experiență grafică REALĂ, demonstrabil animată și bine încadrată; **macheta revizuită se aprobă înainte de orice extindere spre Atomizer Atlas, Wire Lab, Market Hall și Duel.**

## 27. Continuarea conversației — V0.2 implementat și publicat, feedback estetic încă deschis (14.10.2026)

**Sursa operațională pentru reluare:** `rta-lab/RTA_CURRENT_HANDOFF.md` (nou); citește înaintea checkpointurilor istorice. **Nu relua de la început** dacă utilizatorul deschide alt fir ori trece în Work. Trebuie conectat/verificat GitHub `andreiclim77-cell/rta`, apoi citite MASTER + `RTA_ATLAS_DESIGN_BLUEPRINT.md` și codul real `main`.

**Actualizare față de §23–26 (care rămân documente istorice):** PR **#43** pentru prototipul Atlas **V0.2** cu fotografii de atomizoare, layout mobil reorganizat și motion reactiv a fost **integrat în `main`**, commit **`935d949fe722fdfaf58d089c02ae15c722b38902`**; Quality Gate pe `main` `38610224639` **SUCCESS**, Pages pe `main` `38610222734` **SUCCESS**. Visual Mobile Gate pe PR `38609948910` **SUCCESS**, capturi în artifact **`atlas-v02-mobile-screenshots`**. Preview separat: `https://ghid-rta.ro/rta-lab/atlas-preview/`. **Interfața existentă V10 nu a fost înlocuită.** Succesul testelor și al publicării **NU** confirmă aprobarea vizuală finală din partea utilizatorului. V0.1 rămâne respins.

**Ultima solicitare a utilizatorului:** „E f bine asa acum spune mi daca incepebo alta discutie ce sa ti spun sa sti sa continui?” — este o solicitare de **continuitate sigură**, nu neapărat un nou verdict UX asupra V0.2. Utilizează mesajul scurt exact din handoff §6. Nu schimba experiența bună, nu inventa review-uri și nu pierde datele canonice.

## 28. Atlas V0.2 — verificare vizuală concretă și corecții incrementale în PR #45 (14.10.2026)

**Continuitate operațională actuală:** citește `rta-lab/RTA_CURRENT_HANDOFF.md` §7, apoi PR `https://github.com/andreiclim77-cell/rta/pull/45`, încă **DRAFT, neintegrat în main**. Separarea de V10 și conservarea catalogului **620**, platformelor **16**, atomizoarelor fizice **42**, **120 Hall of Fame**, celor **5** sloturi și tuturor configurațiilor validate au fost menținute: această intervenție atinge doar `atlas-preview/` și testele sale.

Rezultatul confirmat pe HEAD-ul precedent `90ba8d6a`: RTA Guide Quality Gate `38613486125` SUCCESS; Market `38613486251` SUCCESS; Visual Mobile Gate `38613486194` SUCCESS, cu artifact `11918768376`, capturi vizuale reale examinate pentru Home, Liquid Match, tranziție foto, airflow și fallback. Capturile originale se pot redescărca din GitHub Actions. Pe imaginea GT One au fost observate marginile cu text promoțional al retailerului; corecția exclusiv CSS pentru margini și banda tipărită de sus a fost finalizată pe `c2f33881` și verificată: RTA Guide Quality Gate `38614545140` SUCCESS; Market `38614545066` SUCCESS; Visual Mobile Gate `38614545086` SUCCESS. Artifact final `11918649458` (11 capturi) a fost descărcat și inspectat. Statusul rămâne al commitului `c2f33881`, înainte de eventuale actualizări exclusiv documentare.

Îmbunătățiri incrementale: foto reală afișată integral, carousel motion limitat și controlabil, credite corecte pentru fallback local, TOP1 închis inițial pe mobil, verificare automată 360×800 și 390×844 a încărcării reale a imaginilor și interacțiunilor. Nu se inventează fotografii, recenzii, procente de plăcere sau montări fizice.

**Nu declara publicată această corecție înainte de merge + GitHub Pages SUCCESS pe SHA-ul de merge. Nu declara design aprobat fără review-ul pe telefon al utilizatorului.** Nu începe Atomizer Atlas / Wire Lab / Market / Duel pe un stil încă neaprobat. Handofful §7 este checkpointul operațional detaliat.

## 29. Atlas V0.2 — Quick-Path mobil verificat în PR #45 (14.10.2026)

**Actualizare față de §28:** implementarea V0.2 continuă **doar în ramura PR #45**, fără nicio schimbare a V10, motorului, celor 620 de lichide, 16 platforme, 42 atomizoare, 120 Hall of Fame, fișelor Dvarw CL saved/draft sau configurațiilor validate. Respingerea V0.1 și lipsa aprobării finale V0.2 sunt în continuare valide.

**Problema identificată în 13 capturi reale de mobil:** titlul + scena și formularul împingeau primul rezultat sub viewport; la căutare apăreau două controale de ștergere, iar unele stări selectate rămâneau retezate. La schimbarea stării, `cinemaSwitch` aplica temporar blur întregului panou, inclusiv informației contextuale.

**Rezolvare în `rta-lab/atlas-preview/{index.html,app.js,v02.css,v02.js}`:** scena Liquid Cinema prezintă potrivirea #1 derivată din **același clasament contextual** folosit pentru 3×3, nu un nou motor; linkul din scenă face scroll la primul card vizibil; ierarhia mobilă este condensată fără a elimina controalele 7×5 sau exemplarele de lichide; selecțiile active din rail sunt aduse în aria vizibilă. Inputul ascunde X-ul nativ și are control tastatură combobox; demonstrația airflow rămâne după cele trei rezultate. SVG-ul se mișcă, dar cardul de informație rămâne clar. Scorurile sunt **euristice**, nu procente de plăcere; evidența și cele două watchlist-uri rămân neschimbate.

**Probe efective pentru commit de cod `8ee748f6d1f671898211e03aefa72f2b5216aac1`:** RTA Guide Quality Gate `38616814458` SUCCESS; Market Quality Gate `38616814764` SUCCESS; Atlas Visual Mobile Gate `38616815025` SUCCESS; artifact `11920830826` cu 13 capturi Chromium verificate, inclusiv 360×800 și 390×844, rezultatul contextului, clic rapid, căutare ArrowDown/Enter, fotografie decodată, fallback offline, airflow, selected chips și reduced-motion. Testele nu înlocuiesc aprobarea vizuală pe telefonul real.

**Stare finală a acestei etape:** candidat îmbunătățit pentru review, PR #45 încă DRAFT, nu publicare nouă; site-ul live continuă să servească V0.2 din `main`. Urmează feedback/aprobare explicită → merge PR + verificare Pages/CI pe SHA exact → ulterior portretele Atomizer Atlas și Wire Lab. Celelalte patru ecrane nu se construiesc pe un design neaprobat.

## 30. Mandat până la aplicația completă și preferință KLP (14.10.2026)

Utilizatorul a cerut realizarea progresivă a tuturor celor șase module și continuarea autonomă, fără repetarea istoricului. Pragurile de oprire din §28-29 sunt istorice: construcția poate continua în branch separat, iar deciziile vizuale majore cer aprobare pe rezultate concrete. Nu declarați aplicația finală înaintea tuturor funcțiilor, testelor și publicării verificate. Producția V10, datele, cele 620 lichide, 16 platforme, 42 exemplare și fișele CL rămân conservate.

**Declarație directă nouă:** KLP cu Dicodes NiFe30 sau Zivipf NiFe52 în TC este extraordinar; ambele sunt preferințe personale de prim nivel. Se consolidează preferința deja egală din §20, fără nou A/B controlat, fără scor de plăcere și fără transferul setărilor Dicodes DNA 220°C/16 W la Zivipf.

Checkpoint de cod `1f7050231165f10cbf1b8128946989ee519d9efb`: corecții numai în Atlas și testele sale, rezumat BEST lizibil, motion/pauză și căutare îmbunătățite, copii locale ale fotografiilor GT One/415 cu proveniență. RTA `38619985170` și Market `38619985251` SUCCESS; Visual `38619985373` FAILURE la verificarea pauzei pe 390 px, deși testele locale au trecut. Corecția sincronizării testului și rerularea sunt obligatorii. Detalii și următorul pas: HANDOFF §9. Nu promovați artefactul parțial în acceptare.

### 30.1. Dovezi ulterioare și ramură de extindere

Rerularea pe `a511ef64`: RTA `38620833175`, Market `38620833394`, Visual `38620833502` SUCCESS. Artifact `11921084143`, 23 capturi, descărcat și inspectat; cadrul offline KX prins în animația de intrare nu este acceptat ca probă și a primit o corecție de sincronizare pentru rerulare. PR #45 păstrează scopul mobil. Cele patru module rămase continuă în draft separat `feature/atlas-complete-six-modules-20261014`. Adaptoarele locale Atomizer/Wire au trecut cazuri normale, restricții, erori, CL read-only/legacy, 620 lichide stres și browser mobil/desktop; nu sunt publicate. Motorul/datele/configurările originale nu au fost editate.

## 31. Atlas/Wire — adaptoare în ramura aplicației complete (14.10.2026)

`feature/atlas-complete-six-modules-20261014` continuă separat de PR #45 și main. Atomizer Atlas și Wire Lab sunt implementate local cu motoarele existente: 16 portrete, 42 inventar, ADN/builduri/lichide contextuale, citire CL fără rescriere și configurator de material/aer/geometrie/energie. Restricțiile Asylum SS Clapton și 415 K1 28/6 sunt păstrate; KLP Dicodes 220°C/16 W nu se transferă la NiFe52. Teste normale/erori, toate materialele și obiectivele, 620 lichide stres, CL legacy/read-only, browser mobil și desktop au trecut local. CI/publicarea/aprobarea vizuală rămân separate. Noul draft nu este aplicația finală; Market/Duel și integrarea completă sunt următoarele lucrări autorizate.

## 32. Duel Mode candidat / 14.10.2026

DUEL compară două configurații complete, nu doar două nume de atomizoare. Snapshotul se păstrează la transferul din rezultate și la editare Wire. Diferențele sunt calitative pe semnalele existente; mai multe variabile sunt declarate explicit și nu se atribuie cauzalitate unei singure variabile. Lichid/mood/moment/obiectiv comun, sursa personală și estimarea rămân separate; Watch B nu inventează teste pe buildurile personale. Identice → niciun câștigător; apropiate → verdict neconcludent. 360/390/1440 local PASS, capturi inspectate; CI nou pending. Dovezile exacte Atlas/Wire și branchul sunt în HANDOFF §11.

## 33. Market — proveniență și versiuni, nu consens inventat

24 fișe sursate în patru galerii, separate de catalogul canonic 620. Review singular este eticheta actuală pentru toate. O traducere nu este sursă independentă; trei opinii pe mostrele aceluiași articol Omusa nu devin consens independent. Data afișată a actualizării Ecigclick nu este data articolului inițial. Publicările nedatate rămân explicit nedatate, cu data accesului.

NET simplu descrie o semnătură comercială, nu o demonstrație botanică/chimică; Cavendish rămâne termen de procesare cu caveat. Tutunos simplu/complex sunt clase editoriale de profil, nu dovadă de molecule sintetice. Notele percepute nu sunt automat ingrediente adăugate. Review-urile nu confirmă instalațiile personale, temperatura reală, siguranța sau disponibilitatea actuală.

Asocierea bibliotecii cere cheie exactă brand/nume/linie/clasă și alias editorial explicit; niciun 4Pod nou nu se transferă la extractul clasic, nici Special Blend 3.0/Menthol la versiunea fără sufix. Doar acțiunea explicită Explorează schimbă lichidul, cu versiunea declarată. Watch B leagă review-ul de profil, separat de build. HANDOFF §12 înregistrează dovezile CI și limitele actuale.

## 34. Preferință nouă confirmată GTR — NiFe30/7 + NiFe52/6 (15.10.2026)

Această observație actualizează **numai GTR**, având prioritate față de tabelul istoric §6.2, interdicțiile generale din §10 și baseline-ul NiFe/6 din §20.2. Dicodes RESISTHERM NiFe30 TCR320: **7 spire = preferință GTR actuală**, 6 spire = opțiune validă istorică, dar mai puțin coerentă în ultima experiență TC; Zivipf NiFe52 TCR310: **6 spire = preferință GTR actuală**. Cele două aliaje au prioritate personală egală numai cu geometria proprie; nu sunt fizic identice. Setarea observată pentru noul NiFe30/7: GTR TC pe Dicodes 230°C, 16 W plafon, ~12 W la sfârșitul inhalării, senzație de reglaj normal/coerent; vechiul montaj NiFe30/6 la 230°C pe Dani 21700 afișa circa 6 W la final și părea mai rece. Compararea nu izolează o singură variabilă (coil refăcut/contact/bumbac/calibrare/lichid neprecizate), astfel nu dovedim cauzalitatea spirei suplimentare și nu extrapolăm la toate lichidele.

**Reguli implementate în staging:** `data/sensory-core.js` permite exclusiv pe GTR NiFe30/7 **și** NiFe30/6, NiFe52/6, cu prioritate personală #1 egală pentru NiFe30/7 și NiFe52/6; restul NiFe TC au 6 spire. `data/tc-platform-map.js` și `data/tc-sixwrap-global.js` păstrează excepția GTR în overlay-ul V10 fără crearea unui al șaselea slot. UI Wire Lab explică separat cele două aliaje; presetul GTR NiFe30/7 are 230°C și plafon 16 W ca observație personală, **nu temperatură fizică garantată**. KLP DNA 220°C/16 W rămâne numai cazul KLP NiFe30; KX/K Prime/KLP și Zivipf nu moștenesc 7 spire. Respectă V10 620 repere, Atlas 700 produse, 16 platforme, 42 RTA, 3 CL saved/draft locale. Verificarea CI și a publicării se atașează după execuția efectivă.

## 35. 415 Cool — NiFe30/7 = NiFe52/6 apoi K1 28/6 (15.10.2026)

Această secțiune înlocuiește strict pentru 415 restricțiile istorice din §10 (K1 28/6 „depășit”) și preferința Explorer „K1 Clapton primul” din §11. Se păstrează toate variantele vechi ca istoric reușit; se actualizează prima alegere la **NiFe30 Dicodes/7 = NiFe52 Zivipf/6**, apoi **K1 28 GA/6**. Este o preferință practică personală nouă, fără A/B izolat și fără temperaturi sau wattaje atribuite. GTR NiFe30/7 nu se confundă cu setările noi ale 415; KLP, K Prime și KX au în continuare 6 spire în baseline. **Detalii, limite și consecințe în checkpointul prioritar din capul fișierului.**
