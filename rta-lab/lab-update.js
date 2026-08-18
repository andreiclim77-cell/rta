/* RTA Lab update 18.08.2026
 * - 500 liquid/profile references
 * - global search without prior classification
 * - validated KLP 5-wrap builds
 * - controlled 5-wrap extrapolation to KX, GT One, Dvarw CL, GTR and K Prime
 */
(function () {
  const ALL = "ALL";
  const CATEGORY_ORDER = ["Tutun simplu", "Tutun complex", "NET simplu", "NET complex"];
  const FIVE_WRAP_ATOMS = new Set(["kx", "gtone", "dvarwcl", "gtr", "kprime"]);
  const baseOverride = override;
  const baseFootprint = footprint;
  const baseWireBonus = wireBonus;

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
    $("builds").innerHTML = '<div class="empty">Alege lichidul și atomizorul. TOP 4 apar automat.</div>';
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

  wireBonus = function (atom, wire, ax, objective, liquid) {
    let bonus = baseWireBonus(atom, wire, ax, objective, liquid);
    if (atom.id === "klp" && wire.id === "k128") bonus += 2.2;
    if (FIVE_WRAP_ATOMS.has(atom.id) && wire.id === "k129" && ["th", "tobacco"].includes(objective)) bonus += 0.35;
    if (FIVE_WRAP_ATOMS.has(atom.id) && wire.id === "k128" && ["body", "complete"].includes(objective)) bonus += 0.35;
    return bonus;
  };

  function klpNeedsSix(liquid, ax) {
    const richProfile = ["layers", "sweet", "pipe", "alcohol", "nuts", "coffeeCocoa", "citrus"]
      .some(key => has(ax, key));
    return state.obj === "smooth" || (state.obj === "complete" && richProfile);
  }

  override = function (atom, wire, liquid) {
    const output = baseOverride(atom, wire, liquid);
    output.status = output.note ? "Validat" : "Notă";
    const ax = axes(liquid);

    if (atom.id === "klp" && wire.id === "k129") {
      if (klpNeedsSix(liquid, ax)) {
        output.wraps = "6";
        output.power = "11,5–13 W";
        output.status = "Contextual";
        output.note = "29/6 rămâne rezervă când lichidul cere mai mult echilibru și completitudine, cu mai puțină agresivitate.";
      } else {
        output.wraps = "5";
        output.power = "11,5–13 W";
        output.status = "Validat";
        output.note = "29/5 este reperul principal pentru hit/TH maxim, vape mai dur, sec și focusat; KLP ajunge foarte aproape de Dvarw CL ca impact.";
      }
    }

    if (atom.id === "klp" && wire.id === "k128") {
      output.wraps = "5";
      output.power = "12–13,5 W";
      output.status = "Validat";
      output.note = "28/5 păstrează hit/TH foarte bun și adaugă mai mult mouthfeel/corp față de 29/5.";
    }

    if (FIVE_WRAP_ATOMS.has(atom.id) && ["k128", "k129"].includes(wire.id)) {
      output.wraps = "5";
      output.status = "Extrapolare";
      output.note = wire.id === "k129"
        ? "Regulă transferată de la KLP pentru mai mult hit/TH, uscăciune și focus; încă nevalidată A/B pe această platformă."
        : "Regulă transferată de la KLP pentru hit/TH foarte bun cu mai mult mouthfeel/corp; încă nevalidată A/B pe această platformă.";
    }

    if (atom.id === "kprime" && wire.id === "nife30") {
      output.status = "TC";
    } else if (wire.id === "nife30") {
      output.status = "TC";
    }
    if (atom.id === "muted" && wire.id === "ss32tw") output.status = "Atenție";
    return output;
  };

  footprint = function (atom, wire, liquid, output) {
    if (atom.id === "klp" && wire.id === "k129") {
      return output.wraps === "5"
        ? "29/5 este validat ca footprint compact pentru hit/TH maxim; 29/6 se folosește numai contextual."
        : "29/6 extinde footprint-ul și temperează agresivitatea atunci când profilul cere completitudine.";
    }
    if (atom.id === "klp" && wire.id === "k128") {
      return "28/5 este validat: footprint compact, impact puternic și masă suficientă pentru mouthfeel/corp.";
    }
    if (FIVE_WRAP_ATOMS.has(atom.id) && ["k128", "k129"].includes(wire.id)) {
      return "5 spire au prioritate de test pe această platformă; păstrează poziția și airflow-ul identice și validează A/B înainte de concluzie.";
    }
    return baseFootprint(atom, wire);
  };

  function sortKlp(ranking, ax) {
    const preferBody = state.obj === "body"
      || state.obj === "smooth"
      || (state.obj === "complete" && ["layers", "sweet", "pipe", "alcohol", "nuts", "coffeeCocoa"].some(key => has(ax, key)));
    const order = preferBody ? { k128: 0, k129: 1, k1clap: 2 } : { k129: 0, k128: 1, k1clap: 2 };
    return ranking.sort((left, right) => (order[left.w.id] ?? 99) - (order[right.w.id] ?? 99) || right.s - left.s);
  }

  renderBuilds = function () {
    if (!state.liq || !state.atom) {
      $("builds").innerHTML = '<div class="empty">Alege lichidul și atomizorul. TOP 4 apar automat.</div>';
      return;
    }

    const atom = state.atom;
    const liquid = state.liq;
    const ax = axes(liquid);
    let ranking = WIRES
      .map(wire => ({ w: wire, s: wireTrait(wire, ax, state.obj) + wireBonus(atom, wire, ax, state.obj, liquid) }))
      .sort((left, right) => right.s - left.s);

    if (atom.id === "klp") ranking = sortKlp(ranking, ax);

    if (atom.id === "chariot" && norm(liquid.name).includes("tab plus")) {
      const order = { k1clap: 0, k128: 1, nife30: 2, ss32tw: 3 };
      ranking.sort((left, right) => (order[left.w.id] ?? 99) - (order[right.w.id] ?? 99) || right.s - left.s);
    }

    if (atom.id === "kprime" && liquid.brand === "Personal" && liquid.name.includes("80% trabuc")) {
      ranking.sort((left, right) => left.w.id === "nife30" ? -1 : right.w.id === "nife30" ? 1 : right.s - left.s);
    }

    ranking = ranking.slice(0, 4);
    $("builds").innerHTML = ranking.map((item, index) => {
      const wire = item.w;
      const output = override(atom, wire, liquid);
      const noteClass = output.status === "Validat"
        ? "valid"
        : output.status === "Extrapolare"
          ? "extrap"
          : output.status === "Contextual"
            ? "context"
            : "";
      return `<article class="build ${index === 0 ? "best" : ""}">
        <div class="brow"><span class="rank ${index ? "alt" : ""}">${index + 1}</span><span class="wname">${wire.name}</span>${index === 0 ? '<span class="besttxt">BEST MATCH</span>' : ""}</div>
        <div class="spec">${wire.diam} · ${output.wraps} spire · ${output.power}</div>
        <div class="why"><b>De ce:</b> ${why(wire, state.obj)}.</div>
        <div class="note"><b>Coil footprint:</b> ${footprint(atom, wire, liquid, output)}</div>
        ${output.note ? `<div class="note ${noteClass}"><b>${output.status}:</b> ${output.note}</div>` : ""}
      </article>`;
    }).join("");
  };

  document.addEventListener("DOMContentLoaded", () => setCategory(ALL));
})();
