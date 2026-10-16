# RTA SENSORY ATLAS — PRECISION MOTION LAB

## CARD DE CONTINUITATE RTA LAB — HOME, 16.10.2026 (candidat pentru verificare)

La cererea utilizatorului, HOME din `/rta-lab/atlas/` include secțiunea editorială **„Trei comenzi. Nimic pierdut.”** cu trei acțiuni vizibile și exacte:
- **„Du-te în Lab și fă-ți update”** — citește handoff → MASTER → blueprint → protocol, verifică main, CI și ce mai este deschis; nu reface ce e terminat corect.
- **„Salvează”** — persistă atât codul / datele / regulile / QA, cât și documentele canonice și pachetul ZIP portabil din Biblioteca ChatGPT; eșecurile sunt raportate explicit.
- **„Dă-mi arhiva de continuitate la zi”** — pregătește pachetul ZIP complet de reluare într-un chat nou.

Cardul este în `rta-lab/atlas-preview/index.html` + `lab-commands.css` și `lab-commands.js`; release-ul din `rta-lab/atlas/` este generat deterministic din preview. **Butoanele doar copiază comenzile în clipboard** (cu fallback/mesaj vizibil), *nu* execută modificări direct în site. Linkul de sub card deschide `rta-lab/RTA_OPERATING_PROTOCOL.md`, sursa autoritativă. Stil dark editorial, trei coloane pe desktop, un panou per rând pe mobil, stare ARIA live, focus vizibil, mărire font și reduced-motion.

Regresie nouă `tools/check-rta-lab-commands.js` verifică frazele, sursa canonică și funcția de copiere fără efecte ascunse; `tools/check-rta-atlas-layout-visual.js` verifică la toate rezoluțiile, copierea reală și capturi. Workflow-ul permanent `.github/workflows/rta-lab-continuity-snapshot.yml` creează automat un ZIP portabil cu documentele integrale, extrasele esențiale de cod și checksumuri când se schimbă documentele canonice pe `main`; arhiva GitHub Actions nu înlocuiește copia persistentă din **Biblioteca ChatGPT `/RTA_Lab/`**. Confirmă uploadul în Bibliotecă înainte de a promite că există.

**Stare la crearea secțiunii:** branch `feature/atlas-home-lab-command-card-20261016`. Nu declara actualizarea de producție înainte de trei gates CI SUCCESS, PR integrat, RTA post-merge și Pages SUCCESS, apoi arhiva din Bibliotecă verificată. Toate preferințele GTR / 415, Asylum, 16 platforme, 42 unități, 700 lichide Atlas și 620 V10 rămân intacte.

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

## BLUEPRINT DE EXPERIENȚĂ / ARHITECTURĂ UI · v0.1 · 14.10.2026

> **STATUS:** propunere de arhitectură pentru aprobarea utilizatorului. Direcția vizuală și cerințele de produs de mai jos sunt acceptate ca intenție; compoziția concretă, textele, mockupurile și efectele NU sunt încă aprobate. **Acest document nu atestă implementarea interfeței noi.**
>
> **Instrucțiune pentru Work ori pentru orice conversație viitoare:** citește integral această specificație, apoi `rta-lab/RTA_CONTINUITY_MASTER.md` și fișierele de cod existente din `main`. Nu cere utilizatorului să repovestească preferințele. Verifică pe GitHub starea reală înainte de implementare. Dacă există divergență, MASTER și testele fizice confirmate prevalează asupra unei ipoteze de UX. **Nu rescrie aplicația curentă fără machete și aprobare.**

## 0. Definiția proiectului și problema rezolvată

Utilizatorul **își cunoaște deja colecția și a generat personal know-how-ul**. Nu dorește un consultant care îi explică propriile experimente și nici o cronologie a multor încercări vechi, potențial irelevante sau eronate. Produsul trebuie să ofere **o sinteză senzorială premium, vie și explorable, centrată pe cel mai bun rezultat actual, cu două direcții alternative promițătoare**, plus comparații informate și un atlas al sârmelor/atomizoarelor.

### 0.1 Sursa de adevăr actuală, păstrată

- Repo: `andreiclim77-cell/rta`, ramura `main`; aplicație existentă `https://ghid-rta.ro/rta-lab/`.
- MASTER canonic: `rta-lab/RTA_CONTINUITY_MASTER.md`; inventar **16 platforme**, **42 atomizoare fizice**, **620 lichide / repere** din care **120 Hall of Fame**, **5 familii/sloturi de sârme active**.
- Materiale tehnice distincte în familia TC: **Dicodes RESISTHERM NiFe30 TCR320** (5,5 Ω/m confirmat pe rola proprie) și **Zivipf NiFe52 TCR310**. Preferate **egal personal** pe KLP, GTR, Kayfun X și K Prime; apoi Kanthal A1. **Nu sunt același aliaj**.
- Alte repere: GT One **K1 29 GA/6**, apoi 28/5; Muted+ **K1 28/6**; Dvarw CL și FL preferă **insert 3×0,6 mm**; CL **1×1,2 mm + K1 28/5** este și el reușit; FL 3×0,6/K1 28/6 vs 1×1,2/K1/6 pe Balkan Milestone: „palat aproximativ +25%” autoevaluat, TH puțin mai mic, orizont/simultaneitate mai ample; GTR încă oferă plăcere aparte; KLP NiFe30 pe DNA **220°C, limită 16 W** test parțial raportat. Nu generaliza alte condiții.
- Trei exemplare Dvarw CL fizice au **fișe separate saved/draft în stocarea locală a browserului**, nu în GitHub; nu pretinde că datele salvate pe telefon sunt sincronizate.
- Motor actual: `rta-lab/data/sensory-core.js`, `rta-lab/mood-match.js`, `rta-lab/data/bell-liquid-fit.js`, `rta-lab/engine.js`, `rta-lab/sensory-ui.js`. Mood Match are 7 stări × 5 momente și în prezent afișează trei interpretări, nu încă un **TOP 3 atomizoare × 3 builduri** corespunzător noii cerințe. Nu confunda intenția cu funcționalitatea deja livrată.

### 0.2 Identitate vizuală acceptată ca direcție

**PRECISION MOTION LAB** = B, cu **30% atmosferă CINEMATIC ATLAS** (A) și **10% rafinament COLLECTOR'S GALLERY** (C). Dacă folosim ponderi normalizate pentru design: aproximativ **60% B / 30% A / 10% C**; este o direcție artistică, nu metrică precisă.

Personalitate: instrument inteligent, editorial, imersiv dar **foarte rapid pe telefon**. Fundal grafit/antracit; accent teal discret pe semnale analitice; bronz/șampanie pe zone senzoriale; ivory lizibil pentru text. Fotografii licențiate de produs + imagini atmosferice atent dozate + animații SVG/Canvas/WebGL dacă performanța justifică. Nu fum generic peste tot, nu gaming, nu efecte fără informație. Fără falsă precizie mecanică sau termică.

