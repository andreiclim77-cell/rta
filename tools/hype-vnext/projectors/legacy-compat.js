#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

const LEGACY_PROJECTIONS={
  'projections/legacy-products.json':'data/market-hype-products-2026.json',
  'projections/legacy-pods.json':'data/market-hype-pods-2026.json'
};

function buildLegacyProjections(root){
  return Object.fromEntries(Object.entries(LEGACY_PROJECTIONS).map(([target,source])=>{
    const raw=fs.readFileSync(path.join(root,...source.split('/')),'utf8');
    return[target,{source,raw,document:JSON.parse(raw)}];
  }));
}

module.exports={LEGACY_PROJECTIONS,buildLegacyProjections};
