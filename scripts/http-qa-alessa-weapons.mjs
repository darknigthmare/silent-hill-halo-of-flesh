/** Exact-weapon loading/playback and authoring fixtures; these rectangles are not production art. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {crc32} from './raster-validation.mjs';
import {VERSION} from '../src/data.js';
import {ALESSA_FIGHTER_ID,ALESSA_WEAPON_PHASES} from '../src/weapon-phases.js';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-alessa-weapons');await mkdir(out,{recursive:true});
const source=process.env.QA_SOURCE_TREE==='1',base=process.env.QA_BASE_URL||'http://127.0.0.1:4192';let server,browser;
const report={version:VERSION,build:source?'source':'dist',checks:[],errors:[],captures:[],fixtures:['Four transparent colored rectangles and an exact SH3 Alessa manifest are intercepted in Playwright only. No production artwork or 1:1 certification is created.']};
const check=(name,passed)=>{report.checks.push({name,passed:!!passed});if(!passed)throw Error(name);};
function png(index){
 const chunk=(type,data)=>{const payload=Buffer.concat([Buffer.from(type),data]),length=Buffer.alloc(4),crc=Buffer.alloc(4);length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(payload));return Buffer.concat([length,payload,crc]);};
 const header=Buffer.alloc(13);header.writeUInt32BE(300);header.writeUInt32BE(400,4);header[8]=8;header[9]=6;
 const data=Buffer.alloc(400*(1+300*4));for(let y=20;y<380;y++)for(let x=40;x<260;x++){const at=y*(1+300*4)+1+x*4;data[at]=30+index*60;data[at+1]=190-index*35;data[at+2]=70+index*40;data[at+3]=255;}
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(data)),chunk('IEND',Buffer.alloc(0))]);
}
const files=new Map(),keys=ALESSA_WEAPON_PHASES.map(phase=>`idle@${ALESSA_FIGHTER_ID}:weapon:${phase.id}`),frames=ALESSA_WEAPON_PHASES.map((phase,index)=>{
 const bytes=png(index),sha256=createHash('sha256').update(bytes).digest('hex'),path=`assets/sprites/${ALESSA_FIGHTER_ID}.${sha256.slice(0,12)}.png`;files.set('/'+path,bytes);
 return {path,sha256,pixelSHA256:sha256,bytes:bytes.length,width:300,height:400,anchor:[.5,1],bodyHeight:.9,facing:1,visibleBounds:[40,20,260,380]};
});
const clip=index=>({frames:[index],ticksPerFrame:6,loop:false});
const asset={fighterId:ALESSA_FIGHTER_ID,source:'sh3',status:'integrated-candidate',fidelity:'unverified',animatedClips:0,portrait:frames[0],frames,clips:{idle:clip(0),...Object.fromEntries(keys.map((key,index)=>[key,clip(index)]))}};
async function fixture({missingSmg=false}={}){
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1400,height:1000},acceptDownloads:true}),page=await context.newPage(),art=structuredClone(asset);
 if(missingSmg)delete art.clips[keys[3]];
 page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
 await context.addInitScript(()=>{
  window.imageCalls=[];window.cards=[];const image=CanvasRenderingContext2D.prototype.drawImage,text=CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.drawImage=function(bitmap,...args){if(bitmap?.src?.includes('/assets/sprites/'))imageCalls.push({canvas:this.canvas.id||'inspector',path:new URL(bitmap.src).pathname});return image.call(this,bitmap,...args);};
  CanvasRenderingContext2D.prototype.fillText=function(value,...args){if(value==='POSE D’ARME À PRODUIRE')cards.push({canvas:this.canvas.id||'inspector',value});return text.call(this,value,...args);};
 });
 await context.route('**/src/sprite-manifest.js',route=>route.fulfill({contentType:'text/javascript',body:'export const SPRITES='+JSON.stringify({[ALESSA_FIGHTER_ID]:art})+';'}));
 await context.route('**/assets/sprites/*.png',route=>{const bytes=files.get(new URL(route.request().url()).pathname);return route.fulfill(bytes?{contentType:'image/png',body:bytes}:{status:404,body:'No fixture for another subject'});});
 return {context,page};
}
async function start(page){await page.goto(base+`/modules/unified-versus.html?qa=1&p1=${ALESSA_FIGHTER_ID}&p2=${ALESSA_FIGHTER_ID}`);await page.waitForFunction(()=>!!window.__HALO_QA__);await page.selectOption('#mode','local');check('fixture launches through the normal asset preflight',await page.evaluate(()=>__HALO_QA__.startFight()));await page.waitForFunction(()=>__HALO_QA__.engine.phase==='fight');}
async function next(page,index){check('documented weapon transition accepted '+index,await page.evaluate(()=>__HALO_QA__.engine.forceBossPhase(0)));await page.waitForFunction(index=>__HALO_QA__.engine.actors[0].weaponPhaseIndex===index&&!__HALO_QA__.engine.actors[0].weaponTransition,index);}
try{
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4192',...(source?[]:['--dist'])],{cwd:root,stdio:'ignore'});
 let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}check('HTTP server ready',ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
 {
  const {context,page}=await fixture();await start(page);
  for(let index=0;index<4;index++){
   if(index)await next(page,index);
   await page.waitForFunction(path=>imageCalls.some(call=>call.canvas==='game'&&call.path===path),'/'+frames[index].path);
   check('real actor phase renders exact weapon '+ALESSA_WEAPON_PHASES[index].id,await page.evaluate(async key=>{const {actorSpriteState,requestedSpriteClipKey}=await import('/src/sprite-animation.js');return requestedSpriteClipKey(actorSpriteState(__HALO_QA__.engine.actors[0]))===key;},keys[index]));
  }
  await context.close();
 }
 {
  const {context,page}=await fixture({missingSmg:true});await start(page);for(let index=1;index<4;index++)await next(page,index);
  await page.waitForFunction(()=>cards.some(call=>call.canvas==='game'));
  check('missing SMG is a card even when generic knife and SMG pixels are loaded',await page.evaluate(path=>cards.some(call=>call.canvas==='game')&&!imageCalls.some(call=>call.canvas==='game'&&call.path===path),'/'+frames[3].path));
  await page.locator('#game').screenshot({path:out+'/missing-smg.png'});report.captures.push('missing-smg.png');await context.close();
 }
 {
  const {context,page}=await fixture({missingSmg:true});await page.goto(base+'/modules/sprite-workshop.html');await page.selectOption('#spriteSource','sh3');await page.fill('#spriteSearch',ALESSA_FIGHTER_ID);await page.locator(`.sprite-card[data-id="${ALESSA_FIGHTER_ID}"]`).click();
  check('inspector exposes all four exact weapon choices',await page.locator('[data-inspect=pose] option').evaluateAll((options,keys)=>keys.every(key=>options.some(option=>option.value===key)),keys));
  await page.selectOption('[data-inspect=pose]',keys[1]);await page.waitForFunction(()=>document.querySelector('#spriteDetail canvas').dataset.frameIndex==='1'&&document.querySelector('#spriteDetail canvas').dataset.artStatus==='raster');
  await page.evaluate(()=>{window.imageCalls=[];});await page.selectOption('[data-inspect=pose]',keys[3]);
  check('missing inspector weapon clears old pixels and disables calibration/playback',await page.evaluate(()=>{const canvas=document.querySelector('#spriteDetail canvas');return canvas.dataset.artStatus==='missing'&&canvas.dataset.frameIndex===''&&!imageCalls.some(call=>call.canvas==='inspector')&&document.querySelector('[data-inspect=play]').disabled&&document.querySelector('[data-inspect=export]').disabled&&document.querySelector('[data-inspect=status]').textContent.includes('POSE D’ARME À PRODUIRE');}));
  await page.selectOption('[data-inspect=pose]','ko');check('inspector keeps the selected weapon when inspecting a missing KO',await page.evaluate(()=>{const canvas=document.querySelector('#spriteDetail canvas');return canvas.dataset.artStatus==='missing'&&canvas.dataset.weaponContext==='sh3_memory_of_alessa_049:weapon:smg'&&!imageCalls.some(call=>call.canvas==='inspector');}));await page.selectOption('[data-inspect=pose]',keys[3]);
  await page.locator('.clip-editor summary').click();await page.selectOption('[data-clip-frame="0"]','1');await page.click('[data-clip=preview]');
  check('editor refuses to lend handgun image to SMG',/partagée|image dédiée/.test(await page.locator('[data-clip=error]').textContent()));
  await page.selectOption('[data-clip-frame="0"]','3');await page.click('[data-clip=preview]');await page.waitForFunction(()=>document.querySelector('#spriteDetail canvas').dataset.frameIndex==='3');
  const pending=page.waitForEvent('download');await page.click('[data-clip=export]');const download=await pending;await download.saveAs(out+'/smg-clip.json');
  check('dedicated SMG draft renders and exports while remaining unpublished',await page.evaluate(()=>document.querySelector('#spriteDetail canvas').dataset.artStatus==='raster'&&document.querySelector('#spriteDetail canvas').dataset.clipDraft==='true'&&document.querySelector('[data-clip=error]').textContent===''));
  await page.screenshot({path:out+'/inspector.png',fullPage:true});report.captures.push('inspector.png');await context.close();
 }
 check('no unhandled browser exceptions',report.errors.length===0);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
