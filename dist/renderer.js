'use strict';
const LIFT_MAP=Object.freeze({columns:9,backRows:9,frontRows:9,tile:54});
// Camera framing stays independent of the playable grid dimensions.
const CAMERA_BASE_HALF_WIDTH=351; // World units at cameraSize=1; independent of map cells and tile size.
// Small, dependency-free WebGL renderer: real meshes, depth testing and directional light.
class Elevator3D {
 constructor(canvas){this.canvas=canvas;this.gl=canvas.getContext('webgl',{antialias:true,alpha:false});if(!this.gl)throw new Error('此设备未启用 WebGL');this.ready=false;this.initializeGPU();canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();this.ready=false;this.onContextLost?.()});canvas.addEventListener('webglcontextrestored',()=>{this.initializeGPU();this.onContextRestored?.()});}
 initializeGPU(){this.particleBakes=new Map();this.particleBakeProgram=null;this.particleBakeContext=null;const gl=this.gl;this.residentMeshes=this.residentMeshes||new Map();for(const mesh of this.residentMeshes.values()){mesh.buffer=null;mesh.poseBuffer=null;mesh.capacity=0;mesh.count=0;}
 // Integrate each soft ellipsoidal fog volume from the surface toward the camera.
 // A thick density field has no depth-tested sheet that can slice a wall in two.
 const cityFogGLSL=`uniform vec3 cityFogCenters[4];uniform vec3 cityFogRadii[4];uniform vec4 cityFogColors[4];
 float fogErf(float x){x=clamp(x,-6.,6.);float xx=x*x;return sign(x)*sqrt(max(0.,1.-exp(-xx*(1.27323954+.147*xx)/(1.+.147*xx))));}
 vec3 cityVolumeFog(vec3 shade,vec3 point,float emission){
  for(int i=0;i<4;i++){vec3 radii=max(cityFogRadii[i],vec3(1.));vec3 offset=(point-cityFogCenters[i])/radii;vec3 ray=vec3(0.,.84663655,.53217155)/radii;
   float rayLength=length(ray);vec3 axis=ray/rayLength;float along=dot(offset,axis);float across=max(0.,dot(offset,offset)-along*along);
   float integral=exp(-2.*across)*.5*(1.-fogErf(1.41421356*along));float opacity=1.-exp(-cityFogColors[i].a*integral);
   shade=mix(shade,cityFogColors[i].rgb*(1.-emission),opacity);
  }return shade;
 }`;
 this.cityFogGLSL=cityFogGLSL;this.cityFogLocations=new Map();
 // Shared surface lighting for ordinary, resident and textured meshes.
 // Only uniforms change when switching styles; geometry and programs stay resident.
 this.surfaceShaderGLSL=`uniform float surfaceShader;uniform float enemyMidtone;
 vec3 liftEnemyMidtone(vec3 shade){float y=dot(shade,vec3(.2126,.7152,.0722));float weight=4.*y*(1.-y);return shade*(1.+enemyMidtone*weight);}

 vec3 softToonShade(vec3 base,vec3 normal,vec3 key,vec3 keyColor,vec3 cyan,vec3 magenta,float floorTag,float cityTag){
  vec3 view=normalize(vec3(0.,.85,.53));vec3 light=normalize(key);
  float diffuse=dot(normal,light)*.5+.5;
  float ramp=.42+.30*smoothstep(.32,.44,diffuse)+.28*smoothstep(.70,.80,diffuse);
  vec3 shadowTint=mix(vec3(.72,.79,.94),vec3(1.),smoothstep(.32,.80,diffuse));
  vec3 tone=base*shadowTint*ramp*(vec3(.87)+clamp(keyColor,0.,2.)*.13);
  float edge=smoothstep(.58,.88,1.-abs(dot(normal,view)));
  vec3 rim=cyan*smoothstep(.05,.65,dot(normal,normalize(vec3(-.65,.25,-1.))))+magenta*smoothstep(.05,.65,dot(normal,normalize(vec3(.65,.25,-1.))));
  float highlight=smoothstep(.90,.97,max(0.,dot(normal,normalize(light+view))));
  tone+=rim*edge*.16*(1.-floorTag*.75);
  tone+=vec3(1.,.95,.84)*highlight*.10*(1.-floorTag)*(1.-cityTag);
  return tone*mix(1.,.88,floorTag)*mix(1.,.78,cityTag);
 }`;
 const vs=`attribute vec3 p;attribute vec3 n;attribute vec3 c;uniform mat4 vp;uniform vec4 sceneFogView;uniform vec2 clubLight;uniform vec3 topLight;uniform vec4 playerLightPosition;uniform vec4 playerLightColor;uniform vec3 keyLightDirection;uniform float sceneGrade;uniform vec3 rearLeftColor;uniform vec3 rearRightColor;varying vec3 color;varying vec2 ledUV;varying float ledMask;varying float fogTag;varying float fogDepth;varying vec3 cityWorld;varying float cityLightKind;${this.surfaceShaderGLSL}void main(){cityWorld=p;cityLightKind=length(n);float tagged=step(3.9,length(n));float fogEmissive=step(4.5,length(n));float surfaceLength=mix(length(n),1.+fogEmissive,tagged);fogTag=tagged;float grade=mix(sceneGrade,1.,tagged*step(.001,sceneGrade));fogDepth=sceneFogView.w-dot(p,sceneFogView.xyz);ledUV=p.xy/vec2(5.,9.);ledMask=step(2.1,n.y)*(1.-step(2.5,surfaceLength))*(1.-tagged);float floorMaterial=step(2.5,surfaceLength);vec3 normal=normalize(n);vec3 view=normalize(vec3(0.,.85,.53));vec3 rearL=normalize(vec3(-.65,.25,-1.));vec3 rearR=normalize(vec3(.65,.25,-1.));float left=max(dot(normal,rearL),0.);float right=max(dot(normal,rearR),0.);float front=max(dot(normal,normalize(vec3(0.,.35,1.))),0.);vec3 cyan=rearLeftColor*clubLight.x;vec3 magenta=rearRightColor*clubLight.y;vec3 irradiance=mix(vec3(.22,.29,.33),vec3(.30,.09,.37),grade)+mix(vec3(.55,.68,.72),vec3(.72,.22,.62),grade)*front*.28+cyan*left*1.15+magenta*right*1.15+topLight*max(dot(normal,normalize(keyLightDirection)),0.)*.38;float edge=pow(1.-abs(dot(normal,view)),2.5);float material=smoothstep(.12,.5,max(c.r,max(c.g,c.b)));vec3 rim=(cyan*smoothstep(-.15,.5,dot(normal,rearL))+magenta*smoothstep(-.15,.5,dot(normal,rearR)))*edge*.32*material;irradiance=mix(irradiance,vec3(dot(irradiance,vec3(.2126,.7152,.0722))),floorMaterial*(.88-grade*.43));rim=mix(rim,vec3(dot(rim,vec3(.2126,.7152,.0722))),floorMaterial*(.88-grade*.43));vec3 pointDelta=playerLightPosition.xyz-p;float pointDistance=length(pointDelta);float pointFalloff=pow(max(0.,1.-pointDistance/max(1.,playerLightPosition.w)),2.);irradiance+=playerLightColor.rgb*playerLightColor.a*pointFalloff*max(0.,dot(normal,pointDelta/max(pointDistance,.001)));color=pow(clamp(c*irradiance+rim+c*clamp((surfaceLength-1.-floorMaterial*2.)*1.2,0.,.3),0.,1.),vec3(.93));if(surfaceShader>.5){color=clamp(softToonShade(c,normal,keyLightDirection,topLight,cyan,magenta,floorMaterial,tagged)+c*playerLightColor.rgb*playerLightColor.a*pointFalloff*max(0.,dot(normal,pointDelta/max(pointDistance,.001)))*.65,0.,1.);}color=mix(color,c,mix(step(1.5,n.y)*(1.-floorMaterial),fogEmissive,tagged));if(surfaceShader<.5)color*=mix(vec3(1.),vec3(1.,.72,.96),grade*.55);color=mix(liftEnemyMidtone(color),color,step(1.5,length(n)));if(abs(length(n)-1.8)<.025)color=c;gl_Position=vp*vec4(p,1.);}`;
 const fs=`precision mediump float;${cityFogGLSL}varying vec3 color;varying vec2 ledUV;varying float ledMask;varying float fogTag;varying float fogDepth;uniform float sceneTime;varying vec3 cityWorld;varying float cityLightKind;uniform float sceneFogDensity;uniform vec3 sceneFogColor;void main(){float dotLight=1.-smoothstep(.28,.36,length(fract(ledUV)-.5));vec3 shade=mix(color,mix(vec3(.008,.012,.016),color,dotLight),ledMask);if(cityLightKind>5.395&&cityLightKind<5.495){float seed=clamp((cityLightKind-5.4)/.09,0.,1.);float direction=mix(-1.,1.,step(.45,seed));float travel=fract(cityWorld.y/(210.+seed*230.)+sceneTime*(.13+seed*.16)*direction+seed*19.);float tail=pow(max(0.,1.-travel/.25),2.);float head=1.-smoothstep(.012,.038,abs(travel-.035));shade=color*(.16+tail*.65+head*1.25);}float windowMask=step(5.19,cityLightKind)*(1.-step(5.26,cityLightKind));float phase=(cityLightKind-5.2)*580.;float breathe=.28+.72*smoothstep(-.75,.75,sin(sceneTime*(.33+.08*sin(phase))+phase));shade*=mix(1.,breathe,windowMask);if(cityLightKind>5.8&&cityLightKind<6.2){float lane=cityWorld.x*.1+cityWorld.z*.025;float column=floor(lane);float seed=fract(sin(column*.73)*13.37);float travel=fract(cityWorld.y*.008+sceneTime*(.16+seed*.1)+seed);float thread=.3+.7*pow(1.-abs(fract(lane)*2.-1.),2.);shade*=.45+thread*(.5+1.1*pow(travel,2.));}if(cityLightKind>6.8&&cityLightKind<7.8){shade*=1.+.2*sin(cityWorld.y*.011-sceneTime*.7);}if(cityLightKind>7.8){float lane=floor(cityWorld.x*.10);float row=floor(cityWorld.y*.018+sceneTime*.12);float g=fract(sin(lane*1.37+row*.67+floor(sceneTime*.6))*13.37);vec3 glitch=mix(vec3(.18,.04,.5),vec3(.78,.06,.64),step(.42,g));glitch=mix(glitch,vec3(.16,.75,.89),step(.86,g));float scan=.88+.12*sin(cityWorld.y*.35);float tear=step(.985,fract(sin(floor(cityWorld.y*.04)+floor(sceneTime*2.))*13.1));shade=glitch*scan+tear*.25;}float fog=(1.-exp(-max(0.,fogDepth-900.)*sceneFogDensity))*fogTag;shade=mix(shade,sceneFogColor,fog);shade=mix(shade,cityVolumeFog(shade,cityWorld,0.),fogTag);gl_FragColor=vec4(shade,1.);}`;
 const shader=(type,source)=>{let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};this.program=gl.createProgram();gl.attachShader(this.program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(this.program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));gl.useProgram(this.program);this.enabledAttributes=new Set();this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);for(const [i,name]of ['p','n','c'].entries()){let a=gl.getAttribLocation(this.program,name);gl.enableVertexAttribArray(a);this.enabledAttributes.add(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,36,i*12)}this.enemyMidtoneLoc=gl.getUniformLocation(this.program,'enemyMidtone');this.surfaceShaderLoc=gl.getUniformLocation(this.program,'surfaceShader');this.playerLightUniforms=['playerLightPosition','playerLightColor'].map(n=>gl.getUniformLocation(this.program,n));this.vpLoc=gl.getUniformLocation(this.program,'vp');this.clubLightLoc=gl.getUniformLocation(this.program,'clubLight');this.topLightLoc=gl.getUniformLocation(this.program,'topLight');this.keyLightLoc=gl.getUniformLocation(this.program,'keyLightDirection');this.sceneGradeLoc=gl.getUniformLocation(this.program,'sceneGrade');this.sceneFogViewLoc=gl.getUniformLocation(this.program,'sceneFogView');this.sceneFogDensityLoc=gl.getUniformLocation(this.program,'sceneFogDensity');this.sceneTimeLoc=gl.getUniformLocation(this.program,'sceneTime');this.sceneFogColorLoc=gl.getUniformLocation(this.program,'sceneFogColor');this.rearLeftColorLoc=gl.getUniformLocation(this.program,'rearLeftColor');this.rearRightColorLoc=gl.getUniformLocation(this.program,'rearRightColor');gl.enable(gl.DEPTH_TEST);this.data=this.data||new Float32Array(262144);this.count=0;this.colors=this.colors||{};this.gpuCapacity=0;this.projectiles=this.projectiles||new Float32Array(8192);this.projectileCount=0;this.projectileCapacity=0;this.resize();
