/* RTA Lab — preferință personală recurentă, actualizat 04.09.2026.
 * PERSONAL 5-WRAP PREFERENCE / COMPACT-COIL BIAS
 * K1 29 GA / Ø2,5 / 5 spire este păstrat numai CONTACT. Varianta de 5 spire distanțată este eliminată.
 */
(() => {
  window.RTA_LAB_PERSONAL_BUILD_DNA = {
    date: "2026-09-04",
    name: "PERSONAL 5-WRAP PREFERENCE / COMPACT-COIL BIAS",
    principle: "Pentru utilizator, K1 29 GA / Ø2,5 / 5 contact este priorul personal round-wire principal, urmat de K1 28 GA / Ø2,5 / 5 contact.",
    interpretation: "Preferința sugerează masă termică redusă + footprint compact + ramp-up rapid + vaporizare focalizată. Este interpretare mecanică, nu fapt universal demonstrat.",
    guardrail: "ADN-ul platformei și validările directe pot depăși priorul personal. 6 spire se păstrează când există câștig practic/geometric real."
  };

  if (typeof wireBonus !== "function" || typeof buildOutput !== "function") return;

  const baseWireBonus = wireBonus;
  const baseBuildOutput = buildOutput;
  const baseWhyForLiquid = typeof whyForLiquid === "function" ? whyForLiquid : null;
  const baseComparisonText = typeof comparisonText === "function" ? comparisonText : null;
  const baseFootprintText = typeof footprintText === "function" ? footprintText : null;

  const isNet = liquid => String(liquid && liquid.class || "").startsWith("NET");

  function personalFiveWrapNote(wireId) {
    if (wireId === "k129") {
      return "Prior personal recurent: K1 29 GA / Ø2,5 / 5 spire contact este configurația round-wire principală a utilizatorului.";
    }
    return "Prior personal recurent: K1 28 GA / Ø2,5 / 5 spire contact este priorul secundar, cu mai mult corp și inerție termică decât 29/5.";
  }

  function preserveSix(atom, liquid, output) {
    if (!atom || !output) return false;
    if (atom.id === "pmfree" && isNet(liquid)) return true;
    if (atom.id === "415" && Number(output.wraps) === 6) return true;
    return false;
  }

  wireBonus = function(atom, wire, ax, objective, liquid) {
    let bonus = baseWireBonus(atom, wire, ax, objective, liquid);
    if (!wire) return bonus;
    if (wire.id === "k129") bonus += 0.55;
    if (wire.id === "k128") bonus += 0.30;
    return bonus;
  };

  buildOutput = function(atom, wire, liquid) {
    const output = baseBuildOutput(atom, wire, liquid);
    if (!atom || !wire || !output) return output;

    if (wire.id === "k128") {
      output.wraps = "5";
      output.note = `${output.note || ""} ${personalFiveWrapNote("k128")}`.trim();
      if (!String(output.status || "").toLowerCase().includes("preferință personală")) {
        output.status = `${output.status || "Context"} · preferință personală 28/5`;
      }
      return output;
    }

    if (wire.id !== "k129") return output;

    if (preserveSix(atom, liquid, output)) {
      output.note = `${output.note || ""} Excepție justificată față de priorul personal 5-spire: configurația de 6 spire contact rămâne activă aici prin validarea platformei/obiectivului.`.trim();
      return output;
    }

    output.wraps = "5";

    if (atom.id === "415") {
      output.status = "Preferință personală · 415 · 29/5 contact";
      output.noteClass = "valid";
      output.note = "Pe 415, 29/5 există numai contact și este varianta round-wire compactă pentru concentrație/densitate. 29/6 contact rămâne alternativa dry/tobacco-first; K1 Clapton/5 este preferința Clapton a platformei.";
      return output;
    }

    if (atom.id === "klp") {
      output.status = "Validat practic · KLP · prior personal 29/5 contact";
      output.noteClass = "valid";
      output.note = "KLP păstrează ambele builduri native, dar pentru utilizator 29/5 contact este defaultul personal: hit, focus, răspuns rapid și gust direct. 29/6 contact rămâne alternativa mai așezată/completă.";
      return output;
    }

    output.note = `${output.note || ""} ${personalFiveWrapNote("k129")} 29/6 contact se păstrează numai când geometria platformei sau un A/B direct arată un câștig real.`.trim();
    if (!String(output.status || "").toLowerCase().includes("preferință personală")) {
      output.status = `${output.status || "Context"} · preferință personală 29/5 contact`;
    }
    return output;
  };

  if (baseWhyForLiquid) {
    whyForLiquid = function(wire, ax, objective, liquid) {
      const base = baseWhyForLiquid(wire, ax, objective, liquid);
      const atom = (typeof state !== "undefined" && state && state.atom) || null;
      if (!wire || !atom) return base;
      if (wire.id === "k129") {
        if (atom.id === "pmfree" && isNet(liquid)) return base;
        if (atom.id === "415" && Number(buildOutput(atom, wire, liquid).wraps) === 6) return base;
        return `${base}; 29/5 contact are prior personal transversal pentru gustul utilizatorului`;
      }
      if (wire.id === "k128") return `${base}; 28/5 contact are prior personal secundar pentru corp + compact-coil response`;
      return base;
    };
  }

  if (baseComparisonText) {
    comparisonText = function(atom, wire, output) {
      const base = baseComparisonText(atom, wire, output);
      if (!atom || !wire) return base;
      if (wire.id === "k129" && Number(output && output.wraps) === 5) {
        return `${base} · Prior personal: 29/5 contact înainte de 29/6, dacă platforma nu are o excepție validată.`;
      }
      if (wire.id === "k128") return `${base} · Prior personal secundar: 28/5 contact.`;
      return base;
    };
  }

  if (baseFootprintText) {
    footprintText = function(atom, wire, output) {
      if (atom && wire && wire.id === "k129" && atom.id === "415" && Number(output && output.wraps) === 5) {
        return "5 spire contact · footprint compact. Pe 415, 29/5 contact este varianta compactă/concentrată, iar 29/6 contact este alternativa dry/tobacco-first.";
      }
      return baseFootprintText(atom, wire, output);
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const guide = document.querySelector(".wire-guide-foot");
    if (guide) {
      guide.innerHTML = "<b>Regulă activă:</b> K1 28 = 5 contact; K1 29 = <b>5 contact prior personal</b>, 6 contact numai când ADN-ul platformei / A-B-ul direct justifică; K1 Clapton = 5; SS Clapton = 5; Dicodes RESISTHERM NiFe30 = <b>6 spire</b>; Zivipf NiFe52 = <b>6 spire</b>. Varianta K1 29/5 distanțată este eliminată din Lab.";
    }
  });
})();
