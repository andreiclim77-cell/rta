'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{chromium}=require('playwright-core');
const root=path.resolve('.'),folder=path.resolve('artifacts/atlas-v02-mobile');fs.mkdirSync(folder,{recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');let name=url.pathname;if(name.endsWith('/'))name+='index.html';const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
const cases=[[320,740,0],[360,800,0],[390,844,0],[768,1024,0],[1440,1000,0],[360,800,18],[390,844,18],[320,740,24],[390,844,24],[844,390,18]];
async function stable(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>{const t=a.effect?.getTiming(),el=a.effect?.target;return t&&t.iterations!==Infinity&&t.duration<=1000&&el?.getClientRects().length&&!el.closest('details:not([open])');}).map(a=>a.finished.catch(()=>{})));await new Promise(resolve=>{let previous='',frames=0;const tick=()=>{const current=[scrollX,scrollY,visualViewport?.offsetTop,visualViewport?.offsetLeft,document.querySelector('.mast').getBoundingClientRect().height,document.querySelector('.bottom-tabs').getBoundingClientRect().height].join(',');frames=current===previous?frames+1:0;previous=current;if(frames>=10)resolve();else requestAnimationFrame(tick);};requestAnimationFrame(tick);});});}
async function align(page,selector){await page.locator(selector).first().evaluate(el=>scrollTo({top:Math.max(0,scrollY+el.getBoundingClientRect().top-document.querySelector('.mast').getBoundingClientRect().height-12),behavior:'instant'}));await stable(page);}
async function shot(page,name){await stable(page);await page.locator('.page:not([hidden]) img').evaluateAll(async imgs=>{for(const img of imgs){const b=img.getBoundingClientRect();if(b.top<innerHeight&&b.bottom>0&&!img.closest('details:not([open])'))await img.decode();}});await page.screenshot({path:path.join(folder,name)});}
async function fit(page,step){
 const issues=await page.evaluate(({width,height})=>{
  const found=[],eps=1.5,visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden',rect=e=>e.getBoundingClientRect(),describe=e=>e.id||e.className||e.tagName;
  if(document.documentElement.scrollWidth>innerWidth+1)found.push('page horizontal overflow');
  if(innerWidth>width+1)found.push('viewport expanded to hide overflow');
  const header=document.querySelector('.mast'),back=document.querySelector('#atlasBack'),identity=document.querySelector('.identity');
  for(const el of [header,identity,back,document.querySelector('.bottom-tabs')])if(el&&visible(el)){const b=rect(el);if(b.left<-.5||b.right>innerWidth+.5)found.push('outside viewport: '+describe(el));}
  if(back&&visible(back)&&rect(identity).right>rect(back).left+eps&&Math.abs(rect(identity).top-rect(back).top)<20)found.push('brand and Back overlap');
  const selectors='.page:not([hidden]) .comparison-track small,.page:not([hidden]) .comparison-axis>b,.page:not([hidden]) .flow-steps li,.page:not([hidden]) .module-link,.page:not([hidden]) .open-builds,.page:not([hidden]) .market-tabs button,.bottom-tabs small,.atlas-back,.identity-copy strong,.identity-copy small';
  for(const el of document.querySelectorAll(selectors)){if(!visible(el)||!el.textContent.trim())continue;const box=rect(el),walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;while(node=walk.nextNode()){if(!node.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(node);for(const b of r.getClientRects())if(b.width&&b.height&&(b.left<box.left-eps||b.right>box.right+eps||b.top<box.top-eps||b.bottom>box.bottom+eps)){found.push('clipped text: '+describe(el)+' '+el.textContent.trim().slice(0,75));break;}}}
  for(const el of document.querySelectorAll('.page:not([hidden]) .sensory-comparison,.page:not([hidden]) .shared-liquid-picker,.page:not([hidden]) .dna-row,.page:not([hidden]) .duel-card,.page:not([hidden]) .market-card,.page:not([hidden]) .wire-panel,.page:not([hidden]) .material-path,.page:not([hidden]) .scene-match')){if(!visible(el))continue;const b=rect(el);if(b.left<-.5||b.right>innerWidth+.5)found.push('panel outside viewport: '+describe(el));}
  for(const el of document.querySelectorAll('.bottom-tabs button'))if(visible(el)){const label=el.querySelector('small'),b=rect(el),l=rect(label);if(l.left<b.left-eps||l.right>b.right+eps)found.push('tab label overlaps its button: '+label.textContent);}
  for(const select of document.querySelectorAll('.page:not([hidden]) select'))if(visible(select)){const style=getComputedStyle(select),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=style.font;const text=select.selectedOptions[0]?.textContent||'',available=select.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-24;if(ctx.measureText(text).width>available){const caption=select.nextElementSibling;if(!caption?.classList.contains('selection-full-label')||caption.hidden||caption.textContent!==text)found.push('hidden selected value: '+(select.id||select.dataset.duelBuild||text));}}
  const cinema=document.querySelector('.page:not([hidden]) .photo-cinema');if(cinema){const caption=cinema.querySelector('.cinema-caption'),tag=cinema.querySelector('.cinema-top'),controls=cinema.querySelector('.cinema-controls');const overlap=(a,b)=>{if(!a||!b||!visible(a)||!visible(b))return false;const x=rect(a),y=rect(b);return Math.min(x.right,y.right)>Math.max(x.left,y.left)+eps&&Math.min(x.bottom,y.bottom)>Math.max(x.top,y.top)+eps;};for(const text of caption.querySelectorAll('strong,a')){if(overlap(text,tag))found.push('photo label overlaps product caption');if(overlap(text,controls))found.push('photo controls overlap product caption');}}
  const tabs=document.querySelector('.bottom-tabs');if(visible(tabs)&&getComputedStyle(tabs).display!=='none'){if(parseFloat(getComputedStyle(document.body).paddingBottom)<rect(tabs).height)found.push('insufficient space below content for tabs');if(rect(tabs).top<0||rect(tabs).bottom>height+1)found.push('tabs outside visible viewport');}
  return [...new Set(found)];
 },page.viewportSize());
 assert.deepEqual(issues,[],step+' must fit: '+issues.join(' | '));
}
async function main(){await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=process.env.RTA_ATLAS_LAYOUT_ORIGIN||'http://127.0.0.1:'+server.address().port,browser=await chromium.launch({channel:'chrome',headless:true});let count=0;
 try{for(const [width,height,font] of cases){const label=(font?'font'+font:'default')+'-'+width;if(process.env.RTA_ATLAS_LAYOUT_CASE&&process.env.RTA_ATLAS_LAYOUT_CASE!==label)continue;
  let context,profile;
  if(font){profile=fs.mkdtempSync(path.resolve('artifacts/layout-profile-'));fs.mkdirSync(path.join(profile,'Default'));fs.writeFileSync(path.join(profile,'Default','Preferences'),JSON.stringify({webkit:{webprefs:{minimum_font_size:font,minimum_logical_font_size:font}}}));context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true,viewport:{width,height},isMobile:width<=760,hasTouch:width<=760,serviceWorkers:'block'});}
  else context=await browser.newContext({viewport:{width,height},isMobile:width<=760,hasTouch:width<=760,serviceWorkers:'block'});
  try{const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const nav=width<=760?'.bottom-tabs':'.top-nav';
   await page.goto(origin+'/rta-lab/atlas/');await page.waitForFunction(()=>!!window.RTA_ATLAS_SEARCH_UI&&!document.body.classList.contains('atlas-loading'));await stable(page);
   if(font)assert.ok(await page.evaluate(()=>parseFloat(getComputedStyle(document.querySelector('.comparison-track small')||document.body).fontSize))>=font,'The browser preference must really enlarge text');
   await fit(page,label+' Home');await shot(page,'fit-'+label+'-01-home.png');
   const cmd=page.locator('#labCommands');
   assert.equal(await cmd.count(),1,'HOME needs one continuity command card');
   assert.equal(await cmd.locator('.lab-command-item').count(),3,'Exactly three continuity commands');
   await align(page,'#labCommands');await fit(page,label+' Commands');
   const cmdRect=await cmd.boundingBox();
   assert.ok(cmdRect&&cmdRect.x>=-1&&cmdRect.x+cmdRect.width<=width+1,'Command card must stay in viewport width');
   if(!font&&[360,390,1440].includes(width))
    await cmd.screenshot({path:path.join(folder,'fit-'+label+'-01b-commands.png'),animations:'disabled'});
   if(width===390&&!font){
    await cmd.locator('[data-lab-copy="sync"]').click();
    await page.waitForFunction(()=>document.getElementById('labCommandsStatus')?.textContent.includes('Du-te în Lab'));
    assert.ok((await page.locator('#labCommandsStatus').textContent()).includes('Copiat:'),
      'Copy action must really work without triggering a navigation or mutation');
    assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.state.route),'home');
   }
   await page.locator('.primary-action').click();await page.locator('#liquidSearch').fill('Balkan Milestone');await page.locator('#liquidSearch').press('Enter');await stable(page);await fit(page,label+' Liquid');
   await align(page,'#liquidComparison');assert.equal(await page.locator('#liquidComparison .comparison-track').count(),21);await shot(page,'fit-'+label+'-02-chart.png');await align(page,'#liquidComparison .comparison-axis');await shot(page,'fit-'+label+'-02-values.png');
   await align(page,'.result-card');await shot(page,'fit-'+label+'-03-result.png');
   await page.locator(nav+' [data-route="atomizer"]').click();await page.locator('#atlasPlatform').selectOption('klp');await page.locator('#atlasWire').selectOption('nife30');await stable(page);await fit(page,label+' Atlas');await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await shot(page,'fit-'+label+'-04-atlas.png');
   await page.locator('.material-path .wire-liquid-links summary').first().click();await align(page,'.material-paths');await fit(page,label+' materials');await shot(page,'fit-'+label+'-05-materials.png');
   console.log('LAYOUT '+label+': Wire');await page.locator('[data-edit-wire]').click();await page.locator('#wireMaterial').selectOption('nife30');await stable(page);await fit(page,label+' Wire');await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await shot(page,'fit-'+label+'-06-wire.png');
   await align(page,'.wire-workspace');await shot(page,'fit-'+label+'-07-workspace.png');
   await page.locator(nav+' [data-route="market"]').click();await page.locator('[data-market-category="NET complex"]').click();await stable(page);await fit(page,label+' Market');await shot(page,'fit-'+label+'-08-market.png');
   await page.locator(nav+' [data-route="duel"]').click();await page.locator('[data-duel-confirm="left"]').click();await page.locator('[data-duel-confirm="right"]').click();await stable(page);await fit(page,label+' Duel');await shot(page,'fit-'+label+'-09-duel.png');
   await align(page,'#duelDifferences');await shot(page,'fit-'+label+'-10-duel-results.png');
   await page.locator('#atlasBack').click();await stable(page);assert.equal(await page.evaluate(()=>window.RTA_ATLAS_PREVIEW.state.route),'market');await fit(page,label+' Back');assert.equal(errors.length,0,errors.join(' | '));
   console.log('LAYOUT CASE PASS: '+label+' '+height+'px; six modules, unclipped text, header/tabs, exact selections and charts.');count++;
  }finally{await context.close();if(profile){const resolved=path.resolve(profile),owned=path.resolve('artifacts')+path.sep;assert.ok(resolved.startsWith(owned)&&path.basename(resolved).startsWith('layout-profile-'),'Only this test-created profile may be removed');fs.rmSync(resolved,{recursive:true,force:true});}}
 }
 console.log('ATLAS LAYOUT VISUAL PASS: '+count+' viewport/font cases, real browser minimum fonts 18/24px, six modules, text bounds, dynamic chrome and selected-value captions.');
 }finally{await browser.close();await new Promise(r=>server.close(r));}}
main().catch(e=>{console.error(e);server.close();process.exitCode=1;});
