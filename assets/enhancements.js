(function(){
  'use strict';
  function load(src,done){
    var script=document.createElement('script');
    script.src=src;
    script.async=false;
    if(done)script.addEventListener('load',done,{once:true});
    document.head.appendChild(script)
  }
  function isMainGuide(){
    return !/^\/rta-lab(?:\/|$)/i.test(location.pathname)
  }
  load('/assets/enhancements-core.js?v=8',function(){
    if(!isMainGuide())return;
    load('/assets/market-2026.js?v=4',function(){
      load('/assets/market-2026-report.js?v=1',function(){
        load('/assets/market-coverage-ui.js?v=1')
      })
    })
  })
})();