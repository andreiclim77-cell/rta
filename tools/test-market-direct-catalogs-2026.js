'use strict';

const assert=require('node:assert/strict');
const {navigationProductLinks,classifyProduct,preserveFailedSourceData,collectSourcesWithRetry}=require('./collect-market-hype-direct-catalogs-2026.js');

const upends={baseUrl:'https://www.upends.com',brandHint:'UPENDS',scopes:['POD'],defaultProductType:'POD',includeUrlPatterns:['/(?:closed-pod-system|open-pod-system)/[^/]+$'],excludeUrlPatterns:['/accessory/']};
const links=navigationProductLinks(upends,'<a href="/open-pod-system/upox-pro">A</a><a href="/accessory/neo-pod">B</a><a href="/open-pod-system">C</a>','https://www.upends.com/');
assert.deepEqual(links,['https://www.upends.com/open-pod-system/upox-pro']);
assert.equal(classifyProduct(upends,{title:'UPOX Pro',body_html:'',vendor:'UPENDS',product_type:'',url:links[0]}).category,'POD');

const svoemesto={baseUrl:'https://www.svoemesto.de',brandHint:'SvoeMesto',scopes:['RTA'],defaultProductType:'RTA'};
assert.equal(classifyProduct(svoemesto,{title:'Kayfun Prime',body_html:'',vendor:'SvoeMesto',product_type:'',url:'https://www.svoemesto.de/verdampfer/mtl/kayfun-prime'}).category,'RTA');
assert.equal(classifyProduct(svoemesto,{title:'Kayfun Prime replacement glass',body_html:'',vendor:'SvoeMesto',product_type:'',url:'https://www.svoemesto.de/accessory'}),null);

const preserved=preserveFailedSourceData([{source:{id:'source-a',baseUrl:'https://vendor.test'},ok:false,error:'timeout'}],{items:[{sourceId:'source-a',productId:'1',lastObservedAt:'2026-09-04'}],events:[{productName:'Fixture RTA',sources:[{host:'vendor.test',url:'https://vendor.test/product'}]}]},'2026-09-05T06:00:00Z');
assert.equal(preserved.items.length,1);
assert.equal(preserved.items[0].lastObservedAt,'2026-09-04');
assert.equal(preserved.items[0].sourceSnapshotStale,true);
assert.equal(preserved.events.length,1);
assert.equal(preserved.events[0].sourceSnapshotStale,true);

const genericMod={baseUrl:'https://maker.test',brandHint:'Maker',scopes:['MODURI','ACCESORII']};
assert.equal(classifyProduct(genericMod,{title:'Maker DNA 80 Mod',body_html:'',vendor:'Maker',product_type:'',url:'https://maker.test/products/dna-80-mod'}).category,'MODURI');
assert.equal(classifyProduct(genericMod,{title:'Front Door for Maker DNA 80 Mod',body_html:'',vendor:'Maker',product_type:'',url:'https://maker.test/products/front-door'}),null);
const curatedPod={baseUrl:'https://maker.test',brandHint:'Suorin',scopes:['POD'],defaultProductType:'POD'};
assert.equal(classifyProduct(curatedPod,{title:'Maxo',body_html:'',vendor:'Suorin',product_type:'POD',url:'https://maker.test/maxo/'}).category,'POD');

(async function(){
  const attempts=new Map(),sources=[{id:'transient'},{id:'stable'}];
  const result=await collectSourcesWithRetry(sources,{width:2,retryWidth:1,retryDelayMs:0,collect:async function(source){
    const n=(attempts.get(source.id)||0)+1;attempts.set(source.id,n);
    if(source.id==='transient'&&n===1)throw new Error('HTTP 429');
    const products=[{id:source.id}];products.adapterUsed='fixture';return products;
  }});
  assert.equal(result.runs.every(function(run){return run.ok}),true);
  assert.equal(result.recovered,1);
  assert.equal(result.runs.find(function(run){return run.source.id==='transient'}).attempts,2);
  assert.equal(result.runs.find(function(run){return run.source.id==='transient'}).recoveredByRetry,true);
  console.log('Direct catalog adapters: 16 synthetic checks passed.');
})().catch(function(error){console.error(error&&error.stack||error);process.exit(1)});
