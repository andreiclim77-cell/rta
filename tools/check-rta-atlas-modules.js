"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const env={window:{}};vm.createContext(env);
const load=p=>vm.runInContext(fs.readFileSync(path.join('rta-lab',p),'utf8'),env,{filename:p});
for(const n of ['atoms-1.js','atoms-2.js','atoms-3.js','wires.js','core.js'])load('data/'+n);
fs.readdirSync('rta-lab/data').filter(n=>/^liquids-.*\.js$/.test(n)).sort().forEach(n=>load('data/'+n));
for(const p of ['data/bell-liquid-fit.js','data/sensory-core.js','mood-match.js','atlas-preview/context.js','atlas-preview/photo-sources.js','atlas-preview/app.js','atlas-preview/modules.js','atlas-preview/duel.js','atlas-preview/market-evidence.js','atlas-preview/market.js'])load(p);
const w=env.window,m=w.RTA_ATLAS_MODULES,c=w.RTA_SENSORY_CORE,a=w.RTA_ATLAS_PREVIEW;
assert.equal(Object.keys(m.inventory).length,16);assert.equal(Object.values(m.inventory).reduce((x,y)=>x+y,0),42);
const original=JSON.stringify([w.RTA_CORE.atoms,w.RTA_LIQUIDS,c.observations,c.personalPreferences]);
assert.equal(m.filteredAtoms('').length,16);assert.equal(m.filteredAtoms('Dvarw').length,2);assert.equal(m.filteredAtoms('nonexistent platform').length,0);
assert.equal(m.selectAtom('invalid'),false);assert.equal(m.contextual('invalid'),null);
for(const id of Object.keys(m.inventory)){
 assert.equal(m.selectAtom(id),true);
 for(const variant of c.variants(id)){
  assert.equal(m.setConfig({wire:variant.wire}),true);assert.equal(m.setConfig({wraps:variant.wraps}),true);
  for(const [goal] of [['complete'],['layers'],['th'],['tobacco'],['body'],['smooth']]){
   m.state.objective=goal;const result=m.contextual();
   assert.ok(result&&result.builds.length===3);assert.equal(result.result.dimensions.pleasure,null);
   assert.equal(result.config.atom,id);assert.ok(c.permitted(id,result.config.wire,result.config.wraps));
   assert.ok(!/\d+\s*%/.test(a.compactBuild(result.result)),'Do not turn heuristics into percentages');
  }
 }
}
m.selectAtom('klp');m.setConfig({wire:'nife30'});assert.equal(m.state.config.temp,220);assert.equal(m.state.config.power,16);
m.setConfig({wire:'nife52'});assert.equal(m.state.config.temp,230);assert.equal(m.state.config.power,13);
assert.equal(c.personalPreference(m.state.config).tier,1,'KLP NiFe52 is first-level preference');
m.setConfig({wire:'nife30'});assert.equal(c.personalPreference(m.state.config).tier,1);
const before=JSON.stringify(m.state.config);assert.equal(m.setConfig({wraps:5}),false);assert.equal(JSON.stringify(m.state.config),before);
m.selectAtom('asylum');assert.equal(m.setConfig({wire:'ssclap'}),false);
m.selectAtom('415');m.setConfig({wire:'k128'});assert.equal(m.setConfig({wraps:6}),false);
const key='rta-cl-physical-units-v1-20261014';
const configs=[c.config('dvarwcl',{wire:'k128',wraps:6,power:12}),c.config('dvarwcl',{wire:'k128',wraps:5,air:'single12',power:14}),c.config('dvarwcl',{wire:'k129',wraps:6,power:11})];
const store={schema:1,active:2,units:configs.map((cfg,i)=>({saved:cfg,draft:{...cfg,power:cfg.power+i*.5},source:null}))};
const bytes=JSON.stringify(store),storage={getItem:k=>k===key?bytes:null,setItem:()=>{throw new Error('Unexpected write');}};
const snapshot=m.clSnapshot(storage);assert.equal(snapshot.units.length,3);assert.equal(JSON.stringify(snapshot.units[1].saved),JSON.stringify(configs[1]));
assert.equal(storage.getItem(key),bytes,'Atlas must never overwrite existing physical unit profiles');
const legacy=m.clSnapshot({getItem:k=>k===key?null:JSON.stringify({dvarwcl:configs[0]})});
assert.equal(legacy.units[0].saved,null);assert.equal(legacy.units[0].draft.atom,'dvarwcl');assert.equal(legacy.units[1].draft,null);assert.equal(legacy.units[2].saved,null);
assert.equal(m.clSnapshot({getItem:()=>'{malformed'}).available,false);assert.equal(m.clSnapshot({getItem:()=>{throw new Error('blocked');}}).available,false);
assert.equal(m.clSnapshot(null).available,false);
m.selectAtom('gtr');let stress=0;
for(let i=0;i<w.RTA_LIQUIDS.length;i++){a.state.liquidIndex=i;const result=m.contextual();assert.equal(result.builds.length,3);assert.equal(result.config.atom,'gtr');stress++;}
assert.equal(stress,620);assert.equal(JSON.stringify([w.RTA_CORE.atoms,w.RTA_LIQUIDS,c.observations,c.personalPreferences]),original,'Adapters must preserve all canonical data');
const duel=w.RTA_ATLAS_DUEL;
const base=c.config('klp',{wire:'nife30',wraps:6,power:16,temp:220});
assert.equal(duel.pick(base,'left'),true);
const transferred=JSON.stringify(duel.state.left);
base.power=20;assert.equal(duel.state.left.power,16,'Transfer must keep a snapshot, not a shared mutable object');
assert.equal(duel.pick({atom:'invalid'},'left'),false);assert.equal(JSON.stringify(duel.state.left),transferred);
assert.equal(duel.compare(duel.state.left,duel.state.left).same,true);
const single=duel.compare(duel.state.left,{...duel.state.left,power:17});
assert.equal(single.changed.length,1);assert.equal(single.changed[0],'power');
const multi=duel.compare(duel.state.left,c.defaultConfig('gtone'));
assert.ok(multi.changed.length>=3,'Changing platform and material cannot be advertised as a one-variable A/B');
assert.ok(multi.left.result.dimensions.pleasure===null&&multi.right.result.dimensions.pleasure===null);
assert.equal(duel.compare({atom:'invalid'},duel.state.left),null);
console.log('ATLAS MODULES PASS: 16 platforms / 42 units, all permitted materials and objectives, 620-liquid stress, KLP alloy presets isolated, invalid builds rejected, CL saved/draft and legacy storage preserved.');

