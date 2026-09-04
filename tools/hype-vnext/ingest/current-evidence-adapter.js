#!/usr/bin/env node
'use strict';

const {canonicalizeProduct}=require('../../market-product-canonical-2026.js');
const {stableId,normalizeText}=require('../lib/ids.js');
const {toIso,latestDate}=require('../lib/date-semantics.js');
const {ENTITY_SCHEMA_VERSION,validateProduct}=require('../lib/schema-contract.js');
const {createEvidenceEnvelope}=require('../lib/evidence-envelope.js');
const {createEventClaim}=require('../lib/event-claim.js');
const {JsonEvidenceStore}=require('../stores/json-evidence-store.js');
const {JsonEventStore}=require('../stores/json-event-store.js');

function authenticityState(row,cloneMakers=[]){
  const text=normalizeText([row.productName,row.brand,(row.sources||[]).map(source=>source.sourceType)].flat().join(' '));
  if(/\bclone\b|\bstyled?\b|clone retailer|clone original vendor/.test(text)||cloneMakers.some(name=>normalizeText(name)===normalizeText(row.brand)))return'CLONE';
  return row.brand?'AUTHENTIC':'UNKNOWN';
}
function productEntity(row,sourceFile,generatedAt,cloneMakers=[]){
  const authenticity=authenticityState(row,cloneMakers),canonical=canonicalizeProduct({product:row.productName||'',brand:row.brand||''});
  const identity=[row.category||'UNKNOWN',canonical.key||row.productName,authenticity,row.segment||''].join('|');
  return validateProduct({
    schemaVersion:ENTITY_SCHEMA_VERSION,entityType:'product',id:stableId('product',identity),brand:canonical.brand||row.brand||null,
    canonicalName:row.productName||null,candidateLabel:row.productName||`Unnamed ${row.brand||'unknown'} ${row.category||'product'} candidate`,
    category:row.category,subcategory:row.segment||row.typology||null,typology:row.typology||null,segment:row.segment||null,
    authenticityState:authenticity,productState:'OBSERVED',firstKnownPublicAt:toIso(row.firstPublicEvidenceAt)||toIso(row.firstSeenAt)||null,
    firstConfirmedAt:row.confidenceTier==='confirmed'?(toIso(row.stageEvidenceAt)||toIso(row.eventDate)):null,officialReleaseAt:null,
    createdAt:toIso(row.firstSeenAt)||generatedAt,updatedAt:toIso(row.lastSeenAt)||generatedAt,
    aliases:Array.from(new Set([row.productName,row.brand&&`${row.brand} ${row.productName}`].filter(Boolean))),
    legacyIdentifiers:[{sourceFile,recordId:row.id||stableId('projection',sourceFile,row.productName,row.eventDate)}],
    evidenceIds:[],claimIds:[]
  });
}
function mergeProduct(target,incoming){
  target.aliases=Array.from(new Set((target.aliases||[]).concat(incoming.aliases||[]))).sort();
  target.legacyIdentifiers=(target.legacyIdentifiers||[]).concat(incoming.legacyIdentifiers||[]).filter((row,index,all)=>all.findIndex(item=>item.sourceFile===row.sourceFile&&item.recordId===row.recordId)===index);
  target.firstKnownPublicAt=[target.firstKnownPublicAt,incoming.firstKnownPublicAt].filter(Boolean).sort()[0]||null;
  target.firstConfirmedAt=[target.firstConfirmedAt,incoming.firstConfirmedAt].filter(Boolean).sort()[0]||null;
  target.updatedAt=latestDate(target.updatedAt,incoming.updatedAt)||target.updatedAt;
  return target;
}
function fallbackSource(row){
  return{host:'legacy-current-hype',url:`urn:hype-current:${row.id||stableId('projection',row.productName,row.eventDate)}`,title:row.productName,sourceType:'legacy-current-projection',collector:'current-evidence-adapter',decisionEligible:false,discoveryOnly:true,eventDate:row.eventDate,dateConfidence:row.dateConfidence,stage:row.stageLabel||row.stage,observedAt:row.firstSeenAt};
}

