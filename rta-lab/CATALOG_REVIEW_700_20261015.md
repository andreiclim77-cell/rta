# RTA — revizia bibliotecii de 700 de produse

Stare: **PUBLISHED_VERIFIED**, 15.10.2026. PR #51 MERGED; candidat `a9074c91d9b1476d6c2edf56c0e623c5893219d2`, integrare `2bf23ed4b2c12a58fbbbe01e0ac1b88843d59cf8`. [Biblioteca publică de 700 produse](https://ghid-rta.ro/rta-lab/atlas/?v=catalog-700-20261015). Acest checkpoint prevalează asupra etapelor istorice descrise mai jos.

## Cerința care prevalează

Utilizatorul a cerut explicit înlocuirea bibliotecii vizibile cu **700 de produse comerciale distincte, tutunoase, de marcă**, păstrând ce este bun, scoțând genericul și repetările, completând corect lipsurile și recalculând topurile. Această cerință înlocuiește exclusiv vechea limită de conservare a catalogului la 620. Motorul, platformele, inventarul, preferințele personale și configurațiile rămân protejate. Publicarea în direcția vizuală aprobată este autorizată după verificări.

## Constatări reproduse

- Nici Centenary Mods, nici Balkan Milestone, nici Merde de Cheval nu există în cele 620 de înregistrări inițiale. Nu este doar o problemă de ortografie la căutare.
- 100 de înregistrări sunt `Profil reper`; încă una este un benchmark personal, nu produs comercial. Sunt păstrate ca referințe recuperabile, dar nu pot ocupa poziții în biblioteca comercială de 700.
- 19 grupuri au aceeași marcă, denumire și gamă, cu câte două fișe clasificate diferit. Ignorarea clasei la verificarea identității expune aceste repetări pe care vechiul test nu le respingea.
- Rezultă cel mult 500 de identități comerciale nominale înaintea verificării sinonimelor, a produselor fără tutun și a provenienței. Acest număr nu certifică autenticitatea tuturor fișelor.
- Halo Fusion este prezentat de producător ca **Unflavored**; nu poate fi tratat ca un lichid cu profil aromatic de tutun în biblioteca nouă.
- Un răspuns HTTP 200 nu certifică o fișă: unele pagini Centenary livrează poarta de vârstă; datele publice structurate ale producătorului confirmă cele 12 produse. Un endpoint presupus Decadent Vapours livrează conținut fără legătură cu producătorul și este respins ca sursă.

## Surse și inventar de lucru

Inventar public citit: 6.528 de produse distincte din cataloagele La Tabaccheria (287), E-Tobacco (1.196), TiSvapo (4.877) și Manabush (168). Aceste totaluri includ și produse în afara scopului; **nu sunt numărul de lichide acceptate**. Filtrarea a fost completată cu verificarea fișelor istorice și a surselor oficiale individuale. Alte fișe oficiale au fost verificate pentru Centenary Mods, Drake’s, Ripe Vapes, Five Pawns, Black Note, Halo și Vape Cellar.

Surse principale:

