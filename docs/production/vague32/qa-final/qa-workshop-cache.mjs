/** Focused HTTP checks for the repaired Nurse contract and maximal native pair. */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const load=createRequire(import.meta.url);
let chromium;
try { ({chromium}=load('playwright-core')); }
catch { ({chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/__halo_qa_loader.cjs')('playwright-core')); }
const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)));
const out=join(root,'docs/production/vague32/qa-final/workshop-cache');
const port=4294,base='http://127.0.0.1:'+port;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={schema:1,wave:32,startedAt:new Date().toISOString(),passed:false,checks:[],captures:[],errors:[],
  method:'Built HTTP app, fresh browser contexts, ordinary workshop controls and duel launch. Read-only production state and passive drawImage observation; no game-state, asset, clock or input substitution.',
  limits:['Two static Nurse preview states and one ordinary maximum-cache duel launch only.','No full battle, original source motion, offline update or 1:1 fidelity claim.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
let server,browser;
await mkdir(out,{recursive:true});
async function capture(locator,file){const bytes=await locator.screenshot({path:join(out,file)});report.captures.push({file,bytes:bytes.length,sha256:sha(bytes)});}
try {
  let occupied=false;try{await fetch(base,{signal:AbortSignal.timeout(600)});occupied=true;}catch{}
  check('Dedicated port is unused',!occupied);
  server=spawn(process.execPath,['scripts/server.mjs',String(port),'--dist'],{cwd:root,stdio:'ignore'});
  let ready=false;for(let n=0;n<100;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(done=>setTimeout(done,100));}
  check('Built HTTP app ready',ready);
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}});
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  await page.addInitScript(()=>{
    window.__wave32CacheDraws={};const original=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
      const result=original.call(this,image,...args);
      if(image?.src&&(this.canvas.id==='game'||this.canvas.closest?.('#spriteDetail'))){
        const path=new URL(image.src,location.href).pathname;
        window.__wave32CacheDraws[(this.canvas.id||'workshop')+'|'+path]={path,canvas:this.canvas.id||'workshop',width:image.naturalWidth,height:image.naturalHeight};
      }
      return result;
    };
  });
  const id='sh3_nurse_revolver_044';
  await page.goto(base+'/modules/sprite-workshop.html',{waitUntil:'domcontentloaded'});
  await page.locator('#spriteSearch').fill(id);await page.locator('.sprite-card[data-id="'+id+'"]').click();
  await page.locator('[data-inspect=pose]').selectOption('neutralLight');
  await page.waitForFunction(()=>{const c=document.querySelector('#spriteDetail canvas');return c?.dataset.pose==='neutralLight'&&c.dataset.frameIndex==='2'&&c.dataset.artStatus==='raster';});
  const light=await page.locator('#spriteDetail').evaluate(async detail=>{
    const {SPRITES}=await import('/src/sprite-manifest.js'),art=SPRITES.sh3_nurse_revolver_044;
    return {pose:detail.querySelector('canvas').dataset.pose,frame:detail.querySelector('canvas').dataset.frameIndex,
      status:detail.querySelector('[data-inspect=status]').textContent,disabled:detail.querySelector('[data-inspect=play]').disabled,
      path:art.frames[2].path,sha256:art.frames[2].sha256,bytes:art.frames[2].bytes,painted:Object.values(window.__wave32CacheDraws).some(draw=>draw.canvas==='workshop'&&draw.path==='/'+art.frames[2].path)};
  });
  check('Nurse light preview paints exact frame 2 with no missing warning and no animation playback',light.pose==='neutralLight'&&light.frame==='2'&&light.painted&&light.disabled&&!/À PRODUIRE/.test(light.status),light);
  const response=await page.request.get(base+'/'+light.path),bytes=await response.body();
  check('Nurse light PNG served byte-for-byte',response.status()===200&&bytes.length===light.bytes&&sha(bytes)===light.sha256);
  await capture(page.locator('#spriteDetail'),'nurse-light-present.png');
  await page.locator('[data-inspect=pose]').selectOption('neutralHeavy');
  const heavy=await page.locator('#spriteDetail').evaluate(detail=>({pose:detail.querySelector('canvas').dataset.pose,requested:detail.querySelector('canvas').dataset.requestedPose,frame:detail.querySelector('canvas').dataset.frameIndex,status:detail.querySelector('[data-inspect=status]').textContent,disabled:detail.querySelector('[data-inspect=play]').disabled}));
  check('Nurse missing heavy preview retains explicit idle fallback and missing warning',heavy.pose==='idle'&&heavy.requested==='neutralHeavy'&&heavy.frame==='0'&&heavy.disabled&&/À PRODUIRE/.test(heavy.status),heavy);
  await capture(page.locator('#spriteDetail'),'nurse-heavy-missing.png');
  await context.close();

  const duel=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}}),fight=await duel.newPage();
  fight.on('pageerror',error=>report.errors.push(error.message));
  await fight.goto(base+'/modules/unified-versus.html?qa=1&mode=versus&stage=midwich_nightmare&p1=sh1_groaner_003&p2=origins_faceless_nurse',{waitUntil:'domcontentloaded'});
  await fight.locator('#mode').selectOption('local');await fight.locator('#timer').selectOption('0');
  for(const option of ['otherworldShift','stageHazards','stageDirector'])await fight.locator('#'+option).uncheck();
  await fight.locator('#launch').click();
  await fight.waitForFunction(()=>{const q=window.__HALO_QA__;return q?.engine?.phase==='fight'&&!q.engine.paused&&q.engine.actors.every(actor=>!actor.presentation);},null,{timeout:30000});
  const cache=await fight.evaluate(async()=>{
    const {SPRITES}=await import('/src/sprite-manifest.js'),q=window.__HALO_QA__,cache=q.assetCache;
    const ids=q.engine.actors.map(actor=>actor.data.id),frames=ids.flatMap(id=>SPRITES[id].frames),unique=[...new Map(frames.map(frame=>[frame.path,frame])).values()];
    return {phase:q.engine.phase,ids,pins:[...cache.pins],required:unique.map(frame=>({path:frame.path,status:cache.status(frame.path),width:frame.width,height:frame.height})),
      requiredBytes:unique.reduce((n,frame)=>n+frame.width*frame.height*4,0),maxBytes:cache.maxBytes,bytes:cache.bytes,reservedBytes:cache.reservedBytes};
  });
  check('Ordinary launch admits exact maximal native pair',cache.phase==='fight'&&JSON.stringify(cache.ids)===JSON.stringify(['sh1_groaner_003','origins_faceless_nurse']),cache);
  check('All thirteen native frames stay ready and pinned',cache.required.length===13&&cache.required.every(frame=>frame.status==='ready'&&cache.pins.includes(frame.path)),cache);
  check('Largest decoded pair fits fixed 79 MiB budget without downscaling',cache.requiredBytes===81802000&&cache.maxBytes===79*1024*1024&&cache.bytes>=cache.requiredBytes&&cache.bytes+cache.reservedBytes<=cache.maxBytes,cache);
  await capture(fight.locator('#game'),'largest-native-pair.png');
  await duel.close();
  check('No unhandled browser errors',report.errors.length===0,report.errors);report.passed=true;
} catch(error) {report.failure=String(error.stack||error);process.exitCode=1;}
finally {await browser?.close();server?.kill('SIGTERM');report.completedAt=new Date().toISOString();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,captures:report.captures.length,failure:report.failure}));}