function adaptDocuments({productsDocument,podsDocument,sourceConfig={},generatedAt,referenceAt}){
  const evidenceStore=new JsonEvidenceStore(),eventStore=new JsonEventStore(),products=new Map(),cloneMakers=sourceConfig.cloneMakers||[],sourceRows=[
    ['data/market-hype-products-2026.json',productsDocument],['data/market-hype-pods-2026.json',podsDocument]
  ];
  for(const [sourceFile,document] of sourceRows){
    for(const row of document.products||[]){
      const entity=productEntity(row,sourceFile,generatedAt,cloneMakers),product=products.has(entity.id)?mergeProduct(products.get(entity.id),entity):entity;
      products.set(product.id,product);
      const sources=(row.sources&&row.sources.length?row.sources:[fallbackSource(row)]);
      for(const source of sources){
        const legacyRecordId=row.id||stableId('projection',sourceFile,row.productName,row.eventDate),scanId=stableId('scan',referenceAt,sourceFile,document.generatedAt||generatedAt);
        const evidence=createEvidenceEnvelope({product,source,sourceFile,legacyRecordId,scanId,retrievedAt:generatedAt});
        evidenceStore.append(evidence);
        const claim=createEventClaim({product,row,source,evidence,referenceAt,createdAt:generatedAt});
        eventStore.appendClaim(claim);
        product.evidenceIds.push(evidence.id);product.claimIds.push(claim.id);
      }
    }
  }
  const productRows=[...products.values()].map(product=>({...product,evidenceIds:Array.from(new Set(product.evidenceIds)).sort(),claimIds:Array.from(new Set(product.claimIds)).sort()})).sort((a,b)=>a.id.localeCompare(b.id));
  return{products:productRows,evidence:evidenceStore.all(),claims:eventStore.all()};
}

function adaptFixtureCase(fixtureCase,referenceAt){
  const row={productName:fixtureCase.product.model,brand:fixtureCase.product.brand,category:fixtureCase.product.category,segment:fixtureCase.product.segment||null,typology:fixtureCase.product.category==='POD'?'pod system':'fixture',firstSeenAt:fixtureCase.observations[0]&&fixtureCase.observations[0].observedAt,lastSeenAt:fixtureCase.observations.at(-1)&&fixtureCase.observations.at(-1).observedAt};
  const generatedAt=latestDate(fixtureCase.observations.map(item=>item.observedAt))||referenceAt,product=productEntity(row,'fixture',generatedAt,[]),evidenceStore=new JsonEvidenceStore(),eventStore=new JsonEventStore();
  product.authenticityState=fixtureCase.product.authenticity||product.authenticityState;
  for(const observation of fixtureCase.observations){
    const source={host:observation.host,url:observation.url,title:fixtureCase.title,sourceType:observation.sourceFamily,decisionEligible:observation.decisionEligible,discoveryOnly:observation.decisionEligible===false,eventDate:observation.claimedEventAt,publishedAt:observation.publishedAt,observedAt:observation.observedAt,dateConfidence:observation.dateSemantic,stage:observation.claimType,claimType:observation.claimType,originId:observation.originId,textFingerprint:observation.textFingerprint};
    const evidence=createEvidenceEnvelope({product,source,sourceFile:'fixture',legacyRecordId:observation.id,scanId:stableId('scan','fixture',fixtureCase.id),retrievedAt:generatedAt});
    evidenceStore.append(evidence);
    const claim=createEventClaim({product,row:{...row,claimType:observation.claimType,eventDate:observation.claimedEventAt},source,evidence,referenceAt,createdAt:generatedAt});
    eventStore.appendClaim(claim);product.evidenceIds.push(evidence.id);product.claimIds.push(claim.id);
  }
  product.evidenceIds=Array.from(new Set(product.evidenceIds)).sort();product.claimIds=Array.from(new Set(product.claimIds)).sort();
  return{product,evidence:evidenceStore.all(),claims:eventStore.all()};
}

module.exports={authenticityState,productEntity,mergeProduct,adaptDocuments,adaptFixtureCase};
