/** Wave32: the four reviewed static poses through ordinary HTTP UI and keyboard. */
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
import {reviewedGroundContact} from './qa-ground-contact.mjs';

const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)));
const out=resolve(root,'tests/http-wave32-characters'),port=4297,base='http://127.0.0.1:'+port;
const plan=JSON.parse(await readFile(resolve(root,'docs/production/vague32/characters/import-plan.json'),'utf8'));
const baseline=JSON.parse(await readFile(resolve(root,'docs/production/vague32/characters/baseline-owners.json'),'utf8')).assets;
const metadataOnly=process.argv.includes('--metadata-only');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={schema:1,wave:32,startedAt:new Date().toISOString(),passed:false,checks:[],cases:[],errors:[],
  method:'Built HTTP app, fresh browser contexts, ordinary UI and keyboard. Passive drawImage observer and captures from the actual game canvas. No actor, camera, clock, image or module substitution.',
  limits:['Single static poses; no animation, source timing or 1:1 fidelity certification.',
    'Both orientations use the existing engine mirror, not independently observed source-side geometry.',
    'Service workers are blocked; this test does not cover offline updates.',
    'Automated HTTP and placement checks require separate visual inspection of the retained gameplay captures.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
let browser,server;
await mkdir(out,{recursive:true});
try{
  check('Exactly the four declared wave32 poses',JSON.stringify(plan.plans.map(s=>[s.id,s.pose,s.frameIndex]))===JSON.stringify([['sh1_groaner_003','neutralLight',5],['sh1_groaner_003','neutralSpecial',6],['sh4_sniffer_dog_male_053','walk',2],['sh4_sniffer_dog_male_053','neutralLight',3]]));
  for(const sample of plan.plans){
    const art=SPRITES[sample.id],clip=art?.clips?.[sample.pose],previous=baseline[sample.id];
    const bytes=await readFile(resolve(root,sample.path));sample.bytes=bytes.length;
    sample.baselineIdlePath=previous.frames[previous.clips.idle.frames[0]].path;sample.baselinePortraitPath=previous.portrait.path;
    check(sample.id+': plan binds exact audited original bytes',sha(bytes)===sample.sha256);
    check(sample.id+': exact static clip contract',art?.fighterId===sample.id&&art.source===sample.source&&clip?.frames.length===1&&clip.frames[0]===sample.frameIndex&&clip.ticksPerFrame===1&&clip.loop===false&&art.animatedClips===0);
    const frame=art.frames[clip.frames[0]];
    check(sample.id+': new audited frame published',frame.path===sample.path&&frame.sha256===sample.sha256&&frame.bytes===sample.bytes);
    check(sample.id+': baseline idle and portrait preserved',art.frames[art.clips.idle.frames[0]].path===sample.baselineIdlePath&&art.portrait.path===sample.baselinePortraitPath);
    const state=sample.pose==='walk'?{moving:true}:{moveKey:sample.pose};
    const start=sampleSpriteClip(art,{...state,frame:0}),late=sampleSpriteClip(art,{...state,frame:999});
    check(sample.id+': single-frame pose holds without claiming animation',!start.fallback&&!late.fallback&&start.frame.path===sample.path&&late.frame.path===sample.path);
    for(const [key,value] of Object.entries(previous.clips))check(sample.id+': historical clip preserved '+key,JSON.stringify(art.clips[key])===JSON.stringify(value));
    for(const [index,old] of previous.frames.entries())for(const [key,value] of Object.entries(old))
      check(sample.id+': historical frame field preserved '+index+'/'+key,JSON.stringify(art.frames[index][key])===JSON.stringify(value));
    const hurt=sampleSpriteClip(art,{hurt:true,frame:100});
    if(sample.id==='sh1_groaner_003')check(sample.id+': historical dedicated hurt retained',!hurt.fallback&&hurt.frameIndex===2&&hurt.frame.path===previous.frames[2].path);
    else check(sample.id+': absent hurt stays an explicit idle fallback',hurt.fallback===true&&hurt.requestedClipKey==='hurt'&&hurt.frame.path===sample.baselineIdlePath);
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
    const label=sample.id+'-'+sample.pose+(player===0?'-right':'-left'),art=SPRITES[sample.id];
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
      const wanted=new Set(paths);window.__wave32={draws:{},captures:{},evidence:{}};
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
              moveKey:attack?.key||null,lastMoveKey:actor?.lastMoveKey||null,attackFrame:attack?.frame??null,
              startup:attack?.move.startup??null,active:attack?.move.active??null};
            window.__wave32.draws[path]=draw;
            const attacking=attack?.key===pose&&attack.frame>=attack.move.startup&&attack.frame<attack.move.startup+attack.move.active;
            const walking=pose==='walk'&&actor?.state==='walk'&&actor?.grounded&&!attack;
            const action=path===posePath&&(pose==='walk'?walking:attacking);
            const recovered=path===idlePath&&window.__wave32.captures.action?.startsWith('data:image/png;')&&actor?.state==='idle'&&actor?.grounded&&!attack;
            const key=action?'action':recovered?'recovered':null;
            if(key&&!window.__wave32.captures[key]){
              window.__wave32.captures[key]='pending';const canvas=this.canvas,snapshot={...draw};
              requestAnimationFrame(()=>{
                window.__wave32.evidence[key]={draw:snapshot,frame:engine.frame,phase:engine.phase,
                  fighterId:actor.data.id,state:actor.state,grounded:actor.grounded,lastMoveKey:actor.lastMoveKey,
                  x:actor.x,y:actor.y,facing:actor.facing};
                window.__wave32.captures[key]=canvas.toDataURL('image/png');
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
    await page.waitForFunction(()=>window.__HALO_QA__?.engine?.phase==='fight'&&!window.__HALO_QA__.engine.paused,null,{timeout:30000});
    await page.locator('#game').focus();
    const startX=await page.evaluate(player=>window.__HALO_QA__.engine.actors[player].x,player);
    const bindingAction=sample.pose==='walk'?(player===0?'right':'left'):sample.pose==='neutralLight'?'light':'special';
    const actionKey=await page.evaluate(({player,bindingAction})=>window.__HALO_QA__.engine.bindings.players[player][bindingAction],{player,bindingAction});
    check(label+': requested ordinary binding exists',typeof actionKey==='string'&&actionKey.length>0);
    await page.keyboard.down(actionKey);
    try{await page.waitForFunction(()=>window.__wave32?.captures.action?.startsWith('data:image/png;'),null,{timeout:15000});}
    finally{await page.keyboard.up(actionKey);}
    await page.waitForFunction(()=>window.__wave32?.captures.recovered?.startsWith('data:image/png;'),null,{timeout:15000});
    const actual=await page.evaluate(()=>({captures:window.__wave32.captures,evidence:window.__wave32.evidence}));
    await Promise.all(pending);
    const action=actual.evidence.action,draw=action.draw;
    check(label+': intended owner painted',action.fighterId===sample.id&&draw.fighterId===sample.id&&draw.path==='/'+poseFrame.path,draw);
    if(sample.pose==='walk'){
      check(label+': ordinary directional input produces a grounded walk',draw.state==='walk'&&draw.grounded===true&&draw.moveKey===null);
      check(label+': walk advances toward the opponent',(draw.x-startX)*(player===0?1:-1)>0,{startX,drawX:draw.x});
    }else{
      check(label+': intended attack accepted through ordinary keyboard',action.lastMoveKey===sample.pose&&draw.moveKey===sample.pose);
      check(label+': captured attack is active',draw.attackFrame>=draw.startup&&draw.attackFrame<draw.startup+draw.active,draw);
    }
    for(const [path,frame] of expected)
      check(label+': exact HTTP bytes '+path,responses.some(row=>row.path===path&&row.status===200&&row.bytes===frame.bytes&&row.sha256===frame.sha256),responses.filter(row=>row.path===path));
    const captures=[];
    for(const [key,frame] of [['action',poseFrame],['recovered',idleFrame]]){
      const evidence=actual.evidence[key],paint=evidence.draw;
      check(label+': '+key+' expected raster dimensions',paint.width===frame.width&&paint.height===frame.height&&paint.args.length===4);
      check(label+': '+key+' painted in the captured engine frame',paint.engineFrame===evidence.frame,{drawFrame:paint.engineFrame,capturedFrame:evidence.frame});
      check(label+': '+key+' expected orientation',Math.sign(paint.matrix[0])===(player===0?1:-1)*(frame.facing||1));
      const [dx,dy,dw,dh]=paint.args,groundOffset=dy+frame.visibleBounds[3]/frame.height*dh;
      if(key==='action'){
        const contact=reviewedGroundContact(sample,frame),contactOffset=dy+contact.pixels[1]/frame.height*dh;
        check(label+': reviewed support point stays within one pixel of actor origin',Math.abs(contactOffset*paint.matrix[3])<1,{contact,contactOffset,nativePixels:contactOffset*paint.matrix[3],grounded:paint.grounded});
        if(contact.kind==='measured-claw')check(label+': exact Sniffer tongue overflow is bounded separately',groundOffset>contactOffset&&groundOffset<=contact.maxTongueOverflowWorldPixels,{groundOffset,contactOffset});
      }
      else {
        const old=baseline[sample.id].frames[0],expectedOffset=(old.visibleBounds[3]/old.height-old.anchor[1])*dh;
        check(label+': existing idle calibration preserved',Math.abs(groundOffset-expectedOffset)<.0001,{groundOffset,expectedOffset});
      }
      const [l,t,r,bottom]=frame.framingBounds||frame.visibleBounds,[a,b,c,d,tx,ty]=paint.matrix;
      const corners=[[l,t],[r,t],[l,bottom],[r,bottom]].map(([u,v])=>{const x=dx+u/frame.width*dw,y=dy+v/frame.height*dh;return[a*x+c*y+tx,b*x+d*y+ty];});
      check(label+': '+key+' complete subject stays within the game viewport',corners.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=1280&&y>=0&&y<=720),corners);
      const png=Buffer.from(actual.captures[key].split(',')[1],'base64'),file=label+'-'+key+'.png';
      check(label+': '+key+' actual 1280x720 game canvas',png.readUInt32BE(16)===1280&&png.readUInt32BE(20)===720);
      await writeFile(join(out,file),png);captures.push({kind:key,file,bytes:png.length,sha256:sha(png)});
    }
    const recovered=actual.evidence.recovered;
    check(label+': release returns to the original idle',recovered.draw.path==='/'+idleFrame.path&&recovered.draw.state==='idle'&&recovered.draw.moveKey===null);
    report.cases.push({label,player,fighterId:sample.id,source:sample.source,pose:sample.pose,startX,captures,responses,evidence:actual.evidence});
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
