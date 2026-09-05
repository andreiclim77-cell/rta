#!/usr/bin/env node
'use strict';

const {decode,norm,registry,classifyPodProduct}=require('./market-pod-classifier-2026.js');

const POD_BRAND_ONLY=new Set((registry().makers||[]).flatMap(function(maker){
  return[maker.name].concat(maker.aliases||[]).map(norm).filter(Boolean);
}));

function productNameOnly(value){
  return decode(value)
    .replace(/\b\d+(?:[.,]\d+)?\s*out of 5\s*\(\d+\)[\s\S]*$/i,' ')
    .replace(/\bSKU\s*:[\s\S]*$/i,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function genericListingTitle(title){
  const t=norm(title);
  if(!t)return true;
  if(/^(?:pods?|pod systems?|rta|rba|rda|rdta|mod(?:uri)?|box mod|mod tigara electronica|atomizoare?|produse?|shop|baza|base|bumbac|cotton|sarma|wire|rezistente?(?: preconstruite)?|coiluri?|coils?|cartuse?|cartuse cu lichid|cartridges?|acumulatori?|baterii|incarcatoare?|vape cu incarcator|accesorii|wrap uri|lichide?|arome?|tutun)(?: \d+)?$/.test(t))return true;
  return /^(?:sold out|out of stock|stoc epuizat|epuizat|indisponibil|alerta stoc|in stock|coming soon|read more|citeste mai mult|add to cart|adauga in cos|capacitate acumulator|tip acumulator|tip baterie|alege optiunea|selecteaza optiunile?|filtreaza dupa|ordonare implicita|sorteaza dupa|sale|new)$/.test(t);
}

function classifyMarketSalesProduct(title,hint){
  const name=productNameOnly(title),text=decode([name,hint].filter(Boolean).join(' ')),t=norm(text),n=norm(name);
  if(genericListingTitle(name)||n.length<3)return'';
  if(POD_BRAND_ONLY.has(n)||/^(\w[\w ]{1,30})\s+\1$/.test(n))return'';
  if(/\b(?:card aromatizant|tuburi tigari|filtre? tigari|tigari de foi|tigari de rulat|trabucuri?|cigars?|cigarettes?|foite|bricheta|pipa)\b/.test(n))return'';
  if(/\bcotton candy\b/.test(n))return'';
  if(/\b(?:disposable|de unica folosinta|unica folosinta|\d+\s*puffs?)\b/.test(n)&&!/(?:refillable|replaceable)\s+pod|pod\s+(?:system|kit)/.test(n))return'';

  const pod=classifyPodProduct(name,hint);
  const wholePodDevice=/\b(?:tigara electronica|vape kit|kit reincarcabil|starter kit|dispozitiv|device)\b[\s\S]*\b(?:aio|pod)\b|\b(?:aio|pod)\b[\s\S]*\b(?:kit|dispozitiv|device)\b/.test(n);
  const wholeVapeKit=/^(?:kit (?:vape|tigara electronica)|vape kit)\b|\bstarter kit\b/.test(n);
  const wholePrefilledKit=/^kit\b/.test(n)&&/\b(?:cartus|cartridge)\b/.test(n)&&/\b(?:pufuri|puffs?)\b/.test(n);
  const nicotineConsumable=/\b\d+(?:[.,]\d+)?\s*mg\b|\b(?:nicsalts?|nicotine|nicotina)\b/.test(n);
  const podAccessory=/\b(?:capsul(?:a|e)|cartus(?:e)?|cartridge(?:s)?|replacement pods?|empty pods?|pod cartridge(?:s)?|pod tank|mouthpiece|capace?|husa|case|lanyard)\b/.test(n)||Boolean(pod)&&/\b(?:filtr(?:u|e)|filters?)\b/.test(n)||/\b(?:set|pachet|pack)\s+(?:de\s+)?\d+\s*(?:x\s*)?(?:pods?|cartus(?:e)?)\b/.test(n)||/^\d+\s*x\s+.*\bpod\b/.test(n);
  const rtaContext=/\b(?:rta|rba|rdta|atomizor|atomizer|clearomizor|clearomizer|kayfun|dvarw|bishop|bi2hop|taifun|squape|nautilus)\b/.test(t);
  const strongRtaComponent=/^(?:top\s*fill|extensie|extension|chamber|clopot|bell cap|chimney|tank section|air\s*pin|insert|o\s*ring|oring|garnituri)\b/.test(n);
  const contextualRtaComponent=/^(?:sticla|geam|glass(?: tube)?|rezervor|pyrex|drip tip|deck|baza|base|tub)\b/.test(n)&&rtaContext;
  const wrapAccessory=/\b(?:wrap|sticker(?:e)?|folie|protectie|protective|husa|case|carcasa|lanyard)\b/.test(n);
  const buildTool=/\b(?:jig|coiling rod|penseta|cleste|foarfeca|surubelnita|coil master tool)\b/.test(n);
  const completeCoil=/^(?:set(?: de)? \d+ )?(?:coil|coils|rezistenta|rezistente)\b/.test(n);
  const completeBattery=/^(?:acumulator|baterie|battery)\b/.test(n);
  const resistanceWire=/\b(?:nichelina|kanthal|ni80|nife|ss316|wire|sarma)\b/.test(n)&&!completeCoil;
  if(wholePodDevice||wholePrefilledKit||wholeVapeKit&&(pod||podAccessory))return'POD';
  if(wholeVapeKit&&!/\bbox mod\b/.test(n))return'';
  if(/\batomizor tank\b.*\b(?:box mod|aio)\b/.test(n))return'componente RTA';
  if(completeCoil)return'coil prebuilt';
  if(completeBattery)return'acumulator';
  if(resistanceWire)return'sarma';
  if(podAccessory)return'accesoriu RTA/mod';
  if(strongRtaComponent||contextualRtaComponent)return'componente RTA';
  if(wrapAccessory)return'accesoriu RTA/mod';
  if(buildTool)return'unelte build';

  if(/\b(?:charger|incarcator)\b/.test(n))return'incarcator';
  if(/^(?:mod|box mod|sbs mod|side by side mod)\b/.test(n)||/\b(?:box mod|sbs mod|side by side mod)\b/.test(n))return'mod';
  if(/\b(?:18650|21700|acumulator|battery)\b/.test(n))return'acumulator';
  if(/^\s*(?:set(?: de)? \d+ )?(?:coil|coils|rezistenta|rezistente)\b/.test(n))return'coil prebuilt';
  if(/\brdta\b|\brda\b/.test(n))return'RDA/RDTA';
  if(/\brba\b|\bbridge\b/.test(n))return'RBA/bridge';
  if(/\brta\b/.test(n))return'RTA';
  if(/\b(?:atomizor tank|clearomizor|clearomizer)\b/.test(n))return'accesoriu RTA/mod';
  if(/\b(?:kanthal|ni80|nife|ss316|wire|sarma)\b/.test(n))return/\b(?:coil|coils|rezistenta|rezistente)\b/.test(n)?'coil prebuilt':'sarma';
  if(/\b(?:coil|coils|rezistenta|rezistente|mesh coil|coil head)\b/.test(n))return'coil prebuilt';
  if(/\b(?:bumbac|cotton|wick|vata)\b/.test(n))return'bumbac/wick';
  if(/\b(?:bf60|fl80|board|chipset|placa electronica|circuit board)\b/.test(n))return'chipset/board';
  if(pod&&nicotineConsumable)return'accesoriu RTA/mod';
  if(pod)return pod.category;
  if(/\b(?:tutun|tobacco|virginia|latakia|burley|kentucky|net)\b/.test(n)&&/\b(?:lichid|aroma|longfill|shortfill|extract|macerat|tobacco|net)\b/.test(n))return'lichid tutunos/NET/DIY';
  return'';
}

module.exports={productNameOnly,genericListingTitle,classifyMarketSalesProduct};
