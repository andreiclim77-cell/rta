#!/usr/bin/env node
'use strict';

const fs=require('fs');
const crypto=require('crypto');
const {snapshotReferenceMs}=require('./hype-window-reference-2026.js');
const {classifyPodProduct,decode,norm}=require('./market-pod-classifier-2026.js');
const {canonicalizeProduct}=require('./market-product-canonical-2026.js');
const {classifyRtaAccessory}=require('./market-hype-accessory-classifier-2026.js');

const WRITE=process.argv.includes('--write');
const SOURCE_FILE='data/market-hype-sources-2026.json';
const RTA_FILE='data/market-hype-products-2026.json';
const POD_FILE='data/market-hype-pods-2026.json';
const OUT_FILE='data/market-hype-direct-catalogs-2026.json';
const REF=snapshotReferenceMs();
const DAY=86400000;
const PUBLIC_DAYS=30;
const CONTEXT_DAYS=180;

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
  {id:'cthulhu-official-catalog',baseUrl:'https://www.cthulhumod.com',label:'Cthulhu Mod official catalog',brandHint:'Cthulhu Mod',sourceType:'manufacturer-official-catalog',catalogType:'wordpress-products-json',official:true,scopes:['RTA','MODURI','POD','ACCESORII']},
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
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Direct-Catalog/1.0 (+https://ghid-rta.ro/)','accept':'application/json,text/plain;q=.8,*/*;q=.5','cache-control':'no-cache'},signal:controller.signal});
    const text=await response.text();
    if(!response.ok)throw new Error('HTTP '+response.status);
    const parsed=JSON.parse(text);
    if(!parsed||!Array.isArray(parsed.products))throw new Error('not-shopify-products-json');
    return parsed.products;
  }finally{clearTimeout(timer)}
}

