/** Normal story selection/first chapter plus a separately labelled ending component check. */
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {storyArtwork} from '../../../../src/story-art.js';
import {storyPlan} from '../../../../src/tournament.js';
const port=4293,base='http://127.0.0.1:'+port,out='tests/http-wave30-story',id='sh1_air_screamer_001';
const art=storyArtwork(id),digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const report={schemaVersion:1,wave:30,passed:false,checks:[],captures:[],errors:[],
 method:'Actual built HTTP app: ordinary story selection, first-chapter launch, return to selection, owner switch through roster controls and explicit checkpoint resume. Ending rendered separately through the production story helper and setChronicleImage; no completed run injected into the game.',
 limits:['The entire four-fight story is not played to completion.','Ending component checks do not establish a played campaign result.','Headless Chromium; service workers blocked, offline update not exercised.','Static original-compatible compositions, no1:1 certification.']};
const check=(name,passed,detail)=>{report.checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)throw Error(name);};
let server,browser;
await mkdir(out,{recursive:true});
async function capture(page,selector,file,scope){const bytes=await page.locator(selector).screenshot();await writeFile(out+'/'+file,bytes);report.captures.push({file,scope,bytes:bytes.length,sha256:digest(bytes)});}
try{
 let occupied=false;try{await fetch(base,{signal:AbortSignal.timeout(500)});occupied=true;}catch{}
 check('Dedicated HTTP port unused',!occupied);
 server=spawn(process.execPath,['scripts/server.mjs',String(port),'--dist'],{stdio:'ignore'});
 let ready=false;for(let n=0;n<100;n++){try{if((await fetch(base)).ok){ready=true;break;}}catch{}await new Promise(done=>setTimeout(done,100));}
 check('Built HTTP app ready',ready);
 browser=await chromium.launch({headless:true,executablePath:process.env.QA_BROWSER_EXECUTABLE||undefined});
 report.browser=browser.version();
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1100}});
 const page=await context.newPage();page.on('pageerror',error=>report.errors.push(String(error)));
 const responses=[],pending=[];
 page.on('response',response=>{const path=new URL(response.url()).pathname;const frame=[art.intro,art.ending].find(f=>'/'+f.path===path);if(frame)pending.push(response.body().then(bytes=>responses.push({path,status:response.status(),bytes:bytes.length,sha256:digest(bytes)})));});
 await page.goto(base+'/modules/unified-versus.html?qa=1&mode=story&p1='+id,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>{const image=document.querySelector('#storyPreview');return image&&!image.hidden&&image.complete&&image.naturalWidth>0;});
 const selected=await page.locator('#storyPreview').evaluate(img=>({src:new URL(img.src).pathname,width:img.naturalWidth,height:img.naturalHeight,alt:img.alt}));
 check('Exact original Air Screamer introduction displayed',selected.src==='/'+art.intro.path&&selected.width===1672&&selected.height===941,selected);
 check('Accessible story image description present',selected.alt===art.intro.alt);
 check('Four original encounters remain listed',await page.locator('#modePanel .mode-path li').count()===4);
 await capture(page,'.story-preview','selection-intro.png','normal-story-selection');
 await page.locator('#launch').click();
 await page.waitForFunction(()=>{const panel=document.querySelector('#chronicleOpening'),image=panel?.querySelector('img');return panel&&!panel.hidden&&image&&!image.hidden&&image.complete&&image.naturalWidth>0;},null,{timeout:30000});
 const opening=await page.locator('#chronicleOpening').evaluate(panel=>({src:new URL(panel.querySelector('img').src).pathname,title:panel.querySelector('strong').textContent,caption:panel.querySelector('p').textContent}));
 check('First story chapter displays the bound introduction',opening.src==='/'+art.intro.path&&opening.title===art.intro.title&&opening.caption===art.intro.caption,opening);
 await capture(page,'#chronicleOpening','first-chapter-intro.png','normal-first-chapter');
 await page.waitForFunction(()=>window.__HALO_QA__?.engine?.phase==='fight'&&document.querySelector('#chronicleOpening')?.hidden===true,null,{timeout:30000});
 check('Opening yields to ordinary fighting phase',await page.locator('#chronicleOpening').evaluate(el=>el.hidden));

 // Return through the real UI before switching owners: a fresh navigation would
 // miss a stale in-memory run leaking its plan or artwork into the new selection.
 await page.locator('#leaveFight').click();
 const retainedRun=await page.evaluate(()=>window.__HALO_QA__.run);
 const otherId='bom_air_screamer_121',otherPlan=storyPlan(otherId);
 await page.locator('#slotP1').click();
 await page.locator('#sourceFilter').selectOption('bom');
 await page.locator('#search').fill('Air Screamer');
 await page.locator('.fighter-card[data-id="'+otherId+'"]').click();
 const switched=await page.evaluate(()=>({
   playerId:window.__HALO_QA__.selection.p1.id,
   opponentId:window.__HALO_QA__.selection.p2.id,
   stageId:window.__HALO_QA__.selection.stage.id,
   title:document.querySelector('#modePanel h3')?.textContent,
   chapters:document.querySelectorAll('#modePanel .mode-path li').length,
   imageCount:document.querySelectorAll('#storyPreview').length,
   retainedRun:window.__HALO_QA__.run
 }));
 check('Changing P1 after return to selection displays the new owner route',switched.playerId===otherId&&switched.opponentId===otherPlan.queue[0]&&switched.stageId===otherPlan.stages[0]&&switched.title===otherPlan.title&&switched.chapters===otherPlan.chapterCount,switched);
 check('Book of Memories Air Screamer does not borrow SH1 artwork after owner switch',switched.imageCount===0);
 check('Changing selection preserves the original run for explicit resume',retainedRun?.playerId===id&&JSON.stringify(switched.retainedRun)===JSON.stringify(retainedRun));
 await page.locator('#resumeCheckpoint').click();
 await page.waitForFunction(playerId=>window.__HALO_QA__?.selection?.p1?.id===playerId&&window.__HALO_QA__?.run?.playerId===playerId&&window.__HALO_QA__?.engine?.phase==='fight',id,{timeout:30000});
 const resumed=await page.evaluate(()=>({playerId:window.__HALO_QA__.run.playerId,queue:window.__HALO_QA__.run.queue,stages:window.__HALO_QA__.run.stages,index:window.__HALO_QA__.run.index}));
 check('Explicit resume restores the original SH1 owner and unchanged route',resumed.playerId===id&&resumed.index===retainedRun.index&&JSON.stringify(resumed.queue)===JSON.stringify(retainedRun.queue)&&JSON.stringify(resumed.stages)===JSON.stringify(retainedRun.stages),resumed);

 // Isolated production component; this page does not create or inject a game run.
 const endingPage=await context.newPage();endingPage.on('pageerror',error=>report.errors.push(String(error)));
 await endingPage.goto(base+'/offline.html',{waitUntil:'domcontentloaded'});
 const endingContract=await endingPage.evaluate(async(playerId)=>{
   const {storyArtwork,storyEndingArtwork}=await import('/src/story-art.js');
   const {setChronicleImage}=await import('/src/chronicle-art.js');
   const scene=storyEndingArtwork({mode:'story',playerId,status:'complete'});
   const figure=document.createElement('figure');figure.id='storyEndingComponent';figure.style.cssText='width:720px;max-width:90vw;background:#151612;color:#deded5;padding:16px;margin:20px';
   const image=document.createElement('img');image.style.cssText='display:block;width:100%;height:auto';figure.append(image);
   const caption=document.createElement('figcaption');caption.textContent=scene.caption;figure.append(caption);document.body.replaceChildren(figure);setChronicleImage(image,scene);
   return {path:scene.path,won:storyEndingArtwork({mode:'story',playerId,status:'won'}),lost:storyEndingArtwork({mode:'story',playerId,status:'lost'}),other:storyArtwork('bom_air_screamer_121')};
 },id);
 check('Ending requires completed exact-owner story',endingContract.path===art.ending.path&&endingContract.won===null&&endingContract.lost===null&&endingContract.other===null,endingContract);
 await endingPage.waitForFunction(()=>{const image=document.querySelector('#storyEndingComponent img');return image&&!image.hidden&&image.complete&&image.naturalWidth===1672;});
 await capture(endingPage,'#storyEndingComponent','ending-component.png','isolated-production-component-not-played-ending');
 const endingResponse=await endingPage.request.get(base+'/'+art.ending.path),endingBytes=await endingResponse.body();
 check('Ending fetched byte-for-byte over HTTP',endingResponse.status()===200&&endingBytes.length===art.ending.bytes&&digest(endingBytes)===art.ending.sha256);
 await Promise.all(pending);
 check('Introduction fetched byte-for-byte over HTTP',responses.some(r=>r.path==='/'+art.intro.path&&r.status===200&&r.bytes===art.intro.bytes&&r.sha256===art.intro.sha256),responses);
 check('No unhandled browser errors',report.errors.length===0,report.errors);
 report.passed=true;
}catch(error){report.failure=String(error.stack||error);process.exitCode=1;}
finally{await browser?.close();server?.kill('SIGTERM');await writeFile(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({scope:'wave30-story',passed:report.passed,checks:report.checks.length,captures:report.captures.length,failure:report.failure}));}
