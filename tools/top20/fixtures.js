'use strict';
// Synthetic QA fixture. Never a production source.
const Core=require('../../assets/market-top20-core.js');
const NOW='2026-09-06T14:00:00.000Z';
function fixture(n=25){
 const catalog=Array.from({length:n},(_,i)=>({id:'test-'+i,brand:'TEST',model:'Model '+String(i).padStart(2,'0'),category:'POD_DEVICE',keywords:['test model '+String(i).padStart(2,'0')]}));
 const period={start:'2025-09',end:'2026-08'};
 const google_geo={resourceName:'geoTargetConstants/2642',countryCode:'RO',targetType:'Country',status:'ENABLED'};
 const google_request={keywords:catalog.flatMap(m=>m.keywords),geoTargetConstants:[google_geo.resourceName],keywordPlanNetwork:'GOOGLE_SEARCH',historicalMetricsOptions:{yearMonthRange:{start:{year:2025,month:'SEPTEMBER'},end:{year:2026,month:'AUGUST'}}}};
 return{schema_version:2,test_fixture:true,source:{provider:Core.PROVIDER,method:'google_ads_api',retrieved_at:NOW,request_id:'TEST-ONLY-NOT-GOOGLE'},request:{country:'RO',network:'GOOGLE_SEARCH',language:'all',period,google_geo,google_request},catalog,results:catalog.map((m,i)=>({text:m.keywords[0],closeVariants:[],keywordMetrics:{monthlySearchVolumes:Array.from({length:12},(_,j)=>{const k=Core.shift(period.start,j);return{year:Number(k.slice(0,4)),month:Core.MONTHS[Number(k.slice(5))-1],monthlySearches:String((i+1)*100+j*10)}})}}))};
}
module.exports={fixture,NOW};
