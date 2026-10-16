/* Atlas adapters. Canonical engines and personal storage are never rewritten. */
(function(){
"use strict";
const core=window.RTA_SENSORY_CORE,fit=window.RTA_BELL_LIQUID_FIT,api=window.RTA_ATLAS_PREVIEW;
if(!core||!fit||!api)return;
const atoms=window.RTA_CORE.atoms,catalog=window.RTA_LIQUIDS;
const inventory={"415":1,kprime:2,gtone:4,dvarwcl:3,muted:4,gtr:5,dvarwfl:2,diplomat:3,kx:4,klp:5,asylum:2,pmfree:2,pmstd:2,byka:1,kv3:1,minister:1};
const objectives=[['complete','Armonie + palat'],['layers','Stratificare'],['th','Ofensivă + TH'],['tobacco','Tutun în prim-plan'],['body','Corp + densitate'],['smooth','Finețe']];
const state={atom:'gtr',query:'',category:'all',config:core.defaultConfig('gtr'),objective:'layers',goalLocked:false,liquidsOpen:false,advanced:false,wirePlatformChosen:false,wireChosen:false};
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const el=id=>document.getElementById(id);
const liquid=()=>api.currentLiquid();
const atom=id=>atoms.find(a=>a.id===id);
const name=id=>atom(id)?.short||id;
const objectiveLabel=id=>objectives.find(x=>x[0]===id)?.[1]||id;
function patternLabel(id){
 const cfg=id===state.atom?state.config:core.defaultConfig(id);
 const pattern=core.platforms[id].air.find(a=>a.id===cfg.air)?.pattern||core.platforms[id].pattern;
 return {single:'Un jet',dual:'Două canale',multipoint:'Multipunct',aerokon:'AEROKON',hybrid:'Aer hibrid',diverter:'Aer deviat'}[pattern]||pattern;
}
function contextual(id=state.atom){
 if(!core.platforms[id]||!liquid())return null;
 const config=id===state.atom?state.config:core.defaultConfig(id);
 const result=core.analyze(config,liquid(),state.objective);
 const builds=core.rankBuilds(id,liquid(),state.objective,{bell:config.bell,air:config.air,coilMm:config.coilMm,position:config.position}).slice(0,3);
 return {atom:atom(id),config,result,builds};
}
function clSnapshot(storage){
 try{
  if(arguments.length===0)storage=window.localStorage;
  const raw=storage?.getItem('rta-cl-physical-units-v1-20261014');
  if(!raw){
   const units=Array.from({length:3},()=>({saved:null,draft:null}));
   const old=JSON.parse(storage?.getItem('rta-sensory-dna-choice-20261013')||'{}');
   if(old.dvarwcl&&typeof old.dvarwcl==='object'){units[0].draft={...old.dvarwcl,atom:'dvarwcl'};units[0].source='legacy';}
   return {available:!!storage,units};
  }
  const data=JSON.parse(raw);
  if(data.schema!==1||!Array.isArray(data.units)||data.units.length!==3)throw new Error('format');
  if(data.units.some(u=>!u||['saved','draft'].some(k=>u[k]&&(typeof u[k]!=='object'||Array.isArray(u[k])||(u[k].atom&&u[k].atom!=='dvarwcl')))))throw new Error('unit');
  return {available:true,units:data.units.map(u=>({saved:u?.saved||null,draft:u?.draft||null,source:u?.source||null}))};
 }catch(e){return {available:false,units:[],error:'Stocarea nu este accesibilă sau formatul necesită verificare în configuratorul clasic.'};}
}
function filteredAtoms(query=state.query,category=state.category){
 const q=String(query).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return atoms.filter(a=>{
  const txt=[a.short,a.airflow?.system,core.platforms[a.id]?.note].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(window.RTA_ATLAS_SEARCH?!window.RTA_ATLAS_SEARCH.matchesText(txt,q):!txt.includes(q))return false;
  if(category==='all')return true;
  return fit.analyze(a,fit.config(a.id).defaultId,catalog).classes.slice(0,2).some(c=>c.name===category);
 });
}
function selectAtom(id){
 if(!atom(id)||!core.platforms[id])return false;
 state.atom=id;state.config=core.defaultConfig(id);state.liquidsOpen=false;return true;
}
function setConfig(changes){
 if(changes.wire){
  const variant=core.variants(state.atom).find(v=>v.wire===changes.wire);
  if(!variant)return false;
  const preset=core.wireSetup(state.atom,changes.wire);
  changes={...changes,wraps:variant.wraps,power:preset.power,temp:preset.temp};
 }
 if(changes.wraps&&!core.permitted(state.atom,changes.wire||state.config.wire,Number(changes.wraps)))return false;
 state.config=core.config(state.atom,{...state.config,...changes});state.liquidsOpen=false;return !!state.config;
}
function options(rows,value){return rows.map(([id,label])=>'<option value="'+esc(id)+'"'+(String(id)===String(value)?' selected':'')+'>'+esc(label)+'</option>').join('');}
function select(label,id,rows,value){return '<label>'+esc(label)+'<select id="'+id+'">'+options(rows,value)+'</select></label>';}
function hasLiquid(){return !api.state.fromDemo||!!api.state.freeProfile;}
function workflow(steps){return '<ol class="flow-steps" aria-label="Pașii instrumentului">'+steps.map((s,i)=>'<li><b>'+String(i+1)+'</b><span>'+esc(s)+'</span></li>').join('')+'</ol>';}
function contextBar(){
 const mood=window.RTA_MOOD_MATCH.moods.find(m=>m.id===api.state.mood),moment=window.RTA_MOOD_MATCH.moments.find(m=>m.id===api.state.moment);
 return '<div class="atlas-context"><span>'+esc(hasLiquid()?[liquid()?.brand,liquid()?.name].filter(Boolean).join(' · ')+' · '+objectiveLabel(api.effectiveGoal()):'Niciun lichid ales. Alege din catalog sau din topul potrivirilor.')+'</span><details class="context-settings"><summary>Stare: '+esc(mood?.name)+' · Moment: '+esc(moment?.name)+' · Modifică</summary><div class="module-filters"><label>Starea ta<select data-context-field="mood">'+options(window.RTA_MOOD_MATCH.moods.map(x=>[x.id,x.name]),api.state.mood)+'</select></label><label>Momentul<select data-context-field="moment">'+options(window.RTA_MOOD_MATCH.moments.map(x=>[x.id,x.name]),api.state.moment)+'</select></label></div></details></div>';
}
function heading(kicker,title,description){return '<div class="module-intro"><span class="eyebrow">'+kicker+'</span><h1>'+title+'</h1><p>'+description+'</p></div>';}
function metricPanel(result){
 if(!hasLiquid())return '<p class="module-note choice-needed">Alege un lichid pentru profilul senzorial și buildurile personalizate. Topul de cinci de mai jos poate fi explorat înaintea alegerii.</p>'; 
 return '<div class="atlas-dna">'+core.dimensions.map(d=>{
  if(d.id==='pleasure')return '<div class="dna-row"><span>'+esc(d.title)+'</span><strong>'+esc(result.pleasure||result.personalPreference?.label||'În așteptarea unui A/B')+'</strong><small>Observație sau preferință personală; fără scor predictiv.</small></div>';
  const value=result.dimensions[d.id];
  return '<div class="dna-row"><span>'+esc(d.title)+'</span><strong>'+esc(result.labels[d.id])+'</strong><div class="dna-scale" aria-hidden="true">'+[1,2,3,4,5].map(n=>'<i class="'+(value>=n-.3?'lit':'')+'"></i>').join('')+'</div></div>';
 }).join('')+'<p class="module-note">Model calitativ orientativ. Barele nu sunt măsurători sau procente de plăcere.</p></div>';
}
function method(result){
 if(!hasLiquid())return ''; 
 return '<details class="module-method"><summary>De ce propune această configurație?</summary><p>'+esc(api.evidenceFor(result,liquid()).label)+'</p>'+result.notes.map(n=>'<p>'+esc(n)+'</p>').join('')+'<p>'+esc(result.modelWarning)+'</p></details>';
}
function watchPanel(builds){
 if(!hasLiquid())return ''; 
 return '<div class="watchlist"><div class="watch-item"><b>WATCH A / din experiența ta</b><p>'+esc(builds[1]?'Merită comparat '+api.buildString(builds[1])+'. Este o direcție contextuală, nu A/B confirmat pe lichidul ales.':'Nu există altă combinație compatibilă documentată.')+'</p></div><div class="watch-item market"><b>WATCH B / din piață</b><p>'+(window.RTA_ATLAS_MARKET?.watch(liquid())||'Semnal de piață insuficient pentru această configurație. Sursele vor fi legate numai după verificare.')+'</p></div></div>';
}
function storedBuild(raw){
 if(!raw)return 'Niciun montaj declarat';
 const wire=core.wires[raw.wire]?.name||'Material neprecizat',wraps=Number.isFinite(Number(raw.wraps))&&Number(raw.wraps)>0?raw.wraps+' spire':'Spire neprecizate',air=core.platforms.dvarwcl.air.find(a=>a.id===raw.air)?.label||'Airflow neprecizat';
 return wire+' · '+wraps+' · '+air;
}
function sameStored(a,b){const keys=[...new Set([...Object.keys(a||{}),...Object.keys(b||{})])].sort();return keys.every(k=>JSON.stringify(a?.[k])===JSON.stringify(b?.[k]));}
function physicalUnits(id){
 if(id!=='dvarwcl')return '<div class="physical-units"><h3>'+inventory[id]+' '+(inventory[id]===1?'exemplar fizic':'exemplare fizice')+'</h3><p>Inventar confirmat. Configurațiile individuale nu sunt presupuse identice sau montate.</p></div>';
 const snapshot=clSnapshot();
 return '<div class="physical-units"><h3>Cele trei Dvarw CL</h3>'+(!snapshot.available?'<p role="status">'+esc(snapshot.error||'Stocare indisponibilă')+'</p>':snapshot.units.map((u,i)=>'<div class="unit-row"><b>CL '+(i+1)+'</b><span>'+esc(u.saved?'Înregistrat'+(u.draft&&!sameStored(u.draft,u.saved)?' · modificări nesalvate':''):u.draft?'Proiect nesalvat':'Neînregistrat')+'</span><small>'+esc(storedBuild(u.saved||u.draft))+'</small></div>').join(''))+'<p>Fișele sunt citite din același browser, fără rescriere. Montajele declarate sunt păstrate separat pentru fiecare exemplar; explorarea de aici nu le rescrie.</p></div>';
}
function catalogCards(){
 const rows=filteredAtoms();
 return '<p class="module-note" role="status">'+rows.length+' din 16 platforme · 42 exemplare în colecție</p><div class="atlas-catalog">'+rows.map(a=>'<button type="button" class="platform-tile'+(a.id===state.atom?' selected':'')+'" data-platform="'+a.id+'" aria-pressed="'+(a.id===state.atom)+'"><span class="platform-photo">'+api.renderProductPhoto(a)+'</span><strong>'+esc(a.short)+'</strong><small>'+inventory[a.id]+' '+(inventory[a.id]===1?'exemplar':'exemplare')+' · '+esc(patternLabel(a.id))+'</small></button>').join('')+'</div>'+(rows.length?'':'<p>Nu există platforme care corespund filtrului. Schimbă căutarea sau categoria.</p>');
}
function renderCatalog(){const host=el('atlasCatalog');if(host)host.innerHTML=catalogCards();}
function topLiquids(prefix){
 const rows=window.RTA_ATLAS_SEARCH.top(state.config,state.objective);
 return '<section class="module-section top-liquid-section" id="'+prefix+'TopLiquids"><span class="eyebrow">DIN CELE '+catalog.length+' REPERE</span><h2>Primele 5 lichide pentru acest build.</h2><p class="module-note">'+esc(name(state.atom)+' · '+core.wires[state.config.wire].name+' · '+objectiveLabel(state.objective))+'. Recalculate pentru configurația afișată. În top intră doar produsele cu profil suficient documentat; potrivirea rămâne estimată din model.</p><ol class="top-liquid-list">'+rows.map((r,i)=>'<li><button type="button" data-context-liquid="'+r.index+'"><span class="top-liquid-rank">0'+(i+1)+'</span><span><b>'+esc(window.RTA_ATLAS_SEARCH.label(r.liquid))+'</b><small>'+esc(r.liquid.class+' · '+r.liquid.profile)+'</small></span></button></li>').join('')+'</ol></section>';
}

function compatibleWireAtoms(wire){return atoms.filter(a=>core.variants(a.id).some(v=>v.wire===wire));}
function wireConfig(id,wire){if(id===state.atom&&wire===state.config.wire)return {...state.config};const base=id===state.atom?state.config:core.defaultConfig(id),variants=core.variants(id).filter(v=>v.wire===wire),v=((id==='gtr'||id==='415')&&wire==='nife30'?variants.find(v=>v.wraps===7):id==='415'&&wire==='k128'?variants.find(v=>v.wraps===6):variants.find(v=>v.wraps===base.wraps))||variants[0];return v?core.config(id,{...base,...v,...core.wireSetup(id,wire)}):null;}
function wireIdentity(wire){const w=core.wires[wire];return w.type==='tc'?'Control de temperatură · '+(wire==='nife30'?'NiFe30 / TCR320':'NiFe52 / TCR310')+' · preseturi proprii fiecărei platforme.':w.type==='clapton'?'Clapton 2×30+38 · regim WATT în configurațiile Lab.':'Fir rotund · Ø '+String(w.diameter).replace('.',',')+' mm · regim WATT.';}
function liquidButtons(cfg){return window.RTA_ATLAS_SEARCH.top(cfg,state.objective).map((r,i)=>'<button type="button" data-journey-liquid="'+r.index+'" data-journey-wire="'+cfg.wire+'" data-journey-atom="'+cfg.atom+'"><span>0'+(i+1)+'</span><b>'+esc(window.RTA_ATLAS_SEARCH.label(r.liquid))+'</b><small>'+esc(r.liquid.class)+'</small></button>').join('');}

/* The platform's own confirmed personal choices come first; remaining materials
 * are computed from the existing engine for the current atomizer/goal/context.
 * Distinct wires mean distinct physical materials, including both NiFe alloys. */
const PERSONAL_LEADS=Object.freeze({
 "415":[["nife30",7],["nife52",6],["k128",6]],
 gtr:[["nife30",7],["nife52",6],["k128",5]],
 klp:[["nife30",6],["nife52",6],["k128",5]],
 kprime:[["nife30",6],["nife52",6],["k129",5]],
 kx:[["nife30",6],["nife52",6],["k128",5]],
 gtone:[["k129",6],["k128",5]],muted:[["k128",6]],
 dvarwcl:[["k128",6,"triple06"]],
 dvarwfl:[["k128",6,"triple06"],["ssclap",5,"single12"]],
 asylum:[["k128",6]],kv3:[["k128",6],["k129",6]]
});
function buildLeads(id=state.atom){
 const base=id===state.atom?state.config:core.defaultConfig(id),out=[],used=new Set();
 if(!base)return [];
 function add(wire,wraps,air,source){
  if(!core.wires[wire]||used.has(wire)||!core.permitted(id,wire,wraps))return;
  const cfg=core.config(id,{...base,wire,wraps,air:air||base.air,...core.wireSetup(id,wire)});
  if(cfg.wire!==wire||cfg.wraps!==wraps)return;
  used.add(wire);out.push({config:cfg,source});
 }
 for(const [wire,wraps,air] of PERSONAL_LEADS[id]||[])add(wire,wraps,air,"personal");
 const profile=hasLiquid()?liquid():{name:"Profil tehnic neutru",class:"Tutun simplu",tags:[]};
 for(const item of core.rankBuilds(id,profile,hasLiquid()?state.objective:"complete",{
  bell:base.bell,air:base.air,coilMm:base.coilMm,position:base.position
 })){
  if(out.length===3)break;
  add(item.config.wire,item.config.wraps,null,"model");
 }
 return out.slice(0,3);
}
function buildFacts(config){
 const w=core.wires[config.wire],a=core.platforms[config.atom].air.find(x=>x.id===config.air);
 const bell=fit.config(config.atom)?.bells?.find(x=>x.id===config.bell);
 const energy=w.type==="tc"?"TC "+config.temp+"°C (setare) · plafon "+config.power+" W":"WATT "+config.power+" W (preset)";
 const facts=[["Coil",config.wraps+" spire · Ø"+String(config.coilMm).replace(".",",")+" mm"],
  ["Insert / aer",a?.label||"Necunoscut"],["Clopot",bell?.name||"Original"],
  ["Regim",energy],["Poziție",{low:"Jos",standard:"Standard",high:"Sus"}[config.position]||"Standard"]];
 return '<dl class="material-build-facts">'+facts.map(([key,val])=>
  '<div><dt>'+esc(key)+'</dt><dd>'+esc(val)+'</dd></div>').join("")+"</dl>";
}
function materialPaths(){
 const leads=buildLeads(),chosen=state.config,profile=liquid();
 const isCurrent=leads.some(({config})=>["wire","wraps","air","bell","coilMm","position","power","temp"].every(k=>config[k]===chosen[k]));
 return '<section class="module-section material-paths" id="atlasBuilds">'+
 '<span class="eyebrow">MATERIALELE TALE / CONSTRUCȚII COMPLETE</span><h2>Primele trei builduri pentru acest atomizor.</h2>'+
 '<p class="module-note">Prioritate pentru configurațiile tale confirmate. Unde nu sunt trei preferințe stabilite, motorul completează cu propuneri tehnice potrivite platformei. Nicio propunere netestată nu este prezentată drept test personal. Setările W/TC sunt preseturi când nu avem măsurători.</p>'+
 '<div class="material-path-grid">'+leads.map(({config,source},i)=>{
  const r=core.analyze(config,profile,state.objective),w=core.wires[config.wire];
  return '<article class="material-path" data-build-wire="'+esc(config.wire)+'" data-build-wraps="'+config.wraps+'" data-build-air="'+esc(config.air)+'">'+
  '<span class="eyebrow">0'+(i+1)+' · '+(source==="personal"?"PREFERINȚĂ PERSONALĂ":"PROPUNERE TEHNICĂ")+' · '+esc(w.mode)+'</span>'+
  '<h3>'+esc(w.name)+'</h3><div class="material-schematic">'+api.renderCoil(config)+'</div>'+
  buildFacts(config)+
  '<p class="module-note">'+esc(source==="personal"?"Montaj sau prioritate declarată de tine; detaliile A/B și limitele probelor rămân în fișa tehnică.":"Alegere estimată din modelul platformei și obiectiv; nu un A/B efectuat de tine.")+'</p>'+
  (hasLiquid()?'<p>'+esc(api.vapeDescription(r,profile))+'</p><p class="module-note"><b>Accent:</b> '+esc(r.advantages.slice(0,2).join(" · "))+' · <b>Compromis:</b> '+esc(r.tradeoffs[0]||"Verifică practic")+'</p>':'<p class="module-note">Alege un lichid doar pentru evaluarea senzorială; configurația completă este deja afișată.</p>')+
  '<button type="button" class="module-link" data-atlas-build="'+esc(encodeURIComponent(JSON.stringify(config)))+'">Deschide buildul exact în Wire Lab ↗</button>'+
  '<details class="wire-liquid-links"><summary>5 lichide potrivite cu acest build</summary><div class="journey-liquid-list">'+liquidButtons(config)+'</div><p class="module-note">Potriviri calculate dintre cele '+catalog.length+' de lichide; nu teste personale.</p></details></article>';
 }).join("")+'</div>'+
 (!isCurrent?'<div class="material-current"><strong>Configurația ta selectată, în afara primelor trei</strong>'+buildFacts(chosen)+'<button type="button" class="module-link" data-atlas-build="'+esc(encodeURIComponent(JSON.stringify(chosen)))+'">Deschide configurația selectată ↗</button></div>':'')+
 (hasLiquid()?api.comparisonGraphic(leads.map(({config})=>({label:core.wires[config.wire].name+" / "+config.wraps+" spire",result:core.analyze(config,profile,state.objective)})),"Comparație pe același lichid"):"")+
 '<p class="module-note">Alte materiale, spire, inserturi și alternative validate sunt disponibile în Wire Lab, fără rescrierea fișelor unităților fizice.</p></section>';
}

function wirePalette(){return '<div class="wire-family-grid">'+Object.entries(core.wires).map(([id,w])=>'<button type="button" class="wire-family-card" data-wire-family="'+id+'"><span class="eyebrow">'+esc(w.mode)+'</span><b>'+esc(w.name)+'</b><span class="material-schematic">'+(id==='nife30'?'<img src="./media/dicodes-resistherm-nife30.jpg" alt="Dicodes RESISTHERM NiFe30 — fotografie de produs, ambalaj de referință" loading="lazy" width="500" height="333">':api.renderCoil(wireConfig('gtr',id)))+'</span><small>'+esc(wireIdentity(id))+'</small><span>Alege această sârmă ↗</span></button>').join('')+'</div>';}
function platformReaction(id){if(!hasLiquid())return '<p class="module-note">Alege lichidul comun pentru descrierea reacției senzoriale. Poți vedea și cele cinci potriviri ale acestui build.</p>';const r=core.analyze(wireConfig(id,state.config.wire),liquid(),state.objective);return '<p>'+esc(api.vapeDescription(r,liquid()))+'</p><div class="platform-mini-dna">'+[['spectrum','Spectru'],['palate','Palat'],['harmony','Armonie']].map(([key,label])=>'<span><b>'+label+'</b><i style="--signal:'+r.signals[key]*20+'%" role="img" aria-label="'+esc(label+' · '+r.signals[key]+' indicator intern, nu măsurătoare')+'"></i></span>').join('')+'</div>';}
function wirePlatforms(){const rows=compatibleWireAtoms(state.config.wire);return '<details class="wire-compatible"'+(state.wirePlatformChosen?'':' open')+'><summary>'+rows.length+' atomizoare compatibile · '+(state.wirePlatformChosen?'schimbă atomizorul':'alege unul pentru experiența detaliată')+'</summary><p class="module-note">Compatibilitate din configurațiile permise ale Lab, nu recomandare universală de montaj. Nu sunt omise platformele compatibile.</p><div class="wire-platform-grid">'+rows.map(a=>'<article class="wire-platform-card"><div class="wire-platform-photo">'+api.renderProductPhoto(a)+'</div><h3>'+esc(a.short)+'</h3><p>'+esc(core.platforms[a.id].note)+'</p>'+platformReaction(a.id)+'<button type="button" class="module-link" data-wire-platform="'+a.id+'">Alege '+esc(a.short)+'</button><details data-wire-liquids="'+a.id+'"><summary>Vezi lichidele potrivite</summary><div class="journey-liquid-list"></div></details></article>').join('')+'</div></details>';}

function renderAtomizer(){
 el('pageAtomizer').classList.toggle('needs-liquid',!hasLiquid());
 const model=contextual();if(!model)return;
 const categories=fit.analyze(model.atom,state.config.bell,catalog).classes;
 el('pageAtomizer').innerHTML=heading('03 / COLLECTION DNA','Atomizer Atlas.','16 identități. 42 de exemplare. Un rezultat potrivit contextului tău.')+workflow(['Atomizor · sârmă · obiectiv','Top 5 · alege lichidul','Builduri · continuă în Wire'])+contextBar()+
 '<div class="module-filters platform-picker">'+select('Alege platforma','atlasPlatform',atoms.map(a=>[a.id,a.short]),state.atom)+select('Material / aliaj','atlasWire',Object.entries(core.wires).filter(([id])=>core.variants(state.atom).some(v=>v.wire===id)).map(([id,w])=>[id,w.name]),state.config.wire)+select('Obiectiv','atlasObjective',objectives,state.objective)+select('Insert / aer','atlasAir',core.platforms[state.atom].air.map(a=>[a.id,a.label]),state.config.air)+'</div>'+materialPaths()+ 
 '<div class="atlas-detail"><div class="atlas-portrait"><div class="portrait-photo">'+api.renderProductPhoto(model.atom)+'</div><span class="eyebrow">'+inventory[state.atom]+' EXEMPLARE / '+esc(patternLabel(state.atom))+'</span><h2>'+esc(model.atom.short)+'</h2><p>'+esc(core.platforms[state.atom].note)+'</p><button type="button" class="match-button" data-edit-wire>Reglează configurația în Wire Lab ↗</button></div><div><span class="eyebrow">SENSORY DNA / CONTEXTUAL</span>'+metricPanel(model.result)+method(model.result)+'</div></div>'+
 window.RTA_ATLAS_SEARCH_UI.render('atlas')+topLiquids('atlas')+'<section class="module-section" data-requires-liquid><div class="section-heading"><span class="eyebrow">BEST + ALTERNATIVE / '+esc(liquid().name)+'</span><h2>Trei builduri pentru acest context.</h2></div><div class="detail-grid">'+model.builds.map((b,i)=>api.renderBuild(b,i+1,liquid())).join('')+'</div>'+watchPanel(model.builds)+'</section>'+
 '<section class="module-section"><h2>Lichide și cameră.</h2><p class="module-note">Afinitate orientativă pentru clopotul ales; nu reprezintă testarea fiecărui lichid.</p><div class="family-tags">'+categories.map(c=>'<span>'+esc(c.name)+'</span>').join('')+'</div><button type="button" class="module-link" data-show-liquids>Explorează toate cele '+catalog.length+' de lichide</button><div id="platformLiquids"></div></section>'+physicalUnits(state.atom)+
 '<section class="module-section"><h2>Colecția.</h2><div class="module-filters"><label>Caută o platformă<input id="atlasSearch" type="search" value="'+esc(state.query)+'" placeholder="Nume, airflow, caracter"></label>'+select('Familie de lichide','atlasCategory',[['all','Toate familiile'],...fit.classes.map(c=>[c,c])],state.category)+'</div><div id="atlasCatalog">'+catalogCards()+'</div></section>';
}
function controls(){
 const cfg=state.config,p=core.platforms[state.atom];
 const wires=Object.entries(core.wires).filter(([id])=>core.variants(state.atom).some(v=>v.wire===id));
 const wraps=core.variants(state.atom).filter(v=>v.wire===cfg.wire).map(v=>[v.wraps,v.wraps+' spire']);
 return '<div class="wire-controls">'+select('Spire','wireWraps',wraps,cfg.wraps)+select('Insert / aer','wireAir',p.air.map(a=>[a.id,a.label]),cfg.air)+select('Cameră / clopot','wireBell',fit.config(state.atom).bells.map(b=>[b.id,b.name]),cfg.bell)+
 '<details class="wire-advanced"'+(state.advanced?' open':'')+'><summary>Geometrie și energie</summary><div class="wire-controls">'+select('Ø coil','wireDiameter',[[2,'2,0 mm'],[2.5,'2,5 mm'],[3,'3,0 mm']],cfg.coilMm)+select('Poziție coil','wirePosition',[['low','Mai jos'],['standard','Standard'],['high','Mai sus']],cfg.position)+'<label>Putere / plafon W<input id="wirePower" type="number" required min="7" max="20" step="0.1" value="'+cfg.power+'"></label>'+(core.wires[cfg.wire].type==='tc'?'<label>Setare TC °C<input id="wireTemp" type="number" required min="180" max="270" step="1" value="'+cfg.temp+'"></label>':'')+'</div><p class="module-note">Preseturi orientative din Lab. Limita W nu este putere aplicată permanent; temperatura este setare TC, nu măsurătoare a coilului.</p><p id="wireValidation" role="alert"></p></details></div>';
}
function compareWirePlatforms(){if(!hasLiquid()||!state.wirePlatformChosen)return '';const candidates=compatibleWireAtoms(state.config.wire).filter(a=>a.id!==state.atom).map(a=>({atom:a,result:core.analyze(wireConfig(a.id,state.config.wire),liquid(),state.objective)})).sort((a,b)=>core.priority(b.result,state.objective)-core.priority(a.result,state.objective)),selected={atom:atom(state.atom),result:core.analyze(state.config,liquid(),state.objective)},rows=[selected,...candidates.slice(0,2)];return '<section class="module-section"><h2>Aceeași sârmă, alte interpretări.</h2><p class="module-note">'+esc(core.wires[state.config.wire].name)+' · '+esc(liquid().name)+'. Atomizorul ales și încă două potriviri calculate. Schimbarea platformei modifică mai multe caracteristici simultan, nu izolează o singură variabilă.</p><div class="wire-platform-grid">'+rows.map(r=>'<article class="wire-platform-card"><div class="wire-platform-photo">'+api.renderProductPhoto(r.atom)+'</div><h3>'+esc(r.atom.short)+'</h3><p>'+esc(api.vapeDescription(r.result,liquid()))+'</p><button type="button" class="module-link" data-wire-platform="'+r.atom.id+'">Explorează această experiență</button></article>').join('')+'</div>'+api.comparisonGraphic(rows.map(r=>({label:r.atom.short,result:r.result})),'Aceeași sârmă pe trei atomizoare')+'</section>';}
function renderWire(){
 const m=contextual();if(!m)return;
 const phys=m.result.physical,w=core.wires[state.config.wire];
 el('pageWire').innerHTML=heading('04 / WIRE ANATOMY','Wire Lab.','Cinci familii, două aliaje NiFe distincte. Geometrie explicată, caracter contextual.')+workflow(['Alege sârma','Toate atomizoarele compatibile','Experiență · lichide · comparații'])+contextBar()+
 '<div class="wire-controls wire-picker">'+select('1 · Alege sârma','wireMaterial',[['','Alege sârma...'],...Object.entries(core.wires).map(([id,w])=>[id,w.name])],state.wireChosen?state.config.wire:'')+select('2 · Alege atomizorul','wireAtom',[['','Alege dintre cele compatibile'],...(state.wireChosen?compatibleWireAtoms(state.config.wire).map(a=>[a.id,a.short]):[])],state.wirePlatformChosen?state.atom:'')+select('Obiectiv','wireObjective',objectives,state.objective)+'</div>'+(state.wireChosen?window.RTA_ATLAS_SEARCH_UI.render('wire')+wirePlatforms():wirePalette())+
 '<div class="wire-selected-experience"'+(state.wirePlatformChosen?'':' hidden')+'>'+(hasLiquid()?'<div class="module-next-actions"><button type="button" class="module-link" data-route="liquid">Vezi și celelalte atomizoare pentru acest lichid ↗</button><button type="button" class="module-link" data-route="atomizer">Explorează acest atomizor în Atlas ↗</button></div>':'')+
 '<div class="wire-workspace"><div class="wire-stage"><span class="eyebrow">'+esc(w.mode)+' / '+esc(name(state.atom))+'</span><h2>'+esc(w.name)+'</h2><div class="coil-stage">'+api.renderCoil(state.config)+'</div><div class="geometry-readout"><span><b>'+phys.widthMm+' mm</b>lățime estimată coil</span><span><b>'+esc(phys.areaMm2==null?'nefixată':phys.areaMm2+' mm²')+'</b>arie nominală aer</span></div><p class="module-note">Schemă explicativă. Aria orificiilor nu este debit; lățimea coilului este o aproximație geometrică.</p><p class="wire-identity">'+esc(state.atom==='gtr'&&w.type==='tc'?'GTR: Dicodes NiFe30 TCR320 / 7 spire și Zivipf NiFe52 TCR310 / 6 spire sunt la egalitate ca preferință. NiFe30/6 funcționează și rămâne selectabil; noul 7 este mai coerent în testul personal, fără dovadă de cauzalitate izolată.':state.atom==='klp'&&w.type==='tc'?'KLP: Dicodes NiFe30 și Zivipf NiFe52 sunt ambele preferințe personale de prim nivel. Reglajul DNA 220°C/16 W este raportat numai pentru Dicodes.':w.type==='tc'?'TC: Dicodes NiFe30 TCR320 și Zivipf NiFe52 TCR310 sunt materiale distincte, cu 6 spire în baseline general (excepție GTR NiFe30/7).':'Buildurile urmează permisiunile și observațiile canonice ale platformei.')+'</p>'+(!window.RTA_ATLAS_DUEL?.state.editing?'<button type="button" class="match-button" data-duel-pick="'+esc(encodeURIComponent(JSON.stringify(state.config)))+'">Compară această configurație în Duel ↗</button>':'')+'</div><section class="wire-panel">'+controls()+'</section></div>'+
 (state.config.wire==='nife30'?'<figure class="wire-product-photo"><img src="./media/dicodes-resistherm-nife30.jpg" alt="Dicodes RESISTHERM NiFe30: rolă cu eticheta 320 și 5,5 Ω/m, lângă ambalajul metalic de referință" loading="lazy" decoding="async" width="500" height="333"><figcaption><span class="eyebrow">MATERIAL ÎN PRIM-PLAN / FOTO REALĂ</span><h2>Dicodes RESISTHERM NiFe30.</h2><p>Fotografie de produs, nu a rolei personale. Ambalaj de referință; sursa menționează că lotul actual este livrat fără cutia metalică.</p><a href="https://www.vapesbyenushi.com/dicodes-resistherm-nife30-temperature-control-resistance-wire/" target="_blank" rel="noopener noreferrer">Foto: Vapes by Enushi / Dicodes ↗</a></figcaption></figure>':'')+
 '<section class="module-section" data-requires-liquid><h2>Ce oferă această configurație.</h2>'+metricPanel(m.result)+'<div class="gain-trade"><div><h3>Avantaje orientative</h3><ul>'+m.result.advantages.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><div><h3>Compromisuri</h3><ul>'+m.result.tradeoffs.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div></div>'+method(m.result)+'</section>'+
 topLiquids('wire')+compareWirePlatforms()+'<section class="module-section" data-requires-liquid><h2>Alte trei configurații pentru comparație.</h2><div class="detail-grid">'+m.builds.map((b,i)=>'<div>'+api.renderBuild(b,i+1,liquid())+'<button type="button" class="module-link" data-pick-build="'+i+'">Explorează acest build</button></div>').join('')+'</div>'+watchPanel(m.builds)+api.comparisonGraphic(m.builds.map(b=>({label:core.wires[b.config.wire].name+' / '+b.config.wraps+' spire',result:b})),'Trei experiențe pe același atomizor')+'</section></div>';
 el('pageWire').classList.toggle('needs-liquid',!hasLiquid());window.RTA_ATLAS_DUEL?.onWireRendered();
}
function show(to){
 state.objective=api.effectiveGoal();
 for(const [route,id] of [['atomizer','pageAtomizer'],['wire','pageWire']]){const page=el(id);if(page)page.hidden=route!==to;}
 if(to==='atomizer')renderAtomizer();if(to==='wire')renderWire();
}
function init(){
 const host=el('main');if(!host)return;
 for(const [id,label] of [['pageAtomizer','Atomizer Atlas'],['pageWire','Wire Lab']]){
  const section=document.createElement('section');section.id=id;section.className='page atlas-module frame';section.hidden=true;section.setAttribute('aria-label',label);host.appendChild(section);
 }
 document.querySelectorAll('.gateway-future').forEach((card,i)=>{
  card.setAttribute('role','button');card.setAttribute('tabindex','0');card.dataset.route=i===0?'atomizer':'wire';card.setAttribute('aria-label',i===0?'Deschide Atomizer Atlas':'Deschide Wire Lab');
  const caption=card.querySelector('.gateway-bottom');if(caption)caption.textContent='EXPLOREAZĂ ↗';
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();api.route(card.dataset.route);}});
 });
 document.addEventListener('click',e=>{
  const target=e.target.closest?.('[data-platform],[data-edit-wire],[data-show-liquids],[data-atlas-liquid],[data-context-liquid],[data-pick-build],[data-wire-open],[data-atlas-build],[data-journey-wire],[data-wire-platform],[data-wire-family]');if(!target)return;
  const d=target.dataset;
  if(d.wireFamily){const rows=compatibleWireAtoms(d.wireFamily),keepPlatform=state.wirePlatformChosen&&rows.some(a=>a.id===state.atom),cfg=wireConfig(rows.some(a=>a.id===state.atom)?state.atom:rows[0].id,d.wireFamily);state.wireChosen=true;state.wirePlatformChosen=keepPlatform;state.atom=cfg.atom;state.config=cfg;renderWire();el("pageWire").scrollIntoView({block:"start",behavior:"instant"});return;}
  if(d.wirePlatform){const cfg=wireConfig(d.wirePlatform,state.config.wire);if(cfg){state.atom=cfg.atom;state.config=cfg;state.wireChosen=true;state.wirePlatformChosen=true;renderWire();el("pageWire").scrollIntoView({block:"start",behavior:"instant"});}return;}
  if(d.journeyWire){const id=d.journeyAtom||state.atom,cfg=wireConfig(id,d.journeyWire);if(cfg){state.atom=id;state.config=cfg;state.wireChosen=true;state.wirePlatformChosen=true;if(d.journeyLiquid!=null)api.selectLiquid(Number(d.journeyLiquid));if(d.journeyLiquid==null)api.route('wire');else if(api.state.route==='atomizer')renderAtomizer();else renderWire();}return;}
  if(d.wireOpen!=null||d.atlasBuild!=null){try{const raw=JSON.parse(decodeURIComponent(d.atlasBuild??d.wireOpen)),cfg=window.RTA_ATLAS_DUEL.valid(raw);if(cfg){state.wireChosen=true;state.wirePlatformChosen=true;state.atom=cfg.atom;state.config={...cfg};api.state.selectedFullBuild={...cfg};window.RTA_ATLAS_DUEL.state.editing=null;api.route('wire');}}catch(error){}return;}

  if(d.platform){selectAtom(d.platform);renderAtomizer();el('pageAtomizer').scrollIntoView({block:'start',behavior:'instant'});}
  if(d.editWire!=null){state.wireChosen=true;state.wirePlatformChosen=true;api.route('wire');}
  if(d.showLiquids!=null){
   const rows=window.RTA_ATLAS_SEARCH.top(state.config,state.objective,12);
   el('platformLiquids').innerHTML='<p class="module-note">Toate cele '+rows.length+' lichide analizate. Primele 12 potriviri contextuale.</p><div class="liquid-links">'+rows.slice(0,12).map(r=>'<button type="button" data-atlas-liquid="'+r.index+'"><b>'+esc(window.RTA_ATLAS_SEARCH.label(r.liquid))+'</b><small>'+esc(r.liquid.class)+'</small></button>').join('')+'</div>';
  }
  if(d.atlasLiquid!=null||d.contextLiquid!=null){api.selectLiquid(Number(d.atlasLiquid??d.contextLiquid));show(api.state.route);}
  if(d.pickBuild!=null){const build=contextual().builds[Number(d.pickBuild)];if(build){state.config={...build.config};renderWire();}}
 });
 document.addEventListener('input',e=>{if(e.target.id==='atlasSearch'){state.query=e.target.value;renderCatalog();}});
 document.addEventListener('change',e=>{
  const id=e.target.id,value=e.target.value;
  if(e.target.dataset.contextField){const field=e.target.dataset.contextField;if(api.setContext({[field]:value})){const fresh=document.querySelector('.page:not([hidden]) .context-settings');if(fresh)fresh.open=true;document.querySelector('.page:not([hidden]) [data-context-field="'+field+'"]')?.focus({preventScroll:true});}return;}
  if(id.startsWith('wire'))state.advanced=!!el('pageWire').querySelector('.wire-advanced')?.open;
  if(id==='atlasCategory'){state.category=value;renderCatalog();return;}
  if(id==='atlasPlatform'){selectAtom(value);state.wirePlatformChosen=true;renderAtomizer();el(id).focus({preventScroll:true});return;}
  if(id==='atlasWire'){setConfig({wire:value});state.wireChosen=true;state.wirePlatformChosen=true;renderAtomizer();el(id).focus({preventScroll:true});return;}
  if(id==='atlasAir'){setConfig({air:value});renderAtomizer();el(id).focus({preventScroll:true});return;}
  if(id==='wireAtom'){const cfg=wireConfig(value,state.config.wire);if(cfg){state.atom=cfg.atom;state.config=cfg;state.wireChosen=true;state.wirePlatformChosen=true;renderWire();}return;}
  if(id==='wireMaterial'){if(!core.wires[value])return;state.wireChosen=true;const rows=compatibleWireAtoms(value),cfg=wireConfig(rows.some(a=>a.id===state.atom)?state.atom:rows[0]?.id,value);if(cfg){if(cfg.atom!==state.atom)state.wirePlatformChosen=false;state.atom=cfg.atom;state.config=cfg;renderWire();}return;}
  if(id==='wireObjective'||id==='atlasObjective'){
   if(objectives.some(x=>x[0]===value)){state.objective=value;state.goalLocked=true;api.setObjective(value);}
   if(id==='atlasObjective')renderAtomizer();else renderWire();el(id)?.focus({preventScroll:true});return;
  }
  const field={wireMaterial:'wire',wireWraps:'wraps',wireAir:'air',wireBell:'bell',wireDiameter:'coilMm',wirePosition:'position',wirePower:'power',wireTemp:'temp'}[id];
  if(field){
   if(['power','temp'].includes(field)&&!e.target.checkValidity()){el('wireValidation').textContent='Introdu o valoare în intervalul afișat. Configurația curentă este păstrată.';return;}
   setConfig({[field]:['wraps','coilMm','power','temp'].includes(field)?Number(value):value});renderWire();el(id)?.focus({preventScroll:true});
  }
 });
 document.addEventListener('toggle',e=>{const id=e.target.dataset?.wireLiquids;if(id&&e.target.open){const cfg=wireConfig(id,state.config.wire);e.target.querySelector('.journey-liquid-list').innerHTML=liquidButtons(cfg);}},true);
 const route=window.location.hash.slice(1);if(['atomizer','wire'].includes(route))api.route(route,false);
}
window.RTA_ATLAS_MODULES={routes:['atomizer','wire'],show,init,state,inventory,contextual,filteredAtoms,selectAtom,setConfig,clSnapshot,objectiveLabel,storedBuild,sameStored,topLiquids,contextBar,workflow,hasLiquid,compatibleWireAtoms,wireConfig,buildLeads,buildFacts,materialPaths};
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
})();
