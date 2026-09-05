#!/usr/bin/env node
'use strict';

const fs=require('fs');
const crypto=require('crypto');
const zlib=require('zlib');
const {execFile}=require('child_process');
const {promisify}=require('util');
const {snapshotReferenceMs}=require('./hype-window-reference-2026.js');
const {classifyPodProduct,decode,norm}=require('./market-pod-classifier-2026.js');
const {canonicalizeProduct}=require('./market-product-canonical-2026.js');
const {classifyRtaAccessory}=require('./market-hype-accessory-classifier-2026.js');

const WRITE=process.argv.includes('--write');
const SUMMARY_ONLY=process.argv.includes('--summary-only');
const SOURCE_FILTER=(process.argv.find(function(arg){return arg.startsWith('--source=')})||'').slice(9);
const SOURCE_FILE='data/market-hype-sources-2026.json';
const RTA_FILE='data/market-hype-products-2026.json';
const POD_FILE='data/market-hype-pods-2026.json';
const OUT_FILE='data/market-hype-direct-catalogs-2026.json';
const REF=snapshotReferenceMs();
const DAY=86400000;
const PUBLIC_DAYS=30;
const CONTEXT_DAYS=180;
const USER_AGENT='Mozilla/5.0 (compatible; Ghid-RTA-Direct-Catalog/1.3; +https://ghid-rta.ro/)';
const execFileAsync=promisify(execFile);

const DEFAULT_SOURCES=[
  {id:'2fdeal-rta-listings',baseUrl:'https://www.2fdeal.com',label:'2FDeal RTA listings',sourceType:'clone-retailer-listing',catalogType:'html-listings',official:false,scopes:['RTA'],pages:Array.from({length:8},function(_,index){return'/c/rta_0376/'+(index+1)+'.html'})},
  {id:'3fvape-rta-listings',baseUrl:'https://www.3fvape.com',label:'3FVape RTA listings',sourceType:'clone-retailer-listing',catalogType:'html-listings',official:false,scopes:['RTA'],pages:['/115-rta?n=383']},
  {id:'beast-clone-catalog',baseUrl:'https://beast-8888.myshopify.com',label:'BEAST clone catalog',sourceType:'clone-retailer-direct',official:false,scopes:['RTA','MODURI','ACCESORII']},
  {id:'oxva-official-store',baseUrl:'https://store.oxva.com',label:'OXVA official store',brandHint:'OXVA',sourceType:'manufacturer-official-store',official:true,scopes:['POD']},
  {id:'vaporesso-official-store',baseUrl:'https://store.vaporesso.com',label:'Vaporesso official store',brandHint:'Vaporesso',sourceType:'manufacturer-official-store',official:true,scopes:['POD','MODURI']},
  {id:'geekvape-official-store',baseUrl:'https://store.geekvape.com',label:'Geekvape official store',brandHint:'Geekvape',sourceType:'manufacturer-official-store',official:true,scopes:['POD','MODURI','RTA']},
  {id:'dotmod-official-store',baseUrl:'https://www.dotmod.com',label:'dotMod official store',brandHint:'DotMod',sourceType:'manufacturer-official-store',official:true,scopes:['POD','MODURI','RTA','ACCESORII']},
  {id:'wotofo-official-store',baseUrl:'https://wotofo.com',label:'Wotofo official store',brandHint:'Wotofo',sourceType:'manufacturer-official-store',official:true,scopes:['POD','MODURI','RTA','ACCESORII']},
  {id:'naturevape-retail-catalog',baseUrl:'https://naturevape.co.uk',label:'NatureVape catalog',sourceType:'retailer-direct',official:false,scopes:['RTA','MODURI','POD','ACCESORII']},
  {id:'vaping-gentlemen-direct',baseUrl:'https://thevapinggentlemen.club',label:'The Vaping Gentlemen Club catalog',sourceType:'retailer-direct',official:false,scopes:['RTA','MODURI','POD','ACCESORII']},
  {id:'vaping101-direct',baseUrl:'https://vaping101.co.uk',label:'Vaping 101 catalog',sourceType:'retailer-direct',official:false,scopes:['RTA','MODURI','POD','ACCESORII']},
  {id:'vape-superstore-direct',baseUrl:'https://vapesuperstore.co.uk',label:'Vape Superstore catalog',sourceType:'retailer-direct',official:false,scopes:['MODURI','POD']},
  {id:'uk-ecig-store-direct',baseUrl:'https://ukecigstore.com',label:'UK ECIG STORE catalog',sourceType:'retailer-direct',official:false,scopes:['MODURI','POD']},
  {id:'ecigone-direct',baseUrl:'https://www.ecigone.co.uk',label:'Ecigone catalog',sourceType:'retailer-direct',official:false,scopes:['RTA','MODURI','POD','ACCESORII']},
  {id:'atmizoo-official-catalog',baseUrl:'https://www.atmizoo.com',label:'Atmizoo official catalog',brandHint:'Atmizoo',sourceType:'manufacturer-official-catalog',catalogType:'wordpress-products-json',official:true,scopes:['RTA','MODURI','POD','ACCESORII']},
  {id:'cthulhu-official-catalog',baseUrl:'https://www.cthulhumod.com',label:'Cthulhu Mod official catalog',brandHint:'Cthulhu Mod',sourceType:'manufacturer-official-catalog',catalogType:'sitemap-jsonld-products',directCatalogEnabled:false,directCatalogReason:'official-site-http-521-use-search-index-and-dated-news',official:true,scopes:['RTA','MODURI','POD','ACCESORII']},
  {id:'fakirs-official-catalog',baseUrl:'https://www.fakirsmods.com',label:'Fakirs Mods official catalog',brandHint:'Fakirs Mods',sourceType:'manufacturer-official-catalog',catalogType:'wordpress-products-json',official:true,scopes:['RTA','MODURI','ACCESORII']},
  {id:'centenary-official-catalog',baseUrl:'https://centenarymods.com',label:'Centenary Mods official catalog',brandHint:'Centenary Mods',sourceType:'manufacturer-official-catalog',catalogType:'wordpress-products-json',official:true,scopes:['RTA','MODURI','ACCESORII']},
  {id:'gus-official-catalog',baseUrl:'https://www.gus-mod.com',label:'GUS Mods official catalog',brandHint:'GUS Mods',sourceType:'manufacturer-official-catalog',catalogType:'wordpress-products-json',official:true,scopes:['RTA','MODURI','ACCESORII']},
  {id:'lost-vape-official-catalog',baseUrl:'https://lostvape.com',label:'Lost Vape official catalog',brandHint:'Lost Vape',sourceType:'manufacturer-official-catalog',catalogType:'wordpress-products-json',official:true,scopes:['MODURI','POD','ACCESORII']}
];

