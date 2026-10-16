import { AMBIENT_ONLY_HAZARDS } from '../src/stage-lore-policy.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VERSION, ROSTER, STAGES, CHRONICLES, SOURCE_META, CONTENT_STATS,
  MANIFESTATION_TRAITS, AFFLICTIONS, STAGE_HAZARDS, AI_PERSONALITIES, RITUAL_MODIFIERS, coverageAudit, createBossPhases, createCombatProfile, MOVESET_KEYS, MOVE_FIDELITY,
  STAGE_TERRAINS, STAGE_SHIFT_STYLES, STAGE_EVENTS, STAGE_INTERACTION_TRIGGERS, stageDirectorSummary
} from '../src/data.js';

const fighterIds=new Set(ROSTER.map(f=>f.id));
const stageIds=new Set(STAGES.map(s=>s.id));

test('v0.9.3 catalogue counts are synchronized',()=>{
  assert.equal(VERSION,'0.9.3');
  assert.deepEqual(CONTENT_STATS,{
    fighters:230,bosses:75,sources:16,stages:123,chronicles:15,rituals:9,bossPhases:150,
    fatalities:460,stageFatalities:123,stageAnimations:352,stageDirectorEvents:300,
    stageInteractions:286,stageHazardLinks:255,terrainProfiles:14,shiftStyles:15,moves:4600,
    directCanonicalMoves:447,behaviorCompositeMoves:3694,versusAdaptationMoves:459,coverageComplete:true
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
    assert.ok(stage.animations.length>=1,stage.id);
    assert.ok(stage.fatality?.name&&stage.fatality.sequence.length>=3,stage.id);
  }
});

test('every arena exposes a complete lore-first stage doctrine',()=>{
  assert.equal(Object.keys(STAGE_TERRAINS).length,14);
  assert.equal(Object.keys(STAGE_SHIFT_STYLES).length,15);
  assert.equal(Object.keys(STAGE_EVENTS).length,22);
  const signatures=new Set();
  for(const stage of STAGES){
    const summary=stageDirectorSummary(stage);
    assert.ok(STAGE_TERRAINS[summary.terrain.id],`${stage.id}: terrain ${summary.terrain.id}`);
    assert.ok(STAGE_SHIFT_STYLES[summary.shift.style],`${stage.id}: shift ${summary.shift.style}`);
    assert.ok(stage.lore?.premise?.length>=16,`${stage.id}: lore premise`);
    assert.ok(stage.lore?.adaptationNotice?.includes('adaptation'),`${stage.id}: adaptation notice`);
    assert.ok(stage.visibility?.fog>=0&&stage.visibility?.fog<=1,`${stage.id}: fog`);
    assert.ok(stage.visibility?.darkness>=0&&stage.visibility?.darkness<=1,`${stage.id}: darkness`);
    assert.ok(stage.director?.events?.length>=1,`${stage.id}: events`);
    assert.ok(Array.isArray(stage.director?.hazardDeck),`${stage.id}: hazard deck`);
    assert.equal(stage.animationTracks.length,stage.animations.length,`${stage.id}: animation tracks`);
    assert.ok(stage.interactions.length>=1,`${stage.id}: interactions`);
    assert.ok(!signatures.has(stage.director.signature),`${stage.id}: duplicate doctrine signature`);
    signatures.add(stage.director.signature);
    for(const eventId of stage.director.events)assert.ok(STAGE_EVENTS[eventId],`${stage.id}: event ${eventId}`);
    for(const hazardId of stage.director.hazardDeck)assert.ok(STAGE_HAZARDS[hazardId],`${stage.id}: hazard ${hazardId}`);
    for(const interaction of stage.interactions){
      assert.ok(STAGE_EVENTS[interaction.event],`${stage.id}: interaction ${interaction.event}`);
      assert.ok(STAGE_INTERACTION_TRIGGERS[interaction.trigger],`${stage.id}: trigger ${interaction.trigger}`);
      assert.ok(interaction.triggerLabel?.length>=8,`${stage.id}: trigger label`);
      assert.equal(interaction.fidelityLabel,'MOTIF LORE · RÈGLE VERSUS');
      assert.match(interaction.fidelity,/adaptation/,`${stage.id}: fidelity`);
    }
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

test('film, Ascension and Townfall source packs are present',()=>{
  assert.equal(ROSTER.filter(f=>f.source==='film').length,13);
  assert.equal(ROSTER.filter(f=>f.source==='ascension').length,7);
  assert.equal(ROSTER.filter(f=>f.source==='townfall').length,5);
  assert.ok(STAGES.filter(s=>s.source==='film').length>=4);
  assert.ok(STAGES.filter(s=>s.source==='ascension').length>=3);
  assert.ok(CHRONICLES.some(route=>route.source==='film'));
  assert.ok(CHRONICLES.some(route=>route.source==='ascension'));
  assert.ok(CHRONICLES.some(route=>route.source==='townfall'));
});

test('every manifestation has complete dossier metadata',()=>{
  for(const fighter of ROSTER){
    assert.ok(fighter.name.trim().length>=2,fighter.id);
    assert.ok(fighter.signature.trim().length>=3,fighter.id);
    assert.ok(fighter.finisher.trim().length>=4,fighter.id);
    assert.ok(fighter.lore.trim().length>=8,fighter.id);
    assert.ok(fighter.canonicalBehavior.trim().length>=8,fighter.id);
    assert.ok(fighter.adaptation.trim().length>=8,fighter.id);
    assert.equal(fighter.fatalities.length,2,fighter.id);
    assert.ok(fighter.catalogueStatus&&fighter.nameStatus&&fighter.evidenceTier,fighter.id);
    for(const fatality of fighter.fatalities){
      assert.ok(fatality.name.length>=4,fighter.id);
      assert.ok(fatality.sequence.length>=3,fighter.id);
      assert.ok(fatality.canonicalBasis.length>=8,fighter.id);
    }
  }
});

test('combat profiles are playable, bounded and internally linked',()=>{
  for(const fighter of ROSTER){
    const profile=createCombatProfile(fighter);
    assert.ok(profile.maxHealth>=700&&profile.maxHealth<=1800,fighter.name);
    assert.ok(profile.speed>0&&profile.jump>0&&profile.reach>0,fighter.name);
    assert.equal(Object.keys(profile.moves).length,MOVESET_KEYS.length,fighter.name);
    assert.deepEqual(profile.moveset.order,MOVESET_KEYS,fighter.name);
    for(const [key,move] of Object.entries(profile.moves)){
      assert.ok(move.damage>0,`${fighter.name}/${key}`);
      assert.ok(move.startup>=0,`${fighter.name}/${key}`);
      assert.ok(move.reach>0,`${fighter.name}/${key}`);
      assert.ok(move.input&&move.canonicalBasis,`${fighter.name}/${key}`);
      assert.ok(MOVE_FIDELITY[move.fidelity],`${fighter.name}/${key}/${move.fidelity}`);
      if(move.effect)assert.ok(AFFLICTIONS[move.effect.id],`${fighter.name}/${key}/${move.effect.id}`);
      for(const cancel of move.cancelInto||[])assert.ok(profile.moves[cancel],`${fighter.name}/${key}/${cancel}`);
    }
  }
});

test('every source combatant exposes at least one directly attested action while adapted set-pieces remain labelled',()=>{
  for(const fighter of ROSTER){
    const summary=createCombatProfile(fighter).moveset.fidelitySummary;
    if(String(fighter.catalogueStatus).includes('adapted')) assert.ok(summary.composite+summary.adapted>=1,fighter.id);
    else assert.ok(summary.direct>=1,`${fighter.id}: aucune action directement attestée`);
  }
});

test('all 12 traits, 8 afflictions, 29 hazards, 9 rites and 12 AI personalities are represented',()=>{
  assert.equal(Object.keys(MANIFESTATION_TRAITS).length,12);
  assert.equal(Object.keys(AFFLICTIONS).length,8);
  assert.equal(Object.keys(STAGE_HAZARDS).length,29);
  assert.equal(Object.keys(RITUAL_MODIFIERS).length,9);
  assert.equal(Object.keys(AI_PERSONALITIES).length,12);
  const usedTraits=new Set(ROSTER.map(f=>f.trait));
  const usedAfflictions=new Set(ROSTER.map(f=>f.affliction));
  const usedHazards=new Set(STAGES.flatMap(stage=>[stage.hazard,...(stage.director?.hazardDeck||[])]));
  Object.keys(MANIFESTATION_TRAITS).forEach(id=>assert.ok(usedTraits.has(id),id));
  Object.keys(AFFLICTIONS).forEach(id=>assert.ok(usedAfflictions.has(id),id));
  Object.keys(STAGE_HAZARDS).forEach(id=>assert.ok(usedHazards.has(id)||AMBIENT_ONLY_HAZARDS.includes(id),id));
  for (const stage of STAGES) assert.ok(stage.director.hazardDeck.every(id=>!AMBIENT_ONLY_HAZARDS.includes(id)),stage.id);
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


test('coverage audit reports no known gap inside the v0.7.0 media scope',()=>{
  const audit=coverageAudit();
  assert.equal(audit.complete,true);
  assert.equal(Object.keys(audit.sources).length,Object.keys(SOURCE_META).length);
  for(const [source,entry] of Object.entries(audit.sources)){
    assert.equal(entry.complete,true,source);
    assert.deepEqual(entry.missing,[],source);
  }
});

test('legacy fighter IDs still resolve through the compatibility aliases',async()=>{
  const {getFighter}=await import('../src/data.js');
  assert.equal(getFighter('origins_nurse_075').name,'Faceless Nurse');
  assert.equal(getFighter('arcade_split_head_arcade_120').name,'Split Worm — Arcade');
  assert.equal(getFighter('sh1_air_screamer_001').name,'Air Screamer');
});

test('fatality and animation totals are derived from the live catalogue',()=>{
  assert.equal(CONTENT_STATS.fatalities,ROSTER.reduce((sum,f)=>sum+f.fatalities.length,0));
  assert.equal(CONTENT_STATS.stageFatalities,STAGES.filter(stage=>stage.fatality).length);
  assert.equal(CONTENT_STATS.stageAnimations,STAGES.reduce((sum,stage)=>sum+stage.animations.length,0));
  assert.equal(CONTENT_STATS.stageDirectorEvents,STAGES.reduce((sum,stage)=>sum+stage.director.events.length,0));
  assert.equal(CONTENT_STATS.stageInteractions,STAGES.reduce((sum,stage)=>sum+stage.interactions.length,0));
  assert.equal(CONTENT_STATS.stageHazardLinks,STAGES.reduce((sum,stage)=>sum+stage.director.hazardDeck.length,0));
  assert.equal(CONTENT_STATS.moves,ROSTER.length*MOVESET_KEYS.length);
  assert.equal(CONTENT_STATS.directCanonicalMoves+CONTENT_STATS.behaviorCompositeMoves+CONTENT_STATS.versusAdaptationMoves,CONTENT_STATS.moves);
});

test('stage lore premises remain readable and never fall back to raw catalogue taxonomy',()=>{
  for(const stage of STAGES){
    assert.ok(stage.lore?.premise?.length>=48,`${stage.id}: prémisse trop courte`);
    assert.doesNotMatch(stage.lore.premise,/utilise ses motifs de|ses éléments [a-z_]+/i,stage.id);
    assert.doesNotMatch(stage.lore.premise,/\b(beds|gurneys|lights|shops|shutters|pipes|grates|roots|runes|chains)\b/i,stage.id);
  }
});