### 0.3 Regulă universală a conținutului

Fiecare rezultat contextual arată:
1. **BEST CURRENT RESULT** — configurație completă, cea mai solidă justificare prezentă, ce oferă senzorial și pentru ce context.
2. **WATCH A — EXTRAPOLARE DIN EXPERIENȚA PROPRIE** — alt setup promițător pe baza ADN-ului, a A/B-urilor și a similitudinilor; etichetat ca ipoteză când nu a fost testat.
3. **WATCH B — SEMNAL REAL DIN PIAȚĂ** — alternativă independentă, susținută de review-uri, comunități și/sau surse tehnice publice reale, cu date și linkuri. Dacă dovezile sunt insuficiente, se afișează **„semnal de piață insuficient”**, nu se inventează consensul.

**TOP 3 builduri** și **BEST + 2 WATCH** sunt două concepte distincte: dacă cele două watchlist-uri coincid cu buildurile #2/#3, se leagă contextual; dacă nu, se afișează note suplimentare, nu se falsifică ordinea. Pe mobil, cardul pornește **COLAPSAT** cu cel mai bun build, celelalte două și watchlist-urile se deschid la cerere.

Prioritatea certitudinii: observație personală pe configurația și lichidul măsurate/declarate → preferință personală actuală → extrapolare explicată → semnale externe verificabile. Certitudinea este distinctă de **plăcerea** subiectivă; plăcerea nu capătă automat un scor numeric.

## 1. Arhitectură globală / navigație

**Șase ecrane interconectate, nu o pagină interminabilă:**
1. HOME — intrare contextuală.
2. LIQUID MATCH — flux principal: lichid + stare + moment → **TOP 3 platforme × TOP 3 builduri**.
3. ATOMIZER ATLAS — 16 identități de platformă, cu cele 42 exemplare fizice ca strat separat.
4. WIRE LAB — cinci familii, două aliaje TC distincte, variații geometrice/termice.
5. MARKET HALL OF FAME — patru clasamente reale, 10 poziții pentru fiecare **doar cu suport probator**.
6. DUEL MODE — două platforme/builduri comparate pentru același lichid/context.

**Mobil:** bară de navigare persistentă cu maximum cinci destinații: Acasă / Lichid / Atomizoare / Sârme / Piață; „Compară” este o acțiune contextuală vizibilă pe fișele de lichid, atomizor și build, plus o intrare distinctă în Home. Duel Mode nu este ascuns într-o listă lungă. Căutarea universală de lichid și întoarcerea la contextul precedent sunt permanente; meniurile nu domină ecranul. Pe desktop: navigație sus + grilă editorială, cu rezultat și dovezi accesibile în paralel.

**Reutilizare, fără destructurare:** toate modulele vechi rămân funcționale într-un branch de staging până la verificarea noii interfețe. La integrare, niciun filtru, lichid, profil TC, acces la arhivă, fixture Mood Match sau fișă fizică CL nu trebuie pierdut. Noul UI nu va substitui valori nevalidate.

## 2. ECRANUL 1 — HOME · „Ce vrei să explorezi?”

### Scop
Nu „configurează” în primul rând, ci oferă acces imediat la **ce vrea utilizatorul să facă acum** și un instantaneu vizual al valorii know-how-ului.

### Compoziție / ierarhie vizuală
- **Top:** logotip simplu „RTA / SENSORY ATLAS”; căutare compactă cu autocomplete; icon „Compară” și indicii discreți despre bibliotecă, fără aglomerare.
- **Hero dominant:** titlul „Ce ai chef să descoperi astăzi?” și un câmp mare „Am un lichid…” → Liquid Match; fundal foto/senzorial viu, nu video mare blocant.
- **Trei căi mari:** „Lichidul meu”, „Atomizorul meu”, „Sârmele și buildurile”. Fiecare cu vizual distinct, o singură acțiune.
- **Rând secundar:** două plăci „40 de titluri din piață — patru TOP 10” și „Duel Mode”, apoi o mini-secțiune „Cel mai bine documentat” cu un exemplu deja confirmat (fără promovarea unei platforme drept câștigător global).
- **Footer utilitar:** căutare completă, arhivă MASTER, stare fișe fizice, accesibilitate și origine surse; informațiile vechi, lungi, în spatele unei acțiuni deliberate.

### Motion / media
- Scurtă compoziție de particule/linii ca **semnătură senzorială abstractă**, cu parallax foarte mic, numai dacă dispozitivul permite; animația introductivă maxim ~1 secundă și niciun ecran de „loading artistic” forțat.
- Carduri cu tranziție 180–280 ms când sunt apăsate; focus tactil limpede; iconul Căutare face fluid trecerea spre rezultatele Liquid Match.
- Foto/ilustrație de laborator premium, fără a prezenta ca fotografii reale produse generate artificial.

### Mobil
La 360–430 px: hero de înălțime controlată, intrarea „Am un lichid” vizibilă fără scroll lung, cele trei acțiuni în ordine verticală; navigație inferioară; cardurile dinamice încărcate leneș după conținutul prioritar.

### Condiție de succes
Utilizatorul intră în Liquid Match în **un gest** și știe în maximum câteva secunde ce poate face aplicația.

## 3. ECRANUL 2 — LIQUID MATCH / LIQUID CINEMA · modul principal

### Scop
Dând un lichid deja ales (din cele 620 sau profil liber), momentul și starea, livrează **3 atomizoare contextual potrivite, fiecare cu 3 builduri reale/configurabile**, cu diferențe senzoriale clare, încadrarea dovezilor și două atenționări constructive.

### Interacțiune: maximum trei gesturi pentru rezultat inițial
1. Căutare lichid/autocomplete, inclusiv în 120 Hall of Fame, ori profil liber explicit marcat fără identitate comercială inventată. Dacă se alege lichidul, identitatea rămâne fixă până la schimbarea explicită.
2. „Moment” (cafea, zi, suc, seară, relaxare) și „Stare” (cele șapte aprobate, inclusiv Magic, Power, Pleasure); se pot precompleta ultimele alegeri fără presupunerea unei preferințe permanente.
3. „Ce vreau mai mult”: armonie/completitudine, TH/ofensivă, simultaneitate, spectru, tobacco-first, palat, finețe; opțional, nu un formular cu 12 câmpuri.

