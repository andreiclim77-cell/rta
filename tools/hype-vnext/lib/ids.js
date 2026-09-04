#!/usr/bin/env node
'use strict';

const crypto=require('crypto');

const PREFIX={
  product:'pr',source:'so',endpoint:'ep',scan:'sc',evidence:'ev',lineage:'ln',event:'et',claim:'cl',projection:'pj'
};

function decode(value){
  return String(value||'')
    .replace(/&#(\d+);/g,(_,number)=>String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi,(_,number)=>String.fromCodePoint(parseInt(number,16)))
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&apos;|&#39;/gi,"'")
    .replace(/&nbsp;|&#x20;|&#32;/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
}

function normalizeText(value){
  return decode(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9+.-]+/g,' ').replace(/\s+/g,' ').trim();
}

function stableHash(value,length=24){
  return crypto.createHash('sha256').update(String(value||'')).digest('hex').slice(0,length);
}

function stableId(namespace,...parts){
  const prefix=PREFIX[namespace]||String(namespace||'id').replace(/[^a-z0-9]/gi,'').slice(0,3).toLowerCase()||'id';
  const identity=parts.map(part=>typeof part==='string'?normalizeText(part):JSON.stringify(stableJson(part))).filter(Boolean).join('|')||'unknown';
  return `${prefix}_${stableHash(identity)}`;
}

function canonicalUrl(value){
  try{
    const url=new URL(String(value||''));
    url.hash='';
    for(const key of [...url.searchParams.keys()])if(/^utm_|^(?:fbclid|gclid|ref|source)$/i.test(key))url.searchParams.delete(key);
    return url.toString().replace(/\/$/,'');
  }catch(_){return String(value||'').trim()}
}

function stableJson(value){
  if(Array.isArray(value))return value.map(stableJson);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableJson(value[key])]));
  return value;
}

module.exports={PREFIX,decode,normalizeText,stableHash,stableId,canonicalUrl,stableJson};
