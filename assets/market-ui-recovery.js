(function(){
'use strict';
var timer=null,startedAt=Date.now(),attempts={};
var MODULES=[
  {id:'marketManagementCockpit',src:'/assets/market-management-v2.js?v=2',label:'Analiza'},
  {id:'marketExecutiveReport',src:'/assets/market-executive-report-v2.js?v=1',label:'Raport'},
  {id:'marketDemandIntelligence',src:'/assets/market-demand-ui.js?v=1',label:'Interes'},
  {id:'marketHypeRadar',src:'/assets/market-hype-ui.js?v=2',label:'Hype Radar'},
  {id:'marketManagementAugment',src:'/assets/market-management-augment.js?v=1',label:'Management'},
  {id:'marketViewSwitcher',src:'/assets/market-view-switcher.js?v=3',label:'Interfață'}
];
function el(id){return document.getElementById(id)}
function inject(m){
  attempts[m.id]=(attempts[m.id]||0)+1;
  var s=document.createElement('script');
  s.async=false;
  s.dataset.marketRecovery=m.id;
  s.src=m.src+(m.src.indexOf('?')>=0?'&':'?')+'recover='+Date.now()+'&try='+attempts[m.id];
  document.head.appendChild(s);
}
function scan(){
  var root=el('market2026Root');
  if(!root||!root.querySelector('.market-hero'))return;
  var elapsed=Date.now()-startedAt;
  if(elapsed<1400)return;
  MODULES.forEach(function(m){
    if(el(m.id))return;
    var n=attempts[m.id]||0;
    if(n>=3)return;
    var last=document.querySelector('script[data-market-recovery="'+m.id+'"]');
    if(last&&Date.now()-Number(last.dataset.startedAt||0)<1200)return;
    inject(m);
    var current=document.querySelectorAll('script[data-market-recovery="'+m.id+'"]');
    if(current.length)current[current.length-1].dataset.startedAt=String(Date.now());
  });
}
function schedule(){clearTimeout(timer);timer=setTimeout(scan,180)}
function boot(){
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  schedule();
  setTimeout(scan,1600);
  setTimeout(scan,3200);
  setTimeout(scan,5200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