### Structură ecran
- **Partea superioară — Liquid Cinema:** nume + brand din catalog, clasificare verificată și o **scenă senzorială** care pornește numai din taguri/atribute cunoscute. NET complex: straturi animate; tutun simplu: semnătură mai focalizată. Este **vizualizare artistică inspirată de profil**, nu analiză chimică a lichidului.
- **Bandă de context** permanentă: „[lichid] · [moment] · [stare] · [obiectiv]”; oricare element se modifică fără pierderea restului.
- **Trei carduri atomizoare cu rang contextual**. Cardul închis arată: portret produs, rol în acel context, BEST BUILD complet (insert, bell, wire, wraps, Ø, poziție, W/TC când sursa permite), **caracter al vape-ului în limbaj natural**, 2–3 trăsături dominante și certitudinea.
- **La deschidere:** TOP 3 BUILDURI pentru acel atomizor / lichid / context. Fiecare build include feeling (start, palat, spectru, simultaneitate, ofensivă, TH, armonie, note/compromis), aria aerului numai ca geometrie nominală, nu ca debit. Două watchlist-uri distincte: una din know-how + una din piață verificată, cu semnal și caveat.
- **Rezultatul extins:** 3-platform comparison rezumată + buton „Duel” pentru două builduri selectate; acțiune „Deschide acest setup” nu marchează fizic un atomizor ca montat.
- **Proveniență la un tap:** „De ce propune?” → dovezi personale, extrapolări și surse externe, fără afișarea întregii cronologii istorice.

### Ordonare și corectitudine
- TOP 3 platforme este **contextual**, determinist, se bazează pe 16 ADN-uri + lichid + mood/moment; nu există TOP universal. „Redescoperă ceva” rămâne o acțiune editorială separată de podium, nu un loc 3 ales aleatoriu.
- Pentru fiecare platformă, se evaluează configurații COMPLETE și compatibile (bell/air/material/wrap/Ø/poziție/W/TC); nu promova trei variații triviale drept trei builduri radical diferite.
- Dacă nu există dovezi suficiente pentru WATCH B, declară lipsa dovezilor și lasă pentru documentare.
- Comparațiile cu alte lichide se declară extrapolare, nu A/B exact.

### Motion / imagini
- Liquid Cinema: secvență fluidă 0,8–1,2 s, animată SVG/CSS/Canvas, cu pauză statică; respectă profilul redus de mișcare.
- Reveal contextual: cele 3 carduri intră progresiv, dar tapul poate întrerupe tranziția; fără ecrane de așteptare artificiale.
- Pe un card, comutarea 3×0,6 vs 1×1,2 schimbă **schematic** harta jeturilor; randare stilizată și explicit „ilustrație tehnică, nu simulare CFD”.
- Graficele se interpolează doar la datele existente; fără animație care sugerează procente de plăcere fabricată.
- Imagini: fotografie reală/licențiată atomizorului, plus vizualuri atmosferice originale de tabac/note aromatice (dacă drepturile sunt clare).

### Mobil
Primul ecran conține lichid + moment/stare într-un control compact și un singur **card TOP 1** cu indiciu clar „Mai sunt două”. TOP 2/3 apar la scroll natural sau într-un carusel accesibil cu etichete; fiecare card e expandabil, nu nouă pagini dense. Toggleul „Vezi 3 builduri” nu schimbă accidental lichidul sau modul activ. Un buton persistent „Compară” e activ când există cel puțin două selecții.

## 4. ECRANUL 3 — ATOMIZER ATLAS · identitate, nu arhivă de experimente

### Scop
Prezintă cele **16 platforme** ca portrete premium și diferențiază ulterior **42 exemplare fizice**; explică ADN-ul, lichidele favorizate, materialele și cele trei builduri contextual optime, fără a impune istorie lungă.

### Compoziție
- **Catalog vizual:** 16 portrete identificate exact, filtre după rol senzorial, tip airflow, tipuri NET/tutunoase și nume; nu inventa clopote, culori sau SKU.
- **Portret deschis:** fotografie mare reală/licențiată a modelului / vizual tehnic dacă lipsește foto; alături o propoziție „Semnătură senzorială”.
- **ADN cinematic lizibil:** spectru, focus, separare, simultaneitate, palat, TH, ofensivă, armonie; plăcerea numai ca relatare personală, nu scor heurist. Comutare între „Ce știm” și „Ce estimăm”.
- **Ce lichide îi vin natural:** patru familii de lichide (tutunos simplu, tutunos complex, NET simplu, NET complex), subcategorii de tutun documentate și potriviri reale din catalog, cu mențiunea „model orientativ” când este cazul.
- **Materiale compatibile / diferențe între materiale:** K1 28, K1 29, K1 Clapton, SS Clapton, familia NiFe cu TC separat; compatibilitatea materialului ≠ preferință validată. Pe KLP/GTR/KX/Prime NiFe30 = NiFe52 ca **preferință**, nu aliaj.
- **BEST BUILD + 2 WATCH**, plus TOP 3 builduri la lichidul/contextul ales. Nu afirma același TOP 3 indiferent de lichid și stare.
- **Exemplare fizice:** acces secundar „Exemplarele mele”. Pentru Dvarw CL se reutilizează CL1/CL2/CL3 saved/draft local, fără autoasignare de hardware. Celelalte 39 de exemplare pot avea fișe în viitoare etape, fără a declara funcționalitate actuală inexistentă.

### Motion / media
- Portret produs cu mișcare foarte fină de lumină la scroll, nu model 3D fals dacă nu avem geometrie.
- **Exploded airflow sketch**, animație a poziției coilului și direcției jeturilor pe date bine documentate; markere „diagramă explicativă, nu simulare de debit”.
- Radar/bare ADN trec fluid între lichid sau build; reducere automată pe mobil slab.
- Dacă se selectează două platforme, aceeași vizualizare sincronizată se transferă în Duel.

### Mobil
Fotografie hero + ADN pe prima vedere, apoi panouri „Best build”, „Lichide”, „Wire & TC” și „Exemplare”. Conținut vertical din care se poate reveni la listă cu poziția păstrată; nu transformăm într-un tabel de 16 rânduri mici.

## 5. ECRANUL 4 — WIRE LAB · manualul viu al materialelor și setărilor

### Scop
Explică **cum poate influența fiecare variabilă vape-ul**, diferențiind geometria calculabilă de reacția termică aproximată și de senzația subiectivă. Nu preface ilustrările în măsurători.

### Identitatea materialelor (5 familii; 6 variante)
- **Kanthal A1 28 GA** — WATT; 5 și 6 spire în condițiile aprobate; Ø și contact/spaced numai unde modelul și observația justifică.
- **Kanthal A1 29 GA** — WATT; 5 contact sau 6 contact contextuale; varianta **29/5 distanțată rămâne eliminată**.
- **K1 Clapton 2×30+38** — WATT; baseline 5, preferință consacrată pe 415.
- **SS316L Clapton 2×30+38** — WATT, cu posibilitate de TC SS numai dacă sunt documentate mod compatibil, TCR/TFR și configurația; nu aplica setări NiFe la SS. Pereche FL contextuală.
- **Familia NiFe TC:** **Dicodes NiFe30 TCR320** și **Zivipf NiFe52 TCR310** distincte, ambele în presetul actual Ø2,5/6; nu numi posibilitatea WATT o recomandare și nu declara TC fiziologic sigur la o setare; KLP Dicodes DNA 220°C/16W este caz personal, nu universal.

