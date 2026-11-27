/** Real HTTP browser smoke, for an authorized CI/local runner. No proxy or policy changes. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,rename,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {checkWave14} from './qa-wave14-browser.mjs';
import {launchOfflineQaProfile} from './qa-offline-profile.mjs';
import {VERSION} from '../src/data.js';
const root=resolve(new URL('../',import.meta.url).pathname),out=resolve(root,process.env.QA_OUTPUT_DIR||'tests/http-v090');
await mkdir(out,{recursive:true});
const report={version:VERSION,kind:'http-browser-smoke',assertions:[],errors:[],fixtures:['Prepared deciding KO, prior-round score and actor stats, with finishers disabled, advance through real intro/round-result/outro ticks and the engine match callback for checkpoint QA only; no played victory is claimed.','explicit art diagnostic for legacy chronicle/checkpoint regressions; not a completed-art campaign'],captures:[]};
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
let server,browser,offlineProfile,page,workerSession;
// The real offline catalogue exceeds an incognito context's memory-backed quota.
// Use a disposable normal profile; this still caches and serves every real asset.
report.serviceWorker={profile:'temporary-persistent',errors:[],versions:[]};
const assert=(name,ok)=>{report.assertions.push({name,passed:!!ok});if(!ok)throw Error(name);};
const capture=async(page,name)=>{await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});report.captures.push(name+'.png');};
try{
  if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4173','--dist'],{cwd:root,stdio:'ignore'});
  let available=false;for(let i=0;i<80;i++){try{if((await fetch(base)).ok){available=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  assert('HTTP server starts',available);
  offlineProfile=await launchOfflineQaProfile(chromium,{headless:true,viewport:{width:1440,height:1000},executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});
  const {context}=offlineProfile;browser=offlineProfile.browser;report.browser=browser.version();
  await checkWave14(browser,base,out,report,assert);
  page=context.pages()[0]||await context.newPage();
  workerSession=await context.newCDPSession(page);
  workerSession.on('ServiceWorker.workerErrorReported',event=>report.serviceWorker.errors.push(event.errorMessage));
  workerSession.on('ServiceWorker.workerVersionUpdated',event=>report.serviceWorker.versions.push(...event.versions.map(({versionId,status,runningStatus,scriptURL})=>({versionId,status,runningStatus,scriptURL}))));
  await workerSession.send('ServiceWorker.enable');
  report.serviceWorker.quotaAtStart=await workerSession.send('Storage.getUsageAndQuota',{origin:new URL(base).origin});
  page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
  await page.goto(base);await page.waitForSelector('.command-item');
  assert('shell menu renders',await page.locator('.command-item').count()>=7);
  await page.locator('[data-mode="versus"]').first().click();
  const frame=page.frameLocator('#moduleFrame');await frame.locator('#launch').waitFor();
  await frame.locator('#roster > button').nth(29).waitFor();
  assert('real same-origin iframe loads the selection',await frame.locator('#roster > *').count()===30);
  await page.goto(base+'/modules/unified-versus.html?qa=1');await page.waitForFunction(()=>!!window.__HALO_QA__);
  await page.click('#openControls');await page.click('[data-binding="light"]');await page.keyboard.press('b');await page.click('#closeBindings');
  await page.reload();await page.waitForFunction(()=>!!window.__HALO_QA__);
  assert('binding persists through HTTP reload',await page.evaluate(()=>JSON.parse(localStorage.getItem('sh-halo-of-flesh-controls-v1')).players[0].light==='KeyB'));
  await page.selectOption('#mode','local');await page.click('#launch');
  await page.waitForFunction(()=>window.__HALO_QA__?.engine?.phase==='fight');
  await page.keyboard.press('ArrowUp');await page.waitForTimeout(100);
  assert('real keyboard input jumps after normal intro',await page.evaluate(()=>__HALO_QA__.engine.actors[0].y<580));
  await page.click('#pauseBtn');
  assert('native pause dialog stops the fight',await page.evaluate(()=>__HALO_QA__.engine.paused&&document.querySelector('[aria-labelledby="pauseTitle"]').open));
  const frameNumber=await page.evaluate(()=>__HALO_QA__.engine.frame);await page.waitForTimeout(100);
  assert('paused clock remains stopped',await page.evaluate(n=>__HALO_QA__.engine.frame===n,frameNumber));
  await capture(page,'01-http-pause');await page.keyboard.press('Escape');
  assert('Escape restores canvas focus',await page.evaluate(()=>!__HALO_QA__.engine.paused&&document.activeElement.id==='game'));
  await page.goto(base+'/modules/chronicles.html');await page.click('#launchRoute');
  // The input exists before module initialization, which resets its checked state.
  // Wait for the roster built by init before selecting the explicit diagnostic.
  await page.waitForSelector('#artDiagnostic');await page.locator('#roster > button').first().waitFor();await page.waitForTimeout(250);await page.check('#artDiagnostic');await page.click('#launch');await page.waitForSelector('#fightScreen:not(.hidden)');
  assert('chronicle launched from its real menu',await page.evaluate(()=>JSON.parse(localStorage.getItem('sh-halo-of-flesh-run-v1')).mode==='chronicle'));
  const checkpoint=await page.evaluate(()=>JSON.parse(localStorage.getItem('sh-halo-of-flesh-run-v1')));
  // Prepare a deciding KO; the engine creates its terminal state and result together.
  await page.goto(base+'/modules/unified-versus.html?qa=1&debugArt=1&preset=chronicle&resume=1');await page.waitForFunction(()=>!!window.__HALO_QA__?.engine);
  const completed=await page.evaluate(()=>{
    const q=__HALO_QA__,e=q.engine,[winner,loser]=e.actors;e.running=false;
    const introTicks=e.phase==='intro'?e.phaseTimer:0;for(let tick=0;tick<introTicks;tick++)e.update();
    e.config.fatalities=false;e.round=e.config.roundsToWin;winner.roundWins=e.config.roundsToWin-1;loser.roundWins=0;
    winner.health=winner.maxHealth*.6;winner.meter=50;winner.stats.perfectGuards=2;winner.stats.damageTaken=winner.maxHealth-winner.health;
    loser.health=0;loser.ko=false;loser.lastHit={attackerIndex:0,moveKey:'neutralLight',isSuper:false,environmental:false};
    e.resolveKnockouts();const resultTicks=e.phaseTimer;for(let tick=0;tick<resultTicks;tick++)e.update();
    const outroTicks=e.winner?.presentation?.duration||0;for(let tick=0;tick<outroTicks&&e.isPresentingOutro();tick++)e.update();
    return e.phase==='matchEnd'&&e.winner===winner&&winner.roundWins===e.config.roundsToWin&&loser.ko&&loser.presentation?.key==='loseMatch'&&q.run.status==='won';
  });
  assert('prepared checkpoint victory reaches a coherent engine match end',completed);
  await page.locator('#continueRun').waitFor({state:'visible'});await page.click('#continueRun');
  await page.goto(base);await page.locator('[data-mode="continue"]').first().click();
  await frame.locator('#artDiagnostic').waitFor();await frame.locator('#roster > button').first().waitFor();await page.waitForTimeout(250);await frame.locator('#artDiagnostic').check();await frame.locator('#resumeCheckpoint').click();await frame.locator('#fightScreen:not(.hidden)').waitFor();
  const resumed=await page.evaluate(()=>JSON.parse(localStorage.getItem('sh-halo-of-flesh-run-v1')));
  assert('shell Continue resumes exact checkpoint at encounter two',resumed.id===checkpoint.id&&resumed.index===1&&resumed.wins===1);
  await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});
  assert('service worker controls real HTTP page',await page.evaluate(()=>!!navigator.serviceWorker.controller));
  report.serviceWorker.quotaAfterInstall=await workerSession.send('Storage.getUsageAndQuota',{origin:new URL(base).origin});
  await context.setOffline(true);await page.reload();await page.waitForSelector('.command-item');
  assert('cached shell reloads offline',await page.locator('.command-item').count()>=7);
  await capture(page,'02-offline-shell');await context.setOffline(false);
  await page.setViewportSize({width:430,height:932});await page.goto(base+'/modules/unified-versus.html?qa=1');
  await page.click('#openControls');
  assert('mobile-size controls dialog fits screen',await page.locator('.controls-dialog').evaluate(d=>d.getBoundingClientRect().right<=innerWidth+1));
  await capture(page,'03-http-mobile-controls');
  assert('no JavaScript page exceptions',report.errors.length===0);
  assert('no service worker installation errors',report.serviceWorker.errors.length===0);
}catch(error){
  report.failure=String(error);process.exitCode=1;
  if(page&&!page.isClosed()){
    report.failureState=await Promise.all(page.frames().map(frame=>frame.evaluate(()=>({url:location.href,roster:document.querySelectorAll('#roster > button').length,artDiagnostic:document.querySelector('#artDiagnostic')?.checked,launchDisabled:document.querySelector('#launch')?.disabled,spriteStatus:document.querySelector('#spriteLaunchStatus')?.textContent,announcements:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(element=>element.textContent),fightVisible:!!document.querySelector('#fightScreen:not(.hidden)')})).catch(diagnosticError=>({diagnosticFailure:String(diagnosticError)}))));
    await capture(page,'99-http-failure').catch(captureError=>{report.failureCaptureError=String(captureError);});
  }
}
finally{
  if(page&&!page.isClosed())report.serviceWorker.finalState=await page.evaluate(async()=>({controlled:!!navigator.serviceWorker.controller,registrations:(await navigator.serviceWorker.getRegistrations()).map(registration=>({scope:registration.scope,installing:registration.installing?.state||null,waiting:registration.waiting?.state||null,active:registration.active?.state||null}))})).catch(error=>({diagnosticFailure:String(error)}));
  await browser?.close();server?.kill('SIGTERM');
  report.passed=!report.failure&&report.errors.length===0&&report.serviceWorker.errors.length===0;
  const destination=resolve(out,'http-report.json'),temporary=destination+'.tmp';
  await writeFile(temporary,JSON.stringify(report,null,2)+'\n');await rename(temporary,destination);
  // Retain the isolated profile if saving the evidence failed; otherwise remove it.
  await offlineProfile?.close();
  console.log(JSON.stringify(report,null,2));
}
