(function(){
'use strict';
const data=window.RTA_MARKET_EVIDENCE,api=window.RTA_ATLAS_PREVIEW,modules=window.RTA_ATLAS_MODULES;
if(!data||!api||!modules)return;
const catalog=window.RTA_LIQUIDS;
const state={category:data.categories[0],query:'',sort:'evidence'};
const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function match(entry){
 if(!entry?.match)return -1;
 const m=entry.match,hits=catalog.map((l,i)=>({l,i})).filter(({l})=>l.brand===m.brand&&l.name===m.name&&l.line===m.line&&l.class===m.category);
 return hits.length===1?hits[0].i:-1;
}
function qualifying(entry){return !!entry&&data.categories.includes(entry.category)&&entry.sourceIds.length>0&&entry.sourceIds.every(id=>{const s=data.sources[id];return s?.url.startsWith('https://')&&s.title&&s.authors&&s.accessed;});}
function select(category=state.category,query=state.query,sort=state.sort){
 return data.rows.filter(e=>qualifying(e)&&(category==='all'||e.category===category)&&(window.RTA_ATLAS_SEARCH?window.RTA_ATLAS_SEARCH.matchesText([e.brand,e.name,e.profile,e.version].join(' '),query):norm([e.brand,e.name,e.profile,e.version].join(' ')).includes(norm(query)))).sort((a,b)=>{
  if(sort==='name')return (a.brand+' '+a.name).localeCompare(b.brand+' '+b.name,'ro');
  return Number(a.sourceIds.some(id=>data.sources[id].identityLimited))-Number(b.sourceIds.some(id=>data.sources[id].identityLimited))||b.sourceIds.length-a.sourceIds.length||(data.sources[b.sourceIds[0]].date||'').localeCompare(data.sources[a.sourceIds[0]].date||'')||(a.brand+' '+a.name).localeCompare(b.brand+' '+b.name,'ro');
 }).slice(0,category==='all'?40:10);
}
function sourceTrail(entry){return entry.sourceIds.map(id=>{
 const s=data.sources[id];
 return '<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+' ↗</a><p>'+esc(s.publisher+' · '+s.authors)+'</p><p>'+esc(s.date?'Data sursei: '+s.date+(s.dateKind?' · '+s.dateKind:''):'Data publicării nu este afișată în pagina accesată')+'</p><p>'+esc('Accesat: '+s.accessed+' · '+s.bias)+'</p></li>';
 }).join('');}
function reviewVisual(entry){
 if(!entry.reviewVisual)return '';
 const p=entry.reviewVisual;
 return '<figure class="market-review-visual"><img width="'+p.width+'" height="'+p.height+'" src="'+esc(p.src)+'" alt="'+esc(entry.brand+' '+entry.name+' — vizual din recenzia originală')+'" loading="lazy" decoding="async"><figcaption><a href="'+esc(p.ref)+'" target="_blank" rel="noopener noreferrer">Vizual: '+esc(p.credit)+' ↗</a><span>'+esc(p.edition)+'</span></figcaption></figure>';
}
function card(e,index){
 const catalogIndex=match(e);
 const photo=e.photo?'<figure class="market-photo"><img src="'+esc(e.photo.src)+'" alt="'+esc(e.brand+' '+e.name+' — '+e.photo.edition)+'" loading="lazy" decoding="async"><figcaption><a href="'+esc(e.photo.ref)+'" target="_blank" rel="noopener noreferrer">Foto: '+esc(e.photo.credit)+' ↗</a><span>'+esc(e.photo.edition)+'</span></figcaption></figure>':'';
 return '<article data-market-id="'+esc(e.id)+'" class="market-card'+(e.photo?' has-market-photo':'')+'"><div class="market-record" aria-hidden="true"><span>'+String(index+1).padStart(2,'0')+'</span><i></i><small>'+esc(e.category)+'</small></div>'+photo+'<div class="market-copy"><span class="eyebrow">'+esc(e.brand)+'</span><h2>'+esc(e.name)+'</h2><p class="market-version">'+esc(e.version)+'</p><p>'+esc(e.profile)+'</p><p class="market-reputation">'+esc(e.why)+'</p><span class="evidence-chip">'+esc(e.confidence)+' · '+esc(data.sources[e.sourceIds[0]].publisher)+'</span><details class="market-trail"><summary>De ce apare în selecție? ↗</summary><ol>'+sourceTrail(e)+'</ol>'+reviewVisual(e)+'<p>'+esc(e.caveat)+'</p><p>Review-urile sunt experiențe subiective. Nu confirmă buildurile personale, un lot nou, disponibilitatea sau un consens universal.</p></details>'+(catalogIndex>=0?'<button type="button" class="module-link" data-market-explore="'+e.id+'">Explorează reperul din colecția mea ↗</button><small class="market-match-note">'+esc(e.caveat)+'</small>':'<p class="market-unmatched">Versiunea evaluată nu este identificată în biblioteca actuală.</p><button type="button" class="module-link" data-market-profile="'+e.id+'">Explorează profilul din review ↗</button><small class="market-match-note">3 × 3 estimări pe profil. Fără produs adăugat în catalog sau A/B atribuit reviewerului.</small>')+'</div></article>';
}
function renderList(){
 const list=document.getElementById('marketList');if(!list)return;
 const rows=select(),available=data.rows.filter(e=>qualifying(e)&&(state.category==='all'||e.category===state.category)).length;
 list.innerHTML='<p class="module-note" role="status">'+rows.length+' fișe afișate · '+available+' susținute în această categorie'+(available<10?' · '+(10-available)+' locuri rămân nedocumentate.':'')+'</p><div class="market-gallery">'+rows.map(card).join('')+'</div>'+(rows.length?'':'<p>Nu există fișe care corespund căutării. Schimbă termenul sau categoria.</p>');
}
function render(){
 const page=document.getElementById('pageMarket');if(!page)return;
 page.innerHTML='<div class="module-intro"><span class="eyebrow">05 / SOURCE TRAIL</span><h1>Market Hall of Fame.</h1><p>Patru familii. Reputație documentată, cu sursa la vedere.</p></div><div class="market-editorial"><span>ULTIMA CERCETARE / '+data.revised+'</span><p>Până la zece fișe pe categorie. Ordinea urmează baza de dovezi, apoi data sursei; relatările cu identitate limitată apar ultimele. Nu este un clasament de popularitate măsurată. O singură recenzie rămâne o singură recenzie.</p></div><div class="market-tabs" role="group" aria-label="Categoria de lichide">'+[['all','Toate cele 40'],...data.categories.map(c=>[c,c])].map(([c,title])=>'<button type="button" data-market-category="'+esc(c)+'" aria-pressed="'+(c===state.category)+'">'+esc(title)+'</button>').join('')+'</div><div class="module-filters market-filters"><label>Caută în categorie<input type="search" id="marketSearch" value="'+esc(state.query)+'" placeholder="Brand, lichid, profil"></label><label>Ordine<select id="marketSort"><option value="evidence"'+(state.sort==='evidence'?' selected':'')+'>Dovezi / data sursei</option><option value="name"'+(state.sort==='name'?' selected':'')+'>Nume</option></select></label></div><div id="marketList"></div><details class="module-method market-method"><summary>Cum sunt definite categoriile?</summary><p>NET: extracție din frunze documentată de sursă. Simplu: o semnătură comercială de tutun; nu înseamnă o singură moleculă sau o specie botanică demonstrată. Complex: amestec de tutunuri ori NET cu alte arome.</p><p>Tutunos simplu: profil de tutun dominant fără adaos aromatic declarat. Tutunos complex: tutun cu arome suplimentare descrise. Aceste două categorii sunt editoriale; nu dovedesc compoziția chimică ori originea fiecărei molecule. Nuanța de cacao percepută nu dovedește singură un ingredient adăugat.</p><p>Selecția actuală este limitată de sursele verificate și de biasul publicațiilor/mostrelor. Traducerile aceleiași recenzii nu sunt surse independente. Nu deducem număr de utilizatori, procente sau consens din această listă. Vizualurile recenziilor sunt atribuite sursei și ediției evaluate; nu confirmă lotul actual. Unde fotografia nu este identificată, discurile sunt grafică editorială originală.</p></details>';
 renderList();
}
function watch(liquid){
 if(!liquid)return '';
 const index=catalog.indexOf(liquid),entry=liquid.sourceReview?data.rows.find(e=>e.id===liquid.sourceReview):data.rows.find(e=>match(e)===index&&index>=0);if(!entry)return '';
 const source=data.sources[entry.sourceIds[0]];
 return 'Review pentru profilul lichidului: '+esc(entry.profile)+' <a href="'+esc(source.url)+'" target="_blank" rel="noopener noreferrer">'+esc(source.publisher)+' ↗</a> · '+esc(source.date||'publicare nedatată')+' · acces '+source.accessed+'. '+esc(source.bias)+'. Reper asociat, versiuni posibil diferite; nu este probă A/B pe acest setup.';
}
function init(){
 const page=document.createElement('section');page.id='pageMarket';page.className='page atlas-module frame';page.hidden=true;page.setAttribute('aria-label','Market Hall of Fame');document.getElementById('main').appendChild(page);
 const nav=document.querySelector('.top-nav'),button=document.createElement('button');button.type='button';button.dataset.route='market';button.textContent='Market';nav.insertBefore(button,nav.querySelector('[data-route="duel"]'));
 const gateway=document.querySelector('.gateway-card[data-open="market"],.gateway-card[data-route="market"]');
 if(gateway){gateway.dataset.route='market';gateway.removeAttribute('data-open');gateway.classList.add('gateway-active');gateway.setAttribute('role','button');gateway.tabIndex=0;gateway.querySelector('.gateway-bottom').textContent='EXPLOREAZĂ SURSELE ↗';}
 else{const card=document.createElement('button');card.type='button';card.className='gateway-card gateway-active';card.dataset.route='market';card.innerHTML='<span class="gateway-overline">04 / SOURCE TRAIL</span><strong>Market Hall of Fame.</strong><small>Patru galerii cu review-uri, versiuni și surse reale.</small><span class="gateway-bottom">EXPLOREAZĂ ↗</span>';document.querySelector('.gateway-grid').insertBefore(card,document.querySelector('.gateway-card[data-route=duel]'));}
 const tabs=document.querySelector('.bottom-tabs');for(const [route,label,icon] of [['market','PIAȚĂ','◉'],['duel','DUEL','⇄']]){const b=document.createElement('button');b.type='button';b.dataset.route=route;b.innerHTML='<span aria-hidden="true">'+icon+'</span><small>'+label+'</small>';tabs.appendChild(b);}
 document.addEventListener('click',e=>{
  const category=e.target.closest?.('[data-market-category]');if(category){state.category=category.dataset.marketCategory;state.query='';render();return;}
  const profile=e.target.closest?.('[data-market-profile]');if(profile){if(api.setFreeProfile({reviewId:profile.dataset.marketProfile}))api.route('liquid');return;}
  const explore=e.target.closest?.('[data-market-explore]');if(explore){const entry=data.rows.find(r=>r.id===explore.dataset.marketExplore),index=match(entry);if(index>=0){api.selectLiquid(index);api.route('liquid');}}
 });
 document.addEventListener('input',e=>{if(e.target.id==='marketSearch'){state.query=e.target.value;renderList();}});
 document.addEventListener('change',e=>{if(e.target.id==='marketSort'){state.sort=e.target.value;renderList();}});
 if(window.location.hash==='#market')api.route('market',false);
}
const priorShow=modules.show;modules.routes.push('market');modules.show=route=>{priorShow(route);const page=document.getElementById('pageMarket');if(page)page.hidden=route!=='market';if(route==='market')render();};
window.RTA_ATLAS_MARKET={data,state,select,match,qualifying,render,watch};
if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
})();
