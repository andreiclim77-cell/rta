#!/usr/bin/env node
'use strict';

const fs=require('fs');
const {canonicalProductFamily}=require('./market-product-canonical-2026.js');
const {verificationFamilyKey}=require('./market-hype-verification-identity-2026.js');
const {classifyPodProduct}=require('./market-pod-classifier-2026.js');

const WRITE=process.argv.includes('--write');
const CHECK=process.argv.includes('--check');
const FILES={
  products:'data/market-hype-products-2026.json',
  pods:'data/market-hype-pods-2026.json',
  radar:'data/market-hype-radar-2026.json',
  evidence:'data/market-hype-evidence-2026.json',
  heartbeat:'data/market-hype-heartbeat-2026.json',
  heartbeatEvidence:'data/market-hype-heartbeat-evidence-2026.json',
  discovery:'data/market-hype-discovery-ledger-2026.json'
};
const CATEGORIES=['RTA','MODURI','ACCESORII'];

function read(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
function readOptional(file,fallback){try{return read(file)}catch(_){return fallback}}
function save(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function need(condition,message){if(!condition)throw new Error(message)}
function unique(values){return Array.from(new Set((values||[]).filter(Boolean)))}
function dated(row){return row.confidenceTier==='confirmed'||row.confidenceTier==='reported'}
function familyKey(row){return canonicalProductFamily(row).key}
function sourceKey(source){return String(source&&source.url||'')+'|'+String(source&&source.eventDate||source&&source.publishedAt||'')}
function sourceHosts(row){return unique((row.sources||[]).map(source=>source.host).filter(Boolean))}
function eligibleSourceTypes(row){return unique((row.sources||[]).filter(source=>source.decisionEligible!==false).map(source=>source.sourceType))}
function confidence(row){return Math.min(96,(dated(row)?52:24)+eligibleSourceTypes(row).length*14+Math.min(4,(row.sources||[]).length)*5)}
function decision(row){
  if(!dated(row))return{code:'WATCH',label:'URMĂREȘTE',reason:'Semnal public legat de produs; data lansării nu este încă demonstrată.'};
  if(Number(row.eligibleSources||0)>=2)return{code:'PREPARE',label:'PREGĂTEȘTE / URMĂREȘTE',reason:'Eveniment datat și confirmat de mai multe tipuri de surse.'};
  return{code:'WATCH',label:'URMĂREȘTE',reason:'Eveniment datat; este necesară încă o confirmare independentă pentru o achiziție serioasă.'};
}
function radarRow(row){return{kind:'product',eventId:row.id,familyKey:row.familyKey||familyKey(row),category:row.category,typology:row.typology,mentions30d:Number(row.sourceCount||0),sourceTypeCount:Number(row.eligibleSources||0),newestSignalHours:Number(row.ageHours||0),maturityStage:row.stage,maturityLabel:row.stageLabel,confidence:confidence(row),productDetailAvailable:true,decision:decision(row)}}
function categorySummary(rows){return{signals:rows.reduce((sum,row)=>sum+Number(row.mentions30d||0),0),events:rows.length,buyHype:0,buyTrend:0,prepareAccessories:0,prepare:rows.filter(row=>row.decision.code==='PREPARE').length,watch:rows.filter(row=>row.decision.code==='WATCH').length,stop:0}}
function evidenceEvent(row){return{eventId:row.id,familyKey:row.familyKey||familyKey(row),kind:row.window==='after'?'released':'upcoming',category:row.category,typology:row.typology,productName:row.productName,brand:row.brand||'',authenticityState:row.authenticityState||canonicalProductFamily(row).authenticityState,variantCount:Number(row.variantCount||1),stages:unique([row.stageLabel,row.stage]),sourceTypeCount:eligibleSourceTypes(row).length,sourceHostCount:sourceHosts(row).length,sources:(row.sources||[]).map(source=>({...source}))}}
function heartbeatRow(row){return{eventId:row.id,familyKey:row.familyKey||familyKey(row),productName:row.productName,brand:row.brand||'',category:row.category,typology:row.typology,maturityStage:row.stage,maturityLabel:row.stageLabel,publishedAt:row.eventDate,eventDate:row.eventDate,firstSeenAt:row.firstSeenAt,ageHours:row.ageHours,sourceCount:row.sourceCount,eligibleSourceCount:row.eligibleSources,discoveryOnly:Number(row.eligibleSources||0)===0,status:Number(row.eligibleSources||0)>=2?'CONFIRMED':Number(row.eligibleSources||0)===1?'EARLY':'DISCOVERY',productDetailAvailable:true,dateConfidence:row.dateConfidence,confidenceTier:row.confidenceTier}}
function heartbeatEvidenceRows(rows){const output=[];for(const row of rows)for(const source of row.sources||[])output.push({eventId:row.id,familyKey:row.familyKey||familyKey(row),kind:row.window==='after'?'released':'upcoming',category:row.category,typology:row.typology,productName:row.productName,brand:row.brand||'',sourceType:source.sourceType||'',sourceBucket:source.decisionEligible===false?'discovery':'verified',sourceHost:source.host||'',decisionEligible:source.decisionEligible!==false,discoveryOnly:source.decisionEligible===false,url:source.url||'',title:source.title||row.productName,publishedAt:source.publishedAt||null,eventDate:row.eventDate,dateQuality:source.dateConfidence||row.dateConfidence,maturityStage:row.stage,maturityLabel:row.stageLabel,firstSeenAt:row.firstSeenAt,lastSeenAt:row.lastSeenAt});return output}
const GENERIC_MODEL_TOKENS=new Set(['vape','vaping','mod','mods','kit','kits','pod','pods','system','systems','device','devices','product','products','official','shop','store','collection','collections','range']);
const FALSE_CANDIDATE=/\b(?:veeva systems|stock price|stock quote|company profile|google finance|yahoo finance|cnn markets?|lennar|follow(?:er|ers)|discontinued|best ecig store|(?:box mod|vape|ecig|e cigarette) manufacturer|vape pod systems?\s*&\s*disposables|vape tanks?,?\s*pod mod kits?\s*&\s*accessories|smoktech mods?,?\s*pod\s*&\s*starter kits?|smoktech pens?,?\s*mods?,?\s*and pod systems?|rebuildables?\s*[-–—:]?\s*rda,?\s*rta|rda,?\s*rta,?\s*(?:and|&)\s*tanks?|keep it real)\b/i;
const FALSE_SOURCE=/(?:wikipedia\.org|finance\.yahoo|google\.[^/]+\/finance|cnn\.com\/markets|linkedin\.com\/company)/i;
function concreteCandidate(candidate,defaultCategory){if(candidate&&candidate.named===false)return false;const title=candidate.productName||candidate.product||'',url=candidate.url||'';if(FALSE_CANDIDATE.test(title)||FALSE_SOURCE.test(url))return false;const identity=canonicalProductFamily({productName:title,brand:candidate.brand||candidate.maker||'',category:candidate.category||defaultCategory}),tokens=String(identity.model||'').toLowerCase().match(/[a-z0-9]+/g)||[];return tokens.some(token=>!GENERIC_MODEL_TOKENS.has(token))}
function observedRange(old,candidate,fallback){const firstValues=[old&&old.firstObservedAt,candidate.firstObservedAt,candidate.observedAt].filter(value=>Number.isFinite(Date.parse(value))),lastValues=[old&&old.lastObservedAt,candidate.lastObservedAt,candidate.observedAt].filter(value=>Number.isFinite(Date.parse(value))),first=firstValues.length?new Date(Math.min(...firstValues.map(Date.parse))).toISOString():fallback,lastCandidates=lastValues.concat(first).filter(value=>Number.isFinite(Date.parse(value))),last=lastCandidates.length?new Date(Math.max(...lastCandidates.map(Date.parse))).toISOString():first;return{first,last}}
function queueCategory(candidate,defaultCategory){const category=candidate.category||defaultCategory;if(defaultCategory==='POD')return category==='POD'?'POD':'';return ['RTA','MODURI','ACCESORII'].includes(category)?category:''}
function sourceUrls(candidate){return unique((candidate.sources||[]).map(source=>typeof source==='string'?source:source&&source.url).concat(candidate.url||[]).filter(url=>/^https?:\/\//i.test(String(url||''))&&!FALSE_SOURCE.test(url)))}
function recentCandidate(candidate,document){const reference=Date.parse(document.snapshotReferenceAt||document.generatedAt),observed=Date.parse(candidate.lastObservedAt||candidate.observedAt||candidate.firstObservedAt||document.generatedAt);return!Number.isFinite(reference)||!Number.isFinite(observed)||Math.abs(reference-observed)<=31*864e5}
function reconcileQueue(document,radar,defaultCategory,extraCandidates=[]){
  const published=new Set((document.products||[]).map(row=>verificationFamilyKey(row,defaultCategory))),map=new Map(),candidates=[];
  candidates.push(...(document.verificationQueue||[]));
  candidates.push(...extraCandidates);
  if(defaultCategory!=='POD'){
    candidates.push(...(radar.verificationQueue||[]));
    candidates.push(...(document.scan&&document.scan.activeMakerRejectedSample||[]));
  }
  for(const candidate of candidates){
    const name=candidate&&candidate.productName||candidate&&candidate.product||'',category=queueCategory(candidate||{},defaultCategory),key=name&&category&&verificationFamilyKey({...candidate,category},defaultCategory),urls=sourceUrls(candidate||{});
    if(!key||published.has(key)||!category||!urls.length||!recentCandidate(candidate,document)||!concreteCandidate({...candidate,category,url:urls[0]},defaultCategory))continue;
    const old=map.get(key),sources=unique([...(old&&old.sources||[]),...urls]),observed=observedRange(old,candidate,document.generatedAt),display=old&&old.productName&&old.productName.length<=name.length?old.productName:name,pod=category==='POD'&&classifyPodProduct([candidate.brand||candidate.maker||'',name].join(' '));
    map.set(key,{...(old||{}),...candidate,productName:display,category,segment:candidate.segment||pod&&pod.segment||null,typology:candidate.typology||pod&&pod.typology||null,familyKey:key,signalKind:'undated-identifiable-product',confidenceTier:'watch',reason:['noEventOrDate','noDateOrEvent','no-direct-dated-event'].includes(candidate.reason)?'undatedPublicAnnouncement':candidate.reason||'underVerification',firstObservedAt:observed.first,lastObservedAt:observed.last,sources,url:candidate.url&&!FALSE_SOURCE.test(candidate.url)?candidate.url:old&&old.url||sources[0]||null})
  }
  return Array.from(map.values()).sort((a,b)=>String(b.lastObservedAt||'').localeCompare(String(a.lastObservedAt||'')));
}
function syncQueueCoverage(document,defaultCategory){
  const scan=document.scan||{},queue=document.verificationQueue||[];
  if(defaultCategory==='POD'&&scan.segmentCoverage){
    scan.segmentCoverage=Object.fromEntries(Object.entries(scan.segmentCoverage).map(([segment,value])=>[segment,{...value,queued:queue.filter(candidate=>candidate.segment===segment).length}]));
  }else if(defaultCategory!=='POD'&&scan.categoryCoverage){
    scan.categoryCoverage=Object.fromEntries(Object.entries(scan.categoryCoverage).map(([category,value])=>[category,{...value,queued:queue.filter(candidate=>candidate.category===category).length}]));
  }
  document.scan=scan;
}
function reconcile(){
  const products=read(FILES.products),pods=read(FILES.pods),radar=read(FILES.radar),evidence=read(FILES.evidence),heartbeat=read(FILES.heartbeat),heartbeatEvidence=read(FILES.heartbeatEvidence),discovery=readOptional(FILES.discovery,{undatedCandidates:[]});
  const generatedAt=products.generatedAt||new Date().toISOString(),rows=products.products||[],before=rows.filter(row=>row.window==='before'),beforeDated=before.filter(dated),after=rows.filter(row=>row.window==='after'),afterDated=after.filter(dated);
  const discoveryCandidates=(discovery.undatedCandidates||[]).map(candidate=>({...candidate,observedAt:candidate.observedAt||discovery.generatedAt||generatedAt}));
  products.verificationQueue=reconcileQueue(products,radar,'RTA',discoveryCandidates);
  products.summary={...(products.summary||{}),candidatesUnderVerification:products.verificationQueue.length};
  products.truth={...(products.truth||{}),finalPublicProjectionsReconciled:true,undatedSignalsPreservedInVerificationQueue:true};
  syncQueueCoverage(products,'RTA');
  pods.verificationQueue=reconcileQueue(pods,radar,'POD',discoveryCandidates);
  pods.summary={...(pods.summary||{}),candidatesUnderVerification:pods.verificationQueue.length};
  pods.truth={...(pods.truth||{}),finalPublicProjectionsReconciled:true,undatedSignalsPreservedInVerificationQueue:true};
  syncQueueCoverage(pods,'POD');
  radar.generatedAt=generatedAt;radar.snapshotReferenceAt=products.snapshotReferenceAt;radar.categories=Object.fromEntries(CATEGORIES.map(category=>[category,beforeDated.filter(row=>row.category===category).map(radarRow)]));radar.summary=Object.fromEntries(CATEGORIES.map(category=>[category,categorySummary(radar.categories[category])]));
  radar.sourceStatus={...(radar.sourceStatus||{}),finalConcreteProducts:rows.length,finalBeforeProducts:before.length,finalAfterProducts:after.length,finalDatedEvents:rows.filter(dated).length,finalPublicSignals:rows.filter(row=>!dated(row)).length,finalUndatedCandidates:products.verificationQueue.length};
  radar.truth={...(radar.truth||{}),finalPublicProjectionsReconciled:true,modelFamilyVariantsGrouped:true,undatedSignalsPreservedInVerificationQueue:true};
  radar.verificationQueue=products.verificationQueue;
  evidence.generatedAt=generatedAt;evidence.snapshotReferenceAt=products.snapshotReferenceAt;evidence.events=rows.map(evidenceEvent);evidence.scan={...(evidence.scan||{}),acceptedEvidenceEvents:evidence.events.length,undatedCandidates:products.verificationQueue.length};evidence.truth={...(evidence.truth||{}),finalPublicProjectionsReconciled:true,modelFamilyVariantsGrouped:true};
  heartbeat.generatedAt=generatedAt;heartbeat.snapshotReferenceAt=products.snapshotReferenceAt;heartbeat.releasedLast30Days=afterDated.map(heartbeatRow);heartbeat.summary={...(heartbeat.summary||{}),releasedLast30Days:heartbeat.releasedLast30Days.length,productRelevanceValidated:true};heartbeat.finalPublicProjectionsReconciled=true;
  heartbeatEvidence.generatedAt=generatedAt;heartbeatEvidence.snapshotReferenceAt=products.snapshotReferenceAt;heartbeatEvidence.upcomingEvents=heartbeatEvidenceRows(beforeDated);heartbeatEvidence.events=heartbeatEvidenceRows(afterDated);heartbeatEvidence.finalPublicProjectionsReconciled=true;
  return{products,pods,radar,evidence,heartbeat,heartbeatEvidence};
}
function validate(documents){
  const rows=documents.products.products||[],families=rows.map(familyKey),beforeIds=new Set(rows.filter(row=>row.window==='before'&&dated(row)).map(row=>row.id)),eventIds=new Set(rows.map(row=>row.id)),afterIds=new Set(rows.filter(row=>row.window==='after'&&dated(row)).map(row=>row.id));
  need(new Set(families).size===families.length,'RTA/mod/accessory product families are duplicated');
  const radarIds=new Set(CATEGORIES.flatMap(category=>(documents.radar.categories[category]||[]).map(row=>row.eventId)));
  need(beforeIds.size===radarIds.size&&Array.from(beforeIds).every(id=>radarIds.has(id)),'Radar is not reconciled with final before-market products');
  const evidenceIds=new Set((documents.evidence.events||[]).map(row=>row.eventId));
  need(eventIds.size===evidenceIds.size&&Array.from(eventIds).every(id=>evidenceIds.has(id)),'Evidence projection is not reconciled with final products');
  const heartbeatIds=new Set((documents.heartbeat.releasedLast30Days||[]).map(row=>row.eventId));
  need(afterIds.size===heartbeatIds.size&&Array.from(afterIds).every(id=>heartbeatIds.has(id)),'Heartbeat is not reconciled with final dated after-market products');
  const published=new Set(rows.map(row=>verificationFamilyKey(row,'RTA'))),productQueueKeys=new Set();for(const candidate of documents.products.verificationQueue||[]){need(!published.has(candidate.familyKey),'Published family also exists in the verification queue');need(!productQueueKeys.has(candidate.familyKey),'Duplicate family exists in the RTA verification queue');productQueueKeys.add(candidate.familyKey)}
  const podPublished=new Set((documents.pods.products||[]).map(row=>verificationFamilyKey(row,'POD'))),podQueueKeys=new Set();for(const candidate of documents.pods.verificationQueue||[]){need(!podPublished.has(candidate.familyKey),'Published POD family also exists in the verification queue');need(!podQueueKeys.has(candidate.familyKey),'Duplicate family exists in the POD verification queue');podQueueKeys.add(candidate.familyKey)}
  const categoryQueued=Object.values(documents.products.scan&&documents.products.scan.categoryCoverage||{}).reduce((sum,value)=>sum+Number(value.queued||0),0);
  const segmentQueued=Object.values(documents.pods.scan&&documents.pods.scan.segmentCoverage||{}).reduce((sum,value)=>sum+Number(value.queued||0),0);
  need(categoryQueued===(documents.products.verificationQueue||[]).length,'RTA/MOD queue counters do not match the final queue');
  need(segmentQueued===(documents.pods.verificationQueue||[]).length,'POD segment queue counters do not match the final queue');
  need(documents.products.truth.finalPublicProjectionsReconciled===true&&documents.radar.truth.finalPublicProjectionsReconciled===true,'Final reconciliation flags are missing');
  return{families:families.length,before:beforeIds.size,afterDated:afterIds.size,undatedCandidates:(documents.products.verificationQueue||[]).length};
}

if(require.main===module){
  try{
    const documents=reconcile(),summary=validate(documents);
    if(WRITE)for(const [key,file] of Object.entries(FILES))if(documents[key])save(file,documents[key]);
    if(CHECK||WRITE)console.log(`Hype public reconciliation PASS: ${summary.families} families; ${summary.before} before; ${summary.afterDated} dated after; ${summary.undatedCandidates} undated candidates.`);
    else console.log(JSON.stringify(summary,null,2));
  }catch(error){console.error(error.stack||error);process.exit(1)}
}

module.exports={dated,reconcileQueue,reconcile,validate};
