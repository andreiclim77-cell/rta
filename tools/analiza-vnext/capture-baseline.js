#!/usr/bin/env node
'use strict';

const crypto=require('crypto');
const fs=require('fs');
const path=require('path');

const ROOT=path.resolve(__dirname,'..','..');
const OUTPUT=path.join(ROOT,'data','analiza-benchmark','baseline-2026-09-01.json');
const BASELINE_COMMIT='5363ddb1cd4276e472fb230105e46994fb8ae2b8';
const MAIN_COMPARISON_COMMIT='2113765a4fadc3bc292050ac26e9609199eb83fe';

const DATA_FILES=[
  'data/market-retailers-2026.json',
  'data/market-retailers-national-2026.json',
  'data/market-universe-audit-2026.json',
  'data/market-universe-discovery-2026.json',
  'data/market-source-scope-2026.json',
  'data/market-sales-sources-2026.json',
  'data/market-sales-sources-discovered-2026.json',
  'data/market-2026.json',
  'data/market-coverage-2026.json',
  'data/market-sales-2026.json',
  'data/market-demand-intelligence-2026.json',
  'data/market-product-presence-2026.json',
  'data/market-management-2026.json',
  'data/market-pod-universe-2026.json'
];

const INTEGRATION_FILES=[
  'assets/enhancements.js',
  'index.html',
  'en/index.html',
  'sw.js',
  'data/youtube-reviews.js'
];

const WORKFLOW_FILES=[
  '.github/workflows/market-2026-sync.yml',
  '.github/workflows/market-sales-2026-sync.yml',
  '.github/workflows/market-universe-audit-2026.yml',
  '.github/workflows/market-2026-quality.yml',
  '.github/workflows/market-report-final-quality.yml'
];

const LAST_FULL_RUNS=[
  {
    workflow:'Market 2026 Daily Sync',
    runId:33380468080,
    runNumber:null,
    event:'push',
    startedAt:'2026-08-31T10:01:17.000Z',
    completedAt:'2026-08-31T10:11:00.000Z',
    durationSeconds:583,
    headSha:'35114b865bcf12a1ed81fba4f26532ba360eec57',
    executedCollectors:true,
    url:'https://github.com/andreiclim77-cell/rta/actions/runs/33380468080'
  },
  {
    workflow:'Market 2026 Sales Signals',
    runId:33400963224,
    runNumber:41,
    event:'push',
    startedAt:'2026-08-31T14:09:12.000Z',
    completedAt:'2026-08-31T14:17:50.000Z',
    durationSeconds:518,
    headSha:'fe1ab73d76d5cd06e1e3c9bd4c02bd348801df33',
    executedCollectors:true,
    url:'https://github.com/andreiclim77-cell/rta/actions/runs/33400963224'
  },
  {
    workflow:'Market 2026 Romania Universe Audit',
    runId:33373677302,
    runNumber:9,
    event:'schedule',
    startedAt:'2026-08-31T08:36:12.000Z',
    completedAt:'2026-08-31T08:38:38.000Z',
    durationSeconds:146,
    headSha:'3fb5bb13d157b59ece345b4cc587a6a3df316aff',
    executedCollectors:true,
    url:'https://github.com/andreiclim77-cell/rta/actions/runs/33373677302'
  }
];

function rel(file){return file.split(path.sep).join('/')}
function absolute(file){return path.join(ROOT,...file.split('/'))}
function readText(file){return fs.readFileSync(absolute(file),'utf8')}
function readJson(file){return JSON.parse(readText(file))}
function sha256(value){return crypto.createHash('sha256').update(value).digest('hex')}
function sum(values){return values.reduce((total,value)=>total+Number(value||0),0)}
function unique(values){return Array.from(new Set(values.filter(value=>value!==null&&value!==undefined&&value!=='')))}
function countBy(values,key){
  const label=value=>String(typeof key==='function'?key(value):value&&value[key]||'UNKNOWN');
  return Object.fromEntries(unique(values.map(label)).sort().map(name=>[name,values.filter(value=>label(value)===name).length]));
}
function maxIso(values){
  const parsed=values.filter(Boolean).map(value=>Date.parse(value)).filter(Number.isFinite);
  return parsed.length?new Date(Math.max(...parsed)).toISOString():null;
}

