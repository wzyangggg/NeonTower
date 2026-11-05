const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
 const check=(v,m)=>{if(!v)throw Error(m)};
 reset();state='combat';timedRoom={remaining:60};p.x=325-4*TILE;p.y=300;
 const t={x:1,y:0,cashTile:true,healProgress:0,medPack:false};tiles=[t];
 updateHealing(29.9);check(!t.medPack&&t.healProgress>29,'automatic progress while far away');
 updateHealing(.1);check(t.medPack&&terrainQueue(t)[0].amount===3&&cash===0,'automatic production preserves physical pickup');
 updateHealing(60);check(terrainQueue(t).length===1,'full storage stops production');
 p.x=325+TILE;updateHealing(.01);check(cash===3&&!t.medPack,'walk over to collect');
 p.x-=4*TILE;terrainAdvanceProduction(t,3);check(t.healProgress===3,'bonus applies without tool or proximity');
 paused=true;updateHealing(10);check(t.healProgress===3,'pause freezes production');paused=false;
 check(!EQUIPMENT_LABELS.shovel&&!takeTestEquipment('shovel','digger',5),'removed equipment and lab slot');
 state='upgrade';cash=100;const old={key:'shovel',price:8};shopItems=[old];check(!buyShopItem(0)&&cash===100,'stale goods rejected without payment');
 console.log('Automatic cash production: distant timer, physical pickup, full storage, bonus, pause and retired equipment rejection passed');
}`,sandbox);
