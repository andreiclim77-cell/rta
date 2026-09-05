#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const dependencyNodeModules='C:\\Users\\acasa\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
process.env.NODE_PATH=[process.env.NODE_PATH,dependencyNodeModules,path.join(dependencyNodeModules,'.pnpm','node_modules')].filter(Boolean).join(path.delimiter);
require('module').Module._initPaths();
const {chromium}=require('playwright');

const chromePath='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const baseUrl=process.env.RTA_BASE_URL||'http://127.0.0.1:8794';
const output=path.resolve('audit-market');
fs.mkdirSync(output,{recursive:true});
function expectedSnapshot(file){
  const doc=JSON.parse(fs.readFileSync(path.resolve(file),'utf8'));
  const products=doc.products||[];
  const events=products.filter(row=>row.confidenceTier==='confirmed'||row.confidenceTier==='reported');
  return{cards:products.length,events:events.length,signals:products.length-events.length};
}
const expectedRta=expectedSnapshot('data/market-hype-products-2026.json');
const expectedPod=expectedSnapshot('data/market-hype-pods-2026.json');
const direct=JSON.parse(fs.readFileSync(path.resolve('data/market-hype-direct-catalogs-2026.json'),'utf8'));
function sourceKind(item){
  const type=String(item&&item.sourceType||'');
  if(/^clone-/.test(type))return'clone';
  if(item&&item.official===true||/^manufacturer-official/.test(type))return'official';
  return'original';
}
function expectedAvailability(mode){
  const groups=mode==='pod'?['mass-market-open-pod','mid-tier-regional','closed-prefilled-hybrid','premium-high-end-aio']:['RTA','MODURI','ACCESORII'];
  const kinds=['official','original','clone'],seen=new Set(),counts=Object.fromEntries(kinds.map(kind=>[kind,Object.fromEntries(groups.map(group=>[group,0]))]));
  for(const item of direct.items||[]){
    if(item.available!==true&&item.availabilityStatus!=='listing-observed'||mode==='pod'&&item.category!=='POD'||mode!=='pod'&&item.category==='POD')continue;
    const kind=sourceKind(item),key=kind+'|'+(item.canonicalKey||[item.category,item.segment,String(item.productName||'').trim().toLowerCase()].join('|'));if(seen.has(key))continue;seen.add(key);
    const group=mode==='pod'?item.segment:item.category;if(group in counts[kind])counts[kind][group]++;
  }
  const kindTotals=Object.fromEntries(kinds.map(kind=>[kind,Object.values(counts[kind]).reduce((sum,value)=>sum+value,0)]));
  return{total:Object.values(kindTotals).reduce((sum,value)=>sum+value,0),shown:kinds.reduce((sum,kind)=>sum+Object.values(counts[kind]).reduce((inner,value)=>inner+Math.min(12,value),0),0),kindTotals};
}
const expectedRtaAvailability=expectedAvailability('rta'),expectedPodAvailability=expectedAvailability('pod');

