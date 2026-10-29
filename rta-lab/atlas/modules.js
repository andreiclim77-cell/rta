/* Atlas adapters. Canonical engines and personal storage are never rewritten. */
(function(){
"use strict";
const core=window.RTA_SENSORY_CORE,fit=window.RTA_BELL_LIQUID_FIT,api=window.RTA_ATLAS_PREVIEW;
if(!core||!fit||!api)return;
const atoms=window.RTA_ATLAS_COLLECTION.activeAtoms,catalog=window.RTA_LIQUIDS;
const inventory={"415":1,kprime:2,gtone:4,dvarwcl:3,muted:4,gtr:5,dvarwfl:2,diplomat:3,kx:4,klp:5,asylum:2,pmfree:2,pmstd:2,byka:1,kv3:1,minister:1}; // full historical evidence
const activeUnits=atoms.reduce((total,a)=>total+(inventory[a.id]||0),0);
const objectives=[['complete','Armonie + palat'],['layers','Stratificare'],['th','Ofensivă + TH'],['tobacco','Tutun în prim-plan'],['body','Corp + densitate'],['smooth','Finețe']];
const state={atom:'gtr',query:'',category:'all',config:core.defaultConfig('gtr'),objective:'layers',goalLocked:false,liquidsOpen:false,advanced:false,wirePlatformChosen:false,wireChosen:false,wireShowAll:false,wireJourney:{wrapsConfirmed:false,objective:null,family:null,liquidIndex:null}};
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const el=id=>document.getElementById(id);
const liquid=()=>api.currentLiquid();
const atom=id=>window.RTA_CORE.atoms.find(a=>a.id===id); // Historical technical reference remains accessible.
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
  const preset=core.wireSetup(state.atom,changes.wire,variant.wraps);
  changes={...changes,wraps:variant.wraps,power:preset.power,temp:preset.temp,
   regime:core.wires[changes.wire].type==="tc"?"tc":"watt",chipset:""};
 }
 if(changes.regime&&state.config.wire==="nife30"&&changes.regime!==state.config.regime){
  const preset=core.wireSetup(state.atom,"nife30",state.config.wraps);
  changes={...changes,power:changes.regime==="watt"?core.nife30Watt.power:preset.power,temp:preset.temp,chipset:""};
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
 return '<p class="module-note" role="status">'+rows.length+' din '+atoms.length+' platforme active · '+activeUnits+' exemplare în colecție</p><div class="atlas-catalog">'+rows.map(a=>'<button type="button" class="platform-tile'+(a.id===state.atom?' selected':'')+'" data-platform="'+a.id+'" aria-pressed="'+(a.id===state.atom)+'"><span class="platform-photo">'+api.renderProductPhoto(a)+'</span><strong>'+esc(a.short)+'</strong><small>'+inventory[a.id]+' '+(inventory[a.id]===1?'exemplar':'exemplare')+' · '+esc(patternLabel(a.id))+'</small></button>').join('')+'</div>'+(rows.length?'':'<p>Nu există platforme care corespund filtrului. Schimbă căutarea sau categoria.</p>');
}
function renderCatalog(){const host=el('atlasCatalog');if(host)host.innerHTML=catalogCards();}
function topLiquids(prefix){
 const rows=window.RTA_ATLAS_SEARCH.top(state.config,state.objective);
 return '<section class="module-section top-liquid-section" id="'+prefix+'TopLiquids"><span class="eyebrow">DIN CELE '+catalog.length+' REPERE</span><h2>Primele 5 lichide pentru acest build.</h2><p class="module-note">'+esc(name(state.atom)+' · '+core.wires[state.config.wire].name+' · '+objectiveLabel(state.objective))+'. Recalculate pentru configurația afișată. În top intră doar produsele cu profil suficient documentat; potrivirea rămâne estimată din model.</p><ol class="top-liquid-list">'+rows.map((r,i)=>'<li><button type="button" data-context-liquid="'+r.index+'"><span class="top-liquid-rank">0'+(i+1)+'</span><span><b>'+esc(window.RTA_ATLAS_SEARCH.label(r.liquid))+'</b><small>'+esc(r.liquid.class+' · '+r.liquid.profile)+'</small></span></button></li>').join('')+'</ol></section>';
}

function compatibleWireAtoms(wire){return atoms.filter(a=>core.variants(a.id).some(v=>v.wire===wire));}
function wireConfig(id,wire){
 if(id===state.atom&&wire===state.config.wire)return {...state.config};
 const base=id===state.atom?state.config:core.defaultConfig(id);
 if(!base||!core.wires[wire])return null;
 const variants=core.variants(id).filter(v=>v.wire===wire);
 const v=(wire==='nife30'?variants.find(v=>v.wraps===7):
   id==='415'&&wire==='k128'?variants.find(v=>v.wraps===6):
   variants.find(v=>v.wraps===base.wraps))||variants[0];
 if(!v)return null;
 // A material change chooses that material's own regime. WATT must not leak
 // from Kanthal to NiFe30. A move to another atomizer with the same material
 // may preserve the explicitly chosen NiFe30 WATT regime and chipset.
 const preserve=wire===state.config.wire;
 const preferred=core.wires[wire].type==='tc'?'tc':'watt';
 const regime=preserve&&core.allowedRegimes(wire).includes(state.config.regime)?state.config.regime:preferred;
 const chipset=preserve&&wire==='nife30'&&regime==='watt'?state.config.chipset:'';
 const settings=core.wireSetup(id,wire,v.wraps);
 const power=wire==='nife30'&&regime==='watt'?core.nife30Watt.power:settings.power;
 return core.config(id,{...base,...v,...settings,regime,chipset,power});
}
function wireIdentity(wire){const w=core.wires[wire];return w.type==='tc'?(wire==='nife30'?'NiFe30 TCR320/7 · preferință globală, cu /6 istoric; TC sau alternativ WATT 12 W pe Dicodes, YiHi, ARC1, DNA.':'NiFe52 TCR310 · TC, preseturi proprii platformei.'):w.type==='clapton'?'Clapton 2×30+38 · regim WATT în configurațiile Lab.':'Fir rotund · Ø '+String(w.diameter).replace('.',',')+' mm · regim WATT.';}
function liquidButtons(cfg){return window.RTA_ATLAS_SEARCH.top(cfg,state.objective).map((r,i)=>'<button type="button" data-journey-liquid="'+r.index+'" data-journey-wire="'+cfg.wire+'" data-journey-atom="'+cfg.atom+'"><span>0'+(i+1)+'</span><b>'+esc(window.RTA_ATLAS_SEARCH.label(r.liquid))+'</b><small>'+esc(r.liquid.class)+'</small></button>').join('');}

/* The platform's own confirmed personal choices come first; remaining materials
 * are computed from the existing engine for the current atomizer/goal/context.
 * Distinct wires mean distinct physical materials, including both NiFe alloys. */
const PERSONAL_LEADS=Object.freeze({
 "415":[["nife30",7],["nife52",6],["k128",6]],
 gtr:[["nife30",7],["nife52",6],["k128",5]],
 klp:[["nife30",7],["nife52",6],["k128",5]],
 kprime:[["nife30",7],["nife52",6],["k129",5]],
 kx:[["nife30",7],["nife52",6],["k128",5]],
 gtone:[["k129",6],["k128",5]],muted:[["k128",6]],
 dvarwcl:[["k128",6,"triple06"]],
 dvarwfl:[["k128",6,"triple06"]],
 asylum:[["k128",6,undefined,"flat"]],kv3:[["k128",6],["k129",6]]
});
const PLATFORM_TECHNICAL_LEADS=Object.freeze({
 dvarwfl:[["ssclap",5,"single12"]] // dedicated specialist pairing, not a controlled personal A/B.
});
function buildLeads(id=state.atom){
 const base=id===state.atom?state.config:core.defaultConfig(id),out=[],used=new Set();
 if(!base)return [];
 function add(wire,wraps,air,source,bell){
  if(!core.wires[wire]||used.has(wire)||!core.permitted(id,wire,wraps))return;
  const cfg=core.config(id,{...base,wire,wraps,air:air||base.air,bell:bell||base.bell,...core.wireSetup(id,wire,wraps)});
  if(cfg.wire!==wire||cfg.wraps!==wraps)return;
  used.add(wire);out.push({config:cfg,source});
 }
 for(const [wire,wraps,air,bell] of PERSONAL_LEADS[id]||[])add(wire,wraps,air,"personal",bell);
 for(const [wire,wraps,air] of PLATFORM_TECHNICAL_LEADS[id]||[])add(wire,wraps,air,"model");
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
 const energy=core.modeFor(config)==="tc"?"TC "+config.temp+"°C (setare) · plafon "+config.power+" W":"WATT "+config.power+" W"+(config.wire==="nife30"&&config.chipset?" · "+core.nife30Watt.chipsets[config.chipset]:"");
 const facts=[["Coil",config.wraps+" spire · Ø"+String(config.coilMm).replace(".",",")+" mm"],
  ["Insert / aer",a?.label||"Necunoscut"],["Clopot",bell?.name||"Original"],
  ["Regim",energy],["Poziție",{low:"Jos",standard:"Standard",high:"Sus"}[config.position]||"Standard"]];
 return '<dl class="material-build-facts">'+facts.map(([key,val])=>
  '<div><dt>'+esc(key)+'</dt><dd>'+esc(val)+'</dd></div>').join("")+"</dl>";
}
function materialPaths(){
 const leads=buildLeads(),chosen=state.config,profile=liquid();
 const isCurrent=leads.some(({config})=>["wire","wraps","air","bell","coilMm","position","power","temp","regime","chipset"].every(k=>config[k]===chosen[k]));
 return '<section class="module-section material-paths" id="atlasBuilds">'+
 '<span class="eyebrow">MATERIALELE TALE / CONSTRUCȚII COMPLETE</span><h2>Primele trei builduri pentru acest atomizor.</h2>'+
 '<p class="module-note">Prioritate pentru configurațiile tale confirmate. Unde nu sunt trei preferințe stabilite, motorul completează cu propuneri tehnice potrivite platformei. Nicio propunere netestată nu este prezentată drept test personal. Setările W/TC sunt preseturi când nu avem măsurători.</p>'+
 '<div class="material-path-grid">'+leads.map(({config,source},i)=>{
  const r=core.analyze(config,profile,state.objective),w=core.wires[config.wire];
  return '<article class="material-path" data-build-wire="'+esc(config.wire)+'" data-build-wraps="'+config.wraps+'" data-build-air="'+esc(config.air)+'">'+
  '<span class="eyebrow">0'+(i+1)+' · '+(source==="personal"&&state.atom==='asylum'?"PREFERINȚĂ PERSONALĂ DE COIL/CLOPOT · PIN NECONFIRMAT":source==="personal"?"PREFERINȚĂ PERSONALĂ":"PROPUNERE TEHNICĂ")+' · '+esc(w.mode)+'</span>'+
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

/* Canonical personal wire references are descriptive preferences, NOT a claim
 * that the same coil is installed in all physical atomizer units. */
const WIRE_REFERENCE=Object.freeze({
 nife30:[["gtr",7,"GTR · prima alegere TC"],["415",7,"415 Cool · prima alegere"],["klp",7,"KLP · coerență TC"],["kx",7,"Kayfun X"],["kprime",7,"Kayfun Prime"]],
 nife52:[["gtr",6,"GTR · prima alegere TC"],["415",6,"415 Cool · prima alegere"],["klp",6,"KLP"],["kprime",6,"Kayfun Prime"],["kx",6,"Kayfun X"]],
 k128:[["415",6,"415 Cool · a doua alegere"],["dvarwcl",6,"Dvarw CL · 3×0,6"],["dvarwfl",6,"Dvarw FL · 3×0,6"],["muted",6,"Muted+"],["kv3",6,"Kayfun Mini V3"],["klp",5,"KLP · 28/5"]],
 k129:[["gtone",6,"GT One · prima alegere"],["kv3",6,"Kayfun Mini V3"],["klp",5,"KLP · TH direct"]],
 k1clap:[["415",5,"415 Cool · Clapton specialist"]],
 ssclap:[["dvarwfl",5,"Dvarw FL · specialist tehnic"]]
});
function wireSavedBuilds(wire){
 const rows=(WIRE_REFERENCE[wire]||[]).map(([id,wraps,label])=>{
  if(!core.permitted(id,wire,wraps))return null;
  const settings=core.wireSetup(id,wire,wraps);
  const config=core.config(id,{wire,wraps,...settings,regime:core.wires[wire].type==="tc"?"tc":"watt",
   ...(wire==="ssclap"&&id==="dvarwfl"?{air:"single12"}:{})});
  return {config,label,origin:wire==="ssclap"?"model":"reference"};
 }).filter(Boolean);
 const snap=clSnapshot();
 if(snap.available)snap.units.forEach((unit,i)=>{
  const saved=unit.saved;
  if(!saved||saved.wire!==wire||!core.permitted("dvarwcl",wire,saved.wraps))return;
  rows.unshift({config:{...saved,atom:"dvarwcl"},label:"Dvarw CL "+(i+1)+" · setup local salvat",origin:"local"});
 });
 return rows;
}
function wirePalette(){
 const selected=state.wireChosen?state.config.wire:null;
 const cards=Object.entries(core.wires).map(([id,w])=>{
  const examples=wireSavedBuilds(id),config=examples[0]?.config||core.config("gtr",{wire:id});
  return '<button type="button" class="wire-family-card wire-build-entry'+(selected===id?' is-selected':'')+'" data-wire-family="'+id+'" aria-pressed="'+(selected===id)+'">'+
  '<span class="eyebrow">'+esc(w.mode)+' · '+(id==="nife30"?"TCR 320":id==="nife52"?"TCR 310":"GEOMETRIE")+'</span>'+
  '<b>'+esc(w.name)+'</b>'+
  '<span class="wire-card-coil"><span class="wire-card-coil-visual">'+api.renderCoil(config)+'</span>'+
  '<strong>'+config.wraps+' spire</strong><small>Ø'+String(config.coilMm).replace(".",",")+' mm · preset</small></span>'+
  '<span class="wire-card-note">'+esc(wireIdentity(id))+'</span>'+
  '<span class="wire-card-preferences"><strong>'+(id==="ssclap"?"Pereche tehnică din Lab":"Ultimele builduri preferate")+'</strong>'+
  examples.map(x=>'<span class="wire-saved-build'+(x.origin==="model"?' is-model':'')+'">'+
   esc(x.label)+' · '+x.config.wraps+' spire'+(x.origin==="local"?" · LOCAL":"")+'</span>').join('')+
  '</span><span class="wire-card-action">'+(selected===id?"SELECTAT · modifică mai jos":"Alege această sârmă ↗")+'</span></button>';
 }).join("");
 return '<section class="wire-library" id="wireLibrary"><div class="wire-library-head">'+
  '<span class="eyebrow">RTA LAB / ULTIMELE PREFERINȚE</span>'+
  '<h2>Toate sârmele, coilurile și buildurile tale.</h2>'+
  '<p>Toate cele șase materiale sunt vizibile înainte de alegere. NiFe30 Dicodes folosește 7 spire; NiFe52 Zivipf, 6. Celelalte construcții păstrează alegerile specifice atomizoarelor. Schemele nu sunt fotografii ale montajelor reale.</p>'+
  '</div><div class="wire-family-grid wire-library-grid">'+cards+'</div>'+
  '<p class="module-note">„Preferat în Lab” nu înseamnă „montat pe fiecare exemplar”. Fișele CL salvate în acest browser apar separat, fără a fi sincronizate automat cu alte dispozitive.</p></section>';
}
function platformReaction(id){if(!hasLiquid())return '<p class="module-note">Alege lichidul comun pentru descrierea reacției senzoriale. Poți vedea și cele cinci potriviri ale acestui build.</p>';const r=core.analyze(wireConfig(id,state.config.wire),liquid(),state.objective);return '<p>'+esc(api.vapeDescription(r,liquid()))+'</p><div class="platform-mini-dna">'+[['spectrum','Spectru'],['palate','Palat'],['harmony','Armonie']].map(([key,label])=>'<span><b>'+label+'</b><i style="--signal:'+r.signals[key]*20+'%" role="img" aria-label="'+esc(label+' · '+r.signals[key]+' indicator intern, nu măsurătoare')+'"></i></span>').join('')+'</div>';}
const WIRE_FAMILIES=["Tutun simplu","Tutun complex","NET simplu","NET complex"];
function wireJourneyControls(){
 const active=state.wireChosen,current=state.config,step=state.wireJourney;
 if(!active)return '<div class="wire-progress" id="wireProgress">'+
  '<h3>Construiește potrivirea, pas cu pas.</h3><p>Începi prin a vedea toate sârmele și toate cele 15 atomizoare active. Alege una dintre sârmele de mai sus, apoi construim recomandarea treptat până la lichidul concret.</p>'+
  '<span class="wire-progress-steps">01 Sârmă → 02 Spire → 03 Obiectiv → 04 Familie → 05 Lichid</span></div>';
 const variants=core.variants(state.atom).filter(x=>x.wire===current.wire);
 const wraps=[...new Set(variants.map(x=>x.wraps))].sort((a,b)=>a-b);
 const options=(rows,val)=>rows.map(([key,label])=>'<option value="'+esc(key)+'"'+(String(val)===String(key)?' selected':'')+'>'+esc(label)+'</option>').join("");
 const liquids=step.family?catalog.map((l,i)=>({l,i})).filter(x=>x.l.class===step.family):[];
 const stage=step.liquidIndex!=null?5:step.family?4:step.objective?3:step.wrapsConfirmed?2:1;
 return '<div class="wire-progress" id="wireProgress"><div class="wire-progress-head">'+
  '<span class="eyebrow">FILTRARE PROGRESIVĂ / ETAPA '+stage+' DIN 5</span>'+
  '<h3>De la sârmă la lichidul exact.</h3>'+
  '<button type="button" class="wire-catalog-reset" data-wire-reset="1">Resetează selecțiile</button></div>'+
  '<div class="wire-progress-filters">'+
  '<label>02 · Număr de spire<select id="wireJourneyWraps">'+
    options(wraps.map(n=>[n,n+' spire'+(!step.wrapsConfirmed&&n===current.wraps?' · preset actual':'')]),current.wraps)+'</select></label>'+
  '<label>03 · Ce vrei de la vapori?<select id="wireJourneyGoal"><option value="">Alege obiectivul...</option>'+
    options(objectives,step.objective)+'</select></label>'+
  '<label>04 · Familie de lichide<select id="wireJourneyFamily"><option value="">Alege familia...</option>'+
    options(WIRE_FAMILIES.map(n=>[n,n]),step.family)+'</select></label>'+
  '<label>05 · Lichid concret<select id="wireJourneyLiquid"'+(step.family?'':' disabled')+'><option value="">'+(step.family?'Alege un lichid...':'Mai întâi alege familia')+'</option>'+
    options(liquids.map(x=>[x.i,[x.l.brand,x.l.name].filter(Boolean).join(" · ")]),step.liquidIndex)+'</select></label></div>'+
  '<p class="module-note">Geometrie curentă: <b>'+esc(core.wires[current.wire].name)+' · '+current.wraps+' spire</b>. '+
  (step.liquidIndex!=null?'Lichidul ales determină TOP 3 contextual; celelalte rezultate compatibile rămân accesibile.':
    step.family?'Categoria restrânge potrivirile pe profil generic; mai alege lichidul pentru clasamentul final.':
    step.objective?'Obiectivul schimbă clasamentul; categoria și lichidul îl vor rafina în continuare.':
    step.wrapsConfirmed?'Spirele au fost confirmate; alege obiectivul pentru selecție mai precisă.':
    'Numărul de spire provine din presetul personal. Confirmă-l sau schimbă-l pentru o selecție mai precisă.')+
  '</p></div>';
}
function wirePlatformMatches(){
 // No wire selected: ALL active platforms, never filtered by an implicit demo liquid.
 if(!state.wireChosen)return {phase:0,mode:"all",total:atoms.length,primary:atoms.map(atom=>({atom})),other:[],excluded:0};
 const step=state.wireJourney,{wire,wraps}=state.config;
 const phase=step.liquidIndex!=null?5:step.family?4:step.objective?3:step.wrapsConfirmed?2:1;
 const goal=step.objective||"complete";
 const profile=step.liquidIndex!=null?catalog[step.liquidIndex]:
   step.family?{name:"Reper generic "+step.family,class:step.family,tags:[]}:
   {name:"Profil neutru de comparație",class:"Tutun simplu",tags:[]};
 const rows=atoms.map(atom=>{
  if(!core.permitted(atom.id,wire,wraps))return null;
  const base=wireConfig(atom.id,wire);
  if(!base)return null;
  const thermal=core.wireSetup(atom.id,wire,wraps);
  const reuse=atom.id===state.atom?state.config:{};
  const config=core.config(atom.id,{...base,...reuse,wire,wraps,
   power:atom.id===state.atom?state.config.power:thermal.power,
   temp:atom.id===state.atom?state.config.temp:thermal.temp});
  if(config.wire!==wire||config.wraps!==wraps)return null;
  const result=core.analyze(config,profile,goal);
  return {atom,config,result,rank:core.priority(result,goal)};
 }).filter(Boolean).sort((a,b)=>b.rank-a.rank||a.atom.short.localeCompare(b.atom.short,"ro"));
 const max={1:8,2:6,3:5,4:4,5:3}[phase];
 const primary=rows.slice(0,max),other=rows.slice(max);
 // A specifically selected physical platform remains accessible without
 // falsifying its calculated rank or pushing it into TOP 3.
 return {phase,mode:phase===5?"liquid":phase===4?"family":phase===3?"objective":phase===2?"wraps":"wire",
  total:rows.length,primary,other,excluded:atoms.length-rows.length};
}
function wirePlatforms(){
 const m=wirePlatformMatches(),active=state.wireChosen,st=state.wireJourney;
 const title=!active?'Toate cele '+atoms.length+' atomizoare active':
  m.total+' atomizoare compatibile · '+core.wires[state.config.wire].name+' / '+state.config.wraps+' spire';
 const why=!active?'Încă nu ai ales o sârmă: afișăm întreaga colecție, fără clasament artificial.':
  m.mode==="liquid"?'TOP 3 este calculat pentru sârma, spirele, obiectivul, familia și lichidul ales.':
  m.mode==="family"?'Primele 4 sunt potrivirile estimative pentru familia aleasă; lichidul concret poate schimba ordinea.':
  m.mode==="objective"?'Primele 5 sunt potrivirile orientative pentru obiectiv; familia și lichidul vor rafina rezultatele.':
  m.mode==="wraps"?'Primele 6 reflectă configurația de spire confirmată, pe un profil neutru.':
  'Primele 8 sunt sugestii preliminare pentru materialul ales. Nu reprezintă un TOP definitiv.';
 const selectedOutside=active&&state.wirePlatformChosen?m.other.find(r=>r.atom.id===state.atom):null;
 const others=selectedOutside?m.other.filter(r=>r!==selectedOutside):m.other;
 const rowCard=row=>{
  const atom=row.atom;
  const selected=active&&state.wirePlatformChosen&&atom.id===state.atom;
  const rank=active?m.primary.indexOf(row):-1;
  return '<article class="wire-platform-card'+(selected?' is-current':'')+'" data-wire-platform-id="'+esc(atom.id)+'">'+
   '<div class="wire-platform-photo">'+api.renderProductPhoto(atom)+'</div>'+
   '<div class="wire-platform-copy">'+
   (selected?'<span class="wire-current-label">ATOMIZOR SELECTAT</span>':'')+
   '<h3>'+esc(atom.short)+'</h3>'+
   (active?(rank>=0?'<span class="wire-match-rank">'+(m.phase===5?'TOP':'PRELIMINAR')+' '+(rank+1)+'</span>':'')+
     '<p class="wire-specific-note"><b>Estimare pentru buildul selectat:</b> '+
      esc((row.result.advantages||[]).slice(0,2).join(' · ')||'Compatibilitate de verificat în context')+'</p>'+
     (row.result.personalPreference?'<p class="wire-personal-ref">'+esc(row.result.personalPreference.label)+'</p>':''):
     '<p>'+esc(core.platforms[atom.id].note)+'</p>')+
   (active?'<p class="wire-matched-build"><strong>'+esc(core.wires[state.config.wire].name)+' · '+state.config.wraps+' spire</strong>'+
     '<small>Potrivire estimată · fără scor de plăcere inventat</small></p>':
     '<p class="module-note">Alege sârma pentru a calcula potrivirea.</p>')+
   '<button type="button" class="module-link" data-wire-platform="'+esc(atom.id)+'">'+
     (active?'Explorează acest build ↗':'Alege atomizorul ↗')+'</button>'+
   '</div></article>';
 };
 return '<section class="wire-library-platforms" id="wirePlatformCatalog">'+
  '<div class="wire-library-head"><span class="eyebrow">ATOMIZOARE / SELECȚIE TREPTATĂ</span>'+
  '<h2>'+esc(title)+'</h2><p>'+esc(why)+'</p></div>'+
  '<div class="wire-match-heading">'+(active?m.primary.length+' în prim-plan · etapa '+m.phase+' din 5'+
    (m.excluded?' · '+m.excluded+' incompatibile fizic':''):
   'Toate cele 15 platforme active · fără filtre')+'</div>'+
  '<div class="wire-platform-grid">'+m.primary.map(rowCard).join("")+'</div>'+
  (selectedOutside?
    '<div class="wire-selected-outside"><p>Atomizorul ales manual rămâne vizibil, dar nu este inclus artificial în TOP-ul calculat.</p>'+
     '<div class="wire-platform-grid">'+rowCard(selectedOutside)+'</div></div>':'')+
  (others.length?'<details class="wire-compatible-more"'+(state.wireShowAll?' open':'')+'>'+
    '<summary>Mai vezi '+others.length+' atomizoare compatibile</summary>'+
    '<p class="module-note">Nu sunt eliminate din colecție. Sunt compatibile, dar momentan sub pragul de recomandare al etapei selectate.</p>'+
    '<div class="wire-platform-grid">'+others.map(rowCard).join("")+'</div></details>':'')+
  (active?'<button type="button" class="wire-catalog-reset" data-wire-reset="1">Arată din nou toate sârmele și atomizoarele</button>':'')+
  '</section>';
}
function renderAtomizer(){
 el('pageAtomizer').classList.toggle('needs-liquid',!hasLiquid());
 const model=contextual();if(!model)return;
 const categories=fit.analyze(model.atom,state.config.bell,catalog).classes;
 el('pageAtomizer').innerHTML=heading('03 / COLLECTION DNA','Atomizer Atlas.',atoms.length+' identități active. '+activeUnits+' exemplare active. Un rezultat potrivit contextului tău.')+workflow(['Atomizor · sârmă · obiectiv','Top 5 · alege lichidul','Builduri · continuă în Wire'])+contextBar()+
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
 return '<div class="wire-controls">'+select('Spire','wireWraps',wraps,cfg.wraps)+
 (cfg.wire==='nife30'?select('Regim NiFe30','wireRegime',[['tc','TC · setări păstrate'],['watt','WATT · 12 W personal']],cfg.regime):'')+
 (cfg.wire==='nife30'&&core.modeFor(cfg)==='watt'?select('Chipset electronic','wireChipset',[['','Nespecificat'],...Object.entries(core.nife30Watt.chipsets)],cfg.chipset):'')+
 select('Insert / aer','wireAir',p.air.map(a=>[a.id,a.label]),cfg.air)+select('Cameră / clopot','wireBell',fit.config(state.atom).bells.map(b=>[b.id,b.name]),cfg.bell)+
 '<details class="wire-advanced"'+(state.advanced?' open':'')+'><summary>Geometrie și energie</summary><div class="wire-controls">'+select('Ø coil','wireDiameter',[[2,'2,0 mm'],[2.5,'2,5 mm'],[3,'3,0 mm']],cfg.coilMm)+select('Poziție coil','wirePosition',[['low','Mai jos'],['standard','Standard'],['high','Mai sus']],cfg.position)+'<label>'+(core.modeFor(cfg)==='tc'?'Plafon TC (W)':'Putere WATT (W)')+'<input id="wirePower" type="number" required min="7" max="20" step="0.1" value="'+cfg.power+'"></label>'+(core.modeFor(cfg)==='tc'?'<label>Setare TC °C<input id="wireTemp" type="number" required min="180" max="270" step="1" value="'+cfg.temp+'"></label>':'')+'</div><p class="module-note">Preseturi orientative din Lab. Limita W nu este putere aplicată permanent; temperatura este setare TC, nu măsurătoare a coilului.</p><p id="wireValidation" role="alert"></p></details></div>';
}
function compareWirePlatforms(){if(!hasLiquid()||!state.wirePlatformChosen)return '';const candidates=compatibleWireAtoms(state.config.wire).filter(a=>a.id!==state.atom).map(a=>({atom:a,result:core.analyze(wireConfig(a.id,state.config.wire),liquid(),state.objective)})).sort((a,b)=>core.priority(b.result,state.objective)-core.priority(a.result,state.objective)),selected={atom:atom(state.atom),result:core.analyze(state.config,liquid(),state.objective)},rows=[selected,...candidates.slice(0,2)];return '<section class="module-section"><h2>Aceeași sârmă, alte interpretări.</h2><p class="module-note">'+esc(core.wires[state.config.wire].name)+' · '+esc(liquid().name)+'. Atomizorul ales și încă două potriviri calculate. Schimbarea platformei modifică mai multe caracteristici simultan, nu izolează o singură variabilă.</p><div class="wire-platform-grid">'+rows.map(r=>'<article class="wire-platform-card"><div class="wire-platform-photo">'+api.renderProductPhoto(r.atom)+'</div><h3>'+esc(r.atom.short)+'</h3><p>'+esc(api.vapeDescription(r.result,liquid()))+'</p><button type="button" class="module-link" data-wire-platform="'+r.atom.id+'">Explorează această experiență</button></article>').join('')+'</div>'+api.comparisonGraphic(rows.map(r=>({label:r.atom.short,result:r.result})),'Aceeași sârmă pe trei atomizoare')+'</section>';}

function setWireJourney(changes={}){
 const step=state.wireJourney;
 if(changes.reset){
  if(step.objective&&typeof api.setObjective==="function")api.setObjective("");
  step.wrapsConfirmed=false;step.objective=null;step.family=null;step.liquidIndex=null;
  state.wireChosen=false;state.wirePlatformChosen=false;state.wireShowAll=false;
  state.atom="gtr";state.config=core.defaultConfig("gtr");
  renderWire();return true;
 }
 if(changes.wire!==undefined&&changes.wire!==null){
  if(!core.wires[changes.wire])return false;
  if(!state.wireChosen||state.config.wire!==changes.wire){
   const rows=compatibleWireAtoms(changes.wire);
   const current=rows.find(a=>a.id===state.atom)||rows[0];
   if(!current)return false;
   const config=wireConfig(current.id,changes.wire);
   if(!config)return false;
   state.atom=current.id;state.config=config;state.wireChosen=true;
   if(!rows.some(a=>a.id===state.atom))state.wirePlatformChosen=false;
   step.wrapsConfirmed=false;
  }
 }
 if(changes.wraps!==undefined&&changes.wraps!==null){
  const wraps=Number(changes.wraps);
  if(!state.wireChosen||!core.permitted(state.atom,state.config.wire,wraps))return false;
  const thermal=core.wireSetup(state.atom,state.config.wire,wraps);
  const updated=core.config(state.atom,{...state.config,wraps,
   power:thermal.power,temp:thermal.temp});
  if(updated.wraps!==wraps)return false;
  state.config=updated;step.wrapsConfirmed=true;
  if(state.wirePlatformChosen&&!core.permitted(state.atom,updated.wire,wraps))state.wirePlatformChosen=false;
 }
 if(changes.objective!==undefined){
  if(changes.objective!==null&&!objectives.some(x=>x[0]===changes.objective))return false;
  step.objective=changes.objective;state.goalLocked=!!step.objective;
  if(step.objective)state.objective=step.objective;
  // Wire, Liquid Match and Duel share the explicit sensory objective.
  // The progressive stages still distinguish unselected versus selected.
  if(typeof api.setObjective==="function")api.setObjective(step.objective||"");
 }
 if(changes.family!==undefined){
  if(changes.family!==null&&!WIRE_FAMILIES.includes(changes.family))return false;
  if(step.family!==changes.family)step.liquidIndex=null;
  step.family=changes.family;
 }
 if(changes.liquidIndex!==undefined){
  const index=changes.liquidIndex===null?null:Number(changes.liquidIndex);
  if(index!==null&&(!Number.isInteger(index)||!catalog[index]||catalog[index].class!==step.family))return false;
  step.liquidIndex=index;
 }
 state.wireShowAll=false;
 renderWire();return true;
}

function renderWire(){
 const m=contextual();if(!m)return;
 const phys=m.result.physical,w=core.wires[state.config.wire];
 el('pageWire').innerHTML=heading('04 / WIRE ANATOMY','Wire Lab.','Cinci familii, două aliaje NiFe distincte. Geometrie explicată, caracter contextual.')+workflow(['Alege sârma','Toate atomizoarele compatibile','Experiență · lichide · comparații'])+contextBar()+
 wirePalette()+
 '<div class="wire-controls wire-picker">'+select('Alegere rapidă · sârmă','wireMaterial',[['','Alege sârma...'],...Object.entries(core.wires).map(([id,w])=>[id,w.name])],state.wireChosen?state.config.wire:'')+select('Atomizor opțional','wireAtom',[['','Toate atomizoarele active'],...(state.wireChosen?atoms.filter(a=>core.permitted(a.id,state.config.wire,state.config.wraps)):atoms).map(a=>[a.id,a.short])],state.wirePlatformChosen?state.atom:'')+select('Obiectiv','wireObjective',[['','Alege obiectivul...'],...objectives],state.wireJourney.objective||'')+'</div>'+wireJourneyControls()+wirePlatforms()+
 (state.wireChosen?window.RTA_ATLAS_SEARCH_UI.render('wire'):'')+
 '<div class="wire-selected-experience"'+(state.wirePlatformChosen?'':' hidden')+'>'+(hasLiquid()?'<div class="module-next-actions"><button type="button" class="module-link" data-route="liquid">Vezi și celelalte atomizoare pentru acest lichid ↗</button><button type="button" class="module-link" data-route="atomizer">Explorează acest atomizor în Atlas ↗</button></div>':'')+
 '<div class="wire-workspace"><div class="wire-stage"><span class="eyebrow">'+esc(core.modeFor(state.config).toUpperCase())+' / '+esc(name(state.atom))+'</span><h2>'+esc(w.name)+'</h2><div class="coil-stage">'+api.renderCoil(state.config)+'</div><div class="geometry-readout"><span><b>'+phys.widthMm+' mm</b>lățime estimată coil</span><span><b>'+esc(phys.areaMm2==null?'nefixată':phys.areaMm2+' mm²')+'</b>arie nominală aer</span></div><p class="module-note">Schemă explicativă. Aria orificiilor nu este debit; lățimea coilului este o aproximație geometrică.</p><p class="wire-identity">'+esc(state.config.wire==='nife30'&&core.modeFor(state.config)==='watt'?'NiFe30 în WATT '+state.config.power+' W · '+(core.nife30Watt.chipsets[state.config.chipset]||'chipset nespecificat')+'. La 7 spire / 12 W ai raportat temperatură mai echilibrată a vaporilor decât la 13 W. NiFe52/6 în TC este o observație distinctă.':state.atom==='gtr'&&w.type==='tc'?'GTR: Dicodes NiFe30 TCR320 / 7 spire și Zivipf NiFe52 TCR310 / 6 spire sunt la egalitate ca preferință. NiFe30/6 funcționează și rămâne selectabil; noul 7 este mai coerent în testul personal, fără dovadă de cauzalitate izolată.':state.atom==='415'&&w.type==='tc'?'415 Cool: Dicodes NiFe30 TCR320 / 7 spire și Zivipf NiFe52 TCR310 / 6 spire sunt primele alegeri personale, apoi K1 28 GA / 6 spire. Reglajele TC observate pe GTR nu se transferă pe 415.':state.atom==='klp'&&w.type==='tc'?'KLP: Dicodes NiFe30/7 și Zivipf NiFe52/6 sunt preferințe de prim nivel. Testul DNA 220°C/16 W este EXCLUSIV vechiul montaj NiFe30/6, nu un reglaj confirmat pe /7.':w.type==='tc'?'TC: Dicodes NiFe30 TCR320/7 este geometria personală nouă pe orice atomizor compatibil; Zivipf NiFe52 TCR310/6 rămâne separat. Vechiul NiFe30/6 este disponibil pentru comparație.':'Buildurile urmează permisiunile și observațiile canonice ale platformei.')+'</p>'+(!window.RTA_ATLAS_DUEL?.state.editing?'<button type="button" class="match-button" data-duel-pick="'+esc(encodeURIComponent(JSON.stringify(state.config)))+'">Compară această configurație în Duel ↗</button>':'')+'</div><section class="wire-panel">'+controls()+'</section></div>'+
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
  const target=e.target.closest?.('[data-wire-reset],[data-platform],[data-edit-wire],[data-show-liquids],[data-atlas-liquid],[data-context-liquid],[data-pick-build],[data-wire-open],[data-atlas-build],[data-journey-wire],[data-wire-platform],[data-wire-family]');if(!target)return;
  const d=target.dataset;
  if(d.wireReset){setWireJourney({reset:true});return;}
  if(d.wireFamily){setWireJourney({wire:d.wireFamily});el("wireProgress")?.scrollIntoView({block:"start",behavior:"instant"});return;}
  if(d.wirePlatform){const wire=state.config.wire,wraps=state.config.wraps;
   const cfg=state.wireChosen?wireConfig(d.wirePlatform,wire):core.defaultConfig(d.wirePlatform);
   if(cfg&&(!state.wireChosen||core.permitted(d.wirePlatform,wire,wraps))){
    const adjusted=state.wireChosen?core.config(d.wirePlatform,{...cfg,wire,wraps,...core.wireSetup(d.wirePlatform,wire,wraps)}):cfg;
    state.atom=adjusted.atom;state.config=adjusted;state.wireChosen=true;state.wirePlatformChosen=true;renderWire();
    el("pageWire")?.querySelector(".wire-workspace")?.scrollIntoView({block:"start",behavior:"instant"});
   }return;}
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
  if(id==='wireAtom'){if(!value){state.wirePlatformChosen=false;renderWire();return;}
    const cfg=state.wireChosen?wireConfig(value,state.config.wire):core.defaultConfig(value);
    if(cfg&&(!state.wireChosen||core.permitted(value,state.config.wire,state.config.wraps))){
      state.atom=value;state.config=state.wireChosen?core.config(value,{...cfg,wire:state.config.wire,wraps:state.config.wraps,...core.wireSetup(value,state.config.wire,state.config.wraps)}):cfg;
      state.wireChosen=true;state.wirePlatformChosen=true;renderWire();
    }return;}
  if(id==='wireMaterial'){if(!value){setWireJourney({reset:true});return;}
    setWireJourney({wire:value});return;}
  if(id==='wireObjective'){setWireJourney({objective:value||null});return;}
  if(id==='atlasObjective'){
   if(objectives.some(x=>x[0]===value)){state.objective=value;state.goalLocked=true;api.setObjective(value);}
   renderAtomizer();el(id)?.focus({preventScroll:true});return;
  }
  if(id==='wireJourneyWraps'){setWireJourney({wraps:Number(value)});return;}
  if(id==='wireJourneyGoal'){setWireJourney({objective:value||null});return;}
  if(id==='wireJourneyFamily'){setWireJourney({family:value||null});return;}
  if(id==='wireJourneyLiquid'){
    const index=value?Number(value):null;
    if(setWireJourney({liquidIndex:index})&&index!==null){api.selectLiquid(index);renderWire();}
    return;
  }
  const field={wireMaterial:'wire',wireWraps:'wraps',wireAir:'air',wireBell:'bell',wireDiameter:'coilMm',wirePosition:'position',wirePower:'power',wireTemp:'temp',wireRegime:'regime',wireChipset:'chipset'}[id];
  if(field){
   if(['power','temp'].includes(field)&&!e.target.checkValidity()){el('wireValidation').textContent='Introdu o valoare în intervalul afișat. Configurația curentă este păstrată.';return;}
   const changed=['wraps','coilMm','power','temp'].includes(field)?Number(value):value;
   if(field==='wraps'){setWireJourney({wraps:changed});return;}
   setConfig({[field]:changed});renderWire();el(id)?.focus({preventScroll:true});
  }
 });
 document.addEventListener('toggle',e=>{
   if(e.target.classList?.contains('wire-compatible-more'))state.wireShowAll=e.target.open;
   const id=e.target.dataset?.wireLiquids;
   if(id&&e.target.open){
     const cfg=wireConfig(id,state.config.wire);
     e.target.querySelector('.journey-liquid-list').innerHTML=liquidButtons(cfg);
   }
 },true);
 const route=window.location.hash.slice(1);if(['atomizer','wire'].includes(route))api.route(route,false);
}
window.RTA_ATLAS_MODULES={routes:['atomizer','wire'],show,init,state,inventory,contextual,filteredAtoms,selectAtom,setConfig,clSnapshot,objectiveLabel,storedBuild,sameStored,topLiquids,contextBar,workflow,hasLiquid,compatibleWireAtoms,wireConfig,buildLeads,buildFacts,materialPaths,wireSavedBuilds,wirePalette,wireJourneyControls,wirePlatformMatches,wirePlatforms,setWireJourney};
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
})();
