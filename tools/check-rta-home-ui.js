/* RTA Lab redesigned landing test: four tool routes, main/explorer handoff, technical appendix.
 * No browser dependency: test readable code and actual DOM interaction contract in a VM.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const html=fs.readFileSync("rta-lab/index.html","utf8");
const css=fs.readFileSync("rta-lab/home-ui.css","utf8");
const js=fs.readFileSync("rta-lab/home-ui.js","utf8");
const worker=fs.readFileSync("rta-lab/sw.js","utf8");
const master=fs.readFileSync("rta-lab/RTA_CONTINUITY_MASTER.md","utf8");

const markers=['id="rtaHome"','id="labTools"','id="moodMatch"',
 'id="labExplorerView"','id="labLiquidView"','id="wireReference"'];
const positions=markers.map(m=>html.indexOf(m));
assert.ok(positions.every(p=>p>=0),"A home or legacy module disappeared");
assert.ok(positions.every((p,i)=>i===0||p>positions[i-1]),"Homepage layout order changed");
assert.equal((html.match(/<details class="wire-guide">/g)||[]).length,1,
 "Technical wire guide should survive exactly once");
assert.equal((html.match(/class="rt-tool-card(?: rt-tool-card-featured)?"/g)||[]).length,4,
 "Expected four real tool links");
for(const action of ["setup","mood","liquid","reference","master"])
 assert.ok(html.includes('data-rt-action="'+action+'"'),"Missing tool route: "+action);
for(const file of ["home-ui.css","home-ui.js"]){
 const asset="./"+file+"?v=10-home-20261013";
 assert.ok(html.includes(asset),"HTML must load "+asset);
 assert.ok(worker.includes(asset),"Service worker must precache "+asset);
}
assert.ok(worker.includes("three-zone-home"),"Cache must update with home assets");
assert.ok(css.includes("@media(max-width:620px)"));
assert.ok(css.includes(".rt-tool-grid{grid-template-columns:minmax(0,1fr)"));
assert.ok(css.includes(".rt-hero-layout{grid-template-columns:minmax(0,1fr)"));
assert.ok(css.includes(":focus-visible"));
assert.ok(master.includes("## 17. HOME COMMAND CENTER"),"MASTER change not recorded");
for(const token of ["PERSONAL RTA ENGINE · V10","620 TOBACCO / NET",
 "K1 Clapton 2×30+38","SS316L Clapton 2×30+38",
 "id=\"sensoryExplorer\"","id=\"sensoryMain\""])
 assert.ok(html.includes(token),"Legacy component lost: "+token);
const allIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(allIds).size,allIds.length,"Duplicate HTML ids in index");

const fake=Object.fromEntries(["labExplorerView","labLiquidView","moodMatch","wireReference",
 "rtaContinuityPanel","mode-main","mode-explorer"].map(id=>[id,{
 id,hidden:id==="labLiquidView",scrolls:[],scrollIntoView(o){this.scrolls.push(o);},
 querySelector(){return id==="wireReference"?this.details:null;},details:{open:false},
 click(){this.clicked=(this.clicked||0)+1}
}]));
const events={};
const switched=[];
const windowObj={
 RTA_SENSORY_UI:{switchMode(mode){
   switched.push(mode);fake.labExplorerView.hidden=mode!=="explorer";
   fake.labLiquidView.hidden=mode!=="main";
 }},
 history:{replaceState(_x,_y,route){this.last=route;}},
 matchMedia:()=>({matches:false})
};
const documentObj={
 getElementById:id=>fake[id]||null,
 addEventListener(type,fn){events[type]=fn;}
};
const ctx={window:windowObj,document:documentObj};
vm.createContext(ctx);vm.runInContext(js,ctx,{filename:"home-ui.js"});
assert.equal(typeof windowObj.RTA_HOME_UI.navigate,"function");
function click(action){
 let prevented=false;
 const link={getAttribute:name=>name==="data-rt-action"?action:null};
 events.click({target:{closest:selector=>selector==="a[data-rt-action]"?link:null},
  preventDefault(){prevented=true;}});
 return prevented;
}
assert.ok(click("liquid"));assert.equal(switched.at(-1),"main");
assert.equal(fake.labLiquidView.hidden,false);assert.ok(fake.labLiquidView.scrolls.length);
assert.equal(windowObj.history.last,"#labLiquidView");
assert.ok(click("setup"));assert.equal(switched.at(-1),"explorer");
assert.equal(fake.labExplorerView.hidden,false);
assert.equal(windowObj.history.last,"#labExplorerView");
assert.ok(click("mood"));assert.equal(fake.moodMatch.scrolls.length,1);
assert.ok(click("reference"));assert.ok(fake.wireReference.details.open);
assert.equal(windowObj.history.last,"#wireReference");
assert.ok(click("master"));assert.equal(fake.rtaContinuityPanel.scrolls.length,1);
assert.equal(windowObj.RTA_HOME_UI.navigate("unknown"),false);
windowObj.matchMedia=()=>({matches:true});
assert.ok(windowObj.RTA_HOME_UI.navigate("mood"));
assert.equal(fake.moodMatch.scrolls.at(-1).behavior,"auto");
console.log("RTA HOME PASS: 4 responsive tool cards, full five-route navigation, mode handoff, reference expansion, preserved legacy modules, PWA cache.");
