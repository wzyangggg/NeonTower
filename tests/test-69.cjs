const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
for(const source of ['weapon','drone']){
 reset();floor=3;state='combat';cash=0;shootTimer=999;chaserTimer=999;
 enemies=[{type:'boss',x:450,y:300,homeX:450,homeY:300,hp:1,max:1,r:24,t:0,fire:999,seed:0},{type:'eye',x:520,y:300,homeX:520,homeY:300,hp:5,max:5,r:14,t:0,fire:999,seed:0}];
 spawnQueue=[{type:'missile',side:1},{type:'eye',side:2}];
 bullets=[{x:520,y:300,vx:0,vy:0,r:8,life:10,c:'#ff0000'}];
 shots=[{x:450,y:300,vx:0,vy:0,life:1,damage:2,pierce:2,source,hitTargets:new Set()}];
 step(.001);check(state==='stageClear'&&stageClearLeft===2&&$('stage-clear').style.display==='flex','legacy boss clear waits before ending');
 check(!enemies.length&&!spawnQueue.length&&!bullets.length&&!missiles.length&&!shots.length,'boss death removes remaining adds and hazards');
 check(cash===20&&kills===1,'boss pays once, removed adds grant no rewards');const hp=p.hp;step(1);check(state==='stageClear'&&cash===20&&kills===1&&p.hp===hp,'no reinforcements after boss death');step(.5);check(state==='stageClear'&&$('stage-clear').style.display==='flex','ending banner after quiet delay');step(1);check(state==='upgrade','shop after delay and banner');
}
reset();floor=3;startWave();finishBossIntro();check(!enemies.some(e=>e.type==='boss')&&campaignBoss===0,'third round is ordinary combat');check(state==='combat','alive boss remains in battle');
console.log('Boss kill by main weapon/drone clears adds and queued waves, pays once and opens shop after ending delay');
}`,sandbox);
