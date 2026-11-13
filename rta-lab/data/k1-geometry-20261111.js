/* RTA Lab · 11.11.2026 · K1 technical geometry reference.
 * This is an independent engineering hypothesis, NOT an installed coil,
 * controlled A/B, personal taste ranking or override of the sensory engine.
 * Position 01 contains BOTH K1 round-wire gauges (28 and 29 GA), each with
 * its own wraps. Display after 01 only surviving historical non-K1 variants
 * (NiFe or SS Clapton), in order. Preserve all original history separately.
 */
(function () {
"use strict";
const diameterMm=2.5;
const rows=[
 {id:"kprime",name:"Kayfun Prime / Prime SE",gauge:28,wraps:6,alternateWraps:6,air:"1.2",why:"Cameră concentrată, flux sub coil: două variante K1 de șase spire, cu masă termică diferită; verifică AFC-ul efectiv."},
 {id:"klp",name:"Kayfun Lite Plus 2021",gauge:29,wraps:5,alternateWraps:5,air:"mid",why:"Clopot compact și AEROKON: 28/5 poate da mai multă masă, 29/5 răspuns mai prompt. A/B-ul personal 28/5 vs 29/6 rămâne separat."},
 {id:"kx",name:"Kayfun X",gauge:29,wraps:6,alternateWraps:5,air:"mid",why:"Clopot concentrat și AEROKON reglabil: compară 28/5, mai scurt și plin, cu 29/6, mai lung și fin."},
 {id:"gtone",name:"Taifun GT One",gauge:29,wraps:5,alternateWraps:5,air:"single12",why:"Jet inferior unic 1,2 mm și cameră compactă: 28/5 și 29/5 păstrează footprint-ul scurt, dar nu aceeași masă."},
 {id:"gtr",name:"Taifun GTR",gauge:28,wraps:6,alternateWraps:6,air:"both",why:"Două canale oblice de 1,0 și 1,2 mm DESCHISE simultan; 28/6 și 29/6 acoperă zona duală diferit. Un singur canal cere reanaliză."},
 {id:"gaia",name:"Taifun GAIA RBA · Boro",gauge:28,wraps:5,alternateWraps:5,air:null,why:"Ambele 28/5 și 29/5 sunt ipoteze Boro separate; inserția, jetul și montajul fizic nu sunt verificate în Lab.",unmodeled:true},
 {id:"dvarwcl",name:"Dvarw MTL CL",gauge:28,wraps:6,alternateWraps:5,air:"triple06",why:"Insert multipunct 3×0,6 mm: 28/6 extinde suprafața activă, 29/5 reduce inerția. Nu extrapola la single 1×1,2 mm."},
 {id:"dvarwfl",name:"Dvarw MTL FL",gauge:28,wraps:6,alternateWraps:5,air:"triple06",why:"Perechea 28/6 + 29/5 este numai pentru 3×0,6 mm; cu pinul unic 1,2 mm nu extrapolăm automat."},
 {id:"muted",name:"Arcana Muted+",gauge:29,wraps:6,alternateWraps:6,air:"triple_simple",why:"Cameră compactă, jos 0,8 + laterale 2×0,8 mm: 28/6 cu masă mai mare, 29/6 cu inerție mai mică; varianta pentru complexe cere reconfirmare."},
 {id:"diplomat",name:"Diplomat v1.5",gauge:29,wraps:6,alternateWraps:5,air:"pin18",why:"Diverter 24×0,9 mm: compară masa 28/5 cu acoperirea 29/6; niciuna nu este test A/B personal."},
 {id:"pmfree",name:"Prime Minister Freehand",gauge:29,wraps:6,alternateWraps:5,air:"pin12",why:"Diverter distribuit: 28/5 pentru masă/corp, 29/6 pentru lungime activă. Ipoteze, nu experiențe confirmate."},
 {id:"pmstd",name:"Prime Minister Rhodesian / Standard",gauge:29,wraps:6,alternateWraps:5,air:"pin12",why:"Diverter multipunct: 28/5 pune accentul pe masă, 29/6 pe acoperire și inerție moderată."},
 {id:"byka",name:"By-Ka V11",gauge:28,wraps:5,alternateWraps:5,air:"pin12",why:"Jet unic 1,2 mm și traseu MTL strâns: 28/5 și 29/5 au aceeași numărătoare, nu aceeași masă sau rezistență."},
 {id:"minister",name:"Minister MTL",gauge:29,wraps:6,alternateWraps:5,air:"d20",why:"Diverter 20×1 mm: 28/5 limitează lungimea activă în camera mică, 29/6 extinde acoperirea; cu 12 orificii cere revalidare."}
];
// CONTACT/SPACED is explicit for each NEW 01A/01B coil, independently of historical records.
const coilStyleById=Object.freeze({"kprime":["spaced","spaced"],"klp":["contact","spaced"],"kx":["spaced","spaced"],"gtone":["spaced","spaced"],"gtr":["spaced","spaced"],"gaia":["spaced","spaced"],"dvarwcl":["spaced","spaced"],"dvarwfl":["spaced","spaced"],"muted":["contact","spaced"],"diplomat":["spaced","spaced"],"pmfree":["spaced","spaced"],"pmstd":["spaced","spaced"],"byka":["spaced","spaced"],"minister":["spaced","spaced"]});
const coilStyleEvidenceById=Object.freeze({"kprime":["SPACED este propunere tehnică pentru 28/6","SPACED propus; CONTACT rămâne alternativă personală acceptată"],"klp":["CONTACT documentat pentru KLP 28/5 în A/B istoric","SPACED propus pentru 29/5; nu confunda cu KLP 29/6 SPACED testat"],"kx":["SPACED propus tehnic pentru 28/5","SPACED propus; CONTACT rămâne alternativă personală acceptată"],"gtone":["SPACED propus tehnic pentru 28/5","SPACED montat/testat, descris «perfect» la 03.11.2026"],"gtr":["SPACED propus tehnic pentru 28/6","SPACED declarat pentru 29/6, fără A/B izolat"],"muted":["CONTACT declarat ca alternativă personală K1 28/6","SPACED propus tehnic pentru 29/6, fără montaj confirmat"]});
const byId=Object.freeze(Object.fromEntries(rows.map(row=>{
 if(![28,29].includes(row.gauge)||![5,6].includes(row.wraps)||![5,6].includes(row.alternateWraps))throw Error('K1 geometry pair incomplete: '+row.id);
 const chosenStyles=coilStyleById[row.id];
 if(!chosenStyles||chosenStyles.length!==2||!chosenStyles.every(s=>s==="contact"||s==="spaced"))throw Error("No CONTACT/SPACED for "+row.id);
 const variants=Object.freeze([28,29].map((gauge,i)=>Object.freeze({gauge,wraps:gauge===row.gauge?row.wraps:row.alternateWraps,
  spacing:chosenStyles[i],styleEvidence:coilStyleEvidenceById[row.id]?.[i]||"SPACED — propunere tehnică; nu montaj personal confirmat"
 })));
 return [row.id,Object.freeze({...row,diameterMm,variants,status:"două ipoteze tehnice · neverificate prin A/B izolat"})];
})));
window.RTA_K1_GEOMETRY=Object.freeze({date:"2026-11-11",diameterMm,rows:Object.freeze(rows.map(row=>byId[row.id])),byId});
})();
