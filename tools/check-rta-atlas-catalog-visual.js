'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright-core');
const root=path.resolve('.'),out=path.resolve('artifacts/atlas-v02-mobile');fs.mkdirSync(out,{recursive:true});
const mime={'.js':'application/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png'};
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
async function stable(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});}
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=process.env.RTA_ATLAS_CATALOG_ORIGIN||'http://127.0.0.1:'+server.address().port,browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const [width,height] of [[360,800],[390,844],[1440,1000]]){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/rta-lab/atlas/');await page.waitForFunction(()=>window.RTA_ATLAS_CATALOG?.count===700&&window.RTA_ATLAS_PREVIEW);await page.locator('.primary-action').click();
 for(const [query,name,file] of [['centenary mods Balcan milestone','Balkan Milestone','balkan'],['Mer de cheval','Merde de Cheval','merde']]){
  await page.locator('#liquidSearch').fill(query);const first=page.locator('#liquidSuggestions [data-lp-index]').first();assert.ok(await first.textContent().then(t=>t.includes(name)));
  await first.scrollIntoViewIfNeeded();await stable(page);await page.screenshot({path:path.join(out,'catalog-'+file+'-search-'+width+'.png')});await page.locator('#liquidSearch').press('Enter');
  assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.currentLiquid().name),name);assert.equal(await page.locator('.result-card').count(),3);
  assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.compose(window.RTA_ATLAS_PREVIEW.state.liquidIndex,'magic','evening').distinctBuilds),9);
  assert.ok(await page.locator('#selectedLiquid .catalog-source-note a').first().getAttribute('href').then(u=>u.startsWith('https://centenarymods.com/')));
  if(file==='merde')assert.ok(await page.locator('#selectedLiquid .catalog-source-note').textContent().then(t=>/secret/i.test(t)));
  await page.locator('#selectedLiquid').scrollIntoViewIfNeeded();await stable(page);await page.screenshot({path:path.join(out,'catalog-'+file+'-selected-'+width+'.png')});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 const nav=width<760?'.bottom-tabs':'.top-nav';for(const route of ['atomizer','wire','duel']){await page.locator(nav+' [data-route="'+route+'"]').click();assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.currentLiquid().name),'Merde de Cheval');}
 assert.deepEqual(errors,[]);await context.close();
}
console.log('CATALOG VISUAL PASS: exact user queries, both Centenary products, secret-recipe limit, 3×3 results, source links, shared selection and mobile/desktop bounds.');
}finally{await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
