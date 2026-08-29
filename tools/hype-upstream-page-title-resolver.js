#!/usr/bin/env node
'use strict';

const fs=require('fs');
const WRITE=process.argv.includes('--write');
const FILE='/tmp/market-hype-upstream-evidence-2026.json';
const ELIGIBLE=new Set(['manufacturer-official','manufacturer-social-public','independent-vape-news','creator-prelaunch','vaping-forum-prelaunch','reddit-prelaunch','manufacturer-community']);
const BANNED=/dictionary\.|steampowered\.com|cbsnews\.com|(^|\.)rta\.ae|rtafleet\.com|(^|\.)rta\.com|merriam-webster|riversidetransit|riderta|transitrta|luxury streetwear|fleet software/i;
const GENERIC=/reach your customers|advertis(?:e|ing|ement)|sponsored|promoted|shop all|all products|all items|official store|online store|spark your life|^\s*products?\s*$|^\s*all\s*$|^\s*store\s*$|^\s*home\s*$|\bcatalog(?:ue)?\b|\bcategory\b|\bcollection\b|access denied|captcha|cloudflare|page not found|404|sign in|log in/i;
const NOISE=new Set('review reviews preview first look giveaway win contest authentic buy new latest official vape vaping rta rba rdta atomizer atomiser atomizzatore atomiseur rebuildable tank style styled clone pre order preorder presale pre sale coming soon released launch launched available all product products store shop online homepage home website'.split(/\s+/));