function trackedFiles(){
  const output=[];
  function walk(directory){
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
      if(entry.name==='.git'||entry.name==='node_modules')continue;
      const item=path.join(directory,entry.name);
      if(entry.isDirectory())walk(item);
      else if(entry.isFile())output.push(rel(path.relative(ROOT,item)));
    }
  }
  walk(ROOT);
  return output;
}

function isCurrentAnalysisFile(file){
  if(file.startsWith('data/analiza-benchmark/')||file.startsWith('tools/analiza-vnext/')||file==='.github/workflows/market-analiza-vnext-quality.yml')return false;
  if(WORKFLOW_FILES.includes(file))return true;
  if(/^data\/market-(?!hype-).*(?:\.json|\.js)$/.test(file))return true;
  if(/^tools\/.*market-(?!hype).*\.js$/.test(file))return true;
  if(/^assets\/market-(?!hype).*\.js$/.test(file))return true;
  return INTEGRATION_FILES.includes(file);
}

function roleFor(file){
  if(file.startsWith('.github/workflows/'))return'orchestration-or-quality';
  if(file.startsWith('tools/'))return/validate|check-|audit/.test(path.basename(file))?'quality-or-audit':'collector-or-transform';
  if(file.startsWith('data/market-retailers')||file.includes('sources')||file.includes('pod-universe'))return'source-or-entity-registry';
  if(file.startsWith('data/market-'))return'public-analysis-state';
  if(file.startsWith('assets/market-'))return'analysis-ui-reader';
  if(file==='assets/enhancements.js'||file==='index.html'||file==='en/index.html')return'public-entry-integration';
  if(file==='sw.js')return'cache-contract';
  return'integration-input';
}

function fileRecord(file){
  const buffer=fs.readFileSync(absolute(file));
  const binary=/\.(?:png|jpe?g|webp)$/i.test(file);
  const normalized=binary?buffer:Buffer.from(buffer.toString('utf8').replace(/\r\n/g,'\n'),'utf8');
  return{
    path:file,
    role:roleFor(file),
    bytes:normalized.length,
    lines:binary?0:normalized.toString('utf8').split('\n').length,
    sha256:sha256(normalized)
  };
}

function jsonShape(value){
  const type=Array.isArray(value)?'array':value===null?'null':typeof value;
  const output={type};
  if(Array.isArray(value)){
    output.length=value.length;
    output.itemTypes=unique(value.slice(0,100).map(item=>Array.isArray(item)?'array':item===null?'null':typeof item)).sort();
    const objects=value.slice(0,100).filter(item=>item&&typeof item==='object'&&!Array.isArray(item));
    if(objects.length)output.itemKeys=unique(objects.flatMap(Object.keys)).sort();
  }else if(value&&typeof value==='object'){
    output.keys=Object.keys(value).sort();
    output.fields=Object.fromEntries(Object.keys(value).sort().map(key=>{
      const field=value[key];
      if(Array.isArray(field))return[key,{type:'array',length:field.length,itemKeys:unique(field.slice(0,100).filter(item=>item&&typeof item==='object'&&!Array.isArray(item)).flatMap(Object.keys)).sort()}];
      if(field&&typeof field==='object')return[key,{type:'object',keys:Object.keys(field).sort()}];
      return[key,{type:field===null?'null':typeof field}];
    }));
  }
  return output;
}

function workflowContract(file){
  const text=readText(file);
  return{
    file,
    schedules:Array.from(text.matchAll(/cron:\s*['"]([^'"]+)['"]/g),match=>match[1]),
    timeoutMinutes:Number((text.match(/timeout-minutes:\s*(\d+)/)||[])[1]||0),
    concurrencyGroup:(text.match(/group:\s*([^\r\n]+)/)||[])[1]?.trim()||null,
    steps:Array.from(text.matchAll(/^\s*- name:\s*(.+)$/gm),match=>match[1].trim()),
    nodeTools:unique(Array.from(text.matchAll(/node\s+(tools\/[\w./-]+\.js)/g),match=>match[1])),
    writesDirectlyToMain:/git push origin HEAD:main/.test(text),
    hasBucharestGate:/Europe\/Bucharest|Bucharest/.test(text),
    hasFallbackGate:/fallback/i.test(text)
  };
}

