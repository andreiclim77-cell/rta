/* RTA Lab - preferinta personala recurenta, 23.08.2026.
 * PERSONAL 5-WRAP PREFERENCE / COMPACT-COIL BIAS
 * Nu afirma superioritate universala. Este un prior personal care se aplica dupa ADN-ul platformei.
 */
(() => {
  window.RTA_LAB_PERSONAL_BUILD_DNA = {
    date: "2026-08-23",
    name: "PERSONAL 5-WRAP PREFERENCE / COMPACT-COIL BIAS",
    principle: "Pentru utilizator, round-wire K1 in 5 spire reda repetat lichidele mai placut; K1 29 GA / Ø2,5 / 5 este priorul personal maxim, urmat de K1 28 GA / Ø2,5 / 5.",
    interpretation: "Preferinta sugereaza masa termica redusa + footprint compact + ramp-up rapid + vaporizare focalizata. Este interpretare mecanica, nu fapt universal demonstrat.",
    guardrail: "ADN-ul platformei si validarile directe pot depasi priorul personal. 6 spire se pastreaza cand exista castig practic/geometric real, nu doar fiindca airflow-ul este lat."
  };

  if (typeof wireBonus !== "function" || typeof buildOutput !== "function") return;

  const baseWireBonus = wireBonus;
  const baseBuildOutput = buildOutput;
  const baseWhyForLiquid = typeof whyForLiquid === "function" ? whyForLiquid : null;
  const baseComparisonText = typeof comparisonText === "function" ? comparisonText : null;
  const baseFootprintText = typeof footprintText === "function" ? footprintText : null;

  const isNet = liquid => String(liquid && liquid.class || "").startsWith("NET");
  const objectiveNow = () => (typeof state !== "undefined" && state && state.objective) || "complete";

  function personalFiveWrapNote(wireId) {
    if (wireId === "k129") {
      return "Prior personal recurent: K1 29 GA / Ø2,5 / 5 spire este configurația round-wire care îi redă cel mai plăcut lichidul utilizatorului pe cele mai multe platforme testate.";
    }
    return "Prior personal recurent: K1 28 GA / Ø2,5 / 5 spire este aceeași filozofie compactă, cu ceva mai mult corp și inerție termică decât 29/5.";
  }

  function preserveSix(atom, liquid, output) {
    if (!atom || !output) return false;
    if (atom.id === "pmfree" && isNet(liquid)) return true; // 29/6 validat direct pe NET.
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
        output.status = `${output.status || "Context"} · preferință personală 5 spire`;
      }
      return output;
    }

    if (wire.id !== "k129") return output;

    if (preserveSix(atom, liquid, output)) {
      output.note = `${output.note || ""} Excepție justificată față de priorul personal 5-spire: 29/6 rămâne validat direct pe PM Freehand + NET până la A/B 29/5 dedicat.`.trim();
      return output;
    }

    output.wraps = "5";

    if (atom.id === "415") {
      output.status = "Preferință personală · 415 · 29/5 primul test";
      output.noteClass = "valid";
      output.note = objectiveNow() === "body" || objectiveNow() === "smooth"
        ? "Prior personal nou: 29/5 rămâne prima alegere; contact când se caută densitate/corp. 29/5 ușor spaced rămâne varianta tobacco-first validată. 29/6 rămâne alternativă validată pentru dry, nu default."
        : "Prior personal nou: 29/5 este prima alegere pe 415; ușor spaced când se caută tobacco-first/concentrare. 29/6 rămâne alternativă dry validată, nu default.";
      return output;
    }

    if (atom.id === "klp") {
      output.status = "Validat practic · KLP · prior personal 29/5";
      output.noteClass = "valid";
      output.note = "KLP păstrează ambele builduri native, dar pentru utilizator 29/5 devine default personal: hit, focus, răspuns rapid și gust mai plăcut. 29/6 rămâne alternativă validată când se dorește o redare mai așezată/completă.";
      return output;
    }

    output.note = `${output.note || ""} ${personalFiveWrapNote("k129")} 29/6 se păstrează numai când geometria platformei sau un A/B direct arată un câștig real.`.trim();
    if (!String(output.status || "").toLowerCase().includes("preferință personală")) {
      output.status = `${output.status || "Context"} · preferință personală 29/5`;
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
        return `${base}; în plus, 29/5 are prior personal transversal pentru gustul utilizatorului`;
      }
      if (wire.id === "k128") return `${base}; 28/5 are prior personal secundar pentru corp + compact-coil response`;
      return base;
    };
  }

  if (baseComparisonText) {
    comparisonText = function(atom, wire, output) {
      const base = baseComparisonText(atom, wire, output);
      if (!atom || !wire) return base;
      if (wire.id === "k129" && atom.id !== "pmfree") {
        return `${base} · Prior personal: 29/5 înainte de 29/6, dacă platforma nu are o excepție validată.`;
      }
      if (wire.id === "k128") return `${base} · Prior personal secundar: 28/5.`;
      return base;
    };
  }

  if (baseFootprintText) {
    footprintText = function(atom, wire, output) {
      if (atom && wire && wire.id === "k129" && atom.id === "415" && Number(output && output.wraps) === 5) {
        return "5 spire · footprint compact. Prior personal 29/5; pe 415, ușor spaced este modul validat pentru tobacco-first + concentrare, iar contact pentru densitate/dulceață.";
      }
      return baseFootprintText(atom, wire, output);
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const guide = document.querySelector(".wire-guide-foot");
    if (guide) {
      guide.innerHTML = "<b>Regulă activă:</b> K1 28 = 5 spire; K1 29 = <b>5 spire prior personal</b>, 6 numai când ADN-ul platformei / A-B-ul direct justifică; K1 Clapton = 5; SS Clapton = 5; Dicodes RESISTHERM NiFe30 = <b>6 spire</b>; Zivipf NiFe52 = <b>6 spire</b>. ADN-ul platformei poate depăși priorul personal.";
    }
  });
})();