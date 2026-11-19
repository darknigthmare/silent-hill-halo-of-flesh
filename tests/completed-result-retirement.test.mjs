import test,{after,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {STAGES,getFighter,getStage,createCombatProfile} from '../src/data.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {SpriteCache,combatSpriteFor,retainedCombatFrames,shouldRetireCompletedCombat} from '../src/sprite-system.js';
import {StageBitmapCache,stageBitmapFrames,pinCombatAssets,captureCombatAssetPins,prepareCombatAssets} from '../src/stage-bitmaps.js';
import {createRun,settleRun,resumeRun,validateRun,CHRONICLE_ENCOUNTER_FORMAT} from '../src/run-progress.js';
import {TOURNAMENT_ROUNDS,storyPlan} from '../src/tournament.js';
import {FightEngine} from '../src/fight.js';

const source=await readFile(new URL('../src/versus.js',import.meta.url),'utf8');
const nurse='origins_faceless_nurse',scraper='arcade_scraper_arcade',lurker='homecoming_lurker_085';
// Native wave18 dimensions make this a deterministic 60MiB pair / 66MiB
// transition fixture even when later production adds more animation frames.
const sizes={
 [nurse]:[[1199,1312],[1199,1312],[1108,1420],[1199,1312],[1199,1312],[1199,1312]],
 [scraper]:[[1217,1293],[1216,1293],[1117,1409],[1116,1409]]
};
const originals=new Map(Object.keys(sizes).map(id=>[id,SPRITES[id]]));
function fixtureArt(id){
 const art=structuredClone(originals.get(id));
 art.frames=sizes[id].map(([width,height],index)=>({...art.frames[0],path:`fixture:${id}:${index}`,width,height}));
 art.clips={idle:{frames:[0],ticksPerFrame:1,loop:false}};return art;
}
function installFixture(){for(const id of Object.keys(sizes))SPRITES[id]=fixtureArt(id);}
installFixture();after(()=>{for(const [id,art] of originals)SPRITES[id]=art;});
const frames=ids=>ids.flatMap(id=>combatSpriteFor(getFighter(id)).frames);
const bytes=images=>[...new Map(images.map(f=>[f.path,f])).values()].reduce((n,f)=>n+f.width*f.height*4,0);
const wonRun=()=>settleRun(createRun({mode:'tournament',playerId:nurse,seed:231}),{winnerIndex:0,stats:{winner:{healthRatio:1}}});
const settledEngine=()=>({phase:'matchEnd',destroyed:false,isPresentingOutro:()=>false,actors:[
 {data:getFighter(nurse),grounded:true,presentation:{key:'outro',complete:true,frame:89}},
 {data:getFighter(lurker),grounded:true,ko:true,presentation:{key:'loseMatch',complete:true,frame:144}}
]});

test('generated tournament231 admits the next pair but needs to retire the visible Lurker result',()=>{
 const won=wonRun(),next=resumeRun(won),engine=settledEngine(),retained=retainedCombatFrames(engine),pair=frames([next.playerId,next.queue[next.index]]),cache=new SpriteCache();
 assert.deepEqual(won.queue,[lurker,scraper,'origins_the_butcher_081']);
 assert.ok(validateRun(won));assert.ok(validateRun(next));assert.equal(won.status,'won');assert.equal(next.index,1);
 assert.equal(bytes(pair),62923864);assert.equal(bytes([...pair,...retained]),69218016);
 assert.doesNotThrow(()=>cache.validatePins(pair));assert.throws(()=>cache.validatePins([...pair,...retained]),/budget/);
 assert.equal(shouldRetireCompletedCombat(engine,pair,{settled:true,resultVisible:true,retainedFrames:retained,cache}),true);
 assert.equal(engine.destroyed,false,'the decision does not mutate the engine or its lease');
});

test('hidden, unsettled, live, reversible, active-outro and oversized cold replacements keep their old result',()=>{
 const engine=settledEngine(),retained=retainedCombatFrames(engine),pair=frames([nurse,scraper]),cache=new SpriteCache();
 const options={settled:true,resultVisible:true,retainedFrames:retained,cache};
 for(const [subject,changes,next] of [
  [engine,{resultVisible:false},pair],[engine,{settled:false},pair],
  [{...engine,phase:'fight'},{},pair],[{...engine,phase:'roundEnd'},{},pair],
  [{...engine,isPresentingOutro:()=>true},{},pair],[{...engine,destroyed:true},{},pair],
  [engine,{},[...pair,{...pair[0],path:'cold-eleventh-frame'}]],
  [engine,{},[{...pair[0],width:NaN}]],
  [engine,{retainedFrames:[{path:'invalid-retired-frame'}]},pair],
  [engine,{},frames([nurse,'origins_the_butcher_081'])]
 ])assert.equal(shouldRetireCompletedCombat(subject,next,{...options,...changes}),false);
 assert.equal(cache.pins.size,0);
});

function cacheHarness(Type=SpriteCache,options={}){
 const failures=new Set();let cache,peak=0;
 cache=new Type({url:path=>path,timeout:1000,...options,createImage:()=>{
  peak=Math.max(peak,cache.bytes+cache.reservedBytes);
  const image={decode:async()=>{}};
  Object.defineProperty(image,'src',{set(path){const frame=cache.entries.get(path).frame;
   image.naturalWidth=frame.width;image.naturalHeight=frame.height;
   queueMicrotask(()=>failures.has(path)?image.onerror?.():image.onload?.());
  }});return image;
 }});return {cache,failures,get peak(){return peak;}};
}
function element(hidden=false){
 const names=new Set(hidden?['hidden']:[]),attributes=new Map();
 return {checked:true,value:'2',disabled:false,style:{},textContent:'',focus(){},
  classList:{contains:name=>names.has(name),add:name=>names.add(name),remove:name=>names.delete(name),toggle(name,on){if(on)names.add(name);else names.delete(name);}},
  setAttribute(name,value){attributes.set(name,value);},removeAttribute(name){attributes.delete(name);}};
}
const section=(start,end)=>{const from=source.indexOf(start);assert.ok(from>=0);const to=source.indexOf(end,from);assert.ok(to>from);return source.slice(from,to);};
// Execute the actual UI transaction and its two result controls, without
// starting the browser/DOM module or duplicating its commit/rollback logic.
const uiSource=[section('function showSelect()','function fightConfig()'),
 section('async function startFight(','function installQaBridge()'),
 section('function continueRun()','function refreshControlHelp(')].join('\n')+'\n({startFight,continueRun,showSelect});';
const engines=new Set();
afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();installFixture();});

