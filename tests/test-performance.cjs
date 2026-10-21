const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const context={console};vm.createContext(context);vm.runInContext(fs.readFileSync('dist/performance.js','utf8').split('// Attach after')[0],context);
vm.runInContext(`
let now=0;const snapshot=()=>({state:'combat',floor:1,heapUsedMB:null,cache:{meshes:2,colors:10},objects:{particles:0}}),probe=new GamePerformance(snapshot,()=>now);
function check(v,m){if(!v)throw Error(m)}
function frame(t,active=true){probe.beginFrame(t);now+=1;probe.measure('logicMs',()=>{now+=2});probe.measure('drawMs',()=>{now+=4});probe.endFrame(active)}
for(let i=0;i<=120;i++)frame(i*1000/60);
check(probe.history.length>=1&&Math.abs(probe.lastSample.fps-60)<.01,'60fps from real frame interval');check(probe.lastSample.timings.logicMs===2&&probe.lastSample.timings.drawMs===4,'per-stage average timing');
frame(2100);check(probe.slowFrames===1&&probe.spikes[0].frameMs>50,'real frame gap retained beyond gameplay dt clamp');
frame(2200,false);frame(9000);check(probe.slowFrames===1,'hidden/context gap excluded');
for(let i=0;i<5000;i++)frame(10000+i*1001);check(probe.history.length===1200&&probe.spikes.length===64&&probe.frameTimes.length<=240,'bounded history and spikes');
for(let i=0;i<100;i++)probe.observeLongTask(80,i);check(probe.longTasks===100&&probe.spikes.length===64,'bounded long tasks');
const report=probe.report();check(report.samples.length===1200&&report.spikes.length===64&&report.current.state==='combat','export includes history and current scene');check(probe.trend().includes('JS堆 不可用'),'unsupported heap not reported as zero');
const objects=snapshot();probe.reset();check(!probe.history.length&&!probe.spikes.length&&!probe.lastSample&&probe.longTasks===0,'reset diagnostics');check(objects.cache.meshes===2,'reset does not mutate game/cache');
let threw=false;try{probe.measure('throws',()=>{now+=3;throw Error('expected')})}catch{threw=true}check(threw&&probe.pending.throws===3,'measure preserves thrown errors');
console.log('Performance: real FPS/gaps, stage timing, hidden exclusion, bounded samples/spikes/tasks, export, unavailable heap, non-mutating reset and exceptions passed');
`,context);
