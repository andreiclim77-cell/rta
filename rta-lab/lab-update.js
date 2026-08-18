/* RTA Lab — motor restrâns la K1 28 GA, K1 29 GA și NiFe30.
 * Numărul de spire K1 este stabilit pe fiecare platformă după amprenta airflow-ului.
 */
(function () {
  const ALL = "ALL";
  const CATEGORY_ORDER = ["Tutun simplu", "Tutun complex", "NET simplu", "NET complex"];

  /* Regula binară cerută: 5 spire unde rezultă clar sau aproape optim;
   * 6 spire pe geometriile mai late, multipunct, duale ori insuficient determinate.
   * Valorile presupun coil contact, Ø2,5 mm, round wire.
   */
  const BUILD_RULES = {
    "415":      { k128: 6, k129: 6, reason: "Trei jeturi 3×0,9 mm: footprint multipunct, mai lat decât un jet unic." },
    "kprime":   { k128: 5, k129: 5, reason: "Bottom-air direct și concentrat; coilul compact este aproape de zona energetică utilă." },
    "gtone":    { k128: 5, k129: 5, reason: "Air-pin unic, vertical, foarte aproape de coil; 5 spire concentrează eficient jetul." },
    "dvarwcl":  { k128: 5, k129: 5, reason: "Cu insert single/stock, jetul este compact; 5 spire sunt reperul optimizat. Inserturile multi-hole foarte late pot justifica manual 6." },
    "muted":    { k128: 6, k129: 6, reason: "Configurația uzuală triple-air spală o zonă mai lată; 6 spire acoperă mai sigur bottom + side-air. Bottom-only tight poate fi testat manual la 5." },
    "gtr":      { k128: 6, k129: 6, reason: "Două jeturi oblice, 1,0 + 1,2 mm: footprint dual, mediu-lat." },
    "dvarwfl":  { k128: 5, k129: 5, reason: "Cu insert single/stock 1×1,2 mm, jetul este concentrat; 5 spire sunt reperul optimizat. Multi-hole foarte lat poate cere manual 6." },
    "diplomat": { k128: 6, k129: 6, reason: "Diverterul cu 24×0,9 mm distribuie aerul pe o zonă lată și uniformă." },
    "kx":       { k128: 5, k129: 5, reason: "Aerokon restricționează direct sub coil; 5 spire păstrează footprint-ul compact și eficient." },
    "klp":      { k128: 5, k129: 5, reason: "Validat practic pe Aerokon: 29/5 maximizează hitul, iar 28/5 păstrează hitul cu mai mult mouthfeel." },
    "asylum":   { k128: 6, k129: 6, reason: "Airpinurile pot avea geometrie dublă/ovală, iar amprenta exactă nu este suficient documentată; 6 spire este alegerea conservatoare." },
    "pmfree":   { k128: 6, k129: 6, reason: "Diverterul cu 32×0,9 mm produce un footprint foarte lat și uniform." },
    "pmstd":    { k128: 6, k129: 6, reason: "Aceeași bază multipunct 32×0,9 mm ca Freehand; bell-ul schimbă gustul, nu lățimea jetului de bază." },
    "byka":     { k128: 5, k129: 5, reason: "Air-pipe unic și jet concentrat; 5 spire sunt aproape de zona optimă pentru pinurile MTL uzuale." },
    "chariot":  { k128: 6, k129: 6, reason: "Camera foarte mică și testul practic 28/6 susțin 6 spire; 29 GA rămâne tot la 6 în regula binară." },
    "kv3":      { k128: 5, k129: 6, reason: "AFC intern reglabil: 28 GA acoperă bine cu 5; firul mai subțire 29 GA are nevoie de 6 pentru un footprint apropiat." },
    "minister": { k128: 6, k129: 6, reason: "Diverterul 12/20×1 mm este lat; 6 spire echilibrează acoperirea cu volumul foarte mic al camerei." }
  };

  const CONTACT_WIDTH_MM = {
    k128: { 5: "1,61", 6: "1,93" },
    k129: { 5: "1,43", 6: "1,72" }
  };

  function liquidText(liquid) {
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
    const text = liquidText(liquid);
    return tokens.every(token => text.includes(token));
  }

  function inferFreeClass(text) {
    const value = ` ${norm(text)} `;
    const isNet = [
      " net ", " extract", "macerat", "organic", "distilat", "distillato",
      "microfiltrat", "naturally extracted", "frunza naturala"
    ].some(token => value.includes(token));
    const isComplex = [
      "blend", "mixture", "english", "balkan", "vaper", "vabur", "vaoriental",
      "vakentucky", "ry4", "caramel", "vanilie", "vanilla", "cireasa", "cherry",
      "bourbon", "whisky", "rum", " rom ", "cafea", "coffee", "cacao", "ciocolata",
      "nuci", "alune", "hazelnut", "miere", "honey", "fruct", "citrus", "crema",
      "cream", "custard", "biscuit", "cookie", " + ", " & "
    ].some(token => value.includes(token));
    return `${isNet ? "NET" : "Tutun"} ${isComplex ? "complex" : "simplu"}`;
  }

  function totalForCurrentCategory() {
    return state.cat === ALL ? LIQUIDS.length : LIQUIDS.filter(liquid => liquid.class === state.cat).length;
  }

  fillLiquids = function () {
    const query = $("search").value;
    const select = $("liq");
    const list = LIQUIDS.filter(liquid => {
      const categoryMatch = state.cat === ALL || liquid.class === state.cat;
      return categoryMatch && matchesLiquid(liquid, query);
    });

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

    $("count").textContent = `${list.length} / ${totalForCurrentCategory()}`;
  };

  setCategory = function (category) {
    state.cat = category;
    state.liq = null;
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

    const hint = $("freeHint");
    if (hint) {
      hint.textContent = category === ALL
        ? "Căutarea verifică toate cele patru clase. Pentru profil liber, categoria este dedusă automat din text."
        : "Ex.: scrii „Latakia” și apeși butonul; nu trebuie să alegi un produs concret.";
    }

    fillLiquids();
    $("liqInfo").classList.add("hidden");
    $("atom").disabled = true;
    $("atom").innerHTML = '<option>— alege mai întâi lichidul —</option>';
    $("air").classList.add("hidden");
    $("builds").innerHTML = '<div class="empty">Alege lichidul și atomizorul. Cele 3 opțiuni active apar automat.</div>';
    setSteps(1);
  };

  useFreeProfile = function () {
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
  };

  /* Alegerea sârmei se face după lichid + obiectiv; spirele se iau separat din BUILD_RULES. */
  wireBonus = function (atom, wire, ax, objective, liquid) {
    const complex = has(ax, "layers") || String(liquid.class || "").includes("complex");
    const simple = has(ax, "simple") || String(liquid.class || "").includes("simplu");
    const dry = has(ax, "dry");
    const dark = has(ax, "dark") || has(ax, "burley") || has(ax, "kentucky") || has(ax, "latakia") || has(ax, "cigar");
    const bright = has(ax, "bright") || has(ax, "oriental") || has(ax, "perique") || has(ax, "citrus");
    const rich = has(ax, "pipe") || has(ax, "sweet") || has(ax, "alcohol") || has(ax, "nuts") || has(ax, "coffeeCocoa");
    const isNet = String(liquid.class || "").startsWith("NET");
    let bonus = 0;

    if (wire.id === "k129") {
      if (simple) bonus += 0.9;
      if (dry) bonus += 0.8;
      if (objective === "th") bonus += 1.4;
      if (objective === "tobacco") bonus += 1.2;
      if (objective === "body" || objective === "smooth") bonus -= 0.65;
      if (rich && complex) bonus -= 0.35;
      if (["klp", "gtone", "dvarwcl"].includes(atom.id)) bonus += 0.55;
      if (["gtr", "diplomat", "asylum", "pmfree"].includes(atom.id) && complex) bonus -= 0.2;
    }

    if (wire.id === "k128") {
      bonus += 0.25;
      if (complex) bonus += 0.75;
      if (dark) bonus += 0.55;
      if (rich) bonus += 0.55;
      if (objective === "body") bonus += 1.25;
      if (objective === "complete") bonus += 0.75;
      if (objective === "tobacco") bonus += 0.35;
      if (objective === "th") bonus += 0.2;
      if (["415", "muted", "diplomat", "asylum", "pmfree", "pmstd", "chariot", "minister"].includes(atom.id)) bonus += 0.45;
    }

    if (wire.id === "nife30") {
      if (isNet) bonus += 0.85;
      if (complex) bonus += 0.75;
      if (bright) bonus += 0.25;
      if (objective === "smooth") bonus += 1.5;
      if (objective === "layers") bonus += 1.25;
      if (objective === "complete") bonus += 0.95;
      if (objective === "th") bonus -= 0.9;
      if (simple && dry && objective === "tobacco") bonus -= 0.35;
      if (["kprime", "gtr", "kx", "gtone", "kv3"].includes(atom.id)) bonus += 0.75;
      if (atom.id === "chariot") bonus -= 0.35;
    }

    if (atom.id === "klp") {
      if (wire.id === "k129" && (objective === "th" || objective === "tobacco" || dry)) bonus += 1.1;
      if (wire.id === "k128" && (objective === "body" || complex || rich)) bonus += 0.95;
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
  };

  function getRule(atom, wire) {
    if (wire.id === "nife30") return { wraps: 7, reason: "NiFe30 rămâne fix la 7 spire, Ø2,5 mm, cu calibrare complet rece." };
    const atomRule = BUILD_RULES[atom.id] || { k128: 6, k129: 6, reason: "Date geometrice insuficiente; se folosește defaultul conservator de 6 spire." };
    return { wraps: atomRule[wire.id] || 6, reason: atomRule.reason };
  }

  override = function (atom, wire, liquid) {
    const rule = getRule(atom, wire);
    const output = {
      wraps: String(rule.wraps),
      power: wire.power,
      status: wire.id === "nife30" ? "TC" : "Regulă airflow",
      note: rule.reason
    };

    if (atom.id === "klp" && wire.id === "k129") {
      output.status = "Validat";
      output.note = "29/5 este reperul pentru hit/TH maxim, vape dur, sec și focusat; aproape de Dvarw CL ca impact.";
    }
    if (atom.id === "klp" && wire.id === "k128") {
      output.status = "Validat";
      output.note = "28/5 păstrează hit/TH foarte bun și adaugă mai mult mouthfeel și corp față de 29/5.";
    }
    if (atom.id === "chariot" && wire.id === "k128" && norm(liquid.name).includes("tab plus")) {
      output.status = "Validat";
      output.note = "Pe Cronos Tab Plus, K1 28 GA / 6 spire este alegerea round-wire validată practic.";
    }
    if (wire.id === "nife30") {
      output.note = atom.id === "kprime" && liquid.brand === "Personal" && String(liquid.name || "").includes("80% trabuc")
        ? "Benchmark validat pe 80% trabuc / 20% cireșe. Dicodes/Resistherm TCR320 sau Zivipf TCR310; calibrare complet rece."
        : "7 spire. Dicodes/Resistherm TCR320 sau Zivipf TCR310; calibrare complet rece.";
      if (atom.id === "kprime" && liquid.brand === "Personal" && String(liquid.name || "").includes("80% trabuc")) output.status = "Validat";
    }
    return output;
  };

  footprint = function (atom, wire, liquid, output) {
    if (wire.id === "nife30") return "7 spire rămân reperul fix pentru TC; lungimea finală depinde de diametrul exact al firului NiFe30 folosit.";
    const wraps = Number(output.wraps);
    const width = CONTACT_WIDTH_MM[wire.id] && CONTACT_WIDTH_MM[wire.id][wraps];
    return `${wraps} spire contact ≈ ${width || "—"} mm lățime axială. ${getRule(atom, wire).reason}`;
  };

  why = function (wire, objective) {
    const reasons = {
      k129: "mai mult hit/TH, uscăciune, precizie și tobacco-first",
      k128: "echilibru între hit, corp, mouthfeel și completitudine",
      nife30: "finețe, consistență termică, layering și smoothness în TC"
    };
    return `${reasons[wire.id]}${objective === "th" ? " · prioritate TH" : objective === "layers" ? " · prioritate stratificare" : objective === "body" ? " · prioritate corp" : ""}`;
  };

  function geometrySummary(atom) {
    const rule = BUILD_RULES[atom.id] || { k128: 6, k129: 6, reason: "Default conservator." };
    return `<p><b>Regulă coil K1, Ø2,5 mm:</b> 28 GA = <b>${rule.k128} spire</b> · 29 GA = <b>${rule.k129} spire</b> · NiFe30 = <b>7 spire</b>.</p><p><b>Motiv geometric:</b> ${rule.reason}</p>`;
  }

  chooseAtom = function () {
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
      + (flags.b ? '<div class="jetB"></div>' : '')
      + (flags.side ? '<div class="jetL"></div><div class="jetR"></div>' : '');
    $("ameta").innerHTML = `<h4>${atom.short} · ${atom.score.toFixed(1)}/10</h4>
      <div class="pills"><span class="pill cyan">${atom.airflow.system}</span><span class="pill gold">${state.match[atom.id]}% fit</span></div>
      <p><b>Airflow:</b> ${atom.airflow.details}</p>
      ${geometrySummary(atom)}`;
    renderBuilds();
    setSteps(3);
  };

  renderBuilds = function () {
    if (!state.liq || !state.atom) {
      $("builds").innerHTML = '<div class="empty">Alege lichidul și atomizorul. Cele 3 opțiuni active apar automat.</div>';
      return;
    }

    const atom = state.atom;
    const liquid = state.liq;
    const ax = axes(liquid);
    let ranking = WIRES
      .map(wire => ({ w: wire, s: wireTrait(wire, ax, state.obj) + wireBonus(atom, wire, ax, state.obj, liquid) }))
      .sort((left, right) => right.s - left.s);

    if (atom.id === "kprime" && liquid.brand === "Personal" && String(liquid.name || "").includes("80% trabuc")) {
      ranking.sort((left, right) => left.w.id === "nife30" ? -1 : right.w.id === "nife30" ? 1 : right.s - left.s);
    }
    if (atom.id === "chariot" && norm(liquid.name).includes("tab plus")) {
      const order = { k128: 0, nife30: 1, k129: 2 };
      ranking.sort((left, right) => (order[left.w.id] ?? 99) - (order[right.w.id] ?? 99));
    }

    $("builds").innerHTML = ranking.map((item, index) => {
      const wire = item.w;
      const output = override(atom, wire, liquid);
      const noteClass = output.status === "Validat" ? "valid" : output.status === "TC" ? "context" : "extrap";
      return `<article class="build ${index === 0 ? "best" : ""}">
        <div class="brow"><span class="rank ${index ? "alt" : ""}">${index + 1}</span><span class="wname">${wire.name}</span>${index === 0 ? '<span class="besttxt">RECOMANDAREA 1</span>' : ""}</div>
        <div class="spec">${wire.diam} · ${output.wraps} spire · ${output.power}</div>
        <div class="why"><b>De ce pentru lichid:</b> ${why(wire, state.obj)}.</div>
        <div class="note"><b>Potrivire airflow:</b> ${footprint(atom, wire, liquid, output)}</div>
        <div class="note ${noteClass}"><b>${output.status}:</b> ${output.note}</div>
      </article>`;
    }).join("");
  };

  document.addEventListener("DOMContentLoaded", () => setCategory(ALL));
})();
