// Run the established gameplay checks against the actual default hex engine.
const fs=require('node:fs'),path=require('node:path'),H=require('../dist/hex-map.js');
const read=fs.readFileSync,enginePath=path.resolve('dist/game.js');
const engine=read.call(fs,'dist/hex-map.js','utf8')+'\n'+read.call(fs,'dist/terrain-generators.js','utf8')+'\n'+H.transform(read.call(fs,enginePath,'utf8'));
fs.readFileSync=function(file,options){
 if(typeof file==='string'&&path.resolve(file)===enginePath)return typeof options==='string'||options?.encoding?engine:Buffer.from(engine);
 return read.apply(this,arguments);
};
try{for(const test of ['test-campaign.cjs','test-category-boxes.cjs','test-shop-stock.cjs','test-weapon-evolution.cjs','test-added-enemies.cjs'])require('./'+test);}
finally{fs.readFileSync=read;}
console.log('Default hex engine: original campaign, shop, weapons and enemies passed.');
