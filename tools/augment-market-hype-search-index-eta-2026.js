#!/usr/bin/env node
'use strict';
const fs=require('fs'),crypto=require('crypto');
const {snapshotReferenceMs}=require('./hype-window-reference-2026.js');
const WRITE=process.argv.includes('--write');
const CFG='data/market-hype-sources-2026.json',EXTRA='data/market-hype-active-makers-extra-2026.json',P='data/market-hype-products-2026.json';
const REF=snapshotReferenceMs(),LIMIT=720*36e5;
const read=(p,f={})=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(_){return f}};
const save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n','utf8');
const clean=v=>String(v||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&nbsp;|&#x20;|&#32;/gi,' ').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const norm=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9+.-]+/g,' ').replace(/\s+/g,' ').trim();
const hash=v=>crypto.createHash('sha256').update(String(v||'')).digest('hex').slice(0,20);
const iso=v=>{const x=Date.parse(String(v||''));return Number.isFinite(x)?new Date(x).toISOString():null};
const inSymmetric30=v=>{const x=Date.parse(String(v||''));return Number.isFinite(x)&&Math.abs(x-REF)<=LIMIT};
const age=v=>{const x=Date.parse(String(v||''));return Number.isFinite(x)?Math.max(0,(REF-x)/36e5):null};
const host=u=>{try{return new URL(String(u||'')).hostname.replace(/^www\./,'').toLowerCase()}catch(_){return''}};
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
async function get(url,timeout=14000){const c=new AbortController(),t=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Hype-Search-Index-ETA/1.1 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml,application/rss+xml,application/xml;q=.9,*/*;q=.5','accept-language':'en-US,en;q=.8'},signal:c.signal});const text=await r.text();if(!r.ok)throw new Error('HTTP '+r.status);return{url:r.url||url,text}}finally{clearTimeout(t)}}
async function limit(a,n,fn){let i=0,out=new Array(a.length);async function w(){for(;;){const k=i++;if(k>=a.length)return;try{out[k]=await fn(a[k])}catch(e){out[k]={error:String(e&&e.message||e)}}}}await Promise.all(Array.from({length:Math.min(n,a.length||1)},w));return out}
function tag(block,name){const m=String(block||'').match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return m?clean(m[1]):''}
function rss(xml,meta){const out=[];for(const m of String(xml||'').matchAll(/<item>([\s\S]*?)<\/item>/gi)){const b=m[1],title=tag(b,'title'),body=tag(b,'description'),url=tag(b,'link');if(title&&url)out.push({...meta,title,body,url})}return out}
async function bing(meta){try{const f=await get('https://www.bing.com/search?format=rss&q='+encodeURIComponent(meta.query),10000);return{ok:true,docs:rss(f.text,meta)}}catch(e){return{ok:false,docs:[],error:String(e&&e.message||e)}}}
function allowed(u,cfg){const h=host(u),ds=uniq([...(cfg.cloneSellerDiscoveryDomains||[]),...(cfg.originalSellerDiscoveryDomains||[])]);return ds.some(d=>h===d||h.endsWith('.'+d))}
function rta(s){return /\bRTA\b|rebuildable\s+(?:tank\s+)?atomiz|atomizer|atomiser/i.test(String(s||''))}
function accessory(s){return /replacement|tank tube|glass only|drip tip|air\s*pin|airflow pin|deck kit|beauty ring|spare|accessor|chimney|bell cap/i.test(String(s||''))}
function concreteProductTitle(s){const x=clean(s),n=norm(x);if(!rta(x)||accessory(x)||x.length<12)return false;if(/^(?:rta|rebuildable|atomizers?|pre-?order|new arrivals?|shop|products?|search results?)\b/i.test(x))return false;if(/\b(?:category|catalog|collection|new arrivals?|pre-?order products?|best sellers?)\b/i.test(x)&&n.split(' ').length<7)return false;return n.split(' ').filter(t=>/[a-z]/.test(t)).length>=3}
function typology(s){const t=norm(s);if(/\bmtl\b/.test(t)&&/top airflow|top air/.test(t))return'MTL top airflow';if(/\bmtl\b/.test(t))return'MTL single';if(/\brdl\b|restricted direct/.test(t))return'RDL single';if(/dual coil|dual deck/.test(t))return'DL dual';if(/\bdl\b|\bdtl\b|direct lung/.test(t))return'DL single';return'RDL single'}
function title(html,fallback){const s=String(html||'');for(const re of [/<h1\b[^>]*>([\s\S]*?)<\/h1>/i,/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i,/<title\b[^>]*>([\s\S]*?)<\/title>/i]){const m=s.match(re),v=m&&clean(m[1]);if(v&&concreteProductTitle(v))return v}return clean(fallback)}
function canonical(s){let x=clean(s).replace(/^Buy\s+/i,'').replace(/\s*\|\s*.*$/,'');const m=x.match(/^(.+?\bRTA\b(?:\s+(?:V\d+(?:[.+]\d+)?|PRO|PLUS|MINI|MAX|MTL|RDL|DL|SOLO|DUAL)){0,3})\b/i);if(m)x=m[1];else if(x.includes(' - '))x=x.split(' - ')[0];return x.trim().slice(0,190)}
const MONTH='(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';
const DATE=`(${MONTH}\\s+\\d{1,2},?\\s+2026|\\d{1,2}[.\\/-]\\d{1,2}[.\\/-]2026|\\d{1,2}\\s+${MONTH}\\s+2026)`;
function event(text){const s=clean(text),rules=[
 {re:new RegExp(`next\\s+batch[\\s\\S]{0,360}?(?:will\\s+be\\s+)?shipped\\s+around[\\s\\S]{0,140}?${DATE}`,'i'),kind:'BATCH'},
 {re:new RegExp(`product[\\s\\S]{0,260}?delayed[\\s\\S]{0,360}?will\\s+be\\s+shipped\\s+around[\\s\\S]{0,160}?${DATE}`,'i'),kind:'ETA'},
 {re:new RegExp(`will\\s+be\\s+shipped\\s+around[\\s\\S]{0,160}?${DATE}`,'i'),kind:'ETA'},
 {re:new RegExp(`(?:ETA|estimated\\s+shipping|shipping\\s+eta)[\\s:()\\-]{0,60}${DATE}`,'i'),kind:'ETA'}
 ];for(const r of rules){const m=s.match(r.re);if(!m)continue;const raw=m.slice(1).find(x=>x&&/2026/.test(x)),d=iso(raw);if(!d||!inSymmetric30(d))continue;const future=Date.parse(d)>REF;return{window:'before',stage:r.kind==='BATCH'?'BATCH':'IMMINENT',stageLabel:r.kind==='BATCH'?(future?'batch viitor':'batch ETA depășit · confirmă disponibilitatea'):(future?'ETA / precomandă':'ETA depășit · confirmă batch-ul/disponibilitatea'),eventDate:d,dateConfidence:'explicit'}}return null}
function brand(name,cfg){const t=norm(name),seen=new Set();for(const x of cfg.cloneMakers||[]){const k=norm(x);if(!k||seen.has(k))continue;seen.add(k);if(t.includes(k))return String(x).toUpperCase()}for(const m of cfg.officialMakers||[])for(const a of String(m.name||'').split(/[\/|]/)){const k=norm(a);if(k.length>=3&&(t.includes(k)||t.includes(k.replace(/\s+/g,''))))return m.name}return clean(name).split(/\s+/)[0]||null}
function core(name){return norm(name).replace(/\b(authentic|style|styled|clone|rta|rebuildable|tank|atomizer|atomiser)\b/g,' ').replace(/\s+/g,' ').trim()}
function merge(map,p){const k=core(p.productName)+'|'+p.typology+'|before',o=map.get(k);if(!o){p.id=p.id||hash(k);map.set(k,p);return}const sm=new Map((o.sources||[]).map(s=>[s.url,s]));for(const s of p.sources||[])sm.set(s.url,s);o.sources=[...sm.values()].slice(0,32);o.sourceCount=o.sources.length;o.eventDate=p.eventDate;o.stage=p.stage;o.stageLabel=p.stageLabel;o.dateConfidence='explicit';o.lastSeenAt=p.lastSeenAt;o.ageHours=age(o.eventDate)}
function makerClause(values){const terms=[];for(const raw of values||[]){for(const part of String(raw||'').split(/[\/|]/)){const x=clean(part).replace(/[()]/g,'').trim();if(norm(x).length<3)continue;terms.push(`"${x.replace(/"/g,'')}"`);const tight=x.replace(/[^A-Za-z0-9]+/g,'');if(tight.length>=4&&norm(tight)!==norm(x))terms.push(tight)}}const u=uniq(terms).slice(0,6);return u.length>1?`(${u.join(' OR ')})`:(u[0]||'')}
async function main(){
 const cfg=read(CFG,{}),extra=read(EXTRA,{}),old=read(P,{products:[]}),map=new Map();
 for(const p of old.products||[])if(p&&p.productName&&p.eventDate){const k=core(p.productName)+'|'+p.typology+'|'+p.window;map.set(k,{...p})}
 const domains=uniq([...(cfg.cloneSellerDiscoveryDomains||[]),...(cfg.originalSellerDiscoveryDomains||[])]),queries=[];
 const makerGroups=[];
 for(const m of cfg.officialMakers||[])makerGroups.push({name:m.name,terms:[m.name]});
 for(const m of cfg.cloneMakers||[])makerGroups.push({name:String(m),terms:[String(m)]});
 for(const m of extra.activeMakers||[])if((m.categories||[]).includes('RTA'))makerGroups.push({name:m.name,terms:[m.name,...(m.aliases||[])]});
 const seenMakers=new Set();
 for(const m of makerGroups){const mk=norm(m.name);if(!mk||seenMakers.has(mk))continue;seenMakers.add(mk);const clause=makerClause(m.terms);if(!clause)continue;queries.push({query:`${clause} RTA "next batch" 2026`,mode:'maker-targeted',maker:m.name});queries.push({query:`${clause} RTA "product is delayed" 2026`,mode:'maker-targeted',maker:m.name})}
 for(const d of domains){queries.push({query:`site:${d} RTA "next batch" 2026`,mode:'domain'});queries.push({query:`site:${d} RTA "shipped around" 2026`,mode:'domain'});queries.push({query:`site:${d} RTA "product is delayed" 2026`,mode:'domain'});queries.push({query:`site:${d} RTA ETA 2026 preorder`,mode:'domain'})}
 const uniqueQueries=[...new Map(queries.map(q=>[q.query,q])).values()];
 const runs=await limit(uniqueQueries,8,bing);
 const docs=[...new Map(runs.flatMap(x=>x.docs||[]).filter(x=>x.url&&allowed(x.url,cfg)&&rta(x.title+' '+x.body)&&!accessory(x.title)).map(x=>[x.url.split('#')[0],x])).values()].slice(0,360);
 const pages=await limit(docs.slice(0,260),12,async x=>{try{const f=await get(x.url);return{x,url:f.url,html:f.text,error:null}}catch(e){return{x,url:x.url,html:'',error:String(e&&e.message||e)}}});
 let phraseHits=0,events=0,snippetFallbacks=0;const sample=[],now=new Date().toISOString();
 for(const z of pages){
   if(!z||!z.x||!allowed(z.url||z.x.url,cfg))continue;
   const directOk=!z.error&&!!z.html,pageTxt=directOk?clean(z.html):'',snippetTxt=clean(`${z.x.title} ${z.x.body}`);
   const phraseText=directOk?pageTxt:snippetTxt;
   if(/next\s+batch|will\s+be\s+shipped\s+around|\bETA\b|product\s+is\s+delayed/i.test(phraseText))phraseHits++;
   let ev=directOk?event(pageTxt):null,evidenceMode='vendor-page';
   if(!ev){const fallbackEv=event(snippetTxt);if(fallbackEv&&concreteProductTitle(z.x.title)){ev=fallbackEv;evidenceMode='search-index-snippet';snippetFallbacks++}}
   if(!ev)continue;
   const name=canonical(evidenceMode==='vendor-page'?title(z.html,z.x.title):z.x.title);
   if(!concreteProductTitle(name))continue;
   const evidenceText=evidenceMode==='vendor-page'?pageTxt:snippetTxt,typ=typology(name+' '+evidenceText),u=z.url||z.x.url;
   const src={host:host(u),url:u,title:name,sourceType:evidenceMode==='vendor-page'?'vendor-search-index':'vendor-search-index-snippet',decisionEligible:false,discoveryOnly:true,eventDate:ev.eventDate,dateConfidence:evidenceMode==='vendor-page'?'explicit-vendor-eta':'explicit-search-index-snippet-eta',evidenceConfidence:evidenceMode==='vendor-page'?'high':'medium',stage:ev.stageLabel,observedAt:now};
   merge(map,{productName:name,brand:brand(name,cfg),category:'RTA',typology:typ,window:'before',stage:ev.stage,stageLabel:ev.stageLabel,eventDate:ev.eventDate,dateConfidence:'explicit',firstSeenAt:now,lastSeenAt:now,ageHours:age(ev.eventDate),sourceCount:1,eligibleSources:0,sources:[src]});
   events++;if(sample.length<40)sample.push({name,eventDate:ev.eventDate,stage:ev.stageLabel,url:u,evidenceMode,queryMode:z.x.mode||null,queryMaker:z.x.maker||null});
 }
 const products=[...map.values()].filter(x=>x&&x.productName&&x.eventDate),doc={...old,schemaVersion:Math.max(26,Number(old.schemaVersion||0)),generatedAt:now,pendingRefresh:false,truth:{...(old.truth||{}),searchIndexVendorEtaRecovery:true,searchIndexMakerTargeting:true,searchIndexCloneMakerTargeting:true,searchIndexSnippetFallback:true,searchIndexSnippetRequiresExplicitDate:true,searchIndexSnippetDiscoveryOnly:true,pastEtaIsNotRelease:true,symmetric30DayEventWindow:true},scan:{...(old.scan||{}),searchIndexEtaQueries:uniqueQueries.length,searchIndexEtaWorking:runs.filter(x=>x.ok).length,searchIndexEtaMakerTargets:seenMakers.size,searchIndexEtaCloneMakerRegistry:(cfg.cloneMakers||[]).length,searchIndexEtaCandidates:docs.length,searchIndexEtaPages:pages.filter(x=>x&&!x.error&&x.html).length,searchIndexEtaPhraseHits:phraseHits,searchIndexEtaSnippetFallbacks:snippetFallbacks,searchIndexEtaEvents:events,searchIndexEtaSample:sample},products,summary:{...(old.summary||{}),total:products.length,before:products.filter(x=>x.window==='before').length,after:products.filter(x=>x.window==='after').length}};
 if(WRITE)save(P,doc);
 console.log(`Hype search-index ETA: ${runs.filter(x=>x.ok).length}/${uniqueQueries.length} queries; maker targets ${seenMakers.size}; clone registry ${(cfg.cloneMakers||[]).length}; candidates ${docs.length}; pages ${doc.scan.searchIndexEtaPages}; snippet fallbacks ${snippetFallbacks}; phrase hits ${phraseHits}; events ${events}; products ${products.length}.`);
 if(sample.length)console.log('Hype search-index ETA events:',sample.map(x=>`${x.name} | ${x.stage} | ${x.eventDate} | ${x.evidenceMode} | ${x.queryMaker||x.queryMode||''}`).join(' || '));
}
main().catch(e=>{console.error(e&&e.stack||e);process.exit(1)});