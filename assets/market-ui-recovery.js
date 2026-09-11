(function(){
'use strict';
if(window.__rtaMarketUiRecoveryBooted){document.dispatchEvent(new CustomEvent('rta:market:hydrate'));return}
window.__rtaMarketUiRecoveryBooted=true;
var attempts={},last={},stopped=false,scanning=false,timers=[];
var MODULES=[
 {id:'marketManagementCockpit',src:'/assets/market-management-v2.js?v=10'},
 {id:'marketAnalysisSynthesis',src:'/assets/market-analysis-synthesis.js?v=7'},
 {id:'marketHypeRadar',src:'/assets/market-hype-ui.js?v=14'},
 {id:'marketViewSwitcher',src:'/assets/market-view-switcher.js?v=11'}
];
function el(id){return document.getElementById(id)}
function base(src){return String(src||'').split('?')[0]}
function samePath(node,src){try{return node&&node.src&&new URL(node.src,location.href).pathname===base(src)}catch(e){return false}}
function scriptPresent(src){return Array.prototype.some.call(document.scripts,function(node){return samePath(node,src)&&node.dataset.rtaState!=='failed'})}
function inject(m){
  if(scriptPresent(m.src)){document.dispatchEvent(new CustomEvent('rta:market:hydrate'));return}
  var n=attempts[m.id]||0;if(n>=2)return;
  attempts[m.id]=n+1;last[m.id]=Date.now();
  var s=document.createElement('script');s.async=false;s.src=m.src+(m.src.indexOf('?')>=0?'&':'?')+'recover='+Date.now()+'&try='+(n+1);s.dataset.rtaState='loading';
  s.addEventListener('load',function(){s.dataset.rtaState='loaded';document.dispatchEvent(new CustomEvent('rta:market:hydrate'))},{once:true});
  s.addEventListener('error',function(){s.dataset.rtaState='failed';s.remove()},{once:true});
  document.head.appendChild(s)
}
function stop(){
  if(stopped)return;stopped=true;
  timers.forEach(function(id){clearTimeout(id)});timers=[];
  document.removeEventListener('rta:market:hydrate',scan)
}
function scan(){
  if(stopped||scanning)return;
  var root=el('market2026Root');
  if(!root||!root.querySelector('.market-hero'))return;
  scanning=true;
  try{
    var missing=MODULES.filter(function(m){return !el(m.id)});
    if(!missing.length){stop();return}
    document.dispatchEvent(new CustomEvent('rta:market:hydrate'));
    missing.forEach(function(m){if(Date.now()-Number(last[m.id]||0)>=1600)inject(m)})
  }finally{scanning=false}
}
function boot(){
  [250,700,1400,2400,3800,5600,8000,11000].forEach(function(ms){timers.push(setTimeout(scan,ms))});
  document.addEventListener('rta:market:hydrate',scan);
  scan()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
