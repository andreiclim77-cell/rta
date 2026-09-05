#!/usr/bin/env node
'use strict';

const {observedPopularity,buyingIdeas}=require('./build-market-public-analysis-2026.js');

function need(condition,message){if(!condition)throw new Error(message)}

const sales={
  updatedAt:'2026-09-05T03:00:00.000Z',
  rankingHistory:[{
    date:'2026-09-05',
    rows:[
      {retailerId:'shop-a',category:'POD',brand:'OXVA',product:'OXVA XLIM Pro 3',rank:7,productUrl:'https://shop-a.test/xlim-pro-3'},
      {retailerId:'shop-a-alias',category:'POD',brand:'OXVA',product:'OXVA XLIM Pro 3 Black',rank:8,productUrl:'https://shop-a-alias.test/xlim-pro-3'},
      {retailerId:'shop-b',category:'POD',brand:'Vaporesso',product:'Vaporesso XROS 6',rank:1,productUrl:'https://shop-b.test/xros-6'},
      {retailerId:'shop-b',category:'POD',brand:'Voopoo',product:'Voopoo Argus G3',rank:2,productUrl:'https://shop-b.test/argus-g3'},
      {retailerId:'shop-b',category:'POD',brand:'Geekvape',product:'Geekvape Wenax Q2',rank:3,productUrl:'https://shop-b.test/wenax-q2'},
      {retailerId:'shop-b',category:'POD',brand:'Aspire',product:'Aspire Gotek X3',rank:4,productUrl:'https://shop-b.test/gotek-x3'},
      {retailerId:'shop-b',category:'POD',brand:'Uwell',product:'Uwell Caliburn G5',rank:5,productUrl:'https://shop-b.test/caliburn-g5'},
      {retailerId:'shop-b',category:'POD',brand:'Lost Vape',product:'Lost Vape Ursa Nano 4',rank:6,productUrl:'https://shop-b.test/ursa-nano-4'}
    ]
  }]
};
const retailers={retailers:[
  {id:'shop-a',operatorId:'operator-a'},
  {id:'shop-a-alias',operatorId:'operator-a'},
  {id:'shop-b',operatorId:'operator-b'}
]};

const popularity=observedPopularity(sales,retailers);
const pod=popularity.find(group=>group.category==='POD');
need(pod&&Array.isArray(pod.brands)&&Array.isArray(pod.products),'Brand/product popularity views are missing');
need(pod.brands.length===7,'Public brand ranking is still truncated to five entries');
const oxva=pod.brands.find(row=>row.name==='OXVA');
need(oxva&&oxva.sourceCount===1,'Two storefronts of one operator were counted as independent brand sources');
need(oxva.storefrontCount===1,'Operator/date brand deduplication did not keep one representative storefront');
need(pod.products.filter(row=>/XLIM Pro 3/i.test(row.name)).length===1,'Colour/storefront variants were not deduplicated');

const ideas=buyingIdeas({products:[
  {name:'OXVA XLIM Pro 3',brand:'OXVA',category:'POD',google:{avgMonthlySearches:900},guide:{searches30d:0},communityObservedMentions:0},
  {name:'OXVA NeXLIM 2',brand:'OXVA',category:'POD',google:{avgMonthlySearches:500},guide:{searches30d:0},communityObservedMentions:0},
  {name:'Vaporesso XROS 6',brand:'Vaporesso',category:'POD',google:{avgMonthlySearches:700},guide:{searches30d:0},communityObservedMentions:0}
]},{youtubeInterest:{models:[]}});
const podIdeas=ideas.find(group=>group.category==='POD');
need(podIdeas&&podIdeas.brands[0].name==='OXVA'&&podIdeas.brands[0].trackedProducts===2,'Buying-interest brand aggregation is wrong');
need(podIdeas.products.length===3&&podIdeas.products.every(row=>row.metricKind==='google-monthly-searches'),'Buying-interest products lost their explicit metric');

console.log('Public Analysis unit gate PASS: operator/date deduplication and separate brand/product rankings.');
