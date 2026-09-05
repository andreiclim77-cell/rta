(function(){
'use strict';

var DATA='/data/market-analysis-public-2026.json';
var ID='marketManagementCockpit';
var loading=false;
var retries=0;
var timer=null;

function el(id){return document.getElementById(id)}
function en(){return window.__rtaLang==='en'}
function t(ro,english){return en()?english:ro}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(char){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]})}
function fetchJson(url){return fetch(url+'?analysis='+Date.now(),{cache:'no-store'}).then(function(response){if(!response.ok)throw new Error(url+'-'+response.status);return response.json()})}
function dateLabel(value){var date=new Date(value);if(!Number.isFinite(date.getTime()))return t('prezent','present');return date.toLocaleDateString(en()?'en-GB':'ro-RO',{timeZone:'Europe/Bucharest',day:'2-digit',month:'2-digit',year:'numeric'})}
function css(){if(el('marketManagementCss'))return;var link=document.createElement('link');link.id='marketManagementCss';link.rel='stylesheet';link.href='/assets/market-management.css?v=4';document.head.appendChild(link)}

function render(data){
  css();
  var root=el('market2026Root');
  if(!root||!root.querySelector('.market-hero'))return;
  var old=el(ID);
  if(old)old.remove();
  var box=document.createElement('section');
  box.id=ID;
  box.className='mgmt mgmt-public-analysis';
  var updatedAt=data.updatedAt||data.generatedAt;
  var evidenceStart=data.truth&&data.truth.evidenceFirstObservedAt;
  box.innerHTML='<div class="mgmt-hero">'
    +'<div class="mgmt-kicker">'+esc(t('ROMÂNIA · ACTUALIZAT ZILNIC LA 06:00','ROMANIA · UPDATED DAILY AT 06:00'))+'</div>'
    +'<h2>'+esc(t('Analiza pieței RTA din România','Romanian RTA market analysis'))+'</h2>'
    +'<p>'+esc(t('Două semnale publice, fără amestecarea indicatorilor: pozițiile din topurile comerciale și interesul observat online. Fiecare este separat pe mărci și produse.','Two public signals without mixing indicators: positions in commercial rankings and interest observed online. Each is split into brands and products.'))+'</p>'
    +'</div>'
    +'<div class="mgmt-evidence-window complete">'
    +'<div><span>'+esc(t('INTERVAL SOLICITAT','REQUESTED PERIOD'))+'</span><b>01.01.2026 → '+esc(dateLabel(updatedAt))+'</b></div>'
    +'<div><span>'+esc(t('DATE VERIFICABILE DISPONIBILE','VERIFIABLE DATA AVAILABLE'))+'</span><b>'+esc(dateLabel(evidenceStart))+' → '+esc(dateLabel(updatedAt))+'</b></div>'
    +'<strong>'+esc(t('Actualizare automată zilnică la 06:00.','Automatic daily update at 06:00.'))+'</strong>'
    +'<small>'+esc(t('Ordinea folosește numai observații datate. Clasamentele cumulative ale magazinelor nu sunt transformate în vânzări pentru perioada 01.01.2026–prezent, iar disponibilitatea curentă nu schimbă rezultatul.','The order uses dated observations only. Cumulative retailer rankings are never converted into sales for the 1 January 2026–present period, and current availability does not change the result.'))+'</small>'
    +'</div>'
    +'<div id="marketAnalysisSynthesisAnchor"></div>';
  var switcher=el('marketViewSwitcher');
  var hero=root.querySelector('.market-hero');
  if(switcher&&switcher.parentNode===root)root.insertBefore(box,switcher.nextSibling);
  else if(hero&&hero.nextSibling)root.insertBefore(box,hero.nextSibling);
  else root.insertBefore(box,root.firstChild);
  window.__rtaMarketAnalysisReady=true;
  window.__rtaMarketAnalysisError='';
  document.dispatchEvent(new CustomEvent('rta:market:analysis-ready'));
}

function noteError(error){window.__rtaMarketAnalysisReady=false;window.__rtaMarketAnalysisError=String(error&&error.message||error)}
function load(){
  if(loading||el(ID))return Promise.resolve();
  var root=el('market2026Root');
  if(!root||!root.querySelector('.market-hero'))return Promise.resolve();
  loading=true;
  return fetchJson(DATA).then(function(data){retries=0;render(data)}).catch(function(error){noteError(error);retries++;if(retries<10){clearTimeout(timer);timer=setTimeout(load,450+retries*180)}}).finally(function(){loading=false})
}
function hydrate(){if(!el(ID))load()}
function boot(){document.addEventListener('rta:market:hydrate',hydrate);hydrate();setTimeout(hydrate,350);setTimeout(hydrate,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