const pvs=`attribute vec3 p;attribute vec3 c;attribute float radius;uniform mat4 vp;uniform float scale;varying vec3 color;varying float haloOnly;void main(){color=c;haloOnly=radius<0.?1.:0.;gl_Position=vp*vec4(p,1.);gl_PointSize=max(3.,abs(radius)*5.8*scale);}`;const pfs=`precision mediump float;varying vec3 color;varying float haloOnly;void main(){vec2 uv=gl_PointCoord*2.-1.;float rr=length(uv);if(rr>1.)discard;float halo=pow(max(0.,1.-rr),2.)*.55;if(haloOnly>.5){gl_FragColor=vec4(color,halo);return;}float core=1.-smoothstep(.38,.46,rr);float light=.75+.25*sqrt(max(0.,1.-rr/.46));vec3 col=color*light+vec3(.3)*pow(max(0.,1.-length(uv-vec2(-.12,-.12))/.46),5.);gl_FragColor=vec4(mix(color,col,core),max(halo,core));}`;
this.projectileProgram=gl.createProgram();gl.attachShader(this.projectileProgram,shader(gl.VERTEX_SHADER,pvs));gl.attachShader(this.projectileProgram,shader(gl.FRAGMENT_SHADER,pfs));gl.linkProgram(this.projectileProgram);if(!gl.getProgramParameter(this.projectileProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.projectileProgram));this.projectileBuffer=gl.createBuffer();this.projectileVP=gl.getUniformLocation(this.projectileProgram,'vp');this.projectileScale=gl.getUniformLocation(this.projectileProgram,'scale');const tvs=`attribute vec3 p;attribute vec4 c;uniform mat4 vp;varying vec4 color;void main(){color=c;gl_Position=vp*vec4(p,1.);}`;const tfs=`precision mediump float;varying vec4 color;void main(){gl_FragColor=color;}`;
this.transparentProgram=gl.createProgram();gl.attachShader(this.transparentProgram,shader(gl.VERTEX_SHADER,tvs));gl.attachShader(this.transparentProgram,shader(gl.FRAGMENT_SHADER,tfs));gl.linkProgram(this.transparentProgram);if(!gl.getProgramParameter(this.transparentProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.transparentProgram));this.transparentBuffer=gl.createBuffer();this.transparentVP=gl.getUniformLocation(this.transparentProgram,'vp');this.transparentData=this.transparentData||new Float32Array(16384);this.transparentCount=0;this.transparentCapacity=0;const svs=`attribute vec3 p;attribute vec2 uv;uniform mat4 vp;varying vec2 texUV;varying float spriteDepth;void main(){texUV=uv;spriteDepth=826.801-dot(p,vec3(0.,.84663655,.53217155));gl_Position=vp*vec4(p,1.);}`;const sfs=`precision mediump float;uniform sampler2D image;uniform float lead;uniform float direction;uniform float halo;uniform float opacity;uniform vec3 tint;uniform float spriteFogDensity;uniform vec3 spriteFogColor;varying float spriteDepth;varying vec2 texUV;void main(){if(halo>2.5){float alpha=smoothstep(.25,.75,texture2D(image,texUV).a);gl_FragColor=vec4(tint,alpha*opacity);return;}if(halo>1.5&&halo<2.5){vec2 uv=texUV*2.4-.7;float a=0.;for(int i=0;i<48;i++){float t=(float(i)+.5)/48.;float angle=float(i)*2.399963;vec2 offset=vec2(cos(angle),sin(angle))*sqrt(t)*.52;a+=texture2D(image,uv+offset).a*exp(-t*3.)*.113333;}gl_FragColor=vec4(tint,a*opacity);return;}if(halo>.5){vec4 tex=texture2D(image,texUV);if(tint.r>=0.)tex.rgb*=tint;tex.rgb=mix(tex.rgb,spriteFogColor,1.-exp(-max(0.,spriteDepth-900.)*spriteFogDensity));gl_FragColor=tex*vec4(1.,1.,1.,opacity);return;}float behind=(atan(texUV.y-.5,texUV.x-.5)-lead)*-direction;if(behind<0.||behind>.85)discard;vec4 tex=texture2D(image,vec2(texUV.x,direction>0.?1.-texUV.y:texUV.y));tex.a*=1.-smoothstep(.05,.85,behind);if(tint.r>=0.)tex.rgb=tint*max(tex.r,max(tex.g,tex.b));gl_FragColor=tex;}`;
this.spriteProgram=gl.createProgram();gl.attachShader(this.spriteProgram,shader(gl.VERTEX_SHADER,svs));gl.attachShader(this.spriteProgram,shader(gl.FRAGMENT_SHADER,sfs));gl.linkProgram(this.spriteProgram);if(!gl.getProgramParameter(this.spriteProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.spriteProgram));this.spriteBuffer=gl.createBuffer();this.spriteVP=gl.getUniformLocation(this.spriteProgram,'vp');this.spriteLead=gl.getUniformLocation(this.spriteProgram,'lead');this.spriteDirection=gl.getUniformLocation(this.spriteProgram,'direction');this.spriteImageLoc=gl.getUniformLocation(this.spriteProgram,'image');this.spriteHaloLoc=gl.getUniformLocation(this.spriteProgram,'halo');this.spriteOpacityLoc=gl.getUniformLocation(this.spriteProgram,'opacity');this.spriteTintLoc=gl.getUniformLocation(this.spriteProgram,'tint');this.spriteFogDensityLoc=gl.getUniformLocation(this.spriteProgram,'spriteFogDensity');this.spriteFogColorLoc=gl.getUniformLocation(this.spriteProgram,'spriteFogColor');this.spriteTexture=gl.createTexture();this.spriteTextureReady=false;this.haloTexture=gl.createTexture();this.haloTextureReady=false;this.sprites=[];this.enemyBulletAssets=[];this.bulletOrbAssets=new Map();this.electricTexture=null;this.laserFlowTexture=null;this.cyberBulletTexture=null;this.swordWaveTexture=null;this.softLightTexture=null;

 const body=vs.slice(vs.indexOf('void main(){')+12).replace(/\bp\b/g,'worldP').replace(/\bn\b/g,'worldN').replace(/\bc\b/g,'baseColor');
 const retainedVS='uniform mediump float surfaceMode;varying float circuitPhase;varying vec3 localPoint;varying vec3 metalNormal;varying float metalMask;varying float hitTint;'+vs.slice(0,vs.indexOf('void main(){'))+'attribute vec4 pose0;attribute vec4 pose1;attribute vec4 pose2;attribute float flash;void main(){circuitPhase=n.x;localPoint=p;hitTint=clamp(abs(flash),0.,1.);vec4 point=vec4(p,1.);vec3 worldP=vec3(dot(pose0,point),dot(pose1,point),dot(pose2,point));vec3 u=vec3(pose0.x,pose1.x,pose2.x),v=vec3(pose0.y,pose1.y,pose2.y),w=vec3(pose0.z,pose1.z,pose2.z);vec3 worldN=length(n)>1.5?n:normalize(u*n.x/max(dot(u,u),.000001)+v*n.y/max(dot(v,v),.000001)+w*n.z/max(dot(w,w),.000001))*length(n);metalNormal=normalize(worldN);metalMask=1.-step(1.5,length(n));vec3 baseColor=c;if(flash>.5){worldN=vec3(0.,2.,0.);baseColor=vec3(1.);}if(surfaceMode>4.5)worldN=vec3(0.,2.,0.);'+body.replace('gl_Position=','if(surfaceMode>4.5)color=c;color=mix(color,vec3(1.),clamp(-flash,0.,1.));gl_Position=');
 this.residentProgram=gl.createProgram();gl.attachShader(this.residentProgram,shader(gl.VERTEX_SHADER,retainedVS));gl.attachShader(this.residentProgram,shader(gl.FRAGMENT_SHADER,`precision mediump float;${cityFogGLSL}varying float circuitPhase;varying vec3 color;varying vec2 ledUV;varying float ledMask;varying vec3 localPoint;varying vec3 metalNormal;varying float metalMask;varying float fogTag;varying float fogDepth;uniform float sceneTime;varying vec3 cityWorld;varying float cityLightKind;uniform float sceneFogDensity;uniform vec3 sceneFogColor;uniform float surfaceOpacity;uniform float surfaceMode;uniform float surfaceTime;uniform float enemyTier;uniform float enemyTierTime;varying float hitTint;
void main(){float dotLight=1.-smoothstep(.28,.36,length(fract(ledUV)-.5));vec3 shade=mix(color,mix(vec3(.008,.012,.016),color,dotLight),ledMask);float alpha=surfaceOpacity;if(surfaceMode>5.5){float scan=smoothstep(.45,.75,fract((localPoint.y+surfaceTime*12.)/4.));float sweep=1.-smoothstep(0.,4.,abs(localPoint.y-mod(surfaceTime*22.,66.)));gl_FragColor=vec4(color*(.39+.55*scan)+vec3(.04,.28,.42)*sweep,1.);return;}if(surfaceMode>4.5){float travel=fract((circuitPhase-max(0.,surfaceTime)*22.)/110.);float tail=pow(max(0.,1.-travel/.14),2.);float pulse=surfaceTime<0.?0.:tail;gl_FragColor=vec4(color*.65+mix(color,vec3(.82,1.,.96),.7)*pulse*.9,1.);return;}if(surfaceMode>3.5){alpha*=pow(clamp((localPoint.y+159.)/125.,0.,1.),.85);shade=color*2.;}else if(surfaceMode>2.5){vec3 normal=normalize(metalNormal);vec3 halfLight=normalize(normalize(vec3(-.45,.85,.45))+normalize(vec3(0.,.85,.53)));float reflection=max(0.,dot(normal,halfLight));float sharp=pow(reflection,48.);float broad=pow(reflection,7.);vec3 tint=mix(vec3(.65,.83,1.),vec3(1.,.9,.68),.5+.5*normal.x);shade+=metalMask*(vec3(1.)*sharp*1.1+tint*broad*.28);}else if(surfaceMode>1.5){if(!gl_FrontFacing)discard;vec3 normal=normalize(vec3(localPoint.x,localPoint.y-37.,localPoint.z));float sheen=pow(max(0.,dot(normal,normalize(vec3(-.4,.8,.5)))),18.);shade+=vec3(.65,.85,1.)*sheen*.65;}else if(surfaceMode>.5){float wave=pow(.5+.5*sin(localPoint.y*.055+atan(localPoint.z,localPoint.x)*2.-surfaceTime*3.),5.);shade=mix(shade*.65,vec3(.75,1.,.94),wave);alpha*=.45+.55*wave;}if(cityLightKind>5.395&&cityLightKind<5.495){float seed=clamp((cityLightKind-5.4)/.09,0.,1.);float direction=mix(-1.,1.,step(.45,seed));float travel=fract(cityWorld.y/(210.+seed*230.)+sceneTime*(.13+seed*.16)*direction+seed*19.);float tail=pow(max(0.,1.-travel/.25),2.);float head=1.-smoothstep(.012,.038,abs(travel-.035));shade=color*(.16+tail*.65+head*1.25);}float windowMask=step(5.19,cityLightKind)*(1.-step(5.26,cityLightKind));float phase=(cityLightKind-5.2)*580.;float breathe=.28+.72*smoothstep(-.75,.75,sin(sceneTime*(.33+.08*sin(phase))+phase));shade*=mix(1.,breathe,windowMask);if(cityLightKind>5.8&&cityLightKind<6.2){float lane=cityWorld.x*.1+cityWorld.z*.025;float column=floor(lane);float seed=fract(sin(column*.73)*13.37);float travel=fract(cityWorld.y*.008+sceneTime*(.16+seed*.1)+seed);float thread=.3+.7*pow(1.-abs(fract(lane)*2.-1.),2.);shade*=.45+thread*(.5+1.1*pow(travel,2.));}if(cityLightKind>6.8&&cityLightKind<7.8){shade*=1.+.2*sin(cityWorld.y*.011-sceneTime*.7);}if(cityLightKind>7.8){float lane=floor(cityWorld.x*.10);float row=floor(cityWorld.y*.018+sceneTime*.12);float g=fract(sin(lane*1.37+row*.67+floor(sceneTime*.6))*13.37);vec3 glitch=mix(vec3(.18,.04,.5),vec3(.78,.06,.64),step(.42,g));glitch=mix(glitch,vec3(.16,.75,.89),step(.86,g));float scan=.88+.12*sin(cityWorld.y*.35);float tear=step(.985,fract(sin(floor(cityWorld.y*.04)+floor(sceneTime*2.))*13.1));shade=glitch*scan+tear*.25;}
if(enemyTier>1.5){
 float band=localPoint.x*.12+localPoint.y*.16+localPoint.z*.07-enemyTierTime*2.3;
 float glint=pow(.5+.5*cos(band),8.);
 vec3 tint=vec3(.38,.75,1.);
 float strength=.40;
 if(enemyTier>2.5){tint=vec3(1.,.64,.14);strength=enemyTier>3.5?.78:.61;}
 if(enemyTier>4.5){
  tint=.57+.43*cos(band+vec3(0.,2.094,4.189));
  strength=enemyTier>5.5?.89:.73;
 }
 float luminance=dot(shade,vec3(.299,.587,.114));
 vec3 finish=tint*(.35+luminance*.9)+glint*tint*.42;
 shade=mix(shade,finish,strength*metalMask*(1.-hitTint));
}
float fog=(1.-exp(-max(0.,fogDepth-900.)*sceneFogDensity))*fogTag;shade=mix(shade,sceneFogColor,fog);shade=mix(shade,cityVolumeFog(shade,cityWorld,0.),fogTag);gl_FragColor=vec4(shade,alpha);}`));gl.linkProgram(this.residentProgram);if(!gl.getProgramParameter(this.residentProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.residentProgram));this.residentVP=gl.getUniformLocation(this.residentProgram,'vp');this.residentLightLocations=Object.fromEntries(['enemyMidtone','surfaceShader','playerLightPosition','playerLightColor','clubLight','topLight','keyLightDirection','rearLeftColor','rearRightColor','sceneGrade','sceneFogDensity','sceneFogColor','sceneTime','sceneFogView'].map(n=>[n,gl.getUniformLocation(this.residentProgram,n)]));this.residentPoseLocations=['pose0','pose1','pose2','flash'].map(n=>gl.getAttribLocation(this.residentProgram,n));this.residentSurfaceUniforms=['surfaceOpacity','surfaceMode','surfaceTime','enemyTier','enemyTierTime'].map(n=>gl.getUniformLocation(this.residentProgram,n));this.residentExtension=gl.getExtension('ANGLE_instanced_arrays');
this.sceneKey=null;this.sceneData=null;this.sceneBuffer=gl.createBuffer();this.sceneUploaded=null;this.sceneGpuBytes=0;this.waterfallBuffer=gl.createBuffer();this.waterfallKey=null;this.waterfallData=null;this.waterfallFrame=null;this.initializeWaterfall(shader);this.initializeCityLights(shader,cityFogGLSL);this.billboardTexture=gl.createTexture();this.billboardTextureReady=false;this.billboardBuffer=gl.createBuffer();this.billboardUploaded=null;this.billboardFrame=null;this.brandTexture=gl.createTexture();this.brandTextureReady=false;this.brandBuffer=gl.createBuffer();this.brandUploaded=null;this.brandFrame=null;this.clockTexture=gl.createTexture();this.clockBuffer=gl.createBuffer();this.clockUploaded=null;this.clockFrame=null;this.clockTextureReady=false;this.initializeHolograms(shader);this.ready=true;if(this.brandImage)this.uploadBrandTexture();if(this.billboardImage)this.loadBillboardAtlas();this.loadSwordTexture();this.loadHaloTexture();
 }
 uploadCityFog(program){
  const gl=this.gl;let loc=this.cityFogLocations.get(program);
  if(!loc){loc=['cityFogCenters[0]','cityFogRadii[0]','cityFogColors[0]'].map(n=>gl.getUniformLocation(program,n));this.cityFogLocations.set(program,loc);}
  const centers=new Float32Array(12),radii=new Float32Array(12).fill(1),colors=new Float32Array(16);
  for(let i=0;i<Math.min(4,this.cityFogVolumes?.length||0);i++){const v=this.cityFogVolumes[i];centers.set(v.center,i*3);radii.set(v.radii,i*3);colors.set([...this.color(v.color),-Math.log(1-v.opacity)],i*4);}
  gl.uniform3fv(loc[0],centers);gl.uniform3fv(loc[1],radii);gl.uniform4fv(loc[2],colors);
 }
 // One shared radial glow texture and a retained point buffer for the distant city.
 initializeCityLights(shader,cityFogGLSL){
  const gl=this.gl,vs=`${cityFogGLSL}attribute vec3 p;attribute vec3 c;attribute float size;uniform mat4 vp;uniform float scale;uniform vec4 fogView;uniform float fogDensity;uniform float time;varying vec3 tint;void main(){float seed=fract(sin(dot(p.xz,vec2(.1271,.3117)))*43758.5453);float selected=step(.72,seed);float phase=seed*91.7;float pulse=.5+.5*sin(time*(1.1+seed*1.8)+phase);float sparkle=.35+.65*pow(pulse,2.);float flicker=mix(1.,sparkle,selected);float depth=fogView.w-dot(p,fogView.xyz);tint=cityVolumeFog(c*2.8*flicker*exp(-max(0.,depth-900.)*fogDensity),p,1.);gl_Position=vp*vec4(p,1.);gl_PointSize=max(3.,size*scale);}`,
  fs=`precision mediump float;uniform sampler2D glow;varying vec3 tint;void main(){float alpha=texture2D(glow,gl_PointCoord).a;if(alpha<.003)discard;gl_FragColor=vec4(tint,alpha);}`;
  this.cityLightProgram=gl.createProgram();gl.attachShader(this.cityLightProgram,shader(gl.VERTEX_SHADER,vs));gl.attachShader(this.cityLightProgram,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.cityLightProgram);if(!gl.getProgramParameter(this.cityLightProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.cityLightProgram));
  this.cityLightUniforms=Object.fromEntries(['vp','scale','fogView','fogDensity','glow','time'].map(n=>[n,gl.getUniformLocation(this.cityLightProgram,n)]));
  const pixels=new Uint8Array(64*64*4);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){const radius=Math.hypot((x+.5-32)/32,(y+.5-32)/32),edge=Math.max(0,1-radius),alpha=radius>=1?0:(.84*Math.exp(-radius*radius*36)+.3*Math.exp(-radius*radius*5))*Math.min(1,edge*8),i=(y*64+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=255;pixels[i+3]=Math.round(Math.min(1,alpha)*255);}
  this.cityLightTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.cityLightTexture);for(const name of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,name,gl.LINEAR);for(const name of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,name,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,64,64,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  this.cityLightBuffer=gl.createBuffer();this.cityLightUploaded=null;this.cityLightFrame=null;
 }
 setCityLights(data){this.cityLightFrame=data;}
 drawCityLights(){
  const data=this.cityLightFrame;if(!data?.length)return;const gl=this.gl,u=this.cityLightUniforms;
  gl.useProgram(this.cityLightProgram);this.uploadCityFog(this.cityLightProgram);gl.bindBuffer(gl.ARRAY_BUFFER,this.cityLightBuffer);if(this.cityLightUploaded!==data){gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);this.cityLightUploaded=data;}
  this.attributes(this.cityLightProgram,[['p',3],['c',3],['size',1]],28);gl.uniformMatrix4fv(u.vp,false,this.vp);gl.uniform1f(u.scale,this.pointScale);gl.uniform1f(u.time,this.sceneTime||0);gl.uniform4fv(u.fogView,this.sceneFogView||[0,.84663655,.53217155,826.801]);gl.uniform1f(u.fogDensity,this.sceneFogDensity||0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.cityLightTexture);gl.uniform1i(u.glow,0);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);gl.drawArrays(gl.POINTS,0,data.length/7);gl.depthMask(true);gl.disable(gl.BLEND);
 }
 initializeWaterfall(shader){
 const gl=this.gl,precision=gl.getShaderPrecisionFormat?.(gl.FRAGMENT_SHADER,gl.HIGH_FLOAT)?.precision?'highp':'mediump';
 const vs=`attribute vec3 p;uniform mat4 vp;varying ${precision} vec2 world;void main(){world=p.xy;gl_Position=vp*vec4(p,1.);}`;
 const fs=`precision ${precision} float;varying ${precision} vec2 world;uniform vec2 horizontal;uniform vec3 baseColor;uniform vec4 lanes[7];uniform vec4 hues[2];uniform sampler2D spectrum;
 vec3 rainbow(float h){return .08+.92*clamp(abs(fract(vec3(h)+vec3(0.,2./3.,1./3.))*6.-3.)-1.,0.,1.);}
 void main(){float u=clamp((world.x-horizontal.x)/(horizontal.y-horizontal.x),0.,1.);float energy=texture2D(spectrum,vec2((.5+u*23.)/24.,.5)).r;vec3 color=baseColor;
 for(int i=0;i<7;i++){vec4 lane=lanes[i];if(u>=lane.x&&u<=lane.y){float tail=mod(world.y+lane.w,lane.z)/lane.z;float alpha=.08+.84*pow(1.-tail,1.7);float h=i<4?hues[0][i]:hues[1][i-4];vec3 shade=rainbow(h-tail*.1);float glow=.3+.7*pow(1.-tail,.7)+energy*.08;color=mix(color,shade*glow,alpha);}}
 float dotLight=1.-smoothstep(.28,.36,length(fract(world/vec2(5.,9.))-.5));gl_FragColor=vec4(mix(vec3(.008,.012,.016),color,dotLight),1.);}`;
 this.waterfallProgram=gl.createProgram();gl.attachShader(this.waterfallProgram,shader(gl.VERTEX_SHADER,vs));gl.attachShader(this.waterfallProgram,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.waterfallProgram);if(!gl.getProgramParameter(this.waterfallProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.waterfallProgram));
 this.waterfallUniforms=Object.fromEntries(['vp','horizontal','baseColor','lanes[0]','hues[0]','spectrum'].map(n=>[n,gl.getUniformLocation(this.waterfallProgram,n)]));
 this.waterfallTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.waterfallTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);this.waterfallSpectrum=new Uint8Array(24);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,24,1,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,this.waterfallSpectrum);
 }
 setWaterfall(wallZ,left,right,bottom,top,lanes,hues,baseColor,bands){
  const key=[wallZ,left,right,bottom,top].join(',');if(key!==this.waterfallKey){this.waterfallKey=key;this.waterfallData=new Float32Array([left,bottom,wallZ,right,bottom,wallZ,right,top,wallZ,left,bottom,wallZ,right,top,wallZ,left,top,wallZ]);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.waterfallBuffer);this.gl.bufferData(this.gl.ARRAY_BUFFER,this.waterfallData,this.gl.STATIC_DRAW);}
  this.waterfallFrame={left,right,lanes,hues,baseColor};for(let i=0;i<24;i++)this.waterfallSpectrum[i]=Math.round(Math.max(0,Math.min(1,bands[i]))*255);
 }
 drawWaterfall(){
  if(!this.waterfallFrame)return;const gl=this.gl,f=this.waterfallFrame,u=this.waterfallUniforms;gl.useProgram(this.waterfallProgram);gl.uniformMatrix4fv(u.vp,false,this.vp);gl.uniform2f(u.horizontal,f.left,f.right);gl.uniform3fv(u.baseColor,f.baseColor);gl.uniform4fv(u['lanes[0]'],f.lanes);gl.uniform4fv(u['hues[0]'],f.hues);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.waterfallTexture);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,24,1,gl.LUMINANCE,gl.UNSIGNED_BYTE,this.waterfallSpectrum);gl.uniform1i(u.spectrum,0);gl.bindBuffer(gl.ARRAY_BUFFER,this.waterfallBuffer);this.attributes(this.waterfallProgram,[['p',3]],12);gl.drawArrays(gl.TRIANGLES,0,6);
 }
 drawStaticScene(){
  if(!this.sceneData)return;const gl=this.gl;gl.bindBuffer(gl.ARRAY_BUFFER,this.sceneBuffer);if(this.sceneUploaded!==this.sceneData){gl.bufferData(gl.ARRAY_BUFFER,this.sceneData,gl.STATIC_DRAW);this.sceneUploaded=this.sceneData;this.sceneGpuBytes=this.sceneData.byteLength;}
  this.attributes(this.program,[['p',3],['n',3],['c',3]],36);gl.drawArrays(gl.TRIANGLES,0,this.sceneData.length/9);
 }
 loadBillboardAtlas(){if(this.billboardImage?.complete&&this.billboardImage.naturalWidth){if(!this.billboardTextureReady)this.uploadBillboardAtlas();return;}if(this.billboardImage||typeof Image==='undefined')return;const image=this.billboardImage=new Image();image.onload=()=>{if(this.ready&&!this.gl.isContextLost())this.uploadBillboardAtlas();};image.onerror=()=>{this.billboardTextureReady=false;};image.src='assets/orbital-billboards-flat.png';}
 uploadBillboardAtlas(){const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.billboardTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.billboardImage);this.billboardTextureReady=true;}
 setBillboards(data){this.billboardFrame=data;this.loadBillboardAtlas();}
 setBrandBillboard(data){this.brandFrame=data;if(!this.brandTextureReady)this.uploadBrandTexture();}
 uploadBrandTexture(){
  if(!this.brandImage){const image=this.brandImage=new Image();image.onload=()=>{if(this.ready&&!this.gl.isContextLost())this.uploadBrandTexture();};image.src='assets/elevator-cyber-wordmark.png';return;}
  if(!this.brandImage.complete||!this.brandImage.naturalWidth)return;
  const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.brandTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.brandImage);this.brandTextureReady=true;
 }
 initializeHolograms(shader){
  const gl=this.gl,vs='attribute vec3 p;attribute vec2 uv;uniform mat4 vp;varying vec2 texUV;varying vec3 world;void main(){texUV=uv;world=p;gl_Position=vp*vec4(p,1.);}',fs=`precision mediump float;uniform sampler2D image;uniform float time;varying vec2 texUV;varying vec3 world;
  void main(){float row=floor(texUV.y*190.);float glitch=step(.978,sin(row*12.13+floor(time*6.))* .5+.5);vec2 uv=texUV+vec2(glitch*sin(time*25.)*.0015,0.);vec3 tex=texture2D(image,uv).rgb;float lum=max(tex.r,max(tex.g,tex.b));float scan=.75+.25*sin(texUV.y*210.-time*8.);float sweep=pow(.5+.5*sin(texUV.y*9.-time*1.8),16.);float flicker=.92+.08*sin(time*37.+world.x*.01);vec3 cyan=vec3(.15,.85,1.);vec3 color=mix(tex,cyan*lum,.45)+cyan*sweep*.18;float alpha=smoothstep(.06,.5,lum)*(.42+.25*scan)*flicker;gl_FragColor=vec4(color,alpha);}`;
  this.hologramProgram=gl.createProgram();gl.attachShader(this.hologramProgram,shader(gl.VERTEX_SHADER,vs));gl.attachShader(this.hologramProgram,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.hologramProgram);if(!gl.getProgramParameter(this.hologramProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.hologramProgram));this.hologramVP=gl.getUniformLocation(this.hologramProgram,'vp');this.hologramTime=gl.getUniformLocation(this.hologramProgram,'time');this.hologramImage=gl.getUniformLocation(this.hologramProgram,'image');this.hologramBuffer=gl.createBuffer();this.hologramUploaded=null;this.hologramFrame=null;
 }
 setHolograms(data,time){this.hologramFrame=data;this.hologramPhase=time;}
 drawHolograms(){
  if(!this.hologramFrame||!this.billboardTextureReady)return;const gl=this.gl,data=this.hologramFrame;gl.useProgram(this.hologramProgram);gl.uniformMatrix4fv(this.hologramVP,false,this.vp);gl.uniform1f(this.hologramTime,this.hologramPhase);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.billboardTexture);gl.uniform1i(this.hologramImage,0);gl.bindBuffer(gl.ARRAY_BUFFER,this.hologramBuffer);if(this.hologramUploaded!==data){gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);this.hologramUploaded=data;}this.attributes(this.hologramProgram,[['p',3],['uv',2]],20);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.drawArrays(gl.TRIANGLES,0,data.length/5);gl.depthMask(true);gl.disable(gl.BLEND);
 }
 setWorldClock(canvas,data){
  const gl=this.gl;this.clockFrame=data;gl.bindTexture(gl.TEXTURE_2D,this.clockTexture);
  if(!this.clockTextureReady){for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);this.clockTextureReady=true;}else gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,canvas);
 }
 drawBillboards(){
  const streams=[[this.billboardFrame,this.titleSignTexture||this.billboardTextureReady,this.titleSignTexture||this.billboardTexture,this.billboardBuffer,'billboardUploaded',!!this.titleSignTexture],[this.brandFrame,this.brandTextureReady,this.brandTexture,this.brandBuffer,'brandUploaded',true],[this.clockFrame,this.clockTextureReady,this.clockTexture,this.clockBuffer,'clockUploaded',true]];if(!streams.some(s=>s[0]&&s[1]))return;
  const gl=this.gl;gl.useProgram(this.spriteProgram);gl.uniform1f(this.spriteFogDensityLoc,0);gl.uniformMatrix4fv(this.spriteVP,false,this.vp);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(this.spriteImageLoc,0);gl.uniform1f(this.spriteHaloLoc,1);gl.uniform1f(this.spriteOpacityLoc,1);gl.uniform3fv(this.spriteTintLoc,[-1,-1,-1]);gl.uniform1f(this.spriteLead,0);gl.uniform1f(this.spriteDirection,1);
  for(const [data,ready,texture,buffer,key,alpha]of streams){if(!data||!ready)continue;gl.uniform1f(this.spriteFogDensityLoc,key==='billboardUploaded'?(this.sceneFogDensity||0)*(this.titleSignTexture ? .08 : 1):0);gl.uniform3fv(this.spriteFogColorLoc,this.sceneFogColor||[0,0,0]);if(alpha){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}gl.bindTexture(gl.TEXTURE_2D,texture);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);this.attributes(this.spriteProgram,[['p',3],['uv',2]],20);if(this[key]!==data){gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);this[key]=data;}gl.drawArrays(gl.TRIANGLES,0,data.length/5);if(alpha){gl.disable(gl.BLEND);gl.depthMask(true);}}
 }
 loadSwordTexture(){if(this.swordImage?.complete&&this.swordImage.naturalWidth){this.uploadSwordTexture();return}if(this.swordImage||typeof Image==='undefined')return;const image=this.swordImage=new Image();image.onload=()=>{if(this.ready&&!this.gl.isContextLost())this.uploadSwordTexture()};image.onerror=()=>{this.spriteTextureReady=false};image.src='assets/sword-slash.png'}
 uploadSwordTexture(){const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.spriteTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.swordImage);this.spriteTextureReady=true}
 loadHaloTexture(){if(this.haloImage?.complete&&this.haloImage.naturalWidth){this.uploadHaloTexture();return}if(this.haloImage||typeof Image==='undefined')return;const image=this.haloImage=new Image();image.onload=()=>{if(this.ready&&!this.gl.isContextLost())this.uploadHaloTexture()};image.onerror=()=>{this.haloTextureReady=false};image.src='assets/star-halo.png'}
 uploadHaloTexture(){const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.haloTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.haloImage);this.haloTextureReady=true}
 pruneGroundDebris(active){
  if(!this.groundDebrisAssets)return;
  for(const [tile,asset]of this.groundDebrisAssets)if(!active.has(tile)){this.gl.deleteTexture(asset.texture);this.groundDebrisAssets.delete(tile);}
 }
 groundDebris(tile,x,z,y,span){
  const gl=this.gl;this.groundDebrisAssets??=new Map();let asset=this.groundDebrisAssets.get(tile);
  if(!asset||asset.program!==this.spriteProgram){asset={texture:gl.createTexture(),program:this.spriteProgram};this.groundDebrisAssets.set(tile,asset);tile.debrisDirty=true;gl.bindTexture(gl.TEXTURE_2D,asset.texture);for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);}
  if(tile.debrisDirty){gl.bindTexture(gl.TEXTURE_2D,asset.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,tile.debrisCanvas);tile.debrisDirty=false;}
  const h=span/2,d=h*1.06,corners=[[x-h,y,z-d,0,0],[x+h,y,z-d,1,0],[x+h,y,z+d,1,1],[x-h,y,z+d,0,1]];
  this.sprites.push({kind:'imageQuad',texture:asset.texture,data:new Float32Array([0,1,2,0,2,3].flatMap(i=>corners[i])),opacity:1});
 }
 imageQuad(url,corners){
  if(typeof Image==='undefined')return false;
  this.imageQuadAssets=this.imageQuadAssets||new Map();let asset=this.imageQuadAssets.get(url);
  if(!asset){const image=new Image();asset={image};this.imageQuadAssets.set(url,asset);image.src=url;}
  if(!asset.image.complete||!asset.image.naturalWidth)return false;
  const gl=this.gl;
  if(asset.program!==this.spriteProgram){asset.texture=gl.createTexture();asset.program=this.spriteProgram;gl.bindTexture(gl.TEXTURE_2D,asset.texture);for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,asset.image);}
  this.sprites.push({kind:'imageQuad',texture:asset.texture,data:new Float32Array([0,1,2,0,2,3].flatMap(i=>corners[i])),opacity:1});return true;
 }
 // Shared transparent muzzle sprite; attach its left edge to the barrel.
 muzzleFlash(x,y,z,angle,size=40,opacity=1){
  if(opacity<=0)return;
  this.glow(x,y,z,size*.45,'#ff9b29');
  const dx=Math.cos(angle),dz=Math.sin(angle),nx=-dz,nz=dx;
  const pt=(u,v)=>[x+dx*(u-.07)*size+nx*(v-.5)*size*.5,y+.2,z+dz*(u-.07)*size+nz*(v-.5)*size*.5,u,v];
  if(this.imageQuad('assets/gun-muzzle-simple-v2.png',[pt(0,0),pt(1,0),pt(1,1),pt(0,1)]))this.sprites[this.sprites.length-1].opacity=opacity;
 }
 haloSprite(x,y,z,size,opacity=.85){const pt=(u,v)=>[x+(u-.5)*size,y,z+(v-.5)*size*1.06,u,v],corners=[pt(0,0),pt(1,0),pt(1,1),pt(0,1)];this.sprites.push({data:new Float32Array([0,1,2,0,2,3].flatMap(i=>corners[i])),kind:'halo',opacity});}
 cyberBullet(x,z,y,angle,length,width,index,buildAtlas){
  if(!this.cyberBulletTexture){const gl=this.gl;this.cyberBulletPixels=this.cyberBulletPixels||buildAtlas();this.cyberBulletTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.cyberBulletTexture);for(const [key,value]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,key,value);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,512,256,0,gl.RGBA,gl.UNSIGNED_BYTE,this.cyberBulletPixels);}
  const dx=Math.cos(angle),dz=Math.sin(angle),nx=-dz,nz=dx,u0=(index%4*128+.5)/512,u1=(index%4*128+127.5)/512,v0=(Math.floor(index/4)*64+.5)/256,v1=(Math.floor(index/4)*64+63.5)/256,pt=(u,v,tu,tv)=>[x+dx*(u-.73)*length+nx*v*width*.5,y,z+dz*(u-.73)*length+nz*v*width*.5,tu,tv],points=[pt(0,-1,u0,v0),pt(1,-1,u1,v0),pt(1,1,u1,v1),pt(0,1,u0,v1)];this.sprites.push({kind:'cyberBullet',style:index,data:new Float32Array([0,1,2,0,2,3].flatMap(i=>points[i])),opacity:.95});
 }
 // Shared energy and tracer sprites; friendly tracers retain their yellow palette.
 enemyBullet(x,y,z,angle,r,style=0,friendly=false,exhaust=false){
  this.enemyBulletAssets=this.enemyBulletAssets||[];
  const key=style+(friendly?4:0)+(exhaust?8:0);let texture=this.enemyBulletAssets[key];
  if(!texture){const gl=this.gl,w=192,h=64,pixels=new Uint8Array(w*h*4);
   for(let j=0;j<h;j++)for(let i=0;i<w;i++){
    const u=(i+.5)/w,v=((j+.5)/h-.5)*2,center=exhaust?.73:.5;
    const head=Math.max(0,1-Math.abs(u-center)/(exhaust?(u<center?.29:.22):.44));
    const profile=style===2?head:Math.pow(head,style===1?1.9:.65);
    const tail=exhaust?Math.max(0,1-Math.abs(u-.4)/.4)*.14:0;
    const width=Math.max(profile*.58,tail),edge=Math.max(0,1-Math.abs(v)/(width+.001));
    const core=Math.pow(edge, .65),halo=Math.exp(-v*v/Math.max(.002,width*width*2))*Math.pow(Math.max(0,1-Math.abs(u-.58)/.58),.8)*.28;
    const a=Math.min(1,core+halo),hot=Math.pow(core,2);
    if(style===2||style===3){
     // Lens: pointed ends, convex shoulders, broad solid core, thin amber rim.
     // Compact capsule, centered on its collision position without a trailing streak.
     const lens=Math.pow(Math.max(0,1-((u-.5)/.46)**2),.78)*.75;
     const tracer=.62*Math.sqrt(Math.max(0,1-(Math.max(0,Math.abs(u-.5)-.23)/.22)**2));
     const span=style===2?lens:tracer,d=Math.abs(v)/Math.max(.001,span);
     const alpha=span>0?Math.max(0,Math.min(1,(1-d)*18)):0;
     const fill=Math.max(0,Math.min(1,(.9-d)*7));
     const glow=span>0?Math.exp(-d*d*1.7)*.23:0;
     const white=Math.max(0,Math.min(1,(.68-d)*10));
     pixels.set([255,Math.round((friendly?180:95)+(friendly?72:150)*white),Math.round(25+200*white),Math.round(Math.min(1,alpha+glow)*255)],(j*w+i)*4);
    }else pixels.set([255,Math.round(85+160*Math.pow(core,3)),Math.round(25+200*Math.pow(core,3)),Math.round(a*255)],(j*w+i)*4);
   }
   texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);this.enemyBulletAssets[key]=texture;
  }
  const center=exhaust?.73:.5,length=r*(exhaust?9:style===1?6:style===2?6:style===3?4.5:5),width=r*(style===1?3:style===3?3.6:4),dx=Math.cos(angle),dz=Math.sin(angle),pt=(u,v)=>[x+dx*(u-center)*length-dz*(v-.5)*width,y,z+dz*(u-center)*length+dx*(v-.5)*width,u,v],points=[pt(0,0),pt(1,0),pt(1,1),pt(0,1)];
  this.sprites.push({kind:'enemyBullet',texture,data:new Float32Array([0,1,2,0,2,3].flatMap(i=>points[i])),opacity:1,bulletStyle:style,friendly});
 }
 // Bounded RGBA sprite: warm core, colored rim and soft alpha falloff, no additive light.
 bulletOrb(x,y,z,r,color){
  this.bulletOrbAssets=this.bulletOrbAssets||new Map();let texture=this.bulletOrbAssets.get(color);
  if(!texture){const gl=this.gl,n=96,pixels=new Uint8Array(n*n*4),rgb=this.color(color);
   for(let j=0;j<n;j++)for(let i=0;i<n;i++){
    const d=Math.hypot((i+.5)/n*2-1,(j+.5)/n*2-1)/.532;
    const body=Math.max(0,Math.min(1,(1-d)*16)),soft=Math.exp(-(Math.max(0,d-1)**2)*7)*.2;
    const alpha=Math.max(body,soft)*Math.max(0,Math.min(1,(1.82-d)*8));
    const core=Math.max(0,Math.min(1,(.72-d)*7));const at=(j*n+i)*4;
    for(let k=0;k<3;k++)pixels[at+k]=Math.round(rgb[k]*255*(1-core)+[255,244,217][k]*core);
    pixels[at+3]=Math.round(alpha*255);
   }
   texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,n,n,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);this.bulletOrbAssets.set(color,texture);
  }
  const pt=(u,v)=>[x+(u-.5)*r*5,y+(v-.5)*r*5*.53217155,z-(v-.5)*r*5*.84663655,u,v],p=[pt(0,0),pt(1,0),pt(1,1),pt(0,1)];
  this.sprites.push({kind:'enemyBullet',texture,data:new Float32Array([0,1,2,0,2,3].flatMap(i=>p[i])),opacity:1,bulletStyle:'orb'});
 }
 laserFlow(x1,z1,x2,z2,y,width,time,opacity=1,color=null){
  if(!this.laserFlowTexture){const gl=this.gl,w=128,h=32,pixels=this.laserFlowPixels||new Uint8Array(w*h*4);if(!this.laserFlowPixels)for(let j=0;j<h;j++)for(let i=0;i<w;i++){const u=i/w*Math.PI*2,v=(j+.5)/h*2-1,core=Math.exp(-v*v*22),ripple=.5+.5*Math.cos(u*3+v*8),streak=Math.exp(-(((v-.3*Math.sin(u))/.1)**2)),alpha=Math.min(1,core*.9+(1-Math.abs(v))**2*(.16+.38*ripple)+streak*.22),at=(j*w+i)*4;pixels.set([70+185*core,185+70*core,255,Math.round(alpha*255)],at);}this.laserFlowPixels=pixels;this.laserFlowTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.laserFlowTexture);for(const [key,value]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.REPEAT],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,key,value);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);}
  const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz)||1,nx=-dz/len*width,nz=dx/len*width,u=-time*3,tiles=len/90,points=[[x1+nx,y,z1+nz,u,0],[x2+nx,y,z2+nz,u+tiles,0],[x2-nx,y,z2-nz,u+tiles,1],[x1-nx,y,z1-nz,u,1]];this.sprites.push({kind:'laserFlow',data:new Float32Array([0,1,2,0,2,3].flatMap(i=>points[i])),opacity,tint:color?this.color(color):null});
 }
 // Soft headlight mask: feathered sides, widening core and a long smooth falloff.
 softLightBeam(corners,color,opacity=.4){
  if(!this.softLightTexture){
   const gl=this.gl,w=128,h=64,pixels=this.softLightPixels||new Uint8Array(w*h*4);
   if(!this.softLightPixels)for(let j=0;j<h;j++)for(let i=0;i<w;i++){
    const u=i/(w-1),v=j/(h-1)*2-1,width=.045+.94*u,edge=Math.max(0,Math.min(1,(Math.abs(v)/width-.5)/.5)),side=1-edge*edge*(3-2*edge),end=Math.max(0,Math.min(1,(u-.48)/.52)),start=1-Math.exp(-u*65),tail=1-end*end*(3-2*end),alpha=side*start*tail*.75;
    pixels.set([255,255,255,Math.round(alpha*255)],(j*w+i)*4);
   }
   this.softLightPixels=pixels;this.softLightTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.softLightTexture);
   for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  }
  const uv=[[0,0],[1,0],[1,1],[0,1]],points=corners.map((p,i)=>[...p,...uv[i]]);
  this.sprites.push({kind:'softLight',data:new Float32Array([0,1,2,0,2,3].flatMap(i=>points[i])),tint:this.color(color),opacity});
 }
 // A reusable procedural lightning texture; generated once, uploaded once per context.
 electricSprite(x,y,z,size,angle=0,opacity=1){
  if(!this.electricTexture){const gl=this.gl,n=64,pixels=new Uint8Array(n*n*4),points=[[5,3],[29,13],[21,25],[40,32],[31,44],[56,61]],branches=[...points.slice(1).map((p,i)=>[points[i],p]),[[21,25],[7,33]],[[40,32],[57,25]],[[31,44],[17,53]]];
   for(let yy=0;yy<n;yy++)for(let xx=0;xx<n;xx++){let distance=99;for(const [a,b]of branches){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((xx-a[0])*dx+(yy-a[1])*dy)/(dx*dx+dy*dy)));distance=Math.min(distance,Math.hypot(xx-a[0]-dx*t,yy-a[1]-dy*t));}const core=Math.exp(-distance*distance/1.2),glow=Math.exp(-distance*distance/15),i=(yy*n+xx)*4;pixels[i]=100+155*core;pixels[i+1]=200+55*core;pixels[i+2]=255;pixels[i+3]=Math.min(255,(core*.95+glow*.24)*255);}
   this.electricPixels=pixels;this.electricTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.electricTexture);for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,n,n,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  }
  const cs=Math.cos(angle),sn=Math.sin(angle),pt=(u,v)=>{const dx=(u-.5)*size,dy=(v-.5)*size,xx=dx*cs-dy*sn,up=dx*sn+dy*cs;return [x+xx,y+up*.532,z-up*.847,u,v]},corners=[pt(0,0),pt(1,0),pt(1,1),pt(0,1)];this.sprites.push({data:new Float32Array([0,1,2,0,2,3].flatMap(i=>corners[i])),kind:'electric',opacity});
 }
 // One textured quad replaces the procedurally tessellated blade trail.
 swordSprite(x,y,z,angle,size,lead,direction=-1,color){const cs=Math.cos(angle),sn=Math.sin(angle),pt=(u,v)=>{const dx=(u-.5)*size,dz=(v-.5)*size;return [x+dx*cs-dz*sn,y,z+(dx*sn+dz*cs)*1.06,u,v]},corners=[pt(0,0),pt(1,0),pt(1,1),pt(0,1)];this.sprites.push({data:new Float32Array([0,1,2,0,2,3].flatMap(i=>corners[i])),lead,direction,tint:color?this.color(color):null})}
 swordWave(x,z,y,angle,radius,color){
  if(!this.swordWaveTexture){const gl=this.gl,N=128,pixels=this.swordWavePixels||new Uint8Array(N*N*4);if(!this.swordWavePixels)for(let j=0;j<N;j++)for(let i=0;i<N;i++){const side=((j+.5)/N*2-1)*1.12,forward=(i+.5)/N*2-1,front=Math.sqrt(Math.max(0,1-side*side))-.5,gap=front-forward,taper=Math.max(0,1-Math.abs(side)**6),core=Math.exp(-((gap/.035)**2)),blur=Math.exp(-((gap/.09)**2))*.22,tail=gap>0?Math.exp(-gap/.33)*(1-Math.exp(-gap/.028))*.6:0,alpha=Math.min(1,(core*.85+blur+tail)*taper);pixels.set([255,255,255,Math.round(alpha*255)],(j*N+i)*4);}this.swordWavePixels=pixels;this.swordWaveTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.swordWaveTexture);for(const [key,value]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,key,value);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,N,N,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);}
  const cs=Math.cos(angle),sn=Math.sin(angle),pt=(u,v)=>{const forward=(u*2-1)*radius,side=(v*2-1)*radius*1.12;return [x+forward*cs-side*sn,y,z+(forward*sn+side*cs)*1.06,u,v];},p=[pt(0,0),pt(1,0),pt(1,1),pt(0,1)];this.sprites.push({kind:'swordWave',data:new Float32Array([0,1,2,0,2,3].flatMap(i=>p[i])),tint:this.color(color),opacity:.9});
 }

 // Retained meshes: geometry uploads once per context; only poses upload per frame.
 residentMesh(key,build,pose=[1,0,0,0,0,1,0,0,0,0,1,0],hit={x:0,z:0,flash:false}){
  if(globalThis.RoomReady)pose=RoomReady.pose(key,pose);
  if(this.residentTransform)pose=this.residentTransform(pose);
  let mesh=this.residentMeshes.get(key);
  if(!mesh){const oldData=this.data,oldCount=this.count,oldPoints=this.projectiles,oldPointCount=this.projectileCount;this.data=new Float32Array(16384);this.count=0;this.projectiles=new Float32Array(256);this.projectileCount=0;
   try{build();mesh={data:this.data.slice(0,this.count),points:this.projectiles.slice(0,this.projectileCount),instances:new Float32Array(13*32),count:0,buffer:null,poseBuffer:null,capacity:0};this.residentMeshes.set(key,mesh);}finally{this.data=oldData;this.count=oldCount;this.projectiles=oldPoints;this.projectileCount=oldPointCount;}}
  const offset=mesh.count*13;if(offset+13>mesh.instances.length){const next=new Float32Array(mesh.instances.length*2);next.set(mesh.instances);mesh.instances=next;}mesh.instances.set(pose,offset);mesh.instances[offset+3]+=hit.x||0;mesh.instances[offset+11]+=hit.z||0;mesh.instances[offset+12]=hit.white>0?-Math.min(1,hit.white):hit.flash?1:0;(mesh.outlineTags??=[])[mesh.count]=this.outlineGroup||0;(mesh.enemyTiers??=[])[mesh.count]=this.residentEnemyTier||1;mesh.count++;
  for(let i=0;i<mesh.points.length;i+=7){const p=mesh.points,x=p[i],y=p[i+1],z=p[i+2],color=hit.flash&&!(hit.white>0)?[1,1,1]:[p[i+3],p[i+4],p[i+5]];const start=this.projectileCount;this.projectile(pose[0]*x+pose[1]*y+pose[2]*z+pose[3]+(hit.x||0),pose[4]*x+pose[5]*y+pose[6]*z+pose[7],pose[8]*x+pose[9]*y+pose[10]*z+pose[11]+(hit.z||0),p[i+6],'#ffffff');if(hit.white>0)for(let j=0;j<3;j++)color[j]+=(1-color[j])*Math.min(1,hit.white);this.projectiles.set(color,start+3);}
  return mesh;
 }
 residentMaterial(key,build,pose,opacity=1,mode=0,time=0){const mesh=this.residentMesh(key,build,pose);mesh.opacity=opacity;mesh.surfaceMode=mode;mesh.surfaceTime=time;return mesh;}
 enemyMidtoneAmount(tag){return tag===.5?Math.max(0,Math.min(60,globalThis.NeonPostFX?.settings.enemyMidtone??25))*.01:0;}
 drawResidentMeshes(translucent=false){
  const gl=this.gl,ext=this.residentExtension,program=this.residentProgram;gl.useProgram(program);gl.uniform1f(this.residentLightLocations.surfaceShader,this.surfaceShaderMode());this.uploadPlayerLight(this.residentLightLocations.playerLightPosition,this.residentLightLocations.playerLightColor);this.uploadCityFog(program);gl.uniformMatrix4fv(this.residentVP,false,this.vp);gl.uniform1f(this.residentLightLocations.sceneGrade,this.sceneGrade||0);gl.uniform4fv(this.residentLightLocations.sceneFogView,this.sceneFogView||[0,.84663655,.53217155,826.801]);gl.uniform1f(this.residentLightLocations.sceneFogDensity,this.sceneFogDensity||0);gl.uniform1f(this.residentLightLocations.sceneTime,this.sceneTime||0);gl.uniform3fv(this.residentLightLocations.sceneFogColor,this.sceneFogColor||[0,0,0]);gl.uniform2f(this.residentLightLocations.clubLight,this.clubCyan??.8,this.clubMagenta??.65);for(const [name,value]of [['keyLightDirection',this.keyLightDirection||[.1,1,-.1]],['topLight',this.topLight||[.3,.6,.5]],['rearLeftColor',this.rearLeftColor||[.12,.92,.78]],['rearRightColor',this.rearRightColor||[.85,.12,.48]]])gl.uniform3fv(this.residentLightLocations[name],value);
  gl.uniform1f(this.residentSurfaceUniforms[4],this.residentEnemyTime||0);
  if(translucent){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}
  for(const [meshKey,mesh] of this.residentMeshes){if(!mesh.count||((mesh.opacity??1)<1)!==translucent)continue;if(translucent)gl.blendFunc(gl.SRC_ALPHA,mesh.surfaceMode>3.5?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(this.residentSurfaceUniforms[0],mesh.opacity??1);gl.uniform1f(this.residentSurfaceUniforms[1],mesh.surfaceMode??0);gl.uniform1f(this.residentSurfaceUniforms[2],mesh.surfaceTime??0);if(!mesh.buffer){mesh.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.data,gl.STATIC_DRAW);}gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);this.attributes(program,[['p',3],['n',3],['c',3]],36);
   const locations=this.residentPoseLocations;
   if(ext){if(!mesh.poseBuffer)mesh.poseBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.poseBuffer);if(mesh.capacity<mesh.instances.byteLength){gl.bufferData(gl.ARRAY_BUFFER,mesh.instances.byteLength,gl.DYNAMIC_DRAW);mesh.capacity=mesh.instances.byteLength;}gl.bufferSubData(gl.ARRAY_BUFFER,0,mesh.instances.subarray(0,mesh.count*13));for(let i=0;i<4;i++){const a=locations[i];if(a<0)continue;gl.enableVertexAttribArray(a);this.enabledAttributes.add(a);gl.vertexAttribPointer(a,i===3?1:4,gl.FLOAT,false,52,i*16);ext.vertexAttribDivisorANGLE(a,1);}// Group existing instances without changing resident geometry or pose layout.
    for(let start=0;start<mesh.count;){const amount=this.enemyMidtoneAmount(/shadow/i.test(meshKey)?0:mesh.outlineTags?.[start]),tier=mesh.enemyTiers[start];let end=start+1;
     while(end<mesh.count&&mesh.enemyTiers[end]===tier&&this.enemyMidtoneAmount(/shadow/i.test(meshKey)?0:mesh.outlineTags?.[end])===amount)end++;
     gl.uniform1f(this.residentLightLocations.enemyMidtone,amount);gl.uniform1f(this.residentSurfaceUniforms[3],tier);for(let i=0;i<4;i++){const a=locations[i];if(a>=0)gl.vertexAttribPointer(a,i===3?1:4,gl.FLOAT,false,52,start*52+i*16);}ext.drawArraysInstancedANGLE(gl.TRIANGLES,0,mesh.data.length/9,end-start);start=end;}
    for(const a of locations)if(a>=0)ext.vertexAttribDivisorANGLE(a,0);
   }else{for(const a of locations)if(a>=0){gl.disableVertexAttribArray(a);this.enabledAttributes.delete(a);}for(let i=0;i<mesh.count;i++){gl.uniform1f(this.residentLightLocations.enemyMidtone,this.enemyMidtoneAmount(/shadow/i.test(meshKey)?0:mesh.outlineTags?.[i]));gl.uniform1f(this.residentSurfaceUniforms[3],mesh.enemyTiers[i]);const at=i*13;for(let k=0;k<3;k++)if(locations[k]>=0)gl.vertexAttrib4fv(locations[k],mesh.instances.subarray(at+k*4,at+k*4+4));if(locations[3]>=0)gl.vertexAttrib1f(locations[3],mesh.instances[at+12]);gl.drawArrays(gl.TRIANGLES,0,mesh.data.length/9);}}
  }
  if(translucent){gl.depthMask(true);gl.disable(gl.BLEND);}
 }
 // Diagnostics only: materialize posed vertices for render regression tests.
 residentSnapshot(){const out=[];for(const mesh of this.residentMeshes.values())for(let j=0;j<mesh.count;j++){const at=j*13,m=mesh.instances;for(let i=0;i<mesh.data.length;i+=9){const d=mesh.data,x=d[i],y=d[i+1],z=d[i+2];out.push(m[at]*x+m[at+1]*y+m[at+2]*z+m[at+3],m[at+4]*x+m[at+5]*y+m[at+6]*z+m[at+7],m[at+8]*x+m[at+9]*y+m[at+10]*z+m[at+11],...d.subarray(i+3,i+9));}}return new Float32Array(out);}

 resize(){const dpr=Math.min(window.devicePixelRatio||1,1.5),r=this.canvas.getBoundingClientRect();let width=Math.max(1,Math.round(r.width*dpr)),height=Math.max(1,Math.round(r.height*dpr));if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height}this.gl.viewport(0,0,width,height);const aspect=width/height,halfY=CAMERA_BASE_HALF_WIDTH*(this.cameraScale||1)/Math.min(aspect,9/16),halfX=halfY*aspect;this.halfX=halfX;this.halfY=halfY;this.frameColumns=LIFT_MAP.columns;this.backRows=LIFT_MAP.backRows;this.frontRows=LIFT_MAP.frontRows;this.pointScale=width/(halfX*2);this.arenaHeight=(LIFT_MAP.backRows+LIFT_MAP.frontRows+1)*LIFT_MAP.tile;

 // Orthographic camera faces down the shaft at a 58-degree tilt.
 const eye=[0,700,440],len=Math.hypot(700,440),cy=700/len,cz=440/len,distance=this.scenePerspective?1800:len;const view=[1,0,0,0,0,cz,cy,0,0,-cy,cz,0,0,0,-distance,1];
 const near=20,far=14000,focal=distance/halfY;const proj=this.scenePerspective?[focal/aspect,0,0,0,0,focal,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]:[1/halfX,0,0,0,0,1/halfY,0,0,0,0,-2/7999,0,0,0,-1-2/7999,1];this.vp=this.mul(proj,view);
 this.unshakenVP=null;
 }
 mul(a,b){const r=new Float32Array(16);for(let c=0;c<4;c++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)r[c*4+row]+=a[k*4+row]*b[c*4+k];return r}
 color(c){if(!this.colors[c])this.colors[c]=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);return this.colors[c]}
 vertex(p,n,c){if(this.count+9>this.data.length){let d=new Float32Array(this.data.length*2);d.set(this.data);this.data=d}let i=this.count,d=this.data;d[i++]=p[0];d[i++]=p[1];d[i++]=p[2];d[i++]=n[0];d[i++]=n[1];d[i++]=n[2];d[i++]=c[0];d[i++]=c[1];d[i++]=c[2];this.count=i}
 projectile(x,y,z,r,col,strength=1){if(this.projectileCount+7>this.projectiles.length){let d=new Float32Array(this.projectiles.length*2);d.set(this.projectiles);this.projectiles=d}let i=this.projectileCount,d=this.projectiles,c=this.color(col);d[i++]=x;d[i++]=y;d[i++]=z;d[i++]=c[0]*strength;d[i++]=c[1]*strength;d[i++]=c[2]*strength;d[i++]=r;this.projectileCount=i}
 // Attribute locations belong to each shader; disable the slots used by the previous pass.
 glow(x,y,z,r,col,strength=1){this.projectile(x,y,z,-Math.abs(r),col,strength)}
 attributes(program,names,stride){const gl=this.gl;for(const i of this.enabledAttributes)gl.disableVertexAttribArray(i);this.enabledAttributes.clear();let offset=0;for(const [name,size] of names){const a=gl.getAttribLocation(program,name);if(a>=0){gl.enableVertexAttribArray(a);this.enabledAttributes.add(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,stride,offset)}offset+=size*4}}


 quad(a,b,c,d,col){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz)||1,normal=[-nx/l,-ny/l,-nz/l],color=this.color(col);this.vertex(a,normal,color);this.vertex(b,normal,color);this.vertex(c,normal,color);this.vertex(a,normal,color);this.vertex(c,normal,color);this.vertex(d,normal,color)}
 emissiveSquareScan(...args){const start=this.count;this.squareScan(...args);this.markEmissive(start)}
 // Per-corner alpha makes blade trails fade into the scene without dark opaque tails.
 transparentQuad(a,b,c,d,col,alpha=[1,1,1,1]){const rgb=this.color(col);this.transparentVertex(a,rgb,alpha[0]);this.transparentVertex(b,rgb,alpha[1]);this.transparentVertex(c,rgb,alpha[2]);this.transparentVertex(a,rgb,alpha[0]);this.transparentVertex(c,rgb,alpha[2]);this.transparentVertex(d,rgb,alpha[3]);}
 // Write directly into the reusable buffer; particle effects call this thousands of times.
 transparentVertex(p,rgb,alpha){if(this.transparentCount+7>this.transparentData.length){const next=new Float32Array(this.transparentData.length*2);next.set(this.transparentData);this.transparentData=next}let i=this.transparentCount;const data=this.transparentData;data[i++]=p[0];data[i++]=p[1];data[i++]=p[2];data[i++]=rgb[0];data[i++]=rgb[1];data[i++]=rgb[2];data[i++]=Math.max(0,Math.min(1,alpha));this.transparentCount=i;}
 emissiveQuad(...args){const start=this.count;this.quad(...args);this.markEmissive(start)}
 // A normal tag enables the fragment shader's circular LED lattice on flat tiles.
 emissiveLEDQuad(a,b,c,d,low,high=low){for(const [p,col] of [[a,low],[b,low],[c,high],[a,low],[c,high],[d,high]])this.vertex(p,[0,2.2,0],col)}
 emissiveBox(...args){const start=this.count;this.box(...args);this.markEmissive(start)}
 emissiveRing(...args){const start=this.count;this.ring(...args);this.markEmissive(start)}
 // Slightly longer normals encode weak self-light while preserving light direction.
 // Normal lengths 3/3.25 tag floor lighting while retaining normal/weak self-light.
 markFloor(start){for(let i=start;i<this.count;i+=9){const length=Math.hypot(this.data[i+3],this.data[i+4],this.data[i+5]);if(length>=.99&&length<1.5){const factor=(length+2)/length;for(let k=3;k<6;k++)this.data[i+k]*=factor}}}
 markPhosphor(start,strength=.25){for(let i=start;i<this.count;i+=9){const length=Math.hypot(this.data[i+3],this.data[i+4],this.data[i+5]);if(length>0&&length<1.1){const scale=(1+strength)/length;for(let j=3;j<6;j++)this.data[i+j]*=scale}}}
 // Apply hit feedback to one model only, including its attached glow points.
 hitModel(start,glowStart,dx,dz,flash){const white=Math.max(0,Math.min(1,Number(flash)||0));for(let i=start;i<this.count;i+=9){this.data[i]+=dx;this.data[i+2]+=dz;if(white){this.data[i+3]=0;this.data[i+4]=2;this.data[i+5]=0;for(let k=6;k<9;k++)this.data[i+k]+=(1-this.data[i+k])*white;}}for(let i=glowStart;i<this.projectileCount;i+=7){this.projectiles[i]+=dx;this.projectiles[i+2]+=dz;if(white)for(let k=3;k<6;k++)this.projectiles[i+k]+=(1-this.projectiles[i+k])*white;}}
 // UI normal tag: unlit and excluded from shadow maps.
 markUI(start){for(let i=start;i<this.count;i+=9){this.data[i+3]=0;this.data[i+4]=1.8;this.data[i+5]=0}}
 markEmissive(start){for(let i=start;i<this.count;i+=9){this.data[i+3]=0;this.data[i+4]=2;this.data[i+5]=0}}
 box(x,y,z,w,h,d,col,yaw=0){const cs=Math.cos(yaw),sn=Math.sin(yaw),pt=(a,b,c)=>[x+a*cs+c*sn,y+b,z-a*sn+c*cs],a=w/2,b=h/2,c=d/2;let v=[pt(-a,-b,-c),pt(a,-b,-c),pt(a,b,-c),pt(-a,b,-c),pt(-a,-b,c),pt(a,-b,c),pt(a,b,c),pt(-a,b,c)];for(const f of [[3,2,6,7],[4,5,1,0],[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2]])this.quad(...f.map(i=>v[i]),col)}
 spike(x,y,z,r,h,col){if(h<=0)return;const top=[x,y+h,z],corners=[[x-r,y,z-r],[x+r,y,z-r],[x+r,y,z+r],[x-r,y,z+r]],neck=corners.map(p=>[x+(p[0]-x)*.28,y+h*.72,z+(p[2]-z)*.28]);for(let i=0;i<4;i++){const j=(i+1)%4;this.quad(corners[i],neck[i],neck[j],corners[j],col);this.emissiveQuad(neck[i],top,neck[j],neck[j],'#ffffff')}}
 sphere(x,y,z,r,col,sx=1,sy=1,sz=1,rings=5,segments=10){const at=(i,j)=>{let a=i*Math.PI/rings,b=j*Math.PI*2/segments;return [x+Math.sin(a)*Math.cos(b)*r*sx,y+Math.cos(a)*r*sy,z+Math.sin(a)*Math.sin(b)*r*sz]};for(let i=0;i<rings;i++)for(let j=0;j<segments;j++)this.quad(at(i,j),at(i+1,j),at(i+1,j+1),at(i,j+1),col)}
 disc(x,y,z,r,col){const color=this.color(col);for(let i=0;i<24;i++){let a=i*Math.PI/12,b=(i+1)*Math.PI/12;for(const p of [[x,y,z],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],[x+Math.cos(a)*r,y,z+Math.sin(a)*r]])this.vertex(p,[0,1,0],color)}}
 ring(x,y,z,r,col,width=2){for(let i=0;i<24;i++){let a=i*Math.PI/12,b=(i+1)*Math.PI/12;this.quad([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],[x+Math.cos(b)*(r-width),y,z+Math.sin(b)*(r-width)],[x+Math.cos(a)*(r-width),y,z+Math.sin(a)*(r-width)],col)}}
 hoop(x,y,z,r,col,width=1.5,yaw=0){const cs=Math.cos(yaw),sn=Math.sin(yaw),pt=(a,rad)=>[x+Math.cos(a)*rad*cs,y+Math.sin(a)*rad,z+Math.cos(a)*rad*sn];for(let i=0;i<32;i++){const a=i*Math.PI/16,b=(i+1)*Math.PI/16;this.emissiveQuad(pt(a,r),pt(b,r),pt(b,r-width),pt(a,r-width),col)}}
 squareScan(x,z,w,d,progress,col,opacity=1){if(progress<=0)return;const end=Math.min(1,progress)*Math.PI*2,angles=[0,end],hx=w/2,hz=d/2;for(let i=1;i<64;i++)if(i*Math.PI*2/64<end)angles.push(i*Math.PI*2/64);for(const dx of [-1,1])for(const dz of [-1,1]){let a=(Math.atan2(dz*hz,dx*hx)+Math.PI/2+Math.PI*2)%(Math.PI*2);if(a>0&&a<end)angles.push(a)}angles.sort((a,b)=>a-b);const point=a=>{let theta=a-Math.PI/2,c=Math.cos(theta),s=Math.sin(theta),length=Math.min(hx/Math.max(.000001,Math.abs(c)),hz/Math.max(.000001,Math.abs(s)));return [x+c*length,2.5,z+s*length]},color=this.color(col);for(let i=0;i<angles.length-1;i++){const points=[[x,2.5,z],point(angles[i]),point(angles[i+1])];if(opacity<1)this.transparentQuad(...points,points[0],col,[opacity,opacity,opacity,opacity]);else for(const p of points)this.vertex(p,[0,1,0],color)}}
 arc(x,y,z,r,progress,col,width=2){const segments=Math.ceil(48*progress);for(let i=0;i<segments;i++){let a=-Math.PI/2+i*Math.PI*2/48,b=-Math.PI/2+Math.min((i+1)/48,progress)*Math.PI*2;this.quad([x+Math.cos(a)*r,y,z+Math.sin(a)*r],[x+Math.cos(b)*r,y,z+Math.sin(b)*r],[x+Math.cos(b)*(r-width),y,z+Math.sin(b)*(r-width)],[x+Math.cos(a)*(r-width),y,z+Math.sin(a)*(r-width)],col)}}
 cameraJolt(x,y){
  if(!x&&!y)return;
  if(!this.unshakenVP){
   this.unshakenVP=this.joltProjectionBuffer??=new Float32Array(16);
   this.unshakenVP.set(this.vp);
  }
  const bounds=this.canvas.getBoundingClientRect(),dx=x*2/bounds.width,dy=-y*2/bounds.height;
  for(let c=0;c<4;c++){this.vp[c*4]+=dx*this.vp[c*4+3];this.vp[c*4+1]+=dy*this.vp[c*4+3];}
 }
 screenPoint(x,y,z){const m=this.vp,c=this.canvas.getBoundingClientRect(),cx=m[0]*x+m[4]*y+m[8]*z+m[12],cy=m[1]*x+m[5]*y+m[9]*z+m[13],w=m[3]*x+m[7]*y+m[11]*z+m[15];return {x:(cx/w+1)*c.width/2,y:(1-cy/w)*c.height/2}}
 surfaceShaderMode(){return globalThis.NeonPostFX?.settings.surfaceShader==='soft-toon'?1:0;}
 uploadPlayerLight(position,color){const light=this.playerLight,rgb=this.color(light?.color||'#ffdba3');this.gl.uniform4f(position,light?.x||0,light?.y||0,light?.z||0,light?.range||1);this.gl.uniform4f(color,...rgb,light?.strength||0);}
 begin(){this.rainbowPickups=[];if(this.particleBakes)for(const mesh of this.particleBakes.values())mesh.count=0;this.playerLight=null;globalThis.FruitModels?.begin();globalThis.CatPlayer?.begin();for(const mesh of this.residentMeshes.values())mesh.count=0;this.resize();this.count=0;this.projectileCount=0;this.transparentCount=0;this.sprites=[];this.cityFogVolumes=null;this.cityLightFrame=null;this.waterfallFrame=null;this.billboardFrame=null;this.brandFrame=null;this.clockFrame=null;this.hologramFrame=null}
 end(){if(!this.ready||this.gl.isContextLost())return;this.prepareSceneOcclusion?.();let gl=this.gl;gl.clearColor(...(this.backgroundColor||[.045,.065,.072]),1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);gl.uniform1f(this.surfaceShaderLoc,this.surfaceShaderMode());this.uploadPlayerLight(...this.playerLightUniforms);this.uploadCityFog(this.program);gl.uniformMatrix4fv(this.vpLoc,false,this.vp);gl.uniform1f(this.sceneGradeLoc,this.sceneGrade||0);gl.uniform4fv(this.sceneFogViewLoc,this.sceneFogView||[0,.84663655,.53217155,826.801]);gl.uniform1f(this.sceneFogDensityLoc,this.sceneFogDensity||0);gl.uniform1f(this.sceneTimeLoc,this.sceneTime||0);gl.uniform3fv(this.sceneFogColorLoc,this.sceneFogColor||[0,0,0]);gl.uniform2f(this.clubLightLoc,this.clubCyan??.8,this.clubMagenta??.65);gl.uniform3fv(this.topLightLoc,this.topLight||[.3,.6,.5]);gl.uniform3fv(this.keyLightLoc,this.keyLightDirection||[.1,1,-.1]);gl.uniform3fv(this.rearLeftColorLoc,this.rearLeftColor||[.12,.92,.78]);gl.uniform3fv(this.rearRightColorLoc,this.rearRightColor||[.85,.12,.48]);gl.uniform1f(this.enemyMidtoneLoc,0);this.drawStaticScene();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);this.attributes(this.program,[['p',3],['n',3],['c',3]],36);if(this.gpuCapacity<this.data.byteLength){gl.bufferData(gl.ARRAY_BUFFER,this.data.byteLength,gl.DYNAMIC_DRAW);this.gpuCapacity=this.data.byteLength}gl.bufferSubData(gl.ARRAY_BUFFER,0,this.data.subarray(0,this.count));this.setOutlineGroup?.(0);
 let next=0;for(const [start,count,tag] of this.outlineRanges||[]){gl.uniform1f(this.enemyMidtoneLoc,0);if(start>next)gl.drawArrays(gl.TRIANGLES,next,start-next);gl.uniform1f(this.enemyMidtoneLoc,this.enemyMidtoneAmount(tag));gl.drawArrays(gl.TRIANGLES,start,count);next=start+count;}gl.uniform1f(this.enemyMidtoneLoc,0);if(next<this.count/9)gl.drawArrays(gl.TRIANGLES,next,this.count/9-next);
 this.drawWaterfall();this.drawResidentMeshes();globalThis.FruitModels?.render(this);globalThis.CatPlayer?.render(this);this.drawSceneOcclusion?.();this.drawCharacterOutline?.();this.drawResidentMeshes(true);this.drawBillboards();this.drawHolograms();this.drawCityLights();
 if(this.transparentCount){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.useProgram(this.transparentProgram);gl.uniformMatrix4fv(this.transparentVP,false,this.vp);gl.bindBuffer(gl.ARRAY_BUFFER,this.transparentBuffer);this.attributes(this.transparentProgram,[['p',3],['c',4]],28);if(this.transparentCapacity<this.transparentData.byteLength){gl.bufferData(gl.ARRAY_BUFFER,this.transparentData.byteLength,gl.DYNAMIC_DRAW);this.transparentCapacity=this.transparentData.byteLength}gl.bufferSubData(gl.ARRAY_BUFFER,0,this.transparentData.subarray(0,this.transparentCount));gl.drawArrays(gl.TRIANGLES,0,this.transparentCount/7);gl.depthMask(true);gl.disable(gl.BLEND)}
 this.drawParticleSurfaces?.();
 if((this.spriteTextureReady||this.haloTextureReady||this.electricTexture||this.laserFlowTexture||this.cyberBulletTexture||this.swordWaveTexture||this.softLightTexture||this.sprites.some(s=>s.texture))&&this.sprites.length){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.useProgram(this.spriteProgram);gl.uniform1f(this.spriteFogDensityLoc,0);gl.uniformMatrix4fv(this.spriteVP,false,this.vp);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.spriteTexture);gl.uniform1i(this.spriteImageLoc,0);gl.bindBuffer(gl.ARRAY_BUFFER,this.spriteBuffer);this.attributes(this.spriteProgram,[['p',3],['uv',2]],20);for(const sprite of this.sprites){const mapIcon=sprite.kind==='mapIcon'||sprite.kind==='mapIconGlow'||sprite.kind==='imageQuad'||sprite.kind==='enemyBullet',electric=sprite.kind==='electric',flow=sprite.kind==='laserFlow',cyber=sprite.kind==='cyberBullet',wave=sprite.kind==='swordWave',soft=sprite.kind==='softLight',halo=mapIcon||sprite.kind==='halo'||electric||flow||cyber||wave||soft;if(mapIcon?!sprite.texture:soft?!this.softLightTexture:wave?!this.swordWaveTexture:cyber?!this.cyberBulletTexture:flow?!this.laserFlowTexture:electric?!this.electricTexture:halo?!this.haloTextureReady:!this.spriteTextureReady)continue;gl.bindTexture(gl.TEXTURE_2D,mapIcon?sprite.texture:soft?this.softLightTexture:wave?this.swordWaveTexture:cyber?this.cyberBulletTexture:flow?this.laserFlowTexture:electric?this.electricTexture:halo?this.haloTexture:this.spriteTexture);gl.blendFunc(gl.SRC_ALPHA,(halo&&!mapIcon&&!cyber)||sprite.kind==='mapIconGlow'?gl.ONE:gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(this.spriteHaloLoc,sprite.flat?3:sprite.kind==='mapIconGlow'?2:halo?1:0);gl.uniform1f(this.spriteOpacityLoc,sprite.opacity??1);gl.uniform3fv(this.spriteTintLoc,sprite.tint||[-1,-1,-1]);gl.uniform1f(this.spriteLead,sprite.lead??0);gl.uniform1f(this.spriteDirection,sprite.direction??1);gl.bufferData(gl.ARRAY_BUFFER,sprite.data,gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,sprite.vertexCount||6)}gl.depthMask(true);gl.disable(gl.BLEND)}
 globalThis.RainbowPickups?.render(this);
 if(this.projectileCount){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);gl.useProgram(this.projectileProgram);gl.uniformMatrix4fv(this.projectileVP,false,this.vp);gl.uniform1f(this.projectileScale,this.pointScale);gl.bindBuffer(gl.ARRAY_BUFFER,this.projectileBuffer);this.attributes(this.projectileProgram,[['p',3],['c',3],['radius',1]],28);if(this.projectileCapacity<this.projectiles.byteLength){gl.bufferData(gl.ARRAY_BUFFER,this.projectiles.byteLength,gl.DYNAMIC_DRAW);this.projectileCapacity=this.projectiles.byteLength}gl.bufferSubData(gl.ARRAY_BUFFER,0,this.projectiles.subarray(0,this.projectileCount));gl.drawArrays(gl.POINTS,0,this.projectileCount/7);gl.depthMask(true);gl.disable(gl.BLEND)}
 }
}



