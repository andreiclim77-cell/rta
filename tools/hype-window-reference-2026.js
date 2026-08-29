#!/usr/bin/env node
'use strict';

const TZ='Europe/Bucharest';

function parts(ms){
  const fmt=new Intl.DateTimeFormat('en-CA',{
    timeZone:TZ,
    year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',second:'2-digit',
    hourCycle:'h23'
  });
  const out={};
  for(const p of fmt.formatToParts(new Date(ms))){
    if(p.type!=='literal') out[p.type]=Number(p.value);
  }
  return out;
}

function offsetAt(ms){
  const p=parts(ms);
  const asUtc=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);
  return asUtc-ms;
}

function zonedLocalToUtc(y,m,d,h=0,min=0,s=0){
  const naive=Date.UTC(y,m-1,d,h,min,s);
  let guess=naive-offsetAt(naive);
  const second=naive-offsetAt(guess);
  if(Math.abs(second-guess)>1000) guess=second;
  return guess;
}

function previousCalendarDate(y,m,d){
  const x=new Date(Date.UTC(y,m-1,d)-86400000);
  return {year:x.getUTCFullYear(),month:x.getUTCMonth()+1,day:x.getUTCDate()};
}

function snapshotReferenceMs(nowMs=Date.now()){
  const p=parts(nowMs);
  let ref=zonedLocalToUtc(p.year,p.month,p.day,6,0,0);
  if(nowMs<ref){
    const q=previousCalendarDate(p.year,p.month,p.day);
    ref=zonedLocalToUtc(q.year,q.month,q.day,6,0,0);
  }
  return ref;
}

function parseMs(v){
  const x=Date.parse(String(v||''));
  return Number.isFinite(x)?x:null;
}

function windowAgeHours(v,refMs=snapshotReferenceMs()){
  const x=parseMs(v);
  return x==null?null:(refMs-x)/36e5;
}

function inPastWindow(v,hours=720,refMs=snapshotReferenceMs()){
  const a=windowAgeHours(v,refMs);
  return a!=null&&a>=0&&a<=hours;
}

function futureWithin(v,days=365,refMs=snapshotReferenceMs()){
  const x=parseMs(v);
  return x!=null&&x>refMs&&x-refMs<=days*24*36e5;
}

function referenceIso(nowMs=Date.now()){
  return new Date(snapshotReferenceMs(nowMs)).toISOString();
}

if(require.main===module){
  console.log(JSON.stringify({
    timezone:TZ,
    reference:referenceIso(),
    now:new Date().toISOString()
  },null,2));
}

module.exports={TZ,parts,zonedLocalToUtc,snapshotReferenceMs,windowAgeHours,inPastWindow,futureWithin,referenceIso};
