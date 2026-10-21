const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);
vm.runInContext(fs.readFileSync('dist/virus.js','utf8'),sandbox);
vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
$('virus-health').style.setProperty=()=>{};startVirusTest();sound=false;virusGod=true;shootTimer=999;
const e=virusBoss;updateVirusBoss(.2);e.hp=210;e.fire=0;resolveVirusSplits();
const pose=[e.x,e.y,e.t,e.patternAge,e.fire],gait=JSON.stringify(e.gait),core=renderer.residentMeshes.get('virus:core').data;bullets=[];
updateVirusBoss(.375);check(e.splitPreparing&&Math.abs(e.splitWhite-.5)<1e-8&&livingViruses().length===1,'gradual half-white before creating any child');
check(JSON.stringify([e.x,e.y,e.t,e.patternAge,e.fire])===JSON.stringify(pose)&&JSON.stringify(e.gait)===gait&&!bullets.length,'preparation freezes movement, legs and attack');
renderer.begin();drawVirusBoss(e);check(Math.abs(renderer.residentMeshes.get('virus:core').instances[12]+.5)<1e-6,'gradual white is a GPU instance attribute');
e.hp=180;updateVirusBoss(.4);check(e.splitWhite===1&&livingViruses().length===1,'fully white held before split');
updateVirusBoss(.1);const children=livingViruses();check(children.length===2&&children.every(v=>v.hp===90&&v.max===90&&v.splitWhite>.98),'both pieces born white and preserve preparation damage');
const child=children.find(v=>v!==e);check(Math.hypot(child.x-e.x,child.y-e.y)<70,'child appears alongside source');
const positions=children.map(v=>[v.x,v.y]);updateVirusBoss(.3);check(children.every((v,i)=>Math.hypot(v.x-positions[i][0],v.y-positions[i][1])>1&&v.splitWhite>0&&v.splitWhite<.8),'both resume movement while fading');
updateVirusBoss(1);check(children.every(v=>v.splitWhite===0),'fade finishes at original material');renderer.begin();for(const v of children)drawVirusBoss(v);check(renderer.residentMeshes.get('virus:core').data===core,'white transition retains shared geometry');
startVirusTest();sound=false;virusGod=true;virusBoss.hp=210;resolveVirusSplits();virusBoss.hp=0;updateVirusBoss(2);check(!livingViruses().length,'death during preparation cancels splitting');
check(virusScale({generation:3})===.7,'final generation remains seventy percent');
console.log('Split freeze, progressive GPU white, full-white hold, nearby white child, moving fade, vulnerable HP conservation, death cancellation and larger final size passed');
`,sandbox);
