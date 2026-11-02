/** ART144/ART92 delivery checks over real HTTP, without replacing art or combat state.
 * Numeric framing proves the delivered exterior fits; it cannot prove source anatomy.
 */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {VERSION} from '../src/data.js';
import {ART_CAMPAIGN_BASE,ART_CAMPAIGN_GROUP_SIZES,ART_CONTINUATION_BASE,ART_CONTINUATION_GROUP_SIZES} from './art-campaign-tracking.mjs';
import {readArtContinuation,resolvedHistoricalArtwork} from './art-campaign-review.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const campaign=process.env.QA_ART_CAMPAIGN||'art144';
const spec={art144:{base:ART_CAMPAIGN_BASE,groups:ART_CAMPAIGN_GROUP_SIZES,requested:144,baselineProfiles:86},
 art92:{base:ART_CONTINUATION_BASE,groups:ART_CONTINUATION_GROUP_SIZES,requested:92,baselineProfiles:138}}[campaign];
if(!spec)throw Error('Unknown artwork review campaign.');
const source=process.env.QA_SOURCE_TREE==='1',port=process.env[`QA_${campaign.toUpperCase()}_PORT`]||process.env.QA_ART144_PORT||(campaign==='art92'?(source?'4217':'4216'):(source?'4197':'4196'));
const base=process.env.QA_BASE_URL||`http://127.0.0.1:${port}`;
const out=resolve(process.env[`QA_${campaign.toUpperCase()}_OUTPUT`]||process.env.QA_ART144_OUTPUT||`/tmp/halo-${campaign}-qa-${source?'source':'dist'}`);
const report={schema:1,campaign,version:VERSION,baselineCommit:spec.base,base,
 build:process.env.QA_BASE_URL?'external HTTP':source?'source':'dist',checks:[],errors:[],captures:[],assets:[],inspectors:[],roles:[],duels:[],
 limits:[
  `All ${spec.requested} original missing identities are assessed exactly once. Static candidates, blockers and source fidelity remain separate. Historical blockers may be resolved only by a documented later exact-ID delivery.`,
  'Production PNGs and modules arrive over HTTP. Independent browser decoding measures alpha and duplicate pixels; no replacement imagery is injected.',
  'The real workshop flip, zoom and pose controls inspect the complete delivered exterior. Native anatomy, hidden parts, exact proportions and 1:1 fidelity are not certified by this geometry.',
  'Ordinary local matches cover every new combat-enabled profile on both player sides. Normal inputs and intros are used; actor positions, facing, health, poses, wins and timers are never injected.',
  'Profiles whose source role forbids autonomous combat retain their artwork dossier and remain rejected by both normal and diagnostic launch. A PNG grants no combat capability.',
  'One static non-looping idle is not a walk, attack, KO or native animation. Opposite-side views are presentation mirrors, not independently observed source anatomy.'
 ]};
let server,browser;
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(!passed&&detail!==undefined?{detail}:{})});if(!passed)throw Error(name);};
async function capture(page,name,canvas=false){
 const path=resolve(out,name+'.png');
 if(canvas)await page.locator('#game').screenshot({path});else await page.screenshot({path,fullPage:true});
 report.captures.push(name+'.png');
}
async function selectDossier(page,id,available){
 await page.fill('#spriteSearch','');await page.selectOption('#spriteSource','all');await page.selectOption('#spriteFilter','all');
 await page.fill('#spriteSearch',id);await page.locator(`.sprite-card[data-id="${id}"]`).click();
 await page.waitForFunction(({id,available})=>{const c=document.querySelector('#spriteDetail canvas');return c?.dataset.spriteId===id&&c.dataset.artStatus===(available?'raster':'missing');},{id,available});
}
// This function runs in the browser. The recorded matrix and drawImage arguments
// are observed unchanged, then applied to the image's connected-alpha envelope.
function measuredDrawing({path,bounds,canvas}){
 const draw=window.__ART144_DRAWS__.find(row=>row.path==='/'+path&&row.canvas===canvas);
 if(!draw||draw.args.length!==4)return {missing:true,path,canvas,draw};
 const [x,y,w,h]=draw.args,[a,b,c,d,e,f]=draw.matrix;
 const [left,top,right,bottom]=bounds;
 const points=[[left,top],[right,top],[left,bottom],[right,bottom]].map(([u,v])=>{
  const px=x+u/draw.width*w,py=y+v/draw.height*h;
  return {x:a*px+c*py+e,y:b*px+d*py+f};
 });
 const box={left:Math.min(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),right:Math.max(...points.map(p=>p.x)),bottom:Math.max(...points.map(p=>p.y))};
 const surface=canvas==='game'?document.querySelector('#game'):document.querySelector('#spriteDetail canvas');
 return {path,canvas,box,width:surface.width,height:surface.height,draw,
  complete:Object.values(box).every(Number.isFinite)&&box.left>=-.01&&box.top>=-.01&&box.right<=surface.width+.01&&box.bottom<=surface.height+.01};
}

