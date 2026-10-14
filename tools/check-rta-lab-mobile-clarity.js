/* Regression: ranking clarity, mobile layout, and PWA cache busting.
 * Complements exhaustive tools/check-rta-sensory-core.js functional checks.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const read=path=>fs.readFileSync(path,"utf8");
const html=read("rta-lab/index.html");
const engine=read("rta-lab/engine.js");
const sensory=read("rta-lab/sensory-ui.js");
const css=read("rta-lab/sensory-ui.css");
const sw=read("rta-lab/sw.js");
for(const [f,version] of [["engine.js","10-personal-20261014"],["sensory-ui.js","10-cl-pair-20261014"],["sensory-ui.css","10-cl-pair-20261014"]]){
 const asset="./"+f+"?v="+version;
 assert.ok(html.includes(asset),"HTML must load updated "+f);
 assert.ok(sw.includes(asset),"service worker must precache updated "+f);
}
assert.ok(sw.includes("-mobile-clarity"),"offline cache name must change");
assert.ok(!engine.includes("% fit"),"legacy relative-fit percentage must not be shown as certainty");
assert.ok(engine.includes("Locul ${rankPosition} din ${state.atomRanking.length}"));
assert.ok(engine.includes("Scor platformă ${atom.score.toFixed(1)}/10"));
assert.ok(html.includes("locul #1 înseamnă prima recomandare relativă"));
assert.ok(html.includes("nota /10")||html.includes("Nota /10"));
assert.ok(sensory.includes("TOP 3 configurații pentru obiectiv"));
assert.ok(sensory.includes("Alegerea sârmei de mai sus schimbă semnătura"));
assert.ok(sensory.includes("rankBuilds(config.atom,liquid,objective,"));
assert.ok(css.includes("@media(max-width:520px)"));
assert.ok(css.includes(".sd-controls{grid-template-columns:minmax(0,1fr)}"));
assert.ok(css.includes(".sd-metrics{grid-template-columns:minmax(0,1fr)}"));
assert.ok(css.includes(".row2{grid-template-columns:minmax(0,1fr) auto}"));
assert.ok(css.includes("overflow-wrap:anywhere"));
for(const marker of [".sd-journey", ".sd-stage", ".sd-stage-head", "@media(max-width:690px)"])assert.ok(css.includes(marker),"Three-zone responsive style missing: "+marker);
assert.ok(css.includes(".sd-liquid small{display:block;-webkit-line-clamp:unset;overflow:visible}"));
console.log("RTA MOBILE CLARITY PASS: ranking semantics, independent TOP3 explanation, narrow layout guards, cache refresh");
