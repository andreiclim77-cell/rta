(function(){
'use strict';
var marketUiStarted=false;
var marketRecoveryTimer=0;
var marketRecoveryRunning=false;
function assetBase(src){return String(src||'').split('?')[0]}
function sameAsset(node,base){
  if(!node)return false;
  if(node.dataset&&node.dataset.rtaBase===base)return true;
  try{return node.src&&new URL(node.src,location.href).pathname===base}catch(e){return false}
}
function load(src,done){
  var base=assetBase(src),existing=Array.prototype.find.call(document.scripts,function(node){return sameAsset(node,base)&&node.dataset.rtaState!=='failed'});
  if(existing){
    if(existing.dataset.rtaState==='loading'){
      if(done){
        existing.addEventListener('load',function(){done(null,src)},{once:true});
        existing.addEventListener('error',function(){done(new Error('asset-load-failed'),src)},{once:true})
      }
    }else if(done)setTimeout(function(){done(null,src)},0);
    return existing
  }
  var script=document.createElement('script');
  script.src=src;script.async=false;script.dataset.rtaSrc=src;script.dataset.rtaBase=base;script.dataset.rtaState='loading';
  script.addEventListener('load',function(){script.dataset.rtaState='loaded';if(done)done(null,src)},{once:true});
  script.addEventListener('error',function(){script.dataset.rtaState='failed';if(done)done(new Error('asset-load-failed'),src);script.remove()},{once:true});
  document.head.appendChild(script);
  return script
}
function style(src){
  var base=assetBase(src),existing=Array.prototype.find.call(document.querySelectorAll('link[rel="stylesheet"]'),function(node){try{return node.dataset.rtaStyleBase===base||(node.href&&new URL(node.href,location.href).pathname===base)}catch(e){return false}});
  if(existing)return existing;
  var l=document.createElement('link');l.rel='stylesheet';l.href=src;l.dataset.rtaStyle=src;l.dataset.rtaStyleBase=base;document.head.appendChild(l);return l
}
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
function removeMarketLockUi(root){if(root)root.querySelectorAll('[data-market-lock]').forEach(function(button){button.remove()})}
function ensurePublicFallbackStyle(){
  var publicStyle=document.getElementById('marketPublicAccessStyle');
  if(publicStyle)return;
  publicStyle=document.createElement('style');
  publicStyle.id='marketPublicAccessStyle';
  publicStyle.textContent='[data-tab="market2026"].market-lock-nav::after{display:none!important}#market2026Root [data-market-lock]{display:none!important}#market2026Root[data-public-market="1"]:not([data-market-primary-view])>#market2026Body{display:block!important}#market2026Root[data-public-market="1"]:not([data-market-primary-view])>.market-hero>p{display:block!important}#market2026Root[data-public-market="1"]:not([data-market-primary-view])>.market-hero .market-metrics{display:grid!important}#market2026Root[data-public-market="1"]:not([data-market-primary-view])>.market-hero .market-tabs{display:flex!important}';
  document.head.appendChild(publicStyle)
}
function markPublicRoot(){var root=document.getElementById('market2026Root');if(root)root.dataset.publicMarket='1';return root}
function makeMarketPublic(){
  if(!isMainGuide())return;
  window.__rtaMarketPublicAccess=true;
  grantMarketAccess();
  ensurePublicFallbackStyle();
  var root=markPublicRoot();
  var button=document.querySelector('[data-tab="market2026"]');
  if(button&&button.dataset.publicAccess!=='1'){
    var publicButton=button.cloneNode(true);
    publicButton.classList.remove('market-lock-nav');
    publicButton.dataset.publicAccess='1';
    publicButton.addEventListener('click',function(event){
      event.preventDefault();event.stopPropagation();grantMarketAccess();
      var modal=document.getElementById('market2026Modal');if(modal)modal.remove();
      if(typeof setRoute==='function')setRoute('market2026');else location.hash='#market2026';
      setTimeout(function(){markPublicRoot();recoverMarketUi(0)},80)
    });
    button.replaceWith(publicButton)
  }
  removeMarketLockUi(root);
  var route=(location.hash||'').replace(/^#/,'');
  if(root&&route==='market2026'&&root.querySelector('[data-market-unlock]')){
    grantMarketAccess();
    setTimeout(function(){if(typeof setRoute==='function')setRoute('market2026');else location.hash='#market2026'},0)
  }
}
function stopMarketRecovery(){if(marketRecoveryTimer){clearTimeout(marketRecoveryTimer);marketRecoveryTimer=0}marketRecoveryRunning=false}
function recoverMarketUi(attempt){
  if(!isMainGuide()){stopMarketRecovery();return}
  if(attempt===0){
    if(marketRecoveryRunning){document.dispatchEvent(new CustomEvent('rta:market:hydrate'));return}
    marketRecoveryRunning=true
  }
  var root=markPublicRoot();
  if(!root||!root.querySelector('.market-hero')){
    if(attempt>=14){stopMarketRecovery();return}
    marketRecoveryTimer=setTimeout(function(){recoverMarketUi(attempt+1)},180);return
  }
  removeMarketLockUi(root);
  document.dispatchEvent(new CustomEvent('rta:market:hydrate'));
  if(document.getElementById('marketViewSwitcher')){stopMarketRecovery();return}
  if(attempt===6){
    load('/assets/market-ui-recovery.js?v=15&publicRecovery='+Date.now(),function(){document.dispatchEvent(new CustomEvent('rta:market:hydrate'))})
  }
  if(attempt>=14){stopMarketRecovery();return}
  marketRecoveryTimer=setTimeout(function(){recoverMarketUi(attempt+1)},240)
}
function waitForMarket(){
  if(marketUiStarted||!isMainGuide())return;
  var root=document.getElementById('market2026Root');
  if(!root||!root.querySelector('.market-hero')){setTimeout(waitForMarket,100);return}
  marketUiStarted=true;
  markPublicRoot();
  style('/assets/market-management-v4-extra.css?v=1');
  style('/assets/market-analysis-truth.css?v=1');
  style('/assets/market-hype-warnings.css?v=2');
  load('/assets/market-loading-guard.js?v=23');
  load('/assets/market-ui-recovery.js?v=15');
  load('/assets/market-management-v2.js?v=10',function(){load('/assets/market-analysis-synthesis.js?v=7')});
  load('/assets/market-hype-ui.js?v=14');
  load('/assets/market-view-switcher.js?v=11',function(){document.dispatchEvent(new CustomEvent('rta:market:hydrate'))});
  setTimeout(function(){document.dispatchEvent(new CustomEvent('rta:market:hydrate'));recoverMarketUi(0)},120)
}
function loadMarket(){if(!isMainGuide())return;stabilizeMarket();load('/assets/market-2026.js?v=10',function(){makeMarketPublic();waitForMarket()})}
ensureLegalFooter();
load('/assets/enhancements-core.js?v=8',function(){loadMarket()});
})();