const ATOMS = window.RTA_CORE.atoms || [];
const ACTIVE_WIRE_IDS = ["k128", "k129", "k1clap", "ssclap", "nife30"];
const WIRES = (window.RTA_CORE.wires || []).filter(wire => ACTIVE_WIRE_IDS.includes(wire.id));
const LIQUIDS = window.RTA_LIQUIDS || [];

const ALL = "ALL";
const CATEGORY_ORDER = ["Tutun simplu", "Tutun complex", "NET simplu", "NET complex"];
const $ = id => document.getElementById(id);
const norm = value => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();
const has = (array, value) => array.includes(value);
const escapeHtml = value => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

/*
 * Matrice airflow → round-wire, V10.
 * - K1 28 GA rămâne peste tot la 5 spire.
 * - K1 29 GA primește 5 spire pe jeturile concentrate și 6 pe geometriile late.
 * - Ambele Claptonuri sunt fixe la 5 spire, Ø2,5 mm.
 * - Familia NiFe TC folosește baseline-ul canonic de 6 spire pe Ø2,5 mm.
 */
const BUILD_RULES = {
  "415":      { k128: 5, k129: 6, reason: "Cele trei jeturi 3×0,9 mm cer mai multă acoperire pentru 29 GA; 28/5 rămâne alternativa round-wire mai plină." },
  "kprime":   { k128: 5, k129: 5, reason: "Bottom-air direct și concentrat; ambele round-wire-uri funcționează optim cu footprint compact." },
  "gtone":    { k128: 5, k129: 5, reason: "Air-pin unic, vertical și foarte apropiat de coil; 5 spire concentrează eficient jetul." },
  "dvarwcl":  { k128: 5, k129: 5, reason: "Cu insertul single/stock, jetul este compact; 5 spire sunt alegerea optimizată pentru ambele gauge-uri." },
  "muted":    { k128: 5, k129: 6, reason: "Triple-air spală o zonă mai lată: 29/6 acoperă jeturile, iar 28/5 oferă round-wire cu mai mult mouthfeel." },
  "gtr":      { k128: 5, k129: 6, reason: "Cele două jeturi oblice cer 29/6 pentru acoperire; 28/5 păstrează un footprint apropiat, cu mai mult corp." },
  "dvarwfl":  { k128: 5, k129: 5, reason: "Cu insertul single/stock 1×1,2 mm, jetul este concentrat; 5 spire sunt aproape optim." },
  "diplomat": { k128: 5, k129: 6, reason: "Diverterul multipunct este lat: 29/6 favorizează acoperirea, iar 28/5 este alternativa round-wire mai densă." },
  "kx":       { k128: 5, k129: 5, reason: "Aerokon restricționează direct sub coil; 5 spire păstrează footprint-ul compact și eficient." },
  "klp":      { k128: 5, k129: 5, reason: "Validat practic: 29/5 maximizează hitul, iar 28/5 păstrează hitul cu mai mult mouthfeel." },
  "asylum":   { k128: 5, k129: 6, reason: "Geometria dublă/ovală justifică 29/6 pentru acoperire; 28/5 rămâne alternativa round-wire cu corp mai mare." },
  "pmfree":   { k128: 5, k129: 6, reason: "Diverterul 32×0,9 mm este foarte lat: 29/6 oferă acoperire, iar 28/5 aduce corp și mouthfeel." },
  "pmstd":    { k128: 5, k129: 6, reason: "Aceeași bază multipunct ca Freehand: 29/6 pentru acoperire, 28/5 pentru alternativa round-wire mai plină." },
  "byka":     { k128: 5, k129: 5, reason: "Air-pipe unic și jet concentrat; 5 spire sunt aproape optim pentru pinurile MTL uzuale." },
  "chariot":  { k128: 5, k129: 6, reason: "29/6 folosește mai bine zona de airflow, iar 28/5 este alternativa round-wire mai rapidă și mai plină." },
  "kv3":      { k128: 5, k129: 6, reason: "28 GA atinge footprint-ul util cu 5 spire; firul mai subțire de 29 GA cere 6 pentru o lungime axială apropiată." },
  "minister": { k128: 5, k129: 6, reason: "Diverterul lat cere 29/6 pentru acoperire; 28/5 limitează masa în camera mică." }
};

const CONTACT_WIDTH_MM = {
  k128: { 5: "1,61" },
  k129: { 5: "1,43", 6: "1,72" }
};

/* Compatibilitatea Claptonului cu platforma. Scorul intră în recomandare; nota apare în Explorer. */
const CLAPTON_PLATFORM = {
  "415":      { k1clap: 0.90, ssclap: 0.55 },
  "kprime":   { k1clap: 0.20, ssclap: 0.35 },
  "gtone":    { k1clap: -0.80, ssclap: -0.60 },
  "dvarwcl":  { k1clap: 0.65, ssclap: 0.50 },
  "muted":    { k1clap: 0.90, ssclap: 0.10 },
  "gtr":      { k1clap: 0.45, ssclap: 0.95 },
  "dvarwfl":  { k1clap: 0.10, ssclap: 1.05 },
  "diplomat": { k1clap: 0.75, ssclap: 0.85 },
  "kx":       { k1clap: -0.20, ssclap: 0.50 },
  "klp":      { k1clap: -0.70, ssclap: -0.55 },
  "asylum":   { k1clap: 0.90, ssclap: 0.90 },
  "pmfree":   { k1clap: 0.85, ssclap: 0.50 },
  "pmstd":    { k1clap: 0.80, ssclap: 0.40 },
  "byka":     { k1clap: 0.15, ssclap: 0.90 },
  "chariot":  { k1clap: 1.30, ssclap: -0.40 },
  "kv3":      { k1clap: -0.80, ssclap: -0.65 },
  "minister": { k1clap: 0.35, ssclap: -0.55 }
};

