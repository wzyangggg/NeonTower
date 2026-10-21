'use strict';
(async()=>{
 const start=document.getElementById('start');start.disabled=true;start.textContent='正在连接夜城…';
 try{
  const response=await fetch('game.js');if(!response.ok)throw Error('读取原版引擎失败：'+response.status);
  const source=await response.text(),params=new URLSearchParams(location.search),lab=params.get('lab')==='1'||params.get('weaponlab')==='1';
  const engine=document.createElement('script');engine.textContent=lab?source:HexMap.transform(source);document.body.append(engine);
  for(const file of ['shop-effects.js','snake.js','virus.js','humanoid.js','cowboy.js','crimson-mech.js','drone-boss.js','ufo-boss.js','fish-school.js','performance.js','scene-lab.js','weapon-lab.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=file;script.onload=resolve;script.onerror=()=>reject(Error('读取原版模块失败：'+file));document.body.append(script);});
  HexMap.ready=true;start.disabled=false;start.innerHTML='进入游戏 <span aria-hidden="true">→</span>';
 }catch(error){console.error(error);start.textContent='加载失败，请刷新';document.getElementById('overlay').querySelector('p').textContent=error.message;}
})();
