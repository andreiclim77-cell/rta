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
function style(src){if(document.querySelector('link[data-rta-style="'+src.replace(/"/g,'\\"')+'"]'))return;var l=document.createElement('link');l.rel='stylesheet';l.href=src;l.dataset.rtaStyle=src;document.head.appendChild(l)}
function stabilizeMarket(){if(document.getElementById('marketBootStabilizer'))return;var s=document.createElement('style');s.id='marketBootStabilizer';s.textContent='#market2026Root:not(.market-load-guard-active):not([data-market-guard-ready="1"]){visibility:hidden;min-height:520px;overflow-anchor:none}';document.head.appendChild(s);setTimeout(function(){var root=document.getElementById('market2026Root'),x=document.getElementById('marketBootStabilizer');if(x&&root&&!root.classList.contains('market-load-guard-active')&&root.dataset.marketGuardReady!=='1')x.remove()},12000)}
function isMainGuide(){return !/^\/rta-lab(?:\/|$)/i.test(location.pathname)}
function waitForMarket(){
  if(marketUiStarted||!isMainGuide())return;
  var root=document.getElementById('market2026Root');
  if(!root||!root.querySelector('.market-hero')){setTimeout(waitForMarket,100);return}
  marketUiStarted=true;
  style('/assets/market-management-v4-extra.css?v=1');
  style('/assets/market-analysis-truth.css?v=1');
  style('/assets/market-hype-warnings.css?v=2');
  load('/assets/market-loading-guard.js?v=22');
  load('/assets/market-ui-recovery.js?v=15');
  load('/assets/market-management-v2.js?v=10',function(){load('/assets/market-analysis-synthesis.js?v=7')});
  load('/assets/market-hype-ui.js?v=14');
  load('/assets/market-view-switcher.js?v=11');
  setTimeout(function(){document.dispatchEvent(new CustomEvent('rta:market:hydrate'))},120)
}
function loadMarket(){if(!isMainGuide())return;stabilizeMarket();load('/assets/market-2026.js?v=7',function(){waitForMarket()})}
load('/assets/enhancements-core.js?v=8',function(){loadMarket()});
})();
