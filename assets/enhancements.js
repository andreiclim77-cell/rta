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
function ensureLegalFooter(){
  if(document.getElementById('rtaLegalFooter'))return;
  var s=document.createElement('style');
  s.id='rtaLegalFooterStyle';
  s.textContent='.rta-legal-footer{margin:28px auto 0;padding:18px 20px 24px;max-width:1180px;border-top:1px solid rgba(127,127,127,.28);display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;font:600 13px/1.35 system-ui,-apple-system,Segoe UI,sans-serif}.rta-legal-footer a{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:8px 13px;border:1px solid rgba(127,127,127,.42);border-radius:9px;text-decoration:none;color:inherit;background:rgba(127,127,127,.08)}.rta-legal-footer a:hover,.rta-legal-footer a:focus{border-color:#ef6c20;outline:none}.rta-legal-footer .rta-legal-note{width:100%;text-align:center;opacity:.72;font-weight:500}';
  document.head.appendChild(s);
  var footer=document.createElement('footer');
  footer.id='rtaLegalFooter';
  footer.className='rta-legal-footer';
  footer.setAttribute('aria-label','Informatii legale');
  footer.innerHTML='<a href="/termeni-si-conditii/">Termeni si conditii</a><a href="/politica-confidentialitate/">Politica de confidentialitate</a><span class="rta-legal-note">Ghid RTA MTL - Smokee · Operator: Clim Andrei · Contact: andrei.clim77@gmail.com</span>';
  document.body.appendChild(footer)
}
function stabilizeMarket(){if(document.getElementById('marketBootStabilizer'))return;var s=document.createElement('style');s.id='marketBootStabilizer';s.textContent='#market2026Root:not(.market-load-guard-active):not([data-market-guard-ready="1"]){visibility:hidden;min-height:520px;overflow-anchor:none}';document.head.appendChild(s);setTimeout(function(){var root=document.getElementById('market2026Root'),x=document.getElementById('marketBootStabilizer');if(x&&root&&!root.classList.contains('market-load-guard-active')&&root.dataset.marketGuardReady!=='1')x.remove()},12000)}
function isMainGuide(){return !/^\/rta-lab(?:\/|$)/i.test(location.pathname)}
function grantMarketAccess(){try{sessionStorage.setItem('rtaMarket2026Access','1')}catch(e){}}
function removeMarketLockUi(root){
  if(!root)return;
  root.querySelectorAll('[data-market-lock]').forEach(function(button){button.remove()})
}
function makeMarketPublic(){
  if(!isMainGuide())return;
  window.__rtaMarketPublicAccess=true;
  grantMarketAccess();
  var publicStyle=document.getElementById('marketPublicAccessStyle');
  if(!publicStyle){
    publicStyle=document.createElement('style');
    publicStyle.id='marketPublicAccessStyle';
    publicStyle.textContent='[data-tab="market2026"].market-lock-nav::after{display:none!important}#market2026Root [data-market-lock]{display:none!important}';
    document.head.appendChild(publicStyle)
  }
  var button=document.querySelector('[data-tab="market2026"]');
  if(button&&button.dataset.publicAccess!=='1'){
    var publicButton=button.cloneNode(true);
    publicButton.classList.remove('market-lock-nav');
    publicButton.dataset.publicAccess='1';
    publicButton.addEventListener('click',function(event){
      event.preventDefault();
      event.stopPropagation();
      grantMarketAccess();
      var modal=document.getElementById('market2026Modal');
      if(modal)modal.remove();
      if(typeof setRoute==='function')setRoute('market2026');else location.hash='#market2026'
    });
    button.replaceWith(publicButton)
  }
  var root=document.getElementById('market2026Root');
  removeMarketLockUi(root);
  if(root&&root.dataset.publicAccessWatch!=='1'&&window.MutationObserver){
    root.dataset.publicAccessWatch='1';
    new MutationObserver(function(){removeMarketLockUi(root)}).observe(root,{childList:true,subtree:true})
  }
  var route=(location.hash||'').replace(/^#/,'');
  if(root&&route==='market2026'&&root.querySelector('[data-market-unlock]')){
    grantMarketAccess();
    setTimeout(function(){if(typeof setRoute==='function')setRoute('market2026');else location.hash='#market2026'},0)
  }
}
function waitForMarket(){
  if(marketUiStarted||!isMainGuide())return;
  var root=document.getElementById('market2026Root');
  if(!root||!root.querySelector('.market-hero')){setTimeout(waitForMarket,100);return}
  marketUiStarted=true;
  style('/assets/market-management-v4-extra.css?v=1');
  style('/assets/market-analysis-truth.css?v=1');
  style('/assets/market-hype-warnings.css?v=2');
  load('/assets/market-loading-guard.js?v=23');
  load('/assets/market-ui-recovery.js?v=15');
  load('/assets/market-management-v2.js?v=10',function(){load('/assets/market-analysis-synthesis.js?v=7')});
  load('/assets/market-hype-ui.js?v=14');
  // Market assets are network-first in sw.js. Keep this URL synchronized with
  // STATIC_ASSETS and the existing quality contract; no test is disabled.
  load('/assets/market-view-switcher.js?v=11');
  setTimeout(function(){document.dispatchEvent(new CustomEvent('rta:market:hydrate'))},120)
}
function loadMarket(){if(!isMainGuide())return;stabilizeMarket();load('/assets/market-2026.js?v=10',function(){makeMarketPublic();waitForMarket()})}
ensureLegalFooter();
load('/assets/enhancements-core.js?v=8',function(){loadMarket()});
})();