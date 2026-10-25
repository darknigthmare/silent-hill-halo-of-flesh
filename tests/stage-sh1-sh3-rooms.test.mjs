import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {STAGES,ROSTER,STAGE_TERRAINS} from '../src/data.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {FightEngine} from '../src/fight.js';
import {stageTerrainProfile} from '../src/stage-director.js';
import {applyStageReferencePolicy,stageReferenceTrackAllowed} from '../src/stage-reference-policy.js';
import {drawStageReferenceTracks} from '../src/stage-cinematics.js';
import {stageSpace,drawStageArchitecture} from '../src/stage-architecture.js';

const stage=id=>{const value=STAGES.find(s=>s.id===id);assert.ok(value,id);return value;};
const additions=[['midwich_nightmare','sh1','boilerHearthGlow'],['sewers','sh3','canalCableSway'],['lakeside_amusement','sh1','sh1CarouselOrbit'],['lakeside_sh3','sh3','sh3HorseBob']];
function trace(){
 const calls=[],stack=[],state={globalAlpha:.4,canvas:{width:1280,height:720}};
 state.save=()=>{stack.push(state.globalAlpha);calls.push(['save']);};state.restore=()=>{assert.ok(stack.length);state.globalAlpha=stack.pop();calls.push(['restore']);};
 state.createLinearGradient=state.createRadialGradient=(...args)=>({addColorStop:(...color)=>calls.push(['gradient',...args,...color])});
 return {context:new Proxy(state,{get:(target,key)=>key in target?target[key]:(...args)=>calls.push([key,...args])}),calls,stack};
}
function draw(location,time,reducedMotion=false){const r=trace();drawStageReferenceTracks(r.context,1280,720,location,time,{reducedMotion});assert.equal(r.context.globalAlpha,.4);assert.equal(r.stack.length,0);return r.calls;}
const engines=new Set();afterEach(()=>{for(const engine of engines)engine.destroy();engines.clear();});

test('four SH1/SH3 tracks bind existing workbook proposals to their exact edition and selected room',()=>{
 for(const[id,source,key]of additions){const location=stage(id),track=location.referenceTracks.find(t=>t.key===key),proposal=STAGE_REFERENCES[id].animations[1];
  assert.ok(track,id);assert.equal(track.id,`${id}:reference:2`);assert.equal(track.source,source);assert.equal(track.description,proposal.description);assert.deepEqual(track.evidence,proposal.evidence);assert.equal(track.event,null);assert.equal(track.timecode,undefined);assert.equal(track.coverage,'partial-visual-prototype');assert.equal(track.fidelity,'adaptation-versus-proposee');assert.ok(track.locationScope);assert.ok(track.limits);
  for(const other of[{...location,source:source==='sh1'?'sh3':'sh1'},{...location,id:id+'_another_room'}]){assert.equal(stageReferenceTrackAllowed(other,track),false);assert.deepEqual(draw({...other,referenceTracks:[track]},1400),[]);}
 }
 assert.match(stage('sewers').referenceTracks[0].locationScope,/après utilisation/);assert.match(stage('lakeside_sh3').referenceTracks[0].locationScope,/avant la transition/);
});

test('the selected boiler room and canal cannot inherit school lockers, falling embers or a flooded fighter lane',()=>{
 const boiler=stage('midwich_nightmare');for(const p of['lockers','chains','ceiling-lights']){assert.ok(!boiler.props.includes(p));assert.ok(!boiler.layers.includes(p));}assert.deepEqual(boiler.animations,[]);assert.equal(boiler.weather,'dust');assert.equal(boiler.referencePolicy.worldState,'fixed-altered');
 const canal=stage('sewers');assert.equal(stageSpace(canal),'interior');assert.equal(canal.referencePolicy.interior,true);assert.equal(canal.weather,'dust');assert.equal(canal.terrain.id,'concrete');assert.deepEqual(canal.animations,[]);
 const other={...canal,source:'sh1'},untouched=trace();assert.equal(stageSpace(other),'exterior');assert.equal(drawStageArchitecture(untouched.context,1280,720,other),false);assert.deepEqual(untouched.calls,[]);
 for(const[id]of additions){const s=stage(id);assert.deepEqual(s.director.events,[]);assert.deepEqual(s.director.hazardDeck,[]);assert.deepEqual(s.interactions,[]);assert.equal(s.referencePolicy.automaticFinishers,false);}
});

