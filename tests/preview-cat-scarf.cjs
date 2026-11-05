const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
const page=await b.newPage({viewport:{width:700,height:900},deviceScaleFactor:2}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173/?avatar=cat&scarf=1');await page.waitForFunction(()=>globalThis.CatPlayer?.ready&&globalThis.HexMap?.ready);
await page.evaluate(()=>{reset();paused=true;state='combat';enemies=[];spawnQueue=[];p.inv=0;time=1;fallAge=landingAge=5;NeonPostFX.settings.cameraSize=.4;NeonPostFX.refresh();clearTimeout(toast.timer);$('toast').classList.remove('show');draw();});
const a=await page.screenshot();await page.evaluate(()=>{time+=.3;draw();});const b1=await page.screenshot();assert.notDeepEqual(a,b1,'idle flutter changes pixels');
const checks=await page.evaluate(()=>{const uploads=CatPlayer.stats.uploads;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[0,0]])for(let i=0;i<60;i++){time+=1/60;p.x+=dx*.2;p.y+=dy*.2;draw();}return {uploads,after:CatPlayer.stats.uploads,gl:renderer.gl.getError()};});assert.equal(checks.uploads,checks.after);assert.equal(checks.gl,0);assert.deepEqual(errors,[]);
const trajectory=await page.evaluate(()=>{
 const base={...CatPlayer.stats.instance,legPoses:null},runs=[];
 for(const fps of [30,60,120]){
  let x=0,z=0,t=-10;CatPlayer.draw({...base,x,z,time:t});
  for(let i=0;i<fps;i++){t+=1/fps;x+=1/fps*50;CatPlayer.draw({...base,x,z,time:t});}
  const before=CatPlayer.scarf;
  for(let i=0;i<Math.round(fps*.2);i++){t+=1/fps;z+=1/fps*50;CatPlayer.draw({...base,x,z,time:t});}
  const turn=CatPlayer.scarf;
  CatPlayer.draw({...base,x,z,time:t});const frozen=JSON.stringify(turn)===JSON.stringify(CatPlayer.scarf);
  for(let i=0;i<Math.round(fps*.2);i++){t+=1/fps;CatPlayer.draw({...base,x,z,time:t});}
  const settled=CatPlayer.scarf;
  for(let i=0;i<Math.round(fps*.3);i++){t+=1/fps;CatPlayer.draw({...base,x,z,time:t});}
  const stopped=CatPlayer.scarf;
  runs.push({fps,before,turn,settled,stopped,frozen});
 }
 draw();return runs;
});
for(const run of trajectory){
 assert.ok(run.frozen,'paused chain stays fixed');
 assert.ok(run.turn.flat().every(Number.isFinite));
 const root=run.turn[0],tail=run.turn[12];
 assert.ok(tail[0]<root[0]-.25,'tail retains earlier horizontal trajectory after vertical turn');
 assert.ok(Math.abs(tail[2]-run.before[12][2])<.1,'turn does not rotate tail around neck');
 for(let i=1;i<13;i++)assert.ok(Math.hypot(...run.turn[i].map((v,k)=>v-run.turn[i-1][k]))<.086,'tail length bounded');
 assert.notDeepEqual(run.stopped,run.turn,'light ambient flutter remains');
 assert.ok(Math.max(...run.stopped.map((p,i)=>Math.hypot(...p.map((v,k)=>v-run.settled[i][k]))))<.025,'air drag stops residual swinging within 0.2s');
}
for(const run of trajectory.slice(1))assert.ok(Math.hypot(...run.turn[12].map((v,k)=>v-trajectory[0].turn[12][k]))<.04,'frame rates agree');
const flutter=await page.evaluate(()=>{
 const base={...CatPlayer.stats.instance,legPoses:null,x:0,z:0};let t=-20;
 CatPlayer.draw({...base,time:t});const samples=[];
 for(let i=0;i<600;i++){t+=1/60;CatPlayer.draw({...base,time:t});if(i>120&&i%6===0)samples.push(CatPlayer.scarfSurface);}
 const still=JSON.stringify(CatPlayer.scarfSurface);CatPlayer.draw({...base,time:t});
 const frozen=still===JSON.stringify(CatPlayer.scarfSurface);
 draw();return {samples,frozen};
});
assert.ok(flutter.frozen,'noise freezes with game time');
const tailY=flutter.samples.map(s=>s[12][1]),rootY=flutter.samples.map(s=>s[0][1]);
assert.ok(Math.max(...tailY)-Math.min(...tailY)>.06,'idle tail visibly floats with irregular gusts');
assert.ok(Math.max(...tailY)-Math.min(...tailY)<.35,'idle flutter stays gentle');
assert.ok(Math.max(...rootY)-Math.min(...rootY)<.00001,'neck attachment remains fixed');
await page.screenshot({path:'tests/player-cat-scarf.png'});console.log('CAT_SCARF_PASS',checks);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

