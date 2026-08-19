/* RTA Lab - validari practice si platform DNA, 19.08.2026.
 * Fisierul pastreaza numele istoric tuning-415.js, dar contine acum si concluziile validate
 * pentru K Prime, GT One, GTR, KX, Dvarw, KLP si Prime Minister Freehand.
 * Principiu nou: nu exista clasament global absolut; fiecare platforma are ADN-ul si zona ei de excelenta.
 */

window.RTA_LAB_CONTINUITY = {
  date: "2026-08-19",
  principle: "Fara clasament global absolut: pairingul se face dupa ADN lichid -> ADN platforma -> sarma -> footprint -> contact/spaced -> watt/TC.",
  lab: "V10 · 620 repere · 5 sarme active",
  validated: {
    "415": "28/5 = echilibru si layering; 29/5 contact ≈12 W = concentrat/dulce; 29/5 usor spaced ≈12 W = sweet spot tobacco-first cu aproximativ jumatate din dulceata; 29/6 = mai dry/tobacco-first dar mai putin concentrat.",
    "kprime": "29/5 usor spaced = optim general validat; 29/5 contact = mai dulce; 28/5 = echilibru. NiFe30 TC ramane benchmark-ul validat pentru lichidul personal 80% trabuc / 20% cirese.",
    "gtone": "28/5 sau 29/5 contact = foarte bune; spaced nu este preferat. Platforma directa, tobacco precision.",
    "gtr": "NiFe30 TC = potrivire naturala/validata, finete si layering.",
    "kx": "28/5 = extraordinar; NiFe30 TC = extraordinar; platforma foarte purtabila.",
    "dvarw": "28/5 = extraordinar in testul curent; utilizatorul a spus generic Dvarw, deci CL si FL raman distincte pana la A/B explicit.",
    "klp": "29 GA este sarma nativa: 29/5 pentru hit/focus, 29/6 pentru varianta mai asezata/completa; ambele sunt ale platformei.",
    "pmfree": "NET specialist: 28/5 pentru corp/layering, 29/6 pentru frunza/dry/tobacco-first."
  }
};

