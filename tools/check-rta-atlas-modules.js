"use strict";
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const env={window:{}};vm.createContext(env);
const load=p=>vm.runInContext(fs.readFileSync(path.join('rta-lab',p),'utf8'),env,{filename:p});
for(const n of ['atoms-1.js','atoms-2.js','atoms-3.js','wires.js','core.js'])load('data/'+n);
fs.readdirSync('rta-lab/data').filter(n=>/^liquids-.*\.js$/.test(n)).sort().forEach(n=>load('data/'+n));
load('atlas-preview/catalog.js');
for(const p of ['data/bell-liquid-fit.js','data/sensory-core.js','mood-match.js','atlas-preview/context.js','atlas-preview/liquid-picker.js','atlas-preview/photo-sources.js','atlas-preview/app.js','atlas-preview/modules.js','atlas-preview/duel.js','atlas-preview/market-evidence.js','atlas-preview/market.js'])load(p);
const w=env.window,m=w.RTA_ATLAS_MODULES,c=w.RTA_SENSORY_CORE,a=w.RTA_ATLAS_PREVIEW;
assert.equal(Object.keys(m.inventory).length,16);assert.equal(Object.values(m.inventory).reduce((x,y)=>x+y,0),42);
const original=JSON.stringify([w.RTA_CORE.atoms,w.RTA_LIQUIDS,c.observations,c.personalPreferences]);
assert.equal(m.filteredAtoms('').length,15);
assert.ok(!m.filteredAtoms('').some(a=>a.id==='asylum'),'Asylum must not appear in active inventory');
assert.ok(!fs.readFileSync('rta-lab/atlas-preview/modules.js','utf8').includes('wireJourneyControls()+wirePlatforms()'),'Wire Lab must have one initial guided flow, without duplicate selectors');
assert.equal(w.RTA_ATLAS_COLLECTION.activeUnits,40);assert.equal(m.filteredAtoms('Dvarw').length,2);assert.equal(m.filteredAtoms('nonexistent platform').length,0);
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
// Every platform must expose three complete, distinct, compatible material setups
// BEFORE an explicit liquid selection. User-confirmed preference order cannot be randomized.
for(const id of Object.keys(m.inventory)){
 m.selectAtom(id);const top=m.buildLeads(id);
 assert.equal(top.length,3,id+' must have exactly three top builds');
 assert.equal(new Set(top.map(x=>x.config.wire)).size,3,id+' top builds must use distinct owned wire materials');
 for(const lead of top){
  assert.equal(lead.config.atom,id);
  assert.ok(c.permitted(id,lead.config.wire,lead.config.wraps),id+' invalid wire/wraps');
  assert.ok(c.platforms[id].air.some(x=>x.id===lead.config.air),'No fabricated AFC option on '+id);
  assert.ok(['personal','model'].includes(lead.source));
  const facts=m.buildFacts(lead.config);
  for(const word of ['Coil','spire','Insert / aer','Clopot','Regim','Poziție'])
   assert.ok(facts.includes(word),id+' must show '+word+' without liquid');
  assert.ok(facts.includes(c.wires[lead.config.wire].type==='tc'?'TC':'WATT'));
 }
 assert.equal(JSON.stringify(top),JSON.stringify(m.buildLeads(id)),id+' should be deterministic');
}
const dvarwFlLead=(()=>{m.selectAtom('dvarwfl');return m.buildLeads('dvarwfl')[1]})();
assert.equal(dvarwFlLead.config.wire,'ssclap','Keep SS Clapton/5 as dedicated FL specialist pairing');
assert.equal(dvarwFlLead.config.wraps,5);
assert.equal(dvarwFlLead.source,'model','Do not mislabel dedicated FL Clapton specialist as user-controlled A/B');
const expectedPersonal={
 "415":[['nife30',7],['nife52',6],['k128',6]],
 gtr:[['nife30',7],['nife52',6],['k128',5]],
 klp:[['nife30',7],['nife52',6],['k128',5]],
 kprime:[['nife30',7],['nife52',6],['k129',5]],
 kx:[['nife30',7],['nife52',6],['k128',5]],
 gtone:[['k129',6],['k128',5]],muted:[['k128',6]],
 dvarwcl:[['k128',6]],dvarwfl:[['k128',6]],
 asylum:[['k128',6]],kv3:[['k128',6],['k129',6]]
};
for(const [id,expected] of Object.entries(expectedPersonal)){
 const leads=m.buildLeads(id);
 for(let i=0;i<expected.length;i++){
  assert.equal(leads[i].config.wire,expected[i][0],id+' personal material precedence '+i);
  assert.equal(leads[i].config.wraps,expected[i][1],id+' personal coil wraps '+i);
  assert.equal(leads[i].source,'personal',id+' personal evidence tier');
 }
}
m.selectAtom('asylum');
const asylumConfig=m.state.config,asylumAir=c.platforms.asylum.air;
assert.equal(asylumConfig.air,'dual10','Asylum included 2x1.0 pin is technical default, not claimed as mounted');
assert.equal(asylumAir.find(x=>x.id==='dual10').holes.length,2);
assert.equal(asylumAir.find(x=>x.id==='dual10').holes[0],1);
const maybe08=asylumAir.find(x=>x.id==='dual08');
assert.ok(maybe08&&maybe08.optional&&maybe08.estimated&&maybe08.unverifiedPersonal,
 'User-suspected Asylum 2x0.8 can be explored but NEVER claimed as a confirmed or included pin');
