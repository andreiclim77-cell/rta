#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const core=require('../assets/market-google-pod-top20-core');
const OUT='data/google-pod-top20-2026.json';
const REQUIRED=['GOOGLE_ADS_DEVELOPER_TOKEN','GOOGLE_ADS_CUSTOMER_ID','GOOGLE_ADS_REFRESH_TOKEN','GOOGLE_ADS_CLIENT_ID','GOOGLE_ADS_CLIENT_SECRET'];
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
function load(p){return JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));}
function save(p,data){fs.writeFileSync(p,JSON.stringify(data,null,2)+'\n');}
function candidates(demand,canonicalize,isUsable){
  const map=new Map();
  for(const p of demand.products||[]){
    if(p.category!=='POD'||p.inRomanianMarket!==true||!isUsable(p))continue;
    const c=canonicalize(p);
    if(!c.brand||!c.model||!core.norm(c.model)||/\b(?:cartus|cartuse|cartridge|cartridges|rezistenta|rezistente|coils?|replacement|lichid|liquid)\b/.test(core.norm(c.rawProduct)))continue;
    const id=core.norm(c.brand)+'|'+core.norm(c.model), query=(c.brand+' '+c.model).replace(/\s+/g,' ').trim();
    if(!map.has(id))map.set(id,{id,brand:c.brand,model:c.model,query});
  }
  return [...map.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
function unavailable(status,message,details={}){
  return {schema_version:1,title:'Top 20 pod - Google Romania',country:'RO',status,source:{provider:'Google Ads Keyword Planner',metric:'Avg. monthly searches',acquisition:'google_ads_api',geography:'Romania',network:'Google',approximate:true},period:{start:null,end:null,label:null},last_checked:new Date().toISOString(),last_updated:null,rows:[],validation:{verified:false},coverage:{scope:'tracked_models_only',exhaustive:false,models_requested:0},display:{metric_label:'Medie lunară estimată Google (12 luni)',unavailable_message:message},diagnostic:details};
}
async function request(url,body,headers={},timeout=30000){
  const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json',...headers},body,signal:AbortSignal.timeout(timeout)});
  if(!response.ok)throw new Error('Google API HTTP '+response.status); // Never log credential-bearing payloads.
  return response.json();
}
function report(out){
  const summary={status:out.status,google_rows:out.rows.length,models_requested:out.coverage&&out.coverage.models_requested||0,missing_secret_names:out.diagnostic&&out.diagnostic.missing_secret_names||[],errors:out.validation&&out.validation.errors||[]};
  console.log(JSON.stringify(summary));
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'## Google Pod search data\n\n```json\n'+JSON.stringify(summary,null,2)+'\n```\n\nConfiguration-required is NOT a populated ranking. No replacement retailer scores or simulated volumes are published.\n');
}
function toPublic(internal,evidenceSha){
  const out=JSON.parse(JSON.stringify(internal));
  out.schema_version=1;
  out.source.network='Google';
  out.source.metric='Avg. monthly searches';
  out.source.evidence_sha256=evidenceSha;
  out.source.evidence_file='/data/google-pod-evidence/api-'+out.last_checked.slice(0,10)+'-'+evidenceSha.slice(0,16)+'.json';
  if(out.period.start){
    const start=out.period.start,end=out.period.end;
    out.period.start=start+'-01';
    out.period.end=new Date(Date.UTC(Number(end.slice(0,4)),Number(end.slice(5)),0)).toISOString().slice(0,10);
    out.period.label=out.period.start+' — '+out.period.end;
  }
  return out;
}
async function main(){
  const missing=REQUIRED.filter(k=>!String(process.env[k]||'').trim());
  if(missing.length){
    const out=unavailable('configuration_required','Conexiunea Google Ads nu este configurată complet. Nu există un clasament Google măsurat de publicat. Administratorul trebuie să configureze accesul autorizat; detaliile sunt în raportul execuției.',{missing_secret_names:missing});
    save(OUT,out);report(out);return;
  }
  try{
    const {canonicalizeProduct,isUsableProductTitle}=require('./market-product-canonical-2026');
    const demand=load('data/market-demand-intelligence-2026.json'), models=candidates(demand,canonicalizeProduct,isUsableProductTitle);
    if(models.length<20||models.length>10000)throw new Error('Candidate inventory must contain 20 to 10000 canonical models');
    const customer=String(process.env.GOOGLE_ADS_CUSTOMER_ID).replace(/[-\s]/g,''),login=String(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID||'').replace(/[-\s]/g,'');
    if(!/^\d{10}$/.test(customer)||(login&&!/^\d{10}$/.test(login)))throw new Error('Invalid Google Ads customer ID format');
    const version=process.env.GOOGLE_ADS_API_VERSION||'v25';
    if(!/^v\d+$/.test(version))throw new Error('Invalid Google Ads API version');
    const token=await request('https://oauth2.googleapis.com/token',new URLSearchParams({client_id:process.env.GOOGLE_ADS_CLIENT_ID,client_secret:process.env.GOOGLE_ADS_CLIENT_SECRET,refresh_token:process.env.GOOGLE_ADS_REFRESH_TOKEN,grant_type:'refresh_token'}).toString(),{'content-type':'application/x-www-form-urlencoded'});
    if(typeof token.access_token!=='string'||!token.access_token)throw new Error('Google OAuth did not return an access token');
    const headers={authorization:'Bearer '+token.access_token,'developer-token':process.env.GOOGLE_ADS_DEVELOPER_TOKEN};
    if(login)headers['login-customer-id']=login;
    const base='https://googleads.googleapis.com/'+version;
    const geo=await request(base+'/geoTargetConstants:suggest',JSON.stringify({locale:'en',countryCode:'RO',locationNames:{names:['Romania']}}),headers);
    const country=(geo.geoTargetConstantSuggestions||[]).map(x=>x.geoTargetConstant).find(x=>x&&x.countryCode==='RO'&&String(x.targetType).toLowerCase()==='country');
    if(!country||!/^geoTargetConstants\/\d+$/.test(country.resourceName))throw new Error('Romania country target could not be resolved');
    const requestBody={keywords:models.map(x=>x.query),geoTargetConstants:[country.resourceName],keywordPlanNetwork:'GOOGLE_SEARCH'};
    const response=await request(base+'/customers/'+customer+':generateKeywordHistoricalMetrics',JSON.stringify(requestBody),headers,60000);
    if(!Array.isArray(response.results))throw new Error('Google returned no historical metric results');
    const collected_at=new Date().toISOString(), evidence={schema_version:1,collected_at,api_version:version,country:'RO',network:'GOOGLE_SEARCH',geo_target:country.resourceName,language_filter:'not_set',models,results:response.results.map(r=>({text:r.text,closeVariants:r.closeVariants||[],keywordMetrics:{avgMonthlySearches:r.keywordMetrics&&r.keywordMetrics.avgMonthlySearches,monthlySearchVolumes:r.keywordMetrics&&r.keywordMetrics.monthlySearchVolumes||[]}}))};
    const evidenceText=JSON.stringify(evidence,null,2)+'\n', evidenceSha=sha(evidenceText);
    const internal=core.project(models,{results:evidence.results},{collected_at,geo_target:country.resourceName,response_sha256:evidenceSha});
    const out=toPublic(internal,evidenceSha);
    fs.mkdirSync('data/google-pod-evidence',{recursive:true});
    fs.writeFileSync(out.source.evidence_file.slice(1),evidenceText);
    out.source.language_filter='not_set';
    out.source.api_version=version;
    out.source.collector='tools/collect-google-pod-top20.js';
    if(/^\d+$/.test(process.env.GITHUB_RUN_ID||''))out.source.run_id=process.env.GITHUB_RUN_ID;
    save(OUT,out);report(out);
  }catch(e){
    const safe=/^(Google API HTTP \d+|Invalid Google Ads .*|Google OAuth .*|Romania country .*|Google returned .*|Candidate inventory .*)$/.test(String(e.message))?e.message:'Collection failed; no replacement values published';
    const out=unavailable('source_error','Colectarea Google a eșuat. Nu publicăm un clasament de rezervă.',{error:safe});save(OUT,out);report(out);process.exitCode=1;
  }
}
module.exports={candidates,unavailable,toPublic};
if(require.main===module)main().catch(()=>{console.error('Google Pod collector failed before collection');process.exitCode=1;});