/* ----------------------------- 415 ----------------------------------- */
(() => {
  const baseBuildOutput = buildOutput;
  const baseFootprintText = footprintText;
  const baseComparisonText = comparisonText;
  const baseWhyForLiquid = whyForLiquid;
  const baseGeometrySummary = geometrySummary;
  const baseExplorerVapeText = explorerVapeText;

  const isHerreraHabano = liquid => {
    const text = norm(`${liquid && liquid.brand || ""} ${liquid && liquid.name || ""}`);
    return text.includes("herrera") && text.includes("cigarro habano");
  };

  function objectiveNow() {
    return (typeof state !== "undefined" && state && state.objective) || "complete";
  }

  function mode415(liquid, objective = objectiveNow()) {
    const ax = axes(liquid || {});
    const cls = String(liquid && liquid.class || "");
    const simple = cls.includes("simplu") || has(ax, "simple");
    const net = cls.startsWith("NET");
    const dry = has(ax, "dry");
    const rich = has(ax, "sweet") || has(ax, "pipe") || has(ax, "alcohol") || has(ax, "nuts") || has(ax, "coffeeCocoa");
    const complex = cls.includes("complex") || has(ax, "layers");

    if (objective === "tobacco" && (simple || dry || net)) {
      return { wraps: 6, spacing: "contact", key: "dry" };
    }
    if (objective === "body" || objective === "smooth" || (rich && complex)) {
      return { wraps: 5, spacing: "contact", key: "sweet" };
    }
    return { wraps: 5, spacing: "usor spaced", key: "sweetspot" };
  }

  function modeText415(mode) {
    if (mode.key === "sweet") {
      return "29/5 contact ≈12 W: aromă foarte concentrată, densă și mai dulce.";
    }
    if (mode.key === "dry") {
      return "29/6 contact: mai puțin dulce, puțin mai dry și mai tobacco-first, dar cu aromă mai puțin concentrată.";
    }
    return "29/5 ușor spaced ≈12 W: păstrează concentrarea, pierde aproximativ jumătate din dulceața lui 29/5 contact și devine tobacco-first; rămâne mai puțin layered decât 28/5.";
  }

  buildOutput = function(atom, wire, liquid) {
    const output = baseBuildOutput(atom, wire, liquid);
    if (!atom || atom.id !== "415") return output;

    if (wire.id === "k128") {
      output.wraps = "5";
      output.status = "Validat practic · 415";
      output.noteClass = "valid";
      output.note = "K1 28 GA / Ø2,5 / 5 spire este reperul de echilibru și layering dintre round-wire-urile testate pe 415: corp, mouthfeel, tutun și straturi bine legate.";
      return output;
    }

    if (wire.id !== "k129") return output;

    const mode = mode415(liquid, objectiveNow());
    output.wraps = String(mode.wraps);
    output.power = mode.wraps === 5 ? "≈12 W" : output.power;
    output.noteClass = isHerreraHabano(liquid) ? "valid" : "context";
    output.status = isHerreraHabano(liquid)
      ? `Validat practic · 415 · ${mode.spacing}`
      : `Extrapolare 415 · ${mode.spacing}`;
    output.note = `${modeText415(mode)} ${isHerreraHabano(liquid) ? "A/B confirmat direct pe Herrera Cigarro Habano." : "Motorul extrapolează acest mod după profilul lichidului și obiectiv."}`;
    return output;
  };

  footprintText = function(atom, wire, output) {
    if (!atom || atom.id !== "415" || wire.id !== "k129") return baseFootprintText(atom, wire, output);
    const mode = mode415((typeof state !== "undefined" && state && state.liquid) || {}, objectiveNow());
    const width = CONTACT_WIDTH_MM.k129[mode.wraps];
    const spaced = mode.spacing === "usor spaced" ? "; footprint-ul axial efectiv crește ușor prin spacing" : "";
    return `${mode.wraps} spire contact-width ≈ ${width} mm${spaced}. ${modeText415(mode)}`;
  };

  comparisonText = function(atom, wire, output) {
    if (!atom || atom.id !== "415") return baseComparisonText(atom, wire, output);
    if (wire.id === "k128") {
      return "Validat: 28/5 este cel mai layered și cel mai echilibrat dintre round-wire-urile testate; are mai mult corp decât 29 GA și nu împinge nici dulceața, nici uscăciunea la extrem.";
    }
    if (wire.id === "k129") {
      const mode = mode415((typeof state !== "undefined" && state && state.liquid) || {}, objectiveNow());
      if (mode.key === "sweet") return "+ concentrație și dulceață; − mai puțin tobacco-first decât 29/5 spaced și 29/6.";
      if (mode.key === "dry") return "+ dry, frunză și tobacco-first; − concentrație aromatică față de ambele variante 29/5.";
      return "+ tobacco-first cu aromă încă foarte concentrată și mult mai puțină dulceață decât 29/5 contact; − layering sub 28/5.";
    }
    return baseComparisonText(atom, wire, output);
  };

  whyForLiquid = function(wire, ax, objective, liquid) {
    const activeAtom = (typeof state !== "undefined" && state && state.atom) || null;
    if (!activeAtom || activeAtom.id !== "415" || wire.id !== "k129") return baseWhyForLiquid(wire, ax, objective, liquid);
    const mode = mode415(liquid, objective);
    if (mode.key === "sweet") return "pe 415, lichidul cere concentrație/densitate și poate folosi intenționat dulceața suplimentară a lui 29/5 contact";
    if (mode.key === "dry") return "pe 415, lichidul sau obiectivul cere maxim de dry/tobacco-first, unde 29/6 a fost validat ca mai puțin dulce";
    return "pe 415, 29/5 ușor spaced este sweet spot-ul validat între concentrația lui 29/5 contact și uscăciunea lui 29/6";
  };

  geometrySummary = function(atom) {
    if (!atom || atom.id !== "415") return baseGeometrySummary(atom);
    return `<div class="geometry-rule">
      <h5>415 · high-sensitivity platform · Tasty MTL 3×0,9 mm</h5>
      <div class="geometry-grid geometry-grid-five">
        <span><b>K1 28 GA</b>5 spire · echilibru + layering · VALIDAT</span>
        <span><b>K1 29 GA</b>5 contact · ≈12 W · concentration/sweet</span>
        <span><b>K1 29 GA</b>5 ușor spaced · ≈12 W · sweet spot tobacco-first</span>
        <span><b>K1 29 GA</b>6 contact · dry/tobacco · mai puțin concentrat</span>
        <span><b>NiFe / Clapton</b>rămân opțiuni contextuale după lichid</span>
      </div>
      <p><b>Validare A/B:</b> spacing-ul este aici variabilă aromatică reală, nu simplu detaliu de montaj. 29/5 spaced păstrează masa mică a coilului, dar lărgește ușor footprint-ul astfel încât cele trei jeturi îl spală mai uniform.</p>
    </div>`;
  };

  explorerVapeText = function(atom, wire, output) {
    if (!atom || atom.id !== "415") return baseExplorerVapeText(atom, wire, output);
    if (wire.id === "k128") return "VALIDAT: 28/5 = echilibrul și layering-ul de referință al 415.";
    if (wire.id === "k129") return "VALIDAT: 29/5 contact = dulce/concentrat; 29/5 ușor spaced ≈12 W = tobacco-first și încă concentrat; 29/6 = mai dry/tobacco, dar mai puțin concentrat.";
    return baseExplorerVapeText(atom, wire, output);
  };
})();

