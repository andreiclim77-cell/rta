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

async function runViewport(browser,viewport){
  const page=await browser.newPage({viewport});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.stack||error.message));
  page.on('requestfailed',request=>{
    if(/\/__rta-event(?:\?|$)/.test(request.url())&&request.failure()?.errorText==='net::ERR_ABORTED')return;
    errors.push(`${request.url()} :: ${request.failure()?.errorText||'request failed'}`)
  });
  await page.goto(`${baseUrl}/?publicEntryQa=${Date.now()}`,{waitUntil:'domcontentloaded'});
  const accept=page.locator('#ageAccept');
  if(await accept.isVisible().catch(()=>false))await accept.click();
  await page.waitForFunction(()=>!document.body.classList.contains('app-preparing'),{timeout:30000});
  const marketButton=page.locator('[data-tab="market2026"]');
  await marketButton.waitFor({state:'visible',timeout:30000});
  await marketButton.click();
  await page.waitForSelector('#market2026.active #market2026Root .market-hero',{state:'attached',timeout:30000});
  await page.waitForFunction(()=>document.querySelector('#market2026Root')?.dataset.marketGuardReady==='1',{timeout:30000});
  if(await page.locator('#market2026Modal').count())throw new Error(`${viewport.width}: password modal must not exist`);
  for(const view of ['hype','analysis']){
    const button=page.locator(`[data-primary="${view}"]`);
    await button.waitFor({state:'visible',timeout:10000});
    await button.click();
    await page.waitForFunction(expected=>document.querySelector('#market2026Root')?.dataset.marketPrimaryView===expected,view,{timeout:10000});
    const panel=view==='hype'?'#marketHypeRadar':'#marketAnalysisSynthesis';
    await page.locator(panel).waitFor({state:'visible',timeout:30000});
  }
  if(errors.length)throw new Error(`${viewport.width}: ${errors.join(' | ')}`);
  await page.screenshot({path:path.join(output,`public-entry-${viewport.width}.png`),fullPage:true});
  await page.close();
}

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(chromePath)?chromePath:undefined});
  try{
    await runViewport(browser,{width:390,height:844});
    await runViewport(browser,{width:1366,height:900});
    console.log('Piața de audit public entry OK: button, Hype and Analysis work without a password on mobile and desktop.');
  }finally{await browser.close()}
})().catch(error=>{console.error(error.stack||error);process.exit(1)});
