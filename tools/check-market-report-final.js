#!/usr/bin/env node
'use strict';
const fs=require('fs');
function read(p){return fs.readFileSync(p,'utf8')}
function need(ok,msg){if(!ok)throw new Error(msg)}
const view=read('assets/market-view-switcher.js');
const css=read('assets/market-view-switcher.css');
const enhancements=read('assets/enhancements.js');
const sw=read('sw.js');
const mgmt=read('assets/market-management-v2.js');
const synth=read('assets/market-analysis-synthesis.js');
const source=read('assets/market-source-info.js');
need(view.includes("setTechnical(root,mode==='sources')"),'Base Market layer is not source-only');
need(view.includes("BASE='market2026Body'"),'Base Market body is not explicitly controlled');
need(view.includes("replace(/\\bNaN\\b/g,'—')"),'NaN display sanitizer missing');
need(view.includes('market-analysis-source-only'),'Technical management coverage is not separated');
need(css.includes('#market2026Root:not([data-market-primary-view="sources"])>#market2026Body'),'Base body can leak into Analysis/Hype');
need(css.includes('.market-empty-fact{display:none!important}'),'Empty fact pills are not suppressed');
need(css.includes('#market2026Root .market-hero .market-metrics'),'Legacy hero metrics are still exposed');
for(const label of ['Analiza','Hype','Info surse'])need(view.includes(label),`Missing primary view ${label}`);
need(mgmt.includes('May be?...'),'May be?... heading missing');
for(const label of ['Top România','Rotație','Sinteză','Management'])need(synth.includes(label),`Missing analysis block ${label}`);
need(source.includes('Dovezi și trimiteri'),'Source evidence section missing');
need(source.includes('market-hype-evidence-2026.json'),'Hype evidence links are not in Source info');
need(enhancements.includes('market-loading-guard.js?v=12'),'Loader is not using Market guard v12');
need(enhancements.includes('market-view-switcher.js?v=6'),'Loader is not using view switcher v6');
need(sw.includes('v32-market-final-report'),'Service worker cache was not bumped');
need(sw.includes('market-view-switcher.js?v=6'),'Service worker caches wrong Market switcher');
for(const p of ['.github/workflows/market-2026-sync.yml','.github/workflows/market-sales-2026-sync.yml','.github/workflows/market-hype-2026-sync.yml']){
  const w=read(p);need(w.includes('Europe/Bucharest'),`${p}: Bucharest timezone gate missing`);need(w.includes('0 3 * * *')&&w.includes('0 4 * * *'),`${p}: DST-safe 06:00 crons missing`);
}
console.log('Market final report gate OK: Analysis/Hype/Source info separated; no legacy Market body in Analysis; 06:00 preserved.');
