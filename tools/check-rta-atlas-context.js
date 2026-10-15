'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const env={window:{}};vm.createContext(env);
const load=p=>vm.runInContext(fs.readFileSync(path.join('rta-lab',p),'utf8'),env,{filename:p});
for(const p of ['atoms-1.js','atoms-2.js','atoms-3.js','wires.js','core.js'])load('data/'+p);
fs.readdirSync('rta-lab/data').filter(p=>/^liquids-.*\.js$/.test(p)).sort().forEach(p=>load('data/'+p));
load('atlas-preview/catalog.js');
for(const p of ['data/bell-liquid-fit.js','data/sensory-core.js','mood-match.js','atlas-preview/context.js','atlas-preview/photo-sources.js','atlas-preview/app.js','atlas-preview/modules.js','atlas-preview/duel.js'])load(p);
const w=env.window,ctx=w.RTA_ATLAS_CONTEXT,api=w.RTA_ATLAS_PREVIEW,core=w.RTA_SENSORY_CORE;
const original=JSON.stringify([w.RTA_LIQUIDS,w.RTA_CORE.atoms,core.observations,core.personalPreferences]);
let comparisons=0;
for(const category of ['NET simplu','NET complex','Tutun simplu','Tutun complex']){
 const index=w.RTA_LIQUIDS.findIndex(l=>l.class===category),liquid=w.RTA_LIQUIDS[index];
 for(const mood of w.RTA_MOOD_MATCH.moods)for(const moment of w.RTA_MOOD_MATCH.moments){
  const source=w.RTA_MOOD_MATCH.recommend(mood.id,moment.id,index).ranked,adapted=ctx.rank(liquid,mood.id,moment.id,mood.goal);
  assert.equal(JSON.stringify(source.map(r=>[r.id,r.score])),JSON.stringify(adapted.map(r=>[r.id,r.score])),'The adapter must reproduce the unchanged Mood Match formula');comparisons++;
 }
}
assert.equal(comparisons,140);
assert.equal(ctx.profile({class:'unknown'}),null);
const free=ctx.profile({name:'Profil propriu',class:'NET complex',tags:['latakia','layers','latakia','fabricated']});
assert.equal(free.brand,'Profil declarat');assert.equal(free.isFreeProfile,true);assert.equal(JSON.stringify(free.tags),JSON.stringify(['latakia','layers']));
assert.equal(ctx.profile({class:'NET simplu',name:'x'.repeat(400)}).name.length,80);
assert.equal(api.setFreeProfile(free),true);assert.equal(api.currentLiquid().name,'Profil propriu');
for(const mood of w.RTA_MOOD_MATCH.moods)for(const moment of w.RTA_MOOD_MATCH.moments)for(const [goal] of ctx.goals){
 const result=api.compose(api.state.liquidIndex,mood.id,moment.id,{liquid:free,objective:goal});
 assert.equal(result.liquid.isFreeProfile,true);assert.equal(result.objective,goal);assert.equal(result.distinctAtoms,3);assert.equal(result.distinctBuilds,9);
 for(const item of result.items)for(const build of item.builds){assert.ok(core.permitted(item.id,build.config.wire,build.config.wraps));assert.equal(api.evidenceFor(build,free).kind,'model');assert.equal(build.dimensions.pleasure,null);}
}
assert.equal(api.setObjective('th'),true);assert.equal(api.effectiveGoal(),'th');assert.equal(w.RTA_ATLAS_MODULES.state.objective,'th');
assert.equal(api.setObjective('fabricated'),false);assert.equal(api.effectiveGoal(),'th');assert.equal(api.setObjective(''),true);assert.equal(api.effectiveGoal(),w.RTA_MOOD_MATCH.moods.find(m=>m.id===api.state.mood).goal);
assert.equal(w.RTA_ATLAS_DUEL.compare(undefined,undefined,free).liquid.isFreeProfile,true);
assert.equal(JSON.stringify([w.RTA_LIQUIDS,w.RTA_CORE.atoms,core.observations,core.personalPreferences]),original,'Free profiles and objectives must not mutate protected source data');
console.log('ATLAS CONTEXT PASS: 140 exact-formula comparisons, 210 free-profile contexts with 3×3 builds, objective sharing, no invented commercial identity or personal A/B, canonical data unchanged.');
