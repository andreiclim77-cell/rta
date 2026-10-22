'use strict';
// Optional power mode for Dicodes RESISTHERM NiFe30; TC defaults are preserved.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root='rta-lab',sandbox={window:{}};vm.createContext(sandbox);
function load(p){vm.runInContext(fs.readFileSync(path.join(root,p),'utf8'),sandbox,{filename:p});}
for(const n of ['atoms-1.js','atoms-2.js','atoms-3.js','wires.js','core.js'])load('data/'+n);
for(const n of fs.readdirSync(path.join(root,'data')).filter(n=>/^liquids-.*\.js$/.test(n)).sort())load('data/'+n);
load('data/bell-liquid-fit.js');load('data/sensory-core.js');
const c=sandbox.window.RTA_SENSORY_CORE,all=sandbox.window.RTA_WIRES;
assert.equal(Object.keys(c.wires).length,6,'Do not create a duplicate wire family');
assert.deepEqual([...c.allowedRegimes('nife30')],['tc','watt']);
assert.deepEqual([...c.allowedRegimes('nife52')],['tc']);
assert.deepEqual([...c.allowedRegimes('k128')],['watt']);
assert.equal(c.nife30Watt.power,12);
assert.equal(c.nife30Watt.wrapsObserved,7);
assert.deepEqual(Object.keys(c.nife30Watt.chipsets),['dicodes','yihi','arc1','dna']);
assert.equal(all.find(w=>w.id==='nife30').wattNiFe30.powerW,12);
const gt=c.defaultConfig('gtr'),klp=c.defaultConfig('klp'),other=c.defaultConfig('415');
assert.equal(gt.regime,'tc');assert.equal(gt.power,16);assert.equal(gt.temp,230);
assert.equal(klp.regime,'tc');assert.equal(klp.power,16);assert.equal(klp.temp,220);
assert.equal(other.regime,'tc');
assert.equal(c.defaultConfig('klp').wire,'nife30');
const sample={class:'NET complex',name:'Sample',tags:['latakia']};
const tc=c.config('gtr',{...gt,regime:'tc',chipset:''});
for(const id of Object.keys(c.nife30Watt.chipsets)){
 const watt=c.config('gtr',{...gt,regime:'watt',chipset:id,power:12});
 assert.equal(c.modeFor(watt),'watt');
 assert.equal(watt.power,12);assert.equal(watt.chipset,id);assert.equal(watt.wraps,7);
 assert.equal(c.personalPreference(watt),null,'TC-only preference must not transfer to power mode');
 const report=c.analyze(watt,sample,'complete');
 assert.ok(report.notes.some(t=>t.includes('12 W')&&t.includes('7 spire')),'7-wrap WATT observation missing');
 assert.equal(report.anchors.length,0,'TC anchors must not be applied to WATT');
 assert.equal(report.partialEvidence.length,0,'TC partial observations must not be applied to WATT');
}
assert.equal(c.config('gtr',{wire:'nife30',regime:'watt'}).power,12);
assert.equal(c.modeFor(tc),'tc');
assert.equal(c.personalPreference(tc).tier,1,'Original TC preference must remain');
assert.equal(c.analyze(tc,sample,'complete').partialEvidence.length,1,'TC evidence must remain');
const invalid=c.config('gtr',{...gt,regime:'watt',power:12,chipset:'made-up'});
assert.equal(invalid.chipset,'','Invalid chipset is not claimed as supported');
const nife52=c.config('gtr',{wire:'nife52',regime:'watt',chipset:'dna'});
assert.equal(c.modeFor(nife52),'tc','NiFe52 has no new power-mode preset');
assert.equal(nife52.chipset,'');
assert.equal(c.config('klp',{wire:'nife30',regime:'tc'}).temp,220);
assert.equal(c.config('klp',{wire:'nife30',regime:'tc'}).power,16);
assert.equal(c.config('gtr',{wire:'nife30',regime:'watt',power:13}).power,13,'User may compare 12 and 13 W');
for(const directory of ['atlas-preview','atlas']){
 const app=fs.readFileSync(root+'/'+directory+'/app.js','utf8');
 const modules=fs.readFileSync(root+'/'+directory+'/modules.js','utf8');
 const duel=fs.readFileSync(root+'/'+directory+'/duel.js','utf8');
 const html=fs.readFileSync(root+'/'+directory+'/index.html','utf8');
 assert.ok(app.includes('core.modeFor(c)'),'Liquid Match should label the actual mode');
 assert.ok(modules.includes("'wireRegime'")&&modules.includes("'wireChipset'"),'Wire Lab selector missing');
 assert.ok(modules.includes('core.nife30Watt.chipsets'),'The four chipset options missing');
 assert.ok(modules.includes('core.modeFor(cfg)'),'TC input must be conditional');
 assert.ok(duel.includes("regime','chipset"),'Duel must compare selected power mode');
 assert.ok(html.includes('nife30-watt12-20261022-v1'),'Cache-busting version must be in HTML');
}
const ui=fs.readFileSync(root+'/sensory-ui.js','utf8'),legacy=fs.readFileSync(root+'/index.html','utf8');
assert.ok(ui.includes('choice("Regim NiFe30"')&&ui.includes('choice("Chipset electronic"'));
assert.ok(ui.includes('core.nife30Watt.power'),'WATT should open at 12 W');
assert.ok(legacy.includes('NiFe30 în WATT'),'V10 public reference should mention the new mode');
console.log('NIFE30 WATT 12 W PASS: Dicodes/YiHi/ARC1/DNA selectors, seven wraps, TC isolation, V10 + Atlas + Duel');
