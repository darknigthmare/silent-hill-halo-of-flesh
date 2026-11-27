/** Wave27: real HTTP assets and ordinary keyboard attacks, observed without state injection. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {PROJECTILE_BITMAPS} from '../../../src/projectile-bitmap-manifest.js';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const out=resolve(root,'tests/http-wave27-actions'),port=4277,base=`http://127.0.0.1:${port}`;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const cases=[
  {id:'sh1_incubator_018',pose:'neutralSpecial',effect:'sh1_incubator_blue_lightning'},
  {id:'sh2_lying_figure_020',pose:'neutralSpecial',effect:'sh2_lying_figure_acid',newPose:true},
  {id:'sh3_god_050',pose:'neutralSpecial',effect:'sh3_god_ground_flame'},
  {id:'sh3_double_head_040',pose:'forwardSpecial',newPose:true}
];
const report={schema:1,wave:27,startedAt:new Date().toISOString(),passed:false,checks:[],cases:[],errors:[],
  method:'Built HTTP application, fresh browser contexts, ordinary UI and keyboard. Passive drawImage observer and actual game canvas captures. No actor, camera, clock, image or module substitution.',
  limits:['Headless browser; service workers blocked, so this does not test offline updates.',
    'Single-frame attack and projectile candidates; no animation or source timing certification.',
    'Both orientations use the existing engine mirror, not independently observed source-side geometry.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
let browser,server;
await mkdir(out,{recursive:true});
try{
  let occupied=false;
  try{await fetch(base,{signal:AbortSignal.timeout(800)});occupied=true;}catch{}
  check('Dedicated HTTP test port is unused',!occupied);
  server=spawn(process.execPath,['scripts/server.mjs',String(port),'--dist'],{cwd:root,stdio:'ignore'});
  let ready=false;let serverError=null;server.on('error',error=>{serverError=error;});
  for(let i=0;i<100;i++){
    if(serverError||server.exitCode!==null)throw Error('Dedicated HTTP server failed: '+(serverError||server.exitCode));
    try{if((await fetch(base)).ok){ready=true;break;}}catch{}
    await new Promise(done=>setTimeout(done,100));
  }
  check('Dedicated dist HTTP server ready',ready);
  check('Our dedicated server remains alive',!serverError&&server.exitCode===null);
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});
  report.browser=browser.version();
  for(const sample of cases)for(const player of [0,1]){
    const label=sample.id+(player===0?'-right':'-left'),art=SPRITES[sample.id];
    const poseFrame=sample.newPose?art.frames[art.clips[sample.pose].frames[0]]:null;
    const effect=sample.effect?PROJECTILE_BITMAPS[sample.effect]:null;
    const frames=[poseFrame,effect?.frame].filter(Boolean),captureFrame=effect?.frame||poseFrame;
    const expected=new Map(frames.map(frame=>['/'+frame.path,frame]));
    const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}});
    const page=await context.newPage(),pending=[],responses=[];
    page.on('pageerror',error=>report.errors.push({label,message:error.message}));
    page.on('response',response=>{
      const path=new URL(response.url()).pathname;
      if(expected.has(path))pending.push(response.body().then(bytes=>responses.push({path,status:response.status(),bytes:bytes.length,sha256:sha(bytes)}))
        .catch(error=>responses.push({path,status:response.status(),error:String(error)})));
    });
    await page.addInitScript(({paths,capturePath,player,pose,projectile})=>{
      const wanted=new Set(paths);window.__wave27={draws:{},capture:null,captureEvidence:null};
      const draw=CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
        const result=draw.call(this,image,...args);
        if(this.canvas.id==='game'&&image?.src){
          const path=new URL(image.src,location.href).pathname;
          if(wanted.has(path)){
            const matrix=this.getTransform(),engine=window.__HALO_QA__?.engine,actor=engine?.actors[player],attack=actor?.attack;
            window.__wave27.draws[path]={path,args,width:image.naturalWidth,height:image.naturalHeight,
              matrix:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],engineFrame:engine?.frame,
              fighterId:actor?.data.id,moveKey:attack?.key||null,lastMoveKey:actor?.lastMoveKey||null,
              attackFrame:attack?.frame??null,startup:attack?.move.startup??null,active:attack?.move.active??null};
            const active=attack?.key===pose&&attack.frame>=attack.move.startup&&attack.frame<attack.move.startup+attack.move.active;
            const emitted=projectile&&engine?.projectiles.some(shot=>shot.owner===actor&&shot.move.key===pose);
            if(path===capturePath&&!window.__wave27.capture&&(projectile?emitted:active)){
              window.__wave27.capture='pending';const canvas=this.canvas;
              // This callback runs after the complete current render, before the
              // engine's next requestAnimationFrame. Save evidence from that canvas.
              requestAnimationFrame(()=>{
                window.__wave27.captureEvidence={draws:{...window.__wave27.draws},frame:engine.frame,
                  fighterId:actor.data.id,lastMoveKey:actor.lastMoveKey,
                  projectiles:engine.projectiles.filter(shot=>shot.owner===actor).map(shot=>({moveKey:shot.move.key,x:shot.x,y:shot.y,vx:shot.vx,radius:shot.radius,groundY:shot.groundY??null}))};
                window.__wave27.capture=canvas.toDataURL('image/png');
              });
            }
          }
        }
        return result;
      };
    },{paths:[...expected.keys()],capturePath:'/'+captureFrame.path,player,pose:sample.pose,projectile:!!effect});
    const opponent='bom_butcher_123';
    const query=new URLSearchParams({qa:'1',mode:'versus',stage:'midwich_nightmare',
      p1:player===0?sample.id:opponent,p2:player===1?sample.id:opponent});
    await page.goto(base+'/modules/unified-versus.html?'+query,{waitUntil:'domcontentloaded'});
    await page.locator('#mode').selectOption('local');await page.locator('#timer').selectOption('0');
    for(const id of ['otherworldShift','stageHazards','stageDirector'])await page.locator('#'+id).uncheck();
    await page.locator('#launch').click();
    await page.waitForFunction(()=>window.__HALO_QA__?.engine?.phase==='fight'&&!window.__HALO_QA__.engine.paused,null,{timeout:30000});
    await page.locator('#game').focus();
    const forward=player===0?'ArrowRight':'KeyQ',special=player===0?'KeyI':'KeyH';
    if(sample.pose==='forwardSpecial')await page.keyboard.down(forward);
    await page.keyboard.down(special);
    try{await page.waitForFunction(()=>window.__wave27?.capture?.startsWith('data:image/png;'),null,{timeout:15000});}
    finally{await page.keyboard.up(special);if(sample.pose==='forwardSpecial')await page.keyboard.up(forward);}
    const actual=await page.evaluate(()=>({draws:window.__wave27.captureEvidence.draws,capture:window.__wave27.capture,
      captureEvidence:window.__wave27.captureEvidence,
      phase:window.__HALO_QA__.engine.phase,actors:window.__HALO_QA__.engine.actors.map(actor=>({id:actor.data.id,x:actor.x,y:actor.y,facing:actor.facing,state:actor.state}))}));
    await Promise.all(pending);
    check(label+': intended move accepted through ordinary keyboard',actual.captureEvidence.fighterId===sample.id&&actual.captureEvidence.lastMoveKey===sample.pose);
    if(effect)check(label+': actual projectile emitted',actual.captureEvidence.projectiles.some(shot=>shot.moveKey===sample.pose&&Math.sign(shot.vx)===(player===0?1:-1)));
    else{
      const draw=actual.draws['/'+captureFrame.path];
      check(label+': capture shows the active attack',draw.moveKey===sample.pose&&draw.attackFrame>=draw.startup&&draw.attackFrame<draw.startup+draw.active,draw);
    }
    for(const [path,frame] of expected){
      check(label+': exact HTTP bytes '+path,responses.some(row=>row.path===path&&row.status===200&&row.bytes===frame.bytes&&row.sha256===frame.sha256));
      const draw=actual.draws[path];
      check(label+': actual game draw '+path,draw&&draw.width===frame.width&&draw.height===frame.height,draw);
      check(label+': expected artwork painted in captured frame '+path,draw.engineFrame===actual.captureEvidence.frame,{drawFrame:draw.engineFrame,capturedFrame:actual.captureEvidence.frame});
      check(label+': expected orientation '+path,Math.sign(draw.matrix[0])===(player===0?1:-1)*(frame.facing||1));
    }
    const png=Buffer.from(actual.capture.split(',')[1],'base64'),file=label+'.png';
    check(label+': original game canvas resolution captured',png.readUInt32BE(16)===1280&&png.readUInt32BE(20)===720);
    await writeFile(join(out,file),png);delete actual.capture;
    report.cases.push({label,player,fighterId:sample.id,pose:sample.pose,effect:sample.effect||null,
      capture:{file,bytes:png.length,sha256:sha(png)},responses,...actual});
    await context.close();console.log(JSON.stringify({label,passed:true}));
  }
  check('No unhandled browser errors',report.errors.length===0,report.errors);report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{
  await browser?.close();server?.kill('SIGTERM');report.completedAt=new Date().toISOString();
  await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,cases:report.cases.length,failure:report.failure}));
}
