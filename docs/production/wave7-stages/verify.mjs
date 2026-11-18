// From the repository root, run node docs/production/wave7-stages/verify.mjs.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {STAGE_BITMAPS} from '../../../src/stage-bitmap-manifest.js';

const {chromium}=await import(process.env.QA_PLAYWRIGHT_MODULE||'playwright-core');
const root=fileURLToPath(new URL('../../../',import.meta.url));
const out=fileURLToPath(new URL('./captures/',import.meta.url));
await mkdir(out,{recursive:true});
const port=Number(process.env.QA_STAGE_PORT||4297),base='http://127.0.0.1:'+port;
const server=spawn(process.execPath,['scripts/server.mjs',String(port)],{cwd:root,stdio:'ignore'});
let browser;
try{
  let ready=false;
  for(let n=0;n<60&&!ready;n++){
    try{ready=(await fetch(base)).ok;}catch{}
    if(!ready)await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.ok(ready,'game server ready');
  browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});
  const report={browser:browser.version(),resolution:[1280,720],method:'Real FightEngine.render via source HTTP. QA moves both fighters across the arena in 15 fixed steps; frame and world matrix are recorded. Reduced motion and stage-animation preferences are checked at the same endpoints.',stages:[]};
  for(const id of process.argv.slice(2).length ? process.argv.slice(2) : ['lakeside_amusement','room_302','riverside_motel']){
    const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1360,height:850}});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/modules/unified-versus.html?qa=1&stage='+id+'&p1=sh1_mumbler_006&p2=sh2_lying_figure_020');
    await page.waitForFunction(()=>window.__HALO_QA__?.selection.stage);
    await page.selectOption('#mode','local');
    assert.equal(await page.evaluate(()=>__HALO_QA__.startFight()),true);
    const art=STAGE_BITMAPS[id];
    const data=await page.evaluate(({stageId,layers})=>{
      const {engine:e,stageAssetCache:cache}=__HALO_QA__,ctx=e.ctx;
      if(e.stage.id!==stageId)throw Error('stage substitution');
      e.running=false;cancelAnimationFrame(e.animationFrame);
      for(let n=0;n<500&&e.phase==='intro';n++)e.update();
      if(e.phase!=='fight')throw Error('round did not start');
      for(let n=0;n<85;n++)e.update();
      e.settings.reducedMotion=false;e.config.stageAnimations=true;
      const images=layers.map(l=>cache.peek(l.frames[0].path)),checks=[];
      const raw=ctx.drawImage.bind(ctx);
      let trace=[];
      ctx.drawImage=function(image,...args){
        const i=images.indexOf(image);
        if(i>=0)trace.push({plane:layers[i].id,x:args.at(-4),y:args.at(-3),width:args.at(-2),height:args.at(-1)});
        return raw(image,...args);
      };
      function frame(t,save){
        e.actors[0].x=200+t*540;e.actors[1].x=540+t*540;
        trace=[];e.render(0);
        if(trace.length!==2)throw Error('expected two actual raster draws: '+stageId);
        return {t,frame:e.frame,x:e.actors.map(a=>a.x),camera:e.presentationCamera,draws:trace,
          image:save?ctx.canvas.toDataURL('image/jpeg',.90).split(',')[1]:undefined};
      }
      const frames=[];
      for(let n=0;n<15;n++)frames.push(frame(n/14,n===0||n===7||n===14));
      e.settings.reducedMotion=true;const reduced=[frame(0),frame(1)];
      e.settings.reducedMotion=false;e.config.stageAnimations=false;const disabled=[frame(0),frame(1)];
      const transparent=contextImage=>{const c=document.createElement('canvas');c.width=contextImage.naturalWidth;c.height=contextImage.naturalHeight;const p=c.getContext('2d');p.drawImage(contextImage,0,0);const rgba=p.getImageData(0,0,c.width,c.height).data;let clear=0,solid=0;for(let i=3;i<rgba.length;i+=4){if(!rgba[i])clear++;if(rgba[i]>240)solid++;}return {clear,solid,total:rgba.length/4};};
      const alpha=transparent(images[1]),plate=image=>image.draws[0].x,prop=image=>image.draws[1].x,first=frames[0],last=frames.at(-1);
      checks.push(['full background stays fixed in world space',frames.every(f=>plate(f)===plate(first))]);
      checks.push(['near plane shifts independently and monotonically',frames.every((f,i)=>!i||prop(f)<prop(frames[i-1]))]);
      checks.push(['observed displacement agrees with declared depth',Math.abs(prop(first)-prop(last)-1080*layers[1].parallaxX)<.001]);
      checks.push(['near image has genuinely transparent and painted regions',alpha.clear>alpha.total*.12&&alpha.solid>alpha.total*.04]);
      checks.push(['reduced motion retains both images at their neutral placement',prop(reduced[0])===prop(reduced[1])&&prop(reduced[0])===prop(frames[7])]);
      checks.push(['switching off stage animation retains a stable scene',prop(disabled[0])===prop(disabled[1])&&prop(disabled[0])===prop(frames[7])]);
      e.config.stageAnimations=true;frame(0);
      const preview=document.createElement('canvas');preview.width=640;preview.height=360;
      const previewCtx=preview.getContext('2d'),keys=['ArrowRight','KeyD'],walking=[];
      for(const code of keys)window.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));
      for(let step=0;step<21;step++){
        for(let tick=0;tick<6;tick++)e.update();
        trace=[];e.render(0);previewCtx.drawImage(ctx.canvas,0,0,640,360);
        walking.push({tick:e.frame,actors:e.actors.map(a=>a.x),planes:trace.map(d=>d.x),image:preview.toDataURL('image/jpeg',.88).split(',')[1]});
      }
      for(const code of keys)window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));
      checks.push(['both players walk using keyboard input, moving the near plane relative to the background',
        walking.at(-1).actors.every((x,i)=>x>walking[0].actors[i])&&walking.at(-1).planes[0]===walking[0].planes[0]&&walking.at(-1).planes[1]<walking[0].planes[1]]);
      return {stage:stageId,layers:layers.map(l=>l.frames[0].path),checks,alpha,frames,walking,displacement:prop(last)-prop(first)};
    },{stageId:id,layers:art.layers});
    for(const f of data.frames)if(f.image){const path=id+'-'+({0:'left',0.5:'center',1:'right'}[f.t])+'.jpg';await writeFile(out+path,Buffer.from(f.image,'base64'));delete f.image;f.capture=path;}
    const snapshots=data.walking.map(step=>{const encoded=step.image;delete step.image;return encoded;});
    data.playback=id+'-walking.webp';
    const encoder=[
      'import base64,io,json,sys',
      'from PIL import Image',
      'frames=[Image.open(io.BytesIO(base64.b64decode(s))).convert("RGB") for s in json.load(sys.stdin)]',
      'frames[0].save(sys.argv[1],save_all=True,append_images=frames[1:],duration=100,loop=0,quality=81,method=4)'
    ].join('\n');
    execFileSync(process.env.HALO_PYTHON||'python3',['-c',encoder,out+data.playback],{input:JSON.stringify(snapshots)});
    data.checks.push(['no page exceptions',errors.length===0]);
    assert.ok(data.checks.every(c=>c[1]),JSON.stringify(data.checks));
    report.stages.push(data);
    await context.close();
  }
  report.checks=report.stages.reduce((n,s)=>n+s.checks.length,0);
  await writeFile(out+'report.json',JSON.stringify(report,null,2)+'\n');
  console.log('Verified stages:',report.stages.map(s=>s.stage+': '+s.displacement.toFixed(1)+' px').join(', '),'; checks:',report.checks);
}finally{await browser?.close();server.kill('SIGTERM');}
