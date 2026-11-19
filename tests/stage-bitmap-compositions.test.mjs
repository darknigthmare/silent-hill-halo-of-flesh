import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {STAGES} from '../src/data.js';
import {stageReferenceTrackAllowed} from '../src/stage-reference-policy.js';
import {stageReferencePresentation} from '../src/stage-cinematics.js';
import {drawAlessaBitmapComposition,drawMidwichHearthBitmapComposition} from '../src/stage-bitmap-compositions.js';

const stage = STAGES.find(value => value.id === 'film_hospital');
const art = STAGE_BITMAPS.film_hospital;
function trace() {
  const calls = [], stack = [];
  const state = {globalAlpha:.4};
  const ctx = new Proxy(state, {
    get(target, key) {
      if (key === 'save') return () => {stack.push({...target}); calls.push(['save']);};
      if (key === 'restore') return () => {assert.ok(stack.length); Object.assign(target, stack.pop()); calls.push(['restore']);};
      if (key in target) return target[key];
      return (...args) => calls.push([key, ...args]);
    },
    set(target,key,value) {target[key]=value; calls.push(['set',key,value]); return true;}
  });
  return {ctx,calls,stack};
}
function draw(presentation, selectedArt=art, selectedStage=stage, size=[1280,720]) {
  const result=trace();
  result.drawn=drawAlessaBitmapComposition(result.ctx,...size,selectedStage,selectedArt,presentation,stageReferenceTrackAllowed);
  assert.equal(result.stack.length,0);
  assert.equal(result.ctx.globalAlpha,.4);
  assert.ok(result.calls.flat().filter(value=>typeof value==='number').every(Number.isFinite));
  return result;
}

test('exact bitmap receives bounded fold strokes without a second tent silhouette', () => {
  const result=draw(stageReferencePresentation(stage,1200));
  assert.equal(result.drawn.handled,true);
  assert.equal(result.drawn.roundHandled,false);
  assert.deepEqual(result.drawn.trackIds,[stage.referenceTracks.find(track=>track.key==='gansAlessaTentCloth').id]);
  assert.equal(result.calls.filter(call=>call[0]==='clip').length,1);
  assert.equal(result.calls.filter(call=>call[0]==='stroke').length,2);
  assert.equal(result.calls.some(call=>['fill','fillRect','drawImage'].includes(call[0])),false);
});

test('scene and source bitmap hash prevent geometry reuse on other art', () => {
  for(const altered of [
    {...art,scene:'another-room'},
    {...art,layers:art.layers.map((layer,index)=>index?layer:{...layer,frames:[{...layer.frames[0],sha256:'0'.repeat(64)}]})},
    {...art,layers:art.layers.map((layer,index)=>index?layer:{...layer,fit:'stretch'})}
  ]) {
    const result=draw(stageReferencePresentation(stage,1200),altered);
    assert.equal(result.drawn.handled,false);
    assert.equal(result.calls.length,0);
  }
  const result=draw({time:1200},art,{...stage,id:'film_church'});
  assert.equal(result.drawn.handled,false);
  assert.equal(result.calls.length,0);
});

test('cover projection matches native canvas at portrait, wide and standard sizes', () => {
  for(const size of [[1280,720],[1672,941],[1920,720],[720,1280]]) {
    const result=draw(stageReferencePresentation(stage,1200),art,stage,size);
    const scale=Math.max(size[0]/1672,size[1]/941);
    assert.deepEqual(result.calls.find(call=>call[0]==='translate'),['translate',(size[0]-1672*scale)/2,(size[1]-941*scale)/2]);
    assert.deepEqual(result.calls.find(call=>call[0]==='scale'),['scale',scale,scale]);
  }
});

test('ambient motion follows presentation time and freezes for reduced motion or disabled animation', () => {
  assert.notDeepEqual(draw(stageReferencePresentation(stage,1200)).calls,draw(stageReferencePresentation(stage,3600)).calls);
  for(const options of [{reducedMotion:true},{animationsEnabled:false}]) {
    assert.deepEqual(draw(stageReferencePresentation(stage,1200,null,options)).calls,draw(stageReferencePresentation(stage,3600,null,options)).calls);
  }
});

