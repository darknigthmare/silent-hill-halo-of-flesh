import test from 'node:test';
import assert from 'node:assert/strict';
import {ROSTER} from '../src/data.js';
import {bodyProfile,bodyBox,hasGroundContact} from '../src/combat-geometry.js';
import {actorSpriteState,sampleSpriteClip} from '../src/sprite-animation.js';
import {rasterPlacement} from '../src/sprite-system.js';
import {visibleSpriteBox,combatFraming} from '../src/sprite-framing.js';
import {SPRITES} from '../src/sprite-manifest.js';

const fighter=ROSTER.find(f=>f.id==='sh1_night_flutter_002');
const art=SPRITES[fighter.id];
const actor=extra=>({data:fighter,x:410,y:594,facing:1,grounded:true,state:'idle',...extra});
const foot=box=>box.y+box.h;

test('the standing Night Flutter raster and collision share the actual floor',()=>{
 const a=actor(),state=actorSpriteState(a),frame=art.frames[0];
 assert.equal(hasGroundContact(a),true);
 assert.equal(foot(bodyBox(a)),594);
 const visible=visibleSpriteBox(fighter,frame,a.x,a.y,1,state);
 assert.ok(Math.abs(foot(visible)-594)<.02,'lowest visible foot meets its calibrated support');
 assert.equal(rasterPlacement(fighter,frame,a.x,a.y,1,state).localY,
  rasterPlacement(fighter,frame,a.x,a.y,1).localY,'static inspector uses the same planted pose');
 const framing=combatFraming([a],{registry:SPRITES});
 assert.ok(Number.isFinite(framing.scale));
});

test('airborne Night Flutter preserves the flyer envelope and reports its missing flight pose',()=>{
 const a=actor({grounded:false,y:480}),state=actorSpriteState(a),frame=art.frames[0];
 assert.equal(hasGroundContact(a),false);
 assert.equal(bodyProfile(a).floating,true);
 assert.equal(foot(bodyBox(a)),480-34*fighter.visual.scale);
 assert.ok(Math.abs(foot(visibleSpriteBox(fighter,frame,a.x,a.y,1,state))-foot(bodyBox(a)))<.02);
 const sampled=sampleSpriteClip(art,state);
 assert.equal(sampled.requested,'jump');assert.equal(sampled.pose,'idle');
 assert.equal(sampled.fallback,true);assert.equal(sampled.tick,0);
 assert.equal(art.animatedClips,0);
});

test('the planted candidate exception leaves other exact flyer identities unchanged',()=>{
 for(const id of ['sh1_air_screamer_001','sh4_hummer_055']){
  const f=ROSTER.find(f=>f.id===id),a=actor({data:f});
  assert.equal(bodyProfile(a).floating,true,id);assert.equal(hasGroundContact(a),false,id);
 }
 const foreign={...fighter,source:'sh2'};
 assert.equal(bodyProfile(foreign).floating,true,'no cross-edition identity match');
});
