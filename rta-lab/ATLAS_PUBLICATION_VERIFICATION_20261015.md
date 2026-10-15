# RTA SENSORY ATLAS — verificarea publicării, 15.10.2026

Cele șase module sunt implementate și publicate la [RTA Sensory Atlas](https://ghid-rta.ro/rta-lab/atlas/). [Lab V10](https://ghid-rta.ro/rta-lab/) și [previewul V0.2](https://ghid-rta.ro/rta-lab/atlas-preview/) rămân rute separate. Aprobarea vizuală expresă a utilizatorului a fost primită: „Aprob direcția vizuală; continuă până la publicarea verificată”.

## Versiuni și dovezi de publicare

- [PR #45](https://github.com/andreiclim77-cell/rta/pull/45) MERGED: 9ef6d982663db2be9d2f1fba7b7c9182d1ea5333.
- [PR #46](https://github.com/andreiclim77-cell/rta/pull/46) retargetat pe main și MERGED: 64d28cccc8adbea6e8e41bb82d7b8c8ea3e197bc. Arborele este identic cu candidatul 606aab3732d683e67c77aaa35ea4aff97385cf88; actualizările automate anterioare din main sunt păstrate.
- [Distribuție finală 79f7a1d](https://github.com/andreiclim77-cell/rta/commit/79f7a1d40048899dfdb42cf588af19abc2c54797): corectează exclusiv eticheta de navigare pentru cititorul de ecran, „Navigare prototip” → „Navigare Atlas”, și regenerează receipt/cache. Nu modifică încadrarea, formulele sau modulele.
- La SHA 79f7a1d: [Pages 38694013076](https://github.com/andreiclim77-cell/rta/actions/runs/38694013076) și [RTA Quality 38694013836](https://github.com/andreiclim77-cell/rta/actions/runs/38694013836) **SUCCESS**. Eticheta finală a fost verificată și în browserul deja deschis, după reload, fără ștergerea datelor.
- La SHA 64d28cc: [Pages 38693180338](https://github.com/andreiclim77-cell/rta/actions/runs/38693180338), [RTA 38693181313](https://github.com/andreiclim77-cell/rta/actions/runs/38693181313), [Market 38693181270](https://github.com/andreiclim77-cell/rta/actions/runs/38693181270), [Final Report 38693181389](https://github.com/andreiclim77-cell/rta/actions/runs/38693181389), [Hype 38693181240](https://github.com/andreiclim77-cell/rta/actions/runs/38693181240), [IndexNow 38693181301](https://github.com/andreiclim77-cell/rta/actions/runs/38693181301): **SUCCESS**.
- Candidat exact 606aab3: RTA 38692656829, Market 38692656822, Final Report 38692656850, Hype 38692656811 și [Visual 38692656827](https://github.com/andreiclim77-cell/rta/actions/runs/38692656827): **SUCCESS**. Artifact 11953025258 de la codul identic 47ccee9: 78 PNG descărcate și inspectate integral. Rezultatele sunt atribuite SHA-ului la care au rulat, nu unui commit ulterior.

## Funcțiile livrate

| Modul | Comportament verificat |
| --- | --- |
| HOME | Fotografii reale, trei cadre, credit/proveniență, fallback local decodat, pauză și reduced-motion; cinci intrări spre instrumentele conectate. |
| LIQUID MATCH | Catalog 620, căutare cu tastatură/ARIA, șapte stări/cinci momente, obiectiv comun, TOP 3 platforme × 3 builduri, BEST contextual vizibil imediat pe mobil și salt la cardul real. Profilul liber sau din review rămâne separat de catalog. |
| ATOMIZER ATLAS | 16 platforme/42 exemplare, fotografii locale originale, căutare/filtre, ADN contextual și configurații complete. Trei Dvarw CL saved/draft/legacy distincte, citite fără completarea fictivă a parametrilor lipsă. |
| WIRE LAB | Materiale/aliaje compatibile, spire/airflow/clopot/geometrie/energie, refuzul valorilor invalide fără schimbarea configurației, schemă animată corelată cu numărul de jeturi și spire, avantaje/compromisuri explicate. |
| MARKET HALL OF FAME | Patru clase a câte 10 fișe documentate, căutare/ordine, autor/dată/sursă/ediție și limite explicite, 12 vizualuri originale de review, acces la profiluri 3×3 fără un al 621-lea lichid. |
| DUEL MODE | Două alegeri explicite, configurații complete, același lichid/context/obiectiv, editare în Wire și revenire, izolarea unei variabile cu restul controalelor blocate, două scheme sincronizate și diferențe explicate fără procente de plăcere inventate. |

KLP cu Dicodes NiFe30 și KLP cu Zivipf NiFe52 în TC sunt ambele preferințe personale de prim nivel. Experiența Dicodes 220°C/16 W este etichetată distinct; nu este atribuită Zivipf. Fotografia Dicodes nu apare pentru Zivipf.

## Verificarea directă a site-ului publicat

Testele au folosit profiluri Chromium izolate și URL-ul HTTPS public, fără fixtures în browserul personal. Toate cele șase module au fost parcurse pe 360×800, 390×844 și 1440×1000. La 64d28cc: **74 PNG live inspectate integral**, inclusiv fotografiile decodate, edițiile Market, profilele lungi și cazurile de eroare. Au trecut căutarea fără rezultat, tastatura, păstrarea contextului, compatibilitățile și limitele Wire, cele două NiFe KLP, Duel și cele patru clase Market. Fără overflow sau erori de pagină în scenariile executate.

După corecția ARIA, la 79f7a1d: mobil/motion și offline au fost retestate; **27 PNG noi inspectate integral**. Verificarea de integritate a comparat din nou **86 fișiere live HTTP 200** prin SHA256 cu distribuția integrată: toate coincid, inclusiv cele **79 resurse de cache**, fotografiile, fonturile și resursele protejate V10. Distribuția generată are **59 fișiere** și trece verificarea reproductibilă `tools/build-rta-atlas-release.js --check`.

Testul offline a verificat încărcarea celor 620 lichide, toate cele șase module, fotografiile locale, activarea previewului, workerii reali V10 și ghid, comanda de curățare V10 și navigarea efectivă prin refresh.html V10. Atlas rămâne disponibil offline, iar bytes saved/draft CL de test sunt identici. La date lipsă la prima încărcare, apare o eroare explicită și accesul V10; nu apar rezultate dintr-un catalog incomplet.

Recuperarea 503 a fost verificată prin injectarea temporară a unui răspuns 503 în `fetch` al workerului real din profilul izolat; contorul a confirmat **un răspuns injectat**, iar catalogul 620 s-a restaurat din cache. Implementarea publicată nu a fost modificată de injectare. O primă încercare de interceptare la nivel de pagină nu ajungea la cererea workerului; acea încercare nu este probă de recuperare 503. Eroarea simulatorului a fost identificată printr-o aserțiune explicită, corectată și retestată.

Înregistrarea MP4 este motion real capturat de pe site-ul public: galerie HOME, căutare Liquid și schimbarea numărului de jeturi/spire. Nu este video generat. Capturile și clipul sunt livrate în pachetul local de dovezi al conversației.

Verificări suplimentare anterioare, păstrate ca dovezi distincte: 28 cadre responsive în 320×568, 768×1024, 844×390 și 1920×1080; 140 comparații exacte ale formulei existente, 210 contexte de profil liber cu 3×3 builduri, scenarii pe catalogul 620/materiale/obiective și toate cele 40 profiluri din review. Testele pure sunt incluse în Quality Gate; testele browser și inspecția capturilor nu sunt confundate cu aprobarea estetică a utilizatorului.

## Conservare și limite

Compararea Git cu c268b2fc confirmă `rta-lab/engine.js`, `rta-lab/data/**`, `rta-lab/mood-match.js` și intrarea `rta-lab/index.html` identice. Nu au fost schimbate catalogul, configurațiile validate sau datele personale. Corecțiile de infrastructură sunt limitarea ștergerii cacheurilor la proprietarul ghid/V10 și dezînregistrarea numai a scope-ului V10 exact în refresh.html. Atlas are scope/cache separat.

Rezultatele tehnico-senzoriale rămân estimări explicate, fără procente de plăcere inventate, consens universal sau A/B atribuit reviewerilor. Reviewurile sunt singulare și edițiile distincte. Fotografiile reale au proveniență și hashuri; unde nu există fotografie certă există scheme declarate. Licențele exprese de redistribuire ale imaginilor externe nu sunt certificate. Testarea în Chromium la dimensiuni mobile nu este probă pe telefon fizic sau Safari.

Mandatul funcțional al celor șase module și publicarea sunt încheiate și verificate în limitele de mai sus. Checkpointurile istorice „DRAFT”, „aprobare în așteptare” și „nepublicat” din documentele de continuitate descriu etape anterioare; nu reprezintă starea actuală.