async function uiHarness({fitting=false,globalFailure=false,finalFailure=true,afterGlobal,visible=true,fightVisible=true,settled=true,phase='matchEnd',outro=false}={}){
 if(fitting)SPRITES[scraper].frames.pop();
 const storage=new Map(),cancelled=[],canvasCalls=[];
 globalThis.window={};globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
 globalThis.requestAnimationFrame=()=>17;globalThis.cancelAnimationFrame=id=>cancelled.push(id);
 const context=new Proxy({},{get:(_,key)=>(...args)=>{canvasCalls.push([key,...args]);},set:()=>true});
 const canvas={...element(),getContext:()=>context};
 let width=1280,height=720;
 Object.defineProperties(canvas,{width:{get:()=>width,set:v=>{canvasCalls.push(['width',v]);width=v;}},height:{get:()=>height,set:v=>{canvasCalls.push(['height',v]);height=v;}}});
 const won=wonRun(),old=new FightEngine(canvas,{p1:getFighter(nurse),p2:getFighter(lurker),stage:getStage(won.stages[0]),mode:'local',roundsToWin:1,seed:231});
 engines.add(old);old.phase='fight';old.clearPresentations();old.actors[1].ko=true;old.actors[1].health=0;
 old.endRound(old.actors[0],'K.O.');old.finishRoundTransition();old.seekPresentations(old.presentationSequence.duration);
 old.phase=phase;if(outro){old.winner.presentation.complete=false;old.winner.presentation.stagingDuration=90;}
 old.running=true;old.animationFrame=17;
 canvasCalls.length=0;const saved=JSON.stringify(won);storage.set('won-checkpoint',saved);
 const state={engine:old,run:won,p1:getFighter(nurse),p2:getFighter(lurker),stage:getStage(won.stages[0]),spriteLease:0,loadingSprites:false,settled,generation:1,lastResult:{winnerIndex:0},matchId:'settled-231',controls:{},touchEnabled:false};
 const els=new Proxy({game:canvas,result:element(!visible),fightScreen:element(!fightVisible),selectScreen:element(true),launch:element(),continueRun:element(),resultSelect:element()},{get(object,key){return object[key]??=element();}});
 const actor=cacheHarness(),decor=cacheHarness(StageBitmapCache,{registry:{}}),options={fighterCache:actor.cache,stageCache:decor.cache};
 // A small registered old-stage layer proves both independent leases release.
 const oldStage=old.stage,sha='1'.repeat(64);
 decor.cache.registry[oldStage.id]={stageId:oldStage.id,source:oldStage.source,status:'integrated-candidate',fidelity:'unverified',mode:'replace',layers:[{id:'fixture',rect:[0,0,1,1],ticksPerFrame:1,loop:false,frames:[{path:`assets/stages/${oldStage.id}.fixture.${sha.slice(0,12)}.png`,sha256:sha,bytes:80,width:2,height:2}]}]};
 pinCombatAssets([state.p1,state.p2],[state.stage],options);assert.equal((await prepareCombatAssets([state.p1,state.p2],[state.stage],options)).ok,true);
 const oldImages=retainedCombatFrames(old).map(frame=>[frame.path,actor.cache.peek(frame.path)]);
 const stageImages=stageBitmapFrames([old.stage],decor.cache.registry).map(frame=>[frame.path,decor.cache.peek(frame.path)]);
 let calls=0,commits=0,saveWrites=0;const failures=[],announcements=[],prepared=[],decisions=[];
 const flow={announcementId:0,announce:message=>announcements.push(message),clearAnnouncement(){},close(){},syncPause(){}};
 const sandbox={state,els,flow,preset:'tournament',params:new URLSearchParams(),RUN_PRESETS:['tournament'],
  selectedRules:()=>won.rules,$:id=>id==='#artDiagnostic'?{checked:false}:els.spriteLaunchStatus,
  getFighter,getStage,STAGES,createCombatProfile,createRun,resumeRun,renderChronicleDossiers(){},
  retainedCombatFrames,combatSpriteFor,
  shouldRetireCompletedCombat:(engine,images,value)=>{
   const retire=shouldRetireCompletedCombat(engine,images,{...value,cache:actor.cache});
   decisions.push({retire,phase:engine?.phase,outro:engine?.isPresentingOutro(),settled:value.settled,visible:value.resultVisible,nextBytes:bytes(images),unionBytes:bytes([...images,...value.retainedFrames])});return retire;
  },
  stageBitmapCache:decor.cache,stageBitmapFrames:stages=>stageBitmapFrames(stages,decor.cache.registry),
  pinCombatAssets:(fighters,stages,value={})=>pinCombatAssets(fighters,stages,{...options,...value}),
  captureCombatAssetPins:()=>captureCombatAssetPins(options),
  prepareCombatAssets:async(fighters,stages,value)=>{
   calls++;prepared.push({call:calls,retired:old.destroyed,fighters:fighters.map(f=>f.id)});
   if(calls===1&&globalFailure)return {ok:false,missing:[],failed:['global-fixture']};
   if(calls===2&&finalFailure){
    const missing=fighters.flatMap(f=>combatSpriteFor(f).frames).find(f=>actor.cache.status(f.path)!=='ready');
    assert.ok(missing,'LRU preflight really evicted a next-pair image');actor.failures.add(missing.path);failures.push(missing.path);
   }
   const result=await prepareCombatAssets(fighters,stages,{...options,...value});
   if(calls===1)afterGlobal?.(state);return result;
  },
  activateRun:run=>{commits++;state.run=run;state.p1=getFighter(run.playerId);},
  saveRun:run=>{saveWrites++;storage.set('won-checkpoint',JSON.stringify(run));return true;},
  clearTimeout,showFight:()=>{els.selectScreen.classList.add('hidden');els.fightScreen.classList.remove('hidden');els.result.classList.add('hidden');},
  currentRitualId:()=> 'none',currentRitual:()=>({name:'NONE'}),TOURNAMENT_ROUNDS,storyPlan,CHRONICLE_ENCOUNTER_FORMAT,
  refreshControlHelp(){},saveLastFront(){},fightConfig:()=>({p1:state.p1,p2:state.p2,stage:state.stage,mode:'local',callbacks:{},seed:231}),
  FightEngine:class extends FightEngine{constructor(...args){super(...args);engines.add(this);}},
  renderSelected(){},renderRoster(){},checkpointNotice(){}
 };
 const ui=vm.runInNewContext(uiSource,sandbox);
 return {ui,state,els,old,actor,decor,storage,saved,cancelled,canvasCalls,oldImages,stageImages,failures,prepared,decisions,announcements,get commits(){return commits;},get saveWrites(){return saveWrites;}};
}

