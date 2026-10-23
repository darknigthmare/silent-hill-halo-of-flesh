/** Real HTTP/PWA raster checks; isolated local UI tests are reported separately. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {SPRITES} from '../src/sprite-manifest.js';
import {VERSION} from '../src/data.js';
const root=resolve(new URL('../',import.meta.url).pathname),out=resolve(root,'tests/http-sprites');await mkdir(out,{recursive:true});
const report={version:VERSION,kind:'real HTTP raster and offline checks',checks:[],errors:[],captures:[],fixtures:['saved arcade checkpoint for non-mutation assertion; no completed campaign simulated as play']};
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4175';let server,browser;
const assert=(name,ok)=>{report.checks.push({name,passed:!!ok});if(!ok)throw Error(name);};
const shot=async(page,name)=>{await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});report.captures.push(name+'.png');};
const ready=page=>page.waitForFunction(()=>document.querySelector('#p1Portrait')?.dataset.artStatus==='raster'&&document.querySelector('#p2Portrait')?.dataset.artStatus==='raster');
const pageIn=async context=>{const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('dialog',d=>d.accept());return page;};
try{
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4175','--dist'],{cwd:root,stdio:'ignore'});
 let available=false;for(let i=0;i<80;i++){try{if((await fetch(base)).ok){available=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert('static build HTTP server starts',available);
 for(const art of Object.values(SPRITES)){const frame=art.frames[0],response=await fetch(base+'/'+frame.path),bytes=Buffer.from(await response.arrayBuffer());assert('HTTP exact PNG digest: '+art.fighterId,response.ok&&response.headers.get('content-type').includes('image/png')&&createHash('sha256').update(bytes).digest('hex')===frame.sha256);}
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=await browser.version();
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await pageIn(context);
 await page.goto(base+'/modules/unified-versus.html?qa=1');await ready(page);assert('both exact-ID candidate portraits decode from HTTP',true);
 assert('catalogue remains 30 per page',await page.locator('#roster > *').count()===30);await shot(page,'01-selection');
 await page.check('#artReadyOnly');assert('available-only filter has exactly three profiles',await page.locator('#roster > *').count()===3);
 await page.click('#randomAll');assert('random chooses only available art',await page.evaluate(()=>[__HALO_QA__.selection.p1,__HALO_QA__.selection.p2].every(f=>__HALO_QA__.spriteStatus(f).kind==='candidate')));
 await page.selectOption('#mode','local');await page.click('#launch');await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='fight');
 assert('normal battle loads without diagnostic mode',await page.evaluate(()=>!__HALO_QA__.engine.config.artDiagnostic));await shot(page,'02-battle');
 await page.click('#pauseBtn');const frame=await page.evaluate(()=>__HALO_QA__.engine.frame);await page.waitForTimeout(150);assert('pause freezes the actual simulation',await page.evaluate(n=>__HALO_QA__.engine.frame===n,frame));await page.keyboard.press('Escape');await page.click('#leaveFight');
 await page.uncheck('#artReadyOnly');await page.fill('#search','Sakura Head');await page.locator('#roster > *').first().click();await page.click('#launch');assert('missing art blocks normal launch instead of fake monster geometry',await page.evaluate(()=>!__HALO_QA__.engine)&&/produire/.test(await page.locator('#spriteLaunchStatus').textContent()));
 await page.check('#artDiagnostic');await page.click('#launch');await page.waitForFunction(()=>!!__HALO_QA__.engine);assert('engine diagnostic is an explicit opt-in',await page.evaluate(()=>__HALO_QA__.engine.config.artDiagnostic));
 // A valid checkpoint fixture must survive a rejected new run unchanged.
 const saved=await page.evaluate(async()=>{const {createRun}=await import('/src/run-progress.js');const r=createRun({mode:'arcade',playerId:'film_red_pyramid_film_175',seed:19});const text=JSON.stringify(r);localStorage.setItem('sh-halo-of-flesh-run-v1',text);return text;});
 await page.goto(base+'/modules/unified-versus.html?qa=1&preset=boss');await page.click('#launch');await page.waitForFunction(()=>!document.querySelector('#launch').disabled);assert('whole-run art gate preserves existing checkpoint byte-for-byte',await page.evaluate(()=>localStorage.getItem('sh-halo-of-flesh-run-v1'))===saved);
 await page.goto(base+'/modules/sprite-workshop.html');assert('workshop displays 3 of 230, not full art coverage',/3 \/ 230/.test(await page.locator('#coverage').textContent()));assert('workshop has three integrated candidates',await page.locator('.sprite-card').count()===3);await shot(page,'03-workshop');await page.selectOption('#spriteFilter','missing');assert('unproduced queue is paginated',await page.locator('.sprite-card').count()===18);await page.click('#spriteNext');assert('missing-art paging advances',/2\//.test(await page.locator('#spritePage').textContent()));
 assert('workshop missing filter selects a matching missing dossier',await page.locator('#spriteDetail canvas').getAttribute('data-art-status')==='missing'&&await page.locator('#spriteDetail a').count()===0);
 await page.fill('#spriteSearch','no-profile-matches-987654321');assert('workshop empty search clears the stale dossier',await page.locator('#spriteDetail canvas').count()===0&&await page.locator('#spriteDetail a').count()===0);
 await page.fill('#spriteSearch','');await page.selectOption('#spriteFilter','ready');assert('workshop ready filter restores a matching image dossier',await page.locator('#spriteDetail a').count()===2);
 await page.selectOption('#spriteSource','film');assert('workshop source filter updates exact dossier identity',await page.locator('#spriteDetail code').first().textContent()==='film_red_pyramid_film_175');
 // The shell activates the genuine versioned offline service worker.
 await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});assert('real service worker controls the page',true);
 await context.setOffline(true);await page.goto(base+'/modules/unified-versus.html?qa=1');await ready(page);assert('both native PNG portraits and modules load fully offline',true);await page.click('#launch');await page.waitForFunction(()=>!!__HALO_QA__.engine);assert('normal raster battle launches offline',true);await shot(page,'04-offline');await context.setOffline(false);
 await page.setViewportSize({width:430,height:932});await page.goto(base+'/modules/unified-versus.html?qa=1');await ready(page);assert('mobile selection stays inside viewport width',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(page,'05-mobile');await page.goto(base+'/modules/sprite-workshop.html');assert('workshop detail can scroll to its final link',await page.locator('#spriteDetail a').last().evaluate(e=>{e.scrollIntoView();return e.getBoundingClientRect().bottom<=innerHeight+1;}));
 await page.goto(base+'/modules/unified-versus.html?qa=1&p1=film_red_pyramid_film_175&p2=sh1_air_screamer_001');await ready(page);
 await page.evaluate(()=>{__HALO_QA__.assetCache.maxBytes=1536*1024*4;});await page.click('#launch');await page.waitForFunction(()=>!document.querySelector('#launch').disabled);
 assert('aggregate combat memory budget blocks launch before a new engine',await page.evaluate(()=>!__HALO_QA__.engine&&__HALO_QA__.assetCache.bytes<=__HALO_QA__.assetCache.maxBytes));
 await context.close();
 const faults=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}}),bad=await pageIn(faults);await faults.route('**/assets/sprites/**',route=>route.abort());
 await bad.goto(base+'/modules/unified-versus.html?qa=1');await bad.click('#launch');await bad.waitForFunction(()=>!document.querySelector('#launch').disabled);assert('image failure never starts an invisible normal fight',await bad.evaluate(()=>!__HALO_QA__.engine));await faults.unroute('**/assets/sprites/**');await bad.click('#launch');await bad.waitForFunction(()=>!!__HALO_QA__.engine);assert('explicit retry recovers from an image load error',true);await faults.close();
 const delayed=await browser.newContext({serviceWorkers:'block'}),slow=await pageIn(delayed);await delayed.route('**/assets/sprites/**',async route=>{await new Promise(r=>setTimeout(r,600));await route.continue();});
 await slow.goto(base+'/modules/unified-versus.html?qa=1',{waitUntil:'domcontentloaded'});await slow.waitForFunction(()=>!!window.__HALO_QA__);await slow.click('#launch');await slow.fill('#search','Sakura Head');await slow.locator('#roster > *').first().click();await slow.waitForTimeout(900);assert('stale preflight cannot launch a newly changed selection',await slow.evaluate(()=>!__HALO_QA__.engine));await delayed.close();
 assert('no uncaught JavaScript exceptions',report.errors.length===0);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
