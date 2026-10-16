/** Actual HTTP UI regression tests. Failure injection/checkpoint fixtures are not played campaigns. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VERSION} from '../src/data.js';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-recovery-v094');await mkdir(out,{recursive:true});
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4179';let server,browser;
const report={version:VERSION,checks:[],errors:[],captures:[],fixtures:[
 'A prepared won checkpoint and an injected match-result callback isolate retry/continuation transactions; no campaign victory is claimed.',
 'SpriteCache.prepare is temporarily made to fail for the pause retry test. No production file is changed.',
 'Timeline steps reference the same existing PNG; no new art or animation is produced.',
 'CacheStorage is deliberately emptied before the final offline fallback test.'
]};
const check=(name,passed)=>{report.checks.push({name,passed:!!passed});if(!passed)throw Error(name);};
const shot=async(page,name)=>{await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});report.captures.push(name+'.png');};
try{
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4179','--dist'],{cwd:root,stdio:'ignore'});
 let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}check('static HTTP server ready',ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1040}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('dialog',d=>d.accept());
 const versus=base+'/modules/unified-versus.html?qa=1';
 await page.goto(versus);await page.waitForFunction(()=>!!window.__HALO_QA__);
 const selected=await page.evaluate(()=>JSON.stringify(__HALO_QA__.selection));await page.fill('#search','no-such-monster-094');await page.click('#randomAll');
 check('random selection respects an empty filter without escaping to the whole roster',selected===await page.evaluate(()=>JSON.stringify(__HALO_QA__.selection)));
 await page.fill('#search','');await page.check('#artReadyOnly');
 await page.evaluate(()=>{window.savedRandom=Math.random;Math.random=()=>0;});await page.click('#randomAll');await page.evaluate(()=>{Math.random=window.savedRandom;});
 check('constant random source still picks two distinct candidates without an unbounded loop',await page.evaluate(()=>__HALO_QA__.selection.p1.id!==__HALO_QA__.selection.p2.id));
 await page.locator('.fighter-card').first().click({button:'right'});await page.selectOption('#typeFilter','favorites');check('favorite filter shows the bookmarked candidate',await page.locator('.fighter-card').count()===1);
 await page.locator('.fighter-card').first().click({button:'right'});check('removing the last favorite immediately updates the filtered list',await page.locator('.fighter-card').count()===0);
 await shot(page,'01-filter-empty');
 await page.goto(versus);await page.waitForFunction(()=>!!window.__HALO_QA__);
 const resumeBefore=await page.evaluate(async()=>{
  const {createRun,settleRun,saveRun}=await import('/src/run-progress.js');
  const run=createRun({mode:'arcade',playerId:'sh1_air_screamer_001',seed:94});
  saveRun(settleRun(run,{winnerIndex:0,stats:{winner:{healthRatio:.6},loser:{}}}));
  return {selection:JSON.stringify(__HALO_QA__.selection),saved:localStorage.getItem('sh-halo-of-flesh-run-v1')};
 });
 await page.evaluate(()=>__HALO_QA__.restoreCheckpoint());
 check('blocked checkpoint resume preserves the complete prior selection',resumeBefore.selection===await page.evaluate(()=>JSON.stringify(__HALO_QA__.selection)));
 check('blocked checkpoint resume does not commit a pending run or replace the saved won checkpoint',await page.evaluate(saved=>__HALO_QA__.run===null&&localStorage.getItem('sh-halo-of-flesh-run-v1')===saved,resumeBefore.saved));
 await page.check('#artDiagnostic');await page.evaluate(()=>__HALO_QA__.restoreCheckpoint());await page.waitForFunction(()=>!!__HALO_QA__.engine);
 check('retrying resume after an explicit diagnostic opt-in restores the right player and encounter',await page.evaluate(()=>__HALO_QA__.run.index===1&&__HALO_QA__.selection.p1.id==='sh1_air_screamer_001'));
 await page.evaluate(()=>{const q=__HALO_QA__;q.engine.running=false;q.engine.phase='matchEnd';q.handleMatchEnd({winnerIndex:0,winner:q.selection.p1,loser:q.selection.p2,stats:{winner:{healthRatio:.6},loser:{}},snapshot:{p1:{meter:35}}});window.beforeContinue={run:JSON.stringify(q.run),saved:localStorage.getItem('sh-halo-of-flesh-run-v1'),engine:q.engine};document.querySelector('#artDiagnostic').checked=false;document.querySelector('#playStatus').textContent='';});
 await page.locator('#continueRun').waitFor({state:'visible'});await page.click('#continueRun');await page.waitForFunction(()=>document.querySelector('#playStatus').textContent.includes('Sprites à produire'));
 check('failed Continue leaves in-memory win and current engine intact',await page.evaluate(()=>JSON.stringify(__HALO_QA__.run)===beforeContinue.run&&__HALO_QA__.engine===beforeContinue.engine));
 check('failed Continue leaves persistent checkpoint intact and the action remains available',await page.evaluate(()=>localStorage.getItem('sh-halo-of-flesh-run-v1')===beforeContinue.saved)&&await page.locator('#continueRun').isVisible());await shot(page,'02-retryable-continuation');
 await page.evaluate(()=>{document.querySelector('#artDiagnostic').checked=true;});await page.click('#continueRun');await page.waitForFunction(()=>__HALO_QA__.engine!==beforeContinue.engine);
 check('a second Continue retries the same next encounter exactly once',await page.evaluate(()=>__HALO_QA__.run.index===2&&__HALO_QA__.run.wins===2&&__HALO_QA__.run.status==='ready'));
 await page.goto(versus);await page.waitForFunction(()=>!!window.__HALO_QA__);await page.selectOption('#mode','local');await page.click('#mobileP1');await page.click('#launch');await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='fight');
 const guard=page.locator('.touch-button[data-action=guard]');await guard.hover();await page.mouse.down();await page.waitForTimeout(550);
 check('real held pointer guard keeps blocking but no longer refreshes perfect parry',await page.evaluate(()=>__HALO_QA__.engine.actors[0].blocking&&__HALO_QA__.engine.actors[0].parryWindow===0));await page.mouse.up();await page.waitForTimeout(80);
 check('real pointer release removes blocking',await page.evaluate(()=>!__HALO_QA__.engine.actors[0].blocking));
 await page.click('#pauseBtn');await page.evaluate(()=>{window.beforeRetry=__HALO_QA__.engine;window.savedPrepare=__HALO_QA__.assetCache.prepare;__HALO_QA__.assetCache.prepare=async()=>({ok:false,missing:[],failed:['injected']});});
 await page.click('[data-pause=retry]');await page.waitForFunction(()=>document.querySelector('#pauseFeedback').textContent.includes('chargée'));
 check('failed pause retry keeps the pause dialog and old engine usable',await page.evaluate(()=>document.querySelector('[aria-labelledby=pauseTitle]').open&&__HALO_QA__.engine===beforeRetry&&beforeRetry.paused));
 check('pause retry error is announced inside the modal',await page.locator('#pauseFeedback').isVisible());await shot(page,'03-pause-retry-failure');
 await page.evaluate(()=>{__HALO_QA__.assetCache.prepare=window.savedPrepare;});await page.click('[data-pause=retry]');await page.waitForFunction(()=>__HALO_QA__.engine!==beforeRetry);
 check('successful pause retry closes the dialog only after loading',await page.evaluate(()=>!document.querySelector('[aria-labelledby=pauseTitle]').open&&!__HALO_QA__.engine.paused));
 await page.goto(base+'/modules/sprite-workshop.html');await page.waitForFunction(()=>document.querySelector('#spriteDetail canvas')?.dataset.artStatus==='raster');await page.locator('.clip-editor summary').click();
 await page.click('[data-clip=add]');await page.fill('[data-clip-ticks="0"]','4');await page.fill('[data-clip-ticks="1"]','7');await page.selectOption('[data-inspect=pose]','neutralHeavy');await page.selectOption('[data-inspect=pose]','idle');
 check('switching poses retains working edits even before Preview',await page.locator('[data-clip-frame]').count()===2&&await page.locator('[data-clip-ticks="0"]').inputValue()==='4'&&await page.locator('[data-clip-ticks="1"]').inputValue()==='7');
 await page.getByText('CALIBRER CETTE IMAGE',{exact:true}).click();await page.fill('[data-inspect=bodyHeight]','0');await page.locator('[data-inspect=bodyHeight]').dispatchEvent('change');
 let downloads=0;page.on('download',()=>downloads++);await page.click('[data-inspect=export]');await page.waitForTimeout(150);
 check('invalid visible calibration cannot silently export the previous valid values',downloads===0&&/invalides/.test(await page.locator('[data-inspect=error]').textContent()));
 await page.click('[data-inspect=reset]');await page.fill('[data-inspect=anchorX]','0.61');await page.locator('[data-inspect=anchorX]').dispatchEvent('change');const pending=page.waitForEvent('download');await page.click('[data-inspect=export]');const download=await pending;await download.saveAs(resolve(out,'calibration-v2.json'));const packet=JSON.parse(await readFile(resolve(out,'calibration-v2.json'),'utf8'));
 check('calibration export includes the previous exact anchors as a concurrency guard',packet.schema===2&&packet.previousFrames[0].anchor[0]!==.61&&packet.frames[0].anchor[0]===.61&&packet.previousFrames[0].sha256===packet.frames[0].sha256);await shot(page,'04-preserved-drafts');
 await page.setViewportSize({width:430,height:932});check('updated editor controls stay within mobile viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(page,'05-mobile-recovery');await context.close();
 const offlineContext=await browser.newContext(),off=await offlineContext.newPage();off.on('pageerror',e=>report.errors.push(e.message));await off.goto(base);await off.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});
 await off.evaluate(async()=>{await Promise.all((await caches.keys()).map(k=>caches.delete(k)));});await offlineContext.setOffline(true);const response=await off.goto(base+'/definitely-uncached-v094');
 check('empty offline cache returns a real 503 instead of a rejected navigation',response.status()===503&&/Archive hors ligne indisponible/.test(await off.textContent('body')));await shot(off,'06-empty-offline-fallback');await offlineContext.close();
 check('no unhandled browser exceptions in recovery scenarios',report.errors.length===0);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
