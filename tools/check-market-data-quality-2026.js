#!/usr/bin/env node
'use strict';

const fs=require('fs');
const {registry,classifyPodProduct,norm}=require('./market-pod-classifier-2026.js');
const {canonicalizeProduct}=require('./market-product-canonical-2026.js');

function read(file,fallback={}){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function need(condition,message){if(!condition)throw new Error(message)}

const podRegistry=registry(),makers=podRegistry.makers||[],segments=podRegistry.segments||[];
need(makers.length>=60,`POD registry too small: ${makers.length}`);
need(segments.length===4,`POD segment count changed: ${segments.length}`);
const makerKeys=makers.map(function(maker){return norm(maker.name)});
need(new Set(makerKeys).size===makerKeys.length,'Duplicate POD maker in registry');

for(const sample of [
  ['Vaporesso XROS 5 Mini Pod Kit','Vaporesso'],
  ['Uwell Caliburn G5 Lite Pod Kit','Uwell'],
  ['DotMod dotPod Max Pod System','DotMod'],
  ['KIWI 2 Starter Kit','KIWI Vapor']
])need(classifyPodProduct(sample[0],sample[1]),`POD classifier missed: ${sample[0]}`);

for(const sample of [
  'Nord hospital train schedule',
  'Air definition and meaning',
  'FUNCTION OF RTA KARACHI',
  'Arcana Mods 510 PVC protective discs set',
  'Uwell Caliburn replacement cartridge 4 pack'
])need(!classifyPodProduct(sample),`POD false positive: ${sample}`);

const broken=`528 Custom Vapes Atomizoare > Atomizoare Servisabile','Atomizoare');\"> Goon by`;
const cleaned=canonicalizeProduct({product:broken,brand:''}).label;
need(!/Custom Vapes|Servisabile|\);|[<>]/i.test(cleaned),`Canonical title still corrupt: ${cleaned}`);
const vPrimeKeys=['VPRIME 2','OXVA VPrime 2 Pod Kit','OXVA VPrime 2 Pod Vape Kit','OXVA VPrime 2 Vape Bundle'].map(product=>canonicalizeProduct({product,brand:'OXVA'}).key);
need(new Set(vPrimeKeys).size===1,`VPrime color/bundle variants are not canonicalized together: ${vPrimeKeys.join(', ')}`);
const rayden=canonicalizeProduct({product:'Rayden 220 Limited Edition Box Mod by BD Vape',brand:'BD Vape'});
need(rayden.brand==='BD Vape'&&rayden.model==='Rayden 220',`Rayden brand/model canonicalization is wrong: ${rayden.label}`);

const sourceConfig=read('data/market-hype-sources-2026.json'),configuredSources=sourceConfig.directCatalogSources||[],enabledSources=configuredSources.filter(function(source){return source.directCatalogEnabled!==false}),disabledSources=configuredSources.filter(function(source){return source.directCatalogEnabled===false});
need(Number(sourceConfig.schemaVersion)>=8,'Expanded public-source registry schema is missing');
need(configuredSources.length>=45,`Direct public-source registry is too small: ${configuredSources.length}`);
need(new Set(configuredSources.map(source=>source.id)).size===configuredSources.length,'Duplicate direct-source ID in registry');
const hype=read('data/market-hype-products-2026.json'),pods=read('data/market-hype-pods-2026.json');
need(hype.scan&&hype.scan.activeMakerRejections,'RTA/MOD Hype rejection audit missing');
need(Number.isFinite(Number(hype.scan.activeMakerConcreteProducts)),'RTA/MOD concrete-product count missing');
need(Array.isArray(hype.verificationQueue),'RTA/MOD verification queue missing');
need(pods.scan&&pods.scan.rejections,'POD Hype rejection audit missing');
need(Array.isArray(pods.verificationQueue),'POD verification queue missing');