function read(file,fallback={}){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function save(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function hash(value){return crypto.createHash('sha256').update(String(value||'')).digest('hex').slice(0,20)}
function iso(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)?new Date(ms).toISOString():null}
function ageDays(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)?(REF-ms)/DAY:null}
function inPast(value,days){const age=ageDays(value);return age!=null&&age>=0&&age<=days}
function inFuture(value,days){const ms=Date.parse(String(value||''));return Number.isFinite(ms)&&ms>REF&&ms-REF<=days*DAY}
function unique(values){return Array.from(new Set((values||[]).filter(Boolean)))}
function cleanTitle(value){return decode(value).replace(/^Authentic\s+/i,'').replace(/\s+/g,' ').trim().slice(0,180)}
function productUrl(source,product){return source.baseUrl.replace(/\/$/,'')+'/products/'+encodeURIComponent(String(product.handle||'')).replace(/%2F/gi,'/')}

async function fetchJson(url,timeout=15000){
  const controller=new AbortController(),timer=setTimeout(function(){controller.abort()},timeout);
  try{
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':USER_AGENT,'accept':'application/json,text/plain;q=.8,*/*;q=.5','cache-control':'no-cache'},signal:controller.signal});
    const text=await response.text();
    if(!response.ok)throw new Error('HTTP '+response.status);
    const parsed=JSON.parse(text);
    if(!parsed||!Array.isArray(parsed.products))throw new Error('not-shopify-products-json');
    return parsed.products;
  }catch(primaryError){
    try{
      const parsed=JSON.parse(await fetchWithCurl(url,timeout*2,'application/json,text/plain;q=.8,*/*;q=.5'));
      if(!parsed||!Array.isArray(parsed.products))throw new Error('not-shopify-products-json');
      return parsed.products;
    }catch(curlError){throw combinedTransportError(primaryError,curlError)}
  }finally{clearTimeout(timer)}
}

async function fetchJsonDocument(url,timeout=15000){
  const controller=new AbortController(),timer=setTimeout(function(){controller.abort()},timeout);
  try{
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':USER_AGENT,'accept':'application/json,text/plain;q=.8,*/*;q=.5','cache-control':'no-cache'},signal:controller.signal});
    const text=await response.text();
    if(!response.ok)throw new Error('HTTP '+response.status);
    return JSON.parse(text);
  }catch(primaryError){
    try{return JSON.parse(await fetchWithCurl(url,timeout*2,'application/json,text/plain;q=.8,*/*;q=.5'))}
    catch(curlError){throw combinedTransportError(primaryError,curlError)}
  }finally{clearTimeout(timer)}
}

async function fetchText(url,timeout=18000){
  const controller=new AbortController(),timer=setTimeout(function(){controller.abort()},timeout);
  try{
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':USER_AGENT,'accept':'text/html,application/xhtml+xml,*/*;q=.6','cache-control':'no-cache'},signal:controller.signal});
    const bytes=Buffer.from(await response.arrayBuffer()),gzip=/\.gz(?:\?|$)/i.test(response.url||url)||bytes.length>2&&bytes[0]===0x1f&&bytes[1]===0x8b;
    const text=(gzip?zlib.gunzipSync(bytes):bytes).toString('utf8');
    if(!response.ok)throw new Error('HTTP '+response.status);
    return{url:response.url||url,text};
  }catch(primaryError){
    try{return{url,text:await fetchWithCurl(url,timeout*2,'text/html,application/xhtml+xml,*/*;q=.6')}}
    catch(curlError){throw combinedTransportError(primaryError,curlError)}
  }finally{clearTimeout(timer)}
}

async function fetchWithCurl(url,timeout,accept){
  const command=process.platform==='win32'?'curl.exe':'curl',seconds=String(Math.max(5,Math.ceil(timeout/1000)));
  const result=await execFileAsync(command,['-L','--compressed','-sS','--fail-with-body','--max-time',seconds,'-A',USER_AGENT,'-H','Accept: '+accept,String(url)],{timeout:timeout+5000,maxBuffer:30*1024*1024,windowsHide:true});
  return String(result.stdout||'');
}

function combinedTransportError(primary,curl){return new Error('fetch='+String(primary&&primary.message||primary)+'; curl='+String(curl&&curl.message||curl))}

