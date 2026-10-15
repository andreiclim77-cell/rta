(function(){
'use strict';
if(typeof document==='undefined')return;
document.addEventListener('DOMContentLoaded',()=>{
 const incomplete=!window.RTA_ATLAS_PREVIEW||!window.RTA_ATLAS_MODULES||!window.RTA_ATLAS_DUEL||!window.RTA_ATLAS_MARKET||!window.RTA_ATLAS_SEARCH_UI||window.RTA_LIQUIDS?.length!==620;
 if(incomplete){
  if(window.RTA_ATLAS_PREVIEW)window.RTA_ATLAS_PREVIEW.state.incomplete=true;
  const error=document.createElement('section');error.className='atlas-unavailable frame';error.setAttribute('role','alert');error.innerHTML='<h1>Atlas nu s-a încărcat complet.</h1><p>Catalogul sau unul dintre module lipsește. Nu afișăm rezultate din date incomplete.</p><button type="button">Reîncearcă încărcarea</button>';error.querySelector('button').addEventListener('click',()=>location.reload());
  document.querySelectorAll('.page').forEach(p=>p.hidden=true);document.getElementById('main').prepend(error);document.querySelectorAll('[data-route]').forEach(b=>b.disabled=true);
 }
 document.body.classList.remove('atlas-loading');document.getElementById('main').removeAttribute('inert');document.getElementById('main').setAttribute('aria-busy','false');
 const edition=document.createElement('p');edition.className='atlas-edition';edition.textContent='Atlas · alegi lichidul, apoi configurația · 15.10.2026';document.querySelector('.footer').appendChild(edition);
 const status=document.createElement('p');status.id='atlasConnection';status.className='atlas-connection';status.setAttribute('role','status');document.querySelector('.footer').appendChild(status);
 const update=()=>{status.textContent=navigator.onLine?'':'Offline · catalogul și modelele rămân disponibile. Sursele externe cer conexiune.';};
 window.addEventListener('online',update);window.addEventListener('offline',update);update();
 if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
  // A newly activated, fully installed Atlas worker can repair a mixed cached load.
  // Retry at most once in this tab; genuine missing data must remain an explicit error.
  if(incomplete)navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!navigator.serviceWorker.controller?.scriptURL.includes(new URL('./sw.js',location.href).pathname))return;try{const key='atlas-guided-recovery-20261015';if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');location.reload();}catch(error){}});
  navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(registration=>registration.update()).catch(()=>{status.textContent='Modul offline nu s-a putut pregăti. Funcțiile online rămân disponibile.';});
 }
});
})();
