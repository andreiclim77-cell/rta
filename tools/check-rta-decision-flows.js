'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx={window:{}};vm.createContext(ctx);
const load=p=>vm.runInContext(fs.readFileSync(path.join('rta-lab',p),'utf8'),ctx,{filename:p});
for(const n of ['atoms-1.js','atoms-2.js','atoms-3.js','wires.js','core.js'])load('data/'+n);
fs.readdirSync('rta-lab/data').filter(n=>/^liquids-.*\.js$/.test(n)).sort().forEach(n=>load('data/'+n));
for(const p of ['atlas-preview/catalog.js','data/bell-liquid-fit.js','data/sensory-core.js','mood-match.js','atlas-preview/context.js','atlas-preview/liquid-picker.js','atlas-preview/photo-sources.js','atlas-preview/app.js','atlas-preview/modules.js','atlas-preview/decision-explorer.js'])load(p);
const w=ctx.window,x=w.RTA_LAB_EXPLORER,c=w.RTA_SENSORY_CORE;
assert.ok(x,'Explorer must load');
const original=JSON.stringify({atoms:w.RTA_CORE.atoms,liquids:w.RTA_LIQUIDS,observations:c.observations,prefs:c.personalPreferences});
assert.equal(x.axes.length,14,'Expose all existing and derived objectives');
assert.equal(x.categories.length,4);
assert.equal(new Set(x.axes.map(a=>a[0])).size,14);
assert.equal(x.score10(1),1);assert.equal(x.score10(5),10);
assert.equal(x.score10(4),7.8); // rounded relative conversion of 1–5 to 1–10
assert.deepEqual([...x.available('k128','gtr')],[5,6]);
assert.deepEqual([...x.available('nife30','gtr')],[6,7]);
assert.deepEqual([...x.available('nife30','415')],[6,7]);
assert.deepEqual([...x.available('nife30','klp')],[6,7]);
assert.deepEqual([...x.available('nife30')],[6,7]);
assert.deepEqual([...x.available('nife52','415')],[6]);
assert.deepEqual([...x.available('k1clap','gtr')],[5]);
assert.deepEqual([...x.available('ssclap','asylum')],[]);
assert.ok(!x.candidates('k128',6).some(c=>c.atom==='asylum'),'Retired Asylum excluded from wire candidates');
const catCounts=Object.fromEntries(x.categories.map(cat=>[cat,w.RTA_LIQUIDS.filter(l=>l.class===cat).length]));
assert.equal(Object.values(catCounts).reduce((a,b)=>a+b,0),700);
for(const id of w.RTA_ATLAS_COLLECTION.activeAtoms.map(a=>a.id)){
 for(const wire of Object.keys(c.wires)){
  const wraps=x.available(wire,id);
  for(const n of wraps){
   assert.ok(c.permitted(id,wire,n),id+' '+wire+'/'+n);
   const configs=x.candidates(wire,n);
   assert.ok(configs.some(a=>a.atom===id));
   const single=c.analyze(configs.find(a=>a.atom===id),{name:'Unit check',class:'NET complex'},'complete');
   for(const [key] of x.axes){
    const value=x.score10(x.metric(single.signals,key));
    assert.ok(Number.isFinite(value)&&value>=1&&value<=10,id+' '+wire+'/'+n+' '+key);
   }
  }
 }
}
const sample=w.RTA_LIQUIDS.find(l=>l.class==='NET complex');
const top=x.topAtoms('k128',6,sample);
assert.equal(top.length,3,'Show three compatible atomizers when available');
assert.equal(new Set(top.map(t=>t.atom.id)).size,3);
top.forEach(t=>{assert.equal(t.result.config.wire,'k128');assert.equal(t.result.config.wraps,6);});
const narrow=x.topAtoms('nife30',7,sample);
assert.equal(x.candidates('nife30',7).length,15,'All active atomizers must accept NiFe30/7 as a personal build option');
assert.equal(narrow.length,3,'Show three contextual results now that NiFe30/7 is global');
assert.equal(new Set(narrow.map(t=>t.atom.id)).size,3);
for(const kind of x.categories){
 const score=x.familyFit(x.candidates('k128',6),kind);
 assert.ok(score>=0&&score<=100,'Fit must be bounded index');
}
const grid=x.matrix([{label:'GTR · NiFe30/7',result:c.analyze(c.config('gtr',{wire:'nife30',wraps:7}),sample)}],'Audit graph','Methodology');
assert.equal((grid.match(/<tr>/g)||[]).length,15,'All 14 axes plus header');
assert.match(grid,/nu sunt măsurători/i);
assert.equal((grid.match(/class="exp-mobile-metric"/g)||[]).length,14,'All 14 objectives must also be visible without sideways scrolling on mobile');
assert.ok(grid.includes('exp-mobile-series')&&grid.includes('exp-mobile-track'),'Every objective must have labeled, accessible mobile score bars');
assert.match(x.atlasWizard(),/Toate sârmele/);
assert.match(x.wireWizard(),/Sârma de pornire/);
assert.doesNotMatch(x.wireWizard(),/Atomizoarele potrivite/);
x.states.wire.first='k128';x.states.wire.wraps=5;
assert.match(x.wireWizard(),/Compară configurațiile/);
assert.match(x.wireWizard(),/Te-ai decis/);
x.states.wire.other='nife30';x.states.wire.otherWraps=7;
assert.match(x.wireWizard(),/Comparație pe/);
x.states.wire.final='k128';x.states.wire.finalWraps=5;
assert.match(x.wireWizard(),/Ce urmărești/);
assert.doesNotMatch(x.wireWizard(),/Alege lichidul/);
x.states.wire.goal='layers';
assert.match(x.wireWizard(),/Alege lichidul/);
x.states.wire.family='NET complex';
x.states.wire.liquidIndex=w.RTA_LIQUIDS.findIndex(l=>l.class==='NET complex');
assert.match(x.wireWizard(),/Atomizoarele potrivite/);
assert.match(x.wireWizard(),/Vezi și celelalte/);
assert.equal(x.topAtoms('nife30',6,sample).length,3,'NiFe30/6 retained as a deliberately selected historical comparison; NiFe30/7 remains the default');
assert.equal((x.wireWizard().match(/class="wire-quick-axis"/g)||[]).length,6,
 'Use six compact comparison criteria on first screen');