function dataContracts(){
  return Object.fromEntries(DATA_FILES.filter(file=>fs.existsSync(absolute(file))).map(file=>{
    const text=readText(file).replace(/\r\n/g,'\n');
    return[file,{bytes:Buffer.byteLength(text),sha256:sha256(text),shape:jsonShape(JSON.parse(text))}];
  }));
}

function operatorAudit(registry){
  const groups=new Map();
  for(const retailer of registry.retailers||[]){
    const operator=retailer.operatorId||retailer.id;
    if(!groups.has(operator))groups.set(operator,[]);
    groups.get(operator).push(retailer.id);
  }
  const duplicates=[...groups].filter(([,storefronts])=>storefronts.length>1).map(([operatorId,storefronts])=>({operatorId,storefronts}));
  return{
    storefronts:(registry.retailers||[]).length,
    operators:groups.size,
    operatorsWithMultipleStorefronts:duplicates.length,
    duplicateOperatorGroups:duplicates
  };
}

function salesAudit(sales){
  const file='data/market-sales-2026.json';
  const rankings=sales.rankings||[],actual=sales.actualSales||[],demand=sales.demandSignals||[];
  const suspect=/\b(?:longfill|lichid|tobacco|tutun|aroma|nicotin|battery|baterie|acumulator|wire|sarma|coil|rezistenta|cotton|bumbac|charger|incarcator|disposable)\b/i;
  const suspects=rankings.filter(row=>suspect.test(String(row.product||'')));
  return{
    file,
    exists:fs.existsSync(absolute(file)),
    bytes:Buffer.byteLength(readText(file).replace(/\r\n/g,'\n')),
    parses:true,
    updatedAt:sales.updatedAt||null,
    rankings:rankings.length,
    rankingEvidenceTiers:countBy(rankings,'evidenceTier'),
    rankingStorefronts:unique(rankings.map(row=>row.retailerId)).length,
    actualSales:actual.length,
    actualSalesStorefronts:unique(actual.map(row=>row.retailerId)).length,
    demandSignals:demand.length,
    demandStorefronts:unique(demand.map(row=>row.retailerId)).length,
    actualUnitSalesCoveragePct:Number(sales.coverage&&sales.coverage.actualUnitSalesCoveragePct||0),
    rankingCoveragePct:Number(sales.coverage&&sales.coverage.rankingCoveragePct||0),
    demandProxyCoveragePct:Number(sales.coverage&&sales.coverage.demandProxyCoveragePct||0),
    nationalUnitsSoldAvailable:Boolean(sales.coverage&&sales.coverage.nationalUnitsSoldAvailable),
    nationalMarketShareAvailable:Boolean(sales.coverage&&sales.coverage.nationalMarketShareAvailable),
    heuristicSuspectRankingTitles:suspects.length,
    heuristicSuspectExamples:unique(suspects.map(row=>row.product)).slice(0,12),
    anomalyResolution:'The file is valid, non-empty and current as a Tier-B ranking/Tier-C proxy projection. It contains zero Tier-A sales rows and must not be used as unit-sales or national-market-share benchmark truth.',
    benchmarkTruth:'RANKING_AND_PROXY_ONLY'
  };
}

