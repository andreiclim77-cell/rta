(function(){
'use strict';
if(typeof document==='undefined')return;
document.addEventListener('DOMContentLoaded',()=>{
 const root=document.documentElement,mast=document.querySelector('.mast'),tabs=document.querySelector('.bottom-tabs'),captions=new WeakMap(),observed=new WeakSet();let scheduled=false;
 const observer=new ResizeObserver(schedule);
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
 function watch(el){if(el&&!observed.has(el)){observer.observe(el);observed.add(el);}}
 function height(el){return el&&!el.hidden&&getComputedStyle(el).display!=='none'?Math.ceil(el.getBoundingClientRect().height):0;}
 function setHeight(name,value){const text=value+'px';if(root.style.getPropertyValue(name)!==text)root.style.setProperty(name,text);}
 function update(){
  scheduled=false;const large=parseFloat(getComputedStyle(document.body).fontSize)>=18;
  document.body.classList.toggle('is-large-type',large);
  mast?.classList.toggle('is-compact',parseFloat(getComputedStyle(mast.querySelector('.identity-copy strong')).fontSize)>=20);
  if(tabs&&getComputedStyle(tabs).display!=='none'){
   const buttons=[...tabs.querySelectorAll('button')],space=(tabs.clientWidth-12-2*(buttons.length-1))/buttons.length-4;
   const crowded=buttons.some(button=>{const small=button.querySelector('small');if(!small)return false;const range=document.createRange();range.selectNodeContents(small);return range.getBoundingClientRect().width>space;});
   tabs.classList.toggle('is-wrapped',crowded);
  }
  for(const select of document.querySelectorAll('.page select')){
   if(!select.getClientRects().length)continue;
   const text=select.selectedOptions[0]?.textContent||'',style=getComputedStyle(select),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=style.font||[style.fontWeight,style.fontSize,style.fontFamily].join(' ');
   const available=select.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-24,needed=ctx.measureText(text).width>available;
   let caption=captions.get(select);
   if(needed&&!caption){caption=document.createElement('span');caption.className='selection-full-label';caption.setAttribute('aria-hidden','true');select.insertAdjacentElement('afterend',caption);captions.set(select,caption);}
   if(caption){if(caption.textContent!==text)caption.textContent=text;caption.hidden=!needed;}
  }
  const tray=document.getElementById('duelSelection');
  watch(mast);watch(tabs);watch(tray);
  setHeight('--atlas-mast-height',height(mast));setHeight('--atlas-tabs-height',height(tabs));setHeight('--atlas-tray-height',height(tray));
 }
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
 document.addEventListener('click',schedule);document.addEventListener('change',schedule);document.addEventListener('toggle',schedule,true);window.addEventListener('resize',schedule);document.fonts?.ready.then(schedule);schedule();
});
})();
