import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {SPRITES} from '../src/sprite-manifest.js';
import {sampleSpriteClip} from '../src/sprite-animation.js';
import {previewSpriteState} from '../src/sprite-inspector.js';

// Execute the same metadata and probe plan used by the real HTTP workshop QA.
// This catches a newly delivered clip left in the historical missing-pose list
// before Chromium setup; it does not replace the browser assertions themselves.
const report=JSON.parse(execFileSync(process.execPath,['scripts/http-qa-art-batch4.mjs','--metadata-only'],
  {cwd:new URL('../',import.meta.url),encoding:'utf8',maxBuffer:2*1024*1024}));

test('the SH3 revolver Nurse light attack is a positive clip and heavy attack remains a missing-pose probe',()=>{
  const id='sh3_nurse_revolver_044',contract=report.contracts.find(row=>row.id===id);
  assert.equal(report.passed,true);
  assert.deepEqual(contract.expectedClips.neutralLight,[2]);
  assert.equal(contract.absentPoses.includes('neutralLight'),false);
  assert.equal(contract.absentPoses.includes('neutralHeavy'),true);
  const present=sampleSpriteClip(SPRITES[id],previewSpriteState('neutralLight',0));
  assert.equal(present.pose,'neutralLight');assert.equal(present.frameIndex,2);assert.equal(present.fallback,false);
  const absent=sampleSpriteClip(SPRITES[id],previewSpriteState('neutralHeavy',0));
  assert.equal(absent.pose,'idle');assert.equal(absent.frameIndex,0);assert.equal(absent.fallback,true);
});

test('every historical negative workshop probe remains absent and resolves to the explicit static idle fallback',()=>{
  let probes=0;
  for(const {id,expectedClips,absentPoses} of report.contracts){
    assert.ok(absentPoses.length>0,id+' keeps negative coverage');
    for(const pose of absentPoses){
      assert.equal(Object.hasOwn(expectedClips,pose),false,id+': '+pose+' is not a declared clip');
      const sample=sampleSpriteClip(SPRITES[id],previewSpriteState(pose,0));
      assert.equal(sample.requested,pose,id+': requested pose');
      assert.equal(sample.pose,'idle',id+': '+pose+' resolved pose');
      assert.equal(sample.frameIndex,0,id+': '+pose+' static idle frame');
      assert.equal(sample.fallback,true,id+': '+pose+' fallback signal');
      probes++;
    }
  }
  assert.ok(probes>=500,'historical negative coverage is retained');
});
