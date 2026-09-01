#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const ROOT=path.resolve(__dirname,'..','..');
const FIXTURE_DIR=path.join(ROOT,'data','analiza-benchmark','fixtures');
const AS_OF='2026-08-31T21:00:00.000Z';

function testCase(id,family,requirement,title,input,expected,adversarial=false){
  return{id,family,requirement,title,adversarial,input,expected};
}

function goldCases(){
  return[
    testCase('gold-retail-001','retail-source','active-retailer','Active Romanian consumer retailer',{storefront:'Vape Exemplu',country:'RO',consumerCheckout:true,statusCode:200},{scope:'ELIGIBLE',storefrontState:'ACTIVE',operatorCount:1}),
    testCase('gold-retail-002','retail-source','same-operator-two-storefronts','Two storefronts share one legal operator',{storefronts:[{id:'shop-a',operatorId:'operator-a'},{id:'shop-b',operatorId:'operator-a'}]},{storefrontCount:2,operatorCount:1,noOperatorInflation:true}),
    testCase('gold-retail-003','retail-source','cross-border','Foreign retailer shipping to Romania stays outside the national core',{country:'DE',shipsToRomania:true,localEntity:false},{scope:'CROSS_BORDER_CONTEXT',nationalCore:false}),
    testCase('gold-retail-004','retail-source','moved-url','Moved category URL is recovered without inventing delisting',{oldUrlStatus:301,newUrlStatus:200,canonicalUrl:'/collections/rta'},{sourceState:'MOVED',availability:'UNKNOWN_UNTIL_REPARSE'}),

    testCase('gold-product-001','product-identity','canonical-product','Exact canonical product identity',{brand:'Vaporesso',title:'Vaporesso XROS 4 Pod Kit'},{brand:'Vaporesso',model:'XROS 4',entityType:'POD_DEVICE'}),
    testCase('gold-product-002','product-identity','brand-alias','Brand alias resolves to canonical brand',{brand:'SMOKTECH',title:'Smoktech Nord 5 Kit'},{brand:'SMOK',model:'Nord 5'}),
    testCase('gold-product-003','product-identity','seo-noise','SEO suffix does not create a product',{title:'Kayfun X MTL RTA - best price Romania, original, 22mm'},{model:'Kayfun X',noiseRemoved:true}),
    testCase('gold-product-004','product-identity','color-variant','Colour variants share a product identity',{offers:['OXVA Xlim Pro 2 Black','OXVA Xlim Pro 2 Silver']},{canonicalProducts:1,offers:2}),
    testCase('gold-product-005','product-identity','bundle','Bundle stays a distinct commercial offer',{offers:['XROS 4 device','XROS 4 device + 2 pods bundle']},{canonicalProducts:1,commercialOffers:2,bundleNormalized:true}),
    testCase('gold-product-006','product-identity','revision','V2 remains distinct from V1',{offers:['Diplomat MTL RTA V1.5','Diplomat MTL RTA V2']},{canonicalProducts:2,revisionPreserved:true}),
    testCase('gold-product-007','product-identity','clone-authentic','Clone and authentic lifecycles are linked but separate',{offers:['Centenary Mods Diplomat V1.5','SXK Diplomat V1.5 Style RTA']},{canonicalProducts:2,relationship:'CLONE_OF',collapsed:false}),
    testCase('gold-product-008','product-identity','same-family-different-product','Products in one family remain distinct',{offers:['OXVA Xlim Pro 2','OXVA Xlim SQ Pro 2']},{canonicalProducts:2,family:'Xlim'}),

    testCase('gold-sales-001','sales-ranking','explicit-counter','Explicit product units-sold counter is Tier A evidence',{text:'S-au vandut 124 bucati',previousCounter:119},{tier:'A',counter:124,delta:5}),
    testCase('gold-sales-002','sales-ranking','counter-baseline','First cumulative counter is a baseline, not daily sales',{counter:124,previousCounter:null},{tier:'A',baseline:true,delta:null}),
    testCase('gold-sales-003','sales-ranking','counter-delta','Positive cumulative counter delta is measured units',{counter:130,previousCounter:124},{tier:'A',baseline:false,delta:6}),
    testCase('gold-sales-004','sales-ranking','bestseller','Retailer-labelled bestseller is ranking evidence',{label:'Cele mai vandute',visibleDepth:24,rank:3},{tier:'B',units:null,rank:3,semantics:'RETAILER_BESTSELLER'}),
    testCase('gold-sales-005','sales-ranking','category-rank-vs-store','Category rank and store-wide rank retain different scopes',{categoryRank:2,storeRank:18},{tier:'B',scopes:['CATEGORY','STORE_WIDE'],mergeAsSameRank:false}),

    testCase('gold-price-001','price','regular-price','Regular RON price',{text:'249,90 lei'},{currency:'RON',regularPrice:249.9,currentPrice:249.9}),
    testCase('gold-price-002','price','promo-price','Promo and regular price remain separate',{regularText:'299,90 lei',promoText:'249,90 lei'},{currency:'RON',regularPrice:299.9,currentPrice:249.9,promo:true}),
    testCase('gold-price-003','price','strikethrough-price','Crossed-out price is regular price',{struck:'349,00 lei',visible:'299,00 lei'},{regularPrice:349,currentPrice:299,promo:true}),
    testCase('gold-price-004','price','ron-decimal','Romanian decimal separators are parsed correctly',{values:['1.299,90 lei','1299,90 RON']},{parsed:[1299.9,1299.9]}),
    testCase('gold-price-005','price','pod-pack-normalization','POD packs normalize to comparable unit price',{offers:[{pack:2,price:49.9},{pack:4,price:89.9}]},{unitPrices:[24.95,22.475],comparableGroup:'REPLACEMENT_POD'}),

    testCase('gold-stock-001','availability','in-stock','Explicit in-stock state',{text:'In stoc'},{availability:'IN_STOCK',sourceHealth:'OK'}),
    testCase('gold-stock-002','availability','out-of-stock','Explicit out-of-stock state',{text:'Stoc epuizat'},{availability:'OUT_OF_STOCK',sourceHealth:'OK'}),
    testCase('gold-stock-003','availability','preorder','Preorder is distinct from stock',{text:'Precomanda - livrare estimata 15 septembrie'},{availability:'PREORDER'}),
    testCase('gold-stock-004','availability','backorder','Backorder is distinct from stock-out',{text:'Disponibil la comanda furnizor'},{availability:'BACKORDER'}),

    testCase('gold-pod-001','pod','pod-device','Open POD device',{title:'Vaporesso XROS 4 Pod Kit'},{entityType:'POD_DEVICE',platform:'XROS',segment:'MASS_MARKET_OPEN_POD'}),
    testCase('gold-pod-002','pod','integrated-coil-pod','Integrated-coil replacement pod links to device family',{title:'XROS Series Pod 0.8 ohm 2-pack'},{entityType:'INTEGRATED_COIL_POD',platform:'XROS',packQuantity:2}),
    testCase('gold-pod-003','pod','closed-platform','Closed prefilled platform',{title:'Vuse ePod 2 device'},{entityType:'POD_DEVICE',platform:'ePod',segment:'CLOSED_PREFILLED_HYBRID'}),
    testCase('gold-pod-004','pod','aio','AIO host is not flattened into a generic POD',{title:'Cthulhu AIO Box'},{entityType:'AIO_HOST',segment:'PREMIUM_HIGH_END_AIO'}),
    testCase('gold-pod-005','pod','boro-host','Boro host remains distinct from bridge',{title:'Billet Box style Boro host'},{entityType:'BORO_HOST'}),
    testCase('gold-pod-006','pod','boro-bridge','Boro bridge remains distinct from host',{title:'Mission XV Orbit RBA bridge'},{entityType:'BORO_BRIDGE'}),
    testCase('gold-pod-007','pod','broad-consumables','Device has broad compatible consumables',{device:'OXVA Xlim Pro 2',compatibleConsumables:12,activeOffers:10},{ecosystemHealth:'BROAD',edgeCount:12}),
    testCase('gold-pod-008','pod','narrow-consumables','Device has narrow compatible consumables',{device:'Example Closed Pod',compatibleConsumables:1,activeOffers:1},{ecosystemHealth:'NARROW',edgeCount:1}),

    testCase('gold-demand-001','demand','romania-google','Romania-targeted Google Ads signal',{source:'GOOGLE_ADS',geo:'RO',avgMonthlySearches:720},{eligibleForRomanianDemand:true,sales:false}),
    testCase('gold-demand-002','demand','romanian-community','Public Romanian community mention',{source:'PUBLIC_COMMUNITY',language:'ro',countryEvidence:'RO',mentions:4},{eligibleForRomanianDemand:true,sales:false}),
    testCase('gold-demand-003','demand','guide-intent','Anonymous first-party guide intent',{source:'GUIDE_INTENT',audience:'ghid-rta.ro',searches30d:18},{eligibleForRomanianDemand:true,nationalDemand:false,sales:false}),
    testCase('gold-demand-004','demand','romanian-demand-without-local','Romanian demand can exist without a local listing',{romanianDemand:true,localListings:0},{state:'DEMAND_WHITE_SPACE',buyClaim:'CONTROLLED_TEST_ONLY'})
  ];
}

