/* RTA Lab — global TC six-wrap canonical overlay, 30.08.2026.
 * Active rule requested by user:
 * - Dicodes RESISTHERM NiFe30 · TCR320 · 5,5 Ω/m · Ø2,5 mm · 6 wraps
 * - Zivipf NiFe52 · TCR310 · Ø2,5 mm · 6 wraps
 * This file is loaded after tc-platform-map.js so every active NiFe output uses 6 wraps,
 * including platforms not explicitly enumerated in the platform-alloy map.
 */
(() => {
  window.RTA_LAB_TC_SIX_WRAP = {
    date: "2026-08-30",
    status: "canonical",
    coilDiameterMm: 2.5,
    wraps: 6,
    dicodes: {
      wire: "Dicodes RESISTHERM NiFe30",
      tcr: 320,
      resistanceOhmPerM: 5.5
    },
    zivipf: {
      wire: "Zivipf NiFe52",
      tcr: 310
    },
    principle: "Familia NiFe TC folosește de acum 6 spire pe Ø2,5 mm în outputul activ al Lab-ului. Alegerea NiFe30 vs NiFe52 rămâne per platformă."
  };

  if (typeof buildRule === "function") {
    const baseBuildRule = buildRule;
    buildRule = function(atom, wire) {
      if (wire && wire.id === "nife30") {
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
      output.wraps = "6";
      output.note = replaceLegacySeven(output.note);
      output.status = replaceLegacySeven(output.status);
      return output;
    };
  }

  if (typeof footprintText === "function") {
    const baseFootprintText = footprintText;
    footprintText = function(atom, wire, output) {
      if (wire && wire.id === "nife30") {
        return "6 spire pe Ø2,5 mm = baseline TC canonic actual; aliajul se alege per platformă, cu calibrare complet rece și TCR corect.";
      }
      return replaceLegacySeven(baseFootprintText(atom, wire, output));
    };
  }

  if (typeof comparisonText === "function") {
    const baseComparisonText = comparisonText;
    comparisonText = function(atom, wire, output) {
      return replaceLegacySeven(baseComparisonText(atom, wire, output));
    };
  }

  if (typeof explorerVapeText === "function") {
    const baseExplorerVapeText = explorerVapeText;
    explorerVapeText = function(atom, wire, output) {
      return replaceLegacySeven(baseExplorerVapeText(atom, wire, output));
    };
  }

  if (typeof geometrySummary === "function") {
    const baseGeometrySummary = geometrySummary;
    geometrySummary = function(atom) {
      return replaceLegacySeven(baseGeometrySummary(atom))
        .replace(/<b>NiFe30<\/b>7 spire/g, "<b>NiFe30</b>6 spire");
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".wire-guide-foot, .legend, .wire-card.tc .wire-specs").forEach(node => {
      node.innerHTML = replaceLegacySeven(node.innerHTML)
        .replace(/Dicodes\/Resistherm NiFe30\s*=\s*7/g, "Dicodes/Resistherm NiFe30 = 6")
        .replace(/Ø2,5 mm · <b>7 spire<\/b>/g, "Ø2,5 mm · <b>6 spire</b>");
    });
  });
})();