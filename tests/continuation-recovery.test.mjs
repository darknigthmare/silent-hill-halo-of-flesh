import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, RITUAL_MODIFIERS, getFighter, getStage, createCombatProfile } from '../src/data.js';
import { KEYS, MEMORY_SCHEMA, importMemory } from '../src/save-store.js';
import { createRun, loadRun, validateRun, runEncounterRules, settleRun, resumeRun } from '../src/run-progress.js';
import { defaultControls, loadControls, validControls } from '../src/player-input.js';
import { FightEngine } from '../src/fight.js';

class Memory {
  constructor(){this.data=new Map();this.writes=0;}
  getItem(key){return this.data.get(key)??null;}
  setItem(key,value){this.writes++;this.data.set(key,String(value));}
  removeItem(key){this.data.delete(key);}
}
const validators={[KEYS.run]:validateRun,[KEYS.controls]:validControls};
const makeRun=seed=>createRun({mode:'arcade',playerId:ROSTER[0].id,seed});

test('Descente ends on a boss for every sampled seed without duplicate opponents',()=>{
  for(let seed=0;seed<32;seed++){
    const run=makeRun(seed);
    assert.equal(ROSTER.find(f=>f.id===run.queue.at(-1)).boss,true,`seed ${seed}: promised final boss`);
    assert.equal(run.queue.length,7);
    assert.equal(new Set(run.queue).size,7);
    assert.ok(!run.queue.includes(run.playerId));
    assert.ok(validateRun(run));
    assert.deepEqual(makeRun(seed).queue,run.queue);
  }
});

test('every Rite encounter applies its actual modifier to the engine across checkpoint recovery',()=>{
  globalThis.window={};globalThis.localStorage=new Memory();
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  const context=new Proxy({},{get:()=>()=>{},set:()=>true});
  let run=createRun({mode:'ritual',playerId:ROSTER[0].id,seed:18,rules:{ritualId:'none'}});
  const savedRules=structuredClone(run.rules);
  for(let index=0;index<run.queue.length;index++){
    const storage=new Memory();storage.setItem(KEYS.run,JSON.stringify(run));
    run=loadRun(storage);assert.ok(run);
    const rules=runEncounterRules(run),modifier=RITUAL_MODIFIERS[run.rituals[index]];
    const engine=new FightEngine({getContext:()=>context},{...rules,
      p1:getFighter(run.playerId),p2:getFighter(run.queue[index]),stage:getStage(run.stages[index])});
    try {
      assert.equal(engine.ritual.id,run.rituals[index]);
      assert.equal(engine.ritual.lifeDrain,modifier.lifeDrain);
      const profile=createCombatProfile(getFighter(run.playerId));
      assert.equal(engine.actors[0].maxGuard,Math.round(profile.guard*(modifier.guardScale||1)));
      assert.equal(engine.actors[0].profile.speed,profile.speed*(modifier.speedScale||1));
      if(modifier.startOtherworld)assert.equal(engine.world.phase,'otherworld');
      assert.deepEqual(run.rules,savedRules,'deriving an encounter must not rewrite saved defaults');
    } finally {engine.destroy();}
    run=settleRun(run,{winnerIndex:0,stats:{winner:{healthRatio:.75}},snapshot:{p1:{meter:0}}});
    if(run.status!=='complete')run=resumeRun(run);
  }
  assert.equal(run.status,'complete');
});

test('non-Rite routes keep their selected modifier and ordinary duels keep their own rules',()=>{
  const run=createRun({mode:'boss',playerId:ROSTER[0].id,seed:19,rules:{ritualId:'bloodDebt',stageHazards:false}});
  assert.equal(runEncounterRules(run).ritualId,'bloodDebt');
  assert.equal(runEncounterRules(run).stageHazards,false);
  assert.deepEqual(runEncounterRules(null),{});
});

test('atomic memory import preserves the valid route backup beneath an invalid primary',()=>{
  const storage=new Memory(),previous=makeRun(5),next=makeRun(6);
  storage.setItem(KEYS.run+':backup',JSON.stringify(previous));
  storage.setItem(KEYS.run,JSON.stringify({...previous,playerId:'not-a-fighter'}));
  importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.run]:next,[KEYS.records]:{wins:1}}},storage,validators);
  assert.deepEqual(JSON.parse(storage.getItem(KEYS.run+':backup')),previous);
  storage.setItem(KEYS.run,'{broken');
  assert.deepEqual(loadRun(storage),previous);
});

