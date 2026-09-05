#!/usr/bin/env node
'use strict';

const crypto=require('crypto');
const fs=require('fs');
const path=require('path');

const ROOT=path.resolve(__dirname,'..','..');
const OUTPUT=path.join(ROOT,'data','hype-benchmark','baseline-2026-09-01.json');
const BASELINE_COMMIT='6bf2acc68ec8af7c44db4b5c6e78f0ab771bb1df';
const MAIN_COMPARISON_COMMIT='2113765a4fadc3bc292050ac26e9609199eb83fe';
const SNAPSHOT_REFERENCE='2026-08-31T03:00:00.000Z';

const PUBLIC_DATA_FILES=[
  'data/market-hype-products-2026.json',
  'data/market-hype-pods-2026.json',
  'data/market-hype-radar-2026.json',
  'data/market-hype-evidence-2026.json',
  'data/market-hype-heartbeat-2026.json',
  'data/market-hype-heartbeat-evidence-2026.json',
  'data/market-hype-direct-catalogs-2026.json',
  'data/market-hype-dated-news-2026.json',
  'data/market-hype-retail-campaigns-2026.json',
  'data/market-hype-retail-memory-2026.json',
  'data/market-hype-known-history-2026.json',
  'data/market-hype-discovery-ledger-2026.json'
];

const INTEGRATION_FILES=[
  'assets/market-analysis-synthesis.js',
  'assets/market-loading-guard.js',
  'assets/enhancements.js',
  'index.html',
  'en/index.html',
  'sw.js',
  'data/market-2026.json',
  'data/market-sales-2026.json',
  'data/market-management-2026.json',
  'data/market-universe-audit-2026.json',
  'data/market-demand-intelligence-2026.json',
  'data/market-product-presence-2026.json'
];

const PROTECTIONS=[
  {id:'new-arrival-is-not-release',file:'data/market-hype-products-2026.json',token:'"newArrivalIsNotRelease": true'},
  {id:'relisting-is-not-release',file:'data/market-hype-products-2026.json',token:'"relistingIsNotRelease": true'},
  {id:'prior-history-demotes-relisting',file:'tools/consolidate-market-hype-2026.js',token:'knownBeforeWindowAt'},
  {id:'single-retailer-needs-corroboration',file:'tools/consolidate-market-hype-2026.js',token:'retailHosts.length>=2'},
  {id:'retail-promotion-is-not-release',file:'tools/consolidate-market-hype-2026.js',token:"signalKind='dated-retail-promotion'"},
  {id:'sitemap-lastmod-is-not-launch',file:'data/market-hype-products-2026.json',token:'"sitemapLastmodIsNeverUsedAsLaunchDate": true'},
  {id:'jsonld-coverage-is-not-launch',file:'data/market-hype-products-2026.json',token:'"jsonLdCatalogCoverageDoesNotCreateLaunchEvents": true'},
  {id:'first-catalog-run-is-baseline',file:'data/market-hype-products-2026.json',token:'"firstCatalogRunIsBaselineOnly": true'},
  {id:'colour-variants-share-product',file:'data/market-hype-products-2026.json',token:'"colourVariantsAreOneProduct": true'},
  {id:'category-revalidated-before-publish',file:'data/market-hype-products-2026.json',token:'"categoryRevalidatedBeforePublish": true'},
  {id:'bucharest-0600-reference',file:'tools/hype-window-reference-2026.js',token:"const TZ='Europe/Bucharest'"},
  {id:'private-content-requires-authorization',file:'data/market-hype-sources-2026.json',token:'"privateContentWithoutAuthorization"'}
];

function rel(file){return file.split(path.sep).join('/')}
function absolute(file){return path.join(ROOT,...file.split('/'))}
function readText(file){return fs.readFileSync(absolute(file),'utf8')}
function readJson(file){return JSON.parse(readText(file))}
function sha256(value){return crypto.createHash('sha256').update(value).digest('hex')}
function sum(values){return values.reduce((total,value)=>total+Number(value||0),0)}
function countBy(values,key){
  return Object.fromEntries(Array.from(new Set(values.map(value=>String(value&&value[key]||'UNKNOWN')))).sort().map(name=>[name,values.filter(value=>String(value&&value[key]||'UNKNOWN')===name).length]));
}
function maxIso(values){
  const parsed=values.filter(Boolean).map(value=>Date.parse(value)).filter(Number.isFinite);
  return parsed.length?new Date(Math.max(...parsed)).toISOString():null;
}

function trackedFiles(){
  const output=[];
  function walk(directory){
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
      if(entry.name==='.git'||entry.name==='node_modules'||entry.name==='audit-market')continue;
      const absolutePath=path.join(directory,entry.name);
      if(entry.isDirectory())walk(absolutePath);
      else if(entry.isFile())output.push(rel(path.relative(ROOT,absolutePath)));
    }
  }
  walk(ROOT);
  return output;
}