### Compoziție
- **Galerie macro a materialelor:** identitate + stare confirmată/prior personal + platforme pe care se potrivesc.
- **Interfață de laborator:** selectezi platforma, lichidul (opțional), aliajul, Ø, spire, contact/spacing permis, poziție, insert/clopot, WATT/TC și W/°C într-un singur spațiu de lucru; controalele invalide sunt dezactivate și explicate.
- **Coil Viewer animat:** reprezentare schematică cu numărul corect de spire și footprint estimat; pentru airflow, câte un jet vizual pentru fiecare punct al insertului; W/TC schimbă schema de control, nu afirmă temperatura reală a coilului.
- **Panel „Ce câștig / ce pierd”:** arată cum s-ar putea modifica focus, palate, TH, simultaneitate, spectru și armonie, cu etichete „observat”, „extrapolat”, „fizic calculabil” și posibile compromisuri. Nu afișa procent pentru scoruri 1–5.
- **Trei builduri relevante** pentru materialul și platforma alese; primul cu probă personală când există, plus cele două watchlist-uri semnalizate.
- **Comparație două setări:** blochezi toate variabilele cu excepția uneia, pentru A/B explicabil; dacă utilizatorul modifică mai multe, UI semnalizează că nu se poate atribui cauzalitatea doar uneia.

### Motion / imagini
- Macrofotografii verificate ale materialelor, reprezentări vectoriale 3D stilizate ale coilului (nu fotografie falsă a produsului).
- 5→6 spire = adăugare animată a unei spire, cu schimbarea lățimii calculate; Ø schimbă curbura; contact/spaced doar unde este permis.
- 1×1,2 vs 3×0,6 = schematică animată a distribuției aerului. Aria nominală poate fi calculată, nu deduce debit sau răcire reală universală.
- WATT↔TC = schimbare fluidă a diagramei de control; limită de putere ≠ putere efectiv aplicată constant.

### Mobil
Control principal: material/platformă; restul în sertare explicite „Geometrie”, „Aer”, „Energie”; viewerul rămâne vizibil/sticky la scroll scurt fără să ocupe tot ecranul. Buton „Compară setările” fără a pierde prima configurație.

## 6. ECRANUL 5 — MARKET HALL OF FAME · 4 × TOP 10 verificabile

### Scop
Dedicat **40 de poziții editoriale potențiale**, în patru categorii: **NET simplu, NET complex, tutunos simplu, tutunos complex**. Clasamentele vin din piața reală, **nu** din ordinea celor 620 repere și **nu** din inventarea a 40 de nume populare.

### Cercetare obligatorie înainte de orice „TOP 10”
- Strânge surse **datate, reale și accesibile**: review-uri independente, comunități publice cu experiențe repetate, review-uri de specialitate, mențiuni producători pentru date tehnice, recenzii comerciale marcate ca posibil părtinitoare.
- Identifică lichidul cu producător, versiune, tip NET/sintetic, categorie; nu confunda aroma concentrată cu ready-to-vape, denumiri omonime, sortimente retrase sau descrieri comerciale.
- Definiție editorială explicită a celor patru clase (mono/complexitatea amestecului și natura NET/sintetică) și termenii ambigui consemnați ca atare. Nu afișa „disponibil acum” fără sursă actuală.
- Pentru fiecare nume: cel puțin o dovadă verificabilă cu URL/titlu/data accesării; pentru calificativ **„consens de piață”**, cere confirmare independentă în mai multe surse, altfel etichetează **„mențiune/review singular”**. Nu construi un eșantion numeric fake din comentarii.
- Dacă într-o categorie nu sunt 10 lichide susținute suficient, **afișează mai puține și explică lipsurile**; locul #10 nu se umple fictiv. Revizie periodică cu data ultimei cercetări.
- Niciun „TOP” nu devine adevăr obiectiv ori recomandare medicală; posibil bias geografic/limbă, evoluție de lot, preferințe regionale. **Nu manipula recenziile**.

### Compoziție
- Patru galerii: NET simplu / NET complex / Tutunos simplu / Tutunos complex. Fiecare are top 10 verificat, sortare după baza publică a reputației, fotografie/producător legitim și prezentare editorială concisă.
- Card de lichid: **profilul aromelor**, de ce are reputație, ce spun sursele efectiv, grad de încredere (calitativ, nu probabilitate), data și trimiteri.
- Buton „Explorează în colecția mea”: identificare cu catalogul existent ori marcaj **„nu este în biblioteca actuală”**; dacă nu se găsește nu se adaugă automat ca al 621-lea.
- Pentru fiecare lichid cu profil suficient: propunerea separată a 3 atomizoare și 3 builduri în Liquid Match, cu marcaj clar că acestea sunt extrapolări tehnico-senzoriale, nu afirmații ale reviewerilor despre configurațiile personale ale utilizatorului.

### Motion / imagini
- Galerie tip „viniluri/ediții de colecție” cu iluminare discretă; tranziții scurte între patru categorii.
- Mică animație tip „source trail” când deschizi „De ce este în top”; nu prezintă popularitatea inventată ca grafic măsurat.
- Fotografii oficiale/licențiate; nu „photoshop” ale sticlelor cu logo greșit.

### Mobil
Taburi orizontale cu cele patru categorii, listă verticală de fișe; pe card doar profil + sursă dominantă + link către Liquid Match; detalii de dovezi la apăsare, fără scroll orizontal obligatoriu.

## 7. ECRANUL 6 — DUEL MODE · comparație contextuală explicabilă

### Scop
Compară două **configurații complete** (atomizoare diferite sau builduri din aceeași platformă) pentru același lichid, moment și stare, arătând **doar diferențele susținute** și compromisul real.

### Compoziție
- Două sloturi „Stânga / Dreapta”: atomizor, clopot, insert, wire, wraps, Ø, poziție, WATT/TC. Când vine din Liquid Match, păstrează exact configurațiile, nu recalcula la fiecare tranziție.
- Bara fixă de context: lichidul, momentul, starea, obiectivul. Se pot compara două lichide numai în modul exploratoriu special, marcat cu avertisment că variabilele nu mai sunt controlate.
- **Două portrete față în față** sau unul peste altul pe mobil; indicatori calibrați pe aceeași scară: spectru, simultaneitate, separare, palat, TH, ofensivă, armonie.
- Panoul „Diferența care contează”: 2–4 diferențe calitative puternice; semnal despre ce variabile s-au schimbat (de ex. insert și spire împreună), neatribuind cauzalitate când nu e izolată.
- BEST CHOICE numai pentru contextul ales, cu certitudine; nu un verdict global definitiv. Dacă datele sunt prea apropiate, recomandă alegerea după caracter, nu inventează câștigător.
- Două watchlist-uri utile când există; detaliile pieței au link și dată.

