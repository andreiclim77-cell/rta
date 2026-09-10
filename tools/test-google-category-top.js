#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const core=require('../assets/market-google-pod-top20-core');
const proof=require('../assets/market-google-pod-top20-proof');
const collector=require('./collect-google-category-top');
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name)}
function series(base=100){const names=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];return Array.from({length:12},(_,i)=>{const d=new Date(Date.UTC(2025,7+i,1));return{year:d.getUTCFullYear(),month:names[d.getUTCMonth()],monthlySearches:String(base+i)}})}
const models=Array.from({length:12},(_,i)=>({id:'test|fixture '+i,brand:'TEST',model:'Fixture '+i,query:'TEST Fixture '+i}));
models.forEach(m=>m.id=core.norm(m.brand)+'|'+core.norm(m.model));
const response={results:models.map((m,i)=>({text:m.query,closeVariants:[],keywordMetrics:{avgMonthlySearches:String(500-i*10),monthlySearchVolumes:series(100+i)}}))};
const meta={collected_at:'2026-09-06T12:00:00.000Z',geo_target:'geoTargetConstants/2642',response_sha256:'a'.repeat(64),required_count:10,title:'TEST Top 10',category:'RTA'};
test('generic core accepts a Top 10 requirement',()=>{const d=core.project(models,response,meta),v=core.validate(d,Date.parse(meta.collected_at));assert.equal(d.required_count,10);assert.equal(d.status,'verified');assert.equal(v.verified,true);assert.equal(v.rows.length,10)});
test('generic core never pads a Top 10',()=>{const d=core.project(models.slice(0,9),{results:response.results.slice(0,9)},meta);assert.equal(d.status,'insufficient_data');assert.deepEqual(d.rows,[])});
test('POD default remains Top 20 compatible',()=>{assert.equal(core.requiredCount({}),20)});
const rows={products:[
 {category:'RTA',inRomanianMarket:true,product:'TEST Alpha RTA',brand:'TEST'},
 {category:'RTA',inRomanianMarket:true,product:'TEST Alpha replacement glass',brand:'TEST'},
 {category:'RTA',inRomanianMarket:false,product:'TEST Export RTA',brand:'TEST'},
 {category:'mod',inRomanianMarket:true,product:'TEST Beta Mod',brand:'TEST'},
 {category:'mod',inRomanianMarket:true,product:'TEST Beta battery door',brand:'TEST'}
]};
const canon=p=>({brand:p.brand,model:p.product.replace(/^TEST\s+/,'').replace(/\b(?:RTA|Mod)\b/gi,'').trim(),rawProduct:p.product}),usable=()=>true;
test('RTA candidate filter is category-specific and excludes spares',()=>{const got=collector.candidates(rows,canon,usable,collector.CONFIG.rta);assert.equal(got.length,1);assert.equal(got[0].brand,'TEST');assert.match(got[0].model,/Alpha/)});
test('MOD candidate filter is category-specific and excludes accessories',()=>{const got=collector.candidates(rows,canon,usable,collector.CONFIG.mod);assert.equal(got.length,1);assert.match(got[0].model,/Beta/)});
test('category public adapter preserves Top 10 identity',()=>{const internal=core.project(models,response,{...meta,response_sha256:'b'.repeat(64)}),out=collector.toPublic(internal,'b'.repeat(64),collector.CONFIG.rta);assert.equal(out.schema_version,1);assert.equal(out.category,'RTA');assert.equal(out.required_count,10);assert.match(out.source.evidence_file,/^\/data\/google-rta-evidence\/api-/)});
function verifyFile(kind,file,dir,category){
  if(!fs.existsSync(file)){console.log('SKIP '+kind+' production file not created yet');return}
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  if(data.status!=='verified'){assert.deepEqual(data.rows,[]);console.log('INFO '+kind+' not published: '+data.status);return}
  assert.equal(data.required_count,10);assert.equal(data.category,category);assert(data.rows.length>=10);assert.equal(data.validation.verified,true);assert.match(data.source.evidence_file,new RegExp('^/data/'+dir+'/api-[a-zA-Z0-9_-]+\\.json$'));
  const path=data.source.evidence_file.slice(1),bytes=fs.readFileSync(path),evidence=JSON.parse(bytes.toString('utf8'));assert.equal(digest(bytes),data.source.evidence_sha256);const checked=proof.verify(data,evidence,Date.parse(data.last_checked));assert.equal(checked.ok,true,checked.errors&&checked.errors.join(','));assert.equal(checked.required_count,10);passed++;console.log('PASS '+kind+' published evidence reconciliation ('+data.rows.length+' measured models)');
}
verifyFile('RTA','data/google-rta-top10-2026.json','google-rta-evidence','RTA');
verifyFile('MOD','data/google-mod-top10-2026.json','google-mod-evidence','mod');
console.log('Google category Top 10 checks: '+passed+' passed.');
