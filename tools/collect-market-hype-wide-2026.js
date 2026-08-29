#!/usr/bin/env node
'use strict';

const fs=require('fs');
const crypto=require('crypto');
const CFG='data/market-hype-sources-2026.json';
const RADAR='data/market-hype-radar-2026.json';
const EVID='data/market-hype-evidence-2026.json';
const HEART='data/market-hype-heartbeat-2026.json';
const HEART_EVID='data/market-hype-heartbeat-evidence-2026.json';
const WRITE=process.argv.includes('--write');

function read(p,f={}){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(_){return f}}
function write(p,v){fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n','utf8')}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function clean(v){return String(v||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function hash(v){return crypto.createHash('sha256').update(String(v||'')).digest('hex').slice(0,20)}
function host(u){try{return new URL(String(u||'')).hostname.replace(/^www\./,'').toLowerCase()}catch(_){return''}}
function domainMatch(h,d){h=String(h||'').toLowerCase();d=String(d||'').toLowerCase();return Boolean(h&&d&&(h===d||h.endsWith('.'+d)))}
function iso(v){const ms=Date.parse(String(v||''));return Number.isFinite(ms)?new Date(ms).toISOString():null}
function ageHours(v){const ms=Date.parse(String(v||''));return Number.isFinite(ms)?Math.max(0,(Date.now()-ms)/36e5):null}
function diffHours(a,b){const x=Date.parse(String(a||'')),y=Date.parse(String(b||''));return Number.isFinite(x)&&Number.isFinite(y)?Math.max(0,(x-y)/36e5):null}
function unique(a){return[...new Set((a||[]).filter(Boolean))]}
function tag(block,name){const m=String(block||'').match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return m?clean(m[1]):''}
function sameDayWindow(v,hours){const a=ageHours(v);return a!=null&&a<=hours}
function canonicalUrl(u){try{const x=new URL(u);return x.origin+x.pathname.replace(/\/$/,'')}catch(_){return String(u||'')}}

async function fetchText(url,timeout=11000){
  const c=new AbortController(),tm=setTimeout(()=>c.abort(),timeout);
  try{
    const r=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Hype-Global/4.1 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml,application/rss+xml,application/xml;q=0.9,*/*;q=0.5','accept-language':'en,ro,de,fr,it,es;q=0.7'},signal:c.signal});
    const text=await r.text();
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return{url:r.url||url,text};
  }finally{clearTimeout(tm)}
}
function rss(xml,meta){
  const out=[];
  for(const m of String(xml||'').matchAll(/<item>([\s\S]*?)<\/item>/gi)){
    const b=m[1],title=tag(b,'title'),body=tag(b,'description'),url=tag(b,'link'),publishedAt=iso(tag(b,'pubDate')||tag(b,'dc:date'));
    if(title||body)out.push({...meta,title,body,url,publishedAt});
  }
  return out;
}
async function bing(meta){
  try{const f=await fetchText('https://www.bing.com/search?format=rss&q='+encodeURIComponent(meta.query),10000);return{ok:true,meta,docs:rss(f.text,meta)}}
  catch(e){return{ok:false,meta,docs:[],error:String(e&&e.message||e).slice(0,140)}}
}
async function mapLimit(items,limit,fn){
  const out=new Array(items.length);let i=0;
  async function worker(){for(;;){const n=i++;if(n>=items.length)return;out[n]=await fn(items[n],n)}}
  await Promise.all(Array.from({length:Math.min(limit,Math.max(1,items.length))},worker));
  return out;
}

function pagePublished(html){
  const p=[/property=["']article:published_time["'][^>]*content=["']([^"']+)/i,/name=["']date["'][^>]*content=["']([^"']+)/i,/"datePublished"\s*:\s*"([^"]+)"/i,/<time\b[^>]*datetime=["']([^"']+)/i];
  for(const re of p){const m=String(html||'').match(re);if(m&&iso(m[1]))return iso(m[1])}
  return null;
}
function hasTerms(text,terms){const t=norm(text);return(terms||[]).some(x=>t.includes(norm(x)))}
function classify(text){
  const t=norm(text);
  if(/drip tip|mouthpiece/.test(t))return{category:'ACCESORII',typology:'drip tip'};
  if(/replacement glass|tank glass|pyrex|glass tube/.test(t))return{category:'ACCESORII',typology:'sticla'};
  if(/vape cotton|organic cotton|wicking cotton|bumbac/.test(t))return{category:'ACCESORII',typology:'bumbac'};
  if(/kanthal|nichrome|ni80|ss316|nife|vape wire|coil wire|sarma/.test(t))return{category:'ACCESORII',typology:'sarma'};
  if(/coil jig|ceramic tweezer|vape tool|build tool|tool kit/.test(t))return{category:'ACCESORII',typology:'tool-uri'};
  if(/side by side|\bsbs\b/.test(t))return{category:'MODURI',typology:'side by side'};
  if(/squonk|bottom feeder/.test(t))return{category:'MODURI',typology:'squonk'};
  if(/dual battery|dual 18650|dual 21700|2x18650|2x21700|dual cell/.test(t))return{category:'MODURI',typology:'dual battery'};
  if(/single battery|single 18650|single 21700|1x18650|1x21700|box mod|regulated mod|mechanical mod|mech mod/.test(t))return{category:'MODURI',typology:'single battery'};
  if(/rta|rebuildable tank|atomizer|atomiser|atomizor|atomizzatore|atomiseur|selbstwickel|styled rta|clone rta/.test(t)){
    if(/mtl/.test(t)&&/top airflow|top-airflow|top air/.test(t))return{category:'RTA',typology:'MTL top airflow'};
    if(/mtl/.test(t))return{category:'RTA',typology:'MTL single'};
    if(/rdl|restricted direct/.test(t))return{category:'RTA',typology:'RDL single'};
    if(/dual coil|dual-coil|dual deck/.test(t))return{category:'RTA',typology:'DL dual'};
    if(/\bdl\b|direct lung|dtl/.test(t))return{category:'RTA',typology:'DL single'};
    return{category:'RTA',typology:'RDL single'};
  }
  return null;
}
function isReleased(text,cfg){return hasTerms(text,cfg.truthRules&&cfg.truthRules.releaseTerms)||/new arrival|new arrivals|just arrived|just released|released today|released this week|available now|now available|shipping now|ready to ship|officially available/.test(norm(text))}
function maturity(text,cfg){
  const t=norm(text);
  if(isReleased(text,cfg))return{stage:'RELEASED',score:100,label:'lansat'};
  if(/pre sale|presale|pre order|preorder|launching soon|release soon|waitlist open|estimated shipping|vorbestellung|precommande|preordine|preventa|precomanda/.test(t))return{stage:'IMMINENT',score:90,label:'iminent'};
  if(/mass production|production started|first batch production|first batch|erste charge/.test(t))return{stage:'PRODUCTION',score:75,label:'producție'};
  if(/sample sent|sample received|review sample|review coming|shipping to reviewers|first look soon|muster erhalten|echantillon recu|campione ricevuto|muestra recibida|mostra primita/.test(t))return{stage:'SAMPLE_REVIEW',score:60,label:'mostre / review'};
  if(/prototype|engineering sample|pre production|prototyp|prototipo|prototip/.test(t))return{stage:'PROTOTYPE',score:45,label:'prototip'};
  if(/teaser|sneak peek|reveal soon|announcement soon|coming soon|bald erhaltlich|bientot disponible|prossimamente|proximamente|in curand/.test(t))return{stage:'TEASER',score:30,label:'teaser'};
  return{stage:'RUMOR',score:15,label:'zvon'};
}
function makerAliases(name){return unique(String(name||'').split(/[\/|]/).map(norm).flatMap(x=>x.split(' ')).filter(x=>x.length>=4&&!['mods','vape','official','smokerstore','pipeline'].includes(x)))}
function makerMatch(expected,text){if(!expected)return false;const t=norm(text);return makerAliases(expected).some(x=>t.includes(x))}
function sourceMeta(doc,url,cfg,text){
  const h=host(url),official=(cfg.officialMakers||[]).flatMap(x=>x.domains||[]),forums=cfg.forumDomains||[],news=cfg.independentNewsDomains||[],vendors=cfg.discoveryCommercialDomains||[];
  if(official.some(d=>domainMatch(h,d)))return{type:'manufacturer-official',bucket:'manufacturer',eligible:true,discoveryOnly:false};
  if(forums.some(d=>domainMatch(h,d)))return{type:'vaping-forum-prelaunch',bucket:'community',eligible:true,discoveryOnly:false};
  if(news.some(d=>domainMatch(h,d)))return{type:'independent-vape-news',bucket:'media',eligible:true,discoveryOnly:false};
  if(domainMatch(h,'reddit.com'))return{type:'reddit-prelaunch',bucket:'community',eligible:true,discoveryOnly:false};
  if(['facebook.com','instagram.com','threads.net','tiktok.com','x.com','twitter.com'].some(d=>domainMatch(h,d))){const ok=makerMatch(doc.expectedMaker,text);return{type:'manufacturer-social-public',bucket:'social',eligible:ok,discoveryOnly:!ok}}
  if(['youtube.com','youtu.be'].some(d=>domainMatch(h,d)))return{type:'creator-prelaunch',bucket:'media',eligible:true,discoveryOnly:false};
  if(['t.me','telegram.me','discord.com','discord.gg'].some(d=>domainMatch(h,d))){const ok=makerMatch(doc.expectedMaker,text);return{type:'manufacturer-community',bucket:'community',eligible:ok,discoveryOnly:!ok}}
  if(vendors.some(d=>domainMatch(h,d)))return{type:'vendor-discovery',bucket:'commercial-discovery',eligible:false,discoveryOnly:true};
  return{type:'open-web-discovery',bucket:'open-web',eligible:false,discoveryOnly:true};
}
function productCommercial(html,text,url){
  const h=String(html||''),path=(()=>{try{return new URL(url).pathname.toLowerCase()}catch(_){return''}})();
  return /"@type"\s*:\s*"Product"|itemprop=["']price["']|"priceCurrency"\s*:|add-to-cart|single_add_to_cart_button/i.test(h)||/(^|\/)(product|products|shop|cart|checkout)(\/|$)/i.test(path)&&/\b(price|stock|cart|sku)\b/i.test(text);
}
function triggerHit(text,cfg){return hasTerms(text,cfg.truthRules&&cfg.truthRules.preAnnouncementTerms)||isReleased(text,cfg)||/styled rta|clone rta|1 1 clone|sxk|ulton|yftk|yfty|sjmy|kindbright|shenray|coppervape|vazzling|vapeasy|tobeco|wejoytech|jftk|liefeng/.test(norm(text))}
const STOP=new Set('the a an and or for with from new vape vaping rta rba rdta atomizer atomiser atomizor atomizzatore atomiseur mod mods official teaser coming soon prototype sample review product products clone styled authentic released available arrival neu nouveau nuovo nuevo'.split(/\s+/));
function tokens(text){return unique(norm(text).split(' ').filter(x=>x.length>=3&&!STOP.has(x)&&!/^\d+$/.test(x))).slice(0,28)}
function similarity(a,b){const A=new Set(a||[]),B=new Set(b||[]);if(!A.size||!B.size)return 0;let hit=0;for(const x of A)if(B.has(x))hit++;return hit/Math.max(1,Math.min(A.size,B.size))}

function plans(cfg){
  const pre='("rumor" OR rumour OR leak OR leaked OR "sneak peek" OR teaser OR "coming soon" OR prototype OR "engineering sample" OR "sample received" OR "review coming" OR "production started" OR "first batch" OR "pre-order" OR preorder OR "pre-sale" OR presale OR "waitlist open" OR "release soon")';
  const rel='("new arrival" OR "new arrivals" OR "just arrived" OR "just released" OR released OR launched OR "available now" OR "now available" OR "shipping now")';
  const prod='(RTA OR "rebuildable tank" OR atomizer OR atomiser OR atomizzatore OR atomiseur OR Selbstwickler OR squonk OR "side by side")';
  const clone='("RTA clone" OR "styled RTA" OR "1:1 clone" OR SXK OR Ulton OR YFTK OR YFTY OR SJMY OR Kindbright OR ShenRay OR Coppervape OR Vazzling OR Vapeasy OR Tobeco OR WeJoyTech OR JFTK OR LieFeng)';
  const q=[];
  for(const m of cfg.officialMakers||[]){
    q.push({query:`"${m.name}" (${pre} OR ${rel}) ${prod}`,expectedMaker:m.name});
    q.push({query:`"${m.name}" ${prod} (site:facebook.com OR site:instagram.com OR site:threads.net OR site:tiktok.com OR site:x.com OR site:youtube.com OR site:t.me OR site:discord.com) (${pre} OR ${rel})`,expectedMaker:m.name});
  }
  for(const m of cfg.cloneMakers||[])q.push({query:`"${m}" (${pre} OR ${rel}) (RTA OR atomizer OR atomiser OR styled OR clone)`});
  for(const d of cfg.forumDomains||[])q.push({query:`site:${d} (${pre} OR ${rel}) (RTA OR atomizer OR clone OR SXK OR Ulton OR YFTK OR SJMY)`});
  for(const d of cfg.independentNewsDomains||[])q.push({query:`site:${d} (${pre} OR ${rel}) ${prod}`});
  for(const d of cfg.discoveryCommercialDomains||[])q.push({query:`site:${d} (${pre} OR ${rel}) (RTA OR atomizer OR SXK OR Ulton OR YFTK OR SJMY OR Kindbright)`});
  for(const d of cfg.socialDiscoveryDomains||[])q.push({query:`site:${d} (${pre} OR ${rel}) (RTA OR atomizer OR "RTA clone" OR SXK OR Ulton OR YFTK)`});
  for(const s of cfg.redditScopes||[])q.push({query:`site:${s} (${pre} OR ${rel}) (RTA OR atomizer OR clone)`});
  for(const x of cfg.openWebDiscoveryQueries||[])q.push({query:`${x} (${pre} OR ${rel})`});
  q.push({query:`(${pre} OR ${rel}) ${clone}`});
  q.push({query:`(${pre} OR ${rel}) RTA "new product watch"`});
  return q.slice(0,340);
}

async function enrich(doc,cfg){
  if(!doc.url||!doc.publishedAt)return null;
  let resolved=doc.url,html='',pageDate=null,fetchOk=false;
  try{const f=await fetchText(doc.url,8500);resolved=f.url;html=f.text;pageDate=pagePublished(html);fetchOk=true}catch(_){}
  const base=clean((doc.title||'')+' '+(doc.body||'')),main=clean(html).slice(0,24000),text=clean(base+' '+main);
  if(!triggerHit(text,cfg))return null;
  const cls=classify(text);if(!cls)return null;
  const pub=pageDate||doc.publishedAt,ah=ageHours(pub),limit=Number(cfg.lookbackHours||720);if(ah==null||ah>limit)return null;
  const meta=sourceMeta(doc,resolved,cfg,text),mat=maturity(text,cfg),kind=mat.stage==='RELEASED'?'released':'upcoming',commercial=productCommercial(html,text,resolved);
  if(kind==='upcoming'&&commercial&&!meta.discoveryOnly)return null;
  if(kind==='upcoming'&&meta.discoveryOnly&&!/(pre sale|presale|pre order|preorder|coming soon|rumor|rumour|leak|prototype|sample|production|first batch|waitlist|release soon|vorbestellung|precommande|preordine|preventa|precomanda|styled rta|clone rta)/.test(norm(base)))return null;
  return{kind,category:cls.category,typology:cls.typology,sourceType:meta.type,sourceBucket:meta.bucket,sourceHost:host(resolved),decisionEligible:meta.eligible,discoveryOnly:meta.discoveryOnly,url:resolved,title:clean(doc.title).slice(0,240),publishedAt:pub,ageHours:Number(ah.toFixed(1)),dateQuality:pageDate?'source-page':'search-index',fetchVerified:fetchOk,maturityStage:mat.stage,maturityLabel:mat.label,maturityScore:mat.score,tokens:tokens(text)};
}

function memoryKey(s){return hash(`${s.kind}|${s.category}|${s.typology}|${canonicalUrl(s.url)}|${norm(s.title).slice(0,100)}`)}
function hydrateMemory(raw,kind,now){
  return(raw||[]).filter(x=>x&&x.kind===kind&&sameDayWindow(x.publishedAt,720)).map(x=>({...x,ageHours:Number(ageHours(x.publishedAt).toFixed(1)),tokens:Array.isArray(x.tokens)?x.tokens:tokens(x.title||''),firstSeenAt:x.firstSeenAt||now,lastSeenAt:x.lastSeenAt||x.firstSeenAt||now}));
}
function mergeMemory(previous,current,kind,now){
  const map=new Map();
  for(const x of hydrateMemory(previous,kind,now))map.set(x.signalKey||memoryKey(x),x);
  for(const s of current.filter(x=>x.kind===kind)){
    const key=memoryKey(s),old=map.get(key);
    map.set(key,{...s,signalKey:key,firstSeenAt:old&&old.firstSeenAt||now,lastSeenAt:now});
  }
  return[...map.values()].filter(x=>sameDayWindow(x.publishedAt,720)).sort((a,b)=>Number(a.ageHours)-Number(b.ageHours));
}
function clusters(signals){
  const out=[];
  for(const s of signals){
    let c=out.find(x=>x.category===s.category&&x.typology===s.typology&&similarity(x.tokens,s.tokens)>=.35);
    if(!c){c={id:hash(s.kind+'|'+s.category+'|'+s.typology+'|'+s.tokens.slice(0,8).sort().join('|')),category:s.category,typology:s.typology,tokens:s.tokens.slice(),signals:[]};out.push(c)}
    c.signals.push(s);c.tokens=unique(c.tokens.concat(s.tokens||[])).slice(0,36);
  }
  return out;
}
function rank(code){return{STOP_REVIEW:7,BUY_HYPE:6,BUY_TREND:5,PREPARE_ACCESSORIES:4,PREPARE:3,WATCH:2}[code]||0}
function wideEvent(c){
  const eligible=c.signals.filter(x=>x.decisionEligible),discovery=c.signals.filter(x=>x.discoveryOnly),types=unique(eligible.map(x=>x.sourceType)),buckets=unique(eligible.map(x=>x.sourceBucket)),newest=Math.min(...c.signals.map(x=>x.ageHours)),best=c.signals.slice().sort((a,b)=>b.maturityScore-a.maturityScore||a.ageHours-b.ageHours)[0],fresh14=newest<14*24,multi=types.length>=2;
  let code='WATCH',label='ZVON · URMĂREȘTE',reason='Semnal timpuriu detectat în fereastra globală de 30 de zile; încă nu are confirmarea necesară pentru o comandă.';
  if(fresh14&&multi){code='PREPARE';label='PREGĂTEȘTE / URMĂREȘTE';reason='Semnal sub 14 zile confirmat de minimum două tipuri de surse eligibile. Pregătește scenariul, dar nu cumpăra fără pragul complet de Hype.'}
  else if(fresh14&&eligible.length){label='ATENȚIE · URMĂREȘTE';reason='Semnal proaspăt sub 14 zile, dar confirmarea independentă este încă insuficientă.'}
  else if(discovery.length&&!eligible.length){label='ZVON · DISCOVERY';reason='Semnal găsit numai în surse de discovery/comerciale sau open-web. Este avertizare timpurie, nu dovadă pentru cumpărare.'}
  else if(newest>=14*24){label='CONTEXT 30 ZILE';reason='Semnalul este mai vechi de 14 zile, dar rămâne relevant în radarul global de 30 zile. Nu poate genera CUMPĂRĂ ÎN HYPE.'}
  const confidence=Math.max(10,Math.min(82,18+eligible.length*8+types.length*10+Math.min(12,discovery.length*3)+Math.round(best.maturityScore*.2)-(newest>=14*24?12:0)));
  return{kind:'wide',eventId:c.id,category:c.category,typology:c.typology,mentions30d:c.signals.length,mentions72h:c.signals.filter(x=>x.ageHours<=72).length,sourceTypeCount:types.length,sourceFamilyCount:buckets.length,discoverySourceCount:discovery.length,newestSignalHours:Number(newest.toFixed(1)),maturityStage:best.maturityStage,maturityLabel:best.maturityLabel,maturityScore:best.maturityScore,confidence,decision:{code,label,reason}};
}
function mergeEvents(radar,wide){
  radar.categories=radar.categories||{};
  for(const cat of ['RTA','MODURI','ACCESORII']){
    radar.categories[cat]=Array.isArray(radar.categories[cat])?radar.categories[cat]:[];
    for(const w of wide.filter(x=>x.category===cat)){
      const same=radar.categories[cat].filter(x=>x.typology===w.typology).sort((a,b)=>rank(b.decision&&b.decision.code)-rank(a.decision&&a.decision.code)||Number(b.confidence||0)-Number(a.confidence||0))[0];
      if(same){
        same.mentions30d=Math.max(Number(same.mentions30d||same.mentions72h||0),Number(w.mentions30d||0));
        same.discoverySourceCount=Math.max(Number(same.discoverySourceCount||0),Number(w.discoverySourceCount||0));
        same.maturityStage=w.maturityScore>Number(same.maturityScore||0)?w.maturityStage:(same.maturityStage||w.maturityStage);
        same.maturityLabel=w.maturityScore>Number(same.maturityScore||0)?w.maturityLabel:(same.maturityLabel||w.maturityLabel);
        same.maturityScore=Math.max(Number(same.maturityScore||0),Number(w.maturityScore||0));
        if(rank(w.decision.code)>rank(same.decision&&same.decision.code))same.decision=w.decision;
      }else radar.categories[cat].push(w);
    }
    radar.categories[cat].sort((a,b)=>rank(b.decision&&b.decision.code)-rank(a.decision&&a.decision.code)||Number(b.confidence||0)-Number(a.confidence||0));
  }
}
function summary(rows){return{signals:rows.reduce((s,x)=>s+Number(x.mentions30d||x.mentions72h||x.mentions7d||0),0),events:rows.length,buyHype:rows.filter(x=>x.decision&&x.decision.code==='BUY_HYPE').length,buyTrend:rows.filter(x=>x.decision&&x.decision.code==='BUY_TREND').length,prepareAccessories:rows.filter(x=>x.decision&&x.decision.code==='PREPARE_ACCESSORIES').length,prepare:rows.filter(x=>x.decision&&x.decision.code==='PREPARE').length,watch:rows.filter(x=>x.decision&&x.decision.code==='WATCH').length,stop:rows.filter(x=>x.decision&&x.decision.code==='STOP_REVIEW').length}}
function evidenceEvent(c,kind){return{eventId:c.id,kind,category:c.category,typology:c.typology,stages:unique(c.signals.map(x=>x.maturityLabel)),sourceTypeCount:unique(c.signals.filter(x=>x.decisionEligible).map(x=>x.sourceType)).length,sourceHostCount:unique(c.signals.map(x=>x.sourceHost)).length,wideDiscovery:true,sources:c.signals.slice().sort((a,b)=>a.ageHours-b.ageHours).slice(0,100).map(x=>({sourceType:x.sourceType,host:x.sourceHost,url:x.url,title:x.title,publishedAt:x.publishedAt,ageHours:x.ageHours,stage:x.maturityLabel,maturityScore:x.maturityScore,decisionEligible:x.decisionEligible,discoveryOnly:x.discoveryOnly,firstSeenAt:x.firstSeenAt,lastSeenAt:x.lastSeenAt}))}}
function heartbeatReleased(releaseSignals,now){
  const byTypology=new Map();
  for(const s of releaseSignals){const k=s.category+'|'+s.typology;if(!byTypology.has(k))byTypology.set(k,[]);byTypology.get(k).push(s)}
  const rows=[];
  for(const [key,items] of byTypology){
    items.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
    const newest=items[0],eligible=unique(items.filter(x=>x.decisionEligible).map(x=>x.sourceType)),types=unique(items.map(x=>x.sourceType)),firstSeenAt=items.map(x=>x.firstSeenAt).filter(Boolean).sort()[0]||now,delay=diffHours(firstSeenAt,newest.publishedAt);
    rows.push({eventId:hash('heartbeat|'+key),category:newest.category,typology:newest.typology,maturityStage:'RELEASED',maturityLabel:'lansat',maturityScore:100,publishedAt:newest.publishedAt,firstSeenAt,ageHours:Number(ageHours(newest.publishedAt).toFixed(1)),detectedDelayHours:Number.isFinite(delay)?Number(delay.toFixed(1)):null,sourceCount:types.length,eligibleSourceCount:eligible.length,discoveryOnly:eligible.length===0,status:eligible.length>=2?'CONFIRMED':eligible.length===1?'EARLY':'DISCOVERY'});
  }
  return rows.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).slice(0,40);
}

async function main(){
  const cfg=read(CFG,{}),radar=read(RADAR,{categories:{RTA:[],MODURI:[],ACCESORII:[]}}),evid=read(EVID,{events:[],scan:{}}),memory=read(HEART_EVID,{upcomingEvents:[],events:[]});
  const search=await mapLimit(plans(cfg),9,bing),raw=search.flatMap(x=>x.docs||[]),seen=new Set(),docs=[];
  for(const d of raw){const k=d.url||hash((d.title||'')+' '+(d.body||''));if(!k||seen.has(k))continue;seen.add(k);docs.push(d)}
  const current=(await mapLimit(docs.slice(0,1800),14,d=>enrich(d,cfg))).filter(Boolean),now=new Date().toISOString();
  const upcomingMemory=mergeMemory(memory.upcomingEvents||[],current,'upcoming',now),releaseMemory=mergeMemory(memory.events||[],current,'released',now);
  const upcomingClusters=clusters(upcomingMemory),releaseClusters=clusters(releaseMemory),wide=upcomingClusters.map(wideEvent);
  mergeEvents(radar,wide);
  const releasedRows=heartbeatReleased(releaseMemory,now);

  radar.schemaVersion=Math.max(4,Number(radar.schemaVersion||0));
  radar.lookbackHours=720;radar.hypeWindowDays=30;radar.generatedAt=now;
  radar.methodology=radar.methodology||{};radar.methodology.scope='GLOBAL RTA + clone RTA';radar.methodology.wideDiscovery='30-day global public/indexable discovery across original manufacturers, original sellers, clone makers, clone sellers, social, communities, forums, news, creators and open web. Commercial discovery never validates BUY_HYPE.';radar.methodology.memory='A relevant rumor remains in the Hype memory for up to 30 days even when the search index does not return it again on the next daily run.';
  radar.truth=radar.truth||{};radar.truth.retailSourcesUsed=false;radar.truth.discoveryCommercialSourcesUsed=true;radar.truth.discoveryCommercialSourcesCanEscalate=false;radar.truth.wideDiscoveryWindowDays=30;radar.truth.globalScope=true;
  radar.sourceStatus=radar.sourceStatus||{};Object.assign(radar.sourceStatus,{wideQueriesRun:search.length,wideQueriesWorking:search.filter(x=>x.ok).length,wideCandidateDocuments:docs.length,wideSignalsAccepted:current.length,wideUpcomingSignals:current.filter(x=>x.kind==='upcoming').length,wideReleasedSignals:current.filter(x=>x.kind==='released').length,wideRememberedUpcomingSignals:upcomingMemory.length,wideRememberedReleasedSignals:releaseMemory.length,wideDiscoveryOnlySignals:current.filter(x=>x.discoveryOnly).length,wideDecisionEligibleSignals:current.filter(x=>x.decisionEligible).length,wideCloneSignals:current.filter(x=>/(sxk|ulton|yftk|yfty|sjmy|kindbright|shenray|coppervape|vazzling|vapeasy|tobeco|wejoytech|jftk|liefeng)/i.test(x.title||'')).length,wideScan:true,scope:'GLOBAL'});
  radar.summary={RTA:summary(radar.categories.RTA||[]),MODURI:summary(radar.categories.MODURI||[]),ACCESORII:summary(radar.categories.ACCESORII||[])};

  const wideEvidence=upcomingClusters.map(c=>evidenceEvent(c,'upcoming')).concat(releaseClusters.map(c=>evidenceEvent(c,'released')));
  evid.events=(evid.events||[]).filter(x=>!x.wideDiscovery).concat(wideEvidence);evid.generatedAt=now;evid.truth=evid.truth||{};evid.truth.wideDiscoveryStrictValidated=true;evid.truth.commercialDiscoveryDoesNotEscalate=true;evid.truth.publicHypeRemainsTypologyOnly=true;evid.truth.globalScope=true;evid.scan=evid.scan||{};Object.assign(evid.scan,{wideQueriesRun:search.length,wideQueriesWorking:search.filter(x=>x.ok).length,wideSignals:current.length,wideEvidenceEvents:wideEvidence.length,scope:'GLOBAL'});

  const heart={schemaVersion:2,scopeYear:2026,mode:'after-first-heart-beat',refreshTarget:'06:00 Europe/Bucharest',lookbackHours:720,windowDays:30,generatedAt:now,scope:'GLOBAL RTA + clone RTA',publicTypologiesOnly:true,releasedLast30Days:releasedRows,summary:{releasedLast30Days:releasedRows.length,queriesRun:search.length,queriesWorking:search.filter(x=>x.ok).length,rememberedReleaseSignals:releaseMemory.length}};
  const heartEvid={schemaVersion:2,scopeYear:2026,mode:'after-first-heart-beat-evidence',refreshTarget:'06:00 Europe/Bucharest',windowDays:30,generatedAt:now,scope:'GLOBAL RTA + clone RTA',queriesRun:search.length,queriesWorking:search.filter(x=>x.ok).length,upcomingEvents:upcomingMemory,events:releaseMemory};

  if(WRITE){write(RADAR,radar);write(EVID,evid);write(HEART,heart);write(HEART_EVID,heartEvid);console.log(`Hype global 30d: ${search.filter(x=>x.ok).length}/${search.length} queries; current ${current.length}; remembered upcoming ${upcomingMemory.length}; remembered releases ${releaseMemory.length}; heartbeat ${releasedRows.length}.`)}
  else console.log(JSON.stringify({queries:search.length,working:search.filter(x=>x.ok).length,current:current.length,rememberedUpcoming:upcomingMemory.length,rememberedReleased:releaseMemory.length,heartbeat:releasedRows.length},null,2));
}
main().catch(e=>{console.error(e&&e.stack||e);process.exitCode=1});
