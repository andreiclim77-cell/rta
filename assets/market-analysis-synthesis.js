(function(){
'use strict';

var DATA='/data/market-analysis-public-2026.json';
var ID='marketAnalysisSynthesis';
var loading=false;

function el(id){return document.getElementById(id)}
function en(){return window.__rtaLang==='en'}
function t(ro,english){return en()?english:ro}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]})}
function n(value){if(value==null||!Number.isFinite(Number(value)))return'—';return Number(value).toLocaleString(en()?'en-GB':'ro-RO',{maximumFractionDigits:0})}
function fetchJson(url){return fetch(url+'?synth='+Date.now(),{cache:'no-store'}).then(function(response){if(!response.ok)throw new Error(url+'-'+response.status);return response.json()})}
function css(){if(el('marketAnalysisSynthesisCss'))return;var link=document.createElement('link');link.id='marketAnalysisSynthesisCss';link.rel='stylesheet';link.href='/assets/market-analysis-synthesis.css?v=2';document.head.appendChild(link)}

var CATEGORY_ORDER=['POD','RTA','mod','RBA/bridge','RDA/RDTA','componente RTA','accesoriu RTA/mod','sarma','coil prebuilt','bumbac/wick','chipset/board','acumulator','incarcator','unelte build'];
function categoryLabel(category){return({POD:'POD',RTA:'RTA',mod:t('Moduri','Mods'),'RBA/bridge':'RBA / bridge','RDA/RDTA':'RDA / RDTA','componente RTA':t('Componente RTA','RTA components'),'accesoriu RTA/mod':t('Accesorii','Accessories'),sarma:t('Sârmă','Wire'),'coil prebuilt':t('Coiluri','Coils'),'bumbac/wick':t('Bumbac','Cotton'),'chipset/board':t('Chipseturi','Chipsets'),acumulator:t('Acumulatori','Batteries'),incarcator:t('Încărcătoare','Chargers'),'unelte build':t('Unelte','Tools')})[category]||category||'—'}
function categorySort(a,b){var ai=CATEGORY_ORDER.indexOf(a.category),bi=CATEGORY_ORDER.indexOf(b.category);return(ai<0?999:ai)-(bi<0?999:bi)}
function link(name,url){var label=esc(name);return/^https?:\/\//i.test(String(url||''))?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+label+'</a>':'<b>'+label+'</b>'}
function interestDetail(row){
  var value=n(row.metricValue);
  if(row.metricKind==='google-monthly-searches')return value+' '+t('căutări Google pe lună','Google searches per month');
  if(row.metricKind==='guide-searches-30d')return value+' '+t('căutări în ghid în 30 de zile','guide searches in 30 days');
  if(row.metricKind==='community-mentions')return value+' '+t('mențiuni publice observate','observed public mentions');
  if(row.metricKind==='public-review-views')return value+' '+t('vizualizări ale recenziilor publice','views of public reviews');
  return value+' '+t('semnale publice','public signals');
}
function rankRows(rows,kind){return(rows||[]).map(function(row,index){
  var detail=kind==='sales'?n(row.storeCount)+' '+t('magazine · cea mai bună poziție #','stores · best position #')+n(row.bestRank):interestDetail(row);
  return'<div class="synth-rank"><span>'+(index+1)+'</span><div>'+link(row.name,kind==='sales'?row.productUrl:'')+'<small>'+esc(detail)+'</small></div></div>';
}).join('')}
function categoryGrid(groups,kind){return'<div class="synth-category-grid">'+(groups||[]).slice().sort(categorySort).map(function(group){return'<article><h4>'+esc(categoryLabel(group.category))+'</h4>'+rankRows(group.products,kind)+'</article>'}).join('')+'</div>'}
function section(title,intro,groups,kind,accent){return'<section class="synth-section '+accent+'"><div class="synth-title"><span>'+esc(title)+'</span><p>'+esc(intro)+'</p></div>'+categoryGrid(groups,kind)+'</section>'}

function render(data){
  css();
  var cockpit=el('marketManagementCockpit');
  if(!cockpit||el(ID))return;
  var wrap=document.createElement('div');
  wrap.id=ID;
  wrap.className='market-analysis-synthesis';
  wrap.innerHTML=section(
    t('Ce s-a vândut cel mai bine','What sold best'),
    t('Clasamentul pe categorii combină pozițiile produselor în topurile publice de vânzare și popularitate observate în 2026. Nu folosește stocul curent și nu pretinde volume naționale de bucăți.','The category ranking combines product positions in public sales and popularity lists observed in 2026. It does not use current stock or claim national unit volumes.'),
    data.bestSellers,'sales','synth-sales'
  )+section(
    t('Idei de cumpărare','Buying ideas'),
    t('Produsele cu cel mai puternic interes public măsurabil. Fiecare rezultat spune direct dacă semnalul provine din căutări, comunități sau vizualizările recenziilor.','Products with the strongest measurable public interest. Every result states whether its signal comes from searches, communities or review views.'),
    data.buyingIdeas,'ideas','synth-ideas'
  );
  var anchor=el('marketAnalysisSynthesisAnchor');
  if(anchor)anchor.replaceWith(wrap);else cockpit.appendChild(wrap);
  window.__rtaMarketSynthesisReady=true;
  window.__rtaMarketSynthesisError='';
  document.dispatchEvent(new CustomEvent('rta:market:synthesis-ready'));
}

function noteError(error){window.__rtaMarketSynthesisReady=false;window.__rtaMarketSynthesisError=String(error&&error.message||error)}
function load(){if(loading||el(ID)||!el('marketManagementCockpit'))return;loading=true;fetchJson(DATA).then(render).catch(noteError).finally(function(){loading=false})}
function hydrate(){if(!el(ID))load()}
function boot(){document.addEventListener('rta:market:analysis-ready',hydrate);document.addEventListener('rta:market:hydrate',hydrate);hydrate();setTimeout(hydrate,450);setTimeout(hydrate,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
