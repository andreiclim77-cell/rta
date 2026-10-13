/* Regression and integration checks: all 16 atomizers, all 620 liquids,
   documented chambers, qualitative ranking, DOM events, and TOP 3 handoff. */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root="rta-lab";
const ctx={window:{}};
vm.createContext(ctx);
function load(file){vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),ctx,{filename:file});}
["data/atoms-1.js","data/atoms-2.js","data/atoms-3.js","data/wires.js","data/core.js"].forEach(load);
fs.readdirSync(path.join(root,"data")).filter(n=>/^liquids-.*\.js$/.test(n)).sort().forEach(n=>load("data/"+n));
load("data/bell-liquid-fit.js");
const atoms=ctx.window.RTA_CORE.atoms, catalog=ctx.window.RTA_LIQUIDS, api=ctx.window.RTA_BELL_LIQUID_FIT;
assert.equal(atoms.length,16);
assert.equal(catalog.length,620);
assert.equal(api.platformIds.length,16);
const EXPECT={"Tutun simplu":145,"Tutun complex":155,"NET simplu":150,"NET complex":170};
let profiles=0;
for(const atom of atoms){
 const cfg=api.config(atom.id);
 assert.ok(cfg,"missing bell model for "+atom.id);
 for(const bell of cfg.bells){
  const result=api.analyze(atom,bell.id,catalog);
  profiles++;
  assert.equal(result.total,620,atom.id+"/"+bell.id);
  assert.equal(result.classes.length,4);
  assert.deepEqual(JSON.parse(JSON.stringify(result.counts)),EXPECT);
  assert.equal(new Set(result.matches.map(x=>x.index)).size,620);
  assert.equal(result.matches.length,620);
  assert.ok(result.matches.every(x=>Number.isFinite(x.score)));
  assert.ok(result.matches.every((x,i,a)=>i===0 || a[i-1].score>=x.score));
  assert.equal(result.bell.id,bell.id);
 }
}
const pickAtom=id=>atoms.find(a=>a.id===id);
function rank(id,bell){return api.analyze(pickAtom(id),bell,catalog);}
assert.equal(api.config("diplomat").bells.length,3);
assert.equal(api.config("asylum").bells.length,2);
assert.equal(api.config("pmfree").bells.length,2);
assert.equal(api.config("pmstd").bells.length,2);
assert.equal(api.config("gtr").bells.length,1);
assert.equal(rank("gtone","standard").classes[0].name,"Tutun simplu");
assert.equal(rank("gtr","standard").classes[0].name,"NET complex");
assert.equal(rank("klp","standard").classes[0].name,"Tutun simplu");
assert.equal(rank("pmfree","freehand").classes[0].name,"NET complex");
assert.equal(rank("pmstd","rhodesian").classes[0].name,"NET simplu");
assert.notDeepEqual(rank("asylum","flat").classes.map(x=>x.name),
                    rank("asylum","dome").classes.map(x=>x.name));
assert.deepEqual(rank("pmfree","freehand").matches.slice(0,30).map(x=>x.index),
                 rank("pmstd","freehand").matches.slice(0,30).map(x=>x.index));
assert.deepEqual(rank("pmstd","rhodesian").matches.slice(0,30).map(x=>x.index),
                 rank("pmfree","rhodesian").matches.slice(0,30).map(x=>x.index));
assert.equal(rank("gtr","unknown").bell.id,"standard");
const original=JSON.stringify(catalog);
api.analyze(pickAtom("diplomat"),"freehand",catalog);
assert.equal(JSON.stringify(catalog),original,"The original liquid catalog must never be mutated.");

