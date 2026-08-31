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

async function openMarket(page,lang){
  await page.goto(`${baseUrl}/?lang=${lang}&hypeQa=${Date.now()}`,{waitUntil:'domcontentloaded'});
  const accept=page.locator('#ageAccept');
  if(await accept.isVisible().catch(()=>false))await accept.click();
  await page.waitForFunction(()=>!document.body.classList.contains('app-preparing'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('[data-tab="market2026"]')&&Array.isArray(window.MAIN_ROUTES)&&window.MAIN_ROUTES.includes('market2026'),{timeout:30000});
  await page.evaluate(()=>{sessionStorage.setItem('rtaMarket2026Access','1');if(typeof setRoute==='function')setRoute('market2026');else{location.hash='#market2026';if(typeof applyRoute==='function')applyRoute(false)}});
  await page.waitForSelector('#market2026.active #market2026Root .market-hero',{timeout:30000});
  await page.waitForFunction(()=>window.__rtaHypeReady===true&&document.querySelector('#marketHypeRadar'),{timeout:30000});
  await page.locator('[data-primary="hype"]').click();
  await page.waitForFunction(()=>{const node=document.querySelector('#marketHypeRadar');return node&&getComputedStyle(node).display!=='none'});
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
  if(result.docOverflow>3||result.clipped||result.vertical)throw new Error(`${expected.label}: layout overflow or vertical text detected`);
  if(result.eventNames.some(name=>/Prime Minister|AF5000|Sonder Q3|Paramour V2|Nitrous Pocket|Pinnacle Colossus/i.test(name)))throw new Error(`${expected.label}: known old model leaked into dated events`);
}

async function runViewport(browser,viewport,lang){
  const page=await browser.newPage({viewport});
  const errors=[];
  page.on('pageerror',error=>{const detail=error.stack||error.message;if(!errors.includes(detail))errors.push(detail)});
  await openMarket(page,lang);
  const rta=await snapshot(page,'rta');
  requireState(rta,{label:`${lang}-${viewport.width}-rta`,mode:'rta',...expectedRta});
  if(!rta.signalNames.some(name=>/Prime Minister/i.test(name)))throw new Error('Prime Minister should remain visible only as a monitored signal');
  await page.locator('[data-hype-view="pod"]').click();
  const pod=await snapshot(page,'pod');
  requireState(pod,{label:`${lang}-${viewport.width}-pod`,mode:'pod',...expectedPod});
  if(!pod.signalNames.some(name=>/AF5000/i.test(name)))throw new Error('AF5000 should remain visible only as a monitored signal');
  if(errors.length)throw new Error(`${lang}-${viewport.width}: ${errors.join(' | ')}`);
  await page.screenshot({path:path.join(output,`hype-${lang}-${viewport.width}.png`),fullPage:true});
  await page.close();
  return{rta,pod};
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
