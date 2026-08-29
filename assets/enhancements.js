(function(){
  'use strict';
  function load(src,done){var script=document.createElement('script');script.src=src;script.async=false;if(done)script.addEventListener('load',done,{once:true});document.head.appendChild(script)}
  function isMainGuide(){return !/^\/rta-lab(?:\/|$)/i.test(location.pathname)}
  load('/assets/enhancements-core.js?v=8',function(){if(!isMainGuide())return;load('/assets/market-2026.js?v=4',function(){load('/assets/market-loading-guard.js?v=6',function(){load('/assets/market-2026-report.js?v=1',function(){load('/assets/market-coverage-ui.js?v=2',function(){load('/assets/market-sales-ui.js?v=3',function(){load('/assets/market-sales-retailer-ui.js?v=2',function(){load('/assets/market-sales-explorer.js?v=1',function(){load('/assets/market-management-v2.js?v=1',function(){load('/assets/market-executive-report-v2.js?v=1',function(){load('/assets/market-demand-ui.js?v=1',function(){load('/assets/market-hype-ui.js?v=2',function(){load('/assets/market-management-augment.js?v=1',function(){load('/assets/market-view-switcher.js?v=3')})})})})})})})})})})})})})
})();
