/**
 * Wave 17: delivered artwork and authored walking cycle in the real HTTP app.
 * Real delivered PNGs, normal UI/keyboard controls and observed drawImage calls.
 * The QA bridge is read only. No actor, presentation, clock or camera injection.
 */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {decodePng} from './raster-validation.mjs';
import {auditStagePng} from './build-stage-bitmaps.mjs';
import {SPRITES} from '../src/sprite-manifest.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {stageBitmapFor} from '../src/stage-bitmaps.js';
import {VERSION,getFighter,getStage,createCombatProfile} from '../src/data.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const out=resolve(process.env.QA_OUTPUT_DIR||resolve(root,'tests/http-stage-bitmaps/wave17'));
const base=(process.env.QA_BASE_URL||'http://127.0.0.1:4189').replace(/\/+$/,'');
const source=process.env.QA_SOURCE_TREE==='1';
const ids=['downpour_doll_106','shattered_raw_shock_diseased_101','bom_needler_127','bom_nurse_128'];
const nurse='origins_faceless_nurse',opponent='sh2_creeper_025';
const inspectedIds=[...ids,nurse];
const historical={
  downpour_doll_106:'50727eee886ce76cbea2ab49064fb52ca2909c298bbac698d29456d2544ae514',
  shattered_raw_shock_diseased_101:'59f6c89e93d639e6eb887ec691374d298a3a53c59e26c5747ffa1fcbc7912644',
  bom_needler_127:'9f41a2f38998b0f9c45b997e0c059deae270a91e921a31ec162e686002bb813f',
  bom_nurse_128:'af4b765e16180871d34b19bb8a26ac8235013ca48d14677d3be322e5cf727cd5',
  origins_faceless_nurse:'533898f3a5ea73c86ca90678cdf1e099851441c9c7706b67a4ec4a9aa5c1c2a2'
};
const expectedRoles={
  downpour_doll_106:['environmental-obstacle',false],
  shattered_raw_shock_diseased_101:['scripted-encounter',false],
  bom_needler_127:['combatant',true],
  bom_nurse_128:['combatant',true],
  origins_faceless_nurse:['combatant',true]
};
const stageContracts={
  underground_hc:{source:'homecoming',scene:'founding-families-antechamber'},
  film_hospital:{source:'film',scene:'alessa-isolation-room-2006'}
};
const stageIds=Object.keys(stageContracts);
const profiles=Object.fromEntries([...inspectedIds,opponent].map(id=>[id,createCombatProfile(getFighter(id)).referencePolicy]));
const report={
  version:VERSION,build:source?'source':'dist',base,
  checks:[],errors:[],networkAborts:[],captures:[],assets:[],roles:[],
  inspectors:[],blockedLaunches:[],duels:[],motion:[],guards:[],idleReturns:[],
  stages:[],commands:[],keyEvents:[],fixtures:[],
  method:{
    exercises:[
      'Exact delivered PNG bytes, decoded dimensions and alpha for combat sprites; stage PNG structure and pixels.',
      'Historical portraits in manifest, HTTP delivery, workshop images and versus selection canvas.',
      'Right/left workshop views with fresh real drawImage calls and complete connected silhouettes.',
      'Normal launch is rejected for both reference-only roles; only combatEnabled profiles start duels.',
      'Origins Nurse walk [0,2,3,2], seven simulation ticks per step, three distinct delivered images.',
      'Real movement then released idle, held guard, released idle; no actor state injection.',
      'A normal jump crosses a low opponent; leftward walking then mirrors the same combat PNGs.',
      'Two authored planes per stage and measured differential parallax under normal movement.',
      'Page exceptions, console errors, HTTP failures and non-navigation network failures.'
    ],
    instrumentation:'A passive drawImage wrapper calls the original first, then records the source image, arguments, transform and a read-only actor/clock snapshot. Only the observer buffers are reset.',
    controls:'UI selects/clicks and Playwright keyboard down/up; the QA bridge is read only.',
    fixtures:'None. No PNG substitution, route fulfillment, actor placement, facing, clock, presentation or camera mutation.'
  },
  limits:[
    'Technical rendering and command checks do not certify 1:1 source fidelity, native source timing, anatomy, textures, weapons or scale.',
    'Doll and Raw Shock remain workshop reference subjects, not combat-enabled fighters.',
    'The four new views are static candidates. Origins Nurse receives one authored versus walk cycle; other missing motions are not certified.',
    'The jump is only a normal-control route to change sides. It may use the existing idle fallback; no dedicated jump artwork is claimed.',
    'The engine faces the opponent. A change of movement key alone is not claimed to turn the actor.',
    'The stage layers and small camera parallax are reconstructed versus presentation, not captured source animation.',
    'A screenshot is visual evidence of a running scene. Frame order and timing are established by observed Canvas sources plus simulation ticks, not screenshot timing.',
    'Navigation cancellations (net::ERR_ABORTED) are logged separately. HTTP error responses and other network failures still fail the run.',
    'No attacks, source collision accuracy, full animation catalogue, mobile controls, physical gamepad or offline behavior are exercised here.'
  ]
};
let server,browser,context,page;
const check=(name,passed,data)=>{
  report.checks.push({name,passed:!!passed,...(data===undefined?{}:{data})});
  if(!passed)throw Error(name);
};
const idle=id=>SPRITES[id].frames[SPRITES[id].clips.idle.frames[0]];
const marker=page=>page.evaluate(()=>window.__W17.sequence);
const seen=(page,path,canvas='game',after=0)=>page.waitForFunction(
  ({path,canvas,after})=>(window.__W17?.last[canvas+'|'+path]?.sequence||0)>after,
  {path,canvas,after},{timeout:10000}
);
const freshDraw=(page,path,canvas='game')=>page.evaluate(
  ({path,canvas})=>window.__W17.last[canvas+'|'+path],{path,canvas}
);
async function shot(page,name,selector='#game'){
  await page.locator(selector).screenshot({path:resolve(out,name+'.png')});
  report.captures.push(name+'.png');
}
function geometry(frame,draw){
  if(!draw||draw.args.length!==4)return {complete:false,draw};
  const [x,y,w,h]=draw.args,[a,b,c,d,tx,ty]=draw.matrix;
  const [left,top,right,bottom]=frame.framingBounds||frame.visibleBounds;
  const points=[[left,top],[right,top],[left,bottom],[right,bottom]].map(([u,v])=>{
    const px=x+u/draw.width*w,py=y+v/draw.height*h;
    return [a*px+c*py+tx,b*px+d*py+ty];
  });
  const box=[
    Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),
    Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))
  ];
  return {box,draw,complete:box.every(Number.isFinite)&&box[0]>=-.01&&box[1]>=-.01&&box[2]<=draw.surface[0]+.01&&box[3]<=draw.surface[1]+.01};
}
async function key(page,action,code){
  report.commands.push({action,code,url:page.url(),at:new Date().toISOString()});
  await page.keyboard[action](code);
}
async function collectKeys(page,label){
  report.keyEvents.push({label,events:await page.evaluate(()=>window.__W17.keys.splice(0))});
}
async function readDraws(page,{after=0,paths=null,canvas='game'}={}){
  return page.evaluate(({after,paths,canvas})=>window.__W17.events.filter(
    row=>row.sequence>after&&row.canvas===canvas&&(!paths||paths.includes(row.path))
  ),{after,paths,canvas});
}
async function actorState(page){
  return page.evaluate(()=>{
    const e=window.__HALO_QA__.engine,a=e.actors[0],b=e.actors[1];
    return {frame:e.frame,x:a.x,y:a.y,facing:a.facing,state:a.state,grounded:a.grounded,blocking:a.blocking,opponentX:b.x,spriteTick:a.spriteClock?.tick,spritePose:a.spriteClock?.pose};
  });
}
async function assertNoGamePortrait(page,id,label){
  const rows=await readDraws(page,{paths:[SPRITES[id].portrait.path]});
  check(label+': the selection portrait is never used as a game sprite',rows.length===0);
}
async function openVersus(page,id,stageId){
  await page.goto(base+'/modules/unified-versus.html?qa=1&p1='+id+'&p2='+opponent+'&stage='+stageId);
  await page.waitForFunction(()=>!!window.__HALO_QA__);
  const selection=await page.evaluate(()=>({
    p1:__HALO_QA__.selection.p1.id,p2:__HALO_QA__.selection.p2.id,stage:__HALO_QA__.selection.stage.id
  }));
  check(id+': exact identities and stage are selected',selection.p1===id&&selection.p2===opponent&&selection.stage===stageId,selection);
  await seen(page,SPRITES[id].portrait.path,'selection-p1');
  await page.selectOption('#mode','local');
  await page.selectOption('#timer','0');
  await page.selectOption('#ritualSelect','none');
  for(const name of ['stageHazards','stageDirector','otherworldShift','fatalities','stageFatalities','stageTerrain','artDiagnostic']){
    await page.uncheck('#'+name);
  }
  await page.check('#stageAnimations');
}
async function launchDuel(page,id,stageId){
  check(id+': the intended duel participant is combatEnabled',profiles[id].combatEnabled===true);
  check('The normal low opponent is combatEnabled',profiles[opponent].combatEnabled===true);
  await openVersus(page,id,stageId);
  await page.click('#launch');
  await page.waitForFunction(()=>{
    const e=window.__HALO_QA__?.engine;
    return e?.phase==='fight'&&!e.paused&&e.texts.every(t=>!['intro','round','fight'].includes(t.kind))&&!e.actors[0].presentation;
  },null,{timeout:20000});
  await page.locator('#game').click();
  const loaded=await page.evaluate(()=>{
    const e=__HALO_QA__.engine;
    return {mode:e.config.mode,diagnostic:e.config.artDiagnostic,stage:e.stage.id,ids:e.actors.map(a=>a.data.id),roles:e.actors.map(a=>({role:a.profile.referencePolicy.role,combatEnabled:a.profile.referencePolicy.combatEnabled})),keys:{...e.bindings.players[0]}};
  });
  check(id+': the normal duel contains only the requested enabled participants',
    loaded.mode==='local'&&!loaded.diagnostic&&loaded.stage===stageId&&loaded.ids[0]===id&&loaded.ids[1]===opponent&&loaded.roles.every(r=>r.combatEnabled),loaded);
  check('Default physical movement, jump and guard bindings are active',
    loaded.keys.left==='ArrowLeft'&&loaded.keys.right==='ArrowRight'&&loaded.keys.jump==='ArrowUp'&&loaded.keys.guard==='Space',loaded.keys);
  const mark=await marker(page);
  await seen(page,idle(id).path,'game',mark);
  const measured=geometry(idle(id),await freshDraw(page,idle(id).path));
  check(id+': the full idle silhouette fits the real duel',measured.complete,measured.box);
  report.duels.push({id,stageId,loaded,idleGeometry:measured});
  await assertNoGamePortrait(page,id,'Launch '+id+' / '+stageId);
  return measured;
}
async function planes(page,stageId){
  const art=stageBitmapFor(getStage(stageId),STAGE_BITMAPS),mark=await marker(page);
  for(const layer of art.layers)await seen(page,layer.frames[0].path,'game',mark);
  return page.evaluate(paths=>paths.map(path=>window.__W17.last['game|'+path]),art.layers.map(layer=>layer.frames[0].path));
}
async function returnIdle(page,label,after){
  await page.waitForFunction(()=>{
    const a=__HALO_QA__.engine.actors[0];
    return a.grounded&&!a.blocking&&a.state==='idle'&&a.spriteClock?.pose==='idle';
  });
  await seen(page,idle(nurse).path,'game',after);
  const draw=await freshDraw(page,idle(nurse).path),measured=geometry(idle(nurse),draw);
  check(label+': released input returns to the preserved idle frame 0',
    draw.actor.state==='idle'&&draw.actor.spritePose==='idle'&&!draw.actor.blocking&&measured.complete,measured.box);
  report.idleReturns.push({label,geometry:measured});
  await assertNoGamePortrait(page,nurse,label);
}
async function exerciseGuard(page,label){
  const before=await marker(page),frame=SPRITES[nurse].frames[1];
  await key(page,'down','Space');
  try{
    await page.waitForFunction(()=>__HALO_QA__.engine.actors[0].blocking);
    await seen(page,frame.path,'game',before);
    const draw=await freshDraw(page,frame.path),measured=geometry(frame,draw);
    check(label+': held guard uses preserved frame 1 with a complete silhouette',
      draw.actor.blocking&&draw.actor.spritePose==='guard'&&measured.complete,measured.box);
    report.guards.push({label,geometry:measured});
    await shot(page,label+'-guard');
  }finally{await key(page,'up','Space');}
  const released=await marker(page);
  await returnIdle(page,label+' guard release',released);
  await shot(page,label+'-idle-after-guard');
}
async function exerciseWalk(page,label,code,facing){
  const art=SPRITES[nurse],frameIndices=[0,2,3],paths=frameIndices.map(i=>art.frames[i].path);
  const start=await actorState(page),after=await marker(page);
  await key(page,'down',code);
  let rows,end;
  try{
    await page.waitForFunction(({paths,after,facing})=>{
      const rows=window.__W17.events.filter(row=>row.sequence>after&&row.canvas==='game'&&paths.includes(row.path)&&row.actor?.state==='walk'&&row.actor?.spritePose==='walk'&&row.actor?.facing===facing);
      return paths.every(path=>rows.some(row=>row.path===path))&&
        new Set(rows.map(row=>Math.floor(row.actor.spriteTick/7)%4)).size===4&&
        rows.some(row=>row.actor.spriteTick>=28);
    },{paths,after,facing},{timeout:8000,polling:'raf'});
    rows=(await readDraws(page,{after,paths})).filter(row=>row.actor?.state==='walk'&&row.actor?.spritePose==='walk'&&row.actor?.facing===facing);
    end=await actorState(page);
    check(label+': the movement command produces real displacement in its direction',
      code==='ArrowRight'?end.x>start.x+35:end.x<start.x-35,{start,end,code});
    check(label+': observed Canvas sources follow [0,2,3,2] at seven simulation ticks per step',
      rows.length>0&&rows.every(row=>row.path===art.frames[[0,2,3,2][Math.floor(row.actor.spriteTick/7)%4]].path));
    check(label+': all three distinct combat PNGs and all four timeline steps are drawn',
      new Set(rows.map(row=>row.path)).size===3&&new Set(rows.map(row=>Math.floor(row.actor.spriteTick/7)%4)).size===4);
    const geometries=frameIndices.map(index=>{
      const draw=rows.find(row=>row.path===art.frames[index].path);
      return {index,geometry:geometry(art.frames[index],draw)};
    });
    check(label+': all three native silhouettes fit and face the expected side',
      geometries.every(({index,geometry:g})=>g.complete&&Math.sign(g.draw.matrix[0])===facing*(art.frames[index].facing||1)),
      geometries.map(({index,geometry:g})=>({index,box:g.box,matrix:g.draw.matrix})));
    const transitions=[];
    for(const row of rows){
      const index=art.frames.findIndex(frame=>frame.path===row.path),last=transitions.at(-1);
      if(!last||last.index!==index)transitions.push({index,path:row.path,firstTick:row.actor.spriteTick,lastTick:row.actor.spriteTick,firstFrame:row.engineFrame,lastFrame:row.engineFrame});
      else{last.lastTick=row.actor.spriteTick;last.lastFrame=row.engineFrame;}
    }
    check(label+': no observation samples were dropped',await page.evaluate(()=>window.__W17.dropped===0));
    report.motion.push({
      label,code,facing,start,end,transitions,geometries,
      observations:rows.map(row=>({sequence:row.sequence,path:row.path,engineFrame:row.engineFrame,tick:row.actor.spriteTick,x:row.actor.x,facing:row.actor.facing,matrix:row.matrix}))
    });
    await shot(page,label);
  }finally{await key(page,'up',code);}
  const released=await marker(page);
  await returnIdle(page,label+' release',released);
  await shot(page,label+'-idle');
  return {start,end};
}
async function crossNormally(page){
  // A low enabled opponent permits a normal jump crossing at this character's height.
  // Facing is read, never set. The jump itself has no newly authored art requirement.
  const before=await actorState(page);
  await key(page,'down','ArrowRight');
  try{
    await page.waitForFunction(()=>{
      const [a,b]=__HALO_QA__.engine.actors;
      return a.grounded&&b.x>a.x&&b.x-a.x<=92;
    },null,{timeout:8000});
    await key(page,'down','ArrowUp');
    try{await page.waitForFunction(()=>!__HALO_QA__.engine.actors[0].grounded);}
    finally{await key(page,'up','ArrowUp');}
    await page.waitForFunction(()=>{
      const [a,b]=__HALO_QA__.engine.actors;
      return a.x>b.x+80&&a.facing===-1;
    },null,{timeout:8000});
  }finally{await key(page,'up','ArrowRight');}
  const released=await marker(page);
  await returnIdle(page,'Normal jump crossing',released);
  const after=await actorState(page);
  check('Normal keyboard movement and jump change sides and turn the actor',
    before.x<before.opponentX&&after.x>after.opponentX&&after.facing===-1,{before,after});
  report.sideChange={before,after,method:'ArrowRight approach, ArrowUp jump, continued ArrowRight crossing; no actor or camera writes'};
}

