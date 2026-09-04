#!/usr/bin/env node
'use strict';

const SCHEMA_VERSION='hype-vnext.phase1.v1';
const ENTITY_SCHEMA_VERSION=1;
const CATEGORIES=new Set(['RTA','MODURI','ACCESORII','POD']);
const AUTHENTICITY_STATES=new Set(['AUTHENTIC','CLONE','UNKNOWN']);
const EVIDENCE_TYPES=new Set(['WEB_PAGE','SOCIAL_POST','VIDEO_METADATA','FORUM_POST','REDDIT_POST','NEWS_ARTICLE','RETAIL_LISTING','DISTRIBUTOR_LISTING','REGULATORY_RECORD','MANUAL','FIRMWARE_NOTE','SITEMAP_ENTRY','SEARCH_RESULT','SEARCH_SNIPPET','COMMON_CRAWL_RECORD','EVENT_NEWS','IMAGE']);
const TRUTH_ELIGIBILITY=new Set(['LIFECYCLE_ELIGIBLE','CONTEXT_ONLY','DISCOVERY_ONLY']);
const CLAIM_STATES=new Set(['active','contradicted','superseded','stale','resolved_true','resolved_false']);

function assert(condition,message){if(!condition)throw new Error(message)}
function assertString(value,label){assert(typeof value==='string'&&value.trim(),`${label} must be a non-empty string`)}
function documentEnvelope(entityType,generatedAt,sourceSnapshots,rows,extra={}){
  assertString(entityType,'entityType');assertString(generatedAt,'generatedAt');assert(Array.isArray(rows),'rows must be an array');
  return{schemaVersion:SCHEMA_VERSION,entitySchemaVersion:ENTITY_SCHEMA_VERSION,entityType,generatedAt,sourceSnapshots:sourceSnapshots||{},count:rows.length,...extra,rows};
}
function validateProduct(row){
  assertString(row.id,'product.id');assert(row.entityType==='product','product.entityType mismatch');assert(CATEGORIES.has(row.category),`Invalid category: ${row.category}`);assert(AUTHENTICITY_STATES.has(row.authenticityState),`Invalid authenticity state: ${row.authenticityState}`);return row;
}
function validateEvidence(row){
  assertString(row.id,'evidence.id');assert(row.entityType==='evidence','evidence.entityType mismatch');assertString(row.productId,'evidence.productId');assert(EVIDENCE_TYPES.has(row.evidenceType),`Invalid evidence type: ${row.evidenceType}`);assert(TRUTH_ELIGIBILITY.has(row.truthEligibility),`Invalid truth eligibility: ${row.truthEligibility}`);assertString(row.observedAt,'evidence.observedAt');assertString(row.retrievedAt,'evidence.retrievedAt');return row;
}
function validateClaim(row){
  assertString(row.id,'claim.id');assert(row.entityType==='event_claim','claim.entityType mismatch');assertString(row.productId,'claim.productId');assertString(row.evidenceId,'claim.evidenceId');assertString(row.eventType,'claim.eventType');assert(CLAIM_STATES.has(row.claimState),`Invalid claim state: ${row.claimState}`);return row;
}

module.exports={SCHEMA_VERSION,ENTITY_SCHEMA_VERSION,CATEGORIES,AUTHENTICITY_STATES,EVIDENCE_TYPES,TRUTH_ELIGIBILITY,CLAIM_STATES,assert,assertString,documentEnvelope,validateProduct,validateEvidence,validateClaim};
