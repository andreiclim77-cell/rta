/* Editorial source records, kept apart from the protected 620-liquid catalog. */
(function(){
'use strict';
const accessed='2026-10-14';
const sources={
 bn:{title:'Black Note E-Liquid Review – Remarkable Range of E Juices',publisher:'Ecigclick',authors:'Dan W; Concerto/Quartet update: Neil H',url:'https://www.ecigclick.co.uk/black-note-e-liquid-review/',date:'2022-11-25',dateKind:'Data afișată a paginii actualizate; textul inițial este mai vechi',bias:'Linkuri comerciale / cod afiliat; proveniența mostrelor nu este explicită',accessed},
 ltBurley:{title:'Burley (Single Line) – La Tabaccheria',publisher:'Le Vapelier',authors:'NonoVape',url:'https://levapelier.com/en/burley-single-line-range-by-the-tobacconist/',date:'2025-03-25',bias:'Material furnizat de LCA',accessed},
 ltLatakia:{title:'Latakia (Single Line) – La Tabaccheria',publisher:'Le Vapelier',authors:'Selene',url:'https://levapelier.com/en/latakia-single-line-range-by-the-tobacconist/',date:'2025-04-30',bias:'Achiziție din fonduri proprii declarată',accessed},
 ltKentucky:{title:'Kentucky (Single Line) – La Tabaccheria',publisher:'Le Vapelier',authors:'Selene',url:'https://www.levapelier.com/kentucky-gamme-single-line-par-la-tabaccheria/',date:'2025-04-23',bias:'Achiziție din fonduri proprii declarată',accessed},
 ltCavendish:{title:'Cavendish (Single Line) – La Tabaccheria',publisher:'Le Vapelier',authors:'NonoVape',url:'https://www.levapelier.com/cavendish-gamme-single-line-par-la-tabaccheria/',date:'2025-04-05',bias:'Material furnizat de LCA',accessed},
 special:{title:'Black Note Special Blend NET E-liquid',publisher:'Planet of the Vapes',authors:'Michelle (Purplefowler)',url:'https://www.planetofthevapes.co.uk/reviews/e-liquids/black-note-special-blend-net-e-liquid.html',date:null,bias:'Produse trimise de Black Note',accessed},
 prime:{title:'Prime 15 (Shake “N” Vap) – Halo',publisher:'Le Vapelier',authors:'papagallo',url:'https://www.levapelier.com/prime-15-gamme-shake-n-vap-par-halo/',date:'2021-07-29',bias:'Material furnizat de Nicovip',accessed},
 tribeca:{title:'Tribeca (Shake “N” Vap) – Halo',publisher:'Le Vapelier',authors:'papagallo',url:'https://www.levapelier.com/tribeca-gamme-shake-n-vap-par-halo/',date:'2021-07-20',bias:'Material furnizat de Nicovip',accessed},
 manabush:{title:'The Big Manabush Review – Part 1',publisher:'Planet of the Vapes',authors:'Toby Kilroy',url:'https://www.planetofthevapes.co.uk/reviews/e-liquids/occultscientist_the-big-manabush-review-part-1.html',date:null,bias:'Gama trimisă de Manabush',accessed},
 omusa:{title:'Omusa by Manabush',publisher:'Planet of the Vapes',authors:'VapeMaster; MrTeaTime; dw1986',url:'https://www.planetofthevapes.co.uk/reviews/e-liquids/vapemaster_omusa-by-manabush.html',date:'2015-08-03',bias:'Mostre trimise de Manabush; trei opinii în același articol, nu trei surse independente',accessed},
 deadwood:{title:'Deadwood Blends by Manabush',publisher:'Planet of the Vapes',authors:'Michelle (Purplefowler)',url:'https://www.planetofthevapes.co.uk/reviews/e-liquids/deadwood-blends-by-manabush.html',date:null,bias:'Gama trimisă de Manabush',accessed}
};
Object.assign(sources,{
 "faVirginia": {
  "title": "Virginia par Flavour Art",
  "publisher": "Le Vapelier",
  "authors": "papagallo",
  "url": "https://www.levapelier.com/virginia-par-flavour-art/",
  "date": "2017-05-13",
  "bias": "Material furnizat de Flavour Art",
  "accessed": "2026-10-15"
 },
 "faDesert": {
  "title": "Desert Ship par Flavour Art",
  "publisher": "Le Vapelier",
  "authors": "papagallo",
  "url": "https://www.levapelier.com/desert-ship-par-flavour-art/",
  "date": "2017-05-28",
  "bias": "Material furnizat de Flavour Art",
  "accessed": "2026-10-15"
 },
 "pulpKentucky": {
  "title": "Kentucky Brun par Pulp",
  "publisher": "Le Vapelier",
  "authors": "Nérilka",
  "url": "https://www.levapelier.com/kentucky-brun-par-pulp/",
  "date": "2022-04-14",
  "bias": "Material furnizat de Pulp Liquide",
  "accessed": "2026-10-15"
 },
 "pulpTennessee": {
  "title": "Tabac Blend Tennessee par Pulp",
  "publisher": "Le Vapelier",
  "authors": "papagallo",
  "url": "https://www.levapelier.com/tabac-blend-tennessee-par-pulp/",
  "date": "2015-01-05",
  "bias": "Material furnizat de Pulp",
  "accessed": "2026-10-15"
 },
 "pulpMozambique": {
  "title": "Tabac Mozambique (train 2) par Pulp",
  "publisher": "Le Vapelier",
  "authors": "jedivapes",
  "url": "https://www.levapelier.com/tabac-mozambique-train-2-par-pulp/",
  "date": "2016-03-26",
  "bias": "Material furnizat de Pulp",
  "accessed": "2026-10-15"
 },
 "nhossBlond": {
  "title": "Classic Blond par Nhoss",
  "publisher": "Le Vapelier",
  "authors": "Marquolive",
  "url": "https://www.levapelier.com/classic-blond-par-nhoss/",
  "date": "2018-08-25",
  "bias": "Material furnizat de Nhoss",
  "accessed": "2026-10-15"
 },
 "tevap": {
  "title": "Blond de Garonne par Terroir & Vapeur",
  "publisher": "Le Vapelier",
  "authors": "sylvie.i",
  "url": "https://www.levapelier.com/blond-de-garonne-par-terroir-vapeur-tevap/",
  "date": "2017-05-04",
  "bias": "Material furnizat de TeVap",
  "accessed": "2026-10-15"
 },
 "leaf": {
  "title": "Manabush Leaf tobacco range",
  "publisher": "POTV Forum",
  "authors": "eyeball kid",
  "url": "https://forum.planetofthevapes.co.uk/threads/manabush-leaf-tobacco-range.208069/",
  "date": "2021-08-27",
  "bias": "Mostre menționate; autorul declară afinitate pentru Manabush",
  "accessed": "2026-10-15"
 },
 "purosDark": {
  "title": "El-Toro Puros Dark by House of Liquid",
  "publisher": "Vaping Giraffe",
  "authors": "Morten Moe / Vaping Giraffe",
  "url": "https://vapingiraffe.blogspot.com/2015/06/juice-review-el-toro-puros-dark-by.html",
  "date": "2015-06-13",
  "bias": "Mostră gratuită de la Georgio/eBaron; autorul declară că articolul nu conține linkuri afiliate",
  "accessed": "2026-10-15"
 },
 "elToro": {
  "title": "El Toro Range by Absolute Toro",
  "publisher": "POTV Forum",
  "authors": "Rob; include citate dw1986/VapeMaster",
  "url": "https://forum.planetofthevapes.co.uk/threads/el-toro-range-by-absolute-toro.164601/",
  "date": "2018-07-04",
  "bias": "Mostre primite menționate; reia review-uri din 2015. Articolul POTV republicat nu este o sursă independentă",
  "accessed": "2026-10-15"
 },
 "kind": {
  "title": "Kind Juice E-Liquid Review",
  "publisher": "Ecigclick",
  "authors": "Neil Humber",
  "url": "https://www.ecigclick.co.uk/kind-juice-e-liquid-review/",
  "date": "2019-06-08",
  "bias": "Mostre gratuite de la Kind Juice; publicație cu afiliere comercială",
  "accessed": "2026-10-15"
 },
 "ltEnglish": {
  "title": "La Tabaccheria English Mixture – postările 4 și 6",
  "publisher": "Sigaretta Elettronica Forum",
  "authors": "Alvi",
  "url": "https://www.sigarettaelettronicaforum.com/threads/la-tabaccheria-english-mixture.11094/",
  "date": "2016-07-12",
  "bias": "Relatare personală în forum; finanțarea nu este precizată. Mai multe postări ale aceluiași autor nu sunt surse independente",
  "accessed": "2026-10-15"
 },
 "ltReserve": {
  "title": "La Tabaccheria Baffometto Reserve – postarea 1",
  "publisher": "Sigaretta Elettronica Forum",
  "authors": "Utente 29335 (identificatorul afișat)",
  "url": "https://www.sigarettaelettronicaforum.com/threads/la-tabaccheria-baffometto-reserve.32004/",
  "date": "2019-10-30",
  "bias": "Achiziție proprie declarată; autor identificat doar prin ID, nu expertiză verificată",
  "accessed": "2026-10-15"
 },
 "pulpAlabama": {
  "title": "Tabac Alabama par Pulp",
  "publisher": "Le Vapelier",
  "authors": "papagallo",
  "url": "https://www.levapelier.com/tabac-alabama-par-pulp/",
  "date": "2015-01-15",
  "bias": "Material furnizat de Pulp",
  "accessed": "2026-10-15"
 }
});
sources.ltReserve.identityLimited=true;
const rows=[];
function add(id,brand,name,category,version,profile,why,sourceId,matchName=null,line=null,caveat=''){
 rows.push({id,brand,name,category,version,profile,why,sourceIds:[sourceId],match:matchName?{brand,name:matchName,line,category}:null,caveat,confidence:'Review singular',consensus:false});
}
const bnLine='Traditional Tobacco',bnVersion='E-liquid original / nume muzical evaluat; edițiile actuale pot diferi';
[
 ['prelude','Virginia / Prelude','Virginia delicată, ușor dulce.','Preferat pentru finețe în review.','Virginia (Prelude)'],
 ['forte','Burley / Forte','Corp plin, caracter de Burley.','Review-ul apreciază echilibrul și textura.','Burley (Forte)'],
 ['legato','Kentucky / Legato','Lemn, pământ, nuanță de nucă.','Evaluare favorabilă pentru corp și finețe.','Kentucky (Legato)'],
 ['sonata','Cavendish / Sonata','Dulceață de tutun, senzație cremoasă.','Review favorabil profilului rotund.','Cavendish (Sonata)'],
 ['quartet','Latakia / Quartet','Uscat, fum, final piperat.','Neil H apreciază caracterul pronunțat.','Latakia (Quartet)'],
 ['concerto','Cigar / Concerto','Țigară de foi, condimente, fum discret.','Neil H apreciază intensitatea și textura.','Cigar (Concerto)']
].forEach(([id,name,profile,why,match])=>add('bn-'+id,'Black Note',name,'NET simplu',bnVersion,profile,why,'bn',match,bnLine,'Potrivire la reperul comercial din catalog, nu certificare de lot sau formulă actuală.'));
[
 ['burley','Burley','Uscat, lemnos, prăjit.','Distincția Top Vapelier în review.','ltBurley'],
 ['latakia','Latakia','Fum, tămâie, condimente, piele.','Distincția Top Vapelier în review.','ltLatakia'],
 ['kentucky','Kentucky','Fum de lemn, piele, intens și uscat.','Distincția Top Vapelier în review.','ltKentucky'],
 ['cavendish','Cavendish','Corp blond, miere și nuanțe de fond.','Distincția Top Vapelier în review.','ltCavendish']
].forEach(([id,name,profile,why,source])=>add('lt-single-'+id,'La Tabaccheria',name,'NET simplu','Extra Dry 4Pod / Single Line / longfill 40 ml',profile,why,source,null,null,'Versiune distinctă de extrasele clasice din catalog. Single Line este clasificarea comercială.'+(id==='cavendish'?' Cavendish descrie o preparare și nu dovedește o singură specie botanică.':'')));
add('bn-special','Black Note','Special Blend','NET complex','Special Blend evaluat în review','Virginia, Burley și Oriental; lemn discret.','Review favorabil amestecului echilibrat.','special','Special Blend','Natural Tobacco','Catalogul nu identifică lotul/formula; review-ul nu confirmă edițiile ulterioare.');
add('bn-special-3','Black Note','Special Blend 3.0','NET complex','Special Blend 3.0 evaluat separat','Mai întunecat, dens și condimentat.','Reviewerul îl diferențiază de versiunea originală.','special',null,null,'Nu se confundă cu Special Blend fără versiune din catalog.');
add('bn-special-menthol','Black Note','Special Blend Menthol','NET complex','Blend cu mentol, evaluat separat','Tutun American Blend și mentă.','Review favorabil versiunii mentolate.','special',null,null,'Nu se confundă cu Special Blend ori Solo.');
add('bn-solo','Black Note','Solo','NET complex','E-liquid Solo evaluat în gama originală','Virginia delicată și mentol.','Review favorabil echilibrului mentolat.','bn',null,null,'NET aromatizat: frunza este completată de mentol.');
add('halo-prime','Halo','Prime 15','Tutun simplu','Shake “N” Vap / 50 ml, review 2021','Tutun uscat, lemn, nuanță de cacao.','Distincția Top Jus în review.','prime',null,null,'Tutun dominant; cacao este o notă percepută, nu dovadă de ingredient adăugat. Originea NET nu este documentată în review; clasificare editorială aromatizată. Catalogul are numele Prime15 fără această versiune.');
add('halo-tribeca','Halo','Tribeca','Tutun complex','Shake “N” Vap / 50 ml, review 2021','Tutun blond, vanilie, caramel, nuci.','Distincția Top Jus în review.','tribeca',null,null,'Catalogul nu separă această versiune de concentrat ori alte ediții. Clasificarea este editorială, fără dovadă NET.');
[
 ['powwow','Powwow Sauce','Tutun dulce, cremă și nuanțe de custard.','Unul dintre preferatele reviewerului.'],
 ['ixcacao','IxCaCao','Tutun, ciocolată, nuanțe de nucă.','Unul dintre preferatele reviewerului.'],
 ['waxahachie','Waxahachie','Tutun și turtă dulce cu ghimbir.','Evaluare favorabilă combinației.'],
 ['nanabozho','Nanabozho','Tutun, banană și nuanțe de cremă.','Evaluare favorabilă profilului stratificat.']
].forEach(([id,name,profile,why])=>add('manabush-'+id,'Manabush',name,'Tutun complex','Nokomis / gama originală evaluată',profile,why,'manabush',name,'Nokomis / FireWater / Extended','Reper asociat gamei originale; nu transferăm review-ul către variante Extended sau reformulări. Clasificare editorială aromatizată, fără dovadă NET.'));
add('manabush-omusa','Manabush','Omusa','Tutun complex','Omusa original / e-liquid 10 ml evaluat în 2015','Tutun, rom, vanilie și toffee.','Trei opinii favorabile în articolul de review.','omusa','Omusa','Nokomis / FireWater / Extended','Același articol și același lot furnizat: nu afirmăm consens independent.');
[
 ['prairie','Prairie Dawn','Tutun, patiserie și cremă de vanilie.','Reviewerul apreciază finalul cremos.'],
 ['wildbil','Wild Bil','Tutun, whisky și cremă.','Reviewerul apreciază diferențierea profilului.'],
 ['calamity','Calamity AM','Migdale, vanilie, smochină și tutun.','Reviewerul apreciază combinația distinctă.']
].forEach(([id,name,profile,why])=>add('deadwood-'+id,'Manabush',name,'Tutun complex','Deadwood Blends / shortfill evaluat',profile,why,'deadwood',name,'Deadwood Blends','Reper comercial asociat; nu certifică versiunea, lotul sau disponibilitatea actuală.'));
add("fa-virginia","FlavourArt","Virginia","Tutun simplu","E-liquid 10 ml evaluat în 2017","Blond delicat, dulce, cu final lemnos.","Review favorabil fineții; intensitate aromatică redusă.","faVirginia",null,null,"Nu este review al concentratului; nu certifică o formulă actuală sau o extracție NET.");
add("fa-desert","FlavourArt","Desert Ship","Tutun simplu","E-liquid 10 ml evaluat în 2017","Profil oriental, rotund, cu condimente discrete.","Reviewerul apreciază echilibrul; nu îl recomandă ca gust foarte puternic.","faDesert",null,null,"Profil de aromă, nu dovadă a frunzei ori a unui ingredient. E-liquidul nu se confundă cu aroma concentrată.");
add("pulp-kentucky","Pulp","Kentucky Brun","Tutun simplu","E-liquid 10 ml, review 2022","Brun uscat, ușor afumat și discret dulce.","Top Jus în review; putere aromatică apreciată.","pulpKentucky",null,null,"Reperul de 10 ml evaluat, fără transfer la alt format/formulă; NET nu este documentat de această sursă.");
add("pulp-tennessee","Pulp","Tabac Blend Tennessee","Tutun simplu","E-liquid 20 ml, review 2015","Tutun sec, floral discret, nuanță de nucă verde.","Review favorabil echilibrului, cu caracter convențional.","pulpTennessee",null,null,"Selecție editorială pentru profilul de tutun; nu premiu sau consens. Nu certifică ediția actuală.");
add("pulp-mozambique","Pulp","Tabac Mozambique","Tutun simplu","Train 2 / e-liquid 20 ml, review 2016","Blond blând, cu miros ușor anasonat.","Top Jus în review; gustul de tutun este dominant.","pulpMozambique",null,null,"Se păstrează formatul și ediția din review; mirosul anasonat nu probează ingredient adăugat.");
add("nhoss-blond","Nhoss","Classic Blond","Tutun simplu","E-liquid 10 ml, review 2018","Blond prăjit, toastat, moderat în gură.","Review favorabil utilizării simple; profil convențional, nu etalon de realism.","nhossBlond",null,null,"Review-ul distinge experiența pe pod de cea pe dripper. Nu generalizăm experiența la configurațiile personale.");
add("tevap-garonne","TeVap","Blond de Garonne","Tutun simplu","E-liquid 10 ml, review 2017","Blond cu tonalități brune și dulceață discretă.","Top Jus în review; echilibru și caracter apreciate.","tevap",null,null,"Titlul identifică Garonne; textul are și o mențiune Gascogne. Nu asociem automat un alt nume din catalog.");
add("leaf-cigarillo","Manabush","Cafe Cigarillo","Tutun simplu","Leaf / gama evaluată în 2021","Țigară de foi blândă, parfumată și rotundă.","Recomandare personală puternică a autorului.","leaf",null,null,"Cafe denumește stilul cigarillo, nu cafea, potrivit review-ului. Nu deducem extracție NET; formatul exact al probei nu este precizat.");
add("leaf-corona","Manabush","Gran Corona","Tutun simplu","Leaf / gama evaluată în 2021","Țigară de foi intensă, parfumată.","Preferat de autor pentru caracterul de trabuc.","leaf",null,null,"Comparațiile geografice sunt impresiile autorului, nu analize de origine. Nu deducem extracție NET sau un lot actual.");
add("el-toro-puros-dark","House of Liquid","Puros Dark","NET complex","El Toro Fusion / ediția evaluată în 2015","Tutun cubanez, ciocolată și cafea discrete.","Reviewerul apreciază susținerea tutunului de către aromele secundare.","purosDark",null,null,"Review al ediției originale, nu rebrand actual sau baze NET. Mostră furnizată; nu confirmă un build personal.");
add("el-toro-eden","Absolute Toro","Eden","NET complex","El Toro / rebrand evaluat în 2018","Tutun cubanez și măr proaspăt, nuanțe condimentate.","Preferință personală de durată relatată de Rob.","elToro",null,null,"Rebrandul din 2018 nu certifică formula disponibilă azi. Forumul și articolul republicat sunt aceeași relatare.");
add("el-toro-minotor","Absolute Toro","Minotor","NET complex","El Toro / rebrand evaluat în 2018","Tutun aromatizat, scorțișoară, corp condimentat.","Rob apreciază varianta mai echilibrată decât vechiul Minotaur.","elToro",null,null,"Minotor nu se confundă cu versiunea veche Minotaur sau cu bazele NET.");
add("kind-patriots","Kind Juice","Patriots Brew","NET complex","Tobacco Ridge / proba 12 mg evaluată în 2019","Tutun, arțar afumat și caracter de stejar.","Review favorabil straturilor și echilibrului.","kind",null,null,"NET aromatizat din gama Tobacco Ridge; nu extindem către eNectar. Proporția bazei este contradictorie în articol și nu este preluată.");
add("lt-english-barrique","La Tabaccheria","English Mixture","NET complex","Barrique / concentrat evaluat în 2016","Lemn, tămâie de Latakia și dulceață de Virginia.","Alvi descrie favorabil profilul și evoluția sa.","ltEnglish",null,null,"Concentratul istoric nu se confundă cu 4Pod sau edițiile actuale. Relatare singulară, fără consens; nu preluăm instrucțiuni de preparare.");
add("lt-baffometto-reserve","La Tabaccheria","Baffometto Reserve","NET complex","Concentratul evaluat în octombrie 2019","Black Cavendish dulce, Latakia și Virginia.","Autorul recomandă lichidul, fără a-l considera miraculos.","ltReserve",null,null,"Încredere limitată de identitatea generică afișată. Nu se transferă către 4Pod, Baffometto simplu sau reformulări.");
add("pulp-alabama","Pulp","Tabac Alabama","Tutun complex","E-liquid 20 ml, review 2015","Tutun rotund, cereale, vanilie și nuci prăjite.","Review favorabil rețetei; asemănarea cu Tribeca este subiectivă.","pulpAlabama",null,null,"Nu este o comparație directă cu Tribeca: autorul precizează că nu avea proba alături. Ediția actuală nu este certificată.");
rows.find(e=>e.id==='bn-prelude').photo={src:'./media/black-note-virginia-current.webp',ref:'https://www.blacknote.com/e-juice/virginia-tobacco-e-liquid/',credit:'Black Note',edition:'Ambalaj actual Virginia 60 ml; review-ul privește Prelude original'};
const reviewVisuals={
 "lt-single-kentucky": {
  "src": "./media/market-ltKentucky.webp",
  "ref": "https://www.levapelier.com/kentucky-gamme-single-line-par-la-tabaccheria/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "lt-single-cavendish": {
  "src": "./media/market-ltCavendish.jpg",
  "ref": "https://www.levapelier.com/cavendish-gamme-single-line-par-la-tabaccheria/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "halo-prime": {
  "src": "./media/market-prime.jpg",
  "ref": "https://www.levapelier.com/prime-15-gamme-shake-n-vap-par-halo/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "halo-tribeca": {
  "src": "./media/market-tribeca.jpg",
  "ref": "https://www.levapelier.com/tribeca-gamme-shake-n-vap-par-halo/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "fa-virginia": {
  "src": "./media/market-faVirginia.jpg",
  "ref": "https://www.levapelier.com/virginia-par-flavour-art/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "fa-desert": {
  "src": "./media/market-faDesert.jpg",
  "ref": "https://www.levapelier.com/desert-ship-par-flavour-art/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "pulp-kentucky": {
  "src": "./media/market-pulpKentucky.jpg",
  "ref": "https://www.levapelier.com/kentucky-brun-par-pulp/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "pulp-tennessee": {
  "src": "./media/market-pulpTennessee.jpg",
  "ref": "https://www.levapelier.com/tabac-blend-tennessee-par-pulp/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "pulp-mozambique": {
  "src": "./media/market-pulpMozambique.jpg",
  "ref": "https://www.levapelier.com/tabac-mozambique-train-2-par-pulp/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "nhoss-blond": {
  "src": "./media/market-nhossBlond.jpg",
  "ref": "https://www.levapelier.com/classic-blond-par-nhoss/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "tevap-garonne": {
  "src": "./media/market-tevap.jpg",
  "ref": "https://www.levapelier.com/blond-de-garonne-par-terroir-vapeur-tevap/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 },
 "pulp-alabama": {
  "src": "./media/market-pulpAlabama.jpg",
  "ref": "https://www.levapelier.com/tabac-alabama-par-pulp/",
  "credit": "Le Vapelier",
  "edition": "Vizualul recenziei originale; ediția evaluată, nu un lot actual"
 }
};
for(const entry of rows)if(reviewVisuals[entry.id])entry.reviewVisual=reviewVisuals[entry.id];
for(const entry of rows){const text=entry.name+' '+entry.profile;entry.modelTags=[];for(const tag of ['latakia','kentucky','perique','oriental','cigar'])if(new RegExp(tag,'i').test(text))entry.modelTags.push(tag);if(/nuc|migdale/i.test(text))entry.modelTags.push('nuts');if(/dulc|miere|vanili|caramel|toffee/i.test(text))entry.modelTags.push('sweet');if(entry.category.includes('complex'))entry.modelTags.push('layers');}
window.RTA_MARKET_EVIDENCE={version:1,revised:'2026-10-15',categories:['NET simplu','NET complex','Tutun simplu','Tutun complex'],sources,rows};
})();
