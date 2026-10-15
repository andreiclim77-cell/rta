/* Context adapter: the existing Mood Match formula, with an explicit profile/goal.
   Protected engines and the 620 catalog are never patched or extended. */
(function(){
'use strict';
const core=window.RTA_SENSORY_CORE,mood=window.RTA_MOOD_MATCH;
const moodSignals={power:{offense:.50,th:.40,focus:.10},pleasure:{palate:.48,texture:.28,simultaneity:.24},magic:{spectrum:.32,separation:.29,simultaneity:.20,harmony:.19},oldschool:{focus:.49,th:.19,tobaccoCore:.21,offense:.11},chill:{harmony:.55,simultaneity:.15,softness:.30},allday:{focus:.64,harmony:.10,tobaccoCore:.14,spectrum:.12},surprise:{harmony:.25,spectrum:.25,separation:.25,focus:.25}};
const momentSignals={coffee:{focus:.60,offense:.40},day:{harmony:.65,focus:.35},juice:{spectrum:.55,focus:.45},evening:{palate:.55,simultaneity:.45},relax:{harmony:.70,softness:.30}};
const goals=[['complete','Armonie + palat'],['layers','Stratificare'],['th','Ofensivă + TH'],['tobacco','Tutun în prim-plan'],['body','Corp + densitate'],['smooth','Finețe']];
const tags=['latakia','kentucky','perique','oriental','cigar','nuts','sweet','layers'];
function signalFit(signals,weights){return Object.entries(weights).reduce((sum,[key,weight])=>sum+(key==='softness'?5.5-signals.offense:signals[key])*weight,0);}
function contextScore(result,moodId,momentId){if(!moodSignals[moodId]||!momentSignals[momentId])return null;return Math.round((.24*result.rankScore+.63*signalFit(result.signals,moodSignals[moodId])+.13*signalFit(result.signals,momentSignals[momentId]))*10000)/10000;}
function rank(liquid,moodId,momentId,goal){
 if(!liquid||!moodSignals[moodId]||!momentSignals[momentId]||!goals.some(g=>g[0]===goal))return [];
 return window.RTA_CORE.atoms.map(atom=>{const best=core.rankBuilds(atom.id,liquid,goal)[0];return best?{id:atom.id,atom,best,score:contextScore(best,moodId,momentId)}:null;}).filter(Boolean).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
function profile(input){
 if(input?.reviewId){
  const entry=window.RTA_MARKET_EVIDENCE?.rows.find(e=>e.id===input.reviewId);if(!entry)return null;
  return {brand:'Profil din review',name:entry.brand+' · '+entry.name,class:entry.category,tags:[...(entry.modelTags||[])],profile:entry.profile,line:'Profil de review · extrapolare, fără adăugare în catalog',isFreeProfile:true,sourceReview:entry.id};
 }
 if(!input||!['NET simplu','NET complex','Tutun simplu','Tutun complex'].includes(input.class))return null;
 const declared=Array.isArray(input.tags)?[...new Set(input.tags.filter(t=>tags.includes(t)))]:[];
 return {brand:'Profil declarat',name:String(input.name||'Profil personal').trim().slice(0,80)||'Profil personal',class:input.class,tags:declared,profile:declared.join(', ')||'Caracter nespecificat',line:'Profil liber · fără identitate comercială',isFreeProfile:true};
}
window.RTA_ATLAS_CONTEXT={goals,tags,profile,rank,contextScore};
})();
