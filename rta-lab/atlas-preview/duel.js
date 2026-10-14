/* Two full configurations, one common liquid and objective. */
(function(){
'use strict';
const core=window.RTA_SENSORY_CORE,api=window.RTA_ATLAS_PREVIEW,modules=window.RTA_ATLAS_MODULES;
if(!core||!api||!modules)return;
const atoms=window.RTA_CORE.atoms,catalog=window.RTA_LIQUIDS;
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const fields=['atom','bell','air','wire','wraps','coilMm','position','power','temp'];
const labels={atom:'Platformă',bell:'Cameră',air:'Airflow',wire:'Material',wraps:'Spire',coilMm:'Ø coil',position:'Poziție',power:'Putere / plafon',temp:'Setare TC'};
const signals={spectrum:'Spectru',simultaneity:'Simultaneitate',separation:'Separare',palate:'Palat',offense:'Ofensivă',th:'Throat hit',harmony:'Armonie'};
const state={left:core.defaultConfig('gtr'),right:core.defaultConfig('klp'),next:'left',onlyDifferences:false};
const atom=id=>atoms.find(a=>a.id===id);
const liquid=()=>catalog[api.state.liquidIndex];
function valid(raw){
 if(!raw||!core.platforms[raw.atom]||!core.permitted(raw.atom,raw.wire,Number(raw.wraps)))return null;
 return core.config(raw.atom,raw);
}
function pick(raw,side=state.next){
 const cfg=valid(raw);if(!cfg||!['left','right'].includes(side))return false;
 state[side]={...cfg};state.next=side==='left'?'right':'left';return true;
}
function compare(left=state.left,right=state.right,chosenLiquid=liquid(),objective=modules.state.objective){
 const a=valid(left),b=valid(right);if(!a||!b||!chosenLiquid)return null;
 const ra=core.analyze(a,chosenLiquid,objective),rb=core.analyze(b,chosenLiquid,objective);
 const bothTC=core.wires[a.wire].type==='tc'&&core.wires[b.wire].type==='tc';
 const changed=fields.filter(k=>k!=='temp'||bothTC).filter(k=>a[k]!==b[k]);
 const dimensions=Object.entries(signals).map(([key,label])=>({key,label,left:ra.signals[key],right:rb.signals[key],different:Math.abs(ra.signals[key]-rb.signals[key])>=.25}));
 return {left:{config:a,result:ra},right:{config:b,result:rb},changed,dimensions,same:changed.length===0,objective,liquid:chosenLiquid};
}
function options(rows,selected){return rows.map(([id,name])=>'<option value="'+esc(id)+'"'+(String(id)===String(selected)?' selected':'')+'>'+esc(name)+'</option>').join('');}
function configCard(side,result){
 const cfg=result.config,platform=atom(cfg.atom),air=core.platforms[cfg.atom].air.find(a=>a.id===cfg.air);
 return '<section class="duel-card"><span class="eyebrow">'+(side==='left'?'A / STÂNGA':'B / DREAPTA')+'</span><label>Platformă<select data-duel-atom="'+side+'">'+options(atoms.map(a=>[a.id,a.short]),cfg.atom)+'</select></label><div class="duel-photo">'+api.renderProductPhoto(platform)+'</div><h2>'+esc(platform.short)+'</h2><p class="duel-setup">'+esc(api.buildString(result))+'</p><p class="module-note">'+esc(api.compactBuild(result))+'</p><label>Build contextual<select data-duel-build="'+side+'">'+options([[-1,'Configurația curentă'],...core.rankBuilds(cfg.atom,liquid(),modules.state.objective).slice(0,3).map((b,i)=>[i,core.wires[b.config.wire].name+' / '+b.config.wraps+' spire'])],-1)+'</select></label><button type="button" class="module-link" data-duel-edit="'+side+'">Reglează această configurație în Wire Lab ↗</button><details class="module-method"><summary>Configurație și proveniență</summary><p>'+esc(air.label)+' · '+esc(cfg.position)+' · '+esc(api.evidenceFor(result,liquid()).label)+'</p>'+result.notes.map(n=>'<p>'+esc(n)+'</p>').join('')+'</details></section>';
}
function qualitative(value){return value>=4.65?'Foarte pronunțat':value>=4.2?'Pronunțat':value>=3.6?'Echilibrat':'Moderat';}
function render(){
 const model=compare();const page=document.getElementById('pageDuel');if(!model||!page)return;
 const rows=model.dimensions.filter(d=>!state.onlyDifferences||d.different);
 const changeText=model.same?'Aceeași configurație: nu există diferențe de comparat.':model.changed.length===1?'Se schimbă o singură variabilă: '+labels[model.changed[0]]+'.':
  'Se schimbă '+model.changed.length+' variabile: '+model.changed.map(k=>labels[k]).join(', ')+'. Diferențele nu pot fi atribuite unei singure variabile.';
 const objective=modules.state.objective;
 const mood=window.RTA_MOOD_MATCH.moods.find(m=>m.id===api.state.mood),moment=window.RTA_MOOD_MATCH.moments.find(m=>m.id===api.state.moment);
 const contextText=[liquid().brand,liquid().name,mood?.name,moment?.name,modules.objectiveLabel(objective)].filter(Boolean).join(' · ');
 const scoreA=core.priority(model.left.result,objective),scoreB=core.priority(model.right.result,objective);
 const lead=model.same?'Configurațiile sunt identice.':Math.abs(scoreA-scoreB)<.25?'Modelul le vede apropiate. Alege după caracter și verifică practic.':
  'În acest context, modelul înclină spre '+atom(scoreA>scoreB?state.left.atom:state.right.atom).short+'. Este o estimare contextuală, nu un verdict A/B.';
 page.innerHTML='<div class="module-intro"><span class="eyebrow">06 / SAME CONTEXT</span><h1>Duel Mode.</h1><p>Două configurații complete. Același lichid, același obiectiv.</p></div><div class="atlas-context"><span>'+esc(contextText)+'</span><button type="button" data-route="liquid">Schimbă contextul ↗</button></div><div class="duel-shortcuts"><button type="button" class="module-link" data-duel-results>Vezi diferențele A / B ↓</button><button type="button" class="module-link" data-route="liquid">Alege alt build din rezultate ↗</button></div><div class="duel-grid">'+configCard('left',model.left.result)+configCard('right',model.right.result)+'</div><section class="module-section" id="duelDifferences"><span class="eyebrow">CE SE SCHIMBĂ</span><h2>Diferența care contează.</h2><p class="duel-change" role="status">'+esc(changeText)+'</p><p class="module-note">Comparația privește modelul tehnico-senzorial. Nu deducem procente de plăcere din scorurile interne.</p><button type="button" class="module-link" id="duelOnlyDifferences" aria-pressed="'+state.onlyDifferences+'">'+(state.onlyDifferences?'Arată toate dimensiunile':'Arată numai diferențele importante')+'</button><div class="duel-metrics"><div class="duel-metric metric-head"><span>Dimensiune</span><b>A</b><b>B</b></div>'+rows.map(d=>'<div class="duel-metric"><span>'+d.label+'</span><strong>'+qualitative(d.left)+'</strong><strong>'+qualitative(d.right)+'</strong></div>').join('')+(rows.length?'':'<p class="module-note">Nu există diferențe importante în estimarea modelului.</p>')+'</div><p class="duel-verdict">'+esc(lead)+'</p><div class="watchlist"><div class="watch-item"><b>WATCH A / comparație personală</b><p>Schimbă o singură variabilă și păstrează lichidul, puterea și condițiile comparabile. Rezultatul practic poate confirma sau respinge ipoteza modelului.</p></div><div class="watch-item market"><b>WATCH B / din piață</b><p>Nu există încă o comparație externă verificată pentru aceste două configurații exacte. Review-urile unor lichide nu reprezintă teste pe aceste builduri.</p></div></div></section>';
}
function init(){
 const page=document.createElement('section');page.id='pageDuel';page.className='page atlas-module frame';page.hidden=true;page.setAttribute('aria-label','Duel Mode');document.getElementById('main').appendChild(page);
 const nav=document.querySelector('.top-nav');const button=document.createElement('button');button.type='button';button.dataset.route='duel';button.textContent='Duel';nav.appendChild(button);
 const card=document.createElement('button');card.type='button';card.className='gateway-card gateway-active';card.dataset.route='duel';card.innerHTML='<span class="gateway-overline">05 / SAME CONTEXT</span><strong>Duel Mode.</strong><small>Două configurații. Diferențe explicate, fără procente inventate.</small><span class="gateway-bottom">COMPARĂ ↗</span>';document.querySelector('.gateway-grid').appendChild(card);
 document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-duel-results]')){document.getElementById('duelDifferences')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});return;}
  const pickButton=e.target.closest?.('[data-duel-pick]');
  if(pickButton){try{const cfg=JSON.parse(decodeURIComponent(pickButton.dataset.duelPick));if(pick(cfg))api.route('duel');}catch(error){}return;}
  if(e.target.closest?.('#duelOnlyDifferences')){state.onlyDifferences=!state.onlyDifferences;render();return;}
  const edit=e.target.closest?.('[data-duel-edit]');if(edit){modules.state.atom=state[edit.dataset.duelEdit].atom;modules.state.config={...state[edit.dataset.duelEdit]};state.editing=edit.dataset.duelEdit;api.route('wire');}
  if(e.target.closest?.('[data-duel-update]')&&state.editing){pick(modules.state.config,state.editing);state.editing=null;api.route('duel');}
 });
 document.addEventListener('change',e=>{
  const side=e.target.dataset.duelAtom||e.target.dataset.duelBuild;if(!side)return;
  if(e.target.dataset.duelAtom)pick(core.defaultConfig(e.target.value),side);
  else{const build=core.rankBuilds(state[side].atom,liquid(),modules.state.objective)[Number(e.target.value)];if(build)pick(build.config,side);}
  render();
 });
 if(window.location.hash==='#duel')api.route('duel',false);
}
function onWireRendered(){
 if(!state.editing)return;
 const panel=document.getElementById('pageWire')?.querySelector('.wire-picker');
 if(!panel||panel.querySelector('[data-duel-update]'))return;
 const button=document.createElement('button');button.type='button';button.className='module-link duel-return';button.dataset.duelUpdate='';button.textContent='Actualizează configurația '+(state.editing==='left'?'A':'B')+' în Duel ↗';panel.appendChild(button);
}
const earlierShow=modules.show;
modules.routes.push('duel');modules.show=to=>{earlierShow(to);const page=document.getElementById('pageDuel');if(page)page.hidden=to!=='duel';if(to==='duel')render();if(to==='wire')onWireRendered();};
window.RTA_ATLAS_DUEL={state,pick,compare,valid,render,onWireRendered};
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
})();
