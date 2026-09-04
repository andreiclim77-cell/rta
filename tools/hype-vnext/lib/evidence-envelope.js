#!/usr/bin/env node
'use strict';

const {stableId,stableHash,canonicalUrl,normalizeText}=require('./ids.js');
const {toIso}=require('./date-semantics.js');
const {ENTITY_SCHEMA_VERSION,validateEvidence}=require('./schema-contract.js');

function hostOf(value){try{return new URL(String(value||'')).hostname.replace(/^www\./,'').toLowerCase()}catch(_){return''}}
function evidenceTypeFor(source={}){
  const url=String(source.url||''),type=String(source.sourceType||'').toLowerCase(),host=hostOf(url);
  if(/facebook|instagram|threads|tiktok|twitter|(^|\.)x\.com$/.test(host)||/social/.test(type))return'SOCIAL_POST';
  if(/youtube|youtu\.be/.test(host)||/creator|video/.test(type))return'VIDEO_METADATA';
  if(/reddit/.test(host)||/reddit/.test(type))return'REDDIT_POST';
  if(/forum|community/.test(type))return'FORUM_POST';
  if(/news|publication|press/.test(type))return'NEWS_ARTICLE';
  if(/prior|archive|common-crawl/.test(type))return'COMMON_CRAWL_RECORD';
  if(/distributor/.test(type))return'DISTRIBUTOR_LISTING';
  if(/retail|vendor|store|catalog|promotion|clone/.test(type))return'RETAIL_LISTING';
  if(/regulatory/.test(type))return'REGULATORY_RECORD';
  if(/manual/.test(type))return'MANUAL';
  if(/firmware/.test(type))return'FIRMWARE_NOTE';
  return'WEB_PAGE';
}
function truthEligibility(source={}){
  if(source.decisionEligible===true&&!source.discoveryOnly)return'LIFECYCLE_ELIGIBLE';
  if(source.discoveryOnly===true||source.decisionEligible===false)return'DISCOVERY_ONLY';
  return'CONTEXT_ONLY';
}
function originHint(source={},product={}){
  const explicit=source.originId||source.originKey||source.lineageGroupHint;
  if(explicit)return stableId('lineage',explicit);
  if(source.textFingerprint)return stableId('lineage','fingerprint',source.textFingerprint);
  const type=String(source.sourceType||''),host=hostOf(source.url||source.host);
  if(/manufacturer/.test(type)&&product.brand)return stableId('lineage','maker',product.brand);
  return stableId('lineage',host||type||'unknown',source.authorId||source.accountId||source.collector||type||'unknown');
}
function createEvidenceEnvelope({product,source,sourceFile,legacyRecordId,scanId,retrievedAt}){
  const url=canonicalUrl(source.url||source.sourceUrl||''),observedAt=toIso(source.observedAt)||toIso(product.firstSeenAt)||toIso(retrievedAt),publishedAt=toIso(source.publishedAt),eventDate=toIso(source.eventDate)||toIso(product.eventDate);
  const contentFingerprint=source.textFingerprint||stableHash([normalizeText(source.title||product.productName),eventDate,source.stage||product.stage,source.dateConfidence||product.dateConfidence].join('|'),64);
  const id=stableId('evidence',product.id,url||source.host||source.sourceType,eventDate||publishedAt||observedAt,contentFingerprint);
  return validateEvidence({
    schemaVersion:ENTITY_SCHEMA_VERSION,entityType:'evidence',id,productId:product.id,
    sourceId:stableId('source',source.host||hostOf(url)||source.sourceType||'unknown',source.sourceType||'unknown'),endpointId:null,scanId,
    urlOrExternalId:url||String(source.externalId||source.host||id),canonicalUrl:url||null,evidenceType:evidenceTypeFor(source),
    observedAt,retrievedAt:toIso(retrievedAt)||observedAt,sourcePublishedAt:publishedAt,claimedEventAt:eventDate,
    contentHash:stableHash(contentFingerprint,64),rawArtifactRef:null,textExcerpt:source.title||product.productName||null,
    originalLanguage:source.language||null,normalizedSummary:normalizeText([source.title,source.stage].filter(Boolean).join(' | '))||null,
    truthEligibility:truthEligibility(source),isDiscoveryOnly:truthEligibility(source)==='DISCOVERY_ONLY',
    policyVersion:'hype-public-authorized-v1',parserVersion:'current-hype-adapter-v1',createdAt:observedAt,
    provisionalOriginId:originHint(source,product),provisionalLineageOnly:true,
    sourceFamily:source.sourceType||'unknown',sourceHost:source.host||hostOf(url)||null,
    legacySource:{file:sourceFile,recordId:legacyRecordId||null,collector:source.collector||null,dateConfidence:source.dateConfidence||product.dateConfidence||null}
  });
}

module.exports={hostOf,evidenceTypeFor,truthEligibility,originHint,createEvidenceEnvelope};
