(function(){
  'use strict';
  function load(src,done){
    var script=document.createElement('script');
    script.src=src;
    script.async=false;
    if(done)script.addEventListener('load',done,{once:true});
    document.head.appendChild(script)
  }
  load('/assets/enhancements-core.js?v=8',function(){
    load('/assets/market-2026.js?v=1')
  })
})();
