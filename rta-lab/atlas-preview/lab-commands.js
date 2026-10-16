/* RTA Atlas — commands are copy-only; no GitHub write occurs on this site.
 * Exact phrases are stable across all ChatGPT conversations in the RTA project.
 */
(function(){
 "use strict";
 const commands=Object.freeze({
   sync:"Du-te în Lab și fă-ți update",
   save:"Salvează",
   archive:"Dă-mi arhiva de continuitate la zi"
 });
 function fallbackCopy(text){
   const field=document.createElement("textarea");
   field.value=text;
   field.setAttribute("readonly","");
   field.style.cssText="position:fixed;left:-10000px;top:0;opacity:0";
   document.body.appendChild(field);
   field.focus();
   field.select();
   let success=false;
   try{success=typeof document.execCommand==="function"&&document.execCommand("copy")===true;}catch(e){}
   field.remove();
   return success;
 }
 async function copyText(value){
   if(navigator.clipboard&&typeof navigator.clipboard.writeText==="function"){
     try{await navigator.clipboard.writeText(value);return true;}catch(e){}
   }
   return fallbackCopy(value);
 }
 function init(){
   const host=document.getElementById("labCommands");
   const status=document.getElementById("labCommandsStatus");
   if(!host||!status)return;
   host.addEventListener("click",async event=>{
     const button=event.target.closest?.("[data-lab-copy]");
     if(!button||!host.contains(button)||button.disabled)return;
     const command=commands[button.dataset.labCopy];
     if(!command)return;
     button.disabled=true;
     try{
       const copied=await copyText(command);
       status.textContent=copied?
         "Copiat: „"+command+"”. Deschide conversația ChatGPT și lipește comanda.":
         "Copierea automată nu este disponibilă. Selectează și copiază textul comenzii din card.";
     }finally{button.disabled=false;}
   });
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
 else init();
})();
