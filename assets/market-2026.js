(function(){
  'use strict';

  var ROUTE='market2026';
  var ACCESS_KEY='rtaMarket2026Access';
  var PASSWORD_SHA256='113180da7cf6dcdea360d1d14de73ebb5c245ae582224c906012b9bf9395e615';
  var marketData=null;
  var activeTab='market';
  var loadingPromise=null;

  function en(){return window.__rtaLang==='en'}
  function word(ro,enText){return en()?enText:ro}
  function byId(id){return document.getElementById(id)}
  function escHtml(value){
    return String(value==null?'':value)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;')
  }
  function fmtNumber(value){return Number(value||0).toLocaleString(en()?'en-GB':'ro-RO',{maximumFractionDigits:2})}
  function fmtMoney(value){
    if(value==null||value==='')return '—';
    return Number(value||0).toLocaleString(en()?'en-GB':'ro-RO',{minimumFractionDigits:2,maximumFractionDigits:2})+' lei'
  }
  function stockLabel(stock){
    if(stock==='in_stock')return word('în stoc','in stock');
    if(stock==='out_of_stock')return word('stoc epuizat','out of stock');
    if(stock==='variant')return word('variante / verifică stocul','variants / check stock');
    return word('necunoscut','unknown')
  }
  function retailerMap(){
    var out={};
    (marketData&&marketData.retailers||[]).forEach(function(r){out[r.id]=r});
    return out
  }
  function analysisStart(){return String(marketData&&marketData.analysisStart||'2026-01-01')}
  function inAnalysisWindow(date){var d=String(date||'');return /^\d{4}-\d{2}-\d{2}/.test(d)&&d.slice(0,10)>=analysisStart()}
  function safeSource(url){return /^https:\/\//i.test(String(url||''))?String(url):''}
  function unique(values){return Array.from(new Set(values.filter(Boolean)))}
  function bucharestToday(){
    try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Bucharest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(e){return ''}
  }
  function freshness(){
    var status=marketData&&marketData.collectorStatus||{};
    var today=bucharestToday();
    var date=String(status.date||'');
    return {date:date,today:today,fresh:Boolean(date&&today&&date===today),errors:Number(status.errors||0),pages:Number(status.pagesFetched||0)}
  }

  function injectStyles(){
    if(byId('market2026Styles'))return;
    var style=document.createElement('style');
    style.id='market2026Styles';
    style.textContent='\
      .market-lock-nav{position:relative}\
      .market-lock-nav::after{content:"";width:6px;height:6px;border-radius:999px;background:#ff7a1a;display:inline-block;margin-left:6px;vertical-align:middle;box-shadow:0 0 0 3px rgba(255,122,26,.12)}\
      .market-shell{display:grid;gap:18px}\
      .market-hero{padding:22px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(135deg,var(--panel),var(--panel2));display:grid;gap:10px}\
      .market-hero-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap}\
      .market-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--soft)}\
      .market-year,.market-fresh{padding:5px 9px;border-radius:999px;border:1px solid var(--line);font-size:12px;font-weight:800}\
      .market-fresh.ok{border-color:rgba(85,209,122,.5)}\
      .market-fresh.warn{border-color:rgba(217,93,0,.55)}\
      .market-hero h1{margin:0;font-size:clamp(28px,5vw,48px);line-height:1}\
      .market-hero p{margin:0;max-width:980px;color:var(--muted)}\
      .market-tabs{display:flex;gap:8px;flex-wrap:wrap}\
      .market-tab-btn{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:999px;padding:9px 13px;font-weight:800;cursor:pointer}\
      .market-tab-btn.active{border-color:var(--soft);box-shadow:0 0 0 2px rgba(217,93,0,.08)}\
      .market-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}\
      .market-metric{padding:16px;border:1px solid var(--line);border-radius:16px;background:var(--panel)}\
      .market-metric b{display:block;font-size:26px;line-height:1.1}\
      .market-metric span{display:block;color:var(--muted);font-size:12px;margin-top:6px}\
      .market-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}\
      .market-card{padding:17px;border:1px solid var(--line);border-radius:16px;background:var(--panel);min-width:0}\
      .market-card h3{margin:0 0 9px;font-size:18px}\
      .market-card p{margin:0;color:var(--muted)}\
      .market-note{padding:14px 16px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);font-size:13px;color:var(--muted)}\
      .market-note strong{color:var(--text)}\
      .market-table-wrap{overflow:auto;border:1px solid var(--line);border-radius:16px;background:var(--panel)}\
      .market-table{width:100%;border-collapse:collapse;min-width:760px}\
      .market-table th,.market-table td{padding:11px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top;font-size:13px}\
      .market-table th{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);background:var(--panel2);position:sticky;top:0}\
      .market-table tr:last-child td{border-bottom:0}\
      .market-stock{display:inline-flex;padding:3px 7px;border-radius:999px;border:1px solid var(--line);font-size:11px;font-weight:800}\
      .market-stock.in_stock{border-color:rgba(85,209,122,.45)}\
      .market-stock.out_of_stock{border-color:rgba(217,93,0,.45)}\
      .market-toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}\
      .market-toolbar select{min-width:200px}\
      .market-source-link{font-weight:800;text-decoration:none}\
      .market-coverage{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}\
      #market2026Root .market-coverage span{padding:4px 7px;border-radius:999px;background:#151a1f!important;color:#eef2f4!important;border:1px solid rgba(255,255,255,.16)!important;font-size:11px;text-shadow:none!important}\
      #market2026Root .market-coverage span.is-covered{background:#10281b!important;color:#a8f4c2!important;border-color:rgba(79,223,134,.42)!important}\
      #market2026Root .market-coverage span.is-missing{color:#aeb7bf!important}\
      .market-lock-card{max-width:560px;margin:44px auto;padding:26px;border-radius:20px;border:1px solid var(--line);background:var(--panel);text-align:center}\
      .market-lock-card h2{margin:8px 0 10px}\
      .market-lock-card p{color:var(--muted)}\
      .market-lock-icon{font-size:38px}\
      .market-modal{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.64);display:grid;place-items:center;padding:18px}\
      .market-modal-dialog{width:min(430px,100%);background:var(--panel);color:var(--text);border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 24px 80px rgba(0,0,0,.28)}\
      .market-modal-dialog h2{margin:0 0 8px}\
      .market-modal-dialog p{margin:0 0 14px;color:var(--muted)}\
      .market-modal-dialog input{width:100%;box-sizing:border-box;padding:12px 13px;border-radius:12px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit}\
      .market-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}\
      .market-error{min-height:20px;margin-top:8px;color:#b94100;font-size:12px;font-weight:800}\
      .market-bar{height:7px;border-radius:999px;background:var(--panel2);overflow:hidden;margin-top:8px;border:1px solid var(--line)}\
      .market-bar span{display:block;height:100%;background:currentColor}\
      .market-delta{font-size:12px;font-weight:800;margin-left:6px}\
      .market-delta.up{color:#318c50}.market-delta.down{color:#b94100}.market-delta.flat{color:var(--muted)}\
      @media(max-width:900px){.market-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.market-grid{grid-template-columns:1fr}}\
      @media(max-width:560px){.market-metrics{grid-template-columns:1fr}.market-hero{padding:17px}.market-card{padding:14px}}\
    ';
    document.head.appendChild(style)
  }

  function hasAccess(){
    try{return sessionStorage.getItem(ACCESS_KEY)==='1'}catch(e){return false}
  }
  function setAccess(){try{sessionStorage.setItem(ACCESS_KEY,'1')}catch(e){}}
  function clearAccess(){try{sessionStorage.removeItem(ACCESS_KEY)}catch(e){}}

  async function sha256(value){
    if(!window.crypto||!window.crypto.subtle)throw new Error('crypto-unavailable');
    var bytes=new TextEncoder().encode(String(value||''));
    var hash=await window.crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(hash)).map(function(byte){return byte.toString(16).padStart(2,'0')}).join('')
  }

  function requestAccess(){
    if(hasAccess())return Promise.resolve(true);
    return new Promise(function(resolve){
      var existing=byId('market2026Modal');
      if(existing)existing.remove();
      var overlay=document.createElement('div');
      overlay.id='market2026Modal';
      overlay.className='market-modal';
      overlay.innerHTML='<form class="market-modal-dialog" autocomplete="off">'+
        '<div class="market-lock-icon">&#128272;</div>'+
        '<h2>'+escHtml(word('Acces Piața RTA','RTA Market access'))+'</h2>'+
        '<p>'+escHtml(word('Introdu parola pentru a deschide Analiza și Hype.','Enter the password to open Analysis and Hype.'))+'</p>'+
        '<input id="market2026Password" type="password" autocomplete="new-password" aria-label="'+escHtml(word('Parolă','Password'))+'" value="" />'+
        '<div class="market-error" id="market2026Error"></div>'+
        '<div class="market-modal-actions"><button type="button" class="mini-link" data-market-cancel>'+escHtml(word('Anulează','Cancel'))+'</button><button type="submit" class="mini-link">'+escHtml(word('Deschide','Open'))+'</button></div>'+
      '</form>';
      document.body.appendChild(overlay);
      var input=byId('market2026Password');
      var form=overlay.querySelector('form');
      var done=false;
      function close(ok){
        if(done)return;
        done=true;
        overlay.remove();
        resolve(Boolean(ok))
      }
      overlay.querySelector('[data-market-cancel]').addEventListener('click',function(){close(false)});
      overlay.addEventListener('click',function(event){if(event.target===overlay)close(false)});
      form.addEventListener('submit',async function(event){
        event.preventDefault();
        var error=byId('market2026Error');
        try{
          var digest=await sha256(input.value);
          if(digest===PASSWORD_SHA256){
            setAccess();
            close(true)
          }else{
            error.textContent=word('Parolă incorectă.','Incorrect password.');
            input.select()
          }
        }catch(e){
          error.textContent=word('Parola nu a putut fi verificată în acest browser.','The password could not be checked in this browser.')
        }
      });
      setTimeout(function(){input.focus()},30)
    })
  }

  function createSection(){
    if(byId(ROUTE))return;
    var main=document.querySelector('main.wrap')||document.querySelector('main');
    if(!main)return;
    var section=document.createElement('section');
    section.id=ROUTE;
    section.className='section';
    section.innerHTML='<div id="market2026Root" class="market-shell"></div>';
    main.appendChild(section)
  }

  function createNavButton(){
    if(document.querySelector('[data-tab="'+ROUTE+'"]'))return;
    var nav=document.querySelector('.navlinks');
    if(!nav)return;
    var button=document.createElement('button');
    button.className='navbtn market-nav market-lock-nav';
    button.type='button';
    button.dataset.tab=ROUTE;
    button.textContent=word('Piața RTA RO','RTA Market RO');
    var anchor=nav.querySelector('[data-tab="registry"]');
    if(anchor)anchor.insertAdjacentElement('beforebegin',button);else nav.appendChild(button);
    button.addEventListener('click',function(event){
      event.preventDefault();
      event.stopPropagation();
      clearAccess();
      requestAccess().then(function(ok){
        if(!ok)return;
        if(typeof setRoute==='function')setRoute(ROUTE);else location.hash='#'+ROUTE
      })
    })
  }

  function registerRoute(){
    if(Array.isArray(window.MAIN_ROUTES)&&MAIN_ROUTES.indexOf(ROUTE)<0){
      var registryIndex=MAIN_ROUTES.indexOf('registry');
      MAIN_ROUTES.splice(registryIndex>=0?registryIndex:MAIN_ROUTES.length,0,ROUTE)
    }
    var previousTitle=window.routeTitle;
    window.routeTitle=function(id,atom){
      if(id===ROUTE)return word('Piața RTA România - Ghid RTA MTL','Romania RTA Market - MTL RTA Guide');
      return previousTitle(id,atom)
    };
    var previousEnsure=window.ensureSectionRendered;
    window.ensureSectionRendered=function(id){if(id===ROUTE){initMarket();return}return previousEnsure(id)}
  }

  function renderLocked(){
    var root=byId('market2026Root');
    if(!root)return;
    root.innerHTML='<div class="market-lock-card"><div class="market-lock-icon">&#128274;</div><span class="market-kicker">'+escHtml(word('ACCES PRIVAT','PRIVATE ACCESS'))+'</span><h2>'+escHtml(word('PIAȚA RTA ROMÂNIA','ROMANIA RTA MARKET'))+'</h2><p>'+escHtml(word('Introdu parola pentru a deschide Analiza și Hype.','Enter the password to open Analysis and Hype.'))+'</p><button class="mini-link" type="button" data-market-unlock>'+escHtml(word('Introdu parola','Enter password'))+'</button></div>';
    root.querySelector('[data-market-unlock]').addEventListener('click',function(){requestAccess().then(function(ok){if(ok)initMarket(true)})})
  }

  function loadData(){
    if(loadingPromise)return loadingPromise;
    loadingPromise=fetch('/data/market-2026.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('market-data');return r.json()}).then(function(value){
      marketData=value;
      if(Number(marketData.scopeYear)!==2026)throw new Error('invalid-market-year');
      marketData.observations=(marketData.observations||[]).filter(function(o){return inAnalysisWindow(o.observedAt)});
      marketData.trendSnapshots=(marketData.trendSnapshots||[]).filter(function(o){return inAnalysisWindow(o.date)});
      return marketData
    }).finally(function(){loadingPromise=null});
    return loadingPromise
  }

  function observations(){return (marketData&&marketData.observations||[]).filter(function(o){return inAnalysisWindow(o.observedAt)})}
  function counts(){
    var obs=observations();
    var retailerIds=unique(obs.map(function(o){return o.retailerId}));
    return {
      retailers:(marketData.retailers||[]).length,
      retailersWithData:retailerIds.length,
      observations:obs.length,
      inStock:obs.filter(function(o){return o.stock==='in_stock'}).length,
      categories:unique(obs.map(function(o){return o.category})).length,
      rtaOffers:obs.filter(function(o){return o.category==='RTA'}).length
    }
  }

  function renderHero(){
    var c=counts();
    var fresh=freshness();
    return '<div class="market-hero">'+
      '<div class="market-hero-top"><span class="market-kicker">PRIVATE MARKET INTELLIGENCE</span><span class="market-year">01.01.2026 → PREZENT</span><span class="market-fresh '+(fresh.fresh?'ok':'warn')+'">'+escHtml(fresh.fresh?word('● ACTUALIZAT AZI','● UPDATED TODAY'):word('● NECESITĂ ACTUALIZARE','● REFRESH NEEDED'))+'</span><span class="market-year">'+escHtml(word('zilnic · 06:00 RO','daily · 06:00 RO'))+'</span></div>'+
      '<h1>'+escHtml(word('PIAȚA RTA ROMÂNIA','ROMANIA RTA MARKET'))+'</h1>'+
      '<p>'+escHtml(word('Observator de ofertă publică pentru ecosistemul rebuildable: RTA, sârme/coiluri, bumbac, moduri și chipseturi, acumulatori, încărcătoare, unelte, componente, accesorii și lichide tutunoase/NET. Toate sursele configurate sunt verificate zilnic. Stocul public nu este tratat drept vânzare.','Public-offer observatory for the rebuildable ecosystem: RTAs, wires/coils, cotton, mods and chipsets, batteries, chargers, tools, parts, accessories and tobacco/NET liquids. Every configured source is checked daily. Public stock is not treated as sales.'))+'</p>'+
      '<div class="market-metrics">'+
        metric(c.retailersWithData+'/'+c.retailers,word('retaileri cu date / configurați','retailers with data / configured'))+
        metric(c.observations,word('poziții observate azi','positions observed today'))+
        metric(c.rtaOffers,word('oferte RTA observate','RTA offers observed'))+
        metric(c.categories,word('familii de produse detectate','product families detected'))+
      '</div>'+
      '<div class="market-tabs">'+
        tabButton('market',word('PIAȚĂ','MARKET'))+
        tabButton('products',word('CATEGORII / PRODUSE','CATEGORIES / PRODUCTS'))+
        tabButton('trends',word('TRENDURI','TRENDS'))+
        tabButton('opportunities',word('OPORTUNITĂȚI','OPPORTUNITIES'))+
      '</div>'+
    '</div>'
  }
  function metric(value,label){return '<div class="market-metric"><b>'+escHtml(fmtNumber(value))+'</b><span>'+escHtml(label)+'</span></div>'}
  function tabButton(id,label){return '<button type="button" class="market-tab-btn'+(activeTab===id?' active':'')+'" data-market-tab="'+id+'">'+escHtml(label)+'</button>'}

  function familyCoverageHtml(){
    var desired=['RTA','sarma','coil prebuilt','bumbac/wick','mod','chipset/board','acumulator','incarcator','unelte build','componente RTA','accesoriu RTA/mod','lichid tutunos/NET/DIY'];
    var cats=new Set(observations().map(function(o){return o.category}));
    return '<div class="market-coverage">'+desired.map(function(name){var covered=cats.has(name);return '<span class="'+(covered?'is-covered':'is-missing')+'">'+escHtml((covered?'✓ ':'○ ')+name)+'</span>'}).join('')+'</div>'
  }

  function renderMarketTab(){
    var retailers=marketData.retailers||[];
    var status=marketData.collectorStatus||{};
    var fresh=freshness();
    return '<div class="market-grid">'+
      '<article class="market-card"><h3>'+escHtml(word('Regula de interpretare','Interpretation rule'))+'</h3><p>'+escHtml(marketData.methodology.description)+'</p><div class="market-note" style="margin-top:12px"><strong>'+escHtml(word('Interval cerut:','Requested window:'))+'</strong> '+escHtml(marketData.methodology.historyPolicy)+'</div></article>'+
      '<article class="market-card"><h3>'+escHtml(word('Actualizare zilnică','Daily refresh'))+'</h3><p><strong>'+escHtml(fresh.date||'—')+'</strong> · '+escHtml(fmtNumber(status.pagesFetched||0))+' '+escHtml(word('pagini/API verificate · ','pages/API calls checked · '))+escHtml(fmtNumber(status.errors||0))+' '+escHtml(word('erori raportate.','reported errors.'))+'</p><div class="market-note" style="margin-top:12px">'+escHtml(word('Țintă operațională: o captură completă în fiecare zi, la 06:00 ora României; dashboardul semnalizează dacă snapshotul nu este din ziua curentă.','Operational target: one complete capture every day at 06:00 Romania time; the dashboard flags a snapshot that is not from the current day.'))+'</div></article>'+
      '<article class="market-card"><h3>'+escHtml(word('Familii monitorizate','Monitored families'))+'</h3><p>'+escHtml(word('Semnul ✓ arată că familia a produs cel puțin o observație în snapshotul curent.','✓ means the family produced at least one observation in the current snapshot.'))+'</p>'+familyCoverageHtml()+'</article>'+
      '<article class="market-card"><h3>'+escHtml(word('Dicodes: tratament separat','Dicodes: separate treatment'))+'</h3><p>'+escHtml(marketData.methodology.dicodesPolicy)+'</p></article>'+
      retailers.map(function(r){return '<article class="market-card"><h3>'+escHtml(r.name)+'</h3><p>'+escHtml(r.note||'')+'</p><div class="market-coverage">'+(r.coverage||[]).map(function(x){return '<span>'+escHtml(x)+'</span>'}).join('')+'</div><p style="margin-top:10px"><a class="market-source-link" target="_blank" rel="noreferrer" href="'+escHtml(safeSource(r.url))+'">'+escHtml(word('Sursa publică','Public source'))+'</a></p></article>'}).join('')+
    '</div>'
  }

  function categoryOptions(){
    var cats=unique(observations().map(function(o){return o.category})).sort();
    return '<option value="">'+escHtml(word('Toate categoriile','All categories'))+'</option>'+cats.map(function(c){return '<option value="'+escHtml(c)+'">'+escHtml(c)+'</option>'}).join('')
  }

  function renderProductsTab(){
    var map=retailerMap();
    var obs=observations();
    return '<div class="market-shell">'+
      '<div class="market-toolbar"><div><strong>'+escHtml(word('Snapshot public zilnic','Daily public snapshot'))+'</strong><div style="color:var(--muted);font-size:12px">'+escHtml(word('Fiecare rând păstrează retailerul, sursa și data observației.','Every row keeps the retailer, source and observation date.'))+'</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><select id="marketCategoryFilter">'+categoryOptions()+'</select><button type="button" class="mini-link" data-market-csv>'+escHtml(word('Export CSV','Export CSV'))+'</button></div></div>'+
      '<div id="marketProductsTable">'+productsTable(obs,map,'')+'</div>'+
    '</div>'
  }

  function productsTable(obs,map,filter){
    var rows=obs.filter(function(o){return !filter||o.category===filter});
    return '<div class="market-table-wrap"><table class="market-table"><thead><tr><th>'+escHtml(word('Retailer','Retailer'))+'</th><th>'+escHtml(word('Categorie','Category'))+'</th><th>'+escHtml(word('Produs','Product'))+'</th><th>'+escHtml(word('Preț','Price'))+'</th><th>'+escHtml(word('Stoc','Stock'))+'</th><th>'+escHtml(word('Data','Date'))+'</th><th>'+escHtml(word('Sursa','Source'))+'</th></tr></thead><tbody>'+rows.map(function(o){
      var r=map[o.retailerId]||{name:o.retailerId};
      return '<tr><td>'+escHtml(r.name)+'</td><td>'+escHtml(o.category)+'</td><td><strong>'+escHtml(o.product)+'</strong><br><small>'+escHtml(o.brand||'')+'</small></td><td>'+escHtml(fmtMoney(o.priceRon))+'</td><td><span class="market-stock '+escHtml(o.stock)+'">'+escHtml(stockLabel(o.stock))+'</span></td><td>'+escHtml(o.observedAt)+'</td><td><a class="market-source-link" target="_blank" rel="noreferrer" href="'+escHtml(safeSource(o.source))+'">↗</a></td></tr>'
    }).join('')+'</tbody></table></div>'
  }

  function categoryTrendRows(){
    var snapshots=(marketData&&marketData.trendSnapshots||[]).slice().sort(function(a,b){return String(a.date).localeCompare(String(b.date))});
    var latest=snapshots[snapshots.length-1]||null;
    var previous=snapshots[snapshots.length-2]||null;
    var names=unique(Object.keys(latest&&latest.categories||{}).concat(Object.keys(previous&&previous.categories||{}))).sort();
    return {snapshots:snapshots,latest:latest,previous:previous,names:names}
  }

  function deltaHtml(current,previous){
    var delta=Number(current||0)-Number(previous||0);
    var cls=delta>0?'up':delta<0?'down':'flat';
    return '<span class="market-delta '+cls+'">'+escHtml((delta>0?'▲ +':delta<0?'▼ ':'• ')+fmtNumber(delta))+'</span>'
  }

  function renderTrendsTab(){
    var group=categoryTrendRows();
    var enough=group.snapshots.length>=2;
    if(!group.latest)return '<div class="market-note">'+escHtml(word('Nu există încă snapshot longitudinal.','No longitudinal snapshot yet.'))+'</div>';
    var body=group.names.map(function(cat){
      var now=group.latest.categories&&group.latest.categories[cat]||{};
      var before=group.previous&&group.previous.categories&&group.previous.categories[cat]||{};
      var listed=Number(now.listed||0);
      var out=Number(now.outOfStock||0);
      var ratio=listed?Math.round(out/listed*100):0;
      return '<article class="market-card"><h3>'+escHtml(cat)+deltaHtml(listed,Number(before.listed||0))+'</h3><p><strong>'+escHtml(fmtNumber(listed))+'</strong> '+escHtml(word('poziții · ','positions · '))+escHtml(fmtNumber(now.retailers||0))+' '+escHtml(word('retaileri · ','retailers · '))+escHtml(fmtNumber(ratio))+'% '+escHtml(word('marcate stoc epuizat.','marked out of stock.'))+'</p><div class="market-bar"><span style="width:'+Math.min(100,ratio)+'%"></span></div></article>'
    }).join('');
    return '<div class="market-note"><strong>'+escHtml(word('Trend de la prima măsurare: ','Trend since first observation: '))+'</strong>'+escHtml(enough?word('comparăm automat ultima captură cu ziua precedentă disponibilă.','the latest capture is automatically compared with the previous available day.'):word('prima captură este baseline; diferențele apar după următoarea actualizare zilnică.','the first capture is the baseline; differences appear after the next daily refresh.'))+' '+escHtml(word('Ultima zi: ','Latest day: ')+group.latest.date)+'.</div><div class="market-grid">'+body+'</div>'
  }

  function renderOpportunitiesTab(){
    var obs=observations();
    var cats=unique(obs.map(function(o){return o.category})).map(function(cat){
      var rows=obs.filter(function(o){return o.category===cat});
      var out=rows.filter(function(o){return o.stock==='out_of_stock'}).length;
      return {cat:cat,total:rows.length,out:out,ratio:rows.length?out/rows.length:0,retailers:unique(rows.map(function(o){return o.retailerId})).length}
    }).sort(function(a,b){return b.ratio-a.ratio||b.total-a.total});
    return '<div class="market-note"><strong>'+escHtml(word('Cum citim oportunitățile: ','How opportunities are read: '))+'</strong>'+escHtml(word('stocul epuizat repetat poate semnala o zonă de ofertă insuficientă, dar NU dovedește sell-through sau cerere fără date comerciale de la retailer. După mai multe snapshoturi zilnice, motorul va putea separa episoadele izolate de lipsurile persistente.','repeated out-of-stock status can signal a supply gap, but it does NOT prove sell-through or demand without retailer sales data. After multiple daily snapshots, the engine can separate isolated events from persistent gaps.'))+'</div><div class="market-grid">'+cats.map(function(x){
      var pct=Math.round(x.ratio*100);
      return '<article class="market-card"><h3>'+escHtml(x.cat)+'</h3><p><strong>'+escHtml(fmtNumber(pct))+'%</strong> '+escHtml(word('out-of-stock în snapshotul curent · ','out-of-stock in the current snapshot · '))+'n='+escHtml(fmtNumber(x.total))+' · '+escHtml(fmtNumber(x.retailers))+' '+escHtml(word('retaileri','retailers'))+'.</p><div class="market-bar"><span style="width:'+Math.min(100,pct)+'%"></span></div></article>'
    }).join('')+'</div><div class="market-card"><h3>'+escHtml(word('Watchlist chipseturi / plăci','Chipset / board watchlist'))+'</h3><div class="market-grid">'+(marketData.boardWatch||[]).map(function(b){return '<div class="market-note"><strong>'+escHtml(b.maker+' '+b.product)+'</strong><br>'+escHtml(b.note||'')+'<br><a class="market-source-link" target="_blank" rel="noreferrer" href="'+escHtml(safeSource(b.source))+'">'+escHtml(word('Referință verificată','Verified reference'))+'</a></div>'}).join('')+'</div></div>'
  }

  function renderBody(){
    if(activeTab==='products')return renderProductsTab();
    if(activeTab==='trends')return renderTrendsTab();
    if(activeTab==='opportunities')return renderOpportunitiesTab();
    return renderMarketTab()
  }

  function bindUi(){
    var root=byId('market2026Root');
    if(!root)return;
    root.querySelectorAll('[data-market-tab]').forEach(function(button){button.addEventListener('click',function(){activeTab=button.dataset.marketTab;renderUnlocked()})});
    var filter=byId('marketCategoryFilter');
    if(filter){filter.addEventListener('change',function(){var target=byId('marketProductsTable');if(target)target.innerHTML=productsTable(observations(),retailerMap(),filter.value)})}
    var csv=root.querySelector('[data-market-csv]');
    if(csv)csv.addEventListener('click',exportCsv)
  }

  function exportCsv(){
    var rows=observations();
    var map=retailerMap();
    var header=['retailer','category','brand','product','price_RON','stock','observed_at','source'];
    function quote(value){var s=String(value==null?'':value);return '"'+s.replace(/"/g,'""')+'"'}
    var lines=[header.join(',')].concat(rows.map(function(o){return [map[o.retailerId]&&map[o.retailerId].name||o.retailerId,o.category,o.brand,o.product,o.priceRon,o.stock,o.observedAt,o.source].map(quote).join(',')}));
    var blob=new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');a.href=url;a.download='piata-rta-romania-observatii.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},500)
  }

  function renderUnlocked(){
    var root=byId('market2026Root');
    if(!root)return;
    root.innerHTML=renderHero()+'<div id="market2026Body">'+renderBody()+'</div><div class="market-toolbar"><button type="button" class="mini-link" data-market-lock>'+escHtml(word('Blochează','Lock'))+'</button></div>';
    bindUi();
    root.querySelector('[data-market-lock]').addEventListener('click',function(){clearAccess();renderLocked()})
  }

  function initMarket(force){
    createSection();
    if(!hasAccess()&&!force){renderLocked();return}
    var root=byId('market2026Root');
    if(!root)return;
    root.innerHTML='<div class="market-lock-card"><h2>'+escHtml(word('Se deschide Piața RTA…','Opening RTA Market…'))+'</h2></div>';
    loadData().then(renderUnlocked).catch(function(error){console.error(error);root.innerHTML='<div class="market-lock-card"><h2>'+escHtml(word('Piața RTA nu este disponibilă momentan','RTA Market is temporarily unavailable'))+'</h2><p>'+escHtml(word('Reîncearcă după reîmprospătarea paginii.','Refresh the page and try again.'))+'</p></div>'})
  }

  function boot(){
    injectStyles();
    createSection();
    createNavButton();
    registerRoute();
    if((location.hash||'').replace(/^#/,'')===ROUTE&&typeof applyRoute==='function')applyRoute(false)
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()
})();
