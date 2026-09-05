(function(){
'use strict';

var SALES='/data/market-sales-2026.json';
var MANAGEMENT='/data/market-management-2026.json';
var ID='marketAnalysisSynthesis';
var loading=false;

function el(id){return document.getElementById(id)}
function en(){return window.__rtaLang==='en'}
function t(ro,english){return en()?english:ro}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]})}
function n(value,digits){if(value==null||!Number.isFinite(Number(value)))return'—';return Number(value).toLocaleString(en()?'en-GB':'ro-RO',{maximumFractionDigits:digits==null?0:digits})}
function fetchJson(url){return fetch(url+'?synth='+Date.now(),{cache:'no-store'}).then(function(response){if(!response.ok)throw new Error(url+'-'+response.status);return response.json()})}
function css(){if(el('marketAnalysisSynthesisCss'))return;var link=document.createElement('link');link.id='marketAnalysisSynthesisCss';link.rel='stylesheet';link.href='/assets/market-analysis-synthesis.css?v=1';document.head.appendChild(link)}

function categoryLabel(category){
  return({
    POD:'POD',
    RTA:'RTA',
    mod:t('Moduri','Mods'),
    'RBA/bridge':'RBA / bridge',
    'RDA/RDTA':'RDA / RDTA',
    sarma:t('Sârmă','Wire'),
    'coil prebuilt':t('Coiluri','Coils'),
    'bumbac/wick':t('Bumbac','Cotton'),
    'chipset/board':t('Chipseturi','Chipsets'),
    acumulator:t('Acumulatori','Batteries'),
    incarcator:t('Încărcătoare','Chargers'),
    'unelte build':t('Unelte','Tools'),
    'componente RTA':t('Componente','Components'),
    'accesoriu RTA/mod':t('Accesorii','Accessories'),
    'lichid tutunos/NET/DIY':t('Tutun / NET','Tobacco / NET')
  })[category]||category||'—'
}

function categoryLeaders(sales){
  var grouped={};
  (sales.rankings||[]).forEach(function(row){
    if(!row.category||!row.product)return;
    var category=grouped[row.category]||(grouped[row.category]={});
    var key=String(row.canonicalProductKey||row.product);
    var item=category[key]||(category[key]={name:row.product,score:0,stores:{},bestRank:null});
    item.score+=1/Math.max(1,Number(row.rank)||999);
    item.stores[row.retailerId]=1;
    item.bestRank=item.bestRank==null?Number(row.rank):Math.min(item.bestRank,Number(row.rank));
  });
  var order=['POD','RTA','mod','RBA/bridge','RDA/RDTA','componente RTA','accesoriu RTA/mod','sarma','coil prebuilt','bumbac/wick','chipset/board','acumulator','incarcator','unelte build','lichid tutunos/NET/DIY'];
  return Object.keys(grouped).map(function(category){
    var rows=Object.values(grouped[category]).sort(function(a,b){
      return b.score-a.score||Object.keys(b.stores).length-Object.keys(a.stores).length||a.name.localeCompare(b.name);
    }).slice(0,3);
    return{category:category,rows:rows};
  }).filter(function(group){return group.rows.length}).sort(function(a,b){
    var ai=order.indexOf(a.category),bi=order.indexOf(b.category);
    return(ai<0?999:ai)-(bi<0?999:bi);
  });
}

function topProductsHtml(sales){
  var categories=categoryLeaders(sales);
  return'<section class="synth-section">'
    +'<div class="synth-title"><span>'+esc(t('Top produse urmărite','Top tracked products'))+'</span>'
    +'<p>'+esc(t('Perioada generală: 01.01.2026 → prezent. Ordinea reunește pozițiile produselor în topurile publice ale magazinelor românești. Noutățile sunt prezentate separat în Hype.','Overall period: 01.01.2026 → present. The order combines product positions in public rankings from Romanian stores. New releases are shown separately in Hype.'))+'</p></div>'
    +'<div class="synth-category-grid">'+categories.map(function(group){
      return'<article><h4>'+esc(categoryLabel(group.category))+'</h4>'+group.rows.map(function(row,index){
        return'<div class="synth-rank"><span>'+(index+1)+'</span><div><b>'+esc(row.name)+'</b><small>'
          +esc(n(Object.keys(row.stores).length)+' '+t('magazine · cea mai bună poziție #','stores · best position #')+n(row.bestRank))
          +'</small></div></div>';
      }).join('')+'</article>';
    }).join('')+'</div></section>';
}

