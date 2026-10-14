import test from 'node:test';
import assert from 'node:assert/strict';
import { ROSTER, STAGES, CHRONICLES } from '../src/data.js';
import { KEYS, MEMORY_SCHEMA, readState, writeState, importMemory, exportMemory, validateEntry } from '../src/save-store.js';
import { createRun, validateRun, resumeRun, settleRun, saveRun, loadRun, stageForFighter, updateRecords, playerOutcome, runSummary, normalizeRules } from '../src/run-progress.js';
import { defaultControls, validControls, rebindControl, GamepadSlots, loadControls } from '../src/player-input.js';

class Memory {
  constructor(){this.data=new Map();this.writes=0;this.failAt=-1;}
  getItem(k){return this.data.get(k)??null;}
  setItem(k,v){this.writes++;if(this.writes===this.failAt)throw new Error('Quota');this.data.set(k,v);}
  removeItem(k){this.data.delete(k);}
}
const make=(mode='arcade',extra={})=>createRun({mode,playerId:ROSTER[0].id,seed:1024,...extra});
const result=(won=true,extra={})=>({winnerIndex:won?0:1,winner:ROSTER[0],loser:ROSTER[0],
  stats:{winner:{healthRatio:.6,perfectGuards:8,maxCombo:3},loser:{healthRatio:.1,perfectGuards:1,maxCombo:1}},snapshot:{p1:{meter:80}},...extra});

