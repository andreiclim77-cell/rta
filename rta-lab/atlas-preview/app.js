/* RTA Sensory Atlas · standalone Home + Liquid Cinema prototype.
   Real 620 catalog / 16 platforms / established Mood Match + Sensory DNA.
   Concept preview: no edits to V10 engine, no invented reviews, percentages or product photos. */
(function(){
"use strict";
const catalog=window.RTA_LIQUIDS||[];
const atoms=window.RTA_CORE?.atoms||[];
const core=window.RTA_SENSORY_CORE;
const moodEngine=window.RTA_MOOD_MATCH;
if(!core||!moodEngine||catalog.length<1||atoms.length<1)return;
const moodList=moodEngine.moods, momentList=moodEngine.moments;
const defaultLiquid=(()=>{
 const exact=catalog.findIndex(x=>x.brand==="La Tabaccheria"&&x.name==="Balkan Mixture");
 if(exact>=0)return exact;
 const similar=catalog.findIndex(x=>x.class==="NET complex"&&/Balkan/i.test(x.name));
 return similar>=0?similar:catalog.findIndex(x=>x.class==="NET complex");
})();
const state={route:"home",liquidIndex:Math.max(0,defaultLiquid),mood:"magic",moment:"evening",expandedId:null,search:"",activeSuggestion:0,fromDemo:true};
const esc=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const liquidName=l=>[l?.brand,l?.name].filter(Boolean).join(" · ");
const moodById=id=>moodList.find(m=>m.id===id);
const momentById=id=>momentList.find(m=>m.id===id);
const atomById=id=>atoms.find(a=>a.id===id);
const tech=atomId=>core.platforms[atomId];
const round=n=>Math.round(n*100)/100;
const element=id=>document.getElementById(id);
function liquidSearch(q,limit=10){
 const needle=norm(q).trim();
 if(needle.length<2)return [];
 const hits=[];
 for(let i=0;i<catalog.length&&hits.length<limit;i++){
  const l=catalog[i];
  const hay=norm([l.brand,l.name,l.profile,l.class,l.line,(l.tags||[]).join(" ")].join(" "));
  if(hay.includes(needle))hits.push({index:i,liquid:l});
 }
 return hits;
}
function currentLiquid(){return catalog[state.liquidIndex]||catalog[0];}
function buildString(result){
 const cfg=result.config,w=core.wires[cfg.wire],air=tech(cfg.atom)?.air.find(a=>a.id===cfg.air);
 return w.name+" · "+cfg.wraps+" spire · "+(air?air.label:"airflow configurabil");
}
function buildEnergy(result){
 const c=result.config,w=core.wires[c.wire];
 return w.type==="tc"?"TC "+c.temp+"°C · limită "+c.power+" W":"WATT "+c.power+" W";
}
function setupSummary(result){
 const c=result.config;
 return "Ø"+String(c.coilMm).replace(".",",")+" mm · "+buildEnergy(result);
}
function compactBuild(result){
 const c=result.config,w=core.wires[c.wire];
 const name=w.name.replace("Dicodes RESISTHERM ","Dicodes ").replace("Kanthal A1 ","K1 ");
 return name+" · "+c.wraps+" spire · Ø"+String(c.coilMm).replace(".",",")+" · "+buildEnergy(result);
}
function labelScore(v){
 if(v>=4.65)return "foarte pronunțat";
 if(v>=4.2)return "pronunțat";
 if(v>=3.6)return "echilibrat";
 return "moderat";
}
const signalNames={
 spectrum:"spectru",separation:"separare",simultaneity:"simultaneitate",
 palate:"palat",offense:"ofensivă",th:"TH",harmony:"armonie",
 focus:"focus",texture:"textură",tobaccoCore:"tutun"
};
function qualities(result){
 const r=result.signals;
 const main=["spectrum","simultaneity","palate","offense","th","harmony"];
 return main.map(key=>({key,value:r[key]})).sort((a,b)=>b.value-a.value).slice(0,3)
  .map(o=>signalNames[o.key]+" "+labelScore(o.value));
}
function vapeDescription(result,liquid){
 const s=result.signals;
 const first=s.simultaneity>=4.55?"note aromatice simultane":s.focus>=4.55?"aromă focalizată":"arhitectură aromatică echilibrată";
 const pal=s.palate>=4.65?"palat bogat":s.palate>=4.1?"palat prezent":"senzație pe palat mai rezervată";
 const force=s.offense>=4.6?"ofensivă puternică":s.offense<3.55?"atac mai blând":"ofensivă controlată";
 const th=s.th>=4.55?"TH pronunțat":s.th<3.6?"TH discret":"TH echilibrat";
 const mood=moodById(state.mood);
 return first+", "+pal+", "+force+" și "+th+". Interpretare tehnică orientativă pentru "+liquid.name+" / "+(mood?.name||"context")+".";
}
function evidenceFor(result,liquid){
 // Distinguish a report tied to this named liquid from an unspecified-liquid
 // user report (e.g. KLP NiFe30) and a report on a DIFFERENT named liquid.
 const partial=result.partialEvidence||[];
 const exact=partial.some(r=>r.liquidName&&norm(r.liquidName)===norm(liquid.name));
 const unknownLiquid=partial.some(r=>!r.liquidName);
 if(result.anchors?.length)return {label:"Build observat · potrivire pe lichid modelată",kind:"user"};
 if(exact)return {label:"Observație personală parțială pe lichidul selectat",kind:"partial"};
 if(unknownLiquid)return {label:"Observație personală cu lichid neprecizat · aplicarea aici este extrapolată",kind:"partial-context"};
 if(result.personalPreference?.tier===1)return {label:"Preferință personală declarată · rezultat contextual",kind:"user"};
 return {label:"Extrapolare tehnică · nu A/B pe acest lichid",kind:"model"};
}
function rankFor(liquidIndex,moodId,momentId){
 if(!catalog[liquidIndex]||!moodById(moodId)||!momentById(momentId))return null;
 const base=moodEngine.recommend(moodId,momentId,liquidIndex);
 if(!base||!Array.isArray(base.ranked))return null;
 // Use actual sorted contextual ranking, NOT Mood Match's exploratory third slot.
 const liquid=catalog[liquidIndex],mood=moodById(moodId);
 const selected=base.ranked.slice(0,3).map((a,i)=>{
  const picks=core.rankBuilds(a.id,liquid,mood.goal).slice(0,3);
  return {id:a.id,atom:atomById(a.id),score:a.score,position:i+1,builds:picks};
 });
 return {liquid,mood,moment:momentById(momentId),items:selected};
}
function renderAbstractAtom(atom,rank){
 const record=window.RTA_ATLAS_PHOTOS?.[atom.id];
 if(!record)return '<div class="atlas-missing-photo">Fotografie verificată încă indisponibilă pentru '+esc(atom.short)+'</div>';
 return '<figure class="atlas-product-photo">'+
  '<img src="'+esc(record.src)+'" loading="lazy" decoding="async" alt="'+esc(atom.short)+' — fotografie de produs" />'+
  '<figcaption><a href="'+esc(record.ref)+'" target="_blank" rel="noopener noreferrer" title="Fotografie reală: '+esc(record.credit)+'">FOTO: '+esc(record.credit)+' ↗</a></figcaption>'+
  '</figure>';
}
function renderCoil(config){
 const a=tech(config.atom)?.air.find(x=>x.id===config.air);
 const holes=Array.isArray(a?.holes)?a.holes.length:((a?.pattern==="multipoint")?3:1);
 const number=Math.min(7,Math.max(3,config.wraps));
 const coilWidth=number*20,offset=120-coilWidth/2;
 const rings=Array.from({length:number},(_,i)=>'<ellipse cx="'+(offset+10+i*20)+'" cy="39" rx="11" ry="16" fill="none" stroke="#d6b990" stroke-width="3.5"/>').join("");
 const holeDots=Array.from({length:Math.min(5,holes)},(_,i)=>{
  const cx=120+(i-(Math.min(5,holes)-1)/2)*30;
  return '<circle cx="'+cx+'" cy="79" r="4" fill="#80c9bc"/>'+
   '<path d="M'+cx+' 75 L'+cx+' 54" fill="none" stroke="#90d7cb" stroke-width="2" stroke-linecap="round" class="air-beams"/>';
 }).join("");
 const ct=core.wires[config.wire].type==="tc";
 return '<svg viewBox="0 0 240 100" role="img" aria-label="Schemă animată: '+number+' spire și '+holes+' canale de aer, nu simulare fizică">'+
 '<path d="M15 43H48 M192 43H224" stroke="#819c9d" stroke-width="3"/>'+
 rings+holeDots+'<path d="M45 85H195" stroke="#5d8f84" opacity=".4"/>'+
 '<text x="6" y="15" font-size="9" letter-spacing="1.2" fill="'+(ct?"#d4c7a5":"#90c5b9")+'">'+(ct?"TC CONTROL":"WATT DRIVE")+'</text></svg>';
}
function renderBuild(result,rank,liquid){
 const cfg=result.config,w=core.wires[cfg.wire];
 const evidence=evidenceFor(result,liquid);
 const line=vapeDescription(result,liquid);
 return '<article class="build-card'+(rank===1?' build-lead':'')+'">'+
  '<span class="build-badge">'+(rank===1?'01 · CEA MAI BUNĂ POTRIVIRE CALCULATĂ':'0'+rank+' · ALTERNATIVĂ CONTEXTUALĂ')+'</span>'+
  '<strong>'+esc(w.name)+' / '+cfg.wraps+' spire</strong>'+
  '<div class="build-visual">'+renderCoil(cfg)+'</div>'+
  '<div class="build-technical"><b>Insert:</b> '+esc(tech(cfg.atom).air.find(a=>a.id===cfg.air)?.label||"variabil")+'<br>'+
  '<b>Clopot:</b> '+esc(window.RTA_BELL_LIQUID_FIT.config(cfg.atom)?.bells?.find(b=>b.id===cfg.bell)?.name||"standard")+'<br>'+
  '<b>Regim:</b> '+esc(setupSummary(result))+'</div>'+
  '<p class="build-sensory">'+esc(line)+'</p>'+
  '<div class="build-evidence">'+esc(evidence.label)+'</div></article>';
}
function watchInternal(item){
 const alt=item.builds[1];
 if(!alt)return "Nu există deocamdată o a doua combinație compatibilă documentată.";
 return "Merită comparat și "+buildString(alt)+". Modelul sugerează alt echilibru; nu îl prezentăm drept A/B confirmat pe lichidul ales.";
}
function renderResult(item,liquid){
 const best=item.builds[0],evidence=evidenceFor(best,liquid);
 const selected=state.expandedId===item.id;
 const strengths=qualities(best).map(s=>'<span class="sensory-token">'+esc(s)+'</span>').join("");
 const count=item.builds.length;
 return '<article class="result-card" data-atom="'+esc(item.id)+'">'+
 '<div class="card-main">'+
 '<div class="atom-portrait">'+renderAbstractAtom(item.atom,item.position)+'<span>STUDIU VIZUAL · SCHEMATIC</span></div>'+
 '<div class="card-body"><span class="card-overline">0'+item.position+' / '+esc(item.position===1?"POTRIVIREA CONTEXTUALĂ PRINCIPALĂ":"O ALTĂ INTERPRETARE")+'</span>'+
 '<h3>'+esc(item.atom.short)+'</h3>'+
 '<p>'+esc(vapeDescription(best,liquid))+'</p>'+
 '<div class="best-config"><span>BEST BUILD</span> · '+esc(buildString(best))+'</div>'+
 '<div class="sensory-tokens">'+strengths+'</div></div>'+
 '<div class="card-side"><span class="card-rank">0'+item.position+'</span>'+
 '<button type="button" class="open-builds" data-expand="'+esc(item.id)+'" aria-expanded="'+String(selected)+'" aria-controls="detail-'+esc(item.id)+'">'+(selected?'Închide':'Cele '+count+' builduri')+' <span aria-hidden="true">'+(selected?'−':'+')+'</span></button></div></div>'+
 '<div class="card-detail" id="detail-'+esc(item.id)+'"'+(selected?'':' hidden')+'>'+
 '<p class="detail-intro"><strong>'+esc(evidence.label)+'.</strong> Configurațiile sunt ordonate pentru '+esc(liquid.name)+' în contextul ales; experiența ta directă primează unde există un test relevant.</p>'+
 '<div class="detail-grid">'+item.builds.map((b,i)=>renderBuild(b,i+1,liquid)).join("")+'</div>'+
 '<div class="watchlist"><div class="watch-item"><b>01 / De urmărit — din experiența ta</b><p>'+esc(watchInternal(item))+'</p></div>'+
 '<div class="watch-item market"><b>02 / De urmărit — din piață</b><p>Semnalul extern pentru acest setup este încă în cercetare. Nu inventăm consensul din review-uri; această zonă va primi surse și date înainte de a recomanda ferm.</p></div></div>'+
 '<p class="detail-foot">Graficele și schemele sunt ilustrații tehnice. Nu sunt măsurători ale temperaturii, debitului, gustului sau procente ale plăcerii.</p></div></article>';
}
function compose(liquidIndex,moodId,momentId){
 const ranked=rankFor(liquidIndex,moodId,momentId);
 if(!ranked)return null;
 return {
  ...ranked, countAtoms:atoms.length,countLiquids:catalog.length,
  distinctAtoms:new Set(ranked.items.map(i=>i.id)).size,
  distinctBuilds:ranked.items.reduce((n,i)=>n+i.builds.length,0),
  source:"RTA_SENSORY_CORE.rankBuilds + RTA_MOOD_MATCH.recommend.ranked"
 };
}
function drawScene(){
 const l=currentLiquid();
 if(!l)return;
 const tags=(l.tags||[]).slice(0,4);
 element("sceneCategory").textContent=l.class.toUpperCase();
 element("sceneLabel").textContent=/(complex)/i.test(l.class)?"Straturi. Profunzime. Simultaneitate.":"Un caracter. Un centru aromatic.";
 element("sceneTags").innerHTML=tags.length?tags.map(t=>'<span>'+esc(t.toUpperCase())+'</span>').join(""):
 '<span>PROFIL DIN CATALOG</span>';
 const dark=/(latakia|kentucky|dark|cigar)/i.test([l.profile,...(l.tags||[])].join(" "));
 document.querySelector(".live-scene")?.classList.toggle("scene-dark",dark);
}
function updateSceneMatch(result){
 const item=result?.items?.[0],build=item?.builds?.[0];
 const atom=element("sceneMatchAtom"),detail=element("sceneMatchBuild");
 if(!atom||!detail)return;
 atom.textContent=build?(item.atom?.short||item.id):"Context indisponibil";
 detail.textContent=build?compactBuild(build):"Alege alt context.";
 detail.title=build?buildString(build)+" · "+setupSummary(build):"";
}
function scrollToBest(){
 const target=element("resultCards")?.querySelector(".result-card")||element("resultsSection");
 target?.scrollIntoView({block:"start",behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
}
function revealSelectedChips(){
 if(!window.matchMedia?.("(max-width:760px)").matches)return;
 for(const id of ["moodChips","momentChips"]){
  const rail=element(id),chip=rail?.querySelector(".chip.active");
  if(!rail||!chip)continue;
  const box=rail.getBoundingClientRect(),item=chip.getBoundingClientRect();
  if(!box.width||!item.width)continue;
  if(item.right>box.right-8)rail.scrollLeft+=item.right-box.right+12;
  else if(item.left<box.left+8)rail.scrollLeft-=box.left-item.left+12;
 }
}
function renderResults(){
 const result=compose(state.liquidIndex,state.mood,state.moment);
 const box=element("resultCards");
 if(!box)return;
 if(!result){
  box.innerHTML='<div class="empty-results">Nu avem suficiente date pentru acest context. Selectează alt lichid sau altă stare.</div>';
  updateSceneMatch(null);
  return;
 }
 if(state.expandedId===null&&result.items.length&&!window.matchMedia?.("(max-width:760px)").matches)state.expandedId=result.items[0].id;
 if(state.expandedId&&!result.items.some(x=>x.id===state.expandedId))
  state.expandedId=result.items[0]?.id||null;
 element("resultsSummary").textContent=liquidName(result.liquid)+" · "+result.mood.name+" · "+result.moment.name+
 " · ordonare contextuală din 16 platforme.";
 element("resultCounter").textContent="TOP 3 · 3 × 3";
 box.innerHTML=result.items.map(x=>renderResult(x,result.liquid)).join("");
 updateSceneMatch(result);
}
function renderMoodMoment(){
 element("moodChips").innerHTML=moodList.map(m=>
 '<button class="chip'+(state.mood===m.id?' active':'')+'" type="button" data-mood="'+esc(m.id)+'" aria-pressed="'+(state.mood===m.id)+'"><span class="chip-emoji">'+m.icon+'</span>'+esc(m.name)+'</button>').join("");
 element("momentChips").innerHTML=momentList.map(m=>
 '<button class="chip'+(state.moment===m.id?' active':'')+'" type="button" data-moment="'+esc(m.id)+'" aria-pressed="'+(state.moment===m.id)+'"><span class="chip-emoji">'+m.icon+'</span>'+esc(m.name)+'</button>').join("");
 revealSelectedChips();
}
function selectLiquid(index,manual=true){
 if(!Number.isInteger(index)||!catalog[index])return false;
 state.liquidIndex=index;state.fromDemo=!manual;state.expandedId=null;
 element("liquidSearch").value=liquidName(catalog[index]);
 element("selectedLiquid").innerHTML='<span class="check" aria-hidden="true">✓</span><span><b>'+esc(liquidName(catalog[index]))+'</b>'+
 (state.fromDemo?' · exemplu din catalog':' · ales de tine')+'</span>';
 element("liquidSuggestions").hidden=true;
 element("liquidSearch").setAttribute("aria-expanded","false");
 element("liquidSearch").removeAttribute("aria-activedescendant");
 drawScene();
 renderResults();
 return true;
}
function renderQuick(){
 const desired=[
  {brand:"La Tabaccheria",name:"Balkan Mixture"},
  {brand:"Vapor Cave",name:"Black Balkan"},
  {brand:"Hangsen",name:"Virginia"}
 ];
 const ids=desired.map(t=>catalog.findIndex(l=>l.brand===t.brand&&l.name===t.name)).filter(i=>i>=0);
 if(ids.length<2)ids.push(...catalog.map((x,i)=>x.class==="NET complex"?i:-1).filter(i=>i>=0).slice(0,3-ids.length));
 const indexes=[...new Set(ids)].slice(0,3);
 element("sampleLiquids").innerHTML=indexes.map(i=>'<button type="button" data-liquid="'+i+'">'+esc(catalog[i].name)+'</button>').join("");
}
function renderSuggestions(){
 const input=element("liquidSearch"),box=element("liquidSuggestions");
 const rows=liquidSearch(input.value,10);
 box.hidden=!rows.length;
 input.setAttribute("aria-expanded",String(!!rows.length));
 state.activeSuggestion=0;
 input.setAttribute("aria-activedescendant",rows.length?"liquidOpt0":"");
 box.innerHTML=rows.map((x,i)=>
  '<button type="button" id="liquidOpt'+i+'" class="suggestion'+(i===0?' is-active':'')+'" role="option" aria-selected="'+(i===0)+'" data-liquid="'+x.index+'">'+
  '<strong>'+esc(liquidName(x.liquid))+'</strong><small>'+esc(x.liquid.class)+' · '+esc(x.liquid.profile||"")+'</small></button>').join("");
}
function closeSuggestions(){
 element("liquidSuggestions").hidden=true;
 element("liquidSearch").setAttribute("aria-expanded","false");
 element("liquidSearch").removeAttribute("aria-activedescendant");
}
function route(to,push=true){
 if(!["home","liquid"].includes(to))return false;
 state.route=to;
 const isHome=to==="home";
 element("pageHome").hidden=!isHome;
 element("pageLiquid").hidden=isHome;
 document.querySelectorAll("[data-route]").forEach(el=>{
  if(el.tagName==="BUTTON"&&el.closest(".top-nav")){
   if(el.dataset.route===to)el.setAttribute("aria-current","page");
   else el.removeAttribute("aria-current");
  }
 });
 if(push&&window.history?.pushState){
  window.history.pushState(null,"",to==="liquid"?"#liquid":"#home");
 }
 window.scrollTo?.({top:0,behavior:"instant"});
 if(!isHome&&window.requestAnimationFrame)window.requestAnimationFrame(revealSelectedChips);
 return true;
}
function init(){
 if(!element("pageHome")||!element("pageLiquid"))return;
 renderMoodMoment();renderQuick();
 selectLiquid(state.liquidIndex,false);
 route(window.location?.hash==="#liquid"?"liquid":"home",false);
 document.addEventListener("click",ev=>{
  const target=ev.target.closest?.("[data-route],[data-liquid],[data-mood],[data-moment],[data-expand],[data-go-best]");
  if(!target)return;
  const d=target.dataset;
  if(d.route){ev.preventDefault();route(d.route);return;}
  if(d.goBest!=null){scrollToBest();return;}
  if(d.liquid!=null){selectLiquid(Number(d.liquid));return;}
  if(d.mood){state.mood=d.mood;state.expandedId=null;renderMoodMoment();renderResults();return;}
  if(d.moment){state.moment=d.moment;state.expandedId=null;renderMoodMoment();renderResults();return;}
  if(d.expand){state.expandedId=state.expandedId===d.expand?"":d.expand;renderResults();}
 });
 element("liquidSearch").addEventListener("input",renderSuggestions);
 element("liquidSearch").addEventListener("keydown",ev=>{
  const list=element("liquidSuggestions"),input=ev.currentTarget;
  if(ev.key==="Escape"){
   closeSuggestions();
   return;
  }
  if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){
   const options=[...list.querySelectorAll("[data-liquid]")];
   if(list.hidden||!options.length)return;
   ev.preventDefault();
   state.activeSuggestion=(state.activeSuggestion+(ev.key==="ArrowDown"?1:-1)+options.length)%options.length;
   options.forEach((option,i)=>{
    option.classList.toggle("is-active",i===state.activeSuggestion);
    option.setAttribute("aria-selected",String(i===state.activeSuggestion));
   });
   input.setAttribute("aria-activedescendant",options[state.activeSuggestion].id);
   options[state.activeSuggestion].scrollIntoView({block:"nearest"});
   return;
  }
  if(ev.key==="Enter"&&!list.hidden){
   const hits=liquidSearch(input.value,10);
   if(hits.length){ev.preventDefault();selectLiquid(hits[Math.min(state.activeSuggestion,hits.length-1)].index);}
  }
 });
 document.addEventListener("focusin",ev=>{
  if(!ev.target.closest?.(".liquid-search-wrap"))closeSuggestions();
 });
 document.addEventListener("click",ev=>{
  if(!ev.target.closest?.(".liquid-search-wrap"))closeSuggestions();
 });
 element("clearSearch").addEventListener("click",()=>{
  element("liquidSearch").value="";
  element("liquidSearch").focus();
  renderSuggestions();
 });
 element("matchButton").addEventListener("click",()=>{
  state.expandedId=null;renderResults();
  scrollToBest();
 });
 window.addEventListener("popstate",()=>route(window.location.hash==="#liquid"?"liquid":"home",false));
}
window.RTA_ATLAS_PREVIEW={
 version:"0.2-real-photo-motion",compose,liquidSearch,buildString,compactBuild,
 renderCoil,qualities,vapeDescription,evidenceFor,state,getSourceModel:()=>({atoms:atoms.length,liquids:catalog.length}),
 init
};
if(typeof document!=="undefined")document.addEventListener("DOMContentLoaded",init);
})();