assert.equal(maybe08.holes.length,2);
assert.equal(maybe08.holes[0],0.8);
assert.match(maybe08.label,/NECONFIRMAT/);
assert.notEqual(asylumConfig.air,'dual08','Do not silently assign unverified personal airflow to a physical unit');
assert.ok(m.buildFacts(asylumConfig).includes('2×1,0 mm'));
assert.ok(a.renderCoil(asylumConfig).includes('2 canale'));
assert.equal(m.setConfig({air:'dual08'}),true,'Asylum possible pin must be selectable in Atlas');
assert.ok(m.buildFacts(m.state.config).includes('NECONFIRMAT'),'Unverified pin remains visibly marked as such');
assert.equal(c.physical(m.state.config).air.holes[1],0.8);
assert.equal(m.setConfig({air:'stock'}),true,'Keep prior unknown-pin model without assigning a false dimension');
assert.equal(m.setConfig({air:'dual10'}),true);
assert.equal(c.permitted('asylum','ssclap',5),false);
assert.equal(c.analyze(c.defaultConfig('asylum'),{name:'Audit demo',class:'Tutun simplu'}).partialEvidence.length,1,'Retain historical Flat/28/6 as a partial personal report');
assert.equal(c.analyze(c.config('asylum',{bell:'dome'}),{name:'Audit demo',class:'Tutun simplu'}).partialEvidence.length,0,'Do not leak Flat-specific report onto Dome');
assert.equal(m.setConfig({bell:'dome'}),true);
assert.equal(m.state.config.bell,'dome','Keep the currently selected editable Dome setup');
assert.equal(m.buildLeads('asylum')[0].config.bell,'flat',
 'The personal Asylum Flat/K1 28/6 card must not silently turn into a claimed personal Dome setup');
assert.ok(m.materialPaths().includes('Configurația ta selectată, în afara primelor trei'),
 'A separately selected Dome coil must remain available, not overwritten by the personal Flat card');
m.selectAtom('asylum');

