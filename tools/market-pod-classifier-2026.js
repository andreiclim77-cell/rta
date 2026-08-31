#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const REGISTRY_PATH=path.join(__dirname,'..','data','market-pod-universe-2026.json');

function decode(value){
  return String(value||'')
    .replace(/<script\b[\s\S]*?<\/script>/gi,' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' ')
    .replace(/&#(\d+);/g,function(_,n){try{return String.fromCodePoint(Number(n))}catch(_){return' '}})
    .replace(/&#x([0-9a-f]+);/gi,function(_,n){try{return String.fromCodePoint(parseInt(n,16))}catch(_){return' '}})
    .replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&apos;|&#39;/gi,"'").replace(/&nbsp;/gi,' ')
    .replace(/\s+/g,' ').trim();
}

function norm(value){
  return decode(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}

function registry(){
  return JSON.parse(fs.readFileSync(REGISTRY_PATH,'utf8'));
}

function phraseHit(text,phrase){
  const hay=' '+norm(text)+' ',needle=' '+norm(phrase)+' ';
  return needle.trim().length>=2&&hay.includes(needle);
}

function makerFor(text,reg=registry()){
  const ranked=[];
  const ambiguousSeries=new Set(['a','g','air','drop','shine','pro','play','mark','one','sense','soul','crown','drag','novo','nord']);
  for(const maker of reg.makers||[]){
    const brands=[maker.name].concat(maker.aliases||[]),seriesNames=maker.series||[];
    let score=0,series='',brandMatched=false;
    for(const name of brands){
      if(!phraseHit(text,name))continue;
      brandMatched=true;
      score=Math.max(score,Math.max(5,norm(name).length/2));
    }
    for(const name of seriesNames){
      if(!phraseHit(text,name))continue;
      if(!brandMatched&&ambiguousSeries.has(norm(name)))continue;
      const weight=Math.max(12,norm(name).length);
      if(weight>score){score=weight;series=name}
    }
    if(score>0)ranked.push({maker,series,score,brandMatched});
  }
  ranked.sort(function(a,b){return Number(b.brandMatched)-Number(a.brandMatched)||b.score-a.score});
  return ranked[0]||null;
}

function accessoryOnly(text){
  const t=norm(text);
  const accessory=/\b(?:replacement|rezerva|rezervor|cartus|cartridge|cartridges|empty pod|replacement pod|pod cartridge|pod pack|pods pack|coil|coils|rezistenta|rezistente|mesh coil|coil head|drip tip|mouthpiece|case|lanyard|skin|silicone|protective|charging cable|usb cable)\b/.test(t);
  const device=/\b(?:device|kit|starter kit|pod system|pod mod|pod kit|battery|baterie|aio|all in one)\b/.test(t);
  return accessory&&!device;
}

function classifyPodProduct(title,hint,reg=registry()){
  const text=decode([title,hint].filter(Boolean).join(' '));
  const t=norm(text);
  if(!t||t.length<3||accessoryOnly(text))return null;
  if(/\b(?:charging device|charging dock|power bank|charger only|battery charger)\b/.test(t))return null;
  if(/\bdisposable\b/.test(t)&&!/\b(?:replaceable pod|refillable pod|pod system|pod kit)\b/.test(t))return null;
  const match=makerFor(text,reg);
  const generic=/\b(?:pod system|pod kit|pod mod|open pod|closed pod|prefilled pod|pre filled pod|refillable pod|aio pod|all in one pod)\b/.test(t),podContext=generic||/\bpod\b/.test(t);
  if(/\b(?:rta|rda|rdta)\b/.test(t)&&!generic&&!/\bpod\b/.test(t))return null;
  if(!match&&!generic)return null;
  if(match&&match.series&&!match.brandMatched&&!generic&&!/\b(?:pod|vape|vaping|device|kit|starter)\b/.test(t))return null;
  if(match&&!match.series&&!generic&&!/\bpod\b/.test(t))return null;
  let maker=match&&match.maker||null;
  if(match&&match.series&&!match.brandMatched){
    const before=t.split(norm(match.series))[0].trim(),harmless=/^(?:new|authentic|official|the)?$/.test(before);
    if(before&&!harmless){
      if(!podContext)return null;
      maker=null;
    }
  }
  const segment=maker&&maker.segment||'mass-market-open-pod';
  const typology=segment==='closed-prefilled-hybrid'?'closed / pre-filled / hybrid':segment==='premium-high-end-aio'?'premium / high-end / AIO':segment==='mid-tier-regional'?'open-pod / pod-mod regional':'open-pod / pod-mod';
  return{
    category:'POD',
    segment,
    typology,
    brand:maker&&maker.name||'',
    series:match&&match.series||'',
    confidence:match&&match.series&&match.brandMatched?'brand-series-match':match&&match.series&&maker?'series-context-match':podContext&&maker?'brand-and-pod':'generic-pod-device'
  };
}

function searchTerms(limit=28,reg=registry()){
  const priority=['pod system','pod kit','XROS','Caliburn','Xlim','Argus','Vinci','Wenax','Novo','Nord','RPM','Ursa','Orion','Gotek','Klypse','Flexus','Eco Nano','VMATE','Sonder','LUXE','Trine','dotPod','Lightsaber','Elfa','VEEV','RELX','KIWI'];
  const all=priority.concat((reg.makers||[]).flatMap(function(m){return(m.series||[]).slice(0,2)}));
  return Array.from(new Set(all.map(function(x){return String(x).trim()}).filter(Boolean))).slice(0,Math.max(1,limit));
}

if(require.main===module){
  const samples=process.argv.slice(2);
  for(const sample of samples)console.log(JSON.stringify({sample,result:classifyPodProduct(sample)},null,2));
}

module.exports={REGISTRY_PATH,decode,norm,registry,makerFor,accessoryOnly,classifyPodProduct,searchTerms};
