#!/usr/bin/env node
'use strict';

const fs=require('fs');
const crypto=require('crypto');
const {snapshotReferenceMs,windowAgeHours,inPastWindow}=require('./hype-window-reference-2026.js');

const WRITE=process.argv.includes('--write');
const FILE='/tmp/market-hype-upstream-evidence-2026.json';
const REF=snapshotReferenceMs();
const NOW=new Date().toISOString();

const PROFILES=[
  {name:'Cloumix 2026',url:'https://news.cloumix.com/2026/',host:'news.cloumix.com',sourceType:'independent-vape-news',eligible:true,maxLinks:80},
  {name:'Vaping Underground RTA',url:'https://vapingunderground.com/tags/rta/',host:'vapingunderground.com',sourceType:'vaping-forum-prelaunch',eligible:true,maxLinks:80},
  {name:'ECF RTA',url:'https://www.e-cigarette-forum.com/forums/rta.887/',host:'e-cigarette-forum.com',sourceType:'vaping-forum-prelaunch',eligible:true,maxLinks:70},
  {name:'Le Vapelier materials',url:'https://www.levapelier.com/en/materiels/',host:'levapelier.com',sourceType:'independent-vape-news',eligible:true,maxLinks:70}
];

const RELEASE_RE=/(has\s+been\s+launched\s+newly|recently\s+launched|newly\s+launched|just\s+released|newly\s+released|officially\s+launched|just\s+launched|released\s+today|released\s+this\s+week|launch\s+day|new!\s*authentic)/i;
const RTA_RE=/\bRTA\b|rebuildable\s+tank\s+atomiz|rebuildable\s+atomiz|atomizer|atomiser/i;
const NON_RTA=/\b(?:pod|pod\s+kit|starter\s+kit|sub[- ]?ohm|clearomizer|disposable|cartridge)\b/i;
const NOISE=/\b(?:sale|discount|coupon|clearance|best of|roundup|guide|comparison)\b/i;

