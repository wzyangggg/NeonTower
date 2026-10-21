/* Isolated inspection page: capture the actual player draw range, never a copied model. */
'use strict';
const robotViews={renderers:[],zoom:false,mesh:null,ready:false};
const source=document.getElementById('source');
source.addEventListener('load',()=>{try{
 const game=source.contentWindow;
 const mesh=game.eval(`(()=>{
  reset();paused=true;state='combat';time=1;p.x=325;p.y=300;p.inv=0;shoes=null;armor=null;enemies=[];spawnQueue=[];shake=0;
  let start=0,end=0,pointStart=0,pointEnd=0;const biped=drawPlayerBiped,held=drawHeldWeapon;
  try{drawPlayerBiped=g=>{start=renderer.count;pointStart=renderer.projectileCount;biped(g);};drawHeldWeapon=()=>{end=renderer.count;pointEnd=renderer.projectileCount;};draw();}
  finally{drawPlayerBiped=biped;drawHeldWeapon=held;}
  const data=renderer.data.slice(start,end),points=renderer.projectiles.slice(pointStart,pointEnd);
  return {data,points};
 })()`);
 robotViews.mesh=mesh;const Renderer=game.eval('Elevator3D');
 robotViews.renderers=['front','side','back'].map((id,i)=>{const r=new Renderer(document.getElementById(id));r.backgroundColor=[1,1,1];r.clubCyan=.2;r.clubMagenta=.12;r.topLight=[.8,.85,.82];r.rearLeftColor=[.6,.8,.75];r.rearRightColor=[.7,.75,.8];return {r,yaw:i*Math.PI/2};});
 robotViews.renderers[2].yaw=Math.PI;robotViews.ready=true;renderRobotViews();document.getElementById('status').hidden=true;
 }catch(error){document.getElementById('status').textContent='模型读取失败：'+error.message;console.error(error);}});
function renderRobotViews(){if(!robotViews.ready)return;for(const {r,yaw}of robotViews.renderers){
 r.resize();r.begin();const halfY=robotViews.zoom?Math.max(13,12*r.canvas.height/r.canvas.width):39,halfX=halfY*r.canvas.width/r.canvas.height,centreY=robotViews.zoom?8:31,c=Math.cos(yaw),s=Math.sin(yaw);
 r.vp=new Float32Array([c/halfX,0,-s/150,0,0,1/halfY,0,0,-s/halfX,0,-c/150,0,0,-centreY/halfY,0,1]);
 if(r.data.length<robotViews.mesh.data.length)r.data=new Float32Array(robotViews.mesh.data.length);r.data.set(robotViews.mesh.data);r.count=robotViews.mesh.data.length;
 if(r.projectiles.length<robotViews.mesh.points.length)r.projectiles=new Float32Array(robotViews.mesh.points.length);r.projectiles.set(robotViews.mesh.points);r.projectileCount=robotViews.mesh.points.length;
 r.box(0,.2,0,50,.4,40,'#d4deda');r.end();
 }}
document.getElementById('zoom').onclick=()=>{robotViews.zoom=!robotViews.zoom;document.getElementById('zoom').textContent=robotViews.zoom?'查看全身':'鞋子特写';renderRobotViews();};
window.addEventListener('resize',renderRobotViews);
