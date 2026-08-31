#!/usr/bin/env node
'use strict';

const fs=require('fs');
const crypto=require('crypto');
const {snapshotReferenceMs}=require('./hype-window-reference-2026.js');
const {classifyPodProduct,decode,norm}=require('./market-pod-classifier-2026.js');
const {canonicalizeProduct}=require('./market-product-canonical-2026.js');
const {classifyRtaAccessory}=require('./market-hype-accessory-classifier-2026.js');

const WRITE=process.argv.includes('--write');
const RTA_FILE='data/market-hype-products-2026.json';
const POD_FILE='data/market-hype-pods-2026.json';
const MEMORY_FILE='data/market-hype-retail-memory-2026.json';
const DIRECT_FILE='data/market-hype-direct-catalogs-2026.json';
const SOURCE_FILE='data/market-hype-sources-2026.json';
const ACTIVE_MAKERS_FILE='data/market-hype-active-makers-extra-2026.json';
const POD_UNIVERSE_FILE='data/market-pod-universe-2026.json';
const OUT_FILE='data/market-hype-dated-news-2026.json';
const REF=snapshotReferenceMs();
const DAY=86400000;
const WINDOW_DAYS=30;

const WP_SOURCES=[
  {id:'vapoteurs',baseUrl:'https://vapoteurs.net',label:'Vapoteurs.net',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'vaping-post',baseUrl:'https://vapingpost.com',label:'Vaping Post',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'black-note',baseUrl:'https://www.blacknote.com',label:'Black Note',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'igeekphone',baseUrl:'https://www.igeekphone.com',label:'iGeekPhone',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'smoketastic',baseUrl:'https://smoketastic.com',label:'Smoketastic',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'vaping-vibe',baseUrl:'https://vapingvibe.com',label:'Vaping Vibe',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'my-vape-review',baseUrl:'https://myvapereview.com',label:'My Vape Review',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'spinfuel',baseUrl:'https://spinfuel.com',label:'Spinfuel',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'vaping-hardware',baseUrl:'https://www.vapinghardware.com',label:'Vaping Hardware',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'le-vapelier',baseUrl:'https://www.levapelier.com',label:'Le Vapelier',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'ecigclick',baseUrl:'https://www.ecigclick.co.uk',label:'Ecigclick',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'vapouround',baseUrl:'https://www.vapouround.com',label:'Vapouround',sourceType:'independent-vape-news',contentTypes:['posts']},
  {id:'lost-vape-official',baseUrl:'https://lostvape.com',label:'Lost Vape',sourceType:'manufacturer-official',contentTypes:['posts','product']},
  {id:'geekvape-official',baseUrl:'https://www.geekvape.com',label:'Geekvape',sourceType:'manufacturer-official',contentTypes:['posts']},
  {id:'aspire-official',baseUrl:'https://www.aspirecig.com',label:'Aspire',sourceType:'manufacturer-official',contentTypes:['posts']},
  {id:'cthulhu-official',baseUrl:'https://www.cthulhumod.com',label:'Cthulhu Mod',sourceType:'manufacturer-official',contentTypes:['posts','product']},
  {id:'smoant-official',baseUrl:'https://smoant.com',label:'Smoant',sourceType:'manufacturer-official',contentTypes:['posts']},
  {id:'freemax-official',baseUrl:'https://www.freemaxvape.com',label:'FreeMax',sourceType:'manufacturer-official',contentTypes:['posts']},
  {id:'eleaf-official',baseUrl:'https://www.eleafworld.com',label:'Eleaf',sourceType:'manufacturer-official',contentTypes:['posts']},
  {id:'centenary-official',baseUrl:'https://centenarymods.com',label:'Centenary Mods',sourceType:'manufacturer-official',contentTypes:['product']},
  {id:'atmizoo-official',baseUrl:'https://www.atmizoo.com',label:'Atmizoo',sourceType:'manufacturer-official',contentTypes:['posts','product']},
  {id:'fakirs-official',baseUrl:'https://www.fakirsmods.com',label:'Fakirs Mods',sourceType:'manufacturer-official',contentTypes:['posts','product']},
  {id:'gus-official',baseUrl:'https://www.gus-mod.com',label:'GUS Mods',sourceType:'manufacturer-official',contentTypes:['product']}
];

