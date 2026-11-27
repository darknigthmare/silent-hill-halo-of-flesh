import test from 'node:test';
import assert from 'node:assert/strict';
import {getFighter,ROSTER} from '../src/data.js';
import {SpriteCache,spriteCache,combatSpriteFor,COMBAT_SPRITE_BUDGET} from '../src/sprite-system.js';
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
    assert.ok(bytes<=spriteCache.maxBytes&&spriteCache.maxBytes===79*1024*1024);
    const extra={...frames[0],path:'fixture-excess-native-frame.png',width:2048,height:2048};
    assert.throws(()=>spriteCache.validatePins([...frames,extra]),/exceeds the decoded-memory budget/);
  }
  assert.equal(stageBitmapCache.maxBytes,64*1024*1024);
  assert.equal(projectileBitmapCache.maxBytes,32*1024*1024);
});

test('every real roster pair fits the bounded wave32 cache and the maximal pair rejects one extra MiB',t=>{
  const restore=captureCombatAssetPins();t.after(restore);
  const owners=ROSTER.map(fighter=>({fighter,frames:combatSpriteFor(fighter)?.frames||[]}));
  let maximum={bytes:0},count=0;
  for(let i=0;i<owners.length;i++)for(let j=i;j<owners.length;j++){
    const pair=[owners[i],owners[j]],frames=pair.flatMap(owner=>owner.frames);
    const unique=spriteCache.validatePins(frames);
    const bytes=[...unique.values()].reduce((n,frame)=>n+frame.width*frame.height*4,0);
    if(bytes>maximum.bytes)maximum={bytes,pair,frames,unique};
    count++;
  }
  assert.equal(count,ROSTER.length*(ROSTER.length+1)/2,'Every unordered pair, including mirrors, is checked.');
  assert.deepEqual(maximum.pair.map(owner=>owner.fighter.id),['sh1_groaner_003','origins_faceless_nurse']);
  assert.equal(maximum.bytes,81802000);
  assert.equal(maximum.unique.size,13);
  assert.equal(COMBAT_SPRITE_BUDGET,79*1024*1024);
  assert.throws(()=>new SpriteCache({maxBytes:78*1024*1024}).validatePins(maximum.frames),/decoded-memory budget/,'78 MiB is below the actual native requirement.');
  const fighters=maximum.pair.map(owner=>owner.fighter);
  pinCombatAssets(fighters,[]);
  const before=[...spriteCache.pins].sort();
  assert.deepEqual(before,[...maximum.unique.keys()].sort());
  const extra={path:'fixture-extra-512-square.png',width:512,height:512};
  assert.throws(()=>pinCombatAssets(fighters,[],{retainedFrames:[extra]}),/decoded-memory budget/);
  assert.deepEqual([...spriteCache.pins].sort(),before,'A rejected oversized transition keeps the admitted duel lease intact.');
  assert.equal(new SpriteCache().maxBytes,64*1024*1024);
  assert.equal(stageBitmapCache.maxBytes,64*1024*1024);
  assert.equal(projectileBitmapCache.maxBytes,32*1024*1024);
});
