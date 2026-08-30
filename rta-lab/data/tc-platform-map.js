/* RTA Lab — TC platform-alloy affinity map, 28.08.2026.
 * Distinge aliajul/coilul recomandat în interiorul familiei NiFe TC.
 * Nu adaugă o a șasea sârmă în scoring și NU schimbă KLP.
 * Specificație material salvată 30.08.2026: rola personală Dicodes RESISTHERM NiFe30 este TCR 320 și 5,5 Ω/m, confirmat direct de pe eticheta fotografiată de utilizator.
 */
(() => {
  window.RTA_LAB_TC_PLATFORM_MAP = {
    date: "2026-08-30",
    principle: "În familia NiFe TC, aliajul și geometria se aleg după ADN-ul platformei; nu se transferă automat același coil între RTA-uri.",
    materials: {
      dicodesResisthermNiFe30: {
        wire: "Dicodes RESISTHERM NiFe30",
        tcr: 320,
        resistanceOhmPerM: 5.5,
        evidence: "etichetă rolă fizică fotografiată de utilizator la 30.08.2026",
        status: "confirmat direct de pe etichetă"
      },
      zivipfNiFe52: {
        wire: "Zivipf NiFe52",
        tcr: 310
      }
    },
    map: {
      gtr: {
        wire: "Dicodes/Resistherm NiFe30",
        tcr: 320,
        resistanceOhmPerM: 5.5,
        diam: "Ø2,5 mm",
        wraps: 7,
        status: "validat practic / potrivire naturală"
      },
      kx: {
        wire: "Dicodes/Resistherm NiFe30",
        tcr: 320,
        resistanceOhmPerM: 5.5,
        diam: "Ø2,5 mm",
        wraps: 7,
        status: "validat practic / extraordinar"
      },
      kprime: {
        wire: "Zivipf NiFe52",
        tcr: 310,
        diam: "Ø2,5 mm",
        wraps: 6,
        status: "preferință practică TC curentă; fără verdict universal cross-alloy"
      }
    },
    unchanged: ["klp"]
  };

  if (typeof buildOutput !== "function") return;

  const baseBuildOutput = buildOutput;
  const baseWhyForLiquid = typeof whyForLiquid === "function" ? whyForLiquid : null;
  const baseComparisonText = typeof comparisonText === "function" ? comparisonText : null;
  const baseExplorerVapeText = typeof explorerVapeText === "function" ? explorerVapeText : null;

  buildOutput = function(atom, wire, liquid) {
    const output = baseBuildOutput(atom, wire, liquid);
    if (!atom || !wire || wire.id !== "nife30" || !output) return output;

    if (atom.id === "gtr") {
      output.wraps = "7";
      output.status = "Validat practic · GTR · NiFe30 Dicodes";
      output.noteClass = "valid";
      output.note = "Dicodes/Resistherm NiFe30 · TCR 320 · 5,5 Ω/m pe rola personală · Ø2,5 mm · 7 spire este potrivirea TC naturală a GTR pentru finețe, layering, smoothness și consistență termică.";
      return output;
    }

    if (atom.id === "kx") {
      output.wraps = "7";
      output.status = "Validat practic · KX · NiFe30 Dicodes";
      output.noteClass = "valid";
      output.note = "Dicodes/Resistherm NiFe30 · TCR 320 · 5,5 Ω/m pe rola personală · Ø2,5 mm · 7 spire rămâne configurația TC validată ca extraordinară pe KX: smooth, constantă și foarte naturală pe platformă.";
      return output;
    }

    if (atom.id === "kprime") {
      output.wraps = "6";
      output.status = "Preferință practică TC · K Prime · NiFe52 Zivipf";
      output.noteClass = "context";
      output.note = "Zivipf NiFe52 · TCR 310 · Ø2,5 mm · 6 spire este direcția TC curent preferată pe K Prime: coil compact, răspuns prompt și R0 confortabilă. NiFe30/7 rămâne benchmark-ul istoric pe lichidul personal 80% trabuc / 20% cireșe; rola Dicodes RESISTHERM folosită ca reper este TCR 320 și 5,5 Ω/m. Nu se declară încă superioritate universală fără A/B cross-alloy dedicat.";
      return output;
    }

    // KLP și toate celelalte platforme rămân exact pe regulile existente.
    return output;
  };

  if (baseWhyForLiquid) {
    whyForLiquid = function(wire, ax, objective, liquid) {
      const base = baseWhyForLiquid(wire, ax, objective, liquid);
      const atom = (typeof state !== "undefined" && state && state.atom) || null;
      if (!atom || !wire || wire.id !== "nife30") return base;
      if (atom.id === "gtr") return "GTR valorifică natural Dicodes/Resistherm NiFe30 TCR320 / 7 spire pentru finețe, layering și smoothness";
      if (atom.id === "kx") return "KX a validat Dicodes/Resistherm NiFe30 TCR320 / 7 spire ca TC extraordinar și foarte natural";
      if (atom.id === "kprime") return "pe K Prime, direcția TC curentă este Zivipf NiFe52 TCR310 / 6 spire pentru footprint compact, răspuns prompt și R0 confortabilă";
      return base;
    };
  }

  if (baseComparisonText) {
    comparisonText = function(atom, wire, output) {
      const base = baseComparisonText(atom, wire, output);
      if (!atom || !wire || wire.id !== "nife30") return base;
      if (atom.id === "gtr") return "+ NiFe30 Dicodes 320/7 = finețe, layering și consistență; potrivire TC naturală validată. Rola personală: 5,5 Ω/m.";
      if (atom.id === "kx") return "+ NiFe30 Dicodes 320/7 = smoothness și consistență; configurație TC validată ca extraordinară. Rola personală: 5,5 Ω/m.";
      if (atom.id === "kprime") return "+ NiFe52 Zivipf 310/6 = mai compact și prompt, cu R0 confortabilă; NiFe30/7 rămâne benchmark specific 80/20, fără verdict cross-alloy definitiv.";
      return base;
    };
  }

  if (baseExplorerVapeText) {
    explorerVapeText = function(atom, wire, output) {
      if (!atom || !wire || wire.id !== "nife30") return baseExplorerVapeText(atom, wire, output);
      if (atom.id === "gtr") return "VALIDAT: Dicodes/Resistherm NiFe30 · TCR320 · 5,5 Ω/m · 7 spire este potrivirea TC naturală a GTR.";
      if (atom.id === "kx") return "VALIDAT: Dicodes/Resistherm NiFe30 · TCR320 · 5,5 Ω/m · 7 spire este extraordinar și natural pe KX.";
      if (atom.id === "kprime") return "PREFERINȚĂ TC CURENTĂ: Zivipf NiFe52 · TCR310 · 6 spire; compact, prompt și cu R0 confortabilă. NiFe30/7 rămâne benchmark specific.";
      return baseExplorerVapeText(atom, wire, output);
    };
  }
})();
