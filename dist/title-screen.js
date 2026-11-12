"use strict";
(() => {
 const params = new URLSearchParams(location.search);
 const enabled = !['lab', 'weaponlab'].some(key => params.get(key) === '1');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const showCity = params.get('title') === 'city';
 const showWaterfall = params.get('title') === 'waterfall';
 const viewport = document.getElementById('viewport');
 const overlay = document.getElementById('overlay');
 const svgNS = 'http://www.w3.org/2000/svg';
 const circuit = document.createElementNS(svgNS,'svg');
 circuit.setAttribute('class','title-circuit');
 circuit.setAttribute('aria-hidden','true');
 circuit.setAttribute('hidden','');
 viewport.append(circuit);
 const spectrum = document.createElement('canvas');
 spectrum.className = 'title-spectrum';
 spectrum.setAttribute('aria-hidden','true');
 spectrum.width = spectrum.height = 384;
 const spectrumContext = spectrum.getContext('2d');
 const spectrumPoints = Array.from({length:96},()=>({x:0,y:0}));
 function drawSpectrum() {
  const halo = overlay.querySelector('.difficulty-disc-halo');
  if (!halo || !spectrumContext) return;
  if (spectrum.parentNode !== halo) halo.prepend(spectrum);
  const c = spectrumContext;
  const center = spectrum.width/2;
  c.clearRect(0,0,spectrum.width,spectrum.height);
  const count = spectrumPoints.length;
  for (let i=0;i<count;i++) {
   const u = i/count;
   const angle = u*Math.PI*2-Math.PI/2;
   const band = 1-Math.abs(u*2-1);
   const energy = reduced.matches ? 0 : music.spectrumAt(band);
   const radius = center*(.802+.14*Math.min(1,energy*1.55));
   spectrumPoints[i].x = center+Math.cos(angle)*radius;
   spectrumPoints[i].y = center+Math.sin(angle)*radius;
  }
  const first = spectrumPoints[0], last = spectrumPoints[count-1];
  c.beginPath();
  c.moveTo((last.x+first.x)/2,(last.y+first.y)/2);
  for (let i=0;i<count;i++) {
   const point = spectrumPoints[i], next = spectrumPoints[(i+1)%count];
   c.quadraticCurveTo(point.x,point.y,(point.x+next.x)/2,(point.y+next.y)/2);
  }
  c.closePath();
  c.stroke();
  c.moveTo(center*1.76,center);
  c.arc(center,center,center*.76,0,Math.PI*2);
  c.fill('evenodd');
 }
 const spectrumGradient = spectrumContext?.createLinearGradient(0,0,384,384);
 if (spectrumGradient) {
  spectrumGradient.addColorStop(0,'#ecffff');
  spectrumGradient.addColorStop(.45,'#51ebf4');
  spectrumGradient.addColorStop(1,'#31c5a1');
  spectrumContext.fillStyle = spectrumGradient;
  spectrumContext.strokeStyle = '#b7fff0';
  spectrumContext.lineWidth = 1.5;
 }
 let circuitKey;
 function drawCircuit() {
  const disc = overlay.querySelector('.difficulty-disc');
  if (!disc || !disc.offsetWidth) return;
  const frame = viewport.getBoundingClientRect(), record = disc.getBoundingClientRect();
  const tint = disc.closest('.difficulty-panel').style.getPropertyValue('--disc-bottom');
  const x = record.left-frame.left+record.width/2, y = record.top-frame.top+record.height/2;
  const radius = record.width/2, w = frame.width, h = frame.height;
  const key = [x,y,radius,w,h,tint].join(',');
  if (circuitKey === key) return;
  circuitKey = key;
  const traces = [];
  for (let direction=0; direction<8; direction++) {
   const angle = direction*Math.PI/4;
   const forward = [Math.cos(angle),Math.sin(angle)];
   const across = [-forward[1],forward[0]];
   for (let lane=-3; lane<=3; lane++) {
    const side = Math.sign(lane) || (direction%2 ? -1 : 1);
    const start = lane*9, spread = side*(13+Math.abs(lane)*6);
    const reach = 70+((direction*37+(lane+3)*53)%145);
    const bend = 20+((direction*11+(lane+3)*9)%32);
    const point = (along,offset) => [x+along*forward[0]+offset*across[0],y+along*forward[1]+offset*across[1]].map(v=>v.toFixed(2));
    const end = radius+bend+Math.abs(spread)+reach;
    const points = [point(radius+5,start),point(radius+bend,start),
     point(radius+bend+Math.abs(spread),start+spread),point(end,start+spread)];
    const [px,py] = points[3];
    traces.push('<path pathLength="100" d="M'+points.join(' L')+'"/>'
     +'<circle cx="'+px+'" cy="'+py+'" r="3.2"/>');
   }
  }
  const markup = '<g class="circuit-ink">'+traces.join('')+'</g>';
  const signal = '<g class="circuit-signal">'+traces.filter((_,i)=>i%3===1).join('')+'</g>';
  circuit.setAttribute('viewBox','0 0 '+w+' '+h);
  circuit.style.color = tint;
  circuit.innerHTML = markup+signal;
 }
 const period = 5400;
 const key = 'train-window-city';
 const horizon = '#785868';
 const beacons = [];
 let signMesh, signTexture, textureContext;
 const signImages = showCity ? ['title-neon-signs-v3.png','title-neon-signs-variety.png'].map(name => {
  const image = new Image();
  image.src = 'assets/'+name;
  return image;
 }) : [];

 function rooftop(r,x,y,z,width,depth,variant) {
  const casing = '#4b5880', dark = '#222d51', metal = '#8293bf';
  const unitX = x-width*.21, unitZ = z+depth*.23;
  r.box(unitX,y+13,unitZ,43,26,27,casing);
  r.box(unitX,y+13,unitZ+14,35,20,2,dark);
  for (let slot = 0; slot < 4; slot++) r.box(unitX,y+6+slot*5,unitZ+16,31,2,2,metal);
  const mastX = x+width*.23, mastZ = z+depth*.14;
  const mastHeight = variant % 3 === 0 ? 48 : 32;
  r.box(mastX,y+mastHeight/2,mastZ,5,mastHeight,5,metal);
  if (variant % 3 !== 1) {
   const center = [mastX,y+mastHeight+8,mastZ-10];
   const rim = angle => [mastX+Math.cos(angle)*20,center[1]+Math.sin(angle)*15,mastZ+Math.sin(angle)*9];
   for (let i = 0; i < 12; i++) {
    const a = rim(i*Math.PI/6), b = rim((i+1)*Math.PI/6);
    r.quad(center,b,a,a,i%2 ? casing : metal);
   }
   r.box(mastX,center[1],mastZ+7,4,4,27,dark);
  } else {
   r.box(mastX,y+mastHeight,mastZ,28,3,3,metal);
   r.emissiveBox(mastX,y+mastHeight+4,mastZ,4,4,4,'#ff94ce');
  }
  for (let i = 0; i < 7; i++) {
   const point = t => [unitX+(mastX-unitX)*t,y+24+t*(mastHeight-24)-18*Math.sin(t*Math.PI),unitZ+(mastZ-unitZ)*t];
   const a = point(i/7), b = point((i+1)/7);
   r.quad(a,b,[b[0],b[1]-2,b[2]],[a[0],a[1]-2,a[2]],dark);
  }
 }

 function build(r) {
  const signs = [];
  const skyVertex = (x,y,z,color) => r.vertex([x,y,z],[0,1.8,0],color);
  // The lower sky and the distant buildings converge on the same haze.
  const sky = [[-9500,horizon],[3000,horizon],[9500,'#32253f']];
  for (let i = 1; i < sky.length; i++) {
   const [bottom,low] = sky[i-1], [top,high] = sky[i];
   for (const [x,y,color] of [[-15000,bottom,low],[15000,bottom,low],[15000,top,high],[-15000,bottom,low],[15000,top,high],[-15000,top,high]]) {
    skyVertex(x,y,-8500,r.color(color));
   }
  }
  // A softly lit moon and sparse stars sit behind the skyline.
  for (const offset of [-period,0,period]) {
   const mx = 2080+offset, my = 5870;
   for (let i = 0; i < 32; i++) {
    const a = i*Math.PI/16, b = (i+1)*Math.PI/16;
    skyVertex(mx,my,-8490,r.color('#f5d8bd'));
    for (const angle of [a,b]) {
     skyVertex(mx+190*Math.cos(angle),my+190*Math.sin(angle),-8490,r.color('#d7aaa9'));
    }
   }
   for (const [x,y,size] of [[-2480,6260,13],[-1980,5110,8],[-1330,5630,10],[-710,6700,12],[330,6060,9],[890,5070,11],[1550,6810,8],[2450,5250,10]]) {
    for (const [dx,dy] of [[0,1],[-1,0],[0,-1],[0,1],[0,-1],[1,0]]) {
     skyVertex(x+offset+dx*size,y+dy*size,-8490,r.color('#c6aaba'));
    }
   }
  }
  const cityStart = r.count;
  function sign(x,y,z,width,index) {
   const variant = index >= 4;
   const vertical = index % 4 >= 2;
   const u = index % 2 * .5;
   const left = u + (vertical ? .126 : .022);
   const right = u + (vertical ? .385 : .478);
   const top = variant ? (vertical ? .51 : .105) : (vertical ? .405 : .075);
   const bottom = variant ? (vertical ? .979 : .408) : (vertical ? .995 : .36);
   const height = width * (vertical ? 1.34 : .48);
   if (vertical) { width *= .48; y -= height*.32; }
   for (const offset of [-period,0,period]) {
    for (const [a,b] of [[0,0],[1,0],[1,1],[0,0],[1,1],[0,1]]) {
     signs.push(x+offset+(a-.5)*width,y+(b-.5)*height,z,left+a*(right-left),((variant ? 1 : 0)+bottom-b*(bottom-top))*.5);
    }
   }
  }
  beacons.length = 0;
  let seed = 824;
  const random = () => {
   seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
   return seed / 4294967296;
  };
  for (const [row, z] of [120, -590, -1600, -3100, -5700].entries()) {
   const start = r.count;
   const step = row < 2 ? 360 : 450;
   for (let slot = 0; slot < period; slot += step) {
    const x = slot + random() * 28;
    const wide = row > 0 && (slot / step) % 3 !== 0;
    const width = step * (wide ? .97 : .66 + random() * .24);
    const elevation = random();
    const top = row === 0 ? -830 + elevation * 260 :
     wide ? -80 + elevation * (440 + row * 250) : 200 + elevation * (500 + row * 410);
    const bottom = -3900;
    const depth = width * .72;
    const front = z + depth / 2;
    const style = wide ? 1 : Math.floor(random() * 4);
    const wall = ['#506da9','#6657a0','#6c77b4','#435884'][style];
    const trim = '#6c82bd';
    const accent = ['#6db5ff','#c58aff','#ffad69','#ffd478'][Math.floor(random() * 4)];
    const face = style === 1 ? width * .66 : width;
    const light = (lx, y, w, h, color, kind = 5, offset = 1) => {
     const at = r.count;
     r.quad([lx-w/2,y-h/2,front+offset],[lx-w/2,y+h/2,front+offset],[lx+w/2,y+h/2,front+offset],[lx+w/2,y-h/2,front+offset],color);
     for (let i = at; i < r.count; i += 9) r.data[i+5] = Math.sign(r.data[i+5]) * kind;
    };
    if (style === 1) {
     const a = width / 2, b = depth / 2, cut = width * .17;
     const rim = [[-a+cut,b],[a-cut,b],[a,b-cut],[a,-b+cut],[a-cut,-b],[-a+cut,-b],[-a,-b+cut],[-a,b-cut]];
     rim.forEach(([u,v], i) => {
      const [j,k] = rim[(i+1)%rim.length];
      r.quad([x+u,bottom,z+v],[x+u,top,z+v],[x+j,top,z+k],[x+j,bottom,z+k],i%2 ? trim : wall);
      r.quad([x,top,z],[x+j,top,z+k],[x+u,top,z+v],[x+u,top,z+v],trim);
     });
    } else {
     r.box(x,(top+bottom)/2,z,width,top-bottom,depth,wall);
     if (style === 0) {
      r.sphere(x,top+width*.28,z,width*.48,trim,1,1,1,8,16);
      r.emissiveRing(x,top+width*.28,z,width*.49,accent,4);
     } else if (style === 2) {
      r.box(x,top+38,z,width*.62,76,depth*.75,trim);
      r.box(x,top+100,z,5,130,7,wall);
      r.emissiveBox(x,top+167,z,9,9,9,'#ff799e');
     } else {
      for (const offset of [-.23,.23]) r.box(x+width*offset,top+25,z,22,50,35,trim);
     }
    }
    rooftop(r,x,top,z,width,depth,(row+slot/step)%5);
    if (row < 3) {
     const ventX = x+face*.30;
     r.box(ventX,top-315,front+8,34,23,16,'#414f7c');
     for (let y = top-321; y <= top-309; y += 6) r.box(ventX,y,front+17,27,2,2,'#7c8bb7');
    }
    if (row > 0 && row < 4 && (slot / step) % 4 === 1) {
     beacons.push({x,y:top+12,z:front+4,phase:x*.004+row,color:row===2?'#c58dff':'#79bcff'});
    }
    const density = [.32,.72,.52,.18][style] * (.8+random()*.4);
    for (let y = top-44; y > -1700; y -= 57) {
     for (let col = -face/2+20; col < face/2-12; col += 25) {
      if (random() < density) light(x+col,y,style===1?16:8,style===2?22:7,accent,5.2+random()*.05,2);
     }
    }
    // Stagger the facade treatments between rows and neighboring buildings.
    const lighting = (slot/step + row*4) % 11;
    if (row > 0 && row < 4 && (lighting === 0 || lighting === 5)) {
     const wallHeight = top-bottom;
     const wallCenter = (top+bottom)/2;
     light(x,wallCenter,face,wallHeight,accent,6);
     light(x-face*.49,wallCenter,4,wallHeight,accent,5.41,3);
     light(x+face*.49,wallCenter,4,wallHeight,accent,5.48,3);
    } else if (lighting === 2 || lighting === 7) {
     const height = top+1900;
     light(x-face*.43,top-height/2,8,height,accent,5.41,3);
     light(x+face*.43,top-height/2,6,height,accent,5.48,3);
    } else if (lighting === 3 || lighting === 8 || lighting === 10) {
     for (let y = top-255; y > -1900; y -= 215) {
      light(x,y,face*.84,10,accent,5.21,3);
      light(x,y-18,face*.64,4,accent,5.24,3);
     }
    } else if (lighting === 1 || lighting === 6) {
     for (let y = top-325; y > -1600; y -= 260) {
      light(x-face*.24,y,face*.20,42,accent,5.22,3);
      light(x+face*.24,y-65,face*.20,42,accent,5.24,3);
     }
    }
    if (row < 4) {
     const index = (row*3+slot/step)%8;
     sign(x,top-120,front+4,face*.98,index);
     if (row > 0 && (wide || style === 2)) {
      sign(x,top-480,front+4,face*.85,(index+6)%8);
     }
    }
   }
   // Use depth fog on all city surfaces, retaining the animated facade tags.
   for (let i = start; i < r.count; i += 9) {
    const nx = r.data[i+3], ny = r.data[i+4], nz = r.data[i+5];
    const length = Math.hypot(nx,ny,nz);
    if (length === 0 || length >= 3.9) continue;
    const scale = (length > 1.5 ? 5 : 4) / length;
    r.data[i+3] *= scale; r.data[i+4] *= scale; r.data[i+5] *= scale;
   }
  }
  const strip = r.data.slice(0,r.count);
  // Match the geometry on both sides of the camera's wrap point.
  for (const offset of [-period,period]) {
   for (let i = cityStart; i < strip.length; i += 9) {
    r.vertex([strip[i]+offset,strip[i+1],strip[i+2]],strip.subarray(i+3,i+6),strip.subarray(i+6,i+9));
   }
  }
  signMesh = new Float32Array(signs);
  r.sceneData = r.data.slice(0,r.count);
  r.sceneKey = key;
  r.count = 0;
 }

 let showing = false;
 globalThis.TitleScene = {
  draw(state,r,dt) {
   const active = enabled && state === 'menu';
   if (active !== showing) {
    viewport.classList.toggle('title-screen',active);
    showing = active;
    if (!active) { r.sceneKey = null; r.sceneData = null; }
   }
   const useCircuit = active && !showCity && !showWaterfall;
   circuit.toggleAttribute('hidden',!useCircuit);
   if (!active) return false;
   const time = reduced.matches ? 0 : performance.now()/1000;
   const spectrumVisible = viewport.matches('.lobby-open.difficulty-screen:not(.lobby-subpage)');
   if (!reduced.matches && (spectrumVisible || showWaterfall)) music.sampleSpectrum(dt);
   if (spectrumVisible) {
    drawSpectrum();
    globalThis.TitleMixer?.layout(viewport,overlay);
   }
   if (useCircuit) {
    drawCircuit();
    return true;
   }
   if (!r.ready || r.gl.isContextLost()) return true;
   const background = r.backgroundColor;
   r.begin();
   if (!showCity) {
    const halfHeight = 750;
    const halfWidth = halfHeight * r.canvas.width / r.canvas.height;
    r.sceneTime = time;
    r.scenePerspective = false;
    r.sceneFogDensity = 0;
    r.sceneGrade = 0;
    r.vp = [1/halfWidth,0,0,0,0,1/halfHeight,0,0,0,0,1,0,0,0,0,1];
    drawWaterfall(r,time,0,-halfWidth,halfWidth,-halfHeight,halfHeight);
    r.end();
    return true;
   }
   r.scenePerspective = true;
   r.sceneFogDensity = .00074;
   r.sceneFogColor = r.backgroundColor = r.color(horizon);
   r.sceneFogView = [0,0,1,1900];
   r.sceneGrade = .24;
   r.topLight = [.65,.71,1];
   r.rearLeftColor = [.26,.58,1];
   r.rearRightColor = [.83,.32,1];
   r.sceneTime = time;
   const aspect = r.canvas.width/r.canvas.height;
   const cameraX = time*84%period, focal = 1.52, near = 20, far = 11000;
   const view = [1,0,0,0,0,1,0,0,0,0,1,0,-cameraX,-230,-1900,1];
   const projection = [focal/aspect,0,0,0,0,focal,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];
   r.vp = r.mul(projection,view);
   if (r.sceneKey !== key) build(r);
   for (const {x,y,z,phase,color} of beacons) {
    const localX = ((x-cameraX+period*1.5)%period)-period*.5+cameraX;
    const tilt = Math.sin(time*.44+phase)*290;
    const strength = .38+.12*Math.sin(time*1.1+phase);
    for (const [width,alpha] of [[105,strength*.44],[40,strength]]) {
     r.transparentQuad([localX-7,y,z],[localX+7,y,z],[localX+tilt+width,y+1600,z],[localX+tilt-width,y+1600,z],color,[alpha,alpha,0,0]);
    }
    r.emissiveBox(localX,y,z,18,12,10,'#ddfaff');
   }
   if (signImages.every(image => image.complete && image.naturalWidth)) {
    if (textureContext !== r.sceneBuffer) {
     textureContext = r.sceneBuffer;
     const gl = r.gl;
     signTexture = gl.createTexture();
     gl.bindTexture(gl.TEXTURE_2D,signTexture);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
     gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
     const atlas = document.createElement('canvas');
     atlas.width = 1024;
     atlas.height = 1368;
     const context = atlas.getContext('2d');
     signImages.forEach((image,index) => context.drawImage(image,0,index*684,1024,684));
     gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);
    }
    r.titleSignTexture = signTexture;
    r.billboardFrame = signMesh;
   }
   r.end();
   r.titleSignTexture = null;
   r.sceneFogView = null;
   r.backgroundColor = background;
   return true;
  }
 };
})();
