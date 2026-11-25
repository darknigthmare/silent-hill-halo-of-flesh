import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {storyArtwork,storyOpeningArtwork,storyEndingArtwork} from '../src/story-art.js';
import {auditStoryArtwork} from '../scripts/build-story-art.mjs';
import {storyPlan} from '../src/tournament.js';

const id='sh1_air_screamer_001';
test('individual artwork binds only the original SH1 Air Screamer',()=>{
  const art=storyArtwork(id);
  assert.equal(art.fighterId,id);assert.equal(art.source,'sh1');assert.equal(art.stageId,'old_silent_hill');
  for(const other of ['bom_air_screamer_121','sh1_groaner_003','__proto__','constructor',undefined])assert.equal(storyArtwork(other),null);
});
test('story opening appears only on entry to the first chapter of the matching story',()=>{
  const run={mode:'story',playerId:id,index:0,queue:storyPlan(id).queue,stages:storyPlan(id).stages};
  assert.equal(storyOpeningArtwork(run),storyArtwork(id).intro);
  assert.equal(storyOpeningArtwork(run,false),null);
  for(const index of [-1,1,2,undefined,0.5])assert.equal(storyOpeningArtwork({...run,index}),null);
  for(const mode of ['chronicle','versus','tournament'])assert.equal(storyOpeningArtwork({...run,mode}),null);
  assert.equal(storyOpeningArtwork(null),null);
});
test('individual ending requires completion and cannot appear after a single win or defeat',()=>{
  for(const status of ['playing','won','lost',undefined])assert.equal(storyEndingArtwork({mode:'story',playerId:id,status}),null);
  assert.equal(storyEndingArtwork({mode:'story',playerId:id,status:'complete'}),storyArtwork(id).ending);
  assert.equal(storyEndingArtwork({mode:'chronicle',playerId:id,status:'complete'}),null);
  assert.equal(storyEndingArtwork({mode:'story',playerId:'bom_air_screamer_121',status:'complete'}),null);
});
test('individual story files decode at native dimensions and match their exact hashes',async()=>{
  const report=await auditStoryArtwork();
  assert.equal(report.stories,1);assert.equal(report.illustrations,2);assert.equal(new Set(report.entries.map(e=>e.sha256)).size,2);
  assert.ok(report.entries.every(e=>e.width===1672&&e.height===941&&!e.animated));
});
test('story artwork preserves route admission and stays separate from chronological campaign design',()=>{
  const before=storyPlan(id),copy=structuredClone(before);
  storyOpeningArtwork({mode:'story',playerId:id,index:0,...before});
  storyEndingArtwork({mode:'story',playerId:id,status:'complete'});
  assert.deepEqual(storyPlan(id),copy);
  assert.equal(before.chapterCount,4);
  assert.ok(before.queue.every(other=>other.startsWith('sh1_')));
  const lisa=storyPlan('pt_lisa_149');
  assert.equal(lisa.combatEnabled,true);assert.equal(lisa.queue.length,0);
});
test('offline shell includes the story module and both candidate images',async()=>{
  const worker=await readFile(new URL('../service-worker.js',import.meta.url),'utf8');
  assert.ok(worker.includes("'/src/story-art.js'"));
  for(const scene of [storyArtwork(id).intro,storyArtwork(id).ending])assert.ok(worker.includes('/'+scene.path));
});
