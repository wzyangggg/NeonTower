'use strict';
(()=>{
 const $=id=>document.getElementById(id),fields=[['white','白底黑字时长',10,500,1,'ms'],['original','原色时长',10,1000,1,'ms'],['duration','总等待时长',100,5000,10,'ms'],['successVolume','完成音效音量',0,100,1,'%']];
 $('controls').innerHTML=fields.map(([key,label,min,max,step,unit])=>`<label><span>${label} <input type="number" id="${key}" min="${min}" max="${max}" step="${step}" aria-label="${label}"> ${unit}</span><input type="range" id="${key}-range" min="${min}" max="${max}" step="${step}" aria-label="${label}滑杆"></label>`).join('');
 function sync(){for(const [key] of fields){$(key).value=$(key+'-range').value=ButtonConfirm.timing[key];}const t=ButtonConfirm.timing; $('summary').textContent=`每秒约 ${(1000/(t.white+t.original)).toFixed(1)} 次 · 共约 ${(t.duration/(t.white+t.original)).toFixed(1)} 轮 · ${(t.duration/1000).toFixed(2)} 秒后执行`;}sync();
 for(const [key] of fields)for(const id of [key,key+'-range'])$(id).addEventListener(id===key?'change':'input',()=>{if($(id).value==='')return;ButtonConfirm.configure({[key]:$(id).value});sync();$('saved').textContent='尚未保存 · 当前参数可直接预览';});
 $('save').onclick=()=>{try{ButtonConfirm.configure(ButtonConfirm.timing,true);$('saved').textContent='已保存，游戏按钮已应用。';}catch{$('saved').textContent='保存失败，请检查浏览器存储设置';}};
 $('reset').onclick=()=>{ButtonConfirm.configure(ButtonConfirm.defaults);sync();$('saved').textContent='已恢复默认，点击保存后应用到游戏';};
 let context;function audio(){context??=new(window.AudioContext||window.webkitAudioContext)();context.resume();return context;}
 globalThis.ButtonConfirmAudio=()=>{const c=audio(),osc=c.createOscillator(),gain=c.createGain(),now=c.currentTime,t=ButtonConfirm.timing;osc.type='triangle';osc.frequency.value=660;gain.gain.value=0;osc.connect(gain);gain.connect(c.destination);for(let at=0;at<t.duration/1000;at+=(t.white+t.original)/1000){gain.gain.setValueAtTime(.035,now+at);gain.gain.exponentialRampToValueAtTime(.001,now+Math.min(at+.07,t.duration/1000));}osc.start();osc.stop(now+t.duration/1000);let stopped=false;const stop=()=>{if(stopped)return;stopped=true;try{osc.stop();}catch{}osc.disconnect();gain.disconnect();};osc.onended=stop;return stop;};
 globalThis.ButtonConfirmSuccessAudio=()=>{const c=audio();ButtonConfirm.successAudio(c,c.destination);};
 $('chime').onclick=ButtonConfirmSuccessAudio;
 $('preview').onclick=()=>{$('result').textContent='✓ 升级完成！';};
 $('preview').addEventListener('pointerdown',()=>{$('result').textContent='闪烁确认中…';});
})();

