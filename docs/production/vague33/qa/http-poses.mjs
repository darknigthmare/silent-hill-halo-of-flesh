/** Reviewed static poses through the real built HTTP UI and ordinary keyboard.
 * --build-dir=/tmp/halo-wave33-build --out=docs/production/vague33/qa/characters
 * Plan length is data driven. No engine, actor, camera, image or clock mutation.
 */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {SPRITES} from '../../../../src/sprite-manifest.js';
import {sampleSpriteClip} from '../../../../src/sprite-animation.js';
import {getFighter} from '../../../../src/data.js';
import {bodyBox,moveBox} from '../../../../src/combat-geometry.js';
import {sourceContactBand,sourceContactSweep} from '../../../../src/combat-reference-policy.js';
const load=createRequire(import.meta.url);let chromium;
try{({chromium}=load('playwright-core'));}catch{({chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/__halo_qa.cjs')('playwright-core'));}
const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)));
const option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
if(option('out')&&option('out-dir'))throw Error('Use one evidence option: --out or --out-dir');
const buildDir=option('build-dir'),metadataOnly=process.argv.includes('--metadata-only');
const out=resolve(root,(option('out')||option('out-dir'))||'docs/production/vague33/qa/characters'),port=Number(option('port')||4302),base='http://127.0.0.1:'+port;
const planPaths=(option('plans')||'docs/production/vague33/characters,docs/production/vague33/characters-root').split(',');
const plans=[],baseline={};
for(const path of planPaths){
  const plan=JSON.parse(await readFile(join(root,path,'import-plan.json'),'utf8'));
  const prior=JSON.parse(await readFile(join(root,path,'baseline-owners.json'),'utf8')).assets;
  plans.push(...plan.plans);
  for(const [id,art] of Object.entries(prior)){
    if(baseline[id]&&JSON.stringify(baseline[id])!==JSON.stringify(art))throw Error('Conflicting owner baseline: '+id);
    baseline[id]=art;
  }
}
try{await access(out);throw Error('Preserve existing evidence; choose a fresh --out directory.');}catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(out,{recursive:true});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex'),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const report={schema:1,wave:33,startedAt:new Date().toISOString(),passed:false,build:buildDir||'dist',planPaths,
  checks:[],cases:[],errors:[],calibrationExceptions:[],sourceHashes:{},
  method:'Real built HTTP app, fresh browser contexts, ordinary UI and keyboard, passive drawImage observation. Presentation completion is awaited before input. The first painted active frame is retained for multi-tick windows; single-tick windows use the first painted outgoing attack frame. No runtime state, pixels, module, clock or camera substitution.',
  limits:['Single static poses; no animation, source timing, original-game scale or 1:1 certification.',
    'Both orientations use the existing engine mirror, not separately sourced opposing views.',
    'Service workers are blocked; offline/update behavior and a full match are outside this recipe.',
    'Numb Body medium neutralSpecial intentionally lifts both feet; its virtual support is distinguished from ground contact.',
    'Crawling Lying Figure keeps its historical versus body/hurtbox envelope; the calibrated image does not certify source collision geometry.',
    'Automated assertions require a separate visual review of the retained game captures.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
const protectedPaths=['art/registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js','src/stage-reference-policy.js','src/fight.js','src/renderers.js','src/sprite-system.js','src/versus.js'];
let browser,server;
try{
  check('Plan is nonempty and every owner/pose pair is unique',plans.length>0&&new Set(plans.map(row=>row.id+'/'+row.pose)).size===plans.length);
  check('Plan uses supported ordinary controls',plans.every(row=>['walk','neutralLight','neutralHeavy','neutralSpecial'].includes(row.pose)));
  for(const path of protectedPaths)report.sourceHashes[path]={before:sha(await readFile(join(root,path)))};
  report.harnessSHA256=sha(await readFile(fileURLToPath(import.meta.url)));
  const before=JSON.parse(await readFile(join(root,'docs/production/vague33/qa/calibration-before/report.json'),'utf8'));
  for(const id of [...new Set(plans.map(row=>row.id))]){
    const art=SPRITES[id],previous=baseline[id];
    check(id+': exact prior owner exists',!!art&&!!previous&&art.fighterId===id&&art.source===previous.source);
    check(id+': original selection portrait fields are unchanged',Object.entries(previous.portrait).every(([key,value])=>same(art.portrait[key],value)),
      {derivedMetadataAdded:Object.keys(art.portrait).filter(key=>!Object.hasOwn(previous.portrait,key))});
    for(const [key,value] of Object.entries(previous.clips))check(id+': original clip retained '+key,same(art.clips[key],value));
    for(const [index,old] of previous.frames.entries()){
      const expected={...old};
      if(id==='sh3_numb_body_medium'&&index===previous.clips.idle.frames[0]){
        check(id+': calibration exception is supported by two before measurements',old.anchor[1]===1&&before.passed&&before.phase==='before'&&before.cases.length===2&&before.cases.every(row=>row.frame.path===old.path&&row.frame.sha256===old.sha256&&row.offsetWorld< -20&&row.offsetWorld> -30));
        expected.anchor=[old.anchor[0],903/1024];
        report.calibrationExceptions.push({id,frameIndex:index,path:old.path,sha256:old.sha256,field:'anchor[1]',before:1,after:903/1024,proof:'../calibration-before/report.json'});
      }
      if(id==='sh2_lying_figure_crawling_021'&&index===previous.clips.idle.frames[0]){
        check(id+': calibration exception binds the historical native canvas',old.bodyHeight===.98&&old.anchor[0]===.5&&old.width===2172&&old.height===724);
        expected.bodyHeight=2.94;expected.anchor=[.4,old.visibleBounds[3]/old.height];
        report.calibrationExceptions.push({id,frameIndex:index,path:old.path,sha256:old.sha256,fields:['bodyHeight','anchor'],before:{bodyHeight:old.bodyHeight,anchor:old.anchor},after:{bodyHeight:expected.bodyHeight,anchor:expected.anchor},reason:'Parent-authorized three-frame crawling presentation calibration; unchanged PNG, scale divided by three and reviewed visible support.'});
      }
      check(id+': historical frame retained, with only the bounded calibration exceptions '+index,
        Object.entries(expected).every(([key,value])=>same(art.frames[index][key],value)));
    }
    const oldHurt=sampleSpriteClip(previous,{hurt:true,frame:100}),hurt=sampleSpriteClip(art,{hurt:true,frame:100});
    check(id+': existing hurt or explicit idle fallback remains unchanged',hurt.fallback===oldHurt.fallback&&hurt.frame.path===oldHurt.frame.path&&hurt.frameIndex===oldHurt.frameIndex);
  }
  for(const sample of plans){
    const art=SPRITES[sample.id],clip=art?.clips?.[sample.pose],frame=art?.frames?.[sample.frameIndex],bytes=await readFile(join(root,sample.path));
    check(sample.id+'/'+sample.pose+': exact audited native PNG',sha(bytes)===sample.sha256&&bytes.length===sample.bytes);
    check(sample.id+'/'+sample.pose+': exact static clip contract',art.source===sample.source&&clip?.frames.length===1&&clip.frames[0]===sample.frameIndex&&clip.ticksPerFrame===1&&clip.loop===false&&art.animatedClips===0);
    check(sample.id+'/'+sample.pose+': published frame matches the reviewed plan',
      ['path','sha256','bytes','width','height','visibleBounds','anchor','bodyHeight','facing'].every(key=>same(frame?.[key],sample[key])));
    const state=sample.pose==='walk'?{moving:true}:{moveKey:sample.pose};
    const start=sampleSpriteClip(art,{...state,frame:0}),late=sampleSpriteClip(art,{...state,frame:999});
    check(sample.id+'/'+sample.pose+': single frame holds without claimed animation',!start.fallback&&!late.fallback&&start.frame.path===sample.path&&late.frame.path===sample.path);
  }
  if(metadataOnly){report.metadataOnly=true;report.passed=true;}
  else{
    let occupied=false;try{await fetch(base,{signal:AbortSignal.timeout(700)});occupied=true;}catch{}
    check('Dedicated HTTP test port is unused',!occupied);
    server=spawn(process.execPath,['scripts/server.mjs',String(port),'--dist',...(buildDir?['--out-dir='+buildDir]:[])],{cwd:root,stdio:'ignore'});
    let ready=false,serverError;server.on('error',error=>{serverError=error;});
    for(let i=0;i<100;i++){
      if(serverError||server.exitCode!==null)throw Error('Dedicated HTTP server failed: '+(serverError||server.exitCode));
      try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(done=>setTimeout(done,100));
    }
    check('Dedicated built HTTP app is ready',ready);
    browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
    for(const sample of plans)for(const player of [0,1]){
      const label=sample.id+'-'+sample.pose+(player===0?'-right':'-left'),art=SPRITES[sample.id];
      const poseFrame=art.frames[sample.frameIndex],idleFrame=art.frames[art.clips.idle.frames[0]],expected=new Map([poseFrame,idleFrame].map(frame=>['/'+frame.path,frame]));
      const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}}),page=await context.newPage(),pending=[],responses=[];
      page.on('pageerror',error=>report.errors.push({label,message:error.message}));
      page.on('response',response=>{const path=new URL(response.url()).pathname;if(expected.has(path))pending.push(response.body().then(bytes=>responses.push({path,status:response.status(),bytes:bytes.length,sha256:sha(bytes)})).catch(error=>responses.push({path,status:response.status(),error:String(error)})));});
      await page.addInitScript(({paths,posePath,idlePath,player,pose})=>{
        const wanted=new Set(paths);window.__wave33={draws:{},captures:{},evidence:{},timeline:[]};
        const original=CanvasRenderingContext2D.prototype.drawImage;
        CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
          const result=original.call(this,image,...args);
          if(this.canvas.id==='game'&&image?.src){
            const path=new URL(image.src,location.href).pathname;
            if(wanted.has(path)){
              const matrix=this.getTransform(),engine=window.__HALO_QA__?.engine,actor=engine?.actors[player],attack=actor?.attack;
              const draw={path,args,width:image.naturalWidth,height:image.naturalHeight,matrix:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],engineFrame:engine?.frame,
                fighterId:actor?.data.id,state:actor?.state,grounded:actor?.grounded,x:actor?.x,y:actor?.y,facing:actor?.facing,moveKey:attack?.key||null,lastMoveKey:actor?.lastMoveKey||null,
                attackFrame:attack?.frame??null,startup:attack?.move.startup??null,active:attack?.move.active??null,recovery:attack?.move.recovery??null,move:attack?{...attack.move}:null,presentation:!!actor?.presentation};
              window.__wave33.draws[path]=draw;
              const attackPaint=attack?.key===pose&&attack.frame>=attack.move.startup&&(attack.move.active>1?attack.frame<attack.move.startup+attack.move.active:attack.frame<attack.move.startup+attack.move.active+attack.move.recovery);
              const walking=pose==='walk'&&actor?.state==='walk'&&actor?.grounded&&!attack;
              const action=path===posePath&&!actor?.presentation&&(pose==='walk'?walking:attackPaint);
              const recovered=path===idlePath&&window.__wave33.captures.action?.startsWith('data:image/png;')&&actor?.state==='idle'&&actor?.grounded&&!attack&&!actor?.presentation;
              if(path===posePath&&window.__wave33.timeline.length<20)window.__wave33.timeline.push({frame:engine?.frame,attackFrame:draw.attackFrame,startup:draw.startup,active:draw.active,state:draw.state});
              const key=action?'action':recovered?'recovered':null;
              if(key&&!window.__wave33.captures[key]){
                window.__wave33.captures[key]='pending';const canvas=this.canvas,snapshot={...draw};
                requestAnimationFrame(()=>{
                  window.__wave33.evidence[key]={draw:snapshot,frame:engine.frame,phase:engine.phase,fighterId:actor.data.id,state:actor.state,grounded:actor.grounded,lastMoveKey:actor.lastMoveKey,x:actor.x,y:actor.y,facing:actor.facing};
                  window.__wave33.captures[key]=canvas.toDataURL('image/png');
                });
              }
            }
          }
          return result;
        };
      },{paths:[...expected.keys()],posePath:'/'+poseFrame.path,idlePath:'/'+idleFrame.path,player,pose:sample.pose});
      const opponent='bom_butcher_123',query=new URLSearchParams({qa:'1',mode:'versus',stage:'midwich_nightmare',p1:player===0?sample.id:opponent,p2:player===1?sample.id:opponent});
      await page.goto(base+'/modules/unified-versus.html?'+query,{waitUntil:'domcontentloaded'});
      await page.locator('#mode').selectOption('local');await page.locator('#timer').selectOption('0');
      for(const id of ['otherworldShift','stageHazards','stageDirector'])await page.locator('#'+id).uncheck();
      await page.locator('#launch').click();
      await page.waitForFunction(path=>{const engine=window.__HALO_QA__?.engine;return engine?.phase==='fight'&&!engine.paused&&engine.actors.every(actor=>!actor.presentation)&&window.__wave33?.draws[path];},'/'+idleFrame.path,{timeout:30000});
      await page.locator('#game').focus();
      const startX=await page.evaluate(player=>window.__HALO_QA__.engine.actors[player].x,player);
      const bindingAction=sample.pose==='walk'?(player===0?'right':'left'):({neutralLight:'light',neutralHeavy:'heavy',neutralSpecial:'special'})[sample.pose];
      const actionKey=await page.evaluate(({player,bindingAction})=>window.__HALO_QA__.engine.bindings.players[player][bindingAction],{player,bindingAction});
      check(label+': ordinary input binding exists',typeof actionKey==='string'&&actionKey.length>0);
      await page.keyboard.down(actionKey);
      try{await page.waitForFunction(()=>window.__wave33?.captures.action?.startsWith('data:image/png;'),null,{timeout:15000});}
      catch(error){report.incompleteCase={label,observed:await page.evaluate(()=>window.__wave33)};throw error;}
      finally{await page.keyboard.up(actionKey);}
      await page.waitForFunction(()=>window.__wave33?.captures.recovered?.startsWith('data:image/png;'),null,{timeout:15000});
      const actual=await page.evaluate(()=>({captures:window.__wave33.captures,evidence:window.__wave33.evidence,timeline:window.__wave33.timeline}));await Promise.all(pending);
      const action=actual.evidence.action,draw=action.draw;
      check(label+': exact intended owner and pose are painted',action.fighterId===sample.id&&draw.fighterId===sample.id&&draw.path==='/'+poseFrame.path,draw);
      check(label+': presentation has finished before the move',draw.presentation===false);
      if(sample.pose==='walk'){
        check(label+': ordinary direction produces a grounded walk',draw.state==='walk'&&draw.grounded===true&&draw.moveKey===null);
        check(label+': walk advances toward the opponent',(draw.x-startX)*(player===0?1:-1)>0,{startX,drawX:draw.x});
      }else{
        check(label+': intended attack accepted through ordinary input',action.lastMoveKey===sample.pose&&draw.moveKey===sample.pose);
        check(label+': actual painted attack is in its declared observation window',draw.attackFrame>=draw.startup&&(draw.active>1?draw.attackFrame<draw.startup+draw.active:draw.attackFrame<draw.startup+draw.active+draw.recovery),{frame:draw.attackFrame,startup:draw.startup,active:draw.active,recovery:draw.recovery,observation:draw.active>1?'active':'first outgoing paint'});
      }
      for(const [path,frame] of expected)check(label+': exact HTTP PNG '+path,responses.some(row=>row.path===path&&row.status===200&&row.bytes===frame.bytes&&row.sha256===frame.sha256),responses.filter(row=>row.path===path));
      const captures=[],geometry={};
      for(const [key,frame] of [['action',poseFrame],['recovered',idleFrame]]){
        const evidence=actual.evidence[key],paint=evidence.draw;
        check(label+': '+key+' native raster dimensions',paint.width===frame.width&&paint.height===frame.height&&paint.args.length===4);
        check(label+': '+key+' is captured in the painted engine frame',paint.engineFrame===evidence.frame,{drawFrame:paint.engineFrame,capturedFrame:evidence.frame});
        check(label+': '+key+' uses the expected original facing and mirror',Math.sign(paint.matrix[0])===(player===0?1:-1)*(frame.facing||1));
        const [dx,dy,dw,dh]=paint.args,groundOffset=dy+frame.visibleBounds[3]/frame.height*dh;
        if(key==='action'){
          const observedActor={data:getFighter(sample.id),x:paint.x,y:paint.y,facing:paint.facing,grounded:paint.grounded,state:paint.state};
          geometry.bodyBoxWorld=bodyBox(observedActor);
          const orientation=paint.facing*(frame.facing||1),xs=[frame.visibleBounds[0],frame.visibleBounds[2]].map(x=>paint.x+orientation*(dx+x/frame.width*dw));
          geometry.inkBoundsWorld={left:Math.min(...xs),right:Math.max(...xs),top:paint.y+dy+frame.visibleBounds[1]/frame.height*dh,bottom:paint.y+groundOffset};
          if(paint.move&&!paint.move.projectile){
            const box=moveBox(observedActor,paint.move),band=sourceContactBand(observedActor.data,paint.move);
            if(band){box.y=paint.y-band.footOffset-band.height/2;box.h=band.height;}
            if(sourceContactSweep(observedActor.data,paint.move)){box.x=paint.x-paint.move.reach;box.w=paint.move.reach*2;}
            geometry.attackBoxWorld=box;
          }
          geometry.note='Read-only projection of the actual captured pose and existing combat geometry; no collision or reach is changed and no source geometry is certified.';
        }
        if(key==='action'){
          const airborne=sample.id==='sh3_numb_body_medium'&&sample.pose==='neutralSpecial';
          const supportY=airborne?frame.height:frame.visibleBounds[3],supportOffset=dy+supportY/frame.height*dh;
          check(label+': '+(airborne?'declared virtual airborne support':'reviewed visible ground support')+' is within one pixel of actor origin',Math.abs(supportOffset*paint.matrix[3])<1,{supportY,supportOffset,visibleBottomOffset:groundOffset,grounded:paint.grounded});
          if(airborne)check(label+': lifted feet remain above the virtual support',groundOffset< -20,{groundOffset});
        }else{
          const old=baseline[sample.id].frames[baseline[sample.id].clips.idle.frames[0]],calibrated=['sh3_numb_body_medium','sh2_lying_figure_crawling_021'].includes(sample.id),expectedAnchor=calibrated?old.visibleBounds[3]/old.height:old.anchor[1],expectedOffset=(old.visibleBounds[3]/old.height-expectedAnchor)*dh;
          check(label+': recovered idle keeps its documented calibration',Math.abs(groundOffset-expectedOffset)<.0001,{groundOffset,expectedOffset,calibrationException:calibrated});
        }
        const [left,top,right,bottom]=frame.framingBounds||frame.visibleBounds,[a,b,c,d,tx,ty]=paint.matrix;
        const corners=[[left,top],[right,top],[left,bottom],[right,bottom]].map(([u,v])=>{const x=dx+u/frame.width*dw,y=dy+v/frame.height*dh;return[a*x+c*y+tx,b*x+d*y+ty];});
        check(label+': '+key+' complete subject remains in the viewport',corners.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=1280&&y>=0&&y<=720),corners);
        const png=Buffer.from(actual.captures[key].split(',')[1],'base64'),file=label+'-'+key+'.png';
        check(label+': '+key+' is the actual game canvas',png.readUInt32BE(16)===1280&&png.readUInt32BE(20)===720);
        await writeFile(join(out,file),png);captures.push({kind:key,file,bytes:png.length,sha256:sha(png)});
      }
      const recovered=actual.evidence.recovered;
      check(label+': release recovers the original idle',recovered.draw.path==='/'+idleFrame.path&&recovered.draw.state==='idle'&&recovered.draw.moveKey===null);
      report.cases.push({label,player,fighterId:sample.id,source:sample.source,edition:sample.edition,pose:sample.pose,startX,captures,responses,evidence:actual.evidence,timeline:actual.timeline,geometry});
      await context.close();console.log(JSON.stringify({label,passed:true}));
    }
    check('No unhandled browser errors',report.errors.length===0,report.errors);
    for(const path of protectedPaths){report.sourceHashes[path].after=sha(await readFile(join(root,path)));check('HTTP QA leaves source unchanged '+path,report.sourceHashes[path].before===report.sourceHashes[path].after);}
    report.passed=true;
  }
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{
  await browser?.close();server?.kill('SIGTERM');report.completedAt=new Date().toISOString();
  await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,cases:report.cases.length,out:relative(root,out),failure:report.failure}));
}
