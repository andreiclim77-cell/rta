/* 415 Cool: regression across final V10 overlay ordering and modern Sensory DNA.
 * Do not use guessed taste, TC temperatures, or new data catalog entries.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm");
const input={id:"atomExplorer",value:"415",innerHTML:""};
const target={id:"atomExplorerResult",innerHTML:""};
const document={
  getElementById:id=>id==="atomExplorer"?input:id==="atomExplorerResult"?target:{value:"",innerHTML:""},
  querySelector:()=>null,querySelectorAll:()=>[],
  addEventListener:()=>{}
};
const env={window:{},document};
vm.createContext(env);
for(const file of [
 "data/atoms-1.js","data/atoms-2.js","data/atoms-3.js",
 "data/wires.js","data/core.js",
 "engine.js","data/tuning-415.js","data/personal-5wrap.js",
 "data/tc-platform-map.js","data/tc-sixwrap-global.js",
 "data/clapton-platform-map.js"
]){
 vm.runInContext(fs.readFileSync("rta-lab/"+file,"utf8"),env,{filename:file});
}
const result=vm.runInContext(`(()=>{
 const atom=ATOMS.find(a=>a.id==="415"),liquid={class:"Tutun simplu",brand:"QA",name:"Profil neutru",tags:[]};
 return {
  k128:buildOutput(atom,WIRES.find(w=>w.id==="k128"),liquid),
  nife:buildOutput(atom,WIRES.find(w=>w.id==="nife30"),liquid),
  kclap:buildOutput(atom,WIRES.find(w=>w.id==="k1clap"),liquid),
  kx:buildOutput(ATOMS.find(a=>a.id==="kx"),WIRES.find(w=>w.id==="nife30"),liquid),
  gtr:buildOutput(ATOMS.find(a=>a.id==="gtr"),WIRES.find(w=>w.id==="nife30"),liquid),
  rule:buildRule(atom,WIRES.find(w=>w.id==="nife30"))
 };
})()`,env);
assert.equal(result.k128.wraps,"6","V10 K1 28/6 should not be replaced by the previous 28/5 override");
assert.equal(result.nife.wraps,"7","V10 415 NiFe30/7 must survive last overlay");
assert.equal(result.rule.wraps,7);
assert.equal(result.kclap.wraps,"5","Legacy preferred Clapton pairing remains available");
assert.equal(result.kx.wraps,"6","Seven wraps cannot leak to Kayfun X");
assert.equal(result.gtr.wraps,"7","Existing GTR NiFe30/7 remains unchanged");
assert.ok(/NiFe52/.test(result.nife.note)&&/\/6/.test(result.nife.note));
assert.equal(env.window.RTA_LAB_TC_PLATFORM_MAP.map["415"].zivipfAlternative.wraps,6);
assert.equal(env.window.RTA_LAB_TC_SIX_WRAP.overrides["415"].k128Wraps,6);
vm.runInContext("renderAtomExplorer()",env);
const html=target.innerHTML;
const cards=html.split('class="explorer-builds explorer-builds-five">')[1]||"";
const order=[...cards.matchAll(/class="wname">([^<]+)/g)].map(m=>m[1]);
assert.equal(order.length,5,"Legacy V10 still uses five wire-family slots");
assert.ok(/NiFe TC/.test(order[0]),"Final Clapton overlay must not push old K1 Clapton ahead of NiFe");
assert.ok(/K1 28 GA/.test(order[1]),"415 K1 28/6 must follow NiFe TC");
assert.ok(/K1 Clapton/.test(order[2]),"Specialist Clapton remains in 415 Explorer");
assert.ok(/NiFe30\/7/.test(html)&&/NiFe52\/6/.test(html));
assert.ok(/K1 28 GA/.test(html)&&/6 spire/.test(html));
console.log("415 COOL PASS: final V10 overlays keep NiFe30/7 = NiFe52/6 first, K1 28/6 next, and all unrelated families intact.");