for(const data of [hype,pods]){
  const reference=Date.parse(data.snapshotReferenceAt),windowMs=30*24*60*60*1000,forecastMs=180*24*60*60*1000;
  need(Number.isFinite(reference),'Hype snapshot reference missing');
  const seen=new Set();
  for(const product of data.products||[]){
    const event=Date.parse(product.eventDate),key=product.category+'|'+canonicalizeProduct({product:product.productName,brand:product.brand||''}).key;
    need(product.productName&&Number.isFinite(event),`Invalid published Hype product: ${product.productName||'unnamed'}`);
    need(Array.isArray(product.sources)&&product.sources.length>0,`Hype source missing: ${product.productName}`);
    need(!seen.has(key),`Duplicate Hype event: ${product.productName}`);seen.add(key);
    if(product.window==='before'&&product.signalWindowOnly===true){const observed=Date.parse(product.signalObservedAt);need(product.confidenceTier==='public-signal'&&product.dateConfidence==='forecast-eta',`Long-range ETA was labelled as a launch: ${product.productName}`);need(Number.isFinite(observed)&&observed>=reference-windowMs&&observed<=reference+864e5,`Signal observation outside 30 days: ${product.productName}`);need(event>reference+windowMs&&event<=reference+forecastMs,`Forecast ETA outside 180 days: ${product.productName}`)}
    else if(product.window==='before')need(Math.abs(event-reference)<=windowMs,`Before event outside 30 days: ${product.productName}`);
    else need(event<=reference&&reference-event<=windowMs,`After event outside 30 days: ${product.productName}`);
  }
  const events=(data.products||[]).filter(product=>product.confidenceTier?product.confidenceTier==='confirmed'||product.confidenceTier==='reported':['explicit','catalog-published-at','official-product-published-at','release-observed','first-retail-observation'].includes(product.dateConfidence));
  need(Number(data.summary&&data.summary.total)===events.length,'Dated-event summary does not match published rows');
  need(Number(data.summary&&data.summary.publicSignals)===(data.products||[]).length-events.length,'Public-signal summary does not match published rows');
  need(data.truth&&data.truth.priorExistenceDemotesRetailRelisting===true&&data.truth.singleRetailerListingNeedsCorroboration===true&&data.truth.signalObservationWindowDays===30&&data.truth.forecastHorizonDays===180&&data.truth.longRangeSignalsAreNotLaunches===true,'Retail novelty or signal-window arbitration is missing');
  for(const product of events.filter(function(row){return row.dateConfidence==='catalog-published-at'})){const sources=product.sources||[],official=sources.some(function(source){return/^manufacturer-official/.test(String(source.sourceType||''))}),clone=sources.some(function(source){return source.sourceType==='clone-retailer-direct'}),explicit=sources.some(function(source){return source.decisionEligible!==false&&source.dateConfidence==='dated-public-evidence'&&/\b(?:launch|lansare|released|release|introducing|available now)\b/i.test(String(source.stage||'')+' '+String(source.title||''))}),retailHosts=new Set(sources.filter(function(source){return/retailer-direct/.test(String(source.sourceType||''))&&!/promotion/.test(String(source.sourceType||''))}).map(function(source){return source.host}));need(official||clone||explicit||retailHosts.size>=2,`Single retail page promoted without corroboration: ${product.productName}`)}
}

const badPod=/\b(?:itaste svd|nunchaku mini|plexus pro|e liquid|e juice|vape juice|nicotine pouch|replacement cartridge|empty pod)\b/i;
for(const product of pods.products||[])need(!badPod.test(product.productName),`Non-POD product leaked into POD Hype: ${product.productName}`);
const prime=(hype.products||[]).find(product=>/prime minister/i.test(product.productName));
if(prime)need(prime.confidenceTier==='public-signal'&&prime.signalKind==='dated-retail-promotion','Prime Minister promotion was incorrectly promoted to a new release');
const history=read('data/market-hype-known-history-2026.json',{entries:[]});
for(const prior of history.entries||[]){const data=prior.category==='POD'?pods:hype,key=prior.category+'|'+canonicalizeProduct({product:prior.productName,brand:prior.brand||''}).key,row=(data.products||[]).find(function(product){return product.category+'|'+canonicalizeProduct({product:product.productName,brand:product.brand||''}).key===key});if(row&&['catalog-published-at','first-retail-observation'].includes(row.dateConfidence))need(row.confidenceTier==='public-signal'&&row.signalKind==='recent-listing-known-model',`Known model was promoted by a fresh retail page: ${row.productName}`)}

