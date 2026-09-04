#!/usr/bin/env node
'use strict';

const {stableId,normalizeText}=require('./ids.js');
const {toIso,dateSemantic,dateConfidenceScore,classifyClocks,expectedInterval}=require('./date-semantics.js');
const {ENTITY_SCHEMA_VERSION,validateClaim}=require('./schema-contract.js');

function eventTypeFor(row={},source={}){
  const explicit=source.claimType||row.claimType;
  if(typeof explicit==='string'&&/^[A-Z][A-Z0-9_]+$/.test(explicit))return explicit;
  const stage=normalizeText([source.stage,row.stage,row.stageLabel,source.evidenceScope].filter(Boolean).join(' '));
  const type=String(source.sourceType||'').toLowerCase();
  if(/prior|archive/.test(type))return'PRIOR_EXISTENCE';
  if(row.stage==='RETAIL_PROMOTION')return'RETAIL_PROMOTION';
  if(row.stage==='FIRST_RETAIL'||row.stage==='FIRST_RETAIL_SIGNAL')return'FIRST_RETAIL_OBSERVATION';
  if(row.stage==='FIRST_PUBLIC')return'REVIEWER_FIRST_LOOK';
  if(row.stage==='REPORTED_RELEASE')return'REGIONAL_RELEASE_CLAIM';
  if(/cancel|anulat/.test(stage))return'CANCELLED';
  if(/withdraw|retras/.test(stage))return'WITHDRAWN';
  if(/delay|amanat|eta depasit/.test(stage))return'DELAYED';
  if(/batch|lot|charge/.test(stage))return'BATCH';
  if(/prototype|prototip/.test(stage))return'PROTOTYPE';
  if(/engineering sample/.test(stage))return'ENGINEERING_SAMPLE';
  if(/sample received|mostra primita/.test(stage))return'REVIEW_SAMPLE_RECEIVED';
  if(/sample sent|sent to reviewer/.test(stage))return'REVIEW_SAMPLE_SENT';
  if(/production|productie/.test(stage))return'PRODUCTION_START';
  if(/waitlist/.test(stage))return'WAITLIST_OPEN';
  if(/\bpre[ -]?order\b|\bprecomand\w*\b|\bpre[ -]?sale\b|(?:^|\s)eta(?:\s|$)/.test(stage))return'PREORDER_OPEN';
  if(/official announcement|anunt oficial/.test(stage))return'OFFICIAL_ANNOUNCEMENT';
  if(/teaser|coming soon|in curand/.test(stage))return'TEASER';
  if(String(row.category)==='ACCESORII'&&/release|lans/.test(stage)&&/manufacturer/.test(type))return'ACCESSORY_RELEASE';
  if(/clone/.test(type)&&/release|lans/.test(stage))return'CLONE_RELEASE';
  if(/official release|released|lansat|shipping started/.test(stage)&&/manufacturer/.test(type))return'OFFICIAL_RELEASE';
  if(/prima listare|in stock|available now/.test(stage))return'FIRST_RETAIL_OBSERVATION';
  if(/promotion|campanie/.test(stage))return'RETAIL_PROMOTION';
  if(/review|first look|prezentare/.test(stage))return'REVIEWER_FIRST_LOOK';
  return'PUBLIC_SIGNAL';
}
function identityConfidence(row={},source={}){
  if(!row.productName)return{score:20,level:'LOW',basis:'unnamed candidate'};
  if(source.title&&normalizeText(source.title).includes(normalizeText(row.productName).slice(0,20)))return{score:96,level:'HIGH',basis:'direct product title match'};
  if(source.url&&/product|products|rta|mod|pod|atomiz/i.test(source.url))return{score:88,level:'HIGH',basis:'product-level source URL'};
  return{score:72,level:'MEDIUM',basis:'current canonical product association'};
}
function warningsFor(row={},source={},eventType){
  const warnings=[];
  if(source.discoveryOnly===true||source.decisionEligible===false)warnings.push('DISCOVERY_ONLY');
  if(['RETAIL_PROMOTION','PROMOTION','DISTRIBUTOR_LISTING','IN_STOCK','CATALOG_OBSERVED','PAGE_MODIFIED','SEARCH_SNIPPET'].includes(eventType))warnings.push('NOT_A_RELEASE');
  if(eventType==='PRIOR_EXISTENCE')warnings.push('KNOWN_BEFORE_WINDOW');
  if(eventType==='FIRST_RETAIL_OBSERVATION')warnings.push('FIRST_OBSERVED_RETAIL_IS_NOT_EXACT_RELEASE');
  if(row.signalKind==='recent-listing-known-model')warnings.push('RELISTING');
  if(/new-arrival/i.test(String(source.dateQuality||source.evidenceScope||'')))warnings.push('NEW_ARRIVAL_IS_NOT_RELEASE');
  return Array.from(new Set(warnings));
}
function createEventClaim({product,row,source,evidence,referenceAt,createdAt}){
  const eventType=eventTypeFor(row,source),semantic=dateSemantic(source,row),claimedEventAt=toIso(source.eventDate)||toIso(row.eventDate),sourcePublishedAt=toIso(source.publishedAt),observedAt=toIso(source.observedAt)||toIso(row.firstSeenAt)||toIso(createdAt),interval=expectedInterval(eventType,claimedEventAt),clocks=classifyClocks({observedAt,sourcePublishedAt,claimedEventAt,eventType,referenceAt});
  const warnings=warningsFor(row,source,eventType),identity=identityConfidence(row,source);
  return validateClaim({
    schemaVersion:ENTITY_SCHEMA_VERSION,entityType:'event_claim',
    id:stableId('claim',product.id,eventType,evidence.id,claimedEventAt||observedAt),productId:product.id,candidateEntityId:null,
    evidenceId:evidence.id,eventType,region:row.region||'GLOBAL',observedAt,sourcePublishedAt,claimedEventAt,
    expectedStartAt:interval.expectedStartAt,expectedEndAt:interval.expectedEndAt,
    claimTextNormalized:normalizeText([source.stage,row.stageLabel,source.title].filter(Boolean).join(' | '))||eventType.toLowerCase(),
    identityConfidence:identity,dateConfidence:{score:dateConfidenceScore(semantic),semantic},claimState:'active',createdAt:toIso(createdAt)||observedAt,
    relation:eventType==='PRIOR_EXISTENCE'?'establishes_prior_existence':warnings.includes('NOT_A_RELEASE')?'contextualizes':'supports',
    weightRole:evidence.truthEligibility,clocks,warnings,
    migration:{legacyWindow:row.window||null,legacyStage:row.stage||null,legacyDateConfidence:row.dateConfidence||null}
  });
}

module.exports={eventTypeFor,identityConfidence,warningsFor,createEventClaim};
