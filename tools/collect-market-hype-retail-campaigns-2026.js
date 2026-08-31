#!/usr/bin/env node
'use strict';

const fs=require('fs');
const crypto=require('crypto');
const {snapshotReferenceMs}=require('./hype-window-reference-2026.js');
const {classifyPodProduct,decode,norm}=require('./market-pod-classifier-2026.js');
const {canonicalizeProduct}=require('./market-product-canonical-2026.js');

const WRITE=process.argv.includes('--write');
const RTA_FILE='data/market-hype-products-2026.json';
const POD_FILE='data/market-hype-pods-2026.json';
const OUT_FILE='data/market-hype-retail-campaigns-2026.json';
const REF=snapshotReferenceMs();
const DAY=86400000;
const WINDOW_DAYS=30;

const SOURCES=[
  {
    id:'3fvape-campaigns',label:'3FVape public campaigns',baseUrl:'https://www.3fvape.com',sourceType:'clone-retailer-direct',
    pages:['/','/57-preorder?n=383','/new-arrival?n=383','/115-rta?n=383','/4-atomizer?n=383','/deal?n=383']
  }
];

function read(file,fallback={}){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function save(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function hash(value){return crypto.createHash('sha256').update(String(value||'')).digest('hex').slice(0,20)}
function unique(values){return Array.from(new Set((values||[]).filter(Boolean)))}
function campaignIso(value){const match=String(value||'').match(/(?:^|[^0-9])(20\d{2})(\d{2})(\d{2})(?:[^0-9]|$)/);if(!match)return null;const iso=match[1]+'-'+match[2]+'-'+match[3]+'T12:00:00.000Z',ms=Date.parse(iso);return Number.isFinite(ms)?new Date(ms).toISOString():null}
function inPast(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)&&ms<=REF&&REF-ms<=WINDOW_DAYS*DAY}
function attr(attrs,name){const match=String(attrs||'').match(new RegExp('\\b'+name+'=["\\\']([^"\\\']+)["\\\']','i'));return match?decode(match[1]):''}
function cleanTitle(value){return decode(value).replace(/^Authentic\s+/i,'').replace(/\s+/g,' ').trim().slice(0,180)}
function productIdentity(value){return cleanTitle(value).replace(/\b(?:pod mod kit|pod system kit|pod system|pod kit|starter kit|mod kit|vape mod|box mod|regulated mod|mechanical mod|sbs mod)\b/gi,' ').replace(/\s+(?:pod|kit)\s*$/i,' ').replace(/\s+/g,' ').trim()}
function productKey(value){const canonical=canonicalizeProduct({product:productIdentity(value.productName),brand:value.brand||''});return value.category+'|'+canonical.key}
function accessory(value){const t=norm(value);return /\b(?:replacement|spare|tank tube|glass|drip tip|air pin|airflow pin|deck kit|beauty ring|bell cap|wick|coil|cotton|wire|insulator|top cap|panel|door|button)\b/.test(t)}
function classify(value){
  const text=cleanTitle(value),t=norm(text);if(!text||accessory(text))return null;
  if(/\brta\b|rebuildable tank (?:atomizer|atomiser)/.test(t)&&!/\brda\b|\brdta\b/.test(t))return{category:'RTA',brand:canonicalizeProduct({product:text}).brand||'',typology:/\bmtl\b/.test(t)?'MTL single':/\brdl\b/.test(t)?'RDL single':/dual coil|dual deck/.test(t)?'DL dual':'RDL single'};
  if(/\b(?:box mod|vape mod|mechanical mod|regulated mod|tube mod|sbs mod|squonk mod|side by side|mod)\b|\bsbs\b/.test(t))return{category:'MODURI',brand:canonicalizeProduct({product:text}).brand||'',typology:/side by side|\bsbs\b/.test(t)?'side by side':/squonk/.test(t)?'squonk':/dual battery|dual 18650|dual 21700|2x18650|2x21700/.test(t)?'dual battery':'single battery'};
  const pod=classifyPodProduct(text);return pod&&pod.confidence!=='generic-pod-device'?pod:null;
}
async function fetchText(url,timeout=18000){const controller=new AbortController(),timer=setTimeout(function(){controller.abort()},timeout);try{const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Retail-Campaign/1.0 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml,*/*;q=.6','cache-control':'no-cache'},signal:controller.signal});const text=await response.text();if(!response.ok)throw new Error('HTTP '+response.status);return text}finally{clearTimeout(timer)}}
function wait(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
async function fetchTextWithRetry(url,attempts=3){let lastError=null;for(let attempt=1;attempt<=attempts;attempt++){try{return{html:await fetchText(url),attempts:attempt}}catch(error){lastError=error;if(attempt<attempts)await wait(attempt*900)}}throw Object.assign(lastError||new Error('fetch-failed'),{attempts})}
function anchors(html,source,pageUrl){
  const rows=[];
  for(const match of String(html||'').matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){
    const attrs=match[1],inner=match[2],href=attr(attrs,'href');if(!href||!/[?&]utm_campaign=/i.test(href))continue;
    let url;try{url=new URL(href,pageUrl)}catch(_){continue}if(url.hostname.replace(/^www\./,'')!==new URL(source.baseUrl).hostname.replace(/^www\./,''))continue;
    const campaign=(url.searchParams.get('utm_campaign')||'').match(/20\d{6}/),eventDate=campaignIso(campaign&&campaign[0]);if(!eventDate||!inPast(eventDate))continue;
    const image=inner.match(/<img\b[^>]*(?:alt|title)=["']([^"']+)["']/i),title=cleanTitle(attr(attrs,'title')||image&&image[1]||inner),classification=classify(title);if(!classification)continue;
    url.searchParams.delete('utm_source');url.searchParams.delete('utm_medium');url.searchParams.delete('utm_campaign');
    rows.push({source,title,url:url.toString(),eventDate,classification});
  }
  return rows;
}
function removeOwned(target){target.products=(target.products||[]).map(function(row){const sources=(row.sources||[]).filter(function(source){return source.collector!=='retail-campaign'});if(!sources.length)return row.dateConfidence==='dated-retail-campaign'?null:{...row,sources,sourceCount:0,eligibleSources:0};const best=sources.slice().sort(function(a,b){const rank={explicit:7,'official-product-published-at':6,'catalog-published-at':5,'release-observed':4,'dated-public-evidence':3,'dated-retail-campaign':1};return(rank[b.dateConfidence]||0)-(rank[a.dateConfidence]||0)})[0];return{...row,eventDate:best.eventDate||row.eventDate,stageEvidenceAt:best.eventDate||row.stageEvidenceAt,dateConfidence:best.dateConfidence||row.dateConfidence,stageLabel:best.stage||row.stageLabel,sources,sourceCount:sources.length,eligibleSources:unique(sources.filter(function(source){return source.decisionEligible}).map(function(source){return source.sourceType})).length}}).filter(Boolean)}
function merge(target,event){target.products=Array.isArray(target.products)?target.products:[];const key=productKey(event)+'|'+event.window,old=target.products.find(function(row){return productKey(row)+'|'+row.window===key});if(!old){event.id=hash(key);target.products.push(event);return true}const sources=new Map((old.sources||[]).map(function(source){return[source.url,source]}));for(const source of event.sources)sources.set(source.url,source);old.sources=Array.from(sources.values());old.sourceCount=old.sources.length;old.eligibleSources=unique(old.sources.filter(function(source){return source.decisionEligible}).map(function(source){return source.sourceType})).length;old.lastSeenAt=event.lastSeenAt;const earliest=Math.min(Date.parse(old.firstPublicEvidenceAt||old.eventDate),Date.parse(event.firstPublicEvidenceAt||event.eventDate));if(Number.isFinite(earliest))old.firstPublicEvidenceAt=new Date(earliest).toISOString();if((old.confidenceTier||'public-signal')==='public-signal'&&Date.parse(event.eventDate)<Date.parse(old.eventDate))Object.assign(old,{eventDate:event.eventDate,stageEvidenceAt:event.eventDate,stage:event.stage,stageLabel:event.stageLabel,signalKind:event.signalKind,dateConfidence:event.dateConfidence});return false}
function finalize(target,stats){target.generatedAt=new Date().toISOString();target.truth={...(target.truth||{}),datedRetailCampaignIsPublicSignalNotRelease:true};target.scan={...(target.scan||{}),retailCampaigns:stats};target.products=(target.products||[]).filter(function(row){return row&&row.eventDate&&(row.window==='before'||inPast(row.eventDate))}).sort(function(a,b){return String(b.eventDate).localeCompare(String(a.eventDate))});const events=target.products.filter(function(row){return row.confidenceTier==='confirmed'||row.confidenceTier==='reported'||['explicit','catalog-published-at','official-product-published-at','release-observed','first-retail-observation'].includes(row.dateConfidence)}),signals=target.products.filter(function(row){return !events.includes(row)});target.summary={...(target.summary||{}),total:events.length,allConcrete:target.products.length,before:events.filter(function(row){return row.window==='before'}).length,after:events.filter(function(row){return row.window==='after'}).length,confirmed:events.filter(function(row){return row.confidenceTier==='confirmed'}).length,reported:events.filter(function(row){return row.confidenceTier!=='confirmed'}).length,publicSignals:signals.length}}

async function main(){
  const runs=[];for(const source of SOURCES)for(const page of source.pages){const url=new URL(page,source.baseUrl).toString();try{const result=await fetchTextWithRetry(url);runs.push({source,url,ok:true,attempts:result.attempts,rows:anchors(result.html,source,url)})}catch(error){runs.push({source,url,ok:false,attempts:Number(error&&error.attempts)||3,rows:[],error:String(error&&error.message||error)})}}
  const observedAt=new Date().toISOString(),signals=[];
  for(const row of runs.flatMap(function(run){return run.rows})){
    const cls=row.classification,evidence={host:new URL(row.url).hostname.replace(/^www\./,''),url:row.url,title:row.title,sourceName:row.source.label,sourceUrl:row.source.baseUrl,sourceType:'retailer-direct-promotion',collector:'retail-campaign',decisionEligible:true,discoveryOnly:false,evidenceScope:'dated-retail-promotion',eventDate:row.eventDate,dateConfidence:'dated-retail-campaign',dateQuality:'utm-campaign-date',stage:'promovare recenta pentru model existent, nu lansare',observedAt};
    signals.push({productName:row.title,brand:cls.brand||'',category:cls.category,segment:cls.segment||null,typology:cls.typology||null,window:'after',stage:'RETAIL_PROMOTION',stageLabel:'promovare recenta pentru model existent, nu lansare',signalKind:'dated-retail-promotion',confidenceTier:'public-signal',eventDate:row.eventDate,stageEvidenceAt:row.eventDate,firstPublicEvidenceAt:row.eventDate,dateConfidence:'dated-retail-campaign',firstSeenAt:observedAt,lastSeenAt:observedAt,ageHours:Number(((REF-Date.parse(row.eventDate))/36e5).toFixed(1)),sourceCount:1,eligibleSources:1,sources:[evidence]});
  }
  const grouped=new Map();for(const signal of signals){const key=productKey(signal)+'|'+signal.window,old=grouped.get(key);if(!old){grouped.set(key,signal);continue}const sources=new Map((old.sources||[]).map(function(source){return[source.url,source]}));for(const source of signal.sources)sources.set(source.url,source);old.sources=Array.from(sources.values());old.sourceCount=old.sources.length}
  const rta=read(RTA_FILE,{products:[]}),pods=read(POD_FILE,{products:[]});removeOwned(rta);removeOwned(pods);let rtaAdded=0,podsAdded=0;for(const event of grouped.values()){if(event.category==='POD'){if(merge(pods,event))podsAdded++}else if(merge(rta,event))rtaAdded++}
  const counts=Array.from(grouped.values()).reduce(function(acc,row){acc[row.category]=(acc[row.category]||0)+1;return acc},{}),pagesWorking=runs.filter(function(run){return run.ok}).length,coveragePct=runs.length?Number((pagesWorking/runs.length*100).toFixed(1)):0,minimumPages=Math.ceil(runs.length*.8),stats={sources:SOURCES.length,pages:runs.length,pagesWorking,minimumPages,coveragePct,coverageStatus:pagesWorking===runs.length?'complete':pagesWorking>=minimumPages?'partial':'failed',attempts:runs.reduce(function(sum,run){return sum+Number(run.attempts||1)},0),failedPages:runs.filter(function(run){return!run.ok}).map(function(run){return{url:run.url,error:run.error,attempts:run.attempts}}),signals:grouped.size,RTA:counts.RTA||0,MODURI:counts.MODURI||0,POD:counts.POD||0,rtaModAdded:rtaAdded,podsAdded};finalize(rta,stats);finalize(pods,stats);
  const output={schemaVersion:1,generatedAt:observedAt,snapshotReferenceAt:new Date(REF).toISOString(),windowDays:WINDOW_DAYS,truth:{campaignDateIsPublicPromotionEvidenceNotReleaseDate:true,productIdentityRequired:true},scan:stats,signals:Array.from(grouped.values()).sort(function(a,b){return String(b.eventDate).localeCompare(String(a.eventDate))})};
  if(WRITE){save(RTA_FILE,rta);save(POD_FILE,pods);save(OUT_FILE,output)}else console.log(JSON.stringify(output,null,2));
  console.log(`Retail campaigns: pages ${stats.pagesWorking}/${stats.pages}; RTA ${stats.RTA}; MODURI ${stats.MODURI}; POD ${stats.POD}.`);
}

main().catch(function(error){console.error(error&&error.stack||error);process.exit(1)});