function read(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'))}catch(_){return{events:[]}}}
function write(v){fs.writeFileSync(FILE,JSON.stringify(v,null,2)+'\n','utf8')}
function clean(v){return String(v||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&nbsp;|&#x20;|&#32;/gi,' ').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9+.-]+/g,' ').replace(/\s+/g,' ').trim()}
function host(u){try{return new URL(String(u||'')).hostname.replace(/^www\./,'').toLowerCase()}catch(_){return''}}
function unique(a){return[...new Set((a||[]).filter(Boolean))]}
function decode(v){return clean(String(v||'').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCharCode(parseInt(n,16))))}
function meta(html,key){const esc=key.replace(':','\\:');let m=String(html||'').match(new RegExp(`<meta[^>]+(?:property|name)=["']${esc}["'][^>]+content=["']([^"']+)["']`,'i'));if(!m)m=String(html||'').match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${esc}["']`,'i'));return m?decode(m[1]):''}
function tag(html,name){const m=String(html||'').match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return m?decode(m[1]):''}
function jsonLdNames(html){const out=[];for(const m of String(html||'').matchAll(/"name"\s*:\s*"([^"]{3,180})"/g))out.push(decode(m[1].replace(/\\"/g,'"')));return out}
function anchor(s,cat){if(cat==='RTA')return /\bRTA\b|rebuildable\s+tank\s+atomiz|atomizer|atomiser|atomizzatore|atomiseur|\bMTL\b|\bRDL\b|\bDTL\b/i.test(s);if(cat==='MODURI')return /\bmod\b|squonk|side by side|\bSBS\b|18650|21700|bottom feeder/i.test(s);return /drip tip|glass|pyrex|cotton|wire|kanthal|ni80|ss316|tool|airflow pin|air pin|deck/i.test(s)}
function words(s){return norm(s).split(' ').filter(w=>w.length>2&&!NOISE.has(w)&&!/^\d+(?:\.\d+)?$/.test(w))}
function score(s,cat,old){if(!s||s.length<4||s.length>190||GENERIC.test(s)||BANNED.test(s))return-999;const w=words(s);if(!w.length)return-999;let n=0;if(anchor(s,cat))n+=50;if(/\b(?:v\d+(?:\.\d+)?|mk\s*\d+|mini|pro|plus|solo|dual|max|nano|evo|edition)\b/i.test(s))n+=14;if(/\d/.test(s))n+=7;n+=Math.min(w.length,9)*2;if(s===old)n+=2;if(/\b(review|preview|first look|coming soon|released|launch|new)\b/i.test(s))n+=3;if(/\b(all products|store|homepage|website)\b/i.test(s))n-=35;return n}
async function fetchText(url,timeout=9000){const c=new AbortController(),tm=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Hype-Resolver/1.0 (+https://ghid-rta.ro/)','accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5','accept-language':'en,ro,de,fr,it,es;q=0.7'},signal:c.signal});if(!r.ok)throw new Error(`HTTP ${r.status}`);return{url:r.url||url,text:await r.text()}}finally{clearTimeout(tm)}}
async function mapLimit(items,limit,fn){const out=new Array(items.length);let i=0;async function worker(){for(;;){const n=i++;if(n>=items.length)return;out[n]=await fn(items[n],n)}}await Promise.all(Array.from({length:Math.min(limit,Math.max(1,items.length))},worker));return out}

async function main(){
  const doc=read(),tasks=[];
  for(let ei=0;ei<(doc.events||[]).length;ei++){
    const ev=doc.events[ei];
    for(let si=0;si<(ev.sources||[]).length;si++){
      const s=ev.sources[si],u=String(s&&s.url||'');
      if(!s||s.decisionEligible!==true||!ELIGIBLE.has(s.sourceType)||!/^https?:\/\//i.test(u)||BANNED.test(host(u)+' '+u))continue;
      tasks.push({ei,si,url:u,category:ev.category,old:clean(s.title)});
    }
  }
  const seen=new Map(),uniqueTasks=[];
  for(const t of tasks){const k=t.url+'|'+t.category;if(!seen.has(k)){seen.set(k,t);uniqueTasks.push(t)}}
  let fetched=0,resolved=0,changed=0,rejectedGeneric=0;
  const results=await mapLimit(uniqueTasks.slice(0,240),8,async t=>{
    try{
      const f=await fetchText(t.url);fetched++;
      const html=f.text;
      const candidates=unique([meta(html,'og:title'),meta(html,'twitter:title'),tag(html,'h1'),tag(html,'title'),...jsonLdNames(html).slice(0,8),t.old].map(decode).filter(Boolean));
      const ranked=candidates.map(x=>({x,s:score(x,t.category,t.old)})).filter(x=>x.s>-999).sort((a,b)=>b.s-a.s||a.x.length-b.x.length);
      if(!ranked.length){rejectedGeneric++;return{...t,candidates,best:null,finalUrl:f.url}}
      resolved++;
      return{...t,candidates,best:ranked[0].x,finalUrl:f.url};
    }catch(_){return{...t,candidates:[t.old].filter(Boolean),best:null,finalUrl:t.url}}
  });
  const byKey=new Map(results.map(r=>[r.url+'|'+r.category,r]));
  for(const t of tasks){const r=byKey.get(t.url+'|'+t.category);if(!r)continue;const s=doc.events[t.ei].sources[t.si];s.searchTitle=s.searchTitle||s.title||null;s.pageTitles=r.candidates||[];s.pageTitleResolved=Boolean(r.best);if(r.finalUrl)s.resolvedUrl=r.finalUrl;if(r.best&&r.best!==s.title){s.title=r.best;changed++}}
  doc.scan=doc.scan||{};Object.assign(doc.scan,{pageTitleResolver:true,pageTitleResolverTasks:tasks.length,pageTitleResolverUnique:uniqueTasks.length,pageTitleResolverFetched:fetched,pageTitleResolverResolved:resolved,pageTitleResolverChanged:changed,pageTitleResolverRejectedGeneric:rejectedGeneric});
  doc.truth=doc.truth||{};doc.truth.sourcePageTitlesPreserved=true;doc.truth.genericPageTitlesRejected=true;
  if(WRITE)write(doc);
  console.log(`Hype upstream page-title resolver: tasks ${tasks.length}; unique ${uniqueTasks.length}; fetched ${fetched}; resolved ${resolved}; changed ${changed}; generic/no-title ${rejectedGeneric}.`);
}

if(require.main===module)main().catch(e=>{console.error(e&&e.stack||e);process.exitCode=1});
module.exports={main};
