import test from 'node:test';
import assert from 'node:assert/strict';
import {getFighter} from '../src/data.js';
import {SpriteCache,spriteCache,combatSpriteFor} from '../src/sprite-system.js';
import {pinCombatAssets,captureCombatAssetPins,stageBitmapCache} from '../src/stage-bitmaps.js';
import {projectileBitmapCache} from '../src/projectile-bitmaps.js';

test('native attack poses and Faceless Nurse can start a duel without dropping frames or unbounding the caches',t=>{
  const restore=captureCombatAssetPins();t.after(restore);
  const nurse=getFighter('origins_faceless_nurse');
  for(const id of ['sh1_groaner_003','sh3_closer_036','sh3_numb_body_small_037','sh3_double_head_040']){
    const pair=[getFighter(id),nurse],frames=pair.flatMap(fighter=>combatSpriteFor(fighter).frames);
    const unique=new Map(frames.map(frame=>[frame.path,frame]));
    const bytes=[...unique.values()].reduce((n,frame)=>n+frame.width*frame.height*4,0);
    assert.ok(bytes>64*1024*1024,'This real pairing reproduces the old admission failure.');
    assert.throws(()=>new SpriteCache().validatePins(frames),/exceeds the decoded-memory budget/);
    assert.doesNotThrow(()=>pinCombatAssets(pair,[]));
    assert.deepEqual([...spriteCache.pins].sort(),[...unique.keys()].sort(),'Every native frame remains leased.');
    assert.ok(bytes<=spriteCache.maxBytes&&spriteCache.maxBytes<=72*1024*1024);
    const extra={...frames[0],path:'fixture-excess-native-frame.png',width:2048,height:2048};
    assert.throws(()=>spriteCache.validatePins([...frames,extra]),/exceeds the decoded-memory budget/);
  }
  assert.equal(stageBitmapCache.maxBytes,64*1024*1024);
  assert.equal(projectileBitmapCache.maxBytes,32*1024*1024);
});
