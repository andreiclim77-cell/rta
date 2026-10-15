'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const rows=JSON.parse(fs.readFileSync('rta-lab/catalog/liquids-20261015.json','utf8'));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
assert.equal(rows.length,700);assert.equal(new Set(rows.map(r=>r.id)).size,700);
assert.equal(new Set(rows.map(r=>[r.brand,r.name,r.line].map(norm).join('|'))).size,700);
const categories=['NET simplu','NET complex','Tutun simplu','Tutun complex'];
for(const row of rows){
 assert.ok(row.brand&&row.name&&row.profile&&categories.includes(row.class));
 assert.ok(!['Profil reper','Personal'].includes(row.brand),'Generic reference and personal benchmark are not commercial products');
 assert.ok(row.sources.some(s=>s.type==='manufacturer'||s.type==='independent_review'||['E-Tobacco','Joyetech EU'].includes(s.publisher)));
 assert.ok(row.sources.every(s=>/^https:\/\//.test(s.url)&&s.publisher&&s.accessed==='2026-10-15'));
 assert.ok(row.evidenceLimit&&row.classReason&&row.recipeGroup);
 assert.ok(!/\b(?:\d+\s*ml|\d+\s*mg|liquido pronto|aroma concentrato)\b/i.test(row.name),'Bottle and strength are not product identities: '+row.name);
}
for(const name of ['Myrtilla','Crazy Cola','MilkShake - Chocolate','Mister Rock'])assert.ok(!rows.some(r=>r.brand==='TNT Vape'&&r.name===name));
assert.ok(!rows.some(r=>r.brand==='Blendfeel'&&/pianeta menta/i.test(r.line)),'Mint-only products cannot enter the tobacco library');
assert.ok(!rows.some(r=>r.brand==='Halo'&&r.name==='Fusion'),'Unflavored is outside the library');
const cm=rows.filter(r=>r.brand==='Centenary Mods');assert.equal(cm.length,12);
const secret=cm.find(r=>r.name==='Merde de Cheval');assert.equal(secret.recommendable,false);assert.equal(secret.facts.length,0);assert.ok(/secret/i.test(secret.profile));
const balkan=cm.find(r=>r.name==='Balkan Milestone');assert.ok(/Basma.*Smyrna.*Latakia/.test(balkan.profile));assert.ok(!balkan.tags.includes('virginia'));
const env={window:{}};vm.createContext(env);const load=p=>vm.runInContext(fs.readFileSync('rta-lab/'+p,'utf8'),env,{filename:p});
for(const p of ['data/atoms-1.js','data/atoms-2.js','data/atoms-3.js','data/wires.js','data/core.js','atlas-preview/catalog.js','data/bell-liquid-fit.js','data/sensory-core.js','mood-match.js','atlas-preview/context.js','atlas-preview/liquid-picker.js'])load(p);
const w=env.window,search=w.RTA_ATLAS_SEARCH,core=w.RTA_SENSORY_CORE;
assert.equal(w.RTA_ATLAS_CATALOG.sha256,crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex'));
assert.equal(search.find('centenary mods Balcan milestone').rows[0].liquid.id,balkan.id);
assert.equal(search.find('Mer de cheval').rows[0].liquid.id,secret.id);
assert.equal(search.find('Virginia Hangsen').rows[0].liquid.name,'Virginia Tobacco');
assert.ok(search.find('7 Foglie').rows.some(r=>r.liquid.brand==='FlavourArt'&&r.liquid.name==='7 Leaves'));
const audit={edition:w.RTA_ATLAS_CATALOG,method:'Model fit, not a popularity or personal A/B score',rankings:[]};
for(const atom of w.RTA_CORE.atoms)for(const [goal] of w.RTA_ATLAS_CONTEXT.goals){
 const config=core.defaultConfig(atom.id),top=search.top(config,goal,5);
 assert.equal(top.length,5);assert.equal(new Set(top.map(r=>r.liquid.recipeGroup)).size,5);
 assert.ok(top.every(r=>r.liquid.recommendable!==false&&rows.some(x=>x.id===r.liquid.id)&&Number.isFinite(r.score)));
 assert.ok(top.every((r,i)=>i===0||top[i-1].score>=r.score));
 audit.rankings.push({config,goal,top:top.map(r=>({id:r.liquid.id,brand:r.liquid.brand,name:r.liquid.name,line:r.liquid.line}))});
}
if(process.env.RTA_CATALOG_RECEIPT==='1'){fs.mkdirSync('artifacts/atlas-v02-mobile',{recursive:true});fs.writeFileSync('artifacts/atlas-v02-mobile/catalog-top-audit.json',JSON.stringify(audit,null,2));}
console.log('CATALOG QUALITY PASS: 700 sourced identities, no packaging duplicates or generic references; Centenary aliases/secret formula, all 96 platform/objective top-fives recalculated, one result per named recipe.');