function wait(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
async function fetchTextWithRetry(url,attempts=3){let lastError=null;for(let attempt=1;attempt<=attempts;attempt++){try{return await fetchText(url)}catch(error){lastError=error;if(attempt<attempts)await wait(attempt*700)}}throw lastError||new Error('fetch-failed')}
async function pool(items,width,worker){let cursor=0;const output=new Array(items.length);async function run(){for(;;){const index=cursor++;if(index>=items.length)return;try{output[index]=await worker(items[index])}catch(error){output[index]={ok:false,error:String(error&&error.message||error)}}}}await Promise.all(Array.from({length:Math.min(width,Math.max(1,items.length))},run));return output}
async function sourceRun(source,collect=collectSource){try{return{source,products:await collect(source),ok:true,attempts:1,recoveredByRetry:false}}catch(error){return{source,products:[],ok:false,error:String(error&&error.message||error),attempts:1,recoveredByRetry:false}}}
async function collectSourcesWithRetry(sources,options={}){
  const collect=options.collect||collectSource,width=Number(options.width||4),retryWidth=Number(options.retryWidth||2),retryDelayMs=options.retryDelayMs==null?1400:Number(options.retryDelayMs);
  const runs=await pool(sources,width,function(source){return sourceRun(source,collect)}),failed=[];
  runs.forEach(function(run,index){if(!run.ok)failed.push({source:run.source,index})});
  if(!failed.length)return{runs,recovered:0};
  if(retryDelayMs>0)await wait(retryDelayMs);
  const retries=await pool(failed,retryWidth,async function(entry){const retry=await sourceRun(entry.source,collect);retry.attempts=2;retry.recoveredByRetry=retry.ok;return{index:entry.index,retry}});
  let recovered=0;for(const row of retries){if(row&&row.retry){if(row.retry.ok)recovered++;runs[row.index]=row.retry}}
  return{runs,recovered};
}
function xmlLocs(value){return Array.from(String(value||'').matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi),function(match){return decode(match[1])}).filter(Boolean)}
function safeRegex(value){try{return new RegExp(String(value),'i')}catch(_){return null}}
function patterns(values){return(values||[]).map(safeRegex).filter(Boolean)}
function pageTitleFromUrl(value){try{const url=new URL(value),parts=url.pathname.split('/').filter(Boolean).filter(function(part){return !/^(?:en|de|fr|es|it|ro|ru|pl|id|ar|vi|ja|ko|th|pt|fil)$/i.test(part)}),last=parts.pop()||'';return cleanTitle(decodeURIComponent(last).replace(/\.(?:html?|php|aspx?)$/i,'').replace(/(mtl|rdl|dl)?rta\b/gi,' $1 rta ').replace(/\brdta\b/gi,' rdta ').replace(/modv(?=\d)/gi,' mod v').replace(/[-_]+/g,' '))}catch(_){return''}}
function metaContent(html,key){const escaped=String(key).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),patterns=[new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,'i'),new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,'i')];for(const pattern of patterns){const match=String(html||'').match(pattern);if(match)return decode(match[1])}return''}
function jsonLdProducts(html){const output=[];function visit(value){if(Array.isArray(value)){value.forEach(visit);return}if(!value||typeof value!=='object')return;const types=Array.isArray(value['@type'])?value['@type']:[value['@type']];if(types.some(function(type){return String(type).toLowerCase()==='product'}))output.push(value);for(const key of ['@graph','mainEntity','itemListElement','subjectOf'])if(value[key])visit(value[key])}for(const match of String(html||'').matchAll(/<script\b[^>]*type=["']application\/ld\+json[^"']*["'][^>]*>([\s\S]*?)<\/script>/gi)){try{visit(JSON.parse(match[1].replace(/^\s*<!--|-->\s*$/g,'')))}catch(_){}}return output}
function firstValue(value){if(Array.isArray(value))return firstValue(value[0]);if(value&&typeof value==='object')return value.url||value.contentUrl||value.name||'';return value||''}
function productFromPage(source,url,html){
  const structured=jsonLdProducts(html)[0]||{},offers=Array.isArray(structured.offers)?structured.offers[0]:structured.offers||{},availabilityText=String(offers.availability||''),available=/InStock|PreOrder|PreSale|LimitedAvailability/i.test(availabilityText)?true:/OutOfStock|SoldOut|Discontinued/i.test(availabilityText)?false:null;
  const title=cleanTitle(structured.name||metaContent(html,'og:title')||metaContent(html,'twitter:title')||pageTitleFromUrl(url)),brand=firstValue(structured.brand)||source.brandHint||source.label,description=decode(structured.description||metaContent(html,'og:description')||metaContent(html,'description')||''),imageUrl=firstValue(structured.image)||metaContent(html,'og:image')||metaContent(html,'twitter:image')||'',price=Number(offers.price||offers.lowPrice||metaContent(html,'product:price:amount')),currency=offers.priceCurrency||metaContent(html,'product:price:currency')||source.currency||null,category=firstValue(structured.category)||source.defaultProductType||'';
  return{id:hash(source.id+'|'+url),title,handle:'',vendor:brand,product_type:category,body_html:description,url,published_at:null,created_at:null,updated_at:null,variants:Number.isFinite(price)?[{price,available}]:available==null?[]:[{price:null,available}],images:imageUrl?[{src:imageUrl}]:[],__catalogListing:true,__sitemapListing:true};
}
function likelyProductUrl(source,value){
  let url;try{url=new URL(value)}catch(_){return false}const path=url.pathname,include=patterns(source.includeUrlPatterns),exclude=patterns(source.excludeUrlPatterns||['/(?:blog|news|article|video|support|about|contact|faq|download|store-locator|privacy|terms|category|tag|author)/','\.(?:jpg|jpeg|png|webp|gif|svg|pdf|zip)$']);if(exclude.some(function(pattern){return pattern.test(path)}))return false;if(include.length)return include.some(function(pattern){return pattern.test(path)});
  if(/\/(?:products?|shop|pod-systems?|pod-kits?|mods?|atomizers?|atomisers?|rta|devices?|kits?)\//i.test(path))return true;
  const title=pageTitleFromUrl(value);return Boolean(title&&classifyProduct(source,{title,vendor:source.brandHint||'',product_type:source.defaultProductType||'',body_html:''}));
}
function productUrlPriority(source,value){const scopes=source.scopes||[],text=norm(pageTitleFromUrl(value)+' '+value);let score=0;if(scopes.includes('RTA')&&/\b(?:rta|rebuildable tank|atomizer|atomiser|kayfun|aromamizer)\b/.test(text))score+=12;if(scopes.includes('MODURI')&&/\b(?:mod|sbs|side by side|squonk)\b/.test(text))score+=10;if(scopes.includes('POD')&&/\b(?:pod|aio|starter kit|device)\b/.test(text))score+=8;if(scopes.includes('ACCESORII')&&/\b(?:deck|air pin|airflow|insert|chamber|chimney|tank|glass|drip tip|accessor)\b/.test(text))score+=5;if(/\/products?\//i.test(value))score+=2;return score}
async function collectSitemapSource(source){
  const initial=(source.sitemapPaths&&source.sitemapPaths.length?source.sitemapPaths:['/sitemap.xml','/sitemap_index.xml','/wp-sitemap.xml']).map(function(value){return new URL(value,source.baseUrl).toString()}),queue=initial.slice(),seen=new Set(),pageUrls=new Set(),sitemapRuns=[],maxFiles=Number(source.maxSitemapFiles||12);
  while(queue.length&&seen.size<maxFiles){const target=queue.shift();if(seen.has(target))continue;seen.add(target);try{const response=await fetchTextWithRetry(target,2),locs=xmlLocs(response.text),isIndex=/<sitemapindex\b/i.test(response.text)||locs.length&&locs.every(function(url){return /(?:sitemap|\.xml(?:\.gz)?)(?:\?|$)/i.test(url)});sitemapRuns.push({url:target,ok:true,locations:locs.length});if(isIndex){const nested=locs.filter(function(url){return /(?:sitemap|\.xml(?:\.gz)?)(?:\?|$)/i.test(url)}).sort(function(a,b){return Number(/product|shop|pod|rta|mod/i.test(b))-Number(/product|shop|pod|rta|mod/i.test(a))});for(const url of nested)if(!seen.has(url)&&!queue.includes(url))queue.push(url)}else for(const url of locs)pageUrls.add(url)}catch(error){sitemapRuns.push({url:target,ok:false,error:String(error&&error.message||error)})}}
  const candidates=Array.from(pageUrls).filter(function(url){return likelyProductUrl(source,url)}).sort(function(a,b){return productUrlPriority(source,b)-productUrlPriority(source,a)||a.localeCompare(b)}).slice(0,Number(source.maxProductPages||120)),pageRuns=await pool(candidates,Number(source.pageConcurrency||6),async function(url){try{const response=await fetchTextWithRetry(url,2),product=productFromPage(source,response.url,response.text);if(classifyProduct(source,product))return{ok:true,product};const fallback=productFromPage(source,url,'');return classifyProduct(source,fallback)?{ok:true,product:fallback,fallback:true}:{ok:false,error:'not-target-product'}}catch(error){const product=productFromPage(source,url,'');return classifyProduct(source,product)?{ok:true,product,fallback:true}:{ok:false,error:String(error&&error.message||error)}}}),products=pageRuns.filter(function(run){return run&&run.ok&&run.product}).map(function(run){return run.product});
  if(!products.length)throw new Error('no-target-products-from-sitemap candidates='+candidates.length+' urls='+pageUrls.size+' sitemaps='+sitemapRuns.filter(function(run){return run.ok}).length+'/'+seen.size);products.adapterUsed='sitemap-jsonld-products';products.pageStats={sitemapsTried:seen.size,sitemapsWorking:sitemapRuns.filter(function(run){return run.ok}).length,urlsDiscovered:pageUrls.size,productCandidates:candidates.length,productPagesWorking:pageRuns.filter(function(run){return run&&run.ok}).length,failedSitemaps:sitemapRuns.filter(function(run){return!run.ok})};return products;
}
function htmlListings(source,html,pageUrl){
  const rows=[];
  for(const match of String(html||'').matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
    let url;try{url=new URL(decode(match[1]),pageUrl)}catch(_){continue}
    const title=cleanTitle(match[2]);if(!title)continue;
    const host=url.hostname.replace(/^www\./,'').toLowerCase(),path=url.pathname;
    const is3f=host==='3fvape.com'&&/^\/rta\//.test(path),is2f=host==='2fdeal.com'&&/_p\d+\.html$/i.test(path);
    if(!is3f&&!is2f||!/\brta\b|rebuildable tank (?:atomizer|atomiser)/i.test(title))continue;
    if(accessoryOnly(title))continue;
    rows.push({id:hash(source.id+'|'+url.origin+path),title,handle:'',vendor:'',product_type:'',body_html:'',url:url.origin+path,__catalogListing:true});
  }
  return Array.from(new Map(rows.map(function(row){return[row.url,row]})).values());
}

function navigationProductLinks(source,html,pageUrl){
  const urls=[];
  for(const match of String(html||'').matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)){
    let url;try{url=new URL(decode(match[1]),pageUrl).toString()}catch(_){continue}
    if(likelyProductUrl(source,url))urls.push(url);
  }
  return Array.from(new Set(urls));
}

async function collectNavigationSource(source){
  const pages=Array.isArray(source.pages)&&source.pages.length?source.pages:['/'],links=new Set(),pageRuns=[];
  for(const page of pages){const target=new URL(page,source.baseUrl).toString();try{const response=await fetchTextWithRetry(target);for(const url of navigationProductLinks(source,response.text,response.url))links.add(url);pageRuns.push({url:target,ok:true})}catch(error){pageRuns.push({url:target,ok:false,error:String(error&&error.message||error)})}}
  const candidates=Array.from(links).sort(function(a,b){return productUrlPriority(source,b)-productUrlPriority(source,a)||a.localeCompare(b)}).slice(0,Number(source.maxProductPages||120));
  const productRuns=await pool(candidates,Number(source.pageConcurrency||6),async function(url){try{const response=await fetchTextWithRetry(url,2),product=productFromPage(source,response.url,response.text);return classifyProduct(source,product)?{ok:true,product}:{ok:false,error:'not-target-product'}}catch(error){return{ok:false,error:String(error&&error.message||error)}}});
  const products=productRuns.filter(function(run){return run&&run.ok}).map(function(run){return run.product});
  if(!products.length)throw new Error('no-target-products-from-navigation');
  products.adapterUsed='html-navigation-products';products.pageStats={pages:pages.length,pagesWorking:pageRuns.filter(function(run){return run.ok}).length,urlsDiscovered:links.size,productCandidates:candidates.length,productPagesWorking:products.length,failedPages:pageRuns.filter(function(run){return!run.ok})};
  return products;
}

async function collectPrimarySource(source){
  if(source.catalogType==='sitemap-jsonld-products')return collectSitemapSource(source);
  if(source.catalogType==='html-navigation-products')return collectNavigationSource(source);
  if(source.catalogType==='html-listings'){
    const pages=Array.isArray(source.pages)&&source.pages.length?source.pages:['/'];
    const rows=[],pageRuns=[];
    for(const page of pages){const target=new URL(page,source.baseUrl).toString();try{const response=await fetchTextWithRetry(target);rows.push(...htmlListings(source,response.text,response.url));pageRuns.push({url:target,ok:true})}catch(error){pageRuns.push({url:target,ok:false,error:String(error&&error.message||error)})}}
    const pagesWorking=pageRuns.filter(function(run){return run.ok}).length;if(!pagesWorking)throw new Error('all-html-listing-pages-failed');
    rows.pageStats={pages:pages.length,pagesWorking,coveragePct:Number((pagesWorking/pages.length*100).toFixed(1)),failedPages:pageRuns.filter(function(run){return!run.ok})};
    rows.adapterUsed='html-listings';
    return rows;
  }
  if(source.catalogType==='wordpress-products-json'){
    const products=[],endpoint=source.endpoint||'/wp-json/wp/v2/product',pageRuns=[],pageSize=Math.max(5,Math.min(100,Number(source.wpPageSize||50))),maxPages=Math.max(1,Math.min(30,Number(source.maxPages||12)));
    for(let page=1;page<=maxPages;page++){
      const separator=endpoint.includes('?')?'&':'?',url=source.baseUrl.replace(/\/$/,'')+endpoint+separator+'per_page='+pageSize+'&page='+page+'&_fields=id,date_gmt,modified_gmt,link,slug,title,content';
      let rows;try{rows=await fetchJsonDocument(url);pageRuns.push({page,ok:true,products:Array.isArray(rows)?rows.length:0})}catch(error){pageRuns.push({page,ok:false,error:String(error&&error.message||error)});if(page===1)throw error;break}
      if(!Array.isArray(rows))throw new Error('not-wordpress-products-json');
      for(const row of rows){
        const published=row.date_gmt?row.date_gmt+'Z':null,updated=row.modified_gmt?row.modified_gmt+'Z':published;
        products.push({id:row.id,title:row.title&&row.title.rendered||row.slug||'',handle:row.slug||'',vendor:source.brandHint||source.label,product_type:'',body_html:row.content&&row.content.rendered||'',url:row.link||'',published_at:published,created_at:published,updated_at:updated,variants:[],images:[],__wordpressListing:true});
      }
      if(rows.length<pageSize)break;
    }
    products.adapterUsed='wordpress-products-json';
    products.pageStats={pagesTried:pageRuns.length,pagesWorking:pageRuns.filter(function(run){return run.ok}).length,productsFetched:products.length,partial:pageRuns.some(function(run){return !run.ok}),failedPages:pageRuns.filter(function(run){return !run.ok})};
    return products;
  }
  const products=[],pageRuns=[],pageSize=Math.max(20,Math.min(250,Number(source.pageSize||100))),maxPages=Math.max(1,Math.min(20,Number(source.maxCatalogPages||8)));
  for(let page=1;page<=maxPages;page++){
    const url=source.baseUrl.replace(/\/$/,'')+'/products.json?limit='+pageSize+'&page='+page;
    let rows;try{rows=await fetchJson(url);pageRuns.push({page,ok:true,products:rows.length})}catch(error){pageRuns.push({page,ok:false,error:String(error&&error.message||error)});if(products.length)break;throw error}
    products.push(...rows);
    if(rows.length<pageSize)break;
  }
  products.adapterUsed='shopify-products-json';
  products.pageStats={pagesTried:pageRuns.length,pagesWorking:pageRuns.filter(function(run){return run.ok}).length,productsFetched:products.length,partial:pageRuns.some(function(run){return !run.ok}),failedPages:pageRuns.filter(function(run){return !run.ok})};
  return products;
}

async function collectSource(source){
  try{
    const products=await collectPrimarySource(source);
    if(products.length)return products;
    throw new Error('empty-primary-catalog');
  }catch(primaryError){
    if(source.catalogType==='sitemap-jsonld-products'||source.sitemapFallback===false)throw primaryError;
    let products;try{products=await collectSitemapSource(source)}catch(fallbackError){throw new Error('primary='+String(primaryError&&primaryError.message||primaryError)+'; fallback='+String(fallbackError&&fallbackError.message||fallbackError))}
    products.fallbackUsed=true;
    products.fallbackReason=String(primaryError&&primaryError.message||primaryError);
    return products;
  }
}

function accessoryOnly(value){
  const t=norm(value);
  return /\b(?:cartridge|cartridges|replacement pod|empty pod|pod pack|coil|coils|coil head|mesh cartridge|tank tube|replacement glass|glass tube|drip tip|mouthpiece|air pin|airflow pin|insert|spare|repair kit|beauty ring|top cap|button set|panel|front door|back door|door cover|sleeve|tube for .{0,40} mod|chip|chipset only|battery only|charger|charging cable|usb cable|cotton|wire)\b/.test(t)&&!/\b(?:device|starter kit|pod system|pod kit|box mod|mechanical mod|regulated mod|sbs mod|rta)\b/.test(t);
}

function classifyRta(title){
  const t=norm(title);
  if(!/\brta\b|rebuildable tank (?:atomizer|atomiser)/.test(t)||/\brda\b|\brdta\b/.test(t))return null;
  return{category:'RTA',typology:/\bmtl\b/.test(t)?'MTL single':/dual coil|dual deck/.test(t)?'DL dual':/\brdl\b/.test(t)?'RDL single':/\bdl\b|\bdtl\b/.test(t)?'DL single':'RDL single',brand:''};
}

function classifyMod(title){
  const t=norm(title);
  if(!/\b(?:box mod|mechanical mod|regulated mod|tube mod|sbs mod|squonk mod|side by side|mod device|mod)\b|\bsbs\b/.test(t))return null;
  if(/replacement|spare|panel|door|button|chip only|chipset only|adapter|accessor/.test(t))return null;
  return{category:'MODURI',typology:/side by side|\bsbs\b/.test(t)?'side by side':/squonk/.test(t)?'squonk':/dual battery|dual 18650|dual 21700|2x18650|2x21700/.test(t)?'dual battery':'single battery',brand:''};
}

function classifyProduct(source,product){
  const title=cleanTitle(product.title),body=decode(product.body_html||''),identity=[source.brandHint||'',product.vendor||'',product.product_type||'',title].join(' ');
  if(!title||/\b(?:e[- ]?liquid|nic salts?|shortfill|longfill|nicotine shot|replacement pods?|refill packs?|cartridges?)\b/i.test(identity))return null;
  const accessory=classifyRtaAccessory(identity);
  if(accessory&&(source.scopes||[]).includes('ACCESORII'))return accessory;
  if(accessoryOnly(identity))return null;
  if(/\b(?:prefilled pods|pre-filled pods|pod refills?|prefilled pod\s*\+\s*refill)\b/i.test(identity)&&!/\b(?:kit|device|system)\b/i.test(title))return null;
  const rta=classifyRta([source.defaultProductType||'',title].join(' '));
  if(rta&&(source.scopes||[]).includes('RTA'))return rta;
  const mod=classifyMod(title);
  if(mod&&(source.scopes||[]).includes('MODURI'))return mod;
  if((source.scopes||[]).includes('POD')){
    const pod=classifyPodProduct(identity);
    if(pod&&(pod.confidence!=='generic-pod-device'||source.defaultProductType==='POD'))return pod;
  }
  return null;
}

function variantPrice(product){
  const values=(product.variants||[]).map(function(row){return Number(row.price)}).filter(Number.isFinite);
  if(!values.length)return null;
  return Number(Math.min(...values).toFixed(2));
}

function availability(product){return (product.variants||[]).some(function(row){return row.available===true})}
function image(product){const first=(product.images||[])[0];return first&&first.src||''}
function canonicalKey(item){const identity=cleanTitle(item.productName).replace(/\b(?:pod mod kit|pod system kit|pod system|pod kit|starter kit|mod kit|vape mod|box mod|regulated mod|mechanical mod|sbs mod)\b/gi,' ').replace(/\s+(?:pod|kit)\s*$/i,' ').replace(/\s+/g,' ').trim(),canonical=canonicalizeProduct({product:identity,brand:item.brand||''});return item.category+'|'+canonical.key}

function catalogEvent(source,product,classification,observedAt){
  if(product.__catalogListing){
    const title=cleanTitle(product.title),titleCanonical=canonicalizeProduct({product:title,brand:''}),brand=titleCanonical.brand||classification.brand||source.brandHint||product.vendor||'',canonical=canonicalizeProduct({product:title,brand});
    return{item:{id:hash(source.id+'|'+product.url),sourceId:source.id,sourceLabel:source.label,sourceType:source.sourceType,official:source.official===true,productId:String(product.id||product.url||''),productName:title,canonicalKey:classification.category+'|'+canonical.key,brand:canonical.brand||classification.brand||source.brandHint||'',category:classification.category,segment:classification.segment||null,typology:classification.typology||null,url:product.url,image:image(product),price:variantPrice(product),currency:(product.variants||[]).length?source.currency||null:null,available:null,availabilityStatus:'listing-observed',publishedAt:null,createdAt:null,updatedAt:null,firstObservedAt:observedAt,lastObservedAt:observedAt,recentPublication:false,freshIdentity:false,relisted:false,pending:false},event:null};
  }
  const publishedAt=iso(product.published_at),createdAt=iso(product.created_at),updatedAt=iso(product.updated_at),body=decode(product.body_html||''),title=cleanTitle(product.title),titleCanonical=canonicalizeProduct({product:title,brand:''}),resolvedBrand=titleCanonical.brand||classification.brand||source.brandHint||product.vendor||'',listingOnly=product.__wordpressListing===true,dateConfidence=listingOnly&&source.official?'official-product-published-at':'catalog-published-at';
  const publishedAge=ageDays(publishedAt),createdGap=publishedAt&&createdAt?Math.abs(Date.parse(publishedAt)-Date.parse(createdAt))/DAY:null;
  const recentPublication=inPast(publishedAt,PUBLIC_DAYS),freshIdentity=createdAt&&inPast(createdAt,PUBLIC_DAYS+7)&&createdGap!=null&&createdGap<=14;
  const pending=/coming soon|comming soon|pre[- ]?order|preorder|pre[- ]?sale|notify me|waitlist/i.test(title+' '+body.slice(0,5000));
  const relisted=Boolean(recentPublication&&!freshIdentity);
  const item={
    id:hash(source.id+'|'+product.id),sourceId:source.id,sourceLabel:source.label,sourceType:source.sourceType,official:source.official===true,
    productId:String(product.id||''),productName:title,brand:resolvedBrand,category:classification.category,
    segment:classification.segment||null,typology:classification.typology||null,url:product.url||productUrl(source,product),image:image(product),
    canonicalKey:classification.category+'|'+canonicalizeProduct({product:title,brand:resolvedBrand}).key,
    price:variantPrice(product),currency:source.currency||null,available:listingOnly?null:availability(product),availabilityStatus:listingOnly?'listing-observed':availability(product)?'available-observed':'unavailable-observed',publishedAt,createdAt,updatedAt,
    firstObservedAt:observedAt,lastObservedAt:observedAt,recentPublication,freshIdentity,relisted,pending
  };
  if(!recentPublication||relisted)return{item,event:null};
  const window=pending?'before':'after',stage=pending?'IMMINENT':'FIRST_RETAIL',stageLabel=pending?'anunt / disponibilitate in pregatire':source.official?'prima listare oficiala datata':'prima listare comerciala datata';
  const evidence={host:new URL(source.baseUrl).hostname.replace(/^www\./,''),url:item.url,title,sourceType:source.sourceType,collector:'direct-catalog',decisionEligible:true,discoveryOnly:false,evidenceScope:'catalog-publication-date',eventDate:publishedAt,dateConfidence,dateQuality:listingOnly?'wordpress-product-date-gmt':'shopify-published-at',stage:stageLabel,observedAt,image:item.image,price:item.price,currency:item.currency,available:item.available};
  return{item,event:{productName:title,brand:item.brand,category:item.category,segment:item.segment,typology:item.typology,window,stage,stageLabel,signalKind:pending?'dated-pre-market-listing':'dated-retail-listing',confidenceTier:source.official?'confirmed':'reported',eventDate:publishedAt,stageEvidenceAt:publishedAt,firstPublicEvidenceAt:publishedAt,dateConfidence,firstSeenAt:observedAt,lastSeenAt:observedAt,ageHours:Number(Math.abs(publishedAge*24).toFixed(1)),sourceCount:1,eligibleSources:1,sources:[evidence]}};
}

const TIER_RANK={confirmed:3,reported:2,'public-signal':1};
const DATE_RANK={explicit:7,'official-product-published-at':6,'catalog-published-at':5,'release-observed':4,'dated-public-evidence':3,'dated-retail-campaign':1,'first-retail-observation':0};
function mergeProduct(target,event){
  target.products=Array.isArray(target.products)?target.products:[];
  const key=canonicalKey(event)+'|'+event.window,existing=target.products.find(function(row){return canonicalKey(row)+'|'+row.window===key});
  if(!existing){event.id=hash(key);target.products.push(event);return true}
  const sources=new Map((existing.sources||[]).map(function(row){return[row.url,row]}));
  for(const source of event.sources||[])sources.set(source.url,source);
  existing.sources=Array.from(sources.values());existing.sourceCount=existing.sources.length;existing.eligibleSources=unique(existing.sources.filter(function(row){return row.decisionEligible}).map(function(row){return row.sourceType})).length;existing.lastSeenAt=event.lastSeenAt;
  const earliest=Math.min(Date.parse(existing.firstPublicEvidenceAt||existing.eventDate),Date.parse(event.firstPublicEvidenceAt||event.eventDate));if(Number.isFinite(earliest))existing.firstPublicEvidenceAt=new Date(earliest).toISOString();
  const incomingRank=TIER_RANK[event.confidenceTier]||0,currentRank=TIER_RANK[existing.confidenceTier]||0;
  const incomingDateRank=DATE_RANK[event.dateConfidence]||0,currentDateRank=DATE_RANK[existing.dateConfidence]||0;
  if(incomingRank>currentRank||incomingRank===currentRank&&incomingDateRank>currentDateRank)Object.assign(existing,{eventDate:event.eventDate,stageEvidenceAt:event.stageEvidenceAt||event.eventDate,stage:event.stage,stageLabel:event.stageLabel,signalKind:event.signalKind,confidenceTier:event.confidenceTier,dateConfidence:event.dateConfidence});
  else if(incomingRank===currentRank&&incomingDateRank===currentDateRank&&Date.parse(event.eventDate)<Date.parse(existing.eventDate))Object.assign(existing,{eventDate:event.eventDate,stageEvidenceAt:event.stageEvidenceAt||event.eventDate,stage:event.stage,stageLabel:event.stageLabel,signalKind:event.signalKind,dateConfidence:event.dateConfidence});
  return false;
}

function removeOwnedSignals(target){
  target.products=(target.products||[]).map(function(row){
    const original=Array.isArray(row.sources)?row.sources:[],sources=original.filter(function(source){return source.collector!=='direct-catalog'&&source.evidenceScope!=='catalog-publication-date'});
    if(sources.length===original.length)return row;
    if(!sources.length)return null;
    const dated=sources.filter(function(source){return Number.isFinite(Date.parse(String(source.eventDate||'')))}).sort(function(a,b){return Date.parse(a.eventDate)-Date.parse(b.eventDate)}),strongest=sources.slice().sort(function(a,b){const rank={explicit:5,'official-product-published-at':4,'catalog-published-at':3,'dated-public-evidence':2,'news-publication-date':1};return(rank[b.dateConfidence]||0)-(rank[a.dateConfidence]||0)})[0];
    return{...row,eventDate:dated[0]?dated[0].eventDate:row.eventDate,dateConfidence:strongest&&strongest.dateConfidence||row.dateConfidence,stageLabel:strongest&&strongest.stage||row.stageLabel,sources,sourceCount:sources.length,eligibleSources:unique(sources.filter(function(source){return source.decisionEligible}).map(function(source){return source.sourceType})).length};
  }).filter(Boolean);
}

function finalize(target,stats){
  target.generatedAt=new Date().toISOString();target.discoveryContextDays=CONTEXT_DAYS;
  target.truth={...(target.truth||{}),directCatalogPublicationDates:true,shopifyPublishedAtIsListingEvidenceNotGlobalLaunch:true,wordpressOfficialPublicationDates:true,sitemapLastmodIsNeverUsedAsLaunchDate:true,jsonLdCatalogCoverageDoesNotCreateLaunchEvents:true,republishedOldProductsExcludedFromRecentLaunches:true};
  target.scan={...(target.scan||{}),directCatalogs:stats};
  target.products=(target.products||[]).filter(function(row){return row&&row.eventDate&&((row.window==='before'&&(inPast(row.eventDate,PUBLIC_DAYS)||inFuture(row.eventDate,PUBLIC_DAYS)))||(row.window==='after'&&inPast(row.eventDate,PUBLIC_DAYS)))}).sort(function(a,b){return String(b.eventDate).localeCompare(String(a.eventDate))});
  const events=target.products.filter(function(row){return row.confidenceTier==='confirmed'||row.confidenceTier==='reported'||['explicit','catalog-published-at','official-product-published-at','release-observed','first-retail-observation'].includes(row.dateConfidence)}),signals=target.products.filter(function(row){return !events.includes(row)});
  target.summary={...(target.summary||{}),total:events.length,allConcrete:target.products.length,before:events.filter(function(row){return row.window==='before'}).length,after:events.filter(function(row){return row.window==='after'}).length,confirmed:events.filter(function(row){return row.confidenceTier==='confirmed'}).length,reported:events.filter(function(row){return row.confidenceTier!=='confirmed'}).length,publicSignals:signals.length};
}

async function main(){
  const cfg=read(SOURCE_FILE,{}),configured=(cfg.directCatalogSources||DEFAULT_SOURCES).filter(function(source){return source&&source.baseUrl}),skippedSources=configured.filter(function(source){return source.directCatalogEnabled===false}).map(function(source){return{id:source.id,label:source.label,reason:source.directCatalogReason||'direct-collection-disabled'}}),sources=configured.filter(function(source){return source.directCatalogEnabled!==false&&(!SOURCE_FILTER||source.id===SOURCE_FILTER)}),old=read(OUT_FILE,{items:[]}),oldMap=new Map((old.items||[]).map(function(item){return[sourceKey(item),item]})),observedAt=new Date().toISOString();
  if(SOURCE_FILTER&&!sources.length)throw new Error('Unknown or disabled --source='+SOURCE_FILTER);
  if(SOURCE_FILTER&&WRITE)throw new Error('--source cannot be combined with --write');
  const collection=await collectSourcesWithRetry(sources),runs=collection.runs;
  const items=[],events=[];let classified=0,relisted=0;
  for(const run of runs){
    for(const product of run.products){
      const classification=classifyProduct(run.source,product);if(!classification)continue;classified++;
      const out=catalogEvent(run.source,product,classification,observedAt),oldItem=oldMap.get(sourceKey(out.item));
      if(oldItem)out.item.firstObservedAt=oldItem.firstObservedAt||out.item.firstObservedAt;
      if(out.item.relisted)relisted++;
      items.push(out.item);if(out.event)events.push(out.event);
    }
  }
  const preserved=preserveFailedSourceData(runs,old,observedAt);items.push(...preserved.items);events.push(...preserved.events);
  const dedupItems=Array.from(new Map(items.map(function(item){return[sourceKey(item),item]})).values()).sort(function(a,b){return String(b.publishedAt).localeCompare(String(a.publishedAt))});
  const groupedEvents=new Map();for(const event of events){const key=canonicalKey(event)+'|'+event.window,old=groupedEvents.get(key);if(!old){groupedEvents.set(key,event);continue}const sourceMap=new Map((old.sources||[]).map(function(source){return[source.url,source]}));for(const source of event.sources||[])sourceMap.set(source.url,source);old.sources=Array.from(sourceMap.values());old.sourceCount=old.sources.length;old.eligibleSources=unique(old.sources.map(function(source){return source.sourceType})).length;if(Date.parse(event.eventDate)<Date.parse(old.eventDate))Object.assign(old,{eventDate:event.eventDate,stage:event.stage,stageLabel:event.stageLabel,dateConfidence:event.dateConfidence})}
  const dedupEvents=Array.from(groupedEvents.values()),rta=read(RTA_FILE,{products:[]}),pods=read(POD_FILE,{products:[]});removeOwnedSignals(rta);removeOwnedSignals(pods);let rtaAdded=0,podsAdded=0;
  for(const event of dedupEvents){if(event.category==='POD'){if(mergeProduct(pods,event))podsAdded++}else if(mergeProduct(rta,event))rtaAdded++}
  const counts=dedupEvents.reduce(function(acc,event){acc[event.category]=(acc[event.category]||0)+1;return acc},{}),sourceMix=dedupItems.reduce(function(acc,item){const kind=/^clone-/.test(String(item.sourceType||''))?'clone':item.official===true||/^manufacturer-official/.test(String(item.sourceType||''))?'official':'original-retailer';acc[kind]=(acc[kind]||0)+1;return acc},{official:0,'original-retailer':0,clone:0}),adapterMix=runs.reduce(function(acc,run){const adapter=run.products.adapterUsed||run.source.catalogType||'shopify-products-json';acc[adapter]=(acc[adapter]||0)+Number(run.ok);return acc},{}),stats={sourcesConfigured:sources.length,sourcesWorking:runs.filter(function(run){return run.ok}).length,sourcesRecoveredByRetry:collection.recovered,sourcesWithPartialCatalog:runs.filter(function(run){return run.ok&&run.products.pageStats&&run.products.pageStats.partial}).length,sourcesUsingFallback:runs.filter(function(run){return run.products.fallbackUsed}).length,productsFetched:runs.reduce(function(sum,run){return sum+run.products.length},0),productsClassified:classified,preservedItemsFromFailedSources:preserved.items.length,preservedEventsFromFailedSources:preserved.events.length,recentEvents:dedupEvents.length,relistedExcluded:relisted,rtaModAdded:rtaAdded,podsAdded,sourceMix,adapterMix,categoryEvents:{RTA:counts.RTA||0,MODURI:counts.MODURI||0,ACCESORII:counts.ACCESORII||0,POD:counts.POD||0}};
  finalize(rta,stats);finalize(pods,stats);
  const output={schemaVersion:8,generatedAt:observedAt,snapshotReferenceAt:new Date(REF).toISOString(),publicWindowDays:PUBLIC_DAYS,researchContextDays:CONTEXT_DAYS,truth:{directCatalogDatesAreSourceListingEvidence:true,listingDateIsNotClaimedAsGlobalLaunch:true,sitemapLastmodIsNeverUsedAsLaunchDate:true,jsonLdCatalogCoverageDoesNotCreateLaunchEvents:true,oldRepublishedProductsAreNotRecentEvents:true,availabilityIsSeparateFromReleaseChronology:true,currentAvailabilityIncludesOlderCatalogItems:true,htmlCatalogListingsDoNotClaimStock:true,officialOriginalAndCloneSourcesSeparated:true,unavailableDirectSourcesRemainExplicit:true,lastGoodSourceDataPreservedOnFailure:true,transientFailuresRetriedAtReducedConcurrency:true,curlFallbackUsedOnlyForPublicReadEndpoints:true},scan:{...stats,sourcesConfiguredTotal:configured.length,sourcesSkipped:skippedSources.length},skippedSources,sourceRuns:runs.map(function(run){return{id:run.source.id,label:run.source.label,sourceType:run.source.sourceType||'',official:run.source.official===true,scopes:run.source.scopes||[],catalogType:run.source.catalogType||'shopify-products-json',adapterUsed:run.products.adapterUsed||null,fallbackUsed:run.products.fallbackUsed===true,fallbackReason:run.products.fallbackReason||null,ok:run.ok,attempts:run.attempts||1,recoveredByRetry:run.recoveredByRetry===true,products:run.products.length,pages:run.products.pageStats||null,error:run.error||null}}),summary:{events:dedupEvents.length,RTA:counts.RTA||0,MODURI:counts.MODURI||0,ACCESORII:counts.ACCESORII||0,POD:counts.POD||0,monitored:dedupItems.length,relistedExcluded:relisted,sourceMix,adapterMix},events:dedupEvents.sort(function(a,b){return String(b.eventDate).localeCompare(String(a.eventDate))}),items:dedupItems.slice(0,3000)};
  if(WRITE){save(RTA_FILE,rta);save(POD_FILE,pods);save(OUT_FILE,output)}else if(!SUMMARY_ONLY)console.log(JSON.stringify(output,null,2));
  console.log(`Direct catalogs: ${stats.sourcesWorking}/${stats.sourcesConfigured} sources; ${stats.productsFetched} products; ${classified} classified; recent RTA ${counts.RTA||0}; MODURI ${counts.MODURI||0}; ACCESORII ${counts.ACCESORII||0}; POD ${counts.POD||0}; relisted excluded ${relisted}.`);
  if(SUMMARY_ONLY){const failures=runs.filter(function(run){return!run.ok}).map(function(run){return run.source.id+': '+run.error});if(failures.length)console.log('Direct catalog failures: '+failures.join(' | '))}
}

function sourceKey(item){return String(item.sourceId||'')+'|'+String(item.productId||item.url||'')}

function sourceHost(value){try{return new URL(value).hostname.replace(/^www\./,'').toLowerCase()}catch(_){return''}}
function preserveFailedSourceData(runs,old,observedAt){
  const failedById=new Map(runs.filter(function(run){return !run.ok}).map(function(run){return[run.source.id,run]})),failedByHost=new Map(runs.filter(function(run){return !run.ok}).map(function(run){return[sourceHost(run.source.baseUrl),run]}));
  const items=(old.items||[]).filter(function(item){return failedById.has(item.sourceId)}).map(function(item){const run=failedById.get(item.sourceId);return{...item,sourceSnapshotStale:true,lastAttemptAt:observedAt,sourceError:run.error}});
  const events=[];
  for(const oldEvent of old.events||[]){const sources=(oldEvent.sources||[]).filter(function(source){return failedByHost.has(String(source.host||'').replace(/^www\./,'').toLowerCase())});if(sources.length)events.push({...oldEvent,sources,sourceCount:sources.length,sourceSnapshotStale:true,lastAttemptAt:observedAt})}
  return{items,events};
}

if(require.main===module)main().catch(function(error){console.error(error&&error.stack||error);process.exit(1)});
module.exports={navigationProductLinks,classifyProduct,preserveFailedSourceData,collectSourcesWithRetry};
