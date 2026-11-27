import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {getStage} from '../src/data.js';
import {STAGE_REFERENCES} from '../src/production-reference.js';
import {stageBitmapFor,stageBitmapFrames,validateStageBitmap} from '../src/stage-bitmaps.js';
import {stageReferenceEventAllowed,stageReferenceHazardAllowed,stageReferenceTrackAllowed} from '../src/stage-reference-policy.js';
import {stageReferenceHTML} from '../src/reference-ui.js';
import {drawStageReferenceTracks} from '../src/stage-cinematics.js';

const cases=[
  {id:'cedar_grove',source:'origins',scene:'female-treatment-mirror'},
  {id:'wish_house',source:'sh4',scene:'sh4-first-visit-scripture-corner'},
];

test('wave31 selects the documented fixed scene without enabling its opposite phase or hazards',()=>{
  for(const item of cases){
    const stage=getStage(item.id),art=stageBitmapFor(stage);
    assert.equal(stage.source,item.source);
    assert.equal(stage.reference.blocked,false);
    assert.equal(stage.referencePolicy.sceneId,item.scene);
    assert.equal(stage.referencePolicy.worldState,'fixed-normal');
    assert.equal(stage.shift.enabled,false);
    assert.equal(stage.shift.startOtherworld,false);
    assert.equal(stage.weather,'none');
    assert.equal(stage.referencePolicy.terrainRules,false);
    assert.equal(stage.referencePolicy.automaticFinishers,false);
    assert.deepEqual(stage.director.events,[]);
    assert.deepEqual(stage.director.hazardDeck,[]);
    assert.equal(art.scene,item.scene);
    assert.equal(art.geometry.ceiling,false,'painted ceiling must not grant a new support');
    assert.equal(art.status,'integrated-candidate');
    assert.equal(art.fidelity,'unverified');
    for(const event of ['mirrorTurn','roomBreath','ritualWake'])assert.equal(stageReferenceEventAllowed(stage,event),false);
    for(const hazard of ['mirrorFracture','ritualSeal','fallingDebris'])assert.equal(stageReferenceHazardAllowed(stage,hazard),false);
    assert.equal(stageBitmapFor({...stage,referencePolicy:{...stage.referencePolicy,sceneId:'other-visit'}}),null,'another visit cannot silently borrow this bitmap');
    assert.throws(()=>stageBitmapFor({...stage,source:'unrelated-edition'}),/identity\/source mismatch/);
    assert.throws(()=>stageBitmapFor({...stage,reference:{...stage.reference,blocked:true}}),/unresolved stage/);
  }
});

test('Wish House retains its second-visit research without activating it in the intact first visit',()=>{
  const stage=getStage('wish_house'),reference=STAGE_REFERENCES.wish_house;
  assert.equal(reference.selectedScene,'sh4-first-visit-scripture-corner');
  assert.equal(reference.animations.length,4,'historical proposals are preserved');
  assert.ok(reference.animations.every(p=>p.activeInSelectedScene===false&&p.sceneScope==='second-passage-apres-incendie'));
  assert.deepEqual(stage.referenceTracks,[]);
  assert.deepEqual(stage.animations,[]);
  for(const key of ['trees','fence','altar','portraits','stairs']){
    assert.ok(!stage.props.includes(key));assert.ok(!stage.layers.includes(key));
  }
  assert.match(stage.reference.locationNote,/premier passage/);
  assert.ok(reference.referenceIds.includes('V31_SH4_WISH_GUIDE_P46'));
});

test('Cedar no longer reports a historical mirror animation as played behind its fixed replacement bitmap',()=>{
  const stage=getStage('cedar_grove'),reference=STAGE_REFERENCES.cedar_grove,id='cedar_grove:reference:2';
  assert.equal(stageBitmapFor(stage).mode,'replace');
  assert.equal(reference.animations.length,4,'all historical research proposals remain available');
  assert.match(reference.animations[1].description,/glissement lumineux proposé/);
  assert.deepEqual(stage.reference.proposals,reference.animations);
  assert.deepEqual(stage.referenceTracks,[]);
  assert.deepEqual(stage.referencePolicy.renderedProposalIds,[]);
  assert.deepEqual(stage.referencePolicy.pendingProposalIds,reference.animations.map((_,i)=>`cedar_grove:reference:${i+1}`));
  const masked=stage.referencePolicy.suppression.find(row=>row.kind==='reference-track'&&row.id===id);
  assert.equal(masked?.key,'treatmentMirrorVeil');assert.equal(masked?.status,'historical-masked-by-bitmap');
  assert.match(masked.reason,/bitmap fixe/);assert.match(masked.reason,/en attente/);
  const html=stageReferenceHTML(stage);
  assert.match(html,/0 éléments visuels de la fiche joués/);assert.doesNotMatch(html,/Prototype visuel partiel/);
  // A stale caller must not repaint or recertify the old procedural element.
  const oldTrack={id,key:'treatmentMirrorVeil',proposalIndex:1,source:'origins',trigger:'ambient',event:null,anchor:{x:.66,y:.4}};
  assert.equal(stageReferenceTrackAllowed(stage,oldTrack),false);
  const noPaint=new Proxy({},{get:()=>()=>assert.fail('the masked mirror must not paint')});
  assert.deepEqual(drawStageReferenceTracks(noPaint,1280,720,{...stage,referenceTracks:[oldTrack]},1000),[]);
});

test('wave31 stage rasters are separate opaque/alpha planes with no invented image animation',async()=>{
  const plan=JSON.parse(await readFile(new URL('../docs/production/vague31/stages/import-plan.json',import.meta.url),'utf8'));
  for(const item of cases){
    const stage=getStage(item.id),art=stageBitmapFor(stage);
    assert.equal(validateStageBitmap(stage,art),art);
    assert.equal(art.layers.length,2);
    assert.deepEqual(stageBitmapFrames(stage).map(f=>f.path),plan.delivered.filter(x=>x.owner===item.id).map(x=>x.path));
    for(const [index,layer] of art.layers.entries()){
      assert.equal(layer.frames.length,1);assert.equal(layer.loop,false);
      const frame=layer.frames[0],png=await readFile(new URL('../'+frame.path,import.meta.url));
      assert.equal(png.readUInt32BE(16),1672);assert.equal(png.readUInt32BE(20),941);
      assert.equal(png[25],index===0?2:6,'RGB background and RGBA foreground');
    }
  }
});
