/** Successive batch-4 through batch-10 HTTP candidate-art inspection; the CI suite/path stay stable. No original footage or played campaign is claimed. */
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
const batch6=['sh1_night_flutter_002','sh3_pendulum_039','sh4_twin_victim_059','sh3_slurper_042'];
const batch7=['sh1_romper_010','sh3_double_head_040','sh3_insane_cancer_041','sh4_sniffer_dog_male_053'];
const batch8=['sh4_patient_060','sh4_bottom_065','sh4_gum_head_new_type_058'];
const batch9=["sh1_mumbler_006","sh1_creeper_009","sh1_puppet_nurse_012","sh1_puppet_doctor_013","sh1_twinfeeler_015","sh4_sniffer_dog_female_054","sh4_gum_head_old_type_057","sh4_toadstool_061","sh4_whitestool_062","sh4_tremer_blue_063","sh4_tremer_red_064","sh4_wheelchair_068","sh3_numb_body_large_038","sh3_nurse_revolver_044","sh3_scraper_045","sh3_missionary_047","sh3_leonard_wolf_048","sh4_jimmy_stone_victim_1","sh4_cynthia_velasquez_victim_16","sh4_richard_braintree_victim_19","sh4_walter_sullivan_072","sh2_red_pyramid_thing_great_knife_029","sh2_red_pyramid_thing_spear_030","sh2_eddie_dombrowski_032"];
const blocked9=["sh1_incubus_019","sh3_nurse_pipe_043","sh3_valtiel_051","sh4_jasper_gein_victim_17","sh4_andrew_desalvo_victim_18","sh3_split_worm_046"];
const batch10=['sh1_groaner_003','sh1_wormhead_004','sh4_hummer_055','sh3_double_head_040','sh3_numb_body_small_037','sh4_sniffer_dog_female_054','sh1_romper_010','sh1_split_head_014','sh3_closer_036','sh3_slurper_042'];
const batch10Poses=['walk','hurt','ko'];
const twinId='sh4_twin_victim_059',twinTaunt='taunt@'+twinId+':taunt';
const required=[...batch4,...batch5,...batch6,...batch7,...batch8,...batch9];
const sceneContracts={woodside:{source:'sh2',scene:'original-pc-corridor'},alchemilla:{source:'sh1',scene:'normal-waiting-room'},lakeview:{source:'sh2',scene:'normal-lobby-before-video'},shopping_mall:{source:'sh3',scene:'normal-helens-bakery'},brookhaven_roof:{source:'sh2',scene:'original-roof-before-fall',ceiling:false}};
const report={version:VERSION,build:process.env.QA_BASE_URL?'external HTTP':source?'source':'dist',checks:[],errors:[],captures:[],assets:[],fixtures:[
  'Production HTTP manifests and PNGs are used without route substitutions. Four exact profiles from each of batches 4, 5, 6 and 7, then three SH4 profiles from batch 8 and twenty-four exact profiles from batch 9, are required and inspected through the actual workshop controls; a missing import fails the suite. Six blocked batch-9 identities must retain explicit missing-art dossiers; five tool refusals and one partial source body are never replaced by borrowed pixels.',
  'The browser independently decodes the registered files on an offscreen canvas to measure alpha; these temporary canvases do not replace the real inspector or combat rendering.',
  'Local matches retain Groaner/Split Head/Wood Side, Wormhead/Closer/Alchemilla and Twin Victim/Slurper/Lakeview coverage, then require Double Head/Insane Cancer/Central Square Mall through the real roster and stage gallery. Two further real matches cover Patient/Gum Head New Type and Bottom/Patient on the original Brookhaven roof before the fall; the wide facade camera is a bounded reconstruction rather than source geometry. Ordinary intros and live images, camera and foot placement are observed; no fighter position, damage, win, clip or gameplay state is injected.',
  'Canvas drawImage calls are recorded without changing their arguments. The genuine pause/resume button and a 430-pixel viewport exercise the same loaded assets.',
  'Static idles, one separate non-looping Twin Victim pointing image, missing-pose previews and generated scenery remain unverified candidates. An emulated touchscreen presses the real taunt and attack controls; no physical device, source gameplay, animation, original-game timing or 1:1 visual fidelity is certified.',
  'Batch10 adds thirty independent one-image walk/hurt/ko clips to ten existing exact profiles, preserving their idle files. All thirty files are decoded, painted with the actual inspector, and checked for alpha support and standing-equivalent scale. Three additional ordinary matches cover Hummer/Small Numb Body, Romper/Slurper and Groaner/Split Head; genuine movement controls select the new walk PNGs. The last match uses repeated real player2 neutralLight inputs to reach a grounded final KO. These played-versus input observations are separate from the static workshop pose previews and prove no original-game motion/timing.'
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
  const context=await browser.newContext({serviceWorkers:'block',hasTouch:true,viewport:{width:1440,height:1000}});
  await context.addInitScript(()=>{
    window.__ART_BATCH4_DRAWS__=[];
    window.__ART_BATCH6_RECTS__=[];
    window.__ART_BATCH6_TEXTS__=[];
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
    const rectangle=CanvasRenderingContext2D.prototype.strokeRect;
    CanvasRenderingContext2D.prototype.strokeRect=function(...args){
      if(this.canvas.closest?.('#spriteDetail')){
        const matrix=this.getTransform();
        __ART_BATCH6_RECTS__.push({color:this.strokeStyle,args,transform:[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f]});
      }
      return rectangle.apply(this,args);
    };
    const fill=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText=function(...args){
      if(this.canvas.id==='game'){
        const text=String(args[0]),previous=__ART_BATCH6_TEXTS__.find(row=>row.text===text);
        if(previous)previous.calls++;else __ART_BATCH6_TEXTS__.push({text,calls:1});
      }
      return fill.apply(this,args);
    };
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
  page.on('console',message=>{if(message.type()==='error')report.errors.push('console: '+message.text());});
  page.on('response',response=>{if(response.status()>=400&&/\/(assets|src|modules)\//.test(new URL(response.url()).pathname))report.errors.push(`HTTP ${response.status()}: ${response.url()}`);});
  await page.goto(base+'/modules/sprite-workshop.html');
  const registry=await page.evaluate(async required=>{
    const {SPRITES}=await import('/src/sprite-manifest.js'),{STAGE_BITMAPS}=await import('/src/stage-bitmap-manifest.js');
    const {ROSTER,STAGES}=await import('/src/data.js');
    return {registeredIds:Object.keys(SPRITES),subjects:required.map(id=>({id,art:SPRITES[id]||null,fighter:ROSTER.find(f=>f.id===id)})),
      scenes:['woodside','alchemilla','lakeview','shopping_mall','brookhaven_roof'].map(id=>({id,stage:STAGES.find(s=>s.id===id),stageIndex:STAGES.findIndex(s=>s.id===id),decor:STAGE_BITMAPS[id]}))};
  },required);
  report.candidateBatches={batch4,batch5,batch6,batch7,batch8,batch9,blocked9,batch10,batch10Poses};
  check('all forty-three required exact-ID candidates are registered',registry.subjects.length===required.length&&registry.subjects.every(subject=>subject.art&&subject.fighter),registry.subjects.filter(subject=>!subject.art||!subject.fighter).map(subject=>subject.id));
  await page.fill('#spriteSearch','');await page.selectOption('#spriteSource','all');await page.selectOption('#spriteFilter','ready');
  report.readyPages=[];
  for(let index=0;index<Math.ceil(registry.registeredIds.length/18);index++){
    await page.waitForFunction(()=>[...document.querySelectorAll('.sprite-card canvas')].every(canvas=>canvas.dataset.artStatus==='raster'));
    const ids=await page.locator('.sprite-card').evaluateAll(cards=>cards.map(card=>card.dataset.id));report.readyPages.push(ids);
    check('candidate gallery real page '+(index+1)+' has its expected eighteen-card slice',ids.length===Math.min(18,registry.registeredIds.length-index*18));
    await shot(page,'candidate-gallery-page-'+(index+1));
    if(index+1<Math.ceil(registry.registeredIds.length/18)){check('candidate gallery next button is available before the last page',!await page.locator('#spriteNext').isDisabled());await page.click('#spriteNext');}
  }
  const paged=report.readyPages.flat();
  check('real gallery pages contain every registered exact ID once and finish at a disabled next button',paged.length===registry.registeredIds.length&&new Set(paged).size===paged.length&&JSON.stringify([...paged].sort())===JSON.stringify([...registry.registeredIds].sort())&&await page.locator('#spriteNext').isDisabled());
  for(const subject of registry.subjects){
    const {id,art,fighter}=subject;
    const isBatch8=batch8.includes(id),isBatch9=batch9.includes(id),isBatch10=batch10.includes(id);
    const exactSource=id.split('_')[0],exactYear={sh1:1999,sh2:2001,sh3:2003,sh4:2004}[exactSource];
    const isTwin=id===twinId;
    check(id+': exact source owns its static idle and only its declared additional stills',art.fighterId===id&&art.source===exactSource&&fighter.source===exactSource&&fighter.year===exactYear&&art.status==='integrated-candidate'&&art.fidelity==='unverified'&&art.frames.length===(isBatch10?4:isTwin?2:1)&&Object.keys(art.clips).length===(isBatch10?4:isTwin?2:1)&&art.clips.idle?.frames.length===1&&art.clips.idle.frames[0]===0&&art.animatedClips===0&&(!isTwin||art.clips[twinTaunt]?.frames.length===1&&art.clips[twinTaunt].frames[0]===1&&art.clips[twinTaunt].loop===false&&art.frames[0].path!==art.frames[1].path)&&(!isBatch10||batch10Poses.every((pose,i)=>art.clips[pose]?.frames.length===1&&art.clips[pose].frames[0]===i+1&&art.clips[pose].loop===false)&&new Set(art.frames.map(frame=>frame.pixelSHA256)).size===4),art);
    await selectSubject(page,id,fighter.source);
    check(id+': real inspector paints its loaded bitmap and disables animation playback',await page.locator('.sprite-inspector').count()===1&&await page.locator('[data-inspect=play]').isDisabled()&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle'&&await page.locator('#spriteDetail canvas').getAttribute('data-frame-index')==='0');
    for(const [frameIndex,frame] of art.frames.entries()){
    await verifyFile(frame,id+'/image-'+frameIndex);
    if(isTwin&&frameIndex===1){
      await page.selectOption('[data-inspect=pose]',twinTaunt);
      check(id+': exact pointing context uses its distinct static image and no playback animation',await page.locator('#spriteDetail canvas').getAttribute('data-pose')===twinTaunt&&await page.locator('#spriteDetail canvas').getAttribute('data-frame-index')==='1'&&await page.locator('[data-inspect=play]').isDisabled()&&!/À PRODUIRE/.test(await page.locator('[data-inspect=status]').textContent()));
      await shot(page,'inspector-pointing-'+id);
    }
    if(isBatch10&&frameIndex>0){
      const pose=batch10Poses[frameIndex-1];
      await page.selectOption('[data-inspect=pose]',pose);
      await page.waitForFunction(({id,pose,index,path})=>{const canvas=document.querySelector('#spriteDetail canvas');return canvas?.dataset.spriteId===id&&canvas.dataset.artStatus==='raster'&&canvas.dataset.pose===pose&&canvas.dataset.frameIndex===String(index)&&__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='workshop-canvas'&&draw.path==='/'+path);},{id,pose,index:frameIndex,path:frame.path});
      check(id+': '+pose+' is its own non-looping one-image still, playback stays disabled',await page.locator('[data-inspect=play]').isDisabled()&&!/À PRODUIRE/.test(await page.locator('[data-inspect=status]').textContent()));
      const geometry=await page.evaluate(async({id,pose,frame})=>{const {ROSTER}=await import('/src/data.js'),{rasterPlacement}=await import('/src/sprite-system.js'),{bodyProfile}=await import('/src/combat-geometry.js'),{previewSpriteState}=await import('/src/sprite-inspector.js');const fighter=ROSTER.find(f=>f.id===id),state=previewSpriteState(pose,0),p=rasterPlacement(fighter,frame,0,0,1,state),body=bodyProfile(fighter,state);return {id,pose,anchor:[...frame.anchor],bodyHeight:frame.bodyHeight,standingEquivalentHeight:body.height*body.scale,visibleHeight:(frame.visibleBounds[3]-frame.visibleBounds[1])*p.height/frame.height,visibleBottom:p.y+frame.visibleBounds[3]*p.height/frame.height,expectedBottom:-(body.bottom||0)*body.scale,finite:Object.values(p).filter(v=>typeof v==='number').every(Number.isFinite)};},{id,pose,frame});
      (report.poseGeometryBatch10??=[]).push(geometry);
      check(id+': '+pose+' keeps its own finite standing-equivalent scale and actual alpha contact',geometry.finite&&Math.abs(geometry.visibleBottom-geometry.expectedBottom)<.02&&frame.bodyHeight>0&&frame.bodyHeight<=1,geometry);
      if(pose==='ko')check(id+': collapsed KO was not normalized to full standing silhouette height',geometry.visibleHeight<geometry.standingEquivalentHeight&&frame.bodyHeight>(frame.visibleBounds[3]-frame.visibleBounds[1])/frame.height,geometry);
      await shot(page,'batch10-inspector-'+pose+'-'+id);
    }
    const decoded=await page.evaluate(async frame=>{
      const image=new Image();image.src='/'+frame.path;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
      const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;let transparent=0,visible=0,partial=0,minX=canvas.width,minY=canvas.height,maxX=-1,maxY=-1;
      for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent++;else{visible++;const pixel=(i-3)/4,x=pixel%canvas.width,y=Math.floor(pixel/canvas.width);minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}if(pixels[i]>0&&pixels[i]<255)partial++;}
      return {width:canvas.width,height:canvas.height,transparent,visible,partial,bounds:{minX,minY,maxX,maxY}};
    },frame);
    check(id+': decoded PNG retains transparent background and visible subject',decoded.width===frame.width&&decoded.height===frame.height&&decoded.transparent>0&&decoded.visible>0,decoded);
    report.assets.push({id,frameIndex,source:art.source,path:frame.path,sha256:frame.sha256,bytes:frame.bytes,alpha:decoded});
    check(id+': inspector drawImage used that registered image',await page.evaluate(path=>__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='workshop-canvas'&&draw.path==='/'+path&&draw.width>0),frame.path));
    }
    for(const pose of [...(isBatch10?['guard','dodge']:['walk']),'crouch',`finisher@${id}_signature`,...(isTwin?['taunt',`intro@${id}:intro`,`winMatch@${id}:winMatch`,`outro@${id}:outro`]:[]),...((isBatch8||isBatch9||isBatch10)?['neutralLight','neutralHeavy',`intro@${id}:intro`,`taunt@${id}:taunt`]:[])]){
      await page.selectOption('[data-inspect=pose]',pose);
      check(id+': absent '+pose+' stays an explicit static idle preview',/À PRODUIRE/.test(await page.locator('[data-inspect=status]').textContent())&&await page.locator('[data-inspect=play]').isDisabled()&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle'&&await page.locator('#spriteDetail canvas').getAttribute('data-requested-pose')===pose);
    }
    await shot(page,'missing-poses-'+id);
    await page.selectOption('[data-inspect=pose]','idle');await shot(page,'inspector-'+id);
  }
  report.inspectorGeometry=[];
  for(const {id,pose} of [{id:'sh1_night_flutter_002',pose:'jump'},{id:'sh4_hummer_055',pose:'knockdown'}]){
    const subject=registry.subjects.find(subject=>subject.id===id),frame=subject.art.frames[0],alpha=report.assets.find(asset=>asset.id===id&&asset.frameIndex===0).alpha.bounds;
    await selectSubject(page,id,subject.fighter.source);
    await page.evaluate(()=>{__ART_BATCH4_DRAWS__=[];__ART_BATCH6_RECTS__=[];});
    await page.selectOption('[data-inspect=pose]',pose);
    const actual=await page.evaluate(async({id,pose,frame,alpha})=>{
      const {ROSTER}=await import('/src/data.js'),{bodyBox}=await import('/src/combat-geometry.js'),{previewSpriteState}=await import('/src/sprite-inspector.js');
      const fighter=ROSTER.find(f=>f.id===id),state=previewSpriteState(pose,0);
      const image=__ART_BATCH4_DRAWS__.find(draw=>draw.canvas==='workshop-canvas'&&draw.path==='/'+frame.path),visible=__ART_BATCH6_RECTS__.filter(rect=>rect.color==='#d9bd83').at(-1),collision=__ART_BATCH6_RECTS__.filter(rect=>rect.color==='#77d694').at(-1);
      if(!image||!visible||!collision)return {id,pose,missingCapture:true};
      const screenRect=(args,m)=>{const [x,y,w,h]=args,[a,b,c,d,e,f]=m,points=[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([u,v])=>({x:a*u+c*v+e,y:b*u+d*v+f}));return {left:Math.min(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),right:Math.max(...points.map(p=>p.x)),bottom:Math.max(...points.map(p=>p.y))};};
      const [x,y,w,h]=image.args,body=bodyBox({...state,data:fighter,x:0,y:0}),bounds=frame.visibleBounds||[alpha.minX,alpha.minY,alpha.maxX+1,alpha.maxY+1];
      const expectedVisible=screenRect([x+bounds[0]/frame.width*w,y+bounds[1]/frame.height*h,(bounds[2]-bounds[0])/frame.width*w,(bounds[3]-bounds[1])/frame.height*h],image.transform);
      const expectedCollision=screenRect([body.x,body.y,body.w,body.h],collision.transform),actualVisible=screenRect(visible.args,visible.transform),actualCollision=screenRect(collision.args,collision.transform);
      const matches=(a,b)=>Object.keys(a).every(key=>Math.abs(a[key]-b[key])<1e-6);
      return {id,pose,state,boundsKind:frame.visibleBounds?'registered visible envelope; faint alpha tails excluded':'positive-alpha envelope',actualVisible,expectedVisible,actualCollision,expectedCollision,visibleMatches:matches(actualVisible,expectedVisible),collisionMatches:matches(actualCollision,expectedCollision)};
    },{id,pose,frame,alpha});
    report.inspectorGeometry.push(actual);
    check(id+': '+pose+' actual inspector strokeRect guides align with painted PNG and stateful body',actual.visibleMatches&&actual.collisionMatches,actual);
    check(id+': geometry regression retains an explicit missing-pose idle preview',await page.locator('#spriteDetail canvas').getAttribute('data-requested-pose')===pose&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle'&&/À PRODUIRE/.test(await page.locator('[data-inspect=status]').textContent()));
    await shot(page,'stateful-inspector-'+id+'-'+pose);
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
    return ['sh1_twinfeeler_015','sh3_numb_body_medium','sh3_numb_body_large_038','sh4_sniffer_dog_female_054','bom_double_head_124','bom_insane_cancer_126',...ROSTER.filter(f=>f.source==='sh4'&&['Bottom','One Truth'].includes(f.name)).map(f=>f.id)].filter(id=>!spriteFor(ROSTER.find(f=>f.id===id)));
  });
  for(const id of related){
    await page.fill('#spriteSearch','');await page.selectOption('#spriteSource','all');await page.fill('#spriteSearch',id);
    await page.locator(`.sprite-card[data-id="${id}"]`).click();
    check(id+': real missing-variant dossier has no borrowed bitmap or duel link',await page.locator('#spriteDetail canvas').getAttribute('data-art-status')==='missing'&&await page.locator('.sprite-inspector').count()===0&&await page.locator('#spriteDetail a').count()===0);
  }
  report.blockedBatch9=[];
  for(const id of blocked9){
    await page.fill('#spriteSearch','');await page.selectOption('#spriteSource','all');await page.selectOption('#spriteFilter','all');await page.fill('#spriteSearch',id);
    await page.locator(`.sprite-card[data-id="${id}"]`).click();
    const absent=await page.evaluate(async id=>{const {SPRITES}=await import('/src/sprite-manifest.js');return !Object.hasOwn(SPRITES,id);},id);
    check(id+': blocked artwork stays absent with an explicit dossier and no borrowed bitmap or duel link',absent&&await page.locator('#spriteDetail canvas').getAttribute('data-art-status')==='missing'&&await page.locator('.sprite-inspector').count()===0&&await page.locator('#spriteDetail a').count()===0);
    report.blockedBatch9.push({id,artPresent:false});
  }
  report.scenery=[];
  for(const scene of registry.scenes){
    const {id,stage,decor}=scene,{source:exactSource,scene:exactScene,ceiling=true}=sceneContracts[id];
    check(id+': exact source/room is an unverified cover replacement with its declared ceiling geometry',stage?.source===exactSource&&decor?.stageId===id&&decor.source===exactSource&&decor.scene===exactScene&&decor.mode==='replace'&&decor.geometry?.ceiling===ceiling&&decor.status==='integrated-candidate'&&decor.fidelity==='unverified'&&decor.layers.length===1&&decor.layers.every(layer=>layer.fit==='cover'&&layer.frames.length===1&&layer.loop===false),decor);
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
    {scene:registry.scenes.find(scene=>scene.id==='alchemilla'),ids:['sh1_wormhead_004','sh3_closer_036']},
    {scene:registry.scenes.find(scene=>scene.id==='lakeview'),ids:['sh4_twin_victim_059','sh3_slurper_042']},
    {scene:registry.scenes.find(scene=>scene.id==='shopping_mall'),ids:['sh3_double_head_040','sh3_insane_cancer_041']},
    {scene:registry.scenes.find(scene=>scene.id==='brookhaven_roof'),ids:['sh4_patient_060','sh4_gum_head_new_type_058'],captureId:'brookhaven-roof-patient-new-type'},
    {scene:registry.scenes.find(scene=>scene.id==='brookhaven_roof'),ids:['sh4_bottom_065','sh4_patient_060'],captureId:'brookhaven-roof-bottom-patient'},
    {scene:registry.scenes.find(scene=>scene.id==='woodside'),ids:['sh2_red_pyramid_thing_great_knife_029','sh2_red_pyramid_thing_spear_030'],captureId:'batch9-knife-spear-woodside'},
    {scene:registry.scenes.find(scene=>scene.id==='brookhaven_roof'),ids:['sh4_walter_sullivan_072','sh2_eddie_dombrowski_032'],captureId:'batch9-walter-eddie-roof'},
    {scene:registry.scenes.find(scene=>scene.id==='shopping_mall'),ids:['sh3_numb_body_large_038','sh4_sniffer_dog_female_054'],captureId:'batch9-large-numb-female-sniffer'},
    {scene:registry.scenes.find(scene=>scene.id==='lakeview'),ids:['sh4_cynthia_velasquez_victim_16','sh4_richard_braintree_victim_19'],captureId:'batch9-cynthia-richard-lakeview'},
    {scene:registry.scenes.find(scene=>scene.id==='alchemilla'),ids:['sh4_hummer_055','sh3_numb_body_small_037'],captureId:'batch10-hummer-small-numb'},
    {scene:registry.scenes.find(scene=>scene.id==='lakeview'),ids:['sh1_romper_010','sh3_slurper_042'],captureId:'batch10-romper-slurper'},
    {scene:registry.scenes.find(scene=>scene.id==='woodside'),ids:['sh1_groaner_003','sh1_split_head_014'],captureId:'batch10-grounded-ko-groaner-split-head'}];
  for(const {scene,ids,captureId=scene.id} of matches){
    const {id:stageId,stageIndex,decor}=scene;
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(base+'/modules/unified-versus.html?qa=1');await page.waitForFunction(()=>!!window.__HALO_QA__);
    for(const [index,id] of ids.entries()){
      const fighter=registry.subjects.find(subject=>subject.id===id).fighter;
      await page.click(index?'#slotP2':'#slotP1');await page.fill('#search',fighter.name);await page.locator(`.fighter-card[data-id="${id}"]`).click();
    }
    await page.click('#openGallery');await page.locator('.stage-entry').nth(stageIndex).click();await page.waitForFunction(()=>document.querySelector('#stageGallery').classList.contains('hidden'));
    await page.selectOption('#mode','local');await page.selectOption('#timer','0');
    if(captureId==='batch10-grounded-ko-groaner-split-head')await page.selectOption('#rounds','1');
    for(const name of ['stageHazards','stageDirector','otherworldShift','fatalities','stageFatalities'])await page.uncheck('#'+name);
    await page.uncheck('#artDiagnostic');
    const touchEnabled=(await page.locator('#mobileP1').textContent()).includes('ACTIF');
    if(touchEnabled!==(stageId==='lakeview'&&ids.includes(twinId)))await page.click('#mobileP1');
    check(stageId+': real menu selects exact PNG profiles and room without diagnostic mode',await page.evaluate(({ids,stageId})=>{const q=__HALO_QA__;return q.selection.p1.id===ids[0]&&q.selection.p2.id===ids[1]&&q.selection.stage.id===stageId&&!document.querySelector('#artDiagnostic').checked;},{ids,stageId}));
    await page.evaluate(()=>{window.__ART_BATCH4_DRAWS__=[];});await page.click('#launch');
    await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='fight'&&!__HALO_QA__.engine.paused);
    const expected=[...ids.map(id=>registry.subjects.find(subject=>subject.id===id).art.frames[0].path),...decor.layers.flatMap(layer=>layer.frames.map(frame=>frame.path))];
    await page.waitForFunction(paths=>paths.every(path=>__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+path&&draw.calls>0)),expected);
    await page.waitForFunction(()=>__HALO_QA__.engine.phase==='fight'&&__HALO_QA__.engine.texts.every(text=>!['intro','round','fight'].includes(text.kind)));
    const combat=await page.evaluate(()=>({phase:__HALO_QA__.engine.phase,stage:__HALO_QA__.engine.stage.id,diagnostic:__HALO_QA__.engine.config.artDiagnostic,camera:__HALO_QA__.engine.presentationCamera,
      actors:__HALO_QA__.engine.actors.map(actor=>({id:actor.data.id,source:actor.data.source,x:actor.x,y:actor.y})),draws:__ART_BATCH4_DRAWS__.filter(draw=>draw.canvas==='game'),actorPins:[...__HALO_QA__.assetCache.pins],stagePins:[...__HALO_QA__.stageAssetCache.pins]}));
    if(captureId.startsWith('batch10-'))(report.combatBatch10??=[]).push(combat);else if(captureId.startsWith('batch9-'))(report.combatBatch9??=[]).push(combat);else if(stageId==='woodside')report.combat=combat;else if(stageId==='alchemilla')report.combatBatch5=combat;else if(stageId==='lakeview')report.combatBatch6=combat;else if(stageId==='shopping_mall')report.combatBatch7=combat;else (report.combatBatch8??=[]).push(combat);
    if(['lakeview','shopping_mall','brookhaven_roof'].includes(stageId)){
      combat.terrain=await page.evaluate(async()=>{const {stageTerrainProfile}=await import('/src/stage-director.js');const stage=__HALO_QA__.engine.stage;return {rules:stage.referencePolicy.terrainRules,profile:stageTerrainProfile(stage)};});
      check(stageId+': actual room terrain is physically neutral rather than inherited wet/slippery rules',combat.terrain.rules===false&&combat.terrain.profile.moveScale===1&&combat.terrain.profile.jumpScale===1&&combat.terrain.profile.dodgeScale===1&&combat.terrain.profile.friction===.84&&combat.terrain.profile.knockbackScale===1&&combat.terrain.profile.guardRegenScale===1&&!combat.terrain.profile.splash&&!combat.terrain.profile.slip,combat.terrain);
    }
    if(stageId==='lakeview'){
      combat.hudTexts=await page.evaluate(()=>__ART_BATCH6_TEXTS__);
      check('Lakeview actual canvas HUD names the lobby carpet and pre-tape phase',combat.hudTexts.some(row=>row.text.includes('TAPIS DU LOBBY'))&&combat.hudTexts.some(row=>row.text.includes('AVANT LA CASSETTE')),combat.hudTexts);
      check('Lakeview actual canvas HUD omits inherited wet-carpet and Fog World labels',combat.hudTexts.every(row=>!row.text.includes('MOQUETTE HUMIDE')&&!row.text.includes('FOG WORLD')),combat.hudTexts);
    }
    if(stageId==='shopping_mall'){
      combat.hudTexts=await page.evaluate(()=>__ART_BATCH6_TEXTS__);
      check('Central Square Mall actual HUD names the normal shopping centre and its floor',combat.hudTexts.some(row=>row.text.includes('CENTRE COMMERCIAL NORMAL'))&&combat.hudTexts.some(row=>row.text.includes('SOL DU CENTRE COMMERCIAL')),combat.hudTexts);
      check('Central Square Mall actual HUD does not invent humidity or Fog World ontology',combat.hudTexts.every(row=>!row.text.includes('MOQUETTE HUMIDE')&&!row.text.includes('BÉTON TREMPÉ')&&!row.text.includes('FOG WORLD')),combat.hudTexts);
    }
    if(stageId==='brookhaven_roof'){
      combat.hudTexts=await page.evaluate(()=>__ART_BATCH6_TEXTS__);
      check('Brookhaven original roof actual HUD names the pre-fall roof and neutral platform',combat.hudTexts.some(row=>row.text.includes('TOIT AVANT LA CHUTE'))&&combat.hudTexts.some(row=>row.text.includes('PLATEAU DU TOIT BROOKHAVEN')),combat.hudTexts);
      check('Brookhaven roof actual HUD does not invent wet concrete, rain or Fog World',combat.hudTexts.every(row=>!row.text.includes('BÉTON TREMPÉ')&&!row.text.includes('PLUIE')&&!row.text.includes('FOG WORLD')),combat.hudTexts);
      check('Brookhaven pre-fall roof keeps fixed phase, no weather, events, hazards or automatic fall',await page.evaluate(()=>{const stage=__HALO_QA__.engine.stage;return stage.weather==='none'&&stage.referencePolicy.worldState==='fixed-normal'&&stage.referencePolicy.automaticFinishers===false&&stage.referencePolicy.allowedEvents.length===0&&stage.referencePolicy.allowedHazards.length===0&&!stage.shift.enabled&&!stage.visibility.fog;}));
    }
    check(stageId+': actual canvas paints both registered images and full cover scenery',!combat.diagnostic&&combat.stage===stageId&&expected.every(path=>combat.draws.some(draw=>draw.path==='/'+path&&draw.width>0&&draw.height>0))&&combat.draws.filter(draw=>draw.path.includes('/assets/stages/')).every(draw=>draw.args.length===8&&draw.args[6]===1280&&draw.args[7]===720),combat);
    const actorPaths=ids.flatMap(id=>registry.subjects.find(subject=>subject.id===id).art.frames.map(frame=>frame.path));
    check(stageId+': combat leases contain exactly all PNGs of the selected two actors and room',combat.actorPins.length===actorPaths.length&&combat.stagePins.length===1&&[...actorPaths,...expected].every(path=>[...combat.actorPins,...combat.stagePins].includes(path)),combat);
    combat.imagePlacement=ids.map(id=>{
      const frame=registry.subjects.find(subject=>subject.id===id).art.frames[0],alpha=report.assets.find(asset=>asset.id===id).alpha.bounds,draw=combat.draws.find(draw=>draw.path==='/'+frame.path);
      const [x,y,w,h]=draw.args,[a,b,c,d,e,f]=draw.transform,project=(u,v)=>({x:a*u+c*v+e,y:b*u+d*v+f}),bounds=frame.visibleBounds||[alpha.minX,alpha.minY,alpha.maxX+1,alpha.maxY+1];
      return {id,boundsKind:frame.visibleBounds?'registered visible envelope; faint alpha tails excluded':'positive-alpha envelope',anchor:project(x+frame.anchor[0]*w,y+frame.anchor[1]*h),visibleCorners:[[bounds[0],bounds[1]],[bounds[2],bounds[1]],[bounds[0],bounds[3]],[bounds[2],bounds[3]]].map(([u,v])=>project(x+u/frame.width*w,y+v/frame.height*h))};
    });
    check(stageId+': actual bitmap anchors and registered visible envelopes fit the live camera',Number.isFinite(combat.camera?.scale)&&combat.camera.scale>0&&combat.imagePlacement.every(image=>[image.anchor,...image.visibleCorners].every(point=>Number.isFinite(point.x)&&Number.isFinite(point.y)&&point.x>=-1&&point.x<=1281&&point.y>=-1&&point.y<=721)),combat.imagePlacement);
    await shot(page,'combat-new-pngs-'+captureId);await page.click('#pauseBtn');
    const frozen=await page.evaluate(()=>({frame:__HALO_QA__.engine.frame,clocks:JSON.stringify(__HALO_QA__.engine.actors.map(actor=>actor.spriteClock))}));
    await page.waitForTimeout(180);
    check(stageId+': genuine pause freezes simulation and static sprite clocks',await page.evaluate(before=>__HALO_QA__.engine.paused&&__HALO_QA__.engine.frame===before.frame&&JSON.stringify(__HALO_QA__.engine.actors.map(actor=>actor.spriteClock))===before.clocks,frozen));await shot(page,'paused-new-art-'+captureId);
    await page.setViewportSize({width:430,height:932});await page.click('[data-pause=resume]');
    await page.waitForFunction(frame=>!__HALO_QA__.engine.paused&&__HALO_QA__.engine.frame>frame,frozen.frame);
    check(stageId+': mobile match fits viewport and retains the real images',await page.evaluate(paths=>{const box=document.querySelector('#game').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth+1&&box.left>=-1&&box.right<=innerWidth+1&&paths.every(path=>__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+path));},expected));await shot(page,'mobile-new-pngs-'+captureId);
    if(stageId==='lakeview'&&ids.includes(twinId)){
      const art=registry.subjects.find(subject=>subject.id===twinId).art,point=art.frames[1].path,idle=art.frames[0].path;
      await page.setViewportSize({width:1440,height:1000});
      await page.locator('.touch-button[data-action=taunt][data-player=p1]').tap();
      await page.waitForFunction(({point,key})=>__HALO_QA__.engine.actors[0].presentation?.clipKey===key&&__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+point),{point,key:twinTaunt});
      await shot(page,'touch-taunt-pointing-twin-victim');
      await page.click('#pauseBtn');
      report.twinPointing=await page.evaluate(()=>({presentation:__HALO_QA__.engine.actors[0].presentation,draws:__ART_BATCH4_DRAWS__.filter(draw=>draw.canvas==='game'&&draw.path.includes('sh4_twin_victim_059'))}));
      check('Twin Victim real touch taunt renders the exact contextual pointing PNG',report.twinPointing.presentation?.clipKey===twinTaunt&&report.twinPointing.draws.some(draw=>draw.path==='/'+point),report.twinPointing);
      await page.click('[data-pause=resume]');
      const idleBefore=await page.evaluate(idle=>__ART_BATCH4_DRAWS__.find(draw=>draw.canvas==='game'&&draw.path==='/'+idle)?.calls||0,idle);
      await page.locator('.touch-button[data-action=light][data-player=p1]').tap();
      await page.waitForFunction(({idle,idleBefore})=>!__HALO_QA__.engine.actors[0].presentation&&__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+idle&&draw.calls>idleBefore),{idle,idleBefore});
      check('a genuine touch attack cancels the pointing presentation and paints idle again',await page.evaluate(()=>__HALO_QA__.engine.actors[0].lastMoveKey==='neutralLight'&&!__HALO_QA__.engine.actors[0].presentation));
      await page.waitForFunction(()=>!__HALO_QA__.engine.actors[0].attack&&__HALO_QA__.engine.actors[0].state==='idle');
      await shot(page,'touch-taunt-cancelled-twin-idle');
    }
    if(captureId.startsWith('batch10-')){
      await page.setViewportSize({width:1440,height:1000});
      const art=registry.subjects.find(subject=>subject.id===ids[0]).art,walk=art.frames[art.clips.walk.frames[0]].path;
      const prior=await page.evaluate(path=>__ART_BATCH4_DRAWS__.find(draw=>draw.canvas==='game'&&draw.path==='/'+path)?.calls||0,walk);
      await page.keyboard.down('ArrowRight');
      await page.waitForFunction(({path,prior})=>__HALO_QA__.engine.actors[0].state==='walk'&&__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+path&&draw.calls>prior),{path:walk,prior});
      await shot(page,captureId+'-real-input-walk');await page.keyboard.up('ArrowRight');
      check(captureId+': genuine movement input selects the dedicated one-frame walk image',await page.evaluate(path=>__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+path&&draw.calls>0),walk));
      if(captureId==='batch10-grounded-ko-groaner-split-head'){
        const contactDistance=await page.evaluate(async()=>{const {bodyPushRadius}=await import('/src/combat-geometry.js');return __HALO_QA__.engine.actors.reduce((n,actor)=>n+bodyPushRadius(actor),0)+4;});
        await page.keyboard.down('ArrowRight');
        await page.waitForFunction(distance=>Math.abs(__HALO_QA__.engine.actors[0].x-__HALO_QA__.engine.actors[1].x)<distance,contactDistance);
        const hurt=art.frames[art.clips.hurt.frames[0]].path,ko=art.frames[art.clips.ko.frames[0]].path;
        report.groundKoBatch10={method:'Actual local match: player1 holds ArrowRight to approach and reengage after hit recoil, player2 repeats F neutralLight; one winning round, no state/health/position injection.',healthTrace:[]};
        for(let attempt=0;attempt<35;attempt++){
          const before=await page.evaluate(()=>({health:__HALO_QA__.engine.actors[0].health,ko:__HALO_QA__.engine.actors[0].ko,grounded:__HALO_QA__.engine.actors[0].grounded,x:__HALO_QA__.engine.actors.map(actor=>actor.x),phase:__HALO_QA__.engine.phase}));report.groundKoBatch10.healthTrace.push(before);
          if(before.ko||before.health<=0)break;
          await page.keyboard.press('f');await page.waitForTimeout(480);
        }
        await page.keyboard.up('ArrowRight');
        await page.waitForFunction(path=>__HALO_QA__.engine.phase==='roundEnd'&&__HALO_QA__.engine.actors[0].ko&&__HALO_QA__.engine.actors[0].grounded&&__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+path),ko);
        report.groundKoBatch10.result=await page.evaluate(async({hurt,ko})=>{const {actorSpriteState,sampleSpriteClip}=await import('/src/sprite-animation.js'),{SPRITES}=await import('/src/sprite-manifest.js');const actor=__HALO_QA__.engine.actors[0],sample=sampleSpriteClip(SPRITES[actor.data.id],actorSpriteState(actor));return {id:actor.data.id,health:actor.health,ko:actor.ko,grounded:actor.grounded,state:actor.state,presentation:actor.presentation,requested:sample.requested,pose:sample.pose,fallback:sample.fallback,fallbackReason:sample.fallbackReason,path:sample.frame.path,paintedHurt:__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+hurt),paintedKo:__ART_BATCH4_DRAWS__.some(draw=>draw.canvas==='game'&&draw.path==='/'+ko),sourceTimingMeasured:false};},{hurt,ko});
        const result=report.groundKoBatch10.result;
        check('batch10 real grounded final KO paints its dedicated core still after genuine non-launching hits',result.health===0&&result.ko&&result.grounded&&result.pose==='ko'&&result.path===ko&&result.paintedHurt&&result.paintedKo&&result.presentation?.key==='loseMatch'&&result.requested===`loseMatch@${ids[0]}:loseMatch`&&result.fallbackReason==='core-ko-final-defeat',result);
        await shot(page,'batch10-real-grounded-final-ko-desktop');await page.setViewportSize({width:430,height:932});await shot(page,'batch10-real-grounded-final-ko-mobile');await page.click('#pauseBtn');
      }
    }
    if(await page.locator('dialog.play-dialog[open] [data-pause=resume]').count())await page.click('[data-pause=resume]');
    await page.click('#leaveFight');await page.waitForFunction(()=>!__HALO_QA__.engine);
  }
  await page.setViewportSize({width:430,height:932});
  await page.goto(base+'/modules/sprite-workshop.html');await selectSubject(page,batch8[0],'sh4');
  check('mobile real inspector fits its controls and keeps the one-frame image static',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)&&await page.locator('[data-inspect=play]').isDisabled());await shot(page,'mobile-static-inspector');
  check('no browser, console or HTTP asset errors',report.errors.length===0,report.errors);await context.close();
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));await browser?.close();server?.kill('SIGTERM');}