- [Centenary Mods — Balkan Milestone](https://centenarymods.com/shop/flavor-concentrates/centenary-mods-12ml/balkan-milestone/) și [Merde de Cheval](https://centenarymods.com/shop/flavor-concentrates/centenary-mods-12ml/merde-de-cheval/); catalog public structurat al categoriei 106, 12 produse.
- [La Tabaccheria — catalog și formulări](https://latabaccheria.net/concentrati/) și [produse](https://latabaccheria.net/shop/).
- [Azhad — Semplici](https://www.azhadelixirs.it/semplici/), [Aromi](https://www.azhadelixirs.it/aromi/), Hyperion, My Way, Back in Black și Bacco e Tabacco.
- [Blendfeel — SOLO](https://blendfeel.com/solo/) și [catalog](https://blendfeel.com/linee/).
- [Drake’s](https://drakesvapes.co.uk/), [Ripe Vapes](https://www.ripevapes.com/), [Five Pawns](https://fivepawns.com/), [Black Note](https://www.blacknote.com/brands/black-note/), [Halo](https://halovapeclub.com/pages/american-made-tobacco-eliquid), [Vape Cellar](https://www.vapecellar.eu/en/).
- [TNT / The Alchemist’s Leaves](https://thealchemistsleaves.com/en/), [TNT catalog](https://tnt-vape.com/2-tnt-vape-liquidi-aromi-e-distillati-per-sigarette-elettroniche).
- [E-Tobacco — portofoliu și fișe](https://www.e-tobacco.it/officine-svapo-3/) și [TiSvapo](https://www.tisvapo.it/). Fișele comercianților sunt atribuite ca atare, nu prezentate drept teste independente.

Copiile publice de lucru și chitanțele SHA256 au fost arhivate local fără pierderi în `qa-atlas/catalog-sources-evidence-20261015.zip` (1.167 fișiere, CRC și dimensiuni verificate înaintea eliberării spațiului); receipt: `catalog-sources-archived-receipt.json`. Nu se publică dumpurile HTML, texte comerciale integrale sau datele clienților. Datasetul final trebuie să conțină fapte normalizate, identități, surse și limite.

## Istoric al controlului surselor — primul candidat automat neacceptat

Prima selecție automată de 700 este numai un candidat local, marcat PROVISIONAL_NOT_ACCEPTED. Nu este integrată în aplicație. Au rămas sinonime de format și clasificări care cer confirmare. Nu prezentați acest fișier ca bibliotecă verificată.

A fost reprodus un conflict concret: TiSvapo descrie Blendfeel Ghiaccio și Piperita ca tutunoase; [producătorul arată că gama Pianeta Menta este mentă](https://blendfeel.com/pianeta-menta/). Aceste produse sunt excluse din biblioteca tutunoasă; descrierile magazinului nu sunt acceptate singure ca dovadă a compoziției. Ordinea publicată de popularitate poate rămâne doar un semnal comercial local, distinct de profil. Se verifică direct fișele oficiale pentru a rezolva aceste diferențe.

Pregătire de interfață în branch: numărătoare dinamică în texte, denumirea gamei la fișele curate, aliasul Balcan/Balkan, câmpuri pentru surse și limite și selecție de topuri care poate exclude profilurile insuficient cunoscute și repetițiile aceleiași rețete. Acești conectori sunt testați încă pe biblioteca publică inițială; nu sunt probă a acceptării celor 700.

## Catalogul integrat ulterior

700 de identități comerciale cu surse, grupuri de rețetă și clasificări explicite; receiptul JSON conține numărătoarea exactă. Profilurile atribuite comerciantului sunt etichetate distinct. Fișele cu informații insuficiente pot fi căutate și selectate, dar sunt excluse din topurile automate; rețetele secrete nu sunt completate prin presupuneri. Topurile se recalculează din motorul existent. Nicio descriere de fabricant nu devine automat dovadă de reputație sau validare personală.

## Reguli de acceptare

1. Exact 700 de identități comerciale distincte, în cele patru clase: Tutun simplu, Tutun complex, NET simplu, NET complex. Niciun `Profil reper`, benchmark personal, accesoriu, dispozitiv, lichid fără aromă ori aromă fără tutun.
2. Identitatea este marcă + produs + formulare documentată. Volumul, nicotina, traducerea și prezentarea concentrat/shortfill nu devin automat lichide diferite. Formulările distincte dovedite, precum Extra Dry, White sau extractul clasic, sunt prezentate cu gama explicită.
3. Fiecare fișă are sursă, data verificării, clasificare motivată și trasabilitate. Nicio frunză, aromă, recenzie, vânzare sau valoare senzorială nu este inventată. Merde de Cheval rămâne un amestec cu formulă secretă; lipsa compoziției nu se înlocuiește cu Latakia presupus.
4. „Cele mai căutate” nu se transformă în afirmație de vânzări globale fără date. Ordinea de popularitate publicată de un comerciant și numărul său de recenzii sunt semnale locale, atribuite și datate. Selecția editorială se declară editorială.
5. Toate selectoarele folosesc aceeași bibliotecă și acceptă denumiri apropiate rezonabile, inclusiv `Balcan Milestone` și `Mer de cheval`. Numărătoarea, filtrele, inițializarea și cache-ul nu rămân blocate la 620.
6. Topurile de potrivire se recalculează pentru toate configurațiile/obiectivele, din datele noi și motorul existent. Hall of Fame se revede pe dovezi reale, distinct de potrivirea calculată. Un catalog mai mare nu dovedește că un produs nou este automat mai bun sau mai popular.
7. Teste de integritate, duplicate și sinonime; toate cele 700 căutabile; scenarii normale/eroare/stres, patru selectoare, topuri, Înapoi, font mărit, 360×800, 390×844 și desktop; lipsa fișierului nou trebuie să producă eroare explicită; migrare cache, offline și CL saved/draft păstrate.
8. CI și capturi ale candidatului exact, inspecție efectivă, apoi integrare și verificare Pages/HTTP/browser. Până atunci, producția rămâne la versiunea verificată anterior.

## Verificarea publicării

Verificările candidatului exact, inspecția, integrarea și verificările directe pe domeniu sunt încheiate în domeniul aprobării existente. Rezultatele și limitele sunt consemnate în secțiunea finală și `catalog/PUBLICATION_RECEIPT_20261015.json`; rezultatele istorice nu au fost transferate la noul dataset.

## Acoperire și reconciliere integrală — publicare verificată

**Checkpoint curent, prioritar față de istoricul de mai jos.** PR #51 MERGED; candidat verificat `a9074c91d9b1476d6c2edf56c0e623c5893219d2`, integrare `2bf23ed4b2c12a58fbbbe01e0ac1b88843d59cf8`. Public: https://ghid-rta.ro/rta-lab/atlas/?v=catalog-700-20261015 . Cerința este revizia integrală, nu doar adăugarea celor două exemple Centenary. Catalogul Atlas are acum 700 de produse / 61 de mărci, cu surse și ediții explicite. Fișier editabil: `catalog/liquids-20261015.json`; SHA256 `d4b29f707c0a964ab3c94188bb11be283eae107dcdd23d29a9e842392fee3a11`; cache preview `690635981392b410`, release `dc1f06b8c21ebed1`; câte 67 resurse / 63 fișiere release.

Toate cele 620 de rânduri inițiale au o decizie în `catalog/LEGACY_RECONCILIATION_20261015.json`: 500 de rânduri confirmate devin 469 identități distincte (31 dubluri/aliasuri comasate); se adaugă 231 identități documentate. Se scot din catalogul comercial 100 Profil reper și benchmarkul personal. Alte 8 rânduri au profil în afara scopului, unul are surse contradictorii și 10 nu au identitatea/ediția confirmată suficient; acestea nu sunt declarate false și rămân recuperabile în datele originale V10. Nu se inventează aliasuri către altă rețetă.

Clase: 210 NET simplu, 253 NET complex, 107 Tutun simplu, 130 Tutun complex. Proveniență: 384 descrieri oficiale, 287 de comerciant atribuit și 29 ediții/observații din review-uri istorice. 505 produse cu profil suficient intră în topurile automate; celelalte 195 rămân căutabile și selectabile cu limita afișată. Niciun număr lipsă de review-uri nu este publicat ca zero, iar ordinea unui magazin nu este prezentată ca popularitate globală.

Reținerea verificată acoperă inclusiv Blendfeel SOLO/Private Reserve, Azhad Semplici/Hyperion/Pure/Signature, La Tabaccheria clasic/Macerati/Elite, Pod Salt Origin, Flavorah, FlavourArt, The Flavor Apprentice, Flavor West, Inawera, House of Liquid, Charlie Noble și alte mărci vechi. Pro Vape / Cronos și Black Note / Concerto au marca corectată fără duplicarea produsului. Formulele distincte (de exemplu RY4 Double CC și Manabush Powwow Extended) nu sunt comasate ca simple ambalaje. Van&Illa nu primește Cavendish pe care producătorul îl exclude; Booms Origin nu primește eticheta dulce dintr-o negație; Liquor Tobacco păstrează absintul/lemnul dulce.

Teste locale ale datelor: 700 identități și căutări, toate cele 500 aliasuri/rânduri vechi păstrate, 756 topuri configurație permisă/obiectiv, 140 contexte, stress pe 700; PASS. Motorul original trece separat cu 620, 16 platforme, 126 variante permise; KLP NiFe30/NiFe52 TC și CL saved/draft sunt păstrate. Diferența față de baza protejată pentru `data/`, `engine.js`, `mood-match.js`, `index.html` este goală.

CI pe candidatul exact a9074c91: RTA [38746803087](https://github.com/andreiclim77-cell/rta/actions/runs/38746803087), Market [38746802599](https://github.com/andreiclim77-cell/rta/actions/runs/38746802599), Visual [38746803089](https://github.com/andreiclim77-cell/rta/actions/runs/38746803089) — SUCCESS. Artifact 11979252385: 246 PNG, CRC PASS, SHA256 `5571f2e21944ab206deba3204da33f7f5f46b050baa987ca9ccd5c2a88d48cc4`. Inspecție efectivă: 24 planșe cu 140 capturi catalog/căutare/încadrare și originale mobile/desktop; nu se afirmă inspecția individuală a tuturor celor 246. Offline și migrarea din vechiul cache V10/Atlas cu cache HTTP de o oră sunt PASS în CI.

Pages [38748354904](https://github.com/andreiclim77-cell/rta/actions/runs/38748354904) și RTA post-merge [38748355317](https://github.com/andreiclim77-cell/rta/actions/runs/38748355317) — SUCCESS. Direct pe domeniu: 76 fișiere release/protejate și 75 fișiere preview HTTP 200 cu hash egal sursei; catalog și mărci păstrate la 360×800, 390×844, 1440×1000; zece cazuri încadrare cu font minim real 18/24 px; 15 capturi catalog + 110 încadrare + 4 offline. Capturile matricei au fost inspectate. Șase module offline, un 503 real injectat în workerul profilului QA cu restaurare din cache, preview/ghid/refresh V10 și CL saved/draft identice — PASS. Prima încercare live a epuizat discul local și s-a oprit; după arhivarea fără pierderi a dovezilor locale, rulările complete au trecut. Nu s-a mascat eroarea prin modificarea aplicației.

Receipt durabil: `catalog/PUBLICATION_RECEIPT_20261015.json`; raport: `CATALOG_REVIEW_700_20261015.md`; reconciliere pe fiecare rând: `catalog/LEGACY_RECONCILIATION_20261015.json`. Limita probelor vizuale este Chromium la configurațiile declarate, fără afirmație de test pe telefon fizic/Safari.

Motorul, datele originale V10, inventarul 16 platforme / 42 exemplare, preferințele și configurațiile personale nu sunt modificate. Hall of Fame păstrează cele 40 de recenzii atribuite; descrierile comerciale și noile fișe nu inventează consens ori rezultate personale. Direcția vizuală și publicarea au aprobarea expresă anterioară; publicarea s-a făcut după verificările candidatului exact, fără o nouă cerere pentru această revizie de date. Selecția de 700 este editorială documentată, nu un clasament global demonstrat al căutărilor/vânzărilor.
