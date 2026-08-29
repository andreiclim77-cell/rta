(function(){
'use strict';
var timer=null,startedAt=Date.now(),attempts={},lastInject={};
var MODULES=[
  {id:'marketManagementCockpit',src:'/assets/market-management-v2.js?v=3',label:'Analiza'},
  {id:'marketExecutiveReport',src:'/assets/market-executive-report-v2.js?v=2',label:'Raport'},
  {id:'marketDemandIntelligence',src:'/assets/market-demand-ui.js?v=2',label:'Interes'},
  {id:'marketHypeRadar',src:'/assets/market-hype-ui.js?v=3',label:'Hype Radar'},
  {id:'marketManagementAugment',src:'/assets/market-management-augment.js?v=2',label:'Management'},
  {id:'marketViewSwitcher',src:'/assets/market-view-switcher.js?v=3',label:'Interfață'}
];
function el(id){return document.getElementById(id)}
function inject(m){
  attempts[m.id]=(attempts[m.id]||0)+1;
  lastInject[m.id]=Date.now();
  var s=document.createElement('script');
  s.async=false;
  s.dataset.marketRecovery=m.id;
  s.src=m.src+(m.src.indexOf('?')>=0?'&':'?')+'recover='+Date.now()+'&try='+attempts[m.id];
  document.head.appendChild(s);
}
function scan(){
  var root=el('market2026Root');
  if(!root||!root.querySelector('.market-hero'))return;
  document.dispatchEvent(new CustomEvent('rta:market:hydrate'));
  MODULES.forEach(function(m){
    if(el(m.id))return;
    var n=attempts[m.id]||0;
    if(n>=8)return;
    if(Date.now()-Number(lastInject[m.id]||0)<1600)return;
    inject(m);
  });
}
function schedule(){if(timer)return;timer=setTimeout(function(){timer=null;scan()},180)}
function boot(){
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  schedule();
  [600,1400,2600,4200,6500,9000,12500,17000,23000,30000].forEach(function(ms){setTimeout(scan,ms)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
