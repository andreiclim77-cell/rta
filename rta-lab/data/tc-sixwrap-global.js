/* RTA Lab — separare NiFe30/7 global, NiFe52/6, 29.10.2026.
 * Numele istoric al modulului rămâne din motive de compatibilitate V10.
 * 7 spire NiFe30 reprezintă o regulă personală generală, nu teste A/B pe toate RTA.
 * NiFe30/6 rămâne selectabil în Sensory DNA drept alternativă istorică.
 * Rola Dicodes NiFe30 TCR320 5,5 Ω/m; Zivipf NiFe52 TCR310.
 */
(() => {
  window.RTA_LAB_TC_SIX_WRAP = {
    date: "2026-10-29", status: "canonical-personal-preference",
    coilDiameterMm: 2.5, wraps: 7,
    dicodesNiFe30Wraps: 7, zivipfNiFe52Wraps: 6, historicalDicodesWraps: 6,
    overrides: {
      gtr: {dicodesNiFe30Wraps:7,zivipfNiFe52Wraps:6,dicodesNiFe30LegacyWraps:6},
      "415": {dicodesNiFe30Wraps:7,zivipfNiFe52Wraps:6,k128Wraps:6,dicodesNiFe30LegacyWraps:6},
      muted:{dicodesNiFe30Wraps:6,zivipfNiFe52Wraps:6,k128Wraps:6,tcSpacing:"spaced",k1Spacing:"contact",status:"exception to global NiFe30/7"}
    },
    dicodes: {wire:"Dicodes RESISTHERM NiFe30",tcr:320,resistanceOhmPerM:5.5},
    zivipf: {wire:"Zivipf NiFe52",tcr:310},
    principle: "Global: Dicodes NiFe30/7, EXCEPȚIE Muted+ NiFe30/6 spaced; Zivipf NiFe52/6. Pentru Muted+ urmează K1 28/6 contact; regimurile TC/WATT se validează separat."
  };

  if (typeof buildRule === "function") {
    const original=buildRule;
    buildRule=function(atom,wire){
      if(atom?.id==="muted"&&wire?.id==="nife30")return {wraps:6,reason:"Muted+ prioritate personală NiFe30/6 spaced sau NiFe52/6 spaced, apoi K1 28/6 contact; excepție de la regula globală /7."};
      if(wire?.id==="nife30")return {
        wraps:7,reason:"Dicodes RESISTHERM NiFe30 TCR320: 7 spire = preferința personală actuală pe toate atomizoarele compatibile; Zivipf NiFe52 TCR310 folosește 6 spire. Montajul NiFe30/6 este istoric funcțional, nu interzis."
      };
      return original(atom,wire);
    };
  }
  if (typeof buildOutput === "function") {
    const original=buildOutput;
    buildOutput=function(atom,wire,liquid){
      const out=original(atom,wire,liquid);
      if(wire?.id==="nife30"&&out){
        if(atom?.id==="muted"){
          out.wraps="6";out.status="Muted+ · NiFe30/6 spaced · prima alegere TC";out.noteClass="valid";
          out.note="NiFe30 Dicodes / 6 spaced testat pe Arcana DNA60C, 210°C apreciat; NiFe52 Zivipf / 6 spaced co-prioritar declarat. Urmează K1 28 GA / 6 contact; W neprecizat.";
          return out;
        }
        out.wraps="7";
        if(!["gtr","415","klp","kx","kprime"].includes(atom?.id)){
          out.status="Regulă personală nouă · Dicodes NiFe30/7";
          out.noteClass="context";
          out.note="NiFe30 TCR320/7 este geometria preferată global; Zivipf NiFe52 TCR310 rămâne cu 6 spire. Nu există un A/B pentru fiecare atomizor, iar vechiul NiFe30/6 rămâne o opțiune istorică funcțională.";
        }
      }
      return out;
    };
  }
  if (typeof footprintText === "function") {
    const original=footprintText;
    footprintText=function(atom,wire,output){
      if(atom?.id==="muted"&&wire?.id==="nife30")return "Muted+: NiFe30/6 spaced sau NiFe52/6 spaced primele alegeri, apoi K1 28/6 contact, cu TC distinct.";
      if(wire?.id==="nife30")return "Dicodes NiFe30/7 (TCR320) pe orice platformă compatibilă, Zivipf NiFe52/6 (TCR310) separat. Ø2,5 = preset. Geometria cu 7 spire poate reduce TH-ul direct, dar utilizatorul descrie un TH mai bogat pe palat; fără procent măsurat.";
      return original(atom,wire,output);
    };
  }
  if (typeof geometrySummary === "function") {
    const original=geometrySummary;
    geometrySummary=function(atom){
      const html=original(atom);
      if(atom?.id==="muted")return html; // Muted+ six-wrap exception must not be rewritten to seven.
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
         "Dicodes RESISTHERM NiFe30 = <b>7 spire pe toate atomizoarele compatibile</b> (6 spire rămân istoric funcționale)")
        .replace(/6 spire general \/ 7 spire pe GTR și 415 Cool/g,"7 spire global (6 spire istorice)");
    }
  });
})();