const AX = {
  simple: ["simple", "tigara", "rolling", "shag", "direct", "blond", "ashy", "scrum", "curat", "mild", "classic"],
  dry: ["dry", "sec", "uscat", "aspru", "dur", "ashy", "scrum", "rolling"],
  bright: ["bright", "virginia", "luminos", "fan", "miere", "blond", "floral"],
  dark: ["dark", "greu", "robust", "amar", "fum", "smoky", "piele", "lemn", "earthy", "dark-fired"],
  burley: ["burley"],
  kentucky: ["kentucky", "fire-cured", "dark-fired"],
  latakia: ["latakia", "english", "balkan"],
  oriental: ["oriental", "turkish", "balkan", "spice", "condiment", "floral"],
  perique: ["perique", "vaper", "piper", "fermentat", "prune"],
  cigar: ["cigar", "trabuc", "cuban", "piloto", "mata fina", "brasil", "brazil"],
  pipe: ["pipe", "cavendish"],
  citrus: ["citrus", "citrice", "portocala", "lamaie", "grapefruit", "aciditate"],
  alcohol: ["rum", "rom", "bourbon", "whisky", "alcool"],
  nuts: ["nut", "nuci", "alune", "migdale", "hazelnut", "pecan", "fistic", "pistachio"],
  coffeeCocoa: ["coffee", "cafea", "espresso", "cocoa", "cacao", "chocolate", "ciocolata"],
  sweet: ["sweet", "dulce", "honey", "miere", "vanilla", "vanilie", "caramel", "cream", "crema", "custard", "cavendish", "cherry", "cireasa", "cocos", "biscuit"],
  layers: ["complex", "blend", "mixture", "english", "balkan", "organic", "aromat", "flavored", "reserve", "barrique", "citrus", "rum", "bourbon", "whisky", "nuci", "cafea", "cacao", "vanilie", "hall of fame"]
};

const state = {
  cat: ALL,
  liquid: null,
  atom: null,
  objective: "complete",
  atomRanking: [],
  match: {}
};

function axes(liquid) {
  const liquidClass = String(liquid.class || "");
  const text = norm([
    liquidClass,
    liquid.brand,
    liquid.name,
    liquid.line,
    liquid.kind,
    liquid.profile,
    (liquid.tags || []).join(" ")
  ].join(" "));
  const out = [];

  Object.entries(AX).forEach(([key, words]) => {
    if (words.some(word => text.includes(norm(word)))) out.push(key);
  });
  (liquid.tags || []).forEach(tag => {
    if (!out.includes(tag)) out.push(tag);
  });
  if (liquidClass.includes("complex") && !out.includes("layers")) out.push("layers");
  if (["Tutun simplu", "NET simplu"].includes(liquidClass) && !out.includes("simple")) out.push("simple");
  return out;
}

function atomBonus(atom, ax, objective, liquid) {
  let bonus = 0;
  if ((has(ax, "oriental") || has(ax, "perique")) && ["dvarwfl", "byka"].includes(atom.id)) bonus += 0.8;
  if (has(ax, "cigar") && has(ax, "alcohol") && ["415", "pmfree", "asylum", "chariot", "muted"].includes(atom.id)) bonus += 0.5;
  if (has(ax, "sweet") && ["kprime", "415", "chariot", "muted", "asylum", "kx"].includes(atom.id)) bonus += 0.3;
  if (has(ax, "dry") && has(ax, "simple") && ["gtone", "klp", "dvarwcl"].includes(atom.id)) bonus += 0.55;
  if (has(ax, "citrus") && ["dvarwfl", "asylum", "byka", "gtr", "chariot"].includes(atom.id)) bonus += 0.4;
  if (liquid.brand === "Personal" && String(liquid.name || "").includes("80% trabuc") && atom.id === "kprime") bonus += 5;
  if (norm(liquid.name).includes("tab plus") && atom.id === "chariot") bonus += 1.8;
  if (liquid.class === "NET simplu" && ["gtr", "dvarwfl", "kx", "kprime", "byka"].includes(atom.id)) bonus += 0.25;
  if (liquid.class === "NET complex" && ["dvarwfl", "gtr", "pmfree", "asylum", "415"].includes(atom.id)) bonus += 0.3;
  return bonus;
}

function atomScore(atom, ax, objective, liquid) {
  const average = ax.length
    ? ax.reduce((sum, key) => sum + ((atom.aff && atom.aff[key] != null) ? atom.aff[key] : 3), 0) / ax.length
    : 4;
  const objectiveScore = atom.objectives && atom.objectives[objective] != null ? atom.objectives[objective] : 4;
  return average * 2 + objectiveScore * 1.2 + (atom.score - 9) * 0.8 + atomBonus(atom, ax, objective, liquid);
}

function rankAtoms() {
  const ax = axes(state.liquid);
  const ranking = ATOMS
    .map(atom => ({ atom, score: atomScore(atom, ax, state.objective, state.liquid) }))
    .sort((left, right) => right.score - left.score);
  const max = ranking[0].score;
  const min = ranking[ranking.length - 1].score;
  state.match = {};
  ranking.forEach(item => {
    state.match[item.atom.id] = Math.max(70, Math.min(100, Math.round(84 + (item.score - min) / (max - min || 1) * 16)));
  });
  state.atomRanking = ranking;
  return ranking;
}