test('failed final decode freezes the displayed canvas, keeps won bytes and permits one successful Continue retry',async()=>{
 const h=await uiHarness();const oldRun=h.state.run,oldResult=h.state.lastResult,canvasBefore=JSON.stringify(h.canvasCalls);
 assert.equal(await h.ui.continueRun(),false);
 assert.equal(h.prepared.length,2);assert.equal(h.prepared[0].retired,false);assert.equal(h.prepared[1].retired,true,'retirement happens only after global preflight: '+JSON.stringify(h.decisions));
 assert.equal(h.state.engine,h.old);assert.equal(h.old.destroyed,true);assert.ok(h.cancelled.includes(17));
 assert.equal(JSON.stringify(h.canvasCalls),canvasBefore,'actual FightEngine.destroy neither draws nor resizes the retained canvas');
 assert.equal(h.state.run,oldRun);assert.equal(h.state.lastResult,oldResult);assert.equal(h.state.matchId,'settled-231');assert.equal(h.state.generation,1);
 assert.equal(h.storage.get('won-checkpoint'),h.saved);assert.equal(h.commits,0);assert.equal(h.saveWrites,0);
 assert.equal(h.els.result.classList.contains('hidden'),false);assert.equal(h.els.continueRun.classList.contains('hidden'),false);assert.equal(h.state.loadingSprites,false);
 assert.equal(h.actor.cache.pins.size,0);assert.equal(h.decor.cache.pins.size,0,'failed final preflight restores the empty retired lease');
 h.actor.failures.clear();assert.equal(await h.ui.continueRun(),true);
 assert.equal(h.commits,1);assert.equal(h.saveWrites,1);assert.equal(h.state.run.index,1);assert.equal(h.state.run.status,'ready');assert.equal(h.state.run.wins,1);
 assert.notEqual(h.state.engine,h.old);assert.equal(h.els.result.classList.contains('hidden'),true);
 assert.equal(h.actor.cache.maxBytes,64*1024*1024);assert.ok(h.actor.peak<=h.actor.cache.maxBytes);
});

