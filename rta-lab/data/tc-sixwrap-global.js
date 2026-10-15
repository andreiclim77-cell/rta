/* RTA Lab — TC six-wrap baseline with GTR NiFe30 seven-wrap exception, 15.10.2026.
 * Active rule requested by user:
 * - Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · Ø2,5 mm · 6 wraps
 * - Zivipf NiFe52 · TCR310 · Ø2,5 mm · 6 wraps
 * Loaded after tc-platform-map.js. General baseline remains 6;
 * only GTR + Dicodes NiFe30 is now preferred at 7 (NiFe52 remains 6).
 * Legacy engine has one NiFe slot: distinguish both material choices in text.
 */
(() => {
  window.RTA_LAB_TC_SIX_WRAP = {
    date: "2026-10-15",
    status: "canonical",
    coilDiameterMm: 2.5,
    wraps: 6,
    overrides: { gtr: { dicodesNiFe30Wraps:7, zivipfNiFe52Wraps:6, dicodesNiFe30LegacyWraps:6 } },
    dicodes: {
      wire: "Dicodes RESISTHERM NiFe30",
      tcr: 320,
      resistanceOhmPerM: 5.5
    },
    zivipf: {
      wire: "Zivipf NiFe52",
      tcr: 310
    },
    principle: "Baseline global 6 spire; excepție GTR: Dicodes NiFe30 TCR320 / 7 spire preferat, Zivipf NiFe52 TCR310 / 6 spire preferat, NiFe30/6 funcțional. Nu aplica excepția pe alte platforme."
  };

  if (typeof buildRule === "function") {
    const baseBuildRule = buildRule;
    buildRule = function(atom, wire) {
      if (wire && wire.id === "nife30") {
        if (atom && atom.id === "gtr") return {
          wraps:7,
          reason:"GTR: Dicodes NiFe30 TCR320 preferat personal la 7 spire în TC; Zivipf NiFe52 TCR310 la 6 spire rămâne egal preferat. NiFe30/6 funcționează. Diferența poate include efectul refacerii coilului, nu A/B izolat."
        };
        return {
          wraps: 6,
          reason: "NiFe TC folosește baseline-ul canonic actual de 6 spire pe Ø2,5 mm, cu calibrare complet rece și TCR corect."
        };
      }
      return baseBuildRule(atom, wire);
    };
  }

  const replaceLegacySeven = value => String(value || "")
    .replace(/NiFe30\/7/g, "NiFe30/6")
    .replace(/320\/7/g, "320/6")
    .replace(/NiFe30\s*320\/7/g, "NiFe30 320/6")
    .replace(/NiFe30\s*=\s*7 spire/g, "NiFe30 = 6 spire")
    .replace(/NiFe30<\/b>7 spire/g, "NiFe30</b>6 spire")
    .replace(/NiFe30[^<\n]{0,80}7 spire/g, match => match.replace("7 spire", "6 spire"));

  if (typeof buildOutput === "function") {
    const baseBuildOutput = buildOutput;
    buildOutput = function(atom, wire, liquid) {
      const output = baseBuildOutput(atom, wire, liquid);
      if (!wire || wire.id !== "nife30" || !output) return output;
      if (atom && atom.id === "gtr") {
        output.wraps = "7"; // Legacy slot displays Dicodes variant; NiFe52/6 is stated in the note.
      } else {
        output.wraps = "6";
        output.note = replaceLegacySeven(output.note);
        output.status = replaceLegacySeven(output.status);
      }
      return output;
    };
  }

  if (typeof footprintText === "function") {
    const baseFootprintText = footprintText;
    footprintText = function(atom, wire, output) {
      if (wire && wire.id === "nife30") {
        if (atom && atom.id === "gtr")
          return "GTR: Dicodes NiFe30/7 este preferat personal TC; Zivipf NiFe52/6 este egal preferat. NiFe30/6 rămâne funcțional. Calibrare complet rece, TCR distinct.";
        return "6 spire pe Ø2,5 mm = baseline TC canonic actual; aliajul se alege per platformă, cu calibrare complet rece și TCR corect.";
      }
      return replaceLegacySeven(baseFootprintText(atom, wire, output));
    };
  }

  if (typeof comparisonText === "function") {
    const baseComparisonText = comparisonText;
    comparisonText = function(atom, wire, output) {
      const text = baseComparisonText(atom, wire, output);
      return atom && atom.id === "gtr" && wire && wire.id === "nife30" ? text : replaceLegacySeven(text);
    };
  }

  if (typeof explorerVapeText === "function") {
    const baseExplorerVapeText = explorerVapeText;
    explorerVapeText = function(atom, wire, output) {
      const text = baseExplorerVapeText(atom, wire, output);
      return atom && atom.id === "gtr" && wire && wire.id === "nife30" ? text : replaceLegacySeven(text);
    };
  }

  if (typeof geometrySummary === "function") {
    const baseGeometrySummary = geometrySummary;
    geometrySummary = function(atom) {
      const text = baseGeometrySummary(atom);
      if (atom && atom.id === "gtr")
        return text.replace("<b>NiFe TC</b>6 spire · Ø2,5 · TCR 320/310",
          "<b>NiFe TC</b>Dicodes NiFe30/7 · Zivipf NiFe52/6 · Ø2,5");
      return replaceLegacySeven(text)
        .replace(/<b>NiFe30<\/b>7 spire/g, "<b>NiFe30</b>6 spire");
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".wire-guide-foot, .legend, .wire-card.tc .wire-specs").forEach(node => {
      if (node.textContent && node.textContent.includes("GTR") && /NiFe30[^<\n]{0,20}(?:\/7|7 spire)/.test(node.innerHTML)) return;
      node.innerHTML = replaceLegacySeven(node.innerHTML)
        .replace(/Dicodes\/Resistherm NiFe30\s*=\s*7/g, "Dicodes/Resistherm NiFe30 = 6")
        .replace(/Ø2,5 mm · <b>7 spire<\/b>/g, "Ø2,5 mm · <b>6 spire</b>");
    });
  });
})();