async function openMarket(page,lang){
  const entry=lang==='en'?'/en/':'/';
  await page.goto(`${baseUrl}${entry}?hypeQa=${Date.now()}`,{waitUntil:'domcontentloaded'});
  const accept=page.locator('#ageAccept');
  if(await accept.isVisible().catch(()=>false))await accept.click();
  await page.waitForFunction(()=>!document.body.classList.contains('app-preparing'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('[data-tab="market2026"]')&&Array.isArray(window.MAIN_ROUTES)&&window.MAIN_ROUTES.includes('market2026'),{timeout:30000});
  await page.evaluate(()=>{sessionStorage.setItem('rtaMarket2026Access','1');if(typeof setRoute==='function')setRoute('market2026');else{location.hash='#market2026';if(typeof applyRoute==='function')applyRoute(false)}});
  await page.waitForSelector('#market2026.active #market2026Root .market-hero',{timeout:30000});
  await page.waitForFunction(()=>window.__rtaHypeReady===true&&document.querySelector('#marketHypeRadar'),{timeout:30000});
  await page.locator('[data-primary="hype"]').click();
  await page.waitForFunction(()=>{const node=document.querySelector('#marketHypeRadar');return node&&getComputedStyle(node).display!=='none'&&!node.classList.contains('market-view-hidden')},{timeout:30000});
}

async function snapshot(page,mode){
  return page.evaluate(currentMode=>{
    const root=document.querySelector('#marketHypeRadar');
    const cards=Array.from(root.querySelectorAll('.hype-mode-root .hype-product-card'));
    const eventCards=Array.from(root.querySelectorAll('.hype-window.before .hype-product-card:not(.signal),.hype-window.after:not(.signals) .hype-product-card:not(.signal)'));
    const signalCards=Array.from(root.querySelectorAll('.hype-window.signals .hype-product-card'));
    const eventNames=eventCards.map(card=>card.querySelector('strong')?.textContent.trim()||'');
    const signalNames=signalCards.map(card=>card.querySelector('strong')?.textContent.trim()||'');
    const tabs=Array.from(root.querySelectorAll('[data-hype-view]'));
    const clipped=tabs.some(tab=>{const rect=tab.getBoundingClientRect();return rect.left<0||rect.right>document.documentElement.clientWidth+1});
    const vertical=cards.some(card=>getComputedStyle(card.querySelector('summary strong')).writingMode!=='horizontal-tb');
    return{
      mode:currentMode,
      cards:cards.length,
      events:eventCards.length,
      signals:signalCards.length,
      eventNames,
      signalNames,
      tabs:tabs.length,
      active:root.querySelector('[data-hype-view].active')?.getAttribute('data-hype-view'),
      state:root.querySelector('.hype-state b')?.textContent.trim(),
      progress:Boolean(root.querySelector('.hype-state .hype-progress')),
      sourceHealth:Boolean(root.querySelector('.hype-source-health')),
      guideItems:root.querySelectorAll('.hype-reading-guide>div').length,
      guideText:root.querySelector('.hype-reading-guide')?.textContent.trim()||'',
      layerTabs:root.querySelectorAll('[data-hype-layer]').length,
      activeLayer:root.querySelector('[data-hype-layer].active')?.getAttribute('data-hype-layer'),
      visiblePanel:root.querySelector('.hype-layer-panel:not([hidden])')?.getAttribute('data-hype-panel'),
      emptyCategoryAccordions:Array.from(root.querySelectorAll('[data-hype-panel="launches"] .hype-category-button')).filter(node=>Number((node.querySelector('summary b')?.textContent||'0').replace(/\D/g,''))===0).length,
      availabilityRows:root.querySelectorAll('.hype-catalog-row').length,
      availabilityTotal:Number((root.querySelector('.hype-window.availability .hype-window-count b')?.textContent||'0').replace(/\D/g,'')),
      provenanceTotals:Object.fromEntries(['official','original','clone'].map(kind=>[kind,Number((root.querySelector('.hype-provenance-summary .'+kind+' b')?.textContent||'0').replace(/\D/g,''))])),
      signalTitle:root.querySelector('.hype-window.signals h3')?.textContent.trim(),
      docOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      clipped,
      vertical,
      lang:document.documentElement.lang||'',
      title:root.querySelector('.hype-master-head h2')?.textContent.trim()
    };
  },mode);
}

function requireState(result,expected){
  if(result.cards!==expected.cards||result.events!==expected.events||result.signals!==expected.signals)throw new Error(`${expected.label}: expected ${expected.cards}/${expected.events}/${expected.signals}, got ${result.cards}/${result.events}/${result.signals}`);
  if(result.tabs!==2||result.active!==expected.mode)throw new Error(`${expected.label}: mode switch is incomplete`);
  if(!result.progress||!result.sourceHealth)throw new Error(`${expected.label}: live progress or source coverage is missing`);
  if(result.guideItems!==4||!/URMEAZĂ|COMING/.test(result.guideText)||!/INDICIU|SIGNAL/.test(result.guideText)||!/CATALOG/.test(result.guideText))throw new Error(`${expected.label}: plain-language reading guide is incomplete`);
  if(result.layerTabs!==3||result.activeLayer!==expected.layer||result.visiblePanel!==expected.layer)throw new Error(`${expected.label}: evidence layer switch is incomplete`);
  if(result.emptyCategoryAccordions!==0)throw new Error(`${expected.label}: empty zero-count categories still clutter the launch windows`);
  if(result.availabilityRows!==expected.availability.shown||result.availabilityTotal!==expected.availability.total)throw new Error(`${expected.label}: availability expected ${expected.availability.shown}/${expected.availability.total}, got ${result.availabilityRows}/${result.availabilityTotal}`);
  for(const kind of ['official','original','clone'])if(result.provenanceTotals[kind]!==expected.availability.kindTotals[kind])throw new Error(`${expected.label}: ${kind} provenance expected ${expected.availability.kindTotals[kind]}, got ${result.provenanceTotals[kind]}`);
  if(/Semnale monitorizate|Monitored signals/.test(result.signalTitle||''))throw new Error(`${expected.label}: ambiguous monitored-signal title remains`);
  if(!/Hype:/.test(result.title||''))throw new Error(`${expected.label}: explicit Hype title is missing`);
  if(result.docOverflow>3||result.clipped||result.vertical)throw new Error(`${expected.label}: layout overflow or vertical text detected`);
  if(result.eventNames.some(name=>/Prime Minister|AF5000|Sonder Q3|Paramour V2|Nitrous Pocket|Pinnacle Colossus/i.test(name)))throw new Error(`${expected.label}: known old model leaked into dated events`);
}

async function runViewport(browser,viewport,lang){
  const page=await browser.newPage({viewport});
  const errors=[];
  page.on('pageerror',error=>{const detail=error.stack||error.message;if(!errors.includes(detail))errors.push(detail)});
  await openMarket(page,lang);
  const rta=await snapshot(page,'rta');
  requireState(rta,{label:`${lang}-${viewport.width}-rta`,mode:'rta',layer:'launches',availability:expectedRtaAvailability,...expectedRta});
  await page.locator('[data-hype-layer="signals"]').click();
  const rtaSignals=await snapshot(page,'rta');
  requireState(rtaSignals,{label:`${lang}-${viewport.width}-rta-signals`,mode:'rta',layer:'signals',availability:expectedRtaAvailability,...expectedRta});
  await page.locator('[data-hype-layer="catalog"]').click();
  const rtaCatalog=await snapshot(page,'rta');
  requireState(rtaCatalog,{label:`${lang}-${viewport.width}-rta-catalog`,mode:'rta',layer:'catalog',availability:expectedRtaAvailability,...expectedRta});
  await page.screenshot({path:path.join(output,`hype-${lang}-${viewport.width}-rta-catalog.png`),fullPage:true});
  await page.locator('[data-hype-view="pod"]').click();
  const pod=await snapshot(page,'pod');
  requireState(pod,{label:`${lang}-${viewport.width}-pod`,mode:'pod',layer:'launches',availability:expectedPodAvailability,...expectedPod});
  await page.locator('[data-hype-layer="signals"]').click();
  const podSignals=await snapshot(page,'pod');
  requireState(podSignals,{label:`${lang}-${viewport.width}-pod-signals`,mode:'pod',layer:'signals',availability:expectedPodAvailability,...expectedPod});
  await page.locator('[data-hype-layer="catalog"]').click();
  const podCatalog=await snapshot(page,'pod');
  requireState(podCatalog,{label:`${lang}-${viewport.width}-pod-catalog`,mode:'pod',layer:'catalog',availability:expectedPodAvailability,...expectedPod});
  await page.screenshot({path:path.join(output,`hype-${lang}-${viewport.width}-catalog.png`),fullPage:true});
  await page.locator('[data-hype-layer="launches"]').click();
  if(errors.length)throw new Error(`${lang}-${viewport.width}: ${errors.join(' | ')}`);
  await page.screenshot({path:path.join(output,`hype-${lang}-${viewport.width}.png`),fullPage:true});
  await page.close();
  return{rta,pod,rtaSignals,rtaCatalog,podSignals,podCatalog};
}

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(chromePath)?chromePath:undefined});
  try{
    const results=[];
    results.push(await runViewport(browser,{width:390,height:844},'ro'));
    results.push(await runViewport(browser,{width:1366,height:900},'ro'));
    results.push(await runViewport(browser,{width:390,height:844},'en'));
    console.log(`Market Hype visual OK: ${results.length} viewports; RTA ${expectedRta.cards} monitored / ${expectedRta.events} dated; POD ${expectedPod.cards} monitored / ${expectedPod.events} dated.`);
  }finally{await browser.close()}
})().catch(error=>{console.error(error.stack||error);process.exit(1)});
