/** HTTP inspection and staged camera cases, not campaigns played by a human. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VERSION} from '../src/data.js';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-art-v092');await mkdir(out,{recursive:true});
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4177';let server,browser;
const STATIC_SUBJECT='film_red_pyramid_film_175',ANIMATED_SUBJECT='sh1_air_screamer_001';
const report={version:VERSION,checks:[],errors:[],captures:[],fixtures:['Direct actor placement at both stage edges and synthetic world amounts exercise only the render envelope; they do not certify or enable a fixed-stage transition. The genuine stage and complete world state are restored for the capture.']};
const check=(name,passed)=>{report.checks.push({name,passed:!!passed});if(!passed)throw Error(name);};
const shot=async(page,name)=>{await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});report.captures.push(name+'.png');};
async function selectSubject(page,id,source){
 await page.fill('#spriteSearch','');await page.selectOption('#spriteSource',source);
 await page.fill('#spriteSearch',id);await page.locator(`.sprite-card[data-id="${id}"]`).click();
 await page.waitForFunction(id=>{const c=document.querySelector('#spriteDetail canvas');return c?.dataset.spriteId===id&&c.dataset.artStatus==='raster';},id);
}
try{
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4177','--dist'],{cwd:root,stdio:'ignore'});
 let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}check('static server ready',ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base+'/modules/sprite-workshop.html');await selectSubject(page,STATIC_SUBJECT,'film');
 check('live inspector mounts using actual loaded bitmap',await page.locator('.sprite-inspector').count()===1);
 check('single-frame image does not claim an animated clip',await page.locator('[data-inspect=play]').isDisabled());
 await page.selectOption('[data-inspect=pose]','crouch');check('missing pose explicitly reports idle fallback',await page.locator('[data-inspect=status]').textContent().then(t=>t.includes('À PRODUIRE'))&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle');
 await page.selectOption('[data-inspect=pose]','idle');await page.click('[data-inspect=flip]');check('presentation direction toggle operates',await page.locator('[data-inspect=flip]').textContent()==='VOIR VERS LA DROITE');
 await page.getByText('CALIBRER CETTE IMAGE',{exact:true}).click();await page.fill('[data-inspect=anchorX]','0.61');await page.locator('[data-inspect=anchorX]').dispatchEvent('change');check('local calibration marked unapplied',/non appliquée/.test(await page.locator('[data-inspect=status]').textContent()));
 check('editing does not mutate authoritative asset registry',await page.evaluate(async()=>{const {SPRITES}=await import('/src/sprite-manifest.js');return SPRITES[document.querySelector('#spriteDetail canvas').dataset.spriteId].frames[0].anchor[0]!==.61;}));
 const downloadPromise=page.waitForEvent('download');await page.click('[data-inspect=export]');const file=await downloadPromise;await file.saveAs(resolve(out,'calibration.json'));check('calibration is exported as a separate file',file.suggestedFilename().startsWith('HALO_CALIBRATION_'));
 await page.fill('[data-inspect=bodyHeight]','0');await page.locator('[data-inspect=bodyHeight]').dispatchEvent('change');check('invalid body calibration refused visibly',/invalides/.test(await page.locator('[data-inspect=error]').textContent()));
 await page.click('[data-inspect=reset]');check('reset removes local edits',!/non appliquée/.test(await page.locator('[data-inspect=status]').textContent()));await shot(page,'01-inspector');
 await page.fill('#spriteSearch','');await page.selectOption('#spriteSource','all');await page.selectOption('#spriteFilter','missing');check('changing filter disposes obsolete inspector',await page.locator('.sprite-inspector').count()===0);
 await page.click('#spriteNext');check('paging keeps dossier inside visible page',await page.evaluate(()=>[...document.querySelectorAll('.sprite-card')].some(e=>e.dataset.id===document.querySelector('#spriteDetail canvas').dataset.spriteId)));
 await page.selectOption('#spriteFilter','ready');await selectSubject(page,STATIC_SUBJECT,'film');
 await page.setViewportSize({width:430,height:932});check('inspector controls fit mobile width',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(page,'02-mobile-inspector');
 await page.setViewportSize({width:1440,height:1000});await selectSubject(page,ANIMATED_SUBJECT,'sh1');
 const air=await page.evaluate(async()=>{const art=(await import('/src/sprite-manifest.js')).SPRITES.sh1_air_screamer_001;return {frames:art.frames.length,pixels:new Set(art.frames.map(f=>f.pixelSHA256)).size,fidelity:art.fidelity,steps:art.clips.idle.frames,loop:art.clips.idle.loop};});
 check('Air Screamer has three distinct candidate images and a loop without visual certification',air.frames===3&&air.pixels===3&&air.fidelity==='unverified'&&air.loop&&JSON.stringify(air.steps)==='[0,1,0,2]');
 const sought=[];for(const tick of [0,6,12,18]){
  await page.locator('[data-inspect=tick]').evaluate((input,tick)=>{input.value=String(tick);input.dispatchEvent(new Event('input',{bubbles:true}));},tick);
  await page.waitForFunction(()=>document.querySelector('#spriteDetail canvas')?.dataset.artStatus==='raster');
  sought.push(Number(await page.locator('#spriteDetail canvas').getAttribute('data-frame-index')));
 }
 check('seeking the imported idle timeline renders its three real images in authored order',JSON.stringify(sought)==='[0,1,0,2]');
 await page.locator('[data-inspect=tick]').evaluate(input=>{input.value='0';input.dispatchEvent(new Event('input',{bubbles:true}));});
 check('the candidate multi-image idle enables playback',await page.locator('[data-inspect=play]').isEnabled());
 await page.evaluate(()=>{const canvas=document.querySelector('#spriteDetail canvas');window.__AIR_PLAYBACK_FRAMES__=[Number(canvas.dataset.frameIndex)];window.__AIR_PLAYBACK_OBSERVER__=new MutationObserver(()=>{const index=Number(canvas.dataset.frameIndex),seen=window.__AIR_PLAYBACK_FRAMES__;if(seen.at(-1)!==index)seen.push(index);});window.__AIR_PLAYBACK_OBSERVER__.observe(canvas,{attributes:true,attributeFilter:['data-frame-index']});});
 await page.click('[data-inspect=play]');await page.waitForFunction(()=>window.__AIR_PLAYBACK_FRAMES__.length>=5);
 await page.click('[data-inspect=play]');
 const played=await page.evaluate(()=>{window.__AIR_PLAYBACK_OBSERVER__.disconnect();return window.__AIR_PLAYBACK_FRAMES__.slice(0,5);});
 check('actual playback visits all imported frames and loops back to the first',JSON.stringify(played)==='[0,1,0,2,0]');await shot(page,'05-air-screamer-idle');
 await page.selectOption('[data-inspect=pose]','crouch');
 const absent=await page.evaluate(()=>({frame:document.querySelector('#spriteDetail canvas').dataset.frameIndex,tick:document.querySelector('[data-inspect=tick]').value}));
 await page.waitForTimeout(120);
 check('a missing Air Screamer pose stays an explicit frozen fallback even though idle can animate',await page.locator('[data-inspect=play]').isDisabled()&&/À PRODUIRE/.test(await page.locator('[data-inspect=status]').textContent())&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle'&&await page.evaluate(before=>document.querySelector('#spriteDetail canvas').dataset.frameIndex===before.frame&&document.querySelector('[data-inspect=tick]').value===before.tick,absent));
 await page.goto(base+'/modules/unified-versus.html?qa=1&p1=film_red_pyramid_film_175&p2=sh1_air_screamer_001');await page.click('#launch');await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='fight');
 const matrix=await page.evaluate(async()=>{
  const {STAGES}=await import('/src/data.js'),{spriteFor}=await import('/src/sprite-system.js'),{visibleSpriteBox,toScreen}=await import('/src/sprite-framing.js');
  const e=__HALO_QA__.engine;e.running=false;e.paused=false;e.shake=0;e.texts=[];e.hazards=[];e.particles=[];
  const originalStage=e.stage,originalWorld=structuredClone(e.world);
  const failures=[];let renders=0,zoomed=0;
  for(const stage of STAGES)for(const amount of [0,.5,1])for(const facing of [-1,1]){
   e.stage=stage;e.world.amount=amount;e.actors[0].x=80;e.actors[0].facing=facing;e.actors[1].x=1200;e.actors[1].facing=-facing;
   e.render(0);renders++;const camera=e.presentationCamera;if(camera.scale<1)zoomed++;
   for(const a of e.actors)for(const frame of spriteFor(a.data).frames){const b=toScreen(visibleSpriteBox(a.data,frame,a.x,a.y,a.facing),camera);
    if(b.x<-.001||b.x+b.w>1280.001||b.y<131.999||b.y+b.h>694.001)failures.push(stage.id+':'+a.data.id);}
   if(e.actors[0].x!==80||e.actors[1].x!==1200)failures.push('physical coordinates altered');
  }
  e.stage=originalStage;e.world=originalWorld;e.render(0);return {renders,zoomed,failures};
 });report.stagedCamera=matrix;check('all 123 stages render with full native sprite envelopes at edges',matrix.renders===738&&matrix.failures.length===0&&matrix.zoomed>0);await shot(page,'03-edge-camera');
 // No wall-clock dependency in presentation: pausing cannot consume clip ticks.
 const frozen=await page.evaluate(()=>JSON.stringify(__HALO_QA__.engine.actors.map(a=>a.spriteClock)));await page.waitForTimeout(100);check('stopped simulation does not advance pose clocks through rendering',await page.evaluate(()=>JSON.stringify(__HALO_QA__.engine.actors.map(a=>a.spriteClock)))===frozen);
 await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});await context.setOffline(true);await page.goto(base+'/modules/sprite-workshop.html');await selectSubject(page,STATIC_SUBJECT,'film');check('inspector and supporting modules work offline',await page.locator('.sprite-inspector').count()===1&&await page.locator('[data-inspect=play]').isDisabled());await shot(page,'04-offline-inspector');
 await context.close();check('no unhandled page exception',report.errors.length===0);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