test('both carousel views have their own supported machinery and omit the distant ferris wheel and room door',()=>{
 for(const id of['lakeside_amusement','lakeside_sh3']){const s=stage(id),r=trace();assert.equal(stageSpace(s),'exterior');assert.equal(drawStageArchitecture(r.context,1280,720,s),true);assert.equal(r.stack.length,0);assert.equal(s.weather,'none');assert.ok(!s.props.includes('wheel'));assert.ok(!s.props.includes('booths'));assert.deepEqual(s.animations,[]);assert.ok(!r.calls.some(c=>c[0]==='fillRect'&&c[3]===1280*.088&&c[4]===720*.25));}
 const a=draw(stage('lakeside_amusement'),1400),b=draw(stage('lakeside_amusement'),5900);assert.deepEqual(a.filter(c=>c[0]==='translate')[0],b.filter(c=>c[0]==='translate')[0],'SH1 fixed horse remains the reference point');
 const poles=time=>draw(stage('lakeside_sh3'),time).filter(c=>c[0]==='moveTo'&&c[2]===720*.25);assert.deepEqual(poles(1400),poles(5900),'SH3 pole tops do not move with horse bodies');
});

test('selected room wording and physics remain neutral without changing fourteen material profiles',()=>{
 const materials=structuredClone(STAGE_TERRAINS),keys=['moveScale','jumpScale','dodgeScale','friction','knockbackScale','guardRegenScale'];
 for(const id of[...additions.map(a=>a[0]),'shopping_mall']){const s=stage(id),terrain=stageTerrainProfile(s);assert.equal(s.referencePolicy.terrainRules,false);assert.equal(s.gameplay.terrainRules,false);for(const key of keys)assert.equal(terrain[key],STAGE_TERRAINS.concrete[key],id+'/'+key);assert.ok(terrain.name&&!/TREMPÉ|STAGNANTE/.test(terrain.name));assert.match(terrain.description,/1:1/);assert.deepEqual(stageTerrainProfile(s,'flooded'),{id:'flooded',...STAGE_TERRAINS.flooded});}
 const mall=stage('shopping_mall');assert.equal(mall.referencePolicy.normalPhaseLabel,'CENTRE COMMERCIAL NORMAL');assert.equal(mall.terrain.name,'SOL DU CENTRE COMMERCIAL');assert.equal(mall.referencePolicy.automaticFinishers,false);assert.deepEqual(mall.director.events,[]);assert.deepEqual(mall.director.hazardDeck,[]);assert.deepEqual(mall.animations,[]);
 assert.equal(Object.keys(STAGE_TERRAINS).length,14);assert.deepEqual(STAGE_TERRAINS,materials);
 const forged=applyStageReferencePolicy({...mall,source:'sh1'},{...STAGE_REFERENCES.shopping_mall,source:'sh1'});assert.equal(forged.referencePolicy.normalPhaseLabel,undefined);assert.equal(forged.referencePolicy.terrainPresentation,undefined);
});

test('four different motions retain source-state geometry under reduced motion and add no autonomous danger',()=>{
 globalThis.window={};globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};globalThis.document={hidden:false,addEventListener(){},removeEventListener(){}};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[],vibrate:()=>false},configurable:true});globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.requestAnimationFrame=()=>0;
 for(const[id]of additions){const s=stage(id);assert.notDeepEqual(draw(s,1400),draw(s,5900),id);assert.deepEqual(draw(s,1400,true),draw(s,5900,true),id);
  const e=new FightEngine({getContext:()=>trace().context},{p1:ROSTER[0],p2:ROSTER[1],stage:s,mode:'local',roundsToWin:2,timeLimit:99,seed:54,stageDirector:true,stageHazards:true,stageTerrain:true,otherworldShift:true,fatalities:false,stageFatalities:false});engines.add(e);for(let n=e.phaseTimer;n>0;n--)e.update();
  const health=e.actors.map(a=>a.health),world=e.world.amount;e.stageRuntime.eventTimer=-1;e.stageRuntime.heavyImpactPending=true;e.stageRuntime.lastHeavyImpact={x:640};assert.equal(e.tryStageInteraction(),false);for(let n=0;n<90;n++)e.update();assert.deepEqual(e.actors.map(a=>a.health),health);assert.equal(e.world.amount,world);assert.equal(e.hazards.length,0);assert.equal(e.stageRuntime.activeEvent,null);
 }
});
