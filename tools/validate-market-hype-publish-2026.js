#!/usr/bin/env node
'use strict';

const fs=require('fs');
const {snapshotReferenceMs,windowAgeHours}=require('./hype-window-reference-2026.js');
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const need=(ok,msg)=>{if(!ok)throw new Error(msg)};
const d=json('data/market-hype-radar-2026.json');
const e=json('data/market-hype-evidence-2026.json');
const h=json('data/market-hype-heartbeat-2026.json');
const he=json('data/market-hype-heartbeat-evidence-2026.json');
const p=json('data/market-hype-products-2026.json');
const ref=snapshotReferenceMs();
const refIso=new Date(ref).toISOString();
need([d,e,h,he,p].every(x=>Number(x.scopeYear)===2026),'Hype scope must remain 2026');
need(Number(d.schemaVersion)>=4&&Number(d.hypeWindowDays)===30&&Number(d.lookbackHours)===720,'Global Hype 30d core did not run');
need(d.mode==='pre-market-upstream-only'&&d.truth&&d.truth.globalScope===true&&d.truth.productRelevanceValidated===true&&d.truth.upstreamEvidenceMerged===true,'Global/product Hype boundary or upstream merge missing');
need(d.sourceStatus&&d.sourceStatus.deepScan===true&&d.sourceStatus.deepStrictHostValidated===true&&d.sourceStatus.wideScan===true&&d.sourceStatus.scope==='GLOBAL','Deep/global Hype passes incomplete');
need(e.mode==='hype-source-evidence'&&e.truth&&e.truth.productRelevanceValidated===true&&e.truth.upstreamEvidenceMerged===true,'Merged product Hype evidence missing');
need(h.mode==='after-first-heart-beat'&&Number(h.windowDays)===30&&h.scope==='GLOBAL RTA + clone RTA'&&Array.isArray(h.releasedLast30Days),'Heartbeat missing');
need(he.mode==='after-first-heart-beat-evidence'&&Number(he.windowDays)===30&&he.productRelevanceValidated===true,'Heartbeat evidence missing');
need(Number(p.schemaVersion)>=15&&Number(p.windowDays)===30&&p.scope==='GLOBAL RTA + clone RTA'&&p.pendingRefresh!==true&&Array.isArray(p.products),'Upstream-merged Hype snapshot invalid');
need(p.truth&&p.truth.productLevelOnly===true&&p.truth.newArrivalIsNotRelease===true&&p.truth.relistingIsNotRelease===true&&p.truth.vendorProfileScan===true&&p.truth.multiVendor===true&&p.truth.transportRtaRejected===true&&p.truth.concreteProductTitles===true&&p.truth.genericVendorTitlesRejected===true&&p.truth.upstreamEvidenceMerged===true&&p.truth.observedReleaseIsNotClaimedAsExactReleaseDate===true&&p.truth.dailyWindowAnchoredAt0600Bucharest===true&&p.truth.recentReleaseRequiresExplicitWording===true&&p.truth.recentReviewAloneIsNotRelease===true,'Hype truth/relisting/daily-window contract missing');
need(p.snapshotReferenceAt===refIso&&d.snapshotReferenceAt===refIso&&h.snapshotReferenceAt===refIso,`Daily Hype reference mismatch: expected ${refIso}`);
need(p.scan&&Array.isArray(p.scan.profilesV2)&&p.scan.profilesV2.length>=4&&Number(p.scan.productPagesV2)>=1&&Number(p.scan.upstreamEvidenceEvents)>=1&&Number(p.scan.upstreamEventsAccepted)>=1,'Hype did not preserve/merge real upstream global evidence');
need(p.scan.recentReleaseObserver&&Number(p.scan.recentReleaseObserver.profiles)>=4,'Direct recent-release observer did not run');
need(p.products.length>=1,'Hype final product list is empty');
const banned=/dictionary\.|steampowered\.com|cbsnews\.com|(^|\.)rta\.ae|rtafleet\.com|(^|\.)rta\.com|merriam-webster|riversidetransit|riderta|transitrta/i;
const generic=/^(3fvape|2fdeal|shareavape|ecigone|sourcemore)$/i;
const rtaAnchor=/\bRTA\b|rebuildable\s+(?:tank\s+)?atomiz|atomizer|atomiser|atomizzatore|atomiseur/i;
for(const x of p.products){need(x&&x.id&&x.productName&&['RTA','MODURI','ACCESORII'].includes(x.category)&&x.typology&&['before','after'].includes(x.window),'Incomplete product-level Hype row');need(!generic.test(String(x.productName).trim()),'Generic vendor name leaked as product: '+x.productName);for(const s of x.sources||[])need(!banned.test(String(s.host||s.url||'')),'Generic false positive leaked: '+String(s.host||s.url));if(x.category==='RTA')need(rtaAnchor.test(String(x.productName)),'Non-RTA product leaked into RTA: '+x.productName);if(x.window==='after'){need(['explicit','release-observed'].includes(x.dateConfidence),'Invalid after-release confidence: '+x.productName);if(x.dateConfidence==='release-observed')need(Number(x.eligibleSources||0)>=1&&(x.sources||[]).some(s=>s.decisionEligible===true),'Observed release lacks eligible evidence: '+x.productName);const a=windowAgeHours(x.eventDate,ref);need(a!=null&&a>=0&&a<=720,'After-release event outside daily 30-day window: '+x.productName)}}
for(const x of h.releasedLast30Days||[]){need(['explicit','release-observed'].includes(x.dateConfidence),'Heartbeat confidence invalid');if(x.dateConfidence==='release-observed')need(Number(x.eligibleSourceCount||0)>=1,'Heartbeat observed release lacks eligible evidence');const a=windowAgeHours(x.publishedAt||x.eventDate,ref);need(a!=null&&a>=0&&a<=720,'Heartbeat contains event outside daily 30-day window')}
console.log(`Hype publish gate OK: products ${p.products.length}; before ${p.summary.before}; after ${p.summary.after}; upstream ${p.scan.upstreamEventsAccepted}/${p.scan.upstreamEvidenceEvents}; release observer ${p.scan.recentReleaseObserver.eventsAppended} appended; ref ${refIso}.`);
