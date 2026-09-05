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
function css(){if(el('marketAnalysisSynthesisCss'))return;var link=document.createElement('link');link.id='marketAnalysisSynthesisCss';link.rel='stylesheet';link.href='/assets/market-analysis-synthesis.css?v=5';document.head.appendChild(link)}

var CATEGORY_ORDER=['POD','RTA','mod','RBA/bridge','RDA/RDTA','componente RTA','accesoriu RTA/mod','sarma','coil prebuilt','bumbac/wick','chipset/board','acumulator','incarcator','unelte build'];
function categoryLabel(category){return({POD:'POD',RTA:'RTA',mod:t('Moduri','Mods'),'RBA/bridge':'RBA / bridge','RDA/RDTA':'RDA / RDTA','componente RTA':t('Componente RTA','RTA components'),'accesoriu RTA/mod':t('Accesorii','Accessories'),sarma:t('Sârmă','Wire'),'coil prebuilt':t('Coiluri','Coils'),'bumbac/wick':t('Bumbac','Cotton'),'chipset/board':t('Chipseturi','Chipsets'),acumulator:t('Acumulatori','Batteries'),incarcator:t('Încărcătoare','Chargers'),'unelte build':t('Unelte','Tools')})[category]||category||'—'}
function categorySort(a,b){var ai=CATEGORY_ORDER.indexOf(a.category),bi=CATEGORY_ORDER.indexOf(b.category);return(ai<0?999:ai)-(bi<0?999:bi)}
function link(name,url){var label=esc(name);return/^https?:\/\//i.test(String(url||''))?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+label+'</a>':'<b>'+label+'</b>'}
function signalLabel(kind){
  if(kind==='google-monthly-searches')return t('căutări lunare','monthly searches');
  if(kind==='guide-searches-30d')return t('căutări în ghid','guide searches');
  if(kind==='community-mentions')return t('mențiuni','mentions');
  if(kind==='public-review-views')return t('recenzii','reviews');
  return t('interes public','public interest');
}
function interestDetail(row,view){
  if(view==='brands')return n(row.trackedProducts)+' '+t('produse cu interes','products attracting interest');
  var value=n(row.metricValue);
  if(row.metricKind==='google-monthly-searches')return value+' '+t('căutări lunare','monthly searches');
  if(row.metricKind==='guide-searches-30d')return value+' '+t('căutări în ghid','guide searches');
  if(row.metricKind==='community-mentions')return value+' '+t('mențiuni','mentions');
  if(row.metricKind==='public-review-views')return value+' '+t('vizualizări în recenzii','review views');
  return value+' '+t('interes public','public interest');
}
function popularityDetail(row){
  return n(row.storefrontCount||row.sourceCount)+' '+t((row.storefrontCount||row.sourceCount)===1?'magazin':'magazine',(row.storefrontCount||row.sourceCount)===1?'store':'stores')+' · '+t('cel mai sus pe locul ','highest at no. ')+n(row.bestRank);
}
function rankRows(rows,kind,view){return(rows||[]).map(function(row,index){
  var detail=kind==='popularity'?popularityDetail(row):interestDetail(row,view);
  return'<div class="synth-rank"><span>'+(index+1)+'</span><div>'+link(row.name,kind==='popularity'&&view==='products'?row.productUrl:'')+'<small>'+esc(detail)+'</small></div></div>';
}).join('')}
function categoryGrid(groups,kind,view){
  var cards=(groups||[]).slice().sort(categorySort).map(function(group){var rows=group[view]||[];if(!rows.length)return'';return'<article><h4>'+esc(categoryLabel(group.category))+'</h4>'+rankRows(rows,kind,view)+'</article>'}).join('');
  return'<div class="synth-category-grid" data-synth-grid="'+view+'"'+(view==='products'?' hidden':'')+'>'+cards+'</div>';
}
function section(id,title,intro,groups,kind,accent){return'<section class="synth-section '+accent+'" data-synth-section="'+id+'"><div class="synth-title"><span>'+esc(title)+'</span><p>'+esc(intro)+'</p><div class="synth-mode" role="tablist" aria-label="'+esc(t('Tip clasament','Ranking type'))+'"><button type="button" class="active" data-synth-view="brands" role="tab" aria-selected="true">'+esc(t('Mărci','Brands'))+'</button><button type="button" data-synth-view="products" role="tab" aria-selected="false">'+esc(t('Produse','Products'))+'</button></div></div>'+categoryGrid(groups,kind,'brands')+categoryGrid(groups,kind,'products')+'</section>'}
function bindModes(root){root.querySelectorAll('[data-synth-section]').forEach(function(section){section.querySelectorAll('[data-synth-view]').forEach(function(button){button.addEventListener('click',function(){var view=button.dataset.synthView;section.querySelectorAll('[data-synth-view]').forEach(function(item){var active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-selected',active?'true':'false')});section.querySelectorAll('[data-synth-grid]').forEach(function(grid){grid.hidden=grid.dataset.synthGrid!==view})})})})}

function render(data){
  css();
  var cockpit=el('marketManagementCockpit');
  if(!cockpit||el(ID))return;
  var wrap=document.createElement('div');
  wrap.id=ID;
  wrap.className='market-analysis-synthesis';
  wrap.innerHTML=section(
    'popularity',
    t('Vizibilitate în magazine','Store visibility'),
    t('Topuri publice, nu volume de vânzări.','Public rankings, not sales volumes.'),
    data.observedPopularity,'popularity','synth-sales'
  )+section(
    'ideas',
    t('Idei de cumpărare','Buying ideas'),
    t('Mărci și produse care atrag interes acum.','Brands and products attracting interest now.'),
    data.buyingIdeas,'ideas','synth-ideas'
  );
  var anchor=el('marketAnalysisSynthesisAnchor');
  if(anchor)anchor.replaceWith(wrap);else cockpit.appendChild(wrap);
  bindModes(wrap);
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
