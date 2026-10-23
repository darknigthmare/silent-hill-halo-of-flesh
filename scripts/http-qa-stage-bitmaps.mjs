/** Source HTTP fixtures for atomic bitmap actor+stage loading. No production art. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {crc32} from './raster-validation.mjs';
import {STAGES,VERSION} from '../src/data.js';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-stage-bitmaps');await mkdir(out,{recursive:true});
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4191';let server,browser;
const source=process.env.QA_SOURCE_TREE==='1';
const report={version:VERSION,build:source?'source':'dist',checks:[],errors:[],captures:[],fixtures:['Opaque 4×4 test PNGs and a manifest are injected only in Playwright HTTP routes. No production scenery or visual fidelity is claimed.','A failed pause retry and a newer storage warning are injected to verify recovery without changing production files.'],output:out};
const check=(name,passed)=>{report.checks.push({name,passed:!!passed});if(!passed)throw Error(name);};
function png(color){
  const chunk=(type,data)=>{const payload=Buffer.concat([Buffer.from(type),data]),length=Buffer.alloc(4),crc=Buffer.alloc(4);length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(payload));return Buffer.concat([length,payload,crc]);};
  const header=Buffer.alloc(13);header.writeUInt32BE(4);header.writeUInt32BE(4,4);header[8]=8;header[9]=6;
  const pixels=Buffer.concat(Array.from({length:4},()=>Buffer.concat([Buffer.from([0]),...Array.from({length:4},()=>Buffer.from([...color,255]))])));
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
}
const files=new Map(),registry={};
for(const [index,stage] of STAGES.slice(0,2).entries()){
  const frames=Array.from({length:2},(_,frame)=>{const bytes=png([35+index*50,40+frame*80,25]),sha256=createHash('sha256').update(bytes).digest('hex'),path=`assets/stages/${stage.id}.fixture.${sha256.slice(0,12)}.png`;files.set('/'+path,bytes);return {path,sha256,bytes:bytes.length,width:4,height:4};});
  registry[stage.id]={stageId:stage.id,source:stage.source,status:'integrated-candidate',fidelity:'unverified',mode:'replace',layers:[{id:'background',rect:[0,0,1,1],ticksPerFrame:6,loop:true,frames}]};
}
const routeURL=base+'/modules/unified-versus.html?qa=1&stage=midwich';
async function fixture({held=false,failed=false}={}){
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1400,height:1000}}),page=await context.newPage();
  const control={held,failed,releases:[],requests:0,release(){this.held=false;for(const done of this.releases.splice(0))done();}};
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('dialog',dialog=>dialog.accept());
  await context.addInitScript(()=>{
    window.stageDraws=[];const draw=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(image,...args){if(this.canvas.id==='game'&&image?.src?.includes('/assets/stages/'))window.stageDraws.push({path:new URL(image.src).pathname,args});return draw.call(this,image,...args);};
    window.focusTrace=[];for(const type of ['blur','focus','visibilitychange'])addEventListener(type,()=>focusTrace.push({type,hidden:document.hidden,frame:window.__HALO_QA__?.engine?.frame,paused:window.__HALO_QA__?.engine?.paused}));
  });
  await context.route('**/src/stage-bitmap-manifest.js',route=>route.fulfill({contentType:'text/javascript',body:'export const STAGE_BITMAPS='+JSON.stringify(registry)+';'}));
  await context.route('**/assets/stages/*.png',async route=>{control.requests++;if(control.held)await new Promise(resolve=>control.releases.push(resolve));const bytes=files.get(new URL(route.request().url()).pathname);await route.fulfill(control.failed?{status:503,body:'Fixture unavailable'}:{contentType:'image/png',body:bytes});});
  await page.goto(routeURL,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.__HALO_QA__);return {context,page,control};
}
try{
  if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4191',...(source?[]:['--dist'])],{cwd:root,stdio:'ignore'});
  let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}check('source HTTP server ready',ready);
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
  {
    const {context,page,control}=await fixture({held:true});
    await page.evaluate(()=>{window.startPending=__HALO_QA__.startFight();});await page.waitForFunction(()=>document.querySelector('#launch').disabled);
    check('FightEngine waits for all pending stage files',await page.evaluate(()=>!__HALO_QA__.engine&&__HALO_QA__.stageAssetCache.active>0));
    control.release();await page.waitForFunction(()=>!!__HALO_QA__.engine);check('engine commits only with every current actor and decor frame ready',await page.evaluate(()=>{
      const q=__HALO_QA__;return [...q.assetCache.pins].every(path=>q.assetCache.status(path)==='ready')&&[...q.stageAssetCache.pins].length===2&&[...q.stageAssetCache.pins].every(path=>q.stageAssetCache.status(path)==='ready');
    }));
    await page.waitForFunction(()=>stageDraws.length>2);check('combat canvas paints actual stage cache images',await page.evaluate(()=>stageDraws.every(draw=>draw.path.startsWith('/assets/stages/midwich.')&&draw.args[2]===1280&&draw.args[3]===720)));
    await page.click('#pauseBtn');
    await page.evaluate(()=>{window.oldEngine=__HALO_QA__.engine;window.oldStageImages=[...__HALO_QA__.stageAssetCache.pins].map(path=>[path,__HALO_QA__.stageAssetCache.peek(path)]);window.savedStagePrepare=__HALO_QA__.stageAssetCache.prepare;__HALO_QA__.stageAssetCache.prepare=async()=>({ok:false,missing:[],failed:['fixture-stage']});});
    await page.click('[data-pause=retry]');await page.waitForFunction(()=>document.querySelector('#pauseFeedback').textContent.includes('chargée'));
    check('failed pause retry preserves old paused engine and decoded pinned decor',await page.evaluate(()=>__HALO_QA__.engine===oldEngine&&oldEngine.paused&&oldStageImages.every(([path,image])=>__HALO_QA__.stageAssetCache.peek(path)===image)&&document.querySelector('[aria-labelledby=pauseTitle]').open));
    await page.evaluate(()=>{__HALO_QA__.stageAssetCache.prepare=savedStagePrepare;window.drawsBeforeRetry=stageDraws.length;window.focusTrace=[];});await page.click('[data-pause=retry]');await page.waitForFunction(()=>__HALO_QA__.engine!==oldEngine);
    check('successful retry replaces engine and closes pause only after readiness',await page.evaluate(()=>!document.querySelector('[aria-labelledby=pauseTitle]').open&&!__HALO_QA__.engine.paused&&oldEngine.destroyed));
    report.recoveryBeforeFirstFrame=await page.evaluate(()=>({frame:__HALO_QA__.engine.frame,paused:__HALO_QA__.engine.paused,button:document.querySelector('#pauseBtn').textContent,status:document.querySelector('#playStatus').textContent}));
    await page.waitForFunction(()=>__HALO_QA__.engine.frame>=3&&stageDraws.length>drawsBeforeRetry&&!__HALO_QA__.engine.paused);
    report.recoveryAfterFirstFrames=await page.evaluate(()=>({frame:__HALO_QA__.engine.frame,paused:__HALO_QA__.engine.paused,button:document.querySelector('#pauseBtn').textContent,events:focusTrace}));
    check('the new intro publishes its unpaused button state immediately',report.recoveryBeforeFirstFrame.button==='PAUSE'&&report.recoveryAfterFirstFrames.button==='PAUSE'&&await page.locator('#pauseBtn').getAttribute('aria-pressed')==='false');
    check('successful retry clears the obsolete loading error before stable capture',await page.evaluate(()=>document.querySelector('#playStatus').classList.contains('hidden')&&document.querySelector('#playStatus').textContent===''&&document.querySelector('#pauseFeedback').textContent===''&&document.querySelector('#spriteLaunchStatus').textContent===''));
    await page.waitForFunction(()=>!document.querySelector('dialog[open]')&&__HALO_QA__.engine.phase==='fight'&&!__HALO_QA__.engine.paused);
    await page.evaluate(()=>{window.drawsBeforeStableCapture=stageDraws.length;});
    await page.waitForFunction(()=>stageDraws.length>drawsBeforeStableCapture&&__HALO_QA__.engine.phase==='fight'&&!__HALO_QA__.engine.paused);
    report.readyCapture=await page.evaluate(()=>({phase:__HALO_QA__.engine.phase,frame:__HALO_QA__.engine.frame,paused:__HALO_QA__.engine.paused,button:document.querySelector('#pauseBtn').textContent,dialogs:document.querySelectorAll('dialog[open]').length,status:document.querySelector('#playStatus').textContent}));
    await page.screenshot({path:out+'/ready.png'});report.captures.push('ready.png');await context.close();
  }
  {
    const {context,page,control}=await fixture({failed:true});await page.check('#artDiagnostic');
    await page.evaluate(()=>{localStorage.setItem('sh-halo-of-flesh-run-v1','unchanged-stage-fixture');window.beforeSelection=JSON.stringify(__HALO_QA__.selection);});
    const started=await page.evaluate(()=>__HALO_QA__.startFight());check('HTTP stage failure blocks even explicit actor diagnostic mode',!started&&await page.evaluate(()=>!__HALO_QA__.engine&&document.querySelector('#spriteLaunchStatus').textContent.includes('décor')));
    check('failed loading preserves selection and persistent checkpoint',await page.evaluate(()=>JSON.stringify(__HALO_QA__.selection)===beforeSelection&&localStorage.getItem('sh-halo-of-flesh-run-v1')==='unchanged-stage-fixture'));
    control.failed=false;
    await page.evaluate(()=>{const cache=__HALO_QA__.stageAssetCache,prepare=cache.prepare;let calls=0;cache.prepare=async function(...args){const result=await prepare.apply(this,args);if(++calls===2)dispatchEvent(new CustomEvent('shhf-storage-status',{detail:{kind:'unavailable'}}));return result;};});
    check('retry after the real HTTP failure starts successfully',await page.evaluate(()=>__HALO_QA__.startFight()));check('retry issues a new stage request',control.requests>=3);
    check('a newer memory warning survives the successful loading commit',await page.evaluate(()=>!document.querySelector('#playStatus').classList.contains('hidden')&&document.querySelector('#playStatus').textContent.includes('Mémoire locale indisponible')&&!document.querySelector('#playStatus').textContent.includes('décor')));await context.close();
  }
  {
    const {context,page,control}=await fixture({held:true});await page.evaluate(()=>{window.startPending=__HALO_QA__.startFight();});await page.waitForFunction(()=>document.querySelector('#launch').disabled);
    await page.click('#openGallery');await page.locator('.stage-entry').nth(1).click();await page.waitForFunction(()=>__HALO_QA__.selection.stage.id==='alchemilla');control.release();
    check('selection change cancels pending combat without constructing an engine',await page.evaluate(async()=>!await startPending&&!__HALO_QA__.engine&&__HALO_QA__.selection.stage.id==='alchemilla'));
    check('selection cancellation restores the previous empty asset leases',await page.evaluate(()=>__HALO_QA__.assetCache.pins.size===0&&__HALO_QA__.stageAssetCache.pins.size===0));await context.close();
  }
  {
    const {context,page,control}=await fixture({held:true});await page.evaluate(()=>{window.startPending=__HALO_QA__.startFight();});await page.waitForFunction(()=>document.querySelector('#launch').disabled);await page.evaluate(()=>__HALO_QA__.showSelect());control.release();
    check('menu cancellation invalidates loading and does not resurrect its leases',await page.evaluate(async()=>!await startPending&&!__HALO_QA__.engine&&__HALO_QA__.assetCache.pins.size===0&&__HALO_QA__.stageAssetCache.pins.size===0&&!document.querySelector('#launch').disabled));await context.close();
  }
  check('no unhandled browser exceptions',report.errors.length===0);
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
