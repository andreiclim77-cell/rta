/* RTA Lab Home Command Center navigation · 13 October 2026
 * Progressive enhancement: each home card has a native anchor fallback.
 * The mode switch and toolkit belong to the existing Sensory UI; do not fork its state.
 */
(() => {
  "use strict";
  // Existing bookmarks and installed Lab shortcuts open the current Atlas.
  // Explicit V10 links, legacy tool anchors and offline V10 remain available.
  if(window.location && /^https?:$/.test(window.location.protocol)){
    const params=new URLSearchParams(window.location.search),hash=window.location.hash.slice(1);
    if(params.get('view')!=='v10'&&(!hash||['home','rtaHome','liquid','atomizer','wire','market','duel'].includes(hash))&&navigator.onLine!==false){
      const destination=new URL('./atlas/',window.location.href);if(hash&&hash!=='rtaHome')destination.hash=hash;
      window.location.replace(destination.href);return;
    }
  }
  const TARGETS = Object.freeze({
    setup: {mode:"explorer",target:"labExplorerView"},
    liquid: {mode:"main",target:"labLiquidView"},
    mood: {target:"moodMatch"},
    reference: {target:"wireReference",expand:true},
    master: {target:"rtaContinuityPanel"}
  });

  function navigate(action) {
    const route=TARGETS[action];
    if(!route)return false;
    if(route.mode) {
      const ui=window.RTA_SENSORY_UI;
      if(ui && typeof ui.switchMode==="function") ui.switchMode(route.mode);
      else {
        // Fallback to legacy tab controls, while avoiding invalid hidden-target anchors.
        const tab=document.getElementById("mode-"+route.mode);
        if(tab && typeof tab.click==="function") tab.click();
      }
    }
    const target=document.getElementById(route.target);
    if(!target || target.hidden) return false;
    if(route.expand){
      const guide=target.querySelector(".wire-guide");
      if(guide)guide.open=true;
    }
    const reduce=typeof window.matchMedia==="function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(typeof target.scrollIntoView==="function")
      target.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});
    try {
      if(window.history && window.history.replaceState)
        window.history.replaceState(null,"","#"+route.target);
    }catch(error){ /* History restrictions must never break navigation. */ }
    return true;
  }

  document.addEventListener("click",event=>{
    const el=event.target&&typeof event.target.closest==="function"?
      event.target.closest("a[data-rt-action]"):null;
    if(!el)return;
    const action=el.getAttribute("data-rt-action");
    if(!TARGETS[action])return;
    if(navigate(action))event.preventDefault();
  });

  window.RTA_HOME_UI=Object.freeze({navigate,targets:TARGETS});
})();