for(const id of ['asylum','gtr','415','klp','gtone']){
 m.selectAtom(id);const markup=m.materialPaths();
 assert.equal((markup.match(/class="material-path"/g)||[]).length,3,'Three visible build cards on '+id);
 assert.equal((markup.match(/class="material-build-facts"/g)||[]).length,3,'Facts in all three cards on '+id);
 assert.equal((markup.match(/data-atlas-build=/g)||[]).length,3,'Each card transfers exact config on '+id);
}
// NiFe30 WATT must never leak through material selection into another TC preset.
m.selectAtom('415');
assert.equal(m.setConfig({wire:'k128'}),true);
assert.equal(m.wireConfig('415','nife30').regime,'tc','Returning from Kanthal must restore the NiFe30 TC preset');
assert.equal(m.wireConfig('415','nife30').wraps,7);
assert.equal(m.setConfig({wire:'nife30'}),true);
assert.equal(m.state.config.regime,'tc');
assert.equal(c.personalPreference(m.state.config).tier,1,'415 NiFe30 TC should remain first-tier');
assert.equal(m.setConfig({regime:'watt'}),true);
assert.equal(m.state.config.regime,'watt');
assert.equal(m.state.config.power,12);
assert.equal(m.setConfig({chipset:'dna'}),true);
assert.equal(m.state.config.chipset,'dna');
const nifeWattAcrossPlatform=m.wireConfig('gtr','nife30');
assert.equal(nifeWattAcrossPlatform.regime,'watt','Keep chosen WATT regime when switching platform, not material');
assert.equal(nifeWattAcrossPlatform.power,12);
assert.equal(m.setConfig({wire:'nife52'}),true);
assert.equal(m.state.config.regime,'tc','NiFe52 must remain TC');
assert.equal(m.setConfig({wire:'nife30'}),true);
assert.equal(m.state.config.regime,'tc','Switching back to NiFe30 from NiFe52 must restore TC');
assert.equal(m.state.config.chipset,'');
assert.equal(c.personalPreference(m.state.config).tier,1);
m.selectAtom('klp');m.setConfig({wire:'nife30'});assert.equal(m.state.config.wraps,7);assert.equal(m.state.config.temp,230);assert.equal(m.state.config.power,13);
m.setConfig({wire:'nife52'});assert.equal(m.state.config.temp,230);assert.equal(m.state.config.power,13);
assert.equal(c.personalPreference(m.state.config).tier,1,'KLP NiFe52 is first-level preference');
m.setConfig({wire:'nife30'});assert.equal(m.state.config.wraps,7);assert.equal(c.personalPreference(m.state.config).tier,1);
const before=JSON.stringify(m.state.config);assert.equal(m.setConfig({wraps:5}),false);assert.equal(JSON.stringify(m.state.config),before);

m.selectAtom('gtr');
assert.equal(m.state.config.wire,'nife30');
assert.equal(m.state.config.wraps,7,'New GTR Dicodes default must have seven wraps');
assert.equal(m.state.config.temp,230);
assert.equal(m.state.config.power,16);
assert.equal(c.personalPreference(m.state.config).tier,1);
assert.equal(m.setConfig({wraps:6}),true,'NiFe30/6 stays available only by explicit selection for historical comparison');
assert.equal(m.state.config.wraps,6);
assert.equal(c.personalPreference(m.state.config).tier,2,'Historical 6-wrap coil is not the preferred GTR choice');
assert.equal(m.setConfig({wraps:7}),true);
assert.equal(m.state.config.wraps,7);
assert.equal(c.personalPreference(m.state.config).tier,1);
assert.equal(m.setConfig({wire:'nife52'}),true);
assert.equal(m.state.config.wraps,6);
assert.equal(c.personalPreference(m.state.config).tier,1);
const gtr52=JSON.stringify(m.state.config);
assert.equal(m.setConfig({wraps:7}),false,'NiFe52/7 must never be enabled');
assert.equal(JSON.stringify(m.state.config),gtr52);
assert.equal(m.wireConfig('gtr','nife30').wraps,7,
 'Cross-material GTR pairing must choose dedicated NiFe30/7 instead of inheriting NiFe52/6');
assert.equal(m.setConfig({wire:'nife30'}),true);
assert.equal(m.state.config.wraps,7,'Switch back to NiFe30 must restore 7');

