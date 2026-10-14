# RTA SENSORY ATLAS — PRECISION MOTION LAB
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
