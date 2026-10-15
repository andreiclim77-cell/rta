'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const rows=JSON.parse(fs.readFileSync('rta-lab/catalog/liquids-20261015.json','utf8'));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
assert.ok(!JSON.stringify(rows).includes('\ufffd'),'Catalog text must decode as UTF-8 without replacement characters');
assert.equal(rows.length,700);assert.equal(new Set(rows.map(r=>r.id)).size,700);
assert.equal(new Set(rows.map(r=>[r.brand,r.name,r.line].map(norm).join('|'))).size,700);
const categories=['NET simplu','NET complex','Tutun simplu','Tutun complex'];
const receipt=JSON.parse(fs.readFileSync('rta-lab/catalog/REVIEW_RECEIPT_20261015.json','utf8'));
const reconciliation=JSON.parse(fs.readFileSync('rta-lab/catalog/LEGACY_RECONCILIATION_20261015.json','utf8'));
assert.equal(reconciliation.rows.length,620);assert.equal(new Set(reconciliation.rows.map(r=>r.index)).size,620);
assert.ok(reconciliation.retainedOriginalRows>=500,'Verified original products must take priority over new additions');
assert.ok(reconciliation.rows.every(r=>r.reason&&r.status!=='pending_evidence'));
assert.ok(reconciliation.rows.filter(r=>r.target).every(r=>rows.some(x=>x.id===r.target&&x.legacyIndices.includes(r.index))));
for(const row of rows){
 assert.ok(row.brand&&row.name&&row.profile&&categories.includes(row.class));
 assert.ok(!['Profil reper','Personal'].includes(row.brand),'Generic reference and personal benchmark are not commercial products');
 assert.ok(row.sources.length&&row.sources.every(s=>['manufacturer','independent_review','retailer'].includes(s.type)&&receipt.sourcePublishers.includes(s.publisher)));
 assert.equal(row.selectionSignals,undefined,'Retailer ordering and missing review counts are not public popularity facts');
 assert.ok(row.sources.every(s=>/^https:\/\//.test(s.url)&&s.publisher&&/^2026-10-(14|15)$/.test(s.accessed)));
 assert.ok(row.evidenceLimit&&row.classReason&&row.recipeGroup);
 assert.ok(!/\b(?:\d+\s*ml|\d+\s*mg|liquido pronto|aroma concentrato)\b/i.test(row.name),'Bottle and strength are not product identities: '+row.name);
}
for(const name of ['Myrtilla','Crazy Cola','MilkShake - Chocolate','Mister Rock'])assert.ok(!rows.some(r=>r.brand==='TNT Vape'&&r.name===name));
assert.ok(!rows.some(r=>r.brand==='Blendfeel'&&/pianeta menta/i.test(r.line)),'Mint-only products cannot enter the tobacco library');
assert.ok(!rows.some(r=>r.brand==='Halo'&&r.name==='Fusion'),'Unflavored is outside the library');
assert.ok(!rows.some(r=>r.brand==='FlavourArt'&&['Black Touch','Blenderize','Liquid Amber'].includes(r.name)));
assert.ok(!rows.some(r=>r.brand==='Ripe Vapes'&&r.name==='VSC'));
for(const [brand,name] of [['Inawera','Gold Ducat'],['Flavorah','Arabian T'],['FlavourArt','Soho'],['Flavor West','Havana']])assert.ok(rows.some(r=>r.brand===brand&&r.name===name),'Keep verified established identities: '+brand+' '+name);
const vct=rows.find(r=>r.brand==='Ripe Vapes'&&r.name.toLowerCase()==='vct original');assert.ok(vct.tags.includes('vanilla')&&vct.tags.includes('cream')&&vct.tags.includes('nuts'));
assert.ok(!rows.find(r=>r.brand==='Hangsen'&&r.name==='Dry Tobacco').tags.includes('sweet'),'A negated sweetness claim must not produce a sweet tag');
assert.ok(!rows.find(r=>r.brand==="Azhad's Elixirs"&&r.name==='Van&Illa Supreme').tags.includes('cavendish'),'The manufacturer explicitly excludes Cavendish');
assert.ok(!rows.find(r=>r.brand==='TNT Vape'&&r.name==='Booms Origin').tags.includes('sweet'),'A negated Italian sweetness claim must not produce a sweet tag');
assert.equal(rows.find(r=>r.brand==='Pod Salt Origin'&&r.name==='Liquor Tobacco').class,'Tutun complex');
const cm=rows.filter(r=>r.brand==='Centenary Mods');assert.equal(cm.length,12);
const secret=cm.find(r=>r.name==='Merde de Cheval');assert.equal(secret.recommendable,false);assert.equal(secret.facts.length,0);assert.ok(/secret/i.test(secret.profile));
assert.ok(!/ferment/i.test(cm.find(r=>r.name==='Poils de Chevre').profile),'Cold maceration does not prove fermentation');
const balkan=cm.find(r=>r.name==='Balkan Milestone');assert.ok(/Basma.*Smyrna.*Latakia/.test(balkan.profile));assert.ok(!balkan.tags.includes('virginia'));
const env={window:{}};vm.createContext(env);const load=p=>vm.runInContext(fs.readFileSync('rta-lab/'+p,'utf8'),env,{filename:p});
for(const p of ['data/atoms-1.js','data/atoms-2.js','data/atoms-3.js','data/wires.js','data/core.js','atlas-preview/catalog.js','data/bell-liquid-fit.js','data/sensory-core.js','mood-match.js','atlas-preview/context.js','atlas-preview/liquid-picker.js'])load(p);
const w=env.window,search=w.RTA_ATLAS_SEARCH,core=w.RTA_SENSORY_CORE;
assert.equal(w.RTA_ATLAS_CATALOG.sha256,crypto.createHash('sha256').update(JSON.stringify(rows)).digest('hex'));
assert.equal(search.find('centenary mods Balcan milestone').rows[0].liquid.id,balkan.id);
assert.equal(search.find('Mer de cheval').rows[0].liquid.id,secret.id);
assert.equal(search.find('Virginia Hangsen').rows[0].liquid.name,'Virginia Tobacco');
assert.ok(search.find('7 Foglie').rows.some(r=>r.liquid.brand==='FlavourArt'&&r.liquid.name==='7 Leaves'));
for(const entry of reconciliation.rows.filter(r=>r.target)){
 const results=search.find(entry.original.brand+' '+entry.original.name).rows;
 assert.ok(results.some(r=>r.liquid.id===entry.target),'Preserved original must remain searchable: '+entry.original.brand+' '+entry.original.name);
}
for(const [brand,name] of [['Blendfeel','Balkan River'],['Pod Salt Origin','Royal Tobacco'],['Charlie Noble','Tripoli'],['Inawera','Gold Ducat'],['La Tabaccheria','Balkan Mixture'],['The Flavor Apprentice','RY4 Double Flavor CC']])assert.ok(rows.some(r=>r.brand===brand&&r.name===name),'Whole-library retention regression: '+brand+' '+name);
const audit={edition:w.RTA_ATLAS_CATALOG,method:'Model fit, not a popularity or personal A/B score',rankings:[]};
for(const atom of w.RTA_CORE.atoms)for(const variant of core.variants(atom.id))for(const [goal] of w.RTA_ATLAS_CONTEXT.goals){
 const config=core.config(atom.id,variant),top=search.top(config,goal,5);
 assert.equal(top.length,5);assert.equal(new Set(top.map(r=>r.liquid.recipeGroup)).size,5);
 assert.ok(top.every(r=>r.liquid.recommendable!==false&&rows.some(x=>x.id===r.liquid.id)&&Number.isFinite(r.score)));
 assert.ok(top.every((r,i)=>i===0||top[i-1].score>=r.score));
 audit.rankings.push({config,goal,top:top.map(r=>({id:r.liquid.id,brand:r.liquid.brand,name:r.liquid.name,line:r.liquid.line}))});
}
if(process.env.RTA_CATALOG_RECEIPT==='1'){fs.mkdirSync('artifacts/atlas-v02-mobile',{recursive:true});fs.writeFileSync('artifacts/atlas-v02-mobile/catalog-top-audit.json',JSON.stringify(audit,null,2));}
console.log('CATALOG QUALITY PASS: 700 sourced identities, no packaging duplicates or generic references; Centenary aliases/secret formula, all '+audit.rankings.length+' permitted-build/objective top-fives recalculated, one result per named recipe.');
