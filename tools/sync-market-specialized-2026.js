#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MARKET_PATH = path.join(ROOT, 'data', 'market-2026.json');
const REGISTRY_PATH = path.join(ROOT, 'data', 'market-retailers-2026.json');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
const ANALYSIS_START='2026-01-01';

function readJson(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
function writeJson(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function clean(input){return String(input||'').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#039;|&apos;/gi,"'").replace(/&#8211;|&ndash;/gi,'–').replace(/&#8217;|&rsquo;/gi,'’').replace(/\s+/g,' ').trim()}
function norm(input){return clean(input).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function absolute(base,href){try{const u=new URL(href,base);if(!/^https?:$/.test(u.protocol))return '';u.hash='';return u.toString()}catch(_){return ''}}
function canonical(url){try{const u=new URL(url);['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid'].forEach(k=>u.searchParams.delete(k));u.hash='';return u.toString()}catch(_){return String(url||'')}}
function today(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Bucharest',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`}
function numberFromPrice(text){const values=(clean(text).match(/\d{1,5}(?:[ .]\d{3})*(?:[,.]\d{1,2})?/g)||[]).map(raw=>Number(raw.replace(/\s/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'))).filter(Number.isFinite);return values.length?values[values.length-1]:null}
function firstMatch(text,patterns){for(const p of patterns){const m=String(text||'').match(p);if(m)return m[1]||''}return ''}
function titleFromBlock(block){return clean(firstMatch(block,[/<h2\b[^>]*class=["'][^"']*(?:woocommerce-loop-product__title|product-title)[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i,/<h3\b[^>]*class=["'][^"']*(?:woocommerce-loop-product__title|product-title|name)[^"']*["'][^>]*>([\s\S]*?)<\/h3>/i,/<h4\b[^>]*>\s*<a\b[^>]*>([\s\S]*?)<\/a>/i,/<h3\b[^>]*>\s*<a\b[^>]*>([\s\S]*?)<\/a>/i]))}
function urlFromBlock(block,base){const links=[...String(block||'').matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map(m=>canonical(absolute(base,m[1]))).filter(Boolean);return links.find(url=>!/add-to-cart|wishlist|compare|javascript:/i.test(url))||''}
function priceFromWooBlock(block){
  const priceHtml=firstMatch(block,[/<span\b[^>]*class=["'][^"']*\bprice\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,/<p\b[^>]*class=["'][^"']*\bprice\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i]);
  if(priceHtml){const amounts=[...priceHtml.matchAll(/(?:woocommerce-Price-amount[^>]*>|<bdi>)([\s\S]*?)(?:<\/span>|<\/bdi>)/gi)].map(m=>numberFromPrice(m[1])).filter(Number.isFinite);if(amounts.length)return amounts[amounts.length-1];const fallback=numberFromPrice(priceHtml);if(fallback!=null)return fallback}
  const stripped=clean(block).replace(/\d{1,5}(?:[ .]\d{3})*(?:[,.]\d{1,2})?\s*(?:lei|ron)\s*(?:Retragere numerar|Portofel virtual)/gi,' ');
  const priceMatches=[...stripped.matchAll(/(\d{1,5}(?:[ .]\d{3})*(?:[,.]\d{1,2})?)\s*(?:lei|ron)\b/gi)].map(m=>Number(m[1].replace(/\s/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',','.'))).filter(Number.isFinite);
  return priceMatches.length?priceMatches[priceMatches.length-1]:null
}
function priceFromOpenCartBlock(block){const html=firstMatch(block,[/<p\b[^>]*class=["'][^"']*\bprice\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i,/<div\b[^>]*class=["'][^"']*\bprice\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i]);return numberFromPrice(html||block)}
function stockFromBlock(block){const t=norm(block);if(/stoc epuizat|indisponibil|out of stock|sold out|nu mai face parte din oferta/.test(t))return 'out_of_stock';if(/\bin stoc\b|adauga in cos|add to cart|cumpara/.test(t))return 'in_stock';return 'unknown'}
function inferBrand(title){const brands=['Ambition Mods','Arcana Mods','Aspire','BD Vape','BP Mods','Centenary Mods','Cthulhu','Damn Vape','Dovpo','Early Bird','Ennequadro Mods','Geekvape','Hellvape','Innokin','KHW Mods','Lost Vape','SvoeMesto','SvoëMesto','Taifun','Thunder Cloud','Vandy Vape','VandyVape','Vapefly','Vaporesso','Voopoo','Wotofo','Yachtvape','Wick N Vape','UD','Eleaf'];return brands.find(b=>norm(title).includes(norm(b)))||''}
function classify(title,hint){
  const t=norm(title);if(!t)return '';
  const rta=/\brta\b/.test(t),rda=/\brda\b/.test(t),rdta=/\brdta\b/.test(t);
  const platform=/dvarw|kayfun|taifun|bishop|pioneer|purity|millennium|chariot|by ka|squape|gtr/.test(t);
  const part=/\b(?:bell|chimney|chamber|camera|clopot|air ?pin|airflow pin|insert|reducer|tank|geam|glass|pyrex|psu|pei|ultem|drip ?tip|mustiuc|o ?ring|oring|spare|insulator|screw|surub|deck|510 pin|adaptor 510|adapter 510)\b/.test(t);
  if(part&&(rta||platform))return 'componente RTA';
  if(rta&&!rda&&!rdta)return 'RTA';if(rta&&(rda||rdta))return 'RTA/RDA mixed';if(!rta&&(rda||rdta))return 'RDA/RDTA';if(/\b(?:bridge|rba)\b/.test(t))return 'RBA/bridge';
  if(/\b(?:bf60|fl80)\b/.test(t)&&/dicodes/.test(t))return 'chipset/board';
  if(/\b(?:board|pcb|chipset|dna60|dna60c|dna75|dna75c|dna100c|evolv)\b/.test(t)&&!/atomizor|rta|rda|rdta/.test(t))return 'chipset/board';
  if(/\b(?:mod|box mod|sbs|side by side|squonk)\b/.test(t)&&!/atomizor|rta|rda|rdta|bridge|rba/.test(t))return 'mod';
  if(/\b(?:bumbac|rayon|vata|wick|wicking|cotton bacon|organic cotton|coton threads|holy fiber)\b/.test(t)&&!/aroma|lichid|liquid|cotton candy/.test(t))return 'bumbac/wick';
  const wire=/\b(?:sarma|wire|kanthal|ka1|nichrome|ni80|ss316l?|nife30|nife52|nife|ni200|clapton|fused clapton|alien|twisted)\b/.test(t);
  const prebuilt=/\b(?:prebuilt|pre built|coil|coils|rezistenta|rezistente)\b/.test(t)&&!/pod|cartus|cartridge|nautilus|gtl|pnp|tpp|rpm/.test(t);
  if(wire&&prebuilt)return 'coil prebuilt';if(wire)return 'sarma';
  if(/\b(?:acumulator|battery|baterie)\b/.test(t)&&/\b(?:18350|18650|20700|21700|26650|li ion|mah)\b/.test(t))return 'acumulator';
  if(/\b(?:incarcator|charger|charging)\b/.test(t)&&/\b(?:battery|baterie|acumulator|18350|18650|21700|slot)\b/.test(t))return 'incarcator';
  if(/\b(?:ohm ?meter|ohm ?reader|build ?tab|coil ?jig|penseta|tweezers|ceramic|cleste|cutter|foarfeca|scissors|tool ?kit|trusa|kit unelte|unelte|pliers)\b/.test(t))return 'unelte build';
  const tobacco=/\b(?:tutun|tobacco|virginia|burley|kentucky|latakia|oriental|turkish|perique|cigar|cavendish|balkan|english blend|american blend|ry4)\b/.test(t);
  const liquid=/\b(?:lichid|liquid|e liquid|eliquid|aroma|longfill|shortfill|concentrat|extract|shot)\b/.test(t);
  if(tobacco&&liquid)return 'lichid tutunos/NET/DIY';
  if(hint==='RTA'&&/atomizor|atomizer|tank/.test(t)&&!/nautilus|sub ohm|clearomiz|pod|cartus/.test(t))return 'RTA';
  return ''
}
function isFinishedDicodes(category,title){const t=norm(title);return /dicodes/.test(t)&&category==='mod'&&!/\b(?:bf60|fl80|board|placa|chipset|pcb)\b/.test(t)}
function dedupe(rows){const map=new Map();for(const row of rows){const key=`${row.retailerId}|${norm(row.product)}|${canonical(row.source)}`;if(!map.has(key))map.set(key,row);else{const old=map.get(key);map.set(key,{...old,priceRon:old.priceRon==null?row.priceRon:old.priceRon,stock:old.stock==='unknown'?row.stock:old.stock,brand:old.brand||row.brand})}}return [...map.values()]}

async function fetchText(url,userAgent){
  let lastError=null;
  for(let attempt=1;attempt<=3;attempt++){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch(url,{headers:{'user-agent':userAgent,'accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8','accept-language':'ro-RO,ro;q=0.9,en;q=0.7','cache-control':'no-cache'},redirect:'follow',signal:controller.signal});
      if(response.ok)return {url:response.url||url,text:await response.text()};
      lastError=new Error(`HTTP ${response.status}`);
      if(attempt===3||![403,408,425,429,500,502,503,504].includes(response.status))throw lastError;
    }catch(error){lastError=error;if(attempt===3)throw error}finally{clearTimeout(timer)}
    await sleep(750*attempt*attempt)
  }
  throw lastError||new Error('Fetch failed')
}
function pagination(html,base){const out=new Set();for(const m of html.matchAll(/href=["']([^"']+)["']/gi)){const href=m[1];if(!/(?:\/page\/\d+\/?|[?&](?:page|paged|p)=\d+)/i.test(href))continue;const u=canonical(absolute(base,href));if(u)out.add(u)}return [...out]}
function blocks(html,type){
  const patterns=type==='woo'?[/<li\b[^>]*class=["'][^"']*\bproduct\b[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi,/<div\b[^>]*class=["'][^"']*\bproduct\b[^"']*(?:type-product|product-grid|product-small)[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi]:[/<div\b[^>]*class=["'][^"']*\bproduct-(?:thumb|layout)\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi,/<div\b[^>]*class=["'][^"']*\bproduct-thumb\b[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi];
  const found=[];for(const re of patterns){for(const m of html.matchAll(re))found.push(m[0]);if(found.length)break}return found
}
function parsePage(retailer,pageUrl,html,type,hint,date){
  const rows=[];for(const block of blocks(html,type)){
    const title=titleFromBlock(block);const source=urlFromBlock(block,pageUrl);if(!title||!source)continue;const category=classify(title,hint);if(!category||isFinishedDicodes(category,title))continue;
    const priceRon=type==='woo'?priceFromWooBlock(block):priceFromOpenCartBlock(block);
    rows.push({retailerId:retailer.id,category,brand:inferBrand(title),product:title,priceRon,stock:stockFromBlock(block),observedAt:date,source,sourceMode:`specialized-${type}`})
  }return rows
}
async function collect(retailer,type,registry,date){
  const userAgent=registry.collectorPolicy.userAgent;const rows=[];const errors=[];const visited=new Set();let pagesFetched=0;let seedsSucceeded=0;let seedsFailed=0;
  for(const seed of retailer.seeds||[]){
    const queue=[seed.url];let seedOk=false;let pagesForSeed=0;const maxPages=Math.max(1,Math.min(Number(seed.maxPages||registry.collectorPolicy.maxPagesPerSeed||4),6));
    while(queue.length&&pagesForSeed<maxPages){
      const current=queue.shift();const key=canonical(current);if(visited.has(key))continue;visited.add(key);
      try{const fetched=await fetchText(current,userAgent);pagesFetched++;pagesForSeed++;seedOk=true;rows.push(...parsePage(retailer,fetched.url,fetched.text,type,seed.categoryHint,date));for(const next of pagination(fetched.text,fetched.url))if(!visited.has(next)&&queue.length<maxPages)queue.push(next)}catch(error){errors.push({url:current,error:String(error&&error.message||error).slice(0,180)})}
      await sleep(650)
    }
    if(seedOk)seedsSucceeded++;else seedsFailed++
  }
  const unique=dedupe(rows);
  return {retailerId:retailer.id,parser:type,pagesFetched,seedsConfigured:(retailer.seeds||[]).length,seedsSucceeded,seedsFailed,rows:unique,errors,collectionComplete:unique.length>0&&errors.length===0&&seedsFailed===0&&seedsSucceeded===(retailer.seeds||[]).length}
}

async function main(){
  const registry=readJson(REGISTRY_PATH);const market=readJson(MARKET_PATH);const date=today();if(date<ANALYSIS_START){console.log(`Specialized collector starts at ${ANALYSIS_START}; ${date}.`);return}
  const specialized={vapshop:'opencart',viciishop:'woo',tigaraego:'woo',vapersparadise:'woo',vapetronic:'woo',steamfactory:'woo',ecigvapo:'woo',merlin:'woo'};
  const results=[];
  for(const [id,type] of Object.entries(specialized)){
    const retailer=(registry.retailers||[]).find(r=>r.id===id);if(!retailer)continue;console.log(`Specialized ${type}: ${retailer.name}`);results.push(await collect(retailer,type,registry,date))
  }
  let observations=(market.observations||[]).filter(r=>String(r.observedAt||'')>=ANALYSIS_START);
  for(const result of results){if(result.rows.length)observations=observations.filter(r=>r.retailerId!==result.retailerId).concat(result.rows)}
  observations=dedupe(observations).sort((a,b)=>`${a.retailerId}|${a.category}|${a.product}`.localeCompare(`${b.retailerId}|${b.category}|${b.product}`,'ro'));
  market.observations=observations;
  market.analysisStart=ANALYSIS_START;
  market.analysisEnd=date;
  market.updatedAt=new Date().toISOString();
  market.specializedCollectorStatus={date,generatedAt:new Date().toISOString(),byRetailer:results.map(r=>({retailerId:r.retailerId,parser:r.parser,pagesFetched:r.pagesFetched,seedsConfigured:r.seedsConfigured,seedsSucceeded:r.seedsSucceeded,seedsFailed:r.seedsFailed,observations:r.rows.length,errors:r.errors,collectionComplete:r.collectionComplete}))};
  if(CHECK){console.log(JSON.stringify(market.specializedCollectorStatus,null,2));return}
  if(WRITE){writeJson(MARKET_PATH,market);console.log(`Specialized collectors wrote ${observations.length} total observations; `+results.map(r=>`${r.retailerId}:${r.rows.length}`).join(', '))}else console.log(JSON.stringify(market.specializedCollectorStatus,null,2))
}
main().catch(error=>{console.error(error&&error.stack||error);process.exitCode=1});
