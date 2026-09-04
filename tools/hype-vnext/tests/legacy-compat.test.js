#!/usr/bin/env node
'use strict';

const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {LEGACY_PROJECTIONS}=require('../projectors/legacy-compat.js');
const {build,stableText}=require('../build-phase1.js');

const ROOT=path.resolve(__dirname,'..','..','..'),OUTPUT=path.join(ROOT,'data','hype-vnext');
let assertions=0;
function check(condition,message){assertions++;assert.ok(condition,message)}

function main(){
  for(const [target,source] of Object.entries(LEGACY_PROJECTIONS)){
    const sourceRaw=fs.readFileSync(path.join(ROOT,...source.split('/')),'utf8').replace(/\r\n/g,'\n'),targetRaw=fs.readFileSync(path.join(OUTPUT,...target.split('/')),'utf8').replace(/\r\n/g,'\n');
    check(targetRaw===sourceRaw,`${target} is not byte-compatible with ${source}`);assert.deepStrictEqual(JSON.parse(targetRaw),JSON.parse(sourceRaw),`${target} is not data compatible with ${source}`);assertions++;
  }
  const fresh=build();for(const [file,document] of Object.entries(fresh.documents)){const committed=fs.readFileSync(path.join(OUTPUT,...file.split('/')),'utf8').replace(/\r\n/g,'\n');check(committed===stableText(document),`${file} drifted from deterministic Phase 1 build`)}
  console.log(`HYPE vNext Phase 1 legacy compatibility PASS: ${assertions} assertions; current UI inputs remain byte-identical.`);
}

try{main()}catch(error){console.error(error.stack||error);process.exit(1)}
