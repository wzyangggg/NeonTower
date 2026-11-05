const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4173/?electriclab=1');await p.waitForFunction(()=>globalThis.TileLab?.active);
 await p.evaluate(()=>{paused=true;window.requestAnimationFrame=()=>0;enemies=[];particles=[];deathBursts=[];shatterVisual({x:325,y:300,r:20,type:'crawler',scoreValue:200});deathBursts[0].age=.23;draw();});
 await p.waitForFunction(()=>renderer.imageQuadAssets?.get('assets/enemy-death-score-atlas.png')?.image.naturalWidth>0);
 const report=await p.evaluate(()=>{const e=deathBursts[0],samples=[0,.06,.15,.3,.8,.9].map(age=>{e.age=age;renderer.begin();drawEnemyDeathScore(e);return {age,count:renderer.sprites.length,finite:renderer.sprites.every(s=>s.data.every(Number.isFinite))};});
 e.age=.23;e.score=9876543210;renderer.begin();drawEnemyDeathScore(e);const allGlyphs=renderer.sprites.length;
 e.score=0;renderer.begin();drawEnemyDeathScore(e);const noScore=renderer.sprites.length;
 e.score=200;draw();return {samples,allGlyphs,noScore};});
 assert(report.samples.every(s=>s.finite));assert.deepEqual(report.samples.map(s=>s.count),[0,4,4,4,4,0]);assert.equal(report.allGlyphs,11);assert.equal(report.noScore,0);
 assert.equal(await p.evaluate(()=>renderer.gl.getError()),0);assert.deepEqual(errors,[]);await p.screenshot({path:'tests/enemy-death-score-390.png'});console.log(report);
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
