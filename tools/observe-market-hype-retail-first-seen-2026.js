#!/usr/bin/env node
'use strict';

const fs=require('fs');
const crypto=require('crypto');
const {snapshotReferenceMs}=require('./hype-window-reference-2026.js');
const {classifyPodProduct,decode,norm}=require('./market-pod-classifier-2026.js');
const {canonicalizeProduct}=require('./market-product-canonical-2026.js');

const WRITE=process.argv.includes('--write');
const PRODUCTS='data/market-hype-products-2026.json';
const PODS='data/market-hype-pods-2026.json';
const MEMORY='data/market-hype-retail-memory-2026.json';
const REF=snapshotReferenceMs(),OBSERVED_AT=new Date(REF).toISOString();

function read(file,fallback={}){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function save(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function hash(value){return crypto.createHash('sha256').update(String(value||'')).digest('hex').slice(0,20)}
function host(url){try{return new URL(String(url||'')).hostname.replace(/^www\./,'').toLowerCase()}catch(_){return''}}
function absolute(base,href){try{return new URL(href,base).href}catch(_){return''}}
function unique(rows,key){const map=new Map();for(const row of rows||[]){const id=key(row);if(id&&!map.has(id))map.set(id,row)}return Array.from(map.values())}
function accessory(title){return /replacement|tank tube|glass only|drip tip|air\s*pin|airflow pin|deck kit|beauty ring|spare|accessor|chimney|bell cap|cartridge|empty pod|pod pack|coil head/i.test(title)}
function canonical(value){return decode(value).replace(/^Buy\s+/i,'').replace(/\s*[|–—]\s*(?:shop|store|official).*$/i,'').replace(/\s+/g,' ').trim().slice(0,190)}
function classify(title){const pod=classifyPodProduct(title);if(pod)return pod;const t=norm(title),vape=/vape|vaping|e cig|atomiz|atomis|tank|coil|deck|airflow|mtl|rdl|dtl|clone|styled/.test(t);if((/\brta\b/.test(t)&&vape)||/rebuildable tank (?:atomizer|atomiser)/.test(t)){const typology=/\bmtl\b/.test(t)?'MTL single':/dual coil|dual deck/.test(t)?'DL dual':/\brdl\b/.test(t)?'RDL single':/\bdl\b|\bdtl\b/.test(t)?'DL single':'RDL single';return{category:'RTA',typology,brand:''}}if((/\bmod\b|box mod|regulated mod|squonk|side by side|\bsbs\b|18650|21700|dna\s*\d|yihi/.test(t))&&vape){const typology=/side by side|\bsbs\b/.test(t)?'side by side':/squonk/.test(t)?'squonk':/dual battery|dual 18650|dual 21700|2x18650|2x21700/.test(t)?'dual battery':'single battery';return{category:'MODURI',typology,brand:''}}return null}

async function fetchText(url,timeout=12000){const controller=new AbortController(),timer=setTimeout(function(){controller.abort()},timeout);try{const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Retail-First-Seen/1.0 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml,*/*;q=.7','accept-language':'en,ro;q=.8','cache-control':'no-cache'},signal:controller.signal});const text=await response.text();if(!response.ok)throw new Error('HTTP '+response.status);return{url:response.url||url,text}}finally{clearTimeout(timer)}}
async function pool(items,width,worker){let cursor=0;const output=new Array(items.length);async function run(){for(;;){const index=cursor++;if(index>=items.length)return;try{output[index]=await worker(items[index])}catch(error){output[index]={error:String(error&&error.message||error)}}}}await Promise.all(Array.from({length:Math.min(width,Math.max(1,items.length))},run));return output}

function anchors(html,base){const output=[];for(const match of String(html||'').matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){const url=absolute(base,match[1]);if(!url)continue;const body=match[2],image=body.match(/<img\b[^>]*(?:alt|title)=["']([^"']+)["']/i),title=canonical(decode(body)||image&&image[1]||'');if(title)output.push({url,title})}return output}
function productLink(row){const h=host(row.url);let path='';try{path=new URL(row.url).pathname}catch(_){return false}if(accessory(row.title))return false;if(h==='3fvape.com'||h.endsWith('.3fvape.com'))return /^\/(?:new-arrivals|rta)\//.test(path);if(h==='2fdeal.com'||h.endsWith('.2fdeal.com'))return !/^\/c\//.test(path)&&!/cart|login|register|search/i.test(row.url);return false}
function seeds(){const output=[];for(let page=1;page<=10;page++)output.push(`https://www.3fvape.com/39-new-arrivals${page===1?'':'?p='+page}`);for(let page=1;page<=8;page++)output.push(`https://www.3fvape.com/115-rta${page===1?'':'?p='+page}`);for(let page=1;page<=8;page++)output.push(`https://www.2fdeal.com/c/rta_0376/${page}.html`);return output}
function identityTitle(name){return canonical(name).replace(/^\[?Ships from Bonded Warehouse\]?\s*/i,'').replace(/^Authentic\s+/i,'').split(/\s+-\s+/)[0].trim()}
function productKey(category,name,brand){const identity=canonicalizeProduct({product:identityTitle(name),brand:brand||''});return hash(category+'|'+identity.key)}
function removeOwnedEvents(data){data.products=(data.products||[]).filter(function(product){return product.dateConfidence!=='first-retail-observation'&&!(product.sources||[]).some(function(source){return source.sourceType==='vendor-first-observation'})})}
function finalize(data,newCandidates,observed){removeOwnedEvents(data);data.generatedAt=OBSERVED_AT;data.pendingRefresh=false;data.discoveryContextDays=180;data.truth={...(data.truth||{}),retailFirstSeenUsesPersistentMemory:true,retailFirstSeenIsDiscoveryOnly:true,retailMemoryContextDays:180,vendorRelistingIsNotRelease:true,firstCatalogRunIsBaselineOnly:true,colourVariantsAreOneProduct:true};data.scan={...(data.scan||{}),retailObserverCatalogProducts:observed,retailObserverNewCandidates:newCandidates,retailObserverFirstSaleEvents:0};data.summary={...(data.summary||{}),total:(data.products||[]).length,before:(data.products||[]).filter(function(product){return product.window==='before'}).length,after:(data.products||[]).filter(function(product){return product.window==='after'}).length};return data}

async function main(){
  const memory=read(MEMORY,{schemaVersion:2,items:{},catalogBaselines:{}}),items=memory.items&&typeof memory.items==='object'?memory.items:{},catalogBaselines=memory.schemaVersion>=2&&memory.catalogBaselines&&typeof memory.catalogBaselines==='object'?memory.catalogBaselines:{},rta=read(PRODUCTS,{products:[]}),pods=read(PODS,{products:[]});
  const catalogRuns=await pool(seeds(),4,async function(seed){try{const fetched=await fetchText(seed);return{seed,url:fetched.url,html:fetched.text,error:''}}catch(error){return{seed,url:seed,html:'',error:String(error&&error.message||error)}}}),links=[];
  for(const run of catalogRuns){if(!run||run.error||!run.html)continue;for(const row of anchors(run.html,run.url))if(productLink(row))links.push(row)}
  const products=unique(links,function(row){try{return new URL(row.url).origin+new URL(row.url).pathname}catch(_){return row.url}});let rtaObserved=0,podObserved=0,rtaCandidates=0,podCandidates=0;
  for(const row of products){const cls=classify(row.title);if(!cls)continue;const sourceHost=host(row.url),key=productKey(cls.category,row.title,cls.brand),previous=items[key],ready=Boolean(catalogBaselines[sourceHost]);items[key]={key,category:cls.category,brand:cls.brand||'',productName:identityTitle(row.title),firstSeenAt:previous&&previous.firstSeenAt||OBSERVED_AT,lastSeenAt:OBSERVED_AT,sourceHost,url:row.url};if(cls.category==='POD'){podObserved++;if(ready&&!previous)podCandidates++}else{rtaObserved++;if(ready&&!previous)rtaCandidates++}}
  finalize(rta,rtaCandidates,rtaObserved);finalize(pods,podCandidates,podObserved);
  for(const run of catalogRuns){const sourceHost=run&&!run.error&&run.html?host(run.url):'';if(sourceHost&&!catalogBaselines[sourceHost])catalogBaselines[sourceHost]=OBSERVED_AT}
  const nextMemory={schemaVersion:2,initializedAt:memory.schemaVersion>=2&&memory.initializedAt||OBSERVED_AT,updatedAt:OBSERVED_AT,contextDays:180,historyPolicy:'Per-store baselines and canonical product identities prevent old relistings or colour variants from becoming false launches.',catalogBaselines,items};
  if(WRITE){save(PRODUCTS,rta);save(PODS,pods);save(MEMORY,nextMemory)}
  console.log(`Retail memory: ${catalogRuns.filter(function(run){return run&&!run.error&&run.html}).length}/${catalogRuns.length} catalogs; ${products.length} links; RTA/MOD ${rtaObserved} observed, ${rtaCandidates} new candidates; POD ${podObserved} observed, ${podCandidates} new candidates; 0 promoted without dated evidence.`);
}

main().catch(function(error){console.error(error&&error.stack||error);process.exit(1)});
