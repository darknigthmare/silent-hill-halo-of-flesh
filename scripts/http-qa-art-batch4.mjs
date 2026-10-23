/** Real HTTP candidate-art inspection. No original footage or played campaign is claimed. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {VERSION} from '../src/data.js';

const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-art-batch4');
const source=process.env.QA_SOURCE_TREE==='1',base=process.env.QA_BASE_URL||'http://127.0.0.1:4195';
const required=['sh1_groaner_003','sh1_split_head_014','sh1_floatstinger_016'];
const optional='sh3_numb_body_small_037';
const report={version:VERSION,build:process.env.QA_BASE_URL?'external HTTP':source?'source':'dist',checks:[],errors:[],captures:[],assets:[],fixtures:[
  'Production HTTP manifests and PNGs are used without route substitutions. Three required exact profiles and the optional Numb Body candidate, when registered, are inspected through the actual workshop controls.',
  'The browser independently decodes the registered files on an offscreen canvas to measure alpha; these temporary canvases do not replace the real inspector or combat rendering.',
  'One local match selects Groaner and Split Head through the real roster buttons and Wood Side through the real stage gallery. Its ordinary intro and live render are observed; no fighter position, damage, win, clip or gameplay state is injected.',
  'Canvas drawImage calls are recorded without changing their arguments. The genuine pause/resume button and a 430-pixel viewport exercise the same loaded assets.',
  'A single idle image, a missing-pose preview and generated scenery remain unverified candidates. This suite certifies neither source gameplay, animation, original-game timings nor 1:1 visual fidelity.'
]};
let server,browser;
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(!passed&&detail!==undefined?{detail}:{})});if(!passed)throw Error(name);};
async function shot(page,name){await page.screenshot({path:resolve(out,name+'.png'),fullPage:true});report.captures.push(name+'.png');}
async function selectSubject(page,id,workSource){
  await page.fill('#spriteSearch','');await page.selectOption('#spriteFilter','all');await page.selectOption('#spriteSource',workSource);
  await page.fill('#spriteSearch',id);await page.locator(`.sprite-card[data-id="${id}"]`).click();
  await page.waitForFunction(id=>{const c=document.querySelector('#spriteDetail canvas');return c?.dataset.spriteId===id&&c.dataset.artStatus==='raster';},id);
}
async function verifyFile(frame,label){
  const response=await fetch(base+'/'+frame.path),bytes=Buffer.from(await response.arrayBuffer());
  check(label+': exact registered PNG bytes arrive over HTTP',response.ok&&response.headers.get('content-type')?.includes('image/png')&&bytes.length===frame.bytes&&createHash('sha256').update(bytes).digest('hex')===frame.sha256);
}

await mkdir(out,{recursive:true});
try{
  if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs','4195',...(source?[]:['--dist'])],{cwd:root,stdio:'ignore'});
  let ready=false;for(let n=0;n<60;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,100));}check('HTTP server ready',ready);
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>{
    window.__ART_BATCH4_DRAWS__=[];
    const draw=CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
      if(image?.src&&/\/assets\/(sprites|stages)\//.test(image.src)){
        const path=new URL(image.src).pathname,canvas=this.canvas.id||'workshop-canvas',rows=window.__ART_BATCH4_DRAWS__;
        const previous=rows.find(row=>row.path===path&&row.canvas===canvas);
        if(previous){previous.calls++;previous.args=args;}
        else rows.push({path,canvas,calls:1,width:image.naturalWidth,height:image.naturalHeight,args});
      }
      return draw.call(this,image,...args);
    };
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
  page.on('console',message=>{if(message.type()==='error')report.errors.push('console: '+message.text());});
  page.on('response',response=>{if(response.status()>=400&&/\/(assets|src|modules)\//.test(new URL(response.url()).pathname))report.errors.push(`HTTP ${response.status()}: ${response.url()}`);});
  await page.goto(base+'/modules/sprite-workshop.html');
  const registry=await page.evaluate(async({required,optional})=>{
    const {SPRITES}=await import('/src/sprite-manifest.js'),{STAGE_BITMAPS}=await import('/src/stage-bitmap-manifest.js');
    const {ROSTER,STAGES}=await import('/src/data.js');
    return {subjects:[...required,...(SPRITES[optional]?[optional]:[])].map(id=>({id,art:SPRITES[id]||null,fighter:ROSTER.find(f=>f.id===id)})),optionalRegistered:!!SPRITES[optional],
      stage:STAGES.find(s=>s.id==='woodside'),stageIndex:STAGES.findIndex(s=>s.id==='woodside'),decor:STAGE_BITMAPS.woodside};
  },{required,optional});
  report.optionalCandidate={id:optional,included:registry.optionalRegistered,reason:registry.optionalRegistered?'registered production candidate':'no accepted candidate registered; no coverage claimed'};
  check('all three required new exact-ID candidates are registered',registry.subjects.filter(subject=>required.includes(subject.id)).every(subject=>subject.art&&subject.fighter));
  for(const subject of registry.subjects){
    const {id,art,fighter}=subject;
    const exactSource=id===optional?'sh3':'sh1',exactYear=id===optional?2003:1999;
    check(id+': exact source owns one static unverified idle image',art.fighterId===id&&art.source===exactSource&&fighter.source===exactSource&&fighter.year===exactYear&&art.status==='integrated-candidate'&&art.fidelity==='unverified'&&art.frames.length===1&&Object.keys(art.clips).length===1&&art.clips.idle?.frames.length===1&&art.clips.idle.frames[0]===0&&art.animatedClips===0,art);
    const frame=art.frames[0];await verifyFile(frame,id);
    await selectSubject(page,id,fighter.source);
    check(id+': real inspector paints its loaded bitmap and disables animation playback',await page.locator('.sprite-inspector').count()===1&&await page.locator('[data-inspect=play]').isDisabled()&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle'&&await page.locator('#spriteDetail canvas').getAttribute('data-frame-index')==='0');
    const decoded=await page.evaluate(async frame=>{
      const image=new Image();image.src='/'+frame.path;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;let transparent=0,visible=0,partial=0;
      for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent++;else visible++;if(pixels[i]>0&&pixels[i]<255)partial++;}
      return {width:canvas.width,height:canvas.height,transparent,visible,partial};
    },frame);
    check(id+': decoded PNG retains transparent background and visible subject',decoded.width===frame.width&&decoded.height===frame.height&&decoded.transparent>0&&decoded.visible>0,decoded);
    report.assets.push({id,source:art.source,path:frame.path,sha256:frame.sha256,bytes:frame.bytes,alpha:decoded});
    check(id+': inspector drawImage used that registered image',await page.evaluate(path=>__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='workshop-canvas'&&draw.path==='/'+path&&draw.width>0),frame.path));
    for(const pose of ['crouch',`finisher@${id}_signature`]){
      await page.selectOption('[data-inspect=pose]',pose);
      check(id+': absent '+pose+' stays an explicit static idle preview',/À PRODUIRE/.test(await page.locator('[data-inspect=status]').textContent())&&await page.locator('[data-inspect=play]').isDisabled()&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle'&&await page.locator('#spriteDetail canvas').getAttribute('data-requested-pose')===pose);
    }
    await shot(page,'missing-poses-'+id);
    await page.selectOption('[data-inspect=pose]','idle');await shot(page,'inspector-'+id);
  }
  const identities=await page.evaluate(async ids=>{
    const {SPRITES}=await import('/src/sprite-manifest.js'),{ROSTER}=await import('/src/data.js'),{spriteFor}=await import('/src/sprite-system.js');
    return ids.map(id=>{
      const fighter=ROSTER.find(f=>f.id===id),art=SPRITES[id],paths=new Set(art.frames.map(frame=>frame.path));
      return {id,wrongSourceRejected:spriteFor({...fighter,source:'unrelated-work'})===null,unknownVariantRejected:spriteFor({...fighter,id:id+'-unverified-variant',baseId:id})===null,
        owners:Object.entries(SPRITES).filter(([,other])=>other.frames.some(frame=>paths.has(frame.path))).map(([owner])=>owner)};
    });
  },registry.subjects.map(subject=>subject.id));
  check('new images never leak through another source, invented variant or registered owner',identities.every(item=>item.wrongSourceRejected&&item.unknownVariantRejected&&item.owners.length===1&&item.owners[0]===item.id),identities);report.identities=identities;
  const related=await page.evaluate(async()=>{
    const {ROSTER}=await import('/src/data.js'),{spriteFor}=await import('/src/sprite-system.js');
    return ['sh1_wormhead_004','sh1_twinfeeler_015','sh3_numb_body_medium','sh3_numb_body_large_038'].filter(id=>!spriteFor(ROSTER.find(f=>f.id===id)));
  });
  for(const id of related){
    await page.fill('#spriteSearch','');await page.selectOption('#spriteSource','all');await page.fill('#spriteSearch',id);
    await page.locator(`.sprite-card[data-id="${id}"]`).click();
    check(id+': real missing-variant dossier has no borrowed bitmap or duel link',await page.locator('#spriteDetail canvas').getAttribute('data-art-status')==='missing'&&await page.locator('.sprite-inspector').count()===0&&await page.locator('#spriteDetail a').count()===0);
  }
  const decor=registry.decor;
  check('second scenery is the exact original Wood Side corridor with cover replacement',registry.stage?.source==='sh2'&&decor?.stageId==='woodside'&&decor.source==='sh2'&&decor.scene==='original-pc-corridor'&&decor.mode==='replace'&&decor.status==='integrated-candidate'&&decor.fidelity==='unverified'&&decor.layers.length===1&&decor.layers.every(layer=>layer.fit==='cover'&&layer.frames.length===1&&layer.loop===false),decor);
  for(const layer of decor.layers)for(const frame of layer.frames)await verifyFile(frame,'woodside/'+layer.id);
  check('scenery lookup rejects a different work and never borrows another registered stage image',await page.evaluate(async()=>{
    const {STAGES}=await import('/src/data.js'),{STAGE_BITMAPS}=await import('/src/stage-bitmap-manifest.js'),{stageBitmapFor}=await import('/src/stage-bitmaps.js');
    const stage=STAGES.find(s=>s.id==='woodside'),paths=new Set(STAGE_BITMAPS.woodside.layers.flatMap(layer=>layer.frames.map(frame=>frame.path)));
    let wrongSourceRejected=false;try{stageBitmapFor({...stage,source:'sh2-remake-2024'});}catch{wrongSourceRejected=true;}
    const owners=Object.entries(STAGE_BITMAPS).filter(([,art])=>art.layers.some(layer=>layer.frames.some(frame=>paths.has(frame.path)))).map(([id])=>id);
    return wrongSourceRejected&&owners.length===1&&owners[0]==='woodside';
  }));
  await page.goto(base+'/modules/unified-versus.html?qa=1');await page.waitForFunction(()=>!!window.__HALO_QA__);
  for(const [index,id] of required.slice(0,2).entries()){
    const fighter=registry.subjects.find(subject=>subject.id===id).fighter;
    await page.click(index?'#slotP2':'#slotP1');await page.fill('#search',fighter.name);await page.locator(`.fighter-card[data-id="${id}"]`).click();
  }
  await page.click('#openGallery');await page.locator('.stage-entry').nth(registry.stageIndex).click();await page.waitForFunction(()=>document.querySelector('#stageGallery').classList.contains('hidden'));
  await page.selectOption('#mode','local');await page.selectOption('#timer','0');
  for(const name of ['stageHazards','stageDirector','otherworldShift','fatalities','stageFatalities'])await page.uncheck('#'+name);
  await page.uncheck('#artDiagnostic');
  check('real menu selects the two new PNG profiles and Wood Side without diagnostic mode',await page.evaluate(ids=>{const q=__HALO_QA__;return q.selection.p1.id===ids[0]&&q.selection.p2.id===ids[1]&&q.selection.stage.id==='woodside'&&!document.querySelector('#artDiagnostic').checked;},required));
  await page.evaluate(()=>{window.__ART_BATCH4_DRAWS__=[];});await page.click('#launch');
  await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='fight'&&!__HALO_QA__.engine.paused);
  const expected=[...required.slice(0,2).map(id=>registry.subjects.find(subject=>subject.id===id).art.frames[0].path),...decor.layers.flatMap(layer=>layer.frames.map(frame=>frame.path))];
  await page.waitForFunction(paths=>paths.every(path=>__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+path&&draw.calls>0)),expected);
  await page.waitForFunction(()=>__HALO_QA__.engine.phase==='fight'&&__HALO_QA__.engine.texts.every(text=>!['intro','round','fight'].includes(text.kind)));
  report.combat=await page.evaluate(()=>({phase:__HALO_QA__.engine.phase,stage:__HALO_QA__.engine.stage.id,diagnostic:__HALO_QA__.engine.config.artDiagnostic,
    actors:__HALO_QA__.engine.actors.map(actor=>({id:actor.data.id,source:actor.data.source})),draws:__ART_BATCH4_DRAWS__.filter(draw=>draw.canvas==='game'),actorPins:[...__HALO_QA__.assetCache.pins],stagePins:[...__HALO_QA__.stageAssetCache.pins]}));
  check('actual combat canvas paints both registered actor images and the cover scenery',!report.combat.diagnostic&&report.combat.stage==='woodside'&&expected.every(path=>report.combat.draws.some(draw=>draw.path==='/'+path&&draw.width>0&&draw.height>0))&&report.combat.draws.filter(draw=>draw.path.includes('/assets/stages/')).every(draw=>draw.args.length===8&&draw.args[6]===1280&&draw.args[7]===720),report.combat);
  check('combat leases contain exactly the selected actor PNGs and Wood Side frame',report.combat.actorPins.length===2&&report.combat.stagePins.length===1&&expected.every(path=>[...report.combat.actorPins,...report.combat.stagePins].includes(path)),report.combat);
  await shot(page,'combat-new-pngs-woodside');await page.click('#pauseBtn');
  const frozen=await page.evaluate(()=>({frame:__HALO_QA__.engine.frame,clocks:JSON.stringify(__HALO_QA__.engine.actors.map(actor=>actor.spriteClock))}));
  await page.waitForTimeout(180);
  check('genuine pause freezes simulation and static sprite clocks',await page.evaluate(before=>__HALO_QA__.engine.paused&&__HALO_QA__.engine.frame===before.frame&&JSON.stringify(__HALO_QA__.engine.actors.map(actor=>actor.spriteClock))===before.clocks,frozen));await shot(page,'paused-new-art');
  await page.setViewportSize({width:430,height:932});await page.click('[data-pause=resume]');
  await page.waitForFunction(frame=>!__HALO_QA__.engine.paused&&__HALO_QA__.engine.frame>frame,frozen.frame);
  check('mobile match stays within viewport and retains the real decoded images',await page.evaluate(paths=>{const box=document.querySelector('#game').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1&&box.left>=-1&&box.right<=innerWidth+1&&paths.every(path=>__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+path));},expected));await shot(page,'mobile-new-pngs-woodside');
  await page.click('#leaveFight');await page.waitForFunction(()=>!__HALO_QA__.engine);
  await page.goto(base+'/modules/sprite-workshop.html');await selectSubject(page,required[0],'sh1');
  check('mobile real inspector fits its controls and keeps the one-frame image static',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)&&await page.locator('[data-inspect=play]').isDisabled());await shot(page,'mobile-static-inspector');
  check('no browser, console or HTTP asset errors',report.errors.length===0,report.errors);await context.close();
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
