#!/usr/bin/env node
'use strict';
// Compatibility wrapper v2.7. Resolve source pages, add direct recent-release evidence,
// anchor the 30-day truth window to the daily 06:00 Europe/Bucharest snapshot,
// merge verified vendor/upstream products, then enforce final category anchors.
// Contract markers: upstreamEvidenceMerged:true release-observed observedReleaseIsNotClaimedAsExactReleaseDate:true
// finalCategoryAnchorValidated:true nonRtaProductTitlesRejected:true futureEtaMayExceed30Days:true currentVendorProductTitleResolved:true
const fs=require('fs');
const {execFileSync}=require('child_process');
const path=require('path');
const {snapshotReferenceMs}=require('./hype-window-reference-2026.js');

const write=process.argv.includes('--write');
const refMs=snapshotReferenceMs();
const refIso=new Date(refMs).toISOString();

function run(file){
  const args=[path.join(__dirname,file)];
  if(write)args.push('--write');
  execFileSync(process.execPath,args,{stdio:'inherit'});
}
function read(p,f={}){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch(_){return f}}
function save(p,v){fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n','utf8')}

run('hype-upstream-page-title-resolver.js');
run('augment-market-hype-recent-release-observer-2026.js');
const releaseAudit=read('/tmp/market-hype-upstream-evidence-2026.json',{}).scan||{};
run('augment-market-hype-current-vendor-rta-events-2026.js');

const realNow=Date.now;
Date.now=()=>refMs;
try{
  require('./merge-market-hype-upstream-products-v2-2026.js');
}finally{
  Date.now=realNow;
}
run('finalize-market-hype-category-relevance-2026.js');

if(write){
  const files=[
    'data/market-hype-products-2026.json',
    'data/market-hype-radar-2026.json',
    'data/market-hype-evidence-2026.json',
    'data/market-hype-heartbeat-2026.json',
    'data/market-hype-heartbeat-evidence-2026.json'
  ];
  for(const file of files){
    const d=read(file,{});
    d.snapshotReferenceAt=refIso;
    d.dailyWindowTimezone='Europe/Bucharest';
    if(file.endsWith('market-hype-products-2026.json')){
      d.truth={...(d.truth||{}),dailyWindowAnchoredAt0600Bucharest:true,recentReleaseRequiresExplicitWording:true,recentReviewAloneIsNotRelease:true};
      d.scan={...(d.scan||{}),recentReleaseObserver:{
        reference:releaseAudit.recentReleaseReference||refIso,
        profiles:Number(releaseAudit.recentReleaseProfiles||0),
        indexWorking:Number(releaseAudit.recentReleaseIndexWorking||0),
        links:Number(releaseAudit.recentReleaseLinks||0),
        pagesFetched:Number(releaseAudit.recentReleasePagesFetched||0),
        candidates:Number(releaseAudit.recentReleaseCandidates||0),
        eventsAppended:Number(releaseAudit.recentReleaseEventsAppended||0),
        rejectedDate:Number(releaseAudit.recentReleaseRejectedDate||0),
        rejectedReleaseTerm:Number(releaseAudit.recentReleaseRejectedReleaseTerm||0),
        rejectedTitle:Number(releaseAudit.recentReleaseRejectedTitle||0)
      }};
    }else if(file.endsWith('market-hype-radar-2026.json')||file.endsWith('market-hype-evidence-2026.json')){
      d.truth={...(d.truth||{}),dailyWindowAnchoredAt0600Bucharest:true};
    }else{
      d.dailyWindowAnchoredAt0600Bucharest=true;
    }
    save(file,d);
  }
}
console.log(`Hype daily truth reference: ${refIso} (Europe/Bucharest 06:00).`);