### Regula fermă a procentelor
- **Arată procent numai când diferența este >10%, există o bază comparabilă justificată, sursa numerică este reală, iar variabila/proprietatea este definită.** Exemplu admis: „palat ~25% mai bogat perceput pe Balkan Milestone, declarație personală” pentru exact configurația relevantă, **nu pentru alt lichid**.
- Scoruri interne ordinale 1–5, bonusuri heuristice, desene „radar” și clasamente de potrivire **nu se convertesc în „TH +17%” sau „plăcere +26%”**.
- Sub 10% sau măsurare nesigură: se arată „aproape identic”, „ușor”, „diferență neconcludentă” după evidență; fără procente cosmetice.
- Un 12% declarat pe un alt lichid nu se transferă automat. Procentul este mereu însoțit de **ce comparăm, pe ce lichid, cine a raportat și care sunt condițiile lipsă**.

### Motion / mobile
- Split-screen cu tranziție sincronizată între configurații, grafice care se rearanjează pe schimbări reale; buton „Arată numai diferențele importante”.
- Mic „before/after” airflow/coil, în pereche; activarea reduce automat mișcarea atmosferică pentru lizibilitate.
- Mobil: două carduri verticale și un panou sticky „Vezi diferențele”, nu două coloane înghesuite.

## 8. Sistem media / motion comun tuturor ecranelor

### 8.1 Taxonomie
1. **Foto produs** — imagini autentice, de preferat de la producători sau surse cu drepturi/licențe clare; fiecare model identificat fără confuzii.
2. **Atmosferă lichid/mood** — artă originală, sugestivă, bazată numai pe profilul cunoscut; nu ambalaje/review-uri fabricate.
3. **Motion explicativ** — SVG/Canvas pentru airflow, coil, straturi aromatice, comparații; nu CFD, nu temperatură măsurată.
4. **Motion funcțional** — navigație, interschimbare de build, expand/collapse, feedback schimbare context.
5. **Vizualizare date** — comparabile, originile datelor și certitudinea; nu imagini care simulează dovezi absente.

### 8.2 Buget și accesibilitate propuse, supuse probelor
- Tranziții UI uzuale **180–350 ms**; reveal cinematic max **~1,2 secunde**, opțional și întrerupt la prima interacțiune; nu se reia compulsiv la fiecare vizită.
- Preferă `transform` și `opacity`, stratificare minimă, lazy-loading foto AVIF/WebP și fișiere SVG vectoriale; scene grele video/WebGL numai la nevoie demonstrată și doar pe dispozitive capabile.
- **`prefers-reduced-motion`**: oprește parallax, particule, boucle cinematice și interpolații lungi; înlocuiește cu cadre statice cu aceleași informații. Video fără autoplay audio; nu forța efectele de fum.
- Minimizare scroll inutil; fiecare scenă trebuie să ajute orientarea, explicația sau atmosfera. Motion-ul și imaginile nu trebuie să degradeze responsive/offline PWA.

## 9. Proveniență, reguli de adevăr și separarea datelor

Pentru orice afirmație publicată modelul de date include, dacă sunt cunoscute: `claim`, `scope` (lichid, atomizor, build, airflow, clopot, W/TC, dată), `evidenceType` (own-tested / own-declared / technical-model / market-review), `sourceUrlOrNote`, `publicationOrTestDate`, `confidenceText`, `limitations`. Nu deduce proprietăți chimice din estetica unei imagini.

Trei priorități:
- **Proveniența înaintea procentului.**
- **Configurația completă înaintea clasamentului.**
- **Ultima observație personală relevantă înaintea istoricului vechi**, fără a șterge dovezile vechi din arhiva canonică.

Un modul de pregătire a dovezilor poate extrage BEST + WATCH A + WATCH B din MASTER și sursele publice **numai după normalizare și verificare**; istoricul integral nu apare pe ecranul principal. Market reviews nu intră în „personal confirmed”.

## 10. Componentizarea și fluxul aplicației (țintă, nu implementare existentă)

**State manager comun:** `selectedLiquid`, `selectedMood`, `selectedMoment`, `selectedObjective`, `selectedAtomizer`, `selectedPhysicalUnit`, `selectedFullBuild`, `duelLeft`, `duelRight`. Orice trecere între ecrane păstrează contextul; niciun click în Market nu substituie automat lichidul utilizatorului.

**Servicii funcționale de reutilizat/îmbogățit:**
- `LiquidCatalog` pentru 620 repere, filtre și identificare exactă.
- `SensoryProfile` din core fizică/model; păstrează cele cinci dimensiuni și sursele.
- `ContextualMatch` pentru TOP3 platforme x TOP3 complete builds, cu rezultate deterministe și excepții probate.
- `PersonalEvidence` pentru BEST + Watch A, fără istorie inutilă.
- `MarketEvidence` pentru Watch B și 4 x TOP10, surse datate și review-uri.
- `WireGeometryView` pentru mișcare explicativă declarată schematică.
- `PhysicalUnits` adaptor care folosește datele CL saved/draft existente; nu creează montări fictive.
- `DuelComparator` cu aceeași bază și filtru procente fundamentate.

**Design tokens și componente:** navigație principală, search universal, card platformă, build card, watchlist A/B, evidence drawer, scene visual, animated airflow, ingredient notes, radar/descriptive bars, Duel selectors, source citation chips. Un singur sistem vizual pentru toate ecranele.

## 11. Plan de execuție cu aprobare etapizată

**Starea la redactare: NU modificați încă aplicația productivă.**

1. **Faza de arhitectură — ACUM:** discuție în același fir; prezintă aceste șase ecrane; utilizatorul corectează ierarhia și conceptele. Salvează doar specificația în GitHub, fără JavaScript/CSS/HTML funcțional modificat.
2. **Machete vizuale mobile** (minim Home + Liquid Match + Atomizer + Wire, apoi Market și Duel): 2–3 cadre pentru fluxul esențial; prezintă inclusiv motion prin storyboard ori prototip animat, nu doar imagini statice. Aprobarea utilizatorului înaintea refactorizării.
3. **Prototip funcțional pe branch/staging separat**, inclusiv assets foto licențiate. Feature flags / fallback la UI V10 existent, fără downtime.
4. **Liquid Match 3×3** verificat cu toate 7 moods × 5 moments și 620 lichide; sursa percent și certitudinea separat.
5. **Atomizer Atlas + Wire Lab**, apoi **Market Hall of Fame** după cercetare reală a 40 de poziții, apoi **Duel Mode**; motion/responsive comun.
6. **Audit de regresie**: 16 platforme, 42 fizice, 620 catalog, 120 Hall of Fame existente, două aliaje TC distincte, 3 CL saved/draft, KLP DNA 220/16 fără transfer către NiFe52, setupuri CL, Dvarw FL 3×0,6/Balkan, GT One 29/6, Muted 28/6; topuri contextuale și A/B fără procente fabricate.
7. **QA real în browser și pe telefon** după teste automate: touch, scroll, orientare, back, focus, reduced motion, loading/performance, PWA cache, offline, transfer Mood Match. CI verde nu este probă de UX. Publică numai după acord, merge pe `main`, apoi confirmare GitHub Pages la SHA exact.

## 12. Protocol de continuitate și tranziție spre Work

