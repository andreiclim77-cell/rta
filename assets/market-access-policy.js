(function(){
'use strict';
var KEY='rtaMarket2026Access';
function clear(){try{sessionStorage.removeItem(KEY)}catch(_){}}
function sanitizePasswordInput(input){
  if(!input)return;
  input.setAttribute('autocomplete','new-password');
  input.setAttribute('autocapitalize','off');
  input.setAttribute('spellcheck','false');
  input.setAttribute('data-lpignore','true');
  input.setAttribute('data-1p-ignore','true');
  input.setAttribute('name','rta-market-password-'+Date.now());
  input.value='';
  input.addEventListener('focus',function(){
    if(input.dataset.rtaCleanedOnFocus==='1')return;
    input.dataset.rtaCleanedOnFocus='1';
    input.value='';
  },true);
}
function sanitizeModal(){
  var input=document.getElementById('market2026Password');
  if(!input)return;
  sanitizePasswordInput(input);
  requestAnimationFrame(function(){if(!input.dataset.rtaUserTyped)input.value=''});
  setTimeout(function(){if(!input.dataset.rtaUserTyped)input.value=''},60);
  input.addEventListener('keydown',function(){input.dataset.rtaUserTyped='1'},{once:true});
}
clear();
var observer=new MutationObserver(function(){sanitizeModal()});
observer.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',function(e){
  var target=e.target&&e.target.closest?e.target.closest('[data-tab="market2026"],[data-market-unlock]'):null;
  if(target){clear();setTimeout(sanitizeModal,0)}
  else{
    var other=e.target&&e.target.closest?e.target.closest('.navlinks [data-tab]'):null;
    if(other&&other.getAttribute('data-tab')!=='market2026')clear();
  }
},true);
window.addEventListener('pageshow',clear);
})();
