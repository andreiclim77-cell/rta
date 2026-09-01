#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {buildSets,stable,AS_OF}=require('./build-fixtures.js');
const {OUTPUT:BASELINE_FILE,buildBaseline,stable:stableBaseline}=require('./capture-baseline.js');

const ROOT=path.resolve(__dirname,'..','..');
const FIXTURE_DIR=path.join(ROOT,'data','analiza-benchmark','fixtures');
const RESULT=path.join(ROOT,'data','analiza-benchmark','benchmark-result-2026-09-01.json');
const REQUIRED_REQUIREMENTS=[
  'active-retailer','same-operator-two-storefronts','dead-retailer','cross-border','marketplace-only','b2b-only','source-outage','parser-drift','moved-url',
  'canonical-product','brand-alias','seo-noise','color-variant','bundle','revision','clone-authentic','same-family-different-product',
  'explicit-counter','counter-baseline','counter-delta','counter-reset','generic-order','bestseller','unclear-ranking','category-rank-vs-store','listing-not-sale','stock-not-sale',
  'regular-price','promo-price','strikethrough-price','installment-false-price','ron-decimal','bundle-price','oos-stale-price','pod-pack-normalization',
  'in-stock','out-of-stock','preorder','backorder','removed-page','parser-failure-not-oos','retailer-outage-not-oos',
  'pod-device','replacement-pod','cartridge','coil','integrated-coil-pod','closed-platform','aio','boro-host','boro-bridge','incompatible-generations','broad-consumables','narrow-consumables',
  'romania-google','global-youtube','romanian-community','global-community','guide-intent','hype-without-ro','romanian-demand-without-local','source-onboarding-no-momentum','source-offboarding-no-decline'
];

let assertions=0;
function assert(condition,message){assertions++;if(!condition)throw new Error(message)}
function read(file){return JSON.parse(fs.readFileSync(path.join(ROOT,...file.split('/')),'utf8'))}
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
  assert(cases.length>=60,`Phase 0 needs at least 60 deterministic cases, got ${cases.length}`);
  assert(unique(cases.map(item=>item.id)).length===cases.length,'Fixture IDs must be unique');
  const adversarial=cases.filter(item=>item.adversarial).length;
  assert(adversarial/cases.length>=0.4,'At least 40% of Phase 0 fixtures must be adversarial');
  const requirements=new Set(cases.map(item=>item.requirement));
  for(const requirement of REQUIRED_REQUIREMENTS)assert(requirements.has(requirement),`Required fixture is missing: ${requirement}`);
  const families=new Set(cases.map(item=>item.family));
  for(const family of['retail-source','product-identity','sales-ranking','price','availability','pod','demand'])assert(families.has(family),`Fixture family is missing: ${family}`);
  for(const item of cases){
    assert(/^gold-|^adv-/.test(item.id),`${item.id}: invalid fixture ID`);
    assert(item.title&&item.family&&item.requirement,`${item.id}: fixture metadata is incomplete`);
    assert(item.input&&typeof item.input==='object',`${item.id}: input must be an object`);
    assert(item.expected&&typeof item.expected==='object',`${item.id}: expected must be an object`);
    assert(item.adversarial===item.id.startsWith('adv-'),`${item.id}: adversarial flag and ID disagree`);
  }

  const byRequirement=requirement=>cases.find(item=>item.requirement===requirement);
  assert(byRequirement('listing-not-sale').expected.units===null,'Listing fixture must not produce units');
  assert(byRequirement('stock-not-sale').expected.units===null,'Stock fixture must not produce units');
  assert(byRequirement('counter-baseline').expected.delta===null,'First counter must be baseline only');
  assert(byRequirement('counter-delta').expected.delta===6,'Positive counter delta fixture is incorrect');
  assert(byRequirement('counter-reset').expected.delta===null,'Counter reset must not produce a delta');
  assert(byRequirement('generic-order').expected.rejected===true,'Generic order count must be rejected');
  assert(byRequirement('source-outage').expected.zeroIsTrustworthy===false,'Source outage cannot be a trustworthy zero');
  assert(byRequirement('parser-failure-not-oos').expected.availability==='UNKNOWN','Parser failure cannot become out of stock');
  assert(byRequirement('clone-authentic').expected.collapsed===false,'Clone/authentic target identities must remain separate');
  assert(byRequirement('replacement-pod').expected.device===false,'Replacement pod must not be a device');
  assert(byRequirement('coil').expected.device===false,'Coil must not be a device');
  assert(byRequirement('global-youtube').expected.eligibleForRomanianDemand===false,'Global YouTube cannot enter Romanian demand');
  assert(byRequirement('hype-without-ro').expected.buyClaim===false,'Global HYPE cannot create a Romanian BUY claim alone');
  assert(byRequirement('source-onboarding-no-momentum').expected.momentum===0,'Source onboarding cannot create momentum');

  return{
    total:cases.length,
    adversarial,
    adversarialPct:Number((adversarial/cases.length*100).toFixed(1)),
    families:families.size,
    requirements:requirements.size
  };
}