- **Discuția actuală rămâne locul de proiectare și aprobare.** Dacă interfața ChatGPT permite alegerea Work în **același fir**, fă tranziția aici; nu pretinde că toate client/app modes garantează aceeași vizualizare sau capacitate automată de transfer.
- Dacă Work pornește o sesiune separată, îi este suficient acest pachet de continuitate **verificat în repo**, fără ca utilizatorul să repete toate preferințele:
  1. `rta-lab/RTA_ATLAS_DESIGN_BLUEPRINT.md` (**această specificație, cu status și decizii de UI**)
  2. `rta-lab/RTA_CONTINUITY_MASTER.md` (**istoricul canonic al know-how-ului, actualizat**)
  3. `rta-lab/data/sensory-core.js`, `rta-lab/mood-match.js`, `rta-lab/data/bell-liquid-fit.js`, `rta-lab/engine.js`, `rta-lab/sensory-ui.js`, `rta-lab/index.html`, `rta-lab/sw.js` (codul actual, care NU trebuie recreat).
- Cere Work să verifice **HEAD pe main**, fișierele și CI înainte de modificare; să respecte ce este aprobat față de ce este **propunere**; să construiască întâi prototip vizual; să nu atingă producția prematur.
- Prompt compact de pornire, când va fi nevoie: „Continuăm RTA Precision Motion Lab pe baza `andreiclim77-cell/rta`. Citește integral `rta-lab/RTA_ATLAS_DESIGN_BLUEPRINT.md` și `rta-lab/RTA_CONTINUITY_MASTER.md`, verifică HEAD/main și testele. Respectă direcția B + 30% A + 10% C, cele șase ecrane, motion/media, BEST+2 Watch, TOP3×TOP3, procent >10% numai probat. Începe cu machetele pe mobil, nu rescrie încă producția.” 
- **Nu transfera presupuse date private de stocare CL** din browser în repo și nu le considera prezente în Work. Clientul poate avea nevoie să le exporte voluntar într-o etapă ulterioară.
- La fiecare etapă ulterioară actualizează acest blueprint (status aprobat, machete, UI tokens, decizii și acceptanțe) **și MASTER**, apoi anunță clar ce este gata, ce nu și care este următorul pas.

## 13. Criterii de acceptare pentru machete

- Pe telefon, **„am un lichid” → TOP3 platforme/3 builduri per platformă** are sens la prima vedere, fără scroll sau formulare excesive.
- Formatul BEST + 2 WATCH este vizibil, dar sursele externe sunt reale; un WATCH B necercetat **nu este prezentat ca fapt**.
- Fiecare atomizor are portret, ADN, lichide favorizate, materiale și builduri contextuale; există distincție între platformă și exemplar fizic.
- Fiecare sârmă are mod permis, construcție, controale, influențe explicate și viewer animat schematic, cu restricții pentru TC.
- Piața are patru categorii cu 10 poziții doar dacă recenziile publice oferă bază probatorie; fiecare cu proveniență accesibilă.
- Duel compară aceleași condiții, arată doar diferențe motivate și procente >10% **numai când au bază reală**.
- Motion este demonstrat efectiv în prototip (nu doar promis în text), cu accesibilitate și static fallback; imagini reale identificabile și assets legale.
- Nu apar clasamente absolute ori procente de plăcere inventate. Vechea aplicație funcțională rămâne disponibilă până la înlocuire aprobată.

---

**Ultima decizie confirmată de utilizator:** să proiectăm cele șase ecrane în conversația curentă, păstrând continuitatea pentru viitorul Work; identitatea vizuală Precision Motion Lab + atmosferă cinematică 30% + rafinament Gallery 10%; multe imagini și motion relevant; istoricul exhaustiv NU este prezentat; BEST + două atenționări, piață verificată, TOP3 atomizoare × TOP3 builduri, Atlas atomizoare, Wire Lab, 4×Top10 și Duel. **Următorul pas:** aprobarea/ajustarea structurii, apoi machete vizuale mobile cu motion demonstrabil.
## 14. Implementarea machetei vii HOME + LIQUID MATCH (14.10.2026) — PREVIEW, nu produs final

**Status:** prototip funcțional în ramură separată, de evaluat vizual de utilizator; **nu** înlocuiește UI V10. Adresă țintă numai DUPĂ merge + GitHub Pages SUCCESS: `https://ghid-rta.ro/rta-lab/atlas-preview/`.

**Fișiere noi:** `rta-lab/atlas-preview/index.html`, `styles.css`, `app.js`. Resurse canonice importate relativ din `rta-lab/data`: 16 platforme, 620 lichide, 5 familii de sârme, `bell-liquid-fit.js`, `sensory-core.js` și `mood-match.js`. Motorul existent rămâne neatins.

**Ce există deja în această machetă:**
- Home premium cu ilustrație SVG originală, straturi vizuale, animații de vapori stilizate, microinteracțiuni, 16/42/620, navigație activă și carduri pentru viitoarele module;
- Liquid Match cu căutare reală din toate cele 620, 3 sugestii rapide rezolvate din catalog, 7 moods și 5 momente selectabile, vizualizator „Liquid Cinema” artistic animat;
- rezultate **TOP 3 platforme contextuale** din `moodEngine.recommend().ranked.slice(0,3)` (NU „slot de redescoperire” aleatoriu), cu **TOP 3 builduri** generate separat pentru fiecare platformă din `sensory-core.rankBuilds`; setările complete, descrieri senzoriale euristice și scheme SVG animate distincte per build;
- două note la fiecare atomizor: una extrapolată din alternate builds disponibile și una „piață neinvestigată încă”; **fără review-uri inventate**;
- demonstrație motion real CSS/SVG, `prefers-reduced-motion`, layout mobile cu navigație jos, acces la V10 vechi, fără date noi adăugate în catalog;
- afișare zero procente artificiale din scoruri, mențiuni explicite despre certitudine și diferența dintre machetă, simulare și A/B direct.

**Ce NU înseamnă această machetă:** nu conține fotografii finale ale fiecărui RTA (portretele sunt **siluete originale schematice, clar etichetate**, în așteptarea unor imagini autentice/licențiate), nu oferă încă 4×TOP10 verificate și nici interfețele Atomizer Atlas, Wire Lab, Market și Duel; acestea sunt faze ulterioare. Nu afirmă că a fost testată pe un dispozitiv mobil real.

**Testare:** `tools/check-rta-atlas-preview.js` validează cele 140 scenarii 4 clase × 7 mood × 5 moments, cele trei platforme distincte cu trei builduri valide, catalog 620, lipsa procentelor fabricate, căutarea, ordinea scripturilor, motion și reduced-motion; este conectat la Quality Gate. GitHub Pages poate eșua independent de CI; numai raportul de deploy SUCCESS la commitul curent permite distribuirea linkului ca versiune publicată.

**Următorul pas:** validarea QA și deploy, apoi utilizatorul testează prototipul mobil și dă feedback specific asupra imaginilor, mișcării, structurii TOP 3×3 și impresiei „WOW”. Se ajustează numai prototipul, nu aplicația V10.

