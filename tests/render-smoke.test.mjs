import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, STAGES, SOURCE_META } from '../src/data.js';
import { drawStage, drawMonster, renderPortrait } from '../src/renderers.js';

function gradient(){return {addColorStop(){}};}
function context(){
  const base={
    canvas:{width:1280,height:720},
    createLinearGradient:gradient,createRadialGradient:gradient,createPattern:()=>null,
    measureText:(text)=>({width:String(text).length*7}),
    save(){},restore(){},setTransform(){},translate(){},scale(){},rotate(){},beginPath(){},closePath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},bezierCurveTo(){},arc(){},ellipse(){},rect(){},fill(){},stroke(){},fillRect(){},strokeRect(){},clearRect(){},fillText(){},strokeText(){},setLineDash(){},clip(){},drawImage(){},
  };
  return new Proxy(base,{get(target,key){if(key in target)return target[key];return typeof key==='string'?()=>{}:undefined;},set(target,key,value){target[key]=value;return true;}});
}

test('all 53 stages render in fog, transition and Otherworld states',()=>{
  const ctx=context();
  for(const stage of STAGES){
    for(const otherworld of [0,.5,1]){
      assert.doesNotThrow(()=>drawStage(ctx,stage,12345,{width:1280,height:720,otherworld,radio:.7}));
    }
  }
});

test('all 184 manifestations render as fighters and portraits',()=>{
  const ctx=context();
  const states=[
    {name:'idle',frame:0,status:null},
    {name:'attack',frame:8,status:{id:'bleed'}},
    {name:'hurt',frame:3,status:{id:'static'}},
    {name:'ko',frame:20,status:null}
  ];
  for(const fighter of ROSTER){
    assert.ok(SOURCE_META[fighter.source]);
    for(const state of states){
      assert.doesNotThrow(()=>drawMonster(ctx,fighter,640,610,{facing:-1,state,time:4000}));
    }
    const portraitContext=context();
    const canvas={width:300,height:360,getContext:()=>portraitContext};
    assert.doesNotThrow(()=>renderPortrait(canvas,fighter,{time:4000}));
  }
});
