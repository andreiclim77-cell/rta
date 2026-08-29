#!/usr/bin/env node
'use strict';
const fs=require('fs');
const {snapshotReferenceMs}=require('./hype-window-reference-2026.js');
const WRITE=process.argv.includes('--write');
const P='data/market-hype-products-2026.json',R='data/market-hype-radar-2026.json',E='data/market-hype-evidence-2026.json',H='data/market-hype-heartbeat-2026.json',HE='data/market-hype-heartbeat-evidence-2026.json';
const REF=snapshotReferenceMs(),LIMIT=720*36e5,refIso=new Date(REF).toISOString();
const read=(p,f={})=>{try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(_){return f}};
const save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n','utf8');
const ms=v=>{const x=Date.parse(String(v||''));return Number.isFinite(x)?x:null};
const symmetric=v=>{const x=ms(v);return x!=null&&Math.abs(x-REF)<=LIMIT};
const validProduct=x=>x&&x.eventDate&&symmetric(x.eventDate)&&(x.window!=='after'||ms(x.eventDate)<=REF);
const p=read(P,{products:[]}),beforeCount=(p.products||[]).filter(x=>x.window==='before').length,afterCount=(p.products||[]).filter(x=>x.window==='after').length;
p.products=(p.products||[]).filter(validProduct);
p.summary={...(p.summary||{}),total:p.products.length,before:p.products.filter(x=>x.window==='before').length,after:p.products.filter(x=>x.window==='after').length};
p.truth={...(p.truth||{}),symmetric30DayEventWindow:true,futureEtaMayExceed30Days:false,signalLookback30dEtaHorizon365d:false};
p.windowDays=30;p.snapshotReferenceAt=refIso;p.dailyWindowTimezone='Europe/Bucharest';
const ids=new Set(p.products.map(x=>x.id));
const names=new Set(p.products.map(x=>String(x.productName||'').toLowerCase()));
const r=read(R,{});if(r.categories)for(const k of Object.keys(r.categories))r.categories[k]=(r.categories[k]||[]).filter(x=>ids.has(x.eventId));r.truth={...(r.truth||{}),symmetric30DayEventWindow:true};r.snapshotReferenceAt=refIso;
const e=read(E,{});if(Array.isArray(e.events))e.events=e.events.filter(x=>(x.eventId&&ids.has(x.eventId))||(!x.eventId&&symmetric(x.eventDate||x.publishedAt)));e.truth={...(e.truth||{}),symmetric30DayEventWindow:true};e.snapshotReferenceAt=refIso;
const h=read(H,{});if(Array.isArray(h.releasedLast30Days))h.releasedLast30Days=h.releasedLast30Days.filter(x=>(x.eventId&&ids.has(x.eventId))||symmetric(x.publishedAt||x.eventDate));h.summary={...(h.summary||{}),releasedLast30Days:(h.releasedLast30Days||[]).length};h.windowDays=30;h.snapshotReferenceAt=refIso;h.dailyWindowAnchoredAt0600Bucharest=true;
const he=read(HE,{});if(Array.isArray(he.upcomingEvents))he.upcomingEvents=he.upcomingEvents.filter(x=>symmetric(x.eventDate||x.publishedAt)&&names.has(String(x.productName||'').toLowerCase()));if(Array.isArray(he.events))he.events=he.events.filter(x=>symmetric(x.eventDate||x.publishedAt)&&names.has(String(x.productName||'').toLowerCase()));he.windowDays=30;he.symmetric30DayEventWindow=true;he.snapshotReferenceAt=refIso;
if(WRITE){save(P,p);save(R,r);save(E,e);save(H,h);save(HE,he)}
console.log(`Hype symmetric ±30d: before ${beforeCount}->${p.summary.before}; after ${afterCount}->${p.summary.after}; total ${p.summary.total}; ref ${refIso}.`);
