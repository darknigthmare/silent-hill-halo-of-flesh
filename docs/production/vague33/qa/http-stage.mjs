/** Real HTTP launch of the reviewed Historical Society scene.
 * --build-dir=/tmp/halo-wave33-build --out=/absolute/persistent/evidence
 */
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {getStage} from '../../../../src/data.js';
import {stageBitmapFor} from '../../../../src/stage-bitmaps.js';
const load=createRequire(import.meta.url);let chromium;
try{({chromium}=load('playwright-core'));}catch{({chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/__halo_qa.cjs')('playwright-core'));}
const root=resolve(fileURLToPath(new URL('../../../../',import.meta.url))),option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
if(option('out')&&option('out-dir'))throw Error('Use one evidence option: --out or --out-dir');
const buildDir=option('build-dir'),out=resolve(root,(option('out')||option('out-dir'))||'docs/production/vague33/qa/stage'),port=4303,base='http://127.0.0.1:'+port;
const plan=JSON.parse(await readFile(join(root,'docs/production/vague33/stages/import-plan.json'),'utf8'));
try{await access(out);throw Error('Preserve prior evidence; use a fresh --out.');}catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(out,{recursive:true});const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={schema:1,wave:33,startedAt:new Date().toISOString(),passed:false,build:buildDir||'dist',checks:[],captures:[],stages:[],errors:[],sourceHashes:{},
  method:'Normal HTTP UI launch, native image responses and passive canvas draw observation. Local mode and infinite timer are the only chosen match options; the scene policy suppresses old terrain, events and automatic finishers.',
  limits:['Source-anchored lateral reconstruction; source camera and 1:1 fidelity remain unverified.','Service workers blocked; no offline/update or completed match assertion.','Static scene adds no animation, collision or source-timed sequence.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
const paths=['src/stage-bitmap-manifest.js','src/stage-reference-policy.js','src/stage-bitmaps.js','src/fight.js','src/renderers.js','src/data.js'];let server,browser;
try{
  for(const path of paths)report.sourceHashes[path]={before:sha(await readFile(join(root,path)))};
  report.harnessSHA256=sha(await readFile(fileURLToPath(import.meta.url)));
  let occupied=false;try{await fetch(base,{signal:AbortSignal.timeout(700)});occupied=true;}catch{}check('Dedicated HTTP port unused',!occupied);
  server=spawn(process.execPath,['scripts/server.mjs',String(port),'--dist',...(buildDir?['--out-dir='+buildDir]:[])],{cwd:root,stdio:'ignore'});
  let ready=false,serverError;server.on('error',error=>{serverError=error;});
  for(let i=0;i<100;i++){if(serverError||server.exitCode!==null)throw Error('Dedicated server failed');try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(done=>setTimeout(done,100));}
  check('Built HTTP app ready',ready);browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
  for(const id of [...new Set(plan.delivered.map(row=>row.owner))]){
    const stage=getStage(id),art=stageBitmapFor(stage),samples=plan.delivered.filter(row=>row.owner===id),frames=art.layers.flatMap(layer=>layer.frames);
    check(id+': exact reviewed source scene and planes',art.source===samples[0].source&&art.scene===samples[0].scene&&frames.length===samples.length&&samples.every(sample=>frames.some(frame=>frame.path===sample.path&&frame.sha256===sample.sha256&&frame.bytes===sample.bytes&&frame.width===sample.width&&frame.height===sample.height)));
    const expected=new Map(frames.map(frame=>['/'+frame.path,frame])),context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}}),page=await context.newPage(),pending=[],responses=[];
    page.on('pageerror',error=>report.errors.push(error.message));
    page.on('response',response=>{const path=new URL(response.url()).pathname;if(expected.has(path))pending.push(response.body().then(bytes=>responses.push({path,status:response.status(),bytes:bytes.length,sha256:sha(bytes)})).catch(error=>responses.push({path,error:String(error)})));});
    await page.addInitScript(()=>{
      window.__wave33StageDraws={};const original=CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage=function(image,...args){const result=original.call(this,image,...args);if(this.canvas.id==='game'&&image?.src){const m=this.getTransform(),path=new URL(image.src,location.href).pathname;window.__wave33StageDraws[path]={path,args,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],width:image.naturalWidth,height:image.naturalHeight,engineFrame:window.__HALO_QA__?.engine?.frame};}return result;};
    });
    await page.goto(base+'/modules/unified-versus.html?qa=1&mode=versus&stage='+id+'&p1=bom_pyramid_head_129&p2=bom_butcher_123',{waitUntil:'domcontentloaded'});
    await page.locator('#mode').selectOption('local');await page.locator('#timer').selectOption('0');await page.locator('#launch').click();
    await page.waitForFunction(({id,paths})=>{const e=window.__HALO_QA__?.engine;return e?.stage.id===id&&e.phase==='fight'&&!e.paused&&e.frame>240&&e.actors.every(a=>!a.presentation)&&paths.every(path=>window.__wave33StageDraws?.[path]);},{id,paths:[...expected.keys()]},{timeout:30000});
    const actual=await page.evaluate(()=>{const q=window.__HALO_QA__,e=q.engine;return {stageId:e.stage.id,scene:e.stage.referencePolicy.sceneId,policy:e.stage.referencePolicy,weather:e.stage.weather,shiftEnabled:e.stage.shift.enabled,referenceTracks:e.stage.referenceTracks.map(t=>t.key),stageAnimations:e.stage.animations,liveHazards:e.hazards.length,phase:e.phase,frame:e.frame,actors:e.actors.map(a=>({id:a.data.id,x:a.x,y:a.y,facing:a.facing})),pins:[...q.stageAssetCache.pins].map(path=>({path,status:q.stageAssetCache.status(path)})),draws:Object.values(window.__wave33StageDraws)};});
    check(id+': ordinary UI starts the intended source scene',actual.stageId===id&&actual.scene===art.scene&&actual.phase==='fight');
    check(id+': normal static scene has no inherited motion or phase change',actual.referenceTracks.length===0&&actual.stageAnimations.length===0&&actual.weather==='none'&&actual.shiftEnabled===false);
    check(id+': old terrain, hazards, events and automatic finishers disabled',actual.policy.terrainRules===false&&actual.policy.automaticFinishers===false&&actual.policy.allowedHazards.length===0&&actual.policy.allowedEvents.length===0&&actual.liveHazards===0);
    check(id+': painted architecture adds no ceiling support',art.geometry.ceiling===false);
    check(id+': exact ordinary fighters retained',actual.actors.length===2&&actual.actors[0].id==='bom_pyramid_head_129'&&actual.actors[1].id==='bom_butcher_123');await Promise.all(pending);
    for(const [path,frame] of expected){
      check(id+': native plane decoded and painted '+frame.path,actual.draws.some(d=>d.path===path&&d.width===frame.width&&d.height===frame.height));
      check(id+': native plane ready and pinned '+frame.path,actual.pins.some(p=>p.path===frame.path&&p.status==='ready'));
      check(id+': exact HTTP bytes '+frame.path,responses.some(r=>r.path===path&&r.status===200&&r.bytes===frame.bytes&&r.sha256===frame.sha256),responses.filter(r=>r.path===path));
    }
    const file=id+'-http-fight.png',png=await page.locator('#game').screenshot();await writeFile(join(out,file),png);report.captures.push({stageId:id,file,bytes:png.length,sha256:sha(png),purpose:'actual-browser-FightEngine'});
    report.stages.push({id,entrySHA256:sha(JSON.stringify(art)),...actual,responses});await context.close();console.log(JSON.stringify({stage:id,passed:true}));
  }
  check('No unhandled browser errors',report.errors.length===0,report.errors);
  for(const path of paths){report.sourceHashes[path].after=sha(await readFile(join(root,path)));check('HTTP QA preserves source '+path,report.sourceHashes[path].before===report.sourceHashes[path].after);}report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{await browser?.close();server?.kill('SIGTERM');report.completedAt=new Date().toISOString();await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,captures:report.captures.length,out:relative(root,out),failure:report.failure}));}
