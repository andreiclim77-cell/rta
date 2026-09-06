/* Reconcile public measurements with saved API evidence. A matching hash
   proves file integrity, not Google's authorship. No fabricated fallback. */
(function(root,factory){'use strict';if(typeof module==='object'&&module.exports)module.exports=factory(require('./market-google-pod-top20-core'));else root.RtaGooglePodProof=factory(root.RtaGooglePodTop20)})(typeof globalThis!=='undefined'?globalThis:this,function(core){
'use strict';
function stable(v){if(Array.isArray(v))return'['+v.map(stable).join(',')+']';if(v&&typeof v==='object')return'{'+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+':'+stable(v[k])}).join(',')+'}';return JSON.stringify(v)}
function rowView(rows){return rows.map(function(r){return{brand:r.brand,model:r.model,query:r.query,monthly_searches:r.monthly_searches,monthly_series:r.monthly_series,trend_pct:r.trend_pct,keyword_variants:r.keyword_variants}}).sort(function(a,b){return(a.brand+'|'+a.model).localeCompare(b.brand+'|'+b.model)})}
function verify(data,evidence,now){var errors=[];function need(ok,message){if(!ok)errors.push(message)}try{
if(!core||!data||!evidence)return{ok:false,errors:['evidence_missing']};var s=data.source||{},p=data.period||{},at=now==null?Date.now():now;
need(data.schema_version===1&&data.status==='verified'&&data.validation&&data.validation.verified===true,'public_status');
need(s.acquisition==='google_ads_api'&&s.provider==='Google Ads Keyword Planner'&&s.network==='Google'&&s.metric==='Avg. monthly searches'&&s.approximate===true,'public_source');
need(evidence.schema_version===1&&evidence.country==='RO'&&data.country==='RO'&&s.geography==='Romania'&&evidence.network==='GOOGLE_SEARCH','evidence_scope');
need(/^geoTargetConstants\/\d+$/.test(evidence.geo_target||'')&&evidence.geo_target===s.geo_target,'geography_mismatch');
need(evidence.collected_at===data.last_updated&&evidence.api_version===s.api_version&&evidence.language_filter===s.language_filter,'metadata_mismatch');
need(s.response_sha256===s.evidence_sha256&&/^[a-f0-9]{64}$/.test(s.evidence_sha256||''),'fingerprint_mismatch');
need(Array.isArray(evidence.models)&&evidence.models.length>=20&&evidence.models.length<=10000&&Array.isArray(evidence.results)&&evidence.results.length<=10000,'evidence_inventory');
if(errors.length)return{ok:false,errors:errors};var ids=new Set(),queries=new Set();evidence.models.forEach(function(m){if(!m||typeof m.brand!=='string'||typeof m.model!=='string'||typeof m.query!=='string'){errors.push('model_identity');return}var id=core.norm(m.brand)+'|'+core.norm(m.model),query=core.norm(m.query);need(core.norm(m.brand)&&core.norm(m.model)&&m.id===id&&query===core.norm(m.brand+' '+m.model),'model_query_mismatch');need(!ids.has(id)&&!queries.has(query),'duplicate_inventory');ids.add(id);queries.add(query)});
if(errors.length)return{ok:false,errors:errors};var rebuilt=core.project(evidence.models,{results:evidence.results},{collected_at:evidence.collected_at,geo_target:evidence.geo_target,response_sha256:s.evidence_sha256}),checked=core.validate(rebuilt,at);need(checked.verified,'upstream_metrics_invalid');if(!checked.verified)return{ok:false,errors:errors.concat(checked.errors)};
var end=rebuilt.period.end,lastDay=new Date(Date.UTC(Number(end.slice(0,4)),Number(end.slice(5)),0)).toISOString().slice(0,10);need(p.start===rebuilt.period.start+'-01'&&p.end===lastDay&&p.label===p.start+' — '+p.end,'period_mismatch');need(Array.isArray(data.rows)&&stable(rowView(data.rows))===stable(rowView(rebuilt.rows)),'measurements_mismatch');need(stable(data.coverage)===stable(rebuilt.coverage),'coverage_mismatch');var lastChecked=Date.parse(data.last_checked),collected=Date.parse(data.last_updated);need(Number.isFinite(lastChecked)&&lastChecked>=collected&&lastChecked<=at,'check_date');return{ok:errors.length===0,errors:errors,measured_models:rebuilt.rows.length}
}catch(_){return{ok:false,errors:['malformed_evidence']}}}
return{verify:verify};
});
