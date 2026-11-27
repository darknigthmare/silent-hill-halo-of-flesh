/** Actual keyboard approach, contact, low guard and standing guard, both sides.
 * --build-dir=/tmp/halo-wave33-build --out=/absolute/persistent/evidence
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
const buildDir=option('build-dir'),out=resolve(root,(option('out')||option('out-dir'))||'docs/production/vague33/qa/crawling-combat'),port=4305,base='http://127.0.0.1:'+port;
const {SPRITES}=await import(pathToFileURL(resolve(root,buildDir||'dist','src/sprite-manifest.js')).href);
const id='sh2_lying_figure_crawling_021',art=SPRITES[id],pose=art.frames[art.clips.neutralLight.frames[0]],idle=art.frames[art.clips.idle.frames[0]];
const baselinePath='docs/production/vague33/combat-profiles-before-crawling.json',oldMove=JSON.parse(await readFile(join(root,baselinePath),'utf8')).crawling.moves.neutralLight;
try{await access(out);throw Error('Preserve prior evidence; use a fresh --out.');}catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(out,{recursive:true});const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={wave:33,startedAt:new Date().toISOString(),passed:false,build:buildDir||'dist',baselinePath,checks:[],cases:[],captures:[],errors:[],
  method:'Normal training UI with native HITBOXES; ordinary keyboard movement closes the gap, followed by ordinary light input. No actor, position, health, guard, camera or clock injection. Auto-heal and free meter disabled.',
  limits:['Historical humanoid hurtbox stays versus adaptation; source collision and original-game scale are not certified.','Static candidate and grounded versus contact do not establish 1:1 timing or animation.','Standing guard is tested separately from crouching guard.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};let server,browser;
try{
  report.harnessSHA256=sha(await readFile(fileURLToPath(import.meta.url)));report.baselineSHA256=sha(await readFile(join(root,baselinePath)));
  let occupied=false;try{await fetch(base,{signal:AbortSignal.timeout(700)});occupied=true;}catch{}check('Dedicated port unused',!occupied);
  server=spawn(process.execPath,['scripts/server.mjs',String(port),'--dist',...(buildDir?['--out-dir='+buildDir]:[])],{cwd:root,stdio:'ignore'});
  let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('Server exited');try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(done=>setTimeout(done,100));}
  check('Built HTTP app ready',ready);browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
  for(const player of [0,1])for(const kind of ['hit','low-guard','standing-guard']){
    const label=(player?'left':'right')+'-'+kind,context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}}),page=await context.newPage();page.on('pageerror',error=>report.errors.push({label,message:error.message}));
    await page.addInitScript(({player,posePath,idlePath})=>{
      window.__combatProbe={};const original=CanvasRenderingContext2D.prototype.drawImage;
      const snapshot=a=>({id:a.data.id,x:a.x,y:a.y,facing:a.facing,grounded:a.grounded,state:a.state,health:a.health,guard:a.guard,blocking:a.blocking,crouching:a.crouching,parryWindow:a.parryWindow,lastHit:a.lastHit?{...a.lastHit}:null,stats:{...a.stats}});
      CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
        const result=original.call(this,image,...args),e=window.__HALO_QA__?.engine,a=e?.actors[player],t=e?.actors[1-player];
        if(this.canvas.id==='game'&&image?.src&&a){
          const path=new URL(image.src,location.href).pathname,m=this.getTransform(),draw={path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],engineFrame:e.frame};
          if(path===posePath&&a.attack?.key==='neutralLight'&&t.lastHit?.attackerIndex===player&&t.lastHit.moveKey.startsWith('neutralLight')&&!window.__combatProbe.capture){
            const canvas=this.canvas;window.__combatProbe.action={draw,attacker:snapshot(a),target:snapshot(t),move:{...a.attack.move},attackFrame:a.attack.frame,attackHitCount:a.attack.hitCount,engineFrame:e.frame};window.__combatProbe.capture='pending';
            requestAnimationFrame(()=>{window.__combatProbe.capturedFrame=e.frame;window.__combatProbe.capture=canvas.toDataURL('image/png');});
          }
          if(path===idlePath&&window.__combatProbe.capture?.startsWith('data:image/png;')&&a.state==='idle'&&!a.attack&&!window.__combatProbe.recovered)window.__combatProbe.recovered={draw,attacker:snapshot(a)};
        }return result;
      };
    },{player,posePath:'/'+pose.path,idlePath:'/'+idle.path});
    const ids=player?['bom_butcher_123',id]:[id,'bom_butcher_123'];
    await page.goto(base+'/modules/unified-versus.html?qa=1&mode=training&stage=midwich_nightmare&p1='+ids[0]+'&p2='+ids[1],{waitUntil:'domcontentloaded'});
    for(const key of ['otherworldShift','stageHazards','stageDirector'])await page.locator('#'+key).uncheck();await page.locator('#launch').click();
    await page.waitForFunction(()=>{const e=window.__HALO_QA__?.engine;return e?.phase==='fight'&&!e.paused&&e.frame>240&&e.actors.every(a=>!a.presentation);},null,{timeout:30000});
    if(!(await page.locator('#hitboxes').isVisible()))await page.locator('#trainingToggle').click();await page.locator('#hitboxes').check();await page.locator('#autoHeal').uncheck();await page.locator('#freeMeter').uncheck();await page.locator('#game').focus();
    const initial=await page.evaluate(player=>{const e=window.__HALO_QA__.engine;return {training:e.config.training,showHitboxes:e.config.showHitboxes,autoHeal:e.config.autoHeal,freeMeter:e.config.freeMeter,bindings:e.bindings.players,move:e.actors[player].profile.moves.neutralLight,distance:Math.abs(e.actors[0].x-e.actors[1].x)};},player);
    check(label+': ordinary Dojo without auto heal or free meter',initial.training&&initial.showHitboxes&&!initial.autoHeal&&!initial.freeMeter);
    const changedKeys=[...new Set([...Object.keys(oldMove),...Object.keys(initial.move)])].filter(key=>JSON.stringify(oldMove[key])!==JSON.stringify(initial.move[key]));
    check(label+': only exact move level changes from mid to low',oldMove.level==='mid'&&initial.move.level==='low'&&changedKeys.length===1&&changedKeys[0]==='level',{changedKeys,damage:initial.move.damage,reach:initial.move.reach,startup:initial.move.startup,active:initial.move.active,recovery:initial.move.recovery});
    const toward=initial.bindings[player][player?'left':'right'];await page.keyboard.down(toward);
    try{await page.waitForFunction(()=>Math.abs(window.__HALO_QA__.engine.actors[0].x-window.__HALO_QA__.engine.actors[1].x)<=95,null,{timeout:15000});}finally{await page.keyboard.up(toward);}
    await page.waitForFunction(player=>{const a=window.__HALO_QA__.engine.actors[player];return a.state==='idle'&&a.grounded&&!a.attack;},player,{timeout:10000});
    const targetKeys=initial.bindings[1-player],held=[];
    if(kind!=='hit'){
      if(kind==='low-guard'){await page.keyboard.down(targetKeys.down);held.push(targetKeys.down);}await page.keyboard.down(targetKeys.guard);held.push(targetKeys.guard);
      const guardFrame=await page.evaluate(()=>window.__HALO_QA__.engine.frame);
      await page.waitForFunction(({player,kind,guardFrame})=>{const e=window.__HALO_QA__.engine,t=e.actors[1-player];return e.frame>=guardFrame+20&&t.blocking&&t.grounded&&t.parryWindow===0&&t.crouching===(kind==='low-guard');},{player,kind,guardFrame},{timeout:10000});
    }
    const before=await page.evaluate(player=>{const e=window.__HALO_QA__.engine,a=e.actors[player],t=e.actors[1-player];return {frame:e.frame,attacker:{x:a.x,y:a.y,facing:a.facing,state:a.state},target:{x:t.x,y:t.y,facing:t.facing,health:t.health,guard:t.guard,crouching:t.crouching,blocking:t.blocking,parryWindow:t.parryWindow,stats:{...t.stats}},distance:Math.abs(a.x-t.x)};},player);
    check(label+': keyboard approach reaches contact range',before.distance<initial.distance&&before.distance<=95&&before.distance>0&&before.attacker.facing===(player?-1:1),before);
    await page.keyboard.press(initial.bindings[player].light);
    try{await page.waitForFunction(()=>window.__combatProbe.capture?.startsWith('data:image/png;'),null,{timeout:15000});}
    catch(error){report.incompleteCase={label,before,live:await page.evaluate(()=>({probe:window.__combatProbe,actors:window.__HALO_QA__.engine.actors.map(a=>({id:a.data.id,x:a.x,y:a.y,state:a.state,lastMoveKey:a.lastMoveKey,lastHit:a.lastHit,health:a.health,guard:a.guard,blocking:a.blocking,crouching:a.crouching}))}))};throw error;}
    finally{for(const key of held.reverse())await page.keyboard.up(key);}
    await page.waitForFunction(()=>!!window.__combatProbe.recovered,null,{timeout:15000});
    const actual=await page.evaluate(()=>window.__combatProbe),action=actual.action,damage=before.target.health-action.target.health;
    check(label+': exact native pose and resolved contact share captured frame',action.draw.path==='/'+pose.path&&action.draw.engineFrame===actual.capturedFrame&&action.engineFrame===actual.capturedFrame&&action.attacker.id===id&&action.target.lastHit.attackerIndex===player);
    check(label+': engine resolves a real damaging contact',damage>0&&action.target.stats.damageTaken>before.target.stats.damageTaken&&action.attackHitCount===1,{damage,lastHit:action.target.lastHit});
    if(kind==='low-guard')check(label+': actual crouching guard blocks low hit',before.target.blocking&&before.target.crouching&&before.target.parryWindow===0&&action.target.lastHit.moveKey==='neutralLight-guard-chip'&&action.target.guard<before.target.guard&&action.target.stats.perfectGuards===before.target.stats.perfectGuards,{before:before.target,after:action.target});
    else check(label+': low hit connects through intended guard state',action.target.lastHit.moveKey==='neutralLight'&&(kind==='hit'?!before.target.blocking:before.target.blocking&&!before.target.crouching),{guardBefore:before.target.blocking,crouchBefore:before.target.crouching,lastHit:action.target.lastHit});
    const recovered=actual.recovered;
    check(label+': original idle returns without scale jump',recovered.draw.path==='/'+idle.path&&recovered.attacker.state==='idle'&&Math.abs(recovered.draw.args[2]-action.draw.args[2])<1e-6&&Math.abs(recovered.draw.args[3]-action.draw.args[3])<1e-6,{attackSize:action.draw.args.slice(2),idleSize:recovered.draw.args.slice(2),bodyHeight:{pose:pose.bodyHeight,idle:idle.bodyHeight}});
    const png=Buffer.from(actual.capture.split(',')[1],'base64'),file='crawling-'+label+'.png';await writeFile(join(out,file),png);report.captures.push({file,bytes:png.length,sha256:sha(png)});report.cases.push({label,player,kind,before,action,recovered,damage,capturedFrame:actual.capturedFrame});await context.close();console.log(JSON.stringify({label,passed:true,damage}));
  }
  for(const player of [0,1]){const hit=report.cases.find(c=>c.player===player&&c.kind==='hit'),low=report.cases.find(c=>c.player===player&&c.kind==='low-guard'),standing=report.cases.find(c=>c.player===player&&c.kind==='standing-guard');check('Crouching guard reduces damage; standing guard does not on side '+player,low.damage<hit.damage&&standing.damage===hit.damage,{hit:hit.damage,lowGuard:low.damage,standingGuard:standing.damage});}
  check('No unhandled browser errors',report.errors.length===0,report.errors);report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{await browser?.close();server?.kill('SIGTERM');report.completedAt=new Date().toISOString();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,cases:report.cases.length,captures:report.captures.length,failure:report.failure}));}
