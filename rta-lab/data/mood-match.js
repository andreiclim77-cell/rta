/* RTA Mood Match · experiential roles, not a universal ranking.
 * All 16 owned platforms remain eligible. Personal roles are qualitative
 * hypotheses; real wire / liquid recommendations are delegated to Sensory DNA.
 */
(function () {
"use strict";
const core=window.RTA_SENSORY_CORE;
if(!core)return;

const moods=[
 {id:"power",icon:"🔥",name:"POWER",headline:"Vreau forță",description:"Impact, ofensivă și throat hit.",objective:"th",classes:["NET simplu","NET complex"]},
 {id:"pleasure",icon:"❤️",name:"PURE PLEASURE",headline:"Vreau aromă pe palat",description:"Bogăție aromatică, corp și plăcere.",objective:"complete",classes:["Tutun complex","NET complex"]},
 {id:"magic",icon:"✨",name:"MAGIC & COMPLEXITY",headline:"Vreau magie și nuanțe",description:"Straturi, finețe și armonie.",objective:"layers",classes:["NET complex","Tutun complex"]},
 {id:"oldschool",icon:"🕰️",name:"OLD SCHOOL",headline:"Vreau tutun clasic",description:"Caracter direct, autentic, fără artificii.",objective:"tobacco",classes:["Tutun simplu","NET simplu"]},
 {id:"chill",icon:"🌿",name:"CHILL & RELAX",headline:"Vreau să mă relaxez",description:"Experiență blândă, rotundă, liniștită.",objective:"smooth",classes:["Tutun simplu","Tutun complex"]},
 {id:"allday",icon:"♾️",name:"ALL DAY",headline:"Vreau echilibru",description:"Consistență, armonie și versatilitate.",objective:"complete",classes:["Tutun simplu","NET simplu"]},
 {id:"surprise",icon:"🎲",name:"SURPRISE ME",headline:"Vreau să redescopăr",description:"Un alt atomizor sau un lichid neîncercat.",objective:"complete",classes:["Tutun simplu","Tutun complex","NET simplu","NET complex"]}
];
const moments=[
 {id:"coffee",icon:"☕",name:"La cafea",note:"Un moment cu personalitate."},
 {id:"day",icon:"☀️",name:"În timpul zilei",note:"Un echilibru potrivit ritmului zilei."},
 {id:"drink",icon:"🥤",name:"Cu o băutură",note:"Experimentează contrastul aromatic."},
 {id:"evening",icon:"🌙",name:"Seara",note:"Mai mult timp pentru nuanțe."},
 {id:"relax",icon:"🛋️",name:"În relaxare",note:"O experiență fără grabă."},
 {id:"any",icon:"◉",name:"Oricând",note:"Fără preferință pentru moment."}
];

/* The first role is the strongest association from the owner's descriptions;
   others represent plausible uses. They do NOT exclude an atomizer from a mood. */
const roles={
 "415":["pleasure","magic","allday"],
 "kprime":["oldschool","chill","pleasure"],
 "gtone":["allday","power","oldschool"],
 "dvarwcl":["power","oldschool","pleasure"],
 "muted":["power","pleasure","magic"],
 "gtr":["magic","chill","pleasure"],
 "dvarwfl":["magic","oldschool","chill"],
 "diplomat":["magic","allday","oldschool"],
 "kx":["chill","pleasure","allday"],
 "klp":["pleasure","oldschool","power"],
 "asylum":["oldschool","power","allday"],
 "pmfree":["oldschool","magic","power"],
 "pmstd":["pleasure","allday","oldschool"],
 "byka":["chill","oldschool","allday"],
 "kv3":["power","oldschool","allday"],
 "minister":["allday","power","pleasure"]
};
const momentNudges={
 coffee:["dvarwcl","klp","kprime","byka","kv3"],
 day:["gtone","minister","klp","asylum","byka"],
 drink:["415","pmfree","muted","diplomat","pmstd"],
 evening:["gtr","kx","pmstd","diplomat","415"],
 relax:["gtr","kx","byka","kprime","dvarwfl"],
 any:[]
};
const byMood=new Map(moods.map(x=>[x.id,x]));
const byMoment=new Map(moments.map(x=>[x.id,x]));
function getAtoms(){return window.RTA_CORE&&Array.isArray(window.RTA_CORE.atoms)?window.RTA_CORE.atoms:[];}
function getMood(id){return byMood.get(id)||null;}
function getMoment(id){return byMoment.get(id)||null;}
function labels(id){return (roles[id]||[]).map(key=>byMood.get(key)).filter(Boolean);}
function traitScore(id, moodId){
 const t=core.platforms[id]&&core.platforms[id].traits;
 if(!t)return 0;
 if(moodId==="power")return .25*t.offense+.21*t.th;
 if(moodId==="pleasure")return .20*t.palate+.14*t.simultaneity+.1*t.harmony;
 if(moodId==="magic")return .16*t.spectrum+.18*t.simultaneity+.12*t.harmony;
 if(moodId==="oldschool")return .20*t.focus+.18*t.th;
 if(moodId==="chill")return .23*t.harmony+.13*t.palate-.06*t.offense;
 return .18*t.harmony+.15*t.simultaneity+.11*t.palate;
}
function rank(moodId,momentId="any",cycle=0){
 if(!getMood(moodId)||!getMoment(momentId))return [];
 const atoms=getAtoms();
 if(moodId==="surprise"){
   // Rotate deterministically through the entire collection, three at a time.
   const order=[...atoms].sort((a,b)=>String(a.id).localeCompare(String(b.id)));
   const start=((Math.max(0,Math.floor(Number(cycle)||0))*3)%Math.max(1,order.length));
   return order.slice(start).concat(order.slice(0,start)).map((atom,i)=>({atom,rank:i+1,roles:labels(atom.id),score:null}));
 }
 const sorted=atoms.map((atom,index)=>{
   const assigned=roles[atom.id]||[];
   const primary=assigned[0]===moodId?3.2:assigned[1]===moodId?1.75:assigned[2]===moodId?1.1:0;
   const nudges=momentNudges[momentId]||[];
   const context=nudges.includes(atom.id)?(.31 - nudges.indexOf(atom.id)*.025):0;
   return {atom,roles:labels(atom.id),score:primary+traitScore(atom.id,moodId)+context,index};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);
 return sorted.map((row,i)=>({...row,rank:i+1}));
}
function recommend(moodId,momentId="any",cycle=0){
 const list=rank(moodId,momentId,cycle);
 if(list.length<3)return list;
 if(moodId==="surprise")return list.slice(0,3);
 // Always offer the best fit, a second interpretation, and a less obvious choice.
 const start=4+(Math.max(0,Math.floor(Number(cycle)||0))%Math.max(1,list.length-4));
 const third=list[start]||list[2];
 const picks=[list[0],list[1],third];
 if(new Set(picks.map(x=>x.atom.id)).size!==3)return list.slice(0,3);
 return picks;
}
function coverage(){
 const atoms=getAtoms();
 return {total:atoms.length,withRoles:atoms.filter(a=>roles[a.id]&&roles[a.id].length).length,
  missing:atoms.filter(a=>!roles[a.id]||!roles[a.id].length).map(a=>a.id)};
}
window.RTA_MOOD_MATCH=Object.freeze({
 version:"2026-10-13-v1",moods,moments,roles,getMood,getMoment,labels,rank,recommend,coverage
});
})();