function wireTrait(wire, ax, objective) {
  const traits = wire.traits || {};
  const keys = [];
  if (has(ax, "dry") || has(ax, "simple")) keys.push("dry", "tobacco");
  if (has(ax, "bright") || has(ax, "citrus") || has(ax, "oriental") || has(ax, "perique")) keys.push("bright", "layers");
  if (has(ax, "dark") || has(ax, "burley") || has(ax, "kentucky") || has(ax, "latakia") || has(ax, "cigar")) keys.push("dark", "tobacco", "body");
  if (has(ax, "pipe") || has(ax, "alcohol") || has(ax, "nuts") || has(ax, "coffeeCocoa") || has(ax, "sweet")) keys.push("body", "layers", "smooth");
  if (has(ax, "layers")) keys.push("layers");
  if (!keys.length) keys.push("complete");
  keys.push(objective);

  let score = 0;
  let count = 0;
  keys.forEach(key => {
    if (traits[key] != null) {
      score += traits[key];
      count += 1;
    }
  });
  return count ? score / count : 4;
}

function claptonPlatformScore(atom, wireId) {
  return (CLAPTON_PLATFORM[atom.id] && CLAPTON_PLATFORM[atom.id][wireId]) || 0;
}

function claptonPlatformText(atom, wireId) {
  const score = claptonPlatformScore(atom, wireId);
  const isK1 = wireId === "k1clap";
  if (score >= 0.85) {
    return isK1
      ? "Platforma gestionează foarte bine masa K1 Clapton: corp, densitate și TH fără să sufoce camera."
      : "Platforma valorifică foarte bine SS Clapton: top-notes, separare și layering, cu corp suficient.";
  }
  if (score >= 0.35) {
    return isK1
      ? "K1 Clapton este potrivit contextual, mai ales pentru profile dark, cigar, nuci, cafea sau bourbon."
      : "SS Clapton este potrivit pentru profile luminoase, citrice, Orientale și blenduri complexe.";
  }
  if (score > -0.35) {
    return isK1
      ? "K1 Clapton este o alternativă selectivă: folosește-l când lichidul cere corp și integrare, nu pentru maximă uscăciune."
      : "SS Clapton este o alternativă selectivă: util pentru claritate, dar poate amplifica dulceața pe unele lichide.";
  }
  return isK1
    ? "Camera sau jetul concentrat pot face K1 Clapton prea cald; apare numai când lichidul câștigă clar din corp și TH."
    : "Camera sau jetul concentrat pot face SS Clapton prea dulce ori prea cald; apare numai pentru profile care cer claritate și layering.";
}

function wireBonus(atom, wire, ax, objective, liquid) {
  const liquidClass = String(liquid.class || "");
  const complex = has(ax, "layers") || liquidClass.includes("complex");
  const simple = has(ax, "simple") || liquidClass.includes("simplu");
  const dry = has(ax, "dry");
  const dark = has(ax, "dark") || has(ax, "burley") || has(ax, "kentucky") || has(ax, "latakia") || has(ax, "cigar");
  const bright = has(ax, "bright") || has(ax, "oriental") || has(ax, "perique") || has(ax, "citrus");
  const rich = has(ax, "pipe") || has(ax, "sweet") || has(ax, "alcohol") || has(ax, "nuts") || has(ax, "coffeeCocoa");
  const isNet = liquidClass.startsWith("NET");
  let bonus = 0;

  if (wire.id === "k129") {
    if (simple) bonus += 0.9;
    if (dry) bonus += 0.8;
    if (objective === "th") bonus += 1.5;
    if (objective === "tobacco") bonus += 1.25;
    if (objective === "body" || objective === "smooth") bonus -= 0.7;
    if (rich && complex) bonus -= 0.35;
    if (["klp", "gtone", "dvarwcl"].includes(atom.id)) bonus += 0.55;
  }

  if (wire.id === "k128") {
    bonus += 0.25;
    if (complex) bonus += 0.8;
    if (dark) bonus += 0.55;
    if (rich) bonus += 0.55;
    if (objective === "body") bonus += 1.3;
    if (objective === "complete") bonus += 0.8;
    if (objective === "tobacco") bonus += 0.35;
    if (["415", "muted", "gtr", "diplomat", "asylum", "pmfree", "pmstd", "chariot", "minister"].includes(atom.id)) bonus += 0.45;
  }

  if (wire.id === "k1clap") {
    bonus += claptonPlatformScore(atom, wire.id);
    if (complex) bonus += 0.95;
    if (dark) bonus += 0.85;
    if (rich) bonus += 0.85;
    if (has(ax, "cigar")) bonus += 0.45;
    if (objective === "body") bonus += 1.55;
    if (objective === "th") bonus += 0.95;
    if (objective === "complete") bonus += 0.75;
    if (objective === "layers") bonus += 0.45;
    if (simple && dry && !dark) bonus -= 0.8;
    if (bright && !dark && !rich) bonus -= 0.35;
    if (atom.id === "chariot" && norm(liquid.name).includes("tab plus")) bonus += 4.5;
  }

  if (wire.id === "ssclap") {
    bonus += claptonPlatformScore(atom, wire.id);
    if (complex) bonus += 0.85;
    if (bright) bonus += 1.0;
    if (has(ax, "citrus") || has(ax, "oriental") || has(ax, "perique")) bonus += 0.65;
    if (rich) bonus += 0.25;
    if (objective === "layers") bonus += 1.45;
    if (objective === "complete") bonus += 0.75;
    if (objective === "smooth") bonus += 0.5;
    if (objective === "body") bonus += 0.2;
    if (objective === "tobacco") bonus -= 0.25;
    if (simple && dry) bonus -= 0.85;
    if (dark && !bright && !rich) bonus -= 0.25;
  }

  if (wire.id === "nife30") {
    if (isNet) bonus += 0.9;
    if (complex) bonus += 0.8;
    if (bright) bonus += 0.3;
    if (objective === "smooth") bonus += 1.55;
    if (objective === "layers") bonus += 1.3;
    if (objective === "complete") bonus += 1.0;
    if (objective === "th") bonus -= 0.95;
    if (simple && dry && objective === "tobacco") bonus -= 0.35;
    if (["kprime", "gtr", "kx", "gtone", "kv3"].includes(atom.id)) bonus += 0.75;
    if (atom.id === "chariot") bonus -= 0.35;
  }

  if (atom.id === "klp") {
    if (wire.id === "k129" && (objective === "th" || objective === "tobacco" || dry)) bonus += 1.15;
    if (wire.id === "k128" && (objective === "body" || complex || rich)) bonus += 1.0;
  }

  if (atom.id === "kprime" && liquid.brand === "Personal" && String(liquid.name || "").includes("80% trabuc")) {
    if (wire.id === "nife30") bonus += 4;
  }

  if (atom.id === "chariot" && norm(liquid.name).includes("tab plus")) {
    if (wire.id === "k128") bonus += 2.4;
    if (wire.id === "nife30") bonus += 1.5;
    if (wire.id === "k129") bonus += 0.25;
  }

  return bonus;
}

