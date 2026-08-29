#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const CONFIG='data/market-hype-sources-2026.json';
const OUT='data/market-hype-72h.json';
const HISTORY='data/market-hype-history-2026';
const WRITE=process.argv.includes('--write');
const EVIDENCE_ARG=process.argv.find(x=>x.startsWith('--evidence='));
const EVIDENCE=EVIDENCE_ARG?EVIDENCE_ARG.slice('--evidence='.length):'hype-radar-evidence.json';
const NOW=Date.now();
const HOUR=3600000;
const DAY=24*HOUR;

function read(p,fallback){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(_){return fallback}}
function write(p,v){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n','utf8')}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function clean(v){return String(v||'').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim()}
function hash(v){return crypto.createHash('sha256').update(String(v||'')).digest('hex').slice(0,20)}
function safeUrl(v){try{const u=new URL(String(v||''));return /^https?:$/.test(u.protocol)?u:null}catch(_){return null}}
function host(v){const u=safeUrl(v);return u?u.hostname.toLowerCase():''}
function uniq(a){return Array.from(new Set((a||[]).filter(Boolean)))}
function countTerms(text,terms){const n=norm(text);return (terms||[]).reduce((s,t)=>{const q=norm(t);if(!q)return s;let i=0,c=0;while((i=n.indexOf(q,i))>=0){c++;i+=Math.max(1,q.length)}return s+c},0)}
function hasTerm(text,terms){const n=norm(text);return (terms||[]).some(t=>n.includes(norm(t)))}
function median(a){const x=(a||[]).filter(Number.isFinite).sort((p,q)=>p-q);if(!x.length)return null;const m=Math.floor(x.length/2);return x.length%2?x[m]:(x[m-1]+x[m])/2}
function hoursAgo(ms){return Number.isFinite(ms)?Math.max(0,(NOW-ms)/HOUR):null}
function parseDate(v){const x=Date.parse(String(v||''));return Number.isFinite(x)?x:null}
function decodeDuck(url){try{const u=new URL(url);if(u.hostname.includes('duckduckgo.com')&&u.searchParams.get('uddg'))return decodeURIComponent(u.searchParams.get('uddg'));return url}catch(_){return url}}

async function fetchText(url,timeout=10000){
  const c=new AbortController(),tm=setTimeout(()=>c.abort(),timeout);
  try{
    const r=await fetch(url,{headers:{'user-agent':'Ghid-RTA-Hype-Radar/1.0 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml,application/rss+xml,application/xml;q=0.9,*/*;q=0.6','accept-language':'en,ro;q=0.8'},redirect:'follow',signal:c.signal});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return {url:r.url||url,text:await r.text(),type:r.headers.get('content-type')||''};
  }finally{clearTimeout(tm)}
}
async function pool(items,limit,fn){let i=0;const out=new Array(items.length);async function worker(){while(i<items.length){const n=i++;try{out[n]=await fn(items[n],n)}catch(e){out[n]={error:String(e&&e.message||e)}}}}await Promise.all(Array.from({length:Math.min(limit,items.length||1)},worker));return out}

function parseRss(xml){
  const rows=[];
  for(const m of String(xml||'').matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)){
    const b=m[1];
    const pick=tag=>{const x=b.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`,'i'));return x?clean(x[1]):''};
    rows.push({title:pick('title'),url:pick('link'),published:pick('pubDate')||pick('dc:date')||pick('date'),snippet:pick('description')});
  }
  return rows;
}
function parseDuckHtml(html){
  const rows=[];
  for(const m of String(html||'').matchAll(/<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi))rows.push({title:clean(m[2]),url:decodeDuck(m[1]),published:'',snippet:''});
  return rows;
}
function pagePublished(html){
  const s=String(html||'');
  const pats=[
    /property=["']article:published_time["'][^>]+content=["']([^"']+)/i,
    /name=["']date["'][^>]+content=["']([^"']+)/i,
    /itemprop=["']datePublished["'][^>]+content=["']([^"']+)/i,
    /"datePublished"\s*:\s*"([^"]+)"/i,
    /<time\b[^>]*datetime=["']([^"']+)/i
  ];
  for(const p of pats){const m=s.match(p);if(m&&parseDate(m[1]))return parseDate(m[1])}
  return null;
}
function commercePage(html,cfg){const text=String(html||'');if(hasTerm(text,cfg.commerceRejectTerms))return true;return (cfg.commerceRejectPatterns||[]).some(p=>{try{return new RegExp(p,'i').test(clean(text).slice(0,250000))}catch(_){return false}})}

function makerForCandidate(c,cfg){
  if(c.maker)return c.maker;
  const h=host(c.url),txt=norm(`${c.title} ${c.snippet}`);
  for(const m of cfg.manufacturerTargets||[]){if(m.domain&&(h===m.domain||h.endsWith('.'+m.domain)))return m.name;if(txt.includes(norm(m.name)))return m.name}
  return ''
}
function sourceType(c,cfg){
  const h=host(c.url),maker=makerForCandidate(c,cfg);
  for(const m of cfg.manufacturerTargets||[])if(m.domain&&(h===m.domain||h.endsWith('.'+m.domain)))return 'official-web';
  if((cfg.communityHosts||[]).includes(h))return 'community';
  if((cfg.independentNewsHosts||[]).includes(h))return 'independent-news';
  if((cfg.socialHosts||[]).includes(h)&&maker)return h.includes('youtube')?'creator-or-official-video':'official-social-indexed';
  return ''
}
function classify(text){
  const n=norm(text);
  if(/\b(rta|atomizer|atomiser|rebuildable tank)\b/.test(n)){
    if(n.includes('mtl')&&(/top air|top airflow/.test(n)))return {category:'RTA',typology:'MTL top airflow'};
    if(n.includes('mtl'))return {category:'RTA',typology:'MTL single'};
    if(n.includes('rdl')||n.includes('restricted direct'))return {category:'RTA',typology:'RDL single'};
    if((n.includes('dual coil')||n.includes('dual-coil'))&&(/\bdl\b|direct lung/.test(n)))return {category:'RTA',typology:'DL dual'};
    if(/\bdl\b|direct lung/.test(n))return {category:'RTA',typology:'DL single'};
    return {category:'RTA',typology:'RTA nou'};
  }
  if(/\b(mod|box mod|sbs|side by side|squonk)\b/.test(n)){
    if(n.includes('side by side')||/\bsbs\b/.test(n))return {category:'MODURI',typology:'side by side'};
    if(n.includes('squonk'))return {category:'MODURI',typology:'squonk'};
    if(/dual battery|dual 18650|dual 21700|2x18650|2x21700/.test(n))return {category:'MODURI',typology:'dual battery'};
    return {category:'MODURI',typology:'single battery'};
  }
  if(/\b(wire|coil wire|kanthal|ni80|nife|ss316|cotton|wick|glass|drip tip|tool|accessor)\b/.test(n)){
    if(/cotton|wick/.test(n))return {category:'ACCESORII',typology:'bumbac'};
    if(/glass|tank glass/.test(n))return {category:'ACCESORII',typology:'sticla'};
    if(/drip tip|driptip/.test(n))return {category:'ACCESORII',typology:'drip tip'};
    if(/tool|jig|tweezer|plier|screwdriver/.test(n))return {category:'ACCESORII',typology:'tool-uri'};
    return {category:'ACCESORII',typology:'sarma'};
  }
  return null;
}
function coreTokens(text,maker){
  const stops=new Set(['teaser','sneak','peek','coming','soon','prototype','final','first','batch','sample','sent','announcement','new','rta','mtl','rdl','dl','mod','mods','vape','vaping','accessory','accessories','official','release','reveal','review']);
  norm(text).split(' ').forEach(()=>{});
  const makerTokens=new Set(norm(maker).split(' '));
  return uniq(norm(text).split(' ').filter(x=>x.length>2&&!stops.has(x)&&!makerTokens.has(x))).slice(0,6).sort();
}
function eventId(e){return hash(`${norm(e.maker)||coreTokens(e.title,e.maker).join('-')}|${e.category}|${e.typology}`)}

function buildQueries(cfg){
  const pre='teaser OR "sneak peek" OR "coming soon" OR prototype OR "first batch" OR "sample sent"';
  const product='RTA OR MTL OR RDL OR "vape mod" OR SBS OR squonk OR accessory';
  const q=[];
  for(const m of cfg.manufacturerTargets||[])q.push({kind:'preannounce',maker:m.name,query:`"${m.name}" (${pre}) (${product})`,endpoints:['bing-rss']});
  for(const x of cfg.publicCommunityQueries||[])q.push({kind:'preannounce',maker:'',query:x,endpoints:['bing-rss','google-news-rss','duckduckgo-html']});
  q.push({kind:'trend',maker:'',query:'site:reddit.com/r/electronic_cigarette ("which rta" OR "first rta" OR "which mod" OR "what wire")',endpoints:['bing-rss']});
  q.push({kind:'trend',maker:'',query:'site:e-cigarette-forum.com ("which rta" OR "first rta" OR "which mod" OR "what wire")',endpoints:['bing-rss']});
  q.push({kind:'trend',maker:'',query:'site:forum.planetofthevapes.co.uk ("which rta" OR "first rta" OR "which mod" OR "what wire")',endpoints:['bing-rss']});
  return q;
}
async function discover(cfg){
  const endpointMap=Object.fromEntries((cfg.discoveryEndpoints||[]).map(x=>[x.id,x]));
  const jobs=[];
  for(const q of buildQueries(cfg))for(const eid of q.endpoints){const e=endpointMap[eid];if(e)jobs.push({q,e})}
  const results=await pool(jobs,8,async job=>{
    const url=job.e.template.replace('{query}',encodeURIComponent(job.q.query));
    const f=await fetchText(url,12000);
    const rows=job.e.id==='duckduckgo-html'?parseDuckHtml(f.text):parseRss(f.text);
    return rows.slice(0,12).map(r=>({...r,maker:job.q.maker,kind:job.q.kind,discoveredBy:job.e.id,query:job.q.query}));
  });
  return results.flatMap(x=>Array.isArray(x)?x:[]);
}

async function redditApproved(cfg){
  if(String(process.env.REDDIT_DATA_API_APPROVED||'').toLowerCase()!=='true'||!process.env.REDDIT_CLIENT_ID||!process.env.REDDIT_CLIENT_SECRET)return [];
  try{
    const auth=Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64');
    const tokenRes=await fetch('https://www.reddit.com/api/v1/access_token',{method:'POST',headers:{authorization:`Basic ${auth}`,'content-type':'application/x-www-form-urlencoded','user-agent':'ghid-rta-hype-radar/1.0'},body:'grant_type=client_credentials'});
    if(!tokenRes.ok)return[];const token=(await tokenRes.json()).access_token;if(!token)return[];
    const queries=['teaser OR prototype OR "coming soon" RTA','teaser OR prototype OR "coming soon" mod','"which rta" OR "first rta" OR "which mod" OR "what wire"'];
    const out=[];
    for(const q of queries){
      const u='https://oauth.reddit.com/r/electronic_cigarette/search?restrict_sr=1&sort=new&t=week&limit=100&q='+encodeURIComponent(q);
      const r=await fetch(u,{headers:{authorization:`Bearer ${token}`,'user-agent':'ghid-rta-hype-radar/1.0'}});if(!r.ok)continue;
      const d=await r.json();for(const x of (((d||{}).data||{}).children||[]).map(y=>y.data).filter(Boolean))out.push({title:x.title||'',url:'https://www.reddit.com'+(x.permalink||''),published:new Date(Number(x.created_utc||0)*1000).toISOString(),snippet:x.selftext||'',maker:'',kind:hasTerm(`${x.title} ${x.selftext}`,cfg.preannounceTerms)?'preannounce':'trend',discoveredBy:'reddit-api',redditAuthor:x.author||'',redditComments:Number(x.num_comments||0)})
    }
    return out;
  }catch(_){return[]}
}

async function inspectCandidate(c,cfg){
  const u=safeUrl(c.url);if(!u)return null;
  c.url=u.toString();
  const type=sourceType(c,cfg);if(!type)return null;
  let html='',finalUrl=c.url,pageDate=null,error='';
  try{const f=await fetchText(c.url,10000);html=f.text;finalUrl=f.url;pageDate=pagePublished(html)}catch(e){error=String(e&&e.message||e)}
  const combined=`${c.title||''} ${c.snippet||''} ${clean(html).slice(0,220000)}`;
  if(html&&commercePage(html,cfg))return {rejected:true,reason:'commerce-page',url:finalUrl,sourceType:type};
  const pre=hasTerm(combined,cfg.preannounceTerms),trend=hasTerm(combined,cfg.beginnerQuestionTerms);
  if(c.kind==='preannounce'&&!pre)return null;if(c.kind==='trend'&&!trend)return null;
  const cls=classify(combined);if(!cls)return null;
  const publishedMs=pageDate||parseDate(c.published),ageHours=hoursAgo(publishedMs);
  const maxHours=c.kind==='trend'?7*24:Number(cfg.windowHours||72);
  if(ageHours==null||ageHours>maxHours)return null;
  const maker=makerForCandidate(c,cfg);
  const engagement=countTerms(combined,cfg.engagementTerms)+Number(c.redditComments||0);
  const complaints=countTerms(combined,cfg.complaintTerms);
  const stop=countTerms(combined,cfg.stopTerms);
  return {
    rejected:false,
    url:finalUrl,
    urlHash:hash(finalUrl),
    host:host(finalUrl),
    title:c.title||'',
    maker,
    sourceType:type,
    sourceDiscovery:c.discoveredBy,
    kind:c.kind,
    publishedAt:new Date(publishedMs).toISOString(),
    ageHours:Number(ageHours.toFixed(1)),
    timestampConfidence:pageDate?'page':'feed',
    category:cls.category,
    typology:cls.typology,
    engagement,
    complaints,
    stop,
    author:c.redditAuthor||'',
    textSample:clean(combined).slice(0,1200),
    fetchError:error
  };
}

function historyRows(){
  if(!fs.existsSync(HISTORY))return[];
  return fs.readdirSync(HISTORY).filter(x=>x.endsWith('.json')).sort().slice(-36).map(x=>read(path.join(HISTORY,x),null)).filter(Boolean);
}
function baselineFor(id,history,field,days){
  const cutoff=NOW-days*DAY,vals=[];
  for(const h of history){const ts=parseDate(h.generatedAt);if(!ts||ts<cutoff)continue;const e=(h.events||[]).find(x=>x.eventId===id);if(e&&Number.isFinite(Number(e[field])))vals.push(Number(e[field]))}
  return vals;
}
function strengthScore(group){
  const types=uniq(group.map(x=>x.sourceType)).length;
  const ev=group.reduce((s,x)=>s+Number(x.engagement||0),0);
  const age=Math.min(...group.map(x=>Number(x.ageHours||9999)));
  return Math.max(0,Math.min(100,Math.round(types*19+Math.min(28,group.length*8)+Math.min(22,Math.log2(ev+1)*7)+Math.max(0,18-age/4))))
}
function buildDecisions(evidence,cfg,history){
  const pre=evidence.filter(x=>x.kind==='preannounce');
  const trend=evidence.filter(x=>x.kind==='trend');
  const groups=new Map();
  for(const e of pre){e.eventId=eventId(e);if(!groups.has(e.eventId))groups.set(e.eventId,[]);groups.get(e.eventId).push(e)}
  const decisions=[];
  for(const [id,g] of groups){
    const sourceTypes=uniq(g.map(x=>x.sourceType));
    const engagement=g.reduce((s,x)=>s+Number(x.engagement||0),0);
    const baseline=median(baselineFor(id,history,'engagement',7));
    const velocity=baseline==null?null:Number((engagement/Math.max(1,baseline)).toFixed(2));
    const mentions=g.length,peaks=baselineFor(id,history,'mentions',21),peak=peaks.length?Math.max(...peaks):null;
    const decline=peak&&peak>0?Number((1-mentions/peak).toFixed(2)):null;
    const complaintTypes=uniq(g.filter(x=>x.complaints>0).map(x=>x.sourceType)).length;
    const stopSignal=g.some(x=>x.stop>0);
    const newest=Math.min(...g.map(x=>x.ageHours));
    let action='URMĂREȘTE',reason='Semnal upstream real, dar condițiile pentru o decizie de stoc nu sunt încă integral confirmate.';
    if((decline!=null&&decline>=0.70&&peak>=5)||stopSignal||complaintTypes>=3){action='OPRIT / LICHIDAT';reason=stopSignal?'A apărut un semnal de succesiune V2/clone/second batch.':complaintTypes>=3?'Aceeași problemă apare în minimum trei tipuri de surse.':'Interesul a scăzut cu cel puțin 70% față de vârful urmărit.'}
    else if(newest<=14*24&&sourceTypes.length>=2&&velocity!=null&&velocity>=3){action='CUMPĂRĂ ÎN HYPE';reason='Pre-anunțul este proaspăt, confirmat în surse diferite, iar intenția a accelerat de cel puțin 3× față de baza ultimelor 7 zile.'}
    decisions.push({eventId:id,category:g[0].category,typology:g[0].typology,action,reason,confidence:Math.min(96,45+sourceTypes.length*13+(velocity!=null?10:0)+(g.every(x=>x.timestampConfidence==='page')?8:0)),strength:strengthScore(g),mentions,sourceTypes:sourceTypes.length,engagement,engagementVelocity:velocity,ageHours:Number(newest.toFixed(1)),complaintSourceTypes:complaintTypes,declineFromPeak:decline});
  }
  const trendByType=new Map();
  for(const e of trend){const key=`${e.category}|${e.typology}`;if(!trendByType.has(key))trendByType.set(key,[]);trendByType.get(key).push(e)}
  for(const [key,g] of trendByType){
    const [category,typology]=key.split('|');
    const threads=uniq(g.map(x=>x.urlHash)).length,authors=uniq(g.map(x=>x.author)).length;
    const recentPre=decisions.some(x=>x.category===category&&x.typology===typology&&x.ageHours<=21*24);
    if(!recentPre&&threads>=3&&authors>=3)decisions.push({eventId:hash('trend|'+key),category,typology,action:'CUMPĂRĂ PE TREND',reason:'Aceeași nevoie de începător apare în cel puțin trei discuții și de la cel puțin trei autori diferiți, fără pre-anunț nou în ultimele 21 de zile.',confidence:78,strength:Math.min(88,50+threads*7),mentions:threads,sourceTypes:uniq(g.map(x=>x.sourceType)).length,engagement:g.reduce((s,x)=>s+Number(x.engagement||0),0),engagementVelocity:null,ageHours:Math.min(...g.map(x=>x.ageHours)),complaintSourceTypes:0,declineFromPeak:null});
  }
  const derived=[];
  for(const d of decisions.filter(x=>x.action==='CUMPĂRĂ ÎN HYPE'&&(x.category==='RTA'||x.category==='MODURI'))){derived.push({eventId:hash('accessory|'+d.eventId),category:'ACCESORII',typology:'compatibilitate noua',action:'PREGĂTEȘTE',reason:'Un pre-anunț puternic pe hardware justifică pregătirea accesoriilor compatibile pentru fereastra estimată de 7–10 zile, fără a cumpăra orb înainte de confirmarea compatibilității.',confidence:Math.max(55,d.confidence-12),strength:Math.max(45,d.strength-10),mentions:d.mentions,sourceTypes:d.sourceTypes,engagement:d.engagement,engagementVelocity:d.engagementVelocity,ageHours:d.ageHours,complaintSourceTypes:0,declineFromPeak:null})}
  return decisions.concat(derived).sort((a,b)=>b.strength-a.strength||b.confidence-a.confidence);
}
function sanitize(decisions,evidence,cfg,coverage){
  const cards=decisions.map(d=>({category:d.category,typology:d.typology,action:d.action,reason:d.reason,confidence:d.confidence,strength:d.strength,mentions:d.mentions,sourceTypes:d.sourceTypes,ageHours:d.ageHours,engagementVelocity:d.engagementVelocity}));
  const categories=['RTA','MODURI','ACCESORII'].map(category=>({category,cards:cards.filter(x=>x.category===category)}));
  return {
    schemaVersion:1,
    scopeYear:2026,
    generatedAt:new Date(NOW).toISOString(),
    freshUntil:new Date(NOW+Number(cfg.cacheFreshHours||24)*HOUR).toISOString(),
    windowHours:Number(cfg.windowHours||72),
    status:'READY',
    truthRule:'Doar semnale upstream cu timp verificabil. Magazinele, prețurile, stocul și linkurile comerciale sunt excluse. Lipsa dovezii produce URMĂREȘTE, nu certitudine inventată.',
    summary:{signals72h:evidence.filter(x=>x.kind==='preannounce').length,trendThreads7d:evidence.filter(x=>x.kind==='trend').length,decisionCards:cards.length,sourceTypes:uniq(evidence.map(x=>x.sourceType)).length,rejectedCommerce:Number(coverage.rejectedCommerce||0),sourcesChecked:Number(coverage.sourcesChecked||0),sourcesAccepted:evidence.length},
    categories,
    sourceCoverage:{officialWeb:evidence.filter(x=>x.sourceType==='official-web').length,officialSocial:evidence.filter(x=>x.sourceType==='official-social-indexed'||x.sourceType==='creator-or-official-video').length,communities:evidence.filter(x=>x.sourceType==='community').length,independentNews:evidence.filter(x=>x.sourceType==='independent-news').length},
    decisionLegend:[
      {code:'CUMPĂRĂ ÎN HYPE',meaning:'Test mic 3–5 bucăți; țintă de rotație 14–21 zile. Apare numai când toate condițiile de hype sunt confirmate.'},
      {code:'CUMPĂRĂ PE TREND',meaning:'Stoc de bază când întrebarea se repetă independent și nu există un pre-anunț nou care să distorsioneze interesul.'},
      {code:'OPRIT / LICHIDAT',meaning:'Reducere sau oprire când se confirmă răcirea puternică, succesiunea de generație ori o problemă repetată în surse diferite.'},
      {code:'URMĂREȘTE',meaning:'Există semnal, dar încă nu există suficiente dovezi pentru o decizie de stoc.'},
      {code:'PREGĂTEȘTE',meaning:'Pregătire pentru accesorii compatibile după un semnal hardware puternic; compatibilitatea trebuie confirmată înainte de cumpărare.'}
    ]
  }
}

async function main(){
  const cfg=read(CONFIG,null);if(!cfg)throw new Error('Missing Hype Radar config');
  const discovered=(await discover(cfg)).concat(await redditApproved(cfg));
  const keyed=new Map();for(const c of discovered){const u=safeUrl(c.url);if(!u)continue;const k=`${u.toString()}|${c.kind}`;if(!keyed.has(k))keyed.set(k,c)}
  const candidates=Array.from(keyed.values()).slice(0,180);
  const inspected=await pool(candidates,10,c=>inspectCandidate(c,cfg));
  const rejected=inspected.filter(x=>x&&x.rejected),evidence=inspected.filter(x=>x&&!x.rejected&&!x.error);
  const history=historyRows();
  const decisions=buildDecisions(evidence,cfg,history);
  const coverage={sourcesChecked:candidates.length,rejectedCommerce:rejected.filter(x=>x.reason==='commerce-page').length,errors:inspected.filter(x=>x&&x.error).length};
  const out=sanitize(decisions,evidence,cfg,coverage);
  const internal={schemaVersion:1,generatedAt:out.generatedAt,windowHours:out.windowHours,coverage,candidates:candidates.length,evidence:evidence.map(x=>({...x,eventId:eventId(x)})),rejected};
  const historySnapshot={schemaVersion:1,generatedAt:out.generatedAt,events:decisions.filter(x=>x.eventId).map(x=>({eventId:x.eventId,category:x.category,typology:x.typology,mentions:Number(x.mentions||0),engagement:Number(x.engagement||0),strength:Number(x.strength||0)}))};
  if(WRITE){
    write(OUT,out);
    const stamp=new Date(NOW).toISOString().replace(/[:.]/g,'-');write(path.join(HISTORY,stamp+'.json'),historySnapshot);
    write(EVIDENCE,internal);
    console.log(`Hype Radar: checked ${coverage.sourcesChecked}; accepted ${evidence.length}; commerce rejected ${coverage.rejectedCommerce}; cards ${out.summary.decisionCards}.`);
  }else console.log(JSON.stringify(out,null,2));
}
main().catch(e=>{console.error(e&&e.stack||e);process.exitCode=1});
