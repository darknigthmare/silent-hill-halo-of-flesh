/** Real HTTP/UI around prepared combat scenes; no campaign or source animation is certified. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VERSION} from '../src/data.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=resolve(root,'tests/http-reference-integration');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4182';
const sourceTree=process.env.QA_SOURCE_TREE==='1';
const versus=base+'/modules/unified-versus.html?qa=1&debugArt=1';
const report={version:VERSION,base,build:process.env.QA_BASE_URL?'external HTTP':sourceTree?'source tree':'dist',checks:[],errors:[],captures:[],scenes:{},fixtures:[
 'The explicit ?qa=1 bridge stops the animation loop and advances actual simulation ticks after the real launch button. Positions and one hit/collision are prepared; these are regression scenes, not a played campaign.',
 'The explicit art diagnostic is enabled for subjects without imported PNGs. Existing candidate images remain unchanged; no diagnostic shape is counted as produced artwork.',
 'Cybil fires ten accepted shots toward a distant opponent before an eleventh input resolves to the unarmed contact move. Actual emitted projectiles are counted, including hits and misses. No ammunition, health or move definition is injected.',
 'A separate real keyboard-fired Cybil bullet hits a prepared stationary target and must knock it down. Source attack 63 attests the reaction; the versus damage and recovery duration are not source measurements.',
 'Alessa receives prepared damage through the normal damage path to exhaust each versus phase budget. Her source weapon order is exercised through recovery, pause and keyboard input; the quarter-health budgets, burst cadence and recovery ticks are adaptations, not measured original animations.',
 'Missionary receives real keyboard-fired revolver bullets. A prepared shooter crossing lets an existing bullet approach its back; a separate knockdown fixture checks the documented vulnerability. No source timing or silenced weapon is claimed.',
 'Incubator stays idle while real directional input approaches its local passive field. Knockdown behavior and blue/red lightning hues are sourced; radius, damage, cooldown, recovery and exact RGB values are versus choices. Incubus does not inherit the field.',
 'Split Worm receives the real crouch-special input against a prepared one-HP target. Its source ground pound staggers without health damage; local range, 18-tick stagger and crouch guard are versus rules. Shell resistance and tunnel travel are not certified by this scene.',
 'A valid local checkpoint is prepared solely to verify that a refused noncombatant contact cannot overwrite progression or records.',
 'Browser keyboard input and a narrow viewport do not certify a physical controller or mobile device. Missing contextual clips must remain visibly missing.'
]};
let server,browser;
function check(name,passed,detail){
 report.checks.push({name,passed:!!passed,...(!passed&&detail!==undefined?{detail}:{})});
 if(!passed)throw Error(name);
}
async function shot(page,name){
 await page.screenshot({path:resolve(out,name+'.png'),fullPage:false});report.captures.push(name+'.png');
}
async function quiet(page){
 for(const id of ['stageHazards','stageDirector','otherworldShift','stageFatalities','fatalities','stageTerrain'])await page.uncheck('#'+id);
 await page.check('#artDiagnostic');
}
async function launch(page,p1,p2='film_red_pyramid_film_175'){
 await page.goto(`${versus}&p1=${p1}&p2=${p2}`);await page.waitForFunction(()=>!!window.__HALO_QA__);
 await page.selectOption('#mode','local');await quiet(page);await page.click('#launch');
 await page.waitForFunction(()=>!!__HALO_QA__.engine);
 return page.evaluate(()=>{
  const e=__HALO_QA__.engine;e.running=false;e.togglePause(false);
  const ticks=e.phase==='intro'?e.phaseTimer:0;for(let i=0;i<ticks;i++)e.update();
  e.clearInputs();e.hitstop=0;
  const q=window.__REFERENCE_QA__={};
  q.advance=count=>{for(let i=0;i<count;i++)e.update();e.render(performance.now());};
  q.scene=()=>({phase:e.phase,frame:e.frame,paused:e.paused,time:e.matchTime,projectiles:e.projectiles.length,
   actors:e.actors.map(a=>({id:a.data.id,x:a.x,y:a.y,grounded:a.grounded,health:a.health,meter:a.meter,ammo:a.ammo,
    move:a.attack?.key||a.lastMoveKey,activeMove:a.attack?.move?.name||null,presentation:a.presentation?{...a.presentation}:null,
    damage:a.stats.damageDealt,policy:a.profile.referencePolicy||a.profile.moveset.referencePolicy}))});
  q.position=(left=260,right=1100)=>{e.actors.forEach((a,i)=>{a.x=i?right:left;a.y=594;a.vx=0;a.vy=0;a.grounded=true;a.facing=i?-1:1;a.attack=null;a.hurtFrames=0;a.phaseLock=0;a.invuln=0;});e.hitstop=0;e.clearInputs();};
  q.position();return q.scene();
 });
}

await mkdir(out,{recursive:true});
try{
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4182',...(sourceTree?[]:['--dist'])],{cwd:root,stdio:'ignore'});
 let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 check('static HTTP server ready',ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());

 let scene=await launch(page,'sh1_air_screamer_001');
 check('real launch loads the current reference-constrained profile',scene.phase==='fight'&&scene.actors[0].policy.capabilities.reviewed&&!scene.actors[0].policy.capabilities.projectile,scene);
 const farHealth=scene.actors[1].health;
 await page.keyboard.press('i');await page.evaluate(()=>__REFERENCE_QA__.advance(65));scene=await page.evaluate(()=>__REFERENCE_QA__.scene());
 check('Air Screamer keyboard special cannot damage a distant opponent or spawn a projectile',scene.actors[0].move==='neutralSpecial'&&scene.projectiles===0&&scene.actors[1].health===farHealth&&scene.actors[0].damage===0,scene);
 await page.evaluate(()=>__REFERENCE_QA__.position(440,555));await page.keyboard.press('i');
 await page.evaluate(()=>__REFERENCE_QA__.advance(23));scene=await page.evaluate(()=>__REFERENCE_QA__.scene());report.scenes.airScreamer=scene;
 check('the same Air Screamer input hits at contact with its moving physical attack',scene.projectiles===0&&scene.actors[1].health<farHealth&&scene.actors[0].damage>0&&scene.actors[0].x>440,scene);
 await shot(page,'01-air-screamer-contact');

 await launch(page,'sh2_mannequin_022');
 const mannequin=await page.evaluate(()=>{
  const e=__HALO_QA__.engine,a=e.actors[0],q=__REFERENCE_QA__,start=a.x;
  const accepted=e.beginAttack(a,'forwardLight');q.advance(12);
  return {accepted,start,end:a.x,target:e.actors[1].x,teleported:a.attack?.teleported,moveTeleport:a.profile.moves.forwardLight.teleport,projectiles:e.projectiles.length};
 });report.scenes.mannequin=mannequin;
 check('Mannequin forward light travels locally instead of crossing behind a distant target',mannequin.accepted&&!mannequin.moveTeleport&&!mannequin.teleported&&mannequin.end>mannequin.start&&mannequin.end-mannequin.start<100&&mannequin.end<mannequin.target-400&&mannequin.projectiles===0,mannequin);

 await launch(page,'sh1_monster_cybil_017','sh3_nurse_revolver_044');
 const cybilBefore=await page.evaluate(()=>{__REFERENCE_QA__.position(300,650);return __HALO_QA__.engine.actors[1].health;});
 await page.keyboard.press('i');
 const cybilShot=await page.evaluate(()=>{
  const e=__HALO_QA__.engine,q=__REFERENCE_QA__,[a,b]=e.actors,before=b.health;
  for(let tick=0;tick<120&&b.health===before;tick++)q.advance(1);
  return {health:b.health,knockdown:b.knockdownTimer,state:b.state,ammo:a.ammo,discarded:a.weaponDiscarded,
   projectiles:e.projectiles.length,damage:a.stats.damageDealt};
 });report.scenes.cybilShotKnockdown=cybilShot;
 check('a real Cybil pistol bullet knocks the target down while consuming exactly one of her ten shots',cybilShot.health<cybilBefore&&cybilShot.knockdown>0&&cybilShot.state==='knockdown'&&cybilShot.ammo===9&&!cybilShot.discarded&&cybilShot.projectiles===0&&cybilShot.damage>0,cybilShot);

 await launch(page,'sh1_monster_cybil_017');
 const ammunition=await page.evaluate(()=>{
  const e=__HALO_QA__.engine,q=__REFERENCE_QA__,a=e.actors[0],counts=[],accepted=[];
  let emitted=0;const spawn=e.spawnProjectile;
  e.spawnProjectile=function(...args){const before=this.projectiles.length;const result=spawn.apply(this,args);emitted+=this.projectiles.length-before;return result;};
  const initial=a.ammo;
  for(let i=0;i<10;i++){
   accepted.push(e.beginAttack(a,'neutralSpecial'));q.advance(a.profile.moves.neutralSpecial.startup+a.profile.moves.neutralSpecial.active+a.profile.moves.neutralSpecial.recovery+4);counts.push(a.ammo);
  }
  const eleventh=e.beginAttack(a,'neutralSpecial'),fallback=a.attack?.move;
  q.advance((fallback?.startup||0)+2);e.spawnProjectile=spawn;
  return {initial,accepted,counts,emitted,eleventh,remaining:a.ammo,phase:e.phase,
   fallback:{name:fallback?.name,projectile:fallback?.projectile,level:fallback?.level,reach:fallback?.reach},scene:q.scene()};
 });report.scenes.cybil=ammunition;
 check('Cybil accepts and emits exactly ten pistol shots while ammunition reaches zero',ammunition.initial===10&&ammunition.accepted.every(Boolean)&&ammunition.counts.every((n,i)=>n===9-i)&&ammunition.emitted===10,ammunition);
 check('the eleventh Cybil input becomes a short unarmed grab without an eleventh projectile',ammunition.eleventh&&ammunition.remaining===0&&!ammunition.fallback.projectile&&ammunition.fallback.level==='throw'&&ammunition.fallback.reach<100&&ammunition.phase==='fight',ammunition);
 await page.evaluate(()=>{window.__RETIRED_REFERENCE_ENGINE__=__HALO_QA__.engine;});await page.click('#pauseBtn');await page.click('[data-pause=retry]');
 await page.waitForFunction(()=>__HALO_QA__.engine!==__RETIRED_REFERENCE_ENGINE__);
 check('real retry resets the encounter pistol and retires the exhausted engine',await page.evaluate(()=>__RETIRED_REFERENCE_ENGINE__.destroyed&&__HALO_QA__.engine.actors[0].ammo===10));

 await launch(page,'sh3_memory_of_alessa_049');
 await page.evaluate(()=>{
  const q=__REFERENCE_QA__,e=__HALO_QA__.engine,a=e.actors[0];
  q.phaseEmitted=0;const spawn=e.spawnProjectile;
  e.spawnProjectile=function(...args){const before=this.projectiles.length;const result=spawn.apply(this,args);if(args[0]===a)q.phaseEmitted+=this.projectiles.length-before;return result;};
  q.finishWeaponRecovery=()=>{for(let tick=0;tick<240&&(a.weaponTransition||a.phaseLock>0);tick++)q.advance(1);};
 });
 await page.keyboard.press('i');await page.evaluate(()=>__REFERENCE_QA__.advance(1));
 const knife=await page.evaluate(()=>{const a=__HALO_QA__.engine.actors[0];return {phase:a.weaponPhaseIndex,weapon:a.attack?.move.weaponPhaseId,projectile:a.attack?.move.projectile};});
 check('Alessa starts with the knife and real special input remains a contact attack',knife.phase===0&&knife.weapon==='knife'&&knife.projectile===false,knife);
 const recovery=await page.evaluate(()=>{
  const e=__HALO_QA__.engine,q=__REFERENCE_QA__,a=e.actors[0];q.advance(70);
  const max=a.maxHealth;e.applyStatusDamage(a,max*10);q.advance(1);
  const before=e.snapshot().p1.weaponPhase;e.togglePause(true);q.advance(45);
  const frozen=JSON.stringify(e.snapshot().p1.weaponPhase)===JSON.stringify(before);
  e.togglePause(false);q.finishWeaponRecovery();
  return {before,frozen,after:e.snapshot().p1.weaponPhase,health:a.health,expected:Math.ceil(max*.75)};
 });report.scenes.alessaRecovery=recovery;
 check('Alessa exhausts only the knife budget, freezes weapon recovery on pause and then equips the handgun',recovery.before.id==='knife'&&recovery.before.transition?.to==='handgun'&&recovery.frozen&&recovery.after.id==='handgun'&&recovery.health===recovery.expected,recovery);
 await page.evaluate(()=>{__REFERENCE_QA__.phaseEmitted=0;});
 await page.keyboard.press('i');await page.evaluate(()=>__REFERENCE_QA__.advance(70));
 const handgun=await page.evaluate(()=>({phase:__HALO_QA__.engine.snapshot().p1.weaponPhase.id,emitted:__REFERENCE_QA__.phaseEmitted}));
 check('the handgun phase emits one real bullet without borrowing the SMG burst',handgun.phase==='handgun'&&handgun.emitted===1,handgun);
 await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__REFERENCE_QA__,a=e.actors[0];e.applyStatusDamage(a,a.maxHealth*10);q.advance(1);q.finishWeaponRecovery();q.phaseEmitted=0;});
 await page.keyboard.press('i');await page.evaluate(()=>__REFERENCE_QA__.advance(1));
 const pipe=await page.evaluate(()=>{const e=__HALO_QA__.engine,a=e.actors[0];return {phase:e.snapshot().p1.weaponPhase.id,weapon:a.attack?.move.weaponPhaseId,projectile:a.attack?.move.projectile,emitted:__REFERENCE_QA__.phaseEmitted};});
 check('the third phase equips the pipe and returns real input to contact without a firearm',pipe.phase==='pipe'&&pipe.weapon==='pipe'&&pipe.projectile===false&&pipe.emitted===0,pipe);
 await page.evaluate(()=>{const e=__HALO_QA__.engine,q=__REFERENCE_QA__,a=e.actors[0];q.advance(70);e.applyStatusDamage(a,a.maxHealth*10);q.advance(1);q.finishWeaponRecovery();q.phaseEmitted=0;});
 await page.keyboard.press('i');await page.evaluate(()=>__REFERENCE_QA__.advance(70));
 const smg=await page.evaluate(()=>({phase:__HALO_QA__.engine.snapshot().p1.weaponPhase.id,emitted:__REFERENCE_QA__.phaseEmitted,health:__HALO_QA__.engine.actors[0].health}));report.scenes.alessaSmg=smg;
 check('Alessa reaches the final SMG form and emits a three-bullet burst through actual keyboard input',smg.phase==='smg'&&smg.emitted===3&&smg.health>0,smg);
 await shot(page,'06-alessa-weapon-phases');
 await page.evaluate(()=>{window.__RETIRED_ALESSA_ENGINE__=__HALO_QA__.engine;});await page.click('#pauseBtn');await page.click('[data-pause=retry]');
 await page.waitForFunction(()=>__HALO_QA__.engine!==__RETIRED_ALESSA_ENGINE__);
 check('real retry retires the phased encounter and restores Alessa with only the initial knife',await page.evaluate(()=>__RETIRED_ALESSA_ENGINE__.destroyed&&__HALO_QA__.engine.snapshot().p1.weaponPhase.id==='knife'&&!__HALO_QA__.engine.actors[0].profile.moves.neutralSpecial.projectile));

 await launch(page,'sh3_nurse_revolver_044','sh3_missionary_047');
 const missionaryBefore=await page.evaluate(()=>{__REFERENCE_QA__.position(300,650);const a=__HALO_QA__.engine.actors[1];return {health:a.health,guard:a.guard,meter:a.meter,stats:JSON.stringify(a.stats)};});
 await page.keyboard.press('i');await page.evaluate(()=>__REFERENCE_QA__.advance(70));
 const frontal=await page.evaluate(()=>{const e=__HALO_QA__.engine,a=e.actors[1];return {health:a.health,guard:a.guard,meter:a.meter,stats:JSON.stringify(a.stats),deflected:e.texts.some(t=>t.text==='TIR DÉVIÉ'),damage:e.actors[0].stats.damageDealt,projectiles:e.projectiles.length};});
 report.scenes.missionaryFrontal=frontal;
 check('Missionary deflects a real frontal revolver bullet without chip, meter, perfect guard or a free counter',frontal.deflected&&frontal.health===missionaryBefore.health&&frontal.guard===missionaryBefore.guard&&frontal.meter===missionaryBefore.meter&&frontal.stats===missionaryBefore.stats&&frontal.damage===0&&frontal.projectiles===0,frontal);

 await page.evaluate(()=>__REFERENCE_QA__.position(300,650));
 await page.keyboard.press('i');
 const rear=await page.evaluate(()=>{const q=__REFERENCE_QA__,e=__HALO_QA__.engine,[a,b]=e.actors,before=b.health;q.advance(a.profile.moves.neutralSpecial.startup+1);const emitted=e.projectiles.length;a.x=1100;q.advance(70);return {emitted,before,health:b.health,facing:b.facing,damage:a.stats.damageDealt};});
 report.scenes.missionaryRear=rear;
 check('the same real bullet can hit Missionary from behind after its owner crosses to the opposite side',rear.emitted===1&&rear.facing===1&&rear.health<rear.before&&rear.damage>0,rear);

 await launch(page,'sh3_nurse_revolver_044','sh3_missionary_047');
 const groundedBefore=await page.evaluate(()=>{__REFERENCE_QA__.position(300,650);const a=__HALO_QA__.engine.actors[1];a.knockdownTimer=120;a.state='knockdown';return a.health;});
 await page.keyboard.press('i');await page.evaluate(()=>__REFERENCE_QA__.advance(70));
 const grounded=await page.evaluate(()=>{const e=__HALO_QA__.engine,a=e.actors[1];return {health:a.health,damage:e.actors[0].stats.damageDealt,deflected:e.texts.some(t=>t.text==='TIR DÉVIÉ')};});
 report.scenes.missionaryGrounded=grounded;
 check('a knocked-down Missionary remains vulnerable to the actual frontal firearm collision',grounded.health<groundedBefore&&grounded.damage>0&&!grounded.deflected,grounded);

 await launch(page,'sh1_incubator_018');
 const fieldFar=await page.evaluate(()=>{
  const e=__HALO_QA__.engine,q=__REFERENCE_QA__;q.position(600,1000);
  const health=e.actors[1].health;q.advance(25);
  return {health,after:e.actors[1].health,cooldown:e.actors[0].proximityCooldown,projectiles:e.projectiles.length};
 });
 check('idle Incubator cannot apply its passive field at distance or emit a projectile',fieldFar.after===fieldFar.health&&fieldFar.cooldown===0&&fieldFar.projectiles===0,fieldFar);
 const fieldBefore=await page.evaluate(()=>{
  const e=__HALO_QA__.engine;__REFERENCE_QA__.position(600,820);
  return {health:e.actors[1].health,meter:e.actors.map(a=>a.meter)};
 });
 await page.keyboard.down('q');
 const fieldContact=await page.evaluate(()=>{
  const e=__HALO_QA__.engine,q=__REFERENCE_QA__;let ticks=0;
  while(!e.actors[1].knockdownTimer&&ticks++<90)q.advance(1);
  const [a,b]=e.actors;return {ticks,x:a.x,targetX:b.x,targetVx:b.vx,health:b.health,knockdown:b.knockdownTimer,
   meter:e.actors.map(a=>a.meter),combo:a.combo,maxCombo:a.stats.maxCombo,damage:a.stats.damageDealt,
   active:a.attack?.key||null,cooldown:a.proximityCooldown,projectiles:e.projectiles.length,field:a.profile.referencePolicy.proximityField};
 });
 await page.keyboard.up('q');report.scenes.incubatorField=fieldContact;
 check('real approach triggers Incubator passive outward knockdown without an attack, projectile or free combat reward',fieldContact.ticks<=90&&fieldContact.x===600&&fieldContact.targetX>600&&fieldContact.targetVx>0&&fieldContact.knockdown>0&&fieldContact.health===fieldBefore.health-fieldContact.field.damage&&fieldContact.damage===fieldContact.field.damage&&JSON.stringify(fieldContact.meter)===JSON.stringify(fieldBefore.meter)&&fieldContact.combo===0&&fieldContact.maxCombo===0&&fieldContact.active===null&&fieldContact.projectiles===0,fieldContact);
 await page.click('#pauseBtn');await page.evaluate(()=>__REFERENCE_QA__.advance(30));
 const fieldPaused=await page.evaluate(()=>{const e=__HALO_QA__.engine;return {paused:e.paused,cooldown:e.actors[0].proximityCooldown,health:e.actors[1].health};});
 check('real pause freezes passive field cooldown and prevents further damage',fieldPaused.paused&&fieldPaused.cooldown===fieldContact.cooldown&&fieldPaused.health===fieldContact.health,fieldPaused);
 await page.click('[data-pause=resume]');await shot(page,'07-incubator-proximity');
 await page.evaluate(()=>{window.__RETIRED_INCUBATOR_ENGINE__=__HALO_QA__.engine;});await page.click('#pauseBtn');await page.click('[data-pause=retry]');
 await page.waitForFunction(()=>__HALO_QA__.engine!==__RETIRED_INCUBATOR_ENGINE__);
 check('real retry retires the passive field cooldown with its previous engine',await page.evaluate(()=>__RETIRED_INCUBATOR_ENGINE__.destroyed&&__HALO_QA__.engine.actors[0].proximityCooldown===0));
 const lightning=[];
 for(const [id,color] of [['sh1_incubator_018','#80baff'],['sh1_incubus_019','#ff6868']]){
  await launch(page,id);
  if(id==='sh1_incubus_019'){
   const noField=await page.evaluate(()=>{const e=__HALO_QA__.engine;__REFERENCE_QA__.position(600,720);const health=e.actors[1].health;__REFERENCE_QA__.advance(1);return {health,after:e.actors[1].health,knockdown:e.actors[1].knockdownTimer,field:e.actors[0].profile.referencePolicy.proximityField||null};});
   check('Incubus remains a distinct ending form without the Incubator proximity field',noField.health===noField.after&&noField.knockdown===0&&noField.field===null,noField);
  }
  await page.evaluate(()=>__REFERENCE_QA__.position(260,1100));await page.keyboard.press('i');
  lightning.push(await page.evaluate(({id,color})=>{const e=__HALO_QA__.engine,a=e.actors[0];__REFERENCE_QA__.advance(a.profile.moves.neutralSpecial.startup+1);return {id,color,emitted:e.projectiles.length,actual:e.projectiles[0]?.color,move:a.attack?.key};},{id,color}));
 }
 report.scenes.sh1Lightning=lightning;
 check('real SH1 special inputs retain distinct sourced blue and red lightning hues',lightning.every(s=>s.emitted===1&&s.actual===s.color&&s.move==='neutralSpecial'),lightning);

 await launch(page,'sh3_split_worm_046','sh3_nurse_revolver_044');
 const poundBefore=await page.evaluate(()=>{
  const e=__HALO_QA__.engine;__REFERENCE_QA__.position(600,780);e.actors[1].health=1;
  return {health:e.actors.map(a=>a.health),meter:e.actors.map(a=>a.meter),guard:e.actors[1].guard,stats:e.actors.map(a=>JSON.stringify(a.stats))};
 });
 await page.keyboard.down('ArrowDown');await page.keyboard.press('i');
 await page.evaluate(()=>__REFERENCE_QA__.advance(__HALO_QA__.engine.actors[0].profile.moves.downSpecial.startup+1));
 await page.keyboard.up('ArrowDown');
 const pound=await page.evaluate(()=>{const e=__HALO_QA__.engine,[a,b]=e.actors;return {move:a.attack?.key,hits:a.attack?.hitCount,damage:a.attack?.move.damage,health:e.actors.map(a=>a.health),meter:e.actors.map(a=>a.meter),guard:b.guard,stats:e.actors.map(a=>JSON.stringify(a.stats)),stagger:b.hurtFrames,state:b.state,projectiles:e.projectiles.length,phase:e.phase};});
 report.scenes.splitWormPound=pound;
 check('real Split Worm ground pound staggers at one HP with exactly zero health, guard, meter or damage-score change',pound.move==='downSpecial'&&pound.hits===1&&pound.damage===0&&pound.stagger>0&&pound.state==='hurt'&&JSON.stringify(pound.health)===JSON.stringify(poundBefore.health)&&JSON.stringify(pound.meter)===JSON.stringify(poundBefore.meter)&&pound.guard===poundBefore.guard&&JSON.stringify(pound.stats)===JSON.stringify(poundBefore.stats)&&pound.projectiles===0&&pound.phase==='fight',pound);
 await shot(page,'08-split-worm-stagger');

 await launch(page,'sh3_split_worm_046','sh3_nurse_revolver_044');await page.evaluate(()=>__REFERENCE_QA__.position(600,780));
 await page.keyboard.down('ArrowDown');await page.keyboard.press('i');
 await page.evaluate(()=>__REFERENCE_QA__.advance(__HALO_QA__.engine.actors[0].profile.moves.downSpecial.startup-2));
 await page.keyboard.up('ArrowDown');
 await page.keyboard.down('s');await page.keyboard.down('a');await page.evaluate(()=>__REFERENCE_QA__.advance(1));
 const poundGuardBefore=await page.evaluate(()=>{const e=__HALO_QA__.engine,b=e.actors[1];return {parry:b.parryWindow,health:b.health,guard:b.guard,meter:e.actors.map(a=>a.meter),stats:e.actors.map(a=>JSON.stringify(a.stats))};});
 await page.evaluate(()=>__REFERENCE_QA__.advance(2));
 const poundGuard=await page.evaluate(()=>{const e=__HALO_QA__.engine,b=e.actors[1];return {health:b.health,guard:b.guard,meter:e.actors.map(a=>a.meter),stats:e.actors.map(a=>JSON.stringify(a.stats)),stagger:b.hurtFrames,hits:e.actors[0].attack?.hitCount};});
 await page.keyboard.up('s');await page.keyboard.up('a');report.scenes.splitWormGuard=poundGuard;
 check('real crouch guard against the pound introduces no chip, guard drain, perfect-guard credit or free meter',poundGuardBefore.parry>0&&poundGuard.hits===1&&poundGuard.stagger===0&&poundGuard.health===poundGuardBefore.health&&poundGuard.guard===poundGuardBefore.guard&&JSON.stringify(poundGuard.meter)===JSON.stringify(poundGuardBefore.meter)&&JSON.stringify(poundGuard.stats)===JSON.stringify(poundGuardBefore.stats),{before:poundGuardBefore,after:poundGuard});

 await launch(page,'sh3_split_worm_046','sh3_nurse_revolver_044');
 await page.keyboard.down('ArrowDown');await page.keyboard.press('i');
 await page.evaluate(()=>__REFERENCE_QA__.advance(__HALO_QA__.engine.actors[0].profile.moves.downSpecial.startup+1));
 await page.keyboard.up('ArrowDown');
 const poundFar=await page.evaluate(()=>{const e=__HALO_QA__.engine,[a,b]=e.actors;return {move:a.attack?.key,hits:a.attack?.hitCount,stagger:b.hurtFrames,health:b.health,max:b.maxHealth};});
 check('the ground pound remains a local collision rather than a screen-wide invisible stagger',poundFar.move==='downSpecial'&&poundFar.hits===0&&poundFar.stagger===0&&poundFar.health===poundFar.max,poundFar);

 await launch(page,'sh3_split_worm_046','sh1_air_screamer_001');await page.evaluate(()=>__REFERENCE_QA__.position(600,780));
 await page.keyboard.down('ArrowDown');await page.keyboard.press('i');
 await page.evaluate(()=>__REFERENCE_QA__.advance(__HALO_QA__.engine.actors[0].profile.moves.downSpecial.startup+1));
 await page.keyboard.up('ArrowDown');
 const poundFlyer=await page.evaluate(()=>{const e=__HALO_QA__.engine,[a,b]=e.actors;return {grounded:b.grounded,groundContact:e.snapshot().p2.groundContact,hits:a.attack?.hitCount,stagger:b.hurtFrames,health:b.health,max:b.maxHealth};});
 check('a hovering Air Screamer stays outside a ground-contact stagger despite its grounded simulation flag',poundFlyer.grounded&&poundFlyer.groundContact===false&&poundFlyer.hits===0&&poundFlyer.stagger===0&&poundFlyer.health===poundFlyer.max,poundFlyer);

 await launch(page,'sh4_wall_man_056');await page.keyboard.down('ArrowRight');await page.keyboard.press('ArrowUp');await page.keyboard.press('l');
 await page.evaluate(()=>__REFERENCE_QA__.advance(30));await page.keyboard.up('ArrowRight');scene=await page.evaluate(()=>__REFERENCE_QA__.scene());
 check('Wall Man ignores real move, jump and dodge inputs while anchored',scene.actors[0].x===260&&scene.actors[0].y===594&&scene.actors[0].grounded&&scene.actors[0].move===null,scene);
 const anchored=await page.evaluate(()=>{
  const e=__HALO_QA__.engine,[a,b]=e.actors,start=a.x,health=a.health;
  e.applyHit(b,a,b.profile.moves.neutralHeavy,9001);e.physics(a);
  b.x=a.x+10;e.resolveBodyCollision();
  return {start,x:a.x,y:a.y,grounded:a.grounded,damaged:a.health<health,otherX:b.x};
 });report.scenes.wallMan=anchored;
 check('a real hit and prepared body overlap cannot dislodge the fixed boss',anchored.damaged&&anchored.x===anchored.start&&anchored.y===594&&anchored.grounded&&anchored.otherX!==anchored.start+10,anchored);

 scene=await launch(page,'sh1_air_screamer_001');const beforeTaunt={meter:scene.actors[0].meter,health:scene.actors.map(a=>a.health),time:scene.time};
 await page.keyboard.press('p');await page.evaluate(()=>__REFERENCE_QA__.advance(13));scene=await page.evaluate(()=>__REFERENCE_QA__.scene());report.scenes.taunt=scene;
 check('keyboard taunt plays an exact context while combat time continues without damage or meter gain',scene.actors[0].presentation?.key==='taunt'&&scene.actors[0].presentation.contextId==='sh1_air_screamer_001:taunt'&&scene.time<beforeTaunt.time&&scene.actors[0].meter===beforeTaunt.meter&&scene.actors.every((a,i)=>a.health===beforeTaunt.health[i])&&scene.projectiles===0,scene);
 await page.keyboard.down('ArrowRight');await page.evaluate(()=>__REFERENCE_QA__.advance(1));await page.keyboard.up('ArrowRight');
 check('fresh directional input cancels taunt immediately and moves the subject',await page.evaluate(()=>!__HALO_QA__.engine.actors[0].presentation&&__HALO_QA__.engine.actors[0].x>260));
 await page.keyboard.press('p');await page.evaluate(()=>__REFERENCE_QA__.advance(1));await page.keyboard.press('j');await page.evaluate(()=>__REFERENCE_QA__.advance(1));
 check('fresh attack input also cancels taunt without losing the attack',await page.evaluate(()=>{const a=__HALO_QA__.engine.actors[0];return !a.presentation&&a.attack?.key==='neutralLight';}));

 await page.goto(versus+'&p1=sh1_larval_stalker_007');await page.waitForFunction(()=>!!window.__HALO_QA__);
 const checkpoint=await page.evaluate(async()=>{
  const {createRun,saveRun}=await import('/src/run-progress.js');
  const run=createRun({mode:'arcade',playerId:'sh1_air_screamer_001',seed:1843});saveRun(run);
  return {run:localStorage.getItem('sh-halo-of-flesh-run-v1'),backup:localStorage.getItem('sh-halo-of-flesh-run-v1:backup'),
   records:localStorage.getItem('sh-halo-of-flesh-records-v1'),chronicles:localStorage.getItem('sh-halo-of-flesh-chronicles-v1')};
 });await page.reload();await page.waitForFunction(()=>!!window.__HALO_QA__);await page.selectOption('#mode','local');await page.check('#artDiagnostic');
 await page.click('#launch');await page.waitForSelector('#playStatus:not(.hidden)');
 const blocked=await page.evaluate(()=>({engine:!!__HALO_QA__.engine,message:document.querySelector('#playStatus').textContent,
  run:localStorage.getItem('sh-halo-of-flesh-run-v1'),backup:localStorage.getItem('sh-halo-of-flesh-run-v1:backup'),
  records:localStorage.getItem('sh-halo-of-flesh-records-v1'),chronicles:localStorage.getItem('sh-halo-of-flesh-chronicles-v1')}));
 check('noncombatant launch is visibly refused even when diagnostic artwork is enabled',!blocked.engine&&/rôle non combattant|identité à confirmer/.test(blocked.message),blocked);
 check('refused contact preserves primary checkpoint, backup, records and chapter attempts',Object.keys(checkpoint).every(key=>checkpoint[key]===blocked[key]));
 await page.click('#fighterDossier');
 check('the refused subject still has its real source dossier and disabled commands',await page.locator('[data-reference-id=sh1_larval_stalker_007]').isVisible()&&/0\/20 commandes actives/.test(await page.locator('[data-reference-id=sh1_larval_stalker_007]').textContent())&&await page.locator('.move-unavailable').count()===20);

 await page.goto(versus+'&p1=sh1_air_screamer_001');await page.waitForFunction(()=>!!window.__HALO_QA__);await page.click('#fighterDossier');
 const reference=page.locator('[data-reference-id=sh1_air_screamer_001]');
 check('Air Screamer dossier exposes the referenced edition, glide scratch and source links',/1999/.test(await reference.locator('h3').textContent())&&/pattes en vol plané \(GlideScratchAttack\)/.test(await reference.textContent())&&await reference.locator('.reference-sources a[href^="https://"]').count()>=2);
 await reference.scrollIntoViewIfNeeded();await shot(page,'02-source-dossier-desktop');

 await page.goto(base+'/modules/sprite-workshop.html');await page.waitForFunction(()=>document.querySelector('#spriteDetail canvas')?.dataset.artStatus==='raster');
 const id=await page.locator('#spriteDetail canvas').getAttribute('data-sprite-id');
 for(const type of ['signature','nightmare']){
  const key=`finisher@${id}_${type}`;await page.selectOption('[data-inspect=pose]',key);
  const selected=await page.locator('#spriteDetail canvas').evaluate(canvas=>({...canvas.dataset}));
  check(`workshop ${type} chooses the exact production context and honestly holds missing-art fallback`,selected.requestedPose===key&&selected.presentationContext===`${id}_${type}`&&selected.pose==='idle'&&/SÉQUENCE À PRODUIRE/.test(await page.locator('[data-inspect=status]').textContent()),selected);
 }
 const target='finished@film_red_pyramid_film_175_signature';await page.selectOption('[data-inspect=pose]',target);
 check('workshop target reaction can select a different finisher identity without borrowing its image',await page.locator('#spriteDetail canvas').getAttribute('data-requested-pose')===target&&await page.locator('#spriteDetail canvas').getAttribute('data-sprite-id')===id);
 await page.setViewportSize({width:430,height:1050});await page.locator('[data-inspect=pose]').scrollIntoViewIfNeeded();
 check('context selection and workshop controls fit a mobile viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await shot(page,'03-workshop-context-mobile');
 check('no unhandled JavaScript browser exceptions',report.errors.length===0,report.errors);
 await context.close();
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{
 report.passed=!report.failure&&!report.errors.length;
 await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 await browser?.close();server?.kill('SIGTERM');
}
