/** Wave32: physical muzzle origins through ordinary HTTP UI and keyboard. */
import {createRequire} from 'node:module';
const loadDependency=createRequire(import.meta.url);
let chromium;
try { ({chromium}=loadDependency('playwright-core')); }
catch { ({chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/__halo_qa_loader.cjs')('playwright-core')); }
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {SPRITES} from '../../../../src/sprite-manifest.js';
import {sampleSpriteClip} from '../../../../src/sprite-animation.js';

const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)));
const out=resolve(root,'tests/http-wave32-origins'),port=4298,base='http://127.0.0.1:'+port;
const plan=JSON.parse(await readFile(resolve(root,'docs/production/vague31/characters/import-plan.json'),'utf8'));
plan.plans=plan.plans.filter(sample=>sample.pose==='neutralSpecial');
const metadataOnly=process.argv.includes('--metadata-only');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={schema:1,wave:32,startedAt:new Date().toISOString(),passed:false,checks:[],cases:[],errors:[],
  method:'Built HTTP app, fresh browser contexts, ordinary UI and keyboard. Passive drawImage observer captures the first rendered outgoing projectile while its exact static firing pose is still displayed. Displacement is checked against actual elapsed projectile ticks. No actor, camera, clock, image or module substitution.',
  limits:['Single static poses; no animation, source timing or 1:1 fidelity certification.',
    'Both orientations use the existing engine mirror, not independently observed source-side geometry.',
    'Service workers are blocked; this test does not cover offline updates.',
    'Automated HTTP and placement checks require separate visual inspection of the retained gameplay captures.',
    'Muzzle points are measured on the exact published candidate PNGs; collision/guard changes are separately covered by engine tests.',
    'A one-tick active window can fall between rendered frames. HTTP captures need not coincide with the emission tick; exact first-tick physics is separately covered by engine tests.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
let browser,server;
await mkdir(out,{recursive:true});
try{
  check('Exactly the two bound firearm owners',JSON.stringify(plan.plans.map(s=>s.id))===JSON.stringify(['sh4_man_with_the_coat_067','sh2_eddie_dombrowski_032']));
  for(const sample of plan.plans){
    const art=SPRITES[sample.id],clip=art?.clips?.[sample.pose];
    check(sample.id+': exact static clip contract',art?.fighterId===sample.id&&art.source===sample.source&&clip?.frames.length===1&&clip.loop===false&&art.animatedClips===0);
    const frame=art.frames[clip.frames[0]];
    check(sample.id+': new audited frame published',frame.path===sample.path&&frame.sha256===sample.sha256&&frame.bytes===sample.bytes);
    check(sample.id+': baseline idle and portrait preserved',art.frames[art.clips.idle.frames[0]].path===sample.baselineIdlePath&&art.portrait.path===sample.baselinePortraitPath);
    const state=sample.pose==='walk'?{moving:true}:{moveKey:sample.pose};
    const start=sampleSpriteClip(art,{...state,frame:0}),late=sampleSpriteClip(art,{...state,frame:999});
    check(sample.id+': single-frame pose holds without claiming animation',!start.fallback&&!late.fallback&&start.frame.path===sample.path&&late.frame.path===sample.path);
    const missing=sampleSpriteClip(art,{hurt:true,frame:100});
    check(sample.id+': missing hurt pose remains an explicit idle fallback',missing.fallback===true&&missing.requestedClipKey==='hurt'&&missing.frame.path===sample.baselineIdlePath);
  }
  if(metadataOnly){report.metadataOnly=true;report.passed=true;}else{
  let occupied=false;
  try{await fetch(base,{signal:AbortSignal.timeout(800)});occupied=true;}catch{}
  check('Dedicated HTTP test port is unused',!occupied);
  server=spawn(process.execPath,['scripts/server.mjs',String(port),'--dist'],{cwd:root,stdio:'ignore'});
  let ready=false,serverError=null;server.on('error',error=>{serverError=error;});
  for(let i=0;i<100;i++){
    if(serverError||server.exitCode!==null)throw Error('Dedicated HTTP server failed: '+(serverError||server.exitCode));
    try{if((await fetch(base)).ok){ready=true;break;}}catch{}
    await new Promise(done=>setTimeout(done,100));
  }
  check('Dedicated dist HTTP server ready',ready);
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});
  report.browser=browser.version();
  for(const sample of plan.plans)for(const player of [0,1]){
    const label=sample.id+(player===0?'-right':'-left'),art=SPRITES[sample.id];
    const poseFrame=art.frames[art.clips[sample.pose].frames[0]],idleFrame=art.frames[art.clips.idle.frames[0]];
    const expected=new Map([poseFrame,idleFrame].map(frame=>['/'+frame.path,frame]));
    const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}});
    const page=await context.newPage(),pending=[],responses=[];
    page.on('pageerror',error=>report.errors.push({label,message:error.message}));
    page.on('response',response=>{
      const path=new URL(response.url()).pathname;
      if(expected.has(path))pending.push(response.body().then(bytes=>responses.push({path,status:response.status(),bytes:bytes.length,sha256:sha(bytes)}))
        .catch(error=>responses.push({path,status:response.status(),error:String(error)})));
    });
    await page.addInitScript(({paths,posePath,idlePath,player,pose})=>{
      const wanted=new Set(paths);window.__wave32Origins={draws:{},captures:{},evidence:{}};
      const original=CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
        const result=original.call(this,image,...args);
        if(this.canvas.id==='game'&&image?.src){
          const path=new URL(image.src,location.href).pathname;
          if(wanted.has(path)){
            const matrix=this.getTransform(),engine=window.__HALO_QA__?.engine,actor=engine?.actors[player],attack=actor?.attack;
            const draw={path,args,width:image.naturalWidth,height:image.naturalHeight,
              matrix:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],engineFrame:engine?.frame,
              fighterId:actor?.data.id,state:actor?.state,grounded:actor?.grounded,x:actor?.x,y:actor?.y,facing:actor?.facing,
              moveKey:attack?.key||null,lastMoveKey:actor?.lastMoveKey||null,attackId:attack?.id??null,attackFrame:attack?.frame??null,
              startup:attack?.move.startup??null,active:attack?.move.active??null};
            window.__wave32Origins.draws[path]=draw;
            // Rendering is not guaranteed at every 60 Hz simulation tick. Keep
            // the ordinary firing pose bound to its real outgoing projectile;
            // do not require Eddie's one-tick active window to be painted.
            const shooting=attack?.key===pose&&attack.frame>=attack.move.startup;
            if(shooting){
              const shot=engine.projectiles.find(p=>p.owner===actor&&p.attackId===attack.id);
              if(shot)draw.projectile={x:shot.x,y:shot.y,vx:shot.vx,vy:shot.vy,radius:shot.radius,life:shot.life,maxLife:shot.maxLife,attackId:shot.attackId,
                launchOrigin:shot.launchOrigin?structuredClone(shot.launchOrigin):null,emissionSweepConsumed:!shot.emissionSweepFrom};
              draw.camera={...engine.presentationCamera};
            }
            const action=path===posePath&&shooting&&!!draw.projectile;
            const recovered=path===idlePath&&window.__wave32Origins.captures.action?.startsWith('data:image/png;')&&actor?.state==='idle'&&actor?.grounded&&!attack;
            const key=action?'action':recovered?'recovered':null;
            if(key&&!window.__wave32Origins.captures[key]){
              window.__wave32Origins.captures[key]='pending';const canvas=this.canvas,snapshot={...draw};
              requestAnimationFrame(()=>{
                window.__wave32Origins.evidence[key]={draw:snapshot,frame:engine.frame,phase:engine.phase,
                  fighterId:actor.data.id,state:actor.state,grounded:actor.grounded,lastMoveKey:actor.lastMoveKey,
                  x:actor.x,y:actor.y,facing:actor.facing};
                window.__wave32Origins.captures[key]=canvas.toDataURL('image/png');
              });
            }
          }
        }
        return result;
      };
    },{paths:[...expected.keys()],posePath:'/'+poseFrame.path,idlePath:'/'+idleFrame.path,player,pose:sample.pose});
    const opponent='bom_butcher_123';
    const query=new URLSearchParams({qa:'1',mode:'versus',stage:'midwich_nightmare',
      p1:player===0?sample.id:opponent,p2:player===1?sample.id:opponent});
    await page.goto(base+'/modules/unified-versus.html?'+query,{waitUntil:'domcontentloaded'});
    await page.locator('#mode').selectOption('local');await page.locator('#timer').selectOption('0');
    for(const id of ['otherworldShift','stageHazards','stageDirector'])await page.locator('#'+id).uncheck();
    await page.locator('#launch').click();
    await page.waitForFunction(()=>window.__HALO_QA__?.engine?.phase==='fight'&&!window.__HALO_QA__.engine.paused&&window.__HALO_QA__.engine.actors.every(actor=>!actor.presentation),null,{timeout:30000});
    await page.locator('#game').focus();
    const startX=await page.evaluate(player=>window.__HALO_QA__.engine.actors[player].x,player);
    const actionKey=sample.pose==='neutralLight'?(player===0?'KeyJ':'KeyF'):(player===0?'KeyI':'KeyH');
    await page.keyboard.down(actionKey);
    try{await page.waitForFunction(()=>window.__wave32Origins?.captures.action?.startsWith('data:image/png;'),null,{timeout:15000});}
    catch(error){
      report.inputFailure={label,actionKey,...await page.evaluate(()=>{
        const q=window.__HALO_QA__,e=q?.engine;
        return {phase:e?.phase,frame:e?.frame,paused:e?.paused,
          actors:e?.actors.map(a=>({id:a.data.id,state:a.state,attack:a.attack?{key:a.attack.key,frame:a.attack.frame}:null,lastMoveKey:a.lastMoveKey,presentation:a.presentation,phaseLock:a.phaseLock})),
          observed:window.__wave32Origins,cache:[...q.assetCache.entries].map(([path,entry])=>({path,status:entry.status,error:entry.error}))};
      })};
      await page.screenshot({path:join(out,label+'-failure.png')});throw error;
    }
    finally{await page.keyboard.up(actionKey);}
    await page.waitForFunction(()=>window.__wave32Origins?.captures.recovered?.startsWith('data:image/png;'),null,{timeout:15000});
    const actual=await page.evaluate(()=>({captures:window.__wave32Origins.captures,evidence:window.__wave32Origins.evidence}));
    await Promise.all(pending);
    const action=actual.evidence.action,draw=action.draw;
    check(label+': intended owner painted',action.fighterId===sample.id&&draw.fighterId===sample.id&&draw.path==='/'+poseFrame.path,draw);
    if(sample.pose==='walk'){
      check(label+': ordinary directional input produces a grounded walk',draw.state==='walk'&&draw.grounded===true&&draw.moveKey===null);
      check(label+': walk advances toward the opponent',(draw.x-startX)*(player===0?1:-1)>0,{startX,drawX:draw.x});
    }else{
      check(label+': intended attack accepted through ordinary keyboard',action.lastMoveKey===sample.pose&&draw.moveKey===sample.pose);
      check(label+': firing pose remains bound to the actual emitted attack',draw.attackFrame>=draw.startup&&draw.projectile?.attackId===draw.attackId,draw);
    }
    const shot=draw.projectile,origin=shot?.launchOrigin;
    check(label+': actual active shot keeps exact owner/source/frame binding',origin?.fighterId===sample.id&&origin.source===sample.source&&origin.moveKey==='neutralSpecial'&&origin.framePath===sample.path&&origin.frameSHA256===sample.sha256,shot);
    const [mx,my]=origin.muzzlePixels,[dx,dy,dw,dh]=draw.args,[a,b,c,d,tx,ty]=draw.matrix;
    const lx=dx+mx/poseFrame.width*dw,ly=dy+my/poseFrame.height*dh;
    const renderedMuzzle={x:a*lx+c*ly+tx,y:b*lx+d*ly+ty};
    const physicalMuzzle={x:draw.camera.x+origin.x*draw.camera.scale,y:draw.camera.y+origin.y*draw.camera.scale};
    const errorPixels=Math.hypot(renderedMuzzle.x-physicalMuzzle.x,renderedMuzzle.y-physicalMuzzle.y);
    const muzzle={renderedMuzzle,physicalMuzzle,errorPixels,projectile:shot};
    check(label+': real physical muzzle equals transformed source gun pixel',errorPixels<.01,muzzle);
    const elapsed=shot.maxLife-shot.life;
    check(label+': captured projectile follows ordinary ticks from the muzzle',Number.isSafeInteger(elapsed)&&elapsed>=1&&elapsed<60&&Math.abs(shot.x-origin.x-shot.vx*elapsed)<.001&&Math.abs(shot.y-origin.y-shot.vy*elapsed)<.001,{...shot,elapsed});
    check(label+': original speed/radius/lifetime and one-time initial sweep retained',shot.vx===(player===0?12:-12)&&shot.vy===0&&shot.radius===14.16&&shot.maxLife===60&&shot.life>0&&shot.life<60&&shot.emissionSweepConsumed,shot);
    for(const [path,frame] of expected)
      check(label+': exact HTTP bytes '+path,responses.some(row=>row.path===path&&row.status===200&&row.bytes===frame.bytes&&row.sha256===frame.sha256),responses.filter(row=>row.path===path));
    const captures=[];
    for(const [key,frame] of [['action',poseFrame],['recovered',idleFrame]]){
      const evidence=actual.evidence[key],paint=evidence.draw;
      check(label+': '+key+' expected raster dimensions',paint.width===frame.width&&paint.height===frame.height&&paint.args.length===4);
      check(label+': '+key+' painted in the captured engine frame',paint.engineFrame===evidence.frame,{drawFrame:paint.engineFrame,capturedFrame:evidence.frame});
      check(label+': '+key+' expected orientation',Math.sign(paint.matrix[0])===(player===0?1:-1)*(frame.facing||1));
      // The three reviewed ground-based owners have no hover offset. The
      // observed bottom of alpha>=32 must meet their rendered actor origin.
      const [dx,dy,dw,dh]=paint.args,groundOffset=dy+frame.visibleBounds[3]/frame.height*dh;
      check(label+': '+key+' ground contact within one native pixel',Math.abs(groundOffset*paint.matrix[3])<1,{groundOffset,nativePixels:groundOffset*paint.matrix[3]});
      const png=Buffer.from(actual.captures[key].split(',')[1],'base64'),file=label+'-'+key+'.png';
      check(label+': '+key+' actual 1280x720 game canvas',png.readUInt32BE(16)===1280&&png.readUInt32BE(20)===720);
      await writeFile(join(out,file),png);captures.push({kind:key,file,bytes:png.length,sha256:sha(png)});
    }
    const recovered=actual.evidence.recovered;
    check(label+': release returns to the original idle',recovered.draw.path==='/'+idleFrame.path&&recovered.draw.state==='idle'&&recovered.draw.moveKey===null);
    report.cases.push({label,player,fighterId:sample.id,source:sample.source,pose:sample.pose,startX,muzzle,captures,responses,evidence:actual.evidence});
    await context.close();console.log(JSON.stringify({label,passed:true}));
  }
  check('No unhandled browser errors',report.errors.length===0,report.errors);report.passed=true;
  }
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{
  await browser?.close();server?.kill('SIGTERM');report.completedAt=new Date().toISOString();
  await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,cases:report.cases.length,failure:report.failure}));
}
