#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const {stableJson}=require('./lib/ids.js');
const {latestDate,toIso,SIGNAL_OBSERVATION_WINDOW_DAYS,RECENT_RELEASE_WINDOW_DAYS,FORECAST_HORIZON_DAYS,HISTORY_MEMORY_DAYS}=require('./lib/date-semantics.js');
const {SCHEMA_VERSION,ENTITY_SCHEMA_VERSION,documentEnvelope}=require('./lib/schema-contract.js');
const {adaptDocuments}=require('./ingest/current-evidence-adapter.js');
const {buildLegacyProjections}=require('./projectors/legacy-compat.js');
const {JsonProjectionStore}=require('./stores/json-projection-store.js');

const ROOT=path.resolve(__dirname,'..','..');
const OUTPUT_ROOT=path.join(ROOT,'data','hype-vnext');
const SOURCE_FILES={
  products:'data/market-hype-products-2026.json',pods:'data/market-hype-pods-2026.json',radar:'data/market-hype-radar-2026.json',
  evidence:'data/market-hype-evidence-2026.json',heartbeat:'data/market-hype-heartbeat-2026.json',heartbeatEvidence:'data/market-hype-heartbeat-evidence-2026.json',
  knownHistory:'data/market-hype-known-history-2026.json',retailMemory:'data/market-hype-retail-memory-2026.json',sources:'data/market-hype-sources-2026.json'
};

function readJson(relative){return JSON.parse(fs.readFileSync(path.join(ROOT,...relative.split('/')),'utf8'))}
function sha256(relative){
  const normalized=fs.readFileSync(path.join(ROOT,...relative.split('/')),'utf8').replace(/\r\n/g,'\n');
  return crypto.createHash('sha256').update(normalized,'utf8').digest('hex');
}
function stableText(value){return JSON.stringify(stableJson(value),null,2)+'\n'}
function generatedAtFor(data){return latestDate(data.products.generatedAt,data.pods.generatedAt,data.radar.generatedAt,data.evidence.generatedAt,data.heartbeat.generatedAt)||new Date(0).toISOString()}
function countBy(rows,key){const result={};for(const row of rows){const value=String(row[key]||'UNKNOWN');result[value]=(result[value]||0)+1}return Object.fromEntries(Object.entries(result).sort())}

function build(){
  const data=Object.fromEntries(Object.entries(SOURCE_FILES).map(([key,file])=>[key,readJson(file)])),generatedAt=generatedAtFor(data),referenceAt=toIso(data.products.snapshotReferenceAt)||toIso(data.pods.snapshotReferenceAt)||generatedAt;
  const sourceSnapshots=Object.fromEntries(Object.values(SOURCE_FILES).map(file=>[file,{sha256:sha256(file)}]));
  const adapted=adaptDocuments({productsDocument:data.products,podsDocument:data.pods,sourceConfig:data.sources,generatedAt,referenceAt});
  const originCount=new Set(adapted.evidence.map(row=>row.provisionalOriginId)).size;
  const documents={
    'products.json':documentEnvelope('product',generatedAt,sourceSnapshots,adapted.products,{categories:countBy(adapted.products,'category')}),
    'evidence.json':documentEnvelope('evidence',generatedAt,sourceSnapshots,adapted.evidence,{evidenceTypes:countBy(adapted.evidence,'evidenceType'),rawEvidenceCount:adapted.evidence.length,provisionalOriginCount:originCount,lineageStatus:'PROVISIONAL_PHASE_1'}),
    'event-claims.json':documentEnvelope('event_claim',generatedAt,sourceSnapshots,adapted.claims,{eventTypes:countBy(adapted.claims,'eventType'),signalWindowActive:adapted.claims.filter(row=>row.clocks.signalWindowActive).length,recentReleaseWindowActive:adapted.claims.filter(row=>row.clocks.recentReleaseWindowActive).length})
  };
  const counts=Object.fromEntries(Object.entries(documents).map(([file,document])=>[file.replace('.json',''),document.count]));
  documents['schema-version.json']={
    schemaVersion:SCHEMA_VERSION,entitySchemaVersion:ENTITY_SCHEMA_VERSION,phase:1,mode:'ADDITIVE_SHADOW',generatedAt,referenceAt,sourceSnapshots,counts,
    clocks:{signalObservationWindowDays:SIGNAL_OBSERVATION_WINDOW_DAYS,recentReleaseWindowDays:RECENT_RELEASE_WINDOW_DAYS,forecastHorizonDays:FORECAST_HORIZON_DAYS,historyMemoryDays:HISTORY_MEMORY_DAYS},
    truthInvariants:['observation_date_is_not_release_date','first_seen_is_not_exact_release','retail_listing_is_not_automatic_release','new_arrival_is_not_release','relisting_restock_batch_and_variant_are_distinct','clone_release_is_not_original_release','derivative_pages_are_not_independent_origins','source_failure_is_incomplete_not_zero','evidence_and_claims_are_immutable','global_hype_is_not_romanian_sales_truth'],
    legacyProjectionSources:{products:SOURCE_FILES.products,pods:SOURCE_FILES.pods},publicUiCutover:false,productionCollectorCutover:false,scoringCutover:false,
    phaseLimitations:['Full source lineage clustering begins in Phase 2.','Resolved lifecycle events and novelty gates begin in Phase 2.','Phase 1 preserves claims and publishes byte-compatible shadow projections only.']
  };
  return{documents,legacy:buildLegacyProjections(ROOT),generatedAt,referenceAt,counts};
}

function writeOrCheck(result,checkOnly){
  const store=new JsonProjectionStore(OUTPUT_ROOT),mismatches=[];
  for(const [relative,document] of Object.entries(result.documents)){
    const expected=stableText(document);if(checkOnly){if(!store.matches(relative,expected))mismatches.push(relative)}else store.write(relative,expected);
  }
  for(const [relative,projection] of Object.entries(result.legacy)){
    const expected=projection.raw.replace(/\r\n/g,'\n');if(checkOnly){if(!store.matches(relative,expected))mismatches.push(relative)}else store.write(relative,expected);
  }
  if(mismatches.length)throw new Error(`HYPE Phase 1 generated output drift: ${mismatches.join(', ')}`);
}

function main(){const result=build(),checkOnly=process.argv.includes('--check');writeOrCheck(result,checkOnly);console.log(`HYPE vNext Phase 1 ${checkOnly?'check':'build'} PASS: ${Object.entries(result.counts).map(([key,value])=>`${key}=${value}`).join(', ')}.`)}

if(require.main===module){try{main()}catch(error){console.error(error.stack||error);process.exit(1)}}
module.exports={ROOT,OUTPUT_ROOT,SOURCE_FILES,generatedAtFor,stableText,build,writeOrCheck};
