(function(){
'use strict';
var KEY='rtaMarket2026Access',PASS='market2026Password';
function clear(){try{sessionStorage.removeItem(KEY)}catch(_){}}
function neutralize(input){
  if(!input||input.dataset.rtaPasswordGuard==='1')return;
  input.dataset.rtaPasswordGuard='1';
  input.setAttribute('autocomplete','new-password');
  input.setAttribute('name','rta-market-access-'+Date.now()+'-'+Math.random().toString(36).slice(2));
  input.setAttribute('autocapitalize','off');
  input.setAttribute('spellcheck','false');
  input.value='';
  input.readOnly=true;
  var armed=false;
  function arm(){
    if(armed)return;
    armed=true;
    input.readOnly=false;
    input.value='';
    requestAnimationFrame(function(){input.value='';});
  }
  input.addEventListener('pointerdown',arm,{once:true,capture:true});
  input.addEventListener('focus',arm,{once:true,capture:true});
  [0,40,120,300,700].forEach(function(ms){setTimeout(function(){if(!armed&&document.activeElement!==input)input.value=''},ms)});
}
function scan(root){
  root=root||document;
  if(root.nodeType===1&&root.id===PASS)neutralize(root);
  if(root.querySelector){var input=root.querySelector('#'+PASS);if(input)neutralize(input)}
}
clear();
scan(document);
var observer=new MutationObserver(function(records){records.forEach(function(r){Array.prototype.forEach.call(r.addedNodes||[],scan)})});
observer.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',function(e){
  var target=e.target&&e.target.closest?e.target.closest('[data-tab="market2026"],[data-market-unlock]'):null;
  if(target){clear();setTimeout(function(){scan(document)},0);return}
  var other=e.target&&e.target.closest?e.target.closest('.navlinks [data-tab]'):null;
  if(other&&other.getAttribute('data-tab')!=='market2026')clear();
},true);
window.addEventListener('pageshow',function(){clear();scan(document)});
})();
