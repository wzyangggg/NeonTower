// A local art trial using the real shop. Normal game stock is unaffected.
(function waitForGame(){
 if(typeof renderShop!=='function'||!globalThis.HexMap?.ready||!globalThis.ElectricEditor)return setTimeout(waitForGame,100);
 const originalIcon=shopItemIcon,originalName=shopItemName,originalRender=renderShop;
 shopItemIcon=function(u,index){return u.pixelSample?`<span class="shop-equipment-icon pixel-sample" aria-hidden="true"><canvas width="36" height="36" data-pixel-source="${u.pixelSample}"></canvas></span>`:originalIcon(u,index)};
 renderShop=function(...args){
  originalRender(...args);
  document.querySelectorAll('.pixel-sample canvas').forEach(canvas=>{
   const image=new Image();
   image.onload=()=>{const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0);canvas.dataset.ready='true';canvas.dataset.sourceSize=`${image.naturalWidth}x${image.naturalHeight}`};
   image.src=`assets/shop-pixel/${canvas.dataset.pixelSource}-v3-36.png`;
  });
 };
 shopItemName=function(u){return u.pixelSample?({rocket:'火箭筒',pistol:'手枪',sniper:'狙击枪'})[u.pixelSample]:originalName(u)};
 reset();state='upgrade';paused=true;terrainView='equipment';cash=999;shopLevel=1;
 shopItems=['rocket','pistol','sniper'].map(family=>{
  const model=WEAPON_MODELS.find(m=>m.familyId===family),equipment=createWeaponModel(model.id);
  const u={key:'weapon',amount:1,equipment,weapon:equipment,blindBox:true,opened:false,pixelSample:family};
  return {...u,price:shopPrice(u),sold:false};
 });
 renderShop();
 document.querySelector('.shop-panel>.tag').textContent='ITEM ART · 36×36 · 卡通道具风格';
})();
