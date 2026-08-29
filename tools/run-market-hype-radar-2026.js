#!/usr/bin/env node
'use strict';

const {spawn}=require('child_process');
const path=require('path');

const child=spawn(process.execPath,[path.join(__dirname,'collect-market-hype-radar-2026.js'),...process.argv.slice(2)],{
  stdio:['ignore','pipe','inherit'],
  env:process.env
});

let completed=false,tail='';
const hard=setTimeout(()=>{
  if(child.exitCode===null){
    console.error('Strict Hype collector exceeded runner hard limit.');
    child.kill('SIGKILL');
  }
},12*60*1000);

child.stdout.on('data',chunk=>{
  process.stdout.write(chunk);
  tail=(tail+chunk.toString('utf8')).slice(-12000);
  if(!completed&&tail.includes('Hype Radar v3:')){
    completed=true;
    setTimeout(()=>{if(child.exitCode===null)child.kill('SIGTERM')},750);
  }
});

child.on('error',err=>{
  clearTimeout(hard);
  console.error(err&&err.stack||err);
  process.exit(1);
});

child.on('exit',(code,signal)=>{
  clearTimeout(hard);
  if(completed&&(code===0||signal==='SIGTERM'))process.exit(0);
  process.exit(Number.isInteger(code)?code:1);
});
