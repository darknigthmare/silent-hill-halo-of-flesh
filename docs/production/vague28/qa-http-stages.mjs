/** Real Chromium/HTTP checks of authored assets through ordinary UI controls.
 * --ids=id,id --stages=id,id --out=/fresh/evidence
 * Observes drawImage without replacing pixels, URLs, modules or actor state.
 */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {getFighter,getStage,createCombatProfile} from '../../../src/data.js';
import {SPRITES} from '../../../src/sprite-manifest.js';
import {stageBitmapFor} from '../../../src/stage-bitmaps.js';

const root=resolve(fileURLToPath(new URL('../../../',import.meta.url)));
const option=name=>process.argv.find(x=>x.startsWith('--'+name+'='))?.slice(name.length+3);
const ids=(option('ids')||'').split(',').filter(Boolean),stages=(option('stages')||'').split(',').filter(Boolean);
if((!ids.length&&!stages.length)||!option('out'))throw Error('Explicit IDs or stages and fresh output required.');
for(const entries of [ids,stages])if(new Set(entries).size!==entries.length||entries.some(id=>!/^\w+$/.test(id)))throw Error('Invalid or repeated ID.');
const out=resolve(option('out')),port=Number(option('port')||4266),base='http://127.0.0.1:'+port;
const build=option('build')||'source';
if(!['source','dist'].includes(build))throw Error('Build must be source or dist.');
try{await access(out);throw Error('Preserve prior HTTP evidence.');}catch(error){if(error.code!=='ENOENT')throw error;}
await mkdir(out,{recursive:true});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={schema:1,wave:28,startedAt:new Date().toISOString(),passed:false,
  browserTest:true,httpTest:true,actorStateInjected:false,assetSubstitution:false,
  build,scope:'Actual '+build+' HTTP app; real native PNG requests, browser decode, workshop right/left UI, static playback and role restrictions, and ordinary launch of each added arena.',
  checks:[],errors:[],captures:[],characters:[],stages:[],sourceHashes:{},
  limits:['Headless Chromium with fresh contexts and service workers blocked. No offline/update service-worker assertion.',
    'Stage launches use two existing combat-enabled fighters; reference-only profiles remain in their workshop.',
    'No attack timing, source animation or 1:1 fidelity is certified.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
let browser,server;
const protectedPaths=['art/registry.json','src/sprite-manifest.js','src/stage-bitmap-manifest.js','src/fight.js','src/renderers.js','src/sprite-system.js','src/sprite-workshop.js','src/sprite-inspector.js','src/versus.js'];
for(const path of protectedPaths)report.sourceHashes[path]={before:sha(await readFile(resolve(root,path)))};
report.harnessSHA256=sha(await readFile(fileURLToPath(import.meta.url)));
async function contextFor(expectedFrames){
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1050}}),page=await context.newPage();
  const expected=new Map(expectedFrames.map(frame=>['/'+frame.path,frame])),pending=[],responses=[];
  page.on('pageerror',error=>report.errors.push(error.message));
  page.on('response',response=>{
    const path=new URL(response.url()).pathname;
    if(expected.has(path))pending.push(response.body().then(bytes=>responses.push({path,status:response.status(),bytes:bytes.length,sha256:sha(bytes)})).catch(error=>responses.push({path,error:String(error)})));
  });
  await page.addInitScript(()=>{
    window.__wave28Draws={};
    const draw=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
      const result=draw.call(this,image,...args);
      if(image?.src&&(this.canvas.id==='game'||this.canvas.dataset.artPurpose==='combat')){
        const matrix=this.getTransform(),path=new URL(image.src,location.href).pathname;
        window.__wave28Draws[(this.canvas.id||'workshop')+'|'+path]={path,canvas:this.canvas.id||'workshop',args,matrix:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f],naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight};
      }
      return result;
    };
  });
  const verifyResponses=async()=>{
    await Promise.all(pending);
    for(const [path,frame] of expected){const rows=responses.filter(row=>row.path===path);check('HTTP serves exact native PNG '+path,rows.some(row=>row.status===200&&row.sha256===frame.sha256&&row.bytes===frame.bytes),rows);}
    return responses;
  };
  return {context,page,verifyResponses};
}
async function capture(locator,file,detail){
  const bytes=await locator.screenshot({path:join(out,file)});
  report.captures.push({file,sha256:sha(bytes),bytes:bytes.length,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),...detail});
}
try{
  let occupied=false;
  try{await fetch(base,{signal:AbortSignal.timeout(800)});occupied=true;}catch{}
  check('Dedicated HTTP test port is unused',!occupied);
  server=spawn(process.execPath,['scripts/server.mjs',String(port),...(build==='dist'?['--dist']:[])],{cwd:root,stdio:'ignore'});
  let serverError=null;server.on('error',error=>{serverError=error;});
  let ready=false;
  for(let n=0;n<100;n++){
    if(serverError||server.exitCode!==null)throw Error('The dedicated HTTP server exited before readiness: '+(serverError||server.exitCode));
    try{if((await fetch(base)).ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  check('Original '+build+' HTTP server responds',ready);
  check('Our dedicated server remains alive',!serverError&&server.exitCode===null);
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});
  report.browser=browser.version();
  for(const id of ids){
    const fighter=getFighter(id),art=SPRITES[id],frame=art.frames[0],policy=createCombatProfile(fighter).referencePolicy;
    const {context,page,verifyResponses}=await contextFor([frame,art.portrait]);
    await page.goto(base+'/modules/sprite-workshop.html',{waitUntil:'domcontentloaded'});
    await page.locator('#spriteSearch').fill(id);
    await page.waitForFunction(({id,path})=>document.querySelector('#spriteDetail code')?.textContent===id&&Object.values(window.__wave28Draws).some(draw=>draw.path===path&&draw.canvas==='workshop'),{id,path:'/'+frame.path});
    const right=await page.evaluate(path=>Object.values(window.__wave28Draws).find(draw=>draw.path===path&&draw.canvas==='workshop'),'/'+frame.path);
    check(id+': browser decodes the complete native canvas',right.naturalWidth===frame.width&&right.naturalHeight===frame.height);
    check(id+': default workshop orientation faces right',Math.sign(right.matrix[0])===frame.facing);
    check(id+': preserved selection is a separate loaded image',await page.locator('#spriteDetail img[data-art-purpose="selection"]').evaluate((img,path)=>img.complete&&img.naturalWidth>0&&new URL(img.src).pathname===path,'/'+art.portrait.path));
    check(id+': static candidate has no invented playback',await page.locator('[data-inspect="play"]').isDisabled());
    const referenceOnly=await page.locator('[data-reference-only="true"]').count();
    check(id+': UI retains the documented duel permission',policy.combatEnabled?referenceOnly===0:referenceOnly===1&&await page.locator('#spriteDetail a[href*="unified-versus.html"]').count()===0);
    await page.locator('[data-inspect="boxes"]').uncheck();
    await capture(page.locator('#spriteDetail canvas[data-art-purpose="combat"]'),id+'-http-right.png',{fighterId:id,facing:1,purpose:'actual-browser-workshop'});
    await page.locator('[data-inspect="flip"]').click();
    await page.waitForFunction(({path,sign})=>Object.values(window.__wave28Draws).some(draw=>draw.path===path&&draw.canvas==='workshop'&&Math.sign(draw.matrix[0])===sign),{path:'/'+frame.path,sign:-frame.facing});
    const left=await page.evaluate(path=>Object.values(window.__wave28Draws).find(draw=>draw.path===path&&draw.canvas==='workshop'),'/'+frame.path);
    check(id+': ordinary flip button mirrors the same native PNG',Math.sign(left.matrix[0])===-frame.facing&&Math.abs(left.matrix[0])===Math.abs(right.matrix[0]));
    await capture(page.locator('#spriteDetail canvas[data-art-purpose="combat"]'),id+'-http-left.png',{fighterId:id,facing:-1,purpose:'actual-browser-workshop'});
    report.characters.push({id,combatEnabled:policy.combatEnabled,entrySHA256:sha(JSON.stringify(art)),right,left,responses:await verifyResponses()});
    await context.close();
    console.log(JSON.stringify({character:id,passed:true}));
  }
  for(const id of stages){
    const stage=getStage(id),art=stageBitmapFor(stage),frames=art.layers.flatMap(layer=>layer.frames);
    const {context,page,verifyResponses}=await contextFor(frames);
    const url=base+'/modules/unified-versus.html?qa=1&mode=versus&stage='+encodeURIComponent(id)+'&p1=bom_pyramid_head_129&p2=bom_butcher_123';
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('#launch').click();
    await page.waitForFunction(id=>window.__HALO_QA__?.engine?.stage.id===id&&__HALO_QA__.engine.phase==='fight'&&!__HALO_QA__.engine.paused,id,{timeout:30000});
    const actual=await page.evaluate(()=>({stageId:__HALO_QA__.engine.stage.id,phase:__HALO_QA__.engine.phase,actors:__HALO_QA__.engine.actors.map(actor=>({id:actor.data.id,x:actor.x,y:actor.y,facing:actor.facing})),pins:[...__HALO_QA__.stageAssetCache.pins].map(path=>({path,status:__HALO_QA__.stageAssetCache.status(path)})),draws:Object.values(window.__wave28Draws).filter(draw=>draw.canvas==='game')}));
    check(id+': normal UI launch starts the intended stage',actual.stageId===id&&actual.phase==='fight');
    check(id+': intended fighters remain selected',actual.actors.length===2&&actual.actors[0].id==='bom_pyramid_head_129'&&actual.actors[1].id==='bom_butcher_123',actual.actors);
    for(const frame of frames){
      check(id+': actual game canvas draws native plane '+frame.path,actual.draws.some(draw=>draw.path==='/'+frame.path&&draw.naturalWidth===frame.width&&draw.naturalHeight===frame.height));
      check(id+': plane remains ready in the live cache '+frame.path,actual.pins.some(pin=>pin.path===frame.path&&pin.status==='ready'));
    }
    await capture(page.locator('#game'),id+'-http-fight.png',{stageId:id,purpose:'actual-browser-FightEngine'});
    report.stages.push({id,entrySHA256:sha(JSON.stringify(art)),...actual,responses:await verifyResponses()});
    await context.close();
    console.log(JSON.stringify({stage:id,passed:true}));
  }
  check('No unhandled browser errors',report.errors.length===0,report.errors);
  for(const path of protectedPaths){report.sourceHashes[path].after=sha(await readFile(resolve(root,path)));check('HTTP QA leaves source unchanged '+path,report.sourceHashes[path].before===report.sourceHashes[path].after);}
  report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{
  await browser?.close();server?.kill('SIGTERM');report.completedAt=new Date().toISOString();
  await writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,checks:report.checks.length,captures:report.captures.length,out:relative(root,out),failure:report.failure}));
}
