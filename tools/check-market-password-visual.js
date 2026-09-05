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
const password=process.env.RTA_MARKET_PASSWORD;
if(!password)throw new Error('RTA_MARKET_PASSWORD is required');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:fs.existsSync(chromePath)?chromePath:undefined});
  try{
    const page=await browser.newPage({viewport:{width:390,height:844}});
    await page.goto(`${baseUrl}/?passwordQa=${Date.now()}`,{waitUntil:'domcontentloaded'});
    const accept=page.locator('#ageAccept');
    if(await accept.isVisible().catch(()=>false))await accept.click();
    await page.waitForFunction(()=>!document.body.classList.contains('app-preparing'),{timeout:30000});
    const marketButton=page.locator('[data-tab="market2026"]');
    await marketButton.waitFor({state:'visible',timeout:30000});
    await marketButton.click();
    const modal=page.locator('#market2026Modal');
    await modal.waitFor({state:'visible',timeout:10000});
    const input=page.locator('#market2026Password');
    await input.fill('wrong-password-for-qa');
    await modal.locator('button[type="submit"]').click();
    await page.waitForFunction(()=>/incorectă|incorrect/i.test(document.querySelector('#market2026Error')?.textContent||''),{timeout:10000});
    await input.fill(password);
    const unlockStarted=Date.now();
    await modal.locator('button[type="submit"]').click();
    await modal.waitFor({state:'detached',timeout:10000});
    await page.waitForFunction(()=>sessionStorage.getItem('rtaMarket2026Access')==='1',{timeout:10000});
    await page.waitForSelector('#market2026.active #market2026Root .market-hero',{state:'attached',timeout:30000});
    const heroMs=Date.now()-unlockStarted;
    await page.waitForFunction(()=>document.querySelector('#market2026Root')?.dataset.marketGuardReady==='1',{timeout:30000});
    const readyMs=Date.now()-unlockStarted;
    if(await page.locator('#market2026Password').count())throw new Error('Password field remained in the document after unlock');
    if(heroMs>6000)throw new Error(`Market hero took too long after password: ${heroMs}ms`);
    await page.locator('[data-tab="home"]').first().click();
    await page.waitForSelector('#home.active',{state:'attached',timeout:10000});
    const reentryStarted=Date.now();
    await marketButton.click();
    await modal.waitFor({state:'visible',timeout:2000});
    const promptMs=Date.now()-reentryStarted;
    if(promptMs>1000)throw new Error(`Password prompt took too long on re-entry: ${promptMs}ms`);
    if(await input.inputValue())throw new Error('Password field was not empty on re-entry');
    console.log(`Piața RTA password flow OK: wrong password rejected; hero ${heroMs}ms; full validated view ${readyMs}ms; re-entry prompt ${promptMs}ms.`);
  }finally{
    await browser.close();
  }
})().catch(error=>{console.error(error.stack||error);process.exit(1)});
