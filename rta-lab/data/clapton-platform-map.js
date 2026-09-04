/* RTA Lab — Clapton platform map, actualizat 04.09.2026.
 * Perechi active în Lab:
 * - Chariot -> K1 Clapton 2x30+38 / Ø2,5 / 5 (dedicată, validată direct)
 * - 415 -> K1 Clapton 2x30+38 / Ø2,5 / 5 (preferință de platformă)
 * - Dvarw MTL FL -> SS316L Clapton 2x30+38 / Ø2,5 / 5 (dedicată)
 * - Asylum V3 -> SS316L Clapton 2x30+38 / Ø2,5 / 5 (preferință de platformă; Flat 12–14 W, 13 W sweet spot)
 * Asylum păstrează K1 Clapton ca opțiune secundară.
 * Triangularea este contextuală: lichid + obiectiv + ADN platformă + Clapton preferat.
 */
(() => {
  window.RTA_LAB_CLAPTON_PLATFORM_MAP = {
    date: "2026-09-04",
    principle: "Cele patru perechi Clapton active influențează triangularea lichid + obiectiv + ADN platformă fără a forța un rezultat incompatibil.",
    activePairs: [
      "Chariot -> K1 Clapton/5",
      "415 -> K1 Clapton/5",
      "Dvarw MTL FL -> SS316L Clapton/5",
      "Asylum V3 -> SS316L Clapton/5"
    ],
    map: {
      chariot: {
        wireId: "k1clap",
        wire: "K1 Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "dedicated",
        status: "pereche dedicată; validare practică directă existentă pe Cronos Tab Plus"
      },
      "415": {
        wireId: "k1clap",
        wire: "K1 Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "preferred",
        status: "preferință Clapton de platformă pentru corp, densitate, mouthfeel și integrare"
      },
      dvarwfl: {
        wireId: "ssclap",
        wire: "SS316L Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "dedicated",
        status: "pereche dedicată canonică; claritate, top-notes și layering"
      },
      asylum: {
        wireId: "ssclap",
        wire: "SS316L Clapton 2×30+38",
        alternateWireId: "k1clap",
        alternateWire: "K1 Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        power: "12–14 W",
        sweetSpotW: 13,
        chamberValidated: "Flat",
        tier: "preferred",
        status: "SS316L Clapton este preferința principală pe Asylum V3; Flat 12–14 W, 13 W sweet spot practic; K1 Clapton secundar pentru corp/integrare"
      }
    }
  };

  if (typeof buildOutput !== "function") return;

  const baseWireBonus = typeof wireBonus === "function" ? wireBonus : null;
  const baseBuildOutput = buildOutput;
  const baseWhyForLiquid = typeof whyForLiquid === "function" ? whyForLiquid : null;
  const baseComparisonText = typeof comparisonText === "function" ? comparisonText : null;
  const baseExplorerVapeText = typeof explorerVapeText === "function" ? explorerVapeText : null;
  const baseGeometrySummary = typeof geometrySummary === "function" ? geometrySummary : null;

  const classText = liquid => String(liquid && liquid.class || "").toLowerCase();
  const objectiveNow = objective => String(objective || "complete");

  function profileFlags(ax, objective, liquid) {
    const cls = classText(liquid);
    return {
      complex: has(ax || [], "layers") || cls.includes("complex"),
      dark: ["dark", "burley", "kentucky", "latakia", "cigar"].some(key => has(ax || [], key)),
      rich: ["pipe", "sweet", "alcohol", "nuts", "coffeeCocoa"].some(key => has(ax || [], key)),
      bright: ["bright", "oriental", "perique", "citrus"].some(key => has(ax || [], key)),
      drySimple: has(ax || [], "dry") || has(ax || [], "simple") || cls.includes("simplu"),
      objective: objectiveNow(objective)
    };
  }

  if (baseWireBonus) {
    wireBonus = function(atom, wire, ax, objective, liquid) {
      let bonus = baseWireBonus(atom, wire, ax, objective, liquid);
      if (!atom || !wire) return bonus;

      const f = profileFlags(ax, objective, liquid);

      if (atom.id === "415" && wire.id === "k1clap") {
        bonus += 0.70;
        if (f.complex || f.dark || f.rich) bonus += 0.35;
        if (["body", "th", "complete"].includes(f.objective)) bonus += 0.25;
        if (f.objective === "tobacco" && f.drySimple) bonus -= 0.45;
      }

      if (atom.id === "asylum" && wire.id === "ssclap") {
        bonus += 0.80;
        if (f.complex || f.bright) bonus += 0.35;
        if (["layers", "complete", "smooth"].includes(f.objective)) bonus += 0.30;
        if (f.objective === "tobacco" && f.drySimple) bonus -= 0.35;
      }

      if (atom.id === "asylum" && wire.id === "k1clap") {
        bonus += 0.15;
        if (f.dark || f.rich || f.objective === "body") bonus += 0.25;
      }

      return bonus;
    };
  }

  buildOutput = function(atom, wire, liquid) {
    const output = baseBuildOutput(atom, wire, liquid);
    if (!atom || !wire || !output) return output;

    if (atom.id === "chariot" && wire.id === "k1clap") {
      output.wraps = "5";
      output.status = "Pereche Clapton dedicată · Chariot · K1";
      output.noteClass = "valid";
      output.note = "K1 Clapton 2×30+38 · Ø2,5 mm · 5 spire este perechea dedicată pentru Chariot. Există validare directă pe Cronos Tab Plus, unde a ieșit #1 în watt; pe alte lichide, triangularea contextuală rămâne activă.";
      return output;
    }

    if (atom.id === "415" && wire.id === "k1clap") {
      output.wraps = "5";
      output.status = "Pereche Clapton preferată · 415 · K1";
      output.noteClass = "valid";
      output.note = "K1 Clapton 2×30+38 · Ø2,5 mm · 5 spire este perechea Clapton preferată pe 415 pentru corp, densitate, mouthfeel și integrarea profilelor complexe. Motorul îi acordă prior contextual mai mare pe dark/rich/complex și pe obiective body/TH/complete.";
      return output;
    }

    if (atom.id === "dvarwfl" && wire.id === "ssclap") {
      output.wraps = "5";
      output.status = "Pereche Clapton dedicată · Dvarw FL · SS";
      output.noteClass = "context";
      output.note = "SS316L Clapton 2×30+38 · Ø2,5 mm · 5 spire este perechea dedicată pentru Dvarw MTL FL, orientată spre claritate, top-notes și layering.";
      return output;
    }

    if (atom.id === "asylum" && wire.id === "ssclap") {
      output.wraps = "5";
      output.power = "12–14 W";
      output.status = "Pereche Clapton preferată · Asylum V3 Flat · SS";
      output.noteClass = "valid";
      output.note = "SS316L Clapton 2×30+38 · Ø2,5 mm · 5 spire este perechea Clapton principală pe Asylum V3. Pe Flat: 12–14 W, cu 13 W sweet spot practic confirmat; ramp-up bun, claritate și layering, fără aromă gătită în testul curent. Triangularea îi acordă prior pe profile bright/complex și pe layers/complete/smooth.";
      return output;
    }

    if (atom.id === "asylum" && wire.id === "k1clap") {
      output.wraps = "5";
      output.status = "Clapton secundar · Asylum V3 · K1";
      output.noteClass = "context";
      output.note = "K1 Clapton 2×30+38 · Ø2,5 mm · 5 spire rămâne compatibil secundar pe Asylum V3 pentru corp, densitate și integrare; SS316L Clapton este perechea principală.";
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
        return "Chariot are K1 Clapton/5 ca pereche dedicată; lichidul și obiectivul decid intensitatea avantajului";
      }
      if (atom.id === "415" && wire.id === "k1clap") {
        return "415 are K1 Clapton/5 ca pereche preferată pentru corp, densitate, mouthfeel și integrare, cu bonus contextual pe profile dark/rich/complex";
      }
      if (atom.id === "dvarwfl" && wire.id === "ssclap") {
        return "Dvarw MTL FL are SS316L Clapton/5 ca pereche dedicată pentru claritate, top-notes și layering";
      }
      if (atom.id === "asylum" && wire.id === "ssclap") {
        return "Asylum V3 are SS316L Clapton/5 ca pereche principală; pe Flat, 12–14 W cu 13 W sweet spot, iar triangularea favorizează bright/complex/layers";
      }
      if (atom.id === "asylum" && wire.id === "k1clap") {
        return "Asylum V3 acceptă K1 Clapton/5 ca opțiune secundară pentru corp și integrare";
      }
      return base;
    };
  }

  if (baseComparisonText) {
    comparisonText = function(atom, wire, output) {
      const base = baseComparisonText(atom, wire, output);
      if (!atom || !wire) return base;

      if (atom.id === "chariot" && wire.id === "k1clap") {
        return "+ pereche dedicată Chariot: K1 Clapton/5 pentru corp, densitate, mouthfeel și tutun complex; validare directă Cronos Tab Plus.";
      }
      if (atom.id === "415" && wire.id === "k1clap") {
        return "+ pereche preferată 415: corp, densitate și integrare; round-wire-ul rămâne disponibil pentru redare mai directă/dry.";
      }
      if (atom.id === "dvarwfl" && wire.id === "ssclap") {
        return "+ pereche dedicată Dvarw FL: SS316L Clapton/5 pentru claritate, top-notes, Oriental/Perique și layering.";
      }
      if (atom.id === "asylum" && wire.id === "ssclap") {
        return "+ pereche principală Asylum: claritate, top-notes și layering; Flat 13 W sweet spot în plaja 12–14 W. K1 Clapton rămâne alternativa mai densă/rotundă.";
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
      if (atom.id === "415" && wire.id === "k1clap") {
        return "PERECHE PREFERATĂ: K1 Clapton 2×30+38 / 5 spire pentru corp, densitate, mouthfeel și integrare.";
      }
      if (atom.id === "dvarwfl" && wire.id === "ssclap") {
        return "PERECHE DEDICATĂ: SS316L Clapton 2×30+38 / 5 spire pentru claritate și layering.";
      }
      if (atom.id === "asylum" && wire.id === "ssclap") {
        return "PERECHE PREFERATĂ: SS316L Clapton 2×30+38 / 5 spire; Flat 12–14 W, 13 W sweet spot practic pentru claritate și layering.";
      }
      if (atom.id === "asylum" && wire.id === "k1clap") {
        return "CLAPTON SECUNDAR: K1 Clapton 2×30+38 / 5 spire pentru corp și integrare.";
      }
      return baseExplorerVapeText(atom, wire, output);
    };
  }

  if (baseGeometrySummary) {
    geometrySummary = function(atom) {
      const base = baseGeometrySummary(atom);
      if (!atom) return base;

      if (atom.id === "asylum") {
        return base + `<div class="geometry-rule"><h5>Asylum V3 · Clapton DNA</h5><div class="geometry-grid geometry-grid-five"><span><b>#1 SS316L Clapton</b>2×30+38 · 5 spire</span><span><b>Flat</b>12–14 W</span><span><b>Sweet spot</b>13 W confirmat</span><span><b>Rol</b>claritate + layering</span><span><b>K1 Clapton</b>secundar · corp/integrare</span></div></div>`;
      }

      if (atom.id === "415") {
        return base + `<div class="geometry-rule"><h5>415 · Clapton DNA</h5><div class="geometry-grid geometry-grid-five"><span><b>#1 Clapton</b>K1 2×30+38</span><span><b>Build</b>Ø2,5 · 5 spire</span><span><b>Rol</b>corp + densitate</span><span><b>Integrare</b>profile complexe</span><span><b>Triangulare</b>bonus contextual, nu forțare</span></div></div>`;
      }

      return base;
    };
  }
})();