function movementRows(management){
  var rows=management&&management.periods&&management.periods['30']&&management.periods['30'].product&&management.periods['30'].product.rows||[];
  var moving=rows.filter(function(row){return row.momentumPct!=null}).sort(function(a,b){return Number(b.momentumPct)-Number(a.momentumPct)}).slice(0,8);
  if(moving.length)return{mode:'movement',rows:moving.map(function(row){return{name:row.name,value:Number(row.momentumPct),stores:Number(row.bestsellerStorefronts||row.breadthStores||0),from:row.baselineDate,to:row.lastObservedAt}})};
  return{mode:'current',rows:rows.slice().sort(function(a,b){return Number(b.priorityScore)-Number(a.priorityScore)}).slice(0,8).map(function(row){return{name:row.name,stores:Number(row.bestsellerStorefronts||row.breadthStores||0)}})};
}

function movementHtml(management){
  var movement=movementRows(management);
  var intro=movement.mode==='movement'
    ?t('Comparația zilnică arată produsele care au urcat cel mai mult în topurile publice ale magazinelor.','The daily comparison shows products that climbed most in public store rankings.')
    :t('Aici sunt produsele cu cea mai bună poziție în actualizarea curentă.','These are the products with the strongest position in the current update.');
  return'<section class="synth-section"><div class="synth-title"><span>'+esc(t('Evoluția produselor','Product movement'))+'</span><p>'+esc(intro)+'</p></div>'
    +'<div class="synth-rotation">'+movement.rows.map(function(row,index){
      var description=movement.mode==='movement'
        ?t('evoluție între ','movement between ')+String(row.from||'—')+t(' și ',' and ')+String(row.to||'—')
        :t('prezent în topurile publice urmărite','present in the tracked public rankings');
      var value=movement.mode==='movement'?(row.value>0?'+':'')+n(row.value)+'%':n(row.stores)+' '+t('mag.','stores');
      return'<div><span>'+(index+1)+'</span><div><b>'+esc(row.name)+'</b><small>'+esc(description+(row.stores?' · '+n(row.stores)+' '+t('magazine','stores'):''))+'</small></div><strong>'+esc(value)+'</strong></div>';
    }).join('')+'</div></section>';
}

function render(sales,management){
  css();
  var cockpit=el('marketManagementCockpit');
  if(!cockpit||el(ID))return;
  var oldOverview=cockpit.querySelector('.mgmt-overview');
  if(oldOverview)oldOverview.remove();
  var oldPlan=cockpit.querySelector('.mgmt-plan');
  if(oldPlan)oldPlan.remove();
  var wrap=document.createElement('div');
  wrap.id=ID;
  wrap.className='market-analysis-synthesis';
  wrap.innerHTML=topProductsHtml(sales)+movementHtml(management);
  var direct=cockpit.querySelector('.mgmt-direct');
  if(direct&&direct.parentNode)direct.parentNode.insertBefore(wrap,direct.nextSibling);
  else cockpit.appendChild(wrap);
  document.dispatchEvent(new CustomEvent('rta:market:synthesis-ready'));
}

function load(){
  if(loading||el(ID))return;
  if(!el('marketManagementCockpit'))return;
  loading=true;
  Promise.all([fetchJson(SALES),fetchJson(MANAGEMENT)]).then(function(payload){render(payload[0],payload[1])}).finally(function(){loading=false});
}

function hydrate(){if(!el(ID))load()}
function boot(){document.addEventListener('rta:market:analysis-ready',hydrate);document.addEventListener('rta:market:hydrate',hydrate);hydrate();setTimeout(hydrate,450);setTimeout(hydrate,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