function buildRule(atom, wire) {
  if (wire.id === "nife30") {
    return { wraps: 6, reason: "Familia NiFe TC folosește baseline-ul canonic de 6 spire, Ø2,5 mm, cu calibrare complet rece și TCR corect." };
  }
  if (["k1clap", "ssclap"].includes(wire.id)) {
    return { wraps: 5, reason: claptonPlatformText(atom, wire.id) };
  }
  const atomRule = BUILD_RULES[atom.id] || {
    k128: 5,
    k129: 6,
    reason: "Date geometrice insuficiente: 28/5 este alternativa round-wire, iar 29/6 este defaultul conservator pentru acoperire."
  };
  return { wraps: atomRule[wire.id] || (wire.id === "k128" ? 5 : 6), reason: atomRule.reason };
}

function buildOutput(atom, wire, liquid) {
  const rule = buildRule(atom, wire);
  const atomRule = BUILD_RULES[atom.id] || { k128: 5, k129: 6 };
  const output = {
    wraps: String(rule.wraps),
    power: wire.power,
    status: wire.id === "nife30" ? "TC" : "Regulă airflow",
    noteClass: wire.id === "nife30" ? "context" : "extrap",
    note: rule.reason
  };

  if (wire.id === "k128" && atomRule.k129 === 6) {
    output.status = "Alternativă round-wire";
    output.noteClass = "context";
    output.note = "K1 28 GA / 5 spire: mai mult corp și mouthfeel decât 29/6, cu mai puțină uscăciune și agresivitate.";
  }
  if (wire.id === "k129" && atomRule.k129 === 6) {
    output.status = "Round-wire · acoperire airflow";
    output.noteClass = "extrap";
    output.note = "K1 29 GA / 6 spire extinde footprint-ul pentru airflow-ul mai lat și păstrează redarea seacă, precisă și focusată.";
  }
  if (wire.id === "k1clap") {
    const score = claptonPlatformScore(atom, wire.id);
    output.status = score >= 0.8 ? "K1 Clapton recomandat" : score <= -0.5 ? "K1 Clapton contextual" : "K1 Clapton alternativ";
    output.noteClass = score >= 0.8 ? "valid" : score <= -0.5 ? "context" : "extrap";
    output.note = `${claptonPlatformText(atom, wire.id)} 5 spire, Ø2,5 mm; pornește din zona inferioară a wattajului și urcă în pași de 0,5 W.`;
  }
  if (wire.id === "ssclap") {
    const score = claptonPlatformScore(atom, wire.id);
    output.status = score >= 0.8 ? "SS Clapton recomandat" : score <= -0.5 ? "SS Clapton contextual" : "SS Clapton alternativ";
    output.noteClass = score >= 0.8 ? "valid" : score <= -0.5 ? "context" : "extrap";
    output.note = `${claptonPlatformText(atom, wire.id)} 5 spire, Ø2,5 mm; în watt pornește jos, iar TC SS se folosește numai cu rezistență stabilă și calibrare corectă.`;
  }
  if (atom.id === "klp" && wire.id === "k129") {
    output.status = "Validat";
    output.noteClass = "valid";
    output.note = "29/5 este reperul pentru hit/TH maxim, vape dur, sec și focusat; aproape de Dvarw CL ca impact.";
  }
  if (atom.id === "klp" && wire.id === "k128") {
    output.status = "Validat";
    output.noteClass = "valid";
    output.note = "28/5 păstrează hit/TH foarte bun și adaugă mai mult mouthfeel și corp decât 29/5.";
  }
  if (atom.id === "chariot" && wire.id === "k1clap" && liquid && norm(liquid.name).includes("tab plus")) {
    output.status = "Validat practic";
    output.noteClass = "valid";
    output.note = "Pe Chariot cu Cronos Tab Plus, K1 Clapton 2×30+38 / 5 spire este reperul principal pentru corp, TH și integrarea profilului.";
  }
  if (wire.id === "nife30") {
    output.note = atom.id === "kprime" && liquid && liquid.brand === "Personal" && String(liquid.name || "").includes("80% trabuc")
      ? "Benchmark validat pe 80% trabuc / 20% cireșe. Familia NiFe folosește 6 spire pe Ø2,5 mm; Dicodes RESISTHERM TCR 320 sau Zivipf NiFe52 TCR 310, calibrare complet rece."
      : "6 spire pe Ø2,5 mm. Dicodes RESISTHERM TCR 320 sau Zivipf NiFe52 TCR 310; calibrare complet rece.";
    if (atom.id === "kprime" && liquid && liquid.brand === "Personal" && String(liquid.name || "").includes("80% trabuc")) {
      output.status = "Validat";
      output.noteClass = "valid";
    }
  }
  return output;
}

