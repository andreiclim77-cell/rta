/* RTA Lab · 11.11.2026 · K1 technical geometry reference.
 * This is an independent engineering hypothesis, NOT an installed coil,
 * controlled A/B, personal taste ranking or override of the sensory engine.
 * The existing three Atlas material builds are preserved separately.
 */
(function () {
"use strict";
const diameterMm=2.5;
const rows=[
 {id:"kprime",name:"Kayfun Prime / Prime SE",gauge:28,wraps:6,air:"1.2",why:"Cameră concentrată și distribuția fluxului sub coil; șase spire oferă lungime activă. Verifică AFC-ul efectiv."},
 {id:"klp",name:"Kayfun Lite Plus 2021",gauge:29,wraps:5,air:"mid",why:"Clopot compact și AEROKON: masa termică mai mică reduce inerția în MTL strâns."},
 {id:"kx",name:"Kayfun X",gauge:29,wraps:6,air:"mid",why:"Clopot concentrat, AEROKON reglabil; șase spire subțiri pot echilibra suprafața activă și masa."},
 {id:"gtone",name:"Taifun GT One",gauge:29,wraps:5,air:"single12",why:"Jet inferior unic de 1,2 mm și cameră compactă: spirală scurtă, răspuns rapid."},
 {id:"gtr",name:"Taifun GTR",gauge:28,wraps:6,air:"both",why:"Două canale oblice de 1,0 și 1,2 mm DESCHISE simultan; cu un singur canal concluzia trebuie reanalizată."},
 {id:"gaia",name:"Taifun GAIA RBA · Boro",gauge:28,wraps:5,air:null,why:"Ipoteză pentru camera Boro compactă și un singur jet; inserția și montajul fizic nu sunt verificate în Lab.",unmodeled:true},
 {id:"dvarwcl",name:"Dvarw MTL CL",gauge:28,wraps:6,air:"triple06",why:"Cameră mai înaltă și insertul cu 3×0,6 mm; răspunsul depinde de distribuția jeturilor."},
 {id:"dvarwfl",name:"Dvarw MTL FL",gauge:28,wraps:6,air:"triple06",why:"Doar pentru configurația cu 3×0,6 mm; cu pinul unic 1,2 mm nu extrapolăm automat."},
 {id:"muted",name:"Arcana Muted+",gauge:29,wraps:6,air:"triple_simple",why:"Cameră compactă, jos 0,8 mm + laterale 2×0,8 mm; pentru Muted-ul cu aer de complexe trebuie reconfirmat."},
 {id:"diplomat",name:"Diplomat v1.5",gauge:29,wraps:6,air:"pin18",why:"Diverter 24×0,9 și cameră relativ compactă; sârma mai subțire limitează masa termică."},
 {id:"pmfree",name:"Prime Minister Freehand",gauge:29,wraps:6,air:"pin12",why:"Diverter cu flux distribuit; șase spire subțiri sunt o ipoteză de echilibru în clopotul mai aerisit."},
 {id:"pmstd",name:"Prime Minister Rhodesian / Standard",gauge:29,wraps:6,air:"pin12",why:"Diverter multipunct și clopot concentrat; suprafață activă cu inerție termică moderată."},
 {id:"byka",name:"By-Ka V11",gauge:28,wraps:5,air:"pin12",why:"Jet unic 1,2 mm și traseu MTL strâns; cinci spire reduc lungimea neacoperită de jet."},
 {id:"minister",name:"Minister MTL",gauge:29,wraps:6,air:"d20",why:"Diverter 20×1 mm și cameră compactă; pe varianta de 12 orificii este necesară revalidarea."}
];
const byId=Object.freeze(Object.fromEntries(rows.map(row=>[row.id,Object.freeze({...row,diameterMm,status:"ipoteză tehnică · neverificată prin A/B izolat"})])));
window.RTA_K1_GEOMETRY=Object.freeze({date:"2026-11-11",diameterMm,rows:Object.freeze(rows.map(row=>byId[row.id])),byId});
})();
