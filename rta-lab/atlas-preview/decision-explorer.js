/* RTA Lab / comparison journeys. Additive UI, canonical scoring/storage untouched.
 * Technical signals are displayed as relative model estimates, never measurements.
 */
(function(){
'use strict';
const core=window.RTA_SENSORY_CORE, catalog=window.RTA_LIQUIDS||[], atoms=window.RTA_ATLAS_COLLECTION?.activeAtoms||[];
if(!core||catalog.length!==700||atoms.length!==15)return;
const CATS=['Tutun simplu','Tutun complex','NET simplu','NET complex'];
const SIGNALS=['spectrum','separation','simultaneity','focus','palate','offense','th','harmony','texture','tobaccoCore'];
const AXES=[
 ['th','TH'],['offense','Ofensivă'],['layers','Stratificare'],['separation','Separarea aromelor'],
 ['simultaneity','Simultaneitate'],['spectrum','Spectru aromatic'],['focus','Focalizare'],
 ['palate','Prezență pe palat'],['body','Corp + densitate'],['texture','Textură'],
 ['smooth','Finețe (proxy)'],['harmony','Armonie / naturalețe'],
 ['clarity','Claritate (proxy)'],['tobaccoCore','Nucleu de tutun']
];
const neutral={name:'Profil neutru de comparație',class:'Tutun simplu',tags:[]};
const A={atom:null,wire:null,wraps:null,family:null,liquidIndex:null};
const W={first:null,wraps:null,compare:false,other:null,otherWraps:null,final:null,finalWraps:null,confirmed:false,objective:null,family:null,liquidIndex:null};
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const label=l=>[l.brand,l.name].filter(Boolean).join(' · ');
const byId=id=>document.getElementById(id);
const api=()=>window.RTA_ATLAS_PREVIEW,mod=()=>window.RTA_ATLAS_MODULES;
const clamp=v=>Math.min(5,Math.max(1,Number(v)||1));
const score10=v=>Math.round((1+(clamp(v)-1)*2.25)*10)/10;
const pct=v=>Math.min(100,Math.max(0,Math.round((clamp(v)-1)*25)));
function available(wire,id){
 const ids=id?[id]:atoms.map(a=>a.id);
 return [...new Set(ids.flatMap(atom=>core.variants(atom).filter(v=>v.wire===wire).map(v=>v.wraps)))].sort((a,b)=>a-b);
}
function cfg(atom,wire,wraps){
 if(!core.permitted(atom,wire,wraps))return null;
 const base=core.defaultConfig(atom),settings=core.wireSetup(atom,wire,wraps);
 const result=core.config(atom,{...base,wire,wraps,...settings});
 return result.wire===wire&&result.wraps===wraps?result:null;
}
function candidates(wire,wraps){
 return atoms.map(a=>cfg(a.id,wire,wraps)).filter(Boolean);
}
function favoriteWrap(atom,wire){
 const existing=mod()?.buildLeads(atom)?.find(b=>b.config.wire===wire);
 const wraps=available(wire,atom);
 return existing?.config.wraps||(wire==="nife30"&&wraps.includes(7)?7:wraps[0])||null;
}
function mean(xs){return xs.reduce((a,b)=>a+b,0)/Math.max(1,xs.length);}
function signalAvg(results){
 const signals={};
 for(const k of SIGNALS)signals[k]=mean(results.map(r=>r.signals[k]));
 return {signals};
}
function metric(s,key){
 if(key==='layers')return mean([s.separation,s.simultaneity]);
 if(key==='body')return mean([s.palate,s.texture]);
 if(key==='clarity')return mean([s.focus,s.separation]);
 if(key==='smooth')return Math.min(5,Math.max(1,s.harmony*.78+(6-s.offense)*.12+(6-s.th)*.10));
 return s[key]||1;
}
function aggregate(wire,wraps,profile=neutral,platformIds=null){
 const configs=candidates(wire,wraps).filter(c=>!platformIds||platformIds.includes(c.atom));
 return configs.length?signalAvg(configs.map(c=>core.analyze(c,profile,'complete'))):null;
}
function analyzed(atom,wire,wraps,profile=neutral){
 const c=cfg(atom,wire,wraps);
 return c?core.analyze(c,profile,api()?.effectiveGoal()||'complete'):null;
}
function matrix(entries,title,note){
 if(!entries.length)return '<p class="exp-warning">Nu există configurații compatibile pentru această comparație.</p>';
 return '<div class="exp-matrix-box"><div class="exp-matrix-caption"><h4>'+esc(title)+'</h4><p>'+esc(note||'Scoruri relative modelate pe scala 1–10. Nu sunt măsurători și nu exprimă plăcerea personală.')+'</p></div>'+
 '<div class="exp-matrix-scroll" tabindex="0" role="region" aria-label="'+esc(title)+'; tabel comparativ derulabil orizontal">'+
 '<table class="exp-matrix"><thead><tr><th scope="col">Obiectiv</th>'+entries.map(e=>'<th scope="col">'+esc(e.label)+'</th>').join('')+'</tr></thead><tbody>'+
 AXES.map(([key,label])=>'<tr><th scope="row">'+esc(label)+'</th>'+entries.map(e=>{
  const v=score10(metric(e.result.signals,key)),width=v*10;
  return '<td><span class="exp-score" aria-label="'+esc(label+': '+v+' din 10')+'"><i style="width:'+width+'%"></i><b>'+String(v).replace('.',',')+'</b></span></td>';
 }).join('')+'</tr>').join('')+'</tbody></table></div>'+
 '<div class="exp-mobile-charts" role="list" aria-label="'+esc(title)+'; comparație completă fără derulare laterală">'+
 AXES.map(([key,label],j)=>'<section class="exp-mobile-metric" role="listitem"><h5>'+esc(label)+'</h5>'+
 entries.map((e,i)=>{
  const v=score10(metric(e.result.signals,key));
  return '<div class="exp-mobile-series exp-tone-'+(i%6)+'"><div class="exp-mobile-line"><span>'+esc(e.label)+'</span><strong>'+String(v).replace('.',',')+'<small>/10</small></strong></div>'+
   '<div class="exp-mobile-track" role="img" aria-label="'+esc(e.label+', '+label+': '+v+' din 10')+'"><i style="width:'+(v*10)+'%"></i></div></div>';
 }).join('')+'</section>').join('')+'</div>'+
 '<p class="exp-disclosure">Conversie transparentă a semnalelor interne 1–5 în 1–10; stratificarea, corpul, claritatea și finețea sunt indicatori derivați. Nu sunt măsurători ale gustului sau ale performanței fizice. Lipsa datelor privind dulceața ori uscăciunea nu este suplinită cu scoruri inventate.</p></div>';
}
function classSamples(family){
 const eligible=catalog.filter(l=>l.class===family&&l.recommendable!==false);
 const rows=eligible.length?eligible:catalog.filter(l=>l.class===family);
 if(rows.length<=16)return rows;
 return Array.from({length:16},(_,i)=>rows[Math.floor(i*(rows.length-1)/15)]);
}
function familyFit(configs,family){
 const sample=classSamples(family);
 if(!configs.length||!sample.length)return null;
 const scores=sample.map(l=>{
  const fit=configs.map(c=>{
   const dim=core.analyze(c,l,'complete').dimensions;
   return dim.architecture*.30+dim.palate*.27+dim.harmony*.26+dim.energy*.17;
  }).sort((a,b)=>b-a).slice(0,Math.min(3,configs.length));
  return mean(fit);
 });
 return Math.round(Math.max(0,Math.min(100,(mean(scores)-1)*25)));
}
function catsGrid(configs,scope,current){
 return '<div class="exp-family-grid" role="group" aria-label="Alege tipul de lichid">'+CATS.map(f=>{
  const n=catalog.filter(l=>l.class===f).length,fit=familyFit(configs,f),chosen=current===f;
  return '<button type="button" data-exp-family="'+scope+'" data-exp-value="'+esc(f)+'" aria-pressed="'+chosen+'" class="exp-family'+(chosen?' is-selected':'')+'"><strong>'+esc(f)+'</strong><span>'+n+' lichide</span><b>'+(fit==null?'—':fit+'%')+'</b></button>';
 }).join('')+'</div><p class="exp-disclosure">Procente = indice orientativ de compatibilitate pe o mostră distribuită din fiecare categorie, calculat din motor; nu probabilitate, test gustativ sau satisfacție garantată. Pentru SÂRME indicele folosește cele mai potrivite platforme compatibile.</p>';
}
function liquidSelect(family,id,current){
 if(!family)return '';
 const rows=catalog.map((l,i)=>({l,i})).filter(x=>x.l.class===family)
  .sort((a,b)=>label(a.l).localeCompare(label(b.l),'ro'));
 return '<label class="exp-liquid-select">Alege unul din toate cele '+rows.length+' lichide · '+esc(family)+
 '<select id="'+id+'"><option value="">Alege lichidul...</option>'+
 rows.map(({l,i})=>'<option value="'+i+'"'+(i===current?' selected':'')+'>'+esc(label(l))+(l.recommendable===false?' · profil limitat':'')+'</option>').join('')+
 '</select></label><p class="exp-hint">Toate identitățile din categorie sunt disponibile, inclusiv cele cu profil insuficient pentru un verdict ferm.</p>';
}
function wirePickList(id,current,scope){
 return '<div class="exp-wire-choices">'+Object.entries(core.wires).filter(([wire])=>available(wire,id).length)
  .map(([wire,w])=>'<button type="button" data-exp-wire="'+scope+'" data-exp-value="'+wire+'" aria-pressed="'+(wire===current)+'" class="'+(wire===current?'is-selected':'')+'">'+esc(w.name)+'</button>').join('')+'</div>';
}
function atlasWizard(){
 const m=mod();if(!m)return '';
 if(A.atom!==m.state.atom)Object.assign(A,{atom:m.state.atom,wire:null,wraps:null,family:null,liquidIndex:null});
 const id=A.atom,profile=api()?.state.fromDemo?neutral:api().currentLiquid();
 const rows=Object.keys(core.wires).filter(w=>available(w,id).length).map(w=>{
  const n=favoriteWrap(id,w),r=analyzed(id,w,n,profile);return r?{label:core.wires[w].name+' / '+n+' sp.',wire:w,result:r}:null;
 }).filter(Boolean);
 const wraps=A.wire?available(A.wire,id):[];
 const variants=wraps.map(n=>({wraps:n,label:n+' spire',result:analyzed(id,A.wire,n,profile)}));
 const configs=A.wire&&A.wraps?[cfg(id,A.wire,A.wraps)].filter(Boolean):[];
 return '<section class="exp-flow" id="expAtlasWizard"><span class="eyebrow">DECIZIE EXPLICATĂ / ATLAS</span><h2>Alege în cunoștință de cauză.</h2>'+
 '<p class="exp-hint">Atomizor selectat: <strong>'+esc(atoms.find(a=>a.id===id)?.short||id)+'</strong>. Comparăm fiecare material compatibil cu platforma aceasta, în același context. Nu atribuim valori configurațiilor interzise.</p>'+
 '<h3>1. Toate sârmele, toate obiectivele</h3>'+
 matrix(rows,'Comparație între sârme · '+(atoms.find(a=>a.id===id)?.short||id),
  'Aceeași platformă; fiecare sârmă este evaluată la un număr de spire permis, indicat în antet. Profilul lichidului este '+(api()?.state.fromDemo?'neutru.':'cel ales în sesiune.'))+
 wirePickList(id,A.wire,'atlas')+
 (A.wire?'<div class="exp-stage"><h3>2. Aceeași sârmă. Compară numărul de spire.</h3>'+
 matrix(variants,'Comparație spire · '+core.wires[A.wire].name,'Pe același atomizor; numărul de spire modifică răspunsul modelat, nu reprezintă un A/B fizic.')+
 '<div class="exp-wrap-choices">'+variants.map(v=>'<button type="button" data-exp-wraps="atlas" data-exp-value="'+v.wraps+'" aria-pressed="'+(A.wraps===v.wraps)+'" class="'+(A.wraps===v.wraps?'is-selected':'')+'">Aleg '+v.wraps+' spire</button>').join('')+'</div></div>':'')+
 (A.wraps?'<div class="exp-stage"><h3>3. Pentru ce categorie de lichide?</h3>'+
 matrix([{label:core.wires[A.wire].name+' · '+A.wraps+' spire',result:analyzed(id,A.wire,A.wraps,profile)}],
  'Obiectivele configurației alese','Platformă + sârmă + spire; grafice orientative 1–10.')+
 catsGrid(configs,'atlas',A.family)+'</div>':'')+
 (A.family?'<div class="exp-stage"><h3>4. Alege lichidul din categoria selectată</h3>'+
 liquidSelect(A.family,'expAtlasLiquid',A.liquidIndex)+(A.liquidIndex!=null?'<p class="exp-success">Lichid ales. Mai jos se păstrează secțiunea existentă „Primele trei builduri” și toate instrumentele ei.</p>':'')+'</div>':'')+
 '</section>';
}
// A single user-owned journey: material -> comparison -> final choice ->
// sensory goal -> liquid -> atomizer. Never create an early atomizer picker.
const wireDefaultWrap=wire=>wire==="nife30"?7:wire==="nife52"?6:(wire==="k128"||wire==="k129")?6:5;
function wireOptions(selected){
 return Object.entries(core.wires).map(([id,w])=>'<option value="'+id+'"'+(id===selected?' selected':'')+'>'+esc(w.name)+'</option>').join('');
}
function wrapOptions(wire,selected){
 return available(wire).map(n=>'<option value="'+n+'"'+(n===selected?' selected':'')+'>'+n+' spire</option>').join('');
}
function rankedWireAtoms(wire,wraps,profile,objective){
 if(!wire||!wraps||!profile)return [];
 return atoms.map(atom=>{
  const c=cfg(atom.id,wire,wraps);
  const result=c?core.analyze(c,profile,objective||"complete"):null;
  return result?{atom,result,rank:core.priority(result,objective||"complete")}:null;
 }).filter(Boolean).sort((a,b)=>b.rank-a.rank||a.atom.short.localeCompare(b.atom.short,"ro"));
}
function wireWizard(){
 const profile=W.liquidIndex!=null?catalog[W.liquidIndex]:(W.family?{name:"Profil generic "+W.family,class:W.family,tags:[]}:neutral);
 const firstCfg=W.first&&W.wraps?candidates(W.first,W.wraps):[];
 const otherCfg=W.other&&W.otherWraps?candidates(W.other,W.otherWraps):[];
 const commonIds=firstCfg.map(c=>c.atom).filter(id=>otherCfg.some(c=>c.atom===id));
 const firstCompare=commonIds.length?aggregate(W.first,W.wraps,neutral,commonIds):null;
 const secondCompare=commonIds.length?aggregate(W.other,W.otherWraps,neutral,commonIds):null;
 const finalCfg=W.confirmed?candidates(W.final,W.finalWraps):[];
 const overview=W.first&&W.wraps?aggregate(W.first,W.wraps,neutral):null;
 const overviewFinal=finalCfg.length?signalAvg(finalCfg.map(c=>core.analyze(c,profile,W.objective||"complete"))):null;
 const ranked=W.confirmed&&W.objective&&W.liquidIndex!=null?
  rankedWireAtoms(W.final,W.finalWraps,catalog[W.liquidIndex],W.objective):[];
 const top=ranked.slice(0,3),other=ranked.slice(3);
 const choices='<option value="">Alege un material...</option>'+wireOptions(W.first);
 const section=(number,title,inside)=>'<section class="exp-stage" data-wire-step="'+number+'"><h3>'+number+'. '+title+'</h3>'+inside+'</section>';
 const first=section(1,"Sârma și coilul de pornire",
  '<p class="exp-hint">Cele șase carduri de mai sus arată ultimele tale preferințe, înaintea oricărei selecții. Alege un material și numărul de spire pentru comparație.</p>'+
  '<div class="exp-selects"><label>Sârma de pornire<select id="expWireFirst">'+choices+'</select></label>'+
  (W.first?'<label>Număr de spire<select id="expWireWraps">'+wrapOptions(W.first,W.wraps)+'</select></label>':'')+
  '</div>'+(overview?matrix([{label:core.wires[W.first].name+' · '+W.wraps+' spire',result:overview}],
   'Profil comparativ inițial · 14 obiective','Model orientativ mediat pe '+firstCfg.length+' platforme compatibile, nu un test fizic unic.'):''));
 const compare=W.first&&W.wraps?section(2,"Comparații între sârme și spire",
  '<p class="exp-hint">Compară pe aceeași scară 1–10, folosind exact platformele compatibile în comun. Comparația este opțională: poți continua și cu prima sârmă.</p>'+
  '<button type="button" class="exp-action" data-exp-toggle-compare aria-expanded="'+W.compare+'">'+(W.compare?'Ascunde comparatorul':'Deschide comparația')+'</button>'+
  (W.compare?'<div class="exp-selects"><label>Sârmă de comparat<select id="expWireOther"><option value="">Alege comparatorul...</option>'+
    wireOptions(W.other)+'</select></label>'+
    (W.other?'<label>Spire comparator<select id="expWireOtherWraps">'+wrapOptions(W.other,W.otherWraps)+'</select></label>':'')+'</div>'+
    (firstCompare&&secondCompare?matrix([
      {label:core.wires[W.first].name+' · '+W.wraps+' spire',result:firstCompare},
      {label:core.wires[W.other].name+' · '+W.otherWraps+' spire',result:secondCompare}
     ],'Comparație directă / aceleași atomizoare','Comparație modelată în profil neutru, pe '+commonIds.length+' platforme comune. Nu sunt măsurători senzoriale.'):
      (W.other&&W.otherWraps?'<p class="exp-warning">Nu există platforme comune pentru această comparație.</p>':'')):'')
 ):''; 
 const choose=W.first&&W.wraps?section(3,"Te-ai decis? Confirmă sârma finală",
  '<p class="exp-hint">Comparațiile nu aleg automat pentru tine. Confirmă explicit materialul și spirele; abia apoi apar obiectivele senzoriale.</p>'+
  '<div class="exp-selects"><label>Sârmă finală<select id="expWireFinal"><option value="">Alege sârma finală...</option>'+
    wireOptions(W.final)+'</select></label>'+
    (W.final?'<label>Spire finale<select id="expWireFinalWraps">'+wrapOptions(W.final,W.finalWraps)+'</select></label>':'')+
  '</div><div class="exp-choice-actions"><button class="exp-action" type="button" data-exp-use-first="1">Aleg '+esc(core.wires[W.first].name)+' / '+W.wraps+' spire</button>'+
    (W.compare&&W.other&&W.otherWraps?'<button class="exp-action" type="button" data-exp-use-other="1">Aleg '+esc(core.wires[W.other].name)+' / '+W.otherWraps+' spire</button>':'')+
    (W.final&&W.finalWraps?'<button class="exp-action" type="button" data-exp-confirm-final="1">Confirmă selecția finală</button>':'')+
    '</div>'+(W.confirmed?'<p class="exp-success" role="status">Alegere confirmată: '+esc(core.wires[W.final].name)+' · '+W.finalWraps+' spire. Poți reveni și o poți schimba.</p>':'')
 ):''; 
 const goal=W.confirmed?section(4,"Ce vrei să obții? TH, stratificare, corp...",
  '<p class="exp-hint">Alege obiectivul senzorial. Scorurile rămân estimări, nu se atribuie un gust garantat fiecărui atomizor.</p>'+
  '<label class="exp-liquid-select">Obiectiv<select id="expWireGoal"><option value="">Alege ce contează cel mai mult...</option>'+
    (window.RTA_ATLAS_CONTEXT?.goals||[]).map(([id,name])=>'<option value="'+id+'"'+(id===W.objective?' selected':'')+'>'+esc(name)+'</option>').join('')+'</select></label>'+
  (W.objective&&overviewFinal?matrix([{label:core.wires[W.final].name+' · '+W.finalWraps+' spire',result:overviewFinal}],
   'Profil orientativ pentru obiectivul ales','Media modelelor pe '+finalCfg.length+' platforme compatibile, înaintea alegerii lichidului și atomizorului.'):'')
 ):''; 
 const liquid=W.confirmed&&W.objective?section(5,"Lichidul: familia, apoi produsul exact",
  '<p class="exp-hint">Întâi alegi familia, apoi un lichid din cele 700. Abia după lichid apar recomandările finale de atomizoare.</p>'+
  catsGrid(finalCfg,'wire',W.family)+(W.family?liquidSelect(W.family,'expWireLiquid',W.liquidIndex):'')
 ):''; 
 const atomsStep=ranked.length?section(6,"Atomizorul potrivit pentru toate selecțiile tale",
  '<p class="exp-hint">TOP 3 este calculat pentru sârma finală, '+W.finalWraps+' spire, obiectivul '+esc(W.objective)+
   ' și lichidul '+esc(label(catalog[W.liquidIndex]))+'. Restul atomizoarelor compatibile rămân disponibile, dar nu sunt declarate echivalente senzorial.</p>'+
  '<div class="exp-top-atoms">'+top.map((r,i)=>'<article><span>0'+(i+1)+'</span><h4>'+esc(r.atom.short)+'</h4>'+
   '<p>'+esc(core.platforms[r.atom.id].air.find(a=>a.id===r.result.config.air)?.label||'Airflow implicit')+'</p>'+
   '<p class="exp-hint">'+esc((r.result.advantages||[]).slice(0,2).join(' · ')||'Potrivire orientativă')+'</p>'+
   '<button type="button" data-exp-open-atom="'+esc(r.atom.id)+'">Alege acest atomizor ↗</button></article>').join('')+'</div>'+
  matrix(top.map(r=>({label:r.atom.short,result:r.result})),
   'Comparația celor trei atomizoare','Același lichid, același material și aceeași geometrie; evaluare relativă, nu probă A/B.')+
  (other.length?'<details class="exp-compatible-remainder"><summary>Alte '+other.length+' atomizoare compatibile — arată toate</summary>'+
   '<div class="exp-other-atoms">'+other.map(r=>'<div><b>'+esc(r.atom.short)+'</b><span>'+esc(core.platforms[r.atom.id].air.find(a=>a.id===r.result.config.air)?.label||'Airflow implicit')+
   '</span><button type="button" data-exp-open-atom="'+esc(r.atom.id)+'">Explorează ↗</button></div>').join('')+'</div>'+
   '</details>':'')
 ):''; 
 return '<section class="exp-flow exp-wire-single" id="expWireWizard"><span class="eyebrow">WIRE LAB / FLUX UNIC</span>'+
  '<h2>De la sârmă, până la atomizor.</h2>'+
  '<p class="exp-hint">Un singur traseu, în ordine: sârmă → comparații → alegere → obiective → lichid → atomizor. Poți modifica orice etapă.</p>'+
  (W.first?'<button type="button" class="exp-reset" data-exp-reset-wire="1">Reia selecția de la toate sârmele</button>':'')+
  first+compare+choose+goal+liquid+atomsStep+'</section>';
}
function pickWire(wire){
 if(!core.wires[wire])return false;
 W.first=wire;W.wraps=available(wire).includes(wireDefaultWrap(wire))?wireDefaultWrap(wire):available(wire)[0];
 W.other=null;W.otherWraps=null;W.compare=false;
 W.final=null;W.finalWraps=null;W.confirmed=false;W.objective=null;W.family=null;W.liquidIndex=null;
 const m=mod();
 if(m){
  const specific=m.state.wirePlatformChosen&&core.platforms[m.state.atom]?m.state.atom:"gtr";
  const candidate=core.config(specific,{wire,wraps:W.wraps,...core.wireSetup(specific,wire,W.wraps)});
  m.state.atom=specific;m.state.config=candidate;m.state.wireChosen=true;
  m.state.wirePlatformChosen=specific!=="gtr"&&m.state.wirePlatformChosen;
  m.show('wire');
  mountWizards(); // synchronous insert, so mobile can scroll straight to the flow
 }else refreshWizard('wire');
 return true;
}
function confirmWire(wire,wraps){
 if(!core.wires[wire]||!available(wire).includes(Number(wraps)))return false;
 const changed=W.final!==wire||W.finalWraps!==Number(wraps);
 W.final=wire;W.finalWraps=Number(wraps);W.confirmed=true;
 if(changed){W.objective=null;W.family=null;W.liquidIndex=null;if(typeof api()?.setObjective==="function")api().setObjective("");}
 refreshWizard('wire');
 return true;
}
function resetWire(){
 W.first=null;W.wraps=null;W.compare=false;W.other=null;W.otherWraps=null;
 W.final=null;W.finalWraps=null;W.confirmed=false;W.objective=null;W.family=null;W.liquidIndex=null;
 if(api()?.setObjective)api().setObjective("");
 const m=mod();if(m){
  m.state.wireChosen=false;m.state.wirePlatformChosen=false;
  m.state.atom="gtr";m.state.config=core.defaultConfig("gtr");
  m.show("wire");mountWizards();
 }else refreshWizard("wire");
 return true;
}
function topAtoms(wire,wraps,profile){
 return rankedWireAtoms(wire,wraps,profile,W.objective||api()?.effectiveGoal()||"complete").slice(0,3);
}
function refreshWizard(kind){
 const node=byId(kind==='atlas'?'expAtlasWizard':'expWireWizard');
 if(node)node.outerHTML=kind==='atlas'?atlasWizard():wireWizard();
}
function mountWizards(){
 const p=byId('pageAtomizer'),m=mod();
 if(p&&m&&!p.querySelector('#expAtlasWizard')){
  const anchor=p.querySelector('.platform-picker');
  if(anchor)anchor.insertAdjacentHTML('afterend',atlasWizard());
 }
 const w=byId('pageWire');
 if(w&&!w.querySelector('#expWireWizard')){
  // Exactly one canonical wire journey, immediately after the six preference cards.
  const anchor=w.querySelector('#wireLibrary');
  if(anchor)anchor.insertAdjacentHTML('afterend',wireWizard());
 }
}
function liquidCategories(){
 const host=document.querySelector('#pageLiquid .selection-panel'),picker=host?.querySelector('.liquid-search-wrap');
 if(!host||!picker||byId('expLiquidCategories'))return;
 const s=window.RTA_ATLAS_SEARCH_UI?.states.get('liquid');
 const current=s?.family||'';
 picker.insertAdjacentHTML('beforebegin','<div class="exp-liquid-category" id="expLiquidCategories"><h3>1. Alege mai întâi tipul de lichid</h3><div class="exp-category-choices">'+
 CATS.map(f=>'<button type="button" data-exp-liquid-cat="'+esc(f)+'" aria-pressed="'+(current===f)+'"><b>'+esc(f)+'</b><span>'+catalog.filter(l=>l.class===f).length+' lichide</span></button>').join('')+
 '</div><button type="button" class="exp-reset" data-exp-liquid-cat="">Arată din nou toate categoriile</button><p id="expLiquidCategoryStatus" role="status">După alegere apar lichidele din acea categorie, în lista derulabilă existentă.</p></div>');
}
function refreshLiquidCategory(){
 const s=window.RTA_ATLAS_SEARCH_UI?.states.get('liquid');
 const section=byId('expLiquidCategories');if(!section)return;
 section.querySelectorAll('[data-exp-liquid-cat]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.expLiquidCat===(s?.family||''))));
 const hint=byId('expLiquidCategoryStatus');
 if(hint)hint.textContent=s?.family?'Categoria '+s.family+' · '+catalog.filter(l=>l.class===s.family).length+' lichide. Alege direct din rezultate sau caută în categoria selectată.':'Poți alege oricare dintre cele patru categorii.';
}
function detailComparisons(){
 const resultHost=byId('resultCards'),compare=byId('liquidComparison'),data=api()?.state;
 if(!resultHost||!compare||!data||data.fromDemo&&!data.freeProfile)return;
 const composed=api().compose(data.liquidIndex,data.mood,data.moment,{liquid:api().currentLiquid(),objective:data.objective});
 if(!composed||!composed.items.length)return;
 const bests=composed.items.map(x=>({label:x.atom.short,result:x.builds[0]}));
 if(!compare.querySelector('.exp-liquid-all-objectives')){
  compare.insertAdjacentHTML('beforeend','<section class="exp-liquid-all-objectives">'+matrix(bests,
   'Toate obiectivele · comparație între cele 3 atomizoare',
   'Acelasi lichid / obiectiv. Fiecare coloană descrie cel mai potrivit build calculat al atomizorului, nu un scor global al platformei.')+'</section>');
 }
 for(const item of composed.items){
  const card=[...resultHost.querySelectorAll('.result-card')].find(el=>el.dataset.atom===item.id);
  if(!card)continue;
  const detail=card.querySelector('.card-detail'),body=card.querySelector('.card-body');
  if(body&&!body.querySelector('.exp-best-overview')){
   const r=item.builds[0];
   body.insertAdjacentHTML('beforeend','<div class="exp-best-overview"><strong>Obiective · buildul principal / 10</strong>'+
     ['th','offense','layers','smooth'].map(key=>'<span>'+esc(AXES.find(x=>x[0]===key)[1])+': <b>'+String(score10(metric(r.signals,key))).replace('.',',')+'</b></span>').join('')+'</div>');
  }
  if(detail&&!detail.querySelector('.exp-build-compare')){
   detail.insertAdjacentHTML('beforeend','<div class="exp-build-compare">'+matrix(item.builds.map(x=>({label:core.wires[x.config.wire].name+' / '+x.config.wraps+' spire',result:x})),
    'Toate obiectivele · sârmele acestui atomizor',
    'Același atomizor și lichid; se compară cele trei builduri recomandate, fără a pretinde că schimbarea sârmei este un A/B controlat.')+'</div>');
  }
 }
}
function react(){
 mountWizards();
 liquidCategories();
 refreshLiquidCategory();
 detailComparisons();
}
function init(){
 const hostA=byId('pageAtomizer'),hostW=byId('pageWire'),cards=byId('resultCards'),cmp=byId('liquidComparison');
 if(!hostA||!hostW||!cards||!cmp)return;
 react();
 const observer=new MutationObserver(()=>react());
 observer.observe(hostA,{childList:true});
 observer.observe(hostW,{childList:true});
 observer.observe(cards,{childList:true});
 observer.observe(cmp,{childList:true});
 document.addEventListener('click',e=>{
  const t=e.target.closest?.('[data-exp-wire],[data-exp-wraps],[data-exp-family],[data-exp-toggle-compare],[data-exp-open-atom],[data-exp-liquid-cat],[data-exp-use-first],[data-exp-use-other],[data-exp-confirm-final],[data-exp-reset-wire]');
  if(!t)return;
  const d=t.dataset;
  if(d.expLiquidCat!==undefined){
   const s=window.RTA_ATLAS_SEARCH_UI?.states.get('liquid');if(!s)return;
   s.family=d.expLiquidCat;s.brand='';s.tag='';s.offset=0;s.query='';s.active=0;
   const input=byId('liquidSearch');if(input){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus({preventScroll:true});}
   refreshLiquidCategory();return;
  }
  if(d.expResetWire!==undefined){resetWire();return;}
  if(d.expToggleCompare!==undefined){W.compare=!W.compare;refreshWizard('wire');return;}
  if(d.expUseFirst!==undefined){confirmWire(W.first,W.wraps);return;}
  if(d.expUseOther!==undefined){confirmWire(W.other,W.otherWraps);return;}
  if(d.expConfirmFinal!==undefined){confirmWire(W.final,W.finalWraps);return;}
  if(d.expWire==='atlas'){
   A.wire=d.expValue;A.wraps=null;A.family=null;A.liquidIndex=null;
   mod().setConfig({wire:A.wire});mod().show('atomizer');return;
  }
  if(d.expWraps==='atlas'){
   A.wraps=Number(d.expValue);A.family=null;A.liquidIndex=null;
   if(!mod().setConfig({wraps:A.wraps})){A.wraps=null;return;}
   mod().show('atomizer');return;
  }
  if(d.expFamily==='atlas'){A.family=d.expValue;A.liquidIndex=null;refreshWizard('atlas');return;}
  if(d.expFamily==='wire'){W.family=d.expValue;W.liquidIndex=null;refreshWizard('wire');return;}
  if(d.expOpenAtom){
   const c=cfg(d.expOpenAtom,W.final,W.finalWraps);
   if(!c)return;
   const m=mod();m.state.atom=d.expOpenAtom;m.state.config=c;m.state.wireChosen=true;m.state.wirePlatformChosen=true;
   m.show('wire');
   byId('pageWire')?.querySelector('.wire-workspace')?.scrollIntoView({block:'start',behavior:'auto'});return;
  }
 });
 document.addEventListener('change',e=>{
  const id=e.target.id,value=e.target.value;
  if(e.target.dataset.lpFilter==='family'){refreshLiquidCategory();return;}
  if(id==='atlasWire'){A.wire=value;A.wraps=null;A.family=null;A.liquidIndex=null;refreshWizard('atlas');return;}
  if(id==='expWireFirst'){if(value)pickWire(value);return;}
  if(id==='expWireWraps'){const n=Number(value);if(available(W.first).includes(n)){
   W.wraps=n;W.final=null;W.finalWraps=null;W.confirmed=false;W.objective=null;W.family=null;W.liquidIndex=null;
   const m=mod();if(m&&m.state.wireChosen){
    m.state.config=core.config(m.state.atom,{...m.state.config,wire:W.first,wraps:n,...core.wireSetup(m.state.atom,W.first,n)});
   }
   refreshWizard('wire');}
   return;
  }
  if(id==='expWireOther'){W.other=value||null;W.otherWraps=W.other?(available(W.other).includes(wireDefaultWrap(W.other))?wireDefaultWrap(W.other):available(W.other)[0]):null;refreshWizard('wire');return;}
  if(id==='expWireOtherWraps'){W.otherWraps=value?Number(value):null;refreshWizard('wire');return;}
  if(id==='expWireFinal'){W.final=value||null;W.finalWraps=W.final?(available(W.final).includes(wireDefaultWrap(W.final))?wireDefaultWrap(W.final):available(W.final)[0]):null;W.confirmed=false;W.objective=null;W.family=null;W.liquidIndex=null;refreshWizard('wire');return;}
  if(id==='expWireFinalWraps'){W.finalWraps=value?Number(value):null;W.confirmed=false;W.objective=null;W.family=null;W.liquidIndex=null;refreshWizard('wire');return;}
  if(id==='expWireGoal'){
   if(!W.confirmed)return;
   W.objective=value||null;W.family=null;W.liquidIndex=null;
   if(api()?.setObjective)api().setObjective(W.objective||"");
   refreshWizard('wire');return;
  }
  if(id==='expAtlasLiquid'){
   if(value&&catalog[Number(value)]?.class===A.family){
    A.liquidIndex=Number(value);api().selectLiquid(A.liquidIndex);mod().show('atomizer');
   }else{A.liquidIndex=null;refreshWizard('atlas');}
  }
  if(id==='expWireLiquid'){
   if(value&&catalog[Number(value)]?.class===W.family){
    W.liquidIndex=Number(value);api().selectLiquid(W.liquidIndex);refreshWizard('wire');
   }else{W.liquidIndex=null;refreshWizard('wire');}
  }
 });
}
window.RTA_LAB_EXPLORER={version:'2026-10-29-single-journey',categories:CATS,axes:AXES,available,candidates,score10,metric,aggregate,familyFit,topAtoms,rankedWireAtoms,matrix,atlasWizard,wireWizard,pickWire,confirmWire,resetWire,states:{atlas:A,wire:W},init};
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
})();