function verifyProtectionBindings(){
  const document=read('data/analiza-benchmark/fixtures/protection-bindings.json');
  for(const binding of document.bindings){
    const text=fs.readFileSync(path.join(ROOT,...binding.file.split('/')),'utf8');
    assert(text.includes(binding.token),`Current protection missing: ${binding.id} (${binding.file})`);
  }
  assert(document.intentionalDivergences.length>=7,'Current/vNext divergences are not documented completely');
  return{bindings:document.bindings.length,intentionalDivergences:document.intentionalDivergences.length};
}

function loadCounterFunctions(){
  const filename=path.join(ROOT,'tools','probe-market-sales-counters-2026.js');
  let source=fs.readFileSync(filename,'utf8').replace(/^#![^\n]*\n/,'');
  const cut=source.indexOf('async function main(){');
  if(cut<0)throw new Error('Cannot isolate current counter functions');
  source=source.slice(0,cut)+'\nmodule.exports={explicitCounter,addDelta,validHistoricCounter,key};\n';
  const module={exports:{}};
  const factory=new Function('require','module','exports','__filename','__dirname',source);
  factory(require,module,module.exports,filename,path.dirname(filename));
  return module.exports;
}

function verifyCurrentSemantics(){
  const checks=[];
  function check(name,condition){assert(condition,`Current regression failed: ${name}`);checks.push(name)}

  const counters=loadCounterFunctions();
  const explicit=counters.explicitCounter('<div>S-au vandut 124 bucati</div>');
  check('explicit-product-units-counter-detected',explicit&&explicit.value===124);
  check('generic-site-order-count-rejected',counters.explicitCounter('<p>Peste 25000 comenzi livrate</p>')===null);
  const baseline=counters.addDelta({reviewCount:12,viewCount:100,wishlistCount:4},null);
  check('first-demand-counter-is-baseline',baseline.baseline===true&&baseline.reviewCountDelta===null&&baseline.viewCountDelta===null);
  const delta=counters.addDelta({reviewCount:14,viewCount:111,wishlistCount:4},{reviewCount:12,viewCount:100,wishlistCount:4});
  check('positive-demand-counter-delta',delta.reviewCountDelta===2&&delta.viewCountDelta===11&&delta.wishlistCountDelta===0);
  const reset=counters.addDelta({reviewCount:2,viewCount:8,wishlistCount:1},{reviewCount:20,viewCount:800,wishlistCount:10});
  check('counter-reset-yields-null-deltas',reset.reviewCountDelta===null&&reset.viewCountDelta===null&&reset.wishlistCountDelta===null);
  check('generic-order-history-is-invalid',!counters.validHistoricCounter({unitsSold:40,counterEvidence:'40 comenzi'}));
  check('explicit-unit-history-is-valid',counters.validHistoricCounter({unitsSold:40,counterEvidence:'40 bucati vandute'}));

  const canonical=require(path.join(ROOT,'tools','market-product-canonical-2026.js'));
  const black=canonical.canonicalizeProduct({brand:'OXVA',product:'OXVA Xlim Pro 2 Black Pod Kit'});
  const silver=canonical.canonicalizeProduct({brand:'OXVA',product:'OXVA Xlim Pro 2 Silver Pod Kit'});
  check('colour-variants-share-current-key',black.key===silver.key);
  const authentic=canonical.canonicalizeProduct({brand:'Centenary Mods',product:'Centenary Mods Diplomat V1.5 Authentic RTA'});
  const clone=canonical.canonicalizeProduct({brand:'Centenary Mods',product:'Centenary Mods Diplomat V1.5 Style Clone RTA'});
  check('current-clone-authentic-collapse-risk-is-frozen',authentic.key===clone.key);

  const pod=require(path.join(ROOT,'tools','market-pod-classifier-2026.js'));
  check('current-pod-device-classifies',Boolean(pod.classifyPodProduct('Vaporesso XROS 4 Pod Kit')));
  check('current-replacement-pod-is-dropped',pod.classifyPodProduct('Vaporesso XROS replacement pod 0.8 ohm')===null);
  check('current-coil-is-dropped',pod.classifyPodProduct('Voopoo PnP X coil 0.3 ohm 5-pack')===null);

  const registry=read('data/market-retailers-2026.json');
  const operatorMap=canonical.retailerOperatorMap(registry);
  const operatorGroups=new Map();
  for(const retailer of registry.retailers||[]){const operator=operatorMap.get(retailer.id);operatorGroups.set(operator,(operatorGroups.get(operator)||0)+1)}
  check('storefront-and-operator-units-are-distinct',operatorMap.size===22&&operatorGroups.size===21&&[...operatorGroups.values()].some(value=>value===2));

  const sales=read('data/market-sales-2026.json');
  check('sales-file-is-valid-and-nonempty',Array.isArray(sales.rankings)&&sales.rankings.length>0);
  check('current-tier-a-is-zero',(sales.actualSales||[]).length===0&&Number(sales.coverage.actualUnitSalesCoveragePct)===0);
  check('national-units-and-share-remain-disabled',sales.coverage.nationalUnitsSoldAvailable===false&&sales.coverage.nationalMarketShareAvailable===false);
  check('tier-b-rankings-remain-labelled-tier-b',(sales.rankings||[]).every(row=>row.evidenceTier==='B'));

  const coverage=read('data/market-coverage-2026.json');
  check('national-100-percent-claim-is-disabled',coverage.nationalClaim&&coverage.nationalClaim.allowed===false);
  check('source-errors-are-visible',Array.isArray(coverage.coverage.sourceErrorStorefronts)&&coverage.coverage.sourceErrorStorefronts.length>0);

  const demand=read('data/market-demand-intelligence-2026.json');
  check('demand-currently-has-no-google-volume',Number(demand.coverage.productsWithGoogleVolume||0)===0);
  check('demand-currently-has-no-community-product-evidence',Number(demand.coverage.productsWithCommunityEvidence||0)===0);
  check('demand-is-rta-centric',(demand.products||[]).every(row=>/RTA|RBA|RDTA/i.test(String(row.category||''))));

  const management=read('data/market-management-2026.json');
  const first=management.periods&&management.periods['30']&&management.periods['30'].product&&management.periods['30'].product.rows&&management.periods['30'].product.rows[0];
  check('management-discloses-rank-index-not-market-share',/nu cot[aă] real[aă]/i.test(String(management.methodology&&management.methodology.observedShare||'')));
  check('ranking-only-small-test-risk-is-frozen',first&&!first.tierA&&!first.tierC&&first.unitsObserved===0&&first.action&&first.action.code==='WHITE_SPACE');
  check('first-ranked-product-has-current-presence-mismatch',first&&Number(first.bestsellerStorefronts)>0&&Number(first.listedStorefronts)===0);

  const universe=read('data/market-universe-audit-2026.json');
  check('current-universe-gate-state-is-frozen',universe.nationalUniverseGate&&universe.nationalUniverseGate.pass===true&&Number(universe.consecutiveCleanAudits)>=2);

  return{checks:checks.length,names:checks};
}

function verifyBaseline(){
  assert(fs.existsSync(BASELINE_FILE),'Baseline file is missing');
  const expected=fs.readFileSync(BASELINE_FILE,'utf8').replace(/\r\n/g,'\n');
  const current=buildBaseline();
  const actual=stableBaseline(current);
  if(expected!==actual){
    const expectedLines=expected.split('\n');
    const actualLines=actual.split('\n');
    const line=Math.max(0,Array.from({length:Math.max(expectedLines.length,actualLines.length)},(_,index)=>index)
      .find(index=>expectedLines[index]!==actualLines[index])??0);
    assert(false,`Baseline drift detected at line ${line+1}\nexpected: ${expectedLines[line]??'<missing>'}\nactual:   ${actualLines[line]??'<missing>'}`);
  }
  assert(expected===actual,'Baseline snapshot matches current protected behavior');
  assert(current.uiScreenshots.length>=2,'Desktop and mobile baseline screenshots are required');
  assert(current.currentOutputs.sales.benchmarkTruth==='RANKING_AND_PROXY_ONLY','Sales anomaly resolution is unsafe');
  assert(current.currentOutputs.sales.actualSales===0,'Phase 0 unexpectedly found Tier-A sales rows; re-audit before changing the benchmark');
  return{
    files:current.inventory.files,
    dataContracts:Object.keys(current.dataContracts).length,
    screenshots:current.uiScreenshots.length,
    anomalyVerdict:current.anomalyResolution.verdict
  };
}

function main(){
  process.chdir(ROOT);
  const cases=verifyGeneratedFixtures();
  const fixtures=verifyFixtureContract(cases);
  const protectionBindings=verifyProtectionBindings();
  const currentSemantics=verifyCurrentSemantics();
  const baseline=verifyBaseline();
  const result={
    schemaVersion:1,
    phase:'ANALIZA ROMANIA vNext Phase 0',
    asOf:AS_OF,
    status:'PASS',
    assertions,
    fixtures,
    protectionBindings,
    currentSemantics,
    baseline,
    note:'Target fixture expectations freeze the vNext contract. Production vNext entities, scoring and projections are intentionally not implemented in Phase 0.'
  };
  if(process.argv.includes('--write-report'))fs.writeFileSync(RESULT,stable(result),'utf8');
  console.log(`ANALIZA Phase 0 benchmark PASS: ${assertions} assertions; ${fixtures.total} fixtures (${fixtures.adversarialPct}% adversarial); ${currentSemantics.checks} current checks.`);
}

try{main()}catch(error){console.error(error.stack||error);process.exit(1)}
