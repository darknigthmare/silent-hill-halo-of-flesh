/** Real keyboard combat regressions around explicitly prepared source-constrained scenes. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VERSION} from '../src/data.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=resolve(root,'tests/http-source-expansion');
const source=process.env.QA_SOURCE_TREE==='1',port='4193';
const base=process.env.QA_BASE_URL||`http://127.0.0.1:${port}`;
const report={version:VERSION,base,build:process.env.QA_BASE_URL?'external HTTP':source?'source':'dist',
 checks:[],errors:[],captures:[],scenes:{},fixtures:[
  'The explicit ?qa=1 bridge stops the animation loop and advances real simulation ticks after the normal launch button. Actor positions, facing and one knockdown timer are prepared. No campaign or source-game playthrough is claimed.',
  'Art diagnostic is explicitly enabled for profiles without production PNGs. No synthetic picture, source-animation certification or source timing measurement is created by this suite.',
  'Attacks are triggered by actual keyboard inputs. Projectile instrumentation only counts the real spawn method; ammunition, damage formulas, move definitions and actor identities are not replaced.',
  'The Needler rear scene moves the shooter after its actual bullet has spawned. A separate prepared knockdown checks vulnerability, without claiming that its timer is measured from Homecoming.',
  'Smog is made to prepare its real smoke attack using the second keyboard while an actual Eddie bullet is in flight. The 2x opening multiplier, opening window, damage and counter bonus are authored versus values.',
  'Mary and Maria use their real moth projectile. The resulting bind restricts movement and dodge in the versus engine; original struggle inputs, stun animation and duration are not reproduced.',
  'SH3 Pendulum is represented by its source-scoped flying body, not the old tiny insect collider. Its handgun-class defense excludes the actual Arcade shotgun; these cross-work weapon mappings and defensive windows are versus choices.',
  'Insane Cancer and Slurper charges use real directional keyboard commands. Ghost proximity is checked with idle casters, and Jasper damage is compared with the common drain. Radii, pulse intervals, health conversion and bind are versus tuning, not measured source-game values.',
  'Browser keyboard, pause and narrow viewport checks do not certify physical gamepads or mobile devices.'
 ]};
let server,browser,context;
function check(name,passed,detail){report.checks.push({name,passed:!!passed,...(!passed&&detail!==undefined?{detail}:{})});if(!passed)throw Error(name);}
async function capture(page,name){await page.screenshot({path:resolve(out,name+'.png'),fullPage:false});report.captures.push(name+'.png');}
async function launch(page,p1,p2='sh2_bubble_head_nurse_024'){
 await page.goto(base+`/modules/unified-versus.html?qa=1&debugArt=1&p1=${p1}&p2=${p2}`);
 await page.waitForFunction(()=>!!window.__HALO_QA__);await page.selectOption('#mode','local');
 for(const id of ['stageHazards','stageDirector','otherworldShift','stageFatalities','fatalities','stageTerrain'])await page.uncheck('#'+id);
 await page.check('#artDiagnostic');await page.click('#launch');await page.waitForFunction(()=>!!__HALO_QA__.engine);
 return page.evaluate(()=>{
  const e=__HALO_QA__.engine;e.running=false;e.togglePause(false);
  const intro=e.phase==='intro'?e.phaseTimer:0;for(let n=0;n<intro;n++)e.update();
  const q=window.__SOURCE_EXPANSION_QA__={emitted:0};
  const spawn=e.spawnProjectile;
  e.spawnProjectile=function(...args){const before=this.projectiles.length;const result=spawn.apply(this,args);q.emitted+=this.projectiles.length-before;return result;};
  q.advance=count=>{for(let n=0;n<count;n++)e.update();e.render(performance.now());};
  q.position=(left=300,right=650)=>{e.actors.forEach((a,i)=>{a.x=i?right:left;a.y=594;a.vx=0;a.vy=0;a.grounded=true;
   a.facing=i?-1:1;a.attack=null;a.hurtFrames=0;a.knockdownTimer=0;a.phaseLock=0;a.invuln=0;a.state='idle';a.blocking=false;a.crouching=false;});e.hitstop=0;e.clearInputs();};
  q.scene=()=>({phase:e.phase,frame:e.frame,paused:e.paused,emitted:q.emitted,projectiles:e.projectiles.length,
   actors:e.actors.map(a=>({id:a.data.id,source:a.data.source,kind:a.data.visual.kind,x:a.x,facing:a.facing,health:a.health,guard:a.guard,meter:a.meter,
    damage:a.stats.damageDealt,damageTaken:a.stats.damageTaken,status:a.status?{...a.status}:null,dodge:a.dodgeFrames,
    move:a.attack?.key||a.lastMoveKey,attackFrame:a.attack?.frame??null,hurt:a.hurtFrames,knockdown:a.knockdownTimer,
    proximity:a.proximityCooldown,activeCommands:Object.values(a.profile.moves).filter(m=>m.enabled).map(m=>m.key)})),texts:e.texts.map(t=>t.text)});
  q.position();q.advance(0);return q.scene();
 });
}

await mkdir(out,{recursive:true});
try{
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs',port,...(source?[]:['--dist'])],{cwd:root,stdio:'ignore'});
 let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
 check('HTTP server is ready',ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
 context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());

 let scene=await launch(page,'sh2_lying_figure_crawling_021');
 check('normal launch accepts the exact crawling source profile',scene.phase==='fight'&&scene.actors[0].id==='sh2_lying_figure_crawling_021',scene);
 const crawlerBefore=scene.actors[1].health;
 await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(65));
 scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
 check('crawling special at distance emits no standing acid and cannot hit across the arena',scene.emitted===0&&scene.actors[1].health===crawlerBefore&&scene.actors[0].move==='neutralSpecial',scene);
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(440,555));await page.keyboard.press('i');
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(24));scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
 report.scenes.crawling=scene;
 check('the same real crawling input advances and damages a nearby target by contact',scene.emitted===0&&scene.actors[0].x>440&&scene.actors[1].health<crawlerBefore&&scene.actors[0].damage>0,scene);
 await capture(page,'01-crawling-contact');

 scene=await launch(page,'sh2_eddie_dombrowski_032','homecoming_needler_088');
 const needleBefore={...scene.actors[1]};
 await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(62));
 scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());report.scenes.needlerBullet=scene;
 check('Eddie keyboard input emits exactly one original revolver bullet',scene.emitted===1&&scene.actors[0].move==='neutralSpecial',scene);
 check('Needler frontal blades deflect that actual bullet without chip, meter or damage credit',scene.projectiles===0&&scene.texts.includes('TIR DÉVIÉ')&&scene.actors[1].health===needleBefore.health&&scene.actors[1].guard===needleBefore.guard&&scene.actors[1].meter===needleBefore.meter&&scene.actors[0].damage===0,scene);
 await capture(page,'02-needler-bullet-deflection');
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position());await page.keyboard.press('i');
 const back=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,[a,b]=e.actors,before=b.health;
  q.advance(a.profile.moves.neutralSpecial.startup+1);const inFlight=e.projectiles.length;a.x=1100;q.advance(70);
  return {inFlight,before,scene:q.scene()};});report.scenes.needlerBack=back;
 check('the same actual revolver projectile damages Needler from behind after its shooter crosses',back.inFlight===1&&back.scene.actors[1].facing===1&&back.scene.actors[1].health<back.before&&back.scene.actors[0].damage>0,back);

 scene=await launch(page,'sh2_bubble_head_nurse_024','homecoming_needler_088');
 const pipeBefore=scene.actors[1].health;await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(490,580));
 await page.keyboard.press('j');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(40));
 scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());report.scenes.needlerMelee=scene;
 check('Needler also blocks a real frontal pipe swing without a free retaliation',scene.actors[0].move==='neutralLight'&&scene.texts.includes('PARADE DES LAMES')&&scene.actors[1].health===pipeBefore&&scene.actors[0].damage===0&&scene.actors[1].meter===0,scene);

 scene=await launch(page,'sh2_eddie_dombrowski_032','homecoming_needler_088');
 const downBefore=scene.actors[1].health;
 await page.evaluate(()=>{const a=__HALO_QA__.engine.actors[1];a.knockdownTimer=120;a.state='knockdown';});
 await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(65));
 scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());report.scenes.needlerDown=scene;
 check('prepared downed Needler remains vulnerable to the actual frontal bullet collision',scene.emitted===1&&scene.actors[1].health<downBefore&&scene.actors[0].damage>0&&!scene.texts.includes('TIR DÉVIÉ'),scene);

 scene=await launch(page,'sh2_eddie_dombrowski_032','homecoming_smog_087');
 check('Smog exposes only its documented smoke and derived versus supers',JSON.stringify(scene.actors[1].activeCommands)===JSON.stringify(['neutralSpecial','super','desperation']),scene.actors[1]);
 await page.keyboard.press('f');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(2));
 const blocked=await page.evaluate(()=>{const e=__HALO_QA__.engine,a=e.actors[1];return {attack:a.attack?.key||null,damage:a.stats.damageDealt,enabled:a.profile.moves.neutralLight.enabled};});
 check('a real attempted Smog punch is rejected rather than fabricating a physical attack',blocked.attack===null&&blocked.damage===0&&blocked.enabled===false,blocked);
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(300,520));await page.keyboard.press('i');
 const closed=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,target=e.actors[1],before=target.health;
  for(let n=0;n<120&&target.health===before;n++)q.advance(1);return {before,lost:before-target.health,scene:q.scene()};});
 check('a real Eddie bullet damages closed Smog before any opening bonus',closed.lost>0&&closed.scene.emitted===1,closed);

 await launch(page,'sh2_eddie_dombrowski_032','homecoming_smog_087');
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(300,520));await page.keyboard.press('i');
 const flight=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__;q.advance(e.actors[0].profile.moves.neutralSpecial.startup+1);return e.projectiles.length;});
 check('Smog opening scene starts with the actual revolver bullet in flight',flight===1,flight);
 await page.keyboard.press('h');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(2));
 const opening=await page.evaluate(()=>{const e=__HALO_QA__.engine,a=e.actors[1];return {frame:a.attack?.frame,key:a.attack?.key,health:a.health,projectiles:e.projectiles.length};});
 check('the second real keyboard starts Smog exhalation preparation',opening.key==='neutralSpecial'&&opening.frame>=1&&opening.projectiles===1,opening);
 await page.click('#pauseBtn');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(20));
 const pause=await page.evaluate(()=>{const e=__HALO_QA__.engine,a=e.actors[1];return {paused:e.paused,frame:a.attack?.frame,health:a.health,projectiles:e.projectiles.length};});
 check('real pause freezes the exposed attack and its incoming projectile',pause.paused&&pause.frame===opening.frame&&pause.health===opening.health&&pause.projectiles===opening.projectiles,pause);
 await capture(page,'03-smog-opening-paused');await page.click('[data-pause=resume]');
 const open=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,[shooter,target]=e.actors,before=target.health;let preparation=null;
  for(let n=0;n<120&&target.health===before;n++){
   preparation=target.attack?{key:target.attack.key,frame:target.attack.frame,end:target.attack.move.startup+target.attack.move.active}:null;q.advance(1);
  }
  return {lost:before-target.health,source:shooter.stats.damageDealt,received:target.stats.damageTaken,preparation,scene:q.scene()};});
 report.scenes.smogClosed=closed;report.scenes.smogOpen=open;
 check('a real bullet during preparation deals the authored opening bonus instead of closed-state damage',open.lost>closed.lost*1.8&&open.scene.emitted===1&&open.preparation?.key==='neutralSpecial'&&open.preparation.frame>=1&&open.preparation.frame<open.preparation.end,open);
 check('Smog increased damage is accounted by actual HP loss and both combat records',open.source===open.lost&&open.received===open.lost,open);

 for(const id of ['sh2_maria_final_manifestation_033','sh2_mary_final_manifestation_034']){
  await launch(page,id);await page.keyboard.press('i');
  const caught=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,target=e.actors[1];
   for(let n=0;n<150&&target.status?.id!=='bind';n++)q.advance(1);
   for(let n=0;n<80&&target.hurtFrames>0;n++)q.advance(1);
   return q.scene();});report.scenes[id]=caught;
  check('real '+id+' moth projectile catches its target with bind',caught.emitted===1&&caught.actors[1].status?.id==='bind'&&caught.actors[1].status.source===0&&caught.actors[1].hurt===0&&caught.actors[1].damageTaken>0,caught);
  await page.keyboard.press('v');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));
  const restricted=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
  check('a real dodge input cannot bypass the active '+id+' moth restriction',restricted.actors[1].status?.id==='bind'&&restricted.actors[1].dodge===0,restricted);
 }
 await page.click('#pauseBtn');
 const bindBefore=await page.evaluate(()=>__HALO_QA__.engine.actors[1].status.timer);await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(30));
 check('actual pause also freezes the captured target bind duration',await page.evaluate(before=>__HALO_QA__.engine.paused&&__HALO_QA__.engine.actors[1].status.timer===before,bindBefore));
 await page.click('[data-pause=resume]');await page.setViewportSize({width:430,height:1050});
 check('combat interface still fits a narrow viewport with the new source states',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await capture(page,'04-moth-bind-mobile');

 await page.setViewportSize({width:1440,height:1000});
 scene=await launch(page,'sh3_nurse_revolver_044','sh3_pendulum_039');
 const pendulumBefore={...scene.actors[1]};
 check('Pendulum uses its exact SH3 identity and flying body in the actual launch',pendulumBefore.source==='sh3'&&pendulumBefore.kind==='flyer',pendulumBefore);
 await page.keyboard.press('i');
 const parried=await page.evaluate(()=>{const q=__SOURCE_EXPANSION_QA__;let deflected=false;
  for(let n=0;n<75;n++){q.advance(1);deflected ||= q.scene().texts.includes('TIR DÉVIÉ');}
  return {deflected,scene:q.scene()};});report.scenes.pendulum=parried;
 check('a real handgun projectile reaches Pendulum and is deflected without damage or rewards',parried.deflected&&parried.scene.emitted===1&&parried.scene.actors[1].health===pendulumBefore.health&&parried.scene.actors[0].damage===0&&parried.scene.actors[1].meter===pendulumBefore.meter,parried);
 await capture(page,'05-pendulum-deflection');

 scene=await launch(page,'arcade_robbie_the_rabbit_shotgun','sh3_pendulum_039');
 const shotgunBefore=scene.actors[1].health;await page.keyboard.press('i');
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(75));scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
 report.scenes.pendulumShotgun=scene;
 check('Pendulum handgun defense does not block the actual Arcade shotgun projectile',scene.emitted===1&&scene.actors[1].health<shotgunBefore&&scene.actors[0].damage>0,scene);

 for(const id of ['sh3_insane_cancer_041','sh3_slurper_042']){
  scene=await launch(page,id);const before=scene.actors[1].health;
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,645));
  await page.keyboard.down('ArrowRight');await page.keyboard.press('i');
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up('ArrowRight');
  const charge=await page.evaluate(()=>{const q=__SOURCE_EXPANSION_QA__,e=__HALO_QA__.engine,before=e.actors[1].health;
   for(let n=0;n<70&&e.actors[1].health===before;n++)q.advance(1);return q.scene();});report.scenes[id+'Charge']=charge;
  check('real '+id+' forward-special command advances, collides and knocks down locally',charge.actors[0].move==='forwardSpecial'&&charge.actors[0].x>500&&charge.actors[1].health<before&&charge.actors[1].knockdown>0&&charge.emitted===0,charge);
 }
 await launch(page,'sh3_slurper_042');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,575));
 await page.keyboard.press('i');
 const leg=await page.evaluate(()=>{const q=__SOURCE_EXPANSION_QA__,e=__HALO_QA__.engine;
  for(let n=0;n<60&&e.actors[1].status?.id!=='bind';n++)q.advance(1);return q.scene();});report.scenes.slurperLeg=leg;
 check('Slurper actual close leg hold binds through contact and keeps the unattested rear throw disabled',leg.actors[0].move==='neutralSpecial'&&leg.actors[1].status?.id==='bind'&&leg.actors[1].damageTaken>0&&leg.emitted===0&&!leg.actors[0].activeCommands.includes('backThrow'),leg);
 await capture(page,'06-slurper-leg-hold');

 let ordinaryDrain=0;
 for(const id of ['sh4_ghost_victim_066','sh4_jasper_gein_victim_17']){
  scene=await launch(page,id);const before=scene.actors[1].health;
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,600));
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));
  const pulse=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());report.scenes[id+'Passive']=pulse;
  const lost=before-pulse.actors[1].health;if(id==='sh4_ghost_victim_066')ordinaryDrain=lost;
  check('idle '+id+' drains proximity without a projectile, attack, knockdown or meter reward',lost>0&&pulse.actors[0].damage===lost&&pulse.actors[1].damageTaken===lost&&pulse.actors[0].move==null&&pulse.emitted===0&&pulse.actors[1].knockdown===0&&pulse.actors[0].meter===0&&pulse.actors[1].meter===0,pulse);
  check('idle '+id+' respects its actual passive cooldown',await page.evaluate(health=>{const q=__SOURCE_EXPANSION_QA__;q.advance(1);return q.scene().actors[1].health===health;},pulse.actors[1].health));
  if(id==='sh4_jasper_gein_victim_17')check('Jasper passive fire adds damage beyond the common Ghost drain',lost>ordinaryDrain,{ordinaryDrain,jasperDrain:lost});
 }
 await capture(page,'07-jasper-idle-proximity');
 check('no unhandled JavaScript exceptions',report.errors.length===0,report.errors);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{
 report.passed=!report.failure&&!report.errors.length;
 await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 await context?.close();await browser?.close();server?.kill('SIGTERM');
}
