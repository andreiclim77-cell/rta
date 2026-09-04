#!/usr/bin/env node
'use strict';

class JsonEvidenceStore{
  constructor(rows=[]){this.rows=new Map();for(const row of rows)this.append(row)}
  append(evidence){const previous=this.rows.get(evidence.id);if(previous&&JSON.stringify(previous)!==JSON.stringify(evidence))throw new Error(`Immutable evidence collision: ${evidence.id}`);this.rows.set(evidence.id,evidence);return evidence}
  findByProduct(productId){return this.all().filter(row=>row.productId===productId)}
  all(){return [...this.rows.values()].sort((a,b)=>a.id.localeCompare(b.id))}
}

module.exports={JsonEvidenceStore};
