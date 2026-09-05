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
  box.innerHTML='<div class="mgmt-hero">'
    +'<div class="mgmt-kicker">'+esc(t('ROMÂNIA · ACTUALIZARE ZILNICĂ','ROMANIA · UPDATED DAILY'))+'</div>'
    +'<h2>'+esc(t('Analiza pieței RTA','RTA market analysis'))+'</h2>'
    +'<p>'+esc(t('Clasamente simple pe mărci și produse, plus ce atrage interes acum.','Simple brand and product rankings, plus what is attracting interest now.'))+'</p>'
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
