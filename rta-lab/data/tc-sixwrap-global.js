/* RTA Lab — separare NiFe30/7 global, NiFe52/6, 29.10.2026.
 * Numele istoric al modulului rămâne din motive de compatibilitate V10.
 * 7 spire NiFe30 reprezintă o regulă personală generală, nu teste A/B pe toate RTA.
 * Varianta mai veche Dicodes este retrasă din listele active de builduri.
 * Rola Dicodes NiFe30 TCR320 5,5 Ω/m; Zivipf NiFe52 TCR310.
 */
(() => {
  window.RTA_LAB_TC_SIX_WRAP = {
    date: "2026-10-29", status: "canonical-personal-preference",
    coilDiameterMm: 2.5, wraps: 7,
    dicodesNiFe30Wraps: 7, zivipfNiFe52Wraps: 6,
    overrides: {
      gtr: {dicodesNiFe30Wraps:7,zivipfNiFe52Wraps:6},
      "415": {dicodesNiFe30Wraps:7,zivipfNiFe52Wraps:6,k128Wraps:6,dicodesNiFe30LegacyWraps:6}
    },
    dicodes: {wire:"Dicodes RESISTHERM NiFe30",tcr:320,resistanceOhmPerM:5.5},
    zivipf: {wire:"Zivipf NiFe52",tcr:310},
    principle: "Global: Dicodes NiFe30/7 pe orice RTA compatibil; Zivipf NiFe52/6. configurația Dicodes retrasă este reper istoric selectabil; setările TC/WATT se validează separat."
  };

  if (typeof buildRule === "function") {
    const original=buildRule;
    buildRule=function(atom,wire){
      if(wire?.id==="nife30")return {
        wraps:7,reason:"Dicodes RESISTHERM NiFe30 TCR320: 7 spire = preferința personală actuală pe toate atomizoarele compatibile; Zivipf NiFe52 TCR310 folosește 6 spire. Montajul configurația Dicodes retrasă este istoric funcțional, nu interzis."
      };
      return original(atom,wire);
    };
  }
  if (typeof buildOutput === "function") {
    const original=buildOutput;
    buildOutput=function(atom,wire,liquid){
      const out=original(atom,wire,liquid);
      if(wire?.id==="nife30"&&out){
        out.wraps="7";
        if(!["gtr","415","klp","kx","kprime"].includes(atom?.id)){
          out.status="Regulă personală nouă · Dicodes NiFe30/7";
          out.noteClass="context";
          out.note="NiFe30 TCR320/7 este geometria preferată global; Zivipf NiFe52 TCR310 rămâne cu 6 spire. Nu există un A/B pentru fiecare atomizor, iar vechiul configurația Dicodes retrasă rămâne o opțiune istorică funcțională.";
        }
      }
      return out;
    };
  }
  if (typeof footprintText === "function") {
    const original=footprintText;
    footprintText=function(atom,wire,output){
      if(wire?.id==="nife30")return "Dicodes NiFe30/7 (TCR320) pe orice platformă compatibilă, Zivipf NiFe52/6 (TCR310) separat. Ø2,5 = preset. Geometria cu 7 spire poate reduce TH-ul direct, dar utilizatorul descrie un TH mai bogat pe palat; fără procent măsurat.";
      return original(atom,wire,output);
    };
  }
  if (typeof geometrySummary === "function") {
    const original=geometrySummary;
    geometrySummary=function(atom){
      const html=original(atom);
      return html
        .replace(/<b>NiFe TC<\/b>6 spire · Ø2,5 · TCR 320\/310/g,"<b>NiFe TC</b>Dicodes NiFe30/7 · Zivipf NiFe52/6 · Ø2,5")
        .replace(/<b>NiFe30<\/b>6 spire/g,"<b>NiFe30</b>7 spire")
        .replace(/<b>NiFe30\/6<\/b>/g,"<b>NiFe30/7</b>");
    };
  }
  document.addEventListener("DOMContentLoaded",()=>{
    for(const node of document.querySelectorAll(".wire-guide-foot, .legend, .wire-card.tc .wire-specs")){
      if(!node.innerHTML)continue;
      node.innerHTML=node.innerHTML
        .replace(/Dicodes RESISTHERM NiFe30 = <b>6 spire<\/b> în general, <b>GTR și 415 Cool = 7 spire<\/b> preferat personal/g,
         "Dicodes RESISTHERM NiFe30 = <b>7 spire pe toate atomizoarele compatibile</b>")
        .replace(/6 spire general \/ 7 spire pe GTR și 415 Cool/g,"7 spire global (6 spire istorice)");
    }
  });
})();
