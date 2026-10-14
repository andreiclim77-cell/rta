/* Atlas adapters. Canonical engines and personal storage are never rewritten. */
(function(){
"use strict";
const core=window.RTA_SENSORY_CORE,fit=window.RTA_BELL_LIQUID_FIT,api=window.RTA_ATLAS_PREVIEW;
if(!core||!fit||!api)return;
const atoms=window.RTA_CORE.atoms,catalog=window.RTA_LIQUIDS;
const inventory={"415":1,kprime:2,gtone:4,dvarwcl:3,muted:4,gtr:5,dvarwfl:2,diplomat:3,kx:4,klp:5,asylum:2,pmfree:2,pmstd:2,byka:1,kv3:1,minister:1};
const objectives=[['complete','Armonie + palat'],['layers','Stratificare'],['th','Ofensivă + TH'],['tobacco','Tutun în prim-plan'],['body','Corp + densitate'],['smooth','Finețe']];
const state={atom:'gtr',query:'',category:'all',config:core.defaultConfig('gtr'),objective:'layers',goalLocked:false,liquidsOpen:false,advanced:false};
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const el=id=>document.getElementById(id);
const liquid=()=>catalog[api.state.liquidIndex];
const atom=id=>atoms.find(a=>a.id===id);
const name=id=>atom(id)?.short||id;
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
   if(old.dvarwcl&&typeof old.dvarwcl==='object'){units[0].draft=core.config('dvarwcl',old.dvarwcl);units[0].source='legacy';}
   return {available:!!storage,units};
  }
  const data=JSON.parse(raw);
  if(data.schema!==1||!Array.isArray(data.units)||data.units.length!==3)throw new Error('format');
  if(data.units.some(u=>!u||['saved','draft'].some(k=>u[k]&&(typeof u[k]!=='object'||Array.isArray(u[k])||(u[k].atom&&u[k].atom!=='dvarwcl')))))throw new Error('unit');
  return {available:true,units:data.units.map(u=>({saved:u?.saved||null,draft:u?.draft||null,source:u?.source||null}))};
 }catch(e){return {available:false,units:[],error:'Stocarea nu este accesibilă sau formatul necesită verificare în V10.'};}
}
function filteredAtoms(query=state.query,category=state.category){
 const q=String(query).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return atoms.filter(a=>{
  const txt=[a.short,a.airflow?.system,core.platforms[a.id]?.note].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(!txt.includes(q))return false;
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
function contextBar(){
 const mood=window.RTA_MOOD_MATCH.moods.find(m=>m.id===api.state.mood),moment=window.RTA_MOOD_MATCH.moments.find(m=>m.id===api.state.moment);
 return '<div class="atlas-context"><span>'+esc([liquid()?.brand,liquid()?.name,mood?.name,moment?.name].filter(Boolean).join(' · '))+'</span><button type="button" data-route="liquid">Schimbă contextul ↗</button></div>';
}
function heading(kicker,title,description){return '<div class="module-intro"><span class="eyebrow">'+kicker+'</span><h1>'+title+'</h1><p>'+description+'</p></div>';}
function metricPanel(result){
 return '<div class="atlas-dna">'+core.dimensions.map(d=>{
  if(d.id==='pleasure')return '<div class="dna-row"><span>'+esc(d.title)+'</span><strong>'+esc(result.pleasure||result.personalPreference?.label||'În așteptarea unui A/B')+'</strong><small>Observație sau preferință personală; fără scor predictiv.</small></div>';
  const value=result.dimensions[d.id];
  return '<div class="dna-row"><span>'+esc(d.title)+'</span><strong>'+esc(result.labels[d.id])+'</strong><div class="dna-scale" aria-hidden="true">'+[1,2,3,4,5].map(n=>'<i class="'+(value>=n-.3?'lit':'')+'"></i>').join('')+'</div></div>';
 }).join('')+'<p class="module-note">Model calitativ orientativ. Barele nu sunt măsurători sau procente de plăcere.</p></div>';
}
function method(result){
 return '<details class="module-method"><summary>De ce propune această configurație?</summary><p>'+esc(api.evidenceFor(result,liquid()).label)+'</p>'+result.notes.map(n=>'<p>'+esc(n)+'</p>').join('')+'<p>'+esc(result.modelWarning)+'</p></details>';
}
function watchPanel(builds){
 return '<div class="watchlist"><div class="watch-item"><b>WATCH A / din experiența ta</b><p>'+esc(builds[1]?'Merită comparat '+api.buildString(builds[1])+'. Este o direcție contextuală, nu A/B confirmat pe lichidul ales.':'Nu există altă combinație compatibilă documentată.')+'</p></div><div class="watch-item market"><b>WATCH B / din piață</b><p>Semnal de piață insuficient pentru această configurație. Sursele vor fi legate numai după verificare.</p></div></div>';
}
function physicalUnits(id){
 if(id!=='dvarwcl')return '<div class="physical-units"><h3>'+inventory[id]+' '+(inventory[id]===1?'exemplar fizic':'exemplare fizice')+'</h3><p>Inventar confirmat. Configurațiile individuale nu sunt presupuse identice sau montate.</p></div>';
 const snapshot=clSnapshot();
 return '<div class="physical-units"><h3>Cele trei Dvarw CL</h3>'+(!snapshot.available?'<p role="status">'+esc(snapshot.error||'Stocare indisponibilă')+'</p>':snapshot.units.map((u,i)=>'<div class="unit-row"><b>CL '+(i+1)+'</b><span>'+esc(u.saved?'Înregistrat'+(u.draft&&JSON.stringify(u.draft)!==JSON.stringify(u.saved)?' · modificări nesalvate':''):u.draft?'Proiect nesalvat':'Neînregistrat')+'</span><small>'+esc(u.saved?api.buildString({config:core.config('dvarwcl',u.saved)}):u.draft?api.buildString({config:core.config('dvarwcl',u.draft)}):'Niciun montaj declarat')+'</small></div>').join(''))+'<p>Fișele sunt citite din același browser, fără rescriere. Înregistrarea sau modificarea unui montaj se face în configuratorul V10.</p><a class="module-link" href="../#atomExplorer">Deschide fișele CL în V10 ↗</a></div>';
}
function catalogCards(){
 const rows=filteredAtoms();
 return '<p class="module-note" role="status">'+rows.length+' din 16 platforme · 42 exemplare în colecție</p><div class="atlas-catalog">'+rows.map(a=>'<button type="button" class="platform-tile'+(a.id===state.atom?' selected':'')+'" data-platform="'+a.id+'" aria-pressed="'+(a.id===state.atom)+'"><span class="platform-photo">'+api.renderProductPhoto(a)+'</span><strong>'+esc(a.short)+'</strong><small>'+inventory[a.id]+' '+(inventory[a.id]===1?'exemplar':'exemplare')+' · '+esc(core.platforms[a.id].pattern)+'</small></button>').join('')+'</div>'+(rows.length?'':'<p>Nu există platforme care corespund filtrului. Schimbă căutarea sau categoria.</p>');
}
function renderCatalog(){const host=el('atlasCatalog');if(host)host.innerHTML=catalogCards();}
function renderAtomizer(){
 const model=contextual();if(!model)return;
 const categories=fit.analyze(model.atom,state.config.bell,catalog).classes;
 el('pageAtomizer').innerHTML=heading('03 / COLLECTION DNA','Atomizer Atlas.','16 identități. 42 de exemplare. Un rezultat potrivit contextului tău.')+contextBar()+
 '<div class="module-filters platform-picker">'+select('Alege platforma','atlasPlatform',atoms.map(a=>[a.id,a.short]),state.atom)+select('Obiectiv','atlasObjective',objectives,state.objective)+'</div>'+
 '<div class="atlas-detail"><div class="atlas-portrait"><div class="portrait-photo">'+api.renderProductPhoto(model.atom)+'</div><span class="eyebrow">'+inventory[state.atom]+' EXEMPLARE / '+esc(core.platforms[state.atom].pattern)+'</span><h2>'+esc(model.atom.short)+'</h2><p>'+esc(core.platforms[state.atom].note)+'</p><button type="button" class="match-button" data-edit-wire>Explorează sârma și buildul ↗</button></div><div><span class="eyebrow">SENSORY DNA / CONTEXTUAL</span>'+metricPanel(model.result)+method(model.result)+'</div></div>'+
 '<section class="module-section"><div class="section-heading"><span class="eyebrow">BEST + ALTERNATIVE / '+esc(liquid().name)+'</span><h2>Trei builduri pentru acest context.</h2></div><div class="detail-grid">'+model.builds.map((b,i)=>api.renderBuild(b,i+1,liquid())).join('')+'</div>'+watchPanel(model.builds)+'</section>'+
 '<section class="module-section"><h2>Lichide și cameră.</h2><p class="module-note">Afinitate orientativă pentru clopotul ales; nu reprezintă testarea fiecărui lichid.</p><div class="family-tags">'+categories.map(c=>'<span>'+esc(c.name)+'</span>').join('')+'</div><button type="button" class="module-link" data-show-liquids>Explorează toate cele 620 de lichide</button><div id="platformLiquids"></div></section>'+physicalUnits(state.atom)+
 '<section class="module-section"><h2>Colecția.</h2><div class="module-filters"><label>Caută o platformă<input id="atlasSearch" type="search" value="'+esc(state.query)+'" placeholder="Nume, airflow, caracter"></label>'+select('Familie de lichide','atlasCategory',[['all','Toate familiile'],...fit.classes.map(c=>[c,c])],state.category)+'</div><div id="atlasCatalog">'+catalogCards()+'</div></section>';
}
function controls(){
 const cfg=state.config,p=core.platforms[state.atom];
 const wires=Object.entries(core.wires).filter(([id])=>core.variants(state.atom).some(v=>v.wire===id));
 const wraps=core.variants(state.atom).filter(v=>v.wire===cfg.wire).map(v=>[v.wraps,v.wraps+' spire']);
 return '<div class="wire-controls">'+select('Obiectiv','wireObjective',objectives,state.objective)+select('Spire','wireWraps',wraps,cfg.wraps)+select('Insert / aer','wireAir',p.air.map(a=>[a.id,a.label]),cfg.air)+select('Cameră / clopot','wireBell',fit.config(state.atom).bells.map(b=>[b.id,b.name]),cfg.bell)+
 '<details class="wire-advanced"'+(state.advanced?' open':'')+'><summary>Geometrie și energie</summary><div class="wire-controls">'+select('Ø coil','wireDiameter',[[2,'2,0 mm'],[2.5,'2,5 mm'],[3,'3,0 mm']],cfg.coilMm)+select('Poziție coil','wirePosition',[['low','Mai jos'],['standard','Standard'],['high','Mai sus']],cfg.position)+'<label>Putere / plafon W<input id="wirePower" type="number" required min="7" max="20" step="0.1" value="'+cfg.power+'"></label>'+(core.wires[cfg.wire].type==='tc'?'<label>Setare TC °C<input id="wireTemp" type="number" required min="180" max="270" step="1" value="'+cfg.temp+'"></label>':'')+'</div><p class="module-note">Preseturi orientative din Lab. Limita W nu este putere aplicată permanent; temperatura este setare TC, nu măsurătoare a coilului.</p><p id="wireValidation" role="alert"></p></details></div>';
}
function renderWire(){
 const m=contextual();if(!m)return;
 const phys=m.result.physical,w=core.wires[state.config.wire];
 el('pageWire').innerHTML=heading('04 / WIRE ANATOMY','Wire Lab.','Cinci familii, două aliaje NiFe distincte. Geometrie explicată, caracter contextual.')+contextBar()+
 '<div class="wire-controls wire-picker">'+select('Platformă','wireAtom',atoms.map(a=>[a.id,a.short]),state.atom)+select('Material / aliaj','wireMaterial',Object.entries(core.wires).filter(([id])=>core.variants(state.atom).some(v=>v.wire===id)).map(([id,w])=>[id,w.name]),state.config.wire)+'</div>'+
 '<div class="wire-workspace"><div class="wire-stage"><span class="eyebrow">'+esc(w.mode)+' / '+esc(name(state.atom))+'</span><h2>'+esc(w.name)+'</h2><div class="coil-stage">'+api.renderCoil(state.config)+'</div><div class="geometry-readout"><span><b>'+phys.widthMm+' mm</b>lățime estimată coil</span><span><b>'+esc(phys.areaMm2==null?'nefixată':phys.areaMm2+' mm²')+'</b>arie nominală aer</span></div><p class="module-note">Schemă explicativă. Aria orificiilor nu este debit; lățimea coilului este o aproximație geometrică.</p><p class="wire-identity">'+esc(state.atom==='klp'&&w.type==='tc'?'KLP: Dicodes NiFe30 și Zivipf NiFe52 sunt ambele preferințe personale de prim nivel. Reglajul DNA 220°C/16 W este raportat numai pentru Dicodes.':w.type==='tc'?'TC: Dicodes NiFe30 TCR320 și Zivipf NiFe52 TCR310 sunt materiale distincte, cu 6 spire în baseline.':'Buildurile urmează permisiunile și observațiile canonice ale platformei.')+'</p></div><section class="wire-panel">'+controls()+'</section></div>'+
 '<section class="module-section"><h2>Ce oferă această configurație.</h2>'+metricPanel(m.result)+'<div class="gain-trade"><div><h3>Avantaje orientative</h3><ul>'+m.result.advantages.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><div><h3>Compromisuri</h3><ul>'+m.result.tradeoffs.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div></div>'+method(m.result)+'</section>'+
 '<section class="module-section"><h2>Alte trei configurații pentru comparație.</h2><div class="detail-grid">'+m.builds.map((b,i)=>'<div>'+api.renderBuild(b,i+1,liquid())+'<button type="button" class="module-link" data-pick-build="'+i+'">Explorează acest build</button></div>').join('')+'</div>'+watchPanel(m.builds)+'</section>';
}
function show(to){
 if(!state.goalLocked)state.objective=window.RTA_MOOD_MATCH.moods.find(m=>m.id===api.state.mood)?.goal||'complete';
 for(const [route,id] of [['atomizer','pageAtomizer'],['wire','pageWire']]){const page=el(id);if(page)page.hidden=route!==to;}
 if(to==='atomizer')renderAtomizer();if(to==='wire')renderWire();
}
function init(){
 const host=el('main');if(!host)return;
 for(const [id,label] of [['pageAtomizer','Atomizer Atlas'],['pageWire','Wire Lab']]){
  const section=document.createElement('section');section.id=id;section.className='page atlas-module frame';section.hidden=true;section.setAttribute('aria-label',label);host.appendChild(section);
 }
 document.querySelectorAll('.gateway-future').forEach((card,i)=>{
  card.setAttribute('role','button');card.setAttribute('tabindex','0');card.dataset.route=i===0?'atomizer':'wire';
  const caption=card.querySelector('.gateway-bottom');if(caption)caption.textContent='EXPLOREAZĂ ↗';
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();api.route(card.dataset.route);}});
 });
 document.addEventListener('click',e=>{
  const target=e.target.closest?.('[data-platform],[data-edit-wire],[data-show-liquids],[data-atlas-liquid],[data-pick-build]');if(!target)return;
  const d=target.dataset;
  if(d.platform){selectAtom(d.platform);renderAtomizer();el('pageAtomizer').scrollIntoView({block:'start',behavior:'instant'});}
  if(d.editWire!=null)api.route('wire');
  if(d.showLiquids!=null){
   const rows=core.matchLiquids(state.config,catalog,state.objective,0);
   el('platformLiquids').innerHTML='<p class="module-note">Toate cele '+rows.length+' lichide analizate. Primele 12 potriviri contextuale.</p><div class="liquid-links">'+rows.slice(0,12).map(r=>'<button type="button" data-atlas-liquid="'+r.index+'"><b>'+esc(r.liquid.brand+' · '+r.liquid.name)+'</b><small>'+esc(r.liquid.class)+'</small></button>').join('')+'</div>';
  }
  if(d.atlasLiquid!=null){api.selectLiquid(Number(d.atlasLiquid));api.route('liquid');}
  if(d.pickBuild!=null){const build=contextual().builds[Number(d.pickBuild)];if(build){state.config={...build.config};renderWire();}}
 });
 document.addEventListener('input',e=>{if(e.target.id==='atlasSearch'){state.query=e.target.value;renderCatalog();}});
 document.addEventListener('change',e=>{
  const id=e.target.id,value=e.target.value;
  if(id.startsWith('wire'))state.advanced=!!el('pageWire').querySelector('.wire-advanced')?.open;
  if(id==='atlasCategory'){state.category=value;renderCatalog();return;}
  if(id==='atlasPlatform'){selectAtom(value);renderAtomizer();el(id).focus({preventScroll:true});return;}
  if(id==='wireAtom'){selectAtom(value);renderWire();return;}
  if(id==='wireObjective'||id==='atlasObjective'){
   if(objectives.some(x=>x[0]===value)){state.objective=value;state.goalLocked=true;}
   if(id==='atlasObjective')renderAtomizer();else renderWire();el(id)?.focus({preventScroll:true});return;
  }
  const field={wireMaterial:'wire',wireWraps:'wraps',wireAir:'air',wireBell:'bell',wireDiameter:'coilMm',wirePosition:'position',wirePower:'power',wireTemp:'temp'}[id];
  if(field){
   if(['power','temp'].includes(field)&&!e.target.checkValidity()){el('wireValidation').textContent='Introdu o valoare în intervalul afișat. Configurația curentă este păstrată.';return;}
   setConfig({[field]:['wraps','coilMm','power','temp'].includes(field)?Number(value):value});renderWire();el(id)?.focus({preventScroll:true});
  }
 });
 const route=window.location.hash.slice(1);if(['atomizer','wire'].includes(route))api.route(route,false);
}
window.RTA_ATLAS_MODULES={routes:['atomizer','wire'],show,init,state,inventory,contextual,filteredAtoms,selectAtom,setConfig,clSnapshot};
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
})();
