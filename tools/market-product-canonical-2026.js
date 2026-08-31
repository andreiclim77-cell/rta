#!/usr/bin/env node
'use strict';
const BRAND_ALIASES=[
  [/\bcoil\s*turd\b|\bcoilturd\b/i,'CoilTurd'],[/\bthunder\s*cloud\b/i,'ThunderCloud'],[/\bmech\s*vape\b|\bmechvape\b/i,'MechVape'],
  [/\bvaporesso\b/i,'Vaporesso'],[/\bvoopoo\b/i,'Voopoo'],[/\boxva\b/i,'OXVA'],[/\buwell\b/i,'Uwell'],[/\bsmok(?:tech)?\b/i,'SMOK'],[/\bfreemax\b/i,'FreeMax'],[/\beleaf\b/i,'Eleaf'],[/\binnokin\b/i,'Innokin'],[/\bsmoant\b/i,'Smoant'],[/\bdot\s*mod\b|\bdotmod\b/i,'DotMod'],[/\bivg\b/i,'IVG'],
  [/\bsxk\b/i,'SXK'],[/\byftk\b/i,'YFTK'],[/\bul?ton\b/i,'Ulton'],[/\bkindbright\b/i,'Kindbright'],[/\bshenray\b/i,'ShenRay'],[/\breka\s*vape\b|\brekavape\b/i,'RekaVape'],
  [/\bsvoe?mesto\b|\bsvoemesto\b/i,'SvoëMesto'],[/\bvandy\s*vape\b|\bvandyvape\b/i,'Vandy Vape'],[/\bkhw\s*mods?\b/i,'KHW Mods'],[/\bbp\s*mods?\b/i,'BP Mods'],[/\bambition\s*mods?\b/i,'Ambition Mods'],[/\barcana\s*mods?\b/i,'Arcana Mods'],[/\bennequadro(?:\s*mods?)?\b/i,'Ennequadro Mods'],[/\bcentenary\s*mods?\b/i,'Centenary Mods'],[/\bsteam\s*crave\b/i,'Steam Crave'],[/\bthe\s*vaping\s*gentlemen\s*club\b/i,'The Vaping Gentlemen Club'],[/\bla\s*tabaccheria\b/i,'La Tabaccheria'],[/\bwick\s*n\s*vape\b/i,'Wick N Vape'],[/\bgeek\s*vape\b|\bgeekvape\b/i,'Geekvape'],[/\blost\s*vape\b/i,'Lost Vape'],[/\byacht\s*vape\b|\byachtvape\b/i,'Yachtvape'],[/\bvape\s*fly\b|\bvapefly\b/i,'Vapefly'],[/\bfour\s*one\s*five\b|\b415\s*rta\b/i,'Four One Five'],[/\btaifun\b/i,'Taifun'],[/\bauguse\b/i,'Auguse'],[/\baspire\b/i,'Aspire'],[/\bcthulhu\b/i,'Cthulhu'],[/\bhellvape\b/i,'Hellvape'],[/\binnokin\b/i,'Innokin'],[/\bvoopoo\b/i,'Voopoo'],[/\bwotofo\b/i,'Wotofo'],[/\bdicodes\b/i,'Dicodes'],[/\byihi\b/i,'YiHi'],[/\be[h]?pro\b/i,'EHPro']
];
const COLOR_RE=/\b(?:black|matte black|gunmetal|silver|ss|stainless steel|steel|rainbow|purple|blue|red|green|gold|grey|gray|white|brushed|polished|dlc|ice blue|dark blue|carbon black|matte|satin)\b/gi;
function decode(v){
  return String(v||'')
    .replace(/&#(\d+);/g,(_,n)=>{try{return String.fromCodePoint(Number(n))}catch(e){return' '}})
    .replace(/&#x([0-9a-f]+);/gi,(_,n)=>{try{return String.fromCodePoint(parseInt(n,16))}catch(e){return' '}})
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&apos;|&#39;/gi,"'").replace(/&nbsp;/gi,' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')
    .replace(/^.*?\)\s*;\s*["']?\s*>\s*/,' ')
    .replace(/^(?:\d+\s+)?Custom\s+Vapes?\s+Atomizoare\s*>\s*Atomizoare\s+Servisabile\s*/i,' ')
    .replace(/\s+/g,' ').trim();
}
function norm(v){return decode(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function canonicalBrand(input,raw){const explicit=String(input||'').trim(),hay=decode((explicit?explicit+' ':'')+(raw||''));for(const [re,label] of BRAND_ALIASES)if(re.test(hay))return label;return explicit}
function stripBrand(text,brand){if(!brand)return text;const bt=norm(brand).split(' ').filter(Boolean),tokens=String(text||'').split(/\s+/);return tokens.filter(tok=>!bt.includes(norm(tok))).join(' ')}
function cleanModel(raw,brand){let s=decode(raw).replace(/[–—]/g,' - ').replace(/\b\d+(?:[.,]\d+)?\s*out of 5\s*\(\d+\)/gi,' ').replace(/\bSKU\s*:\s*[^,;|]+/gi,' ').replace(/\b(?:atomizor|atomizer|atomiser|clearomizor|clearomizer|rebuildable|tank)\b/gi,' ').replace(/\b(?:RTA|RBA|RDTA|RDA|MTL|RDL|DL)\b/gi,' ').replace(/\b(?:style|clone|authentic|vape|regulated|mechanical|side\s*by\s*side|box\s*mod|sbs\s*mod|squonk\s*mod|pod\s*mod\s*kit|pod\s*system\s*kit|pod\s*system|pod\s*kit|starter\s*kit|pre[- ]?filled|kit|sbs)\b/gi,' ').replace(/\b\d+(?:[.,]\d+)?\s*(?:ml|mm|w|mah)\b/gi,' ').replace(/\b(?:vw|tc)\b/gi,' ').replace(/\b(?:single|dual)\s+(?:18650|21700)\b/gi,' ').replace(/\b(?:18650|21700)(?:\s*\/\s*(?:18650|21700))?\b/gi,' ').replace(COLOR_RE,' ');s=stripBrand(s,brand);for(const entry of BRAND_ALIASES)s=s.replace(entry[0],' ');s=s.replace(/^\s*(?:x|by)\s+/i,' ');s=s.split(/\s[!|]\s|\s+-\s+(?=(?:poate|unul|una|produs|ideal|sku)\b)/i)[0];s=s.replace(/\bV\s*(\d+)\b/gi,'V$1').replace(/\bV\.\s*(\d+)\b/gi,'V$1').replace(/\s+/g,' ').replace(/^[\s,;:\-]+|[\s,;:\-]+$/g,'').trim();return s}
function canonicalizeProduct(row){const raw=String(row&&row.product||row&&row.name||'').trim();const brand=canonicalBrand(row&&row.brand,raw);let model=cleanModel(raw,brand);if(!model)model=raw;const key=(norm(brand)?norm(brand)+'|':'')+norm(model);const label=(brand?brand+' ':'')+model;return{key,label:label.replace(/\s+/g,' ').trim(),brand,model,rawProduct:raw}}
function retailerOperatorMap(reg){const m=new Map();for(const r of reg&&reg.retailers||[])m.set(r.id,r.operatorId||r.id);return m}
module.exports={norm,decode,canonicalBrand,canonicalizeProduct,retailerOperatorMap};
