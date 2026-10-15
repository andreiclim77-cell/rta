# RTA Sensory Atlas — text, taburi și panouri, 15.10.2026

## Rezultat verificat

Corecția raportată prin captura utilizatorului este implementată și publicată la https://ghid-rta.ro/rta-lab/atlas/?v=fit-20261015 . PR #49 și #50 MERGED; candidat 319a777da0874ae4b1613c60e91cbab0ae2b0fe3; integrare 78385907e6ce37b3ba49aed5e16dce4401e65275. Publicarea Pages 38725622934 și RTA post-merge 38725623138 sunt SUCCESS. Verificarea HTTP și scenariile pe domeniu confirmă rezultatul; artifactul CI singur nu este considerat publicare.

Direcția vizuală aprobată B60/A30/C10, fotografiile autentice, fluxurile celor șase module și formulele existente sunt păstrate. Este o corecție a încadrării, fără rescrierea motorului sau schimbarea configurațiilor.

## Defect reprodus și cauze

Captura utilizatorului arată etichete ale graficului despărțite pe rânduri și tăiate. Înainte de publicare, versiunea publică a fost reprodusă în profiluri Chromium izolate cu font minim real 18 px la 360×800 și 24 px la 320×740. Toate cele 21 de etichete depășeau înălțimea disponibilă. Noul test rulat pe vechea versiune detectează și taburi care depășesc butoanele, plus spațiu insuficient rezervat sub conținut.

Cauze: bare de 16 px cu text poziționat absolut în interior, șase coloane de navigare indiferent de lățimea textului, spații fixe pentru antet/navigare și selectoare care ascundeau finalul valorilor lungi. Verificările anterioare de viewport nu acopereau preferințele de font mărit. Experimentul OSTextScale nu a mărit efectiv textul și nu este atribuit drept probă; testele finale folosesc preferința reală minimum_font_size și confirmă dimensiunea calculată.

## Corecții și trasee inspectate

1. **HOME — verificat:** inspecția după #49 a mai găsit suprapunerea etichetei decorative foto cu numele produsului la font minim 24 px / 320×740. Testul nou verifică intersecția textului efectiv cu eticheta și comenzile (fără a confunda paddingul rezervat cu textul) și eșuează pe versiunea #49. #50 ascunde numai eticheta decorativă la text mărit și mărește comanda pauză la 44 px; numele, sursa și fotografia se păstrează. Marca, antetul și navigarea se adaptează lățimii și fontului. Identitatea poate ascunde subtitlul decorativ la font foarte mare. Fotografiile existente și motion rămân active.
2. **LIQUID MATCH — verificat:** etichetele A/B/C ocupă un rând propriu, separat de bare; înălțimile urmăresc textul, iar axa folosește lățimea disponibilă pe telefon sau cu font mare. Cele 21 de valori provin din aceleași semnale ale motorului. Rezultatele, fotografiile cu credit și butoanele nu mai impun textului o fereastră fixă de citire.
3. **ATOMIZER ATLAS — verificat:** pași și filtre reorganizate când fontul crește, valori selectate lungi afișate integral sub control, DNA cu eticheta și valoarea pe rânduri lizibile. Fotografia și sursa ei pot crește natural. Cele trei materiale și topurile proprii sunt păstrate.
4. **WIRE LAB — verificat:** aceeași tratare a selecțiilor și panourilor; denumirea completă a materialului este vizibilă, fără pierderea configurației. Schema și citirile geometrice rămân orientative. Lista completă a platformelor compatibile nu este schimbată.
5. **MARKET — verificat:** la text mare, fișa folosește lățimea completă; categoria stă lângă discul editorial și își păstrează cuvintele. O primă variantă geometric validă, dar prea îngustă pentru citire, a fost corectată după inspecția capturii. Cele 40 de fișe și dovezile lor sunt neschimbate.
6. **DUEL — verificat:** valorile A/B și graficele se rearanjează; comenzile suplimentare rămân în fluxul paginii, iar selecția fixă stă deasupra navigării fără a-i ocupa spațiul. Înapoi și contextul comun rămân funcționale.

Navigarea inferioară păstrează șase taburi pe un rând când încap și folosește trei coloane pe două rânduri când textul o cere. Înălțimile reale ale antetului, navigării și selecției Duel sunt măsurate și rezervate în pagină. Mărirea textului nu este dezactivată. Nicio valoare senzorială nu este inventată sau transformată în procent de plăcere.

## Teste la candidatul exact

| Gate | Run | Concluzie |
|---|---|---|
| RTA Guide Quality | 38724599791 | SUCCESS |
| Market Quality | 38724599619 | SUCCESS |
| Atlas Visual Mobile | 38724599749 | SUCCESS |

