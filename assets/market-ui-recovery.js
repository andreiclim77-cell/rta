(function(){
'use strict';
var attempts={},last={},stopped=false,scanning=false;
var MODULES=[
 {id:'marketManagementCockpit',src:'/assets/market-management-v2.js?v=4'},
 {id:'marketAnalysisSynthesis',src:'/assets/market-analysis-synthesis.js?v=1'},
 {id:'marketHypeRadar',src:'/assets/market-hype-ui.js?v=8'},
 {id:'marketViewSwitcher',src:'/assets/market-view-switcher.js?v=7'}
];
function el(id){return document.getElementById(id)}
function inject(m){var n=attempts[m.id]||0;if(n>=5)return;attempts[m.id]=n+1;last[m.id]=Date.now();var s=document.createElement('script');s.async=false;s.src=m.src+(m.src.indexOf('?')>=0?'&':'?')+'recover='+Date.now()+'&try='+(n+1);document.head.appendChild(s)}
function scan(){
 if(stopped||scanning)return;
 var root=el('market2026Root');
 if(!root||!root.querySelector('.market-hero'))return;
 scanning=true;
 try{
  document.dispatchEvent(new CustomEvent('rta:market:hydrate'));
  var missing=MODULES.filter(function(m){return !el(m.id)});
  if(!missing.length){if(root.dataset.marketGuardReady==='1')stopped=true;return}
  missing.forEach(function(m){if(Date.now()-Number(last[m.id]||0)>=1400)inject(m)})
 }finally{scanning=false}
}
function boot(){[250,700,1400,2400,3800,5600,8000,11000,15000].forEach(function(ms){setTimeout(scan,ms)});document.addEventListener('rta:market:hydrate',scan)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
