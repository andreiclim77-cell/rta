#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {buildSets,stable,AS_OF}=require('./build-fixtures.js');
const {OUTPUT:BASELINE_FILE,buildBaseline,stable:stableBaseline}=require('./capture-baseline.js');

const ROOT=path.resolve(__dirname,'..','..');
const FIXTURE_DIR=path.join(ROOT,'data','hype-benchmark','fixtures');
const RESULT=path.join(ROOT,'data','hype-benchmark','benchmark-result-2026-09-01.json');
const REQUIRED_CLASSES=[
  'TRUE_NEW_RELEASE','TRUE_PRELAUNCH','TRUE_RUMOR_RESOLVED_TRUE','FALSE_RELISTING','FALSE_RESTOCK',
  'FALSE_VARIANT_AS_NEW_MODEL','FALSE_BATCH_AS_NEW_MODEL','FALSE_SEARCH_SNIPPET_RELEASE',
  'FALSE_FIRST_SEEN_RELEASE','FALSE_NEW_ARRIVAL_RELEASE','FALSE_COPIED_CORROBORATION','STALE_ETA',
  'CLONE_RELEASE','ACCESSORY_RELEASE','REGIONAL_RELEASE','DATE_CONFLICT','IDENTITY_CONFLICT',
  'TRUE_ZERO_COMPLETE','UNKNOWN_INCOMPLETE_SCAN'
];

let assertions=0;
function assert(condition,message){assertions++;if(!condition)throw new Error(message)}
function read(file){return JSON.parse(fs.readFileSync(path.join(ROOT,...file.split('/')),'utf8'))}
function iso(value){return value==null||Number.isFinite(Date.parse(value))}
function unique(values){return Array.from(new Set(values))}

function verifyGeneratedFixtures(){
  const expected=buildSets();
  const goldText=fs.readFileSync(path.join(FIXTURE_DIR,'gold-set.json'),'utf8').replace(/\r\n/g,'\n');
  const adversarialText=fs.readFileSync(path.join(FIXTURE_DIR,'adversarial.json'),'utf8').replace(/\r\n/g,'\n');
  assert(goldText===stable(expected.gold),'gold-set.json drifted from its deterministic builder');
  assert(adversarialText===stable(expected.adversarial),'adversarial.json drifted from its deterministic builder');
  return[...expected.gold.cases,...expected.adversarial.cases];
}

function verifyFixtureContract(cases){
  assert(cases.length>=40,`Phase 0 needs at least 40 deterministic cases, got ${cases.length}`);
  const ids=cases.map(item=>item.id);
  assert(unique(ids).length===ids.length,'Fixture IDs must be unique');
  const adversarial=cases.filter(item=>item.adversarial).length;
  assert(adversarial/cases.length>=0.4,'At least 40% of Phase 0 fixtures must be adversarial');
  const classes=new Set(cases.map(item=>item.class));
  for(const required of REQUIRED_CLASSES)assert(classes.has(required),`Required fixture class is missing: ${required}`);
  for(const item of cases){
    assert(item.product&&item.product.model&&item.product.category,`${item.id}: product identity is incomplete`);
    assert(item.expected&&/^H[0-7]$/.test(item.expected.hStage),`${item.id}: invalid expected H-stage`);
    assert(Array.isArray(item.observations),`${item.id}: observations must be an array`);
    assert(Array.isArray(item.expected.eventTypes),`${item.id}: expected eventTypes must be an array`);
    assert(Array.isArray(item.expected.warnings),`${item.id}: expected warnings must be an array`);
    const observationIds=item.observations.map(row=>row.id);
    assert(unique(observationIds).length===observationIds.length,`${item.id}: duplicate observation ID`);
    for(const row of item.observations){
      assert(row.sourceFamily&&row.originId&&row.host&&row.url,`${item.id}/${row.id}: provenance is incomplete`);
      assert(iso(row.observedAt)&&iso(row.publishedAt)&&iso(row.claimedEventAt),`${item.id}/${row.id}: invalid date`);
      assert(row.dateSemantic,`${item.id}/${row.id}: date semantic is missing`);
    }
    const origins=unique(item.observations.map(row=>row.originId));
    assert(origins.length===item.expected.independentOrigins,`${item.id}: expected ${item.expected.independentOrigins} independent origins, got ${origins.length}`);
    const claimTypes=new Set(item.observations.map(row=>row.claimType));
    for(const eventType of item.expected.eventTypes)assert(claimTypes.has(eventType),`${item.id}: expected event ${eventType} has no observation`);
  }
  const copied=cases.find(item=>item.id==='adv-010-copied-press-release');
  const reviewer=cases.find(item=>item.id==='adv-011-reviewer-crosspost');
  assert(copied.observations.length===20&&copied.expected.independentOrigins===1,'Copied press-release fixture must collapse 20 pages to one origin');
  assert(reviewer.observations.length===3&&reviewer.expected.independentOrigins===1,'Reviewer cross-post fixture must collapse to one origin');
  const trueZero=cases.find(item=>item.class==='TRUE_ZERO_COMPLETE');
  const unknownZero=cases.find(item=>item.class==='UNKNOWN_INCOMPLETE_SCAN');
  assert(trueZero.coverage.succeeded===trueZero.coverage.planned&&trueZero.expected.disposition==='true-zero','True zero requires a complete healthy scan');
  assert(unknownZero.coverage.succeeded<unknownZero.coverage.planned&&unknownZero.expected.disposition==='unknown','Incomplete zero must remain unknown');
  return{total:cases.length,adversarial,adversarialPct:Number((adversarial/cases.length*100).toFixed(1)),classes:classes.size};
}

