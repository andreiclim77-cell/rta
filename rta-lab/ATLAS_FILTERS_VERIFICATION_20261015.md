# RTA Atlas — verificarea filtrelor și accesului public, 15.10.2026

Cele cinci corecții cerute sunt publicate la https://ghid-rta.ro/rta-lab/atlas/?v=filters-20261015 . Vechea adresă https://ghid-rta.ro/rta-lab/ deschide acum online Atlas. V10 poate fi accesat explicit la https://ghid-rta.ro/rta-lab/?view=v10 . Ghidul de la rădăcina domeniului rămâne separat.

## Modificări verificate

| Cerință | Comportament publicat |
| --- | --- |
| „Am un lichid” fără trei exemple fixe | Catalog 620, căutare multiplă în orice ordine, diacritice, identitate exactă prioritară, brand/familie/trăsătură, numărători dependente și paginare |
| Atlas atomizor → sârmă → obiectiv | Sârme compatibile și top 5 recalculat pentru configurația completă exactă; identic cu core.matchLiquids |
| Lichid schimbabil în Atlas și Wire | Selector comun pentru toate cele 620; rămâne în modulul curent și păstrează reglajele buildului |
| Lichid schimbabil în Duel | Același catalog și obiectiv comun; ambele configurații, selecțiile explicite și izolarea variabilelor sunt păstrate |
| Filtre conectate | Aceeași căutare în cele patru locuri, numărători dependente; platforme cu termeni multipli, Market cu opțiunea „Toate cele 40” |

Numele exact este primul și pentru „Virginia Hangsen”. Sugestiile aproximative sunt explicit etichetate numai după lipsa unui rezultat exact; lichidul nu este schimbat automat. Lista de rezultate curge în pagină fără a acoperi filtrele, Escape închide fără selectare, iar opțiunile pot fi folosite prin tastatură.

## Integrare și CI

- PR #47: https://github.com/andreiclim77-cell/rta/pull/47 — MERGED.
- Candidat final: 5aa19ee79e009d95950931b7ad50b6061084671d.
- Merge publicat: 5a031c774898dc589b63f578afdafee687b9ff11.
- RTA: https://github.com/andreiclim77-cell/rta/actions/runs/38701154372 — SUCCESS.
- Market: https://github.com/andreiclim77-cell/rta/actions/runs/38701154364 — SUCCESS.
- Visual: https://github.com/andreiclim77-cell/rta/actions/runs/38701154439 — SUCCESS; artifact 11956337532, 93 PNG inspectate.
- RTA după merge: https://github.com/andreiclim77-cell/rta/actions/runs/38702087125 — SUCCESS.
- Pages după merge: https://github.com/andreiclim77-cell/rta/actions/runs/38702086762 — SUCCESS.

Main ulterior b1562a34dfd4edb938714d5c0e337d80b2b73979 păstrează codul Atlas identic și adaugă numai snapshotul independent de piață. Actualizarea acestui raport și a celor trei documente canonice este un commit separat exclusiv de documentație.

## Site public: probe executate

Test nou pe domeniul real în profiluri izolate, 360×800, 390×844, 1440×1000: PASS. 15 PNG inspectate, toate cele patru selectoare, fațete, nume inversat, Escape, top 5 egal cu motorul și recalculat la schimbarea platformei/sârmei/obiectivului, alegerea ultimului lichid din catalog, păstrarea întregii configurații Wire și ambelor builduri Duel, obiectiv comun, căutare Market în toate categoriile, bytes CL identici, vechea lansare și V10 explicit. Zero erori de pagină în aceste scenarii. Browserul manual a confirmat vechea adresă → URL Atlas cu versiune, KLP + NiFe52 și alegerea Hangsen Virginia fără ieșirea din Atlas.

Integritate live: 89 răspunsuri HTTP 200, SHA256 comparate cu versiunea locală verificată; 80 resurse în cache, incluzând noul selector, catalogul, fotografiile și infrastructura V10. Comparația Git cu c268b2fc0ab36baaa44a0d29b810d1f0da2d9ec2 arată motorul, rta-lab/data/**, mood-match.js și index.html V10 neschimbate.

Test offline live: PASS pentru șase module, 16 hashuri de fotografii, instalarea completă a cache-ului, coexistenta preview/V10/ghid, refresh V10 și bytes saved/draft CL identici; exact un 503 injectat în fetch-ul workerului izolat și catalog 620 recuperat. Patru PNG suplimentare inspectate. Două încercări inițiale au fost întrerupte de reloadul automat al workerului V10 în timp ce testul începea următoarea navigare. Adaptorul QA așteaptă acum cele două navigări reale ale refreshului; aserțiunile produsului sunt identice. Nu se atribuie PASS încercărilor eșuate.

## Migrare și date protejate

Cauza versiunii vechi: start_url și intrarea V10, plus vechiul HTML încă valid în cache HTTP. Intrarea online și manifestul lansează Atlas; URL-ul de intrare este versionat. Workerul Atlas instalează resursele cu cache reload, apoi cere rețeaua fără a reutiliza HTML vechi din cache HTTP; la eroare folosește cache-ul instalat. Testul de regresie reconstruiește vechiul 8cb1b18, încălzește Atlas și V10 cu cache HTTP de o oră și trece prin migrare plus căutare offline. Varianta de control cu vechiul addAll(ASSETS) eșuează; corecția trece local și CI. Nu sunt șterse date personale ori cache-urile altor module.

Cele 620 de lichide, 16 platforme, 42 exemplare și configurațiile validate sunt conservate. KLP + Dicodes NiFe30 și KLP + Zivipf NiFe52 în TC sunt preferințe personale de prim nivel; regimul observat Dicodes nu este transferat Zivipf. Topurile reprezintă estimări tehnico-senzoriale ale motorului existent. Nu se deduc recenzii, consens sau procente de plăcere.

## Rularea roșie semnalată de utilizator

https://github.com/andreiclim77-cell/rta/actions/runs/38701133473 — Market 2026 Hype Radar, programat pe 0eafc43903208fd6eab3b36e479ee110b568fae5: FAILURE la source_coverage_below_gate, 43/48 surse directe reușite, sub 90%. Surse nereușite: Aspire, Horizontech, Dovpo, Suorin, Yachtvape; Atmizoo parțial. Publicarea datelor noi a fost omisă. Se păstrează ultimul snapshot acceptat, fără reducerea pragului și fără inventarea datelor. Eșecul colectorului extern nu este rezolvat de această livrare Atlas și rămâne consemnat separat.

## Limitele verificării

Chromium la dimensiunile raportate, nu telefon fizic sau Safari. Sursele/fotografiile și limitele lor anterioare rămân explicit atribuite; licențele exprese externe nu sunt certificate de aceste teste. Această livrare verifică accesul și cele cinci corecții, nu transformă estimările motorului în rezultate experimentale.
