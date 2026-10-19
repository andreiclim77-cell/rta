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
const W={first:null,wraps:null,compare:false,other:null,otherWraps:null,final:null,finalWraps:null,family:null,liquidIndex:null};
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
 const base=core.defaultConfig(atom),settings=core.wireSetup(atom,wire);
 const result=core.config(atom,{...base,wire,wraps,...settings});
 return result.wire===wire&&result.wraps===wraps?result:null;
}
function candidates(wire,wraps){
 return atoms.map(a=>cfg(a.id,wire,wraps)).filter(Boolean);
}
function favoriteWrap(atom,wire){
 const existing=mod()?.buildLeads(atom)?.find(b=>b.config.wire===wire);
 return existing?.config.wraps||available(wire,atom)[0]||null;
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
function wireWizard(){
 const profile=api()?.state.fromDemo?neutral:api().currentLiquid();
 const configs1=W.first&&W.wraps?candidates(W.first,W.wraps):[];
 const configs2=W.other&&W.otherWraps?candidates(W.other,W.otherWraps):[];
 const cfgFinal=W.final&&W.finalWraps?candidates(W.final,W.finalWraps):[];
 const familyRows=W.family&&W.liquidIndex!=null?topAtoms(W.final,W.finalWraps,catalog[W.liquidIndex]):[];
 const lead=W.first&&W.wraps?aggregate(W.first,W.wraps,profile):null;
 // Side-by-side comparisons MUST use the exact same compatible atomizer set.
 const commonIds=configs1.map(c=>c.atom).filter(id=>configs2.some(c=>c.atom===id));
 const alignedLead=commonIds.length?aggregate(W.first,W.wraps,profile,commonIds):null;
 const rival=commonIds.length?aggregate(W.other,W.otherWraps,profile,commonIds):null;
 const final=cfgFinal.length?signalAvg(cfgFinal.map(c=>core.analyze(c,profile,'complete'))):null;
 return '<section class="exp-flow" id="expWireWizard"><span class="eyebrow">WIRE LAB / DECIZIE PAS CU PAS</span><h2>Din sârmă, până la atomizor.</h2>'+
 '<p class="exp-hint">În această etapă, înaintea alegerii atomizorului, scorurile sunt mediile estimative ale platformelor compatibile. După lichid, TOP 3 este calculat pentru configurații exacte.</p>'+
 '<div class="exp-stage"><h3>1. Alege o sârmă și numărul de spire</h3>'+
 '<div class="exp-selects"><label>Sârmă<select id="expWireFirst"><option value="">Alege sârma...</option>'+
 Object.entries(core.wires).map(([id,w])=>'<option value="'+id+'"'+(id===W.first?' selected':'')+'>'+esc(w.name)+'</option>').join('')+'</select></label>'+
 (W.first?'<label>Număr de spire<select id="expWireWraps"><option value="">Alege spirele...</option>'+
 available(W.first).map(n=>'<option value="'+n+'"'+(n===W.wraps?' selected':'')+'>'+n+' spire</option>').join('')+'</select></label>':'')+'</div>'+
 (lead?matrix([{label:core.wires[W.first].name+' / '+W.wraps+' spire',result:lead}],
  'Ce oferă această sârmă','Medie tehnică a '+configs1.length+' platforme compatibile; nu o valoare universală independentă de atomizor.'):'')+
 (lead?'<button type="button" class="exp-action" data-exp-toggle-compare aria-expanded="'+W.compare+'">'+(W.compare?'Închide comparația':'Compară cu altă sârmă')+'</button>':'')+
 (W.compare&&lead?'<div class="exp-stage"><div class="exp-selects"><label>Sârmă de comparat<select id="expWireOther"><option value="">Alege sârma de comparat...</option>'+
 Object.entries(core.wires).map(([id,w])=>'<option value="'+id+'"'+(id===W.other?' selected':'')+'>'+esc(w.name)+'</option>').join('')+'</select></label>'+
 (W.other?'<label>Spire comparator<select id="expWireOtherWraps"><option value="">Alege spirele...</option>'+
 available(W.other).map(n=>'<option value="'+n+'"'+(n===W.otherWraps?' selected':'')+'>'+n+' spire</option>').join('')+'</select></label>':'')+'</div>'+
 (rival?matrix([{label:core.wires[W.first].name+' · '+W.wraps,result:alignedLead},{label:core.wires[W.other].name+' · '+W.otherWraps,result:rival}],
   'Comparație directă 1–10','Aceleași '+commonIds.length+' platforme compatibile pentru ambele configurații, aceleași axe și același lichid/profil. Poți schimba comparatorul de câte ori dorești.'):(W.other&&W.otherWraps?'<p class="exp-warning">Nu există atomizoare comune pentru o comparație echitabilă a acestor două variante.</p>':''))+'</div>':'')+'</div>'+
 '<div class="exp-stage"><h3>2. Te-ai decis?</h3><p class="exp-hint">Selectează sârma cu care vrei să continui. Această alegere nu îți suprascrie montajele salvate.</p>'+
 '<div class="exp-selects"><label>Sârmă finală<select id="expWireFinal"><option value="">Alege sârma finală...</option>'+
 Object.entries(core.wires).map(([id,w])=>'<option value="'+id+'"'+(id===W.final?' selected':'')+'>'+esc(w.name)+'</option>').join('')+'</select></label>'+
 (W.final?'<label>Spire finale<select id="expWireFinalWraps"><option value="">Alege spirele...</option>'+
 available(W.final).map(n=>'<option value="'+n+'"'+(n===W.finalWraps?' selected':'')+'>'+n+' spire</option>').join('')+'</select></label>':'')+'</div>'+
 (final?matrix([{label:core.wires[W.final].name+' / '+W.finalWraps+' spire',result:final}],
  'Obiectivele sârmei alese','Medie orientativă a '+cfgFinal.length+' platforme compatibile.'):'')+'</div>'+
 (cfgFinal.length?'<div class="exp-stage"><h3>3. Compatibilitate cu cele patru tipuri de lichid</h3>'+
 catsGrid(cfgFinal,'wire',W.family)+'</div>':'')+
 (W.family?'<div class="exp-stage"><h3>4. Alege lichidul concret</h3>'+liquidSelect(W.family,'expWireLiquid',W.liquidIndex)+'</div>':'')+
 (W.liquidIndex!=null&&familyRows.length?'<div class="exp-stage"><h3>5. '+familyRows.length+' atomizoare compatibile (maximum 3 recomandări)</h3>'+
 '<p class="exp-hint">Ordinea utilizează evaluarea configurației exacte (atomizor + sârmă + '+W.finalWraps+' spire + lichid + obiectivul curent). Preferințele personale sunt distincte de estimările tehnice.</p>'+
 '<div class="exp-top-atoms">'+familyRows.map((r,i)=>'<article><span>0'+(i+1)+'</span><h4>'+esc(r.atom.short)+'</h4><p>'+esc(core.platforms[r.atom.id].air.find(a=>a.id===r.result.config.air)?.label||'Airflow implicit')+'</p><button type="button" data-exp-open-atom="'+esc(r.atom.id)+'">Explorează în Wire Lab ↗</button></article>').join('')+'</div>'+
 matrix(familyRows.map(r=>({label:r.atom.short,result:r.result})),
  'Toate obiectivele celor trei atomizoare','Același lichid și aceeași sârmă/număr de spire; fiecare platformă este analizată separat.')+'</div>':'')+'</section>';
}
function topAtoms(wire,wraps,profile){
 if(!profile)return [];
 return atoms.map(atom=>{
  const c=cfg(atom.id,wire,wraps),result=c?core.analyze(c,profile,api().effectiveGoal()):null;
  return result?{atom,result,rank:core.priority(result,api().effectiveGoal())}:null;
 }).filter(Boolean).sort((a,b)=>b.rank-a.rank||a.atom.short.localeCompare(b.atom.short,'ro')).slice(0,3);
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
  const anchor=w.querySelector('.module-intro');
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
  const t=e.target.closest?.('[data-exp-wire],[data-exp-wraps],[data-exp-family],[data-exp-toggle-compare],[data-exp-open-atom],[data-exp-liquid-cat]');
  if(!t)return;
  const d=t.dataset;
  if(d.expLiquidCat!==undefined){
   const s=window.RTA_ATLAS_SEARCH_UI?.states.get('liquid');if(!s)return;
   s.family=d.expLiquidCat;s.brand='';s.tag='';s.offset=0;s.query='';s.active=0;
   const input=byId('liquidSearch');if(input){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus({preventScroll:true});}
   refreshLiquidCategory();return;
  }
  if(d.expToggleCompare!==undefined){W.compare=!W.compare;refreshWizard('wire');return;}
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
  const keys={expWireFirst:['first','wraps'],expWireWraps:['wraps'],
   expWireOther:['other','otherWraps'],expWireOtherWraps:['otherWraps'],
   expWireFinal:['final','finalWraps'],expWireFinalWraps:['finalWraps']};
  if(keys[id]){
   const [field,dependent]=keys[id];
   W[field]=field.toLowerCase().includes('wraps')?(value?Number(value):null):value||null;
   if(dependent)W[dependent]=null;
   if(['final','finalWraps'].includes(field)){W.family=null;W.liquidIndex=null;}
   refreshWizard('wire');
   byId(id)?.focus({preventScroll:true});
   return;
  }
  if(id==='expAtlasLiquid'){
   if(value&&catalog[Number(value)]?.class===A.family){
    A.liquidIndex=Number(value);api().selectLiquid(A.liquidIndex);mod().show('atomizer');
   }else{A.liquidIndex=null;refreshWizard('atlas');}
  }
  if(id==='expWireLiquid'){
   if(value&&catalog[Number(value)]?.class===W.family){
    W.liquidIndex=Number(value);api().selectLiquid(W.liquidIndex);mod().show('wire');
   }else{W.liquidIndex=null;refreshWizard('wire');}
  }
 });
}
window.RTA_LAB_EXPLORER={version:'2026-10-16',categories:CATS,axes:AXES,available,candidates,score10,metric,aggregate,familyFit,topAtoms,matrix,atlasWizard,wireWizard,states:{atlas:A,wire:W},init};
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
})();