await mkdir(out,{recursive:true});
try{
 const intake=JSON.parse(await readFile(resolve(root,`docs/production/${campaign}-intake.json`),'utf8'));
 check('immutable intake retains '+spec.requested+' originally absent identities',intake.campaign===campaign&&intake.baseCommit===spec.base&&intake.requested===spec.requested&&intake.baselineProfiles===spec.baselineProfiles&&intake.entries?.length===spec.requested&&new Set(intake.entries.map(row=>row.fighter.id)).size===spec.requested);
 const ledgers=await Promise.all(Object.entries(spec.groups).map(async([group,size])=>{
  const ledger=JSON.parse(await readFile(resolve(root,`docs/production/batches/${campaign}-${group}.json`),'utf8'));
  check(group+': exact assigned campaign and original count',ledger.schema===1&&ledger.campaign===campaign&&ledger.group===group&&ledger.baseCommit===spec.base&&ledger.requestedItems===size&&ledger.items?.length===size);
  return ledger;
 }));
 const rows=ledgers.flatMap(ledger=>ledger.items),ids=rows.map(row=>row.entityId);
 check('all '+spec.requested+' exact idle identities are assessed once',rows.length===spec.requested&&new Set(ids).size===spec.requested&&rows.every(row=>row.rowId===row.entityId+':pose:idle'&&row.collection==='poses'&&['implemented-candidate','blocked'].includes(row.status)&&row.evidence?.length&&row.limits?.trim()));
 check('deliveries assess exactly the immutable intake in their original groups',ledgers.every(ledger=>ledger.items.every(row=>intake.entries.some(original=>original.fighter.id===row.entityId&&original.group===ledger.group&&original.workbookRowId===row.rowId))));
 check('previously refused subjects and related variants remain blocked',intake.entries.filter(entry=>entry.generationExcluded).every(entry=>rows.find(row=>row.entityId===entry.fighter.id)?.status==='blocked'));
 const fragments=await Promise.all(Object.keys(spec.groups).map(async group=>{
  const fragment=JSON.parse(await readFile(resolve(root,`art/fragments/${campaign}-${group}.json`),'utf8'));
  check(group+': exact source-owned fragment is retained',fragment.schema===1&&fragment.campaign===campaign&&fragment.group===group&&fragment.baseCommit===spec.base&&!!fragment.assets);
  return fragment;
 }));
 const fragmentAssets=Object.assign({},...fragments.map(fragment=>fragment.assets));
 const candidates=rows.filter(row=>row.status==='implemented-candidate'),blocked=rows.filter(row=>row.status==='blocked');
 if(campaign==='art144')check('ART144 retains its historical 52 candidates and 92 blockers',candidates.length===52&&blocked.length===92);
 check('fragments contain exactly their declared candidate identities',Object.keys(fragmentAssets).length===candidates.length&&fragments.every(fragment=>Object.keys(fragment.assets).every(id=>ledgers.find(ledger=>ledger.group===fragment.group).items.some(row=>row.entityId===id&&row.status==='implemented-candidate'))));
 report.counts={requested:spec.requested,candidates:candidates.length,blocked:blocked.length,newAnimatedClips:0,certifiedOneToOne:0};
 const continuation=await readArtContinuation(root);
 if(campaign==='art92')check('ART92 requires the complete bound continuation review',!!continuation&&continuation.rows.length===92);
 const candidateIds=new Set(candidates.map(row=>row.entityId));
 if(!process.env.QA_BASE_URL)server=spawn(process.execPath,['scripts/server.mjs',port,...(source?[]:['--dist'])],{cwd:root,stdio:'ignore'});
 let ready=false;for(let i=0;i<80;i++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 check('real HTTP server is ready',ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});report.browser=browser.version();
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000}});
 await context.addInitScript(()=>{
  window.__ART144_DRAWS__=[];
  const original=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
   const canvas=this.canvas.id==='game'?'game':this.canvas.closest?.('#spriteDetail')?'workshop':null;
   if(canvas&&image?.src&&new URL(image.src).pathname.startsWith('/assets/sprites/')){
    const path=new URL(image.src).pathname,m=this.getTransform(),record={path,canvas,args,width:image.naturalWidth,height:image.naturalHeight,matrix:[m.a,m.b,m.c,m.d,m.e,m.f]};
    const index=window.__ART144_DRAWS__.findIndex(row=>row.path===path&&row.canvas===canvas);
    if(index<0)window.__ART144_DRAWS__.push(record);else window.__ART144_DRAWS__[index]=record;
   }
   return original.call(this,image,...args);
  };
 });
 const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
 page.on('console',message=>{if(message.type()==='error')report.errors.push('console: '+message.text());});
 page.on('response',response=>{if(response.status()>=400&&/\/(assets|src|modules)\//.test(new URL(response.url()).pathname))report.errors.push(`HTTP ${response.status()}: ${response.url()}`);});
 await page.goto(base+'/modules/sprite-workshop.html');
 const subjects=await page.evaluate(async ids=>{
  const {SPRITES}=await import('/src/sprite-manifest.js'),{ROSTER,createCombatProfile}=await import('/src/data.js');
  return ids.map(id=>{const fighter=ROSTER.find(f=>f.id===id),art=SPRITES[id];return {id,fighter,art,policy:fighter?createCombatProfile(fighter).referencePolicy:null,
   owners:art?Object.entries(SPRITES).filter(([,other])=>other.frames.some(frame=>frame.path===art.frames[0].path||frame.pixelSHA256===art.frames[0].pixelSHA256)).map(([owner])=>owner):[]};});
 },ids);
 const byId=new Map(subjects.map(subject=>[subject.id,subject]));
 const browserPixels=new Map();
 for(const row of candidates){
  const {id,fighter,art,policy,owners}=byId.get(row.entityId),frame=art?.frames?.[0];
  check(id+': own source image is a single unverified static idle',!!fighter&&art?.fighterId===id&&art.source===fighter.source&&art.status==='integrated-candidate'&&art.fidelity==='unverified'&&art.frames.length===1&&art.animatedClips===0&&Object.keys(art.clips).length===1&&JSON.stringify(art.clips.idle.frames)==='[0]'&&art.clips.idle.loop===false&&art.clips.idle.ticksPerFrame===1&&row.artifacts.includes(frame.path));
  check(id+': no other identity borrows its path or decoded pixels',owners.length===1&&owners[0]===id,owners);
  const fragment=fragmentAssets[id],original=intake.entries.find(entry=>entry.fighter.id===id);
  check(id+': served manifest matches its additive fragment and original edition',fragment?.fighterId===id&&fragment.source===original.fighter.source&&art.source===original.fighter.source&&fragment.frames?.length===1&&fragment.frames[0].path===frame.path&&fragment.frames[0].sha256===frame.sha256&&fragment.frames[0].bytes===frame.bytes);
  const response=await fetch(base+'/'+frame.path),bytes=Buffer.from(await response.arrayBuffer());
  check(id+': exact versioned PNG bytes arrive over HTTP',response.ok&&response.headers.get('content-type')?.includes('image/png')&&bytes.length===frame.bytes&&createHash('sha256').update(bytes).digest('hex')===frame.sha256);
  const decoded=await page.evaluate(async frame=>{
   const image=new Image();image.src='/'+frame.path;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
   let clear=0,opaque=0,left=canvas.width,top=canvas.height,right=0,bottom=0,rawLeft=left,rawTop=top,rawRight=0,rawBottom=0;
   for(let p=0;p<pixels.length;p+=4){const alpha=pixels[p+3],x=(p/4)%canvas.width,y=Math.floor(p/4/canvas.width);
    if(alpha===0){clear++;pixels[p]=pixels[p+1]=pixels[p+2]=0;}
    if(alpha>0){rawLeft=Math.min(rawLeft,x);rawTop=Math.min(rawTop,y);rawRight=Math.max(rawRight,x+1);rawBottom=Math.max(rawBottom,y+1);}
    if(alpha>=32){opaque++;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
   }
   const digest=await crypto.subtle.digest('SHA-256',pixels);
   return {width:canvas.width,height:canvas.height,clear,opaque,visibleBounds:[left,top,right,bottom],alphaBounds:[rawLeft,rawTop,rawRight,rawBottom],pixelSHA256:[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('')};
  },frame);
  check(id+': independent alpha decode matches dimensions and readable body bounds',decoded.width===frame.width&&decoded.height===frame.height&&decoded.clear>0&&decoded.opaque>0&&JSON.stringify(decoded.visibleBounds)===JSON.stringify(frame.visibleBounds)&&JSON.stringify(decoded.alphaBounds)===JSON.stringify(frame.alphaBounds),decoded);
  check(id+': independent browser pixels are unique to this candidate',!browserPixels.has(decoded.pixelSHA256),browserPixels.get(decoded.pixelSHA256));browserPixels.set(decoded.pixelSHA256,id);
  report.assets.push({id,path:frame.path,sha256:frame.sha256,bytes:frame.bytes,decoded});
  await selectDossier(page,id,true);await page.selectOption('[data-inspect=zoom]','0.5');
  check(id+': actual inspector uses idle and disables animation playback',await page.locator('.sprite-inspector').count()===1&&await page.locator('[data-inspect=play]').isDisabled()&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle'&&await page.locator('#spriteDetail canvas').getAttribute('data-frame-index')==='0');
  for(const side of ['right','left']){
   if(side==='left')await page.click('[data-inspect=flip]');
   const geometry=await page.evaluate(measuredDrawing,{path:frame.path,bounds:frame.framingBounds||frame.visibleBounds,canvas:'workshop'});
   check(id+': complete delivered exterior fits the real '+side+' workshop view',geometry.complete,geometry);
   report.inspectors.push({id,side,zoom:.5,geometry});await capture(page,'inspector-'+id+'-'+side);
  }
  await page.selectOption('[data-inspect=pose]','walk');
  check(id+': absent walk remains an explicit static idle preview',await page.locator('#spriteDetail canvas').getAttribute('data-requested-pose')==='walk'&&await page.locator('#spriteDetail canvas').getAttribute('data-pose')==='idle'&&await page.locator('[data-inspect=play]').isDisabled()&&/À PRODUIRE/.test(await page.locator('[data-inspect=status]').textContent()));
  const duelLinks=await page.locator('#spriteDetail a[href*="unified-versus"]').count(),imageLinks=await page.locator('#spriteDetail a[href*="assets/sprites/"]').count();
  check(id+': dossier keeps its original combat role',imageLinks===1&&(policy.combatEnabled?duelLinks===1:duelLinks===0&&await page.locator('[data-reference-only]').count()===1),{policy,duelLinks,imageLinks});
  if(row.rolePreserved!==undefined)check(id+': ledger role agrees with source policy',row.rolePreserved===policy.role&&row.combatEnabledPreserved===policy.combatEnabled,{row,policy});
  report.roles.push({id,role:policy.role,combatEnabled:policy.combatEnabled});
 }
 for(const row of blocked){
  const subject=byId.get(row.entityId);
  if(resolvedHistoricalArtwork(row,subject?.art,continuation)){
   check(row.entityId+': historical blocker has an exact later source-owned delivery',true);
   (report.resolvedHistorical||=[]).push({id:row.entityId,originalStatus:'blocked',laterCampaign:'art92'});continue;
  }
  check(row.entityId+': blocker has a specific reason and no imported image',!!subject?.fighter&&!subject.art&&!fragmentAssets[row.entityId]&&!!row.reason?.trim());
  await selectDossier(page,row.entityId,false);
  check(row.entityId+': real missing dossier has no substituted image, inspector or duel',await page.locator('#spriteDetail canvas').getAttribute('data-art-status')==='missing'&&await page.locator('.sprite-inspector').count()===0&&await page.locator('#spriteDetail a').count()===0);
 }
 for(const subject of subjects.filter(subject=>candidateIds.has(subject.id)&&subject.art&&!subject.policy.combatEnabled)){
  await page.goto(base+`/modules/unified-versus.html?qa=1&p1=${encodeURIComponent(subject.id)}&p2=sh2_bubble_head_nurse_024`);
  await page.waitForFunction(id=>window.__HALO_QA__?.selection.p1.id===id,subject.id);await page.selectOption('#mode','local');
  for(const diagnostic of [false,true]){
   await page.locator('#artDiagnostic').setChecked(diagnostic);await page.click('#launch');
   await page.waitForFunction(()=>!document.querySelector('#launch').disabled);
   check(subject.id+': illustrated noncombatant rejects '+(diagnostic?'diagnostic':'normal')+' duel',await page.evaluate(()=>!__HALO_QA__.engine)&&/rôle non combattant|identité à confirmer/.test(await page.locator('#spriteLaunchStatus').textContent()));
  }
 }
 const playable=subjects.filter(subject=>candidateIds.has(subject.id)&&subject.art&&subject.policy.combatEnabled),pairs=[];
 for(let i=0;i<playable.length;i+=2)pairs.push([playable[i].id,playable[i+1]?.id||'sh2_bubble_head_nurse_024']);
 report.counts.combatEnabledCandidates=playable.length;report.counts.referenceOnlyCandidates=candidates.length-playable.length;
 if(campaign==='art144')check('ART144 still exercises its original 39 combatants and 13 source dossiers',playable.length===39&&candidates.length-playable.length===13);
 for(const pair of pairs)for(const ids of [pair,[...pair].reverse()]){
  await page.goto(base+`/modules/unified-versus.html?qa=1&p1=${encodeURIComponent(ids[0])}&p2=${encodeURIComponent(ids[1])}`);
  await page.waitForFunction(()=>!!window.__HALO_QA__);
  for(const [index,id] of ids.entries()){
   check('menu selects '+id+' in slot '+(index+1),await page.evaluate(({id,index})=>__HALO_QA__.selection[index?'p2':'p1'].id===id,{id,index}));
  }
  await page.selectOption('#mode','local');await page.selectOption('#timer','0');
  for(const name of ['stageHazards','stageDirector','otherworldShift','fatalities','stageFatalities'])await page.uncheck('#'+name);
  await page.uncheck('#artDiagnostic');await page.click('#launch');
  await page.waitForFunction(()=>__HALO_QA__.engine?.phase==='fight'&&!__HALO_QA__.engine.paused&&__HALO_QA__.engine.texts.every(text=>!['intro','round','fight'].includes(text.kind)));
  const actual=await page.evaluate(async()=>{
   const {SPRITES}=await import('/src/sprite-manifest.js'),e=__HALO_QA__.engine;
   return {phase:e.phase,diagnostic:e.config.artDiagnostic,camera:e.presentationCamera,actors:e.actors.map(actor=>({id:actor.data.id,facing:actor.facing,path:SPRITES[actor.data.id].frames[0].path,bounds:SPRITES[actor.data.id].frames[0].framingBounds||SPRITES[actor.data.id].frames[0].visibleBounds})),pins:[...__HALO_QA__.assetCache.pins]};
  });
  check('ordinary match paints exact ordered pair '+ids.join('/'),!actual.diagnostic&&actual.actors.every((actor,index)=>actor.id===ids[index]&&actor.facing===(index?-1:1)&&actual.pins.includes(actor.path)),actual);
  actual.geometry=[];
  for(const actor of actual.actors){const geometry=await page.evaluate(measuredDrawing,{path:actor.path,bounds:actor.bounds,canvas:'game'});check(actor.id+': complete exterior fits the normal '+(actor.facing===1?'right':'left')+' combat view',geometry.complete,geometry);actual.geometry.push(geometry);}
  report.duels.push(actual);await capture(page,'duel-'+ids.join('--'),true);
  await page.click('#pauseBtn');const tick=await page.evaluate(()=>__HALO_QA__.engine.frame);await page.waitForTimeout(80);check('real pause freezes the inspected match '+ids.join('/'),await page.evaluate(tick=>__HALO_QA__.engine.frame===tick,tick));
  await page.keyboard.press('Escape');await page.click('#leaveFight');await page.waitForFunction(()=>!__HALO_QA__.engine);
 }
 check('every new playable candidate is observed on both player sides',playable.every(subject=>report.duels.some(duel=>duel.actors[0].id===subject.id)&&report.duels.some(duel=>duel.actors[1].id===subject.id)));
 await page.setViewportSize({width:430,height:932});await page.goto(base+'/modules/sprite-workshop.html');
 if(candidates.length){await selectDossier(page,candidates[0].entityId,true);await page.selectOption('[data-inspect=zoom]','0.5');check('mobile workshop stays within viewport width',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await capture(page,'mobile-inspector');}
 check('no uncaught browser, console or HTTP asset errors',report.errors.length===0,report.errors);await context.close();
}catch(error){report.failure=String(error);process.exitCode=1;}
finally{
 report.passed=!report.failure&&!report.errors.length;await writeFile(resolve(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({passed:report.passed,build:report.build,counts:report.counts,checks:report.checks.length,captures:report.captures.length,report:resolve(out,'report.json'),...(report.failure?{failure:report.failure}:{})}));
 await browser?.close();server?.kill('SIGTERM');
}
