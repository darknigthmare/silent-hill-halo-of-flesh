import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER,createCombatProfile} from '../src/data.js';
import {SPRITES} from '../src/sprite-manifest.js';
import {rasterPlacement} from '../src/sprite-system.js';
import {bodyProfile,moveBox} from '../src/combat-geometry.js';
const id='sh2_lying_figure_crawling_021';
const fighter=ROSTER.find(f=>f.id===id),profile=createCombatProfile(fighter),art=SPRITES[id];
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} differs from ${b}`);
test('the exact prone short contact uses the ground band without extending reach or changing the standing form',()=>{
 assert.equal(profile.moves.neutralLight.level,'low');assert.equal(profile.moves.neutralLight.reach,55);
 assert.equal(createCombatProfile(ROSTER.find(f=>f.id==='sh2_lying_figure_020')).moves.neutralLight.level,'mid');
});
for(const facing of [1,-1])test(`prone poses share scale and ground support; front lies in the low hit band (${facing})`,()=>{
 const actor={data:fighter,x:310,y:594,facing,grounded:true,crouching:false};
 const placed=['idle','walk','neutralLight'].map(pose=>{
  const frame=art.frames[art.clips[pose].frames[0]],p=rasterPlacement(fighter,frame,actor.x,actor.y,facing,actor);
  near(p.y+frame.visibleBounds[3]*p.scale,actor.y);assert.ok(p.width<200);
  return {frame,p};
 });
 near(placed[0].p.scale,placed[1].p.scale);near(placed[0].p.scale,placed[2].p.scale);
 const {frame,p}=placed[2],box=moveBox(actor,profile.moves.neutralLight);
 const front=actor.x+p.flip*(p.localX+frame.visibleBounds[0]*p.scale);
 assert.ok(front>=box.x&&front<=box.x+box.w);
 assert.ok(p.y+frame.visibleBounds[1]*p.scale<box.y+box.h);
 assert.ok(p.y+frame.visibleBounds[3]*p.scale>box.y);
 const body=bodyProfile(fighter,actor);assert.equal(body.height,215);assert.equal(body.width,80);assert.equal(body.scale,.82);
});
