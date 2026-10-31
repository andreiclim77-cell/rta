'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright-core');
const shotDir=path.resolve('artifacts/atlas-mobile-fit');
fs.mkdirSync(shotDir,{recursive:true});
function checkViewport(page,width,context){
 return page.evaluate(({width,context})=>{
  const rect=e=>e.getBoundingClientRect();
  const visible=e=>{const r=rect(e),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';};
  const bad=[],host=document.querySelector('.page:not([hidden])');
  if(document.documentElement.scrollWidth>innerWidth+1||innerWidth>width+1)bad.push('document expanded');
  const charts=[...host.querySelectorAll('.exp-mobile-charts')].filter(visible);
  for(const graph of charts){
   if(graph.querySelectorAll('.exp-mobile-metric').length!==14)bad.push('incomplete 14 objectives');
   const desktop=graph.closest('.exp-matrix-box').querySelector('.exp-matrix-scroll');
   if(visible(desktop))bad.push('wide desktop table remains visible');
   for(const metric of graph.querySelectorAll('.exp-mobile-metric')){
    const series=[...metric.querySelectorAll('.exp-mobile-series')];
    const expected=graph.closest('.exp-matrix-box').querySelectorAll('thead th').length-1;
    if(series.length!==expected)bad.push('hidden compared material');
   }
  }
  for(const el of host.querySelectorAll('.exp-mobile-line,.exp-family,.chip,.exp-category-choices button,.exp-selects label')){
   if(!visible(el))continue;
   const b=rect(el);
   if(b.left<-.5||b.right>innerWidth+.5)bad.push('panel outside screen '+(el.className||el.tagName));
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
   let node;
   while(node=walker.nextNode()){
    if(!node.textContent.trim())continue;
    const range=document.createRange();range.selectNodeContents(node);
    for(const r of range.getClientRects()){
     if(r.width&&r.height&&(r.left<b.left-2||r.right>b.right+2))
      bad.push('clipped text: '+(el.className||el.tagName)+' '+node.textContent.slice(0,30));
    }
   }
  }
  return {context,count:charts.length,bad:bad.slice(0,8)};
 },{width,context});
}
async function caseRun(browser,width,height,largeType=false){
 let context=null,profile=null;
 if(largeType){
  profile=fs.mkdtempSync(path.resolve('artifacts/rta-font-profile-'));
  fs.mkdirSync(path.join(profile,'Default'));
  fs.writeFileSync(path.join(profile,'Default','Preferences'),JSON.stringify({webkit:{webprefs:{minimum_font_size:24,minimum_logical_font_size:24}}}));
  context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true,viewport:{width,height},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 }else context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('file://'+path.resolve('rta-lab/atlas-preview/index.html')+'#wire',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#wireLibrary .wire-build-entry');
  await page.locator('[data-wire-family="k128"]').click();
  await page.locator('#expWireWraps').selectOption('5');
  await page.locator('#expWireOther').selectOption('nife30');
  await page.locator('#expWireOtherWraps').selectOption('7');
  assert.equal(await page.locator('#expWireWizard .wire-quick-axis').count(),6,'Compact wire comparison must show six criteria');
  assert.equal(await page.locator('#expWireWizard .exp-matrix').count(),1,'Full 14-axis matrix exists only once');
  // The large 14-axis matrix is intentionally CLOSED by default to reduce
  // redundant scrolling. Open explicitly for accessible visual QA.
  await page.locator('#expWireWizard .wire-full-axis-details').first().locator('summary').click();
  let check=await checkViewport(page,width,'Wire detailed');
  assert.ok(check.count===1&&!check.bad.length,JSON.stringify(check));
  await page.locator('#expWireWizard .exp-mobile-metric').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(shotDir,'wire-'+width+(largeType?'-font24':'')+'.png')});
  await page.locator('[data-route="atomizer"]:visible').first().click();
  await page.locator('#atlasPlatform').selectOption('gtr');
  await page.locator('[data-exp-wire="atlas"][data-exp-value="nife30"]').click();
  await page.locator('[data-exp-wraps="atlas"][data-exp-value="7"]').click();
  check=await checkViewport(page,width,'Atlas');
  assert.ok(check.count>=2&&!check.bad.length,JSON.stringify(check));
  assert.equal(await page.locator('#atlasBuilds .material-path').count(),3);
  await page.locator('#expAtlasWizard .exp-mobile-metric').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(shotDir,'atlas-'+width+(largeType?'-font24':'')+'.png')});
  await page.locator('[data-route="liquid"]:visible').first().click();
  await page.locator('#expLiquidCategories [data-exp-liquid-cat="NET simplu"]').click();
  await page.locator('#liquidSuggestions [data-lp-index]').first().click();
  assert.equal(await page.locator('#resultCards .result-card').count(),3);
  check=await checkViewport(page,width,'Liquid');
  assert.ok(check.count===1&&!check.bad.length,JSON.stringify(check));
  const mood=await page.evaluate(()=>{const e=document.getElementById('moodChips');return [e.clientWidth,e.scrollWidth]});
  assert.ok(mood[1]<=mood[0]+1,'Mood options must all be visible, without horizontal scroll');
  const tabs=await page.locator('.bottom-tabs').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);
  assert.equal(tabs,3,'Phone navigation should expose readable labels in 3 columns');
  await page.locator('#liquidComparison .exp-mobile-metric').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(shotDir,'liquid-'+width+(largeType?'-font24':'')+'.png')});
  assert.deepEqual(errors,[],'No runtime errors');
  return {width,largeType,checks:3};
 }finally{await context.close();if(profile)fs.rmSync(profile,{recursive:true,force:true});}
}
async function main(){
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 try{
  for(const [width,height,large] of [[320,740,false],[390,844,false],[412,915,false],[390,844,true]]){
   console.log('MOBILE FIT',JSON.stringify(await caseRun(browser,width,height,large)));
  }
 }finally{await browser.close();}
 console.log('ATLAS MOBILE FIT VISUAL PASS: all objectives and labels visible at 320/390/412 and real minimum font 24px, navigation, old 3-build cards intact.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
