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
const MEMORY_FILE='data/market-hype-retail-memory-2026.json';
const LEDGER_FILE='data/market-hype-discovery-ledger-2026.json';
const SOURCE_FILE='data/market-hype-sources-2026.json';
const REF=snapshotReferenceMs();
const DAY=86400000;
const PUBLIC_DAYS=30;
const CONTEXT_DAYS=180;
const MAX_CANDIDATES=240;
const MAX_PAGES=900;

function read(file,fallback={}){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function save(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function hash(value){return crypto.createHash('sha256').update(String(value||'')).digest('hex').slice(0,20)}
function host(url){try{return new URL(String(url||'')).hostname.replace(/^www\./,'').toLowerCase()}catch(_){return''}}
function domainMatch(value,domain){return value===domain||value.endsWith('.'+domain)}
function iso(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)?new Date(ms).toISOString():null}
function ageDays(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)?(REF-ms)/DAY:null}
function inPast(value,days){const age=ageDays(value);return age!=null&&age>=0&&age<=days}
function inFuture(value,days){const ms=Date.parse(String(value||''));return Number.isFinite(ms)&&ms>REF&&ms-REF<=days*DAY}
function unique(values){return Array.from(new Set((values||[]).filter(Boolean)))}

async function fetchText(url,timeout=12000){
  const controller=new AbortController(),timer=setTimeout(function(){controller.abort()},timeout);
  try{
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Product-Evidence/1.0 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml,application/rss+xml,application/xml;q=.9,*/*;q=.5','accept-language':'en,ro,de,fr,it,es;q=.7','cache-control':'no-cache'},signal:controller.signal});
    const text=await response.text();
    if(!response.ok)throw new Error('HTTP '+response.status);
    return{url:response.url||url,text};
  }finally{clearTimeout(timer)}
}
async function pool(items,width,worker){
  let cursor=0;const output=new Array(items.length);
  async function run(){for(;;){const index=cursor++;if(index>=items.length)return;try{output[index]=await worker(items[index])}catch(error){output[index]={error:String(error&&error.message||error),item:items[index]}}}}
  await Promise.all(Array.from({length:Math.min(width,Math.max(1,items.length))},run));
  return output;
}

function xmlTag(block,name){const match=String(block||'').match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return match?decode(match[1]):''}
function rssRows(xml,meta){const output=[];for(const match of String(xml||'').matchAll(/<item>([\s\S]*?)<\/item>/gi)){const block=match[1],title=xmlTag(block,'title'),description=xmlTag(block,'description'),url=xmlTag(block,'link'),publishedAt=iso(xmlTag(block,'pubDate')||xmlTag(block,'dc:date'));if(title&&url)output.push({...meta,title,description,url,publishedAt})}return output}
async function bing(meta){try{const fetched=await fetchText('https://www.bing.com/search?format=rss&q='+encodeURIComponent(meta.query),10000);return{ok:true,rows:rssRows(fetched.text,meta)}}catch(error){return{ok:false,rows:[],error:String(error&&error.message||error)}}}

function identityTitle(value){return decode(value).replace(/^\[?Ships from Bonded Warehouse\]?\s*/i,'').replace(/^Authentic\s+/i,'').split(/\s+-\s+/)[0].replace(/\s+/g,' ').trim().slice(0,150)}
function accessory(value){return /replacement|tank tube|glass only|drip tip|air\s*pin|airflow pin|deck kit|beauty ring|spare|accessor|chimney|bell cap|cartridge pack|empty pod|pod pack|coil head|wick only|wicks?\s*\(/i.test(value)}
function classify(value){
  if(accessory(value))return null;
  const pod=classifyPodProduct(value);
  if(pod)return pod;
  const t=norm(value),vape=/vape|vaping|e cig|atomiz|atomis|tank|coil|deck|airflow|mtl|rdl|dtl|clone|styled/.test(t);
  if((/\brta\b/.test(t)&&vape)||/rebuildable tank (?:atomizer|atomiser)/.test(t)){
    const typology=/\bmtl\b/.test(t)?'MTL single':/dual coil|dual deck/.test(t)?'DL dual':/\brdl\b/.test(t)?'RDL single':/\bdl\b|\bdtl\b/.test(t)?'DL single':'RDL single';
    return{category:'RTA',typology,brand:''};
  }
  if((/\bmod\b|box mod|regulated mod|mechanical mod|squonk|side by side|\bsbs\b|18650|21700|dna\s*\d|yihi/.test(t))&&vape){
    const typology=/side by side|\bsbs\b/.test(t)?'side by side':/squonk/.test(t)?'squonk':/dual battery|dual 18650|dual 21700|2x18650|2x21700/.test(t)?'dual battery':'single battery';
    return{category:'MODURI',typology,brand:''};
  }
  return null;
}
function candidateKey(candidate){const canonical=canonicalizeProduct({product:candidate.productName,brand:candidate.brand||''});return candidate.category+'|'+canonical.key}
function candidateScore(candidate){let score=0;if(candidate.queued)score+=120;if(/\/new-arrivals\//.test(candidate.url||''))score+=80;if(candidate.category==='MODURI')score+=35;if(candidate.category==='POD')score+=30;if(candidate.existing)score+=20;return score}
function candidates(rta,pods,memory){
  const map=new Map();
  function add(raw,extra={}){const name=identityTitle(raw.productName||raw.product||'');if(!name)return;const cls=classify(name);if(!cls)return;const candidate={productName:name,brand:cls.brand||raw.brand||'',category:cls.category,segment:cls.segment,typology:cls.typology,url:raw.url||(raw.sources&&raw.sources[0]&&raw.sources[0].url)||'',...extra};const key=candidateKey(candidate),old=map.get(key);if(!old||candidateScore(candidate)>candidateScore(old))map.set(key,candidate)}
  for(const row of Object.values(memory.items||{}))add(row);
  for(const row of rta.products||[])add(row,{existing:true});
  for(const row of pods.products||[])add(row,{existing:true});
  for(const row of rta.verificationQueue||[])add({productName:row.product,brand:row.maker,url:row.url},{queued:true});
  for(const row of pods.verificationQueue||[])add({productName:row.productName,brand:row.brand,url:row.url},{queued:true});
  return Array.from(map.values()).sort(function(a,b){return candidateScore(b)-candidateScore(a)||a.productName.localeCompare(b.productName)}).slice(0,MAX_CANDIDATES);
}

const STOP=new Set('authentic style styled clone rta rebuildable tank atomizer atomiser vape vaping pod system kit mod box black silver stainless steel ss pei pctg ml mm watt w'.split(' '));
function tokens(value){return norm(value).split(' ').filter(function(token){return token.length>=2&&!STOP.has(token)&&!/^\d+(?:mah|ml|mm|w)?$/.test(token)}).slice(0,10)}
function searchName(candidate){const source=identityTitle(candidate.productName).replace(/^\[?Ships from Bonded Warehouse\]?\s*/i,'').replace(/^Authentic\s+/i,'').replace(/\b(?:RTA|RBA|RDTA|rebuildable|tank|atomizer|atomiser|pod system|pod kit|system kit|box mod|regulated mod|mechanical mod)\b/gi,' ').replace(/\b\d+(?:\.\d+)?\s*(?:W|mAh|ml|mm|ohm)\b/gi,' ').replace(/\s+/g,' ').trim();return source.split(/\s+-\s+/)[0].trim().slice(0,90)}
function compact(value){return norm(value).replace(/\s+/g,'')}
function productMatch(candidate,text){const name=searchName(candidate),need=tokens(name),hayText=norm(text),hay=new Set(tokens(text).concat(hayText.split(' '))),vapeContext=/vape|vaping|e cig|atomiz|atomis|rta|rba|rdta|tank|coil|pod|mod|mtl|rdl|dtl|clone|styled/.test(hayText);if(!need.length||!vapeContext)return false;const hits=need.filter(function(token){return hay.has(token)||compact(text).includes(compact(token))}).length;return compact(text).includes(compact(name))||hits>=Math.min(2,need.length)&&hits/need.length>=0.55}

function directPageDate(html){
  const source=String(html||''),patterns=[
    {quality:'article-published',re:/property=["']article:published_time["'][^>]*content=["']([^"']+)/i},
    {quality:'article-published',re:/content=["']([^"']+)["'][^>]*property=["']article:published_time["']/i},
    {quality:'structured-published',re:/"datePublished"\s*:\s*"([^"]+)"/i},
    {quality:'video-upload',re:/"uploadDate"\s*:\s*"([^"]+)"/i},
    {quality:'time-published',re:/<time\b[^>]*datetime=["']([^"']+)/i}
  ];
  for(const pattern of patterns){const match=source.match(pattern.re),value=match&&iso(match[1]);if(value)return{value,quality:pattern.quality}}
  return null;
}
const MONTH='(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
function explicitDate(text){const value=decode(text),patterns=[new RegExp(`(?:ETA|estimated shipping|shipping|ships|launch(?:ing)?|release(?:d)?|available|pre[- ]?order)[\\s\\S]{0,120}?(${MONTH}\\s+\\d{1,2},?\\s+2026)`,'i'),/(?:ETA|estimated shipping|shipping|ships|launch(?:ing)?|release(?:d)?|available|pre[- ]?order)[^0-9]{0,120}(\d{1,2}[.\/-]\d{1,2}[.\/-]2026)/i,new RegExp(`(?:ETA|estimated shipping|shipping|ships|launch(?:ing)?|release(?:d)?|available|pre[- ]?order)[\\s\\S]{0,120}?(\\d{1,2}\\s+${MONTH}\\s+2026)`,'i')];for(const pattern of patterns){const match=value.match(pattern),date=match&&iso(match[1]);if(date)return date}return null}
function sourceType(url,cfg){const value=host(url),official=(cfg.officialMakers||[]).flatMap(function(maker){return maker.domains||[]}),news=cfg.independentNewsDomains||[],forums=cfg.forumDomains||[],vendors=cfg.discoveryCommercialDomains||[];if(official.some(function(domain){return domainMatch(value,domain)}))return{type:'manufacturer-official',eligible:true};if(news.some(function(domain){return domainMatch(value,domain)}))return{type:'independent-vape-news',eligible:true};if(forums.some(function(domain){return domainMatch(value,domain)}))return{type:'vaping-forum-prelaunch',eligible:true};if(domainMatch(value,'reddit.com'))return{type:'reddit-public-evidence',eligible:true};if(domainMatch(value,'youtube.com')||domainMatch(value,'youtu.be'))return{type:'creator-dated-evidence',eligible:true};if(['facebook.com','instagram.com','threads.net','tiktok.com','x.com','twitter.com'].some(function(domain){return domainMatch(value,domain)}))return{type:'public-social-signal',eligible:false};if(vendors.some(function(domain){return domainMatch(value,domain)}))return{type:'vendor-dated-evidence',eligible:false};return{type:'open-web-dated-evidence',eligible:false}}
function eventFor(candidate,row,page,cfg){
  const indexed=decode(row.title+' '+row.description),text=decode(indexed+' '+String(page.html||'').slice(0,50000)),explicit=explicitDate(text),direct=directPageDate(page.html),source=sourceType(page.url,cfg),path=String(page.url||'').toLowerCase();
  if(explicit&&inFuture(explicit,PUBLIC_DAYS))return{window:'before',stage:/batch|restock/i.test(text)?'BATCH':'IMMINENT',stageLabel:/batch|restock/i.test(text)?'batch viitor':'lansare / livrare programata',eventDate:explicit,dateConfidence:'explicit',source};
  const dated=direct&&direct.value;
  if(!dated||!inPast(dated,CONTEXT_DAYS))return null;
  if(/prototype|engineering sample|pre production|sample received|review sample|preview|first look|teaser|sneak peek|coming soon|pre[- ]?order|preorder|pre[- ]?sale|waitlist|production started|mass production/i.test(indexed))return{window:'before',stage:/prototype|engineering sample/i.test(indexed)?'PROTOTYPE':/sample|preview|first look|review/i.test(indexed)?'SAMPLE_REVIEW':/production/i.test(indexed)?'PRODUCTION':/pre[- ]?order|preorder|pre[- ]?sale/i.test(indexed)?'IMMINENT':'TEASER',stageLabel:/prototype|engineering sample/i.test(indexed)?'prototip':/sample|preview|first look|review/i.test(indexed)?'mostra / prima prezentare':/production/i.test(indexed)?'productie':'teaser / precomanda',eventDate:dated,dateConfidence:'dated-public-evidence',source,dateQuality:direct.quality};
  if(/just released|released today|released this week|new launch|launched|available now|now available|shipping now|officially available|introducing|new arrival/i.test(indexed))return{window:'after',stage:'RELEASED',stageLabel:'lansare observata',eventDate:dated,dateConfidence:'dated-public-evidence',source,dateQuality:direct.quality};
  if(/review|unboxing|build|hands on|hands-on/i.test(indexed)&&source.eligible)return{window:'after',stage:'FIRST_PUBLIC',stageLabel:'prima aparitie publica datata',eventDate:dated,dateConfidence:'dated-public-evidence',source,dateQuality:direct.quality};
  if(source.type==='manufacturer-official')return{window:'after',stage:'FIRST_PUBLIC',stageLabel:'prima aparitie oficiala datata',eventDate:dated,dateConfidence:'dated-public-evidence',source,dateQuality:direct.quality};
  if(source.type==='vendor-dated-evidence'&&/new-arrivals|new_arrivals|newarrival|preorder/.test(path))return{window:'after',stage:'FIRST_RETAIL',stageLabel:'prima oferta comerciala datata',eventDate:dated,dateConfidence:'dated-retail-page',source,dateQuality:direct.quality};
  return null;
}

function mergeProduct(target,event){
  target.products=Array.isArray(target.products)?target.products:[];
  const canonical=canonicalizeProduct({product:event.productName,brand:event.brand||''}),key=event.category+'|'+canonical.key+'|'+event.window,existing=target.products.find(function(product){const old=canonicalizeProduct({product:product.productName,brand:product.brand||''});return product.category===event.category&&product.window===event.window&&old.key===canonical.key});
  if(existing){const sources=new Map((existing.sources||[]).map(function(source){return[source.url,source]}));for(const source of event.sources||[])sources.set(source.url,source);existing.sources=Array.from(sources.values());existing.sourceCount=existing.sources.length;if(Date.parse(event.eventDate)<Date.parse(existing.eventDate)||existing.dateConfidence!=='explicit'&&event.dateConfidence==='explicit')Object.assign(existing,{eventDate:event.eventDate,stage:event.stage,stageLabel:event.stageLabel,dateConfidence:event.dateConfidence});existing.lastSeenAt=event.lastSeenAt;return false}
  event.id=hash(key);target.products.push(event);return true;
}
function finalize(target,stats){target.generatedAt=new Date().toISOString();target.discoveryContextDays=CONTEXT_DAYS;target.truth={...(target.truth||{}),productCentricEvidenceBackfill:true,directPublicationDateRequired:true,indexCrawlDateAloneIsNotRelease:true,publicWindowDays:PUBLIC_DAYS,researchContextDays:CONTEXT_DAYS};target.scan={...(target.scan||{}),productBackfill:stats};target.products=(target.products||[]).filter(function(product){return product&&product.eventDate&&((product.window==='before'&&(inFuture(product.eventDate,PUBLIC_DAYS)||inPast(product.eventDate,PUBLIC_DAYS)))||(product.window==='after'&&inPast(product.eventDate,PUBLIC_DAYS)))}).sort(function(a,b){return String(a.eventDate).localeCompare(String(b.eventDate))});target.summary={...(target.summary||{}),total:target.products.length,before:target.products.filter(function(product){return product.window==='before'}).length,after:target.products.filter(function(product){return product.window==='after'}).length};return target}

async function main(){
  const rta=read(RTA_FILE,{products:[]}),pods=read(POD_FILE,{products:[]}),memory=read(MEMORY_FILE,{items:{}}),cfg=read(SOURCE_FILE,{}),list=candidates(rta,pods,memory),queries=[];
  for(const candidate of list){const model=searchName(candidate),exact='"'+model.replace(/"/g,'')+'"';queries.push({candidate,channel:'dated-web',query:`${exact} (review OR preview OR announced OR launched OR release OR preorder OR "first look" OR "new arrival")`});queries.push({candidate,channel:'dated-social',query:`${model} (review OR "first look") (site:youtube.com OR site:reddit.com OR site:facebook.com OR site:instagram.com OR site:${(cfg.independentNewsDomains||[])[0]||'vaping360.com'})`})}
  const runs=await pool(queries,10,bing),working=runs.filter(function(run){return run.ok}).length,rows=Array.from(new Map(runs.flatMap(function(run){return run.rows||[]}).filter(function(row){return row.url&&productMatch(row.candidate,row.title+' '+row.description)}).map(function(row){return[candidateKey(row.candidate)+'|'+row.url,row]})).values()),limited=[];
  const perCandidate=new Map();for(const row of rows){const key=candidateKey(row.candidate),count=perCandidate.get(key)||0;if(count>=6)continue;perCandidate.set(key,count+1);limited.push(row);if(limited.length>=MAX_PAGES)break}
  const pages=await pool(limited,10,async function(row){try{const fetched=await fetchText(row.url,10000);return{row,url:fetched.url,html:fetched.text,error:''}}catch(error){return{row,url:row.url,html:'',error:String(error&&error.message||error)}}}),events=[],undated=[];let fetched=0,matched=0;
  for(const page of pages){if(!page||page.error||!page.html)continue;fetched++;const candidate=page.row.candidate;if(!productMatch(candidate,page.row.title+' '+page.row.description+' '+decode(page.html).slice(0,6000)))continue;matched++;const event=eventFor(candidate,page.row,page,cfg);if(!event){if(undated.length<160)undated.push({productName:candidate.productName,brand:candidate.brand,category:candidate.category,url:page.url,reason:'no-direct-dated-event'});continue}events.push({productName:candidate.productName,brand:candidate.brand,category:candidate.category,segment:candidate.segment,typology:candidate.typology,...event,url:page.url,title:page.row.title})}
  const grouped=new Map();for(const event of events){const key=candidateKey(event)+'|'+event.window,old=grouped.get(key);const evidence={host:host(event.url),url:event.url,title:event.title,sourceType:event.source.type,decisionEligible:event.source.eligible,discoveryOnly:!event.source.eligible,eventDate:event.eventDate,dateConfidence:event.dateConfidence,dateQuality:event.dateQuality||event.dateConfidence,stage:event.stageLabel,observedAt:new Date().toISOString()};if(!old){grouped.set(key,{productName:event.productName,brand:event.brand||'',category:event.category,segment:event.segment,typology:event.typology,window:event.window,stage:event.stage,stageLabel:event.stageLabel,eventDate:event.eventDate,dateConfidence:event.dateConfidence,firstSeenAt:new Date().toISOString(),lastSeenAt:new Date().toISOString(),ageHours:Number(Math.abs(ageDays(event.eventDate)*24).toFixed(1)),sourceCount:1,eligibleSources:event.source.eligible?1:0,sources:[evidence]});continue}if(!old.sources.some(function(source){return source.url===evidence.url}))old.sources.push(evidence);old.sourceCount=old.sources.length;old.eligibleSources=unique(old.sources.filter(function(source){return source.decisionEligible}).map(function(source){return source.sourceType})).length;if(Date.parse(event.eventDate)<Date.parse(old.eventDate))Object.assign(old,{eventDate:event.eventDate,stage:event.stage,stageLabel:event.stageLabel,dateConfidence:event.dateConfidence})}
  let rtaAdded=0,podAdded=0;for(const event of grouped.values()){if(!((event.window==='before'&&(inFuture(event.eventDate,PUBLIC_DAYS)||inPast(event.eventDate,PUBLIC_DAYS)))||(event.window==='after'&&inPast(event.eventDate,PUBLIC_DAYS))))continue;if(event.category==='POD'){if(mergeProduct(pods,event))podAdded++}else if(mergeProduct(rta,event))rtaAdded++}
  const stats={candidates:list.length,queries:queries.length,queriesWorking:working,indexedMatches:rows.length,pagesFetched:fetched,pagesMatched:matched,datedEvents:events.length,groupedEvents:grouped.size,rtaModAdded:rtaAdded,podsAdded:podAdded,undated:undated.length};finalize(rta,stats);finalize(pods,stats);
  const ledger={schemaVersion:1,generatedAt:new Date().toISOString(),snapshotReferenceAt:new Date(REF).toISOString(),publicWindowDays:PUBLIC_DAYS,researchContextDays:CONTEXT_DAYS,truth:{directPublicationDateRequired:true,indexCrawlDateAloneIsNotRelease:true,retailDiscoveryIsNotOfficialLaunch:true},scan:stats,events:Array.from(grouped.values()).sort(function(a,b){return String(b.eventDate).localeCompare(String(a.eventDate))}),matchedSample:limited.slice(0,80).map(function(row){return{productName:row.candidate.productName,searchName:searchName(row.candidate),title:row.title,url:row.url,publishedAt:row.publishedAt||null}}),undatedCandidates:Array.from(new Map(undated.map(function(item){return[candidateKey(item),item]})).values()).slice(0,120)};
  if(WRITE){save(RTA_FILE,rta);save(POD_FILE,pods);save(LEDGER_FILE,ledger)}else console.log(JSON.stringify(ledger,null,2));
  console.log(`Product evidence backfill: ${list.length} candidates; ${working}/${queries.length} searches; ${rows.length} indexed matches; ${fetched} pages; ${grouped.size} dated events; added RTA/MOD ${rtaAdded}; POD ${podAdded}.`);
}

main().catch(function(error){console.error(error&&error.stack||error);process.exit(1)});
