'use strict';
(()=>{
 const key='neon-tower-base-v1',defaults={center:1.4,middle:1,edge:.5,radius:.65,opacity:.96,white:.3};
 const status=document.querySelector('#status');let settings={...defaults};
 function read(raw){
  let parsed;try{parsed=JSON.parse(raw)||{};}catch{parsed={};}
  for(const name of Object.keys(defaults)){
   const input=document.getElementById(name),value=parsed[name];
   settings[name]=typeof value==='number'&&Number.isFinite(value)?Math.max(+input.min,Math.min(+input.max,value)):defaults[name];
  }
 }
 function render(){for(const [name,value]of Object.entries(settings)){document.getElementById(name).value=value;document.querySelector(`output[for="${name}"]`).textContent=name==='radius'||name==='opacity'||name==='white'?Math.round(value*100)+'%':value.toFixed(2);}document.querySelector('#values').textContent=JSON.stringify(settings);}
 function save(){render();try{localStorage.setItem(key,JSON.stringify(settings));status.textContent='已保存，已打开的游戏会实时同步。';}catch{status.textContent='浏览器禁止保存参数，请检查本站存储权限。';}}
 try{read(localStorage.getItem(key));}catch{status.textContent='无法读取已保存参数。';}render();
 document.querySelector('#controls').addEventListener('input',event=>{if(event.target.matches('input')){settings[event.target.id]=+event.target.value;save();}});
 document.querySelector('#bright').onclick=()=>{settings={center:1.65,middle:1.25,edge:.65,radius:.72,opacity:.98,white:.35};save();};
 document.querySelector('#soft').onclick=()=>{settings={center:1.25,middle:.85,edge:.38,radius:.65,opacity:.96,white:.3};save();};
 document.querySelector('#reset').onclick=()=>{settings={...defaults};save();};
 document.querySelector('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(JSON.stringify(settings,null,2));status.textContent='参数已复制，可以发到聊天中。';}catch{status.textContent='复制受限，可选中下方参数手动复制。';}};
 addEventListener('storage',event=>{if(event.key===key||event.key===null){read(event.newValue);render();status.textContent='已同步其他窗口的参数。';}});
})();
