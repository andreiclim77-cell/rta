'use strict';
const {chromium}=require('playwright-core'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve('.'),folder=path.resolve('artifacts/atlas-v02-mobile');fs.mkdirSync(folder,{recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(file));});
async function shot(page,name){await page.waitForFunction(()=>{const p=document.querySelector('.page:not([hidden])');return !p||Number(getComputedStyle(p).opacity)>=.999;});await page.locator('.page:not([hidden]) img').evaluateAll(async images=>{for(const img of images){if(img.closest('details:not([open])'))continue;const b=img.getBoundingClientRect();if(b.height>0&&b.top<innerHeight&&b.bottom>0)await img.decode();}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});await page.screenshot({path:path.join(folder,name)});}
async function chartShot(page,locator,name){await locator.evaluate(el=>{const header=document.querySelector('.mast')?.getBoundingClientRect().height||60;scrollTo({top:Math.max(0,scrollY+el.getBoundingClientRect().top-header-12),behavior:'instant'});});await locator.screenshot({path:path.join(folder,name)});}
async function main(){await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=process.env.RTA_ATLAS_LIVE_ORIGIN||'http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});try{
 for(const [width,height] of [[360,800],[390,844],[1440,1000]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const storageKey='rta-cl-physical-units-v1-20261014',saved=JSON.stringify({schema:1,units:[{saved:{atom:'dvarwcl',wire:'k128',wraps:6},draft:{atom:'dvarwcl',wire:'k128',wraps:5}},{saved:null,draft:null},{saved:{atom:'dvarwcl',wire:'k129',wraps:5},draft:null}]});
  await page.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:storageKey,value:saved});
  await page.goto(origin+'/rta-lab/atlas/');await page.waitForSelector('#matchButton',{state:'attached'});
  const nav=width<760?'.bottom-tabs':'.top-nav';
  assert.equal(await page.locator('a[href*="view=v10"],a[href*="#atomExplorer"]').count(),0,'Atlas must not expose the old interface');
  await page.locator(nav+' [data-route="atomizer"]').click();await page.locator('#atlasPlatform').selectOption('klp');await page.locator(nav+' [data-route="wire"]').click();await page.locator('[data-wire-family="nife52"]').click();
  assert.equal(await page.locator('#wireAtom').inputValue(),'klp','An explicitly selected Atlas platform must survive a later wire choice');
  assert.equal(await page.locator('#wireMaterial').inputValue(),'nife52');
  await page.goto(origin+'/rta-lab/atlas/');await page.waitForSelector('#matchButton',{state:'attached'});
  await page.locator(nav+' [data-route="wire"]').click();
  assert.equal(await page.locator('#wireMaterial').inputValue(),'','A wire must also be chosen explicitly');
  assert.equal(await page.locator('#wireAtom').inputValue(),'','Wire-first entry must await a platform choice');
  for(const wire of ['k128','k129','k1clap','ssclap','nife30','nife52']){
   await page.locator('#wireMaterial').selectOption(wire);
   const compatible=await page.evaluate(wire=>window.RTA_CORE.atoms.filter(a=>window.RTA_SENSORY_CORE.variants(a.id).some(v=>v.wire===wire)).map(a=>a.id).sort(),wire);
   assert.deepEqual(await page.locator('[data-wire-platform]').evaluateAll(buttons=>buttons.map(b=>b.dataset.wirePlatform).sort()),compatible,'Show every and only compatible platform');
  }
  await shot(page,'flow-wire-first-'+width+'.png');
  await page.locator('[data-wire-platform="klp"]').click();assert.equal(await page.locator('#wireLiquidSearch').isVisible(),true);
  await page.locator('#atlasBack').click();await page.waitForFunction(()=>window.RTA_ATLAS_PREVIEW.state.route==='home');
  await page.locator(nav+' [data-route="atomizer"]').click();await page.locator('#atlasPlatform').selectOption('klp');
  assert.equal(await page.locator('.material-path').count(),3);
  for(const card of await page.locator('.material-path').all()){
   const wire=await card.locator('[data-journey-wire]').first().getAttribute('data-journey-wire');
   const actual=await card.locator('[data-journey-liquid]').evaluateAll(buttons=>buttons.map(b=>Number(b.dataset.journeyLiquid)));
   const expected=await page.evaluate(wire=>{const m=window.RTA_ATLAS_MODULES;return window.RTA_SENSORY_CORE.matchLiquids(m.wireConfig(m.state.atom,wire),window.RTA_LIQUIDS,m.state.objective,5).map(r=>r.index);},wire);assert.deepEqual(actual,expected,'Each material has its own exact top-five liquids');
  }
  await page.locator('.material-paths').scrollIntoViewIfNeeded();await shot(page,'flow-atlas-three-wires-'+width+'.png');
  await page.goto(origin+'/rta-lab/atlas/');await page.waitForSelector('#matchButton',{state:'attached'});
  assert.equal(await page.locator('.mast a[href*="view=v10"]').count(),0,'Legacy interface must not compete in the Atlas header');
  await page.locator('.primary-action').click();
  assert.equal(await page.locator('#liquidSearch').inputValue(),'');
  assert.equal(await page.locator('#matchButton').isDisabled(),true);
  assert.equal(await page.locator('.result-card').count(),0);
  assert.equal(await page.locator('.live-scene').isVisible(),false);
  const firstField=await page.locator('#liquidSearch').boundingBox();assert.ok(firstField.y>=50&&firstField.y+firstField.height<height-60,'Liquid choice must be in the first viewport');
  await shot(page,'liquid-first-empty-'+width+'.png');
  assert.equal(await page.locator('.quick-liquids').count(),0,'Fixed three-liquid demos must be removed');
  await page.locator('#clearSearch').click();await page.locator('[data-liquid-picker="liquid"] .liquid-facets summary').click();
  await page.locator('[data-liquid-picker="liquid"] [data-lp-filter="family"]').selectOption('NET complex');await page.locator('[data-liquid-picker="liquid"] [data-lp-filter="brand"]').selectOption('La Tabaccheria');await page.locator('#liquidSearch').fill('Mixture Balkan');
  assert.ok(await page.locator('#liquidSuggestions [data-lp-index]').count()>0);await page.locator('#liquidSearch').press('Enter');
  assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.currentLiquid().name),'Balkan Mixture');
  assert.equal(await page.locator('#matchButton').isEnabled(),true);assert.equal(await page.locator('.result-card').count(),3);assert.equal(await page.locator('.live-scene').isVisible(),true);
  await page.locator('#liquidSearch').fill('Virgnia');assert.ok(await page.locator('[data-liquid-picker="liquid"] [data-lp-count]').textContent().then(t=>t.includes('Nicio potrivire exactă')||t.includes('0 din')));await page.locator('#liquidSearch').press('Escape');await page.locator('#liquidSearch').press('Enter');assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.currentLiquid().name),'Balkan Mixture');
  await page.locator('#liquidSearch').fill('Mixture Balkan');await shot(page,'smart-liquid-'+width+'.png');await page.locator('#liquidSearch').press('Escape');
  assert.equal(await page.locator('#liquidComparison .comparison-track').count(),21,'Three actual atomizers on seven model signals');
  await chartShot(page,page.locator('#liquidComparison .sensory-comparison'),'flow-liquid-comparison-'+width+'.png');
  await page.locator(nav+' [data-route="atomizer"]').click();
  await page.locator('#atlasPlatform').selectOption('klp');await page.locator('#atlasWire').selectOption('k128');await page.locator('#atlasObjective').selectOption('th');
  const assertTop=async()=>assert.equal(await page.evaluate(()=>JSON.stringify([...document.querySelectorAll('#atlasTopLiquids [data-context-liquid]')].map(b=>Number(b.dataset.contextLiquid)))===JSON.stringify(window.RTA_SENSORY_CORE.matchLiquids(window.RTA_ATLAS_MODULES.state.config,window.RTA_LIQUIDS,window.RTA_ATLAS_MODULES.state.objective,5).map(r=>r.index))),true,'Top five must follow the exact current full config and objective');
  await assertTop();await page.locator('#atlasTopLiquids').scrollIntoViewIfNeeded();await shot(page,'smart-atlas-top5-'+width+'.png');
  await page.locator('#atlasWire').selectOption('nife52');await page.locator('#atlasObjective').selectOption('layers');await assertTop();
  let config=await page.evaluate(()=>JSON.stringify(window.RTA_ATLAS_MODULES.state.config));
  const choose=async(prefix,index)=>{const l=await page.evaluate(i=>window.RTA_LIQUIDS[i],index);await page.locator('#'+prefix+'LiquidSearch').fill(l.brand+' '+l.name);const opt=page.locator('#'+prefix+'LiquidOptions [data-lp-index="'+index+'"]');if(await opt.count()===0){await page.locator('#'+prefix+'LiquidOptions [data-lp-page="1"]').click();}await opt.click();assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.state.liquidIndex),index);};
  await choose('atlas',619);assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.state.route),'atomizer');assert.equal(await page.evaluate(()=>JSON.stringify(window.RTA_ATLAS_MODULES.state.config)),config);await assertTop();await chartShot(page,page.locator('.material-paths .sensory-comparison'),'flow-atlas-comparison-'+width+'.png');await page.evaluate(()=>scrollTo(0,0));await shot(page,'smart-atlas-picker-'+width+'.png');
  await page.locator(nav+' [data-route="wire"]').click();await page.locator('#wireAtom').selectOption('dvarwcl');await page.locator('#wireMaterial').selectOption('k128');await page.locator('#wireAir').selectOption('triple06');config=await page.evaluate(()=>JSON.stringify(window.RTA_ATLAS_MODULES.state.config));await choose('wire',0);assert.equal(await page.evaluate(()=>JSON.stringify(window.RTA_ATLAS_MODULES.state.config)),config);assert.equal(decodeURIComponent(await page.locator('#pageWire [data-duel-pick]').first().getAttribute('data-duel-pick')),config,'Current Wire configuration must be the actual Duel payload');assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.state.route),'wire');await chartShot(page,page.locator('#pageWire .sensory-comparison').first(),'flow-wire-comparison-'+width+'.png');await shot(page,'smart-wire-picker-'+width+'.png');
  await page.locator(nav+' [data-route="duel"]').click();await page.locator('[data-duel-confirm="left"]').click();await page.locator('[data-duel-confirm="right"]').click();
  const duel=await page.evaluate(()=>JSON.stringify([window.RTA_ATLAS_DUEL.state.left,window.RTA_ATLAS_DUEL.state.right,window.RTA_ATLAS_DUEL.state.picked]));await choose('duel',619);await page.locator('#duelObjective').selectOption('smooth');assert.equal(await page.evaluate(()=>JSON.stringify([window.RTA_ATLAS_DUEL.state.left,window.RTA_ATLAS_DUEL.state.right,window.RTA_ATLAS_DUEL.state.picked])),duel);assert.equal(await page.evaluate(()=>window.RTA_ATLAS_DUEL.compare().liquid===window.RTA_LIQUIDS[619]),true);await page.evaluate(()=>scrollTo(0,0));await shot(page,'smart-duel-picker-'+width+'.png');await chartShot(page,page.locator('#pageDuel .sensory-comparison'),'flow-duel-comparison-'+width+'.png');
  await page.locator(nav+' [data-route="market"]').click();await page.locator('[data-market-category="all"]').click();await page.locator('#marketSearch').fill('Tribeca Halo');assert.equal(await page.locator('.market-card').count(),1);
  const kept=await page.evaluate(()=>JSON.stringify([window.RTA_ATLAS_PREVIEW.state.liquidIndex,window.RTA_ATLAS_MODULES.state.config,window.RTA_ATLAS_DUEL.state.left,window.RTA_ATLAS_DUEL.state.right]));
  for(const previous of ['duel','wire','atomizer','liquid','home']){
   assert.equal(await page.locator('#atlasBack').isVisible(),true);await page.locator('#atlasBack').click();await page.waitForFunction(route=>window.RTA_ATLAS_PREVIEW.state.route===route,previous);
   assert.equal(await page.evaluate(()=>JSON.stringify([window.RTA_ATLAS_PREVIEW.state.liquidIndex,window.RTA_ATLAS_MODULES.state.config,window.RTA_ATLAS_DUEL.state.left,window.RTA_ATLAS_DUEL.state.right])),kept,'Back must retain liquid and all configurations');
  }
  assert.equal(await page.locator('#atlasBack').isVisible(),false);
  await page.locator(nav+' [data-route="wire"]').click();await page.locator('#pageWire .context-settings summary').click();await page.locator('#pageWire [data-context-field="moment"]').selectOption('coffee');
  assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.state.route),'wire');assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.state.moment),'coffee');
  assert.equal(await page.evaluate(()=>JSON.stringify([window.RTA_ATLAS_PREVIEW.state.liquidIndex,window.RTA_ATLAS_MODULES.state.config,window.RTA_ATLAS_DUEL.state.left,window.RTA_ATLAS_DUEL.state.right])),kept,'Context edits must preserve configurations');
  await page.evaluate(()=>scrollTo(0,0));await shot(page,'flow-wire-context-'+width+'.png');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await page.evaluate(key=>localStorage.getItem(key),storageKey),saved);
  // Old installed launch URLs now land in Atlas; explicit V10 and its tool anchors still work.
  await page.goto(origin+'/rta-lab/?v=10');await page.waitForURL(/\/rta-lab\/atlas\/\?v=guided-20261015$/);await page.waitForSelector('#matchButton',{state:'attached'});
  await page.goto(origin+'/rta-lab/?view=v10');await page.waitForFunction(()=>window.RTA_LIQUIDS?.length===620&&window.RTA_HOME_UI);assert.ok(page.url().includes('?view=v10'));
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),storageKey),saved);assert.equal(errors.length,0,errors.join(' | '));await context.close();
 }
 const recovering=await browser.newContext({viewport:{width:390,height:844}}),recoverPage=await recovering.newPage();let aborted=0;
 await recovering.route('**/data/liquids-2a.js?*',route=>{if(aborted++===0)return route.abort();return route.continue();});
 await recoverPage.goto(origin+'/rta-lab/atlas/#liquid');await recoverPage.waitForFunction(()=>!!window.RTA_ATLAS_PREVIEW&&window.RTA_LIQUIDS?.length===620&&!document.querySelector('.atlas-unavailable'),null,{timeout:30000});
 assert.ok(aborted>=1,'The first incomplete load must actually be injected');assert.equal(await recoverPage.locator('#liquidSearch').inputValue(),'');assert.equal(await recoverPage.locator('.result-card').count(),0);
 await shot(recoverPage,'flow-recovered-incomplete-390.png');await recovering.close();
 console.log('ATLAS FILTERS VISUAL PASS: explicit liquid-first entry, wire-first full compatibility, three material paths with exact top-five liquids, model charts, inline context, Back with state/CL preservation, incomplete-load recovery and current entry.');
}finally{await browser.close();await new Promise(r=>server.close(r));}}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
