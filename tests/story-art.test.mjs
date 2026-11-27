import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {storyArtwork,storyOpeningArtwork,storyEndingArtwork} from '../src/story-art.js';
import {auditStoryArtwork} from '../scripts/build-story-art.mjs';
import {storyPlan} from '../src/tournament.js';

const id='sh1_air_screamer_001';
const stories=[
  {id,source:'sh1',stageId:'old_silent_hill'},
  {id:'sh1_groaner_003',source:'sh1',stageId:'old_silent_hill'},
  {id:'sh2_lying_figure_020',source:'sh2',stageId:'south_vale'}
];
test('individual artwork binds its exact original profiles and never crosses source variants',()=>{
  for(const item of stories){
    const art=storyArtwork(item.id);
    assert.equal(art.fighterId,item.id);assert.equal(art.source,item.source);assert.equal(art.stageId,item.stageId);
    assert.equal(art.status,'integrated-candidate');assert.equal(art.fidelity,'unverified');
  }
  for(const other of ['bom_air_screamer_121','sh1_wormhead_004','sh2_lying_figure_crawling_021','film_lying_figure_return_to_silent_hill','__proto__','constructor',undefined])assert.equal(storyArtwork(other),null);
});
test('story opening appears only on entry to the first chapter of the matching story',()=>{
  for(const {id} of stories){
    const run={mode:'story',playerId:id,index:0,queue:storyPlan(id).queue,stages:storyPlan(id).stages};
    assert.equal(storyOpeningArtwork(run),storyArtwork(id).intro);
    assert.equal(storyOpeningArtwork(run,false),null);
    for(const index of [-1,1,2,undefined,0.5])assert.equal(storyOpeningArtwork({...run,index}),null);
    for(const mode of ['chronicle','versus','tournament'])assert.equal(storyOpeningArtwork({...run,mode}),null);
  }
  assert.equal(storyOpeningArtwork(null),null);
});
test('individual ending requires completion and cannot appear after a single win or defeat',()=>{
  for(const {id} of stories){
    for(const status of ['playing','won','lost',undefined])assert.equal(storyEndingArtwork({mode:'story',playerId:id,status}),null);
    assert.equal(storyEndingArtwork({mode:'story',playerId:id,status:'complete'}),storyArtwork(id).ending);
    assert.equal(storyEndingArtwork({mode:'chronicle',playerId:id,status:'complete'}),null);
  }
  assert.equal(storyEndingArtwork({mode:'story',playerId:'bom_air_screamer_121',status:'complete'}),null);
});
test('individual story files decode at native dimensions and match their exact hashes',async()=>{
  const report=await auditStoryArtwork();
  assert.equal(report.stories,3);assert.equal(report.illustrations,6);assert.equal(new Set(report.entries.map(e=>e.sha256)).size,6);
  assert.ok(report.entries.every(e=>e.width===1672&&e.height===941&&!e.animated));
});
test('story artwork preserves route admission and stays separate from chronological campaign design',()=>{
  for(const {id,source} of stories){
    const before=storyPlan(id),copy=structuredClone(before);
    storyOpeningArtwork({mode:'story',playerId:id,index:0,...before});
    storyEndingArtwork({mode:'story',playerId:id,status:'complete'});
    assert.deepEqual(storyPlan(id),copy);
    assert.equal(before.chapterCount,4);
    assert.ok(before.queue.every(other=>other.startsWith(source+'_')));
  }
  const lisa=storyPlan('pt_lisa_149');
  assert.equal(lisa.combatEnabled,true);assert.equal(lisa.queue.length,0);
});
test('offline shell includes the story module and every candidate illustration',async()=>{
  const worker=await readFile(new URL('../service-worker.js',import.meta.url),'utf8');
  assert.ok(worker.includes("'/src/story-art.js'"));
  for(const {id} of stories)for(const scene of [storyArtwork(id).intro,storyArtwork(id).ending])assert.ok(worker.includes('/'+scene.path));
});
