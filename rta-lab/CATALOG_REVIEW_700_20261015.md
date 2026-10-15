# RTA — revizia bibliotecii de 700 de produse

Stare: catalog integrat în candidatul #51; verificări finale și publicare încă în curs, 15.10.2026. Bază: `7ad3813c42d22841496e14884ac295b8bcd75ed3`. Nu este încă biblioteca publicată.

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

Copiile de lucru și chitanțele SHA256 sunt în `qa-atlas/catalog-sources` din workspace. Nu se publică dumpurile HTML, texte comerciale integrale sau datele clienților. Datasetul final trebuie să conțină fapte normalizate, identități, surse și limite.

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

Execută și inspectează verificările pe candidatul exact de mai jos; publică în domeniul aprobării existente și consemnează SHA/runs reale. Nu transfera rezultatele checkpointului anterior la noul dataset.

## Acoperire și reconciliere integrală — candidat de verificat

PR #51 DRAFT, branch `feature/atlas-library-700-20261015`; baza `7ad3813c42d22841496e14884ac295b8bcd75ed3`. Cerința este revizia integrală, nu doar adăugarea celor două exemple Centenary. Catalogul Atlas are acum 700 de produse / 61 de mărci, cu surse și ediții explicite. Fișier editabil: `catalog/liquids-20261015.json`; SHA256 `d4b29f707c0a964ab3c94188bb11be283eae107dcdd23d29a9e842392fee3a11`; cache `690635981392b410` / 67 resurse / 63 fișiere release.

Toate cele 620 de rânduri inițiale au o decizie în `catalog/LEGACY_RECONCILIATION_20261015.json`: 500 de rânduri confirmate devin 469 identități distincte (31 dubluri/aliasuri comasate); se adaugă 231 identități documentate. Se scot din catalogul comercial 100 Profil reper și benchmarkul personal. Alte 8 rânduri au profil în afara scopului, unul are surse contradictorii și 10 nu au identitatea/ediția confirmată suficient; acestea nu sunt declarate false și rămân recuperabile în datele originale V10. Nu se inventează aliasuri către altă rețetă.

Clase: 210 NET simplu, 253 NET complex, 107 Tutun simplu, 130 Tutun complex. Proveniență: 384 descrieri oficiale, 287 de comerciant atribuit și 29 ediții/observații din review-uri istorice. 505 produse cu profil suficient intră în topurile automate; celelalte 195 rămân căutabile și selectabile cu limita afișată. Niciun număr lipsă de review-uri nu este publicat ca zero, iar ordinea unui magazin nu este prezentată ca popularitate globală.

Reținerea verificată acoperă inclusiv Blendfeel SOLO/Private Reserve, Azhad Semplici/Hyperion/Pure/Signature, La Tabaccheria clasic/Macerati/Elite, Pod Salt Origin, Flavorah, FlavourArt, The Flavor Apprentice, Flavor West, Inawera, House of Liquid, Charlie Noble și alte mărci vechi. Pro Vape / Cronos și Black Note / Concerto au marca corectată fără duplicarea produsului. Formulele distincte (de exemplu RY4 Double CC și Manabush Powwow Extended) nu sunt comasate ca simple ambalaje. Van&Illa nu primește Cavendish pe care producătorul îl exclude; Booms Origin nu primește eticheta dulce dintr-o negație; Liquor Tobacco păstrează absintul/lemnul dulce.

Teste locale ale datelor: 700 identități și căutări, toate cele 500 aliasuri/rânduri vechi păstrate, 756 topuri configurație permisă/obiectiv, 140 contexte, stress pe 700; PASS. Motorul original trece separat cu 620, 16 platforme, 126 variante permise; KLP NiFe30/NiFe52 TC și CL saved/draft sunt păstrate. Diferența față de baza protejată pentru `data/`, `engine.js`, `mood-match.js`, `index.html` este goală.

CI pe checkpointul anterior `efaf78f5163a477918acd17238e5274d9e43312b`: RTA 38740026843, Market 38740026849, Visual 38740026866 — toate SUCCESS. Aceste rulări NU certifică datasetul revizuit ulterior de mai sus. Pe noul dataset: browserul local 360×800 / 390×844 / 1440×1000, căutările mărcilor reintegrate și cele zece combinații ecran/font real 18/24 px sunt PASS. Offline, cache-upgrade, CI final, inspecția capturilor CI și publicarea sunt încă PENDING.

Motorul, datele originale V10, inventarul 16 platforme / 42 exemplare, preferințele și configurațiile personale nu sunt modificate. Hall of Fame păstrează cele 40 de recenzii atribuite; descrierile comerciale și noile fișe nu inventează consens ori rezultate personale. Direcția vizuală și publicarea au aprobarea expresă anterioară; se publică după verificările candidatului exact, fără o nouă cerere pentru această revizie de date. Selecția de 700 este editorială documentată, nu un clasament global demonstrat al căutărilor/vânzărilor.
