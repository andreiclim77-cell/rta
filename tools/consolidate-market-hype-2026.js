#!/usr/bin/env node
'use strict';

const fs=require('fs');
const crypto=require('crypto');
const {snapshotReferenceMs}=require('./hype-window-reference-2026.js');
const {canonicalizeProduct,norm}=require('./market-product-canonical-2026.js');
const {classifyPodProduct}=require('./market-pod-classifier-2026.js');

const WRITE=process.argv.includes('--write');
const FILES=['data/market-hype-products-2026.json','data/market-hype-pods-2026.json'];
const HISTORY_FILE='data/market-hype-known-history-2026.json';
const REF=snapshotReferenceMs();
const DAY=86400000;
const WINDOW_DAYS=30;
const TIER_RANK={confirmed:3,reported:2,'public-signal':1};
const STRONG_DATES=new Set(['explicit','catalog-published-at','official-product-published-at','release-observed','first-retail-observation']);
const DATE_RANK={explicit:7,'official-product-published-at':6,'catalog-published-at':5,'release-observed':4,'dated-public-evidence':3,'signal-publication':2,'dated-retail-campaign':1,'first-retail-observation':0};

function read(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
function save(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function hash(value){return crypto.createHash('sha256').update(String(value||'')).digest('hex').slice(0,20)}
function unique(values){return Array.from(new Set((values||[]).filter(Boolean)))}
function ms(value){const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:null}
function eventRank(row){if(TIER_RANK[row.confidenceTier])return TIER_RANK[row.confidenceTier];return STRONG_DATES.has(row.dateConfidence)?2:1}
function isEvent(row){return eventRank(row)>=2}
function inWindow(row){const value=ms(row.eventDate);if(value==null)return false;if(row.window==='before')return Math.abs(value-REF)<=WINDOW_DAYS*DAY;return row.window==='after'&&value<=REF&&REF-value<=WINDOW_DAYS*DAY}
function key(row){const canonical=canonicalizeProduct({product:row.productName||'',brand:row.brand||''});return[String(row.category||''),canonical.key].join('|')}
function betterName(a,b,brand){function score(value){const text=String(value||'').trim();let result=text.length;if(!text)result+=1000;if(brand&&!norm(text).includes(norm(brand)))result+=80;if(/\b(?:buy|cheap|sale|deal)\b/i.test(text))result+=50;return result}return score(b)<score(a)?b:a}
function sourceKey(source){return String(source.url||'')+'|'+String(source.eventDate||'')+'|'+String(source.collector||source.sourceType||'')}
function earliestIso(values){const parsed=values.map(ms).filter(function(value){return value!=null});return parsed.length?new Date(Math.min(...parsed)).toISOString():null}
const priorHistory=fs.existsSync(HISTORY_FILE)?read(HISTORY_FILE):{entries:[]};
const priorByKey=new Map((priorHistory.entries||[]).map(function(entry){return[key(entry),entry]}));
function normalizeFromEvidence(input){
  const row={...input},sources=(row.sources||[]).filter(function(source){return ms(source.eventDate)!=null});
  if(!sources.length)return row;
  const best=sources.slice().sort(function(a,b){return(DATE_RANK[b.dateConfidence]||0)-(DATE_RANK[a.dateConfidence]||0)||ms(a.eventDate)-ms(b.eventDate)})[0],currentRank=DATE_RANK[row.dateConfidence]||0,bestRank=DATE_RANK[best.dateConfidence]||0;
  if(bestRank<currentRank)return row;
  row.eventDate=best.eventDate;row.stageEvidenceAt=best.eventDate;row.dateConfidence=best.dateConfidence;row.stageLabel=best.stage||row.stageLabel;
  if(best.dateConfidence==='dated-retail-campaign'){row.confidenceTier='public-signal';row.signalKind='dated-retail-promotion';row.stage='RETAIL_PROMOTION'}
  else if(best.dateConfidence==='official-product-published-at'){row.confidenceTier='confirmed';row.signalKind=row.window==='before'?'confirmed-announcement':'confirmed-listing'}
  else if(best.dateConfidence==='catalog-published-at'){row.confidenceTier='reported';row.signalKind=row.window==='before'?'dated-pre-market-listing':'dated-retail-listing';row.stage=row.window==='before'?'IMMINENT':'FIRST_RETAIL'}
  else if(best.dateConfidence==='explicit'){row.confidenceTier=row.confidenceTier==='confirmed'?'confirmed':'reported';row.signalKind='explicit-vendor-eta'}
  return row;
}

function applyPriorHistory(input){
  const row={...input},prior=priorByKey.get(key(row)),priorDate=prior&&ms(prior.earliestKnownAt),cutoff=REF-WINDOW_DAYS*DAY;
  if(!prior||row.window!=='after'||!['catalog-published-at','first-retail-observation'].includes(row.dateConfidence)||priorDate==null||priorDate>=cutoff)return row;
  const source={host:(function(){try{return new URL(prior.sourceUrl).hostname.replace(/^www\./,'')}catch(_){return''}})(),url:prior.sourceUrl,title:prior.evidence||'Prior public product evidence',sourceType:'prior-existence-evidence',decisionEligible:false,discoveryOnly:true,eventDate:prior.earliestKnownAt,dateConfidence:'prior-public-evidence',stage:'model existent înaintea ferestrei active',collector:'known-history'};
  row.sources=Array.from(new Map((row.sources||[]).concat(source).map(function(item){return[sourceKey(item),item]})).values());
  row.confidenceTier='public-signal';
  row.signalKind='recent-listing-known-model';
  row.stage='RETAIL_PROMOTION';
  row.stageLabel='listare recentă pentru model existent, nu lansare';
  row.knownBeforeWindowAt=prior.earliestKnownAt;
  row.knownBeforeWindowSource=prior.sourceUrl;
  return row;
}

function applyRetailEvidenceGate(input){
  const row={...input};
  if(row.window!=='after'||row.confidenceTier==='public-signal'||row.dateConfidence!=='catalog-published-at')return row;
  const sources=row.sources||[],official=sources.some(function(source){return/^manufacturer-official/.test(String(source.sourceType||''))}),clone=sources.some(function(source){return source.sourceType==='clone-retailer-direct'}),explicitRelease=sources.some(function(source){return source.decisionEligible!==false&&source.dateConfidence==='dated-public-evidence'&&/\b(?:launch|lansare|released|release|introducing|available now)\b/i.test(String(source.stage||'')+' '+String(source.title||''))}),retailHosts=unique(sources.filter(function(source){return/retailer-direct/.test(String(source.sourceType||''))&&!/promotion/.test(String(source.sourceType||''))}).map(function(source){return source.host}));
  if(official||clone||explicitRelease||retailHosts.length>=2)return row;
  row.confidenceTier='public-signal';
  row.signalKind='single-retailer-listing';
  row.stage='FIRST_RETAIL_SIGNAL';
  row.stageLabel='listare comercială datată, noutate în verificare';
  return row;
}

function lifecycleScore(row){
  const event=ms(row.eventDate),future=row.window==='before'&&event!=null&&event>REF;
  const rank=eventRank(row);
  if(rank<2)return 100+(row.window==='after'?10:0)+rank;
  return (future?600:row.window==='after'?500:400)+rank;
}
function mergeRows(current,incoming){
  const currentScore=lifecycleScore(current),incomingScore=lifecycleScore(incoming),incomingDominates=incomingScore>currentScore||incomingScore===currentScore&&ms(incoming.stageEvidenceAt||incoming.eventDate)<ms(current.stageEvidenceAt||current.eventDate);
  const dominant=incomingDominates?incoming:current,secondary=incomingDominates?current:incoming,canonical=canonicalizeProduct({product:dominant.productName||'',brand:dominant.brand||''});
  const sources=new Map();for(const source of (current.sources||[]).concat(incoming.sources||[]))sources.set(sourceKey(source),source);
  const merged={...secondary,...dominant};
  merged.productName=betterName(current.productName,incoming.productName,canonical.brand||dominant.brand||current.brand||incoming.brand||'');
  merged.brand=canonical.brand||dominant.brand||current.brand||incoming.brand||'';
  merged.segment=dominant.segment||secondary.segment||null;
  merged.typology=dominant.typology||secondary.typology||null;
  merged.sources=Array.from(sources.values());
  merged.sourceCount=merged.sources.length;
  merged.eligibleSources=unique(merged.sources.filter(function(source){return source.decisionEligible!==false}).map(function(source){return source.sourceType})).length;
  merged.firstPublicEvidenceAt=earliestIso([current.firstPublicEvidenceAt,current.eventDate,incoming.firstPublicEvidenceAt,incoming.eventDate].concat(merged.sources.map(function(source){return source.eventDate})))||dominant.eventDate;
  merged.stageEvidenceAt=dominant.stageEvidenceAt||dominant.eventDate;
  merged.eventDate=dominant.eventDate;
  merged.lifecycleEvidence=unique([current.window,current.stage,incoming.window,incoming.stage]);
  merged.ageHours=Number((Math.abs(REF-ms(merged.eventDate))/36e5).toFixed(1));
  return merged;
}

function validTarget(row,isPodFile){
  const name=String(row.productName||''),text=norm(name);
  if(!name||/\b(?:e liquid|e juice|vape juice|flavou?r|nicotine pouch|shortfill|longfill|cartridge pack|replacement cartridge|empty pod|coil pack|phone|tablet)\b/.test(text))return false;
  if(isPodFile)return row.category==='POD'&&Boolean(classifyPodProduct(name,row.brand||''));
  if(row.category==='RTA')return /\brta\b|rebuildable tank (?:atomizer|atomiser)/i.test(name)&&!/\brda\b|\brdta\b/i.test(name);
  if(row.category==='MODURI')return /\b(?:mod|sbs|squonk|bf60|dna\s*\d|yihi|istick|drag\s*6|aegis|armour)\b/i.test(name);
  return false;
}

function consolidate(doc,file){
  const isPodFile=/pods/.test(file);
  const grouped=new Map();
  for(const input of doc.products||[]){const row=applyRetailEvidenceGate(applyPriorHistory(normalizeFromEvidence(input)));if(!row||!row.productName||!inWindow(row)||!validTarget(row,isPodFile))continue;const rowKey=key(row),old=grouped.get(rowKey);grouped.set(rowKey,old?mergeRows(old,row):{...row});}
  const products=Array.from(grouped.entries()).map(function(entry){const row=entry[1],canonical=canonicalizeProduct({product:row.productName||'',brand:row.brand||''});row.id=hash(entry[0]);row.brand=canonical.brand||row.brand||'';row.sources=Array.from(new Map((row.sources||[]).map(function(source){return[sourceKey(source),source]})).values());row.sourceCount=row.sources.length;row.eligibleSources=unique(row.sources.filter(function(source){return source.decisionEligible!==false}).map(function(source){return source.sourceType})).length;row.firstPublicEvidenceAt=row.firstPublicEvidenceAt||earliestIso(row.sources.map(function(source){return source.eventDate}))||row.eventDate;row.stageEvidenceAt=row.stageEvidenceAt||row.eventDate;row.ageHours=Number((Math.abs(REF-ms(row.eventDate))/36e5).toFixed(1));return row}).sort(function(a,b){return String(b.eventDate).localeCompare(String(a.eventDate))});
  const events=products.filter(isEvent),signals=products.filter(function(row){return !isEvent(row)}),categories={};for(const row of events)categories[row.category]=(categories[row.category]||0)+1;
  const summary={total:events.length,allConcrete:products.length,before:events.filter(function(row){return row.window==='before'}).length,after:events.filter(function(row){return row.window==='after'}).length,explicitDatedAfter:events.filter(function(row){return row.window==='after'&&STRONG_DATES.has(row.dateConfidence)}).length,confirmed:events.filter(function(row){return row.confidenceTier==='confirmed'}).length,reported:events.filter(function(row){return row.confidenceTier!=='confirmed'}).length,publicSignals:signals.length,candidatesUnderVerification:Array.isArray(doc.verificationQueue)?doc.verificationQueue.length:0,categoryEvents:categories};
  return{...doc,schemaVersion:Math.max(28,Number(doc.schemaVersion||0)),generatedAt:new Date().toISOString(),snapshotReferenceAt:new Date(REF).toISOString(),pendingRefresh:false,truth:{...(doc.truth||{}),eventDatesSeparatedFromCoverageDates:true,canonicalCrossSourceDeduplication:true,crossWindowLifecycleDeduplication:true,categoryRevalidatedBeforePublish:true,retailPromotionIsNotRelease:true,priorExistenceDemotesRetailRelisting:true,singleRetailerListingNeedsCorroboration:true},products,summary};
}

for(const file of FILES){const output=consolidate(read(file),file);if(WRITE)save(file,output);console.log(`${file}: ${output.summary.total} dated events, ${output.summary.publicSignals} public signals, ${output.summary.allConcrete} concrete products.`)}
