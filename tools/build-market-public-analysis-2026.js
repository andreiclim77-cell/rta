#!/usr/bin/env node
'use strict';

const fs=require('fs');
const WRITE=process.argv.includes('--write');
const SALES='data/market-sales-2026.json';
const DEMAND='data/market-demand-intelligence-2026.json';
const EXTERNAL='data/market-external-intelligence-2026.json';
const RETAILERS='data/market-retailers-2026.json';
const OUT='data/market-analysis-public-2026.json';
const START='2026-01-01';
const PUBLIC_BRAND_LIMIT=10;
const PUBLIC_PRODUCT_LIMIT=10;
const CATEGORY_ORDER=['POD','RTA','mod','RBA/bridge','RDA/RDTA','componente RTA','accesoriu RTA/mod','sarma','coil prebuilt','bumbac/wick','chipset/board','acumulator','incarcator','unelte build'];
const CATEGORY_SET=new Set(CATEGORY_ORDER);
const {canonicalBrand,canonicalizeProduct,retailerOperatorMap}=require('./market-product-canonical-2026.js');

function read(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
function write(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function round(value,digits=2){const factor=10**digits;return Math.round(Number(value||0)*factor)/factor}
function rootUrl(value){try{const url=new URL(value);return url.pathname==='/'&&!url.search}catch(_){return false}}
function validRank(row){
  if(!row||!CATEGORY_SET.has(row.category)||!row.product||!Number.isFinite(Number(row.rank))||Number(row.rank)<1)return false;
  if(row.evidence==='verified-discovered-retailer-bestseller-page'&&rootUrl(row.source))return false;
  return true;
}
function categorySort(a,b){return CATEGORY_ORDER.indexOf(a.category)-CATEGORY_ORDER.indexOf(b.category)}

function rankingSnapshots(sales){
  let snapshots=(sales.rankingHistory||[]).filter(snapshot=>snapshot&&snapshot.date>=START&&Array.isArray(snapshot.rows));
  if(!snapshots.length)snapshots=[{date:String(sales.updatedAt||'').slice(0,10),rows:sales.rankings||[]}];
  const end=String(sales.updatedAt||'').slice(0,10);
  return snapshots.filter(snapshot=>/^\d{4}-\d{2}-\d{2}$/.test(String(snapshot.date||''))&&snapshot.date>=START&&snapshot.date<=end&&Number.isFinite(Date.parse(snapshot.date))&&new Date(snapshot.date).toISOString().slice(0,10)===snapshot.date);
}

function firstObservedDate(sales,snapshots){
  const dates=snapshots.filter(snapshot=>(snapshot.rows||[]).some(validRank)).map(snapshot=>String(snapshot.date||'')).filter(Boolean).sort();
  return dates[0]||null;
}

function summarizePanels(panels,labelKey,limit){
  const grouped=new Map();
  for(const row of panels.values()){
    if(!grouped.has(row.category))grouped.set(row.category,new Map());
    const category=grouped.get(row.category),key=row.entityKey;
    const item=category.get(key)||{name:row[labelKey],score:0,sources:new Set(),storefronts:new Set(),days:new Set(),bestRank:null,lastSeen:'',productUrl:'',evidenceWindows:new Set()};
    item.name=row[labelKey];
    item.score+=1/Math.sqrt(Number(row.rank));
    item.sources.add(row.operatorId);
    item.storefronts.add(row.retailerId);
    item.days.add(row.date);
    item.bestRank=item.bestRank==null?Number(row.rank):Math.min(item.bestRank,Number(row.rank));
    item.evidenceWindows.add(String(row.evidenceWindow||'retailer-defined-or-unspecified'));
    if(row.date>=item.lastSeen){item.lastSeen=row.date;item.productUrl=row.productUrl||item.productUrl}
    category.set(key,item);
  }
  return new Map([...grouped.entries()].map(([category,items])=>[category,[...items.values()]
    .sort((a,b)=>b.score-a.score||b.sources.size-a.sources.size||a.bestRank-b.bestRank||a.name.localeCompare(b.name))
    .slice(0,limit)
    .map(item=>({
      name:item.name,
      sourceCount:item.sources.size,
      storefrontCount:item.storefronts.size,
      bestRank:item.bestRank,
      observedDays:item.days.size,
      lastSeen:item.lastSeen,
      productUrl:labelKey==='productName'?item.productUrl:'',
      signalScore:round(item.score),
      evidenceWindow:item.evidenceWindows.size===1?[...item.evidenceWindows][0]:'mixed-public-ranking'
    }))]));
}

function observedPopularity(sales,retailers){
  const snapshots=rankingSnapshots(sales),operatorByRetailer=retailerOperatorMap(retailers),productPanels=new Map(),brandPanels=new Map();
  for(const snapshot of snapshots){
    for(const row of snapshot.rows||[]){
      if(!validRank(row))continue;
      const product=canonicalizeProduct(row),productKey=String(row.canonicalProductKey||product.key||norm(row.product));
      const retailerId=String(row.retailerId||row.source||'source'),operatorId=String(operatorByRetailer.get(retailerId)||retailerId);
      const common={category:row.category,date:snapshot.date,rank:Number(row.rank),retailerId,operatorId,productUrl:row.productUrl||row.source||'',evidenceWindow:row.evidenceWindow||'retailer-defined-or-unspecified'};
      if(productKey){
        const panelKey=[snapshot.date,operatorId,row.category,productKey].join('|');
        const candidate={...common,entityKey:productKey,productName:product.label||row.product};
        if(!productPanels.has(panelKey)||candidate.rank<productPanels.get(panelKey).rank)productPanels.set(panelKey,candidate);
      }
      const brand=canonicalBrand(row.brand,row.product);
      if(brand){
        const brandKey=norm(brand),panelKey=[snapshot.date,operatorId,row.category,brandKey].join('|');
        const candidate={...common,entityKey:brandKey,brandName:brand};
        if(!brandPanels.has(panelKey)||candidate.rank<brandPanels.get(panelKey).rank)brandPanels.set(panelKey,candidate);
      }
    }
  }
  const products=summarizePanels(productPanels,'productName',PUBLIC_PRODUCT_LIMIT),brands=summarizePanels(brandPanels,'brandName',PUBLIC_BRAND_LIMIT);
  return CATEGORY_ORDER.map(category=>({category,brands:brands.get(category)||[],products:products.get(category)||[]}))
    .filter(group=>group.brands.length||group.products.length).sort(categorySort);
}

function inferCategory(name){
  const value=norm(name);
  if(/\b(rta|rdl|mtl|atomizer|atomizor|kayfun|dvarw|taifun|bishop|minister|diplomat|mood)\b/.test(value))return'RTA';
  if(/\b(rda|rdta|dripper)\b/.test(value))return'RDA/RDTA';
  if(/\b(pod|aio|xlim|caliburn|xros|argus|wenax|vinci|ursa|orion)\b/.test(value))return'POD';
  if(/\b(mod|box|dicodes|dani|sbs)\b/.test(value))return'mod';
  return'RTA';
}

function nearDuplicateIdea(a,b){
  if(!a||!b||a.metricKind!==b.metricKind)return false;
  const compact=value=>norm(value).replace(/\b(?:rta|rda|rdta|rba|mtl|rdl|dl)\b/g,' ').replace(/\s+/g,' ').trim();
  const left=compact(a.name),right=compact(b.name),shorter=left.length<=right.length?left:right,longer=left.length<=right.length?right:left;
  if(shorter.split(' ').length<2||!longer.includes(shorter))return false;
  const av=Number(a.metricValue||0),bv=Number(b.metricValue||0),tolerance=Math.max(5,Math.max(av,bv)*0.02);
  return Math.abs(av-bv)<=tolerance;
}

function addIdea(groups,seen,row){
  const name=String(row.name||'').trim(),category=CATEGORY_SET.has(row.category)?row.category:inferCategory(name),brand=canonicalBrand(row.brand,name),key=category+'|'+norm(name);
  if(!name||!CATEGORY_SET.has(category))return;
  const categoryRows=groups.get(category)||[];
  const duplicate=categoryRows.find(existing=>nearDuplicateIdea(existing,row));
  if(duplicate){
    if(name.length>duplicate.name.length)duplicate.name=name;
    duplicate.score=Math.max(Number(duplicate.score||0),Number(row.score||0));
    duplicate.metricValue=Math.max(Number(duplicate.metricValue||0),Number(row.metricValue||0));
    duplicate.reviewCount=Math.max(Number(duplicate.reviewCount||0),Number(row.reviewCount||0));
    duplicate.recent30dReviews=Math.max(Number(duplicate.recent30dReviews||0),Number(row.recent30dReviews||0));
    if(!duplicate.brand&&brand)duplicate.brand=brand;
    return;
  }
  if(seen.has(key))return;
  seen.add(key);
  if(!groups.has(category))groups.set(category,categoryRows);
  categoryRows.push({...row,category,brand});
}

function buyingIdeaBrands(products){
  const grouped=new Map();
  for(const product of products){
    if(!product.brand)continue;
    const key=norm(product.brand),item=grouped.get(key)||{name:product.brand,scores:[],products:new Set(),signalKinds:new Set()};
    item.scores.push(Number(product.score||0));
    item.products.add(product.name);
    item.signalKinds.add(product.metricKind);
    grouped.set(key,item);
  }
  return [...grouped.values()].map(item=>({
    name:item.name,
    trackedProducts:item.products.size,
    signalKinds:[...item.signalKinds].sort(),
    interestScore:round(item.scores.sort((a,b)=>b-a).slice(0,3).reduce((sum,value)=>sum+value,0))
  })).sort((a,b)=>b.interestScore-a.interestScore||b.trackedProducts-a.trackedProducts||a.name.localeCompare(b.name)).slice(0,PUBLIC_BRAND_LIMIT);
}

function buyingIdeas(demand,external){
  const groups=new Map(),seen=new Set();
  for(const row of demand.products||[]){
    const google=Number(row.google&&row.google.avgMonthlySearches||0),guide=Number(row.guide&&row.guide.searches30d||0),community=Number(row.communityObservedMentions||0);
    if(google+guide+community<=0)continue;
    const score=Math.log1p(google)*12+Math.log1p(guide)*8+Math.log1p(community)*5;
    let metricKind='community-mentions',metricValue=community;
    if(google>0){metricKind='google-monthly-searches';metricValue=google}
    else if(guide>0){metricKind='guide-searches-30d';metricValue=guide}
    addIdea(groups,seen,{name:row.name,brand:row.brand,category:row.category,score,metricKind,metricValue});
  }
  const youtube=external&&external.youtubeInterest||{};
  for(const row of youtube.models||[]){
    const views=Number(row.totalViews||0),videos=Number(row.videoCount||0);
    if(views<=0||videos<=0)continue;
    addIdea(groups,seen,{
      name:row.name,
      brand:row.brand,
      category:inferCategory(row.name),
      score:Math.log1p(views)*8+Number(row.recent30dVideos||0)*12+Number(row.recent90dVideos||0)*5,
      metricKind:'public-review-views',
      metricValue:views,
      reviewCount:videos,
      recent30dReviews:Number(row.recent30dVideos||0)
    });
  }
  return [...groups.entries()].map(([category,products])=>{
    const ordered=products.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
    return{
      category,
      brands:buyingIdeaBrands(ordered),
      products:ordered.slice(0,PUBLIC_PRODUCT_LIMIT).map(item=>({
        name:item.name,
        brand:item.brand||'',
        metricKind:item.metricKind,
        metricValue:item.metricValue,
        reviewCount:item.reviewCount||0,
        recent30dReviews:item.recent30dReviews||0,
        interestScore:round(item.score)
      }))
    };
  }).filter(group=>group.products.length).sort(categorySort);
}

function build(){
  const sales=read(SALES),demand=read(DEMAND),external=read(EXTERNAL),retailers=read(RETAILERS);
  const snapshots=rankingSnapshots(sales),popularity=observedPopularity(sales,retailers),ideas=buyingIdeas(demand,external),evidenceStart=firstObservedDate(sales,snapshots);
  if(!popularity.length)throw new Error('Public Analysis has no observed commercial rankings');
  if(!ideas.length)throw new Error('Public Analysis has no measured buying-interest ideas');
  return{
    schemaVersion:2,
    scopeYear:2026,
    analysisStart:START,
    updatedAt:sales.updatedAt||sales.summary&&sales.summary.generatedAt||new Date().toISOString(),
    refreshTarget:'06:00 Europe/Bucharest',
    methodology:{
      observedPopularity:'Aggregated reciprocal-rank evidence from public retailer bestseller and popularity lists, deduplicated by operator, date, category and canonical product or brand. It is not exact period or national unit sales.',
      buyingIdeas:'Measured public search, guide or community interest when available; public review-view interest is used as a labelled fallback.',
      availability:'Current availability, zero-stock labels and stock alerts are excluded from both public sections.'
    },
    truth:{
      requestedStart:START,
      evidenceFirstObservedAt:evidenceStart,
      evidenceEndObservedAt:String(sales.updatedAt||'').slice(0,10)||null,
      exactPeriodUnitsAvailable:Boolean(sales.coverage&&sales.coverage.periodUnitSalesAvailable),
      nationalMarketShareAvailable:Boolean(sales.coverage&&sales.coverage.nationalMarketShareAvailable),
      availabilityExcluded:true,
      buyingInterestSeparatedFromSales:true,
      historicalBackfillInvented:false,
      cumulativeRankingsNeverLabelledAsPeriodSales:true,
      brandAndProductRankingsSeparated:true,
      operatorDateDeduplication:true
    },
    coverage:{
      configuredStores:Number(sales.coverage&&sales.coverage.storefrontsConfigured||0),
      rankingStores:Number(sales.coverage&&sales.coverage.storefrontsWithRetailerSalesRanking||0),
      snapshots:snapshots.length,
      demandProducts:Number(demand.coverage&&demand.coverage.productsTracked||0),
      youtubeModels:Number(external.coverage&&external.coverage.youtubeTotalModels||0)
    },
    observedPopularity:popularity,
    buyingIdeas:ideas
  };
}

if(require.main===module){
  const output=build();
  if(WRITE)write(OUT,output);
  console.log(`Public Analysis: ${output.observedPopularity.length} popularity categories; ${output.buyingIdeas.length} interest categories; ${output.coverage.rankingStores}/${output.coverage.configuredStores} ranking stores.`);
}

module.exports={rankingSnapshots,firstObservedDate,observedPopularity,buyingIdeas,build};
