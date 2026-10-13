/* RTA Sensory DNA Core · 2026-10-13
 * Technical hypotheses + explicit personal observations, never fake survey probabilities.
 * The system evaluates a configuration (deck + bell + air + wire + wraps + TC/WATT + position)
 * against a tobacco/NET liquid. It never assigns an absolute global RTA winner.
 */
(function () {
"use strict";
const V="2026-10-13";
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
 AIR("single12","Insert 1×1,2 mm (standard)","single",[1.2],1.25),
 AIR("dual08","Insert 2×0,8 mm (familie AFC)","multipoint",[.8,.8],1.65,{optional:true})],
 traits:{spectrum:4.5,simultaneity:3.7,focus:4.8,palate:4.15,offense:4.85,th:4.6,harmony:4.0},note:"Impact muscular, distribuție modificată de insert."},
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
 AIR("triple06","Insert 3×0,6 mm (opțional)","multipoint",[.6,.6,.6],1.95,{optional:true}),
 AIR("dual08","Insert 2×0,8 mm (opțional)","multipoint",[.8,.8],1.7,{optional:true})],
 traits:{spectrum:4.65,simultaneity:4.25,focus:4.0,palate:4.0,offense:4.0,th:3.9,harmony:4.3},note:"FL favorizează delimitarea notelor, variabilă după insert."},
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
 asylum:{pattern:"single",volume:"compact-mediu",air:[
 AIR("stock","Air-pin existent (dimensiune neverificată)","single",null,1.5)],
 traits:{spectrum:4.55,simultaneity:4.3,focus:4.2,palate:4.4,offense:4.25,th:4.15,harmony:4.35},note:"Nu inventăm diametrul pinului Asylum V3."},
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
const WIRES={
 k128:{name:"Kanthal A1 28 GA",type:"round",diameter:.321,mode:"WATT",power:12.5},
 k129:{name:"Kanthal A1 29 GA",type:"round",diameter:.286,mode:"WATT",power:12.3},
 k1clap:{name:"K1 Clapton 2×30+38",type:"clapton",mode:"WATT",power:12.5},
 ssclap:{name:"SS316L Clapton 2×30+38",type:"clapton",mode:"WATT",power:12.0},
 nife30:{name:"Dicodes RESISTHERM NiFe30 TCR320",type:"tc",mode:"TC",temp:230,power:13},
 nife52:{name:"Zivipf NiFe52 TCR310",type:"tc",mode:"TC",temp:230,power:13}
};
const DEFAULTS={
 "415":{wire:"k1clap",wraps:5,air:"tasty"},
 kprime:{wire:"k129",wraps:5,air:"1.2"},
 gtone:{wire:"k129",wraps:6,air:"single12"},
 dvarwcl:{wire:"k128",wraps:6,air:"triple06"},
 muted:{wire:"k129",wraps:5,air:"triple"},
 gtr:{wire:"nife30",wraps:6,air:"both"},
 dvarwfl:{wire:"ssclap",wraps:5,air:"single12"},
 diplomat:{wire:"k129",wraps:5,air:"pin18"},
 kx:{wire:"k128",wraps:5,air:"mid"},
 klp:{wire:"k128",wraps:5,air:"mid"},
 asylum:{wire:"k128",wraps:6,air:"stock"},
 pmfree:{wire:"k128",wraps:5,air:"pin12"},
 pmstd:{wire:"k129",wraps:5,air:"pin12"},
 byka:{wire:"k129",wraps:5,air:"pin12"},
 kv3:{wire:"k128",wraps:6,air:"screw_mid"},
 minister:{wire:"k129",wraps:5,air:"d20"}
};
const OBS=[
 {atom:"klp",wire:"k128",wraps:5,title:"KLP 28/5: bogăție + ofensivă",
  text:"Palat îmbrățișat de un spectru simultan, TH și ofensivă; preferat personal față de 28/6 și 29/6.",
  patch:{simultaneity:4.92,palate:4.9,offense:4.67,th:4.7,harmony:4.8},affinity:"configurație preferată",evidence:"A/B personal 13.10.2026"},
 {atom:"klp",wire:"k128",wraps:6,title:"KLP 28/6: mai analitic, mai blând",
  text:"Scade ofensiva și TH; profil mai moale și analitic, considerat inferior lui 28/5.",
  patch:{separation:4.72,offense:3.35,th:3.55,palate:4.2},affinity:"mai puțin preferat",evidence:"A/B personal 13.10.2026"},
 {atom:"dvarwcl",wire:"k128",wraps:6,title:"CL 28/6: ofensivă și focalizare",
  text:"Spectru prezent, dar livrare musculară; o notă poate domina percepția simultană.",
  patch:{offense:4.95,focus:4.9,simultaneity:3.65,palate:4.2},affinity:"caracter ofensiv",evidence:"observație practică 13.10.2026"},
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
 {atom:"415",wire:"k1clap",wraps:5,title:"415 K1 Clapton pereche preferată",
  text:"Pereche Clapton preferată pentru densitate, integrare și corp.",
  patch:{palate:4.8},affinity:"Clapton preferat",evidence:"validare personală Lab"},
 {atom:"dvarwfl",wire:"ssclap",wraps:5,title:"FL SS316L Clapton dedicat",
  text:"Pereche pentru claritate, top-notes, layering, fără A/B pe toate lichidele.",
  patch:{separation:4.85},affinity:"dedicat · contextual",evidence:"hartă platformă Lab"},
 {atom:"asylum",wire:"k128",wraps:6,bell:"flat",title:"Asylum Flat 28/6 validat",
  text:"Claritate/separare cu corp și completitudine, pe Flat.",
  patch:{palate:4.72,separation:4.7},affinity:"Flat preferat",evidence:"validare personală Lab"},
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
 if((wire==="nife30"||wire==="nife52")&&id==="klp")return false;
 if(wire==="k128"&&id==="415"&&wraps===6)return false; // deprecated per MASTER
 if(wire==="k128"||wire==="k129")return wraps===5||wraps===6;
 return wraps===(WIRES[wire].type==="tc"?6:5);
}
function variants(id){
 if(!PLATFORMS[id])return [];
 const opts=[];
 for(const w of Object.keys(WIRES)){
  for(const wraps of ((w==="k128"||w==="k129")?[5,6]:[WIRES[w].type==="tc"?6:5])){
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
  power:WIRES[def.wire].power,temp:WIRES[def.wire].temp||230};
}
function configuration(id,changes={}) {
 const base=defaults(id);
 if(!base)return null;
 const value={...base,...changes,atom:id};
 const model=PLATFORMS[id];
 if(!model.air.some(a=>a.id===value.air))value.air=base.air;
 value.bell=bellFor(id,value.bell).id;
 if(!permitted(id,value.wire,Number(value.wraps))){value.wire=base.wire;value.wraps=base.wraps;}
 value.wraps=Number(value.wraps);
 value.coilMm=[2,2.5,3].includes(Number(value.coilMm))?Number(value.coilMm):2.5;
 if(!["low","standard","high"].includes(value.position))value.position="standard";
 const w=WIRES[value.wire];
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
 const expectedBell=bellFor(config.atom,defaults&&defaults.bell).id;
 if(!defaults || config.air!==defaults.air || config.position!=="standard" ||
    config.coilMm!==2.5 || Math.abs(config.power-WIRES[config.wire].power)>1.25 ||
    config.bell!==expectedBell)return [];
 return OBS.filter(o=>o.atom===config.atom&&o.wire===config.wire &&
   (o.wraps==null||o.wraps===config.wraps) &&
   (!o.bell||o.bell===config.bell));
}
function technicalBaseline(config,liquid) {
 const tech=PLATFORMS[config.atom], phys=physical(config), bell=bellFor(config.atom,config.bell);
 const tags=liquidTags(liquid),w=phys.wire,a=phys.air;
 const isTC=w.type==="tc",isClap=w.type==="clapton";
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
 if(config.atom==="dvarwcl"){
  if(config.air==="single12"){result.offense+=.26;result.focus+=.25;result.simultaneity-=.12;}
  if(config.air==="triple06"){result.offense+=.08;result.simultaneity+=.1;result.focus-=.08;}
 }
 if(config.atom==="dvarwfl"&&config.air==="triple06"){result.separation+=.12;result.simultaneity+=.1;}
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
 const signal={...res.signal},anchors=anchorsFor(config);
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
 const personal=anchors.length?anchors.map(o=>o.affinity).join(" / "):null;
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
 const status=anchors.length?"observație personală + extrapolare la lichid":"predicție tehnică orientativă";
 const notes=[
  "Airflow: "+air.label+(res.physical.areaMm2!=null?", arie nominală "+res.physical.areaMm2+" mm²":"")+
   "; aria geometrică nu prezice singură debitul.",
  "Build: "+w.name+", Ø"+config.coilMm+", "+config.wraps+" spire, poziție "+config.position+
   ", "+(w.type==="tc"?"TC "+config.temp+"°C / limită "+config.power+" W":"WATT "+config.power+" W")+".",
  "Clopot: "+bellFor(config.atom,config.bell).name+"."
 ];
 if(air.optional||air.estimated)notes.push("Configurație airflow opțională/orientativă; verifică piesele deținute.");
 if(config.wire==="nife52")notes.push("NiFe52 rămâne fără verdict universal cross-alloy față de Dicodes NiFe30.");
 if(config.atom==="klp"&&config.wire==="k128"&&config.wraps===6)
   notes.push("A/B: utilizatorul preferă KLP K1 28/5; 28/6 a fost mai moale și cu TH mai mic.");
 if(config.atom==="asylum"&&config.bell==="dome")
   notes.push("Asylum Dome nu preia automat validarea Flat/28/6.");
 const ext=anchors.map(o=>({title:o.title,text:o.text,evidence:o.evidence}));
 const modelWarning="Indicatorii interni sunt estimări, nu măsurători ale aromei sau garanții.";
 return {config,objective,signals:signal,dimensions,physical:res.physical,
  labels:Object.fromEntries(Object.entries(dimensions).filter(([k,v])=>v!=null).map(([k,v])=>[k,label(v)])),
  pleasure:personal,anchors:ext,certainty:status,advantages,tradeoffs,notes,modelWarning};
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
 if(result.config.atom==="gtr"&&result.config.wire==="nife30" && objective!=="th")personalBoost+=.15;
 if(result.config.atom==="klp"&&result.config.wire==="k128"&&result.config.wraps===5)personalBoost+=.17;
 if(result.config.atom==="klp"&&result.config.wire==="k128"&&result.config.wraps===6)personalBoost-=.2;
 if(result.config.atom==="gtone"&&result.config.wire==="k129"&&result.config.wraps===6)personalBoost+=.15;
 if(result.config.atom==="415"&&result.config.wire==="k1clap")personalBoost+=.12;
 if(result.config.atom==="dvarwfl"&&result.config.wire==="ssclap")personalBoost+=.12;
 if(result.config.atom==="asylum"&&result.config.bell==="dome")personalBoost-=.06;
 return round(score+personalBoost);
}
function rankBuilds(atomId,liquid={},objective="complete",context={}){
 const base=configuration(atomId,context);if(!base)return [];
 return variants(atomId).map(v=>{
  const c=configuration(atomId,{...base,...v,power:WIRES[v.wire].power,temp:WIRES[v.wire].temp||base.temp});
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
 wires:WIRES,observations:OBS,defaultConfig:defaults,config:configuration,variants,
 physical,analyze,priority,rankBuilds,matchLiquids,bestForLiquid,liquidTags,permitted};
})();