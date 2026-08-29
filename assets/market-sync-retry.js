(function(){
'use strict';
var attempts=0,timer=null,MAX=30;
function syncError(text){return /(Hype global 30 zile|After the first heart-beat|snapshot|sincronizat|synchronized|date nevalide|invalid data)/i.test(String(text||''))}
function scan(){
  var box=document.getElementById('marketLoadingGuard');
  if(!box)return;
  var err=box.querySelector('.market-loading-error');
  var retry=box.querySelector('[data-market-retry]');
  if(!err||!retry||!syncError(err.textContent)||attempts>=MAX)return;
  if(timer)return;
  attempts++;
  var title=box.querySelector('.market-loading-title');
  var stage=box.querySelector('.market-loading-stage');
  var spinner=box.querySelector('.market-loading-spinner');
  if(title)title.textContent=window.__rtaLang==='en'?'Synchronizing the complete report':'Sincronizez raportul complet';
  if(stage)stage.textContent=window.__rtaLang==='en'?'Refreshing the new snapshots':'Reverific snapshoturile noi';
  err.textContent=window.__rtaLang==='en'?'The new Market/Hype files are being published together. I retry automatically and keep the report hidden until every block is valid.':'Fișierele noi Market/Hype se publică împreună. Reverific automat și păstrez raportul ascuns până când toate blocurile sunt valide.';
  if(spinner)spinner.style.animationPlayState='running';
  retry.style.display='none';
  timer=setTimeout(function(){timer=null;retry.click()},1400);
}
function resetIfReady(){var root=document.getElementById('market2026Root');if(root&&root.dataset.marketGuardReady==='1'){attempts=0;if(timer){clearTimeout(timer);timer=null}}}
var observer=new MutationObserver(function(){scan();resetIfReady()});
observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
document.addEventListener('rta:market:ready',function(){attempts=0;if(timer){clearTimeout(timer);timer=null}});
scan();
})();
