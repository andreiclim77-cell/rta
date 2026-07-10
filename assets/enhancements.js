(function(){
  'use strict';

  function en(){return window.__rtaLang==='en'}
  function word(ro,enText){return en()?enText:ro}
  function byId(id){return document.getElementById(id)}
  function html(value){return typeof esc==='function'?esc(String(value==null?'':value)):String(value==null?'':value)}
  function unique(list){return Array.from(new Set(list.filter(function(value){return value!==null&&value!==undefined&&value!==''})))}

  if(Array.isArray(window.MAIN_ROUTES)&&MAIN_ROUTES.indexOf('comparator')<0)MAIN_ROUTES.splice(MAIN_ROUTES.indexOf('profiles')>=0?MAIN_ROUTES.indexOf('profiles'):MAIN_ROUTES.length,0,'comparator');
  if(Array.isArray(window.APP_PREP_MODULES_RO)&&APP_PREP_MODULES_RO.indexOf('Comparator RTA')<0)APP_PREP_MODULES_RO.splice(5,0,'Comparator RTA');
  if(Array.isArray(window.APP_PREP_MODULES_EN)&&APP_PREP_MODULES_EN.indexOf('RTA comparator')<0)APP_PREP_MODULES_EN.splice(5,0,'RTA comparator');
  if(Array.isArray(window.SEARCH_MODES)&&!SEARCH_MODES.some(function(x){return x.id==='comparator'}))SEARCH_MODES.splice(2,0,{id:'comparator',label:'Comparator'});

  var coreRouteTitle=window.routeTitle;
  window.routeTitle=function(id,atom){
    if(id==='comparator')return word('Comparator RTA - Ghid RTA MTL - Smokee','RTA Comparator - MTL RTA Guide - Smokee');
    return coreRouteTitle(id,atom)
  };

  var coreEnsureSectionRendered=window.ensureSectionRendered;
  window.ensureSectionRendered=function(id){
    if(id==='comparator'){
      if(!renderedSections.comparator){initComparator();renderedSections.comparator=true}
      return
    }
    return coreEnsureSectionRendered(id)
  };

  var coreSearchBuckets=window.searchBuckets;
  window.searchBuckets=function(q){
    var buckets=coreSearchBuckets(q);
    var score=typeof fieldScore==='function'?fieldScore(q,[[word('comparator atomizoare rta airflow camera deck build lichid sarma','atomizer rta comparator airflow chamber deck build liquid wire'),34]]):0;
    buckets.comparator=score>0?[{tab:'comparator',route:'comparator',title:word('Comparator RTA MTL','MTL RTA comparator'),meta:word('Compara 2-4 atomizoare validate','Compare 2-4 validated atomizers'),query:q,score:score}]:[];
    return buckets
  };

  function directSource(source){
    var url=typeof sourceUrl==='function'?sourceUrl(source):'';
    return /^https?:\/\//i.test(url)&&!/google\.com\/search|youtube\.com\/results/i.test(url)
  }

  function directReview(atom){
    return getSources(atom).some(function(source){
      var url=sourceUrl(source);
      return /(?:youtube\.com\/watch|youtu\.be\/)/i.test(url)&&!/results\?search_query/i.test(url)
    })
  }

  function comparatorValidation(atom){
    var sources=getSources(atom).filter(directSource);
    var builds=Array.isArray(atom&&atom.builds)?atom.builds:[];
    var image=atom&&atom.image;
    var air=airflowInfo(atom);
    var chamber=chamberInfo(atom);
    var candidate=/candidate|candidat|surse insuficiente|de verificat|in verificare/i.test([
      atom&&atom.validationStatus,
      atom&&atom.confidence,
      atom&&atom.catalogStatus,
      atom&&atom.market
    ].filter(Boolean).join(' '));
    var evidence=[getDna(atom),first(atom,['market']),sources.map(function(source){return sourceClaim(source)}).join(' ')].join(' ');
    var points=10;
    if(/^https?:\/\//i.test(String(image||'')))points+=10;
    if(String(getDna(atom)||'').length>=45)points+=15;
    if(String(first(atom,['classes'])||'').length>=35)points+=10;
    if(builds.length>=1)points+=15;
    if(builds.length>=3)points+=5;
    if(sources.length>=1)points+=10;
    if(sources.length>=3)points+=10;
    if(directReview(atom))points+=5;
    if(/airflow|aer|pin|insert|side|bottom|lateral|inferior/i.test(evidence))points+=5;
    if(/camera|cupola|clopot|bell|chamber|deck/i.test(evidence))points+=5;
    points=Math.min(100,points);
    var status=candidate?'candidate':points>=75?'verified':points>=60?'partial':'limited';
    return {points:points,status:status,comparable:!candidate&&points>=60,sources:sources.length,air:air,chamber:chamber}
  }

  function comparisonText(value){
    var text=String(value||'');
    if(typeof publicAtomText==='function')text=publicAtomText(text);
    if(typeof cleanVisibleText==='function')text=cleanVisibleText(text);
    return text
      .replace(/\b\d+(?:[.,]\d+)?\s*ml\b/gi,'')
      .replace(/\b(?:matte|full|silk)\s+(?:black|blue|red|green|silver|gold)\b/gi,'')
      .replace(/\b(?:varianta|culoare|finish|finisaj)\s+(?:black|blue|red|green|silver|gold|polished)\b/gi,'')
      .replace(/\s+,/g,',')
      .replace(/,\s*,/g,', ')
      .replace(/\s{2,}/g,' ')
      .replace(/^[,;\s]+|[,;\s]+$/g,'')
  }

  function validationLabel(v){
    if(v.status==='verified')return word('documentare consistenta','consistent documentation');
    if(v.status==='partial')return word('documentare suficienta','sufficient documentation');
    if(v.status==='candidate')return word('in verificare','under review');
    return word('date limitate','limited data')
  }

  var compareSelected=[];

  function comparableAtoms(){
    return atomizers.map(function(atom,index){return {atom:atom,index:index,validation:comparatorValidation(atom)}})
      .filter(function(item){return item.validation.comparable})
      .sort(function(a,b){return publicAtomName(a.atom).localeCompare(publicAtomName(b.atom))})
  }

  function compareOptionRows(selected){
    var rows=['<option value="">'+html(word('Alege un model','Choose a model'))+'</option>'];
    comparableAtoms().forEach(function(item){
      rows.push('<option value="'+item.index+'"'+(String(item.index)===String(selected)?' selected':'')+'>'+html(publicAtomName(item.atom)+' - '+validationLabel(item.validation))+'</option>')
    });
    return rows.join('')
  }

  function renderCompareSelectors(){
    var box=byId('compareSelectGrid');
    if(!box)return;
    box.innerHTML=[0,1,2,3].map(function(slot){
      return '<label class="compare-slot">'+html(word('Model '+(slot+1)+(slot<2?' obligatoriu':' optional'),'Model '+(slot+1)+(slot<2?' required':' optional')))+'<select data-compare-slot="'+slot+'">'+compareOptionRows(compareSelected[slot])+'</select></label>'
    }).join('');
    box.querySelectorAll('[data-compare-slot]').forEach(function(select){
      select.addEventListener('change',function(){compareSelected[Number(select.dataset.compareSlot)]=select.value===''?'':Number(select.value)})
    })
  }

  function fillCompareContext(){
    var profile=byId('compareProfile');
    var intent=byId('compareIntent');
    if(profile&&profile.options.length===1){
      profiles.forEach(function(p,index){
        var option=document.createElement('option');
        option.value=String(index);
        option.textContent=profileDisplayName(p);
        profile.appendChild(option)
      })
    }
    if(intent&&!intent.options.length){
      PROBLEMS.forEach(function(problem){
        var option=document.createElement('option');
        option.value=problem.id;
        option.textContent=problem.label;
        intent.appendChild(option)
      });
      intent.value='balance'
    }
  }

  function compareModels(){
    return unique(compareSelected.map(function(index){return index===''?null:index})).map(function(index){return atomizers[index]}).filter(Boolean).slice(0,4)
  }

  function compareModelHeader(atom){
    var v=comparatorValidation(atom);
    var image=typeof atomImage==='function'?atomImage(atom):(usableImageUrl(first(atom,['image','imageUrl','thumbnail','photo']))||PRODUCT_FALLBACK_IMAGE);
    return '<img class="compare-thumb" src="'+html(image)+'" alt="'+html(publicAtomName(atom))+'" loading="lazy" onerror="this.onerror=null;this.src=\''+html(PRODUCT_FALLBACK_IMAGE)+'\'"><b>'+html(publicAtomName(atom))+'</b><small>'+html(validationLabel(v))+'</small>'
  }

  function contextualMatch(atom){
    var profileSelect=byId('compareProfile');
    if(!profileSelect||profileSelect.value==='')return word('Selecteaza un profil pentru potrivirea contextuala.','Select a profile for contextual matching.');
    var profile=profiles[Number(profileSelect.value)];
    var intent=(byId('compareIntent')&&byId('compareIntent').value)||'balance';
    var triad=tripodBuild(profile,intent,atom);
    return '<b>'+html(triad.label)+'</b><br>'+html(comparisonText(triad.reason))+(triad.alt?'<br><small>'+html(word('Alternativa: ','Alternative: ')+comparisonText(triad.alt))+'</small>':'')
  }

  function compareRows(models){
    var fields=[
      {label:word('Documentare','Documentation'),value:function(atom){var v=comparatorValidation(atom);return '<b>'+html(validationLabel(v))+'</b><br><small>'+v.sources+' '+html(word('surse directe','direct sources'))+'</small>'}},
      {label:'Airflow',value:function(atom){var v=comparatorValidation(atom),air=v.air||{};return '<b>'+html(comparisonText(air.label)||word('Date neconfirmate','Unconfirmed data'))+'</b><br><small>'+html(comparisonText(air.detail))+'</small>'}},
      {label:word('Camera de vaporizare','Vaporization chamber'),value:function(atom){var v=comparatorValidation(atom),ch=v.chamber||{};return '<b>'+html(comparisonText(ch.label)||word('Date neconfirmate','Unconfirmed data'))+'</b><br><small>'+html(comparisonText(ch.detail))+'</small>'}},
      {label:word('Deck si comportament','Deck and behavior'),value:function(atom){return html(comparisonText(getDna(atom))||word('Date neconfirmate','Unconfirmed data'))}},
      {label:word('Profiluri de lichid','Liquid profiles'),value:function(atom){return html(comparisonText(first(atom,['classes']))||word('Date neconfirmate','Unconfirmed data'))}},
      {label:word('Build de pornire','Starting build'),value:function(atom){return html(comparisonText(buildSummary(atom))||word('Date neconfirmate','Unconfirmed data'))}},
      {label:word('Trei sarme potrivite','Three suitable wires'),value:function(atom){return atomPageWireMatches(atom).map(function(w){return '<span class="compare-wire"><b>'+html(w.name)+'</b><br><small>'+html(w.setup+' - '+comparisonText(w.why))+'</small></span>'}).join('')}},
      {label:word('Potrivire in context','Contextual matching'),value:contextualMatch},
      {label:word('Detalii si surse','Details and sources'),value:function(atom){return '<a href="/#atomizor/'+html(atomSlug(atom))+'">'+html(word('Deschide profilul complet','Open full profile'))+'</a>'}}
    ];
    var header='<div class="compare-row"><div class="compare-cell criterion">'+html(word('Criteriu','Criterion'))+'</div>'+models.map(function(atom){return '<div class="compare-cell model">'+compareModelHeader(atom)+'</div>'}).join('')+'</div>';
    return '<div class="compare-table" style="--compare-columns:'+models.length+'">'+header+fields.map(function(field){return '<div class="compare-row"><div class="compare-cell criterion">'+html(field.label)+'</div>'+models.map(function(atom){return '<div class="compare-cell" data-model="'+html(publicAtomName(atom))+'">'+field.value(atom)+'</div>'}).join('')+'</div>'}).join('')+'</div>'
  }

  function runComparator(){
    var models=compareModels();
    var results=byId('compareResults');
    if(!results)return;
    if(models.length<2){results.innerHTML='<div class="empty">'+html(word('Selecteaza cel putin doua modele diferite.','Select at least two different models.'))+'</div>';return}
    results.innerHTML=compareRows(models);
    if(typeof window.rtaTrack==='function')window.rtaTrack('tool_complete',{tool:'comparator',result_count:models.length})
  }

  function resetComparator(){
    var rows=comparableAtoms();
    function find(name){var item=rows.find(function(row){return publicAtomName(row.atom)===name});return item?item.index:''}
    compareSelected=[find('Dvarw MTL FL'),find('Taifun GTR'),'',''];
    if(compareSelected[0]===''&&rows[0])compareSelected[0]=rows[0].index;
    if(compareSelected[1]===''&&rows[1])compareSelected[1]=rows[1].index;
    var profile=byId('compareProfile');
    if(profile)profile.value='';
    var intent=byId('compareIntent');
    if(intent)intent.value='balance';
    renderCompareSelectors();
    runComparator()
  }

  function initComparator(){
    fillCompareContext();
    var rows=comparableAtoms();
    var summary=byId('compareSummary');
    if(summary)summary.textContent=rows.length+' / '+atomizers.length+' '+word('modele disponibile pentru comparare','models available for comparison');
    if(!compareSelected.length)resetComparator();else{renderCompareSelectors();runComparator()}
    var run=byId('compareRun');
    var reset=byId('compareReset');
    if(run&&!run.dataset.ready){run.dataset.ready='1';run.addEventListener('click',runComparator)}
    if(reset&&!reset.dataset.ready){reset.dataset.ready='1';reset.addEventListener('click',resetComparator)}
    if(window.__rtaLang==='en'&&typeof applyLanguage==='function')applyLanguage(byId('comparator'))
  }
  window.initComparator=initComparator;
  window.comparatorValidation=comparatorValidation;

  function renderCatalogHealth(payload){
    var box=byId('catalogHealth');
    if(!box)return;
    var raw=payload&&payload.lastSuccessfulRun;
    var date=raw?new Date(raw):null;
    var valid=date&&!isNaN(date.getTime());
    var age=valid?Date.now()-date.getTime():Infinity;
    var stale=age>48*60*60*1000;
    box.classList.toggle('good',valid&&!stale);
    box.classList.toggle('stale',stale);
    var label=valid?date.toLocaleString(en()?'en-GB':'ro-RO',{timeZone:'Europe/Bucharest',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):word('ultima baza valida','last valid catalog');
    box.lastElementChild.textContent=stale?word('Catalog disponibil din ultima actualizare valida: ','Catalog available from the last valid update: ')+label:word('Catalog Smokee verificat: ','Smokee catalog verified: ')+label
  }

  function loadCatalogHealth(){
    fetch('/sync-status.json',{cache:'no-store'}).then(function(response){return response.ok?response.json():null}).then(renderCatalogHealth).catch(function(){renderCatalogHealth(null)})
  }

  function initMetrics(){
    var session={};
    var endpoint='https://ghid-rta-smokee-sync-backup.ghid-rta-smokee.workers.dev/__rta-event';
    function sendMetric(payload){
      if(!/^(?:www\.)?ghid-rta\.ro$/i.test(location.hostname))return;
      try{fetch(endpoint,{method:'POST',mode:'cors',credentials:'omit',keepalive:true,headers:{'content-type':'application/json'},body:JSON.stringify(payload)}).catch(function(){})}catch(e){}
    }
    window.rtaTrack=function(eventName,data){
      var allowed=/^(page_view|tool_open|tool_complete|search_submit|smokee_click|guide_open|client_error|web_vital)$/;
      if(!allowed.test(String(eventName||'')))return;
      session[eventName]=(session[eventName]||0)+1;
      window.__rtaMetrics=session;
      window.dataLayer=window.dataLayer||[];
      var payload=Object.assign({event:eventName,language:window.__rtaLang||'ro',route:(location.hash||'#home').slice(1)||'home'},data||{});
      window.dataLayer.push(payload);
      sendMetric(payload);
      document.dispatchEvent(new CustomEvent('rta:metric',{detail:{event:eventName,data:data||{}}}))
    };
    window.rtaTrack('page_view',{route:(location.hash||'#home').slice(1)||'home',device:innerWidth<700?'mobile':'desktop'});
    document.addEventListener('click',function(event){
      var jump=event.target.closest('[data-jump],[data-tab]');
      if(jump)window.rtaTrack('tool_open',{tool:jump.dataset.jump||jump.dataset.tab});
      var store=event.target.closest('a[href*="smokee.ro"]');
      if(store)window.rtaTrack('smokee_click',{placement:(store.closest('section')&&store.closest('section').id)||'page'})
    });
    window.addEventListener('error',function(event){window.rtaTrack('client_error',{code:'runtime',route:(location.hash||'#home').slice(1),message:String(event.message||'').slice(0,80)})});
    if('PerformanceObserver' in window){
      try{new PerformanceObserver(function(list){var entries=list.getEntries();var last=entries[entries.length-1];if(last)window.rtaTrack('web_vital',{metric:'LCP',value:Math.round(last.startTime)})}).observe({type:'largest-contentful-paint',buffered:true})}catch(e){}
      try{var cls=0;new PerformanceObserver(function(list){list.getEntries().forEach(function(entry){if(!entry.hadRecentInput)cls+=entry.value});window.__rtaCLS=cls}).observe({type:'layout-shift',buffered:true})}catch(e){}
    }
  }

  function showPwaUpdate(registration){
    if(byId('pwaUpdate'))return;
    var box=document.createElement('div');
    box.id='pwaUpdate';
    box.className='pwa-update';
    box.innerHTML='<p>'+html(word('Este disponibila o versiune noua a ghidului. Actualizarea se aplica dupa confirmare.','A new guide version is available. The update is applied after confirmation.'))+'</p><div class="source-actions"><button class="mini-link" type="button" data-pwa-apply>'+html(word('Actualizeaza','Update'))+'</button><button class="mini-link" type="button" data-pwa-later>'+html(word('Mai tarziu','Later'))+'</button></div>';
    document.body.appendChild(box);
    box.querySelector('[data-pwa-later]').onclick=function(){box.remove()};
    box.querySelector('[data-pwa-apply]').onclick=function(){if(registration.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});box.remove()}
  }

  function initPwa(){
    if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
    navigator.serviceWorker.register('/sw.js',{scope:'/'}).then(function(registration){
      if(registration.waiting&&navigator.serviceWorker.controller)showPwaUpdate(registration);
      registration.addEventListener('updatefound',function(){var worker=registration.installing;if(!worker)return;worker.addEventListener('statechange',function(){if(worker.state==='installed'&&navigator.serviceWorker.controller)showPwaUpdate(registration)})})
    }).catch(function(){})
  }

  initMetrics();
  loadCatalogHealth();
  initPwa();
})();
