/** Real HTTP UI, with explicitly injected pad/Storage fixtures, not physical-device certification. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VERSION} from '../src/data.js';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-boundaries-v095');
await mkdir(out,{recursive:true});
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4180';let server,browser;
const report={version:VERSION,checks:[],errors:[],captures:[],fixtures:[
 'Standard gamepad objects replace navigator.getGamepads for simultaneous Start and API-denial cases; no physical controller is claimed.',
 'Storage.prototype.setItem is temporarily made to reject only control writes; this is not a physical storage-quota measurement.',
 'Valid generated route/control backups and deliberately invalid primary JSON isolate recovery/export; the route is not played.',
 'Prepared deciding KOs and prior-round scores advance all eight Rite encounters to check the real launch configuration. Finishers are disabled and real intro/round-result/outro ticks produce each engine result; this is not a played campaign.',
 'Air Screamer performs the prepared decisive aerial finisher against the film candidate. The inverse film grip is incompatible with a flying target and is not substituted.',
 'The two existing candidate profiles and their imported frames are used. The fixtures add no new production image or animation.'
]};
const check=(name,passed)=>{report.checks.push({name,passed:!!passed});if(!passed)throw Error(name);};
const shot=async(page,name)=>{await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});report.captures.push(name+'.png');};
try {
  if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4180','--dist'],{cwd:root,stdio:'ignore'});
  let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
  check('static HTTP server ready',ready);
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>{
    window.padFixtures=[];window.padDenied=false;
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>{
      if(window.padDenied)throw new DOMException('Test policy denial','SecurityError');return window.padFixtures;
    }});
  });
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('dialog',d=>d.accept());
  const versus=base+'/modules/unified-versus.html?qa=1&p1=sh1_air_screamer_001&p2=film_red_pyramid_film_175';
  await page.goto(versus);await page.waitForFunction(()=>!!window.__HALO_QA__);
  await page.locator('body').click({position:{x:5,y:5}});await page.keyboard.press('Alt+Enter');
  check('modified Enter does not launch a combat from selection',await page.evaluate(()=>!__HALO_QA__.engine));
  await page.selectOption('#mode','local');await page.uncheck('#stageHazards');await page.uncheck('#stageDirector');await page.uncheck('#otherworldShift');
  await page.evaluate(()=>{window.padFixtures=[0,1].map(index=>({index,id:'fixture-'+index,mapping:'standard',connected:true,axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false}))}));});
  await page.click('#launch');await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='fight');
  await page.evaluate(()=>{padFixtures.forEach(p=>p.buttons[9].pressed=true);});
  await page.waitForFunction(()=>__HALO_QA__.engine.paused);
  check('two simultaneous Starts pause the real engine and open one native dialog',await page.locator('dialog[open]').count()===1);
  const pausedFrame=await page.evaluate(()=>__HALO_QA__.engine.frame);await page.waitForTimeout(100);
  check('holding both Starts cannot cancel the pause',await page.evaluate(f=>__HALO_QA__.engine.paused&&__HALO_QA__.engine.frame===f,pausedFrame));
  await shot(page,'01-two-controllers-paused');
  await page.evaluate(()=>padFixtures.forEach(p=>p.buttons[9].pressed=false));
  await page.waitForFunction(()=>__HALO_QA__.engine.padSystemPrevious.every(v=>!v));
  await page.click('[data-pause=controls]');await page.evaluate(()=>padFixtures[0].buttons[9].pressed=true);
  await page.waitForFunction(()=>__HALO_QA__.engine.padSystemPrevious[0]);
  check('Start cannot resume behind the open controls dialog',await page.evaluate(()=>__HALO_QA__.engine.paused&&!__HALO_QA__.engine.input.enabled&&document.querySelector('.controls-dialog').open));
  await shot(page,'02-child-dialog-stays-paused');
  await page.evaluate(()=>padFixtures[0].buttons[9].pressed=false);
  await page.waitForFunction(()=>!__HALO_QA__.engine.padSystemPrevious[0]);
  await page.click('#closeBindings');await page.evaluate(()=>padFixtures[0].buttons[9].pressed=true);
  await page.waitForFunction(()=>!__HALO_QA__.engine.paused);
  check('a fresh Start resumes after closing the child dialog',await page.evaluate(()=>!document.querySelector('[aria-labelledby=pauseTitle]').open));
  await page.evaluate(()=>{window.padDenied=true;});await page.waitForFunction(()=>__HALO_QA__.engine.paused);
  check('Gamepad API denial pauses attached devices without a page exception',report.errors.length===0);
  await page.click('[data-pause=resume]');await page.keyboard.press('j');
  await page.waitForFunction(()=>__HALO_QA__.engine.actors[0].lastMoveKey==='neutralLight');
  check('keyboard combat remains usable when the Gamepad API is denied',await page.evaluate(()=>!__HALO_QA__.engine.paused));
  await shot(page,'03-keyboard-after-pad-denial');
  await page.click('#pauseBtn');await page.click('[data-pause=controls]');
  await page.evaluate(()=>{window.nativeSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('sh-halo-of-flesh-controls-v1'))throw new DOMException('Fixture quota','QuotaExceededError');return nativeSetItem.call(this,k,v);};});
  await page.click('[data-binding=light]');await page.keyboard.press('b');
  check('failed control persistence is visible',/non sauvegardées/.test(await page.locator('#bindingMessage').textContent()));
  check('unsaved bindings still apply to the active engine and help text',await page.evaluate(()=>__HALO_QA__.engine.bindings.players[0].light==='KeyB'&&document.querySelector('#gameHelp').textContent.includes('B Attaque légère')));
  await page.click('#closeBindings');await page.click('[data-pause=controls]');
  check('reopening controls preserves the active session binding after storage failure',/B$/.test(await page.locator('[data-binding=light]').textContent()));
  await page.click('#closeBindings');await page.evaluate(()=>window.bindingEngine=__HALO_QA__.engine);
  await page.click('[data-pause=retry]');await page.waitForFunction(()=>__HALO_QA__.engine!==window.bindingEngine);
  check('retry keeps unsaved bindings on the replacement engine and in its help',await page.evaluate(()=>__HALO_QA__.engine.bindings.players[0].light==='KeyB'&&document.querySelector('#gameHelp').textContent.includes('B Attaque légère')));
  await page.click('#pauseBtn');await page.click('[data-pause=select]');await page.click('#openControls');
  check('selection controls keep the unsaved session binding after retiring the engine',/B$/.test(await page.locator('[data-binding=light]').textContent()));
  await page.click('#closeBindings');await page.click('#launch');await page.waitForFunction(()=>!!__HALO_QA__.engine);
  check('relaunch from selection applies the session binding before the engine starts',await page.evaluate(()=>__HALO_QA__.engine.bindings.players[0].light==='KeyB'));
  await page.click('#pauseBtn');await page.click('[data-pause=controls]');
  await page.evaluate(()=>Storage.prototype.setItem=window.nativeSetItem);await page.click('#resetBindings');await page.click('#closeBindings');await page.click('[data-pause=resume]');
  await page.evaluate(()=>{window.retiredEngine=__HALO_QA__.engine;});await page.click('#leaveFight');
  await page.evaluate(()=>{window.retiredFrame=retiredEngine.frame;retiredEngine.start();});await page.waitForTimeout(80);
  check('returning to selection retires the engine and cannot restart its old loop',await page.evaluate(()=>retiredEngine.destroyed&&!retiredEngine.running&&!retiredEngine.input.enabled&&retiredEngine.frame===retiredFrame));
  await page.evaluate(()=>{window.padDenied=false;window.padFixtures=[];});
  await page.click('#mobileP1');await page.click('#launch');await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='intro');
  const light=page.locator('.touch-button[data-action=light][data-player=p1]');
  await light.hover();await page.mouse.down();await page.mouse.up();await page.waitForFunction(()=>__HALO_QA__.engine.phase==='fight');
  await page.waitForTimeout(80);
  check('a touch attack pressed during intro does not leak into the fight',await page.evaluate(()=>__HALO_QA__.engine.actors[0].lastMoveKey===null));
  await light.click();await page.waitForFunction(()=>__HALO_QA__.engine.actors[0].lastMoveKey==='neutralLight');
  check('a fresh touch press after FIGHT still attacks',true);
  const firstRound=await page.evaluate(()=>{
    const e=__HALO_QA__.engine;e.togglePause(true);
    e.actors[1].health=0;e.actors[1].lastHit={attackerIndex:0,isSuper:true,environmental:false};
    e.resolveKnockouts();return {roundsToWin:e.config.roundsToWin,phase:e.phase,finisher:!!e.fatality,wins:e.actors[0].roundWins};
  });
  check('first-round knockout keeps the match open without a finisher',firstRound.roundsToWin===2&&firstRound.phase==='roundEnd'&&!firstRound.finisher&&firstRound.wins===1);
  const finalRound=await page.evaluate(()=>{
    const e=__HALO_QA__.engine;e.running=false;e.togglePause(false);
    const resultTicks=e.phaseTimer;for(let tick=0;tick<resultTicks;tick++)e.update();
    const introTicks=e.phaseTimer;for(let tick=0;tick<introTicks;tick++)e.update();e.togglePause(true);
    e.actors[1].health=0;e.actors[1].lastHit={attackerIndex:0,isSuper:true,environmental:false};
    e.resolveKnockouts();return {phase:e.phase,finisher:!!e.fatality,wins:e.actors[0].roundWins};
  });
  check('deciding knockout retains the existing finisher before the final score settles',finalRound.phase==='fatality'&&finalRound.finisher&&finalRound.wins===1);
  await page.goto(base);await page.waitForSelector('.command-item');
  const fixture=await page.evaluate(async()=>{
    const {createRun}=await import('/src/run-progress.js');const {defaultControls}=await import('/src/player-input.js');
    const run=createRun({mode:'arcade',playerId:'sh1_air_screamer_001',seed:95}),controls=defaultControls();controls.players[0].light='KeyB';
    const badControls=structuredClone(controls);badControls.players[1].light='KeyB';
    localStorage.setItem('sh-halo-of-flesh-run-v1:backup',JSON.stringify(run));
    localStorage.setItem('sh-halo-of-flesh-run-v1',JSON.stringify({...run,playerId:'not-a-fighter'}));
    localStorage.setItem('sh-halo-of-flesh-controls-v1:backup',JSON.stringify(controls));
    localStorage.setItem('sh-halo-of-flesh-controls-v1',JSON.stringify(badControls));
    return {run,raw:localStorage.getItem('sh-halo-of-flesh-run-v1')};
  });
  await page.locator('[data-mode=options]').click();const pending=page.waitForEvent('download');await page.click('#exportMemory');
  const download=await pending;await download.saveAs(resolve(out,'recovered-memory.json'));
  const exported=JSON.parse(await readFile(resolve(out,'recovered-memory.json'),'utf8'));
  check('actual memory export contains the valid backup route',exported.entries['sh-halo-of-flesh-run-v1'].id===fixture.run.id&&exported.entries['sh-halo-of-flesh-run-v1'].playerId===fixture.run.playerId);
  check('actual memory export contains recovered custom controls',exported.entries['sh-halo-of-flesh-controls-v1'].players[0].light==='KeyB');
  check('export does not rewrite the damaged source',await page.evaluate(raw=>localStorage.getItem('sh-halo-of-flesh-run-v1')===raw,fixture.raw));
  await shot(page,'04-recovered-export');
  const imported=structuredClone(exported);
  imported.entries['sh-halo-of-flesh-run-v1'].id+='-import';
  imported.entries['sh-halo-of-flesh-controls-v1'].players[0].light='KeyC';
  await page.setInputFiles('#importMemoryFile',{name:'continuation-memory.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sh-halo-of-flesh-controls-v1')).players[0].light==='KeyC');
  check('actual import preserves usable route and control backups beneath invalid primary data',await page.evaluate(id=>JSON.parse(localStorage.getItem('sh-halo-of-flesh-run-v1:backup')).id===id&&JSON.parse(localStorage.getItem('sh-halo-of-flesh-controls-v1:backup')).players[0].light==='KeyB',fixture.run.id));
  await page.evaluate(()=>{
    localStorage.setItem('sh-halo-of-flesh-run-v1','{broken');
    localStorage.setItem('sh-halo-of-flesh-controls-v1','{broken');
  });
  await page.goto(versus);await page.waitForFunction(()=>!!window.__HALO_QA__);
  check('recovered route remains offered by the checkpoint banner',await page.locator('#runCheckpoint').isVisible());
  await page.click('#openControls');check('controls UI shows recovered custom binding',/B$/.test(await page.locator('[data-binding=light]').textContent()));
  await page.setViewportSize({width:430,height:932});check('controls recovery dialog fits mobile width',await page.locator('.controls-dialog').evaluate(e=>e.getBoundingClientRect().right<=innerWidth+1));await shot(page,'05-mobile-recovered-controls');
  await page.setViewportSize({width:1440,height:1000});await page.goto(versus+'&preset=ritual&debugArt=1');
  await page.waitForFunction(()=>!!window.__HALO_QA__);await page.click('#launch');await page.waitForFunction(()=>!!__HALO_QA__.engine);
  for(let index=0;index<8;index++){
    const entry=await page.evaluate(async()=>{
      const {RITUAL_MODIFIERS}=await import('/src/data.js');
      const {engine,run}=__HALO_QA__;engine.togglePause(true);
      const expected=run.rituals[run.index];
      return {index:run.index,expected,actual:engine.config.ritualId,active:engine.ritual.id,
        label:document.querySelector('#matchLabel').textContent,short:RITUAL_MODIFIERS[expected].short};
    });
    check(`Rite ${index+1} launches the advertised modifier (${entry.expected})`,entry.index===index&&entry.actual===entry.expected&&entry.active===entry.expected&&entry.label.includes(entry.short));
    if(index===2)await shot(page,'07-actual-rite-config');
    if(index<7){
      const completed=await page.evaluate(()=>{
        const q=__HALO_QA__,e=q.engine,[winner,loser]=e.actors;e.running=false;e.togglePause(false);
        const introTicks=e.phase==='intro'?e.phaseTimer:0;for(let tick=0;tick<introTicks;tick++)e.update();
        e.config.fatalities=false;e.round=e.config.roundsToWin;winner.roundWins=e.config.roundsToWin-1;loser.roundWins=0;
        loser.health=0;loser.ko=false;loser.lastHit={attackerIndex:0,moveKey:'neutralLight',isSuper:false,environmental:false};
        e.resolveKnockouts();const resultTicks=e.phaseTimer;for(let tick=0;tick<resultTicks;tick++)e.update();
        const outroTicks=e.winner?.presentation?.duration||0;for(let tick=0;tick<outroTicks&&e.isPresentingOutro();tick++)e.update();
        return e.phase==='matchEnd'&&e.winner===winner&&winner.roundWins===e.config.roundsToWin&&loser.ko&&loser.presentation?.key==='loseMatch'&&q.run.status==='won';
      });
      check(`Rite ${index+1} advances from a coherent match end to its next prepared encounter`,completed&&await page.evaluate(()=>__HALO_QA__.continueRun()));
    }
  }
  await context.close();
  const offline=await browser.newContext(),off=await offline.newPage();off.on('pageerror',e=>report.errors.push(e.message));
  await off.goto(base);await off.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});
  await offline.setOffline(true);await off.goto(versus);await off.waitForFunction(()=>!!window.__HALO_QA__);
  await off.selectOption('#mode','local');await off.click('#launch');await off.waitForFunction(()=>__HALO_QA__.engine?.phase==='fight');
  await off.click('#pauseBtn');await off.click('[data-pause=controls]');
  const accepted=await off.evaluate(()=>__HALO_QA__.engine.togglePause(false));
  check('resume guard is also active with offline modules',accepted===false&&await off.evaluate(()=>__HALO_QA__.engine.paused));await shot(off,'06-offline-modal-guard');
  await offline.close();check('no unhandled browser exceptions',report.errors.length===0);
} catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
