#!/usr/bin/env node
'use strict';

const fs=require('fs');
const {canonicalProductFamily}=require('./market-product-canonical-2026.js');
const {verificationFamilyKey}=require('./market-hype-verification-identity-2026.js');
const {dated,reconcileQueue}=require('./reconcile-market-hype-public-2026.js');

function need(condition,message){if(!condition)throw new Error(message)}
function read(file){return fs.readFileSync(file,'utf8')}

const sxk=canonicalProductFamily({productName:'SXK Ghost Ring Style RDL RTA',brand:'SXK',category:'RTA',sources:[{sourceType:'clone-community-discovery'}]});
const reka=canonicalProductFamily({productName:'RekaVape Ghost Ring Polish Style RTA',brand:'RekaVape',category:'RTA',sources:[{sourceType:'clone-vendor'}]});
const generic=canonicalProductFamily({productName:'Ghost Ring Style RTA clone',brand:'',category:'RTA'});
const authentic=canonicalProductFamily({productName:'Ghost Ring RTA',brand:'Ghost Mods',category:'RTA'});
const flash=canonicalProductFamily({productName:'YFTK Flash e-Vapor V4.5S+ Style RTA',brand:'YFTK',category:'RTA'});

need(sxk.key===reka.key&&sxk.key===generic.key,'Clone makers for the same model family were not grouped');
need(sxk.authenticityState==='CLONE','Clone family was not labelled CLONE');
need(authentic.authenticityState==='AUTHENTIC'&&authentic.key!==sxk.key,'Authentic product was merged with a clone family');
need(flash.key!==sxk.key,'Different clone model families were merged');
need(verificationFamilyKey({productName:'dotMod dotPod Max 60W Pod System',brand:'dotMod',category:'POD'},'POD')===verificationFamilyKey({productName:'Dotmod Dotpod Max - Vaping360',brand:'dotMod',category:'POD'},'POD'),'POD wattage text split one product family');
need(verificationFamilyKey({productName:'OXVA XLIM PRO 3 30W Vape Pod System',brand:'OXVA',category:'POD'},'POD')===verificationFamilyKey({productName:'XLIM PRO 3 Pulse System',brand:'OXVA',category:'POD'},'POD'),'POD specification text split one version');
need(verificationFamilyKey({productName:'dotMod dotPod Pro 35W Pod System',brand:'dotMod',category:'POD'},'POD')!==verificationFamilyKey({productName:'dotMod dotPod Max 60W Pod System',brand:'dotMod',category:'POD'},'POD'),'Distinct POD variants were merged');
need(dated({confidenceTier:'confirmed'})&&dated({confidenceTier:'reported'}),'Verified event tiers are not recognized');
need(!dated({confidenceTier:'public-signal',eventDate:'2026-09-01T08:00:00.000Z'}),'A signal publication date was treated as a launch date');
const undatedQueue=reconcileQueue({generatedAt:'2026-09-04T03:00:00.000Z',products:[],verificationQueue:[{productName:'Arcana New MTL RTA',brand:'Arcana Mods',category:'RTA',reason:'noEventOrDate',url:'https://example.test/arcana'}]},{verificationQueue:[]},'RTA');
need(undatedQueue.length===1&&undatedQueue[0].reason==='undatedPublicAnnouncement'&&undatedQueue[0].firstObservedAt,'An identifiable product without ETA was discarded');
need(Date.parse(undatedQueue[0].lastObservedAt)>=Date.parse(undatedQueue[0].firstObservedAt),'Verification observation range is inverted');
const genericQueue=reconcileQueue({generatedAt:'2026-09-04T03:00:00.000Z',products:[],verificationQueue:[{productName:'Best Ecig Store, Box Mod Manufacturer',brand:'Eleaf',category:'MODURI',reason:'noEventOrDate',url:'https://www.eleafworld.com/'}]},{verificationQueue:[]},'RTA');
need(genericQueue.length===0,'A generic manufacturer page was treated as a product');
const aggregateQueue=reconcileQueue({generatedAt:'2026-09-04T03:00:00.000Z',products:[],verificationQueue:[{productName:'SXK RDA / RTA / RDTA Atomizer, Mod - 3FVape',category:'RTA',reason:'noEventOrDate',url:'https://www.3fvape.com/108-sxk'}]},{verificationQueue:[]},'RTA');
need(aggregateQueue.length===0,'A generic multi-category collection was treated as a concrete product');
const discoveryCandidates=[
  {productName:'Arcana New MTL RTA',brand:'Arcana Mods',category:'RTA',reason:'no-direct-dated-event',url:'https://arcana-mods.com/products/new-mtl-rta',observedAt:'2026-09-04T02:00:00.000Z'},
  {productName:'Eleaf iStick XC100 Vape Mod',brand:'Eleaf',category:'MODURI',reason:'no-direct-dated-event',url:'https://www.eleafworld.com/istick-xc100',observedAt:'2026-09-04T02:00:00.000Z'},
  {productName:'OXVA XLIM PRO 3 30W Vape Pod System',brand:'OXVA',category:'POD',reason:'no-direct-dated-event',url:'https://www.oxva.com/pages/xlim-pro-3',observedAt:'2026-09-04T02:00:00.000Z'},
  {productName:'2026 NeXLIM Labor Day Bundle',brand:'OXVA',category:'POD',reason:'no-direct-dated-event',url:'https://store.oxva.com/products/2026-nexlim-labor-day-bundle',observedAt:'2026-09-04T02:00:00.000Z'},
  {productName:'Spark 2 par Kiwi',brand:'KIWI Vapor',category:'POD',reason:'no-direct-dated-event',url:'https://en.wikipedia.org/wiki/Apache_Spark',observedAt:'2026-09-04T02:00:00.000Z'},
  {productName:'Unnamed future RTA',brand:'Example',category:'RTA',named:false,reason:'no-direct-dated-event',url:'https://example.test/unnamed',observedAt:'2026-09-04T02:00:00.000Z'}
];
const discoveredRta=reconcileQueue({generatedAt:'2026-09-04T03:00:00.000Z',snapshotReferenceAt:'2026-09-04T03:00:00.000Z',products:[],verificationQueue:[]},{verificationQueue:[]},'RTA',discoveryCandidates);
need(discoveredRta.length===2&&discoveredRta.some(candidate=>candidate.category==='RTA')&&discoveredRta.some(candidate=>candidate.category==='MODURI'),'Fresh identifiable RTA/MOD discovery candidates were not preserved');
need(discoveredRta.every(candidate=>candidate.signalKind==='undated-identifiable-product'&&candidate.confidenceTier==='watch'),'Undated discovery candidates were promoted beyond the review queue');
const discoveredPods=reconcileQueue({generatedAt:'2026-09-04T03:00:00.000Z',snapshotReferenceAt:'2026-09-04T03:00:00.000Z',products:[],verificationQueue:[]},{verificationQueue:[]},'POD',discoveryCandidates);
need(discoveredPods.length===1&&/XLIM PRO 3/i.test(discoveredPods[0].productName),'Fresh identifiable POD discovery candidate was not preserved');
need(discoveredPods.every(candidate=>!/(?:Apache Spark|Wikipedia)/i.test(candidate.productName+' '+candidate.url)),'A false Wikipedia product signal entered the POD review queue');