test('atomic memory import preserves custom-control recovery beneath conflicting bindings',()=>{
  const storage=new Memory(),previous=defaultControls();previous.players[0].light='KeyB';
  const bad=structuredClone(previous);bad.players[1].light='KeyB';
  storage.setItem(KEYS.controls+':backup',JSON.stringify(previous));
  storage.setItem(KEYS.controls,JSON.stringify(bad));
  importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.controls]:defaultControls()}},storage,validators);
  storage.setItem(KEYS.controls,'{broken');
  assert.deepEqual(loadControls(storage),previous);
});

test('domain-invalid memory import refuses every write, including unrelated valid records',()=>{
  const storage=new Memory(),run=makeRun(7);
  storage.setItem(KEYS.records,JSON.stringify({wins:8}));
  const before=[...storage.data],writes=storage.writes;
  assert.throws(()=>importMemory({schema:MEMORY_SCHEMA,entries:{
    [KEYS.records]:{wins:90},[KEYS.run]:{...run,playerId:'not-a-fighter'}
  }},storage,validators),/refusée/);
  assert.deepEqual([...storage.data],before);assert.equal(storage.writes,writes);
});

test('domain-aware memory import rolls back primaries and backups after a partial write',()=>{
  const storage=new Memory(),previous=makeRun(8),next=makeRun(9);
  storage.setItem(KEYS.run+':backup',JSON.stringify(previous));
  storage.setItem(KEYS.run,JSON.stringify({...previous,playerId:'not-a-fighter'}));
  storage.setItem(KEYS.records,JSON.stringify({wins:8}));
  const before=[...storage.data];let failed=false;
  const set=storage.setItem.bind(storage);
  storage.setItem=(key,value)=>{
    if(key===KEYS.records&&!failed){failed=true;throw new Error('Quota');}
    set(key,value);
  };
  assert.throws(()=>importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.run]:next,[KEYS.records]:{wins:9}}},storage,validators),/restaurée/);
  assert.deepEqual([...storage.data],before);
  assert.deepEqual(loadRun(storage),previous);
});

function knockoutFixture({wins=[0,0],winner=0,round=1}={}) {
  globalThis.window={};globalThis.localStorage=new Memory();
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  const context=new Proxy({},{get:()=>()=>{},set:()=>true});
  const engine=new FightEngine({getContext:()=>context},{p1:ROSTER[0],p2:ROSTER[1],
    stage:getStage('hotel_otherworld'),mode:'local',roundsToWin:2,fatalities:true,stageFatalities:true});
  engine.phase='fight';engine.round=round;
  engine.actors.forEach((actor,index)=>{actor.roundWins=wins[index];});
  const attacker=engine.actors[winner],target=engine.actors[1-winner];
  target.health=0;target.lastHit={attackerIndex:winner,isSuper:true,environmental:false};
  return {engine,attacker,target};
}

test('a first-round knockout ends the round without a character or stage fatality',()=>{
  const {engine,attacker,target}=knockoutFixture();
  try {
    engine.resolveKnockouts();assert.equal(engine.phase,'roundEnd');
    assert.equal(engine.fatality,null);assert.equal(attacker.roundWins,1);
    assert.equal(target.ko,true);assert.equal(attacker.stats.fatalities,0);
    engine.finishRoundTransition();assert.equal(engine.phase,'intro');assert.equal(engine.round,2);
    assert.equal(target.ko,false);assert.equal(target.health,target.maxHealth);
  } finally {engine.destroy();}
});

test('an equalizing knockout uses the winning slot score, not the leading opponent or round number',()=>{
  const {engine,attacker}=knockoutFixture({wins:[1,0],winner:1,round:3});
  try {
    engine.resolveKnockouts();assert.equal(engine.phase,'roundEnd');
    assert.equal(engine.fatality,null);assert.equal(attacker.roundWins,1);
    assert.deepEqual(engine.actors.map(actor=>actor.roundWins),[1,1]);
    engine.finishRoundTransition();assert.equal(engine.phase,'intro');
  } finally {engine.destroy();}
});

test('a match-winning knockout keeps the existing finisher and settles one final victory',()=>{
  const {engine,attacker}=knockoutFixture({wins:[0,1],winner:1,round:2});let results=0;
  engine.callbacks.onMatchEnd=()=>results++;
  try {
    engine.resolveKnockouts();assert.equal(engine.phase,'fatality');assert.ok(engine.fatality);
    assert.equal(attacker.roundWins,1);engine.completeFatality();
    assert.equal(engine.phase,'roundEnd');assert.equal(attacker.roundWins,2);
    assert.equal(attacker.stats.fatalities,1);engine.finishRoundTransition();engine.finishRoundTransition();
    assert.equal(engine.phase,'matchEnd');assert.equal(results,1);
  } finally {engine.destroy();}
});