test('selection remains available after the completed result was retired and decoding failed',async()=>{
 const h=await uiHarness();assert.equal(await h.ui.continueRun(),false);h.ui.showSelect();
 assert.equal(h.state.engine,null);assert.equal(h.els.selectScreen.classList.contains('hidden'),false);
 assert.equal(h.storage.get('won-checkpoint'),h.saved);assert.equal(h.state.run.status,'won');assert.equal(h.saveWrites,0);
});

test('a fitting transition keeps the live result and its actor/stage rollback on final decode failure',async()=>{
 const h=await uiHarness({fitting:true});assert.equal(await h.ui.continueRun(),false);
 assert.equal(h.prepared.length,2);assert.equal(h.prepared[1].retired,false);assert.equal(h.old.destroyed,false);
 for(const [path,image] of h.oldImages)assert.equal(h.actor.cache.peek(path),image);
 for(const [path,image] of h.stageImages)assert.equal(h.decor.cache.peek(path),image);
 assert.deepEqual([...h.actor.cache.pins],h.oldImages.map(([path])=>path));assert.deepEqual([...h.decor.cache.pins],h.stageImages.map(([path])=>path));
 assert.equal(h.storage.get('won-checkpoint'),h.saved);
});

test('startFight does not retire before global success or after a stale lease/selection, or for an unrevealed/live/outro result',async()=>{
 for(const options of [{globalFailure:true},{afterGlobal:state=>state.spriteLease++},
  {afterGlobal:state=>{state.p2=getFighter('origins_the_butcher_081');}},
  {visible:false},{fightVisible:false},{settled:false},{phase:'fight'},{phase:'roundEnd'},{outro:true}]){
  installFixture();const h=await uiHarness({...options,finalFailure:false});
  assert.equal(await h.ui.continueRun(),false);assert.equal(h.old.destroyed,false,JSON.stringify(options));
  assert.equal(h.prepared.length,1);assert.equal(h.commits,0);assert.equal(h.saveWrites,0);
  assert.equal(h.storage.get('won-checkpoint'),h.saved);h.old.destroy();
 }
});
