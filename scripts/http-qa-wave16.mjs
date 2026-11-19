/** Wave 16: real delivered art, normal controls and observed canvas draws; no art fixtures. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {decodePng} from './raster-validation.mjs';
import {SPRITES} from '../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {VERSION,getFighter,createCombatProfile} from '../src/data.js';
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-stage-bitmaps/wave16');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4188',source=process.env.QA_SOURCE_TREE==='1';let server,browser;
const historical={
 origins_faceless_nurse:'533898f3a5ea73c86ca90678cdf1e099851441c9c7706b67a4ec4a9aa5c1c2a2',
 homecoming_scarlet_doll_form_094:'4dff90f33b7ac8dde2c4135464d2cec3b81bd63105ede05c67c2438fa1750382',
 sh1_incubator_018:'82460c82402fc5a61ec164133aeed7c21e2fe5b5c18ffb563ff3d96603e18731',
 arcade_scraper_arcade:'cf2e735654ec87003ed956ea6a4e179b3c6992360a4251c19d24538cebd2b48e'
};
const ids=Object.keys(historical),nurse=ids[0],stageId='brookhaven_sh2';
const report={version:VERSION,build:source?'source':'dist',checks:[],errors:[],captures:[],assets:[],inspectors:[],duels:[],fixtures:[],limits:['Static candidate poses; no source-fidelity or animation certification. Actor state and camera are never injected.']};
const check=(name,ok,data)=>{report.checks.push({name,passed:!!ok,...(data===undefined?{}:{data})});if(!ok)throw Error(name);};
const shot=async(page,name,selector)=>{await page.locator(selector).screenshot({path:resolve(out,name+'.png')});report.captures.push(name+'.png');};
const idle=id=>SPRITES[id].frames[SPRITES[id].clips.idle.frames[0]];
const seen=(page,path,canvas='game')=>page.waitForFunction(({path,canvas})=>!!window.__W16?.draws[canvas+'|'+path],{path,canvas});
async function geometry(page,frame,canvas){
 return page.evaluate(({frame,canvas})=>{
  const d=window.__W16.draws[canvas+'|'+frame.path];if(!d||d.args.length!==4)return {complete:false,draw:d};
  const [x,y,w,h]=d.args,[a,b,c,e,tx,ty]=d.matrix,[l,t,r,z]=frame.framingBounds||frame.visibleBounds;
  const points=[[l,t],[r,t],[l,z],[r,z]].map(([u,v])=>{const px=x+u/d.width*w,py=y+v/d.height*h;return [a*px+c*py+tx,b*px+e*py+ty];});
  const box=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];
  return {box,draw:d,complete:box.every(Number.isFinite)&&box[0]>=-.01&&box[1]>=-.01&&box[2]<=d.surface[0]+.01&&box[3]<=d.surface[1]+.01};
 },{frame,canvas});
}
await mkdir(out,{recursive:true});
try{
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4188',...(source?[]:['--dist'])],{cwd:root,stdio:'ignore'});
 let ready=false;for(let i=0;i<80;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}check('Built HTTP server is ready',ready);
 const guard=SPRITES[nurse].frames[SPRITES[nurse].clips.guard.frames[0]],layers=STAGE_BITMAPS[stageId]?.layers;
 check('Brookhaven has two authored planes',layers?.length===2);
 for(const frame of [...ids.map(idle),guard]){
  const response=await fetch(base+'/'+frame.path),bytes=Buffer.from(await response.arrayBuffer()),audit=decodePng(bytes);
  check('Delivered native PNG has exact bytes, alpha and an interior connected silhouette: '+frame.path,response.ok&&createHash('sha256').update(bytes).digest('hex')===frame.sha256&&audit.width===frame.width&&audit.height===frame.height&&audit.transparentFraction>0&&audit.framingBounds[0]>0&&audit.framingBounds[1]>0&&audit.framingBounds[2]<audit.width&&audit.framingBounds[3]<audit.height);
  report.assets.push({path:frame.path,sha256:frame.sha256,audit});
 }
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>{
  window.__W16={draws:{}};const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
   const result=original.call(this,image,...args),canvas=this.canvas.id==='game'?'game':this.canvas.closest?.('#spriteDetail')?'workshop':null;
   if(canvas&&image instanceof HTMLImageElement&&image.currentSrc&&image.naturalWidth){const path=new URL(image.currentSrc).pathname.slice(1),m=this.getTransform();window.__W16.draws[canvas+'|'+path]={path,args,width:image.naturalWidth,height:image.naturalHeight,matrix:[m.a,m.b,m.c,m.d,m.e,m.f],surface:[this.canvas.width,this.canvas.height]};}
   return result;
  };
 });
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('dialog',d=>d.accept());
 page.on('console',m=>{if(m.type()==='error')report.errors.push('console: '+m.text());});
 page.on('response',r=>{if(r.status()>=400&&/\/(assets|src|modules)\//.test(new URL(r.url()).pathname))report.errors.push('HTTP '+r.status()+': '+r.url());});
 const playable=[];
 for(const id of ids){
  const art=SPRITES[id],frame=idle(id),policy=createCombatProfile(getFighter(id)).referencePolicy;
  check(id+': original portrait remains separate from new combat pose',art.portrait.sha256===historical[id]&&art.portrait.path!==frame.path);
  await page.goto(base+'/modules/sprite-workshop.html');await page.fill('#spriteSearch',id);await page.locator('.sprite-card[data-id="'+id+'"]').click();await page.selectOption('[data-inspect=zoom]','0.5');
  await seen(page,frame.path,'workshop');
  const portrait=await page.locator('#spriteDetail img[data-art-purpose="selection"]').evaluate(async img=>{await img.decode();return {path:new URL(img.currentSrc).pathname.slice(1),width:img.naturalWidth,height:img.naturalHeight};});
  check(id+': inspector paints the historical selection',portrait.path===art.portrait.path&&portrait.width===art.portrait.width&&portrait.height===art.portrait.height);
  for(const side of ['right','left']){if(side==='left')await page.click('[data-inspect=flip]');await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));const measured=await geometry(page,frame,'workshop');check(id+': complete native silhouette fits the '+side+' inspector',measured.complete);report.inspectors.push({id,side,geometry:measured});}
  await shot(page,'workshop-'+id,'#spriteDetail .sprite-previews');
  const links=await page.locator('#spriteDetail a[href*="unified-versus"]').count();
  check(id+': existing combat role is preserved',policy.combatEnabled?links===1:links===0&&await page.locator('[data-reference-only]').count()===1);
  if(policy.combatEnabled)playable.push(id);
 }
 for(const id of playable){
  await page.goto(base+'/modules/unified-versus.html?qa=1&p1='+id+'&p2=sh2_bubble_head_nurse_024&stage='+stageId);await page.waitForFunction(()=>!!window.__HALO_QA__);
  await page.selectOption('#mode','local');await page.selectOption('#timer','0');
  for(const name of ['stageHazards','stageDirector','otherworldShift','fatalities','stageFatalities','stageTerrain','artDiagnostic'])await page.uncheck('#'+name);
  await page.click('#launch');await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='fight'&&!__HALO_QA__.engine.paused&&__HALO_QA__.engine.texts.every(t=>!['intro','round','fight'].includes(t.kind)));
  await seen(page,idle(id).path);for(const layer of layers)await seen(page,layer.frames[0].path);
  check(id+': normal match uses the selected identity and Brookhaven',await page.evaluate(({id,stageId})=>{const q=__HALO_QA__;return !q.engine.config.artDiagnostic&&q.engine.actors[0].data.id===id&&q.selection.stage.id===stageId;},{id,stageId}));
  const measured=await geometry(page,idle(id),'game');check(id+': full delivered silhouette fits the normal match',measured.complete);report.duels.push({id,geometry:measured});
  await shot(page,'duel-'+id,'#game');
  if(id===nurse){
   await page.locator('#game').click({position:{x:640,y:360}});await page.evaluate(()=>{window.__W16.draws={};});
   await page.keyboard.down('Space');try{await page.waitForFunction(()=>__HALO_QA__.engine.actors[0].blocking);await seen(page,guard.path);const g=await geometry(page,guard,'game');check('Held guard paints the dedicated nurse pose without clipping',g.complete);report.guard=g;await shot(page,'nurse-guard','#game');}finally{await page.keyboard.up('Space');}
   await page.evaluate(()=>{window.__W16.draws={};});await page.waitForFunction(()=>!__HALO_QA__.engine.actors[0].blocking);await seen(page,idle(nurse).path);check('Released guard returns to the native idle',true);await shot(page,'nurse-idle-after-guard','#game');
   for(const layer of layers)await seen(page,layer.frames[0].path);
   const paths=layers.map(l=>l.frames[0].path),before=await page.evaluate(paths=>paths.map(p=>window.__W16.draws['game|'+p]),paths);
   const x=await page.evaluate(()=>__HALO_QA__.engine.actors[0].x);await page.keyboard.down('ArrowRight');
   try{await page.waitForFunction(x=>__HALO_QA__.engine.actors[0].x>x+35,x);}finally{await page.keyboard.up('ArrowRight');}
   await page.evaluate(()=>{window.__W16.draws={};});for(const path of paths)await seen(page,path);
   const after=await page.evaluate(paths=>paths.map(p=>window.__W16.draws['game|'+p]),paths),delta=after.map((d,i)=>d.args[d.args.length-4]-before[i].args[before[i].args.length-4]);
   check('Real movement gives the two scenery planes different horizontal translations',delta.every(Number.isFinite)&&Math.abs(delta[0]-delta[1])>.1);report.parallax={paths,before,after,delta};
   await shot(page,'brookhaven-after-movement','#game');
  }
 }
 check('All four idles were rendered in their allowed roles',report.inspectors.length===ids.length*2&&report.duels.length===playable.length);
 check('The nurse guard was exercised in a normal duel',!!report.guard);check('No browser or asset-loading errors',report.errors.length===0);await context.close();
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
