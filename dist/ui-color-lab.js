/* Standalone specimen: all changes remain in this page's memory. */
const labState={level:4,balance:120,saved:false};
const status=document.querySelector('#preview-status');
const render=()=>{const row=document.querySelector('.stat-row');row.querySelector('small').innerHTML=`当前 +${labState.level*2}% <span>→ +${(labState.level+1)*2}%</span>`;row.querySelector('.meter').innerHTML=Array.from({length:6},(_,i)=>`<i${i>=labState.level?' class="empty"':''}></i>`).join('');document.querySelector('.character-header strong').innerHTML=`◆ ${labState.balance}<small>可用分数</small>`;document.querySelector('#add-stat').disabled=labState.level>=6||labState.balance<10;};
document.querySelectorAll('[data-gear]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-gear]').forEach(other=>{const selected=other===button;other.classList.toggle('selected',selected);other.setAttribute('aria-pressed',String(selected));other.querySelector('.state').textContent=selected?'已选择':'可选择';});document.querySelector('#selection-status').textContent=`已选择：${button.dataset.gear}`;}));
document.querySelector('#ambient').addEventListener('change',event=>document.body.classList.toggle('no-ambient',!event.target.checked));
document.querySelector('#bloom').addEventListener('change',event=>{document.body.classList.toggle('no-bloom',!event.target.checked);NeonPostFX.settings.bloom=event.target.checked;NeonPostFX.refresh();});
document.querySelector('#add-stat').addEventListener('click',()=>{if(labState.level>=6||labState.balance<10)return;labState.level++;labState.balance-=10;labState.saved=false;render();status.textContent='预览已加点，尚未保存 · 每次消耗10点';});
document.querySelector('#reset').addEventListener('click',()=>{Object.assign(labState,{level:4,balance:120,saved:false});render();status.textContent='预览已重置，不影响游戏存档';});
document.querySelector('#save').addEventListener('click',()=>{labState.saved=true;status.textContent='样板配置已确认，仅本页有效';});

// Reuse the project compositor; specimen overrides stay in memory, not saved preferences.
document.addEventListener('DOMContentLoaded',()=>{Object.assign(NeonPostFX.settings,NeonPostFX.defaults,{enabled:true,bloom:true,bloomStrength:.52,threshold:.74,radius:1.15,chromatic:true,chromaticStrength:.12,scanlines:true,scanStrength:.012,vignette:true,vignetteStrength:.05,distortion:false});NeonPostFX.refresh();});
const itemStatus=document.querySelector('#item-status');
document.querySelectorAll('[data-icon-size]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelector('.item-grid').style.setProperty('--icon-size',button.dataset.iconSize+'px');
 document.querySelectorAll('[data-icon-size]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
 itemStatus.textContent=`当前 ${button.dataset.iconSize} px · 点击物品查看选中效果`;
}));
document.querySelectorAll('[data-item]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-item]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
 itemStatus.textContent=`已选择：${button.dataset.item}`;
}));
