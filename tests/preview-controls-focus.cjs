const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>globalThis.HexMap?.ready&&globalThis.NeonPostFX);
 await page.evaluate(()=>{reset();RoomReady.cancel();ElectricEditor.reset();paused=false;state='survival';survivalRemaining=1000;p.inv=9999;enemies=[];spawnQueue=[];});
 async function movement(key,flag){const before=await page.evaluate(()=>({x:p.x,y:p.y}));await page.keyboard.down(key);assert.equal(await page.evaluate(flag=>keys[flag],flag),true);await page.waitForTimeout(180);await page.keyboard.up(key);assert.equal(await page.evaluate(flag=>keys[flag],flag),false);const after=await page.evaluate(()=>({x:p.x,y:p.y}));assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>1,JSON.stringify({key,before,after}));}
 await page.locator('#pause').click();await page.locator('#postfx-panel > summary').click();await page.locator('.postfx-group').filter({has:page.locator('[data-setting="playerLightStrength"]')}).locator('summary').click();
 const slider=page.locator('[data-setting="playerLightStrength"]');await slider.focus();await slider.press('ArrowRight');assert.equal(await page.evaluate(()=>!!keys.ArrowRight),false);assert.equal(await page.evaluate(()=>paused),true);
 // P must work while a slider owns focus; resuming returns focus to the canvas.
 await page.keyboard.press('p');assert.equal(await page.evaluate(()=>paused),false);assert.equal(await page.evaluate(()=>document.activeElement.id),'game');await movement('d','d');await movement('ArrowDown','ArrowDown');
 // WASD from a running panel should move; arrow keys still adjust focused controls.
 await slider.focus();await movement('a','a');
 // Releasing a key over the panel must clear the original gameplay key.
 await page.keyboard.down('d');await slider.focus();await page.keyboard.up('d');assert.equal(await page.evaluate(()=>keys.d),false);
 // Native dropdown editing stays available during pause; P still resumes.
 await page.keyboard.press('p');await page.locator('.postfx-group').filter({has:page.locator('[data-setting="surfaceShader"]')}).locator('summary').click();const select=page.locator('[data-setting="surfaceShader"]');await select.selectOption('soft-toon');await select.focus();await page.keyboard.press('p');assert.equal(await page.evaluate(()=>paused),false);await movement('w','w');
 // Closing the settings and using the pause menu's resume button both restore focus.
 await select.focus();await page.locator('#postfx-panel > summary').click();await page.waitForFunction(()=>document.activeElement.id==='game');await movement('d','d');
 await page.locator('#pause').click();await page.waitForTimeout(300);await page.locator('#resume').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'game');await movement('ArrowLeft','ArrowLeft');
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>renderer.gl.getError()),0);await page.screenshot({path:'tests/controls-focus-restored-390.png'});
 console.log('Keyboard focus: pause/edit range or shader dropdown/P resume, running-panel WASD, arrow adjustment, captured keyup, closing controls and resume button restore actual movement passed');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});