#!/usr/bin/env node
'use strict';

const fs=require('fs');
const crypto=require('crypto');
const {snapshotReferenceMs}=require('./hype-window-reference-2026.js');
const {registry,classifyPodProduct,decode,norm}=require('./market-pod-classifier-2026.js');

const OUT='data/market-hype-pods-2026.json';
const SOURCE_FILE='data/market-hype-sources-2026.json';
const WRITE=process.argv.includes('--write');
const REF=snapshotReferenceMs();
const WINDOW_MS=30*24*60*60*1000;
const MAX_DOCS=650;
const NEWS_DOMAINS=['vaping360.com','ecigclick.co.uk','vapingpost.com','vapouround.co.uk','vapinghardware.com','planet-of-the-vapes.co.uk','planetofthevapes.co.uk','vapingcommunity.co.uk'];
const VENDOR_DOMAINS=['3fvape.com','2fdeal.com','sourcemore.com','elementvape.com','healthcabin.net','vapesourcing.com','ecigone.co.uk'];

function read(file,fallback={}){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function save(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function hash(value){return crypto.createHash('sha256').update(String(value||'')).digest('hex').slice(0,20)}
function host(url){try{return new URL(String(url||'')).hostname.replace(/^www\./,'').toLowerCase()}catch(_){return''}}
function domainMatch(value,domain){return value===domain||value.endsWith('.'+domain)}
function iso(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)?new Date(ms).toISOString():null}
function inPast30(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)&&ms<=REF&&REF-ms<=WINDOW_MS}
function inFuture30(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)&&ms>REF&&ms-REF<=WINDOW_MS}
function ageHours(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)?Number((Math.abs(REF-ms)/36e5).toFixed(1)):null}
function unique(values){return Array.from(new Set((values||[]).filter(Boolean)))}

