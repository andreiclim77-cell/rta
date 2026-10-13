/* RTA Lab — TC platform-alloy affinity map, updated 13.10.2026.
 * Distinge aliajul recomandat în interiorul familiei NiFe TC.
 * KLP NiFe30 DNA TC este acum raportat practic, cu airflow/lichid neprecizate.
 * Canonical 30.08.2026: Dicodes RESISTHERM NiFe30 = TCR 320, rola personală 5,5 Ω/m, Ø2,5 mm, 6 spire.
 * Zivipf NiFe52 = TCR 310, Ø2,5 mm, 6 spire.
 */
(() => {
  window.RTA_LAB_TC_PLATFORM_MAP = {
    date: "2026-10-13",
    principle: "În familia NiFe TC, aliajul se alege după ADN-ul platformei; baseline-ul canonic actual este 6 spire pe Ø2,5 mm atât pentru Dicodes NiFe30, cât și pentru Zivipf NiFe52.",
    materials: {
      dicodesResisthermNiFe30: {
        wire: "Dicodes RESISTHERM NiFe30",
        tcr: 320,
        resistanceOhmPerM: 5.5,
        diam: "Ø2,5 mm",
        wraps: 6,
        evidence: "etichetă rolă fizică fotografiată de utilizator la 30.08.2026; baseline 6 spire stabilit canonic după recalcularea R0",
        status: "material confirmat direct; geometrie baseline canonică"
      },
      zivipfNiFe52: {
        wire: "Zivipf NiFe52",
        tcr: 310,
        diam: "Ø2,5 mm",
        wraps: 6
      }
    },
    map: {
      gtr: {
        wire: "Dicodes RESISTHERM NiFe30",
        tcr: 320,
        resistanceOhmPerM: 5.5,
        diam: "Ø2,5 mm",
        wraps: 6,
        status: "validat practic ca aliaj/platformă; geometrie 6 spire = baseline canonic actual"
      },
      kx: {
        wire: "Dicodes RESISTHERM NiFe30",
        tcr: 320,
        resistanceOhmPerM: 5.5,
        diam: "Ø2,5 mm",
        wraps: 6,
        status: "validat practic ca aliaj/platformă; geometrie 6 spire = baseline canonic actual"
      },
      kprime: {
        wire: "Zivipf NiFe52",
        tcr: 310,
        diam: "Ø2,5 mm",
        wraps: 6,
        status: "preferință practică TC curentă; Dicodes NiFe30 a fost folosit și ca benchmark"
      },
      klp: {
        wire: "Dicodes RESISTHERM NiFe30",
        tcr: 320,
        resistanceOhmPerM: 5.5,
        diam: "Ø2,5 mm",
        wraps: 6,
        mod: "DNA",
        temperatureC: 220,
        powerLimitW: 16,
        status: "comparație personală favorabilă vs Kanthal; airflow și lichid neprecizate, nu A/B controlat"
      }
    },
    unchanged: []
  };

  if (typeof buildOutput !== "function") return;

  const baseBuildOutput = buildOutput;
  const baseWhyForLiquid = typeof whyForLiquid === "function" ? whyForLiquid : null;
  const baseComparisonText = typeof comparisonText === "function" ? comparisonText : null;
  const baseExplorerVapeText = typeof explorerVapeText === "function" ? explorerVapeText : null;

  buildOutput = function(atom, wire, liquid) {
    const output = baseBuildOutput(atom, wire, liquid);
    if (!atom || !wire || wire.id !== "nife30" || !output) return output;

    if (atom.id === "klp") {
      output.wraps = "6";
      output.power = "TC DNA 220°C · plafon 16 W (test personal)";
      output.status = "Test personal favorabil · KLP · Dicodes NiFe30";
      output.noteClass = "valid";
      output.note = "KLP + RESISTHERM NiFe30 / 6 spire / Ø2,5 / TCR320 la 220°C, plafon 16 W pe DNA: față de K1 28/5, spectru și palat îmbunătățite, TH și ofensivă puțin crescute, magie senzorială; apropiere de K Prime pe același fir. Airflow și lichidul nu au fost precizate; nu extrapola automat.";
      return output;
    }
    if (atom.id === "gtr") {
      output.wraps = "6";
      output.status = "Validat practic · GTR · NiFe30 Dicodes";
      output.noteClass = "valid";
      output.note = "Dicodes RESISTHERM NiFe30 · TCR 320 · 5,5 Ω/m pe rola personală · Ø2,5 mm · 6 spire este baseline-ul TC canonic actual pe GTR pentru finețe, layering, smoothness și consistență termică.";
      return output;
    }

    if (atom.id === "kx") {
      output.wraps = "6";
      output.status = "Validat practic · KX · NiFe30 Dicodes";
      output.noteClass = "valid";
      output.note = "Dicodes RESISTHERM NiFe30 · TCR 320 · 5,5 Ω/m pe rola personală · Ø2,5 mm · 6 spire este baseline-ul TC canonic actual pe KX: smooth, constant și natural pe platformă.";
      return output;
    }

    if (atom.id === "kprime") {
      output.wraps = "6";
      output.status = "Preferință practică TC · K Prime · NiFe52 Zivipf";
      output.noteClass = "context";
      output.note = "Zivipf NiFe52 · TCR 310 · Ø2,5 mm · 6 spire rămâne direcția TC curent preferată pe K Prime. Benchmark-ul istoric cu Dicodes RESISTHERM NiFe30 este actualizat la aceeași geometrie canonică Ø2,5 / 6 spire; rola Dicodes este TCR 320 și 5,5 Ω/m. Fără verdict universal cross-alloy fără A/B dedicat.";
      return output;
    }

    // Pentru celelalte platforme, overlay-ul global tc-sixwrap-global.js fixează familia NiFe la 6 spire.
    return output;
  };

  if (baseWhyForLiquid) {
    whyForLiquid = function(wire, ax, objective, liquid) {
      const base = baseWhyForLiquid(wire, ax, objective, liquid);
      const atom = (typeof state !== "undefined" && state && state.atom) || null;
      if (!atom || !wire || wire.id !== "nife30") return base;
      if (atom.id === "klp") return "KLP + NiFe30 Dicodes TCR320/6 la DNA 220°C/16 W a fost raportat cu mai mult palat, spectru și puțin mai mult TH/ofensivă decât K1 28/5; airflow/lichid încă neprecizate";
      if (atom.id === "gtr") return "GTR valorifică natural Dicodes RESISTHERM NiFe30 TCR320 / 6 spire pentru finețe, layering și smoothness";
      if (atom.id === "kx") return "KX păstrează Dicodes RESISTHERM NiFe30 TCR320 / 6 spire ca TC natural și foarte consistent";
      if (atom.id === "kprime") return "pe K Prime, direcția TC curentă este Zivipf NiFe52 TCR310 / 6 spire pentru footprint compact și răspuns prompt";
      return base;
    };
  }

  if (baseComparisonText) {
    comparisonText = function(atom, wire, output) {
      const base = baseComparisonText(atom, wire, output);
      if (!atom || !wire || wire.id !== "nife30") return base;
      if (atom.id === "klp") return "+ KLP NiFe30 TC pe DNA 220°C / plafon 16 W: spectru, palat și magie raportate mai bune față de K1 28/5, cu TH/ofensivă puțin crescute; comparație personală cu detalii parțiale.";
      if (atom.id === "gtr") return "+ NiFe30 Dicodes 320/6 = finețe, layering și consistență; rola personală 5,5 Ω/m.";
      if (atom.id === "kx") return "+ NiFe30 Dicodes 320/6 = smoothness și consistență; rola personală 5,5 Ω/m.";
      if (atom.id === "kprime") return "+ NiFe52 Zivipf 310/6 = compact și prompt; benchmark-ul NiFe30 este de acum tot 6 spire, fără verdict cross-alloy definitiv.";
      return base;
    };
  }

  if (baseExplorerVapeText) {
    explorerVapeText = function(atom, wire, output) {
      if (!atom || !wire || wire.id !== "nife30") return baseExplorerVapeText(atom, wire, output);
      if (atom.id === "klp") return "TEST PERSONAL: KLP + Dicodes RESISTHERM NiFe30 TCR320 / 6 spire / Ø2,5 pe DNA 220°C, plafon 16 W; apropie senzorial K Prime pe NiFe30. Airflow și lichid de completat.";
      if (atom.id === "gtr") return "VALIDAT: Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · 6 spire este baseline-ul TC canonic actual al GTR.";
      if (atom.id === "kx") return "VALIDAT: Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · 6 spire este baseline-ul TC canonic actual al KX.";
      if (atom.id === "kprime") return "PREFERINȚĂ TC CURENTĂ: Zivipf NiFe52 · TCR310 · 6 spire; benchmark-ul Dicodes NiFe30 este de acum tot 6 spire.";
      return baseExplorerVapeText(atom, wire, output);
    };
  }
})();