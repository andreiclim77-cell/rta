"use strict";
const { chromium }=require("playwright-core");
const path=require("node:path"),fs=require("node:fs");
const entry="file://"+path.resolve("rta-lab/atlas-preview/index.html");
const folder=path.resolve("artifacts/atlas-v02-mobile");
fs.mkdirSync(folder,{recursive:true});
function check(condition,message){if(!condition)throw new Error(message);}
async function screenshot(page,name){await page.screenshot({path:path.join(folder,name),fullPage:false});}
async function main(){
 const browser=await chromium.launch({channel:"chrome",headless:true,args:["--no-sandbox"]});
 try{
  for(const [width,height] of [[360,800],[390,844]]){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   await page.goto(entry,{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>window.RTA_ATLAS_PREVIEW?.getSourceModel().liquids===620);
   await page.waitForSelector("#cinemaReel .cinema-frame img");
   // A tag existing in the DOM is not evidence that a photograph loaded.
   await page.waitForFunction(()=>{
    const img=document.querySelector('#cinemaReel .cinema-frame.is-visible img');
    return img&&img.complete&&img.naturalWidth>0;
   },null,{timeout:15000});
   const photoState=await page.evaluate(()=>{
    const img=document.querySelector('#cinemaReel .cinema-frame.is-visible img');
    return {width:img.naturalWidth,fit:getComputedStyle(img).objectFit,src:img.currentSrc};
   });
   check(photoState.width>0,"Hero must show decoded pixels, not a broken <img>");
   check(photoState.fit==="contain","Real products must remain fully framed");
   const home=await page.evaluate(()=>{
    const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,height:b.height};};
    return {doc:document.documentElement.scrollWidth,vw:innerWidth,photo:r(".hero-stage"),title:r("#homeTitle"),button:r(".primary-action")};
   });
   console.log("HOME",width,JSON.stringify(home));
   check(home.doc<=width+1,"Horizontal overflow on HOME");
   check(home.photo.height>=185&&home.photo.height<=335,"Incorrect hero photo height");
   check(home.photo.y<home.title.y,"Photo should be first on phone");
   check(home.button.bottom<height-55,"CTA hidden below mobile navigation");
   check(home.title.right<=width+1,"Title clipped");
   await screenshot(page,"home-"+width+".png");
   await page.waitForTimeout(3500);
   const slide=await page.locator(".cinema-frame.is-visible").getAttribute("data-cinema-frame");
   check(slide!=="0","Carousel must visibly switch photos");
   await screenshot(page,"home-motion-"+width+".png");
   await page.locator("#cinemaPause").click();
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('.cinema-frame.is-visible img')).animationPlayState==="paused");
   // Chromium's compositor may finish the already scheduled frame immediately
   // after click. Compare two settled frames, then wait a full carousel period.
   await page.waitForTimeout(120);
   const pausedFrame=await page.locator(".cinema-frame.is-visible").getAttribute("data-cinema-frame");
   const pausedTransform=await page.locator(".cinema-frame.is-visible img").evaluate(img=>getComputedStyle(img).transform);
   await page.waitForTimeout(3350);
   check(await page.locator(".cinema-frame.is-visible").getAttribute("data-cinema-frame")===pausedFrame,"Pause must stop rotation");
   check(await page.locator(".cinema-frame.is-visible img").evaluate(img=>getComputedStyle(img).transform)===pausedTransform,"Pause must stop photo motion too");
   await screenshot(page,"home-paused-"+width+".png");
   await page.locator(".primary-action").click();
   // Wait for pageReveal + the reactive liquid-scene animation before snapshots.
   // Capturing at transition frame zero produced an almost black image despite passing layout tests.
   await page.waitForTimeout(1150);
   const liquid=await page.evaluate(()=>{
    const a=document.querySelector(".live-scene").getBoundingClientRect();
    const b=document.querySelector("#liquidSearch").getBoundingClientRect();
    return {doc:document.documentElement.scrollWidth,sceneTop:a.top,sceneH:a.height,searchTop:b.top,cards:document.querySelectorAll(".result-card").length};
   });
   console.log("LIQUID",width,JSON.stringify(liquid));
   check(liquid.doc<=width+1,"Horizontal overflow Liquid Match");
   check(liquid.sceneTop<liquid.searchTop,"Cinema must be above controls");
   check(liquid.sceneTop<240,"Cinema must appear early on mobile");
   check(liquid.cards===3,"Need three atomizers");
   const sceneBest=await page.locator("#sceneMatchAtom").textContent();
   const expectedBest=await page.evaluate(()=>{
    const m=window.RTA_ATLAS_PREVIEW,ctx=m.compose(m.state.liquidIndex,m.state.mood,m.state.moment);
    return ctx.items[0].atom.short;
   });
   check(sceneBest===expectedBest,"Liquid Cinema preview must show top-ranked contextual model");
   const sceneBox=await page.locator("#sceneMatch").boundingBox();
   check(sceneBox&&sceneBox.y>0&&sceneBox.y+sceneBox.height<height-60,
    "Computed best must be visible within first mobile viewport");
   const compact=await page.locator("#sceneMatchBuild").evaluate(el=>({text:el.textContent,h:el.clientHeight,scroll:el.scrollHeight}));
   check(/spire/.test(compact.text)&&/TC|WATT/.test(compact.text)&&compact.scroll<=compact.h+1,"Compact setup must show wraps and energy without truncation");
   const activeRail=await page.locator("#moodChips").evaluate(rail=>{
    const active=rail.querySelector(".chip.active"),a=active.getBoundingClientRect(),b=rail.getBoundingClientRect();
    return {left:a.left,railLeft:b.left,right:a.right,railRight:b.right};
   });
   check(activeRail.left>=activeRail.railLeft-3&&activeRail.right<=activeRail.railRight+3,
    "Selected mood must not be clipped outside its mobile rail");
   const resultsBeforeDemo=await page.evaluate(()=>{
    const results=document.getElementById("resultsSection"),demo=document.querySelector(".air-demo");
    return !!(results.compareDocumentPosition(demo)&Node.DOCUMENT_POSITION_FOLLOWING);
   });
   check(resultsBeforeDemo,"Results should appear before the secondary airflow explainer");
   const details=await page.locator(".result-card .card-detail").evaluateAll(nodes=>nodes.map(n=>n.hidden));
   check(details.length===3&&details.every(Boolean),"TOP 1 must start compact on phone");
   await screenshot(page,"liquid-"+width+".png");
   await page.locator("#jumpBest").click();
   await page.waitForTimeout(850);
   const jumpedCard=await page.locator(".result-card").first().boundingBox();
   check(jumpedCard&&jumpedCard.y>=45&&jumpedCard.y<height-180,"Scene shortcut must bring the actual best card into view");
   await screenshot(page,"scene-best-in-view-"+width+".png");
   await page.locator("#chooseTitle").scrollIntoViewIfNeeded();
   await page.locator("#liquidSearch").fill("Balkan");
   await page.waitForTimeout(350);
   const suggestions=await page.locator("#liquidSuggestions [role=option]").count();
   check(suggestions>=2,"Keyboard search fixture needs at least two Balkan catalog entries");
   const inputBox=await page.locator("#liquidSearch").boundingBox(),listBox=await page.locator("#liquidSuggestions").boundingBox();
   check(listBox&&inputBox&&listBox.y>=inputBox.y+inputBox.height,"Suggestions must not cover the search field");
   check(inputBox.y>=50&&listBox.y<height-120,"Search capture must actually show field and options above navigation");
   await screenshot(page,"search-open-"+width+".png");
   const liquidBeforeEscape=await page.locator("#selectedLiquid").textContent();
   await page.locator("#liquidSearch").press("Escape");
   await page.locator("#liquidSearch").press("Enter");
   check(await page.locator("#selectedLiquid").textContent()===liquidBeforeEscape,"Enter after Escape must not select a hidden option");
   await page.locator("#liquidSearch").fill("Balkan ");
   await page.locator("#liquidSearch").press("ArrowDown");
   check(await page.locator("#liquidSearch").getAttribute("aria-activedescendant")==="liquidOpt1",
    "ArrowDown must update active keyboard suggestion");
   const selectedByKeyboard=await page.locator("#liquidOpt1").textContent();
   await page.locator("#liquidSearch").press("Enter");
   check(await page.locator("#selectedLiquid").textContent()!==null,"Keyboard selection must update liquid context");
   check((await page.locator("#selectedLiquid").textContent()).includes(selectedByKeyboard.split("·")[0].trim()),
    "Keyboard Enter must choose highlighted catalog item");
   await page.locator('[data-air="triple"]').click();
   check(await page.locator("#airDemoVisual .air-flow-path").count()===3,"Triple insert must draw 3 jets");
   await page.waitForTimeout(800);
   await screenshot(page,"three-jets-"+width+".png");
   await page.locator('[data-air="single"]').click();
   check(await page.locator("#airDemoVisual .air-flow-path").count()===1,"Single insert must draw 1 jet");
   await page.locator('[data-mood="power"]').click();
   check(await page.locator(".live-scene").evaluate(el=>getComputedStyle(el).filter)==="none",
    "Liquid Cinema motion must never blur the selected result or its text");
   const updatedBest=await page.evaluate(()=>{
    const m=window.RTA_ATLAS_PREVIEW;
    return m.compose(m.state.liquidIndex,m.state.mood,m.state.moment).items[0].atom.short;
   });
   check((await page.locator("#sceneMatchAtom").textContent())===updatedBest,
    "Best preview must react to mood changes");
   check(await page.locator(".result-card").count()===3,"TOP3 must remain available");
   check(await page.locator(".atlas-product-photo img").count()>0,"Missing real product photo");
   check(errors.length===0,"Uncaught JS errors: "+errors.join(" | "));
   await screenshot(page,"after-interaction-"+width+".png");
   await page.waitForTimeout(350);
   await screenshot(page,"liquid-motion-"+width+".png");
   await page.locator("#matchButton").click();
   await page.waitForTimeout(850);
   const firstCard=await page.locator(".result-card").first().boundingBox();
   check(firstCard&&firstCard.y>=45&&firstCard.y<height-180,
    "Compose action must bring the first actual result into view");
   await screenshot(page,"best-in-view-"+width+".png");
   await context.close();
  }
  // Force vendor outages: the fallback must be an actual decoded local image,
  // with no misleading credit for the unavailable external photo.
  const offline=await browser.newContext({viewport:{width:360,height:800},isMobile:true});
  await offline.route("https://thevapinggentlemen.club/**",route=>route.abort());
  const fallbackPage=await offline.newPage();
  await fallbackPage.goto(entry,{waitUntil:"domcontentloaded"});
  await fallbackPage.waitForFunction(()=>{
   const img=document.querySelector('#cinemaReel .cinema-frame.is-visible img');
   return img?.dataset.photoFallback==="local"&&img.complete&&img.naturalWidth>0;
  },null,{timeout:12000});
  check(await fallbackPage.locator("#cinemaCredit").getAttribute("href")===null,
   "Project-hosted fallback must not be credited as external original");
  await screenshot(fallbackPage,"hero-vendor-offline-360.png");
  await fallbackPage.locator("#cinemaPause").click();
  for(const frame of [1,2]){
   await fallbackPage.locator('[data-cinema-select="'+frame+'"]').click();
   await fallbackPage.waitForFunction(()=>{
    const img=document.querySelector('.cinema-frame.is-visible img');
    return img?.dataset.photoFallback==="local"&&img.complete&&img.naturalWidth>0;
   });
   await fallbackPage.waitForTimeout(800);
   check((await fallbackPage.locator("#cinemaCredit").textContent()).includes("copie locale"),"Exact vendor photo copy must retain its source");
   if(frame===2)check(await fallbackPage.locator(".cinema-frame.is-visible img").evaluate(img=>getComputedStyle(img).maskImage)==="none","415 fallback must not receive the GT One mask");
   await screenshot(fallbackPage,"hero-vendor-offline-frame-"+frame+"-360.png");
  }
  await offline.close();
  const reduced=await browser.newContext({viewport:{width:390,height:844},isMobile:true,reducedMotion:"reduce"});
  const page=await reduced.newPage();
  await page.goto(entry,{waitUntil:"domcontentloaded"});
  const first=await page.locator(".cinema-frame.is-visible").getAttribute("data-cinema-frame");
  await page.waitForTimeout(3550);
  const later=await page.locator(".cinema-frame.is-visible").getAttribute("data-cinema-frame");
  check(first===later,"Reduced motion must stop automatic carousel");
  check(await page.locator("#cinemaPause").isHidden(),"Don't offer an impossible autoplay action in reduced motion");
  await page.locator('[data-cinema-select="1"]').click();
  check(await page.locator(".cinema-frame.is-visible").getAttribute("data-cinema-frame")==="1",
   "Reduced motion must preserve manual slide selection");
  await reduced.close();
  console.log("ATLAS VISUAL PASS: 360x800/390x844, decoded photos, contextual BEST in first viewport, selected mood in view, keyboard search, genuine first-card reveal, airflow, offline fallback, reduced-motion.");
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
