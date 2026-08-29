(function(){
  'use strict';
  var COVERAGE_URL='/data/market-coverage-2026.json';
  var BOX_ID='marketNationalCertification';
  var timer=null;
  function byId(id){return document.getElementById(id)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function en(){return window.__rtaLang==='en'}
  function t(ro,enText){return en()?enText:ro}
  function n(v){return Number(v||0).toLocaleString(en()?'en-GB':'ro-RO')}
  function render(coverage){
    var root=byId('market2026Root');
    if(!root||!root.querySelector('.market-hero'))return;
    var old=byId(BOX_ID);if(old)old.remove();
    var claim=coverage&&coverage.nationalClaim||{};
    var c=coverage&&coverage.coverage||{};
    var allowed=claim.allowed===true;
    var problems=[];
    if(Array.isArray(c.zeroObservationStorefronts)&&c.zeroObservationStorefronts.length)problems.push(t('fără observații','no observations')+': '+c.zeroObservationStorefronts.join(', '));
    if(Array.isArray(c.sourceErrorStorefronts)&&c.sourceErrorStorefronts.length)problems.push(t('surse cu erori','sources with errors')+': '+c.sourceErrorStorefronts.join(', '));
    if(Array.isArray(c.fallbackStorefronts)&&c.fallbackStorefronts.length)problems.push(t('fallback folosit','fallback used')+': '+c.fallbackStorefronts.join(', '));
    if(Array.isArray(c.notAttemptedStorefronts)&&c.notAttemptedStorefronts.length)problems.push(t('surse neatinse azi','sources not reached today')+': '+c.notAttemptedStorefronts.join(', '));
    if(claim.discoveryCertified!==true)problems.unshift(t('universul național nu este încă certificat prin protocolul de descoperire','the national universe is not yet certified by the discovery protocol'));
    if(claim.allStorefrontsExhaustive!==true)problems.push(t('colectarea exhaustivă nu este încă certificată pentru fiecare storefront','exhaustive collection is not yet certified for every storefront'));

    var box=document.createElement('div');
    box.id=BOX_ID;
    box.style.cssText='border:2px solid '+(allowed?'rgba(85,209,122,.75)':'rgba(217,93,0,.65)')+';border-radius:16px;padding:16px;background:var(--panel);display:grid;gap:8px';
    box.innerHTML='<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><strong style="font-size:20px">'+esc(t('ROMÂNIA 100%','ROMANIA 100%'))+': '+esc(allowed?t('DA','YES'):t('NU','NO'))+'</strong><span class="market-report-pill '+(allowed?'ok':'warn')+'">'+esc(allowed?t('CERTIFICAT','CERTIFIED'):t('AUDIT ÎN CURS','AUDIT IN PROGRESS'))+'</span></div>'+
      '<div class="market-report-note">'+esc(t('Storefront-uri consumer în registrul curent','Consumer storefronts in current registry'))+': <strong>'+n(c.storefrontsConfigured)+'</strong> · '+esc(t('operatori economici unici','unique operators'))+': <strong>'+n(c.uniqueOperatorsConfigured)+'</strong> · '+esc(t('cu observații azi','with observations today'))+': <strong>'+n(c.storefrontsWithObservationsToday)+'</strong> · '+esc(t('poziții observate azi','positions observed today'))+': <strong>'+n(c.observationsToday)+'</strong></div>'+
      (!allowed?'<div class="market-report-note"><strong>'+esc(t('De ce NU este încă 100%','Why it is NOT 100% yet'))+':</strong> '+esc(problems.join(' · ')||claim.reason||'—')+'</div>':'')+
      '<div class="market-report-note">'+esc(t('Important: „storefront-uri cu date / storefront-uri în registru” este doar acoperirea observată a registrului curent. Nu este echivalentă cu certificarea întregii piețe din România.','Important: “storefronts with data / storefronts in registry” is only observed coverage of the current registry. It is not equivalent to certification of the entire Romanian market.'))+'</div>';
    var hero=root.querySelector('.market-hero');
    if(hero&&hero.nextSibling)root.insertBefore(box,hero.nextSibling);else if(hero)root.appendChild(box)

    var report=byId('market2026FullReport');
    if(report){
      var kpis=report.querySelectorAll('.market-report-kpi span');
      if(kpis[1])kpis[1].textContent=t('acoperire observată în registrul curent','observed coverage in current registry');
    }
  }
  function load(){return fetch(COVERAGE_URL+'?live='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('coverage-'+r.status);return r.json()}).then(render).catch(function(){})}
  function schedule(){clearTimeout(timer);timer=setTimeout(load,100)}
  function boot(){var observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});schedule()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()
})();
