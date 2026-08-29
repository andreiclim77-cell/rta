#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const ROOT=path.resolve(__dirname,'..');
const MARKET_PATH=path.join(ROOT,'data','market-2026.json');
const WRITE=process.argv.includes('--write');
const TARGET_RETAILERS=new Set(['viciishop','tigaraego']);
const MAX_ATTEMPTS=3;

function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
function writeJson(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function clean(value){return String(value||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim()}
function toNumber(value){
  if(value==null)return null;
  const text=String(value).replace(/\s/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.');
  const match=text.match(/\d{1,6}(?:\.\d{1,2})?/);
  const n=match?Number(match[0]):NaN;
  return Number.isFinite(n)?Number(n.toFixed(2)):null
}
function today(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Bucharest',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`}
function isProductNode(node){return node&&typeof node==='object'&&(node['@type']==='Product'||(Array.isArray(node['@type'])&&node['@type'].includes('Product')))}
function collectProductNodes(node,out){
  if(!node||typeof node!=='object')return;
  if(isProductNode(node))out.push(node);
  if(Array.isArray(node)){node.forEach(x=>collectProductNodes(x,out));return}
  Object.values(node).forEach(x=>collectProductNodes(x,out))
}
function offerPrices(offers){
  const out=[];
  const list=Array.isArray(offers)?offers:[offers];
  for(const offer of list){
    if(!offer||typeof offer!=='object')continue;
    for(const key of ['price','lowPrice','highPrice']){
      const n=toNumber(offer[key]);
      if(n!=null)out.push(n)
    }
  }
  return out
}
function jsonLdPrices(html){
  const values=[];
  for(const m of String(html||'').matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
    try{
      const parsed=JSON.parse(m[1]);
      const products=[];collectProductNodes(parsed,products);
      for(const product of products)values.push(...offerPrices(product.offers))
    }catch(_){ }
  }
  return values.filter(n=>n>0)
}
function metaPrices(html){
  const values=[];
  const patterns=[
    /<meta\b[^>]*(?:property|itemprop)=["'](?:product:price:amount|price)["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
    /<meta\b[^>]*content=["']([^"']+)["'][^>]*(?:property|itemprop)=["'](?:product:price:amount|price)["'][^>]*>/gi
  ];
  for(const re of patterns)for(const m of String(html||'').matchAll(re)){const n=toNumber(m[1]);if(n!=null&&n>0)values.push(n)}
  return values
}
function wooPrices(html){
  const values=[];
  const chunks=[];
  for(const re of [/<p\b[^>]*class=["'][^"']*\bprice\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,/<span\b[^>]*class=["'][^"']*woocommerce-Price-amount[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi]){
    for(const m of String(html||'').matchAll(re))chunks.push(m[1])
  }
  for(const chunk of chunks){
    const text=clean(chunk);
    for(const m of text.matchAll(/\d{1,6}(?:[ .]\d{3})*(?:[,.]\d{1,2})?/g)){
      const n=toNumber(m[0]);if(n!=null&&n>0)values.push(n)
    }
  }
  return values
}
function chooseVerifiedPrice(html,current){
  const preferred=[...jsonLdPrices(html),...metaPrices(html)].filter(n=>n>=20);
  if(preferred.length)return preferred[preferred.length-1];
  const woo=wooPrices(html).filter(n=>n>=20);
  if(woo.length)return woo[woo.length-1];
  const text=clean(html).replace(/\d{1,6}(?:[ .]\d{3})*(?:[,.]\d{1,2})?\s*(?:lei|ron)\s*(?:Retragere numerar|Portofel virtual)/gi,' ');
  const visible=[...text.matchAll(/(\d{1,6}(?:[ .]\d{3})*(?:[,.]\d{1,2})?)\s*(?:lei|ron)\b/gi)].map(m=>toNumber(m[1])).filter(n=>n!=null&&n>=20);
  if(visible.length)return visible[visible.length-1];
  return current
}
async function fetchText(url){
  let lastError=null;
  for(let attempt=1;attempt<=MAX_ATTEMPTS;attempt++){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),18000);
    try{
      const response=await fetch(url,{headers:{'user-agent':'Ghid-RTA-Market-Observatory/4.1 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8','accept-language':'ro-RO,ro;q=0.9,en;q=0.7','cache-control':'no-cache'},redirect:'follow',signal:controller.signal});
      if(response.ok)return await response.text();
      lastError=new Error(`HTTP ${response.status}`);
      if(attempt===MAX_ATTEMPTS||![403,408,425,429,500,502,503,504].includes(response.status))throw lastError
    }catch(error){lastError=error;if(attempt===MAX_ATTEMPTS)throw error}finally{clearTimeout(timer)}
    await sleep(900*attempt*attempt)
  }
  throw lastError||new Error('fetch failed')
}

async function main(){
  const market=readJson(MARKET_PATH);const date=today();
  if(Number(market.scopeYear)!==2026||!/^2026-/.test(date)){console.log('Price verifier locked to 2026.');return}
  const rows=market.observations||[];
  const suspicious=rows.filter(row=>TARGET_RETAILERS.has(row.retailerId)&&row.observedAt===date&&Number(row.priceRon)>0&&Number(row.priceRon)<20&&/^https:\/\//i.test(String(row.source||'')));
  const results=[];
  for(const row of suspicious){
    try{
      const html=await fetchText(row.source);
      const verified=chooseVerifiedPrice(html,Number(row.priceRon));
      if(!(verified>=20))throw new Error(`No verified product price >=20 RON found; current=${row.priceRon}`);
      results.push({retailerId:row.retailerId,product:row.product,source:row.source,oldPriceRon:Number(row.priceRon),verifiedPriceRon:verified,status:'corrected'});
      row.priceRon=verified;
      row.priceVerifiedFromProductPage=true;
      row.priceVerificationMode='product-page-schema-or-woocommerce';
    }catch(error){
      results.push({retailerId:row.retailerId,product:row.product,source:row.source,oldPriceRon:Number(row.priceRon),verifiedPriceRon:null,status:'failed',error:String(error&&error.message||error).slice(0,180)})
    }
    await sleep(500)
  }
  market.priceVerificationStatus={date,generatedAt:new Date().toISOString(),targets:suspicious.length,corrected:results.filter(x=>x.status==='corrected').length,failed:results.filter(x=>x.status==='failed').length,results};
  market.updatedAt=market.priceVerificationStatus.generatedAt;
  if(WRITE){writeJson(MARKET_PATH,market)}
  console.log(JSON.stringify(market.priceVerificationStatus,null,2));
  if(results.some(x=>x.status==='failed'))throw new Error(`Price verification failed for ${results.filter(x=>x.status==='failed').length} suspicious product(s).`)
}
main().catch(error=>{console.error(error&&error.stack||error);process.exitCode=1});