function footprintText(atom, wire, output) {
  if (wire.id === "nife30") {
    return "6 spire pe Ø2,5 mm rămân reperul fix pentru TC; aliajul și TCR-ul se aleg corect, iar calibrarea se face complet la rece.";
  }
  if (["k1clap", "ssclap"].includes(wire.id)) {
    return `5 spire pe Ø2,5 mm. Claptonul are suprafață și masă mai mari decât round-wire, deci nu se compară axial 1:1 cu 28/5 sau 29/5. ${buildRule(atom, wire).reason}`;
  }
  const wraps = Number(output.wraps);
  const width = CONTACT_WIDTH_MM[wire.id] && CONTACT_WIDTH_MM[wire.id][wraps];
  return `${wraps} spire contact ≈ ${width || "—"} mm lățime axială. ${buildRule(atom, wire).reason}`;
}

function whyForLiquid(wire, ax, objective, liquid) {
  const complex = has(ax, "layers") || String(liquid.class || "").includes("complex");
  const dry = has(ax, "dry") || has(ax, "simple");
  const dark = has(ax, "dark") || has(ax, "cigar") || has(ax, "kentucky") || has(ax, "latakia") || has(ax, "burley");
  const bright = has(ax, "bright") || has(ax, "citrus") || has(ax, "oriental") || has(ax, "perique");
  const rich = has(ax, "pipe") || has(ax, "sweet") || has(ax, "alcohol") || has(ax, "nuts") || has(ax, "coffeeCocoa");
  const isNet = String(liquid.class || "").startsWith("NET");

  if (wire.id === "k129") {
    if (objective === "th") return "prioritatea este TH-ul; 29 GA concentrează energia și face vape-ul mai dur";
    if (objective === "tobacco" || dry) return "profilul cere tutun central, uscăciune și focus";
    return "oferă cea mai precisă și directă redare dintre round-wire-uri";
  }
  if (wire.id === "k128") {
    if (objective === "body" || rich) return "profilul cere corp, mouthfeel și legarea notelor fără a pierde caracterul de tutun";
    if (complex) return "echilibrează stratificarea cu densitatea și păstrează lichidul complet";
    return "este etalonul cel mai echilibrat între hit, corp și completitudine";
  }
  if (wire.id === "k1clap") {
    if (objective === "body" || objective === "th") return "profilul câștigă din corp, densitate, mouthfeel și TH, exact zona forte a K1 Clapton";
    if (dark || rich || has(ax, "cigar")) return "notele dark, cigar, nuci, cafea, cremă sau alcool au nevoie de masă și integrare";
    return "Claptonul K1 leagă notele și adaugă densitate fără a elimina caracterul de tutun";
  }
  if (wire.id === "ssclap") {
    if (objective === "layers") return "prioritatea este separarea straturilor și vizibilitatea top-notes-urilor";
    if (bright) return "profilul luminos, citric, Oriental sau Perique beneficiază de viteza și claritatea SS Clapton";
    if (complex) return "lichidul complex câștigă layering și textură cu mai multă lumină decât pe K1 Clapton";
    return "SS Clapton adaugă corp de Clapton, dar păstrează o prezentare mai rapidă și mai luminoasă";
  }
  if (objective === "smooth") return "prioritatea este smoothness-ul și consistența termică de la un puf la altul";
  if (objective === "layers" || complex || isNet) return "profilul beneficiază de control termic, finețe și stratificare";
  return "este alternativa TC pentru consistență, finețe și protecție termică";
}

function comparisonText(atom, wire, output) {
  const wraps = Number(output.wraps);
  const atomRule = BUILD_RULES[atom.id] || { k129: 6 };
  if (wire.id === "k128") {
    if (atomRule.k129 === 6) {
      return "+ corp, densitate, mouthfeel și răspuns prompt; − mai puțină uscăciune, precizie și acoperire axială decât 29/6.";
    }
    return "Etalon: echilibrul 100% între hit, corp, mouthfeel, viteză și tobacco-first.";
  }
  if (wire.id === "k129" && wraps === 5) {
    return "+ hit/TH, uscăciune, viteză și focus; − corp și mouthfeel față de etalonul 28/5.";
  }
  if (wire.id === "k129" && wraps === 6) {
    return "+ precizie, uscăciune și acoperire axială; − hit mai puțin concentrat decât 29/5 și corp mai mic decât 28/5.";
  }
  if (wire.id === "k1clap") {
    return "+ corp, densitate, mouthfeel, TH și integrare; − ramp-up mai lent, mai multă căldură și separare mai mică decât SS Clapton.";
  }
  if (wire.id === "ssclap") {
    return "+ claritate, top-notes, layering și răspuns mai rapid decât K1 Clapton; − mai puțină uscăciune și poate accentua dulceața.";
  }
  return "+ smoothness, consistență, finețe și layering; − mai puțin hit brut și necesită TCR plus calibrare la rece.";
}

