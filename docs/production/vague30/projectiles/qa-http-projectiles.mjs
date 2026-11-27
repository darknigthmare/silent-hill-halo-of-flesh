/**
 * Wave30: real HTTP assets, ordinary keyboard projectile commands, and isolated Incubus FX.
 * Requires a current dist from npm run build. No diagnostic admission, actor-state injection,
 * image replacement, timers patched, or character artwork generated.
 * node docs/production/vague30/projectiles/qa-http-projectiles.mjs --port=4291 --out=tests/http-wave30-projectiles
 */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {SPRITES} from '../../../../src/sprite-manifest.js';
import {PROJECTILE_BITMAPS} from '../../../../src/projectile-bitmap-manifest.js';
import {getFighter,createCombatProfile} from '../../../../src/data.js';
import {projectileBitmapFor,validateProjectileRegistry} from '../../../../src/projectile-bitmaps.js';
import {sourceGroundProjectile} from '../../../../src/combat-reference-policy.js';

const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)));
const option=name=>process.argv.find(value=>value.startsWith('--'+name+'='))?.slice(name.length+3);
const port=Number(option('port')||4291);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Expected --port=1024..65535');
const out=resolve(root,option('out')||'tests/http-wave30-projectiles');
if(out===root||relative(root,out).startsWith('..'))throw Error('Output must be inside the repository');
const base='http://127.0.0.1:'+port,sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const normalCases=[
  {id:'downpour_bogeyman_115',source:'downpour',slot:'neutralSpecial',effect:'downpour_bogeyman_ground_shockwave',ground:true},
  {id:'origins_straight_jacket_074',source:'origins',slot:'neutralSpecial',effect:'origins_straight_jacket_acid_ball',ground:false}
];
const isolatedId='sh1_incubus_019',isolatedEffect='sh1_incubus_red_lightning';
const report={schema:1,wave:30,startedAt:new Date().toISOString(),passed:false,checks:[],normalCases:[],isolatedCases:[],errors:[],
  browserTest:true,httpTest:true,offlineTest:false,port,
  method:'Current dist over a dedicated HTTP server. Fresh browser contexts. Normal UI launch and live keyboard bindings for Bogeyman and Origins in both player slots; passive draw observer captures emission and flight. Incubus uses only drawProjectileBitmap on a separate test canvas with unit fixtures, after confirming normal combat-art admission remains blocked. No FightEngine is created for Incubus.',
  limits:['Headless Chromium with service workers blocked; no offline cache-update claim.',
    'The ordinary neutralSpecial is played for two fighters in both orientations. Super/desperation routes are checked as descriptors, not claimed as played.',
    'Incubus isolated render fixtures are not actual emitted combat projectiles and do not admit a missing fighter sprite.',
    'Static art candidates; no original animation, timing, full hit/guard matrix, source-side opposite view or 1:1 fidelity certification.',
    'This report becomes evidence only when this script executes; previous native evidence is documented separately.'],
  sourceHashes:{},captures:[]};
