#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');

class JsonProjectionStore{
  constructor(root){this.root=root}
  target(relative){return path.join(this.root,...relative.split('/'))}
  write(relative,text){const target=this.target(relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text,'utf8')}
  matches(relative,text){const target=this.target(relative);return fs.existsSync(target)&&fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n')===text.replace(/\r\n/g,'\n')}
}

module.exports={JsonProjectionStore};
