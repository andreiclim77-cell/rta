(function(){
  'use strict';
  function load(src,done){
    var script=document.createElement('script');
    script.src=src;
    script.async=false;
    if(done){
      script.addEventListener('load',function(){done(null,src)},{once:true});
      script.addEventListener('error',function(){done(new Error('asset-load-failed'),src)},{once:true});
    }
    document.head.appendChild(script);
  }
  function isMainGuide(){return !/^\/rta-lab(?:\/|$)/i.test(location.pathname)}
  function waitForMarketRoot(done){
    var tries=0;
    function tick(){
      var root=document.getElementById('market2026Root');
      if(root&&root.querySelector('.market-hero')){done();return}
      if(++tries>=120){done();return}
      setTimeout(tick,50);
    }
    tick();
  }
  function series(list,done){
    var i=0;
    function next(){
      if(i>=list.length){if(done)done();return}
      load(list[i++],function(){next()});
    }
    next();
  }
  function loadMarketModules(){
    if(!isMainGuide())return;
    load('/assets/market-2026.js?v=4',function(){
      waitForMarketRoot(function(){
        series([
          '/assets/market-management-v2.js?v=3',
          '/assets/market-executive-report-v2.js?v=1',
          '/assets/market-demand-ui.js?v=1',
          '/assets/market-hype-ui.js?v=2',
          '/assets/market-management-augment.js?v=1',
          '/assets/market-view-switcher.js?v=3',
          '/assets/market-2026-report.js?v=1',
          '/assets/market-coverage-ui.js?v=2',
          '/assets/market-sales-ui.js?v=3',
          '/assets/market-sales-retailer-ui.js?v=2',
          '/assets/market-sales-explorer.js?v=1'
        ],function(){
          load('/assets/market-ui-recovery.js?v=2',function(){
            setTimeout(function(){load('/assets/market-loading-guard.js?v=8')},250);
          });
        });
      });
    });
  }
  load('/assets/enhancements-core.js?v=8',function(){loadMarketModules()});
})();
