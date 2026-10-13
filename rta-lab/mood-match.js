/* RTA MOOD MATCH · personal experience router.
 * Seven approved moods + five moments. All 16 platforms remain discoverable.
 * Heuristics are contextual suggestions, never absolute pleasure probabilities.
 */
(function () {
  "use strict";
  const core = window.RTA_SENSORY_CORE;
  const atoms = (window.RTA_CORE && window.RTA_CORE.atoms) || [];
  const catalog = window.RTA_LIQUIDS || [];
  if (!core || !atoms.length) return;

  const moods = [
    {id:"power", icon:"🔥", name:"POWER", subtitle:"Forță, ofensivă, throat hit", goal:"th", preferred:"Tutun simplu"},
    {id:"pleasure", icon:"❤️", name:"PURE PLEASURE", subtitle:"Aromă bogată, prezență pe palat", goal:"body", preferred:"Tutun complex"},
    {id:"magic", icon:"✨", name:"MAGIC & COMPLEXITY", subtitle:"Finețe, straturi, naturalețe", goal:"layers", preferred:"NET complex"},
    {id:"oldschool", icon:"🕰️", name:"OLD SCHOOL", subtitle:"Tutun clasic, direct, autentic", goal:"tobacco", preferred:"NET simplu"},
    {id:"chill", icon:"🌿", name:"CHILL & RELAX", subtitle:"Blând, rotund, fără grabă", goal:"smooth", preferred:"Tutun simplu"},
    {id:"allday", icon:"♾️", name:"ALL DAY", subtitle:"Echilibru care nu obosește", goal:"complete", preferred:"Tutun complex"},
    {id:"surprise", icon:"🎲", name:"SURPRISE ME", subtitle:"Redescoperă ceva din colecție", goal:"complete", preferred:"NET complex"}
  ];
  const moments = [
    {id:"coffee", icon:"☕", name:"La cafea", hint:"Un profil cu caracter"},
    {id:"day", icon:"☀️", name:"În timpul zilei", hint:"Consistență și echilibru"},
    {id:"juice", icon:"🥤", name:"La un suc", hint:"Contrast aromatic"},
    {id:"evening", icon:"🌙", name:"Seara", hint:"Bucurie și profunzime"},
    {id:"relax", icon:"🛋️", name:"În relaxare", hint:"Finețe și confort"}
  ];
  const liquidClasses = ["Tutun simplu","Tutun complex","NET simplu","NET complex"];
  const STORAGE_KEY = "rta-mood-match-v1";
  const getMood = id => moods.find(m => m.id === id);
  const getMoment = id => moments.find(m => m.id === id);
  const atomById = id => atoms.find(a => a.id === id);
  const escape = value => String(value == null ? "" : value).replace(/&/g,"&amp;")
    .replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
  const norm = value => String(value || "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const moodIndex = id => Math.max(0,moods.findIndex(x => x.id === id));
  const momentIndex = id => Math.max(0,moments.findIndex(x => x.id === id));

  function preferredClass(mood, moment) {
    const m = getMood(mood), t = getMoment(moment);
    if (!m || !t) return liquidClasses[0];
    if (m.id === "surprise") return liquidClasses[(moodIndex(mood) + momentIndex(moment)) % 4];
    // Moments influence which class is proposed, without overriding the chosen mood.
    if (t.id === "juice" && m.id === "pleasure") return "NET complex";
    if (t.id === "coffee" && m.id === "allday") return "Tutun simplu";
    return m.preferred;
  }

  function referenceLiquid(mood, moment, selectedIndex) {
    if (Number.isInteger(selectedIndex) && catalog[selectedIndex]) return catalog[selectedIndex];
    const group = catalog.filter(liquid => liquid.class === preferredClass(mood,moment));
    if (!group.length) return {class:preferredClass(mood,moment),name:"Profil orientativ"};
    return group[(moodIndex(mood)*19 + momentIndex(moment)*37) % group.length];
  }

  function momentAdjustment(result, momentId) {
    const d = result.dimensions;
    // Small transparent contextual biases, never claimed to be objective measurements.
    const momentWeights = {
      coffee:{energy:.08,architecture:.04},
      day:{harmony:.11},
      juice:{architecture:.10,palate:.03},
      evening:{palate:.10,architecture:.05},
      relax:{harmony:.13,energy:-.03}
    }[momentId] || {};
    return Object.entries(momentWeights).reduce((sum,entry) =>
      sum + ((d[entry[0]] || 3.5) - 3.5) * entry[1], 0);
  }

  function recommend(moodId, momentId, selectedIndex = -1) {
    const mood = getMood(moodId), moment = getMoment(momentId);
    if (!mood || !moment) return null;
    const liquid = referenceLiquid(moodId, momentId, selectedIndex);
    const ranked = atoms.map(atom => {
      const best = core.rankBuilds(atom.id, liquid, mood.goal)[0];
      return best ? {id:atom.id, atom, best,
        score:best.rankScore + momentAdjustment(best,momentId)} : null;
    }).filter(Boolean).sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));
    if (ranked.length < 3) return {mood, moment, liquid, ranked, picks:[]};
    const primary = moodId === "surprise"
      ? ranked[(moodIndex(moodId) + momentIndex(momentId)*3) % Math.min(7,ranked.length)]
      : ranked[0];
    const other = ranked.find(x => x.id !== primary.id &&
      core.platforms[x.id].pattern !== core.platforms[primary.id].pattern)
      || ranked.find(x => x.id !== primary.id);
    // Deterministic exploration walks the entire collection across 7 × 5 contexts.
    // It is explicitly labelled exploration, not superior suitability.
    const slot = (momentIndex(momentId)*moods.length + moodIndex(moodId)) % atoms.length;
    let discovery = null;
    for (let i=0;i<atoms.length;i++) {
      const candidate = atomById(atoms[(slot+i)%atoms.length].id);
      if (candidate && candidate.id !== primary.id && candidate.id !== other.id) {
        discovery = ranked.find(x => x.id === candidate.id);
        break;
      }
    }
    return {mood, moment, liquid, ranked,
      picks:[{...primary,role:"Potrivirea de moment",roleType:"match"},
        {...other,role:"O altă interpretare",roleType:"alternate"},
        {...discovery,role:"Redescoperă colecția",roleType:"discover"}]};
  }

  function autoLiquid(atomId, mood, moment, role, used) {
    const sample = core.defaultConfig(atomId);
    const offers = core.matchLiquids(sample,catalog,mood.goal,48);
    const cls = preferredClass(mood.id,moment.id);
    let group = offers.filter(x => x.liquid.class === cls && !used.has(x.index));
    if (role === "discover" && !group.length) {
      group = offers.filter(x => !used.has(x.index));
    }
    if (!group.length) group = offers.filter(x => !used.has(x.index));
    if (!group.length) group = offers;
    if (!group.length) return {index:-1,liquid:referenceLiquid(mood.id,moment.id,-1)};
    const seed = moodIndex(mood.id)*7 + momentIndex(moment.id)*11 +
      (role === "discover" ? 5 : role === "alternate" ? 2 : 0);
    const chosen = group[seed % Math.min(group.length,7)];
    used.add(chosen.index);
    return chosen;
  }

  function configurationDetails(atomId, liquid, goal) {
    const result = core.rankBuilds(atomId,liquid,goal)[0];
    if (!result) return null;
    const config = result.config, tech = core.platforms[atomId];
    const bellConfig = window.RTA_BELL_LIQUID_FIT &&
      window.RTA_BELL_LIQUID_FIT.config(atomId);
    const bell = bellConfig && bellConfig.bells.find(x => x.id === config.bell);
    const air = tech && tech.air.find(x => x.id === config.air);
    const wire = core.wires[config.wire];
    return {result, config, bell:bell && bell.name || "Standard",
      air:air && air.label || "Configurare existentă",wire:wire && wire.name || config.wire,
      mode:wire && wire.type === "tc"
        ? "TC " + config.temp + "°C · limită " + config.power + " W"
        : config.power + " W"};
  }

  const state = {mood:null,moment:null,source:"auto",selectedIndex:-1};
  function restore() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)||"{}");
      if (getMood(saved.mood)) state.mood = saved.mood;
      if (getMoment(saved.moment)) state.moment = saved.moment;
      if (saved.source === "manual") state.source = "manual";
      if (Number.isInteger(saved.selectedIndex) && catalog[saved.selectedIndex]) {
        state.selectedIndex=saved.selectedIndex;
      }
    } catch(error) { /* Private mode/storage denied is fine. */ }
  }
  function remember() {
    try {window.localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
    catch(error) { /* App must function without storage. */ }
  }

  function shell(root) {
    root.innerHTML =
      '<div class="mm-head"><span class="mm-eyebrow">RTA MOOD MATCH · PERSONAL</span>'+
      '<h3 id="moodTitle">Alege experiența, nu câștigătorul.</h3>'+
      '<p>Toate cele 16 platforme din colecție au personalitate. Spune ce stare ai, alege momentul, apoi descoperă trei interpretări — fără verdicte definitive.</p></div>'+
      '<div class="mm-progress"><span>01 · MOOD</span><span>02 · MOMENT</span><span>03 · LICHID</span></div>'+
      '<section class="mm-stage"><h4>1. Ce stare ai acum?</h4><div id="mmMoods" class="mm-moods" role="group" aria-label="Alege starea"></div></section>'+
      '<section id="mmStageMoment" class="mm-stage" hidden><h4>2. Care este momentul?</h4>'+
      '<div id="mmMoments" class="mm-moments" role="group" aria-label="Alege momentul"></div></section>'+
      '<section id="mmStageLiquid" class="mm-stage" hidden><h4>3. Ce explorăm?</h4>'+
      '<div class="mm-source" role="group" aria-label="Alegerea lichidului">'+
      '<button type="button" data-mm-source="auto">✨ Recomandă-mi un lichid</button>'+
      '<button type="button" data-mm-source="manual">🔎 Am deja un lichid</button></div>'+
      '<div id="mmManual" class="mm-manual" hidden>'+
      '<label for="mmSearch">Caută în toate cele 620 de lichide</label>'+
      '<input type="search" id="mmSearch" autocomplete="off" placeholder="Brand, nume, aromă, NET…">'+
      '<div id="mmSuggestions" class="mm-suggestions" aria-live="polite"></div></div>'+
      '<p class="mm-method">Potrivirile sunt <b>ipoteze senzoriale</b> bazate pe modelul RTA și observațiile tale validate. „Redescoperă” este o alternativă exploratorie, nu un loc 3 absolut.</p></section>'+
      '<div id="mmResults" class="mm-results" aria-live="polite"></div>'+
      '<details id="mmCollection" class="mm-collection" hidden>'+
      '<summary>Toate cele 16 platforme · explorează liber colecția</summary>'+
      '<div id="mmCollectionGrid" class="mm-collection-grid"></div></details>';
  }

  function drawMood() {
    const box=document.getElementById("mmMoods");
    if (!box) return;
    box.innerHTML=moods.map(m =>
      '<button type="button" class="mm-mood'+(state.mood===m.id?' selected':'')+
      '" data-mm-mood="'+m.id+'" aria-pressed="'+(state.mood===m.id)+'">'+
      '<span class="mm-icon" aria-hidden="true">'+m.icon+'</span><span class="mm-mood-text">'+
      '<strong>'+escape(m.name)+'</strong><small>'+escape(m.subtitle)+'</small></span></button>'
    ).join("");
  }
  function drawMoment() {
    const stage=document.getElementById("mmStageMoment");
    if (!stage) return;
    stage.hidden=!state.mood;
    const box=document.getElementById("mmMoments");
    box.innerHTML=moments.map(m =>
      '<button type="button" class="mm-moment'+(state.moment===m.id?' selected':'')+
      '" data-mm-moment="'+m.id+'" aria-pressed="'+(state.moment===m.id)+'">'+
      '<span aria-hidden="true">'+m.icon+'</span><span><strong>'+escape(m.name)+
      '</strong><small>'+escape(m.hint)+'</small></span></button>'
    ).join("");
  }
  function drawSource() {
    const stage=document.getElementById("mmStageLiquid");
    if (!stage) return;
    stage.hidden=!state.mood||!state.moment;
    stage.querySelectorAll("[data-mm-source]").forEach(button => {
      const on=button.dataset.mmSource===state.source;
      button.classList.toggle("selected",on);
      button.setAttribute("aria-pressed",String(on));
    });
    document.getElementById("mmManual").hidden=state.source!=="manual";
  }
  function liquidName(liquid) {
    return [liquid.brand,liquid.name].filter(Boolean).join(" · ");
  }
  function drawSuggestions() {
    const input=document.getElementById("mmSearch"), list=document.getElementById("mmSuggestions");
    if (!input || !list) return;
    const q=norm(input.value.trim());
    if (q.length < 2) {
      list.innerHTML='<p class="mm-hint">Introdu cel puțin 2 caractere pentru a căuta în catalog.</p>';
      return;
    }
    const hits=[];
    for(let i=0;i<catalog.length && hits.length<15;i++) {
      const l=catalog[i];
      if (norm([l.brand,l.name,l.class,l.profile,(l.tags||[]).join(" ")].join(" ")).includes(q))
        hits.push({index:i,liquid:l});
    }
    list.innerHTML=hits.length?hits.map(x =>
      '<button type="button" data-mm-liquid="'+x.index+'">'+
      '<strong>'+escape(liquidName(x.liquid))+'</strong><small>'+
      escape(x.liquid.class)+'</small></button>').join("")
      :'<p class="mm-hint">Nicio potrivire. Încearcă alt termen.</p>';
  }
  function resultCard(pick, choice, ordinal) {
    const atom=atomById(pick.id);
    const details=configurationDetails(pick.id,choice.liquid,getMood(state.mood).goal);
    if (!atom || !details) return "";
    const {result,config,wire,air,bell,mode}=details;
    const reason=result.advantages && result.advantages[0] || "Personalitate distinctă a platformei.";
    const compromise=result.tradeoffs && result.tradeoffs[0] || "Necesită o probă practică.";
    const verified=result.anchors && result.anchors.length;
    return '<article class="mm-result">'+
      '<div class="mm-card-top"><span class="mm-num">'+ordinal+'</span><span class="mm-role">'+
      escape(pick.role)+'</span></div>'+
      '<h5>'+escape(atom.short)+'</h5>'+
      '<div class="mm-liquid-name">'+escape(liquidName(choice.liquid))+'</div>'+
      '<div class="mm-class">'+escape(choice.liquid.class)+'</div>'+
      '<div class="mm-specs"><span><b>Clopot</b> '+escape(bell)+'</span>'+
      '<span><b>Airflow</b> '+escape(air)+'</span>'+
      '<span><b>Build</b> '+escape(wire)+' · Ø'+
      escape(String(config.coilMm).replace(".",","))+' mm · '+config.wraps+' spire</span>'+
      '<span><b>Regim</b> '+escape(mode)+'</span></div>'+
      '<p class="mm-reason"><b>De ce:</b> '+escape(reason)+'</p>'+
      '<p class="mm-compromise"><b>Compromis:</b> '+escape(compromise)+'</p>'+
      '<p class="mm-certainty">'+(verified?'Observație personală relevantă + extrapolare':'Estimare tehnică orientativă')+
      '</p><button type="button" class="mm-use" data-mm-use="'+escape(pick.id)+
      '" data-mm-use-liquid="'+choice.index+'">Deschide configurația ↗</button></article>';
  }
  function drawResults() {
    const box=document.getElementById("mmResults");
    const collection=document.getElementById("mmCollection");
    if (!box||!collection) return;
    if (!state.mood||!state.moment) {box.innerHTML="";collection.hidden=true;return;}
    if (state.source==="manual" && !catalog[state.selectedIndex]) {
      box.innerHTML='<p class="mm-hint mm-await">Selectează un lichid din rezultate ca să construim cele trei experiențe.</p>';
      collection.hidden=false;drawCollection(null);return;
    }
    const idx=state.source==="manual"?state.selectedIndex:-1;
    const decision=recommend(state.mood,state.moment,idx);
    if (!decision || decision.picks.length!==3) {
      box.innerHTML='<p class="mm-hint">Nu pot calcula acum recomandările. Verifică datele catalogului.</p>';
      collection.hidden=false;drawCollection(decision);return;
    }
    const used=new Set(), choices=decision.picks.map(p =>
      idx>=0 ? {index:idx,liquid:catalog[idx]} :
      autoLiquid(p.id,decision.mood,decision.moment,p.roleType,used));
    box.innerHTML='<div class="mm-result-heading"><h4>Trei feluri de a te bucura de colecție</h4>'+
      '<p>'+escape(decision.mood.name)+' · '+escape(decision.moment.name)+
      ' · '+(idx>=0?'lichidul ales de tine':'lichide propuse din catalog')+'</p></div>'+
      '<div class="mm-result-grid">'+decision.picks.map((p,i) => resultCard(p,choices[i],i+1)).join("")+'</div>';
    collection.hidden=false;
    drawCollection(decision);
  }
  function drawCollection(decision) {
    const box=document.getElementById("mmCollectionGrid");
    if (!box) return;
    const ids=decision ? decision.ranked.map(r=>r.id) : atoms.map(a=>a.id);
    box.innerHTML=ids.map(id => {
      const atom=atomById(id);
      return '<button type="button" data-mm-atom="'+escape(id)+'">'+
        '<strong>'+escape(atom.short)+'</strong><small>Deschide în Explorer ↗</small></button>';
    }).join("");
  }
  function draw() {drawMood();drawMoment();drawSource();drawSuggestions();drawResults();}
  function init() {
    const root=document.getElementById("moodMatch");
    if(!root)return;
    shell(root);
    restore();
    draw();
    root.addEventListener("click",event=>{
      const button=event.target.closest("button");
      if (!button || !root.contains(button)) return;
      const d=button.dataset;
      if (d.mmMood) {state.mood=d.mmMood;remember();draw();return;}
      if (d.mmMoment) {state.moment=d.mmMoment;remember();draw();return;}
      if (d.mmSource) {state.source=d.mmSource;remember();drawSource();drawResults();return;}
      if (d.mmLiquid!=null) {
        const idx=Number(d.mmLiquid);
        if (catalog[idx]) {state.selectedIndex=idx;remember();drawResults();}
        return;
      }
      if (d.mmUse) {
        const index=Number(d.mmUseLiquid);
        if (Number.isInteger(index) && catalog[index] &&
          window.RTA_SENSORY_UI && window.RTA_SENSORY_UI.applyLiquid) {
          window.RTA_SENSORY_UI.applyLiquid(index,d.mmUse);
          document.getElementById("labLiquidView").scrollIntoView({behavior:"smooth",block:"start"});
        }
        return;
      }
      if (d.mmAtom) {
        const picker=document.getElementById("atomExplorer");
        if (!picker)return;
        picker.value=d.mmAtom;
        picker.dispatchEvent(new Event("change",{bubbles:true}));
        if (window.RTA_SENSORY_UI)window.RTA_SENSORY_UI.switchMode("explorer");
        document.getElementById("labExplorerView").scrollIntoView({behavior:"smooth",block:"start"});
      }
    });
    const search=document.getElementById("mmSearch");
    search.addEventListener("input",drawSuggestions);
  }
  window.RTA_MOOD_MATCH={moods,moments,preferredClass,recommend,configurationDetails};
  if(typeof document !== "undefined")document.addEventListener("DOMContentLoaded",init);
})();
