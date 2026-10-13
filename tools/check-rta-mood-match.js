/* RTA Mood Match regression: approved moods, 16 platforms, 620 liquids,
 * accessible mobile flow, complete configuration hand-off and cache wiring. */
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ROOT = "rta-lab";
const read = filename => fs.readFileSync(path.join(ROOT,filename),"utf8");
const env = {window:{}};
vm.createContext(env);
function load(name,target=env) {
  vm.runInContext(read(name),target,{filename:name,timeout:10000});
}
["data/atoms-1.js","data/atoms-2.js","data/atoms-3.js","data/wires.js",
 "data/core.js"].forEach(name=>load(name));
fs.readdirSync(path.join(ROOT,"data")).filter(name=>/^liquids-.*\.js$/.test(name))
  .sort().forEach(name=>load("data/"+name));
["data/bell-liquid-fit.js","data/sensory-core.js"].forEach(name=>load(name));

const {RTA_CORE:collection,RTA_LIQUIDS:liquids,RTA_SENSORY_CORE:core,
 RTA_BELL_LIQUID_FIT:fit}=env.window;
assert.equal(collection.atoms.length,16,"All owned platforms must be available");
assert.equal(liquids.length,620,"All liquids must be available");
const moodIds=["power","pleasure","magic","oldschool","chill","allday","surprise"];
const momentIds=["coffee","day","juice","evening","relax"];
class FakeNode {
  constructor(id) {this.id=id;this.innerHTML="";this.value="";this.textContent="";
   this.hidden=false;this.dataset={};this.events={};this.scrolled=false;
   this.classList={add(){},remove(){},toggle(){}};this.options=[];}
  addEventListener(type,handler){(this.events[type]??=[]).push(handler);}
  emit(type,target=this){for(const cb of this.events[type]||[])cb({target});}
  querySelectorAll(){return [];}
  setAttribute(){}
  contains(){return true;}
  scrollIntoView(){this.scrolled=true;}
  dispatchEvent(){return true;}
}
function fakeDocument(){
  const nodes={};
  const get=id=>nodes[id]??(nodes[id]=new FakeNode(id));
  const events={};
  return {nodes,get,document:{getElementById:get,querySelectorAll:()=>[],
   addEventListener(type,handler){(events[type]??=[]).push(handler);}},
   ready(){for(const fn of events.DOMContentLoaded||[])fn();}};
}
const ui=fakeDocument();
let opened=null;
const browser={window:{RTA_CORE:collection,RTA_LIQUIDS:liquids,
 RTA_SENSORY_CORE:core,RTA_BELL_LIQUID_FIT:fit,
 RTA_SENSORY_UI:{applyConfiguration(index,atom,config){
  opened={index,atom,config};return true;
 }},
 localStorage:{getItem(){return null;},setItem(){}}},
 document:ui.document,
 Event:class{constructor(type,options={}){this.type=type;this.bubbles=options.bubbles;}}};
vm.createContext(browser);
load("mood-match.js",browser);
const api=browser.window.RTA_MOOD_MATCH;
assert.deepEqual(Array.from(api.moods,x=>x.id),moodIds);
assert.deepEqual(Array.from(api.moments,x=>x.id),momentIds);
assert.equal(api.moments.find(m=>m.id==="juice").name,"La un suc");

const encountered=new Set();
for(const mood of moodIds)for(const moment of momentIds){
  const answer=api.recommend(mood,moment);
  assert.ok(answer,mood+"/"+moment);
  assert.equal(answer.ranked.length,16,mood+"/"+moment);
  assert.equal(answer.picks.length,3,mood+"/"+moment);
  assert.equal(new Set(answer.picks.map(p=>p.id)).size,3,mood+"/"+moment);
  for(const p of answer.picks){
    encountered.add(p.id);
    assert.ok(core.platforms[p.id],p.id);
    assert.ok(core.permitted(p.id,p.best.config.wire,p.best.config.wraps),p.id);
    assert.ok(p.best.config.bell && p.best.config.air,p.id);
  }
}
assert.equal(encountered.size,16,"Discovery must rotate through all 16 platforms across 35 contexts");

