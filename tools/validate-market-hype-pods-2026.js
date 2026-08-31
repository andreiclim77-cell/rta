#!/usr/bin/env node
'use strict';

const fs=require('fs');
const {classifyPodProduct,registry,norm}=require('./market-pod-classifier-2026.js');
const {canonicalizeProduct}=require('./market-product-canonical-2026.js');

const file='data/market-hype-pods-2026.json';
function need(condition,message){if(!condition)throw new Error(message)}
const data=JSON.parse(fs.readFileSync(file,'utf8')),reg=registry(),reference=Date.parse(data.snapshotReferenceAt),windowMs=30*24*60*60*1000;
need(Number(data.scopeYear)===2026,'POD Hype scope year must be 2026');
need(data.scope==='GLOBAL POD SYSTEMS','POD Hype scope mismatch');
need(Number(data.windowDays)===30,'POD Hype window must be 30 days');
need(Number.isFinite(reference),'POD Hype snapshot reference missing');
need((reg.makers||[]).length>=60,'POD discovery registry is incomplete');
need(data.scan&&Number(data.scan.queriesRun)>0,'POD Hype collector did not run');
need(data.scan&&data.scan.rejections&&Number.isFinite(Number(data.scan.rejections.notConcretePodProduct)),'POD Hype rejection audit missing');
const keys=new Set();
for(const product of data.products||[]){
  need(product.category==='POD',`Non-POD category leaked: ${product.productName}`);
  need(classifyPodProduct(product.productName,product.brand),`Unclassified POD product leaked: ${product.productName}`);
  const event=Date.parse(product.eventDate);
  need(Number.isFinite(event),`POD event date missing: ${product.productName}`);
  if(product.window==='before')need(Math.abs(event-reference)<=windowMs,`POD before event outside 30 days: ${product.productName}`);
  else if(product.window==='after')need(event<=reference&&reference-event<=windowMs,`POD after event outside 30 days: ${product.productName}`);
  else throw new Error(`Invalid POD window: ${product.productName}`);
  const key=product.category+'|'+canonicalizeProduct({product:product.productName,brand:product.brand||''}).key;
  need(!keys.has(key),`Duplicate POD event: ${product.productName}`);keys.add(key);
  need(Array.isArray(product.sources)&&product.sources.length>0,`POD sources missing: ${product.productName}`);
}
const dated=(data.products||[]).filter(product=>product.confidenceTier?product.confidenceTier==='confirmed'||product.confidenceTier==='reported':['explicit','catalog-published-at','official-product-published-at','release-observed','first-retail-observation'].includes(product.dateConfidence));
need(Number(data.summary&&data.summary.total)===dated.length,'POD dated-event summary is inconsistent');
need(Number(data.summary&&data.summary.publicSignals)===(data.products||[]).length-dated.length,'POD public-signal summary is inconsistent');
for(const candidate of data.verificationQueue||[]){const key='POD|'+canonicalizeProduct({product:candidate.productName||candidate.product||'',brand:candidate.brand||''}).key;need(!keys.has(key),`Published POD event also leaked into verification queue: ${candidate.productName}`)}
console.log(`POD Hype gate OK: ${(reg.makers||[]).length} makers; ${data.scan.candidateDocuments} documents; ${data.scan.concreteProducts} concrete; ${(data.products||[]).length} monitored; ${(data.verificationQueue||[]).length} queued.`);
