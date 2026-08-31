#!/usr/bin/env node
'use strict';

const {norm}=require('./market-product-canonical-2026.js');

function classifyRtaAccessory(value){
  const text=norm(value);
  if(!text)return null;
  if(/\b(?:pod cartridge|replacement pod|empty pod|prefilled pod|pre filled pod|pod pack|mesh pod|pod coil|coil head|replacement coil|disposable|e liquid|e juice|nicotine)\b/.test(text))return null;

  let typology='';
  if(/\b(?:kanthal(?: a1)?|nichrome|ni80|ss316l?|nife30|nife48|resistance wire|vape wire|wire spool|sarma)\b/.test(text))typology='sarma';
  else if(/\b(?:organic cotton|vape cotton|wicking cotton|cotton bacon|bumbac)\b/.test(text))typology='bumbac';
  else if(/\b(?:replacement glass|tank glass|glass tube|pyrex(?: tube)?|spare glass)\b/.test(text))typology='sticla';
  else if(/\b(?:510 drip tip|mtl drip tip|rta drip tip|mouthpiece)\b/.test(text))typology='drip tip';
  else if(/\b(?:coil jig|coiling rod|ceramic tweezer|wire cutter|vape tool|build tool|tool kit|build mat|scissor)\b/.test(text))typology='tool-uri';
  else if(/\b(?:air pin|airflow pin|air disk|air disc|deck kit|chimney|bell cap|top cap|tank section|extension kit|rta insert|rta spare|rta repair kit|rta accessory)\b/.test(text))typology='compatibilitate noua';
  if(!typology)return null;

  const rtaContext=/\b(?:rta|rebuildable|atomizer|atomiser|mtl|rdl|dl|510|build|coil|wick|tank)\b/.test(text);
  if(['sticla','drip tip','compatibilitate noua'].includes(typology)&&!rtaContext)return null;
  return{category:'ACCESORII',typology,brand:''};
}

module.exports={classifyRtaAccessory};