function managementAudit(management,sales){
  const period=management.periods&&management.periods['30']||{};
  const products=period.product&&period.product.rows||[];
  const actionCounts=countBy(products,row=>row.action&&row.action.code||'UNKNOWN');
  const decisionsWithoutTierA=products.filter(row=>!row.tierA&&row.action&&['WHITE_SPACE','GROW','CORE'].includes(row.action.code));
  return{
    generatedAt:management.generatedAt||null,
    periods:Object.keys(management.periods||{}),
    period30:{categories:period.category&&period.category.rows&&period.category.rows.length||0,brands:period.brand&&period.brand.rows&&period.brand.rows.length||0,products:products.length,actionCounts},
    tierAStores:Number(management.coverage&&management.coverage.tierAStores||0),
    tierBStores:Number(management.coverage&&management.coverage.tierBStores||0),
    decisionsWithoutTierA:decisionsWithoutTierA.length,
    firstDecision:products[0]||null,
    firstDecisionPresenceMismatch:products[0]?{name:products[0].name,bestsellerStorefronts:products[0].bestsellerStorefronts,listedStorefronts:products[0].listedStorefronts,action:products[0].action&&products[0].action.code}:null,
    semanticRisk:sales.actualSales&&sales.actualSales.length?'MIXED_EVIDENCE':'RECIPROCAL_RANK_AND_PROXY_ONLY'
  };
}

function sourceHealth(market,coverage,sales,demand,universe){
  return{
    market:{
      generatedAt:market.collectorStatus&&market.collectorStatus.generatedAt||null,
      pagesFetched:Number(market.collectorStatus&&market.collectorStatus.pagesFetched||0),
      errors:Number(market.collectorStatus&&market.collectorStatus.errors||0),
      observations:Number(market.collectorStatus&&market.collectorStatus.observations||0)
    },
    storefronts:{
      qualityState:coverage.qualityState||null,
      captureStates:countBy(coverage.storefronts||[],'captureState'),
      zeroObservationStorefronts:coverage.coverage&&coverage.coverage.zeroObservationStorefronts||[],
      sourceErrorStorefronts:coverage.coverage&&coverage.coverage.sourceErrorStorefronts||[],
      notAttemptedStorefronts:coverage.coverage&&coverage.coverage.notAttemptedStorefronts||[]
    },
    sales:{retailerStatusRows:(sales.retailerStatus||[]).length,retailerStatusErrors:(sales.retailerStatus||[]).filter(row=>row.error).length},
    demand:demand.sourceStatus||{},
    universe:{enginesConfigured:Number(universe.searchEnginesConfigured||0),enginesWorking:Number(universe.searchEnginesWorking||0),queriesRun:Number(universe.queriesRun||0),currentAuditClean:Boolean(universe.currentAuditClean)}
  };
}

function podAudit(market,podRegistry){
  const classifier=require(absolute('tools/market-pod-classifier-2026.js'));
  const samples=[
    'Vaporesso XROS 4 Pod Kit',
    'OXVA Xlim Pro 2 Pod System',
    'Uwell Caliburn G3 replacement pod 0.8 ohm',
    'Voopoo PnP X coil 0.3 ohm 5-pack',
    'Cthulhu AIO Pod System'
  ].map(title=>({title,result:classifier.classifyPodProduct(title)}));
  const podRows=(market.observations||[]).filter(row=>String(row.category||'').toUpperCase()==='POD');
  return{
    makers:(podRegistry.makers||[]).length,
    segments:(podRegistry.segments||[]).length,
    marketPodObservations:podRows.length,
    marketPodDistinctTitles:unique(podRows.map(row=>row.product)).length,
    samples,
    deviceSamplesClassified:samples.filter(row=>row.result).length,
    consumableSamplesRetained:samples.filter(row=>/replacement pod|coil/i.test(row.title)&&row.result).length,
    currentLimitation:'The current classifier returns null for accessory-only POD consumables instead of retaining and linking cartridge/pod/coil entities to a platform.'
  };
}