// Shared particle surfaces: immutable geometry on GPU, per-frame affine poses and RGBA only.
Elevator3D.prototype.particleSurface=function(key,build,pose,color,opacity=1,inner=1){
 if(!(opacity>0))return;
 if(this.particleBakeContext!==this.residentProgram){this.particleBakes=new Map();this.particleBakeContext=this.residentProgram;this.particleBakeProgram=null;}
 let mesh=this.particleBakes.get(key);
 if(!mesh){const data=this.transparentData,count=this.transparentCount;this.transparentData=new Float32Array(4096);this.transparentCount=0;
  try{build();mesh={data:this.transparentData.slice(0,this.transparentCount),instances:new Float32Array(20*32),count:0,buffer:null,poseBuffer:null,capacity:0};this.particleBakes.set(key,mesh);}finally{this.transparentData=data;this.transparentCount=count;}}
 const at=mesh.count*20;if(at+20>mesh.instances.length){const next=new Float32Array(mesh.instances.length*2);next.set(mesh.instances);mesh.instances=next;}
 mesh.instances.set(pose,at);mesh.instances.set(this.color(color),at+12);mesh.instances[at+15]=Math.max(0,Math.min(1,opacity));if(Array.isArray(inner))mesh.instances.set(inner,at+16);else mesh.instances[at+16]=inner;mesh.count++;
};
Elevator3D.prototype.drawParticleSurfaces=function(){
 if(!this.particleBakes||![...this.particleBakes.values()].some(m=>m.count))return;
 const gl=this.gl,ext=this.residentExtension;
 if(!this.particleBakeProgram){
  const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader;};
  const program=gl.createProgram();
  gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec3 p;attribute vec4 c;attribute vec4 pose0;attribute vec4 pose1;attribute vec4 pose2;attribute vec4 tint;attribute vec4 inner;uniform mat4 vp;varying vec4 color;void main(){vec3 local=p;if(p.z>15.)local=vec3(p.x,p.y*mix(inner.x,inner.y,p.x),0.);else if(p.z>5.)local=vec3(p.xy*inner.x,0.);vec4 point=vec4(local,1.);gl_Position=vp*vec4(dot(pose0,point),dot(pose1,point),dot(pose2,point),1.);color=c*tint;if(p.z>15.)color.a*=mix(inner.z,inner.w,p.x);}'));
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,'precision mediump float;varying vec4 color;void main(){gl_FragColor=color;}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  this.particleBakeProgram=program;this.particleBakeVP=gl.getUniformLocation(program,'vp');this.particleBakeLocations=['pose0','pose1','pose2','tint','inner'].map(n=>gl.getAttribLocation(program,n));
 }
 const program=this.particleBakeProgram,locations=this.particleBakeLocations;gl.useProgram(program);gl.uniformMatrix4fv(this.particleBakeVP,false,this.vp);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
 for(const mesh of this.particleBakes.values()){
  if(!mesh.count)continue;
  if(!mesh.buffer){mesh.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh.data,gl.STATIC_DRAW);}
  gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);this.attributes(program,[['p',3],['c',4]],28);
  if(ext){if(!mesh.poseBuffer)mesh.poseBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,mesh.poseBuffer);if(mesh.capacity<mesh.instances.byteLength){gl.bufferData(gl.ARRAY_BUFFER,mesh.instances.byteLength,gl.DYNAMIC_DRAW);mesh.capacity=mesh.instances.byteLength;}gl.bufferSubData(gl.ARRAY_BUFFER,0,mesh.instances.subarray(0,mesh.count*20));
   for(let k=0;k<5;k++){const a=locations[k];if(a<0)continue;gl.enableVertexAttribArray(a);this.enabledAttributes.add(a);gl.vertexAttribPointer(a,4,gl.FLOAT,false,80,k*16);ext.vertexAttribDivisorANGLE(a,1);}
   ext.drawArraysInstancedANGLE(gl.TRIANGLES,0,mesh.data.length/7,mesh.count);for(const a of locations)if(a>=0)ext.vertexAttribDivisorANGLE(a,0);
  }else{
   for(const a of locations)if(a>=0){gl.disableVertexAttribArray(a);this.enabledAttributes.delete(a);}
   for(let i=0;i<mesh.count;i++){const at=i*20;for(let k=0;k<4;k++)if(locations[k]>=0)gl.vertexAttrib4fv(locations[k],mesh.instances.subarray(at+k*4,at+k*4+4));if(locations[4]>=0)gl.vertexAttrib4fv(locations[4],mesh.instances.subarray(at+16,at+20));gl.drawArrays(gl.TRIANGLES,0,mesh.data.length/7);}
  }
 }
 gl.depthMask(true);gl.disable(gl.BLEND);
};
// Diagnostics only: expand baked surfaces without touching live frame buffers.
Elevator3D.prototype.particleSurfaceSnapshot=function(){
 const out=[];for(const mesh of this.particleBakes?.values()||[])for(let j=0;j<mesh.count;j++){const m=mesh.instances,at=j*20;for(let i=0;i<mesh.data.length;i+=7){const d=mesh.data;let x=d[i],y=d[i+1],z=d[i+2],alpha=d[i+6];if(z>15){y*=m[at+16]*(1-x)+m[at+17]*x;alpha*=m[at+18]*(1-x)+m[at+19]*x;z=0;}else if(z>5){x*=m[at+16];y*=m[at+16];z=0;}out.push(m[at]*x+m[at+1]*y+m[at+2]*z+m[at+3],m[at+4]*x+m[at+5]*y+m[at+6]*z+m[at+7],m[at+8]*x+m[at+9]*y+m[at+10]*z+m[at+11],d[i+3]*m[at+12],d[i+4]*m[at+13],d[i+5]*m[at+14],alpha*m[at+15]);}}
 return new Float32Array(out);
};

