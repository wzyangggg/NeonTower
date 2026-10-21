const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);

vm.runInContext(`
function check(v,m){if(!v)throw Error(m)}
function shaderColor(u,y){const f=renderer.waterfallFrame,scaled=u*23,k=Math.floor(scaled),energy=(renderer.waterfallSpectrum[k]*(1-(scaled-k))+renderer.waterfallSpectrum[Math.min(23,k+1)]*(scaled-k))/255;let c=f.baseColor.slice();for(let i=0;i<7;i++){const a=i*4;if(u<f.lanes[a]||u>f.lanes[a+1])continue;const length=f.lanes[a+2],tail=((y+f.lanes[a+3])%length+length)%length/length,alpha=.08+.84*(1-tail)**1.7,shade=screenRainbowColor((f.hues[i]-tail*.1)*12,0),glow=.3+.7*(1-tail)**.7+energy*.08;c=c.map((v,j)=>v*(1-alpha)+shade[j]*glow*alpha);}return c;}
let comparisons=0;
for(const height of [624,850])for(const t of [0,.73,6.2,11.7,810.3])for(const shaft of [0,719,4320]){
 time=t;scroll=shaft;renderer.halfY=height;for(let i=0;i<24;i++)music.bands[i]=(i%5)/4;renderer.begin();drawSpectrumScreen(-257,351);
 check(renderer.count===0&&renderer.waterfallData.length===18,'background geometry resides separately as six vertices');
 const offset=((scroll%SCREEN_PITCH)+SCREEN_PITCH)%SCREEN_PITCH;
 for(let u=.01;u<1;u+=.037)for(let y=-700;y<1100;y+=73){const expected=waterfallComposite(time,u,y-offset),got=shaderColor(u,y);for(let k=0;k<3;k++)check(Math.abs(got[k]-expected[k])<.003,'GPU parameters preserve RGB/FFT/flow');comparisons++;}
 check(renderer.waterfallData.every(Number.isFinite),'finite rectangle at different viewport heights');
}
console.log('GPU waterfall: six resident vertices, hue/FFT/scroll shader parameters matched '+comparisons+' analytic color samples');
`,sandbox);