function isCurrentHypeFile(file){
  if(file.startsWith('data/hype-benchmark/')||file.startsWith('tools/hype-vnext/')||file==='.github/workflows/market-hype-vnext-quality.yml')return false;
  if(/^\.github\/workflows\/market-hype-.*\.ya?ml$/.test(file))return true;
  if(file.startsWith('cloudflare/market-hype-refresh/'))return true;
  if(/^assets\/market-hype-/.test(file))return true;
  if(/^data\/market-hype-.*\.json$/.test(file))return true;
  if(file==='data/market-pod-universe-2026.json'||file==='data/market-signal-sources-2026.json'||file==='data/market-source-scope-2026.json')return true;
  if(/^tools\/.*(?:market-hype|hype-window|hype-upstream|market-pod).*\.js$/.test(file))return true;
  return INTEGRATION_FILES.includes(file);
}

function roleFor(file){
  if(file.startsWith('data/hype-benchmark/screenshots/'))return'baseline-ui-screenshot';
  if(file.startsWith('.github/workflows/'))return'orchestration';
  if(file.startsWith('cloudflare/'))return'manual-refresh-worker';
  if(file.startsWith('tools/'))return/validate|check-/.test(path.basename(file))?'quality-gate':'collector-or-transform';
  if(file.startsWith('data/market-hype-')||file==='data/market-pod-universe-2026.json')return/source|maker|universe|profile/.test(path.basename(file))?'source-registry':'public-state-or-memory';
  if(file.startsWith('data/'))return'market-integration-data';
  if(file.startsWith('assets/market-hype-'))return'public-hype-ui';
  if(file.startsWith('assets/'))return'market-integration-ui';
  if(file==='sw.js')return'cache-contract';
  return'public-entry-point';
}

function fileRecord(file){
  const buffer=fs.readFileSync(absolute(file));
  const text=buffer.toString('utf8');
  const binary=/\.(?:png|jpe?g|webp)$/i.test(file);
  const normalized=binary?buffer:Buffer.from(text.replace(/\r\n/g,'\n'),'utf8');
  return{path:file,role:roleFor(file),bytes:normalized.length,lines:binary?0:text?text.split(/\r?\n/).length:0,sha256:sha256(normalized)};
}

function jsonShape(value){
  const output={type:Array.isArray(value)?'array':value===null?'null':typeof value};
  if(Array.isArray(value)){
    output.length=value.length;
    output.itemTypes=Array.from(new Set(value.slice(0,100).map(item=>Array.isArray(item)?'array':item===null?'null':typeof item))).sort();
    const objectItems=value.slice(0,100).filter(item=>item&&typeof item==='object'&&!Array.isArray(item));
    if(objectItems.length)output.itemKeys=Array.from(new Set(objectItems.flatMap(Object.keys))).sort();
  }else if(value&&typeof value==='object'){
    output.keys=Object.keys(value).sort();
    output.fields=Object.fromEntries(Object.keys(value).sort().map(key=>{
      const field=value[key];
      if(Array.isArray(field))return[key,{type:'array',length:field.length,itemKeys:Array.from(new Set(field.slice(0,100).filter(item=>item&&typeof item==='object'&&!Array.isArray(item)).flatMap(Object.keys))).sort()}];
      if(field&&typeof field==='object')return[key,{type:'object',keys:Object.keys(field).sort()}];
      return[key,{type:field===null?'null':typeof field}];
    }));
  }
  return output;
}

function workflowContract(){
  const file='.github/workflows/market-hype-2026-sync.yml',text=readText(file);
  const schedules=Array.from(text.matchAll(/cron:\s*['"]([^'"]+)['"]/g),match=>match[1]);
  const steps=Array.from(text.matchAll(/^\s*- name:\s*(.+)$/gm),match=>match[1].trim());
  const nodeTools=Array.from(new Set(Array.from(text.matchAll(/node\s+(tools\/[\w./-]+\.js)/g),match=>match[1])));
  return{
    file,
    schedules,
    timeoutMinutes:Number((text.match(/timeout-minutes:\s*(\d+)/)||[])[1]||0),
    concurrencyGroup:(text.match(/group:\s*([^\r\n]+)/)||[])[1]?.trim()||null,
    steps,
    nodeTools,
    writesDirectlyToMain:/git push origin HEAD:main/.test(text),
    fallbackSkipsCompletedSnapshot:/Today's Hype snapshot is complete/.test(text)
  };
}