const direct=read('data/market-hype-direct-catalogs-2026.json'),dated=read('data/market-hype-dated-news-2026.json'),campaigns=read('data/market-hype-retail-campaigns-2026.json');
need(direct.scan&&Number(direct.scan.sourcesConfigured)===enabledSources.length,`Direct catalog scan/config mismatch: ${direct.scan&&direct.scan.sourcesConfigured}/${enabledSources.length}`);
need(Number(direct.scan.sourcesConfiguredTotal)===configuredSources.length,`Direct catalog total registry mismatch: ${direct.scan&&direct.scan.sourcesConfiguredTotal}/${configuredSources.length}`);
need(Number(direct.scan.sourcesSkipped)===disabledSources.length,`Direct catalog skipped-source mismatch: ${direct.scan&&direct.scan.sourcesSkipped}/${disabledSources.length}`);
need(Number(direct.scan.sourcesWorking)>=Math.ceil(enabledSources.length*.9),`Direct catalog coverage is incomplete: ${direct.scan.sourcesWorking}/${enabledSources.length}`);
need(direct.truth&&direct.truth.sitemapLastmodIsNeverUsedAsLaunchDate===true&&direct.truth.jsonLdCatalogCoverageDoesNotCreateLaunchEvents===true,'Sitemap/JSON-LD launch-date protection is missing');
need(Array.isArray(direct.sourceRuns)&&direct.sourceRuns.length===enabledSources.length,'Direct adapter telemetry is incomplete');
need(Array.isArray(direct.skippedSources)&&disabledSources.every(function(source){return direct.skippedSources.some(function(row){return row.id===source.id&&row.reason})}),'Skipped direct-source telemetry is incomplete');
need(direct.sourceRuns.filter(run=>run.ok).every(run=>run.adapterUsed),'Working direct source is missing adapter telemetry');
const sitemapIds=new Set(configuredSources.filter(source=>source.catalogType==='sitemap-jsonld-products').map(source=>source.id));
for(const item of direct.items||[])if(sitemapIds.has(item.sourceId))need(!item.publishedAt,`Sitemap lastmod leaked into publication date: ${item.productName}`);
need(dated.scan&&Number(dated.scan.newsQueriesWorking)>=Math.floor(Number(dated.scan.newsQueries)*0.8),'Dated-news search coverage is too low');
need(dated.scan&&Number(dated.scan.wordpressSourcesWorking)>=Math.floor(Number(dated.scan.wordpressSources)*0.8),'Dated WordPress coverage is too low');
const campaignPages=Number(campaigns.scan&&campaigns.scan.pages),campaignWorking=Number(campaigns.scan&&campaigns.scan.pagesWorking),campaignMinimum=Math.ceil(campaignPages*.8);
need(campaigns.scan&&campaignPages>0&&campaignWorking>=campaignMinimum,`Retail campaign coverage is too low: ${campaignWorking}/${campaignPages}`);
need(campaigns.scan.coverageStatus===(campaignWorking===campaignPages?'complete':'partial'),'Retail campaign coverage status is inconsistent');

console.log(`Market data quality OK: ${makers.length} POD makers; ${segments.length} segments; ${(hype.products||[]).length} RTA/MOD monitored; ${(hype.verificationQueue||[]).length} RTA/MOD queued; ${(pods.products||[]).length} POD monitored; ${(pods.verificationQueue||[]).length} POD queued; direct ${direct.scan.sourcesWorking}/${direct.scan.sourcesConfigured}; news ${dated.scan.newsQueriesWorking}/${dated.scan.newsQueries}; WP ${dated.scan.wordpressSourcesWorking}/${dated.scan.wordpressSources}.`);
