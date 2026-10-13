/* Sensory DNA Core regression: geometry, bell, airflow, TC, personal A/B, UI, all catalog. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root="rta-lab";
const env={window:{}};
vm.createContext(env);
function load(p){vm.runInContext(fs.readFileSync(path.join(root,p),"utf8"),env,{filename:p});}
["data/atoms-1.js","data/atoms-2.js","data/atoms-3.js","data/wires.js","data/core.js"].forEach(load);
fs.readdirSync(path.join(root,"data")).filter(x=>/^liquids-.*\.js$/.test(x)).sort().forEach(x=>load("data/"+x));
load("data/bell-liquid-fit.js");
load("data/sensory-core.js");
const api=env.window.RTA_SENSORY_CORE,catalog=env.window.RTA_LIQUIDS,atoms=env.window.RTA_CORE.atoms;
assert.equal(atoms.length,16);
assert.equal(catalog.length,620);
assert.equal(Object.keys(api.platforms).length,16);
assert.equal(api.axioms.length,10);
assert.equal(api.dimensions.length,5);
assert.equal(Object.keys(api.wires).length,6,"Six material variants in five active wire families.");
const names=["architecture","palate","energy","harmony","pleasure"];
assert.deepEqual(JSON.parse(JSON.stringify(api.dimensions.map(x=>x.id))),names);
const sample={class:"NET complex",brand:"Smoke Test",name:"Latakia Oriental Balkan",profile:"English blend, layered Latakia",tags:["latakia","oriental","layers"]};
let totalVariants=0;
for(const atom of atoms){
 const tech=api.platforms[atom.id],base=api.defaultConfig(atom.id);
 assert.ok(tech && tech.air.length>=1,atom.id);
 assert.ok(api.permitted(atom.id,base.wire,base.wraps),atom.id);
 assert.ok(tech.air.some(a=>a.id===base.air),atom.id);
 const models=api.variants(atom.id);
 assert.ok(models.length>=5 && models.length<=8,atom.id);
 totalVariants+=models.length;
 assert.equal(new Set(models.map(x=>x.wire+"-"+x.wraps)).size,models.length);
 for(const v of models){
  const config=api.config(atom.id,{...base,...v});
  const r=api.analyze(config,sample,"complete");
  assert.ok(r,"Missing config result "+atom.id);
  assert.ok(!("topGlobal" in r));
  assert.equal(r.dimensions.pleasure,null);
  assert.ok(typeof r.physical.coverageMatch==="number");
  assert.ok(Object.values(r.signals).every(x=>Number.isFinite(x)&&x>=1&&x<=5));
  assert.ok(["observație personală + extrapolare la lichid","observație personală parțială + extrapolare tehnică","predicție tehnică orientativă"].includes(r.certainty));
  assert.ok(r.advantages.length && r.tradeoffs.length);
 }
 const ordered=api.rankBuilds(atom.id,sample,"complete");
 assert.equal(ordered.length,models.length);
 for(let i=1;i<ordered.length;i++)assert.ok(ordered[i-1].rankScore>=ordered[i].rankScore);
 const picks=api.matchLiquids(base,catalog,"complete");
 assert.equal(picks.length,620,"Catalog truncated "+atom.id);
 assert.equal(new Set(picks.map(x=>x.index)).size,620);
 for(let i=1;i<picks.length;i++)assert.ok(picks[i-1].score>=picks[i].score);
}
const k5=api.analyze({atom:"klp",wire:"k128",wraps:5},sample);
const k6=api.analyze({atom:"klp",wire:"k128",wraps:6},sample);
assert.ok(k5.signals.th>k6.signals.th && k5.signals.offense>k6.signals.offense);
assert.ok(k5.signals.palate>k6.signals.palate);
assert.ok(k5.pleasure && k5.anchors.length>0);
assert.ok(k6.pleasure && k6.anchors.length>0);
const klpRanked=api.rankBuilds("klp",sample);
assert.ok(klpRanked.some(r=>r.config.wire==="k128"&&r.config.wraps===5));
assert.ok(klpRanked.some(r=>r.config.wire==="nife30"&&r.config.wraps===6));
assert.equal(klpRanked.find(r=>r.config.wire==="nife30").config.temp,220);
assert.equal(klpRanked.find(r=>r.config.wire==="nife30").config.power,16);
const klpDNA=api.analyze({atom:"klp",wire:"nife30",wraps:6,coilMm:2.5,temp:220,power:16},sample);
assert.ok(klpDNA.signals.palate>k5.signals.palate);
assert.ok(klpDNA.signals.spectrum>k5.signals.spectrum);
assert.ok(klpDNA.signals.offense>k5.signals.offense);
assert.ok(klpDNA.signals.th>k5.signals.th);
assert.equal(klpDNA.anchors.length,0,"Do not invent an exact controlled KLP TC A/B");
assert.equal(klpDNA.partialEvidence.length,1,"Recorded personal KLP NiFe30 finding must be surfaced");
assert.ok(klpDNA.pleasure.includes("magie"));
assert.ok(klpDNA.certainty.includes("parțială"));
const klpOtherTemp=api.analyze({atom:"klp",wire:"nife30",wraps:6,temp:235,power:16},sample);
assert.equal(klpOtherTemp.partialEvidence.length,0);
const klpOtherPower=api.analyze({atom:"klp",wire:"nife30",wraps:6,temp:220,power:12},sample);
assert.equal(klpOtherPower.partialEvidence.length,0);
assert.ok(api.nife30Family.candidates.includes("kv3"));
assert.ok(api.nife30Family.untested.includes("kv3"));
assert.equal(api.nife30Family.reported.includes("klp"),true);
const gtrTC=api.analyze("gtr",sample);
assert.equal(gtrTC.config.wire,"nife30");
assert.ok(gtrTC.pleasure.includes("magie"));
const gtrRW=api.analyze({atom:"gtr",wire:"k128",wraps:5},sample);
assert.ok(gtrTC.dimensions.palate>gtrRW.dimensions.palate);
const noAnchor=api.analyze({atom:"gtr",wire:"nife30",wraps:6,air:"hole10"},sample);
assert.equal(noAnchor.anchors.length,0,"No transfer of personal TC test to untested airflow.");
const cl=api.analyze("dvarwcl",sample);
const clSingle=api.analyze({atom:"dvarwcl",air:"single12"},sample);
assert.ok(clSingle.signals.offense>=cl.signals.offense);
assert.equal(clSingle.anchors.length,0);
assert.equal(api.config("dvarwcl").air,"triple06");
assert.ok(Math.abs(api.physical(api.config("dvarwcl")).areaMm2-.848)<.01);
assert.ok(Math.abs(api.physical(api.config("dvarwcl",{air:"single12"})).areaMm2-1.131)<.01);
assert.equal(api.permitted("asylum","ssclap",5),false);
assert.equal(api.permitted("klp","nife30",6),true);
assert.equal(api.permitted("415","k128",6),false);
assert.ok(!api.variants("415").some(x=>x.wire==="k128"&&x.wraps===6));
assert.ok(api.variants("klp").some(x=>x.wire==="nife52"),"NiFe52 compatible, but unvalidated on KLP");
const fl=api.analyze({atom:"pmfree",bell:"freehand"},sample);
const rh=api.analyze({atom:"pmfree",bell:"rhodesian"},sample);
assert.ok(fl.signals.separation>rh.signals.separation);
const tiny=api.matchLiquids(api.defaultConfig("gtr"),catalog,"complete",6);
assert.equal(tiny.length,6);
const sameInput=JSON.stringify(catalog);
api.matchLiquids(api.defaultConfig("klp"),catalog,"th",8);
assert.equal(JSON.stringify(catalog),sameInput);
const global=api.bestForLiquid(sample,"complete");
assert.equal(global.length,16);
assert.equal(new Set(global.map(x=>x.atom)).size,16);
// Browser-side UI state smoke test without network or localStorage access.
class Classes{
 constructor(){this.values=new Set(["hidden"]);}
 add(v){this.values.add(v);}
 remove(v){this.values.delete(v);}
 toggle(v,active){if(active)this.add(v);else this.remove(v);}
 contains(v){return this.values.has(v);}
}
class Node{
 constructor(id){this.id=id;this.value="";this.innerHTML="";this.hidden=false;this.classList=new Classes();
  this.events={};this.dataset={};this.options=[];}
 addEventListener(kind,fn){(this.events[kind]??=[]).push(fn);}
 trigger(kind,e={}){(this.events[kind]||[]).forEach(fn=>fn({target:e.target||this}));}
 setAttribute(name,v){this[name]=v;}
 querySelectorAll(){return [];}
 dispatchEvent(){return true;}
}
const nodes={},find=id=>nodes[id]??(nodes[id]=new Node(id));
const doc={getElementById:find,querySelectorAll:()=>[],events:{},
 addEventListener(k,f){this.events[k]=f;}};
const sandbox={
 window:{RTA_CORE:env.window.RTA_CORE,RTA_LIQUIDS:catalog,
 RTA_SENSORY_CORE:api,RTA_BELL_LIQUID_FIT:env.window.RTA_BELL_LIQUID_FIT,
 localStorage:{getItem:()=>{throw new Error("Storage denied");},setItem:()=>{throw new Error("Storage denied");}}},
 document:doc,Event:class{constructor(type,opts){this.type=type;this.bubbles=opts&&opts.bubbles;}},
 state:{objective:"complete",liquid:null},
 setObjective:o=>{sandbox.state.objective=o;},
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,"sensory-ui.js"),"utf8"),sandbox);
find("atomExplorer").value="gtr";
doc.events.DOMContentLoaded();
assert.ok(find("sensoryExplorer").innerHTML.includes("GTR"));
assert.ok(find("sensoryExplorer").innerHTML.includes("magie pe palat"));
// Three-zone navigation and landmarks must be present in both paths.
function checkThreeZones(view){
 const html=find("sensory"+(view==="explorer"?"Explorer":"Main")).innerHTML;
 const order=["config","dna","recommendations"].map(name=>html.indexOf('id="sd-'+view+'-'+name+'"'));
 assert.ok(order.every(index=>index>=0),"Missing stage landmark in "+view);
 assert.ok(order[0]<order[1]&&order[1]<order[2],"Wrong stage order in "+view);
 for(const name of ["config","dna","recommendations"]){
  assert.ok(html.includes('href="#sd-'+view+'-'+name+'"'),"Missing navigation link "+view+"/"+name);
  assert.ok(html.includes('aria-labelledby="sd-'+view+'-'+name+'-title"'),"Missing accessible heading "+view+"/"+name);
 }
 assert.ok(html.includes("Ce câștigi")&&html.includes("Ce sacrifici"),"Missing sensory trade-offs");
 assert.ok(html.includes("TOP 3 configurații pentru obiectiv"),"Missing alternative builds");
 assert.ok(html.includes("Lichide din catalog potrivite"),"Missing liquid recommendations");
}
checkThreeZones("explorer");
assert.equal(find("labLiquidView").hidden,true);
find("mode-main").trigger("click");
find("atom").value="gtr";
sandbox.window.RTA_SENSORY_UI.render("main");
checkThreeZones("main");
assert.equal(find("labExplorerView").hidden,true);
assert.equal(find("labLiquidView").hidden,false);
find("mode-explorer").trigger("click");
find("sensoryExplorer").trigger("change",{target:{dataset:{sdField:"wire"},value:"k128"}});
assert.equal(sandbox.window.RTA_SENSORY_UI.configFor("gtr","explorer").wire,"k128");
checkThreeZones("explorer");
assert.ok(find("sensoryExplorer").innerHTML.includes("Kanthal A1 28 GA"));
find("sensoryExplorer").trigger("change",{target:{dataset:{sdField:"wire"},value:"nife30"}});
assert.equal(sandbox.window.RTA_SENSORY_UI.configFor("gtr","explorer").wire,"nife30");
find("sensoryExplorer").trigger("change",{target:{dataset:{sdProfile:"explorer"},value:"Tutun complex"}});
assert.equal(sandbox.window.RTA_SENSORY_UI.states.explorer.category,"Tutun complex");
assert.ok(find("sensoryExplorer").innerHTML.includes("Tutun complex"));
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
for(const token of ["sensoryExplorer","sensoryMain","mode-main","mode-explorer","data/sensory-core.js","sensory-ui.js","sensory-ui.css"])assert.ok(html.includes(token),token+" missing in HTML");
for(const token of ["sensory-ui.css","sensory-ui.js","data/sensory-core.js"])assert.ok(sw.includes(token),token+" missing in offline cache");
console.log("RTA SENSORY DNA PASS: "+atoms.length+" platforms, "+totalVariants+
 " active build variants, 620-liquid full catalog checks, A/B invariants, mobile flow logic and UI smoke.");
