#!/usr/bin/env node
'use strict';
// All measurements below are synthetic and exist only in memory, on loopback.
// Never publish these fixtures to data/ or use them as Google search statistics.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const core=require('../assets/market-google-pod-top20-core');
const proof=require('../assets/market-google-pod-top20-proof');
const {toPublic}=require('./collect-google-pod-top20');
const {chromium}=require('playwright');
const outDir='test-results/google-pod';fs.mkdirSync(outDir,{recursive:true});
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const results=[];
function check(name,fn){fn();results.push({name,status:'passed'});}
const publicPath='data/google-pod-top20-2026.json',original=digest(fs.readFileSync(publicPath));
const months=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
function fixture(){
 const now=new Date(),collected_at=new Date(now.getTime()-1000).toISOString();
 const models=Array.from({length:25},(_,i)=>{const brand='TEST ONLY',model='SYNTHETIC '+String(i).padStart(2,'0');return{id:core.norm(brand)+'|'+core.norm(model),brand,model,query:brand+' '+model};});
 const evidence={schema_version:1,collected_at,api_version:'v25',country:'RO',network:'GOOGLE_SEARCH',geo_target:'geoTargetConstants/2642',language_filter:'not_set',models,results:models.map((m,i)=>{
  const volume=i===1?1000:i===20?810:1000-10*i;
  return{text:m.query,closeVariants:[],keywordMetrics:{avgMonthlySearches:String(volume),monthlySearchVolumes:Array.from({length:12},(_,k)=>{const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-12+k,1));return{year:d.getUTCFullYear(),month:months[d.getUTCMonth()],monthlySearches:String(volume)};})}};
 })};
 const text=JSON.stringify(evidence,null,2)+'\n',hash=digest(text);
 const data=toPublic(core.project(models,{results:evidence.results},{collected_at,geo_target:evidence.geo_target,response_sha256:hash}),hash);
 data.source.api_version='v25';data.source.language_filter='not_set';return{data,evidence,text};
}
const good=fixture();
check('Projection reconciles with upstream evidence',()=>assert.equal(proof.verify(good.data,good.evidence).ok,true));
for(const[name,change]of[
 ['Changed volume',x=>x.data.rows[0].monthly_searches++],['Changed brand',x=>x.data.rows[0].brand='OTHER'],['Changed trend',x=>x.data.rows[0].trend_pct=42],['Changed monthly series',x=>x.data.rows[0].monthly_series[0].searches++],['Changed universe',x=>x.data.coverage.models_requested++],['Wrong evidence country',x=>x.evidence.country='US'],['Wrong evidence network',x=>x.evidence.network='GOOGLE_SEARCH_AND_PARTNERS'],['Different geo target',x=>x.data.source.geo_target='geoTargetConstants/2840'],['Different collection timestamp',x=>x.data.last_updated='2026-01-01'],['Misleading period label',x=>x.data.period.label='Other period'],['Unmapped query',x=>x.evidence.models[0].query='ANOTHER QUERY'],['Duplicate inventory',x=>x.evidence.models.push(x.evidence.models[0])],['Missing measurement',x=>x.data.rows.pop()],['Null upstream average',x=>x.evidence.results[0].keywordMetrics.avgMonthlySearches=null],['Wrong acquisition',x=>x.data.source.acquisition='editorial_guess']
])check(name,()=>{const x=clone(good);change(x);assert.equal(proof.verify(x.data,x.evidence).ok,false);});
let state='missing';
function payload(){const x=clone(good);if(state==='tampered')x.data.rows[0].monthly_searches++;if(state==='bad-hash')x.data.source.evidence_sha256='b'.repeat(64);return x;}
const harness='<!doctype html><html lang="ro"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Top20 isolated UI QA</title><style>body{margin:0;padding:16px;background:#101216;color:#eee;font-family:Arial,sans-serif}*{box-sizing:border-box}main{max-width:1200px;margin:auto}h1{font-size:14px}#market2026Root{min-width:0}</style><body><main><h1>TEST INTERFAȚĂ — DATE SINTETICE, NU CLASAMENT REAL</h1><div id="market2026Root"><div class="market-hero">Test hero</div><section id="marketManagementCockpit"><h2>Analysis fixture</h2></section><section id="marketHypeRadar"><h2>Hype fixture</h2></section><section id="marketSourceInfo"><h2>Source fixture</h2></section><div id="market2026Body">Technical fixture</div></div></main><script src="/assets/market-view-switcher.js"></script></body></html>';
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(harness);return;}
 if(pathname==='/data/google-pod-top20-2026.json'){
  if(state==='http-error'){res.writeHead(503);res.end('Test service unavailable');return;}
  const current=state,x=payload();if(current==='delayed')await new Promise(r=>setTimeout(r,700));res.setHeader('Content-Type','application/json');res.end(JSON.stringify(current==='missing'?{status:'configuration_required',rows:[],source:{provider:'Google Ads Keyword Planner'},display:{unavailable_message:'TEST: source not configured'}}:x.data));return;
 }
 if(pathname.startsWith('/data/google-pod-evidence/')){res.setHeader('Content-Type','application/json');res.end(good.text);return;}
 if(/^\/assets\/market-[a-z0-9-]+\.(?:js|css)$/.test(pathname)){const file=path.join(process.cwd(),pathname.slice(1));if(fs.existsSync(file)){res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8');res.end(fs.readFileSync(file));return;}}
 res.writeHead(404);res.end('Not found');
});
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of[1366,390]){
   const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
   await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
   const page=await context.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
   async function top(){await page.locator('[data-primary="top20"]').click();}
   async function fresh(s){state=s;await page.goto(origin);await page.locator('[data-primary="top20"]').waitFor();await top();}
   await fresh('missing');await page.locator('.market-top20-blocked').waitFor();assert.equal(await page.locator('.market-top20-table').count(),0);results.push({name:width+'px: unavailable source is not a ranking',status:'passed'});
   state='ok';await page.locator('[data-top20-retry]').click();await page.locator('.market-top20-table tbody tr').first().waitFor();assert.equal(await page.locator('.market-top20-table tbody tr').count(),20);assert.deepEqual(await page.locator('.market-top20-rank').allTextContents(),['1','1','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20']);results.push({name:width+'px: retry, 20 rows and shared ranks',status:'passed'});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,'Page overflows at '+width);await page.screenshot({path:outDir+'/synthetic-ui-'+width+'.png',fullPage:true});
   for(const next of['hype','analysis','sources','top20']){await page.locator('[data-primary="'+next+'"]').click();assert.equal(await page.locator('[data-primary="'+next+'"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#marketTop20Pod').isVisible(),next==='top20');}
   await page.evaluate(()=>{document.dispatchEvent(new CustomEvent('rta:market:hydrate'));document.dispatchEvent(new CustomEvent('rta:market:ready'));});assert.equal(await page.locator('#marketViewSwitcher').count(),1);assert.equal(await page.locator('#marketTop20Pod').isVisible(),true);results.push({name:width+'px: navigation and repeated hydration',status:'passed'});
   for(const bad of['tampered','bad-hash','http-error']){await fresh(bad);await page.locator('#marketTop20Pod.error').waitFor();assert.equal(await page.locator('.market-top20-table').count(),0);results.push({name:width+'px: '+bad+' blocked',status:'passed'});}
   state='ok';await page.locator('[data-top20-retry]').click();await page.locator('.market-top20-table tbody tr').first().waitFor();
   await fresh('delayed');await page.locator('[data-primary="hype"]').click();await page.locator('#marketTop20Pod').waitFor({state:'attached'});assert.equal(await page.locator('#marketTop20Pod').isVisible(),false);assert.equal(await page.locator('#marketHypeRadar').isVisible(),true);results.push({name:width+'px: late response cannot replace active tab',status:'passed'});
   assert.deepEqual(pageErrors,[]);await context.close();
  }
  assert.equal(digest(fs.readFileSync(publicPath)),original,'Public measurements changed during QA');results.push({name:'Public data untouched by synthetic QA',status:'passed'});
  fs.writeFileSync(outDir+'/result.json',JSON.stringify({status:'passed',tested_at:new Date().toISOString(),fixture_notice:'SYNTHETIC ONLY; no Google account was contacted',checks:results.length,results},null,2));console.log('Google Pod: '+results.length+' evidence and browser checks passed (1366px / 390px). Synthetic data were never published.');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{fs.writeFileSync(outDir+'/failure.json',JSON.stringify({error:e.message,stack:e.stack,results},null,2));console.error(e);server.close();process.exitCode=1;});