const BASE_QUERIES=[
  {category:'RTA',query:'("RTA" OR "MTL RTA" OR "rebuildable tank atomizer") (announced OR unveils OR launches OR released OR "first look" OR preview OR preorder) vape when:30d'},
  {category:'RTA',query:'("RTA clone" OR "style RTA") (YFTK OR SXK OR Ulton OR Kindbright OR ShenRay) (new OR launch OR released OR preorder) when:30d'},
  {category:'MODURI',query:'("box mod" OR "vape mod" OR "SBS mod" OR "mechanical mod") (announced OR unveils OR launches OR released OR "first look" OR preview) vape when:30d'},
  {category:'MODURI',query:'(Dicodes OR YiHi OR DNA250C OR "high end mod") (announced OR launch OR released OR review OR "first look") vape when:30d'},
  {category:'MODURI',query:'(Geekvape OR VOOPOO OR Dovpo OR "Lost Vape" OR SMOK OR Vaporesso) (Aegis OR DRAG OR Odin OR Centaurus OR X-Priv OR Armour) (review OR launch OR announced OR "first look") when:30d'},
  {category:'MODURI',query:'"vape mod" review hardware when:30d'},
  {category:'ACCESORII',query:'("RTA accessory" OR "MTL drip tip" OR "RTA air pin" OR "replacement glass RTA") (announced OR released OR "new arrival" OR review OR preorder) when:30d'},
  {category:'ACCESORII',query:'("vape wire" OR NiFe30 OR SS316L OR Ni80 OR "vape cotton" OR "coil jig") (new OR launched OR released OR review) when:30d'},
  {category:'POD',query:'("pod system" OR "pod kit") vape (announced OR unveils OR launches OR released OR "first look" OR preview) when:30d'},
  {category:'POD',query:'(OXVA OR Vaporesso OR VOOPOO OR Uwell OR SMOK OR Geekvape OR Lost Vape OR Aspire OR Innokin) (pod OR Xlim OR XROS OR VMATE OR Caliburn OR Argus OR VPrime OR Nexlim) (new OR launch OR announced OR review) when:30d'},
  {category:'POD',query:'(RELX OR Vuse OR JUUL2 OR VEEV OR Elfbar OR Lost Mary OR KIWI OR IVG) (pod system OR pod kit) (launch OR announced OR released OR review) when:30d'},
  {category:'POD',query:'(dotPod OR Lightsaber OR Cthulhu AIO OR Orion II OR Mi-Pod) (launch OR announced OR released OR review OR "first look") when:30d'}
];

