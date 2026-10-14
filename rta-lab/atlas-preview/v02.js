/* V0.2 real-photography cinema + visible interaction-driven motion. */
(function(){
"use strict";
const scenes=[
 {id:"kx",name:"KAYFUN X"},
 {id:"gtone",name:"TAIFUN GT ONE"},
 {id:"415",name:"415 MTL"}
];
const prefersReduced=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let position=0,paused=false,clock=null;
function gallery(){
 const host=document.getElementById("cinemaReel");
 const photos=window.RTA_ATLAS_PHOTOS||{};
 const reduced=prefersReduced();
 if(!host)return;
 const slides=scenes.map((item,i)=>{
  const media=photos[item.id];
  if(!media)return "";
  return '<div class="cinema-frame'+(i===0?' is-visible':'')+'" data-cinema-frame="'+i+'">'+
   '<img alt="'+item.name+' — fotografie reală de produs" src="'+media.src+'" decoding="async" '+(i===0?'fetchpriority="high"':'loading="lazy"')+'></div>';
 }).join("");
 host.innerHTML=slides+'<div class="cinema-vignette" aria-hidden="true"></div>'+
  '<div class="cinema-top"><span class="cinema-live"></span> MODELE / FOTO REALĂ</div>'+
  '<div class="cinema-caption"><strong id="cinemaProduct">'+scenes[0].name+'</strong>'+
  '<a id="cinemaCredit" target="_blank" rel="noopener noreferrer" href="'+photos[scenes[0].id].ref+'">FOTO / '+photos[scenes[0].id].credit+' ↗</a></div>'+
  '<div class="cinema-controls" role="group" aria-label="Schimbă fotografia">'+
   scenes.map((x,i)=>'<button type="button" data-cinema-select="'+i+'" aria-label="Fotografia '+(i+1)+': '+x.name+'" aria-pressed="'+(i===0)+'"></button>').join('')+
   '<button type="button" id="cinemaPause" '+(reduced?'hidden ':'')+'aria-label="Oprește rotația fotografiilor" aria-pressed="false">Ⅱ</button></div>';
 host.querySelectorAll("img").forEach((img,i)=>{
  img.addEventListener("load",()=>{if(i===position)updateCredit(i);});
  img.addEventListener("error",()=>{
   const media=photos[scenes[i].id];
   if(media?.fallbackSrc&&!img.dataset.photoFallback){
    img.dataset.photoFallback="local";
    img.alt=scenes[i].name+" — fotografie din arhiva RTA (proveniență de verificat)";
    img.src=media.fallbackSrc;
    if(i===position)updateCredit(i);
    return;
   }
   img.classList.add("unavailable");
   img.parentElement.classList.add("photo-error");
   if(!img.parentElement.querySelector(".cinema-photo-error")){
    const label=document.createElement("span");
    label.className="cinema-photo-error";
    label.textContent="Fotografie indisponibilă · "+scenes[i].name;
    img.parentElement.appendChild(label);
   }
  });
 });
 host.addEventListener("click",ev=>{
  const b=ev.target.closest("button");
  if(!b)return;
  if(b.dataset.cinemaSelect!=null){
   setSlide(Number(b.dataset.cinemaSelect));resetClock();
  }else if(b.id==="cinemaPause"){
   paused=!paused;
   b.setAttribute("aria-pressed",String(paused));
   b.setAttribute("aria-label",paused?"Pornește animația":"Oprește animația");
   b.textContent=paused?"▶":"Ⅱ";
   resetClock();
  }
 });
 if(!prefersReduced())resetClock();
}
function updateCredit(index){
 const photo=window.RTA_ATLAS_PHOTOS?.[scenes[index]?.id];
 const link=document.getElementById("cinemaCredit");
 const img=document.querySelector('[data-cinema-frame="'+index+'"] img');
 if(!photo||!link)return;
 if(img?.dataset.photoFallback==="local"){
  link.removeAttribute("href");
  link.removeAttribute("target");
  link.textContent="FOTO / Arhiva RTA · sursa de verificat";
 }else{
  link.href=photo.ref;
  link.target="_blank";
  link.textContent="FOTO / "+photo.credit+" ↗";
 }
}
function setSlide(index){
 if(!Number.isInteger(index)||index<0||index>=scenes.length)return false;
 const host=document.getElementById("cinemaReel");
 if(!host)return false;
 position=index;
 host.querySelectorAll("[data-cinema-frame]").forEach((frame,i)=>frame.classList.toggle("is-visible",i===index));
 host.querySelectorAll("[data-cinema-select]").forEach((button,i)=>button.setAttribute("aria-pressed",String(i===index)));
 document.getElementById("cinemaProduct").textContent=scenes[index].name;
 updateCredit(index);
 return true;
}
function resetClock(){
 if(clock){clearInterval(clock);clock=null;}
 if(!paused&&!prefersReduced()&&!document.hidden)clock=setInterval(()=>setSlide((position+1)%scenes.length),3200);
}
function animateLiquid(){
 const scene=document.querySelector(".live-scene");
 if(!scene)return;
 const category=document.getElementById("sceneCategory")?.textContent||"";
 scene.dataset.character=/COMPLEX/i.test(category)?"layered":"direct";
 scene.classList.remove("cinema-react");
 void scene.offsetWidth;
 scene.classList.add("cinema-react");
 if(prefersReduced())return;
 const svg=scene.querySelector(".chromatogram");
 if(svg&&typeof svg.animate==="function")svg.animate([
  {transform:"scale(.89) rotate(-2deg)",opacity:.32},
  {transform:"scale(1.04) rotate(1deg)",opacity:1,offset:.62},
  {transform:"scale(1) rotate(0deg)",opacity:1}
 ],{duration:950,easing:"cubic-bezier(.16,1,.3,1)"});
}
function installAirflowDemo(){
 const results=document.getElementById("resultsSection");
 if(!results)return;
 const box=document.createElement("div");
 box.className="air-demo";
 box.innerHTML='<div class="air-head"><div><span>LIVE AIRFLOW / SCHEMATIC</span><h3>Un jet sau trei?</h3>'+
  '<p>Distribuția aerului, nu un debit măsurat.</p></div>'+
  '<div class="air-toggle" role="group" aria-label="Alege insertul demonstrativ">'+
  '<button type="button" data-air="single" aria-pressed="true">1×1,2</button>'+
  '<button type="button" data-air="triple" aria-pressed="false">3×0,6</button></div></div>'+
  '<div class="air-visual" id="airDemoVisual">'+airSvg(1)+'</div>'+
  '<span class="air-caption" id="airDemoText">JET CENTRAL · ARIE NOMINALĂ 1,131 mm²</span>';
 results.parentNode.insertBefore(box,results);
 box.addEventListener("click",e=>{
  const b=e.target.closest("[data-air]");
  if(!b)return;
  const n=b.dataset.air==="triple"?3:1;
  box.querySelectorAll("[data-air]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
  const visual=document.getElementById("airDemoVisual");
  visual.innerHTML=airSvg(n);
  visual.classList.remove("air-switching");void visual.offsetWidth;
  visual.classList.add("air-switching");
  document.getElementById("airDemoText").textContent=n===3?
   "TREI JETURI · ARIE NOMINALĂ TOTALĂ 0,848 mm²":
   "JET CENTRAL · ARIE NOMINALĂ 1,131 mm²";
 });
}
function airSvg(n){
 const xs=n===3?[116,178,240]:[178];
 return '<svg viewBox="0 0 350 155" role="img" aria-label="Ilustrație animată a '+(n===3?'trei jeturi':'unui jet')+' de aer sub coil">'+
 '<path d="M79 52h192" stroke="#698b8a" stroke-width="5" stroke-linecap="round"/>'+
 Array.from({length:6},(_,i)=>'<ellipse cx="'+(118+i*23)+'" cy="50" rx="12" ry="20" fill="none" stroke="#ddc59f" stroke-width="4"/>').join("")+
 xs.map(x=>'<g class="air-flow-path"><circle cx="'+x+'" cy="122" r="5" fill="#82d4c4"/>'+
 '<path d="M'+x+' 113V77" stroke="#9ee7d7" stroke-width="3.8" stroke-linecap="round"/>'+
 '<circle cx="'+x+'" cy="102" r="3.6" fill="#dbfcf2" class="air-particle"/></g>').join("")+
 '<path d="M75 130h201" stroke="#4a7a72" stroke-width="4" opacity=".48"/>'+
 '<text x="15" y="18" fill="#e6c998" font-size="10" letter-spacing="2">AEROKINETIC STUDY</text></svg>';
}
function installResultPhotoFallback(){
 document.addEventListener("error",ev=>{
  const img=ev.target;
  if(!(img instanceof HTMLImageElement)||!img.closest(".atlas-product-photo"))return;
  const id=img.closest(".result-card")?.dataset.atom;
  const fallback=window.RTA_ATLAS_PHOTOS?.[id]?.fallbackSrc;
  const figure=img.closest(".atlas-product-photo");
  if(fallback&&!img.dataset.photoFallback){
   img.dataset.photoFallback="local";
   img.alt="Fotografie din arhiva RTA · proveniență de verificat";
   img.src=fallback;
   const credit=figure.querySelector("figcaption a");
   if(credit){
    credit.removeAttribute("href");credit.removeAttribute("target");
    credit.textContent="FOTO / Arhiva RTA · sursa de verificat";
   }
   return;
  }
  img.hidden=true;
  if(!figure.querySelector(".atlas-missing-photo")){
   const label=document.createElement("span");
   label.className="atlas-missing-photo";
   label.textContent="Fotografie momentan indisponibilă";
   figure.insertBefore(label,figure.firstChild);
  }
 },true);
}
function init(){
 installResultPhotoFallback();
 gallery();
 installAirflowDemo();
 const labels=document.getElementById("sceneCategory");
 if(labels&&window.MutationObserver){
  new MutationObserver(animateLiquid).observe(labels,{characterData:true,childList:true,subtree:true});
 }
 document.addEventListener("click",e=>{
  if(e.target.closest("[data-mood],[data-moment],[data-liquid]"))animateLiquid();
 });
 document.addEventListener("visibilitychange",resetClock);
}
window.RTA_ATLAS_V02={setSlide,animateLiquid,airSvg};
document.addEventListener("DOMContentLoaded",init);
})();