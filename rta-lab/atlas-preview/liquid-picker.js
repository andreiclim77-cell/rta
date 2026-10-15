/* Shared catalog search and in-place selection. Source records and saved builds stay untouched. */
(function(){
'use strict';
const catalog=window.RTA_LIQUIDS,core=window.RTA_SENSORY_CORE;if(!catalog||!core)return;
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliases={balcan:'balkan',centenarymods:'centenary',alune:'nuts',nuci:'nuts',dulce:'sweet',dulci:'sweet',straturi:'layers',afumat:'smoky',fum:'smoky',trabuc:'cigar',foi:'cigar',vanilie:'vanilla',ciocolata:'chocolate',cafea:'coffee'};
const tokens=v=>norm(v).split(' ').filter(Boolean).map(t=>aliases[t]||t);
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const label=l=>[l?.brand,l?.name,l?.id&&l?.line].filter(Boolean).join(' · ');
function sourceNote(l){
 if(!l?.id||!l.sources?.length)return '';
 const publishers=new Set();const sources=l.sources.filter(s=>{if(!/^https:\/\//.test(s.url)||publishers.has(s.publisher))return false;publishers.add(s.publisher);return true;}).slice(0,2);
 return '<small class="catalog-source-note">'+esc(l.evidenceLimit||'Profil documentat; potrivire estimată din motor.')+' <span>Surse: '+sources.map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.publisher)+' ↗</a>').join(' · ')+'</span></small>';
}
const indexed=catalog.map((liquid,index)=>({liquid,index,name:norm(liquid.name),brand:norm(liquid.brand),words:tokens([liquid.brand,liquid.name,liquid.profile,liquid.class,liquid.line,...(liquid.aliases||[]),...(liquid.tags||[])].join(' '))}));
function near(a,b){
 if(a.length<4||Math.abs(a.length-b.length)>1)return false;
 let i=0,j=0,errors=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){i++;j++;continue;}if(++errors>1)return false;if(a.length===b.length&&a[i]===b[j+1]&&a[i+1]===b[j]){i+=2;j+=2;continue;}if(a.length>=b.length)i++;if(b.length>=a.length)j++;}return errors+(i<a.length||j<b.length?1:0)<=1;
}
function textScore(row,q,fuzzy=false){
 const terms=tokens(q);if(!terms.length)return 0;
 let score=0;for(const term of terms){if(row.name.includes(term))score+=8;else if(row.brand.includes(term))score+=6;else if(row.words.some(w=>w.includes(term)))score+=3;else if(fuzzy&&row.words.some(w=>near(term,w)))score+=1;else return -1;}
 if(row.liquid){const identity=tokens([row.liquid.brand,row.liquid.name].join(' '));const aliasExact=(row.liquid.aliases||[]).some(alias=>{const parts=tokens(row.liquid.brand+' '+alias);return parts.every(t=>terms.includes(t))&&terms.every(t=>parts.includes(t));});if(aliasExact)score+=40;if(identity.every(t=>terms.includes(t))&&terms.every(t=>identity.includes(t)))score+=40;else if(norm(row.liquid.name)===norm(q))score+=30;else if(norm(label(row.liquid)).includes(norm(q)))score+=12;}return score;
}
const cache=new Map();
function ranked(config,goal='complete'){
 if(!config?.atom||!core.permitted(config.atom,config.wire,Number(config.wraps)))return [];
 const key=JSON.stringify([config,goal]);if(cache.has(key))return cache.get(key);
 const rows=core.matchLiquids(config,catalog,goal,0);if(cache.size>=12)cache.delete(cache.keys().next().value);cache.set(key,rows);return rows;
}
function top(config,goal='complete',limit=5){
 const seen=new Set();return ranked(config,goal).filter(row=>{if(row.liquid.recommendable===false)return false;const key=row.liquid.recipeGroup||row.index;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,limit);
}
function find(q='',filters={}){
 const query=norm(q),base=indexed.filter(r=>(!filters.family||r.liquid.class===filters.family)&&(!filters.brand||r.liquid.brand===filters.brand)&&(!filters.tag||(r.liquid.tags||[]).includes(filters.tag)));
 if(query.length===1)return {rows:[],total:0,approximate:false};
 let rows=base.map(r=>({...r,textScore:textScore(r,q)})).filter(r=>r.textScore>=0),approximate=false;
 if(query&&rows.length===0){rows=base.map(r=>({...r,textScore:textScore(r,q,true)})).filter(r=>r.textScore>=0);approximate=rows.length>0;}
 const configs=filters.configs||[filters.config].filter(Boolean),scores=configs.map(c=>new Map(ranked(c,filters.goal).map(r=>[r.index,r.score])));
 rows.sort((a,b)=>b.textScore-a.textScore||(scores.length?scores.reduce((s,m)=>s+(m.get(b.index)||0)-(m.get(a.index)||0),0):0)||label(a.liquid).localeCompare(label(b.liquid),'ro')||a.index-b.index);
 return {rows,total:rows.length,approximate};
}
function matchesText(text,q){const row={name:norm(text),brand:'',words:tokens(text)};return textScore(row,q)>=0;}
window.RTA_ATLAS_SEARCH={norm,find,ranked,top,matchesText,textScore,label,sourceNote};

const states=new Map(),api=()=>window.RTA_ATLAS_PREVIEW;
const ids=p=>p==='liquid'?{input:'liquidSearch',list:'liquidSuggestions',selected:'selectedLiquid'}:{input:p+'LiquidSearch',list:p+'LiquidOptions',selected:p+'SelectedLiquid'};
function state(p){if(!states.has(p))states.set(p,{query:'',family:'',brand:'',tag:'',offset:0,active:0,open:false});return states.get(p);}
function configFor(p){const m=window.RTA_ATLAS_MODULES,d=window.RTA_ATLAS_DUEL;return p==='duel'?{configs:d?[d.state.left,d.state.right]:[],goal:api().effectiveGoal()}:p==='liquid'||p==='wire'&&!m?.state.wirePlatformChosen?{}:{config:m?.state.config,goal:api().effectiveGoal()};}
function facets(p){
 const s=state(p),opts=(rows,v)=>rows.map(([id,name])=>'<option value="'+esc(id)+'"'+(id===v?' selected':'')+'>'+esc(name)+'</option>').join('');
 return '<details class="liquid-facets"'+(s.family||s.brand||s.tag?' open':'')+'><summary>Filtre în biblioteca de '+catalog.length+' lichide</summary><div class="liquid-facet-grid"><label>Familie<select data-lp-filter="family">'+opts([['','Toate familiile'],...[...new Set(catalog.map(l=>l.class))].sort().map(c=>[c,c])],s.family)+'</select></label><label>Brand<select data-lp-filter="brand">'+opts([['','Toate brandurile'],...[...new Set(catalog.map(l=>l.brand))].sort((a,b)=>a.localeCompare(b,'ro')).map(b=>[b,b])],s.brand)+'</select></label><label>Trăsătură<select data-lp-filter="tag">'+opts([['','Orice trăsătură'],...[...new Set(catalog.flatMap(l=>l.tags||[]))].sort().map(t=>[t,t])],s.tag)+'</select></label><button type="button" class="module-link" data-lp-reset>Resetează filtrele</button></div></details>';
}
function render(p){
 const i=ids(p),s=state(p),l=api().currentLiquid();
 return '<section class="shared-liquid-picker" data-liquid-picker="'+p+'" aria-label="Alege lichidul pentru '+esc(p==='atlas'?'Atomizer Atlas':p==='wire'?'Wire Lab':'Duel')+'"><label for="'+i.input+'">Lichidul · toate cele '+catalog.length+' repere</label><div class="search-surface"><span aria-hidden="true">⌕</span><input type="search" id="'+i.input+'" value="'+(api().state.fromDemo?'':esc(label(l)))+'" placeholder="Brand, nume, profil · poți combina cuvinte" autocomplete="off" role="combobox" aria-haspopup="listbox" aria-controls="'+i.list+'" aria-expanded="false" aria-autocomplete="list"><button type="button" class="clear-search" data-lp-clear aria-label="Caută alt lichid">×</button></div><div id="'+i.list+'" class="suggestions picker-options" role="listbox" aria-label="Lichide din biblioteca ta" hidden></div><p id="'+i.selected+'" class="picker-selected">'+(api().state.fromDemo?'Niciun lichid ales. Caută în catalog sau alege o potrivire din top.':esc(label(l))+(l.isFreeProfile?' · profil separat de catalog':' · '+esc(l.class)))+'</p>'+(api().state.fromDemo?'':sourceNote(l))+facets(p)+'<p class="picker-count" data-lp-count role="status"></p></section>';
}
function close(host){if(!host)return;const p=host.dataset.liquidPicker,i=ids(p);state(p).open=false;host.querySelector('#'+i.list).hidden=true;host.querySelector('#'+i.input).setAttribute('aria-expanded','false');host.querySelector('#'+i.input).removeAttribute('aria-activedescendant');const count=host.querySelector('[data-lp-count]');if(count)count.textContent=count.textContent.replace(/ · \d+–\d+ afișate\./,'.');}
function update(host){
 const p=host.dataset.liquidPicker,s=state(p),i=ids(p),result=find(s.query,{...s,...configFor(p)}),input=host.querySelector('#'+i.input),box=host.querySelector('#'+i.list);
 if(s.offset>=result.total)s.offset=0;const rows=result.rows.slice(s.offset,s.offset+12);s.active=Math.min(s.active,Math.max(0,rows.length-1));s.open=true;
 host.querySelector('[data-lp-count]').textContent=(norm(s.query).length===1?'Scrie cel puțin două caractere.':result.approximate?'Nicio potrivire exactă. Denumiri apropiate · '+result.total+' rezultate.':result.total+' din '+catalog.length+' lichide corespund'+(rows.length?' · '+(s.offset+1)+'–'+(s.offset+rows.length)+' afișate.':'.'))+(p==='liquid'||p==='wire'&&!window.RTA_ATLAS_MODULES?.state.wirePlatformChosen?'':' Ordine după potrivirea estimată '+(p==='duel'?'cu ambele configurații.':'cu configurația și obiectivul alese.'));
 box.innerHTML=rows.map((r,j)=>'<button type="button" role="option" id="'+(p==='liquid'?'liquidOpt':p+'LiquidOpt')+j+'" class="suggestion'+(j===s.active?' is-active':'')+'" aria-selected="'+(j===s.active)+'" data-lp-index="'+r.index+'"><strong>'+esc(label(r.liquid))+'</strong><small>'+esc(r.liquid.class+' · '+(r.liquid.profile||''))+(result.approximate?' · denumire apropiată':'')+'</small></button>').join('')+(result.total===0?'<p class="picker-empty">Niciun lichid nu corespunde. Schimbă termenii sau resetează filtrele; selecția curentă este păstrată.</p>':'')+(result.total>12?'<div class="picker-paging"><button type="button" data-lp-page="-1"'+(s.offset===0?' disabled':'')+'>← Anterior</button><button type="button" data-lp-page="1"'+(s.offset+12>=result.total?' disabled':'')+'>Următoarele →</button></div>':'');
 box.hidden=false;input.setAttribute('aria-expanded','true');const opt=box.querySelectorAll('[data-lp-index]')[s.active];if(opt)input.setAttribute('aria-activedescendant',opt.id);else input.removeAttribute('aria-activedescendant');
 // Facet counts reflect the query and the other active facets; unavailable choices cannot be added.
 host.querySelectorAll('[data-lp-filter]').forEach(select=>{const field=select.dataset.lpFilter,counts=new Map();for(const r of find(s.query,{...s,[field]:''}).rows){const values=field==='family'?[r.liquid.class]:field==='brand'?[r.liquid.brand]:r.liquid.tags||[];for(const value of values)counts.set(value,(counts.get(value)||0)+1);}for(const option of select.options){if(!option.value)continue;const raw=option.value,count=counts.get(raw)||0;option.textContent=raw+' ('+count+')';option.disabled=count===0&&s[field]!==raw;}});
}
function choose(host,index){
 const p=host.dataset.liquidPicker,s=state(p);s.query='';s.offset=0;s.open=false;
 if(!api().selectLiquid(index))return;
 const route=api().state.route;if(route!=='liquid')window.RTA_ATLAS_MODULES.show(route);
 document.querySelectorAll('[data-liquid-picker]').forEach(close);
 const fresh=document.querySelector('[data-liquid-picker="'+p+'"]');fresh?.querySelector('#'+ids(p).input)?.focus({preventScroll:true});if(fresh)close(fresh);
}
function refresh(){const route=api()?.state.route;if(route&&route!=='liquid')window.RTA_ATLAS_MODULES?.show(route);}
function init(){
 const main=document.querySelector('.liquid-search-wrap');main.dataset.liquidPicker='liquid';main.classList.add('shared-liquid-picker');main.insertAdjacentHTML('beforeend',facets('liquid')+'<p class="picker-count" data-lp-count role="status"></p>');main.querySelector('.clear-search').dataset.lpClear='';
 document.addEventListener('input',e=>{const host=e.target.closest?.('[data-liquid-picker]');if(!host||e.target.id!==ids(host.dataset.liquidPicker).input)return;const s=state(host.dataset.liquidPicker);s.query=e.target.value;s.offset=0;s.active=0;update(host);});
 document.addEventListener('focusin',e=>{const host=e.target.closest?.('[data-liquid-picker]');document.querySelectorAll('[data-liquid-picker]').forEach(other=>{if(other!==host)close(other);});if(!host||e.target.id!==ids(host.dataset.liquidPicker).input)return;const s=state(host.dataset.liquidPicker);if(e.target.value===label(api().currentLiquid())){s.query='';e.target.select();}update(host);});
 document.addEventListener('change',e=>{const host=e.target.closest?.('[data-liquid-picker]'),field=e.target.dataset.lpFilter;if(!host||!field)return;const s=state(host.dataset.liquidPicker);s[field]=e.target.value;s.offset=0;s.active=0;update(host);});
 document.addEventListener('click',e=>{const host=e.target.closest?.('[data-liquid-picker]');if(!host){document.querySelectorAll('[data-liquid-picker]').forEach(close);return;}const target=e.target.closest('[data-lp-index],[data-lp-clear],[data-lp-reset],[data-lp-page]');if(!target)return;const s=state(host.dataset.liquidPicker),input=host.querySelector('#'+ids(host.dataset.liquidPicker).input);
  if(target.dataset.lpIndex!=null){choose(host,Number(target.dataset.lpIndex));return;}
  if(target.dataset.lpPage!=null){s.offset=Math.max(0,s.offset+12*Number(target.dataset.lpPage));s.active=0;update(host);return;}
  if(target.hasAttribute('data-lp-reset')){s.family='';s.brand='';s.tag='';host.querySelectorAll('[data-lp-filter]').forEach(x=>x.value='');}
  if(target.hasAttribute('data-lp-clear')){s.query='';input.value='';}
  s.offset=0;s.active=0;input.focus({preventScroll:true});update(host);
 });
 document.addEventListener('keydown',e=>{const host=e.target.closest?.('[data-liquid-picker]');if(!host||e.target.id!==ids(host.dataset.liquidPicker).input)return;const s=state(host.dataset.liquidPicker),box=host.querySelector('#'+ids(host.dataset.liquidPicker).list);if(e.key==='Escape'){e.preventDefault();close(host);return;}if(!s.open)return;const options=[...box.querySelectorAll('[data-lp-index]')];if(e.key==='Enter'&&options.length){e.preventDefault();choose(host,Number(options[s.active].dataset.lpIndex));return;}if(['ArrowDown','ArrowUp'].includes(e.key)&&options.length){e.preventDefault();s.active=(s.active+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;options.forEach((o,j)=>{o.classList.toggle('is-active',j===s.active);o.setAttribute('aria-selected',String(j===s.active));});e.target.setAttribute('aria-activedescendant',options[s.active].id);options[s.active].scrollIntoView({block:'nearest'});}});
}
window.RTA_ATLAS_SEARCH_UI={render,refresh,states};
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
})();