Matricea suplimentară conține zece cazuri: 320×740, 360×800, 390×844, 768×1024 și 1440×1000 la setarea obișnuită; font minim 18 px la 360×800 și 390×844; font minim 24 px la 320×740 și 390×844; landscape 844×390 cu font minim 18 px. Sunt parcurse toate cele șase module, selecțiile și Înapoi. Testul verifică limitele textului, antetul/taburile, panourile, valorile selectate complete și faptul că viewportul nu se lărgește ascuns pentru a masca overflow-ul.

Matricea nouă așteaptă și stabilizarea derulării. Unele capturi din probele mai vechi ale artifactului pot arăta antetul în interiorul unei capturi de element lung sau în timpul derulării; acestea nu sunt folosite ca dovadă a marginilor fizice ale viewportului. Cele 110 capturi ale matricei noi și probele live stabilizate sunt folosite pentru această concluzie. Un cadru de compositor capturat în timpul derulării putea arăta bare fixe deplasate, deși geometria finală era corectă; acel cadru intermediar nu este acceptat ca probă a rezultatului. Sunt așteptate numai animațiile finite ale elementelor efectiv vizibile, fără blocare pe fotografii ascunse în details închise.

Regresiile existente rămân active: 140 contexte × nouă builduri, 620 lichide, toate materialele/obiectivele, căutările/topurile, 16 platforme/42 exemplare, saved/draft CL, geometrie, context, motion/pauză/reduced-motion, fallback foto, date/module lipsă și recuperare, offline preview/release și migrare cu vechi workers/cache HTTP încălzit.

Artifact 11967761374 din run 38724599749: 231 PNG descărcate, CRC PASS, SHA256 f629fbe8738772d21b61102501d61546a195937d0f39b1da943217abf20cdd94. Capturile au fost inspectate; verdictul nu este derivat numai din gate-ul verde.

## Verificare direct pe domeniu

După Pages SUCCESS s-a rulat din nou matricea de zece cazuri pe URL-ul public: PASS, 110 PNG. Alte trei capturi verifică selectoarele Atlas/Wire și fișa Market cu font minim real 24 px; denumirile complete din selectoare sunt confirmate și în DOM. Suplimentar, nouă capturi HOME verifică toate cele trei fotografii cu vendorul blocat la font18-360/font24-320/font24-390, inclusiv creditul copiei locale și lipsa suprapunerii textului/comenzilor. Cele patru capturi offline și toate cele 126 de capturi live au fost inspectate.

Integritate: 91 fișiere HTTP 200 coincid prin SHA256 normalizat LF cu sursa verificată; cache-ul are 82 resurse și release-ul 62 fișiere. Offline live: șase module, 16 hashuri foto, păstrare saved/draft CL, revenire după workers existenți și refresh V10 — PASS. Exact un răspuns 503 a fost injectat în workerul profilului izolat, apoi catalogul 620 a fost restaurat din cache și fetch-ul original repus.

Intrarea veche continuă să deschidă Atlas, conform migrației verificate; nu sunt reintroduse linkuri spre V10 în navigarea Atlas. Browserul interactiv a încărcat și verificat versiunea publicată.

## Protecție și limite

Comparația Git cu c268b2fc confirmă rta-lab/engine.js, rta-lab/data/**, mood-match.js și index.html V10 identice. Cele 620 lichide, 16 platforme, 42 exemplare, configurațiile validate, datele personale și cele trei CL saved/draft sunt păstrate. KLP + Dicodes NiFe30 și KLP + Zivipf NiFe52 TC rămân preferințe personale de prim nivel distincte.

Captura originală a utilizatorului a fost doar citită; nu a fost modificată sau publicată în repository. Probele înainte/după sunt capturi proprii din browser, cu aceleași dimensiuni și preferințe de font. Montajul comparativ conține pixeli reali, fără machetă generată. Profilele QA sunt izolate de browserul personal.

Aceste probe acoperă Chromium la configurațiile raportate. Nu reprezintă test pe telefonul fizic din captura utilizatorului, pe toate versiunile Samsung Internet/Safari sau acceptare universală de accesibilitate. Incidentul istoric separat Hype Radar 43/48 surse nu este declarat rezolvat de această corecție.

## Continuitate

RTA_CURRENT_HANDOFF.md, RTA_CONTINUITY_MASTER.md și RTA_ATLAS_DESIGN_BLUEPRINT.md au checkpointul curent și păstrează etapele istorice. Commitul ulterior de documentare modifică numai aceste trei fișiere și raportul; SHA, runs și hashurile HTTP finale sunt în FIT_FINAL_PUBLICATION.json din pachetul local de dovezi, evitând auto-referințe circulare.
