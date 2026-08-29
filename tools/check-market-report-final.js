#!/usr/bin/env node
'use strict';
const fs=require('fs');
function read(p){return fs.readFileSync(p,'utf8')}
function json(p){return JSON.parse(read(p))}
function need(ok,msg){if(!ok)throw new Error(msg)}
const view=read('assets/market-view-switcher.js');
const css=read('assets/market-view-switcher.css');
const enhancements=read('assets/enhancements.js');
const sw=read('sw.js');
const mgmt=read('assets/market-management-v2.js');
const synth=read('assets/market-analysis-synthesis.js');
const source=read('assets/market-source-info.js');
const hype=read('assets/market-hype-ui.js');
const guard=read('assets/market-loading-guard.js');
const recovery=read('assets/market-ui-recovery.js');
const access=read('assets/market-access-policy.js');
const wide=read('tools/collect-market-hype-wide-2026.js');
const cfg=json('data/market-hype-sources-2026.json');
const hypeFlow=read('.github/workflows/market-hype-2026-sync.yml');

need(view.includes("setTechnical(root,mode==='sources')"),'Base Market layer is not source-only');
need(view.includes("BASE='market2026Body'"),'Base Market body is not explicitly controlled');
need(view.includes("replace(/\\bNaN\\b/g,'—')"),'NaN display sanitizer missing');
need(view.includes('market-analysis-source-only'),'Technical management coverage is not separated');
need(css.includes('#market2026Root:not([data-market-primary-view="sources"])>#market2026Body'),'Base body can leak into Analysis/Hype');
need(css.includes('.market-empty-fact{display:none!important}'),'Empty fact pills are not suppressed');
for(const label of ['Analiza','Hype','Info surse'])need(view.includes(label),`Missing primary view ${label}`);
need(mgmt.includes('May be?...'),'May be?... heading missing');
need(view.includes('ANALIZĂ · ROMÂNIA · ACTUALIZARE 06:00 · Ce se vinde cel mai bine'),'Requested Analysis kicker missing');
for(const label of ['Top România','Rotație','Sinteză','Management'])need(synth.includes(label),`Missing analysis block ${label}`);
need(source.includes('Dovezi și trimiteri'),'Source evidence section missing');
need(source.includes('market-hype-heartbeat-evidence-2026.json'),'Heartbeat evidence missing from Info surse');
need(source.includes('GLOBAL pentru RTA + clone RTA'),'Info surse does not state global Hype scope');

for(const asset of ['/assets/market-loading-guard.js?v=13','/assets/market-ui-recovery.js?v=6','/assets/market-hype-ui.js?v=5','/assets/market-view-switcher.js?v=7'])need(enhancements.includes(asset),`Loader is not on final asset ${asset}`);
need(enhancements.includes('/assets/market-access-policy.js?v=1'),'Per-entry password policy is not loaded before Market');
for(const asset of ['/assets/market-loading-guard.js?v=13','/assets/market-ui-recovery.js?v=6','/assets/market-hype-ui.js?v=5','/assets/market-view-switcher.js?v=7','/assets/market-source-info.js?v=3','/assets/market-access-policy.js?v=1'])need(sw.includes(asset),`Service worker is not on final asset ${asset}`);
need(sw.includes('ghid-rta-static-v34-hype-global-30d'),'Final service worker cache version missing');
need(recovery.includes('market-hype-ui.js?v=5')&&recovery.includes('market-view-switcher.js?v=7'),'Recovery can inject old Hype assets');
need(guard.includes("key:'heartbeat'")&&guard.includes("windowDays)===30")&&guard.includes("scope==='GLOBAL RTA + clone RTA'"),'Atomic guard does not validate both Hype windows');

need(access.includes("sessionStorage.removeItem(KEY)"),'Access policy does not clear previous session access');
need(access.includes("[data-tab=\"market2026\"]")||access.includes("[data-tab=\\\"market2026\\\"]")||access.includes('[data-tab="market2026"]'),'Access policy does not intercept Market entry');
need(access.includes('pageshow'),'Access policy does not clear access on page restore');

need(Number(cfg.hypeWindowDays)===30&&Number(cfg.lookbackHours)===720,'Hype config is not 30 days');
need(cfg.scope==='GLOBAL RTA + clone RTA','Hype config is not explicitly global');
need((cfg.cloneMakers||[]).length>=12,'Clone-maker coverage is too small');
for(const maker of ['SXK','ULTON','YFTK','SJMY','Kindbright','ShenRay','Tobeco'])need((cfg.cloneMakers||[]).some(x=>String(x).toLowerCase()===maker.toLowerCase()),`Clone maker missing: ${maker}`);
for(const d of ['2fdeal.com','3fvape.com','shareavape.com','ecigssa.co.za','vapoo.de','e-cigarette-forum.com','forum.planetofthevapes.co.uk'])need(JSON.stringify(cfg).includes(d),`Global discovery source missing: ${d}`);
for(const d of ['facebook.com','instagram.com','threads.net','tiktok.com','youtube.com','t.me','discord.com'])need((cfg.socialDiscoveryDomains||[]).includes(d),`Social discovery source missing: ${d}`);
need((cfg.openWebDiscoveryQueries||[]).some(x=>/Selbstwickler/i.test(x))&&(cfg.openWebDiscoveryQueries||[]).some(x=>/atomiseur/i.test(x))&&(cfg.openWebDiscoveryQueries||[]).some(x=>/atomizzatore/i.test(x)),'Multilingual global discovery queries missing');
need(cfg.authorizedSourcePolicy&&cfg.authorizedSourcePolicy.publicIndexableAlways===true,'Authorized/public source policy missing');

need(wide.includes("kind==='upcoming'")&&wide.includes("kind==='released'"),'Wide engine does not separate before/after release');
need(wide.includes('mergeMemory')&&wide.includes('720'),'30-day Hype memory missing');
need(wide.includes("mode:'after-first-heart-beat'")&&wide.includes('releasedLast30Days'),'After the first heart-beat output missing');
need(wide.includes('discoveryCommercialSourcesCanEscalate=false')||wide.includes('discoveryCommercialSourcesCanEscalate=false')||wide.includes('radar.truth.discoveryCommercialSourcesCanEscalate=false'),'Commercial discovery escalation boundary missing');
need(hype.includes('HYPE · GLOBAL · 30 ZILE'),'Global 30-day Hype heading missing');
need(hype.includes('Orice zvon relevant cu 30 zile înainte...'),'Requested rumor subtitle missing');
need(hype.includes('After the first heart-beat...'),'Heartbeat UI missing');
need(hype.includes('releasedLast30Days'),'Heartbeat release window missing');
need(view.includes('Global · înainte + după apariție · 30 zile'),'Hype nav summary is not final');

need(hypeFlow.includes("cron: '0 3 * * *'")&&hypeFlow.includes("cron: '0 4 * * *'")&&hypeFlow.includes('Europe/Bucharest'),'Hype 06:00 DST-safe schedule missing');
need(hypeFlow.includes('collect-market-hype-wide-2026.js --write'),'Global wide pass is not in the 06:00 workflow');
need(!hypeFlow.includes('collect-market-hype-heartbeat-2026.js --write'),'Duplicate heartbeat crawler must not run');

console.log('Market final gate OK: Analysis=Romania; Hype=GLOBAL 30d with before/after windows; sources separate; password every entry; one 06:00 pipeline; v34 cache.');