// Generated VFX textures, cached on the GPU and rebuilt after context restore.
Elevator3D.prototype.pickupLightAsset=function(kind){
 if(typeof Image==='undefined')return null;
 this.pickupLightImages??=new Map();let image=this.pickupLightImages.get(kind);
 if(!image){image=new Image();image.src=kind==='chart'?'assets/pickup-column-generated.png':'assets/pickup-core-generated.png';this.pickupLightImages.set(kind,image);}
 if(!image.complete||!image.naturalWidth)return null;
 if(this.pickupLightContext!==this.spriteProgram){this.pickupLightContext=this.spriteProgram;this.pickupLightAssets=new Map();}
 let asset=this.pickupLightAssets.get(kind);
 if(!asset){
  const gl=this.gl,texture=gl.createTexture();let source=image;
  const w=image.naturalWidth,h=image.naturalHeight||w;
  // WebGL1 repeated textures require power-of-two dimensions.
  if((w&(w-1))||(h&(h-1))){source=document.createElement('canvas');source.width=512;source.height=256;source.getContext('2d').drawImage(image,0,0,512,256);}
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.REPEAT],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  asset={texture,data:new Float32Array(48*6*5)};this.pickupLightAssets.set(kind,asset);
 }
 return asset;
};
Elevator3D.prototype.pickupLightCylinder=function(kind,x,y,z,radius,height,phase,opacity){
 const asset=this.pickupLightAsset(kind);if(!asset)return;
 let at=0;const vertex=(a,v)=>{asset.data[at++]=x+Math.cos(a)*radius;asset.data[at++]=y+v*height;asset.data[at++]=z+Math.sin(a)*radius;asset.data[at++]=a/(Math.PI*2)+phase;asset.data[at++]=v;};
 for(let i=0;i<48;i++){const a=i*Math.PI*2/48,b=(i+1)*Math.PI*2/48;vertex(a,0);vertex(b,0);vertex(b,1);vertex(a,0);vertex(b,1);vertex(a,1);}
 this.sprites.push({kind:'imageQuad',texture:asset.texture,data:asset.data,vertexCount:288,opacity});
};
Elevator3D.prototype.shieldPickupEffect=function(x,y,z,progress,health=false){
 const t=Math.max(0,Math.min(1,progress)),alpha=Math.min(1,t/.02)*Math.min(1,(1-t)/.2)*(Math.floor(t*.25/.04)%2?.25:1),radius=36;
 for(let i=0;i<48;i++){
  const a=i*Math.PI*2/48,b=(i+1)*Math.PI*2/48,pt=(angle,rad)=>[x+Math.cos(angle)*rad,y,z+Math.sin(angle)*rad];
  this.transparentQuad(pt(a,radius),pt(b,radius),pt(b,radius-3.4),pt(a,radius-3.4),health?'#35dc73':'#268cff',[alpha,alpha,alpha,alpha]);
 }
 const start=this.sprites.length;
 this.pickupLightCylinder('chart',x,y,z,radius,136*(1-t),t*.7,alpha*.8);
 this.pickupLightCylinder('core',x,y+2,z,(1.5+12*(1-t)**1.5)*1.5,(90+150*t)*3,0,alpha*.9);
 if(health)for(let i=start;i<this.sprites.length;i++)this.sprites[i].tint=[.4,1,.3];
};
Elevator3D.prototype.shieldPickupHalo=function(x,y,z,age,health=false){
 this.pickupLightAsset('chart');this.pickupLightAsset('core');
 const angle=age*.9,c=Math.cos(angle),s=Math.sin(angle),size=110;
 const pt=(u,v)=>{const dx=(u-.5)*size,dy=(.5-v)*size,xx=dx*c-dy*s,up=dx*s+dy*c;return [x+xx,y+up*.53217155,z-up*.84663655,u,v];};
 if(this.imageQuad('assets/pickup-reward-cyan-soft.png',[pt(0,0),pt(1,0),pt(1,1),pt(0,1)])){const sprite=this.sprites[this.sprites.length-1];sprite.opacity=.65;if(health)sprite.tint=[.4,1,.3];}
};
