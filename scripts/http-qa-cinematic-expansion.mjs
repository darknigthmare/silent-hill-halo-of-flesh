/** Prepared HTTP presentation regressions; neither a played campaign nor source animation certification. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VERSION} from '../src/data.js';

const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-cinematic-expansion');
const source=process.env.QA_SOURCE_TREE==='1',base=process.env.QA_BASE_URL||'http://127.0.0.1:4197';
const subjects=[
  ['sh1_grey_child_005','childThreshold','midwich'],['sh1_romper_010','fourPointPin','midwich'],['sh3_nurse_revolver_044','revolverDoor','midwich'],
  ['sh1_creeper_009','ankleShadow','midwich'],['sh1_hanged_scratcher_011','ceilingHook','sewer_resort'],
  ['sh2_mandarin_026','underGrateGrip','midwich_nightmare'],['sh2_flesh_lip_027','cageFootLift','sewer_resort'],
  ['sh2_abstract_daddy_028','organicFrameOcclusion','labyrinth'],['sh3_pendulum_039','rotatingShadow','shopping_mall'],
  ['sh3_leonard_wolf_048','waterSurfaceGrip','brookhaven_sh3'],['sh4_hummer_055','buzzingCameraPass','room_302'],
  ['sh4_wall_man_056','wallSupportPull','labyrinth'],['sh4_gum_head_old_type_057','unarmedFurnitureStruggle','alchemilla']
];
const report={version:VERSION,build:process.env.QA_BASE_URL?'external HTTP':source?'source':'dist',checks:[],errors:[],captures:[],scenes:{},fixtures:[
  'Each subject is selected through the real menu and launch button in local mode, with the explicit missing-art diagnostic enabled. No production PNG or contextual animation is created by this suite.',
  'The ?qa=1 bridge stops requestAnimationFrame and advances actual simulation ticks. Two prepared target KOs per match exercise ordinary round scoring and the real deciding-finisher gate; no prior win score or cinematic recipe is injected.',
  'Keyboard taunt, directional cancellation and the real pause/resume controls are used. Prepared local mirror-free pairings and state advancement are regression scenes, not played fights or a campaign.',
  'The missing contextual sprite check permits an existing candidate idle fallback or an explicit missing-profile cartouche. Neither is counted as a produced attack, KO or finisher pose.',
  'The ten added subjects use explicit real-menu stage choices for ceiling, floor grate, water, wall and furniture support. Fixed actors cancel taunts with the real guard key; they never receive injected locomotion. Two additional menu matches test genuine dry/ceilingless-location rejection.',
  'All staging durations and offsets are authored versus adaptations. No original-game footage, source FPS, timecodes or physical controller fidelity are certified.'
]};
let server,browser;
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(!passed&&detail!==undefined?{detail}:{})});if(!passed)throw Error(name);};
async function shot(page,name){await page.screenshot({path:resolve(out,name+'.png'),fullPage:false});report.captures.push(name+'.png');}
async function start(page,id,stageId){
  await page.goto(base+`/modules/unified-versus.html?qa=1&p1=${id}&p2=sh2_bubble_head_nurse_024&stage=${stageId}`);
  await page.waitForFunction(()=>!!window.__HALO_QA__);
  await page.selectOption('#mode','local');await page.selectOption('#rounds','2');
  for(const name of ['stageHazards','stageDirector','otherworldShift','stageFatalities','stageTerrain'])await page.uncheck('#'+name);
  await page.check('#fatalities');await page.check('#artDiagnostic');await page.click('#launch');
  await page.waitForFunction(()=>!!__HALO_QA__.engine);
  return page.evaluate(async()=>{
    const e=__HALO_QA__.engine;e.running=false;
    const {sampleLorePresentation}=await import('/src/lore-cinematics.js');
    const {actorSpriteState,sampleSpriteClip}=await import('/src/sprite-animation.js');
    const {SPRITES}=await import('/src/sprite-manifest.js');
    const q=window.__CINEMATIC_EXPANSION_QA__={};
    q.snapshot=()=>({phase:e.phase,paused:e.paused,frame:e.frame,round:e.round,phaseTimer:e.phaseTimer,diagnostic:e.config.artDiagnostic,stage:e.stage.id,
      projectiles:e.projectiles.length,health:e.actors.map(a=>a.health),maxHealth:e.actors.map(a=>a.maxHealth),wins:e.actors.map(a=>a.roundWins),
      resources:e.actors.map(a=>[a.health,a.meter,a.ammo,a.guard,a.stats.damageDealt]),
      lastFatality:e.lastFatality?.id||null,cinematicBlock:e.lastCinematicBlock||null,fatality:e.fatality?{id:e.fatality.definition.id,recipe:e.fatality.choreography.recipeId,frame:e.fatality.sample.frame,total:e.fatality.total}:null,
      tracks:e.actors.map(a=>a.presentation?{key:a.presentation.key,frame:a.presentation.frame,sequenceId:a.presentation.sequenceId,duration:a.presentation.duration,reversible:a.presentation.reversible,
        clipKey:a.presentation.clipKey,authored:a.presentation.lore?.authored,ownerId:a.presentation.lore?.ownerId,staging:a.presentation.staging||sampleLorePresentation(a,a.presentation)}:null),
      actors:e.actors.map(a=>{const s=sampleSpriteClip(SPRITES[a.data.id],actorSpriteState(a));return {id:a.data.id,source:a.data.source,x:a.x,health:a.health,weapon:a.data.visual.weapon,lastMove:a.lastMoveKey,
        canMove:a.profile.referencePolicy?.canMove!==false,fatalities:a.stats.fatalities,sprite:s?{pose:s.pose,fallback:s.fallback,reason:s.fallbackReason,requested:s.requested}:null};})});
    q.advance=n=>{for(let tick=0;tick<n;tick++)e.update();e.render(performance.now());return q.snapshot();};
    q.knockout=()=>{const target=e.actors[1];target.health=0;target.lastHit={attackerIndex:0,isSuper:false,environmental:false};e.resolveKnockouts();e.render(performance.now());return q.snapshot();};
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
    check(id+': contextual finisher images remain explicitly missing',current.actors.every(a=>!a.sprite||a.sprite.fallback),current);
    current=await advance(page,52);await page.click('#pauseBtn');const frozen=await scene(page);current=await advance(page,11);
    check(id+': pause freezes the shared final choreography and both sprite clocks',current.paused&&current.frame===frozen.frame&&current.fatality.frame===frozen.fatality.frame&&current.tracks.every((track,index)=>track.frame===frozen.tracks[index].frame),current);
    if(!movable)check(id+': attached attacker remains on its support during the actual final edit',current.actors[0].x===before.actors[0].x&&current.tracks[0].staging.x===0&&current.tracks[0].staging.y===0,current);
    if(id===subjects[0][0])await shot(page,'pause-shared-finisher');
    await page.click('[data-pause=resume]');current=await advance(page,1);await shot(page,'finisher-'+id);
    current=await advance(page,current.fatality.total-current.fatality.frame);
    check(id+': final choreography completes once with the real winning score',current.phase==='roundEnd'&&current.wins[0]===2&&current.actors[0].fatalities===1&&current.lastFatality===id+'_signature'&&current.health[1]===0,current);
    report.scenes[id]=current;await page.close();
  }
  for(const [id,stageId,reason] of [['sh3_leonard_wolf_048','midwich','Premier plan requis'],['sh2_flesh_lip_027','midwich','Appui de plafond']]){
    const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
    let current=await start(page,id,stageId);
    check(id+': unsupported-place fixture uses the actual selected menu stage',current.phase==='intro'&&current.stage===stageId&&current.actors[0].id===id,current);
    current=await advance(page,current.phaseTimer);current=await page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.knockout());
    check(id+': unsupported place still preserves the first round',current.phase==='roundEnd'&&current.wins[0]===1&&!current.fatality,current);
    current=await advance(page,current.phaseTimer);current=await advance(page,current.phaseTimer);current=await page.evaluate(()=>__CINEMATIC_EXPANSION_QA__.knockout());
    check(id+': missing physical support yields the ordinary deciding KO with an explicit reason',current.phase==='roundEnd'&&current.wins[0]===2&&!current.fatality&&current.actors[0].fatalities===0&&current.cinematicBlock?.reason.includes(reason),current);
    report.scenes[id+'@unsupported-'+stageId]=current;await shot(page,'unsupported-'+id);await page.close();
  }
  check('no unhandled browser exceptions',report.errors.length===0);await context.close();
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