const market=w.RTA_ATLAS_MARKET;
assert.equal(market.data.rows.length,24);assert.equal(new Set(market.data.rows.map(e=>e.id)).size,24);
assert.equal(JSON.stringify([w.RTA_CORE.atoms,w.RTA_LIQUIDS,c.observations,c.personalPreferences]),original);
for(const category of market.data.categories){
 const selected=market.select(category,'','evidence');assert.ok(selected.length>0&&selected.length<=10);
 assert.equal(JSON.stringify(market.select(category,'','evidence')),JSON.stringify(selected),'Market order deterministic');
 assert.equal(market.select(category,'nonexistent-product').length,0);
 for(const e of selected){assert.equal(e.category,category);assert.equal(market.qualifying(e),true);assert.equal(e.consensus,false);assert.equal(e.confidence,'Review singular');assert.ok(e.version&&e.caveat);
  for(const id of e.sourceIds){const source=market.data.sources[id];assert.ok(source.authors&&source.bias&&source.title);assert.match(source.url,/^https:\/\//);assert.match(source.accessed,/^\d{4}-\d{2}-\d{2}$/);assert.ok(source.date===null||/^\d{4}-\d{2}-\d{2}$/.test(source.date));}
 }
}
assert.equal(market.match(market.data.rows.find(e=>e.id==='lt-single-burley')),-1,'Do not transfer a 4Pod review to classic extracts');
assert.equal(market.match(market.data.rows.find(e=>e.id==='bn-special-3')),-1,'Do not collapse Special Blend versions');
assert.equal(market.match(market.data.rows.find(e=>e.id==='halo-tribeca')),-1,'Catalog does not identify Shake N Vap version');
assert.ok(market.match(market.data.rows.find(e=>e.id==='bn-prelude'))>=0,'Explicit commercial alias to existing repertoire');
assert.ok(market.match(market.data.rows.find(e=>e.id==='manabush-powwow'))>=0);
assert.equal(market.match({match:{brand:'FlavourArt',name:'Maxx Blend'}}),-1,'Ambiguous catalog keys fail closed');
assert.equal(market.qualifying({...market.data.rows[0],sourceIds:['fabricated']}),false);
assert.equal(w.RTA_LIQUIDS.length,620);


const sameSourceRows=market.select('NET simplu').filter(e=>e.sourceIds[0]==='bn');
assert.equal(JSON.stringify(sameSourceRows.map(e=>e.name)),JSON.stringify([...sameSourceRows.map(e=>e.name)].sort((x,y)=>('Black Note '+x).localeCompare('Black Note '+y,'ro'))),'Equal dated sources have a stable name tie-break');

console.log('MARKET EVIDENCE PASS: 24 sourced entries, four categories, deterministic capped lists, no invented consensus, explicit aliases and version isolation; 620 catalog preserved.');

assert.ok(market.watch(w.RTA_LIQUIDS[market.match(market.data.rows.find(e=>e.id==='manabush-powwow'))]).includes('nu este probă A/B'));
assert.equal(market.watch({name:'Profil liber',isFreeProfile:true}),'');

assert.ok(m.storedBuild({wire:'k128',wraps:6}).includes('Airflow neprecizat'),'Do not fabricate a mounting insert for a partial saved record');
assert.equal(m.sameStored({wire:'k128',wraps:6},{wraps:6,wire:'k128'}),true,'Key order is not an unsaved physical change');

assert.equal(w.RTA_ATLAS_CONTEXT.profile({reviewId:'fabricated'}),null);
for(const entry of market.data.rows){const sourceProfile=w.RTA_ATLAS_CONTEXT.profile({reviewId:entry.id});assert.equal(sourceProfile.sourceReview,entry.id);assert.equal(sourceProfile.class,entry.category);const result=a.compose(a.state.liquidIndex,'magic','evening',{liquid:sourceProfile});assert.equal(result.distinctBuilds,9);assert.equal(a.evidenceFor(result.items[0].builds[0],sourceProfile).kind,'model');assert.ok(market.watch(sourceProfile).includes('nu este probă A/B'));}
assert.equal(w.RTA_LIQUIDS.length,620);
console.log('REVIEW PROFILE PASS: all 24 source profiles can use 3×3 estimates without catalog insertion or exact-build review claims.');