## 15. REVIEW UTILIZATOR — PREVIEW V0.1 RESPINS VIZUAL (14.10.2026)

> **DECIZIE FERMĂ:** utilizatorul a deschis `/rta-lab/atlas-preview/` și l-a respins ca experiență vizuală: „Nu e reală deloc, iar animată iar nu e și nici bine încadrată… arată banal”. **NU este aprobat.** Nu îl prezenta ca interfață nouă, nu construi restul celor patru ecrane peste această direcție vizuală, nu pretinde că QA automat înseamnă UX validat. Motorul existent și V10 rămân păstrate.

### Cauze vizibile în cod, de corectat
- **Imagini false/abstracte:** profilul produsului vine din `renderAbstractAtom()`, generând siluete SVG similare, nu fotografii ale atomizoarelor deținute. Ecranul trebuie construit în jurul **imaginilor reale și corect atribuite de la producători** sau fotografiilor utilizatorului, când sunt disponibile și drepturile de utilizare o permit. Ex.: imagini oficiale Kayfun Lite Plus 2021 (SvoëMesto), Dvarw (KHW Mods), Taifun GTR (SmokerStore). Pentru produse fără fotografie, marchează explicit „imagine încă indisponibilă” — nu pretinde că o siluetă generată reprezintă produsul exact.
- **Animație aproape invizibilă / cosmetică:** prototipul folosește `@keyframes atomFloat` (~8 s/8px), `flowPaths` și `drawWave` fără mecanism clar de scene storyboard/interacțiune. Faptul că CSS include keyframes NU dovedește motion semnificativ văzut de utilizator.
- **Încadrare mobilă:** `hero-stage` este fixat la 260px sub hero-copy pe ecrane mici; `hero-art` are viewport 480×510 cu înălțime forțată; scena `.live-scene` este afișată DUPĂ panoul lung de mood/moment și devine invizibilă în primul viewport. Layoutul trebuie gândit de la 360×800 și ~390×850 în sus, verificat prin screenshot real înainte de livrare.

### Criterii obligatorii pentru V0.2 înainte de alt link
1. Realism: vizuale verificabile pentru produsele reale; portret fotografic încadrat corect, `object-fit: contain` și zone de siguranță; nu folosi nume de produs peste fotografie nepotrivită.
2. WOW demonstrat: **cel puțin două mișcări semnificative, văzute imediat și declanșate de acțiune** — (a) schimbarea lichidului transformă scena senzorială, (b) schimbarea insertului/coi­lului schimbă vizibil schema airflow/spire. Dacă nu se poate demonstra prin video/captură multi-frame, nu afirma că „este animat”. Respectă `prefers-reduced-motion` și oferă control clar dacă dispozitivul reduce implicit animațiile.
3. Compoziție mobilă: captura/simularea `360×800` și `390×844` arată titlu, imagine bine încadrată și prima acțiune/primul rezultat **fără scroll interminabil**, fără decupaj, text suprapus sau controale sufocate. Navigație permanentă discretă.
4. Vizualizare în browser: Playwright/Chromium capturi în mobile viewport, screenshot înainte/după interacțiune, clip scurt demonstrativ dacă există posibilitatea, test de scroll/orientare/focus. Testele logice (140 contexte/3×3/620 lichide) rămân neschimbate. **Nu înlocui vizualizarea reală cu test de prezență CSS**.
5. Abia după prezentarea machetei V0.2 și aprobarea explicită a utilizatorului începe extinderea Atomizer Atlas / Wire Lab / Market / Duel. Nu face „cosmetizare” superficială a V0.1 dacă trebuie regândite compoziția și limbajul vizual.

**Păstrăm ce e bun:** motor RTA, 620 lichide, 16 platforme, fișele celor 42 de exemplare, 3 CL saved/draft, calculele 3×3 și proveniența corectă. **Respingerea privește înfățișarea, mișcarea și felul de a prezenta**, nu algoritmul deja verificat.

## 16. Implementare V0.2 și reluare sigură (14.10.2026)

**Suprascrie statusurile vechi strict pentru progresul V0.2:** Prototipul este implementat în `rta-lab/atlas-preview/`, cu resurse foto `photo-sources.js`, CSS `v02.css` și JS motion `v02.js`. PR #43 merged în `main` la commitul `935d949fe722fdfaf58d089c02ae15c722b38902`; testele RTA și deploymentul Pages sunt **SUCCESS**; Visual Mobile Gate a produs capturi reale în artefactul `atlas-v02-mobile-screenshots`. **V0.2 este publicat tehnic, dar nu a primit confirmarea finală a utilizatorului asupra aspectului.** V0.1 rămâne respins.

**Noua ordine la reluare:** citește `rta-lab/RTA_CURRENT_HANDOFF.md` → MASTER → acest blueprint → ultimele fișiere din `main`; verifică SHA și rezultatele, nu reimplementa. Păstrează V10. Următorul pas: feedback vizual V0.2 pe telefon, apoi ajustări țintite; numai după aprobare extinderea celor patru ecrane rămase.

## 17. V0.2 — checkpoint de rafinare în staging / PR #45 (14.10.2026)

Designul V0.2 din §16 este deja implementat și publicat separat, **dar nu aprobat încă estetic pe telefon**. PR #45, `feature/atlas-v02-mobile-qa-fallback-20261014`, corectează doar detalii auditate vizual. Modificările rămân pe branch, fără a modifica V10 ori motorul.

**Constatări din screenshoturi reale** (Artifact `11918768376` din Atlas Visual Mobile Gate `38613486194`, SUCCESS pe `90ba8d6a`): scena HOME 360/390 are fotografie de produs și CTA în primul viewport; cadrele Liquid Match includ scenă și context fără overflow; controalele airflow 1/3 se diferențiază. Fotografia retailerului pentru GT One cuprinde text publicitar în stânga și necesită mascarea marginilor, nu înlocuirea modelului. În `v02.css` a fost aplicat un vignette și un strat discret pentru banda publicitară de sus, fără a ascunde produsul. Corecția de cod `c2f33881` a trecut Visual Mobile Gate `38614545086`, RTA Guide Quality Gate `38614545140` și Market Quality Gate `38614545066`, toate SUCCESS; artifact final `11918649458` a fost descărcat și inspectat. Aceste rezultate privesc commitul de cod indicat; documentația modificată ulterior se verifică separat.

**Criterii suplimentare automate**: 360×800 și 390×844; decodare efectivă `img.complete && naturalWidth>0`; `object-fit:contain` pentru fotografie; CTA peste navigația de jos; carduri inițial comprimate pe mobil; schimbări foto și un/trei jeturi; scenariu de indisponibilitate a gazdei externe cu asset local existent și credit real; reduced-motion oprește autoplay dar păstrează selectarea manuală. Aceste verificări nu substituie capturile reale și validarea personală Samsung.

