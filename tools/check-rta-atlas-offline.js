'use strict';
const {chromium}=require('playwright-core'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve('.'),folder=path.resolve('artifacts/atlas-v02-mobile');fs.mkdirSync(folder,{recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.woff2':'font/woff2'};
let failWarmAsset=false;
const server=http.createServer((request,response)=>{
 if(failWarmAsset&&request.url.includes('/data/liquids-2a.js')){response.writeHead(503).end('temporary failure');return;}
 let file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)||file.includes(path.sep+'.git'+path.sep)){response.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 if(!fs.existsSync(file)){response.writeHead(404).end();return;}
 response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');response.setHeader('Cache-Control','no-cache');response.end(fs.readFileSync(file));
});
const receipt=JSON.parse(fs.readFileSync('rta-lab/atlas-preview/media/PRODUCT_PHOTO_RECEIPT.json','utf8'));
assert.equal(Object.keys(receipt.records).length,16);assert.equal(receipt.failures.length,0);
for(const [id,r] of Object.entries(receipt.records)){const bytes=fs.readFileSync(path.resolve('rta-lab/atlas-preview',r.src));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),r.sha256,'Unedited image integrity '+id);}
async function main(){
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const cl=JSON.stringify({schema:1,units:[{saved:{atom:'dvarwcl',wire:'k128',wraps:6},draft:{atom:'dvarwcl',wire:'k128',wraps:5}},{saved:null,draft:null},{saved:{atom:'dvarwcl',wire:'k129',wraps:5},draft:null}]});
  await page.addInitScript(value=>{if(!localStorage.getItem('rta-cl-physical-units-v1-20261014'))localStorage.setItem('rta-cl-physical-units-v1-20261014',value);},cl);
  await page.goto(origin+'/rta-lab/atlas-preview/');
  await page.evaluate(async()=>{await caches.open('rta-lab-sentinel').then(c=>c.put('/sentinel',new Response('preserve V10 cache owner')));await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await page.evaluate(async()=>!!(await caches.match('/sentinel'))),true,'Atlas activation must preserve other cache owners');
  const cacheSize=await page.evaluate(async()=>{const key=(await caches.keys()).find(k=>k.startsWith('rta-atlas-'));return (await (await caches.open(key)).keys()).length;});assert.ok(cacheSize>=60,'Offline manifest must be fully installed');
  failWarmAsset=true;await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('#matchButton',{state:'attached'});
  assert.equal(await page.evaluate(()=>window.RTA_LIQUIDS.length),620,'Warm HTTP 503 must recover the verified cached catalog');
  assert.equal(await page.locator('.atlas-unavailable').count(),0);failWarmAsset=false;
  await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.RTA_LIQUIDS?.length===620);
  assert.equal(await page.locator('#atlasConnection').textContent().then(t=>t.includes('Offline')),true,'Offline state must be explained');
  await page.locator('#cinemaPause').click();await page.waitForFunction(()=>{const img=document.querySelector('.cinema-frame.is-visible img');return img?.complete&&img.naturalWidth>0;});
  await page.waitForTimeout(850);await page.screenshot({path:path.join(folder,'offline-home-390.png')});
  for(const route of ['liquid','atomizer','wire','market','duel']){
   await page.locator('.bottom-tabs [data-route="'+route+'"]').click();
   assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.state.route),route);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'Offline overflow '+route);
   assert.equal(await page.locator('.page:not([hidden])').count(),1,'Only one module is visible');
  }
  await page.locator('.bottom-tabs [data-route="atomizer"]').click();await page.locator('#atlasPlatform').selectOption('dvarwcl');
  assert.equal(await page.locator('.unit-row').count(),3);assert.equal(await page.evaluate(()=>localStorage.getItem('rta-cl-physical-units-v1-20261014')),cl,'CL saved/draft bytes must be unchanged');
  await page.locator('#atlasPlatform').selectOption('klp');await page.waitForFunction(()=>{const img=document.querySelector('.portrait-photo img');return img?.complete&&img.naturalWidth>0;});await page.locator('.portrait-photo img').evaluate(img=>img.decode());
  await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('#pageAtomizer')).opacity)>=.999);
  await page.screenshot({path:path.join(folder,'offline-atomizer-390.png')});
  await page.locator('[data-edit-wire]').click();await page.locator('#wireMaterial').selectOption('nife52');
  assert.equal(await page.evaluate(()=>window.RTA_ATLAS_MODULES.state.config.power),13);
  await page.locator('#pageWire [data-duel-pick]').first().click();await page.locator('#pageWire [data-duel-pick]').nth(1).click();await page.locator('[data-duel-results]').click();await page.waitForTimeout(500);
  await page.screenshot({path:path.join(folder,'offline-duel-390.png')});
  assert.equal(errors.length,0,errors.join(' | '));await context.close();
  const failed=await browser.newContext({viewport:{width:360,height:800},serviceWorkers:'block'});
  await failed.route('**/data/liquids-2a.js?**',route=>route.abort());const failedPage=await failed.newPage();await failedPage.goto(origin+'/rta-lab/atlas-preview/',{waitUntil:'domcontentloaded'});
  await failedPage.waitForSelector('.atlas-unavailable');assert.equal(await failedPage.locator('#resultCards .result-card').count(),0,'Missing catalog input must not yield fake complete results');
  assert.equal(await failedPage.locator('.atlas-unavailable').textContent().then(t=>t.includes('date incomplete')),true);await failedPage.screenshot({path:path.join(folder,'cold-missing-data-360.png')});await failed.close();
  console.log('ATLAS OFFLINE PASS: 16 image hashes, fully installed scoped cache, six functioning modules offline, real portraits, existing cache owners and CL saved/draft bytes preserved.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(error=>{console.error(error);server.close();process.exitCode=1;});
