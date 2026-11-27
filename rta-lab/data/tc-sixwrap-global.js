/* RTA Lab — separare NiFe30/7 global, NiFe52/6, 29.10.2026.
 * Numele istoric al modulului rămâne din motive de compatibilitate V10.
 * 7 spire NiFe30 reprezintă o regulă personală generală, nu teste A/B pe toate RTA.
 * NiFe30/6 rămâne selectabil în Sensory DNA drept alternativă istorică.
 * Rola Dicodes NiFe30 TCR320 5,5 Ω/m; Zivipf NiFe52 TCR310.
 */
(() => {
  window.RTA_LAB_TC_SIX_WRAP = {
    date: "2026-11-27", status: "canonical-personal-preference",
    coilDiameterMm: 2.5, wraps: 7,
    dicodesNiFe30Wraps: 7, zivipfNiFe52Wraps: 6, historicalDicodesWraps: 6,
    overrides: {
      gtr: {dicodesNiFe30Wraps:7,zivipfNiFe52Wraps:6,dicodesNiFe30LegacyWraps:6},
      "415": {dicodesNiFe30Wraps:7,zivipfNiFe52Wraps:6,k128Wraps:6,dicodesNiFe30LegacyWraps:6},
      muted:{dicodesNiFe30Wraps:7,zivipfNiFe52Wraps:6,k128Wraps:6,tcSpacing:"spaced",k1Spacing:"contact",historicalDicodesWraps:6,status:"NiFe30/7 SPACED current; /6 historical"}
    },
    dicodes: {wire:"Dicodes RESISTHERM NiFe30",tcr:320,resistanceOhmPerM:5.5},
    zivipf: {wire:"Zivipf NiFe52",tcr:310},
    principle: "Global 27.11: Dicodes NiFe30/7 SPACED și Zivipf NiFe52/6 SPACED pe toate platformele compatibile, inclusiv Muted+; /6 NiFe30 păstrat istoric. TC/WATT nu se confundă."
  };

  if (typeof buildRule === "function") {
    const original=buildRule;
    buildRule=function(atom,wire){
      if(atom?.id==="muted"&&wire?.id==="nife30")return {wraps:7,reason:"Muted+: NiFe30/7 SPACED și NiFe52/6 SPACED sunt presetele curente; NiFe30/6 SPACED este istoric."};
      if(wire?.id==="nife30")return {
        wraps:7,reason:"Dicodes NiFe30 TCR320: 7 spire SPACED; Zivipf NiFe52 TCR310: 6 spire SPACED pe toate atomizoarele compatibile. NiFe30/6 rămâne istoric. Confirmarea problemei CONTACT este pe GTR + DNA."
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
          out.wraps="7";out.status="Muted+ · NiFe30/7 SPACED · preset TC curent";out.noteClass="context";
          out.note="NiFe30 Dicodes/7 SPACED este alegerea curentă; NiFe30/6 SPACED a fost testat istoric pe Arcana DNA60C la 210°C. NiFe52 Zivipf/6 SPACED co-prioritar, nu A/B pe fiecare exemplar.";
          return out;
        }
        out.wraps="7";
        if(!["gtr","415","klp","kx","kprime"].includes(atom?.id)){
          out.status="Regulă personală 27.11 · Dicodes NiFe30/7 SPACED";
          out.noteClass="context";
          out.note="NiFe30 TCR320/7 SPACED și Zivipf NiFe52 TCR310/6 SPACED sunt presetele actuale. Testul direct de corectare TC este pe GTR; alte platforme nu au A/B nou. NiFe30/6 istoric.";
        }
      }
      return out;
    };
  }
  if (typeof footprintText === "function") {
    const original=footprintText;
    footprintText=function(atom,wire,output){
      if(atom?.id==="muted"&&wire?.id==="nife30")return "Muted+: NiFe30/7 SPACED sau NiFe52/6 SPACED; NiFe30/6 SPACED test istoric.";
      if(wire?.id==="nife30")return "Dicodes NiFe30/7 SPACED (TCR320) pe orice platformă compatibilă, Zivipf NiFe52/6 SPACED (TCR310) separat. Ø2,5 = preset. Geometria cu 7 spire poate reduce TH-ul direct, dar utilizatorul descrie un TH mai bogat pe palat; fără procent măsurat.";
      return original(atom,wire,output);
    };
  }
  if (typeof geometrySummary === "function") {
    const original=geometrySummary;
    geometrySummary=function(atom){
      const html=original(atom);
      // Muted+ a trecut la 7 SPACED; istoricul /6 nu se pierde din fișele A/B.
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