function workerContract(){
  const file='cloudflare/market-hype-refresh/worker.mjs',text=readText(file);
  return{
    file,
    endpoint:(text.match(/REFRESH_PATH='([^']+)'/)||[])[1]||null,
    workflow:(text.match(/WORKFLOW='([^']+)'/)||[])[1]||null,
    ref:(text.match(/REF='([^']+)'/)||[])[1]||null,
    throttleMs:Number((text.match(/THROTTLE_MS=([^;]+)/)||[])[1]?.replace(/\s/g,'').replace(/\*/g,'*').split('*').reduce((a,b)=>a*Number(b),1)||0),
    dispatchesWholeWorkflow:/\/actions\/workflows\/'\+WORKFLOW\+'\/dispatches/.test(text),
    originRestricted:/ghid-rta\\\.ro/.test(text)
  };
}

function uiContract(){
  const files=['assets/market-hype-ui.js','assets/market-loading-guard.js','assets/market-analysis-synthesis.js','sw.js','index.html','en/index.html'].filter(file=>fs.existsSync(absolute(file)));
  const text=files.map(readText).join('\n');
  const dataPaths=Array.from(new Set(Array.from(text.matchAll(/data\/market-[\w-]+\.json/g),match=>match[0]))).sort();
  const selectors=['market2026Root','marketHypeRadar','marketHypeUpdated','marketHypeState'].filter(id=>text.includes(id));
  return{
    files,
    dataPaths,
    selectors,
    readyFlag:text.includes('__rtaHypeReady'),
    serviceWorkerNetworkFirst:/market-hype/.test(readText('sw.js')),
    currentPublicModes:['RTA/MODURI/ACCESORII','POD'],
    currentEvidenceLayers:['launches','signals','catalog']
  };
}

function productMetrics(doc,isPod=false){
  const products=doc.products||[];
  const events=products.filter(row=>row.confidenceTier==='confirmed'||row.confidenceTier==='reported');
  const dimensions=isPod?'segment':'category';
  return{
    schemaVersion:doc.schemaVersion,
    generatedAt:doc.generatedAt||null,
    snapshotReferenceAt:doc.snapshotReferenceAt||null,
    concreteProducts:products.length,
    datedEvents:events.length,
    publicSignals:products.length-events.length,
    before:events.filter(row=>row.window==='before').length,
    after:events.filter(row=>row.window==='after').length,
    verificationQueue:(doc.verificationQueue||[]).length,
    byDimension:countBy(products,dimensions),
    confidenceTiers:countBy(products,'confidenceTier')
  };
}

