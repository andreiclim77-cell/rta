/* Shared, dependency-free validation. No mock data or fallback ranking. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RtaGooglePodTop20 = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function norm(v) { return String(v == null ? '' : v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function count(v) {
    if (typeof v !== 'number' && !(typeof v === 'string' && /^\d+$/.test(v))) return null;
    var n = Number(v); return Number.isSafeInteger(n) && n >= 0 ? n : null;
  }
  function monthIndex(v) { if (typeof v !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) return null; return Number(v.slice(0,4)) * 12 + Number(v.slice(5)) - 1; }
  function orderedSeries(values) {
    if (!Array.isArray(values) || values.length !== 12) return null;
    var rows = values.map(function (x) { return x && {month: x.month, searches: count(x.searches)}; });
    if (rows.some(function (x) { return !x || monthIndex(x.month) === null || x.searches === null; })) return null;
    rows.sort(function (a,b) { return a.month.localeCompare(b.month); });
    for (var i=1; i<rows.length; i++) if (monthIndex(rows[i].month) !== monthIndex(rows[i-1].month)+1) return null;
    return rows;
  }
  function trend(series) { var a=series[10].searches, b=series[11].searches; return a>0 ? Math.round((b-a)/a*1000)/10 : null; }
  function validate(data, now) {
    var errors=[], valid=[], seen=new Set(), variants=new Set(), source=data && data.source || {}, period=data && data.period || {};
    var at=now == null ? Date.now() : Number(now), collected=Date.parse(data && data.last_updated), checked=Date.parse(data && data.last_checked);
    var start=monthIndex(period.start), end=monthIndex(period.end), current=monthIndex(new Date(at).toISOString().slice(0,7));
    if (!data || data.schema_version !== 2 || data.status !== 'verified') errors.push('source_not_ready');
    if (!data || data.country !== 'RO' || source.geography !== 'Romania' || source.network !== 'GOOGLE_SEARCH') errors.push('wrong_scope');
    if (source.provider !== 'Google Ads Keyword Planner' || source.acquisition !== 'google_ads_api' || source.approximate !== true || !/^geoTargetConstants\/\d+$/.test(source.geo_target || '')) errors.push('wrong_source');
    if (!Number.isFinite(collected) || !Number.isFinite(checked) || collected>at || checked>at || checked<collected || at-collected>45*86400000) errors.push('collection_date_invalid_or_stale');
    if (start===null || end===null || end-start!==11 || end>=current || current-end>3 || (end!==null && at-Date.UTC(Math.floor(end/12),end%12+1,0)>65*86400000) || (Number.isFinite(collected) && end>=monthIndex(new Date(collected).toISOString().slice(0,7))) || period.label!==period.start+' — '+period.end) errors.push('period_invalid_or_stale');
    if (!/^[a-f0-9]{64}$/.test(source.response_sha256 || '')) errors.push('missing_response_fingerprint');
    var rows=data && data.rows;
    if (!Array.isArray(rows)) { errors.push('missing_rows'); rows=[]; }
    rows.forEach(function (r) {
      if (!r || typeof r.brand!=='string' || !norm(r.brand) || typeof r.model!=='string' || !norm(r.model)) { errors.push('invalid_identity'); return; }
      var key=norm(r.brand)+'|'+norm(r.model), volume=count(r.monthly_searches), series=orderedSeries(r.monthly_series);
      if (seen.has(key)) errors.push('duplicate_model'); seen.add(key);
      if (volume===null || volume<=0 || !series || series[0].month!==period.start || series[11].month!==period.end) { errors.push('invalid_volume_or_series'); return; }
      if (!Array.isArray(r.keyword_variants) || !r.keyword_variants.length || !r.keyword_variants.every(function (x) { return typeof x==='string' && norm(x); })) { errors.push('missing_keyword_evidence'); return; }
      var local=new Set(r.keyword_variants.map(norm));
      local.forEach(function (v) { if (variants.has(v)) errors.push('overlapping_keyword_groups'); variants.add(v); });
      var change=trend(series);
      if (r.trend_pct !== change) errors.push('inconsistent_trend');
      valid.push(Object.assign({},r,{monthly_searches:volume,monthly_series:series,trend_pct:change}));
    });
    valid.sort(function (a,b) { return b.monthly_searches-a.monthly_searches || (norm(a.brand+' '+a.model)<norm(b.brand+' '+b.model)?-1:1); });
    valid.forEach(function (r,i) { r.rank=i && r.monthly_searches===valid[i-1].monthly_searches ? valid[i-1].rank : i+1; });
    var coverage=data && data.coverage || {}, requested=count(coverage.models_requested);
    if (requested===null || requested<valid.length || coverage.scope!=='tracked_models_only' || coverage.exhaustive!==false) errors.push('missing_universe_disclosure');
    if (valid.length<20) errors.push('fewer_than_20_measured_models');
    return {verified:errors.length===0, errors:Array.from(new Set(errors)), rows:errors.length?[]:valid.slice(0,20), validCount:valid.length, source:source, period:period, validation:{verified:errors.length===0}, tiedBeyondCutoff:valid.length>20 ? valid.slice(20).filter(function(r){return r.monthly_searches===valid[19].monthly_searches;}).length : 0};
  }
  var MONTHS=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  function fromGoogle(result) {
    var m=result && result.keywordMetrics || {}, volume=count(m.avgMonthlySearches);
    var series=orderedSeries((m.monthlySearchVolumes || []).map(function(x){
      var month=MONTHS.indexOf(x.month)+1, year=count(x.year);
      return {month:year!==null && month>0 ? String(year)+'-'+String(month).padStart(2,'0') : '',searches:x.monthlySearches};
    }));
    return volume!==null && volume>0 && series ? {volume:volume,series:series} : null;
  }
  /* Match returned close-variant GROUPS once. Ambiguous cross-model groups are
     excluded; their entire volume is never allocated to an arbitrary model. */
  function project(models, response, meta) {
    var owners=new Map(), parsed=[], excluded={unmatched:0,ambiguous:0,invalid_metrics:0,overlap:0,period_mismatch:0};
    models.forEach(function(m){ var key=norm(m.query), a=owners.get(key)||[]; a.push(m); owners.set(key,a); });
    (response.results || []).forEach(function(r){
      var words=Array.from(new Set([r.text].concat(r.closeVariants || []).filter(function(x){return typeof x==='string' && norm(x);}))), hits=new Map();
      words.forEach(function(w){(owners.get(norm(w))||[]).forEach(function(m){hits.set(m.id,m);});});
      if (!hits.size) {excluded.unmatched++;return;}
      if (hits.size!==1) {excluded.ambiguous++;return;}
      var values=fromGoogle(r); if (!values) {excluded.invalid_metrics++;return;}
      parsed.push({model:Array.from(hits.values())[0],words:words,values:values});
    });
    var usedWords=new Map(), usedModels=new Map();
    parsed.forEach(function(p,i){p.words.forEach(function(w){var a=usedWords.get(norm(w))||[];a.push(i);usedWords.set(norm(w),a);});var a=usedModels.get(p.model.id)||[];a.push(i);usedModels.set(p.model.id,a);});
    var duplicateMetricModels=0,duplicateModelGroups=0,singleMetricModels=0,sharedVariantTerms=0,sharedVariantIndexes=new Set();
    usedModels.forEach(function(a){if(a.length>1){duplicateMetricModels++;duplicateModelGroups+=a.length;}else singleMetricModels++;});
    usedWords.forEach(function(a){if(a.length>1){sharedVariantTerms++;a.forEach(function(i){sharedVariantIndexes.add(i);});}});
    var overlapDiagnostic={metric_groups:parsed.length,unique_metric_models:usedModels.size,single_metric_models:singleMetricModels,duplicate_metric_models:duplicateMetricModels,duplicate_model_groups:duplicateModelGroups,shared_variant_terms:sharedVariantTerms,groups_with_shared_variants:sharedVariantIndexes.size};
    var bad=new Set();
    [usedWords,usedModels].forEach(function(map){map.forEach(function(a){if(a.length>1)a.forEach(function(i){bad.add(i);});});});
    var periods=new Map();
    parsed.forEach(function(p,i){if(bad.has(i))return;var k=p.values.series[0].month+'/'+p.values.series[11].month;periods.set(k,(periods.get(k)||0)+1);});
    var chosen=Array.from(periods).sort(function(a,b){return b[1]-a[1]||b[0].localeCompare(a[0]);})[0];
    var window=chosen?chosen[0].split('/'):[null,null], rows=[];
    parsed.forEach(function(p,i){
      if(bad.has(i)){excluded.overlap++;return;}
      if(p.values.series[0].month!==window[0]||p.values.series[11].month!==window[1]){excluded.period_mismatch++;return;}
      rows.push({brand:p.model.brand,model:p.model.model,query:p.model.query,monthly_searches:p.values.volume,monthly_series:p.values.series,trend_pct:trend(p.values.series),keyword_variants:p.words});
    });
    var out={schema_version:2,title:'Top 20 pod - Google Romania',country:'RO',status:'verified',last_updated:meta.collected_at,last_checked:meta.collected_at,
      source:{provider:'Google Ads Keyword Planner',acquisition:'google_ads_api',geography:'Romania',network:'GOOGLE_SEARCH',geo_target:meta.geo_target,approximate:true,response_sha256:meta.response_sha256},
      period:{start:window[0],end:window[1],label:window[0]&&window[1]?window[0]+' — '+window[1]:null},
      coverage:{scope:'tracked_models_only',exhaustive:false,models_requested:models.length,models_with_valid_series:rows.length,excluded_groups:excluded,overlap_diagnostic:overlapDiagnostic},rows:rows,
      display:{metric_label:'Medie lunară estimată Google (12 luni)',unavailable_message:'Google nu a furnizat încă minimum 20 de modele cu serii complete, comparabile și fără ambiguități.'},validation:{verified:false}};
    var check=validate(out,Date.parse(meta.collected_at));out.validation={verified:check.verified,errors:check.errors};
    if(!check.verified){out.status='insufficient_data';out.rows=[];}
    return out;
  }
  return {norm:norm,count:count,orderedSeries:orderedSeries,trend:trend,validate:validate,project:project};
});
