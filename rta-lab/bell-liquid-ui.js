/* RTA Lab V10 — clopot + lichide, Explorer and standard selection, 13.10.2026 */
(function () {
"use strict";
var fit=window.RTA_BELL_LIQUID_FIT;if(!fit)return;
var VIEWS={explorer:{select:"atomExplorer",panel:"bellLiquidExplorer"},
           main:{select:"atom",panel:"bellLiquidMain"}};
var views={explorer:{atomId:"",category:"ALL",query:"",limit:12,analysis:null},
           main:{atomId:"",category:"ALL",query:"",limit:12,analysis:null}};
var STORAGE="rta-lab-bells-20261013",chosen={};
try {
 var saved=window.localStorage&&window.localStorage.getItem(STORAGE);
 var obj=saved?JSON.parse(saved):null;
 if(obj&&typeof obj==="object"&&!Array.isArray(obj))chosen=obj;
} catch(e) {chosen={};}
function byId(id){return document.getElementById(id);}
function html(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;")
 .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function remember() {
 try {if(window.localStorage)window.localStorage.setItem(STORAGE,JSON.stringify(chosen));}
 catch(e) {/* Disabled storage must never break the interface. */}
}
function getAtom(id) {
 return (window.RTA_CORE&&window.RTA_CORE.atoms||[]).find(function(a){return a.id===id;});
}
function validBell(atomId){
 var cfg=fit.config(atomId),proposed=chosen[atomId];
 return cfg.bells.some(function(b){return b.id===proposed;})?proposed:cfg.defaultId;
}
function classWhy(name) {
 return {
  "Tutun simplu":"Tutun direct, note principale și hit.",
  "Tutun complex":"Tutun cu toppinguri și integrare aromatică.",
  "NET simplu":"Frunză naturală singulară, structură și identitate.",
  "NET complex":"Mixturi NET, separarea frunzelor și layering."
 }[name]||"";
}
function paint(view,atom,analysis) {
 var state=views[view],bell=analysis.bell,variable=analysis.bells.length>1;
 var options=analysis.bells.map(function(b) {
  return '<option value="'+html(b.id)+'"'+(bell.id===b.id?' selected':'')+'>'+html(b.name)+'</option>';
 }).join("");
 var categories=analysis.classes.map(function(c,i) {
  return '<article class="bl-category"><span class="bl-position">'+(i+1)+'</span>'+
   '<div class="bl-class-text"><strong>'+html(c.name)+'</strong><span>'+html(classWhy(c.name))+
   '</span></div><span class="bl-fit-level">'+html(c.band)+'</span></article>';
 }).join("");
 var source=bell.source?'<a class="bl-source" href="'+html(bell.source)+
  '" target="_blank" rel="noopener noreferrer">Sursa despre clopot ↗</a>':
  '<span class="bl-source-note">Sursa: ADN-ul arhivat în Lab</span>';
 var warning=atom.id==="asylum"&&bell.id==="dome"?
  '<p class="bl-warning">Important: K1 28/6 este validat practic pe Asylum Flat; '+
  'Dome are aici o estimare aromatică, nu un build nou validat.</p>':"";
 var filters=["ALL"].concat(fit.classes).map(function(cat){
  var active=state.category===cat;
  return '<button type="button" data-bl-filter="'+html(cat)+'" data-bl-view="'+view+
   '" aria-pressed="'+active+'"'+(active?' class="active"':'')+'>'+
   html(cat==="ALL"?"Toate":cat)+'</button>';
 }).join("");
 return '<div class="bl-heading"><span class="bl-kicker">POTRIVIRE LICHIDE · DUPĂ CLOPOT</span>'+
  '<h4>Ce lichide avantajează '+html(atom.short)+'?</h4>'+
  '<p>Mai întâi categoriile generale, apoi lichide nominale din toate cele '+analysis.total+
  ' de repere.</p></div>'+
  '<div class="bl-controls"><label for="bl-bell-'+view+'">Clopotul / camera folosită</label>'+
  '<select id="bl-bell-'+view+'" data-bl-bell="'+view+'"'+(variable?'':' disabled')+
  '>'+options+'</select></div>'+
  '<p class="bl-bell-note"><b>Caracter:</b> '+html(bell.character)+'</p>'+
  '<p class="bl-provenance"><b>Certitudine:</b> '+html(bell.status)+
  '. '+html(bell.note)+' '+source+'</p>'+warning+
  '<h5 class="bl-subtitle">1. Potrivire pe cele patru categorii</h5>'+
  '<div class="bl-categories">'+categories+'</div>'+
  '<div class="bl-subhead"><h5 class="bl-subtitle">2. Lichide concrete din catalog</h5>'+
  '<small>Catalog integral: '+analysis.total+' analizate</small></div>'+
  '<label for="bl-search-'+view+'">Caută nume, marcă, frunză sau aromă</label>'+
  '<input id="bl-search-'+view+'" type="search" data-bl-search="'+view+
  '" placeholder="Ex.: Latakia, VaPer, Oriental, trabuc…" value="'+html(state.query)+'">'+
  '<div class="bl-filters" role="group" aria-label="Filtrează categoria">'+filters+'</div>'+
  '<div class="bl-summary" data-bl-summary="'+view+'" aria-live="polite"></div>'+
  '<div class="bl-results" data-bl-results="'+view+'"></div>'+
  '<div class="bl-actions" data-bl-actions="'+view+'"></div>'+
  '<p class="bl-method">Model orientativ, fără procente statistice: ADN-ul atomizorului, '+
  'clopotul selectat și profilul fiecărui lichid. Contează și airflow-ul, buildul și preferința personală. '+
  'Schimbarea clopotului nu rescrie automat recomandările TOP 3 de coil.</p>';
}
function matchingText(m) {
 var l=m.liquid;
 return fit.normalize([l.class,l.brand,l.name,l.line,l.profile,
  (Array.isArray(l.tags)?l.tags:[]).join(" ")].join(" "));
}
function renderResults(view) {
 var s=views[view];if(!s.analysis)return;
 var panel=byId(VIEWS[view].panel);if(!panel)return;
 var rows=panel.querySelector('[data-bl-results="'+view+'"]');
 var counter=panel.querySelector('[data-bl-summary="'+view+'"]');
 var action=panel.querySelector('[data-bl-actions="'+view+'"]');
 if(!rows||!counter||!action)return;
 var words=fit.normalize(s.query).trim().split(/\s+/).filter(Boolean);
 var matches=s.analysis.matches.filter(function(m) {
  if(s.category!=="ALL"&&m.category!==s.category)return false;
  var text=matchingText(m);
  return words.every(function(w){return text.includes(w);});
 });
 var displayed=matches.slice(0,s.limit);
 counter.textContent="Afișate "+displayed.length+" din "+matches.length+
  " potriviri · căutare în toate cele "+s.analysis.total+" de lichide.";
 rows.innerHTML=displayed.length?displayed.map(function(m,i){
  var l=m.liquid;
  var grade=m.score>=104?"Prioritar":m.score>=96?"Foarte potrivit":
   m.score>=88?"Potrivit":"Contextual";
  return '<article class="bl-liquid"><div class="bl-liquid-top">'+
   '<span class="bl-liquid-n">'+(i+1)+'</span><div class="bl-liquid-name"><strong>'+
   html(l.brand)+' · '+html(l.name)+'</strong><span>'+html(l.class)+
   (l.line?' · '+html(l.line):'')+'</span></div>'+
   '<span class="bl-liquid-grade">'+grade+'</span></div>'+
   '<p>'+html(l.profile||"Fără profil detaliat")+'</p>'+
   '<button type="button" class="bl-try" data-bl-pick="'+m.index+
   '" data-bl-view="'+view+'">Testează în motorul TOP 3 ↗</button></article>';
 }).join(""):'<p class="bl-no-results">Nicio potrivire. Schimbă termenul sau selectează Toate.</p>';
 action.innerHTML=matches.length>displayed.length?
  '<button type="button" data-bl-more="'+view+'">Arată încă '+
  Math.min(24,matches.length-displayed.length)+' lichide</button>':"";
}
function render(view) {
 var v=VIEWS[view];if(!v)return;
 var panel=byId(v.panel),chooser=byId(v.select);
 if(!panel||!chooser)return;
 var atom=getAtom(chooser.value),s=views[view];
 if(!atom){panel.classList.add("hidden");panel.innerHTML="";s.atomId="";s.analysis=null;return;}
 if(atom.id!==s.atomId){s.atomId=atom.id;s.category="ALL";s.query="";s.limit=12;}
 s.analysis=fit.analyze(atom,validBell(atom.id),window.RTA_LIQUIDS||[]);
 if(!s.analysis){panel.classList.add("hidden");return;}
 panel.classList.remove("hidden");
 panel.innerHTML=paint(view,atom,s.analysis);
 renderResults(view);
}
function filter(view,category) {
 var s=views[view];if(!s||!["ALL"].concat(fit.classes).includes(category))return;
 s.category=category;s.limit=12;
 var panel=byId(VIEWS[view].panel);
 if(panel)panel.querySelectorAll("[data-bl-filter]").forEach(function(btn){
  var active=btn.dataset.blFilter===category;
  btn.classList.toggle("active",active);
  btn.setAttribute("aria-pressed",String(active));
 });
 renderResults(view);
}
function pick(view,index) {
 var report=views[view].analysis,catalog=window.RTA_LIQUIDS||[];
 if(!report||!Number.isInteger(index)||index<0||!catalog[index])return;
 if(typeof setCategory!=="function"||typeof activateLiquid!=="function"||
    typeof chooseAtom!=="function")return;
 setCategory("ALL");
 activateLiquid(catalog[index]);
 var atomSelect=byId("atom");
 if(atomSelect){atomSelect.value=report.atomId;chooseAtom();render("main");}
 var step=byId("step3");
 if(step&&typeof step.scrollIntoView==="function")
  step.scrollIntoView({behavior:"smooth",block:"start"});
}
function initialize() {
 Object.keys(VIEWS).forEach(function(view){
  var control=byId(VIEWS[view].select),panel=byId(VIEWS[view].panel);
  if(!control||!panel)return;
  control.addEventListener("change",function(){render(view);});
  panel.addEventListener("change",function(e){
   var el=e.target;if(!el||el.dataset.blBell!==view)return;
   var id=views[view].atomId,cfg=fit.config(id);
   if(!cfg||!cfg.bells.some(function(b){return b.id===el.value;}))return;
   chosen[id]=el.value;remember();Object.keys(VIEWS).forEach(render);
  });
  panel.addEventListener("input",function(e){
   if(!e.target||e.target.dataset.blSearch!==view)return;
   views[view].query=e.target.value;views[view].limit=12;renderResults(view);
  });
  panel.addEventListener("click",function(e){
   var btn=e.target&&typeof e.target.closest==="function"?e.target.closest("button"):null;
   if(!btn)return;
   if(btn.dataset.blFilter&&btn.dataset.blView===view)filter(view,btn.dataset.blFilter);
   else if(btn.dataset.blMore===view){views[view].limit+=24;renderResults(view);}
   else if(btn.dataset.blPick!==undefined&&btn.dataset.blView===view)pick(view,Number(btn.dataset.blPick));
  });
  render(view);
 });
 var liq=byId("liq"),free=byId("freeBtn");
 if(liq)liq.addEventListener("change",function(){render("main");});
 if(free)free.addEventListener("click",function(){render("main");});
 document.querySelectorAll(".cat").forEach(function(el){
  el.addEventListener("click",function(){render("main");});
 });
}
window.RTA_BELL_LIQUID_UI={render:render,renderResults:renderResults,views:views,filter:filter};
document.addEventListener("DOMContentLoaded",initialize);
})();