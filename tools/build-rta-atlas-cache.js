'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function renderCache(folder='rta-lab/atlas-preview'){
const root=path.resolve(folder);
if(!['rta-lab/atlas-preview','rta-lab/atlas'].some(p=>path.resolve(p)===root))throw new Error('Unexpected Atlas cache target');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=new Set(['./index.html','./','./manifest.webmanifest','../icon-192.png','./icon.svg','../../assets/fonts/manrope-latin.woff2','../../assets/fonts/manrope-latin-ext.woff2']);
for(const match of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css)(?:\?[^"#]*)?)"/g))files.add(match[1]);
for(const file of fs.readdirSync(path.join(root,'media')))if(/\.(jpg|png|webp)$/.test(file))files.add('./media/'+file);
for(const file of fs.readdirSync(path.join(root,'media/fonts')))if(/\.(ttf|woff2)$/.test(file))files.add('./media/fonts/'+file);
files.add('../../assets/instagram/atomizer-asylum-rta-v3-yg-creations-c41adc2e42.jpg');
const hash=crypto.createHash('sha256');
for(const file of [...files].sort()){const clean=file.split('?')[0];if(clean==='./')continue;hash.update(file);const bytes=fs.readFileSync(path.resolve(root,clean));hash.update(/\.(js|css|html|svg|webmanifest)$/.test(clean)?bytes.toString('utf8').replaceAll('\r\n','\n'):bytes);}
const revision=hash.digest('hex').slice(0,16),prefix='rta-atlas-'+(path.basename(root)==='atlas'?'release':'preview')+'-',template=`/* Atlas-only scope/cache. V10 data, local storage and other cache owners are preserved. */
const CACHE=${JSON.stringify(prefix+revision)},PREFIX=${JSON.stringify(prefix)};
const ASSETS=${JSON.stringify([...files].sort(),null,2)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',e=>{
 const request=e.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
 e.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());else return (await cache.match(request))||response;return response;}catch(error){const found=await cache.match(request);if(found)return found;if(request.mode==='navigate'&&url.pathname.startsWith(new URL('./',self.location.href).pathname))return (await cache.match('./index.html'))||Response.error();return Response.error();}})());
});
`;
return {source:template,root,revision,count:files.size};
}
module.exports=renderCache;
if(require.main===module){const result=renderCache(process.argv.slice(2).find(a=>a!=='--check'));
 if(process.argv.includes('--check')){if(fs.readFileSync(path.join(result.root,'sw.js'),'utf8').replaceAll('\r\n','\n')!==result.source.replaceAll('\r\n','\n'))throw new Error('Atlas cache manifest is stale');}
 else fs.writeFileSync(path.join(result.root,'sw.js'),result.source);
 console.log('Atlas cache manifest: '+result.count+' assets, revision '+result.revision+'; only its own route cache prefix is cleaned.');
}
