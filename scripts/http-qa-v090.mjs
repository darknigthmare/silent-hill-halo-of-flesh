/** Real HTTP browser smoke, for an authorized CI/local runner. No proxy or policy changes. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {VERSION} from '../src/data.js';
const root=resolve(new URL('../',import.meta.url).pathname),out=resolve(root,'tests/http-v090');
await mkdir(out,{recursive:true});
const report={version:VERSION,kind:'http-browser-smoke',assertions:[],errors:[],fixtures:['completed-match state for checkpoint test only','explicit art diagnostic for legacy chronicle/checkpoint regressions; not a completed-art campaign'],captures:[]};
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
let server,browser;
const assert=(name,ok)=>{report.assertions.push({name,passed:!!ok});if(!ok)throw Error(name);};
const capture=async(page,name)=>{await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});report.captures.push(name+'.png');};
try{
  if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4173'],{cwd:root,stdio:'ignore'});
  let available=false;for(let i=0;i<80;i++){try{if((await fetch(base)).ok){available=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  assert('HTTP server starts',available);
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});
  report.browser=await browser.version();
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
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
  await page.waitForSelector('#artDiagnostic');await page.waitForTimeout(250);await page.check('#artDiagnostic');await page.click('#launch');await page.waitForSelector('#fightScreen:not(.hidden)');
  assert('chronicle launched from its real menu',await page.evaluate(()=>JSON.parse(localStorage.getItem('sh-halo-of-flesh-run-v1')).mode==='chronicle'));
  const checkpoint=await page.evaluate(()=>JSON.parse(localStorage.getItem('sh-halo-of-flesh-run-v1')));
  // An explicit terminal-state fixture tests persistence, not combat balance or a played victory.
  await page.goto(base+'/modules/unified-versus.html?qa=1&debugArt=1&preset=chronicle&resume=1');await page.waitForFunction(()=>!!window.__HALO_QA__?.engine);
  await page.evaluate(()=>{const q=__HALO_QA__;q.handleMatchEnd({winnerIndex:0,winner:q.selection.p1,loser:q.selection.p2,stats:{winner:{healthRatio:.6,perfectGuards:2},loser:{}},snapshot:{p1:{meter:50}}});});
  await page.waitForTimeout(700);await page.click('#continueRun');
  await page.goto(base);await page.locator('[data-mode="continue"]').first().click();
  await frame.locator('#artDiagnostic').waitFor();await page.waitForTimeout(250);await frame.locator('#artDiagnostic').check();await frame.locator('#resumeCheckpoint').click();await frame.locator('#fightScreen:not(.hidden)').waitFor();
  const resumed=await page.evaluate(()=>JSON.parse(localStorage.getItem('sh-halo-of-flesh-run-v1')));
  assert('shell Continue resumes exact checkpoint at encounter two',resumed.id===checkpoint.id&&resumed.index===1&&resumed.wins===1);
  await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});
  assert('service worker controls real HTTP page',await page.evaluate(()=>!!navigator.serviceWorker.controller));
  await context.setOffline(true);await page.reload();await page.waitForSelector('.command-item');
  assert('cached shell reloads offline',await page.locator('.command-item').count()>=7);
  await capture(page,'02-offline-shell');await context.setOffline(false);
  await page.setViewportSize({width:430,height:932});await page.goto(base+'/modules/unified-versus.html?qa=1');
  await page.click('#openControls');
  assert('mobile-size controls dialog fits screen',await page.locator('.controls-dialog').evaluate(d=>d.getBoundingClientRect().right<=innerWidth+1));
  await capture(page,'03-http-mobile-controls');
  assert('no JavaScript page exceptions',report.errors.length===0);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{
  report.passed=!report.failure&&report.errors.length===0;
  await writeFile(resolve(out,'http-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
  await browser?.close();server?.kill('SIGTERM');
}