class FakeClassList {
 constructor(){this.items=new Set(["hidden"]);}
 add(name){this.items.add(name);}
 remove(name){this.items.delete(name);}
 toggle(name,yes){if(yes)this.add(name);else this.remove(name);}
 contains(name){return this.items.has(name);}
}
class FakeElement {
 constructor(id){this.id=id;this.value="";this.innerHTML="";this.textContent="";this.classList=new FakeClassList();this.events={};this.parts={};this.dataset={};}
 addEventListener(name,cb){(this.events[name]||=[]).push(cb);}
 trigger(name,target){(this.events[name]||[]).forEach(cb=>cb({target:target||this}));}
 querySelector(selector){return this.parts[selector]||(this.parts[selector]=new FakeElement(selector));}
 querySelectorAll(){return [];}
 setAttribute(){}
 scrollIntoView(){}
}
const elements={};
function element(id){return elements[id]||(elements[id]=new FakeElement(id));}
const document={
 getElementById:element,
 querySelectorAll:()=>[],
 events:{},
 addEventListener(n,f){this.events[n]=f;}
};
const store={
 getItem:()=>{throw new Error("private browsing blocked storage");},
 setItem:()=>{throw new Error("private browsing blocked storage");}
};
const handoff={};
const sandbox={
 window:{RTA_CORE:{atoms:atoms},RTA_LIQUIDS:catalog,RTA_BELL_LIQUID_FIT:api,localStorage:store},
 document:document,
 setCategory:c=>{handoff.category=c;},activateLiquid:l=>{handoff.liquid=l;},
 chooseAtom:()=>{handoff.chooseAtom=(handoff.chooseAtom||0)+1;}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,"bell-liquid-ui.js"),"utf8"),sandbox);
const explorer=element("atomExplorer"),panel=element("bellLiquidExplorer"),main=element("bellLiquidMain");
explorer.value="diplomat";
document.events.DOMContentLoaded();
assert.ok(panel.innerHTML.includes("Cele patru") || panel.innerHTML.includes("patru categorii"));
assert.ok(panel.innerHTML.includes("Freehand") && panel.innerHTML.includes("Rhodesian"));
assert.ok(panel.innerHTML.includes("Tutun simplu") && panel.innerHTML.includes("NET complex"));
assert.ok(panel.innerHTML.includes("620"));
assert.ok(!panel.classList.contains("hidden"));
assert.ok(main.classList.contains("hidden"));
assert.ok(panel.querySelector('[data-bl-results="explorer"]').innerHTML.includes("data-bl-pick="));
const ui=sandbox.window.RTA_BELL_LIQUID_UI;
assert.equal(ui.views.explorer.analysis.total,620);
panel.trigger("change",{dataset:{blBell:"explorer"},value:"freehand"});
assert.equal(ui.views.explorer.analysis.bell.id,"freehand");
panel.trigger("input",{dataset:{blSearch:"explorer"},value:"Latakia"});
assert.ok(ui.views.explorer.query==="Latakia");
assert.ok(panel.querySelector('[data-bl-summary="explorer"]').textContent.includes("620"));
ui.filter("explorer","NET complex");
assert.equal(ui.views.explorer.category,"NET complex");
assert.ok(panel.querySelector('[data-bl-results="explorer"]').innerHTML.includes("NET complex"));
explorer.value="asylum";explorer.trigger("change");
assert.equal(ui.views.explorer.analysis.bell.id,"flat");
panel.trigger("change",{dataset:{blBell:"explorer"},value:"dome"});
assert.equal(ui.views.explorer.analysis.bell.id,"dome");
assert.ok(panel.innerHTML.includes("calibrate pe clopotul Flat") ||
          panel.innerHTML.includes("validat practic pe Asylum Flat"));
explorer.value="gtr";explorer.trigger("change");
assert.equal(ui.views.explorer.analysis.total,620);
assert.ok(panel.innerHTML.includes("disabled"));
assert.ok(ui.views.explorer.analysis.total===620);
const first=ui.views.explorer.analysis.matches[0];
panel.trigger("click",{closest:()=>({dataset:{blPick:String(first.index),blView:"explorer"}})});
assert.equal(handoff.category,"ALL");
assert.equal(handoff.liquid,catalog[first.index]);
assert.equal(element("atom").value,"gtr");
assert.equal(handoff.chooseAtom,1);
explorer.value="diplomat";explorer.trigger("change");
assert.equal(ui.views.explorer.analysis.bell.id,"freehand","Selection must persist without localStorage.");
panel.trigger("input",{dataset:{blSearch:"explorer"},value:""});
ui.filter("explorer","NET complex");
assert.ok(panel.querySelector('[data-bl-summary="explorer"]').textContent.includes("din 170"));
panel.trigger("click",{closest:()=>({dataset:{blMore:"explorer"}})});
assert.ok(panel.querySelector('[data-bl-summary="explorer"]').textContent.includes("36 din 170"));
element("atom").value="diplomat";element("atom").trigger("change");
assert.equal(ui.views.main.analysis.bell.id,"freehand","Both views must use the same physical bell choice.");
console.log("RTA bell fit PASS: "+profiles+" atomizer/chamber configurations, 620 liquids each; UI select/search/filter/blocked-storage tests.");
