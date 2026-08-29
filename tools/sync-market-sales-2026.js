#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const ROOT=path.resolve(__dirname,'..');
const REGISTRY=path.join(ROOT,'data','market-retailers-2026.json');
const OUT=path.join(ROOT,'data','market-sales-2026.json');
const WRITE=process.argv.includes('--write');
function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
function writeJson(p,v){fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n','utf8')}
function today(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Bucharest',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`}
function clean(v){return String(v||'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function classify(title){const t=norm(title);if(/\brta\b/.test(t)&&!/\brda\b|\brdta\b/.test(t))return 'RTA';if(/\brba\b|\bbridge\b/.test(t))return 'RBA/bridge';if(/\bkanthal\b|\bni80\b|\bnife\b|\bss316\b|\bwire\b|\bsarma\b/.test(t))return /\bcoil|rezistent/.test(t)?'coil prebuilt':'sarma';if(/\bbumbac\b|\bcotton\b|\bwick\b|\bvata\b/.test(t))return 'bumbac/wick';if(/\bmod\b|\bsbs\b|side by side/.test(t))return 'mod';if(/\bbf60\b|\bfl80\b|\bboard\b|\bchipset\b|\bpcb\b/.test(t))return 'chipset/board';if(/\b18650\b|\b21700\b|\bacumulator\b|\bbattery\b/.test(t))return 'acumulator';if(/\bcharger\b|\bincarcator\b/.test(t))return 'incarcator';if(/\btutun\b|\btobacco\b|\bvirginia\b|\blatakia\b|\bburley\b|\bkentucky\b/.test(t))return 'lichid tutunos/NET/DIY';return ''}
async function fetchJson(url,ua){const c=new AbortController();const tm=setTimeout(()=>c.abort(),15000);try{const r=await fetch(url,{headers:{'user-agent':ua,'accept':'application/json'},signal:c.signal,redirect:'follow'});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json()}finally{clearTimeout(tm)}}
function productUrl(p){return String((p&&p.permalink)||'')}
function title(p){return clean(p&&p.name)}
function units(p){const candidates=[p&&p.total_sales,p&&p.totalSales,p&&p.sales_count,p&&p.sold_count,p&&p.units_sold];for(const v of candidates){const n=Number(v);if(Number.isFinite(n)&&n>=0)return n}return null}
async function inspectWoo(retailer,ua,date){let origin;try{origin=new URL(retailer.url).origin}catch(_){return null}const endpoint=`${origin}/wp-json/wc/store/v1/products?orderby=popularity&order=desc&per_page=100&page=1`;
  try{const rows=await fetchJson(endpoint,ua);if(!Array.isArray(rows))throw new Error('non-array response');const rankings=[];const actual=[];let rank=0;for(const p of rows){rank++;const name=title(p);const category=classify(name);if(!category)continue;const row={retailerId:retailer.id,category,product:name,rank,observedAt:date,source:endpoint,productUrl:productUrl(p),evidence:'woocommerce-public-popularity-order'};rankings.push(row);const sold=units(p);if(sold!=null)actual.push({...row,unitsSold:sold,evidence:'public-explicit-unit-sales'});}
    return {retailerId:retailer.id,supported:true,source:endpoint,rankingCount:rankings.length,actualSalesCount:actual.length,rankings,actualSales:actual,error:null};
  }catch(error){return {retailerId:retailer.id,supported:false,source:endpoint,rankingCount:0,actualSalesCount:0,rankings:[],actualSales:[],error:String(error&&error.message||error).slice(0,180)}}
}
async function main(){const registry=readJson(REGISTRY);const prior=fs.existsSync(OUT)?readJson(OUT):{};const date=today();const ua=registry.collectorPolicy&&registry.collectorPolicy.userAgent||'Ghid-RTA-Market-Observatory/4.0';const statuses=[];const rankings=[];const actual=[];
  for(const r of registry.retailers||[]){const result=await inspectWoo(r,ua,date);statuses.push({retailerId:r.id,retailerName:r.name,supported:result.supported,source:result.source,rankingCount:result.rankingCount,actualSalesCount:result.actualSalesCount,error:result.error});rankings.push(...result.rankings);actual.push(...result.actualSales)}
  const rankingRetailers=new Set(rankings.map(x=>x.retailerId)).size;const actualRetailers=new Set(actual.map(x=>x.retailerId)).size;const configured=(registry.retailers||[]).length;
  const snapshot={date,rankings:rankings.length,actualSalesRows:actual.length,retailersWithRanking:rankingRetailers,retailersWithActualUnits:actualRetailers};
  const history=(prior.history||[]).filter(x=>x.date!==date&&/^2026-/.test(String(x.date||'')));history.push(snapshot);history.sort((a,b)=>a.date.localeCompare(b.date));
  const out={schemaVersion:1,scopeYear:2026,updatedAt:new Date().toISOString(),methodology:{actualSalesOnly:true,noStockInference:true,unitsSoldRule:'unitsSold este populat numai din camp public explicit sau feed direct comerciant.',rankingRule:'Ranking-ul retailerului este pastrat separat si nu este convertit in unitati vandute.',marketShareRule:'Cotele nationale pe unitati/valoare se calculeaza numai cand exista acoperire reala comparabila; in caz contrar sunt indisponibile.'},coverage:{storefrontsConfigured:configured,storefrontsWithActualUnitSales:actualRetailers,storefrontsWithRetailerSalesRanking:rankingRetailers,actualUnitSalesCoveragePct:configured?Number((actualRetailers/configured*100).toFixed(1)):0,nationalUnitsSoldAvailable:actualRetailers===configured&&configured>0,nationalMarketShareAvailable:actualRetailers===configured&&configured>0},retailerStatus:statuses,rankings,actualSales:actual,history};
  if(WRITE){writeJson(OUT,out);console.log(`Sales signals: ${rankingRetailers}/${configured} retailers with public popularity ranking; ${actualRetailers}/${configured} with explicit unit sales.`)}else console.log(JSON.stringify(out,null,2));
}
main().catch(e=>{console.error(e&&e.stack||e);process.exitCode=1});
