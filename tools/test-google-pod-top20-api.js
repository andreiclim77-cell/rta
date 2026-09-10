#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../assets/market-google-pod-top20-core');
const NOW=Date.parse('2026-09-06T13:00:00.000Z');
const meta={collected_at:new Date(NOW).toISOString(),geo_target:'geoTargetConstants/2642',response_sha256:'a'.repeat(64)};
const names=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
// Synthetic identities and metrics exist ONLY in this test file. Never written
// to data/, used as a production fallback, or represented as Google results.
const models=Array.from({length:24},(_,i)=>({id:'fixture-'+i,brand:'TEST ONLY',model:'Fixture '+i,query:'TEST ONLY Fixture '+i}));
const response={results:models.map((m,i)=>({text:m.query,closeVariants:[],keywordMetrics:{avgMonthlySearches:String(2400-i*50),monthlySearchVolumes:Array.from({length:12},(_,j)=>{const d=new Date(Date.UTC(2025,7+j,1));return{year:d.getUTCFullYear(),month:names[d.getUTCMonth()],monthlySearches:String(100+j+i)}})}}))};
const clone=x=>JSON.parse(JSON.stringify(x));
const make=()=>core.project(models,clone(response),meta);
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name)}
function invalid(name,edit){test(name,()=>{const data=make();edit(data);const result=core.validate(data,NOW);assert.equal(result.verified,false);assert.equal(result.rows.length,0)});}
test('valid source projects 24 models and displays 20',()=>{const d=make(),v=core.validate(d,NOW);assert.equal(d.status,'verified');assert.equal(v.verified,true);assert.equal(v.rows.length,20);assert.equal(v.rows[0].rank,1)});
for(const bad of [null,'',false,true,'  ','1,000',-1,1.5,Infinity,Number.MAX_SAFE_INTEGER+1])test('strict numeric input '+String(bad),()=>assert.equal(core.count(bad),null));
test('real numeric zero is distinct from missing',()=>{assert.equal(core.count(0),0);assert.equal(core.count('0'),0)});
invalid('null volume is never zero',d=>{d.rows[0].monthly_searches=null});
invalid('null monthly observation is rejected',d=>{d.rows[0].monthly_series[0].searches=null});
invalid('no fake 0% for absent trend',d=>{d.rows[0].trend_pct=null});
invalid('no fake trend arithmetic',d=>{d.rows[0].trend_pct=999});
invalid('wrong country',d=>{d.country='US'});
invalid('search partners not mixed with Google Search',d=>{d.source.network='GOOGLE_SEARCH_AND_PARTNERS'});
invalid('unknown provider',d=>{d.source.provider='Retail bestseller'});
invalid('manual status flag cannot replace evidence',d=>{delete d.source.response_sha256;d.validation.verified=true});
invalid('future collection',d=>{d.last_updated='2027-01-01T00:00:00.000Z'});
invalid('stale collection',d=>{d.last_updated='2026-05-01T00:00:00.000Z'});
invalid('missing collection date',d=>{d.last_updated=null});
invalid('data cannot post-date collection',d=>{d.last_updated='2026-07-31T23:59:59.000Z'});
invalid('inconsistent display period',d=>{d.period.label='all time'});
invalid('incomplete series',d=>{d.rows[0].monthly_series.pop()});
invalid('duplicate month',d=>{d.rows[0].monthly_series[1].month=d.rows[0].monthly_series[0].month});
invalid('different row periods',d=>{d.rows[0].monthly_series[0].month='2020-08'});
invalid('duplicate canonical model',d=>{d.rows[1].brand=d.rows[0].brand;d.rows[1].model=d.rows[0].model});
invalid('canonical query must remain in Google evidence',d=>{d.rows[0].keyword_variants=['unrelated alias']});
invalid('unmeasured rows cannot pad a top 20',d=>{d.rows=d.rows.slice(0,19)});
invalid('universe coverage must be explicit',d=>{delete d.coverage});
test('shared close variants across distinct canonical rows remain valid',()=>{const d=make();d.rows[0].keyword_variants.push('SHARED NONCANONICAL ALIAS');d.rows[1].keyword_variants.push('SHARED NONCANONICAL ALIAS');const v=core.validate(d,NOW);assert.equal(v.verified,true);assert.equal(v.rows.length,20)});
test('equal volumes share rank',()=>{const d=make();d.rows[1].monthly_searches=d.rows[0].monthly_searches;const v=core.validate(d,NOW);assert.equal(v.rows[0].rank,v.rows[1].rank);assert.equal(v.rows[2].rank,3)});
test('zero baseline produces null, never infinity or 0%',()=>{const d=make();d.rows[0].monthly_series[10].searches=0;d.rows[0].trend_pct=null;const v=core.validate(d,NOW);assert.equal(v.verified,true);assert.equal(v.rows[0].trend_pct,null)});
test('cross-model Google group is excluded',()=>{const r=clone(response);r.results[0].closeVariants=[models[1].query];r.results.splice(1,1);const d=core.project(models,r,meta);assert.equal(d.coverage.excluded_groups.ambiguous,1);assert.equal(d.rows.length,22)});
test('shared noncanonical Google variants do not discard distinct models',()=>{const r=clone(response);r.results[0].closeVariants=['SHARED NONCANONICAL ALIAS'];r.results[1].closeVariants=['SHARED NONCANONICAL ALIAS'];const d=core.project(models,r,meta);assert.equal(d.status,'verified');assert.equal(d.rows.length,24);assert.equal(d.coverage.overlap_diagnostic.shared_variant_terms,1);assert.equal(d.coverage.overlap_diagnostic.groups_with_shared_variants,2)});
test('duplicate identical Google groups are selected once, never summed',()=>{const r=clone(response);r.results.push(clone(r.results[0]));const d=core.project(models,r,meta);assert.equal(d.status,'verified');assert.equal(d.coverage.excluded_groups.overlap,1);assert.equal(d.coverage.overlap_diagnostic.duplicate_groups_suppressed,1);assert.equal(d.rows.length,24);assert.equal(d.rows.find(x=>x.model===models[0].model).monthly_searches,2400)});
test('exact Google primary text wins over a fallback close-variant group',()=>{const r=clone(response),alt=clone(r.results[0]);alt.text='TEST ONLY alternative alias';alt.closeVariants=[models[0].query];alt.keywordMetrics.avgMonthlySearches='9999';r.results.push(alt);const d=core.project(models,r,meta);assert.equal(d.status,'verified');assert.equal(d.coverage.excluded_groups.overlap,1);assert.equal(d.rows.find(x=>x.model===models[0].model).monthly_searches,2400)});
test('conflicting equally preferred Google groups exclude the model instead of summing',()=>{const r=clone(response),dup=clone(r.results[0]);dup.keywordMetrics.avgMonthlySearches='9999';dup.keywordMetrics.monthlySearchVolumes[0].monthlySearches='999';r.results.push(dup);const d=core.project(models,r,meta);assert.equal(d.status,'verified');assert.equal(d.coverage.overlap_diagnostic.conflicting_metric_models,1);assert.equal(d.coverage.excluded_groups.overlap,2);assert.equal(d.rows.length,23);assert.equal(d.rows.some(x=>x.model===models[0].model),false)});
test('no Google response means no ranking',()=>{const d=core.project(models,{results:[]},meta);assert.equal(d.status,'insufficient_data');assert.deepEqual(d.rows,[])});
test('raw missing average is not zero',()=>{const r=clone(response);delete r.results[0].keywordMetrics.avgMonthlySearches;const d=core.project(models,r,meta);assert.equal(d.rows.length,23)});
test('tie at cutoff is disclosed',()=>{const d=make();d.rows.forEach(r=>r.monthly_searches=100);const v=core.validate(d,NOW);assert.equal(v.rows.length,20);assert.equal(v.tiedBeyondCutoff,4);assert(v.rows.every(r=>r.rank===1))});

const collector=require('./collect-google-pod-top20');
test('publication adapter preserves current evidence-gated UI schema',()=>{const d=make(),out=collector.toPublic(d,'b'.repeat(64));assert.equal(out.schema_version,1);assert.equal(out.source.network,'Google');assert.equal(out.period.start,'2025-08-01');assert.equal(out.period.end,'2026-07-31');assert.equal(out.source.evidence_sha256,'b'.repeat(64));assert.match(out.source.evidence_file,/^\/data\/google-pod-evidence\/[a-zA-Z0-9_-]+\.json$/)});
test('missing credentials never generate data',()=>{const d=collector.unavailable('configuration_required','missing',{missing_secret_names:['EXAMPLE_NAME_ONLY']});assert.equal(d.validation.verified,false);assert.equal(d.rows.length,0)});
console.log('Google Pod API checks: '+passed+' passed.');
