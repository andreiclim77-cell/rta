/* RTA Lab — TC platform-alloy affinity map, updated 14.10.2026.
 * Distinge aliajul recomandat în interiorul familiei NiFe TC.
 * KLP NiFe30 DNA TC este acum raportat practic, cu airflow/lichid neprecizate.
 * Actualizare 29.10.2026: Dicodes RESISTHERM NiFe30 TCR320, rola personală 5,5 Ω/m, Ø2,5 mm preset, 7 spire preferință globală.
 * Zivipf NiFe52 = TCR 310, Ø2,5 mm, 6 spire.
 * Actualizare 29.10.2026: TOATE atomizoarele compatibile preferă geometria Dicodes NiFe30/7, cu NiFe52/6 separat. GTR și 415 au propriile observații anterioare.
 */
(() => {
  window.RTA_LAB_TC_PLATFORM_MAP = {
    date: "2026-10-29",
    principle: "Pe KLP, GTR, KX și K Prime, utilizatorul pune la egalitate ca PREFERINȚĂ SENZORIALĂ Dicodes NiFe30 TCR320 și Zivipf NiFe52 TCR310. Nu sunt aliaje identice, iar setările TC se aleg separat. Baseline personal actual: Dicodes NiFe30/7 pe orice atomizor compatibil, Zivipf NiFe52/6; NiFe30/6 rămâne istoric selectabil. Pe 415 urmează K1 28 GA / 6 spire.",
    personalEqualPreference: {atoms:["klp","gtr","kx","kprime","415"],first:["Dicodes RESISTHERM NiFe30","Zivipf NiFe52"],second:"Kanthal A1 (K1)",evidence:"declarație directă 14.10.2026; nu confirmă A/B cross-alloy pe fiecare atomizor"},
    materials: {
      dicodesResisthermNiFe30: {
        wire: "Dicodes RESISTHERM NiFe30",
        tcr: 320,
        resistanceOhmPerM: 5.5,
        diam: "Ø2,5 mm",
        wraps: 7,
        evidence: "eticheta rolei confirmată 30.08.2026; noua regulă de 7 spire pe toate atomizoarele declarată 29.10.2026; 6 rămâne istoric",
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
        wraps: 7,
        status: "NiFe30/7 = preferință nouă de geometrie (29.10.2026); performanța exactă pe KX nu este A/B pe toate condițiile"
      },
      kprime: {
        wire: "Zivipf NiFe52",
        tcr: 310,
        diam: "Ø2,5 mm",
        wraps: 6,
        status: "egalitate personală TC: Zivipf NiFe52/6 = Dicodes NiFe30/7 ca preferință actuală; benchmarkul vechi NiFe30/6 rămâne istoric"
      },
      klp: {
        wire: "Dicodes RESISTHERM NiFe30",
        tcr: 320,
        resistanceOhmPerM: 5.5,
        diam: "Ø2,5 mm",
        wraps: 7,
        historicalSixWrapReport: {wraps:6,mod:"DNA",temperatureC:220,powerLimitW:16},
        status: "NiFe30/7 actual (observație despre coerență TC); DNA 220°C/16 W a fost raportat NUMAI pentru NiFe30/6 istoric, nu pentru 7"
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
      output.wraps = "7";
      output.power = "TC · valorile W/°C sunt orientative, nu test KLP/7";
      output.status = "Preferință #1 la egalitate · KLP · Dicodes NiFe30 / Zivipf NiFe52";
      output.noteClass = "valid";
      output.note = "KLP actual: Dicodes NiFe30 TCR320/7 = Zivipf NiFe52 TCR310/6 ca preferință personală, apoi K1. NiFe30/7 se simte mai coerent TC; TH direct poate scădea, dar crește bogăția percepută pe palat. Testul DNA 220°C/16 W, cu rezultate față de K1 28/5, aparține EXCLUSIV vechiului NiFe30/6; nu atribui aceste setări noului /7 și nici aliajului NiFe52. Nu este A/B controlat pe toate lichidele.";
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
      output.wraps = "7";
      output.status = "Preferință #1 la egalitate · KX · NiFe30/7 / NiFe52/6";
      output.noteClass = "valid";
      output.note = "Pe Kayfun X, Dicodes RESISTHERM NiFe30 TCR320/7 și Zivipf NiFe52 TCR310/6 sunt la egalitate ca preferință actuală, K1 fiind alternativa secundară. Testul istoric NiFe30/6 rămâne valabil numai în condițiile sale, fără A/B izolat al noului /7.";
      return output;
    }

    if (atom.id === "kprime") {
      output.wraps = "7";
      output.status = "Preferință #1 la egalitate · K Prime · NiFe30/7 / NiFe52/6";
      output.noteClass = "context";
      output.note = "Pe K Prime, Zivipf NiFe52 TCR310/6 și Dicodes RESISTHERM NiFe30 TCR320/7 sunt EGAL preferate; apoi K1. NiFe30/6 rămâne benchmark istoric 80% trabuc/20% cireșe, nu probă exactă pentru /7. Egalitatea este de preferință, nu chimică.";
      return output;
    }

    // Ultimul overlay aplică NiFe30/7 global; NiFe52/6 rămâne separat și neschimbat.
    return output;
  };

  if (baseWhyForLiquid) {
    whyForLiquid = function(wire, ax, objective, liquid) {
      const base = baseWhyForLiquid(wire, ax, objective, liquid);
      const atom = (typeof state !== "undefined" && state && state.atom) || null;
      if (!atom || !wire || wire.id !== "nife30") return base;
      if (atom.id === "415") return "415 Cool + Dicodes NiFe30/7 și Zivipf NiFe52/6 sunt primele preferințe personale; K1 28 GA/6 urmează, fără A/B controlat pe lichid";
      if (atom.id === "klp") return "KLP NiFe30 Dicodes/7 este preferința actuală de geometrie; rezultatul istoric /6 pe DNA 220°C/16 W NU se atribuie noului coil; NiFe52/6 rămâne distinct";
      if (atom.id === "gtr") return "GTR: Dicodes NiFe30 TCR320 cu 7 spire este alegerea personală TC actuală, la egalitate ca preferință cu Zivipf NiFe52 TCR310 / 6; 6 spire NiFe30 rămân funcționale, dar mai puțin coerente în testul recent";
      if (atom.id === "kx") return "KX trece la Dicodes RESISTHERM NiFe30 TCR320/7 ca geometrie preferată; observația pe /6 rămâne istorică";
      if (atom.id === "kprime") return "pe K Prime, NiFe30 Dicodes TCR320/7 și NiFe52 Zivipf TCR310/6 sunt egal preferate ca alegere; K1 rămâne alternativă";
      return base;
    };
  }

  if (baseComparisonText) {
    comparisonText = function(atom, wire, output) {
      const base = baseComparisonText(atom, wire, output);
      if (!atom || !wire || wire.id !== "nife30") return base;
      if (atom.id === "415") return "415 Cool: NiFe30/7 = NiFe52/6 ca preferință TC; apoi K1 28 GA/6; nu deducem procente senzoriale ori echivalența temperaturii fizice.";
      if (atom.id === "klp") return "+ KLP NiFe30/7 actual: comportament TC mai coerent raportat, cu TH mai bogat/rotund; vechiul /6 la DNA 220°C/16 W are observații distincte, netransferabile automat.";
      if (atom.id === "gtr") return "+ GTR: Dicodes NiFe30/7 = reglare TC coerentă raportată personal; Zivipf NiFe52/6 = preferat la egalitate; NiFe30/6 rămâne funcțional. Nicio cauzalitate izolată atribuită spirei.";
      if (atom.id === "kx") return "+ NiFe30 Dicodes 320/7 = geometrie personală actuală; testul /6 anterior rămâne separat; rola personală 5,5 Ω/m.";
      if (atom.id === "kprime") return "+ NiFe30 Dicodes 320/7 = NiFe52 Zivipf 310/6 ca preferință personală pe K Prime, nu materiale identice; K1 după.";
      return base;
    };
  }

  if (baseExplorerVapeText) {
    explorerVapeText = function(atom, wire, output) {
      if (!atom || !wire || wire.id !== "nife30") return baseExplorerVapeText(atom, wire, output);
      if (atom.id === "415") return "TEST PERSONAL: 415 RTA MTL Cool cu Dicodes NiFe30 TCR320 / 7 spire sau Zivipf NiFe52 TCR310 / 6 spire, ambele apreciate; K1 28 GA / 6 spire este următoarea preferință. Fără wattaj/TC/lichid în test.";
      if (atom.id === "klp") return "KLP ACTUAL: Dicodes RESISTHERM NiFe30 TCR320 / 7 spire; coerență TC personal raportată, fără W/°C noi. Testul anterior /6 pe DNA 220°C/16 W rămâne istoric separat.";
      if (atom.id === "gtr") return "TEST PERSONAL NOU: Dicodes RESISTHERM NiFe30 TCR320 / 7 spire merge coerent pe GTR, la 230°C cu plafon 16 W; Zivipf NiFe52 TCR310 / 6 spire este egal preferat. NiFe30/6 funcționează, dar testul nou favorizează 7; lichidul și montajul exact nu au fost controlate.";
      if (atom.id === "kx") return "PREFERINȚĂ ACTUALĂ: Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · 7 spire; vechiul /6 este benchmark istoric al KX.";
      if (atom.id === "kprime") return "PREFERINȚĂ PERSONALĂ LA EGALITATE: Dicodes NiFe30 TCR320 / 7 și Zivipf NiFe52 TCR310 / 6, apoi K1; profil TC separat pentru fiecare.";
      return baseExplorerVapeText(atom, wire, output);
    };
  }
})();