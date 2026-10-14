/* RTA Lab — TC platform-alloy affinity map, updated 14.10.2026.
 * Distinge aliajul recomandat în interiorul familiei NiFe TC.
 * KLP NiFe30 DNA TC este acum raportat practic, cu airflow/lichid neprecizate.
 * Canonical 30.08.2026: Dicodes RESISTHERM NiFe30 = TCR 320, rola personală 5,5 Ω/m, Ø2,5 mm, 6 spire.
 * Zivipf NiFe52 = TCR 310, Ø2,5 mm, 6 spire.
 */
(() => {
  window.RTA_LAB_TC_PLATFORM_MAP = {
    date: "2026-10-14",
    principle: "Pe KLP, GTR, KX și K Prime, utilizatorul pune la egalitate ca PREFERINȚĂ SENZORIALĂ Dicodes NiFe30 TCR320 și Zivipf NiFe52 TCR310. Nu sunt aliaje identice, iar setările TC se aleg separat. Baseline-ul ambelor rămâne 6 spire pe Ø2,5 mm.",
    personalEqualPreference: {atoms:["klp","gtr","kx","kprime"],first:["Dicodes RESISTHERM NiFe30","Zivipf NiFe52"],second:"Kanthal A1 (K1)",evidence:"declarație directă 14.10.2026; nu confirmă A/B cross-alloy pe fiecare atomizor"},
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
        status: "egalitate personală TC: Zivipf NiFe52 = Dicodes NiFe30, K1 după; benchmark separat Dicodes NiFe30"
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
      output.status = "Preferință #1 la egalitate · KLP · Dicodes NiFe30 / Zivipf NiFe52";
      output.noteClass = "valid";
      output.note = "Egalitate personală ca alegere: Dicodes NiFe30 TCR320 = Zivipf NiFe52 TCR310, apoi K1; nu sunt aliaje identice. KLP cu Dicodes NiFe30 a fost testat concret la DNA 220°C, limită 16 W și a câștigat la spectru/palat/TH/ofensivă vs K1 28/5. Nu transfera aceste setări sau constatări automat către NiFe52: airflow, lichid și A/B cross-alloy neprecizate.";
      return output;
    }
    if (atom.id === "gtr") {
      output.wraps = "6";
      output.status = "Preferință #1 la egalitate · GTR · NiFe30 / NiFe52";
      output.noteClass = "valid";
      output.note = "Pe GTR, Dicodes RESISTHERM NiFe30 TCR320/6 și Zivipf NiFe52 TCR310/6 au aceeași prioritate ca alegere personală, urmate de K1. Magia cu Dicodes rămâne observație personală specifică, nu dovadă de identitate a aliajelor.";
      return output;
    }

    if (atom.id === "kx") {
      output.wraps = "6";
      output.status = "Preferință #1 la egalitate · KX · NiFe30 / NiFe52";
      output.noteClass = "valid";
      output.note = "Pe Kayfun X, Dicodes RESISTHERM NiFe30 TCR320/6 și Zivipf NiFe52 TCR310/6 sunt la egalitate ca preferință, K1 fiind alternativa secundară. Validarea specifică NiFe30 (smooth, natural) se păstrează distinct de preferința declarată NiFe52.";
      return output;
    }

    if (atom.id === "kprime") {
      output.wraps = "6";
      output.status = "Preferință #1 la egalitate · K Prime · NiFe30 / NiFe52";
      output.noteClass = "context";
      output.note = "Pe K Prime, Zivipf NiFe52 TCR310/6 și Dicodes RESISTHERM NiFe30 TCR320/6 sunt EGAL preferate; apoi K1. NiFe30 are benchmarkul istoric 80% trabuc/20% cireșe. Egalitatea exprimă alegerea personală, nu echivalență chimică sau A/B universal.";
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
      if (atom.id === "kprime") return "pe K Prime, NiFe30 Dicodes TCR320 și NiFe52 Zivipf TCR310 sunt egal preferate în TC/6; K1 rămâne alternativă";
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
      if (atom.id === "kprime") return "+ NiFe30 Dicodes 320/6 = NiFe52 Zivipf 310/6 ca preferință personală pe K Prime, nu ca materiale identice; K1 după.";
      return base;
    };
  }

  if (baseExplorerVapeText) {
    explorerVapeText = function(atom, wire, output) {
      if (!atom || !wire || wire.id !== "nife30") return baseExplorerVapeText(atom, wire, output);
      if (atom.id === "klp") return "TEST PERSONAL: KLP + Dicodes RESISTHERM NiFe30 TCR320 / 6 spire / Ø2,5 pe DNA 220°C, plafon 16 W; apropie senzorial K Prime pe NiFe30. Airflow și lichid de completat.";
      if (atom.id === "gtr") return "VALIDAT: Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · 6 spire este baseline-ul TC canonic actual al GTR.";
      if (atom.id === "kx") return "VALIDAT: Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · 6 spire este baseline-ul TC canonic actual al KX.";
      if (atom.id === "kprime") return "PREFERINȚĂ PERSONALĂ LA EGALITATE: Dicodes NiFe30 TCR320 / 6 și Zivipf NiFe52 TCR310 / 6, apoi K1; profil TC separat pentru fiecare.";
      return baseExplorerVapeText(atom, wire, output);
    };
  }
})();