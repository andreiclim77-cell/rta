/* RTA Lab — Clapton platform map, actualizat 04.09.2026.
 * Perechi Clapton active:
 * - Chariot -> K1 Clapton 2x30+38 / Ø2,5 / 5 (dedicată, validată direct)
 * - 415 -> K1 Clapton 2x30+38 / Ø2,5 / 5 (preferință de platformă)
 * - Dvarw MTL FL -> SS316L Clapton 2x30+38 / Ø2,5 / 5 (dedicată)
 * Asylum V3 păstrează doar K1 Clapton ca opțiune contextuală de corp/integrare.
 * Triangularea este contextuală: lichid + obiectiv + ADN platformă + build activ.
 */
(() => {
  window.RTA_LAB_CLAPTON_PLATFORM_MAP = {
    date: "2026-09-04",
    principle: "Cele trei perechi Clapton active influențează triangularea lichid + obiectiv + ADN platformă fără a forța un rezultat incompatibil.",
    activePairs: [
      "Chariot -> K1 Clapton/5",
      "415 -> K1 Clapton/5",
      "Dvarw MTL FL -> SS316L Clapton/5"
    ],
    map: {
      chariot: {
        wireId: "k1clap",
        wire: "K1 Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "dedicated",
        status: "pereche dedicată; validare practică directă existentă pe Cronos Tab Plus"
      },
      "415": {
        wireId: "k1clap",
        wire: "K1 Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "preferred",
        status: "preferință Clapton de platformă pentru corp, densitate, mouthfeel și integrare"
      },
      dvarwfl: {
        wireId: "ssclap",
        wire: "SS316L Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "dedicated",
        status: "pereche dedicată canonică; claritate, top-notes și layering"
      },
      asylum: {
        wireId: "k1clap",
        wire: "K1 Clapton 2×30+38",
        diam: "Ø2,5 mm",
        wraps: 5,
        tier: "compatible",
        status: "opțiune contextuală pentru corp, densitate și integrare; nu este pereche dedicată sau preferată"
      }
    }
  };

  if (typeof buildOutput !== "function") return;

  /* Autoritatea finală de compatibilitate Clapton este acest overlay. */
  const baseClaptonPlatformScore = typeof claptonPlatformScore === "function" ? claptonPlatformScore : null;
  if (baseClaptonPlatformScore) {
    claptonPlatformScore = function(atom, wireId) {
      if (atom && atom.id === "asylum" && wireId === "ssclap") return -100;
      return baseClaptonPlatformScore(atom, wireId);
    };
  }

  const baseWireBonus = typeof wireBonus === "function" ? wireBonus : null;
  const baseBuildOutput = buildOutput;
  const baseWhyForLiquid = typeof whyForLiquid === "function" ? whyForLiquid : null;
  const baseComparisonText = typeof comparisonText === "function" ? comparisonText : null;
  const baseExplorerVapeText = typeof explorerVapeText === "function" ? explorerVapeText : null;
  const baseGeometrySummary = typeof geometrySummary === "function" ? geometrySummary : null;

  const classText = liquid => String(liquid && liquid.class || "").toLowerCase();
  const objectiveNow = objective => String(objective || "complete");

  function profileFlags(ax, objective, liquid) {
    const cls = classText(liquid);
    return {
      complex: has(ax || [], "layers") || cls.includes("complex"),
      dark: ["dark", "burley", "kentucky", "latakia", "cigar"].some(key => has(ax || [], key)),
      rich: ["pipe", "sweet", "alcohol", "nuts", "coffeeCocoa"].some(key => has(ax || [], key)),
      drySimple: has(ax || [], "dry") || has(ax || [], "simple") || cls.includes("simplu"),
      objective: objectiveNow(objective)
    };
  }

  if (baseWireBonus) {
    wireBonus = function(atom, wire, ax, objective, liquid) {
      let bonus = baseWireBonus(atom, wire, ax, objective, liquid);
      if (!atom || !wire) return bonus;

      /* Excludere efectivă din triangulare și TOP 3 pe Asylum. */
      if (atom.id === "asylum" && wire.id === "ssclap") return -1000;

      const f = profileFlags(ax, objective, liquid);

      if (atom.id === "415" && wire.id === "k1clap") {
        bonus += 0.70;
        if (f.complex || f.dark || f.rich) bonus += 0.35;
        if (["body", "th", "complete"].includes(f.objective)) bonus += 0.25;
        if (f.objective === "tobacco" && f.drySimple) bonus -= 0.45;
      }

      if (atom.id === "asylum" && wire.id === "k1clap") {
        bonus += 0.15;
        if (f.dark || f.rich || f.objective === "body") bonus += 0.25;
      }

      return bonus;
    };
  }

  buildOutput = function(atom, wire, liquid) {
    const output = baseBuildOutput(atom, wire, liquid);
    if (!atom || !wire || !output) return output;

    if (atom.id === "chariot" && wire.id === "k1clap") {
      output.wraps = "5";
      output.status = "Pereche Clapton dedicată · Chariot · K1";
      output.noteClass = "valid";
      output.note = "K1 Clapton 2×30+38 · Ø2,5 mm · 5 spire este perechea dedicată pentru Chariot. Există validare directă pe Cronos Tab Plus, unde a ieșit #1 în watt; pe alte lichide, triangularea contextuală rămâne activă.";
      return output;
    }

    if (atom.id === "415" && wire.id === "k1clap") {
      output.wraps = "5";
      output.status = "Pereche Clapton preferată · 415 · K1";
      output.noteClass = "valid";
      output.note = "K1 Clapton 2×30+38 · Ø2,5 mm · 5 spire este perechea Clapton preferată pe 415 pentru corp, densitate, mouthfeel și integrarea profilelor complexe. Motorul îi acordă prior contextual mai mare pe dark/rich/complex și pe obiective body/TH/complete.";
      return output;
    }

    if (atom.id === "dvarwfl" && wire.id === "ssclap") {
      output.wraps = "5";
      output.status = "Pereche Clapton dedicată · Dvarw FL · SS";
      output.noteClass = "context";
      output.note = "SS316L Clapton 2×30+38 · Ø2,5 mm · 5 spire este perechea dedicată pentru Dvarw MTL FL, orientată spre claritate, top-notes și layering.";
      return output;
    }

    if (atom.id === "asylum" && wire.id === "k1clap") {
      output.wraps = "5";
      output.status = "Clapton contextual · Asylum V3 · K1";
      output.noteClass = "context";
      output.note = "K1 Clapton 2×30+38 · Ø2,5 mm · 5 spire rămâne opțiunea Clapton contextuală pe Asylum V3 când se caută corp, densitate și integrare.";
      return output;
    }

    return output;
  };

  if (baseWhyForLiquid) {
    whyForLiquid = function(wire, ax, objective, liquid) {
      const base = baseWhyForLiquid(wire, ax, objective, liquid);
      const atom = (typeof state !== "undefined" && state && state.atom) || null;
      if (!atom || !wire) return base;

      if (atom.id === "chariot" && wire.id === "k1clap") return "Chariot are K1 Clapton/5 ca pereche dedicată; lichidul și obiectivul decid intensitatea avantajului";
      if (atom.id === "415" && wire.id === "k1clap") return "415 are K1 Clapton/5 ca pereche preferată pentru corp, densitate, mouthfeel și integrare, cu bonus contextual pe profile dark/rich/complex";
      if (atom.id === "dvarwfl" && wire.id === "ssclap") return "Dvarw MTL FL are SS316L Clapton/5 ca pereche dedicată pentru claritate, top-notes și layering";
      if (atom.id === "asylum" && wire.id === "k1clap") return "Asylum V3 poate folosi K1 Clapton/5 contextual pentru corp și integrare";
      return base;
    };
  }

  if (baseComparisonText) {
    comparisonText = function(atom, wire, output) {
      const base = baseComparisonText(atom, wire, output);
      if (!atom || !wire) return base;

      if (atom.id === "chariot" && wire.id === "k1clap") return "+ pereche dedicată Chariot: K1 Clapton/5 pentru corp, densitate, mouthfeel și tutun complex; validare directă Cronos Tab Plus.";
      if (atom.id === "415" && wire.id === "k1clap") return "+ pereche preferată 415: corp, densitate și integrare; round-wire-ul rămâne disponibil pentru redare mai directă/dry.";
      if (atom.id === "dvarwfl" && wire.id === "ssclap") return "+ pereche dedicată Dvarw FL: SS316L Clapton/5 pentru claritate, top-notes, Oriental/Perique și layering.";
      if (atom.id === "asylum" && wire.id === "k1clap") return "+ opțiune contextuală Asylum pentru corp, densitate și integrare; nu este forțată ca #1.";
      return base;
    };
  }

  if (baseExplorerVapeText) {
    explorerVapeText = function(atom, wire, output) {
      if (!atom || !wire) return baseExplorerVapeText(atom, wire, output);

      if (atom.id === "chariot" && wire.id === "k1clap") return "PERECHE DEDICATĂ: K1 Clapton 2×30+38 / 5 spire; validare practică directă pe Cronos Tab Plus.";
      if (atom.id === "415" && wire.id === "k1clap") return "PERECHE PREFERATĂ: K1 Clapton 2×30+38 / 5 spire pentru corp, densitate, mouthfeel și integrare.";
      if (atom.id === "dvarwfl" && wire.id === "ssclap") return "PERECHE DEDICATĂ: SS316L Clapton 2×30+38 / 5 spire pentru claritate și layering.";
      if (atom.id === "asylum" && wire.id === "k1clap") return "CLAPTON CONTEXTUAL: K1 Clapton 2×30+38 / 5 spire pentru corp și integrare.";
      return baseExplorerVapeText(atom, wire, output);
    };
  }

  if (baseGeometrySummary) {
    geometrySummary = function(atom) {
      if (!atom) return baseGeometrySummary(atom);

      if (atom.id === "asylum") {
        const rule = BUILD_RULES[atom.id] || { k128: 5, k129: 6 };
        return `<div class="geometry-rule"><h5>Asylum V3 · ADN activ</h5><div class="geometry-grid geometry-grid-five"><span><b>K1 28 GA</b>${rule.k128} spire</span><span><b>K1 29 GA</b>${rule.k129} spire contact</span><span><b>K1 Clapton</b>2×30+38 · 5 spire · contextual</span><span><b>NiFe TC</b>6 spire · contextual</span></div><p>Flat rămâne orientat spre claritate/separare, iar Dome spre corp/integrare. Recomandarea se decide prin lichid + obiectiv + ADN platformă.</p></div>`;
      }

      return baseGeometrySummary(atom);
    };
  }

  /* Autoritate finală pentru Explorer: 415 păstrează K1 Clapton primul; Asylum exclude firul dezactivat. */
  if (typeof renderAtomExplorer === "function") {
    renderAtomExplorer = function() {
      const id = $("atomExplorer").value;
      const atom = ATOMS.find(item => item.id === id);
      const target = $("atomExplorerResult");
      if (!atom) {
        target.innerHTML = '<div class="empty">Selectează oricare dintre atomizoare pentru ADN-ul platformei și comparația buildurilor active.</div>';
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

      let orderedWires = atom.id === "asylum" ? WIRES.filter(wire => wire.id !== "ssclap") : [...WIRES];
      if (atom.id === "415") {
        const order = ["k1clap", "k128", "k129", "nife30", "ssclap"];
        orderedWires = orderedWires.sort((left, right) => order.indexOf(left.id) - order.indexOf(right.id));
      }

      const cards = orderedWires.map((wire, index) => {
        const output = buildOutput(atom, wire, neutralLiquid);
        const preferredClass = atom.id === "415" && wire.id === "k1clap";
        return `<article class="build explorer-build ${preferredClass ? "best" : wire.id === "k128" ? "baseline-build" : ""}">
          <div class="brow"><span class="rank ${index ? "alt" : ""}">${index + 1}</span><span class="wname">${escapeHtml(wire.name)}</span>${preferredClass ? '<span class="besttxt">PREFERINȚĂ PLATFORMĂ</span>' : ""}</div>
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
        <div class="explorer-tip"><b>Cum folosești rezultatul:</b> pe 415, K1 Clapton este afișat primul; pe celelalte platforme apar numai buildurile active și compatibilitatea este decisă de ADN-ul platformei.</div>`;
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const explorerText = document.querySelector(".explorer-panel .ptitle p");
    if (explorerText) explorerText.textContent = "Alege platforma și vezi ADN-ul ei și buildurile active. Pe 415, K1 Clapton este afișat primul; restul urmează regulile active de platformă.";
  });
})();