assert.equal((x.wireWizard().match(/class="wire-full-axis-details"/g)||[]).length,2,
 'Both the material and final-atomizer 14-axis matrices are optional, not duplicated outside details');
const W=x.states.wire;
Object.assign(W,{first:'nife30',wraps:7,other:'nife30',otherWraps:6,final:null,finalWraps:null,goal:null,family:null,liquidIndex:null});
const sameAlloy=x.wireWizard();
assert.match(sameAlloy,/alte spire/,'Allow different coil wraps of the same material');
assert.match(sameAlloy,/Comparație pe 15 atomizoare comune/,'Compare NiFe30/7 and NiFe30/6 on same 15 platforms');
assert.equal((sameAlloy.match(/class="wire-quick-row"/g)||[]).length,12,'Two geometries × six axes');
assert.equal((sameAlloy.match(/data-exp-final-choice=/g)||[]).length,2,'Either coil geometry is a valid explicit final choice');
W.otherWraps=7;
assert.match(x.wireWizard(),/Ai ales de două ori același build/,'No false A/B with identical coil material/wraps');
W.otherWraps=6;

assert.equal(JSON.stringify({atoms:w.RTA_CORE.atoms,liquids:w.RTA_LIQUIDS,observations:c.observations,prefs:c.personalPreferences}),original,'Canonical data preserved');
const html=fs.readFileSync('rta-lab/atlas-preview/index.html','utf8');
assert.match(html,/decision-explorer\.js/);assert.match(html,/decision-explorer\.css/);
console.log('DECISION FLOW MODEL PASS: 14 objectives, 4 classes / 700 catalog, 15 active platforms, allowed wraps, model fit and top-three exceptions.');
