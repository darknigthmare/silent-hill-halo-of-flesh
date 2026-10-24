/** Successive batch-4/batch-5 HTTP candidate-art inspection; the CI suite/path stay stable. No original footage or played campaign is claimed. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {VERSION} from '../src/data.js';

const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'tests/http-art-batch4');
const source=process.env.QA_SOURCE_TREE==='1',base=process.env.QA_BASE_URL||'http://127.0.0.1:4195';
const batch4=['sh1_groaner_003','sh1_split_head_014','sh1_floatstinger_016','sh3_numb_body_small_037'];
const batch5=['sh1_wormhead_004','sh1_hanged_scratcher_011','sh3_closer_036','sh4_hummer_055'];
const required=[...batch4,...batch5];
const report={version:VERSION,build:process.env.QA_BASE_URL?'external HTTP':source?'source':'dist',checks:[],errors:[],captures:[],assets:[],fixtures:[
  'Production HTTP manifests and PNGs are used without route substitutions. All four batch-4 and four batch-5 exact profiles are required and inspected through the actual workshop controls; a missing import fails the suite.',
  'The browser independently decodes the registered files on an offscreen canvas to measure alpha; these temporary canvases do not replace the real inspector or combat rendering.',
  'A local match retains Groaner/Split Head/Wood Side coverage. A second requires Wormhead/Closer/Alchemilla through the real roster and stage gallery. Ordinary intros and live images, camera and foot placement are observed; no fighter position, damage, win, clip or gameplay state is injected.',
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
        const path=new URL(image.src).pathname,canvas=this.canvas.id||(this.canvas.closest?.('#spriteDetail')?'workshop-canvas':'offscreen'),rows=window.__ART_BATCH4_DRAWS__;
        const previous=rows.find(row=>row.path===path&&row.canvas===canvas);
        const matrix=this.getTransform(),transform=[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f];
        if(previous){previous.calls++;previous.args=args;previous.transform=transform;}
        else rows.push({path,canvas,calls:1,width:image.naturalWidth,height:image.naturalHeight,args,transform});
      }
      return draw.call(this,image,...args);
    };
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
  page.on('console',message=>{if(message.type()==='error')report.errors.push('console: '+message.text());});
  page.on('response',response=>{if(response.status()>=400&&/\/(assets|src|modules)\//.test(new URL(response.url()).pathname))report.errors.push(`HTTP ${response.status()}: ${response.url()}`);});
  await page.goto(base+'/modules/sprite-workshop.html');
  const registry=await page.evaluate(async required=>{
    const {SPRITES}=await import('/src/sprite-manifest.js'),{STAGE_BITMAPS}=await import('/src/stage-bitmap-manifest.js');
    const {ROSTER,STAGES}=await import('/src/data.js');
    return {subjects:required.map(id=>({id,art:SPRITES[id]||null,fighter:ROSTER.find(f=>f.id===id)})),
      scenes:['woodside','alchemilla'].map(id=>({id,stage:STAGES.find(s=>s.id===id),stageIndex:STAGES.findIndex(s=>s.id===id),decor:STAGE_BITMAPS[id]}))};
  },required);
  report.candidateBatches={batch4,batch5};
  check('all eight required exact-ID candidates are registered',registry.subjects.length===8&&registry.subjects.every(subject=>subject.art&&subject.fighter),registry.subjects.filter(subject=>!subject.art||!subject.fighter).map(subject=>subject.id));
  for(const subject of registry.subjects){
    const {id,art,fighter}=subject;
    const exactSource=id.split('_')[0],exactYear={sh1:1999,sh3:2003,sh4:2004}[exactSource];
    check(id+': exact source owns one static unverified idle image',art.fighterId===id&&art.source===exactSource&&fighter.source===exactSource&&fighter.year===exactYear&&art.status==='integrated-candidate'&&art.fidelity==='unverified'&&art.frames.length===1&&Object.keys(art.clips).length===1&&art.clips.idle?.frames.length===1&&art.clips.idle.frames[0]===0&&art.animatedClips===0,art);
    const frame=art.frames[0];await verifyFile(frame,id);
    await selectSubject(page,id,fighter.source);
    check(id+': real inspector paints its loaded bitmap and disables animation playback',await page.locator('.sprite-inspector').count()===1&&await page.locator('[data-inspect=play]').isDisabled()&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle'&&await page.locator('#spriteDetail canvas').getAttribute('data-frame-index')==='0');
    const decoded=await page.evaluate(async frame=>{
      const image=new Image();image.src='/'+frame.path;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;let transparent=0,visible=0,partial=0,minX=canvas.width,minY=canvas.height,maxX=-1,maxY=-1;
      for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent++;else{visible++;const pixel=(i-3)/4,x=pixel%canvas.width,y=Math.floor(pixel/canvas.width);minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}if(pixels[i]>0&&pixels[i]<255)partial++;}
      return {width:canvas.width,height:canvas.height,transparent,visible,partial,bounds:{minX,minY,maxX,maxY}};
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
  check('successive-batch images never leak through another source, invented variant or registered owner',identities.every(item=>item.wrongSourceRejected&&item.unknownVariantRejected&&item.owners.length===1&&item.owners[0]===item.id),identities);report.identities=identities;
  const related=await page.evaluate(async()=>{
    const {ROSTER}=await import('/src/data.js'),{spriteFor}=await import('/src/sprite-system.js');
    return ['sh1_wormhead_004','sh1_twinfeeler_015','sh3_numb_body_medium','sh3_numb_body_large_038'].filter(id=>!spriteFor(ROSTER.find(f=>f.id===id)));
  });
  for(const id of related){
    await page.fill('#spriteSearch','');await page.selectOption('#spriteSource','all');await page.fill('#spriteSearch',id);
    await page.locator(`.sprite-card[data-id="${id}"]`).click();
    check(id+': real missing-variant dossier has no borrowed bitmap or duel link',await page.locator('#spriteDetail canvas').getAttribute('data-art-status')==='missing'&&await page.locator('.sprite-inspector').count()===0&&await page.locator('#spriteDetail a').count()===0);
  }
  report.scenery=[];
  for(const scene of registry.scenes){
    const {id,stage,decor}=scene,isHospital=id==='alchemilla',exactSource=isHospital?'sh1':'sh2',exactScene=isHospital?'normal-waiting-room':'original-pc-corridor';
    check(id+': exact source/room is an unverified ceilinged cover replacement',stage?.source===exactSource&&decor?.stageId===id&&decor.source===exactSource&&decor.scene===exactScene&&decor.mode==='replace'&&decor.geometry?.ceiling===true&&decor.status==='integrated-candidate'&&decor.fidelity==='unverified'&&decor.layers.length===1&&decor.layers.every(layer=>layer.fit==='cover'&&layer.frames.length===1&&layer.loop===false),decor);
    for(const layer of decor.layers)for(const frame of layer.frames)await verifyFile(frame,id+'/'+layer.id);
    check(id+': scenery rejects another work/variant and never borrows another image owner',await page.evaluate(async id=>{
      const {STAGES}=await import('/src/data.js'),{STAGE_BITMAPS}=await import('/src/stage-bitmap-manifest.js'),{stageBitmapFor}=await import('/src/stage-bitmaps.js');
      const stage=STAGES.find(s=>s.id===id),paths=new Set(STAGE_BITMAPS[id].layers.flatMap(layer=>layer.frames.map(frame=>frame.path)));
      let wrongSourceRejected=false;try{stageBitmapFor({...stage,source:stage.source+'-unverified-edition'});}catch{wrongSourceRejected=true;}
      const owners=Object.entries(STAGE_BITMAPS).filter(([,art])=>art.layers.some(layer=>layer.frames.some(frame=>paths.has(frame.path)))).map(([owner])=>owner);
      return wrongSourceRejected&&stageBitmapFor({...stage,id:id+'-unverified-variant'})===null&&owners.length===1&&owners[0]===id;
    },id));
    report.scenery.push({id,source:decor.source,scene:decor.scene,geometry:decor.geometry,frames:decor.layers.flatMap(layer=>layer.frames)});
  }
  const matches=[{scene:registry.scenes.find(scene=>scene.id==='woodside'),ids:batch4.slice(0,2)},
    {scene:registry.scenes.find(scene=>scene.id==='alchemilla'),ids:['sh1_wormhead_004','sh3_closer_036']}];
  for(const {scene,ids} of matches){
    const {id:stageId,stageIndex,decor}=scene;
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(base+'/modules/unified-versus.html?qa=1');await page.waitForFunction(()=>!!window.__HALO_QA__);
    for(const [index,id] of ids.entries()){
      const fighter=registry.subjects.find(subject=>subject.id===id).fighter;
      await page.click(index?'#slotP2':'#slotP1');await page.fill('#search',fighter.name);await page.locator(`.fighter-card[data-id="${id}"]`).click();
    }
    await page.click('#openGallery');await page.locator('.stage-entry').nth(stageIndex).click();await page.waitForFunction(()=>document.querySelector('#stageGallery').classList.contains('hidden'));
    await page.selectOption('#mode','local');await page.selectOption('#timer','0');
    for(const name of ['stageHazards','stageDirector','otherworldShift','fatalities','stageFatalities'])await page.uncheck('#'+name);
    await page.uncheck('#artDiagnostic');
    check(stageId+': real menu selects exact PNG profiles and room without diagnostic mode',await page.evaluate(({ids,stageId})=>{const q=__HALO_QA__;return q.selection.p1.id===ids[0]&&q.selection.p2.id===ids[1]&&q.selection.stage.id===stageId&&!document.querySelector('#artDiagnostic').checked;},{ids,stageId}));
    await page.evaluate(()=>{window.__ART_BATCH4_DRAWS__=[];});await page.click('#launch');
    await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='fight'&&!__HALO_QA__.engine.paused);
    const expected=[...ids.map(id=>registry.subjects.find(subject=>subject.id===id).art.frames[0].path),...decor.layers.flatMap(layer=>layer.frames.map(frame=>frame.path))];
    await page.waitForFunction(paths=>paths.every(path=>__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+path&&draw.calls>0)),expected);
    await page.waitForFunction(()=>__HALO_QA__.engine.phase==='fight'&&__HALO_QA__.engine.texts.every(text=>!['intro','round','fight'].includes(text.kind)));
    const combat=await page.evaluate(()=>({phase:__HALO_QA__.engine.phase,stage:__HALO_QA__.engine.stage.id,diagnostic:__HALO_QA__.engine.config.artDiagnostic,camera:__HALO_QA__.engine.presentationCamera,
      actors:__HALO_QA__.engine.actors.map(actor=>({id:actor.data.id,source:actor.data.source,x:actor.x,y:actor.y})),draws:__ART_BATCH4_DRAWS__.filter(draw=>draw.canvas==='game'),actorPins:[...__HALO_QA__.assetCache.pins],stagePins:[...__HALO_QA__.stageAssetCache.pins]}));
    if(stageId==='woodside')report.combat=combat;else report.combatBatch5=combat;
    check(stageId+': actual canvas paints both registered images and full cover scenery',!combat.diagnostic&&combat.stage===stageId&&expected.every(path=>combat.draws.some(draw=>draw.path==='/'+path&&draw.width>0&&draw.height>0))&&combat.draws.filter(draw=>draw.path.includes('/assets/stages/')).every(draw=>draw.args.length===8&&draw.args[6]===1280&&draw.args[7]===720),combat);
    check(stageId+': combat leases contain exactly the selected two actor PNGs and room frame',combat.actorPins.length===2&&combat.stagePins.length===1&&expected.every(path=>[...combat.actorPins,...combat.stagePins].includes(path)),combat);
    combat.imagePlacement=ids.map(id=>{
      const frame=registry.subjects.find(subject=>subject.id===id).art.frames[0],alpha=report.assets.find(asset=>asset.id===id).alpha.bounds,draw=combat.draws.find(draw=>draw.path==='/'+frame.path);
      const [x,y,w,h]=draw.args,[a,b,c,d,e,f]=draw.transform,project=(u,v)=>({x:a*u+c*v+e,y:b*u+d*v+f});
      return {id,anchor:project(x+frame.anchor[0]*w,y+frame.anchor[1]*h),visibleCorners:[[alpha.minX,alpha.minY],[alpha.maxX+1,alpha.minY],[alpha.minX,alpha.maxY+1],[alpha.maxX+1,alpha.maxY+1]].map(([u,v])=>project(x+u/frame.width*w,y+v/frame.height*h))};
    });
    check(stageId+': actual bitmap anchors and visible alpha bounds fit the live camera',Number.isFinite(combat.camera?.scale)&&combat.camera.scale>0&&combat.imagePlacement.every(image=>[image.anchor,...image.visibleCorners].every(point=>Number.isFinite(point.x)&&Number.isFinite(point.y)&&point.x>=-1&&point.x<=1281&&point.y>=-1&&point.y<=721)),combat.imagePlacement);
    await shot(page,'combat-new-pngs-'+stageId);await page.click('#pauseBtn');
    const frozen=await page.evaluate(()=>({frame:__HALO_QA__.engine.frame,clocks:JSON.stringify(__HALO_QA__.engine.actors.map(actor=>actor.spriteClock))}));
    await page.waitForTimeout(180);
    check(stageId+': genuine pause freezes simulation and static sprite clocks',await page.evaluate(before=>__HALO_QA__.engine.paused&&__HALO_QA__.engine.frame===before.frame&&JSON.stringify(__HALO_QA__.engine.actors.map(actor=>actor.spriteClock))===before.clocks,frozen));await shot(page,'paused-new-art-'+stageId);
    await page.setViewportSize({width:430,height:932});await page.click('[data-pause=resume]');
    await page.waitForFunction(frame=>!__HALO_QA__.engine.paused&&__HALO_QA__.engine.frame>frame,frozen.frame);
    check(stageId+': mobile match fits viewport and retains the real images',await page.evaluate(paths=>{const box=document.querySelector('#game').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1&&box.left>=-1&&box.right<=innerWidth+1&&paths.every(path=>__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+path));},expected));await shot(page,'mobile-new-pngs-'+stageId);
    await page.click('#leaveFight');await page.waitForFunction(()=>!__HALO_QA__.engine);
  }
  await page.goto(base+'/modules/sprite-workshop.html');await selectSubject(page,required[0],'sh1');
  check('mobile real inspector fits its controls and keeps the one-frame image static',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)&&await page.locator('[data-inspect=play]').isDisabled());await shot(page,'mobile-static-inspector');
  check('no browser, console or HTTP asset errors',report.errors.length===0,report.errors);await context.close();
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
