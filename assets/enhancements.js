(function(){
'use strict';
var marketUiStarted=false;
function load(src,done){
  if(document.querySelector('script[data-rta-src="'+src.replace(/"/g,'\\"')+'"]')){if(done)done(null,src);return}
  var script=document.createElement('script');script.src=src;script.async=false;script.dataset.rtaSrc=src;
  script.addEventListener('load',function(){if(done)done(null,src)},{once:true});
  script.addEventListener('error',function(){if(done)done(new Error('asset-load-failed'),src)},{once:true});
  document.head.appendChild(script)
}
function isMainGuide(){return !/^\/rta-lab(?:\/|$)/i.test(location.pathname)}
function waitForMarket(){
  if(marketUiStarted||!isMainGuide())return;
  var root=document.getElementById('market2026Root');
  if(!root||!root.querySelector('.market-hero')){setTimeout(waitForMarket,100);return}
  marketUiStarted=true;
  load('/assets/market-loading-guard.js?v=11');
  load('/assets/market-ui-recovery.js?v=5');
  load('/assets/market-management-v2.js?v=4',function(){load('/assets/market-analysis-synthesis.js?v=1')});
  load('/assets/market-hype-ui.js?v=4');
  load('/assets/market-view-switcher.js?v=5');
  setTimeout(function(){document.dispatchEvent(new CustomEvent('rta:market:hydrate'))},120)
}
function loadMarket(){if(!isMainGuide())return;load('/assets/market-2026.js?v=4',function(){waitForMarket()})}
load('/assets/enhancements-core.js?v=8',function(){loadMarket()});
})();