function airFlags(atom) {
  const text = norm(atom.airflow.system + " " + atom.airflow.details);
  return {
    bottom: text.includes("bottom") || text.includes("aerokon"),
    side: text.includes("side") || text.includes("triple")
  };
}

function geometrySummary(atom) {
  const rule = BUILD_RULES[atom.id] || { k128: 5, k129: 6, reason: "Default conservator." };
  return `<div class="geometry-rule">
    <h5>Builduri stabilite după airflow și masă termică</h5>
    <div class="geometry-grid geometry-grid-five">
      <span><b>K1 28 GA</b>${rule.k128} spire · ≈ ${CONTACT_WIDTH_MM.k128[rule.k128]} mm</span>
      <span><b>K1 29 GA</b>${rule.k129} spire · ≈ ${CONTACT_WIDTH_MM.k129[rule.k129]} mm</span>
      <span><b>K1 Clapton</b>2×30+38 · 5 spire</span>
      <span><b>SS Clapton</b>2×30+38 · 5 spire</span>
      <span><b>NiFe TC</b>6 spire · Ø2,5 · TCR 320/310</span>
    </div>
    <p>${escapeHtml(rule.reason)} Claptonurile intră în TOP 3 numai când profilul lichidului și platforma justifică suprafața și masa suplimentare.</p>
  </div>`;
}

function liquidSearchText(liquid) {
  return norm([
    liquid.class,
    liquid.brand,
    liquid.name,
    liquid.line,
    liquid.kind,
    liquid.profile,
    (liquid.tags || []).join(" ")
  ].join(" "));
}

function queryTokens(query) {
  return norm(query).split(/[\s,+/&;|]+/).filter(Boolean);
}

function matchesLiquid(liquid, query) {
  const tokens = queryTokens(query);
  if (!tokens.length) return true;
  const text = liquidSearchText(liquid);
  return tokens.every(token => text.includes(token));
}

function inferFreeClass(text) {
  const value = ` ${norm(text)} `;
  const isNet = [" net ", " extract", "macerat", "organic", "distilat", "distillato", "microfiltrat", "naturally extracted", "frunza naturala"]
    .some(token => value.includes(token));
  const isComplex = ["blend", "mixture", "english", "balkan", "vaper", "vabur", "vaoriental", "vakentucky", "ry4", "caramel", "vanilie", "vanilla", "cireasa", "cherry", "bourbon", "whisky", "rum", " rom ", "cafea", "coffee", "cacao", "ciocolata", "nuci", "alune", "hazelnut", "miere", "honey", "fruct", "citrus", "crema", "cream", "custard", "biscuit", "cookie", " + ", " & "]
    .some(token => value.includes(token));
  return `${isNet ? "NET" : "Tutun"} ${isComplex ? "complex" : "simplu"}`;
}

function setSteps(current) {
  [1, 2, 3].forEach(index => {
    const element = $("step" + index);
    element.className = "step" + (index < current ? " done" : index === current ? " on" : "");
  });
}

function fillLiquids() {
  const query = $("search").value;
  const select = $("liq");
  const base = state.cat === ALL ? LIQUIDS : LIQUIDS.filter(liquid => liquid.class === state.cat);
  const list = base.filter(liquid => matchesLiquid(liquid, query));
  select.innerHTML = '<option value="">— alege din listă —</option>';

  const groups = {};
  list.forEach(liquid => {
    const key = state.cat === ALL ? `${liquid.class} · ${liquid.brand}` : liquid.brand;
    (groups[key] ??= []).push(liquid);
  });

  Object.keys(groups)
    .sort((left, right) => {
      if (state.cat !== ALL) return left.localeCompare(right, "ro");
      const leftClass = CATEGORY_ORDER.findIndex(category => left.startsWith(category));
      const rightClass = CATEGORY_ORDER.findIndex(category => right.startsWith(category));
      return leftClass - rightClass || left.localeCompare(right, "ro");
    })
    .forEach(groupName => {
      const group = document.createElement("optgroup");
      group.label = groupName;
      groups[groupName]
        .sort((left, right) => left.name.localeCompare(right.name, "ro"))
        .forEach(liquid => {
          const option = document.createElement("option");
          option.value = LIQUIDS.indexOf(liquid);
          option.textContent = `${liquid.name} · ${liquid.profile}`;
          group.appendChild(option);
        });
      select.appendChild(group);
    });

  $("count").textContent = `${list.length} / ${base.length}`;
}