function buildBaseline(){
  const files=trackedFiles().filter(isCurrentHypeFile).sort();
  const inventory=files.map(fileRecord);
  const products=readJson('data/market-hype-products-2026.json');
  const pods=readJson('data/market-hype-pods-2026.json');
  const radar=readJson('data/market-hype-radar-2026.json');
  const direct=readJson('data/market-hype-direct-catalogs-2026.json');
  const news=readJson('data/market-hype-dated-news-2026.json');
  const campaigns=readJson('data/market-hype-retail-campaigns-2026.json');
  const sources=readJson('data/market-hype-sources-2026.json');
  const podUniverse=readJson('data/market-pod-universe-2026.json');
  const extra=readJson('data/market-hype-active-makers-extra-2026.json');
  const screenshots=fs.readdirSync(path.join(ROOT,'data','hype-benchmark','screenshots')).filter(file=>file.endsWith('.png')).sort().map(file=>fileRecord(`data/hype-benchmark/screenshots/${file}`));
  const dataContracts=Object.fromEntries(PUBLIC_DATA_FILES.filter(file=>fs.existsSync(absolute(file))).map(file=>[file,{sha256:sha256(readText(file).replace(/\r\n/g,'\n')),shape:jsonShape(readJson(file))}]));
  const generated=PUBLIC_DATA_FILES.filter(file=>fs.existsSync(absolute(file))).map(file=>({file,generatedAt:readJson(file).generatedAt||readJson(file).updatedAt||null}));
  const protectionState=PROTECTIONS.map(item=>({...item,present:readText(item.file).includes(item.token)}));
  return{
    schemaVersion:1,
    phase:'HYPE vNext Phase 0',
    baselineDate:'2026-09-01',
    baselineCodeCommit:BASELINE_COMMIT,
    comparisonMainCommit:MAIN_COMPARISON_COMMIT,
    snapshotReferenceAt:SNAPSHOT_REFERENCE,
    dataSnapshotAt:maxIso(generated.map(item=>item.generatedAt)),
    invariants:{
      publicBehaviorChanged:false,
      currentCollectorsChanged:false,
      currentPublicDataChanged:false,
      benchmarkIsDeterministic:true
    },
    inventory:{
      files:inventory.length,
      bytes:sum(inventory.map(item=>item.bytes)),
      byRole:countBy(inventory,'role'),
      entries:inventory
    },
    dataContracts,
    generatedDataTimestamps:generated,
    currentOutputs:{
      products:productMetrics(products),
      pods:productMetrics(pods,true),
      radar:{
        generatedAt:radar.generatedAt,
        categories:Object.fromEntries(Object.entries(radar.categories||{}).map(([key,value])=>[key,Array.isArray(value)?value.length:0])),
        summary:radar.summary||{}
      },
      directCatalogs:{
        generatedAt:direct.generatedAt,
        sourcesConfigured:direct.scan&&direct.scan.sourcesConfigured||0,
        sourcesWorking:direct.scan&&direct.scan.sourcesWorking||0,
        productsClassified:direct.scan&&direct.scan.productsClassified||0,
        recentEvents:direct.scan&&direct.scan.recentEvents||0,
        categoryEvents:direct.scan&&direct.scan.categoryEvents||{},
        sourceMix:direct.scan&&direct.scan.sourceMix||{}
      },
      datedNews:{generatedAt:news.generatedAt,signals:(news.signals||[]).length,summary:news.summary||{},queries:news.scan&&news.scan.newsQueries||0,queriesWorking:news.scan&&news.scan.newsQueriesWorking||0},
      retailCampaigns:{generatedAt:campaigns.generatedAt,signals:(campaigns.signals||[]).length,scan:campaigns.scan||{}}
    },
    sourceUniverse:{
      officialMakers:(sources.officialMakers||[]).length,
      cloneMakers:(sources.cloneMakers||[]).length,
      forumDomains:(sources.forumDomains||[]).length,
      independentNewsDomains:(sources.independentNewsDomains||[]).length,
      originalSellerDomains:(sources.originalSellerDiscoveryDomains||[]).length,
      cloneSellerDomains:(sources.cloneSellerDiscoveryDomains||[]).length,
      directCatalogSources:(sources.directCatalogSources||[]).length,
      supplementalActiveMakers:(extra.activeMakers||[]).length,
      podMakers:(podUniverse.makers||[]).length,
      podSegments:(podUniverse.segments||[]).length
    },
    workflow:workflowContract(),
    lastObservedSuccessfulRun:{
      runNumber:55,
      runId:33402605198,
      startedAt:'2026-08-31T14:26:09.000Z',
      completedAt:'2026-08-31T14:36:10.000Z',
      durationSeconds:601,
      headSha:'2068ba22a9856c2da22d38a61381af02ba5f9631',
      outputCommit:'4f43d64ebc0f2e57585954f682e0fbfdfdaf522d'
    },
    worker:workerContract(),
    ui:uiContract(),
    uiScreenshots:screenshots,
    protections:protectionState,
    knownStructuralGaps:[
      {id:'future-signal-horizon-collapsed',evidence:'enforce-market-hype-symmetric-window-2026.js sets futureEtaMayExceed30Days=false'},
      {id:'fixed-global-query-cap',evidence:'collect-market-hype-products-2026.js returns q.slice(0,150)'},
      {id:'lifecycle-collapsed-to-dominant-row',evidence:'consolidate-market-hype-2026.js mergeRows selects one dominant eventDate'},
      {id:'source-types-counted-as-confirmations',evidence:'eligibleSources is unique sourceType count, not independent origins'},
      {id:'mutable-json-is-canonical-state',evidence:'workflow collectors rewrite current public projection files'},
      {id:'monolithic-manual-refresh',evidence:'Cloudflare worker dispatches the full GitHub workflow'},
      {id:'search-provider-concentration',evidence:'generic discovery uses Bing RSS and no provider abstraction'}
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
    console.log(`HYPE Phase 0 baseline written: ${baseline.inventory.files} files, ${Object.keys(baseline.dataContracts).length} data contracts.`);
    return;
  }
  if(process.argv.includes('--check')){
    if(!fs.existsSync(OUTPUT))throw new Error('Baseline file is missing. Run with --write first.');
    const expected=fs.readFileSync(OUTPUT,'utf8').replace(/\r\n/g,'\n');
    const actual=stable(baseline);
    if(expected!==actual){
      const expectedHash=sha256(expected),actualHash=sha256(actual);
      throw new Error(`Baseline drift detected (${expectedHash.slice(0,12)} != ${actualHash.slice(0,12)}).`);
    }
    if(baseline.protections.some(item=>!item.present))throw new Error('A frozen current protection is missing.');
    console.log(`HYPE Phase 0 baseline OK: ${baseline.inventory.files} files, ${baseline.protections.length} protections, no drift.`);
    return;
  }
  process.stdout.write(stable(baseline));
}

if(require.main===module){try{main()}catch(error){console.error(error.stack||error);process.exit(1)}}
module.exports={OUTPUT,buildBaseline,stable};
