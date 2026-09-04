#!/usr/bin/env node
'use strict';

const fs=require('fs');
const {snapshotReferenceMs,windowAgeHours}=require('./hype-window-reference-2026.js');
const {canonicalProductFamily}=require('./market-product-canonical-2026.js');
const {classifyRtaAccessory}=require('./market-hype-accessory-classifier-2026.js');

const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const need=(condition,message)=>{if(!condition)throw new Error(message)};
const radar=json('data/market-hype-radar-2026.json');
const evidence=json('data/market-hype-evidence-2026.json');
const heartbeat=json('data/market-hype-heartbeat-2026.json');
const heartbeatEvidence=json('data/market-hype-heartbeat-evidence-2026.json');
const products=json('data/market-hype-products-2026.json');
const ref=snapshotReferenceMs(),refIso=new Date(ref).toISOString(),windowMs=30*24*60*60*1000;
const strongDates=new Set(['explicit','catalog-published-at','official-product-published-at','release-observed','first-retail-observation']);
const allowedAfterDates=new Set([...strongDates,'dated-public-evidence']);
const banned=/dictionary\.|steampowered\.com|cbsnews\.com|(^|\.)rta\.ae|rtafleet\.com|(^|\.)rta\.com|merriam-webster|riversidetransit|riderta/i;

need([radar,evidence,heartbeat,heartbeatEvidence,products].every(doc=>Number(doc.scopeYear)===2026),'Hype scope must remain 2026');
need(Number(radar.hypeWindowDays)===30&&Number(radar.lookbackHours)===720,'Global Hype 30-day core is invalid');
need(Number(products.schemaVersion)>=28&&products.scope==='GLOBAL RTA + clone RTA'&&Number(products.windowDays)===30&&products.pendingRefresh!==true,'Final RTA/MOD Hype snapshot is invalid');
need(products.snapshotReferenceAt===refIso,`RTA/MOD snapshot reference mismatch: expected ${refIso}`);
need(products.truth&&products.truth.productLevelOnly===true&&products.truth.newArrivalIsNotRelease===true&&products.truth.relistingIsNotRelease===true,'Product-level/relisting contract is missing');
need(products.truth.eventDatesSeparatedFromCoverageDates===true&&products.truth.canonicalCrossSourceDeduplication===true&&products.truth.crossWindowLifecycleDeduplication===true&&products.truth.modelFamilyVariantsGrouped===true&&products.truth.variantEvidencePreserved===true&&products.truth.categoryRevalidatedBeforePublish===true&&products.truth.retailPromotionIsNotRelease===true&&products.truth.confidenceTierNormalizedAtPublish===true,'Final Hype arbitration contract is missing');
need(products.truth.finalPublicProjectionsReconciled===true&&products.truth.undatedSignalsPreservedInVerificationQueue===true,'Final projection/undated-candidate contract is missing');
need(products.scan&&products.scan.directCatalogs&&products.scan.datedNews&&products.scan.retailCampaigns,'Final multi-source Hype collectors did not run');
need((products.products||[]).length>0,'Final RTA/MOD Hype product list is empty');

function dated(row){if(row.confidenceTier)return row.confidenceTier==='confirmed'||row.confidenceTier==='reported';return strongDates.has(row.dateConfidence)}
const identities=new Set();
for(const row of products.products||[]){
  need(row&&row.id&&row.productName&&['RTA','MODURI','ACCESORII'].includes(row.category)&&row.typology&&['before','after'].includes(row.window),`Incomplete Hype row: ${row&&row.productName||'unnamed'}`);
  need(['confirmed','reported','public-signal'].includes(row.confidenceTier),`Invalid confidence tier: ${row.productName}`);
  need(Array.isArray(row.sources)&&row.sources.length>0,`Sources missing: ${row.productName}`);
  for(const source of row.sources)need(!banned.test(String(source.host||source.url||'')),`Generic false positive leaked: ${source.host||source.url}`);
  const identity=canonicalProductFamily(row).key;
  need(!identities.has(identity),`Duplicate product lifecycle: ${row.productName}`);identities.add(identity);
  need(row.familyKey===identity&&['AUTHENTIC','CLONE'].includes(row.authenticityState),`Product family identity missing: ${row.productName}`);
  need(Array.isArray(row.variants)&&row.variants.length===Number(row.variantCount)&&row.variantCount>0,`Variant evidence missing: ${row.productName}`);
  const event=Date.parse(row.eventDate);need(Number.isFinite(event),`Event date missing: ${row.productName}`);
  if(row.window==='before')need(Math.abs(event-ref)<=windowMs,`Before event outside 30 days: ${row.productName}`);
  else need(event<=ref&&ref-event<=windowMs,`After event outside 30 days: ${row.productName}`);
  if(row.category==='RTA')need(/\bRTA\b|rebuildable\s+(?:tank\s+)?atomiz/i.test(row.productName),`Non-RTA product leaked into RTA: ${row.productName}`);
  if(row.category==='ACCESORII')need(classifyRtaAccessory(row.productName),`Non-RTA accessory leaked into accessories: ${row.productName}`);
  if(row.window==='after'&&dated(row))need(allowedAfterDates.has(row.dateConfidence),`Invalid dated after-event confidence: ${row.productName}`);
  if(!dated(row))need(row.confidenceTier==='public-signal'||['dated-public-evidence','dated-retail-campaign','signal-publication'].includes(row.dateConfidence),`Unlabelled public signal: ${row.productName}`);
}
need(Number(products.summary&&products.summary.candidatesUnderVerification)===(products.verificationQueue||[]).length,'RTA/MOD verification-queue summary is inconsistent');
for(const candidate of products.verificationQueue||[]){need(candidate.familyKey&&candidate.productName,'RTA/MOD verification candidate identity is incomplete');need(!identities.has(candidate.familyKey),`Published family leaked into verification queue: ${candidate.productName}`)}

const events=(products.products||[]).filter(dated),signals=(products.products||[]).filter(row=>!dated(row));
need(Number(products.summary.total)===events.length,'RTA/MOD dated-event summary mismatch');
need(Number(products.summary.publicSignals)===signals.length,'RTA/MOD public-signal summary mismatch');
need(Number(products.summary.before)===events.filter(row=>row.window==='before').length,'RTA/MOD before summary mismatch');
need(Number(products.summary.after)===events.filter(row=>row.window==='after').length,'RTA/MOD after summary mismatch');
const prime=(products.products||[]).find(row=>/prime minister/i.test(row.productName));
if(prime)need(!dated(prime)&&prime.signalKind==='dated-retail-promotion','Prime Minister promotion is incorrectly presented as a release');

for(const row of heartbeat.releasedLast30Days||[]){const age=windowAgeHours(row.publishedAt||row.eventDate,ref);if(age!=null)need(age>=0&&age<=720,'Heartbeat contains an event outside the daily 30-day window')}
console.log(`Hype publish gate OK: ${events.length} dated RTA/MOD events; ${signals.length} public signals; ${products.summary.before} before; ${products.summary.after} after; ref ${refIso}.`);
