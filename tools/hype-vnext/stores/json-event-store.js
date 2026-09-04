#!/usr/bin/env node
'use strict';

class JsonEventStore{
  constructor(rows=[]){this.rows=new Map();for(const row of rows)this.appendClaim(row)}
  appendClaim(claim){const previous=this.rows.get(claim.id);if(previous&&JSON.stringify(previous)!==JSON.stringify(claim))throw new Error(`Immutable event claim collision: ${claim.id}`);this.rows.set(claim.id,claim);return claim}
  findByProduct(productId){return this.all().filter(row=>row.productId===productId)}
  all(){return [...this.rows.values()].sort((a,b)=>a.id.localeCompare(b.id))}
}

module.exports={JsonEventStore};