ui.ready();
assert.ok(ui.get("moodMatch").innerHTML.includes("mmMoods"),"Mood Match UI mounted");
assert.ok(ui.get("mmMoods").innerHTML.includes("MAGIC &amp; COMPLEXITY"));
function click(dataset){
  const button={dataset};
  ui.get("moodMatch").emit("click",{closest:()=>button});
}
click({mmMood:"power"});
assert.equal(ui.get("mmStageMoment").hidden,false);
click({mmMoment:"coffee"});
assert.equal(ui.get("mmStageLiquid").hidden,false);
assert.equal(ui.get("mmResults").innerHTML.match(/class="mm-result"/g).length,3);
for(const atom of collection.atoms)assert.ok(ui.get("mmCollectionGrid").innerHTML.includes(atom.short),atom.id);
click({mmUse:"0"});
assert.ok(opened && liquids[opened.index] && core.platforms[opened.atom]);
assert.ok(core.permitted(opened.atom,opened.config.wire,opened.config.wraps));
assert.equal(ui.get("labLiquidView").scrolled,true);

click({mmSource:"manual"});
assert.ok(ui.get("mmResults").innerHTML.includes("Selectează un lichid"));
const search=ui.get("mmSearch");
search.value="latakia";
search.emit("input");
assert.ok(ui.get("mmSuggestions").innerHTML.includes('data-mm-liquid="'));
const idx=liquids.findIndex(l=>[l.brand,l.name,l.class,l.profile,(l.tags||[]).join(" ")]
  .join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().includes("latakia"));
assert.ok(idx>=0);
click({mmLiquid:String(idx)});
assert.ok(ui.get("mmSelectedLiquid").textContent.includes(liquids[idx].name));
assert.equal(ui.get("mmResults").innerHTML.match(/class="mm-result"/g).length,3);
click({mmUse:"1"});
assert.equal(opened.index,idx,"Manual liquid must be sent unchanged to cockpit");

const html=read("index.html"),sw=read("sw.js"),css=read("mood-match.css");
const js=read("mood-match.js"),sensory=read("sensory-ui.js");
for(const asset of ["mood-match.js?v=11-mood-20261013","mood-match.css?v=11-mood-20261013"])
  assert.ok(html.includes(asset) && sw.includes(asset),"Asset not wired into HTML and PWA: "+asset);
assert.ok(html.indexOf("sensory-ui.js?v=")<html.indexOf("mood-match.js?v="),"Script order broken");
assert.ok(html.includes('id="moodMatch"'),"Mood Match mount missing");
assert.ok(css.includes(".mm-moods{grid-template-columns:repeat(2,minmax(0,1fr))}"));
assert.ok(css.includes(".mm-result-grid{grid-template-columns:repeat(3,minmax(0,1fr))}"));
assert.ok(css.includes("@media (max-width:599px)"));
assert.ok(js.includes("applyConfiguration("),"Full configuration handoff missing");
assert.ok(sensory.includes("function applyConfiguration("),"Cockpit handoff missing");

// Exercise the actual hand-off, not just the mock Mood Match dispatcher.
const real=fakeDocument();
const live={window:{RTA_CORE:collection,RTA_LIQUIDS:liquids,
 RTA_SENSORY_CORE:core,RTA_BELL_LIQUID_FIT:fit,
 localStorage:{getItem(){return null;},setItem(){}}},
 document:real.document,Event:browser.Event,
 state:{objective:"complete",liquid:null},
 setCategory(){},
 activateLiquid(liquid){live.state.liquid=liquid;},
 chooseAtom(){}};
vm.createContext(live);
load("sensory-ui.js",live);
real.ready();
const desired=core.rankBuilds("gtr",liquids[0],"layers")[0].config;
assert.ok(live.window.RTA_SENSORY_UI.applyConfiguration(0,"gtr",desired));
const actual=live.window.RTA_SENSORY_UI.configFor("gtr","main");
for(const key of ["atom","bell","air","wire","wraps","coilMm","power","temp","position"])
 assert.equal(actual[key],desired[key],"Full build hand-off changed "+key);
assert.equal(real.get("atom").value,"gtr");
assert.equal(real.get("labLiquidView").hidden,false);
assert.equal(live.window.RTA_SENSORY_UI.applyConfiguration(-1,"gtr",desired),false);
assert.equal(live.window.RTA_SENSORY_UI.applyConfiguration(0,"unknown",desired),false);
console.log("RTA MOOD MATCH PASS: 7 moods × 5 moments, 16 platforms, 620 liquids, mobile UI, complete build hand-off and cache.");
