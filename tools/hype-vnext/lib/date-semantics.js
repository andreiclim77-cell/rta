#!/usr/bin/env node
'use strict';

const SIGNAL_OBSERVATION_WINDOW_DAYS=30;
const RECENT_RELEASE_WINDOW_DAYS=30;
const FORECAST_HORIZON_DAYS=180;
const HISTORY_MEMORY_DAYS=730;
const DAY_MS=24*60*60*1000;
const RELEASE_EVENTS=new Set(['OFFICIAL_RELEASE','REGIONAL_RELEASE','CLONE_RELEASE','ACCESSORY_RELEASE']);

function toMs(value){const parsed=Date.parse(String(value||''));return Number.isFinite(parsed)?parsed:null}
function toIso(value){const parsed=toMs(value);return parsed==null?null:new Date(parsed).toISOString()}
function latestDate(...values){
  const dates=values.flat(Infinity).map(toMs).filter(value=>value!=null);
  return dates.length?new Date(Math.max(...dates)).toISOString():null;
}
function ageDays(value,referenceAt){const date=toMs(value),reference=toMs(referenceAt);return date==null||reference==null?null:(reference-date)/DAY_MS}
function insidePastWindow(value,referenceAt,days){const age=ageDays(value,referenceAt);return age!=null&&age>=0&&age<=days}

function dateSemantic(source={},row={}){
  const value=String(source.dateConfidence||row.dateConfidence||'unknown').toLowerCase();
  if(value==='official-product-published-at')return'OFFICIAL_PRODUCT_PUBLICATION';
  if(value==='catalog-published-at')return'CATALOG_PUBLICATION';
  if(value==='first-retail-observation')return'FIRST_OBSERVED_RETAIL';
  if(value==='release-observed')return'OBSERVED_RELEASE_CLAIM';
  if(value==='dated-retail-campaign')return'RETAIL_CAMPAIGN_PUBLICATION';
  if(value==='signal-publication'||value==='dated-public-evidence')return'SOURCE_PUBLICATION';
  if(/eta|explicit/.test(value))return'CLAIMED_OR_EXPECTED_DATE';
  return'UNKNOWN_DATE_SEMANTIC';
}

function dateConfidenceScore(semantic){
  return({OFFICIAL_PRODUCT_PUBLICATION:85,CATALOG_PUBLICATION:68,FIRST_OBSERVED_RETAIL:65,OBSERVED_RELEASE_CLAIM:72,RETAIL_CAMPAIGN_PUBLICATION:35,SOURCE_PUBLICATION:45,CLAIMED_OR_EXPECTED_DATE:78,UNKNOWN_DATE_SEMANTIC:20})[semantic]||20;
}

function forecastBand(claimedEventAt,referenceAt){
  const date=toMs(claimedEventAt),reference=toMs(referenceAt);
  if(date==null||reference==null)return'UNKNOWN';
  const days=(date-reference)/DAY_MS;
  if(days<0)return'PAST';
  if(days<=30)return'NEXT_30_DAYS';
  if(days<=90)return'DAYS_31_90';
  if(days<=FORECAST_HORIZON_DAYS)return'DAYS_91_180';
  return'LONG_RANGE';
}

function classifyClocks({observedAt,sourcePublishedAt,claimedEventAt,eventType,referenceAt}){
  const materialAt=toIso(observedAt)||toIso(sourcePublishedAt);
  return{
    materialObservedAt:materialAt,
    signalWindowActive:insidePastWindow(materialAt,referenceAt,SIGNAL_OBSERVATION_WINDOW_DAYS),
    recentReleaseWindowActive:RELEASE_EVENTS.has(eventType)&&insidePastWindow(claimedEventAt,referenceAt,RECENT_RELEASE_WINDOW_DAYS),
    forecastBand:forecastBand(claimedEventAt,referenceAt),
    historyMemoryActive:insidePastWindow(claimedEventAt||sourcePublishedAt||observedAt,referenceAt,HISTORY_MEMORY_DAYS)
  };
}

function expectedInterval(eventType,claimedEventAt){
  const value=toIso(claimedEventAt);
  if(!value)return{expectedStartAt:null,expectedEndAt:null};
  if(['TEASER','PROTOTYPE','ENGINEERING_SAMPLE','PREPRODUCTION_SAMPLE','REVIEW_SAMPLE_SENT','REVIEW_SAMPLE_RECEIVED','PRODUCTION_START','WAITLIST_OPEN','PREORDER_ANNOUNCED','PREORDER_OPEN','OFFICIAL_ANNOUNCEMENT'].includes(eventType))return{expectedStartAt:value,expectedEndAt:value};
  return{expectedStartAt:null,expectedEndAt:null};
}

module.exports={
  SIGNAL_OBSERVATION_WINDOW_DAYS,RECENT_RELEASE_WINDOW_DAYS,FORECAST_HORIZON_DAYS,HISTORY_MEMORY_DAYS,RELEASE_EVENTS,
  toMs,toIso,latestDate,ageDays,insidePastWindow,dateSemantic,dateConfidenceScore,forecastBand,classifyClocks,expectedInterval
};