async function fetchText(url,timeout=12000){
  const controller=new AbortController(),timer=setTimeout(function(){controller.abort()},timeout);
  try{
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-POD-Hype/1.0 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml,application/rss+xml,application/xml;q=.9,*/*;q=.5','accept-language':'en,ro,de,fr,it,es;q=.7','cache-control':'no-cache'},signal:controller.signal});
    const text=await response.text();
    if(!response.ok)throw new Error('HTTP '+response.status);
    return{url:response.url||url,text};
  }finally{clearTimeout(timer)}
}

async function pool(items,width,worker){
  let cursor=0;const out=new Array(items.length);
  async function run(){for(;;){const index=cursor++;if(index>=items.length)return;try{out[index]=await worker(items[index])}catch(error){out[index]={error:String(error&&error.message||error)}}}}
  await Promise.all(Array.from({length:Math.min(width,Math.max(1,items.length))},run));
  return out;
}

function xmlTag(block,name){const match=String(block||'').match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return match?decode(match[1]):''}
function rssRows(xml,meta){const out=[];for(const match of String(xml||'').matchAll(/<item>([\s\S]*?)<\/item>/gi)){const block=match[1],title=xmlTag(block,'title'),description=xmlTag(block,'description'),url=xmlTag(block,'link'),publishedAt=iso(xmlTag(block,'pubDate')||xmlTag(block,'dc:date'));if(title&&url)out.push({...meta,title,description,url,publishedAt})}return out}
async function bing(meta){try{const result=await fetchText('https://www.bing.com/search?format=rss&q='+encodeURIComponent(meta.query),10000);return{ok:true,meta,docs:rssRows(result.text,meta)}}catch(error){return{ok:false,meta,docs:[],error:String(error&&error.message||error)}}}

function pageDate(html){for(const pattern of [/property=["']article:published_time["'][^>]*content=["']([^"']+)/i,/name=["']date["'][^>]*content=["']([^"']+)/i,/"datePublished"\s*:\s*"([^"]+)"/i,/<time\b[^>]*datetime=["']([^"']+)/i]){const match=String(html||'').match(pattern),value=match&&iso(match[1]);if(value)return value}return null}
function pageTitle(html,fallback){const values=[];for(const pattern of [/<h1\b[^>]*>([\s\S]*?)<\/h1>/i,/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i,/<title\b[^>]*>([\s\S]*?)<\/title>/i]){const match=String(html||'').match(pattern);if(match&&decode(match[1]))values.push(decode(match[1]))}return values.find(function(value){return classifyPodProduct(value)})||decode(fallback)}
function canonicalTitle(value){return decode(value).replace(/^Buy\s+/i,'').replace(/^LVE Vapor\s*\|\s*/i,'').replace(/\s+Vapeshoponline\s*-?\s*$/i,'').replace(/\bPod systém sada\b/gi,'Pod System Kit').replace(/\bPod systém\b/gi,'Pod System').replace(/\bPod sada\b/gi,'Pod Kit').replace(/\s*[|–—]\s*(?:official|review|preview|youtube|shop|store).*$/i,'').replace(/\s+/g,' ').trim().slice(0,190)}
function makerHit(maker,text){const hay=' '+norm(text)+' ';return[maker.name].concat(maker.aliases||[]).concat(maker.series||[]).some(function(value){const needle=' '+norm(value)+' ';return needle.trim().length>=3&&hay.includes(needle)})}
function genericPodPage(title,url){const value=decode(title),t=norm(value),path=String(url||'').toLowerCase(),rangeTitle=/\b(?:complete guide|all products|product range|vape series|open pod systems|pod kits for sale|starter kits?\s*(?:&|and)\s*pod systems?|vape pod kits?,?\s*pod mods?|vape kits?,?\s*pod systems?,?\s*vape tanks?|electronic cigarettes?,?\s*pod vape manufacturer|vapes in|vape price|buy .* online|at best price|cauți .* alege din oferta|meaning of|definition|login|portal|produse veev|tigari electronice veev|tigarete electronice veev|pod mody .* caliburn|hayati vapes)\b/i;return rangeTitle.test(value)||/\/(?:collections?|pages\/products|brands?|marques?|wiki|search|product-category|categories?)(?:\/|$)/.test(path)||/\/(?:c|category)(?:\/|$)/.test(path)||/\/product\/?(?:[?#].*)?$/.test(path)||/^(?:uwell )?caliburn(?: myuwell com)?$|^(?:uwell )?caliburn pod system$|^veev$|^veev vape uri reincarcabile/.test(t)||/elektronicke cigarety.*innokin|innokin.*elektronicke cigarety/.test(t)||/^shop .+ \d+$/.test(t)||/\bxros\b.*\bluxe\b/.test(t)||(value.match(/\s\/\s/g)||[]).length>=2}

const MONTH='(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
function explicitDate(text){const source=decode(text),patterns=[new RegExp(`(?:ETA|estimated shipping|shipping|ships|launch(?:ing)?|release(?:d)?|available|pre[- ]?order)[\\s\\S]{0,100}?(${MONTH}\\s+\\d{1,2},?\\s+2026)`,'i'),/(?:ETA|estimated shipping|shipping|ships|launch(?:ing)?|release(?:d)?|available|pre[- ]?order)[^0-9]{0,100}(\d{1,2}[.\/-]\d{1,2}[.\/-]2026)/i,new RegExp(`(?:ETA|estimated shipping|shipping|ships|launch(?:ing)?|release(?:d)?|available|pre[- ]?order)[\\s\\S]{0,100}?(\\d{1,2}\\s+${MONTH}\\s+2026)`,'i')];for(const pattern of patterns){const match=source.match(pattern),value=match&&iso(match[1]);if(value)return value}return null}
function eventSignal(text,publishedAt){
  const t=norm(text),dated=explicitDate(text);
  if(dated&&inFuture30(dated))return{window:'before',stage:/batch|restock/.test(t)?'BATCH':'IMMINENT',stageLabel:/batch|restock/.test(t)?'batch viitor':'ETA / lansare programata',eventDate:dated,dateConfidence:'explicit'};
  if(/prototype|engineering sample|pre production|sample received|review sample|review coming|production started|mass production|teaser|sneak peek|coming soon|pre order|pre sale|waitlist|launching soon|release soon/.test(t)&&inPast30(publishedAt))return{window:'before',stage:/prototype|engineering sample/.test(t)?'PROTOTYPE':/sample|review/.test(t)?'SAMPLE_REVIEW':/production/.test(t)?'PRODUCTION':/pre order|pre sale|launching soon|release soon/.test(t)?'IMMINENT':'TEASER',stageLabel:/prototype|engineering sample/.test(t)?'prototip':/sample|review/.test(t)?'mostre / review':/production/.test(t)?'productie':/pre order|pre sale|launching soon|release soon/.test(t)?'iminent':'teaser',eventDate:publishedAt,dateConfidence:'signal-publication'};
  if(/just released|released today|released this week|new launch|launched|available now|now available|shipping now|officially available|introducing the new/.test(t)&&inPast30(publishedAt))return{window:'after',stage:'RELEASED',stageLabel:'lansare observata',eventDate:publishedAt,dateConfidence:'release-observed'};
  return null;
}

function sourceType(url,maker,cfg){const value=host(url),news=unique(NEWS_DOMAINS.concat(cfg.independentNewsDomains||[])),forums=cfg.forumDomains||[],vendors=unique(VENDOR_DOMAINS.concat(cfg.discoveryCommercialDomains||[]));if((maker.domains||[]).some(function(domain){return domainMatch(value,domain)}))return{type:'manufacturer-official',eligible:true};if(news.some(function(domain){return domainMatch(value,domain)}))return{type:'independent-vape-news',eligible:true};if(forums.some(function(domain){return domainMatch(value,domain)}))return{type:'vaping-forum-prelaunch',eligible:true};if(domainMatch(value,'reddit.com'))return{type:'reddit-prelaunch',eligible:true};if(['youtube.com','youtu.be'].some(function(domain){return domainMatch(value,domain)}))return{type:'creator-review',eligible:true};if(['facebook.com','instagram.com','threads.net','tiktok.com','x.com','twitter.com'].some(function(domain){return domainMatch(value,domain)}))return{type:'public-social-signal',eligible:false};if(vendors.some(function(domain){return domainMatch(value,domain)}))return{type:'vendor-discovery',eligible:false};return{type:'open-web-discovery',eligible:false}}
function productKey(product){return norm(product.brand+' '+product.productName)+'|'+product.window}
function merge(map,product){const key=productKey(product),old=map.get(key);if(!old){product.id=hash(key);map.set(key,product);return}const sources=new Map((old.sources||[]).map(function(source){return[source.url,source]}));for(const source of product.sources||[])sources.set(source.url,source);old.sources=Array.from(sources.values()).slice(0,24);old.sourceCount=old.sources.length;old.eligibleSources=unique(old.sources.filter(function(source){return source.decisionEligible}).map(function(source){return source.sourceType})).length;if(product.dateConfidence==='explicit'&&old.dateConfidence!=='explicit')Object.assign(old,{eventDate:product.eventDate,stage:product.stage,stageLabel:product.stageLabel,dateConfidence:product.dateConfidence});old.lastSeenAt=product.lastSeenAt}

async function main(){
  const reg=registry(),cfg=read(SOURCE_FILE,{}),old=read(OUT,{products:[]}),queries=[],communityDomains=unique((cfg.forumDomains||[]).slice(0,7).concat((cfg.independentNewsDomains||[]).slice(0,5),['reddit.com']).concat((cfg.discoveryCommercialDomains||[]).slice(0,10))),communitySites='('+communityDomains.map(function(domain){return'site:'+domain}).join(' OR ')+')';
  for(const maker of reg.makers||[]){
    const names=unique([maker.name].concat(maker.aliases||[])).slice(0,3),series=(maker.series||[]).slice(0,6),who=names.map(function(value){return`"${value}"`}).join(' OR '),what=series.length?'('+series.map(function(value){return`"${value}"`}).join(' OR ')+' OR "pod system" OR "pod kit")':'("pod system" OR "pod kit")',trigger='("coming soon" OR prototype OR teaser OR "review sample" OR "pre-order" OR preorder OR ETA OR launched OR "available now" OR "just released")';
    queries.push({maker,channel:'open-web',query:`(${who}) ${what} ${trigger}`});
    queries.push({maker,channel:'social-video',query:`(${who}) ${what} ${trigger} (site:facebook.com OR site:instagram.com OR site:youtube.com OR site:x.com)`});
    queries.push({maker,channel:'community-retail',query:`(${who}) ${what} (${trigger} OR "new arrival" OR "in stock") ${communitySites}`});
    for(const domain of (maker.domains||[]).slice(0,1))queries.push({maker,channel:'official',query:`site:${domain} ${what} (${trigger} OR "new product" OR "available")`});
  }
  const runs=await pool(queries,8,bing),working=runs.filter(function(run){return run.ok}).length,allDocs=Array.from(new Map(runs.flatMap(function(run){return run.docs||[]}).filter(function(doc){return doc.url&&doc.title&&doc.maker}).map(function(doc){return[norm(doc.maker.name)+'|'+doc.url,doc]})).values()),docs=allDocs.filter(function(doc){return makerHit(doc.maker,doc.title+' '+doc.description)||(doc.maker.domains||[]).some(function(domain){return domainMatch(host(doc.url),domain)})}).slice(0,MAX_DOCS);
  if(working<Math.max(1,Math.floor(queries.length*.2))&&(old.products||[]).length){old.lastAttemptAt=new Date().toISOString();old.lastAttemptStatus='insufficient-search-coverage';old.pendingRefresh=true;if(WRITE)save(OUT,old);console.log(`POD Hype kept last good snapshot: ${working}/${queries.length} searches working.`);return}
  const pages=await pool(docs,8,async function(doc){try{const fetched=await fetchText(doc.url,9000);return{doc,html:fetched.text,resolved:fetched.url,fetchError:''}}catch(error){return{doc,html:'',resolved:doc.url,fetchError:String(error&&error.message||error)}}});
  const map=new Map(),candidates=[],rejections={fetchFailed:0,makerMismatch:0,notConcretePodProduct:0,noDateOrEvent:0,sourceNotDecisionEligible:0,outsideWindow:0,duplicate:0};
  const now=new Date().toISOString();let concrete=0,retailObserved=0;
  function reject(reason,page,product,classification){rejections[reason]=(rejections[reason]||0)+1;if(['noDateOrEvent','sourceNotDecisionEligible','outsideWindow'].includes(reason)&&product&&classification&&candidates.length<160)candidates.push({brand:classification.brand||page.doc.maker.name,productName:product,segment:classification.segment,typology:classification.typology,reason,url:page.resolved,publishedAt:page.doc.publishedAt||pageDate(page.html)||null})}
  for(const page of pages){
    const doc=page.doc,maker=doc.maker,text=decode(doc.title+' '+doc.description+' '+page.html.slice(0,24000));
    if(page.fetchError)rejections.fetchFailed++;
    if(!makerHit(maker,text)&&!(maker.domains||[]).some(function(domain){return domainMatch(host(page.resolved),domain)})){reject('makerMismatch',page);continue}
    const productName=canonicalTitle(pageTitle(page.html,doc.title)),officialContext=(maker.domains||[]).some(function(domain){return domainMatch(host(page.resolved),domain)})?maker.name:'',classification=classifyPodProduct(productName,officialContext);
    if(!classification||classification.confidence==='generic-pod-device'||genericPodPage(productName,page.resolved)||classification.brand&&norm(classification.brand)!==norm(maker.name)&&!makerHit(maker,productName)){reject('notConcretePodProduct',page,productName,classification);continue}
    concrete++;
    const publishedAt=doc.publishedAt||pageDate(page.html),indexedContext=decode(doc.title+' '+doc.description),source=sourceType(page.resolved,maker,cfg),commercialPage=source.type==='vendor-discovery'||(source.type==='manufacturer-official'&&/\b(?:buy|shop|starter kit|device|available)\b/i.test(indexedContext));
    if(commercialPage)retailObserved++;
    const event=eventSignal(indexedContext,publishedAt)||(explicitDate(text)?eventSignal(text,publishedAt):null);
    if(!event){reject('noDateOrEvent',page,productName,classification);continue}
    if(!((event.window==='before'&&(inFuture30(event.eventDate)||inPast30(event.eventDate)))||(event.window==='after'&&inPast30(event.eventDate)))){reject('outsideWindow',page,productName,classification);continue}
    if(!source.eligible&&event.dateConfidence!=='explicit'){reject('sourceNotDecisionEligible',page,productName,classification);continue}
    const evidence={host:host(page.resolved),url:page.resolved,title:productName,sourceType:source.type,decisionEligible:source.eligible,discoveryOnly:!source.eligible,publishedAt,eventDate:event.eventDate,dateConfidence:event.dateConfidence,stage:event.stageLabel,observedAt:now};
    const sizeBefore=map.size;
    merge(map,{productName,brand:classification.brand||maker.name,category:'POD',segment:classification.segment,typology:classification.typology,window:event.window,stage:event.stage,stageLabel:event.stageLabel,eventDate:event.eventDate,dateConfidence:event.dateConfidence,firstSeenAt:now,lastSeenAt:now,ageHours:ageHours(event.eventDate),sourceCount:1,eligibleSources:source.eligible?1:0,sources:[evidence]});
    if(map.size===sizeBefore)rejections.duplicate++;
  }
  const queue=Array.from(new Map(candidates.map(function(item){return[norm(item.productName)+'|'+item.reason,item]})).values()).slice(0,120),products=Array.from(map.values()).sort(function(a,b){return String(a.eventDate).localeCompare(String(b.eventDate))});
  const segmentCoverage={};
  for(const segment of reg.segments||[]){
    const id=segment.id,makers=(reg.makers||[]).filter(function(maker){return maker.segment===id}),makerNames=new Set(makers.map(function(maker){return norm(maker.name)}));
    const segmentQueries=queries.filter(function(query){return query.maker&&query.maker.segment===id}),segmentRuns=runs.filter(function(run){return run.meta&&run.meta.maker&&run.meta.maker.segment===id});
    segmentCoverage[id]={label:segment.labelRo||segment.label||id,makers:makers.length,queries:segmentQueries.length,queriesWorking:segmentRuns.filter(function(run){return run.ok}).length,indexedDocuments:allDocs.filter(function(doc){return doc.maker&&makerNames.has(norm(doc.maker.name))}).length,candidateDocuments:docs.filter(function(doc){return doc.maker&&makerNames.has(norm(doc.maker.name))}).length,events:products.filter(function(product){return product.segment===id}).length,queued:queue.filter(function(item){return item.segment===id}).length};
  }
  const output={schemaVersion:5,scopeYear:2026,scope:'GLOBAL POD SYSTEMS',windowDays:30,discoveryContextDays:180,generatedAt:now,snapshotReferenceAt:new Date(REF).toISOString(),dailyWindowTimezone:'Europe/Bucharest',pendingRefresh:false,truth:{registryIsDiscoveryOnly:true,concreteProductRequired:true,explicitOrDatedEventRequired:true,vendorRelistingIsNotRelease:true,rejectedCandidatesAreNotPublishedAsLaunches:true,beforeAndAfterWindowsAreThirtyDays:true,publicOfficialSocialForumNewsRetailDiscovery:true,retailFirstSeenIsHandledOnlyByCatalogObserver:true,retailMemoryContextDays:180,segmentCoverageIsMeasured:true},scan:{makersConfigured:(reg.makers||[]).length,segmentsConfigured:(reg.segments||[]).length,queriesRun:queries.length,queriesWorking:working,searchDocuments:allDocs.length,candidateDocuments:docs.length,pagesProcessed:pages.length,concreteProducts:concrete,retailProductsObserved:retailObserved,firstRetailEvents:0,verifiedSignals:products.length,segmentCoverage,rejections,candidatesUnderVerification:queue.length,rejectedSample:queue.slice(0,40)},verificationQueue:queue,products,summary:{total:products.length,before:products.filter(function(product){return product.window==='before'}).length,after:products.filter(function(product){return product.window==='after'}).length,candidatesUnderVerification:queue.length}};
  if(WRITE)save(OUT,output);else console.log(JSON.stringify(output,null,2));
  console.log(`POD Hype: ${working}/${queries.length} searches; ${docs.length} documents; ${concrete} concrete products; ${products.length} verified; ${queue.length} queued.`);
}

main().catch(function(error){console.error(error&&error.stack||error);process.exit(1)});