function setCategory(category) {
  state.cat = category;
  state.liquid = null;
  state.atom = null;

  document.querySelectorAll(".cat").forEach(button => {
    button.classList.toggle("active", button.dataset.cat === category);
  });

  $("search").value = "";
  $("search").placeholder = category === ALL
    ? "Caută în toate categoriile: brand, nume, frunză, VaPer, cigar + bourbon…"
    : "Ex.: Latakia, VaPer, Cuban + bourbon…";
  $("freeBtn").disabled = true;
  $("freeBtn").textContent = "Folosește textul ca profil liber";
  $("freeHint").textContent = category === ALL
    ? "Căutarea verifică toate cele patru clase. Pentru profil liber, categoria este dedusă automat din text."
    : "Poți căuta în categoria selectată sau poți folosi direct textul ca profil liber.";

  fillLiquids();
  $("liqInfo").classList.add("hidden");
  $("atom").disabled = true;
  $("atom").innerHTML = '<option>— alege mai întâi lichidul —</option>';
  $("air").classList.add("hidden");
  $("builds").innerHTML = '<div class="empty">Alege lichidul și atomizorul. TOP 3 sunt selectate inteligent din cele 5 sârme active.</div>';
  setSteps(1);
}

function renderLiquid() {
  if (!state.liquid) {
    $("liqInfo").classList.add("hidden");
    return;
  }
  const liquid = state.liquid;
  const ax = axes(liquid);
  $("liqInfo").classList.remove("hidden");
  $("liqInfo").innerHTML = `<h4>${escapeHtml(liquid.brand)} · ${escapeHtml(liquid.name)}</h4>
    <p><b>${escapeHtml(liquid.class)}</b> · ${escapeHtml(liquid.line || "—")} · ${escapeHtml(liquid.kind || "—")}</p>
    <p>${escapeHtml(liquid.profile)}</p>
    <div class="pills">${ax.slice(0, 10).map(axis => `<span class="pill">${escapeHtml(axis)}</span>`).join("")}</div>`;
}

function activateLiquid(liquid) {
  state.liquid = liquid;
  state.atom = null;
  renderLiquid();
  rankAtoms();
  fillAtoms();
  $("air").classList.add("hidden");
  renderBuilds();
  setSteps(2);
}

function chooseLiquid() {
  const value = $("liq").value;
  const index = Number(value);
  if (value !== "" && Number.isFinite(index) && LIQUIDS[index]) activateLiquid(LIQUIDS[index]);
}

function useFreeProfile() {
  const query = $("search").value.trim();
  if (!query) return;
  const liquidClass = state.cat === ALL ? inferFreeClass(query) : state.cat;
  activateLiquid({
    class: liquidClass,
    brand: "Profil liber",
    name: query,
    line: state.cat === ALL ? "categorie dedusă automat" : "introdus manual",
    kind: "profil generic",
    profile: query,
    tags: query.split(/[,+/;]+/).map(item => item.trim()).filter(Boolean)
  });
  $("liq").value = "";
}

function fillAtoms() {
  const select = $("atom");
  select.disabled = false;
  select.innerHTML = '<option value="">— alege atomizorul —</option>';
  state.atomRanking.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = item.atom.id;
    option.textContent = `#${index + 1} · ${item.atom.short} · ${state.match[item.atom.id]}% fit · ${item.atom.score.toFixed(1)}/10`;
    select.appendChild(option);
  });
}

function chooseAtom() {
  const id = $("atom").value;
  state.atom = ATOMS.find(atom => atom.id === id) || null;
  if (!state.atom) {
    $("air").classList.add("hidden");
    renderBuilds();
    setSteps(2);
    return;
  }

  const atom = state.atom;
  const flags = airFlags(atom);
  $("air").classList.remove("hidden");
  $("airvis").innerHTML = '<div class="coil"></div>'
    + (flags.bottom ? '<div class="jetB"></div>' : '')
    + (flags.side ? '<div class="jetL"></div><div class="jetR"></div>' : '');
  $("ameta").innerHTML = `<h4>${escapeHtml(atom.short)} · ${atom.score.toFixed(1)}/10</h4>
    <div class="pills"><span class="pill cyan">${escapeHtml(atom.airflow.system)}</span><span class="pill gold">${state.match[atom.id]}% fit</span></div>
    <p><b>Airflow:</b> ${escapeHtml(atom.airflow.details)}</p>
    ${geometrySummary(atom)}`;
  renderBuilds();
  setSteps(3);
}

function setObjective(value) {
  state.objective = value;
  document.querySelectorAll("[data-obj]").forEach(button => {
    button.classList.toggle("active", button.dataset.obj === value);
  });
  if (!state.liquid) return;

  const atomId = state.atom && state.atom.id;
  rankAtoms();
  fillAtoms();
  if (atomId) {
    $("atom").value = atomId;
    state.atom = ATOMS.find(atom => atom.id === atomId) || null;
    chooseAtom();
  }
}

