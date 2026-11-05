// Normalize generated low-resolution designs to exact 36x36 PNGs and seven flat colors.
const fs=require('node:fs');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const version=process.argv[2]||'v2';
if(!['v2','v3'].includes(version))throw Error('Expected v2 or v3');
const palettes=version==='v3'?{
 rocket:['#bde6f2','#494038','#ae772f','#efb52e','#e96a3c','#7852af','#fff0b8'],
 pistol:['#ffd7ba','#494038','#b94f37','#ec7950','#bb8a55','#fff0b8','#777c7c'],
 sniper:['#ddd2f5','#494038','#596978','#a6b0ae','#ce9859','#fff0b8','#d96042']
}:{
 rocket:['#bde6f2','#263849','#46675b','#83c943','#c8e967','#f89445','#fff1bc'],
 pistol:['#ffd7ba','#263849','#bd5143','#f47f50','#ffd15a','#48bcb5','#fff1bc'],
 sniper:['#ddd2f5','#263849','#367d8b','#50bfc8','#9ae4df','#ffd15a','#fff1bc']
};
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4173/');
 for(const [key,palette] of Object.entries(palettes)){
  const data=await page.evaluate(async({key,palette,version})=>{
   const img=new Image();img.src=`assets/shop-pixel/${key}-${version}-source.png`;await img.decode();
   const canvas=document.createElement('canvas');canvas.width=canvas.height=36;
   const ctx=canvas.getContext('2d');ctx.fillStyle=palette[0];ctx.fillRect(0,0,36,36);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,3,3,30,30);
   const pixels=ctx.getImageData(0,0,36,36),colors=palette.map(c=>c.slice(1).match(/../g).map(x=>parseInt(x,16)));
   for(let i=0;i<pixels.data.length;i+=4){let best=colors[0],distance=Infinity;
    for(const color of colors){const d=color.reduce((s,v,k)=>s+(v-pixels.data[i+k])**2,0);if(d<distance){distance=d;best=color}}
    pixels.data.set([...best,255],i);
   }
   ctx.putImageData(pixels,0,0);return canvas.toDataURL('image/png').split(',')[1];
  },{key,palette,version});
  fs.writeFileSync(`dist/assets/shop-pixel/${key}-${version}-36.png`,Buffer.from(data,'base64'));
  console.log(`${key}: 36x36 PNG, seven-color palette`);
 }
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
