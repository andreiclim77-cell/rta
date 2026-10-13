/* RTA Lab V10 · Bell-aware liquid suitability · 13 October 2026
   Qualitative fit: platform DNA + documented chamber + the complete 620-liquids catalog.
   Never changes the validated coil/build engine; no invented bells or survey percentages.
*/
(function () {
"use strict";
var CLASSES=["Tutun simplu","Tutun complex","NET simplu","NET complex"];
var SOURCE_DIPLOMAT="https://www.vapstor.fr/en/atomiseurs/3769-diplomat-v15-mtl-dlc-by-centenary-mods.html";
var SOURCE_PM="https://centenarymods.com/shop/atomizers/prime-minister-mtl-rta-standard-2/";
var SOURCE_ASYLUM="https://www.vapstor.fr/en/atomiseurs/4037-asylum-rta-v3-by-yg-creations.html";
/* Prior qualitative fit values on a 1..5 internal scale.
   Class order follows CLASSES. They are calibrated hypotheses, not measurements. */
var PLATFORMS={
 "415":{fit:[4.05,4.70,4.10,4.65],chamber:"Cool · cameră originală",character:"Densitate, corp și integrarea aromelor complexe."},
 kprime:{fit:[4.50,4.45,4.50,4.25],chamber:"Cameră originală",character:"Echilibru și finețe în tutunuri curate, inclusiv NET."},
 gtone:{fit:[4.92,3.90,4.82,3.75],chamber:"Clopot original GT One",character:"Tutun direct, sec, cu structură de frunză și hit precis."},
 dvarwcl:{fit:[4.25,4.40,4.82,4.65],chamber:"Clopot original CL",character:"Tutun robust, corp și note dark; insertul de aer influențează redarea."},
 muted:{fit:[3.85,4.85,4.25,4.60],chamber:"Cameră originală Muted+",character:"Corp, saturație și integrarea toppingurilor; depinde de airflow."},
 gtr:{fit:[4.00,4.45,4.78,4.97],chamber:"Clopot original GTR",character:"NET-uri complexe, frunză și detalii fine bine separate."},
 dvarwfl:{fit:[3.95,4.45,4.55,4.94],chamber:"Clopot original FL",character:"Separare, top-notes, Oriental, Perique și mixturi naturale."},
 diplomat:{fit:[4.05,4.40,4.55,4.68],chamber:"Duke",character:"Schimbarea clopotului mută accentul aromatic."},
 kx:{fit:[4.48,4.72,4.48,4.48],chamber:"Cameră originală KX",character:"Redare naturală, echilibru și corp cu Aerokon."},
 klp:{fit:[4.95,3.95,4.65,3.95],chamber:"Cameră originală KLP",character:"Tutun sec și concentrat, hit și precizie."},
 asylum:{fit:[4.05,4.58,4.56,4.74],chamber:"Flat",character:"Flat favorizează separarea; Dome favorizează corpul."},
 pmfree:{fit:[4.25,4.35,4.56,4.64],chamber:"Freehand",character:"Mixturi NET seci, frunză și layering."},
 pmstd:{fit:[4.25,4.35,4.56,4.64],chamber:"Rhodesian",character:"Tutun mai saturat, rotund, cu saturație crescută."},
 byka:{fit:[4.40,4.40,4.66,4.72],chamber:"Cameră originală V11",character:"Echilibru între claritate, corp și structură de frunză."},
 kv3:{fit:[4.75,4.20,4.55,3.90],chamber:"Cameră originală Mini V3",character:"MTL compact, uscat și concentrat."},
 minister:{fit:[4.32,4.65,4.45,4.35],chamber:"Cameră originală Minister",character:"Cameră compactă și caldă, corp și tutunuri mai bogate."}
};
function bell(id,name,bonus,tones,character,status,source,note) {
 return {id:id,name:name,bonus:bonus,tones:tones,character:character,
  status:status,source:source||"",note:note||""};
}
/* Source-grounded existence of interchangeable bells; individual liquid rankings remain estimations. */
var PM_SHARED_AFFINITY={simple:3.9,dry:4.8,bright:4.2,dark:4.8,burley:4.7,kentucky:4.8,latakia:5,oriental:5,perique:4.6,cigar:5,pipe:4.3,citrus:4.6,alcohol:4.9,nuts:4.4,coffeeCocoa:4.5,sweet:3.7,layers:5};
var MULTI={
 diplomat:{defaultId:"duke",bells:[
  bell("duke","Duke",[.06,.19,.10,.13],{layers:.10,bright:.06},
   "Echilibrat, versatil, bun pentru blenduri și tutunuri aromatizate.","clopot documentat; comportament estimat",SOURCE_DIPLOMAT),
  bell("freehand","Freehand",[-.12,-.02,.25,.39],{dry:.22,dark:.13,layers:.24,simple:.05,sweet:-.12},
   "Mai sec și analitic; pune accentul pe frunză și straturile NET.","clopot documentat; comportament estimat",SOURCE_DIPLOMAT),
  bell("rhodesian","Rhodesian",[.28,.30,.31,-.14],{simple:.27,body:.20,sweet:.14,layers:-.10},
   "Mai saturat și mai rotund, pentru tutunuri singulare sau aromatizate.","clopot documentat; comportament estimat",SOURCE_DIPLOMAT)
 ]},
 asylum:{defaultId:"flat",bells:[
  bell("flat","Flat",[.02,.17,.15,.29],{layers:.30,bright:.12,oriental:.15,perique:.15},
   "Separare și claritate; cu K1 28/6 există validare practică pentru corp/completitudine.","Flat confirmat; build Flat/28/6 validat",SOURCE_ASYLUM,
   "Validarea buildului nu este validare A/B pentru fiecare lichid."),
  bell("dome","Dome",[.22,.34,.12,.04],{body:.21,sweet:.19,dark:.13,layers:-.08},
   "Integrare, corp, aromă mai rotundă; alegerea lichidelor este extrapolată.","Dome confirmat; gust extrapolat",SOURCE_ASYLUM,
   "Buildurile existente ale Asylum sunt calibrate pe clopotul Flat.")
 ]},
 pmfree:{defaultId:"freehand",bells:[
  bell("freehand","Freehand",[-.13,0,.22,.38],{dry:.25,layers:.28,latakia:.14,oriental:.14,sweet:-.13},
   "Sec, deschide straturile; NET mix și aroma de frunză.","rol general descris de producător; ranking estimat",SOURCE_PM),
  bell("rhodesian","Rhodesian",[.33,.28,.31,-.18],{simple:.28,sweet:.15,body:.16,layers:-.12},
   "Saturat și rotund, ideal pentru tutunuri singulare.","rol general descris de producător; ranking estimat",SOURCE_PM)
 ]},
 pmstd:{defaultId:"rhodesian",bells:[
  bell("freehand","Freehand",[-.13,0,.22,.38],{dry:.25,layers:.28,latakia:.14,oriental:.14,sweet:-.13},
   "Sec, deschide straturile; NET mix și aroma de frunză.","rol general descris de producător; ranking estimat",SOURCE_PM),
  bell("rhodesian","Rhodesian",[.33,.28,.31,-.18],{simple:.28,sweet:.15,body:.16,layers:-.12},
   "Saturat și rotund, ideal pentru tutunuri singulare.","rol general descris de producător; ranking estimat",SOURCE_PM)
 ]}
};
var ALIASES=[
 ["latakia",/latakia|balkan|english mixture/],["oriental",/oriental|turkish|basma|izmir/],
 ["perique",/perique|vaper|va\/per/],["kentucky",/kentucky|dark.fired|fire.cured/],
 ["burley",/burley/],["cigar",/cigar|trabuc|habano|cuban|piloto/],
 ["pipe",/pipe|cavendish/],["dark",/dark|smoky|afumat|earthy|latakia|kentucky/],
 ["bright",/bright|virginia|floral|blond/],["sweet",/sweet|dulce|vanil|honey|miere|caramel|cream|cherry/],
 ["dry",/dry|uscat|sec|ashy|rolling|shag/],["layers",/complex|blend|mixture|mix|stratificat|aromatizat/],
 ["simple",/simple|simplu|single|monovarietal|direct/],
 ["coffeeCocoa",/coffee|cafea|cacao|cocoa|chocol/],
 ["alcohol",/bourbon|whisk|rom\b|rum\b/],["nuts",/alune|nuci|hazelnut|pecan/],
 ["citrus",/citrus|citric|portocal|lamaie/],["body",/cremos|dens|saturat|corpolent/]
];
function normalize(value) {
 return String(value==null?"":value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
}
function tagsFor(liquid) {
 var tags=new Set((Array.isArray(liquid.tags)?liquid.tags:[]).map(normalize));
 var text=normalize([liquid.brand,liquid.name,liquid.line,liquid.profile,liquid.kind].join(" "));
 ALIASES.forEach(function(pair) {if(pair[1].test(text))tags.add(pair[0]);});
 if(/complex/.test(liquid.class))tags.add("layers");
 if(/simplu/.test(liquid.class))tags.add("simple");
 return tags;
}
function config(id) {
 var platform=PLATFORMS[id];if(!platform)return null;
 var multi=MULTI[id];
 return multi
  ? {defaultId:multi.defaultId,bells:multi.bells,platform:platform}
  : {defaultId:"standard",platform:platform,bells:[bell("standard",platform.chamber,[0,0,0,0],{},
     platform.character,"ADN din Lab; compatibilitate estimată","",
     "În Lab nu sunt confirmate alte clopote pentru acest atomizor.")]};
}
function band(score) {
 return score>=4.9?"Excelent":score>=4.6?"Foarte potrivit":score>=4.2?"Potrivit":"Contextual";
}
function analyze(atom,id,catalog) {
 if(!atom||!Array.isArray(catalog))return null;
 var setup=config(atom.id);if(!setup)return null;
 var b=setup.bells.find(function(item){return item.id===id;})||
   setup.bells.find(function(item){return item.id===setup.defaultId;});
 var classes=CLASSES.map(function(name,i) {
  var score=Math.max(1,Math.min(5,setup.platform.fit[i]+b.bonus[i]));
  return {name:name,score:score,band:band(score)};
 }).sort(function(a,z){return z.score-a.score||CLASSES.indexOf(a.name)-CLASSES.indexOf(z.name);});
 var matches=catalog.map(function(liquid,index){
  var i=CLASSES.indexOf(liquid&&liquid.class);
  if(i<0)return null;
  var tags=tagsFor(liquid);
  var effectiveAff=(atom.id==="pmfree"||atom.id==="pmstd")?PM_SHARED_AFFINITY:(atom.aff||{});
  var aff=Object.keys(effectiveAff).filter(function(k){return tags.has(k);});
  var avg=aff.length?aff.reduce(function(sum,k){return sum+Number(effectiveAff[k]);},0)/aff.length:4;
  var bellDelta=Object.keys(b.tones).reduce(function(sum,k){return sum+(tags.has(k)?b.tones[k]:0);},0);
  return {liquid:liquid,index:index,category:liquid.class,
    score:(setup.platform.fit[i]+b.bonus[i])*20+(avg-4)*6+bellDelta*8};
 }).filter(Boolean).sort(function(a,z) {
  return z.score-a.score || String(a.liquid.brand).localeCompare(String(z.liquid.brand),"ro") ||
   String(a.liquid.name).localeCompare(String(z.liquid.name),"ro") || a.index-z.index;
 });
 var counts=Object.fromEntries(CLASSES.map(function(name){return [name,0];}));
 matches.forEach(function(m){counts[m.category]++;});
 return {atomId:atom.id,bell:b,bells:setup.bells,defaultId:setup.defaultId,
  classes:classes,matches:matches,total:matches.length,counts:counts};
}
window.RTA_BELL_LIQUID_FIT={
 version:"2026-10-13",classes:CLASSES.slice(),platformIds:Object.keys(PLATFORMS),
 config:config,analyze:analyze,normalize:normalize
};
})();