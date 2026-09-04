#!/usr/bin/env node
'use strict';

const {canonicalProductFamily}=require('./market-product-canonical-2026.js');
const {classifyPodProduct}=require('./market-pod-classifier-2026.js');

function norm(value){
  return String(value||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ')
    .replace(/\s+/g,' ').trim();
}

const POD_VARIANT_TOKENS=new Set([
  'pro','max','mini','nano','go','sq','ultra','plus','prime','baby','explorer',
  'a','g','ii','iii','iv'
]);

function podSeriesVariant(title,series){
  const titleTokens=norm(title).split(' ').filter(Boolean);
  const seriesTokens=norm(series).split(' ').filter(Boolean);
  if(!seriesTokens.length)return norm(title);
  let start=-1;
  for(let index=0;index<=titleTokens.length-seriesTokens.length;index+=1){
    if(seriesTokens.every((token,offset)=>titleTokens[index+offset]===token)){
      start=index;
      break;
    }
  }
  if(start<0)return norm(series);
  const output=seriesTokens.slice();
  for(const token of titleTokens.slice(start+seriesTokens.length,start+seriesTokens.length+3)){
    const isVersion=/^(?:v\d{1,2}|\d{1,2}|[ivx]{1,4})$/.test(token);
    if(POD_VARIANT_TOKENS.has(token)||isVersion)output.push(token);
    else break;
  }
  return output.join(' ');
}

function verificationFamilyKey(candidate,defaultCategory){
  const productName=candidate&&candidate.productName||candidate&&candidate.product||'';
  const brand=candidate&&candidate.brand||candidate&&candidate.maker||'';
  const category=candidate&&candidate.category||defaultCategory;
  if(category==='POD'||defaultCategory==='POD'){
    const classification=classifyPodProduct(productName,brand);
    if(classification&&classification.series){
      return ['POD','AUTHENTIC',norm(classification.brand||brand),podSeriesVariant(productName,classification.series)]
        .filter(Boolean).join('|');
    }
  }
  return canonicalProductFamily({productName,brand,category}).key;
}

module.exports={norm,podSeriesVariant,verificationFamilyKey};