function adversarialCases(){
  return[
    testCase('adv-retail-001','retail-source','dead-retailer','Dead retailer must not remain active',{statusCode:410,lastHealthyAt:'2025-11-01T00:00:00.000Z'},{scope:'RETIRED',availabilityInference:false},true),
    testCase('adv-retail-002','retail-source','marketplace-only','Marketplace-only seller is not a national core storefront',{host:'marketplace.example',sellerPageOnly:true},{scope:'MARKETPLACE_CONTEXT',nationalCore:false},true),
    testCase('adv-retail-003','retail-source','b2b-only','B2B-only distributor is not a consumer storefront',{wholesaleOnly:true,consumerCheckout:false},{scope:'B2B_CONTEXT',nationalCore:false},true),
    testCase('adv-retail-004','retail-source','source-outage','Source outage is unknown coverage, not zero',{timeout:true,priorProducts:320},{sourceState:'OUTAGE',observedProducts:null,zeroIsTrustworthy:false},true),
    testCase('adv-retail-005','retail-source','parser-drift','Parser drift is not a market disappearance',{statusCode:200,expectedCards:40,parsedCards:0,layoutFingerprintChanged:true},{sourceState:'PARSER_DRIFT',availability:'UNKNOWN',decline:false},true),
    testCase('adv-retail-006','retail-source','same-operator-two-storefronts','Duplicate operator storefronts cannot inflate breadth',{storefronts:[{id:'a',operatorId:'same'},{id:'b',operatorId:'same'}],productOnBoth:true},{storefrontBreadth:2,operatorBreadth:1},true),

    testCase('adv-product-001','product-identity','brand-alias','Unknown alias must not be guessed from substring',{title:'Air Pro protective case',brandText:'Air'},{brand:null,manualReview:true},true),
    testCase('adv-product-002','product-identity','seo-noise','Liquid marketing text mentioning RTA is not an atomizer',{title:'Premium RTA Tobacco Longfill 20ml'},{entityType:'E_LIQUID',atomizer:false},true),
    testCase('adv-product-003','product-identity','color-variant','Colour-only offer cannot create momentum',{offersToday:8,offersYesterday:1,allSameModelDifferentColours:true},{canonicalProducts:1,productMomentumFromVariants:false},true),
    testCase('adv-product-004','product-identity','clone-authentic','Style/clone token cannot be discarded from identity',{offers:['Diplomat V1.5 authentic','SXK Diplomat V1.5 Style']},{canonicalProducts:2,collapsed:false},true),

    testCase('adv-sales-001','sales-ranking','listing-not-sale','A listing is not a sale',{listed:true,stock:'IN_STOCK',unitsCounter:null},{tier:null,units:null,forbiddenClaims:['SOLD','MARKET_SHARE']},true),
    testCase('adv-sales-002','sales-ranking','stock-not-sale','Stock state is not sales velocity',{stock:'OUT_OF_STOCK',priorStock:'IN_STOCK'},{units:null,decline:null},true),
    testCase('adv-sales-003','sales-ranking','counter-reset','Counter reset cannot create fake units',{counter:4,previousCounter:980},{tier:'A',delta:null,warning:'COUNTER_RESET_OR_IDENTITY_CHANGE'},true),
    testCase('adv-sales-004','sales-ranking','generic-order','Generic site order count is not product sales',{text:'Peste 25.000 comenzi livrate'},{tier:null,counter:null,rejected:true},true),
    testCase('adv-sales-005','sales-ranking','unclear-ranking','Popularity order with unclear semantics is not Tier B',{sortLabel:'Popularitate',documentedSemantics:false,visibleRank:1},{tier:null,rankContext:'UNKNOWN',decisionEligible:false},true),
    testCase('adv-sales-006','sales-ranking','category-rank-vs-store','Category and store-wide rank cannot be averaged blindly',{categoryRank:1,storeRank:200},{aggregateRank:null,retainRawEvidence:true},true),

    testCase('adv-price-001','price','installment-false-price','Monthly installment is not product price',{text:'de la 29,90 lei/luna',cashPrice:'899,00 lei'},{currentPrice:899,installment:29.9},true),
    testCase('adv-price-002','price','bundle-price','Bundle price is not device-only price',{title:'Device + 10 pods',price:399.9},{comparableGroup:'BUNDLE',deviceUnitPrice:null},true),
    testCase('adv-price-003','price','oos-stale-price','Stale out-of-stock price is not current market price',{availability:'OUT_OF_STOCK',price:199.9,lastSeenInStockDays:120},{currentPriceEligible:false,lastKnownPrice:199.9},true),
    testCase('adv-price-004','price','pod-pack-normalization','Two-pack and four-pack totals are not directly comparable',{twoPack:49.9,fourPack:89.9},{compareByUnit:true,rawTotalComparison:false},true),

    testCase('adv-stock-001','availability','removed-page','Removed page is not automatic discontinuation',{statusCode:404,storeHealthy:true,alternativeUrlUnknown:true},{availability:'REMOVED_OR_MOVED',discontinued:false},true),
    testCase('adv-stock-002','availability','parser-failure-not-oos','Parser failure cannot emit out-of-stock',{statusCode:200,parserError:'selector missing'},{availability:'UNKNOWN',sourceState:'PARSER_DRIFT'},true),
    testCase('adv-stock-003','availability','retailer-outage-not-oos','Retailer-wide outage cannot emit product stock-out',{statusCode:503,affectedPages:200},{availability:'UNKNOWN',sourceState:'OUTAGE'},true),

    testCase('adv-pod-001','pod','replacement-pod','Replacement pod is a consumable, not a device',{title:'Vaporesso XROS replacement pod 0.8 ohm'},{entityType:'REPLACEMENT_POD',device:false,platform:'XROS'},true),
    testCase('adv-pod-002','pod','cartridge','Empty cartridge is not a device',{title:'Caliburn G3 empty cartridge 2ml'},{entityType:'CARTRIDGE',device:false},true),
    testCase('adv-pod-003','pod','coil','Coil is not a POD device',{title:'Voopoo PnP X coil 0.3 ohm 5-pack'},{entityType:'COIL',device:false,packQuantity:5},true),
    testCase('adv-pod-004','pod','incompatible-generations','Similar family names do not prove compatibility',{device:'Caliburn G3 Pro',consumable:'Caliburn G2 cartridge'},{compatible:false,edgeStatus:'REJECTED'},true),
    testCase('adv-pod-005','pod','integrated-coil-pod','Resistance variants do not inflate device breadth',{offers:['XROS pod 0.4','XROS pod 0.6','XROS pod 0.8','XROS pod 1.0']},{devices:0,consumableProducts:1,offers:4},true),

    testCase('adv-demand-001','demand','global-youtube','Global YouTube views are not Romanian demand',{source:'YOUTUBE',geo:'GLOBAL',views:250000},{eligibleForRomanianDemand:false,contextOnly:true},true),
    testCase('adv-demand-002','demand','global-community','Global community mention is not Romanian demand',{source:'REDDIT',geo:'GLOBAL',mentions:200},{eligibleForRomanianDemand:false,contextOnly:true},true),
    testCase('adv-demand-003','demand','hype-without-ro','HYPE without Romanian corroboration cannot become local BUY',{hypeStage:'RELEASED',romanianDemand:false,localListings:0},{buyClaim:false,context:'GLOBAL_HYPE_ONLY'},true),
    testCase('adv-demand-004','demand','source-onboarding-no-momentum','New retailer onboarding cannot create momentum',{day1Stores:10,day2Stores:15,newStores:5,sameStoreRanksUnchanged:true},{momentum:0,cohortInstability:true},true),
    testCase('adv-demand-005','demand','source-offboarding-no-decline','Lost source cannot create market decline',{day1Stores:15,day2Stores:10,lostStores:5,sameStoreRanksUnchanged:true},{decline:0,cohortInstability:true},true),
    testCase('adv-demand-006','demand','romanian-demand-without-local','Romanian interest without listing is not a national sale',{romanianDemand:true,localListings:0},{sales:false,marketShare:false,whiteSpaceOnly:true},true)
  ];
}

function document(id,cases){
  return{schemaVersion:1,fixtureSet:id,asOf:AS_OF,syntheticDeterministic:true,cases};
}

function buildSets(){
  return{
    gold:document('analiza-phase0-gold',goldCases()),
    adversarial:document('analiza-phase0-adversarial',adversarialCases())
  };
}

function stable(value){return JSON.stringify(value,null,2)+'\n'}

function main(){
  const sets=buildSets();
  if(process.argv.includes('--write')){
    fs.mkdirSync(FIXTURE_DIR,{recursive:true});
    fs.writeFileSync(path.join(FIXTURE_DIR,'gold-set.json'),stable(sets.gold),'utf8');
    fs.writeFileSync(path.join(FIXTURE_DIR,'adversarial.json'),stable(sets.adversarial),'utf8');
    console.log(`ANALIZA Phase 0 fixtures written: ${sets.gold.cases.length} gold + ${sets.adversarial.cases.length} adversarial.`);
    return;
  }
  process.stdout.write(stable(sets));
}

if(require.main===module){try{main()}catch(error){console.error(error.stack||error);process.exit(1)}}
module.exports={AS_OF,buildSets,stable};
