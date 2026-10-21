/* Browse all purchasable categories using the real shop renderer, three at a time. */
(()=>{
 const equipment=SHOP_EQUIPMENT_ICON_CATEGORIES.map((category,i)=>{
  for(const key of Object.keys(EQUIPMENT_LABELS)){
   const types=key==='weapon'?WEAPON_MODELS:key==='armor'?ARMOR_TYPES:key==='shoes'?SHOE_TYPES:key==='drone'?COMPANION_TYPES:SHOVEL_TYPES;
   const factory=key==='weapon'?createWeaponModel:key==='armor'?createArmor:key==='shoes'?createShoes:key==='drone'?createDrone:createShovel;
   for(const type of types){const e=factory(type.id,3);if(equipmentShopCategories(key,e).includes(category)){e.tier=[1,3,5][i%3];return {key,equipment:e,category,blindBox:true,opened:false,amount:1,price:[16,36,64][i%3],sold:false};}}
  }
  throw Error('Missing preview category '+category);
 });
 const building=['medical','shield','cashTile','shockTile','coverTile'].map(key=>{
  const d=TERRAIN_CATALOG.find(d=>d.kind==='地块建造'&&terrainItemKey(d)===key);return {key,name:'建造'+d.name,desc:d.desc,amount:1,price:12,sold:false};
 });
 const passive=['medical','shield','cashTile','shockTile','coverTile'].map(key=>{
  const d=TERRAIN_CATALOG.find(d=>d.kind==='稀有被动'&&terrainItemKey(d)===key);return {key:'terrainPassive',terrainId:d.id,name:d.name,desc:d.desc,amount:1,price:24,sold:false};
 });
 const extra=[{key:'heal',name:'应急修复',desc:'回复 2 格生命',amount:2,price:4},{key:'erase',name:'拆除危险源',desc:'拆除 1 个危险机关',amount:1,price:8},{key:'floor',name:'扩建地板',desc:'随机发现地形',amount:3,price:8},{key:'maxhp',name:'生命核心',desc:'生命上限 +1',amount:1,price:12},{key:'speed',name:'轻量骨架',desc:'移速 +15%',amount:.15,price:8},{...drinkShopItem(DRINK_TYPES[0].id),sold:false}];
 const pages=[];for(let i=0;i<equipment.length;i+=3)pages.push({name:'装备类别 '+(i/3+1)+'/6',items:equipment.slice(i,i+3)});
 for(const [name,items]of [['地块建造',building],['地块加成',passive],['补给与其他',extra]])for(let i=0;i<items.length;i+=3)pages.push({name:name+' '+(i/3+1),items:items.slice(i,i+3)});
 let page=Math.max(0,Math.min(pages.length-1,Number(new URLSearchParams(location.search).get("icons"))||0));
 function attach(){const panel=document.querySelector('.shop-panel.shop-quality');if(!panel||panel.querySelector('.all-icons-controls'))return;
  const controls=document.createElement('section');controls.className='all-icons-controls';controls.setAttribute('aria-label','全部商品图标预览');
  controls.innerHTML='<button type="button" data-step="-1" aria-label="上一组图标">←</button><span>'+pages[page].name+' · '+(page+1)+'/'+pages.length+'</span><button type="button" data-step="1" aria-label="下一组图标">→</button>';
  controls.addEventListener('click',event=>{const button=event.target.closest('[data-step]');if(button){page=(page+Number(button.dataset.step)+pages.length)%pages.length;show();}});panel.prepend(controls);
 }
 function show(){cash=999;shopItems=pages[page].items.map(u=>({...u,sold:false}));renderShop();attach();}
 show();new MutationObserver(attach).observe(document.querySelector('#overlay'),{childList:true});
})();
