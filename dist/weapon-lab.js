'use strict';
// The campaign does not activate this scene unless explicitly requested in the URL.
var weaponLab;
if(typeof location!=='undefined'&&new URLSearchParams(location.search).get('weaponlab')==='1'){
 const params=new URLSearchParams(location.search);
 const css=document.createElement('style');css.textContent=`
 .weapon-lab .bottomhud,.weapon-lab #survival-clock{display:none!important}
 .weapon-lab #test-open{top:70px;bottom:auto;left:auto;right:14px}
 .weapon-panel{position:absolute;z-index:5;left:12px;right:12px;bottom:calc(18px + env(safe-area-inset-bottom));padding:10px;background:#101d31ed;border:1px solid #60849e;border-radius:9px;box-shadow:0 5px 18px #0006;color:#dceeff;font-size:11px;touch-action:manipulation}
 .weapon-panel .weapon-row{display:flex;gap:6px;align-items:center;margin-top:7px}.weapon-panel button,.weapon-panel select{min-width:0;border:1px solid #55748d;border-radius:5px;background:#20334c;color:#e6f5ff;padding:7px 8px;font:inherit;min-height:32px;touch-action:manipulation}
 .weapon-panel select{flex:1;width:100%}.weapon-panel #weapon-model{font-size:12px}.weapon-panel button.active{background:#185d65;border-color:#78e6ee}.weapon-panel button:disabled{opacity:.4;cursor:default}.weapon-panel strong{font-size:12px;color:#9eeaff}.weapon-panel output{float:right;color:#e0d19c;font-variant-numeric:tabular-nums;font-size:10px}
 .weapon-panel details{margin-top:7px}.weapon-panel summary{cursor:pointer;color:#a4cbe3;padding:4px}.weapon-panel .weapon-info{display:block;line-height:1.5;color:#b2c6d9;margin-top:7px}.weapon-panel a{color:#9eeaff;text-decoration:none;margin-left:auto}.weapon-panel label{display:flex;gap:5px;align-items:center;white-space:nowrap}.weapon-panel input{accent-color:#78e6ee}
 .weapon-panel:not(.expanded) .weapon-extra{display:none}.weapon-lab .wavehud{max-width:65%;line-height:1.5}
 @media(min-width:700px){.weapon-panel{max-width:440px;margin:auto}}
 @media(max-height:710px){.weapon-panel{padding:7px;bottom:8px}.weapon-panel .weapon-row{margin-top:5px}.weapon-panel button,.weapon-panel select{min-height:29px;padding:5px 7px}.weapon-panel .weapon-info{max-height:42px;overflow:auto}}
 `;document.head.append(css);document.body.classList.add('weapon-lab');document.title='武器测试场 · 地狱电梯';
 const panel=document.createElement('section');panel.className='weapon-panel';panel.setAttribute('aria-label','武器测试控制');
 panel.innerHTML=`<strong>武器测试场</strong><output id="weapon-metrics">伤害 0 · DPS 0 · 击杀 0</output>
 <div class="weapon-row"><button id="weapon-prev" aria-label="上一把武器">上一把</button><select id="weapon-model" aria-label="武器型号"></select><button id="weapon-next" aria-label="下一把武器">下一把</button></div>
 <div class="weapon-row"><select id="weapon-pattern" aria-label="靶子排列"><option value="single">单个重靶</option><option value="line">直线穿透靶</option><option value="crowd" selected>密集群靶</option><option value="moving">移动群靶</option></select><select id="weapon-health" aria-label="靶子生命"><option value="30">脆靶 30 HP</option><option value="300" selected>普通靶 300 HP</option><option value="3000">重靶 3000 HP</option></select></div>
 <div class="weapon-row"><button id="weapon-auto" class="active">自动射击 ON</button><button id="weapon-once">单发</button><button id="weapon-targets">重新布靶</button><button id="weapon-more" aria-expanded="false">更多</button></div>
 <div class="weapon-extra"><div class="weapon-row"><label><input id="weapon-god" type="checkbox" checked>无敌</label><button id="weapon-bullets">生成敌弹</button><button id="weapon-evolve">进化 +1</button><button id="weapon-hit">测试受击</button></div><div class="weapon-row"><button id="weapon-restart">重置当前武器</button><select id="weapon-background" aria-label="靶场背景"><option value="roof">蓝色屋顶</option><option value="original">原电梯</option></select><a href="index.html">返回主页</a></div><small class="weapon-info" id="weapon-info"></small><small class="weapon-info">WASD／摇杆移动；靶子自动补充。成长用脆靶测试，进化按钮可预览各阶段。暂停后仍可换枪。</small></div>`;
 $('viewport').append(panel);
 for(const [family,name]of Object.entries(WEAPON_FAMILY_NAMES)){const group=document.createElement('optgroup');group.label=name;for(const m of WEAPON_MODELS.filter(m=>m.familyId===family)){const opt=document.createElement('option');opt.value=m.id;opt.textContent='T'+m.tier+' · '+m.name;group.append(opt);} $('weapon-model').append(group);}
 weaponLab={active:true,god:true,firing:true,pattern:'crowd',health:300,targets:[],elapsed:0,damage:0,hudClock:0,currentId:'',
  positions(){return this.pattern==='single'?[[325,190]]:this.pattern==='line'?[[325,300],[325,235],[325,170],[325,105]]:this.pattern==='moving'?[[210,170],[325,160],[440,170],[235,265],[415,265]]:[[265,170],[325,170],[385,170],[265,225],[325,225],[385,225],[265,280],[325,280],[385,280]];},
  makeTarget(index,x,y){const e={type:'eye',x,y,homeX:x,homeY:y,hp:this.health,max:this.health,r:14,t:0,fire:999999,warn:false,seed:index*.83,terrainStun:this.pattern==='moving'?0:999999,weaponLabTarget:true};enemies.push(e);return {e,index,x,y,lastHealth:e.hp,respawn:0};},
  resetTargets(){enemies=[];missiles=[];bullets=[];shots=[];particles=[];blasts=[];explosionFX=[];shockWaves=[];this.targets=this.positions().map(([x,y],i)=>this.makeTarget(i,x,y));this.elapsed=this.damage=this.hudClock=0;kills=0;shootTimer=0;this.hud();},
  select(id,keepPause=true){if(!WEAPON_MODELS.some(m=>m.id===id))return false;const wasPaused=paused;equipItem('weapon',createWeaponModel(id));this.currentId=id;$('weapon-model').value=id;this.resetTargets();if(keepPause)paused=wasPaused;const p=new URLSearchParams(location.search);p.set('weaponlab','1');p.set('weapon',id);history.replaceState(null,'','?'+p);this.hud();return true;},
  setup(){reset();testMode=true;state='combat';paused=false;timedRoom=greedRoom=null;floor=1;campaignBoss=0;chaserSpawned=999;spawnQueue=[];spawnTimer=999;turrets=[];armor=shoes=drone=null;p.x=325;p.y=410;p.hp=p.max=9;p.shield=0;p.inv=0;scroll=0;time=0;tiles=[];for(let y=grid.minY;y<=grid.maxY;y++)for(let x=grid.minX;x<=grid.maxX;x++)tiles.push({x,y});
   this.currentId='';this.select(WEAPON_MODELS.some(m=>m.id===params.get('weapon'))?params.get('weapon'):'rocket_t5',false);
   if(typeof StreetScene!=='undefined'){StreetScene.enabled=true;StreetScene.place='roof';StreetScene.look='blue';StreetScene.rain=false;}
   renderer.sceneKey=null;$('overlay').style.display='none';$('pause-panel').hidden=true;$('equipment-test').hidden=true;$('viewport').classList.remove('paused','falling','landing');clearTimeout(toast.timer);$('toast').classList.remove('show');$('test-open').textContent='F2 装备';updateUI();this.hud();draw();
  },
  update(dt){
   if(this.currentId!==weapon.itemId){this.currentId=weapon.itemId;$('weapon-model').value=weapon.itemId||'';this.elapsed=this.damage=0;for(const t of this.targets)t.lastHealth=Math.max(0,t.e.hp);}
   this.elapsed+=dt;for(let i=0;i<this.targets.length;i++){const t=this.targets[i];this.damage+=Math.max(0,t.lastHealth-Math.max(0,t.e.hp));t.lastHealth=Math.max(0,t.e.hp);if(t.e.hp<=0){t.respawn+=dt;if(t.respawn>=.4)this.targets[i]=this.makeTarget(t.index,t.x,t.y);}}
   this.hudClock+=dt;if(this.hudClock>=.15){this.hudClock=0;this.hud();}
  },
  hud(){updateUI();$('status').textContent='武器测试场 · '+(this.god?'无敌':'实战伤害');$('wave').textContent='自动补靶 · 无层数结算';$('weapon-metrics').textContent='伤害 '+Math.round(this.damage)+' · DPS '+(this.damage/Math.max(.2,this.elapsed)).toFixed(1)+' · 击杀 '+kills;$('weapon-info').textContent=equipmentName(weapon)+'：'+weapon.desc;$('weapon-evolve').disabled=!weapon.growth||weapon.growth.stage>=2;},
  next(delta){const index=WEAPON_MODELS.findIndex(m=>m.id===weapon.itemId);this.select(WEAPON_MODELS[(index+delta+WEAPON_MODELS.length)%WEAPON_MODELS.length].id);},
 };
 $('weapon-model').onchange=()=>weaponLab.select($('weapon-model').value);$('weapon-prev').onclick=()=>weaponLab.next(-1);$('weapon-next').onclick=()=>weaponLab.next(1);
 $('weapon-pattern').onchange=()=>{weaponLab.pattern=$('weapon-pattern').value;weaponLab.resetTargets();};$('weapon-health').onchange=()=>{weaponLab.health=Number($('weapon-health').value);weaponLab.resetTargets();};
 $('weapon-auto').onclick=()=>{weaponLab.firing=!weaponLab.firing;$('weapon-auto').textContent='自动射击 '+(weaponLab.firing?'ON':'OFF');$('weapon-auto').classList.toggle('active',weaponLab.firing);};
 $('weapon-once').onclick=()=>{const targets=combatTargets();if(!targets.length)return;const e=targets.reduce((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)<Math.hypot(b.x-p.x,b.y-p.y)?a:b);shootWeapon(Math.atan2(e.y-p.y,e.x-p.x));draw();};
 $('weapon-targets').onclick=()=>weaponLab.resetTargets();$('weapon-more').onclick=()=>{$('weapon-more').setAttribute('aria-expanded',String(panel.classList.toggle('expanded')));};
 $('weapon-god').onchange=()=>{weaponLab.god=$('weapon-god').checked;p.inv=0;weaponLab.hud();};
 $('weapon-bullets').onclick=()=>{for(let i=0;i<12;i++){const a=i*TAU/12;bullet(p.x+Math.cos(a)*150,p.y+Math.sin(a)*150,a+Math.PI,110,'#ff655c',4);}draw();};
 $('weapon-evolve').onclick=()=>{if(!weapon.growth)return;const stage=Math.min(2,weapon.growth.stage+1);setModelGrowth(weapon,weapon.growth.kind==='kills'?[0,8,20][stage]:[0,12,24][stage]);weaponLab.hud();draw();};
 $('weapon-hit').onclick=()=>{const god=weaponLab.god;weaponLab.god=false;p.hp=p.max;p.inv=0;hurt();weaponLab.god=god;weaponLab.hud();draw();};
 $('weapon-restart').onclick=()=>{const id=weapon.itemId;if(state!=='combat')weaponLab.setup();weaponLab.select(id);};
 $('weapon-background').onchange=()=>{if(typeof StreetScene!=='undefined')StreetScene.enabled=$('weapon-background').value==='roof';renderer.sceneKey=null;draw();};
 window.weaponLab=weaponLab;weaponLab.setup();
}
