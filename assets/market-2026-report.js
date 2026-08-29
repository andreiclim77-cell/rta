(function(){
  'use strict';

  var DATA_URL='/data/market-2026.json';
  var REPORT_ID='market2026FullReport';
  var STYLE_ID='market2026ReportStyles';
  var dataPromise=null;
  var renderTimer=null;

  function byId(id){return document.getElementById(id)}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]})}
  function en(){return window.__rtaLang==='en'}
  function t(ro,enText){return en()?enText:ro}
  function n(value){return Number(value||0).toLocaleString(en()?'en-GB':'ro-RO',{maximumFractionDigits:2})}
  function money(value){return value==null||!Number.isFinite(Number(value))?'—':Number(value).toLocaleString(en()?'en-GB':'ro-RO',{minimumFractionDigits:2,maximumFractionDigits:2})+' lei'}
  function pct(value){return Math.round(Number(value||0)*100)+'%'}
  function unique(values){return Array.from(new Set((values||[]).filter(Boolean)))}
  function median(values){var a=(values||[]).map(Number).filter(Number.isFinite).sort(function(x,y){return x-y});if(!a.length)return null;var m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2}
  function min(values){var a=(values||[]).map(Number).filter(Number.isFinite);return a.length?Math.min.apply(Math,a):null}
  function max(values){var a=(values||[]).map(Number).filter(Number.isFinite);return a.length?Math.max.apply(Math,a):null}
  function today(){try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Bucharest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(e){return ''}}
  function is2026(value){return /^2026-/.test(String(value||''))}
  function safeUrl(value){return /^https:\/\//i.test(String(value||''))?String(value):''}
  function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  function canonicalProduct(value){
    return norm(value)
      .replace(/\b(?:black|negru|neagra|matte black|full black|gunmetal|gri|grey|gray|silver|argintiu|argintie|stainless steel|stainless|ss|gold|auriu|aurie|blue|albastru|red|rosu|green|verde|white|alb|clear|transparent|rainbow|purple|mov|dlc|polished|brushed|matte)\b/g,' ')
      .replace(/\b(?:culoare|color)\b/g,' ')
      .replace(/\s+/g,' ').trim()
  }
  function displayCategory(cat){
    var labels={
      'RTA':'RTA','sarma':'Sârme','coil prebuilt':'Coiluri prebuilt','bumbac/wick':'Wicking / bumbac','mod':'Moduri','chipset/board':'Chipseturi / plăci','acumulator':'Acumulatori','incarcator':'Încărcătoare','unelte build':'Build & măsurare','componente RTA':'Componente RTA','accesoriu RTA/mod':'Accesorii RTA / mod','lichid tutunos/NET/DIY':'Tutun / NET / DIY','RDA/RDTA':'RDA / RDTA','RTA/RDA mixed':'RTA / RDA mixed','RBA/bridge':'RBA / bridge'
    };
    return labels[cat]||cat||'—'
  }
  function desiredCategories(){return ['RTA','sarma','coil prebuilt','bumbac/wick','mod','chipset/board','acumulator','incarcator','unelte build','componente RTA','accesoriu RTA/mod','lichid tutunos/NET/DIY']}

  function load(){
    if(dataPromise)return dataPromise;
    dataPromise=fetch(DATA_URL+'?live='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('market-data-'+r.status);return r.json()}).then(function(data){
      data.observations=(data.observations||[]).filter(function(row){return is2026(row.observedAt)});
      return data
    }).catch(function(error){dataPromise=null;throw error});
    return dataPromise
  }

  function injectStyles(){
    if(byId(STYLE_ID))return;
    var style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent='\
      .market-full-report{display:grid;gap:18px;margin-top:18px}\
      .market-report-head{padding:20px;border:1px solid var(--line);border-radius:18px;background:var(--panel);display:grid;gap:8px}\
      .market-report-head h2{margin:0;font-size:clamp(22px,4vw,34px)}\
      .market-report-head p{margin:0;color:var(--muted)}\
      .market-report-status{display:flex;gap:7px;flex-wrap:wrap}\
      .market-report-pill{border:1px solid var(--line);border-radius:999px;padding:5px 8px;font-size:11px;font-weight:800}\
      .market-report-pill.ok{border-color:rgba(85,209,122,.55)}\
      .market-report-pill.warn{border-color:rgba(217,93,0,.55)}\
      .market-report-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px}\
      .market-report-kpi{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:13px;min-width:0}\
      .market-report-kpi b{font-size:21px;display:block;line-height:1.1;overflow-wrap:anywhere}\
      .market-report-kpi span{font-size:11px;color:var(--muted);display:block;margin-top:5px}\
      .market-report-section{display:grid;gap:11px}\
      .market-report-section>h3{margin:0;font-size:21px}\
      .market-retailer-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}\
      .market-retailer-card{border:1px solid var(--line);border-radius:16px;background:var(--panel);padding:15px;display:grid;gap:11px;min-width:0}\
      .market-retailer-title{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}\
      .market-retailer-title h4{margin:0;font-size:18px}\
      .market-health{font-size:11px;font-weight:900;border:1px solid var(--line);border-radius:999px;padding:4px 7px;white-space:nowrap}\
      .market-health.ok{border-color:rgba(85,209,122,.55)}.market-health.warn{border-color:rgba(217,93,0,.55)}.market-health.bad{border-color:rgba(185,65,0,.65)}\
      .market-retailer-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}\
      .market-retailer-kpis div{border:1px solid var(--line);border-radius:10px;padding:8px;background:var(--panel2)}\
      .market-retailer-kpis b{display:block;font-size:16px}.market-retailer-kpis small{display:block;color:var(--muted);font-size:10px;margin-top:2px}\
      .market-mini-bars{display:grid;gap:6px}.market-mini-row{display:grid;grid-template-columns:minmax(110px,1fr) 54px 1.5fr;gap:7px;align-items:center;font-size:11px}.market-mini-track{height:6px;border:1px solid var(--line);border-radius:999px;overflow:hidden;background:var(--panel2)}.market-mini-track i{display:block;height:100%;background:currentColor}\
      .market-report-note{font-size:12px;color:var(--muted);line-height:1.45}\
      .market-report-links{display:flex;gap:7px;flex-wrap:wrap}.market-report-links a{font-size:11px;font-weight:800;text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:5px 8px}\
      .market-report-table-wrap{overflow:auto;border:1px solid var(--line);border-radius:16px;background:var(--panel)}\
      .market-report-table{width:100%;border-collapse:collapse;min-width:860px}.market-report-table th,.market-report-table td{padding:9px 10px;border-bottom:1px solid var(--line);font-size:12px;text-align:left;vertical-align:top}.market-report-table th{position:sticky;top:0;background:var(--panel2);font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}.market-report-table tr:last-child td{border-bottom:0}\
      .market-report-badge{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:3px 6px;font-size:10px;font-weight:800;margin:1px 3px 1px 0}\
      @media(max-width:1100px){.market-report-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}\
      @media(max-width:800px){.market-retailer-grid{grid-template-columns:1fr}.market-retailer-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}\
      @media(max-width:560px){.market-report-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.market-mini-row{grid-template-columns:minmax(90px,1fr) 42px 1fr}}\
    ';
    document.head.appendChild(style)
  }

  function statusMap(data){var out={};((data.collectorStatus&&data.collectorStatus.byRetailer)||[]).forEach(function(row){out[row.retailerId]=row});return out}
  function rowsFor(data,id){return (data.observations||[]).filter(function(row){return row.retailerId===id})}
  function topCounts(rows,key,limit){var map={};rows.forEach(function(row){var value=typeof key==='function'?key(row):row[key];if(!value)return;map[value]=(map[value]||0)+1});return Object.keys(map).map(function(name){return {name:name,count:map[name]}}).sort(function(a,b){return b.count-a.count||a.name.localeCompare(b.name)}).slice(0,limit||5)}

  function retailerSummary(data,retailer,statusById){
    var rows=rowsFor(data,retailer.id);
    var status=statusById[retailer.id]||{};
    var inStock=rows.filter(function(r){return r.stock==='in_stock'}).length;
    var outStock=rows.filter(function(r){return r.stock==='out_of_stock'}).length;
    var unknown=rows.length-inStock-outStock;
    var cats=unique(rows.map(function(r){return r.category}));
    var rta=rows.filter(function(r){return r.category==='RTA'});
    var prices=rows.map(function(r){return r.priceRon});
    var rtaPrices=rta.map(function(r){return r.priceRon});
    var latest=rows.map(function(r){return r.observedAt}).sort().pop()||'';
    var errors=Array.isArray(status.errors)?status.errors:[];
    var health=rows.length?(errors.length?'warn':'ok'):'bad';
    var healthLabel=rows.length?(errors.length?t('DATE PARȚIALE','PARTIAL DATA'):t('DATE LIVE','LIVE DATA')):t('FĂRĂ DATE','NO DATA');
    var topCats=topCounts(rows,'category',5);
    var topBrands=topCounts(rows,function(r){return r.brand||''},5);
    var maxCat=Math.max(1,topCats[0]&&topCats[0].count||0);
    var sourceLinks=unique(rows.map(function(r){return safeUrl(r.source)})).slice(0,3);
    var coverageTarget=Array.isArray(retailer.coverage)?retailer.coverage.length:0;
    return '<article class="market-retailer-card">'+
      '<div class="market-retailer-title"><div><h4>'+esc(retailer.name)+'</h4><div class="market-report-note">'+esc(retailer.url||'')+'</div></div><span class="market-health '+health+'">'+esc(healthLabel)+'</span></div>'+
      '<div class="market-retailer-kpis">'+
        '<div><b>'+n(rows.length)+'</b><small>'+esc(t('poziții','positions'))+'</small></div>'+
        '<div><b>'+n(rta.length)+'</b><small>RTA</small></div>'+
        '<div><b>'+n(cats.length)+(coverageTarget?' / '+n(coverageTarget):'')+'</b><small>'+esc(t('categorii observate','observed categories'))+'</small></div>'+
        '<div><b>'+n(status.pagesFetched||0)+'</b><small>'+esc(t('pagini/API','pages/API'))+'</small></div>'+
        '<div><b>'+n(inStock)+'</b><small>'+esc(t('în stoc','in stock'))+'</small></div>'+
        '<div><b>'+n(outStock)+'</b><small>'+esc(t('stoc epuizat','out of stock'))+'</small></div>'+
        '<div><b>'+n(unknown)+'</b><small>'+esc(t('stoc necunoscut','unknown stock'))+'</small></div>'+
        '<div><b>'+n(errors.length)+'</b><small>'+esc(t('erori colectare','collector errors'))+'</small></div>'+
      '</div>'+
      '<div class="market-report-note"><strong>'+esc(t('Prețuri observate','Observed prices'))+':</strong> '+esc(t('mediană','median'))+' '+esc(money(median(prices)))+' · min '+esc(money(min(prices)))+' · max '+esc(money(max(prices)))+(rta.length?' · RTA '+esc(t('mediană','median'))+' '+esc(money(median(rtaPrices))):'')+'</div>'+
      '<div class="market-report-note"><strong>'+esc(t('Ultima observație','Latest observation'))+':</strong> '+esc(latest||'—')+(errors.length?' · <strong>'+esc(t('Erori','Errors'))+':</strong> '+errors.map(function(e){return esc(e.error||e.url||'error')}).join('; '):'')+'</div>'+
      (topCats.length?'<div class="market-mini-bars">'+topCats.map(function(x){return '<div class="market-mini-row"><span>'+esc(displayCategory(x.name))+'</span><b>'+n(x.count)+'</b><span class="market-mini-track"><i style="width:'+Math.max(2,Math.round(x.count/maxCat*100))+'%"></i></span></div>'}).join('')+'</div>':'<div class="market-report-note">'+esc(t('Nu s-au obținut încă produse verificabile din acest magazin.','No verifiable products have been collected from this retailer yet.'))+'</div>')+
      (topBrands.length?'<div><span class="market-report-note">'+esc(t('Branduri dominante în observații','Top brands in observations'))+': </span>'+topBrands.map(function(x){return '<span class="market-report-badge">'+esc(x.name)+' · '+n(x.count)+'</span>'}).join('')+'</div>':'')+
      '<div class="market-report-links"><a target="_blank" rel="noreferrer" href="'+esc(safeUrl(retailer.url))+'">'+esc(t('Magazin','Store'))+'</a>'+sourceLinks.map(function(url,i){return '<a target="_blank" rel="noreferrer" href="'+esc(url)+'">'+esc(t('Sursă','Source'))+' '+(i+1)+'</a>'}).join('')+'</div>'+
    '</article>'
  }

  function categoryRows(data){
    var rows=data.observations||[];
    return desiredCategories().map(function(cat){
      var list=rows.filter(function(r){return r.category===cat});
      var prices=list.map(function(r){return r.priceRon});
      var retailers=unique(list.map(function(r){return r.retailerId}));
      var inStock=list.filter(function(r){return r.stock==='in_stock'}).length;
      var outStock=list.filter(function(r){return r.stock==='out_of_stock'}).length;
      return {cat:cat,total:list.length,retailers:retailers.length,inStock:inStock,outStock:outStock,unknown:list.length-inStock-outStock,median:median(prices),min:min(prices),max:max(prices)}
    })
  }

  function categoryTable(data){
    return '<div class="market-report-table-wrap"><table class="market-report-table"><thead><tr><th>'+esc(t('Categorie','Category'))+'</th><th>'+esc(t('Poziții','Positions'))+'</th><th>'+esc(t('Retaileri','Retailers'))+'</th><th>'+esc(t('În stoc','In stock'))+'</th><th>'+esc(t('Epuizat','Out'))+'</th><th>'+esc(t('Necunoscut','Unknown'))+'</th><th>'+esc(t('Preț median','Median price'))+'</th><th>Min</th><th>Max</th></tr></thead><tbody>'+categoryRows(data).map(function(x){return '<tr><td><strong>'+esc(displayCategory(x.cat))+'</strong></td><td>'+n(x.total)+'</td><td>'+n(x.retailers)+'</td><td>'+n(x.inStock)+'</td><td>'+n(x.outStock)+'</td><td>'+n(x.unknown)+'</td><td>'+esc(money(x.median))+'</td><td>'+esc(money(x.min))+'</td><td>'+esc(money(x.max))+'</td></tr>'}).join('')+'</tbody></table></div>'
  }

  function productFamilyRows(data){
    var map={};
    (data.observations||[]).forEach(function(row){
      if(desiredCategories().indexOf(row.category)<0)return;
      var key=row.category+'|'+canonicalProduct(row.product);
      if(!canonicalProduct(row.product))return;
      if(!map[key])map[key]={category:row.category,name:row.product,rows:[]};
      map[key].rows.push(row)
    });
    return Object.keys(map).map(function(key){
      var item=map[key], rows=item.rows;
      var retailers=unique(rows.map(function(r){return r.retailerId}));
      var prices=rows.map(function(r){return r.priceRon});
      var stockRetailers=unique(rows.filter(function(r){return r.stock==='in_stock'}).map(function(r){return r.retailerId}));
      return {category:item.category,name:item.name,offers:rows.length,retailers:retailers.length,inStockRetailers:stockRetailers.length,min:min(prices),median:median(prices),max:max(prices)}
    }).sort(function(a,b){return b.retailers-a.retailers||b.offers-a.offers||a.name.localeCompare(b.name)}).slice(0,80)
  }

  function productTable(data){
    var rows=productFamilyRows(data);
    return '<div class="market-report-table-wrap"><table class="market-report-table"><thead><tr><th>'+esc(t('Produs / familie exact-normalizată','Product / exact-normalized family'))+'</th><th>'+esc(t('Categorie','Category'))+'</th><th>'+esc(t('Oferte','Offers'))+'</th><th>'+esc(t('Retaileri','Retailers'))+'</th><th>'+esc(t('Retaileri cu stoc','Retailers in stock'))+'</th><th>Min</th><th>'+esc(t('Mediană','Median'))+'</th><th>Max</th></tr></thead><tbody>'+rows.map(function(x){return '<tr><td><strong>'+esc(x.name)+'</strong></td><td>'+esc(displayCategory(x.category))+'</td><td>'+n(x.offers)+'</td><td>'+n(x.retailers)+'</td><td>'+n(x.inStockRetailers)+'</td><td>'+esc(money(x.min))+'</td><td>'+esc(money(x.median))+'</td><td>'+esc(money(x.max))+'</td></tr>'}).join('')+'</tbody></table></div>'
  }

  function coverageTable(data,statusById){
    var retailers=data.retailers||[];
    return '<div class="market-report-table-wrap"><table class="market-report-table"><thead><tr><th>'+esc(t('Magazin','Store'))+'</th><th>'+esc(t('Stare colectare','Collection state'))+'</th><th>'+esc(t('Poziții','Positions'))+'</th><th>'+esc(t('Pagini/API','Pages/API'))+'</th><th>'+esc(t('Erori','Errors'))+'</th><th>'+esc(t('Ultima zi','Latest day'))+'</th><th>'+esc(t('Categorii cu date','Categories with data'))+'</th></tr></thead><tbody>'+retailers.map(function(r){var rows=rowsFor(data,r.id),s=statusById[r.id]||{},errors=Array.isArray(s.errors)?s.errors:[],latest=rows.map(function(x){return x.observedAt}).sort().pop()||'—',cats=unique(rows.map(function(x){return x.category}));var state=rows.length?(errors.length?t('parțial','partial'):t('ok','ok')):t('fără date','no data');return '<tr><td><a target="_blank" rel="noreferrer" href="'+esc(safeUrl(r.url))+'"><strong>'+esc(r.name)+'</strong></a></td><td>'+esc(state)+'</td><td>'+n(rows.length)+'</td><td>'+n(s.pagesFetched||0)+'</td><td>'+n(errors.length)+'</td><td>'+esc(latest)+'</td><td>'+esc(cats.map(displayCategory).join(', ')||'—')+'</td></tr>'}).join('')+'</tbody></table></div>'
  }

  function render(data){
    var root=byId('market2026Root');
    if(!root||!root.querySelector('.market-hero'))return;
    var existing=byId(REPORT_ID);if(existing)existing.remove();
    var obs=data.observations||[];
    var retailers=data.retailers||[];
    var statusById=statusMap(data);
    var withData=retailers.filter(function(r){return rowsFor(data,r.id).length>0}).length;
    var inStock=obs.filter(function(r){return r.stock==='in_stock'}).length;
    var outStock=obs.filter(function(r){return r.stock==='out_of_stock'}).length;
    var unknown=obs.length-inStock-outStock;
    var cats=unique(obs.map(function(r){return r.category}));
    var rta=obs.filter(function(r){return r.category==='RTA'});
    var errors=Number(data.collectorStatus&&data.collectorStatus.errors||0);
    var stamp=data.collectorStatus&&data.collectorStatus.date||'';
    var fresh=stamp&&stamp===today();

    var heroMetrics=root.querySelectorAll('.market-metric b');
    if(heroMetrics[0])heroMetrics[0].textContent=n(withData)+' / '+n(retailers.length);

    var report=document.createElement('section');
    report.id=REPORT_ID;
    report.className='market-full-report';
    report.innerHTML=''+
      '<div class="market-report-head"><div class="market-report-status"><span class="market-report-pill '+(fresh?'ok':'warn')+'">'+esc(fresh?t('● snapshot de azi','● today snapshot'):t('● snapshot neactualizat azi','● snapshot not from today'))+'</span><span class="market-report-pill">'+esc(t('surse publice verificabile','verifiable public sources'))+'</span><span class="market-report-pill">2026 ONLY</span></div><h2>'+esc(t('Raport complet · Piața RTA România','Full report · Romania RTA Market'))+'</h2><p>'+esc(t('Fiecare cifră de mai jos este calculată exclusiv din observațiile păstrate cu retailer, URL-sursă și dată. Lipsa accesului la un magazin este raportată ca lipsă/eroare, nu completată prin estimare.','Every figure below is calculated only from observations carrying retailer, source URL and date. If a store cannot be read, that is reported as missing/error rather than estimated.'))+'</p></div>'+
      '<div class="market-report-kpis">'+
        '<div class="market-report-kpi"><b>'+n(withData)+' / '+n(retailers.length)+'</b><span>'+esc(t('retaileri cu date / monitorizați','retailers with data / monitored'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+pct(retailers.length?withData/retailers.length:0)+'</b><span>'+esc(t('acoperire de colectare','collection coverage'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+n(obs.length)+'</b><span>'+esc(t('poziții verificate','verified positions'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+n(rta.length)+'</b><span>'+esc(t('oferte RTA','RTA offers'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+n(inStock)+'</b><span>'+esc(t('în stoc','in stock'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+n(outStock)+'</b><span>'+esc(t('stoc epuizat','out of stock'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+n(unknown)+'</b><span>'+esc(t('stoc necunoscut','unknown stock'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+n(cats.length)+'</b><span>'+esc(t('categorii detectate','detected categories'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+esc(money(median(obs.map(function(r){return r.priceRon}))))+'</b><span>'+esc(t('preț median total','overall median price'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+esc(money(median(rta.map(function(r){return r.priceRon}))))+'</b><span>'+esc(t('preț median RTA','RTA median price'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+n(data.collectorStatus&&data.collectorStatus.pagesFetched||0)+'</b><span>'+esc(t('pagini/API citite','pages/API read'))+'</span></div>'+
        '<div class="market-report-kpi"><b>'+n(errors)+'</b><span>'+esc(t('erori de colectare','collection errors'))+'</span></div>'+
      '</div>'+
      '<div class="market-report-section"><h3>'+esc(t('1. Acoperirea tuturor magazinelor din registru','1. Coverage of every store in the registry'))+'</h3><div class="market-report-note">'+esc(t('Un magazin rămâne vizibil chiar dacă blochează crawlerul. Astfel „toată piața” înseamnă registru complet + stare explicită de acoperire, nu dispariția magazinelor pentru care nu avem încă date.','A store stays visible even if it blocks the collector. This makes “whole market” mean a complete registry plus explicit coverage status, not silently dropping stores without data.'))+'</div>'+coverageTable(data,statusById)+'</div>'+
      '<div class="market-report-section"><h3>'+esc(t('2. Sinteză individuală pe fiecare magazin','2. Individual summary for every store'))+'</h3><div class="market-retailer-grid">'+retailers.map(function(r){return retailerSummary(data,r,statusById)}).join('')+'</div></div>'+
      '<div class="market-report-section"><h3>'+esc(t('3. Raport pe categoriile stabilite','3. Report on the agreed product categories'))+'</h3>'+categoryTable(data)+'</div>'+
      '<div class="market-report-section"><h3>'+esc(t('4. Produse/familii găsite în mai multe magazine','4. Products/families found across stores'))+'</h3><div class="market-report-note">'+esc(t('Gruparea elimină doar diferențe evidente de finisaj/culoare; nu inventează echivalențe între modele diferite. Tabelul este ordonat după numărul de retaileri la care aceeași familie apare.','Grouping removes only obvious finish/color differences; it does not invent equivalence between different models. The table is ordered by the number of retailers carrying the same family.'))+'</div>'+productTable(data)+'</div>';
    root.appendChild(report)
  }

  function schedule(){clearTimeout(renderTimer);renderTimer=setTimeout(function(){load().then(render).catch(function(){})},80)}
  function boot(){injectStyles();var observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});schedule()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()
})();
