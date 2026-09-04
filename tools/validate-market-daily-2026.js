#!/usr/bin/env node
'use strict';
const fs=require('fs');
function read(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
const data=read('data/market-2026.json'),registry=read('data/market-retailers-2026.json'),coverage=read('data/market-coverage-2026.json');
const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Bucharest',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const configured=registry.retailers||[],obs=data.observations||[],status=data.collectorStatus||{},special=data.specializedCollectorStatus||{},pv=data.priceVerificationStatus||{};
const ANALYSIS_START='2026-01-01';
if(Number(data.scopeYear)!==2026||Number(registry.scopeYear)!==2026)throw new Error('Market scope drifted outside 2026');
if(!obs.length)throw new Error('No observations produced');
if(configured.length<19)throw new Error('National retailer registry unexpectedly shrank below 19 storefronts');
if(status.date!==today)throw new Error(`Market snapshot stale: ${status.date} vs ${today}`);
if(Number(status.retailersConfigured||0)!==configured.length)throw new Error('Collector status storefront mismatch');
if(special.date!==today)throw new Error('Specialized collector not fresh');
if(pv.date!==today||Number(pv.failed||0)!==0)throw new Error(`Price verification failed/stale: ${pv.failed}`);
if(coverage.date!==today||Number(coverage.coverage&&coverage.coverage.storefrontsConfigured||0)!==configured.length)throw new Error('Coverage audit stale/mismatch');
if(registry.nationalAudit&&registry.nationalAudit.discoveryCertified!==true&&coverage.nationalClaim&&coverage.nationalClaim.allowed===true)throw new Error('100% Romania claim became true too early');
for(const r of obs){
 if(String(r.observedAt||'')<ANALYSIS_START)throw new Error(`Out-of-scope observation: ${r.product||'unknown'}`);
 const text=[r.brand,r.product].filter(Boolean).join(' ');
 if(/dicodes/i.test(text)&&r.category==='mod'&&!/(bf60|fl80|board|placa|chipset|pcb)/i.test(text))throw new Error(`Finished Dicodes mod leaked: ${text}`);
 if(/^\[object Object\]$/i.test(String(r.brand||'')))throw new Error(`Invalid brand: ${r.product||'unknown'}`);
 if(['viciishop','tigaraego'].includes(r.retailerId)&&r.category==='RTA'&&Number(r.priceRon)>0&&Number(r.priceRon)<20)throw new Error(`Cashback leaked as RTA price: ${r.product}=${r.priceRon}`);
}
console.log(`Validated ${obs.length} Market observations across ${configured.length} storefronts. Romania100=${coverage.nationalClaim.allowed}.`);
