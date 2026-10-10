import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERSION, ROSTER, STAGES, CHRONICLES, SOURCE_META, CONTENT_STATS,
  MANIFESTATION_TRAITS, AFFLICTIONS, STAGE_HAZARDS, AI_PERSONALITIES, RITUAL_MODIFIERS, createBossPhases, createCombatProfile
} from '../src/data.js';

const fighterIds=new Set(ROSTER.map(f=>f.id));
const stageIds=new Set(STAGES.map(s=>s.id));

test('v0.3.0 catalogue counts are synchronized',()=>{
  assert.equal(VERSION,'0.3.0');
  assert.deepEqual(CONTENT_STATS,{
    fighters:184,bosses:68,sources:15,stages:53,chronicles:14,rituals:9,bossPhases:136
  });
});

test('catalogue IDs are unique',()=>{
  assert.equal(fighterIds.size,ROSTER.length);
  assert.equal(stageIds.size,STAGES.length);
  assert.equal(new Set(CHRONICLES.map(route=>route.id)).size,CHRONICLES.length);
});

test('every fighter source, stage, trait and affliction resolves',()=>{
  for(const fighter of ROSTER){
    assert.ok(SOURCE_META[fighter.source],fighter.name);
    assert.ok(stageIds.has(fighter.stageId),`${fighter.name}: ${fighter.stageId}`);
    assert.ok(MANIFESTATION_TRAITS[fighter.trait],`${fighter.name}: ${fighter.trait}`);
    assert.ok(AFFLICTIONS[fighter.affliction],`${fighter.name}: ${fighter.affliction}`);
    assert.ok(AI_PERSONALITIES[fighter.aiProfile],`${fighter.name}: ${fighter.aiProfile}`);
  }
});

test('every stage source and hazard resolves',()=>{
  for(const stage of STAGES){
    assert.ok(SOURCE_META[stage.source],`${stage.id}: ${stage.source}`);
    assert.ok(STAGE_HAZARDS[stage.hazard],`${stage.id}: ${stage.hazard}`);
    assert.ok(AFFLICTIONS[STAGE_HAZARDS[stage.hazard].effect],`${stage.id}: ${STAGE_HAZARDS[stage.hazard].effect}`);
  }
});

test('every chronicle reference resolves without invented padding',()=>{
  for(const route of CHRONICLES){
    assert.ok(SOURCE_META[route.source],route.id);
    assert.ok(route.fighters.length>=1,route.id);
    assert.ok(route.stages.length>=1,route.id);
    route.fighters.forEach(id=>assert.ok(fighterIds.has(id),`${route.id}/${id}`));
    route.stages.forEach(id=>assert.ok(stageIds.has(id),`${route.id}/${id}`));
  }
});

test('film and Ascension source packs are present',()=>{
  assert.equal(ROSTER.filter(f=>f.source==='film').length,8);
  assert.equal(ROSTER.filter(f=>f.source==='ascension').length,7);
  assert.ok(STAGES.filter(s=>s.source==='film').length>=4);
  assert.ok(STAGES.filter(s=>s.source==='ascension').length>=3);
  assert.ok(CHRONICLES.some(route=>route.source==='film'));
  assert.ok(CHRONICLES.some(route=>route.source==='ascension'));
});

test('every manifestation has complete dossier metadata',()=>{
  for(const fighter of ROSTER){
    assert.ok(fighter.name.trim().length>=2,fighter.id);
    assert.ok(fighter.signature.trim().length>=3,fighter.id);
    assert.ok(fighter.finisher.trim().length>=4,fighter.id);
    assert.ok(fighter.lore.trim().length>=8,fighter.id);
    assert.ok(fighter.canonicalBehavior.trim().length>=8,fighter.id);
    assert.ok(fighter.adaptation.trim().length>=8,fighter.id);
  }
});

test('combat profiles are playable, bounded and internally linked',()=>{
  for(const fighter of ROSTER){
    const profile=createCombatProfile(fighter);
    assert.ok(profile.maxHealth>=700&&profile.maxHealth<=1800,fighter.name);
    assert.ok(profile.speed>0&&profile.jump>0&&profile.reach>0,fighter.name);
    assert.equal(Object.keys(profile.moves).length,6,fighter.name);
    for(const [key,move] of Object.entries(profile.moves)){
      assert.ok(move.damage>0,`${fighter.name}/${key}`);
      assert.ok(move.startup>=0,`${fighter.name}/${key}`);
      assert.ok(move.reach>0,`${fighter.name}/${key}`);
      if(move.effect)assert.ok(AFFLICTIONS[move.effect.id],`${fighter.name}/${key}/${move.effect.id}`);
      for(const cancel of move.cancelInto||[])assert.ok(profile.moves[cancel],`${fighter.name}/${key}/${cancel}`);
    }
  }
});

test('all 12 traits, 8 afflictions, 7 hazards, 9 rites and 12 AI personalities are represented',()=>{
  assert.equal(Object.keys(MANIFESTATION_TRAITS).length,12);
  assert.equal(Object.keys(AFFLICTIONS).length,8);
  assert.equal(Object.keys(STAGE_HAZARDS).length,7);
  assert.equal(Object.keys(RITUAL_MODIFIERS).length,9);
  assert.equal(Object.keys(AI_PERSONALITIES).length,12);
  const usedTraits=new Set(ROSTER.map(f=>f.trait));
  const usedAfflictions=new Set(ROSTER.map(f=>f.affliction));
  const usedHazards=new Set(STAGES.map(s=>s.hazard));
  Object.keys(MANIFESTATION_TRAITS).forEach(id=>assert.ok(usedTraits.has(id),id));
  Object.keys(AFFLICTIONS).forEach(id=>assert.ok(usedAfflictions.has(id),id));
  Object.keys(STAGE_HAZARDS).forEach(id=>assert.ok(usedHazards.has(id),id));
});


test('every boss exposes two ordered combat phases and regular fighters expose none',()=>{
  for(const fighter of ROSTER){
    const phases=createBossPhases(fighter);
    assert.equal(phases.length,fighter.boss?2:0,fighter.name);
    if(phases.length){
      assert.ok(phases[0].threshold>phases[1].threshold,fighter.name);
      assert.ok(phases.every(phase=>phase.power>=1&&phase.speed>=1),fighter.name);
    }
  }
});

test('every AI personality and ritual modifier has complete readable metadata',()=>{
  for(const [id,ai] of Object.entries(AI_PERSONALITIES)){
    assert.ok(ai.name.length>=4,id);
    assert.ok(ai.preferredRange>0,id);
    assert.ok(ai.aggression>0&&ai.defense>0&&ai.mobility>0,id);
  }
  for(const [id,ritual] of Object.entries(RITUAL_MODIFIERS)){
    assert.ok(ritual.name.length>=4,id);
    assert.ok(ritual.description.length>=12,id);
  }
});