function uiContract(inventory){
  const files=inventory.filter(item=>['analysis-ui-reader','public-entry-integration','cache-contract'].includes(item.role)).map(item=>item.path);
  const text=files.map(file=>readText(file)).join('\n');
  return{
    files,
    dataPaths:unique(Array.from(text.matchAll(/\/?data\/market-(?!hype-)[\w-]+\.(?:json|js)/g),match=>match[0].replace(/^\//,''))).sort(),
    selectors:unique(Array.from(text.matchAll(/(?:getElementById\(|id=["']|#)(market[\w-]+)/gi),match=>match[1])).sort(),
    accessKey:(readText('assets/market-2026.js').match(/ACCESS_KEY='([^']+)'/)||[])[1]||null,
    privatePasswordHashPresent:/PASSWORD_SHA256/.test(readText('assets/market-2026.js')),
    primaryViews:['Analiza','Hype','Surse'],
    analysisSubViews:['Piata','Produse','Trend','Oportunitati'],
    serviceWorkerNetworkFirst:/market-2026|market-sales-2026|market-management-2026/.test(readText('sw.js')),
    currentDataContractPreserved:true
  };
}

function screenshotRecords(){
  const directory=absolute('data/analiza-benchmark/screenshots');
  if(!fs.existsSync(directory))return[];
  return fs.readdirSync(directory).filter(file=>/\.png$/i.test(file)).sort().map(file=>fileRecord(`data/analiza-benchmark/screenshots/${file}`));
}

function buildBaseline(){
  const runtimeFiles=trackedFiles().filter(isCurrentAnalysisFile).sort();
  const inventory=runtimeFiles.map(fileRecord);
  const registry=readJson('data/market-retailers-2026.json');
  const universe=readJson('data/market-universe-audit-2026.json');
  const market=readJson('data/market-2026.json');
  const coverage=readJson('data/market-coverage-2026.json');
  const sales=readJson('data/market-sales-2026.json');
  const demand=readJson('data/market-demand-intelligence-2026.json');
  const presence=readJson('data/market-product-presence-2026.json');
  const management=readJson('data/market-management-2026.json');
  const pods=readJson('data/market-pod-universe-2026.json');
  const categoryCounts=countBy(market.observations||[],'category');
  const screenshots=screenshotRecords();
  const generatedAt=[market.updatedAt,coverage.generatedAt,sales.updatedAt,demand.generatedAt,presence.generatedAt,management.generatedAt,universe.generatedAt];
  return{
    schemaVersion:1,
    phase:'ANALIZA ROMANIA vNext Phase 0',
    baselineDate:'2026-09-01',
    baselineCodeCommit:BASELINE_COMMIT,
    comparisonMainCommit:MAIN_COMPARISON_COMMIT,
    dataSnapshotAt:maxIso(generatedAt),
    invariants:{publicBehaviorChanged:false,currentCollectorsChanged:false,currentPublicDataChanged:false,currentWorkflowsChanged:false,benchmarkDeterministic:true},
    inventory:{files:inventory.length,bytes:sum(inventory.map(item=>item.bytes)),byRole:countBy(inventory,'role'),entries:inventory},
    dataContracts:dataContracts(),
    currentOutputs:{
      retailerRegistry:{schemaVersion:registry.schemaVersion,status:registry.nationalAudit&&registry.nationalAudit.status||null,discoveryCertified:Boolean(registry.nationalAudit&&registry.nationalAudit.discoveryCertified),...operatorAudit(registry)},
      universe:{generatedAt:universe.generatedAt,registryStorefronts:universe.registryStorefronts,domainsDiscovered:universe.domainsDiscovered,queriesRun:universe.queriesRun,validatedNewRetailers:(universe.validatedNewRetailers||[]).length,unresolvedCandidates:(universe.unresolvedCandidates||[]).length,consecutiveCleanAudits:universe.consecutiveCleanAudits,nationalUniverseGate:universe.nationalUniverseGate},
      market:{updatedAt:market.updatedAt,retailers:(market.retailers||[]).length,observations:(market.observations||[]).length,distinctProducts:unique((market.observations||[]).map(row=>row.product)).length,categorySnapshots:(market.categorySnapshots||[]).length,trendSnapshots:(market.trendSnapshots||[]).length,categoryCounts},
      coverage:{generatedAt:coverage.generatedAt,qualityState:coverage.qualityState,nationalClaim:coverage.nationalClaim,coverage:coverage.coverage},
      sales:salesAudit(sales),
      demand:{generatedAt:demand.generatedAt,coverage:demand.coverage,sourceStatus:demand.sourceStatus,products:(demand.products||[]).length,categories:countBy(demand.products||[],'category'),historySnapshots:(demand.history||[]).length},
      presence:{generatedAt:presence.generatedAt,configuredStorefronts:presence.configuredStorefronts,configuredOperators:presence.configuredOperators,summary:presence.summary,products:(presence.products||[]).length},
      management:managementAudit(management,sales),
      pods:podAudit(market,pods)
    },
    sourceHealth:sourceHealth(market,coverage,sales,demand,universe),
    workflows:WORKFLOW_FILES.map(workflowContract),
    lastObservedFullRuns:LAST_FULL_RUNS,
    ui:uiContract(inventory),
    uiScreenshots:screenshots,
    anomalyResolution:{
      marketSalesConnectorObservation:'Connector representation issue, not an empty/corrupt local file.',
      safeBenchmarkUse:'Schema, ranking rows, demand proxies, flags and known gaps may be frozen. Unit-sales and national market-share results may not be inferred because actualSales is empty.',
      verdict:'VALID_NONEMPTY_RANKING_PROXY_FILE_WITH_ZERO_TIER_A_SALES'
    },
    knownStructuralGaps:[
      {id:'no-tier-a-sales',evidence:'market-sales-2026.json contains zero actualSales rows and 0% Tier-A coverage'},
      {id:'rank-index-presented-as-share',evidence:'build-market-management-2026.js derives observedSharePct from reciprocal rank totals'},
      {id:'ranking-semantics-not-normalized-by-visible-depth',evidence:'ranking rows retain rank but no required source-relative visible-depth contract'},
      {id:'management-action-without-tier-a-or-c',evidence:'the first 30-day product can receive WHITE_SPACE/SMALL_TEST from ranking momentum alone'},
      {id:'ranking-title-contamination',evidence:'heuristic audit finds non-device/accessory/liquid titles in Tier-B rankings'},
      {id:'demand-universe-is-rta-centric',evidence:'collect-market-demand-intelligence-2026.js productUniverse includes RTA/RBA/RDTA observations and RTA YouTube models only'},
      {id:'pod-consumables-are-discarded',evidence:'market-pod-classifier-2026.js accessoryOnly returns null before entity retention or compatibility linkage'},
      {id:'clone-authentic-canonical-risk',evidence:'market-product-canonical-2026.js strips style, clone and authentic tokens before key generation'},
      {id:'universe-gate-is-two-clean-searches',evidence:'audit-market-universe-2026.js passes after two clean public-search audits'},
      {id:'mutable-json-direct-main',evidence:'production workflows rewrite projection JSON and push directly to main'},
      {id:'source-failure-not-first-class-observation',evidence:'current snapshots summarize errors but lack immutable attempt/evidence ledgers'},
      {id:'presence-label-match-can-miss',evidence:'management presence augmentation can leave a ranked product at zero listed storefronts when canonical labels diverge'}
    ]
  };
}

function stable(value){return JSON.stringify(value,null,2)+'\n'}

function main(){
  process.chdir(ROOT);
  const baseline=buildBaseline();
  if(process.argv.includes('--write')){
    fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
    fs.writeFileSync(OUTPUT,stable(baseline),'utf8');
    console.log(`ANALIZA Phase 0 baseline written: ${baseline.inventory.files} files, ${Object.keys(baseline.dataContracts).length} data contracts.`);
    return;
  }
  if(process.argv.includes('--check')){
    if(!fs.existsSync(OUTPUT))throw new Error('Baseline file is missing. Run with --write first.');
    const expected=fs.readFileSync(OUTPUT,'utf8').replace(/\r\n/g,'\n');
    const actual=stable(baseline);
    if(expected!==actual)throw new Error(`Baseline drift detected (${sha256(expected).slice(0,12)} != ${sha256(actual).slice(0,12)}).`);
    console.log(`ANALIZA Phase 0 baseline OK: ${baseline.inventory.files} files, ${Object.keys(baseline.dataContracts).length} data contracts, no drift.`);
    return;
  }
  process.stdout.write(stable(baseline));
}

if(require.main===module){try{main()}catch(error){console.error(error.stack||error);process.exit(1)}}
module.exports={OUTPUT,buildBaseline,stable};