/* ------------------------- platform DNA ------------------------------- */
(() => {
  const baseWireBonus = wireBonus;
  const baseBuildOutput = buildOutput;
  const baseWhyForLiquid = whyForLiquid;
  const baseComparisonText = comparisonText;
  const baseGeometrySummary = geometrySummary;
  const baseExplorerVapeText = explorerVapeText;
  const baseAtomBonus = atomBonus;

  const liquidIsNet = liquid => String(liquid && liquid.class || "").startsWith("NET");

  function klpWrap(liquid, objective) {
    const ax = axes(liquid || {});
    const simpleDry = has(ax, "simple") || has(ax, "dry");
    return (objective === "th" || objective === "tobacco" || simpleDry) ? 5 : 6;
  }

  wireBonus = function(atom, wire, ax, objective, liquid) {
    let bonus = baseWireBonus(atom, wire, ax, objective, liquid);

    if (atom.id === "kprime") {
      if (wire.id === "k129") bonus += 1.35;
      if (wire.id === "k128") bonus += 0.65;
    }
    if (atom.id === "gtone") {
      if (wire.id === "k129") bonus += 1.0;
      if (wire.id === "k128") bonus += 0.9;
      if (["k1clap", "ssclap"].includes(wire.id)) bonus -= 0.35;
    }
    if (atom.id === "gtr" && wire.id === "nife30") bonus += 2.0;
    if (atom.id === "kx") {
      if (wire.id === "k128") bonus += 1.25;
      if (wire.id === "nife30") bonus += 1.5;
    }
    if (["dvarwcl", "dvarwfl"].includes(atom.id) && wire.id === "k128") bonus += 1.05;
    if (atom.id === "klp" && wire.id === "k129") bonus += 0.9;
    if (atom.id === "pmfree" && liquidIsNet(liquid)) {
      if (wire.id === "k128") bonus += 1.7;
      if (wire.id === "k129") bonus += 1.55;
      if (wire.id === "nife30") bonus += 0.35;
    }
    return bonus;
  };

  atomBonus = function(atom, ax, objective, liquid) {
    let bonus = baseAtomBonus(atom, ax, objective, liquid);
    if (atom.id === "pmfree" && liquidIsNet(liquid)) bonus += 1.25;
    if (atom.id === "gtone" && (objective === "tobacco" || has(ax, "dry") || has(ax, "simple"))) bonus += 0.65;
    if (atom.id === "gtr" && (liquidIsNet(liquid) || objective === "layers" || objective === "smooth")) bonus += 0.55;
    return bonus;
  };

  // Clasamentul static nu mai influențează pairingul. Sortarea rămâne doar potrivire lichid + obiectiv.
  atomScore = function(atom, ax, objective, liquid) {
    const average = ax.length
      ? ax.reduce((sum, key) => sum + ((atom.aff && atom.aff[key] != null) ? atom.aff[key] : 3), 0) / ax.length
      : 4;
    const objectiveScore = atom.objectives && atom.objectives[objective] != null ? atom.objectives[objective] : 4;
    return average * 2 + objectiveScore * 1.2 + atomBonus(atom, ax, objective, liquid);
  };

  buildOutput = function(atom, wire, liquid) {
    const output = baseBuildOutput(atom, wire, liquid);
    if (!atom) return output;

    if (atom.id === "kprime") {
      if (wire.id === "k129") {
        output.wraps = "5";
        output.status = "Validat practic · K Prime";
        output.noteClass = "valid";
        output.note = "K1 29 GA / Ø2,5 / 5 spire ușor spaced este optimul general validat pe K Prime. Aceleași 5 spire contact ies mai dulci. Pentru lichidul personal 80% trabuc / 20% cireșe, NiFe30 TC rămâne benchmark-ul separat deja validat.";
      }
      if (wire.id === "k128") {
        output.wraps = "5";
        output.status = "Validat practic · K Prime";
        output.noteClass = "valid";
        output.note = "K1 28 GA / Ø2,5 / 5 spire este reperul de echilibru: corp, mouthfeel și completitudine. Spacing-ul produce diferențe, dar mai puțin dramatice decât pe 415.";
      }
    }

    if (atom.id === "gtone" && ["k128", "k129"].includes(wire.id)) {
      output.wraps = "5";
      output.status = "Validat practic · GT One · contact";
      output.noteClass = "valid";
      output.note = `${wire.id === "k129" ? "29/5" : "28/5"} contact exprimă foarte bine ADN-ul direct al GT One. Spaced nu este preferat pe această platformă.`;
    }

    if (atom.id === "gtr" && wire.id === "nife30") {
      output.status = "Validat practic · GTR TC specialist";
      output.noteClass = "valid";
      output.note = "NiFe30 TC se potrivește natural cu GTR: finețe, consistență termică, layering și smoothness. TCR 320 Dicodes/Resistherm sau 310 Zivipf, calibrare complet rece.";
    }

    if (atom.id === "kx") {
      if (wire.id === "k128") {
        output.wraps = "5";
        output.status = "Validat practic · KX";
        output.noteClass = "valid";
        output.note = "K1 28 GA / Ø2,5 / 5 spire este extraordinar pe KX: echilibru, corp curat și utilizare daily foarte convingătoare.";
      }
      if (wire.id === "nife30") {
        output.status = "Validat practic · KX TC";
        output.noteClass = "valid";
        output.note = "NiFe30 TC este de asemenea extraordinar pe KX și îi completează caracterul foarte purtabil cu smoothness și consistență.";
      }
    }

    if (["dvarwcl", "dvarwfl"].includes(atom.id) && wire.id === "k128") {
      output.wraps = "5";
      output.status = "Confirmare practică · familia Dvarw";
      output.noteClass = "context";
      output.note = "K1 28 GA / Ø2,5 / 5 spire a fost descris ca extraordinar pe Dvarw în testul curent. Modelul exact nu a fost precizat în acea observație, deci CL și FL rămân tratate separat în restul regulilor.";
    }

    if (atom.id === "klp" && wire.id === "k129") {
      const wraps = klpWrap(liquid, (typeof state !== "undefined" && state && state.objective) || "complete");
      output.wraps = String(wraps);
      output.status = "Validat practic · KLP · dual native";
      output.noteClass = "valid";
      output.note = wraps === 5
        ? "K1 29 GA / Ø2,5 / 5 spire este varianta nativă pentru hit/TH, focus și răspuns foarte direct."
        : "K1 29 GA / Ø2,5 / 6 spire este cealaltă variantă nativă a KLP: mai așezată și mai completă, păstrând caracterul tobacco-first. 29/5 și 29/6 sunt ambele «ale lui».";
    }

    if (atom.id === "pmfree" && liquidIsNet(liquid)) {
      if (wire.id === "k128") {
        output.wraps = "5";
        output.status = "Validat practic · PM · NET specialist";
        output.noteClass = "valid";
        output.note = "Pe NET-uri, K1 28 GA / Ø2,5 / 5 spire pune PM Freehand în zona lui naturală: corp, textură, layering și dezvoltare completă.";
      }
      if (wire.id === "k129") {
        output.wraps = "6";
        output.status = "Validat practic · PM · NET specialist";
        output.noteClass = "valid";
        output.note = "Pe NET-uri, K1 29 GA / Ø2,5 / 6 spire este perechea tobacco-first: mai multă frunză, dry și separare, păstrând ADN-ul PM.";
      }
    }

    return output;
  };

  whyForLiquid = function(wire, ax, objective, liquid) {
    const atom = (typeof state !== "undefined" && state && state.atom) || null;
    if (!atom) return baseWhyForLiquid(wire, ax, objective, liquid);
    if (atom.id === "kprime" && wire.id === "k129") return "K Prime a validat 29/5 ușor spaced ca sweet spot general: precis, controlat și mai puțin dulce decât varianta contact";
    if (atom.id === "gtone" && ["k128", "k129"].includes(wire.id)) return "GT One răsplătește coilul compact contact; spaced nu aduce câștigul observat pe 415/K Prime";
    if (atom.id === "gtr" && wire.id === "nife30") return "GTR este natural cu NiFe30 TC, unde finețea, layering-ul și stabilitatea termică sunt punctele forte";
    if (atom.id === "kx" && wire.id === "k128") return "KX a validat 28/5 ca build round-wire extraordinar și foarte echilibrat";
    if (atom.id === "kx" && wire.id === "nife30") return "KX a validat și NiFe30 TC ca potrivire de top pentru smoothness și consistență";
    if (["dvarwcl", "dvarwfl"].includes(atom.id) && wire.id === "k128") return "Dvarw a confirmat practic afinitatea foarte mare pentru 28/5; CL și FL rămân însă calibrate separat";
    if (atom.id === "klp" && wire.id === "k129") return "KLP are o afinitate nativă pentru K1 29 GA; motorul alege 5 sau 6 spire după obiectiv";
    if (atom.id === "pmfree" && liquidIsNet(liquid) && wire.id === "k128") return "PM Freehand este în lumea lui pe NET: 28/5 aduce corp, layering și dezvoltare";
    if (atom.id === "pmfree" && liquidIsNet(liquid) && wire.id === "k129") return "PM Freehand este în lumea lui pe NET: 29/6 împinge frunza, uscăciunea și tobacco-first";
    return baseWhyForLiquid(wire, ax, objective, liquid);
  };

  comparisonText = function(atom, wire, output) {
    if (!atom) return baseComparisonText(atom, wire, output);
    if (atom.id === "kprime" && wire.id === "k129") return "+ 29/5 spaced: optim general validat; contact = mai dulce. 28/5 rămâne echilibrul de corp/completitudine.";
    if (atom.id === "gtone" && ["k128", "k129"].includes(wire.id)) return "GT One este straight: 28/5 contact = echilibru/corp; 29/5 contact = mai incisiv/tobacco. Spacing-ul nu este recomandat ca default.";
    if (atom.id === "gtr" && wire.id === "nife30") return "+ finețe, layering și consistență TC; acesta este ADN-ul validat al platformei pentru utilizator.";
    if (atom.id === "kx" && wire.id === "k128") return "+ 28/5 = round-wire extraordinar, daily și echilibrat; NiFe30 este alternativa premium la fel de naturală.";
    if (atom.id === "klp" && wire.id === "k129") return Number(output.wraps) === 5
      ? "+ hit/TH, focus și viteză; 29/6 este alternativa mai așezată/completă."
      : "+ completitudine și acoperire fără să piardă ADN-ul KLP; 29/5 rămâne varianta mai brutală/focusată.";
    if (atom.id === "pmfree" && wire.id === "k128") return "+ NET: corp, textură și layering; 29/6 este alternativa mai dry/tobacco-first.";
    if (atom.id === "pmfree" && wire.id === "k129") return "+ NET: frunză, dry și tobacco-first; 28/5 este alternativa mai plină/layered.";
    return baseComparisonText(atom, wire, output);
  };

  function dnaBox(title, lines) {
    return `<div class="geometry-rule"><h5>${escapeHtml(title)}</h5><div class="geometry-grid geometry-grid-five">${lines.map(line => `<span>${line}</span>`).join("")}</div></div>`;
  }

  geometrySummary = function(atom) {
    const base = baseGeometrySummary(atom);
    if (!atom || atom.id === "415") return base;
    if (atom.id === "kprime") return base + dnaBox("K Prime · ADN validat", ["<b>29/5 ușor spaced</b>optim general", "<b>29/5 contact</b>mai dulce", "<b>28/5</b>echilibru", "<b>NiFe30 TC</b>benchmark separat pe 80/20", "<b>Spacing</b>contează, dar mai puțin dramatic decât pe 415"]);
    if (atom.id === "gtone") return base + dnaBox("GT One · straight tobacco precision", ["<b>28/5 contact</b>foarte bun", "<b>29/5 contact</b>foarte bun", "<b>Spaced</b>nu default", "<b>Footprint</b>compact", "<b>Rol</b>direct / tobacco-first"]);
    if (atom.id === "gtr") return base + dnaBox("GTR · TC specialist", ["<b>NiFe30</b>potrivire naturală", "<b>TC</b>finețe", "<b>TC</b>layering", "<b>TC</b>smoothness", "<b>Calibrare</b>rece + TCR corect"]);
    if (atom.id === "kx") return base + dnaBox("KX · daily premium", ["<b>28/5</b>extraordinar", "<b>NiFe30 TC</b>extraordinar", "<b>Caracter</b>echilibrat", "<b>TC</b>smooth/constant", "<b>Ergonomie</b>foarte purtabil"]);
    if (["dvarwcl", "dvarwfl"].includes(atom.id)) return base + dnaBox("Dvarw · confirmare curentă", ["<b>28/5</b>extraordinar", "<b>Model test</b>menționat generic", "<b>CL/FL</b>rămân distincte", "<b>Nu se copiază</b>automat airflow-ul", "<b>Prioritate</b>28/5 în A/B"]);
    if (atom.id === "klp") return base + dnaBox("KLP · K1 29 GA nativ", ["<b>29/5</b>hit / focus", "<b>29/6</b>mai așezat / complet", "<b>Ambele</b>validate ca naturale", "<b>29 GA</b>sarma semnătură", "<b>Spacing</b>nu devine regulă implicită"]);
    if (atom.id === "pmfree") return base + dnaBox("Prime Minister Freehand · NET specialist", ["<b>28/5</b>corp + layering", "<b>29/6</b>dry + tobacco", "<b>NET</b>zona naturală", "<b>Frunză</b>rămâne centrală", "<b>Clasament global</b>nerelevant"]);
    return base;
  };

  explorerVapeText = function(atom, wire, output) {
    if (!atom) return baseExplorerVapeText(atom, wire, output);
    if (atom.id === "kprime" && wire.id === "k129") return "VALIDAT: 29/5 ușor spaced = optim general; 29/5 contact = mai dulce.";
    if (atom.id === "gtone" && wire.id === "k129") return "VALIDAT: 29/5 contact = foarte direct, precis și tobacco-first; spaced nu este preferat.";
    if (atom.id === "gtone" && wire.id === "k128") return "VALIDAT: 28/5 contact = foarte bun, mai echilibrat și mai plin decât 29/5.";
    if (atom.id === "gtr" && wire.id === "nife30") return "VALIDAT: NiFe30 TC este ADN-ul de finețe/layering al GTR.";
    if (atom.id === "kx" && wire.id === "k128") return "VALIDAT: 28/5 este extraordinar pe KX.";
    if (atom.id === "kx" && wire.id === "nife30") return "VALIDAT: NiFe30 TC este extraordinar și natural pe KX.";
    if (atom.id === "klp" && wire.id === "k129") return "VALIDAT: 29/5 și 29/6 sunt ambele builduri native KLP; 5 = hit/focus, 6 = mai așezat/complet.";
    return baseExplorerVapeText(atom, wire, output);
  };

  fillAtoms = function() {
    const select = $("atom");
    select.disabled = false;
    select.innerHTML = '<option value="">— alege atomizorul —</option>';
    state.atomRanking.forEach(item => {
      const option = document.createElement("option");
      option.value = item.atom.id;
      option.textContent = `${item.atom.short} · ${state.match[item.atom.id]}% potrivire pentru lichid`;
      select.appendChild(option);
    });
  };

  fillAtomExplorer = function() {
    const select = $("atomExplorer");
    select.innerHTML = '<option value="">— selectează un atomizor —</option>';
    [...ATOMS]
      .sort((left, right) => left.short.localeCompare(right.short, "ro"))
      .forEach(atom => {
        const option = document.createElement("option");
        option.value = atom.id;
        option.textContent = atom.short;
        select.appendChild(option);
      });
  };

  renderAtomExplorer = function() {
    const id = $("atomExplorer").value;
    const atom = ATOMS.find(item => item.id === id);
    const target = $("atomExplorerResult");
    if (!atom) {
      target.innerHTML = '<div class="empty">Selectează oricare dintre atomizoare pentru ADN-ul platformei și comparația directă a celor 5 sârme.</div>';
      return;
    }

    const neutralLiquid = {
      class: "Tutun simplu",
      brand: "Explorer",
      name: "Profil neutru",
      line: "comparație de platformă",
      kind: "profil generic",
      profile: "tutun neutru",
      tags: ["simple"]
    };

    const cards = WIRES.map((wire, index) => {
      const output = buildOutput(atom, wire, neutralLiquid);
      return `<article class="build explorer-build ${wire.id === "k128" ? "baseline-build" : ""}">
        <div class="brow"><span class="rank ${index ? "alt" : ""}">${index + 1}</span><span class="wname">${escapeHtml(wire.name)}</span></div>
        <div class="spec">${escapeHtml(wire.diam)} · ${output.wraps} spire · ${escapeHtml(output.power)}</div>
        <div class="why"><b>Vape pe această platformă:</b> ${escapeHtml(explorerVapeText(atom, wire, output))}</div>
        <div class="note"><b>Airflow:</b> ${escapeHtml(footprintText(atom, wire, output))}</div>
        <div class="note ${output.noteClass}"><b>${escapeHtml(output.status)}:</b> ${escapeHtml(output.note)}</div>
      </article>`;
    }).join("");

    target.innerHTML = `<div class="explorer-head">
        <div><span class="explorer-kicker">ADN DE PLATFORMĂ · FĂRĂ CLASAMENT GLOBAL</span><h4>${escapeHtml(atom.short)}</h4></div>
        <span class="pill cyan">${escapeHtml(atom.airflow.system)}</span>
      </div>
      <p class="explorer-air"><b>Airflow:</b> ${escapeHtml(atom.airflow.details)}</p>
      ${geometrySummary(atom)}
      <div class="explorer-builds explorer-builds-five">${cards}</div>
      <div class="explorer-tip"><b>Cum folosești rezultatul:</b> fiecare RTA este tratat după zona lui de excelență. Motorul principal ordonează atomizoarele numai după potrivirea cu lichidul și obiectivul ales, nu după un top global.</div>`;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const explorerText = document.querySelector(".explorer-panel .ptitle p");
    if (explorerText) explorerText.textContent = "Nu mai folosim un clasament global: alege platforma și vezi ADN-ul ei, buildurile validate și zona de excelență.";
    const atomPanelText = document.querySelectorAll(".panel .ptitle p");
    if (atomPanelText[2]) atomPanelText[2].textContent = "Lista se reordonează numai după potrivirea lichid + obiectiv; scorul global al platformei nu mai intră în calcul.";
    const footer = document.querySelector(".footer");
    if (footer) footer.textContent = "RTA MTL Build Lab · V10 · 620 repere · platform DNA · fără clasament global · personal · noindex";
  });
})();
