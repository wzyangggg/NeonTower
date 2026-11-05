/* Isolated sheet -> API layer -> pixel-filter preview. */
(()=>{'use strict';
 const root=document.querySelector('.weapon-study');
 if(!root)return;
 const status=root.querySelector('[data-weapon-status]');
 root.querySelectorAll('[data-weapon-mode]').forEach(button=>button.addEventListener('click',()=>{
  const mode=button.dataset.weaponMode;
  root.querySelectorAll('[data-weapon-mode]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  root.querySelectorAll('[data-weapon-icon]').forEach(img=>{
   img.src=`assets/weapon-icon-study-v1/${img.dataset.weaponIcon}-${mode}.png`;
   img.style.imageRendering=mode==='original'?'auto':'pixelated';
  });
  status.textContent=mode==='original'?'当前：拆图原画 · 统一透明留白':`当前：${mode} × ${mode} 原生像素 · 共享64色 · 无抖动 · 显示96px`;
 }));
 root.querySelectorAll('[data-weapon-choice]').forEach(button=>button.addEventListener('click',()=>{
  root.querySelectorAll('[data-weapon-choice]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  root.querySelector('[data-weapon-selection]').textContent=`已选择：${button.dataset.weaponChoice}`;
 }));
})();
