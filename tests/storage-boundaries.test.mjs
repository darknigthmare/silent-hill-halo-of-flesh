import test from 'node:test';
import assert from 'node:assert/strict';
import { KEYS, readState, writeState, removeState, exportMemory } from '../src/save-store.js';
import { createRun, saveRun, loadRun, validateRun } from '../src/run-progress.js';
import { defaultControls, loadControls, saveControls } from '../src/player-input.js';
import { ROSTER } from '../src/data.js';
class Memory {constructor(){this.data=new Map();}getItem(k){return this.data.get(k)??null;}setItem(k,v){this.data.set(k,String(v));}removeItem(k){this.data.delete(k);}}

test('run recovery uses valid backup if primary has an unknown fighter despite valid JSON/schema',()=>{
  const s=new Memory(),r=createRun({mode:'arcade',playerId:ROSTER[0].id,seed:5});saveRun(r,s);
  s.setItem(KEYS.run+':backup',JSON.stringify(r));s.setItem(KEYS.run,JSON.stringify({...r,playerId:'nonexistent'}));
  assert.deepEqual(loadRun(s),r);
});
test('run recovery uses backup for inconsistent wins, without rewriting either source',()=>{
  const s=new Memory(),r=createRun({mode:'boss',playerId:ROSTER[0].id,seed:5});saveRun(r,s);
  s.setItem(KEYS.run+':backup',JSON.stringify(r));s.setItem(KEYS.run,JSON.stringify({...r,wins:4}));const before=[...s.data];
  assert.deepEqual(loadRun(s),r);assert.deepEqual([...s.data],before);
});
test('control recovery preserves previous custom key when primary has conflicting bindings',()=>{
  const s=new Memory(),c=defaultControls();c.players[0].light='KeyB';saveControls(c,s);
  s.setItem(KEYS.controls+':backup',JSON.stringify(c));const bad=structuredClone(c);bad.players[1].light=bad.players[0].light;s.setItem(KEYS.controls,JSON.stringify(bad));
  assert.deepEqual(loadControls(s),c);
});
test('domain-invalid primary and backup do not pass through fallback validation',()=>{
  const s=new Memory(),c=defaultControls();c.players[0].light='Escape';s.setItem(KEYS.controls,JSON.stringify(c));s.setItem(KEYS.controls+':backup',JSON.stringify(c));
  assert.deepEqual(loadControls(s),defaultControls());assert.equal(loadRun(s),null);
});
test('failed backup deletion leaves the primary checkpoint intact',()=>{
  const s=new Memory();writeState(KEYS.records,{wins:1},s);writeState(KEYS.records,{wins:2},s);
  s.removeItem=k=>{if(k.endsWith(':backup'))throw Error('blocked');s.data.delete(k);};
  assert.equal(removeState(KEYS.records,s),false);assert.deepEqual(readState(KEYS.records,{},s),{wins:2});
});
test('successful removal deletes both current and backup without resurrecting progress',()=>{
  const s=new Memory();writeState(KEYS.records,{wins:1},s);writeState(KEYS.records,{wins:2},s);
  assert.equal(removeState(KEYS.records,s),true);assert.deepEqual(readState(KEYS.records,{},s),{});assert.equal(s.data.size,0);
});

test('saving a recovered run does not promote a domain-invalid primary over a valid backup',()=>{
  const s=new Memory(),r=createRun({mode:'boss',playerId:ROSTER[0].id,seed:6});
  s.setItem(KEYS.run+':backup',JSON.stringify(r));s.setItem(KEYS.run,JSON.stringify({...r,playerId:'unknown'}));
  saveRun({...loadRun(s),updatedAt:r.updatedAt+1},s);
  assert.deepEqual(JSON.parse(s.getItem(KEYS.run+':backup')),r);
});
test('saving recovered custom controls preserves the usable backup',()=>{
  const s=new Memory(),c=defaultControls();c.players[0].light='KeyB';
  s.setItem(KEYS.controls+':backup',JSON.stringify(c));const bad=structuredClone(c);bad.players[1].light='KeyB';
  s.setItem(KEYS.controls,JSON.stringify(bad));saveControls(loadControls(s),s);
  assert.deepEqual(JSON.parse(s.getItem(KEYS.controls+':backup')),c);
});
test('validated memory export selects recovered route, not the domain-invalid primary',()=>{
  const s=new Memory(),r=createRun({mode:'arcade',playerId:ROSTER[0].id,seed:7});
  s.setItem(KEYS.run+':backup',JSON.stringify(r));s.setItem(KEYS.run,JSON.stringify({...r,wins:99}));
  assert.deepEqual(exportMemory('test',s,{[KEYS.run]:validateRun}).entries[KEYS.run],r);
});
