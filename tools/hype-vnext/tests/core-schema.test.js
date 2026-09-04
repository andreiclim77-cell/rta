#!/usr/bin/env node
'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {SCHEMA_VERSION,ENTITY_SCHEMA_VERSION}=require('../lib/schema-contract.js');
const {eventTypeFor}=require('../lib/event-claim.js');
const {adaptFixtureCase}=require('../ingest/current-evidence-adapter.js');

const ROOT=path.resolve(__dirname,'..','..','..');
const DATA=path.join(ROOT,'data','hype-vnext');
let assertions=0;
function check(condition,message){assertions++;assert.ok(condition,message)}
function load(file){return JSON.parse(fs.readFileSync(path.join(DATA,file),'utf8'))}
function fixture(id){for(const file of ['gold-set.json','adversarial.json']){const data=JSON.parse(fs.readFileSync(path.join(ROOT,'data','hype-benchmark','fixtures',file),'utf8')),found=data.cases.find(row=>row.id===id);if(found)return found}throw new Error(`Fixture not found: ${id}`)}
function unique(rows,label){check(new Set(rows.map(row=>row.id)).size===rows.length,`${label} IDs must be unique`)}

function main(){
  const schema=load('schema-version.json'),products=load('products.json'),evidence=load('evidence.json'),claims=load('event-claims.json');
  check(schema.schemaVersion===SCHEMA_VERSION&&schema.entitySchemaVersion===ENTITY_SCHEMA_VERSION,'HYPE Phase 1 schema version mismatch');
  check(schema.phase===1&&schema.mode==='ADDITIVE_SHADOW','HYPE Phase 1 must remain additive shadow');
  check(schema.publicUiCutover===false&&schema.productionCollectorCutover===false&&schema.scoringCutover===false,'Phase 1 must not cut over production behavior');
  check(schema.clocks.signalObservationWindowDays===30&&schema.clocks.recentReleaseWindowDays===30&&schema.clocks.forecastHorizonDays===180&&schema.clocks.historyMemoryDays===730,'Independent HYPE clocks are missing');
  check(schema.truthInvariants.includes('observation_date_is_not_release_date')&&schema.truthInvariants.includes('derivative_pages_are_not_independent_origins'),'Core HYPE truth invariants missing');
  check(eventTypeFor({stage:'RETAIL_PROMOTION',stageLabel:'promovare recenta pentru model existent'},{sourceType:'retailer-campaign'})==='RETAIL_PROMOTION','Romanian existing-product copy was falsely parsed as ETA/preorder');
  check(eventTypeFor({stage:'FIRST_RETAIL',stageLabel:'prima listare comerciala datata'},{sourceType:'retailer-direct'})==='FIRST_RETAIL_OBSERVATION','A dated retail listing was falsely parsed as ETA/preorder');
  check(eventTypeFor({stage:'PUBLIC_SIGNAL',stageLabel:'precomanda deschisa ETA 15 octombrie'},{sourceType:'manufacturer'})==='PREORDER_OPEN','A real preorder/ETA signal was not preserved');
  for(const [label,document] of Object.entries({products,evidence,claims})){
    check(document.schemaVersion===SCHEMA_VERSION,`${label} schema mismatch`);check(document.entitySchemaVersion===ENTITY_SCHEMA_VERSION,`${label} entity schema mismatch`);check(document.count===document.rows.length,`${label} count mismatch`);unique(document.rows,label);
  }
  check(products.rows.some(row=>row.category==='RTA')&&products.rows.some(row=>row.category==='MODURI')&&products.rows.some(row=>row.category==='POD'),'RTA, mod and POD products were not all ingested');
  check(products.rows.some(row=>row.authenticityState==='CLONE')&&products.rows.some(row=>row.authenticityState==='AUTHENTIC'),'Clone/authentic distinction was lost');
  const productIds=new Set(products.rows.map(row=>row.id)),evidenceIds=new Set(evidence.rows.map(row=>row.id));
  for(const row of evidence.rows){check(productIds.has(row.productId),`Evidence ${row.id} references a missing product`);check(row.claimedEventAt!==row.sourcePublishedAt||row.sourcePublishedAt==null||row.legacySource.dateConfidence!=='explicit-vendor-eta','ETA was silently treated as source publication time')}
  for(const row of claims.rows){check(productIds.has(row.productId),`Claim ${row.id} references a missing product`);check(evidenceIds.has(row.evidenceId),`Claim ${row.id} references missing evidence`);check(typeof row.clocks.signalWindowActive==='boolean'&&typeof row.clocks.recentReleaseWindowActive==='boolean',`Claim ${row.id} lacks split clocks`)}
  for(const product of products.rows){check(product.evidenceIds.length>0&&product.claimIds.length>0,`Product ${product.id} lost all evidence or claims`);for(const id of product.evidenceIds)check(evidenceIds.has(id),`Product ${product.id} references missing evidence ${id}`)}

  const timeline=adaptFixtureCase(fixture('gold-010-rumor-confirmed-timeline'),'2026-08-31T03:00:00.000Z');
  check(new Set(timeline.claims.map(row=>row.eventType)).has('RUMOR')&&new Set(timeline.claims.map(row=>row.eventType)).has('OFFICIAL_ANNOUNCEMENT'),'Rumor-to-confirmation timeline was collapsed');
  check(timeline.claims.length===2&&timeline.product.claimIds.length===2,'Multiple lifecycle claims were not preserved');
  const copied=adaptFixtureCase(fixture('adv-010-copied-press-release'),'2026-08-31T03:00:00.000Z');
  check(copied.evidence.length===20,'Copied press evidence was destructively removed');
  check(new Set(copied.evidence.map(row=>row.provisionalOriginId)).size===1,'Twenty copied pages should share one provisional origin');
  const reviewer=adaptFixtureCase(fixture('adv-011-reviewer-crosspost'),'2026-08-31T03:00:00.000Z');
  check(reviewer.evidence.length===3&&new Set(reviewer.evidence.map(row=>row.provisionalOriginId)).size===1,'One reviewer cross-post must remain one provisional origin');
  const longRange=adaptFixtureCase(fixture('gold-005-long-range-teaser'),'2026-08-31T03:00:00.000Z').claims[0];
  check(longRange.clocks.signalWindowActive===true&&longRange.clocks.forecastBand!=='NEXT_30_DAYS','Fresh long-range signal was incorrectly deleted by release window');
  check(longRange.clocks.recentReleaseWindowActive===false,'Teaser was incorrectly promoted to recent release');
  const official=adaptFixtureCase(fixture('gold-001-official-rta-release'),'2026-08-31T03:00:00.000Z').claims[0];
  check(official.eventType==='OFFICIAL_RELEASE'&&official.clocks.recentReleaseWindowActive===true,'Official recent release did not enter release clock');
  const relisting=adaptFixtureCase(fixture('adv-001-known-relisting'),'2026-08-31T03:00:00.000Z');
  check(relisting.claims.some(row=>row.eventType==='PRIOR_EXISTENCE'&&row.warnings.includes('KNOWN_BEFORE_WINDOW')),'Prior-existence evidence was lost');
  check(relisting.claims.filter(row=>row.eventType!=='PRIOR_EXISTENCE').every(row=>row.clocks.recentReleaseWindowActive===false),'Known relisting became a release');
  console.log(`HYPE vNext Phase 1 core schema PASS: ${assertions} assertions; ${products.count} products; ${evidence.count} immutable evidence rows; ${claims.count} event claims.`);
}

try{main()}catch(error){console.error(error.stack||error);process.exit(1)}
