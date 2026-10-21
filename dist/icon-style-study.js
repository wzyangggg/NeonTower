/* Local study only: same live shop renderer, fixed 64px frames, three generated treatments. */
(()=>{
 const styles=[['color','1 · 彩色剪影'],['cyan','2 · 青色符号'],['industrial','3 · 工业标识']];
 let selected='cyan';
 const sheets={color:{path:'assets/icon-study-color.png',width:2172,height:724},cyan:{path:'assets/icon-study-cyan.png',width:2172,height:724},industrial:{path:'assets/icon-study-industrial.png',width:2172,height:724}};
 function apply(){
  const panel=document.querySelector('.shop-panel');if(!panel)return;
  panel.classList.add('icon-style-study');panel.dataset.iconStyle=selected;
  if(!panel.querySelector('.icon-study-controls')){
   const controls=document.createElement('section');controls.className='icon-study-controls';controls.setAttribute('aria-label','Icon风格对比');
   controls.innerHTML='<p>同一组装备 · 64×64 外框 · 48×48 图形区域</p><div class="icon-study-options">'+styles.map(([key,label])=>'<button type="button" data-style="'+key+'" aria-pressed="false">'+label+'</button>').join('')+'</div>';
   controls.addEventListener('click',event=>{const button=event.target.closest('[data-style]');if(button){selected=button.dataset.style;apply();}});
   panel.prepend(controls);
  }
  panel.querySelectorAll('[data-style]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.style===selected)));
  const sheet=sheets[selected],cell=sheet.width/3;
  panel.querySelectorAll('.shop-equipment-icon').forEach(frame=>{
   const index=frame.dataset.icon==='weapon'?0:frame.dataset.icon==='armor'?1:2;
   const svg=frame.querySelector('svg'),image=svg.querySelector('image');
   svg.setAttribute('viewBox',`${index*cell} 0 ${cell} ${sheet.height}`);
   image.setAttribute('href',sheet.path);image.setAttribute('width',sheet.width);image.setAttribute('height',sheet.height);
  });
 }
 apply();
 new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.('.shop-panel')||node.querySelector?.('.shop-panel')))))apply();}).observe(document.querySelector('#overlay'),{childList:true,subtree:true});
})();
