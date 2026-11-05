const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await b.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?electriclab=1');await page.waitForFunction(()=>globalThis.ElectricEditor?.editing&&globalThis.MapIcons?.ready);
 async function setup(level=1){await page.evaluate(level=>{ElectricEditor.reset();ElectricTiles.reset();RoomReady.cancel();tiles=[{x:0,y:0}];ElectricTiles.place('battery',{x:0,y:0},level);enemies=[];enemyTransports=[];spawnQueue=[];testMode=false;floor=2;state='landing';timedRoom=null;const random=Math.random;Math.random=()=>0;try{ElectricEditor.prepareFloor();}finally{Math.random=random;}ElectricEditor.catalog(['battery','floorLine','floorBend']);},level);await page.waitForTimeout(250);}
 async function drop(){const box=await page.locator('#electric-backpack [data-kind="battery"]').first().boundingBox(),to=await page.evaluate(()=>{draw();const at=ElectricTiles.center({x:0,y:0}),p=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),cr=canvas.getBoundingClientRect();return {x:p.x+cr.left,y:p.y+cr.top};});await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y-30,{steps:4});await page.mouse.move(to.x,to.y,{steps:8});await page.evaluate(()=>{document.addEventListener('pointerup',()=>{window.choicesAtRelease=document.querySelectorAll('#electric-backpack [data-stock-id]').length;},{once:true});});await page.mouse.up();}
 await setup();const before=await page.evaluate(()=>({time,x:p.x,y:p.y}));await drop();
 assert.equal(await page.evaluate(()=>choicesAtRelease),0,'all three offers gone in the same release event');assert.equal(await page.locator('#electric-backpack [data-stock-id]').count(),0);assert.equal(await page.evaluate(()=>ElectricTiles.list()[0].level),2);assert.equal(await page.evaluate(()=>ElectricEditor.preparing&&paused&&!RoomReady.active),true);
 assert.equal(await page.locator('[data-merge-celebration]').count(),1,'upgrade still plays after offers disappear');
 await page.locator('[data-run]').evaluate(el=>el.click());assert.equal(await page.evaluate(()=>ElectricEditor.preparing),true,'run cannot bypass reveal');
 await page.waitForFunction(()=>Number(document.querySelector('[data-merge-celebration]')?.dataset.mergeAge)>.3);
 assert.equal(await page.evaluate(()=>ElectricTiles.list()[0].level),2);assert.equal(await page.locator('[data-merge-celebration] path').count(),14);
 assert.deepEqual(await page.evaluate(()=>({time,x:p.x,y:p.y})),before,'gameplay freezes through celebration');
 await page.screenshot({path:'tests/building-upgrade-celebration.png'});
 await page.waitForFunction(()=>!document.querySelector('[data-merge-celebration]'));assert.equal(await page.evaluate(()=>ElectricEditor.preparing&&paused),true,'still waits for confirmation');await page.locator('[data-run]').click();await page.waitForFunction(()=>!ElectricEditor.preparing&&!RoomReady.active&&state==='combat');assert.equal(await page.locator('#electric-placement').isVisible(),false);
 // Reset cancels an in-progress effect without starting a stale room.
 await setup();await drop();await page.evaluate(()=>ElectricEditor.reset());assert.equal(await page.locator('#electric-placement').isVisible(),false);await page.waitForTimeout(1400);assert.equal(await page.evaluate(()=>RoomReady.active),false);
 // Existing-building merge retains this floor's choices, with the same star celebration.
 await page.evaluate(()=>{ElectricTiles.reset();tiles=[{x:0,y:0},{x:1,y:0}];ElectricTiles.place('battery',{x:0,y:0},2);ElectricTiles.place('battery',{x:1,y:0},2);testMode=false;floor=3;state='landing';ElectricEditor.prepareFloor();});
 await page.waitForTimeout(250);const offers=await page.evaluate(()=>ElectricEditor.stock);
 const points=await page.evaluate(()=>[0,1].map(x=>{draw();const at=ElectricTiles.center({x,y:0}),p=renderer.screenPoint(at.x-325,4,(at.y-300)*1.06),cr=canvas.getBoundingClientRect();return {x:p.x+cr.left,y:p.y+cr.top};}));await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();await page.mouse.move(points[1].x,points[1].y,{steps:8});await page.mouse.up();
 await page.waitForFunction(()=>document.querySelector('[data-merge-celebration="3"]'));await page.waitForFunction(()=>!document.querySelector('[data-merge-celebration]'));assert.deepEqual(await page.evaluate(()=>ElectricEditor.stock),offers);assert.equal(await page.evaluate(()=>ElectricEditor.preparing),true);
 assert.equal(await page.evaluate(()=>ElectricTiles.list()[0].level),3);
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);console.log('Upgrade: choices cleared in release event, celebration and confirmation lock preserved, reset cancellation and existing merge choice conservation passed.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
