/* Shared deterministic metrics validation. No simulated production data. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory();else root.RTATop20Core=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const PROVIDER='Google Ads Keyword Planner';
const MONTHS=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
function need(ok,code){if(!ok)throw new Error(code)}
function text(v){return typeof v==='string'&&v.trim().length>0&&v.length<=300}
function canonical(v){return String(v||'').normalize('NFKC').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function count(v){if(typeof v==='string'&&/^\d+$/.test(v))v=Number(v);return typeof v==='number'&&Number.isSafeInteger(v)&&v>=0?v:null}
function ym(v){return typeof v==='string'&&/^20\d{2}-(0[1-9]|1[0-2])$/.test(v)}
function shift(v,n){need(ym(v),'INVALID_MONTH');const [y,m]=v.split('-').map(Number);return new Date(Date.UTC(y,m-1+n,1)).toISOString().slice(0,7)}
function date(v){if(typeof v!=='string'||!/^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(v))return null;const n=Date.parse(v);return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===v.slice(0,10)?n:null}
function validateCatalog(list){
 need(Array.isArray(list)&&list.length>=20&&list.length<=2000,'CATALOG_SIZE');
 const ids=new Set(),names=new Set(),keywords=new Map();
 for(const m of list){
  need(m&&text(m.id)&&/^[a-z0-9-]+$/.test(m.id)&&text(m.brand)&&text(m.model),'MODEL_IDENTITY');
  need(m.category==='POD_DEVICE','NOT_A_POD_DEVICE');
  need(!ids.has(m.id)&&!names.has(canonical(m.brand+' '+m.model)),'DUPLICATE_MODEL');ids.add(m.id);names.add(canonical(m.brand+' '+m.model));
  need(Array.isArray(m.keywords)&&m.keywords.length>=1&&m.keywords.length<=10,'MODEL_KEYWORDS');
  for(const k of m.keywords){need(text(k)&&canonical(k).length>=3,'INVALID_KEYWORD');const key=canonical(k);need(!keywords.has(key),'OVERLAPPING_KEYWORDS');keywords.set(key,m.id)}
 }return keywords;
}
function build(bundle,options){
 options=options||{};const now=options.now||new Date().toISOString(),nowTime=date(now);need(nowTime!==null,'INVALID_CLOCK');
 need(bundle&&bundle.schema_version===2,'UNSUPPORTED_SCHEMA');need(bundle.test_fixture!==true||options.allowTest===true,'TEST_DATA_REJECTED');
 const source=bundle.source||{},req=bundle.request||{},period=req.period||{};
 need(source.provider===PROVIDER,'INVALID_SOURCE');need(['google_ads_api','keyword_planner_csv'].includes(source.method),'INVALID_METHOD');
 const fetched=date(source.retrieved_at);need(fetched!==null&&fetched<=nowTime+300000,'INVALID_RETRIEVAL_DATE');
 need(req.country==='RO'&&req.network==='GOOGLE_SEARCH'&&req.language==='all','INVALID_SCOPE');
 need(ym(period.start)&&ym(period.end)&&shift(period.start,11)===period.end&&period.end<now.slice(0,7),'INVALID_PERIOD');need(period.end<source.retrieved_at.slice(0,7),'PERIOD_AFTER_RETRIEVAL');
 if(source.method==='google_ads_api'){
  need(text(source.request_id),'MISSING_GOOGLE_REQUEST_ID');const g=req.google_geo||{},q=req.google_request||{},range=q.historicalMetricsOptions&&q.historicalMetricsOptions.yearMonthRange;
  need(g.countryCode==='RO'&&g.targetType==='Country'&&g.status==='ENABLED'&&/^geoTargetConstants\/\d+$/.test(g.resourceName||''),'UNCONFIRMED_GOOGLE_GEO');
  need(Array.isArray(q.geoTargetConstants)&&q.geoTargetConstants.length===1&&q.geoTargetConstants[0]===g.resourceName&&q.keywordPlanNetwork==='GOOGLE_SEARCH'&&!q.language,'GOOGLE_REQUEST_SCOPE_MISMATCH');
  const m=v=>v&&String(v.year)+'-'+String(MONTHS.indexOf(v.month)+1).padStart(2,'0');need(range&&m(range.start)===period.start&&m(range.end)===period.end,'GOOGLE_REQUEST_PERIOD_MISMATCH');
 }
 if(source.method==='keyword_planner_csv')need(/^[a-f0-9]{64}$/.test(source.original_sha256||'')&&text(source.reviewed_by)&&source.scope_confirmed===true,'UNREVIEWED_CSV');
 const keys=validateCatalog(bundle.catalog);
 if(source.method==='google_ads_api'){const submitted=req.google_request.keywords;need(Array.isArray(submitted)&&submitted.length===keys.size&&new Set(submitted.map(canonical)).size===keys.size&&submitted.every(k=>keys.has(canonical(k))),'GOOGLE_REQUEST_KEYWORDS_MISMATCH')}
 const months=Array.from({length:12},(_,i)=>shift(period.start,i));need(Array.isArray(bundle.results)&&bundle.results.length<=20000,'INVALID_RESULTS');
 const groups=new Map(),seenTerms=new Map(),ambiguous=new Set();let ignored=0;
 for(const r of bundle.results){
  need(r&&text(r.text)&&(!r.closeVariants||Array.isArray(r.closeVariants)),'INVALID_GOOGLE_ROW');const terms=[r.text].concat(r.closeVariants||[]);need(terms.every(text),'INVALID_VARIANT');
  const norms=Array.from(new Set(terms.map(canonical))).sort(),owners=new Set(norms.map(k=>keys.get(k)).filter(Boolean));if(!owners.size){ignored++;continue}
  const signature=norms.join('|'),values={},vols=r.keywordMetrics&&r.keywordMetrics.monthlySearchVolumes;need(vols==null||Array.isArray(vols),'INVALID_MONTHLY_VOLUMES');
  for(const v of vols||[]){
   need(v&&Number.isInteger(Number(v.year)),'INVALID_VOLUME_YEAR');const m=MONTHS.indexOf(v.month)+1;need(m>0,'INVALID_VOLUME_MONTH');
   const month=String(v.year)+'-'+String(m).padStart(2,'0');need(ym(month),'INVALID_VOLUME_DATE');need(month<now.slice(0,7),'INCOMPLETE_CURRENT_MONTH');if(!months.includes(month))continue;
   const value=count(v.monthlySearches);need(v.monthlySearches==null||value!==null,'INVALID_SEARCH_VOLUME');need(!Object.prototype.hasOwnProperty.call(values,month),'DUPLICATE_MONTH');values[month]=value;
  }
  if(groups.has(signature)){need(JSON.stringify(months.map(m=>groups.get(signature).values[m]))===JSON.stringify(months.map(m=>values[m])),'CONFLICTING_DUPLICATE');continue}
  for(const term of norms){need(!seenTerms.has(term),'OVERLAPPING_GOOGLE_GROUPS');seenTerms.set(term,signature)}if(owners.size>1){for(const id of owners)ambiguous.add(id)}groups.set(signature,{terms:norms,owners:Array.from(owners),values});
 }
 const all=bundle.catalog.map(m=>{
  const own=Array.from(groups.values()).filter(g=>g.owners.length===1&&g.owners[0]===m.id),matched=new Set(own.flatMap(g=>g.terms));const complete=m.keywords.every(k=>matched.has(canonical(k)))&&!ambiguous.has(m.id);
  const series=months.map(month=>{const vals=own.map(g=>g.values[month]),known=complete&&vals.length>0&&vals.every(v=>count(v)!==null),sum=known?vals.reduce((a,b)=>a+b,0):null;need(sum===null||Number.isSafeInteger(sum),'SEARCH_VOLUME_OVERFLOW');return{month,searches:sum}});
  return{id:m.id,brand:m.brand,model:m.model,keywords:m.keywords.slice(),series,reason:ambiguous.has(m.id)?'ambiguous_google_group':!complete?'missing_keyword_group':null};
 });
 let month=options.month;if(month!==undefined)need(months.includes(month),'MONTH_OUTSIDE_PERIOD');else month=months.slice().reverse().find(k=>all.filter(r=>count(r.series.find(v=>v.month===k).searches)!==null&&r.series.find(v=>v.month===k).searches>0).length>=20)||period.end;
 const rows=all.map(r=>{const n=r.series.find(v=>v.month===month).searches,prev=r.series.find(v=>v.month===shift(month,-1)),p=prev?prev.searches:null,trend=n!==null&&p!==null&&p>0?100*(n-p)/p:null;return Object.assign({},r,{monthly_searches:n,previous_searches:p,trend_pct:trend})});
 const valid=rows.filter(r=>r.monthly_searches!==null&&r.monthly_searches>0);valid.sort((a,b)=>b.monthly_searches-a.monthly_searches||canonical(a.brand+' '+a.model).localeCompare(canonical(b.brand+' '+b.model),'en'));
 valid.forEach((r,i)=>{r.rank=i&&r.monthly_searches===valid[i-1].monthly_searches?valid[i-1].rank:i+1;r.tied=valid.filter(x=>x.monthly_searches===r.monthly_searches).length>1});
 const cutoff=valid.length>=20?valid[19].monthly_searches:null,top=valid.slice(0,20),excluded=rows.filter(r=>r.monthly_searches===null),zero=rows.filter(r=>r.monthly_searches===0);
 return{status:valid.length>=20?'ready':'insufficient_data',test_fixture:bundle.test_fixture===true,rows:top,all_rows:rows,month,months,source,period,coverage:{catalog_models:rows.length,measured_models:valid.length+zero.length,positive_models:valid.length,missing_models:excluded.length,zero_models:zero.length,ambiguous_models:ambiguous.size,ignored_groups:ignored},excluded:excluded.map(r=>({id:r.id,reason:r.reason||'missing_monthly_volume'})),cutoff_ties_omitted:cutoff===null?0:valid.slice(20).filter(r=>r.monthly_searches===cutoff).length,stale:month<shift(now.slice(0,7),-2),retrieval_stale:nowTime-fetched>45*86400000};
}
function validateManifest(m){need(m&&m.schema_version===2,'UNSUPPORTED_MANIFEST');if(m.status!=='ready'){need(['source_not_connected','insufficient_data','source_error'].includes(m.status),'INVALID_MANIFEST_STATUS');return false}need(/^\/data\/google-pod-evidence\/[a-f0-9]{64}\.json$/.test(m.evidence_path||''),'INVALID_EVIDENCE_PATH');need(/^[a-f0-9]{64}$/.test(m.evidence_sha256||'')&&m.evidence_path.endsWith(m.evidence_sha256+'.json'),'INVALID_EVIDENCE_HASH');return true}
function csv(table){return table.map(row=>row.map(v=>{let s=v==null?'':String(v);if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}).join(',')).join('\r\n')}
return{PROVIDER,MONTHS,canonical,count,ym,shift,validateCatalog,build,validateManifest,csv};
});
