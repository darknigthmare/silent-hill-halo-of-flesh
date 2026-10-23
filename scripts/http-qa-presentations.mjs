/** Real HTTP integration of prepared presentation scenes; this is not a played campaign or an art review. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VERSION} from '../src/data.js';

const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-presentations');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4181';
const keys=['intro','winRound','loseRound','winMatch','loseMatch','outro','finisher','finished','taunt'];
const versus=base+'/modules/unified-versus.html?qa=1&p1=sh1_air_screamer_001&p2=film_red_pyramid_film_175';
await mkdir(out,{recursive:true});
let server,browser;
const pages=[];
const report={version:VERSION,base,checks:[],errors:[],captures:[],scenes:{},fixtures:[
 'Local round knockouts, decisive score states and simulation advancement are prepared through the explicit ?qa=1 bridge. No fight or campaign is claimed as played.',
 'The first intro is sought to tick 80 while paused solely to make the real retry/reset comparison deterministic.',
 'A timing-only outro clip holds the existing candidate PNG for 540 simulated ticks in memory. It bypasses the dedicated-image import gate only as a test fixture; it is not new art, a produced animation, or a fidelity review.',
 'Original SPRITES entries are retained and restored before navigation and again on failure when that page is still available. No registry, PNG, gameplay file or save outside the isolated browser context is edited.',
 'The dojo uses its real RESET button, real control rebinding and prepared match results. These are lifecycle tests, not a played training session.',
 'The prepared finisher uses Air Screamer against the film candidate, a compatible body pairing. The authored aerial outro is also exercised with no imported outro clip; its staging is not new animation artwork.',
 'Keyboard, viewport and offline browser checks do not certify a physical controller or mobile device.'
]};
function check(name,passed,detail){
 const entry={name,passed:!!passed};if(detail!==undefined&&!passed)entry.detail=detail;report.checks.push(entry);
 if(!passed)throw Error(name);
}
async function shot(page,name){await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});report.captures.push(name+'.png');}
async function selectStaticWorkshopSubject(page){
 const id='film_red_pyramid_film_175';
 await page.selectOption('#spriteSource','film');await page.fill('#spriteSearch',id);
 await page.locator(`.sprite-card[data-id="${id}"]`).click();
 await page.waitForFunction(id=>{const c=document.querySelector('#spriteDetail canvas');return c?.dataset.spriteId===id&&c.dataset.artStatus==='raster';},id);
}
async function newPage(context){const page=await context.newPage();pages.push(page);page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());return page;}
async function quietRules(page){for(const id of ['stageHazards','stageDirector','otherworldShift','stageFatalities'])await page.uncheck('#'+id);}
async function installFixtures(page){
 await page.evaluate(async()=>{
  const {SPRITES}=await import('/src/sprite-manifest.js');
  const q=window.__PRESENTATION_QA__={backups:new Map(),originalArt:JSON.stringify(SPRITES),roundEvents:0,matchEvents:0,renderSamples:0,resultOverlays:0,lastResult:null,watched:new WeakSet()};
  q.records=()=>JSON.parse(localStorage.getItem('sh-halo-of-flesh-records-v1')||'{}');
  q.snapshot=()=>{
   const e=__HALO_QA__.engine;
   return {phase:e?.phase,frame:e?.frame,paused:e?.paused,round:e?.round,phaseTimer:e?.phaseTimer,matchTime:e?.matchTime,
    tracks:e?.actors.map(a=>a.presentation?{...a.presentation}:null),wins:e?.actors.map(a=>a.roundWins),
    health:e?.actors.map(a=>a.health),maxHealth:e?.actors.map(a=>a.maxHealth),ko:e?.actors.map(a=>a.ko),
    lastMoves:e?.actors.map(a=>a.lastMoveKey),fatalities:e?.actors.map(a=>a.stats.fatalities),
    fatality:e?.fatality?{timer:e.fatality.timer,total:e.fatality.total}:null,
    roundEvents:q.roundEvents,matchEvents:q.matchEvents,records:q.records(),
    resultHidden:document.querySelector('#result').classList.contains('hidden')};
  };
  q.watch=()=>{
   const e=__HALO_QA__.engine;if(q.watched.has(e))return;q.watched.add(e);
   const round=e.callbacks.onRoundEnd,match=e.callbacks.onMatchEnd,render=e.renderMatchEnd;
   e.callbacks.onRoundEnd=result=>{q.roundEvents++;round(result);};
   e.callbacks.onMatchEnd=result=>{q.matchEvents++;q.lastResult=result;match(result);};
   e.renderMatchEnd=function(ctx){
    q.renderSamples++;const fill=ctx.fillRect;
    ctx.fillRect=function(...args){q.resultOverlays++;return fill.apply(this,args);};
    try{return render.call(this,ctx);}finally{ctx.fillRect=fill;}
   };
  };
  q.advance=(count,pause=true)=>{
   const e=__HALO_QA__.engine;e.togglePause(false);
   for(let i=0;i<count;i++)e.update();
   if(pause)e.togglePause(true);return q.snapshot();
  };
  q.knockout=(decisive=false,superHit=false)=>{
   const e=__HALO_QA__.engine;
   if(decisive)e.actors[0].roundWins=e.config.roundsToWin-1;
   const target=e.actors[1];target.ko=false;target.health=0;
   target.lastHit={attackerIndex:0,isSuper:superHit,environmental:false};
   e.resolveKnockouts();return q.snapshot();
  };
  q.installOutro=()=>{
   const id=__HALO_QA__.engine.actors[0].data.id;
   if(!q.backups.has(id))q.backups.set(id,SPRITES[id]);
   const original=q.backups.get(id);
   SPRITES[id]={...original,clips:{...original.clips,outro:{frames:[0],frameTicks:[540],ticksPerFrame:540,loop:false}}};
   return {id,framePath:original.frames[0].path,sha256:original.frames[0].sha256,ticks:540,fixtureOnly:true};
  };
  q.restore=()=>{for(const [id,original] of q.backups)SPRITES[id]=original;q.backups.clear();return JSON.stringify(SPRITES)===q.originalArt;};
  q.watch();
 });
}
const scene=page=>page.evaluate(()=>__PRESENTATION_QA__.snapshot());
async function restore(page){return page.evaluate(()=>window.__PRESENTATION_QA__?.restore?.()??true);}

try{
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4181','--dist'],{cwd:root,stdio:'ignore'});
 let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 check('static HTTP server ready',ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}}),page=await newPage(context);
 await page.goto(versus);await page.waitForFunction(()=>!!window.__HALO_QA__);
 await page.selectOption('#mode','local');await page.selectOption('#rounds','2');await quietRules(page);await page.check('#fatalities');
 await page.click('#launch');await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='intro');
 await page.click('#pauseBtn');await page.waitForFunction(()=>__HALO_QA__.engine.paused);await installFixtures(page);
 let current=await scene(page);report.scenes.intro=current;
 check('both first-intro actors have synchronized distinct presentation identities',current.tracks.every(t=>t?.key==='intro')&&current.tracks[0].sequenceId===current.tracks[1].sequenceId&&current.tracks[0].id!==current.tracks[1].id&&current.tracks[0].frame===current.tracks[1].frame,current);
 check('absent intro clips do not manufacture imported duration',current.tracks.every(t=>t.clipDuration===0&&t.duration===150),current.tracks);
 const frozenIntro=JSON.stringify(current);await page.waitForTimeout(140);
 check('real pause freezes intro tracks, match time and score',JSON.stringify(await scene(page))===frozenIntro);
 await page.evaluate(()=>{const e=__HALO_QA__.engine;e.seekPresentations(80);e.phaseTimer=e.presentationSequence.duration-80;window.__PRESENTATION_QA__.retired=e;});
 await page.click('[data-pause=retry]');await page.waitForFunction(()=>__HALO_QA__.engine!==__PRESENTATION_QA__.retired);
 await page.click('#pauseBtn');await page.waitForFunction(()=>__HALO_QA__.engine.paused);
 await page.evaluate(()=>__PRESENTATION_QA__.watch());current=await scene(page);
 check('real retry retires the prior engine and starts fresh synchronized intros',await page.evaluate(()=>__PRESENTATION_QA__.retired.destroyed&&!__PRESENTATION_QA__.retired.running)&&current.phase==='intro'&&current.tracks.every(t=>t.key==='intro'&&t.frame<80)&&current.tracks[0].frame===current.tracks[1].frame&&current.wins.every(n=>n===0),current);
 await shot(page,'01-intro-paused');
 await page.click('[data-pause=resume]');await page.keyboard.press('j');
 await page.waitForFunction(()=>__HALO_QA__.engine.phase==='fight');await page.waitForTimeout(100);
 check('an attack pressed during intro is discarded before the fight',await page.evaluate(()=>__HALO_QA__.engine.actors.every(a=>a.lastMoveKey===null)&&__HALO_QA__.engine.inputBuffer.every(v=>v===null)));

 await page.click('#pauseBtn');
 current=await page.evaluate(()=>__PRESENTATION_QA__.knockout(false,true));report.scenes.intermediateRound=current;
 check('intermediate knockout uses reversible winRound and loseRound without a fatality',current.phase==='roundEnd'&&!current.fatality&&current.tracks[0].key==='winRound'&&current.tracks[1].key==='loseRound'&&current.tracks.every(t=>t.reversible&&t.frame===0),current);
 const once=await page.evaluate(()=>{const e=__HALO_QA__.engine;e.resolveKnockouts();e.endRound(e.actors[0],'K.O.');return __PRESENTATION_QA__.snapshot();});
 check('repeated intermediate resolution awards the point and round callback once',once.wins[0]===1&&once.wins[1]===0&&once.roundEvents===1&&once.matchEvents===0,once);
 current=await page.evaluate(()=>__PRESENTATION_QA__.advance(__HALO_QA__.engine.phaseTimer));
 check('next round restores health and clears old poses instead of replaying intros',current.round===2&&current.phase==='intro'&&current.tracks.every(t=>t===null)&&current.ko.every(v=>!v)&&current.health.every((v,i)=>v===current.maxHealth[i]),current);
 current=await page.evaluate(()=>{const q=__PRESENTATION_QA__;q.advance(__HALO_QA__.engine.phaseTimer);return q.knockout(false,true);});report.scenes.finisher=current;
 check('decisive finisher gives attacker and target the same scene clock',current.phase==='fatality'&&current.tracks[0].key==='finisher'&&current.tracks[1].key==='finished'&&current.tracks[0].frame===current.tracks[1].frame&&current.tracks[0].sequenceId===current.tracks[1].sequenceId&&current.tracks.every(t=>t.duration===current.fatality.total)&&current.wins[0]===1,current);
 await page.click('[data-pause=resume]');await page.waitForFunction(()=>__HALO_QA__.engine.actors[0].presentation.frame>0);await page.click('#pauseBtn');
 const frozenFinisher=JSON.stringify(await scene(page));await page.waitForTimeout(140);
 check('real pause freezes both finisher tracks and their outcome',JSON.stringify(await scene(page))===frozenFinisher);
 await shot(page,'02-finisher-paused');
 current=await page.evaluate(()=>{const q=__PRESENTATION_QA__,e=__HALO_QA__.engine;q.advance(e.fatality.timer);e.completeFatality();e.endRound(e.actors[0],'FATALITY');return q.snapshot();});report.scenes.finalPoses=current;
 const heldFinished=current.tracks[1];
 check('finisher settles once, then keeps finished while the winner uses winMatch',current.phase==='roundEnd'&&current.tracks[0].key==='winMatch'&&heldFinished.key==='finished'&&heldFinished.complete&&heldFinished.frame===heldFinished.duration-1&&current.wins[0]===2&&current.fatalities[0]===1&&current.roundEvents===2&&current.matchEvents===0,current);
 report.outroFixture=await page.evaluate(()=>__PRESENTATION_QA__.installOutro());
 const recordsBefore=(await scene(page)).records.matches||0;
 current=await page.evaluate(()=>{const q=__PRESENTATION_QA__,e=__HALO_QA__.engine;q.advance(e.phaseTimer);e.finishRoundTransition();__HALO_QA__.handleMatchEnd(q.lastResult);return q.snapshot();});report.scenes.outro=current;
 check('records settle synchronously and only once before the result panel',current.records.matches===recordsBefore+1&&current.records.wins===1&&current.matchEvents===1&&current.resultHidden,current);
 check('only the winner starts the imported outro; finished remains held',current.phase==='matchEnd'&&current.tracks[0].key==='outro'&&current.tracks[0].clipDuration===540&&current.tracks[0].duration===540&&current.tracks[1].id===heldFinished.id&&current.tracks[1].frame===heldFinished.frame&&current.tracks[1].complete,current.tracks);
 check('pending imported outro offers a real pause dialog and resume control',await page.locator('[aria-labelledby=pauseTitle]').isVisible()&&await page.locator('[data-pause=resume]').isVisible()&&await page.evaluate(()=>__HALO_QA__.engine.isPresentingOutro()));
 const frozenOutro=JSON.stringify(current);await page.waitForTimeout(750);
 check('after 600 ms a paused outro keeps the result hidden and its frame unchanged',JSON.stringify(await scene(page))===frozenOutro&&await page.locator('#result').isHidden());
 check('match-end canvas overlay is not painted over the unfinished paused outro',await page.evaluate(()=>__PRESENTATION_QA__.renderSamples>0&&__PRESENTATION_QA__.resultOverlays===0));
 await shot(page,'03-outro-waiting-paused');
 await page.click('[data-pause=resume]');
 await page.evaluate(()=>{const e=__HALO_QA__.engine;__PRESENTATION_QA__.advance(e.actors[0].presentation.duration-e.resultTimer+2,false);e.render(performance.now());});
 await page.waitForSelector('#result:not(.hidden)');current=await scene(page);
 check('result appears after simulated outro completion and keeps the target final pose',current.tracks[0].complete&&current.tracks[1].id===heldFinished.id&&current.records.matches===recordsBefore+1&&!current.resultHidden&&!await page.evaluate(()=>__HALO_QA__.engine.isPresentingOutro()),current);
 check('match-end canvas overlay resumes only after the outro completes',await page.evaluate(()=>__PRESENTATION_QA__.resultOverlays>0));

 // A second prepared local match covers ordinary loseMatch and stale reveal cancellation.
 await page.click('#rematch');await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='intro');await page.evaluate(()=>__PRESENTATION_QA__.watch());
 current=await page.evaluate(()=>{const q=__PRESENTATION_QA__,e=__HALO_QA__.engine;q.advance(e.phaseTimer);e.config.fatalities=false;return q.knockout(true);});
 check('ordinary decisive result uses winMatch and loseMatch',current.tracks[0].key==='winMatch'&&current.tracks[1].key==='loseMatch'&&current.tracks.every(t=>!t.reversible),current);
 current=await page.evaluate(()=>{const q=__PRESENTATION_QA__,e=__HALO_QA__.engine;q.advance(e.phaseTimer);q.retired=e;return q.snapshot();});
 check('ordinary loser stays in its completed loseMatch during winner outro',current.tracks[0].key==='outro'&&current.tracks[1].key==='loseMatch'&&current.tracks[1].complete,current.tracks);
 await page.click('[data-pause=select]');await page.waitForSelector('#selectScreen:not(.hidden)');await page.waitForTimeout(750);
 check('leaving during outro invalidates the delayed result callback',await page.evaluate(()=>!__HALO_QA__.engine&&__PRESENTATION_QA__.retired.destroyed&&__PRESENTATION_QA__.retired.actors.every(a=>a.presentation===null)&&document.querySelector('#result').classList.contains('hidden')));
 check('timing fixture restores the original SPRITES registry after local scenes',await restore(page));

 // A real composed exit also owns the result gate, even though it imports no new images.
 await page.uncheck('#fatalities');await page.click('#launch');await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='intro');
 current=await page.evaluate(()=>{
  const q=__PRESENTATION_QA__,e=__HALO_QA__.engine;q.watch();q.advance(e.phaseTimer);q.knockout(true);q.advance(e.phaseTimer);
  q.composedOverlayCount=q.resultOverlays;return q.snapshot();
 });report.scenes.composedOutro=current;
 check('the composed Air Screamer exit starts with no imported clip and keeps its result pending',current.phase==='matchEnd'&&current.tracks[0].key==='outro'&&current.tracks[0].clipDuration===0&&current.tracks[0].stagingDuration===90&&!current.tracks[0].complete&&current.resultHidden,current);
 const frozenComposed=JSON.stringify(current);await page.waitForTimeout(750);
 check('a paused composed outro stays hidden beyond 600 ms without a result veil',JSON.stringify(await scene(page))===frozenComposed&&await page.locator('#result').isHidden()&&await page.evaluate(()=>__PRESENTATION_QA__.resultOverlays===__PRESENTATION_QA__.composedOverlayCount&&__HALO_QA__.engine.isPresentingOutro()));
 await page.click('[data-pause=resume]');await page.evaluate(()=>{const e=__HALO_QA__.engine;__PRESENTATION_QA__.advance(e.actors[0].presentation.duration-e.resultTimer+2,false);});
 await page.waitForSelector('#result:not(.hidden)');
 check('the composed outro reveals its own result only after simulated completion',await page.evaluate(()=>__HALO_QA__.engine.actors[0].presentation.complete&&!__HALO_QA__.engine.isPresentingOutro()));

 // The dojo RESET button must retire the old result callback and allow a later match to settle.
 await page.goto(versus+'&preset=training');await page.waitForFunction(()=>!!window.__HALO_QA__);await quietRules(page);await page.uncheck('#fatalities');
 await page.click('#openControls');await page.click('[data-binding=light]');await page.keyboard.press('b');await page.click('#closeBindings');
 await page.click('#launch');await page.waitForFunction(()=>!!__HALO_QA__.engine);await page.check('#hitboxes');await page.check('#freeMeter');await page.uncheck('#autoHeal');await installFixtures(page);
 const dojoBefore=(await scene(page)).records.matches||0;
 await page.evaluate(()=>__PRESENTATION_QA__.installOutro());
 current=await page.evaluate(()=>{
  const q=__PRESENTATION_QA__,e=__HALO_QA__.engine;q.advance(e.phaseTimer);q.knockout(true);q.advance(e.phaseTimer,false);
  q.retired=e;q.oldBindings=JSON.stringify(e.bindings);return q.snapshot();
 });
 check('prepared dojo result settles before its pending 540-tick outro',current.phase==='matchEnd'&&current.tracks[0].clipDuration===540&&!current.tracks[0].complete&&current.records.matches===dojoBefore+1&&current.resultHidden,current);
 await page.click('#resetDojo');await page.waitForFunction(()=>__HALO_QA__.engine!==__PRESENTATION_QA__.retired);
 check('real dojo RESET destroys the old engine and starts a new first intro',await page.evaluate(()=>{
  const {engine:e}=__HALO_QA__,q=__PRESENTATION_QA__;q.watch();return q.retired.destroyed&&!q.retired.running&&e.phase==='intro'&&e.actors.every(a=>a.presentation?.key==='intro'&&a.roundWins===0)&&e.input.enabled;
 }));
 check('dojo reset preserves active training options and bindings',await page.evaluate(()=>{
  const e=__HALO_QA__.engine;return e.config.training&&e.config.showHitboxes&&e.config.freeMeter&&!e.config.autoHeal&&JSON.stringify(e.bindings)===__PRESENTATION_QA__.oldBindings&&e.bindings.players[0].light==='KeyB';
 }));
 await page.waitForTimeout(750);
 check('obsolete dojo result does not reveal after RESET and 600 ms',await page.evaluate(before=>document.querySelector('#result').classList.contains('hidden')&&__HALO_QA__.engine.input.enabled&&__PRESENTATION_QA__.records().matches===before+1,dojoBefore)&&await page.locator('#result').isHidden());
 await shot(page,'04-dojo-reset-inputs');
 await page.evaluate(()=>__PRESENTATION_QA__.advance(__HALO_QA__.engine.phaseTimer,false));await page.keyboard.press('b');
 await page.waitForFunction(()=>__HALO_QA__.engine.actors[0].lastMoveKey==='neutralLight');
 check('new dojo engine accepts the preserved fresh input after its intro',await page.evaluate(()=>!__HALO_QA__.engine.paused&&__HALO_QA__.engine.input.enabled));
 current=await page.evaluate(()=>{const q=__PRESENTATION_QA__,e=__HALO_QA__.engine;q.knockout(true);q.advance(e.phaseTimer);e.finishRoundTransition();__HALO_QA__.handleMatchEnd(q.lastResult);return q.snapshot();});
 check('a new dojo victory after RESET is counted exactly once',current.records.matches===dojoBefore+2&&current.matchEvents===2&&current.resultHidden,current);
 await page.click('[data-pause=resume]');await page.evaluate(()=>{const e=__HALO_QA__.engine;__PRESENTATION_QA__.advance(e.actors[0].presentation.duration-e.resultTimer,false);});
 await page.waitForSelector('#result:not(.hidden)');
 check('the new dojo result is revealable after its own completed outro',await page.evaluate(before=>__PRESENTATION_QA__.records().matches===before+2&&__HALO_QA__.engine.actors[0].presentation.complete,dojoBefore));
 check('dojo timing fixture restores original SPRITES without new artwork',await restore(page));

 await page.goto(base+'/modules/sprite-workshop.html');await selectStaticWorkshopSubject(page);
 check('workshop retains thirty old keys, adds taunt and exact production contexts',await page.locator('[data-inspect=pose] option').evaluateAll(options=>options.filter(o=>!o.value.includes('@')).length===39&&options.some(o=>o.value==='finisher@film_red_pyramid_film_175_signature')&&options.some(o=>o.value==='finished@midwich_fatality')));
 await page.locator('.clip-editor summary').click();
 for(const key of keys){
  await page.selectOption('[data-inspect=pose]',key);
  check(`workshop ${key} is one-shot and shows the actual missing-clip fallback`,await page.locator('[data-clip=loop]').isDisabled()&&await page.locator('#spriteDetail canvas').getAttribute('data-requested-pose')===key&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle'&&/SÉQUENCE À PRODUIRE/.test(await page.locator('[data-inspect=status]').textContent()));
  await page.click('[data-clip=preview]');
  check(`workshop ${key} refuses an idle-only fabricated presentation`,/image dédiée/.test(await page.locator('[data-clip=error]').textContent())&&await page.locator('#spriteDetail canvas').getAttribute('data-clip-draft')==='false');
 }
 await page.setViewportSize({width:390,height:844});
 check('presentation authoring controls fit the mobile viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(page,'05-workshop-mobile');
 await context.close();

 const offline=await browser.newContext({viewport:{width:1280,height:900}}),off=await newPage(offline);
 await off.goto(base);await off.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});
 await offline.setOffline(true);await off.goto(base+'/modules/sprite-workshop.html');await selectStaticWorkshopSubject(off);
 const modules=await off.evaluate(async()=>{const [poses,sequences]=await Promise.all([import('/src/sprite-poses.js'),import('/src/presentation-sequences.js')]);return {keys:poses.PRESENTATION_KEYS,durationFunction:typeof sequences.presentationDuration,actorFunction:typeof sequences.createActorPresentation};});
 check('both new presentation modules import entirely offline',JSON.stringify(modules.keys)===JSON.stringify(keys)&&modules.durationFunction==='function'&&modules.actorFunction==='function',modules);
 await off.goto(versus);await off.waitForFunction(()=>!!window.__HALO_QA__);await off.selectOption('#mode','local');await quietRules(off);await off.click('#launch');await off.waitForFunction(()=>__HALO_QA__.engine?.phase==='intro');await off.click('#pauseBtn');
 check('offline combat preserves synchronized intro and real pause',await off.evaluate(()=>{const e=__HALO_QA__.engine;return e.paused&&e.actors.every(a=>a.presentation?.key==='intro')&&e.actors[0].presentation.frame===e.actors[1].presentation.frame;}));
 await shot(off,'06-offline-presentations');await offline.close();
 check('no unhandled JavaScript browser exceptions',report.errors.length===0,report.errors);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{
 for(const page of pages)if(!page.isClosed()){try{await restore(page);}catch{/* A navigated or closed isolated realm owns no persistent fixture. */}}
 report.passed=!report.failure&&!report.errors.length;
 await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 await browser?.close();server?.kill('SIGTERM');
}
