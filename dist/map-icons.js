'use strict';
// Raster artwork. Bomb icons are generated individually with image_gen; provenance in source-assets/tile-icons-flat/.
globalThis.MapIcons=(()=>{
 const kinds=['missile_bomb','freeze_bomb','laser_bomb','tower','miner','irrigator','pulse','biogenerator','battery','echo','turbine','apple','watermelon','banana','grape','medical','shield','cash','barricade','erase','clockshop','repair_turret','spikes','saw','flywheel'],assets=new Map(),quads=new Map();
 const flatKinds=new Set(['freeze_bomb','laser_bomb','missile_bomb']);
 const canonical=kind=>kind==='shotgun_tower'?'tower':kind==='sniper_tower'?'missile_bomb':kind==='slow_field'?'freeze_bomb':kind==='shield_tower'?'shield':kind==='electric_tower'?'tower':kind==='healing_tower'?'medical':kind==='missile_tower'?'missile_bomb':kind==='energy'?'battery':kind==='shock'?'pulse':kind==='cover'?'barricade':kind;
 const colors={missile_bomb:'#ffb36c',freeze_bomb:'#a3f4ff',laser_bomb:'#ff80c8',clockshop:'#ffd782',repair_turret:'#54e58b',tower:'#66ddff',miner:'#ffd260',irrigator:'#63e9c2',pulse:'#9b9bff',biogenerator:'#f183b5',battery:'#b6e865',echo:'#d399f1',turbine:'#ffa85c',apple:'#ff686f',watermelon:'#64df83',banana:'#ffe16a',grape:'#bd82f4',medical:'#79e5aa',shield:'#72baff',cash:'#ffd260',barricade:'#dbb484',erase:'#f18e86',spikes:'#f58383',saw:'#ffc170',flywheel:'#b5d4e5'};
 const color=kind=>colors[canonical(kind)]||'#d5e7f0';
 const url=kind=>'assets/map-icons/'+canonical(kind)+(['clockshop','repair_turret'].includes(canonical(kind))?'.svg':'.png');
 const starPoints=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,r=i%2?.44:1;return [Math.cos(a)*r,Math.sin(a)*r];});
 const levelCount=level=>Math.max(1,Math.min(3,Math.round(level||1)));
 function stars(level,x,y){return `<g data-level-stars="${levelCount(level)}" pointer-events="none" fill="#ffe978" stroke="#fff8d5" stroke-width=".8" stroke-linejoin="round" style="filter:drop-shadow(0 0 2px #fff2a6) drop-shadow(0 0 5px #ffb52b)">${Array.from({length:levelCount(level)},(_,i)=>`<polygon points="${starPoints.map(([px,py])=>[x+(i-(levelCount(level)-1)/2)*17+px*8.5,y+py*8.5].join(',')).join(' ')}"/>`).join('')}</g>`;}
 if(typeof Image!=='undefined')for(const kind of kinds){const image=new Image();assets.set(kind,{image});image.src=url(kind);}
 function ground(r,kind,x,z,size=24,y=4.35,bloom=false){
  y+=globalThis.RoomReady?.liftAt(x,z)||0;
  const flat=flatKinds.has(canonical(kind));if(flat)bloom=false;
  const asset=assets.get(canonical(kind));if(!asset?.image.complete||!asset.image.naturalWidth||!r.gl||!r.sprites)return false;
  const gl=r.gl;
  if(asset.program!==r.spriteProgram){asset.texture=gl.createTexture();asset.program=r.spriteProgram;gl.bindTexture(gl.TEXTURE_2D,asset.texture);for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);let source=asset.image;if(flat&&typeof document.createElement==='function'){if(!asset.raster){asset.raster=document.createElement('canvas');asset.raster.width=asset.raster.height=128;asset.raster.getContext('2d').drawImage(asset.image,0,0,128,128);}source=asset.raster;}gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);}
  const key=[x,z,size,y].join(','),half=size/2;let data=quads.get(key);
  if(!data){const p=[[x-half,y,z-half*1.06,0,0],[x+half,y,z-half*1.06,1,0],[x+half,y,z+half*1.06,1,1],[x-half,y,z+half*1.06,0,1]];data=new Float32Array([0,1,2,0,2,3].flatMap(i=>p[i]));if(quads.size>2048)quads.clear();quads.set(key,data);}
  const tint=r.color(color(kind));
  if(bloom){
   // Padding permits the halo to spread beyond the glyph without clipping.
   const glowKey='glow:'+key;let glowData=quads.get(glowKey);
   if(!glowData){glowData=new Float32Array(data);for(let i=0;i<glowData.length;i+=5){glowData[i]=x+(data[i]-x)*2.4;glowData[i+2]=z+(data[i+2]-z)*2.4;}quads.set(glowKey,glowData);}
   r.sprites.push({kind:'mapIconGlow',texture:asset.texture,data:glowData,opacity:.65,tint});
  }
  r.sprites.push({kind:'mapIcon',iconKind:canonical(kind),texture:asset.texture,data,opacity:1,tint,bloom,flat});return true;
 }
 function symbol(kind,x,y,scale=1){if(!kinds.includes(canonical(kind)))return '';const size=25.6*scale;return `<svg class="map-raster-icon" x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" viewBox="0 0 32 32" pointer-events="none"><defs><mask id="map-symbol-${canonical(kind)}" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32" style="mask-type:alpha"><image href="${url(kind)}" width="32" height="32"/></mask></defs><rect width="32" height="32" fill="${color(kind)}" mask="url(#map-symbol-${canonical(kind)})"/></svg>`;}
 return {kinds,url,colors,color,ground,stars,symbol,get ready(){return assets.size===kinds.length&&[...assets.values()].every(a=>a.image.complete&&a.image.naturalWidth);}};
})();