**Decizia ulterioară:** nu extinde celelalte patru module până la validarea vizuală. Nu integra PR #45 în `main` și nu declara publicate aceste corecții până la aprobarea explicită și Pages SUCCESS. Nu include reclame ori text imprimat nedorit în zona principală dacă se poate evita fără a falsifica imaginea. Drepturile de reutilizare ale fotografiilor externe rămân un punct de verificat.

## 18. V0.2 — Liquid Match „Best at First Sight” / criterii verificate în staging (14.10.2026)

**Sursa:** PR #45 (DRAFT), branch `feature/atlas-v02-mobile-qa-fallback-20261014`; V10 și `main` neschimbate. Completează §16–17, fără a rescrie ecranele bune.

Înainte: în captura reală de 360×800, Liquid Cinema era vizibil, dar primul rezultat urma numai după un formular lung; browserul adăuga încă un buton X, chipul selectat putea fi parțial mascat și reactivitatea aplica blur asupra textului. Acum pe mobil: un intro editorial compact, scenă animată cu **BEST CONTEXTUAL calculat din motor** (nu câștigător universal), acces direct la cardul TOP 1, chip activ adus în rail și interfață de căutare cu tastatură/ARIA. Scena nu estompează etichetele când se schimbă lichidul/moodul. Rezultatele 3×3 apar înaintea ilustrației airflow. Nu este o simulare termică, un nou scoring ori un transfer al observațiilor personale de pe alt lichid.

**Criterii automate completate în `tools/check-rta-atlas-preview.js` și `tools/check-rta-atlas-visual.js`:** potrivirea #1 afișată = primul element din `RTA_ATLAS_PREVIEW.compose`; poziție în viewport mobil; chip activ vizibil; listă tastatură ArrowDown/Enter; primul card efectiv vizibil după buton; ordinea `resultsSection` înainte de `air-demo`; absența blurului pe panou; regresiile preexistente pentru 140 contexte, 620 lichide, 3×3, 16 platforme, fotografii reale și fallback. Rulările pe commitul de cod `8ee748f6`: RTA `38616814458`, Market `38616814764`, Visual Mobile `38616815025` — toate **SUCCESS**; artefact `11920830826` descărcat și comparat în 13 capturi. Statusul aprobat estetic rămâne **NU**.

**Prag de acceptare în continuare:** fotografie și rezultate îngrijite pe Samsung real + feedback utilizator; apoi se poate integra PR, verifica Pages SUCCESS și trece la Atomizer Atlas și Wire Lab. Drepturile pozelor externe nu au fost certificate prin testele tehnice.

## 19. Mandat curent pentru toate modulele și QA suplimentar (14.10.2026)

Utilizatorul autorizează continuarea autonomă până la aplicația completă cu toate cele șase module, în conceptul B60/A30/C10. Se păstrează designul și motorul funcționale; nu se reia V0.1. Construcția celorlalte patru module în staging este acum cerută explicit. Aprobarea rămâne necesară pentru decizii vizuale majore și nu este dedusă din rezultate automate. Publicarea și validarea estetică se raportează separat.

Revizia mobilă `1f705023`: preview BEST cu spire/Ø/TC-WATT lizibil, amplitudine vizuală utilă a scenelor, pauză și rotație oprite efectiv, căutare cu închidere Escape/focus exterior. Capturile se extind la lista deschisă, shortcutul din scenă, pauză și toate fallbackurile galeriei. GT One și 415 au copii locale nealterate ale fotografiilor folosite, cu atribuirea originală și condiția de licență deschisă.

QA pe SHA indicat: RTA `38619985170` SUCCESS, Market `38619985251` SUCCESS, Visual `38619985373` FAILURE la comparația transformării imediat după click Pause pe 390 px. Corecția testului așteaptă starea CSS paused și stabilizarea cadrului compositorului înainte de comparația pe 3,35 secunde. Verificați noul HEAD și noile capturi înainte de a considera etapa CI verde. HANDOFF §9 este sursa operațională pentru continuare.

### 19.1. Capture review și implementare progresivă

Pe `a511ef64`, toate cele trei gates au trecut: RTA `38620833175`, Market `38620833394`, Visual `38620833502`. Cele 23 de PNG din artifact `11921084143` au fost inspectate; captura offline KX aproape întunecată la intrare a fost respinsă și sincronizarea capturii corectată. CI verde nu înlocuiește inspecția vizuală. PR #45 rămâne mobil; Atlas/Wire și apoi Market/Duel continuă în `feature/atlas-complete-six-modules-20261014`, cu același sistem vizual. Cele două adaptoare noi există local și sunt testate mobil/desktop, fără aprobare estetică finală sau publicare.

## 20. Atomizer Atlas și Wire Lab implementate pentru evaluare (14.10.2026)

Candidatul separat adaugă două rute reale, păstrând HOME/Liquid Match și motorul. Atlas: platforme filtrabile, portrete fotografice, ADN, TOP3 builduri, familii/620 lichide, inventar fizic și fișele CL citite fără montări fictive. Wire: material și platformă vizibile devreme pe mobil, parametri canonici, limite, diagramă airflow/spire animată schematic, avantaje/compromisuri și proveniență. Objective se preia din mood până la alegerea explicită; navigarea păstrează lichidul.

Teste locale PASS în 360×800/390×844/1440×1000, normale/erori/stres; capturi inspectate. Același sistem vizual este reutilizat, fără reconstruirea V0.2. Stare: două module candidate, nu acceptare estetică sau publicare. Market/Duel, funcțiile complete și verificarea releaseului rămân deschise.

## 21. Duel — implementare incrementală în PR #46

Două portrete reale, configurații complete, context comun și salt compact la diferențe pe telefon; setările se editează în Wire și revin integral în slotul ales. Filtrul diferențelor folosește semnale interne ca estimări calitative, fără procente. Nu este comparație A/B externă validată. Teste locale model/browser normale/identice/multiple variabile/energie invalidă PASS; cadre 360/390/1440 inspectate. Noul CI și aprobarea vizuală rămân deschise. Cele trei documente se raportează la HANDOFF §11 pentru SHA/runs actuale; main și V10 sunt păstrate.

## 22. Market — galerie candidat cu traseu de surse

Patru categorii cu 24 fișe reale, filtrare/sortare și detalii de review; locurile fără dovezi rămân libere. 10/4/1/9 este numărul de fișe admise în cercetarea curentă, nu procent de popularitate și nu verdict universal. Sunt păstrate distincțiile ediție/concentrat/longfill/reper. Foto oficială curentă Virginia este explicit separată de Prelude original. Restul discurilor sunt grafică editorială originală; fotografiile suplimentare și drepturile rămân deschise.

Navigarea mobilă are acum acces la toate cele șase module. Cadrele de source trail se iau numai după finalul animației, iar căutarea Atlas după finalul scrollului; o imagine decodată nu dovedește singură cadrul pictat. Continuitatea exactă este în HANDOFF §12. Nu este acceptare estetică ori publicare.
