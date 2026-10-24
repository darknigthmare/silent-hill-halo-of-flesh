/** Real chronicle launch and legacy checkpoint recovery through HTTP, with isolated test storage. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VERSION} from '../src/data.js';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(process.env.QA_OUTPUT_DIR||resolve(root,'tests/http-chronicles'));
const source=process.env.QA_SOURCE_TREE==='1';
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4189',url=base+'/modules/unified-versus.html?qa=1&debugArt=1&preset=chronicle&route=room_21&p1=sh1_air_screamer_001';
const archiveRoutes=[['harry_ice',['shattered_raw_shock_base_099','shattered_raw_shock_feminine_100']],['maya_villa',['shortmessage_sakura_head_150']]];
const report={version:VERSION,base,build:process.env.QA_BASE_URL?'external HTTP':source?'source':'dist',checks:[],errors:[],captures:[],scenes:{},fixtures:[
 'Isolated browser storage and synthetic old checkpoints prepared for regression verification. No campaign is claimed as played and no combat result is injected into the engine.',
 'The ordinary room_21 route really launches through its menu. Two archive-only pursuit routes are inspected through their real dossier buttons, then their launch and legacy-resume refusals must preserve checkpoints, backups, records and attempts byte-for-byte.',
 'The room_21 checkpoint explicitly contains one historical synthetic win to check preservation. Old pursuit-route fixtures contain zero wins and all original chapters; no archive dossier is turned into a victory or removed from a saved route.'
]};
let browser,server;
await mkdir(out,{recursive:true});
function check(name,passed,detail){report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);}
try{
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4189',...(source?[]:['--dist'])],{cwd:root,stdio:'ignore'});
 let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 check('static HTTP server ready',ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url);await page.waitForFunction(()=>!!window.__HALO_QA__);
 const preview=await page.locator('#chronicleReferenceDossiers').textContent();report.scenes.preview=preview;
 check('new chapter selection explicitly lists the sacrificed Walter dossier outside victories',await page.locator('#chronicleReferenceDossiers').isVisible()&&/Sacrificed Walter/.test(preview)&&/ne comptent pas comme des victoires/.test(preview),preview);
 await page.click('[data-run-dossier=sh4_sacrificed_walter_071]');
 check('the noncombatant chapter remains consultable through its actual reference dossier',await page.locator('[data-reference-id=sh4_sacrificed_walter_071]').isVisible());
 await page.click('#closeDossier');await page.check('#artDiagnostic');await page.click('#launch');
 await page.waitForFunction(()=>!!__HALO_QA__.engine);
 const launched=await page.evaluate(async()=>{
  const {CHRONICLES}=await import('/src/data.js'),{combatReferencePolicy}=await import('/src/combat-reference-policy.js');
  const q=__HALO_QA__,e=q.engine;e.running=false;e.togglePause(true);const r=q.run,route=CHRONICLES.find(c=>c.id===r.routeId);
  return {format:r.chronicleFormat,queue:r.queue,stages:r.stages,chapterIndices:r.chapterIndices,dossiers:r.referenceDossiers,
   stage:e.stage.id,expectedStage:route.stages[r.chapterIndices[0]%route.stages.length],roleBlocked:e.actors.some(a=>!combatReferencePolicy(a.data).combatEnabled)};
 });report.scenes.launched=launched;
 check('real launch uses the marked compatible queue and original first chapter arena',launched.format==='reference-encounters-v1'&&launched.dossiers.length===1&&!launched.queue.includes('sh4_sacrificed_walter_071')&&!launched.roleBlocked&&launched.stage===launched.expectedStage,launched);
 check('fight view retains the chapter dossier notice without interactive archive controls',await page.locator('#fightReferenceDossiers').isVisible()&&await page.locator('#fightReferenceDossiers button').count()===0);
 await page.click('[data-pause=select]');await page.waitForFunction(()=>!__HALO_QA__.engine);
 const preserved=await page.evaluate(async()=>{
  const {CHRONICLES}=await import('/src/data.js');const {createRun,validateRun}=await import('/src/run-progress.js');const {KEYS}=await import('/src/save-store.js');
  const route=CHRONICLES.find(r=>r.id==='room_21'),r=createRun({mode:'chronicle',routeId:route.id,playerId:'sh1_air_screamer_001',seed:1187});
  delete r.chronicleFormat;delete r.chapterIndices;delete r.referenceDossiers;r.queue=[...route.fighters];r.stages=r.queue.map((_,i)=>route.stages[i%route.stages.length]);
  r.index=1;r.wins=1;r.results=[{index:0,won:true,stats:{healthRatio:.63,maxCombo:4}}];
  if(!validateRun(r))throw Error('legacy fixture invalid');localStorage.setItem(KEYS.run,JSON.stringify(r));
  const names=[KEYS.run,KEYS.run+':backup',KEYS.records,KEYS.chronicles];return {names,values:names.map(k=>localStorage.getItem(k))};
 });
 await page.reload();await page.waitForFunction(()=>!!window.__HALO_QA__);
 const notice=await page.locator('#runCheckpointText').textContent();report.scenes.legacyNotice=notice;
 check('legacy checkpoint is visible with its earned win and explicit suspended continuation',await page.locator('#runCheckpoint').isVisible()&&/1\//.test(notice)&&/Reprise suspendue/.test(notice)&&/Toute la progression est conservée/.test(notice),notice);
 await page.click('#resumeCheckpoint');
 const blocked=await page.evaluate(keys=>({engine:!!__HALO_QA__.engine,message:document.querySelector('#playStatus').textContent,values:keys.map(k=>localStorage.getItem(k))}),preserved.names);report.scenes.blocked={engine:blocked.engine,message:blocked.message};
 check('resuming a blocked legacy chapter explains that it was neither removed nor rewritten',!blocked.engine&&/aucune étape n’a été supprimée ou réécrite/.test(blocked.message),blocked.message);
 check('refused legacy resume leaves checkpoint backup records and attempts byte-for-byte unchanged',JSON.stringify(blocked.values)===JSON.stringify(preserved.values));
 for(const [routeId,expectedIds] of archiveRoutes){
  await page.goto(base+`/modules/unified-versus.html?qa=1&debugArt=1&preset=chronicle&route=${routeId}&p1=sh1_air_screamer_001`);
  await page.waitForFunction(()=>!!window.__HALO_QA__);
  const panel=page.locator('#chronicleReferenceDossiers'),text=await panel.textContent();
  const ids=await panel.locator('[data-run-dossier]').evaluateAll(buttons=>buttons.map(button=>button.dataset.runDossier));
  check(routeId+': the entire pursuit route remains an explicit zero-fight archive with every original dossier',await panel.isVisible()&&/0 rencontres combattantes/.test(text)&&/ne comptent pas comme des victoires/.test(text)&&JSON.stringify(ids)===JSON.stringify(expectedIds),{text,ids});
  const consulted=[];for(const id of expectedIds){await page.click(`[data-run-dossier=${id}]`);if(await page.locator(`[data-reference-id=${id}]`).isVisible())consulted.push(id);await page.click('#closeDossier');}
  check(routeId+': every pursuit chapter opens its actual reference dossier',JSON.stringify(consulted)===JSON.stringify(expectedIds),consulted);
  await page.check('#artDiagnostic');await page.click('#launch');
  await page.waitForFunction(()=>document.querySelector('#playStatus').textContent.includes('ses chapitres restent des dossiers consultables'));
  const refused=await page.evaluate(keys=>({engine:!!__HALO_QA__.engine,run:__HALO_QA__.run,message:document.querySelector('#playStatus').textContent,
   values:keys.map(key=>localStorage.getItem(key)),launchDisabled:document.querySelector('#launch').disabled}),preserved.names);
  check(routeId+': real launch refuses a fabricated combat run even with the image diagnostic enabled',!refused.engine&&!refused.run&&!refused.launchDisabled&&/ne possède pas encore de rencontre combattante compatible/.test(refused.message),refused.message);
  check(routeId+': archive launch preserves the existing earned checkpoint backup records and attempts byte-for-byte',JSON.stringify(refused.values)===JSON.stringify(preserved.values));
  report.scenes[routeId+'Archive']={text,ids,message:refused.message};
  const capture=routeId+'-archive-refusal.png';await page.screenshot({path:resolve(out,capture),fullPage:true});report.captures.push(capture);
 }
 for(const [routeId,expectedIds] of archiveRoutes){
  const legacy=await page.evaluate(async routeId=>{
   const {CHRONICLES}=await import('/src/data.js'),{createRun,validateRun}=await import('/src/run-progress.js'),{KEYS}=await import('/src/save-store.js');
   // Build an old full-route fixture from a compatible template, independently
   // of whether createRun accepts the pursuit route under today's policy.
   const route=CHRONICLES.find(r=>r.id===routeId),run=createRun({mode:'chronicle',routeId:'room_21',playerId:'sh1_air_screamer_001',seed:2405});
   run.routeId=routeId;delete run.chronicleFormat;delete run.chapterIndices;delete run.referenceDossiers;
   run.queue=[...route.fighters];run.stages=run.queue.map((_,i)=>route.stages[i%route.stages.length]);
   if(!validateRun(run))throw Error('old pursuit fixture invalid');localStorage.setItem(KEYS.run,JSON.stringify(run));
   const names=[KEYS.run,KEYS.run+':backup',KEYS.records,KEYS.chronicles];return {names,values:names.map(key=>localStorage.getItem(key))};
  },routeId);
  await page.reload();await page.waitForFunction(()=>!!window.__HALO_QA__);
  const text=await page.locator('#runCheckpointText').textContent();
  check(routeId+': old zero-win pursuit checkpoint is visible and explicitly suspended',await page.locator('#runCheckpoint').isVisible()&&text.includes('0/'+expectedIds.length+' victoires')&&/Reprise suspendue/.test(text)&&/Toute la progression est conservée/.test(text),text);
  await page.click('#resumeCheckpoint');
  const refused=await page.evaluate(keys=>({engine:!!__HALO_QA__.engine,message:document.querySelector('#playStatus').textContent,values:keys.map(key=>localStorage.getItem(key))}),legacy.names);
  check(routeId+': old pursuit resume refuses combat without deleting or rewriting its chapters',!refused.engine&&/aucune étape n’a été supprimée ou réécrite/.test(refused.message),refused.message);
  check(routeId+': refused pursuit resume preserves every checkpoint record and attempt byte-for-byte',JSON.stringify(refused.values)===JSON.stringify(legacy.values));
  report.scenes[routeId+'Legacy']={notice:text,message:refused.message};
  const capture=routeId+'-legacy-refusal.png';await page.screenshot({path:resolve(out,capture),fullPage:true});report.captures.push(capture);
 }
 check('no unhandled browser errors',report.errors.length===0,report.errors);
 await context.close();
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{await browser?.close();server?.kill('SIGTERM');report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
