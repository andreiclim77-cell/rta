#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const core=require('../assets/market-google-pod-top20-core');
const REQUIRED=['GOOGLE_ADS_DEVELOPER_TOKEN','GOOGLE_ADS_CUSTOMER_ID','GOOGLE_ADS_REFRESH_TOKEN','GOOGLE_ADS_CLIENT_ID','GOOGLE_ADS_CLIENT_SECRET'];
const CONFIG={
  rta:{kind:'rta',category:'RTA',required:10,title:'Top 10 RTA - Google Romania',out:'data/google-rta-top10-2026.json',evidenceDir:'data/google-rta-evidence'},
  mod:{kind:'mod',category:'mod',required:10,title:'Top 10 moduri - Google Romania',out:'data/google-mod-top10-2026.json',evidenceDir:'data/google-mod-evidence'}
};
const arg=(process.argv.find(x=>x.startsWith('--kind='))||'--kind='+(process.env.GOOGLE_TOP_KIND||'')).slice(7).toLowerCase();
const cfg=CONFIG[arg]||null;
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
function load(p){return JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));}
function save(p,data){fs.writeFileSync(p,JSON.stringify(data,null,2)+'\n');}
function needConfig(localCfg){if(!localCfg)throw new Error('Google ranking category is not configured');return localCfg;}
function blockedRaw(raw,kind){
  const n=core.norm(raw);
  if(kind==='rta')return /\b(?:glass|pyrex|replacement|spare|oring|o ring|deck|chimney|bell|top cap|drip tip|screw|screws|tank tube|extension kit|air pin|airpin)\b/.test(n);
  return /\b(?:battery|batteries|acumulator|acumulatori|charger|incarcator|door|doors|panel|panels|cover|case|husa|chipset|board|replacement|spare)\b/.test(n);
}
function candidates(demand,canonicalize,isUsable,localCfg=cfg){
  localCfg=needConfig(localCfg);const map=new Map();
  for(const p of demand.products||[]){
    if(p.category!==localCfg.category||p.inRomanianMarket!==true||!isUsable(p))continue;
    const c=canonicalize(p);
    if(!c.brand||!c.model||!core.norm(c.model)||blockedRaw(c.rawProduct,localCfg.kind))continue;
    const id=core.norm(c.brand)+'|'+core.norm(c.model),query=(c.brand+' '+c.model).replace(/\s+/g,' ').trim();
    if(!map.has(id))map.set(id,{id,brand:c.brand,model:c.model,query});
  }
  return [...map.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
function unavailable(status,message,details={},localCfg=cfg){
  localCfg=needConfig(localCfg);
  return {schema_version:1,title:localCfg.title,category:localCfg.category,required_count:localCfg.required,country:'RO',status,source:{provider:'Google Ads Keyword Planner',metric:'Avg. monthly searches',acquisition:'google_ads_api',geography:'Romania',network:'Google',approximate:true},period:{start:null,end:null,label:null},last_checked:new Date().toISOString(),last_updated:null,rows:[],validation:{verified:false},coverage:{scope:'tracked_models_only',exhaustive:false,models_requested:0},display:{metric_label:'Medie lunară estimată Google (12 luni)',unavailable_message:message},diagnostic:details};
}
function safeGoogleError(payload,status){
  const result={http_status:Number.isInteger(status)?status:null};
  const sensitive=REQUIRED.concat('GOOGLE_ADS_LOGIN_CUSTOMER_ID').map(k=>String(process.env[k]||'').trim()).filter(Boolean);
  const safe=(v,pattern)=>typeof v==='string'&&pattern.test(v)&&!sensitive.some(s=>v.includes(s));
  const error=payload&&payload.error;
  const oauthCodes=new Set(['invalid_request','invalid_client','invalid_grant','unauthorized_client','unsupported_grant_type','invalid_scope','access_denied','temporarily_unavailable','server_error']);
  if(typeof error==='string'&&oauthCodes.has(error))result.oauth_error=error;
  if(error&&typeof error==='object'){
    const statuses=new Set(['INVALID_ARGUMENT','UNAUTHENTICATED','PERMISSION_DENIED','NOT_FOUND','RESOURCE_EXHAUSTED','FAILED_PRECONDITION','UNAVAILABLE','INTERNAL','DEADLINE_EXCEEDED','UNKNOWN','UNIMPLEMENTED']);
    if(statuses.has(error.status))result.google_status=error.status;
    const codes=[];
    for(const detail of Array.isArray(error.details)?error.details:[])for(const item of detail&&Array.isArray(detail.errors)?detail.errors:[])for(const [kind,code] of Object.entries(item&&item.errorCode||{}))if(safe(kind,/^[a-z][a-zA-Z]{1,80}Error$/)&&safe(code,/^[A-Z][A-Z0-9_]{1,100}$/))codes.push(kind+'.'+code);
    if(codes.length)result.google_ads_errors=[...new Set(codes)].slice(0,10);
  }
  return result;
}
async function request(url,body,headers={},timeout=30000){
  const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json',...headers},body,signal:AbortSignal.timeout(timeout)});
  if(!response.ok){let payload={};try{payload=await response.json();}catch{}const error=new Error('Google API HTTP '+response.status);error.googleDiagnostic=safeGoogleError(payload,response.status);throw error;}
  return response.json();
}
function toPublic(internal,evidenceSha,localCfg=cfg){
  localCfg=needConfig(localCfg);const out=JSON.parse(JSON.stringify(internal));
  out.schema_version=1;out.source.network='Google';out.source.metric='Avg. monthly searches';out.source.evidence_sha256=evidenceSha;
  out.source.evidence_file='/'+localCfg.evidenceDir+'/api-'+out.last_checked.slice(0,10)+'-'+evidenceSha.slice(0,16)+'.json';
  if(out.period.start){const start=out.period.start,end=out.period.end;out.period.start=start+'-01';out.period.end=new Date(Date.UTC(Number(end.slice(0,4)),Number(end.slice(5)),0)).toISOString().slice(0,10);out.period.label=out.period.start+' — '+out.period.end;}
  return out;
}
function report(out,localCfg=cfg){
  localCfg=needConfig(localCfg);const summary={kind:localCfg.kind,status:out.status,google_rows:out.rows.length,required_count:localCfg.required,models_requested:out.coverage&&out.coverage.models_requested||0,models_with_valid_series:out.coverage&&out.coverage.models_with_valid_series||0,errors:out.validation&&out.validation.errors||[]};
  if(out.diagnostic)summary.diagnostic=out.diagnostic;console.log(JSON.stringify(summary));
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## Google '+localCfg.title+'\n\n```json\n'+JSON.stringify(summary,null,2)+'\n```\n');
}
async function main(localCfg=cfg){
  localCfg=needConfig(localCfg);const missing=REQUIRED.filter(k=>!String(process.env[k]||'').trim());
  if(missing.length){const out=unavailable('configuration_required','Conexiunea Google Ads nu este configurată complet. Nu publicăm valori de rezervă.',{missing_secret_names:missing},localCfg);save(localCfg.out,out);report(out,localCfg);return;}
  const progress={kind:localCfg.kind,phase:'candidate_inventory',oauth_authenticated:false,geography_resolved:false,models_requested:0};
  try{
    const {canonicalizeProduct,isUsableProductTitle}=require('./market-product-canonical-2026');
    const demand=load('data/market-demand-intelligence-2026.json'),models=candidates(demand,canonicalizeProduct,isUsableProductTitle,localCfg);progress.models_requested=models.length;
    if(models.length<localCfg.required||models.length>10000)throw new Error('Candidate inventory outside allowed range');
    const customer=String(process.env.GOOGLE_ADS_CUSTOMER_ID).replace(/[-\s]/g,''),login=String(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID||'').replace(/[-\s]/g,'');
    if(!/^\d{10}$/.test(customer)||(login&&!/^\d{10}$/.test(login)))throw new Error('Invalid Google Ads customer ID format');
    const version=process.env.GOOGLE_ADS_API_VERSION||'v25';if(!/^v\d+$/.test(version))throw new Error('Invalid Google Ads API version');
    progress.phase='oauth_refresh';
    const token=await request('https://oauth2.googleapis.com/token',new URLSearchParams({client_id:process.env.GOOGLE_ADS_CLIENT_ID,client_secret:process.env.GOOGLE_ADS_CLIENT_SECRET,refresh_token:process.env.GOOGLE_ADS_REFRESH_TOKEN,grant_type:'refresh_token'}).toString(),{'content-type':'application/x-www-form-urlencoded'});
    if(typeof token.access_token!=='string'||!token.access_token)throw new Error('Google OAuth did not return an access token');progress.oauth_authenticated=true;
    const headers={authorization:'Bearer '+token.access_token,'developer-token':process.env.GOOGLE_ADS_DEVELOPER_TOKEN};if(login)headers['login-customer-id']=login;
    const base='https://googleads.googleapis.com/'+version;progress.phase='geography_lookup';
    const geo=await request(base+'/geoTargetConstants:suggest',JSON.stringify({locale:'en',countryCode:'RO',locationNames:{names:['Romania']}}),headers);
    const country=(geo.geoTargetConstantSuggestions||[]).map(x=>x.geoTargetConstant).find(x=>x&&x.countryCode==='RO'&&String(x.targetType).toLowerCase()==='country');
    if(!country||!/^geoTargetConstants\/\d+$/.test(country.resourceName))throw new Error('Romania country target could not be resolved');progress.geography_resolved=true;
    progress.phase='historical_metrics';
    const response=await request(base+'/customers/'+customer+':generateKeywordHistoricalMetrics',JSON.stringify({keywords:models.map(x=>x.query),geoTargetConstants:[country.resourceName],keywordPlanNetwork:'GOOGLE_SEARCH',includeAdultKeywords:true}),headers,60000);
    if(!Array.isArray(response.results))throw new Error('Google returned no historical metric results');
    progress.phase='evidence_validation';const collected_at=new Date().toISOString();
    const evidence={schema_version:1,collected_at,api_version:version,country:'RO',category:localCfg.category,required_count:localCfg.required,network:'GOOGLE_SEARCH',geo_target:country.resourceName,language_filter:'not_set',include_adult_keywords:true,models,results:response.results.map(r=>({text:r.text,closeVariants:r.closeVariants||[],keywordMetrics:{avgMonthlySearches:r.keywordMetrics&&r.keywordMetrics.avgMonthlySearches,monthlySearchVolumes:r.keywordMetrics&&r.keywordMetrics.monthlySearchVolumes||[]}}))};
    const evidenceText=JSON.stringify(evidence,null,2)+'\n',evidenceSha=sha(evidenceText);
    const internal=core.project(models,{results:evidence.results},{collected_at,geo_target:country.resourceName,response_sha256:evidenceSha,required_count:localCfg.required,title:localCfg.title,category:localCfg.category});
    const out=toPublic(internal,evidenceSha,localCfg);fs.mkdirSync(localCfg.evidenceDir,{recursive:true});fs.writeFileSync(out.source.evidence_file.slice(1),evidenceText);
    out.source.language_filter='not_set';out.source.include_adult_keywords=true;out.source.api_version=version;out.source.collector='tools/collect-google-category-top.js';if(/^\d+$/.test(process.env.GITHUB_RUN_ID||''))out.source.run_id=process.env.GITHUB_RUN_ID;
    save(localCfg.out,out);report(out,localCfg);
  }catch(e){
    const safeMessages=new Set(['Invalid Google Ads customer ID format','Invalid Google Ads API version','Google OAuth did not return an access token','Romania country target could not be resolved','Google returned no historical metric results','Candidate inventory outside allowed range']);
    const safe=/^Google API HTTP \d{3}$/.test(String(e.message))||safeMessages.has(e.message)?e.message:'Collection failed; no replacement values published';
    const out=unavailable('source_error','Colectarea Google a eșuat. Nu publicăm un clasament de rezervă.',{error:safe,...progress,...(e.googleDiagnostic||{})},localCfg);out.coverage.models_requested=progress.models_requested;save(localCfg.out,out);report(out,localCfg);process.exitCode=1;
  }
}
module.exports={CONFIG,candidates,blockedRaw,unavailable,toPublic,safeGoogleError,main};
if(require.main===module){if(!cfg){console.error('Use --kind=rta or --kind=mod');process.exitCode=2;}else main(cfg).catch(()=>{console.error('Google category collector failed before collection');process.exitCode=1;});}
