/* RTA Sensory DNA · three independent physical Dvarw CL unit profiles, 14.10.2026 */
(function(){
"use strict";
const core=window.RTA_SENSORY_CORE;
if(!core)return;
const fit=window.RTA_BELL_LIQUID_FIT;
const storeKey="rta-sensory-dna-choice-20261013";
const viewKey="rta-sensory-dna-active-view";
const physicalClKey="rta-cl-physical-units-v1-20261014";
const physicalClCount=3;
const configFields=["atom","bell","air","wire","wraps","coilMm","position","power","temp"];
const blankClUnit=()=>({saved:null,draft:null,source:null});
const states={explorer:{atom:"",category:"NET complex"},main:{atom:"",category:"NET complex"}};
let configs={},active="explorer";
try{
 const data=window.localStorage&&JSON.parse(window.localStorage.getItem(storeKey)||"{}");
 if(data&&typeof data==="object"&&!Array.isArray(data))configs=data;
 active=window.localStorage&&window.localStorage.getItem(viewKey)==="main"?"main":"explorer";
}catch(error){configs={};}
// The previous single per-platform CL choice is a DRAFT on CL #1, never
// evidence that a physical unit has that coil or insert mounted.
let physicalClUnits=Array.from({length:physicalClCount},blankClUnit);
let activePhysicalCl=0;
let physicalClStorageAvailable=true;
function normalizedClConfig(raw){
 if(!raw||typeof raw!=="object"||Array.isArray(raw) ||
    (raw.atom!=null && raw.atom!=="dvarwcl"))return null;
 const changes={};
 for(const key of configFields)if(Object.prototype.hasOwnProperty.call(raw,key))
  changes[key]=raw[key];
 return core.config("dvarwcl",changes);
}
function loadPhysicalClUnits(){
 try{
  if(!window.localStorage){physicalClStorageAvailable=false;return;}
  const raw=window.localStorage.getItem(physicalClKey);
  if(raw!==null){
   const data=JSON.parse(raw);
   if(data&&data.schema===1&&Array.isArray(data.units)&&data.units.length===physicalClCount){
    physicalClUnits=data.units.map(unit=>({
     saved:normalizedClConfig(unit&&unit.saved),
     draft:normalizedClConfig(unit&&unit.draft),
     source:unit&&unit.source==="legacy"?"legacy":null
    }));
    if(Number.isInteger(data.active)&&data.active>=0&&data.active<physicalClCount)
      activePhysicalCl=data.active;
    return;
   }
  }
  if(configs.dvarwcl){
   physicalClUnits[0].draft=normalizedClConfig(configs.dvarwcl);
   if(physicalClUnits[0].draft)physicalClUnits[0].source="legacy";
  }
 }catch(error){physicalClStorageAvailable=false;}
}
function persistPhysicalClUnits(){
 if(!physicalClStorageAvailable)return;
 try{
  if(!window.localStorage){physicalClStorageAvailable=false;return;}
  window.localStorage.setItem(physicalClKey,JSON.stringify({
   schema:1,active:activePhysicalCl,units:physicalClUnits
  }));
 }catch(error){physicalClStorageAvailable=false;}
}
function equalPhysicalConfigs(a,b){
 if(!a||!b)return a===b;
 return configFields.every(k=>a[k]===b[k]);
}
function physicalClStatus(unit){
 if(!unit.saved&&!unit.draft)return "Neînregistrat";
 if(unit.source==="legacy"&&!unit.saved)return "Import vechi · nesalvat";
 if(!unit.saved)return "Proiect nesalvat";
 return equalPhysicalConfigs(unit.saved,unit.draft||unit.saved)?"Înregistrat":"Modificări nesalvate";
}
function physicalClState(){
 return {active:activePhysicalCl+1,storageAvailable:physicalClStorageAvailable,
  units:physicalClUnits.map((unit,i)=>({
   number:i+1,status:physicalClStatus(unit),source:unit.source,
   saved:unit.saved?{...unit.saved}:null,draft:unit.draft?{...unit.draft}:null
  }))};
}
loadPhysicalClUnits();
const el=id=>document.getElementById(id);
const esc=x=>String(x==null?"":x).replace(/&/g,"&amp;").replace(/</g,"&lt;")
 .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const getAtom=id=>(window.RTA_CORE&&window.RTA_CORE.atoms||[]).find(x=>x.id===id);
const classes=["Tutun simplu","Tutun complex","NET simplu","NET complex"];
const objectives=[
 {id:"complete",text:"Armonie + palat"},
 {id:"layers",text:"Stratificare / NET"},
 {id:"th",text:"Ofensivă + TH"},
 {id:"tobacco",text:"Tutun în prim-plan"},
 {id:"body",text:"Corp + densitate"},
 {id:"smooth",text:"Finețe + feeling"}
];
function remember(){
 try{if(window.localStorage)window.localStorage.setItem(storeKey,JSON.stringify(configs));}catch(error){}
}
function currentObjective(){
 if(typeof state!=="undefined" && state && state.objective)return state.objective;
 return "complete";
}
function chooseObjective(objective){
 if(!objectives.some(x=>x.id===objective))return;
 // Objective is shared with the existing engine; buttons remain in sync.
 if(typeof setObjective==="function"){
  setObjective(objective);
 } else if(typeof state!=="undefined"&&state)state.objective=objective;
}
function currentAtom(view){
 const s=el(view==="explorer"?"atomExplorer":"atom");
 return s?getAtom(s.value):null;
}
function existingBell(view){
 const selector=el("bl-bell-"+view);
 return selector&&selector.value?selector.value:null;
}
function configFor(atomId,view){
 const preset=core.defaultConfig(atomId);
 if(!preset)return null;
 if(atomId==="dvarwcl"){
  const unit=physicalClUnits[activePhysicalCl];
  const selected=unit.draft||unit.saved||preset;
  return core.config(atomId,{...preset,...selected,bell:selected.bell||preset.bell});
 }
 const saved=configs[atomId]||{};
 const target=core.config(atomId,{...preset,...saved,
  bell:saved.bell||existingBell(view)||preset.bell});
 return target;
}
function setConfig(atomId,changes,view){
 const before=configFor(atomId,view);
 const next=core.config(atomId,{...before,...changes});
 if(changes.wire && next.wire!==before.wire){
  // Never carry an unrelated fixed wattage into another wire.
  const preset=core.wireSetup(atomId,next.wire);
  next.power=preset.power;
  next.temp=preset.temp;
 }
 if(atomId==="dvarwcl"){
  physicalClUnits[activePhysicalCl].draft=next;
  persistPhysicalClUnits();
 }else{
  configs[atomId]=next;
  remember();
 }
 return next;
}
function representative(view){
 if(view==="main"&&typeof state!=="undefined"&&state&&state.liquid)
  return state.liquid;
 const category=states[view].category||"NET complex";
 return {class:category,brand:"Profil generic",name:category,
  profile:category==="NET complex"?"Latakia Oriental English blend, stratificare":
   category==="Tutun complex"?"Tutun nuci cremă cu note aromatice":
   category==="NET simplu"?"Frunză naturală monovarietală":
    "Tutun clasic, direct",tags:category.endsWith("complex")?["layers"]:["simple"]};
}
function choice(name,value,options,view,disabled=false){
 return '<label class="sd-field"><span>'+esc(name)+'</span><select data-sd-field="'+esc(value)+'"'+
  (disabled?' disabled':'')+' aria-label="'+esc(name)+'">'+
  options.map(o=>'<option value="'+esc(o.value)+'"'+(String(o.value)===String(o.selected)?' selected':'')+
    (o.disabled?' disabled':'')+'>'+esc(o.label)+'</option>').join("")+'</select></label>';
}
function selected(list,current,labelFn,valueFn){
 return list.map(x=>({label:labelFn(x),value:valueFn(x),selected:current}));
}
function buildSelect(config){
 const items=core.variants(config.atom).filter(x=>x.wire===config.wire);
 return choice("Spire","wraps",items.map(x=>({value:x.wraps,label:x.wraps+" contact",selected:config.wraps})),null,items.length===1);
}
function physicalClMarkup(config){
 if(config.atom!=="dvarwcl")return "";
 const cards=physicalClUnits.map((unit,i)=>{
  const current=i===activePhysicalCl,status=physicalClStatus(unit);
  const details=unit.draft||unit.saved;
  const air=details?core.platforms.dvarwcl.air.find(a=>a.id===details.air):null;
  const summary=details?(air?air.label:"Insertul selectat")+" · "+
   core.wires[details.wire].name+" · "+details.wraps+" spire":
   "Fără configurație fizică înregistrată";
  return '<button type="button" class="sd-cl-unit'+(current?' is-active':'')+
   '" data-sd-cl-unit="'+(i+1)+'" aria-pressed="'+(current?'true':'false')+'">'+
   '<strong>CL '+(i+1)+'</strong><span>'+esc(status)+'</span>'+
   '<small>'+esc(summary)+'</small></button>';
 }).join("");
 const unit=physicalClUnits[activePhysicalCl],status=physicalClStatus(unit);
 const changes=!!unit.draft&&(!unit.saved||!equalPhysicalConfigs(unit.saved,unit.draft));
 return '<div class="sd-cl-instances" role="group" aria-label="Trei Dvarw CL fizice">'+
  '<div class="sd-cl-instances-head"><strong>Cele 3 exemplare Dvarw CL</strong>'+
  '<small>Fișe separate · fără suprascriere între exemplare</small></div>'+
  '<div class="sd-cl-instances-grid">'+cards+'</div>'+
  '<div class="sd-cl-edit-status" aria-live="polite">Editezi <strong>CL '+
   (activePhysicalCl+1)+'</strong> · '+esc(status)+'</div>'+
  '<div class="sd-cl-instance-actions">'+
   '<button type="button" data-sd-cl-save="1">Înregistrează setupul pentru CL '+(activePhysicalCl+1)+'</button>'+
   (changes?'<button type="button" class="sd-cl-secondary" data-sd-cl-revert="1">Renunță la modificările acestui CL</button>':'')+
  '</div>'+
  '<p class="sd-cl-instance-note">Un CL neînregistrat afișează doar un <b>preset orientativ</b>, nu un build presupus montat. Modificările sunt proiecte separate; butonul „Înregistrează” confirmă fișa pentru exemplarul ales. Înregistrarea nu verifică fizic montajul.'+
  (unit.source==="legacy"&&!unit.saved?' Configurația veche la nivel de platformă a fost importată numai ca proiect pentru CL 1; verific-o înainte de a o înregistra.':'')+
  (!physicalClStorageAvailable?' Stocarea locală nu este disponibilă: datele rămân numai în această sesiune.':'')+
  '</p></div>';
}
function personalSetupsMarkup(config){
 const rows=core.personalSetups(config.atom);
 if(!rows.length)return "";
 return '<div class="sd-setups" role="group" aria-label="Configurații Dvarw CL validate personal">'+
  '<div class="sd-setups-heading"><strong>Două configurații Dvarw CL care funcționează</strong>'+
  '<small>Alege simultan insertul, materialul și spirele</small></div>'+
  '<div class="sd-setups-grid">'+rows.map(s=>{
   const current=config.air===s.air&&config.wire===s.wire&&config.wraps===s.wraps;
   return '<button type="button" data-sd-preset="'+esc(s.id)+'" class="sd-setup-choice'+
    (current?' is-current':'')+'" aria-pressed="'+(current?'true':'false')+'">'+
    '<span class="sd-setup-tag">'+esc(s.status)+'</span>'+
    '<strong>'+esc(s.title)+'</strong><small>'+esc(s.detail)+'</small>'+
    '<em>'+esc(s.evidence)+'</em>'+
    '<span class="sd-setup-state">'+(current?'CONFIGURAȚIE ACTIVĂ':'APLICĂ SETUPUL')+'</span></button>';
  }).join("")+'</div>'+
  '<p class="sd-setup-caveat">Nu este un A/B izolat al insertului: între variante treci și de la 6 la 5 spire. Diametrul, puterea și poziția rămân cele alese în configurator; nu le prezentăm drept măsurători din test.</p></div>';
}
function narrative(result){
 const rows=core.dimensions.map(d=>{
  if(d.id==="pleasure"){
   return '<div class="sd-metric sd-personal"><span>'+esc(d.title)+'</span>'+
    '<strong>'+esc(result.pleasure||"În așteptarea unui A/B")+'</strong>'+
    '<small>'+(result.pleasure?(result.partialEvidence&&result.partialEvidence.length?"observație parțială · airflow/lichid neprecizate":"observație personală, fără extrapolare universală"):"nu simulăm numeric plăcerea")+'</small></div>';
  }
  const n=Math.max(1,Math.min(5,result.dimensions[d.id]));
  const sticks=[1,2,3,4,5].map(i=>'<i'+(n>=i-.3?' class="on"':'')+'></i>').join("");
  return '<div class="sd-metric"><span>'+esc(d.title)+'</span><strong>'+
   esc(result.labels[d.id])+'</strong><div class="sd-meter" aria-label="'+
   esc(result.labels[d.id])+'">'+sticks+'</div></div>';
 }).join("");
 return '<div class="sd-metrics">'+rows+'</div>';
}
function listSummary(arr){return '<ul>'+arr.map(t=>'<li>'+esc(t)+'</li>').join("")+'</ul>';}
function topBuilds(config,liquid,objective){
 const arr=core.rankBuilds(config.atom,liquid,objective,{
   bell:config.bell,air:config.air,position:config.position,coilMm:config.coilMm
 });
 return arr.slice(0,3).map((x,i)=>{
  const b=x.config,wire=core.wires[b.wire];
  const sel=config.wire===b.wire&&config.wraps===b.wraps;
  const t=wire.type==="tc"?"TC "+b.temp+"°C":"WATT "+b.power+" W";
  return '<button type="button" class="sd-build'+(sel?' selected':'')+'" data-sd-pick-wire="'+
   esc(b.wire)+'" data-sd-pick-wraps="'+b.wraps+'"><span class="sd-build-rank">'+
   (i+1)+'</span><span class="sd-build-title"><strong>'+esc(wire.name)+
   ' · '+b.wraps+' spire</strong><small>'+t+' · '+esc(x.personalPreference?x.personalPreference.label:x.certainty)+
   '</small></span><span class="sd-build-indicator">'+(sel?'SELECTAT':'ALEGE')+'</span></button>';
 }).join("");
}
function recommendationRows(config,objective){
 const all=window.RTA_LIQUIDS||[];
 const items=core.matchLiquids(config,all,objective,6);
 return items.map((x,i)=>'<div class="sd-liquid"><span>'+(i+1)+'</span><div><b>'+
  esc(x.liquid.brand)+' · '+esc(x.liquid.name)+'</b><small>'+
  esc(x.liquid.class)+' · '+esc(x.liquid.profile||"")+'</small></div>'+
  '<button type="button" title="Folosește lichidul în motor" data-sd-liquid="'+x.index+'">În motor ↗</button></div>').join("");
}

function stageIds(view){
 return {config:"sd-"+view+"-config",dna:"sd-"+view+"-dna",
  recommendations:"sd-"+view+"-recommendations"};
}
function stageHeading(view,key,number,title,description){
 const id=stageIds(view)[key];
 return '<div class="sd-stage-head"><span class="sd-stage-step">'+number+
  ' / 03</span><div><h4 id="'+id+'-title">'+esc(title)+'</h4><p>'+
  esc(description)+'</p></div></div>';
}
function stageNav(view){
 const ids=stageIds(view);
 const steps=[
  {key:"config",number:"01",title:"Configurator",hint:"Cameră · airflow · build"},
  {key:"dna",number:"02",title:"Sensory DNA",hint:"Profil · dovezi · compromisuri"},
  {key:"recommendations",number:"03",title:"Recomandări",hint:"Builduri · lichide"}
 ];
 return '<nav class="sd-journey" aria-label="Navigare în cele trei zone ale evaluării">'+
  steps.map(s=>'<a href="#'+ids[s.key]+'" data-sd-stage="'+s.key+'"><span>'+
   s.number+'</span><strong>'+esc(s.title)+'</strong><small>'+esc(s.hint)+
   '</small></a>').join("")+'</nav>';
}
function content(view){
 const atom=currentAtom(view);
 if(!atom)return "";
 const config=configFor(atom.id,view),tech=core.platforms[atom.id];
 const liquid=representative(view);
 const objective=currentObjective(),analysis=core.analyze(config,liquid,objective);
 const wire=core.wires[config.wire],bellCfg=fit.config(atom.id);
 const sameBuildRows=topBuilds(config,liquid,objective);
 const airCfg=tech.air.find(a=>a.id===config.air);
 const technical=[
  "Structură "+tech.pattern,
  airCfg.holes?airCfg.holes.map(n=>n.toString().replace(".",",")).join(" + ")+" mm":"AFC fără cote inventate",
  wire.type==="tc"?"TC":"WATT",
  analysis.physical.areaMm2==null?"Arie nedefinită":"Arie nominală "+analysis.physical.areaMm2+" mm²"
 ];
 const isTC=wire.type==="tc";
 const stage=stageIds(view);
 let profileControls=view==="explorer"?
  '<label class="sd-field sd-profile-field"><span>Profil de lichid pentru evaluare</span><select data-sd-profile="explorer">'+
  classes.map(t=>'<option value="'+esc(t)+'"'+(states.explorer.category===t?' selected':'')+'>'+esc(t)+'</option>').join("")+
  '</select></label>':'<div class="sd-liquid-context">Lichid selectat: <b>'+
   esc((liquid.brand||"")+" · "+(liquid.name||""))+'</b></div>';
 const bellOptions=bellCfg.bells.map(b=>({value:b.id,label:b.name,selected:config.bell}));
 const airOptions=selected(tech.air,config.air,x=>x.label,x=>x.id);
 const wireOptions=Object.entries(core.wires)
  .filter(([key])=>core.variants(atom.id).some(x=>x.wire===key))
  .map(([id,w])=>({value:id,label:w.name,selected:config.wire}));
 const opts=objectives.map(o=>({value:o.id,label:o.text,selected:objective}));
 const altWires=sameBuildRows;
 let experimental="";
 if(analysis.anchors.length)experimental='<span class="sd-confidence sd-confirmed">OBSERVAȚIE PERSONALĂ</span>';
 else if(analysis.partialEvidence&&analysis.partialEvidence.length)experimental='<span class="sd-confidence">OBSERVAȚIE PARȚIALĂ + MODEL</span>';
 else experimental='<span class="sd-confidence">EXTRAPOLAT TEHNIC</span>';
 return '<div class="sd-heading"><div><span class="sd-eyebrow">RTA SENSORY DNA · CONFIGURATOR</span>'+
  '<h3>'+esc(atom.short)+'</h3><p>Predicție după geometrie, cameră, aer și build; calibrată cu A/B personale.</p></div>'+
  experimental+'</div>'+
  '<div class="sd-context">'+technical.map(x=>'<span>'+esc(x)+'</span>').join("")+'</div>'+
  stageNav(view)+
  '<section class="sd-stage sd-stage--config" id="'+stage.config+'" aria-labelledby="'+stage.config+'-title">'+
  stageHeading(view,"config","01","Configurator","Alege configurația fizică; orice modificare recalculează întregul profil.")+
  physicalClMarkup(config)+
  '<div class="sd-controls">'+profileControls+
   choice("Obiectiv senzorial","goal",opts)+
   choice("Clopot / cameră","bell",bellOptions,view,bellOptions.length===1)+
   choice("Airflow / insert","air",airOptions)+
   choice("Sârmă / material","wire",wireOptions)+
   buildSelect(config)+'</div>'+personalSetupsMarkup(config)+
  '<details class="sd-advanced"><summary>Calibrare fină · poziție coil, diametru, WATT / TC</summary>'+
  '<div class="sd-controls">'+
   choice("Diametru coil","coilMm",[2,2.5,3].map(x=>({value:x,label:"Ø"+String(x).replace(".",",")+" mm",selected:config.coilMm})))+
   choice("Poziție față de jet","position",[
     {value:"low",label:"Mai jos",selected:config.position},
     {value:"standard",label:"Standard",selected:config.position},
     {value:"high",label:"Mai sus",selected:config.position}])+
   '<label class="sd-field"><span>Putere / limită TC (W)</span><input type="number" min="7" max="20" step="0.5" data-sd-field="power" value="'+config.power+'"></label>'+
   (isTC?'<label class="sd-field"><span>Temperatură TC (°C)</span>'+
    '<input type="number" min="180" max="270" step="5" data-sd-field="temp" value="'+config.temp+'"></label>':'')+
  '</div><p class="sd-fine-note">Modelul folosește indicatori termici relativi, nu calculează temperatura efectivă a spirelor. Montajul și alimentarea rămân de verificat practic.</p></details></section>'+ 
  '<section class="sd-stage sd-stage--dna" id="'+stage.dna+'" aria-labelledby="'+stage.dna+'-title">'+
  stageHeading(view,"dna","02","Sensory DNA","Cele cinci dimensiuni senzoriale, avantajele, compromisurile și dovezile folosite.")+
  '<div class="sd-section-title"><h4>Semnătura senzorială</h4><small>'+esc(analysis.certainty)+'</small></div>'+
  narrative(analysis)+
  '<div class="sd-trade"><div><h5>Ce câștigi</h5>'+listSummary(analysis.advantages)+'</div>'+
  '<div><h5>Ce sacrifici</h5>'+listSummary(analysis.tradeoffs)+'</div></div>'+
  (analysis.personalPreference?'<div class="sd-evidence"><b>Preferință personală declarată (distinctă de scorul tehnic)</b><p><strong>'+esc(analysis.personalPreference.label)+'</strong>'+(analysis.personalPreference.note?' — '+esc(analysis.personalPreference.note):'')+'</p></div>':'')+
  (analysis.anchors.length?'<div class="sd-evidence"><b>Observații folosite în calibrare</b>'+
   analysis.anchors.map(o=>'<p><strong>'+esc(o.title)+'</strong> — '+esc(o.text)+
   ' <em>('+esc(o.evidence)+')</em></p>').join("")+'</div>':'')+
  (analysis.partialEvidence&&analysis.partialEvidence.length?'<div class="sd-evidence"><b>Test personal raportat · parametri parțiali</b>'+
   analysis.partialEvidence.map(o=>'<p><strong>'+esc(o.title)+'</strong> — '+esc(o.text)+
   ' <em>('+esc(o.evidence)+')</em></p>').join("")+
   '<p><em>Observație raportată cu context parțial. Lichidul și airflow-ul sunt cele indicate în fiecare test, dacă există; comparația nu se transferă automat către alte lichide, aliaje sau inserții.</em></p></div>':'')+
  '</section>'+
  '<section class="sd-stage sd-stage--recommendations" id="'+stage.recommendations+'" aria-labelledby="'+stage.recommendations+'-title">'+
  stageHeading(view,"recommendations","03","Recomandări","Alternative calculate contextual, nu un clasament universal.")+
  '<div class="sd-section-title"><h4>TOP 3 configurații pentru obiectiv</h4>'+
  '<small>toate buildurile compatibile</small></div>'+
  '<p class="sd-ranking-note">Acest TOP 3 compară toate buildurile compatibile pentru atomizor, cameră, airflow, lichid și obiectiv. Alegerea sârmei de mai sus schimbă semnătura configurației active, nu automat clasamentul alternativelor.</p>'+
  '<div class="sd-builds">'+altWires+'</div>'+
  '<div class="sd-section-title"><h4>Lichide din catalog potrivite acestui setup</h4>'+
  '<small>calculate din toate cele 620</small></div>'+
  '<div class="sd-liquids">'+recommendationRows(config,objective)+'</div>'+
  '<details class="sd-method"><summary>De ce recomandă Lab această configurație?</summary>'+
   '<p>'+esc(tech.note)+'</p>'+analysis.notes.map(x=>'<p>'+esc(x)+'</p>').join("")+
   '<p>'+esc(analysis.modelWarning)+'</p>'+
   '<p>Plăcerea nu are scor predictiv. Observațiile personale sunt legate de configurația testată, nu de toate lichidele sau wattajele posibile.</p></details></section>';
}
function render(view){
 const v=el("sensory"+(view==="main"?"Main":"Explorer"));
 if(!v)return;
 const atom=currentAtom(view);
 if(!atom){v.innerHTML="";v.classList.add("hidden");states[view].atom="";return;}
 states[view].atom=atom.id;
 v.classList.remove("hidden");
 v.innerHTML=content(view);
}
function renderAll(){render("explorer");render("main");}
function switchMode(mode){
 if(!["explorer","main"].includes(mode))return;
 active=mode;
 for(const v of ["explorer","main"]){
  const container=el("lab"+(v==="main"?"Liquid":"Explorer")+"View");
  if(container)container.hidden=v!==mode;
  const btn=el("mode-"+v);
  if(btn){btn.setAttribute("aria-selected",String(mode===v));btn.classList.toggle("active",mode===v);}
 }
 try{if(window.localStorage)window.localStorage.setItem(viewKey,mode);}catch(error){}
 render(mode);
}
function selectPhysicalCl(view,number){
 if(!["explorer","main"].includes(view)||states[view].atom!=="dvarwcl")return false;
 const index=Number(number)-1;
 if(!Number.isInteger(index)||index<0||index>=physicalClCount)return false;
 activePhysicalCl=index;
 persistPhysicalClUnits();
 renderAll();
 const fitUi=window.RTA_BELL_LIQUID_UI;
 if(fitUi&&typeof fitUi.render==="function")fitUi.render(view);
 return true;
}
function savePhysicalCl(view){
 if(!["explorer","main"].includes(view)||states[view].atom!=="dvarwcl")return false;
 const normalized=configFor("dvarwcl",view);
 if(!normalized)return false;
 physicalClUnits[activePhysicalCl].saved={...normalized};
 physicalClUnits[activePhysicalCl].draft={...normalized};
 physicalClUnits[activePhysicalCl].source=null;
 persistPhysicalClUnits();
 renderAll();
 return true;
}
function revertPhysicalCl(view){
 if(!["explorer","main"].includes(view)||states[view].atom!=="dvarwcl")return false;
 const unit=physicalClUnits[activePhysicalCl];
 if(!unit.draft)return false;
 unit.draft=unit.saved?{...unit.saved}:null;
 unit.source=null;
 persistPhysicalClUnits();
 renderAll();
 return true;
}
function applyPersonalSetup(view,presetId){
 if(!["explorer","main"].includes(view))return false;
 const atom=states[view].atom;
 if(!atom||!core.platforms[atom])return false;
 const preset=core.personalSetups(atom).find(item=>item.id===presetId);
 if(!preset || !core.permitted(atom,preset.wire,preset.wraps) ||
  !core.platforms[atom].air.some(x=>x.id===preset.air))return false;
 const next=setConfig(atom,{air:preset.air,wire:preset.wire,wraps:preset.wraps},view);
 if(next.air!==preset.air || next.wire!==preset.wire || next.wraps!==preset.wraps)return false;
 renderAll();
 const fitUi=window.RTA_BELL_LIQUID_UI;
 if(fitUi&&typeof fitUi.render==="function")fitUi.render(view);
 return true;
}
function applyLiquid(index,atom){
 const liquids=window.RTA_LIQUIDS||[];
 if(index<0||!liquids[index]||!getAtom(atom))return false;
 if(typeof setCategory!=="function"||typeof activateLiquid!=="function"||typeof chooseAtom!=="function")return false;
 setCategory("ALL");
 activateLiquid(liquids[index]);
 const selector=el("liq"),atomSelector=el("atom");
 if(selector)selector.value=String(index);
 if(atomSelector){atomSelector.value=atom;chooseAtom();}
 switchMode("main");render("main");
 return true;
}
// Mood Match must open the exact full build shown in the selected result card.
function applyConfiguration(index,atom,selectedBuild){
 if(!selectedBuild||!getAtom(atom))return false;
 const normalized=core.config(atom,selectedBuild);
 if(!normalized||normalized.wire!==selectedBuild.wire||
    normalized.wraps!==Number(selectedBuild.wraps)||
    normalized.air!==selectedBuild.air||normalized.bell!==selectedBuild.bell)return false;
 if(!applyLiquid(index,atom))return false;
 if(atom==="dvarwcl"){
  physicalClUnits[activePhysicalCl].draft=normalized; // Mood Match only fills a draft, never claims a real installation.
  persistPhysicalClUnits();
 }else{
  configs[atom]=normalized;
  remember();
 }
 updateBellInLegacy("main",normalized.bell);
 updateBellInLegacy("explorer",normalized.bell);
 renderAll();
 return true;
}
function updateBellInLegacy(view,id){
 const selector=el("bl-bell-"+view);
 if(!selector||selector.value===id)return;
 if(!Array.from(selector.options).some(o=>o.value===id))return;
 selector.value=id;
 // Existing bell selector handles its own preference storage and both catalog views.
 selector.dispatchEvent(new Event("change",{bubbles:true}));
}
function handleChange(view,target){
 const atom=states[view].atom;
 if(!atom)return;
 if(target.dataset.sdProfile){states.explorer.category=target.value;render("explorer");return;}
 const field=target.dataset.sdField;
 if(!field)return;
 if(field==="goal"){
  chooseObjective(target.value);
  renderAll();
  return;
 }
 const before=configFor(atom,view),changed={};
 changed[field]=["wraps","power","temp","coilMm"].includes(field)?Number(target.value):target.value;
 if(field==="wire"){
  const possible=core.variants(atom).filter(v=>v.wire===target.value);
  changed.wraps=possible.some(v=>v.wraps===before.wraps)?before.wraps:possible[0].wraps;
 }
 if(field==="wraps"&&!core.permitted(atom,before.wire,changed.wraps))return;
 const next=setConfig(atom,changed,view);
 if(field==="bell"){updateBellInLegacy(view,next.bell);updateBellInLegacy(view==="explorer"?"main":"explorer",next.bell);}
 renderAll();
 const coreFit=window.RTA_BELL_LIQUID_UI;
 if(coreFit&&typeof coreFit.render==="function"){
  // Existing comprehensive catalog now refreshes from current configuration.
  coreFit.render(view);
 }
}
const oldAnalyze=fit.analyze;
const cachedOriginal=oldAnalyze;
const matchCache=new Map();
// Reuse original bell-specific evidence, but recompute liquid ordering with actual wire/air/coil.
fit.analyze=function(atom,bell,catalog){
 const base=cachedOriginal(atom,bell,catalog);
 const context=configFor(atom.id,"explorer");
 if(!context || !Array.isArray(catalog))return base;
 const cfg=core.config(atom.id,{...context,bell:bell});
 const key=[cfg.atom,cfg.bell,cfg.air,cfg.wire,cfg.wraps,cfg.coilMm,cfg.position,cfg.power,cfg.temp,
  currentObjective(),catalog.length].join("|");
 let data=matchCache.get(key);
 if(!data){
  // Core holds a reference to the original analyzer to avoid recursion.
  const x=core.matchLiquids(cfg,catalog,currentObjective());
  const ranks=Object.fromEntries(classes.map(x=>[x,[]]));
  x.forEach(m=>ranks[m.liquid.class].push(m.score));
  data={
   matches:x.map(m=>({index:m.index,liquid:m.liquid,category:m.liquid.class,score:m.score})),
   classes:classes.map((name,i)=>({
     name,score:0,
     band:"",rank:i,
     mean:ranks[name].length?ranks[name].reduce((a,b)=>a+b,0)/ranks[name].length:0
   })).sort((a,b)=>b.mean-a.mean)
  };
  const rankNames=["Primă alegere","Foarte potrivit","Potrivit","Contextual"];
  data.classes.forEach((o,i)=>{o.name=o.name;o.band=rankNames[i];o.score=5-i*.5;});
  if(matchCache.size>=40)matchCache.clear();
  matchCache.set(key,data);
 }
 return {...base,matches:data.matches,classes:data.classes};
};
function init(){
 for(const b of ["explorer","main"]){
  const chooser=el(b==="main"?"atom":"atomExplorer");
  if(chooser)chooser.addEventListener("change",()=>{render(b);});
  const root=el("sensory"+(b==="main"?"Main":"Explorer"));
  if(root){
   root.addEventListener("change",e=>handleChange(b,e.target));
   root.addEventListener("click",e=>{
    const button=e.target.closest("button");if(!button)return;
    if(button.dataset.sdClUnit){selectPhysicalCl(b,button.dataset.sdClUnit);return;}
    if(button.dataset.sdClSave){savePhysicalCl(b);return;}
    if(button.dataset.sdClRevert){revertPhysicalCl(b);return;}
    if(button.dataset.sdPreset){applyPersonalSetup(b,button.dataset.sdPreset);return;}
    if(button.dataset.sdPickWire){
     const atom=states[b].atom;
     setConfig(atom,{wire:button.dataset.sdPickWire,wraps:Number(button.dataset.sdPickWraps)},b);
     renderAll();return;
    }
    if(button.dataset.sdLiquid!=null)applyLiquid(Number(button.dataset.sdLiquid),states[b].atom);
   });
  }
 }
 for(const type of ["explorer","main"]){
  const tab=el("mode-"+type);
  if(tab)tab.addEventListener("click",()=>switchMode(type));
 }
 for(const btn of document.querySelectorAll(".cat,[data-obj]")){
  btn.addEventListener("click",()=>render("main"));
 }
 for(const id of ["liq","freeBtn"]){
  const n=el(id);if(n)n.addEventListener(id==="liq"?"change":"click",()=>render("main"));
 }
 // The old catalog re-renders its own selector before the delegated change event bubbles.
 document.addEventListener("change",e=>{
  if(!e.target||!e.target.dataset||!e.target.dataset.blBell)return;
  const source=e.target.dataset.blBell,atom=currentAtom(source);
  if(!atom)return;
  setConfig(atom.id,{bell:e.target.value},source);
  renderAll();
 });
 switchMode(active);
 renderAll();
}
window.RTA_SENSORY_UI={render,renderAll,switchMode,configFor,states,applyLiquid,applyConfiguration,applyPersonalSetup,selectPhysicalCl,savePhysicalCl,revertPhysicalCl,physicalClState};
document.addEventListener("DOMContentLoaded",init);
})();