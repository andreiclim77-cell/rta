'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const renderCache=require('./build-rta-atlas-cache');
const source=path.resolve('rta-lab/atlas-preview'),target=path.resolve('rta-lab/atlas'),check=process.argv.includes('--check');
assert.equal(path.dirname(target),path.dirname(source));assert.equal(path.basename(target),'atlas');
function inventory(root,prefix=''){
 return fs.readdirSync(path.join(root,prefix),{withFileTypes:true}).flatMap(e=>e.isDirectory()?inventory(root,path.join(prefix,e.name)):[path.join(prefix,e.name).replaceAll('\\','/')]).sort();
}
const files=new Map();
for(const relative of inventory(source)){
 if(relative==='sw.js')continue;
 let bytes=fs.readFileSync(path.join(source,relative));
 if(/\.(js|css|html|svg|webmanifest|json|md|txt)$/.test(relative))bytes=Buffer.from(bytes.toString('utf8').replaceAll('\r\n','\n'));
 if(relative==='index.html'){
  const html=bytes.toString('utf8').replace('Precision Motion Lab Preview','Precision Motion Lab')
   .replace('/ V0.2</span>','/ ATLAS</span>').replace('VERSIUNE CANDIDAT','COLECȚIA TA')
   .replace('aria-label="Navigare prototip"','aria-label="Navigare Atlas"')
   .replace('PREVIEW V0.2','PRECISION MOTION LAB')
   .replace('Concept interactiv pentru evaluarea designului. Nu înlocuiește aplicația actuală.','Sursele și limitele dovezilor sunt disponibile la fiecare rezultat.')
   .replace('Prototipul animat necesită JavaScript.','Atlas necesită JavaScript.');
  assert.ok(!/V0\.2|PREVIEW|VERSIUNE CANDIDAT/.test(html),'Release identity must not retain preview labels');
  bytes=Buffer.from(html);
 }
 files.set(relative,bytes);
}
const receipt={schema:1,source:'rta-lab/atlas-preview',route:'/rta-lab/atlas/',sharedEngine:'Existing ../data and ../mood-match.js; no copied or modified engine',files:Object.fromEntries([...files].map(([name,bytes])=>[name,crypto.createHash('sha256').update(bytes).digest('hex')]))};
files.set('ATLAS_RELEASE_RECEIPT.json',Buffer.from(JSON.stringify(receipt,null,2)+'\n'));
const protectedBefore=crypto.createHash('sha256').update(fs.readFileSync('rta-lab/index.html')).digest('hex');
for(const [name,bytes] of files){const output=path.resolve(target,name);assert.ok(output.startsWith(target+path.sep));
 if(check)assert.deepEqual(fs.readFileSync(output),bytes,'Generated release differs: '+name);
 else{fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,bytes);}
}
const cache=renderCache(target);
if(check){assert.equal(fs.readFileSync(path.join(target,'sw.js'),'utf8').replaceAll('\r\n','\n'),cache.source.replaceAll('\r\n','\n'),'Release cache stale');assert.equal(inventory(target).length,files.size+1,'Unexpected file in generated release');}
else fs.writeFileSync(path.join(target,'sw.js'),cache.source);
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('rta-lab/index.html')).digest('hex'),protectedBefore,'V10 entry must remain unchanged');
console.log('ATLAS RELEASE '+(check?'CHECK':'BUILD')+' PASS: '+(files.size+1)+' generated files, shared unchanged V10 data, separate route/cache.');
