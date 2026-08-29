(function(){
  'use strict';

  var ROUTE='market2026';
  var ACCESS_KEY='rtaMarket2026Access';
  var PASSWORD_SHA256='113180da7cf6dcdea360d1d14de73ebb5c245ae582224c906012b9bf9395e615';
  var marketData=null;
  var smokeeMods=null;
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
  function fmtMoney(value){return Number(value||0).toLocaleString(en()?'en-GB':'ro-RO',{minimumFractionDigits:2,maximumFractionDigits:2})+' lei'}
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
  function is2026(date){return /^2026(?:-|$)/.test(String(date||''))}
  function isDicodesFinishedDevice(item){
    var text=[item&&item.title,item&&item.product,item&&item.description].filter(Boolean).join(' ');
    if(!/dicodes/i.test(text))return false;
    return !/(?:bf60|fl80|board|placa|chipset|pcb)/i.test(text)
  }
  function safeSource(url){return /^https:\/\//i.test(String(url||''))?String(url):''}

  function injectStyles(){
    if(byId('market2026Styles'))return;
    var style=document.createElement('style');
    style.id='market2026Styles';
    style.textContent='\
      .market-lock-nav{position:relative}\
      .market-lock-nav::after{content:"";width:6px;height:6px;border-radius:999px;background:#ff7a1a;display:inline-block;margin-left:6px;vertical-align:middle;box-shadow:0 0 0 3px rgba(255,122,26,.12)}\
      .market-shell{display:grid;gap:18px}\
      .market-hero{padding:22px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(135deg,var(--panel),var(--panel2));display:grid;gap:10px}\
      .market-hero-top{display:flex;gap:10px;align-items:center;flex-wrap:wrap}\
      .market-kicker{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--soft)}\
      .market-year{padding:5px 9px;border-radius:999px;border:1px solid var(--line);font-size:12px;font-weight:800}\
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
      .market-coverage span{padding:4px 7px;border-radius:999px;background:var(--panel2);border:1px solid var(--line);font-size:11px}\
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
    return Array.from(new Uint8Array(hash)).map(function(b){return b.toString(16).padStart(2,'0')}).join('')
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
        '<div class="market-lock-icon">🔐</div>'+
        '<h2>'+escHtml(word('Acces PIAȚA RTA ROMÂNIA','ROMANIA RTA MARKET access'))+'</h2>'+
        '<p>'+escHtml(word('Introdu parola de acces pentru modulul privat 2026.','Enter the access password for the private 2026 module.'))+'</p>'+
        '<input id="market2026Password" type="password" autocomplete="current-password" aria-label="'+escHtml(word('Parolă','Password'))+'" />'+
        '<div class="market-error" id="market2026Error"></div>'+
        '<div class="market-modal-actions"><button type="button" class="mini-link" data-market-cancel>'+escHtml(word('Anulează','Cancel'))+'</button><button type="submit" class="mini-link">'+escHtml(word('Deblochează','Unlock'))+'</button></div>'+
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
          error.textContent=word('Browserul nu poate valida accesul securizat.','This browser cannot validate secure access.')
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
    button.className='navbtn market-lock-nav';
    button.type='button';
    button.dataset.tab=ROUTE;
    button.textContent=word('Piața RTA RO','RTA Market RO');
    var anchor=nav.querySelector('[data-tab="registry"]');
    if(anchor)anchor.insertAdjacentElement('beforebegin',button);else nav.appendChild(button);
    button.addEventListener('click',function(event){
      event.preventDefault();
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
      if(id===ROUTE)return word('Piața RTA România 2026 - Ghid RTA MTL','Romania RTA Market 2026 - MTL RTA Guide');
      return previousTitle(id,atom)
    };
    var previousEnsure=window.ensureSectionRendered;
    window.ensureSectionRendered=function(id){
      if(id===ROUTE){initMarket();return}
      return previousEnsure(id)
    }
  }

  function renderLocked(){
    var root=byId('market2026Root');
    if(!root)return;
    root.innerHTML='<div class="market-lock-card"><div class="market-lock-icon">🔒</div><span class="market-kicker">PRIVATE · 2026</span><h2>'+escHtml(word('PIAȚA RTA ROMÂNIA','ROMANIA RTA MARKET'))+'</h2><p>'+escHtml(word('Modulul de analiză este protejat. Datele sunt limitate strict la 2026.','The analysis module is protected. Data is strictly limited to 2026.'))+'</p><button class="mini-link" type="button" data-market-unlock>'+escHtml(word('Introdu parola','Enter password'))+'</button></div>';
    root.querySelector('[data-market-unlock]').addEventListener('click',function(){requestAccess().then(function(ok){if(ok)initMarket(true)})})
  }

  function loadData(){
    if(loadingPromise)return loadingPromise;
    loadingPromise=Promise.all([
      fetch('/data/market-2026.json',{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('market-data');return r.json()}),
      fetch('/data/smokee-mods.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).catch(function(){return null})
    ]).then(function(values){
      marketData=values[0];
      smokeeMods=values[1];
      if(Number(marketData.scopeYear)!==2026)throw new Error('invalid-market-year');
      marketData.observations=(marketData.observations||[]).filter(function(o){return is2026(o.observedAt)});
      return marketData
    }).finally(function(){loadingPromise=null});
    return loadingPromise
  }

  function smokeeFeedSummary(){
    var items=smokeeMods&&Array.isArray(smokeeMods.items)?smokeeMods.items:[];
    var filtered=items.filter(function(item){return !isDicodesFinishedDevice(item)});
    return {
      observedAt:String(smokeeMods&&smokeeMods.generated||'').slice(0,10),
      total:filtered.length,
      inStock:filtered.filter(function(item){return item.stock===true}).length,
      highEnd:filtered.filter(function(item){return item.highEnd===true}).length
    }
  }

  function observations(){return (marketData&&marketData.observations||[]).filter(function(o){return is2026(o.observedAt)})}
  function unique(values){return Array.from(new Set(values.filter(Boolean)))}
  function counts(){
    var obs=observations();
    var feed=smokeeFeedSummary();
    var retailerIds=unique(obs.map(function(o){return o.retailerId}));
    if(feed.total>0&&is2026(feed.observedAt))retailerIds.push('smokee');
    retailerIds=unique(retailerIds);
    return {
      retailers:(marketData.retailers||[]).length,
      retailersWithData:retailerIds.length,
      observations:obs.length+feed.total,
      inStock:obs.filter(function(o){return o.stock==='in_stock'}).length+feed.inStock,
      categories:unique(obs.map(function(o){return o.category}).concat(feed.total?['mod']:[])).length,
      rtaListed:(marketData.categorySnapshots||[]).filter(function(s){return s.category==='RTA'&&is2026(s.observedAt)}).reduce(function(sum,s){return sum+Number(s.listed||0)},0)
    }
  }

  function renderHero(){
    var c=counts();
    return '<div class="market-hero">'+
      '<div class="market-hero-top"><span class="market-kicker">PRIVATE MARKET INTELLIGENCE</span><span class="market-year">2026 ONLY</span></div>'+
      '<h1>'+escHtml(word('PIAȚA RTA ROMÂNIA','ROMANIA RTA MARKET'))+'</h1>'+
      '<p>'+escHtml(word('Observator de ofertă publică pentru ecosistemul rebuildable: RTA, sârme/coiluri, bumbac, moduri și chipseturi, acumulatori, unelte, componente, accesorii și lichide tutunoase/NET. Nu transformă stocul public în „vânzări”.','Public-offer observatory for the rebuildable ecosystem: RTAs, wires/coils, cotton, mods and chipsets, batteries, tools, parts, accessories and tobacco/NET liquids. Public stock is not treated as sales.'))+'</p>'+
      '<div class="market-metrics">'+
        metric(c.retailers,word('surse retail validate','validated retail sources'))+
        metric(c.observations,word('observații 2026 încărcate','2026 observations loaded'))+
        metric(c.inStock,word('poziții observate în stoc','observed in-stock positions'))+
        metric(c.rtaListed,word('RTA listate în snapshot-uri directe','RTAs listed in direct snapshots'))+
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

  function renderMarketTab(){
    var feed=smokeeFeedSummary();
    var retailers=marketData.retailers||[];
    return '<div class="market-grid">'+
      '<article class="market-card"><h3>'+escHtml(word('Regula de interpretare','Interpretation rule'))+'</h3><p>'+escHtml(marketData.methodology.description)+'</p><div class="market-note" style="margin-top:12px"><strong>2026:</strong> '+escHtml(marketData.methodology.historyPolicy)+'</div></article>'+
      '<article class="market-card"><h3>'+escHtml(word('Dicodes: tratament separat','Dicodes: separate treatment'))+'</h3><p>'+escHtml(marketData.methodology.dicodesPolicy)+'</p></article>'+
      '<article class="market-card"><h3>'+escHtml(word('Feed Smokee · moduri','Smokee feed · mods'))+'</h3><p><strong>'+escHtml(fmtNumber(feed.total))+'</strong> '+escHtml(word('moduri observate în feedul curent; ','mods observed in the current feed; '))+'<strong>'+escHtml(fmtNumber(feed.inStock))+'</strong> '+escHtml(word('în stoc. Dispozitivele finite Dicodes sunt filtrate din acest total.','in stock. Finished Dicodes devices are filtered from this total.'))+'</p><div class="market-note" style="margin-top:12px">'+escHtml(word('Snapshot feed: ','Feed snapshot: ')+String(feed.observedAt||'—'))+'</div></article>'+
      '<article class="market-card"><h3>'+escHtml(word('Acoperire retail','Retail coverage'))+'</h3><p>'+escHtml(word('Sursele sunt adăugate numai după validarea paginilor publice. „Monitored” nu înseamnă că toate categoriile au deja snapshot complet.','Sources are added only after validating public pages. “Monitored” does not mean every category already has a complete snapshot.'))+'</p></article>'+
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
      '<div class="market-toolbar"><div><strong>'+escHtml(word('Eșantion public 2026','Public 2026 sample'))+'</strong><div style="color:var(--muted);font-size:12px">'+escHtml(word('Fiecare rând păstrează sursa și data observației.','Every row keeps its source and observation date.'))+'</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><select id="marketCategoryFilter">'+categoryOptions()+'</select><button type="button" class="mini-link" data-market-csv>'+escHtml(word('Export CSV','Export CSV'))+'</button></div></div>'+
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

  function trendGroups(){
    var obs=observations();
    var dates=unique(obs.map(function(o){return o.observedAt})).sort();
    var categories=unique(obs.map(function(o){return o.category})).sort();
    return {obs:obs,dates:dates,categories:categories}
  }

  function renderTrendsTab(){
    var group=trendGroups();
    var enough=group.dates.length>=2;
    var body=group.categories.map(function(cat){
      var rows=group.obs.filter(function(o){return o.category===cat});
      var out=rows.filter(function(o){return o.stock==='out_of_stock'}).length;
      var ratio=rows.length?Math.round(out/rows.length*100):0;
      return '<article class="market-card"><h3>'+escHtml(cat)+'</h3><p>'+escHtml(fmtNumber(rows.length))+' '+escHtml(word('observații în eșantion · ','observations in sample · '))+escHtml(fmtNumber(ratio))+'% '+escHtml(word('marcate stoc epuizat.','marked out of stock.'))+'</p><div class="market-bar"><span style="width:'+Math.min(100,ratio)+'%"></span></div></article>'
    }).join('');
    return '<div class="market-note"><strong>'+escHtml(word('Trend longitudinal: ','Longitudinal trend: '))+'</strong>'+escHtml(enough?word('există cel puțin două date de captură și pot fi comparate.','at least two capture dates exist and can be compared.'):word('baseline-ul a început în 2026; nu inventăm trend dintr-o singură captură.','the baseline started in 2026; no trend is invented from a single capture.'))+'</div><div class="market-grid">'+body+'</div>'
  }

  function renderOpportunitiesTab(){
    var obs=observations();
    var cats=unique(obs.map(function(o){return o.category})).map(function(cat){
      var rows=obs.filter(function(o){return o.category===cat});
      var out=rows.filter(function(o){return o.stock==='out_of_stock'}).length;
      var inStock=rows.filter(function(o){return o.stock==='in_stock'}).length;
      return {cat:cat,total:rows.length,out:out,inStock:inStock,ratio:rows.length?out/rows.length:0}
    }).sort(function(a,b){return b.ratio-a.ratio||b.total-a.total});
    return '<div class="market-note"><strong>'+escHtml(word('Cum citim oportunitățile: ','How opportunities are read: '))+'</strong>'+escHtml(word('stocul epuizat repetat poate semnala o zonă de ofertă insuficientă, dar NU dovedește sell-through sau cerere fără date comerciale de la retailer.','repeated out-of-stock status can signal a supply gap, but it does NOT prove sell-through or demand without retailer sales data.'))+'</div><div class="market-grid">'+cats.map(function(x){
      var pct=Math.round(x.ratio*100);
      return '<article class="market-card"><h3>'+escHtml(x.cat)+'</h3><p><strong>'+escHtml(fmtNumber(pct))+'%</strong> '+escHtml(word('out-of-stock în eșantionul curent · ','out-of-stock in the current sample · '))+'n='+escHtml(fmtNumber(x.total))+'.</p><div class="market-bar"><span style="width:'+Math.min(100,pct)+'%"></span></div></article>'
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
    root.querySelectorAll('[data-market-tab]').forEach(function(button){
      button.addEventListener('click',function(){activeTab=button.dataset.marketTab;renderUnlocked()})
    });
    var filter=byId('marketCategoryFilter');
    if(filter){
      filter.addEventListener('change',function(){
        var target=byId('marketProductsTable');
        if(target)target.innerHTML=productsTable(observations(),retailerMap(),filter.value)
      })
    }
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
    var a=document.createElement('a');
    a.href=url;
    a.download='piata-rta-romania-2026.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){URL.revokeObjectURL(url)},500)
  }

  function renderUnlocked(){
    var root=byId('market2026Root');
    if(!root)return;
    root.innerHTML=renderHero()+'<div id="market2026Body">'+renderBody()+'</div><div class="market-toolbar"><span class="market-note">'+escHtml(word('Ultima actualizare dataset: ','Dataset last updated: ')+String(marketData.updatedAt||'—'))+'</span><button type="button" class="mini-link" data-market-lock>'+escHtml(word('Blochează modulul','Lock module'))+'</button></div>';
    bindUi();
    root.querySelector('[data-market-lock]').addEventListener('click',function(){clearAccess();renderLocked()})
  }

  function initMarket(force){
    createSection();
    if(!hasAccess()&&!force){renderLocked();return}
    var root=byId('market2026Root');
    if(!root)return;
    root.innerHTML='<div class="market-lock-card"><div class="market-lock-icon">⌛</div><h2>'+escHtml(word('Se încarcă observațiile 2026…','Loading 2026 observations…'))+'</h2></div>';
    loadData().then(renderUnlocked).catch(function(error){
      root.innerHTML='<div class="market-lock-card"><div class="market-lock-icon">⚠️</div><h2>'+escHtml(word('Date indisponibile','Data unavailable'))+'</h2><p>'+escHtml(word('Modulul nu a putut încărca datasetul 2026. Reîncearcă după refresh.','The module could not load the 2026 dataset. Retry after refresh.'))+'</p><small>'+escHtml(String(error&&error.message||error))+'</small></div>'
    })
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
