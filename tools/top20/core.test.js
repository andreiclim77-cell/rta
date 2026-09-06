'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const Core=require('../../assets/market-top20-core.js'),Source=require('./google-source.js'),{fixture,NOW}=require('./fixtures.js');
const build=b=>Core.build(b,{now:NOW,allowTest:true});
for(const v of [null,undefined,'',' ',true,false,[],{},-1,NaN,Infinity,'100-1000','1e3','12.5',1.1,Number.MAX_SAFE_INTEGER+1])test('reject count '+String(v),()=>assert.equal(Core.count(v),null));
for(const v of [0,25,'0','2500'])test('accept count '+typeof v+' '+v,()=>assert.equal(Core.count(v),Number(v)));
test('test rows cannot be published',()=>assert.throws(()=>Core.build(fixture(),{now:NOW}),/TEST_DATA_REJECTED/));
test('sort ranks and trend from raw months',()=>{const d=build(fixture());assert.equal(d.status,'ready');assert.equal(d.rows.length,20);assert.equal(d.rows[0].model,'Model 24');assert.equal(d.rows[0].monthly_searches,2610);assert.equal(d.rows[0].trend_pct,100*10/2600);assert.equal(d.month,'2026-08')});
for(const [name,change,code] of [
 ['country',b=>b.request.country='US','INVALID_SCOPE'],['partners',b=>b.request.network='GOOGLE_SEARCH_AND_PARTNERS','INVALID_SCOPE'],['language',b=>b.request.language='ro','INVALID_SCOPE'],
 ['provider',b=>b.source.provider='Google Trends','INVALID_SOURCE'],['id',b=>delete b.source.request_id,'MISSING_GOOGLE_REQUEST_ID'],
 ['google geo',b=>b.request.google_geo.countryCode='US','UNCONFIRMED_GOOGLE_GEO'],['raw target',b=>b.request.google_request.geoTargetConstants=['geoTargetConstants/2840'],'GOOGLE_REQUEST_SCOPE_MISMATCH'],
 ['raw network',b=>b.request.google_request.keywordPlanNetwork='GOOGLE_SEARCH_AND_PARTNERS','GOOGLE_REQUEST_SCOPE_MISMATCH'],['raw language',b=>b.request.google_request.language='languageConstants/1000','GOOGLE_REQUEST_SCOPE_MISMATCH'],
 ['raw period',b=>b.request.google_request.historicalMetricsOptions.yearMonthRange.end.month='JULY','GOOGLE_REQUEST_PERIOD_MISMATCH'],['raw keywords',b=>b.request.google_request.keywords.pop(),'GOOGLE_REQUEST_KEYWORDS_MISMATCH'],
 ['future retrieval',b=>b.source.retrieved_at='2026-09-09T00:00:00.000Z','INVALID_RETRIEVAL_DATE'],['future month',b=>b.request.period.end='2026-09','INVALID_PERIOD'],
 ['invalid date',b=>b.source.retrieved_at='2026-02-31T00:00:00.000Z','INVALID_RETRIEVAL_DATE'],['period length',b=>b.request.period.start='2025-10','INVALID_PERIOD'],
 ['accessory',b=>b.catalog[0].category='REPLACEMENT_POD','NOT_A_POD_DEVICE'],['duplicate model',b=>b.catalog[1].id=b.catalog[0].id,'DUPLICATE_MODEL'],['duplicate alias',b=>b.catalog[1].keywords=b.catalog[0].keywords,'OVERLAPPING_KEYWORDS'],
 ['negative',b=>b.results[0].keywordMetrics.monthlySearchVolumes[11].monthlySearches=-1,'INVALID_SEARCH_VOLUME'],['boolean',b=>b.results[0].keywordMetrics.monthlySearchVolumes[11].monthlySearches=true,'INVALID_SEARCH_VOLUME'],
 ['duplicate month',b=>b.results[0].keywordMetrics.monthlySearchVolumes.push(b.results[0].keywordMetrics.monthlySearchVolumes[0]),'DUPLICATE_MONTH'],
 ['current-month data',b=>b.results[0].keywordMetrics.monthlySearchVolumes.push({year:2026,month:'SEPTEMBER',monthlySearches:100}),'INCOMPLETE_CURRENT_MONTH']
])test('reject '+name,()=>{const b=fixture();change(b);assert.throws(()=>build(b),new RegExp(code))});
test('null volume is missing, not zero',()=>{const b=fixture();b.results[0].keywordMetrics.monthlySearchVolumes[11].monthlySearches=null;const d=build(b);assert.equal(d.coverage.missing_models,1);assert.equal(d.all_rows[0].monthly_searches,null)});
test('absent trend is not 0%',()=>{const b=fixture();delete b.results[24].keywordMetrics.monthlySearchVolumes[10].monthlySearches;assert.equal(build(b).rows[0].trend_pct,null)});
test('zero baseline is not infinite growth',()=>{const b=fixture();b.results[24].keywordMetrics.monthlySearchVolumes[10].monthlySearches=0;assert.equal(build(b).rows[0].trend_pct,null)});
test('real zero is counted separately',()=>{const b=fixture();b.results[0].keywordMetrics.monthlySearchVolumes[11].monthlySearches=0;const d=build(b);assert.equal(d.coverage.zero_models,1);assert.equal(d.coverage.missing_models,0)});
test('19 rows cannot become top 20',()=>{const b=fixture();b.results=b.results.slice(0,19);assert.equal(build(b).status,'insufficient_data')});
test('no data is not a zero-valued top',()=>{const b=fixture();b.results=[];assert.equal(build(b).status,'insufficient_data')});
test('duplicate Google group counted once',()=>{const b=fixture();b.results.push(structuredClone(b.results[0]));assert.equal(build(b).all_rows[0].monthly_searches,210)});
test('conflicting duplicate blocks publication',()=>{const b=fixture();const r=structuredClone(b.results[0]);r.keywordMetrics.monthlySearchVolumes[11].monthlySearches=9999;b.results.push(r);assert.throws(()=>build(b),/CONFLICTING_DUPLICATE/)});
test('same model grouped aliases are not double counted',()=>{const b=fixture();b.catalog[0].keywords.push('test alias');b.request.google_request.keywords.push('test alias');b.results[0].closeVariants=['test alias'];assert.equal(build(b).all_rows[0].monthly_searches,210)});
test('unreturned alias excludes whole model',()=>{const b=fixture();b.catalog[0].keywords.push('unreturned alias');b.request.google_request.keywords.push('unreturned alias');assert.equal(build(b).all_rows[0].monthly_searches,null)});
test('cross-model Google cluster is ambiguous',()=>{const b=fixture();b.results[0].closeVariants=[b.results[1].text];b.results.splice(1,1);const d=build(b);assert.equal(d.coverage.ambiguous_models,2);assert.equal(d.coverage.missing_models,2)});
test('overlapping Google groups rejected',()=>{const b=fixture();b.results[0].closeVariants=[b.results[1].text];assert.throws(()=>build(b),/OVERLAPPING_GOOGLE_GROUPS/)});
test('ties share rank and disclose cutoff',()=>{const b=fixture();b.results.forEach(r=>r.keywordMetrics.monthlySearchVolumes[11].monthlySearches=100);const d=build(b);assert.ok(d.rows.every(r=>r.rank===1&&r.tied));assert.equal(d.cutoff_ties_omitted,5)});
test('lagged month chosen explicitly',()=>{const b=fixture();b.results.forEach(r=>r.keywordMetrics.monthlySearchVolumes.pop());assert.equal(build(b).month,'2026-07')});
test('historical selection and stale warning',()=>{const d=Core.build(fixture(),{now:NOW,allowTest:true,month:'2025-09'});assert.equal(d.rows[0].previous_searches,null);assert.equal(d.stale,true)});
test('out-of-period selection rejected',()=>assert.throws(()=>Core.build(fixture(),{now:NOW,allowTest:true,month:'2024-01'}),/MONTH_OUTSIDE_PERIOD/));
test('verified true is not a source',()=>assert.throws(()=>Core.validateManifest({schema_version:2,status:'ready',verified:true}),/INVALID_EVIDENCE_PATH/));
test('no data manifest accepted without a ranking',()=>assert.equal(Core.validateManifest({schema_version:2,status:'source_not_connected'}),false));
test('external evidence and traversal rejected',()=>{for(const evidence_path of ['https://evil.example/data.json','/data/../a.json'])assert.throws(()=>Core.validateManifest({schema_version:2,status:'ready',evidence_path}),/INVALID_EVIDENCE_PATH/)});
test('CSV parser handles quotes delimiters and newline',()=>assert.deepEqual(Source.parseDelimited('a,b\r\n"x,y","z""q"\r\n',','),[['a','b'],['x,y','z"q']]));
test('CSV parser rejects broken quoting',()=>assert.throws(()=>Source.parseDelimited('a,"b',','),/UNCLOSED_CSV_QUOTE/));
test('locale-specific integer parsing',()=>{assert.equal(Source.parseCount('1.000','ro-RO'),1000);assert.equal(Source.parseCount('1,000','en-US'),1000);assert.equal(Source.parseCount('—','ro-RO'),null);assert.throws(()=>Source.parseCount('1,000','ro-RO'),/UNSUPPORTED/);assert.throws(()=>Source.parseCount('100-1K','en-US'),/UNSUPPORTED/)});
test('month headers in English and Romanian',()=>{assert.equal(Source.columnMonth('Searches: Jul 2026'),'2026-07');assert.equal(Source.columnMonth('Căutări: iul. 2026'),'2026-07')});
test('CSV original source preserved and reviewed',()=>{
 const b=fixture(),header=['Keyword',...Array.from({length:12},(_,i)=>{const m=Core.shift('2025-09',i);return 'Searches: '+Core.MONTHS[Number(m.slice(5))-1]+' '+m.slice(0,4)})];
 const csv=Core.csv([header,...b.catalog.map((m,i)=>[m.keywords[0],...Array(12).fill((i+1)*100)])]);
 const c={number_locale:'en-US',start:'2025-09',end:'2026-08',retrieved_at:NOW,reviewed_by:'TEST REVIEWER',country:'RO',network:'GOOGLE_SEARCH',language:'all',scope_confirmed:true};
 const imported=Source.importCsv(Buffer.from(csv),b.catalog,c);imported.test_fixture=true;assert.equal(build(imported).status,'ready');assert.equal(imported.source.original_sha256,Source.hash(Buffer.from(csv)));
 assert.throws(()=>Source.importCsv(Buffer.from(csv),b.catalog,{...c,scope_confirmed:false}),/EXPORT_SCOPE/);
});
test('test fixtures never written to live manifest',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'top20-test-'));try{assert.throws(()=>Source.publish(fixture(),root),/TEST_DATA_REJECTED/);assert.equal(fs.existsSync(path.join(root,'data/google-pod-top20-2026.json')),false)}finally{fs.rmSync(root,{recursive:true,force:true})}});
test('CSV export escapes formulas',()=>assert.match(Core.csv([['=1+1','a"b']]),/^"'=1\+1","a""b"$/));
test('no credentials is a clear configuration state',()=>assert.deepEqual(Source.configuration({}),{configured:false,missing:['GOOGLE_ADS_DEVELOPER_TOKEN','GOOGLE_ADS_CLIENT_ID','GOOGLE_ADS_CLIENT_SECRET','GOOGLE_ADS_REFRESH_TOKEN','GOOGLE_ADS_CUSTOMER_ID'],use_approved:false}));
test('API collector never contacts Google without authorization',async()=>{let calls=0;await assert.rejects(()=>Source.collect(fixture().catalog,{},()=>{calls++}),/GOOGLE_SOURCE_NOT_CONFIGURED/);assert.equal(calls,0)});
test('API request uses confirmed Romania, Google only, all languages',async()=>{
 const b=fixture(),calls=[],env={GOOGLE_ADS_DEVELOPER_TOKEN:'TEST-TOKEN',GOOGLE_ADS_CLIENT_ID:'TEST-CLIENT',GOOGLE_ADS_CLIENT_SECRET:'TEST-SECRET',GOOGLE_ADS_REFRESH_TOKEN:'TEST-REFRESH',GOOGLE_ADS_CUSTOMER_ID:'1234567890',GOOGLE_ADS_USE_APPROVED:'true'};
 const mock=async(url,opts)=>{calls.push({url,opts});if(url.includes('oauth2'))return new Response(JSON.stringify({access_token:'TEST-ACCESS'}));if(url.endsWith('/googleAds:search'))return new Response(JSON.stringify({results:[{geoTargetConstant:b.request.google_geo}]}));return new Response(JSON.stringify({results:b.results}),{headers:{'request-id':'TEST-REQUEST'}})};
 const result=await Source.collect(b.catalog,env,mock);
 assert.equal(calls.length,3);assert.equal(result.request.google_request.keywordPlanNetwork,'GOOGLE_SEARCH');assert.equal(result.request.google_request.language,undefined);assert.deepEqual(result.request.google_request.geoTargetConstants,['geoTargetConstants/2642']);assert.equal(result.source.request_id,'TEST-REQUEST');assert.ok(!JSON.stringify(result).includes('TEST-SECRET'));assert.ok(!JSON.stringify(result).includes('1234567890'));
});
test('non-Romania target is rejected rather than defaulting worldwide',async()=>{
 const env={GOOGLE_ADS_DEVELOPER_TOKEN:'T',GOOGLE_ADS_CLIENT_ID:'T',GOOGLE_ADS_CLIENT_SECRET:'T',GOOGLE_ADS_REFRESH_TOKEN:'T',GOOGLE_ADS_CUSTOMER_ID:'1234567890',GOOGLE_ADS_USE_APPROVED:'true'};
 await assert.rejects(()=>Source.collect(fixture().catalog,env,async url=>new Response(JSON.stringify(url.includes('oauth2')?{access_token:'T'}:{results:[]}))),/ROMANIA_TARGET_NOT_CONFIRMED/);
});
