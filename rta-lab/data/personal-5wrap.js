/* RTA Lab — preferință personală recurentă, actualizat 14.10.2026.
 * PERSONAL 5-WRAP PREFERENCE / COMPACT-COIL BIAS
 * K1 29 GA / Ø2,5 / 5 spire este păstrat numai CONTACT. Varianta de 5 spire distanțată este eliminată.
 */
(() => {
  window.RTA_LAB_PERSONAL_BUILD_DNA = {
    date: "2026-10-14",
    name: "PERSONAL 5-WRAP PREFERENCE / COMPACT-COIL BIAS",
    principle: "Priorul 29/5 contact se aplică numai când platforma nu are preferințe directe mai puternice: KLP/GTR/KX/K Prime preferă egal familia TC NiFe30/NiFe52, GT One preferă K1 29/6, Muted+ preferă K1 28/6, Dvarw CL/FL preferă insert 3×0,6.",
    interpretation: "Preferința sugerează masă termică redusă + footprint compact + ramp-up rapid + vaporizare focalizată. Este interpretare mecanică, nu fapt universal demonstrat.",
    guardrail: "Excepții 28/6: KV3 Mini și Asylum Flat validate anterior, Dvarw CL 3×0,6 validat, Dvarw FL 3×0,6/K1 28/6 preferat în A/B pe Balkan Milestone, Muted+ K1 28/6 preferat declarat (fără detalii de airflow/Ø/W). GT One: K1 29/6 apoi 28/5. Pe KLP, K1 28/5 este doar preferința round-wire sub cele două NiFe TC egale."
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
    if (["kv3", "dvarwcl", "dvarwfl", "muted", "asylum"].includes(atom.id) && Number(output.wraps) === 6) return true;
    if (atom.id === "gtone" && Number(output.wraps) === 6) return true;
    return false;
  }

  wireBonus = function(atom, wire, ax, objective, liquid) {
    let bonus = baseWireBonus(atom, wire, ax, objective, liquid);
    if (!wire) return bonus;
    if (wire.id === "k129") bonus += 0.55;
    if (wire.id === "k128") bonus += 0.30;
    if (atom && atom.id === "gtone" && wire.id === "k129") bonus += 0.35;
    if (atom && atom.id === "klp" && wire.id === "k128") bonus += 0.45; // Secondary K1 preference after either NiFe TC alloy
    if (atom && atom.id === "muted" && wire.id === "k128") bonus += 1.45;
    if (atom && atom.id === "dvarwfl" && wire.id === "k128") bonus += 0.6;
    if (atom && ["klp","gtr","kx","kprime"].includes(atom.id) && wire.id === "nife30") bonus += 1.0; // Single legacy NiFe slot represents both separate TC alloys
    return bonus;
  };

  buildOutput = function(atom, wire, liquid) {
    const output = baseBuildOutput(atom, wire, liquid);
    if (!atom || !wire || !output) return output;

    if (wire.id === "k128") {
      if (atom.id === "415") {
        output.wraps="6";
        output.status="415 Cool · K1 28 GA / 6 spire · a doua preferință";
        output.noteClass="valid";
        output.note="415 Cool: Kanthal K1 28/6 merge foarte bine, preferat personal după Dicodes NiFe30/7 și Zivipf NiFe52/6. Vechiul K1 28/5 a fost anterior un reper bun și nu se elimină din istoricul personal.";
        return output;
      }
      if (atom.id === "kv3") {
        output.wraps = "6";
        output.status = "Validat practic · KV3 Mini · 28/6";
        output.noteClass = "valid";
        output.note = "Kayfun Mini V3 păstrează K1 28 GA / Ø2,5 / 6 spire ca excepție validată față de priorul personal 28/5: footprint mai lung și utilizare mai completă a airflow-ului.";
        return output;
      }
      if (atom.id === "dvarwcl") {
        output.wraps = "6";
        output.status = "Validat practic · Dvarw CL · 3×0,6 · 28/6";
        output.noteClass = "valid";
        output.note = "Dvarw MTL CL cu 3×0,6 și K1 28 GA / Ø2,5 / 6 spire rămâne prima alegere personală de airflow. Separat, insertul 1×1,2 cu K1 28 GA / 5 spire a fost raportat ca mergând bine: este o alternativă reușită, nu un setup slab. Nu compara inserturile ca singura variabilă, fiindcă se schimbă și numărul de spire.";
        return output;
      }
      if (atom.id === "dvarwfl") {
        output.wraps = "6";
        output.status = "Validare contextuală · Dvarw FL · 3×0,6 · K1 28/6";
        output.noteClass = "valid";
        output.note = "Pe Balkan Milestone, Dvarw FL cu insert 3×0,6 și K1 28 GA / 6 spire a fost preferat ferm față de FL cu 1×1,2 / K1 / 6: orizont și simultaneitate mai mari, palat ≈25% mai bogat perceput, TH foarte puțin diminuat. Utilizatorul preferă 3×0,6 și pe CL. Ø2,5 este presetul modelului, nu măsurătoare raportată în test.";
        return output;
      }
      if (atom.id === "muted") {
        output.wraps = "6";
        output.status = "Preferință personală · Muted+ · K1 28/6";
        output.noteClass = "valid";
        output.note = "Utilizatorul preferă expres K1 28 GA / 6 spire pe Muted+. Airflow-ul, Ø exact și wattajul nu au fost raportate; nu atribui un profil de gust măsurat fără A/B suplimentar.";
        return output;
      }
      if (atom.id === "asylum") {
        output.wraps = "6";
        output.status = "Validat practic · Asylum V3 Flat · 28/6";
        output.noteClass = "valid";
        output.note = "Asylum V3 cu clopot Flat păstrează K1 28 GA / Ø2,5 / 6 spire ca regulă activă validată: claritatea și separarea Flat rămân, cu mai mult corp și completitudine.";
        return output;
      }
      output.wraps = "5";
      if (atom.id === "klp") {
        output.status = "Validat practic · KLP · 28/5 preferat vs 29/6";
        output.noteClass = "valid";
        output.note = "A/B direct 12.10.2026: K1 28 GA / Ø2,5 / 5 contact redă mai bine decât K1 29 GA / Ø2,5 / 6 pentru utilizator; păstrează corpul și volumul fără să piardă precizia Aerokon.";
        return output;
      }
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
      output.status = "Validat practic · KLP · 29/5 specialist";
      output.noteClass = "valid";
      output.note = "K1 29 GA / Ø2,5 / 5 contact rămâne specialistul pentru hit/TH/focus. Pentru redare generală/completă, A/B-ul direct 12.10.2026 a pus K1 28/5 înaintea K1 29/6.";
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
        if (atom.id === "kv3") return `${base}; pe KV3 Mini 29/6 este excepția activă validată`;
        if (atom.id === "gtone") return `${base}; pe GT One 29/6 este preferința round-wire validată direct față de 28/5`;
        return `${base}; 29/5 contact are prior personal transversal pentru gustul utilizatorului`;
      }
      if (wire.id === "k128" && atom.id === "415") return `${base}; 415 Cool: K1 28/6 este a doua preferință, după NiFe30/7 și NiFe52/6; 28/5 rămâne reper istoric`;
      if (wire.id === "k128" && atom.id === "kv3") return `${base}; pe KV3 Mini 28/6 este excepția activă validată`;
      if (wire.id === "k128" && atom.id === "dvarwcl") return `${base}; Dvarw CL 3×0,6 + K1 28/6 este preferat, dar și 1×1,2 + K1 28/5 merge bine, separat validat personal`;
      if (wire.id === "k128" && atom.id === "asylum") return `${base}; pe Asylum V3 Flat, 28/6 este regula activă validată`;
      if (wire.id === "k128" && atom.id === "dvarwfl") return `${base}; pe Dvarw FL 3×0,6 cu Balkan Milestone, 28/6 și-a demonstrat preferința față de FL 1×1,2/6`;
      if (wire.id === "k128" && atom.id === "muted") return `${base}; pe Muted+ K1 28/6 este prima preferință declarată, fără airflow specificat`;
      if (wire.id === "k128" && atom.id === "klp") return `${base}; pe KLP, A/B-ul direct 12.10.2026 preferă 28/5 față de 29/6 pentru redare generală`;
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
      if (wire.id === "k128" && atom.id === "415") return `${base} · 415 Cool: 28/6 este a doua preferință după NiFe30/7 și NiFe52/6; vechiul 28/5 rămâne în istoric.`;
      if (wire.id === "k128" && atom.id === "kv3") return `${base} · Excepție KV3 Mini validată: 28/6 pe Ø2,5.`;
      if (wire.id === "k128" && atom.id === "dvarwcl") return `${base} · Dvarw CL: preferat 3×0,6 / K1 28/6; reușit și 1×1,2 / K1 28/5. Nu deduce diferența doar din insert.`;
      if (wire.id === "k128" && atom.id === "dvarwfl") return `${base} · Dvarw FL 3×0,6 / K1 28/6 testat pe Balkan Milestone, mai mult palat și spectru decât 1×1,2 la 6 spire.`;
      if (wire.id === "k128" && atom.id === "muted") return `${base} · Muted+ preferință direct declarată: K1 28/6, parametri suplimentari de confirmat.`;
      if (wire.id === "k128" && atom.id === "asylum") return `${base} · Asylum V3 Flat validat: 28/6 pe Ø2,5.`;
      if (wire.id === "k128" && atom.id === "klp") return `${base} · KLP A/B direct: 28/5 > 29/6 pentru redare generală/completă.`;
      if (wire.id === "k129" && atom.id === "gtone" && Number(output && output.wraps) === 6) return `${base} · GT One A/B direct: 29/6 > 28/5.`;
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
      guide.innerHTML = "<b>Regulă activă:</b> K1 28 = 5 contact baseline; excepții validate <b>KV3 Mini = 28/6</b>, <b>Dvarw CL 3×0,6 = 28/6</b>, <b>Dvarw FL 3×0,6 / Balkan Milestone = 28/6</b>, <b>Muted+ = K1 28/6 preferat</b>, <b>Asylum V3 Flat = 28/6</b>, <b>415 Cool = K1 28/6</b> (după NiFe30/7 și NiFe52/6), toate pe Ø2,5. K1 29 = <b>5 contact prior personal</b>, cu <b>KV3 Mini = 29/6</b> și <b>GT One = 29/6 preferat A/B</b> pe Ø2,5; pe <b>KLP, K1 28/5 este alternativa round-wire preferată</b> (după NiFe TC); K1 Clapton = 5; SS Clapton = 5; Dicodes RESISTHERM NiFe30 = <b>6 spire</b> în general, <b>GTR și 415 Cool = 7 spire</b> preferat personal (6 spire NiFe30 rămân funcționale); Zivipf NiFe52 = <b>6 spire</b>. Varianta K1 29/5 distanțată este eliminată din Lab.";
    }
  });
})();