function renderBuilds() {
  if (!state.liquid || !state.atom) {
    $("builds").innerHTML = '<div class="empty">Alege lichidul și atomizorul. TOP 3 sunt selectate inteligent din cele 5 sârme active.</div>';
    return;
  }

  const atom = state.atom;
  const liquid = state.liquid;
  const ax = axes(liquid);
  let ranking = WIRES
    .map(wire => ({ wire, score: wireTrait(wire, ax, state.objective) + wireBonus(atom, wire, ax, state.objective, liquid) }))
    .sort((left, right) => right.score - left.score);

  if (atom.id === "kprime" && liquid.brand === "Personal" && String(liquid.name || "").includes("80% trabuc")) {
    ranking.sort((left, right) => left.wire.id === "nife30" ? -1 : right.wire.id === "nife30" ? 1 : right.score - left.score);
  }
  if (atom.id === "chariot" && norm(liquid.name).includes("tab plus")) {
    const order = { k1clap: 0, k128: 1, nife30: 2, k129: 3, ssclap: 4 };
    ranking.sort((left, right) => (order[left.wire.id] ?? 99) - (order[right.wire.id] ?? 99));
  }

  ranking = ranking.slice(0, 3);
  $("builds").innerHTML = ranking.map((item, index) => {
    const wire = item.wire;
    const output = buildOutput(atom, wire, liquid);
    return `<article class="build ${index === 0 ? "best" : ""}">
      <div class="brow"><span class="rank ${index ? "alt" : ""}">${index + 1}</span><span class="wname">${escapeHtml(wire.name)}</span>${index === 0 ? '<span class="besttxt">RECOMANDAREA 1</span>' : ""}</div>
      <div class="spec">${escapeHtml(wire.diam)} · ${output.wraps} spire · ${escapeHtml(output.power)}</div>
      <div class="why"><b>De ce pentru lichid:</b> ${escapeHtml(whyForLiquid(wire, ax, state.objective, liquid))}.</div>
      <div class="note"><b>Diferență de vape:</b> ${escapeHtml(comparisonText(atom, wire, output))}</div>
      <div class="note"><b>Potrivire airflow:</b> ${escapeHtml(footprintText(atom, wire, output))}</div>
      <div class="note ${output.noteClass}"><b>${escapeHtml(output.status)}:</b> ${escapeHtml(output.note)}</div>
    </article>`;
  }).join("");
}

function fillAtomExplorer() {
  const select = $("atomExplorer");
  select.innerHTML = '<option value="">— selectează un atomizor —</option>';
  [...ATOMS]
    .sort((left, right) => right.score - left.score || left.short.localeCompare(right.short, "ro"))
    .forEach(atom => {
      const option = document.createElement("option");
      option.value = atom.id;
      option.textContent = `${atom.short} · ${atom.score.toFixed(1)}/10`;
      select.appendChild(option);
    });
}

function explorerVapeText(atom, wire, output) {
  const atomRule = BUILD_RULES[atom.id] || { k129: 6 };
  if (wire.id === "k128") {
    return atomRule.k129 === 6
      ? "Round-wire mai plin: corp, densitate și mouthfeel; mai puțină uscăciune și precizie decât 29/6."
      : "Etalonul echilibrat: hit bun, corp curat și mouthfeel; mai puțin brutal decât 29/5.";
  }
  if (wire.id === "k129" && output.wraps === "5") {
    return "Cea mai dură variantă round-wire: hit/TH maxim, ramp-up rapid, uscăciune și focus; pierde corp față de 28/5.";
  }
  if (wire.id === "k129") {
    return "Round-wire pentru airflow mai lat: mai sec și mai precis decât 28/5, cu acoperire axială mai mare; hit mai puțin concentrat decât 29/5.";
  }
  if (wire.id === "k1clap") {
    return "Claptonul dens: maximum de corp, mouthfeel, integrare și TH; mai cald și mai lent, cu separare mai mică decât SS Clapton.";
  }
  if (wire.id === "ssclap") {
    return "Claptonul luminos: claritate, top-notes și layering, cu răspuns mai rapid decât K1 Clapton; poate accentua dulceața.";
  }
  return "Varianta TC: cea mai fină, smooth și constantă, cu layering și control termic; oferă mai puțin hit brut decât K1.";
}

function renderAtomExplorer() {
  const id = $("atomExplorer").value;
  const atom = ATOMS.find(item => item.id === id);
  const target = $("atomExplorerResult");
  if (!atom) {
    target.innerHTML = '<div class="empty">Selectează oricare dintre atomizoarele tale pentru comparația directă a celor 5 sârme.</div>';
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
      <div><span class="explorer-kicker">ANALIZĂ INDEPENDENTĂ DE LICHID</span><h4>${escapeHtml(atom.short)} · ${atom.score.toFixed(1)}/10</h4></div>
      <span class="pill cyan">${escapeHtml(atom.airflow.system)}</span>
    </div>
    <p class="explorer-air"><b>Airflow:</b> ${escapeHtml(atom.airflow.details)}</p>
    ${geometrySummary(atom)}
    <div class="explorer-builds explorer-builds-five">${cards}</div>
    <div class="explorer-tip"><b>Cum folosești rezultatul:</b> aici vezi ADN-ul platformei pentru toate cele 5 sârme. În motorul principal, Claptonurile intră în TOP 3 numai când bat efectiv round-wire-ul sau NiFe TC pentru lichidul și obiectivul selectat.</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".cat").forEach(button => {
    button.addEventListener("click", () => setCategory(button.dataset.cat));
  });
  $("search").addEventListener("input", () => {
    fillLiquids();
    const query = $("search").value.trim();
    $("freeBtn").disabled = !query;
    $("freeBtn").textContent = query
      ? `Folosește „${query}” ca profil liber${state.cat === ALL ? " · categorie automată" : ""}`
      : "Folosește textul ca profil liber";
  });
  $("freeBtn").addEventListener("click", useFreeProfile);
  $("liq").addEventListener("change", chooseLiquid);
  $("atom").addEventListener("change", chooseAtom);
  $("atomExplorer").addEventListener("change", renderAtomExplorer);
  document.querySelectorAll("[data-obj]").forEach(button => {
    button.addEventListener("click", () => setObjective(button.dataset.obj));
  });

  fillAtomExplorer();
  setCategory(ALL);
});