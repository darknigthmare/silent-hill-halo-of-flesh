/** Prepared HTTP presentation regressions; neither a played campaign nor source animation certification. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VERSION} from '../src/data.js';

const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(process.env.QA_OUTPUT_DIR||resolve(root,'tests/http-cinematic-expansion'));
const source=process.env.QA_SOURCE_TREE==='1',base=process.env.QA_BASE_URL||'http://127.0.0.1:4197';
const subjects=[
  ['sh1_grey_child_005','childThreshold','midwich'],['sh1_romper_010','fourPointPin','midwich'],['sh3_nurse_revolver_044','revolverDoor','midwich'],
  ['sh1_creeper_009','ankleShadow','midwich'],['sh1_hanged_scratcher_011','ceilingHook','sewer_resort'],
  ['sh2_mandarin_026','underGrateGrip','midwich_nightmare'],['sh2_flesh_lip_027','cageFootLift','sewer_resort'],
  ['sh2_abstract_daddy_028','organicFrameOcclusion','labyrinth'],['sh3_pendulum_039','rotatingShadow','shopping_mall'],
  ['sh3_leonard_wolf_048','waterSurfaceGrip','brookhaven_sh3'],['sh4_hummer_055','buzzingCameraPass','room_302'],
  ['sh4_wall_man_056','wallSupportPull','labyrinth'],['sh4_gum_head_old_type_057','unarmedFurnitureStruggle','hilltop_center'],
  ['sh1_incubator_018','blueTerminalExposure','nowhere'],['sh1_incubus_019','redSuspendedExposure','nowhere'],
  ['sh2_creeper_025','sh2LowShadowBite','woodside'],['sh3_god_050','incompleteBodyFireline','church'],
  ['origins_straight_jacket_074','closedTorsoLegRelease','alchemilla_origins'],['origins_ariel_078','tetheredDollKicks','cedar_grove'],
  ['origins_memory_of_helen_grady_082','helenSuspendedWheel','cedar_grove'],['origins_memory_of_richard_grady_083','richardWallTentacles','labyrinth'],
  ['homecoming_lurker_085','lurkerLowClawFold','blue_creek'],['homecoming_smog_087','smogExposedExhalation','nightmare_hospital_hc'],
  ['bom_air_screamer_121','bomTalonsCircle','book_wood'],['bom_bogeyman_122','bomHammerStop','book_earth'],
  ['bom_butcher_123','bomCleaverPair','book_wood'],['bom_double_head_124','bomCirclingCharge','book_fire'],
  ['bom_ghost_125','bomToxicPresencePass','book_blood'],['bom_insane_cancer_126','bomMassSpaceCrush','book_water'],
  ['bom_needler_127','bomBladeCrossRetreat','book_steel'],['bom_pyramid_head_129','bomGreatKnifeSweep','book_light'],
  ['bom_schism_130','bomHeadBladeLunge','book_earth'],['bom_straight_jacket_131','bomClosedTorsoJet','book_water'],
  ['origins_two_back_080','originsJoinedTackle','riverside_motel'],
  ['homecoming_amnion_hanging_form_097','amnionSupportedFrontLegs','underground_hc'],['homecoming_amnion_exposed_form_098','amnionExposedCloseGrip','underground_hc'],
  ['bom_nurse_128','bomPipePairStop','book_light'],['bom_tremer_133','bomTremerLowPressure','book_earth'],
  ['bom_fire_guardian_137','bomFireHandsEmission','book_fire'],['bom_light_guardian_140','bomHeartMaceArm','book_light'],
  ['bom_water_guardian_141','bomAquaticMembers','book_water'],['bom_blood_mama_145','bomDetachedMamaPounce','book_blood'],
  ['sh1_floatstinger_016','sh1MothAbdomenPass','central_nightmare'],['sh1_monster_cybil_017','cybilArmedPistolButt','lakeside_amusement'],
  ['sh2_eddie_dombrowski_032','eddieFreezerRevolverCut','prison_meat_locker'],
  ['sh2_maria_final_manifestation_033','mariaFinalMothClosure','hotel_otherworld'],['sh2_mary_final_manifestation_034','maryFinalBlackTail','hotel_otherworld'],
  ['sh4_gum_head_new_type_058','gumNewEquippedClub','building_world'],['sh4_bottom_065','bottomThreeHeadDive','outside_room_302'],
  ['sh4_cynthia_velasquez_victim_16','cynthiaStandingHairClosure','subway_world']
];
const presentationSubjects=[
  ['sh3_closer_church_variant','church'],['sh4_jasper_gein_victim_17','forest_world'],
  ['sh4_andrew_desalvo_victim_18','water_prison'],['sh4_richard_braintree_victim_19','building_world'],
  ['homecoming_swarm','nightmare_hospital_hc']
];
const presentationBatches=[{id:'lot9',subjects:presentationSubjects},{id:'lot10',subjects:[
  ['homecoming_order_soldier_091','underground_hc'],['bom_gray_child_147','book_light'],
  ['bom_wood_sapling_139','book_wood'],['shf_harai_katashiro_158','dark_shrine_corridors'],
  ['film_dark_nurse_171','film_hospital']
]}];
const report={version:VERSION,build:process.env.QA_BASE_URL?'external HTTP':source?'source':'dist',checks:[],errors:[],captures:[],scenes:{},fixtures:[
  'Each subject is selected through the real menu and launch button in local mode, with the explicit missing-art diagnostic enabled. No production PNG or contextual animation is created by this suite.',
  'The ?qa=1 bridge stops requestAnimationFrame and advances actual simulation ticks. Two prepared target KOs per match exercise ordinary round scoring and the real deciding-finisher gate; no prior win score or cinematic recipe is injected.',
  'Keyboard taunt, directional cancellation and the real pause/resume controls are used. Prepared local mirror-free pairings and state advancement are regression scenes, not played fights or a campaign.',
  'The missing contextual sprite check permits an existing candidate idle fallback or an explicit missing-profile cartouche. Neither is counted as a produced attack, KO or finisher pose.',
  'Explicit real-menu stage choices cover ceiling, floor grate, water, wall, furniture and mechanical support. Fixed actors cancel taunts with the real guard key; they never receive injected locomotion. Six additional menu matches reject waterless, ceilingless, wall-less or mechanically unsupported locations. Bitmap replacements use their structured geometry.ceiling contract, independently of their scene name.',
  'The Gum Head Old Type furniture positive is a synthetic cross-work versus pairing with the documented desk in the normal Monica office at Hilltop Center SH3. It is not an original SH4 encounter. The actual SH1 Alchemilla waiting-room bitmap has no asserted bed, curtain, gurney or desk and is not used to supply that support.',
  'The previous ten exact-subject edits include SH1 blue and red lightning branches, SH3 incomplete-body ground fire, SH2 low Creeper, Origins closed-torso leg capture and suspended dolls/cages/wall head, plus Homecoming Lurker claws and exposed-lung Smog exhalation.',
  'Ten additional Book of Memories Vita subjects use their own documented capacities and workbook proposals. The Double Head edit limits itself to the documented circling charge; the proposed bite is explicitly left unverified. Four-legged Needler and blade-headed Schism keep their own anatomy. No original-title animation or finisher is borrowed.',
  'A separate real-menu pairing prepares Insane Cancer as the loser: round-one recovery must not request its terminal explosion art, while the final ordinary KO requests only the missing final-loss image context. No explosion image, destructive body effect or extra gameplay damage is generated.',
  'Nine further source-specific subjects retain joined Two-Back bodies, separate mechanically supported Amnion stances, the Vita Nurse Steel Pipe, low Tremer, anatomical mace-arm, aquatic members and detached Blood Mama. Fire Guardian is restricted to documented hand fire; unsupported jump/body discharge and the uncertain Demon dossier are not performed. No total Amnion limb count is certified.',
  'Eight further subjects keep Floatstinger abdomen contact without an invented rooftop, Cybil pistol-butt only while actually armed, Eddie in the original second freezer, separate Mary/Maria cage identities, the New Type equipped club, Bottom three heads/two hands and Cynthia standing hair hold. Contextual poses remain missing. The source-only Split Worm tunnel is not fabricated in the current mall room.',
  'An additional Cybil fixture prepares widely separated actors, then spends all ten bullets through actual keyboard special inputs. No ammunition or discarded-weapon state is injected. Both results must retain unarmed presentation intents and the deciding match must reject an armed finisher. A separate Eddie pairing rejects a borrowed place despite existing prison meat props.',
  'Lot9 owns exactly thirty additional presentation rows: the church Closer, Jasper 17, Andrew 18, Richard 19 and Homecoming Swarm, each with intro, reversible win/loss round, final win/loss and outro. Real menu matches exercise both scoring directions with finishers explicitly disabled. No taunt or finisher is added to these five dossiers.',
  'The two moving exits, Richard short position shift and Homecoming Swarm group dispersal, use the real 90-tick presentation clock. Pausing through the UI must keep the result hidden; authored offsets never change either actor physical coordinates. Ghosts keep their bodies and equipment on final loss without an invented sword or permanent source death.',
  'Lot10 owns thirty more presentation rows on Order Soldier, Vita Expansion Gray Child, Wood Sapling, Harai Katashiro and the Gans 2006 Dark Nurse. The Soldier retains only the catalogue melee preset; its exact pipe and the Nurse instrument remain unverified. Harai keeps the secondarily documented hand knife and blade legs, with authored continuous three-step withdrawal rather than a claimed native spinning animation.',
  'The Nurse is staged after activation as the projects playable scripted adaptation; these result contexts neither implement a light sensor nor copy Revelation sound response. Prepared cross-body arena matches are versus transpositions, not proof these characters meet in their original story rooms. Every new contextual image remains explicitly unproduced.',
  'All staging durations and offsets are authored versus adaptations. No original-game footage, source FPS, timecodes or physical controller fidelity are certified.'
]};
let server,browser;
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(!passed&&detail!==undefined?{detail}:{})});if(!passed)throw Error(name);};
async function shot(page,name){await page.screenshot({path:resolve(out,name+'.png'),fullPage:false});report.captures.push(name+'.png');}
async function start(page,id,stageId,targetId='sh2_bubble_head_nurse_024',fatalities=true){
  await page.goto(base+`/modules/unified-versus.html?qa=1&p1=${id}&p2=${targetId}&stage=${stageId}`);
  await page.waitForFunction(()=>!!window.__HALO_QA__);
  await page.selectOption('#mode','local');await page.selectOption('#rounds','2');
  for(const name of ['stageHazards','stageDirector','otherworldShift','stageFatalities','stageTerrain'])await page.uncheck('#'+name);
  await page.setChecked('#fatalities',fatalities);await page.check('#artDiagnostic');await page.click('#launch');
  await page.waitForFunction(()=>!!__HALO_QA__.engine);
  return page.evaluate(async()=>{
    const e=__HALO_QA__.engine;e.running=false;
    const {sampleLorePresentation}=await import('/src/lore-cinematics.js');
    const {actorSpriteState,sampleSpriteClip}=await import('/src/sprite-animation.js');
    const {SPRITES}=await import('/src/sprite-manifest.js');
    const q=window.__CINEMATIC_EXPANSION_QA__={};
    q.snapshot=()=>({phase:e.phase,paused:e.paused,frame:e.frame,round:e.round,phaseTimer:e.phaseTimer,diagnostic:e.config.artDiagnostic,stage:e.stage.id,
      projectiles:e.projectiles.length,health:e.actors.map(a=>a.health),maxHealth:e.actors.map(a=>a.maxHealth),wins:e.actors.map(a=>a.roundWins),outroPlaying:e.isPresentingOutro(),resultHidden:document.querySelector('#result').classList.contains('hidden'),
      resources:e.actors.map(a=>[a.health,a.meter,a.ammo,a.guard,a.stats.damageDealt]),
      lastFatality:e.lastFatality?.id||null,cinematicBlock:e.lastCinematicBlock||null,fatality:e.fatality?{id:e.fatality.definition.id,recipe:e.fatality.choreography.recipeId,frame:e.fatality.sample.frame,total:e.fatality.total}:null,
      tracks:e.actors.map(a=>a.presentation?{key:a.presentation.key,frame:a.presentation.frame,sequenceId:a.presentation.sequenceId,duration:a.presentation.duration,reversible:a.presentation.reversible,poseIntent:a.presentation.lore?.poseIntent||null,
        clipKey:a.presentation.clipKey,authored:a.presentation.lore?.authored,ownerId:a.presentation.lore?.ownerId,composedOutro:a.presentation.lore?.hasComposedOutro===true,stagingDuration:a.presentation.stagingDuration,scopeNote:a.presentation.lore?.scopeNote||null,staging:a.presentation.staging||sampleLorePresentation(a,a.presentation)}:null),
      actors:e.actors.map(a=>{const s=sampleSpriteClip(SPRITES[a.data.id],actorSpriteState(a));return {id:a.data.id,source:a.data.source,x:a.x,health:a.health,weapon:a.data.visual.weapon,lastMove:a.lastMoveKey,
        ammo:a.ammo,weaponDiscarded:a.weaponDiscarded,canMove:a.profile.referencePolicy?.canMove!==false,fatalities:a.stats.fatalities,sprite:s?{pose:s.pose,fallback:s.fallback,reason:s.fallbackReason,requested:s.requested}:null};})});
    q.advance=n=>{for(let tick=0;tick<n;tick++)e.update();e.render(performance.now());return q.snapshot();};
    q.knockout=(winner=0)=>{const target=e.actors[1-winner];target.health=0;target.lastHit={attackerIndex:winner,isSuper:false,environmental:false};e.resolveKnockouts();e.render(performance.now());return q.snapshot();};
    return q.snapshot();
  });
}
const scene=page=>page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.snapshot());
const advance=(page,ticks)=>page.evaluate(n=>__CINEMATIC_EXPANSION_QA__.advance(n),ticks);

await mkdir(out,{recursive:true});
try{
  if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4197',...(source?[]:['--dist'])],{cwd:root,stdio:'ignore'});
  let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}check('HTTP server ready',ready);
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
  for(const [id,recipe,stageId] of subjects){
    const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
    let current=await start(page,id,stageId);
    check(id+': real menu starts exact authored intro with explicit art diagnostic',current.phase==='intro'&&current.diagnostic&&current.stage===stageId&&current.actors[0].id===id&&current.tracks[0]?.key==='intro'&&current.tracks[0].authored&&current.tracks[0].ownerId===id,current);
    if(id===subjects[0][0]){await advance(page,24);await shot(page,'01-grey-child-intro-diagnostic');}
    await page.keyboard.press('j');current=await advance(page,(await scene(page)).phaseTimer);
    check(id+': intro input is discarded before live combat',current.phase==='fight'&&current.actors.every(a=>a.lastMove===null)&&current.tracks.every(t=>t===null),current);
    const resources=current.resources;
    await page.keyboard.press('p');current=await advance(page,12);
    check(id+': keyboard taunt owns an exact context without damage, projectiles or resource gain',current.tracks[0]?.key==='taunt'&&current.tracks[0].authored&&current.tracks[0].clipKey===`taunt@${id}:taunt`&&current.tracks[0].frame>0&&current.projectiles===0&&JSON.stringify(current.resources)===JSON.stringify(resources),current);
    await page.click('#pauseBtn');const before=await scene(page);current=await advance(page,9);
    check(id+': real pause freezes taunt and combat clocks',current.paused&&current.frame===before.frame&&current.tracks[0]?.frame===before.tracks[0]?.frame,current);
    const movable=current.actors[0].canMove,cancelKey=movable?'ArrowRight':'Space';
    await page.click('[data-pause=resume]');await page.keyboard.down(cancelKey);current=await advance(page,1);await page.keyboard.up(cancelKey);
    check(id+': allowed control cancels the taunt immediately after real resume',!current.paused&&current.tracks[0]===null&&(movable?current.actors[0].x>before.actors[0].x:current.actors[0].x===before.actors[0].x),current);
    current=await page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.knockout());
    check(id+': first KO awards one round with reversible poses and no finisher',current.phase==='roundEnd'&&!current.fatality&&current.wins[0]===1&&current.tracks[0]?.key==='winRound'&&current.tracks[1]?.key==='loseRound'&&current.tracks.every(t=>t.reversible)&&current.actors[0].fatalities===0,current);
    if(id===subjects[1][0]){await advance(page,65);await shot(page,'02-romper-reversible-round');}
    current=await advance(page,(await scene(page)).phaseTimer);current=await advance(page,current.phaseTimer);
    check(id+': ordinary next-round reset restores health and removes old result poses',current.phase==='fight'&&current.round===2&&current.health.every((h,index)=>h===current.maxHealth[index])&&current.tracks.every(t=>t===null),current);
    current=await page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.knockout());
    check(id+': second ordinary KO starts only its exact deciding finisher',current.phase==='fatality'&&current.fatality?.id===id+'_signature'&&current.fatality.recipe===recipe&&current.wins[0]===1&&current.tracks[0]?.key==='finisher'&&current.tracks[1]?.key==='finished'&&current.tracks[0].sequenceId===current.tracks[1].sequenceId&&current.tracks[0].frame===current.tracks[1].frame,current);
    const finalStart=current;
    check(id+': contextual finisher images remain explicitly missing',current.actors.every(a=>!a.sprite||a.sprite.fallback),current);
    current=await advance(page,52);await page.click('#pauseBtn');const frozen=await scene(page);current=await advance(page,11);
    check(id+': pause freezes the shared final choreography and both sprite clocks',current.paused&&current.frame===frozen.frame&&current.fatality.frame===frozen.fatality.frame&&current.tracks.every((track,index)=>track.frame===frozen.tracks[index].frame),current);
    if(!movable)check(id+': attached attacker remains on its support during the actual final edit',current.actors[0].x===before.actors[0].x&&current.tracks[0].staging.x===0&&current.tracks[0].staging.y===0,current);
    if(['homecoming_amnion_hanging_form_097','homecoming_amnion_exposed_form_098','bom_water_guardian_141'].includes(id))check(id+': the same body form keeps its actual mechanical or aquatic anchor',current.actors[0].id===finalStart.actors[0].id&&current.actors[0].x===finalStart.actors[0].x&&current.tracks[0].staging.x===0&&current.tracks[0].staging.y===0,current);
    if(id===subjects[0][0])await shot(page,'pause-shared-finisher');
    await page.click('[data-pause=resume]');current=await advance(page,1);await shot(page,'finisher-'+id);
    current=await advance(page,current.fatality.total-current.fatality.frame);
    check(id+': final choreography completes once with the real winning score',current.phase==='roundEnd'&&current.wins[0]===2&&current.actors[0].fatalities===1&&current.lastFatality===id+'_signature'&&current.health[1]===0,current);
    report.scenes[id]=current;await page.close();
  }
  for(const [id,stageId,reason] of [
    ['sh3_leonard_wolf_048','midwich','Premier plan requis'],['sh2_flesh_lip_027','midwich','Appui de plafond'],
    ['origins_memory_of_helen_grady_082','midwich','Appui de plafond'],['origins_memory_of_richard_grady_083','old_silent_hill','Premier plan requis'],
    ['homecoming_amnion_hanging_form_097','alchemilla','Premier plan requis'],['bom_water_guardian_141','book_fire','Premier plan requis'],
    ['sh2_eddie_dombrowski_032','toluca_prison','Pièce exacte requise']
  ]){
    const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
    let current=await start(page,id,stageId);
    check(id+': unsupported-place fixture uses the actual selected menu stage',current.phase==='intro'&&current.stage===stageId&&current.actors[0].id===id,current);
    current=await advance(page,current.phaseTimer);current=await page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.knockout());
    check(id+': unsupported place still preserves the first round',current.phase==='roundEnd'&&current.wins[0]===1&&!current.fatality,current);
    current=await advance(page,current.phaseTimer);current=await advance(page,current.phaseTimer);current=await page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.knockout());
    check(id+': missing physical support yields the ordinary deciding KO with an explicit reason',current.phase==='roundEnd'&&current.wins[0]===2&&!current.fatality&&current.actors[0].fatalities===0&&current.cinematicBlock?.reason.includes(reason),current);
    report.scenes[id+'@unsupported-'+stageId]=current;await shot(page,'unsupported-'+id);await page.close();
  }
  {
    const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
    let current=await start(page,'sh1_monster_cybil_017','lakeside_amusement');
    check('Cybil discard: real menu starts the ten-shot armed intro',current.phase==='intro'&&current.actors[0].ammo===10&&!current.actors[0].weaponDiscarded&&/cybil-armed-pistol-entry/.test(current.tracks[0]?.poseIntent),current);
    current=await advance(page,current.phaseTimer);
    await page.evaluate(()=>{const e=__HALO_QA__.engine;e.actors[0].x=110;e.actors[1].x=1150;e.actors[0].facing=1;e.actors[1].facing=-1;});
    for(let shot=0;shot<10;shot++){
      await page.keyboard.press('i');current=await advance(page,70);
      check(`Cybil discard: actual keyboard shot ${shot+1} spends one bullet and misses the remote target`,current.phase==='fight'&&current.actors[0].ammo===9-shot&&current.health[1]===current.maxHealth[1],current);
    }
    check('Cybil discard: the tenth shot actually abandons the pistol',current.actors[0].ammo===0&&current.actors[0].weaponDiscarded,current);
    // A bullet already emitted before discard keeps its own lifetime. Await
    // its real expiry rather than erasing it to make the unarmed fixture pass.
    for(let settle=0;current.projectiles>0&&settle<16;settle++)current=await advance(page,30);
    check('Cybil discard: already emitted bullets expire normally while the pistol stays discarded',current.projectiles===0&&current.health[1]===current.maxHealth[1]&&current.actors[0].ammo===0&&current.actors[0].weaponDiscarded,current);
    await page.keyboard.press('p');current=await advance(page,12);
    check('Cybil discard: the real taunt requests only the unarmed pose context',current.tracks[0]?.key==='taunt'&&/cybil-unarmed/.test(current.tracks[0]?.poseIntent)&&/cybil-unarmed/.test(current.tracks[0]?.staging.pose)&&current.actors[0].ammo===0,current);
    await shot(page,'cybil-actual-discard-taunt');
    current=await page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.knockout());
    check('Cybil discard: the first round uses an unarmed reversible result',current.phase==='roundEnd'&&!current.fatality&&current.wins[0]===1&&current.tracks[0]?.reversible&&/cybil-unarmed/.test(current.tracks[0]?.poseIntent),current);
    current=await advance(page,current.phaseTimer);current=await advance(page,current.phaseTimer);
    check('Cybil discard: the next round keeps zero ammunition and the discarded state',current.phase==='fight'&&current.actors[0].ammo===0&&current.actors[0].weaponDiscarded&&current.health[0]===current.maxHealth[0],current);
    current=await page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.knockout());
    check('Cybil discard: the deciding result rejects the armed edit without creating a pistol or parasite cure',current.phase==='roundEnd'&&!current.fatality&&current.wins[0]===2&&current.actors[0].fatalities===0&&current.actors[0].ammo===0&&current.actors[0].weaponDiscarded&&/pistolet/.test(current.cinematicBlock?.reason)&&/cybil-unarmed/.test(current.tracks[0]?.poseIntent),current);
    report.scenes['sh1_monster_cybil_017@actual-ten-shot-discard']=current;await shot(page,'cybil-disarmed-final-result');await page.close();
  }
  {
    const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
    let current=await start(page,'bom_bogeyman_122','book_earth','bom_insane_cancer_126');
    check('BoM Cancer loss: actual menu starts the exact Vita pair and its own intro',current.phase==='intro'&&current.actors[1].id==='bom_insane_cancer_126'&&current.actors.every(a=>a.source==='bom')&&current.tracks[1].poseIntent==='bom-mass-room-entry',current);
    current=await advance(page,current.phaseTimer);current=await page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.knockout());
    check('BoM Cancer loss: first-round defeat stays recoverable without terminal destruction intent',current.phase==='roundEnd'&&!current.fatality&&current.wins[0]===1&&current.tracks[1].key==='loseRound'&&current.tracks[1].reversible&&!/explosion/.test(current.tracks[1].poseIntent),current);
    await shot(page,'bom-cancer-round-recovery');
    current=await advance(page,current.phaseTimer);current=await advance(page,current.phaseTimer);
    check('BoM Cancer loss: normal next-round reset restores its complete health without a win or explosion',current.phase==='fight'&&current.round===2&&current.health[1]===current.maxHealth[1]&&current.wins[0]===1&&current.actors[1].fatalities===0,current);
    current=await page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.knockout());
    check('BoM Cancer loss: only final ordinary defeat requests its own explicitly missing explosion pose',current.phase==='roundEnd'&&!current.fatality&&current.wins[0]===2&&current.health[1]===0&&current.actors[0].fatalities===0&&current.tracks[1].key==='loseMatch'&&!current.tracks[1].reversible&&/final-collapse-explosion-awaiting-frames/.test(current.tracks[1].poseIntent)&&(!current.actors[1].sprite||current.actors[1].sprite.fallback),current);
    current=await advance(page,12);
    check('BoM Cancer loss: final victim stays defeated and the result does not award another victory',current.health[1]===0&&current.wins[0]===2&&current.actors[0].fatalities===0&&current.tracks[1].key==='loseMatch',current);
    report.scenes['bom_insane_cancer_126@final-loss']=current;await shot(page,'bom-cancer-final-loss-context');await page.close();
  }
  for(const batch of presentationBatches){
  const ownedContexts=new Set();
  for(const [id,stageId] of batch.subjects)for(const winner of [0,1]){
    const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
    let current=await start(page,id,stageId,'sh2_bubble_head_nurse_024',false);
    check(id+': '+batch.id+' real menu owns its exact presentation-only intro',current.phase==='intro'&&current.actors[0].id===id&&current.tracks[0]?.authored&&current.tracks[0].ownerId===id&&current.tracks[0].scopeNote&&current.tracks[0].key==='intro',current);
    ownedContexts.add(id+':intro');current=await advance(page,25);if(winner===0)await shot(page,batch.id+'-'+id+'-intro');
    current=await advance(page,current.phaseTimer);current=await advance(page,80);
    check(id+': '+batch.id+' live idle has no injected action, projectile or fatality',current.phase==='fight'&&current.projectiles===0&&current.actors.every(a=>a.lastMove===null&&a.fatalities===0),current);
    current=await page.evaluate(w=>__CINEMATIC_EXPANSION_QA__.knockout(w),winner);
    const roundKey=winner===0?'winRound':'loseRound',roundSuffix=winner===0?'winRound1':'loseRound1';
    check(id+': '+batch.id+' '+roundSuffix+' is authored, exact and reversible',current.phase==='roundEnd'&&!current.fatality&&current.wins[winner]===1&&current.tracks[0]?.key===roundKey&&current.tracks[0].authored&&current.tracks[0].ownerId===id&&current.tracks[0].reversible,current);
    ownedContexts.add(id+':'+roundSuffix);current=await advance(page,40);await shot(page,batch.id+'-'+id+'-'+roundSuffix);
    current=await advance(page,current.phaseTimer);current=await advance(page,current.phaseTimer);current=await advance(page,80);
    check(id+': '+batch.id+' next round restores health and clears the recoverable track',current.phase==='fight'&&current.tracks.every(t=>t===null)&&current.health.every((h,i)=>h===current.maxHealth[i]),current);
    current=await page.evaluate(w=>__CINEMATIC_EXPANSION_QA__.knockout(w),winner);
    const finalKey=winner===0?'winMatch':'loseMatch';
    check(id+': '+batch.id+' '+finalKey+' has its own final pose without enabling a finisher',current.phase==='roundEnd'&&!current.fatality&&current.wins[winner]===2&&current.tracks[0]?.key===finalKey&&current.tracks[0].authored&&current.tracks[0].ownerId===id&&!current.tracks[0].reversible&&current.actors.every(a=>a.fatalities===0),current);
    ownedContexts.add(id+':'+finalKey);current=await advance(page,55);
    if(winner===1&&id.startsWith('sh4_'))check(id+': '+batch.id+' final Ghost suppression retains the body rather than fading it away',current.tracks[0].staging.alpha>.5&&current.tracks[0].staging.y===0&&/suppressed|retained/.test(current.tracks[0].poseIntent),current);
    await shot(page,batch.id+'-'+id+'-'+finalKey);current=await advance(page,current.phaseTimer);
    if(winner===0){
      check(id+': '+batch.id+' winner alone owns the exact outro',current.phase==='matchEnd'&&current.tracks[0]?.key==='outro'&&current.tracks[0].authored&&current.tracks[0].ownerId===id&&current.tracks[1]?.key==='loseMatch',current);
      ownedContexts.add(id+':outro');const physical=current.actors.map(a=>a.x);
      if(['sh4_richard_braintree_victim_19','homecoming_swarm','shf_harai_katashiro_158'].includes(id)){
        check(id+': '+batch.id+' moving outro owns the full authored clock and keeps the result pending',current.outroPlaying&&current.resultHidden&&current.tracks[0].composedOutro&&current.tracks[0].stagingDuration===90,current);
        current=await advance(page,30);await page.click('#pauseBtn');const frozen=await scene(page);current=await advance(page,12);await page.waitForTimeout(650);
        check(id+': '+batch.id+' real pause freezes the moving exit and keeps result hidden beyond its reveal timer',current.paused&&current.frame===frozen.frame&&current.tracks[0].frame===frozen.tracks[0].frame&&current.outroPlaying&&await page.locator('#result').isHidden(),current);
        await page.click('[data-pause=resume]');current=await advance(page,32);await shot(page,batch.id+'-'+id+'-outro');
        if(id==='sh4_richard_braintree_victim_19')check(id+': '+batch.id+' actual Richard outro samples the short shift while physical coordinates stay unchanged',/after-shift/.test(current.tracks[0].staging.pose)&&Math.abs(current.tracks[0].staging.x)===43&&JSON.stringify(current.actors.map(a=>a.x))===JSON.stringify(physical),current);
        if(id==='shf_harai_katashiro_158')check(id+': '+batch.id+' actual Harai exit keeps the second continuous blade support and physical coordinates',/right-blade-support$/.test(current.tracks[0].staging.pose)&&Math.abs(current.tracks[0].staging.x)===20&&current.tracks[0].staging.y===0&&JSON.stringify(current.actors.map(a=>a.x))===JSON.stringify(physical),current);
        current=await advance(page,90-current.tracks[0].frame+1);await page.waitForSelector('#result:not(.hidden)');
        check(id+': '+batch.id+' result appears only after the moving outro completes',!current.outroPlaying&&current.tracks[0].frame===89&&JSON.stringify(current.actors.map(a=>a.x))===JSON.stringify(physical),current);
      }else{current=await advance(page,30);await shot(page,batch.id+'-'+id+'-outro');}
    }else check(id+': '+batch.id+' loser holds its own final context while only the other actor exits',current.phase==='matchEnd'&&current.tracks[0]?.key==='loseMatch'&&current.tracks[1]?.key==='outro',current);
    report.scenes[id+'@'+batch.id+'-'+(winner===0?'win':'loss')]=current;await page.close();
  }
  report[batch.id+'OwnedPresentationRows']=[...ownedContexts];check(batch.id+' exercises exactly thirty unique owned workbook presentation contexts',ownedContexts.size===30,[...ownedContexts]);
  }
  check('no unhandled browser exceptions',report.errors.length===0);await context.close();
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
