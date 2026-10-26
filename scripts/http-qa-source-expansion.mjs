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
  'Split Head is angered with real keyboard gunfire, not a replaced health field. Its 70% transition, 2x frontal active-mouth multiplier and readable HUD cue are versus rules. No original mouth animation or instant-kill swallow is claimed.',
  'Hummer knockdown, Wall Man claws and both Sniffer holds use real keyboard attacks. Sakura Head and the five Raw Shock variants are checked through the normal refused launch and source dossiers; their pursuit encounters are not turned into invented duels.',
  'Hummer height is measured from collision and the real PNG drawImage arguments/matrix before, during and after knockdown. The same bitmap is lowered without rotating or fabricating a pose; source knockdown/KO clips remain absent. Prepared guard-counter windows test the real Split Head heavy-key gate.',
  'Closer and Twin Victim arm rotations are bounded two-sided physical contacts at the normal strike height, not an aura. Prepared facing allows the real keyboard command to prove a rear hit and outward knockback. The original 3D arc, animations, frame timings and Church multipliers are not measured.',
  'Double Head, Romper, Twin Victim, Lurker and Feral pursuit inputs physically leave the floor. Close holds use the versus bind instead of original struggle inputs. Homecoming Bogeyman remains a documented cutscene figure and is refused as a duel, independently of its other works.',
  'The six source leg/bite holds keep their victim on the floor instead of inheriting the generic throw launch. A real second-player jump during their startup verifies refusal while airborne; gamepad bindings are separately exercised with the standard virtual-pad Node harness, not certified on physical hardware.',
  'Lot7 adds real keyboard Patient multi-contact/pivot, Bottom rotation/dive, frontal Asphyxia resistance and native missed-attack recovery for Scarlet and exposed Amnion. Position/facing fixtures move a shooter or target, but never replace HP, move definitions, attack frames or hit counts.',
  'Cynthia hair catches a standing victim: actual attempted movement/jump remains restricted, and only its real counter-projectile hit releases the source-owned binding. The Downpour Bogeyman wave is the existing projectile fixed to the floor; an actual timed second-player jump tests clearance.',
  'Lot8 uses the three original SH1 leg holds and the SH2 Labyrinth Abstract Daddy grip: the victim remains standing, and six alternating left/right controls release it. This escape count, control mapping and duration are versus choices, not original escape timing or animation. Held or contradictory directions do not generate extra progress. Prepared knockdown tests only this boss against actual firearm projectiles.',
  'Lot8 Hanged Scratcher uses its ground claws: a free jump never substitutes for attachment to a ceiling. Scraper independently reacts to visible handgun-class rounds; its shotgun and SMG exceptions differ from Missionary. Silenced-shot metadata is covered in Node without inventing an authored silenced weapon.',
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
 return page.evaluate(async()=>{
  const {bodyBox,hasGroundContact}=await import('/src/combat-geometry.js');
  const {spriteFor}=await import('/src/sprite-system.js');
  const {isFirearmProjectile}=await import('/src/combat-reference-policy.js');
  const e=__HALO_QA__.engine;e.running=false;e.togglePause(false);
  const intro=e.phase==='intro'?e.phaseTimer:0;for(let n=0;n<intro;n++)e.update();
  const q=window.__SOURCE_EXPANSION_QA__={emitted:0};
  const spawn=e.spawnProjectile;
  e.spawnProjectile=function(...args){const before=this.projectiles.length;const result=spawn.apply(this,args);q.emitted+=this.projectiles.length-before;return result;};
  const drawImage=e.ctx.drawImage;
  e.ctx.drawImage=function(image,...args){
   const hummer=e.actors.find(a=>a.data.id==='sh4_hummer_055'&&a.data.source==='sh4'),frame=hummer&&spriteFor(hummer.data)?.frames[0];
   if(frame&&String(image.currentSrc||image.src||'').includes('/'+frame.path)&&args.length===4){
    const matrix=this.getTransform();q.hummerDraw={path:frame.path,localX:args[0],localY:args[1],width:args[2],height:args[3],
     anchorOffsetY:args[1]+frame.anchor[1]*args[3],matrix:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f]};
   }
   return drawImage.call(this,image,...args);
  };
  q.advance=count=>{for(let n=0;n<count;n++)e.update();e.render(performance.now());};
  q.position=(left=300,right=650)=>{e.actors.forEach((a,i)=>{a.x=i?right:left;a.y=594;a.vx=0;a.vy=0;a.grounded=true;
   a.facing=i?-1:1;a.attack=null;a.hurtFrames=0;a.knockdownTimer=0;a.phaseLock=0;a.invuln=0;a.state='idle';a.blocking=false;a.crouching=false;});e.hitstop=0;e.clearInputs();};
  q.positionActor=(index,x,facing)=>{const a=e.actors[index];a.x=x;if(facing!==undefined)a.facing=facing;};
  q.scene=()=>({phase:e.phase,frame:e.frame,paused:e.paused,emitted:q.emitted,projectiles:e.projectiles.length,hummerDraw:q.hummerDraw||null,
   projectileStates:e.projectiles.map(p=>({ownerId:p.owner.data.id,ownerIndex:p.owner.index,key:p.move.key,x:p.x,y:p.y,radius:p.radius,groundY:p.groundY??null,vy:p.vy,gravity:p.gravity,firearm:isFirearmProjectile(p.owner.data,p.move)})),
   actors:e.actors.map(a=>({id:a.data.id,source:a.data.source,kind:a.data.visual.kind,x:a.x,y:a.y,vx:a.vx,vy:a.vy,grounded:a.grounded,facing:a.facing,health:a.health,guard:a.guard,meter:a.meter,combo:a.combo,
    damage:a.stats.damageDealt,damageTaken:a.stats.damageTaken,status:a.status?{...a.status}:null,dodge:a.dodgeFrames,
    move:a.attack?.key||a.lastMoveKey,attackFrame:a.attack?.frame??null,attackHits:a.attack?.hitCount??null,attackHit:a.attack?.hit??null,
    attackTiming:a.attack?{startup:a.attack.move.startup,active:a.attack.move.active,recovery:a.attack.move.recovery}:null,
    attackShape:a.attack?{aura:a.attack.move.aura,projectile:a.attack.move.projectile,invulnFrames:a.attack.move.invulnFrames}:null,hurt:a.hurtFrames,knockdown:a.knockdownTimer,
    proximity:a.proximityCooldown,mouthEnraged:a.mouthEnraged,sourceCue:e.sourceCombatCue(a),
    bodyBottom:bodyBox(a).y+bodyBox(a).h,groundContact:hasGroundContact(a),
    activeCommands:Object.values(a.profile.moves).filter(m=>m.enabled).map(m=>m.key)})),texts:e.texts.map(t=>t.text)});
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
 check('Slurper actual close leg hold binds on the floor and keeps the unattested rear throw disabled',leg.actors[0].move==='neutralSpecial'&&leg.actors[1].status?.id==='bind'&&leg.actors[1].damageTaken>0&&leg.actors[1].y===594&&leg.actors[1].grounded&&leg.actors[1].vx===0&&leg.emitted===0&&!leg.actors[0].activeCommands.includes('backThrow'),leg);
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

 scene=await launch(page,'sh1_split_head_014','sh3_nurse_revolver_044');
 await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(2));
 scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
 check('initial Split Head cannot open its locked jaw through the real special key',!scene.actors[0].mouthEnraged&&scene.actors[0].move==null&&scene.actors[0].sourceCue===null,scene);
 await page.evaluate(()=>{__HALO_QA__.engine.actors[0].guardCounterWindow=8;});await page.keyboard.press('k');
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
 check('a real heavy input in the initial counter window keeps the closed-mouth headbutt instead of bypassing its jaw gate',scene.actors[0].move==='neutralHeavy'&&scene.actors[0].sourceCue===null&&!scene.actors[0].mouthEnraged,scene);
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(65));
 for(let n=0;n<12&&!scene.actors[0].mouthEnraged;n++){
  await page.keyboard.press('h');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(100));
  scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
 }
 report.scenes.splitHeadPhase=scene;
 check('real repeated revolver hits activate the local jaw phase without fabricating ammunition or health',scene.actors[0].mouthEnraged&&scene.actors[0].health>0&&scene.actors[0].damageTaken>0&&scene.emitted>0,scene);
 await page.evaluate(()=>{const q=__SOURCE_EXPANSION_QA__;q.position();__HALO_QA__.engine.actors[0].guardCounterWindow=8;});
 await page.keyboard.press('k');
 const jawCounter=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__;q.advance(1);
  const key=e.actors[0].attack?.key;if(e.actors[0].attack)q.advance(e.actors[0].attack.move.startup-e.actors[0].attack.frame);return {key,scene:q.scene()};});
 check('the same real heavy counter input exposes its active jaw only after the source phase is unlocked',jawCounter.key==='guardCounter'&&jawCounter.scene.actors[0].sourceCue==='GUEULE OUVERTE · VERSUS',jawCounter);
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(75));
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position());await page.keyboard.press('h');
 const closedJaw=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,a=e.actors[0],before=a.health;
  for(let n=0;n<100&&a.health===before;n++)q.advance(1);const lost=before-a.health;q.advance(70);return {lost,scene:q.scene()};});
 check('the activated but idle Split Head still receives ordinary real bullet damage',closedJaw.lost>0&&closedJaw.scene.actors[0].sourceCue===null,closedJaw);
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position());await page.keyboard.press('h');
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(7));await page.keyboard.press('i');
 const mouth=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,a=e.actors[0],before=a.health;
  let exposed=false,exposureFrame=null;
  for(let n=0;n<80&&a.health===before;n++){
   exposed ||= e.sourceCombatCue(a)==='GUEULE OUVERTE · VERSUS';
   if(e.sourceCombatCue(a))exposureFrame={frame:a.attack.frame,start:a.attack.move.startup,end:a.attack.move.startup+a.attack.move.active};
   q.advance(1);
  }
  return {lost:before-a.health,exposed,exposureFrame,scene:q.scene()};});report.scenes.splitHeadMouth=mouth;
 check('real Split Head special exposes the readable versus cue only during its active mouth window',mouth.exposed&&mouth.exposureFrame?.frame>=mouth.exposureFrame?.start&&mouth.exposureFrame?.frame<mouth.exposureFrame?.end,mouth);
 check('a real frontal bullet into that active mouth causes extra damage',mouth.lost>closedJaw.lost*1.5,mouth);
 await capture(page,'08-split-head-mouth-hit');
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(90));
 check('the readable mouth cue disappears when the actual attack leaves its active window',await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene().actors[0].sourceCue===null));

 scene=await launch(page,'sh2_bubble_head_nurse_024','sh4_hummer_055');
 const hummerBefore=scene.actors[1].health;await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,580));
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(0));
 const hover=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());report.scenes.hummerHover=hover;
 check('the actual Hummer PNG starts at its normal hover offset without ground contact',hover.hummerDraw?.path.includes('sh4_hummer_055.')&&hover.hummerDraw.anchorOffsetY<0&&hover.actors[1].bodyBottom<594&&!hover.actors[1].groundContact,hover);
 await capture(page,'09a-hummer-hover-before-hit');
 await page.keyboard.press('j');
 const hummer=await page.evaluate(()=>{const q=__SOURCE_EXPANSION_QA__,a=__HALO_QA__.engine.actors[1],before=a.health;
  for(let n=0;n<65&&a.health===before;n++)q.advance(1);return q.scene();});report.scenes.hummerFall=hummer;
 check('one real ordinary melee hit downs the Hummer while leaving versus health and no invented abduction',hummer.actors[1].health<hummerBefore&&hummer.actors[1].health>0&&hummer.actors[1].knockdown>0&&hummer.emitted===0&&!hummer.actors[1].activeCommands.includes('throw')&&!hummer.actors[1].activeCommands.includes('backThrow'),hummer);
 check('the actual downed Hummer collision and PNG anchor both reach the floor without rotation or bitmap scaling',hummer.actors[1].bodyBottom===594&&hummer.actors[1].groundContact&&Math.abs(hummer.hummerDraw?.anchorOffsetY)<1e-8&&hummer.hummerDraw.path===hover.hummerDraw.path&&hummer.hummerDraw.width===hover.hummerDraw.width&&hummer.hummerDraw.height===hover.hummerDraw.height&&Math.abs(hummer.hummerDraw.matrix[1])<1e-8&&Math.abs(hummer.hummerDraw.matrix[2])<1e-8,hummer);
 await capture(page,'09-hummer-melee-knockdown');
 const recovered=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__;
  for(let n=0;n<120&&e.actors[1].knockdownTimer;n++)q.advance(1);return q.scene();});report.scenes.hummerRecovered=recovered;
 check('real Hummer recovery restores the same hover height without changing damage or fabricating a recovery clip',recovered.actors[1].knockdown===0&&!recovered.actors[1].groundContact&&Math.abs(recovered.actors[1].bodyBottom-hover.actors[1].bodyBottom)<1e-8&&Math.abs(recovered.hummerDraw?.anchorOffsetY-hover.hummerDraw.anchorOffsetY)<1e-8&&recovered.actors[1].health===hummer.actors[1].health&&recovered.actors[0].damage===hummer.actors[0].damage,recovered);

 scene=await launch(page,'sh4_wall_man_056');const wallBefore=scene.actors[1].health;
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,620));await page.keyboard.press('i');
 const claws=await page.evaluate(()=>{const q=__SOURCE_EXPANSION_QA__,b=__HALO_QA__.engine.actors[1],before=b.health;
  for(let n=0;n<65&&b.health===before;n++)q.advance(1);return q.scene();});report.scenes.wallClaws=claws;
 check('Wall Man real claw command knocks down without leaving its fixed support',claws.actors[0].x===500&&claws.actors[0].move==='neutralSpecial'&&claws.actors[1].health<wallBefore&&claws.actors[1].knockdown>0&&claws.emitted===0,claws);

 for(const id of ['sh4_sniffer_dog_male_053','sh4_sniffer_dog_female_054']){
  await launch(page,id);await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,580));await page.keyboard.press('i');
  const sniffer=await page.evaluate(()=>{const q=__SOURCE_EXPANSION_QA__,b=__HALO_QA__.engine.actors[1];
   for(let n=0;n<65&&b.status?.id!=='bind';n++)q.advance(1);return q.scene();});report.scenes[id+'Hold']=sniffer;
  check('real '+id+' biting hold catches and binds through local ground contact',sniffer.actors[0].move==='neutralSpecial'&&sniffer.actors[1].status?.id==='bind'&&sniffer.actors[1].damageTaken>0&&sniffer.actors[1].y===594&&sniffer.actors[1].grounded&&sniffer.actors[1].vx===0&&sniffer.emitted===0,sniffer);
 }
 await capture(page,'10-sniffer-biting-hold');

 for(const id of ['sh3_closer_036','sh3_closer_church_variant','sh4_twin_victim_059']){
  for(const side of [-1,1]){
   scene=await launch(page,id);const before=scene.actors[1].health;
   await page.evaluate(side=>{const q=__SOURCE_EXPANSION_QA__,e=__HALO_QA__.engine;q.position(600,600+side*145);
    e.actors[0].facing=1;e.actors[1].facing=-side;},side);
   if(id!=='sh4_twin_victim_059')await page.keyboard.down('ArrowDown');
   await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));
   if(id!=='sh4_twin_victim_059')await page.keyboard.up('ArrowDown');
   const sweep=await page.evaluate(()=>{const q=__SOURCE_EXPANSION_QA__,e=__HALO_QA__.engine,b=e.actors[1],before=b.health;
    for(let n=0;n<75&&b.health===before;n++)q.advance(1);
    return {scene:q.scene(),aura:e.actors[0].attack?.move.aura,projectile:e.actors[0].attack?.move.projectile};});
   report.scenes[id+'Sweep'+side]=sweep;
   check('real '+id+' arm rotation strikes '+(side<0?'behind':'ahead')+' without turning or creating an aura',sweep.scene.actors[0].move===(id==='sh4_twin_victim_059'?'neutralSpecial':'downSpecial')&&sweep.scene.actors[0].facing===1&&sweep.scene.actors[1].health<before&&Math.sign(sweep.scene.actors[1].vx)===side&&sweep.scene.emitted===0&&sweep.aura===false&&sweep.projectile===false,sweep);
   if(side<0&&id==='sh3_closer_036')await capture(page,'11-closer-rear-arm-contact');
   if(side<0&&id==='sh4_twin_victim_059')await capture(page,'12-twin-victim-rear-arm-contact');
  }
 }

 for(const id of ['sh3_double_head_040','sh1_romper_010','homecoming_lurker_085','homecoming_feral_086','sh4_twin_victim_059']){
  scene=await launch(page,id);const before=scene.actors[1].health;
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(400,650));
  await page.keyboard.down('ArrowRight');await page.keyboard.press('i');
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up('ArrowRight');
  const leap=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,[a,b]=e.actors,before=b.health;let highest=a.y;
   for(let n=0;n<85&&b.health===before;n++){q.advance(1);highest=Math.min(highest,a.y);}return {highest,scene:q.scene()};});
  report.scenes[id+'Leap']=leap;
  check('real '+id+' pursuit command leaps and reaches its opponent by physical contact',leap.highest<594&&leap.scene.actors[0].x>400&&leap.scene.actors[0].move==='forwardSpecial'&&leap.scene.actors[1].health<before&&leap.scene.emitted===0&&(!['sh1_romper_010','homecoming_lurker_085','homecoming_feral_086'].includes(id)||leap.scene.actors[1].knockdown>0),leap);
  if(id==='homecoming_feral_086')await capture(page,'13-feral-pounce-knockdown');
 }

 for(const id of ['sh3_double_head_040','sh1_romper_010','homecoming_feral_086']){
  await launch(page,id);await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,590));await page.keyboard.press('i');
  const hold=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,b=e.actors[1];
   for(let n=0;n<65&&b.status?.id!=='bind';n++)q.advance(1);return q.scene();});report.scenes[id+'SourceHold']=hold;
  check('real '+id+' source hold stays on the floor while its unattested rear throw remains blocked',hold.actors[0].move==='neutralSpecial'&&hold.actors[1].status?.id==='bind'&&hold.actors[1].damageTaken>0&&hold.actors[1].y===594&&hold.actors[1].grounded&&hold.actors[1].vx===0&&hold.emitted===0&&!hold.actors[0].activeCommands.includes('backThrow'),hold);
  if(id==='sh3_double_head_040')await capture(page,'14-double-head-leg-hold');
 }

 for(const id of ['sh3_double_head_040','sh1_romper_010','homecoming_feral_086','sh3_slurper_042','sh4_sniffer_dog_male_053','sh4_sniffer_dog_female_054']){
  scene=await launch(page,id);const before=scene.actors[1].health;
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,590));await page.keyboard.press('i');
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(6));await page.keyboard.press('z');
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));
  const jumping=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(70));const escaped=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
  report.scenes[id+'AirborneHoldRefusal']={jumping,escaped};
  check('real second-player jump prevents '+id+' ground hold without bind, damage or launch',jumping.actors[1].y<594&&!jumping.actors[1].grounded&&escaped.actors[0].move==='neutralSpecial'&&escaped.actors[1].health===before&&escaped.actors[1].status===null&&escaped.actors[0].damage===0&&escaped.emitted===0,{jumping,escaped});
 }

 scene=await launch(page,'sh4_patient_060','sh3_nurse_revolver_044');
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,600));await page.keyboard.press('i');
 const patient=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,[a,b]=e.actors,before=b.health;
  for(let n=0;n<100&&a.attack?.hitCount!==3;n++)q.advance(1);return {before,lost:before-b.health,scene:q.scene()};});report.scenes.patientChain=patient;
 check('Patient real special chains three actual club contacts without a projectile or replaced hit counter',patient.scene.actors[0].move==='neutralSpecial'&&patient.scene.actors[0].attackHits===3&&patient.scene.actors[0].combo===3&&patient.lost>0&&patient.scene.actors[0].damage===patient.lost&&patient.scene.emitted===0,patient);
 await capture(page,'15-patient-three-contacts');
 await launch(page,'sh4_patient_060','sh3_nurse_revolver_044');
 await page.evaluate(()=>{__SOURCE_EXPANSION_QA__.position(500,355);__SOURCE_EXPANSION_QA__.positionActor(0,500,1);});
 await page.keyboard.down('ArrowLeft');await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up('ArrowLeft');
 const pivot=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,b=e.actors[1],before=b.health;
  for(let n=0;n<70&&b.health===before;n++)q.advance(1);return {before,scene:q.scene()};});report.scenes.patientPivot=pivot;
 check('Patient real back-special pivot reaches behind without turning or inventing an aura',pivot.scene.actors[0].move==='backSpecial'&&pivot.scene.actors[0].facing===1&&pivot.scene.actors[1].health<pivot.before&&pivot.scene.actors[1].vx<0&&pivot.scene.emitted===0&&pivot.scene.actors[0].attackShape?.aura===false&&pivot.scene.actors[0].attackShape?.projectile===false&&pivot.scene.actors[0].attackShape?.invulnFrames===0,pivot);
 await capture(page,'16-patient-rear-pivot');

 await launch(page,'sh4_bottom_065');await page.evaluate(()=>{__SOURCE_EXPANSION_QA__.position(500,355);__SOURCE_EXPANSION_QA__.positionActor(0,500,1);});await page.keyboard.press('i');
 const bottomRotation=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,b=e.actors[1],before=b.health;
  for(let n=0;n<70&&b.health===before;n++)q.advance(1);return {before,scene:q.scene()};});report.scenes.bottomRotation=bottomRotation;
 check('Bottom real arm rotation strikes behind with physical outward knockback',bottomRotation.scene.actors[0].move==='neutralSpecial'&&bottomRotation.scene.actors[0].facing===1&&bottomRotation.scene.actors[1].health<bottomRotation.before&&bottomRotation.scene.actors[1].vx<0&&bottomRotation.scene.emitted===0&&bottomRotation.scene.actors[0].attackShape?.aura===false&&bottomRotation.scene.actors[0].attackShape?.projectile===false,bottomRotation);
 await capture(page,'17-bottom-arm-rotation');
 await launch(page,'sh4_bottom_065');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(400,650));
 await page.keyboard.down('ArrowRight');await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up('ArrowRight');
 const bottomDive=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,[a,b]=e.actors,before=b.health;let highest=a.y;
  for(let n=0;n<85&&b.health===before;n++){q.advance(1);highest=Math.min(highest,a.y);}return {before,highest,scene:q.scene()};});report.scenes.bottomDive=bottomDive;
 check('Bottom real pursuit dive leaves the floor and reaches the target without a summoned body',bottomDive.highest<594&&bottomDive.scene.actors[0].x>400&&bottomDive.scene.actors[0].move==='forwardSpecial'&&bottomDive.scene.actors[1].health<bottomDive.before&&bottomDive.scene.actors.length===2&&bottomDive.scene.emitted===0,bottomDive);
 await capture(page,'18-bottom-pursuit-dive');

 const asphyxiaDamage={};
 for(const rear of [false,true]){
  await launch(page,'sh3_nurse_revolver_044','homecoming_asphyxia_096');await page.keyboard.press('i');
  const shot=await page.evaluate(rear=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,[a,b]=e.actors,before=b.health;
   q.advance(a.profile.moves.neutralSpecial.startup+1);const inFlight=e.projectiles.length;if(rear)q.positionActor(0,1100);
   for(let n=0;n<100&&b.health===before;n++)q.advance(1);return {inFlight,lost:before-b.health,scene:q.scene()};},rear);
  asphyxiaDamage[rear?'rear':'front']=shot;
  check('Asphyxia '+(rear?'rear':'front')+' scene receives a real revolver projectile after normal startup',shot.inFlight===1&&shot.lost>0&&shot.scene.emitted===1&&shot.scene.actors[0].damage===shot.lost&&shot.scene.actors[1].damageTaken===shot.lost&&shot.scene.actors[1].facing===(rear?1:-1),shot);
 }
 report.scenes.asphyxiaResistance=asphyxiaDamage;
 check('Asphyxia frontal armor reduces actual bullet health loss to the authored .45 scale without immunity',asphyxiaDamage.front.lost>0&&Math.abs(asphyxiaDamage.front.lost-asphyxiaDamage.rear.lost*.45)<=1,asphyxiaDamage);
 await capture(page,'19-asphyxia-rear-bullet');

 const recoveryDamage={};
 for(const id of ['homecoming_scarlet_spider_form_095','homecoming_amnion_exposed_form_098']){
  await launch(page,id,'sh3_nurse_revolver_044');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(300,1100));
  await page.keyboard.down('ArrowRight');await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up('ArrowRight');
  const missed=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,[a,b]=e.actors,before=b.health;
   for(let n=0;n<120&&!e.sourceCombatCue(a);n++)q.advance(1);return {before,scene:q.scene()};});report.scenes[id+'MissedRecovery']=missed;
  const expectedCue=id==='homecoming_scarlet_spider_form_095'?'DOS EXPOSÉ · VERSUS':'CORPS EXPOSÉ · VERSUS';
  check(id+': actual missed forward special exposes only its native recovery window',missed.scene.actors[0].move==='forwardSpecial'&&missed.scene.actors[0].attackHits===0&&missed.scene.actors[0].sourceCue===expectedCue&&missed.scene.actors[0].attackFrame>=missed.scene.actors[0].attackTiming.startup+missed.scene.actors[0].attackTiming.active&&missed.scene.actors[1].health===missed.before,missed);
  await page.click('#pauseBtn');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(11));const frozen=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
  check(id+': real pause freezes the actual missed-attack clock and its exposure cue',frozen.paused&&frozen.actors[0].attackFrame===missed.scene.actors[0].attackFrame&&frozen.actors[0].sourceCue===expectedCue,frozen);
  await page.click('[data-pause=resume]');await capture(page,id==='homecoming_scarlet_spider_form_095'?'20-scarlet-real-miss-exposure':'21-amnion-real-miss-exposure');
  const recovered=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,a=e.actors[0];for(let n=0;n<120&&a.attack;n++)q.advance(1);return q.scene();});
  check(id+': exposure closes with the actual attack instead of a detached timer',recovered.actors[0].attackFrame===null&&recovered.actors[0].sourceCue===null&&recovered.actors[1].health===missed.before,recovered);
  for(const rear of [false,true]){
   await launch(page,id,'sh3_nurse_revolver_044');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(300,1100));
   await page.keyboard.down('ArrowRight');await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up('ArrowRight');
   await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__;for(let n=0;n<120&&!e.sourceCombatCue(e.actors[0]);n++)q.advance(1);});
   await page.evaluate(rear=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,a=e.actors[0];q.positionActor(1,a.x+(rear?-170:170),rear?1:-1);},rear);
   await page.keyboard.press('h');
   const hit=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,a=e.actors[0],before=a.health;let collision=null;
    for(let n=0;n<80&&a.health===before;n++){collision={cue:e.sourceCombatCue(a),frame:a.attack?.frame,hits:a.attack?.hitCount};q.advance(1);}return {lost:before-a.health,collision,scene:q.scene()};});
   recoveryDamage[id]??={};recoveryDamage[id][rear?'rear':'front']=hit;
   check(id+': real '+(rear?'rear':'front')+' counter-shot reaches the body during the unmodified recovery',hit.lost>0&&hit.collision?.cue===expectedCue&&hit.collision?.hits===0&&hit.scene.emitted===1,hit);
  }
 }
 report.scenes.recoveryDirectionalDamage=recoveryDamage;
 check('Scarlet missed-pounce bonus applies to real rear hits while exposed Amnion also admits a direct body hit',recoveryDamage.homecoming_scarlet_spider_form_095.rear.lost>=recoveryDamage.homecoming_scarlet_spider_form_095.front.lost*1.8&&Math.abs(recoveryDamage.homecoming_amnion_exposed_form_098.rear.lost-recoveryDamage.homecoming_amnion_exposed_form_098.front.lost)<=1,recoveryDamage);

 for(const id of ['homecoming_scarlet_spider_form_095','homecoming_amnion_exposed_form_098']){
  await launch(page,id,'sh3_nurse_revolver_044');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,650));
  await page.keyboard.down('ArrowRight');await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up('ArrowRight');
  const landed=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,[a,b]=e.actors,before=b.health;
   for(let n=0;n<150&&a.attack&&a.attack.frame<a.attack.move.startup+a.attack.move.active;n++)q.advance(1);return {before,scene:q.scene()};});report.scenes[id+'LandedNoExposure']=landed;
  check(id+': a successfully landed attack grants no free missed-attack exposure',landed.scene.actors[1].health<landed.before&&landed.scene.actors[0].attackHits>0&&landed.scene.actors[0].sourceCue===null,landed);
 }
 for(const id of ['homecoming_amnion_hanging_form_097','homecoming_amnion_exposed_form_098']){
  await launch(page,id,'sh3_nurse_revolver_044');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(300,1100));
  await page.keyboard.down('ArrowUp');await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up('ArrowUp');
  const groundedAmnion=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());report.scenes[id+'JumpRefusal']=groundedAmnion;
  check(id+': real combined jump-special stays grounded and uses only its own spray',groundedAmnion.actors[0].y===594&&groundedAmnion.actors[0].grounded&&groundedAmnion.actors[0].move==='neutralSpecial'&&!groundedAmnion.actors[0].activeCommands.includes('airSpecial')&&(id!=='homecoming_amnion_hanging_form_097'||!groundedAmnion.actors[0].activeCommands.includes('throw'))&&groundedAmnion.actors[0].sourceCue===null,groundedAmnion);
 }
 await launch(page,'homecoming_amnion_hanging_form_097','sh3_nurse_revolver_044');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(300,1100));
 await page.keyboard.down('ArrowRight');await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up('ArrowRight');
 const hangingMiss=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,a=e.actors[0];let cue=false,highest=a.y;for(let n=0;n<90;n++){q.advance(1);cue||=!!e.sourceCombatCue(a);highest=Math.min(highest,a.y);}return {cue,highest,scene:q.scene()};});report.scenes.amnionHangingNoExposure=hangingMiss;
 check('first-form Amnion missed front swing never borrows second-form body exposure or a leap',!hangingMiss.cue&&hangingMiss.highest===594&&hangingMiss.scene.actors[0].move==='forwardSpecial',hangingMiss);
 await capture(page,'22-amnion-first-form-grounded');

 await launch(page,'sh4_cynthia_velasquez_victim_16','sh3_nurse_revolver_044');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,590));await page.keyboard.press('i');
 const hair=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,b=e.actors[1];for(let n=0;n<90&&b.status?.bindingOrigin?.id!=='sh4_cynthia_velasquez_victim_16';n++)q.advance(1);return q.scene();});report.scenes.cynthiaStandingHair=hair;
 check('Cynthia real hair capture binds the victim standing without a generic throw or knockdown',hair.actors[1].status?.bindingOrigin?.id==='sh4_cynthia_velasquez_victim_16'&&hair.actors[1].y===594&&hair.actors[1].grounded&&hair.actors[1].knockdown===0&&hair.actors[1].vx===0&&hair.actors[1].vy===0&&hair.emitted===0,hair);
 await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__;for(let n=0;n<80&&e.actors[1].hurtFrames;n++)q.advance(1);});
 const bound=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());await page.keyboard.down('d');await page.keyboard.press('z');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up('d');
 const restrictedHair=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
 check('Cynthia actual held victim cannot run or jump out but retains a standing source-owned binding',restrictedHair.actors[1].x===bound.actors[1].x&&restrictedHair.actors[1].y===594&&restrictedHair.actors[1].grounded&&restrictedHair.actors[1].status?.bindingOrigin?.id==='sh4_cynthia_velasquez_victim_16',restrictedHair);
 await capture(page,'23-cynthia-standing-hair-hold');await page.keyboard.press('h');
 const hairCounter=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,a=e.actors[0],before=a.health;for(let n=0;n<80&&a.health===before;n++)q.advance(1);return {before,scene:q.scene()};});report.scenes.cynthiaCounterRelease=hairCounter;
 check('the actually held victim fires its own real revolver and breaks Cynthia hair only after dealing damage',hairCounter.scene.actors[1].move==='neutralSpecial'&&hairCounter.scene.actors[0].health<hairCounter.before&&hairCounter.scene.actors[1].damage>0&&hairCounter.scene.actors[1].status===null&&hairCounter.scene.texts.includes('CHEVEUX ROMPUS')&&hairCounter.scene.emitted===1,hairCounter);
 await capture(page,'24-cynthia-real-counter-release');

 for(const jump of [false,true]){
  await launch(page,'downpour_bogeyman_115','sh3_nurse_revolver_044');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(300,650));await page.keyboard.press('i');
  const wave=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,b=e.actors[1],before=b.health;for(let n=0;n<60&&!e.projectiles.length;n++)q.advance(1);return {before,scene:q.scene()};});
  const p=wave.scene.projectileStates[0];check('Bogeyman '+(jump?'jump':'ground')+' scene emits its existing non-firearm wave exactly on the floor',wave.scene.emitted===1&&p?.ownerId==='downpour_bogeyman_115'&&p.y+p.radius===594&&p.y===p.groundY&&p.vy===0&&p.gravity===0&&p.firearm===false,wave);
  await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(12));if(jump){await page.keyboard.press('z');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await capture(page,'25-bogeyman-wave-real-jump');}else await capture(page,'26-bogeyman-ground-wave');
  const crossed=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,b=e.actors[1];let highest=b.y,stable=true;
   for(let n=0;n<70;n++){q.advance(1);highest=Math.min(highest,b.y);stable&&=e.projectiles.every(p=>p.y===p.groundY&&p.vy===0&&p.gravity===0);}return {highest,stable,scene:q.scene()};});report.scenes[jump?'bogeymanWaveJump':'bogeymanWaveGround']={wave,crossed};
  check('Bogeyman wave '+(jump?'is cleared by the actual timed jump without damage or rewards':'hits an actually grounded target with matching combat records'),crossed.stable&&(jump?crossed.highest<594&&crossed.scene.actors[1].health===wave.before&&crossed.scene.actors[0].damage===0:crossed.scene.actors[1].health<wave.before&&crossed.scene.actors[0].damage===wave.before-crossed.scene.actors[1].health),{wave,crossed});
 }


 for(const id of ['sh1_grey_child_005','sh1_mumbler_006','sh1_stalker_008','sh2_abstract_daddy_028']){
  await launch(page,id,'sh3_nurse_revolver_044');
  await page.evaluate(daddy=>__SOURCE_EXPANSION_QA__.position(500,daddy?610:575),id==='sh2_abstract_daddy_028');
  await page.keyboard.press('i');
  const grip=await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__SOURCE_EXPANSION_QA__,victim=e.actors[1];
   for(let n=0;n<80&&!victim.status?.struggleOrigin;n++)q.advance(1);while(e.hitstop>0)q.advance(1);return q.scene();});
  report.scenes[id+'StandingGrip']=grip;
  check(id+' actual attack catches a grounded standing target without a generic lift or floor pin',grip.actors[1].status?.struggleOrigin?.id===id&&grip.actors[1].grounded&&grip.actors[1].y===594&&grip.actors[1].vx===0&&grip.actors[1].vy===0&&grip.actors[1].knockdown===0&&grip.actors[0].damage>0&&grip.emitted===0,grip);
  await page.keyboard.down('q');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(8));await page.keyboard.up('q');
  const held=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
  check(id+' held direction counts only one real transition and its readable cue remains visible',held.actors[1].status?.struggleOrigin?.progress===1&&/DÉGAGEMENT.*1\/6/.test(held.actors[1].sourceCue)&&held.actors[1].health===grip.actors[1].health,held);
  if(id==='sh1_mumbler_006'){
   await page.click('#pauseBtn');const before=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(20));
   const after=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
   check('real pause freezes both the new grip countdown and accumulated escape transitions',after.paused&&after.actors[1].status.timer===before.actors[1].status.timer&&after.actors[1].status.struggleOrigin.progress===before.actors[1].status.struggleOrigin.progress,{before,after});
   await page.click('[data-pause=resume]');
  }
  await capture(page,'27-'+id+'-standing-grip');
  for(const key of ['d','q','d','q','d']){await page.keyboard.down(key);await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(1));await page.keyboard.up(key);}
  const released=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());report.scenes[id+'RealDirectionalEscape']=released;
  check(id+' six actual alternating keyboard controls release the grip without fabricated extra damage',released.actors[1].status===null&&released.texts.includes('PRISE ROMPUE')&&released.actors[1].health===grip.actors[1].health&&released.actors[0].damage===grip.actors[0].damage&&released.emitted===0,released);
 }

 await launch(page,'sh3_nurse_revolver_044','sh2_abstract_daddy_028');
 await page.evaluate(()=>{__SOURCE_EXPANSION_QA__.position(300,650);const a=__HALO_QA__.engine.actors[1];a.knockdownTimer=120;a.state='knockdown';});
 const daddyBefore=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());await page.keyboard.press('i');
 const downedDaddy=await page.evaluate(()=>{const q=__SOURCE_EXPANSION_QA__;let rejected=false;for(let n=0;n<80;n++){q.advance(1);rejected ||= q.scene().texts.includes('TIRS SANS EFFET À TERRE');}return {rejected,scene:q.scene()};});report.scenes.abstractDaddyDownedFirearm=downedDaddy;
 check('real revolver collision cannot damage the downed Labyrinth boss or grant meter and combat credit',downedDaddy.rejected&&downedDaddy.scene.emitted===1&&downedDaddy.scene.projectiles===0&&downedDaddy.scene.actors[1].health===daddyBefore.actors[1].health&&downedDaddy.scene.actors[1].meter===daddyBefore.actors[1].meter&&downedDaddy.scene.actors[0].damage===0,downedDaddy);
 await capture(page,'28-abstract-daddy-downed-shot');
 await launch(page,'sh3_nurse_revolver_044','sh2_abstract_daddy_028');const standingDaddyBefore=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());
 await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(80));scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());report.scenes.abstractDaddyStandingFirearm=scene;
 check('standing Labyrinth Daddy stays vulnerable to the same actual firearm class',scene.emitted===1&&scene.actors[1].health<standingDaddyBefore.actors[1].health&&scene.actors[0].damage>0,scene);

 await launch(page,'sh1_hanged_scratcher_011','sh3_nurse_revolver_044');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.position(500,635));
 const clawBefore=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());await page.keyboard.press('ArrowUp');await page.keyboard.press('i');
 await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(40));scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());report.scenes.hangedScratcherGroundClaws=scene;
 check('Hanged Scratcher ground claw input hits without pretending a free jump attaches to a ceiling',scene.actors[0].move==='neutralSpecial'&&scene.actors[0].y===594&&scene.actors[0].grounded&&scene.actors[1].health<clawBefore.actors[1].health&&scene.emitted===0,scene);
 check('Hanged Scratcher native catalogue blocks unsupported grabs and airborne ceiling substitutes',!['throw','backThrow','airLight','airHeavy','airSpecial'].some(key=>scene.actors[0].activeCommands.includes(key)),scene.actors[0]);
 await capture(page,'29-hanged-scratcher-ground-claws');

 await launch(page,'sh3_nurse_revolver_044','sh3_scraper_045');const scraperBefore=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());await page.keyboard.press('i');
 const scraperDeflection=await page.evaluate(()=>{const q=__SOURCE_EXPANSION_QA__;let deflected=false;for(let n=0;n<80;n++){q.advance(1);deflected ||= q.scene().texts.includes('TIR DÉVIÉ');}return {deflected,scene:q.scene()};});report.scenes.scraperOwnHandgunDefense=scraperDeflection;
 check('Scraper own source-sensitive blades deflect a real visible handgun without chip or automatic counter',scraperDeflection.deflected&&scraperDeflection.scene.emitted===1&&scraperDeflection.scene.actors[1].health===scraperBefore.actors[1].health&&scraperDeflection.scene.actors[0].damage===0&&scraperDeflection.scene.actors[1].meter===0,scraperDeflection);
 await launch(page,'arcade_robbie_the_rabbit_shotgun','sh3_scraper_045');const scraperShotgunBefore=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());await page.keyboard.press('i');await page.evaluate(()=>__SOURCE_EXPANSION_QA__.advance(80));scene=await page.evaluate(()=>__SOURCE_EXPANSION_QA__.scene());report.scenes.scraperShotgunException=scene;
 check('Scraper handgun-only defense leaves a real shotgun projectile effective',scene.emitted>=1&&scene.actors[1].health<scraperShotgunBefore.actors[1].health&&scene.actors[0].damage>0,scene);
 await capture(page,'30-scraper-shotgun-exception');

 for(const id of ['shortmessage_sakura_head_150','shattered_raw_shock_base_099','shattered_raw_shock_feminine_100',
  'shattered_raw_shock_diseased_101','shattered_raw_shock_abstract_102','shattered_raw_shock_atrophied_103','homecoming_bogeyman_092']){
  await page.goto(base+`/modules/unified-versus.html?qa=1&debugArt=1&p1=${id}`);
  await page.waitForFunction(()=>!!window.__HALO_QA__);await page.selectOption('#mode','local');await page.check('#artDiagnostic');
  await page.click('#launch');await page.waitForSelector('#playStatus:not(.hidden)');
  const denied=await page.evaluate(()=>({engine:!!__HALO_QA__.engine,message:document.querySelector('#playStatus').textContent}));
  report.scenes[id+'Refusal']=denied;
  check('normal '+id+' launch refuses to invent an autonomous duel',!denied.engine&&/rôle non combattant|identité à confirmer/.test(denied.message),denied);
  await page.click('#fighterDossier');const dossier=page.locator('[data-reference-id="'+id+'"]');
  check('refused '+id+' remains documented with all twenty duel commands disabled',await dossier.isVisible()&&/0\/20 commandes actives/.test(await dossier.textContent())&&await page.locator('.move-unavailable').count()===20);
 }
 check('no unhandled JavaScript exceptions',report.errors.length===0,report.errors);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{
 report.passed=!report.failure&&!report.errors.length;
 await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 await context?.close();await browser?.close();server?.kill('SIGTERM');
}