test('round rest uses existing phase clock, returns its id, and does not mutate stage state', () => {
  const before=JSON.stringify(stage);
  const match={phase:'roundEnd',frame:1000,phaseTimer:100,phaseDuration:145,round:1};
  const first=draw(stageReferencePresentation(stage,1200,match));
  const second=draw(stageReferencePresentation(stage,90000,match));
  assert.deepEqual(first.calls,second.calls);
  assert.equal(first.drawn.roundHandled,true);
  assert.ok(first.drawn.trackIds.includes(stage.referenceTracks.find(track=>track.key==='alessaRoomRoundRest').id));
  assert.equal(first.calls.filter(call=>call[0]==='stroke').length,3);
  assert.equal(JSON.stringify(stage),before);
});

const hearthStage=STAGES.find(value=>value.id==='midwich_nightmare');
const hearthArt=STAGE_BITMAPS.midwich_nightmare;
function hearthDraw(presentation,selectedArt=hearthArt,selectedStage=hearthStage,allowed=stageReferenceTrackAllowed,size=[1280,720]){
  const result=trace();
  result.drawn=drawMidwichHearthBitmapComposition(result.ctx,...size,selectedStage,selectedArt,presentation,allowed);
  assert.equal(result.stack.length,0);
  assert.equal(result.ctx.globalAlpha,.4);
  return result;
}
test('SH1 hearth pulse clips to four painted fire cells without replacing its cage or floor',()=>{
  const before=JSON.stringify(hearthStage),result=hearthDraw(stageReferencePresentation(hearthStage,1200));
  assert.deepEqual(result.drawn,{handled:true,roundHandled:false,trackIds:[hearthStage.referenceTracks.find(item=>item.key==='boilerHearthGlow').id]});
  assert.equal(result.calls.filter(call=>call[0]==='clip').length,1);
  assert.equal(result.calls.filter(call=>call[0]==='rect').length,4);
  assert.equal(result.calls.filter(call=>call[0]==='fillRect').length,1);
  assert.equal(result.calls.some(call=>['stroke','drawImage','ellipse','arc'].includes(call[0])),false);
  assert.equal(JSON.stringify(hearthStage),before);
  const denied=hearthDraw({time:1200},hearthArt,hearthStage,()=>false);
  assert.equal(denied.calls.length,0);assert.deepEqual(denied.drawn.trackIds,[]);
});
test('SH1 bitmap pulse rejects another scene, frame, fit or blocked reference',()=>{
  for(const art of [
    {...hearthArt,scene:'otherworld-corridor'},
    {...hearthArt,layers:hearthArt.layers.map((layer,index)=>index?layer:{...layer,fit:'stretch'})},
    {...hearthArt,layers:hearthArt.layers.map((layer,index)=>index?layer:{...layer,frames:[{...layer.frames[0],sha256:'0'.repeat(64)}]})}
  ]){
    const result=hearthDraw({time:1200},art);assert.equal(result.drawn.handled,false);assert.equal(result.calls.length,0);
  }
  const result=hearthDraw({time:1200},hearthArt,{...hearthStage,reference:{...hearthStage.reference,blocked:true}});
  assert.equal(result.drawn.handled,false);assert.equal(result.calls.length,0);
});
test('SH1 bitmap pulse uses the existing frozen presentation clock and cover projection',()=>{
  assert.notDeepEqual(hearthDraw(stageReferencePresentation(hearthStage,1200)).calls,hearthDraw(stageReferencePresentation(hearthStage,3600)).calls);
  for(const options of [{reducedMotion:true},{animationsEnabled:false}])assert.deepEqual(
    hearthDraw(stageReferencePresentation(hearthStage,1200,null,options)).calls,
    hearthDraw(stageReferencePresentation(hearthStage,3600,null,options)).calls);
  for(const size of [[1280,720],[1920,720],[720,1280]]){
    const result=hearthDraw({time:1200},hearthArt,hearthStage,stageReferenceTrackAllowed,size),scale=Math.max(size[0]/1672,size[1]/941);
    assert.deepEqual(result.calls.find(call=>call[0]==='translate'),['translate',(size[0]-1672*scale)/2,(size[1]-941*scale)/2]);
    assert.deepEqual(result.calls.find(call=>call[0]==='scale'),['scale',scale,scale]);
  }
});
