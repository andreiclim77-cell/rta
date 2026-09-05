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

async function openAnalysis(page){
  const requested=[];
  page.on('request',request=>requested.push(new URL(request.url()).pathname));
  await page.goto(`${baseUrl}/?analysisQa=${Date.now()}`,{waitUntil:'domcontentloaded'});
  const accept=page.locator('#ageAccept');
  if(await accept.isVisible().catch(()=>false))await accept.click();
  await page.waitForFunction(()=>!document.body.classList.contains('app-preparing'),{timeout:30000});
  await page.waitForFunction(()=>document.querySelector('[data-tab="market2026"]')&&Array.isArray(window.MAIN_ROUTES)&&window.MAIN_ROUTES.includes('market2026'),{timeout:30000});
  await page.evaluate(()=>{sessionStorage.setItem('rtaMarket2026Access','1');if(typeof setRoute==='function')setRoute('market2026');else{location.hash='#market2026';if(typeof applyRoute==='function')applyRoute(false)}});
  await page.waitForSelector('#market2026.active #market2026Root .market-hero',{state:'attached',timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#market2026Root')?.dataset.marketGuardReady==='1',{timeout:30000});
  await page.locator('[data-primary="analysis"]').click();
  await page.waitForFunction(()=>window.__rtaMarketAnalysisReady===true&&window.__rtaMarketSynthesisReady===true&&document.querySelector('#marketAnalysisSynthesis'),{timeout:30000});
  return requested;
}

async function inspect(page){
  return page.evaluate(()=>{
    const root=document.querySelector('#marketManagementCockpit');
    const synthesis=document.querySelector('#marketAnalysisSynthesis');
    const text=(root?.textContent||'')+' '+(synthesis?.textContent||'');
    const sections=Array.from(synthesis?.querySelectorAll('.synth-section')||[]);
    return{
      guardPresent:Boolean(document.querySelector('#marketLoadingGuard')),
      ready:document.querySelector('#market2026Root')?.dataset.marketGuardReady,
      headings:sections.map(section=>section.querySelector('.synth-title span')?.textContent.trim()),
      popularityCategories:sections[0]?.querySelectorAll('[data-synth-grid="brands"]>article').length||0,
      ideaCategories:sections[1]?.querySelectorAll('.synth-category-grid>article').length||0,
      modeButtons:sections.map(section=>section.querySelectorAll('[data-synth-view]').length),
      oldInventoryText:/Alerta stoc|Sold out|Top produse urmărite|Evoluția produselor|Comparația zilnică/i.test(text),
      clearTruth:/Topuri publice, nu volume de vânzări/.test(text),
      technicalClutter:/INTERVAL SOLICITAT|DATE VERIFICABILE DISPONIBILE|Perioada cu dovezi|zile observate|pozițiile publice observate|clasamentele cumulative|snapshot|colectare|Tier A|surse comerciale/i.test(text),
      baseHeroHidden:document.querySelector('#market2026Root>.market-hero')?.classList.contains('market-view-hidden')||getComputedStyle(document.querySelector('#market2026Root>.market-hero')).display==='none',
      docOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      synthesisOverflow:synthesis?synthesis.scrollWidth-synthesis.clientWidth:999
    };
  });
}

async function runViewport(browser,viewport){
  const page=await browser.newPage({viewport});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.stack||error.message));
  const requested=await openAnalysis(page);
  const state=await inspect(page);
  if(state.ready!=='1'||state.guardPresent)throw new Error(`${viewport.width}: loading guard did not release`);
  if(state.headings.join('|')!=='Vizibilitate în magazine|Idei de cumpărare')throw new Error(`${viewport.width}: public section headings are wrong`);
  if(state.popularityCategories<10||state.ideaCategories<1||state.modeButtons.some(count=>count!==2))throw new Error(`${viewport.width}: brand/product public results are incomplete`);
  if(state.oldInventoryText||state.technicalClutter||!state.clearTruth||!state.baseHeroHidden)throw new Error(`${viewport.width}: Analysis is cluttered or its public meaning is unclear`);
  for(const section of await page.locator('[data-synth-section]').all()){
    await section.locator('[data-synth-view="products"]').click();
    if(await section.locator('[data-synth-grid="products"]').getAttribute('hidden')!==null)throw new Error(`${viewport.width}: product ranking did not open`);
    await section.locator('[data-synth-view="brands"]').click();
  }
  if(state.docOverflow>3||state.synthesisOverflow>3)throw new Error(`${viewport.width}: horizontal overflow detected`);
  const forbidden=['/data/market-sales-2026.json','/data/market-management-2026.json','/data/market-demand-intelligence-2026.json','/data/market-external-intelligence-2026.json','/data/market-product-presence-2026.json','/data/market-universe-audit-2026.json'];
  const leaked=forbidden.filter(item=>requested.includes(item));
  if(leaked.length)throw new Error(`${viewport.width}: heavy browser data still requested: ${leaked.join(', ')}`);
  if(!requested.includes('/data/market-analysis-public-2026.json'))throw new Error(`${viewport.width}: compact public Analysis was not requested`);
  if(errors.length)throw new Error(`${viewport.width}: ${errors.join(' | ')}`);
  await page.screenshot({path:path.join(output,`analysis-${viewport.width}.png`),fullPage:true});
  await page.close();
  return state;
}

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(chromePath)?chromePath:undefined});
  try{
    await runViewport(browser,{width:390,height:844});
    await runViewport(browser,{width:1366,height:900});
    console.log('Market Analysis visual OK: desktop + mobile; password bypass only for QA; clear store-visibility wording; brand/product switches; no technical clutter or horizontal overflow.');
  }finally{await browser.close()}
})().catch(error=>{console.error(error.stack||error);process.exit(1)});
