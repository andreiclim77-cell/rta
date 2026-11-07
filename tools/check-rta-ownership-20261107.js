'use strict';
/* Independent ownership/UX reconciliation. No historical technical data is removed. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{}};
vm.createContext(ctx);
const load=file=>vm.runInContext(fs.readFileSync('rta-lab/'+file,'utf8'),ctx,{filename:file});
for(const name of ['atoms-1.js','atoms-2.js','atoms-3.js','wires.js','core.js'])load('data/'+name);
fs.readdirSync('rta-lab/data').filter(x=>/^liquids-.*\.js$/.test(x)).sort().forEach(x=>load('data/'+x));
for(const file of ['atlas-preview/catalog.js','data/bell-liquid-fit.js','data/sensory-core.js','mood-match.js',
 'atlas-preview/context.js','atlas-preview/liquid-picker.js','atlas-preview/photo-sources.js',
 'atlas-preview/app.js','atlas-preview/modules.js','atlas-preview/decision-explorer.js'])load(file);
const w=ctx.window, c=w.RTA_ATLAS_COLLECTION, m=w.RTA_ATLAS_MODULES;
assert.equal(w.RTA_CORE.atoms.length,16,'Do not erase the 16-model historical technical registry');
assert.equal(w.RTA_LIQUIDS.length,620+80,'Keep the 700-item Atlas catalog');
assert.equal(Object.values(m.historicalInventory).reduce((a,b)=>a+b,0),42,'Original historical units');
assert.equal(m.inventory['415'],0);assert.equal(m.inventory.kv3,0);
assert.equal(m.inventory.kprime,3,'Prime SE purchase must increment Prime to three');
assert.equal(m.inventory.asylum,2,'Do not assume donation of retired units');
const sold=Array.from(c.sold,x=>x.id).sort();
assert.deepEqual(sold,['415','kv3']);
assert.equal(c.retired.length,1);assert.equal(c.retired[0].id,'asylum');
assert.equal(c.activeRtaPlatforms,13);assert.equal(c.activeRtaUnits,39);
assert.equal(m.activeUnits,39);assert.equal(c.activeAtoms.length,13);
assert.equal(m.filteredAtoms('').length,13);
assert.ok(c.activeAtoms.every(a=>!['415','kv3','asylum'].includes(a.id)));
assert.equal(new Set(c.activeAtoms.map(a=>a.id)).size,13);
assert.equal(c.activeBoroPlatforms,1);assert.equal(c.activeBoroUnits,1);
assert.equal(c.ownedBoro[0].id,'taifun-gaia-boro');
assert.ok(/GAIA RBA/.test(c.ownedBoro[0].label)&&/Boro/.test(c.ownedBoro[0].type));
assert.equal(c.activePlatforms,14);assert.equal(c.activeUnits,40);
assert.equal(c.activeUnits+c.retired[0].unitsRecorded,42,'Owned units include not-yet-donated Asylum');
assert.equal(Object.values(m.inventory).reduce((a,b)=>a+b,0)+c.activeBoroUnits,42,
 'Present inventory: 16 legacy IDs with sold zeroed plus new Boro');
assert.ok(m.catalogCards().includes('data-boro-owned="taifun-gaia-boro"'));
m.state.query='boro';assert.equal(m.filteredAtoms().length,0);
assert.ok(m.catalogCards().includes('Taifun GAIA RBA'),'Search must surface Boro without pretending it is scored');
m.state.query='';
for(const wire of Object.keys(w.RTA_SENSORY_CORE.wires)){
 assert.ok(m.compatibleWireAtoms(wire).every(a=>!['415','kv3','asylum'].includes(a.id)),
  'No withdrawn/sold candidate in Wire Lab');
}
for(const id of ['415','kv3'])assert.ok(Object.values(w.RTA_SENSORY_CORE.platforms).length===16&&w.RTA_SENSORY_CORE.platforms[id],
 'Sold model must remain as historical technical evidence');
assert.ok(m.wireSavedBuilds('k1clap').some(x=>x.origin==='historical'&&/VÂNDUT/.test(x.label)));
for(const mood of w.RTA_MOOD_MATCH.moods){
 const r=w.RTA_MOOD_MATCH.recommend(mood.id,'day');
 assert.equal(r.ranked.length,13);
 assert.ok(r.ranked.every(x=>c.isActive(x.id)),'Mood Match must use only owned classic RTAs');
}
for(const category of ['Tutun simplu','Tutun complex','NET simplu','NET complex']){
 const liquid=w.RTA_LIQUIDS.find(x=>x.class===category);
 for(const mood of w.RTA_MOOD_MATCH.moods){
  for(const moment of w.RTA_MOOD_MATCH.moments){
   const source=w.RTA_MOOD_MATCH.recommend(mood.id,moment.id,w.RTA_LIQUIDS.indexOf(liquid)).ranked;
   const adapted=w.RTA_ATLAS_CONTEXT.rank(liquid,mood.id,moment.id,mood.goal);
   assert.deepEqual(source.map(x=>[x.id,x.score]),adapted.map(x=>[x.id,x.score]),
    'Mood Match and Atlas context must match exactly, not just exclude sold units');
  }
 }
}
for(const liquid of ['Tutun simplu','Tutun complex','NET simplu','NET complex']){
 const i=w.RTA_LIQUIDS.findIndex(x=>x.class===liquid);
 const answer=w.RTA_ATLAS_PREVIEW.compose(i,'power','coffee');
 assert.ok(answer&&answer.items.length===3);
 assert.ok(answer.items.every(x=>c.isActive(x.id)),'Liquid Match must exclude sold and retired units');
}
for(const file of ['app.js','modules.js','decision-explorer.js','index.html']){
 const preview=fs.readFileSync('rta-lab/atlas-preview/'+file,'utf8');
 const expected=file==='index.html'?preview
  .replace('Precision Motion Lab Preview','Precision Motion Lab')
  .replace('/ V0.2</span>','/ ATLAS</span>')
  .replace('VERSIUNE CANDIDAT','COLECȚIA TA')
  .replace('aria-label="Navigare prototip"','aria-label="Navigare Atlas"')
  .replace('PREVIEW V0.2','PRECISION MOTION LAB')
  .replace('Concept interactiv pentru evaluarea designului. Nu înlocuiește aplicația actuală.',
   'Sursele și limitele dovezilor sunt disponibile la fiecare rezultat.')
  .replace('Prototipul animat necesită JavaScript.','Atlas necesită JavaScript.')
  :preview;
 assert.deepEqual(Buffer.from(expected),fs.readFileSync('rta-lab/atlas/'+file),
  'Preview/release must remain aligned: '+file);
}
for(const name of ['RTA_CURRENT_HANDOFF.md','RTA_CONTINUITY_MASTER.md','RTA_COLLECTION_STATUS_20261019.md']){
 const body=fs.readFileSync('rta-lab/'+name,'utf8');
 assert.ok(body.includes('07.11.2026')&&body.includes('GAIA')&&body.includes('39'),
  'Newest authoritative status must be present: '+name);
}
const html=fs.readFileSync('rta-lab/index.html','utf8');
const engine=fs.readFileSync('rta-lab/engine.js','utf8');
assert.match(html,/<b>14<\/b> platforme active/,'V10 ownership stat must match Atlas');
assert.ok(/\['415','kv3','asylum'\]/.test(engine),'V10 rankAtoms must exclude old units');
assert.ok(engine.includes('const ranking = ACTIVE_ATOMS')&&engine.includes('[...ACTIVE_ATOMS]'),
 'V10 rankings and live explorer must exclude sold models while historical build tests remain possible');
console.log('OWNERSHIP CROSS-AUDIT PASS: 13 classic RTA models / 39 units + GAIA Boro / 1 = 14/40 active; 2 Asylum retained, 42 physically held; 415 and Mini V3 historical; V10/Atlas/Mood/Wire/Docs aligned.');
