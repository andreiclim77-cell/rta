/* 415 RTA MTL Cool — validare practică și extrapolare pe lichide.
 * Confirmat de utilizator pe Herrera Cigarro Habano, Tasty MTL 3×0,9 mm:
 * - K1 28 GA / Ø2,5 / 5 spire = build corect, echilibrat.
 * - K1 29 GA / Ø2,5 / 5 spire, ~12 W = aromă mai concentrată și mai dulce.
 * - K1 29 GA / Ø2,5 / 6 spire = mai puțin dulce, puțin mai dry și mai tobacco-first,
 *   dar cu aromă mai puțin concentrată.
 * Motorul extrapolează această bifurcație pe toate lichidele pentru 415.
 */
(() => {
  const originalBuildOutput = buildOutput;
  const originalFootprintText = footprintText;
  const originalComparisonText = comparisonText;
  const originalWhyForLiquid = whyForLiquid;
  const originalGeometrySummary = geometrySummary;
  const originalExplorerVapeText = explorerVapeText;

  const isHerreraHabano = liquid => {
    const text = norm(`${liquid && liquid.brand || ""} ${liquid && liquid.name || ""}`);
    return text.includes("herrera") && text.includes("cigarro habano");
  };

  function currentObjective() {
    return (typeof state !== "undefined" && state && state.objective) || "complete";
  }

  function k129Wrap415(liquid, objective = currentObjective()) {
    const ax = axes(liquid || {});
    const liquidClass = String(liquid && liquid.class || "");
    const complex = liquidClass.includes("complex") || has(ax, "layers");
    const simple = liquidClass.includes("simplu") || has(ax, "simple");
    const net = liquidClass.startsWith("NET");
    const rich = has(ax, "sweet") || has(ax, "pipe") || has(ax, "alcohol") || has(ax, "nuts") || has(ax, "coffeeCocoa");

    let concentration = 0;
    let tobaccoDry = 0;

    if (complex) concentration += 2.0;
    if (has(ax, "sweet")) concentration += 2.0;
    if (has(ax, "pipe") || has(ax, "alcohol") || has(ax, "nuts") || has(ax, "coffeeCocoa")) concentration += 1.5;
    if (has(ax, "cigar")) concentration += 0.75;
    if (objective === "body") concentration += 1.5;
    if (objective === "complete") concentration += 0.75;
    if (objective === "th") concentration += 0.5;

    if (simple) tobaccoDry += 2.0;
    if (has(ax, "dry")) tobaccoDry += 2.0;
    if (net && simple) tobaccoDry += 1.0;
    if (objective === "tobacco") tobaccoDry += 2.0;
    if (objective === "smooth") tobaccoDry += 0.25;
    if (!rich && (has(ax, "burley") || has(ax, "kentucky") || has(ax, "latakia"))) tobaccoDry += 0.5;

    // În caz de egalitate, 29/6 rămâne defaultul geometric/tobacco-first al celor 3 jeturi.
    return concentration > tobaccoDry ? 5 : 6;
  }

  function k129ModeText415(wraps) {
    return wraps === 5
      ? "29/5 = mod CONCENTRATION: aromă mai concentrată, mai densă și percepută mai dulce; punct de pornire validat ≈12 W."
      : "29/6 = mod DRY / TOBACCO: mai puțin dulce, puțin mai dry și mai tobacco-first; aroma este mai puțin concentrată, iar cele 3 jeturi spală mai uniform coilul.";
  }

  buildOutput = function(atom, wire, liquid) {
    const output = originalBuildOutput(atom, wire, liquid);
    if (!atom || atom.id !== "415") return output;

    if (wire.id === "k128") {
      output.wraps = "5";
      output.status = "Validat practic · 415";
      output.noteClass = "valid";
      output.note = "K1 28 GA / Ø2,5 / 5 spire este confirmat ca build corect pe 415: echilibrat între corp, mouthfeel, tutun și concentrarea aromei.";
      return output;
    }

    if (wire.id !== "k129") return output;

    const wraps = k129Wrap415(liquid, currentObjective());
    output.wraps = String(wraps);
    output.noteClass = isHerreraHabano(liquid) ? "valid" : "context";

    if (wraps === 5) {
      output.power = isHerreraHabano(liquid) ? "≈12 W · validat" : "≈12 W punct de pornire";
      output.status = isHerreraHabano(liquid) ? "Validat practic · 415 concentration" : "Extrapolare 415 · concentration";
      output.note = `${k129ModeText415(5)} ${isHerreraHabano(liquid) ? "Confirmat direct pe Herrera Cigarro Habano." : "Ales pentru acest lichid deoarece profilul beneficiază mai mult de densitate/concentrare decât de uscăciunea suplimentară a 29/6."}`;
    } else {
      output.status = isHerreraHabano(liquid) ? "Validat practic · 415 dry/tobacco" : "Extrapolare 415 · dry/tobacco";
      output.note = `${k129ModeText415(6)} ${isHerreraHabano(liquid) ? "Confirmat direct pe același Herrera Cigarro Habano." : "Ales pentru acest lichid deoarece profilul sau obiectivul favorizează frunza, uscăciunea și tobacco-first."}`;
    }
    return output;
  };

  footprintText = function(atom, wire, output) {
    if (!atom || atom.id !== "415" || wire.id !== "k129") return originalFootprintText(atom, wire, output);
    const wraps = Number(output.wraps);
    const width = CONTACT_WIDTH_MM.k129[wraps];
    return `${wraps} spire contact ≈ ${width} mm axial. ${k129ModeText415(wraps)} Ambele variante sunt intenționate: 29/5 concentrează, 29/6 distribuie mai larg airflow-ul 3×0,9 mm.`;
  };

  comparisonText = function(atom, wire, output) {
    if (!atom || atom.id !== "415") return originalComparisonText(atom, wire, output);
    if (wire.id === "k128") {
      return "Validat: 28/5 este punctul de echilibru al 415 — corp și mouthfeel mai mari decât 29 GA, fără concentrarea dulce specifică lui 29/5 și fără uscăciunea mai pronunțată a lui 29/6.";
    }
    if (wire.id === "k129" && Number(output.wraps) === 5) {
      return "+ concentrarea aromei, densitate și dulceață percepută; − mai puțin dry și mai puțin tobacco-first decât 29/6.";
    }
    if (wire.id === "k129" && Number(output.wraps) === 6) {
      return "+ uscăciune, structură de tutun și tobacco-first; − aromă mai puțin concentrată și dulceață mai mică decât 29/5.";
    }
    return originalComparisonText(atom, wire, output);
  };

  whyForLiquid = function(wire, ax, objective, liquid) {
    const activeAtom = (typeof state !== "undefined" && state && state.atom) || null;
    if (!activeAtom || activeAtom.id !== "415" || wire.id !== "k129") {
      return originalWhyForLiquid(wire, ax, objective, liquid);
    }
    const wraps = k129Wrap415(liquid, objective);
    return wraps === 5
      ? "pe 415, profilul cere aromă concentrată/densă; 29/5 a fost validat ca fiind mai dulce și mai concentrat decât 29/6"
      : "pe 415, profilul cere mai mult dry/tobacco-first; 29/6 a fost validat ca mai puțin dulce și mai orientat spre frunză decât 29/5";
  };

  geometrySummary = function(atom) {
    if (!atom || atom.id !== "415") return originalGeometrySummary(atom);
    return `<div class="geometry-rule">
      <h5>415 · regulă validată practic pe Tasty MTL 3×0,9 mm</h5>
      <div class="geometry-grid geometry-grid-five">
        <span><b>K1 28 GA</b>5 spire · ≈1,61 mm · VALIDAT</span>
        <span><b>K1 29 GA</b>5 spire · ≈1,43 mm · concentration / sweet</span>
        <span><b>K1 29 GA</b>6 spire · ≈1,72 mm · dry / tobacco</span>
        <span><b>Clapton</b>K1/SS · 5 spire · contextual</span>
        <span><b>NiFe30</b>7 spire · TCR 320/310</span>
      </div>
      <p><b>Validare A/B:</b> 29/5 la aproximativ 12 W a dat aromă mai concentrată și mai dulce; 29/6 a dat mai puțină dulceață, puțin mai mult dry și tutun, dar concentrație aromatică mai mică. 28/5 este confirmat corect. Motorul alege 29/5 sau 29/6 pentru fiecare lichid în funcție de profil și obiectiv.</p>
    </div>`;
  };

  explorerVapeText = function(atom, wire, output) {
    if (!atom || atom.id !== "415") return originalExplorerVapeText(atom, wire, output);
    if (wire.id === "k128") return "VALIDAT: 28/5 = echilibru 415, corp și mouthfeel fără să împingă excesiv nici dulceața, nici uscăciunea.";
    if (wire.id === "k129") return "415 are două moduri validate: 29/5 ≈12 W = mai dulce și mai concentrat; 29/6 = mai dry, mai tobacco-first și mai puțin concentrat.";
    return originalExplorerVapeText(atom, wire, output);
  };
})();
