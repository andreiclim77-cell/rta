#!/usr/bin/env node
'use strict';

const {decode,norm,classifyPodProduct}=require('./market-pod-classifier-2026.js');

function genericListingTitle(title){
  const t=norm(title);
  if(!t)return true;
  if(/^(?:pod(?: system)?|rta|rba|mod(?:uri)?|atomizoare?|produse?|shop|bumbac|cotton|sarma|wire|acumulatori?|baterii|incarcatoare?|accesorii|tutun)(?: \d+)?$/.test(t))return true;
  return /^(?:capacitate acumulator|alege optiunea|selecteaza optiunea|filtreaza dupa|ordonare implicita|sorteaza dupa)$/.test(t);
}

function classifyMarketSalesProduct(title,hint){
  const name=decode(title),text=decode([name,hint].filter(Boolean).join(' ')),t=norm(text),n=norm(name);
  if(genericListingTitle(name)||n.length<3)return'';
  if(/\b(?:card aromatizant|tuburi tigari|foite|bricheta)\b/.test(n))return'';
  if(/\b(?:disposable|de unica folosinta|unica folosinta|\d+\s*puffs?)\b/.test(n)&&!/(?:refillable|replaceable)\s+pod|pod\s+(?:system|kit)/.test(n))return'';

  const podAccessory=/\b(?:cartus(?:e)?|cartridge(?:s)?|replacement pods?|empty pods?|pod cartridge(?:s)?|filtr(?:u|e)|filters?|mouthpiece|capace?|husa|case|lanyard)\b/.test(n)||/\b(?:set|pachet|pack)\s+(?:de\s+)?\d+\s*(?:x\s*)?(?:pods?|cartus(?:e)?)\b/.test(n)||/^\d+\s*x\s+.*\bpod\b/.test(n);
  const rtaComponent=/^(?:top\s*fill|extensie|extension|chamber|clopot|bell cap|chimney|tank section|sticla|glass tube|rezervor|pyrex|drip tip|deck|baza|base|air\s*pin|insert|o\s*ring|oring|garnituri)\b/.test(n);
  const wrapAccessory=/\b(?:wrap|sticker(?:e)?|folie|protectie|protective|husa|case|lanyard)\b/.test(n);
  if(podAccessory)return'accesoriu RTA/mod';
  if(rtaComponent||/\batomizor tank\b.*\b(?:box mod|aio)\b/.test(n))return'componente RTA';
  if(wrapAccessory)return'accesoriu RTA/mod';
  if(/\b(?:tigara electronica|dispozitiv|device)\b.*\b(?:aio|pod)\b/.test(n))return'POD';

  if(/\b(?:charger|incarcator)\b/.test(n))return'incarcator';
  if(/^(?:mod|box mod|sbs mod|side by side mod)\b/.test(n)||/\b(?:sbs mod|side by side mod)\b/.test(n))return'mod';
  if(/\b(?:18650|21700|acumulator|battery)\b/.test(n))return'acumulator';
  if(/\b(?:kanthal|ni80|nife|ss316|wire|sarma)\b/.test(n))return/\b(?:coil|coils|rezistenta|rezistente)\b/.test(n)?'coil prebuilt':'sarma';
  if(/\b(?:coil|coils|rezistenta|rezistente|mesh coil|coil head)\b/.test(n))return'coil prebuilt';
  if(/\b(?:bumbac|cotton|wick|vata)\b/.test(n))return'bumbac/wick';
  if(/\b(?:bf60|fl80|board|chipset|placa electronica|circuit board)\b/.test(n))return'chipset/board';
  if(/\brdta\b|\brda\b/.test(n))return'RDA/RDTA';
  if(/\brba\b|\bbridge\b/.test(n))return'RBA/bridge';
  if(/\brta\b/.test(n)&&!/\brda\b|\brdta\b/.test(n))return'RTA';

  const pod=classifyPodProduct(name,hint);
  if(pod)return pod.category;
  if(/\b(?:tutun|tobacco|virginia|latakia|burley|kentucky|net)\b/.test(n)&&/\b(?:lichid|aroma|longfill|shortfill|extract|macerat|tobacco|net)\b/.test(n))return'lichid tutunos/NET/DIY';
  return'';
}

module.exports={genericListingTitle,classifyMarketSalesProduct};
