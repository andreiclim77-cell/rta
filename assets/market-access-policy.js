(function(){
'use strict';
var KEY='rtaMarket2026Access';
function clear(){try{sessionStorage.removeItem(KEY)}catch(_){}}
clear();
document.addEventListener('click',function(e){var target=e.target&&e.target.closest?e.target.closest('[data-tab="market2026"],[data-market-unlock]'):null;if(target)clear();else{var other=e.target&&e.target.closest?e.target.closest('.navlinks [data-tab]'):null;if(other&&other.getAttribute('data-tab')!=='market2026')clear()}},true);
window.addEventListener('pageshow',clear);
})();
