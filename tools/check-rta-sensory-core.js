/* Sensory DNA Core regression: geometry, bell, airflow, TC, personal A/B, UI, all catalog. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root="rta-lab";
// Physical ownership is distinct from the 16-platform sensory model.
const inventoryMaster=fs.readFileSync(path.join(root,"RTA_CONTINUITY_MASTER.md"),"utf8");
const physicalSection=(inventoryMaster.split("## 2. Inventar activ")[1]||"").split("## 3. Sârme")[0];
const physicalRows=[...physicalSection.matchAll(/^\| ([^|]+) \| (\d+) \|/gm)]
  .map(([,name,quantity])=>({name:name.trim(),quantity:Number(quantity)}));
assert.equal(physicalRows.length,16,"Keep all 16 platforms in the canonical physical inventory");
assert.equal(physicalRows.reduce((sum,item)=>sum+item.quantity,0),42,
  "Total must reflect three Dvarw CL, not the previous single unit");
for(const [name,expected] of [
 ["Dvarw MTL CL 22",3],["Dvarw MTL FL",2],
 ["KLP / Kayfun Lite Plus 2021",5],["Taifun GTR",5]
]){
 const row=physicalRows.find(item=>item.name===name);
 assert.ok(row,"Missing physical inventory platform: "+name);
 assert.equal(row.quantity,expected,"Incorrect count: "+name);
}
assert.ok(inventoryMaster.includes("## 20. Preferințe și comparația Balkan Milestone"),
  "Canonical MASTER must record the new personal FL A/B");
assert.ok(inventoryMaster.includes("insertul 3×0,6 mm este prima alegere personală clară"),
  "Both Dvarw platforms must adopt user's 3×0.6 airflow preference");
assert.ok(inventoryMaster.includes("egalitate")&&inventoryMaster.includes("NiFe52"),
  "NiFe30/NiFe52 personal equality should not be lost");
assert.ok(!inventoryMaster.includes("fără test/instalare confirmată"),
  "Historical untested FL state must no longer be stated as active");
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
 assert.ok(models.length>=5 && models.length<=9,atom.id);
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
assert.ok(klpRanked.some(r=>r.config.wire==="nife30"&&r.config.wraps===7));
assert.ok(!klpRanked.some(r=>r.config.wire==="nife30"&&r.config.wraps===6));
assert.equal(klpRanked.find(r=>r.config.wire==="nife30").config.temp,230);
assert.equal(klpRanked.find(r=>r.config.wire==="nife30").config.power,13);
assert.equal(api.config("klp",{wire:"nife30",wraps:6}),null,"Retired Dicodes coil must fail closed");
assert.equal(api.analyze({atom:"klp",wire:"nife30",wraps:6},sample),null);
const klpCurrent=api.analyze({atom:"klp",wire:"nife30",wraps:7},sample);
assert.equal(klpCurrent.partialEvidence.length,1,"Keep personal current /7 partial evidence");
assert.ok(klpCurrent.pleasure.includes("coerență"));
const klpDifferentTemperature=api.analyze({atom:"klp",wire:"nife30",wraps:7,temp:235},sample);
assert.ok(klpDifferentTemperature,"Valid /7 may use another temperature");
assert.ok(api.nife30Family.candidates.includes("kv3"));
assert.ok(api.nife30Family.untested.includes("kv3"));
assert.equal(api.nife30Family.reported.includes("klp"),true);
// Directly declared platform preferences must supersede generic compact-coil priors.
assert.equal(api.defaultConfig("muted").wire,"k128");
assert.equal(api.defaultConfig("muted").wraps,6);
assert.equal(api.personalPreference({atom:"muted",wire:"k128",wraps:6}).tier,1);
assert.equal(api.defaultConfig("gtone").wire,"k129");
assert.equal(api.defaultConfig("gtone").wraps,6);
assert.equal(api.personalPreference({atom:"gtone",wire:"k129",wraps:6}).tier,1);
assert.equal(api.personalPreference({atom:"gtone",wire:"k128",wraps:5}).tier,2);
assert.equal(api.defaultConfig("dvarwcl").air,"triple06");
const fDefault=api.defaultConfig("dvarwfl");
assert.equal(fDefault.air,"triple06");
assert.equal(fDefault.wire,"k128");
assert.equal(fDefault.wraps,6);
assert.equal(api.personalPreference(fDefault).tier,1);
assert.equal(api.personalPreference({...fDefault,air:"single12"}).tier,2);
// Balkan Milestone is a named personal test, not a fabricated 621st catalog entry.
assert.equal(catalog.some(x=>x.name==="Balkan Milestone"),false);
const balkan={name:"Balkan Milestone",brand:"A/B personal",class:"profil netipizat",tags:[]};
const flThree=api.analyze(fDefault,balkan);
const flSingle=api.analyze({...fDefault,air:"single12"},balkan);
assert.equal(flThree.anchors.length,0,"Missing wattage/coil position: do not invent fully controlled A/B");
assert.equal(flThree.partialEvidence.length,1,"Keep user Balkan Milestone comparison as partial evidence");
assert.equal(flThree.partialEvidence[0].liquidName,"Balkan Milestone");
assert.equal(flSingle.partialEvidence.length,0,"Do not transfer triple-insert report to single 1.2 mm");
assert.ok(flThree.signals.spectrum>flSingle.signals.spectrum);
assert.ok(flThree.signals.palate>flSingle.signals.palate);
assert.ok(flThree.signals.simultaneity>flSingle.signals.simultaneity);
assert.ok(flThree.signals.th<flSingle.signals.th);
for(const atom of ["klp","gtr","kx","kprime"]){
 const dicodesWraps=7;
 const a=api.personalPreference({atom,wire:"nife30",wraps:dicodesWraps});
 const b=api.personalPreference({atom,wire:"nife52",wraps:6});
 assert.equal(a.tier,1,atom);
 assert.equal(b.tier,1,atom);
 assert.equal(a.label,b.label,"Personal first-choice tie across different NiFe alloys");
 assert.equal(api.personalPreference({atom,wire:"k128",wraps:5}).tier,2);
 const d={config:{atom,wire:"nife30",wraps:dicodesWraps},dimensions:{architecture:4,palate:4,harmony:4,energy:4},anchors:[],personalPreference:a};
 const e={...d,config:{atom,wire:"nife52",wraps:6},personalPreference:b};
 assert.equal(api.priority(d,"complete"),api.priority(e,"complete"),
  "Equal personal boost for NiFe30 and NiFe52, independent of actual technical differences");
}
assert.equal(api.defaultConfig("klp").wire,"nife30");
assert.equal(api.defaultConfig("klp").wraps,7);
assert.equal(api.defaultConfig("kx").wire,"nife30");
assert.equal(api.defaultConfig("kx").wraps,7);
assert.equal(api.defaultConfig("kprime").wire,"nife52");
// GTR current NiFe30/7 and NiFe52/6 only; retired Dicodes six-wrap unavailable.
const gtrTC=api.analyze("gtr",sample);
assert.equal(gtrTC.config.wire,"nife30");
assert.equal(gtrTC.config.wraps,7);
assert.equal(gtrTC.config.temp,230);
assert.equal(gtrTC.config.power,16);
assert.equal(gtrTC.personalPreference.tier,1);
assert.equal(gtrTC.anchors.length,0,"7-wrap is not a controlled same-liquid A/B");
assert.equal(gtrTC.partialEvidence.length,1,"Current 7-wrap report is partial evidence");
assert.ok(gtrTC.pleasure.includes("coerență"));
assert.equal(api.config("gtr",{wire:"nife30",wraps:6}),null);
assert.equal(api.analyze({atom:"gtr",wire:"nife30",wraps:6},sample),null);
assert.equal(api.personalPreference({atom:"gtr",wire:"nife52",wraps:6}).tier,1);
assert.equal(api.config("gtr",{wire:"nife52",wraps:6}).wraps,6);
assert.equal(api.permitted("gtr","nife52",7),false);
assert.deepEqual(JSON.parse(JSON.stringify(api.variants("gtr").filter(v=>v.wire==="nife30"))),[{wire:"nife30",wraps:7}]);
for(const other of atoms){
 assert.equal(api.permitted(other.id,"nife30",7),true);
 assert.equal(api.permitted(other.id,"nife30",6),false);
 assert.equal(api.permitted(other.id,"nife52",7),false);
 assert.ok(!api.rankBuilds(other.id,sample).some(r=>r.config.wire==="nife30"&&r.config.wraps===6));
 const top3=api.rankBuilds(other.id,sample).filter((r,i,a)=>a.findIndex(x=>x.config.wire===r.config.wire)===i).slice(0,3);
 assert.ok(top3.some(r=>!r.config.wire.startsWith("nife")),"Best available non-NiFe replacement: "+other.id);
}
for(const id of ["klp","kx","kprime"]){
 assert.equal(api.permitted(id,"nife30",6),false);
 assert.equal(api.permitted(id,"nife52",6),true);
}
const gtrRW=api.analyze({atom:"gtr",wire:"k128",wraps:5},sample);
assert.ok(gtrTC.dimensions.palate>gtrRW.dimensions.palate);
const noAnchor=api.analyze({atom:"gtr",wire:"nife30",wraps:7,air:"hole10"},sample);
assert.equal(noAnchor.anchors.length,0,"Do not invent TC A/B for untested airflow.");
// Two full physical Dvarw CL pairings: 3×0,6 / K1 28/6 and 1×1,2 / K1 28/5.
const clPairings=api.personalSetups("dvarwcl");
assert.equal(clPairings.length,2,"Both CL personal setups must be selectable");
assert.deepEqual(JSON.parse(JSON.stringify(clPairings.map(x=>x.id))),["cl-triple-28-6","cl-single-28-5"]);
assert.ok(clPairings.every(x=>x.atom==="dvarwcl"&&x.wire==="k128"&&api.permitted(x.atom,x.wire,x.wraps)));
assert.equal(clPairings[0].air,"triple06");
assert.equal(clPairings[0].wraps,6);
assert.equal(clPairings[1].air,"single12");
assert.equal(clPairings[1].wraps,5);
assert.equal(api.personalSetups("gtr").length,0,"CL pairings must not leak to other platforms");
const cl=api.analyze("dvarwcl",sample);
const clSingle=api.analyze({atom:"dvarwcl",air:"single12"},sample);
const clSingle5=api.analyze({atom:"dvarwcl",air:"single12",wire:"k128",wraps:5},sample);
assert.equal(clSingle5.anchors.length,0);
assert.equal(clSingle5.partialEvidence.length,1);
assert.ok(clSingle5.partialEvidence[0].text.includes("merge bine"));
assert.ok(clSingle5.personalPreference.label.includes("Alternativă reușită"));
assert.equal(clSingle.partialEvidence.length,0);
assert.equal(api.defaultConfig("dvarwcl").wraps,6);
assert.ok(clSingle.signals.offense>=cl.signals.offense);
assert.equal(clSingle.anchors.length,0);
assert.equal(api.config("dvarwcl").air,"triple06");
assert.ok(Math.abs(api.physical(api.config("dvarwcl")).areaMm2-.848)<.01);
assert.ok(Math.abs(api.physical(api.config("dvarwcl",{air:"single12"})).areaMm2-1.131)<.01);
assert.equal(api.permitted("asylum","ssclap",5),false);
assert.equal(api.permitted("klp","nife30",6),false);
assert.equal(api.permitted("415","k128",6),true,"415 K1 28/6 was newly validated");
assert.ok(api.variants("415").some(x=>x.wire==="k128"&&x.wraps===6));
assert.ok(api.variants("415").some(x=>x.wire==="k128"&&x.wraps===5),"Keep historical 415 28/5");
assert.equal(api.permitted("415","nife30",7),true);
assert.equal(api.permitted("415","nife30",6),false,"Six-wrap Dicodes retired globally");
assert.equal(api.permitted("415","nife52",6),true);
assert.equal(api.permitted("415","nife52",7),false);
assert.ok(api.variants("415").some(x=>x.wire==="nife30"&&x.wraps===7));
const cool=api.defaultConfig("415");
assert.equal(cool.wire,"nife30");
assert.equal(cool.wraps,7);
assert.equal(api.personalPreference(cool).tier,1);
const cool30=api.analyze(cool,sample);
const cool52=api.analyze({atom:"415",wire:"nife52",wraps:6},sample);
const coolK1=api.analyze({atom:"415",wire:"k128",wraps:6},sample);
assert.equal(cool52.personalPreference.tier,1);
assert.equal(coolK1.personalPreference.tier,2);
assert.equal(cool30.personalPreference.label,cool52.personalPreference.label);
for(const v of [cool30,cool52,coolK1]){
 assert.equal(v.anchors.length,0,"The new 415 preference has no fully controlled named-liquid A/B");
 assert.equal(v.partialEvidence.length,1,"Personal evidence on 415 must remain partial");
 assert.equal(v.dimensions.pleasure,null,"Do not fabricate a measured pleasure score");
}
const oldClap=api.analyze({atom:"415",wire:"k1clap",wraps:5},sample);
assert.ok(oldClap.anchors.length>0,"Keep dedicated Clapton pairing historical evidence");
for(const other of atoms.filter(x=>x.id!=="415"&&x.id!=="gtr")){
 assert.equal(api.permitted(other.id,"nife30",7),true,"NiFe30/7 must be global: "+other.id);
}
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
// Browser-side UI functional test with memory-backed localStorage and no network.
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
const browserStore=new Map();
const localStorage={getItem:k=>browserStore.has(k)?browserStore.get(k):null,
 setItem:(k,v)=>{browserStore.set(k,String(v));}};
const doc={getElementById:find,querySelectorAll:()=>[],events:{},
 addEventListener(k,f){this.events[k]=f;}};
const sandbox={
 window:{RTA_CORE:env.window.RTA_CORE,RTA_LIQUIDS:catalog,
 RTA_SENSORY_CORE:api,RTA_BELL_LIQUID_FIT:env.window.RTA_BELL_LIQUID_FIT,
 localStorage},
 document:doc,Event:class{constructor(type,opts){this.type=type;this.bubbles=opts&&opts.bubbles;}},
 state:{objective:"complete",liquid:null},
 setObjective:o=>{sandbox.state.objective=o;},
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,"sensory-ui.js"),"utf8"),sandbox);
find("atomExplorer").value="gtr";
doc.events.DOMContentLoaded();
assert.ok(find("sensoryExplorer").innerHTML.includes("GTR"));
assert.ok(find("sensoryExplorer").innerHTML.includes("coerență TC"),"GTR must show the new personal seven-wrap finding");
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
// Change wire in the actual UI: never inherit Kanthal wattage for KLP TC.
find("atomExplorer").value="klp";
sandbox.window.RTA_SENSORY_UI.render("explorer");
find("sensoryExplorer").trigger("change",{target:{dataset:{sdField:"wire"},value:"nife30"}});
const uiKlp=sandbox.window.RTA_SENSORY_UI.configFor("klp","explorer");
assert.equal(uiKlp.wire,"nife30");
assert.equal(uiKlp.wraps,7);
assert.equal(uiKlp.temp,230);
assert.equal(uiKlp.power,13);
assert.ok(find("sensoryExplorer").innerHTML.includes("OBSERVAȚIE PARȚIALĂ"));
assert.ok(find("sensoryExplorer").innerHTML.includes("NiFe30/7"),"KLP global seven-wrap choice must be visible");
const flExplorer=find("atomExplorer");flExplorer.value="dvarwfl";
sandbox.window.RTA_SENSORY_UI.render("explorer");
assert.ok(find("sensoryExplorer").innerHTML.includes("Balkan Milestone"),
  "Current FL 3×0,6 K1 28/6 must surface personal Balkan comparison");
assert.ok(find("sensoryExplorer").innerHTML.includes("Preferință personală declarată"),
  "Sensory DNA should show declared preferences separately from technical evidence");
// Exercise real button event handling, full setup switch, persistence in both views,
// custom power preservation, unrelated KLP TC, and invalid preset rejection.
find("atomExplorer").value="dvarwcl";
sandbox.window.RTA_SENSORY_UI.render("explorer");
const clRoot=find("sensoryExplorer"),ui=sandbox.window.RTA_SENSORY_UI;
for(const id of ["cl-triple-28-6","cl-single-28-5"])
 assert.ok(clRoot.innerHTML.includes('data-sd-preset="'+id+'"'),"Dvarw CL setup card missing: "+id);
assert.ok(clRoot.innerHTML.includes("Nu este un A/B izolat"),"Warn that airflow and wraps both change");
assert.ok(clRoot.innerHTML.includes('aria-pressed="true"'),"Active setup needs accessible pressed state");
const clickSetup=id=>clRoot.trigger("click",{target:{closest:()=>({dataset:{sdPreset:id}})}});
clRoot.trigger("change",{target:{dataset:{sdField:"power"},value:"13"}});
clickSetup("cl-single-28-5");
let chosen=ui.configFor("dvarwcl","explorer");
assert.equal(chosen.air,"single12");
assert.equal(chosen.wire,"k128");
assert.equal(chosen.wraps,5);
assert.equal(chosen.power,13,"Switching the same wire must preserve explicitly adjusted power");
assert.equal(ui.configFor("dvarwcl","main").air,"single12","Both modes share the chosen setup");
assert.ok(/data-sd-preset="cl-single-28-5"[^>]*aria-pressed="true"/.test(clRoot.innerHTML));
assert.ok(clRoot.innerHTML.includes("Alternativă reușită"));
const unchanged=JSON.stringify(chosen);
assert.equal(ui.applyPersonalSetup("explorer","unknown-setup"),false,"Invalid setup ID must be rejected");
assert.equal(JSON.stringify(ui.configFor("dvarwcl","explorer")),unchanged);
clickSetup("cl-triple-28-6");
chosen=ui.configFor("dvarwcl","explorer");
assert.equal(chosen.air,"triple06");
assert.equal(chosen.wire,"k128");
assert.equal(chosen.wraps,6);
assert.equal(chosen.power,13);
assert.ok(/data-sd-preset="cl-triple-28-6"[^>]*aria-pressed="true"/.test(clRoot.innerHTML));
assert.equal(ui.configFor("klp","explorer").temp,230,"KLP NiFe30/7 preset must remain independent of Dvarw CL");
// Three separate physical units, none silently marked as already mounted.
const physicalAtStart=ui.physicalClState();
assert.equal(physicalAtStart.active,1);
assert.equal(physicalAtStart.units.length,3);
assert.equal(physicalAtStart.storageAvailable,true);
assert.ok(physicalAtStart.units.every(u=>!u.saved),"Fresh units must start unregistered");
assert.ok(clRoot.innerHTML.includes("Cele 3 exemplare Dvarw CL"));
for(const n of [1,2,3])assert.ok(clRoot.innerHTML.includes('data-sd-cl-unit="'+n+'"'));
assert.ok(clRoot.innerHTML.includes("preset orientativ"),"No physical installation should be inferred");
const clickUnit=n=>clRoot.trigger("click",{target:{closest:()=>({dataset:{sdClUnit:String(n)}})}});
const clickClAction=key=>clRoot.trigger("click",{target:{closest:()=>({dataset:{[key]:"1"}})}});
// Record physical CL #1 only after explicit confirmation; keep W 13 from prior A/B.
clickClAction("sdClSave");
assert.equal(ui.physicalClState().units[0].status,"Înregistrat");
assert.equal(ui.physicalClState().units[0].saved.air,"triple06");
assert.equal(ui.physicalClState().units[0].saved.wraps,6);
assert.equal(ui.physicalClState().units[0].saved.power,13);
// CL #2 is still unset; initialize independent single-hole/5-wrap profile.
clickUnit(2);
assert.equal(ui.physicalClState().active,2);
assert.equal(ui.physicalClState().units[1].saved,null);
assert.equal(ui.physicalClState().units[1].draft,null);
assert.equal(ui.configFor("dvarwcl","explorer").air,"triple06");
clickSetup("cl-single-28-5");
assert.equal(ui.physicalClState().units[1].saved,null,"Choosing preset is only a draft");
assert.equal(ui.physicalClState().units[1].draft.air,"single12");
assert.equal(ui.physicalClState().units[1].draft.wraps,5);
clickClAction("sdClSave");
assert.equal(ui.physicalClState().units[1].saved.air,"single12");
assert.equal(ui.physicalClState().units[1].saved.wraps,5);
assert.equal(ui.physicalClState().units[0].saved.air,"triple06","Saving CL2 must not overwrite CL1");
// CL #3 gets an independent K1 29/5 build and unsaved power edit that can be reverted.
clickUnit(3);
assert.equal(ui.physicalClState().units[2].saved,null);
clRoot.trigger("change",{target:{dataset:{sdField:"wire"},value:"k129"}});
clRoot.trigger("change",{target:{dataset:{sdField:"wraps"},value:"5"}});
assert.equal(ui.physicalClState().units[2].saved,null);
assert.equal(ui.physicalClState().units[2].draft.wire,"k129");
clickClAction("sdClSave");
const thirdSaved=ui.physicalClState().units[2].saved;
assert.equal(thirdSaved.wire,"k129");
assert.equal(thirdSaved.wraps,5);
clRoot.trigger("change",{target:{dataset:{sdField:"power"},value:"11"}});
assert.equal(ui.physicalClState().units[2].status,"Modificări nesalvate");
assert.equal(ui.physicalClState().units[2].saved.power,thirdSaved.power,"Draft edits must not mutate committed record");
clickClAction("sdClRevert");
assert.equal(ui.physicalClState().units[2].status,"Înregistrat");
assert.equal(ui.configFor("dvarwcl","explorer").power,thirdSaved.power);
// Invalid switching must not mutate selection or another device.
assert.equal(ui.selectPhysicalCl("explorer",0),false);
assert.equal(ui.selectPhysicalCl("explorer",4),false);
assert.equal(ui.selectPhysicalCl("explorer","x"),false);
assert.equal(ui.physicalClState().active,3);
clickUnit(1);
assert.equal(ui.configFor("dvarwcl","explorer").air,"triple06");
assert.equal(ui.configFor("dvarwcl","explorer").wraps,6);
assert.equal(ui.configFor("dvarwcl","explorer").power,13);
clickUnit(2);
assert.equal(ui.configFor("dvarwcl","explorer").air,"single12");
assert.equal(ui.configFor("dvarwcl","explorer").wraps,5);
assert.equal(ui.configFor("dvarwcl","main").air,"single12","Main and explorer must share CL2 active state");
assert.equal(ui.configFor("klp","explorer").temp,230,"KLP NiFe30/7 preset must not change when switching CLs");
assert.equal(ui.configFor("dvarwfl","explorer").air,"triple06","Dvarw FL must remain separate");
// Ensure all three committed records survive in storage; never leak into generic CL slot.
const persisted=JSON.parse(browserStore.get("rta-cl-physical-units-v1-20261014"));
assert.equal(persisted.schema,1);
assert.equal(persisted.active,1);
assert.equal(persisted.units.length,3);
assert.deepEqual(persisted.units.map(u=>u.saved.air),["triple06","single12","triple06"]);
assert.equal(persisted.units[2].saved.wire,"k129");
// Drafts survive switching without silently rewriting the committed physical record.
clickUnit(1);
clRoot.trigger("change",{target:{dataset:{sdField:"position"},value:"high"}});
assert.equal(ui.physicalClState().units[0].status,"Modificări nesalvate");
assert.equal(ui.physicalClState().units[0].saved.position,"standard");
clickUnit(2);
clickUnit(1);
assert.equal(ui.configFor("dvarwcl","explorer").position,"high");
assert.equal(ui.physicalClState().units[0].saved.position,"standard");
clickClAction("sdClRevert");
assert.equal(ui.configFor("dvarwcl","explorer").position,"standard");
clickUnit(2);
// Verify fresh app initialization reads independent saved physical records.
// The second context has its own DOM/fit wrapper but shares only the storage payload.
function loadFreshPhysicalUi(storage){
 const n={},get=id=>n[id]??(n[id]=new Node(id));
 const d={getElementById:get,querySelectorAll:()=>[],events:{},
  addEventListener(k,fn){this.events[k]=fn;}};
 const fresh={window:{RTA_CORE:env.window.RTA_CORE,RTA_LIQUIDS:catalog,
   RTA_SENSORY_CORE:api,RTA_BELL_LIQUID_FIT:{...env.window.RTA_BELL_LIQUID_FIT},
   localStorage:storage},document:d,
  Event:class{constructor(type,opts){this.type=type;this.bubbles=opts&&opts.bubbles;}},
  state:{objective:"complete",liquid:null},setObjective:()=>{}};
 vm.createContext(fresh);
 vm.runInContext(fs.readFileSync(path.join(root,"sensory-ui.js"),"utf8"),fresh);
 return fresh.window.RTA_SENSORY_UI;
}
const reopened=loadFreshPhysicalUi(localStorage);
assert.equal(reopened.physicalClState().active,2);
assert.deepEqual(JSON.parse(JSON.stringify(reopened.physicalClState().units.map(u=>u.saved.air))),["triple06","single12","triple06"]);
assert.equal(reopened.configFor("dvarwcl","explorer").wraps,5);
assert.equal(reopened.configFor("dvarwcl","main").air,"single12");
const legacyData={dvarwcl:{atom:"dvarwcl",air:"single12",wire:"k128",
 wraps:5,power:14,coilMm:2.5,position:"standard"}};
const legacyStorage={getItem:k=>k==="rta-sensory-dna-choice-20261013"?JSON.stringify(legacyData):null,
 setItem(){}};
const migrated=loadFreshPhysicalUi(legacyStorage).physicalClState();
assert.equal(migrated.units[0].source,"legacy");
assert.equal(migrated.units[0].status,"Import vechi · nesalvat");
assert.equal(migrated.units[0].saved,null,"Legacy generic choice must not be claimed as a verified physical CL");
assert.equal(migrated.units[0].draft.air,"single12");
assert.equal(migrated.units[0].draft.wraps,5);
assert.equal(migrated.units[1].draft,null);
assert.equal(migrated.units[2].draft,null);
const blockedStorage={getItem(){throw new Error("Blocked");},setItem(){throw new Error("Blocked");}};
const blocked=loadFreshPhysicalUi(blockedStorage).physicalClState();
assert.equal(blocked.storageAvailable,false);
assert.equal(blocked.units.length,3,"No storage must not break the configurator");
// Mood Match opens a full CL build as a DRAFT of the active physical unit.
sandbox.setCategory=()=>{};
sandbox.activateLiquid=liquid=>{sandbox.state.liquid=liquid;};
sandbox.chooseAtom=()=>{};
const savedBeforeMood=ui.physicalClState().units[1].saved;
const fromMood={...ui.configFor("dvarwcl","explorer"),air:"triple06",wire:"k128",wraps:6};
assert.equal(ui.applyConfiguration(0,"dvarwcl",fromMood),true);
assert.equal(ui.physicalClState().active,2);
assert.equal(ui.physicalClState().units[1].draft.air,"triple06");
assert.equal(ui.physicalClState().units[1].draft.wraps,6);
assert.equal(ui.physicalClState().units[1].saved.air,savedBeforeMood.air,
 "Mood Match must not confirm a physical build on CL2");
assert.equal(ui.physicalClState().units[0].saved.air,"triple06",
 "Mood Match must not overwrite another physical CL");
assert.equal(ui.physicalClState().units[2].saved.wire,"k129",
 "Mood Match must not overwrite CL3");
assert.equal(ui.revertPhysicalCl("main"),true);
assert.equal(ui.physicalClState().units[1].draft.air,"single12",
 "Revert must restore the last registered CL2 build");
const genericStore=JSON.parse(browserStore.get("rta-sensory-dna-choice-20261013")||"{}");
assert.equal(genericStore.dvarwcl,undefined,"Physical CL records must not overwrite generic legacy config");

const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
for(const token of ["sensoryExplorer","sensoryMain","mode-main","mode-explorer","data/sensory-core.js","sensory-ui.js","sensory-ui.css"])assert.ok(html.includes(token),token+" missing in HTML");
for(const token of ["sensory-ui.css","sensory-ui.js","data/sensory-core.js"])assert.ok(sw.includes(token),token+" missing in offline cache");
console.log("RTA SENSORY DNA PASS: "+atoms.length+" platforms, "+totalVariants+
 " active build variants, 620-liquid full catalog checks, A/B invariants, mobile flow logic and UI smoke.");