async function fetchJsonDocument(url,timeout=15000){
  const controller=new AbortController(),timer=setTimeout(function(){controller.abort()},timeout);
  try{
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Direct-Catalog/1.2 (+https://ghid-rta.ro/)','accept':'application/json,text/plain;q=.8,*/*;q=.5','cache-control':'no-cache'},signal:controller.signal});
    const text=await response.text();
    if(!response.ok)throw new Error('HTTP '+response.status);
    return JSON.parse(text);
  }finally{clearTimeout(timer)}
}

async function fetchText(url,timeout=18000){
  const controller=new AbortController(),timer=setTimeout(function(){controller.abort()},timeout);
  try{
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Direct-Catalog/1.1 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml,*/*;q=.6','cache-control':'no-cache'},signal:controller.signal});
    const text=await response.text();
    if(!response.ok)throw new Error('HTTP '+response.status);
    return{url:response.url||url,text};
  }finally{clearTimeout(timer)}
}

function wait(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
async function fetchTextWithRetry(url,attempts=3){let lastError=null;for(let attempt=1;attempt<=attempts;attempt++){try{return await fetchText(url)}catch(error){lastError=error;if(attempt<attempts)await wait(attempt*700)}}throw lastError||new Error('fetch-failed')}
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

async function collectSource(source){
  if(source.catalogType==='html-listings'){
    const pages=Array.isArray(source.pages)&&source.pages.length?source.pages:['/'];
    const rows=[],pageRuns=[];
    for(const page of pages){const target=new URL(page,source.baseUrl).toString();try{const response=await fetchTextWithRetry(target);rows.push(...htmlListings(source,response.text,response.url));pageRuns.push({url:target,ok:true})}catch(error){pageRuns.push({url:target,ok:false,error:String(error&&error.message||error)})}}
    const pagesWorking=pageRuns.filter(function(run){return run.ok}).length;if(!pagesWorking)throw new Error('all-html-listing-pages-failed');
    rows.pageStats={pages:pages.length,pagesWorking,coveragePct:Number((pagesWorking/pages.length*100).toFixed(1)),failedPages:pageRuns.filter(function(run){return!run.ok})};
    return rows;
  }
  if(source.catalogType==='wordpress-products-json'){
    const products=[],endpoint=source.endpoint||'/wp-json/wp/v2/product';
    for(let page=1;page<=Number(source.maxPages||8);page++){
      const separator=endpoint.includes('?')?'&':'?',url=source.baseUrl.replace(/\/$/,'')+endpoint+separator+'per_page=100&page='+page+'&_fields=id,date_gmt,modified_gmt,link,slug,title,content';
      let rows;try{rows=await fetchJsonDocument(url)}catch(error){if(page===1)throw error;break}
      if(!Array.isArray(rows))throw new Error('not-wordpress-products-json');
      for(const row of rows){
        const published=row.date_gmt?row.date_gmt+'Z':null,updated=row.modified_gmt?row.modified_gmt+'Z':published;
        products.push({id:row.id,title:row.title&&row.title.rendered||row.slug||'',handle:row.slug||'',vendor:source.brandHint||source.label,product_type:'',body_html:row.content&&row.content.rendered||'',url:row.link||'',published_at:published,created_at:published,updated_at:updated,variants:[],images:[],__wordpressListing:true});
      }
      if(rows.length<100)break;
    }
    return products;
  }
  const products=[];
  for(let page=1;page<=8;page++){
    const url=source.baseUrl.replace(/\/$/,'')+'/products.json?limit=250&page='+page;
    const rows=await fetchJson(url);
    products.push(...rows);
    if(rows.length<250)break;
  }
  return products;
}

function accessoryOnly(value){
  const t=norm(value);
  return /\b(?:cartridge|cartridges|replacement pod|empty pod|pod pack|coil|coils|coil head|mesh cartridge|tank tube|replacement glass|glass tube|drip tip|mouthpiece|air pin|airflow pin|insert|spare|repair kit|beauty ring|top cap|button set|panel|door|chip|chipset only|battery only|charger|charging cable|usb cable|cotton|wire)\b/.test(t)&&!/\b(?:device|starter kit|pod system|pod kit|box mod|mechanical mod|regulated mod|sbs mod|rta)\b/.test(t);
}

function classifyRta(title){
  const t=norm(title);
  if(!/\brta\b|rebuildable tank (?:atomizer|atomiser)/.test(t)||/\brda\b|\brdta\b/.test(t))return null;
  return{category:'RTA',typology:/\bmtl\b/.test(t)?'MTL single':/dual coil|dual deck/.test(t)?'DL dual':/\brdl\b/.test(t)?'RDL single':/\bdl\b|\bdtl\b/.test(t)?'DL single':'RDL single',brand:''};
}

function classifyMod(title){
  const t=norm(title);
  if(!/\b(?:box mod|mechanical mod|regulated mod|tube mod|sbs mod|squonk mod|side by side|mod device)\b|\bsbs\b/.test(t))return null;
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
  const rta=classifyRta(title);
  if(rta&&(source.scopes||[]).includes('RTA'))return rta;
  const mod=classifyMod(title);
  if(mod&&(source.scopes||[]).includes('MODURI'))return mod;
  if((source.scopes||[]).includes('POD')){
    const pod=classifyPodProduct(identity);
    if(pod&&pod.confidence!=='generic-pod-device')return pod;
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
    const title=cleanTitle(product.title),canonical=canonicalizeProduct({product:title,brand:classification.brand||source.brandHint||''});
    return{item:{id:hash(source.id+'|'+product.url),sourceId:source.id,sourceLabel:source.label,sourceType:source.sourceType,official:source.official===true,productId:String(product.id||product.url||''),productName:title,canonicalKey:classification.category+'|'+canonical.key,brand:canonical.brand||classification.brand||source.brandHint||'',category:classification.category,segment:classification.segment||null,typology:classification.typology||null,url:product.url,image:'',price:null,currency:null,available:null,availabilityStatus:'listing-observed',publishedAt:null,createdAt:null,updatedAt:null,firstObservedAt:observedAt,lastObservedAt:observedAt,recentPublication:false,freshIdentity:false,relisted:false,pending:false},event:null};
  }
  const publishedAt=iso(product.published_at),createdAt=iso(product.created_at),updatedAt=iso(product.updated_at),body=decode(product.body_html||''),title=cleanTitle(product.title),listingOnly=product.__wordpressListing===true,dateConfidence=listingOnly&&source.official?'official-product-published-at':'catalog-published-at';
  const publishedAge=ageDays(publishedAt),createdGap=publishedAt&&createdAt?Math.abs(Date.parse(publishedAt)-Date.parse(createdAt))/DAY:null;
  const recentPublication=inPast(publishedAt,PUBLIC_DAYS),freshIdentity=createdAt&&inPast(createdAt,PUBLIC_DAYS+7)&&createdGap!=null&&createdGap<=14;
  const pending=/coming soon|comming soon|pre[- ]?order|preorder|pre[- ]?sale|notify me|waitlist/i.test(title+' '+body.slice(0,5000));
  const relisted=Boolean(recentPublication&&!freshIdentity);
  const item={
    id:hash(source.id+'|'+product.id),sourceId:source.id,sourceLabel:source.label,sourceType:source.sourceType,official:source.official===true,
    productId:String(product.id||''),productName:title,brand:classification.brand||source.brandHint||product.vendor||'',category:classification.category,
    segment:classification.segment||null,typology:classification.typology||null,url:product.url||productUrl(source,product),image:image(product),
    canonicalKey:classification.category+'|'+canonicalizeProduct({product:title,brand:classification.brand||source.brandHint||product.vendor||''}).key,
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
  target.truth={...(target.truth||{}),directCatalogPublicationDates:true,shopifyPublishedAtIsListingEvidenceNotGlobalLaunch:true,wordpressOfficialPublicationDates:true,republishedOldProductsExcludedFromRecentLaunches:true};
  target.scan={...(target.scan||{}),directCatalogs:stats};
  target.products=(target.products||[]).filter(function(row){return row&&row.eventDate&&((row.window==='before'&&(inPast(row.eventDate,PUBLIC_DAYS)||inFuture(row.eventDate,PUBLIC_DAYS)))||(row.window==='after'&&inPast(row.eventDate,PUBLIC_DAYS)))}).sort(function(a,b){return String(b.eventDate).localeCompare(String(a.eventDate))});
  const events=target.products.filter(function(row){return row.confidenceTier==='confirmed'||row.confidenceTier==='reported'||['explicit','catalog-published-at','official-product-published-at','release-observed','first-retail-observation'].includes(row.dateConfidence)}),signals=target.products.filter(function(row){return !events.includes(row)});
  target.summary={...(target.summary||{}),total:events.length,allConcrete:target.products.length,before:events.filter(function(row){return row.window==='before'}).length,after:events.filter(function(row){return row.window==='after'}).length,confirmed:events.filter(function(row){return row.confidenceTier==='confirmed'}).length,reported:events.filter(function(row){return row.confidenceTier!=='confirmed'}).length,publicSignals:signals.length};
}

async function main(){
  const cfg=read(SOURCE_FILE,{}),sources=(cfg.directCatalogSources||DEFAULT_SOURCES).filter(function(source){return source&&source.baseUrl}),old=read(OUT_FILE,{items:[]}),oldMap=new Map((old.items||[]).map(function(item){return[sourceKey(item),item]})),observedAt=new Date().toISOString();
  const runs=await Promise.all(sources.map(async function(source){try{return{source,products:await collectSource(source),ok:true}}catch(error){return{source,products:[],ok:false,error:String(error&&error.message||error)}}}));
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
  const dedupItems=Array.from(new Map(items.map(function(item){return[sourceKey(item),item]})).values()).sort(function(a,b){return String(b.publishedAt).localeCompare(String(a.publishedAt))});
  const groupedEvents=new Map();for(const event of events){const key=canonicalKey(event)+'|'+event.window,old=groupedEvents.get(key);if(!old){groupedEvents.set(key,event);continue}const sourceMap=new Map((old.sources||[]).map(function(source){return[source.url,source]}));for(const source of event.sources||[])sourceMap.set(source.url,source);old.sources=Array.from(sourceMap.values());old.sourceCount=old.sources.length;old.eligibleSources=unique(old.sources.map(function(source){return source.sourceType})).length;if(Date.parse(event.eventDate)<Date.parse(old.eventDate))Object.assign(old,{eventDate:event.eventDate,stage:event.stage,stageLabel:event.stageLabel,dateConfidence:event.dateConfidence})}
  const dedupEvents=Array.from(groupedEvents.values()),rta=read(RTA_FILE,{products:[]}),pods=read(POD_FILE,{products:[]});removeOwnedSignals(rta);removeOwnedSignals(pods);let rtaAdded=0,podsAdded=0;
  for(const event of dedupEvents){if(event.category==='POD'){if(mergeProduct(pods,event))podsAdded++}else if(mergeProduct(rta,event))rtaAdded++}
  const counts=dedupEvents.reduce(function(acc,event){acc[event.category]=(acc[event.category]||0)+1;return acc},{}),sourceMix=dedupItems.reduce(function(acc,item){const kind=/^clone-/.test(String(item.sourceType||''))?'clone':item.official===true||/^manufacturer-official/.test(String(item.sourceType||''))?'official':'original-retailer';acc[kind]=(acc[kind]||0)+1;return acc},{official:0,'original-retailer':0,clone:0}),stats={sourcesConfigured:sources.length,sourcesWorking:runs.filter(function(run){return run.ok}).length,productsFetched:runs.reduce(function(sum,run){return sum+run.products.length},0),productsClassified:classified,recentEvents:dedupEvents.length,relistedExcluded:relisted,rtaModAdded:rtaAdded,podsAdded,sourceMix,categoryEvents:{RTA:counts.RTA||0,MODURI:counts.MODURI||0,ACCESORII:counts.ACCESORII||0,POD:counts.POD||0}};
  finalize(rta,stats);finalize(pods,stats);
  const output={schemaVersion:5,generatedAt:observedAt,snapshotReferenceAt:new Date(REF).toISOString(),publicWindowDays:PUBLIC_DAYS,researchContextDays:CONTEXT_DAYS,truth:{directCatalogDatesAreSourceListingEvidence:true,listingDateIsNotClaimedAsGlobalLaunch:true,oldRepublishedProductsAreNotRecentEvents:true,availabilityIsSeparateFromReleaseChronology:true,currentAvailabilityIncludesOlderCatalogItems:true,htmlCatalogListingsDoNotClaimStock:true,officialOriginalAndCloneSourcesSeparated:true},scan:stats,sourceRuns:runs.map(function(run){return{id:run.source.id,label:run.source.label,sourceType:run.source.sourceType||'',official:run.source.official===true,scopes:run.source.scopes||[],catalogType:run.source.catalogType||'shopify-products-json',ok:run.ok,products:run.products.length,pages:run.products.pageStats||null,error:run.error||null}}),summary:{events:dedupEvents.length,RTA:counts.RTA||0,MODURI:counts.MODURI||0,ACCESORII:counts.ACCESORII||0,POD:counts.POD||0,monitored:dedupItems.length,relistedExcluded:relisted,sourceMix},events:dedupEvents.sort(function(a,b){return String(b.eventDate).localeCompare(String(a.eventDate))}),items:dedupItems.slice(0,3000)};
  if(WRITE){save(RTA_FILE,rta);save(POD_FILE,pods);save(OUT_FILE,output)}else console.log(JSON.stringify(output,null,2));
  console.log(`Direct catalogs: ${stats.sourcesWorking}/${stats.sourcesConfigured} sources; ${stats.productsFetched} products; ${classified} classified; recent RTA ${counts.RTA||0}; MODURI ${counts.MODURI||0}; ACCESORII ${counts.ACCESORII||0}; POD ${counts.POD||0}; relisted excluded ${relisted}.`);
}

function sourceKey(item){return String(item.sourceId||'')+'|'+String(item.productId||item.url||'')}

main().catch(function(error){console.error(error&&error.stack||error);process.exit(1)});
