/* RTA Lab — TC platform-alloy affinity map, updated 14.10.2026.
 * Distinge aliajul recomandat în interiorul familiei NiFe TC.
 * KLP NiFe30 DNA TC este acum raportat practic, cu airflow/lichid neprecizate.
 * Canonical 30.08.2026: Dicodes RESISTHERM NiFe30 = TCR 320, rola personală 5,5 Ω/m, Ø2,5 mm, 6 spire.
 * Zivipf NiFe52 = TCR 310, Ø2,5 mm, 6 spire.
 * Actualizare 15.10.2026: GTR și 415 Cool preferă Dicodes NiFe30/7, iar NiFe52/6 rămâne egal ca preferință pe fiecare.
 */
(() => {
  window.RTA_LAB_TC_PLATFORM_MAP = {
    date: "2026-10-15",
    principle: "Pe KLP, GTR, KX și K Prime, utilizatorul pune la egalitate ca PREFERINȚĂ SENZORIALĂ Dicodes NiFe30 TCR320 și Zivipf NiFe52 TCR310. Nu sunt aliaje identice, iar setările TC se aleg separat. Baseline general: 6 spire/Ø2,5 mm; excepții GTR și 415 Cool: Dicodes NiFe30/7, Zivipf NiFe52/6. Pe 415 urmează K1 28 GA / 6 spire.",
    personalEqualPreference: {atoms:["klp","gtr","kx","kprime","415"],first:["Dicodes RESISTHERM NiFe30","Zivipf NiFe52"],second:"Kanthal A1 (K1)",evidence:"declarație directă 14.10.2026; nu confirmă A/B cross-alloy pe fiecare atomizor"},
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
      "415":{
        wire:"Dicodes RESISTHERM NiFe30",tcr:320,resistanceOhmPerM:5.5,
        diam:"Ø2,5 mm (preset Lab)",wraps:7,
        zivipfAlternative:{wire:"Zivipf NiFe52",tcr:310,wraps:6},
        k128Alternative:{wire:"K1 28 GA",wraps:6},
        historicalAlternatives:[{wire:"K1 28 GA",wraps:5},{wire:"K1 Clapton",wraps:5},{wire:"Dicodes RESISTHERM NiFe30",wraps:6}],
        status:"declarație personală 15.10.2026: NiFe30/7 = NiFe52/6, apoi K1 28/6; fără test controlat ori TC măsurat"
      },
      gtr: {
        wire: "Dicodes RESISTHERM NiFe30",
        tcr: 320,
        resistanceOhmPerM: 5.5,
        diam: "Ø2,5 mm",
        wraps: 7,
        zivipfAlternative:{wire:"Zivipf NiFe52",tcr:310,wraps:6},
        legacyDicodesAlternative:{wire:"Dicodes RESISTHERM NiFe30",tcr:320,wraps:6},
        status: "confirmat personal 15.10.2026: NiFe30/7 mai coerent TC decât montajul anterior de 6; NiFe52/6 excelent; Nu A/B izolat"
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

    if (atom.id === "415") {
      output.wraps="7";
      output.status="415 Cool · prima preferință · NiFe30/7 = NiFe52/6";
      output.noteClass="valid";
      output.note="415 Cool: Dicodes RESISTHERM NiFe30 TCR320/7 și Zivipf NiFe52 TCR310/6 sunt la egalitate în preferința personală, apoi K1 28 GA/6. Diametrul Ø2,5 este preset, nu măsurătoare; wattajul/temperatura testului nu sunt precizate. Vechile 28/5 și K1 Clapton/5 rămân istorice valide.";
      return output;
    }
    if (atom.id === "klp") {
      output.wraps = "6";
      output.power = "TC DNA 220°C · plafon 16 W (test personal)";
      output.status = "Preferință #1 la egalitate · KLP · Dicodes NiFe30 / Zivipf NiFe52";
      output.noteClass = "valid";
      output.note = "Egalitate personală ca alegere: Dicodes NiFe30 TCR320 = Zivipf NiFe52 TCR310, apoi K1; nu sunt aliaje identice. KLP cu Dicodes NiFe30 a fost testat concret la DNA 220°C, limită 16 W și a câștigat la spectru/palat/TH/ofensivă vs K1 28/5. Nu transfera aceste setări sau constatări automat către NiFe52: airflow, lichid și A/B cross-alloy neprecizate.";
      return output;
    }
    if (atom.id === "gtr") {
      output.wraps = "7";
      output.status = "Preferință #1 la egalitate · GTR · NiFe30/7 / NiFe52/6";
      output.noteClass = "valid";
      output.note = "Pe GTR, Dicodes RESISTHERM NiFe30 TCR320 / 7 spire funcționează mai coerent în TC potrivit noului test personal la 230°C, plafon 16 W; Zivipf NiFe52 TCR310 / 6 spire este la egalitate ca preferință personală. NiFe30/6 rămâne funcțional, nu este eliminat. Nu atribui exclusiv spirei îmbunătățirea, fiindcă montajul a fost refăcut. Nu transfera 230°C/16 W la NiFe52.";
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

    // Pentru celelalte platforme, overlay-ul TC păstrează NiFe la 6 spire; GTR NiFe30 este excepția.
    return output;
  };

  if (baseWhyForLiquid) {
    whyForLiquid = function(wire, ax, objective, liquid) {
      const base = baseWhyForLiquid(wire, ax, objective, liquid);
      const atom = (typeof state !== "undefined" && state && state.atom) || null;
      if (!atom || !wire || wire.id !== "nife30") return base;
      if (atom.id === "415") return "415 Cool + Dicodes NiFe30/7 și Zivipf NiFe52/6 sunt primele preferințe personale; K1 28 GA/6 urmează, fără A/B controlat pe lichid";
      if (atom.id === "klp") return "KLP + NiFe30 Dicodes TCR320/6 la DNA 220°C/16 W a fost raportat cu mai mult palat, spectru și puțin mai mult TH/ofensivă decât K1 28/5; airflow/lichid încă neprecizate";
      if (atom.id === "gtr") return "GTR: Dicodes NiFe30 TCR320 cu 7 spire este alegerea personală TC actuală, la egalitate ca preferință cu Zivipf NiFe52 TCR310 / 6; 6 spire NiFe30 rămân funcționale, dar mai puțin coerente în testul recent";
      if (atom.id === "kx") return "KX păstrează Dicodes RESISTHERM NiFe30 TCR320 / 6 spire ca TC natural și foarte consistent";
      if (atom.id === "kprime") return "pe K Prime, NiFe30 Dicodes TCR320 și NiFe52 Zivipf TCR310 sunt egal preferate în TC/6; K1 rămâne alternativă";
      return base;
    };
  }

  if (baseComparisonText) {
    comparisonText = function(atom, wire, output) {
      const base = baseComparisonText(atom, wire, output);
      if (!atom || !wire || wire.id !== "nife30") return base;
      if (atom.id === "415") return "415 Cool: NiFe30/7 = NiFe52/6 ca preferință TC; apoi K1 28 GA/6; nu deducem procente senzoriale ori echivalența temperaturii fizice.";
      if (atom.id === "klp") return "+ KLP NiFe30 TC pe DNA 220°C / plafon 16 W: spectru, palat și magie raportate mai bune față de K1 28/5, cu TH/ofensivă puțin crescute; comparație personală cu detalii parțiale.";
      if (atom.id === "gtr") return "+ GTR: Dicodes NiFe30/7 = reglare TC coerentă raportată personal; Zivipf NiFe52/6 = preferat la egalitate; NiFe30/6 rămâne funcțional. Nicio cauzalitate izolată atribuită spirei.";
      if (atom.id === "kx") return "+ NiFe30 Dicodes 320/6 = smoothness și consistență; rola personală 5,5 Ω/m.";
      if (atom.id === "kprime") return "+ NiFe30 Dicodes 320/6 = NiFe52 Zivipf 310/6 ca preferință personală pe K Prime, nu ca materiale identice; K1 după.";
      return base;
    };
  }

  if (baseExplorerVapeText) {
    explorerVapeText = function(atom, wire, output) {
      if (!atom || !wire || wire.id !== "nife30") return baseExplorerVapeText(atom, wire, output);
      if (atom.id === "415") return "TEST PERSONAL: 415 RTA MTL Cool cu Dicodes NiFe30 TCR320 / 7 spire sau Zivipf NiFe52 TCR310 / 6 spire, ambele apreciate; K1 28 GA / 6 spire este următoarea preferință. Fără wattaj/TC/lichid în test.";
      if (atom.id === "klp") return "TEST PERSONAL: KLP + Dicodes RESISTHERM NiFe30 TCR320 / 6 spire / Ø2,5 pe DNA 220°C, plafon 16 W; apropie senzorial K Prime pe NiFe30. Airflow și lichid de completat.";
      if (atom.id === "gtr") return "TEST PERSONAL NOU: Dicodes RESISTHERM NiFe30 TCR320 / 7 spire merge coerent pe GTR, la 230°C cu plafon 16 W; Zivipf NiFe52 TCR310 / 6 spire este egal preferat. NiFe30/6 funcționează, dar testul nou favorizează 7; lichidul și montajul exact nu au fost controlate.";
      if (atom.id === "kx") return "VALIDAT: Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · 6 spire este baseline-ul TC canonic actual al KX.";
      if (atom.id === "kprime") return "PREFERINȚĂ PERSONALĂ LA EGALITATE: Dicodes NiFe30 TCR320 / 6 și Zivipf NiFe52 TCR310 / 6, apoi K1; profil TC separat pentru fiecare.";
      return baseExplorerVapeText(atom, wire, output);
    };
  }
})();