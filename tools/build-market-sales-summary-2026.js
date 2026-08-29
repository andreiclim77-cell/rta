#!/usr/bin/env node
'use strict';
const fs=require('fs');
const WRITE=process.argv.includes('--write');
function read(p){return JSON.parse(fs.readFileSync(p,'utf8'))}function write(p,v){fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n','utf8')}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
const sales=read('data/market-sales-2026.json'),market=read('data/market-2026.json');
const brandMap=new Map();for(const r of market.observations||[]){if(r.brand)brandMap.set(`${r.retailerId}|${norm(r.product)}`,r.brand)}
const known=['Ambition Mods','Arcana Mods','Aspire','Auguse','BP Mods','Centenary Mods','Cthulhu','Dicodes','Dovpo','Early Bird','Ennequadro Mods','Geekvape','Hellvape','Innokin','KHW Mods','Lost Vape','SvoeMesto','SvoëMesto','Taifun','Vandy Vape','Vapefly','Vaporesso','Voopoo','Wotofo','Yachtvape','YiHi','La Tabaccheria','The Vaping Gentlemen Club','Wick N Vape','Fumytech','Coilology','Steam Crave'];
function inferBrand(r){const exact=brandMap.get(`${r.retailerId}|${norm(r.product)}`);if(exact)return exact;const t=norm(r.product);return known.find(b=>t.includes(norm(b)))||''}
function enrich(rows){return(rows||[]).map(r=>({...r,brand:r.brand||inferBrand(r)}))}
sales.rankings=enrich(sales.rankings);sales.actualSales=enrich(sales.actualSales);
function aggregate(rows,valueFn,keyFn){const m={};for(const r of rows){const k=keyFn(r);if(!k)continue;m[k]=(m[k]||0)+valueFn(r)}const total=Object.values(m).reduce((a,b)=>a+b,0);return Object.entries(m).map(([name,value])=>({name,value:Number(value.toFixed(4)),sharePct:total?Number((value/total*100).toFixed(2)):0})).sort((a,b)=>b.value-a.value)}
const rankScore=r=>1/Math.max(1,Number(r.rank)||1);
const rankingProducts=aggregate(sales.rankings,rankScore,r=>r.product).slice(0,50);
const rankingBrands=aggregate(sales.rankings,rankScore,r=>r.brand).slice(0,30);
const rankingCategories=aggregate(sales.rankings,rankScore,r=>r.category).slice(0,30);
const deltaRows=(sales.actualSales||[]).filter(r=>Number.isFinite(Number(r.unitsSoldDelta))&&Number(r.unitsSoldDelta)>=0);
const deltaValue=r=>Number(r.unitsSoldDelta)||0;
const measuredProducts=aggregate(deltaRows,deltaValue,r=>r.product).slice(0,50);
const measuredBrands=aggregate(deltaRows,deltaValue,r=>r.brand).slice(0,30);
const measuredCategories=aggregate(deltaRows,deltaValue,r=>r.category).slice(0,30);
function historyMap(rows){const m=new Map();for(const r of rows||[])m.set(`${r.retailerId}|${r.category}|${norm(r.product)}`,r);return m}
const rh=sales.rankingHistory||[];let movers=[];if(rh.length>=2){const prev=historyMap(rh[rh.length-2].rows),cur=rh[rh.length-1].rows||[];movers=cur.map(r=>{const p=prev.get(`${r.retailerId}|${r.category}|${norm(r.product)}`);return p?{...r,previousRank:Number(p.rank),rankChange:Number(p.rank)-Number(r.rank)}:null}).filter(r=>r&&r.rankChange!==0).sort((a,b)=>Math.abs(b.rankChange)-Math.abs(a.rankChange)).slice(0,50)}
sales.summary={
  generatedAt:new Date().toISOString(),
  observedBestsellerIndex:{method:'reciprocal-rank aggregation of Tier-B retailer bestseller/popularity lists; this is not unit market share',coveragePct:Number(sales.coverage&&sales.coverage.rankingCoveragePct||0),topProducts:rankingProducts,topBrands:rankingBrands,topCategories:rankingCategories},
  measuredUnitSales:{method:'positive deltas of Tier-A explicit cumulative unit counters only',coveragePct:Number(sales.coverage&&sales.coverage.actualUnitSalesCoveragePct||0),national:Boolean(sales.coverage&&sales.coverage.nationalMarketShareAvailable),topProducts:measuredProducts,topBrands:measuredBrands,topCategories:measuredCategories,totalObservedUnits:deltaRows.reduce((s,r)=>s+deltaValue(r),0)},
  rankMovers:movers
};
if(WRITE){write('data/market-sales-2026.json',sales);console.log(`Built sales synthesis: ranking coverage ${sales.summary.observedBestsellerIndex.coveragePct}%, Tier-A unit coverage ${sales.summary.measuredUnitSales.coveragePct}%.`)}else console.log(JSON.stringify(sales.summary,null,2));
