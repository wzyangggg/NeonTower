'use strict';

globalThis.BossMoveEditor=(()=>{
 const schema=BossMoveSettings,storageKey='boss-move-settings-v1';
 let overrides={},onUpdate=()=>{},root,selected,status,timer,pending={},unsaved={},revision=0;
 let saves=Promise.resolve();
 function apply(saved){
  const valid={};
  for(const [id,values] of Object.entries(saved?.moves??{})){
   if(!Object.hasOwn(schema.fields,id)||!values||typeof values!=='object')continue;
   const keys=new Set(schema.fields[id].map(field=>field.key));
   try{valid[id]=schema.validate(id,Object.fromEntries(Object.entries(values).filter(([key])=>keys.has(key))));}catch{}
  }
  overrides=valid;
 }
 async function load(){
  let local;
  try{local=JSON.parse(localStorage.getItem(storageKey));}catch{}
  try{
   const response=await fetch('boss-move-settings.json',{cache:'no-store'});
   if(!response.ok)throw Error('读取失败');
   apply(await response.json());
  }catch{
   apply(local);
  }
  for(const [id,values] of Object.entries(local?.pending??{})){
   try{
    const valid=schema.validate(id,values);
    overrides[id]={...overrides[id],...valid};pending[id]={...valid};unsaved[id]={...valid};
   }catch{}
  }
 }
 function get(id){return {...schema.defaults[id],...overrides[id]};}
 function remember(){
  try{localStorage.setItem(storageKey,JSON.stringify({version:1,moves:overrides,pending:unsaved}));}catch{}
 }
 function flush(){
  clearTimeout(timer);
  const changes=pending,version=revision;pending={};
  saves=saves.then(async()=>{
   let success=true;
   for(const [move,values] of Object.entries(changes)){
    try{
     const response=await fetch('/api/boss-move-settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({move,values}),keepalive:true});
     if(!response.ok)throw Error('写入失败');
     for(const [key,value] of Object.entries(values)){
      if(unsaved[move]?.[key]===value)delete unsaved[move][key];
     }
     if(unsaved[move]&&!Object.keys(unsaved[move]).length)delete unsaved[move];
    }catch{success=false;}
   }
   if(version===revision)status.textContent=success?'已保存到项目 · 所有战机共享':'已保存在本机 · 项目写入失败，点击重试';
   if(!success){
    for(const [move,values] of Object.entries(changes))pending[move]={...values,...pending[move]};
   }
   remember();
  });
 }
 function update(id,values){
  const validated=schema.validate(id,values);
  overrides[id]={...overrides[id],...validated};
  pending[id]={...pending[id],...validated};revision++;
  unsaved[id]={...unsaved[id],...validated};
  remember();onUpdate(id);
  status.textContent='已应用 · 正在保存到项目…';
  clearTimeout(timer);timer=setTimeout(flush,300);
 }
 function render(){
  const values=get(selected);
  root.querySelector('[data-fields]').innerHTML=schema.fields[selected].map(field=>`<label class="boss-move-field">
   <span>${field.label}</span><input type="range" data-field="${field.key}" min="${field.min}" max="${field.max}" step="${field.step}" value="${values[field.key]}" aria-label="${field.label}">
   <input type="number" data-field="${field.key}" min="${field.min}" max="${field.max}" step="${field.step===1?1:'any'}" value="${values[field.key]}" aria-label="${field.label}数值"></label>`).join('');
  root.querySelector('.boss-move-scroll').scrollTop=0;
 }
 function mount(panel,initial,onChange,onPreview){
  onUpdate=onChange;selected=initial;
  root=document.createElement('div');root.className='boss-move-editor';
  root.innerHTML=`<div class="boss-move-editor-actions">
   <select aria-label="选择要调整的招式">${Object.entries(schema.arsenal).map(([id,spec])=>`<option value="${id}">${spec.name}</option>`).join('')}</select>
   <button type="button" data-preview>释放这招</button></div>
   <details><summary>招式参数 · 全局共享</summary><div class="boss-move-scroll"><div data-fields></div></div>
   <div class="boss-move-editor-actions"><button type="button" data-reset>恢复这招默认值</button></div>
   <button type="button" class="boss-move-save" data-save role="status">已读取项目参数</button></details>`;
  panel.querySelector('.air-boss-arsenal').before(root);
  status=root.querySelector('[data-save]');status.onclick=()=>{status.textContent='正在保存到项目…';flush();};
  const select=root.querySelector('select');select.value=initial;
  select.onchange=()=>{selected=select.value;render();};
  function edit(event){
   const input=event.target;if(!input.matches('[data-field]'))return;
   if(input.type==='number'&&event.type==='input')return;
   const field=schema.fields[selected].find(field=>field.key===input.dataset.field);
   if(!input.value||!input.checkValidity()){
    input.value=get(selected)[field.key];return;
   }
   const value=Number(input.value);
   root.querySelectorAll(`[data-field="${field.key}"]`).forEach(other=>{other.value=value;});
   update(selected,{[field.key]:value});
  }
  root.addEventListener('input',edit);
  root.addEventListener('change',event=>{if(event.target.type==='number')edit(event);});
  root.querySelector('[data-reset]').onclick=()=>{update(selected,schema.defaults[selected]);render();};
  const details=root.querySelector('details');
  root.querySelector('[data-preview]').onclick=()=>onPreview(selected);
  details.addEventListener('toggle',()=>{
   if(details.open)panel.querySelector('.air-boss-arsenal').open=false;
  });
  panel.querySelector('.air-boss-arsenal').addEventListener('toggle',event=>{if(event.target.open)details.open=false;});
  window.addEventListener('storage',event=>{
   if(event.key!==storageKey||!event.newValue)return;
   try{
    apply(JSON.parse(event.newValue));
    for(const [id,values] of Object.entries(unsaved))overrides[id]={...overrides[id],...values};
    onUpdate();render();status.textContent='已同步共享参数';
   }catch{}
  });
  window.addEventListener('pagehide',flush);
  render();
  if(Object.keys(pending).length)flush();
 }
 function show(id){
  if(id){selected=id;root.querySelector('select').value=id;render();}
  root.querySelector('details').open=true;
 }
 return {load,get,mount,show};
})();