m.selectAtom('asylum');assert.equal(m.setConfig({wire:'ssclap'}),false);
m.selectAtom('415');
assert.equal(m.state.config.wire,'nife30');
assert.equal(m.state.config.wraps,7,"415 Cool should start with Dicodes NiFe30/7");
assert.equal(c.personalPreference(m.state.config).tier,1);
assert.equal(m.setConfig({wire:'nife52'}),true);
assert.equal(m.state.config.wraps,6,"415 Zivipf NiFe52 uses 6 wraps, not Dicodes 7");
assert.equal(c.personalPreference(m.state.config).tier,1);
assert.equal(m.wireConfig('415','nife30').wraps,7,"Material switching must restore 415 Dicodes seven-wrap preference");
assert.equal(m.setConfig({wire:'k128'}),true);
assert.equal(m.state.config.wraps,6,"415 Kanthal 28/6 is the new second preference");
assert.equal(c.personalPreference(m.state.config).tier,2);
assert.equal(m.setConfig({wraps:5}),true,"Historical 415 Kanthal 28/5 remains selectable");
assert.equal(m.setConfig({wraps:6}),true);
assert.equal(m.wireConfig('415','k128').wraps,6);
assert.equal(m.setConfig({wire:'k1clap'}),true,"415 K1 Clapton/5 preserved");
assert.equal(m.state.config.wraps,5);
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
assert.equal(stress,700);assert.equal(JSON.stringify([w.RTA_CORE.atoms,w.RTA_LIQUIDS,c.observations,c.personalPreferences]),original,'Adapters must preserve all canonical data');
const duel=w.RTA_ATLAS_DUEL;
const base=c.config('klp',{wire:'nife30',wraps:7,power:16,temp:230});
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
// Latest user UX requirement: show six complete coil/preference cards and all
// 15 active atomizers before selection. Then refine progressively until liquid.
const wireStateBefore={...m.state,wireJourney:{...m.state.wireJourney},config:{...m.state.config}};
m.state.wireChosen=false;m.state.wirePlatformChosen=false;
m.state.wireJourney={wrapsConfirmed:false,objective:null,family:null,liquidIndex:null};
const start=m.wirePlatformMatches();
assert.equal(start.phase,0);assert.equal(start.primary.length,15);assert.equal(start.other.length,0);
assert.equal((m.wirePalette().match(/data-wire-family="/g)||[]).length,6,'Show six material cards before selection');
assert.equal((m.wirePalette().match(/<svg/g)||[]).length,6,'Show all six coils, including Dicodes');
for(const wire of Object.keys(c.wires)){
 const saved=m.wireSavedBuilds(wire);
 assert.ok(saved.length>0,'Every material needs its latest Lab reference or explicitly technical specialist: '+wire);
 assert.ok(saved.every(x=>c.permitted(x.config.atom,x.config.wire,x.config.wraps)),
   'No card should show a forbidden build for '+wire);
}
assert.equal(m.wireSavedBuilds('nife30')[0].config.wraps,7);
assert.equal(m.wireSavedBuilds('nife52')[0].config.wraps,6);
m.state.wireChosen=true;m.state.atom='gtr';m.state.config=c.defaultConfig('gtr');
const countStages=[
 [{wrapsConfirmed:false,objective:null,family:null,liquidIndex:null},1,8],
 [{wrapsConfirmed:true,objective:null,family:null,liquidIndex:null},2,6],
 [{wrapsConfirmed:true,objective:'th',family:null,liquidIndex:null},3,5],
 [{wrapsConfirmed:true,objective:'th',family:'NET complex',liquidIndex:null},4,4],
 [{wrapsConfirmed:true,objective:'th',family:'NET complex',
   liquidIndex:w.RTA_LIQUIDS.findIndex(l=>l.class==='NET complex')},5,3]
];
for(const [stage,phase,count] of countStages){
 m.state.wireJourney=stage;
 const x=m.wirePlatformMatches();
 assert.equal(x.phase,phase,'Stage must follow explicit choices only');
 assert.equal(x.primary.length,count,'Progressive shortlist size at phase '+phase);
 assert.equal(x.primary.length+x.other.length,x.total,'Keep all remaining compatible atomizers accessible');
 assert.ok(x.primary.every(row=>row.config.wire==='nife30'&&row.config.wraps===7),'Match exact chosen build');
}
m.state.wireChosen=wireStateBefore.wireChosen;m.state.wirePlatformChosen=wireStateBefore.wirePlatformChosen;
m.state.wireJourney=wireStateBefore.wireJourney;m.state.config=wireStateBefore.config;m.state.atom=wireStateBefore.atom;
console.log('WIRE PROGRESSIVE MODEL PASS: all six preferred-coil cards, 15 unfiltered atomizers, 8/6/5/4/3 shortlist with accessible remainder.');
console.log('ATLAS MODULES PASS: 15 active platforms / 40 active units, all permitted materials and objectives, 700-liquid stress, KLP alloy presets isolated, invalid builds rejected, CL saved/draft and legacy storage preserved.');

const market=w.RTA_ATLAS_MARKET;
assert.equal(market.data.rows.length,40);assert.equal(new Set(market.data.rows.map(e=>e.id)).size,40);
assert.equal(JSON.stringify([w.RTA_CORE.atoms,w.RTA_LIQUIDS,c.observations,c.personalPreferences]),original);
for(const category of market.data.categories){
 const selected=market.select(category,'','evidence');assert.equal(selected.length,10);
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
assert.equal(w.RTA_LIQUIDS.length,700);
assert.equal(market.select('NET complex').at(-1).id,'lt-baffometto-reserve','Limited author identity follows clearly attributed reviews');


const sameSourceRows=market.select('NET simplu').filter(e=>e.sourceIds[0]==='bn');
assert.equal(JSON.stringify(sameSourceRows.map(e=>e.name)),JSON.stringify([...sameSourceRows.map(e=>e.name)].sort((x,y)=>('Black Note '+x).localeCompare('Black Note '+y,'ro'))),'Equal dated sources have a stable name tie-break');

console.log('MARKET EVIDENCE PASS: 40 sourced entries, four complete categories, deterministic capped lists, no invented consensus, explicit aliases and version isolation; 700 catalog preserved.');

assert.ok(market.watch(w.RTA_LIQUIDS[market.match(market.data.rows.find(e=>e.id==='manabush-powwow'))]).includes('nu este probă A/B'));
assert.equal(market.watch({name:'Profil liber',isFreeProfile:true}),'');

assert.ok(m.storedBuild({wire:'k128',wraps:6}).includes('Airflow neprecizat'),'Do not fabricate a mounting insert for a partial saved record');
assert.equal(m.sameStored({wire:'k128',wraps:6},{wraps:6,wire:'k128'}),true,'Key order is not an unsaved physical change');

assert.equal(w.RTA_ATLAS_CONTEXT.profile({reviewId:'fabricated'}),null);
for(const entry of market.data.rows){const sourceProfile=w.RTA_ATLAS_CONTEXT.profile({reviewId:entry.id});assert.equal(sourceProfile.sourceReview,entry.id);assert.equal(sourceProfile.class,entry.category);const result=a.compose(a.state.liquidIndex,'magic','evening',{liquid:sourceProfile});assert.equal(result.distinctBuilds,9);assert.equal(a.evidenceFor(result.items[0].builds[0],sourceProfile).kind,'model');assert.ok(market.watch(sourceProfile).includes('nu este probă A/B'));}
assert.equal(w.RTA_LIQUIDS.length,700);
console.log('REVIEW PROFILE PASS: all 40 source profiles can use 3×3 estimates without catalog insertion or exact-build review claims.');

// Regression: the two late-added HOME gateways must have actual, packaged photographs
// (not blank cards, schematic-only SVGs, or remote-host-dependent media).
for(const [route,visual,photos] of [
 ['market','marketVisual',['market-ltKentucky.webp','market-pulpTennessee.jpg']],
 ['duel','duelVisual',['klp-product.png','taifun-gt-one.jpg']]
]){
 const preview=fs.readFileSync('rta-lab/atlas-preview/'+route+'.js','utf8');
 const release=fs.readFileSync('rta-lab/atlas/'+route+'.js','utf8');
 assert.equal(preview,release,route+' HOME photo markup must ship in release, not just preview');
 assert.ok(preview.includes('card.innerHTML='+visual),route+' gateway must render imagery as first child');
 assert.match(preview,new RegExp('gateway-photographic-'+route));
 for(const file of photos){
  assert.ok(preview.includes('./media/'+file),route+' gateway missing '+file);
  assert.ok(fs.statSync('rta-lab/atlas/media/'+file).size>10_000,route+' packaged image missing '+file);
 }
}
const mediaCss=fs.readFileSync('rta-lab/atlas/gateway-photos.css','utf8');
assert.match(mediaCss,/gateway-visual\.gateway-photographic/);
assert.match(mediaCss,/@media\(max-width:760px\)/);
assert.equal(mediaCss,fs.readFileSync('rta-lab/atlas-preview/gateway-photos.css','utf8'));
console.log('GATEWAY MEDIA PASS: Market and Duel HOME gateways each provide two real local photographs, synced preview/release and mobile styles.');
