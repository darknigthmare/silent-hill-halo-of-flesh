import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,getFighter} from '../src/data.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {rasterPlacement} from '../src/sprite-system.js';
import {actorSpriteState} from '../src/sprite-animation.js';
import {combatFraming,completeSpriteBox} from '../src/sprite-framing.js';

function actualPixelBox(fighter,frame,actor,camera){
 const p=rasterPlacement(fighter,frame,actor.x,actor.y,actor.facing,actorSpriteState(actor));
 const [left,top,right,bottom]=frame.framingBounds;
 const corners=[[left,top],[right,top],[left,bottom],[right,bottom]].map(([x,y])=>({
  x:(actor.x+p.flip*(p.localX+x*p.scale))*camera.scale+camera.x,
  y:(p.y+y*p.scale)*camera.scale+camera.y
 }));
 return {left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),
  top:Math.min(...corners.map(p=>p.y)),bottom:Math.max(...corners.map(p=>p.y))};
}

test('every readable body and connected faint tip fits at either wall and facing, including jumps and maximal screen shake',()=>{
 let checked=0;
 for(const fighter of ROSTER.filter(f=>SPRITES[f.id]))for(const x of [36,1244])for(const facing of [-1,1]){
  for(const posture of [{y:594,grounded:true},{y:300,grounded:false},{y:594,grounded:true,ko:true}]){
   const actor={data:fighter,x,facing,state:posture.ko?'ko':'idle',...posture},before=structuredClone(actor);
   const camera=combatFraming([actor]);
   for(const frame of SPRITES[fighter.id].frames){
    const box=actualPixelBox(fighter,frame,actor,camera),label=`${fighter.id} ${frame.path} x=${x} facing=${facing}`;
    assert.ok(box.left-9>=-1e-7&&box.right+9<=1280+1e-7,label+' horizontal tips and shake');
    assert.ok(box.top-4.5>=132-1e-7&&box.bottom+4.5<=694+1e-7,label+' vertical tips and shake');
    checked++;
   }
   assert.deepEqual(actor,before,'framing cannot move, heal, equip or otherwise mutate a fighter');
  }
 }
 assert.ok(checked>=84*12,'all existing frame/posture/facing/wall combinations are inspected');
});

test('a future wide weapon pose stays in the camera envelope before it is sampled',()=>{
 const data=getFighter('sh2_red_pyramid_thing_great_knife_029'),art=structuredClone(SPRITES[data.id]);
 art.frames.push({...art.frames[0],framingBounds:[0,0,art.frames[0].width,art.frames[0].height],anchor:[.95,.95]});
 const actor={data,x:36,y:594,facing:-1,grounded:true,state:'idle'},registry={[data.id]:art};
 const first=combatFraming([actor],{registry});actor.spriteClock={identity:'idle:',tick:600};
 assert.deepEqual(combatFraming([actor],{registry}),first,'current frame clock cannot pump the clip envelope');
 for(const frame of art.frames){const box=actualPixelBox(data,frame,actor,first);assert.ok(box.left>=0&&box.right<=1280&&box.top>=132&&box.bottom<=694);}
});

test('legacy unmeasured descriptors retain their readable bounds as a compatibility fallback',()=>{
 const data=getFighter('sh1_groaner_003'),frame=structuredClone(SPRITES[data.id].frames[0]);delete frame.framingBounds;
 const box=completeSpriteBox(data,frame,400,594,-1);
 assert.ok(Object.values(box).every(Number.isFinite));assert.ok(box.w>0&&box.h>0);
});

test('Curtis retains his circular saw while Walter and Arcade Robbie keep their distinct chainsaws',()=>{
 assert.equal(getFighter('homecoming_curtis_ackers').visual.weapon,'circular_saw');
 assert.equal(getFighter('sh4_walter_sullivan_072').visual.weapon,'chainsaw');
 assert.equal(getFighter('arcade_robbie_the_rabbit_chainsaw').visual.weapon,'chainsaw');
});

test('the Origins Nurse carries the documented syringe while the Homecoming Nurse keeps her scalpel',()=>{
 assert.equal(getFighter('origins_faceless_nurse').visual.weapon,'syringe');
 assert.equal(getFighter('homecoming_nurse').visual.weapon,'scalpel');
});
