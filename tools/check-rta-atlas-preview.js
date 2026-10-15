/* RTA Sensory Atlas isolated HOME + LIQUID MATCH prototype regression.
 * Reuses source catalog (620), physical models (16), Mood Match 7x5,
 * without altering the existing V10 live app or inventing public reviews.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root="rta-lab",preview=path.join(root,"atlas-preview");
const env={window:{}};
vm.createContext(env);
function load(p){vm.runInContext(fs.readFileSync(path.join(root,p),"utf8"),env,{filename:p});}
for(const name of ["atoms-1.js","atoms-2.js","atoms-3.js","wires.js","core.js"])load("data/"+name);
fs.readdirSync(path.join(root,"data")).filter(f=>/^liquids-.*\.js$/.test(f)).sort().forEach(f=>load("data/"+f));
load("data/bell-liquid-fit.js");
load("data/sensory-core.js");
load("mood-match.js");
load("atlas-preview/photo-sources.js");
load("atlas-preview/context.js");
load("atlas-preview/app.js");
const lib=env.window,api=lib.RTA_ATLAS_PREVIEW,moods=lib.RTA_MOOD_MATCH.moods,moments=lib.RTA_MOOD_MATCH.moments;
assert.ok(api&&typeof api.compose==="function","Standalone prototype API missing");
assert.equal(api.getSourceModel().atoms,16);
assert.equal(api.getSourceModel().liquids,620);
assert.equal(moods.length,7);
assert.equal(moments.length,5);
assert.equal(api.version,"0.2-real-photo-motion");
const catalog=lib.RTA_LIQUIDS;
const samples=["Tutun simplu","Tutun complex","NET simplu","NET complex"].map(category=>{
 const i=catalog.findIndex(x=>x.class===category);
 assert.ok(i>=0,"No example for category "+category);
 return i;
});
const distinct=new Set();
let scenarios=0;
for(const i of samples){
 for(const mood of moods){
  for(const moment of moments){
   const result=api.compose(i,mood.id,moment.id);
   assert.ok(result,"Cannot compose "+catalog[i].name+" "+mood.id+"/"+moment.id);
   assert.equal(result.liquid.name,catalog[i].name,"Must preserve exactly selected liquid");
   assert.equal(result.liquid.brand,catalog[i].brand);
   assert.equal(result.items.length,3,"Must display exactly three context-ranked platforms");
   assert.equal(result.distinctAtoms,3);
   assert.equal(result.distinctBuilds,9,"Each of three platforms needs three build variants");
   assert.equal(new Set(result.items.map(x=>x.id)).size,3);
   assert.ok(result.items.every(x=>x.atom&&x.builds.length===3));
   assert.ok(result.items.every(x=>x.position>=1&&x.position<=3));
   for(const atom of result.items){
    distinct.add(atom.id);
    assert.ok(lib.RTA_CORE.atoms.some(a=>a.id===atom.id));
    const same=new Set();
    for(const build of atom.builds){
     const c=build.config;
     assert.equal(c.atom,atom.id);
     assert.ok(lib.RTA_SENSORY_CORE.permitted(c.atom,c.wire,c.wraps),c.atom+" "+c.wire);
     assert.ok(lib.RTA_SENSORY_CORE.platforms[c.atom].air.some(a=>a.id===c.air));
     assert.ok(["WATT","TC"].includes(lib.RTA_SENSORY_CORE.wires[c.wire].mode));
     assert.ok(build.dimensions.pleasure===null,"No fabricated numeric pleasure");
     assert.ok(build.signals&&Number.isFinite(build.signals.spectrum));
     assert.ok(!("probability" in build),"No invented experience probability");
     assert.ok(!/(?:TH|palat|spectru|ofensivă|plăcere|simultaneitate)\s*[+-]\s*\d+(?:[.,]\d+)?\s*%/i.test(api.vapeDescription(build,catalog[i])),
      "No artificial sensory improvement percentages; product names can legitimately contain %");
     assert.ok(api.renderCoil(c).includes('role="img"'),"Build diagrams must be accessible");
     same.add(c.wire+"-"+c.wraps);
    }
    assert.equal(same.size,3,"Do not repeat identical builds");
   }
   for(let k=1;k<result.items.length;k++)
     assert.ok(result.items[k-1].score>=result.items[k].score,"Context ranking must be ordered, no random third");
   scenarios++;
  }
 }
}
assert.equal(scenarios,140,"All four categories × 7 moods × 5 moments must work");
assert.ok(distinct.size>=5,"Contextual recommendations should not select only the same atomizers");
assert.ok(api.liquidSearch("balkan").length>0,"Real catalog search must find Balkan");
assert.ok(api.liquidSearch("some-nonexistent-liquid-734927").length===0);
const a=api.compose(samples[0],"magic","evening");
const b=api.compose(samples[0],"power","coffee");
assert.ok(a&&b);
assert.ok(!["a", "b"].some(x=>api.liquidSearch(x).length>0),"Search must not dump catalog for 1-char input");
// Dvarw FL named Balkan evidence is not ported to another liquid.
const other={class:"NET complex",brand:"Demo",name:"Not Balkan Milestone"};
const source=lib.RTA_SENSORY_CORE.analyze({atom:"dvarwfl",wire:"k128",wraps:6,air:"triple06"},other);
if(source.partialEvidence.length){
 const match=api.evidenceFor(source,other);
 assert.notEqual(match.kind,"partial","Do not claim Balkan Milestone test on another liquid");
}
// A personal KLP TC report with an unspecified liquid must not be dressed
// up as a controlled A/B on any arbitrary selected catalog product.
const unknownLiquidReport=lib.RTA_SENSORY_CORE.analyze({
 atom:"klp",wire:"nife30",wraps:6,coilMm:2.5,temp:220,power:16
},catalog[samples[3]]);
assert.ok(unknownLiquidReport.partialEvidence.length>0,"KLP has a real partial personal report");
const neutralEvidence=api.evidenceFor(unknownLiquidReport,catalog[samples[3]]);
assert.equal(neutralEvidence.kind,"partial-context");
assert.ok(neutralEvidence.label.includes("lichid neprecizat"));
const secondLiquid=catalog[samples[2]];
const altEvidence=api.evidenceFor(unknownLiquidReport,secondLiquid);
assert.equal(altEvidence.kind,"partial-context");
assert.ok(!altEvidence.label.includes("pe acest lichid"));

const html=fs.readFileSync(path.join(preview,"index.html"),"utf8");
const css=fs.readFileSync(path.join(preview,"styles.css"),"utf8");
const js=fs.readFileSync(path.join(preview,"app.js"),"utf8");
assert.ok(html.includes("id=\"pageHome\"")&&html.includes("id=\"pageLiquid\""),"Two routed screens missing");
assert.ok(html.includes("id=\"liquidSearch\"")&&html.includes("id=\"resultCards\""));
assert.ok(html.includes("id=\"moodChips\"")&&html.includes("id=\"momentChips\""));
assert.ok(!html.includes('href="../?view=v10"'),"Atlas must not expose the old interface in its navigation");
assert.ok(html.includes("./market-evidence.js")&&html.includes("./market.js"),"Market adapter and provenance records must be connected");
assert.ok(html.includes("id=\"cinemaReel\"")&&html.includes("photo-cinema"),"Real-photo stage missing");
assert.ok(html.includes("PREVIEW V0.2")&&!html.includes("PREVIEW V0.1"),"Preview footer must match actual version");
assert.ok(js.includes('!window.matchMedia?.("(max-width:760px)").matches'),
 "Mobile best-build panels must start collapsed");
for(const str of ["@keyframes flowPaths","@keyframes drawWave","@keyframes cardReveal","prefers-reduced-motion:reduce"]){
 assert.ok(css.includes(str),"Motion or reduced-motion rule missing: "+str);
}
assert.ok(css.includes(".bottom-tabs")&&css.includes("max-width:440px"),"Mobile adaptation missing");
assert.ok(js.includes("Semnalul extern")&&js.includes("Nu inventăm"),"No fabricated market review guard");
const media=lib.RTA_ATLAS_PHOTOS;
assert.ok(media&&Object.keys(media).length>=15,"Need real source photos for most platforms");
for(const [id,p] of Object.entries(media)){
 assert.ok(/^https:\/\//.test(p.src)||p.src.startsWith("../../assets/instagram/"),"Photo must be HTTPS or a verified existing project image: "+id);
 if(p.src.startsWith("../../"))assert.ok(fs.existsSync(path.resolve(preview,p.src)),"Missing locally hosted real photo: "+id);
 if(p.fallbackSrc){
  assert.ok(p.fallbackSrc.startsWith("../../assets/instagram/")||p.fallbackSrc.startsWith("./media/"),"Fallback must use traceable project media: "+id);
  assert.ok(fs.existsSync(path.resolve(preview,p.fallbackSrc)),"Missing decoded-photo fallback candidate: "+id);
  if(p.fallbackSrc.startsWith("./media/"))assert.ok(p.fallbackCredit&&p.fallbackRef,"Local vendor photo must retain actual attribution: "+id);
 }
 assert.ok(/^https:\/\//.test(p.ref),"Photo must have original attribution URL: "+id);
 assert.ok(p.credit,"Source credit required: "+id);
}
const v02=fs.readFileSync(path.join(preview,"v02.js"),"utf8");
const v02css=fs.readFileSync(path.join(preview,"v02.css"),"utf8");
assert.ok(v02.includes("cinemaReel")&&v02.includes("setInterval"),"Visible photo carousel missing");
assert.ok(v02.includes("animateLiquid")&&v02.includes("airSvg"),"Liquid and airflow reactive animation missing");
assert.ok(v02.includes("installResultPhotoFallback")&&v02.includes("photoFallback"),"Broken remote photos need local recovery");
for(const id of ["kx","gtone","415"])assert.ok(media[id]?.fallbackSrc,"Gallery model needs local photo fallback: "+id);
assert.ok(v02css.includes(".cinema-frame img{object-fit:contain"),"Photographic hero cannot crop product");
for(const key of ["cinemaKen","cinemaSwitch","airflowVisible","@media(max-width:390px)","prefers-reduced-motion:reduce"]){
 assert.ok(v02css.includes(key),"V0.2 motion or mobile breakpoint missing: "+key);
}
assert.ok(js.includes("result.items[0]")||js.includes("result.items.map"));
assert.ok(html.includes('id="sceneMatch"')&&html.includes('id="sceneMatchAtom"')&&html.includes("data-go-best"),"Contextual BEST preview missing");
assert.ok(html.includes('role="combobox"')&&html.includes('aria-autocomplete="list"'),"Liquid search needs combobox semantics");
assert.ok(js.includes("updateSceneMatch(result)")&&js.includes("scrollToBest()"),"Quick-path must derive from the real contextual engine");
assert.ok(js.includes('ev.key==="ArrowDown"')&&js.includes('aria-activedescendant'),"Keyboard search contract missing");
assert.ok(v02css.includes('::-webkit-search-cancel-button'),"Avoid native and custom duplicate clear icons");
assert.ok(v02.includes('results.insertAdjacentElement("afterend",box)'),"Results must precede the airflow explainer");

const refs=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
assert.equal(refs.length,37,"Expected canonical scripts, photography, Atlas adapters, Duel and responsive fitting");
assert.ok(html.includes('./layout.css?')&&refs.some(ref=>ref.startsWith('./layout.js?')),'Responsive text fitting must ship with the application');
for(const ref of refs){
 assert.ok(ref.startsWith("../")||ref.startsWith("./"),"No unknown remote JS");
 const local=path.resolve(preview,ref.split("?")[0]);
 assert.ok(fs.existsSync(local),"Preview asset missing: "+ref);
}
assert.ok(refs.findIndex(x=>x.includes("bell-liquid-fit.js"))<refs.findIndex(x=>x.includes("sensory-core.js")));
assert.ok(refs.findIndex(x=>x.includes("sensory-core.js"))<refs.findIndex(x=>x.includes("mood-match.js")));
assert.ok(refs.findIndex(x=>x.includes("mood-match.js"))<refs.findIndex(x=>x.includes("./app.js")));
assert.ok(refs.findIndex(x=>x.includes("photo-sources.js"))<refs.findIndex(x=>x.includes("./app.js")));
assert.ok(refs.findIndex(x=>x.includes("./app.js"))<refs.findIndex(x=>x.includes("./v02.js")));
console.log("RTA ATLAS PREVIEW PASS: 16 platforms, 620 actual liquids, 4×7×5="+scenarios+
 " contexts, nine compatible builds each; visual motion, source honesty and no production modifications.");
