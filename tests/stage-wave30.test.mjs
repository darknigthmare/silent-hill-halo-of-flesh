import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {getStage} from '../src/data.js';
import {STAGE_BITMAPS} from '../src/stage-bitmap-manifest.js';
import {stageBitmapFor,stageBitmapFrames,validateStageBitmap} from '../src/stage-bitmaps.js';

const expected = [
  {id:'shimizu_residence',source:'shf',scene:'shf-residence-ii-dining-yellowed-calendar',state:'fixed-normal',ceiling:true,
    hashes:['20363814e1395109e6bbb7a172fec8e414389d8aeba926da547f7daade15e44c','5472ecd1cb2f006046fd082b8f7d7ee734671d6ba6550ff4124fab0b01b1f666']},
  {id:'arcade_toluca_lake',source:'arcade',scene:'arcade-stage3-area1-lakeside-quay',state:'fixed-normal',ceiling:false,
    hashes:['f7eaebf61af49d6d59be23d756852ae50b8a0f3c4c24da67b9272ecf0f50a319','d8482b1428658d29d3f003d3c57a27074ce3e68397f36bafecbb2d95dff23d12']},
  {id:'arcade_prison',source:'arcade',scene:'toluca-prison-otherworld-cell-corridor',state:'fixed-altered',ceiling:false,
    hashes:['0d6c58e355084cbe05de70b836cc7466ac7a3445f15443c831eafbd159d7c5b8','42f7a995d42d31c533f991d34434ddc653dbf92eba52ef96defcd453822d418d']}
];

test('wave30 keeps the documented room, source, fixed phase and ceiling contract',()=>{
  for(const item of expected){
    const stage=getStage(item.id);
    assert.equal(stage.id,item.id);
    assert.equal(stage.source,item.source);
    assert.notEqual(stage.reference?.blocked,true);
    assert.equal(stage.referencePolicy.sceneId,item.scene,item.id+': policy must select the produced room');
    assert.equal(stage.referencePolicy.worldState,item.state,item.id+': preserve the documented fixed phase');
    const art=stageBitmapFor(stage);
    assert.equal(art,STAGE_BITMAPS[item.id]);
    assert.equal(art.scene,item.scene);
    assert.equal(art.geometry.ceiling,item.ceiling,item.id+': painted geometry grants no new ceiling support');
    assert.equal(art.status,'integrated-candidate');
    assert.equal(art.fidelity,'unverified');
    assert.equal(validateStageBitmap(stage,art),art);
    assert.deepEqual(stage.referencePolicy.allowedHazards,[],item.id+': no new source-authorized hazard');
    assert.deepEqual(stage.referencePolicy.allowedEvents,[],item.id+': no new transition event');
    assert.deepEqual(stage.director.hazardDeck,[]);
    assert.deepEqual(stage.director.events,[]);
  }
  assert.match(getStage('shimizu_residence').name,/RESIDENCE II/u);
  assert.match(getStage('shimizu_residence').referencePolicy.normalPhaseLabel,/RESIDENCE II/u);
  const entrance=getStage('hinako_home');
  assert.match(entrance.name,/RESIDENCE I\b/u,'the distinct entry corridor must remain Residence I');
});

test('wave30 ships six exact native PNGs as independent static opaque and alpha planes',async()=>{
  const paths=new Set();
  let totalBytes=0;
  for(const item of expected){
    const stage=getStage(item.id),art=stageBitmapFor(stage);
    assert.equal(art.layers.length,2);
    const selected=stageBitmapFrames(stage);
    assert.equal(selected.length,2);
    assert.deepEqual(selected.map(frame=>frame.sha256),item.hashes);
    for(const [index,layer] of art.layers.entries()){
      assert.equal(layer.frames.length,1);
      assert.equal(layer.loop,false);
      assert.equal(layer.ticksPerFrame,1);
      assert.equal(layer.parallaxX,index===0?0:0.006);
      const frame=layer.frames[0];
      assert.ok(frame.path.startsWith('assets/stages/'+item.id+'.vague30.'));
      assert.ok(!paths.has(frame.path));paths.add(frame.path);
      const bytes=await readFile(new URL('../'+frame.path,import.meta.url));
      assert.equal(bytes.length,frame.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'),item.hashes[index]);
      assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
      assert.equal(bytes.subarray(12,16).toString('ascii'),'IHDR');
      assert.equal(bytes.readUInt32BE(16),1672);
      assert.equal(bytes.readUInt32BE(20),941);
      assert.equal(frame.width,1672);assert.equal(frame.height,941);
      assert.equal(bytes[25],index===0?2:6,'opaque RGB background / native RGBA foreground');
      totalBytes+=bytes.length;
    }
  }
  assert.equal(paths.size,6);
  assert.equal(totalBytes,7650389);
});
