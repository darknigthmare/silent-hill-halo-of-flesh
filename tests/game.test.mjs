import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, AFFLICTIONS, RITUAL_MODIFIERS, createBossPhases, createCombatProfile } from '../src/data.js';
import { chronicleGrade } from '../src/fight.js';

const avg=(items,key)=>items.reduce((sum,item)=>sum+item[key],0)/items.length;

test('bosses retain a meaningful durability and power identity',()=>{
  const regular=ROSTER.filter(f=>!f.boss).map(createCombatProfile);
  const bosses=ROSTER.filter(f=>f.boss).map(createCombatProfile);
  assert.ok(avg(bosses,'maxHealth')>avg(regular,'maxHealth'));
  assert.ok(avg(bosses,'power')>avg(regular,'power'));
});

test('ranged archetypes produce projectile specials and supers',()=>{
  const ranged=new Set(['zoner','artillery','flyer','ghost','trickster']);
  for(const fighter of ROSTER.filter(f=>ranged.has(f.archetype))){
    const profile=createCombatProfile(fighter);
    assert.equal(profile.moves.special.projectile,true,fighter.name);
    assert.equal(profile.moves.super.projectile,true,fighter.name);
  }
});

test('grappler trait improves throw damage and applies bind',()=>{
  const grappler=ROSTER.find(f=>f.archetype==='grappler');
  const balanced=ROSTER.find(f=>f.archetype==='balanced'&&!f.boss);
  assert.ok(grappler&&balanced);
  const gp=createCombatProfile(grappler),bp=createCombatProfile(balanced);
  assert.ok(gp.moves.throw.damage>bp.moves.throw.damage);
  assert.equal(gp.moves.throw.effect?.id,'bind');
});

test('low-profile manifestations receive their intended body modifier',()=>{
  for(const fighter of ROSTER.filter(f=>f.trait==='lowProfile')){
    const profile=createCombatProfile(fighter);
    assert.ok(profile.lowProfile<1,fighter.name);
    assert.ok(profile.moves.low.startup<=8,fighter.name);
  }
});

test('static-field and suppression traits enlarge projectiles',()=>{
  for(const fighter of ROSTER.filter(f=>['staticField','suppression'].includes(f.trait))){
    const profile=createCombatProfile(fighter);
    assert.ok(profile.moves.special.projectileScale>1,fighter.name);
  }
});

test('all attack effects resolve to an affliction',()=>{
  for(const fighter of ROSTER){
    for(const move of Object.values(createCombatProfile(fighter).moves)){
      if(move.effect)assert.ok(AFFLICTIONS[move.effect.id],`${fighter.name}/${move.name}`);
    }
  }
});

test('chronicle grade reaches S with strong clean play',()=>{
  assert.equal(chronicleGrade({healthRatio:1,maxCombo:10,perfectGuards:4,hazardsTaken:0}),'S');
});

test('chronicle grade penalizes hazards and low remaining health',()=>{
  assert.equal(chronicleGrade({healthRatio:.12,maxCombo:1,perfectGuards:0,hazardsTaken:4}),'D');
});

test('chronicle grade boundaries remain ordered',()=>{
  const scores=[
    chronicleGrade({healthRatio:.2}),
    chronicleGrade({healthRatio:.7,maxCombo:3}),
    chronicleGrade({healthRatio:.9,maxCombo:6,perfectGuards:2}),
    chronicleGrade({healthRatio:1,maxCombo:10,perfectGuards:4})
  ];
  const rank={D:0,C:1,B:2,A:3,S:4};
  for(let i=1;i<scores.length;i++)assert.ok(rank[scores[i]]>=rank[scores[i-1]],scores.join(','));
});

test('all super moves preserve the manifestation signature',()=>{
  for(const fighter of ROSTER){
    const profile=createCombatProfile(fighter);
    assert.ok(profile.moves.super.name.includes(fighter.signature),fighter.id);
    assert.equal(profile.moves.super.meterCost,100,fighter.id);
  }
});


test('boss combat profiles embed the same ordered phase definitions as the catalogue',()=>{
  for(const fighter of ROSTER.filter(f=>f.boss)){
    const profile=createCombatProfile(fighter);
    assert.deepEqual(profile.bossPhases,createBossPhases(fighter),fighter.id);
  }
});

test('ritual modifiers stay within bounded gameplay multipliers',()=>{
  for(const [id,ritual] of Object.entries(RITUAL_MODIFIERS)){
    for(const key of ['damageScale','meterGainScale','guardScale','guardRegenScale','hazardIntervalScale','hazardDamageScale','speedScale','superCostScale','superDamageScale','bossPowerScale']){
      if(ritual[key]!=null)assert.ok(ritual[key]>.25&&ritual[key]<2,id+'/'+key);
    }
  }
});

test('fatalities contribute a bounded bonus to chronicle grading',()=>{
  const without=chronicleGrade({healthRatio:.72,maxCombo:3,perfectGuards:0,hazardsTaken:0,fatalities:0});
  const withFatality=chronicleGrade({healthRatio:.72,maxCombo:3,perfectGuards:0,hazardsTaken:0,fatalities:1,stageFatalities:1});
  const rank={D:0,C:1,B:2,A:3,S:4};
  assert.ok(rank[withFatality]>=rank[without]);
});
