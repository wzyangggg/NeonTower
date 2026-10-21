const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);




vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();state='combat';p.x=325;p.y=300;equipItem('shoes',createShoes('spider'));tiles=[];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++)tiles.push({x,y});updateSpiderGait(0);
function bounds(){renderer.begin();drawSpiderMech(p.x-325,(p.y-300)*1.06);const x=p.x-325,z=(p.y-300)*1.06;for(let i=0;i<renderer.count;i+=9){check(Number.isFinite(renderer.data[i])&&Number.isFinite(renderer.data[i+1])&&Number.isFinite(renderer.data[i+2]),'finite compact mesh');check(Math.abs(renderer.data[i]-x)<=TILE*.75+.001,'entire chassis and leg mesh within 1.5 tile width');check(Math.abs(renderer.data[i+2]-z)<=TILE*.75*1.06+.001,'entire chassis and leg mesh within 1.5 tile depth');}}
bounds();for(const speed of [195,390,1000])for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[.707,.707],[-.707,.707]]){for(let k=0;k<24;k++){p.x+=dx*speed*.016;p.y+=dy*speed*.016;updateSpiderGait(.016);bounds();}updateSpiderGait(.15);bounds();}
for(const leg of p.spiderGait.legs){leg.foot=[p.x+999,18,p.y-999];}bounds();
console.log('Full spider mesh stays within 1.5 x 1.5 tiles at rest, every step phase, cardinal/diagonal turns, boosted speed, long frame and extreme stale foot contacts passed');
}`,sandbox);