await mkdir(out,{recursive:true});
try{
  // Preflight promises specific roles and preserved images before opening a browser.
  for(const id of inspectedIds){
    const art=SPRITES[id],policy=profiles[id],[role,enabled]=expectedRoles[id];
    check(id+': exact existing role is preserved',getFighter(id).id===id&&policy.role===role&&policy.combatEnabled===enabled,{role:policy.role,combatEnabled:policy.combatEnabled});
    check(id+': historical portrait is preserved and separate from the new combat view',
      art?.portrait?.sha256===historical[id]&&art.combatView==='side-view-candidate'&&art.portrait.path!==idle(id).path);
    report.roles.push({id,...policy});
  }
  const nurseArt=SPRITES[nurse];
  check('Origins Nurse preserves idle [0] and guard [1]',
    JSON.stringify(nurseArt.clips.idle.frames)==='[0]'&&JSON.stringify(nurseArt.clips.guard.frames)==='[1]'&&
    nurseArt.frames[0].sha256==='7875b7b8cc53cf1652cc677b29456ed43f4e737355c767ae5caef1c3eeb1ecfd'&&
    nurseArt.frames[1].sha256==='4f0ad91d37c585e4d771c4e8fb54a560776f6239156caf6ace9c6df98ab87f5e');
  check('Origins Nurse registers the exact walk cycle, seven ticks per step, looping',
    JSON.stringify(nurseArt.clips.walk?.frames)==='[0,2,3,2]'&&nurseArt.clips.walk?.ticksPerFrame===7&&
    nurseArt.clips.walk.loop===true&&(!nurseArt.clips.walk.frameTicks||JSON.stringify(nurseArt.clips.walk.frameTicks)==='[7,7,7,7]'));
  check('The walk uses three genuinely distinct registered PNGs and pixel contents',
    new Set([0,2,3].map(i=>nurseArt.frames[i]?.sha256)).size===3&&
    [0,2,3].every(i=>/^[a-f0-9]{64}$/.test(nurseArt.frames[i]?.pixelSHA256||''))&&
    new Set([0,2,3].map(i=>nurseArt.frames[i].pixelSHA256)).size===3);
  for(const stageId of stageIds){
    const stage=getStage(stageId),art=stageBitmapFor(stage,STAGE_BITMAPS),contract=stageContracts[stageId];
    check(stageId+': the exact scene has two authored static planes',
      stage.id===stageId&&stage.source===contract.source&&art?.scene===contract.scene&&art.layers.length===2&&
      art.layers.every(layer=>layer.frames.length===1&&layer.loop===false)&&
      new Set(art.layers.map(layer=>layer.frames[0].sha256)).size===2);
    check(stageId+': the authored planes retain matching native dimensions and different parallax',
      art.layers[0].frames[0].width===art.layers[1].frames[0].width&&art.layers[0].frames[0].height===art.layers[1].frames[0].height&&
      Math.abs((art.layers[0].parallaxX||0)-(art.layers[1].parallaxX||0))>0);
  }
  if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4189',...(source?[]:['--dist'])],{cwd:root,stdio:'ignore'});
  let ready=false;
  for(let attempt=0;attempt<80;attempt++){
    try{if((await fetch(base)).ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  check('Built HTTP server is ready',ready);
  const frames=new Map();
  const register=(frame,kind)=>{const entry=frames.get(frame.path);if(entry)entry.kinds.push(kind);else frames.set(frame.path,{frame,kinds:[kind]});};
  for(const id of inspectedIds){register(SPRITES[id].portrait,'selection');register(idle(id),'combat');}
  for(const index of [1,2,3])register(nurseArt.frames[index],'combat');
  for(const stageId of stageIds)for(const layer of stageBitmapFor(getStage(stageId),STAGE_BITMAPS).layers)register(layer.frames[0],'stage');
  for(const {frame,kinds} of frames.values()){
    const response=await fetch(base+'/'+frame.path);
    check('HTTP 200 for '+frame.path,response.ok,{status:response.status});
    const bytes=Buffer.from(await response.arrayBuffer()),audit=kinds.includes('stage')?auditStagePng(bytes):decodePng(bytes);
    check('Delivered PNG matches exact bytes, SHA and native dimensions: '+frame.path,
      bytes.length===frame.bytes&&createHash('sha256').update(bytes).digest('hex')===frame.sha256&&audit.width===frame.width&&audit.height===frame.height);
    if(!kinds.includes('stage'))check('Delivered sprite retains alpha and a complete connected silhouette: '+frame.path,
      audit.transparentFraction>0&&audit.framingBounds[0]>0&&audit.framingBounds[1]>0&&audit.framingBounds[2]<audit.width&&audit.framingBounds[3]<audit.height&&
      (!frame.pixelSHA256||audit.pixelSHA256===frame.pixelSHA256));
    report.assets.push({path:frame.path,sha256:frame.sha256,kinds,audit});
  }

  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});
  report.browser=browser.version();
  context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>{
    window.__W17={last:{},events:[],keys:[],sequence:0,dropped:0};
    for(const type of ['keydown','keyup'])document.addEventListener(type,event=>{
      window.__W17.keys.push({type,code:event.code,isTrusted:event.isTrusted,repeat:event.repeat,at:performance.now()});
    },true);
    const original=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
      const result=original.call(this,image,...args);
      const canvas=this.canvas.id==='game'?'game':this.canvas.id==='p1Portrait'?'selection-p1':
        this.canvas.id==='p2Portrait'?'selection-p2':this.canvas.closest?.('#spriteDetail')?'workshop':null;
      if(canvas&&image instanceof HTMLImageElement&&image.currentSrc&&image.naturalWidth){
        const path=new URL(image.currentSrc).pathname.slice(1),m=this.getTransform();
        const engine=window.__HALO_QA__?.engine,a=engine?.actors?.[0];
        const row={
          sequence:++window.__W17.sequence,canvas,path,args,width:image.naturalWidth,height:image.naturalHeight,
          matrix:[m.a,m.b,m.c,m.d,m.e,m.f],surface:[this.canvas.width,this.canvas.height],at:performance.now(),
          engineFrame:engine?.frame??null,
          actor:a?{id:a.data.id,x:a.x,y:a.y,facing:a.facing,state:a.state,grounded:a.grounded,blocking:a.blocking,spriteTick:a.spriteClock?.tick??null,spritePose:a.spriteClock?.pose??null}:null,
          actorX:engine?.actors?.map(actor=>actor.x)||null
        };
        window.__W17.last[canvas+'|'+path]=row;
        window.__W17.events.push(row);
        if(window.__W17.events.length>12000){window.__W17.events.splice(0,6000);window.__W17.dropped+=6000;}
      }
      return result;
    };
  });
  page=await context.newPage();
  page.on('pageerror',error=>report.errors.push({kind:'pageerror',message:error.message}));
  page.on('dialog',dialog=>dialog.accept());
  page.on('console',message=>{if(message.type()==='error')report.errors.push({kind:'console',message:message.text()});});
  page.on('response',response=>{
    if(response.status()>=400&&new URL(response.url()).origin===new URL(base).origin)report.errors.push({kind:'http',status:response.status(),url:response.url()});
  });
  page.on('requestfailed',request=>{
    const failure={url:request.url(),error:request.failure()?.errorText||'unknown'};
    if(failure.error==='net::ERR_ABORTED')report.networkAborts.push(failure);
    else report.errors.push({kind:'requestfailed',...failure});
  });
  const playable=[];
  for(const id of inspectedIds){
    const art=SPRITES[id],frame=idle(id),policy=profiles[id];
    await page.goto(base+'/modules/sprite-workshop.html');
    await page.fill('#spriteSearch',id);
    await page.locator('.sprite-card[data-id="'+id+'"]').click();
    const before=await marker(page);
    await page.selectOption('[data-inspect=zoom]','0.5');
    await seen(page,frame.path,'workshop',before);
    const portrait=await page.locator('#spriteDetail img[data-art-purpose="selection"]').evaluate(async image=>{
      await image.decode();return {path:new URL(image.currentSrc).pathname.slice(1),width:image.naturalWidth,height:image.naturalHeight};
    });
    check(id+': the workshop displays the historical selection image',
      portrait.path===art.portrait.path&&portrait.width===art.portrait.width&&portrait.height===art.portrait.height,portrait);
    let previousMatrix;
    for(const [side,facing] of [['right',1],['left',-1]]){
      if(side==='left'){const mark=await marker(page);await page.click('[data-inspect=flip]');await seen(page,frame.path,'workshop',mark);}
      const draw=await freshDraw(page,frame.path,'workshop'),measured=geometry(frame,draw);
      check(id+': complete native silhouette fits the '+side+' inspector',
        measured.complete&&Math.sign(draw.matrix[0])===facing*(frame.facing||1),measured.box);
      if(previousMatrix)check(id+': the inspector flip changes the real Canvas transform',Math.sign(previousMatrix[0])===-Math.sign(draw.matrix[0]));
      previousMatrix=draw.matrix;
      report.inspectors.push({id,side,geometry:measured});
      await shot(page,'workshop-'+id+'-'+side,'#spriteDetail .sprite-previews');
    }
    const links=await page.locator('#spriteDetail a[href*="unified-versus"]').count();
    const referenceOnly=await page.locator('#spriteDetail [data-reference-only]').count();
    check(id+': workshop controls preserve the exact combat role',policy.combatEnabled?links===1&&referenceOnly===0:links===0&&referenceOnly===1);
    if(ids.includes(id)&&policy.combatEnabled)playable.push(id);
    if(!policy.combatEnabled){
      await openVersus(page,id,stageIds[0]);
      await page.click('#launch');
      await page.waitForFunction(()=>/rôle non combattant|contact est indisponible/.test(document.querySelector('#playStatus')?.textContent||''));
      const blocked=await page.evaluate(()=>({engineCreated:!!__HALO_QA__.engine,message:document.querySelector('#playStatus').textContent,gameDraws:__W17.events.filter(row=>row.canvas==='game').length}));
      check(id+': normal launch rejects the reference-only role',!blocked.engineCreated&&blocked.gameDraws===0,blocked);
      report.blockedLaunches.push({id,...blocked});
      await shot(page,'reference-only-'+id,'#selectScreen');
    }
  }
  for(const [index,id] of playable.entries()){
    const stageId=stageIds[index%stageIds.length];
    await launchDuel(page,id,stageId);
    await planes(page,stageId);
    await shot(page,'duel-'+id+'-'+stageId);
    await assertNoGamePortrait(page,id,'Normal duel '+id);
    await collectKeys(page,'duel-'+id);
  }
  for(const stageId of stageIds){
    await launchDuel(page,nurse,stageId);
    const art=stageBitmapFor(getStage(stageId),STAGE_BITMAPS),before=await planes(page,stageId);
    await shot(page,stageId+'-idle-two-planes');
    await exerciseWalk(page,stageId+'-nurse-walk-right','ArrowRight',1);
    const after=await planes(page,stageId);
    const delta=after.map((draw,index)=>draw.args.at(-4)-before[index].args.at(-4));
    const expected=after.map((draw,index)=>{
      const displacement=draw.actorX.reduce((n,x)=>n+x,0)-before[index].actorX.reduce((n,x)=>n+x,0);
      return -displacement*(art.layers[index].parallaxX||0);
    });
    check(stageId+': both authored PNGs are drawn with the native dimensions',
      after.every((draw,index)=>draw.path===art.layers[index].frames[0].path&&draw.width===art.layers[index].frames[0].width&&draw.height===art.layers[index].frames[0].height));
    check(stageId+': normal movement gives the two planes different Canvas translations',
      delta.every(Number.isFinite)&&Math.abs(delta[0]-delta[1])>.1&&delta.every((value,index)=>Math.abs(value-expected[index])<.02),
      {delta,expected});
    report.stages.push({stageId,scene:art.scene,policyScene:getStage(stageId).referencePolicy.sceneId||null,paths:art.layers.map(layer=>layer.frames[0].path),before,after,delta,expected});
    await shot(page,stageId+'-after-movement');
    await exerciseGuard(page,stageId+'-right');
    if(stageId===stageIds[0]){
      await crossNormally(page);
      await exerciseWalk(page,stageId+'-nurse-walk-left','ArrowLeft',-1);
      await exerciseGuard(page,stageId+'-left');
      const right=report.motion.find(row=>row.label===stageId+'-nurse-walk-right');
      const left=report.motion.find(row=>row.label===stageId+'-nurse-walk-left');
      check('The opposite-side walk mirrors the same three combat images without a portrait',
        right.geometries.every(({index,geometry:g})=>{
          const other=left.geometries.find(row=>row.index===index)?.geometry;
          return other?.draw.path===g.draw.path&&Math.sign(other.draw.matrix[0])===-Math.sign(g.draw.matrix[0]);
        }));
    }
    await assertNoGamePortrait(page,nurse,stageId+' completed nurse scenario');
    await collectKeys(page,stageId+'-nurse-controls');
  }
  check('Four new idles plus Origins Nurse were inspected in both directions',
    report.inspectors.length===inspectedIds.length*2);
  check('Both reference-only subjects were refused and both enabled new views reached a duel',
    report.blockedLaunches.length===ids.filter(id=>!profiles[id].combatEnabled).length&&
    report.duels.filter(row=>ids.includes(row.id)).length===playable.length);
  check('The two exact stages and three real movement scenarios completed',
    report.stages.length===2&&report.motion.length===3&&report.guards.length===3&&report.idleReturns.length===7);
  const observedKeys=report.keyEvents.flatMap(row=>row.events);
  check('The required physical keyboard commands and releases were actually observed',
    ['ArrowRight','ArrowLeft','ArrowUp','Space'].every(code=>['keydown','keyup'].every(type=>observedKeys.some(event=>event.code===code&&event.type===type&&event.isTrusted))));
  // Selecting a different contact from the persistent header must release the
  // old match before new assets are requested. Merely browsing stays reversible.
  await page.evaluate(()=>{window.__W17.retiringEngine=__HALO_QA__.engine;});
  await page.click('#openGallery');
  await page.locator('#stageList .stage-entry.active').click();
  await page.waitForFunction(()=>document.querySelector('#stageGallery').classList.contains('hidden'));
  check('Choosing the current arena keeps the live match and its pins',await page.evaluate(()=>
    __HALO_QA__.engine===__W17.retiringEngine&&!__W17.retiringEngine.destroyed&&__HALO_QA__.assetCache.pins.size>0));
  await page.click('#openGallery');
  await page.locator('#stageList .stage-entry').filter({has:page.locator('b',{hasText:getStage('underground_hc').name})}).click();
  await page.waitForFunction(()=>!__HALO_QA__.engine&&document.querySelector('#stageGallery').classList.contains('hidden'));
  const changedArena=await page.evaluate(()=>({destroyed:__W17.retiringEngine.destroyed,
    selected:__HALO_QA__.selection.stage.id,actorPins:__HALO_QA__.assetCache.pins.size,
    stagePins:__HALO_QA__.stageAssetCache.pins.size,setupVisible:!document.querySelector('#selectScreen').classList.contains('hidden')}));
  check('Choosing a new arena returns to setup and releases both old combat leases',
    changedArena.destroyed&&changedArena.selected==='underground_hc'&&changedArena.actorPins===0&&changedArena.stagePins===0&&changedArena.setupVisible,changedArena);
  await page.click('#launch');
  await page.waitForFunction(()=>!!__HALO_QA__.engine);
  await page.evaluate(()=>{window.__W17.retiringEngine=__HALO_QA__.engine;});
  await page.click('#randomAll');
  const randomized=await page.evaluate(()=>({destroyed:__W17.retiringEngine.destroyed,
    engineCreated:!!__HALO_QA__.engine,actorPins:__HALO_QA__.assetCache.pins.size,
    stagePins:__HALO_QA__.stageAssetCache.pins.size,setupVisible:!document.querySelector('#selectScreen').classList.contains('hidden')}));
  check('Randomizing a new contact returns to setup before changing the live pair',
    randomized.destroyed&&!randomized.engineCreated&&randomized.actorPins===0&&randomized.stagePins===0&&randomized.setupVisible,randomized);
  report.selectionTransitions={changedArena,randomized};
  check('No browser, HTTP asset or network errors',report.errors.length===0,report.errors);
}catch(error){
  report.failure=String(error);
  process.exitCode=1;
}finally{
  report.passed=!report.failure&&!report.errors.length;
  report.completedAt=new Date().toISOString();
  await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  await context?.close();
  await browser?.close();
  server?.kill('SIGTERM');
}
