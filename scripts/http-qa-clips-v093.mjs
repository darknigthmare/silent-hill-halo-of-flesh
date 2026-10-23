/** Real browser/HTTP tests of editing existing raster timelines, not generated animation art. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {VERSION} from '../src/data.js';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-clips-v093');await mkdir(out,{recursive:true});
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4178';let server,browser;
const STATIC_SUBJECT='film_red_pyramid_film_175',ANIMATED_SUBJECT='sh1_air_screamer_001';
const report={version:VERSION,checks:[],errors:[],captures:[],fixtures:['Two repeated steps referencing the same real PNG test static-vs-animation accounting; no new artwork is created.']};
const check=(name,passed)=>{report.checks.push({name,passed:!!passed});if(!passed)throw Error(name);};
const shot=async(page,name)=>{await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});report.captures.push(name+'.png');};
async function selectSubject(page,id,source,requireRaster=true){
 await page.fill('#spriteSearch','');await page.selectOption('#spriteSource',source);
 await page.fill('#spriteSearch',id);await page.locator(`.sprite-card[data-id="${id}"]`).click();
 await page.waitForFunction(({id,requireRaster})=>{const c=document.querySelector('#spriteDetail canvas');return c?.dataset.spriteId===id&&(!requireRaster||c.dataset.artStatus==='raster');},{id,requireRaster});
}
try{
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4178','--dist'],{cwd:root,stdio:'ignore'});
 let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}check('static HTTP server starts',ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
 const context=await browser.newContext({viewport:{width:1440,height:1040}}),page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base+'/modules/sprite-workshop.html');await selectSubject(page,STATIC_SUBJECT,'film');
 check('one disposable editor mounts beside the real bitmap',await page.locator('.clip-editor').count()===1);
 const before=await page.evaluate(async()=>({art:JSON.stringify((await import('/src/sprite-manifest.js')).SPRITES),storage:JSON.stringify({...localStorage})}));
 await page.locator('.clip-editor summary').click();await page.click('[data-clip=add]');
 check('new step references an existing image instead of creating an asset',await page.locator('[data-clip-frame]').count()===2&&await page.locator('[data-clip-frame="1"] option').count()===1);
 await page.fill('[data-clip-ticks="0"]','4');await page.fill('[data-clip-ticks="1"]','7');await page.check('[data-clip=loop]');
 await page.locator('.clip-row').nth(1).locator('[data-clip-action=up]').click();
 check('reordering preserves each step duration',await page.locator('[data-clip-ticks="0"]').inputValue()==='7'&&await page.locator('[data-clip-ticks="1"]').inputValue()==='4');
 await page.locator('.clip-row').nth(0).locator('[data-clip-action=down]').click();await page.click('[data-clip=preview]');
 check('draft duration drives the actual inspector timeline',await page.locator('[data-inspect=tick]').getAttribute('max')==='10');
 check('repeated static art cannot enable animation playback',await page.locator('[data-inspect=play]').isDisabled()&&/pose statique/.test(await page.locator('[data-clip=status]').textContent()));
 check('local preview is explicitly marked as an unpublished draft',await page.locator('#spriteDetail canvas').getAttribute('data-clip-draft')==='true'&&/NON PUBLIÉ/.test(await page.locator('[data-inspect=status]').textContent()));
 const waiting=page.waitForEvent('download');await page.click('[data-clip=export]');const downloaded=await waiting;const target=resolve(out,'clip.json');await downloaded.saveAs(target);const packet=JSON.parse(await readFile(target,'utf8'));
 check('export contains exact frame identity and previous timeline',packet.kind==='halo-sprite-clip'&&packet.frameSet.length===1&&packet.previousClip.frames.length===1&&packet.frameSet[0].sha256.length===64&&JSON.stringify(packet.clip.frameTicks)==='[4,7]');
 await page.fill('[data-clip-ticks="0"]','0');await page.click('[data-clip=preview]');check('invalid duration is visibly rejected',/durée/.test(await page.locator('[data-clip=error]').textContent()));
 await page.click('[data-clip=reset]');check('reset restores original timeline without a new image',await page.locator('[data-clip-frame]').count()===1&&await page.locator('#spriteDetail canvas').getAttribute('data-clip-draft')==='false');
 await page.selectOption('[data-inspect=pose]','neutralLight');check('actual move phases are exposed and independent looping is forbidden',await page.locator('[data-clip=loop]').isDisabled()&&/préparation.*impact.*récupération/.test(await page.locator('[data-clip=timing]').textContent()));
 await page.click('[data-clip=export]');check('idle alone cannot be exported as a newly invented attack pose',/image dédiée/.test(await page.locator('[data-clip=error]').textContent()));
 await shot(page,'01-clip-authoring');
 await selectSubject(page,ANIMATED_SUBJECT,'sh1');await page.locator('.clip-editor summary').click();
 check('Air Screamer authoring exposes the current four-step idle and three existing image choices',await page.locator('[data-clip-frame]').count()===4&&await page.locator('[data-clip-frame="0"] option').count()===3&&await page.locator('[data-clip=loop]').isChecked());
 await page.selectOption('[data-clip-frame="0"]','2');await page.fill('[data-clip-ticks="0"]','8');await page.click('[data-clip=preview]');
 check('a multi-image local draft retains its loop and enables real inspector playback',await page.locator('[data-inspect=play]').isEnabled()&&await page.locator('[data-inspect=tick]').getAttribute('max')==='25'&&await page.locator('#spriteDetail canvas').getAttribute('data-clip-draft')==='true'&&/séquence multi-images candidate/.test(await page.locator('[data-clip=status]').textContent()));
 const airDownload=page.waitForEvent('download');await page.click('[data-clip=export]');const airFile=await airDownload;const airTarget=resolve(out,'air-idle-clip.json');await airFile.saveAs(airTarget);const airPacket=JSON.parse(await readFile(airTarget,'utf8'));
 check('Air Screamer export preserves all three image identities and the previous four-step clip',airPacket.fighterId===ANIMATED_SUBJECT&&airPacket.source==='sh1'&&airPacket.frameSet.length===3&&new Set(airPacket.frameSet.map(f=>f.sha256)).size===3&&JSON.stringify(airPacket.previousClip.frames)==='[0,1,0,2]'&&airPacket.clip.frames[0]===2&&airPacket.clip.frameTicks[0]===8&&airPacket.clip.loop);
 await page.click('[data-clip=reset]');
 check('reset restores the imported multi-image idle rather than a single-frame placeholder',await page.locator('[data-clip-frame]').count()===4&&await page.locator('[data-clip-frame="0"]').inputValue()==='0'&&await page.locator('[data-clip-ticks="0"]').inputValue()==='6'&&await page.locator('[data-inspect=tick]').getAttribute('max')==='23'&&await page.locator('#spriteDetail canvas').getAttribute('data-clip-draft')==='false');
 const after=await page.evaluate(async()=>({art:JSON.stringify((await import('/src/sprite-manifest.js')).SPRITES),storage:JSON.stringify({...localStorage})}));
 check('editing and export do not change authoritative art or player saves',before.art===after.art&&before.storage===after.storage);
 await page.fill('#spriteSearch','');await page.selectOption('#spriteSource','film');await page.waitForFunction(()=>document.querySelector('#spriteDetail canvas')?.dataset.artStatus==='raster');await page.selectOption('#spriteFilter','all');await page.selectOption('#spriteSource','all');
 check('filter reset keeps the dossier on the visible first page',await page.evaluate(()=>[...document.querySelectorAll('.sprite-card')].some(c=>c.dataset.id===document.querySelector('#spriteDetail canvas').dataset.spriteId)));
 check('filter navigation leaves exactly one live editor',await page.locator('.clip-editor').count()===1);
 await page.setViewportSize({width:430,height:932});await page.locator('.clip-editor summary').click();await page.click('[data-clip=add]');await page.locator('[data-clip=export]').scrollIntoViewIfNeeded();check('timeline controls fit the mobile viewport',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(page,'02-mobile-editor');
 await page.goto(base);await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});await context.setOffline(true);await page.goto(base+'/modules/sprite-workshop.html');await selectSubject(page,STATIC_SUBJECT,'film');await page.locator('.clip-editor summary').click();await page.click('[data-clip=add]');check('new authoring modules and controls work completely offline',await page.locator('[data-clip-frame]').count()===2&&await page.locator('[data-clip-frame="1"] option').count()===1);await shot(page,'03-offline-editor');await context.close();
 const failureContext=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1040}}),failed=await failureContext.newPage();failed.on('pageerror',e=>report.errors.push(e.message));
 await failed.route('**/assets/sprites/**',route=>route.abort('failed'));await failed.goto(base+'/modules/sprite-workshop.html');await selectSubject(failed,STATIC_SUBJECT,'film',false);await failed.locator('[data-inspect=retry]').waitFor({state:'visible'});
 check('failed inspector load says the frame is not displayed',/IMAGE INDISPONIBLE/.test(await failed.locator('[data-inspect=status]').textContent()));await failed.unroute('**/assets/sprites/**');await failed.click('[data-inspect=retry]');await failed.waitForFunction(()=>document.querySelector('#spriteDetail canvas')?.dataset.artStatus==='raster');check('explicit retry recovers the inspector without reloading the page',await failed.locator('[data-inspect=retry]').isHidden());await shot(failed,'04-recovered-inspector');await failureContext.close();
 check('no unhandled browser exceptions',report.errors.length===0);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
