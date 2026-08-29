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
      if(++tries>=160){done();return}
      setTimeout(tick,50);
    }
    tick();
  }
  function waitForId(id,done){
    var tries=0;
    function tick(){
      if(document.getElementById(id)){done(true);return}
      document.dispatchEvent(new CustomEvent('rta:market:hydrate'));
      if(++tries>=120){done(false);return}
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
  function hydrateSeries(list,done){
    var i=0;
    function next(){
      if(i>=list.length){if(done)done();return}
      var item=list[i++];
      load(item.src,function(){waitForId(item.id,function(){next()})});
    }
    next();
  }
  function loadMarketModules(){
    if(!isMainGuide())return;
    load('/assets/market-2026.js?v=4',function(){
      waitForMarketRoot(function(){
        hydrateSeries([
          {src:'/assets/market-management-v2.js?v=3',id:'marketManagementCockpit'},
          {src:'/assets/market-executive-report-v2.js?v=2',id:'marketExecutiveReport'},
          {src:'/assets/market-demand-ui.js?v=2',id:'marketDemandIntelligence'},
          {src:'/assets/market-hype-ui.js?v=3',id:'marketHypeRadar'},
          {src:'/assets/market-management-augment.js?v=2',id:'marketManagementAugment'},
          {src:'/assets/market-view-switcher.js?v=3',id:'marketViewSwitcher'}
        ],function(){
          series([
            '/assets/market-2026-report.js?v=1',
            '/assets/market-coverage-ui.js?v=2',
            '/assets/market-sales-ui.js?v=3',
            '/assets/market-sales-retailer-ui.js?v=2',
            '/assets/market-sales-explorer.js?v=1'
          ],function(){
            load('/assets/market-ui-recovery.js?v=3',function(){
              setTimeout(function(){load('/assets/market-loading-guard.js?v=9')},120);
            });
          });
        });
      });
    });
  }
  load('/assets/enhancements-core.js?v=8',function(){loadMarketModules()});
})();
