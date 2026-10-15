'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve('rta-lab/atlas-preview'),env={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'photo-sources.js'),'utf8'),env);
const records=Object.entries(env.window.RTA_ATLAS_PHOTOS),result={},failures=[];
async function cache([id,r]){
 try{
  let bytes,src;
  if(r.fallbackRef&&r.fallbackSrc){src=r.fallbackSrc;bytes=fs.readFileSync(path.resolve(root,src));}
  else if(!/^https:/.test(r.src)){src=r.src;bytes=fs.readFileSync(path.resolve(root,src));}
  else{
   const response=await fetch(r.src,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw new Error('HTTP '+response.status);
   bytes=Buffer.from(await response.arrayBuffer());const mime=response.headers.get('content-type')||'';
   if(!mime.startsWith('image/'))throw new Error('Not an image: '+mime);
   const extension=bytes[0]===0x89&&bytes[1]===0x50?'png':bytes[0]===0xff&&bytes[1]===0xd8?'jpg':bytes.subarray(8,12).toString()==='WEBP'?'webp':null;
   if(!extension)throw new Error('Unrecognized image signature');
   src='./media/'+id+'-product.'+extension;fs.writeFileSync(path.resolve(root,src),bytes);
  }
  result[id]={src,original:r.src,ref:r.ref,credit:r.credit,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length,provenance:r.src.startsWith('https:')?'exact-source-copy':'existing-project-image'};
  console.log(id+' '+bytes.length+' bytes '+result[id].provenance);
 }catch(error){failures.push({id,error:error.message});console.error(id+': '+error.message);}
}
async function main(){
 for(let i=0;i<records.length;i+=3)await Promise.all(records.slice(i,i+3).map(cache));
 fs.writeFileSync(path.join(root,'local-photos.js'),'/* Unedited source copies. No claim of redistribution permission or exact personal finish. */\nwindow.RTA_ATLAS_LOCAL_PHOTOS='+JSON.stringify(result,null,2)+';\n');
 fs.writeFileSync(path.join(root,'media','PRODUCT_PHOTO_RECEIPT.json'),JSON.stringify({accessed:'2026-10-14',records:result,failures},null,2)+'\n');
 if(failures.length)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