test('save: schema validation refuses malformed favorites/chronicles/maps before UI reads',()=>{
  for(const [k,v] of [[KEYS.favorites,{ids:8}],[KEYS.chronicles,{completed:{}}],[KEYS.records,{wins:'abc'}],[KEYS.settings,{masterVolume:Infinity}]])
    assert.equal(validateEntry(k,v),false);
});
test('save: unknown keys with a familiar prefix are not an import allowlist',()=>{
  const s=new Memory();assert.throws(()=>importMemory({schema:MEMORY_SCHEMA,entries:{'sh-halo-of-flesh-unknown':{}}},s));assert.equal(s.writes,0);
});
test('save: prototype pollution nested inside an allowed entry is refused',()=>{
  const s=new Memory();const entries=JSON.parse('{"sh-halo-of-flesh-records-v1":{"defeated":{"__proto__":{"polluted":true}}}}');
  assert.throws(()=>importMemory({schema:MEMORY_SCHEMA,entries},s));assert.equal({}.polluted,undefined);assert.equal(s.writes,0);
});
test('save: validates the entire import before any write',()=>{
  const s=new Memory();assert.throws(()=>importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.records]:{wins:4},[KEYS.favorites]:{ids:'bad'}}},s));assert.equal(s.writes,0);
});
test('save: failed multi-key import restores all old keys and backups',()=>{
  const s=new Memory();writeState(KEYS.records,{wins:3},s);writeState(KEYS.favorites,{ids:['before']},s);
  const before=[...s.data];s.failAt=s.writes+4;
  assert.throws(()=>importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.records]:{wins:9},[KEYS.favorites]:{ids:['after']}}},s),/annulé/);
  assert.deepEqual([...s.data],before);
});
test('save: damaged primary data recovers the previous valid version',()=>{
  const s=new Memory();writeState(KEYS.records,{wins:3},s);writeState(KEYS.records,{wins:4},s);s.setItem(KEYS.records,'{broken');
  assert.deepEqual(readState(KEYS.records,{},s),{wins:3});
});
test('save: quota failure returns null without claiming a successful write',()=>{
  const s=new Memory();writeState(KEYS.records,{wins:3},s);s.failAt=s.writes+2;
  assert.equal(writeState(KEYS.records,{wins:4},s),null);assert.equal(readState(KEYS.records,{},s).wins,3);
});
test('save: exports only valid primary data, never unrelated site data or backup keys',()=>{
  const s=new Memory();s.setItem('other-game','private');writeState(KEYS.records,{wins:2},s);writeState(KEYS.records,{wins:3},s);
  const p=exportMemory('0.9.0',s);assert.deepEqual(Object.keys(p.entries),[KEYS.records]);assert.equal(p.entries[KEYS.records].wins,3);
});
test('save: oversized and future-schema imports are refused',()=>{
  assert.throws(()=>importMemory({schema:'shhf-memory-v99',entries:{[KEYS.records]:{wins:1}}},new Memory()));
  assert.throws(()=>importMemory({schema:MEMORY_SCHEMA,entries:{[KEYS.favorites]:{ids:['x'.repeat(2_000_001)]}}},new Memory()));
});
for(const mode of ['arcade','boss','ritual'])test(`run ${mode}: deterministic queue, distinct enemies and source-associated stages`,()=>{
  const a=make(mode),b=make(mode);assert.ok(validateRun(a));assert.deepEqual(a.queue,b.queue);assert.deepEqual(a.stages,b.stages);
  assert.equal(new Set(a.queue).size,a.queue.length);assert.ok(!a.queue.includes(a.playerId));
  a.queue.forEach((id,i)=>assert.equal(ROSTER.find(f=>f.id===id).source,STAGES.find(s=>s.id===a.stages[i]).source));
});
test('run: malformed or fabricated chronicle queue cannot bypass the canonical route',()=>{
  assert.throws(()=>make('chronicle',{routeId:'fabricated'}));const r=make('chronicle',{routeId:CHRONICLES[0].id});
  assert.deepEqual(r.queue,CHRONICLES[0].fighters);r.queue=r.queue.slice(0,1);r.stages=r.stages.slice(0,1);assert.equal(validateRun(r),false);
});
test('run: reload during a fight resumes the same encounter/rules/initial endurance',()=>{
  const s=new Memory();let r=make('boss',{rules:{difficulty:'hard',stageHazards:false,roundsToWin:1}});
  r=resumeRun(settleRun(r,result()));saveRun(r,s);const restored=resumeRun(loadRun(s));
  assert.equal(restored.index,1);assert.equal(restored.rules.difficulty,'hard');assert.equal(restored.rules.stageHazards,false);
  assert.equal(restored.carryHealth,.78);assert.equal(restored.carryMeter,44);assert.deepEqual(restored.queue,r.queue);
});
test('run: lost encounter retries without incrementing wins or changing opponents',()=>{
  const r=make('boss'), lost=settleRun(r,result(false)),retry=resumeRun(lost);
  assert.equal(lost.status,'lost');assert.equal(retry.status,'ready');assert.equal(retry.wins,0);assert.equal(retry.carryHealth,1);assert.deepEqual(retry.queue,r.queue);
});
test('run: winner checkpoint advances exactly once even if Continue is activated repeatedly',()=>{
  const won=settleRun(make(),result());assert.equal(won.wins,1);assert.strictEqual(settleRun(won,result()),won);
  const next=resumeRun(won);assert.equal(next.index,1);assert.equal(resumeRun(next).index,1);
});
test('run: complete runs cannot be resumed or farm additional victories',()=>{
  let r=make();for(let i=0;i<r.queue.length;i++){r=settleRun(r,result());if(r.status!=='complete')r=resumeRun(r);}
  assert.equal(r.status,'complete');assert.equal(r.wins,r.queue.length);assert.equal(resumeRun(r),null);assert.strictEqual(settleRun(r,result()),r);
});
test('run: invalid indices, unknown IDs, fabricated wins and future schema are rejected',()=>{
  const r=make();for(const v of [{...r,index:99},{...r,playerId:'wrong'},{...r,queue:['wrong']},{...r,wins:2},{...r,schema:2}])assert.equal(validateRun(v),false);
});
test('run: stage association covers all inherited roster entries without crossing sources',()=>{
  for(const f of ROSTER)assert.equal(STAGES.find(s=>s.id===stageForFighter(f.id)).source,f.source);
});
test('rules: numeric inputs and unknown difficulty are normalized to supported settings',()=>{
  const r=normalizeRules({roundsToWin:'3',timeLimit:'infinite',difficulty:'impossible'});assert.equal(r.roundsToWin,3);assert.equal(r.timeLimit,99);assert.equal(r.difficulty,'normal');
});
test('results: losing a mirror match never counts as a P1 victory',()=>{
  const outcome=playerOutcome(result(false));assert.equal(outcome.won,false);assert.equal(outcome.stats.perfectGuards,1);
  const records=updateRecords({},result(false),'mirror-test',ROSTER[0].id,'D');assert.equal(records.wins,0);assert.equal(records.perfectGuards,1);
});
test('results: opponent statistics cannot become personal records on defeat',()=>{
  const r=updateRecords({},result(false),'loss',ROSTER[0].id,'D');assert.equal(r.perfectGuards,1);assert.equal(r.matches,1);assert.deepEqual(r.defeated,{});
});
test('results: duplicate callback is idempotent for all lifetime counters',()=>{
  const a=updateRecords({},result(),'match1',ROSTER[1].id,'A');const b=updateRecords(a,result(),'match1',ROSTER[1].id,'A');assert.strictEqual(a,b);assert.equal(b.wins,1);
});
test('results: route summary uses the whole route, not merely the final encounter',()=>{
  const r=make();r.results=[{stats:{healthRatio:.1,maxCombo:2}},{stats:{healthRatio:.9,maxCombo:8}}];assert.equal(runSummary(r).healthRatio,.5);assert.equal(runSummary(r).maxCombo,8);
});
for(const route of CHRONICLES)test(`chronicle state-machine: ${route.id} survives save/reload at every encounter`,()=>{
  const s=new Memory();let run=make('chronicle',{routeId:route.id});
  for(let i=0;i<route.fighters.length;i++){
    assert.equal(run.index,i);saveRun(run,s);run=loadRun(s);assert.ok(run);
    run=settleRun(run,result());saveRun(run,s);run=loadRun(s);assert.equal(run.wins,i+1);
    if(i<route.fighters.length-1)run=resumeRun(run);
  }
  assert.equal(run.status,'complete');assert.equal(run.results.length,route.fighters.length);
});
test('controls: defaults cover both subjects without shared keys',()=>{assert.ok(validControls(defaultControls()));});
test('controls: rebinding survives storage/reload without modifying defaults',()=>{
  const s=new Memory(),c=rebindControl(defaultControls(),0,'light','KeyB');writeState(KEYS.controls,c,s);assert.equal(loadControls(s).players[0].light,'KeyB');assert.equal(defaultControls().players[0].light,'KeyJ');
});
test('controls: conflicts on either subject, Escape and browser keys are refused',()=>{
  const c=defaultControls();for(const k of ['KeyK','KeyF','Escape','F5','Tab','ControlLeft'])assert.throws(()=>rebindControl(c,0,'light',k));
});
test('controls: corrupt keyboard layouts fall back safely',()=>{
  const s=new Memory(),c=defaultControls();c.players[1].light=c.players[0].light;s.setItem(KEYS.controls,JSON.stringify(c));assert.deepEqual(loadControls(s),defaultControls());
});
const pad=(index,id='pad')=>({index,id,mapping:'standard',connected:true,buttons:Array.from({length:17},()=>({pressed:false})),axes:[0,0]});
test('gamepads: sparse browser indices are assigned to playable slots',()=>{
  const r=new GamepadSlots(),p=pad(3);assert.equal(r.poll([null,null,null,p]).pads[0],p);
});
test('gamepads: P2 is not reassigned to P1 when P1 disconnects',()=>{
  const r=new GamepadSlots(),a=pad(0,'one'),b=pad(3,'two');r.poll([a,null,null,b]);const next=r.poll([null,null,null,b]);
  assert.equal(next.pads[0],null);assert.equal(next.pads[1],b);assert.equal(next.lost[0],true);
});
test('gamepads: reconnect is marked as a change so held buttons do not fire on arrival',()=>{
  const r=new GamepadSlots(),p=pad(1);r.poll([null,p]);r.poll([]);assert.equal(r.poll([null,p]).changed[0],true);
});

test('run import rejects extra rule objects, unsupported settings and invalid seeds',()=>{
  const r=make();for(const value of [{...r,rules:{...r.rules,p1:{}}},{...r,rules:{...r.rules,timeLimit:-1}},{...r,seed:-1}])assert.equal(validateRun(value),false);
});