function read(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'))}catch(_){return{events:[]}}}
function write(v){fs.writeFileSync(FILE,JSON.stringify(v,null,2)+'\n','utf8')}
function clean(v){return String(v||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&nbsp;|&#x20;|&#32;/gi,' ').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function decode(v){return clean(String(v||'').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16))))}
function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9+.-]+/g,' ').replace(/\s+/g,' ').trim()}
function hash(v){return crypto.createHash('sha256').update(String(v||'')).digest('hex').slice(0,20)}
function host(u){try{return new URL(String(u||'')).hostname.replace(/^www\./,'').toLowerCase()}catch(_){return''}}
function unique(a){return[...new Set((a||[]).filter(Boolean))]}
function meta(html,key){const esc=key.replace(':','\\:');let m=String(html||'').match(new RegExp(`<meta[^>]+(?:property|name)=["']${esc}["'][^>]+content=["']([^"']+)["']`,'i'));if(!m)m=String(html||'').match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${esc}["']`,'i'));return m?decode(m[1]):''}
function tag(html,name){const m=String(html||'').match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return m?decode(m[1]):''}
function iso(v){const x=Date.parse(String(v||''));return Number.isFinite(x)?new Date(x).toISOString():null}

function pageDate(html){
  const s=String(html||'');
  const raw=[
    meta(s,'article:published_time'),meta(s,'og:published_time'),meta(s,'date'),
    (s.match(/"datePublished"\s*:\s*"([^"]+)"/i)||[])[1],
    (s.match(/<time\b[^>]*datetime=["']([^"']+)/i)||[])[1],
    (s.match(/\b(2026-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2}))/i)||[])[1]
  ].map(iso).filter(Boolean);
  for(const x of raw)if(inPastWindow(x,720,REF))return x;
  const text=clean(s);
  const named=text.match(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(2026)\b/i);
  if(named){const x=iso(`${named[1]} ${named[2]}, ${named[3]} 12:00:00 UTC`);if(x&&inPastWindow(x,720,REF))return x}
  const num=text.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](2026)\b/);
  if(num){let a=Number(num[1]),b=Number(num[2]),m,d;if(a>12){d=a;m=b}else if(b>12){m=a;d=b}else{m=a;d=b}const x=iso(`${num[3]}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T12:00:00Z`);if(x&&inPastWindow(x,720,REF))return x}
  return null;
}

async function get(url,timeout=11000){
  const c=new AbortController(),tm=setTimeout(()=>c.abort(),timeout);
  try{
    const r=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Hype-Release-Observer/1.0 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5','accept-language':'en,ro,de,fr,it,es;q=0.7'},signal:c.signal});
    const text=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status}`);return{url:r.url||url,text};
  }finally{clearTimeout(tm)}
}
async function limit(items,n,fn){const out=new Array(items.length);let i=0;async function worker(){for(;;){const k=i++;if(k>=items.length)return;try{out[k]=await fn(items[k])}catch(e){out[k]={error:String(e&&e.message||e)}}}}await Promise.all(Array.from({length:Math.min(n,Math.max(1,items.length))},worker));return out}

function candidateLinks(html,profile,base){
  const rows=[];
  for(const m of String(html||'').matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
    let u;try{u=new URL(m[1],base)}catch(_){continue}
    if(host(u.href)!==profile.host)continue;
    const title=decode(m[2]),combined=title+' '+decode(u.pathname.replace(/[-_/]+/g,' '));
    if(!RTA_RE.test(combined)||NOISE.test(title))continue;
    if(NON_RTA.test(title)&&!(/\bRTA\b/i.test(title)))continue;
    if(u.href===profile.url)continue;
    rows.push({url:u.origin+u.pathname+(u.search||''),title});
  }
  return[...new Map(rows.map(x=>[x.url,x])).values()].slice(0,profile.maxLinks);
}

function productTitle(html,fallback){
  const vals=unique([meta(html,'og:title'),meta(html,'twitter:title'),tag(html,'h1'),tag(html,'h2'),tag(html,'title'),fallback].map(decode).filter(Boolean));
  const ranked=vals.map(v=>({v,score:(RTA_RE.test(v)?50:0)+(v.length<=110?12:0)+(/\d/.test(v)?4:0)-(NOISE.test(v)?40:0)-(NON_RTA.test(v)&&!(/\bRTA\b/i.test(v))?50:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.v.length-b.v.length);
  if(!ranked.length)return null;
  let x=ranked[0].v.replace(/^\s*(?:do you like|are you interested in|the latest|new arrival|newly released|new released|new!?\s*authentic|review|preview)\s*[:\-!?]?\s*/i,'').replace(/\s+[|–—-]\s+(?:cloumix|vaping underground|e-cigarette forum|le vapelier).*$/i,'').replace(/[?!.]+$/,'').trim();
  const m=x.match(/^(.+?\bRTA\b(?:\s+(?:PRO|PLUS|V\d+(?:\.\d+)?|MINI|MAX)){0,2})\b/i);if(m)x=m[1];
  if(!RTA_RE.test(x)||(NON_RTA.test(x)&&!(/\bRTA\b/i.test(x))))return null;return x.slice(0,170);
}
function typ(text){const t=norm(text);if(/\bmtl\b/.test(t)&&/top airflow|top air/.test(t))return'MTL top airflow';if(/\bmtl\b/.test(t))return'MTL single';if(/\brdl\b|restricted direct/.test(t))return'RDL single';if(/dual coil|dual-coil|dual deck/.test(t))return'DL dual';if(/\bdl\b|\bdtl\b|direct lung/.test(t))return'DL single';return'RDL single'}
function releaseTerm(text){const m=String(text||'').match(RELEASE_RE);return m?m[1]:null}
function core(name){return norm(name).replace(/\b(authentic|style|styled|clone|rta|rebuildable|tank|atomizer|atomiser|4ml|5ml|3ml)\b/g,' ').replace(/\s+/g,' ').trim()}

async function main(){
  const doc=read(),indexResults=await limit(PROFILES,4,async p=>{const f=await get(p.url);return{profile:p,url:f.url,links:candidateLinks(f.text,p,f.url)}});
  const linkMap=new Map();for(const row of indexResults){if(!row||row.error||!row.profile)continue;for(const x of row.links||[])if(!linkMap.has(x.url))linkMap.set(x.url,{...x,profile:row.profile})}
  const links=[...linkMap.values()].slice(0,220),pages=await limit(links,8,async x=>{const f=await get(x.url);return{x,url:f.url,text:f.text}}),found=[];
  let fetched=0,rejectedDate=0,rejectedRelease=0,rejectedTitle=0;
  for(const row of pages){if(!row||row.error||!row.text)continue;fetched++;const date=pageDate(row.text);if(!date){rejectedDate++;continue}const text=clean(row.text).slice(0,50000),term=releaseTerm(text+' '+row.x.title);if(!term){rejectedRelease++;continue}const name=productTitle(row.text,row.x.title);if(!name){rejectedTitle++;continue}found.push({productName:name,typology:typ(name+' '+text.slice(0,9000)),publishedAt:date,sourceType:row.x.profile.sourceType,decisionEligible:row.x.profile.eligible===true,host:host(row.url),url:row.url,originalTitle:row.x.title,releaseEvidenceTerm:term})}
  const grouped=new Map();for(const x of found){const k=core(x.productName);if(!k)continue;if(!grouped.has(k))grouped.set(k,{productName:x.productName,typology:x.typology,sources:[]});const g=grouped.get(k);if(x.productName.length<g.productName.length)g.productName=x.productName;if(!g.sources.some(s=>s.url===x.url))g.sources.push(x)}
  const existing=new Set((doc.events||[]).map(e=>`${e.kind}|${core(e.productName||'')}|${e.category||''}`));let appended=0;
  for(const [k,g] of grouped){const eventKey=`released|${k}|RTA`;if(existing.has(eventKey))continue;const sources=g.sources.map(s=>({sourceType:s.sourceType,host:s.host,url:s.url,title:g.productName,originalTitle:s.originalTitle||null,publishedAt:s.publishedAt,ageHours:Number(windowAgeHours(s.publishedAt,REF).toFixed(1)),stage:'lansat',maturityScore:100,decisionEligible:s.decisionEligible,discoveryOnly:!s.decisionEligible,firstSeenAt:NOW,lastSeenAt:NOW,releaseObserver:true,releaseEvidenceTerm:s.releaseEvidenceTerm,dateQuality:'source-page-direct'}));doc.events=doc.events||[];doc.events.push({eventId:hash('recent-release|'+eventKey),kind:'released',category:'RTA',typology:g.typology,productName:g.productName,stages:['lansare observată'],sourceTypeCount:unique(sources.filter(s=>s.decisionEligible).map(s=>s.sourceType)).length,sourceHostCount:unique(sources.map(s=>s.host)).length,recentReleaseObserver:true,sources});appended++}
  doc.scan=doc.scan||{};Object.assign(doc.scan,{recentReleaseObserver:true,recentReleaseReference:new Date(REF).toISOString(),recentReleaseProfiles:PROFILES.length,recentReleaseIndexWorking:indexResults.filter(x=>x&&!x.error).length,recentReleaseLinks:links.length,recentReleasePagesFetched:fetched,recentReleaseCandidates:found.length,recentReleaseEventsAppended:appended,recentReleaseRejectedDate:rejectedDate,recentReleaseRejectedReleaseTerm:rejectedRelease,recentReleaseRejectedTitle:rejectedTitle});
  doc.truth=doc.truth||{};doc.truth.recentReleaseRequiresExplicitWording=true;doc.truth.recentReviewAloneIsNotRelease=true;doc.truth.dailyWindowAnchoredAt0600Bucharest=true;if(WRITE)write(doc);
  console.log(`Hype recent release observer: profiles ${doc.scan.recentReleaseIndexWorking}/${PROFILES.length}; links ${links.length}; pages ${fetched}; candidates ${found.length}; appended ${appended}; ref ${new Date(REF).toISOString()}.`);if(found.length)console.log('Recent release candidates:',found.slice(0,20).map(x=>`${x.productName} | ${x.sourceType} | ${x.publishedAt}`).join(' || '));
}
main().catch(e=>{console.error(e&&e.stack||e);process.exit(1)});
