/** Measure the existing Numb Body medium idle at its real rendered ground line. */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const load=createRequire(import.meta.url);let chromium;
try{({chromium}=load('playwright-core'));}catch{({chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/__halo_qa.cjs')('playwright-core'));}
const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url)));
const option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
if(option('out')&&option('out-dir'))throw Error('Use one evidence option: --out or --out-dir');
const phase=option('phase'),source=process.argv.includes('--source'),buildDir=option('build-dir');
if(!['before','after'].includes(phase))throw Error('Use --phase=before or --phase=after');
const expectedAnchor=phase==='before'?1:903/1024;
const baseline=JSON.parse(await readFile(join(root,'docs/production/vague33/characters/baseline-owners.json'),'utf8')).assets.sh3_numb_body_medium.frames[0];
const out=resolve(root,(option('out')||option('out-dir'))||'docs/production/vague33/qa/calibration-'+phase),port=4301,base='http://127.0.0.1:'+port;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={wave:33,phase,startedAt:new Date().toISOString(),passed:false,build:source?'source':buildDir||'dist',checks:[],captures:[],cases:[],errors:[],
  method:'Ordinary HTTP UI launch, unchanged actor state and passive drawImage observation. The original idle PNG stays byte-identical; only the candidate frame anchor is assessed.',
  limits:['This is a ground-contact calibration, not original-game scale or 1:1 certification.','Service workers blocked; no offline update or full battle tested.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
try{await access(out);throw Error('Preserve existing evidence; choose a fresh --out.');}catch(error){if(error.code!=='ENOENT')throw error;}
let browser,server;await mkdir(out,{recursive:true});
try{
  let occupied=false;try{await fetch(base,{signal:AbortSignal.timeout(600)});occupied=true;}catch{}check('Dedicated port unused',!occupied);
  server=spawn(process.execPath,['scripts/server.mjs',String(port),...(source?[]:['--dist',...(buildDir?['--out-dir='+buildDir]:[])])],{cwd:root,stdio:'ignore'});
  let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('HTTP server exited');try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(done=>setTimeout(done,100));}
  check('HTTP app ready',ready);browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
  for(const player of [0,1]){
    const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}}),page=await context.newPage();
    page.on('pageerror',error=>report.errors.push(error.message));
    await page.addInitScript(player=>{
      const original=CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
        const result=original.call(this,image,...args),q=window.__HALO_QA__,actor=q?.engine?.actors[player];
        if(this.canvas.id==='game'&&image?.src&&actor?.data.id==='sh3_numb_body_medium'&&actor.state==='idle'&&!actor.attack){
          const path=new URL(image.src,location.href).pathname;
          if(path.includes('/sh3_numb_body_medium.')){const m=this.getTransform();window.__calibrationDraw={path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],actor:{id:actor.data.id,x:actor.x,y:actor.y,facing:actor.facing,grounded:actor.grounded,state:actor.state},engineFrame:q.engine.frame};}
        }
        return result;
      };
    },player);
    const ids=player?['bom_butcher_123','sh3_numb_body_medium']:['sh3_numb_body_medium','bom_butcher_123'];
    await page.goto(base+'/modules/unified-versus.html?qa=1&mode=versus&stage=midwich_nightmare&p1='+ids[0]+'&p2='+ids[1],{waitUntil:'domcontentloaded'});
    await page.locator('#mode').selectOption('local');await page.locator('#timer').selectOption('0');for(const id of ['otherworldShift','stageHazards','stageDirector'])await page.locator('#'+id).uncheck();await page.locator('#launch').click();
    await page.waitForFunction(()=>{const q=window.__HALO_QA__;return q?.engine?.phase==='fight'&&!q.engine.paused&&q.engine.actors.every(actor=>!actor.presentation)&&window.__calibrationDraw;},null,{timeout:30000});
    const result=await page.evaluate(async()=>{const {SPRITES}=await import('/src/sprite-manifest.js'),art=SPRITES.sh3_numb_body_medium,frame=art.frames[art.clips.idle.frames[0]];return {frame,draw:window.__calibrationDraw};});
    const {frame,draw}=result,[dx,dy,dw,dh]=draw.args,offsetWorld=dy+frame.visibleBounds[3]/frame.height*dh,offsetPixels=offsetWorld*draw.matrix[3];
    check('Exact original idle bytes and frame geometry at side '+player,frame.path===draw.path.slice(1)&&['path','sha256','bytes','width','height','bodyHeight','facing','visibleBounds'].every(key=>JSON.stringify(frame[key])===JSON.stringify(baseline[key]))&&frame.anchor[0]===baseline.anchor[0],{path:frame.path,sha256:frame.sha256});
    check('Expected measured anchor at side '+player,Math.abs(frame.anchor[1]-expectedAnchor)<1e-9,frame.anchor);
    check('Actual owner is grounded and uses the requested orientation at side '+player,draw.actor.grounded&&draw.actor.facing===(player? -1:1));
    check('Measured '+phase+' ground-contact offset at side '+player,phase==='before'?offsetWorld< -20&&offsetWorld> -30:Math.abs(offsetPixels)<1,{offsetWorld,offsetPixels});
    const response=await page.request.get(base+'/'+frame.path),bytes=await response.body();check('Published original PNG bytes at side '+player,response.status()===200&&sha(bytes)===frame.sha256&&bytes.length===frame.bytes);
    const file='numb-medium-idle-'+phase+(player?'-left':'-right')+'.png',png=await page.locator('#game').screenshot({path:join(out,file)});report.captures.push({file,bytes:png.length,sha256:sha(png)});
    report.cases.push({player,...result,offsetWorld,offsetPixels});await context.close();
  }
  check('No unhandled browser errors',report.errors.length===0,report.errors);report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{await browser?.close();server?.kill('SIGTERM');report.completedAt=new Date().toISOString();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,captures:report.captures.length,failure:report.failure}));}
