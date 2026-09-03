/* RTA Lab — Clapton platform map, actualizat 03.09.2026.
 * Perechi dedicate canonice:
 * - Chariot -> K1 Clapton 2x30+38 / Ø2,5 / 5 wraps
 * - Dvarw MTL FL -> SS316L Clapton 2x30+38 / Ø2,5 / 5 wraps
 * Preferințe suplimentare de platformă salvate de utilizator:
 * - 415 -> K1 Clapton 2x30+38 / Ø2,5 / 5 wraps
 * - Asylum V3 -> SS316L Clapton 2x30+38 / Ø2,5 / 5 wraps; K1 Clapton rămâne compatibil secundar
 * Overlay-ul nu forțează un Clapton pe locul #1 pentru un lichid incompatibil.
 */
(() => {
  window.RTA_LAB_CLAPTON_PLATFORM_MAP = {
    date: "2026-09-03",
    principle: "Păstrăm perechile dedicate, iar preferințele suplimentare de platformă influențează moderat scoringul fără a anula lichidul, obiectivul sau ADN-ul platformei.",
    map: {
      chariot: {
        wireId: "k1clap",
        wire: "K1 Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "dedicated",
        status: "pereche dedicată; validare practică directă existentă pe Cronos Tab Plus"
      },
      dvarwfl: {
        wireId: "ssclap",
        wire: "SS316L Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "dedicated",
        status: "pereche dedicată canonică; de confirmat A/B per lichid"
      },
      "415": {
        wireId: "k1clap",
        wire: "K1 Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "preferred",
        status: "preferință de platformă confirmată de utilizator; corp, densitate, mouthfeel și integrare"
      },
      asylum: {
        wireId: "ssclap",
        wire: "SS316L Clapton 2×30+38",
        alternateWireId: "k1clap",
        alternateWire: "K1 Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "preferred",
        status: "SS316L Clapton este preferința Clapton principală pe Asylum V3; K1 Clapton rămâne compatibil secundar"
      }
    }
  };

  if (typeof buildOutput !== "function") return;

  const baseWireBonus = typeof wireBonus === "function" ? wireBonus : null;
  const baseBuildOutput = buildOutput;
  const baseWhyForLiquid = typeof whyForLiquid === "function" ? whyForLiquid : null;
  const baseComparisonText = typeof comparisonText === "function" ? comparisonText : null;
  const baseExplorerVapeText = typeof explorerVapeText === "function" ? explorerVapeText : null;

  if (baseWireBonus) {
    wireBonus = function(atom, wire, ax, objective, liquid) {
      let bonus = baseWireBonus(atom, wire, ax, objective, liquid);
      if (!atom || !wire) return bonus;

      // Bonusuri moderate: preferință de platformă, nu rezultat forțat.
      if (atom.id === "415" && wire.id === "k1clap") bonus += 0.35;
      if (atom.id === "asylum" && wire.id === "ssclap") bonus += 0.45;
      if (atom.id === "asylum" && wire.id === "k1clap") bonus += 0.10;

      return bonus;
    };
  }

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

    if (atom.id === "415" && wire.id === "k1clap") {
      output.wraps = "5";
      output.status = "Preferință platformă · 415 · K1 Clapton";
      output.noteClass = "valid";
      output.note = "K1 Clapton 2×30+38 · Ø2,5 mm · 5 spire este salvat ca pereche Clapton preferată pe 415 pentru corp, densitate, mouthfeel și integrarea profilelor complexe. Nu înlocuiește automat 29/5 sau 28/5 când obiectivul cere tobacco-first ori layering de round-wire.";
      return output;
    }

    if (atom.id === "asylum" && wire.id === "ssclap") {
      output.wraps = "5";
      output.status = "Preferință platformă · Asylum V3 · SS Clapton";
      output.noteClass = "valid";
      output.note = "SS316L Clapton 2×30+38 · Ø2,5 mm · 5 spire este preferința Clapton principală pe Asylum V3: claritate, top-notes, separare și layering. K1 Clapton rămâne compatibil secundar când se caută mai mult corp și integrare.";
      return output;
    }

    if (atom.id === "asylum" && wire.id === "k1clap") {
      output.wraps = "5";
      output.status = "Compatibil secundar · Asylum V3 · K1 Clapton";
      output.noteClass = "context";
      output.note = "K1 Clapton 2×30+38 · Ø2,5 mm · 5 spire rămâne compatibil pe Asylum V3 pentru corp, densitate și integrare, dar SS316L Clapton este preferința principală de platformă.";
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
      if (atom.id === "415" && wire.id === "k1clap") {
        return "415 are acum K1 Clapton/5 ca preferință Clapton de platformă atunci când lichidul cere corp, densitate, mouthfeel și integrare";
      }
      if (atom.id === "asylum" && wire.id === "ssclap") {
        return "Asylum V3 preferă SS316L Clapton/5 pentru claritate, top-notes, separare și layering; acesta este Clapton-ul principal al platformei";
      }
      if (atom.id === "asylum" && wire.id === "k1clap") {
        return "Asylum V3 acceptă și K1 Clapton/5 pentru corp și integrare, dar ca opțiune secundară față de SS316L Clapton";
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
      if (atom.id === "415" && wire.id === "k1clap") {
        return "+ preferință Clapton 415: mai mult corp, densitate și integrare; − mai puțin rapid/direct decât round-wire 29/5 și mai puțin aerisit în layering decât 28/5.";
      }
      if (atom.id === "asylum" && wire.id === "ssclap") {
        return "+ preferința Clapton principală pe Asylum: claritate, top-notes și layering; K1 Clapton rămâne alternativa mai densă și mai rotundă.";
      }
      if (atom.id === "asylum" && wire.id === "k1clap") {
        return "+ alternativă Asylum pentru corp, densitate și integrare; − SS316L Clapton rămâne preferat pentru claritate și separare.";
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
      if (atom.id === "415" && wire.id === "k1clap") {
        return "PREFERINȚĂ CLAPTON: K1 Clapton 2×30+38 / 5 spire pentru corp, densitate, mouthfeel și integrare.";
      }
      if (atom.id === "asylum" && wire.id === "ssclap") {
        return "PREFERINȚĂ CLAPTON PRINCIPALĂ: SS316L Clapton 2×30+38 / 5 spire pentru claritate, top-notes și layering.";
      }
      if (atom.id === "asylum" && wire.id === "k1clap") {
        return "CLAPTON SECUNDAR COMPATIBIL: K1 Clapton 2×30+38 / 5 spire pentru corp și integrare.";
      }
      return baseExplorerVapeText(atom, wire, output);
    };
  }
})();