function verifyProtectionBindings(){
  const doc=read('data/hype-benchmark/fixtures/protection-bindings.json');
  for(const binding of doc.bindings){
    const text=fs.readFileSync(path.join(ROOT,...binding.file.split('/')),'utf8');
    assert(text.includes(binding.token),`Current protection missing: ${binding.id} (${binding.file})`);
  }
  assert(doc.intentionalDivergences.length>=4,'Intentional current/vNext divergences are not documented');
  return{bindings:doc.bindings.length,intentionalDivergences:doc.intentionalDivergences.length};
}

function loadCurrentConsolidator(){
  const filename=path.join(ROOT,'tools','consolidate-market-hype-2026.js');
  let source=fs.readFileSync(filename,'utf8').replace(/^#![^\n]*\n/,'');
  source=source.replace('const REF=snapshotReferenceMs();',`const REF=Date.parse('${AS_OF}');`);
  source=source.replace(/if\(require\.main===module\)\{[\s\S]*$/,"module.exports={inWindow,key,normalizeFromEvidence,applyPriorHistory,applyRetailEvidenceGate,normalizeConfidenceTier,mergeRows,validTarget,eventRank,isEvent,priorByKey,REF};\n");
  const module={exports:{}};
  const localRequire=request=>request.startsWith('.')?require(path.resolve(path.dirname(filename),request)):require(request);
  const factory=new Function('require','module','exports','__filename','__dirname',source);
  factory(localRequire,module,module.exports,filename,path.dirname(filename));
  return module.exports;
}

function source(url,type='retailer-direct',extra={}){
  const host=new URL(url).hostname;
  return{host,url,title:'Benchmark Product',sourceType:type,decisionEligible:true,discoveryOnly:false,eventDate:'2026-08-20T00:00:00.000Z',dateConfidence:'catalog-published-at',...extra};
}

function currentRow(extra={}){
  return{
    productName:'Phase Zero Benchmark MTL RTA',brand:'Phase Zero',category:'RTA',typology:'MTL single',window:'after',stage:'FIRST_RETAIL',stageLabel:'prima listare',eventDate:'2026-08-20T00:00:00.000Z',stageEvidenceAt:'2026-08-20T00:00:00.000Z',dateConfidence:'catalog-published-at',confidenceTier:'reported',sources:[source('https://retailer-one.example/product')],...extra
  };
}

function verifyCurrentProtections(){
  const current=loadCurrentConsolidator();
  const checks=[];
  function check(name,condition){assert(condition,`Current regression failed: ${name}`);checks.push(name)}
  check('event-inside-past-window',current.inWindow(currentRow()));
  check('future-event-inside-legacy-window',current.inWindow(currentRow({window:'before',eventDate:'2026-09-20T00:00:00.000Z'})));
  check('future-eta-over-30-days-is-currently-excluded',!current.inWindow(currentRow({window:'before',eventDate:'2026-11-29T00:00:00.000Z'})));
  check('past-event-over-30-days-is-excluded',!current.inWindow(currentRow({eventDate:'2026-07-20T00:00:00.000Z'})));
  const gated=current.applyRetailEvidenceGate(currentRow());
  check('single-retailer-is-public-signal',gated.confidenceTier==='public-signal'&&gated.signalKind==='single-retailer-listing');
  const corroborated=current.applyRetailEvidenceGate(currentRow({sources:[source('https://retailer-one.example/product'),source('https://retailer-two.example/product')]}));
  check('two-retailer-hosts-survive-current-gate',corroborated.confidenceTier==='reported');
  const relisting=currentRow({productName:'Phase Zero Historical MTL RTA'});
  current.priorByKey.set(current.key(relisting),{productName:relisting.productName,brand:relisting.brand,category:'RTA',earliestKnownAt:'2025-01-10T00:00:00.000Z',sourceUrl:'https://archive.example/historical',evidence:'historic fixture'});
  const demoted=current.applyPriorHistory(relisting);
  check('prior-history-demotes-relisting',demoted.confidenceTier==='public-signal'&&demoted.signalKind==='recent-listing-known-model'&&demoted.knownBeforeWindowAt==='2025-01-10T00:00:00.000Z');
  const promotion=current.normalizeFromEvidence(currentRow({dateConfidence:null,sources:[source('https://retailer-one.example/campaign','retailer-promotion',{dateConfidence:'dated-retail-campaign',stage:'campaign'})]}));
  check('retail-campaign-is-public-signal',promotion.confidenceTier==='public-signal'&&promotion.signalKind==='dated-retail-promotion');
  const normalized=current.normalizeConfidenceTier(currentRow({confidenceTier:null,dateConfidence:'explicit'}));
  check('explicit-date-normalizes-to-reported',normalized.confidenceTier==='reported');
  const merged=current.mergeRows(currentRow({window:'before',stage:'TEASER',eventDate:'2026-08-25T00:00:00.000Z'}),currentRow({window:'after',stage:'FIRST_RETAIL',eventDate:'2026-08-27T00:00:00.000Z'}));
  check('current-merge-records-only-compact-lifecycle-list',merged.lifecycleEvidence.includes('TEASER')&&merged.lifecycleEvidence.includes('FIRST_RETAIL')&&typeof merged.eventDate==='string');
  check('valid-rta-product-survives-category-gate',current.validTarget(currentRow(),false));
  check('liquid-with-rta-copy-is-rejected',!current.validTarget(currentRow({productName:'RTA Tobacco Longfill'}),false));
  return{checks:checks.length,names:checks};
}

function verifyWindowReference(){
  const window=require(path.join(ROOT,'tools','hype-window-reference-2026.js'));
  const checks=[];
  function check(name,condition){assert(condition,`Window regression failed: ${name}`);checks.push(name)}
  check('winter-0600-bucharest-is-0400-utc',new Date(window.snapshotReferenceMs(Date.parse('2026-01-15T08:00:00.000Z'))).toISOString()==='2026-01-15T04:00:00.000Z');
  check('summer-0600-bucharest-is-0300-utc',new Date(window.snapshotReferenceMs(Date.parse('2026-07-15T08:00:00.000Z'))).toISOString()==='2026-07-15T03:00:00.000Z');
  check('before-0600-uses-previous-calendar-day',new Date(window.snapshotReferenceMs(Date.parse('2026-07-15T01:30:00.000Z'))).toISOString()==='2026-07-14T03:00:00.000Z');
  check('dst-start-day-reference-is-stable',new Date(window.snapshotReferenceMs(Date.parse('2026-03-29T05:00:00.000Z'))).toISOString()==='2026-03-29T03:00:00.000Z');
  return{checks:checks.length,names:checks};
}

function verifyBaseline(strictBaseline=false){
  assert(fs.existsSync(BASELINE_FILE),'Baseline file is missing');
  const expected=fs.readFileSync(BASELINE_FILE,'utf8').replace(/\r\n/g,'\n');
  const frozen=JSON.parse(expected);
  assert(frozen.phase==='HYPE vNext Phase 0','Frozen baseline has the wrong phase');
  assert(frozen.invariants&&frozen.invariants.benchmarkIsDeterministic===true,'Frozen baseline lost its deterministic benchmark invariant');
  assert(frozen.invariants&&frozen.invariants.publicBehaviorChanged===false,'Frozen baseline must preserve current public behavior');
  assert(Array.isArray(frozen.uiScreenshots)&&frozen.uiScreenshots.length>=2,'Frozen baseline must retain desktop and mobile UI evidence');
  assert(frozen.inventory&&frozen.inventory.files>=70,'Frozen baseline inventory is unexpectedly incomplete');
  assert(frozen.dataContracts&&Object.keys(frozen.dataContracts).length>=10,'Frozen baseline data contracts are unexpectedly incomplete');
  if(strictBaseline){
    const actual=stableBaseline(buildBaseline());
    assert(expected===actual,'Strict historical baseline drift detected');
    return'HYPE Phase 0 strict historical baseline matches current implementation and data contracts.';
  }
  return'HYPE Phase 0 frozen contract is intact; mutable daily snapshots are validated by semantic gates.';
}

function main(){
  process.chdir(ROOT);
  const strictBaseline=process.argv.includes('--strict-baseline');
  const cases=verifyGeneratedFixtures();
  const fixtureSummary=verifyFixtureContract(cases);
  const protectionBindings=verifyProtectionBindings();
  const currentProtections=verifyCurrentProtections();
  const windowReference=verifyWindowReference();
  const baseline=verifyBaseline(strictBaseline);
  const result={
    schemaVersion:1,
    phase:'HYPE vNext Phase 0',
    asOf:AS_OF,
    status:'PASS',
    assertions,
    fixtures:fixtureSummary,
    protectionBindings,
    currentProtections,
    windowReference,
    baseline,
    benchmarkMode:strictBaseline?'strict-historical':'daily-safe',
    note:'Target fixture expectations freeze the vNext contract; daily-safe mode accepts ordinary snapshot refreshes while semantic protection gates remain mandatory.'
  };
  if(process.argv.includes('--write-report'))fs.writeFileSync(RESULT,stable(result),'utf8');
  console.log(`HYPE Phase 0 benchmark PASS: ${assertions} assertions; ${fixtureSummary.total} fixtures (${fixtureSummary.adversarialPct}% adversarial); ${currentProtections.checks} current protection checks.`);
}

try{main()}catch(error){console.error(error.stack||error);process.exit(1)}
