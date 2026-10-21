const fs=require('fs'),vm=require('vm');const els={},handlers={};function el(){return {style:{},classList:{add(){},remove(){}},firstElementChild:{style:{}},handlers:{},addEventListener(k,f){this.handlers[k]=f},setPointerCapture(){},closest(){return null},getBoundingClientRect(){return {left:10,top:100,width:390,height:390}}}}const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,createShader:()=>({}),createProgram:()=>({}),createBuffer:()=>({})},{get(t,k){return t[k]||(()=>{})}});const canvas=el();canvas.getContext=()=>gl;const win={innerHeight:800,devicePixelRatio:1,addEventListener(k,f){(handlers[k]??=[]).push(f)}};const sandbox={console,Math,Float32Array,performance:{now:()=>0},localStorage:{getItem:()=>0,setItem(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},window:win,document:{querySelector:()=>canvas,getElementById:id=>els[id]||(els[id]=el()),querySelectorAll:()=>[]}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/renderer.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);



vm.runInContext(`{
function check(v,m){if(!v)throw Error(m)}
reset();state='upgrade';cash=500;shopLevel=1;
for(const key of Object.keys(EQUIPMENT_LABELS)){
 const u=equipmentShopItem(key),e=itemEquipment(u);u.price=shopPrice(u);u.sold=false;shopItems=[u];renderShop();
 check(u.blindBox&&u.amount===1&&equipmentShopCategories(key,e).includes(u.name),'category offer');
 check(!$('overlay').innerHTML.includes('<b>'+e.name+'</b>')&&!$('overlay').innerHTML.includes('shop-item-description'),'shelf hides identity and stats');
 const wallet=cash,old=equipmentInSlot(key),saved=JSON.stringify(e);
 check(buyShopItem(0)&&pendingEquipment&&cash===wallet-u.price&&u.sold,'pay before reveal');
 check($('overlay').innerHTML.includes(e.name)&&$('overlay').innerHTML.includes('新装备'),'paid identity and stats');
 check(!buyShopItem(0)&&!rerollShop()&&!upgradeShop()&&!buyShopExpansion(),'modal blocks transactions');
 check(confirmEquipmentPurchase()&&cash===wallet-u.price,'confirmation never charges twice');
 const actual=equipmentInSlot(key);check(actual.id===e.id&&actual.tier===e.tier,'actual revealed equipment');
 check(!confirmEquipmentPurchase()&&!buyShopItem(0),'duplicate charges blocked');
 const next=equipmentShopItem(key);next.price=shopPrice(next);shopItems=[next];renderShop();const balance=cash,held=equipmentInSlot(key);
 check(buyShopItem(0)&&cancelEquipmentPurchase(),'discard paid equipment');
 check(cash===balance-next.price&&next.sold&&next.discarded&&equipmentInSlot(key)===held,'discard has no refund or equip');
 check(!buyShopItem(0)&&!confirmEquipmentPurchase(),'discard cannot reopen');cash=500;

}
const random=Math.random;
try{
 for(const key of Object.keys(EQUIPMENT_LABELS)){
  const base=key==='shovel'?createShovel('digger',3):key==='armor'?createArmor('energy',3):key==='shoes'?createShoes('steady',3):key==='drone'?createDrone('pulse',3):createWeapon('pulse',3);
  Math.random=()=>0;const low=rollEquipmentStats(key,base);Math.random=()=>1;const high=rollEquipmentStats(key,base);
  const fields=key==='shovel'?['interval']:key==='armor'?['invBonus']:key==='shoes'?['speedBonus','invBonus']:['damage','interval'];
  for(const field of fields){check(low[field]<base[field]&&high[field]>base[field],'same model/quality can differ');check(Math.abs(low[field]-base[field]*.85)<=.00051&&Math.abs(high[field]-base[field]*1.15)<=.00051,'bounded 15 percent variance');}
  check(base.id===low.id&&low.tier===high.tier,'model and quality retained');
  if(key==='armor')check(low.maxHp===base.maxHp&&Number.isInteger(low.maxHp),'health remains integer');
  if(key==='weapon'||key==='drone')check(low.pellets===base.pellets&&low.pierce===base.pierce,'firing patterns unchanged');
 }
 Math.random=()=>0;check(rollEquipmentStats('shoes',createShoes('runner')).invBonus===0,'zero stats stay zero');
}finally{Math.random=random}
reset();for(let level=1;level<=5;level++){shopLevel=level;for(let i=0;i<50;i++){rollShop();for(const u of shopItems.filter(u=>EQUIPMENT_LABELS[u.key])){check(u.blindBox&&u.amount===1&&itemEquipment(u).tier<=level,'every equipment offer is concrete');const base=EQUIPMENT_PRICES[u.key];check(u.price===Math.ceil((base[0]+(itemEquipment(u).tier-1)*base[1])*SHOP_PRICE_MULTIPLIERS[level-1])+shopDepthMarkup(),'variance does not change price');}}}
reset();state='upgrade';cash=0;const u=equipmentShopItem('shoes');u.price=8;shopItems=[u];check(!buyShopItem(0)&&!u.opened&&!pendingEquipment,'unaffordable equipment cannot open');
console.log('Category boxes: concealed stock, paid reveals, no-refund discard, atomic confirmation and bounded stat variance passed');
}`,sandbox);
