(function(){
  'use strict';
  var URL='/data/market-sales-2026.json';
  var ID='marketSalesIntelligence';
  var timer=null;
  function byId(id){return document.getElementById(id)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function en(){return window.__rtaLang==='en'}
  function t(ro,enText){return en()?enText:ro}
  function n(v){return Number(v||0).toLocaleString(en()?'en-GB':'ro-RO',{maximumFractionDigits:1})}
  function groupTop(rows){var m={};(rows||[]).forEach(function(r){var k=r.retailerId+'|'+r.category;if(!m[k]||Number(r.rank)<Number(m[k].rank))m[k]=r});return Object.keys(m).map(function(k){return m[k]}).sort(function(a,b){return String(a.retailerId).localeCompare(String(b.retailerId))||Number(a.rank)-Number(b.rank)}).slice(0,40)}
  function render(data){
    var root=byId('market2026Root');if(!root||!root.querySelector('.market-hero'))return;
    var old=byId(ID);if(old)old.remove();
    var c=data.coverage||{}, actual=data.actualSales||[], rankings=data.rankings||[], top=groupTop(rankings);
    var box=document.createElement('section');box.id=ID;box.className='market-report-section';
    var actualAvailable=c.nationalUnitsSoldAvailable===true;
    var actualTop=actual.slice().sort(function(a,b){return Number(b.unitsSold||0)-Number(a.unitsSold||0)}).slice(0,25);
    box.innerHTML='<h3>'+esc(t('VÂNZĂRI · evoluție · cote · bestsellers','SALES · evolution · shares · bestsellers'))+'</h3>'+
      '<div class="market-report-note"><strong>'+esc(t('Regulă de adevăr','Truth rule'))+':</strong> '+esc(t('Stocul, dispariția unui produs sau restock-ul NU sunt transformate în vânzări. Unitățile vândute apar numai dintr-un contor public explicit sau dintr-un feed direct al comerciantului.','Stock, disappearance or restock are NOT converted into sales. Units sold appear only from an explicit public counter or a direct merchant feed.'))+'</div>'+
      '<div class="market-report-kpis">'+
        '<div class="market-report-kpi"><b>'+n(c.storefrontsWithActualUnitSales)+' / '+n(c.storefrontsConfigured)+'</b><span>'+esc(t('magazine cu unități vândute reale','stores with real units sold'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+n(c.storefrontsWithRetailerSalesRanking)+' / '+n(c.storefrontsConfigured)+'</b><span>'+esc(t('magazine cu ranking bestseller public','stores with public bestseller ranking'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+esc(actualAvailable?t('DA','YES'):t('NU','NO'))+'</b><span>'+esc(t('total național unități vândute disponibil','national sold-unit total available'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+esc(c.nationalMarketShareAvailable?t('DA','YES'):t('NU','NO'))+'</b><span>'+esc(t('cote naționale de piață calculabile','national market shares calculable'))+'</span></div>'+
      '</div>'+
      (actualTop.length?'<h4>'+esc(t('Top produse după unități vândute explicit raportate','Top products by explicitly reported units sold'))+'</h4><div class="market-report-table-wrap"><table class="market-report-table"><thead><tr><th>'+esc(t('Magazin','Store'))+'</th><th>'+esc(t('Produs','Product'))+'</th><th>'+esc(t('Categorie','Category'))+'</th><th>'+esc(t('Unități vândute','Units sold'))+'</th><th>'+esc(t('Sursă','Source'))+'</th></tr></thead><tbody>'+actualTop.map(function(r){return '<tr><td>'+esc(r.retailerId)+'</td><td><strong>'+esc(r.product)+'</strong></td><td>'+esc(r.category)+'</td><td>'+n(r.unitsSold)+'</td><td><a target="_blank" rel="noreferrer" href="'+esc(r.source||r.productUrl||'#')+'">'+esc(t('verifică','verify'))+'</a></td></tr>'}).join('')+'</tbody></table></div>':'<div class="market-report-note"><strong>'+esc(t('Unități vândute la nivel național: indisponibile încă.','National units sold: not available yet.'))+'</strong> '+esc(t('Magazinele publice verificate până acum nu expun un contor comparabil de unități vândute. Nu afișăm o cifră inventată.','The public stores checked so far do not expose a comparable sold-units counter. We do not display an invented number.'))+'</div>')+
      (top.length?'<h4>'+esc(t('Bestsellers după ranking-ul public al magazinului','Bestsellers from each store’s public ranking'))+'</h4><div class="market-report-table-wrap"><table class="market-report-table"><thead><tr><th>'+esc(t('Magazin','Store'))+'</th><th>'+esc(t('Categorie','Category'))+'</th><th>'+esc(t('Loc','Rank'))+'</th><th>'+esc(t('Produs','Product'))+'</th><th>'+esc(t('Interpretare','Interpretation'))+'</th></tr></thead><tbody>'+top.map(function(r){return '<tr><td>'+esc(r.retailerId)+'</td><td>'+esc(r.category)+'</td><td>#'+n(r.rank)+'</td><td><strong>'+esc(r.product)+'</strong></td><td>'+esc(t('ranking de popularitate/vânzări al retailerului; nu reprezintă număr de bucăți','retailer popularity/sales ranking; not a unit count'))+'</td></tr>'}).join('')+'</tbody></table></div>':'<div class="market-report-note">'+esc(t('Nu avem încă ranking-uri bestseller publice validate. Collectorul le testează zilnic separat pentru fiecare storefront.','No validated public bestseller rankings yet. The collector tests them daily for each storefront.'))+'</div>');
    var report=byId('market2026FullReport');if(report&&report.parentNode)report.parentNode.insertBefore(box,report);else root.appendChild(box)
  }
  function load(){return fetch(URL+'?live='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('sales-'+r.status);return r.json()}).then(render).catch(function(){})}
  function schedule(){clearTimeout(timer);timer=setTimeout(load,120)}
  function boot(){new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()
})();