const radar=read('tools/collect-market-hype-radar-2026.js');
const products=read('tools/collect-market-hype-products-2026.js');
const makers=read('tools/collect-market-hype-active-makers-2026.js');
const pods=read('tools/collect-market-hype-pods-2026.js');
const flow=read('.github/workflows/market-hype-2026-sync.yml');
const ui=read('assets/market-hype-ui.js');

need(!radar.includes('return q.slice(0,150)')&&!products.includes('return q.slice(0,150)'),'Order-dependent global query cap still exists');
for(const source of [radar,products,makers,pods])need(source.includes('facebook.com')&&source.includes('instagram.com'),'Public Facebook/Instagram discovery is incomplete');
for(const source of [radar,products,makers,pods])need(source.includes('undatedPublicAnnouncement'),'Undated identifiable candidates are not preserved consistently');
need(flow.includes('node tools/reconcile-market-hype-public-2026.js --write'),'Final public reconciliation is absent from the daily workflow');
need(ui.includes('Alte produse pe radar')&&ui.includes('signals.length+(data.verificationQueue||[]).length'),'Undated candidates are not visible or counted in the clean UI');

console.log('Hype public reconciliation unit gate PASS: clone families grouped; authentic separated; uncapped public discovery; undated candidates retained by category; false sources rejected.');
