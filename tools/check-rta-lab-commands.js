/* RTA continuity commands: exact phrases, accessible buttons, copy-only behavior.
 * No writes, routing, or generated artifacts are triggered by the website.
 */
"use strict";
const fs=require("node:fs"),assert=require("node:assert/strict"),vm=require("node:vm");
const html=fs.readFileSync("rta-lab/atlas-preview/index.html","utf8");
const css=fs.readFileSync("rta-lab/atlas-preview/lab-commands.css","utf8");
const source=fs.readFileSync("rta-lab/atlas-preview/lab-commands.js","utf8");
const protocol=fs.readFileSync("rta-lab/RTA_OPERATING_PROTOCOL.md","utf8");
const expected={
 sync:"Du-te în Lab și fă-ți update",
 save:"Salvează",
 archive:"Dă-mi arhiva de continuitate la zi"
};
assert.ok(html.includes('id="labCommands"')&&html.includes('aria-labelledby="labCommandsTitle"'));
assert.ok(html.includes('id="labCommandsStatus" role="status" aria-live="polite"'));
assert.equal((html.match(/class="lab-command-item(?: lab-command-featured)?"/g)||[]).length,3);
for(const [key,phrase] of Object.entries(expected)){
 assert.ok(html.includes('data-lab-copy="'+key+'"'),"Missing copy button "+key);
 assert.ok(html.includes(phrase),"Exact instruction must appear visibly: "+phrase);
 assert.ok(source.includes(phrase),"Copy handler has wrong phrase: "+key);
 assert.ok(protocol.includes(phrase==="Du-te în Lab și fă-ți update"?"Du-te în Lab și fă-ți update":phrase),"Protocol should contain exact phrase");
}
assert.ok(html.includes('https://github.com/andreiclim77-cell/rta/blob/main/rta-lab/RTA_OPERATING_PROTOCOL.md'));
assert.ok(html.indexOf('id="labCommands"')>html.indexOf('class="gateway frame"'));
assert.ok(html.indexOf('id="labCommands"')<html.indexOf('class="home-endcap frame"'));
for(const name of ["lab-commands.css","lab-commands.js"])assert.ok(html.includes('./'+name+'?v=atlas-lab-commands-20261016-1'),"Versioned asset "+name);
assert.ok(css.includes('@media(max-width:760px)')&&css.includes('prefers-reduced-motion:reduce'));
assert.ok(css.includes(':focus-visible')&&css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'));
async function exercise(mode){
 const commands=[],status={textContent:""},listeners={},root={
   addEventListener(event,fn){listeners[event]=fn;},
   contains:()=>true
 };
 let fallbackSelect=false,wasRemoved=false;
 const field={value:"",style:{cssText:""},setAttribute(){},focus(){},select(){fallbackSelect=true;},remove(){wasRemoved=true;}};
 const doc={readyState:"complete",getElementById:id=>id==="labCommands"?root:id==="labCommandsStatus"?status:null,
   createElement:()=>field,body:{appendChild(){}},execCommand:()=>true};
 const nav={clipboard:mode==="fallback"?{async writeText(){throw Error("not permitted");}}:{async writeText(v){commands.push(v);}}};
 const box={document:doc,navigator:nav};vm.createContext(box);vm.runInContext(source,box);
 assert.equal(typeof listeners.click,"function");
 for(const [id,phrase] of Object.entries(expected)){
  const b={disabled:false,dataset:{labCopy:id}};
  await listeners.click({target:{closest:()=>b}});
  assert.equal(b.disabled,false);
  assert.ok(status.textContent.includes("Copiat:")&&status.textContent.includes(phrase));
 }
 if(mode==="success")assert.deepEqual(commands,Object.values(expected));
 else assert.ok(fallbackSelect&&wasRemoved,"Copy fallback should select text and remove the helper");
 const count=commands.length;
 await listeners.click({target:{closest:()=>({disabled:false,dataset:{labCopy:"forged"}})}});
 assert.equal(commands.length,count,"Unknown commands must not be copied");
}
Promise.resolve().then(async()=>{await exercise("success");await exercise("fallback");
 console.log("RTA LAB COMMAND CARD PASS: three exact phrases, semantics, responsive CSS, clipboard + fallback, no silent actions.");
}).catch(error=>{console.error(error);process.exitCode=1;});
