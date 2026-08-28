/* RTA Lab — dedicated Clapton platform map, 28.08.2026.
 * Canonical personal pairings:
 * - Chariot -> K1 Clapton 2x30+38 / Ø2,5 / 5 wraps
 * - Dvarw MTL FL -> SS316L Clapton 2x30+38 / Ø2,5 / 5 wraps
 * This overlay does not force a Clapton to rank #1 for an incompatible liquid.
 */
(() => {
  window.RTA_LAB_CLAPTON_PLATFORM_MAP = {
    date: "2026-08-28",
    principle: "Fiecare Clapton are o platforma dedicata in colectia personala, fara a anula scoringul contextual lichid + obiectiv.",
    map: {
      chariot: {
        wireId: "k1clap",
        wire: "K1 Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        status: "pereche dedicata; validare practica directa existenta pe Cronos Tab Plus"
      },
      dvarwfl: {
        wireId: "ssclap",
        wire: "SS316L Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        status: "pereche dedicata canonica; de confirmat A/B per lichid"
      }
    }
  };

  if (typeof buildOutput !== "function") return;

  const baseBuildOutput = buildOutput;
  const baseWhyForLiquid = typeof whyForLiquid === "function" ? whyForLiquid : null;
  const baseComparisonText = typeof comparisonText === "function" ? comparisonText : null;
  const baseExplorerVapeText = typeof explorerVapeText === "function" ? explorerVapeText : null;

  buildOutput = function(atom, wire, liquid) {
    const output = baseBuildOutput(atom, wire, liquid);
    if (!atom || !wire || !output) return output;

    if (atom.id === "chariot" && wire.id === "k1clap") {
      output.wraps = "5";
      output.status = "Pereche dedicată · Chariot · K1 Clapton";
      output.noteClass = "valid";
      output.note = "K1 Clapton 2×30+38 · Ø2,5 mm · 5 spire rămâne Clapton-ul dedicat pentru Chariot. Există validare practică directă pe Cronos Tab Plus, unde a ieșit #1 în watt; pe alte lichide scoringul contextual rămâne activ.";
      return output;
    }

    if (atom.id === "dvarwfl" && wire.id === "ssclap") {
      output.wraps = "5";
      output.status = "Pereche dedicată · Dvarw FL · SS Clapton";
      output.noteClass = "context";
      output.note = "SS316L Clapton 2×30+38 · Ø2,5 mm · 5 spire rămâne Clapton-ul dedicat pentru Dvarw MTL FL, ales pentru claritate, top-notes și layering. Perechea este canonică în colecție și se rafinează prin A/B direct per lichid.";
      return output;
    }

    return output;
  };

  if (baseWhyForLiquid) {
    whyForLiquid = function(wire, ax, objective, liquid) {
      const base = baseWhyForLiquid(wire, ax, objective, liquid);
      const atom = (typeof state !== "undefined" && state && state.atom) || null;
      if (!atom || !wire) return base;
      if (atom.id === "chariot" && wire.id === "k1clap") {
        return "Chariot este platforma dedicată pentru K1 Clapton/5; perechea are validare practică directă pe Cronos Tab Plus, iar profilul lichidului decide dacă intră în TOP 3";
      }
      if (atom.id === "dvarwfl" && wire.id === "ssclap") {
        return "Dvarw MTL FL este platforma dedicată pentru SS316L Clapton/5, unde ADN-ul analitic favorizează claritatea, top-notes și layering-ul";
      }
      return base;
    };
  }

  if (baseComparisonText) {
    comparisonText = function(atom, wire, output) {
      const base = baseComparisonText(atom, wire, output);
      if (!atom || !wire) return base;
      if (atom.id === "chariot" && wire.id === "k1clap") {
        return "+ pereche Clapton dedicată: K1 Clapton/5 pentru corp, densitate, mouthfeel și tutun complex; validare directă Cronos Tab Plus.";
      }
      if (atom.id === "dvarwfl" && wire.id === "ssclap") {
        return "+ pereche Clapton dedicată: SS316L Clapton/5 pentru claritate, top-notes, Oriental/Perique și layering; A/B per lichid rămâne criteriul final.";
      }
      return base;
    };
  }

  if (baseExplorerVapeText) {
    explorerVapeText = function(atom, wire, output) {
      if (!atom || !wire) return baseExplorerVapeText(atom, wire, output);
      if (atom.id === "chariot" && wire.id === "k1clap") {
        return "PERECHE DEDICATĂ: K1 Clapton 2×30+38 / 5 spire; validare practică directă pe Cronos Tab Plus.";
      }
      if (atom.id === "dvarwfl" && wire.id === "ssclap") {
        return "PERECHE DEDICATĂ: SS316L Clapton 2×30+38 / 5 spire; claritate și layering, cu A/B per lichid pentru validare fină.";
      }
      return baseExplorerVapeText(atom, wire, output);
    };
  }
})();
