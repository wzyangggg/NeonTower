const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/shop-preview.html');
 await page.waitForSelector('.edition-grid canvas[data-ready="true"]');
 assert.equal(await page.locator('.edition-sample').count(),5);
 async function samples(){return page.evaluate(()=>{const canvas=document.querySelector('.edition-grid canvas'),gl=canvas.getContext('webgl'),bytes=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,bytes);const rect=canvas.getBoundingClientRect(),dpr=canvas.width/rect.width;return [...document.querySelectorAll('.edition-art')].map(el=>{const r=el.getBoundingClientRect(),out=[];for(let y=1;y<10;y++)for(let x=1;x<10;x++){const px=Math.round((r.left-rect.left)*dpr)+Math.floor(Math.round(r.width*dpr)*x/10),py=Math.round((rect.bottom-r.bottom)*dpr)+Math.floor(Math.round(r.height*dpr)*(1-y/10)),offset=(py*canvas.width+px)*4;out.push(...bytes.slice(offset,offset+3));}return out;});});}
 const before=await samples();await page.waitForTimeout(220);const after=await samples();
 const distance=(a,b)=>a.reduce((v,c,i)=>v+Math.abs(c-b[i]),0)/a.length;
 assert.deepEqual(before[0],after[0],'base stays still');
 for(let i=1;i<5;i++){assert.ok(distance(after[0],after[i])>10,'material visibly changes base '+i);assert.ok(distance(before[i],after[i])>.1,'material animates '+i);}
 await page.locator('#edition-pause').click();const paused=await samples();await page.waitForTimeout(150);assert.deepEqual(await samples(),paused,'pause freezes material pixels');
 await page.locator('#edition-strength').fill('0');const plain=await samples();for(let i=1;i<5;i++)assert.ok(distance(plain[0],plain[i])<4,'zero intensity restores source art '+i);
 await page.locator('#edition-strength').fill('85');await page.locator('[data-edition="4"]').click();assert.match(await page.locator('.edition-selection').innerText(),/负片/);
 for(const [width,height]of [[390,844],[390,680],[1280,900]]){await page.setViewportSize({width,height});await page.waitForTimeout(70);assert.ok(await page.locator('.edition-grid').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'no horizontal overflow');await page.screenshot({path:`tests/shop-editions-${width}x${height}.png`});}
 await page.locator('#edition-pause').click();await page.emulateMedia({reducedMotion:'reduce'});const reduced=await samples();await page.waitForTimeout(150);assert.deepEqual(await samples(),reduced,'reduced motion freezes pixels');
 await page.evaluate(()=>{window.__editionTestLose=document.querySelector('.edition-grid canvas').getContext('webgl').getExtension('WEBGL_lose_context');window.__editionTestLose.loseContext();});await page.waitForSelector('.edition-grid canvas[data-ready="false"]');
 await page.evaluate(()=>window.__editionTestLose.restoreContext());await page.waitForSelector('.edition-grid canvas[data-ready="true"]');
 assert.equal(await page.locator('.edition-grid canvas').evaluate(el=>el.getContext('webgl').getError()),0);
 await page.locator('.shop-buy[data-i="0"]').click();await page.locator('#equipment-confirm').click();assert.equal(await page.locator('.edition-grid canvas[data-ready="true"]').count(),1,'purchase preserves the material gallery/context');
 assert.deepEqual(errors,[]);
 console.log('Edition material lab: 5 distinct pixel outputs, animated finishes, static base, pause/strength/source restore, selection, reduced motion, context restoration and three viewport sizes passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