const check=(name,passed,detail)=>{
  report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});
  if(!passed)throw Error(name);
};
const sourcePaths=[
  'src/projectile-bitmap-manifest.js','src/projectile-bitmaps.js','src/sprite-manifest.js',
  'src/data.js','src/movesets.js','src/combat-reference-policy.js','src/fight.js',
  'docs/production/vague30/projectiles/qa-http-projectiles.mjs'
];
try{await access(out);throw Error('Use a fresh output directory; existing evidence is preserved');}
catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(out,{recursive:true});
let browser,server;
try{
  validateProjectileRegistry();
  for(const path of sourcePaths)report.sourceHashes[path]={before:sha(await readFile(join(root,path)))};
  const targetArts=[...normalCases.map(item=>PROJECTILE_BITMAPS[item.effect]),PROJECTILE_BITMAPS[isolatedEffect]];
  check('Exactly three expected projectile entries exist',targetArts.length===3&&targetArts.every(Boolean));
  const routes=[];
  for(const art of targetArts){
    const fighter=getFighter(art.fighterId),profile=createCombatProfile(fighter),bytes=await readFile(join(root,art.frame.path));
    check(art.id+': original local PNG bytes',bytes.length===art.frame.bytes&&sha(bytes)===art.frame.sha256);
    check(art.id+': native PNG dimensions',bytes.readUInt32BE(16)===art.frame.width&&bytes.readUInt32BE(20)===art.frame.height);
    check(art.id+': static unverified provenance',art.status==='integrated-candidate'&&art.fidelity==='unverified');
    for(const slot of art.slots){
      const move=profile.moves[slot];
      check(art.id+': exact active route '+slot,move?.enabled===true&&move.projectile&&!move.trap&&projectileBitmapFor(fighter,move)===art);
      check(art.id+': source floor contract '+slot,sourceGroundProjectile(fighter,move)===(art.presentation.anchor==='ground'));
      routes.push({fighterId:fighter.id,source:fighter.source,slot,effectId:art.id});
    }
  }
  check('Seven declared routes retained',routes.length===7);
  report.routes=routes;
  let occupied=false;
  try{await fetch(base,{signal:AbortSignal.timeout(800)});occupied=true;}catch{}
  check('Dedicated test port is unused',!occupied);
  let serverError=null;
  server=spawn(process.execPath,['scripts/server.mjs',String(port),'--dist'],{cwd:root,stdio:'ignore'});
  server.on('error',error=>{serverError=error;});
  let ready=false;
  for(let i=0;i<100;i++){
    if(serverError||server.exitCode!==null)throw Error('Dedicated HTTP server failed: '+(serverError||server.exitCode));
    try{if((await fetch(base,{signal:AbortSignal.timeout(1000)})).ok){ready=true;break;}}catch{}
    await new Promise(done=>setTimeout(done,100));
  }
  check('Dedicated dist server ready',ready&&!serverError&&server.exitCode===null);
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});
  report.browser=browser.version();

  for(const sample of normalCases)for(const player of [0,1]){
    const art=PROJECTILE_BITMAPS[sample.effect],frame=art.frame,path='/'+frame.path;
    const label=sample.id+(player===0?'-right':'-left'),responses=[],pending=[];
    check(label+': exact fighter/source contract',art.fighterId===sample.id&&art.source===sample.source);
    check(label+': normal combat artwork exists',!!SPRITES[sample.id]?.clips?.idle);
    const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}});
    try{
      const page=await context.newPage();
      page.on('pageerror',error=>report.errors.push({label,message:error.message}));
      page.on('response',response=>{
        if(new URL(response.url()).pathname===path)pending.push(response.body()
          .then(bytes=>responses.push({path,status:response.status(),bytes:bytes.length,sha256:sha(bytes)}))
          .catch(error=>responses.push({path,status:response.status(),error:String(error)})));
      });
      await page.addInitScript(({path,player,slot})=>{
        const state={captures:{},draws:{},firstFrame:null,trackedShot:null};
        window.__wave30Projectiles=state;
        const nativeDraw=CanvasRenderingContext2D.prototype.drawImage;
        const shotState=shot=>({moveKey:shot.move.key,x:shot.x,y:shot.y,vx:shot.vx,vy:shot.vy,radius:shot.radius,
          life:shot.life,groundY:shot.groundY??null,attackId:shot.attackId});
        CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
          const result=nativeDraw.call(this,image,...args);
          if(this.canvas.id!=='game'||!image?.src||new URL(image.src,location.href).pathname!==path)return result;
          const engine=window.__HALO_QA__?.engine,actor=engine?.actors[player];
          if(!engine||!actor)return result;
          if(!state.trackedShot)state.trackedShot=engine.projectiles.find(shot=>shot.owner===actor&&shot.move.key===slot);
          const shot=state.trackedShot;
          if(!shot||!engine.projectiles.includes(shot))return result;
          if(state.firstFrame===null)state.firstFrame=engine.frame;
          const matrix=this.getTransform();
          const draw={path,args,width:image.naturalWidth,height:image.naturalHeight,
            matrix:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],engineFrame:engine.frame};
          state.draws[path]=draw;
          const kind=!state.captures.emission?'emission':engine.frame>=state.firstFrame+12&&!state.captures.flight?'flight':null;
          if(kind){
            state.captures[kind]={pending:true};
            const canvas=this.canvas,evidence={draw,frame:engine.frame,fighterId:actor.data.id,lastMoveKey:actor.lastMoveKey,
              firstFrame:state.firstFrame,shot:shotState(shot)};
            requestAnimationFrame(()=>{
              state.captures[kind]={...evidence,capturedFrame:engine.frame,png:canvas.toDataURL('image/png')};
            });
          }
          return result;
        };
      },{path,player,slot:sample.slot});
      const opponent='sh2_creeper_025';
      const query=new URLSearchParams({qa:'1',mode:'versus',stage:'midwich',
        p1:player===0?sample.id:opponent,p2:player===1?sample.id:opponent});
      await page.goto(base+'/modules/unified-versus.html?'+query,{waitUntil:'domcontentloaded'});
      await page.locator('#mode').selectOption('local');
      await page.locator('#timer').selectOption('0');
      for(const id of ['otherworldShift','stageHazards','stageDirector'])await page.locator('#'+id).uncheck();
      await page.locator('#launch').click();
      await page.waitForFunction(()=>window.__HALO_QA__?.engine?.phase==='fight'&&!window.__HALO_QA__.engine.paused,null,{timeout:30000});
      await page.locator('#game').focus();
      const bindings=await page.evaluate(player=>window.__HALO_QA__.engine.bindings.players[player],player);
      check(label+': live special binding exists',typeof bindings.special==='string'&&bindings.special.length>0);
      await page.keyboard.down(bindings.special);
      try{
        await page.waitForFunction(()=>['emission','flight'].every(kind=>window.__wave30Projectiles?.captures[kind]?.png?.startsWith('data:image/png;')),null,{timeout:15000});
      }finally{await page.keyboard.up(bindings.special);}
      const actual=await page.evaluate(()=>({captures:window.__wave30Projectiles.captures,
        phase:window.__HALO_QA__.engine.phase,
        actors:window.__HALO_QA__.engine.actors.map(actor=>({id:actor.data.id,x:actor.x,y:actor.y,facing:actor.facing,state:actor.state}))}));
      await Promise.all(pending);
      check(label+': exact HTTP image bytes',responses.some(row=>row.status===200&&row.bytes===frame.bytes&&row.sha256===frame.sha256),responses);
      for(const kind of ['emission','flight']){
        const evidence=actual.captures[kind],draw=evidence.draw,shot=evidence.shot;
        check(label+': ordinary command observed '+kind,evidence.fighterId===sample.id&&evidence.lastMoveKey===sample.slot&&shot.moveKey===sample.slot);
        check(label+': captured actual rendered frame '+kind,evidence.capturedFrame===evidence.frame&&draw.engineFrame===evidence.frame);
        check(label+': registered image decoded '+kind,draw.path===path&&draw.width===frame.width&&draw.height===frame.height);
        check(label+': emitted and rendered orientation '+kind,Math.sign(shot.vx)===(player===0?1:-1)&&Math.sign(draw.matrix[0])===Math.sign(shot.vx)*art.presentation.facing);
        check(label+': expected ground classification '+kind,sample.ground?Number.isFinite(shot.groundY):shot.groundY===null);
        const png=Buffer.from(evidence.png.split(',')[1],'base64'),file=label+'-'+kind+'.png';
        check(label+': native canvas dimensions '+kind,png.readUInt32BE(16)===1280&&png.readUInt32BE(20)===720);
        await writeFile(join(out,file),png);
        report.captures.push({file,kind,label,bytes:png.length,sha256:sha(png),width:1280,height:720});
        delete evidence.png;
      }
      const first=actual.captures.emission,last=actual.captures.flight;
      check(label+': same projectile advances through flight',last.shot.attackId===first.shot.attackId&&last.frame-first.frame>=12&&last.shot.x!==first.shot.x&&last.shot.life<first.shot.life);
      report.normalCases.push({label,fighterId:sample.id,source:sample.source,slot:sample.slot,effectId:art.id,player,bindings,responses,...actual});
      console.log(JSON.stringify({label,passed:true,captures:2}));
    }finally{await context.close();}
  }

  // This surface never loads the application or constructs a FightEngine.
  // The objects supplied to drawProjectileBitmap are explicitly unit fixtures.
  {
    const art=PROJECTILE_BITMAPS[isolatedEffect],frame=art.frame,path='/'+frame.path;
    check('Incubus body remains absent from sprite manifest',!SPRITES[isolatedId]?.clips?.idle);
    const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:720}});
    const responses=[],pending=[];
    try{
      const page=await context.newPage();
      page.on('pageerror',error=>report.errors.push({label:'incubus-isolated',message:error.message}));
      page.on('response',response=>{
        if(new URL(response.url()).pathname===path)pending.push(response.body()
          .then(bytes=>responses.push({path,status:response.status(),bytes:bytes.length,sha256:sha(bytes)}))
          .catch(error=>responses.push({path,status:response.status(),error:String(error)})));
      });
      // Navigating to a JS resource displays text and establishes the same HTTP origin
      // without executing the app. setContent then creates only a test canvas.
      await page.goto(base+'/src/projectile-bitmap-manifest.js',{waitUntil:'domcontentloaded'});
      await page.setContent('<!doctype html><html><head><meta charset="utf-8"><title>Isolated projectile renderer QA</title></head><body style="margin:0;background:#101216"><canvas id="projectile-fixture" width="1280" height="720"></canvas></body></html>');
      const actual=await page.evaluate(async({fighterId,effectId})=>{
        const [{getFighter,createCombatProfile},{PROJECTILE_BITMAPS},{spriteCache},
          {prepareProjectileBitmaps,drawProjectileBitmap,projectileBitmapFor}]=await Promise.all([
            import('/src/data.js'),import('/src/projectile-bitmap-manifest.js'),
            import('/src/sprite-system.js'),import('/src/projectile-bitmaps.js')
          ]);
        const checks=[];
        const check=(name,passed,detail)=>{checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
        const fighter=getFighter(fighterId),profile=createCombatProfile(fighter),art=PROJECTILE_BITMAPS[effectId];
        check('No application engine on isolated surface',!window.__HALO_QA__?.engine);
        const admission=await spriteCache.prepare([fighter]);
        check('Normal combat-art admission remains blocked',admission.ok===false&&admission.missing.includes(fighterId),admission);
        check('No combat-art bypass flag used',!Object.hasOwn(admission,'diagnostic'));
        const ready=await prepareProjectileBitmaps([fighter]);
        check('Exact projectile asset prewarm succeeds',ready.ok,ready);
        const canvas=document.getElementById('projectile-fixture'),ctx=canvas.getContext('2d');
        ctx.fillStyle='#111318';ctx.fillRect(0,0,1280,720);
        ctx.fillStyle='#f4eee1';ctx.font='22px sans-serif';
        ctx.fillText('Incubus — isolated projectile renderer; no combat admission',28,36);
        const fixtures=[];
        for(const [row,slot] of ['neutralSpecial','super','desperation'].entries()){
          const move=profile.moves[slot];
          check('Exact Incubus route '+slot,move?.enabled===true&&move.projectile&&projectileBitmapFor(fighter,move)===art);
          for(const [column,direction] of [1,-1].entries()){
            const cellX=column*640,cellY=60+row*205;
            ctx.fillStyle=column===0?'#141820':'#6b6d70';ctx.fillRect(cellX+16,cellY,608,190);
            ctx.fillStyle='#f4eee1';ctx.font='16px sans-serif';ctx.fillText(slot+' / '+(direction===1?'right':'left'),cellX+32,cellY+28);
            const radius=(slot==='neutralSpecial'?12:18)*(move.projectileScale||1);
            const shot={owner:{data:fighter,facing:direction},move,x:cellX+320,y:cellY+110,
              vx:direction*(move.projectileSpeed||13),vy:0,radius,life:move.projectileLife,maxLife:move.projectileLife,gravity:0};
            const before=JSON.stringify(shot),draw=drawProjectileBitmap(ctx,shot);
            check('Native renderer draws exact isolated effect '+slot+'/'+direction,draw.kind==='raster'&&draw.id===art.id&&draw.path===art.frame.path,draw);
            check('Renderer preserves fixture state '+slot+'/'+direction,JSON.stringify(shot)===before);
            check('Correct fixture orientation '+slot+'/'+direction,draw.flip===direction*art.presentation.facing);
            fixtures.push({slot,direction,radius,draw});
          }
        }
        const move=profile.moves.neutralSpecial;
        check('Wrong edition cannot inherit red lightning',projectileBitmapFor({...fighter,source:'sh2'},move)===null);
        check('Inactive slot cannot obtain effect',projectileBitmapFor(fighter,{...move,enabled:false})===null);
        check('Non-projectile cannot obtain effect',projectileBitmapFor(fighter,{...move,projectile:false})===null);
        check('Trap cannot obtain effect',projectileBitmapFor(fighter,{...move,trap:true})===null);
        check('Unmapped slot cannot obtain effect',projectileBitmapFor(fighter,{...move,key:'airSpecial'})===null);
        check('No application engine after isolated drawing',!window.__HALO_QA__?.engine);
        return {checks,admission,ready,fixtures,bodyRendered:false,matchLaunched:false,stateInjectedIntoGame:false,
          fixtureOnly:true,png:canvas.toDataURL('image/png')};
      },{fighterId:isolatedId,effectId:isolatedEffect});
      await Promise.all(pending);
      check('Incubus isolated: exact HTTP image bytes',responses.some(row=>row.status===200&&row.bytes===frame.bytes&&row.sha256===frame.sha256),responses);
      for(const row of actual.checks)check('Incubus isolated: '+row.name,row.passed,row.detail);
      const png=Buffer.from(actual.png.split(',')[1],'base64'),file='sh1_incubus_red_lightning-isolated.png';
      check('Incubus isolated: canvas dimensions',png.readUInt32BE(16)===1280&&png.readUInt32BE(20)===720);
      await writeFile(join(out,file),png);delete actual.png;
      report.captures.push({file,kind:'isolated-renderer-fixtures',bytes:png.length,sha256:sha(png),width:1280,height:720});
      report.isolatedCases.push({fighterId:isolatedId,effectId:isolatedEffect,responses,...actual});
      console.log(JSON.stringify({label:'incubus-isolated',passed:true,captures:1,matchLaunched:false}));
    }finally{await context.close();}
  }
  check('No unhandled browser errors',report.errors.length===0,report.errors);
  for(const [path,entry] of Object.entries(report.sourceHashes)){
    entry.after=sha(await readFile(join(root,path)));
    check('Source unchanged '+path,entry.before===entry.after);
  }
  report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{
  await browser?.close();
  server?.kill('SIGTERM');
  report.completedAt=new Date().toISOString();
  await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,normalCases:report.normalCases.length,
    isolatedCases:report.isolatedCases.length,captures:report.captures.length,report:join(out,'report.json'),failure:report.failure??null}));
}
