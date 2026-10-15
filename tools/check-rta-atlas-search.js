'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const env={window:{}};vm.createContext(env);const load=p=>vm.runInContext(fs.readFileSync('rta-lab/'+p,'utf8'),env,{filename:p});
for(const n of ['atoms-1.js','atoms-2.js','atoms-3.js','wires.js','core.js'])load('data/'+n);
fs.readdirSync('rta-lab/data').filter(n=>/^liquids-.*\.js$/.test(n)).sort().forEach(n=>load('data/'+n));
for(const p of ['data/bell-liquid-fit.js','data/sensory-core.js','mood-match.js','atlas-preview/context.js','atlas-preview/liquid-picker.js','atlas-preview/app.js','atlas-preview/modules.js','atlas-preview/duel.js','atlas-preview/market-evidence.js','atlas-preview/market.js'])load(p);
const w=env.window,s=w.RTA_ATLAS_SEARCH,c=w.RTA_SENSORY_CORE,all=w.RTA_LIQUIDS,original=JSON.stringify([all,w.RTA_CORE.atoms,c.observations,c.personalPreferences]);
assert.equal(s.find().total,620);assert.equal(s.find('x').total,0);assert.equal(s.find('no-such-liquid-827379').total,0);
for(let i=0;i<all.length;i++)assert.ok(s.find(all[i].brand+' '+all[i].name).rows.some(r=>r.index===i),'Every catalog identity remains reachable: '+i);
const b=s.find('Balkan Tabaccheria');assert.ok(b.total>0);assert.equal(b.rows[0].liquid.name,'Balkan Mixture');assert.ok(b.rows.every(r=>r.liquid.brand==='La Tabaccheria'&&/Balkan/i.test(r.liquid.name+' '+r.liquid.profile)));
assert.equal(s.find('Virginia Hangsen').rows[0].liquid.name,'Virginia','An exact brand/name identity wins over longer names even when query words are reversed');
assert.ok(s.find('Virgnia').approximate,'A one-character omission must be identified as approximate');
assert.ok(s.find('Vigrinia').approximate,'A transposition must be identified as approximate');
for(const family of [...new Set(all.map(l=>l.class))]){const rows=s.find('',{family});assert.equal(rows.total,all.filter(l=>l.class===family).length);assert.ok(rows.rows.every(r=>r.liquid.class===family));}
for(const brand of [...new Set(all.map(l=>l.brand))])assert.equal(s.find('',{brand}).total,all.filter(l=>l.brand===brand).length);
assert.equal(s.find('',{brand:'La Tabaccheria',family:'Tutun simplu'}).total,all.filter(l=>l.brand==='La Tabaccheria'&&l.class==='Tutun simplu').length);
for(const atom of ['gtr','klp','dvarwcl','415'])for(const goal of ['layers','th','smooth']){
 const cfg=c.defaultConfig(atom),expected=c.matchLiquids(cfg,all,goal,0),actual=s.ranked(cfg,goal),filtered=s.find('',{config:cfg,goal});
 assert.deepEqual(Array.from(actual.slice(0,5),r=>r.index),Array.from(expected.slice(0,5),r=>r.index));
 assert.ok(actual.every(r=>c.permitted(atom,r.result.config.wire,r.result.config.wraps)));
 // Text is empty: ranking, including ties, must remain the canonical ranking.
 const bestScore=actual[0].score;assert.equal(actual.find(r=>r.index===filtered.rows[0].index).score,bestScore);
}
assert.equal(s.matchesText('GT One · un jet','jet gt'),true);assert.equal(s.matchesText('GT One','GT nonexistent'),false);
assert.equal(s.matchesText('Țigară de foi · aromă','aroma tigara'),true);
assert.equal(w.RTA_ATLAS_MARKET.select('all').length,40);assert.ok(w.RTA_ATLAS_MARKET.select('Tutun complex','Tribeca Halo').some(r=>r.id==='halo-tribeca'));
const m=w.RTA_ATLAS_MODULES;m.selectAtom('klp');m.setConfig({wire:'nife52'});const before=JSON.stringify(m.state.config),duelBefore=JSON.stringify(w.RTA_ATLAS_DUEL.state);
w.RTA_ATLAS_PREVIEW.state.liquidIndex=619;assert.equal(JSON.stringify(m.state.config),before);assert.equal(JSON.stringify(w.RTA_ATLAS_DUEL.state),duelBefore);
assert.equal(JSON.stringify([all,w.RTA_CORE.atoms,c.observations,c.personalPreferences]),original,'Search/ranking must never mutate canonical data');
assert.equal(JSON.parse(fs.readFileSync('rta-lab/manifest.webmanifest')).start_url,'./atlas/');
console.log('ATLAS SEARCH PASS: all 620 identities reachable, multiword/diacritic/facet/typo/empty queries, exact engine top-five rankings, all 40 Market records, canonical data and selected builds preserved.');
