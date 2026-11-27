/** Observe native Dojo HITBOXES on the reviewed crawling neutralLight PNG.
 * --build-dir=/tmp/halo-wave33-build --out=/absolute/evidence --expect-aligned
 */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const load=createRequire(import.meta.url);let chromium;
try{({chromium}=load('playwright-core'));}catch{({chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/__halo_qa.cjs')('playwright-core'));}
const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url))),option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
if(option('out')&&option('out-dir'))throw Error('Use one evidence option: --out or --out-dir');
const buildDir=option('build-dir'),out=resolve(root,(option('out')||option('out-dir'))||'docs/production/vague33/qa/crawling-contact'),port=4304,base='http://127.0.0.1:'+port,expectAligned=process.argv.includes('--expect-aligned');
const {SPRITES}=await import(pathToFileURL(resolve(root,buildDir||'dist','src/sprite-manifest.js')).href);
const id='sh2_lying_figure_crawling_021',pose='neutralLight',art=SPRITES[id],frame=art.frames[art.clips[pose].frames[0]],sha=bytes=>createHash('sha256').update(bytes).digest('hex');
try{await access(out);throw Error('Preserve existing evidence; choose a fresh --out.');}catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(out,{recursive:true});
const report={wave:33,startedAt:new Date().toISOString(),passed:false,alignmentPassed:null,build:buildDir||'dist',frame,checks:[],cases:[],captures:[],errors:[],
  method:'Ordinary training UI and HITBOXES checkbox, then ordinary light input. Passive observation of native drawImage and red strokeRect calls, with actual canvas captures. No custom overlay or engine state injection.',
  limits:['The first alpha>=32 front column is bound to the exact reviewed PNG; anatomy still requires visual review.','The unchanged historical humanoid hurtbox remains versus adaptation, not measured original-game geometry.','This contact observation does not certify 1:1 timing, scale or animation.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};let server,browser;
try{
  report.harnessSHA256=sha(await readFile(fileURLToPath(import.meta.url)));
  check('Measured front belongs to exact reviewed native PNG',frame.sha256==='fdf3d62f02cb232b40beaa77fafb41e7ffcaf19112e9e73f1fb6667293cfc321'&&frame.width===2172&&frame.height===724);
  report.frontMeasurement={nativePoint:[60,496.5],method:'Alpha>=32 first front column x60, y488..505; midpoint retained as a reproducible head-front support point.'};
  let occupied=false;try{await fetch(base,{signal:AbortSignal.timeout(700)});occupied=true;}catch{}check('Dedicated port unused',!occupied);
  server=spawn(process.execPath,['scripts/server.mjs',String(port),'--dist',...(buildDir?['--out-dir='+buildDir]:[])],{cwd:root,stdio:'ignore'});
  let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('Server exited');try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(done=>setTimeout(done,100));}
  check('Built HTTP app ready',ready);browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
  for(const player of [0,1]){
    const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}}),page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
    await page.addInitScript(({player,path,pose})=>{
      window.__contact={};const originalImage=CanvasRenderingContext2D.prototype.drawImage,originalRect=CanvasRenderingContext2D.prototype.strokeRect;
      CanvasRenderingContext2D.prototype.drawImage=function(image,...args){const result=originalImage.call(this,image,...args),e=window.__HALO_QA__?.engine,a=e?.actors[player];if(this.canvas.id==='game'&&image?.src&&new URL(image.src,location.href).pathname===path&&a?.attack?.key===pose){const m=this.getTransform();window.__contact.pose={path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],engineFrame:e.frame,actor:{id:a.data.id,x:a.x,y:a.y,facing:a.facing,grounded:a.grounded},attack:{key:a.attack.key,frame:a.attack.frame,startup:a.attack.move.startup,active:a.attack.move.active,move:{...a.attack.move}}};}return result;};
      CanvasRenderingContext2D.prototype.strokeRect=function(...args){
        const result=originalRect.apply(this,args),e=window.__HALO_QA__?.engine,a=e?.actors[player],p=window.__contact.pose;
        if(this.canvas.id==='game'&&this.strokeStyle==='#e34b50'&&a?.attack?.key===pose&&p?.engineFrame===e.frame&&!window.__contact.capture){const m=this.getTransform(),canvas=this.canvas;window.__contact.observedPose={...p};window.__contact.hit={args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],engineFrame:e.frame};window.__contact.capture='pending';requestAnimationFrame(()=>{window.__contact.capturedFrame=e.frame;window.__contact.capture=canvas.toDataURL('image/png');});}return result;
      };
    },{player,path:'/'+frame.path,pose});
    const ids=player?['bom_butcher_123',id]:[id,'bom_butcher_123'];
    await page.goto(base+'/modules/unified-versus.html?qa=1&mode=training&stage=midwich_nightmare&p1='+ids[0]+'&p2='+ids[1],{waitUntil:'domcontentloaded'});
    for(const key of ['otherworldShift','stageHazards','stageDirector'])await page.locator('#'+key).uncheck();await page.locator('#launch').click();
    await page.waitForFunction(()=>{const e=window.__HALO_QA__?.engine;return e?.phase==='fight'&&!e.paused&&e.frame>240&&e.actors.every(a=>!a.presentation);},null,{timeout:30000});
    if(!(await page.locator('#hitboxes').isVisible()))await page.locator('#trainingToggle').click();await page.locator('#hitboxes').check();await page.locator('#game').focus();
    check('Native Dojo hitbox option active on side '+player,await page.evaluate(()=>window.__HALO_QA__.engine.config.training&&window.__HALO_QA__.engine.config.showHitboxes));
    const key=await page.evaluate(player=>window.__HALO_QA__.engine.bindings.players[player].light,player);await page.keyboard.press(key);await page.waitForFunction(()=>window.__contact.capture?.startsWith('data:image/png;'),null,{timeout:15000});
    const actual=await page.evaluate(()=>window.__contact),draw=actual.observedPose,hit=actual.hit;
    check('Exact owner and attack on side '+player,draw.actor.id===id&&draw.attack.key===pose&&draw.actor.facing===(player?-1:1));
    check('Native pose and hit rectangle share captured active frame on side '+player,draw.engineFrame===hit.engineFrame&&hit.engineFrame===actual.capturedFrame&&draw.attack.frame>=draw.attack.startup&&draw.attack.frame<draw.attack.startup+draw.attack.active);
    const [dx,dy,dw,dh]=draw.args,orientation=draw.actor.facing*(frame.facing||1),xs=[frame.visibleBounds[0],frame.visibleBounds[2]].map(x=>draw.actor.x+orientation*(dx+x/frame.width*dw));
    const front=player?Math.min(...xs):Math.max(...xs),hitFront=player?hit.args[0]:hit.args[0]+hit.args[2],frontPointWorld={x:draw.actor.x+orientation*(dx+60/frame.width*dw),y:draw.actor.y+dy+496.5/frame.height*dh};
    const frontWithinHit=frontPointWorld.x>=hit.args[0]&&frontPointWorld.x<=hit.args[0]+hit.args[2]&&frontPointWorld.y>=hit.args[1]&&frontPointWorld.y<=hit.args[1]+hit.args[3];
    const measurement={frontWorld:front,hitFrontWorld:hitFront,frontBeyondHitWorld:(front-hitFront)*(player?-1:1),frontPointWorld,frontWithinHit,hitBoxWorld:{x:hit.args[0],y:hit.args[1],w:hit.args[2],h:hit.args[3]},inkBoundsWorld:{left:Math.min(...xs),right:Math.max(...xs),top:draw.actor.y+dy+frame.visibleBounds[1]/frame.height*dh,bottom:draw.actor.y+dy+frame.visibleBounds[3]/frame.height*dh}};
    if(expectAligned){check('Head front lies inside native HIT on side '+player,frontWithinHit,measurement);check('Ground support retained on side '+player,Math.abs(measurement.inkBoundsWorld.bottom-draw.actor.y)<1);}
    const png=Buffer.from(actual.capture.split(',')[1],'base64'),file='crawling-neutral-light-contact-'+(player?'left':'right')+'.png';await writeFile(join(out,file),png);report.captures.push({file,bytes:png.length,sha256:sha(png)});report.cases.push({player,draw,hit,capturedFrame:actual.capturedFrame,measurement});await context.close();
  }
  check('No unhandled browser errors',report.errors.length===0,report.errors);report.passed=true;report.alignmentPassed=expectAligned;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{await browser?.close();server?.kill('SIGTERM');report.completedAt=new Date().toISOString();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,alignmentPassed:report.alignmentPassed,checks:report.checks.length,captures:report.captures.length,failure:report.failure}));}