function chunks(values,size){const output=[];for(let index=0;index<values.length;index+=size)output.push(values.slice(index,index+size));return output}
function buildQueries(){
  const cfg=read(SOURCE_FILE,{}),active=read(ACTIVE_MAKERS_FILE,{activeMakers:[]}),pods=read(POD_UNIVERSE_FILE,{makers:[]}),queries=BASE_QUERIES.slice();
  const rtaNames=unique([...(cfg.officialMakers||[]).map(function(row){return row.name}),...(cfg.cloneMakers||[]),...(active.activeMakers||[]).map(function(row){return row.name})]);
  const modNames=unique([...(active.activeMakers||[]).map(function(row){return row.name}),...(cfg.officialMakers||[]).map(function(row){return row.name})]);
  const podNames=unique((pods.makers||[]).map(function(row){return row.name}));
  for(const group of chunks(rtaNames,7))queries.push({category:'RTA',channel:'maker-batch',query:'('+group.map(function(name){return '"'+name.replace(/"/g,'')+'"'}).join(' OR ')+') (RTA OR "rebuildable tank atomizer") (announce OR announced OR launch OR released OR review OR preview OR prototype OR preorder OR "coming soon") when:30d'});
  for(const group of chunks(modNames,7))queries.push({category:'MODURI',channel:'maker-batch',query:'('+group.map(function(name){return '"'+name.replace(/"/g,'')+'"'}).join(' OR ')+') ("vape mod" OR "box mod" OR "SBS mod" OR squonk OR DNA80C OR BF60) (announce OR launched OR released OR review OR preview OR prototype OR preorder OR "coming soon") when:30d'});
  for(const group of chunks(podNames,8))queries.push({category:'POD',channel:'maker-batch',query:'('+group.map(function(name){return '"'+name.replace(/"/g,'')+'"'}).join(' OR ')+') ("pod system" OR "pod kit" OR "pod mod") (announce OR launched OR released OR review OR preview OR preorder OR "coming soon") when:30d'});
  return Array.from(new Map(queries.map(function(row){return[row.category+'|'+row.query,row]})).values());
}

function read(file,fallback={}){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch(_){return fallback}}
function save(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n','utf8')}
function hash(value){return crypto.createHash('sha256').update(String(value||'')).digest('hex').slice(0,20)}
function iso(value){const ms=Date.parse(String(value||''));return Number.isFinite(ms)?new Date(ms).toISOString():null}
function inPast(value,days=WINDOW_DAYS){const ms=Date.parse(String(value||''));return Number.isFinite(ms)&&ms<=REF&&REF-ms<=days*DAY}
function inFuture(value,days=WINDOW_DAYS){const ms=Date.parse(String(value||''));return Number.isFinite(ms)&&ms>REF&&ms-REF<=days*DAY}
function unique(values){return Array.from(new Set((values||[]).filter(Boolean)))}
function xmlTag(block,name){const match=String(block||'').match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,'i'));return match?decode(match[1]):''}
function attr(block,tag,name){const match=String(block||'').match(new RegExp(`<${tag}[^>]*\\s${name}=["']([^"']+)["'][^>]*>`,'i'));return match?decode(match[1]):''}

async function fetchText(url,timeout=15000){
  const controller=new AbortController(),timer=setTimeout(function(){controller.abort()},timeout);
  try{const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'Ghid-RTA-Dated-News/1.0 (+https://ghid-rta.ro/)','accept':'application/rss+xml,application/xml,text/xml;q=.9,*/*;q=.5','cache-control':'no-cache'},signal:controller.signal});const text=await response.text();if(!response.ok)throw new Error('HTTP '+response.status);return text}finally{clearTimeout(timer)}
}

async function fetchJson(url,timeout=15000){const text=await fetchText(url,timeout);return JSON.parse(text)}
async function pool(items,width,worker){let cursor=0;const output=new Array(items.length);async function run(){for(;;){const index=cursor++;if(index>=items.length)return;try{output[index]=await worker(items[index])}catch(error){output[index]={ok:false,meta:items[index],rows:[],error:String(error&&error.message||error)}}}}await Promise.all(Array.from({length:Math.min(width,Math.max(1,items.length))},run));return output}

function rssRows(xml,query){
  const rows=[];
  for(const match of String(xml||'').matchAll(/<item>([\s\S]*?)<\/item>/gi)){
    const block=match[1],title=xmlTag(block,'title'),url=xmlTag(block,'link'),publishedAt=iso(xmlTag(block,'pubDate')),sourceName=xmlTag(block,'source'),sourceUrl=attr(block,'source','url');
    if(title&&url&&publishedAt)rows.push({query,headline:title.replace(/\s+-\s+[^-]+$/,'').trim(),title,url,publishedAt,sourceName,sourceUrl});
  }
  return rows;
}

async function collectQuery(meta){
  try{const url='https://news.google.com/rss/search?q='+encodeURIComponent(meta.query)+'&hl=en-US&gl=US&ceid=US:en',xml=await fetchText(url);return{ok:true,meta,rows:rssRows(xml,meta)}}catch(error){return{ok:false,meta,rows:[],error:String(error&&error.message||error)}}
}

function wpRendered(value){return decode(value&&value.rendered||value||'')}
async function collectWpSource(source){
  const after=new Date(REF-WINDOW_DAYS*DAY).toISOString(),terms=['vape','RTA','pod','mod'],posts=[];let requestsWorking=0;
  for(const type of source.contentTypes||['posts']){
    const searches=type==='product'?(source.sourceType==='retailer-direct'?['RTA','mod','pod kit','pod system']:['']):terms;
    for(const term of searches){
      try{
        const query=['per_page=100','after='+encodeURIComponent(after),'_fields=id,date_gmt,link,title,excerpt,content'].concat(term?'search='+encodeURIComponent(term):[]).join('&');
        const url=source.baseUrl.replace(/\/$/,'')+'/wp-json/wp/v2/'+type+'?'+query,rows=await fetchJson(url);if(!Array.isArray(rows))continue;requestsWorking++;
        for(const post of rows)posts.push({...post,__contentType:type});
      }catch(_){}
    }
  }
  const rows=[];
  for(const post of Array.from(new Map(posts.map(function(post){return[post.__contentType+'|'+String(post.id||post.link),post]})).values())){
    const headline=wpRendered(post.title),description=wpRendered(post.excerpt)+' '+wpRendered(post.content).slice(0,6000),isProductListing=post.__contentType==='product';
    const classification=strictClassify([source.label,headline,post.link].join(' '),'',true,{isProductListing,identity:headline,url:post.link});
    if(!classification)continue;
    rows.push({query:{category:classification.category,channel:isProductListing?'wordpress-product-api':'wordpress-public-api'},headline,title:headline,url:post.link,publishedAt:iso(post.date_gmt&&post.date_gmt+'Z'),sourceName:source.label,sourceUrl:source.baseUrl,sourceType:source.sourceType||'independent-vape-news',description,directDateQuality:isProductListing?'wordpress-product-date-gmt':'wordpress-date-gmt',isProductListing});
  }
  return{ok:requestsWorking>0,meta:{category:'MULTI',query:source.id},rows,requestsWorking,error:requestsWorking?'':'no-wordpress-search-request-worked'};
}

function accessory(value){
  const t=norm(value).slice(0,260);
  if(/\b(?:insulator kit|spare parts?|replacement (?:door|panel|tank|glass|cartridge|pod)|drip tip|tank section|airflow pin|air pin|repair kit|charging device|charging dock|power bank|charger only)\b/.test(t))return true;
  return /\b(?:cartridge|empty pod|pod pack|coil|coils|tank tube|glass tube|mouthpiece|insert|case|cover|charger|cable|cotton|wire)\b/.test(t)&&!/\b(?:starter kit|pod system|pod mod|box mod|mechanical mod|regulated mod|sbs mod|rta)\b/.test(t);
}
function nonTargetDevice(value){const t=norm(value);return /\b(?:e liquid|e juice|vape juice|flavour concentrate|flavor concentrate|nicotine pouches?|heated tobacco|dab pen|dry herb|smartphone|tablet|gaming mouse|planning permission|excise|tax)\b/.test(t)||/\bdisposable\b/.test(t)&&!/\b(?:replaceable pod|refillable pod|pod system|pod kit)\b/.test(t)}
function strictClassify(value,preferred,allowGenericPod=false,meta={}){
  const text=decode(value),t=norm(text),url=String(meta.url||''),accessoryClassification=classifyRtaAccessory(meta.identity||text);if(nonTargetDevice(meta.identity||text))return null;
  if(accessoryClassification&&(preferred==='ACCESORII'||accessory(meta.identity||text)))return accessoryClassification;
  if(accessory(meta.identity||text))return null;
  const explicitPod=classifyPodProduct(text);if(explicitPod&&explicitPod.confidence==='brand-series-match'&&/\bpod\b/.test(t))return explicitPod;
  const knownMod=/\b(?:aegis legend|aegis mini|drag 6|odin v?2|centaurus(?:\s+n\d+)?|x priv|armour ultra|pinnacle colossus|khonsu|thelema|dotbox|sxmini|yihi|istick|illusia|zoe|mood v?2)\b/.test(t),modPath=/\/(?:products?|shop)\/(?:mods?|mech-mods?|18650|21700)\//i.test(url);
  const explicitMod=/\b(?:box mod|vape mod|mechanical mod|regulated mod|tube mod|sbs mod|squonk mod|side by side)\b|\bsbs\b|\bbf60\b|\bdna\s*\d/.test(t);
  if((knownMod||explicitMod||modPath)&&(preferred==='MODURI'||knownMod||explicitMod||modPath))return{category:'MODURI',typology:/side by side|\bsbs\b/.test(t)?'side by side':/squonk|\bbf60\b/.test(t)?'squonk':/dual battery|dual 18650|dual 21700|2x18650|2x21700|aegis legend|drag 6|odin|centaurus/.test(t)?'dual battery':'single battery',brand:''};
  if((preferred==='RTA'||/\brta\b/.test(t))&&(/\brta\b|rebuildable tank (?:atomizer|atomiser)/.test(t))&&!/\brda\b|\brdta\b/.test(t))return{category:'RTA',typology:/\bmtl\b/.test(t)?'MTL single':/dual coil|dual deck/.test(t)?'DL dual':/\brdl\b/.test(t)?'RDL single':/\bdl\b|\bdtl\b/.test(t)?'DL single':'RDL single',brand:''};
  const pod=classifyPodProduct(text);if(pod&&(pod.confidence!=='generic-pod-device'||allowGenericPod&&preferred==='POD'&&/\b(?:pod system|pod kit|pod mod)\b/.test(t)))return pod;
  return null;
}

let BRAND_REGISTRY_CACHE=null;
function brandRegistry(){
  if(BRAND_REGISTRY_CACHE)return BRAND_REGISTRY_CACHE;
  const cfg=read(SOURCE_FILE,{}),active=read(ACTIVE_MAKERS_FILE,{activeMakers:[]}),pods=read(POD_UNIVERSE_FILE,{makers:[]}),map=new Map();
  function add(name,aliases,series){const label=String(name||'').trim();if(!label)return;const key=norm(label),old=map.get(key)||{name:label,aliases:[],series:[]};old.aliases=unique(old.aliases.concat(aliases||[]));old.series=unique(old.series.concat(series||[]));map.set(key,old)}
  for(const row of pods.makers||[])add(row.name,row.aliases,row.series);
  for(const row of cfg.officialMakers||[])add(row.name,row.aliases,[]);
  for(const row of active.activeMakers||[])add(row.name,row.aliases,[]);
  for(const name of ['ThunderCloud','Coilturd','Eleaf','Vaporesso','VOOPOO','OXVA','SMOK','Geekvape','Uwell','Aspire','Innokin','Dovpo','Dicodes','YiHi','Fakirs Mods','Centenary Mods','Atmizoo','GUS Mods','Hellvape'])add(name,[],[]);
  BRAND_REGISTRY_CACHE=Array.from(map.values()).sort(function(a,b){return norm(b.name).length-norm(a.name).length});
  return BRAND_REGISTRY_CACHE;
}
function phrase(value,needle){return(' '+norm(value)+' ').includes(' '+norm(needle)+' ')}
function recognizedBrand(value){
  const text=decode(value);
  for(const row of brandRegistry())for(const alias of [row.name].concat(row.aliases||[]))if(alias&&phrase(text,alias))return row.name;
  return'';
}
function seriesBelongsToBrand(value,brand){const key=norm(brand),row=brandRegistry().find(function(item){return norm(item.name)===key});return Boolean(row&&(row.series||[]).some(function(series){return phrase(value,series)}))}

const STOP=new Set('authentic style styled clone rta rebuildable tank atomizer atomiser vape vaping pod system kit mod box black silver stainless steel ss pei pctg ml mm watt review first look launches launch announced announces unveils released new comparison versus vs pro mini max plus ultra go device'.split(' '));
function tokens(value){return norm(value).split(' ').filter(function(token){return token.length>=2&&!STOP.has(token)&&!/^\d+(?:mah|ml|mm|w)?$/.test(token)}).slice(0,12)}
function compact(value){return norm(value).replace(/\s+/g,'')}
function identityTitle(value){return decode(value).replace(/^Authentic\s+/i,'').replace(/\s+/g,' ').trim().slice(0,180)}
function canonicalIdentity(value){return identityTitle(value).replace(/\b(?:pod mod kit|pod system kit|pod system|pod kit|starter kit|mod kit|vape mod|box mod|regulated mod|mechanical mod|sbs mod)\b/gi,' ').replace(/\s+(?:pod|kit)\s*$/i,' ').replace(/\s+/g,' ').trim()}
function candidateKey(value){const canonical=canonicalizeProduct({product:canonicalIdentity(value.productName),brand:value.brand||recognizedBrand(value.productName)||''});return value.category+'|'+canonical.key}
function candidateUniverse(){
  const map=new Map(),rta=read(RTA_FILE,{products:[]}),pods=read(POD_FILE,{products:[]}),memory=read(MEMORY_FILE,{items:{}}),direct=read(DIRECT_FILE,{items:[]});
  function add(raw,categoryHint){const name=identityTitle(raw.productName||raw.product||'');if(!name)return;const cls=strictClassify([raw.brand||'',name,raw.typology||'',categoryHint||''].join(' '),categoryHint);if(!cls)return;const candidate={productName:name,brand:cls.brand||raw.brand||'',category:cls.category,segment:cls.segment||raw.segment||null,typology:cls.typology||raw.typology||null,url:raw.url||(raw.sources&&raw.sources[0]&&raw.sources[0].url)||''};map.set(candidateKey(candidate),candidate)}
  for(const row of Object.values(memory.items||{}))add(row,row.category);
  for(const row of direct.items||[])add(row,row.category);
  for(const row of rta.products||[])add(row,row.category);
  for(const row of pods.products||[])add(row,'POD');
  for(const row of rta.verificationQueue||[])add({productName:row.product,brand:row.maker,url:row.url},row.category);
  for(const row of pods.verificationQueue||[])add(row,'POD');
  return Array.from(map.values());
}

function exactCandidate(name,classification,candidates){
  const key=candidateKey({productName:name,brand:classification.brand||'',category:classification.category}),matches=candidates.filter(function(candidate){return candidate.category===classification.category&&candidateKey(candidate)===key});
  return matches[0]||null;
}

function cleanExtractedName(value){
  return decode(value)
    .replace(/^\s*(?:new|official)\s+/i,'')
    .replace(/\s+(?:review|hands[- ]on|first look|preview|unboxing)\b[\s\S]*$/i,'')
    .replace(/\s+(?:eco mode deep dive|pod system comparison|quick comparison|key differences|the ultimate comparison|mod comparison)\b[\s\S]*$/i,'')
    .replace(/\s+in\s+(?:France|Europe|the\s+UK|UK|USA|the\s+US)$/i,'')
    .replace(/^Thunder\s+Cloud\s+ThunderCloud\s+/i,'ThunderCloud ')
    .replace(/\s+/g,' ').replace(/^[\s:|,;\-]+|[\s:|,;\-]+$/g,'').trim();
}

function concreteIdentity(value){
  const t=norm(value),parts=t.split(' ').filter(Boolean);
  if(!t||parts.length<2||/^(?:convenience|pod life testing|mod comparison|pod system comparison|battery|features|performance|review)$/.test(t))return false;
  if(parts.every(function(part){return /^\d+(?:mah|ml|mm|w|k)?$/.test(part)||/^(?:vs|and|or|with)$/.test(part)}))return false;
  if(/^(?:what|why|how|when|where|which|have|should|can|will|is|are|fda|eu|uae|united states|etats unis|union europeenne)\b/.test(t))return false;
  return !/\b(?:battery life testing|key differences|which pod|which vape|does the|justify the hype|worth the bulk|ultimate comparison|tobacco harm reduction|nicotine free|low nicotine|shortfills|nic shots|vape shops|planning permission|authorizes|minimum vape tax|peak pod vape)\b/.test(t);
}

function extractedNames(headline,classification,meta={}){
  const original=decode(headline),infoBatch=/^INFO\s+BATCH\s*:/i.test(original);
  let title=original.replace(/^Product\s*\|\s*/i,'').replace(/^INFO\s+BATCH\s*:\s*/i,'').replace(/^Review\s*:\s*/i,'').replace(/^Hands[- ]On\s+with\s+(?:the\s+)?/i,'').trim();
  const building=title.match(/^Building\s+(.+?)\s+FOR\s+VAPING\s+By\s+(.+?)\s+and\s+(.+?)(?:\s+-\s+.*)?$/i);
  if(building)title=building[2]+' x '+building[3]+' '+building[1];
  let brand='';const suffix=title.match(/^(.+?)\s+[–—]\s+([A-Za-z][A-Za-z0-9 .&-]{1,35})$/);
  if(suffix){title=suffix[1];brand=recognizedBrand(suffix[2])}
  const parenthetical=title.match(/\(([^()]{2,35})\)\s*$/);if(parenthetical){brand=recognizedBrand(parenthetical[1])||brand;title=title.slice(0,parenthetical.index).trim()}
  const launch=title.match(/^(.+?)\s+(?:launches|unveils|introduces|announces|reveals|presents)\s+(.+)$/i);
  if(launch){
    const left=launch[1].trim(),leftBrand=recognizedBrand(left),leftWithoutBrand=leftBrand?norm(left).replace(norm(leftBrand),'').trim():norm(left);
    if(leftBrand&&!leftWithoutBrand){brand=leftBrand;title=launch[2].replace(/^(?:the\s+)?new\s+/i,'').split(/,|\s+with\s+|\s+expanding\s+|\s+at\s+/i)[0]}
    else title=left;
  }
  title=title.split(/\s*:\s*/)[0].trim();
  const splitPattern=infoBatch?/\s+vs\.?\s+|\s+versus\s+|\s+&\s+/i:/\s+vs\.?\s+|\s+versus\s+/i;
  const parts=title.split(splitPattern).map(cleanExtractedName).filter(Boolean),output=[];
  let inheritedBrand=brand||recognizedBrand(parts[0]||'');
  for(let part of parts){
    const explicitBrand=recognizedBrand(part);
    if(explicitBrand)inheritedBrand=explicitBrand;
    else if(inheritedBrand&&(infoBatch||seriesBelongsToBrand(part,inheritedBrand)))part=inheritedBrand+' '+part;
    part=cleanExtractedName(part);
    if(part.length<3||part.length>120||!concreteIdentity(part))continue;
    let cls=strictClassify(part,'',true,{identity:part,url:meta.url||''});
    const headlinePod=classifyPodProduct(original);
    if(!cls&&classification.category==='POD'&&headlinePod)cls=strictClassify(part+' pod system','POD',true,{identity:part,url:meta.url||''});
    if(!cls&&classification.category!=='POD')cls=strictClassify(part,classification.category,true,{identity:part,url:meta.url||''});
    if(!cls)continue;
    if(!cls.brand&&brand)cls={...cls,brand};
    output.push({name:part,classification:cls});
  }
  return Array.from(new Map(output.map(function(row){return[candidateKey({productName:row.name,brand:row.classification.brand||'',category:row.classification.category}),row]})).values());
}

function eventType(row){
  const t=norm(row.headline);
  if(row.isProductListing){
    const pending=/coming soon|comming soon|pre order|preorder|pre sale|waitlist|notify me/.test(t+' '+norm(row.description||''));
    const official=row.sourceType==='manufacturer-official',tier=official?'confirmed':'reported';
    return pending?{window:'before',stage:'IMMINENT',stageLabel:official?'listare oficiala in pregatire':'listare comerciala in pregatire',signalKind:official?'confirmed-announcement':'reported-preorder',confidenceTier:tier}:{window:'after',stage:'FIRST_RETAIL',stageLabel:official?'prima listare oficiala datata':'listare comerciala datata',signalKind:official?'confirmed-listing':'reported-listing',confidenceTier:tier};
  }
  if(/coming soon|teaser|prototype|sample|preview|first look|announces|announced|unveils|reveals|pre order|preorder/.test(t))return{window:'before',stage:/prototype/.test(t)?'PROTOTYPE':/sample|preview|first look/.test(t)?'SAMPLE_REVIEW':/pre order|preorder/.test(t)?'IMMINENT':'TEASER',stageLabel:/prototype/.test(t)?'prototip public':/sample|preview|first look/.test(t)?'prima prezentare publica':/pre order|preorder/.test(t)?'precomanda anuntata':'anunt public',signalKind:'dated-pre-market-signal',confidenceTier:'public-signal'};
  if(/launches|launched|released|available now|new arrival|introduces|introduced/.test(t))return{window:'after',stage:'REPORTED_RELEASE',stageLabel:'lansare relatata public',signalKind:'reported-release',confidenceTier:'reported'};
  return{window:'after',stage:'FIRST_PUBLIC',stageLabel:'aparitie publica datata',signalKind:'dated-public-coverage',confidenceTier:'public-signal'};
}

const TIER_RANK={confirmed:3,reported:2,'public-signal':1};
function absorbEvent(existing,event){
  const sources=new Map((existing.sources||[]).map(function(source){return[source.url,source]}));for(const source of event.sources||[])sources.set(source.url,source);existing.sources=Array.from(sources.values());existing.sourceCount=existing.sources.length;existing.eligibleSources=unique(existing.sources.filter(function(source){return source.decisionEligible}).map(function(source){return source.sourceType})).length;existing.lastSeenAt=event.lastSeenAt;
  const earliest=Math.min(Date.parse(existing.firstPublicEvidenceAt||existing.eventDate),Date.parse(event.firstPublicEvidenceAt||event.eventDate));if(Number.isFinite(earliest))existing.firstPublicEvidenceAt=new Date(earliest).toISOString();
  const incomingRank=TIER_RANK[event.confidenceTier]||0,currentRank=TIER_RANK[existing.confidenceTier]||0;
  if(incomingRank>currentRank)Object.assign(existing,{eventDate:event.eventDate,stage:event.stage,stageLabel:event.stageLabel,signalKind:event.signalKind,confidenceTier:event.confidenceTier,dateConfidence:event.dateConfidence,stageEvidenceAt:event.eventDate});
  else if(incomingRank===currentRank&&Date.parse(event.eventDate)<Date.parse(existing.stageEvidenceAt||existing.eventDate))Object.assign(existing,{eventDate:event.eventDate,stage:event.stage,stageLabel:event.stageLabel,signalKind:event.signalKind,dateConfidence:event.dateConfidence,stageEvidenceAt:event.eventDate});
  return existing;
}
function mergeProduct(target,event){
  target.products=Array.isArray(target.products)?target.products:[];
  const key=candidateKey(event)+'|'+event.window,existing=target.products.find(function(row){return candidateKey(row)+'|'+row.window===key});
  if(!existing){event.id=hash(key);event.stageEvidenceAt=event.stageEvidenceAt||event.eventDate;target.products.push(event);return true}
  absorbEvent(existing,event);return false;
}

function removeOwnedSignals(target){
  target.products=(target.products||[]).map(function(row){
    const sources=(row.sources||[]).filter(function(source){return source.sourceType!=='dated-publication'&&source.collector!=='dated-publication'});
    if(sources.length===row.sources?.length)return row;
    return{...row,sources,sourceCount:sources.length,eligibleSources:unique(sources.filter(function(source){return source.decisionEligible}).map(function(source){return source.sourceType})) .length};
  }).filter(function(row){return (row.sources||[]).length||!['news-publication-date','dated-public-evidence','official-product-published-at'].includes(row.dateConfidence)});
}

function finalize(target,stats){target.generatedAt=new Date().toISOString();target.truth={...(target.truth||{}),datedNewsProductSignals:true,newsPublicationDateIsPublicSignalNotAutomaticLaunchDate:true,officialProductPublicationIsDirectListingEvidence:true,headlineIdentityTakesPriorityOverCatalogGuessing:true};target.scan={...(target.scan||{}),datedNews:stats};target.products=(target.products||[]).filter(function(row){return row&&row.eventDate&&((row.window==='before'&&(inPast(row.eventDate,WINDOW_DAYS)||inFuture(row.eventDate,WINDOW_DAYS)))||(row.window==='after'&&inPast(row.eventDate,WINDOW_DAYS)))}).sort(function(a,b){return String(b.eventDate).localeCompare(String(a.eventDate))});const events=target.products.filter(function(row){return row.confidenceTier==='confirmed'||row.confidenceTier==='reported'||['explicit','catalog-published-at','official-product-published-at','release-observed','first-retail-observation'].includes(row.dateConfidence)}),signals=target.products.filter(function(row){return !events.includes(row)});target.summary={...(target.summary||{}),total:events.length,allConcrete:target.products.length,before:events.filter(function(row){return row.window==='before'}).length,after:events.filter(function(row){return row.window==='after'}).length,confirmed:events.filter(function(row){return row.confidenceTier==='confirmed'}).length,reported:events.filter(function(row){return row.confidenceTier!=='confirmed'}).length,publicSignals:signals.length}}

async function main(){
  const queries=buildQueries(),newsRuns=await pool(queries,8,collectQuery),wpRuns=await pool(WP_SOURCES,6,collectWpSource),runs=newsRuns.concat(wpRuns),rows=Array.from(new Map(runs.flatMap(function(run){return run.rows||[]}).filter(function(row){return inPast(row.publishedAt)}).map(function(row){return[row.query.category+'|'+row.url,row]})).values()),candidates=candidateUniverse(),signals=[],rejected=[];
  for(const row of rows){
    if(/^(?:the\s+)?(?:\d+\s+)?best\b|\btop\s+\d+\b|buying guide|ranked picks/i.test(row.headline)){rejected.push({headline:row.headline,source:row.sourceName,publishedAt:row.publishedAt,reason:'generic-listicle-not-product-event'});continue}
    if((accessory(row.headline)&&!classifyRtaAccessory(row.headline))||nonTargetDevice(row.headline)){rejected.push({headline:row.headline,source:row.sourceName,publishedAt:row.publishedAt,reason:'non-target-accessory-liquid-or-disposable'});continue}
    const context=[row.sourceName||'',row.headline,row.description||'',row.url||''].join(' '),identityContext=[row.sourceName||'',row.headline,row.url||''].join(' '),fallbackClass=strictClassify(identityContext,row.query.category,true,{identity:row.headline,url:row.url,isProductListing:row.isProductListing}),names=fallbackClass?extractedNames(row.headline,fallbackClass,{url:row.url}):[],products=[];
    for(const extracted of names){
      const name=extracted.name,classification=extracted.classification;if(!classification)continue;
      const exact=exactCandidate(name,classification,candidates),officialBrand=row.sourceType==='manufacturer-official'?row.sourceName:'',productName=name;
      products.push({productName,brand:classification.brand||recognizedBrand(name)||exact&&exact.brand||officialBrand||'',category:classification.category,segment:classification.segment||exact&&exact.segment||null,typology:classification.typology||exact&&exact.typology||null});
    }
    if(!products.length){rejected.push({headline:row.headline,source:row.sourceName,publishedAt:row.publishedAt,reason:'no-concrete-product-identity'});continue}
    const stage=eventType(row);
    for(const product of products){
      const dateConfidence=row.isProductListing?(row.sourceType==='manufacturer-official'?'official-product-published-at':'catalog-published-at'):'dated-public-evidence',sourceType=row.sourceType||'dated-publication',dateQuality=row.directDateQuality||'google-news-rss-pubdate',evidence={host:(row.sourceUrl||'').replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,''),url:row.url,title:row.title,sourceName:row.sourceName,sourceUrl:row.sourceUrl,sourceType,collector:'dated-publication',decisionEligible:true,discoveryOnly:false,evidenceScope:row.isProductListing?(row.sourceType==='manufacturer-official'?'official-product-listing':'catalog-publication-date'):'dated-public-coverage',eventDate:row.publishedAt,dateConfidence,dateQuality,stage:stage.stageLabel,observedAt:new Date().toISOString()};
      signals.push({productName:product.productName,brand:product.brand||'',category:product.category,segment:product.segment||null,typology:product.typology||null,...stage,eventDate:row.publishedAt,stageEvidenceAt:row.publishedAt,firstPublicEvidenceAt:row.publishedAt,dateConfidence,firstSeenAt:new Date().toISOString(),lastSeenAt:new Date().toISOString(),ageHours:Number(((REF-Date.parse(row.publishedAt))/36e5).toFixed(1)),sourceCount:1,eligibleSources:1,sources:[evidence]});
    }
  }
  const grouped=new Map();for(const signal of signals){const key=candidateKey(signal)+'|'+signal.window,old=grouped.get(key);if(!old){signal.stageEvidenceAt=signal.eventDate;grouped.set(key,signal);continue}absorbEvent(old,signal)}
  const rta=read(RTA_FILE,{products:[]}),pods=read(POD_FILE,{products:[]});removeOwnedSignals(rta);removeOwnedSignals(pods);let rtaAdded=0,podsAdded=0;for(const event of grouped.values()){if(event.category==='POD'){if(mergeProduct(pods,event))podsAdded++}else if(mergeProduct(rta,event))rtaAdded++}
  const stats={newsQueries:queries.length,newsQueriesWorking:newsRuns.filter(function(run){return run.ok}).length,wordpressSources:WP_SOURCES.length,wordpressSourcesWorking:wpRuns.filter(function(run){return run.ok}).length,wordpressRequestsWorking:wpRuns.reduce(function(sum,run){return sum+Number(run.requestsWorking||0)},0),datedItems:rows.length,concreteSignals:grouped.size,rejected:rejected.length,rtaModAdded:rtaAdded,podsAdded};finalize(rta,stats);finalize(pods,stats);
  const counts=Array.from(grouped.values()).reduce(function(acc,row){acc[row.category]=(acc[row.category]||0)+1;return acc},{}),output={schemaVersion:3,generatedAt:new Date().toISOString(),snapshotReferenceAt:new Date(REF).toISOString(),windowDays:WINDOW_DAYS,truth:{publicationDateIsDirectlyProvidedByGoogleNewsFeed:true,wordpressPublicationDateIsDirectSourceData:true,articleDateIsPublicSignalNotAutomaticProductLaunch:true,officialProductDateIsListingEvidence:true,concreteProductIdentityRequired:true,headlineIdentityTakesPriority:true,rtaAccessoriesClassifiedSeparately:true},scan:stats,summary:{signals:grouped.size,RTA:counts.RTA||0,MODURI:counts.MODURI||0,ACCESORII:counts.ACCESORII||0,POD:counts.POD||0,rejected:rejected.length},signals:Array.from(grouped.values()).sort(function(a,b){return String(b.eventDate).localeCompare(String(a.eventDate))}),rejectedSample:rejected.slice(0,120),queryRuns:runs.map(function(run){return{category:run.meta.category,query:run.meta.query,ok:run.ok,items:run.rows.length,error:run.error||null}})};
  if(WRITE){save(RTA_FILE,rta);save(POD_FILE,pods);save(OUT_FILE,output)}else console.log(JSON.stringify(output,null,2));
  console.log(`Dated publications: news ${stats.newsQueriesWorking}/${stats.newsQueries}; WordPress ${stats.wordpressSourcesWorking}/${stats.wordpressSources}; ${stats.datedItems} dated items; concrete RTA ${counts.RTA||0}; MODURI ${counts.MODURI||0}; ACCESORII ${counts.ACCESORII||0}; POD ${counts.POD||0}; rejected ${rejected.length}.`);
}

main().catch(function(error){console.error(error&&error.stack||error);process.exit(1)});
