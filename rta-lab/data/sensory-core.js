/* RTA Sensory DNA Core · 2026-10-13
 * Technical hypotheses + explicit personal observations, never fake survey probabilities.
 * The system evaluates a configuration (deck + bell + air + wire + wraps + TC/WATT + position)
 * against a tobacco/NET liquid. It never assigns an absolute global RTA winner.
 */
(function () {
"use strict";
const V="2026-10-14-cl-pairings";
const AXIOMS=[
 "Configurația completă este unitatea de evaluare.",
 "Spectrul aromatic nu este același lucru cu intensitatea.",
 "Simultaneitatea notelor se evaluează distinct de separare.",
 "Prezența pe palat este diferită de volumul de vapori.",
 "Ofensiva și throat hit-ul sunt două senzații distincte.",
 "Separarea nu garantează armonie.",
 "Plăcerea personală nu se calculează automat din parametri tehnici.",
 "Personalitatea și atașamentul nu sunt un TOP universal.",
 "A/B personal prevalează local asupra extrapolării, fără transfer automat.",
 "Orice recomandare explică avantajul, compromisul și certitudinea."
];
const previousBellFitAnalyze=window.RTA_BELL_LIQUID_FIT&&window.RTA_BELL_LIQUID_FIT.analyze;
const DIMENSIONS=[
 {id:"architecture",title:"Arhitectură aromatică",description:"Spectru, separare, simultaneitate și tobacco core."},
 {id:"palate",title:"Prezență pe palat",description:"Bogăție, acoperire, corp și textură."},
 {id:"energy",title:"Energie senzorială",description:"Ofensivă și TH, evaluate separat."},
 {id:"harmony",title:"Armonie și naturalețe",description:"Integrare, echilibru, fluiditate."},
 {id:"pleasure",title:"Plăcere și personalitate",description:"Doar din observațiile personale, nu prezise fizic."}
];
const AIR=(id,label,pattern,holes,spread,extra={})=>({id,label,pattern,holes,spread,...extra});
const PLATFORMS={
 "415":{pattern:"multipoint",volume:"compact-mediu",air:[
 AIR("tasty","Tasty MTL 3×0,9 (documentat)","multipoint",[.9,.9,.9],1.8)],
 traits:{spectrum:4.4,simultaneity:4.25,focus:4.1,palate:4.55,offense:4.0,th:4.15,harmony:4.4},note:"Trei jeturi; sensibil la masa coilului."},
 kprime:{pattern:"single",volume:"mediu",air:[
 AIR("1.2","AFC ≈1,2 mm (orientativ)","single",[1.2],1.35,{estimated:true}),
 AIR("1.6","AFC ≈1,6 mm (orientativ)","single",[1.6],1.5,{estimated:true})],
 traits:{spectrum:4.3,simultaneity:4.3,focus:4.0,palate:4.4,offense:3.8,th:3.8,harmony:4.55},note:"AFC în trepte; atașament personal special."},
 gtone:{pattern:"single",volume:"compact",air:[
 AIR("single12","Pin 1×1,2 mm (standard)","single",[1.2],1.25),
 AIR("single10","Pin 1×1,0 mm (opțional)","single",[1.0],1.20,{optional:true}),
 AIR("single15","Pin 1×1,5 mm (opțional)","single",[1.5],1.5,{optional:true})],
 traits:{spectrum:4.15,simultaneity:3.9,focus:4.9,palate:4.0,offense:4.65,th:4.6,harmony:4.1},note:"Jet vertical unic; K1 29/6 preferat în A/B direct."},
 dvarwcl:{pattern:"single",volume:"mediu",air:[
 AIR("triple06","Insert 3×0,6 mm (validat)","multipoint",[.6,.6,.6],1.95),
 AIR("single12","Insert 1×1,2 mm (alternativă reușită cu K1 28/5)","single",[1.2],1.25),
 AIR("dual08","Insert 2×0,8 mm (familie AFC)","multipoint",[.8,.8],1.65,{optional:true})],
 traits:{spectrum:4.5,simultaneity:3.7,focus:4.8,palate:4.15,offense:4.85,th:4.6,harmony:4.0},note:"Impact muscular, distribuție modificată de insert; 3×0,6/K1 28/6 este preferința generală, dar 1×1,2/K1 28/5 a fost raportat ca reușit. Se schimbă și numărul de spire, nu doar insertul."},
 muted:{pattern:"hybrid",volume:"mediu",air:[
 AIR("triple","Triple-air: 2 laterale + 1 inferior","hybrid",null,2.05),
 AIR("bottom","Bottom-only","single",null,1.3),
 AIR("side","Side-only","side",null,1.8)],
 traits:{spectrum:4.1,simultaneity:4.25,focus:4.0,palate:4.75,offense:4.45,th:4.45,harmony:4.3},note:"Canale lateral/inferior; diametrele nu sunt presupuse."},
 gtr:{pattern:"dual",volume:"mediu",air:[
 AIR("both","Canale 1,0 + 1,2 mm, ambele","dual",[1.0,1.2],1.95),
 AIR("hole10","Canal 1×1,0 mm","single",[1.0],1.24),
 AIR("hole12","Canal 1×1,2 mm","single",[1.2],1.3)],
 traits:{spectrum:4.95,simultaneity:4.75,focus:3.8,palate:4.8,offense:3.4,th:3.3,harmony:4.8},note:"Două jeturi oblice; magia TC este personal validată, nu proprietate universală."},
 dvarwfl:{pattern:"single",volume:"compact",air:[
 AIR("single12","Insert 1×1,2 mm (standard)","single",[1.2],1.25),
 AIR("triple06","Insert 3×0,6 mm (preferat personal pe FL)","multipoint",[.6,.6,.6],1.95),
 AIR("dual08","Insert 2×0,8 mm (opțional)","multipoint",[.8,.8],1.7,{optional:true})],
 traits:{spectrum:4.65,simultaneity:4.25,focus:4.0,palate:4.0,offense:4.0,th:3.9,harmony:4.3},note:"FL favorizează delimitarea notelor; utilizatorul preferă 3×0,6 față de 1×1,2 în comparația cu Balkan Milestone, cu palat/simultaneitate mai bogate și TH puțin mai mic."},
 diplomat:{pattern:"diverter",volume:"mediu",air:[
 AIR("pin18","Diverter 24×0,9 + pin 1,8 mm","diverter",[1.8],2.05),
 AIR("pin12","Diverter 24×0,9 + pin 1,2 mm","diverter",[1.2],1.85)],
 traits:{spectrum:4.55,simultaneity:4.4,focus:4.1,palate:4.4,offense:4.1,th:4.05,harmony:4.35},note:"Distribuitor multipunct, clopote alternative."},
 kx:{pattern:"aerokon",volume:"mediu",air:[
 AIR("mid","AEROKON reglaj mediu (diametru nefixat)","aerokon",null,1.4),
 AIR("tight","AEROKON reglaj strâns","aerokon",null,1.15),
 AIR("open","AEROKON reglaj deschis","aerokon",null,1.70)],
 traits:{spectrum:4.45,simultaneity:4.35,focus:4.3,palate:4.5,offense:4.2,th:4.05,harmony:4.55},note:"AEROKON 0–1,8 mm; reglajele sunt calitative, nu diametre inventate."},
 klp:{pattern:"aerokon",volume:"compact",air:[
 AIR("mid","AEROKON reglaj mediu","aerokon",null,1.4),
 AIR("tight","AEROKON reglaj strâns","aerokon",null,1.15),
 AIR("open","AEROKON reglaj deschis","aerokon",null,1.70)],
 traits:{spectrum:4.65,simultaneity:4.8,focus:4.3,palate:4.75,offense:4.45,th:4.55,harmony:4.7},note:"Spectru bogat și simultan pe 28/5, confirmat personal."},
 asylum:{pattern:"multipoint",volume:"compact-mediu",air:[
 AIR("dual10","Air-pin 2×1,0 mm (inclus în kit; montaj personal de confirmat)","multipoint",[1,1],1.75),
 AIR("dual08","POSIBIL pin 2×0,8 mm · menționat de utilizator, NECONFIRMAT","multipoint",[.8,.8],1.65,{optional:true,estimated:true,unverifiedPersonal:true}),
 AIR("stock","Alt air-pin / montaj anterior (diametru neconfirmat)","single",null,1.5,{estimated:true})],
 traits:{spectrum:4.55,simultaneity:4.3,focus:4.2,palate:4.4,offense:4.25,th:4.15,harmony:4.35},
 note:"Asylum V3: air-pinul 2×1,0 mm este documentat în kit; 0,8 mm este și o poziție distinctă a inelului AFC. Pinul 2×0,8 mm a fost menționat cu incertitudine de utilizator: îl poți simula, dar nu îl declarăm standard, inclus sau montat. Nu atribui niciun pin ambelor exemplare fizice fără confirmare."},
 pmfree:{pattern:"diverter",volume:"mediu",air:[
 AIR("pin12","Diverter 32×0,9 + pin 1,2 mm","diverter",[1.2],2.1),
 AIR("pin08","Diverter 32×0,9 + pin 0,8 mm","diverter",[.8],1.85)],
 traits:{spectrum:4.85,simultaneity:4.25,focus:4.55,palate:4.3,offense:4.55,th:4.35,harmony:4.1},note:"Specialist NET; precizie fără garantarea armoniei personale."},
 pmstd:{pattern:"diverter",volume:"mediu",air:[
 AIR("pin12","Diverter 32×0,9 + pin 1,2 mm","diverter",[1.2],2.1),
 AIR("pin08","Diverter 32×0,9 + pin 0,8 mm","diverter",[.8],1.85)],
 traits:{spectrum:4.6,simultaneity:4.15,focus:4.3,palate:4.5,offense:4.3,th:4.25,harmony:4.3},note:"Aceeași bază cu Freehand, clopot diferit."},
 byka:{pattern:"single",volume:"mediu",air:[
 AIR("pin12","Air-pipe ≈1,2 mm (orientativ)","single",[1.2],1.3,{estimated:true}),
 AIR("pin14","Air-pipe ≈1,4 mm (orientativ)","single",[1.4],1.45,{estimated:true})],
 traits:{spectrum:4.5,simultaneity:4.3,focus:4.1,palate:4.3,offense:4.2,th:4.15,harmony:4.4},note:"Diametrele By-Ka rămân orientative."},
 kv3:{pattern:"single",volume:"compact",air:[
 AIR("screw_mid","AFC intern, reglaj mediu","single",null,1.45),
 AIR("screw_tight","AFC intern, reglaj strâns","single",null,1.2)],
 traits:{spectrum:4.2,simultaneity:3.9,focus:4.4,palate:3.8,offense:4.3,th:4.3,harmony:4.0},note:"K Mini V3 validează 28/6 și 29/6."},
 minister:{pattern:"diverter",volume:"compact",air:[
 AIR("d20","Diverter 20×1 + pin 1,2 mm","diverter",[1.2],1.9),
 AIR("d12","Diverter 12×1 + pin 1,2 mm","diverter",[1.2],1.6)],
 traits:{spectrum:4.2,simultaneity:3.9,focus:4.2,palate:4.5,offense:4.2,th:4.3,harmony:4.0},note:"Diverterul este distribuit, dar camera este compactă."}
};
/* NiFe30 + high-end MTL family affinity: reported for KLP, K Prime,
   KX and GTR; Kayfun Mini V3 remains an extrapolation. Not manufacturer intent. */
const NIFE30_FAMILY=Object.freeze({
 label:"SvoëMesto + Taifun GTR",
 candidates:["klp","kprime","kx","kv3","gtr"],
 reported:["klp","kprime","kx","gtr"],
 untested:["kv3"],
 status:"afinitate personală preliminară; nu proiectare dedicată dovedită",
 explanation:"NiFe30 TC poate aduce finețe și prezență pe palat pe mai multe platforme, dar geometria fiecăreia decide caracterul. Nu atribui automat avantaje tuturor lichidelor sau buildurilor."
});
/* User-declared sensory preferences, not objective proof of alloy identity.
   Dicodes NiFe30 (TCR320) and Zivipf NiFe52 (TCR310) are equal personal
   FIRST choices on four platforms; K1 remains the second-family choice.
   No cross-alloy controlled A/B is inferred on every platform. */
const PERSONAL_PREFS=Object.freeze({
 date:"2026-10-29",
 gtrTC:{dicodes:{wire:"nife30",wraps:7},zivipf:{wire:"nife52",wraps:6},legacyNiFe30:{wire:"nife30",wraps:6}},
 cool415:{first:[{wire:"nife30",wraps:7},{wire:"nife52",wraps:6}],second:{wire:"k128",wraps:6},historical:[{wire:"k128",wraps:5},{wire:"k1clap",wraps:5}]},
 tcEqualAtoms:["klp","gtr","kx","kprime"],
 tcEqualWires:["nife30","nife52"],
 gtone:{first:{wire:"k129",wraps:6},second:{wire:"k128",wraps:5}},
 muted:{first:{wire:"k128",wraps:6},note:"diametrul, airflow-ul și puterea exacte nu au fost precizate de utilizator"},
 dvarwClSingle12:{wire:"k128",wraps:5,air:"single12",status:"alternativă personală reușită, nu A/B controlat față de 3×0,6/6"},
 dvarw:{atoms:["dvarwcl","dvarwfl"],firstAir:"triple06",alternativeAir:"single12"},
 evidence:"preferințe personale declarate direct 14.10.2026; fără identitate materială sau A/B universal"
});
/* Practical setup choices preserve physical configuration, not a universal
   atomizer ranking. 28/5 with single insert has no measured W/Ø/liquid. */
const PERSONAL_SETUPS=Object.freeze({
 dvarwcl:Object.freeze([
  Object.freeze({
   id:"cl-triple-28-6",atom:"dvarwcl",air:"triple06",wire:"k128",wraps:6,
   title:"3×0,6 mm · K1 28 GA / 6 spire",status:"Preferința principală",
   detail:"Multipunct, mai multă dezvoltare aromatică; test personal anterior. Ø2,5 este baseline Lab.",
   evidence:"Observație personală; nu inventăm wattajul ori lichidul."
  }),
  Object.freeze({
   id:"cl-single-28-5",atom:"dvarwcl",air:"single12",wire:"k128",wraps:5,
   title:"1×1,2 mm · K1 28 GA / 5 spire",status:"Alternativă reușită",
   detail:"Merge bine, conform testului tău. Nu este o configurație inferioară universal.",
   evidence:"Observație personală calitativă; lichidul, Ø și W neprecizate."
  })
 ])
});
function personalSetups(atomId){return (PERSONAL_SETUPS[atomId]||[]).map(x=>({...x}));}
function personalPreference(config){
 // Do not extrapolate earlier NiFe TC preferences to the optional NiFe30 WATT mode.
 if(config.wire==="nife30"&&config.regime==="watt")return null;
 // 415 Cool, personal priority 15.10.2026; not universal chemical equivalence.
 if(config.atom==="415"){
  if((config.wire==="nife30"&&config.wraps===7)||(config.wire==="nife52"&&config.wraps===6))
   return {tier:1,label:"415 Cool · NiFe30/7 = NiFe52/6 · prima alegere",
    note:"Preferință declarată, TCR320/310 distincte; lichid, temperatură, wattaj și A/B controlat neprecizate."};
  if(config.wire==="k128"&&config.wraps===6)
   return {tier:2,label:"415 Cool · K1 28 GA / 6 spire · a doua alegere",
    note:"Preferință personală nouă; 28/5 istoric și K1 Clapton/5 specialist rămân disponibile."};
 }
 // New GTR-specific personal finding, 15.10.2026: alloy-specific wraps.
 // NiFe30/6 remains usable; NiFe30/7 and NiFe52/6 share tier #1.
 if(config.atom==="gtr"){
  if((config.wire==="nife30"&&config.wraps===7)||
     (config.wire==="nife52"&&config.wraps===6))
   return {tier:1,label:"Prima preferință personală · NiFe30/7 = NiFe52/6",
     note:"Dicodes RESISTHERM NiFe30 TCR320 cu 7 spire pe GTR sau Zivipf NiFe52 TCR310 cu 6; egale ca preferință, nu aliaje/temperaturi identice."};
  if(config.wire==="nife30"&&config.wraps===6)
   return {tier:2,label:"NiFe30/6 funcțional · alternativă GTR",
     note:"6 spire funcționează, însă noul montaj cu 7 a fost perceput mai coerent în TC. Refacerea coilului a schimbat și alte condiții."};
 }
 if(PERSONAL_PREFS.tcEqualAtoms.includes(config.atom)){
  if((config.wire==="nife30"&&config.wraps===7)||(config.wire==="nife52"&&config.wraps===6))
   return {tier:1,label:"Prima preferință personală · NiFe30/7 = NiFe52/6",note:"Preferință actualizată 29.10.2026: Dicodes TCR320 cu 7 spire, Zivipf TCR310 cu 6; egalitate a preferinței, nu aliaj identic și nu A/B izolat pe toate platformele."};
  if(config.wire==="nife30"&&config.wraps===6)
   return {tier:2,label:"NiFe30/6 · alternativă istorică",note:"Funcțională și disponibilă pentru comparație, dar presetul personal NiFe30 este acum 7 spire."};
  if(["k128","k129"].includes(config.wire))
   return {tier:2,label:"A doua preferință personală · K1",note:"Preferința K1 este sub familia NiFe TC, dar rămâne validă ca alternativă."};
 }
 if(config.wire==="nife30"&&config.wraps===7)
  return {tier:3,label:"Preferință generală de geometrie · NiFe30/7",note:"Alegere globală nouă pentru NiFe30, fără a susține că toate atomizoarele au fost testate ori că NiFe30 depășește materialul preferat al fiecărei platforme."};
 if(config.atom==="gtone"){
  if(config.wire==="k129"&&config.wraps===6)return {tier:1,label:"Prima preferință · K1 29 GA / 6"};
  if(config.wire==="k128"&&config.wraps===5)return {tier:2,label:"A doua preferință · K1 28 GA / 5"};
 }
 if(config.atom==="muted"&&config.wire==="k128"&&config.wraps===6)
  return {tier:1,label:"Prima preferință · Muted+ K1 28 GA / 6",note:"Airflow, diametru și putere încă neprecizate; Ø2,5 este doar presetul modelului."};
 if(config.atom==="dvarwcl"&&config.air==="single12"&&config.wire==="k128"&&config.wraps===5)
  return {tier:2,label:"Alternativă reușită · CL 1×1,2 + K1 28 GA / 5",note:"Utilizatorul confirmă că merge bine; preferința generală 3×0,6 nu invalidează acest build. Se modifică simultan insertul și numărul de spire."};
 if(PERSONAL_PREFS.dvarw.atoms.includes(config.atom)){
  if(config.air==="triple06")return {tier:1,label:"Airflow preferat · insert 3×0,6"};
  if(config.air==="single12")return {tier:2,label:"Airflow alternativ · 1×1,2"};
 }
 return null;
}
const WIRES={
 k128:{name:"Kanthal A1 28 GA",type:"round",diameter:.321,mode:"WATT",power:12.5},
 k129:{name:"Kanthal A1 29 GA",type:"round",diameter:.286,mode:"WATT",power:12.3},
 k1clap:{name:"K1 Clapton 2×30+38",type:"clapton",mode:"WATT",power:12.5},
 ssclap:{name:"SS316L Clapton 2×30+38",type:"clapton",mode:"WATT",power:12.0},
 nife30:{name:"Dicodes RESISTHERM NiFe30 TCR320",type:"tc",mode:"TC",temp:230,power:13},
 nife52:{name:"Zivipf NiFe52 TCR310",type:"tc",mode:"TC",temp:230,power:13}
};
const NIFE30_WATT=Object.freeze({
 power:12,wrapsObserved:7,
 chipsets:Object.freeze({dicodes:"Dicodes",yihi:"YiHi",arc1:"ARC1",dna:"DNA"}),
 evidence:"Personal: NiFe30/7 la 12 W a oferit vapori mai echilibrați termic decât la 13 W. Cele patru chipseturi sunt opțiuni, nu patru teste confirmate."
});
function allowedRegimes(wire){return wire==="nife30"?["tc","watt"]:WIRES[wire]?.type==="tc"?["tc"]:["watt"];}
function modeFor(config){return config?.wire==="nife30"&&config?.regime==="watt"?"watt":WIRES[config?.wire]?.type==="tc"?"tc":"watt";}
const DEFAULTS={
 "415":{wire:"nife30",wraps:7,air:"tasty"},
 kprime:{wire:"nife52",wraps:6,air:"1.2"},
 gtone:{wire:"k129",wraps:6,air:"single12"},
 dvarwcl:{wire:"k128",wraps:6,air:"triple06"},
 muted:{wire:"k128",wraps:6,air:"triple"},
 gtr:{wire:"nife30",wraps:7,air:"both"},
 dvarwfl:{wire:"k128",wraps:6,air:"triple06"},
 diplomat:{wire:"k129",wraps:5,air:"pin18"},
 kx:{wire:"nife30",wraps:7,air:"mid"},
 klp:{wire:"nife30",wraps:7,air:"mid"},
 asylum:{wire:"k128",wraps:6,air:"dual10"},
 pmfree:{wire:"k128",wraps:5,air:"pin12"},
 pmstd:{wire:"k129",wraps:5,air:"pin12"},
 byka:{wire:"k129",wraps:5,air:"pin12"},
 kv3:{wire:"k128",wraps:6,air:"screw_mid"},
 minister:{wire:"k129",wraps:5,air:"d20"}
};
function wireSetup(atom,wire,wraps){
 const w=WIRES[wire];if(!w)return null;
 // Historic KLP DNA 220°C/16 W report belongs ONLY to the six-wrap coil.
 // NiFe30/7 on KLP has no observed temperature/wattage; use generic orientation.
 if(atom==="klp"&&wire==="nife30"&&wraps===6)return {power:16,temp:220};
 if(atom==="gtr"&&wire==="nife30"&&wraps===7)return {power:16,temp:230}; // Reported for this GTR setup alone.
 return {power:w.power,temp:w.temp||230};
}
const OBS=[
 {atom:"klp",wire:"k128",wraps:5,title:"KLP 28/5: bogăție + ofensivă",
  text:"Palat îmbrățișat de un spectru simultan, TH și ofensivă; preferat personal față de 28/6 și 29/6.",
  patch:{simultaneity:4.92,palate:4.9,offense:4.67,th:4.7,harmony:4.8},affinity:"configurație preferată",evidence:"A/B personal 13.10.2026"},
 {atom:"klp",wire:"nife30",wraps:7,partial:true,
  title:"KLP + Dicodes NiFe30/7 · coerență TC actuală",
  text:"Utilizatorul confirmă că NiFe30 cu 7 spire se comportă mai stabil și mai coerent inclusiv pe KLP, față de montajele anterioare cu 6. TH direct poate fi mai redus, dar impresia este de bogăție și rotunjime pe palat. Nu se atribuie exclusiv celei de-a șaptea spire efectul.",
  affinity:"NiFe30/7 · coerență percepută · TH bogat",
  evidence:"actualizare personală 29.10.2026; temperatura, puterea, airflow-ul și lichidul noului montaj neprecizate"},
 {atom:"klp",wire:"nife30",wraps:6,coilMm:2.5,power:16,temp:220,partial:true,
  title:"KLP + Dicodes NiFe30 TC · DNA 220°C / 16 W",
  text:"Față de KLP cu K1 28/5: palat mai bogat, spectru mai bun, TH și ofensivă ușor crescute; apare magia, cu o apropiere senzorială de K Prime cu aceeași sârmă. Nu devine GTR și nu își pierde identitatea.",
  affinity:"magie senzorială · apropiere de K Prime",
  evidence:"observație personală 13.10.2026 · airflow, lichid și puterea comparatorului neprecizate"},
 {atom:"klp",wire:"k128",wraps:6,title:"KLP 28/6: mai analitic, mai blând",
  text:"Scade ofensiva și TH; profil mai moale și analitic, considerat inferior lui 28/5.",
  patch:{separation:4.72,offense:3.35,th:3.55,palate:4.2},affinity:"mai puțin preferat",evidence:"A/B personal 13.10.2026"},
 {atom:"dvarwfl",wire:"k128",wraps:6,air:"triple06",partial:true,liquidName:"Balkan Milestone",
  title:"Dvarw FL 3×0,6 + K1 28 GA / 6 · Balkan Milestone",
  text:"Comparat cu FL 1×1,2 + K1 / 6 pe Balkan Milestone: orizont aromatic mai larg, forță descrisă ca «mușchi 90%», palat ≈25% mai bogat perceput, arome clar simultane și TH foarte puțin mai mic; preferință fermă 3×0,6. Față de KLP K1 28/5, FL este mult mai ofensiv, dar nu egalează plăcerea GTR. Procentele sunt estimări senzoriale, nu măsurători.",
  affinity:"3×0,6 preferat personal pe FL · Balkan Milestone",
  evidence:"A/B personal raportat 14.10.2026; puterea, poziția coilului și Ø neconfirmate; comparatorul FL 1×1,2 a avut K1 / 6"},
 {atom:"dvarwcl",wire:"k128",wraps:5,air:"single12",partial:true,
  title:"Dvarw CL 1×1,2 + K1 28 GA / 5 · alternativă reușită",
  text:"Utilizatorul declară că insertul 1×1,2 merge bine pe Dvarw CL cu K1 28 GA / 5 spire. Rămâne o variantă reușită, nu una slabă, chiar dacă 3×0,6 este preferința generală. Diferența față de CL 3×0,6/6 nu poate fi atribuită exclusiv aerului deoarece și numărul de spire se schimbă.",
  affinity:"configurație bună personal · CL 1×1,2 / K1 28/5",
  evidence:"declarație personală 14.10.2026; lichid, Ø exact, poziție și W neprecizate; nu este comparație controlată doar a insertului"},
 {atom:"dvarwcl",wire:"k128",wraps:6,title:"CL 28/6: ofensivă și focalizare",
  text:"Spectru prezent, dar livrare musculară; o notă poate domina percepția simultană.",
  patch:{offense:4.95,focus:4.9,simultaneity:3.65,palate:4.2},affinity:"caracter ofensiv",evidence:"observație practică 13.10.2026"},
 {atom:"gtr",wire:"nife30",wraps:7,temp:230,power:16,partial:true,
  title:"GTR · Dicodes NiFe30/7 · TC coerent la 230°C",
  text:"Utilizatorul confirmă că montajul nou NiFe30 cu 7 spire pe GTR funcționează normal/coerent la 230°C în TC pe dispozitive Dicodes; limita setată 16 W, aproximativ 12 W indicat în test. NiFe30/6 funcționează și el, însă într-o comparație anterioară pe Dani Box 21700 era perceput mai rece la 230°C. Refacerea coilului/bumbacului și contactele împiedică atribuirea certă a schimbării numai celei de-a șaptea spire.",
  affinity:"coerență TC raportată personal · GTR NiFe30/7",
  evidence:"raport personal 15.10.2026, fără lichid/airflow/poziție și A/B cu o singură variabilă documentate"},
 {atom:"gtr",wire:"nife30",wraps:6,title:"GTR + Dicodes TC: magia pe palat",
  text:"Feeling și stratificare extraordinare; plăcere senzorială maximă, TH mai scăzut.",
  patch:{spectrum:5,separation:5,simultaneity:4.9,palate:5,harmony:4.98,offense:3.25,th:3.1},
  affinity:"magie pe palat · plăcere maximă",evidence:"observație personală 13.10.2026"},
 {atom:"gtr",wire:"k128",title:"GTR K1 28: excelent, dar fără magia TC",
  text:"Foarte bun aromatic, dar nu oferă aceeași senzație specială pe palat precum NiFe30 TC.",
  patch:{spectrum:4.73,separation:4.72,palate:4.38},
  affinity:"foarte bun · magie TC absentă",evidence:"comparație personală 13.10.2026"},
 {atom:"gtone",wire:"k129",wraps:6,title:"GT One K1 29/6 preferat",
  text:"29/6 preferat personal prin A/B direct față de 28/5.",
  patch:{focus:4.9,offense:4.7},
  affinity:"special · preferat pe GT One",evidence:"A/B direct 12.10.2026"},
 {atom:"kx",wire:"k128",wraps:5,title:"KX 28/5 excelent",
  text:"Build personal descris ca extraordinar și natural.",
  patch:{harmony:4.75,palate:4.65},affinity:"extraordinar",evidence:"test personal în Lab"},
 {atom:"kx",wire:"nife30",wraps:6,title:"KX Dicodes TC natural",
  text:"Control termic cu feeling foarte plăcut, consistent.",
  patch:{harmony:4.8,separation:4.75},affinity:"natural · consistent",evidence:"test personal în Lab"},
 {atom:"kprime",wire:"k129",wraps:5,title:"K Prime 29/5 special",
  text:"Round-wire principal curent; atomizor cu atașament personal aparte.",
  patch:{harmony:4.6},affinity:"caracter special",evidence:"preferință personală în Lab"},
 {atom:"415",wire:"nife30",wraps:7,partial:true,title:"415 Cool · Dicodes NiFe30 / 7 spire",
  text:"Utilizatorul raportează o experiență bună pe 415 Cool cu NiFe30 TCR320/7; preferă egal Zivipf NiFe52 TCR310/6, apoi K1 28 GA/6. Nu există date despre lichid, TC, W sau montaj pentru a afirma un A/B controlat.",
  affinity:"preferință personală 415 Cool · NiFe30/7",evidence:"declarație directă 15.10.2026, observație parțială"},
 {atom:"415",wire:"nife52",wraps:6,partial:true,title:"415 Cool · Zivipf NiFe52 / 6 spire",
  text:"Zivipf NiFe52 TCR310/6 merge bine pe 415 Cool, la egalitate personală cu Dicodes NiFe30/7, fără A/B controlat.",
  affinity:"preferință personală 415 Cool · NiFe52/6",evidence:"declarație 15.10.2026; lichid și TC neprecizate"},
 {atom:"415",wire:"k128",wraps:6,partial:true,title:"415 Cool · Kanthal K1 28 GA / 6 spire",
  text:"K1 28 GA/6 merge bine pe 415 Cool și este alegerea următoare după NiFe30/7 și NiFe52/6. K1 28/5 și K1 Clapton/5 rămân istorice, fără a fi eliminate.",
  affinity:"a doua preferință personală 415 Cool · K1 28/6",evidence:"declarație directă 15.10.2026, fără lichid/W/A-B controlat"},
 {atom:"415",wire:"k1clap",wraps:5,title:"415 K1 Clapton preferat istoric în familia Clapton",
  text:"Pereche Clapton dedicată pentru densitate, integrare și corp. Noua ordine personală generală pe 415 este NiFe30/7 = NiFe52/6, apoi K1 28/6.",
  patch:{palate:4.8},affinity:"Clapton preferat",evidence:"validare personală Lab"},
 {atom:"dvarwfl",wire:"ssclap",wraps:5,air:"single12",title:"FL SS316L Clapton dedicat",
  text:"Pereche pentru claritate, top-notes, layering, fără A/B pe toate lichidele.",
  patch:{separation:4.85},affinity:"dedicat · contextual",evidence:"hartă platformă Lab"},
 {atom:"asylum",wire:"k128",wraps:6,bell:"flat",partial:true,title:"Asylum Flat 28/6 validat",
  text:"K1 28 GA / 6 spire cu clopot Flat este preferință personală confirmată. Pinul 2×1,0 mm este documentat pentru model, dar utilizatorul nu a confirmat încă ce pin este montat; dimensiunea exactă din testul anterior Flat/28/6 nu a fost înregistrată; nu pretinde un A/B controlat între air-pinuri.",
  affinity:"Flat + K1 28/6 apreciat personal",evidence:"observație personală; pinul exact al testului istoric neprecizat"},
 {atom:"kv3",wire:"k128",wraps:6,title:"Mini V3 K1 28/6",
  text:"Excepție de 6 spire validată practic.",
  patch:{focus:4.55},affinity:"validat",evidence:"A/B personal Lab"},
 {atom:"kv3",wire:"k129",wraps:6,title:"Mini V3 K1 29/6",
  text:"Excepție de 6 spire validată practic.",
  patch:{focus:4.62},affinity:"validat",evidence:"A/B personal Lab"}
];
const clamp=(n,min=1,max=5)=>Math.max(min,Math.min(max,n));
const round=n=>Math.round(n*100)/100;
const mean=arr=>arr.reduce((a,b)=>a+b,0)/arr.length;
const normalize=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function getAtoms(){return window.RTA_CORE&&window.RTA_CORE.atoms||[];}
function bellFor(id,bellId){
 const cfg=window.RTA_BELL_LIQUID_FIT&&window.RTA_BELL_LIQUID_FIT.config(id);
 if(!cfg)return {id:"standard",name:"Camera originală",tones:{},bonus:[0,0,0,0]};
 return cfg.bells.find(b=>b.id===bellId)||cfg.bells.find(b=>b.id===cfg.defaultId);
}
function permitted(id,wire,wraps){
 if(!PLATFORMS[id]||!WIRES[wire])return false;
 if(wire==="ssclap"&&id==="asylum")return false;
 if(wire==="k128"||wire==="k129")return wraps===5||wraps===6;
 // Global personal NiFe30/7 is available wherever NiFe30/6 was permitted.
 // Six wraps remain available for historical comparisons. NiFe52 stays at six.
 if(wire==="nife30")return wraps===6||wraps===7;
 return wraps===(WIRES[wire].type==="tc"?6:5);
}
function variants(id){
 if(!PLATFORMS[id])return [];
 const opts=[];
 for(const w of Object.keys(WIRES)){
  for(const wraps of ((w==="k128"||w==="k129")?(id==="415"&&w==="k128"?[6,5]:[5,6]):(w==="nife30")?[7,6]:[WIRES[w].type==="tc"?6:5])){
   if(permitted(id,w,wraps))opts.push({wire:w,wraps});
  }
 }
 return opts;
}
function defaults(id) {
 const model=PLATFORMS[id],def=DEFAULTS[id];
 if(!model||!def)return null;
 const bellCfg=window.RTA_BELL_LIQUID_FIT&&window.RTA_BELL_LIQUID_FIT.config(id);
 return {atom:id,bell:bellCfg?bellCfg.defaultId:"standard",air:def.air,wire:def.wire,
  wraps:def.wraps,coilMm:2.5,position:"standard",
  power:wireSetup(id,def.wire,def.wraps).power,temp:wireSetup(id,def.wire,def.wraps).temp,
  regime:WIRES[def.wire].type==="tc"?"tc":"watt",chipset:""};
}
function configuration(id,changes={}) {
 const base=defaults(id);
 if(!base)return null;
 const value={...base,...changes,atom:id};
 if(changes.wire==="nife30"&&changes.wire!==base.wire&&!Object.prototype.hasOwnProperty.call(changes,"wraps"))
  value.wraps=7; // A new material selection uses the current NiFe30 geometry, never inherits NiFe52/6.
 // Selecting a different wire without explicit thermal settings loads the
 // appropriate platform/wire preset. In particular KLP NiFe30 = DNA 220°C / 16 W.
 if(changes.wire && WIRES[changes.wire] && changes.wire!==base.wire){
  const wirePreset=wireSetup(id,changes.wire,Number(value.wraps));
  if(!Object.prototype.hasOwnProperty.call(changes,"power"))value.power=wirePreset.power;
  if(!Object.prototype.hasOwnProperty.call(changes,"temp"))value.temp=wirePreset.temp;
 }
 const model=PLATFORMS[id];
 if(!model.air.some(a=>a.id===value.air))value.air=base.air;
 value.bell=bellFor(id,value.bell).id;
 if(!permitted(id,value.wire,Number(value.wraps))){value.wire=base.wire;value.wraps=base.wraps;}
 value.wraps=Number(value.wraps);
 value.coilMm=[2,2.5,3].includes(Number(value.coilMm))?Number(value.coilMm):2.5;
 if(!["low","standard","high"].includes(value.position))value.position="standard";
 const w=WIRES[value.wire];
 const defaultRegime=w.type==="tc"?"tc":"watt";
 const requestedRegime=(changes.wire&&changes.wire!==base.wire&&!Object.prototype.hasOwnProperty.call(changes,"regime"))?defaultRegime:value.regime;
 value.regime=allowedRegimes(value.wire).includes(requestedRegime)?requestedRegime:defaultRegime;
 if(value.wire==="nife30"&&value.regime==="watt"){
  if(!Object.prototype.hasOwnProperty.call(changes,"power"))value.power=NIFE30_WATT.power;
  value.chipset=Object.prototype.hasOwnProperty.call(NIFE30_WATT.chipsets,value.chipset)?value.chipset:"";
 }else value.chipset="";
 value.power=clamp(Number(value.power)||w.power,7,20);
 value.temp=clamp(Number(value.temp)||230,180,270);
 return value;
}
function airFor(id,config){return PLATFORMS[id].air.find(a=>a.id===config.air);}
function liquidTags(liquid={}){
 const tags=new Set((liquid.tags||[]).map(normalize));
 const text=normalize([liquid.class,liquid.name,liquid.brand,liquid.profile,liquid.line,(liquid.tags||[]).join(" ")].join(" "));
 const p={net:String(liquid.class||"").startsWith("NET"),
 complex:String(liquid.class||"").includes("complex"),
 dark:/latakia|kentucky|dark|smok|afumat|burley|cigar|trabuc/.test(text),
 bright:/virginia|oriental|perique|floral|citrus|vaper/.test(text),
 rich:/nut|nuc|alun|cream|cavendish|bourbon|caramel|vanil|cuban|cigar/.test(text),
 dry:/dry|sec|uscat|latakia|kentucky/.test(text),
 simple:String(liquid.class||"").includes("simplu")};
 for(const k of ["latakia","oriental","perique","kentucky","cigar","nuts","sweet","layers"])if(tags.has(k))p[k]=true;
 return p;
}
function physical(config) {
 const w=WIRES[config.wire],a=airFor(config.atom,config);
 const circumference=Math.PI*config.coilMm;
 const width= w.type==="round"?w.diameter*config.wraps:
  w.type==="clapton"?config.wraps*.58:config.wraps*.31;
 const geometricCoilMetal=w.type==="round"?
   Math.PI*Math.pow(w.diameter/2,2)*circumference*config.wraps:null;
 const airArea=a.holes?a.holes.reduce((sum,d)=>sum+Math.PI*d*d/4,0):null;
 const coverageMatch=clamp(5-Math.abs(width-a.spread)*2.15,1,5);
 return {widthMm:round(width),areaMm2:airArea==null?null:round(airArea),
  relativeRoundMetalMm3:geometricCoilMetal==null?null:round(geometricCoilMetal),
  coverageMatch:round(coverageMatch),air:a,wire:w};
}
function anchorsFor(config) {
 // User A/B evidence applies only near the actual canonical setup.
 // Changing the air, bell, coil diameter, height or power turns the result into an extrapolation.
 const defaults=DEFAULTS[config.atom];
 if(config.wire==="nife30"&&modeFor(config)==="watt")return [];
 const expectedBell=bellFor(config.atom,defaults&&defaults.bell).id;
 const preset=wireSetup(config.atom,config.wire,config.wraps);
 if(!defaults || config.position!=="standard" ||
    config.coilMm!==2.5 || Math.abs(config.power-preset.power)>1.25 ||
    config.bell!==expectedBell)return [];
 return OBS.filter(o=>!o.partial&&o.atom===config.atom&&o.wire===config.wire &&
   (o.air?o.air===config.air:config.air===defaults.air) &&
   (o.wraps==null||o.wraps===config.wraps) &&
   (!o.bell||o.bell===config.bell));
}
function partialReportsFor(config){
 if(config.wire==="nife30"&&modeFor(config)==="watt")return [];
 // Do not transfer this report to untested TC settings; airflow/liquid were not recorded.
 return OBS.filter(o=>o.partial && o.atom===config.atom && o.wire===config.wire &&
   (o.wraps==null||o.wraps===config.wraps) &&
   (o.air==null||o.air===config.air) &&
   (o.bell==null||o.bell===config.bell) &&
   (o.coilMm==null||o.coilMm===config.coilMm) &&
   (o.power==null||Math.abs(o.power-config.power)<0.1) &&
   (o.temp==null||Math.abs(o.temp-config.temp)<1));
}
function technicalBaseline(config,liquid) {
 const tech=PLATFORMS[config.atom], phys=physical(config), bell=bellFor(config.atom,config.bell);
 const tags=liquidTags(liquid),w=phys.wire,a=phys.air;
 const isTC=modeFor(config)==="tc",isClap=w.type==="clapton";
 const multi=["multipoint","dual","diverter"].includes(a.pattern);
 const focus=a.pattern==="single"||a.pattern==="aerokon";
 const wrapDelta=config.wraps-5;
 const position=config.position==="high"?1:config.position==="low"?-1:0;
 const powerShift=(config.power-w.power)*.12;
 const flowShift=(phys.areaMm2==null?0:clamp(1-phys.areaMm2,-.6,.6));
 let result={
  spectrum:tech.traits.spectrum+(tags.complex?.14:0)+(multi?.12:0)+(isTC?.15:0),
  separation:tech.traits.spectrum-.35+(multi?.22:0)+(isTC?.18:0)+(config.wire==="ssclap"?.22:0),
  simultaneity:tech.traits.simultaneity+(isTC?.16:0)+(multi?.13:0)-(config.wire==="k129"?.10:0),
  focus:tech.traits.focus+(focus?.16:0)+(config.wire==="k129"?.16:0)-(multi?.13:0),
  palate:tech.traits.palate+(isClap?.20:0)+(isTC?.15:0)+(config.wire==="k128"?.11:0)+powerShift*.35,
  offense:tech.traits.offense+(config.wire==="k129"?.24:0)+(isClap?.12:0)-(isTC?.35:0)
    -wrapDelta*.23+powerShift+position*.16+flowShift*.12,
  th:tech.traits.th+(config.wire==="k129"?.20:0)-(isTC?.26:0)-wrapDelta*.21+position*.20+powerShift*.55,
  harmony:tech.traits.harmony+(isTC?.20:0)+(config.wire==="k128"?.09:0)-(config.wire==="k129"?.08:0),
  texture:tech.traits.palate+(isClap?.18:0)+(isTC?.20:0),
  tobaccoCore:4.25+(tags.net?.25:0)+(tags.rich?-.07:0)+(config.wire==="k129"?.10:0)
 };
 const coverageDelta=(phys.coverageMatch-4)*.08;
 result.separation+=coverageDelta;
 result.simultaneity+=coverageDelta;
 if(config.wire==="ssclap"){result.separation+=.16;result.offense-=.08;}
 if(config.wire==="k1clap"){result.palate+=.12;result.harmony+=.10;result.separation-=.12;}
 if(config.wire==="nife30"&&config.atom==="gtr"){result.palate+=.2;result.harmony+=.1;}
 // KLP-specific hypothesis calibrated directionally from the reported 220°C/16 W
 // comparison. This is NOT a measured effect or universal benefit of NiFe30.
 if(config.atom==="klp"&&config.wire==="nife30"&&modeFor(config)==="tc"&&config.wraps===6 &&
    Math.abs(config.power-16)<=.5 && Math.abs(config.temp-220)<=5){
   result.spectrum+=.20;result.simultaneity+=.10;result.palate+=.20;
   result.offense+=.50;result.th+=.45;result.harmony+=.10;
 }
 if(config.atom==="dvarwcl"){
  if(config.air==="single12"){result.offense+=.26;result.focus+=.25;result.simultaneity-=.12;}
  if(config.air==="triple06"){result.offense+=.08;result.simultaneity+=.1;result.focus-=.08;}
 }
 if(config.atom==="dvarwfl"&&config.air==="triple06"){
  result.separation+=.12;result.simultaneity+=.1;
  // Small directional hypothesis from the user's Balkan Milestone A/B,
  // not a cross-liquid measured +25% or an automatic pleasure score.
  if(config.wire==="k128"&&config.wraps===6){
   result.spectrum+=.12;result.palate+=.22;result.simultaneity+=.19;
   result.th-=.05;result.offense+=.07;
  }
 }
 if(config.atom==="klp"&&config.wire==="k128"&&config.wraps===6){
  result.offense-=.33;result.th-=.25;result.separation+=.10;
 }
 if(config.atom==="gtone"&&config.wire==="k129"&&config.wraps===6){result.offense+=.08;result.separation+=.12;}
 if(["freehand","flat"].includes(config.bell)){result.separation+=.19;result.simultaneity+=.10;result.harmony-=.04;}
 if(["rhodesian","dome"].includes(config.bell)){result.palate+=.25;result.texture+=.16;result.harmony+=.12;result.separation-=.08;}
 if(config.atom==="pmfree"||config.atom==="pmstd"){
  if(tags.net){result.separation+=.15;result.tobaccoCore+=.13;}
 }
 if(tags.dark){result.offense+=.09;result.tobaccoCore+=.10;}
 if(tags.rich){result.palate+=.08;result.harmony+=(isClap?.08:0);}
 if(tags.bright){result.separation+=.07;}
 Object.keys(result).forEach(k=>result[k]=round(clamp(result[k])));
 return {signal:result,physical:phys,tags};
}
function label(value) {return value>=4.7?"Foarte pronunțat":value>=4.25?"Pronunțat":value>=3.7?"Echilibrat":"Moderat";}
function analyze(input,liquid={},objective="complete"){
 const config=configuration(typeof input==="string"?input:input.atom,typeof input==="string"?{}:input);
 if(!config)return null;
 const res=technicalBaseline(config,liquid);
 const signal={...res.signal},anchors=anchorsFor(config),partialReports=partialReportsFor(config);
 for(const obs of anchors)Object.assign(signal,obs.patch);
 Object.keys(signal).forEach(k=>signal[k]=round(clamp(signal[k])));
 const dimensions={
  architecture:round(mean([signal.spectrum,signal.separation,signal.simultaneity,signal.tobaccoCore])),
  palate:round(mean([signal.palate,signal.texture,signal.simultaneity])),
  energy:round(mean([signal.offense,signal.th])),
  harmony:signal.harmony,
  pleasure:null
 };
 // Personal pleasure is qualitative and only surfaced for explicit user observations.
 const personal=anchors.length?anchors.map(o=>o.affinity).join(" / "):
   partialReports.length?partialReports.map(o=>o.affinity).join(" / "):null;
 const w=res.physical.wire,air=res.physical.air;
 const advantages=[],tradeoffs=[];
 if(signal.simultaneity>=4.6)advantages.push("nuanțe percepute simultan");
 else if(signal.focus>=4.5)advantages.push("accent aromatic focalizat");
 if(signal.palate>=4.7)advantages.push("palat bogat, cuprins de aromă");
 if(signal.separation>=4.65)advantages.push("separare fină a straturilor");
 if(signal.offense>=4.55)advantages.push("ofensivă pronunțată");
 if(signal.harmony>=4.7)advantages.push("integrare armonioasă");
 if(signal.th<3.7)tradeoffs.push("TH mai blând");
 if(signal.offense<3.7)tradeoffs.push("impact fizic moderat");
 if(signal.simultaneity<4.0)tradeoffs.push("o notă poate domina atenția");
 if(signal.separation<4.0)tradeoffs.push("separare mai puțin analitică");
 if(!advantages.length)advantages.push("profil aromatic echilibrat");
 if(!tradeoffs.length)tradeoffs.push("depinde mult de lichid și reglaj");
 const status=anchors.length?"observație personală + extrapolare la lichid":
  partialReports.length?"observație personală parțială + extrapolare tehnică":"predicție tehnică orientativă";
 const personalPref=personalPreference(config);
 const notes=[
  "Airflow: "+air.label+(res.physical.areaMm2!=null?", arie nominală "+res.physical.areaMm2+" mm²":"")+
   "; aria geometrică nu prezice singură debitul.",
  "Build: "+w.name+", Ø"+config.coilMm+", "+config.wraps+" spire, poziție "+config.position+
   ", "+(modeFor(config)==="tc"?"TC "+config.temp+"°C / limită "+config.power+" W":"WATT "+config.power+" W")+".",
  "Clopot: "+bellFor(config.atom,config.bell).name+"."
 ];
 if(air.optional||air.estimated)notes.push("Configurație airflow opțională/orientativă; verifică piesele deținute.");
 if(personalPref)notes.push(personalPref.label+(personalPref.note?" — "+personalPref.note:"")+".");
 if(config.atom==="dvarwfl"&&config.air==="triple06")
  notes.push("Validare A/B numai pe Balkan Milestone: 3×0,6 a fost preferat lui 1×1,2 la 6 spire K1; ≈25% mai mult palat reprezintă aprecierea personală, nu un coeficient universal.");
 if(config.atom==="dvarwcl"&&config.air==="triple06")
  notes.push("Dvarw CL: 3×0,6 + K1 28/6 este preferința generală. Separat, 1×1,2 + K1 28/5 a fost declarat reușit; schimbarea simultană a numărului de spire împiedică atribuirea diferențelor doar insertului.");
 if(config.atom==="dvarwcl"&&config.air==="single12"&&config.wire==="k128"&&config.wraps===5)
  notes.push("Dvarw CL: 1×1,2 cu K1 28 GA/5 merge bine conform testului personal; nu îl considera inferior în mod absolut lui 3×0,6/6. Lichidul și puterea nu au fost precizate.");
 if(config.wire==="nife52")notes.push("NiFe52 rămâne fără verdict universal cross-alloy față de Dicodes NiFe30.");
 if(config.wire==="nife30"&&modeFor(config)==="watt"){
  notes.push("NiFe30 în WATT la "+config.power+" W; chipset "+(NIFE30_WATT.chipsets[config.chipset]||"nespecificat")+". Dicodes, YiHi, ARC1 și DNA sunt opțiuni pentru moduri electronice compatibile, nu patru teste personale confirmate.");
  if(config.wraps===7&&Math.abs(config.power-12)<.1)
   notes.push("Personal: la 7 spire, NiFe30 în WATT 12 W a avut o căldură mai echilibrată decât la 13 W. Separat, Zivipf NiFe52/6 a mers bine în TC; s-au schimbat aliajul, spirele și regimul, deci nu avem o comparație izolată.");
 }
 if(config.wire==="nife30"&&config.wraps===7&&modeFor(config)==="tc")
  notes.push("Regulă personală 29.10.2026: 7 spire NiFe30 este geometria implicită pe orice atomizor compatibil. Observație: TH direct poate fi mai mic decât la 6, dar senzația pe palat este mai bogată/rotundă («TH de bogăție»). Nu sunt procente măsurate și nu toate platformele au fost testate.");
 if(config.atom==="gtr"&&config.wire==="nife30"&&modeFor(config)==="tc")
  notes.push(config.wraps===7?
   "GTR + Dicodes NiFe30/7: utilizatorul raportează TC coerent la 230°C, limită 16 W; NiFe30/6 rămâne funcțional. Efectul izolat al unei spire în plus NU a fost demonstrat.":
   "GTR + Dicodes NiFe30/6: variantă funcțională istorică; noul NiFe30/7 este preferat personal pentru reglare TC mai coerentă, fără concluzie universală.");
 if(config.atom==="gtr"&&config.wire==="nife52"&&config.wraps===6)
  notes.push("GTR + Zivipf NiFe52/6 TCR310: alegere personală la egalitate cu Dicodes NiFe30/7, nu cu setări TC identice.");
 if(config.atom==="415"){
  if(config.wire==="nife30"&&modeFor(config)==="tc"&&config.wraps===7)notes.push("415 Cool + Dicodes NiFe30/7 TCR320: egal preferat cu Zivipf NiFe52/6 TCR310; nu se transferă setări TC de pe GTR.");
  if(config.wire==="nife52"&&config.wraps===6)notes.push("415 Cool + Zivipf NiFe52/6 TCR310: egal preferat cu Dicodes NiFe30/7.");
  if(config.wire==="k128"&&config.wraps===6)notes.push("415 Cool + Kanthal K1 28 GA / 6 spire: a doua alegere; 28/5 rămâne disponibil istoric.");
 }
 if(config.atom==="klp"&&config.wire==="k128"&&config.wraps===6)
   notes.push("A/B: utilizatorul preferă KLP K1 28/5; 28/6 a fost mai moale și cu TH mai mic.");
 if(config.atom==="klp"&&config.wire==="nife30"&&modeFor(config)==="tc")notes.push(config.wraps===6?
   "KLP NiFe30/6 ISTORIC: 220°C / 16 W sunt setările raportate pe DNA doar pentru acel montaj, nu pentru noul NiFe30/7.":
   "KLP NiFe30/7 ACTUAL: preferat pentru coerență, dar 220°C/16 W din vechiul test NiFe30/6 NU sunt setări observate pe acest montaj. Valorile afișate sunt un preset tehnic orientativ.");
 if(NIFE30_FAMILY.candidates.includes(config.atom)&&config.wire==="nife30"&&modeFor(config)==="tc")notes.push(NIFE30_FAMILY.explanation);
 if(config.atom==="asylum"&&config.bell==="dome")
   notes.push("Asylum Dome nu preia automat validarea Flat/28/6.");
 const ext=anchors.map(o=>({title:o.title,text:o.text,evidence:o.evidence}));
 const modelWarning="Indicatorii interni sunt estimări, nu măsurători ale aromei sau garanții.";
 return {config,objective,signals:signal,dimensions,physical:res.physical,
  labels:Object.fromEntries(Object.entries(dimensions).filter(([k,v])=>v!=null).map(([k,v])=>[k,label(v)])),
  pleasure:personal,anchors:ext,personalPreference:personalPref,
  partialEvidence:partialReports.map(o=>({title:o.title,text:o.text,evidence:o.evidence,liquidName:o.liquidName||null})),
  certainty:status,advantages,tradeoffs,notes,modelWarning};
}
const GOALS={
 complete:{architecture:.30,palate:.27,harmony:.26,energy:.17},
 layers:{architecture:.48,palate:.25,harmony:.20,energy:.07},
 th:{architecture:.16,palate:.20,harmony:.09,energy:.55},
 tobacco:{architecture:.22,palate:.18,harmony:.18,energy:.42},
 body:{architecture:.15,palate:.52,harmony:.17,energy:.16},
 smooth:{architecture:.32,palate:.25,harmony:.40,energy:.03}
};
function priority(result,objective="complete"){
 const weights=GOALS[objective]||GOALS.complete;
 const score=Object.keys(weights).reduce((sum,k)=>sum+result.dimensions[k]*weights[k],0);
 let personalBoost=0;
 if(result.anchors.length && objective==="complete")personalBoost=.17;
 // Preference tiers add the same personal boost for both TC alloys.
 // Technical scores may still differ by setup/liquid: equal preference is not identical physics.
 if(result.personalPreference?.tier===1)personalBoost+=.62;
 else if(result.personalPreference?.tier===2)personalBoost+=.1;
 if(result.config.atom==="klp"&&result.config.wire==="k128"&&result.config.wraps===6)personalBoost-=.2;
 if(result.config.atom==="415"&&result.config.wire==="k1clap")personalBoost+=.12;
 if(result.config.atom==="dvarwfl"&&result.config.wire==="ssclap")personalBoost+=.12; // Dedicated alternative, not unconditional #1
 if(result.config.atom==="asylum"&&result.config.bell==="dome")personalBoost-=.06;
 return round(score+personalBoost);
}
function rankBuilds(atomId,liquid={},objective="complete",context={}){
 const base=configuration(atomId,context);if(!base)return [];
 return variants(atomId).map(v=>{
  const c=configuration(atomId,{...base,...v,...wireSetup(atomId,v.wire,v.wraps)});
  const result=analyze(c,liquid,objective);
  return {...result,rankScore:priority(result,objective)};
 }).sort((a,b)=>b.rankScore-a.rankScore);
}
function matchLiquids(config,catalog,objective="complete",limit=0){
 const input=configuration(config.atom,config);if(!input||!Array.isArray(catalog))return [];
 const fit=window.RTA_BELL_LIQUID_FIT;
 const atom=getAtoms().find(a=>a.id===input.atom);
 const prior=previousBellFitAnalyze&&atom?previousBellFitAnalyze(atom,input.bell,catalog):null;
 const priorById=new Map((prior?prior.matches:[]).map(m=>[m.index,m.score]));
 const rows=catalog.map((liquid,index)=>{
  const result=analyze(input,liquid,objective);
  const priorScore=priorById.has(index)?priorById.get(index):90;
  const score=priority(result,objective)*18+priorScore*.19;
  return {index,liquid,score:round(score),result};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);
 return limit>0?rows.slice(0,limit):rows;
}
function bestForLiquid(liquid,objective="complete",top=16){
 return Object.keys(PLATFORMS).map(id=>{
  const options=rankBuilds(id,liquid,objective);
  const best=options[0];
  return {atom:id,result:best,score:best.rankScore};
 }).sort((a,b)=>b.score-a.score).slice(0,top);
}
window.RTA_SENSORY_CORE={version:V,axioms:AXIOMS,dimensions:DIMENSIONS,platforms:PLATFORMS,
 nife30Watt:NIFE30_WATT,allowedRegimes,modeFor,
 wires:WIRES,observations:OBS,nife30Family:NIFE30_FAMILY,personalPreferences:PERSONAL_PREFS,personalSetups,personalPreference,wireSetup,defaultConfig:defaults,config:configuration,variants,
 physical,analyze,priority,rankBuilds,matchLiquids,bestForLiquid,liquidTags,permitted};
})();